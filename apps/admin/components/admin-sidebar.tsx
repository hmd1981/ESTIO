"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAdminNavSections, isRouteActive } from "@/lib/admin/registry";

export function AdminSidebar() {
  const pathname = usePathname() ?? "/admin";
  const sections = getAdminNavSections();

  return (
    <aside className="flex w-[15.5rem] shrink-0 flex-col border-r border-[var(--admin-border)] bg-[var(--admin-sidebar)]">
      <div className="flex h-14 items-center border-b border-[var(--admin-border)] px-4">
        <Link
          href="/admin"
          className="text-sm font-semibold tracking-tight text-[var(--admin-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-muted)]"
        >
          Estio Admin
        </Link>
      </div>
      <nav
        className="flex-1 overflow-y-auto p-3 text-sm"
        aria-label="Admin modules"
      >
        {sections.map(({ title, items }) => (
          <div key={title} className="mb-5 last:mb-1">
            <p className="px-2 pb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
              {title}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = isRouteActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={item.description}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-md px-2 py-2 text-[0.8125rem] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-muted)] ${
                        active
                          ? "bg-[var(--admin-surface-muted)] text-[var(--admin-text)] shadow-sm"
                          : "text-[var(--admin-muted)] hover:bg-[var(--admin-row-hover)] hover:text-[var(--admin-text)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
