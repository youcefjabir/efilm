import { NextRequest, NextResponse } from "next/server";

import { audit, consumeMagicLink, createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", req.nextUrl.origin));
  }
  const email = await consumeMagicLink(token);
  if (!email) {
    return NextResponse.redirect(new URL("/login?error=invalid_or_expired", req.nextUrl.origin));
  }
  const res = NextResponse.redirect(new URL("/projects", req.nextUrl.origin));
  res.cookies.set(SESSION_COOKIE, createSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: env.sessionMaxAgeSeconds,
    path: "/",
  });
  await audit("login", email);
  return res;
}
