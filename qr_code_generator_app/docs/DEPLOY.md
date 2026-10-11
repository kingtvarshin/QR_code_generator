# Deploying QR Forge

`next build` produces a fully static site in `out/` (`output: "export"` in
`next.config.mjs`) — there's no API route or per-request SSR, so any static file
host works: upload `out/` as-is.

## Required environment

`NEXT_PUBLIC_SITE_URL` (e.g. `https://qrforge.app`, no trailing slash) **must** be
set before `npm run build` in production. It's used for `metadataBase`, the
canonical link, Open Graph/Twitter image URLs, and the sitemap/robots `<loc>`
values (`lib/siteUrl.js`). Without it, the build fails on purpose rather than
silently shipping those pointing at `http://localhost:3000`.

That check only catches the var being *unset* — it wouldn't catch a real deploy
accidentally running with a `localhost`/`127.0.0.1` value left over from a local
`npm run preview`. **Use `npm run build:deploy` for actual deployments** (CI,
hosting build command): it's the same build, but additionally refuses to proceed
if `NEXT_PUBLIC_SITE_URL` resolves to `localhost` or `127.0.0.1`.

## Verifying a redeploy is actually picked up (service worker)

`public/sw.template.js` is turned into `public/sw.js` by `scripts/postbuild.mjs`
(runs automatically as npm's `postbuild` hook after every `npm run build`), which
stamps the cache name with the current git commit (`qr-forge-<short-hash>`, or a
timestamp if git isn't available) and the list of hashed `/_next/static/chunks/*`
files to precache — including chunks only ever reached via a runtime dynamic
`import()`, like the scan-check feature's jsQR chunk, so they're available
offline on first visit rather than only after they happen to get fetched once
online. This has to run *after* the build, not before: those hashed filenames
don't exist until `next build` has produced them. The static export's own
public/-into-out/ copy already ran by then, so this script copies the
freshly-stamped `sw.js` into `out/` itself afterward.

`scripts/stampServiceWorker.test.mjs` covers the stamping logic itself — that two
different versions produce two different cache names, and that the precache list
is embedded correctly — but the full browser lifecycle (install → waiting → the
update toast → reload) isn't something jsdom/vitest can exercise, since it
depends on real Service Worker and Cache Storage APIs. Verify it by hand instead:

1. `NEXT_PUBLIC_SITE_URL=https://qrforge.app npm run build` (or `npm run preview`,
   which builds and serves `out/` on port 4000), open it in a
   browser, and confirm in DevTools → Application → Service Workers that a worker
   is **activated**, and under Cache Storage that a `qr-forge-<hash>` cache exists.
2. Change something visible (e.g. the heading text in `app/page.js`), commit it
   (so the git hash changes), and `npm run build` again. Confirm
   `public/sw.js`'s `CACHE_NAME` differs from the previous build's.
3. Re-serve `out/` and reload the **already-open** tab from step 1 without
   closing it first.
4. Expect: the page keeps showing the *old* content at first (network-first on
   the navigation still raced the old service worker's install), then within a
   few seconds the "Update available" toast appears (DevTools → Application →
   Service Workers should now show a second worker **waiting**).
5. Click **Reload** on the toast. The page reloads and now shows the *new*
   content. In DevTools, the old `qr-forge-<hash>` cache should be gone (deleted
   on `activate`) and only the new one remains.
6. Sanity check offline support: DevTools → Network → set to "Offline", reload —
   the page should still load from cache (served by the now-activated worker).
   Generate a URL code and confirm the scan-check badge still shows "✓ Scannable"
   — that exercises the jsQR chunk, which is only reachable via a runtime dynamic
   import() and has to be in the precache list (not just the chunks referenced
   directly from the page) for this to work offline. The console should show no
   uncaught errors from `sw.js` — a cross-origin/unsupported-scheme request (e.g.
   from an installed browser extension) or a genuinely offline fetch should fail
   silently from the worker's own perspective, not as an unhandled rejection.

If step 4 never shows the toast, check that `navigator.serviceWorker.controller`
was actually set on the *first* load (it's intentionally `null` on a true first
visit — the toast only fires for a worker update on top of an existing one, not
the initial install).

## Security and caching headers

`public/_headers` covers Netlify and Cloudflare Pages (they read that file
directly, no config needed). Other hosts need the equivalent configured at their
own layer — see below. All three configs apply the same security headers,
immutable caching on `/_next/static/*`, and `no-cache` on `/sw.js`/`/` as
`public/_headers`; keep them in sync if that file changes. The CSP's
`'unsafe-inline'` on `script-src` is a deliberate trade-off, not an oversight:
the App Router's RSC-hydration script is inline and can't be given a nonce
without a server runtime to generate one per request, which a static export
doesn't have.

### nginx

```nginx
# `add_header` does NOT inherit into a location block that sets its own
# add_header (https://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header),
# so the common headers are repeated in every location below that also needs its
# own Cache-Control — otherwise those paths would silently lose them.
server {
    # ... your existing server block (root, listen, etc.) ...

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;

    location /_next/static/ {
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
        add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" always;
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    location = /sw.js {
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
        add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" always;
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
        add_header Cache-Control "no-cache" always;
    }

    location = / {
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
        add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" always;
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
        add_header Cache-Control "no-cache" always;
    }
}
```

### Caddy

```caddyfile
your-domain.com {
    root * out
    file_server

    # Unlike nginx's add_header, Caddy's top-level header directive applies to
    # every response from this site regardless of path, so it doesn't need to be
    # repeated below for the Cache-Control-specific matchers.
    header {
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
        Strict-Transport-Security "max-age=63072000; includeSubDomains"
    }

    @static path /_next/static/*
    header @static Cache-Control "public, max-age=31536000, immutable"

    @noCache path /sw.js /
    header @noCache Cache-Control "no-cache"
}
```

### Vercel (`vercel.json`)

Next's own `headers()` config is ignored under `output: "export"` (confirmed via
a build warning — there's no server to apply it at request time), so on Vercel
this has to go in `vercel.json` instead, at the project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
        },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/sw.js",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    },
    {
      "source": "/",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    }
  ]
}
```

Vercel merges headers from every matching rule rather than requiring the common
ones to be repeated per-path, unlike nginx above.
