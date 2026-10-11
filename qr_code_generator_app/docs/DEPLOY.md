# Deploying QR Forge

`next build` produces a fully static site in `out/` (`output: "export"` in
`next.config.mjs`) — there's no API route or per-request SSR, so any static file
host works: upload `out/` as-is.

## Verifying a redeploy is actually picked up (service worker)

`public/sw.template.js` is turned into `public/sw.js` by `scripts/prebuild.mjs`
(runs automatically as npm's `prebuild` hook before every `npm run build`), which
stamps the cache name with the current git commit (`qr-forge-<short-hash>`, or a
timestamp if git isn't available). `scripts/stampServiceWorker.test.mjs` covers
the stamping logic itself — that two different versions produce two different
cache names — but the full browser lifecycle (install → waiting → the update
toast → reload) isn't something jsdom/vitest can exercise, since it depends on
real Service Worker and Cache Storage APIs. Verify it by hand instead:

1. `npm run build`, serve `out/` locally (e.g. `npx serve out`), open it in a
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

If step 4 never shows the toast, check that `navigator.serviceWorker.controller`
was actually set on the *first* load (it's intentionally `null` on a true first
visit — the toast only fires for a worker update on top of an existing one, not
the initial install).

## Security headers

`public/_headers` covers Netlify and Cloudflare Pages (they read that file
directly, no config needed). Other hosts need the equivalent configured at their
own layer — see below. All three configs apply the same policy as
`public/_headers`; keep them in sync if that file changes. The CSP's
`'unsafe-inline'` on `script-src` is a deliberate trade-off, not an oversight:
the App Router's RSC-hydration script is inline and can't be given a nonce
without a server runtime to generate one per request, which a static export
doesn't have.

### nginx

```nginx
server {
    # ... your existing server block (root, listen, etc.) ...

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" always;
}
```

### Caddy

```caddyfile
your-domain.com {
    root * out
    file_server

    header {
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        Content-Security-Policy "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    }
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
        }
      ]
    }
  ]
}
```
