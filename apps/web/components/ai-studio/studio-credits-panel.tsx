"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import type { AppLocale } from "@/lib/i18n/config";

/* ─── ESTIO payment contract types ─── */

type CreditPack = {
  id: string;
  credits: number;
  priceUsd: number;
  label: string;
  labelAr: string;
  note: string;
  noteAr: string;
};

type WalletInfo = {
  address: string;
  network: string;
  currency: string;
  amount: string;
  instructions: string;
  expiresAt: string;
};

type PaymentStatus =
  | "pending"
  | "confirmed"
  | "expired"
  | "requires_review"
  | "failed"
  | "refunded";

type PaymentData = {
  paymentId: string;
  pack: string;
  status: PaymentStatus;
  wallet: WalletInfo;
};

/* ─── UI state machine ─── */

type UiPhase =
  | "loading"
  | "browse"
  | "creating"
  | "pending"
  | "confirmed"
  | "expired"
  | "requires_review"
  | "failed"
  | "refunded"
  | "error";

const TERMINAL_STATES = new Set<PaymentStatus>([
  "confirmed",
  "expired",
  "requires_review",
  "failed",
  "refunded",
]);

/* ─── Copy ─── */

const COPY = {
  en: {
    kicker: "Studio credits",
    title: "Top up your balance",
    lead: "Buy credits to generate images and videos on demand. Pay with USDC on Base — fast, transparent, no intermediaries.",
    buyCredits: "Buy credits",
    creating: "Creating payment…",
    loading: "Loading packs…",
    packCredits: "credits",
    walletWarning: "Send only {currency} on {network}. Other tokens or networks will be lost permanently.",
    walletLabel: "Send exactly:",
    toAddress: "To wallet address ({network}):",
    instructions: "Instructions:",
    qrLabel: "Scan to pay",
    copied: "Copied",
    copy: "Copy",
    expiresIn: "Expires in",
    confirmed: "Payment confirmed",
    confirmedSub: "Credits will be applied to your account shortly.",
    expired: "Payment expired",
    expiredSub: "The payment window has closed. No funds were received.",
    review: "Payment under review",
    reviewSub: "We received your payment but it requires manual verification. Credits will be applied once confirmed.",
    failed: "Payment failed",
    failedSub: "The payment could not be processed. No funds were taken.",
    refunded: "Payment refunded",
    refundedSub: "Your payment has been returned. Contact support if credits are not restored.",
    tryAgain: "Try again",
    startOver: "Start over",
    errorGeneric: "Something went wrong. Please try again.",
    waitingPayment: "Waiting for payment…",
  },
  ar: {
    kicker: "رصيد الاستوديو",
    title: "اشحن رصيدك",
    lead: "اشترِ رصيدًا لتوليد الصور والفيديو حسب الطلب. ادفع بـ USDC على شبكة Base — سريع وشفاف وبدون وسطاء.",
    buyCredits: "شراء رصيد",
    creating: "جارٍ إنشاء الدفعة…",
    loading: "جارٍ تحميل الباقات…",
    packCredits: "رصيد",
    walletWarning: "أرسل فقط {currency} على شبكة {network}. الرموز أو الشبكات الأخرى ستُفقد نهائيًا.",
    walletLabel: "أرسل بالضبط:",
    toAddress: "إلى عنوان المحفظة ({network}):",
    instructions: "التعليمات:",
    qrLabel: "امسح للدفع",
    copied: "تم النسخ",
    copy: "نسخ",
    expiresIn: "ينتهي خلال",
    confirmed: "تم تأكيد الدفع",
    confirmedSub: "سيتم إضافة الرصيد لحسابك قريبًا.",
    expired: "انتهت صلاحية الدفع",
    expiredSub: "انتهت نافذة الدفع. لم يتم استلام أي أموال.",
    review: "الدفع قيد المراجعة",
    reviewSub: "تم استلام الدفع لكنه يحتاج تحققًا يدويًا. سيتم إضافة الرصيد بعد التأكيد.",
    failed: "فشل الدفع",
    failedSub: "لم يتم معالجة الدفع. لم يتم خصم أي أموال.",
    refunded: "تم استرداد الدفع",
    refundedSub: "تم إرجاع المبلغ. تواصل مع الدعم إذا لم يُسترد الرصيد.",
    tryAgain: "حاول مرة أخرى",
    startOver: "البدء من جديد",
    errorGeneric: "حدث خطأ. حاول مرة أخرى.",
    waitingPayment: "في انتظار الدفع…",
  },
} as const;

type Str = { [K in keyof (typeof COPY)["en"]]: string };

/* ─── QR code ─── */

function QrCode({ data, size = 160 }: { data: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=0a0a0a&color=d4af37&margin=2`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      width={size}
      height={size}
      alt="QR code"
      className="rounded-md"
    />
  );
}

/* ─── Countdown ring (SVG) ─── */

function CountdownRing({ secondsLeft, totalSeconds }: { secondsLeft: number; totalSeconds: number }) {
  const pct = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const color = pct > 0.25 ? "var(--accent)" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="56" height="56" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle
          cx="24" cy="24" r={r} fill="none"
          stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span className="absolute text-[11px] font-mono font-bold tabular-nums" style={{ color }}>
        {minutes}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  );
}

/* ─── Clipboard helper ─── */

function CopyButton({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  const tm = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleCopy() {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    if (tm.current) clearTimeout(tm.current);
    tm.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)] transition-colors hover:border-[var(--accent)]/40"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

/* ─── Template helper ─── */

function tpl(s: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, v),
    s,
  );
}

/* ─── Fallback packs (used when /api/payments/packs is unavailable) ─── */

const FALLBACK_PACKS: CreditPack[] = [
  {
    id: "starter",
    credits: 50,
    priceUsd: 10,
    label: "Starter",
    labelAr: "بداية",
    note: "Quick tests and previews",
    noteAr: "اختبارات ومعاينات سريعة",
  },
  {
    id: "standard",
    credits: 250,
    priceUsd: 40,
    label: "Standard",
    labelAr: "قياسي",
    note: "Most popular — everyday production",
    noteAr: "الأكثر شيوعًا — إنتاج يومي",
  },
  {
    id: "pro",
    credits: 750,
    priceUsd: 100,
    label: "Pro",
    labelAr: "احترافي",
    note: "Best value for campaigns",
    noteAr: "أفضل قيمة للحملات",
  },
];

function normalisePack(raw: Record<string, unknown>): CreditPack | null {
  const id = String(raw.id ?? raw.slug ?? "");
  const credits = Number(raw.credits ?? 0);
  const priceUsd = Number(raw.priceUsd ?? raw.price_usd ?? raw.price ?? 0);
  if (!id || !credits || !priceUsd) return null;
  return {
    id,
    credits,
    priceUsd,
    label: String(raw.label ?? raw.name ?? id),
    labelAr: String(raw.labelAr ?? raw.label_ar ?? raw.label ?? id),
    note: String(raw.note ?? raw.description ?? ""),
    noteAr: String(raw.noteAr ?? raw.note_ar ?? raw.note ?? ""),
  };
}

/* ═══════════════════════════════════════════════════
   Main panel
   ═══════════════════════════════════════════════════ */

export function StudioCreditsPanel({
  locale,
  ambient = false,
  layout = "focus",
  embedded = false,
}: {
  locale: AppLocale;
  ambient?: boolean;
  /** `focus` = centered column, visible above the fold; `default` = full-width left-aligned */
  layout?: "default" | "focus";
  /** When true, render a `div` (for use inside the hero) instead of a `section` */
  embedded?: boolean;
}) {
  const str: Str = COPY[locale === "ar" ? "ar" : "en"];
  const focus = layout === "focus";

  const [packs, setPacks] = useState<CreditPack[]>(FALLBACK_PACKS);
  const [selectedPack, setSelectedPack] = useState<string>("standard");
  const [phase, setPhase] = useState<UiPhase>("loading");
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(3600);

  const mounted = useRef(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Lifecycle ── */

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  /* ── Fetch packs on mount ── */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payments/packs");
        if (!res.ok) throw new Error(`${res.status}`);
        const payload = await res.json();
        if (cancelled) return;
        const items: unknown[] = Array.isArray(payload) ? payload : (payload?.data ?? payload?.packs ?? []);
        const parsed = items
          .map((raw) => normalisePack(raw as Record<string, unknown>))
          .filter((p): p is CreditPack => p !== null);
        if (parsed.length > 0) {
          setPacks(parsed);
          if (!parsed.find((p) => p.id === "standard")) {
            setSelectedPack(parsed[0].id);
          }
        }
      } catch {
        /* fallback packs already set */
      }
      if (!cancelled) setPhase("browse");
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Timer helpers ── */

  const stopTimers = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  }, []);

  const startCountdown = useCallback((expiresAt: string) => {
    const exp = new Date(expiresAt).getTime();
    const now = Date.now();
    const total = Math.max(1, Math.round((exp - now) / 1000));
    setTotalSeconds(total);
    setSecondsLeft(total);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((exp - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
      }
    }, 1000);
  }, []);

  const startPolling = useCallback((paymentId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      if (!mounted.current) return;
      try {
        const res = await fetch(`/api/payments/${encodeURIComponent(paymentId)}/status`);
        if (!res.ok) return;
        const payload = await res.json();
        const status = String(payload?.status ?? payload?.data?.status ?? "pending") as PaymentStatus;
        if (TERMINAL_STATES.has(status) && mounted.current) {
          setPhase(status);
          stopTimers();
        }
      } catch { /* retry on next tick */ }
    }, 4000);
  }, [stopTimers]);

  /* ── Create payment ── */

  async function handleBuy() {
    const pack = packs.find((p) => p.id === selectedPack);
    if (!pack) return;

    setPhase("creating");
    setUiError(null);

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: pack.id,
          provider: "onchain",
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setUiError(payload?.error ?? payload?.message ?? str.errorGeneric);
        setPhase("error");
        return;
      }
      if (!mounted.current) return;

      const d = (payload?.data ?? payload) as Record<string, unknown>;
      const w = (d.wallet ?? {}) as Record<string, unknown>;

      const data: PaymentData = {
        paymentId: String(d.paymentId ?? d.payment_id ?? d.id ?? ""),
        pack: String(d.pack ?? pack.id),
        status: (String(d.status ?? "pending")) as PaymentStatus,
        wallet: {
          address: String(w.address ?? ""),
          network: String(w.network ?? "Base"),
          currency: String(w.currency ?? "USDC"),
          amount: String(w.amount ?? ""),
          instructions: String(w.instructions ?? ""),
          expiresAt: String(w.expiresAt ?? w.expires_at ?? ""),
        },
      };

      setPayment(data);
      setPhase("pending");
      if (data.wallet.expiresAt) startCountdown(data.wallet.expiresAt);
      if (data.paymentId) startPolling(data.paymentId);
    } catch (e) {
      if (!mounted.current) return;
      setUiError(e instanceof Error ? e.message : str.errorGeneric);
      setPhase("error");
    }
  }

  /* ── Reset ── */

  function handleReset() {
    stopTimers();
    setPhase("browse");
    setPayment(null);
    setUiError(null);
    setSecondsLeft(0);
  }

  /* ── Derived state ── */

  const wallet = payment?.wallet ?? null;

  const bandCls = embedded
    ? "border-t border-[color-mix(in_srgb,var(--accent)_12%,var(--border)_88%)] bg-[color-mix(in_srgb,var(--surface)_94%,#000_6%)]"
    : ambient
      ? "border-b border-[color-mix(in_srgb,var(--border)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] backdrop-blur-sm"
      : "border-b border-[var(--border)] bg-[var(--surface)]";

  const innerCls = focus ? "mx-auto max-w-4xl text-center" : "";
  const headLeadCls = focus
    ? "mt-4 mx-auto max-w-2xl text-sm leading-relaxed text-[var(--muted)]"
    : "mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)]";

  /* ── Render ── */

  const Root = embedded ? "div" : "section";

  return (
    <Root
      id="studio-credits"
      className={`${embedded ? "scroll-mt-16 w-full" : focus ? "scroll-mt-20" : "scroll-mt-24"} ${bandCls}`}
    >
      <Container
        as="div"
        className={
          embedded
            ? "py-5 sm:py-6 lg:py-7"
            : focus
              ? "py-6 sm:py-8 lg:py-10"
              : "py-14 sm:py-16 lg:py-20"
        }
      >
        <div className={innerCls}>
        <p
          className={`text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)] ${focus ? "text-center" : ""}`}
        >
          {str.kicker}
        </p>
        <h2
          className={`font-display mt-3 text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl ${focus ? "text-center" : ""}`}
        >
          {str.title}
        </h2>
        <p className={headLeadCls}>
          {str.lead}
        </p>

        {/* ── Loading packs ── */}
        {phase === "loading" ? (
          <p className={`text-sm text-[var(--muted)] ${focus ? "mt-6 text-center" : "mt-10"}`}>
            {str.loading}
          </p>
        ) : null}

        {/* ── Browse: credit packs ── */}
        {phase === "browse" || phase === "creating" || phase === "error" ? (
          <div className={focus ? "mt-6 sm:mt-8" : "mt-10"}>
            <div
              className={`grid gap-4 sm:grid-cols-3 ${focus ? "mx-auto max-w-3xl" : ""}`}
            >
              {packs.map((p) => {
                const active = selectedPack === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setSelectedPack(p.id); setUiError(null); }}
                    disabled={phase === "creating"}
                    className={`group relative rounded-sm border p-5 transition-all duration-200 sm:p-6 ${
                      focus ? "text-center" : "text-left"
                    } ${
                      active
                        ? "border-[color-mix(in_srgb,var(--accent)_60%,var(--border)_40%)] bg-[color-mix(in_srgb,var(--surface)_96%,#000_4%)] shadow-[0_1px_0_rgba(212,175,55,0.12)]"
                        : "border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,#000_4%)] hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border)_70%)]"
                    }`}
                  >
                    {p.id === "standard" ? (
                      <span
                        className={`absolute -top-2.5 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a] ${
                          focus ? "left-1/2 right-auto -translate-x-1/2" : "right-4"
                        }`}
                      >
                        {locale === "ar" ? "شائع" : "Popular"}
                      </span>
                    ) : null}
                    <p className="text-sm font-semibold text-[var(--text)]">
                      {locale === "ar" ? p.labelAr : p.label}
                    </p>
                    <p className="font-display mt-2 text-2xl font-semibold tabular-nums text-[var(--text)]">
                      {p.credits}{" "}
                      <span className="text-sm font-normal text-[var(--muted)]">{str.packCredits}</span>
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--accent)]">
                      ${p.priceUsd}
                    </p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {locale === "ar" ? p.noteAr : p.note}
                    </p>
                    {active ? (
                      <div
                        className={`mt-3 h-0.5 w-8 bg-[var(--accent)] ${focus ? "mx-auto" : ""}`}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {uiError ? (
              <div
                className={`mt-6 rounded-sm border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-300 ${focus ? "text-center" : ""}`}
              >
                {uiError}
              </div>
            ) : null}

            <div
              className={`mt-6 flex flex-wrap items-center gap-4 sm:mt-8 ${focus ? "justify-center" : ""}`}
            >
              <button
                type="button"
                onClick={() => void handleBuy()}
                disabled={phase === "creating"}
                className="rounded-sm bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {phase === "creating" ? str.creating : str.buyCredits}
              </button>
            </div>
          </div>
        ) : null}

        {/* ── Pending: wallet + QR + countdown ── */}
        {phase === "pending" && wallet ? (
          <div
            className={`rounded-sm border border-[color-mix(in_srgb,var(--accent)_25%,var(--border)_75%)] bg-[color-mix(in_srgb,var(--surface)_96%,#000_4%)] p-6 sm:p-8 ${focus ? "mt-8 mx-auto max-w-2xl text-start" : "mt-10"}`}
          >
            {/* Network / currency warning */}
            <div className="flex items-start gap-3 rounded-sm border border-amber-500/20 bg-amber-950/10 px-4 py-3">
              <span className="mt-0.5 text-amber-400" aria-hidden>⚠</span>
              <p className="text-xs font-medium leading-relaxed text-amber-200/90">
                {tpl(str.walletWarning, { currency: wallet.currency, network: wallet.network })}
              </p>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_auto]">
              <div className="space-y-6">
                {/* Amount */}
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    {str.walletLabel}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-display text-2xl font-bold tabular-nums text-[var(--text)]">
                      {wallet.amount} {wallet.currency}
                    </span>
                    <CopyButton text={wallet.amount} label={str.copy} copiedLabel={str.copied} />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    {tpl(str.toAddress, { network: wallet.network })}
                  </p>
                  <div className="mt-2 flex items-start gap-3">
                    <code className="block break-all rounded-sm bg-[color-mix(in_srgb,var(--canvas)_92%,#000_8%)] px-3 py-2 font-mono text-xs text-[var(--text-body)]">
                      {wallet.address}
                    </code>
                    <CopyButton text={wallet.address} label={str.copy} copiedLabel={str.copied} />
                  </div>
                </div>

                {/* Instructions (if provided) */}
                {wallet.instructions ? (
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                      {str.instructions}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                      {wallet.instructions}
                    </p>
                  </div>
                ) : null}

                {/* Status + countdown */}
                <div className="flex items-center gap-4">
                  <CountdownRing secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{str.waitingPayment}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {str.expiresIn} {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR code */}
              <div className="flex flex-col items-center gap-2">
                <QrCode data={wallet.address} size={140} />
                <p className="text-[10px] text-[var(--muted)]">{str.qrLabel}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-6 text-xs font-medium text-[var(--muted)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
            >
              {str.startOver}
            </button>
          </div>
        ) : null}

        {/* ── Terminal: confirmed ── */}
        {phase === "confirmed" ? (
          <div
            className={`rounded-sm border border-emerald-500/25 bg-emerald-950/10 p-6 sm:p-8 ${focus ? "mx-auto mt-8 max-w-lg text-center" : "mt-10"}`}
          >
            <div
              className={`flex gap-3 ${focus ? "flex-col items-center" : "items-center"}`}
            >
              <span className="text-2xl text-emerald-400" aria-hidden>✓</span>
              <div>
                <p className="text-base font-semibold text-emerald-300">{str.confirmed}</p>
                <p className="mt-1 text-sm text-emerald-200/70">{str.confirmedSub}</p>
              </div>
            </div>
            <button type="button" onClick={handleReset}
              className="mt-6 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)]/40">
              {str.startOver}
            </button>
          </div>
        ) : null}

        {/* ── Terminal: expired ── */}
        {phase === "expired" ? (
          <div
            className={`rounded-sm border border-red-500/20 bg-red-950/10 p-6 sm:p-8 ${focus ? "mx-auto mt-8 max-w-lg text-center" : "mt-10"}`}
          >
            <p className="text-base font-semibold text-red-300">{str.expired}</p>
            <p className="mt-1 text-sm text-red-200/60">{str.expiredSub}</p>
            <button type="button" onClick={handleReset}
              className="mt-6 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)]/40">
              {str.tryAgain}
            </button>
          </div>
        ) : null}

        {/* ── Terminal: requires_review ── */}
        {phase === "requires_review" ? (
          <div
            className={`rounded-sm border border-amber-500/20 bg-amber-950/10 p-6 sm:p-8 ${focus ? "mx-auto mt-8 max-w-lg text-center" : "mt-10"}`}
          >
            <p className="text-base font-semibold text-amber-300">{str.review}</p>
            <p className="mt-1 text-sm text-amber-200/60">{str.reviewSub}</p>
            <button type="button" onClick={handleReset}
              className="mt-6 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)]/40">
              {str.startOver}
            </button>
          </div>
        ) : null}

        {/* ── Terminal: failed ── */}
        {phase === "failed" ? (
          <div
            className={`rounded-sm border border-red-500/20 bg-red-950/10 p-6 sm:p-8 ${focus ? "mx-auto mt-8 max-w-lg text-center" : "mt-10"}`}
          >
            <p className="text-base font-semibold text-red-300">{str.failed}</p>
            <p className="mt-1 text-sm text-red-200/60">{str.failedSub}</p>
            <button type="button" onClick={handleReset}
              className="mt-6 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)]/40">
              {str.tryAgain}
            </button>
          </div>
        ) : null}

        {/* ── Terminal: refunded ── */}
        {phase === "refunded" ? (
          <div
            className={`rounded-sm border border-sky-500/20 bg-sky-950/10 p-6 sm:p-8 ${focus ? "mx-auto mt-8 max-w-lg text-center" : "mt-10"}`}
          >
            <p className="text-base font-semibold text-sky-300">{str.refunded}</p>
            <p className="mt-1 text-sm text-sky-200/60">{str.refundedSub}</p>
            <button type="button" onClick={handleReset}
              className="mt-6 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)]/40">
              {str.startOver}
            </button>
          </div>
        ) : null}
        </div>
      </Container>
    </Root>
  );
}
