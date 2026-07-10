const CACHE_NAME = "meat-free-365-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/data.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/logo-source.png",
  "/meat-free/",
  "/meat-free/index.html",
  "/meat-free/data.js",
  "/meat-free/manifest.json",
  "/meat-free/icon-192.png",
  "/meat-free/icon-512.png",
  "/meat-free/logo-source.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isAppShell = url.origin === self.location.origin && (url.pathname === "/" || url.pathname.startsWith("/meat-free/"));
  const isGoogleAsset = /(^|\.)google\.com$/.test(url.hostname) || url.hostname.includes("googleusercontent.com");

  if (isAppShell || event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/") || caches.match("/meat-free/index.html")))
    );
    return;
  }

  if (isGoogleAsset) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
