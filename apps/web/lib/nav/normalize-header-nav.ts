import type { AppLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";

/**
 * Ensures primary nav items resolve to meaningful routes. CMS rows sometimes
 * point "Services" at the locale home (`/en`), which is a no-op on the homepage
 * and feels broken — normalize to `/services`.
 */
export function normalizeHeaderNavHref(
  label: string,
  rawHref: string,
  locale: AppLocale,
): string {
  let path = String(rawHref ?? "/").trim();
  if (
    path.startsWith("http") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:")
  ) {
    return path;
  }
  path = path.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  const resolved = withLocale(path, locale);
  const homeHref = withLocale("/", locale);
  const trimmed = label.trim();
  const lower = trimmed.toLowerCase();
  const isServices = lower === "services" || trimmed === "الخدمات";
  if (
    isServices &&
    (resolved === homeHref || resolved === `${homeHref}/`)
  ) {
    return withLocale("/services", locale);
  }
  return resolved;
}
