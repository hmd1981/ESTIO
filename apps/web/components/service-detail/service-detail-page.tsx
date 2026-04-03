import type { ReactNode } from "react";
import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
import type { ServiceDetailContent } from "@/lib/content/types";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Container } from "@/components/layout/container";
import { PageBreadcrumbs } from "@/components/nav/page-breadcrumbs";
import { ButtonLink } from "@/components/ui/button-link";
import type { AppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { withLocale } from "@/lib/i18n/paths";
import type { CmsVisual, HomeListItem, MediaAssetMap } from "@/lib/cms/types";
import { resolveCmsVisual } from "@/lib/cms/resolve-image";

export type EnterpriseMarketingVisuals = {
  hero?: CmsVisual;
  capability?: CmsVisual;
  process?: CmsVisual;
  programCards?: HomeListItem[];
};

type Props = {
  content: ServiceDetailContent;
  locale: AppLocale;
  appendix?: ReactNode;
  /** Renders immediately after the hero section (e.g. sub-navigation). */
  preamble?: ReactNode;
  enterpriseVisuals?: EnterpriseMarketingVisuals;
  mediaAssets?: MediaAssetMap;
  /** Tighter panels / typography for enterprise programme pages under /enterprise. */
  enterpriseTone?: boolean;
};

export function ServiceDetailPage({
  content,
  locale,
  appendix,
  preamble,
  enterpriseVisuals,
  mediaAssets = {},
  enterpriseTone = false,
}: Props) {
  const ui = getMessages(locale);
  const heroRef = enterpriseVisuals?.hero ?? content.heroVisual;
  const heroEv = resolveCmsVisual(heroRef, mediaAssets);
  const capEv = resolveCmsVisual(enterpriseVisuals?.capability, mediaAssets);
  const procEv = resolveCmsVisual(enterpriseVisuals?.process, mediaAssets);
  const t = ui.serviceDetail;
  const homeHref = withLocale("/", locale);
  const secondaryHref = withLocale(content.secondaryCta?.href ?? "/services", locale);
  const parents = content.breadcrumbParents.map((p) => ({
    ...p,
    href: withLocale(p.href, locale),
  }));

  const ent = enterpriseTone;
  const sectionCard = ent
    ? "rounded-sm border border-[var(--border)] bg-[color-mix(in_srgb,var(--canvas)_92%,#000_8%)]"
    : "rounded-md border border-[var(--border)] bg-[var(--canvas)]";

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <Container as="div" className="py-16 sm:py-20 lg:py-28">
          <PageBreadcrumbs
            homeHref={homeHref}
            homeLabel={ui.breadcrumbHome}
            ariaLabel={ui.breadcrumbAria}
            parents={parents}
            current={content.title}
          />
          <div className="mt-4 grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <h1 className="font-display mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl lg:text-[2.75rem]">
                {content.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-[1.7] text-[var(--text-body)] sm:text-lg">
                {content.summary}
              </p>
              {content.additionalSections && content.additionalSections.length > 0 ? (
                <div className="mt-10 max-w-3xl space-y-12 border-t border-[var(--border)] pt-10">
                  {content.additionalSections.map((sec) => (
                    <div key={sec.title}>
                      <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--text)] sm:text-xl">
                        {sec.title}
                      </h2>
                      {sec.paragraphs?.map((p, i) => (
                        <p
                          key={`p-${i}`}
                          className="mt-4 text-sm leading-[1.75] text-[var(--text-body)] sm:text-base"
                        >
                          {p}
                        </p>
                      ))}
                      {sec.bullets && sec.bullets.length > 0 ? (
                        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--text-body)] sm:text-base">
                          {sec.bullets.map((b, i) => (
                            <li key={`b-${i}`} className="flex gap-3">
                              <span
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                                aria-hidden
                              />
                              {b}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
              {content.longDescription ? (
                <div className="mt-8 max-w-3xl whitespace-pre-wrap text-sm leading-[1.75] text-[var(--text-body)] sm:text-base">
                  {content.longDescription}
                </div>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <ButtonLink href={withLocale(content.cta.href, locale)}>
                  {content.cta.buttonLabel}
                </ButtonLink>
                <ButtonLink
                  href={secondaryHref}
                  variant="secondary"
                >
                  {t.allServices}
                </ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-5">
              <PremiumMediaFrame
                imageRef={heroRef ?? {}}
                mediaAssets={mediaAssets}
                aspect="16/10"
                overlay="readability"
                placeholderLabel={ui.enterpriseLanding.mediaPlaceholder}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className={ent ? "" : "!rounded-lg"}
              />
            </div>
          </div>
        </Container>
      </section>

      {preamble}

      {capEv?.url ? (
        <section className="border-b border-[var(--border)] bg-[var(--surface)]">
          <Container as="div" className="py-10 sm:py-12">
            <PremiumMediaFrame
              imageRef={enterpriseVisuals?.capability ?? {}}
              mediaAssets={mediaAssets}
              aspect="2.4/1"
              overlay="readability"
              placeholderLabel={ui.enterpriseLanding.mediaPlaceholder}
              sizes="100vw"
              className={ent ? "" : "!rounded-lg"}
            />
          </Container>
        </section>
      ) : null}

      {(content.capabilities.length > 0 ||
        content.idealClients.length > 0) && (
        <section className="border-b border-[var(--border)] bg-[var(--canvas)] py-14 sm:py-16 lg:py-20">
          <Container as="div">
            <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
              {content.capabilities.length > 0 ? (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                    {t.capabilities}
                  </h2>
                  <ul className="mt-6 space-y-4">
                    {content.capabilities.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-sm leading-relaxed text-[var(--text-body)]"
                      >
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {content.idealClients.length > 0 ? (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                    {t.idealClients}
                  </h2>
                  <ul className="mt-6 space-y-4">
                    {content.idealClients.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-sm leading-relaxed text-[var(--text-body)]"
                      >
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--muted)]"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Container>
        </section>
      )}

      {content.deliverables.length > 0 ? (
        <section className="border-b border-[var(--border)] bg-[var(--surface)] py-14 sm:py-16 lg:py-20">
          <Container as="div">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              {t.whatYouReceive}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              {t.deliverablesIntro}
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.deliverables.map((item) => (
                <li
                  key={item}
                  className={`flex gap-3 p-5 text-sm leading-relaxed text-[var(--text-body)] ${sectionCard}`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mt-0.5 shrink-0 text-[var(--accent)]"
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* Process steps */}
      {content.process && content.process.length > 0 && (
        <section className="border-b border-[var(--border)] bg-[var(--canvas)] py-14 sm:py-16 lg:py-20">
          <Container as="div">
            <div
              className={
                procEv?.url ? "grid gap-10 lg:grid-cols-12 lg:items-start" : ""
              }
            >
              <div className={procEv?.url ? "lg:col-span-7" : ""}>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                  {t.howWeWork}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                  {t.howWeWorkIntro}
                </p>
              </div>
              {procEv?.url ? (
                <div className="lg:col-span-5">
                  <PremiumMediaFrame
                    imageRef={enterpriseVisuals?.process ?? {}}
                    mediaAssets={mediaAssets}
                    aspect="4/3"
                    overlay="readability"
                    placeholderLabel={ui.enterpriseLanding.mediaPlaceholder}
                    sizes="(max-width: 1024px) 100vw, 38vw"
                    className={ent ? "" : "!rounded-lg"}
                  />
                </div>
              ) : null}
            </div>
            <ol
              className={
                ent
                  ? "mt-10 border border-[var(--border)] bg-[color-mix(in_srgb,var(--canvas)_92%,#000_8%)]"
                  : "mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              }
            >
              {content.process.map((p, i) =>
                ent ? (
                  <li
                    key={p.step}
                    className="grid gap-4 border-b border-[var(--border)] px-5 py-6 last:border-b-0 sm:grid-cols-[minmax(0,5rem)_1fr] sm:gap-8 sm:px-8 sm:py-7"
                  >
                    <span className="font-display text-2xl font-semibold tabular-nums text-[var(--accent)]/35 sm:pt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)]">{p.step}</h3>
                      <p className="mt-2 text-sm leading-[1.65] text-[var(--muted)]">
                        {p.description}
                      </p>
                    </div>
                  </li>
                ) : (
                  <li key={p.step} className="relative">
                    <span className="font-display text-3xl font-semibold text-[var(--accent)]/20">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 text-sm font-semibold text-[var(--text)]">{p.step}</h3>
                    <p className="mt-2 text-sm leading-[1.65] text-[var(--muted)]">
                      {p.description}
                    </p>
                  </li>
                ),
              )}
            </ol>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[var(--surface)] py-14 sm:py-16 lg:py-20">
        <Container as="div">
          <div
            className={
              ent
                ? "rounded-sm border border-[color-mix(in_srgb,var(--accent)_22%,var(--border)_78%)] bg-[color-mix(in_srgb,var(--canvas)_94%,#000_6%)] px-8 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16"
                : "rounded-lg border border-[var(--accent)]/20 bg-[var(--canvas)] px-8 py-10 sm:px-10 lg:px-12 lg:py-14"
            }
          >
            <h2 className="font-display text-xl font-semibold text-[var(--text)] sm:text-2xl">
              {content.cta.headline}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              {content.cta.body}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <ButtonLink href={withLocale(content.cta.href, locale)}>
                {content.cta.buttonLabel}
              </ButtonLink>
              <ButtonLink
                href={secondaryHref}
                variant="ghost"
              >
                {t.viewAllServices}
              </ButtonLink>
            </div>
            {appendix}
          </div>
        </Container>
      </section>
    </MarketingShell>
  );
}
