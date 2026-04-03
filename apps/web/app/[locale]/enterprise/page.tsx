import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EnterpriseLandingPage } from "@/components/enterprise/enterprise-landing-page";
import { getEnterprisePage } from "@/lib/content/service-pages";
import { resolvePublishedServiceDetail } from "@/lib/cms/resolve-service-detail";
import { getPublishedSiteBundle, getSiteBundle } from "@/lib/cms/fetch-site";
import { buildEnterpriseLandingMergeDefaults } from "@/lib/cms/enterprise-merge-defaults";
import {
  mergeEnterpriseLandingSections,
  mergeEnterpriseVisuals,
} from "@/lib/cms/merge-marketing-page";
import type { MarketingPageSectionsCMS } from "@/lib/cms/types";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

const slug = "enterprise";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return { title: "Not found" };
  const fallback = getEnterprisePage(slug, raw);
  if (!fallback) return { title: "Not found" };
  const content = await resolvePublishedServiceDetail(slug, raw, fallback);
  return marketingDetailMetadata(content.seo, `/${raw}/enterprise`);
}

const deepLinkPaths = [
  "/enterprise/private-ai",
  "/enterprise/automation",
] as const;

const caseStudyVisualsByLocale = {
  en: [
    {
      imageUrl: "/enterprise/private-ai-dashboard.svg",
      imageAlt:
        "Schematic: governed retrieval UI with citation trail and role-scoped corpus — illustrative reference pattern, not a live system.",
    },
    {
      imageUrl: "/enterprise/workflow-approval-flow.svg",
      imageAlt:
        "Schematic: RFQ-to-approval control flow with named gates and exception queue — illustrative automation pattern.",
    },
    {
      imageUrl: "/enterprise/operations-control-panel.svg",
      imageAlt:
        "Schematic: operator view of queue depth and failure class by integration pair — illustrative monitoring pattern.",
    },
  ],
  ar: [
    {
      imageUrl: "/enterprise/private-ai-dashboard.svg",
      imageAlt:
        "رسم توضيحي: واجهة استرجاع محكوم مع إحالة للمصدر ونطاق معرفة حسب الدور — نموذج مرجعي وليس نظاماً حياً.",
    },
    {
      imageUrl: "/enterprise/workflow-approval-flow.svg",
      imageAlt:
        "رسم توضيحي: مسار طلب عرض إلى اعتماد مع بوابات مسماة وصف استثناءات — نموذج أتمتة مرجعي.",
    },
    {
      imageUrl: "/enterprise/operations-control-panel.svg",
      imageAlt:
        "رسم توضيحي: لوحة تشغيل لعمق الطوابير وتصنيف الفشل حسب أزواج التكامل — نموذج مراقبة مرجعي.",
    },
  ],
} as const;

export default async function EnterpriseOverviewPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const fallback = getEnterprisePage(slug, raw);
  if (!fallback) notFound();
  const sp = (await searchParams) ?? {};
  const highlightFromQuery = Array.isArray(sp.highlight)
    ? sp.highlight[0]
    : sp.highlight;
  const app = getMessages(raw).enterpriseAppendix;

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
  const baseDefaults = buildEnterpriseLandingMergeDefaults(raw);
  const caseStudyVisuals =
    raw === "ar" ? caseStudyVisualsByLocale.ar : caseStudyVisualsByLocale.en;
  const landing = mergeEnterpriseLandingSections(cms, cmsEn, raw, {
    ...baseDefaults,
    caseStudies: {
      ...baseDefaults.caseStudies,
      items: baseDefaults.caseStudies.items.map((item, i) => ({
        ...item,
        visual: { ...item.visual, ...(caseStudyVisuals[i] ?? {}) },
      })),
    },
  });
  const mediaAssets = bundle.mediaAssets ?? {};

  const programRows =
    ev.programCards.length > 0
      ? ev.programCards.map((card, i) => ({
          href:
            card.href?.trim() ||
            deepLinkPaths[i] ||
            deepLinkPaths[0] ||
            "/enterprise",
          label:
            card.title?.trim() ||
            card.label?.trim() ||
            app.deepLinks[i]?.label ||
            "",
          description:
            card.description?.trim() || app.deepLinks[i]?.description || "",
          imageUrl: card.imageUrl,
          imageAlt: card.imageAlt,
          imageMediaAssetId: card.imageMediaAssetId,
        }))
      : app.deepLinks.map((item, i) => ({
          href: deepLinkPaths[i]!,
          label: item.label,
          description: item.description,
          imageUrl: undefined as string | undefined,
          imageAlt: undefined as string | undefined,
          imageMediaAssetId: undefined as string | undefined,
        }));

  return (
    <EnterpriseLandingPage
      locale={raw}
      content={content}
      enterpriseVisuals={ev}
      landing={landing}
      cms={cms}
      cmsEn={cmsEn}
      mediaAssets={mediaAssets}
      programRows={programRows}
      programsSectionTitle={app.title}
      highlightSection={
        typeof highlightFromQuery === "string" && highlightFromQuery.trim()
          ? highlightFromQuery.trim()
          : undefined
      }
    />
  );
}
