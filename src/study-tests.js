import { randomInt, randomUUID } from 'node:crypto'
import { grade } from './assessment.js'
import { difficulties, dimensions } from './study-content.js'
import { testQuestion } from './study-diagnostics.js'

export const testTypes = {
  rapida: { title: 'Prueba rápida', minutes: [5, 8], plan: [0, 6, 2],
    dimensions: ['conceptual', 'procedimental'], minimumAnswers: 2, minimumCorrect: 2 },
  completa: { title: 'Prueba completa', minutes: [30, 45], plan: [0, 2, 3, 1, 4, 5, 6, 7],
    dimensions: Object.keys(dimensions), minimumAnswers: 5, minimumCorrect: 6 },
}

export function testConfig(type, version) {
  const current = testTypes[type]
  return type === 'completa' && version === 1
    ? { ...current, plan: [0, 2, 3, 1, 4, 5], minimumAnswers: 4, minimumCorrect: 5 } : current
}

const levels = ['Inicial', 'En desarrollo', 'Funcional', 'Avanzado']
const confidenceLevels = ['baja', 'media', 'alta']
const bands = Object.keys(difficulties)

function snapshot(scope, type, questions, at) {
  return { id: randomUUID(), kind: scope.kind, scopeId: scope.id, type, createdAt: at,
    completedAt: null, version: 2, questions, answers: {}, result: null }
}

export function createStudyAttempt(scope, type, sequence, at = new Date().toISOString()) {
  // shortcut: Los parámetros se reciclan tras 12 pruebas, ampliar el banco para recorridos más largos.
  const parameter = 6 + (sequence % 12) * 2
  const questions = bands.flatMap(difficulty => scope.competencies.flatMap(id =>
    testTypes[type].plan.map((template, index) => testQuestion(id, difficulty, template, parameter + Number(index >= 4), randomInt(3)))))
  return snapshot(scope, type, questions, at)
}

export function createRetentionAttempt(scope, attempts, at) {
  const earlier = attempts.filter(attempt => attempt.type === 'retencion' && attempt.scopeId === scope.id && attempt.completedAt)
  const used = new Set(earlier.flatMap(attempt => attempt.result.retention.items))
  const procedure = earlier.length % 2 ? 2 : 4
  // shortcut: El banco reserva 48 rondas inéditas por competencia, añadir más familias antes de agotarlas.
  for (let parameter = 32; parameter <= 79; parameter++) {
    const questions = [testQuestion(scope.id, 'avanzado', procedure, parameter), testQuestion(scope.id, 'avanzado', 7, parameter, randomInt(3))]
    if (questions.every(question => !used.has(question.id))) return snapshot(scope, 'retencion', questions, at)
  }
  return null
}

export function nextStudyQuestion(attempt) {
  return attempt.questions.find(question => !attempt.answers[question.id])
}

function tally(questions, answers) {
  const outcomes = questions.map(question => answers[question.id].outcome)
  return { total: questions.length, answered: outcomes.filter(outcome => outcome !== 'unknown').length,
    correct: outcomes.filter(outcome => outcome === 'correct').length }
}

function diagnose(type, version, questions, answers) {
  const rule = testConfig(type, version)
  const breakdown = Object.fromEntries(bands.map(difficulty => {
    const items = questions.filter(question => question.difficulty === difficulty)
    const summary = tally(items, answers)
    const coverage = Object.fromEntries(rule.dimensions.map(dimension =>
      [dimension, tally(items.filter(question => question.dimension === dimension), answers)]))
    const justified = items.find(question => question.reasoning)
    const meets = summary.correct >= rule.minimumCorrect && Object.values(coverage).every(stat => stat.correct > 0)
      && (!justified || answers[justified.id].outcome === 'correct')
    return [difficulty, { ...summary, coverage, meets, ...(justified && { justified: answers[justified.id].outcome === 'correct' }) }]
  }))
  const basic = breakdown.basico
  const sufficient = basic.answered >= rule.minimumAnswers && Object.values(basic.coverage).every(stat => stat.answered > 0)
  const firstGap = bands.findIndex(difficulty => !breakdown[difficulty].meets)
  const consecutive = firstGap < 0 ? bands.length : firstGap
  const level = sufficient ? Math.min(consecutive, type === 'rapida' ? 2 : 3) : null
  const totals = tally(questions, answers)
  const inconsistent = firstGap !== -1 && bands.slice(firstGap + 1).some(difficulty => breakdown[difficulty].meets)
  const confidence = type === 'rapida' || !sufficient ? 0 : totals.answered >= rule.plan.length * 3 - 3 && !inconsistent ? 2 : 1
  const autonomous = type === 'completa' && version >= 2 ? questions.filter(question => question.difficulty === 'avanzado')
    .map(question => ({ id: question.id, dimension: question.dimension, correct: answers[question.id].outcome === 'correct' })) : null
  return { level, confidence, totals, breakdown, recommendedDifficulty: bands[firstGap] ?? 'avanzado',
    ...(autonomous && { autonomous }) }
}

export function submitStudyAnswer(attempt, instance, value, unknown, reasoningValue, date = new Date().toISOString()) {
  if (Object.hasOwn(attempt.answers, instance) || attempt.completedAt) return {}
  const question = nextStudyQuestion(attempt)
  if (question?.id !== instance) return { conflict: true }
  const answer = grade(question, value, unknown)
  if (answer.error) return { question, error: answer.error }
  if (question.reasoning && !unknown) {
    const reasoning = grade(question.reasoning, reasoningValue)
    if (reasoning.error) return { question, error: 'Elige el procedimiento que justifica tu respuesta.' }
    answer.resultCorrect = answer.outcome === 'correct'
    answer.reasoning = reasoning.value
    answer.reasonCorrect = reasoning.outcome === 'correct'
    if (!answer.reasonCorrect) answer.outcome = 'incorrect'
  }
  attempt.answers[instance] = { ...answer, date }
  if (nextStudyQuestion(attempt)) return { changed: true }

  attempt.completedAt = date
  if (attempt.type === 'retencion') {
    const totals = tally(attempt.questions, attempt.answers)
    attempt.result = { version: 2, retention: { ...totals, passed: totals.correct === totals.total,
      items: attempt.questions.map(question => question.id) } }
    return { changed: true }
  }
  const ids = new Set(attempt.questions.map(item => item.competencyId))
  const evidence = Object.fromEntries(Array.from(ids, id =>
    [id, diagnose(attempt.type, attempt.version, attempt.questions.filter(item => item.competencyId === id), attempt.answers)]))
  attempt.result = { version: attempt.version, competencies: evidence }
  return { changed: true }
}

export function competencyLevels(attempts) {
  const current = {}
  for (const attempt of attempts) {
    if (!attempt.result?.competencies) continue
    for (const [id, result] of Object.entries(attempt.result.competencies)) {
      const previous = current[id]
      const weight = result.level === null ? 0 : attempt.type === 'completa' ? 2 : 1
      if (!previous || weight > previous.weight) {
        current[id] = { ...result, weight, attemptId: attempt.id, type: attempt.type }
      }
    }
  }
  return current
}

export function scopeLevel(scope, current) {
  if (scope.kind === 'competencias') return current[scope.id]
  const results = scope.competencies.map(id => current[id])
  const observed = results.filter(result => result && result.level !== null)
  if (!results.some(Boolean)) return undefined
  if (observed.length !== results.length) return { level: null, observed: observed.length, required: results.length }
  return { level: Math.min(...observed.map(result => result.level)), confidence: Math.min(...observed.map(result => result.confidence)) }
}

export function levelLabel(result) {
  if (!result) return 'Sin evaluar'
  if (result.level === null) return result.observed ? 'Cobertura parcial' : 'Evidencia insuficiente'
  return levels[result.level]
}

export const confidenceLabel = result => confidenceLevels[result.confidence]
