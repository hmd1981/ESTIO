"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { MarketingMessages } from "@/lib/i18n/messages";
import type { LeadSource } from "@/lib/leads/api";
import {
  getPreNavIntent,
  getStudioSessionId,
  postCrmLeadFromAiStudio,
} from "@/components/ai-studio/ai-studio-analytics";

type FormState = "idle" | "submitting" | "success" | "error";

type ContactFormCopy = MarketingMessages["contactForm"];

type ContactFormInitialValues = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  serviceInterest?: string;
  message?: string;
};

export function ContactForm({
  copy,
  source,
  initialValues = {},
  aiStudioContext,
}: {
  copy: ContactFormCopy;
  source: LeadSource;
  initialValues?: ContactFormInitialValues;
  aiStudioContext?: { locale: string; initialGoal?: string };
}) {
  const [state, setState] = useState<FormState>("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [serviceInterest, setServiceInterest] = useState(
    initialValues.serviceInterest ?? "",
  );
  const studioLeadPosted = useRef(false);

  useEffect(() => {
    if (!aiStudioContext || studioLeadPosted.current) return;
    studioLeadPosted.current = true;
    const intent = getPreNavIntent() ?? "brand";
    void postCrmLeadFromAiStudio({
      intent,
      sessionId: getStudioSessionId(),
      goalText: aiStudioContext.initialGoal,
      source: "contact_form",
      locale: aiStudioContext.locale,
    });
  }, [aiStudioContext]);
  const qualificationPack =
    serviceInterest && copy.qualificationByIntent[serviceInterest]
      ? copy.qualificationByIntent[serviceInterest]
      : undefined;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorDetail(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const serviceInterest = data.get("serviceInterest") as string;
    const payload = {
      fullName: (data.get("name") as string).trim(),
      email: (data.get("email") as string).trim(),
      phone: ((data.get("phone") as string) || "").trim() || undefined,
      company: ((data.get("company") as string) || "").trim() || undefined,
      serviceInterest,
      message: ((data.get("message") as string) || "").trim() || undefined,
      source,
    };

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ?? "https://api.estio.org";
      const res = await fetch(`${apiBase}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string | string[]; error?: string }
        | null;
      if (!res.ok) {
        const msg = Array.isArray(body?.message)
          ? body.message.join(", ")
          : typeof body?.message === "string"
            ? body.message
            : body?.error ?? `HTTP ${res.status}`;
        throw new Error(msg);
      }
      if (!body || (body as { ok?: boolean }).ok !== true) {
        throw new Error("Unexpected response");
      }
      setState("success");
      form.reset();
      setServiceInterest("");
    } catch (err) {
      setErrorDetail(err instanceof Error ? err.message : "Request failed");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-lg border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[var(--accent-muted)] p-8 text-center transition-[background-color,border-color] duration-200 ease-out">
        <p className="font-display text-lg font-semibold text-[var(--text)]">
          {copy.successTitle}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          {copy.successBody}
        </p>
        <button
          type="button"
          onClick={() => {
            setState("idle");
            setErrorDetail(null);
          }}
          className="mt-6 text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
        >
          {copy.submitAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
          >
            {copy.name} <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="mt-2 block w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/60 transition-[background-color,border-color,color] duration-200 ease-out focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder={copy.namePh}
            defaultValue={initialValues.name ?? ""}
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
          >
            {copy.email} <span className="text-[var(--accent)]">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 block w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder={copy.emailPh}
            defaultValue={initialValues.email ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-phone"
            className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
          >
            {copy.phone}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="mt-2 block w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder={copy.phonePh}
            defaultValue={initialValues.phone ?? ""}
          />
        </div>
        <div>
          <label
            htmlFor="contact-company"
            className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
          >
            {copy.company}
          </label>
          <input
            id="contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            className="mt-2 block w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder={copy.companyPh}
            defaultValue={initialValues.company ?? ""}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-serviceInterest"
          className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
        >
          {copy.interest}{" "}
          <span className="text-[var(--accent)]">*</span>
        </label>
        <select
          id="contact-serviceInterest"
          name="serviceInterest"
          required
          value={serviceInterest}
          onChange={(e) => setServiceInterest(e.target.value)}
          className="mt-2 block w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          <option value="">{copy.interestPlaceholder}</option>
          {copy.serviceInterestOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {qualificationPack ? (
        <div className="rounded-md border border-[color-mix(in_srgb,var(--accent)_22%,var(--border)_78%)] bg-[color-mix(in_srgb,var(--canvas)_92%,#000_8%)] p-5 sm:p-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            {copy.qualificationHeading}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)] sm:text-sm">
            {copy.qualificationIntro}
          </p>
          {qualificationPack.required.length > 0 ? (
            <div className="mt-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--text)]">
                {copy.qualificationRequiredHeading}
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--text-body)]">
                {qualificationPack.required.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]"
                      aria-hidden
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {qualificationPack.optional.length > 0 ? (
            <div className="mt-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--muted)]">
                {copy.qualificationOptionalHeading}
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                {qualificationPack.optional.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--border)]"
                      aria-hidden
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="contact-message"
          className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
        >
          {copy.message}{" "}
          <span className="text-[var(--accent)]">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className="mt-2 block w-full resize-y rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          placeholder={copy.messagePh}
          defaultValue={initialValues.message ?? ""}
        />
      </div>

      {state === "error" && (
        <p className="text-sm text-[var(--error)]">
          {copy.error}{" "}
          <a
            href="mailto:info@estio.org"
            className="font-medium underline underline-offset-4"
          >
            info@estio.org
          </a>
          {errorDetail ? (
            <span className="mt-1 block text-xs opacity-90">{errorDetail}</span>
          ) : null}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-fg)] shadow-sm transition-colors duration-200 ease-out hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)] disabled:opacity-60"
      >
        {state === "submitting" ? copy.sending : copy.submit}
      </button>
    </form>
  );
}
