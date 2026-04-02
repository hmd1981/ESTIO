import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
import { MarketingSection } from "@/components/sections/marketing-section";
import type { MergedIndustry } from "@/lib/cms/merge-home";
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
  items: MergedIndustry[];
  mediaAssets?: MediaAssetMap;
};

export function IndustriesSection({
  intro,
  items,
  mediaAssets = {},
}: Props) {
  return (
    <MarketingSection
      id="industries"
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
      <ul className="mt-14 divide-y divide-[var(--border)] border-y border-[var(--border)] lg:mt-16">
        {items.map((i) => (
          <li
            key={i.label}
            className="grid gap-4 py-8 sm:grid-cols-12 sm:items-start sm:gap-8 sm:py-9"
          >
            <div className="sm:col-span-4">
              <PremiumMediaFrame
                aspect="16/10"
                imageRef={{
                  imageUrl: i.imageUrl,
                  imageAlt: i.imageAlt,
                  imageMediaAssetId: i.imageMediaAssetId,
                }}
                mediaAssets={mediaAssets}
                sizes="(max-width: 640px) 100vw, 30vw"
                className="!rounded-md"
              />
            </div>
            <p className="text-sm font-semibold text-[var(--text)] sm:col-span-3">
              {i.label}
            </p>
            <p className="text-sm leading-[1.65] text-[var(--muted)] sm:col-span-5">
              {i.description}
            </p>
          </li>
        ))}
      </ul>
    </MarketingSection>
  );
}
