/* c:/Users/Dani B/Desktop/BienestarAnimal/frontend/sw.js */
const CACHE_NAME = 'bienestar-animal-v2'; // Updated version to force refresh
const ASSETS = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/animal.html',
    '/evaluation.html',
    '/graphs.html',
    '/styles/main.css',
    '/js/api.js',
    '/js/auth.js',
    '/js/evaluations.js',
    '/manifest.json'
];

// Install event - caching the assets
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

// Activate event - clearing old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// Fetch event - Network First strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
