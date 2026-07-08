const CACHE_NAME = "meat-free-365-v1";
const ASSETS = [
  "/meat-free/",
  "/meat-free/index.html",
  "/meat-free/manifest.json",
  "/meat-free/icon-192.png",
  "/meat-free/icon-512.png",
  "/meat-free/logo-source.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => caches.match("/meat-free/index.html")))
  );
});
