const HOSTNAME_WHITELIST = [
  self.location.hostname,
  'fonts.gstatic.com',
  'fonts.googleapis.com',
  'cdn.jsdelivr.net'
];

// Cache name
const CACHE_NAME = 'pwa-cache-v1';

// Utility to force fresh request
const getFixedUrl = (req) => {
  const url = new URL(req.url);
  url.protocol = self.location.protocol;

  if (url.hostname === self.location.hostname) {
    const now = Date.now();
    url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
  }
  return url.href;
};

// Install event (optional pre-caching here)
self.addEventListener('install', (event) => {
  console.log('✔️ Service Worker installed');
  self.skipWaiting(); // Activate immediately
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Intercept fetches
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (!HOSTNAME_WHITELIST.includes(requestUrl.hostname)) return;

  const fixedUrl = getFixedUrl(event.request);
  const cachedResponse = caches.match(event.request);
  const networkFetch = fetch(fixedUrl, { cache: 'no-store' });
  const networkFetchCopy = networkFetch.then(resp => resp.clone());

  // Serve race between network and cache
  event.respondWith(
    Promise.race([networkFetch.catch(() => cachedResponse), cachedResponse])
      .then(resp => resp || networkFetch)
      .catch(() => {})
  );

  // Update cache with fresh response
  event.waitUntil(
    Promise.all([networkFetchCopy, caches.open(CACHE_NAME)])
      .then(([resp, cache]) => {
        if (resp.ok) {
          return cache.put(event.request, resp);
        }
      })
      .catch(() => {})
  );
});
