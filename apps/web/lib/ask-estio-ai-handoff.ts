export const ASK_ESTIO_AI_HANDOFF_KEY = "estio-ask-estio-ai-handoff";

export type AskEstioAiHandoffPayload = {
  userMessage: string;
  detectedIntent: "images" | "video" | "brand" | "unknown";
  recommendedOffer: string | null;
  responseSummary: string;
  sessionId: string;
};

export function stashAskEstioAiHandoff(payload: AskEstioAiHandoffPayload): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ASK_ESTIO_AI_HANDOFF_KEY, JSON.stringify(payload));
  } catch {
    /* noop */
  }
}
