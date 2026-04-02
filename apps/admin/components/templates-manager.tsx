"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

type Row = {
  id: string;
  name: string;
  channel: string;
  subject: string | null;
  body: string;
};

const CHANNELS = ["EMAIL", "WHATSAPP", "LINKEDIN", "OTHER"] as const;

export function TemplatesManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<string>("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await adminFetch("/admin/templates");
    if (r.ok) setRows((await r.json()) as Row[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const r = await adminFetch("/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        channel,
        subject: subject.trim() || undefined,
        body,
      }),
    });
    if (!r.ok) {
      setStatus(await r.text());
      return;
    }
    setName("");
    setSubject("");
    setBody("");
    await load();
    setStatus("Saved.");
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={create}
        className="max-w-xl space-y-3 rounded-lg border border-[var(--admin-border)] p-4"
      >
        <p className="text-xs font-semibold uppercase text-[var(--admin-muted)]">
          New template
        </p>
        <input
          className="w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          className="w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          placeholder="Subject (email)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="min-h-[120px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <button
          type="submit"
          className="rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Create
        </button>
        {status ? (
          <span className="text-xs text-[var(--admin-muted)]">{status}</span>
        ) : null}
      </form>

      <ul className="space-y-2 text-sm">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-md border border-[var(--admin-border)] px-3 py-2"
          >
            <span className="font-medium">{r.name}</span>{" "}
            <span className="text-xs text-[var(--admin-muted)]">
              ({r.channel})
            </span>
            <p className="mt-1 line-clamp-2 text-xs text-[var(--admin-muted)]">
              {r.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
