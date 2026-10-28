/**
 * XESTUS Service Worker - Offline Cache Strategy
 * Enables full client-side calculation even without internet connection
 */

const CACHE_NAME = 'xestus-suite-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/gst-calculator.html',
  '/gst-invoice-generator.html',
  '/income-tax-calculator.html',
  '/loan-emi-calculator.html',
  '/sip-calculator.html',
  '/about.html',
  '/contact.html',
  '/privacy-policy.html',
  '/terms.html',
  '/disclaimer.html',
  '/css/style.css',
  '/js/main.js',
  '/js/chart-renderer.js',
  '/js/gst-calculator.js',
  '/js/gst-invoice.js',
  '/js/income-tax.js',
  '/js/loan-emi.js',
  '/js/sip-calculator.js',
  '/assets/icons/favicon.svg',
  '/assets/icons/icon-192.svg',
  '/assets/icons/icon-512.svg',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for HTML documents if offline and uncached
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
