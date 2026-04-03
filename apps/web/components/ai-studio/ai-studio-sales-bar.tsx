"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSiteBundle } from "@/components/site-bundle-context";
import { withLocale } from "@/lib/i18n/paths";

const DISMISS_KEY = "estio-aistudio-bar-dismissed";
const SCROLL_THRESHOLD = 0.27;

const HIDE_PREFIXES = ["/ai-studio", "/admin", "/login"];

function shouldHide(pathname: string): boolean {
  const stripped = pathname.replace(/^\/(en|ar)/, "");
  return HIDE_PREFIXES.some(
    (p) => stripped === p || stripped.startsWith(`${p}/`),
  );
}

export function AiStudioSalesBar() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname() ?? "/";
  const bundle = useSiteBundle();
  const locale = bundle.locale;

  const handleScroll = useCallback(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const scrolled = window.scrollY / docHeight;
    if (scrolled >= SCROLL_THRESHOLD) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (shouldHide(pathname) || dismissed) {
      setVisible(false);
      return;
    }
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
        return;
      }
    } catch {
      /* SSR or blocked storage */
    }
    setMounted(true);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, dismissed, handleScroll]);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* blocked storage */
    }
  };

  if (!mounted || dismissed || shouldHide(pathname)) return null;

  const aiStudioHref = withLocale("/ai-studio", locale);

  const message =
    locale === "ar"
      ? "\u0645\u0631\u0626\u064a\u0627\u062a \u0648\u0641\u064a\u062f\u064a\u0648 \u0648\u0623\u0646\u0638\u0645\u0629 \u0639\u0644\u0627\u0645\u0629 \u062a\u062c\u0627\u0631\u064a\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u2014 \u062a\u064f\u0633\u0644\u0651\u0645\u060c \u0644\u0627 \u062a\u064f\u0648\u0644\u0651\u062f."
      : "Production-grade AI visuals, video, and brand systems \u2014 delivered, not generated.";

  const ctaLabel =
    locale === "ar"
      ? "\u0634\u0627\u0647\u062f \u0627\u0644\u0625\u0646\u062a\u0627\u062c"
      : "See studio output";

  return (
    <div
      role="complementary"
      aria-label={locale === "ar" ? "\u0627\u0633\u062a\u0648\u062f\u064a\u0648 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a" : "AI Studio"}
      className={`fixed inset-x-0 bottom-0 z-30 transition-all duration-500 ease-out motion-reduce:transition-none ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="flex items-center gap-4 rounded-xl border border-[rgba(212,175,55,0.25)] bg-[linear-gradient(135deg,rgba(0,0,0,0.94)_0%,rgba(212,175,55,0.06)_100%)] px-5 py-3.5 shadow-[0_-4px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(212,175,55,0.1)] backdrop-blur-xl sm:gap-5 sm:px-6 sm:py-4">
          <p className="min-w-0 flex-1 text-[0.8125rem] leading-snug text-[var(--text-body)] sm:text-sm sm:leading-normal">
            {message}
          </p>
          <Link
            href={aiStudioHref}
            className="group/bar inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-[var(--accent)] bg-transparent px-4 py-2 text-xs font-semibold text-[var(--accent)] transition-all duration-200 ease-out hover:-translate-y-px hover:bg-[var(--accent)] hover:text-black hover:shadow-[0_4px_16px_rgba(212,175,55,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-5 sm:py-2.5 sm:text-[0.8125rem]"
          >
            <span>{ctaLabel}</span>
            <span className="inline-block transition-transform duration-200 ease-out group-hover/bar:translate-x-1 motion-reduce:transition-none" aria-hidden="true">&rarr;</span>
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--muted)] transition-colors duration-200 hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            aria-label={locale === "ar" ? "\u0625\u063a\u0644\u0627\u0642" : "Dismiss"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
