import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ServiceDetailPage } from "@/components/service-detail/service-detail-page";
import { getEnterprisePage } from "@/lib/content/service-pages";
import { resolvePublishedServiceDetail } from "@/lib/cms/resolve-service-detail";
import { getPublishedSiteBundle, getSiteBundle } from "@/lib/cms/fetch-site";
import { mergeEnterpriseVisuals } from "@/lib/cms/merge-marketing-page";
import type { MarketingPageSectionsCMS } from "@/lib/cms/types";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { isLocale } from "@/lib/i18n/config";

const slug = "private-ai";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return { title: "Not found" };
  const fallback = getEnterprisePage(slug, raw);
  if (!fallback) return { title: "Not found" };
  const content = await resolvePublishedServiceDetail(slug, raw, fallback);
  return marketingDetailMetadata(content.seo, `/${raw}/enterprise/private-ai`);
}

export default async function PrivateAiPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const fallback = getEnterprisePage(slug, raw);
  if (!fallback) notFound();
  const [content, bundle, enPublished] = await Promise.all([
    resolvePublishedServiceDetail(slug, raw, fallback),
    getSiteBundle(raw),
    raw === "ar" ? getPublishedSiteBundle("en") : Promise.resolve(null),
  ]);
  const cms = (bundle.marketingPages?.enterprise?.sections ??
    {}) as MarketingPageSectionsCMS;
  const cmsEn =
    raw === "ar"
      ? ((enPublished?.marketingPages?.enterprise?.sections ??
          {}) as MarketingPageSectionsCMS)
      : undefined;
  const ev = mergeEnterpriseVisuals(cms, cmsEn, raw);
  return (
    <ServiceDetailPage
      content={content}
      locale={raw}
      enterpriseVisuals={ev}
      mediaAssets={bundle.mediaAssets ?? {}}
      enterpriseTone
    />
  );
}
