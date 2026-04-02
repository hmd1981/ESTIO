import { THEME_COOKIE_NAME, THEME_STORAGE_KEY, type ThemeMode } from "./constants";

export function applyThemeDom(_theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add("theme-dark");
  root.style.colorScheme = "dark";

  try {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
  } catch {
    /* ignore */
  }

  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${THEME_COOKIE_NAME}=dark;path=/;max-age=${maxAge};SameSite=Lax`;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", "#000000");
  }
}
