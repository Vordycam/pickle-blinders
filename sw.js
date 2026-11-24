/* Service worker: precache the app shell so everything works offline.
   Strategy: stale-while-revalidate — serve from cache instantly (offline-safe),
   refresh the cache in the background so the next load picks up updates. */
/* Bump this whenever js/ or styles.css changes, or installed apps keep
   serving the old files from cache and never see the update. */
var PREFIX = 'pblind-';
var CACHE = PREFIX + 'v2';
var ASSETS = [
  './',
  './index.html',
  './styles.css',
  './js/storage.js',
  './js/engine.js',
  './js/pdf.js',
  './js/app.js',
  './manifest.webmanifest',
  './logo.svg',
  './logo-full.png',
  './fonts/Bangers-Regular.ttf',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

function precache() {
  return caches.open(CACHE).then(function (cache) { return cache.addAll(ASSETS); });
}

self.addEventListener('install', function (e) {
  e.waitUntil(precache().then(function () { return self.skipWaiting(); }));
});

/* This site address is shared with other apps, each with its own caches.
   Only this app's old caches (the ones named pblind-...) are cleared. */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k.indexOf(PREFIX) === 0 && k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Another app on this address may clear every cache but its own when it
   updates. If this app's cache has gone missing, put the whole shell back
   the next time a page is opened with a connection, so it is ready for
   offline use again without anyone doing anything. */
function healIfEmptied() {
  return caches.has(CACHE).then(function (there) {
    if (there) return;
    return precache().catch(function () { /* offline: try again next time */ });
  });
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') e.waitUntil(healIfEmptied());
  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(e.request, { ignoreSearch: true }).then(function (cached) {
        var network = fetch(e.request).then(function (resp) {
          if (resp && resp.ok) cache.put(e.request, resp.clone());
          return resp;
        }).catch(function () { return cached; });
        return cached || network;
      });
    })
  );
});
