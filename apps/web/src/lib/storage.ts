/**
 * Storage provider: local disk (default) or Supabase Storage.
 *
 * Local mode stores files under STORAGE_DIR/<bucket>/<key> and serves them
 * through /api/storage with short-lived HMAC-signed URLs — the same
 * signed-URL discipline as production, so nothing is publicly readable.
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

export async function putObject(bucket: Bucket, key: string, data: Buffer | Uint8Array) {
  const p = keyPath(bucket, key);
  await fsp.mkdir(path.dirname(p), { recursive: true });
  await fsp.writeFile(p, data);
}

export async function getObject(bucket: Bucket, key: string): Promise<Buffer | null> {
  try {
    return await fsp.readFile(keyPath(bucket, key));
  } catch {
    return null;
  }
}

export function getObjectStream(bucket: Bucket, key: string) {
  const p = keyPath(bucket, key);
  if (!fs.existsSync(p)) return null;
  return { size: fs.statSync(p).size, path: p };
}

export async function deleteObject(bucket: Bucket, key: string) {
  await fsp.rm(keyPath(bucket, key), { force: true });
}

export async function deletePrefix(bucket: Bucket, prefix: string) {
  const p = keyPath(bucket, prefix);
  await fsp.rm(p, { recursive: true, force: true });
}

export function objectExists(bucket: Bucket, key: string): boolean {
  return fs.existsSync(keyPath(bucket, key));
}

export function objectSize(bucket: Bucket, key: string): number {
  try {
    return fs.statSync(keyPath(bucket, key)).size;
  } catch {
    return 0;
  }
}
