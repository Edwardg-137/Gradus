const tablist = document.querySelector('#notebook-tabs');
const tabs = [...tablist.querySelectorAll('button')];
const panels = ['results', 'practice'].map((id) => document.getElementById(id));
const practiceShortcut = document.querySelector('#open-practice');

function selectTab(index, moveFocus = false) {
  tabs.forEach((tab, position) => {
    const selected = position === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panels[position].hidden = !selected;
  });
  if (moveFocus) tabs[index].focus();
}

tablist.setAttribute('role', 'tablist');
tablist.setAttribute('aria-label', 'Cuaderno');
tabs.forEach((tab, index) => {
  const panel = panels[index];
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', panel.id);
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  panel.tabIndex = 0;
  tab.addEventListener('click', () => selectTab(index));
  tab.addEventListener('keydown', (event) => {
    const targets = { ArrowLeft: 1 - index, ArrowRight: 1 - index, Home: 0, End: 1 };
    if (!Object.hasOwn(targets, event.key)) return;
    event.preventDefault();
    selectTab(targets[event.key], true);
  });
});
selectTab(0);
tablist.hidden = false;
practiceShortcut.hidden = false;
practiceShortcut.addEventListener('click', () => selectTab(1, true));

const form = document.querySelector('#answer-form');
const answer = document.querySelector('#answer');
const feedback = document.querySelector('#feedback');
const progress = document.querySelector('#practice-progress');
form.hidden = false;
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = answer.value.trim();
  const valid = /^[+-]?\d+(?:[.,]\d+)?$/.test(value);
  answer.setAttribute('aria-invalid', String(!valid));

  if (!valid) {
    feedback.textContent = 'Escribe un número, como 4 o 4,0.';
    answer.focus();
  } else if (Number(value.replace(',', '.')) === 4) {
    feedback.textContent = 'Correcto. Resta 3 y divide entre 2.';
    progress.textContent = 'Práctica completada';
  } else {
    feedback.textContent = 'Reintenta: resta 3 a ambos lados.';
  }
});
answer.addEventListener('input', () => {
  answer.removeAttribute('aria-invalid');
  feedback.textContent = '';
});

const note = document.querySelector('#note');
const noteStatus = document.querySelector('#note-status');
const noteKey = 'gradus.propuesta2.note';
note.closest('section').hidden = false;
try {
  note.value = localStorage.getItem(noteKey) ?? '';
} catch {
  noteStatus.textContent = 'Solo en esta sesión';
}
note.addEventListener('input', () => {
  try {
    localStorage.setItem(noteKey, note.value);
    noteStatus.textContent = 'Guardada aquí';
  } catch {
    noteStatus.textContent = 'Solo en esta sesión';
  }
});

const lamp = document.querySelector('#lamp');
const desk = document.querySelector('#escritorio');
lamp.parentElement.hidden = false;
lamp.addEventListener('click', () => {
  const turnOn = lamp.getAttribute('aria-pressed') === 'false';
  lamp.setAttribute('aria-pressed', String(turnOn));
  desk.dataset.light = turnOn ? 'on' : 'off';
});

const clock = document.querySelector('#clock-time');
const dial = document.querySelector('#dial');
const toggle = document.querySelector('#clock-toggle');
const reset = document.querySelector('#clock-reset');
const clockStatus = document.querySelector('#clock-status');
const sessionLength = 25 * 60 * 1000;
let remaining = sessionLength;
let deadline = null;
let ticker = null;

function paintClock() {
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  clock.textContent = [minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
  clock.dateTime = `PT${totalSeconds}S`;
  dial.style.setProperty('--remaining', `${remaining / sessionLength * 100}%`);
}

function stopClock() {
  clearInterval(ticker);
  ticker = null;
  deadline = null;
}

function updateClock() {
  if (deadline === null) return;
  remaining = Math.max(0, deadline - Date.now());
  paintClock();
  if (remaining > 0) return;
  stopClock();
  toggle.textContent = 'Iniciar';
  clockStatus.textContent = 'Sesión terminada';
}

toggle.addEventListener('click', () => {
  if (deadline !== null) {
    updateClock();
    if (deadline === null) return;
    stopClock();
    toggle.textContent = 'Continuar';
    clockStatus.textContent = 'En pausa';
    return;
  }
  if (remaining === 0) remaining = sessionLength;
  deadline = Date.now() + remaining;
  toggle.textContent = 'Pausar';
  clockStatus.textContent = '';
  reset.disabled = false;
  updateClock();
  ticker = setInterval(updateClock, 250);
});
reset.addEventListener('click', () => {
  stopClock();
  remaining = sessionLength;
  paintClock();
  toggle.textContent = 'Iniciar';
  clockStatus.textContent = '';
  toggle.focus();
  reset.disabled = true;
});
document.addEventListener('visibilitychange', updateClock);
clock.closest('section').hidden = false;

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && practiceShortcut.animate && !reducedMotion.matches) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio < .85) return;
    observer.disconnect();
    if (reducedMotion.matches || practiceShortcut.matches(':focus-visible')) return;
    const animation = practiceShortcut.animate(
      [{ opacity: .82, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 210, easing: 'cubic-bezier(.23, 1, .32, 1)' }
    );
    reducedMotion.addEventListener('change', () => animation.cancel(), { once: true });
  }, { threshold: .85 });
  observer.observe(practiceShortcut);
}

