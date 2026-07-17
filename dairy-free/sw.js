const CACHE_NAME = "dairy-free-365-v12";
const APP_ROOT = self.location.hostname.endsWith(".freefrom365.com") ? "" : "/dairy-free";
const APP_SHELL = [
  `${APP_ROOT}/`,
  `${APP_ROOT}/index.html`,
  `${APP_ROOT}/data.js`,
  `${APP_ROOT}/manifest.json`,
  `${APP_ROOT}/privacy.html`,
  `${APP_ROOT}/icon-192.png`,
  `${APP_ROOT}/icon-512.png`,
  `${APP_ROOT}/logo-source.png`
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))));
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
  const isAppShell = url.origin === self.location.origin && (
    url.pathname === `${APP_ROOT}/` || url.pathname.startsWith(`${APP_ROOT}/`)
  );
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
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(`${APP_ROOT}/`) || caches.match(`${APP_ROOT}/index.html`)))
    );
    return;
  }

  if (isGoogleAsset) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
