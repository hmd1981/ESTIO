"use client";

import { useCallback, useEffect, useState } from "react";
import { getPublicApiBase } from "@/lib/api-base";

type NavRow = {
  id: string;
  label: string;
  href: string;
  orderIndex: number;
  location: string;
  locale: string;
  isActive: boolean;
};

const LOCATIONS = ["HEADER", "FOOTER"] as const;

export function NavigationManager({ initialRows }: { initialRows: NavRow[] }) {
  const [rows, setRows] = useState<NavRow[]>(initialRows);
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("/en/services");
  const [orderIndex, setOrderIndex] = useState(0);
  const [location, setLocation] =
    useState<(typeof LOCATIONS)[number]>("HEADER");
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [status, setStatus] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const r = await fetch(`${getPublicApiBase()}/navigation`);
    if (r.ok) setRows((await r.json()) as NavRow[]);
  }, []);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const r = await fetch(`${getPublicApiBase()}/navigation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          href: href.trim(),
          orderIndex,
          location,
          locale,
          isActive: true,
        }),
      });
      if (!r.ok) {
        setStatus(`Create failed: ${await r.text()}`);
        return;
      }
      setLabel("");
      setStatus("Added.");
      await refresh();
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    }
  };

  const toggleActive = async (row: NavRow) => {
    setStatus(null);
    const r = await fetch(`${getPublicApiBase()}/navigation/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    if (!r.ok) {
      setStatus(`Update failed: ${await r.text()}`);
      return;
    }
    await refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this navigation link?")) return;
    setStatus(null);
    const r = await fetch(`${getPublicApiBase()}/navigation/${id}`, {
      method: "DELETE",
    });
    if (!r.ok) {
      setStatus(`Delete failed: ${await r.text()}`);
      return;
    }
    await refresh();
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={createLink}
        className="max-w-3xl space-y-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4"
      >
        <p className="text-xs font-semibold uppercase text-[var(--admin-muted)]">
          New link
        </p>
        <p className="text-xs text-[var(--admin-muted)]">
          Use locale-prefixed paths (e.g. <code>/en/about</code>,{" "}
          <code>/ar/contact</code>) so visitors stay in the correct language.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-[var(--admin-muted)]">Label</span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--admin-muted)]">Href</span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--admin-muted)]">Order</span>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
            />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--admin-muted)]">Location</span>
            <select
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value as (typeof LOCATIONS)[number])
              }
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-[var(--admin-muted)]">Locale</span>
            <select
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "ar")}
            >
              <option value="en">English (site)</option>
              <option value="ar">Arabic (site)</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white"
          >
            Add link
          </button>
          {status ? (
            <span className="text-sm text-[var(--admin-muted)]">{status}</span>
          ) : null}
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-row-header)]">
              {[
                "Label",
                "Href",
                "Order",
                "Location",
                "Locale",
                "Active",
                "",
              ].map((c) => (
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
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-[var(--admin-muted)]"
                >
                  No navigation rows. Add header/footer links for EN and AR.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.label}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.href}</td>
                  <td className="px-4 py-3 tabular-nums">{row.orderIndex}</td>
                  <td className="px-4 py-3 text-xs">{row.location}</td>
                  <td className="px-4 py-3 text-xs uppercase">{row.locale}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className={`text-xs font-medium ${
                        row.isActive ? "text-emerald-600" : "text-[var(--admin-muted)]"
                      }`}
                      onClick={() => void toggleActive(row)}
                    >
                      {row.isActive ? "On" : "Off"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-xs font-medium text-red-600 hover:underline"
                      onClick={() => void remove(row.id)}
                    >
                      Delete
                    </button>
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
