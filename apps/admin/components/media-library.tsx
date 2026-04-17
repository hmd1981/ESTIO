"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getPublicApiBase } from "@/lib/api-base";
import { adminFetch } from "@/lib/admin-fetch";

type MediaRow = {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  altText: string | null;
  category: string | null;
  publicUrl: string | null;
  uploadedAt: string;
  placements?: {
    pageSlug: string;
    locale: string;
    sectionKey: string;
    fieldKey: string;
  }[];
};

import { proxyUploadUrl as proxyUrl } from "@/lib/proxy-upload-url";

function isImage(row: MediaRow) {
  return row.mimeType?.startsWith("image/");
}

function isVideo(row: MediaRow) {
  return row.mimeType?.startsWith("video/");
}

export function MediaLibrary({ initialRows }: { initialRows: MediaRow[] }) {
  const [rows, setRows] = useState<MediaRow[]>(initialRows);
  const [status, setStatus] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");
  const [originalName, setOriginalName] = useState("hero-image");
  const [altText, setAltText] = useState("");
  const [category, setCategory] = useState("hero");

  const refresh = useCallback(async () => {
    const r = await fetch(`${getPublicApiBase()}/media`);
    if (r.ok) {
      setRows((await r.json()) as MediaRow[]);
    }
  }, []);

  const uploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setIsWorking(true);
    const form = e.currentTarget;
    const input = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      setStatus("Choose a file to upload.");
      setIsWorking(false);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await adminFetch("/admin/media/upload", {
        method: "POST",
        body: fd,
      });
      if (r.status === 401) {
        setStatus("Sign in again to upload files.");
        setIsWorking(false);
        return;
      }
      if (!r.ok) {
        setStatus(`Upload failed: ${await r.text()}`);
        setIsWorking(false);
        return;
      }
      setStatus("Uploaded.");
      input.value = "";
      await refresh();
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    } finally {
      setIsWorking(false);
    }
  };

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const addExternal = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsWorking(true);
    const url = publicUrl.trim();
    if (!url) {
      setStatus("Enter a public URL.");
      setIsWorking(false);
      return;
    }
    try {
      const r = await adminFetch("/admin/media/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          originalName: originalName.trim() || undefined,
          altText: altText.trim() || undefined,
          category: category.trim() || undefined,
        }),
      });
      if (r.status === 401) {
        setStatus("Sign in again to import.");
        setIsWorking(false);
        return;
      }
      if (!r.ok) {
        setStatus(`Import failed: ${await r.text()}`);
        setIsWorking(false);
        return;
      }
      setPublicUrl("");
      setStatus("Imported — file is now on your server.");
      await refresh();
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    } finally {
      setIsWorking(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this media row from the library?")) return;
    setStatus(null);
    const r = await fetch(`${getPublicApiBase()}/media/${id}`, {
      method: "DELETE",
    });
    if (!r.ok) {
      setStatus(`Delete failed: ${await r.text()}`);
      return;
    }
    await refresh();
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-row-header)] px-4 py-3 text-sm leading-relaxed text-[var(--admin-text)]">
        <span className="font-semibold">Find every media slot</span>
        <span className="text-[var(--admin-muted)]">
          {" "}
          — homepage sections, marketing pages, enterprise visuals, and JSON
          keys are listed on the{" "}
        </span>
        <Link
          href="/admin/media/locations"
          className="font-semibold text-[var(--admin-text)] underline underline-offset-2 hover:text-[var(--admin-muted)]"
        >
          Media map
        </Link>
        .
      </div>
      <form
        onSubmit={uploadFile}
        className="max-w-2xl space-y-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Upload file
        </p>
        <p className="text-xs text-[var(--admin-muted)]">
          Stored under <code className="text-[0.65rem]">uploads/</code> on the
          API host. Set{" "}
          <code className="text-[0.65rem]">PUBLIC_FILE_BASE_URL</code> so{" "}
          <code className="text-[0.65rem]">publicUrl</code> is correct.
        </p>
        <input
          type="file"
          name="file"
          accept="image/*,video/mp4,video/webm,video/ogg"
          className="block w-full text-sm text-[var(--admin-text)] file:mr-3 file:rounded-md file:border file:border-[var(--admin-border)] file:bg-[var(--admin-input-bg)] file:px-3 file:py-1.5 file:text-xs file:font-medium"
        />
        <button
          type="submit"
          disabled={isWorking}
          className="rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          {isWorking ? "Uploading…" : "Upload"}
        </button>
        {status ? (
          <p className="text-sm text-[var(--admin-muted)]">{status}</p>
        ) : null}
      </form>

      <form
        onSubmit={addExternal}
        className="max-w-2xl space-y-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
          Import from URL (downloads to your server)
        </p>
        <p className="text-xs text-[var(--admin-muted)]">
          Paste a public <strong>https</strong> image or video link. The API
          downloads the file into <code className="text-[0.65rem]">uploads/</code>{" "}
          and adds a real hosted URL, same as uploading from your PC.
        </p>
        <label className="block">
          <span className="text-xs text-[var(--admin-muted)]">Media URL</span>
          <input
            className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
            value={publicUrl}
            onChange={(e) => setPublicUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs text-[var(--admin-muted)]">Label</span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={originalName}
              onChange={(e) => setOriginalName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--admin-muted)]">Alt text</span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--admin-muted)]">Category</span>
            <input
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isWorking}
            className="rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white"
          >
            {isWorking ? "Importing…" : "Import to library"}
          </button>
          {status ? (
            <span className="text-sm text-[var(--admin-muted)]">{status}</span>
          ) : null}
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-row-header)]">
              {[
                "Original",
                "Public URL",
                "Alt",
                "Category",
                "Used in",
                "Uploaded",
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
                  No media rows yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="font-medium">{row.originalName}</div>
                      {row.publicUrl && isImage(row) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={proxyUrl(row.publicUrl) ?? row.publicUrl}
                          alt={row.altText ?? row.originalName}
                          className="h-16 w-24 rounded border border-[var(--admin-border)] object-cover"
                          loading="lazy"
                        />
                      ) : row.publicUrl && isVideo(row) ? (
                        <video
                          src={proxyUrl(row.publicUrl) ?? row.publicUrl}
                          className="h-16 w-24 rounded border border-[var(--admin-border)] object-cover"
                          preload="metadata"
                          muted
                          playsInline
                          controls
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-3 font-mono text-xs text-[var(--admin-muted)]">
                    {row.publicUrl ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">{row.altText ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{row.category ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-[var(--admin-muted)]">
                    {row.placements && row.placements.length > 0 ? (
                      <ul className="space-y-1">
                        {row.placements.slice(0, 3).map((p, i) => (
                          <li key={`${p.pageSlug}-${p.locale}-${i}`}>
                            <span className="font-mono text-[0.7rem] text-[var(--admin-text)]">
                              {p.pageSlug}/{p.locale}
                            </span>{" "}
                            <span className="font-mono text-[0.7rem]">
                              {p.sectionKey}.{p.fieldKey}
                            </span>
                          </li>
                        ))}
                        {row.placements.length > 3 ? (
                          <li className="text-[0.7rem]">
                            +{row.placements.length - 3} more
                          </li>
                        ) : null}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums text-[var(--admin-muted)]">
                    {new Date(row.uploadedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-xs font-medium text-red-600 hover:underline"
                      onClick={() => void remove(row.id)}
                    >
                      Remove
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
