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

const caseStudyVisuals = [
  {
    imageUrl: "/enterprise/private-ai-dashboard.svg",
    imageAlt: "Private AI dashboard",
  },
  {
    imageUrl: "/enterprise/workflow-approval-flow.svg",
    imageAlt: "Workflow approval flow",
  },
  {
    imageUrl: "/enterprise/operations-control-panel.svg",
    imageAlt: "Operations control panel",
  },
] as const;

export default async function EnterpriseOverviewPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const fallback = getEnterprisePage(slug, raw);
  if (!fallback) notFound();
  const sp = (await searchParams) ?? {};
  const highlightFromQuery = Array.isArray(sp.highlight)
    ? sp.highlight[0]
    : sp.highlight;
  const content = await resolvePublishedServiceDetail(slug, raw, fallback);
  const app = getMessages(raw).enterpriseAppendix;

  const bundle = await getSiteBundle(raw);
  const cms = (bundle.marketingPages?.enterprise?.sections ??
    {}) as MarketingPageSectionsCMS;
  const cmsEn =
    raw === "ar"
      ? (((await getPublishedSiteBundle("en")).marketingPages?.enterprise
          ?.sections ?? {}) as MarketingPageSectionsCMS)
      : undefined;
  const ev = mergeEnterpriseVisuals(cms, cmsEn, raw);
  const baseDefaults = buildEnterpriseLandingMergeDefaults(raw);
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
