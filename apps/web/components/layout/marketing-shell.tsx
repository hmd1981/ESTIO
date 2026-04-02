import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 outline-none"
      >
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
