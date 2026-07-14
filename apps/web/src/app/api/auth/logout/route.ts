import { NextRequest, NextResponse } from "next/server";

import { audit, SESSION_COOKIE } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  if (env.authProvider === "supabase") {
    const { supabaseServerClient } = await import("@/lib/supabase");
    const supabase = await supabaseServerClient();
    await supabase.auth.signOut();
  }
  await audit("logout");
  const res = NextResponse.redirect(new URL("/login", req.nextUrl.origin), 303);
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}
