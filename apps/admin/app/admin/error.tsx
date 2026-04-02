"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div className="rounded-lg border border-red-200 bg-red-50/80 px-6 py-8">
      <h1 className="text-lg font-semibold text-red-900">Something went wrong</h1>
      <p className="mt-2 max-w-xl text-sm text-red-800/90">
        This admin section failed to render. Retry after fixing the underlying
        issue, or return to the dashboard.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-xs text-red-700/80">
          Reference: {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-red-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Try again
        </button>
        <a
          href="/admin"
          className="inline-flex items-center rounded-md border border-red-500/50 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-950/70"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
