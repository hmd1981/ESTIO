"use client";

import { createContext, useContext } from "react";
import type { PublicSiteBundle } from "@/lib/cms/types";

const Ctx = createContext<PublicSiteBundle | null>(null);

export function SiteBundleProvider({
  value,
  children,
}: {
  value: PublicSiteBundle;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteBundle(): PublicSiteBundle {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useSiteBundle must be used inside SiteBundleProvider");
  }
  return v;
}
