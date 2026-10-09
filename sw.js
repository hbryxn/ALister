/* Service worker: makes the web app installable and usable offline (the app shell and libraries).
   Claude calls always go to the network. */
const CACHE = 'alister-1.1.0';
const SHELL = ["./","./index.html","./fonts/bricolage-grotesque.woff2","./fonts/public-sans-400.woff2","./fonts/public-sans-600.woff2","./fonts/public-sans-700.woff2","./icons/apple-180.png","./icons/icon-192.png","./icons/icon-512.png","./manifest.webmanifest","./vendor/anthropic.js","./vendor/heic2any.min.js","./vendor/jszip.min.js","./vendor/pdf.min.js","./vendor/pdf.worker.min.js"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (e.request.mode === 'navigate') {
    // Network first for the page so updates arrive; fall back to the cached copy offline.
    e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
