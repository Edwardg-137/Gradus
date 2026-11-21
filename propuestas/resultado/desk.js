const form = document.querySelector('#answer-form');
const answer = document.querySelector('#answer');
const feedback = document.querySelector('#feedback');
const feedbackIcon = feedback.querySelector('.feedback-icon');
const feedbackText = document.querySelector('#feedback-text');

function showFeedback(state, icon, message) {
  feedback.dataset.state = state;
  feedbackIcon.textContent = icon;
  feedbackText.textContent = message;
}

form.hidden = false;

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = answer.value.trim();
  const valid = /^[+-]?\d+(?:[.,]\d+)?$/.test(value);
  const correct = valid && Number(value.replace(',', '.')) === 4;

  answer.setAttribute('aria-invalid', String(!valid));
  if (!valid) {
    showFeedback('invalid', '!', 'Escribe un número, como 4 o 4,0.');
    answer.focus();
  } else if (correct) {
    showFeedback('correct', '✓', 'Correcto. Resta 3 y divide entre 2.');
  } else {
    showFeedback('retry', '↺', 'Reintenta: resta 3 a ambos lados.');
  }
});

answer.addEventListener('input', () => {
  answer.removeAttribute('aria-invalid');
  showFeedback('', '', '');
});

const practiceTitle = document.querySelector('#practice-title');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

if ('IntersectionObserver' in window && practiceTitle.animate && !reduceMotion.matches) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio < 0.8) return;

    observer.disconnect();
    if (reduceMotion.matches || location.hash === '#practica') return;

    const animation = practiceTitle.animate(
      [{ transform: 'translateY(5px)', opacity: .8 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 220, easing: 'cubic-bezier(.23, 1, .32, 1)' }
    );
    reduceMotion.addEventListener('change', () => animation.cancel(), { once: true });
  }, { threshold: 0.8 });

  observer.observe(practiceTitle);
}
