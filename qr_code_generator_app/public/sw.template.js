// Generated into public/sw.js by scripts/postbuild.mjs after every `npm run build` —
// the version placeholder below is replaced with a fresh value each time, so the
// cache name changes on every deploy and `activate` can safely delete every other
// cache name. The precache list placeholder is filled with every hashed
// /_next/static/chunks/*.js and *.css file the build actually produced (only
// knowable once the build has run, which is why this runs as a postbuild step
// rather than the prebuild step a version-only stamp could get away with) — this
// includes chunks only ever reached via a dynamic import() at runtime (e.g. the
// scan-check feature's jsQR chunk), so they're available offline on first visit
// too, not just after they happen to get fetched once online.
//
// Strategy: network-first for navigations/HTML (so a redeploy is picked up on the
// very next successful load), cache-first for hashed /_next/static/* build assets
// (immutable by filename, safe to serve from cache without re-checking the
// network), cache-with-network-fallback for everything else (icons, manifest).
const CACHE_NAME = "qr-forge-__CACHE_VERSION__";
const PRECACHE_URLS = __PRECACHE_URLS__;

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

// Caching is best-effort — a quota error or an unsupported request scheme (seen
// in practice for browser-extension requests that share this origin's page, e.g.
// "chrome-extension:") must never turn into an unhandled rejection.
function putInCache(request, response) {
  if (!response.ok) return;
  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
}

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      putInCache(request, response);
      return response;
    })
    .catch(() => caches.match(request).then((cached) => cached || caches.match("/")));
}

function cacheFirst(request) {
  return caches.match(request).then(
    (cached) =>
      cached ||
      fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() => Response.error())
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only ever handle same-origin GET requests — anything else (a cross-origin
  // request, or a same-tab request with a scheme this worker can't cache into,
  // like "chrome-extension:" from an installed extension) is left to the browser
  // entirely by not calling respondWith() at all.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});
