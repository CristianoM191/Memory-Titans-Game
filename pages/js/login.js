document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const loginMode = body.dataset.loginMode;

  const form = document.getElementById('loginForm');
  const submitButton = document.getElementById('loginSubmit');
  const stripeTransition = document.getElementById('stripeTransition');

  const soloInput = document.getElementById('playerCodename');
  const soloFieldMessage = document.getElementById('soloFieldMessage');

  const playerOneInput = document.getElementById('playerOne');
  const playerTwoInput = document.getElementById('playerTwo');
  const duoFieldMessage = document.getElementById('duoFieldMessage');

  const MIN_LENGTH = 3;

  function normalizeValue(value) {
    return value.trim().replace(/\s+/g, ' ');
  }

  function isValidName(value) {
    return normalizeValue(value).length >= MIN_LENGTH;
  }

  function setMessage(element, message) {
    if (!element) return;
    element.textContent = message;
  }

  function validateSolo() {
    const value = normalizeValue(soloInput.value);

    if (value.length === 0) {
      setMessage(soloFieldMessage, '');
      submitButton.disabled = true;
      return false;
    }

    if (value.length < MIN_LENGTH) {
      setMessage(soloFieldMessage, `O codinome deve ter pelo menos ${MIN_LENGTH} caracteres.`);
      submitButton.disabled = true;
      return false;
    }

    setMessage(soloFieldMessage, '');
    submitButton.disabled = false;
    return true;
  }

  function validateDuo() {
    const playerOne = normalizeValue(playerOneInput.value);
    const playerTwo = normalizeValue(playerTwoInput.value);

    if (playerOne.length === 0 && playerTwo.length === 0) {
      setMessage(duoFieldMessage, '');
      submitButton.disabled = true;
      return false;
    }

    if (playerOne.length < MIN_LENGTH || playerTwo.length < MIN_LENGTH) {
      setMessage(duoFieldMessage, `Cada nome deve ter pelo menos ${MIN_LENGTH} caracteres.`);
      submitButton.disabled = true;
      return false;
    }

    if (playerOne.toLowerCase() === playerTwo.toLowerCase()) {
      setMessage(duoFieldMessage, 'Os nomes dos heróis devem ser diferentes.');
      submitButton.disabled = true;
      return false;
    }

    setMessage(duoFieldMessage, '');
    submitButton.disabled = false;
    return true;
  }

  function playExitTransitionAndGo() {
  const loginPage = document.querySelector('.login-page');

  loginPage.classList.add('is-exiting');

  setTimeout(() => {
    loginPage.classList.add('is-holding');
    stripeTransition.classList.add('is-active');
  }, 520);

  setTimeout(() => {
    window.location.href = './game.html';
  }, 1380);
}

  if (loginMode === 'solo' && soloInput) {
    soloInput.addEventListener('input', validateSolo);

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const isValid = validateSolo();
      if (!isValid) return;

      const codename = normalizeValue(soloInput.value);

      localStorage.setItem('tt-game-mode', 'solo');
      localStorage.setItem('tt-player-one', codename);
      localStorage.removeItem('tt-player-two');

      playExitTransitionAndGo();
    });
  }

  if (loginMode === 'duo' && playerOneInput && playerTwoInput) {
    const validateAndUpdate = () => validateDuo();

    playerOneInput.addEventListener('input', validateAndUpdate);
    playerTwoInput.addEventListener('input', validateAndUpdate);

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const isValid = validateDuo();
      if (!isValid) return;

      const playerOne = normalizeValue(playerOneInput.value);
      const playerTwo = normalizeValue(playerTwoInput.value);

      localStorage.setItem('tt-game-mode', 'duo');
      localStorage.setItem('tt-player-one', playerOne);
      localStorage.setItem('tt-player-two', playerTwo);

      playExitTransitionAndGo();
    });
  }
});