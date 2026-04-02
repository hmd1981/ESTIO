"use client";

import { useEffect, useState } from "react";
import type { EnterpriseDecisionSummaryMerged } from "@/lib/cms/merge-marketing-page";

type Props = {
  summary: EnterpriseDecisionSummaryMerged;
};

/**
 * Appears after the ROI block has scrolled past — micro-commitment strip before deal entry.
 */
export function EnterpriseDecisionBar({ summary }: Props) {
  const [visible, setVisible] = useState(false);

  const hasContent =
    summary.forTeams.trim() ||
    summary.requires.trim() ||
    summary.delivers.trim();

  useEffect(() => {
    if (!hasContent) return;
    const roi = document.getElementById("enterprise-roi");
    const onScroll = () => {
      if (!roi) {
        setVisible(false);
        return;
      }
      const rect = roi.getBoundingClientRect();
      setVisible(rect.bottom < 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasContent]);

  if (!hasContent) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[color-mix(in_srgb,var(--border)_90%,var(--accent)_10%)] bg-[color-mix(in_srgb,var(--canvas)_94%,#000_6%)]/95 backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
      role="region"
      aria-label="Decision summary"
    >
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="grid gap-2 text-[0.7rem] leading-snug text-[var(--text-body)] sm:grid-cols-3 sm:gap-5 sm:text-xs">
          {summary.forTeams.trim() ? (
            <p className="border-s-2 border-s-[var(--accent)]/40 ps-3">{summary.forTeams}</p>
          ) : null}
          {summary.requires.trim() ? (
            <p className="border-s-2 border-s-[var(--accent)]/25 ps-3">{summary.requires}</p>
          ) : null}
          {summary.delivers.trim() ? (
            <p className="border-s-2 border-s-[var(--accent)]/25 ps-3">{summary.delivers}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
