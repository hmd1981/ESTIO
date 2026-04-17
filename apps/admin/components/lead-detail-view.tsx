"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { formatLeadServiceDisplay } from "@/lib/format-lead-service";

type LeadDetail = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  jobTitle: string | null;
  country: string | null;
  city: string | null;
  serviceType: string;
  subServiceType: string | null;
  offerType: string | null;
  studioIntent: string | null;
  status: string;
  stage: string;
  lostReason: string;
  score: number;
  scoreBreakdown: Record<string, number> | null;
  priority: string;
  source: string;
  ownerUserId: string | null;
  landingPage: string | null;
  referrer: string | null;
  campaignSource: string | null;
  campaignMedium: string | null;
  campaignName: string | null;
  message: string | null;
  projectScope: string | null;
  createdAt: string;
  answers: { id: string; questionKey: string; valueJson: unknown }[];
  notes: { id: string; body: string; createdAt: string }[];
  activities: { id: string; type: string; payload: unknown; createdAt: string }[];
  tasks: { id: string; title: string; status: string; dueAt: string | null }[];
};

const STAGES = [
  "INBOX",
  "DISCOVERY",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;
const STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "NURTURE",
  "WON",
  "LOST",
  "ON_HOLD",
] as const;
const LOST_REASONS = [
  "UNSPECIFIED",
  "TIMING",
  "BUDGET",
  "COMPETITOR",
  "NO_FIT",
  "GHOSTED",
  "OTHER",
] as const;

export function LeadDetailView({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>(
    [],
  );
  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const r = await adminFetch(`/admin/leads/${leadId}`);
    if (!r.ok) {
      setErr(await r.text());
      return;
    }
    setLead((await r.json()) as LeadDetail);
  }, [leadId]);

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

  useEffect(() => {
    void load();
    void loadUsers();
  }, [load, loadUsers]);

  const patchStage = async (stage: string) => {
    const r = await adminFetch(`/admin/leads/${leadId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (!r.ok) setErr(await r.text());
    else void load();
  };

  const patchStatus = async (status: string, lostReason?: string) => {
    const body: { status: string; lostReason?: string } = { status };
    if (status === "LOST" && lostReason) body.lostReason = lostReason;
    const r = await adminFetch(`/admin/leads/${leadId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) setErr(await r.text());
    else void load();
  };

  const patchFields = async (partial: Record<string, string>) => {
    const r = await adminFetch(`/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    if (!r.ok) setErr(await r.text());
    else void load();
  };

  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    const r = await adminFetch(`/admin/leads/${leadId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: note.trim(), authorLabel: "admin" }),
    });
    if (!r.ok) setErr(await r.text());
    else {
      setNote("");
      void load();
    }
  };

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const r = await adminFetch(`/admin/leads/${leadId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle.trim(),
        dueAt: taskDue.trim() || undefined,
      }),
    });
    if (!r.ok) setErr(await r.text());
    else {
      setTaskTitle("");
      setTaskDue("");
      void load();
    }
  };

  if (err && !lead) {
    return <p className="text-sm text-red-600">{err}</p>;
  }
  if (!lead) {
    return <p className="text-sm text-[var(--admin-muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/leads"
          className="text-sm text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          ← Inbox
        </Link>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="text-xs text-[var(--admin-muted)] hover:underline"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
        <h1 className="text-xl font-semibold text-[var(--admin-text)]">
          {lead.fullName}
        </h1>
        <p className="mt-2 text-sm text-[var(--admin-muted)]">
          <span className="font-medium text-[var(--admin-text)]">
            {formatLeadServiceDisplay(lead)}
          </span>
          {lead.offerType?.trim() ? (
            <span className="ms-1 text-xs font-normal text-[var(--admin-muted)]">
              ({lead.serviceType})
            </span>
          ) : null}
          {" · "}score{" "}
          <span className="font-mono tabular-nums">{lead.score}</span> · priority{" "}
          {lead.priority}
        </p>
        <p className="mt-4 text-xs uppercase tracking-wide text-[var(--admin-muted)]">
          Score breakdown
        </p>
        <pre className="mt-2 max-h-40 overflow-auto rounded bg-[var(--admin-surface-muted)] p-3 font-mono text-[0.7rem] text-[var(--admin-text)]">
          {JSON.stringify(lead.scoreBreakdown ?? {}, null, 2)}
        </pre>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[var(--admin-border)] p-4">
          <h2 className="text-xs font-semibold uppercase text-[var(--admin-muted)]">
            Stage & status
          </h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="text-sm">
              Stage
              <select
                className="ml-2 rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1 text-xs"
                value={lead.stage}
                onChange={(e) => void patchStage(e.target.value)}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Status
              <select
                className="ml-2 rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1 text-xs"
                value={lead.status}
                onChange={(e) => void patchStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Lost reason
              <select
                className="ml-2 rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1 text-xs"
                value={lead.lostReason}
                onChange={(e) =>
                  void patchFields({ lostReason: e.target.value })
                }
              >
                {LOST_REASONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Owner
              <select
                className="ml-2 w-[260px] rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1 text-xs"
                value={lead.ownerUserId ?? ""}
                onChange={(e) =>
                  void patchFields({ ownerUserId: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
        <section className="rounded-lg border border-[var(--admin-border)] p-4">
          <h2 className="text-xs font-semibold uppercase text-[var(--admin-muted)]">
            Contact
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-[var(--admin-text)]">
            <li>{lead.email}</li>
            <li>{lead.phone ?? "—"}</li>
            <li>WhatsApp: {lead.whatsapp ?? "—"}</li>
            <li>{lead.company ?? "—"}</li>
            <li>{lead.jobTitle ?? "—"}</li>
            <li>
              {lead.city ?? ""} {lead.country ?? ""}
            </li>
            <li className="text-xs text-[var(--admin-muted)]">
              Source {lead.source}
              {lead.landingPage ? (
                <>
                  {" "}
                  · landing{" "}
                  <a
                    className="text-[var(--admin-primary)] underline-offset-2 hover:underline"
                    href={lead.landingPage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lead.landingPage}
                  </a>
                </>
              ) : null}
            </li>
            {lead.referrer ? (
              <li className="text-xs text-[var(--admin-muted)]">
                Referrer {lead.referrer}
              </li>
            ) : null}
            {lead.campaignSource || lead.campaignMedium || lead.campaignName ? (
              <li className="text-xs text-[var(--admin-muted)]">
                UTM {lead.campaignSource ?? "—"} / {lead.campaignMedium ?? "—"} /{" "}
                {lead.campaignName ?? "—"}
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase text-[var(--admin-muted)]">
          Qualification answers
        </h2>
        <ul className="mt-2 space-y-2 text-sm">
          {lead.answers.map((a) => (
            <li key={a.id} className="font-mono text-xs">
              {a.questionKey}: {JSON.stringify(a.valueJson)}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase text-[var(--admin-muted)]">
            Notes
          </h2>
          <form onSubmit={submitNote} className="mt-2 space-y-2">
            <textarea
              className="min-h-[80px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note…"
            />
            <button
              type="submit"
              className="rounded-md bg-[var(--admin-primary)] px-3 py-1.5 text-xs font-medium text-white"
            >
              Save note
            </button>
          </form>
          <ul className="mt-4 max-h-60 space-y-3 overflow-y-auto text-sm">
            {lead.notes.map((n) => (
              <li key={n.id} className="border-b border-[var(--admin-border)] pb-2">
                <p className="whitespace-pre-wrap text-[var(--admin-text)]">{n.body}</p>
                <p className="text-xs text-[var(--admin-muted)]">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-[var(--admin-muted)]">
            Tasks
          </h2>
          <form onSubmit={submitTask} className="mt-2 flex flex-wrap gap-2">
            <input
              className="min-w-[200px] flex-1 rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <input
              type="datetime-local"
              className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-2 text-xs"
              value={taskDue}
              onChange={(e) => setTaskDue(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-md border border-[var(--admin-border)] px-3 py-2 text-xs font-medium"
            >
              Add
            </button>
          </form>
          <ul className="mt-4 space-y-2 text-sm">
            {lead.tasks.map((t) => (
              <li key={t.id}>
                {t.title}{" "}
                <span className="text-xs text-[var(--admin-muted)]">
                  {t.status}
                  {t.dueAt ? ` · ${new Date(t.dueAt).toLocaleString()}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase text-[var(--admin-muted)]">
          Activity
        </h2>
        <ul className="mt-2 max-h-[320px] space-y-2 overflow-y-auto text-xs">
          {lead.activities.map((a) => (
            <li key={a.id} className="border-l-2 border-[var(--admin-border)] pl-2">
              <span className="font-semibold text-[var(--admin-text)]">{a.type}</span>{" "}
              <span className="text-[var(--admin-muted)]">
                {new Date(a.createdAt).toLocaleString()}
              </span>
              {a.payload ? (
                <pre className="mt-1 font-mono text-[0.65rem] text-[var(--admin-muted)]">
                  {JSON.stringify(a.payload)}
                </pre>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {(lead.message || lead.projectScope) && (
        <section>
          <h2 className="text-xs font-semibold uppercase text-[var(--admin-muted)]">
            Message / scope
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--admin-text)]">
            {lead.projectScope || lead.message}
          </p>
        </section>
      )}

      <ClassificationPanel activities={lead.activities} notes={lead.notes} />
    </div>
  );
}

function ClassificationPanel({
  activities,
  notes,
}: {
  activities: { id: string; type: string; payload: unknown; createdAt: string }[];
  notes: { id: string; body: string; createdAt: string }[];
}) {
  const classificationActivity = activities.find(
    (a) =>
      a.type === "AUTOMATION" &&
      (a.payload as Record<string, unknown>)?.kind === "CLASSIFICATION",
  );

  const classificationNote = notes.find((n) =>
    n.body.startsWith("[AUTO-CLASSIFICATION]"),
  );

  if (!classificationActivity && !classificationNote) return null;

  const payload = classificationActivity?.payload as Record<string, unknown> | undefined;
  const classification = payload?.classification as string | undefined;
  const nextAction = payload?.nextAction as string | undefined;
  const dealPath = payload?.dealPath as string | undefined;
  const urgency = payload?.urgency as string | undefined;
  const missingFields = payload?.missingFields as string[] | undefined;

  const classColors: Record<string, string> = {
    READY: "border-green-600/40 bg-green-950/20",
    CLARIFY: "border-amber-600/40 bg-amber-950/20",
    REJECT: "border-red-600/40 bg-red-950/20",
  };

  const classLabels: Record<string, string> = {
    READY: "QUALIFIED — Ready for scoping",
    CLARIFY: "INCOMPLETE — Clarification required",
    REJECT: "DECLINED — Below threshold",
  };

  return (
    <section
      className={`rounded-lg border p-4 ${classColors[classification ?? ""] ?? "border-[var(--admin-border)]"}`}
    >
      <h2 className="text-xs font-semibold uppercase text-[var(--admin-muted)]">
        Auto-classification
      </h2>
      {classification ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-semibold text-[var(--admin-text)]">
            {classLabels[classification] ?? classification}
          </p>
          <div className="grid gap-2 text-xs text-[var(--admin-muted)] sm:grid-cols-2">
            <p>
              <span className="font-medium text-[var(--admin-text)]">Next action:</span>{" "}
              {nextAction?.replace(/_/g, " ")}
            </p>
            <p>
              <span className="font-medium text-[var(--admin-text)]">Urgency:</span>{" "}
              {urgency?.replace(/_/g, " ")}
            </p>
            {dealPath ? (
              <p>
                <span className="font-medium text-[var(--admin-text)]">Deal path:</span>{" "}
                {dealPath.replace(/_/g, " ")}
              </p>
            ) : null}
            {missingFields && missingFields.length > 0 ? (
              <p>
                <span className="font-medium text-[var(--admin-text)]">Missing:</span>{" "}
                {missingFields.join(", ")}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      {classificationNote ? (
        <pre className="mt-3 max-h-40 overflow-auto rounded bg-[var(--admin-surface-muted)] p-3 font-mono text-[0.65rem] text-[var(--admin-muted)]">
          {classificationNote.body}
        </pre>
      ) : null}
    </section>
  );
}
