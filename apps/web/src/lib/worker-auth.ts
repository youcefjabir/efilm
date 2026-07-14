import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { env } from "./env";

export function requireWorkerAuth(req: NextRequest): NextResponse | null {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "");
  const expected = env.workerSharedSecret;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (!token || a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
