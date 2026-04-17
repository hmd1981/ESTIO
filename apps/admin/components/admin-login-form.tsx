"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getPublicApiBase } from "@/lib/api-base";
import { setAdminToken } from "@/lib/admin-token";

export function AdminLoginForm({
  nextPath,
  sessionExpired = false,
}: {
  nextPath: string;
  sessionExpired?: boolean;
}) {
  const router = useRouter();
  const safeNext =
    nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/admin";

  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("submitting");
    setMessage(null);
    try {
      const r = await fetch(`${getPublicApiBase()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await r.json().catch(() => null)) as
        | { access_token?: string; message?: string | string[] }
        | null;
      if (!r.ok) {
        const msg = Array.isArray(body?.message)
          ? body.message.join(", ")
          : typeof body?.message === "string"
            ? body.message
            : r.status === 401
              ? "Invalid password."
              : `Login failed (${r.status})`;
        setMessage(msg);
        setState("error");
        return;
      }
      const token = body?.access_token;
      if (!token) {
        setMessage("Unexpected response from server.");
        setState("error");
        return;
      }
      setAdminToken(token);
      router.replace(safeNext);
      router.refresh();
    } catch {
      setMessage("Network error.");
      setState("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--admin-canvas)] px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 shadow-sm">
        <h1 className="font-semibold text-[var(--admin-text)]">Estio Admin</h1>
        <p className="mt-2 text-sm text-[var(--admin-muted)]">
          Sign in with the configured admin password.
        </p>
        {sessionExpired ? (
          <p
            className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            role="status"
          >
            Your session expired or the API rejected your token. Sign in again
            to continue.
          </p>
        ) : null}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-[var(--admin-muted)]">
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {message ? (
            <p className="text-sm text-red-600" role="alert">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={state === "submitting"}
            className="w-full rounded-md bg-[var(--admin-primary)] py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {state === "submitting" ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
