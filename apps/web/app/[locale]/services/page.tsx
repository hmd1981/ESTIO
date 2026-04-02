import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { getPublishedSiteBundle, getSiteBundle } from "@/lib/cms/fetch-site";
import {
  mergeMarketingHero,
  mergeMarketingServiceGroups,
} from "@/lib/cms/merge-marketing-page";
import type { MarketingPageSectionsCMS } from "@/lib/cms/types";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { getServiceOverviewGroups } from "@/lib/content/service-pages";
import { brand } from "@/lib/content/site";
import type { AppLocale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { withLocale } from "@/lib/i18n/paths";
import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const SAFE_DETAIL_ROUTES = new Set([
  "/services/web-design-development",
  "/services/content-campaigns",
  "/services/ai-creative",
  "/enterprise",
]);

function resolveSafeServiceHref(
  locale: AppLocale,
  fallbackPath: string,
  cmsHref?: string,
) {
  const raw = cmsHref?.trim();
  if (!raw) return withLocale(fallbackPath, locale);
  if (raw.startsWith("http") || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
    return raw;
  }
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  if (normalized.startsWith(`/${locale}/`)) {
    const unprefixed = normalized.replace(/^\/(en|ar)(?=\/)/, "");
    return SAFE_DETAIL_ROUTES.has(unprefixed)
      ? normalized
      : withLocale(fallbackPath, locale);
  }
  return SAFE_DETAIL_ROUTES.has(normalized)
    ? withLocale(normalized, locale)
    : withLocale(fallbackPath, locale);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const bundle = await getSiteBundle(raw);
  const cms = (bundle.marketingPages?.services?.sections ??
    {}) as MarketingPageSectionsCMS;
  const cmsEn =
    raw === "ar"
      ? (((await getPublishedSiteBundle("en")).marketingPages?.services
          ?.sections ?? {}) as MarketingPageSectionsCMS)
      : undefined;
  const L = getMessages(raw).servicesListing;
  return marketingDetailMetadata(
    {
      title: cms.seoTitle ?? cmsEn?.seoTitle ?? L.seoTitle,
      description:
        (cms.seoDescription ?? cmsEn?.seoDescription ?? L.seoDescription).replace(
          "Estio",
          brand.name,
        ),
    },
    `/${raw}/services`,
  );
}

export default async function ServicesOverviewPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const bundle = await getSiteBundle(raw);
  const cms = (bundle.marketingPages?.services?.sections ??
    {}) as MarketingPageSectionsCMS;
  const cmsEn =
    raw === "ar"
      ? (((await getPublishedSiteBundle("en")).marketingPages?.services
          ?.sections ?? {}) as MarketingPageSectionsCMS)
      : undefined;
  const sp = (await searchParams) ?? {};
  const highlightFromQuery = Array.isArray(sp.highlight)
    ? sp.highlight[0]
    : sp.highlight;
  const L = getMessages(raw).servicesListing;
  const groups = getServiceOverviewGroups(raw);
  const hero = mergeMarketingHero(
    cms,
    {
      kicker: L.kicker,
      h1: L.h1,
      leadP1: L.lead,
      leadP2: L.lead2,
    },
    { cmsEn, locale: raw },
  );
  const groupVisuals = mergeMarketingServiceGroups(
    cms,
    cmsEn,
    raw,
    groups.map((g) => g.id),
  );
  const highlight =
    (typeof highlightFromQuery === "string" && highlightFromQuery.trim()
      ? highlightFromQuery.trim()
      : cms._meta?.highlightSection?.trim()) ?? undefined;

  const mediaAssets = bundle.mediaAssets ?? {};

  return (
    <MarketingShell>
      <section
        className={
          highlight === "intro"
            ? "border-b border-[var(--border)] bg-[var(--surface)] ring-2 ring-[var(--accent)]/50 ring-inset"
            : "border-b border-[var(--border)] bg-[var(--surface)]"
        }
        data-estio-section="intro"
      >
        <Container as="div" className="py-16 sm:py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                {hero.kicker}
              </p>
              <h1 className="font-display mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl lg:text-[2.75rem]">
                {hero.h1}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-[1.7] text-[var(--text-body)] sm:text-lg">
                {hero.leadP1}
              </p>
              {hero.leadP2 ? (
                <p className="mt-4 max-w-2xl text-sm leading-[1.7] text-[var(--muted)] sm:text-base">
                  {hero.leadP2}
                </p>
              ) : null}
            </div>
            <div className="lg:col-span-5">
              <PremiumMediaFrame
                imageRef={hero.heroVisual ?? {}}
                mediaAssets={mediaAssets}
                aspect="16/10"
                overlay="readability"
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="!rounded-lg"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[var(--canvas)] py-14 sm:py-16 lg:py-20">
        <Container as="div" className="space-y-16 sm:space-y-20">
          {groups.map((group) => {
            const gv = groupVisuals[group.id];
            return (
              <div key={group.id}>
                <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                  <div className="border-s-2 border-[var(--accent)] ps-5 sm:ps-6 lg:col-span-7">
                    <h2 className="font-display text-xl font-semibold text-[var(--text)] sm:text-2xl">
                      {gv?.title || group.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                      {gv?.description || group.description}
                    </p>
                  </div>
                  <div className="lg:col-span-5">
                    <PremiumMediaFrame
                      imageRef={{
                        imageUrl: gv?.imageUrl,
                        imageAlt: gv?.imageAlt,
                        imageMediaAssetId: gv?.imageMediaAssetId,
                      }}
                      mediaAssets={mediaAssets}
                      aspect="16/10"
                      overlay="readability"
                      sizes="(max-width: 1024px) 100vw, 38vw"
                      className="!rounded-lg"
                    />
                  </div>
                </div>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {group.items.map((item) => {
                    const fallbackPath =
                      item.slug === "enterprise" ? "/enterprise" : `/services/${item.slug}`;
                    const iv = gv?.itemImages[item.slug];
                    const href = resolveSafeServiceHref(raw, fallbackPath, iv?.href);
                    return (
                      <li key={item.slug}>
                        <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0 shadow-sm transition-shadow hover:shadow-md">
                          <PremiumMediaFrame
                            aspectClassName="aspect-[16/9] w-full sm:aspect-[2/1]"
                            imageRef={{
                              imageUrl: iv?.imageUrl,
                              imageAlt: iv?.imageAlt,
                              imageMediaAssetId: iv?.imageMediaAssetId,
                            }}
                            mediaAssets={mediaAssets}
                            sizes="(max-width: 640px) 100vw, 50vw"
                            className="rounded-none border-x-0 border-t-0 shadow-none"
                          />
                          <div className="flex flex-1 flex-col p-6 lg:p-8">
                            <h3 className="font-display text-lg font-semibold text-[var(--text)]">
                              {iv?.title || item.title}
                            </h3>
                            <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                              {iv?.description || item.summary}
                            </p>
                            <Link
                              href={href}
                              className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                            >
                              {L.learnMore}
                            </Link>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </Container>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--accent)] text-[var(--accent-fg)] py-14 sm:py-16 transition-colors duration-200 ease-out">
        <Container
          as="div"
          className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center"
        >
          <div className="max-w-xl">
            <h2 className="font-display text-xl font-semibold sm:text-2xl">
              {L.bottomH2}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color-mix(in_srgb,var(--accent-fg)_88%,transparent)] sm:text-base">
              {L.bottomBody}
            </p>
          </div>
          <ButtonLink
            href={withLocale("/contact", raw)}
            className="shrink-0 bg-[var(--canvas)] !text-[var(--accent)] hover:!bg-[var(--surface-2)]"
          >
            {L.bottomCta}
          </ButtonLink>
        </Container>
      </section>
    </MarketingShell>
  );
}
