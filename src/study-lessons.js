import { randomUUID } from 'node:crypto'
import { grade } from './assessment.js'
import { nexoraLessons } from './nexora-content.js'
import { studyQuestion } from './study-content.js'

export const lessonModes = {
  rapida: { title: 'Lección rápida', description: 'Idea principal, ejemplo y dos actividades por competencia.' },
  completa: { title: 'Lección completa', description: 'Explicación, ejemplo y cuatro actividades por competencia, con práctica de detección de errores.' },
}

export const lessonKey = (scope, difficulty, mode) => `${scope.kind}:${scope.id}:${difficulty}:${mode}`

function sourceQuestion(id, difficulty, material) {
  const [prompt, key, distractors, explanation] = material.activity
  const base = { id: `${id}-${difficulty}-nexora`, prompt, explanation, competencyId: id }
  if (typeof key === 'number') return { ...base, format: 'number', key, answerLabel: 'Respuesta' }
  return { ...base, format: 'choice', key: 'b', options: { a: distractors[0], b: key, c: distractors[1], d: distractors[2] } }
}

function buildLesson(scope, difficulty, mode) {
  const steps = scope.competencies.flatMap(id => {
    const material = nexoraLessons[id][difficulty]
    const intro = { competencyId: id, concept: material.concept, example: material.example, source: material.source }
    const templates = mode === 'rapida' ? [2] : [1, 2, 3]
    const activities = [sourceQuestion(id, difficulty, material), ...templates.map(index => studyQuestion(id, difficulty, index, index + 2))]
    return [{ kind: 'intro', ...intro }, ...activities.map(question => ({ kind: 'exercise', ...intro, hint: material.hint, question }))]
  })
  return { id: randomUUID(), step: 0, steps, completedAt: null }
}

export function advanceLesson(progress, scope, difficulty, mode, data) {
  const key = lessonKey(scope, difficulty, mode)
  const round = progress.studyLessons?.[key]
  const intent = data.get('intent')
  if (intent === 'start' && (!round || round.completedAt) && (data.get('round') ?? '') === (round?.id ?? '')) {
    (progress.studyLessons ??= {})[key] = buildLesson(scope, difficulty, mode)
    return {}
  }
  if (!round || round.completedAt || data.get('round') !== round.id || data.get('step') !== String(round.step)) return {}
  const activity = round.steps[round.step]
  if (intent === 'next' && (activity.kind === 'intro' || activity.answer)) {
    round.step++
    if (round.step === round.steps.length) round.completedAt = new Date().toISOString()
  } else if (activity.kind === 'exercise' && !activity.answer) {
    if (data.get('instance') !== activity.question.id) return { error: 'Vuelve a abrir la lección para recuperar la actividad.', round }
    if (intent === 'hint') activity.help = true
    if (intent === 'answer' || intent === 'skip' || intent === 'reveal') {
      const value = data.get('answer') ?? ''
      const answer = grade(activity.question, value, intent !== 'answer')
      if (answer.error) return { error: answer.error, value, round }
      if (intent === 'reveal') activity.help = true
      activity.answer = { ...answer, revealed: intent === 'reveal', date: new Date().toISOString() }
    }
  }
  return {}
}
