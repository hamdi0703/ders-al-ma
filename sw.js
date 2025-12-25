
const CACHE_NAME = 'studyflow-pro-v5';
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
        './',
        './index.html',
        './manifest.json',
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
  // Navigation Requests (HTML): Network First, then Cache, then Fallback to index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If server returns 404 (Not Found), serve the cached index.html (SPA routing)
          if (!response || response.status === 404) {
            return caches.match('./index.html');
          }
          
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match('./index.html')
            .then(res => res || caches.match('./'));
        })
    );
    return;
  }

  // Asset Requests (JS, CSS, Images): Cache First, then Network
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
