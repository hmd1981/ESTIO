import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const locales = new Set(["en", "ar"]);

/**
 * Forwards locale to the root layout (SSR `lang` / `dir`) via `x-estio-locale`.
 * Sets `estio_preview` cookie when `?previewToken=` matches `PREVIEW_TOKEN`,
 * then redirects to the same path without the query (draft bundle via API).
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

  if (token && secret && token === secret) {
    if (first && locales.has(first)) {
      const url = request.nextUrl.clone();
      url.searchParams.delete("previewToken");
      const res = NextResponse.redirect(url);
      res.headers.set("x-estio-locale", locale);
      res.cookies.set("estio_preview", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 30,
        path: "/",
      });
      return res;
    }
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/en", "/ar", "/en/:path*", "/ar/:path*"],
};
