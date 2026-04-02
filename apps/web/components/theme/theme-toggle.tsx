"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { useSiteBundle } from "@/components/site-bundle-context";
import { getMessages } from "@/lib/i18n/messages";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { locale } = useSiteBundle();
  const t = getMessages(locale).theme;
  const isLight = theme === "light";
  const label = isLight ? t.switchToDark : t.switchToLight;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      className="inline-flex h-9 w-[3.25rem] shrink-0 items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-0.5 transition-[background-color,border-color,box-shadow] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <span
        aria-hidden
        className={`pointer-events-none flex h-7 w-7 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)] shadow-sm transition-transform duration-200 ease-out ${
          isLight ? "translate-x-[1.35rem]" : "translate-x-0"
        }`}
      >
        {isLight ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm5.657 2.343a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM18 11a1 1 0 110 2h-1a1 1 0 110-2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM6 11a1 1 0 10-2 0v1a1 1 0 102 0v-1zm.343-5.657a1 1 0 001.414 0l.707-.707A1 1 0 105.05 6.464l.707.707a1 1 0 001.414 0zM12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="-rotate-12"
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </span>
    </button>
  );
}
