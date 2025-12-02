// simple app-shell service worker for dmc-pwa wrapper
const CACHE_NAME = 'dmc-wrapper-shell-v1';
const CORE = [
  '/dmc-pwa/',
  '/dmc-pwa/index.html',
  '/dmc-pwa/manifest.json',
  '/dmc-pwa/service-worker.js,
  '/dmc-pwa/icons/icon-192.png',
  '/dmc-pwa/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('/dmc-pwa/index.html')));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      caches.open(CACHE_NAME).then(cache => {
        try { cache.put(e.request, res.clone()); } catch (err) {}
      });
      return res;
    }).catch(() => {
      if (e.request.destination === 'image') return caches.match('/dmc-pwa/icons/icon-192.png');
    }))
  );
});
