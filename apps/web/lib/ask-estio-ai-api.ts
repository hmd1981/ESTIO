export type AskEstioAiResponse = {
  answer: string;
  intent: "images" | "video" | "brand" | "unknown";
  recommendedOffer: string | null;
  recommendedCta: {
    label: string;
    intent: "images" | "video" | "brand" | null;
  } | null;
  secondaryCta: { label: string; href: string } | null;
  tokensUsed?: number;
  logId: string;
  rateLimited?: boolean;
  disabled?: boolean;
};

export type AskEstioAiRequestContext = {
  intent?: "images" | "video" | "brand" | "unknown";
  useCase?: string;
  platform?: string;
  stage?: string;
  recentUserMessages?: string[];
};

export type AskEstioAiHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type AskEstioAiDetectedLanguage =
  | "en"
  | "ar"
  | "fa"
  | "mixed"
  | "unknown";

export async function postAskEstioAi(body: {
  message: string;
  sessionId: string;
  locale: "en" | "ar";
  page: string;
  url?: string;
  source?: string;
  intentHint?: "images" | "video" | "brand" | "unknown";
  context?: AskEstioAiRequestContext;
  pageLocale?: "en" | "ar";
  detectedLanguage?: AskEstioAiDetectedLanguage;
  turnCount?: number;
  history?: AskEstioAiHistoryItem[];
}): Promise<AskEstioAiResponse> {
  const res = await fetch("/api/public/ai-studio/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as
    | AskEstioAiResponse
    | { error?: string; message?: string }
    | null;
  if (!res.ok) {
    throw new Error(
      typeof (data as { message?: string })?.message === "string"
        ? (data as { message: string }).message
        : `ask_failed_${res.status}`,
    );
  }
  return data as AskEstioAiResponse;
}

export async function postAskInteraction(body: {
  sessionId: string;
  logId: string;
  kind: "primary_cta" | "secondary_cta";
}): Promise<void> {
  try {
    await fetch("/api/public/ai-studio/ask-interaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    /* non-blocking */
  }
}
