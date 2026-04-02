/**
 * Soft guardrails for Arabic CMS fields: non-blocking warnings when text looks
 * Latin-heavy (possible English leakage). Operators can ignore; save is never blocked.
 */

const ARABIC_LETTER =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const LATIN_LETTER = /[A-Za-z]/g;

/** Brand / product tokens often kept in Latin on AR pages */
const ALLOWED_LATIN_FRAGMENTS =
  /\b(CRM|ERP|IT|SEO|PDF|CMS|API|URL|FAQ|GCC|AI|UI|UX|WhatsApp|LinkedIn|YouTube|Instagram|Estio)\b/gi;

function stripUrlsEmailsAndAllowed(s: string): string {
  return s
    .replace(/https?:\/\/[^\s]+/gi, " ")
    .replace(/[\w.+-]+@[\w.-]+\.\w+/g, " ")
    .replace(ALLOWED_LATIN_FRAGMENTS, " ");
}

export type LocaleFieldEntry = { label: string; value: string };

/**
 * Returns a human-readable warning if `value` looks unexpectedly English-heavy
 * for an Arabic editorial field. Empty when nothing suspicious.
 */
export function arabicFieldWarning(
  value: string,
  label: string,
): string | null {
  const raw = value.trim();
  if (raw.length < 18) return null;

  const cleaned = stripUrlsEmailsAndAllowed(raw).trim();
  if (cleaned.length < 12) return null;

  const latin = (cleaned.match(LATIN_LETTER) ?? []).length;
  const arabic = (cleaned.match(ARABIC_LETTER) ?? []).length;
  const letters = latin + arabic;
  if (letters < 14) return null;

  const latinRatio = latin / letters;
  // Strong Latin majority with little Arabic script → likely leakage or wrong locale
  if (latinRatio > 0.42 && arabic < latin * 0.85) {
    return `«${label}»: يبدو النص قريبًا من الإنجليزية أكثر من العربية — راجعوا الصياغة.`;
  }
  return null;
}

export function collectArabicLocaleWarnings(
  fields: LocaleFieldEntry[],
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const { label, value } of fields) {
    const w = arabicFieldWarning(value, label);
    if (w && !seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}
