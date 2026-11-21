import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { topic } from './content.js'

export function openStore(filename) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true })
  const db = new DatabaseSync(filename)
  db.exec(`
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, progress TEXT NOT NULL);
  `)
  const select = db.prepare('SELECT progress FROM sessions WHERE id = ?')
  const write = db.prepare(`
    INSERT INTO sessions (id, progress) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET progress = excluded.progress
  `)

  function read(id) {
    const row = select.get(id)
    return row ? JSON.parse(row.progress) : { topicId: topic.id, initial: null }
  }

  return {
    read,
    update(id, action) {
      db.exec('BEGIN IMMEDIATE')
      try {
        const progress = read(id)
        const before = JSON.stringify(progress)
        const result = action(progress)
        const after = JSON.stringify(progress)
        if (after !== before) write.run(id, after)
        db.exec('COMMIT')
        return result
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },
    close: () => db.close(),
  }
}
