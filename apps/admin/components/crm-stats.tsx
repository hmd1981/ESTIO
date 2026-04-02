"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

type Snapshot = {
  totalLeads: number;
  newLeadsToday: number;
  pipelineOpenByStage: Record<string, number>;
  openTasks: number;
  overdueFollowups: number;
};

export function CrmStats() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const r = await adminFetch("/admin/crm/dashboard");
    if (!r.ok) {
      setErr(await r.text());
      return;
    }
    setData((await r.json()) as Snapshot);
  }, []);

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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Total leads
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--admin-text)]">
          {data.totalLeads}
        </p>
      </div>
      <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          New today
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--admin-text)]">
          {data.newLeadsToday}
        </p>
      </div>
      <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Open tasks
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--admin-text)]">
          {data.openTasks}
        </p>
      </div>
      <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 sm:col-span-2 lg:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Overdue follow-ups
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--admin-accent)]">
          {data.overdueFollowups}
        </p>
        <p className="mt-3 text-xs text-[var(--admin-muted)]">
          Pipeline by stage (open deals):{" "}
          <span className="font-mono text-[0.7rem] text-[var(--admin-text)]">
            {JSON.stringify(data.pipelineOpenByStage)}
          </span>
        </p>
      </div>
    </div>
  );
}
