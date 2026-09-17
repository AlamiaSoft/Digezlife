/**
 * Hand-rolled service worker (no Workbox) — kept deliberately small
 * and readable so it's easy to extend for a real product.
 *
 * Strategy:
 *  - App shell (index.html, manifest, core icon) precached on install.
 *  - Navigations: network-first, falling back to the cached shell,
 *    then to offline.html if nothing cached matches.
 *  - Same-origin built assets (JS/CSS/images): stale-while-revalidate.
 *  - Cross-origin (Google Fonts, Font Awesome icon CDN): stale-while-
 *    revalidate too, so icons/fonts keep working offline after the
 *    first successful load.
 */
const VERSION = 'gharlyapp-v2.1';
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const PRECACHE_URLS = ['/', '/manifest.webmanifest', '/manifest.json', '/icons/icon.svg', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Navigations (HTML documents): network-first with offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('/', copy));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match('/')) || (await cache.match('/offline.html'));
        })
    );
    return;
  }

  // Everything else: stale-while-revalidate.
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
