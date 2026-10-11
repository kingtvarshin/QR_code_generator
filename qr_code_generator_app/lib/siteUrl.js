// Shared by app/layout.js, app/sitemap.js, and app/robots.js so canonical/OG/sitemap
// URLs can't drift from each other, and so a production build without a real
// public URL set fails loudly instead of silently shipping "http://localhost:3000"
// in metadata, social previews, and the sitemap.
export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be set for a production build — otherwise canonical URLs, " +
        "Open Graph images, and the sitemap would all point at localhost."
    );
  }
  return "http://localhost:3000";
}
