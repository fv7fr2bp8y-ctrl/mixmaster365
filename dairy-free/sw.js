const CACHE_NAME = "dairy-free-365-v1";
const ASSETS = [
  "/dairy-free/",
  "/dairy-free/index.html",
  "/dairy-free/manifest.json",
  "/dairy-free/icon-192.png",
  "/dairy-free/icon-512.png",
  "/dairy-free/logo-source.png"
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
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => caches.match("/dairy-free/index.html")))
  );
});
