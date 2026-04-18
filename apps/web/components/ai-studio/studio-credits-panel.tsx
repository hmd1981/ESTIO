"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { GpuOfflineBanner } from "@/components/ai-studio/gpu-offline-banner";
import type { AppLocale } from "@/lib/i18n/config";
import { useGpuStatus } from "@/lib/use-gpu-status";
import {
  clearWalletSession,
  loginWithWallet,
  useCreditBalance,
  useWalletSession,
  type WalletSession,
} from "@/lib/wallet-session";

/* ─── ESTIO payment contract types (matching apps/api PaymentsService) ─── */

type CreditPack = {
  /** Server-assigned UUID. */
  id: string;
  /** Stable lookup key — what we POST back as `packCode`. */
  code: string;
  /** Display credits granted. */
  credits: number;
  /** Decimal USDC string (e.g. "10", "39.99"). */
  usdcAmount: string;
  nameEn: string;
  nameAr: string;
};

type ChainName = "base" | "baseSepolia";

type CreatePaymentResponse = {
  paymentRef: string;
  packCode: string;
  receivingAddress: string;
  expectedAmountAtomic: string;
  expectedAmountUsdc: string;
  chain: ChainName;
  chainId: number;
  usdcAddress: string;
  expiresAt: string;
  status: "pending";
};

type StatusResponse = {
  paymentRef: string;
  status: "pending" | "confirmed" | "expired" | "failed";
  confirmedAt: string | null;
  txHash: string | null;
  receivingAddress: string;
  expectedAmountUsdc: string;
  expiresAt: string;
  pack: { code: string; credits: number };
  terminal: boolean;
};

/* ─── UI state machine ─── */

type UiPhase =
  | "loading"
  | "connect"
  | "browse"
  | "creating"
  | "pending"
  | "confirmed"
  | "expired"
  | "failed"
  | "error";

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
    walletWarning:
      "Send only {currency} on {network}. Other tokens or networks will be lost permanently.",
    walletLabel: "Send exactly:",
    toAddress: "To wallet address ({network}):",
    qrLabel: "Scan to pay",
    copied: "Copied",
    copy: "Copy",
    expiresIn: "Expires in",
    confirmed: "Payment confirmed",
    confirmedSub: "Credits have been added to your wallet balance.",
    expired: "Payment expired",
    expiredSub: "The payment window has closed. No funds were received.",
    failed: "Payment failed",
    failedSub: "The payment could not be processed. No funds were taken.",
    tryAgain: "Try again",
    startOver: "Start over",
    errorGeneric: "Something went wrong. Please try again.",
    waitingPayment: "Waiting for payment…",
    gpuOfflineDisabledTooltip:
      "GPU services are temporarily offline — credit top-ups are paused.",
    connectTitle: "Connect your wallet to top up",
    connectLead:
      "Sign in with your Ethereum wallet (MetaMask, Coinbase Wallet, Rabby, …) to receive your credit balance and make purchases.",
    connectButton: "Connect wallet",
    connecting: "Waiting for wallet…",
    connectedAs: "Signed in as",
    signOut: "Sign out",
    balance: "Balance",
    creditsUnit: "credits",
  },
  ar: {
    kicker: "رصيد الاستوديو",
    title: "اشحن رصيدك",
    lead: "اشترِ رصيدًا لتوليد الصور والفيديو حسب الطلب. ادفع بـ USDC على شبكة Base — سريع وشفاف وبدون وسطاء.",
    buyCredits: "شراء رصيد",
    creating: "جارٍ إنشاء الدفعة…",
    loading: "جارٍ تحميل الباقات…",
    packCredits: "رصيد",
    walletWarning:
      "أرسل فقط {currency} على شبكة {network}. الرموز أو الشبكات الأخرى ستُفقد نهائيًا.",
    walletLabel: "أرسل بالضبط:",
    toAddress: "إلى عنوان المحفظة ({network}):",
    qrLabel: "امسح للدفع",
    copied: "تم النسخ",
    copy: "نسخ",
    expiresIn: "ينتهي خلال",
    confirmed: "تم تأكيد الدفع",
    confirmedSub: "تمت إضافة الرصيد إلى محفظتك.",
    expired: "انتهت صلاحية الدفع",
    expiredSub: "انتهت نافذة الدفع. لم يتم استلام أي أموال.",
    failed: "فشل الدفع",
    failedSub: "لم يتم معالجة الدفع. لم يتم خصم أي أموال.",
    tryAgain: "حاول مرة أخرى",
    startOver: "البدء من جديد",
    errorGeneric: "حدث خطأ. حاول مرة أخرى.",
    waitingPayment: "في انتظار الدفع…",
    gpuOfflineDisabledTooltip:
      "خدمات GPU غير متاحة مؤقتًا — شحن الرصيد متوقف حاليًا.",
    connectTitle: "اربط محفظتك لشحن الرصيد",
    connectLead:
      "سجّل الدخول بمحفظة إيثريوم (MetaMask أو Coinbase Wallet أو Rabby…) لتلقي رصيدك وإجراء عمليات الشراء.",
    connectButton: "ربط المحفظة",
    connecting: "في انتظار المحفظة…",
    connectedAs: "تم تسجيل الدخول بـ",
    signOut: "تسجيل الخروج",
    balance: "الرصيد",
    creditsUnit: "رصيد",
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

function CountdownRing({
  secondsLeft,
  totalSeconds,
}: {
  secondsLeft: number;
  totalSeconds: number;
}) {
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
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span
        className="absolute text-[11px] font-mono font-bold tabular-nums"
        style={{ color }}
      >
        {minutes}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  );
}

/* ─── Clipboard helper ─── */

function CopyButton({
  text,
  label,
  copiedLabel,
}: {
  text: string;
  label: string;
  copiedLabel: string;
}) {
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

function shortenAddr(addr: string): string {
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/* ─── Fallback packs (shown only if /api/payments/packs is unavailable) ─── */

const FALLBACK_PACKS: CreditPack[] = [
  {
    id: "fallback-starter",
    code: "starter",
    credits: 50,
    usdcAmount: "5",
    nameEn: "Starter",
    nameAr: "بداية",
  },
  {
    id: "fallback-standard",
    code: "standard",
    credits: 250,
    usdcAmount: "20",
    nameEn: "Standard",
    nameAr: "قياسي",
  },
  {
    id: "fallback-pro",
    code: "pro",
    credits: 750,
    usdcAmount: "50",
    nameEn: "Pro",
    nameAr: "احترافي",
  },
];

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
  const gpu = useGpuStatus();
  const gpuOffline = gpu.online === false;
  const session = useWalletSession();
  const { balance, refresh: refreshBalance } = useCreditBalance();

  const [packs, setPacks] = useState<CreditPack[]>(FALLBACK_PACKS);
  const [selectedCode, setSelectedCode] = useState<string>("standard");
  const [phase, setPhase] = useState<UiPhase>("loading");
  const [payment, setPayment] = useState<CreatePaymentResponse | null>(null);
  const [chainLabel, setChainLabel] = useState<string>("Base");
  const [uiError, setUiError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(1800);
  const [connecting, setConnecting] = useState(false);

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
        const payload: unknown = await res.json();
        if (cancelled) return;
        const items: unknown[] = Array.isArray(payload)
          ? payload
          : (payload as { data?: unknown[]; packs?: unknown[] })?.data ??
            (payload as { packs?: unknown[] })?.packs ??
            [];
        const parsed: CreditPack[] = items
          .map((raw) => {
            const r = raw as Record<string, unknown>;
            const id = String(r.id ?? "");
            const code = String(r.code ?? r.id ?? "");
            const credits = Number(r.credits ?? 0);
            const usdcAmount = String(r.usdcAmount ?? r.priceUsd ?? "");
            if (!id || !code || !credits || !usdcAmount) return null;
            return {
              id,
              code,
              credits,
              usdcAmount,
              nameEn: String(r.nameEn ?? r.label ?? code),
              nameAr: String(r.nameAr ?? r.labelAr ?? code),
            } as CreditPack;
          })
          .filter((p): p is CreditPack => p !== null);
        if (parsed.length > 0) {
          setPacks(parsed);
          if (!parsed.find((p) => p.code === "standard")) {
            setSelectedCode(parsed[0].code);
          }
        }
      } catch {
        /* fallback packs already set */
      }
      if (!cancelled) {
        setPhase(session ? "browse" : "connect");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-evaluate browse vs connect when session changes.
  useEffect(() => {
    if (phase === "loading") return;
    if (phase === "connect" && session) {
      setPhase("browse");
      setUiError(null);
    }
    if (phase === "browse" && !session) {
      setPhase("connect");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  /* ── Timer helpers ── */

  const stopTimers = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
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
      if (remaining <= 0 && countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    }, 1000);
  }, []);

  const startPolling = useCallback(
    (paymentRef: string) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        if (!mounted.current) return;
        try {
          const res = await fetch(
            `/api/payments/${encodeURIComponent(paymentRef)}/status`,
          );
          if (!res.ok) return;
          const payload = (await res.json()) as StatusResponse;
          if (payload.terminal && mounted.current) {
            const next: UiPhase =
              payload.status === "confirmed"
                ? "confirmed"
                : payload.status === "expired"
                  ? "expired"
                  : "failed";
            setPhase(next);
            stopTimers();
            if (payload.status === "confirmed") {
              window.dispatchEvent(new CustomEvent("estio:credits-changed"));
              refreshBalance();
            }
          }
        } catch {
          /* retry on next tick */
        }
      }, 4000);
    },
    [stopTimers, refreshBalance],
  );

  /* ── Connect wallet ── */

  async function handleConnect() {
    setConnecting(true);
    setUiError(null);
    try {
      await loginWithWallet();
      // The hook will pick up the session and flip phase via the effect
      // above; refresh balance immediately for snappier UI.
      refreshBalance();
    } catch (e) {
      setUiError(e instanceof Error ? e.message : str.errorGeneric);
    } finally {
      setConnecting(false);
    }
  }

  function handleSignOut() {
    clearWalletSession();
    setPayment(null);
    setPhase("connect");
    stopTimers();
  }

  /* ── Create payment ── */

  async function handleBuy(currentSession: WalletSession) {
    const pack = packs.find((p) => p.code === selectedCode);
    if (!pack) return;

    setPhase("creating");
    setUiError(null);

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${currentSession.token}`,
        },
        body: JSON.stringify({ packCode: pack.code }),
      });

      const payload = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          clearWalletSession();
          setPhase("connect");
          setUiError(
            payload?.message ?? "Your session expired — please sign in again.",
          );
          return;
        }
        setUiError(
          payload?.error ?? payload?.message ?? str.errorGeneric,
        );
        setPhase("error");
        return;
      }
      if (!mounted.current) return;

      const data = payload as CreatePaymentResponse;
      setPayment(data);
      setChainLabel(data.chain === "base" ? "Base" : "Base Sepolia");
      setPhase("pending");
      if (data.expiresAt) startCountdown(data.expiresAt);
      if (data.paymentRef) startPolling(data.paymentRef);
    } catch (e) {
      if (!mounted.current) return;
      setUiError(e instanceof Error ? e.message : str.errorGeneric);
      setPhase("error");
    }
  }

  /* ── Reset ── */

  function handleReset() {
    stopTimers();
    setPhase(session ? "browse" : "connect");
    setPayment(null);
    setUiError(null);
    setSecondsLeft(0);
  }

  /* ── Derived ── */

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
          <p className={headLeadCls}>{str.lead}</p>

          {/* Wallet status / balance bar */}
          {session ? (
            <div
              className={`mt-5 inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,#000_10%)] px-4 py-1.5 text-xs ${focus ? "" : "self-start"}`}
            >
              <span className="text-[var(--muted)]">{str.connectedAs}</span>
              <code className="font-mono text-[var(--accent)]">
                {shortenAddr(session.address)}
              </code>
              <span className="h-3 w-px bg-[var(--border)]" aria-hidden />
              <span className="text-[var(--muted)]">{str.balance}:</span>
              <span className="font-semibold tabular-nums text-[var(--text)]">
                {balance == null ? "—" : balance}{" "}
                <span className="text-[10px] font-normal text-[var(--muted)]">
                  {str.creditsUnit}
                </span>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="ms-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--accent)]"
              >
                {str.signOut}
              </button>
            </div>
          ) : null}

          {gpuOffline ? (
            <div
              className={focus ? "mx-auto mt-6 max-w-2xl text-start" : "mt-6"}
            >
              <GpuOfflineBanner locale={locale} snapshot={gpu.status} />
            </div>
          ) : null}

          {/* ── Loading packs ── */}
          {phase === "loading" ? (
            <p
              className={`text-sm text-[var(--muted)] ${focus ? "mt-6 text-center" : "mt-10"}`}
            >
              {str.loading}
            </p>
          ) : null}

          {/* ── Connect wallet ── */}
          {phase === "connect" ? (
            <div
              className={`rounded-sm border border-[color-mix(in_srgb,var(--accent)_25%,var(--border)_75%)] bg-[color-mix(in_srgb,var(--surface)_96%,#000_4%)] p-6 sm:p-8 ${focus ? "mx-auto mt-8 max-w-xl text-center" : "mt-10"}`}
            >
              <h3 className="text-base font-semibold text-[var(--text)]">
                {str.connectTitle}
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {str.connectLead}
              </p>
              {uiError ? (
                <div className="mt-4 rounded-sm border border-red-500/20 bg-red-950/20 px-3 py-2 text-xs text-red-300">
                  {uiError}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => void handleConnect()}
                disabled={connecting}
                className="mt-5 rounded-sm bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {connecting ? str.connecting : str.connectButton}
              </button>
            </div>
          ) : null}

          {/* ── Browse: credit packs ── */}
          {phase === "browse" ||
          phase === "creating" ||
          phase === "error" ? (
            <div className={focus ? "mt-6 sm:mt-8" : "mt-10"}>
              <div
                className={`grid gap-4 sm:grid-cols-3 ${focus ? "mx-auto max-w-3xl" : ""}`}
              >
                {packs.map((p) => {
                  const active = selectedCode === p.code;
                  return (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => {
                        setSelectedCode(p.code);
                        setUiError(null);
                      }}
                      disabled={phase === "creating"}
                      className={`group relative rounded-sm border p-5 transition-all duration-200 sm:p-6 ${
                        focus ? "text-center" : "text-left"
                      } ${
                        active
                          ? "border-[color-mix(in_srgb,var(--accent)_60%,var(--border)_40%)] bg-[color-mix(in_srgb,var(--surface)_96%,#000_4%)] shadow-[0_1px_0_rgba(212,175,55,0.12)]"
                          : "border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,#000_4%)] hover:border-[color-mix(in_srgb,var(--accent)_30%,var(--border)_70%)]"
                      }`}
                    >
                      {p.code === "standard" ? (
                        <span
                          className={`absolute -top-2.5 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a] ${
                            focus
                              ? "left-1/2 right-auto -translate-x-1/2"
                              : "right-4"
                          }`}
                        >
                          {locale === "ar" ? "شائع" : "Popular"}
                        </span>
                      ) : null}
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {locale === "ar" ? p.nameAr : p.nameEn}
                      </p>
                      <p className="font-display mt-2 text-2xl font-semibold tabular-nums text-[var(--text)]">
                        {p.credits}{" "}
                        <span className="text-sm font-normal text-[var(--muted)]">
                          {str.packCredits}
                        </span>
                      </p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--accent)]">
                        ${p.usdcAmount}
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
                  onClick={() => session && void handleBuy(session)}
                  disabled={phase === "creating" || gpuOffline || !session}
                  title={
                    gpuOffline ? str.gpuOfflineDisabledTooltip : undefined
                  }
                  aria-disabled={
                    phase === "creating" || gpuOffline || !session
                  }
                  className="rounded-sm bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {phase === "creating" ? str.creating : str.buyCredits}
                </button>
              </div>
            </div>
          ) : null}

          {/* ── Pending: wallet + QR + countdown ── */}
          {phase === "pending" && payment ? (
            <div
              className={`rounded-sm border border-[color-mix(in_srgb,var(--accent)_25%,var(--border)_75%)] bg-[color-mix(in_srgb,var(--surface)_96%,#000_4%)] p-6 sm:p-8 ${focus ? "mt-8 mx-auto max-w-2xl text-start" : "mt-10"}`}
            >
              <div className="flex items-start gap-3 rounded-sm border border-amber-500/20 bg-amber-950/10 px-4 py-3">
                <span className="mt-0.5 text-amber-400" aria-hidden>
                  ⚠
                </span>
                <p className="text-xs font-medium leading-relaxed text-amber-200/90">
                  {tpl(str.walletWarning, {
                    currency: "USDC",
                    network: chainLabel,
                  })}
                </p>
              </div>

              <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_auto]">
                <div className="space-y-6">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                      {str.walletLabel}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="font-display text-2xl font-bold tabular-nums text-[var(--text)]">
                        {payment.expectedAmountUsdc} USDC
                      </span>
                      <CopyButton
                        text={payment.expectedAmountUsdc}
                        label={str.copy}
                        copiedLabel={str.copied}
                      />
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                      USDC contract:{" "}
                      <code className="font-mono">
                        {shortenAddr(payment.usdcAddress)}
                      </code>
                    </p>
                  </div>

                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                      {tpl(str.toAddress, { network: chainLabel })}
                    </p>
                    <div className="mt-2 flex items-start gap-3">
                      <code className="block break-all rounded-sm bg-[color-mix(in_srgb,var(--canvas)_92%,#000_8%)] px-3 py-2 font-mono text-xs text-[var(--text-body)]">
                        {payment.receivingAddress}
                      </code>
                      <CopyButton
                        text={payment.receivingAddress}
                        label={str.copy}
                        copiedLabel={str.copied}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <CountdownRing
                      secondsLeft={secondsLeft}
                      totalSeconds={totalSeconds}
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">
                        {str.waitingPayment}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {str.expiresIn}{" "}
                        {Math.floor(secondsLeft / 60)}:
                        {String(secondsLeft % 60).padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <QrCode data={payment.receivingAddress} size={140} />
                  <p className="text-[10px] text-[var(--muted)]">
                    {str.qrLabel}
                  </p>
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
                <span className="text-2xl text-emerald-400" aria-hidden>
                  ✓
                </span>
                <div>
                  <p className="text-base font-semibold text-emerald-300">
                    {str.confirmed}
                  </p>
                  <p className="mt-1 text-sm text-emerald-200/70">
                    {str.confirmedSub}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)]/40"
              >
                {str.startOver}
              </button>
            </div>
          ) : null}

          {/* ── Terminal: expired ── */}
          {phase === "expired" ? (
            <div
              className={`rounded-sm border border-red-500/20 bg-red-950/10 p-6 sm:p-8 ${focus ? "mx-auto mt-8 max-w-lg text-center" : "mt-10"}`}
            >
              <p className="text-base font-semibold text-red-300">
                {str.expired}
              </p>
              <p className="mt-1 text-sm text-red-200/60">{str.expiredSub}</p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)]/40"
              >
                {str.tryAgain}
              </button>
            </div>
          ) : null}

          {/* ── Terminal: failed ── */}
          {phase === "failed" ? (
            <div
              className={`rounded-sm border border-red-500/20 bg-red-950/10 p-6 sm:p-8 ${focus ? "mx-auto mt-8 max-w-lg text-center" : "mt-10"}`}
            >
              <p className="text-base font-semibold text-red-300">
                {str.failed}
              </p>
              <p className="mt-1 text-sm text-red-200/60">{str.failedSub}</p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 rounded-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)]/40"
              >
                {str.tryAgain}
              </button>
            </div>
          ) : null}
        </div>
      </Container>
    </Root>
  );
}
