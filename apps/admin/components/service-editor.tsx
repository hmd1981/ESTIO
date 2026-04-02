"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";

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
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      setDetailBlocksJson(stringifyBlocks(data.detailBlocks));
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
        detailBlocks = parsed as Record<string, unknown>;
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
          <code className="text-[0.65rem]">cta</code>.
        </p>
        <textarea
          className="mt-2 min-h-[200px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs"
          value={detailBlocksJson}
          onChange={(e) => setDetailBlocksJson(e.target.value)}
          spellCheck={false}
        />
      </label>
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
