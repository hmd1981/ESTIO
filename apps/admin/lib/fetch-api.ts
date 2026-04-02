import { getPublicApiBase } from "@/lib/api-base";

export async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${getPublicApiBase()}${path}`, {
      next: { revalidate: 0 },
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}
