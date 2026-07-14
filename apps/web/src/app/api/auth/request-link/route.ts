import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createMagicLink, rateLimit } from "@/lib/auth";
import { env } from "@/lib/env";

const bodySchema = z.object({ email: z.string().email().max(200) });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit(`link:${ip}`, 8)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let email: string;
  try {
    email = bodySchema.parse(await req.json()).email;
  } catch {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (!rateLimit(`link-email:${email.toLowerCase()}`, 5)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  if (env.authProvider === "supabase") {
    const { supabaseSendMagicLink } = await import("@/lib/supabase");
    const { isOwner } = await import("@/lib/env");
    if (isOwner(email)) {
      await supabaseSendMagicLink(email, `${req.nextUrl.origin}/projects`);
    }
  } else {
    await createMagicLink(email, req.nextUrl.origin);
  }

  // Identical response whether or not the address is allowed.
  return NextResponse.json({
    ok: true,
    message:
      "If this address has access, a sign-in link has been issued. Local mode: check the web server terminal.",
  });
}
