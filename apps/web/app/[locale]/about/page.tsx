import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { getPublishedSiteBundle, getSiteBundle } from "@/lib/cms/fetch-site";
import { mergeAboutVisuals, mergeMarketingHero } from "@/lib/cms/merge-marketing-page";
import type { MarketingPageSectionsCMS } from "@/lib/cms/types";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { brand } from "@/lib/content/site";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { withLocale } from "@/lib/i18n/paths";
import { CmsVisualMedia } from "@/components/cms/cms-visual-media";
import { resolveCmsVisual } from "@/lib/cms/resolve-image";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const [bundle, enPublished] = await Promise.all([
    getSiteBundle(raw),
    raw === "ar" ? getPublishedSiteBundle("en") : Promise.resolve(null),
  ]);
  const cms = (bundle.marketingPages?.about?.sections ??
    {}) as MarketingPageSectionsCMS;
  const cmsEn =
    raw === "ar"
      ? ((enPublished?.marketingPages?.about?.sections ??
          {}) as MarketingPageSectionsCMS)
      : undefined;
  const a = getMessages(raw).about;
  const seoTitle =
    cms.seoTitle?.trim() ||
    (raw === "ar" ? "" : cmsEn?.seoTitle?.trim()) ||
    a.seoTitle;
  const seoDesc =
    cms.seoDescription?.trim() ||
    (raw === "ar" ? "" : cmsEn?.seoDescription?.trim()) ||
    a.seoDescription;
  return marketingDetailMetadata(
    {
      title: seoTitle,
      description: seoDesc,
    },
    `/${raw}/about`,
  );
}

export default async function AboutPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const [bundle, enPublished] = await Promise.all([
    getSiteBundle(raw),
    raw === "ar" ? getPublishedSiteBundle("en") : Promise.resolve(null),
  ]);
  const cms = (bundle.marketingPages?.about?.sections ??
    {}) as MarketingPageSectionsCMS;
  const cmsEn =
    raw === "ar"
      ? ((enPublished?.marketingPages?.about?.sections ??
          {}) as MarketingPageSectionsCMS)
      : undefined;
  const sp = (await searchParams) ?? {};
  const highlightFromQuery = Array.isArray(sp.highlight)
    ? sp.highlight[0]
    : sp.highlight;
  const a = getMessages(raw).about;
  const hero = mergeMarketingHero(
    cms,
    {
      kicker: a.kicker,
      h1: a.h1,
      leadP1: a.introP1,
      leadP2: a.introP2,
    },
    { cmsEn, locale: raw },
  );
  const aboutV = mergeAboutVisuals(cms, cmsEn, raw);
  const mediaAssets = bundle.mediaAssets ?? {};
  const heroImg = resolveCmsVisual(hero.heroVisual, mediaAssets);
  const brandImg = resolveCmsVisual(aboutV.brand, mediaAssets);
  const deliveryImg = resolveCmsVisual(aboutV.delivery, mediaAssets);
  const omanImg = resolveCmsVisual(aboutV.oman, mediaAssets);

  const highlight =
    (typeof highlightFromQuery === "string" && highlightFromQuery.trim()
      ? highlightFromQuery.trim()
      : cms._meta?.highlightSection?.trim()) ?? undefined;

  return (
    <MarketingShell>
      <section
        data-estio-section="intro"
        className={
          highlight === "intro"
            ? "border-b border-[var(--border)] bg-[var(--surface)] ring-2 ring-[var(--accent)]/50 ring-inset"
            : "border-b border-[var(--border)] bg-[var(--surface)]"
        }
      >
        <Container as="div" className="py-16 sm:py-20 lg:py-28">
          <div
            className={`grid gap-12 ${heroImg?.url ? "lg:grid-cols-12 lg:items-start" : ""}`}
          >
            <div className={heroImg?.url ? "lg:col-span-7" : ""}>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                {hero.kicker}
              </p>
              <h1 className="font-display mt-6 max-w-3xl text-3xl font-semibold text-[var(--text)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
                {hero.h1}
              </h1>
              <div className="mt-8 max-w-2xl space-y-5 text-base leading-[1.7] text-[var(--text-body)] sm:text-lg">
                <p>{hero.leadP1}</p>
                {hero.leadP2 ? <p>{hero.leadP2}</p> : null}
              </div>
            </div>
            {heroImg?.url ? (
              <div className="lg:col-span-5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--canvas)]">
                  <CmsVisualMedia
                    imageRef={hero.heroVisual ?? {}}
                    mediaAssets={mediaAssets}
                    fill
                    className="object-cover"
                    videoClassName="absolute inset-0 h-full w-full object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {brandImg?.url ? (
        <section className="border-b border-[var(--border)] bg-[var(--canvas)]">
          <Container as="div" className="py-10 sm:py-12 lg:py-14">
            <div className="relative aspect-[21/9] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] sm:aspect-[2.5/1]">
              <CmsVisualMedia
                imageRef={aboutV.brand ?? {}}
                mediaAssets={mediaAssets}
                fill
                className="object-cover"
                videoClassName="absolute inset-0 h-full w-full object-cover"
                sizes="100vw"
              />
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-b border-[var(--border)] bg-[var(--canvas)]">
        <Container as="div" className="py-16 sm:py-20 lg:py-24">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {a.principlesKicker}
          </p>
          <h2 className="font-display mt-3 text-xl font-medium tracking-tight text-[var(--text)] sm:text-2xl">
            {a.principlesH2}
          </h2>
          <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10">
            {a.values.map((v) => (
              <div key={v.title}>
                <h3 className="text-sm font-semibold leading-snug text-[var(--text)]">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-[1.65] text-[var(--muted)]">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <Container as="div" className="py-16 sm:py-20 lg:py-24">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {a.capabilitiesKicker}
          </p>
          <h2 className="font-display mt-3 text-xl font-medium tracking-tight text-[var(--text)] sm:text-2xl">
            {a.capabilitiesH2}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {a.capabilitiesLead}
          </p>
          {deliveryImg?.url ? (
            <div className="relative mt-10 aspect-[2.2/1] max-w-4xl overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--canvas)]">
              <CmsVisualMedia
                imageRef={aboutV.delivery ?? {}}
                mediaAssets={mediaAssets}
                fill
                className="object-cover"
                videoClassName="absolute inset-0 h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 56rem"
              />
            </div>
          ) : null}
          <div className="mt-14 grid gap-px bg-[var(--border)] sm:grid-cols-2">
            {a.capabilities.map((c) => (
              <div
                key={c.title}
                className="bg-[var(--surface)] p-8 lg:p-10"
              >
                <h3 className="font-display text-lg font-medium text-[var(--text)]">
                  {c.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.65] text-[var(--muted)]">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--canvas)]">
        <Container as="div" className="py-16 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 lg:items-start">
            <div className="lg:col-span-5">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                {a.positionKicker}
              </p>
              <h2 className="font-display mt-3 text-xl font-medium tracking-tight text-[var(--text)] sm:text-2xl">
                {a.positionH2}
              </h2>
              <p className="mt-6 text-sm leading-[1.65] text-[var(--muted)] sm:text-base">
                {a.positionBody}
              </p>
            </div>
            {omanImg?.url ? (
              <div className="lg:col-span-6 lg:col-start-7">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                  <CmsVisualMedia
                    imageRef={aboutV.oman ?? {}}
                    mediaAssets={mediaAssets}
                    fill
                    className="object-cover"
                    videoClassName="absolute inset-0 h-full w-full object-cover"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                </div>
              </div>
            ) : null}
            <div
              className={
                omanImg?.url
                  ? "space-y-8 lg:col-span-12"
                  : "space-y-8 lg:col-span-6 lg:col-start-7"
              }
            >
              {a.sidebar.map((s) => (
                <div
                  key={s.title}
                  className="border-s border-[var(--border)] ps-6"
                >
                  <p className="text-sm font-semibold text-[var(--text)]">
                    {s.title}
                  </p>
                  <p className="mt-2 text-sm leading-[1.65] text-[var(--muted)]">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[var(--accent)] text-[var(--accent-fg)] transition-colors duration-200 ease-out">
        <Container as="div" className="py-16 sm:py-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <h2 className="font-display text-xl font-medium tracking-tight sm:text-2xl">
                {a.ctaH2}
              </h2>
              <p className="mt-4 text-pretty text-sm leading-[1.65] text-[color-mix(in_srgb,var(--accent-fg)_88%,transparent)] sm:text-base">
                {a.ctaBody}
              </p>
            </div>
            <ButtonLink
              href={withLocale("/contact", raw)}
              className="shrink-0 bg-[var(--canvas)] !text-[var(--accent)] hover:!bg-[var(--surface-2)]"
            >
              {a.ctaButton}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </MarketingShell>
  );
}
