"use client";

import { useParams } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export function SkipLink() {
  const params = useParams();
  const raw = params?.locale;
  const locale =
    typeof raw === "string" && isLocale(raw) ? raw : ("en" as const);
  const { skipToMain } = getMessages(locale);

  return (
    <a
      href="#main-content"
      className="absolute left-4 top-4 z-[100] -translate-y-16 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)] opacity-0 shadow-md transition-[opacity,transform,background-color,color] duration-200 ease-out focus:translate-y-0 focus:opacity-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--accent-fg)]"
    >
      {skipToMain}
    </a>
  );
}
