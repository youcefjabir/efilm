/**
 * Signed storage access (local storage provider).
 * GET  — download with a valid signature, or as the authenticated owner.
 * PUT  — upload with a valid PUT signature (worker outputs only).
 */
import fs from "node:fs";
import { Readable } from "node:stream";

import { NextRequest, NextResponse } from "next/server";

import { isAuthenticatedOwner } from "@/lib/auth";
import { getObjectStream, putObject, verifySignedRequest, type Bucket } from "@/lib/storage";

/** Node streams must be converted (not cast) to web streams; a cast stream
 * crashes the whole server with ERR_INVALID_STATE when a client disconnects
 * mid-download (video seeking does this constantly). */
function fileStream(path: string, opts?: { start: number; end: number }): ReadableStream {
  return Readable.toWeb(fs.createReadStream(path, opts)) as ReadableStream;
}

const BUCKETS: Bucket[] = ["originals", "proxies", "thumbs", "masks", "renders", "exports"];

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
};

function contentTypeFor(key: string): string {
  const dot = key.lastIndexOf(".");
  return MIME[key.slice(dot).toLowerCase()] ?? "application/octet-stream";
}

type Params = { params: Promise<{ bucket: string; key: string[] }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { bucket, key } = await params;
  if (!BUCKETS.includes(bucket as Bucket)) {
    return NextResponse.json({ error: "unknown bucket" }, { status: 404 });
  }
  const keyStr = key.map(decodeURIComponent).join("/");
  const sp = req.nextUrl.searchParams;

  const signatureOk = verifySignedRequest("GET", bucket, keyStr, sp.get("exp"), sp.get("sig"));
  if (!signatureOk && !(await isAuthenticatedOwner())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const obj = getObjectStream(bucket as Bucket, keyStr);
  if (!obj) return NextResponse.json({ error: "not found" }, { status: 404 });

  const headers = new Headers({
    "Content-Type": contentTypeFor(keyStr),
    "Content-Length": String(obj.size),
    "Cache-Control": "private, max-age=60",
  });

  // Range support so <video> can seek.
  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d+)-(\d*)/.exec(range);
    if (m) {
      const start = parseInt(m[1], 10);
      const end = m[2] ? parseInt(m[2], 10) : obj.size - 1;
      headers.set("Content-Range", `bytes ${start}-${end}/${obj.size}`);
      headers.set("Content-Length", String(end - start + 1));
      headers.set("Accept-Ranges", "bytes");
      return new NextResponse(fileStream(obj.path, { start, end }), { status: 206, headers });
    }
  }
  headers.set("Accept-Ranges", "bytes");
  return new NextResponse(fileStream(obj.path), { status: 200, headers });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { bucket, key } = await params;
  if (!BUCKETS.includes(bucket as Bucket)) {
    return NextResponse.json({ error: "unknown bucket" }, { status: 404 });
  }
  const keyStr = key.map(decodeURIComponent).join("/");
  const sp = req.nextUrl.searchParams;
  if (!verifySignedRequest("PUT", bucket, keyStr, sp.get("exp"), sp.get("sig"))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const data = Buffer.from(await req.arrayBuffer());
  if (data.length === 0) return NextResponse.json({ error: "empty body" }, { status: 400 });
  if (data.length > 2 * 1024 * 1024 * 1024) {
    return NextResponse.json({ error: "too large" }, { status: 413 });
  }
  await putObject(bucket as Bucket, keyStr, data);
  return NextResponse.json({ ok: true, size: data.length });
}
