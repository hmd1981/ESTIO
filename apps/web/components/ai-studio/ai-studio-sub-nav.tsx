"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";
import { Container } from "@/components/layout/container";

type StudioRoute = {
  slug: string;
  labelEn: string;
  labelAr: string;
};

const STUDIO_ROUTES: StudioRoute[] = [
  { slug: "image-production", labelEn: "AI Image Production", labelAr: "إنتاج الصور" },
  { slug: "video-production", labelEn: "AI Video Production", labelAr: "إنتاج الفيديو" },
  { slug: "brand-ai-packs", labelEn: "Brand AI Packs", labelAr: "حزم العلامة التجارية" },
];

type Props = {
  locale: AppLocale;
};

export function AiStudioSubNav({ locale }: Props) {
  const pathname = usePathname() ?? "";
  const basePath = withLocale("/ai-studio", locale);
  const isLanding = pathname === basePath || pathname === `${basePath}/`;

  const heading = locale === "ar" ? "استكشف الاستوديو" : "Explore the studio";
  const helper =
    locale === "ar"
      ? "اختر مسار الإنتاج الذي يناسب احتياجك."
      : "Choose the production path that matches your current need.";

  return (
    <nav
      aria-label={locale === "ar" ? "تنقل استوديو الذكاء" : "AI Studio navigation"}
      className="border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,var(--accent)_6%)]"
    >
      <Container as="div" className="py-5 sm:py-6">
        <div className="mb-3 sm:mb-4">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            {heading}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            {helper}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isLanding && (
            <span className="inline-flex items-center rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-1.5 text-[0.75rem] font-semibold text-[var(--accent)]">
              {locale === "ar" ? "نظرة عامة" : "Overview"}
            </span>
          )}
          {!isLanding && (
            <Link
              href={basePath}
              className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-1.5 text-[0.75rem] font-medium text-[var(--muted)] transition-all duration-200 hover:border-[var(--accent)]/40 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {locale === "ar" ? "نظرة عامة" : "Overview"}
            </Link>
          )}
          {STUDIO_ROUTES.map((route) => {
            const href = withLocale(`/ai-studio/${route.slug}`, locale);
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            const label = locale === "ar" ? route.labelAr : route.labelEn;

            if (isActive) {
              return (
                <span
                  key={route.slug}
                  aria-current="page"
                  className="inline-flex items-center rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-1.5 text-[0.75rem] font-semibold text-[var(--accent)]"
                >
                  {label}
                </span>
              );
            }

            return (
              <Link
                key={route.slug}
                href={href}
                className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-1.5 text-[0.75rem] font-medium text-[var(--muted)] transition-all duration-200 hover:border-[var(--accent)]/40 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {label}
              </Link>
            );
          })}
        </div>
      </Container>
    </nav>
  );
}
