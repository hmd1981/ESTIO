/**
 * Short affirmative replies — do not treat as new discovery prompts.
 */
export function detectUserConfirmation(raw: string): boolean {
  const s = raw.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!s || s.length > 80) return false;

  const en =
    /^(y(es)?|ok(ay)?|sure|yep|yeah|go ahead|let'?s do it|let us do it|sounds good|fine|absolutely|definitely|do it|please do|go for it)[\s!.]*$/i.test(
      s,
    );
  if (en) return true;

  const ar =
    /^(نعم|تمام|تمامًا|اوكي|أوكي|اوکی|موافق|يلا|تم|صح|صحيح|أكيد|طيب|ماشي|الموافقة)[\s!.؟]*$/u.test(
      s,
    );
  if (ar) return true;

  const fa =
    /^(بله|آره|اره|اوکی|اوکیه|باشه|باش|حتما|حتماً|انجامش بده|بزن بریم|اوکیه برو|ok|yes)[\s!.؟]*$/u.test(
      s,
    );
  if (fa) return true;

  return false;
}

export const FLOW_STAGES = [
  'explore',
  'clarify',
  'ready',
  'action',
  'complete',
] as const;

export type FlowStage = (typeof FLOW_STAGES)[number];

export function normalizeClientFlowStage(stage?: string): FlowStage {
  const x = String(stage ?? '')
    .trim()
    .toLowerCase();
  if (x === 'intent_set') return 'clarify';
  if (FLOW_STAGES.includes(x as FlowStage)) return x as FlowStage;
  return 'explore';
}
