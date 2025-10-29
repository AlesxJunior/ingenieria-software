const CACHE_NAME = 'alexa-tech-v1';
const STATIC_CACHE = 'alexa-tech-static-v1';
const API_CACHE = 'alexa-tech-api-v1';

// Recursos para cachear inmediatamente
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/manifest.json'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activar service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache strategy para recursos estáticos
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Cache strategy para API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200 && request.method === 'GET') {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });

          // Stale-while-revalidate para GET requests
          if (request.method === 'GET' && response) {
            fetchPromise.catch(() => {}); // Actualizar cache en background
            return response;
          }

          return fetchPromise;
        });
      })
    );
    return;
  }

  // Network first para todo lo demás
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});