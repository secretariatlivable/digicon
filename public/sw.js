/*
 * DigiCon service worker
 * ----------------------
 * Strategy by resource type:
 *   app shell / navigations  → network-first, cached fallback (fresh when
 *                              online, still opens on a plane or a bad signal)
 *   hashed build assets      → cache-first (immutable by filename)
 *   media (banners, video)   → cache-first with a size-bounded cache
 *   Supabase / API calls     → never cached; always live
 */

const VERSION = 'digicon-v2';
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const MEDIA_CACHE = `${VERSION}-media`;
const MEDIA_MAX_ENTRIES = 40;

/* Minimal precache: enough to render the shell offline. Banners and the hero
   loop are deliberately excluded so a first visit stays lightweight — they are
   cached on demand as the visitor actually scrolls to them. */
const PRECACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.svg',
  '/DigiCon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((k) => cache.delete(k)));
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok && response.type === 'basic') {
    await cache.put(request, response.clone());
    if (maxEntries) void trim(cacheName, maxEntries);
  }
  return response;
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (err) {
    const hit = (await cache.match(request)) || (fallbackUrl && (await cache.match(fallbackUrl)));
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept cross-origin traffic (Supabase, payments, analytics).
  if (url.origin !== self.location.origin) return;

  // SPA navigations: serve the shell so deep links such as /c/<card-id> resolve
  // offline, but prefer the network so a deployed update is picked up at once.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE, '/'));
    return;
  }

  if (url.pathname.startsWith('/media/')) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE, MEDIA_MAX_ENTRIES));
    return;
  }

  if (url.pathname.startsWith('/assets/') || /\.(?:css|js|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (/\.(?:png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
  }
});

/* Lets the page ask a waiting worker to take over immediately. */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
