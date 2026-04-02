import type { ReactNode } from "react";
import { CmsVisualMedia } from "@/components/cms/cms-visual-media";
import type { ImageRef } from "@/lib/cms/resolve-image";
import { resolveVisualMedia } from "@/lib/cms/resolve-image";
import type { MediaAssetMap } from "@/lib/cms/types";

/** Controlled aspect presets — enterprise-appropriate proportions. */
export type PremiumMediaAspect =
  | "16/9"
  | "16/10"
  | "21/9"
  | "21/10"
  | "2/1"
  | "2.4/1"
  | "4/3";

const aspectClass: Record<PremiumMediaAspect, string> = {
  "16/9": "aspect-video",
  "16/10": "aspect-[16/10]",
  "21/9": "aspect-[21/9]",
  "21/10": "aspect-[21/10]",
  "2/1": "aspect-[2/1]",
  "2.4/1": "aspect-[2.4/1]",
  "4/3": "aspect-[4/3]",
};

export type PremiumMediaOverlay = "none" | "readability";

const frameShell =
  "relative overflow-hidden rounded-sm border border-[color-mix(in_srgb,var(--border)_88%,var(--accent)_12%)] bg-[#050505] shadow-[inset_0_1px_0_rgba(212,175,55,0.05)]";

const overlayReadability =
  "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-black/20 to-transparent";

export type PremiumMediaEmptyProps = {
  /** Shown in the centre — e.g. i18n “Visual” */
  label?: string;
  className?: string;
};

/**
 * Premium empty slot: fixed footprint, dark panel, subtle grid — no layout collapse.
 */
export function PremiumMediaEmpty({ label, className = "" }: PremiumMediaEmptyProps) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center ${className}`}
      aria-hidden={!label}
    >
      <div className="absolute inset-0 bg-[#050505]" />
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,175,55,0.06),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />
      {label ? (
        <span className="relative z-[1] text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]/65">
          {label}
        </span>
      ) : (
        <span className="relative z-[1] h-px w-10 bg-[var(--accent)]/25" />
      )}
    </div>
  );
}

export type PremiumMediaFrameProps = {
  /** CMS visual — primary API */
  imageRef?: ImageRef;
  mediaAssets?: MediaAssetMap;
  /** When provided, renders instead of resolving `imageRef` (e.g. hero explicit video + poster). */
  slot?: ReactNode;
  aspect?: PremiumMediaAspect;
  /** When set, wins over `aspect` (responsive utility strings). */
  aspectClassName?: string;
  /** `inline`: aspect box (default). `fill`: absolute fill inside a `relative` parent (CTA / backdrop). */
  layout?: "inline" | "fill";
  overlay?: PremiumMediaOverlay;
  placeholderLabel?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
  /** Extra classes on the outer frame (e.g. min-h for mobile) */
  frameClassName?: string;
  /** Pass-through to Image / video wrapper */
  imageClassName?: string;
  videoClassName?: string;
  /** Backdrop / CTA: multiply visual strength (0–1) */
  mediaOpacity?: number;
};

/**
 * Consistent enterprise media shell: image or video via CMS fields, premium empty state, optional readability overlay.
 * Does not alter CMS field shapes — uses existing `ImageRef` + `mediaAssets` resolution.
 */
export function PremiumMediaFrame({
  imageRef = {},
  mediaAssets = {},
  slot,
  aspect = "16/10",
  aspectClassName,
  layout = "inline",
  overlay = "none",
  placeholderLabel,
  className = "",
  frameClassName = "",
  sizes = "(max-width: 1024px) 100vw, 50vw",
  priority = false,
  decorative = false,
  imageClassName = "",
  videoClassName,
  mediaOpacity,
}: PremiumMediaFrameProps) {
  const vm = resolveVisualMedia(imageRef, mediaAssets);
  const hasSlot = slot !== undefined;
  const hasMedia = hasSlot
    ? Boolean(slot)
    : Boolean(vm);

  const showReadabilityOverlay = overlay === "readability" && hasMedia;

  const mediaLayer = hasSlot ? (
    slot
  ) : vm ? (
    <CmsVisualMedia
      imageRef={imageRef}
      mediaAssets={mediaAssets}
      fill
      decorative={decorative}
      priority={priority}
      sizes={sizes}
      className={`object-cover ${imageClassName}`}
      videoClassName={
        videoClassName ??
        `absolute inset-0 h-full w-full object-cover ${imageClassName}`
      }
    />
  ) : null;

  const opacityStyle =
    mediaOpacity != null && mediaOpacity < 1
      ? { opacity: mediaOpacity }
      : undefined;

  if (layout === "fill") {
    return (
      <div
        className={`${frameShell} absolute inset-0 ${className} ${frameClassName}`}
      >
        {hasMedia ? (
          <div className="absolute inset-0" style={opacityStyle}>
            {mediaLayer}
          </div>
        ) : (
          <PremiumMediaEmpty label={placeholderLabel} />
        )}
        {showReadabilityOverlay ? (
          <div className={overlayReadability} aria-hidden />
        ) : null}
      </div>
    );
  }

  const aspectCls = aspectClassName ?? aspectClass[aspect];

  return (
    <div
      className={`${frameShell} ${aspectCls} w-full min-h-0 ${frameClassName} ${className}`}
    >
      {hasMedia ? (
        <div className="absolute inset-0" style={opacityStyle}>
          {mediaLayer}
        </div>
      ) : (
        <PremiumMediaEmpty label={placeholderLabel} />
      )}
      {showReadabilityOverlay ? (
        <div className={overlayReadability} aria-hidden />
      ) : null}
    </div>
  );
}
