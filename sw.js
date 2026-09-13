const CACHE = 'tj-cache-v7';
const ASSETS = [
  './',
  './index.html',
  './trading-journal.html',
  './trades_data.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// NETWORK-FIRST: always try the network for the freshest file first.
// Only fall back to the cached copy if there's no connection at all.
// (Previously this was cache-first, which meant a new deploy could sit
// invisible behind the old cached version indefinitely.)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then(res => {
      try {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      } catch(err) {}
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
