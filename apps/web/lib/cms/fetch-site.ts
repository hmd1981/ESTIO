import { cache } from "react";
import { cookies } from "next/headers";
import { getServerApiBase } from "@/lib/api/server";
import type { AppLocale } from "@/lib/i18n/config";
import type { PublicSiteBundle } from "@/lib/cms/types";

function logBundle(locale: AppLocale, source: string, bundle: PublicSiteBundle) {
  console.info("[cms] site bundle", {
    locale,
    source,
    preview: Boolean(bundle.preview),
    marketingPages: Object.keys(bundle.marketingPages ?? {}),
    services: bundle.services.length,
  });
}

/**
 * Deduplicated per server request — layout + page + metadata often call this
 * multiple times for the same locale; without `cache()`, each call hit the API again.
 */
export const fetchPublicSite = cache(async function fetchPublicSite(
  locale: AppLocale,
): Promise<PublicSiteBundle | null> {
  const base = getServerApiBase();
  try {
    const res = await fetch(`${base}/public/site/${locale}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const bundle = (await res.json()) as PublicSiteBundle;
    logBundle(locale, "published", bundle);
    return bundle;
  } catch {
    return null;
  }
});

const fetchPublicSitePreview = cache(async function fetchPublicSitePreview(
  locale: AppLocale,
  token: string,
): Promise<PublicSiteBundle | null> {
  const base = getServerApiBase();
  try {
    const qs = new URLSearchParams({ token });
    const res = await fetch(
      `${base}/public/site/${locale}/preview?${qs.toString()}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const bundle = (await res.json()) as PublicSiteBundle;
    logBundle(locale, "preview", bundle);
    return bundle;
  } catch {
    return null;
  }
});

/**
 * Arabic pages reuse English CMS fallbacks for `imageMediaAssetId` / `videoMediaAssetId`.
 * The public `/ar` bundle often omits those asset rows; merge EN published `mediaAssets`
 * so `resolveImage` / `resolveVisualMedia` resolve the same URLs as on `/en`.
 */
function mergeEnMediaIntoArabicBundle(
  ar: PublicSiteBundle,
  en: PublicSiteBundle | null,
): PublicSiteBundle {
  if (ar.locale !== "ar") return ar;
  if (!en?.mediaAssets || Object.keys(en.mediaAssets).length === 0) return ar;
  return {
    ...ar,
    mediaAssets: { ...(en.mediaAssets ?? {}), ...(ar.mediaAssets ?? {}) },
  };
}

/** Published bundle only (no preview). Used for AR→EN CMS fallback on home. */
export const getPublishedSiteBundle = cache(async function getPublishedSiteBundle(
  locale: AppLocale,
): Promise<PublicSiteBundle> {
  const bundle = (await fetchPublicSite(locale)) ?? emptyBundle(locale);
  if (locale === "ar") {
    const en = await fetchPublicSite("en");
    return mergeEnMediaIntoArabicBundle(bundle, en);
  }
  return bundle;
});

/** One resolved bundle per locale per RSC request (shared with layout + pages). */
export const getSiteBundle = cache(async function getSiteBundle(
  locale: AppLocale,
): Promise<PublicSiteBundle> {
  const preview = (await cookies()).get("estio_preview")?.value;
  let bundle: PublicSiteBundle;
  if (preview) {
    const draft = await fetchPublicSitePreview(locale, preview);
    bundle = draft ?? (await fetchPublicSite(locale)) ?? emptyBundle(locale);
  } else {
    bundle = (await fetchPublicSite(locale)) ?? emptyBundle(locale);
  }
  if (locale === "ar") {
    const en = await fetchPublicSite("en");
    return mergeEnMediaIntoArabicBundle(bundle, en);
  }
  return bundle;
});

export function emptyBundle(locale: AppLocale): PublicSiteBundle {
  return {
    locale,
    settings: null,
    navigation: { header: [], footer: [] },
    homePage: null,
    marketingPages: {},
    services: [],
    mediaAssets: {},
  };
}
