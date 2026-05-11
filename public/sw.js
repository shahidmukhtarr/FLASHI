// ─── Flashi Service Worker ───
// Provides offline fallback for the mobile app (WebView) and web browsers.
// When the server is unreachable (cold start, no internet), users see a
// branded offline page instead of Android's "Web page not available" error.
// This works for ALL existing app users — no APK update required.

const CACHE_NAME = 'flashi-offline-v1';
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache on install
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/logo.png',
];

// ─── Install: pre-cache the offline page ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

// ─── Activate: clean up old caches ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all open pages immediately
  self.clients.claim();
});

// ─── Fetch: network-first with offline fallback ───
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests (page loads)
  // Let all API calls, images, scripts, etc. pass through normally
  if (event.request.mode !== 'navigate') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Network failed → serve the cached offline page
        return caches.match(OFFLINE_URL);
      })
  );
});
