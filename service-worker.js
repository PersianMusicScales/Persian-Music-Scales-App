const CACHE_VERSION = 'v2'; // Increment this version to force cache update
const CACHE_NAME = `persian-music-scales-${CACHE_VERSION}`;

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './main.js', // Ensure this is included
  './service-worker.js',
  './styles.css',
  './offline.html',
  './icons/icon-192x192.png',
  './images/myBackground.jpg'
];

// Install event: Cache all necessary assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching app shell and content');
      return cache.addAll(FILES_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Serve files with cache-then-network strategy for JS/HTML
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Cache-Then-Network strategy for index.html and .js files
  if (event.request.url.includes('index.html') || event.request.url.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse; // Serve the updated file from the network
        })
        .catch(() => caches.match(event.request)) // Fallback to cache if offline
    );
    return;
  }

  // Default Cache-First strategy for all other requests
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // Serve the cached version if available
      }
      const fetchRequest = event.request.clone();
      return fetch(fetchRequest).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse; // Return the network response if valid
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache); // Cache the new response
        });
        return networkResponse; // Serve the network response
      }).catch(() => {
        // Fallback to offline.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./offline.html');
        }
      });
    })
  );
});
