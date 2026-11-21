import { competencies, difficulties, dimensions, studyScope } from './study-content.js'
import { confidenceLabel, levelLabel, nextStudyQuestion, scopeLevel, testTypes } from './study-tests.js'
import { button, escape, feedback, form, link, questionForm } from './views.js'

const dates = new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeZone: 'America/Guatemala' })
const testPath = id => `/pruebas/${id}`

export function studyLevel(result) {
  const enough = result && result.level !== null
  const detail = enough ? ` · Confianza ${confidenceLabel(result)}`
    : result?.required ? ` · ${result.observed} de ${result.required} competencias con nivel` : ''
  return `<p>Nivel estimado · <strong>${levelLabel(result)}</strong>${detail}
    ${result?.attemptId ? ` · <a href="${testPath(result.attemptId)}">Ver prueba</a>` : ''}</p>`
}

export function studyTestOptions(scope, account, attempts, token) {
  const size = scope.competencies.length
  return `<section id="pruebas"><h2>Pruebas</h2>
    ${account ? '' : '<p><a href="/perfil">Crea un perfil o inicia sesión</a> para guardar tus pruebas y ver tu nivel.</p>'}
    ${Object.entries(testTypes).map(([type, config]) => {
      const previous = attempts.find(item => item.kind === scope.kind && item.scopeId === scope.id && item.type === type)
      const [min, max] = config.minutes.map(minutes => minutes * size)
      const description = type === 'rapida'
        ? 'Estima tu nivel con preguntas de conceptos y ejercicios breves.'
        : 'Examina conceptos, procedimientos y problemas de aplicación.'
      let action = ''
      if (account) {
        action = previous && !previous.completedAt ? link(testPath(previous.id), `Retomar ${config.title.toLowerCase()}`)
          : form(token, `${scope.path}/pruebas/${type}`, `<input type="hidden" name="previous" value="${previous?.id ?? ''}">
            ${button(previous ? `Repetir ${config.title.toLowerCase()}` : `Iniciar ${config.title.toLowerCase()}`)}`)
      }
      return `<div class="test-option"><h3>${config.title}</h3><p>${description}</p>
        <p>${config.plan.length * Object.keys(difficulties).length * size} preguntas · ${min}–${max} min estimados</p>${action}
        ${previous?.completedAt ? `<p><a href="${testPath(previous.id)}">Ver última ${config.title.toLowerCase()}</a></p>` : ''}</div>`
    }).join('')}</section>`
}

export function studyAttemptPage(attempt, token, input) {
  const scope = studyScope(attempt.kind, attempt.scopeId)
  const type = testTypes[attempt.type]
  const heading = `<p><a href="${scope.path}">${scope.title}</a></p><h1>${type.title}</h1>`
  if (!attempt.completedAt) {
    const question = nextStudyQuestion(attempt)
    const position = attempt.questions.indexOf(question) + 1
    return `${heading}<p>${competencies[question.competencyId].title} · ${difficulties[question.difficulty]}</p>
      <h2>Pregunta ${position} de ${attempt.questions.length}</h2>
      ${questionForm(question, token, `${testPath(attempt.id)}/responder`, { ...input, canSkip: true })}`
  }

  const results = attempt.result.competencies
  return `${heading}<p><time datetime="${attempt.completedAt}">${dates.format(new Date(attempt.completedAt))}</time></p>
    ${scope.kind === 'categorias' ? studyLevel(scopeLevel(scope, results)) : ''}
    <p>${attempt.type === 'rapida'
      ? 'Estimación orientativa. La prueba completa aporta evidencia de aplicación y puede estimar el nivel avanzado.'
      : 'Estimación basada en los ejercicios de esta prueba y en la cobertura de sus tres dimensiones.'}</p>
    <p>Cada dificultad requiere ${type.minimumCorrect} de ${type.plan.length} aciertos y al menos uno por dimensión evaluada.</p>
    ${Object.entries(results).map(([id, item]) => `<section><h2>${competencies[id].title}</h2>
      ${studyLevel(item)}
      <p>${item.totals.correct} de ${item.totals.total} respuestas correctas${item.totals.answered < item.totals.total
        ? ` · ${item.totals.total - item.totals.answered} sin resolver` : ''}</p>
      <details><summary>Ver evidencia por dificultad</summary><ul>${Object.entries(item.breakdown).map(([difficulty, band]) =>
        `<li><strong>${difficulties[difficulty]}</strong> · ${band.correct} de ${band.total} correctas<ul>${Object.entries(band.coverage)
          .map(([dimension, stat]) => `<li>${dimensions[dimension]} · ${stat.correct} de ${stat.total}</li>`).join('')}</ul></li>`).join('')}</ul></details>
      <details><summary>Ver respuestas y soluciones</summary><ol class="evidence">${attempt.questions.filter(question => question.competencyId === id)
        .map(question => `<li><p>${escape(question.prompt)}</p>${feedback(question, attempt.answers[question.id])}</li>`).join('')}</ol></details>
      <p><a href="/estudio/competencias/${id}/${item.recommendedDifficulty}">Practicar ${difficulties[item.recommendedDifficulty].toLowerCase()}</a></p>
    </section>`).join('')}
    <p>${link(`${scope.path}#pruebas`, 'Volver a las pruebas')}</p>`
}

export function recentStudyAttempts(attempts) {
  if (!attempts.length) return ''
  return `<section><h2>Pruebas recientes</h2><ul>${attempts.slice(0, 6).map(attempt => {
    const scope = studyScope(attempt.kind, attempt.scopeId)
    const date = attempt.completedAt ?? attempt.createdAt
    const state = attempt.completedAt ? levelLabel(scopeLevel(scope, attempt.result.competencies)) : 'En curso'
    return `<li><a href="${testPath(attempt.id)}">${scope.title} · ${testTypes[attempt.type].title.toLowerCase()}</a>
      <p class="muted">${state} · <time datetime="${date}">${dates.format(new Date(date))}</time></p></li>`
  }).join('')}</ul></section>`
}
