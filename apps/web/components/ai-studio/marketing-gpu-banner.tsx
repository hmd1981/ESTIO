"use client";

import type { AppLocale } from "@/lib/i18n/config";
import { GpuOfflineBanner } from "@/components/ai-studio/gpu-offline-banner";
import { useGpuStatus } from "@/lib/use-gpu-status";

type Props = {
  locale: AppLocale;
  className?: string;
};

/**
 * Slim, marketing-side banner shown only when the GPU worker is offline.
 *
 * Mounts at the top of marketing pages that advertise GPU-dependent features
 * (image-to-video, text-to-image, text-to-video) so users learn about an
 * outage *before* clicking into a CTA that would just be disabled. Renders
 * nothing while online or on the very first poll, keeping the marketing
 * surface untouched in the common-case happy path.
 */
export function MarketingGpuBanner({ locale, className }: Props) {
  const gpu = useGpuStatus();
  if (gpu.online !== false) return null;
  return (
    <div className={className ?? "mx-auto mt-6 w-full max-w-5xl px-4 sm:px-6"}>
      <GpuOfflineBanner locale={locale} snapshot={gpu.status} compact />
    </div>
  );
}
