"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { fallbackPrimaryNav } from "@/lib/content/site";
import type { NavItem } from "@/lib/content/types";
import { ButtonLink } from "@/components/ui/button-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSiteBundle } from "@/components/site-bundle-context";
import { getMessages } from "@/lib/i18n/messages";
import { withLocale } from "@/lib/i18n/paths";
import { normalizeHeaderNavHref } from "@/lib/nav/normalize-header-nav";

type Props = {
  items?: NavItem[];
  contactHref?: string;
  aiStudioHref?: string;
  aiStudioLabel?: string;
};

export function MobileNav({ items, contactHref, aiStudioHref, aiStudioLabel }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const bundle = useSiteBundle();
  const ui = getMessages(bundle.locale);
  const labels = (bundle.settings?.globalLabels ?? null) as
    | Record<string, unknown>
    | null;
  const navItems =
    items ??
    fallbackPrimaryNav(bundle.locale).map((i) => ({
      ...i,
      href: normalizeHeaderNavHref(i.label, i.href, bundle.locale),
    }));
  const talkHref = contactHref ?? withLocale("/contact", bundle.locale);
  const rawCta =
    bundle.locale === "ar"
      ? (labels?.ar as Record<string, unknown> | undefined)?.primaryCta
      : (labels?.en as Record<string, unknown> | undefined)?.primaryCta;
  const ctaText = typeof rawCta === "string" ? rawCta.trim() : "";
  const talkLabel =
    (ctaText && ctaText !== "Start qualification" ? ctaText : null) ??
    (bundle.locale === "ar" ? "عرض سعر" : "Get a quote");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_84%,transparent)] text-[var(--text)] shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-colors duration-200 ease-out hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">
          {open ? ui.mobileNav.closeMenu : ui.mobileNav.openMenu}
        </span>
        {open ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[var(--overlay)]"
            aria-label={ui.mobileNav.closeOverlay}
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] shadow-[0_0_24px_rgba(212,175,55,0.12)] backdrop-blur-xl transition-[background-color,border-color] duration-200 ease-out"
          >
            <nav aria-label={ui.mobileNav.navAria} className="px-5 py-6">
              <ul className="space-y-0.5">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-md px-3 py-3 text-sm font-medium text-[var(--text)] transition-colors duration-200 ease-out hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-6">
                <div
                  dir="ltr"
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-xs font-medium text-[var(--text-body)]">
                    {bundle.locale === "ar" ? "اللغة" : "Language"}
                  </span>
                  <LanguageSwitcher className="min-h-12 min-w-12 text-sm" />
                </div>
                {aiStudioHref && (
                  <ButtonLink
                    href={aiStudioHref}
                    variant="secondary"
                    className="group/studio w-full"
                  >
                    <span>{aiStudioLabel ?? "Explore AI Studio"}</span>
                    <span className="ms-1.5 inline-block transition-transform duration-200 ease-out group-hover/studio:translate-x-1 motion-reduce:transition-none" aria-hidden="true">&rarr;</span>
                  </ButtonLink>
                )}
                <ButtonLink href={talkHref} className="w-full min-[400px]:w-auto">
                  {String(talkLabel)}
                </ButtonLink>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
