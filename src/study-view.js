import { categories, competencies, difficulties, studyScope } from './study-content.js'
import { lessonModes } from './study-lessons.js'
import { scopeLevel } from './study-tests.js'
import { studyLevel } from './study-test-view.js'
import { escape, feedback, form, link, questionForm } from './views.js'

export function studyIndex(current) {
  return `<h1>Estudio</h1><p>Explora las categorías de Matemáticas y practica por dificultad.</p>
    ${Object.keys(categories).map(id => {
      const category = studyScope('categorias', id)
      return `<section><h2><a href="${category.path}">${category.title}</a></h2>
        ${studyLevel(scopeLevel(category, current))}
        <ul>${category.competencies.map(competencyId => competencyLink(competencyId, current)).join('')}</ul></section>`
    }).join('')}`
}

function competencyLink(id, current) {
  const competency = studyScope('competencias', id)
  return `<li><a href="${competency.path}">${competency.title}</a>${studyLevel(current[id])}</li>`
}

function lessonLinks(scope) {
  return `<section><h2>Lecciones de práctica</h2><ul>${Object.entries(difficulties).map(([difficulty, label]) =>
    `<li><a href="${scope.path}/${difficulty}">${scope.title} · ${label}</a></li>`).join('')}</ul></section>`
}

export function studyScopePage(scope, current, tests) {
  const intro = scope.kind === 'categorias'
    ? `<p><a href="/estudio">Matemáticas</a></p><h1>${scope.title}</h1>
      ${studyLevel(scopeLevel(scope, current))}
      <h2>Competencias</h2><ul>${scope.competencies.map(id => competencyLink(id, current)).join('')}</ul>`
    : `<p><a href="/estudio/categorias/${scope.category}">${categories[scope.category].title}</a></p>
      <h1>${scope.title}</h1><p>${escape(scope.description)}</p>${studyLevel(current[scope.id])}`
  return `${intro}${tests}${lessonLinks(scope)}`
}

export function lessonChooser(scope, difficulty) {
  const path = `${scope.path}/${difficulty}`
  return `<p><a href="${scope.path}">${scope.title}</a></p>
    <h1>${scope.title} · ${difficulties[difficulty]}</h1><h2>Elige una lección</h2>
    ${Object.entries(lessonModes).map(([mode, option]) => `<section><h3>${link(`${path}/${mode}`, option.title)}</h3>
      <p>${option.description}</p></section>`).join('')}`
}

export function lessonPage(scope, difficulty, mode, round, token, input) {
  const base = `${scope.path}/${difficulty}`
  const path = `${base}/${mode}`
  const title = lessonModes[mode].title
  const heading = `<p><a href="${base}">Cambiar tipo de lección</a></p><h1>${title}</h1>
    <p>${scope.title} · ${difficulties[difficulty]}</p>`
  const roundField = `<input type="hidden" name="round" value="${round?.id ?? ''}">`
  const start = form(token, path, `${roundField}<button name="intent" value="start">${round ? 'Repetir lección' : 'Empezar lección'}</button>`)
  if (!round) return `${heading}<p>${lessonModes[mode].description}</p>${start}`
  if (round.completedAt) {
    const solved = round.steps.filter(step => step.kind === 'exercise')
    const correct = solved.filter(step => step.answer.outcome === 'correct' && !step.help).length
    return `${heading}<h2>Lección completada</h2><p>${correct} de ${solved.length} actividades resueltas sin pista registrada.</p>
      <p>La práctica prepara la comprobación de tu dominio.</p><div class="actions">${start}
      ${link(`${scope.path}/pruebas`, 'Elegir una prueba')}</div>`
  }
  const step = round.steps[round.step]
  const hidden = `${roundField}<input type="hidden" name="step" value="${round.step}">`
  const next = form(token, path, `${hidden}<button name="intent" value="next">${round.step + 1 === round.steps.length ? 'Terminar lección' : 'Continuar'}</button>`)
  const reference = `<p>${escape(step.concept)}</p><h3>Ejemplo resuelto</h3><p>${escape(step.example)}</p>`
  const attribution = `<p><a href="https://github.com/Edwardg-137/nexora_content/blob/d9397b19806f952827f0b1bbcba2fa0314338978/${step.source}">Lección de referencia en Nexora</a></p>`
  const progress = `<p class="muted">Paso ${round.step + 1} de ${round.steps.length} · ${competencies[step.competencyId].title}</p>`
  if (step.kind === 'intro') return `${heading}${progress}<h2>Concepto</h2>${reference}${attribution}${next}`

  const question = step.question
  const selected = `<input type="hidden" name="instance" value="${question.id}">`
  const activity = step.answer ? `<p>${escape(question.prompt)}</p>${step.answer.revealed
    ? `<p><strong>Solución</strong></p><p>${escape(question.explanation)}</p>` : feedback(question, step.answer)}${next}`
    : `${step.help ? `<p><strong>Pista</strong> · ${escape(step.hint)}</p>` : ''}
      ${questionForm(question, token, path, { ...input, extraFields: hidden, canSkip: true })}
      ${form(token, path, `${hidden}${selected}<div class="actions">
      ${step.help ? '' : '<button class="secondary" name="intent" value="hint">Pedir pista</button>'}
      <button class="secondary" name="intent" value="reveal">Ver solución</button></div>`)}`
  return `${heading}${progress}<h2>Actividad</h2><details><summary>Consultar concepto y ejemplo</summary>${reference}</details>
    <section>${activity}</section>`
}
