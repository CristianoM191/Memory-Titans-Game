document.addEventListener('DOMContentLoaded', () => {
  const modeCards = document.querySelectorAll('.mode-card');

  modeCards.forEach((card) => {
    card.addEventListener('click', () => {
      const selectedMode = card.dataset.mode;

      localStorage.setItem('tt-selected-mode', selectedMode);

      card.classList.add('is-selected');

      setTimeout(() => {
        if (selectedMode === 'solo') {
          navigateWithStripes('./pages/login-solo.html');
        } else {
          navigateWithStripes('./pages/login-duo.html');
        }
      }, 320);
    });
  });
});