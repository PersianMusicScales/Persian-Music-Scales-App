// service-worker.js
const CACHE_VERSION = 'v4'; 
const CACHE_NAME = `persian-music-scales-${CACHE_VERSION}`;

// List all essential files for offline
const FILES_TO_CACHE = [
  // Root pages
  './',
  './htmls/index.html',
  './htmls/about.html',
  './htmls/guide.html',
  './htmls/tuner.html',
  './htmls/offline.html',

  // Manifest
  './manifest.json',

  // CSS files
  './csss/indexstyle.css',
  './csss/aboutstyle.css',
  './csss/guidestyle.css',
  './csss/tunerstyle.css',

  // JavaScript files
  './src/main.js',
  './src/app.js',
  './src/frequency-bars.js',
  './src/meter.js',
  './src/notes.js',
  './src/tuner.js',

  // Images/Icons (add any others you want cached)
  './assets/icons/icon-192x192.png',
  './assets/images/mybackground.jpg',
  './assets/images/header-bg.png',

  // Service Worker itself (optional, but you can cache it)
  './service-worker.js'
];

// =============== Install ===============
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching app shell and content');
      return cache.addAll(FILES_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// =============== Activate ===============
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

// =============== Fetch ===============
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Cache-Then-Network for HTML & JS so updates load quickly
  if (
    event.request.url.endsWith('.html') ||
    event.request.url.endsWith('.js')
  ) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Cache a clone of the response
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse; 
        })
        .catch(() => {
          // If offline, try cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For everything else (CSS, images, etc.), use Cache-First
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // Serve from cache if present
      }
      // Else fetch from network
      return fetch(event.request)
        .then(networkResponse => {
          // Valid network response? Cache it
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and navigation request, serve offline.html
          if (event.request.mode === 'navigate') {
            return caches.match('./offline.html');
          }
        });
    })
  );
});
