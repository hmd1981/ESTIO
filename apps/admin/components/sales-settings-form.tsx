"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

type Settings = {
  id: string;
  scoringRules: unknown;
  defaultOwnerUserId: string | null;
  staleLeadDays: number;
  followUpReminderHours: number;
  proposalFollowUpDays: number;
  lostReasonWhenLostRequired: boolean;
};

export function SalesSettingsForm() {
  const [row, setRow] = useState<Settings | null>(null);
  const [rulesJson, setRulesJson] = useState("{}");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await adminFetch("/admin/sales-settings");
    if (!r.ok) return;
    const data = (await r.json()) as Settings;
    setRow(data);
    setRulesJson(
      JSON.stringify(data.scoringRules ?? {}, null, 2),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    let scoringRules: object;
    try {
      scoringRules = JSON.parse(rulesJson) as object;
    } catch {
      setMsg("Invalid scoring JSON.");
      return;
    }
    if (!row) return;
    const r = await adminFetch("/admin/sales-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scoringRules,
        defaultOwnerUserId: row.defaultOwnerUserId || null,
        staleLeadDays: row.staleLeadDays,
        followUpReminderHours: row.followUpReminderHours,
        proposalFollowUpDays: row.proposalFollowUpDays,
        lostReasonWhenLostRequired: row.lostReasonWhenLostRequired,
      }),
    });
    setMsg(r.ok ? "Saved." : await r.text());
    if (r.ok) void load();
  };

  if (!row) {
    return <p className="text-sm text-[var(--admin-muted)]">Loading…</p>;
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <label className="block text-sm">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Default owner user id
        </span>
        <input
          className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          value={row.defaultOwnerUserId ?? ""}
          onChange={(e) =>
            setRow({ ...row, defaultOwnerUserId: e.target.value || null })
          }
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
      {(
        [
          ["staleLeadDays", "Stale lead (days)"],
          ["followUpReminderHours", "Follow-up reminder (hrs)"],
          ["proposalFollowUpDays", "Proposal follow-up (days)"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-sm">
          <span className="text-xs font-medium text-[var(--admin-muted)]">
            {label}
          </span>
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
            value={row[key]}
            onChange={(e) =>
              setRow({ ...row, [key]: Number(e.target.value) } as Settings)
            }
          />
        </label>
      ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={row.lostReasonWhenLostRequired}
          onChange={(e) =>
            setRow({
              ...row,
              lostReasonWhenLostRequired: e.target.checked,
            })
          }
        />
        Require lost reason when status is LOST
      </label>
      <label className="block text-sm">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Scoring rules (JSON)
        </span>
        <textarea
          className="mt-1 min-h-[200px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs"
          value={rulesJson}
          onChange={(e) => setRulesJson(e.target.value)}
          spellCheck={false}
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white"
      >
        Save
      </button>
      {msg ? <p className="text-sm text-[var(--admin-muted)]">{msg}</p> : null}
    </form>
  );
}
