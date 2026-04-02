"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

type LeadRow = {
  id: string;
  fullName: string;
  company: string | null;
  email: string;
  phone: string | null;
  serviceType: string;
  source: string;
  status: string;
  priority: string;
  stage: string;
  score: number;
  ownerUserId: string | null;
  createdAt: string;
};

const STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "NURTURE",
  "WON",
  "LOST",
  "ON_HOLD",
] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "STRATEGIC"] as const;

export function LeadsManager() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>(
    [],
  );
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const r = await adminFetch(`/admin/crm-users`);
      if (!r.ok) return;
      const list = (await r.json()) as {
        id: string;
        name: string;
        email: string;
        isActive: boolean;
      }[];
      setUsers(list.filter((u) => u.isActive));
    } catch {
      setUsers([]);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = statusFilter
        ? `?status=${encodeURIComponent(statusFilter)}`
        : "";
      const r = await adminFetch(`/admin/leads${q}`);
      if (r.status === 401) {
        setError("Session expired. Sign in again.");
        setRows([]);
        return;
      }
      if (!r.ok) {
        setError(await r.text());
        setRows([]);
        return;
      }
      setRows((await r.json()) as LeadRow[]);
    } catch {
      setError("Failed to load leads.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
    void loadUsers();
  }, [load, loadUsers]);

  async function patchLead(id: string, body: Record<string, string>) {
    setError(null);
    const r = await adminFetch(`/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      setError(await r.text());
      return;
    }
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[var(--admin-muted)]">Status</span>
          <select
            className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-md border border-[var(--admin-border)] px-3 py-1.5 text-sm font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--admin-muted)]">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-row-header)]">
                {[
                  "Created",
                  "Name",
                  "Company",
                  "Email",
                  "Service",
                  "Stage",
                  "Source",
                  "Score",
                  "Priority",
                  "Owner",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-3 py-10 text-center text-[var(--admin-muted)]"
                  >
                    No leads in this view.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="whitespace-nowrap px-3 py-3 text-xs tabular-nums text-[var(--admin-muted)]">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 font-medium text-[var(--admin-text)]">
                      <Link
                        href={`/admin/leads/${row.id}`}
                        className="text-[var(--admin-primary)] underline-offset-2 hover:underline"
                      >
                        {row.fullName}
                      </Link>
                    </td>
                    <td className="max-w-[140px] truncate px-3 py-3 text-[var(--admin-muted)]">
                      {row.company ?? "—"}
                    </td>
                    <td className="max-w-[180px] truncate px-3 py-3 font-mono text-xs">
                      {row.email}
                    </td>
                    <td className="px-3 py-3 text-xs">{row.serviceType}</td>
                    <td className="px-3 py-3 text-xs">{row.stage}</td>
                    <td className="px-3 py-3 text-xs">{row.source}</td>
                    <td className="px-3 py-3 text-xs tabular-nums">{row.score}</td>
                    <td className="px-3 py-3">
                      <select
                        className="w-full min-w-[100px] rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1 text-xs"
                        value={row.priority}
                        onChange={(e) =>
                          void patchLead(row.id, { priority: e.target.value })
                        }
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="w-full min-w-[140px] rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1 text-xs"
                        value={row.ownerUserId ?? ""}
                        onChange={(e) =>
                          void patchLead(row.id, { ownerUserId: e.target.value })
                        }
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="w-full min-w-[110px] rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1 text-xs"
                        value={row.status}
                        onChange={(e) =>
                          void patchLead(row.id, { status: e.target.value })
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/admin/leads/${row.id}`}
                        className="text-xs font-semibold text-[var(--admin-primary)]"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
