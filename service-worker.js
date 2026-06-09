const CACHE_NAME = "memory-game-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",

  "./css/global.css",
  "./js/global.js",

  "./images/logo.png",
  "./images/card-back.png",
  "./images/bg-game.jpg",

  "./audio/soundtrack.mp3",

  "./pages/login-solo.html",
  "./pages/login-duo.html",
  "./pages/game.html",

  "./pages/css/index.css",
  "./pages/css/login.css",
  "./pages/css/game.css",

  "./pages/js/index.js",
  "./pages/js/login.js",
  "./pages/js/game.js",

  "./icons/icon-192.png",
  "./icons/icon-512.png",

"./images/cards/Robin.png",
"./images/cards/starfire.png",
"./images/cards/raven.png",
"./images/cards/cyborg.png",
"./images/cards/beast-boy.png",
"./images/cards/nightwing.png",
"./images/cards/group-1.png",
"./images/cards/group-2.png",
"./images/cards/group-3.png",
"./images/cards/group-4.png",

];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});