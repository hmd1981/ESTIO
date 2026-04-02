"use client";

import { useCallback, useEffect, useState } from "react";
import { getPublicApiBase } from "@/lib/api-base";

type SettingsRow = {
  businessName: string;
  brandName: string;
  website?: string | null;
  businessNameAr?: string | null;
  brandNameAr?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  footerText?: string | null;
  footerTextAr?: string | null;
  socialLinks?: Record<string, string> | null;
  globalLabels?: Record<string, unknown> | null;
};

const empty: SettingsRow = {
  businessName: "",
  brandName: "",
  website: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "",
  footerText: "",
  businessNameAr: "",
  brandNameAr: "",
  footerTextAr: "",
};

export function SettingsEditor() {
  const [data, setData] = useState<SettingsRow>(empty);
  const [socialJson, setSocialJson] = useState("{}");
  const [labelsJson, setLabelsJson] = useState("{}");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${getPublicApiBase()}/settings`);
      if (r.ok) {
        const j = (await r.json()) as SettingsRow;
        setData({ ...empty, ...j });
        setSocialJson(
          j.socialLinks
            ? JSON.stringify(j.socialLinks, null, 2)
            : "{}",
        );
        setLabelsJson(
          j.globalLabels
            ? JSON.stringify(j.globalLabels, null, 2)
            : "{}",
        );
      } else {
        setData(empty);
        setSocialJson("{}");
        setLabelsJson("{}");
      }
    } catch {
      setData(empty);
      setSocialJson("{}");
      setLabelsJson("{}");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    let socialLinks: Record<string, string> | undefined;
    let globalLabels: Record<string, unknown> | undefined;
    try {
      socialLinks =
        socialJson.trim() === ""
          ? undefined
          : (JSON.parse(socialJson) as Record<string, string>);
    } catch {
      setStatus("Invalid social links JSON.");
      return;
    }
    try {
      globalLabels =
        labelsJson.trim() === ""
          ? undefined
          : (JSON.parse(labelsJson) as Record<string, unknown>);
    } catch {
      setStatus("Invalid global labels JSON.");
      return;
    }
    try {
      const r = await fetch(`${getPublicApiBase()}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: data.businessName,
          brandName: data.brandName,
          website: data.website || undefined,
          businessNameAr: data.businessNameAr || undefined,
          brandNameAr: data.brandNameAr || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          whatsapp: data.whatsapp || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          country: data.country || undefined,
          footerText: data.footerText || undefined,
          footerTextAr: data.footerTextAr || undefined,
          socialLinks,
          globalLabels,
        }),
      });
      if (!r.ok) {
        const err = await r.text();
        setStatus(`Save failed: ${r.status} ${err}`);
        return;
      }
      setStatus("Saved.");
      await load();
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    }
  };

  if (loading) {
    return <p className="text-sm text-[var(--admin-muted)]">Loading…</p>;
  }

  return (
    <form onSubmit={save} className="max-w-4xl space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {(
          [
            ["businessName", "Business name (EN)", "text"],
            ["brandName", "Brand name (EN)", "text"],
            ["website", "Website (domain or URL)", "text"],
            ["businessNameAr", "Business / legal name (AR)", "text"],
            ["brandNameAr", "Brand display name (AR)", "text"],
            ["phone", "Phone", "text"],
            ["email", "Email", "email"],
            ["whatsapp", "WhatsApp URL", "text"],
            ["address", "Address", "text"],
            ["city", "City", "text"],
            ["country", "Country", "text"],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key} className="block">
            <span className="text-xs font-medium text-[var(--admin-muted)]">
              {label}
            </span>
            <input
              type={type}
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
              value={String(data[key] ?? "")}
              onChange={(e) =>
                setData((d) => ({ ...d, [key]: e.target.value }))
              }
            />
          </label>
        ))}
      </div>
      <label className="block lg:col-span-2">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Footer text (EN)
        </span>
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
          value={data.footerText ?? ""}
          onChange={(e) =>
            setData((d) => ({ ...d, footerText: e.target.value }))
          }
        />
      </label>
      <label className="block lg:col-span-2">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Footer text (AR)
        </span>
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)]"
          value={data.footerTextAr ?? ""}
          onChange={(e) =>
            setData((d) => ({ ...d, footerTextAr: e.target.value }))
          }
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Social links JSON{" "}
          <code className="text-[0.7rem]">{"{ \"linkedin\": \"https://...\" }"}</code>
        </span>
        <textarea
          className="mt-1 min-h-[80px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs text-[var(--admin-text)]"
          value={socialJson}
          onChange={(e) => setSocialJson(e.target.value)}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-[var(--admin-muted)]">
          Global labels JSON{" "}
          <code className="text-[0.7rem]">{"{ \"en\": { \"primaryCta\": \"...\" } }"}</code>
        </span>
        <textarea
          className="mt-1 min-h-[80px] w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-xs text-[var(--admin-text)]"
          value={labelsJson}
          onChange={(e) => setLabelsJson(e.target.value)}
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--admin-primary-hover)]"
        >
          Save settings
        </button>
        {status ? (
          <span className="text-sm text-[var(--admin-muted)]">{status}</span>
        ) : null}
      </div>
    </form>
  );
}
