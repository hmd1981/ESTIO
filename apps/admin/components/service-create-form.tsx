"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";

const PRESETS = {
  "web-design-development": {
    slug: "web-design-development",
    title: "Website Design & Development",
    shortDescription:
      "Business-grade websites and digital platforms built for credibility, clarity, and long-term content control.",
    longDescription:
      "Use this row for the live `/services/web-design-development` route. The public page already falls back to static content when no catalogue row exists; creating this row lets the admin become the editable source for the same route.",
    category: "WEB_DESIGN_DEVELOPMENT",
  },
  "content-campaigns": {
    slug: "content-campaigns",
    title: "Content & Campaign Execution",
    shortDescription:
      "Structured content and campaign delivery aligned to launches, priorities, and measurable commercial objectives.",
    longDescription:
      "Use this row for the live `/services/content-campaigns` route. Move service concepts into `detailBlocks` instead of creating extra listing-only rows.",
    category: "CONTENT_CAMPAIGNS",
  },
  "ai-creative": {
    slug: "ai-creative",
    title: "AI Creative Services",
    shortDescription:
      "AI-supported creative production with review, usage, and quality controls built into the workflow.",
    longDescription:
      "Use this row for the live `/services/ai-creative` route. Keep sub-capabilities in `detailBlocks` and route-level copy, not as separate catalogue slugs.",
    category: "AI_CREATIVE",
  },
  enterprise: {
    slug: "enterprise",
    title: "Operational systems & integrations",
    shortDescription:
      "Named-system workflows, governed retrieval, and handover packages for IT-operated environments.",
    longDescription:
      "Use this row for the live `/enterprise` route. This is the enterprise overview page; private assistants, automation, and internal tools belong in the same row's structured content until separate live routes are needed.",
    category: "ENTERPRISE_AI",
  },
  "image-production": {
    slug: "image-production",
    title: "AI Image Production",
    shortDescription:
      "Production-grade AI-generated imagery for campaigns, websites, social channels, and brand collateral — scoped to your visual direction and delivered as final assets.",
    longDescription:
      "CMS row for the public `/ai-studio/image-production` page. After save, use **Hero visual (right column)** on the service editor for the right-panel image or looping video. Static marketing copy fills gaps until you publish.",
    category: "AI_CREATIVE",
  },
  "video-production": {
    slug: "video-production",
    title: "AI Video Production",
    shortDescription:
      "AI-generated short-form video for promotion, social channels, and campaign content — produced to specification with review checkpoints before delivery.",
    longDescription:
      "CMS row for `/ai-studio/video-production`. Set hero media (image or muted loop video) under **Hero visual (right column)** on the service edit screen.",
    category: "AI_CREATIVE",
  },
  "brand-ai-packs": {
    slug: "brand-ai-packs",
    title: "Brand AI Packs",
    shortDescription:
      "Structured AI asset systems for brands that need consistent, repeatable visual output — style presets, prompt logic, and asset libraries scoped to your brand identity.",
    longDescription:
      "CMS row for `/ai-studio/brand-ai-packs`. Hero / video for the detail layout: **Hero visual (right column)** when editing this service.",
    category: "AI_CREATIVE",
  },
} as const;

const LOCALES = ["en", "ar"] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

type PresetKey = keyof typeof PRESETS;

export function ServiceCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySynced = useRef(false);
  const [presetKey, setPresetKey] = useState<PresetKey>("web-design-development");
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("en");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("DRAFT");
  const [featured, setFeatured] = useState(false);
  const [title, setTitle] = useState<string>(PRESETS["web-design-development"].title);
  const [shortDescription, setShortDescription] = useState<string>(
    PRESETS["web-design-development"].shortDescription,
  );
  const [longDescription, setLongDescription] = useState<string>(
    PRESETS["web-design-development"].longDescription,
  );
  const [detailBlocksJson, setDetailBlocksJson] = useState(
    '{\n  "capabilities": [],\n  "idealClients": [],\n  "deliverables": []\n}',
  );
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const preset = useMemo(() => PRESETS[presetKey], [presetKey]);

  useEffect(() => {
    if (querySynced.current) return;
    querySynced.current = true;
    const offer = searchParams.get("offer")?.trim();
    const loc = searchParams.get("locale")?.trim().toLowerCase();
    if (offer && offer in PRESETS) {
      const key = offer as PresetKey;
      setPresetKey(key);
      const next = PRESETS[key];
      setTitle(next.title);
      setShortDescription(next.shortDescription);
      setLongDescription(next.longDescription);
    }
    if (loc === "en" || loc === "ar") {
      setLocale(loc);
    }
  }, [searchParams]);

  const applyPreset = (key: PresetKey) => {
    const next = PRESETS[key];
    setPresetKey(key);
    setTitle(next.title);
    setShortDescription(next.shortDescription);
    setLongDescription(next.longDescription);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusText(null);

    let detailBlocks: Record<string, unknown> | undefined;
    try {
      const parsed = JSON.parse(detailBlocksJson || "{}") as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        detailBlocks = parsed as Record<string, unknown>;
      } else {
        setStatusText("Detail blocks must be a JSON object.");
        return;
      }
    } catch {
      setStatusText("Detail blocks JSON is invalid.");
      return;
    }

    setBusy(true);
    try {
      const r = await adminFetch("/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: preset.slug,
          locale,
          title,
          shortDescription,
          longDescription,
          category: preset.category,
          status,
          featured,
          detailBlocks,
        }),
      });
      if (!r.ok) {
        setStatusText(`Create failed: ${await r.text()}`);
        return;
      }
      const created = (await r.json()) as { id: string };
      router.push(`/admin/services/${created.id}`);
      router.refresh();
    } catch (err) {
      setStatusText(`Error: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={create} className="max-w-3xl space-y-4">
      <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel)] p-4">
        <label className="block">
          <span className="text-xs font-medium text-[var(--admin-muted)]">
            Live route preset
          </span>
          <select
            className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
            value={presetKey}
            onChange={(e) => applyPreset(e.target.value as PresetKey)}
          >
            <option value="web-design-development">
              /services/web-design-development
            </option>
            <option value="content-campaigns">/services/content-campaigns</option>
            <option value="ai-creative">/services/ai-creative</option>
            <option value="enterprise">/enterprise</option>
            <option value="image-production">/ai-studio/image-production</option>
            <option value="video-production">/ai-studio/video-production</option>
            <option value="brand-ai-packs">/ai-studio/brand-ai-packs</option>
          </select>
        </label>
        <p className="mt-2 text-xs text-[var(--admin-muted)]">
          Slug will be created as{" "}
          <code className="font-mono text-[0.7rem]">{preset.slug}</code>. Use one
          row per locale (EN + AR) for AI Studio offers. Sub-capabilities stay in{" "}
          <code className="font-mono text-[0.7rem]">detailBlocks</code>; hero
          image/video uses the service editor&apos;s{" "}
          <strong className="text-[var(--admin-text)]">
            Hero visual (right column)
          </strong>{" "}
          block.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-[var(--admin-muted)]">
            Locale
          </span>
          <select
            className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value as "en" | "ar")}
          >
            {LOCALES.map((value) => (
              <option key={value} value={value}>
                {value.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium text-[var(--admin-muted)]">
            Status
          </span>
          <select
            className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}
          >
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-[var(--admin-muted)]">Title</span>
        <input
          className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Short description
        </span>
        <textarea
          className="mt-1 min-h-[72px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Long description
        </span>
        <textarea
          className="mt-1 min-h-[160px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Detail blocks (JSON)
        </span>
        <p className="mt-1 text-xs text-[var(--admin-muted)]">
          Supported keys include <code>capabilities</code>, <code>idealClients</code>,{" "}
          <code>deliverables</code>, <code>process</code>, <code>cta</code>, and{" "}
          <code>heroVisual</code> (or use the hero block on the next screen).
        </p>
        <textarea
          className="mt-2 min-h-[200px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs"
          value={detailBlocksJson}
          onChange={(e) => setDetailBlocksJson(e.target.value)}
          spellCheck={false}
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
        />
        <span className="text-sm">Featured on homepage</span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create service"}
        </button>
        <Link
          href="/admin/services"
          className="text-sm text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          ← Back to list
        </Link>
        {statusText ? (
          <span className="text-sm text-[var(--admin-muted)]">{statusText}</span>
        ) : null}
      </div>
    </form>
  );
}
