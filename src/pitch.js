import { courseProgress, examPage, followUpProblem, initialProblem, modulePage, moduleStatus,
  pitchFeedback, pitchForm, pitchLocation, pitchRun, pitchUrl, units } from './pitch-course.js'
import { masteryProfiles, masteryStatus } from './study-mastery.js'
import { escape, link } from './views.js'

const at = '2026-11-21T17:00:00.000Z'
const algebra = 'manipulacion-algebraica'
const equations = 'resolucion-ecuaciones'
const modeling = 'modelacion-matematica'
const course = 'Matemáticas para Bachillerato'
const specialCourses = 'Cursos especiales'
const open2Course = 'Matemáticas de ingreso · Colegio Open2'
const navigation = { inicio: 'Hoy', ruta: 'Mapa', practica: 'Práctica', colegio: specialCourses, metas: 'Metas' }
const stages = [
  ['Bases de álgebra', ['fundamentos', 'distributiva']],
  ['Ecuaciones y modelación', ['ecuaciones', 'modelacion', 'integracion']],
  ['Evaluación', ['examen']],
]

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
  if (run.canCheck) return { title: 'Comprobación sin pista', detail: 'Resuelve una variante nueva para desbloquear el problema de compra.',
    href: pitchUrl(run, 'repaso', { fase: 'autonoma' }), action: 'Continuar comprobación' }
  if (run.guide) return { title: run.guide.title, detail: 'Gradus eligió este refuerzo a partir de tu respuesta anterior.',
    href: pitchUrl(run, 'repaso', { fase: 'guiada' }), action: 'Continuar refuerzo' }
  return { title: 'Repasar distributiva y signos', detail: 'Ya toca comprobar cómo distribuyes un factor negativo.',
    href: pitchUrl(run, 'repaso'), action: 'Empezar repaso' }
}

function nextTask(run) {
  if (!run.reviewDone) return practiceTask(run)
  if (!run.courseDone) return { title: units.integracion.title, detail: units.integracion.concept,
    href: pitchUrl(run, 'unidad', { unidad: 'integracion' }), action: 'Abrir problema de compra' }
  if (run.score === null) return { title: 'Examen final', detail: 'Completa cinco problemas para cerrar el curso.',
    href: pitchUrl(run, 'examen'), action: 'Abrir examen' }
  if (run.score < 75) return { title: 'Revisar el examen', detail: 'Consulta las soluciones antes de volver a presentarlo.',
    href: pitchUrl(run, 'examen'), action: 'Ver examen calificado' }
  if (run.score >= 90 && !run.followUp?.outcome) return { title: 'Comprobar retención', detail: 'Resuelve un problema nuevo de distributiva en una visita posterior.',
    href: pitchUrl(run, 'metas', { seguimiento: 'si' }) + '#seguimiento', action: 'Abrir seguimiento' }
  return { title: 'Resultado de ingreso', detail: 'Consulta tus metas, el puntaje y el estado de retención.',
    href: pitchUrl(run, 'metas'), action: 'Ver resultado de ingreso' }
}

function nextPanel(task, label = '') {
  return `<section class="course-next course-recommendation"${label ? ` aria-label="${label}"` : ''}>
    <div><h2>${task.title}</h2><p>${task.detail}</p></div>
    ${link(task.href, task.action)}</section>`
}

function today(run) {
  return nextPanel(nextTask(run))
}

function courseCatalog(run) {
  return `<ul class="course-catalog" role="list">
    <li>
      <div><h2>${open2Course}</h2>
        <p>Practica álgebra, ecuaciones y problemas aplicados para el examen de ingreso a 4.º bachillerato.</p>
        <p class="course-duration">5 semanas estimadas</p></div>
      ${link(pitchUrl(run, 'curso'), 'Revelar curso')}
    </li>
    <li>
      <div><h2>Preparación para bachillerato</h2>
        <p class="course-duration">8 semanas estimadas</p></div>
      <p class="course-release">Se desbloquea el <time datetime="2026-12-01">1 de diciembre</time></p>
    </li>
  </ul>`
}

function courseNodes(run) {
  const nodes = Object.fromEntries(Object.entries(units).map(([id, unit], index) => [id, {
    ...unit,
    position: index + 1,
    status: moduleStatus(id, run),
    locked: id === 'integracion' && !run.reviewDone,
    done: id === 'distributiva' ? run.reviewDone : id === 'integracion' ? run.courseDone : true,
    href: pitchUrl(run, 'unidad', { unidad: id }),
  }]))
  nodes.examen = {
    title: 'Examen final', position: Object.keys(units).length + 1, concept: 'Cinco problemas para comprobar los temas del curso.',
    status: run.score === null ? (run.courseDone ? 'Disponible' : 'Pendiente de resolver la compra') : run.score + ' de 100',
    locked: !run.courseDone, done: run.score >= 75, href: pitchUrl(run, 'examen'),
  }
  return nodes
}

function nodeMark(node) {
  return `<span class="course-node-mark" aria-hidden="true" data-done="${node.done}">${node.done ? '' : node.position}</span>`
}

function coursePage(run) {
  const nodes = courseNodes(run)
  return `<div class="course-heading-row"><a href="${pitchUrl(run, 'colegio')}">Ver cursos especiales</a></div>
    <div class="course-stages">${stages.map(([title, ids]) => `<section class="course-stage">
      <h2>${title}</h2><ol class="course-list">${ids.map(id => {
    const node = nodes[id]
    return `<li><a href="${mapUrl(run, id)}">${nodeMark(node)}
      <span><strong>${node.title}</strong><small>${node.status}</small></span></a></li>`
  }).join('')}</ol></section>`).join('')}</div>`
}

function mapUrl(run, id) {
  return `${pitchUrl(run, 'ruta', { tramo: id })}#detalle-ruta`
}

function route(run, requested) {
  const focus = run.courseDone ? 'examen' : run.reviewDone ? 'integracion' : 'distributiva'
  const nodes = courseNodes(run)
  const selection = Object.hasOwn(nodes, requested) ? requested : focus
  const node = nodes[selection]
  const task = selection === focus ? nextTask(run) : null
  const detail = node.locked ? '' : task?.detail ?? node.concept
  return `<div class="course-heading-row"><p><strong>Tu paso actual</strong> · ${nodes[focus].title}</p>
    <a class="button secondary" href="${pitchUrl(run, 'ruta', { tramo: focus })}#nodo-${focus}">Localizar mi paso</a></div>
    <div class="course-route">
      <div class="course-visor">
        <ol class="pitch-map" aria-label="Recorrido de matemáticas">${Object.entries(nodes).map(([id, item]) =>
          `<li><a id="nodo-${id}" href="${mapUrl(run, id)}"${id === selection ? ' aria-current="location"' : ''}${id === focus ? ' data-next' : ''}>
            ${nodeMark(item)}<span class="course-node-label"><strong>${item.title}</strong>
            <small>${id === focus ? '<span class="sr-only">Paso actual · </span>' : ''}${item.status}</small></span></a></li>`).join('')}</ol>
      </div>
      <section class="course-inspector" id="detalle-ruta" tabindex="-1" aria-labelledby="route-detail-title">
        <h2 id="route-detail-title">${node.title}</h2>
        <p class="course-status">${mapEvidence[selection] ?? node.status}</p>
        ${detail ? `<p>${detail}</p>` : ''}
        ${task ? link(task.href, task.action) : node.locked
          ? link(mapUrl(run, focus), 'Ir al paso actual') : link(node.href, selection === 'examen' ? 'Abrir examen' : 'Abrir lección')}
      </section>
    </div>`
}

function practice(run) {
  const state = learning[algebra]
  const evidence = `<details><summary>Evidencia del gemelo</summary><dl class="pitch-metrics">
    <div><dt>Última comprobación</dt><dd>${formatDay.format(new Date(state.retainedAt))}</dd></div>
    <div><dt>Fecha de revisión</dt><dd>${formatDay.format(new Date(state.nextCheckAt))}</dd></div></dl></details>`
  const nodes = courseNodes(run)
  const distributive = run.initial?.outcome ? moduleStatus('distributiva', run) : masteryStatus(state, at)
  return `${nextPanel(run.reviewDone ? nextTask(run) : practiceTask(run), run.reviewDone ? 'Siguiente paso' : 'Sesión recomendada')}
    <section class="course-topics"><h2>Tus temas</h2>
      ${stages.slice(0, 2).map(([title, ids], index) => `<details name="temas"${index === 0 && !run.courseDone ? ' open' : ''}>
        <summary>${title}</summary>
        <ul class="course-list">${ids.map(id => {
    const node = nodes[id]
    const status = id === 'distributiva' ? distributive : mapEvidence[id] ?? node.status
    return `<li class="course-topic"><div><strong>${node.title}</strong><small>${status}</small></div>
      ${node.locked ? '' : `<a href="${node.href}">${id === 'integracion' ? 'Ver problema' : 'Ver lección'}<span class="sr-only"> · ${node.title}</span></a>`}</li>`
  }).join('')}</ul></details>`).join('')}
      ${evidence}
    </section>`
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
    if (run.reviewDone) return `${steps}<h2>Repaso superado</h2><p>El problema de compra está disponible.</p>
      <p>${link(pitchUrl(run, 'unidad', { unidad: 'integracion' }), 'Abrir problema de compra')}</p>
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

const rewards = { prioridad: 'revisión prioritaria', beca: 'media beca' }

function eligibility(candidate) {
  if (candidate.goals < 3 || candidate.exam === null || candidate.exam < 75) return ''
  return candidate.exam >= 90 && candidate.retained ? 'beca' : 'prioridad'
}

function candidateFrom(run) {
  return { goals: run.courseDone ? 3 : 2, exam: run.score, retained: run.followUp?.outcome === 'correct' }
}

export function pitchApplication(params) {
  const run = pitchRun(params)
  const offered = eligibility(candidateFrom(run))
  const requested = params.get('premio')
  if (offered && offered === requested) return pitchLocation(run, 'metas', { solicitud: offered })
  return pitchLocation(run, 'metas')
}

function goals(run, selected, showingFollowUp) {
  const own = !Object.hasOwn(cases, selected)
  const candidate = own ? candidateFrom(run) : cases[selected]
  const offered = eligibility(candidate)
  const requested = run.answers.solicitud
  const application = own && offered && (offered === requested || requested === 'prioridad') ? requested : ''
  const showRequest = own && offered && offered !== application
  const score = candidate.exam === null ? 'Sin calificar' : candidate.exam + ' de 100'
  const objectives = [
    { title: 'Simplificar expresiones algebraicas', done: true },
    { title: 'Resolver y comprobar ecuaciones', done: true },
    { title: 'Plantear y resolver el problema de compra', done: candidate.goals === 3, href: mapUrl(run, 'integracion'), action: 'Ver en el mapa' },
    { title: 'Obtener al menos 75 de 100 en el examen final', detail: score, done: candidate.exam >= 75,
      href: mapUrl(run, 'examen'), action: 'Ver examen' },
    { title: 'Confirmar retención', detail: 'Para la media beca se requieren 90 de 100 y una comprobación de retención.',
      done: candidate.retained, href: run.score >= 90 ? pitchUrl(run, 'metas', { seguimiento: 'si' }) + '#seguimiento' : '',
      action: 'Abrir seguimiento' },
  ]
  return `<ul class="course-list goal-checklist" aria-label="Objetivos de ingreso">${objectives.map(item => `
    <li class="course-topic" data-done="${item.done}">
      <span class="goal-mark" aria-hidden="true"></span>
      <div><strong>${item.title}</strong>${item.detail ? `<small>${item.detail}</small>` : ''}
      ${own && !item.done && item.href ? `<a href="${item.href}">${item.action}</a>` : ''}</div>
      <span class="course-status">${item.done ? 'Cumplido' : 'Pendiente'}</span>
    </li>`).join('')}</ul>
    <section class="course-next" aria-labelledby="pitch-outcome"><h2 id="pitch-outcome">${offered ? 'Candidata a ' + rewards[offered] : 'Metas pendientes'}</h2>
      ${application ? `<p role="status">Solicitud de ${rewards[application]} preparada para revisión del colegio.</p>` : ''}
      ${offered === 'beca' ? '<p>El beneficio propuesto cubre el 50 % de la colegiatura del primer ciclo.</p>'
        : offered ? '<p>El colegio valida la candidatura y decide la asignación.</p>'
          : '<p>Completa los tres objetivos del curso y alcanza 75 de 100 para solicitar revisión prioritaria.</p>'}
      ${showRequest ? `<form method="post" action="/pitch">
        ${Object.entries(run.answers).map(([name, value]) => `<input type="hidden" name="${name}" value="${escape(value)}">`).join('')}
        <button name="premio" value="${offered}">Solicitar ${rewards[offered]}</button>
      </form>` : ''}
    </section>
    ${own && run.score >= 90 && (run.followUp?.outcome || showingFollowUp) ? `<section id="seguimiento" tabindex="-1"><h2>Seguimiento de retención</h2>
      ${run.followUp?.outcome ? pitchFeedback(followUpProblem, run.followUp)
        : pitchForm(run, 'metas', { retencion: followUpProblem }, { retencion: run.followUp }, 'Comprobar retención', { seguimiento: 'si' })}</section>` : ''}
    <p><a href="/pitch">Volver a empezar</a></p>`
}

export function pitchPage(params) {
  const run = pitchRun(params)
  const requested = params.get('escena')
  const id = Object.hasOwn(units, params.get('unidad')) ? params.get('unidad') : 'fundamentos'
  const pages = {
    inicio: ['Hoy', () => today(run)], colegio: [specialCourses, () => courseCatalog(run)],
    curso: [open2Course, () => coursePage(run)], ruta: ['Mapa', () => route(run, params.get('tramo'))], practica: ['Práctica', () => practice(run)],
    unidad: [units[id].title, () => modulePage(run, id)], repaso: ['Repaso de distributiva', () => review(run, params.get('fase'))],
    examen: ['Examen final', () => examPage(run)], metas: ['Metas de ingreso', () => goals(run, params.get('caso'), params.get('seguimiento') === 'si')],
  }
  const current = Object.hasOwn(pages, requested) ? requested : 'inicio'
  const navScene = { unidad: 'ruta', examen: 'ruta', repaso: 'practica', curso: 'colegio' }[current] ?? current
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
