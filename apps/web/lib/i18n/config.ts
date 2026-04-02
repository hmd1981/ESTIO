export const locales = ["en", "ar"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "en";

export function isLocale(x: string): x is AppLocale {
  return locales.includes(x as AppLocale);
}
