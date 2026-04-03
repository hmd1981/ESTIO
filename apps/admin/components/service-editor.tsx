"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { MediaPicker } from "@/components/media-picker";

type CmsVisual = {
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
};

function toVisual(raw: unknown): CmsVisual {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  return {
    imageUrl: String(o.imageUrl ?? ""),
    imageAlt: String(o.imageAlt ?? ""),
    imageMediaAssetId: String(o.imageMediaAssetId ?? ""),
  };
}

function cmsVisualPayload(v: CmsVisual): CmsVisual | undefined {
  const hasImg =
    Boolean(v.imageUrl?.trim()) || Boolean(v.imageMediaAssetId?.trim());
  if (!hasImg) return undefined;
  const out: CmsVisual = {};
  if (v.imageUrl?.trim()) out.imageUrl = v.imageUrl.trim();
  if (v.imageAlt?.trim()) out.imageAlt = v.imageAlt.trim();
  if (v.imageMediaAssetId?.trim())
    out.imageMediaAssetId = v.imageMediaAssetId.trim();
  return out;
}

function prevVisualHadAsset(prev: unknown): boolean {
  if (!prev || typeof prev !== "object") return false;
  const o = prev as Record<string, unknown>;
  return (
    Boolean(String(o.imageUrl ?? "").trim()) ||
    Boolean(String(o.imageMediaAssetId ?? "").trim())
  );
}

function shouldClearVisual(current: CmsVisual, prev: unknown): boolean {
  return !cmsVisualPayload(current) && prevVisualHadAsset(prev);
}

const CATEGORIES = [
  "WEB_DESIGN_DEVELOPMENT",
  "CONTENT_CAMPAIGNS",
  "AI_CREATIVE",
  "ENTERPRISE_AI",
] as const;

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

type ServiceRow = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  status: string;
  featured: boolean;
  detailBlocks?: unknown;
};

function stringifyBlocks(raw: unknown): string {
  if (raw == null || (typeof raw === "object" && Object.keys(raw as object).length === 0)) {
    return "{\n  \"capabilities\": [],\n  \"idealClients\": [],\n  \"deliverables\": []\n}";
  }
  try {
    return JSON.stringify(raw, null, 2);
  } catch {
    return "{}";
  }
}

export function ServiceEditor({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const [row, setRow] = useState<ServiceRow | null>(null);
  const [detailBlocksJson, setDetailBlocksJson] = useState("");
  const [heroVisual, setHeroVisual] = useState<CmsVisual>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const loadedHeroVisualRef = useRef<unknown>(undefined);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyHeroToDetailJson = useCallback((next: CmsVisual) => {
    setDetailBlocksJson((prev) => {
      try {
        const p = JSON.parse(prev || "{}") as unknown;
        if (
          p === null ||
          typeof p !== "object" ||
          Array.isArray(p)
        ) {
          return prev;
        }
        const blocks = { ...(p as Record<string, unknown>) };
        const payload = cmsVisualPayload(next);
        if (payload) blocks.heroVisual = payload;
        else if (shouldClearVisual(next, loadedHeroVisualRef.current)) {
          blocks.heroVisual = null;
        } else {
          delete blocks.heroVisual;
        }
        return JSON.stringify(blocks, null, 2);
      } catch {
        return prev;
      }
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminFetch(`/services/${serviceId}`);
      if (!r.ok) {
        setRow(null);
        return;
      }
      const data = (await r.json()) as ServiceRow;
      setRow(data);
      const json = stringifyBlocks(data.detailBlocks);
      setDetailBlocksJson(json);
      try {
        const parsed = JSON.parse(json || "{}") as unknown;
        const hv =
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          "heroVisual" in parsed
            ? (parsed as Record<string, unknown>).heroVisual
            : undefined;
        loadedHeroVisualRef.current = hv;
        setHeroVisual(toVisual(hv));
      } catch {
        loadedHeroVisualRef.current = undefined;
        setHeroVisual({});
      }
    } catch {
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!row) return;
    setStatus(null);
    let detailBlocks: Record<string, unknown> | undefined;
    try {
      const parsed = JSON.parse(detailBlocksJson || "{}") as unknown;
      if (
        parsed !== null &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        detailBlocks = { ...(parsed as Record<string, unknown>) };
        const payload = cmsVisualPayload(heroVisual);
        if (payload) detailBlocks.heroVisual = payload;
        else if (shouldClearVisual(heroVisual, loadedHeroVisualRef.current)) {
          detailBlocks.heroVisual = null;
        } else {
          delete detailBlocks.heroVisual;
        }
      } else {
        setStatus("detailBlocks must be a JSON object.");
        return;
      }
    } catch {
      setStatus("detailBlocks JSON is invalid.");
      return;
    }
    try {
      const r = await adminFetch(`/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: row.title,
          shortDescription: row.shortDescription,
          longDescription: row.longDescription,
          category: row.category,
          status: row.status,
          featured: row.featured,
          detailBlocks,
        }),
      });
      if (!r.ok) {
        setStatus(`Save failed: ${await r.text()}`);
        return;
      }
      setStatus("Saved.");
      loadedHeroVisualRef.current = detailBlocks?.heroVisual;
      router.refresh();
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this service row? Public URLs may 404.")) return;
    const r = await adminFetch(`/services/${serviceId}`, {
      method: "DELETE",
    });
    if (!r.ok) {
      setStatus(`Delete failed: ${await r.text()}`);
      return;
    }
    router.push("/admin/services");
    router.refresh();
  };

  if (loading) {
    return <p className="text-sm text-[var(--admin-muted)]">Loading…</p>;
  }
  if (!row) {
    return (
      <p className="text-sm text-[var(--admin-muted)]">Service not found.</p>
    );
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-4">
      <p className="text-xs text-[var(--admin-muted)]">
        Slug <code className="font-mono">{row.slug}</code> · locale{" "}
        <code>{row.locale}</code> — copy the row in the API for the other
        locale if you need Arabic + English titles.
      </p>
      <label className="block">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Title
        </span>
        <input
          className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          value={row.title}
          onChange={(e) => setRow({ ...row, title: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Short description
        </span>
        <textarea
          className="mt-1 min-h-[72px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          value={row.shortDescription}
          onChange={(e) =>
            setRow({ ...row, shortDescription: e.target.value })
          }
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Long description
        </span>
        <textarea
          className="mt-1 min-h-[200px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          value={row.longDescription}
          onChange={(e) =>
            setRow({ ...row, longDescription: e.target.value })
          }
        />
      </label>

      <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)]/40 p-4">
        <h2 className="text-sm font-semibold text-[var(--admin-text)]">
          Hero visual (right column)
        </h2>
        <p className="mt-1 text-xs text-[var(--admin-muted)]">
          Shown on the service detail layout next to the title (e.g. AI Studio
          subpages). Use a direct URL and/or a media library id. Video files in
          the image slot play as a muted loop.
        </p>
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-[var(--admin-muted)]">
              Image or video URL
            </span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={heroVisual.imageUrl ?? ""}
              onChange={(e) => {
                const next = { ...heroVisual, imageUrl: e.target.value };
                setHeroVisual(next);
                applyHeroToDetailJson(next);
              }}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[var(--admin-muted)]">
              Alt text
            </span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={heroVisual.imageAlt ?? ""}
              onChange={(e) => {
                const next = { ...heroVisual, imageAlt: e.target.value };
                setHeroVisual(next);
                applyHeroToDetailJson(next);
              }}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[var(--admin-muted)]">
              imageMediaAssetId
            </span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs"
              value={heroVisual.imageMediaAssetId ?? ""}
              onChange={(e) => {
                const next = {
                  ...heroVisual,
                  imageMediaAssetId: e.target.value,
                };
                setHeroVisual(next);
                applyHeroToDetailJson(next);
              }}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-1.5 text-xs font-medium"
              onClick={() => setPickerOpen(true)}
            >
              Pick image or video…
            </button>
            <button
              type="button"
              className="rounded-md border border-[var(--admin-border)] px-3 py-1.5 text-xs text-[var(--admin-muted)]"
              onClick={() => {
                const next: CmsVisual = {};
                setHeroVisual(next);
                applyHeroToDetailJson(next);
              }}
            >
              Clear hero visual
            </button>
          </div>
        </div>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Detail blocks (JSON)
        </span>
        <p className="mt-1 text-xs text-[var(--admin-muted)]">
          Optional structured content:{" "}
          <code className="text-[0.65rem]">capabilities</code>,{" "}
          <code className="text-[0.65rem]">idealClients</code>,{" "}
          <code className="text-[0.65rem]">deliverables</code>,{" "}
          <code className="text-[0.65rem]">process</code>,{" "}
          <code className="text-[0.65rem]">cta</code>,{" "}
          <code className="text-[0.65rem]">heroVisual</code> (also edited
          above).
        </p>
        <textarea
          className="mt-2 min-h-[200px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs"
          value={detailBlocksJson}
          onChange={(e) => {
            const v = e.target.value;
            setDetailBlocksJson(v);
            try {
              const p = JSON.parse(v || "{}") as unknown;
              if (p !== null && typeof p === "object" && !Array.isArray(p)) {
                const rec = p as Record<string, unknown>;
                if ("heroVisual" in rec) {
                  setHeroVisual(toVisual(rec.heroVisual));
                } else {
                  setHeroVisual({});
                }
              }
            } catch {
              /* keep hero fields */
            }
          }}
          onBlur={() => {
            try {
              const p = JSON.parse(detailBlocksJson || "{}") as unknown;
              if (p !== null && typeof p === "object" && !Array.isArray(p)) {
                const rec = p as Record<string, unknown>;
                if ("heroVisual" in rec) {
                  setHeroVisual(toVisual(rec.heroVisual));
                } else {
                  setHeroVisual({});
                }
              }
            } catch {
              /* invalid json */
            }
          }}
          spellCheck={false}
        />
      </label>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        filter="all"
        title="Choose hero image or video"
        onPick={(asset) => {
          const next: CmsVisual = {
            ...heroVisual,
            imageMediaAssetId: asset.id,
            imageUrl: asset.publicUrl?.trim() || heroVisual.imageUrl || "",
            imageAlt:
              heroVisual.imageAlt?.trim() ||
              asset.altText?.trim() ||
              asset.originalName ||
              "",
          };
          setHeroVisual(next);
          applyHeroToDetailJson(next);
          setPickerOpen(false);
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-[var(--admin-muted)]">
            Category
          </span>
          <select
            className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
            value={row.category}
            onChange={(e) => setRow({ ...row, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
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
            value={row.status}
            onChange={(e) => setRow({ ...row, status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={row.featured}
          onChange={(e) => setRow({ ...row, featured: e.target.checked })}
        />
        <span className="text-sm">Featured on homepage</span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Save
        </button>
        <Link
          href="/admin/services"
          className="text-sm text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          ← Back to list
        </Link>
        <button
          type="button"
          className="ml-auto text-sm font-medium text-red-600 hover:underline"
          onClick={() => void remove()}
        >
          Delete service
        </button>
        {status ? (
          <span className="text-sm text-[var(--admin-muted)]">{status}</span>
        ) : null}
      </div>
    </form>
  );
}
