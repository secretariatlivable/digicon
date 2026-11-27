/* DigiCon service worker — live navigation/app shell with versioned asset caching. */
const CACHE = "digicon-shell-v3";
const SHELL = ["/manifest.webmanifest", "/favicon.webp", "/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API calls must always reach the live backend.
  if (url.pathname.startsWith("/api/")) return;

  // Never cache HTML/navigation responses. This prevents an old index.html from
  // pinning the application to an obsolete JavaScript bundle after deployment.
  if (request.mode === "navigate" || request.destination === "document" || url.pathname === "/index.html") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() => caches.match("/index.html")),
    );
    return;
  }

  // Static assets may be cached, but always refresh them when they are not already
  // in the current versioned cache. Vite's hashed filenames make this safe.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      });
    }),
  );
});
