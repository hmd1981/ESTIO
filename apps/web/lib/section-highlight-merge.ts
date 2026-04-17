/** Shared helpers for admin preview / deep-link section rings (no "use client"). */

const RING = "ring-2 ring-[var(--accent)]/50 ring-inset";

export function enterpriseSectionClassName(
  id: string,
  base: string,
  highlightSection?: string,
): string {
  return highlightSection === id ? `${base} ${RING}` : base;
}
