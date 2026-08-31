"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isAdsenseEligiblePath } from "@/lib/seo/public-routes";

const ADSENSE_CLIENT = "ca-pub-3160854101704307";
const SCRIPT_ID = "estio-adsense";

export function AdSenseLoader() {
  const pathname = usePathname();

  useEffect(() => {
    const eligible = pathname ? isAdsenseEligiblePath(pathname) : false;
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!eligible) {
      existing?.remove();
      return;
    }

    if (existing) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}
