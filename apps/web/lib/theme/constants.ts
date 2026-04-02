export type ThemeMode = "light" | "dark";

export const THEME_COOKIE_NAME = "estio-theme";

export const THEME_STORAGE_KEY = "estio-theme";

export function readThemeFromDocumentCookie(): ThemeMode | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp(
      `(?:^|; )${THEME_COOKIE_NAME.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&")}=(light|dark)(?:;|$)`,
    ),
  );
  if (m?.[1] === "light" || m?.[1] === "dark") return m[1];
  return null;
}
