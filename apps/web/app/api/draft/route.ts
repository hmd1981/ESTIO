import { NextResponse } from "next/server";
import { draftMode } from "next/headers";

function safeRedirectTarget(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/en";
  }
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("previewToken")?.trim();
  const expected = process.env.PREVIEW_TOKEN?.trim();

  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const redirectTo = safeRedirectTarget(url.searchParams.get("redirect"));
  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
