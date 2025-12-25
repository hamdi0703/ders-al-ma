const CACHE_NAME = 'studyflow-pro-v3';
const ICON_URL = 'https://cdn-icons-png.flaticon.com/512/3209/3209265.png';

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3',
  'https://esm.sh/lucide-react@^0.562.0',
  'https://esm.sh/recharts@^3.6.0',
  ICON_URL,
  // Sounds
  'https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3',
  'https://assets.mixkit.co/active_storage/sfx/138/138-preview.mp3',
  'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        ...EXTERNAL_ASSETS
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Virtual Icon Proxy: Serve external icon as if it is local (Required for PWA Install)
  if (url.pathname === '/icon-192.png' || url.pathname === '/icon-512.png') {
    event.respondWith(
      caches.match(ICON_URL).then((cached) => {
        return cached || fetch(ICON_URL).then(res => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(ICON_URL, resClone));
          return res;
        });
      })
    );
    return;
  }

  // 2. Navigation Requests (HTML): Network First, then Cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(res => res || caches.match('/'));
        })
    );
    return;
  }

  // 3. Asset Requests (JS, CSS, Images): Cache First, then Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});