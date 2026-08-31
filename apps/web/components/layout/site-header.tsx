"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand, fallbackPrimaryNav } from "@/lib/content/site";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ButtonLink } from "@/components/ui/button-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { NavItem } from "@/lib/content/types";
import { useSiteBundle } from "@/components/site-bundle-context";
import { withLocale } from "@/lib/i18n/paths";
import type { AppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { normalizeHeaderNavHref } from "@/lib/nav/normalize-header-nav";
import { mergeHeaderNav } from "@/lib/nav/merge-header-nav";

function bundleNavToItems(
  rows: Array<Record<string, unknown>>,
  locale: AppLocale,
): NavItem[] {
  return rows.map((r) => {
    const label = String(r.label ?? "");
    return {
      label,
      href: normalizeHeaderNavHref(label, String(r.href ?? "/"), locale),
    };
  });
}

export function SiteHeader() {
  const bundle = useSiteBundle();
  const locale = bundle.locale;
  const pathname = usePathname() ?? withLocale("/", locale);
  const ui = getMessages(locale);
  const labels = (bundle.settings?.globalLabels ?? null) as
    | Record<string, unknown>
    | null;
  const headerRows = bundle.navigation.header;
  const fallback = fallbackPrimaryNav(locale).map((i) => ({
    ...i,
    href: normalizeHeaderNavHref(i.label, i.href, locale),
  }));
  const navItems: NavItem[] =
    headerRows.length > 0
      ? mergeHeaderNav(bundleNavToItems(headerRows, locale), fallback)
      : fallback;

  const displayName =
    locale === "ar" && bundle.settings && bundle.settings.brandNameAr
      ? String(bundle.settings.brandNameAr)
      : bundle.settings?.brandName
        ? String(bundle.settings.brandName)
        : brand.name;

  const contactHref = withLocale("/contact", locale);
  const homeHref = withLocale("/", locale);
  const aiStudioHref = withLocale("/ai-studio", locale);
  const rawCta =
    locale === "ar"
      ? (labels?.ar as Record<string, unknown> | undefined)?.primaryCta
      : (labels?.en as Record<string, unknown> | undefined)?.primaryCta;
  const ctaText = typeof rawCta === "string" ? rawCta.trim() : "";
  const talkLabel =
    (ctaText && ctaText !== "Start qualification" ? ctaText : null) ??
    (locale === "ar" ? "عرض سعر" : "Get a quote");
  const aiStudioLabel = locale === "ar" ? "\u0634\u0627\u0647\u062f \u0627\u0644\u0625\u0646\u062a\u0627\u062c" : "See studio output";
  const isOnAiStudio = pathname.startsWith(aiStudioHref);

  const isActiveHref = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--header-scrim)] shadow-[0_0_20px_rgba(212,175,55,0.15)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] transition-[background-color,border-color,box-shadow] duration-200 ease-out">
      <Container
        as="div"
        className="flex h-[4.5rem] max-w-6xl items-center gap-4 sm:gap-8"
      >
        <Link
          href={homeHref}
          className="group inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          aria-label={ui.brandHomeAria.replace("{name}", displayName)}
        >
          <img
            src="/logo/estio.svg"
            alt=""
            aria-hidden="true"
            className="h-8 w-auto opacity-95 transition-[opacity,filter] duration-200 ease-out group-hover:opacity-80 group-hover:drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]"
          />
        </Link>
        <nav
          className="hidden flex-1 items-center justify-center gap-10 lg:flex"
          aria-label={ui.navPrimaryAria}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActiveHref(item.href) ? "page" : undefined}
              className="group relative pb-1 text-[0.8125rem] font-medium focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              <span
                className={`transition-colors duration-200 ease-out ${
                  isActiveHref(item.href)
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-body)] group-hover:text-[var(--accent)]"
                }`}
              >
                {item.label}
              </span>
              <span
                className={`absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--accent)] transition-transform duration-200 ease-out ${
                  isActiveHref(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          ))}
        </nav>
        <div
          dir="ltr"
          className="flex flex-1 items-center justify-end gap-2 sm:gap-3 lg:flex-none"
        >
          <LanguageSwitcher />
          {!isOnAiStudio && (
            <Link
              href={aiStudioHref}
              className="group/studio hidden items-center gap-1 rounded-md border border-transparent px-3 py-1.5 text-[0.8125rem] font-semibold text-[var(--accent)] transition-all duration-200 ease-out hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:inline-flex"
            >
              <span>{aiStudioLabel}</span>
              <span className="inline-block transition-transform duration-200 ease-out group-hover/studio:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true">&rarr;</span>
            </Link>
          )}
          <ButtonLink
            href={contactHref}
            className="hidden min-[400px]:inline-flex text-[0.8125rem]"
          >
            {String(talkLabel)}
          </ButtonLink>
          <MobileNav
            items={navItems}
            contactHref={contactHref}
            aiStudioHref={isOnAiStudio ? undefined : aiStudioHref}
            aiStudioLabel={aiStudioLabel}
          />
        </div>
      </Container>
    </header>
  );
}
