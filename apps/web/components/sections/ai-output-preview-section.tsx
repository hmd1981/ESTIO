import Image from "next/image";
import Link from "next/link";
import { MarketingSection } from "@/components/sections/marketing-section";
import { withLocale } from "@/lib/i18n/paths";
import type { AppLocale } from "@/lib/i18n/config";

type OutputCard = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  tag: string;
};

const EN_CONTENT = {
  kicker: "What we produce",
  headline: "Studio output in three tracks",
  subtitle:
    "Pick a track — images, short video, or a brand visual system. Same team, same review bar.",
  cards: [
    {
      title: "Campaign hero visuals",
      description:
        "Brand-aligned imagery for websites, ads, and social — at 4K, reviewed and ready to publish.",
      imageUrl: "/ai-studio/image-production.svg",
      imageAlt: "AI image production pipeline diagram",
      href: "/ai-studio/image-production",
      tag: "Image",
    },
    {
      title: "Short promo videos",
      description:
        "15–60s branded video for social, product launches, and campaigns — scripted, produced, delivered.",
      imageUrl: "/ai-studio/video-production.svg",
      imageAlt: "AI video production pipeline diagram",
      href: "/ai-studio/video-production",
      tag: "Video",
    },
    {
      title: "Brand visual systems",
      description:
        "Consistent visual identity packs — prompt presets, style guides, and reusable brand assets.",
      imageUrl: "/ai-studio/brand-ai-packs.svg",
      imageAlt: "Brand AI packs pipeline diagram",
      href: "/ai-studio/brand-ai-packs",
      tag: "Brand",
    },
  ] satisfies OutputCard[],
  cta: "Open AI Studio",
};

const AR_CONTENT = {
  kicker: "\u0645\u0627\u0630\u0627 \u0646\u0646\u062a\u062c",
  headline: "\u062b\u0644\u0627\u062b\u0629 \u0645\u0633\u0627\u0631\u0627\u062a \u0641\u064a \u0627\u0644\u0627\u0633\u062a\u0648\u062f\u064a\u0648",
  subtitle:
    "\u0627\u062e\u062a\u0631\u0648\u0627 \u2014 \u0635\u0648\u0631\u060c \u0641\u064a\u062f\u064a\u0648 \u0642\u0635\u064a\u0631\u060c \u0623\u0648 \u0646\u0638\u0627\u0645 \u0628\u0635\u0631\u064a \u0644\u0644\u0639\u0644\u0627\u0645\u0629. \u0646\u0641\u0633 \u0627\u0644\u0641\u0631\u064a\u0642\u060c \u0646\u0641\u0633 \u0645\u0639\u064a\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629.",
  cards: [
    {
      title:
        "\u0645\u0631\u0626\u064a\u0627\u062a \u062d\u0645\u0644\u0627\u062a \u0631\u0626\u064a\u0633\u064a\u0629",
      description:
        "\u0635\u0648\u0631 \u0645\u062a\u0648\u0627\u0641\u0642\u0629 \u0645\u0639 \u0627\u0644\u0647\u0648\u064a\u0629 \u0644\u0644\u0645\u0648\u0627\u0642\u0639 \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0648\u0627\u0644\u0645\u0646\u0635\u0627\u062a \u2014 \u0628\u062f\u0642\u0629 4K \u0648\u062c\u0627\u0647\u0632\u0629 \u0644\u0644\u0646\u0634\u0631.",
      imageUrl: "/ai-studio/image-production.svg",
      imageAlt:
        "\u0645\u062e\u0637\u0637 \u0625\u0646\u062a\u0627\u062c \u0627\u0644\u0635\u0648\u0631 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a",
      href: "/ai-studio/image-production",
      tag: "\u0635\u0648\u0631",
    },
    {
      title:
        "\u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a \u062a\u0631\u0648\u064a\u062c\u064a\u0629 \u0642\u0635\u064a\u0631\u0629",
      description:
        "\u0641\u064a\u062f\u064a\u0648 15\u201360 \u062b\u0627\u0646\u064a\u0629 \u0644\u0644\u0645\u0646\u0635\u0627\u062a \u0648\u0627\u0644\u062d\u0645\u0644\u0627\u062a \u2014 \u0645\u0643\u062a\u0648\u0628 \u0648\u0645\u0646\u062a\u064e\u062c \u0648\u0645\u0633\u0644\u0651\u0645.",
      imageUrl: "/ai-studio/video-production.svg",
      imageAlt:
        "\u0645\u062e\u0637\u0637 \u0625\u0646\u062a\u0627\u062c \u0627\u0644\u0641\u064a\u062f\u064a\u0648 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a",
      href: "/ai-studio/video-production",
      tag: "\u0641\u064a\u062f\u064a\u0648",
    },
    {
      title:
        "\u0623\u0646\u0638\u0645\u0629 \u0647\u0648\u064a\u0629 \u0628\u0635\u0631\u064a\u0629",
      description:
        "\u062d\u0632\u0645 \u0647\u0648\u064a\u0629 \u0645\u062a\u0633\u0642\u0629 \u2014 \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0623\u0633\u0644\u0648\u0628 \u0648\u0623\u062f\u0644\u0629 \u0628\u0635\u0631\u064a\u0629 \u0648\u0623\u0635\u0648\u0644 \u0642\u0627\u0628\u0644\u0629 \u0644\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645.",
      imageUrl: "/ai-studio/brand-ai-packs.svg",
      imageAlt:
        "\u0645\u062e\u0637\u0637 \u062d\u0632\u0645 \u0627\u0644\u0647\u0648\u064a\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a",
      href: "/ai-studio/brand-ai-packs",
      tag: "\u0647\u0648\u064a\u0629",
    },
  ] satisfies OutputCard[],
  cta: "\u0627\u0644\u062f\u062e\u0648\u0644 \u0625\u0644\u0649 \u0627\u0633\u062a\u0648\u062f\u064a\u0648 \u0627\u0644\u0630\u0643\u0627\u0621",
};

export function AiOutputPreviewSection({ locale }: { locale: AppLocale }) {
  const t = locale === "ar" ? AR_CONTENT : EN_CONTENT;
  const studioHref = withLocale("/ai-studio", locale);

  return (
    <MarketingSection
      id="ai-preview"
      aria-labelledby="ai-preview-heading"
      tone="surface"
      padding="comfortable"
      borderBottom
    >
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
        {t.kicker}
      </p>
      <h2
        id="ai-preview-heading"
        className="font-display mt-4 text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl"
      >
        {t.headline}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-body)]">
        {t.subtitle}
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {t.cards.map((card) => (
          <Link
            key={card.href}
            href={withLocale(card.href, locale)}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--canvas)] transition-all duration-200 ease-out hover:border-[var(--accent)]/40 hover:shadow-[0_4px_24px_rgba(212,175,55,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <div className="relative aspect-[2/1] w-full overflow-hidden bg-[#0a0a0a]">
              <Image
                src={card.imageUrl}
                alt={card.imageAlt}
                fill
                unoptimized
                className="object-contain p-4 opacity-80 transition-opacity duration-200 ease-out group-hover:opacity-100"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <span className="absolute start-3 top-3 rounded bg-[var(--accent)]/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[var(--accent)]">
                {card.tag}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 px-5 py-4">
              <h3 className="text-sm font-semibold text-[var(--text)] transition-colors duration-200 ease-out group-hover:text-[var(--accent)]">
                {card.title}
              </h3>
              <p className="text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                {card.description}
              </p>
            </div>

            <div className="border-t border-[var(--border)] px-5 py-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)]">
                <span>
                  {locale === "ar"
                    ? "\u0634\u0627\u0647\u062f \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644"
                    : "View details"}
                </span>
                <span
                  className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  &rarr;
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href={studioHref}
          className="group/all inline-flex items-center gap-2 rounded-md border border-[var(--accent)]/30 px-5 py-2.5 text-sm font-semibold text-[var(--accent)] transition-all duration-200 ease-out hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          <span>{t.cta}</span>
          <span
            className="inline-block transition-transform duration-200 ease-out group-hover/all:translate-x-1 motion-reduce:transition-none"
            aria-hidden="true"
          >
            &rarr;
          </span>
        </Link>
      </div>
    </MarketingSection>
  );
}
