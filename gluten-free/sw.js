const CACHE_NAME = "gluten-free-365-v2";
const ASSETS = [
  "/gluten-free/",
  "/gluten-free/index.html",
  "/gluten-free/manifest.json",
  "/gluten-free/icon-192.png",
  "/gluten-free/icon-512.png",
  "/gluten-free/logo-source.png"
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
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => caches.match("/gluten-free/index.html")))
  );
});
