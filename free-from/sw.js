const CACHE_NAME = "healthy-gut-365-v11";
const ASSETS = [
  "/free-from/",
  "/free-from/index.html",
  "/free-from/manifest.json",
  "/free-from/icon-192.png",
  "/free-from/icon-512.png",
  "/free-from/logo-source.png"
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
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => caches.match("/free-from/index.html")))
  );
});
