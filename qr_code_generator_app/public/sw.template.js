// Generated into public/sw.js by scripts/prebuild.mjs on every `npm run build` —
// the version placeholder below is replaced with a fresh value each time, so the
// cache name changes on every deploy and `activate` can safely delete every other
// cache name.
//
// Strategy: network-first for navigations/HTML (so a redeploy is picked up on the
// very next successful load), cache-first for hashed /_next/static/* build assets
// (immutable by filename, safe to serve from cache without re-checking the
// network), cache-with-network-fallback for everything else (icons, manifest).
const CACHE_NAME = "qr-forge-__CACHE_VERSION__";
const PRECACHE_URLS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
});

// Lets the page tell a waiting worker to activate immediately once the user
// clicks "Reload" on the update toast, instead of waiting for every tab with the
// old version open to close.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

function isStaticAsset(pathname) {
  return pathname.startsWith("/_next/static/");
}

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => caches.match(request));
}

function cacheFirst(request) {
  return caches.match(request).then(
    (cached) =>
      cached ||
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});
