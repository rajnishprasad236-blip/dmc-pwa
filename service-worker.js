const CACHE_NAME = 'dmc-wrapper-shell-v1';
const CORE = ['/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => {
    if (k !== CACHE_NAME) return caches.delete(k);
  }))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    return caches.open(CACHE_NAME).then(cache => {
      try { cache.put(e.request, res.clone()); } catch (err) {}
      return res;
    });
  }).catch(() => {
    if (e.request.destination === 'image') return caches.match('/icons/icon-192.png');
  })));
});
