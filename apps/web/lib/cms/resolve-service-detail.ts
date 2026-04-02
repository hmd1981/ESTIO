import type { AppLocale } from "@/lib/i18n/config";
import type { ServiceDetailContent } from "@/lib/content/types";
import {
  fetchPublishedServiceBySlug,
  mapApiServiceToDetailContent,
} from "@/lib/cms/service-from-api";

/**
 * Uses published CMS/API row when present; otherwise static marketing copy.
 */
export async function resolvePublishedServiceDetail(
  slug: string,
  locale: AppLocale,
  fallback: ServiceDetailContent,
): Promise<ServiceDetailContent> {
  const row = await fetchPublishedServiceBySlug(slug, locale);
  if (!row) return fallback;
  return mapApiServiceToDetailContent(row, fallback);
}
