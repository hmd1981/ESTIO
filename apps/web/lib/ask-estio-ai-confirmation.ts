/** Mirrors API confirmation detector for client-side stage transitions. */
export function detectClientConfirmation(raw: string): boolean {
  const s = raw.replace(/\s+/g, " ").trim().toLowerCase();
  if (!s || s.length > 80) return false;

  if (
    /^(y(es)?|ok(ay)?|sure|yep|yeah|go ahead|let'?s do it|let us do it|sounds good|fine|absolutely|definitely|do it|please do|go for it)[\s!.]*$/i.test(
      s,
    )
  ) {
    return true;
  }

  if (
    /^(نعم|تمام|تمامًا|اوكي|أوكي|اوکی|موافق|يلا|تم|صح|صحيح|أكيد|طيب|ماشي|الموافقة)[\s!.؟]*$/u.test(
      s,
    )
  ) {
    return true;
  }

  if (
    /^(بله|آره|اره|اوکی|اوکیه|باشه|باش|حتما|حتماً|انجامش بده|بزن بریم|اوکیه برو|ok|yes)[\s!.؟]*$/u.test(
      s,
    )
  ) {
    return true;
  }

  return false;
}

export type FlowStage =
  | "explore"
  | "clarify"
  | "ready"
  | "action"
  | "complete";

export function normalizeFlowStage(stage?: string): FlowStage {
  const x = String(stage ?? "")
    .trim()
    .toLowerCase();
  if (x === "intent_set") return "clarify";
  if (
    x === "explore" ||
    x === "clarify" ||
    x === "ready" ||
    x === "action" ||
    x === "complete"
  ) {
    return x;
  }
  return "explore";
}
