import { randomInt, randomUUID } from 'node:crypto'
import { grade } from './assessment.js'
import { difficulties, dimensions, studyQuestion } from './study-content.js'

export const testTypes = {
  rapida: { title: 'Prueba rápida', minutes: [5, 8], plan: [0, 1, 2],
    dimensions: ['conceptual', 'procedimental'], minimumAnswers: 2, minimumCorrect: 2 },
  completa: { title: 'Prueba completa', minutes: [25, 35], plan: [0, 2, 3, 1, 4, 5],
    dimensions: Object.keys(dimensions), minimumAnswers: 4, minimumCorrect: 5 },
}

const levels = ['Inicial', 'En desarrollo', 'Funcional', 'Avanzado']
const confidenceLevels = ['baja', 'media', 'alta']
const bands = Object.keys(difficulties)

export function createStudyAttempt(scope, type, sequence) {
  // shortcut: Los parámetros se reciclan tras 12 pruebas, ampliar el banco para recorridos más largos.
  const parameter = 6 + (sequence % 12) * 2
  const questions = bands.flatMap(difficulty => scope.competencies.flatMap(id =>
    testTypes[type].plan.map((template, index) => studyQuestion(id, difficulty, template, parameter + Number(index >= 4), randomInt(3)))))
  return { id: randomUUID(), kind: scope.kind, scopeId: scope.id, type, createdAt: new Date().toISOString(),
    completedAt: null, version: 1, questions, answers: {}, result: null }
}

export function nextStudyQuestion(attempt) {
  return attempt.questions.find(question => !attempt.answers[question.id])
}

function tally(questions, answers) {
  const outcomes = questions.map(question => answers[question.id].outcome)
  return { total: questions.length, answered: outcomes.filter(outcome => outcome !== 'unknown').length,
    correct: outcomes.filter(outcome => outcome === 'correct').length }
}

function diagnose(type, questions, answers) {
  const rule = testTypes[type]
  const breakdown = Object.fromEntries(bands.map(difficulty => {
    const items = questions.filter(question => question.difficulty === difficulty)
    const summary = tally(items, answers)
    const coverage = Object.fromEntries(rule.dimensions.map(dimension =>
      [dimension, tally(items.filter(question => question.dimension === dimension), answers)]))
    const meets = summary.correct >= rule.minimumCorrect && Object.values(coverage).every(stat => stat.correct > 0)
    return [difficulty, { ...summary, coverage, meets }]
  }))
  const basic = breakdown.basico
  const sufficient = basic.answered >= rule.minimumAnswers && Object.values(basic.coverage).every(stat => stat.answered > 0)
  const firstGap = bands.findIndex(difficulty => !breakdown[difficulty].meets)
  const consecutive = firstGap < 0 ? bands.length : firstGap
  const level = sufficient ? Math.min(consecutive, type === 'rapida' ? 2 : 3) : null
  const totals = tally(questions, answers)
  const inconsistent = firstGap !== -1 && bands.slice(firstGap + 1).some(difficulty => breakdown[difficulty].meets)
  const confidence = type === 'rapida' || !sufficient ? 0 : totals.answered >= 15 && !inconsistent ? 2 : 1
  return { level, confidence, totals, breakdown, recommendedDifficulty: bands[firstGap] ?? 'avanzado' }
}

export function submitStudyAnswer(attempt, instance, value, unknown) {
  if (Object.hasOwn(attempt.answers, instance) || attempt.completedAt) return {}
  const question = nextStudyQuestion(attempt)
  if (question?.id !== instance) return { conflict: true }
  const answer = grade(question, value, unknown)
  if (answer.error) return { question, error: answer.error }
  const date = new Date().toISOString()
  attempt.answers[instance] = { ...answer, date }
  if (nextStudyQuestion(attempt)) return { changed: true }

  const ids = new Set(attempt.questions.map(item => item.competencyId))
  const evidence = Object.fromEntries(Array.from(ids, id =>
    [id, diagnose(attempt.type, attempt.questions.filter(item => item.competencyId === id), attempt.answers)]))
  attempt.result = { version: 1, competencies: evidence }
  attempt.completedAt = date
  return { changed: true }
}

export function competencyLevels(attempts) {
  const current = {}
  for (const attempt of attempts) {
    if (!attempt.result) continue
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
