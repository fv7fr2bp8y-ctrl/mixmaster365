const CACHE_NAME = "plant-based-365-v2";
const ASSETS = [
  "/plant-based/",
  "/plant-based/index.html",
  "/plant-based/manifest.json",
  "/plant-based/icon-192.png",
  "/plant-based/icon-512.png",
  "/plant-based/logo-source.png"
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
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => caches.match("/plant-based/index.html")))
  );
});
