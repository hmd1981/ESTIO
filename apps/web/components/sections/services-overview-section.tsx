import Link from "next/link";
import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
import { MarketingSection } from "@/components/sections/marketing-section";
import type { MergedPillar } from "@/lib/cms/merge-home";
import type { MediaAssetMap } from "@/lib/cms/types";

type Intro = {
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
};

type Props = {
  intro: Intro;
  cards: MergedPillar[];
  learnMoreLabel?: string;
  mediaAssets?: MediaAssetMap;
};

export function ServicesOverviewSection({
  intro,
  cards,
  learnMoreLabel = "Learn more",
  mediaAssets = {},
}: Props) {
  return (
    <MarketingSection
      id="services"
      tone="surface"
      padding="spacious"
      borderBottom
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="max-w-3xl lg:col-span-7">
          <h2 className="font-display text-xl font-medium tracking-tight text-[var(--text)] sm:text-2xl">
            {intro.title}
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {intro.description}
          </p>
        </div>
        <div className="lg:col-span-5">
          <PremiumMediaFrame
            imageRef={intro}
            mediaAssets={mediaAssets}
            aspect="16/10"
            frameClassName="min-h-[160px]"
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="!rounded-lg"
          />
        </div>
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-20">
        {cards.map((card) => (
          <article
            key={card.id}
            className="premium-panel flex flex-col rounded-2xl p-8 lg:p-10"
          >
            <div className="-mx-2 -mt-2 mb-4">
              <PremiumMediaFrame
                aspect="16/9"
                imageRef={{
                  imageUrl: card.imageUrl,
                  imageAlt: card.imageAlt,
                  imageMediaAssetId: card.imageMediaAssetId,
                }}
                mediaAssets={mediaAssets}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="!rounded-md"
              />
            </div>
            <h3 className="font-display text-lg font-medium text-[var(--text)] lg:text-xl">
              {card.title}
            </h3>
            <p className="mt-4 flex-1 text-sm leading-[1.65] text-[var(--muted)] lg:text-[0.9375rem]">
              {card.description}
            </p>
            <Link
              href={card.href}
              className="mt-8 inline-flex w-fit text-sm font-semibold text-[var(--accent)] underline decoration-[var(--border)] underline-offset-4 transition-colors hover:text-[var(--accent-hover)] hover:decoration-[var(--accent)] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              {learnMoreLabel}
            </Link>
          </article>
        ))}
      </div>
    </MarketingSection>
  );
}
