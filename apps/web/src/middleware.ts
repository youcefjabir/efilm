/**
 * Server-side route protection (owner allowlist).
 * Frontend checks are never sufficient: this middleware and every API route
 * re-validate the session against OWNER_EMAIL.
 */
import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { env, isOwner } from "@/lib/env";

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

const PUBLIC_PREFIXES = ["/login", "/api/auth/", "/api/storage/", "/api/worker/"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  let email: string | null = null;
  if (env.authProvider === "supabase") {
    // Supabase session cookie check happens in requireOwner (server components);
    // here we only do a cheap presence check to avoid an extra network call.
    const hasCookie = req.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.value.length > 0);
    email = hasCookie ? env.ownerEmail : null;
  } else {
    email = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)?.email ?? null;
  }

  if (pathname === "/") {
    const dest = isOwner(email) ? "/projects" : "/login";
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
  }

  if (!isOwner(email)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const url = new URL("/login", req.nextUrl.origin);
    if (email) url.searchParams.set("error", "access_denied");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
