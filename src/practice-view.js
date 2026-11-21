import { modules, skills } from './content.js'
import { currentRound, offersVariants, pendingExercise, practiceQuestion, variantPool } from './practice.js'
import { button, escape, feedback, form, link, questionForm } from './views.js'

export function practicePage(moduleId, practice, token, selected, input) {
  const module = modules[moduleId]
  const path = `/modulos/${moduleId}`
  const round = currentRound(practice)
  const pending = pendingExercise(practice)
  const instance = selected ?? pending
  const lesson = `<p>${escape(module.lesson)}</p><h2>Ejemplo resuelto</h2><p>${escape(module.example)}</p>`
  const heading = `<p class="muted">Habilidad · ${escape(skills[module.skill])}</p><h1>${escape(module.title)}</h1>`
  const start = form(token, `${path}/iniciar`, `<input type="hidden" name="previous" value="${round?.id ?? ''}">
    ${button(round ? 'Repetir ronda' : 'Empezar práctica')}`)
  let activity

  if (instance) {
    const question = practiceQuestion(instance)
    const index = round.instances.indexOf(instance)
    const title = instance.parameters ? 'Variante de dos pasos'
      : index < 0 ? 'Ejercicio de práctica' : `Ejercicio ${index + 1} de ${round.instances.length}`
    activity = `<section><h2>${title}</h2>${instance.response
      ? `<p>${escape(question.prompt)}</p>${feedback(question, instance.response)}`
      : questionForm(question, token, `${path}/responder`, { ...input, instanceId: instance.id })}</section>`
    if (instance.response && pending) activity += `<p>${link(path, 'Continuar práctica')}</p>`
  }

  if (!round) return `${heading}${lesson}${start}`
  let actions = ''
  if (!pending) {
    actions = `<p><strong>Ronda completada</strong></p><div class="actions">${start}`
    if (offersVariants(moduleId) && practice.variants.length < variantPool.length) {
      actions += form(token, `${path}/variante`, `<input type="hidden" name="previous" value="${practice.variants.at(-1)?.id ?? ''}">
        ${button('Pedir otra ecuación')}`)
    }
    actions += '</div>'
    if (offersVariants(moduleId) && practice.variants.length === variantPool.length) {
      actions += '<p>Ya resolviste todas las variantes de esta sesión. Puedes repetir la práctica revisada.</p>'
    }
    actions += '<p><a href="/resultado">Volver a mi resultado</a></p>'
  }

  return `${heading}<details><summary>Ver explicación y ejemplo</summary>${lesson}</details>${activity ?? ''}${actions}`
}
