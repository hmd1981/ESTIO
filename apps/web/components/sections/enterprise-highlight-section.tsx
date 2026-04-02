import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
import { MarketingSection } from "@/components/sections/marketing-section";
import { ButtonLink } from "@/components/ui/button-link";
import type { MediaAssetMap } from "@/lib/cms/types";

export type EnterpriseCapabilityBlock = {
  title: string;
  text: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
};

type Props = {
  /** Short line above the title — systems / operational framing. */
  kicker?: string;
  headline: string;
  body: string;
  subtitle?: string;
  /** Optional section-level visual (CMS); shown as a slim strip when present. */
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
  blocks: EnterpriseCapabilityBlock[];
  /** Primary: typically contact. */
  cta: { label: string; href: string };
  /** Secondary: typically full enterprise overview. */
  secondaryCta?: { label: string; href: string };
  mediaAssets?: MediaAssetMap;
  /** Label for empty block media slots (i18n). */
  mediaPlaceholderLabel?: string;
};

export function EnterpriseHighlightSection({
  kicker,
  headline,
  body,
  subtitle,
  imageUrl,
  imageAlt,
  imageMediaAssetId,
  blocks,
  cta,
  secondaryCta,
  mediaAssets = {},
  mediaPlaceholderLabel = "—",
}: Props) {
  const shellClass =
    "rounded-sm border border-[color-mix(in_srgb,var(--border)_90%,var(--accent)_10%)] bg-[color-mix(in_srgb,#0a0a0a_88%,var(--surface)_12%)] shadow-[inset_0_1px_0_rgba(212,175,55,0.04)]";

  const blockShell =
    "flex h-full min-h-0 flex-col border border-[var(--border)] border-t-2 border-t-[color-mix(in_srgb,var(--accent)_45%,var(--border)_55%)] bg-[color-mix(in_srgb,var(--surface)_93%,#000_7%)]";

  return (
    <MarketingSection
      id="enterprise"
      tone="surface"
      padding="spacious"
      borderBottom
      className="bg-[#030303]"
    >
      <div className={`${shellClass} px-5 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16`}>
        <div className="mb-10 w-full">
          <PremiumMediaFrame
            imageRef={{ imageUrl, imageAlt, imageMediaAssetId }}
            mediaAssets={mediaAssets}
            aspectClassName="aspect-[21/9] max-h-48 w-full sm:max-h-56"
            overlay="readability"
            placeholderLabel={mediaPlaceholderLabel}
            sizes="100vw"
          />
        </div>

        {kicker ? (
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            {kicker}
          </p>
        ) : null}

        <h2 className="font-display mt-4 max-w-4xl text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl lg:text-[2.125rem] lg:leading-[1.15]">
          {headline}
        </h2>

        {subtitle ? (
          <p className="mt-4 max-w-3xl text-sm font-medium leading-snug text-[var(--muted)]">
            {subtitle}
          </p>
        ) : null}

        <p className="mt-6 max-w-3xl text-pretty text-sm leading-[1.75] text-[var(--text-body)] sm:text-base">
          {body}
        </p>

        <ul className="mt-12 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {blocks.map((block) => (
            <li key={block.title} className={blockShell}>
              <PremiumMediaFrame
                aspect="16/10"
                imageRef={{
                  imageUrl: block.imageUrl,
                  imageAlt: block.imageAlt,
                  imageMediaAssetId: block.imageMediaAssetId,
                }}
                mediaAssets={mediaAssets}
                placeholderLabel={mediaPlaceholderLabel}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-none border-x-0 border-t-0 shadow-none"
              />
              <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                  {block.title}
                </p>
                <p className="mt-3 text-sm leading-[1.7] text-[var(--muted)]">
                  {block.text}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col gap-3 border-t border-[color-mix(in_srgb,var(--border)_85%,var(--accent)_15%)] pt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
          {secondaryCta ? (
            <ButtonLink href={secondaryCta.href} variant="secondary">
              {secondaryCta.label}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </MarketingSection>
  );
}
