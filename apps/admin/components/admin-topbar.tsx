"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminToken } from "@/lib/admin-token";
import { getAdminBreadcrumbs } from "@/lib/admin/registry";

export function AdminTopbar() {
  const router = useRouter();
  const pathname = usePathname() ?? "/admin";
  const crumbs = getAdminBreadcrumbs(pathname);

  function logout() {
    clearAdminToken();
    router.replace("/login");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 sm:px-6">
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[var(--admin-muted)]">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-1.5">
                {i > 0 ? (
                  <span className="text-[var(--admin-muted)]" aria-hidden>
                    /
                  </span>
                ) : null}
                {last ? (
                  <span className="font-semibold text-[var(--admin-text)]">
                    {c.label}
                  </span>
                ) : (
                  <Link
                    href={c.href}
                    className="font-medium text-[var(--admin-text)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-muted)]"
                  >
                    {c.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-muted)]"
        >
          Sign out
        </button>
        <span className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-2 py-1 text-xs font-medium text-[var(--admin-text)]">
          estio.org
        </span>
      </div>
    </header>
  );
}
