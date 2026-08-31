import Image from "next/image";
import Link from "next/link";
import {
  PremiumMediaEmpty,
  PremiumMediaFrame,
} from "@/components/cms/premium-media-frame";
import { Container } from "@/components/layout/container";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { AiStudioSubNav } from "@/components/ai-studio/ai-studio-sub-nav";
import { AiStudioStickyNav } from "@/components/ai-studio/ai-studio-sticky-nav";
import { AskEstioAiSection } from "@/components/ai-studio/ask-estio-ai-section";
import { AiStudioConversionLayer } from "@/components/ai-studio/ai-studio-conversion-layer";
import { AiStudioFunnelV3Panel } from "@/components/ai-studio/ai-studio-funnel-v3-panel";
import { MarketingGpuBanner } from "@/components/ai-studio/marketing-gpu-banner";
import { StudioCreditsPanel } from "@/components/ai-studio/studio-credits-panel";
import {
  aiStudioOfferCardBullets,
  type AiStudioLandingContent,
} from "@/lib/content/ai-studio-pages";
import type { AppLocale } from "@/lib/i18n/config";
import { imageNeedsUnoptimized } from "@/lib/cms/resolve-image";
import { withLocale } from "@/lib/i18n/paths";

/** Resolved in `page.tsx` from CMS + `mediaAssets`. */
export type AiStudioResolvedMedia = {
  hasAmbientBackdrop: boolean;
  backdropVideoUrl?: string;
  backdropMimeType?: string;
  backdropPosterUrl?: string;
  backdropPosterAlt?: string;
  heroPanelVideoUrl?: string;
  heroPanelMimeType?: string;
  heroPanelImage?: { url: string; alt: string };
  /** Optional still frame for `<video poster>` on the hero panel. */
  heroPosterUrl?: string;
  heroVisualLabel: string;
};

type Props = {
  content: AiStudioLandingContent;
  locale: AppLocale;
  media: AiStudioResolvedMedia;
};

const panelClass =
  "rounded-sm border border-[color-mix(in_srgb,var(--border)_92%,var(--accent)_8%)] bg-[color-mix(in_srgb,var(--surface)_96%,#000_4%)] shadow-[0_1px_0_rgba(212,175,55,0.06)]";

function band(ambient: boolean, tone: "surface" | "dark"): string {
  const b = "border-b border-[var(--border)]";
  if (!ambient) {
    return tone === "dark"
      ? `${b} bg-[#050505]`
      : `${b} bg-[var(--surface)]`;
  }
  return tone === "dark"
    ? `${b} border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,#050505_86%,transparent)] backdrop-blur-sm`
    : `${b} border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] backdrop-blur-sm`;
}

export function AiStudioLandingPage({ content, locale, media }: Props) {
  const c = content;
  const m = media;
  const ambient = m.hasAmbientBackdrop;

  return (
    <MarketingShell>
      <div className="relative">
        {m.backdropVideoUrl ? (
          <>
            <div
              className="pointer-events-none fixed inset-0 z-0 overflow-hidden motion-reduce:hidden"
              aria-hidden
            >
              <video
                className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-110 object-cover opacity-[0.42]"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={m.backdropPosterUrl}
              >
                {m.backdropMimeType ? (
                  <source
                    src={m.backdropVideoUrl}
                    type={m.backdropMimeType}
                  />
                ) : (
                  <source src={m.backdropVideoUrl} />
                )}
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-black/88" />
            </div>
            <div
              className="pointer-events-none fixed inset-0 z-0 hidden motion-reduce:block"
              style={
                m.backdropPosterUrl
                  ? {
                      backgroundImage: `url(${m.backdropPosterUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
              aria-hidden
            />
            <div
              className="pointer-events-none fixed inset-0 z-[1] hidden bg-black/80 motion-reduce:block"
              aria-hidden
            />
          </>
        ) : null}

        <div className="relative z-10">
          {/* GPU outage banner — only renders when the worker is offline. */}
          <MarketingGpuBanner locale={locale} />

          {/* ── Hero ── */}
          <section id="ai-studio-hero" className={band(ambient, "surface")}>
            <Container as="div" className="py-16 sm:py-20 lg:py-28">
              <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-6 xl:col-span-5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                    {c.hero.kicker}
                  </p>
                  <h1 className="font-display mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
                    {c.hero.headline}
                  </h1>
                  <p className="mt-8 max-w-2xl text-base leading-[1.75] text-[var(--text-body)] sm:text-lg">
                    {c.hero.lead}
                  </p>
                  {/* Identity match line */}
                  <p className="mt-4 text-sm font-medium text-[var(--accent)]/70">
                    {locale === "ar"
                      ? "للعلامات التجارية والوكالات وفرق التسويق في الخليج"
                      : "For brands, agencies, and marketing teams across the GCC"}
                  </p>

                  <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <ButtonLink
                      href={withLocale(c.hero.primaryCta.href, locale)}
                    >
                      {c.hero.primaryCta.label}
                    </ButtonLink>
                    <ButtonLink
                      href={withLocale(c.hero.secondaryCta.href, locale)}
                      variant="secondary"
                    >
                      {c.hero.secondaryCta.label}
                    </ButtonLink>
                  </div>
                  <p className="mt-4 max-w-xl text-xs leading-relaxed text-[var(--muted)]">
                    {locale === "ar"
                      ? "\u0627\u0628\u062a\u062f\u0627\u0621\u064b \u0645\u0646 150 \u062f\u0648\u0644\u0627\u0631\u064b\u0627 \u0623\u0645\u0631\u064a\u0643\u064a\u064b\u0627 \u062d\u0633\u0628 \u0627\u0644\u0646\u0637\u0627\u0642."
                      : "From $150 depending on scope."}
                  </p>

                  {/* Early decision trigger */}
                  <div className="mt-8 flex flex-wrap items-center gap-2.5">
                    <span className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--muted)]">
                      {locale === "ar" ? "ماذا تحتاجون:" : "I need:"}
                    </span>
                    {[
                      {
                        href: "#offer-images",
                        en: "Images",
                        ar: "صور",
                        funnelIntent: "images" as const,
                      },
                      {
                        href: "#offer-video",
                        en: "Video",
                        ar: "فيديو",
                        funnelIntent: "video" as const,
                      },
                      {
                        href: "#offer-packs",
                        en: "Brand system",
                        ar: "نظام العلامة",
                        funnelIntent: "brand" as const,
                      },
                    ].map((opt) => (
                      <a
                        key={opt.href}
                        href={opt.href}
                        data-ai-funnel-intent={opt.funnelIntent}
                        className="rounded-full border border-[var(--accent)]/25 px-3.5 py-1.5 text-[0.75rem] font-semibold text-[var(--accent)] transition-all duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                      >
                        {locale === "ar" ? opt.ar : opt.en}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="relative flex min-h-[200px] flex-col gap-6 lg:col-span-6 xl:col-span-7">
                  <AskEstioAiSection locale={locale} ambient={ambient} />
                  <PremiumMediaFrame
                    aspectClassName="aspect-[16/10] w-full sm:aspect-[2/1] lg:aspect-[21/10]"
                    overlay={
                      m.heroPanelVideoUrl || m.heroPanelImage
                        ? "readability"
                        : "none"
                    }
                    slot={
                      m.heroPanelVideoUrl ? (
                        <video
                          className="absolute inset-0 h-full w-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          controls={false}
                          poster={m.heroPosterUrl}
                          aria-label={m.heroVisualLabel}
                        >
                          {m.heroPanelMimeType ? (
                            <source
                              src={m.heroPanelVideoUrl}
                              type={m.heroPanelMimeType}
                            />
                          ) : (
                            <source src={m.heroPanelVideoUrl} />
                          )}
                        </video>
                      ) : m.heroPanelImage ? (
                        <Image
                          src={m.heroPanelImage.url}
                          alt={m.heroPanelImage.alt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 55vw"
                          unoptimized={imageNeedsUnoptimized(
                            m.heroPanelImage.url,
                          )}
                          priority
                        />
                      ) : (
                        <PremiumMediaEmpty label="Studio visual" />
                      )
                    }
                  />
                </div>

                {/* Credits + checkout — full width, centered, visible in first screen with hero */}
                <div className="mt-10 min-w-0 lg:col-span-12">
                  <StudioCreditsPanel
                    locale={locale}
                    ambient={ambient}
                    embedded
                  />
                </div>
              </div>
            </Container>
          </section>

          {/* ── Internal Studio Navigation ── */}
          <AiStudioSubNav locale={locale} />

          {/* ── Sticky In-Page Nav (scroll-triggered) ── */}
          <AiStudioStickyNav locale={locale} />

          {/* ── Offer Category Cards ── */}
          <section
            id="studio-offers"
            className={`scroll-mt-24 ${band(ambient, "surface")}`}
          >
            <Container as="div" className="py-16 sm:py-20 lg:py-24">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                {c.hero.kicker}
              </p>

              {/* Decision acceleration */}
              <p className="mt-4 text-base font-medium text-[var(--text)] sm:text-lg">
                {locale === "ar"
                  ? "\u0627\u062e\u062a\u0631 \u0646\u0642\u0637\u0629 \u0628\u062f\u0627\u064a\u062a\u0643 \u2014 \u0646\u062d\u0646 \u0646\u062a\u0648\u0644\u0649 \u0627\u0644\u0625\u0646\u062a\u0627\u062c."
                  : "Choose your starting point \u2014 we\u2019ll handle the production."}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
                {locale === "ar" ? (
                  <>
                    {"\u0625\u0630\u0627 \u0643\u0646\u062a \u062a\u062d\u062a\u0627\u062c: \u0645\u0631\u0626\u064a\u0627\u062a \u062b\u0627\u0628\u062a\u0629 \u2192 "}
                    <strong className="text-[var(--text)]">{"\u0635\u0648\u0631"}</strong>
                    {" \u00b7 \u0641\u064a\u062f\u064a\u0648 \u2192 "}
                    <strong className="text-[var(--text)]">{"\u0641\u064a\u062f\u064a\u0648"}</strong>
                    {" \u00b7 \u0646\u0638\u0627\u0645 \u0639\u0644\u0627\u0645\u0629 \u0643\u0627\u0645\u0644 \u2192 "}
                    <strong className="text-[var(--text)]">{"\u062d\u0632\u0645"}</strong>
                  </>
                ) : (
                  <>
                    {"If you need: static visuals \u2192 "}
                    <strong className="text-[var(--text)]">AI Images</strong>
                    {" \u00b7 video content \u2192 "}
                    <strong className="text-[var(--text)]">AI Video</strong>
                    {" \u00b7 full brand system \u2192 "}
                    <strong className="text-[var(--text)]">AI Packs</strong>
                  </>
                )}
              </p>

              <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:gap-8">
                {c.offerCards.map((card, i) => {
                  const anchorId = ["offer-images", "offer-video", "offer-packs"][i];
                  const cardBullets = aiStudioOfferCardBullets(card);
                  const trustLine = locale === "ar"
                    ? [
                        "\u0645\u0631\u0627\u062c\u0639\u0629 \u0642\u0628\u0644 \u0627\u0644\u062a\u0633\u0644\u064a\u0645",
                        "\u062c\u0627\u0647\u0632 \u0644\u0644\u0646\u0634\u0631 \u2014 \u0644\u064a\u0633 \u0645\u0644\u0641\u0627\u062a \u062e\u0627\u0645",
                        "\u0644\u0644\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u062d\u0642\u064a\u0642\u064a\u0629\u060c \u0644\u064a\u0633 \u062a\u062c\u0627\u0631\u0628",
                      ][i]
                    : [
                        "Reviewed before delivery",
                        "Production-ready files \u2014 not raw dumps",
                        "Built for real campaigns",
                      ][i];

                  return (
                    <div
                      key={`card-${i}`}
                      id={anchorId}
                      className="scroll-mt-36 flex flex-col"
                    >
                      <Link
                        href={withLocale(card.href, locale)}
                        className={`group flex flex-1 flex-col overflow-hidden ${panelClass} text-left transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_42%,var(--border)_58%)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`}
                      >
                        {card.imageUrl && (
                          <div className="relative aspect-[2/1] w-full overflow-hidden border-b border-[var(--border)]">
                            <Image
                              src={card.imageUrl}
                              alt={card.imageAlt ?? card.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                              sizes="(max-width: 640px) 100vw, 33vw"
                            />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-6 sm:p-7">
                          {/* Decision tag */}
                          {card.bestFor.length > 0 && (
                            <p className="mb-3 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[var(--accent)]/70">
                              {locale === "ar" ? "\u0627\u0644\u0623\u0641\u0636\u0644 \u0644\u0640: " : "Best for: "}{card.bestFor.join(" / ")}
                            </p>
                          )}

                          <h3 className="font-display text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                            {card.title}
                          </h3>
                          <p className="mt-2 text-sm leading-[1.65] text-[var(--muted)]">
                            {card.description}
                          </p>

                          {/* Trust signal */}
                          <p className="mt-3 text-[0.7rem] font-medium italic text-[var(--accent)]/60">
                            {trustLine}
                          </p>

                          {cardBullets.length > 0 ? (
                            <div className="mt-5 border-t border-[var(--border)] pt-5">
                              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                                {locale === "ar" ? "\u0641\u064a \u0627\u0644\u0623\u0633\u0627\u0633" : "The basics"}
                              </p>
                              <ul className="mt-3 space-y-1.5">
                                {cardBullets.map((item, j) => (
                                  <li
                                    key={`wyg-${i}-${j}`}
                                    className="flex gap-2 text-sm text-[var(--text-body)]"
                                  >
                                    <span
                                      className="mt-2 h-1 w-1 shrink-0 bg-[var(--accent)]"
                                      aria-hidden
                                    />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {card.typicalOutputs.trim() ? (
                            <p className="mt-4 text-xs text-[var(--muted)]">
                              {locale === "ar"
                                ? "\u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0646\u0645\u0648\u0630\u062c\u064a: "
                                : "Typical scope: "}
                              {card.typicalOutputs}
                            </p>
                          ) : null}

                          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                            {card.cta}
                            <span
                              className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none rtl:rotate-180"
                              aria-hidden
                            >
                              &rarr;
                            </span>
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </Container>
          </section>

          {/* ── Selected Studio Outputs (intermediate engagement) ── */}
          <section className={band(ambient, "dark")}>
            <Container as="div" className="py-14 sm:py-16 lg:py-20">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                {c.studioOutputs.title}
              </p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
                {locale === "ar"
                  ? "\u0623\u0646\u0645\u0627\u0637 \u0644\u0644\u0623\u0633\u0644\u0648\u0628 \u0648\u0627\u0644\u062a\u0646\u0633\u064a\u0642 \u2014 \u0645\u062e\u0631\u062c\u0627\u062a\u0643 \u0627\u0644\u0641\u0639\u0644\u064a\u0629 \u062a\u0637\u0627\u0628\u0642 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062a\u0641\u0642 \u0639\u0644\u064a\u0647."
                  : "Illustrative of style and layout \u2014 your files match the scope we agree."}
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-3 lg:gap-6">
                {c.studioOutputs.samples.map((s, i) => {
                  const sampleLink = ["#offer-images", "#offer-video", "#offer-packs"][i];
                  return (
                    <a
                      key={`sample-${i}`}
                      href={sampleLink}
                      className={`${panelClass} group overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-[color-mix(in_srgb,var(--accent)_42%,var(--border)_58%)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]`}
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden">
                        <Image
                          src={s.imageUrl}
                          alt={s.imageAlt}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <p className="text-xs font-medium text-[var(--muted)]">
                          {s.label}
                        </p>
                        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[var(--accent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          {locale === "ar" ? "اعرف المزيد" : "Learn more"} &rarr;
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
              <p className="mt-8 text-center text-sm text-[var(--muted)]">
                <a
                  href={withLocale("/contact?interest=AI_STUDIO&streamlined=1", locale)}
                  className="font-medium text-[var(--accent)] underline decoration-[var(--accent)]/30 underline-offset-4 transition-colors duration-200 hover:decoration-[var(--accent)]"
                >
                  {locale === "ar"
                    ? "\u0627\u062d\u0635\u0644\u0648\u0627 \u0639\u0644\u0649 \u0639\u0631\u0636 \u0633\u0639\u0631 \u2014 \u0646\u0631\u062f \u0628\u062e\u0637\u0648\u0629 \u062a\u0627\u0644\u064a\u0629"
                    : "Get a project quote \u2014 we\u2019ll reply with next steps"}
                </a>
              </p>
            </Container>
          </section>

          {/* ── AI Studio vs AI Creative Services ── */}
          <section className={band(ambient, "surface")}>
            <Container as="div" className="py-10 sm:py-12">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                  {c.separator.title}
                </h2>
                <p className="mt-4 text-sm leading-[1.75] text-[var(--text-body)]">
                  {c.separator.body}
                </p>
              </div>
            </Container>
          </section>

          {/* ── Value Proposition ── */}
          <section className={band(ambient, "dark")}>
            <Container as="div" className="py-16 sm:py-20 lg:py-24">
              <div className="grid gap-6 sm:grid-cols-3 lg:gap-8">
                {c.valueProps.map((vp, i) => (
                  <div key={`vp-${i}`} className={`${panelClass} p-6 sm:p-7`}>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text)]">
                      {vp.title}
                    </h3>
                    <p className="mt-3 text-sm leading-[1.7] text-[var(--muted)]">
                      {vp.body}
                    </p>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          {/* ── Deliverables Snapshot ── */}
          <section
            id="deliverables"
            className={`scroll-mt-24 ${band(ambient, "dark")}`}
          >
            <Container as="div" className="py-14 sm:py-16 lg:py-20">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
                {c.deliverablesSnapshot.title}
              </h2>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:gap-4">
                {c.deliverablesSnapshot.items.map((item, i) => (
                  <li
                    key={`del-${i}`}
                    className="flex gap-3 border-s-2 border-[var(--accent)]/25 ps-4 text-sm leading-relaxed text-[var(--text-body)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Container>
          </section>

          {/* ── How Delivery Works ── */}
          <section className={band(ambient, "surface")}>
            <Container as="div" className="py-16 sm:py-20 lg:py-24">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
                {c.howDeliveryWorks.title}
              </h2>
              <ol className="mt-10 border border-[var(--border)] bg-[color-mix(in_srgb,var(--canvas)_92%,#000_8%)]">
                {c.howDeliveryWorks.steps.map((step, i) => (
                  <li
                    key={`step-${i}`}
                    className="grid gap-4 border-b border-[var(--border)] px-5 py-6 last:border-b-0 sm:grid-cols-[minmax(0,7rem)_1fr] sm:gap-8 sm:px-8 sm:py-7"
                  >
                    <div className="font-display text-2xl font-semibold tabular-nums text-[var(--accent)]/35 sm:pt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)]">
                        {step.step}
                      </h3>
                      <p className="mt-2 text-sm leading-[1.65] text-[var(--muted)]">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Container>
          </section>

          {/* ── Who This Is For ── */}
          <section className={band(ambient, "dark")}>
            <Container as="div" className="py-16 sm:py-20 lg:py-24">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
                {c.whoThisIsFor.title}
              </h2>
              <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-10">
                <div className={`${panelClass} p-6 sm:p-8`}>
                  <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                    {c.whoThisIsFor.fit.title}
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {c.whoThisIsFor.fit.items.map((item, i) => (
                      <li
                        key={`fit-${i}`}
                        className="flex gap-3 border-s border-[var(--accent)]/25 ps-4 text-sm leading-relaxed text-[var(--text-body)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`${panelClass} p-6 sm:p-8`}>
                  <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                    {c.whoThisIsFor.notFit.title}
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {c.whoThisIsFor.notFit.items.map((item, i) => (
                      <li
                        key={`nf-${i}`}
                        className="flex gap-3 border-s border-[var(--border)] ps-4 text-sm leading-relaxed text-[var(--text-body)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Container>
          </section>

          {/* ── Why This Is Different ── */}
          <section className={band(ambient, "surface")}>
            <Container as="div" className="py-16 sm:py-20 lg:py-24">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
                {c.whyDifferent.title}
              </h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:gap-8">
                {c.whyDifferent.items.map((item, i) => (
                  <div key={`diff-${i}`} className={`${panelClass} p-6 sm:p-7`}>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text)]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-[1.7] text-[var(--muted)]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          {/* ── Bottom CTA ── */}
          <section id="studio-cta" className={`scroll-mt-24 ${band(ambient, "dark")}`}>
            <Container as="div" className="py-16 sm:py-20 lg:py-24">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
                  {c.cta.headline}
                </h2>
                <p className="mt-6 text-base leading-[1.75] text-[var(--text-body)]">
                  {c.cta.body}
                </p>
                <div className="mt-10 flex flex-col items-center gap-4">
                  <ButtonLink href={withLocale(c.cta.href, locale)}>
                    {c.cta.buttonLabel}
                  </ButtonLink>
                  <a
                    href="#offer-images"
                    className="text-sm font-medium text-[var(--muted)] transition-colors duration-200 hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {locale === "ar"
                      ? "\u0644\u0633\u062a \u0645\u062a\u0623\u0643\u062f\u0627\u064b\u061f \u0627\u0628\u062f\u0623 \u0628\u0628\u0633\u0627\u0637\u0629 \u2191"
                      : "Not sure? Start simple \u2191"}
                  </a>
                </div>
              </div>
            </Container>
          </section>

          {/* ── FAQ ── */}
          <section className={ambient ? band(ambient, "surface") : "bg-[var(--surface)]"}>
            <Container as="div" className="py-16 sm:py-20 lg:py-24">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
                {c.faq.title}
              </h2>
              <dl className="mt-10 divide-y divide-[var(--border)]">
                {c.faq.items.map((item, i) => (
                  <div key={`faq-${i}`} className="py-6 first:pt-0 last:pb-0">
                    <dt className="text-sm font-semibold text-[var(--text)]">
                      {item.question}
                    </dt>
                    <dd className="mt-3 text-sm leading-[1.7] text-[var(--muted)]">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </Container>
          </section>

          {/* ── Conversion micro-interactions ── */}
          <AiStudioConversionLayer locale={locale} />
          <AiStudioFunnelV3Panel locale={locale} />
        </div>
      </div>
    </MarketingShell>
  );
}
