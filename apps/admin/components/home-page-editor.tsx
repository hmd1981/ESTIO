"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicApiBase } from "@/lib/api-base";
import { collectArabicLocaleWarnings } from "@/lib/locale-content-guard";
import { HOME_SECTION_IDS } from "@/lib/home-section-ids";
import { MediaPicker } from "@/components/media-picker";

type PageRow = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  status: string;
  sections: unknown;
};

const LOCALES = ["en", "ar"] as const;

/** Keys fully driven by structured editors — everything else is preserved via “Advanced JSON”. */
const MANAGED_KEYS = new Set([
  "_meta",
  "hero",
  "guided",
  "trust",
  "services",
  "enterprise",
  "industriesContent",
  "cta",
]);

type Visual = {
  imageUrl: string;
  imageAlt: string;
  imageMediaAssetId: string;
};

const emptyVisual = (): Visual => ({
  imageUrl: "",
  imageAlt: "",
  imageMediaAssetId: "",
});

type GuidedItem = {
  id: string;
  title: string;
  description: string;
  href: string;
} & Visual;

type TrustPoint = { title: string; body: string } & Visual;

type ServiceCard = {
  id: string;
  title: string;
  description: string;
  href: string;
} & Visual;

type EntBullet = { title: string; text: string };

type IndustryRow = {
  id: string;
  title: string;
  description: string;
  href: string;
} & Visual;

type BlockBase = {
  title: string;
  subtitle: string;
  body: string;
} & Visual;

type BlockVisualKey =
  | "guided"
  | "trust"
  | "services"
  | "enterprise"
  | "industriesContent"
  | "cta";

type MediaPickTarget =
  | { kind: "hero" }
  | { kind: "hero-video" }
  | { kind: "block"; key: BlockVisualKey }
  | { kind: "guided-item"; index: number }
  | { kind: "trust-item"; index: number }
  | { kind: "svc-item"; index: number }
  | { kind: "ent-bullet"; index: number }
  | { kind: "ind-item"; index: number };

function uid() {
  return crypto.randomUUID();
}

function readVisual(o: Record<string, unknown> | undefined): Visual {
  if (!o) return emptyVisual();
  return {
    imageUrl: String(o.imageUrl ?? ""),
    imageAlt: String(o.imageAlt ?? ""),
    imageMediaAssetId: String(o.imageMediaAssetId ?? ""),
  };
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const k of Object.keys(out)) {
    const v = out[k];
    if (v === undefined || v === "" || v === null) delete out[k];
  }
  return out;
}

function looksLikeVideoUrl(url: string) {
  return /\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i.test(url.trim());
}

function ImageThumb({ url, alt }: { url: string; alt: string }) {
  if (!url.trim()) return null;
  return (
    <div className="mt-2 aspect-video w-full max-h-32 overflow-hidden rounded border border-[var(--admin-border)] bg-black/10">
      {looksLikeVideoUrl(url) ? (
        <video
          src={url}
          className="h-full w-full object-cover"
          preload="metadata"
          muted
          playsInline
          controls
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt.trim() || "Preview"}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export function HomePageEditor() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [activeLocale, setActiveLocale] =
    useState<(typeof LOCALES)[number]>("en");
  const [metaOrder, setMetaOrder] = useState<string[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [published, setPublished] = useState(false);

  const [heroEyebrow, setHeroEyebrow] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroSubheadline, setHeroSubheadline] = useState("");
  const [heroPrimaryLabel, setHeroPrimaryLabel] = useState("");
  const [heroPrimaryHref, setHeroPrimaryHref] = useState("");
  const [heroSecondaryLabel, setHeroSecondaryLabel] = useState("");
  const [heroSecondaryHref, setHeroSecondaryHref] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroImageAlt, setHeroImageAlt] = useState("");
  const [heroImageMediaAssetId, setHeroImageMediaAssetId] = useState("");
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [heroVideoMediaAssetId, setHeroVideoMediaAssetId] = useState("");

  const [guided, setGuided] = useState<BlockBase>({
    title: "",
    subtitle: "",
    body: "",
    ...emptyVisual(),
  });
  const [guidedItems, setGuidedItems] = useState<GuidedItem[]>([]);

  const [trust, setTrust] = useState<BlockBase>({
    title: "",
    subtitle: "",
    body: "",
    ...emptyVisual(),
  });
  const [trustPoints, setTrustPoints] = useState<TrustPoint[]>([]);

  const [services, setServices] = useState<BlockBase>({
    title: "",
    subtitle: "",
    body: "",
    ...emptyVisual(),
  });
  const [serviceCards, setServiceCards] = useState<ServiceCard[]>([]);

  const [enterprise, setEnterprise] = useState<
    BlockBase & { ctaLabel: string; ctaHref: string }
  >({
    title: "",
    subtitle: "",
    body: "",
    ctaLabel: "",
    ctaHref: "",
    ...emptyVisual(),
  });
  const [entBullets, setEntBullets] = useState<EntBullet[]>([]);

  const [industries, setIndustries] = useState<BlockBase>({
    title: "",
    subtitle: "",
    body: "",
    ...emptyVisual(),
  });
  const [industryRows, setIndustryRows] = useState<IndustryRow[]>([]);

  const [cta, setCta] = useState<
    BlockBase & { ctaLabel: string; ctaHref: string }
  >({
    title: "",
    subtitle: "",
    body: "",
    ctaLabel: "",
    ctaHref: "",
    ...emptyVisual(),
  });

  const [extraSectionsJson, setExtraSectionsJson] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [highlightSection, setHighlightSection] = useState<string>("hero");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickTarget, setMediaPickTarget] = useState<MediaPickTarget>({
    kind: "hero",
  });

  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const homePage = useMemo(() => {
    return pages.find((p) => p.slug === "home" && p.locale === activeLocale);
  }, [pages, activeLocale]);

  useEffect(() => {
    const s = (homePage?.sections ?? {}) as Record<string, unknown>;
    const m = (s._meta ?? {}) as Record<string, unknown>;
    setMetaOrder((m.sectionOrder as string[]) ?? []);
    setHidden(new Set((m.hiddenSections as string[]) ?? []));
    setHighlightSection(String(m.highlightSection ?? "hero"));
    setPublished(homePage?.status === "PUBLISHED");

    const hero = (s.hero ?? {}) as Record<string, unknown>;
    setHeroEyebrow(String(hero.eyebrow ?? ""));
    setHeroHeadline(String(hero.headline ?? ""));
    setHeroSubheadline(String(hero.subheadline ?? ""));
    setHeroPrimaryLabel(String((hero.primaryCta as { label?: string })?.label ?? ""));
    setHeroPrimaryHref(String((hero.primaryCta as { href?: string })?.href ?? ""));
    setHeroSecondaryLabel(String((hero.secondaryCta as { label?: string })?.label ?? ""));
    setHeroSecondaryHref(String((hero.secondaryCta as { href?: string })?.href ?? ""));
    setHeroImageUrl(String(hero.imageUrl ?? ""));
    setHeroImageAlt(String(hero.imageAlt ?? ""));
    setHeroImageMediaAssetId(String(hero.imageMediaAssetId ?? ""));
    setHeroVideoUrl(String(hero.videoUrl ?? ""));
    setHeroVideoMediaAssetId(String(hero.videoMediaAssetId ?? ""));

    const g = (s.guided ?? {}) as Record<string, unknown>;
    setGuided({
      title: String(g.title ?? ""),
      subtitle: String(g.subtitle ?? ""),
      body: String(g.body ?? ""),
      ...readVisual(g),
    });
    const gi = Array.isArray(g.items) ? (g.items as unknown[]) : [];
    setGuidedItems(
      gi.map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id: String(r.id ?? uid()),
          title: String(r.title ?? r.label ?? ""),
          description: String(r.description ?? ""),
          href: String(r.href ?? ""),
          ...readVisual(r),
        };
      }),
    );

    const t = (s.trust ?? {}) as Record<string, unknown>;
    setTrust({
      title: String(t.title ?? ""),
      subtitle: String(t.subtitle ?? ""),
      body: String(t.body ?? ""),
      ...readVisual(t),
    });
    const tp = Array.isArray(t.items) ? (t.items as unknown[]) : [];
    setTrustPoints(
      tp.map((row) => {
        const r = row as Record<string, unknown>;
        return {
          title: String(r.title ?? ""),
          body: String(r.body ?? r.text ?? r.description ?? ""),
          ...readVisual(r),
        };
      }),
    );

    const sv = (s.services ?? {}) as Record<string, unknown>;
    setServices({
      title: String(sv.title ?? ""),
      subtitle: String(sv.subtitle ?? ""),
      body: String(sv.body ?? ""),
      ...readVisual(sv),
    });
    const sc = Array.isArray(sv.items) ? (sv.items as unknown[]) : [];
    setServiceCards(
      sc.map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id: String(r.id ?? uid()),
          title: String(r.title ?? r.label ?? ""),
          description: String(r.description ?? ""),
          href: String(r.href ?? ""),
          ...readVisual(r),
        };
      }),
    );

    const e = (s.enterprise ?? {}) as Record<string, unknown>;
    setEnterprise({
      title: String(e.title ?? ""),
      subtitle: String(e.subtitle ?? ""),
      body: String(e.body ?? ""),
      ctaLabel: String(e.ctaLabel ?? ""),
      ctaHref: String(e.ctaHref ?? ""),
      ...readVisual(e),
    });
    const eb = Array.isArray(e.items) ? (e.items as unknown[]) : [];
    setEntBullets(
      eb.map((row) => {
        const r = row as Record<string, unknown>;
        return {
          title: String(r.title ?? r.label ?? ""),
          text: String(r.text ?? r.description ?? ""),
        };
      }),
    );

    const ind = (s.industriesContent ?? {}) as Record<string, unknown>;
    setIndustries({
      title: String(ind.title ?? ""),
      subtitle: String(ind.subtitle ?? ""),
      body: String(ind.body ?? ""),
      ...readVisual(ind),
    });
    const ir = Array.isArray(ind.items) ? (ind.items as unknown[]) : [];
    setIndustryRows(
      ir.map((row) => {
        const r = row as Record<string, unknown>;
        return {
          id: String(r.id ?? uid()),
          title: String(r.title ?? r.label ?? r.name ?? ""),
          description: String(r.description ?? r.detail ?? ""),
          href: String(r.href ?? ""),
          ...readVisual(r),
        };
      }),
    );

    const c = (s.cta ?? {}) as Record<string, unknown>;
    setCta({
      title: String(c.title ?? ""),
      subtitle: String(c.subtitle ?? ""),
      body: String(c.body ?? ""),
      ctaLabel: String(c.ctaLabel ?? (c.cta as { label?: string } | undefined)?.label ?? ""),
      ctaHref: String(c.ctaHref ?? (c.cta as { href?: string } | undefined)?.href ?? ""),
      ...readVisual(c),
    });

    const extra: Record<string, unknown> = {};
    for (const key of Object.keys(s)) {
      if (!MANAGED_KEYS.has(key)) extra[key] = s[key];
    }
    setExtraSectionsJson(
      Object.keys(extra).length > 0 ? JSON.stringify(extra, null, 2) : "",
    );
  }, [homePage?.id, homePage?.sections, activeLocale]);

  const ensureHomePages = async () => {
    setStatus(null);
    for (const loc of LOCALES) {
      const exists = pages.some((p) => p.slug === "home" && p.locale === loc);
      if (exists) continue;
      const r = await fetch(`${getPublicApiBase()}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: "home",
          locale: loc,
          title: loc === "ar" ? "الرئيسية" : "Home",
          status: "DRAFT",
          sections: {},
        }),
      });
      if (!r.ok) {
        setStatus(`Create failed (${loc}): ${await r.text()}`);
        return;
      }
    }
    setStatus("Home pages created for EN and AR.");
    await load();
  };

  const applyVisual = (
    v: Visual,
    row: { publicUrl: string | null; altText: string | null; originalName: string; id: string },
  ) => ({
    imageUrl: row.publicUrl ?? v.imageUrl,
    imageAlt: v.imageAlt || row.altText || row.originalName || "",
    imageMediaAssetId: row.id,
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homePage) {
      setStatus("Create home pages first.");
      return;
    }

    let extraParsed: Record<string, unknown> = {};
    if (extraSectionsJson.trim()) {
      try {
        extraParsed = JSON.parse(extraSectionsJson) as Record<string, unknown>;
      } catch {
        setStatus(
          "Advanced JSON is invalid — fix the syntax or clear the field before saving.",
        );
        return;
      }
    }

    const prev = (homePage.sections ?? {}) as Record<string, unknown>;
    const prevGuided = (prev.guided ?? {}) as Record<string, unknown>;
    const prevTrust = (prev.trust ?? {}) as Record<string, unknown>;
    const prevSvc = (prev.services ?? {}) as Record<string, unknown>;
    const prevEnt = (prev.enterprise ?? {}) as Record<string, unknown>;
    const prevInd = (prev.industriesContent ?? {}) as Record<string, unknown>;
    const prevCta = (prev.cta ?? {}) as Record<string, unknown>;
    const prevHero = (prev.hero ?? {}) as Record<string, unknown>;

    const sectionOrder =
      metaOrder.length > 0 ? metaOrder.filter(Boolean) : undefined;
    const hiddenSections = [...hidden.values()];

    const guidedBlock = stripUndefined({
      ...prevGuided,
      title: guided.title.trim() || undefined,
      subtitle: guided.subtitle.trim() || undefined,
      body: guided.body.trim() || undefined,
      imageUrl: guided.imageUrl.trim() || undefined,
      imageAlt: guided.imageAlt.trim() || undefined,
      imageMediaAssetId: guided.imageMediaAssetId.trim() || undefined,
      items:
        guidedItems.length > 0
          ? guidedItems.map((it) =>
              stripUndefined({
                id: it.id,
                title: it.title.trim() || undefined,
                label: it.title.trim() || undefined,
                description: it.description.trim() || undefined,
                href: it.href.trim() || undefined,
                imageUrl: it.imageUrl.trim() || undefined,
                imageAlt: it.imageAlt.trim() || undefined,
                imageMediaAssetId: it.imageMediaAssetId.trim() || undefined,
              }),
            )
          : undefined,
    }) as Record<string, unknown>;

    const trustBlock = stripUndefined({
      ...prevTrust,
      title: trust.title.trim() || undefined,
      subtitle: trust.subtitle.trim() || undefined,
      body: trust.body.trim() || undefined,
      imageUrl: trust.imageUrl.trim() || undefined,
      imageAlt: trust.imageAlt.trim() || undefined,
      imageMediaAssetId: trust.imageMediaAssetId.trim() || undefined,
      items:
        trustPoints.length > 0
          ? trustPoints.map((p) =>
              stripUndefined({
                title: p.title.trim() || undefined,
                body: p.body.trim() || undefined,
                imageUrl: p.imageUrl.trim() || undefined,
                imageAlt: p.imageAlt.trim() || undefined,
                imageMediaAssetId: p.imageMediaAssetId.trim() || undefined,
              }),
            )
          : undefined,
    }) as Record<string, unknown>;

    const servicesBlock = stripUndefined({
      ...prevSvc,
      title: services.title.trim() || undefined,
      subtitle: services.subtitle.trim() || undefined,
      body: services.body.trim() || undefined,
      imageUrl: services.imageUrl.trim() || undefined,
      imageAlt: services.imageAlt.trim() || undefined,
      imageMediaAssetId: services.imageMediaAssetId.trim() || undefined,
      items:
        serviceCards.length > 0
          ? serviceCards.map((c) =>
              stripUndefined({
                id: c.id,
                title: c.title.trim() || undefined,
                label: c.title.trim() || undefined,
                description: c.description.trim() || undefined,
                href: c.href.trim() || undefined,
                imageUrl: c.imageUrl.trim() || undefined,
                imageAlt: c.imageAlt.trim() || undefined,
                imageMediaAssetId: c.imageMediaAssetId.trim() || undefined,
              }),
            )
          : undefined,
    }) as Record<string, unknown>;

    const enterpriseBlock = stripUndefined({
      ...prevEnt,
      title: enterprise.title.trim() || undefined,
      subtitle: enterprise.subtitle.trim() || undefined,
      body: enterprise.body.trim() || undefined,
      ctaLabel: enterprise.ctaLabel.trim() || undefined,
      ctaHref: enterprise.ctaHref.trim() || undefined,
      imageUrl: enterprise.imageUrl.trim() || undefined,
      imageAlt: enterprise.imageAlt.trim() || undefined,
      imageMediaAssetId: enterprise.imageMediaAssetId.trim() || undefined,
      items:
        entBullets.length > 0
          ? entBullets.map((b) =>
              stripUndefined({
                title: b.title.trim() || undefined,
                label: b.title.trim() || undefined,
                description: b.text.trim() || undefined,
                text: b.text.trim() || undefined,
              }),
            )
          : undefined,
    }) as Record<string, unknown>;

    const industriesBlock = stripUndefined({
      ...prevInd,
      title: industries.title.trim() || undefined,
      subtitle: industries.subtitle.trim() || undefined,
      body: industries.body.trim() || undefined,
      imageUrl: industries.imageUrl.trim() || undefined,
      imageAlt: industries.imageAlt.trim() || undefined,
      imageMediaAssetId: industries.imageMediaAssetId.trim() || undefined,
      items:
        industryRows.length > 0
          ? industryRows.map((r) =>
              stripUndefined({
                id: r.id,
                title: r.title.trim() || undefined,
                label: r.title.trim() || undefined,
                name: r.title.trim() || undefined,
                description: r.description.trim() || undefined,
                detail: r.description.trim() || undefined,
                href: r.href.trim() || undefined,
                imageUrl: r.imageUrl.trim() || undefined,
                imageAlt: r.imageAlt.trim() || undefined,
                imageMediaAssetId: r.imageMediaAssetId.trim() || undefined,
              }),
            )
          : undefined,
    }) as Record<string, unknown>;

    const ctaBlock = stripUndefined({
      ...prevCta,
      title: cta.title.trim() || undefined,
      subtitle: cta.subtitle.trim() || undefined,
      body: cta.body.trim() || undefined,
      ctaLabel: cta.ctaLabel.trim() || undefined,
      ctaHref: cta.ctaHref.trim() || undefined,
      imageUrl: cta.imageUrl.trim() || undefined,
      imageAlt: cta.imageAlt.trim() || undefined,
      imageMediaAssetId: cta.imageMediaAssetId.trim() || undefined,
    }) as Record<string, unknown>;

    const heroBlock = stripUndefined({
      ...prevHero,
      eyebrow: heroEyebrow.trim() || undefined,
      headline: heroHeadline.trim() || undefined,
      subheadline: heroSubheadline.trim() || undefined,
      primaryCta:
        heroPrimaryLabel.trim() || heroPrimaryHref.trim()
          ? {
              label: heroPrimaryLabel.trim() || undefined,
              href: heroPrimaryHref.trim() || undefined,
            }
          : undefined,
      secondaryCta:
        heroSecondaryLabel.trim() || heroSecondaryHref.trim()
          ? {
              label: heroSecondaryLabel.trim() || undefined,
              href: heroSecondaryHref.trim() || undefined,
            }
          : undefined,
      imageUrl: heroImageUrl.trim() || undefined,
      imageAlt: heroImageAlt.trim() || undefined,
      imageMediaAssetId: heroImageMediaAssetId.trim() || undefined,
      videoUrl: heroVideoUrl.trim() || undefined,
      videoMediaAssetId: heroVideoMediaAssetId.trim() || undefined,
    }) as Record<string, unknown>;

    const sections: Record<string, unknown> = {
      ...prev,
      ...extraParsed,
      _meta: stripUndefined({
        ...(prev._meta as object),
        sectionOrder,
        hiddenSections,
        highlightSection: highlightSection.trim() || undefined,
      }),
      hero: heroBlock,
      guided: guidedBlock,
      trust: trustBlock,
      services: servicesBlock,
      enterprise: enterpriseBlock,
      industriesContent: industriesBlock,
      cta: ctaBlock,
    };

    setStatus(null);
    try {
      const r = await fetch(`${getPublicApiBase()}/pages/${homePage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    }
  };

  const openPicker = (t: MediaPickTarget) => {
    setMediaPickTarget(t);
    setMediaPickerOpen(true);
  };

  const onMediaPick = (row: {
    publicUrl: string | null;
    altText: string | null;
    originalName: string;
    id: string;
  }) => {
    const url = row.publicUrl ?? "";
    const alt = row.altText ?? row.originalName;
    const t = mediaPickTarget;
    if (t.kind === "hero") {
      if (url) setHeroImageUrl(url);
      setHeroImageMediaAssetId(row.id);
      if (!heroImageAlt.trim() && alt) setHeroImageAlt(alt);
    } else if (t.kind === "hero-video") {
      if (url) setHeroVideoUrl(url);
      setHeroVideoMediaAssetId(row.id);
    } else if (t.kind === "block") {
      const patch = applyVisual(emptyVisual(), row);
      const merge = (base: Visual) => ({ ...base, ...patch });
      if (t.key === "guided") setGuided((s) => ({ ...s, ...merge(s) }));
      if (t.key === "trust") setTrust((s) => ({ ...s, ...merge(s) }));
      if (t.key === "services") setServices((s) => ({ ...s, ...merge(s) }));
      if (t.key === "enterprise") setEnterprise((s) => ({ ...s, ...merge(s) }));
      if (t.key === "industriesContent") setIndustries((s) => ({ ...s, ...merge(s) }));
      if (t.key === "cta") setCta((s) => ({ ...s, ...merge(s) }));
    } else if (t.kind === "guided-item") {
      setGuidedItems((prev) => {
        const next = [...prev];
        const cur = next[t.index];
        if (!cur) return prev;
        next[t.index] = { ...cur, ...applyVisual(cur, row) };
        return next;
      });
    } else if (t.kind === "trust-item") {
      setTrustPoints((prev) => {
        const next = [...prev];
        const cur = next[t.index];
        if (!cur) return prev;
        next[t.index] = { ...cur, ...applyVisual(cur, row) };
        return next;
      });
    } else if (t.kind === "svc-item") {
      setServiceCards((prev) => {
        const next = [...prev];
        const cur = next[t.index];
        if (!cur) return prev;
        next[t.index] = { ...cur, ...applyVisual(cur, row) };
        return next;
      });
    } else if (t.kind === "ind-item") {
      setIndustryRows((prev) => {
        const next = [...prev];
        const cur = next[t.index];
        if (!cur) return prev;
        next[t.index] = { ...cur, ...applyVisual(cur, row) };
        return next;
      });
    }
    setMediaPickerOpen(false);
  };

  const arabicLocaleWarnings = useMemo(() => {
    if (activeLocale !== "ar") return [];
    const entries: { label: string; value: string }[] = [
      { label: "Hero — eyebrow", value: heroEyebrow },
      { label: "Hero — headline", value: heroHeadline },
      { label: "Hero — subheadline", value: heroSubheadline },
      { label: "Hero — primary CTA", value: heroPrimaryLabel },
      { label: "Hero — secondary CTA", value: heroSecondaryLabel },
      { label: "Hero — image alt", value: heroImageAlt },
      { label: "Guided — title", value: guided.title },
      { label: "Guided — subtitle", value: guided.subtitle },
      { label: "Guided — body", value: guided.body },
      { label: "Guided — image alt", value: guided.imageAlt },
      ...guidedItems.flatMap((it, i) => [
        { label: `Guided item ${i + 1} — title`, value: it.title },
        { label: `Guided item ${i + 1} — description`, value: it.description },
        { label: `Guided item ${i + 1} — image alt`, value: it.imageAlt },
      ]),
      { label: "Trust — title", value: trust.title },
      { label: "Trust — subtitle", value: trust.subtitle },
      { label: "Trust — body", value: trust.body },
      { label: "Trust — image alt", value: trust.imageAlt },
      ...trustPoints.flatMap((p, i) => [
        { label: `Trust point ${i + 1}`, value: p.title },
        { label: `Trust point ${i + 1} — body`, value: p.body },
        { label: `Trust point ${i + 1} — image alt`, value: p.imageAlt },
      ]),
      { label: "Services — title", value: services.title },
      { label: "Services — subtitle", value: services.subtitle },
      { label: "Services — body", value: services.body },
      { label: "Services — image alt", value: services.imageAlt },
      ...serviceCards.flatMap((c, i) => [
        { label: `Service card ${i + 1} — title`, value: c.title },
        { label: `Service card ${i + 1} — description`, value: c.description },
        { label: `Service card ${i + 1} — image alt`, value: c.imageAlt },
      ]),
      { label: "Enterprise — title", value: enterprise.title },
      { label: "Enterprise — subtitle", value: enterprise.subtitle },
      { label: "Enterprise — body", value: enterprise.body },
      { label: "Enterprise — CTA label", value: enterprise.ctaLabel },
      { label: "Enterprise — image alt", value: enterprise.imageAlt },
      ...entBullets.flatMap((b, i) => [
        { label: `Enterprise bullet ${i + 1}`, value: b.title },
        { label: `Enterprise bullet ${i + 1} — text`, value: b.text },
      ]),
      { label: "Industries — title", value: industries.title },
      { label: "Industries — subtitle", value: industries.subtitle },
      { label: "Industries — body", value: industries.body },
      { label: "Industries — image alt", value: industries.imageAlt },
      ...industryRows.flatMap((r, i) => [
        { label: `Industry ${i + 1} — title`, value: r.title },
        { label: `Industry ${i + 1} — description`, value: r.description },
        { label: `Industry ${i + 1} — image alt`, value: r.imageAlt },
      ]),
      { label: "Final CTA — title", value: cta.title },
      { label: "Final CTA — body", value: cta.body },
      { label: "Final CTA — button", value: cta.ctaLabel },
      { label: "Final CTA — image alt", value: cta.imageAlt },
    ];
    return collectArabicLocaleWarnings(entries);
  }, [
    activeLocale,
    heroEyebrow,
    heroHeadline,
    heroSubheadline,
    heroPrimaryLabel,
    heroSecondaryLabel,
    heroImageAlt,
    guided,
    guidedItems,
    trust,
    trustPoints,
    services,
    serviceCards,
    enterprise,
    entBullets,
    industries,
    industryRows,
    cta,
  ]);

  const visualFieldRow = (
    label: string,
    v: Visual,
    setV: (fn: (prev: Visual) => Visual) => void,
    onPick: () => void,
  ) => (
    <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="mr-auto text-xs font-medium text-[var(--admin-muted)]">{label}</span>
        <button
          type="button"
          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-2 py-1 text-xs"
          onClick={onPick}
        >
          Pick image
        </button>
        <button
          type="button"
          className="rounded-md border border-[var(--admin-border)] px-2 py-1 text-xs text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
          onClick={() =>
            setV(() => ({
              imageUrl: "",
              imageAlt: "",
              imageMediaAssetId: "",
            }))
          }
        >
          Clear image
        </button>
      </div>
      <p className="mt-2 text-[10px] leading-snug text-[var(--admin-muted)]">
        URL from media library or paste a public URL. Alt should describe the image for screen readers (locale of the page).
      </p>
      <input
        className="mt-2 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
        placeholder="Image URL"
        value={v.imageUrl}
        onChange={(e) =>
          setV((prev) => ({ ...prev, imageUrl: e.target.value }))
        }
      />
      <input
        className="mt-2 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
        placeholder="Alt text (accessibility)"
        value={v.imageAlt}
        onChange={(e) =>
          setV((prev) => ({ ...prev, imageAlt: e.target.value }))
        }
      />
      <p className="mt-1 font-mono text-[10px] text-[var(--admin-muted)]">
        mediaAssetId: {v.imageMediaAssetId || "—"}
      </p>
      <ImageThumb url={v.imageUrl} alt={v.imageAlt} />
    </div>
  );

  if (loading) {
    return <p className="text-sm text-[var(--admin-muted)]">Loading…</p>;
  }

  const missingHome = !LOCALES.every((loc) =>
    pages.some((p) => p.slug === "home" && p.locale === loc),
  );

  const previewUrl = (() => {
    const base = (process.env.NEXT_PUBLIC_WEB_URL ?? "http://127.0.0.1:3000").replace(
      /\/$/,
      "",
    );
    const token = process.env.NEXT_PUBLIC_PREVIEW_TOKEN?.trim();
    const qs = new URLSearchParams();
    if (token) qs.set("previewToken", token);
    if (highlightSection.trim()) qs.set("highlight", highlightSection.trim());
    const q = qs.toString();
    return q ? `${base}/${activeLocale}?${q}` : `${base}/${activeLocale}`;
  })();

  return (
    <div className="max-w-4xl space-y-4">
      <p className="text-sm text-[var(--admin-muted)]">
        Structured home editor — maps to <code className="text-xs">Page.sections</code> blocks
        (<code className="text-xs">guided</code>, <code className="text-xs">trust</code>,{" "}
        <code className="text-xs">services</code>, <code className="text-xs">enterprise</code>,{" "}
        <code className="text-xs">industriesContent</code>, <code className="text-xs">cta</code>
        ). Advanced JSON keeps any other keys.
      </p>
      {missingHome ? (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-[var(--admin-text)]">
            No home row for EN/AR. Create draft home pages first.
          </p>
          <button
            type="button"
            className="mt-2 rounded-md bg-[var(--admin-primary)] px-3 py-1.5 text-sm font-medium text-white"
            onClick={() => void ensureHomePages()}
          >
            Create home (EN + AR)
          </button>
        </div>
      ) : null}
      <div className="flex gap-2 border-b border-[var(--admin-border)] pb-2">
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
        <label className="ml-auto flex items-center gap-2 text-sm text-[var(--admin-text)]">
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
      {activeLocale === "ar" ? (
        <p className="text-xs text-[var(--admin-muted)]">
          Arabic fields: keep sentences short and direct; Latin product names (CRM, etc.) are
          fine. Alt text should match the page language.
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
      {homePage ? (
        <p className="text-xs text-[var(--admin-muted)]">
          Page id <code>{homePage.id}</code> · status {homePage.status}
        </p>
      ) : null}

      <form onSubmit={save} className="space-y-4">
        <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Section order & visibility
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="text-sm text-[var(--admin-text)]">
              Highlight
              <select
                className="ml-2 rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1 text-xs"
                value={highlightSection}
                onChange={(e) => setHighlightSection(e.target.value)}
              >
                {HOME_SECTION_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 space-y-2">
            {(metaOrder.length > 0 ? metaOrder : [...HOME_SECTION_IDS]).map(
              (id, idx, arr) => {
                const isHidden = hidden.has(id);
                return (
                  <div
                    key={`${id}-${idx}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[var(--admin-text)]">{id}</span>
                      <label className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
                        <input
                          type="checkbox"
                          checked={!isHidden}
                          onChange={(e) => {
                            const next = new Set(hidden);
                            if (e.target.checked) next.delete(id);
                            else next.add(id);
                            setHidden(next);
                          }}
                        />
                        Visible
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        className="rounded border border-[var(--admin-border)] px-2 py-1 text-xs disabled:opacity-50"
                        onClick={() => {
                          const next = [...arr];
                          const tmp = next[idx - 1]!;
                          next[idx - 1] = next[idx]!;
                          next[idx] = tmp;
                          setMetaOrder(next);
                        }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={idx === arr.length - 1}
                        className="rounded border border-[var(--admin-border)] px-2 py-1 text-xs disabled:opacity-50"
                        onClick={() => {
                          const next = [...arr];
                          const tmp = next[idx + 1]!;
                          next[idx + 1] = next[idx]!;
                          next[idx] = tmp;
                          setMetaOrder(next);
                        }}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              },
            )}
            {metaOrder.length === 0 ? (
              <button
                type="button"
                className="text-xs text-[var(--admin-primary)] underline-offset-2 hover:underline"
                onClick={() => setMetaOrder([...HOME_SECTION_IDS])}
              >
                Enable custom ordering
              </button>
            ) : (
              <button
                type="button"
                className="text-xs text-[var(--admin-primary)] underline-offset-2 hover:underline"
                onClick={() => setMetaOrder([])}
              >
                Reset to default ordering
              </button>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Hero
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Eyebrow</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={heroEyebrow}
                onChange={(e) => setHeroEyebrow(e.target.value)}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Headline</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Subheadline</span>
              <textarea
                className="mt-1 min-h-[90px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Primary CTA label</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={heroPrimaryLabel}
                onChange={(e) => setHeroPrimaryLabel(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Primary CTA href</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={heroPrimaryHref}
                onChange={(e) => setHeroPrimaryHref(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Secondary CTA label</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={heroSecondaryLabel}
                onChange={(e) => setHeroSecondaryLabel(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Secondary CTA href</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={heroSecondaryHref}
                onChange={(e) => setHeroSecondaryHref(e.target.value)}
              />
            </label>
            <div className="sm:col-span-2">
              {visualFieldRow(
                "Hero image",
                {
                  imageUrl: heroImageUrl,
                  imageAlt: heroImageAlt,
                  imageMediaAssetId: heroImageMediaAssetId,
                },
                (fn) => {
                  const next = fn({
                    imageUrl: heroImageUrl,
                    imageAlt: heroImageAlt,
                    imageMediaAssetId: heroImageMediaAssetId,
                  });
                  setHeroImageUrl(next.imageUrl);
                  setHeroImageAlt(next.imageAlt);
                  setHeroImageMediaAssetId(next.imageMediaAssetId);
                },
                () => openPicker({ kind: "hero" }),
              )}
            </div>
            <div className="sm:col-span-2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="mr-auto text-xs font-medium text-[var(--admin-muted)]">
                  Hero video
                </span>
                <button
                  type="button"
                  className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-2 py-1 text-xs"
                  onClick={() => openPicker({ kind: "hero-video" })}
                >
                  Pick video
                </button>
                <button
                  type="button"
                  className="rounded-md border border-[var(--admin-border)] px-2 py-1 text-xs text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                  onClick={() => {
                    setHeroVideoUrl("");
                    setHeroVideoMediaAssetId("");
                  }}
                >
                  Clear video
                </button>
              </div>
              <p className="mt-2 text-[10px] leading-snug text-[var(--admin-muted)]">
                Optional. When set, the public hero uses this video first and falls back to the
                current hero image as the poster.
              </p>
              <input
                className="mt-2 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                placeholder="Video URL"
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
              />
              <p className="mt-1 font-mono text-[10px] text-[var(--admin-muted)]">
                mediaAssetId: {heroVideoMediaAssetId || "—"}
              </p>
              <ImageThumb url={heroVideoUrl} alt="Hero video preview" />
            </div>
          </div>
        </section>

        {/* Guided */}
        <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Guided intent
          </h3>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">
            Maps to <code className="font-mono">guided</code> · items drive the four cards.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Section title</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={guided.title}
                onChange={(e) => setGuided((s) => ({ ...s, title: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Subtitle</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={guided.subtitle}
                onChange={(e) => setGuided((s) => ({ ...s, subtitle: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Description (body)</span>
              <textarea
                className="mt-1 min-h-[72px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={guided.body}
                onChange={(e) => setGuided((s) => ({ ...s, body: e.target.value }))}
              />
            </label>
            <div className="sm:col-span-2">
              {visualFieldRow(
                "Section image (optional)",
                guided,
                (fn) => setGuided((s) => ({ ...s, ...fn(s) })),
                () => openPicker({ kind: "block", key: "guided" }),
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--admin-muted)]">Items</span>
            <button
              type="button"
              className="rounded-md border border-[var(--admin-border)] px-2 py-1 text-xs"
              onClick={() =>
                setGuidedItems((prev) => [
                  ...prev,
                  {
                    id: uid(),
                    title: "",
                    description: "",
                    href: "",
                    ...emptyVisual(),
                  },
                ])
              }
            >
              Add item
            </button>
          </div>
          {guidedItems.length === 0 ? (
            <p className="mt-2 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm text-[var(--admin-muted)]">
              No guided cards yet. Add up to four items — each becomes a path on the home page.
            </p>
          ) : (
            <p className="mt-2 text-[10px] text-[var(--admin-muted)]">
              Public order matches the list below (top = first card). Use ↑ ↓ to reorder.
            </p>
          )}
          <div className="mt-2 space-y-3">
            {guidedItems.map((it, i) => (
              <div
                key={it.id}
                className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3"
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    title="Move up"
                    disabled={i === 0}
                    className="rounded border px-2 py-0.5 text-xs disabled:opacity-50"
                    onClick={() =>
                      setGuidedItems((p) => {
                        const n = [...p];
                        [n[i - 1], n[i]] = [n[i]!, n[i - 1]!];
                        return n;
                      })
                    }
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={i === guidedItems.length - 1}
                    className="rounded border px-2 py-0.5 text-xs disabled:opacity-50"
                    onClick={() =>
                      setGuidedItems((p) => {
                        const n = [...p];
                        [n[i + 1], n[i]] = [n[i]!, n[i + 1]!];
                        return n;
                      })
                    }
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-xs text-amber-600"
                    onClick={() => setGuidedItems((p) => p.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input
                    className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                    placeholder="Title"
                    value={it.title}
                    onChange={(e) =>
                      setGuidedItems((p) =>
                        p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                      )
                    }
                  />
                  <input
                    className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                    placeholder="href"
                    value={it.href}
                    onChange={(e) =>
                      setGuidedItems((p) =>
                        p.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)),
                      )
                    }
                  />
                  <textarea
                    className="sm:col-span-2 rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                    placeholder="Description"
                    rows={2}
                    value={it.description}
                    onChange={(e) =>
                      setGuidedItems((p) =>
                        p.map((x, j) =>
                          j === i ? { ...x, description: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
                <div className="mt-2">
                  {visualFieldRow(
                    "Item image",
                    it,
                    (fn) =>
                      setGuidedItems((p) =>
                        p.map((x, j) => (j === i ? { ...x, ...fn(x) } : x)),
                      ),
                    () => openPicker({ kind: "guided-item", index: i }),
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">Trust</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Title</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={trust.title}
                onChange={(e) => setTrust((s) => ({ ...s, title: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Subtitle</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={trust.subtitle}
                onChange={(e) => setTrust((s) => ({ ...s, subtitle: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Intro body</span>
              <textarea
                className="mt-1 min-h-[72px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={trust.body}
                onChange={(e) => setTrust((s) => ({ ...s, body: e.target.value }))}
              />
            </label>
            <div className="sm:col-span-2">
              {visualFieldRow(
                "Section image (optional)",
                trust,
                (fn) => setTrust((s) => ({ ...s, ...fn(s) })),
                () => openPicker({ kind: "block", key: "trust" }),
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded-md border border-[var(--admin-border)] px-2 py-1 text-xs"
              onClick={() =>
                setTrustPoints((p) => [...p, { title: "", body: "", ...emptyVisual() }])
              }
            >
              Add trust point
            </button>
          </div>
          {trustPoints.length === 0 ? (
            <p className="mt-2 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm text-[var(--admin-muted)]">
              No trust points yet. Add bullets that support your credibility story.
            </p>
          ) : (
            <p className="mt-2 text-[10px] text-[var(--admin-muted)]">
              List order on the site follows this list; use ↑ ↓ to reorder.
            </p>
          )}
          <div className="mt-2 space-y-3">
            {trustPoints.map((p, i) => (
              <div
                key={`tp-${i}`}
                className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3"
              >
                <div className="flex gap-2">
                  <button
                    type="button"
                    title="Move up"
                    disabled={i === 0}
                    className="rounded border px-2 py-0.5 text-xs disabled:opacity-50"
                    onClick={() =>
                      setTrustPoints((arr) => {
                        const n = [...arr];
                        [n[i - 1], n[i]] = [n[i]!, n[i - 1]!];
                        return n;
                      })
                    }
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={i === trustPoints.length - 1}
                    className="rounded border px-2 py-0.5 text-xs disabled:opacity-50"
                    onClick={() =>
                      setTrustPoints((arr) => {
                        const n = [...arr];
                        [n[i + 1], n[i]] = [n[i]!, n[i + 1]!];
                        return n;
                      })
                    }
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-xs text-amber-600"
                    onClick={() => setTrustPoints((arr) => arr.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="mt-2 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                  placeholder="Title"
                  value={p.title}
                  onChange={(e) =>
                    setTrustPoints((arr) =>
                      arr.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                    )
                  }
                />
                <textarea
                  className="mt-2 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                  placeholder="Body"
                  rows={2}
                  value={p.body}
                  onChange={(e) =>
                    setTrustPoints((arr) =>
                      arr.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)),
                    )
                  }
                />
                <div className="mt-2">
                  {visualFieldRow(
                    "Image",
                    p,
                    (fn) =>
                      setTrustPoints((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, ...fn(x) } : x)),
                      ),
                    () => openPicker({ kind: "trust-item", index: i }),
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Services overview
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Title</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={services.title}
                onChange={(e) => setServices((s) => ({ ...s, title: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Subtitle</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={services.subtitle}
                onChange={(e) => setServices((s) => ({ ...s, subtitle: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Intro body</span>
              <textarea
                className="mt-1 min-h-[72px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={services.body}
                onChange={(e) => setServices((s) => ({ ...s, body: e.target.value }))}
              />
            </label>
            <div className="sm:col-span-2">
              {visualFieldRow(
                "Section image (optional)",
                services,
                (fn) => setServices((s) => ({ ...s, ...fn(s) })),
                () => openPicker({ kind: "block", key: "services" }),
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded-md border border-[var(--admin-border)] px-2 py-1 text-xs"
              onClick={() =>
                setServiceCards((p) => [
                  ...p,
                  { id: uid(), title: "", description: "", href: "", ...emptyVisual() },
                ])
              }
            >
              Add service card
            </button>
          </div>
          {serviceCards.length === 0 ? (
            <p className="mt-2 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm text-[var(--admin-muted)]">
              No service cards yet. Each card links to a service detail route.
            </p>
          ) : (
            <p className="mt-2 text-[10px] text-[var(--admin-muted)]">
              Order on the page follows this list; use ↑ ↓ to reorder.
            </p>
          )}
          <div className="mt-2 space-y-3">
            {serviceCards.map((c, i) => (
              <div
                key={c.id}
                className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3"
              >
                <div className="flex gap-2">
                  <button
                    type="button"
                    title="Move up"
                    disabled={i === 0}
                    className="rounded border px-2 py-0.5 text-xs disabled:opacity-50"
                    onClick={() =>
                      setServiceCards((arr) => {
                        const n = [...arr];
                        [n[i - 1], n[i]] = [n[i]!, n[i - 1]!];
                        return n;
                      })
                    }
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={i === serviceCards.length - 1}
                    className="rounded border px-2 py-0.5 text-xs disabled:opacity-50"
                    onClick={() =>
                      setServiceCards((arr) => {
                        const n = [...arr];
                        [n[i + 1], n[i]] = [n[i]!, n[i + 1]!];
                        return n;
                      })
                    }
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-xs text-amber-600"
                    onClick={() => setServiceCards((arr) => arr.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input
                    className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                    placeholder="Title"
                    value={c.title}
                    onChange={(e) =>
                      setServiceCards((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                      )
                    }
                  />
                  <input
                    className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                    placeholder="href"
                    value={c.href}
                    onChange={(e) =>
                      setServiceCards((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)),
                      )
                    }
                  />
                  <textarea
                    className="sm:col-span-2 rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                    placeholder="Description"
                    rows={2}
                    value={c.description}
                    onChange={(e) =>
                      setServiceCards((arr) =>
                        arr.map((x, j) =>
                          j === i ? { ...x, description: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
                <div className="mt-2">
                  {visualFieldRow(
                    "Card image",
                    c,
                    (fn) =>
                      setServiceCards((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, ...fn(x) } : x)),
                      ),
                    () => openPicker({ kind: "svc-item", index: i }),
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Enterprise */}
        <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Enterprise highlight
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Title</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={enterprise.title}
                onChange={(e) => setEnterprise((s) => ({ ...s, title: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Subtitle</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={enterprise.subtitle}
                onChange={(e) => setEnterprise((s) => ({ ...s, subtitle: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Body</span>
              <textarea
                className="mt-1 min-h-[100px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={enterprise.body}
                onChange={(e) => setEnterprise((s) => ({ ...s, body: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--admin-muted)]">CTA label</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={enterprise.ctaLabel}
                onChange={(e) => setEnterprise((s) => ({ ...s, ctaLabel: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--admin-muted)]">CTA href</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={enterprise.ctaHref}
                onChange={(e) => setEnterprise((s) => ({ ...s, ctaHref: e.target.value }))}
              />
            </label>
            <div className="sm:col-span-2">
              {visualFieldRow(
                "Section image",
                enterprise,
                (fn) => setEnterprise((s) => ({ ...s, ...fn(s) })),
                () => openPicker({ kind: "block", key: "enterprise" }),
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded-md border border-[var(--admin-border)] px-2 py-1 text-xs"
              onClick={() => setEntBullets((p) => [...p, { title: "", text: "" }])}
            >
              Add bullet
            </button>
          </div>
          {entBullets.length === 0 ? (
            <p className="mt-2 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm text-[var(--admin-muted)]">
              No bullets yet. Short lines work best next to the enterprise visual.
            </p>
          ) : (
            <p className="mt-2 text-[10px] text-[var(--admin-muted)]">
              Bullet order follows this list; use ↑ ↓ to reorder.
            </p>
          )}
          <div className="mt-2 space-y-2">
            {entBullets.map((b, i) => (
              <div key={`eb-${i}`} className="flex flex-wrap gap-2 rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-2">
                <button
                  type="button"
                  title="Move up"
                  disabled={i === 0}
                  className="rounded border px-2 text-xs disabled:opacity-50"
                  onClick={() =>
                    setEntBullets((arr) => {
                      const n = [...arr];
                      [n[i - 1], n[i]] = [n[i]!, n[i - 1]!];
                      return n;
                    })
                  }
                >
                  ↑
                </button>
                <button
                  type="button"
                  title="Move down"
                  disabled={i === entBullets.length - 1}
                  className="rounded border px-2 text-xs disabled:opacity-50"
                  onClick={() =>
                    setEntBullets((arr) => {
                      const n = [...arr];
                      [n[i + 1], n[i]] = [n[i]!, n[i + 1]!];
                      return n;
                    })
                  }
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="text-xs text-amber-600"
                  onClick={() => setEntBullets((arr) => arr.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
                <input
                  className="min-w-[10rem] flex-1 rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1 text-sm"
                  placeholder="Bullet title"
                  value={b.title}
                  onChange={(e) =>
                    setEntBullets((arr) =>
                      arr.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                    )
                  }
                />
                <input
                  className="min-w-[12rem] flex-[2] rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1 text-sm"
                  placeholder="Bullet text"
                  value={b.text}
                  onChange={(e) =>
                    setEntBullets((arr) =>
                      arr.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)),
                    )
                  }
                />
              </div>
            ))}
          </div>
        </section>

        {/* Industries */}
        <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Industries (<code className="font-mono">industriesContent</code>)
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Section title</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={industries.title}
                onChange={(e) => setIndustries((s) => ({ ...s, title: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Subtitle</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={industries.subtitle}
                onChange={(e) => setIndustries((s) => ({ ...s, subtitle: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Intro body</span>
              <textarea
                className="mt-1 min-h-[72px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={industries.body}
                onChange={(e) => setIndustries((s) => ({ ...s, body: e.target.value }))}
              />
            </label>
            <div className="sm:col-span-2">
              {visualFieldRow(
                "Section image (optional)",
                industries,
                (fn) => setIndustries((s) => ({ ...s, ...fn(s) })),
                () => openPicker({ kind: "block", key: "industriesContent" }),
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded-md border border-[var(--admin-border)] px-2 py-1 text-xs"
              onClick={() =>
                setIndustryRows((p) => [
                  ...p,
                  { id: uid(), title: "", description: "", href: "", ...emptyVisual() },
                ])
              }
            >
              Add industry row
            </button>
          </div>
          {industryRows.length === 0 ? (
            <p className="mt-2 rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm text-[var(--admin-muted)]">
              No industry rows yet. Add sectors you want called out on the home page.
            </p>
          ) : (
            <p className="mt-2 text-[10px] text-[var(--admin-muted)]">
              Order on the page follows this list; use ↑ ↓ to reorder.
            </p>
          )}
          <div className="mt-2 space-y-3">
            {industryRows.map((r, i) => (
              <div
                key={r.id}
                className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3"
              >
                <div className="flex gap-2">
                  <button
                    type="button"
                    title="Move up"
                    disabled={i === 0}
                    className="rounded border px-2 py-0.5 text-xs disabled:opacity-50"
                    onClick={() =>
                      setIndustryRows((arr) => {
                        const n = [...arr];
                        [n[i - 1], n[i]] = [n[i]!, n[i - 1]!];
                        return n;
                      })
                    }
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={i === industryRows.length - 1}
                    className="rounded border px-2 py-0.5 text-xs disabled:opacity-50"
                    onClick={() =>
                      setIndustryRows((arr) => {
                        const n = [...arr];
                        [n[i + 1], n[i]] = [n[i]!, n[i + 1]!];
                        return n;
                      })
                    }
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-xs text-amber-600"
                    onClick={() => setIndustryRows((arr) => arr.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input
                    className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                    placeholder="Title"
                    value={r.title}
                    onChange={(e) =>
                      setIndustryRows((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                      )
                    }
                  />
                  <input
                    className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                    placeholder="href (optional)"
                    value={r.href}
                    onChange={(e) =>
                      setIndustryRows((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)),
                      )
                    }
                  />
                  <textarea
                    className="sm:col-span-2 rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1.5 text-sm"
                    placeholder="Description"
                    rows={2}
                    value={r.description}
                    onChange={(e) =>
                      setIndustryRows((arr) =>
                        arr.map((x, j) =>
                          j === i ? { ...x, description: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
                <div className="mt-2">
                  {visualFieldRow(
                    "Row image",
                    r,
                    (fn) =>
                      setIndustryRows((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, ...fn(x) } : x)),
                      ),
                    () => openPicker({ kind: "ind-item", index: i }),
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Final CTA
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Title</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={cta.title}
                onChange={(e) => setCta((s) => ({ ...s, title: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Body</span>
              <textarea
                className="mt-1 min-h-[72px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={cta.body}
                onChange={(e) => setCta((s) => ({ ...s, body: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Button label</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={cta.ctaLabel}
                onChange={(e) => setCta((s) => ({ ...s, ctaLabel: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--admin-muted)]">Button href</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
                value={cta.ctaHref}
                onChange={(e) => setCta((s) => ({ ...s, ctaHref: e.target.value }))}
              />
            </label>
            <div className="sm:col-span-2">
              {visualFieldRow(
                "Background / support image (optional)",
                cta,
                (fn) => setCta((s) => ({ ...s, ...fn(s) })),
                () => openPicker({ kind: "block", key: "cta" }),
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/80 p-4">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left text-sm font-medium text-[var(--admin-text)]"
            onClick={() => setAdvancedOpen((o) => !o)}
          >
            <span>Secondary · Advanced JSON (keys not in the form)</span>
            <span className="text-xs text-[var(--admin-muted)]">{advancedOpen ? "▼" : "▶"}</span>
          </button>
          <p className="mt-2 text-xs text-[var(--admin-muted)]">
            Rarely needed. Only keys <strong>not</strong> managed above (e.g. legacy{" "}
            <code className="font-mono">guidedIntents</code>, <code className="font-mono">pillarServices</code>
            ). Structured sections overwrite <code className="font-mono">guided</code>,{" "}
            <code className="font-mono">trust</code>, etc. Invalid JSON blocks saving.
          </p>
          {advancedOpen ? (
            <textarea
              className="mt-3 min-h-[180px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs"
              value={extraSectionsJson}
              onChange={(e) => setExtraSectionsJson(e.target.value)}
              spellCheck={false}
            />
          ) : null}
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!homePage}
            className="rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--admin-primary-hover)] disabled:opacity-50"
          >
            Save {activeLocale.toUpperCase()} home
          </button>
          {status ? (
            <span className="text-sm text-[var(--admin-muted)]">{status}</span>
          ) : null}
        </div>
      </form>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onPick={onMediaPick}
        title={
          mediaPickTarget.kind === "hero"
            ? "Choose hero image"
            : mediaPickTarget.kind === "hero-video"
              ? "Choose hero video"
              : "Choose image"
        }
        filter={mediaPickTarget.kind === "hero-video" ? "video" : "image"}
      />
    </div>
  );
}
