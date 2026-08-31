"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppLocale } from "@/lib/i18n/config";
import { alternateLocaleHref } from "@/lib/i18n/paths";

type Props = {
  className?: string;
};

/**
 * Locale toggle: URL is the source of truth (not only CMS bundle) so href stays
 * correct after navigations. Full page load on tap avoids mobile WebViews / RSC
 * transitions that sometimes leave the previous locale visible.
 */
export function LanguageSwitcher({ className }: Props) {
  const pathname = usePathname() ?? "/";
  const first = pathname.split("/").filter(Boolean)[0];
  const current: AppLocale = first === "ar" ? "ar" : "en";
  const other: AppLocale = current === "en" ? "ar" : "en";
  const href = alternateLocaleHref(pathname, other);

  const base =
    "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-transparent px-2 text-[0.8125rem] font-medium text-[var(--muted)] transition-[color,border-color,box-shadow] duration-200 ease-out hover:border-[var(--border)] hover:text-[var(--accent)] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

  return (
    <Link
      href={href}
      prefetch={false}
      hrefLang={other}
      className={className ? `${base} ${className}` : base}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (e.button !== 0) return;
        e.preventDefault();
        window.location.assign(href);
      }}
    >
      {other === "ar" ? "العربية" : "English"}
    </Link>
  );
}
