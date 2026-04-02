import type { AppLocale } from "@/lib/i18n/config";

/** Prefix an internal path with the active locale segment. */
export function withLocale(path: string, locale: AppLocale): string {
  if (path.startsWith("http") || path.startsWith("mailto:") || path.startsWith("tel:")) {
    return path;
  }
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === "/") return `/${locale}`;
  return `/${locale}${p}`;
}

/**
 * Same URL path with a different locale segment (`/en/...` ↔ `/ar/...`).
 * `pathname` should be `usePathname()` (includes the locale prefix).
 */
export function alternateLocaleHref(pathname: string, targetLocale: AppLocale): string {
  const stripped = pathname.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
  if (stripped === "/") return `/${targetLocale}`;
  return `/${targetLocale}${stripped}`;
}
