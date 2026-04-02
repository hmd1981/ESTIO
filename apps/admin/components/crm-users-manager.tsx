"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

type Row = { id: string; email: string; name: string; isActive: boolean };

export function CrmUsersManager({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const r = await adminFetch("/admin/crm-users");
    if (!r.ok) return;
    setRows((await r.json()) as Row[]);
  }, []);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const r = await adminFetch("/admin/crm-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        name: name.trim(),
        isActive: true,
      }),
    });
    if (!r.ok) {
      setStatus(await r.text());
      return;
    }
    setEmail("");
    setName("");
    setStatus("Created.");
    await refresh();
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={create}
        className="max-w-2xl space-y-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Add user
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-[var(--admin-muted)]">Name</span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Operator name"
            />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--admin-muted)]">Email</span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white"
          >
            Create
          </button>
          {status ? (
            <span className="text-sm text-[var(--admin-muted)]">{status}</span>
          ) : null}
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-row-header)]">
              {["Name", "Email", "Active"].map((c) => (
                <th
                  key={c}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-border)]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-sm text-[var(--admin-muted)]"
                >
                  No CRM users yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-[var(--admin-text)]">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{r.email}</td>
                  <td className="px-4 py-3 text-xs">
                    {r.isActive ? "Yes" : "No"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

