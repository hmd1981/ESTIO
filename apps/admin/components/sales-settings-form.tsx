"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

const DEFAULT_STAGE_OPTIONS = [
  "NEW",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

type Settings = {
  id: string;
  isActive: boolean;
  scoringRules: unknown;
  automationRules?: unknown;
  intentMapping: unknown;
  priorityMapping: unknown;
  routingMapping: unknown;
  pricingHints: unknown;
  defaultStage: string;
  defaultOwnerUserId: string | null;
  staleLeadDays: number;
  followUpReminderHours: number;
  proposalFollowUpDays: number;
  lostReasonWhenLostRequired: boolean;
};

function stringifyJson(v: unknown, fallback: object) {
  const base = v && typeof v === "object" && !Array.isArray(v) ? v : fallback;
  return JSON.stringify(base, null, 2);
}

export function SalesSettingsForm() {
  const [row, setRow] = useState<Settings | null>(null);
  const [rulesJson, setRulesJson] = useState("{}");
  const [intentJson, setIntentJson] = useState("{}");
  const [priorityJson, setPriorityJson] = useState("{}");
  const [routingJson, setRoutingJson] = useState("{}");
  const [pricingJson, setPricingJson] = useState("{}");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await adminFetch("/admin/sales-settings");
    if (!r.ok) return;
    const data = (await r.json()) as Partial<Settings> & { id: string };
    setRow({
      ...data,
      isActive: data.isActive !== false,
      defaultStage:
        typeof data.defaultStage === "string" && data.defaultStage
          ? data.defaultStage
          : "NEW",
    } as Settings);
    setRulesJson(stringifyJson(data.scoringRules, {}));
    setIntentJson(
      stringifyJson(data.intentMapping, {
        images: "AI Image Production",
        video: "Short-form AI Video",
        brand: "Brand AI Pack",
      }),
    );
    setPriorityJson(
      stringifyJson(data.priorityMapping, {
        video: "high",
        brand: "high",
        images: "medium",
      }),
    );
    setRoutingJson(
      stringifyJson(data.routingMapping, {
        images: "sales",
        video: "sales",
        brand: "owner",
      }),
    );
    setPricingJson(
      stringifyJson(data.pricingHints, {
        images: "Starting from $150",
        video: "Starting from $300",
        brand: "Custom pricing",
      }),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    let scoringRules: object;
    let intentMapping: object;
    let priorityMapping: object;
    let routingMapping: object;
    let pricingHints: object;
    try {
      scoringRules = JSON.parse(rulesJson) as object;
      intentMapping = JSON.parse(intentJson) as object;
      priorityMapping = JSON.parse(priorityJson) as object;
      routingMapping = JSON.parse(routingJson) as object;
      pricingHints = JSON.parse(pricingJson) as object;
    } catch {
      setMsg("Invalid JSON in one of the editors.");
      return;
    }
    if (!row) return;
    const r = await adminFetch("/admin/sales-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isActive: row.isActive,
        scoringRules,
        intentMapping,
        priorityMapping,
        routingMapping,
        pricingHints,
        defaultStage: row.defaultStage,
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
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={row.isActive}
          onChange={(e) =>
            setRow({ ...row, isActive: e.target.checked })
          }
        />
        Sales / AI Studio lead capture active
      </label>
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
      <label className="block text-sm">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Default pipeline stage (AI Studio)
        </span>
        <select
          className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          value={row.defaultStage || "NEW"}
          onChange={(e) =>
            setRow({ ...row, defaultStage: e.target.value })
          }
        >
          {DEFAULT_STAGE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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
          Intent → offer (JSON)
        </span>
        <textarea
          className="mt-1 min-h-[120px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs"
          value={intentJson}
          onChange={(e) => setIntentJson(e.target.value)}
          spellCheck={false}
        />
      </label>
      <label className="block text-sm">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Intent → priority (JSON)
        </span>
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs"
          value={priorityJson}
          onChange={(e) => setPriorityJson(e.target.value)}
          spellCheck={false}
        />
      </label>
      <label className="block text-sm">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Intent → routing (JSON: owner | sales | user id)
        </span>
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs"
          value={routingJson}
          onChange={(e) => setRoutingJson(e.target.value)}
          spellCheck={false}
        />
      </label>
      <label className="block text-sm">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Pricing hints (JSON)
        </span>
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs"
          value={pricingJson}
          onChange={(e) => setPricingJson(e.target.value)}
          spellCheck={false}
        />
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
