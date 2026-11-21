import { check, modules, skills } from './content.js'
import { assessmentQuestions, canStartFollowUp, statusLabels } from './assessment.js'

const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const escape = value => String(value).replace(/[&<>"']/g, char => entities[char])

export function form(token, action, body) {
  return `<form method="post" action="${action}">
  <input type="hidden" name="token" value="${token}">${body}</form>`
}

export const button = label => `<button>${label}</button>`
export const link = (url, label) => `<a class="button" href="${url}">${label}</a>`

export function home(progress, token, account) {
  let action = form(token, '/evaluacion/iniciar', '<button class="secondary">Medir mi punto de partida</button>')
  if (progress.followUp?.result) action = '<a href="/historial">Ver mi historial</a>'
  else if (progress.followUp) action = '<a href="/reevaluacion">Retomar mi reevaluación</a>'
  else if (progress.initial?.result) action = '<a href="/resultado">Ver mi resultado</a>'
  else if (progress.initial) action = '<a href="/evaluacion">Retomar mi evaluación</a>'
  return `<h2 class="page-heading">Medir y practicar</h2>
  <p>Descubre qué habilidades has demostrado y qué puedes practicar a continuación.</p>
  <ul><li>${skills.igualdad} con preguntas de selección múltiple.</li>
  <li>${skills.resolucion} escribiendo el valor de x.</li></ul>
  <p class="muted">${account ? 'Tu avance se guarda en tu perfil.' : 'Tu sesión de invitado se guarda en este navegador.'}</p>
  <div class="actions">${link('/estudio/categorias/ecuaciones/pruebas', 'Elegir una prueba')}${action}</div>`
}

function radioOptions(options, name, value, invalid) {
  return Object.entries(options).map(([id, label]) => `<label class="option">
    <input type="radio" name="${name}" value="${id}" ${value === id ? 'checked' : ''} ${invalid}> ${escape(label)}</label>`).join('')
}

export function questionForm(question, token, action, { instanceId = question.id, value = '', reasoningValue, error, canSkip = false, extraFields = '' } = {}) {
  const errorMessage = error ? `<p class="error" id="error-respuesta" role="alert">${escape(error)}</p>` : ''
  const invalid = error ? 'aria-invalid="true" aria-describedby="error-respuesta"' : ''
  const options = question.format === 'choice'
    ? radioOptions(question.options, 'answer', value, invalid)
    : `<label class="number">${escape(question.answerLabel ?? 'x =')} <input name="answer" inputmode="${question.answerLabel ? 'text' : 'decimal'}" autocomplete="off" spellcheck="false"
      value="${escape(value)}" ${invalid}></label>`
  return form(token, action, `${extraFields}<input type="hidden" name="instance" value="${instanceId}">
    <fieldset><legend>${escape(question.prompt)}</legend>${options}</fieldset>
    ${question.reasoning ? `<fieldset><legend>${escape(question.reasoning.prompt)}</legend>
      ${radioOptions(question.reasoning.options, 'reasoning', reasoningValue, invalid)}</fieldset>` : ''}${errorMessage}
    <div class="actions"><button name="intent" value="answer">Enviar respuesta</button>
    ${canSkip ? '<button class="secondary" name="intent" value="skip">No lo sé todavía</button>' : ''}</div>`)
}

export function assessmentQuestion(assessment, question, token, input) {
  const position = assessment.questions.indexOf(question)
  const title = position < 0 ? 'Comprobación adicional' : `Pregunta ${position + 1} de ${assessment.questions.length}`
  return `<p class="muted">${assessment.title} · ${escape(skills[question.skill])}</p><h1>${title}</h1>
  ${questionForm(question, token, `${assessment.path}/responder`, { ...input, canSkip: true })}`
}

const outcomeLabels = { correct: 'Correcta', incorrect: 'Incorrecta', unknown: 'No lo sé todavía' }

export function feedback(question, response) {
  const answer = question.format === 'choice' ? question.options[response.value]
    : question.answerLabel ? response.value : `x = ${response.value}`
  return `<p><strong>${outcomeLabels[response.outcome]}</strong>${response.outcome === 'unknown' ? '' : ` · Tu respuesta fue ${escape(answer)}`}</p>
  ${response.reasoning ? `<p>Resultado ${response.resultCorrect ? 'correcto' : 'incorrecto'} · Justificación ${response.reasonCorrect ? 'correcta' : 'incorrecta'}.</p>
    <p>Elegiste «${escape(question.reasoning.options[response.reasoning])}».</p>` : ''}
  <p>${escape(question.explanation)}</p>`
}

export function evidence(block, ids) {
  return `<ul class="evidence">${ids.map(id => {
    const question = assessmentQuestions.find(item => item.id === id)
    return `<li><p>${escape(question.prompt)}</p>${feedback(question, block.answers[id])}</li>`
  }).join('')}</ul>`
}

export function recommendation(result, primary = true) {
  const { moduleId, reason } = result.recommendation
  const url = `/modulos/${moduleId}`
  const title = modules[moduleId].title
  return `<section><h2>Práctica recomendada</h2><p>${escape(reason)}</p>
  <p>${primary ? link(url, title) : `<a href="${url}">${title}</a>`}</p></section>`
}

export function score(result) {
  return `${result.correct} de ${result.evidence.length} respuestas correctas`
}

export function initialResult(progress, token) {
  const block = progress.initial
  const { skills: results } = block.result
  let next = ''
  if (progress.followUp?.result) next = link('/historial', 'Ver mi historial')
  else if (progress.followUp) next = link('/reevaluacion', 'Retomar mi reevaluación')
  else if (canStartFollowUp(progress)) next = form(token, '/reevaluacion/iniciar', button('Comprobar mi avance'))
  return `<h1>Tu punto de partida</h1>
  ${next}<p><a href="/estudio/categorias/ecuaciones/pruebas">Elegir otra prueba</a></p>
  ${Object.entries(results).map(([id, result]) => {
    const exampleId = result.evidence.find(id => block.answers[id].outcome !== 'correct') ?? result.evidence[0]
    const question = assessmentQuestions.find(item => item.id === exampleId)
    const answer = block.answers[exampleId]
    return `<section class="assessment-skill">
      <div class="skill-heading"><h2>${escape(skills[id])}</h2><strong class="skill-score">
        <span aria-hidden="true">${result.correct}/${result.evidence.length}</span><span class="sr-only">${score(result)}</span></strong></div>
      <p><strong>${statusLabels[result.status]}</strong></p>
      <p class="muted">${escape(question.indicator)} · ${outcomeLabels[answer.outcome]}</p>
      <details><summary>Ver respuestas y explicaciones</summary>${evidence(block, result.evidence)}</details>
    </section>`
  }).join('')}
  ${block.answers[check.id] ? `<details><summary>Ver comprobación adicional</summary>${evidence(block, [check.id])}</details>` : ''}
  ${recommendation(block.result, !next)}`
}

export function message(title, description) {
  return `<h1>${title}</h1><p>${description}</p><p>${link('/', 'Ir al inicio')}</p>`
}
