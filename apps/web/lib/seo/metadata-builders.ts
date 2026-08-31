import type { Metadata } from "next";
import { brand } from "@/lib/content/site";
import { locales, type AppLocale } from "@/lib/i18n/config";
import { localePath } from "@/lib/seo/public-routes";

function absoluteUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `https://${brand.domain}${p}`;
}

/** Metadata for service / enterprise detail routes. */
export function marketingDetailMetadata(
  seo: { title: string; description: string },
  canonicalPath: string,
  options?: { locale?: AppLocale; noindex?: boolean },
): Metadata {
  const url = absoluteUrl(canonicalPath);
  const localeFromPath = /^\/(en|ar)(?=\/|$)/.exec(canonicalPath)?.[1] as
    | AppLocale
    | undefined;
  const locale = options?.locale ?? localeFromPath;
  const pathWithoutLocale = canonicalPath.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
  const alternates = locale
    ? {
        canonical: url,
        languages: Object.fromEntries(
          locales.map((loc) => [
            loc,
            absoluteUrl(localePath(loc, pathWithoutLocale)),
          ]),
        ),
      }
    : { canonical: url };

  return {
    title: seo.title,
    description: seo.description,
    alternates,
    ...(options?.noindex
      ? { robots: { index: false, follow: true } }
      : {}),
    openGraph: {
      title: `${seo.title} | ${brand.name}`,
      description: seo.description,
      url,
      siteName: brand.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

/** Thin utility / checkout pages — exclude from index. */
export function noindexMetadata(
  seo: { title: string; description?: string },
  canonicalPath: string,
): Metadata {
  const url = absoluteUrl(canonicalPath);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    robots: { index: false, follow: true },
  };
}
