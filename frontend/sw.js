// sw.js
const CACHE_NAME = 'gridprint-static-2025-09-02-v1';
const PRECACHE_URLS = [
  '/',               // index
  '/index.html',
  '/output.css',
  '/favicon.svg',
  '/manifest.json',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
  '/icons/apple-touch-icon.png',
];

// Hjälpare
const sameOrigin = (url) => url.origin === self.location.origin;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      // Aktivera direkt när installationen är klar
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Rensa gamla caches
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      // Navigation preload (om stöds) – snabbare första navigering
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }

      // Ta kontroll direkt över öppna flikar
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1) Låt icke-GET gå direkt till nätet (POST /upload mm.)
  if (request.method !== 'GET') {
    return; // inte respondWith -> browsern hanterar
  }

  const url = new URL(request.url);
  const isSame = sameOrigin(url);

  // 2) API-rutter: ALDRIG från cache, ALDRIG cache:a
  // Lägg till fler prefix här om du får fler API endpoints.
  const isAPI =
    isSame &&
    (url.pathname.startsWith('/upload') || url.pathname.startsWith('/health'));

  if (isAPI) {
    event.respondWith(
      fetch(request).catch(() => {
        // Ge ett rimligt svar för GET /health offline, men serva inte index.html här
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
    );
    return;
  }

  // 3) PDF: gör nätverksanrop och cache:a inte
  // (Din PDF kommer via POST /upload -> ej träff här,
  // men detta skyddar ev. framtida GET till PDF:er)
  const reqAccept = request.headers.get('accept') || '';
  const isPDF =
    url.pathname.endsWith('.pdf') || reqAccept.includes('application/pdf');

  if (isPDF) {
    event.respondWith(fetch(request));
    return;
  }

  // 4) Navigeringar: network-first med offline-fallback till index
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Utnyttja navigation preload om tillgängligt
          const preload = await event.preloadResponse;
          if (preload) return preload;
          return await fetch(request);
        } catch {
          // Offline -> fallback till cache:ad index
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match('/');
          return cached || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // 5) Statiska assets: cache-first, annars hämta och lägg i cache
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);
        // Cache:a endast same-origin, framgångsrika och "basic" svar
        if (isSame && response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, copy).catch(() => {/* ignore quota errors */});
        }
        return response;
      } catch {
        // Offline – för assets kan vi försöka index som sista utväg
        // men *inte* för API (hanteras ovan) eller PDFs (hanteras ovan)
        const cache = await caches.open(CACHE_NAME);
        const fallback = await cache.match('/index.html');
        return fallback || new Response('Offline', { status: 503 });
      }
    })()
  );
});
