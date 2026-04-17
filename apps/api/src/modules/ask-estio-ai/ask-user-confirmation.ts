/**
 * Short affirmations only — avoids matching arbitrary "yes" inside longer sentences
 * by requiring the trimmed message to be short OR match whole-message patterns.
 */
export function detectUserConfirmation(message: string): boolean {
  const t = message.replace(/\s+/g, ' ').trim();
  if (!t) return false;

  const lower = t.toLowerCase();
  if (t.length <= 32) {
    const en = /^(yes|yep|yeah|ok|okay|sure|fine|go ahead|let'?s do it|let us do it|sounds good|cool|agreed|confirm(ed)?|absolutely)\.?$/i;
    if (en.test(lower)) return true;
    const ar =
      /^(نعم|تمام|تم|اوكي|أوكي|اوکی|موافق|يلا|تمام\s*يا\s*غالي|زين)\.?$/u;
    if (ar.test(t.trim())) return true;
    const fa =
      /^(بله|آره|اره|اوکی|اوکی|باشه|باش|حتما|انجامش\s*بده|بریم|ok|yes)\.?$/iu;
    if (fa.test(t.trim())) return true;
  }

  const phraseEn =
    /^(yes|ok|okay|sure)\s*[,.]?\s*(please|go|let'?s go)\b/i.test(lower) ||
    /^let'?s\s+do\s+it\b/i.test(lower) ||
    /^go\s+ahead\b/i.test(lower) ||
    /^sounds\s+good\b/i.test(lower);
  if (phraseEn) return true;

  const phraseAr =
    /^(تمام|موافق|يلا|نعم)\s*[،,.]?\s*(كمل|نكمل|نبدأ|يلا)/u.test(t) ||
    /^اوكي\s*[،,.]?\s*(كمل|نكمل)/u.test(t);
  if (phraseAr) return true;

  const phraseFa =
    /^(باشه|بله|اوکی)\s*[،,.]?\s*(بریم|شروع|اوکی)/u.test(t) ||
    /^انجامش\s+بده/u.test(t);
  if (phraseFa) return true;

  return false;
}
