import type { Metadata } from "next";
import { brand } from "@/lib/content/site";

function absoluteUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `https://${brand.domain}${p}`;
}

/** Metadata for service / enterprise detail routes. */
export function marketingDetailMetadata(
  seo: { title: string; description: string },
  canonicalPath: string,
): Metadata {
  const url = absoluteUrl(canonicalPath);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${seo.title} | ${brand.name}`,
      description: seo.description,
      url,
      siteName: brand.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

