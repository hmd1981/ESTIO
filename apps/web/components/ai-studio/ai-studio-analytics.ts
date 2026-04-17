/* ────────────────────────────────────────────────────────────────────
   AI Studio — Analytics, Intent Tracking & Adaptive Optimization
   ──────────────────────────────────────────────────────────────────── */

export type Intent = "images" | "video" | "brand";
export type IntentSource = "hero" | "sticky" | "hover" | "card";
export type CtaPosition = "hero" | "mid" | "bottom";

/* ── Quality scores per source ── */

const QUALITY: Record<IntentSource, number> = {
  hero: 0.9,
  card: 0.9,
  sticky: 0.85,
  hover: 0.5,
};

/* ────────────────────────────────────────────────────────────────────
   1. Event Tracking  (pushes to window.dataLayer — GTM-compatible)
   ──────────────────────────────────────────────────────────────────── */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type StudioEvent =
  | { event: "studio_intent_selected"; intent: Intent; source: IntentSource; quality: number }
  | { event: "studio_cta_clicked"; intent: Intent | null; position: CtaPosition }
  | { event: "studio_hover_intent"; intent: Intent; duration_ms: number }
  | { event: "studio_time_nudge_shown" }
  | { event: "studio_scroll_cta_shown"; section: string }
  | { event: "studio_exit_intent_triggered" }
  | { event: "studio_exit_input_submitted"; goal: string; intent: Intent | null }
  | { event: "studio_conflict_detected"; from: Intent; to: Intent; source: IntentSource }
  | { event: "studio_page_view" }
  | { event: "studio_adaptive_default_applied"; intent: Intent }
  | { event: "ask_box_viewed" }
  | { event: "ask_box_submitted"; intent: Intent | null }
  | {
      event: "ask_box_response_rendered";
      intent: Intent | "unknown";
    }
  | { event: "ask_box_cta_clicked"; intent: Intent }
  | {
      event: "ask_box_escalated_to_contact";
      intent: Intent | "unknown";
    }
  | { event: "ask_box_rate_limited" }
  | { event: "ask_box_out_of_scope" };

export function trackEvent(payload: StudioEvent): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    ...payload,
    event_category: "ai_studio",
    timestamp: Date.now(),
  });
}

/* ────────────────────────────────────────────────────────────────────
   2. Funnel Stage Tracking
   ──────────────────────────────────────────────────────────────────── */

export type FunnelStage =
  | "visit"
  | "intent_detected"
  | "cta_clicked"
  | "form_opened"
  | "form_submitted";

const FUNNEL_KEY = "estio-studio-funnel";

export function recordFunnelStage(stage: FunnelStage, meta?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "studio_funnel",
    funnel_stage: stage,
    event_category: "ai_studio",
    timestamp: Date.now(),
    ...meta,
  });
  try {
    sessionStorage.setItem(FUNNEL_KEY, stage);
  } catch { /* noop */ }
}

export function getCurrentFunnelStage(): FunnelStage | null {
  if (typeof window === "undefined") return null;
  try {
    return (sessionStorage.getItem(FUNNEL_KEY) as FunnelStage) || null;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────────────────
   3. Intent Tracker  (quality scoring + conflict detection)
   ──────────────────────────────────────────────────────────────────── */

export type IntentRecord = {
  intent: Intent;
  source: IntentSource;
  quality: number;
  ts: number;
};

export class IntentTracker {
  private _history: IntentRecord[] = [];
  private _dominant: IntentRecord | null = null;
  private _conflicts = 0;

  /** Record a new intent signal. Returns the current dominant intent. */
  record(intent: Intent, source: IntentSource): Intent {
    const quality = QUALITY[source];
    const isClick = source !== "hover";

    if (this._dominant && this._dominant.intent !== intent) {
      this._conflicts++;
      trackEvent({
        event: "studio_conflict_detected",
        from: this._dominant.intent,
        to: intent,
        source,
      });
    }

    const rec: IntentRecord = { intent, source, quality, ts: Date.now() };
    this._history.push(rec);

    if (!this._dominant) {
      this._dominant = rec;
    } else if (isClick) {
      this._dominant = rec;
    } else if (this._dominant.source === "hover") {
      this._dominant = rec;
    }
    // hover cannot override a click-based dominant

    trackEvent({ event: "studio_intent_selected", intent, source, quality });
    recordFunnelStage("intent_detected", { intent, source });
    return this._dominant.intent;
  }

  get dominant(): { intent: Intent; quality: number; source: IntentSource } | null {
    return this._dominant
      ? { intent: this._dominant.intent, quality: this._dominant.quality, source: this._dominant.source }
      : null;
  }

  get conflicts(): number {
    return this._conflicts;
  }

  get history(): readonly IntentRecord[] {
    return this._history;
  }
}

/* ────────────────────────────────────────────────────────────────────
   4. Adaptive Optimizer  (localStorage stats → recommended defaults)
   ──────────────────────────────────────────────────────────────────── */

const STATS_KEY = "estio-studio-stats";
const MIN_SAMPLES = 5;

type SourceBucket = "click" | "hover";

type IntentStats = {
  impressions: number;
  clicks: number;
  bySource: Record<SourceBucket, { impressions: number; clicks: number }>;
};

type StatsData = Record<Intent, IntentStats>;

function emptyBucket(): { impressions: number; clicks: number } {
  return { impressions: 0, clicks: 0 };
}

function emptyStats(): IntentStats {
  return { impressions: 0, clicks: 0, bySource: { click: emptyBucket(), hover: emptyBucket() } };
}

function emptyData(): StatsData {
  return { images: emptyStats(), video: emptyStats(), brand: emptyStats() };
}

export class AdaptiveOptimizer {
  private data: StatsData;

  constructor() {
    this.data = this.load();
  }

  private load(): StatsData {
    if (typeof window === "undefined") return emptyData();
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StatsData;
        for (const intent of ["images", "video", "brand"] as Intent[]) {
          if (!parsed[intent]) parsed[intent] = emptyStats();
          if (!parsed[intent].bySource) parsed[intent].bySource = { click: emptyBucket(), hover: emptyBucket() };
        }
        return parsed;
      }
    } catch { /* noop */ }
    return emptyData();
  }

  private save(): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(this.data));
    } catch { /* noop */ }
  }

  recordImpression(intent: Intent, source: IntentSource): void {
    const bucket: SourceBucket = source === "hover" ? "hover" : "click";
    this.data[intent].impressions++;
    this.data[intent].bySource[bucket].impressions++;
    this.save();
  }

  recordCtaClick(intent: Intent, source: IntentSource): void {
    const bucket: SourceBucket = source === "hover" ? "hover" : "click";
    this.data[intent].clicks++;
    this.data[intent].bySource[bucket].clicks++;
    this.save();
  }

  /** Highest-CTR intent with enough data, or null */
  getRecommendedDefault(): Intent | null {
    const rates = (Object.entries(this.data) as [Intent, IntentStats][])
      .filter(([, s]) => s.impressions >= MIN_SAMPLES)
      .map(([intent, s]) => ({
        intent,
        ctr: s.impressions > 0 ? s.clicks / s.impressions : 0,
      }))
      .sort((a, b) => b.ctr - a.ctr);
    return rates.length > 0 && rates[0].ctr > 0 ? rates[0].intent : null;
  }

  /** Recommended hover dwell threshold based on hover conversion data */
  getHoverThresholdMs(): number {
    const totals = (Object.values(this.data)).reduce(
      (acc, s) => ({
        imp: acc.imp + s.bySource.hover.impressions,
        clk: acc.clk + s.bySource.hover.clicks,
      }),
      { imp: 0, clk: 0 },
    );
    if (totals.imp < 10) return 3000;
    const rate = totals.clk / totals.imp;
    if (rate < 0.05) return 8000;
    if (rate < 0.15) return 5000;
    return 3000;
  }

  getStats(): Readonly<StatsData> {
    return this.data;
  }
}

/* ────────────────────────────────────────────────────────────────────
   5. Helpers
   ──────────────────────────────────────────────────────────────────── */

export function detectCtaPosition(el: HTMLElement): CtaPosition {
  if (el.closest("#ai-studio-hero")) return "hero";
  if (el.closest("#studio-cta")) return "bottom";
  return "mid";
}

export function detectIntentSource(el: HTMLElement): IntentSource {
  if (el.closest("#ai-studio-hero")) return "hero";
  if (
    el.closest('[aria-label="Quick navigation"]') ||
    el.closest('[aria-label="\u062a\u0646\u0642\u0644 \u0633\u0631\u064a\u0639"]')
  )
    return "sticky";
  return "card";
}

/** Stash intent in sessionStorage before navigating to the contact form */
export function setPreNavIntent(intent: Intent | null): void {
  if (typeof window === "undefined") return;
  try {
    if (intent) sessionStorage.setItem("estio-pre-nav-intent", intent);
  } catch { /* noop */ }
}

export function getPreNavIntent(): Intent | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem("estio-pre-nav-intent") as Intent | null;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────────────────
   6. Centralized Learning Layer — API client
   ──────────────────────────────────────────────────────────────────── */

const API_BASE =
  (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : undefined) ?? "https://api.estio.org";
const SESSION_KEY = "estio-studio-sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `${Date.now()}`;
  }
}

/** Same session id as studio analytics ingest (`estio-studio-sid`). */
export function getStudioSessionId(): string {
  return getSessionId();
}

export async function postCrmLeadFromAiStudio(payload: {
  intent: Intent;
  sessionId: string;
  goalText?: string;
  source: string;
  device?: string;
  locale?: string;
  ctaPosition?: CtaPosition | null;
  askEstioAi?: {
    userMessage: string;
    detectedIntent: "images" | "video" | "brand" | "unknown";
    recommendedOffer: string | null;
    responseSummary: string;
    sessionId: string;
  };
}): Promise<void> {
  if (typeof window === "undefined" || !payload.sessionId) return;
  try {
    await fetch(`${API_BASE}/crm/leads/from-ai-studio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: payload.sessionId,
        intent: payload.intent,
        goalText: payload.goalText?.trim() || undefined,
        source: payload.source,
        device:
          payload.device ??
          (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
        locale:
          payload.locale ??
          (typeof document !== "undefined"
            ? document.documentElement.lang || undefined
            : undefined),
        ctaPosition: payload.ctaPosition ?? undefined,
        askEstioAi: payload.askEstioAi,
      }),
      keepalive: true,
    });
  } catch {
    /* non-blocking */
  }
}

type BufferedEvent = {
  type: string;
  intent?: string;
  source?: string;
  quality?: number;
  ctaPosition?: string;
  clicked?: boolean;
  hoverDuration?: number;
  exitGoal?: string;
  ts: number;
};

let eventBuffer: BufferedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushEvents();
  }, 10_000);
}

/** Convert a StudioEvent into a BufferedEvent and queue it */
export function bufferEvent(payload: StudioEvent): void {
  if (typeof window === "undefined") return;
  const ev: BufferedEvent = { type: payload.event, ts: Date.now() };
  if ("intent" in payload && payload.intent) ev.intent = payload.intent;
  if ("source" in payload && payload.source) ev.source = payload.source;
  if ("quality" in payload && payload.quality != null) ev.quality = payload.quality;
  if ("position" in payload) ev.ctaPosition = payload.position;
  if ("duration_ms" in payload) ev.hoverDuration = payload.duration_ms;
  if ("goal" in payload && payload.goal) ev.exitGoal = payload.goal;
  if (payload.event === "studio_cta_clicked") ev.clicked = true;
  eventBuffer.push(ev);
  scheduleFlush();
}

/** Flush buffered events to the backend */
export function flushEvents(useBeacon = false): void {
  if (typeof window === "undefined" || eventBuffer.length === 0) return;
  const batch = eventBuffer;
  eventBuffer = [];
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  const body = JSON.stringify({
    sessionId: getSessionId(),
    locale: document.documentElement.lang || undefined,
    events: batch,
  });

  const url = `${API_BASE}/studio-analytics/events`;

  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
  } else {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

/** Install page-unload handler (call once) */
export function installBeaconFlush(): void {
  if (typeof window === "undefined") return;
  const beacon = () => flushEvents(true);
  window.addEventListener("beforeunload", beacon);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") beacon();
  });
}

/* ────────────────────────────────────────────────────────────────────
   7. Server-side optimization — fetch from backend
   ──────────────────────────────────────────────────────────────────── */

export type ServerOptimization = {
  schemaVersion?: number;
  insufficientSample?: boolean;
  samplePolicy?: {
    minEventsForOptimization: number;
    minHoverImpressions: number;
    observedTotalEvents: number;
    observedHoverImpressions: number;
    fallbacksApplied: string[];
  };
  recommendedIntent: Intent | null;
  hoverThresholdMs: number;
  hoverReliability: number;
  conflict: {
    detected: boolean;
    topInterest: string | null;
    topConversion: string | null;
    recommendation: string | null;
  };
  scores: {
    intent: string;
    bayesian: number;
    impressions: number;
    clicks: number;
  }[];
};

const OPT_CACHE_KEY = "estio-studio-opt";
const OPT_CACHE_TTL = 5 * 60_000;

export async function fetchOptimization(
  locale?: string,
): Promise<ServerOptimization | null> {
  if (typeof window === "undefined") return null;

  try {
    const cached = sessionStorage.getItem(OPT_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { ts: number; data: ServerOptimization };
      if (Date.now() - parsed.ts < OPT_CACHE_TTL) return parsed.data;
    }
  } catch { /* noop */ }

  try {
    const isMobile = /mobile|android|iphone/i.test(navigator.userAgent);
    const params = new URLSearchParams();
    params.set("device", isMobile ? "mobile" : "desktop");
    if (locale) params.set("locale", locale);

    const res = await fetch(
      `${API_BASE}/studio-analytics/optimize?${params.toString()}`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as ServerOptimization;

    try {
      sessionStorage.setItem(
        OPT_CACHE_KEY,
        JSON.stringify({ ts: Date.now(), data }),
      );
    } catch { /* noop */ }

    return data;
  } catch {
    return null;
  }
}
