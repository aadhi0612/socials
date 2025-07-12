// Simple service worker to prevent caching issues
const CACHE_NAME = 'socials-v' + Date.now();

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear old caches
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
  
  // Take control immediately
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Don't cache API calls - always fetch fresh
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('execute-api') ||
      event.request.url.includes('localhost')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For other requests, try network first
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
