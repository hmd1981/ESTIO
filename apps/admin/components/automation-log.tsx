"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

type Run = {
  id: string;
  type: string;
  status: string;
  message: string | null;
  createdAt: string;
  lead: { id: string; fullName: string; email: string } | null;
};

export function AutomationLog() {
  const [rows, setRows] = useState<Run[]>([]);

  const load = useCallback(async () => {
    const r = await adminFetch("/admin/automation-runs");
    if (r.ok) setRows((await r.json()) as Run[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void load()}
        className="rounded-md border border-[var(--admin-border)] px-3 py-1.5 text-xs font-medium"
      >
        Refresh
      </button>
      <div className="overflow-hidden rounded-lg border border-[var(--admin-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--admin-row-header)] text-xs uppercase text-[var(--admin-muted)]">
            <tr>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Lead</th>
              <th className="px-3 py-2">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-border)]">
            {rows.map((x) => (
              <tr key={x.id}>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-[var(--admin-muted)]">
                  {new Date(x.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-xs font-mono">{x.type}</td>
                <td className="px-3 py-2 text-xs">{x.status}</td>
                <td className="px-3 py-2 text-xs">
                  {x.lead ? (
                    <Link
                      href={`/admin/leads/${x.lead.id}`}
                      className="text-[var(--admin-primary)] underline-offset-2 hover:underline"
                    >
                      {x.lead.fullName}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="max-w-md truncate px-3 py-2 text-xs text-[var(--admin-muted)]">
                  {x.message ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
