"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { GpuOfflineBanner } from "@/components/ai-studio/gpu-offline-banner";
import type { AppLocale } from "@/lib/i18n/config";
import { useGpuStatus } from "@/lib/use-gpu-status";
import { useCreditBalance, useWalletSession } from "@/lib/wallet-session";
import {
  createStudioMediaJob,
  extractRenderableVideoUrl,
  extractVideoGenerationTierFromResult,
  getMediaJobResult,
  getMediaJobStatus,
  isMediaJobResultNotReadyError,
  mediaPlaybackSrc,
  MEDIA_GENERATE_IMAGE_PROMPT_MAX_LENGTH,
  MediaJobApiError,
  type MediaJobLifecycleStatus,
  type MediaStudioJobMode,
  requestVideoTierUpgrade,
  type VideoGenerationTier,
} from "@/lib/media-jobs-api";

const POLL_MS = 2000;
const MAX_POLL_MS = 22 * 60 * 1000;

type CardStatus = "queued" | "running" | "completed" | "failed";

type JobCard = {
  jobId: string;
  tier: VideoGenerationTier;
  status: CardStatus;
  videoUrl: string | null;
  errorMessage: string | null;
  parentJobId: string | null;
  /** 0-100 fake progress for perceived speed (not real server %) */
  progress: number;
  createdAt: number;
};

type VideoIntent = "text_to_video" | "image_to_video";

const COPY = {
  en: {
    kicker: "Video studio",
    title: "Generate video",
    lead: "Start with a fast Preview to validate your idea, then upgrade to Standard or Premium when you're ready for higher quality.",
    intentLabel: "How do you want to start?",
    textToVideo: "Text to video",
    photoToVideo: "Photo to video",
    promptLabel: "Describe the video",
    promptPlaceholder: "Scene, mood, subject, camera feel…",
    promptOptional: "Motion notes (optional)",
    imageUrlLabel: "Image URL",
    imageUrlPlaceholder: "https://…",
    imageFileLabel: "Or upload a photo",
    durationLabel: "Length hint (seconds, optional)",
    durationPlaceholder: "e.g. 5",
    submit: "Generate preview",
    submitting: "Starting…",
    tierPreview: "Preview",
    tierStandard: "Standard",
    tierPremium: "Premium",
    tierTagPreview: "Fast",
    tierTagStandard: "Balanced",
    tierTagPremium: "Best quality",
    tierPreviewBlurb: "Fast, lower fidelity — ideal to validate direction before spending render time.",
    tierStandardBlurb: "Better motion and detail — suited for everyday marketing clips.",
    tierPremiumBlurb: "Highest fidelity, more cinematic — longer wait, best for hero assets.",
    upgradeStandard: "Upgrade to Standard",
    upgradePremium: "Upgrade to Premium",
    upgrading: "Starting upgrade…",
    upgradeHint: "Upgrade for higher quality",
    previewHint: "Preview is optimized for speed",
    retry: "Try again",
    newProject: "New project",
    statusQueued: "Waiting in queue…",
    statusRunningPreview: "Creating a quick preview…",
    statusRunningStandard: "Rendering Standard quality…",
    statusRunningPremium: "Rendering Premium — this can take several minutes…",
    statusFailed: "Something went wrong.",
    statusPollTimeout: "Still processing. You can leave this page open or start fresh.",
    previewReady: "Your preview is ready — upgrade anytime for better quality.",
    standardReady: "Standard version is ready.",
    premiumReady: "Premium version is ready — this is the highest quality available.",
    noVideoUrl: "The render finished, but we could not find a playable video URL in the response.",
    jobRef: "Job",
    chainLabel: "Generation chain",
    errorGeneric: "Something went wrong. Please try again.",
    error503: "Video generation is temporarily unavailable. Try again in a moment.",
    errorValidation: "Check your inputs and try again.",
    errorUpstream: "The media service timed out or was unreachable.",
    errorNeedPrompt: "Enter a short description.",
    errorNeedImage: "Add a photo URL or upload an image.",
    errorUpgrade: "Could not start the upgrade. Try again.",
    gpuOfflineDisabledTooltip:
      "GPU services are temporarily offline — please try again in a few minutes.",
    noCreditsDisabledTooltip:
      "You're out of credits. Top up below to keep generating.",
  },
  ar: {
    kicker: "استوديو الفيديو",
    title: "توليد فيديو",
    lead: "ابدأ بمعاينة سريعة للتحقق من الفكرة، ثم ترقية إلى قياسي أو مميز عند الحاجة لجودة أعلى.",
    intentLabel: "كيف تريد البدء؟",
    textToVideo: "نص إلى فيديو",
    photoToVideo: "صورة إلى فيديو",
    promptLabel: "وصف المشهد",
    promptPlaceholder: "المشهد، الإيقاع، الكاميرا…",
    promptOptional: "ملاحظات الحركة (اختياري)",
    imageUrlLabel: "رابط الصورة",
    imageUrlPlaceholder: "https://…",
    imageFileLabel: "أو ارفع صورة",
    durationLabel: "مدة تقريبية بالثواني (اختياري)",
    durationPlaceholder: "مثال: 5",
    submit: "إنشاء معاينة",
    submitting: "جاري البدء…",
    tierPreview: "معاينة",
    tierStandard: "قياسي",
    tierPremium: "مميز",
    tierTagPreview: "سريع",
    tierTagStandard: "متوازن",
    tierTagPremium: "أعلى جودة",
    tierPreviewBlurb: "سريع وجودة أخف — مناسب للتحقق من الاتجاه قبل استثمار وقت أطول.",
    tierStandardBlurb: "حركة وتفاصيل أفضل — مناسب للمحتوى اليومي.",
    tierPremiumBlurb: "أعلى جودة وأقرب للسينمائي — انتظار أطول، مناسب للأصول الرئيسية.",
    upgradeStandard: "ترقية إلى قياسي",
    upgradePremium: "ترقية إلى مميز",
    upgrading: "جاري بدء الترقية…",
    upgradeHint: "ترقية للحصول على جودة أعلى",
    previewHint: "المعاينة مُحسَّنة للسرعة",
    retry: "إعادة المحاولة",
    newProject: "مشروع جديد",
    statusQueued: "في الانتظار…",
    statusRunningPreview: "جاري إنشاء معاينة سريعة…",
    statusRunningStandard: "جاري تقديم النسخة القياسية…",
    statusRunningPremium: "جاري تقديم النسخة المميزة — قد يستغرق ذلك عدة دقائق…",
    statusFailed: "حدث خطأ ما.",
    statusPollTimeout: "ما زال التنفيذ قيد المعالجة. يمكنك إبقاء الصفحة أو البدء من جديد.",
    previewReady: "المعاينة جاهزة — يمكنك الترقية في أي وقت لجودة أفضل.",
    standardReady: "النسخة القياسية جاهزة.",
    premiumReady: "النسخة المميزة جاهزة — هذه أعلى جودة متاحة.",
    noVideoUrl: "اكتمل التقديم لكن لم نعثر على رابط فيديو قابل للتشغيل.",
    jobRef: "المهمة",
    chainLabel: "سلسلة التوليد",
    errorGeneric: "حدث خطأ. حاول مرة أخرى.",
    error503: "التوليد غير متاح مؤقتًا. أعد المحاولة قريبًا.",
    errorValidation: "راجع المدخلات وحاول مرة أخرى.",
    errorUpstream: "انتهت مهلة الخدمة أو تعذر الوصول إليها.",
    errorNeedPrompt: "أدخل وصفًا قصيرًا.",
    errorNeedImage: "أضف رابط صورة أو ارفع صورة.",
    errorUpgrade: "تعذر بدء الترقية. حاول مرة أخرى.",
    gpuOfflineDisabledTooltip:
      "خدمات GPU غير متاحة مؤقتًا — يُرجى المحاولة بعد بضع دقائق.",
    noCreditsDisabledTooltip:
      "نفد رصيدك. اشحن من الأسفل للمتابعة.",
  },
} as const;

type Str = (typeof COPY)["en"] | (typeof COPY)["ar"];

function friendlyApiError(e: unknown, s: Str): string {
  if (e instanceof MediaJobApiError) {
    if (e.status === 503) return s.error503;
    if (e.status === 400 || e.status === 422) return s.errorValidation;
    if (e.status === 502 || e.status === 504) return s.errorUpstream;
    return s.errorGeneric;
  }
  return s.errorGeneric;
}

function parseDuration(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0 || n > 3600) return undefined;
  return Math.round(n);
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result;
      if (typeof s !== "string") { reject(new Error("read failed")); return; }
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(r.error ?? new Error("read failed"));
    r.readAsDataURL(file);
  });
}

function mapLifecycle(s: MediaJobLifecycleStatus): CardStatus {
  if (s === "queued") return "queued";
  if (s === "running") return "running";
  if (s === "completed") return "completed";
  return "failed";
}

function tierLabel(t: VideoGenerationTier, s: Str) {
  return t === "preview" ? s.tierPreview : t === "standard" ? s.tierStandard : s.tierPremium;
}

function tierTag(t: VideoGenerationTier, s: Str) {
  return t === "preview" ? s.tierTagPreview : t === "standard" ? s.tierTagStandard : s.tierTagPremium;
}

function runningText(t: VideoGenerationTier, s: Str) {
  return t === "preview" ? s.statusRunningPreview : t === "standard" ? s.statusRunningStandard : s.statusRunningPremium;
}

function completedText(t: VideoGenerationTier, s: Str) {
  return t === "preview" ? s.previewReady : t === "standard" ? s.standardReady : s.premiumReady;
}

const TIER_BADGE_CLS: Record<VideoGenerationTier, string> = {
  preview: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  standard: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  premium: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
};

const TIER_PROGRESS_CLS: Record<VideoGenerationTier, string> = {
  preview: "bg-blue-500",
  standard: "bg-amber-500",
  premium: "bg-purple-500",
};

/* ─── Fake-progress hook: gives perceived speed while polling ─── */
function useFakeProgress(status: CardStatus, tier: VideoGenerationTier): number {
  const [pct, setPct] = useState(0);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "completed" || status === "failed") {
      setPct(status === "completed" ? 100 : 0);
      if (raf.current) clearInterval(raf.current);
      return;
    }
    if (status === "queued") { setPct(2); return; }

    const maxPct = tier === "preview" ? 95 : tier === "standard" ? 90 : 85;
    const stepMs = tier === "preview" ? 400 : tier === "standard" ? 800 : 1500;
    const step = tier === "preview" ? 4 : tier === "standard" ? 2 : 1;

    setPct(8);
    raf.current = setInterval(() => {
      setPct((p) => Math.min(p + step, maxPct));
    }, stepMs);

    return () => { if (raf.current) clearInterval(raf.current); };
  }, [status, tier]);

  return pct;
}

/* ─── Progress bar (small inline) ─── */
function ProgressBar({ pct, tier }: { pct: number; tier: VideoGenerationTier }) {
  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${TIER_PROGRESS_CLS[tier]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ─── Single Job Card ─── */
function JobCardView({
  card,
  str,
  onRetry,
  onUpgrade,
  upgradeTarget,
  upgradeBusy,
  gpuOffline = false,
  noCredits = false,
}: {
  card: JobCard;
  str: Str;
  onRetry: () => void;
  onUpgrade: ((tier: "standard" | "premium") => void) | null;
  upgradeTarget: "standard" | "premium" | null;
  upgradeBusy: boolean;
  gpuOffline?: boolean;
  noCredits?: boolean;
}) {
  const pct = useFakeProgress(card.status, card.tier);
  const isActive = card.status === "queued" || card.status === "running";
  const isDone = card.status === "completed";
  const isFailed = card.status === "failed";

  return (
    <article className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      {/* Tier badge header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${TIER_BADGE_CLS[card.tier]}`}>
            {tierLabel(card.tier, str)}
          </span>
          <span className="text-[11px] font-medium text-[var(--muted)]">
            {tierTag(card.tier, str)}
          </span>
        </div>
        {isDone && card.tier === "preview" ? (
          <span className="text-[11px] text-[var(--muted)]">{str.previewHint}</span>
        ) : null}
      </div>

      <div className="p-5">
        {/* Status line */}
        {isActive ? (
          <div>
            <p className="text-sm text-[var(--text-body)]">
              {card.status === "queued" ? str.statusQueued : runningText(card.tier, str)}
            </p>
            <ProgressBar pct={pct} tier={card.tier} />
          </div>
        ) : null}

        {/* Failed state */}
        {isFailed ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-[var(--text-body)]">
              {card.errorMessage || str.statusFailed}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
            >
              {str.retry}
            </button>
          </div>
        ) : null}

        {/* Completed: show video */}
        {isDone && card.videoUrl ? (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-black">
            <video
              src={card.videoUrl}
              controls
              playsInline
              className="max-h-[min(65vh,640px)] w-full object-contain"
            />
          </div>
        ) : null}

        {/* Completed but no URL */}
        {isDone && !card.videoUrl ? (
          <p className="text-sm text-[var(--muted)]">{card.errorMessage || str.noVideoUrl}</p>
        ) : null}

        {/* Completed: upgrade CTAs inside the card */}
        {isDone && onUpgrade && upgradeTarget ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
            <p className="text-xs font-medium text-[var(--muted)]">{str.upgradeHint}</p>
            <button
              type="button"
              disabled={upgradeBusy || gpuOffline || noCredits}
              title={
                gpuOffline
                  ? str.gpuOfflineDisabledTooltip
                  : noCredits
                    ? str.noCreditsDisabledTooltip
                    : undefined
              }
              aria-disabled={upgradeBusy || gpuOffline || noCredits}
              onClick={() => onUpgrade(upgradeTarget)}
              className={
                upgradeTarget === "standard"
                  ? "rounded-md bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  : "rounded-md bg-purple-600 px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              {upgradeBusy
                ? str.upgrading
                : upgradeTarget === "standard"
                  ? str.upgradeStandard
                  : str.upgradePremium}
            </button>
          </div>
        ) : null}

        {/* Done message */}
        {isDone && card.tier !== "preview" ? (
          <p className="mt-3 text-xs font-medium text-[var(--muted)]">
            {completedText(card.tier, str)}
          </p>
        ) : null}

        {/* Job ref */}
        <p className="mt-3 font-mono text-[10px] text-[var(--muted)] break-all">
          {str.jobRef} {card.jobId.slice(0, 8)}
        </p>
      </div>
    </article>
  );
}

/* ─── Chain connector (visual link between cards) ─── */
function ChainConnector({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-1 pl-6">
      <div className="h-6 w-px bg-[var(--border)]" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
        {label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main panel
   ═══════════════════════════════════════════════════ */

export function TieredVideoGenerationPanel({ locale }: { locale: AppLocale }) {
  const str = COPY[locale === "ar" ? "ar" : "en"];
  const gpu = useGpuStatus();
  const gpuOffline = gpu.online === false;
  const session = useWalletSession();
  const { balance } = useCreditBalance();
  const noCredits = session != null && balance === 0;
  const [intent, setIntent] = useState<VideoIntent>("text_to_video");
  const [prompt, setPrompt] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [durationRaw, setDurationRaw] = useState("");

  const [replayTemplate, setReplayTemplate] = useState<Record<string, unknown> | null>(null);
  const [cards, setCards] = useState<JobCard[]>([]);
  const [uiError, setUiError] = useState<string | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [upgradeBusy, setUpgradeBusy] = useState(false);

  const mounted = useRef(true);
  const activePollIds = useRef(new Set<string>());

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const patchCard = useCallback((jobId: string, patch: Partial<JobCard>) => {
    setCards((prev) => prev.map((c) => (c.jobId === jobId ? { ...c, ...patch } : c)));
  }, []);

  /* ── Per-job poll loop (independent per card) ── */
  const startPoll = useCallback(
    (jobId: string, tier: VideoGenerationTier) => {
      if (activePollIds.current.has(jobId)) return;
      activePollIds.current.add(jobId);
      const start = Date.now();

      const tick = async () => {
        if (!mounted.current || !activePollIds.current.has(jobId)) return;
        if (Date.now() - start > MAX_POLL_MS) {
          activePollIds.current.delete(jobId);
          patchCard(jobId, { status: "failed", errorMessage: str.statusPollTimeout });
          return;
        }

        try {
          const row = await getMediaJobStatus(jobId);
          if (!mounted.current || !activePollIds.current.has(jobId)) return;

          const next = mapLifecycle(row.status);
          patchCard(jobId, {
            status: row.status === "completed" && !row.resultReady ? "running" : next,
            errorMessage: row.status === "failed" ? (row.error?.message?.trim() || str.statusFailed) : null,
          });

          if (row.status === "failed") {
            activePollIds.current.delete(jobId);
            return;
          }

          if (row.status === "completed" && row.resultReady) {
            try {
              const envelope = await getMediaJobResult(jobId);
              if (!mounted.current || !activePollIds.current.has(jobId)) return;

              const fromResult = extractVideoGenerationTierFromResult(envelope.result);
              const url = mediaPlaybackSrc(envelope.playback) ?? extractRenderableVideoUrl(envelope.result);

              patchCard(jobId, {
                status: "completed",
                videoUrl: url,
                errorMessage: url ? null : str.noVideoUrl,
                ...(fromResult && fromResult !== tier ? { tier: fromResult } : {}),
              });
            } catch (err) {
              if (!mounted.current || !activePollIds.current.has(jobId)) return;
              if (isMediaJobResultNotReadyError(err)) {
                patchCard(jobId, { status: "running" });
                setTimeout(tick, POLL_MS);
                return;
              }
              patchCard(jobId, { status: "failed", errorMessage: friendlyApiError(err, str) });
            }
            activePollIds.current.delete(jobId);
            return;
          }
        } catch (err) {
          if (!mounted.current || !activePollIds.current.has(jobId)) return;
          activePollIds.current.delete(jobId);
          patchCard(jobId, { status: "failed", errorMessage: friendlyApiError(err, str) });
          return;
        }

        setTimeout(tick, POLL_MS);
      };

      void tick();
    },
    [patchCard, str],
  );

  /* ── STEP 1: Submit (no tier sent — API defaults to preview) ── */
  async function handleSubmit() {
    const p = prompt.trim();
    if (intent === "text_to_video" && !p) { setUiError(str.errorNeedPrompt); return; }
    if (intent === "image_to_video" && !imageUrlInput.trim() && !imageFile) { setUiError(str.errorNeedImage); return; }

    setUiError(null);
    setSubmitBusy(true);
    setCards([]);
    activePollIds.current.clear();

    const durationSeconds = parseDuration(durationRaw);

    try {
      let template: { mode: MediaStudioJobMode; [key: string]: unknown };

      if (intent === "text_to_video") {
        template = { mode: "text_to_video", prompt: p, ...(durationSeconds != null ? { duration_seconds: durationSeconds } : {}) };
      } else {
        const url = imageUrlInput.trim();
        let image_base64: string | undefined;
        if (imageFile) { image_base64 = await readFileAsBase64(imageFile); }
        template = {
          mode: "image_to_video",
          ...(p ? { prompt: p } : {}),
          ...(url ? { image_url: url } : {}),
          ...(image_base64 ? { image_base64 } : {}),
          ...(durationSeconds != null ? { duration_seconds: durationSeconds } : {}),
        };
      }

      setReplayTemplate(template);

      // Do NOT send generation_tier — let API default to preview
      const created = await createStudioMediaJob(template);
      if (!mounted.current) return;

      const card: JobCard = {
        jobId: created.id,
        tier: "preview",
        status: "queued",
        videoUrl: null,
        errorMessage: null,
        parentJobId: null,
        progress: 0,
        createdAt: Date.now(),
      };
      setCards([card]);
      startPoll(created.id, "preview");
    } catch (e) {
      if (!mounted.current) return;
      setUiError(friendlyApiError(e, str));
    } finally {
      if (mounted.current) setSubmitBusy(false);
    }
  }

  /* ── STEP 4: Upgrade flow ── */
  async function handleUpgrade(target: "standard" | "premium") {
    if (!replayTemplate) { setUiError(str.errorUpgrade); return; }

    const fromCard =
      target === "premium"
        ? cards.find((c) => c.tier === "standard" && c.status === "completed")
        : cards.find((c) => c.tier === "preview" && c.status === "completed");

    if (!fromCard) { setUiError(str.errorUpgrade); return; }

    setUiError(null);
    setUpgradeBusy(true);

    try {
      const created = await requestVideoTierUpgrade({
        fromJobId: fromCard.jobId,
        targetTier: target,
        replayBody: { ...replayTemplate },
      });
      if (!mounted.current) return;

      const card: JobCard = {
        jobId: created.id,
        tier: target,
        status: "queued",
        videoUrl: null,
        errorMessage: null,
        parentJobId: fromCard.jobId,
        progress: 0,
        createdAt: Date.now(),
      };
      setCards((prev) => [...prev, card]);
      startPoll(created.id, target);
    } catch (e) {
      if (!mounted.current) return;
      setUiError(friendlyApiError(e, str));
    } finally {
      if (mounted.current) setUpgradeBusy(false);
    }
  }

  function handleReset() {
    activePollIds.current.clear();
    setCards([]);
    setReplayTemplate(null);
    setUiError(null);
  }

  /* ── Derived state ── */
  const busy = submitBusy || upgradeBusy;
  const previewCard = cards.find((c) => c.tier === "preview");
  const standardCard = cards.find((c) => c.tier === "standard");
  const premiumCard = cards.find((c) => c.tier === "premium");

  const canStart = intent === "text_to_video"
    ? prompt.trim().length > 0
    : imageUrlInput.trim().length > 0 || imageFile != null;

  function upgradeTargetFor(card: JobCard): "standard" | "premium" | null {
    if (card.status !== "completed") return null;
    if (card.tier === "preview" && !standardCard) return "standard";
    if (card.tier === "standard" && !premiumCard) return "premium";
    return null;
  }

  return (
    <section
      className="border-b border-[var(--border)] bg-[var(--canvas)] py-12 sm:py-14"
      aria-labelledby="tiered-video-heading"
    >
      <Container as="div">
        {/* Header */}
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">{str.kicker}</p>
        <h2 id="tiered-video-heading" className="font-display mt-2 text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl">
          {str.title}
        </h2>

        {gpuOffline ? (
          <div className="mt-5 max-w-2xl">
            <GpuOfflineBanner locale={locale} snapshot={gpu.status} />
          </div>
        ) : null}

        {/* Tier overview cards */}
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {([
            ["preview", str.tierPreview, str.tierTagPreview, str.tierPreviewBlurb],
            ["standard", str.tierStandard, str.tierTagStandard, str.tierStandardBlurb],
            ["premium", str.tierPremium, str.tierTagPremium, str.tierPremiumBlurb],
          ] as const).map(([tier, name, tag, blurb]) => (
            <li key={tier} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${TIER_BADGE_CLS[tier]}`}>
                  {name}
                </span>
                <span className="text-[11px] text-[var(--muted)]">{tag}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-body)]">{blurb}</p>
            </li>
          ))}
        </ul>

        {/* ── Input form ── */}
        <form className="mt-8 max-w-2xl space-y-5" onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-[var(--text)]">{str.intentLabel}</legend>
            <div className="flex flex-wrap gap-2" role="group">
              {([["text_to_video", str.textToVideo], ["image_to_video", str.photoToVideo]] as const).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  disabled={busy || cards.length > 0}
                  onClick={() => { setIntent(v); setUiError(null); }}
                  className={intent === v
                    ? "rounded-full border border-[var(--accent)] bg-[var(--accent)]/15 px-4 py-2 text-xs font-semibold text-[var(--accent)] sm:text-sm"
                    : "rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--text-body)] hover:border-[var(--accent)]/40 sm:text-sm"}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {intent === "text_to_video" && (
            <div>
              <label htmlFor="tvp-prompt" className="text-sm font-medium text-[var(--text)]">{str.promptLabel}</label>
              <textarea id="tvp-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={str.promptPlaceholder}
                maxLength={MEDIA_GENERATE_IMAGE_PROMPT_MAX_LENGTH} rows={4} disabled={busy || cards.length > 0}
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:opacity-60" />
            </div>
          )}

          {intent === "image_to_video" && (
            <>
              <div>
                <label htmlFor="tvp-img-url" className="text-sm font-medium text-[var(--text)]">{str.imageUrlLabel}</label>
                <input id="tvp-img-url" type="url" value={imageUrlInput}
                  onChange={(e) => { setImageUrlInput(e.target.value); if (e.target.value.trim()) setImageFile(null); }}
                  placeholder={str.imageUrlPlaceholder} disabled={busy || cards.length > 0 || imageFile != null}
                  className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:opacity-60" />
              </div>
              <div>
                <label htmlFor="tvp-img-file" className="text-sm font-medium text-[var(--text)]">{str.imageFileLabel}</label>
                <input id="tvp-img-file" type="file" accept="image/*"
                  disabled={busy || cards.length > 0 || imageUrlInput.trim().length > 0}
                  onChange={(e) => { const f = e.target.files?.[0] ?? null; setImageFile(f); if (f) setImageUrlInput(""); }}
                  className="mt-2 block w-full text-sm text-[var(--text-body)] file:mr-3 file:rounded-md file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--text)] disabled:opacity-60" />
              </div>
              <div>
                <label htmlFor="tvp-i2v-prompt" className="text-sm font-medium text-[var(--text)]">{str.promptOptional}</label>
                <textarea id="tvp-i2v-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={str.promptPlaceholder}
                  maxLength={MEDIA_GENERATE_IMAGE_PROMPT_MAX_LENGTH} rows={3} disabled={busy || cards.length > 0}
                  className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:opacity-60" />
              </div>
            </>
          )}

          <div>
            <label htmlFor="tvp-dur" className="text-sm font-medium text-[var(--text)]">{str.durationLabel}</label>
            <input id="tvp-dur" type="text" inputMode="decimal" value={durationRaw}
              onChange={(e) => setDurationRaw(e.target.value)} placeholder={str.durationPlaceholder}
              disabled={busy || cards.length > 0}
              className="mt-2 w-full max-w-xs rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:opacity-60" />
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={!canStart || busy || cards.length > 0 || gpuOffline || noCredits}
              title={gpuOffline ? str.gpuOfflineDisabledTooltip : noCredits ? str.noCreditsDisabledTooltip : undefined}
              aria-disabled={!canStart || busy || cards.length > 0 || gpuOffline || noCredits}
              className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-contrast,#0a0a0a)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {submitBusy ? str.submitting : str.submit}
            </button>
            {cards.length > 0 && (
              <button type="button" onClick={handleReset} disabled={busy}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_85%,var(--text)_15%)] disabled:opacity-50">
                {str.newProject}
              </button>
            )}
          </div>
        </form>

        {/* ── Error banner ── */}
        {uiError ? (
          <div className="mt-6 rounded-lg border border-red-300/40 bg-red-50/60 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-300">
            {uiError}
          </div>
        ) : null}

        {/* ── Job card chain ── */}
        {cards.length > 0 ? (
          <div className="mt-10" role="region" aria-label={str.chainLabel}>
            {/* Chain breadcrumb */}
            <div className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">
              {cards.map((c, i) => (
                <span key={c.jobId} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden>→</span>}
                  <span className={c.status === "completed" ? "text-[var(--text)]" : ""}>{tierLabel(c.tier, str)}</span>
                </span>
              ))}
            </div>

            {/* Cards */}
            <div className="space-y-0">
              {cards.map((card, idx) => (
                <div key={card.jobId}>
                  {idx > 0 && <ChainConnector label={locale === "ar" ? "ترقية" : "upgrade"} />}
                  <JobCardView
                    card={card}
                    str={str}
                    onRetry={() => {
                      patchCard(card.jobId, { status: "queued", errorMessage: null });
                      startPoll(card.jobId, card.tier);
                    }}
                    onUpgrade={upgradeTargetFor(card) ? (t) => void handleUpgrade(t) : null}
                    upgradeTarget={upgradeTargetFor(card)}
                    upgradeBusy={upgradeBusy}
                    gpuOffline={gpuOffline}
                    noCredits={noCredits}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
