"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";
import {
  postAskEstioAi,
  postAskInteraction,
  type AskEstioAiResponse,
} from "@/lib/ask-estio-ai-api";
import {
  buildAskApiContext,
  buildAskApiHistory,
  clearAskAiChatSession,
  detectClientLanguage,
  loadAskAiChatSession,
  mergeSessionAfterAssistantReply,
  saveAskAiChatSession,
  sessionIntentHint,
  type AskAiChatSession,
  type ChatAssistantMessage,
  type ChatMessage,
} from "@/lib/ask-estio-ai-session";
import { stashAskEstioAiHandoff } from "@/lib/ask-estio-ai-handoff";
import { AI_STUDIO_FUNNEL_OPEN_EVENT } from "@/lib/ai-studio-funnel-v3/constants";
import {
  flushEvents,
  getStudioSessionId,
  postCrmLeadFromAiStudio,
  setPreNavIntent,
  trackEvent,
  type Intent,
} from "@/components/ai-studio/ai-studio-analytics";

function showAskBox(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_ASK_ESTIO_AI === "true";
}

function emptyChat(): AskAiChatSession {
  return {
    messages: [],
    context: {},
    turnCount: 0,
    detectedLanguage: "unknown",
  };
}

function copy(locale: AppLocale) {
  const ar = locale === "ar";
  return {
    heading: ar ? "اسأل Estio AI" : "Ask Estio AI",
    subtext: ar
      ? "محادثة قصيرة — صور، فيديو قصير، أو نظام علامة. تابع من حيث توقفت."
      : "A short guided chat — images, short video, or a brand system. Pick up where you left off.",
    placeholder: ar ? "اكتب رسالتك…" : "Type your message…",
    submit: ar ? "إرسال" : "Send",
    loading: ar ? "جارٍ التحليل…" : "Analyzing…",
    reset: ar ? "اسأل سؤالاً آخر" : "Ask another question",
    typing: ar ? "يكتب…" : "Typing…",
    chips: ar
      ? [
          "أحتاج مرئيات إعلانية",
          "أحتاج فيديو قصير",
          "أحتاج نظام علامة",
        ]
      : ["I need ad visuals", "I need short-form video", "I need a brand system"],
  };
}

const cardShell =
  "rounded-lg border border-black/10 bg-[color-mix(in_srgb,#fafaf9_96%,transparent)] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md";

function lastUserText(messages: ChatMessage[]): string {
  const u = [...messages].reverse().find((m) => m.role === "user");
  return u?.content?.trim() ?? "";
}

export function AskEstioAiSection({
  locale,
  ambient: _ambient,
}: {
  locale: AppLocale;
  ambient: boolean;
}) {
  const ar = locale === "ar";
  const pageLocale = ar ? "ar" : "en";
  const c = copy(locale);
  const [chat, setChat] = useState<AskAiChatSession>(emptyChat);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const viewedRef = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat(loadAskAiChatSession());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!showAskBox()) return;
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting && !viewedRef.current) {
          viewedRef.current = true;
          trackEvent({ event: "ask_box_viewed" });
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const prevWinY = typeof window !== "undefined" ? window.scrollY : 0;
    el.scrollTop = el.scrollHeight;
    if (typeof window !== "undefined" && Math.abs(window.scrollY - prevWinY) > 2) {
      window.scrollTo(0, prevWinY);
    }
    if (process.env.NODE_ENV === "development") {
      console.debug("[AskEstioAi UI] thread-only scroll", {
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        restoredWindowY: prevWinY,
      });
    }
  }, [chat.messages, loading]);

  const submit = useCallback(async () => {
    const message = query.trim();
    if (!message || loading) return;
    setErr(null);
    const snapshot = chat;
    const history = buildAskApiHistory(snapshot.messages);
    const turnCount = snapshot.messages.filter((m) => m.role === "assistant")
      .length;
    const detected = detectClientLanguage(message);
    const context = buildAskApiContext(snapshot, message);
    const hint = sessionIntentHint(snapshot);
    const detectedForApi =
      detected !== "unknown" ? detected : snapshot.detectedLanguage;

    const withUser: AskAiChatSession = {
      ...snapshot,
      messages: [...snapshot.messages, { role: "user", content: message }],
      detectedLanguage:
        detected !== "unknown" ? detected : snapshot.detectedLanguage,
    };
    setChat(withUser);
    setQuery("");
    setLoading(true);
    trackEvent({ event: "ask_box_submitted", intent: null });

    try {
      const sessionId = getStudioSessionId();
      const data = await postAskEstioAi({
        message,
        sessionId,
        locale: pageLocale,
        pageLocale,
        page: "ai-studio",
        url: typeof window !== "undefined" ? window.location.href : undefined,
        source: "ai_studio_ask_box",
        turnCount,
        history,
        detectedLanguage:
          detectedForApi !== "unknown" ? detectedForApi : undefined,
        ...(hint ? { intentHint: hint } : {}),
        ...(context ? { context } : {}),
      });

      const merged = mergeSessionAfterAssistantReply(
        withUser,
        data.answer,
        data,
        detectClientLanguage(message),
      );
      setChat(merged);
      saveAskAiChatSession(merged);

      if (data.rateLimited) {
        trackEvent({ event: "ask_box_rate_limited" });
      } else if (data.intent === "unknown") {
        trackEvent({ event: "ask_box_out_of_scope" });
      }
      trackEvent({ event: "ask_box_response_rendered", intent: data.intent });
      flushEvents();
    } catch (e) {
      setChat(snapshot);
      setQuery(message);
      const msg = e instanceof Error ? e.message : "";
      const is503 =
        msg.includes("503") ||
        msg.includes("ask_failed_503") ||
        msg.includes("misconfigured");
      setErr(
        ar
          ? "تعذر الاتصال بالمساعد. تحقق من الإعدادات أو حاول لاحقاً."
          : is503
            ? "The assistant could not reach the AI service. If this persists, confirm the API is configured with a valid DeepSeek key."
            : "We couldn’t complete that request. Please try again in a moment.",
      );
    } finally {
      setLoading(false);
    }
  }, [chat, loading, locale, pageLocale, query]);

  const onPrimaryCta = useCallback(
    (r: AskEstioAiResponse) => {
      const goal = lastUserText(chat.messages);
      const intent =
        r.recommendedCta?.intent ??
        (r.intent !== "unknown" ? r.intent : null);
      const crmIntent: Intent =
        intent === "images" || intent === "video" || intent === "brand"
          ? intent
          : "brand";
      setPreNavIntent(crmIntent);
      const handoff = {
        userMessage: goal,
        detectedIntent: r.intent,
        recommendedOffer: r.recommendedOffer,
        responseSummary: r.answer.slice(0, 500),
        sessionId: getStudioSessionId(),
      };
      void postAskInteraction({
        sessionId: getStudioSessionId(),
        logId: r.logId,
        kind: "primary_cta",
      });
      trackEvent({
        event: "ask_box_cta_clicked",
        intent: crmIntent,
      });
      flushEvents();
      if (intent === "images" || intent === "video" || intent === "brand") {
        window.dispatchEvent(
          new CustomEvent(AI_STUDIO_FUNNEL_OPEN_EVENT, {
            detail: {
              intent,
              source: "ask_estio_ai",
              prompt: goal || undefined,
            },
          }),
        );
        return;
      }
      void postCrmLeadFromAiStudio({
        intent: crmIntent,
        sessionId: getStudioSessionId(),
        source: "ask_estio_ai",
        locale,
        goalText: goal || undefined,
        askEstioAi: handoff,
      });
      stashAskEstioAiHandoff(handoff);
      window.location.href = withLocale(
        `/contact?interest=AI_STUDIO&streamlined=1&intent=${encodeURIComponent(crmIntent)}`,
        locale,
      );
    },
    [chat.messages, locale],
  );

  const onSecondaryCta = useCallback(
    (r: AskEstioAiResponse) => {
      const goal = lastUserText(chat.messages);
      const crmIntent =
        r.intent !== "unknown" ? r.intent : ("brand" as const);
      setPreNavIntent(crmIntent);
      const handoff = {
        userMessage: goal,
        detectedIntent: r.intent,
        recommendedOffer: r.recommendedOffer,
        responseSummary: r.answer.slice(0, 500),
        sessionId: getStudioSessionId(),
      };
      void postCrmLeadFromAiStudio({
        intent: crmIntent,
        sessionId: getStudioSessionId(),
        source: "ask_estio_ai_contact",
        locale,
        goalText: goal || undefined,
        askEstioAi: handoff,
      });
      stashAskEstioAiHandoff(handoff);
      void postAskInteraction({
        sessionId: getStudioSessionId(),
        logId: r.logId,
        kind: "secondary_cta",
      });
      trackEvent({ event: "ask_box_escalated_to_contact", intent: r.intent });
      flushEvents();
      let base =
        r.secondaryCta?.href ?? "/contact?interest=AI_STUDIO&streamlined=1";
      if (!base.includes("streamlined")) {
        base += `${base.includes("?") ? "&" : "?"}streamlined=1`;
      }
      const withIntent = base.includes("intent=")
        ? base
        : `${base}${base.includes("?") ? "&" : "?"}intent=${encodeURIComponent(crmIntent)}`;
      window.location.href = withLocale(withIntent, locale);
    },
    [chat.messages, locale],
  );

  const resetChat = useCallback(() => {
    clearAskAiChatSession();
    setChat(emptyChat());
    setQuery("");
    setErr(null);
  }, []);

  if (!showAskBox() || (locale !== "en" && locale !== "ar")) {
    return null;
  }

  const lastAssistantIdx = [...chat.messages]
    .map((m, i) => (m.role === "assistant" ? i : -1))
    .filter((i) => i >= 0)
    .pop();
  const lastAssistant =
    lastAssistantIdx != null ? chat.messages[lastAssistantIdx] : null;
  const lastPayload =
    lastAssistant?.role === "assistant"
      ? (lastAssistant as ChatAssistantMessage).responsePayload
      : undefined;

  return (
    <section
      ref={sectionRef}
      id="ask-estio-ai"
      aria-labelledby="ask-estio-ai-heading"
      className="scroll-mt-24 shrink-0"
      dir={ar ? "rtl" : "ltr"}
      lang={ar ? "ar" : "en"}
    >
      <div className={`${cardShell} p-5 sm:p-6`}>
        <h2
          id="ask-estio-ai-heading"
          className="font-display text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl"
        >
          {c.heading}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          {c.subtext}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {c.chips.map((label) => (
            <button
              key={label}
              type="button"
              className="rounded-full border border-neutral-300/90 bg-white/80 px-3 py-1.5 text-[0.75rem] font-semibold text-neutral-800 shadow-sm transition-colors hover:border-neutral-400 hover:bg-white"
              onClick={() => setQuery(label)}
            >
              {label}
            </button>
          ))}
        </div>

        {hydrated && chat.messages.length > 0 ? (
          <div
            ref={chatScrollRef}
            className="mt-4 max-h-[min(420px,55vh)] space-y-3 overflow-y-auto rounded-md border border-neutral-200/90 bg-white/60 p-3 transition-[max-height] duration-300 sm:p-4"
          >
            {chat.messages.map((m, i) => {
              const isUser = m.role === "user";
              const isLatestAssistant =
                !isUser && i === lastAssistantIdx && lastPayload;
              return (
                <div
                  key={`ask-msg-${i}-${m.role}`}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm transition-opacity duration-200 sm:max-w-[85%] ${
                      isUser
                        ? "bg-neutral-900 text-white"
                        : "border border-neutral-200/90 bg-neutral-50 text-neutral-900"
                    }`}
                  >
                    <p dir="auto" className="whitespace-pre-wrap">
                      {m.content}
                    </p>
                    {isLatestAssistant && lastPayload ? (
                      <div className="mt-3 border-t border-neutral-200/80 pt-3">
                        {lastPayload.recommendedOffer ? (
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            {lastPayload.recommendedOffer}
                          </p>
                        ) : null}
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
                          {lastPayload.recommendedCta ? (
                            <button
                              type="button"
                              onClick={() => onPrimaryCta(lastPayload)}
                              className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow-md transition-opacity hover:opacity-95 sm:text-sm"
                            >
                              {lastPayload.recommendedCta.label}
                            </button>
                          ) : null}
                          {lastPayload.secondaryCta ? (
                            <button
                              type="button"
                              onClick={() => onSecondaryCta(lastPayload)}
                              className="inline-flex items-center justify-center rounded-md border-2 border-neutral-800 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 sm:text-sm"
                            >
                              {lastPayload.secondaryCta.label}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
            {loading ? (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl border border-neutral-200/90 bg-neutral-50 px-4 py-3 text-sm text-neutral-500"
                  aria-live="polite"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
                    </span>
                    {c.typing}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
          <label htmlFor="ask-estio-ai-input" className="sr-only">
            {c.placeholder}
          </label>
          <input
            id="ask-estio-ai-input"
            type="text"
            maxLength={500}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void submit()}
            placeholder={c.placeholder}
            className="min-h-[46px] flex-1 rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-inner placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400/30"
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={loading || !query.trim()}
            className="inline-flex min-h-[46px] shrink-0 items-center justify-center rounded-md bg-neutral-900 px-6 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95 disabled:opacity-40"
          >
            {loading ? c.loading : c.submit}
          </button>
        </div>

        {err ? (
          <div
            className="mt-4 rounded-md border border-red-200/90 bg-red-50 px-4 py-3 text-sm leading-snug text-red-950"
            role="alert"
          >
            {err}
          </div>
        ) : null}

        {hydrated && chat.messages.length > 0 ? (
          <button
            type="button"
            className="mt-4 text-xs font-medium text-neutral-500 underline-offset-4 hover:text-neutral-800 hover:underline"
            onClick={resetChat}
          >
            {c.reset}
          </button>
        ) : null}
      </div>
    </section>
  );
}
