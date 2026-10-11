import { getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-static";

export default function sitemap() {
  return [{ url: getSiteUrl(), lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
