const CACHE_NAME = 'brk365-v5';
const STATIC = ['/breakfast/', '/breakfast/index.html', '/breakfast/manifest.json', '/breakfast/icon-192.png', '/breakfast/icon-512.png', 'https://cdn.tailwindcss.com'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(STATIC.map(u=>new Request(u,{mode:'no-cors'}))).catch(()=>{}))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u=new URL(e.request.url);
  if (u.hostname.includes('googleapis.com')||u.hostname.includes('script.google.com')||u.hostname.includes('drive.google.com')||u.hostname.includes('googleusercontent.com')) {
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request))); return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{ if(r&&r.status===200){const cl=r.clone();caches.open(CACHE_NAME).then(x=>x.put(e.request,cl));} return r;}).catch(()=>caches.match('/breakfast/index.html'))));
});
