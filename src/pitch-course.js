import { grade } from './assessment.js'
import { escape, feedback, link } from './views.js'

export const units = {
  fundamentos: { title: 'Términos semejantes', concept: 'Agrupa solo términos que tienen las mismas letras y exponentes.',
    example: '7a − 3b − 12a + 8b = (7 − 12)a + (−3 + 8)b = −5a + 5b.',
    evidence: 'En la práctica anterior, Lucía agrupó los términos de cada variable y conservó los signos.' },
  distributiva: { title: 'Propiedad distributiva y signos', concept: 'El factor de fuera multiplica a cada término de dentro del paréntesis.',
    example: '−3(2x − 4) = (−3)(2x) + (−3)(−4) = −6x + 12.',
    evidence: 'Lucía resolvió dos comprobaciones en fechas distintas. La revisión siguiente ya había vencido al comenzar este recorrido.' },
  ecuaciones: { title: 'Ecuaciones con paréntesis', concept: 'Simplifica si hace falta y aplica la misma operación en ambos miembros de la igualdad.',
    example: '3(x + 2) = 18. Divide ambos lados entre 3 para obtener x + 2 = 6 y resta 2. La solución es x = 4.',
    evidence: 'Lucía comprobó su respuesta sustituyendo 4 en la ecuación original.' },
  modelacion: { title: 'Modelar una situación', concept: 'Define la incógnita y distingue los cargos que se pagan una vez de los que se repiten.',
    example: 'Si hay Q 12 de envío y cada cuaderno cuesta Q 8, la compra de x cuadernos cuesta 12 + 8x. Al pagar Q 52, x = 5.',
    evidence: 'Lucía identificó el costo fijo y la tarifa, y comprobó que su solución tenía sentido en el contexto.' },
  integracion: { title: 'Resolver una compra', concept: 'Usa una ecuación para separar el costo de los kits, el forro y el envío.' },
}

function choice(prompt, options, key, explanation) {
  return { format: 'choice', prompt, options, key, explanation }
}

function number(prompt, key, explanation) {
  return { format: 'number', prompt, key, explanation, answerLabel: 'Respuesta' }
}

export const initialProblem = choice('¿Cuál es el resultado de desarrollar −2(x − 4)?',
  { ambos: '−2x + 8', signo: '−2x − 8', parcial: '−2x − 4' }, 'ambos', 'El −2 multiplica a x y a −4. El producto (−2)(−4) es +8.')

export const guides = {
  signo: { title: 'Revisar el signo de un producto', clue: 'Separa los factores con paréntesis. El producto de dos números negativos es positivo.',
    question: choice('En −3(x − 2), ¿cuánto vale el producto del factor de fuera por el término constante?',
      { a: '−6', b: '+6', c: '−2' }, 'b', 'Multiplica (−3) por (−2). Ambos factores son negativos y el resultado es +6.') },
  parcial: { title: 'Distribuir a cada término', clue: 'Escribe 4 · 2x y 4 · (−3) antes de juntar los dos resultados.',
    question: choice('¿Cómo queda 4(2x − 3) al multiplicar ambos términos?',
      { a: '8x − 3', b: '2x − 12', c: '8x − 12' }, 'c', 'El 4 multiplica por separado a 2x y a −3. Queda 8x − 12.') },
}

const variants = [
  choice('Desarrolla −4(2x − 3).', { a: '−8x − 12', b: '−8x − 3', c: '−8x + 12' }, 'c',
    'Los productos son (−4)(2x) = −8x y (−4)(−3) = +12.'),
  choice('Desarrolla −2(3x − 5).', { a: '−6x + 10', b: '−6x − 10', c: '−6x − 5' }, 'a',
    'Los productos son (−2)(3x) = −6x y (−2)(−5) = +10.'),
]

const context = 'Para un taller, el colegio compra tres kits iguales. Cada kit cuesta x quetzales más Q 4 por el forro. El envío total cuesta Q 6 y el colegio paga Q 48.'
export const integrator = {
  modelo: choice('¿Qué ecuación representa el precio total?',
    { a: '3(x + 4) + 6 = 48', b: '3x + 4 + 6 = 48', c: '3(x + 4 + 6) = 48' }, 'a',
    'El forro se paga por cada kit y el envío una vez por toda la compra.'),
  precio: number('¿Cuántos quetzales vale un kit sin forro?', 10,
    'Resta 6 a ambos lados, divide 42 entre 3 y resta 4. Al sustituir x = 10, el total es 3(10 + 4) + 6 = 48.'),
}

export const finalExam = {
  p1: number('Reduce 6a − 3b − 13a + 6b. ¿Cuál es el coeficiente de a?', -7, 'Los términos en a se combinan como (6 − 13)a = −7a.'),
  p2: choice('Expande −3(2x − 5).', { a: '−6x − 15', b: '−6x + 15', c: '−6x − 5' }, 'b',
    'Distribuye −3 a 2x y a −5. El segundo producto vale +15.'),
  p3: number('Resuelve 4(x + 3) = 36. ¿Cuál es el valor de x?', 6, 'Divide ambos miembros entre 4, obtén x + 3 = 9 y resta 3.'),
  p4: choice('Un pedido tiene envío de Q 15 y cuesta Q 5 por cuaderno. Si se pagaron Q 40, ¿qué ecuación permite hallar cuántos cuadernos c se compraron?',
    { a: '15c + 5 = 40', b: '15 + 5 + c = 40', c: '15 + 5c = 40' }, 'c', 'El envío se suma una vez y Q 5 se multiplica por la cantidad de cuadernos.'),
  p5: number('Un plan cuesta Q 8 fijos y Q 3 por uso. Otro cuesta Q 5 por uso. ¿Cuántos usos hacen que los dos planes cuesten lo mismo?', 4,
    'Iguala 8 + 3x con 5x. Al restar 3x de ambos lados queda 2x = 8. Los dos cuestan Q 20 cuando x = 4.'),
}

export const followUpProblem = choice('En esta visita posterior, desarrolla −5(2x − 4).',
  { a: '−10x + 20', b: '−10x − 20', c: '−10x − 4' }, 'a',
  'Los productos son (−5)(2x) = −10x y (−5)(−4) = +20.')

const proofOrder = ['respuesta', 'guiada', 'variante', 'autonoma', ...Object.keys(integrator), ...Object.keys(finalExam), 'retencion', 'solicitud']
const correct = response => response?.outcome === 'correct'

export function pitchRun(params) {
  const answers = Object.fromEntries(proofOrder.map(name => {
    const value = params.get(name) ?? ''
    return [name, value.length <= 28 ? value : 'Entrada demasiado larga']
  }).filter(([, value]) => value))
  const marked = (name, question) => answers[name] ? grade(question, answers[name]) : null
  const initial = marked('respuesta', initialProblem)
  const guide = initial?.outcome === 'incorrect' ? guides[initial.value] : null
  const guided = guide ? marked('guiada', guide.question) : null
  const canCheck = correct(initial) || correct(guided)
  const alternate = answers.variante === '1'
  const independentProblem = variants[Number(alternate)]
  const autonomous = canCheck ? marked('autonoma', independentProblem) : null
  const reviewDone = correct(autonomous)
  const markAll = problems => Object.fromEntries(Object.entries(problems).map(([name, problem]) => [name, marked(name, problem)]))
  const activity = reviewDone ? markAll(integrator) : {}
  const courseDone = reviewDone && Object.values(activity).every(correct)
  const exam = courseDone ? markAll(finalExam) : {}
  const complete = courseDone && Object.values(exam).every(item => item?.outcome)
  const score = complete ? Object.values(exam).filter(correct).length * 20 : null
  const followUp = score >= 90 ? marked('retencion', followUpProblem) : null
  return { answers, initial, guide, guided, canCheck, independentProblem, alternate, autonomous, reviewDone, activity, courseDone, exam, score, followUp }
}

export function pitchLocation(run, scene, options = {}) {
  const query = new URLSearchParams(Object.entries({ escena: scene, ...run.answers, ...options }).filter(([, value]) => value !== ''))
  return `/pitch?${query}`
}

export function pitchUrl(run, scene, options = {}) {
  return escape(pitchLocation(run, scene, options))
}

function questionField(name, question, value = '', error = '', position = 0) {
  const invalid = error ? ` aria-invalid="true" aria-describedby="pitch-error-${name}"` : ''
  const inputs = question.format === 'choice'
    ? Object.entries(question.options).map(([id, label]) => `<label class="option"><input required type="radio" name="${name}" value="${id}"${id === value ? ' checked' : ''}${invalid}> ${escape(label)}</label>`).join('')
    : `<label class="number">${question.answerLabel} <input name="${name}" maxlength="28" value="${escape(value)}" required${invalid}></label>`
  return `<fieldset><legend>${position ? `<span>Pregunta ${position}</span>` : ''}${escape(question.prompt)}</legend>${inputs}${error ? `<p class="error" id="pitch-error-${name}">${escape(error)}</p>` : ''}</fieldset>`
}

export function pitchForm(run, scene, problems, marked, submit, options = {}) {
  const cutoff = proofOrder.indexOf(Object.keys(problems)[0])
  const earlier = proofOrder.slice(0, cutoff)
  if (scene === 'metas') earlier.push('solicitud')
  const hidden = Object.fromEntries(earlier.filter(name => run.answers[name]).map(name => [name, run.answers[name]]))
  const exam = scene === 'examen'
  return `<form method="get" action="/pitch"${exam ? ' class="course-exam"' : ''}>${Object.entries({ escena: scene, ...hidden, ...options }).map(([name, value]) =>
    `<input type="hidden" name="${name}" value="${escape(value)}">`).join('')}
    ${Object.entries(problems).map(([name, problem], index) => questionField(name, problem, run.answers[name], marked[name]?.error, exam ? index + 1 : 0)).join('')}
    <button>${submit}</button></form>`
}

export function pitchFeedback(question, result) {
  return result?.outcome ? feedback(question, result) : ''
}

export function courseProgress(run) {
  const studied = run.courseDone ? 5 : 4
  return `<p class="pitch-progress"><strong>${studied} de 5 módulos cursados</strong><progress max="5" value="${studied}" aria-label="Módulos cursados"></progress></p>`
}

export function moduleStatus(id, run) {
  if (id === 'distributiva') {
    if (run.reviewDone) return 'Repaso superado'
    if (run.canCheck) return 'Comprobación sin pista pendiente'
    return run.guide ? 'Refuerzo asignado' : 'Repaso pendiente'
  }
  if (id === 'integracion') return run.courseDone ? 'Cursado' : run.reviewDone ? 'Disponible' : 'Pendiente de repaso previo'
  return 'Cursado'
}

export function modulePage(run, id) {
  const unit = units[id]
  const back = `<p><a href="${pitchUrl(run, 'ruta')}">Volver al mapa</a></p>`
  if (id !== 'integracion') {
    const review = id === 'distributiva' && !run.reviewDone
    return `<p class="course-status">${moduleStatus(id, run)}</p><p>${unit.concept}</p>
      <section class="course-example"><h2>Ejemplo resuelto</h2><p>${unit.example}</p></section>
      <details><summary>Evidencia de Lucía en esta unidad</summary><p>${unit.evidence}</p></details>
      ${review ? `<p>${link(pitchUrl(run, 'repaso'), 'Hacer el repaso asignado')}</p>` : ''}${back}`
  }
  if (!run.reviewDone) return `<p class="course-status">Repaso previo pendiente</p>
    <p>Completa un ejercicio nuevo sin pista para abrir este módulo.</p>
    <p>${link(pitchUrl(run, 'practica'), 'Ir a Práctica')}</p>${back}`
  return `<div class="course-example"><p>${context}</p></div>${run.courseDone ? `<h2>Problema de compra resuelto</h2>
    ${Object.entries(integrator).map(([name, problem]) => `<p><strong>${escape(problem.prompt)}</strong></p>${pitchFeedback(problem, run.activity[name])}`).join('')}
    <p>${link(pitchUrl(run, 'examen'), 'Presentar examen final')}</p>` : `${Object.values(run.activity).some(response => response?.outcome === 'incorrect')
      ? '<p class="error" role="alert">Revisa cuántas veces se paga el forro y cuántas veces se paga el envío. Inténtalo de nuevo.</p>' : ''}
      ${pitchForm(run, 'unidad', integrator, run.activity, 'Comprobar solución', { unidad: id })}`}${back}`
}

export function examPage(run) {
  if (!run.courseDone) return `<p class="pitch-callout">El examen se abre al resolver el problema de compra.</p><p>${link(pitchUrl(run, 'ruta'), 'Volver al mapa')}</p>`
  if (run.score === null) return `<p>Cinco problemas de 20 puntos sobre los temas del curso.</p>${pitchForm(run, 'examen', finalExam, run.exam, 'Calificar examen')}`
  const clearExam = Object.fromEntries([...Object.keys(finalExam), 'retencion', 'solicitud'].map(name => [name, '']))
  return `<p class="pitch-callout"><strong>${run.score} de 100</strong> en el examen final. ${run.score / 20} de 5 respuestas correctas.</p>
    <details><summary>Consultar respuestas y soluciones</summary><ol>${Object.entries(finalExam).map(([name, problem]) =>
      `<li><p>${escape(problem.prompt)}</p>${pitchFeedback(problem, run.exam[name])}</li>`).join('')}</ol></details>
    <div class="actions">${link(pitchUrl(run, 'metas'), 'Ver resultado de ingreso')}<a href="${pitchUrl(run, 'examen', clearExam)}">Volver a presentar</a></div>`
}
