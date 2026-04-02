import type { Metadata } from "next";
import { Fragment } from "react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { CtaStripSection } from "@/components/sections/cta-strip-section";
import { EnterpriseHighlightSection } from "@/components/sections/enterprise-highlight-section";
import { GuidedIntentSection } from "@/components/sections/guided-intent-section";
import { HeroSection } from "@/components/sections/hero-section";
import { IndustriesSection } from "@/components/sections/industries-section";
import { ServicesOverviewSection } from "@/components/sections/services-overview-section";
import { TrustSection } from "@/components/sections/trust-section";
import { getPublishedSiteBundle, getSiteBundle } from "@/lib/cms/fetch-site";
import { computeHomeSectionOrder } from "@/lib/cms/home-section-order";
import { mergeHomeSections } from "@/lib/cms/merge-home";
import type { HomeSectionsCMS } from "@/lib/cms/types";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { withLocale } from "@/lib/i18n/paths";
import { brand } from "@/lib/content/site";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const bundle = await getSiteBundle(raw);
  const cms = (bundle.homePage?.sections ?? {}) as HomeSectionsCMS;
  const cmsEn =
    raw === "ar"
      ? ((await getPublishedSiteBundle("en")).homePage?.sections ??
        {}) as HomeSectionsCMS
      : undefined;
  const m = mergeHomeSections(cms, raw, cmsEn);
  const path = raw === "en" ? "/en" : `/ar`;
  const titleSuffix = getMessages(raw).homeMetadataTitleSuffix;
  return {
    title: `${brand.name} — ${titleSuffix}`,
    description: m.hero.subheadline,
    alternates: {
      canonical: path,
      languages: { en: "/en", ar: "/ar" },
    },
    openGraph: {
      title: `${brand.name} — ${m.hero.headline}`,
      description: m.hero.subheadline,
      url: path,
      siteName: brand.name,
      type: "website",
      locale: raw === "ar" ? "ar" : "en",
    },
    twitter: {
      card: "summary_large_image",
      title: `${brand.name} — ${m.hero.headline}`,
      description: m.hero.subheadline,
    },
  };
}

export default async function HomePage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const sp = (await searchParams) ?? {};
  const highlightFromQuery = Array.isArray(sp.highlight)
    ? sp.highlight[0]
    : sp.highlight;
  const bundle = await getSiteBundle(raw);
  const cms = (bundle.homePage?.sections ?? {}) as HomeSectionsCMS;
  const cmsEn =
    raw === "ar"
      ? ((await getPublishedSiteBundle("en")).homePage?.sections ??
        {}) as HomeSectionsCMS
      : undefined;
  const m = mergeHomeSections(cms, raw, cmsEn);
  const mediaAssets = bundle.mediaAssets ?? {};
  const sectionOrder = computeHomeSectionOrder(cms);
  const highlight = (() => {
    const q = highlightFromQuery;
    if (typeof q === "string" && q.trim()) return q.trim();
    return cms._meta?.highlightSection?.trim();
  })();

  const nodes: Record<string, React.ReactNode> = {
    hero: <HeroSection hero={m.hero} mediaAssets={mediaAssets} />,
    guided: (
      <GuidedIntentSection
        guided={m.guided}
        learnMoreLabel={getMessages(raw).servicesListing.learnMore}
        mediaAssets={mediaAssets}
      />
    ),
    trust: (
      <TrustSection
        intro={m.trustIntro}
        points={m.trustPts}
        mediaAssets={mediaAssets}
      />
    ),
    services: (
      <ServicesOverviewSection
        intro={m.svcIntro}
        cards={m.pillars}
        learnMoreLabel={getMessages(raw).servicesListing.learnMore}
        mediaAssets={mediaAssets}
      />
    ),
    enterprise: (
      <EnterpriseHighlightSection
        kicker={getMessages(raw).homeEnterpriseBridge.eyebrow}
        headline={m.ent.headline}
        body={m.ent.body}
        subtitle={m.ent.subtitle}
        imageUrl={m.ent.imageUrl}
        imageAlt={m.ent.imageAlt}
        imageMediaAssetId={m.ent.imageMediaAssetId}
        blocks={m.ent.bullets}
        cta={m.ent.cta}
        secondaryCta={{
          label: getMessages(raw).homeEnterpriseBridge.secondaryCtaLabel,
          href: withLocale("/enterprise", raw),
        }}
        mediaAssets={mediaAssets}
        mediaPlaceholderLabel={getMessages(raw).enterpriseLanding.mediaPlaceholder}
      />
    ),
    industries: (
      <IndustriesSection
        intro={m.indIntro}
        items={m.inds}
        mediaAssets={mediaAssets}
      />
    ),
    cta: (
      <CtaStripSection
        headline={m.cta.headline}
        body={m.cta.body}
        buttonLabel={m.cta.buttonLabel}
        href={m.cta.href}
        imageUrl={m.cta.imageUrl}
        imageAlt={m.cta.imageAlt}
        imageMediaAssetId={m.cta.imageMediaAssetId}
        mediaAssets={mediaAssets}
      />
    ),
  };

  return (
    <MarketingShell>
      {sectionOrder.map((id) => (
        <Fragment key={id}>
          <div
            data-estio-section={id}
            className={
              highlight === id
                ? "ring-2 ring-[var(--accent)]/50 ring-inset"
                : undefined
            }
          >
            {nodes[id]}
          </div>
        </Fragment>
      ))}
    </MarketingShell>
  );
}
