import type { AppLocale } from "@/lib/i18n/config";
import type { ResourceArticle } from "./resources-types";

/**
 * Reading speed by locale. Arabic prose tends to run slightly longer per
 * equivalent idea, so we use a lower words-per-minute figure for it.
 */
const WORDS_PER_MINUTE: Record<AppLocale, number> = {
  en: 220,
  ar: 180,
};

/** Count the words a reader actually sees, not editorial metadata. */
export function countArticleWords(article: ResourceArticle): number {
  const parts: string[] = [article.title, article.description];
  for (const section of article.sections) {
    parts.push(section.heading, ...section.paragraphs);
    if (section.bullets) parts.push(...section.bullets);
  }
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

/**
 * Derive reading time from the rendered body instead of trusting a
 * hand-written `readMinutes` value. Inflated estimates read as inauthentic.
 */
export function estimateReadMinutes(
  article: ResourceArticle,
  locale: AppLocale,
): number {
  const words = countArticleWords(article);
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE[locale]));
}
