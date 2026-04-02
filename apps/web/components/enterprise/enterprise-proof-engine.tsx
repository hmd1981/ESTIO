import { BehavioralMediaFrame } from "@/components/enterprise/behavioral-media-frame";
import type { CmsVisual, MediaAssetMap } from "@/lib/cms/types";
import type { EnterpriseProofEngineItemMerged } from "@/lib/cms/merge-marketing-page";

type Props = {
  title: string;
  items: EnterpriseProofEngineItemMerged[];
  evidenceLabels: Record<
    "case" | "internal" | "simulation" | "reference_architecture",
    string
  >;
  verificationLabels: Record<
    "internal" | "observed" | "repeatable" | "contractual",
    string
  >;
  mediaPlaceholder: string;
  mediaAssets: MediaAssetMap;
};

function assetCaption(v: CmsVisual): string | undefined {
  const parts = [v.assetRole, v.assetPurpose, v.assetPriority].filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}

export function EnterpriseProofEngine({
  title,
  items,
  evidenceLabels,
  verificationLabels,
  mediaPlaceholder,
  mediaAssets,
}: Props) {
  if (!items.length) return null;

  return (
    <div>
      <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--text)] sm:text-xl">
        {title}
      </h2>
      <div className="mt-10 grid gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={`${item.claim}-${i}`}
            className="min-h-[148px] bg-[color-mix(in_srgb,var(--surface)_94%,#000_6%)] px-5 py-6 sm:min-h-[156px] lg:min-h-0"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <span className="rounded-sm border border-[color-mix(in_srgb,var(--accent)_35%,var(--border)_65%)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {evidenceLabels[item.evidenceType]}
              </span>
              <span
                className="rounded-sm bg-[color-mix(in_srgb,var(--canvas)_88%,#000_12%)] px-2 py-0.5 text-[0.58rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]"
                title={item.verification.note || undefined}
              >
                {verificationLabels[item.verification.level]}
              </span>
            </div>
            {item.verification.note?.trim() ? (
              <p className="mt-2 text-[0.65rem] leading-relaxed text-[var(--muted)]">
                {item.verification.note}
              </p>
            ) : null}
            <p className="mt-3 text-sm font-semibold leading-snug text-[var(--text)]">
              {item.claim}
            </p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-[var(--text-body)] sm:text-sm">
              {item.metric}
            </p>
            {item.visual &&
            (item.visual.imageUrl ||
              item.visual.imageMediaAssetId ||
              item.visual.imageAlt) ? (
              <div className="mt-4">
                {assetCaption(item.visual) ? (
                  <p className="mb-2 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                    {assetCaption(item.visual)}
                  </p>
                ) : null}
                <BehavioralMediaFrame
                  imageRef={item.visual as CmsVisual}
                  mediaAssets={mediaAssets}
                  aspect="21/9"
                  overlay="readability"
                  placeholderLabel={mediaPlaceholder}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="shadow-[0_1px_0_rgba(212,175,55,0.06)]"
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
