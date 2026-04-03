"use client";

/**
 * FROZEN v1 layout — do not reorder KPI blocks or rename labels without an analytics contract bump.
 * See apps/api/src/modules/studio-analytics/FROZEN_UI.md
 */

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

type StatsSummary = {
  schemaVersion: number;
  period: { days: number; fromIso: string; toIso: string };
  dataSource: "rollup" | "raw";
  sample: {
    minEventsForOptimization: number;
    minHoverImpressions: number;
    observedTotalEvents: number;
    observedHoverImpressions: number;
    sufficientForOptimization: boolean;
    sufficientForHoverReliability: boolean;
    fallbacksApplied: string[];
  };
  byIntent: Array<{
    intent: string;
    total: number;
    clicks: number;
    ctr: number;
  }>;
  byDevice: Array<{ device: string; count: number }>;
  byEvent: Array<{ eventType: string; count: number }>;
  funnelSessions: Array<{ stage: string; sessions: number }> | null;
  funnelNote: string | null;
};

export function StudioAnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<StatsSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [rebuildBusy, setRebuildBusy] = useState(false);
  const [rebuildMsg, setRebuildMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const r = await adminFetch(
      `/studio-analytics/stats/summary?days=${encodeURIComponent(String(days))}`,
    );
    if (!r.ok) {
      setErr(await r.text());
      setData(null);
      return;
    }
    setData((await r.json()) as StatsSummary);
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const rebuildRollups = async () => {
    setRebuildBusy(true);
    setRebuildMsg(null);
    try {
      const r = await adminFetch(
        "/studio-analytics/admin/rebuild-rollups?days=14",
        { method: "POST" },
      );
      if (!r.ok) {
        setRebuildMsg(await r.text());
        return;
      }
      setRebuildMsg("Rollups rebuilt (last 14 UTC days).");
      await load();
    } finally {
      setRebuildBusy(false);
    }
  };

  if (err) {
    return <p className="text-sm text-red-600">{err}</p>;
  }
  if (!data) {
    return <p className="text-sm text-[var(--admin-muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="text-xs font-medium text-[var(--admin-muted)]">
            Window (days)
          </span>
          <select
            className="mt-1 rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            {[7, 14, 30, 90].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-md border border-[var(--admin-border)] px-3 py-2 text-sm"
        >
          Refresh
        </button>
        <button
          type="button"
          disabled={rebuildBusy}
          onClick={() => void rebuildRollups()}
          className="rounded-md bg-[var(--admin-primary)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {rebuildBusy ? "Rebuilding…" : "Rebuild rollups (14d)"}
        </button>
      </div>
      {rebuildMsg ? (
        <p className="text-xs text-[var(--admin-muted)]">{rebuildMsg}</p>
      ) : null}

      {/* KPI row — frozen order */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Data source
          </p>
          <p className="mt-1 text-lg font-semibold capitalize text-[var(--admin-text)]">
            {data.dataSource}
          </p>
          <p className="mt-1 text-[0.65rem] text-[var(--admin-muted)]">
            v{data.schemaVersion} · {data.period.fromIso.slice(0, 10)} →{" "}
            {data.period.toIso.slice(0, 10)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Total events (sample)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--admin-text)]">
            {data.sample.observedTotalEvents}
          </p>
          <p className="mt-1 text-[0.65rem] text-[var(--admin-muted)]">
            min for optimization: {data.sample.minEventsForOptimization}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Hover impressions
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--admin-text)]">
            {data.sample.observedHoverImpressions}
          </p>
          <p className="mt-1 text-[0.65rem] text-[var(--admin-muted)]">
            min reliable: {data.sample.minHoverImpressions}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            Fallbacks
          </p>
          <p className="mt-1 font-mono text-[0.7rem] text-[var(--admin-text)]">
            {data.sample.fallbacksApplied.length
              ? data.sample.fallbacksApplied.join(", ")
              : "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <h3 className="text-sm font-semibold text-[var(--admin-text)]">
            By intent
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.byIntent.length === 0 ? (
              <li className="text-[var(--admin-muted)]">No rows</li>
            ) : (
              data.byIntent.map((r) => (
                <li
                  key={r.intent}
                  className="flex justify-between gap-2 border-b border-[var(--admin-border)] pb-2 last:border-0"
                >
                  <span className="font-mono text-xs">{r.intent}</span>
                  <span className="tabular-nums text-[var(--admin-muted)]">
                    {r.clicks}/{r.total} · {r.ctr}% CTR
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <h3 className="text-sm font-semibold text-[var(--admin-text)]">
            By event type
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {data.byEvent.map((r) => (
              <li
                key={r.eventType}
                className="flex justify-between gap-2 border-b border-[var(--admin-border)] pb-2 last:border-0"
              >
                <span className="font-mono text-xs">{r.eventType}</span>
                <span className="tabular-nums">{r.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
        <h3 className="text-sm font-semibold text-[var(--admin-text)]">
          Funnel (distinct sessions)
        </h3>
        {data.funnelNote ? (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            {data.funnelNote}
          </p>
        ) : null}
        <ul className="mt-3 space-y-2 text-sm">
          {!data.funnelSessions?.length ? (
            <li className="text-[var(--admin-muted)]">—</li>
          ) : (
            data.funnelSessions.map((r) => (
              <li
                key={r.stage}
                className="flex justify-between gap-2 border-b border-[var(--admin-border)] pb-2 last:border-0"
              >
                <span className="font-mono text-xs">{r.stage}</span>
                <span className="tabular-nums">{r.sessions}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
