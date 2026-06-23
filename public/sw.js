/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'tcg-vault-image-cache-v1';

// Cache external card images
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache images from images.weserv.nl or images.pokemontcg.io
  if (
    event.request.method === 'GET' &&
    (url.host === 'images.weserv.nl' || url.host === 'images.pokemontcg.io')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Stale-While-Revalidate: Return cached image, update in background
            fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse.status === 200) {
                  cache.put(event.request, networkResponse);
                }
              })
              .catch((err) => console.log('SW background fetch failed:', err));
            
            return cachedResponse;
          }

          // Fetch from network and cache
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch((err) => {
              console.error('SW fetch failed:', err);
            });
        });
      })
    );
  }
});

// Clean up old caches
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
});
