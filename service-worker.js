/* Persian Music Scales PWA service worker — selectable modal analyzer + radial visualizer v3 */
"use strict";

const CACHE_VERSION = "v7-modal-radial-visualizer";
const CACHE_NAME = `persian-music-scales-${CACHE_VERSION}`;

/* These files are required for the main application and analyzer shell. */
const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./csss/indexstyle.css",
  "./csss/audio-analyzer.css",
  "./src/index.js",
  "./src/audio-analyzer.js",
  "./src/audio-analyzer.worker.js",
  "./htmls/offline.html",
];

/* Optional pages/assets should not make installation fail if one is renamed. */
const OPTIONAL_FILES = [
  "./htmls/about.html",
  "./htmls/guide.html",
  "./htmls/tuner.html",
  "./csss/aboutstyle.css",
  "./csss/guidestyle.css",
  "./csss/tunerstyle.css",
  "./src/frequency-bars.js",
  "./src/meter.js",
  "./src/tuner.js",
  "./assets/icons/icon-192x192.png",
  "./assets/icons/myapp_icon.svg",
  "./assets/icons/share.svg",
  "./assets/icons/add_home.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_FILES);
      await Promise.allSettled(
        OPTIONAL_FILES.map(async (url) => {
          try {
            await cache.add(url);
          } catch (error) {
            console.warn("[Service Worker] Optional asset was not cached:", url, error);
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("persian-music-scales-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.protocol === "blob:" || url.protocol === "data:") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (["script", "style", "worker"].includes(request.destination)) {
    event.respondWith(networkFirstAsset(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    return (
      (await cache.match(request)) ||
      (await cache.match("./index.html")) ||
      (await cache.match("./htmls/offline.html")) ||
      new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
    );
  }
}


async function networkFirstAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { cache: "no-cache" });
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    return (await cache.match(request)) || new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await networkPromise) || new Response("Offline", { status: 503 });
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.type !== "opaque") await cache.put(request, response.clone());
    return response;
  } catch (error) {
    return new Response("Offline", { status: 503 });
  }
}
