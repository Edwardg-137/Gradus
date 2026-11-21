import { competencies, difficulties, dimensions, studyScope } from './study-content.js'
import { scopeMastery } from './study-mastery.js'
import { confidenceLabel, levelLabel, nextStudyQuestion, scopeLevel, testConfig, testTypes } from './study-tests.js'
import { button, escape, feedback, form, link, questionForm } from './views.js'

const dates = new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeZone: 'America/Guatemala' })
const reviewDates = new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Guatemala' })
const testPath = id => `/pruebas/${id}`
const retentionTitle = 'Comprobación de retención'

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
    ${account ? '' : `<p><a href="/perfil?volver=${encodeURIComponent(`${scope.path}/pruebas`)}">Crea un perfil o inicia sesión</a> para guardar tus pruebas y ver tu nivel.</p>`}
    ${Object.entries(testTypes).map(([type, config]) => {
      const previous = attempts.find(item => item.kind === scope.kind && item.scopeId === scope.id && item.type === type)
      const [min, max] = config.minutes.map(minutes => minutes * size)
      const description = type === 'rapida'
        ? 'Estima tu nivel con conceptos, detección de errores y ejercicios breves.'
        : 'Comprueba procedimientos, decisiones en contexto y sus justificaciones.'
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

export function masteryLine(scope, profiles, at) {
  const { label, firm } = scopeMastery(scope, profiles, at)
  const detail = scope.kind === 'categorias' ? ` · ${firm} de ${scope.competencies.length} competencias firmes` : ''
  return `<p>Dominio · <strong>${label}</strong>${detail}</p>`
}

export function masterySection(scope, profiles, attempts, token, at) {
  const overview = masteryLine(scope, profiles, at)
  if (scope.kind === 'categorias') return `<section id="dominio">${overview}<p>La categoría está firme cuando todas sus competencias lo están.</p></section>`
  const state = profiles[scope.id]
  const check = attempts.find(item => item.scopeId === scope.id && item.type === 'retencion')
  let next = '<p>La prueba completa puede iniciar la consolidación al demostrar comprensión, procedimiento y aplicación autónoma.</p>'
  if (state?.nextCheckAt) {
    const date = `<time datetime="${state.nextCheckAt}">${reviewDates.format(new Date(state.nextCheckAt))}</time>`
    const completed = `<p>${Math.min(state.checks, 2)} de 2 comprobaciones iniciales superadas.</p>`
    next = `${completed}<p>Próxima comprobación desde ${date} (hora de Guatemala).</p>`
    if (state.nextCheckAt <= at) next += check && !check.completedAt ? link(testPath(check.id), 'Retomar comprobación')
      : form(token, `${scope.path}/retencion`, `<input type="hidden" name="previous" value="${check?.id ?? ''}">${button('Comprobar retención')}`)
  }
  return `<section id="dominio">${overview}${next}</section>`
}

export function studyAttemptPage(attempt, token, input, mastery = '') {
  const scope = studyScope(attempt.kind, attempt.scopeId)
  const retention = attempt.type === 'retencion'
  const type = retention ? { title: retentionTitle } : testConfig(attempt.type, attempt.version)
  const heading = `<p>${scope.title} · <a href="${scope.path}${retention ? '#dominio' : '/pruebas'}">${retention ? 'Volver al dominio' : 'Elegir tipo de prueba'}</a></p><h1>${type.title}</h1>`
  if (!attempt.completedAt) {
    const question = nextStudyQuestion(attempt)
    const position = attempt.questions.indexOf(question) + 1
    return `${heading}<p>${competencies[question.competencyId].title} · ${difficulties[question.difficulty]}</p>
      <h2>Pregunta ${position} de ${attempt.questions.length}</h2>
      ${questionForm(question, token, `${testPath(attempt.id)}/responder`, { ...input, canSkip: true })}`
  }

  if (retention) {
    const result = attempt.result.retention
    return `${heading}<h2>${result.passed ? 'Comprobación superada' : 'Conviene reforzar'}</h2>
      <p>${result.correct} de ${result.total} problemas resueltos con el procedimiento correcto.</p>${mastery}
      <details><summary>Ver respuestas y soluciones</summary><ol class="evidence">${attempt.questions.map(question =>
        `<li><p>${escape(question.prompt)}</p>${feedback(question, attempt.answers[question.id])}</li>`).join('')}</ol></details>
      <p>${link(`${scope.path}#dominio`, 'Consultar mi dominio')}</p>`
  }
  const results = attempt.result.competencies
  return `${heading}<p><time datetime="${attempt.completedAt}">${dates.format(new Date(attempt.completedAt))}</time></p>
    ${scope.kind === 'categorias' ? studyLevel(scopeLevel(scope, results)) : ''}
    ${mastery}
    <p>${attempt.type === 'rapida'
      ? 'Estimación orientativa. La prueba completa aporta evidencia de aplicación y puede estimar el nivel avanzado.'
      : 'La prueba completa estima el nivel. Las comprobaciones posteriores confirman que puedes aplicar lo aprendido con el paso del tiempo.'}</p>
    <p>Cada dificultad requiere ${type.minimumCorrect} de ${type.plan.length} aciertos y al menos uno por dimensión evaluada.</p>
    ${attempt.type === 'completa' && attempt.version >= 2 ? '<p>También cuenta la justificación del problema de aplicación de cada dificultad.</p>' : ''}
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
    <p>${link(`${scope.path}/pruebas`, 'Volver a las pruebas')}</p>`
}

export function recentStudyAttempts(attempts) {
  if (!attempts.length) return ''
  return `<section><h2>Pruebas recientes</h2><ul>${attempts.slice(0, 6).map(attempt => {
    const scope = studyScope(attempt.kind, attempt.scopeId)
    const date = attempt.completedAt ?? attempt.createdAt
    const retention = attempt.type === 'retencion'
    const title = retention ? retentionTitle : testTypes[attempt.type].title
    const state = !attempt.completedAt ? 'En curso' : retention
      ? attempt.result.retention.passed ? 'Superada' : 'Requiere refuerzo'
      : levelLabel(scopeLevel(scope, attempt.result.competencies))
    return `<li><a href="${testPath(attempt.id)}">${scope.title} · ${title.toLowerCase()}</a>
      <p class="muted">${state} · <time datetime="${date}">${dates.format(new Date(date))}</time></p></li>`
  }).join('')}</ul></section>`
}
