import { THEME_COOKIE_NAME, THEME_STORAGE_KEY, type ThemeMode } from "./constants";

/** Runs synchronously at the start of <body> to lock the document to dark mode before paint. */
export const themeInlineBootstrap = `
(function(){
  try {
    var k='${THEME_STORAGE_KEY}', ck='${THEME_COOKIE_NAME}';
    var r=document.documentElement;
    r.classList.remove('theme-light','theme-dark');
    r.classList.add('theme-dark');
    r.style.colorScheme='dark';
    try{ localStorage.setItem(k,'dark'); }catch(e){}
    document.cookie=ck+'=dark;path=/;max-age='+(60*60*24*365)+';SameSite=Lax';
  } catch(e) {
    document.documentElement.classList.add('theme-dark');
    document.documentElement.style.colorScheme='dark';
  }
})();
`.trim();

export function parseThemeCookie(
  value: string | undefined,
): ThemeMode | null {
  return value === "dark" ? "dark" : null;
}
