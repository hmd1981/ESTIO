import type { MetadataRoute } from "next";
import { brand } from "@/lib/content/site";

export default function robots(): MetadataRoute.Robots {
  const base = `https://${brand.domain}`;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/en/checkout",
          "/ar/checkout",
          "/en/ai-studio/image-production",
          "/ar/ai-studio/image-production",
          "/en/ai-studio/video-production",
          "/ar/ai-studio/video-production",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
