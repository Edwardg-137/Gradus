import { topic } from './content.js'
import { escape } from './views.js'

const destinations = [['/estudio', 'Estudio'], ['/catalogo', 'Catálogo'], ['/historial', 'Mi historial'], ['/perfil', 'Mi perfil']]

function sectionPath(pathname) {
  if (pathname.startsWith('/estudio') || pathname.startsWith('/pruebas')) return '/estudio'
  if (/^\/(catalogo|cursos|modulos)(\/|$)/.test(pathname)) return '/catalogo'
  if (pathname.startsWith('/perfil')) return '/perfil'
  return pathname
}

function diagnosticBookmark(progress) {
  const result = progress?.initial?.result
  if (!result) {
    return `<div class="bookmark"><p>Diagnóstico inicial</p><strong class="bookmark-state">${progress?.initial ? 'En curso' : 'Por empezar'}</strong></div>`
  }
  const skills = Object.values(result.skills)
  const total = skills.reduce((sum, skill) => sum + skill.evidence.length, 0)
  const correct = skills.reduce((sum, skill) => sum + skill.correct, 0)
  const practice = progress.practice?.[result.recommendation.moduleId]
  const completed = practice?.rounds.some(round => round.completedAt)
  return `<div class="bookmark"><p>Diagnóstico inicial</p>
    <strong class="bookmark-score">${correct}/${total} <span>aciertos</span></strong>
    <div class="bookmark-marks" aria-hidden="true">${Array.from({ length: total }, (_, index) => `<i${index < correct ? ' class="is-hit"' : ''}></i>`).join('')}</div>
    <p>${completed ? 'Práctica completada' : 'Práctica pendiente'}</p></div>`
}

function overview(title, path, progress) {
  const labels = {
    '/estudio': ['Cuaderno de estudio', 'Matemáticas'],
    '/catalogo': ['Cuaderno de estudio', 'Cursos y práctica'],
    '/historial': ['Matemáticas', 'Mi progreso'],
    '/perfil': ['Gradus', 'Mi espacio'],
    '/pitch': ['Pitch de Gradus', 'De básico a diversificado'],
  }
  const current = sectionPath(path)
  const diagnostic = path === '/' || /^\/(evaluacion|reevaluacion|resultado)(\/|$)/.test(path)
  const [label, heading] = diagnostic ? [topic.area, topic.title] : labels[current] ?? ['Gradus', 'Cuaderno de estudio']
  const headingTag = path === '/' && title === 'Inicio' ? 'h1' : 'p'
  return `<div class="leaf overview"><p class="desk-subject">${label}</p>
    <${headingTag} class="desk-title">${heading}</${headingTag}>${diagnostic ? diagnosticBookmark(progress) : ''}</div>`
}

function diagnosticTabs(path, progress) {
  const recommended = progress?.initial?.result?.recommendation.moduleId
  if (!recommended) return ''
  const module = `/modulos/${recommended}`
  const result = path === '/resultado'
  if (!result && path !== module && !path.startsWith(`${module}/`)) return ''
  return `<nav class="notebook-tabs" aria-label="Diagnóstico y práctica">
    <a href="/resultado"${result ? ' aria-current="page"' : ''}>Resultado</a>
    <a href="${module}"${result ? '' : ' aria-current="page"'}>Práctica</a></nav>`
}

function deskTools(storageKey, allowNote) {
  return `<aside class="desk-tools" aria-label="Herramientas del escritorio" data-desk-key="${storageKey}" hidden>
    <button class="lamp" id="desk-lamp" type="button" aria-label="Lámpara de lectura" aria-pressed="true">
      <svg viewBox="0 0 176 164" aria-hidden="true">
        <path class="lamp-arm-shadow" d="M128 130 L137 67 L92 36"/>
        <path class="lamp-arm" d="M128 130 L137 67 L92 36"/>
        <circle class="lamp-joint" cx="137" cy="67" r="9"/>
        <rect class="lamp-base" x="94" y="115" width="68" height="38" rx="18"/>
        <circle class="lamp-switch" cx="129" cy="134" r="6"/>
        <path class="lamp-shade" d="M82 20 Q102 35 100 59 L56 91 28 52 72 20 Q77 16 82 20Z"/>
        <ellipse class="lamp-mouth" cx="42" cy="72" rx="11" ry="24" transform="rotate(-36 42 72)"/>
      </svg><span>Lámpara</span>
    </button>
    <section class="clock" aria-labelledby="desk-clock-title">
      <h2 id="desk-clock-title">Concentración</h2>
      <div class="dial" id="desk-dial"><time id="desk-time" datetime="PT25M" role="timer" aria-live="off">25:00</time></div>
      <div class="clock-controls">
        <button class="secondary" id="desk-start" type="button">Iniciar</button>
        <button class="secondary" id="desk-reset" type="button" aria-label="Reiniciar reloj" title="Reiniciar reloj" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11a8 8 0 1 1 2 6m-2-6V5m0 6h6"/></svg>
        </button>
      </div>
      <p class="tool-status" id="desk-clock-status" role="status"></p>
    </section>
    ${allowNote ? `<section class="sticky" aria-labelledby="desk-note-title">
      <h2><label for="desk-note" id="desk-note-title">Nota adhesiva</label></h2>
      <textarea id="desk-note" rows="3" maxlength="240" placeholder="Para recordar…" aria-describedby="desk-note-status"></textarea>
      <p class="tool-status" id="desk-note-status">En este navegador</p>
    </section>` : ''}
  </aside>`
}

export function layout(title, body, { pathname = '/', progress, storageKey, testing = false } = {}) {
  const current = sectionPath(pathname)
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#e7e5dd">
  <title>${escape(title)} · Gradus</title>
  <link rel="stylesheet" href="/estilos.css">
  ${storageKey ? '<script src="/escritorio.js" defer></script>' : ''}
</head>
<body>
  <a class="skip" href="#contenido">Ir al contenido</a>
  <header class="masthead">
    <a class="brand" href="/"${pathname === '/' ? ' aria-current="page"' : ''}>Gradus</a>
    <nav aria-label="Principal">${destinations.map(([url, label]) => `<a href="${url}"${url === current
      ? ` aria-current="${url === pathname ? 'page' : 'location'}"` : ''}>${label}</a>`).join('')}</nav>
  </header>
  <main id="contenido" class="desk" tabindex="-1">
    <div class="notebook">${overview(title, pathname, progress)}
      <div class="leaf working">${diagnosticTabs(pathname, progress)}${body}</div></div>
    ${storageKey ? deskTools(storageKey, !testing) : ''}
  </main>
</body>
</html>`
}
