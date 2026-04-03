"use client";

import Link from "next/link";
import {
  brand,
  contactPlacements,
  fallbackFooterColumns,
} from "@/lib/content/site";
import { Container } from "@/components/layout/container";
import { useSiteBundle } from "@/components/site-bundle-context";
import { withLocale } from "@/lib/i18n/paths";
import type { FooterColumn } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n/messages";
import { toArabicUiNumerals } from "@/lib/i18n/numerals";

export function SiteFooter() {
  const bundle = useSiteBundle();
  const locale = bundle.locale;
  const ui = getMessages(locale);
  const s = bundle.settings as Record<string, string | null | undefined> | null;

  const legalName =
    locale === "ar" && s?.businessNameAr
      ? s.businessNameAr
      : s?.businessName ?? brand.legalName;

  const displayBrand =
    locale === "ar" && s?.brandNameAr ? s.brandNameAr : s?.brandName ?? brand.name;

  const taglineFooter =
    locale === "ar"
      ? (s?.footerTextAr ?? brand.taglineAr)
      : (s?.footerText ?? brand.tagline);

  const cityLine =
    s?.address || s?.city || s?.country
      ? [s?.address, s?.city, s?.country].filter(Boolean).join(", ")
      : contactPlacements.cityLine;
  const phoneDisplay = s?.phone ?? contactPlacements.phoneDisplay;
  const phoneDisplayUi =
    locale === "ar"
      ? toArabicUiNumerals(String(phoneDisplay))
      : phoneDisplay;
  const phoneHref = s?.phone
    ? `tel:${String(s.phone).replace(/[\\s-]/g, "")}`
    : contactPlacements.phoneHref;
  const email = s?.email ?? contactPlacements.email;
  const emailHref =
    s?.email && String(s.email).includes("@")
      ? `mailto:${s.email}`
      : contactPlacements.emailHref;
  const website =
    s?.website && String(s.website).trim()
      ? String(s.website).trim().replace(/^https?:\/\//, "")
      : brand.domain;
  const websiteHref =
    s?.website && String(s.website).trim()
      ? String(s.website).trim().startsWith("http")
        ? String(s.website).trim()
        : `https://${String(s.website).trim()}`
      : `https://${brand.domain}`;

  const footerNav = bundle.navigation.footer;
  const columns: FooterColumn[] =
    footerNav.length > 0
      ? [
          {
            title: locale === "ar" ? "روابط سريعة" : "Links",
            links: footerNav.map((r) => ({
              label: String(r.label ?? ""),
              href: withLocale(String(r.href ?? "/"), locale),
            })),
          },
        ]
      : fallbackFooterColumns(locale).map((col) => ({
          ...col,
          links: col.links.map((l) => ({
            ...l,
            href: withLocale(l.href, locale),
          })),
        }));

  return (
    <footer className="mt-auto border-t border-[var(--estio-border)] bg-[var(--estio-surface)]">
      <Container as="div" className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="font-display text-lg font-semibold tracking-tight text-[var(--estio-ink)]">
              {legalName}
            </p>
            <p className="mt-4 max-w-md text-sm leading-[1.65] text-[var(--estio-muted)]">
              {taglineFooter}
            </p>
            <address className="mt-8 not-italic">
              <ul className="space-y-3 text-sm text-[var(--estio-body)]">
                <li>
                  <span className="text-[var(--estio-muted)]">
                    {ui.footerContact.web}{" "}
                  </span>
                  <a
                    href={websiteHref}
                    className="font-medium text-[var(--estio-accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--estio-accent)]"
                  >
                    {website}
                  </a>
                </li>
                <li>{cityLine}</li>
                <li>
                  <span className="text-[var(--estio-muted)]">
                    {ui.footerContact.phone}{" "}
                  </span>
                  <a
                    href={phoneHref}
                    className="font-medium text-[var(--estio-ink)] underline-offset-4 hover:underline"
                  >
                    {phoneDisplayUi}
                  </a>
                </li>
                <li>
                  <span className="text-[var(--estio-muted)]">
                    {ui.footerContact.email}{" "}
                  </span>
                  <a
                    href={emailHref}
                    className="font-medium text-[var(--estio-accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--estio-accent)]"
                  >
                    {email}
                  </a>
                </li>
              </ul>
            </address>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-6 lg:col-start-8">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--estio-muted)]">
                  {col.title}
                </p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-[var(--estio-body)] underline-offset-4 transition-colors hover:text-[var(--estio-ink)] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--estio-accent)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-14 border-t border-[var(--estio-border)] pt-8 text-xs text-[var(--estio-muted)]">
          © {new Date().getFullYear()} {displayBrand}.{" "}
          {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
        </p>
      </Container>
    </footer>
  );
}
