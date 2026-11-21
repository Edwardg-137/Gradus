import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import { topic } from './content.js'

export const accountOwner = accountId => `account:${accountId}`
export const sessionMaxAge = 30 * 24 * 60 * 60

export function openStore(filename) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true })
  const db = new DatabaseSync(filename)
  db.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, progress TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, passwordHash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY, accountId TEXT NOT NULL REFERENCES accounts(id), expiresAt INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS study_attempts (
      id TEXT PRIMARY KEY, accountId TEXT NOT NULL REFERENCES accounts(id),
      kind TEXT NOT NULL, scopeId TEXT NOT NULL, type TEXT NOT NULL, createdAt TEXT NOT NULL, completedAt TEXT,
      responses TEXT NOT NULL, result TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS study_attempt_in_progress ON study_attempts (accountId, kind, scopeId, type)
      WHERE completedAt IS NULL;
    CREATE INDEX IF NOT EXISTS study_attempt_account ON study_attempts (accountId);
  `)
  const select = db.prepare('SELECT progress FROM sessions WHERE id = ?')
  const write = db.prepare(`
    INSERT INTO sessions (id, progress) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET progress = excluded.progress
  `)
  const removeProgress = db.prepare('DELETE FROM sessions WHERE id = ?')
  const insertAccount = db.prepare('INSERT OR IGNORE INTO accounts (id, email, salt, passwordHash) VALUES (?, ?, ?, ?)')
  const selectAccount = db.prepare('SELECT id, email, salt, passwordHash FROM accounts WHERE email = ?')
  const insertSession = db.prepare('INSERT INTO auth_sessions (id, accountId, expiresAt) VALUES (?, ?, ?)')
  const activeAccount = db.prepare(`SELECT accounts.id, accounts.email FROM auth_sessions
    JOIN accounts ON accounts.id = auth_sessions.accountId WHERE auth_sessions.id = ? AND expiresAt > ?`)
  const revoke = db.prepare('DELETE FROM auth_sessions WHERE id = ?')
  const clearExpired = db.prepare('DELETE FROM auth_sessions WHERE expiresAt <= ?')
  const findAttempt = db.prepare(`SELECT id, kind, scopeId, type, createdAt, completedAt, responses, result
    FROM study_attempts WHERE accountId = ? AND id = ?`)
  const attemptsFor = db.prepare(`SELECT id, kind, scopeId, type, createdAt, completedAt, result
    FROM study_attempts WHERE accountId = ? ORDER BY COALESCE(completedAt, createdAt) DESC, rowid DESC`)
  const latestAttempt = db.prepare(`SELECT id, completedAt FROM study_attempts
    WHERE accountId = ? AND kind = ? AND scopeId = ? AND type = ? ORDER BY rowid DESC LIMIT 1`)
  const countAttempts = db.prepare('SELECT count(*) AS count FROM study_attempts WHERE accountId = ?')
  const insertAttempt = db.prepare(`INSERT INTO study_attempts (id, accountId, kind, scopeId, type, createdAt, responses)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
  const saveAttempt = db.prepare(`UPDATE study_attempts SET completedAt = ?, responses = ?, result = ?
    WHERE accountId = ? AND id = ?`)

  function transact(action) {
    db.exec('BEGIN IMMEDIATE')
    try {
      const result = action()
      db.exec('COMMIT')
      return result
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }

  function read(id) {
    const row = select.get(id)
    return row ? JSON.parse(row.progress) : { topicId: topic.id, initial: null }
  }

  function authorize(id, accountId) {
    const now = Date.now()
    clearExpired.run(now)
    insertSession.run(id, accountId, now + sessionMaxAge * 1000)
  }

  function readAttempt(accountId, id) {
    const row = findAttempt.get(accountId, id)
    if (!row) return null
    const { responses, result, ...details } = row
    return { ...details, ...JSON.parse(responses), result: result && JSON.parse(result) }
  }

  const attemptResponses = ({ version, questions, answers }) => JSON.stringify({ version, questions, answers })

  return {
    read,
    update(id, action) {
      return transact(() => {
        const progress = read(id)
        const before = JSON.stringify(progress)
        const result = action(progress)
        const after = JSON.stringify(progress)
        if (after !== before) write.run(id, after)
        return result
      })
    },
    accountForSession: id => activeAccount.get(id, Date.now()),
    findAccount: email => selectAccount.get(email),
    register(email, salt, passwordHash, guest, login) {
      return transact(() => {
        const id = randomUUID()
        if (!insertAccount.run(id, email, salt, passwordHash).changes) return false
        const prior = select.get(guest)
        if (prior) {
          write.run(accountOwner(id), prior.progress)
          removeProgress.run(guest)
        }
        authorize(login, id)
        return true
      })
    },
    authorize: (id, accountId) => transact(() => authorize(id, accountId)),
    revoke: id => revoke.run(id),
    readAttempt,
    studyAttempts: accountId => attemptsFor.all(accountId).map(row => ({ ...row, result: row.result && JSON.parse(row.result) })),
    beginAttempt(accountId, scope, type, previous, create) {
      return transact(() => {
        const latest = latestAttempt.get(accountId, scope.kind, scope.id, type)
        if (latest && (!latest.completedAt || latest.id !== previous)) return latest.id
        if (!latest && previous) return null
        const attempt = create(scope, type, countAttempts.get(accountId).count)
        insertAttempt.run(attempt.id, accountId, scope.kind, scope.id, type, attempt.createdAt, attemptResponses(attempt))
        return attempt.id
      })
    },
    updateAttempt(accountId, id, respond) {
      return transact(() => {
        const attempt = readAttempt(accountId, id)
        if (!attempt) return null
        const submitted = respond(attempt)
        if (submitted.changed) {
          saveAttempt.run(attempt.completedAt, attemptResponses(attempt), attempt.result ? JSON.stringify(attempt.result) : null, accountId, id)
        }
        return { ...submitted, attempt }
      })
    },
    close: () => db.close(),
  }
}
