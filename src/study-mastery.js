// Política adaptada de packages/cognitive-twin/src/learning.ts en Nexora (5e745fc).
const day = 86_400_000
const afterDays = (at, days) => new Date(Date.parse(at) + days * day).toISOString()

function applyComplete(state, evidence, level, at) {
  const fresh = evidence.filter(item => !state.seen.has(item.id))
  if (!fresh.length) return
  for (const item of fresh) {
    state.seen.add(item.id)
    state.recent = [...state.recent, item].slice(-4)
  }
  const recent = state.recent.slice(-3)
  if (recent.length === 3 && recent.filter(item => !item.correct).length >= 2) {
    state.preparedAt = state.nextCheckAt = state.retainedAt = null
    state.checks = 0
    state.interval = 1
  }
  const correct = state.recent.filter(item => item.correct)
  if (state.preparedAt || level !== 3 || correct.length < 3 || new Set(correct.map(item => item.dimension)).size < 2) return
  state.preparedAt = at
  state.nextCheckAt = afterDays(at, 1)
}

function applyRetention(state, attempt) {
  const result = attempt.result.retention
  if (!state?.nextCheckAt || attempt.createdAt < state.nextCheckAt || attempt.completedAt < attempt.createdAt) return
  if (!result.passed) {
    state.checks = 0
    state.retainedAt = null
    state.interval = 1
    state.nextCheckAt = afterDays(attempt.completedAt, 1)
    if (result.correct === 0) {
      state.preparedAt = state.nextCheckAt = null
      state.recent = []
    }
    return
  }
  state.checks++
  state.interval = state.checks === 1 ? 3 : Math.min(30, state.interval * 2)
  state.nextCheckAt = afterDays(attempt.completedAt, state.interval)
  if (state.checks >= 2) state.retainedAt = attempt.completedAt
}

export function masteryProfiles(attempts) {
  const profiles = {}
  for (const attempt of [...attempts].reverse()) {
    if (!attempt.completedAt || !attempt.result) continue
    if (attempt.type === 'completa') {
      for (const [id, result] of Object.entries(attempt.result.competencies)) {
        if (!result.autonomous) continue
        const state = profiles[id] ??= { recent: [], seen: new Set(), checks: 0, interval: 1,
          preparedAt: null, retainedAt: null, nextCheckAt: null }
        applyComplete(state, result.autonomous, result.level, attempt.completedAt)
      }
    }
    if (attempt.type === 'retencion') applyRetention(profiles[attempt.scopeId], attempt)
  }
  return profiles
}

export function masteryStatus(state, at) {
  if (!state) return 'Pendiente de evidencia autónoma'
  if (!state.preparedAt) return 'En práctica'
  if (state.nextCheckAt <= at) return 'Toca comprobar'
  return state.retainedAt ? 'Dominio firme' : 'En consolidación'
}

export function scopeMastery(scope, profiles, at) {
  const states = scope.competencies.map(id => masteryStatus(profiles[id], at))
  const firm = states.filter(state => state === 'Dominio firme').length
  if (scope.kind === 'competencias') return { label: states[0], firm }
  const label = firm === states.length ? 'Dominio firme'
    : states.includes('Toca comprobar') ? 'Toca comprobar'
      : firm || states.includes('En consolidación') ? 'En consolidación'
        : states.includes('En práctica') ? 'En práctica' : 'Pendiente de evidencia autónoma'
  return { label, firm }
}
