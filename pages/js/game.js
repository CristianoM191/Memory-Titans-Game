document.addEventListener('DOMContentLoaded', () => {
  const GAME_MODE = localStorage.getItem('tt-game-mode') || 'solo';
  const PLAYER_ONE = localStorage.getItem('tt-player-one') || 'Herói 1';
  const PLAYER_TWO = localStorage.getItem('tt-player-two') || 'Herói 2';
  const SPEECH_ENABLED = () => localStorage.getItem('tt-speech-enabled') === 'true';

  const elements = {
    grid: document.getElementById('gameGrid'),
    timer: document.getElementById('timer'),

    playerOnePanel: document.getElementById('playerOnePanel'),
    playerTwoPanel: document.getElementById('playerTwoPanel'),
    playerOneName: document.getElementById('playerOneName'),
    playerTwoName: document.getElementById('playerTwoName'),
    playerOneScore: document.getElementById('playerOneScore'),
    playerTwoScore: document.getElementById('playerTwoScore'),

    playerOneTag: document.getElementById('playerOneTag'),
    playerTwoTag: document.getElementById('playerTwoTag'),

    resultOverlay: document.getElementById('resultOverlay'),
    resultTitle: document.getElementById('resultTitle'),
    resultHighlight: document.getElementById('resultHighlight'),
    resultTime: document.getElementById('resultTime'),
    resultDetails: document.getElementById('resultDetails'),
    resultCard: document.getElementById('resultCard'),

    playAgainBtn: document.getElementById('playAgainBtn'),
    restartGameBtn: document.getElementById('restartGameBtn')
  };

  const cardsData = [
    { id: 'robin', label: 'Robin', image: '../images/cards/robin.png' },
    { id: 'starfire', label: 'Estelar', image: '../images/cards/starfire.png' },
    { id: 'raven', label: 'Ravena', image: '../images/cards/raven.png' },
    { id: 'cyborg', label: 'Cyborg', image: '../images/cards/cyborg.png' },
    { id: 'beast-boy', label: 'Mutano', image: '../images/cards/beast-boy.png' },
    { id: 'nightwing', label: 'Asa Noturna', image: '../images/cards/nightwing.png' },
    { id: 'group-1', label: 'Titãs em equipe', image: '../images/cards/group-1.png' },
    { id: 'group-2', label: 'Titãs em equipe', image: '../images/cards/group-2.png' },
    { id: 'group-3', label: 'Titãs em equipe', image: '../images/cards/group-3.png' },
    { id: 'group-4', label: 'Titãs em equipe', image: '../images/cards/group-4.png' }
  ];


  const state = {
    firstCard: null,
    secondCard: null,
    lockBoard: false,
    matchedPairs: 0,
    currentPlayer: 1,
    scores: { 1: 0, 2: 0 },
    timerSeconds: 0,
    timerInterval: null,
    cardsInPlay: []
  };

  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function startTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.timerSeconds += 1;
      elements.timer.textContent = formatTime(state.timerSeconds);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
  }

  function speak(text) {
    if (!SPEECH_ENABLED()) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function announceScore() {
    if (GAME_MODE !== 'duo') return;

    const currentName = state.currentPlayer === 1 ? PLAYER_ONE : PLAYER_TWO;
    speak(`${currentName} marcou um ponto`);
  }

  function updateHud() {
    elements.playerOneName.textContent = PLAYER_ONE;
    elements.playerOneScore.textContent = state.scores[1];

    if (GAME_MODE === 'duo') {
      elements.playerTwoPanel.classList.remove('player-panel--ghost');
      elements.playerTwoName.textContent = PLAYER_TWO;
      elements.playerTwoScore.textContent = state.scores[2];

      elements.playerOneTag.textContent = 'Jogador 1';
      elements.playerTwoTag.textContent = 'Jogador 2';

      elements.playerOnePanel.classList.toggle('is-active', state.currentPlayer === 1);
      elements.playerTwoPanel.classList.toggle('is-active', state.currentPlayer === 2);
    } else {
      elements.playerTwoPanel.classList.add('hidden');
      elements.playerOneTag.textContent = 'Missão solo';
      elements.playerOnePanel.classList.add('is-active');
    }
  }

  function createCard(data, boardIndex) {
    const card = document.createElement('button');
    card.className = 'card';
    card.type = 'button';
    card.setAttribute('data-id', data.id);
    card.setAttribute('data-label', data.label);
    card.setAttribute('data-position', boardIndex + 1);
    card.setAttribute('aria-label', `Carta ${boardIndex + 1}`);
    card.innerHTML = `
  <span class="card__face card__front">
    <img src="${data.image}" alt="${data.label}" class="card__image">
  </span>
  <span class="card__face card__back"></span>
`;

    card.addEventListener('click', () => handleCardClick(card));
    card.addEventListener('mouseenter', () => handleCardHover(card));
    card.addEventListener('focus', () => handleCardHover(card));
    card.addEventListener('touchstart', () => handleCardHover(card), { passive: true });

    return card;
  }

  function handleCardHover(card) {
    if (card.classList.contains('is-matched')) return;

    const position = Number(card.dataset.position);
    speak(numberToPortuguese(position));
  }

  function numberToPortuguese(number) {
    const map = {
      1: 'Um', 2: 'Dois', 3: 'Três', 4: 'Quatro', 5: 'Cinco',
      6: 'Seis', 7: 'Sete', 8: 'Oito', 9: 'Nove', 10: 'Dez',
      11: 'Onze', 12: 'Doze', 13: 'Treze', 14: 'Quatorze', 15: 'Quinze',
      16: 'Dezesseis', 17: 'Dezessete', 18: 'Dezoito', 19: 'Dezenove', 20: 'Vinte'
    };
    return map[number] || String(number);
  }

  function revealCard(card) {
    card.classList.add('is-revealed');
  }

  function hideCard(card) {
    card.classList.remove('is-revealed');
    card.classList.remove('is-shaking');
  }

  function disableMatchedCards(cardOne, cardTwo) {
    cardOne.classList.add('is-matched', 'is-locked');
    cardTwo.classList.add('is-matched', 'is-locked');
  }

  function resetTurnSelection() {
    state.firstCard = null;
    state.secondCard = null;
    state.lockBoard = false;
  }

  function switchTurn() {
    if (GAME_MODE !== 'duo') return;
    state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
    updateHud();
  }

  function checkEndGame() {
    if (state.matchedPairs !== cardsData.length) return;

    stopTimer();
    showResultOverlay();
  }

  function buildSoloResult() {
    elements.resultTitle.textContent = `Parabéns, ${PLAYER_ONE}!`;
    elements.resultTitle.classList.remove('is-winner');
    elements.resultTime.textContent = formatTime(state.timerSeconds);
    elements.resultHighlight.innerHTML = `Missão concluída em <strong>${formatTime(state.timerSeconds)}</strong>`;

    elements.resultDetails.innerHTML = `
      <div class="result-detail">
        <span class="result-detail__label">Modo</span>
        <span>Solo</span>
      </div>
      <div class="result-detail">
        <span class="result-detail__label">Pares encontrados</span>
        <span>${state.scores[1]}</span>
      </div>
    `;

    speak(`Parabéns ${PLAYER_ONE}. Você concluiu a missão em ${formatTime(state.timerSeconds)}`);
  }

  function buildDuoResult() {
    const playerOnePoints = state.scores[1];
    const playerTwoPoints = state.scores[2];

    let winnerName = '';
    let title = '';

    if (playerOnePoints > playerTwoPoints) {
      winnerName = PLAYER_ONE;
      title = `${PLAYER_ONE} venceu!`;
    } else if (playerTwoPoints > playerOnePoints) {
      winnerName = PLAYER_TWO;
      title = `${PLAYER_TWO} venceu!`;
    } else {
      title = 'Empate!';
    }

    elements.resultTitle.textContent = title;
    elements.resultTime.textContent = formatTime(state.timerSeconds);
    elements.resultHighlight.innerHTML = `Placar final em <strong>${formatTime(state.timerSeconds)}</strong>`;
    elements.resultTitle.classList.toggle('is-winner', title !== 'Empate!');

    elements.resultDetails.innerHTML = `
      <div class="result-detail">
        <span class="result-detail__label">${PLAYER_ONE}</span>
        <span>${playerOnePoints} ponto(s)</span>
      </div>
      <div class="result-detail">
        <span class="result-detail__label">${PLAYER_TWO}</span>
        <span>${playerTwoPoints} ponto(s)</span>
      </div>
    `;

    if (winnerName) {
      speak(`Fim de jogo. ${winnerName} venceu.`);
    } else {
      speak(`Fim de jogo. A partida terminou empatada.`);
    }
  }

  function showResultOverlay() {
    if (GAME_MODE === 'solo') {
      buildSoloResult();
    } else {
      buildDuoResult();
    }

    elements.resultOverlay.classList.remove('hidden');
    elements.resultOverlay.setAttribute('aria-hidden', 'false');
  }

  function handleMatch(cardOne, cardTwo) {
    disableMatchedCards(cardOne, cardTwo);
    state.matchedPairs += 1;
    state.scores[state.currentPlayer] += 1;

    announceScore();
    updateHud();

    setTimeout(() => {
      resetTurnSelection();
      checkEndGame();
    }, 420);
  }

  function handleMismatch(cardOne, cardTwo) {
    state.lockBoard = true;
    cardOne.classList.add('is-shaking');
    cardTwo.classList.add('is-shaking');

    setTimeout(() => {
      hideCard(cardOne);
      hideCard(cardTwo);
      resetTurnSelection();
      switchTurn();
    }, 700);
  }

  function handleCardClick(card) {
    if (state.lockBoard) return;
    if (card === state.firstCard) return;
    if (card.classList.contains('is-matched')) return;
    if (card.classList.contains('is-revealed')) return;

    revealCard(card);

    const position = Number(card.dataset.position);
    const label = card.dataset.label;
    speak(`${numberToPortuguese(position)}, ${label}`);

    if (!state.firstCard) {
      state.firstCard = card;
      return;
    }

    state.secondCard = card;
    state.lockBoard = true;

    const firstId = state.firstCard.dataset.id;
    const secondId = state.secondCard.dataset.id;

    if (firstId === secondId) {
      handleMatch(state.firstCard, state.secondCard);
    } else {
      handleMismatch(state.firstCard, state.secondCard);
    }
  }

  function buildBoard() {
    elements.grid.innerHTML = '';

    const duplicated = [...cardsData, ...cardsData];
    const shuffledCards = shuffle(duplicated);

    state.cardsInPlay = shuffledCards.map((cardData, index) => {
      const cardElement = createCard(cardData, index);
      elements.grid.appendChild(cardElement);
      return cardElement;
    });
  }

  function resetState() {
    state.firstCard = null;
    state.secondCard = null;
    state.lockBoard = false;
    state.matchedPairs = 0;
    state.currentPlayer = 1;
    state.scores = { 1: 0, 2: 0 };
    state.timerSeconds = 0;
    elements.timer.textContent = '00:00';

    elements.resultOverlay.classList.add('hidden');
    elements.resultOverlay.setAttribute('aria-hidden', 'true');
  }

  function restartGame() {
    stopTimer();
    resetState();
    updateHud();
    buildBoard();
    startTimer();
  }

  elements.playAgainBtn.addEventListener('click', restartGame);
  elements.restartGameBtn.addEventListener('click', restartGame);

  updateHud();
  buildBoard();
  startTimer();
});