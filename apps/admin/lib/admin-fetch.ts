import { getPublicApiBase } from "@/lib/api-base";
import { clearAdminToken, getAdminToken } from "@/lib/admin-token";

type AdminFetchInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

/** Authenticated fetch for JWT-protected API routes. */
export async function adminFetch(
  path: string,
  init: AdminFetchInit = {},
): Promise<Response> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    ...init.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers["X-Estio-Admin-Token"] = token;
  }
  const res = await fetch(`${getPublicApiBase()}${path}`, {
    ...init,
    headers,
  });

  if (res.status === 401 && typeof window !== "undefined" && token) {
    clearAdminToken();
    const next = encodeURIComponent(
      `${window.location.pathname}${window.location.search}`,
    );
    window.location.assign(`/login?session=expired&next=${next}`);
  }

  return res;
}
