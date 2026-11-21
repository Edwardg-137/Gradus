import { courseProgress, examPage, followUpProblem, initialProblem, modulePage, moduleStatus,
  pitchFeedback, pitchForm, pitchRun, pitchUrl, units } from './pitch-course.js'
import { masteryProfiles, masteryStatus } from './study-mastery.js'
import { link } from './views.js'

const at = '2026-11-21T17:00:00.000Z'
const algebra = 'manipulacion-algebraica'
const equations = 'resolucion-ecuaciones'
const modeling = 'modelacion-matematica'
const course = 'Matemáticas para Bachillerato'
const navigation = { inicio: 'Hoy', ruta: 'Mapa', practica: 'Práctica', curso: 'Curso', metas: 'Metas' }

function completed(competency, day) {
  return {
    type: 'completa', completedAt: '2026-11-' + day + 'T16:00:00.000Z', result: {
      competencies: { [competency]: { level: 3, autonomous: ['conceptual', 'procedimental', 'aplicacion'].map(dimension =>
        ({ id: competency + '-' + dimension, dimension, correct: true })) } },
    },
  }
}

function retained(competency, day) {
  const date = '2026-11-' + day + 'T16:00:00.000Z'
  return { type: 'retencion', scopeId: competency, createdAt: date, completedAt: date, result: { retention: { passed: true } } }
}

const learning = masteryProfiles([
  completed(modeling, 21), retained(equations, 19), retained(equations, 16), completed(equations, 15),
  retained(algebra, 14), retained(algebra, 11), completed(algebra, 10),
])

const formatDay = new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'long', timeZone: 'America/Guatemala' })
const mapEvidence = { ecuaciones: masteryStatus(learning[equations], at), modelacion: masteryStatus(learning[modeling], at) }

function practiceTask(run) {
  if (run.canCheck) return { title: 'Comprobación sin pista', detail: 'Resuelve una variante nueva para abrir la actividad integradora.',
    href: pitchUrl(run, 'repaso', { fase: 'autonoma' }), action: 'Continuar comprobación' }
  if (run.guide) return { title: run.guide.title, detail: 'Gradus eligió este refuerzo a partir de tu respuesta anterior.',
    href: pitchUrl(run, 'repaso', { fase: 'guiada' }), action: 'Continuar refuerzo' }
  return { title: 'Repasar distributiva y signos', detail: 'La comprobación venció. Repasa esta base antes de la actividad integradora.',
    href: pitchUrl(run, 'repaso'), action: 'Empezar repaso' }
}

function nextTask(run) {
  if (!run.reviewDone) return practiceTask(run)
  if (!run.courseDone) return { title: 'Actividad integradora', detail: 'Aplica lo que aprendiste para modelar y resolver una compra.',
    href: pitchUrl(run, 'unidad', { unidad: 'integracion' }), action: 'Abrir actividad' }
  if (run.score === null) return { title: 'Examen final', detail: 'Completa cinco problemas para cerrar el curso.',
    href: pitchUrl(run, 'examen'), action: 'Abrir examen' }
  if (run.score < 75) return { title: 'Revisar el examen', detail: 'Consulta las soluciones antes de volver a presentarlo.',
    href: pitchUrl(run, 'examen'), action: 'Ver examen calificado' }
  if (run.score >= 90 && !run.followUp?.outcome) return { title: 'Comprobar retención', detail: 'Resuelve un problema nuevo de distributiva en una visita posterior.',
    href: pitchUrl(run, 'metas', { seguimiento: 'si' }), action: 'Abrir seguimiento' }
  return { title: 'Resultado de ingreso', detail: 'Consulta tus metas, el puntaje y el estado de retención.',
    href: pitchUrl(run, 'metas'), action: 'Ver resultado de ingreso' }
}

function nextPanel(task) {
  return `<section class="course-next"><h2>${task.title}</h2><p>${task.detail}</p><p>${link(task.href, task.action)}</p></section>`
}

function today(run) {
  return nextPanel(nextTask(run))
}

function partnership(run) {
  return `<dl class="pitch-roles"><div><dt>El colegio</dt><dd>Define el temario, valida el examen y decide cupos y becas.</dd></div>
    <div><dt>Gradus</dt><dd>Estimaría el nivel, organizaría los refuerzos y entregaría un resumen del grupo.</dd></div></dl>
    <p><a href="${pitchUrl(run, 'curso')}">Volver al curso</a></p>`
}

function coursePage(run) {
  return `<p>Programa de preparación para estudiantes de tercero básico.</p>
    <h2>Objetivos</h2><ul><li>Transformar expresiones conservando su valor.</li><li>Resolver y comprobar ecuaciones con paréntesis.</li>
    <li>Plantear una ecuación a partir de un problema y justificar la solución.</li></ul>
    <p><a href="${pitchUrl(run, 'colegio')}">Ver la propuesta de colaboración escolar</a></p>`
}

function route(run) {
  const task = nextTask(run)
  const focus = run.score !== null ? null : run.courseDone ? 'examen' : run.reviewDone ? 'integracion' : 'distributiva'
  const nodes = Object.entries(units).map(([id, unit]) => ({ id, title: unit.title, status: moduleStatus(id, run),
    evidence: mapEvidence[id], href: pitchUrl(run, 'unidad', { unidad: id }) }))
  const examStatus = run.score === null ? (run.courseDone ? 'Disponible' : 'Pendiente') : run.score + ' de 100'
  nodes.push({ id: 'examen', title: 'Examen final', status: examStatus, href: pitchUrl(run, 'examen') })

  return `<p class="muted">Curso y comprobaciones de dominio.</p><ol class="pitch-map">${nodes.map(node =>
    `<li${node.id === focus ? ' class="pitch-priority"' : ''}><a href="${node.href}">
      <span><strong>${node.title}</strong>${node.evidence ? `<small>${node.evidence}</small>` : ''}</span>
      <span class="course-status">${node.status}</span></a></li>`).join('')}</ol>
    <p>${link(task.href, task.action)}</p>`
}

function practice(run) {
  const state = learning[algebra]
  const evidence = `<details><summary>Evidencia del gemelo</summary><dl class="pitch-metrics">
    <div><dt>Última comprobación</dt><dd>${formatDay.format(new Date(state.retainedAt))}</dd></div>
    <div><dt>Fecha de revisión</dt><dd>${formatDay.format(new Date(state.nextCheckAt))}</dd></div></dl></details>`
  if (run.reviewDone) return `<p><strong>Distributiva y signos</strong> · Repaso superado</p>
    ${nextPanel(nextTask(run))}${evidence}`
  return `<p class="course-status">${run.initial?.outcome ? moduleStatus('distributiva', run) : masteryStatus(state, at)}</p>
    ${nextPanel(practiceTask(run))}${evidence}`
}

function reviewSteps(run, current) {
  const stages = [['inicial', 'Comprobar'], ...(run.guide ? [['guiada', 'Refuerzo']] : []), ['autonoma', 'Sin pista']]
  return `<ol class="review-steps" aria-label="Etapas del repaso">${stages.map(([id, label]) =>
    `<li${id === current ? ' aria-current="step"' : ''}>${label}</li>`).join('')}</ol>`
}

function review(run, phase) {
  if (run.canCheck && (phase === 'autonoma' || run.autonomous)) {
    const problem = run.independentProblem
    const steps = reviewSteps(run, 'autonoma')
    if (run.reviewDone) return `${steps}<h2>Repaso superado</h2><p>Actividad integradora disponible.</p>
      <p>${link(pitchUrl(run, 'unidad', { unidad: 'integracion' }), 'Abrir actividad integradora')}</p>
      <details><summary>Ver corrección</summary>${pitchFeedback(problem, run.autonomous)}</details>`
    if (run.autonomous?.outcome === 'incorrect') {
      const retry = run.alternate ? pitchUrl({ answers: {} }, 'repaso')
        : pitchUrl(run, 'repaso', { fase: 'autonoma', variante: '1', autonoma: '' })
      return `${steps}<div class="course-example">${pitchFeedback(problem, run.autonomous)}</div>
        <p>${link(retry, run.alternate ? 'Reiniciar repaso' : 'Probar otro ejercicio sin pista')}</p>`
    }
    return `${steps}<h2>Comprobación sin pista</h2>
      ${pitchForm(run, 'repaso', { autonoma: problem }, { autonoma: run.autonomous }, 'Comprobar sin pista', { fase: 'autonoma' })}`
  }

  if (run.guide && (phase === 'guiada' || run.guided)) {
    const { title, clue, question } = run.guide
    return `${reviewSteps(run, 'guiada')}<h2>${title}</h2>
      ${run.canCheck ? `<div class="course-example">${pitchFeedback(question, run.guided)}</div>
        <p>${link(pitchUrl(run, 'repaso', { fase: 'autonoma' }), 'Pasar a un ejercicio sin pista')}</p>`
        : `<p class="pitch-callout"><strong>Pista</strong> · ${clue}</p>${pitchFeedback(question, run.guided)}
        ${pitchForm(run, 'repaso', { guiada: question }, { guiada: run.guided }, 'Comprobar práctica guiada', { fase: 'guiada' })}`}`
  }

  const steps = reviewSteps(run, 'inicial')
  if (!run.initial?.outcome) return steps + pitchForm(run, 'repaso', { respuesta: initialProblem }, { respuesta: run.initial }, 'Comprobar respuesta')
  return `${steps}<div class="course-example">${pitchFeedback(initialProblem, run.initial)}</div>
    ${run.guide ? `<h2>Refuerzo asignado</h2><p>${run.guide.title}</p>
    <p>${link(pitchUrl(run, 'repaso', { fase: 'guiada' }), 'Repetir con ayuda')}</p>`
      : `<p>${link(pitchUrl(run, 'repaso', { fase: 'autonoma' }), 'Pasar a un ejercicio sin pista')}</p>`}`
}

const cases = {
  pendiente: { goals: 2, exam: 72, retained: false },
  prioridad: { goals: 3, exam: 82, retained: false },
  beca: { goals: 3, exam: 92, retained: true },
}

function goals(run, selected, showingFollowUp) {
  const own = !Object.hasOwn(cases, selected)
  const candidate = own
    ? { goals: run.courseDone ? 3 : 2, exam: run.score, retained: run.followUp?.outcome === 'correct' } : cases[selected]
  const completed = candidate.goals === 3 && candidate.exam >= 75
  const scholarship = completed && candidate.exam >= 90 && candidate.retained
  const outcome = scholarship ? 'Candidata a media beca' : completed ? 'Candidata a revisión prioritaria' : 'Metas pendientes'
  const score = candidate.exam === null ? 'Pendiente' : candidate.exam + ' de 100'
  return `<section class="course-next" aria-labelledby="pitch-outcome"><h2 id="pitch-outcome">${outcome}</h2>
    <dl class="pitch-metrics"><div><dt>Objetivos acreditados</dt><dd>${candidate.goals} de 3</dd></div>
    <div><dt>Examen final</dt><dd>${score}</dd></div><div><dt>Retención</dt><dd>${candidate.retained ? 'Confirmada' : 'Pendiente'}</dd></div></dl></section>
    <details><summary>Condiciones propuestas de ingreso</summary><ul>
    <li><strong>Preferencia.</strong> Tres objetivos acreditados y 75 de 100 en el examen.</li>
    <li><strong>Media beca.</strong> Tres objetivos, 90 de 100 y retención confirmada. Cubriría el 50 % de la colegiatura del primer ciclo.</li></ul>
    <p>El colegio valida la candidatura y decide la asignación.</p></details>
    ${own && run.score >= 90 ? `<section><h2>Seguimiento de retención</h2>
      ${run.followUp?.outcome ? pitchFeedback(followUpProblem, run.followUp) : showingFollowUp
        ? pitchForm(run, 'metas', { retencion: followUpProblem }, { retencion: run.followUp }, 'Comprobar retención', { seguimiento: 'si' })
        : link(pitchUrl(run, 'metas', { seguimiento: 'si' }), 'Abrir seguimiento')}</section>` : ''}
    <p><a href="/pitch">Volver a empezar</a></p>`
}

export function pitchPage(params) {
  const run = pitchRun(params)
  const requested = params.get('escena')
  const id = Object.hasOwn(units, params.get('unidad')) ? params.get('unidad') : 'fundamentos'
  const pages = {
    inicio: ['Hoy', () => today(run)], colegio: ['Colaboración escolar propuesta', () => partnership(run)],
    curso: ['Curso', () => coursePage(run)], ruta: ['Mapa', () => route(run)], practica: ['Práctica', () => practice(run)],
    unidad: [units[id].title, () => modulePage(run, id)], repaso: ['Repaso de distributiva', () => review(run, params.get('fase'))],
    examen: ['Examen final', () => examPage(run)], metas: ['Metas de ingreso', () => goals(run, params.get('caso'), params.get('seguimiento') === 'si')],
  }
  const current = Object.hasOwn(pages, requested) ? requested : 'inicio'
  const navScene = { unidad: 'ruta', examen: 'ruta', repaso: 'practica', colegio: 'curso' }[current] ?? current
  const [title, render] = pages[current]
  return {
    title,
    body: `<h1>${title}</h1>${render()}`,
    navigation: `<aside class="leaf overview course-nav" aria-label="Programa de preparación"><strong>${course}</strong>
      <p class="muted">Lucía · 3.º básico</p>${courseProgress(run)}
      <nav aria-label="Curso">${Object.entries(navigation).map(([id, label]) =>
        `<a href="${pitchUrl(run, id)}"${id === navScene ? ` aria-current="${current === id ? 'page' : 'location'}"` : ''}>${label}</a>`).join('')}</nav></aside>`,
  }
}
