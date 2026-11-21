import { statusLabels } from './assessment.js'
import { modules, skills } from './content.js'
import { evidence, escape, link, recommendation, score } from './views.js'

const dates = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Guatemala',
})

function assessmentSummary(title, block, skill) {
  const result = block?.result
  if (!result) return `<div><h3>${title}</h3><p>Pendiente</p></div>`
  const item = result.skills[skill]
  return `<div><h3>${title}</h3>
    <p><time datetime="${result.date}">${dates.format(new Date(result.date))}</time></p>
    <p><strong>${statusLabels[item.status]}</strong></p><p>${score(item)}</p>
    <details><summary>Ver evidencia</summary>${evidence(block, item.evidence)}</details></div>`
}

export function history(progress) {
  const initial = progress.initial
  if (!initial?.result) return `<h1>Mi historial</h1><p>Tus resultados aparecerán aquí cuando completes la evaluación inicial.</p>
    <p>${link('/', 'Ir al inicio')}</p>`

  const followUp = progress.followUp
  const practice = Object.entries(progress.practice ?? {})
  const badge = progress.badge
  return `<h1>Mi historial</h1>
  ${Object.entries(skills).map(([id, name]) => {
    const before = initial.result.skills[id]
    const after = followUp?.result?.skills[id]
    let change = ''
    if (before.status === 'insufficient' && after?.status === 'demonstrated') {
      change = '<p><strong>Evidencia nueva.</strong> Completaste las dos respuestas de esta habilidad correctamente.</p>'
    } else if (before.status === after?.status && after.correct > before.correct) {
      change = '<p>Aumentaron los aciertos y el estado se mantiene.</p>'
    }
    return `<section id="${id}"><h2>${escape(name)}</h2><div class="comparison">
      ${assessmentSummary('Antes', initial, id)}${assessmentSummary('Después', followUp, id)}</div>${change}</section>`
  }).join('')}
  ${followUp?.result ? `<section><h2>Insignia</h2>${badge
    ? `<h3>Avance en ecuaciones lineales</h3><p>Pasaste de «En desarrollo» a «Demostrada en esta evaluación» en ${badge.evidence.length === 1 ? 'esta habilidad' : 'ambas habilidades'}.</p>
    <ul>${badge.evidence.map(item => `<li><a href="#${item.skill}">Ver evidencia de ${skills[item.skill].toLowerCase()}</a></li>`).join('')}</ul>`
    : '<p>Pendiente. Se obtiene al pasar de En desarrollo a Demostrada en al menos una habilidad.</p>'}</section>` : ''}
  ${practice.length ? `<section><h2>Módulos practicados</h2><ul>${practice.map(([id, activity]) => {
    const completed = activity.rounds.filter(round => round.completedAt).length
    return `<li><a href="/modulos/${id}">${escape(modules[id].title)}</a> · ${completed}
      ${completed === 1 ? 'ronda completada' : 'rondas completadas'}</li>`
  }).join('')}</ul></section>` : ''}
  ${followUp?.result ? `${recommendation(followUp.result)}<p><a href="/resultado">Ver evaluación inicial</a></p>`
    : `<p>${link('/resultado', 'Volver a mi resultado')}</p>`}`
}
