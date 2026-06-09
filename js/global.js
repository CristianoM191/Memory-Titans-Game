const appStorage = {
  theme: 'tt-theme',
  audioMuted: 'tt-audio-muted',
  speechEnabled: 'tt-speech-enabled',
  selectedMode: 'tt-selected-mode'
};

const dom = {
  html: document.documentElement,
  audio: document.getElementById('bg-audio'),
  menuToggle: document.getElementById('menuToggle'),
  menuClose: document.getElementById('menuClose'),
  sideMenu: document.getElementById('sideMenu'),
  menuOverlay: document.getElementById('menuOverlay'),
  toggleAudioBtn: document.getElementById('toggleAudioBtn'),
  toggleThemeBtn: document.getElementById('toggleThemeBtn'),
  toggleSpeechBtn: document.getElementById('toggleSpeechBtn'),
  audioStatus: document.getElementById('audioStatus'),
  themeStatus: document.getElementById('themeStatus'),
  speechStatus: document.getElementById('speechStatus')
};

function getStoredValue(key, fallback) {
  const value = localStorage.getItem(key);
  return value === null ? fallback : value;
}

function setStoredValue(key, value) {
  localStorage.setItem(key, value);
}

function applyTheme(theme) {
  dom.html.setAttribute('data-theme', theme);
  if (dom.themeStatus) {
    dom.themeStatus.textContent = theme === 'dark' ? 'Escuro' : 'Claro';
  }
}

function applyAudioMuted(isMuted) {
  if (dom.audio) {
    dom.audio.muted = isMuted;
  }

  if (dom.audioStatus) {
    dom.audioStatus.textContent = isMuted ? 'Mutada' : 'Ligada';
  }
}

function applySpeechEnabled(enabled) {
  if (dom.speechStatus) {
    dom.speechStatus.textContent = enabled ? 'Ativado' : 'Desativado';
  }
}

function toggleMenu(forceOpen = null) {
  if (!dom.sideMenu || !dom.menuOverlay || !dom.menuToggle) return;

  const willOpen = forceOpen !== null
    ? forceOpen
    : !dom.sideMenu.classList.contains('is-open');

  dom.sideMenu.classList.toggle('is-open', willOpen);
  dom.menuOverlay.classList.toggle('is-visible', willOpen);
  dom.menuToggle.classList.toggle('is-active', willOpen);
  dom.menuToggle.setAttribute('aria-expanded', String(willOpen));
  dom.sideMenu.setAttribute('aria-hidden', String(!willOpen));
}

function safePlayAudio() {
  if (!dom.audio) return;

  const isMuted = getStoredValue(appStorage.audioMuted, 'false') === 'true';
  dom.audio.muted = isMuted;

  const playPromise = dom.audio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      /* Alguns navegadores bloqueiam autoplay sem interação */
    });
  }
}

function navigateWithStripes(targetUrl) {
  const transition = document.getElementById('stripeTransition');

  if (!transition) {
    window.location.href = targetUrl;
    return;
  }

  transition.classList.add('is-active');

  setTimeout(() => {
    window.location.href = targetUrl;
  }, 820);
}

function initializeGlobalSettings() {
  const theme = getStoredValue(appStorage.theme, 'dark');
  const audioMuted = getStoredValue(appStorage.audioMuted, 'false') === 'true';
  const speechEnabled = getStoredValue(appStorage.speechEnabled, 'false') === 'true';

  applyTheme(theme);
  applyAudioMuted(audioMuted);
  applySpeechEnabled(speechEnabled);
}

function initializeGlobalMenu() {
  if (dom.menuToggle) {
    dom.menuToggle.addEventListener('click', () => toggleMenu());
  }

  if (dom.menuClose) {
    dom.menuClose.addEventListener('click', () => toggleMenu(false));
  }

  if (dom.menuOverlay) {
    dom.menuOverlay.addEventListener('click', () => toggleMenu(false));
  }

  if (dom.toggleThemeBtn) {
    dom.toggleThemeBtn.addEventListener('click', () => {
      const current = getStoredValue(appStorage.theme, 'dark');
      const next = current === 'dark' ? 'light' : 'dark';

      setStoredValue(appStorage.theme, next);
      applyTheme(next);
    });
  }

  if (dom.toggleAudioBtn) {
    dom.toggleAudioBtn.addEventListener('click', () => {
      const current = getStoredValue(appStorage.audioMuted, 'false') === 'true';
      const next = !current;

      setStoredValue(appStorage.audioMuted, String(next));
      applyAudioMuted(next);

      if (!next) {
        safePlayAudio();
      }
    });
  }

  if (dom.toggleSpeechBtn) {
    dom.toggleSpeechBtn.addEventListener('click', () => {
      const current = getStoredValue(appStorage.speechEnabled, 'false') === 'true';
      const next = !current;

      setStoredValue(appStorage.speechEnabled, String(next));
      applySpeechEnabled(next);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeGlobalSettings();
  initializeGlobalMenu();

  document.addEventListener('click', () => {
    safePlayAudio();
  }, { once: true });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/Memory-Titans-Game/service-worker.js")
      .then(() => {
        console.log("Service Worker registrado com sucesso!");
      })
      .catch(error => {
        console.error("Erro ao registrar Service Worker:", error);
      });
  });
}