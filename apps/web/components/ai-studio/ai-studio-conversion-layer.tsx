"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AI_STUDIO_FUNNEL_OPEN_EVENT } from "@/lib/ai-studio-funnel-v3/constants";
import type { AppLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";
import {
  type Intent,
  type IntentSource,
  IntentTracker,
  AdaptiveOptimizer,
  trackEvent,
  bufferEvent,
  flushEvents,
  installBeaconFlush,
  fetchOptimization,
  recordFunnelStage,
  detectCtaPosition,
  detectIntentSource,
  setPreNavIntent,
  getStudioSessionId,
  postCrmLeadFromAiStudio,
} from "./ai-studio-analytics";

const CTA_LABELS: Record<Intent, { en: string; ar: string }> = {
  images: {
    en: "Request a visual concept",
    ar: "\u0637\u0644\u0628 \u0645\u0641\u0647\u0648\u0645\u0627\u064B \u0628\u0635\u0631\u064A",
  },
  video: {
    en: "Request a visual concept",
    ar: "\u0637\u0644\u0628 \u0645\u0641\u0647\u0648\u0645\u0627\u064B \u0628\u0635\u0631\u064A",
  },
  brand: {
    en: "Request a visual concept",
    ar: "\u0637\u0644\u0628 \u0645\u0641\u0647\u0648\u0645\u0627\u064B \u0628\u0635\u0631\u064A",
  },
};

const DEFAULT_TEXTS = new Set([
  "Request a visual concept",
  "\u0637\u0644\u0628 \u0645\u0641\u0647\u0648\u0645\u0627\u064B \u0628\u0635\u0631\u064A",
  "Request a studio scope",
  "\u0637\u0644\u0628 \u0646\u0637\u0627\u0642 \u0627\u0633\u062a\u0648\u062f\u064a\u0648",
  "Get a project quote",
  "\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u0639\u0631\u0636 \u0633\u0639\u0631",
  "Start a project",
  "Get a quick quote",
  "\u0627\u0628\u062f\u0623 \u0645\u0634\u0631\u0648\u0639\u0627\u064B",
  "\u0639\u0631\u0636 \u0633\u0639\u0631 \u0633\u0631\u064a\u0639",
  "Start image production",
  "Start video production",
  "Start brand production",
  "Get images",
  "Get short video",
  "Get brand system",
]);

function detectIntent(el: HTMLElement): Intent | null {
  const href = (el.getAttribute("href") || "").toLowerCase();
  const id = (el.id || "").toLowerCase();
  const sig = `${href} ${id}`;
  if (
    sig.includes("offer-images") ||
    sig.includes("#offer-images") ||
    href.includes("image-production")
  )
    return "images";
  if (
    sig.includes("offer-video") ||
    sig.includes("#offer-video") ||
    href.includes("video-production")
  )
    return "video";
  if (
    sig.includes("offer-packs") ||
    sig.includes("#offer-packs") ||
    href.includes("brand-ai-packs") ||
    href.includes("brand-ai")
  )
    return "brand";
  return null;
}

function buildStudioContactHref(locale: AppLocale, intent: Intent | null): string {
  const q = new URLSearchParams({
    interest: "AI_STUDIO",
    streamlined: "1",
  });
  if (intent) q.set("intent", intent);
  return withLocale(`/contact?${q.toString()}`, locale);
}

export function AiStudioConversionLayer({ locale }: { locale: AppLocale }) {
  const ar = locale === "ar";

  const [intent, setIntent] = useState<Intent | null>(null);
  const [showExit, setShowExit] = useState(false);
  const [exitDone, setExitDone] = useState(false);
  const [exitGoal, setExitGoal] = useState("");
  const [nudge, setNudge] = useState(false);
  const [reinforce, setReinforce] = useState<string | null>(null);

  const trackerRef = useRef<IntentTracker>(new IntentTracker());
  const optimizerRef = useRef<AdaptiveOptimizer>(new AdaptiveOptimizer());
  const hoverThresholdRef = useRef(3000);

  const dwellTotals = useRef<Record<Intent, number>>({ images: 0, video: 0, brand: 0 });
  const hoverTarget = useRef<Intent | null>(null);
  const hoverFired = useRef<Set<Intent>>(new Set());

  /* ────────────────────────────────────────────────────────────────────
     Boot: page view, funnel, server optimization, beacon flush
     ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const pageViewEvent = { event: "studio_page_view" } as const;
    trackEvent(pageViewEvent);
    bufferEvent(pageViewEvent);
    recordFunnelStage("visit");
    installBeaconFlush();

    hoverThresholdRef.current = optimizerRef.current.getHoverThresholdMs();

    const localRec = optimizerRef.current.getRecommendedDefault();
    if (localRec) {
      trackEvent({ event: "studio_adaptive_default_applied", intent: localRec });
      setIntent(localRec);
    }

    fetchOptimization(locale).then((opt) => {
      if (!opt) return;
      if (opt.hoverThresholdMs) hoverThresholdRef.current = opt.hoverThresholdMs;
      if (opt.recommendedIntent && !localRec) {
        const serverIntent = opt.recommendedIntent as Intent;
        trackEvent({ event: "studio_adaptive_default_applied", intent: serverIntent });
        setIntent((prev) => prev ?? serverIntent);
      }
    });
  }, [locale]);

  /* ────────────────────────────────────────────────────────────────────
     1 & 3  Intent capture (click + hover dwell)
     ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const mod =
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

      let i: Intent | null = null;
      let sourceEl: HTMLElement | null = null;

      const funnelEl = t.closest("[data-ai-funnel-intent]");
      if (funnelEl && !mod) {
        const raw = funnelEl.getAttribute("data-ai-funnel-intent");
        if (raw === "images" || raw === "video" || raw === "brand") {
          e.preventDefault();
          window.dispatchEvent(
            new CustomEvent(AI_STUDIO_FUNNEL_OPEN_EVENT, {
              detail: { intent: raw, source: "hero" },
            }),
          );
          i = raw;
          sourceEl = funnelEl as HTMLElement;
        }
      }

      const offerHost = t.closest<HTMLElement>("[id^='offer-']");
      if (!i && offerHost) {
        if (offerHost.id === "offer-images") i = "images";
        else if (offerHost.id === "offer-video") i = "video";
        else if (offerHost.id === "offer-packs") i = "brand";
        if (i) {
          sourceEl = offerHost;
          if (!mod && t.closest("a[href]")) {
            e.preventDefault();
            window.dispatchEvent(
              new CustomEvent(AI_STUDIO_FUNNEL_OPEN_EVENT, {
                detail: { intent: i, source: "card" },
              }),
            );
          }
        }
      }

      if (!i) {
        const el = t.closest<HTMLElement>("a, button, [id^='offer-']");
        if (el) {
          i = detectIntent(el);
          sourceEl = el;
        }
      }
      if (i && sourceEl) {
        const source: IntentSource = detectIntentSource(sourceEl);
        const dominant = trackerRef.current.record(i, source);
        optimizerRef.current.recordImpression(i, source);
        bufferEvent({ event: "studio_intent_selected", intent: i, source, quality: 0.9 });
        setIntent(dominant);
      }
    };
    document.addEventListener("click", onClick, true);

    const offerEls = ["offer-images", "offer-video", "offer-packs"]
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const onEnter = (e: Event) => {
      const t = e.currentTarget as HTMLElement;
      if (t.id === "offer-images") hoverTarget.current = "images";
      else if (t.id === "offer-video") hoverTarget.current = "video";
      else hoverTarget.current = "brand";
    };
    const onLeave = () => {
      hoverTarget.current = null;
    };
    for (const el of offerEls) {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    }

    const iv = setInterval(() => {
      const h = hoverTarget.current;
      if (!h) return;
      dwellTotals.current[h] += 100;
      const [best] = (
        Object.entries(dwellTotals.current) as [Intent, number][]
      ).sort((a, b) => b[1] - a[1]);

      const threshold = hoverThresholdRef.current;
      if (threshold > 0 && best[1] >= threshold && !hoverFired.current.has(best[0])) {
        hoverFired.current.add(best[0]);
        const hoverEv = { event: "studio_hover_intent", intent: best[0], duration_ms: best[1] } as const;
        trackEvent(hoverEv);
        bufferEvent(hoverEv);
        const dominant = trackerRef.current.record(best[0], "hover");
        optimizerRef.current.recordImpression(best[0], "hover");
        setIntent(dominant);
      }
    }, 100);

    return () => {
      document.removeEventListener("click", onClick, true);
      clearInterval(iv);
      for (const el of offerEls) {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      }
    };
  }, []);

  /* ── CTA click tracking + hard navigation with latest intent / streamlined query ── */
  useEffect(() => {
    const allCtaLabels = new Set<string>();
    for (const labels of Object.values(CTA_LABELS)) {
      allCtaLabels.add(labels.en);
      allCtaLabels.add(labels.ar);
    }

    const handler = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const text = a.textContent?.trim() || "";

      const goesToContact =
        href.includes("/contact") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:");
      const isStudioConversionCta =
        goesToContact &&
        (href.includes("AI_STUDIO") ||
          href.includes("interest%3DAI_STUDIO") ||
          DEFAULT_TEXTS.has(text) ||
          allCtaLabels.has(text));

      if (!isStudioConversionCta) return;

      const position = detectCtaPosition(a);
      const currentDominant = trackerRef.current.dominant;
      const domIntent = currentDominant?.intent ?? intent;

      const ctaEv = { event: "studio_cta_clicked", intent: domIntent, position } as const;
      trackEvent(ctaEv);
      bufferEvent(ctaEv);
      recordFunnelStage("cta_clicked", { intent: domIntent, position });

      if (currentDominant && domIntent) {
        optimizerRef.current.recordCtaClick(domIntent, currentDominant.source);
      }
      setPreNavIntent(domIntent);
      flushEvents();
      const crmIntent = domIntent ?? ("brand" as Intent);
      void postCrmLeadFromAiStudio({
        intent: crmIntent,
        sessionId: getStudioSessionId(),
        source: "cta_click",
        locale,
        ctaPosition: position,
      });

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      e.preventDefault();
      window.location.assign(buildStudioContactHref(locale, domIntent));
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [locale, intent]);

  /* ── Sync contact hrefs + CTA labels to current intent (no layout change) ── */
  useEffect(() => {
    const nextHref = buildStudioContactHref(locale, intent);
    const hrefSaved: [HTMLAnchorElement, string][] = [];
    document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
      const h = a.getAttribute("href") || "";
      if (!h.includes("AI_STUDIO") && !h.includes("interest%3DAI_STUDIO")) return;
      if (!h.includes("/contact")) return;
      hrefSaved.push([a, h]);
      a.setAttribute("href", nextHref);
    });

    const textSaved: [HTMLAnchorElement, string][] = [];
    if (intent) {
      const label = CTA_LABELS[intent][ar ? "ar" : "en"];
      document.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
        const h = a.getAttribute("href") || "";
        const text = a.textContent?.trim() || "";
        const hrefMatch =
          h.includes("/contact") &&
          (h.includes("AI_STUDIO") || h.includes("interest%3DAI_STUDIO"));
        const textMatch = DEFAULT_TEXTS.has(text);
        if (hrefMatch || textMatch) {
          textSaved.push([a, a.textContent || ""]);
          a.textContent = label;
        }
      });
    }

    return () => {
      for (const [el, h] of hrefSaved) el.setAttribute("href", h);
      for (const [el, t] of textSaved) el.textContent = t;
    };
  }, [intent, locale, ar]);

  /* ────────────────────────────────────────────────────────────────────
     2  Exit-intent soft capture
     ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    try {
      if (sessionStorage.getItem("estio-exit-done") === "1") setExitDone(true);
    } catch { /* private browsing */ }
  }, []);

  useEffect(() => {
    if (exitDone) return;
    let pct = 0;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && pct >= 55) {
        const exitEv = { event: "studio_exit_intent_triggered" } as const;
        trackEvent(exitEv);
        bufferEvent(exitEv);
        setShowExit(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [exitDone]);

  const dismissExit = useCallback(() => {
    setShowExit(false);
    setExitDone(true);
    try {
      sessionStorage.setItem("estio-exit-done", "1");
    } catch { /* noop */ }
  }, []);

  const submitGoal = useCallback(() => {
    if (!exitGoal.trim()) return;
    const currentIntent = trackerRef.current.dominant?.intent ?? null;
    const exitSubEv = { event: "studio_exit_input_submitted", goal: exitGoal.trim(), intent: currentIntent } as const;
    trackEvent(exitSubEv);
    bufferEvent(exitSubEv);
    recordFunnelStage("form_opened", { source: "exit_intent", intent: currentIntent });
    flushEvents();
    const crmIntent = currentIntent ?? ("brand" as Intent);
    void postCrmLeadFromAiStudio({
      intent: crmIntent,
      sessionId: getStudioSessionId(),
      goalText: exitGoal.trim(),
      source: "exit_intent",
      locale,
    });
    const q = new URLSearchParams({
      interest: "AI_STUDIO",
      streamlined: "1",
      goal: exitGoal.trim(),
    });
    q.set("intent", crmIntent);
    window.location.href = withLocale(`/contact?${q.toString()}`, locale);
  }, [exitGoal, locale]);

  /* ────────────────────────────────────────────────────────────────────
     4  Time-based nudge (25 s)
     ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => {
      const nudgeEv = { event: "studio_time_nudge_shown" } as const;
      trackEvent(nudgeEv);
      bufferEvent(nudgeEv);
      setNudge(true);
    }, 25_000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!nudge) return;
    const t = setTimeout(() => setNudge(false), 8_000);
    return () => clearTimeout(t);
  }, [nudge]);

  useEffect(() => {
    if (intent) setNudge(false);
  }, [intent]);

  /* ────────────────────────────────────────────────────────────────────
     5  Scroll-based reinforcement
     ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const els = ["offer-images", "offer-video", "offer-packs"]
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const scrollEv = { event: "studio_scroll_cta_shown", section: entry.target.id } as const;
            trackEvent(scrollEv);
            bufferEvent(scrollEv);
            setReinforce(entry.target.id);
          }
        }
      },
      { threshold: 0.7 },
    );
    for (const el of els) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!reinforce) return;
    const t = setTimeout(() => setReinforce(null), 6_000);
    return () => clearTimeout(t);
  }, [reinforce]);

  /* ── Computed ── */
  const contactHref = useMemo(
    () => buildStudioContactHref(locale, intent),
    [intent, locale],
  );
  const reinforceCta = intent
    ? CTA_LABELS[intent][ar ? "ar" : "en"]
    : ar
      ? "\u0627\u0628\u062f\u0623 \u0645\u0646 \u0647\u0646\u0627"
      : "Start here";

  /* ── Render ── */
  return (
    <>
      {/* ── 4  Time nudge ── */}
      {nudge && !reinforce && (
        <div
          className="fixed bottom-6 z-40"
          style={{ left: "50%", transform: "translateX(-50%)" }}
        >
          <p
            className="whitespace-nowrap rounded-full border border-[var(--accent)]/20 bg-[#111]/90 px-5 py-2.5 text-[0.8rem] font-medium text-[var(--muted)] shadow-lg backdrop-blur-md"
            style={{ animation: "estioFadeUp .5s ease-out both" }}
          >
            {ar
              ? "\u0645\u0639\u0638\u0645 \u0627\u0644\u0641\u0631\u0642 \u062a\u0628\u062f\u0623 \u0628\u0627\u0644\u0635\u0648\u0631 \u0623\u0648 \u0627\u0644\u0641\u064a\u062f\u064a\u0648 \u2014 \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u062a\u0639\u062f\u064a\u0644 \u0644\u0627\u062d\u0642\u0627\u064b."
              : "Most teams start with images or video \u2014 you can adjust later."}
          </p>
        </div>
      )}

      {/* ── 5  Scroll reinforcement ── */}
      {reinforce && (
        <div
          className="fixed bottom-6 z-40"
          style={{ left: "50%", transform: "translateX(-50%)" }}
        >
          <a
            href={contactHref}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[#111]/90 px-5 py-2.5 text-[0.8rem] font-semibold shadow-lg backdrop-blur-md transition-all duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent)]/10"
            style={{ animation: "estioFadeUp .35s ease-out both" }}
          >
            <span className="text-[var(--muted)]">
              {ar ? "\u0647\u0630\u0627 \u0645\u0646\u0627\u0633\u0628" : "This looks right"}
            </span>
            <span className="text-[var(--accent)]" aria-hidden>
              &rarr;
            </span>
            <span className="text-[var(--accent)]">{reinforceCta}</span>
          </a>
        </div>
      )}

      {/* ── 2  Exit-intent micro-layer ── */}
      {showExit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={dismissExit}
            role="presentation"
          />
          <div
            className="relative w-full max-w-md rounded-sm border border-[var(--accent)]/20 bg-[#0a0a0a] p-6 shadow-2xl sm:p-8"
            style={{ animation: "estioFadeUp .3s ease-out both" }}
          >
            <button
              type="button"
              onClick={dismissExit}
              className="absolute end-3 top-3 p-1 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
              aria-label={ar ? "\u0625\u063a\u0644\u0627\u0642" : "Close"}
            >
              &#x2715;
            </button>
            <p className="text-lg font-semibold text-[var(--text)]">
              {ar ? "\u0644\u0633\u062a \u062c\u0627\u0647\u0632\u0627\u064b \u0628\u0639\u062f\u061f" : "Not ready yet?"}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {ar
                ? "\u0623\u062e\u0628\u0631\u0646\u0627 \u0628\u0647\u062f\u0641\u0643 \u2014 \u0633\u0646\u0642\u062a\u0631\u062d \u0627\u0644\u0625\u0639\u062f\u0627\u062f \u0627\u0644\u0645\u0646\u0627\u0633\u0628."
                : "Tell us your goal \u2014 we\u2019ll suggest the right setup."}
            </p>
            <div className="mt-5 flex gap-2">
              <input
                type="text"
                value={exitGoal}
                onChange={(e) => setExitGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitGoal()}
                placeholder={
                  ar
                    ? "\u0645\u0627\u0630\u0627 \u062a\u062d\u0627\u0648\u0644\u0648\u0646 \u0625\u0646\u0634\u0627\u0621\u0647\u061f"
                    : "What are you trying to create?"
                }
                className="flex-1 rounded-sm border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                type="button"
                onClick={submitGoal}
                className="rounded-sm bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                disabled={!exitGoal.trim()}
              >
                {ar ? "\u0625\u0631\u0633\u0627\u0644" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        @keyframes estioFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
