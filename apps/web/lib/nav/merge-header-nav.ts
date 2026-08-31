import type { NavItem } from "@/lib/content/types";

/** Locale-agnostic path key for deduplicating nav items. */
function navPathKey(href: string): string {
  const bare = href.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
  return bare.replace(/\/$/, "") || "/";
}

/**
 * CMS navigation overrides the static fallback when rows exist — but new routes
 * added to `site.ts` (e.g. /work) won't appear until admin is updated.
 * Merge keeps CMS labels/order for known items and injects missing fallback links
 * in their intended positions.
 */
export function mergeHeaderNav(
  cmsItems: NavItem[],
  fallback: NavItem[],
): NavItem[] {
  if (cmsItems.length === 0) return fallback;

  const cmsByKey = new Map<string, NavItem>();
  for (const item of cmsItems) {
    cmsByKey.set(navPathKey(item.href), item);
  }

  const result: NavItem[] = [];
  const used = new Set<string>();

  for (const fb of fallback) {
    const key = navPathKey(fb.href);
    if (cmsByKey.has(key)) {
      result.push(cmsByKey.get(key)!);
      used.add(key);
    } else {
      result.push(fb);
    }
  }

  for (const item of cmsItems) {
    const key = navPathKey(item.href);
    if (!used.has(key)) result.push(item);
  }

  return result;
}
