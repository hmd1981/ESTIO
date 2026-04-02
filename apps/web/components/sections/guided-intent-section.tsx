import Link from "next/link";
import type { ReactNode } from "react";
import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
import type { MergedGuided } from "@/lib/cms/merge-home";
import type { MediaAssetMap } from "@/lib/cms/types";
import { resolveImage } from "@/lib/cms/resolve-image";
import { MarketingSection } from "@/components/sections/marketing-section";

const icons: Record<string, ReactNode> = {
  website: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 9h18M9 18v3M15 18v3M8 21h8" />
    </svg>
  ),
  content: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  "creative-ai": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  enterprise: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  ),
};

type Props = {
  guided: MergedGuided;
  learnMoreLabel?: string;
  mediaAssets?: MediaAssetMap;
};

export function GuidedIntentSection({
  guided,
  learnMoreLabel = "Learn more",
  mediaAssets = {},
}: Props) {
  const sectionImg = guided.sectionImage;

  return (
    <MarketingSection
      id="get-started"
      tone="white"
      padding="spacious"
      borderBottom
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        <div className="max-w-3xl lg:col-span-7">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            {guided.sectionKicker}
          </p>
          <h2 className="font-display mt-3 text-xl font-medium tracking-tight text-[var(--text)] sm:text-2xl">
            {guided.title}
          </h2>
          {guided.subtitle ? (
            <p className="mt-2 text-sm font-medium text-[var(--text)]">{guided.subtitle}</p>
          ) : null}
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {guided.description}
          </p>
          {guided.sectionCta ? (
            <Link
              href={guided.sectionCta.href}
              className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
            >
              {guided.sectionCta.label}
            </Link>
          ) : null}
        </div>
        <div className="lg:col-span-5">
          <PremiumMediaFrame
            imageRef={{
              imageUrl: sectionImg?.url,
              imageAlt: sectionImg?.alt,
              imageMediaAssetId: sectionImg?.mediaAssetId,
            }}
            mediaAssets={mediaAssets}
            aspect="16/10"
            frameClassName="min-h-[160px]"
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="!rounded-lg"
          />
        </div>
      </div>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {guided.items.map((item) => {
          const cardResolved = resolveImage(
            {
              imageUrl: item.imageUrl,
              imageAlt: item.imageAlt,
              imageMediaAssetId: item.imageMediaAssetId,
            },
            mediaAssets,
          );
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group premium-panel flex min-h-[6rem] flex-col gap-3 rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {cardResolved?.url ? (
                  <div className="-mx-2 -mt-2 mb-1">
                    <PremiumMediaFrame
                      aspect="16/9"
                      imageRef={{
                        imageUrl: item.imageUrl,
                        imageAlt: item.imageAlt,
                        imageMediaAssetId: item.imageMediaAssetId,
                      }}
                      mediaAssets={mediaAssets}
                      sizes="(max-width: 1280px) 50vw, 20vw"
                      className="!rounded-md"
                    />
                  </div>
                ) : (
                  <span className="text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">
                    {icons[item.id] ?? icons.website}
                  </span>
                )}
                <span className="text-sm font-medium leading-snug text-[var(--text)]">
                  {item.label}
                </span>
                <span className="mt-auto text-xs font-semibold text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                  {learnMoreLabel}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </MarketingSection>
  );
}
