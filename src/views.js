import { check, initial, modules, skills, topic } from './content.js'
import { statusLabels } from './assessment.js'

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
  <header><nav aria-label="Principal"><a class="brand" href="/">Gradus</a></nav></header>
  <main id="contenido">${body}</main>
</body>
</html>`
}

export function form(token, action, body) {
  return `<form method="post" action="${action}">
  <input type="hidden" name="token" value="${token}">${body}</form>`
}

export const button = label => `<button>${label}</button>`
export const link = (url, label) => `<a class="button" href="${url}">${label}</a>`

export function home(progress, token) {
  const action = progress.initial?.result ? link('/resultado', 'Ver mi resultado')
    : progress.initial ? link('/evaluacion', 'Retomar mi evaluación')
      : form(token, '/evaluacion/iniciar', button('Medir mi punto de partida'))
  return `<p class="muted">${topic.area} / ${topic.domain}</p>
  <h1>${topic.title}</h1>
  <p>Descubre qué habilidades has demostrado y qué puedes practicar a continuación.</p>
  <ul><li>${skills.igualdad} con preguntas de selección múltiple.</li>
  <li>${skills.resolucion} escribiendo el valor de x.</li></ul>
  <p>Tu sesión de invitado se guarda en este navegador.</p>${action}`
}

export function questionForm(question, token, action, { instanceId = question.id, value = '', error, canSkip = false } = {}) {
  const errorMessage = error ? `<p class="error" id="error-respuesta" role="alert">${escape(error)}</p>` : ''
  const invalid = error ? 'aria-invalid="true" aria-describedby="error-respuesta"' : ''
  const options = question.format === 'choice'
    ? Object.entries(question.options).map(([id, label]) => `<label class="option">
      <input type="radio" name="answer" value="${id}" ${value === id ? 'checked' : ''} ${invalid}> ${escape(label)}</label>`).join('')
    : `<label class="number">x = <input name="answer" inputmode="decimal" autocomplete="off" spellcheck="false"
      value="${escape(value)}" ${invalid}></label>`
  return form(token, action, `<input type="hidden" name="instance" value="${instanceId}">
    <fieldset><legend>${escape(question.prompt)}</legend>${options}${errorMessage}</fieldset>
    <div class="actions"><button name="intent" value="answer">Enviar respuesta</button>
    ${canSkip ? '<button class="secondary" name="intent" value="skip">No lo sé todavía</button>' : ''}</div>`)
}

export function assessmentQuestion(question, token, input) {
  const position = initial.indexOf(question)
  const title = position < 0 ? 'Comprobación adicional' : `Pregunta ${position + 1} de ${initial.length}`
  return `<p class="muted">Evaluación inicial · ${escape(skills[question.skill])}</p><h1>${title}</h1>
  ${questionForm(question, token, '/evaluacion/responder', { ...input, canSkip: true })}`
}

const outcomeLabels = { correct: 'Correcta', incorrect: 'Incorrecta', unknown: 'No lo sé todavía' }

export function feedback(question, response) {
  const answer = question.format === 'choice' ? question.options[response.value] : `x = ${response.value}`
  return `<p><strong>${outcomeLabels[response.outcome]}</strong>${response.outcome === 'unknown' ? '' : ` · Tu respuesta fue ${escape(answer)}`}</p>
  <p>${escape(question.explanation)}</p>`
}

export function evidence(block, ids) {
  return `<ul class="evidence">${ids.map(id => {
    const question = [...initial, check].find(item => item.id === id)
    return `<li><p>${escape(question.prompt)}</p>${feedback(question, block.answers[id])}</li>`
  }).join('')}</ul>`
}

export function recommendation(result) {
  const { moduleId, reason } = result.recommendation
  return `<section><h2>Práctica recomendada</h2><p>${escape(reason)}</p>
  <p>${link(`/modulos/${moduleId}`, modules[moduleId].title)}</p></section>`
}

export function score(result) {
  return `${result.correct} de ${result.evidence.length} respuestas correctas`
}

export function initialResult(block) {
  const { skills: results } = block.result
  return `<h1>Tu punto de partida</h1>
  ${Object.entries(results).map(([id, result]) => `<section>
    <h2>${escape(skills[id])}</h2><p><strong>${statusLabels[result.status]}</strong> · ${score(result)}</p>
    <details><summary>Ver respuestas y explicaciones</summary>${evidence(block, result.evidence)}</details>
  </section>`).join('')}
  ${block.answers[check.id] ? `<details><summary>Ver comprobación adicional</summary>${evidence(block, [check.id])}</details>` : ''}
  ${recommendation(block.result)}`
}

export function message(title, description) {
  return `<h1>${title}</h1><p>${description}</p><p>${link('/', 'Ir al inicio')}</p>`
}
