const CACHE_NAME = "brunch365-v58";
const RUNTIME_CACHE_NAME = "brunch365-runtime-v1";
const MAX_RUNTIME_ENTRIES = 48;
const IS_PRODUCTION_HOST = self.location.hostname === "brunch.freefrom365.com";
const BASE = IS_PRODUCTION_HOST ? "" : "/breakfast";
const appPath = (path = "") => `${BASE}/${path}`.replace(/\/+/g, "/");
const APP_SHELL = [
  appPath(),
  appPath("index.html"),
  appPath("tailwind.css"),
  appPath("data.js"),
  appPath("manifest.json"),
  appPath("privacy.html"),
  appPath("icon-192.png"),
  appPath("icon-512.png"),
  appPath("icon-maskable-192.png"),
  appPath("icon-maskable-512.png"),
  appPath("logo-source.png")
];

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map((request) => cache.delete(request)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => ![CACHE_NAME, RUNTIME_CACHE_NAME].includes(key))
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(appPath()) || caches.match(appPath("index.html"))))
    );
    return;
  }

  if (isSameOrigin && APP_SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const update = fetch(event.request).then((response) => {
        if (response && (response.ok || response.type === "opaque")) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE_NAME)
            .then((cache) => cache.put(event.request, copy))
            .then(() => trimCache(RUNTIME_CACHE_NAME, MAX_RUNTIME_ENTRIES));
        }
        return response;
      }).catch(() => cached);
      return cached || update;
    })
  );
});
