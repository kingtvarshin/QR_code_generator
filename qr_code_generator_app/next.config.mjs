/** @type {import('next').NextConfig} */
const nextConfig = {
  // Everything here runs client-side (no API routes, no per-request SSR) — a static
  // export can be served from a plain CDN with no Node server at all.
  output: "export",
};

export default nextConfig;
