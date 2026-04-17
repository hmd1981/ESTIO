/** Dispatched when user picks an AI Studio intent (hero, cards, Ask Estio). */
export const AI_STUDIO_FUNNEL_OPEN_EVENT = "estio-ai-studio-funnel-open";

/** Contact form skips its initial `from-ai-studio` ping when the funnel already posted. */
export const FUNNEL_V3_CRM_SENT_KEY = "estio-funnel-v3-crm-sent";

export type AiStudioFunnelOpenDetail = {
  intent: "images" | "video" | "brand";
  source?: string;
  /** Prefill prompt (e.g. last Ask Estio user message). */
  prompt?: string;
};
