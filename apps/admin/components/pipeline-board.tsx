"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

type LeadRow = {
  id: string;
  fullName: string;
  email: string;
  stage: string;
  score: number;
  serviceType: string;
};

const STAGES = [
  "INBOX",
  "DISCOVERY",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export function PipelineBoard() {
  const [byStage, setByStage] = useState<Record<string, LeadRow[]>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const map: Record<string, LeadRow[]> = Object.fromEntries(
      STAGES.map((s) => [s, []]),
    );
    const r = await adminFetch("/admin/leads");
    if (r.ok) {
      const rows = (await r.json()) as LeadRow[];
      for (const row of rows) {
        const key = row.stage in map ? row.stage : "INBOX";
        map[key]!.push(row);
      }
    }
    setByStage(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-[var(--admin-muted)]">Loading…</p>;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {STAGES.map((stage) => (
        <div
          key={stage}
          className="min-w-[240px] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]"
        >
          <div className="border-b border-[var(--admin-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
            {stage}{" "}
            <span className="tabular-nums text-[var(--admin-text)]">
              ({byStage[stage]?.length ?? 0})
            </span>
          </div>
          <ul className="max-h-[70vh] space-y-2 overflow-y-auto p-2">
            {(byStage[stage] ?? []).map((row) => (
              <li key={row.id}>
                <Link
                  href={`/admin/leads/${row.id}`}
                  className="block rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm transition-colors hover:border-[var(--admin-primary)]"
                >
                  <span className="font-medium text-[var(--admin-text)]">
                    {row.fullName}
                  </span>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    {row.serviceType} · score {row.score}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
