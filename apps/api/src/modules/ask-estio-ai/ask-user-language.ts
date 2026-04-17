/**
 * Lightweight script detection for user messages (no external deps).
 * Output feeds prompts and UI session — not a legal/locale authority.
 */

export type DetectedUserLanguage = 'en' | 'ar' | 'fa' | 'mixed' | 'unknown';

const PERSIAN_LETTERS = /[\u067E\u0686\u0698\u06AF\u06A9\u06CC]/;
const LATIN = /[A-Za-z]/g;
const ARABIC_SCRIPT =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

function countMatches(s: string, re: RegExp): number {
  const m = s.match(re);
  return m ? m.length : 0;
}

/** Count Arabic-script letters excluding strong Persian-only codepoints (heuristic). */
function arabicScriptCount(s: string): number {
  let n = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp >= 0x0600 && cp <= 0x06ff) n++;
    else if (cp >= 0x0750 && cp <= 0x077f) n++;
    else if (cp >= 0x08a0 && cp <= 0x08ff) n++;
    else if (cp >= 0xfb50 && cp <= 0xfdff) n++;
    else if (cp >= 0xfe70 && cp <= 0xfeff) n++;
  }
  return n;
}

/**
 * Detect dominant language of the latest user message.
 */
export function detectUserMessageLanguage(text: string): DetectedUserLanguage {
  const s = text.replace(/\s+/g, ' ').trim();
  if (!s) return 'unknown';

  const latin = countMatches(s, LATIN);
  const arabic = arabicScriptCount(s);
  const totalLetters = latin + arabic;
  if (totalLetters < 3) return 'unknown';

  const persianSignal = PERSIAN_LETTERS.test(s) ? 1 : 0;
  const persianWords = /(می‌|می |هستم|می‌خوام|می‌خواهم|باشه|چطور|چیزی|برای)/.test(
    s,
  )
    ? 1
    : 0;

  const lShare = latin / totalLetters;
  const aShare = arabic / totalLetters;

  if (lShare >= 0.55 && aShare <= 0.2) return 'en';
  if (aShare >= 0.55 && lShare <= 0.2) {
    if (persianSignal || persianWords) return 'fa';
    return 'ar';
  }

  if (lShare >= 0.25 && aShare >= 0.25) return 'mixed';

  if (aShare > lShare) {
    if (persianSignal || persianWords) return 'fa';
    return 'ar';
  }
  if (lShare > aShare) return 'en';

  return 'mixed';
}

export type AskReplyLocale = 'en' | 'ar' | 'fa';

/**
 * Language the assistant should write in (page locale is fallback only).
 */
export function resolveReplyLocale(
  detected: DetectedUserLanguage | undefined,
  pageLocale: 'en' | 'ar',
): AskReplyLocale {
  const d = detected ?? 'unknown';
  if (d === 'en') return 'en';
  if (d === 'ar') return 'ar';
  if (d === 'fa') return 'fa';
  if (d === 'mixed' || d === 'unknown') {
    return pageLocale === 'ar' ? 'ar' : 'en';
  }
  return pageLocale === 'ar' ? 'ar' : 'en';
}
