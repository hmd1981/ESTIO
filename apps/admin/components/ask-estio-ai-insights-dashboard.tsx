"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

type InsightsPayload = {
  periodDays: number;
  fromIso: string;
  sampleTruncated: boolean;
  sampleSize: number;
  topQuestions: Array<{ example: string; count: number }>;
  intentDistribution: Array<{ intent: string; count: number }>;
  maxIntentCount: number;
  conversionByIntent: Array<{
    intent: string;
    asks: number;
    ctaClicked: number;
    rate: number;
  }>;
  topOutOfScope: Array<{ example: string; count: number }>;
  liveFeed: Array<{
    userMessage: string;
    intent: string;
    outOfScope: boolean;
    ctaClicked: boolean;
    sessionId: string;
    createdAt: string;
  }>;
};

function pct(n: number): string {
  return `${Math.round(n * 1000) / 10}%`;
}

function shortTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AskEstioAiInsightsDashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<InsightsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const r = await adminFetch(
      `/admin/ask-estio-ai/insights?days=${encodeURIComponent(String(days))}`,
    );
    if (!r.ok) {
      setErr(await r.text());
      setData(null);
      return;
    }
    setData((await r.json()) as InsightsPayload);
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  if (err) {
    return <p className="text-sm text-red-600">{err}</p>;
  }
  if (!data) {
    return <p className="text-sm text-[var(--admin-muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-4 border-b border-[var(--admin-border)] pb-4">
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
        <p className="text-xs text-[var(--admin-muted)]">
          From {new Date(data.fromIso).toLocaleDateString()} ·{" "}
          {data.sampleSize.toLocaleString()} events in sample
          {data.sampleTruncated ? " (capped; totals approximate)" : ""}
        </p>
      </div>

      <section aria-labelledby="top-questions-heading">
        <h2
          id="top-questions-heading"
          className="text-sm font-semibold text-[var(--admin-text)]"
        >
          Top questions
        </h2>
        <p className="mt-1 text-xs text-[var(--admin-muted)]">
          Grouped by normalized text (case, spacing, punctuation). Example
          shows one original phrasing per group.
        </p>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--admin-border)]">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-row-header)]">
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Count
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Example message
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {data.topQuestions.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-6 text-[var(--admin-muted)]"
                  >
                    No events in this period.
                  </td>
                </tr>
              ) : (
                data.topQuestions.map((row, i) => (
                  <tr key={i} className="bg-[var(--admin-surface)]">
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-[var(--admin-text)]">
                      {row.count}
                    </td>
                    <td className="max-w-xl px-3 py-2 text-[var(--admin-text)]">
                      {row.example}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="intent-heading">
        <h2
          id="intent-heading"
          className="text-sm font-semibold text-[var(--admin-text)]"
        >
          Intent distribution
        </h2>
        <p className="mt-1 text-xs text-[var(--admin-muted)]">
          Count of asks by normalized intent (images, video, brand, unknown).
        </p>
        <ul className="mt-3 space-y-2">
          {data.intentDistribution.map((row) => (
            <li key={row.intent} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 font-medium capitalize text-[var(--admin-text)]">
                {row.intent}
              </span>
              <div className="h-6 min-w-0 flex-1 rounded-sm bg-[var(--admin-surface-muted)]">
                <div
                  className="h-full rounded-sm bg-[var(--admin-primary)]"
                  style={{
                    width: `${(row.count / data.maxIntentCount) * 100}%`,
                    minWidth: row.count > 0 ? "4px" : "0",
                  }}
                  title={`${row.count}`}
                />
              </div>
              <span className="w-12 shrink-0 text-right tabular-nums text-[var(--admin-muted)]">
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="conversion-heading">
        <h2
          id="conversion-heading"
          className="text-sm font-semibold text-[var(--admin-text)]"
        >
          CTA conversion by intent
        </h2>
        <p className="mt-1 text-xs text-[var(--admin-muted)]">
          Share of asks where primary or secondary CTA was clicked.
        </p>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--admin-border)]">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-row-header)]">
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Intent
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Asks
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  CTA clicked
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {data.conversionByIntent.map((row) => (
                <tr key={row.intent} className="bg-[var(--admin-surface)]">
                  <td className="px-3 py-2 font-medium capitalize text-[var(--admin-text)]">
                    {row.intent}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-[var(--admin-text)]">
                    {row.asks}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-[var(--admin-text)]">
                    {row.ctaClicked}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-[var(--admin-text)]">
                    {pct(row.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="oos-heading">
        <h2
          id="oos-heading"
          className="text-sm font-semibold text-[var(--admin-text)]"
        >
          Out-of-scope themes
        </h2>
        <p className="mt-1 text-xs text-[var(--admin-muted)]">
          Frequent asks flagged out-of-scope (same grouping as top questions).
        </p>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--admin-border)]">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-row-header)]">
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Count
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Example
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {data.topOutOfScope.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-6 text-[var(--admin-muted)]"
                  >
                    No out-of-scope events in sample.
                  </td>
                </tr>
              ) : (
                data.topOutOfScope.map((row, i) => (
                  <tr key={i} className="bg-[var(--admin-surface)]">
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-[var(--admin-text)]">
                      {row.count}
                    </td>
                    <td className="max-w-xl px-3 py-2 text-[var(--admin-text)]">
                      {row.example}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="feed-heading">
        <h2
          id="feed-heading"
          className="text-sm font-semibold text-[var(--admin-text)]"
        >
          Live feed
        </h2>
        <p className="mt-1 text-xs text-[var(--admin-muted)]">
          Latest 20 events (message, intent, time).
        </p>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--admin-border)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-row-header)]">
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Time
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Intent
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  OOS
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  CTA
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {data.liveFeed.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-[var(--admin-muted)]"
                  >
                    No recent events.
                  </td>
                </tr>
              ) : (
                data.liveFeed.map((row, i) => (
                  <tr key={i} className="bg-[var(--admin-surface)]">
                    <td className="whitespace-nowrap px-3 py-2 text-[var(--admin-muted)]">
                      {shortTime(row.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 capitalize text-[var(--admin-text)]">
                      {row.intent}
                    </td>
                    <td className="px-3 py-2 text-[var(--admin-text)]">
                      {row.outOfScope ? "Yes" : "—"}
                    </td>
                    <td className="px-3 py-2 text-[var(--admin-text)]">
                      {row.ctaClicked ? "Yes" : "—"}
                    </td>
                    <td className="max-w-md px-3 py-2 text-[var(--admin-text)]">
                      {row.userMessage}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
