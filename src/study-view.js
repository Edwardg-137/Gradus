import { categories, competencies, difficulties, dimensions, practiceTemplateCount, studyScope } from './study-content.js'
import { scopeLevel } from './study-tests.js'
import { studyLevel } from './study-test-view.js'
import { escape, feedback, questionForm } from './views.js'

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

function lessonLinks(ids) {
  return Object.entries(difficulties).map(([difficulty, label]) => `<section><h2>${label}</h2>
    <ul>${ids.map(id => {
      const competency = studyScope('competencias', id)
      return `<li><a href="${competency.path}/${difficulty}">${competency.title} · ${label}</a></li>`
    }).join('')}</ul></section>`).join('')
}

export function studyScopePage(scope, current, tests) {
  const intro = scope.kind === 'categorias'
    ? `<p><a href="/estudio">Matemáticas</a></p><h1>${scope.title}</h1>
      ${studyLevel(scopeLevel(scope, current))}
      <h2>Competencias</h2><ul>${scope.competencies.map(id => competencyLink(id, current)).join('')}</ul>`
    : `<p><a href="/estudio/categorias/${scope.category}">${categories[scope.category].title}</a></p>
      <h1>${scope.title}</h1><p>${escape(scope.description)}</p>${studyLevel(current[scope.id])}`
  return `${intro}${tests}${lessonLinks(scope.competencies)}`
}

export function lessonPage(scope, difficulty, index, question, token, input) {
  const lesson = competencies[scope.id].lessons[difficulty]
  const path = `${scope.path}/${difficulty}`
  const activity = input?.response ? `<p>${escape(question.prompt)}</p>${feedback(question, input.response)}`
    : questionForm(question, token, `${path}?ejercicio=${index + 1}`, input)
  return `<p><a href="${scope.path}">${scope.title}</a></p>
    <h1>${scope.title} · ${difficulties[difficulty]}</h1>
    <p>${escape(lesson.concept)}</p><h2>Ejemplo resuelto</h2><p>${escape(lesson.example)}</p>
    <section><h2>Ejercicio ${index + 1} de ${practiceTemplateCount}</h2>
    <p class="muted">${dimensions[question.dimension]} · ${escape(question.indicator)}</p>${activity}</section>
    <nav class="actions exercise-links" aria-label="Ejercicios de práctica">
    ${lesson.templates.slice(0, practiceTemplateCount).map((_, position) => `<a href="${path}?ejercicio=${position + 1}"
      ${index === position ? 'aria-current="step"' : ''}>Ejercicio ${position + 1}</a>`).join('')}</nav>`
}
