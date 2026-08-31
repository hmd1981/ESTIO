"use client";

import type { AppLocale } from "@/lib/i18n/config";
import type { GpuStatusSnapshot } from "@/lib/use-gpu-status";

/**
 * Inline banner rendered above any GPU-dependent surface (Studio media panels,
 * tiered video, credits/buy CTA) whenever {@link useGpuStatus} reports the
 * worker is offline.
 *
 * Copy is provided in `en` and `ar` to match the existing inline COPY tables in
 * sibling Studio panels. The component is purely presentational; gating logic
 * (disabling buttons, etc.) lives in each panel.
 */

const COPY = {
  en: {
    title: "GPU services are temporarily offline",
    body:
      "Image and video generation are paused while the GPU worker is unreachable. Credit purchases still work. Please try again in a few minutes.",
    reasonLabel: "reason",
  },
  ar: {
    title: "خدمات GPU غير متاحة مؤقتًا",
    body:
      "إنشاء الصور والفيديو متوقف حاليًا لأن عامل GPU غير متاح. شراء الرصيد ما زال متاحًا. يُرجى المحاولة مجددًا بعد بضع دقائق.",
    reasonLabel: "السبب",
  },
} as const;

export type GpuOfflineBannerProps = {
  locale: AppLocale;
  /** Optional latest snapshot — surfaces the upstream `reason` for operators. */
  snapshot?: GpuStatusSnapshot | null;
  /** Tighter spacing for embedding inside an already-padded surface. */
  compact?: boolean;
};

export function GpuOfflineBanner({
  locale,
  snapshot,
  compact = false,
}: GpuOfflineBannerProps) {
  const c = COPY[locale === "ar" ? "ar" : "en"];
  const reason = snapshot?.reason ?? null;
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="gpu-offline-banner"
      className={
        "rounded-md border border-amber-500/30 bg-amber-950/15 text-amber-100 " +
        (compact ? "px-4 py-3 text-sm" : "px-5 py-4 text-sm sm:text-base")
      }
    >
      <p className="font-semibold">{c.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-100/80 sm:text-sm">
        {c.body}
      </p>
      {reason ? (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-amber-200/60">
          {c.reasonLabel}: {reason}
        </p>
      ) : null}
    </div>
  );
}
