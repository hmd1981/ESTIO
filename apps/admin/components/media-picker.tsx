"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicApiBase } from "@/lib/api-base";

import { proxyUploadUrl as proxyUrl } from "@/lib/proxy-upload-url";

type MediaRow = {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  altText: string | null;
  category: string | null;
  publicUrl: string | null;
  uploadedAt: string;
};

function isImage(row: MediaRow) {
  return row.mimeType?.startsWith("image/");
}

function isVideo(row: MediaRow) {
  return row.mimeType?.startsWith("video/");
}

export function MediaPicker({
  open,
  onClose,
  onPick,
  title = "Choose from media library",
  filter = "all",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (row: MediaRow) => void;
  title?: string;
  filter?: "all" | "image" | "video";
}) {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${getPublicApiBase()}/media`, { cache: "no-store" });
      if (!r.ok) {
        setError(await r.text());
        setRows([]);
        return;
      }
      setRows((await r.json()) as MediaRow[]);
    } catch (e) {
      setError(String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const typeFiltered = rows.filter((r) => {
      if (filter === "image") return isImage(r);
      if (filter === "video") return isVideo(r);
      return true;
    });
    if (!needle) return typeFiltered;
    return typeFiltered.filter((r) => {
      const a = `${r.originalName} ${r.fileName} ${r.category ?? ""}`.toLowerCase();
      return a.includes(needle);
    });
  }, [rows, q, filter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-row-header)] px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--admin-text)]">
              {title}
            </p>
            <p className="text-xs text-[var(--admin-muted)]">
              Pick an asset and we’ll set the page field to its public URL.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-1.5 text-sm text-[var(--admin-text)]"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <input
            className="w-full flex-1 rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)] sm:w-auto"
            placeholder="Search (name, filename, category)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            className="rounded-md bg-[var(--admin-primary)] px-3 py-2 text-sm font-medium text-white"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
          <span className="text-xs text-[var(--admin-muted)]">
            {filtered.length} assets
          </span>
        </div>

        {error ? (
          <div className="px-4 pb-3 text-sm text-amber-300">
            Failed to load media: <span className="break-all">{error}</span>
          </div>
        ) : null}

        <div className="max-h-[60vh] overflow-auto border-t border-[var(--admin-border)]">
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                className="group overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-left"
                onClick={() => onPick(r)}
                title={r.publicUrl ?? r.fileName}
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-black/20">
                  {r.publicUrl && isImage(r) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={proxyUrl(r.publicUrl) ?? r.publicUrl}
                      alt={r.altText ?? r.originalName}
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : r.publicUrl && isVideo(r) ? (
                    <video
                      src={proxyUrl(r.publicUrl) ?? r.publicUrl}
                      className="h-full w-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                      controls
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--admin-muted)]">
                      {r.mimeType}
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-3">
                  <div className="truncate text-sm font-medium text-[var(--admin-text)]">
                    {r.originalName}
                  </div>
                  <div className="truncate text-xs text-[var(--admin-muted)]">
                    {r.category ?? "uncategorized"} • {Math.round(r.size / 1024)} KB
                  </div>
                </div>
              </button>
            ))}
            {!loading && filtered.length === 0 ? (
              <p className="text-sm text-[var(--admin-muted)]">No assets found.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

