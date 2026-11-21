import { check, initial } from './content.js'

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

function changedOneSide(block) {
  return initial.filter(question => question.skill === 'igualdad' && block.answers[question.id]?.value === 'izquierda')
}

export function nextQuestion(block) {
  const next = initial.find(question => !block.answers[question.id])
  if (next) return next
  if (changedOneSide(block).length && !block.answers[check.id]) return check
  return null
}

function recommend(block, equality, solving) {
  if (equality.status !== 'demonstrated') {
    let reason = equality.status === 'insufficient'
      ? 'Quedó una respuesta pendiente sobre cómo conservar la igualdad.'
      : 'Repasa qué operación inversa conserva la igualdad al aplicarla a ambos lados.'
    const oneSide = changedOneSide(block)
    if (oneSide.length) {
      const operations = { 'i-aditiva': 'restar 4', 'i-multiplicativa': 'dividir entre 3' }
      const observations = oneSide.map(question => `Elegiste ${operations[question.id]} solo en el lado izquierdo.`).join(' ')
      const context = {
        ambos: 'Identificaste la transformación en la comprobación. Practica aplicarla también al despejar.',
        izquierda: 'En la comprobación dejaste el lado derecho en 9. Al restar 3 también a ese lado, queda x = 6.',
        inversa: 'En la comprobación elegiste x = 12. Revisa la resta del lado derecho, 9 − 3 = 6.',
      }
      reason = `${observations} ${context[block.answers[check.id]?.value] ?? reason}`
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

export function recordAnswer(block, question, submitted, unknown) {
  const response = grade(question, submitted, unknown)
  if (response.error) return response

  const date = new Date().toISOString()
  block.answers[question.id] = { instanceId: question.id, version: question.version, date, ...response }
  if (nextQuestion(block)) return response

  const results = {}
  for (const skill of ['igualdad', 'resolucion']) {
    const evidence = initial.filter(item => item.skill === skill).map(item => item.id)
    const answers = evidence.map(id => block.answers[id])
    const correct = answers.filter(answer => answer.outcome === 'correct').length
    const status = answers.some(answer => answer.outcome === 'unknown')
      ? 'insufficient'
      : correct === evidence.length ? 'demonstrated' : 'developing'
    results[skill] = { evidence, correct, status }
  }

  block.result = { date, skills: results, recommendation: recommend(block, results.igualdad, results.resolucion) }
  return response
}
