import type {
  AskEstioAiRequestContext,
  AskEstioAiResponse,
} from "@/lib/ask-estio-ai-api";
import {
  detectClientConfirmation,
  normalizeFlowStage,
  type FlowStage,
} from "@/lib/ask-estio-ai-confirmation";

export const ASK_AI_CHAT_STORAGE_KEY = "estio-ask-ai-chat";

/** @deprecated legacy key — cleared on reset */
const LEGACY_STORAGE_KEY = "estio-ask-ai-state";

export type AskAiSessionIntent = "images" | "video" | "brand" | "unknown";

export type DetectedLanguage = "en" | "ar" | "fa" | "mixed" | "unknown";

export type ChatUserMessage = { role: "user"; content: string };

export type ChatAssistantMessage = {
  role: "assistant";
  content: string;
  /** Only the latest assistant turn carries CTAs / logId for analytics. */
  responsePayload?: AskEstioAiResponse;
};

export type ChatMessage = ChatUserMessage | ChatAssistantMessage;

export type AskAiChatSession = {
  messages: ChatMessage[];
  context: {
    intent?: AskAiSessionIntent | string;
    useCase?: string;
    platform?: string;
    stage?: string;
  };
  turnCount: number;
  detectedLanguage: DetectedLanguage;
};

const MAX_MSG = 500;
const MAX_HISTORY_API = 6;

function truncate(s: string): string {
  const x = s.trim();
  if (x.length <= MAX_MSG) return x;
  return x.slice(0, MAX_MSG);
}

const PERSIAN_LETTERS = /[\u067E\u0686\u0698\u06AF\u06A9\u06CC]/;
const LATIN = /[A-Za-z]/g;
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

/** Client-side mirror of server heuristic for session persistence. */
export function detectClientLanguage(text: string): DetectedLanguage {
  const s = text.replace(/\s+/g, " ").trim();
  if (!s) return "unknown";
  const latin = (s.match(LATIN) ?? []).length;
  const arabic = arabicScriptCount(s);
  const total = latin + arabic;
  if (total < 3) return "unknown";
  const persianSignal = PERSIAN_LETTERS.test(s) ? 1 : 0;
  const persianWords = /(می‌|می |هستم|می‌خوام|می‌خواهم|باشه|چطور|چیزی|برای)/.test(s)
    ? 1
    : 0;
  const lShare = latin / total;
  const aShare = arabic / total;
  if (lShare >= 0.55 && aShare <= 0.2) return "en";
  if (aShare >= 0.55 && lShare <= 0.2) {
    if (persianSignal || persianWords) return "fa";
    return "ar";
  }
  if (lShare >= 0.25 && aShare >= 0.25) return "mixed";
  if (aShare > lShare) {
    if (persianSignal || persianWords) return "fa";
    return "ar";
  }
  if (lShare > aShare) return "en";
  return "mixed";
}

function emptySession(): AskAiChatSession {
  return {
    messages: [],
    context: {},
    turnCount: 0,
    detectedLanguage: "unknown",
  };
}

export function loadAskAiChatSession(): AskAiChatSession {
  if (typeof sessionStorage === "undefined") return emptySession();
  try {
    const raw = sessionStorage.getItem(ASK_AI_CHAT_STORAGE_KEY);
    if (!raw) return emptySession();
    const p = JSON.parse(raw) as Partial<AskAiChatSession>;
    if (!p || typeof p !== "object" || !Array.isArray(p.messages)) {
      return emptySession();
    }
    return {
      messages: p.messages.map((m) => ({
        role: m.role,
        content: truncate(
          typeof (m as ChatMessage).content === "string"
            ? (m as ChatMessage).content
            : "",
        ),
        ...(m.role === "assistant" &&
        (m as ChatAssistantMessage).responsePayload
          ? { responsePayload: (m as ChatAssistantMessage).responsePayload }
          : {}),
      })) as ChatMessage[],
      context:
        typeof p.context === "object" && p.context && !Array.isArray(p.context)
          ? { ...p.context }
          : {},
      turnCount:
        typeof p.turnCount === "number" && p.turnCount >= 0
          ? Math.min(50, p.turnCount)
          : p.messages.filter((m) => m.role === "assistant").length,
      detectedLanguage:
        p.detectedLanguage === "en" ||
        p.detectedLanguage === "ar" ||
        p.detectedLanguage === "fa" ||
        p.detectedLanguage === "mixed" ||
        p.detectedLanguage === "unknown"
          ? p.detectedLanguage
          : "unknown",
    };
  } catch {
    return emptySession();
  }
}

export function saveAskAiChatSession(session: AskAiChatSession): void {
  if (typeof sessionStorage === "undefined") return;
  const toStore: AskAiChatSession = {
    ...session,
    messages: session.messages.map((m, i, arr) => {
      if (m.role !== "assistant") return m;
      const isLastAssistant =
        arr.map((x) => x.role).lastIndexOf("assistant") === i;
      if (isLastAssistant) return m;
      const { responsePayload: _, ...rest } = m as ChatAssistantMessage;
      return { ...rest, role: "assistant" as const, content: m.content };
    }),
    turnCount: session.messages.filter((m) => m.role === "assistant").length,
  };
  sessionStorage.setItem(ASK_AI_CHAT_STORAGE_KEY, JSON.stringify(toStore));
}

export function clearAskAiChatSession(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(ASK_AI_CHAT_STORAGE_KEY);
  sessionStorage.removeItem(LEGACY_STORAGE_KEY);
}

function inferUseCaseFromText(text: string): string | undefined {
  const t = text.toLowerCase();
  const a = text;
  if (/hotel|hospitality|resort|فندق|فنادق|ضیافة|ضيافة/.test(t + a))
    return "hotel";
  if (/restaurant|cafe|dining|مطعم|مقهى/.test(t + a)) return "restaurant";
  if (/e-?commerce|ecommerce|shop\s?online|متجر|تجارة\s*إلكترونية|تسوق/.test(t + a))
    return "ecommerce";
  if (/real\s*estate|property|عقار|عقارات/.test(t + a)) return "real_estate";
  return undefined;
}

function inferPlatformFromText(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/instagram|إنستغرام|انستغرام/.test(t)) return "instagram";
  if (/tiktok|تیک\s*تاک|تيك\s*توك/.test(t)) return "tiktok";
  if (/facebook|meta|فیس|فيسبوك/.test(t)) return "meta";
  if (/youtube|یوتیوب|يوتيوب/.test(t)) return "youtube";
  return undefined;
}

function deriveFlowStageFromIntent(
  intent: AskAiSessionIntent | string | undefined,
  useCase: string | undefined,
  platform: string | undefined,
): FlowStage {
  const hasProd =
    intent === "images" || intent === "video" || intent === "brand";
  if (!hasProd) return "explore";
  if (!useCase?.trim() && !platform?.trim()) return "clarify";
  return "ready";
}

function normalizedIntentFromResponse(
  intent: AskEstioAiResponse["intent"],
): AskAiSessionIntent {
  if (
    intent === "images" ||
    intent === "video" ||
    intent === "brand" ||
    intent === "unknown"
  ) {
    return intent;
  }
  return "unknown";
}

/** API `context` — no full history here (use `history` on the request). */
export function buildAskApiContext(
  session: AskAiChatSession,
  currentMessage: string,
): AskEstioAiRequestContext | undefined {
  const msg = truncate(currentMessage);
  const inferredUse =
    inferUseCaseFromText(msg) ?? session.context.useCase?.trim();
  const inferredPlat =
    inferPlatformFromText(msg) ?? session.context.platform?.trim();

  let intentField: AskEstioAiRequestContext["intent"];
  const si = session.context.intent;
  if (
    si === "images" ||
    si === "video" ||
    si === "brand" ||
    si === "unknown"
  ) {
    intentField = si;
  }

  const derived = deriveFlowStageFromIntent(
    session.context.intent,
    inferredUse,
    inferredPlat,
  );
  const persisted = normalizeFlowStage(session.context.stage);
  let stage: string =
    persisted === "action" || persisted === "complete"
      ? persisted
      : derived;
  const ctx: AskEstioAiRequestContext = {};
  if (intentField) ctx.intent = intentField;
  if (inferredUse) ctx.useCase = inferredUse;
  if (inferredPlat) ctx.platform = inferredPlat;
  ctx.stage = stage;

  const meaningful =
    ctx.intent ||
    ctx.useCase ||
    ctx.platform ||
    ctx.stage !== "explore";

  return meaningful ? ctx : undefined;
}

/** Last 2–3 turns (max 6 messages), excluding the current user message. */
export function buildAskApiHistory(
  messagesBeforeCurrent: ChatMessage[],
): { role: "user" | "assistant"; content: string }[] {
  const slice = messagesBeforeCurrent.slice(-MAX_HISTORY_API);
  return slice.map((m) => ({
    role: m.role,
    content: truncate(m.content),
  }));
}

/**
 * `session` must already include the latest user message as the last entry.
 * Appends the assistant turn and refreshes `context` / `detectedLanguage`.
 */
export function mergeSessionAfterAssistantReply(
  sessionWithLatestUser: AskAiChatSession,
  assistantText: string,
  data: AskEstioAiResponse,
  latestDetected: DetectedLanguage,
): AskAiChatSession {
  const lastUser = [...sessionWithLatestUser.messages]
    .reverse()
    .find((m) => m.role === "user");
  const msg = truncate(lastUser?.content ?? "");
  const intent = normalizedIntentFromResponse(data.intent);
  const inferredUse =
    inferUseCaseFromText(msg) ?? sessionWithLatestUser.context.useCase?.trim();
  const inferredPlat =
    inferPlatformFromText(msg) ??
    sessionWithLatestUser.context.platform?.trim();

  const cleaned = sessionWithLatestUser.messages.map((m, i, arr) => {
    if (m.role !== "assistant") return m;
    const isLastAssistant =
      arr.map((x) => x.role).lastIndexOf("assistant") === i;
    if (isLastAssistant) return m;
    const { responsePayload: _, ...rest } = m as ChatAssistantMessage;
    return { ...rest, role: "assistant" as const, content: m.content };
  });

  const nextMessages: ChatMessage[] = [
    ...cleaned,
    {
      role: "assistant",
      content: truncate(assistantText),
      responsePayload: data,
    },
  ];

  const prevStage = normalizeFlowStage(sessionWithLatestUser.context.stage);
  const conf = detectClientConfirmation(msg);
  let nextStage = deriveFlowStageFromIntent(
    intent,
    inferredUse,
    inferredPlat,
  );
  if (conf && prevStage === "ready") nextStage = "action";
  else if (conf && prevStage === "action") nextStage = "complete";
  else if (prevStage === "action" && nextStage === "ready") nextStage = "action";
  else if (prevStage === "complete") nextStage = "complete";

  return {
    messages: nextMessages,
    context: {
      intent,
      useCase: inferredUse,
      platform: inferredPlat,
      stage: nextStage,
    },
    turnCount: nextMessages.filter((m) => m.role === "assistant").length,
    detectedLanguage: latestDetected,
  };
}

export function sessionIntentHint(
  session: AskAiChatSession,
): "images" | "video" | "brand" | "unknown" | undefined {
  const si = session.context.intent;
  if (
    si === "images" ||
    si === "video" ||
    si === "brand" ||
    si === "unknown"
  ) {
    return si;
  }
  return undefined;
}
