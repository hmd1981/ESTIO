import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
import { MarketingSection } from "@/components/sections/marketing-section";
import { ButtonLink } from "@/components/ui/button-link";
import type { MediaAssetMap } from "@/lib/cms/types";

type Props = {
  headline: string;
  body: string;
  buttonLabel: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
  mediaAssets?: MediaAssetMap;
};

export function CtaStripSection({
  headline,
  body,
  buttonLabel,
  href,
  imageUrl,
  imageAlt,
  imageMediaAssetId,
  mediaAssets = {},
}: Props) {
  return (
    <MarketingSection
      id="consultation"
      tone="accent"
      padding="spacious"
      borderBottom={false}
    >
      <div className="premium-panel relative min-h-[200px] overflow-hidden rounded-xl border border-[var(--border)]">
        <PremiumMediaFrame
          layout="fill"
          imageRef={{ imageUrl, imageAlt, imageMediaAssetId }}
          mediaAssets={mediaAssets}
          overlay="readability"
          decorative
          mediaOpacity={0.26}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.5))]" />
        <div className="relative z-10 flex flex-col gap-10 px-1 py-2 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-xl">
            <h2 className="font-display text-xl font-medium tracking-tight text-[var(--text)] sm:text-2xl">
              {headline}
            </h2>
            <p className="mt-4 text-pretty text-sm leading-[1.65] text-[var(--text-body)] sm:text-base">
              {body}
            </p>
          </div>
          <ButtonLink
            href={href}
            className="shrink-0"
          >
            {buttonLabel}
          </ButtonLink>
        </div>
      </div>
    </MarketingSection>
  );
}
