import type { MetadataRoute } from "next";
import { listAllResourceArticles } from "@/lib/content/resources-index";
import { allIndexableUrls } from "@/lib/seo/public-routes";
import { locales } from "@/lib/i18n/config";

/**
 * Baseline for marketing pages that are not backed by dated content.
 * Bump this when the copy on those pages actually changes — using the
 * request time for every URL makes `lastmod` meaningless to crawlers.
 */
const MARKETING_CONTENT_UPDATED_AT = "2026-08-24T13:50:56.496Z";

function buildLastModifiedMaps(): {
  articles: Map<string, string>;
  resourceIndexes: Map<string, string>;
} {
  const articles = new Map<string, string>();
  const resourceIndexes = new Map<string, string>();

  for (const locale of locales) {
    let latest = "";
    for (const article of listAllResourceArticles(locale)) {
      articles.set(`/${locale}/resources/${article.slug}`, article.updatedAt);
      if (article.updatedAt > latest) latest = article.updatedAt;
    }
    if (latest) resourceIndexes.set(`/${locale}/resources`, latest);
  }

  return { articles, resourceIndexes };
}

function pathnameOf(url: string): string {
  return new URL(url).pathname.replace(/\/$/, "") || "/";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const { articles, resourceIndexes } = buildLastModifiedMaps();

  return allIndexableUrls().map((url) => {
    const path = pathnameOf(url);
    const lastModified =
      articles.get(path) ??
      resourceIndexes.get(path) ??
      MARKETING_CONTENT_UPDATED_AT;

    return {
      url,
      lastModified: new Date(lastModified),
      changeFrequency: path.includes("/resources/") ? "monthly" : "weekly",
      priority: /\/(en|ar)$/.test(path) ? 1 : path.includes("/resources") ? 0.8 : 0.7,
    };
  });
}
