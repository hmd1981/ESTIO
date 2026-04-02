"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

type TaskRow = {
  id: string;
  title: string;
  status: string;
  dueAt: string | null;
  lead: {
    id: string;
    fullName: string;
    email: string;
    stage: string;
  };
};

export function TasksList() {
  const [rows, setRows] = useState<TaskRow[]>([]);

  const load = useCallback(async () => {
    const r = await adminFetch("/admin/tasks");
    if (r.ok) setRows((await r.json()) as TaskRow[]);
  }, []);

  const markDone = async (id: string) => {
    const r = await adminFetch(`/admin/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    if (r.ok) void load();
  };

  useEffect(() => {
    void load();
  }, [load]);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-[var(--admin-muted)]">No tasks loaded.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--admin-border)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--admin-row-header)] text-xs uppercase tracking-wide text-[var(--admin-muted)]">
          <tr>
            <th className="px-3 py-2">Task</th>
            <th className="px-3 py-2">Lead</th>
            <th className="px-3 py-2">Due</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--admin-border)]">
          {rows.map((t) => (
            <tr key={t.id}>
              <td className="px-3 py-2">{t.title}</td>
              <td className="px-3 py-2">
                <Link
                  href={`/admin/leads/${t.lead.id}`}
                  className="font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline"
                >
                  {t.lead.fullName}
                </Link>
              </td>
              <td className="px-3 py-2 text-xs tabular-nums text-[var(--admin-muted)]">
                {t.dueAt ? new Date(t.dueAt).toLocaleString() : "—"}
              </td>
              <td className="px-3 py-2 text-xs">{t.status}</td>
              <td className="px-3 py-2 text-right">
                {t.status !== "DONE" ? (
                  <button
                    type="button"
                    onClick={() => void markDone(t.id)}
                    className="text-xs font-semibold text-[var(--admin-primary)] hover:underline"
                  >
                    Mark done
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
