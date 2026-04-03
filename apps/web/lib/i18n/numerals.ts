/**
 * ASCII 0–9 → Persian / Extended Arabic-Indic digits (۰–۹, U+06F0–U+06F9).
 * Common in Arabic RTL interfaces alongside Arabic script; matches shapes like ۰۰۹۶۸۹۳۳۷۶۹۴۰.
 */
const DIGIT_MAP: Record<string, string> = {
  "0": "۰",
  "1": "۱",
  "2": "۲",
  "3": "۳",
  "4": "۴",
  "5": "۵",
  "6": "۶",
  "7": "۷",
  "8": "۸",
  "9": "۹",
};

/** Replace ASCII digits for on-page display; keep `tel:` / APIs on Latin digits. */
export function toArabicUiNumerals(input: string): string {
  return input.replace(/[0-9]/g, (d) => DIGIT_MAP[d] ?? d);
}
