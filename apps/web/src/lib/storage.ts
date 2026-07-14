/**
 * Storage provider: local disk (default) or Supabase Storage.
 *
 * Both modes are addressed the same way by the rest of the app: signed HMAC
 * URLs pointing at /api/storage/<bucket>/<key>, verified by
 * verifySignedRequest. Only the object bytes move differently underneath —
 * local disk reads/writes a file; Supabase mode proxies to the Storage REST
 * API with the service-role key (server-side only, never sent to a client).
 * Keeping one URL scheme for both means the Python worker and every route
 * handler are unaffected by which backend is active.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

import { env } from "./env";

export type Bucket = "originals" | "proxies" | "thumbs" | "masks" | "renders" | "exports";

const SIGN_TTL_GET = 60 * 15;
const SIGN_TTL_PUT = 60 * 60;

function keyPath(bucket: Bucket, key: string): string {
  const safeKey = key.replace(/\.\./g, "").replace(/^\/+/, "");
  return path.join(env.storageDir, bucket, safeKey);
}

function signature(method: string, bucket: string, key: string, exp: number): string {
  return createHmac("sha256", env.storageSigningSecret)
    .update(`${method}|${bucket}|${key}|${exp}`)
    .digest("base64url");
}

export function signedUrl(
  bucket: Bucket,
  key: string,
  opts: { method?: "GET" | "PUT"; baseUrl?: string } = {},
): string {
  const method = opts.method ?? "GET";
  const exp = Math.floor(Date.now() / 1000) + (method === "PUT" ? SIGN_TTL_PUT : SIGN_TTL_GET);
  const sig = signature(method, bucket, key, exp);
  const base = opts.baseUrl ?? "";
  return `${base}/api/storage/${bucket}/${encodeURIComponent(key)}?exp=${exp}&sig=${sig}&m=${method}`;
}

export function verifySignedRequest(
  method: string,
  bucket: string,
  key: string,
  exp: string | null,
  sig: string | null,
): boolean {
  if (!exp || !sig) return false;
  const expNum = parseInt(exp, 10);
  if (!Number.isFinite(expNum) || expNum < Math.floor(Date.now() / 1000)) return false;
  const expected = signature(method, bucket, key, expNum);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------- Supabase Storage REST client (server-side only) ----------

function supabaseHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    apikey: env.supabaseServiceRoleKey,
    ...extra,
  };
}

function supabaseObjectUrl(bucket: Bucket, key: string): string {
  return `${env.supabaseUrl}/storage/v1/object/${bucket}/${key}`;
}

async function supabasePutObject(bucket: Bucket, key: string, data: Buffer | Uint8Array) {
  const res = await fetch(supabaseObjectUrl(bucket, key), {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": "application/octet-stream",
      "x-upsert": "true",
    }),
    body: new Uint8Array(data),
  });
  if (!res.ok) {
    throw new Error(`Supabase Storage upload failed (${res.status}): ${await res.text()}`);
  }
}

async function supabaseGetObject(bucket: Bucket, key: string): Promise<Buffer | null> {
  const res = await fetch(supabaseObjectUrl(bucket, key), { headers: supabaseHeaders() });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function supabaseDeleteObject(bucket: Bucket, key: string) {
  await fetch(supabaseObjectUrl(bucket, key), {
    method: "DELETE",
    headers: supabaseHeaders(),
  }).catch(() => {});
}

async function supabaseDeletePrefix(bucket: Bucket, prefix: string) {
  const listRes = await fetch(`${env.supabaseUrl}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefix, limit: 1000 }),
  });
  if (!listRes.ok) return;
  const entries = (await listRes.json()) as { name: string }[];
  const prefixes = entries.map((e) => `${prefix.replace(/\/+$/, "")}/${e.name}`);
  if (prefixes.length === 0) return;
  await fetch(`${env.supabaseUrl}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: supabaseHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes }),
  }).catch(() => {});
}

async function supabaseCreateUploadUrl(bucket: Bucket, key: string): Promise<string> {
  const res = await fetch(`${env.supabaseUrl}/storage/v1/object/upload/sign/${bucket}/${key}`, {
    method: "POST",
    headers: supabaseHeaders({ "Content-Type": "application/json" }),
    body: "{}",
  });
  if (!res.ok) {
    throw new Error(`Supabase Storage signed-upload creation failed (${res.status}): ${await res.text()}`);
  }
  const body = (await res.json()) as { url: string };
  return `${env.supabaseUrl}/storage/v1${body.url}`;
}

async function supabaseHeadObject(
  bucket: Bucket,
  key: string,
): Promise<{ size: number } | null> {
  const res = await fetch(supabaseObjectUrl(bucket, key), {
    method: "HEAD",
    headers: supabaseHeaders(),
  });
  if (!res.ok) return null;
  const len = res.headers.get("content-length");
  return { size: len ? parseInt(len, 10) : 0 };
}

// ---------- Public API (local disk or Supabase, selected by env.storageProvider) ----------

const useSupabase = () => env.storageProvider === "supabase";

export async function putObject(bucket: Bucket, key: string, data: Buffer | Uint8Array) {
  if (useSupabase()) return supabasePutObject(bucket, key, data);
  const p = keyPath(bucket, key);
  await fsp.mkdir(path.dirname(p), { recursive: true });
  await fsp.writeFile(p, data);
}

export async function getObject(bucket: Bucket, key: string): Promise<Buffer | null> {
  if (useSupabase()) return supabaseGetObject(bucket, key);
  try {
    return await fsp.readFile(keyPath(bucket, key));
  } catch {
    return null;
  }
}

/** Local mode: {size, path} for a direct fs.createReadStream with Range
 * support. Supabase mode: {size, remoteUrl} — the storage route fetches from
 * Supabase and forwards the (possibly ranged) response instead. */
export type ObjectRef = { size: number; path?: string; remoteUrl?: string };

export async function getObjectStream(bucket: Bucket, key: string): Promise<ObjectRef | null> {
  if (useSupabase()) {
    const head = await supabaseHeadObject(bucket, key);
    if (!head) return null;
    return { size: head.size, remoteUrl: supabaseObjectUrl(bucket, key) };
  }
  const p = keyPath(bucket, key);
  if (!fs.existsSync(p)) return null;
  return { size: fs.statSync(p).size, path: p };
}

export async function deleteObject(bucket: Bucket, key: string) {
  if (useSupabase()) return supabaseDeleteObject(bucket, key);
  await fsp.rm(keyPath(bucket, key), { force: true });
}

export async function deletePrefix(bucket: Bucket, prefix: string) {
  if (useSupabase()) return supabaseDeletePrefix(bucket, prefix);
  const p = keyPath(bucket, prefix);
  await fsp.rm(p, { recursive: true, force: true });
}

export async function objectExists(bucket: Bucket, key: string): Promise<boolean> {
  if (useSupabase()) return (await supabaseHeadObject(bucket, key)) !== null;
  return fs.existsSync(keyPath(bucket, key));
}

/** A URL the *browser* can PUT raw bytes to directly, bypassing our own
 * server for the transfer. In Supabase mode this is a native Supabase
 * signed-upload URL (browser -> Supabase, never touches our serverless
 * function, so Vercel's ~4.5 MB request body cap never applies no matter how
 * large the photo is). In local mode there is no such cap on a self-hosted
 * Node process, so it's just our own signed PUT URL. */
export async function createDirectUploadUrl(
  bucket: Bucket,
  key: string,
  baseUrl: string,
): Promise<string> {
  if (useSupabase()) return supabaseCreateUploadUrl(bucket, key);
  return signedUrl(bucket, key, { method: "PUT", baseUrl });
}

export async function objectSize(bucket: Bucket, key: string): Promise<number> {
  if (useSupabase()) return (await supabaseHeadObject(bucket, key))?.size ?? 0;
  try {
    return fs.statSync(keyPath(bucket, key)).size;
  } catch {
    return 0;
  }
}
