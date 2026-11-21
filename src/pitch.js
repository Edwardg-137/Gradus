import { courseProgress, examPage, followUpProblem, initialProblem, modulePage, moduleStatus,
  pitchFeedback, pitchForm, pitchRun, pitchUrl, units } from './pitch-course.js'
import { masteryProfiles, masteryStatus } from './study-mastery.js'
import { link } from './views.js'

const at = '2026-11-21T17:00:00.000Z'
const algebra = 'manipulacion-algebraica'
const equations = 'resolucion-ecuaciones'
const modeling = 'modelacion-matematica'
const college = 'Colegio Demo Horizonte'
const course = 'Matemáticas para ingresar a Bachillerato'
const scenes = { inicio: 'Inicio', colegio: 'Colegio', curso: 'Curso', ruta: 'Mapa', repaso: 'Repaso', metas: 'Metas' }

function completed(competency, day) {
  return {
    type: 'completa', completedAt: `2026-11-${day}T16:00:00.000Z`, result: {
      competencies: { [competency]: { level: 3, autonomous: ['conceptual', 'procedimental', 'aplicacion'].map(dimension =>
        ({ id: `${competency}-${dimension}`, dimension, correct: true })) } },
    },
  }
}

function retained(competency, day) {
  const date = `2026-11-${day}T16:00:00.000Z`
  return { type: 'retencion', scopeId: competency, createdAt: date, completedAt: date, result: { retention: { passed: true } } }
}

const learning = masteryProfiles([
  completed(modeling, 21), retained(equations, 19), retained(equations, 16), completed(equations, 15),
  retained(algebra, 14), retained(algebra, 11), completed(algebra, 10),
])

const formatDay = new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'long', timeZone: 'America/Guatemala' })
const mapEvidence = { ecuaciones: masteryStatus(learning[equations], at), modelacion: masteryStatus(learning[modeling], at) }

function entry(run) {
  return `<p>Lucía, estudiante ficticia de tercero básico, está por terminar el curso que ofrece el colegio para ingresar a Bachillerato.</p>
    ${courseProgress(run)}<p>Explora lo que ya estudió, resuelve el repaso que Gradus adelantó y completa el examen del curso.</p>
    <div class="actions">${link(pitchUrl(run, 'curso'), 'Abrir curso')}<a href="${pitchUrl(run, 'colegio')}">Ver la colaboración</a></div>`
}

function partnership(run) {
  return `<h2>${college}</h2><p>En este escenario, el colegio ofrece <strong>${course}</strong> a estudiantes de tercero básico que quieren ingresar a diversificado.</p>
    <dl class="pitch-roles"><div><dt>El colegio</dt><dd>Define los temas de ingreso, valida el examen final y decide la asignación de cupos y becas.</dd></div>
    <div><dt>Gradus</dt><dd>Estima el nivel inicial y propone una ruta individual. El piloto contemplaría un resumen de avance del grupo para el colegio.</dd></div></dl>
    <p>${link(pitchUrl(run, 'curso'), 'Abrir el curso del colegio')}</p>`
}

function coursePage(run) {
  return `<p>${college} · Programa de preparación para estudiantes de tercero básico.</p>${courseProgress(run)}
    <h2>Objetivos del curso</h2><ul><li>Transformar expresiones conservando su valor.</li>
    <li>Resolver y comprobar ecuaciones con paréntesis.</li><li>Plantear una ecuación a partir de un problema y justificar la solución.</li></ul>
    <p>${run.courseDone ? 'La actividad integradora está completada.' : 'Lucía ya cursó las cuatro primeras unidades. Le queda una actividad integradora y el examen final.'}</p>
    <p>${link(pitchUrl(run, 'ruta'), 'Abrir mapa interactivo')}</p>`
}

function route(run) {
  const state = learning[algebra]
  const due = masteryStatus(state, at)
  let notice = `<strong>${due}.</strong> Última comprobación el ${formatDay.format(new Date(state.retainedAt))}. La siguiente venció el ${formatDay.format(new Date(state.nextCheckAt))}. Gradus adelanta el repaso de distributiva antes de la actividad integradora.`
  if (run.reviewDone) notice = '<strong>Repaso superado.</strong> Lucía resolvió un problema nuevo sin pista. Gradus abrió la actividad integradora.'
  else if (run.canCheck) notice = '<strong>Comprobación pendiente.</strong> Gradus pide una variante sin pista antes de continuar con la actividad integradora.'
  else if (run.guide) notice = `<strong>Refuerzo asignado.</strong> La siguiente práctica de Lucía es «${run.guide.title}».`
  const open = run.courseDone ? link(pitchUrl(run, 'examen'), 'Abrir examen final') : run.reviewDone
    ? link(pitchUrl(run, 'unidad', { unidad: 'integracion' }), 'Abrir actividad integradora')
    : link(pitchUrl(run, 'repaso'), 'Abrir el repaso asignado')
  return `${courseProgress(run)}<p class="pitch-callout">${notice}</p>${open}
    <h2>Ruta personalizada</h2><ol class="pitch-map">${Object.entries(units).map(([id, unit]) =>
      `<li${id === (run.reviewDone ? 'integracion' : 'distributiva') && !run.courseDone ? ' class="pitch-priority"' : ''}>
        <a href="${pitchUrl(run, 'unidad', { unidad: id })}"><strong>${unit.title}</strong><span>${moduleStatus(id, run)}${mapEvidence[id] ? ` · ${mapEvidence[id]}` : ''}</span></a></li>`).join('')}
      <li><a href="${pitchUrl(run, 'examen')}"><strong>Examen final</strong><span>${run.score === null
        ? run.courseDone ? 'Disponible' : 'Tras la actividad integradora' : `Calificado · ${run.score} de 100`}</span></a></li></ol>`
}

function review(run, phase) {
  if (run.canCheck && (phase === 'autonoma' || run.autonomous)) {
    const problem = run.independentProblem
    if (run.reviewDone) return `<p><strong>${problem.prompt}</strong></p>${pitchFeedback(problem, run.autonomous)}
      <h2>Repaso superado</h2><p>Gradus abre la actividad integradora. La retención se podrá comprobar en otra visita.</p>
      <div class="actions">${link(pitchUrl(run, 'unidad', { unidad: 'integracion' }), 'Continuar con la actividad integradora')}
      <a href="${pitchUrl(run, 'ruta')}">Ver mapa actualizado</a></div>`
    if (run.autonomous?.outcome === 'incorrect') {
      const retry = run.alternate ? pitchUrl({ answers: {} }, 'repaso')
        : pitchUrl(run, 'repaso', { fase: 'autonoma', variante: '1', autonoma: '' })
      return `<p><strong>${problem.prompt}</strong></p>${pitchFeedback(problem, run.autonomous)}
        <p>La actividad integradora sigue pendiente. Gradus propone otra oportunidad de comprobación.</p>
        <p>${link(retry, run.alternate ? 'Reiniciar repaso' : 'Probar otro ejercicio sin pista')}</p>`
    }
    return `<h2>Comprobación sin pista</h2><p>Resuelve una variante nueva para retomar el curso.</p>
      ${pitchForm(run, 'repaso', { autonoma: problem }, { autonoma: run.autonomous }, 'Comprobar sin pista', { fase: 'autonoma' })}`
  }

  if (run.guide && (phase === 'guiada' || run.guided)) {
    const { title, clue, question } = run.guide
    return `<h2>${title}</h2><p class="pitch-callout"><strong>Pista</strong> · ${clue}</p> ${pitchFeedback(question, run.guided)}
      ${run.canCheck ? `<p>${link(pitchUrl(run, 'repaso', { fase: 'autonoma' }), 'Pasar a un ejercicio sin pista')}</p>`
        : pitchForm(run, 'repaso', { guiada: question }, { guiada: run.guided }, 'Comprobar práctica guiada', { fase: 'guiada' })}`
  }

  if (!run.initial?.outcome) return `<p>Gradus comprueba qué recuerda Lucía de la distributiva antes de abrir el último módulo.</p>
    ${pitchForm(run, 'repaso', { respuesta: initialProblem }, { respuesta: run.initial }, 'Comprobar respuesta')}`
  return `<p><strong>${initialProblem.prompt}</strong></p>${pitchFeedback(initialProblem, run.initial)}
    ${run.guide ? `<h2>Gradus interviene</h2><p>${run.initial.value === 'signo' ? 'Lucía distribuyó a ambos términos y se equivocó en el signo del producto.'
      : 'Lucía aplicó el factor a un solo término.'} Gradus adapta el siguiente ejercicio a ese error y deja pendiente la actividad integradora.</p>
    <p>${link(pitchUrl(run, 'repaso', { fase: 'guiada' }), 'Repetir con ayuda')}</p>`
      : `<p>Gradus propone una variante adicional para comprobar que Lucía puede aplicar la distributiva por su cuenta.</p>
      <p>${link(pitchUrl(run, 'repaso', { fase: 'autonoma' }), 'Pasar a un ejercicio sin pista')}</p>`}`
}

const cases = {
  pendiente: { label: 'En curso', goals: 2, exam: 72, retained: false },
  prioridad: { label: 'Preferencia', goals: 3, exam: 82, retained: false },
  beca: { label: 'Media beca', goals: 3, exam: 92, retained: true },
}

function goals(run, selected, showingFollowUp) {
  const actual = run.score !== null
  const id = Object.hasOwn(cases, selected) ? selected : actual ? 'recorrido' : 'pendiente'
  const outcomes = actual ? { recorrido: { label: 'Mi resultado', goals: 3, exam: run.score, retained: run.followUp?.outcome === 'correct' }, ...cases } : cases
  const candidate = outcomes[id]
  const completed = candidate.goals === 3 && candidate.exam >= 75
  const scholarship = completed && candidate.exam >= 90 && candidate.retained
  const outcome = scholarship ? 'Candidata a media beca' : completed ? 'Candidata a revisión prioritaria' : 'Metas pendientes'
  return `<p>Condiciones de ejemplo para el curso. La preferencia y la beca dependerían de las condiciones que el colegio apruebe para un piloto.</p>
    <ul><li><strong>Preferencia de inscripción.</strong> Acreditar los tres objetivos y obtener al menos 75 de 100 en el examen final.</li>
    <li><strong>Media beca.</strong> Acreditar los objetivos, obtener al menos 90 de 100 y confirmar la retención de la base priorizada. El ejemplo cubre el 50 % de la colegiatura del primer ciclo.</li></ul>
    <nav class="notebook-tabs" aria-label="Casos de ejemplo">${Object.entries(outcomes).map(([key, item]) =>
      `<a href="${pitchUrl(run, 'metas', { caso: key })}"${key === id ? ' aria-current="page"' : ''}>${item.label}</a>`).join('')}</nav>
    <section class="pitch-callout" aria-labelledby="pitch-outcome"><h2 id="pitch-outcome">${outcome}</h2>
    <dl class="pitch-metrics"><div><dt>Objetivos acreditados</dt><dd>${candidate.goals} de 3</dd></div>
    <div><dt>Examen final</dt><dd>${candidate.exam} de 100</dd></div><div><dt>Retención</dt><dd>${candidate.retained ? 'Confirmada' : 'Pendiente'}</dd></div></dl>
    <p>${id === 'recorrido' ? 'Resultado del recorrido de práctica y examen en esta simulación.' : 'Caso precargado con resultados ficticios.'}</p></section>
    ${id === 'recorrido' && run.score >= 90 ? `<section><h2>Seguimiento posterior simulado</h2>
      <p>En una visita posterior, Gradus presenta un problema distinto para volver a comprobar la distributiva.</p>
      ${run.followUp?.outcome ? pitchFeedback(followUpProblem, run.followUp) : showingFollowUp
        ? pitchForm(run, 'metas', { retencion: followUpProblem }, { retencion: run.followUp }, 'Comprobar retención', { seguimiento: 'si' })
        : link(pitchUrl(run, 'metas', { seguimiento: 'si' }), 'Abrir visita posterior')}</section>` : ''}
    <p>${link('/pitch', 'Volver al inicio del pitch')}</p>`
}

export function pitchPage(params) {
  const run = pitchRun(params)
  const requested = params.get('escena')
  const id = Object.hasOwn(units, params.get('unidad')) ? params.get('unidad') : 'fundamentos'
  const current = Object.hasOwn(scenes, requested) || requested === 'unidad' || requested === 'examen' ? requested : 'inicio'
  const navScene = current === 'unidad' || current === 'examen' ? 'ruta' : current
  const pages = {
    inicio: ['Preparación para diversificado', () => entry(run)], colegio: ['Colaboración con un colegio', () => partnership(run)],
    curso: [course, () => coursePage(run)], ruta: ['Mapa del curso de Lucía', () => route(run)],
    unidad: [units[id].title, () => modulePage(run, id)], repaso: ['Repaso de distributiva', () => review(run, params.get('fase'))],
    examen: ['Examen final', () => examPage(run)], metas: ['Metas de ingreso y media beca', () => goals(run, params.get('caso'), params.get('seguimiento') === 'si')],
  }
  const [title, body] = pages[current]
  return `<h1>${title}</h1><p class="pitch-disclosure">Simulación de pitch · Colegio, estudiante y resultados ficticios</p>
    <nav class="notebook-tabs" aria-label="Escenas del pitch">${Object.entries(scenes).map(([id, label]) =>
      `<a href="${pitchUrl(run, id)}"${id === navScene ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>${body()}`
}
