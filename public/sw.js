/**
 * Vastraa Service Worker for PWA Installation & Caching
 */
const CACHE_NAME = 'vastraa-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch for dynamic API and Firestore requests
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
