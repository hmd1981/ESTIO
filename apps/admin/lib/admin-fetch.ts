import { getPublicApiBase } from "@/lib/api-base";
import { getAdminToken } from "@/lib/admin-token";

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
  }
  return fetch(`${getPublicApiBase()}${path}`, {
    ...init,
    headers,
  });
}
