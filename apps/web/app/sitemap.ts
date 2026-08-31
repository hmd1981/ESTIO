import type { MetadataRoute } from "next";
import { allIndexableUrls } from "@/lib/seo/public-routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return allIndexableUrls().map((url) => ({
    url,
    lastModified: now,
    changeFrequency: url.includes("/resources/") ? "monthly" : "weekly",
    priority: url.match(/\/(en|ar)$/) ? 1 : url.includes("/resources") ? 0.8 : 0.7,
  }));
}
