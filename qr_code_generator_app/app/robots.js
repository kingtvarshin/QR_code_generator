import { getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-static";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
