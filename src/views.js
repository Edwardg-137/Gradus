import { check, modules, skills, topic } from './content.js'
import { assessmentQuestions, canStartFollowUp, statusLabels } from './assessment.js'

const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const escape = value => String(value).replace(/[&<>"']/g, char => entities[char])

export function layout(title, body) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <title>${escape(title)} · Gradus</title>
  <link rel="stylesheet" href="/estilos.css">
</head>
<body>
  <a class="skip" href="#contenido">Ir al contenido</a>
  <header><nav aria-label="Principal"><a class="brand" href="/">Gradus</a>
    <a href="/estudio">Estudio</a><a href="/catalogo">Catálogo</a><a href="/historial">Mi historial</a><a href="/perfil">Mi perfil</a></nav></header>
  <main id="contenido" tabindex="-1">${body}</main>
</body>
</html>`
}

export function form(token, action, body) {
  return `<form method="post" action="${action}">
  <input type="hidden" name="token" value="${token}">${body}</form>`
}

export const button = label => `<button>${label}</button>`
export const link = (url, label) => `<a class="button" href="${url}">${label}</a>`

export function home(progress, token, account) {
  let action = form(token, '/evaluacion/iniciar', button('Medir mi punto de partida'))
  if (progress.followUp?.result) action = link('/historial', 'Ver mi historial')
  else if (progress.followUp) action = link('/reevaluacion', 'Retomar mi reevaluación')
  else if (progress.initial?.result) action = link('/resultado', 'Ver mi resultado')
  else if (progress.initial) action = link('/evaluacion', 'Retomar mi evaluación')
  return `<p class="muted">${topic.area} / ${topic.domain}</p>
  <h1>${topic.title}</h1>
  <p>Descubre qué habilidades has demostrado y qué puedes practicar a continuación.</p>
  <ul><li>${skills.igualdad} con preguntas de selección múltiple.</li>
  <li>${skills.resolucion} escribiendo el valor de x.</li></ul>
  <p>${account ? 'Tu avance se guarda en tu perfil.' : 'Tu sesión de invitado se guarda en este navegador.'}</p>${action}`
}

export function questionForm(question, token, action, { instanceId = question.id, value = '', error, canSkip = false } = {}) {
  const errorMessage = error ? `<p class="error" id="error-respuesta" role="alert">${escape(error)}</p>` : ''
  const invalid = error ? 'aria-invalid="true" aria-describedby="error-respuesta"' : ''
  const options = question.format === 'choice'
    ? Object.entries(question.options).map(([id, label]) => `<label class="option">
      <input type="radio" name="answer" value="${id}" ${value === id ? 'checked' : ''} ${invalid}> ${escape(label)}</label>`).join('')
    : `<label class="number">${escape(question.answerLabel ?? 'x =')} <input name="answer" inputmode="${question.answerLabel ? 'text' : 'decimal'}" autocomplete="off" spellcheck="false"
      value="${escape(value)}" ${invalid}></label>`
  return form(token, action, `<input type="hidden" name="instance" value="${instanceId}">
    <fieldset><legend>${escape(question.prompt)}</legend>${options}${errorMessage}</fieldset>
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
  ${next}
  ${Object.entries(results).map(([id, result]) => {
    const exampleId = result.evidence.find(id => block.answers[id].outcome !== 'correct') ?? result.evidence[0]
    const question = assessmentQuestions.find(item => item.id === exampleId)
    const answer = block.answers[exampleId]
    return `<section>
      <h2>${escape(skills[id])}</h2><p><strong>${statusLabels[result.status]}</strong> · ${score(result)}</p>
      <p>${escape(question.indicator)} · ${outcomeLabels[answer.outcome]}</p>
      <details><summary>Ver respuestas y explicaciones</summary>${evidence(block, result.evidence)}</details>
    </section>`
  }).join('')}
  ${block.answers[check.id] ? `<details><summary>Ver comprobación adicional</summary>${evidence(block, [check.id])}</details>` : ''}
  ${recommendation(block.result, !next)}`
}

export function message(title, description) {
  return `<h1>${title}</h1><p>${description}</p><p>${link('/', 'Ir al inicio')}</p>`
}
