import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
import { MarketingSection } from "@/components/sections/marketing-section";
import type { MergedTrustPoint } from "@/lib/cms/merge-home";
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
  points: MergedTrustPoint[];
  mediaAssets?: MediaAssetMap;
};

export function TrustSection({
  intro,
  points,
  mediaAssets = {},
}: Props) {
  return (
    <MarketingSection
      id="why-estio"
      tone="white"
      padding="spacious"
      borderBottom
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
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
            frameClassName="min-h-[180px]"
            sizes="(max-width: 1024px) 100vw, 35vw"
            className="!rounded-lg"
          />
        </div>
      </div>
      <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-14">
        {points.map((p) => (
          <div key={p.title} className="premium-panel rounded-xl p-5">
            <PremiumMediaFrame
              aspect="16/10"
              imageRef={{
                imageUrl: p.imageUrl,
                imageAlt: p.imageAlt,
                imageMediaAssetId: p.imageMediaAssetId,
              }}
              mediaAssets={mediaAssets}
              sizes="(max-width: 1024px) 100vw, 22vw"
              className="mb-4 !rounded-md"
            />
            <h3 className="text-sm font-semibold leading-snug text-[var(--text)]">
              {p.title}
            </h3>
            <p className="mt-3 text-sm leading-[1.65] text-[var(--muted)]">
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </MarketingSection>
  );
}
