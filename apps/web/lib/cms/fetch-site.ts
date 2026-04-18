import { cache } from "react";
import { draftMode } from "next/headers";
import { getServerApiBase } from "@/lib/api/server";
import type { AppLocale } from "@/lib/i18n/config";
import type { MediaAssetMap, PublicSiteBundle } from "@/lib/cms/types";

/**
 * Rewrite external `{NEXT_PUBLIC_API_URL}/uploads/…` URLs to same-origin `/api/uploads/…`
 * so the web app proxies them through its own BFF. Host comes from build-time env
 * (defaults to api.estio.org) so the canonical origin is not hardcoded.
 */
function buildPublicApiUploadPattern(): RegExp {
  const raw = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.PUBLIC_FILE_BASE_URL ||
    "https://api.estio.org"
  )
    .trim()
    .replace(/\/$/, "");
  try {
    const host = new URL(
      raw.startsWith("http") ? raw : `https://${raw}`,
    ).hostname.replace(/\./g, "\\.");
    return new RegExp(`^https?:\\/\\/${host}\\/uploads\\/`, "i");
  } catch {
    return /^https?:\/\/api\.estio\.org\/uploads\//i;
  }
}
const UPLOAD_RE = buildPublicApiUploadPattern();

function internaliseUploadUrl(url: string): string {
  return url.replace(UPLOAD_RE, "/api/uploads/");
}
function rewriteMediaAssets(m: MediaAssetMap | undefined): MediaAssetMap {
  if (!m) return {};
  const out: MediaAssetMap = {};
  for (const [id, entry] of Object.entries(m)) {
    out[id] = { ...entry, url: entry.url ? internaliseUploadUrl(entry.url) : entry.url };
  }
  return out;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rewriteDeep(obj: any): any {
  if (typeof obj === "string") return internaliseUploadUrl(obj);
  if (Array.isArray(obj)) return obj.map(rewriteDeep);
  if (obj && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = rewriteDeep(v);
    return out;
  }
  return obj;
}
function rewriteBundle(bundle: PublicSiteBundle): PublicSiteBundle {
  return {
    ...bundle,
    mediaAssets: rewriteMediaAssets(bundle.mediaAssets),
    homePage: bundle.homePage ? rewriteDeep(bundle.homePage) : bundle.homePage,
    marketingPages: bundle.marketingPages ? rewriteDeep(bundle.marketingPages) : bundle.marketingPages,
    services: bundle.services ? rewriteDeep(bundle.services) : bundle.services,
  };
}

function logBundle(locale: AppLocale, source: string, bundle: PublicSiteBundle) {
  if (process.env.NODE_ENV !== "development") return;
  console.info("[cms] site bundle", {
    locale,
    source,
    preview: Boolean(bundle.preview),
    marketingPages: Object.keys(bundle.marketingPages ?? {}),
    services: bundle.services.length,
  });
}

function getPreviewToken(): string | null {
  const token = process.env.PREVIEW_TOKEN?.trim();
  return token ? token : null;
}

/**
 * Deduplicated per server request ? layout + page + metadata often call this
 * multiple times for the same locale; without `cache()`, each call hit the API again.
 */
export const fetchPublicSite = cache(async function fetchPublicSite(
  locale: AppLocale,
): Promise<PublicSiteBundle | null> {
  const base = getServerApiBase();
  try {
    // Always fetch fresh CMS data on the server. `revalidate: 60` caused production
    // (estio.org) to lag behind local `next dev` and behind admin edits until the
    // window expired — the site looked "stuck" on an older build. Match dev behavior.
    const res = await fetch(`${base}/public/site/${locale}`, { cache: "no-store" });
    if (!res.ok) return null;
    const raw = (await res.json()) as PublicSiteBundle;
    const bundle = rewriteBundle(raw);
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
    const raw = (await res.json()) as PublicSiteBundle;
    const bundle = rewriteBundle(raw);
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

/** Published bundle only (no preview). Used for AR?EN CMS fallback on home. */
export const getPublishedSiteBundle = cache(async function getPublishedSiteBundle(
  locale: AppLocale,
): Promise<PublicSiteBundle> {
  if (locale === "ar") {
    const [ar, en] = await Promise.all([
      fetchPublicSite("ar"),
      fetchPublicSite("en"),
    ]);
    const bundle = ar ?? emptyBundle("ar");
    return mergeEnMediaIntoArabicBundle(bundle, en);
  }
  return (await fetchPublicSite(locale)) ?? emptyBundle(locale);
});

/** One resolved bundle per locale per RSC request (shared with layout + pages). */
export const getSiteBundle = cache(async function getSiteBundle(
  locale: AppLocale,
): Promise<PublicSiteBundle> {
  const { isEnabled } = await draftMode();
  const preview = isEnabled ? getPreviewToken() : null;

  if (locale === "ar") {
    const [primary, en] = await Promise.all([
      preview
        ? fetchPublicSitePreview("ar", preview).then(
            async (d) => d ?? (await fetchPublicSite("ar")),
          )
        : fetchPublicSite("ar"),
      fetchPublicSite("en"),
    ]);
    const bundle = primary ?? emptyBundle("ar");
    return mergeEnMediaIntoArabicBundle(bundle, en);
  }

  if (preview) {
    const draft = await fetchPublicSitePreview(locale, preview);
    return draft ?? (await fetchPublicSite(locale)) ?? emptyBundle(locale);
  }
  return (await fetchPublicSite(locale)) ?? emptyBundle(locale);
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
