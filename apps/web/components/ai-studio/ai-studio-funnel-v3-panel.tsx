"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AI_STUDIO_FUNNEL_OPEN_EVENT,
  FUNNEL_V3_CRM_SENT_KEY,
  type AiStudioFunnelOpenDetail,
} from "@/lib/ai-studio-funnel-v3/constants";
import {
  createAiJob,
  getAiJob,
  intentToJobType,
} from "@/lib/ai-studio-funnel-v3/jobs-api";
import { computeQuote } from "@/lib/ai-studio-funnel-v3/pricing";
import {
  defaultFunnelStateV3,
  loadFunnelStateV3,
  saveFunnelStateV3,
  type FunnelStateV3,
} from "@/lib/ai-studio-funnel-v3/state";
import type { AppLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";
import {
  getStudioSessionId,
  postCrmLeadFromAiStudio,
  setPreNavIntent,
} from "@/components/ai-studio/ai-studio-analytics";

function mapApiToPreviewStatus(
  s: string,
): "loading" | "ready" | "error" {
  if (s === "completed") return "ready";
  if (s === "failed" || s === "unknown") return "error";
  return "loading";
}

const shell =
  "rounded-sm border border-[color-mix(in_srgb,var(--border)_92%,var(--accent)_8%)] bg-[color-mix(in_srgb,var(--surface)_97%,#000_3%)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]";

export function AiStudioFunnelV3Panel({ locale }: { locale: AppLocale }) {
  const ar = locale === "ar";
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FunnelStateV3>(defaultFunnelStateV3);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hydrated = useRef(false);

  const persist = useCallback((next: FunnelStateV3) => {
    setState(next);
    saveFunnelStateV3(next);
  }, []);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadFunnelStateV3();
    setState(saved);
    if (
      saved.stage !== "idle" &&
      saved.stage !== "done" &&
      saved.preview.status === "loading" &&
      saved.preview.jobId
    ) {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const onOpen = (ev: Event) => {
      const e = ev as CustomEvent<AiStudioFunnelOpenDetail>;
      const d = e.detail;
      if (!d?.intent) return;
      setPreNavIntent(d.intent);
      const base = loadFunnelStateV3();
      const next: FunnelStateV3 = {
        ...base,
        intent: d.intent,
        stage: "intent",
        inputs: {
          ...base.inputs,
          ...(d.prompt ? { prompt: d.prompt } : {}),
        },
        preview: { status: "idle", assets: [] },
        quote: {},
      };
      persist(next);
      setOpen(true);
    };
    window.addEventListener(AI_STUDIO_FUNNEL_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(AI_STUDIO_FUNNEL_OPEN_EVENT, onOpen);
  }, [persist]);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPoll(), [stopPoll]);

  const runPreviewJob = useCallback(
    async (base: FunnelStateV3) => {
      const intent = base.intent;
      if (!intent) return;
      const prompt = base.inputs.prompt?.trim();
      const referenceImage = base.inputs.referenceImage?.trim();
      if (!prompt && !referenceImage) return;

      stopPoll();
      const jobType = intentToJobType(intent);
      const input: {
        prompt?: string;
        description?: string;
        referenceImage?: string;
        platform?: string;
        quantity?: number;
      } = {
        referenceImage: referenceImage || undefined,
        platform: base.inputs.platform ?? undefined,
        quantity: base.inputs.quantity ?? undefined,
      };
      if (intent === "video") {
        input.description = prompt || "Short promotional video";
      } else {
        input.prompt = prompt || "Brand-aligned creative";
      }

      let jobId: string;
      try {
        const created = await createAiJob({ type: jobType, input });
        jobId = created.id;
      } catch (err) {
        persist({
          ...base,
          stage: "preview",
          preview: {
            status: "error",
            assets: [],
            errorMessage:
              err instanceof Error ? err.message : "Could not start preview.",
          },
        });
        return;
      }

      persist({
        ...base,
        stage: "preview",
        preview: {
          status: "loading",
          assets: [],
          jobId,
        },
      });

      let ticks = 0;
      pollRef.current = setInterval(async () => {
        ticks += 1;
        if (ticks > 90) {
          stopPoll();
          persist({
            ...loadFunnelStateV3(),
            preview: {
              status: "error",
              assets: [],
              jobId,
              errorMessage: ar
                ? "انتهت مهلة المعاينة. حاول مرة أخرى."
                : "Preview timed out. Try again.",
            },
          });
          return;
        }
        try {
          const st = await getAiJob(jobId);
          const ps = mapApiToPreviewStatus(st.status);
          if (ps === "ready") {
            stopPoll();
            const assets = (st.assets ?? []).slice(0, 4);
            persist({
              ...loadFunnelStateV3(),
              preview: {
                status: "ready",
                assets,
                jobId,
              },
            });
          } else if (ps === "error") {
            stopPoll();
            persist({
              ...loadFunnelStateV3(),
              preview: {
                status: "error",
                assets: [],
                jobId,
                errorMessage:
                  st.error ??
                  (ar ? "تعذر إنشاء المعاينة." : "Preview failed."),
              },
            });
          }
        } catch {
          /* keep polling until timeout */
        }
      }, 1500);
    },
    [ar, persist, stopPoll],
  );

  const onSubmitIntent = useCallback(() => {
    const cur = loadFunnelStateV3();
    if (!cur.intent) return;
    if (!cur.inputs.prompt?.trim() && !cur.inputs.referenceImage?.trim()) return;
    void runPreviewJob(cur);
  }, [runPreviewJob]);

  const onLooksGood = useCallback(() => {
    const cur = loadFunnelStateV3();
    if (!cur.intent) return;
    const q = computeQuote(cur.intent, cur.inputs.quantity);
    persist({
      ...cur,
      stage: "quote",
      quote: {
        estimate: q.estimateMid,
        breakdown: q.breakdown as unknown as Record<string, unknown>,
        displayRange: q.displayRange,
      },
    });
  }, [persist]);

  const onGetQuoteNav = useCallback(() => {
    const cur = loadFunnelStateV3();
    if (!cur.intent) return;
    const q = computeQuote(cur.intent, cur.inputs.quantity);
    const goalPayload = JSON.stringify({
      v: 3,
      prompt: cur.inputs.prompt ?? null,
      platform: cur.inputs.platform ?? null,
      estimateLow: q.low,
      estimateHigh: q.high,
      estimateMid: q.estimateMid,
      jobId: cur.preview.jobId ?? null,
    });
    try {
      sessionStorage.setItem(FUNNEL_V3_CRM_SENT_KEY, "1");
    } catch {
      /* noop */
    }
    void postCrmLeadFromAiStudio({
      intent: cur.intent,
      sessionId: getStudioSessionId(),
      source: "funnel_v3_quote",
      locale,
      goalText: goalPayload,
    });
    persist({ ...cur, stage: "lead" });
    const params = new URLSearchParams({
      interest: "AI_STUDIO",
      streamlined: "1",
      intent: cur.intent,
      prompt: cur.inputs.prompt?.trim() ?? "",
      platform: cur.inputs.platform ?? "",
      estimate: q.displayRange,
    });
    window.location.assign(
      withLocale(`/contact?${params.toString()}`, locale),
    );
  }, [locale, persist]);

  const copy = {
    title: ar ? "استوديو AI — معاينة" : "AI Studio — preview",
    reopen: ar ? "متابعة المعاينة" : "Resume preview",
    promptImages: ar ? "ماذا تحاول إنشاءه؟" : "What are you trying to create?",
    promptVideo: ar ? "صف الفيديو" : "Describe your video",
    promptBrand: ar ? "ما أسلوب العلامة؟" : "What kind of brand look?",
    refOptional: ar ? "رابط صورة مرجعية (اختياري)" : "Reference image URL (optional)",
    platform: ar ? "المنصة (اختياري)" : "Platform (optional)",
    qty: ar ? "الكمية التقريبية" : "Approx. quantity",
    gen: ar ? "إنشاء معاينة" : "Generate preview",
    sampleNote: ar
      ? "هذا مثال للمخرجات. سيتم تنقيح الملفات النهائية."
      : "This is a sample output. Final assets will be refined.",
    looksGood: ar ? "مناسب ← عرض السعر" : "Looks good → Get quote",
    regen: ar ? "تعديل ← إعادة توليد" : "Adjust → regenerate",
    quoteTitle: ar ? "تلميح السعر" : "Price hint",
    contactCta: ar ? "طلب عرض السعر" : "Request this scope",
    checkoutHint: ar ? "الدفع لاحقاً" : "Payment (coming soon)",
    close: ar ? "إغلاق" : "Close",
    loading: ar ? "جارٍ إنشاء المعاينة…" : "Generating preview…",
  };

  const promptLabel =
    state.intent === "video"
      ? copy.promptVideo
      : state.intent === "brand"
        ? copy.promptBrand
        : copy.promptImages;

  const showReopenChip =
    !open &&
    state.stage !== "idle" &&
    state.stage !== "done" &&
    state.stage !== "lead";

  return (
    <>
      {showReopenChip ? (
        <button
          type="button"
          className="fixed bottom-6 end-6 z-[60] rounded-full border border-[var(--accent)]/40 bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)] shadow-lg transition-colors hover:bg-[var(--accent)]/10"
          onClick={() => setOpen(true)}
        >
          {copy.reopen}
        </button>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-funnel-v3-title"
          dir={ar ? "rtl" : "ltr"}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label={copy.close}
            onClick={() => setOpen(false)}
          />
          <div
            className={`relative max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto ${shell}`}
          >
            <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_98%,transparent)] px-4 py-3">
              <h2
                id="ai-funnel-v3-title"
                className="font-display text-sm font-semibold text-[var(--text)]"
              >
                {copy.title}
              </h2>
              <button
                type="button"
                className="text-xs font-medium text-[var(--muted)] hover:text-[var(--text)]"
                onClick={() => setOpen(false)}
              >
                {copy.close}
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {state.stage === "intent" && state.intent ? (
                <>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {promptLabel}
                  </label>
                  <textarea
                    value={state.inputs.prompt ?? ""}
                    onChange={(e) =>
                      persist({
                        ...state,
                        inputs: { ...state.inputs, prompt: e.target.value },
                      })
                    }
                    rows={3}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--text)]"
                    maxLength={4000}
                  />
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {copy.refOptional}
                  </label>
                  <input
                    type="url"
                    value={state.inputs.referenceImage ?? ""}
                    onChange={(e) =>
                      persist({
                        ...state,
                        inputs: {
                          ...state.inputs,
                          referenceImage: e.target.value || undefined,
                        },
                      })
                    }
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--text)]"
                    maxLength={500}
                  />
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {copy.platform}
                  </label>
                  <select
                    value={state.inputs.platform ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      persist({
                        ...state,
                        inputs: {
                          ...state.inputs,
                          platform:
                            v === "instagram" || v === "ads" || v === "landing"
                              ? v
                              : null,
                        },
                      });
                    }}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--text)]"
                  >
                    <option value="">{ar ? "—" : "—"}</option>
                    <option value="instagram">Instagram</option>
                    <option value="ads">Ads</option>
                    <option value="landing">Landing</option>
                  </select>
                  {state.intent === "images" ? (
                    <>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                        {copy.qty}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={state.inputs.quantity ?? 4}
                        onChange={(e) =>
                          persist({
                            ...state,
                            inputs: {
                              ...state.inputs,
                              quantity: Number(e.target.value) || 4,
                            },
                          })
                        }
                        className="w-full rounded-md border border-[var(--border)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--text)]"
                      />
                    </>
                  ) : null}
                  <button
                    type="button"
                    disabled={
                      !state.inputs.prompt?.trim() &&
                      !state.inputs.referenceImage?.trim()
                    }
                    onClick={onSubmitIntent}
                    className="w-full rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-contrast,#0a0a0a)] disabled:opacity-40"
                  >
                    {copy.gen}
                  </button>
                </>
              ) : null}

              {state.stage === "preview" ? (
                <>
                  {state.preview.status === "loading" ? (
                    <p className="text-sm text-[var(--muted)]">{copy.loading}</p>
                  ) : null}
                  {state.preview.status === "error" ? (
                    <p className="text-sm text-red-600">
                      {state.preview.errorMessage ??
                        (ar ? "حدث خطأ." : "Something went wrong.")}
                    </p>
                  ) : null}
                  {state.preview.status === "ready" &&
                  state.preview.assets.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {state.preview.assets.map((url) => (
                          <div
                            key={url}
                            className="relative aspect-[4/5] overflow-hidden rounded-md border border-[var(--border)] bg-[var(--canvas)]"
                          >
                            <Image
                              src={url}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="200px"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs leading-relaxed text-[var(--muted)]">
                        {copy.sampleNote}
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={onLooksGood}
                          className="flex-1 rounded-md bg-[var(--accent)] px-3 py-2.5 text-sm font-semibold text-[var(--accent-contrast,#0a0a0a)]"
                        >
                          {copy.looksGood}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = loadFunnelStateV3();
                            persist({
                              ...cur,
                              stage: "intent",
                              preview: {
                                status: "idle",
                                assets: [],
                              },
                            });
                          }}
                          className="flex-1 rounded-md border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--text)]"
                        >
                          {copy.regen}
                        </button>
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}

              {state.stage === "quote" && state.intent ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {copy.quoteTitle}
                  </p>
                  <p className="font-display text-lg font-semibold text-[var(--text)]">
                    {state.quote.displayRange ??
                      computeQuote(state.intent, state.inputs.quantity)
                        .displayRange}
                  </p>
                  <button
                    type="button"
                    onClick={onGetQuoteNav}
                    className="w-full rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-contrast,#0a0a0a)]"
                  >
                    {copy.contactCta}
                  </button>
                  <a
                    href={withLocale(
                      `/checkout?intent=${encodeURIComponent(state.intent)}`,
                      locale,
                    )}
                    className="block text-center text-xs font-medium text-[var(--muted)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
                  >
                    {copy.checkoutHint}
                  </a>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
