import { brand } from "@/lib/content/site";
import { resourceSlugs } from "@/lib/content/resources-types";
import { locales } from "@/lib/i18n/config";

/** Indexable marketing paths without locale prefix (e.g. `/about`). */
export const INDEXABLE_MARKETING_PATHS = [
  "",
  "/about",
  "/contact",
  "/faq",
  "/services",
  "/services/web-design-development",
  "/work",
  "/services/content-campaigns",
  "/services/ai-creative",
  "/enterprise",
  "/enterprise/private-ai",
  "/enterprise/automation",
  "/ai-studio",
  "/ai-studio/brand-ai-packs",
  "/resources",
  ...resourceSlugs.map((slug) => `/resources/${slug}`),
  "/privacy",
  "/terms",
  "/cookies",
] as const;

/** Paths that should not be indexed (tools, stubs, checkout). */
export const NOINDEX_PATH_SUFFIXES = [
  "/checkout",
  "/ai-studio/image-production",
  "/ai-studio/video-production",
] as const;

export function absoluteSiteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `https://${brand.domain}${p}`;
}

export function localePath(locale: string, path: string): string {
  const stripped = path === "" || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return stripped ? `/${locale}${stripped}` : `/${locale}`;
}

export function allIndexableUrls(): string[] {
  const urls: string[] = [];
  for (const locale of locales) {
    for (const path of INDEXABLE_MARKETING_PATHS) {
      urls.push(absoluteSiteUrl(localePath(locale, path)));
    }
  }
  return urls;
}

/**
 * AdSense only on pages that already have substantial publisher content.
 * Tools, checkout, legal docs, and form-only screens stay ad-free
 * (Google publisher policy: no ads on low-value / non-content screens).
 */
const ADSENSE_PATH_PREFIXES = ["/resources"] as const;
const ADSENSE_EXACT_PATHS = ["/about", "/faq", "/work"] as const;

export function isAdsenseEligiblePath(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  for (const suffix of NOINDEX_PATH_SUFFIXES) {
    if (normalized.endsWith(suffix)) return false;
  }
  const withoutLocale = normalized.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
  if (ADSENSE_EXACT_PATHS.includes(withoutLocale as (typeof ADSENSE_EXACT_PATHS)[number])) {
    return true;
  }
  return ADSENSE_PATH_PREFIXES.some(
    (prefix) => withoutLocale === prefix || withoutLocale.startsWith(`${prefix}/`),
  );
}
