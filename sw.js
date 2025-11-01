const CACHE_NAME = 'marcenapp-cache-v3';
const APP_SHELL_URL = '/index.html';

const STATIC_ASSETS_TO_PRECACHE = [
  '/',
  APP_SHELL_URL
];


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(STATIC_ASSETS_TO_PRECACHE);
      })
      .catch(error => {
        console.error("Failed to cache app shell:", error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, serve the app shell as a fallback.
  // This is crucial for single-page applications.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try the network first.
          const networkResponse = await fetch(event.request);
          // A 404 from the server for a navigation is an error for an SPA.
          // We should serve the app shell instead.
          if (networkResponse.ok) {
            return networkResponse;
          }
          // If we get a 404 or other error, fall through to the cache.
        } catch (error) {
          // The network failed. We'll try the cache.
          console.log('Fetch failed for navigation, falling back to cache.', error);
        }

        // Fallback to the cached app shell.
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(APP_SHELL_URL);
        return cachedResponse;
      })()
    );
    return;
  }
  
  // For non-navigation requests (assets), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        // Cache the new response if it's valid and not a Google API call
        if (fetchResponse && fetchResponse.status === 200 && !event.request.url.includes('googleapis.com')) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
    })
  );
});