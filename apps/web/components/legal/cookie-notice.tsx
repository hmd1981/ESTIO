"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";

const STORAGE_KEY = "estio-cookie-notice-accepted";

export function CookieNotice() {
  const pathname = usePathname();
  const localeSegment = pathname?.split("/").filter(Boolean)[0] ?? "en";
  const locale = isLocale(localeSegment) ? localeSegment : "en";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const copy =
    locale === "ar"
      ? {
          text: "نستخدم ملفات ارتباط وتقنيات مشابهة لتشغيل الموقع وقياس الزيارات، وعلى صفحات المحتوى إعلانات من جوجل. التفاصيل في سياسة الخصوصية وملفات الارتباط.",
          accept: "موافق",
          privacy: "الخصوصية",
          cookies: "ملفات الارتباط",
        }
      : {
          text: "We use cookies and similar technologies to run the site, measure visits, and — on content pages — show Google ads. Details are in the Privacy and Cookie policies.",
          accept: "Accept",
          privacy: "Privacy",
          cookies: "Cookies",
        };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-6"
      role="dialog"
      aria-label={locale === "ar" ? "إشعار ملفات الارتباط" : "Cookie notice"}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-body)]">
          {copy.text}{" "}
          <Link
            href={withLocale("/privacy", locale)}
            className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
          >
            {copy.privacy}
          </Link>
          {" · "}
          <Link
            href={withLocale("/cookies", locale)}
            className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
          >
            {copy.cookies}
          </Link>
        </p>
        <button
          type="button"
          className="shrink-0 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)]"
          onClick={() => {
            try {
              window.localStorage.setItem(STORAGE_KEY, "1");
            } catch {
              /* ignore quota / private mode */
            }
            setVisible(false);
          }}
        >
          {copy.accept}
        </button>
      </div>
    </div>
  );
}
