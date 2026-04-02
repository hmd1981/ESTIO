import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ServiceDetailPage } from "@/components/service-detail/service-detail-page";
import { getServicePage } from "@/lib/content/service-pages";
import { resolvePublishedServiceDetail } from "@/lib/cms/resolve-service-detail";
import { getSiteBundle } from "@/lib/cms/fetch-site";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { isLocale } from "@/lib/i18n/config";

const slug = "web-design-development";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return { title: "Not found" };
  const fallback = getServicePage(slug, raw);
  if (!fallback) return { title: "Not found" };
  const content = await resolvePublishedServiceDetail(slug, raw, fallback);
  return marketingDetailMetadata(content.seo, `/${raw}/services/${slug}`);
}

export default async function WebDesignDevelopmentPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const fallback = getServicePage(slug, raw);
  if (!fallback) notFound();
  const content = await resolvePublishedServiceDetail(slug, raw, fallback);
  const bundle = await getSiteBundle(raw);
  return (
    <ServiceDetailPage
      content={content}
      locale={raw}
      mediaAssets={bundle.mediaAssets ?? {}}
    />
  );
}
