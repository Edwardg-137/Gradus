const desk = document.querySelector('.desk')
const tools = document.querySelector('.desk-tools')
const prefix = `gradus.desk.${tools.dataset.deskKey}.`

function read(key) {
  try { return localStorage.getItem(prefix + key) } catch { return null }
}

function save(key, value) {
  try {
    localStorage.setItem(prefix + key, value)
    return true
  } catch { return false }
}

const lamp = document.querySelector('#desk-lamp')
function light(on) {
  desk.dataset.light = on ? 'on' : 'off'
  lamp.setAttribute('aria-pressed', String(on))
}
light(read('light') !== 'off')
lamp.addEventListener('click', () => {
  light(desk.dataset.light === 'off')
  save('light', desk.dataset.light)
})

const note = document.querySelector('#desk-note')
if (note) {
  const status = document.querySelector('#desk-note-status')
  note.value = read('note') ?? ''
  note.addEventListener('input', () => {
    status.textContent = save('note', note.value) ? 'Guardada en este navegador' : 'Disponible mientras esta página esté abierta'
  })
}

const duration = 25 * 60 * 1000
const time = document.querySelector('#desk-time')
const dial = document.querySelector('#desk-dial')
const start = document.querySelector('#desk-start')
const reset = document.querySelector('#desk-reset')
const status = document.querySelector('#desk-clock-status')
let clock = { left: duration, deadline: null }
let tick

function restoreClock() {
  try {
    const saved = JSON.parse(read('clock'))
    if (saved && Number.isFinite(saved.left) && saved.left >= 0 && saved.left <= duration &&
        (saved.deadline === null || Number.isFinite(saved.deadline))) clock = saved
  } catch { /* Use the default clock when storage is unavailable. */ }
}

function setClock(left, deadline = null) {
  clock = { left, deadline }
  save('clock', JSON.stringify(clock))
}

function paintClock() {
  clearTimeout(tick)
  const running = clock.deadline !== null
  const remaining = running ? Math.min(duration, Math.max(0, clock.deadline - Date.now())) : clock.left
  if (running && remaining === 0) setClock(0)
  const seconds = Math.ceil(remaining / 1000)
  time.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  time.dateTime = `PT${seconds}S`
  dial.style.setProperty('--remaining', `${remaining / duration * 100}%`)
  const paused = remaining > 0 && remaining < duration
  const label = clock.deadline !== null ? 'Pausar' : paused ? 'Continuar' : 'Iniciar'
  if (start.textContent !== label) start.textContent = label
  reset.disabled = clock.deadline === null && remaining === duration
  const announcement = remaining === 0 ? 'Sesión terminada' : clock.deadline === null && paused ? 'En pausa' : ''
  if (status.textContent !== announcement) status.textContent = announcement
  if (clock.deadline !== null) tick = setTimeout(paintClock, 250)
}

start.addEventListener('click', () => {
  if (clock.deadline !== null) setClock(Math.max(0, clock.deadline - Date.now()))
  else {
    const left = clock.left || duration
    setClock(left, Date.now() + left)
  }
  paintClock()
})
reset.addEventListener('click', () => {
  setClock(duration)
  start.focus()
  paintClock()
})

function refresh() {
  restoreClock()
  paintClock()
}
document.addEventListener('visibilitychange', paintClock)
window.addEventListener('pageshow', refresh)
window.addEventListener('storage', event => {
  if (event.key === prefix + 'clock') refresh()
})

refresh()
tools.hidden = false
desk.dataset.interactive = ''
