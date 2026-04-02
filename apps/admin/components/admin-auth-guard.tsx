"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/admin-token";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      const next = pathname && pathname !== "/admin" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--admin-canvas)] text-sm text-[var(--admin-muted)]">
        Verifying session…
      </div>
    );
  }

  return <>{children}</>;
}
