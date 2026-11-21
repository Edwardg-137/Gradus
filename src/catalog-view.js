import { courses, modules, skills } from './content.js'
import { escape } from './views.js'

export function catalog(hasResult) {
  return `<h1>Catálogo de cursos</h1>
  ${Object.entries(courses).map(([id, course]) => `<section>
    <h2><a href="/cursos/${id}">${escape(course.title)}</a></h2><p>${escape(course.objective)}</p>
  </section>`).join('')}
  ${hasResult ? '<p><a href="/resultado">Volver a mi resultado</a></p>' : ''}`
}

export function coursePage(course) {
  return `<p><a href="/catalogo">Catálogo de cursos</a></p><h1>${escape(course.title)}</h1>
  <p>${escape(course.objective)}</p><h2>Módulos</h2>
  <ul>${course.modules.map(id => `<li><a href="/modulos/${id}">${escape(modules[id].title)}</a>
    <p class="muted">Habilidad · ${escape(skills[modules[id].skill])}</p></li>`).join('')}</ul>`
}
