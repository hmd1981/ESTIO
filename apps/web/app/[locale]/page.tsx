import type { Metadata } from "next";
import { SectionHighlightFrame } from "@/components/section-highlight/section-highlight-frame";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { CtaStripSection } from "@/components/sections/cta-strip-section";
import { EnterpriseHighlightSection } from "@/components/sections/enterprise-highlight-section";
import { GuidedIntentSection } from "@/components/sections/guided-intent-section";
import { HeroSection } from "@/components/sections/hero-section";
import { IndustriesSection } from "@/components/sections/industries-section";
import { ServicesOverviewSection } from "@/components/sections/services-overview-section";
import { TrustSection } from "@/components/sections/trust-section";
import { AiOutputPreviewSection } from "@/components/sections/ai-output-preview-section";
import { MarketingGpuBanner } from "@/components/ai-studio/marketing-gpu-banner";
import { getPublishedSiteBundle, getSiteBundle } from "@/lib/cms/fetch-site";
import { computeHomeSectionOrder } from "@/lib/cms/home-section-order";
import { mergeHomeSections } from "@/lib/cms/merge-home";
import type { HomeSectionsCMS } from "@/lib/cms/types";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { withLocale } from "@/lib/i18n/paths";
import { brand } from "@/lib/content/site";
import { operationalAlignment, systemIdentity } from "@/lib/content/home";
import { operationalAlignmentAr, systemIdentityAr } from "@/lib/content/home-ar";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string }>;
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

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
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
  const identityBlock = raw === "ar" ? systemIdentityAr : systemIdentity;
  const alignmentBlock = raw === "ar" ? operationalAlignmentAr : operationalAlignment;

  const nodes: Record<string, React.ReactNode> = {
    hero: <HeroSection hero={m.hero} mediaAssets={mediaAssets} />,
    "ai-preview": <AiOutputPreviewSection locale={raw} />,
    identity: (
      <section
        id="identity"
        className="scroll-mt-24 border-b border-[var(--border)] bg-[var(--canvas)] py-10 sm:py-12"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              {identityBlock.heading}
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--text)] sm:text-lg">
              {identityBlock.body}
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--muted)]">
              {identityBlock.contrast}
            </p>
          </div>
        </div>
      </section>
    ),
    alignment: (
      <section
        id="alignment"
        className="scroll-mt-24 border-b border-[var(--border)] bg-[var(--canvas)] py-12 sm:py-14"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              {alignmentBlock.kicker}
            </p>
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-[var(--text)] sm:text-xl">
              {alignmentBlock.title}
            </h2>
            <ul className="mt-6 space-y-3">
              {alignmentBlock.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 border-s-2 border-[var(--accent)]/30 ps-4 text-sm leading-relaxed text-[var(--text-body)]"
                >
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-relaxed text-[var(--muted)]">
              {alignmentBlock.footer}
            </p>
          </div>
        </div>
      </section>
    ),
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
      {/* Renders only when the GPU worker is offline; otherwise nothing. */}
      <MarketingGpuBanner locale={raw} />
      {sectionOrder.map((id) => (
        <SectionHighlightFrame
          key={id}
          sectionId={id}
          fallbackHighlight={cms._meta?.highlightSection}
          data-estio-section={id}
        >
          {nodes[id]}
        </SectionHighlightFrame>
      ))}
    </MarketingShell>
  );
}
