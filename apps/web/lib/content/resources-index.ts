import type { AppLocale } from "@/lib/i18n/config";
import type {
  ResourceArticle,
  ResourcesIndexContent,
  ResourceSlug,
} from "./resources-types";
import { resourceSlugs } from "./resources-types";
import { resourceArticlesEn, getResourcesIndex } from "./resources";
import { resourceArticlesAr, getResourcesIndexAr } from "./resources-ar";
import { resourceArticlesMoreEn } from "./resources-more";
import { resourceArticlesMoreAr } from "./resources-more-ar";

const enBySlug = {
  ...resourceArticlesEn,
  ...resourceArticlesMoreEn,
} as Record<ResourceSlug, ResourceArticle>;

const arBySlug = {
  ...resourceArticlesAr,
  ...resourceArticlesMoreAr,
} as Record<ResourceSlug, ResourceArticle>;

for (const slug of resourceSlugs) {
  if (!enBySlug[slug] || !arBySlug[slug]) {
    throw new Error(`Missing resource article for slug: ${slug}`);
  }
}

export function getResourcesIndexContent(
  locale: AppLocale,
): ResourcesIndexContent {
  return locale === "ar" ? getResourcesIndexAr() : getResourcesIndex(locale);
}

export function getResourceArticleBySlug(
  slug: ResourceSlug,
  locale: AppLocale,
): ResourceArticle | undefined {
  return locale === "ar" ? arBySlug[slug] : enBySlug[slug];
}

export function listAllResourceArticles(locale: AppLocale): ResourceArticle[] {
  const map = locale === "ar" ? arBySlug : enBySlug;
  return Object.values(map).sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function relatedResourceArticles(
  article: ResourceArticle,
  locale: AppLocale,
  limit = 3,
): ResourceArticle[] {
  const all = listAllResourceArticles(locale).filter((a) => a.slug !== article.slug);
  const scored = all
    .map((candidate) => ({
      candidate,
      score: candidate.tags.filter((t) => article.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score || Date.parse(b.candidate.publishedAt) - Date.parse(a.candidate.publishedAt));
  const picked = scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.candidate);
  if (picked.length >= limit) return picked;
  const extras = all.filter((a) => !picked.some((p) => p.slug === a.slug));
  return [...picked, ...extras].slice(0, limit);
}

export { resourceSlugs, isResourceSlug } from "./resources-types";
export type { ResourceSlug, ResourceArticle } from "./resources-types";
