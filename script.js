const screens = [...document.querySelectorAll('.screen')];
const selectedTime = { value: '' };

function showScreen(id) {
  screens.forEach((screen) => {
    const active = screen.id === id;
    screen.classList.toggle('is-active', active);
    screen.setAttribute('aria-hidden', String(!active));
  });
}

document.querySelector('.envelope-button').addEventListener('click', () => {
  showScreen('invite-screen');
});

document.querySelector('#yes-button').addEventListener('click', () => {
  showScreen('plan-screen');
});

const noButton = document.querySelector('#no-button');

function dodgeNoButton(event) {
  if (event.cancelable) event.preventDefault();

  const invitation = document.querySelector('.question-card').getBoundingClientRect();
  const buttonWidth = noButton.offsetWidth;
  const buttonHeight = noButton.offsetHeight;
  const margin = 18;
  const minLeft = invitation.left + margin;
  const minTop = invitation.top + margin;
  const maxLeft = Math.max(minLeft, invitation.right - buttonWidth - margin);
  const maxTop = Math.max(minTop, invitation.bottom - buttonHeight - margin);
  const pointerX = Number.isFinite(event.clientX) ? event.clientX : window.innerWidth / 2;
  const pointerY = Number.isFinite(event.clientY) ? event.clientY : window.innerHeight / 2;
  const yesButton = document.querySelector('#yes-button');
  const yesBounds = yesButton.getBoundingClientRect();
  const bestPosition = { left: minLeft, top: minTop, distance: -1 };

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const left = Math.round(minLeft + Math.random() * (maxLeft - minLeft));
    const top = Math.round(minTop + Math.random() * (maxTop - minTop));
    const overlapsYes = left < yesBounds.right
      && left + buttonWidth > yesBounds.left
      && top < yesBounds.bottom
      && top + buttonHeight > yesBounds.top;
    if (overlapsYes) continue;

    const distance = Math.hypot(left + buttonWidth / 2 - pointerX, top + buttonHeight / 2 - pointerY);
    if (distance > bestPosition.distance) Object.assign(bestPosition, { left, top, distance });
  }

  noButton.style.position = 'fixed';
  noButton.style.zIndex = '10';
  noButton.style.left = `${bestPosition.left}px`;
  noButton.style.top = `${bestPosition.top}px`;
}

noButton.addEventListener('pointerenter', dodgeNoButton);
noButton.addEventListener('pointerdown', dodgeNoButton);
noButton.addEventListener('touchstart', dodgeNoButton, { passive: false });
noButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  dodgeNoButton(event);
});
noButton.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') dodgeNoButton(event);
});

window.addEventListener('resize', () => {
  if (noButton.style.position !== 'fixed' || !document.querySelector('#invite-screen').classList.contains('is-active')) return;
  const invitation = document.querySelector('.question-card').getBoundingClientRect();
  const margin = 18;
  const minLeft = invitation.left + margin;
  const minTop = invitation.top + margin;
  const maxLeft = Math.max(minLeft, invitation.right - noButton.offsetWidth - margin);
  const maxTop = Math.max(minTop, invitation.bottom - noButton.offsetHeight - margin);
  const left = Math.max(minLeft, Math.min(parseFloat(noButton.style.left), maxLeft));
  const top = Math.max(minTop, Math.min(parseFloat(noButton.style.top), maxTop));
  noButton.style.left = `${left}px`;
  noButton.style.top = `${top}px`;
});

document.querySelectorAll('.time-option').forEach((option) => {
  option.addEventListener('click', () => {
    selectedTime.value = option.dataset.time;
    document.querySelectorAll('.time-option').forEach((button) => {
      const selected = button === option;
      button.setAttribute('aria-checked', String(selected));
    });
    document.querySelector('#form-feedback').textContent = '';
  });
});

document.querySelector('#plan-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const feedback = document.querySelector('#form-feedback');

  if (!selectedTime.value) {
    feedback.textContent = "Choisis l'heure qui te tente le plus.";
    document.querySelector('.time-option').focus();
    return;
  }

  document.querySelector('#chosen-time').textContent = selectedTime.value;
  const message = document.querySelector('#little-message').value.trim();
  const personalMessage = document.querySelector('#personal-message');
  personalMessage.textContent = message ? `Ton petit mot : « ${message} »` : '';
  showScreen('success-screen');
});

document.querySelector('#edit-plan-button').addEventListener('click', () => {
  showScreen('plan-screen');
});