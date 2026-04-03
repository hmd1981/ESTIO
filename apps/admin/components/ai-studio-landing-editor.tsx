"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getPublicApiBase } from "@/lib/api-base";
import { collectArabicLocaleWarnings } from "@/lib/locale-content-guard";
import { MediaPicker } from "@/components/media-picker";

const SLUG = "ai-studio";
const LOCALES = ["en", "ar"] as const;

type PageRow = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
  sections: unknown;
};

type OutputSampleState = { label: string; imageUrl: string; imageAlt: string };
type OfferCardState = {
  title: string;
  description: string;
  whatYouGetText: string;
  bestForText: string;
  typicalOutputs: string;
  href: string;
  cta: string;
  imageUrl: string;
  imageAlt: string;
  imageMediaAssetId: string;
};
type StepState = { step: string; description: string };
type PairState = { title: string; body: string };
type FaqState = { question: string; answer: string };

type MediaTarget =
  | { kind: "offer-card"; index: number }
  | { kind: "studio-output"; index: number }
  | { kind: "page-backdrop-video" }
  | { kind: "page-backdrop-poster" }
  | { kind: "hero-right-image" }
  | { kind: "hero-right-video" }
  | null;

/* ── Helpers ── */

function linesToItems(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function itemsToLines(items: string[] | undefined): string {
  return (items ?? []).join("\n");
}

function emptyOfferCard(): OfferCardState {
  return {
    title: "",
    description: "",
    whatYouGetText: "",
    bestForText: "",
    typicalOutputs: "",
    href: "",
    cta: "",
    imageUrl: "",
    imageAlt: "",
    imageMediaAssetId: "",
  };
}

function readOfferCard(
  raw: unknown,
  fallback: OfferCardState,
): OfferCardState {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const o = raw as Record<string, unknown>;
  const wyg = Array.isArray(o.whatYouGet)
    ? (o.whatYouGet as unknown[]).map(String)
    : [];
  const bf = Array.isArray(o.bestFor)
    ? (o.bestFor as unknown[]).map(String)
    : [];
  return {
    title: String(o.title ?? fallback.title),
    description: String(o.description ?? fallback.description),
    whatYouGetText: wyg.length ? itemsToLines(wyg) : fallback.whatYouGetText,
    bestForText: bf.length ? itemsToLines(bf) : fallback.bestForText,
    typicalOutputs: String(o.typicalOutputs ?? fallback.typicalOutputs),
    href: String(o.href ?? fallback.href),
    cta: String(o.cta ?? fallback.cta),
    imageUrl: String(o.imageUrl ?? fallback.imageUrl),
    imageAlt: String(o.imageAlt ?? fallback.imageAlt),
    imageMediaAssetId: String(
      o.imageMediaAssetId ?? fallback.imageMediaAssetId,
    ),
  };
}

function readOutputSample(raw: unknown): OutputSampleState {
  if (!raw || typeof raw !== "object")
    return { label: "", imageUrl: "", imageAlt: "" };
  const o = raw as Record<string, unknown>;
  return {
    label: String(o.label ?? ""),
    imageUrl: String(o.imageUrl ?? ""),
    imageAlt: String(o.imageAlt ?? ""),
  };
}

function buildPreviewUrl(locale: string) {
  const base = (
    process.env.NEXT_PUBLIC_WEB_URL ?? "http://127.0.0.1:3000"
  ).replace(/\/$/, "");
  const token = process.env.NEXT_PUBLIC_PREVIEW_TOKEN?.trim();
  const path = `/${locale}/${SLUG}`;
  const qs = new URLSearchParams();
  if (token) qs.set("previewToken", token);
  const q = qs.toString();
  return q ? `${base}${path}?${q}` : `${base}${path}`;
}

/* ── Shared sub-components ── */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-[var(--admin-muted)] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StatusDot({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider ${
        published
          ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/12 text-amber-600 dark:text-amber-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${published ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}

function EditorSection({
  num,
  title,
  helper,
  publicNote,
  open,
  onToggle,
  children,
}: {
  num: string;
  title: string;
  helper?: string;
  publicNote?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[var(--admin-row-hover)]"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--admin-primary)]/10 text-[0.6rem] font-bold tabular-nums text-[var(--admin-primary)]">
          {num}
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-[var(--admin-text)]">
            {title}
          </span>
          {helper && !open && (
            <span className="ms-2 text-xs text-[var(--admin-muted)]">
              — {helper}
            </span>
          )}
        </div>
        <Chevron open={open} />
      </button>
      {open && publicNote && (
        <div className="border-t border-[var(--admin-border)] bg-[var(--admin-row-header)] px-5 py-2">
          <p className="text-[0.65rem] leading-relaxed text-[var(--admin-muted)]">
            {publicNote}
          </p>
        </div>
      )}
      {open && (
        <div className="space-y-4 border-t border-[var(--admin-border)] px-5 py-5">
          {children}
        </div>
      )}
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">
      {children}
    </label>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ms-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[var(--admin-border)] text-xs text-[var(--admin-muted)] transition-colors hover:border-red-400 hover:text-red-400"
      title="Remove"
    >
      ×
    </button>
  );
}

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-dashed border-[var(--admin-border)] px-3 py-1.5 text-xs font-medium text-[var(--admin-primary)] transition-colors hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/5"
    >
      + {label}
    </button>
  );
}

const INPUT =
  "w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg,var(--admin-surface))] px-3 py-2 text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)]";
const TEXTAREA = `${INPUT} min-h-[4rem] resize-y`;
const TEXTAREA_SM = `${INPUT} min-h-[3rem] resize-y`;
const TEXTAREA_MONO = `${INPUT} min-h-[4rem] resize-y font-mono text-xs`;

/* ── Main editor ── */

export function AiStudioLandingEditor({ pageTitle }: { pageTitle: string }) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [activeLocale, setActiveLocale] =
    useState<(typeof LOCALES)[number]>("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Hero
  const [heroKicker, setHeroKicker] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroLead, setHeroLead] = useState("");
  const [primaryLabel, setPrimaryLabel] = useState("");
  const [primaryHref, setPrimaryHref] = useState("");
  const [secondaryLabel, setSecondaryLabel] = useState("");
  const [secondaryHref, setSecondaryHref] = useState("");

  // Full-page ambient video (looping background)
  const [backdropVideoUrl, setBackdropVideoUrl] = useState("");
  const [backdropVideoMediaAssetId, setBackdropVideoMediaAssetId] =
    useState("");
  const [backdropPosterUrl, setBackdropPosterUrl] = useState("");
  const [backdropPosterAlt, setBackdropPosterAlt] = useState("");
  const [backdropPosterMediaAssetId, setBackdropPosterMediaAssetId] =
    useState("");

  // Hero — right column (image and/or explicit video)
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroImageAlt, setHeroImageAlt] = useState("");
  const [heroImageMediaAssetId, setHeroImageMediaAssetId] = useState("");
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [heroVideoMediaAssetId, setHeroVideoMediaAssetId] = useState("");

  // Studio Outputs
  const [studioOutputsTitle, setStudioOutputsTitle] = useState("");
  const [studioOutputsSamples, setStudioOutputsSamples] = useState<
    OutputSampleState[]
  >([
    { label: "", imageUrl: "", imageAlt: "" },
    { label: "", imageUrl: "", imageAlt: "" },
    { label: "", imageUrl: "", imageAlt: "" },
  ]);

  // Separator
  const [separatorTitle, setSeparatorTitle] = useState("");
  const [separatorBody, setSeparatorBody] = useState("");

  // Value Props
  const [valueProps, setValueProps] = useState<PairState[]>([
    { title: "", body: "" },
    { title: "", body: "" },
    { title: "", body: "" },
  ]);

  // Offer Cards
  const [offerCards, setOfferCards] = useState<OfferCardState[]>([
    emptyOfferCard(),
    emptyOfferCard(),
    emptyOfferCard(),
  ]);

  // Deliverables Snapshot
  const [deliverablesTitle, setDeliverablesTitle] = useState("");
  const [deliverablesItems, setDeliverablesItems] = useState<string[]>([""]);

  // Who This Is For
  const [whoTitle, setWhoTitle] = useState("");
  const [fitTitle, setFitTitle] = useState("");
  const [fitItemsText, setFitItemsText] = useState("");
  const [notFitTitle, setNotFitTitle] = useState("");
  const [notFitItemsText, setNotFitItemsText] = useState("");

  // How Delivery Works
  const [howTitle, setHowTitle] = useState("");
  const [howSteps, setHowSteps] = useState<StepState[]>([]);

  // Why Different
  const [whyTitle, setWhyTitle] = useState("");
  const [whyItems, setWhyItems] = useState<PairState[]>([]);

  // Bottom CTA
  const [ctaHeadline, setCtaHeadline] = useState("");
  const [ctaBody, setCtaBody] = useState("");
  const [ctaButton, setCtaButton] = useState("");
  const [ctaHref, setCtaHref] = useState("");

  // FAQ
  const [faqTitle, setFaqTitle] = useState("");
  const [faqItems, setFaqItems] = useState<FaqState[]>([]);

  // Media picker
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget>(null);

  // Section collapse state
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(["page-backdrop", "hero", "offer-cards"]),
  );
  const [openCards, setOpenCards] = useState<Set<number>>(
    () => new Set([0]),
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () =>
    setOpenSections(
      new Set([
        "page-backdrop",
        "seo",
        "hero",
        "outputs",
        "separator",
        "value-props",
        "offer-cards",
        "deliverables",
        "how-delivery",
        "who",
        "why-different",
        "cta",
        "faq",
      ]),
    );
  const collapseAll = () => setOpenSections(new Set());

  const toggleCard = (i: number) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  /* ── Data loading ── */

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${getPublicApiBase()}/pages`);
      setPages(r.ok ? ((await r.json()) as PageRow[]) : []);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const page = useMemo(
    () => pages.find((p) => p.slug === SLUG && p.locale === activeLocale),
    [pages, activeLocale],
  );

  const enPage = useMemo(
    () => pages.find((p) => p.slug === SLUG && p.locale === "en"),
    [pages],
  );
  const arPage = useMemo(
    () => pages.find((p) => p.slug === SLUG && p.locale === "ar"),
    [pages],
  );

  /* ── Hydrate ── */

  const hydrateFromPage = useCallback(() => {
    const sections = (page?.sections ?? {}) as Record<string, unknown>;
    const ai = (sections.aiStudio ?? {}) as Record<string, unknown>;
    const hero = (ai.hero ?? {}) as Record<string, unknown>;
    const pc = (hero.primaryCta ?? {}) as Record<string, unknown>;
    const sc = (hero.secondaryCta ?? {}) as Record<string, unknown>;

    setSeoTitle(
      String(sections.seoTitle ?? page?.metaTitle ?? "").trim(),
    );
    setSeoDescription(
      String(sections.seoDescription ?? page?.metaDescription ?? "").trim(),
    );
    setPublished(page?.status === "PUBLISHED");

    setHeroKicker(String(hero.kicker ?? ""));
    setHeroHeadline(String(hero.headline ?? ""));
    setHeroLead(String(hero.lead ?? ""));
    setPrimaryLabel(String(pc.label ?? ""));
    setPrimaryHref(String(pc.href ?? ""));
    setSecondaryLabel(String(sc.label ?? ""));
    setSecondaryHref(String(sc.href ?? ""));

    setHeroImageUrl(String(hero.imageUrl ?? ""));
    setHeroImageAlt(String(hero.imageAlt ?? ""));
    setHeroImageMediaAssetId(String(hero.imageMediaAssetId ?? ""));
    setHeroVideoUrl(String(hero.videoUrl ?? ""));
    setHeroVideoMediaAssetId(String(hero.videoMediaAssetId ?? ""));

    const pbd = (ai.pageBackdrop ?? {}) as Record<string, unknown>;
    setBackdropVideoUrl(String(pbd.videoUrl ?? ""));
    setBackdropVideoMediaAssetId(String(pbd.videoMediaAssetId ?? ""));
    setBackdropPosterUrl(String(pbd.posterUrl ?? ""));
    setBackdropPosterAlt(String(pbd.posterAlt ?? ""));
    setBackdropPosterMediaAssetId(String(pbd.posterMediaAssetId ?? ""));

    const so = (ai.studioOutputs ?? {}) as Record<string, unknown>;
    setStudioOutputsTitle(String(so.title ?? ""));
    const samples = Array.isArray(so.samples) ? so.samples : [];
    setStudioOutputsSamples(
      [0, 1, 2].map((i) => readOutputSample(samples[i])),
    );

    const sep = (ai.separator ?? {}) as Record<string, unknown>;
    setSeparatorTitle(String(sep.title ?? ""));
    setSeparatorBody(String(sep.body ?? ""));

    const vps = Array.isArray(ai.valueProps) ? ai.valueProps : [];
    setValueProps(
      [0, 1, 2].map((i) => {
        const row = vps[i] as Record<string, unknown> | undefined;
        return {
          title: String(row?.title ?? ""),
          body: String(row?.body ?? ""),
        };
      }),
    );

    const oc = Array.isArray(ai.offerCards) ? ai.offerCards : [];
    const fb = emptyOfferCard();
    setOfferCards([0, 1, 2].map((i) => readOfferCard(oc[i], fb)));

    const ds = (ai.deliverablesSnapshot ?? {}) as Record<string, unknown>;
    setDeliverablesTitle(String(ds.title ?? ""));
    const dsItems = Array.isArray(ds.items) ? (ds.items as string[]) : [];
    setDeliverablesItems(dsItems.length ? dsItems : [""]);

    const w = (ai.whoThisIsFor ?? {}) as Record<string, unknown>;
    const fit = (w.fit ?? {}) as Record<string, unknown>;
    const nf = (w.notFit ?? {}) as Record<string, unknown>;
    setWhoTitle(String(w.title ?? ""));
    setFitTitle(String(fit.title ?? ""));
    setFitItemsText(
      Array.isArray(fit.items) ? itemsToLines(fit.items as string[]) : "",
    );
    setNotFitTitle(String(nf.title ?? ""));
    setNotFitItemsText(
      Array.isArray(nf.items) ? itemsToLines(nf.items as string[]) : "",
    );

    const hd = (ai.howDeliveryWorks ?? {}) as Record<string, unknown>;
    setHowTitle(String(hd.title ?? ""));
    const steps = Array.isArray(hd.steps) ? hd.steps : [];
    setHowSteps(
      steps.length
        ? (steps as unknown[]).map((s) => {
            const o = s as Record<string, unknown>;
            return {
              step: String(o.step ?? ""),
              description: String(o.description ?? ""),
            };
          })
        : [{ step: "", description: "" }],
    );

    const wd = (ai.whyDifferent ?? {}) as Record<string, unknown>;
    setWhyTitle(String(wd.title ?? ""));
    const wi = Array.isArray(wd.items) ? wd.items : [];
    setWhyItems(
      wi.length
        ? (wi as unknown[]).map((x) => {
            const o = x as Record<string, unknown>;
            return {
              title: String(o.title ?? ""),
              body: String(o.body ?? ""),
            };
          })
        : [{ title: "", body: "" }],
    );

    const c = (ai.cta ?? {}) as Record<string, unknown>;
    setCtaHeadline(String(c.headline ?? ""));
    setCtaBody(String(c.body ?? ""));
    setCtaButton(String(c.buttonLabel ?? ""));
    setCtaHref(String(c.href ?? ""));

    const fq = (ai.faq ?? {}) as Record<string, unknown>;
    setFaqTitle(String(fq.title ?? ""));
    const fi = Array.isArray(fq.items) ? fq.items : [];
    setFaqItems(
      fi.length
        ? (fi as unknown[]).map((x) => {
            const o = x as Record<string, unknown>;
            return {
              question: String(o.question ?? ""),
              answer: String(o.answer ?? ""),
            };
          })
        : [{ question: "", answer: "" }],
    );
  }, [page]);

  useEffect(() => {
    hydrateFromPage();
  }, [hydrateFromPage]);

  /* ── Ensure rows exist ── */

  const ensure = async () => {
    setStatus(null);
    for (const loc of LOCALES) {
      const exists = pages.some((p) => p.slug === SLUG && p.locale === loc);
      if (exists) continue;
      const r = await fetch(`${getPublicApiBase()}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: SLUG,
          locale: loc,
          title: loc === "ar" ? "\u0627\u0633\u062a\u0648\u062f\u064a\u0648 \u0627\u0644\u0630\u0643\u0627\u0621" : "AI Studio",
          status: "DRAFT",
          sections: {},
        }),
      });
      if (!r.ok) {
        setStatus(`Create failed (${loc}): ${await r.text()}`);
        return;
      }
    }
    setStatus("Draft rows created for EN and AR.");
    await load();
  };

  /* ── Save ── */

  const save = async () => {
    if (!page) return;
    setStatus(null);
    setSaving(true);

    const aiStudio = {
      pageBackdrop: {
        ...(backdropVideoUrl.trim()
          ? { videoUrl: backdropVideoUrl.trim() }
          : {}),
        ...(backdropVideoMediaAssetId.trim()
          ? { videoMediaAssetId: backdropVideoMediaAssetId.trim() }
          : {}),
        ...(backdropPosterUrl.trim()
          ? { posterUrl: backdropPosterUrl.trim() }
          : {}),
        ...(backdropPosterAlt.trim()
          ? { posterAlt: backdropPosterAlt.trim() }
          : {}),
        ...(backdropPosterMediaAssetId.trim()
          ? { posterMediaAssetId: backdropPosterMediaAssetId.trim() }
          : {}),
      },
      hero: {
        kicker: heroKicker.trim(),
        headline: heroHeadline.trim(),
        lead: heroLead.trim(),
        primaryCta: {
          label: primaryLabel.trim(),
          href: primaryHref.trim(),
        },
        secondaryCta: {
          label: secondaryLabel.trim(),
          href: secondaryHref.trim(),
        },
        ...(heroImageUrl.trim() ? { imageUrl: heroImageUrl.trim() } : {}),
        ...(heroImageAlt.trim() ? { imageAlt: heroImageAlt.trim() } : {}),
        ...(heroImageMediaAssetId.trim()
          ? { imageMediaAssetId: heroImageMediaAssetId.trim() }
          : {}),
        ...(heroVideoUrl.trim() ? { videoUrl: heroVideoUrl.trim() } : {}),
        ...(heroVideoMediaAssetId.trim()
          ? { videoMediaAssetId: heroVideoMediaAssetId.trim() }
          : {}),
      },
      studioOutputs: {
        title: studioOutputsTitle.trim(),
        samples: studioOutputsSamples.map((s) => ({
          label: s.label.trim(),
          imageUrl: s.imageUrl.trim(),
          imageAlt: s.imageAlt.trim(),
        })),
      },
      separator: {
        title: separatorTitle.trim(),
        body: separatorBody.trim(),
      },
      valueProps: valueProps.map((v) => ({
        title: v.title.trim(),
        body: v.body.trim(),
      })),
      offerCards: offerCards.map((c) => ({
        title: c.title.trim(),
        description: c.description.trim(),
        whatYouGet: linesToItems(c.whatYouGetText),
        bestFor: linesToItems(c.bestForText),
        typicalOutputs: c.typicalOutputs.trim(),
        href: c.href.trim(),
        cta: c.cta.trim(),
        ...(c.imageUrl.trim() ? { imageUrl: c.imageUrl.trim() } : {}),
        ...(c.imageAlt.trim() ? { imageAlt: c.imageAlt.trim() } : {}),
        ...(c.imageMediaAssetId.trim()
          ? { imageMediaAssetId: c.imageMediaAssetId.trim() }
          : {}),
      })),
      deliverablesSnapshot: {
        title: deliverablesTitle.trim(),
        items: deliverablesItems.map((s) => s.trim()).filter(Boolean),
      },
      whoThisIsFor: {
        title: whoTitle.trim(),
        fit: {
          title: fitTitle.trim(),
          items: linesToItems(fitItemsText),
        },
        notFit: {
          title: notFitTitle.trim(),
          items: linesToItems(notFitItemsText),
        },
      },
      howDeliveryWorks: {
        title: howTitle.trim(),
        steps: howSteps
          .filter((s) => s.step.trim() || s.description.trim())
          .map((s) => ({
            step: s.step.trim(),
            description: s.description.trim(),
          })),
      },
      whyDifferent: {
        title: whyTitle.trim(),
        items: whyItems
          .filter((x) => x.title.trim() || x.body.trim())
          .map((x) => ({
            title: x.title.trim(),
            body: x.body.trim(),
          })),
      },
      cta: {
        headline: ctaHeadline.trim(),
        body: ctaBody.trim(),
        buttonLabel: ctaButton.trim(),
        href: ctaHref.trim(),
      },
      faq: {
        title: faqTitle.trim(),
        items: faqItems
          .filter((f) => f.question.trim() || f.answer.trim())
          .map((f) => ({
            question: f.question.trim(),
            answer: f.answer.trim(),
          })),
      },
    };

    const sectionsPayload = {
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      aiStudio,
    };

    try {
      const r = await fetch(`${getPublicApiBase()}/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageTitle,
          metaTitle: seoTitle.trim() || undefined,
          metaDescription: seoDescription.trim() || undefined,
          sections: sectionsPayload,
          status: published ? "PUBLISHED" : "DRAFT",
        }),
      });
      if (!r.ok) {
        setStatus(`Save failed: ${(await r.text()).slice(0, 240)}`);
        return;
      }
      setStatus(`Saved ${activeLocale.toUpperCase()} successfully.`);
      await load();
    } finally {
      setSaving(false);
    }
  };

  /* ── Arabic warnings ── */

  const arWarnings = useMemo(() => {
    if (activeLocale !== "ar") return [];
    const fields: { label: string; value: string }[] = [
      { label: "SEO title", value: seoTitle },
      { label: "SEO description", value: seoDescription },
      { label: "Hero kicker", value: heroKicker },
      { label: "Hero headline", value: heroHeadline },
      { label: "Hero lead", value: heroLead },
      { label: "Primary CTA label", value: primaryLabel },
      { label: "Secondary CTA label", value: secondaryLabel },
      { label: "Studio outputs title", value: studioOutputsTitle },
      { label: "Separator title", value: separatorTitle },
      { label: "Separator body", value: separatorBody },
      ...valueProps.flatMap((v, i) => [
        { label: `Value prop ${i + 1} title`, value: v.title },
        { label: `Value prop ${i + 1} body`, value: v.body },
      ]),
      ...offerCards.flatMap((c, i) => [
        { label: `Offer ${i + 1} title`, value: c.title },
        { label: `Offer ${i + 1} description`, value: c.description },
      ]),
      { label: "Deliverables title", value: deliverablesTitle },
      { label: "Who this is for \u2014 title", value: whoTitle },
      { label: "Fit \u2014 title", value: fitTitle },
      { label: "Not fit \u2014 title", value: notFitTitle },
      { label: "How delivery \u2014 title", value: howTitle },
      { label: "Why different \u2014 title", value: whyTitle },
      { label: "Bottom CTA headline", value: ctaHeadline },
      { label: "Bottom CTA body", value: ctaBody },
      { label: "FAQ title", value: faqTitle },
    ];
    return collectArabicLocaleWarnings(fields);
  }, [
    activeLocale,
    seoTitle,
    seoDescription,
    heroKicker,
    heroHeadline,
    heroLead,
    primaryLabel,
    secondaryLabel,
    studioOutputsTitle,
    separatorTitle,
    separatorBody,
    valueProps,
    offerCards,
    deliverablesTitle,
    whoTitle,
    fitTitle,
    notFitTitle,
    howTitle,
    whyTitle,
    ctaHeadline,
    ctaBody,
    faqTitle,
  ]);

  /* ── Repeatable-item helpers ── */

  const updateOfferCard = (i: number, patch: Partial<OfferCardState>) => {
    const next = [...offerCards];
    next[i] = { ...next[i], ...patch };
    setOfferCards(next);
  };

  const updateSample = (i: number, patch: Partial<OutputSampleState>) => {
    const next = [...studioOutputsSamples];
    next[i] = { ...next[i], ...patch };
    setStudioOutputsSamples(next);
  };

  const removeAt = <T,>(arr: T[], i: number, setter: (a: T[]) => void) => {
    if (arr.length <= 1) return;
    setter(arr.filter((_, idx) => idx !== i));
  };

  /* ── Loading state ── */

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-[var(--admin-muted)]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--admin-muted)] border-t-transparent" />
        Loading editor…
      </div>
    );
  }

  const missing = !LOCALES.every((loc) =>
    pages.some((p) => p.slug === SLUG && p.locale === loc),
  );

  const OFFER_LABELS = [
    "AI Image Production",
    "AI Video Production",
    "Brand AI Packs",
  ];

  /* ── Render ── */

  return (
    <div className="max-w-4xl pb-12">
      {/* ── Setup banner ── */}
      {missing && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/8 px-5 py-4">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            CMS rows for EN and/or AR do not exist yet.
          </p>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Create them to start editing content. Both locales will be
            created as drafts.
          </p>
          <button
            type="button"
            className="mt-3 rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--admin-primary-hover)]"
            onClick={() => void ensure()}
          >
            Create AI Studio pages (EN + AR)
          </button>
        </div>
      )}

      {/* ── Sticky control bar ── */}
      <div className="sticky top-0 z-20 -mx-1 mb-6 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Locale tabs */}
          <div className="flex items-center gap-1 rounded-md bg-[var(--admin-row-header)] p-0.5">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  activeLocale === loc
                    ? "bg-[var(--admin-primary)] text-white shadow-sm"
                    : "text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                }`}
                onClick={() => setActiveLocale(loc)}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Locale status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-[var(--admin-muted)]">EN</span>
              {enPage ? (
                <StatusDot published={enPage.status === "PUBLISHED"} />
              ) : (
                <span className="text-[var(--admin-muted)]">—</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-[var(--admin-muted)]">AR</span>
              {arPage ? (
                <StatusDot published={arPage.status === "PUBLISHED"} />
              ) : (
                <span className="text-[var(--admin-muted)]">—</span>
              )}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Publish toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--admin-text)]">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--admin-primary)]"
            />
            Publish on save
          </label>

          {/* Save button */}
          <button
            type="button"
            className="rounded-md bg-[var(--admin-primary)] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--admin-primary-hover)] disabled:opacity-50"
            disabled={!page || saving}
            onClick={() => void save()}
          >
            {saving ? "Saving…" : `Save ${activeLocale.toUpperCase()}`}
          </button>

          {/* Preview */}
          <a
            href={buildPreviewUrl(activeLocale)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline"
          >
            Preview →
          </a>
        </div>

        {/* Status message */}
        {status && (
          <p
            className={`mt-2 text-xs ${status.startsWith("Save failed") ? "text-red-500" : "text-emerald-500"}`}
          >
            {status}
          </p>
        )}
      </div>

      {/* ── Arabic warnings ── */}
      {arWarnings.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/5 px-5 py-3">
          <p className="mb-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            Arabic locale warnings
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-amber-700 dark:text-amber-300">
            {arWarnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Section controls ── */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-[var(--admin-muted)]">
          Editing{" "}
          <strong className="text-[var(--admin-text)]">
            {activeLocale.toUpperCase()}
          </strong>{" "}
          content for{" "}
          <code className="rounded bg-[var(--admin-row-header)] px-1 py-0.5 font-mono text-[0.65rem]">
            /{activeLocale}/ai-studio
          </code>
        </p>
        <div className="flex gap-2 text-[0.65rem]">
          <button
            type="button"
            onClick={expandAll}
            className="text-[var(--admin-primary)] hover:underline"
          >
            Expand all
          </button>
          <span className="text-[var(--admin-border)]">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[var(--admin-primary)] hover:underline"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="space-y-3">
        {/* Ambient backdrop */}
        <EditorSection
          num="BG"
          title="Full-page backdrop video"
          helper="Optional looping video behind the entire page"
          publicNote="Muted, looping, inline. Prefer a short compressed MP4/WebM. “Reduce motion” shows the poster only. Hero right column is configured below."
          open={openSections.has("page-backdrop")}
          onToggle={() => toggleSection("page-backdrop")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel>Backdrop video URL</FieldLabel>
              <input
                className={INPUT}
                value={backdropVideoUrl}
                onChange={(e) => setBackdropVideoUrl(e.target.value)}
                placeholder="https://…/ambient-loop.mp4"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Backdrop video — library id (optional)</FieldLabel>
              <input
                className={INPUT}
                value={backdropVideoMediaAssetId}
                onChange={(e) => setBackdropVideoMediaAssetId(e.target.value)}
                placeholder="Media asset UUID"
              />
              <button
                type="button"
                className="mt-2 w-full rounded-md border border-[var(--admin-border)] py-1.5 text-xs font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-row-hover)]"
                onClick={() => {
                  setMediaTarget({ kind: "page-backdrop-video" });
                  setMediaPickerOpen(true);
                }}
              >
                Pick video from library
              </button>
            </div>
            <div>
              <FieldLabel>Poster / fallback image URL</FieldLabel>
              <input
                className={INPUT}
                value={backdropPosterUrl}
                onChange={(e) => setBackdropPosterUrl(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Poster alt text</FieldLabel>
              <input
                className={INPUT}
                value={backdropPosterAlt}
                onChange={(e) => setBackdropPosterAlt(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Poster — library id (optional)</FieldLabel>
              <input
                className={INPUT}
                value={backdropPosterMediaAssetId}
                onChange={(e) => setBackdropPosterMediaAssetId(e.target.value)}
              />
              <button
                type="button"
                className="mt-2 w-full rounded-md border border-[var(--admin-border)] py-1.5 text-xs font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-row-hover)]"
                onClick={() => {
                  setMediaTarget({ kind: "page-backdrop-poster" });
                  setMediaPickerOpen(true);
                }}
              >
                Pick poster from library
              </button>
            </div>
          </div>
        </EditorSection>

        {/* 00 · SEO */}
        <EditorSection
          num="00"
          title="SEO"
          helper="Meta title and description for search engines"
          publicNote="These values appear in browser tabs and search results. Leave blank to use defaults."
          open={openSections.has("seo")}
          onToggle={() => toggleSection("seo")}
        >
          <div>
            <FieldLabel>Meta title</FieldLabel>
            <input
              className={INPUT}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="AI Studio — ESTIO"
            />
          </div>
          <div>
            <FieldLabel>Meta description</FieldLabel>
            <textarea
              className={TEXTAREA_SM}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Short description for search engines…"
            />
          </div>
        </EditorSection>

        {/* 01 · Hero */}
        <EditorSection
          num="01"
          title="Hero"
          helper="Main headline and CTAs at the top of the page"
          publicNote="The first thing visitors see. Keep the headline clear and the lead text concise."
          open={openSections.has("hero")}
          onToggle={() => toggleSection("hero")}
        >
          <div>
            <FieldLabel>Kicker</FieldLabel>
            <input
              className={INPUT}
              value={heroKicker}
              onChange={(e) => setHeroKicker(e.target.value)}
              placeholder="Small text above the headline"
            />
          </div>
          <div>
            <FieldLabel>Headline</FieldLabel>
            <input
              className={INPUT}
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              placeholder="Main hero headline"
            />
          </div>
          <div>
            <FieldLabel>Lead text</FieldLabel>
            <textarea
              className={TEXTAREA}
              value={heroLead}
              onChange={(e) => setHeroLead(e.target.value)}
              placeholder="Supporting paragraph below the headline"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Primary CTA label</FieldLabel>
              <input
                className={INPUT}
                value={primaryLabel}
                onChange={(e) => setPrimaryLabel(e.target.value)}
                placeholder="e.g. Request a studio scope"
              />
            </div>
            <div>
              <FieldLabel>Primary CTA link</FieldLabel>
              <input
                className={INPUT}
                value={primaryHref}
                onChange={(e) => setPrimaryHref(e.target.value)}
                placeholder="/contact or #section-id"
              />
            </div>
            <div>
              <FieldLabel>Secondary CTA label</FieldLabel>
              <input
                className={INPUT}
                value={secondaryLabel}
                onChange={(e) => setSecondaryLabel(e.target.value)}
                placeholder="e.g. See deliverables"
              />
            </div>
            <div>
              <FieldLabel>Secondary CTA link</FieldLabel>
              <input
                className={INPUT}
                value={secondaryHref}
                onChange={(e) => setSecondaryHref(e.target.value)}
                placeholder="#deliverables"
              />
            </div>
          </div>

          <div className="border-t border-[var(--admin-border)] pt-4">
            <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
              Right column — image or video
            </p>
            <p className="mb-3 text-[0.65rem] leading-relaxed text-[var(--admin-muted)]">
              Assign a still image, a video file in the image slot, or set an
              explicit hero video (wins over the image slot). With a looping
              hero video, add a still in the image fields to use as{" "}
              <span className="font-mono">poster</span>.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Hero image URL</FieldLabel>
                <input
                  className={INPUT}
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Hero image alt</FieldLabel>
                <input
                  className={INPUT}
                  value={heroImageAlt}
                  onChange={(e) => setHeroImageAlt(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Hero image — library id</FieldLabel>
                <input
                  className={INPUT}
                  value={heroImageMediaAssetId}
                  onChange={(e) => setHeroImageMediaAssetId(e.target.value)}
                />
                <button
                  type="button"
                  className="mt-2 w-full rounded-md border border-[var(--admin-border)] py-1.5 text-xs font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-row-hover)]"
                  onClick={() => {
                    setMediaTarget({ kind: "hero-right-image" });
                    setMediaPickerOpen(true);
                  }}
                >
                  Pick image (or video-as-slot) from library
                </button>
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Explicit hero video URL (optional)</FieldLabel>
                <input
                  className={INPUT}
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="Overrides video assigned only via image slot"
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Explicit hero video — library id</FieldLabel>
                <input
                  className={INPUT}
                  value={heroVideoMediaAssetId}
                  onChange={(e) => setHeroVideoMediaAssetId(e.target.value)}
                />
                <button
                  type="button"
                  className="mt-2 w-full rounded-md border border-[var(--admin-border)] py-1.5 text-xs font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-row-hover)]"
                  onClick={() => {
                    setMediaTarget({ kind: "hero-right-video" });
                    setMediaPickerOpen(true);
                  }}
                >
                  Pick hero video from library
                </button>
              </div>
            </div>
          </div>
        </EditorSection>

        {/* 02 · Studio Outputs */}
        <EditorSection
          num="02"
          title="Selected studio outputs"
          helper="Visual gallery showcasing 3 sample outputs"
          publicNote="Displayed as a 3-column image grid right after the hero. Use high-quality images that represent real studio work."
          open={openSections.has("outputs")}
          onToggle={() => toggleSection("outputs")}
        >
          <div>
            <FieldLabel>Section title</FieldLabel>
            <input
              className={INPUT}
              value={studioOutputsTitle}
              onChange={(e) => setStudioOutputsTitle(e.target.value)}
              placeholder="e.g. Selected studio outputs"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {studioOutputsSamples.map((s, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg border border-[var(--admin-border)]"
              >
                {/* Image preview */}
                <div className="relative aspect-[16/10] w-full bg-[var(--admin-row-header)]">
                  {s.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.imageUrl}
                      alt={s.imageAlt || `Sample ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[var(--admin-muted)]">
                      No image
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <div>
                    <FieldLabel>Label</FieldLabel>
                    <input
                      className={INPUT}
                      value={s.label}
                      onChange={(e) =>
                        updateSample(i, { label: e.target.value })
                      }
                      placeholder={`Sample ${i + 1}`}
                    />
                  </div>
                  <div>
                    <FieldLabel>Image URL</FieldLabel>
                    <input
                      className={INPUT}
                      value={s.imageUrl}
                      onChange={(e) =>
                        updateSample(i, { imageUrl: e.target.value })
                      }
                      placeholder="/ai-studio/sample.jpg"
                    />
                  </div>
                  <div>
                    <FieldLabel>Alt text</FieldLabel>
                    <input
                      className={INPUT}
                      value={s.imageAlt}
                      onChange={(e) =>
                        updateSample(i, { imageAlt: e.target.value })
                      }
                      placeholder="Describe the image"
                    />
                  </div>
                  <button
                    type="button"
                    className="w-full rounded-md border border-[var(--admin-border)] py-1.5 text-xs font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-row-hover)]"
                    onClick={() => {
                      setMediaTarget({ kind: "studio-output", index: i });
                      setMediaPickerOpen(true);
                    }}
                  >
                    Pick from library
                  </button>
                </div>
              </div>
            ))}
          </div>
        </EditorSection>

        {/* 03 · Separator */}
        <EditorSection
          num="03"
          title="AI Studio vs Creative Services"
          helper="Short clarification separating studio services from enterprise AI"
          publicNote="A brief distinction shown between the visual gallery and the offer cards. Helps buyers understand what AI Studio covers."
          open={openSections.has("separator")}
          onToggle={() => toggleSection("separator")}
        >
          <div>
            <FieldLabel>Title</FieldLabel>
            <input
              className={INPUT}
              value={separatorTitle}
              onChange={(e) => setSeparatorTitle(e.target.value)}
              placeholder="e.g. AI Studio vs AI Creative Services"
            />
          </div>
          <div>
            <FieldLabel>Body</FieldLabel>
            <textarea
              className={TEXTAREA}
              value={separatorBody}
              onChange={(e) => setSeparatorBody(e.target.value)}
              placeholder="Explain the distinction…"
            />
          </div>
        </EditorSection>

        {/* 04 · Value Props */}
        <EditorSection
          num="04"
          title="Value propositions"
          helper="Three key benefits displayed in columns"
          publicNote="Rendered as 3 equal columns below the separator. Each has a title and short body."
          open={openSections.has("value-props")}
          onToggle={() => toggleSection("value-props")}
        >
          {valueProps.map((vp, i) => (
            <div
              key={i}
              className={`grid gap-3 sm:grid-cols-[1fr_2fr] ${i > 0 ? "border-t border-[var(--admin-border)] pt-4" : ""}`}
            >
              <div>
                <FieldLabel>Title {i + 1}</FieldLabel>
                <input
                  className={INPUT}
                  value={vp.title}
                  onChange={(e) => {
                    const next = [...valueProps];
                    next[i] = { ...next[i], title: e.target.value };
                    setValueProps(next);
                  }}
                />
              </div>
              <div>
                <FieldLabel>Body {i + 1}</FieldLabel>
                <textarea
                  className={TEXTAREA_SM}
                  value={vp.body}
                  onChange={(e) => {
                    const next = [...valueProps];
                    next[i] = { ...next[i], body: e.target.value };
                    setValueProps(next);
                  }}
                />
              </div>
            </div>
          ))}
        </EditorSection>

        {/* 05 · Offer Cards */}
        <EditorSection
          num="05"
          title="Offer cards"
          helper="The 3 main AI Studio services"
          publicNote="Three offer cards displayed prominently on the landing page. Each links to its own detail page."
          open={openSections.has("offer-cards")}
          onToggle={() => toggleSection("offer-cards")}
        >
          <div className="space-y-3">
            {offerCards.map((card, i) => {
              const cardOpen = openCards.has(i);
              const cardTitle =
                card.title || OFFER_LABELS[i] || `Card ${i + 1}`;
              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-[var(--admin-border)]"
                >
                  {/* Card header */}
                  <button
                    type="button"
                    onClick={() => toggleCard(i)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--admin-row-hover)]"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--admin-primary)]/8 text-[0.55rem] font-bold text-[var(--admin-primary)]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-[var(--admin-text)]">
                        {cardTitle}
                      </span>
                      {card.description && !cardOpen && (
                        <span className="ms-2 truncate text-xs text-[var(--admin-muted)]">
                          — {card.description.slice(0, 60)}
                          {card.description.length > 60 ? "…" : ""}
                        </span>
                      )}
                    </div>
                    {card.imageUrl && (
                      <span className="hidden shrink-0 text-[0.6rem] text-emerald-500 sm:inline">
                        Has image
                      </span>
                    )}
                    <Chevron open={cardOpen} />
                  </button>

                  {/* Card fields */}
                  {cardOpen && (
                    <div className="space-y-4 border-t border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <FieldLabel>Title</FieldLabel>
                          <input
                            className={INPUT}
                            value={card.title}
                            onChange={(e) =>
                              updateOfferCard(i, { title: e.target.value })
                            }
                            placeholder={OFFER_LABELS[i]}
                          />
                        </div>
                        <div>
                          <FieldLabel>CTA label</FieldLabel>
                          <input
                            className={INPUT}
                            value={card.cta}
                            onChange={(e) =>
                              updateOfferCard(i, { cta: e.target.value })
                            }
                            placeholder="See what's included"
                          />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Description</FieldLabel>
                        <textarea
                          className={TEXTAREA_SM}
                          value={card.description}
                          onChange={(e) =>
                            updateOfferCard(i, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Short summary of this offer…"
                        />
                      </div>
                      <div>
                        <FieldLabel>
                          What you get{" "}
                          <span className="font-normal text-[var(--admin-placeholder)]">
                            (one item per line)
                          </span>
                        </FieldLabel>
                        <textarea
                          className={TEXTAREA_MONO}
                          value={card.whatYouGetText}
                          onChange={(e) =>
                            updateOfferCard(i, {
                              whatYouGetText: e.target.value,
                            })
                          }
                          placeholder={"Campaign-ready images\nBrand-aligned outputs\nRevision rounds included"}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <FieldLabel>
                            Best for{" "}
                            <span className="font-normal text-[var(--admin-placeholder)]">
                              (one per line)
                            </span>
                          </FieldLabel>
                          <textarea
                            className={TEXTAREA_MONO}
                            value={card.bestForText}
                            onChange={(e) =>
                              updateOfferCard(i, {
                                bestForText: e.target.value,
                              })
                            }
                            placeholder={"Brands\nStartups\nAgencies"}
                          />
                        </div>
                        <div>
                          <FieldLabel>Typical outputs</FieldLabel>
                          <input
                            className={INPUT}
                            value={card.typicalOutputs}
                            onChange={(e) =>
                              updateOfferCard(i, {
                                typicalOutputs: e.target.value,
                              })
                            }
                            placeholder="e.g. 10–50+ images per engagement"
                          />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Link (href)</FieldLabel>
                        <input
                          className={INPUT}
                          value={card.href}
                          onChange={(e) =>
                            updateOfferCard(i, { href: e.target.value })
                          }
                          placeholder="/ai-studio/image-production"
                        />
                      </div>

                      {/* Image */}
                      <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
                        <FieldLabel>Card image</FieldLabel>
                        <div className="mt-1 flex items-start gap-3">
                          {card.imageUrl ? (
                            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-[var(--admin-row-header)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={card.imageUrl}
                                alt={card.imageAlt || "Card image"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded bg-[var(--admin-row-header)] text-[0.6rem] text-[var(--admin-muted)]">
                              No image
                            </div>
                          )}
                          <div className="min-w-0 flex-1 space-y-2">
                            <input
                              className={INPUT}
                              value={card.imageUrl}
                              onChange={(e) =>
                                updateOfferCard(i, {
                                  imageUrl: e.target.value,
                                })
                              }
                              placeholder="Image URL"
                            />
                            <input
                              className={INPUT}
                              value={card.imageAlt}
                              onChange={(e) =>
                                updateOfferCard(i, {
                                  imageAlt: e.target.value,
                                })
                              }
                              placeholder="Alt text"
                            />
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            className="rounded-md border border-[var(--admin-border)] px-3 py-1.5 text-xs font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-row-hover)]"
                            onClick={() => {
                              setMediaTarget({
                                kind: "offer-card",
                                index: i,
                              });
                              setMediaPickerOpen(true);
                            }}
                          >
                            Pick from library
                          </button>
                          {card.imageMediaAssetId && (
                            <span className="self-center text-[0.6rem] text-[var(--admin-muted)]">
                              Asset: {card.imageMediaAssetId.slice(0, 8)}…
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </EditorSection>

        {/* 06 · Deliverables Snapshot */}
        <EditorSection
          num="06"
          title="Deliverables snapshot"
          helper="Compact list of what buyers receive"
          publicNote="A bullet-point section summarising deliverables across all engagement types."
          open={openSections.has("deliverables")}
          onToggle={() => toggleSection("deliverables")}
        >
          <div>
            <FieldLabel>Section title</FieldLabel>
            <input
              className={INPUT}
              value={deliverablesTitle}
              onChange={(e) => setDeliverablesTitle(e.target.value)}
              placeholder="e.g. What you receive"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>
              Deliverable items{" "}
              <span className="font-normal text-[var(--admin-placeholder)]">
                ({deliverablesItems.filter((s) => s.trim()).length} items)
              </span>
            </FieldLabel>
            {deliverablesItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-right text-[0.6rem] tabular-nums text-[var(--admin-muted)]">
                  {i + 1}
                </span>
                <input
                  className={`${INPUT} flex-1`}
                  value={item}
                  onChange={(e) => {
                    const next = [...deliverablesItems];
                    next[i] = e.target.value;
                    setDeliverablesItems(next);
                  }}
                  placeholder={`Deliverable ${i + 1}`}
                />
                <RemoveButton
                  onClick={() =>
                    removeAt(deliverablesItems, i, setDeliverablesItems)
                  }
                />
              </div>
            ))}
            <AddButton
              label="Add deliverable"
              onClick={() =>
                setDeliverablesItems([...deliverablesItems, ""])
              }
            />
          </div>
        </EditorSection>

        {/* 07 · How Delivery Works */}
        <EditorSection
          num="07"
          title="How delivery works"
          helper="Step-by-step delivery process"
          publicNote="Numbered process steps shown on the landing page. Typically 4–6 steps."
          open={openSections.has("how-delivery")}
          onToggle={() => toggleSection("how-delivery")}
        >
          <div>
            <FieldLabel>Section title</FieldLabel>
            <input
              className={INPUT}
              value={howTitle}
              onChange={(e) => setHowTitle(e.target.value)}
              placeholder="e.g. How delivery works"
            />
          </div>
          <div className="space-y-3">
            {howSteps.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--admin-row-header)] text-[0.6rem] font-bold tabular-nums text-[var(--admin-muted)]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    className={INPUT}
                    value={s.step}
                    onChange={(e) => {
                      const next = [...howSteps];
                      next[i] = { ...next[i], step: e.target.value };
                      setHowSteps(next);
                    }}
                    placeholder={`Step ${i + 1} title`}
                  />
                  <textarea
                    className={TEXTAREA_SM}
                    value={s.description}
                    onChange={(e) => {
                      const next = [...howSteps];
                      next[i] = { ...next[i], description: e.target.value };
                      setHowSteps(next);
                    }}
                    placeholder="Description"
                  />
                </div>
                <RemoveButton
                  onClick={() => removeAt(howSteps, i, setHowSteps)}
                />
              </div>
            ))}
            <AddButton
              label="Add step"
              onClick={() =>
                setHowSteps([...howSteps, { step: "", description: "" }])
              }
            />
          </div>
        </EditorSection>

        {/* 08 · Who This Is For */}
        <EditorSection
          num="08"
          title="Who this is for"
          helper="Fit / not-fit criteria for buyers"
          publicNote='Displayed as two columns: "Good fit" and "Not a fit". Helps buyers self-qualify.'
          open={openSections.has("who")}
          onToggle={() => toggleSection("who")}
        >
          <div>
            <FieldLabel>Section title</FieldLabel>
            <input
              className={INPUT}
              value={whoTitle}
              onChange={(e) => setWhoTitle(e.target.value)}
              placeholder="e.g. Who this is for"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/3 p-3">
              <FieldLabel>Good fit — column title</FieldLabel>
              <input
                className={INPUT}
                value={fitTitle}
                onChange={(e) => setFitTitle(e.target.value)}
                placeholder="Good fit"
              />
              <div className="mt-3">
                <FieldLabel>
                  Items{" "}
                  <span className="font-normal text-[var(--admin-placeholder)]">
                    (one per line)
                  </span>
                </FieldLabel>
                <textarea
                  className={TEXTAREA_MONO}
                  value={fitItemsText}
                  onChange={(e) => setFitItemsText(e.target.value)}
                  placeholder={"Need consistent branded visuals\nRunning campaigns regularly"}
                />
              </div>
            </div>
            <div className="rounded-md border border-red-500/20 bg-red-500/3 p-3">
              <FieldLabel>Not a fit — column title</FieldLabel>
              <input
                className={INPUT}
                value={notFitTitle}
                onChange={(e) => setNotFitTitle(e.target.value)}
                placeholder="Not a fit"
              />
              <div className="mt-3">
                <FieldLabel>
                  Items{" "}
                  <span className="font-normal text-[var(--admin-placeholder)]">
                    (one per line)
                  </span>
                </FieldLabel>
                <textarea
                  className={TEXTAREA_MONO}
                  value={notFitItemsText}
                  onChange={(e) => setNotFitItemsText(e.target.value)}
                  placeholder={"Looking for free AI generators\nNeed one-off generic images"}
                />
              </div>
            </div>
          </div>
        </EditorSection>

        {/* 09 · Why Different */}
        <EditorSection
          num="09"
          title="Why this is different"
          helper="Differentiators and unique selling points"
          publicNote="Short paragraphs explaining what sets AI Studio apart."
          open={openSections.has("why-different")}
          onToggle={() => toggleSection("why-different")}
        >
          <div>
            <FieldLabel>Section title</FieldLabel>
            <input
              className={INPUT}
              value={whyTitle}
              onChange={(e) => setWhyTitle(e.target.value)}
              placeholder="e.g. Why this is different"
            />
          </div>
          <div className="space-y-3">
            {whyItems.map((it, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    className={INPUT}
                    value={it.title}
                    onChange={(e) => {
                      const next = [...whyItems];
                      next[i] = { ...next[i], title: e.target.value };
                      setWhyItems(next);
                    }}
                    placeholder={`Point ${i + 1} title`}
                  />
                  <textarea
                    className={TEXTAREA_SM}
                    value={it.body}
                    onChange={(e) => {
                      const next = [...whyItems];
                      next[i] = { ...next[i], body: e.target.value };
                      setWhyItems(next);
                    }}
                    placeholder="Supporting body text"
                  />
                </div>
                <RemoveButton
                  onClick={() => removeAt(whyItems, i, setWhyItems)}
                />
              </div>
            ))}
            <AddButton
              label="Add differentiator"
              onClick={() =>
                setWhyItems([...whyItems, { title: "", body: "" }])
              }
            />
          </div>
        </EditorSection>

        {/* 10 · Bottom CTA */}
        <EditorSection
          num="10"
          title="Bottom CTA"
          helper="Final call-to-action block at the page bottom"
          publicNote="The closing conversion block. Make the headline compelling and the button label action-oriented."
          open={openSections.has("cta")}
          onToggle={() => toggleSection("cta")}
        >
          <div>
            <FieldLabel>Headline</FieldLabel>
            <input
              className={INPUT}
              value={ctaHeadline}
              onChange={(e) => setCtaHeadline(e.target.value)}
              placeholder="e.g. Ready to start production?"
            />
          </div>
          <div>
            <FieldLabel>Supporting text</FieldLabel>
            <textarea
              className={TEXTAREA}
              value={ctaBody}
              onChange={(e) => setCtaBody(e.target.value)}
              placeholder="Brief supporting copy under the headline…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Button label</FieldLabel>
              <input
                className={INPUT}
                value={ctaButton}
                onChange={(e) => setCtaButton(e.target.value)}
                placeholder="e.g. Request a studio scope"
              />
            </div>
            <div>
              <FieldLabel>Button link</FieldLabel>
              <input
                className={INPUT}
                value={ctaHref}
                onChange={(e) => setCtaHref(e.target.value)}
                placeholder="/contact"
              />
            </div>
          </div>
        </EditorSection>

        {/* 11 · FAQ */}
        <EditorSection
          num="11"
          title="FAQ"
          helper={`${faqItems.filter((f) => f.question.trim()).length} questions`}
          publicNote="Displayed as an expandable Q&A section at the bottom of the landing page."
          open={openSections.has("faq")}
          onToggle={() => toggleSection("faq")}
        >
          <div>
            <FieldLabel>Section title</FieldLabel>
            <input
              className={INPUT}
              value={faqTitle}
              onChange={(e) => setFaqTitle(e.target.value)}
              placeholder="e.g. Frequently asked questions"
            />
          </div>
          <div className="space-y-3">
            {faqItems.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3"
              >
                <span className="mt-2 w-5 shrink-0 text-right text-[0.6rem] tabular-nums text-[var(--admin-muted)]">
                  Q{i + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    className={INPUT}
                    value={f.question}
                    onChange={(e) => {
                      const next = [...faqItems];
                      next[i] = { ...next[i], question: e.target.value };
                      setFaqItems(next);
                    }}
                    placeholder="Question"
                  />
                  <textarea
                    className={TEXTAREA_SM}
                    value={f.answer}
                    onChange={(e) => {
                      const next = [...faqItems];
                      next[i] = { ...next[i], answer: e.target.value };
                      setFaqItems(next);
                    }}
                    placeholder="Answer"
                  />
                </div>
                <RemoveButton
                  onClick={() => removeAt(faqItems, i, setFaqItems)}
                />
              </div>
            ))}
            <AddButton
              label="Add question"
              onClick={() =>
                setFaqItems([...faqItems, { question: "", answer: "" }])
              }
            />
          </div>
        </EditorSection>
      </div>

      {/* ── Bottom save bar ── */}
      <div className="mt-6 flex items-center gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-3">
        <button
          type="button"
          className="rounded-md bg-[var(--admin-primary)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--admin-primary-hover)] disabled:opacity-50"
          disabled={!page || saving}
          onClick={() => void save()}
        >
          {saving ? "Saving…" : `Save ${activeLocale.toUpperCase()}`}
        </button>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--admin-text)]">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--admin-primary)]"
          />
          Publish on save
        </label>
        {status && (
          <span
            className={`ms-auto text-xs ${status.startsWith("Save failed") ? "text-red-500" : "text-emerald-500"}`}
          >
            {status}
          </span>
        )}
      </div>

      {/* ── Media picker modal ── */}
      <MediaPicker
        open={mediaPickerOpen}
        filter={
          mediaTarget?.kind === "page-backdrop-video" ||
          mediaTarget?.kind === "hero-right-video"
            ? "video"
            : "image"
        }
        onClose={() => {
          setMediaPickerOpen(false);
          setMediaTarget(null);
        }}
        onPick={(asset) => {
          if (!mediaTarget) return;
          if (mediaTarget.kind === "offer-card") {
            const idx = mediaTarget.index;
            const next = [...offerCards];
            const row = next[idx];
            if (row) {
              next[idx] = {
                ...row,
                imageMediaAssetId: asset.id,
                imageUrl: asset.publicUrl ?? row.imageUrl,
                imageAlt: asset.altText?.trim() || row.imageAlt,
              };
              setOfferCards(next);
            }
          } else if (mediaTarget.kind === "studio-output") {
            const idx = mediaTarget.index;
            const next = [...studioOutputsSamples];
            const row = next[idx];
            if (row) {
              next[idx] = {
                ...row,
                imageUrl: asset.publicUrl ?? row.imageUrl,
                imageAlt: asset.altText?.trim() || row.imageAlt,
              };
              setStudioOutputsSamples(next);
            }
          } else if (mediaTarget.kind === "page-backdrop-video") {
            setBackdropVideoMediaAssetId(asset.id);
            if (asset.publicUrl) setBackdropVideoUrl(asset.publicUrl);
          } else if (mediaTarget.kind === "page-backdrop-poster") {
            setBackdropPosterMediaAssetId(asset.id);
            if (asset.publicUrl) setBackdropPosterUrl(asset.publicUrl);
            if (asset.altText?.trim())
              setBackdropPosterAlt(asset.altText.trim());
          } else if (mediaTarget.kind === "hero-right-image") {
            setHeroImageMediaAssetId(asset.id);
            if (asset.publicUrl) setHeroImageUrl(asset.publicUrl);
            if (asset.altText?.trim()) setHeroImageAlt(asset.altText.trim());
          } else if (mediaTarget.kind === "hero-right-video") {
            setHeroVideoMediaAssetId(asset.id);
            if (asset.publicUrl) setHeroVideoUrl(asset.publicUrl);
          }
          setMediaPickerOpen(false);
          setMediaTarget(null);
        }}
      />
    </div>
  );
}
