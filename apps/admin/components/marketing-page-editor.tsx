"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicApiBase } from "@/lib/api-base";
import { collectArabicLocaleWarnings } from "@/lib/locale-content-guard";
import { MediaPicker } from "@/components/media-picker";
import { ENTERPRISE_PROOF_KEYS } from "@/lib/enterprise-cms-keys";
import {
  applyEnterpriseStructuredMedia,
  EnterpriseMarketingSectionsEditor,
  pickEnterpriseDraftFromSections,
  type EnterpriseStructuredMediaTarget,
} from "@/components/enterprise-marketing-sections-editor";

type PageRow = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
  sections: unknown;
};

const LOCALES = ["en", "ar"] as const;

/** Keys driven by structured editors; other keys round-trip via Advanced JSON. */
const MANAGED_MARKETING_KEYS = new Set([
  "_meta",
  "kicker",
  "title",
  "subtitle",
  "lead",
  "body",
  "seoTitle",
  "seoDescription",
  "items",
  "heroVisual",
  "officeVisual",
  "trustVisual",
  "mapEmbedUrl",
  "mapLinkUrl",
  "serviceGroups",
  "enterpriseVisuals",
  "enterpriseAudience",
  "enterpriseDecisionSummary",
  "enterpriseProofEngine",
  "enterpriseFit",
  "enterprisePractice",
  "enterpriseProof",
  "enterpriseCaseStudies",
  "enterpriseDiagrams",
  "enterpriseRoi",
  "enterpriseDealEntry",
  "aboutVisuals",
  "reassuranceCards",
]);

type SectionItem = { id: string; title: string; body: string; visible: boolean };

type CmsVisual = {
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
  assetRole?: string;
  assetPurpose?: string;
  assetPriority?: string;
};

type ProgramOrReassuranceCard = {
  id: string;
  title: string;
  body: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  imageMediaAssetId: string;
};

type ServiceItemVisual = {
  slug: string;
  title: string;
  description: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  imageMediaAssetId: string;
};

type ServiceGroupVisual = {
  groupId: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
  itemImages?: ServiceItemVisual[];
};

function emptyCard(): ProgramOrReassuranceCard {
  return {
    id: crypto.randomUUID(),
    title: "",
    body: "",
    href: "",
    imageUrl: "",
    imageAlt: "",
    imageMediaAssetId: "",
  };
}

function emptyServiceItem(): ServiceItemVisual {
  return {
    slug: "",
    title: "",
    description: "",
    href: "",
    imageUrl: "",
    imageAlt: "",
    imageMediaAssetId: "",
  };
}

/** Serialize visual + optional asset taxonomy when any field is set. */
function cmsVisualPayload(v: CmsVisual): CmsVisual | undefined {
  const hasImg =
    Boolean(v.imageUrl?.trim()) || Boolean(v.imageMediaAssetId?.trim());
  const role = v.assetRole?.trim();
  const purpose = v.assetPurpose?.trim();
  const priority = v.assetPriority?.trim();
  const hasTax = Boolean(role || purpose || priority);
  if (!hasImg && !hasTax) return undefined;
  const out: CmsVisual = {};
  if (v.imageUrl?.trim()) out.imageUrl = v.imageUrl.trim();
  if (v.imageAlt?.trim()) out.imageAlt = v.imageAlt.trim();
  if (v.imageMediaAssetId?.trim()) out.imageMediaAssetId = v.imageMediaAssetId.trim();
  if (role) out.assetRole = role;
  if (purpose) out.assetPurpose = purpose;
  if (priority) out.assetPriority = priority;
  return out;
}

function prevVisualHadAsset(prev: unknown): boolean {
  if (!prev || typeof prev !== "object") return false;
  const o = prev as Record<string, unknown>;
  return (
    Boolean(String(o.imageUrl ?? "").trim()) ||
    Boolean(String(o.imageMediaAssetId ?? "").trim()) ||
    Boolean(String(o.assetRole ?? "").trim()) ||
    Boolean(String(o.assetPurpose ?? "").trim()) ||
    Boolean(String(o.assetPriority ?? "").trim())
  );
}

/**
 * Operator cleared all image fields but DB previously had a URL or media id —
 * persist removal with JSON `null` (full `sections` replace on save).
 */
function shouldClearVisual(current: CmsVisual, prev: unknown): boolean {
  return !cmsVisualPayload(current) && prevVisualHadAsset(prev);
}

function ImageThumb({ url, alt }: { url: string; alt: string }) {
  if (!url.trim()) return null;
  return (
    <div className="mt-2 aspect-video w-full max-h-32 overflow-hidden rounded border border-[var(--admin-border)] bg-black/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt.trim() || "Preview"}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function routePathForSlug(slug: string, locale: string) {
  const base = `/${locale}`;
  if (slug === "home") return base;
  return `${base}/${slug}`;
}

function buildPreviewUrl(slug: string, locale: string, highlight?: string) {
  const base = (process.env.NEXT_PUBLIC_WEB_URL ?? "http://127.0.0.1:3000")
    .replace(/\/$/, "");
  const token = process.env.NEXT_PUBLIC_PREVIEW_TOKEN?.trim();
  const path = routePathForSlug(slug, locale);
  const qs = new URLSearchParams();
  if (token) qs.set("previewToken", token);
  if (highlight) qs.set("highlight", highlight);
  const q = qs.toString();
  return q ? `${base}${path}?${q}` : `${base}${path}`;
}

export function MarketingPageEditor({
  slug,
  pageTitle,
}: {
  slug: string;
  pageTitle: string;
}) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [activeLocale, setActiveLocale] =
    useState<(typeof LOCALES)[number]>("en");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [kicker, setKicker] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [lead, setLead] = useState("");
  const [body, setBody] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [items, setItems] = useState<SectionItem[]>([]);
  const [published, setPublished] = useState(false);
  const [highlightSection, setHighlightSection] = useState<string>("intro");

  const [heroVisual, setHeroVisual] = useState<CmsVisual>({});
  const [officeVisual, setOfficeVisual] = useState<CmsVisual>({});
  const [trustVisual, setTrustVisual] = useState<CmsVisual>({});
  const [mapEmbedUrl, setMapEmbedUrl] = useState("");
  const [mapLinkUrl, setMapLinkUrl] = useState("");
  const [serviceGroups, setServiceGroups] = useState<ServiceGroupVisual[]>([]);
  const [programCards, setProgramCards] = useState<ProgramOrReassuranceCard[]>(
    [],
  );
  const [reassuranceCards, setReassuranceCards] = useState<
    ProgramOrReassuranceCard[]
  >([]);
  const [enterpriseVisuals, setEnterpriseVisuals] = useState<{
    hero?: CmsVisual;
    capability?: CmsVisual;
    process?: CmsVisual;
    systemDiagram?: CmsVisual;
  }>({});
  const [enterpriseAudience, setEnterpriseAudience] = useState("");
  const [enterpriseProofDraft, setEnterpriseProofDraft] = useState<
    Record<string, unknown>
  >({});
  const [enterpriseRawJson, setEnterpriseRawJson] = useState("");
  const [enterpriseRawJsonError, setEnterpriseRawJsonError] = useState<
    string | null
  >(null);
  const [aboutVisuals, setAboutVisuals] = useState<{
    brand?: CmsVisual;
    oman?: CmsVisual;
    delivery?: CmsVisual;
  }>({});
  const [extraSectionsJson, setExtraSectionsJson] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickTarget, setMediaPickTarget] = useState<
    | { kind: "hero" | "office" | "trust" }
    | { kind: "serviceGroup"; index: number }
    | { kind: "serviceItem"; groupIndex: number; itemIndex: number }
    | { kind: "enterprise"; key: "hero" | "capability" | "process" | "systemDiagram" }
    | { kind: "enterpriseStructured"; target: EnterpriseStructuredMediaTarget }
    | { kind: "about"; key: "brand" | "oman" | "delivery" }
    | { kind: "programCard"; index: number }
    | { kind: "reassuranceCard"; index: number }
    | null
  >(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${getPublicApiBase()}/pages`);
      if (!r.ok) {
        setPages([]);
        return;
      }
      const rows = (await r.json()) as PageRow[];
      setPages(rows);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const page = useMemo(() => {
    return pages.find((p) => p.slug === slug && p.locale === activeLocale);
  }, [pages, slug, activeLocale]);

  const ensure = async () => {
    setStatus(null);
    for (const loc of LOCALES) {
      const exists = pages.some((p) => p.slug === slug && p.locale === loc);
      if (exists) continue;
      const r = await fetch(`${getPublicApiBase()}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          locale: loc,
          title: loc === "ar" ? pageTitle : pageTitle,
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

  useEffect(() => {
    const s = (page?.sections ?? {}) as Record<string, unknown>;
    setKicker(String(s.kicker ?? ""));
    setTitle(String(s.title ?? ""));
    setSubtitle(String(s.subtitle ?? ""));
    setLead(String(s.lead ?? ""));
    setBody(String(s.body ?? ""));
    setSeoTitle(String(s.seoTitle ?? page?.metaTitle ?? ""));
    setSeoDescription(String(s.seoDescription ?? page?.metaDescription ?? ""));
    const rawItems = Array.isArray(s.items) ? (s.items as unknown[]) : [];
    setItems(
      rawItems
        .map((row, i) => {
          const r = row as Record<string, unknown>;
          return {
            id: String(r.id ?? i),
            title: String(r.title ?? ""),
            body: String(r.body ?? ""),
            visible: r.visible === undefined ? true : Boolean(r.visible),
          };
        })
        .filter((x) => x.title || x.body),
    );
    setPublished(page?.status === "PUBLISHED");

    const toVisual = (o: unknown): CmsVisual => {
      const r = (o ?? {}) as Record<string, unknown>;
      const role = String(r.assetRole ?? "").trim();
      const purpose = String(r.assetPurpose ?? "").trim();
      const priority = String(r.assetPriority ?? "").trim();
      return {
        imageUrl: String(r.imageUrl ?? ""),
        imageAlt: String(r.imageAlt ?? ""),
        imageMediaAssetId: String(r.imageMediaAssetId ?? ""),
        assetRole: role || undefined,
        assetPurpose: purpose || undefined,
        assetPriority: priority || undefined,
      };
    };

    setHeroVisual(toVisual(s.heroVisual));
    setOfficeVisual(toVisual(s.officeVisual));
    setTrustVisual(toVisual(s.trustVisual));
    setMapEmbedUrl(String(s.mapEmbedUrl ?? ""));
    setMapLinkUrl(String(s.mapLinkUrl ?? ""));

    const extra: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(s)) {
      if (!MANAGED_MARKETING_KEYS.has(k)) extra[k] = v;
    }
    setExtraSectionsJson(
      Object.keys(extra).length ? JSON.stringify(extra, null, 2) : "",
    );

    const rawGroups = Array.isArray(s.serviceGroups)
      ? (s.serviceGroups as unknown[])
      : [];
    setServiceGroups(
      rawGroups
        .map((row) => {
          const r = row as Record<string, unknown>;
          const itemImages = Array.isArray(r.itemImages)
            ? (r.itemImages as unknown[]).map((x) => {
                const xi = x as Record<string, unknown>;
                return {
                  slug: String(xi.slug ?? ""),
                  title: String(xi.title ?? ""),
                  description: String(xi.description ?? ""),
                  href: String(xi.href ?? ""),
                  imageUrl: String(xi.imageUrl ?? ""),
                  imageAlt: String(xi.imageAlt ?? ""),
                  imageMediaAssetId: String(xi.imageMediaAssetId ?? ""),
                } satisfies ServiceItemVisual;
              })
            : [];
          return {
            groupId: String(r.groupId ?? ""),
            title: String(r.title ?? ""),
            description: String(r.description ?? ""),
            imageUrl: String(r.imageUrl ?? ""),
            imageAlt: String(r.imageAlt ?? ""),
            imageMediaAssetId: String(r.imageMediaAssetId ?? ""),
            itemImages,
          } satisfies ServiceGroupVisual;
        })
        .filter((g) => g.groupId),
    );

    const ev = (s.enterpriseVisuals ?? {}) as Record<string, unknown>;
    setEnterpriseVisuals({
      hero: toVisual(ev.hero),
      capability: toVisual(ev.capability),
      process: toVisual(ev.process),
      systemDiagram: toVisual(ev.systemDiagram),
    });
    setEnterpriseAudience(String(s.enterpriseAudience ?? ""));
    setEnterpriseProofDraft(
      pickEnterpriseDraftFromSections(s as Record<string, unknown>),
    );
    setEnterpriseRawJson("");
    setEnterpriseRawJsonError(null);
    const rawPc = Array.isArray(ev.programCards)
      ? (ev.programCards as unknown[])
      : [];
    setProgramCards(
      rawPc.map((row, i) => {
        const r = row as Record<string, unknown>;
        return {
          id: String(r.id ?? i),
          title: String(r.title ?? r.label ?? ""),
          body: String(r.body ?? r.description ?? r.text ?? ""),
          href: String(r.href ?? ""),
          imageUrl: String(r.imageUrl ?? ""),
          imageAlt: String(r.imageAlt ?? ""),
          imageMediaAssetId: String(r.imageMediaAssetId ?? ""),
        };
      }),
    );

    const rawRc = Array.isArray(s.reassuranceCards)
      ? (s.reassuranceCards as unknown[])
      : [];
    setReassuranceCards(
      rawRc.map((row, i) => {
        const r = row as Record<string, unknown>;
        return {
          id: String(r.id ?? i),
          title: String(r.title ?? r.label ?? ""),
          body: String(r.body ?? r.description ?? r.text ?? ""),
          href: String(r.href ?? ""),
          imageUrl: String(r.imageUrl ?? ""),
          imageAlt: String(r.imageAlt ?? ""),
          imageMediaAssetId: String(r.imageMediaAssetId ?? ""),
        };
      }),
    );

    const av = (s.aboutVisuals ?? {}) as Record<string, unknown>;
    setAboutVisuals({
      brand: toVisual(av.brand),
      oman: toVisual(av.oman),
      delivery: toVisual(av.delivery),
    });

  }, [page?.id, page?.sections, page?.metaTitle, page?.metaDescription, page?.status]);

  const canHaveItems = slug === "faq";
  const canHaveServiceGroups = slug === "services";
  const canHaveEnterpriseVisuals = slug === "enterprise";
  const canHaveAboutVisuals = slug === "about";
  const canHaveContactVisuals = slug === "contact";

  const arabicLocaleWarnings = useMemo(() => {
    if (activeLocale !== "ar") return [];
    const entries: { label: string; value: string }[] = [
      { label: "Kicker", value: kicker },
      { label: "Title", value: title },
      { label: "Subtitle", value: subtitle },
      { label: "Lead", value: lead },
      { label: "Body", value: body },
      { label: "SEO title", value: seoTitle },
      { label: "SEO description", value: seoDescription },
      { label: "Hero image alt", value: heroVisual.imageAlt ?? "" },
    ];
    if (canHaveContactVisuals) {
      entries.push(
        { label: "Office image alt", value: officeVisual.imageAlt ?? "" },
        { label: "Support image alt", value: trustVisual.imageAlt ?? "" },
      );
      reassuranceCards.forEach((c, i) => {
        entries.push(
          { label: `Reassurance ${i + 1} — title`, value: c.title },
          { label: `Reassurance ${i + 1} — body`, value: c.body },
          { label: `Reassurance ${i + 1} — alt`, value: c.imageAlt },
        );
      });
    }
    if (canHaveServiceGroups) {
      serviceGroups.forEach((g, gi) => {
        entries.push(
          { label: `Group ${gi + 1} — title`, value: g.title },
          { label: `Group ${gi + 1} — description`, value: g.description },
          { label: `Group ${gi + 1} — banner alt`, value: g.imageAlt ?? "" },
        );
        (g.itemImages ?? []).forEach((it, ii) => {
          entries.push(
            { label: `Group ${gi + 1} item ${ii + 1} — title`, value: it.title },
            {
              label: `Group ${gi + 1} item ${ii + 1} — description`,
              value: it.description,
            },
            { label: `Group ${gi + 1} item ${ii + 1} — alt`, value: it.imageAlt },
          );
        });
      });
    }
    if (canHaveEnterpriseVisuals) {
      entries.push(
        { label: "Enterprise hero alt", value: enterpriseVisuals.hero?.imageAlt ?? "" },
        {
          label: "Enterprise capability alt",
          value: enterpriseVisuals.capability?.imageAlt ?? "",
        },
        { label: "Enterprise process alt", value: enterpriseVisuals.process?.imageAlt ?? "" },
        {
          label: "Enterprise system diagram alt",
          value: enterpriseVisuals.systemDiagram?.imageAlt ?? "",
        },
        { label: "Enterprise audience line", value: enterpriseAudience },
      );
      programCards.forEach((c, i) => {
        entries.push(
          { label: `Program card ${i + 1} — title`, value: c.title },
          { label: `Program card ${i + 1} — body`, value: c.body },
          { label: `Program card ${i + 1} — alt`, value: c.imageAlt },
        );
      });
    }
    if (canHaveAboutVisuals) {
      entries.push(
        { label: "About brand alt", value: aboutVisuals.brand?.imageAlt ?? "" },
        { label: "About Oman alt", value: aboutVisuals.oman?.imageAlt ?? "" },
        { label: "About delivery alt", value: aboutVisuals.delivery?.imageAlt ?? "" },
      );
    }
    items.forEach((it, i) => {
      entries.push(
        { label: `FAQ ${i + 1} — question`, value: it.title },
        { label: `FAQ ${i + 1} — answer`, value: it.body },
      );
    });
    return collectArabicLocaleWarnings(entries);
  }, [
    activeLocale,
    kicker,
    title,
    subtitle,
    lead,
    body,
    seoTitle,
    seoDescription,
    heroVisual.imageAlt,
    canHaveContactVisuals,
    officeVisual.imageAlt,
    trustVisual.imageAlt,
    reassuranceCards,
    canHaveServiceGroups,
    serviceGroups,
    canHaveEnterpriseVisuals,
    enterpriseVisuals.hero?.imageAlt,
    enterpriseVisuals.capability?.imageAlt,
    enterpriseVisuals.process?.imageAlt,
    enterpriseVisuals.systemDiagram?.imageAlt,
    enterpriseAudience,
    programCards,
    canHaveAboutVisuals,
    aboutVisuals.brand?.imageAlt,
    aboutVisuals.oman?.imageAlt,
    aboutVisuals.delivery?.imageAlt,
    items,
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "", body: "", visible: true },
    ]);
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      const tmp = next[idx]!;
      next[idx] = next[j]!;
      next[j] = tmp;
      return next;
    });
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveServiceGroup = (idx: number, dir: -1 | 1) => {
    setServiceGroups((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      const t = next[idx]!;
      next[idx] = next[j]!;
      next[j] = t;
      return next;
    });
  };

  const moveServiceItem = (gi: number, ii: number, dir: -1 | 1) => {
    setServiceGroups((prev) => {
      const next = [...prev];
      const g = next[gi];
      if (!g) return prev;
      const items = [...(g.itemImages ?? [])];
      const j = ii + dir;
      if (j < 0 || j >= items.length) return prev;
      const t = items[ii]!;
      items[ii] = items[j]!;
      items[j] = t;
      next[gi] = { ...g, itemImages: items };
      return next;
    });
  };

  const addServiceItem = (gi: number) => {
    setServiceGroups((prev) =>
      prev.map((g, i) =>
        i === gi
          ? {
              ...g,
              itemImages: [...(g.itemImages ?? []), emptyServiceItem()],
            }
          : g,
      ),
    );
  };

  const removeServiceItem = (gi: number, ii: number) => {
    setServiceGroups((prev) =>
      prev.map((g, i) =>
        i === gi
          ? {
              ...g,
              itemImages: (g.itemImages ?? []).filter((_, j) => j !== ii),
            }
          : g,
      ),
    );
  };

  const moveProgramCard = (idx: number, dir: -1 | 1) => {
    setProgramCards((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      const t = next[idx]!;
      next[idx] = next[j]!;
      next[j] = t;
      return next;
    });
  };

  const moveReassuranceCard = (idx: number, dir: -1 | 1) => {
    setReassuranceCards((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      const t = next[idx]!;
      next[idx] = next[j]!;
      next[j] = t;
      return next;
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) {
      setStatus("Create the page rows first.");
      return;
    }
    setStatus(null);
    const prevSections = (page?.sections ?? {}) as Record<string, unknown>;
    const prevEnterpriseVisuals =
      (prevSections.enterpriseVisuals as Record<string, unknown> | undefined) ??
      {};
    const prevAboutVisuals =
      (prevSections.aboutVisuals as Record<string, unknown> | undefined) ?? {};

    let extraParsed: Record<string, unknown> = {};
    if (extraSectionsJson.trim()) {
      try {
        const parsed = JSON.parse(extraSectionsJson) as unknown;
        extraParsed =
          parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : {};
      } catch {
        setStatus(
          "Advanced JSON is invalid — fix the syntax or clear the field before saving.",
        );
        return;
      }
    }

    const enterpriseSectionSave: Record<string, unknown> = {};
    if (canHaveEnterpriseVisuals) {
      for (const key of ENTERPRISE_PROOF_KEYS) {
        enterpriseSectionSave[key] = Object.prototype.hasOwnProperty.call(
          enterpriseProofDraft,
          key,
        )
          ? enterpriseProofDraft[key]
          : prevSections[key];
      }
    }

    const sections: Record<string, unknown> = {
      ...prevSections,
      ...extraParsed,
      _meta: { highlightSection: highlightSection.trim() || undefined },
      kicker: kicker.trim() || undefined,
      title: title.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      lead: lead.trim() || undefined,
      body: body.trim() || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      ...(shouldClearVisual(heroVisual, prevSections.heroVisual)
        ? { heroVisual: null }
        : cmsVisualPayload(heroVisual)
          ? { heroVisual: cmsVisualPayload(heroVisual)! }
          : {}),
      ...(canHaveContactVisuals
        ? {
            ...(shouldClearVisual(officeVisual, prevSections.officeVisual)
              ? { officeVisual: null }
              : cmsVisualPayload(officeVisual)
                ? { officeVisual: cmsVisualPayload(officeVisual)! }
                : {}),
            ...(shouldClearVisual(trustVisual, prevSections.trustVisual)
              ? { trustVisual: null }
              : cmsVisualPayload(trustVisual)
                ? { trustVisual: cmsVisualPayload(trustVisual)! }
                : {}),
            mapEmbedUrl: mapEmbedUrl.trim() || undefined,
            mapLinkUrl: mapLinkUrl.trim() || undefined,
            reassuranceCards: reassuranceCards.map((c) => ({
              id: c.id,
              title: c.title.trim() || undefined,
              body: c.body.trim() || undefined,
              href: c.href.trim() || undefined,
              imageUrl: c.imageUrl.trim() || undefined,
              imageAlt: c.imageAlt.trim() || undefined,
              imageMediaAssetId: c.imageMediaAssetId.trim() || undefined,
            })),
          }
        : {}),
      ...(canHaveServiceGroups
        ? {
            serviceGroups: serviceGroups
              .filter((g) => g.groupId.trim())
              .map((g) => ({
                groupId: g.groupId.trim(),
                title: g.title.trim() || undefined,
                description: g.description.trim() || undefined,
                imageUrl: g.imageUrl?.trim() || undefined,
                imageAlt: g.imageAlt?.trim() || undefined,
                imageMediaAssetId: g.imageMediaAssetId?.trim() || undefined,
                itemImages: (g.itemImages ?? [])
                  .filter((x) => x.slug.trim())
                  .map((x) => ({
                    slug: x.slug.trim(),
                    title: x.title.trim() || undefined,
                    description: x.description.trim() || undefined,
                    href: x.href.trim() || undefined,
                    imageUrl: x.imageUrl?.trim() || undefined,
                    imageAlt: x.imageAlt?.trim() || undefined,
                    imageMediaAssetId: x.imageMediaAssetId?.trim() || undefined,
                  })),
              })),
          }
        : {}),
      ...(canHaveEnterpriseVisuals
        ? {
            enterpriseVisuals: {
              ...prevEnterpriseVisuals,
              ...(shouldClearVisual(
                enterpriseVisuals.hero ?? {},
                prevEnterpriseVisuals.hero,
              )
                ? { hero: null }
                : cmsVisualPayload(enterpriseVisuals.hero ?? {})
                  ? { hero: cmsVisualPayload(enterpriseVisuals.hero ?? {})! }
                  : {}),
              ...(shouldClearVisual(
                enterpriseVisuals.capability ?? {},
                prevEnterpriseVisuals.capability,
              )
                ? { capability: null }
                : cmsVisualPayload(enterpriseVisuals.capability ?? {})
                  ? {
                      capability: cmsVisualPayload(
                        enterpriseVisuals.capability ?? {},
                      )!,
                    }
                  : {}),
              ...(shouldClearVisual(
                enterpriseVisuals.process ?? {},
                prevEnterpriseVisuals.process,
              )
                ? { process: null }
                : cmsVisualPayload(enterpriseVisuals.process ?? {})
                  ? {
                      process: cmsVisualPayload(
                        enterpriseVisuals.process ?? {},
                      )!,
                    }
                  : {}),
              ...(shouldClearVisual(
                enterpriseVisuals.systemDiagram ?? {},
                prevEnterpriseVisuals.systemDiagram,
              )
                ? { systemDiagram: null }
                : cmsVisualPayload(enterpriseVisuals.systemDiagram ?? {})
                  ? {
                      systemDiagram: cmsVisualPayload(
                        enterpriseVisuals.systemDiagram ?? {},
                      )!,
                    }
                  : {}),
              programCards: programCards.map((c) => ({
                id: c.id,
                title: c.title.trim() || undefined,
                body: c.body.trim() || undefined,
                href: c.href.trim() || undefined,
                imageUrl: c.imageUrl.trim() || undefined,
                imageAlt: c.imageAlt.trim() || undefined,
                imageMediaAssetId: c.imageMediaAssetId.trim() || undefined,
              })),
            },
          }
        : {}),
      ...(canHaveAboutVisuals
        ? {
            aboutVisuals: {
              ...prevAboutVisuals,
              ...(shouldClearVisual(
                aboutVisuals.brand ?? {},
                prevAboutVisuals.brand,
              )
                ? { brand: null }
                : cmsVisualPayload(aboutVisuals.brand ?? {})
                  ? { brand: cmsVisualPayload(aboutVisuals.brand ?? {})! }
                  : {}),
              ...(shouldClearVisual(aboutVisuals.oman ?? {}, prevAboutVisuals.oman)
                ? { oman: null }
                : cmsVisualPayload(aboutVisuals.oman ?? {})
                  ? { oman: cmsVisualPayload(aboutVisuals.oman ?? {})! }
                  : {}),
              ...(shouldClearVisual(
                aboutVisuals.delivery ?? {},
                prevAboutVisuals.delivery,
              )
                ? { delivery: null }
                : cmsVisualPayload(aboutVisuals.delivery ?? {})
                  ? {
                      delivery: cmsVisualPayload(aboutVisuals.delivery ?? {})!,
                    }
                  : {}),
            },
          }
        : {}),
      ...(canHaveEnterpriseVisuals
        ? Object.fromEntries(
            ENTERPRISE_PROOF_KEYS.map((key) => [
              key,
              enterpriseSectionSave[key],
            ]),
          )
        : {}),
      ...(canHaveEnterpriseVisuals
        ? {
            enterpriseAudience: enterpriseAudience.trim() || undefined,
          }
        : {}),
      ...(canHaveItems
        ? {
            items: items.map((i) => ({
              id: i.id,
              title: i.title.trim(),
              body: i.body.trim(),
              visible: i.visible,
            })),
          }
        : {}),
    };
    const r = await fetch(`${getPublicApiBase()}/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: pageTitle,
        metaTitle: seoTitle.trim() || undefined,
        metaDescription: seoDescription.trim() || undefined,
        sections,
        status: published ? "PUBLISHED" : "DRAFT",
      }),
    });
    if (!r.ok) {
      const errBody = await r.text();
      setStatus(
        `Could not save (${r.status}). ${errBody.slice(0, 280)}${errBody.length > 280 ? "…" : ""}`,
      );
      return;
    }
    setStatus("Saved.");
    await load();
  };

  const previewUrl = useMemo(() => {
    return buildPreviewUrl(slug, activeLocale, highlightSection.trim() || undefined);
  }, [slug, activeLocale, highlightSection]);

  if (loading) {
    return <p className="text-sm text-[var(--admin-muted)]">Loading…</p>;
  }

  const missing = !LOCALES.every((loc) =>
    pages.some((p) => p.slug === slug && p.locale === loc),
  );

  return (
    <div className="max-w-4xl space-y-5">
      <p className="text-sm text-[var(--admin-muted)]">
        Edit <span className="font-medium text-[var(--admin-text)]">{pageTitle}</span>{" "}
        copy per locale. Fields map 1:1 to the public route{" "}
        <code className="text-xs">{routePathForSlug(slug, activeLocale)}</code>.
      </p>

      {missing ? (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-[var(--admin-text)]">
            No CMS rows for EN/AR yet. Create draft page rows first.
          </p>
          <button
            type="button"
            className="mt-2 rounded-md bg-[var(--admin-primary)] px-3 py-1.5 text-sm font-medium text-white"
            onClick={() => void ensure()}
          >
            Create {slug} (EN + AR)
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-2">
        <div className="flex gap-2">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                activeLocale === loc
                  ? "bg-[var(--admin-primary)] text-white"
                  : "bg-[var(--admin-row-header)] text-[var(--admin-text)]"
              }`}
              onClick={() => setActiveLocale(loc)}
            >
              {loc.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-[var(--admin-text)]">
            Highlight
            <select
              className="ml-2 rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1 text-xs"
              value={highlightSection}
              onChange={(e) => setHighlightSection(e.target.value)}
            >
              <option value="intro">Intro</option>
              {slug === "enterprise" ? (
                <>
                  <option value="enterprise-proof">Proof strip</option>
                  <option value="enterprise-case-studies">Case studies</option>
                  <option value="enterprise-practice">Practice</option>
                  <option value="enterprise-programs">Programmes</option>
                  <option value="enterprise-system-diagrams">System diagrams</option>
                  <option value="enterprise-roi">ROI framing</option>
                  <option value="enterprise-process">Process</option>
                  <option value="enterprise-deal-entry">Deal entry CTA</option>
                </>
              ) : null}
              {slug === "faq" ? <option value="items">Items</option> : null}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--admin-text)]">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published
          </label>
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1.5 text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
          >
            Preview
          </a>
        </div>
      </div>

      {activeLocale === "ar" ? (
        <p className="text-xs text-[var(--admin-muted)]">
          Arabic copy: prefer concise sentences; Latin names for products (CRM, etc.) are
          expected. Alt text should be written in the same language as the page.
        </p>
      ) : null}
      {activeLocale === "ar" && arabicLocaleWarnings.length > 0 ? (
        <div
          className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs text-[var(--admin-text)]"
          role="status"
        >
          <p className="font-medium text-amber-900 dark:text-amber-100">
            Arabic locale checks (warnings only — save still works)
          </p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-[var(--admin-muted)]">
            {arabicLocaleWarnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {page ? (
        <p className="text-xs text-[var(--admin-muted)]">
          Page id <code>{page.id}</code> · status {page.status}
        </p>
      ) : null}

      <form onSubmit={save} className="space-y-4">
        <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                Visuals
              </h3>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">
                Optional images stored in <code>Page.sections</code>. Leave blank
                to rely on fallbacks. Use <strong>Clear</strong> then <strong>Save</strong>{" "}
                to remove a stored image from the database.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-3 py-1.5 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
                onClick={() => {
                  setMediaPickTarget({ kind: "hero" });
                  setMediaPickerOpen(true);
                }}
              >
                Pick hero image
              </button>
              <button
                type="button"
                className="rounded-md border border-[var(--admin-border)] px-3 py-1.5 text-xs text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                onClick={() => setHeroVisual({})}
              >
                Clear hero image
              </button>
            </div>
          </div>

          <p className="mt-3 text-[10px] leading-snug text-[var(--admin-muted)]">
            Paste a public URL or use the picker for a stored asset. Alt should describe what
            the image communicates (accessibility + SEO).
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-[var(--admin-muted)]">
                Hero image URL
              </span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                value={heroVisual.imageUrl ?? ""}
                onChange={(e) =>
                  setHeroVisual((v) => ({ ...v, imageUrl: e.target.value }))
                }
                placeholder="https://… or /uploads/…"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--admin-muted)]">
                Hero image alt
              </span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                value={heroVisual.imageAlt ?? ""}
                onChange={(e) =>
                  setHeroVisual((v) => ({ ...v, imageAlt: e.target.value }))
                }
                placeholder="Short description in page language"
              />
            </label>
            <div className="sm:col-span-2 text-[10px] text-[var(--admin-muted)] font-mono">
              mediaAssetId: {heroVisual.imageMediaAssetId || "—"}
            </div>
            <div className="sm:col-span-2">
              <ImageThumb
                url={heroVisual.imageUrl ?? ""}
                alt={heroVisual.imageAlt ?? ""}
              />
            </div>
          </div>

          {canHaveContactVisuals ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  key: "office" as const,
                  title: "Office image",
                  value: officeVisual,
                  set: setOfficeVisual,
                },
                {
                  key: "trust" as const,
                  title: "Support / aside image",
                  value: trustVisual,
                  set: setTrustVisual,
                },
              ].map((row) => (
                <div
                  key={row.key}
                  className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3"
                >
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <p className="mr-auto text-sm font-medium text-[var(--admin-text)]">
                      {row.title}
                    </p>
                    <button
                      type="button"
                      className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-2.5 py-1.5 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
                      onClick={() => {
                        setMediaPickTarget({ kind: row.key });
                        setMediaPickerOpen(true);
                      }}
                    >
                      Pick
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-[var(--admin-border)] px-2.5 py-1.5 text-xs text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                      onClick={() => row.set(() => ({}))}
                    >
                      Clear
                    </button>
                  </div>
                  <input
                    className="mt-2 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                    value={row.value.imageUrl ?? ""}
                    onChange={(e) =>
                      row.set((v) => ({ ...v, imageUrl: e.target.value }))
                    }
                    placeholder="Image URL"
                  />
                  <input
                    className="mt-2 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                    value={row.value.imageAlt ?? ""}
                    onChange={(e) =>
                      row.set((v) => ({ ...v, imageAlt: e.target.value }))
                    }
                    placeholder="Alt text (page language)"
                  />
                  <p className="mt-2 text-[10px] text-[var(--admin-muted)] font-mono">
                    mediaAssetId: {row.value.imageMediaAssetId || "—"}
                  </p>
                  <ImageThumb
                    url={row.value.imageUrl ?? ""}
                    alt={row.value.imageAlt ?? ""}
                  />
                </div>
              ))}
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-[var(--admin-muted)]">
                  Map embed URL (optional)
                </span>
                <input
                  className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                  value={mapEmbedUrl}
                  onChange={(e) => setMapEmbedUrl(e.target.value)}
                  placeholder="https://www.google.com/maps/embed?…"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-[var(--admin-muted)]">
                  Map link URL (optional)
                </span>
                <input
                  className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                  value={mapLinkUrl}
                  onChange={(e) => setMapLinkUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=…"
                />
                <span className="mt-1 block text-[10px] text-[var(--admin-muted)]">
                  Public “open in maps” link; separate from iframe embed above.
                </span>
              </label>

              <div className="sm:col-span-2 mt-2 border-t border-[var(--admin-border)] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                      Reassurance cards
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--admin-muted)]">
                      Short next-step or trust cards (optional).
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-3 py-1.5 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
                    onClick={() =>
                      setReassuranceCards((prev) => [...prev, emptyCard()])
                    }
                  >
                    Add card
                  </button>
                </div>
                {reassuranceCards.length === 0 ? (
                  <p className="mt-3 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm text-[var(--admin-muted)]">
                    No reassurance cards yet. Optional — add short trust or “what happens
                    next” cards.
                  </p>
                ) : (
                  <p className="mt-2 text-[10px] text-[var(--admin-muted)]">
                    Order on the contact page follows this list; ↑ ↓ reorders.
                  </p>
                )}
                <div className="mt-3 space-y-3">
                  {reassuranceCards.map((c, idx) => (
                    <div
                      key={c.id}
                      className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-[var(--admin-muted)]">
                          id: {c.id}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            title="Move up"
                            className="rounded border border-[var(--admin-border)] px-2 py-0.5 text-[10px]"
                            onClick={() => moveReassuranceCard(idx, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            title="Move down"
                            className="rounded border border-[var(--admin-border)] px-2 py-0.5 text-[10px]"
                            onClick={() => moveReassuranceCard(idx, 1)}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-2.5 py-1 text-[10px] font-medium text-[var(--admin-text)]"
                            onClick={() => {
                              setMediaPickTarget({
                                kind: "reassuranceCard",
                                index: idx,
                              });
                              setMediaPickerOpen(true);
                            }}
                          >
                            Pick image
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-[var(--admin-border)] px-2.5 py-1 text-[10px] text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                            onClick={() =>
                              setReassuranceCards((prev) =>
                                prev.map((x, i) =>
                                  i === idx
                                    ? {
                                        ...x,
                                        imageUrl: "",
                                        imageAlt: "",
                                        imageMediaAssetId: "",
                                      }
                                    : x,
                                ),
                              )
                            }
                          >
                            Clear image
                          </button>
                          <button
                            type="button"
                            className="text-[10px] text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                            onClick={() =>
                              setReassuranceCards((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <input
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                          placeholder="Title"
                          value={c.title}
                          onChange={(e) =>
                            setReassuranceCards((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, title: e.target.value } : x,
                              ),
                            )
                          }
                        />
                        <input
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                          placeholder="href (optional)"
                          value={c.href}
                          onChange={(e) =>
                            setReassuranceCards((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, href: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </div>
                      <textarea
                        className="mt-2 min-h-[56px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                        placeholder="Body"
                        value={c.body}
                        onChange={(e) =>
                          setReassuranceCards((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, body: e.target.value } : x,
                            ),
                          )
                        }
                      />
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <input
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                          placeholder="Image URL"
                          value={c.imageUrl}
                          onChange={(e) =>
                            setReassuranceCards((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, imageUrl: e.target.value } : x,
                              ),
                            )
                          }
                        />
                        <input
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                          placeholder="Image alt"
                          value={c.imageAlt}
                          onChange={(e) =>
                            setReassuranceCards((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, imageAlt: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-[var(--admin-muted)] font-mono">
                        mediaAssetId: {c.imageMediaAssetId || "—"}
                      </p>
                      <ImageThumb url={c.imageUrl} alt={c.imageAlt} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {canHaveServiceGroups ? (
            <div className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                    Service groups
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--admin-muted)]">
                    Group copy, banner image, and per-item cards (slug matches site
                    routing).
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-3 py-1.5 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
                  onClick={() =>
                    setServiceGroups((prev) => [
                      ...prev,
                      {
                        groupId: "",
                        title: "",
                        description: "",
                        itemImages: [],
                      },
                    ])
                  }
                >
                  Add group
                </button>
              </div>
              {serviceGroups.length === 0 ? (
                <p className="mt-3 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm text-[var(--admin-muted)]">
                  No service groups yet. Add at least one group id (must match routing) and
                  optional item cards.
                </p>
              ) : (
                <p className="mt-2 text-[10px] text-[var(--admin-muted)]">
                  Group order on the page follows this list; ↑ ↓ reorders groups.
                </p>
              )}
              <div className="mt-3 space-y-4">
                {serviceGroups.map((g, gi) => (
                  <div
                    key={`${g.groupId}-${gi}`}
                    className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className="min-w-[12rem] flex-1 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                        placeholder="groupId (e.g. digital-presence)"
                        value={g.groupId}
                        onChange={(e) =>
                          setServiceGroups((prev) => {
                            const next = [...prev];
                            next[gi] = { ...next[gi]!, groupId: e.target.value };
                            return next;
                          })
                        }
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
                          onClick={() => moveServiceGroup(gi, -1)}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
                          onClick={() => moveServiceGroup(gi, 1)}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        type="button"
                        className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-3 py-2 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
                        onClick={() => {
                          setMediaPickTarget({ kind: "serviceGroup", index: gi });
                          setMediaPickerOpen(true);
                        }}
                      >
                        Pick banner
                      </button>
                      <button
                        type="button"
                        className="ml-auto rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-xs text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
                        onClick={() =>
                          setServiceGroups((prev) => prev.filter((_, i) => i !== gi))
                        }
                      >
                        Remove group
                      </button>
                    </div>
                    <label className="mt-2 block">
                      <span className="text-[10px] font-medium text-[var(--admin-muted)]">
                        Group title
                      </span>
                      <input
                        className="mt-0.5 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                        value={g.title}
                        onChange={(e) =>
                          setServiceGroups((prev) => {
                            const next = [...prev];
                            next[gi] = { ...next[gi]!, title: e.target.value };
                            return next;
                          })
                        }
                      />
                    </label>
                    <label className="mt-2 block">
                      <span className="text-[10px] font-medium text-[var(--admin-muted)]">
                        Group description
                      </span>
                      <textarea
                        className="mt-0.5 min-h-[56px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                        value={g.description}
                        onChange={(e) =>
                          setServiceGroups((prev) => {
                            const next = [...prev];
                            next[gi] = { ...next[gi]!, description: e.target.value };
                            return next;
                          })
                        }
                      />
                    </label>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <input
                        className="w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                        placeholder="Banner image URL"
                        value={g.imageUrl ?? ""}
                        onChange={(e) =>
                          setServiceGroups((prev) => {
                            const next = [...prev];
                            next[gi] = { ...next[gi]!, imageUrl: e.target.value };
                            return next;
                          })
                        }
                      />
                      <input
                        className="w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                        placeholder="Banner alt"
                        value={g.imageAlt ?? ""}
                        onChange={(e) =>
                          setServiceGroups((prev) => {
                            const next = [...prev];
                            next[gi] = { ...next[gi]!, imageAlt: e.target.value };
                            return next;
                          })
                        }
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-[var(--admin-muted)] font-mono">
                      Banner mediaAssetId: {g.imageMediaAssetId || "—"}
                    </p>
                    <ImageThumb
                      url={g.imageUrl ?? ""}
                      alt={g.imageAlt ?? ""}
                    />

                    <div className="mt-4 border-t border-[var(--admin-border)] pt-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-semibold uppercase text-[var(--admin-muted)]">
                          Items in this group
                        </p>
                        <button
                          type="button"
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-2.5 py-1 text-[10px] font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
                          onClick={() => addServiceItem(gi)}
                        >
                          Add item
                        </button>
                      </div>
                      <div className="mt-2 space-y-3">
                        {(g.itemImages ?? []).map((it, ii) => (
                          <div
                            key={`${it.slug}-${ii}`}
                            className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2.5"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                className="min-w-[8rem] flex-1 rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs text-[var(--admin-text)]"
                                placeholder="slug / key"
                                value={it.slug}
                                onChange={(e) =>
                                  setServiceGroups((prev) => {
                                    const next = [...prev];
                                    const gg = { ...next[gi]! };
                                    const items = [...(gg.itemImages ?? [])];
                                    items[ii] = {
                                      ...items[ii]!,
                                      slug: e.target.value,
                                    };
                                    gg.itemImages = items;
                                    next[gi] = gg;
                                    return next;
                                  })
                                }
                              />
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  className="rounded border border-[var(--admin-border)] px-1.5 py-0.5 text-[10px]"
                                  onClick={() => moveServiceItem(gi, ii, -1)}
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  className="rounded border border-[var(--admin-border)] px-1.5 py-0.5 text-[10px]"
                                  onClick={() => moveServiceItem(gi, ii, 1)}
                                >
                                  ↓
                                </button>
                              </div>
                              <button
                                type="button"
                                className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-2 py-1 text-[10px] font-medium text-[var(--admin-text)]"
                                onClick={() => {
                                  setMediaPickTarget({
                                    kind: "serviceItem",
                                    groupIndex: gi,
                                    itemIndex: ii,
                                  });
                                  setMediaPickerOpen(true);
                                }}
                              >
                                Pick image
                              </button>
                              <button
                                type="button"
                                className="text-[10px] text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                                onClick={() => removeServiceItem(gi, ii)}
                              >
                                Remove
                              </button>
                            </div>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              <input
                                className="rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs"
                                placeholder="Card title"
                                value={it.title}
                                onChange={(e) =>
                                  setServiceGroups((prev) => {
                                    const next = [...prev];
                                    const gg = { ...next[gi]! };
                                    const items = [...(gg.itemImages ?? [])];
                                    items[ii] = {
                                      ...items[ii]!,
                                      title: e.target.value,
                                    };
                                    gg.itemImages = items;
                                    next[gi] = gg;
                                    return next;
                                  })
                                }
                              />
                              <input
                                className="rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs"
                                placeholder="href / slug path"
                                value={it.href}
                                onChange={(e) =>
                                  setServiceGroups((prev) => {
                                    const next = [...prev];
                                    const gg = { ...next[gi]! };
                                    const items = [...(gg.itemImages ?? [])];
                                    items[ii] = {
                                      ...items[ii]!,
                                      href: e.target.value,
                                    };
                                    gg.itemImages = items;
                                    next[gi] = gg;
                                    return next;
                                  })
                                }
                              />
                            </div>
                            <textarea
                              className="mt-2 min-h-[48px] w-full rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs"
                              placeholder="Description"
                              value={it.description}
                              onChange={(e) =>
                                setServiceGroups((prev) => {
                                  const next = [...prev];
                                  const gg = { ...next[gi]! };
                                  const items = [...(gg.itemImages ?? [])];
                                  items[ii] = {
                                    ...items[ii]!,
                                    description: e.target.value,
                                  };
                                  gg.itemImages = items;
                                  next[gi] = gg;
                                  return next;
                                })
                              }
                            />
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              <input
                                className="rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs"
                                placeholder="Card image URL"
                                value={it.imageUrl}
                                onChange={(e) =>
                                  setServiceGroups((prev) => {
                                    const next = [...prev];
                                    const gg = { ...next[gi]! };
                                    const items = [...(gg.itemImages ?? [])];
                                    items[ii] = {
                                      ...items[ii]!,
                                      imageUrl: e.target.value,
                                    };
                                    gg.itemImages = items;
                                    next[gi] = gg;
                                    return next;
                                  })
                                }
                              />
                              <input
                                className="rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs"
                                placeholder="Card alt"
                                value={it.imageAlt}
                                onChange={(e) =>
                                  setServiceGroups((prev) => {
                                    const next = [...prev];
                                    const gg = { ...next[gi]! };
                                    const items = [...(gg.itemImages ?? [])];
                                    items[ii] = {
                                      ...items[ii]!,
                                      imageAlt: e.target.value,
                                    };
                                    gg.itemImages = items;
                                    next[gi] = gg;
                                    return next;
                                  })
                                }
                              />
                            </div>
                            <p className="mt-1 text-[9px] text-[var(--admin-muted)] font-mono">
                              mediaAssetId: {it.imageMediaAssetId || "—"}
                            </p>
                            <ImageThumb url={it.imageUrl} alt={it.imageAlt} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {canHaveEnterpriseVisuals ? (
            <div className="mt-5">
              <label className="block">
                <span className="text-xs font-medium text-[var(--admin-muted)]">
                  Who this is for (hero line)
                </span>
                <input
                  className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
                  placeholder="Optional line under kicker — operational, not slogan"
                  value={enterpriseAudience}
                  onChange={(e) => setEnterpriseAudience(e.target.value)}
                />
                <span className="mt-1 block text-[10px] text-[var(--admin-muted)]">
                  Maps to <code className="font-mono">enterpriseAudience</code> — same merge as CMS JSON.
                </span>
              </label>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                Enterprise visuals (optional)
              </p>
              <p className="mt-1 text-[10px] text-[var(--admin-muted)]">
                Set <code className="font-mono">assetRole</code> / purpose / priority for behavioural layout on the public site (e.g. hero → critical, diagram → explanation).
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(["hero", "capability", "process", "systemDiagram"] as const).map((key) => {
                  const v = enterpriseVisuals[key] ?? {};
                  return (
                    <div key={key} className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <p className="mr-auto text-sm font-medium text-[var(--admin-text)]">
                          {key === "systemDiagram"
                            ? "System diagram"
                            : key.charAt(0).toUpperCase() + key.slice(1)}
                        </p>
                        <button
                          type="button"
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-2.5 py-1.5 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
                          onClick={() => {
                            setMediaPickTarget({ kind: "enterprise", key });
                            setMediaPickerOpen(true);
                          }}
                        >
                          Pick
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-[var(--admin-border)] px-2.5 py-1.5 text-xs text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                          onClick={() =>
                            setEnterpriseVisuals((prev) => ({
                              ...prev,
                              [key]: {},
                            }))
                          }
                        >
                          Clear
                        </button>
                      </div>
                      <input
                        className="mt-2 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                        placeholder="Image URL"
                        value={v.imageUrl ?? ""}
                        onChange={(e) =>
                          setEnterpriseVisuals((prev) => ({
                            ...prev,
                            [key]: { ...v, imageUrl: e.target.value },
                          }))
                        }
                      />
                      <input
                        className="mt-2 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                        placeholder="Alt text (page language)"
                        value={v.imageAlt ?? ""}
                        onChange={(e) =>
                          setEnterpriseVisuals((prev) => ({
                            ...prev,
                            [key]: { ...v, imageAlt: e.target.value },
                          }))
                        }
                      />
                      <p className="mt-2 text-[10px] text-[var(--admin-muted)] font-mono">
                        mediaAssetId: {v.imageMediaAssetId || "—"}
                      </p>
                      <div className="mt-2 grid gap-2 text-[10px] sm:grid-cols-3">
                        <label className="block text-[var(--admin-muted)]">
                          assetRole
                          <select
                            className="mt-0.5 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-1 py-1 text-xs text-[var(--admin-text)]"
                            value={v.assetRole ?? ""}
                            onChange={(e) =>
                              setEnterpriseVisuals((prev) => ({
                                ...prev,
                                [key]: {
                                  ...v,
                                  assetRole: e.target.value || undefined,
                                },
                              }))
                            }
                          >
                            <option value="">—</option>
                            {[
                              "hero",
                              "diagram",
                              "case",
                              "roi",
                              "ui",
                              "decorative",
                            ].map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-[var(--admin-muted)]">
                          assetPurpose
                          <select
                            className="mt-0.5 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-1 py-1 text-xs"
                            value={v.assetPurpose ?? ""}
                            onChange={(e) =>
                              setEnterpriseVisuals((prev) => ({
                                ...prev,
                                [key]: {
                                  ...v,
                                  assetPurpose: e.target.value || undefined,
                                },
                              }))
                            }
                          >
                            <option value="">—</option>
                            {["conversion", "trust", "explanation"].map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-[var(--admin-muted)]">
                          assetPriority
                          <select
                            className="mt-0.5 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-1 py-1 text-xs"
                            value={v.assetPriority ?? ""}
                            onChange={(e) =>
                              setEnterpriseVisuals((prev) => ({
                                ...prev,
                                [key]: {
                                  ...v,
                                  assetPriority: e.target.value || undefined,
                                },
                              }))
                            }
                          >
                            <option value="">—</option>
                            {["critical", "supporting", "optional"].map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <ImageThumb
                        url={v.imageUrl ?? ""}
                        alt={v.imageAlt ?? ""}
                      />
                    </div>
                  );
                })}
              </div>

              <EnterpriseMarketingSectionsEditor
                draft={enterpriseProofDraft}
                setDraft={setEnterpriseProofDraft}
                requestMedia={(target) => {
                  setMediaPickTarget({ kind: "enterpriseStructured", target });
                  setMediaPickerOpen(true);
                }}
                rawJson={enterpriseRawJson}
                setRawJson={setEnterpriseRawJson}
                rawJsonError={enterpriseRawJsonError}
                setRawJsonError={setEnterpriseRawJsonError}
              />

              <div className="mt-6 border-t border-[var(--admin-border)] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                      Program cards
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--admin-muted)]">
                      Optional cards under the enterprise page visuals (title, body, link,
                      image).
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-3 py-1.5 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
                    onClick={() =>
                      setProgramCards((prev) => [...prev, emptyCard()])
                    }
                  >
                    Add card
                  </button>
                </div>
                {programCards.length === 0 ? (
                  <p className="mt-3 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm text-[var(--admin-muted)]">
                    No program cards yet. Optional — use for deep links or programme
                    highlights under the enterprise visuals.
                  </p>
                ) : (
                  <p className="mt-2 text-[10px] text-[var(--admin-muted)]">
                    Order on the page follows this list; ↑ ↓ reorders.
                  </p>
                )}
                <div className="mt-3 space-y-3">
                  {programCards.map((c, idx) => (
                    <div
                      key={c.id}
                      className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-[var(--admin-muted)]">
                          id: {c.id}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            title="Move up"
                            className="rounded border border-[var(--admin-border)] px-2 py-0.5 text-[10px]"
                            onClick={() => moveProgramCard(idx, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            title="Move down"
                            className="rounded border border-[var(--admin-border)] px-2 py-0.5 text-[10px]"
                            onClick={() => moveProgramCard(idx, 1)}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-2.5 py-1 text-[10px] font-medium text-[var(--admin-text)]"
                            onClick={() => {
                              setMediaPickTarget({ kind: "programCard", index: idx });
                              setMediaPickerOpen(true);
                            }}
                          >
                            Pick image
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-[var(--admin-border)] px-2.5 py-1 text-[10px] text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                            onClick={() =>
                              setProgramCards((prev) =>
                                prev.map((x, i) =>
                                  i === idx
                                    ? {
                                        ...x,
                                        imageUrl: "",
                                        imageAlt: "",
                                        imageMediaAssetId: "",
                                      }
                                    : x,
                                ),
                              )
                            }
                          >
                            Clear image
                          </button>
                          <button
                            type="button"
                            className="text-[10px] text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                            onClick={() =>
                              setProgramCards((prev) => prev.filter((_, i) => i !== idx))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <input
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                          placeholder="Title"
                          value={c.title}
                          onChange={(e) =>
                            setProgramCards((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, title: e.target.value } : x,
                              ),
                            )
                          }
                        />
                        <input
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                          placeholder="href (optional)"
                          value={c.href}
                          onChange={(e) =>
                            setProgramCards((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, href: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </div>
                      <textarea
                        className="mt-2 min-h-[72px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                        placeholder="Body / description"
                        value={c.body}
                        onChange={(e) =>
                          setProgramCards((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, body: e.target.value } : x,
                            ),
                          )
                        }
                      />
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <input
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                          placeholder="Image URL"
                          value={c.imageUrl}
                          onChange={(e) =>
                            setProgramCards((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, imageUrl: e.target.value } : x,
                              ),
                            )
                          }
                        />
                        <input
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                          placeholder="Image alt"
                          value={c.imageAlt}
                          onChange={(e) =>
                            setProgramCards((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, imageAlt: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-[var(--admin-muted)] font-mono">
                        mediaAssetId: {c.imageMediaAssetId || "—"}
                      </p>
                      <ImageThumb url={c.imageUrl} alt={c.imageAlt} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {canHaveAboutVisuals ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                About visuals (optional)
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(["brand", "oman", "delivery"] as const).map((key) => {
                  const v = aboutVisuals[key] ?? {};
                  return (
                    <div key={key} className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-[var(--admin-text)]">{key}</p>
                        <button
                          type="button"
                          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-2.5 py-1.5 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
                          onClick={() => {
                            setMediaPickTarget({ kind: "about", key });
                            setMediaPickerOpen(true);
                          }}
                        >
                          Pick
                        </button>
                      </div>
                      <input
                        className="mt-2 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                        placeholder="image URL"
                        value={v.imageUrl ?? ""}
                        onChange={(e) =>
                          setAboutVisuals((prev) => ({
                            ...prev,
                            [key]: { ...v, imageUrl: e.target.value },
                          }))
                        }
                      />
                      <input
                        className="mt-2 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
                        placeholder="alt"
                        value={v.imageAlt ?? ""}
                        onChange={(e) =>
                          setAboutVisuals((prev) => ({
                            ...prev,
                            [key]: { ...v, imageAlt: e.target.value },
                          }))
                        }
                      />
                      <p className="mt-2 text-[10px] text-[var(--admin-muted)] font-mono">
                        mediaAssetId: {v.imageMediaAssetId || "—"}
                      </p>
                      <ImageThumb
                        url={v.imageUrl ?? ""}
                        alt={v.imageAlt ?? ""}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-[var(--admin-muted)]">
              Kicker
            </span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
              value={kicker}
              onChange={(e) => setKicker(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[var(--admin-muted)]">
              Title (H1)
            </span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-[var(--admin-muted)]">
            Subtitle (optional)
          </span>
          <input
            className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-[var(--admin-muted)]">
            Lead
          </span>
          <textarea
            className="mt-1 min-h-[84px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
            value={lead}
            onChange={(e) => setLead(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-[var(--admin-muted)]">
            Body
          </span>
          <textarea
            className="mt-1 min-h-[180px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>

        {canHaveItems ? (
          <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                FAQ items
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="rounded-md border border-[var(--admin-border)] px-3 py-1.5 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
              >
                Add item
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {items.length === 0 ? (
                <p className="rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm text-[var(--admin-muted)]">
                  No FAQ entries yet. Add questions with “Add item”; order follows the list
                  (use ↑ ↓).
                </p>
              ) : (
                items.map((it, idx) => (
                  <div
                    key={it.id}
                    className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs text-[var(--admin-text)]">
                        <input
                          type="checkbox"
                          checked={it.visible}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, visible: e.target.checked } : x,
                              ),
                            )
                          }
                        />
                        Visible
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          title="Move up"
                          onClick={() => moveItem(idx, -1)}
                          className="rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          onClick={() => moveItem(idx, 1)}
                          className="rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="rounded border border-[var(--admin-border)] px-2 py-1 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <input
                      className="mt-2 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-2 text-sm"
                      placeholder="Question"
                      value={it.title}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x, i) =>
                            i === idx ? { ...x, title: e.target.value } : x,
                          ),
                        )
                      }
                    />
                    <textarea
                      className="mt-2 min-h-[80px] w-full rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-2 text-sm"
                      placeholder="Answer"
                      value={it.body}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x, i) =>
                            i === idx ? { ...x, body: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/80 p-3">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setAdvancedOpen((o) => !o)}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
              Secondary · Advanced JSON (keys not in the form)
            </span>
            <span className="text-xs text-[var(--admin-muted)]">
              {advancedOpen ? "Hide" : "Show"}
            </span>
          </button>
          {advancedOpen ? (
            <div className="mt-3 space-y-2">
              <p className="text-[10px] text-[var(--admin-muted)]">
                Rarely needed. Only keys outside the structured fields above merge here.
                Invalid JSON prevents saving — fix syntax or clear. Leave empty if unused.
              </p>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs text-[var(--admin-text)]"
                value={extraSectionsJson}
                onChange={(e) => setExtraSectionsJson(e.target.value)}
                placeholder='{ "customKey": "…" }'
              />
            </div>
          ) : null}
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-[var(--admin-muted)]">
              SEO title
            </span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[var(--admin-muted)]">
              SEO description
            </span>
            <textarea
              className="mt-1 min-h-[84px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </label>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!page}
            className="rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--admin-primary-hover)] disabled:opacity-50"
          >
            Save
          </button>
          {status ? (
            <span className="text-sm text-[var(--admin-muted)]">{status}</span>
          ) : null}
        </div>
      </form>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => {
          setMediaPickerOpen(false);
          setMediaPickTarget(null);
        }}
        onPick={(row) => {
          const url = row.publicUrl ?? "";
          const alt = row.altText ?? row.originalName;
          const id = row.id;
          const next: CmsVisual = {
            imageUrl: url,
            imageAlt: alt,
            imageMediaAssetId: id,
          };

          if (!mediaPickTarget) return;
          if (mediaPickTarget.kind === "hero") setHeroVisual(next);
          if (mediaPickTarget.kind === "office") setOfficeVisual(next);
          if (mediaPickTarget.kind === "trust") setTrustVisual(next);
          if (mediaPickTarget.kind === "serviceGroup") {
            setServiceGroups((prev) => {
              const out = [...prev];
              const cur = out[mediaPickTarget.index] ?? { groupId: "" };
              out[mediaPickTarget.index] = { ...cur, ...next };
              return out;
            });
          }
          if (mediaPickTarget.kind === "serviceItem") {
            setServiceGroups((prev) => {
              const out = [...prev];
              const g = out[mediaPickTarget.groupIndex] ?? { groupId: "" };
              const items = [...(g.itemImages ?? [])];
              const cur = items[mediaPickTarget.itemIndex] ?? { slug: "" };
              items[mediaPickTarget.itemIndex] = { ...cur, ...next };
              out[mediaPickTarget.groupIndex] = { ...g, itemImages: items };
              return out;
            });
          }
          if (mediaPickTarget.kind === "enterprise") {
            setEnterpriseVisuals((prev) => ({
              ...prev,
              [mediaPickTarget.key]: next,
            }));
          }
          if (mediaPickTarget.kind === "enterpriseStructured") {
            setEnterpriseProofDraft((d) =>
              applyEnterpriseStructuredMedia(d, mediaPickTarget.target, next),
            );
          }
          if (mediaPickTarget.kind === "about") {
            setAboutVisuals((prev) => ({
              ...prev,
              [mediaPickTarget.key]: next,
            }));
          }
          if (mediaPickTarget.kind === "programCard") {
            setProgramCards((prev) => {
              const out = [...prev];
              const cur = out[mediaPickTarget.index];
              if (!cur) return prev;
              out[mediaPickTarget.index] = { ...cur, ...next };
              return out;
            });
          }
          if (mediaPickTarget.kind === "reassuranceCard") {
            setReassuranceCards((prev) => {
              const out = [...prev];
              const cur = out[mediaPickTarget.index];
              if (!cur) return prev;
              out[mediaPickTarget.index] = { ...cur, ...next };
              return out;
            });
          }

          setMediaPickerOpen(false);
          setMediaPickTarget(null);
        }}
      />
    </div>
  );
}

