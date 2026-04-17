"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import type { AppLocale } from "@/lib/i18n/config";
import {
  createStudioMediaJob,
  extractRenderableImageUrl,
  extractRenderableVideoUrl,
  getMediaJobResult,
  getMediaJobStatus,
  isMediaJobResultNotReadyError,
  mediaPlaybackSrc,
  MEDIA_GENERATE_IMAGE_PROMPT_MAX_LENGTH,
  MediaJobApiError,
  type MediaJobLifecycleStatus,
  type MediaStudioJobMode,
} from "@/lib/media-jobs-api";

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_DURATION_MS = 22 * 60 * 1000;

type UiPhase =
  | "idle"
  | "submitting"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "poll_timeout";

type PreviewKind = "image" | "video" | null;

const MODES: MediaStudioJobMode[] = [
  "text_to_image",
  "image_to_video",
  "text_to_video",
];

const COPY = {
  en: {
    kicker: "Live demo",
    title: "AI media generation",
    lead:
      "Choose a mode — the site queues a job, polls status, then loads the result. One flow for images and video.",
    modeLabel: "Mode",
    modes: {
      text_to_image: "Text → image",
      image_to_video: "Image → video",
      text_to_video: "Text → video",
    },
    promptLabel: "Prompt",
    promptOptional: "Prompt (optional)",
    promptPlaceholder: "Describe what you want…",
    imageUrlLabel: "Image URL",
    imageUrlPlaceholder: "https://…",
    imageFileLabel: "Or upload an image",
    durationLabel: "Duration (seconds, optional)",
    durationPlaceholder: "e.g. 5",
    submit: "Generate",
    submitting: "Submitting…",
    reset: "New generation",
    statusIdle: "Ready when you are.",
    statusSubmitting: "Sending your request…",
    statusQueued: "Queued — your request is in line for the media worker.",
    statusRunning: "Working on it — image and video jobs can take a few minutes.",
    statusCompletedImage: "Done — your image is below.",
    statusCompletedVideo: "Done — your video is below.",
    statusFailed: "Generation did not complete.",
    statusPollTimeout:
      "Still processing on the server. You can copy the job id and try again later, or start over.",
    jobIdLabel: "Job id",
    imageAlt: "Generated image",
    videoLabel: "Generated video",
    noMediaUrl:
      "The job finished, but the response did not include a direct image URL. If the worker returns Comfy filenames only, configure playback: either point NEXT_PUBLIC_MEDIA_JOB_VIEW_* at a public Comfy /view URL, or use the API proxy (MEDIA_JOB_VIEW_BASE_URL + path /media/comfy-view — see deploy/env.prod.example). Raw JSON is available below.",
    rawJson: "Show raw result",
    hideRaw: "Hide raw result",
    errorGeneric: "Something went wrong. Please try again.",
    error503:
      "Media jobs are temporarily unavailable (service may be warming up). Try again shortly.",
    errorValidation: "Check your inputs and try again.",
    errorUpstream: "The media service timed out or was unreachable.",
    errorNeedImage: "Add an image URL or upload a file.",
    errorNeedPrompt: "Enter a prompt.",
  },
  ar: {
    kicker: "عرض مباشر",
    title: "توليد وسائط بالذكاء الاصطناعي",
    lead:
      "اختر وضعًا — الموقع يضع المهمة في قائمة الانتظار، يتابع الحالة، ثم يحمّل النتيجة. تدفق واحد للصور والفيديو.",
    modeLabel: "الوضع",
    modes: {
      text_to_image: "نص → صورة",
      image_to_video: "صورة → فيديو",
      text_to_video: "نص → فيديو",
    },
    promptLabel: "الوصف",
    promptOptional: "الوصف (اختياري)",
    promptPlaceholder: "صف ما تريده…",
    imageUrlLabel: "رابط الصورة",
    imageUrlPlaceholder: "https://…",
    imageFileLabel: "أو ارفع صورة",
    durationLabel: "المدة بالثواني (اختياري)",
    durationPlaceholder: "مثال: 5",
    submit: "توليد",
    submitting: "جاري الإرسال…",
    reset: "توليد جديد",
    statusIdle: "جاهز عندما تكون أنت جاهزًا.",
    statusSubmitting: "جاري إرسال الطلب…",
    statusQueued: "في الانتظار — طلبك في قائمة انتظار عامل الوسائط.",
    statusRunning: "جاري التنفيذ — قد تستغرق مهام الصور والفيديو بضع دقائق.",
    statusCompletedImage: "تم — الصورة أدناه.",
    statusCompletedVideo: "تم — الفيديو أدناه.",
    statusFailed: "لم يكتمل التوليد.",
    statusPollTimeout:
      "ما زال التنفيذ على الخادم. يمكنك نسخ معرّف المهمة أو البدء من جديد.",
    jobIdLabel: "معرّف المهمة",
    imageAlt: "صورة مُولَّدة",
    videoLabel: "فيديو مُولَّد",
    noMediaUrl:
      "اكتملت المهمة لكن الاستجابة لا تحتوي على رابط صورة مباشر. إذا كان العامل يعيد أسماء Comfy فقط، اضبط عناوين العرض العامة أو وكيل الـ API (/media/comfy-view). راجع deploy/env.prod.example. يمكن عرض JSON الخام أدناه.",
    rawJson: "عرض النتيجة الخام",
    hideRaw: "إخفاء النتيجة الخام",
    errorGeneric: "حدث خطأ. حاول مرة أخرى.",
    error503:
      "خدمة الوسائط غير متاحة مؤقتًا. أعد المحاولة بعد قليل.",
    errorValidation: "راجع المدخلات وحاول مرة أخرى.",
    errorUpstream: "انتهت مهلة الخدمة أو تعذر الوصول إليها.",
    errorNeedImage: "أضف رابط صورة أو ارفع ملفًا.",
    errorNeedPrompt: "أدخل وصفًا.",
  },
} as const;

function mapStatusToPhase(
  status: MediaJobLifecycleStatus,
): Exclude<UiPhase, "idle" | "submitting" | "poll_timeout"> {
  if (status === "queued") return "queued";
  if (status === "running") return "running";
  if (status === "completed") return "completed";
  return "failed";
}

function friendlyApiError(
  e: unknown,
  str: (typeof COPY)["en"] | (typeof COPY)["ar"],
): string {
  if (e instanceof MediaJobApiError) {
    if (e.status === 503) return str.error503;
    if (e.status === 400 || e.status === 422) return str.errorValidation;
    if (e.status === 502 || e.status === 504) return str.errorUpstream;
    return e.message || str.errorGeneric;
  }
  if (e instanceof Error) return e.message || str.errorGeneric;
  return str.errorGeneric;
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
      if (typeof s !== "string") {
        reject(new Error("Could not read file"));
        return;
      }
      const comma = s.indexOf(",");
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    r.onerror = () => reject(r.error ?? new Error("Could not read file"));
    r.readAsDataURL(file);
  });
}

export type UnifiedMediaGenerationPanelProps = {
  locale: AppLocale;
  /** Default tab when the panel mounts (e.g. image vs video Studio pages). */
  defaultMode?: MediaStudioJobMode;
};

export function UnifiedMediaGenerationPanel({
  locale,
  defaultMode = "text_to_image",
}: UnifiedMediaGenerationPanelProps) {
  const c = COPY[locale === "ar" ? "ar" : "en"];
  const [mode, setMode] = useState<MediaStudioJobMode>(defaultMode);
  const [prompt, setPrompt] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [durationRaw, setDurationRaw] = useState("");

  const [phase, setPhase] = useState<UiPhase>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<PreviewKind>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [rawResult, setRawResult] = useState<unknown>(null);
  const [showRaw, setShowRaw] = useState(false);

  const mounted = useRef(true);
  const pollStartRef = useRef<number>(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const stopPollingRef = useRef(false);
  useEffect(() => {
    stopPollingRef.current =
      phase === "idle" ||
      phase === "submitting" ||
      phase === "completed" ||
      phase === "failed" ||
      phase === "poll_timeout";
  }, [phase]);

  const runPollLoop = useCallback(
    async (id: string, submittedMode: MediaStudioJobMode) => {
      const str = COPY[locale === "ar" ? "ar" : "en"];
      pollStartRef.current = Date.now();
      stopPollingRef.current = false;
      const isVideoJob =
        submittedMode === "image_to_video" || submittedMode === "text_to_video";

      const tick = async () => {
        if (!mounted.current || stopPollingRef.current) return;

        if (Date.now() - pollStartRef.current > MAX_POLL_DURATION_MS) {
          if (mounted.current) {
            setPhase("poll_timeout");
            setErrorMessage(null);
          }
          return;
        }

        try {
          const row = await getMediaJobStatus(id);
          if (!mounted.current || stopPollingRef.current) return;

          const next: UiPhase =
            row.status === "completed" && !row.resultReady
              ? "running"
              : mapStatusToPhase(row.status);
          setPhase(next);

          if (row.status === "failed") {
            setErrorMessage(
              row.error?.message?.trim() || str.statusFailed,
            );
            return;
          }

          if (row.status === "completed") {
            if (!row.resultReady) {
              setTimeout(tick, POLL_INTERVAL_MS);
              return;
            }
            try {
              const envelope = await getMediaJobResult(id);
              if (!mounted.current || stopPollingRef.current) return;
              setRawResult(envelope.result);
              const useVideoPreview =
                envelope.mediaKind === "video"
                  ? true
                  : envelope.mediaKind === "image"
                    ? false
                    : isVideoJob;
              const fromPlayback = mediaPlaybackSrc(envelope.playback);
              const url =
                fromPlayback ??
                (useVideoPreview
                  ? extractRenderableVideoUrl(envelope.result)
                  : extractRenderableImageUrl(envelope.result));
              setMediaUrl(url);
              setPreviewKind(useVideoPreview ? "video" : "image");
              if (!url) {
                setErrorMessage(null);
              }
            } catch (err) {
              if (!mounted.current || stopPollingRef.current) return;
              if (isMediaJobResultNotReadyError(err)) {
                setPhase("running");
                setErrorMessage(null);
                setTimeout(tick, POLL_INTERVAL_MS);
                return;
              }
              setPhase("failed");
              setErrorMessage(friendlyApiError(err, str));
            }
            return;
          }
        } catch (err) {
          if (!mounted.current || stopPollingRef.current) return;
          setPhase("failed");
          setErrorMessage(friendlyApiError(err, str));
          return;
        }

        setTimeout(tick, POLL_INTERVAL_MS);
      };

      await tick();
    },
    [locale],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phase === "submitting") return;

    const p = prompt.trim();
    if (mode === "text_to_image" || mode === "text_to_video") {
      if (!p) {
        setErrorMessage(c.errorNeedPrompt);
        setPhase("idle");
        return;
      }
    }

    if (mode === "image_to_video") {
      const url = imageUrlInput.trim();
      const hasUrl = url.length > 0;
      const hasFile = imageFile != null;
      if (!hasUrl && !hasFile) {
        setErrorMessage(c.errorNeedImage);
        setPhase("idle");
        return;
      }
    }

    setPhase("submitting");
    setErrorMessage(null);
    setMediaUrl(null);
    setPreviewKind(null);
    setRawResult(null);
    setShowRaw(false);
    setJobId(null);

    const durationSeconds = parseDuration(durationRaw);

    try {
      if (mode === "text_to_image") {
        const created = await createStudioMediaJob({
          mode: "text_to_image",
          prompt: p,
        });
        if (!mounted.current) return;
        setJobId(created.id);
        setPhase("queued");
        void runPollLoop(created.id, "text_to_image");
        return;
      }

      if (mode === "text_to_video") {
        const created = await createStudioMediaJob({
          mode: "text_to_video",
          prompt: p,
          ...(durationSeconds != null ? { duration_seconds: durationSeconds } : {}),
        });
        if (!mounted.current) return;
        setJobId(created.id);
        setPhase("queued");
        void runPollLoop(created.id, "text_to_video");
        return;
      }

      const url = imageUrlInput.trim();
      let image_base64: string | undefined;
      if (imageFile) {
        image_base64 = await readFileAsBase64(imageFile);
      }
      const created = await createStudioMediaJob({
        mode: "image_to_video",
        ...(p ? { prompt: p } : {}),
        ...(url ? { image_url: url } : {}),
        ...(image_base64 ? { image_base64 } : {}),
        ...(durationSeconds != null ? { duration_seconds: durationSeconds } : {}),
      });
      if (!mounted.current) return;
      setJobId(created.id);
      setPhase("queued");
      void runPollLoop(created.id, "image_to_video");
    } catch (err) {
      if (!mounted.current) return;
      setPhase("failed");
      setErrorMessage(friendlyApiError(err, c));
    }
  }

  function handleReset() {
    stopPollingRef.current = true;
    setPhase("idle");
    setJobId(null);
    setErrorMessage(null);
    setMediaUrl(null);
    setPreviewKind(null);
    setRawResult(null);
    setShowRaw(false);
  }

  const completedCopy =
    previewKind === "video" ? c.statusCompletedVideo : c.statusCompletedImage;

  const statusMessage =
    phase === "idle"
      ? c.statusIdle
      : phase === "submitting"
        ? c.statusSubmitting
        : phase === "queued"
          ? c.statusQueued
          : phase === "running"
            ? c.statusRunning
            : phase === "completed"
              ? mediaUrl
                ? completedCopy
                : c.noMediaUrl
              : phase === "poll_timeout"
                ? c.statusPollTimeout
                : phase === "failed"
                  ? errorMessage || c.statusFailed
                  : c.statusIdle;

  const busy =
    phase === "submitting" || phase === "queued" || phase === "running";

  const canSubmit =
    mode === "text_to_image"
      ? prompt.trim().length > 0
      : mode === "text_to_video"
        ? prompt.trim().length > 0
        : imageUrlInput.trim().length > 0 || imageFile != null;

  return (
    <section
      className="border-b border-[var(--border)] bg-[var(--canvas)] py-12 sm:py-14"
      aria-labelledby="unified-media-generation-heading"
    >
      <Container as="div">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
          {c.kicker}
        </p>
        <h2
          id="unified-media-generation-heading"
          className="font-display mt-2 text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl"
        >
          {c.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-body)] sm:text-base">
          {c.lead}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 max-w-2xl space-y-5"
        >
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-[var(--text)]">
              {c.modeLabel}
            </legend>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label={c.modeLabel}
            >
              {MODES.map((m) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setMode(m);
                      setErrorMessage(null);
                    }}
                    className={
                      active
                        ? "rounded-full border border-[var(--accent)] bg-[var(--accent)]/15 px-4 py-2 text-xs font-semibold text-[var(--accent)] sm:text-sm"
                        : "rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--text-body)] hover:border-[var(--accent)]/40 sm:text-sm"
                    }
                  >
                    {c.modes[m]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {(mode === "text_to_image" || mode === "text_to_video") && (
            <div>
              <label
                htmlFor="unified-media-prompt"
                className="text-sm font-medium text-[var(--text)]"
              >
                {c.promptLabel}
              </label>
              <textarea
                id="unified-media-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={c.promptPlaceholder}
                maxLength={MEDIA_GENERATE_IMAGE_PROMPT_MAX_LENGTH}
                rows={4}
                disabled={busy}
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:opacity-60"
              />
            </div>
          )}

          {mode === "image_to_video" && (
            <>
              <div>
                <label
                  htmlFor="unified-media-image-url"
                  className="text-sm font-medium text-[var(--text)]"
                >
                  {c.imageUrlLabel}
                </label>
                <input
                  id="unified-media-image-url"
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    if (e.target.value.trim()) setImageFile(null);
                  }}
                  placeholder={c.imageUrlPlaceholder}
                  disabled={busy || imageFile != null}
                  className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:opacity-60"
                />
              </div>
              <div>
                <label
                  htmlFor="unified-media-image-file"
                  className="text-sm font-medium text-[var(--text)]"
                >
                  {c.imageFileLabel}
                </label>
                <input
                  id="unified-media-image-file"
                  type="file"
                  accept="image/*"
                  disabled={busy || imageUrlInput.trim().length > 0}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setImageFile(f);
                    if (f) setImageUrlInput("");
                  }}
                  className="mt-2 block w-full text-sm text-[var(--text-body)] file:mr-3 file:rounded-md file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--text)] disabled:opacity-60"
                />
              </div>
              <div>
                <label
                  htmlFor="unified-media-i2v-prompt"
                  className="text-sm font-medium text-[var(--text)]"
                >
                  {c.promptOptional}
                </label>
                <textarea
                  id="unified-media-i2v-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={c.promptPlaceholder}
                  maxLength={MEDIA_GENERATE_IMAGE_PROMPT_MAX_LENGTH}
                  rows={3}
                  disabled={busy}
                  className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:opacity-60"
                />
              </div>
            </>
          )}

          {(mode === "text_to_video" || mode === "image_to_video") && (
            <div>
              <label
                htmlFor="unified-media-duration"
                className="text-sm font-medium text-[var(--text)]"
              >
                {c.durationLabel}
              </label>
              <input
                id="unified-media-duration"
                type="text"
                inputMode="decimal"
                value={durationRaw}
                onChange={(e) => setDurationRaw(e.target.value)}
                placeholder={c.durationPlaceholder}
                disabled={busy}
                className="mt-2 w-full max-w-xs rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:opacity-60"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!canSubmit || busy}
              className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-contrast,#0a0a0a)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {phase === "submitting" ? c.submitting : c.submit}
            </button>
            {(phase === "completed" ||
              phase === "failed" ||
              phase === "poll_timeout") && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_85%,var(--text)_15%)]"
              >
                {c.reset}
              </button>
            )}
          </div>
        </form>

        <div
          className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm leading-relaxed text-[var(--text-body)]">
            {statusMessage}
          </p>
          {jobId ? (
            <p className="mt-3 font-mono text-xs text-[var(--muted)] break-all">
              <span className="font-sans text-[var(--text-body)]">
                {c.jobIdLabel}:{" "}
              </span>
              {jobId}
            </p>
          ) : null}
        </div>

        {mediaUrl && previewKind === "image" ? (
          <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- runtime URL from API */}
            <img
              src={mediaUrl}
              alt={c.imageAlt}
              className="max-h-[min(70vh,720px)] w-full object-contain"
            />
          </div>
        ) : null}

        {mediaUrl && previewKind === "video" ? (
          <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)] bg-black">
            <video
              src={mediaUrl}
              controls
              playsInline
              className="max-h-[min(70vh,720px)] w-full object-contain"
              aria-label={c.videoLabel}
            >
              {c.videoLabel}
            </video>
          </div>
        ) : null}

        {rawResult != null && phase === "completed" ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowRaw((s) => !s)}
              className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              {showRaw ? c.hideRaw : c.rawJson}
            </button>
            {showRaw ? (
              <pre className="mt-3 max-h-64 overflow-auto rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--canvas)_96%,#000_4%)] p-3 text-xs text-[var(--text-body)]">
                {JSON.stringify(rawResult, null, 2)}
              </pre>
            ) : null}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
