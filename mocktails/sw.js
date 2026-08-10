const CACHE_NAME = 'mock365-v3';
const STATIC = [
  '/mocktails/',
  '/mocktails/index.html',
  '/mocktails/data.js',
  '/mocktails/manifest.json',
  '/mocktails/icon-192.png',
  '/mocktails/icon-512.png',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // One asset at a time on purpose: cache.addAll() is all-or-nothing, so a single
      // flaky CDN response left the whole cache empty and offline silently never worked.
      Promise.allSettled(STATIC.map(async url => {
        if (!url.startsWith('http')) return cache.add(url);
        // Third-party answers no-cors with an opaque response, which cache.add()
        // rejects — cache.put() accepts it, so offline keeps its styling.
        const request = new Request(url, { mode: 'no-cors' });
        return cache.put(request, await fetch(request));
      }))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))); self.clients.claim(); });

self.addEventListener('fetch', e => {
  const u=new URL(e.request.url);
  if (u.hostname.includes('googleapis.com')||u.hostname.includes('script.google.com')||u.hostname.includes('drive.google.com')||u.hostname.includes('googleusercontent.com')) {
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request))); return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{ if(r&&r.status===200){const cl=r.clone();caches.open(CACHE_NAME).then(x=>x.put(e.request,cl));} return r;}).catch(()=>caches.match('/mocktails/index.html'))));
});
