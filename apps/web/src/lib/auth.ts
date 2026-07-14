/**
 * Owner-only authentication.
 *
 * local mode   — the app itself issues magic links (printed to the server
 *                terminal); sessions are HMAC-signed httpOnly cookies.
 * supabase mode — Supabase Auth magic links; see lib/supabase.ts.
 *
 * In BOTH modes every server entry point re-checks the owner allowlist:
 * a forged or foreign session is rejected even if structurally valid.
 */
import { createHmac, randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { env, isOwner } from "./env";

export const SESSION_COOKIE = "pms_session";

// ---------- session token (local mode) ----------

type SessionPayload = { email: string; iat: number; exp: number };

function b64url(data: Buffer | string): string {
  return Buffer.from(data).toString("base64url");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", env.authSecret).update(payloadB64).digest("base64url");
}

export function createSessionToken(email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { email, iat: now, exp: now + env.sessionMaxAgeSeconds };
  const p = b64url(JSON.stringify(payload));
  return `${p}.${sign(p)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [p, sig] = token.split(".");
  if (!p || !sig) return null;
  const expected = sign(p);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(p, "base64url").toString()) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------- current user ----------

export async function currentUserEmail(): Promise<string | null> {
  if (env.authDisabled) return env.ownerEmail;
  if (env.authProvider === "supabase") {
    const { supabaseUserEmail } = await import("./supabase");
    return supabaseUserEmail();
  }
  const jar = await cookies();
  const session = verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  return session?.email ?? null;
}

/** Server-side gate for every protected page/route. */
export async function requireOwner(): Promise<string> {
  const email = await currentUserEmail();
  if (!isOwner(email)) {
    const err = new Error("access_denied");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return email!;
}

export async function isAuthenticatedOwner(): Promise<boolean> {
  return isOwner(await currentUserEmail());
}

// ---------- magic links (local mode) ----------

const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

export async function createMagicLink(email: string, baseUrl: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  // Owner-only: silently refuse everything else (same response shape).
  if (!isOwner(normalized)) return null;

  const raw = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  const db = await getDb();
  await db.insert(schema.authTokens).values({
    email: normalized,
    tokenHash,
    expiresAt: new Date(Date.now() + env.magicLinkTtlSeconds * 1000),
  });
  const url = `${baseUrl}/api/auth/callback?token=${raw}`;
  // "Delivery": the owner runs this app privately; the link goes to the
  // server terminal. An SMTP/Resend hook can be added in lib/mailer.ts.
  console.log(`\n[auth] Magic link for ${normalized}:\n${url}\n`);
  return url;
}

export async function consumeMagicLink(rawToken: string): Promise<string | null> {
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.authTokens)
    .where(eq(schema.authTokens.tokenHash, tokenHash))
    .limit(1);
  const token = rows[0];
  if (!token || token.usedAt || token.expiresAt < new Date()) return null;
  await db
    .update(schema.authTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.authTokens.id, token.id));
  if (!isOwner(token.email)) return null;
  return token.email;
}

export async function audit(action: string, subject?: string, meta?: unknown) {
  try {
    const db = await getDb();
    const email = await currentUserEmail().catch(() => null);
    await db.insert(schema.auditEvents).values({
      actorEmail: email,
      action,
      subject,
      meta: meta ?? null,
    });
  } catch {
    // auditing must never break the main flow
  }
}
