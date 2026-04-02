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

export async function fetchPublicSite(
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
}

async function fetchPublicSitePreview(
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
}

/** Published bundle only (no preview). Used for AR→EN CMS fallback on home. */
export async function getPublishedSiteBundle(
  locale: AppLocale,
): Promise<PublicSiteBundle> {
  return (await fetchPublicSite(locale)) ?? emptyBundle(locale);
}

/** One resolved bundle per locale per RSC request (shared with layout + pages). */
export async function getSiteBundle(
  locale: AppLocale,
): Promise<PublicSiteBundle> {
  const preview = (await cookies()).get("estio_preview")?.value;
  if (preview) {
    const draft = await fetchPublicSitePreview(locale, preview);
    if (draft) return draft;
  }
  return (await fetchPublicSite(locale)) ?? emptyBundle(locale);
}

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
