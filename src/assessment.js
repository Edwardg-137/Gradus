import { check, followUp, initial, skills } from './content.js'

export const assessments = {
  initial: { title: 'Evaluación inicial', path: '/evaluacion', resultPath: '/resultado', questions: initial, check },
  followUp: { title: 'Reevaluación', path: '/reevaluacion', resultPath: '/historial', questions: followUp },
}

export const assessmentQuestions = [...initial, check, ...followUp]

export const statusLabels = {
  demonstrated: 'Demostrada en esta evaluación',
  developing: 'En desarrollo',
  insufficient: 'Evidencia insuficiente',
}

export function grade(question, submitted, unknown = false) {
  if (unknown) return { value: null, outcome: 'unknown' }
  const value = submitted?.trim() ?? ''
  if (question.format === 'choice') {
    if (!Object.hasOwn(question.options, value)) return { error: 'Elige una opción para continuar.' }
    return { value, outcome: value === question.key ? 'correct' : 'incorrect' }
  }

  if (!/^[+-]?[0-9]+(?:[.,][0-9]+)?$/.test(value)) {
    return { error: 'Escribe un número. Si usas punto o coma decimal, pon dígitos a ambos lados.' }
  }
  const [integer, decimals = ''] = value.split(/[.,]/)
  const correct = BigInt(integer) === BigInt(question.key) && !/[1-9]/.test(decimals)
  return { value, outcome: correct ? 'correct' : 'incorrect' }
}

export function newBlock() {
  return { answers: {}, result: null }
}

function changedOneSide(block, assessment) {
  return assessment.questions.filter(question => question.skill === 'igualdad' && block.answers[question.id]?.value === 'izquierda')
}

export function nextQuestion(block, assessment) {
  const next = assessment.questions.find(question => !block.answers[question.id])
  if (next) return next
  if (assessment.check && changedOneSide(block, assessment).length && !block.answers[assessment.check.id]) return assessment.check
  return null
}

function recommend(block, assessment, { igualdad: equality, resolucion: solving }) {
  if (equality.status !== 'demonstrated') {
    let reason = equality.status === 'insufficient'
      ? 'Quedó una respuesta pendiente sobre cómo conservar la igualdad.'
      : 'Repasa qué operación inversa conserva la igualdad al aplicarla a ambos lados.'
    const oneSide = changedOneSide(block, assessment)
    if (oneSide.length) {
      const observations = oneSide.map(question => `Elegiste ${question.options.izquierda.toLowerCase()}.`).join(' ')
      const context = {
        ambos: 'Identificaste la transformación en la comprobación. Practica aplicarla también al despejar.',
        izquierda: 'En la comprobación dejaste el lado derecho en 9. Al restar 3 también a ese lado, queda x = 6.',
        inversa: 'En la comprobación elegiste x = 12. Revisa la resta del lado derecho, 9 − 3 = 6.',
      }
      reason = `${observations} ${context[block.answers[assessment.check?.id]?.value] ?? reason}`
    }
    return { moduleId: 'mantener-igualdad', reason }
  }
  if (solving.status !== 'demonstrated') {
    return {
      moduleId: 'despejar-incognita',
      reason: solving.status === 'insufficient'
        ? 'Ya elegiste las operaciones que conservan la igualdad. Quedó una resolución pendiente.'
        : 'Ya elegiste las operaciones que conservan la igualdad. Practica cómo calcular el valor de x.',
    }
  }
  return { moduleId: 'cantidad-desconocida', reason: 'Demostraste las dos habilidades. Úsalas para resolver una situación cotidiana.' }
}

export function recordAnswer(block, assessment, question, submitted, unknown) {
  const response = grade(question, submitted, unknown)
  if (response.error) return response

  const date = new Date().toISOString()
  block.answers[question.id] = { instanceId: question.id, version: question.version, date, ...response }
  if (nextQuestion(block, assessment)) return response

  const results = {}
  for (const skill of Object.keys(skills)) {
    const evidence = assessment.questions.filter(item => item.skill === skill).map(item => item.id)
    const answers = evidence.map(id => block.answers[id])
    const correct = answers.filter(answer => answer.outcome === 'correct').length
    const status = answers.some(answer => answer.outcome === 'unknown')
      ? 'insufficient'
      : correct === evidence.length ? 'demonstrated' : 'developing'
    results[skill] = { evidence, correct, status }
  }

  block.result = { date, skills: results, recommendation: recommend(block, assessment, results) }
  return response
}

export function canStartFollowUp(progress) {
  const result = progress.initial?.result
  if (!result) return false
  return progress.practice?.[result.recommendation.moduleId]?.rounds.some(round => round.completedAt >= result.date) ?? false
}

export function progressBadge(progress) {
  const before = progress.initial.result
  const after = progress.followUp.result
  const evidence = Object.keys(skills).filter(id =>
    before.skills[id].status === 'developing' && after.skills[id].status === 'demonstrated')
    .map(id => ({ skill: id, initial: before.skills[id].evidence, followUp: after.skills[id].evidence }))
  return evidence.length ? { topicId: progress.topicId, date: after.date, evidence } : null
}
