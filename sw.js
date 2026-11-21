/* Nightproof service worker: the ritual works with no signal.
 * Network first, cache as the fallback — so a published fix reaches the reader on the
 * next load, and an offline night still opens the app. */
const CACHE = 'nightproof-v5';
const SHELL = ['./', './index.html', './css/app.css?v=20261122b', './js/app.js?v=20261122b', './js/engine.js?v=20261122b', './js/i18n.js?v=20261122b', './js/coach.js?v=20261122b', './data/problems.json', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
  );
});
