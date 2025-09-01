const CACHE_NAME = 'bilder-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/output.css',
  '/favicon.svg',
  '/manifest.json',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Only cache same-origin and successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const copy = response.clone();
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
          return response;
        });
      });
    }).catch(() => caches.match('/index.html'))
  );
});