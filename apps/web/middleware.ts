import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const locales = new Set(["en", "ar"]);

/**
 * Forwards locale to the root layout (SSR `lang` / `dir`) via `x-estio-locale`.
 * When `?previewToken=` matches `PREVIEW_TOKEN`, redirect through `/api/draft`
 * so preview uses Next Draft Mode instead of a custom cookie that forces all
 * public routes into dynamic rendering.
 */
export function middleware(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  const first = parts[0];
  const locale =
    first && locales.has(first) ? first : "en";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-estio-locale", locale);

  const token = request.nextUrl.searchParams.get("previewToken");
  const secret = process.env.PREVIEW_TOKEN?.trim();

  if (token && secret && token === secret && first && locales.has(first)) {
    const cleaned = request.nextUrl.clone();
    cleaned.searchParams.delete("previewToken");
    const redirectPath = `${cleaned.pathname}${cleaned.search}`;
    const draftUrl = new URL("/api/draft", request.url);
    draftUrl.searchParams.set("previewToken", token);
    draftUrl.searchParams.set("redirect", redirectPath || `/${locale}`);

    const res = NextResponse.redirect(draftUrl);
    res.headers.set("x-estio-locale", locale);
    return res;
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/en", "/ar", "/en/:path*", "/ar/:path*"],
};
