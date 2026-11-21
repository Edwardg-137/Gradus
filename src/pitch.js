import { grade } from './assessment.js'
import { nexoraLessons } from './nexora-content.js'
import { masteryProfiles, masteryStatus } from './study-mastery.js'
import { escape, feedback, link } from './views.js'

const at = '2026-11-21T17:00:00.000Z'
const algebra = 'manipulacion-algebraica'
const equations = 'resolucion-ecuaciones'
const modeling = 'modelacion-matematica'
const college = 'Colegio Demo Horizonte'
const course = 'Matemáticas para ingresar a Bachillerato'
const scenes = { inicio: 'Inicio', colegio: 'Colegio', ruta: 'Ruta', repaso: 'Repaso', metas: 'Metas' }

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

const coursePlan = [
  { skill: equations, title: 'Ecuaciones con paréntesis', reason: 'Continúa con ecuaciones cuando hayas repasado la distributiva.' },
  { skill: algebra, title: 'Propiedad distributiva y signos', reason: 'Esta habilidad se usa al quitar paréntesis.' },
  { skill: modeling, title: 'Plantear una ecuación a partir de un enunciado', reason: 'Consolida cómo traducir un problema a una igualdad.' },
].map(item => ({ ...item, status: masteryStatus(learning[item.skill], at) }))
const priority = coursePlan.find(item => item.status === 'Toca comprobar')
const adaptedPlan = [priority, ...coursePlan.filter(item => item !== priority)]
const formatDay = new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'long', timeZone: 'America/Guatemala' })

const check = {
  format: 'choice', prompt: '¿Cuál es el resultado de desarrollar −2(x − 4)?', key: 'ambos',
  options: { ambos: '−2x + 8', signo: '−2x − 8', parcial: '−2x − 4' },
  explanation: 'El −2 multiplica a x y a −4. El producto (−2)(−4) es +8.',
}

function entry() {
  return `<p>Lucía, estudiante ficticia de tercero básico, quiere ingresar a Bachillerato. El colegio le propone un curso de preparación y Gradus ajusta qué debe practicar primero.</p>
    <h2>Recorrido</h2><ol><li>Conoce el curso propuesto por el colegio.</li><li>Revisa por qué el gemelo cambia la ruta de Lucía.</li>
    <li>Responde un ejercicio y compara los resultados posibles del curso.</li></ol>
    <p>${link('/pitch?escena=colegio', 'Ver la colaboración')}</p>`
}

function partnership() {
  return `<h2>${college}</h2><p>En este escenario, el colegio ofrece <strong>${course}</strong> a estudiantes de tercero básico que quieren ingresar a diversificado.</p>
    <dl class="pitch-roles"><div><dt>El colegio</dt><dd>Define los temas de ingreso, valida el examen final y decide la asignación de cupos y becas.</dd></div>
    <div><dt>Gradus</dt><dd>Estima el nivel inicial y propone una ruta individual. El piloto contemplaría un resumen de avance del grupo para el colegio.</dd></div></dl>
    <p>El curso trabaja propiedad distributiva, ecuaciones con paréntesis y modelación de problemas.</p>
    <p>${link('/pitch?escena=ruta', 'Ver la ruta de Lucía')}</p>`
}

function route() {
  const state = learning[priority.skill]
  return `<p>En el historial ficticio, Lucía ya había demostrado dominio en manipulación algebraica. Pasó la fecha de revisión y la distributiva es una base para su siguiente lección.</p>
    <p class="pitch-callout"><strong>${priority.status}</strong> · Última comprobación el ${formatDay.format(new Date(state.retainedAt))}. La siguiente venció el ${formatDay.format(new Date(state.nextCheckAt))}. El gemelo adelanta un repaso para comprobar qué recuerda Lucía.</p>
    <details><summary>Ver orden original del curso</summary><ol>${coursePlan.map(item => `<li>${item.title}</li>`).join('')}</ol></details>
    <h2>Ruta personalizada</h2><ol class="pitch-plan">${adaptedPlan.map(item => `<li${item === priority ? ' class="pitch-priority"' : ''}>
      <strong>${item === priority ? 'Repasar ' : ''}${item.title}</strong><p>${item.status} · ${item.reason}</p></li>`).join('')}</ol>
    <p>${link('/pitch?escena=repaso', 'Abrir el repaso recomendado')}</p>`
}

function review(answer) {
  const response = Object.hasOwn(check.options, answer) ? grade(check, answer) : null
  if (!response) return `<p>Lucía empieza por un ejercicio breve para localizar la dificultad antes de seguir con ecuaciones.</p>
    <form method="get" action="/pitch"><input type="hidden" name="escena" value="repaso">
    <fieldset><legend>${check.prompt}</legend>${Object.entries(check.options).map(([id, label]) =>
      `<label class="option"><input required type="radio" name="respuesta" value="${id}"> ${label}</label>`).join('')}</fieldset>
    <button>Comprobar respuesta</button></form>`
  const sample = nexoraLessons[algebra].intermedio
  return `<p><strong>${check.prompt}</strong></p>${feedback(check, response)}
    ${response.outcome === 'correct' ? `<section><h2>Retomar la ruta</h2><p>Lucía puede continuar con ecuaciones con paréntesis. Una comprobación autónoma posterior confirmaría la retención.</p></section>`
    : `<section><h2>Refuerzo recomendado</h2><p>${answer === 'signo' ? 'Lucía aplicó la operación a ambos términos y cambió el signo del segundo producto.'
      : 'Lucía dejó el segundo término fuera de la multiplicación.'} El gemelo propone una lección completa de distributiva antes de avanzar.</p>
      <details open><summary>Vista previa de la lección personalizada</summary><p>${escape(sample.concept)}</p><p>${escape(sample.example)}</p></details></section>`}
    <div class="actions">${link('/pitch?escena=metas', 'Ver metas del colegio')}<a href="/pitch?escena=repaso">Probar otra respuesta</a></div>`
}

const cases = {
  pendiente: { label: 'En curso', goals: 2, exam: 72, retained: false },
  prioridad: { label: 'Preferencia', goals: 3, exam: 82, retained: false },
  beca: { label: 'Media beca', goals: 3, exam: 92, retained: true },
}

function goals(selected) {
  const id = Object.hasOwn(cases, selected) ? selected : 'pendiente'
  const candidate = cases[id]
  const completed = candidate.goals === 3 && candidate.exam >= 75
  const scholarship = completed && candidate.exam >= 90 && candidate.retained
  const outcome = scholarship ? 'Candidata a media beca' : completed ? 'Candidata a revisión prioritaria' : 'Metas pendientes'
  return `<p>Condiciones de ejemplo para el curso. La preferencia y la beca dependerían de las condiciones que el colegio apruebe para un piloto.</p>
    <ul><li><strong>Preferencia de inscripción.</strong> Acreditar los tres objetivos y obtener al menos 75 de 100 en el examen final.</li>
    <li><strong>Media beca.</strong> Acreditar los objetivos, obtener al menos 90 de 100 y confirmar la retención de la base priorizada. El ejemplo cubre el 50 % de la colegiatura del primer ciclo.</li></ul>
    <nav class="notebook-tabs" aria-label="Casos de ejemplo">${Object.entries(cases).map(([key, item]) =>
      `<a href="/pitch?escena=metas&amp;caso=${key}"${key === id ? ' aria-current="page"' : ''}>${item.label}</a>`).join('')}</nav>
    <section class="pitch-callout" aria-labelledby="pitch-outcome"><h2 id="pitch-outcome">${outcome}</h2>
    <dl class="pitch-metrics"><div><dt>Objetivos acreditados</dt><dd>${candidate.goals} de 3</dd></div>
    <div><dt>Examen final</dt><dd>${candidate.exam} de 100</dd></div><div><dt>Retención</dt><dd>${candidate.retained ? 'Confirmada' : 'Pendiente'}</dd></div></dl>
    <p>Este caso representa un momento posterior del curso con resultados ficticios.</p></section>
    <p>${link('/pitch', 'Volver al inicio del pitch')}</p>`
}

export function pitchPage(params) {
  const requested = params.get('escena')
  const current = Object.hasOwn(scenes, requested) ? requested : 'inicio'
  const pages = {
    inicio: ['Preparación para diversificado', entry], colegio: ['Colaboración con un colegio', partnership],
    ruta: ['El gemelo reorganiza la ruta', route], repaso: ['Repaso de distributiva', () => review(params.get('respuesta'))],
    metas: ['Metas de ingreso y media beca', () => goals(params.get('caso'))],
  }
  const [title, body] = pages[current]
  return `<h1>${title}</h1><p class="pitch-disclosure">Simulación de pitch · Colegio, estudiante y resultados ficticios</p>
    <nav class="notebook-tabs" aria-label="Escenas del pitch">${Object.entries(scenes).map(([id, label]) =>
      `<a href="${id === 'inicio' ? '/pitch' : `/pitch?escena=${id}`}"${id === current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>${body()}`
}
