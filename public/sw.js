const CACHE_NAME = 'wordly-v5';
const BASE_PATH = new URL('./', self.location).pathname;
const APP_SHELL = [
  BASE_PATH,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}icons/icon.svg`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`
];

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const pageResponse = await fetch(BASE_PATH, { cache: 'reload' });
  if (!pageResponse.ok) throw new Error('App shell page could not be downloaded.');

  const html = await pageResponse.clone().text();
  const discoveredAssets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => new URL(match[1], self.location.origin))
    .filter((url) => url.origin === self.location.origin && url.pathname.startsWith(BASE_PATH))
    .map((url) => url.href);
  const shellAssets = APP_SHELL.slice(1).map((path) => new URL(path, self.location.origin).href);

  await cache.put(BASE_PATH, pageResponse);
  await cache.addAll([...new Set([...shellAssets, ...discoveredAssets])]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(BASE_PATH, copy));
          return response;
        })
        .catch(() => caches.match(BASE_PATH))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
      return response;
    }))
  );
});
