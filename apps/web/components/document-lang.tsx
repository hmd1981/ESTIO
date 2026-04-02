"use client";

import { useEffect } from "react";

/**
 * Keeps `lang` / `dir` in sync after client navigations. Root `layout.tsx` already sets
 * SSR attributes via middleware (`x-estio-locale`); this effect matches SPA transitions.
 */
export function DocumentLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
