"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import type { AppLocale } from "@/lib/i18n/config";

type NavItem = {
  id: string;
  labelEn: string;
  labelAr: string;
  hintEn: string;
  hintAr: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "studio-credits", labelEn: "Credits", labelAr: "\u0627\u0644\u0631\u0635\u064a\u062f", hintEn: "Top up balance", hintAr: "\u0634\u062d\u0646 \u0627\u0644\u0631\u0635\u064a\u062f" },
  { id: "offer-images", labelEn: "AI Images", labelAr: "\u0635\u0648\u0631", hintEn: "Campaigns & ads", hintAr: "\u062d\u0645\u0644\u0627\u062a \u0648\u0625\u0639\u0644\u0627\u0646\u0627\u062a" },
  { id: "offer-video", labelEn: "AI Video", labelAr: "\u0641\u064a\u062f\u064a\u0648", hintEn: "Social & reels", hintAr: "\u0645\u062d\u062a\u0648\u0649 \u0627\u062c\u062a\u0645\u0627\u0639\u064a" },
  { id: "offer-packs", labelEn: "AI Packs", labelAr: "\u062d\u0632\u0645", hintEn: "Brand system", hintAr: "\u0646\u0638\u0627\u0645 \u0627\u0644\u0639\u0644\u0627\u0645\u0629" },
];

export function AiStudioStickyNav({ locale }: { locale: AppLocale }) {
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const hero = document.getElementById("ai-studio-hero");
    heroRef.current = hero;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const ids = NAV_ITEMS.map((n) => n.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let topMost: { id: string; top: number } | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const top = entry.boundingClientRect.top;
            if (!topMost || top < topMost.top) {
              topMost = { id: entry.target.id, top };
            }
          }
        }
        if (topMost) setActiveId(topMost.id);
      },
      { rootMargin: "-120px 0px -50% 0px", threshold: 0.05 },
    );
    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  return (
    <div
      className={`sticky top-[4.5rem] z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-lg transition-all duration-300 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 opacity-0 pointer-events-none"
      }`}
      role="navigation"
      aria-label={
        locale === "ar"
          ? "\u062a\u0646\u0642\u0644 \u0633\u0631\u064a\u0639"
          : "Quick navigation"
      }
    >
      <Container as="div" className="flex items-center gap-1 py-2.5 sm:gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          const label = locale === "ar" ? item.labelAr : item.labelEn;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className={`flex flex-col items-center gap-0 rounded-full px-4 py-1.5 transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:flex-row sm:gap-2 ${
                isActive
                  ? "border border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border border-transparent text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--text)]"
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="text-[0.75rem] font-semibold">{label}</span>
              <span className="hidden text-[0.6rem] font-normal opacity-60 sm:inline">
                {locale === "ar" ? item.hintAr : item.hintEn}
              </span>
            </button>
          );
        })}
      </Container>
    </div>
  );
}
