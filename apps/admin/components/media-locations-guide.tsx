"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  MEDIA_LOCATION_GROUPS,
  type MediaLocationItem,
} from "@/lib/admin/media-locations-registry";

function matchesQuery(item: MediaLocationItem, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const blob = [
    item.title,
    item.where,
    item.href,
    item.notes ?? "",
    ...item.fields,
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes(s);
}

export function MediaLocationsGuide() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return MEDIA_LOCATION_GROUPS;
    return MEDIA_LOCATION_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((it) => matchesQuery(it, q)),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
        <label className="block text-xs font-medium text-[var(--admin-muted)]">
          Search locations, fields, or paths
        </label>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. enterpriseVisuals, home, imageMediaAssetId…"
          className="mt-2 w-full max-w-xl rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)]"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--admin-muted)]">No matches.</p>
      ) : (
        filtered.map((group) => (
          <section key={group.id}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
              {group.label}
            </h2>
            <ul className="space-y-3">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--admin-text)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--admin-muted)]">
                        {item.where}
                      </p>
                    </div>
                    <Link
                      href={item.href}
                      className="shrink-0 text-xs font-semibold text-[var(--admin-text)] underline-offset-2 hover:underline"
                    >
                      Open in admin →
                    </Link>
                  </div>
                  {item.fields.length > 0 ? (
                    <ul className="mt-3 space-y-1 font-mono text-[0.7rem] text-[var(--admin-muted)]">
                      {item.fields.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--admin-muted)]">—</p>
                  )}
                  {item.notes ? (
                    <p className="mt-2 border-t border-[var(--admin-border)] pt-2 text-xs leading-relaxed text-[var(--admin-muted)]">
                      {item.notes}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
