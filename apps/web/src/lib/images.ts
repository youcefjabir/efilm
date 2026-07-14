/**
 * Upload validation + normalization (sharp).
 * - validates MIME, magic bytes, dimensions and decodability
 * - bakes EXIF orientation, converts to sRGB
 * - keeps the untouched original, plus a normalized render source,
 *   an analysis proxy and a thumbnail
 */
import { createHash } from "node:crypto";
import sharp from "sharp";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 40 * 1024 * 1024;
const MIN_LONG_EDGE = 800;

export type ProcessedImage = {
  contentHash: string;
  width: number;
  height: number;
  mimeType: string;
  ext: string;
  original: Buffer;
  normalized: Buffer; // EXIF-baked, sRGB; PNG when re-encode was required
  normalizedExt: string;
  proxy: Buffer; // 1600px JPEG for analysis
  thumb: Buffer; // 480px JPEG
  warnings: string[];
};

function sniffMime(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf.length > 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  )
    return "image/png";
  if (
    buf.length > 12 &&
    buf.slice(0, 4).toString("ascii") === "RIFF" &&
    buf.slice(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  return null;
}

export async function processUpload(
  data: Buffer,
  declaredMime: string,
): Promise<ProcessedImage> {
  if (data.length === 0) throw new Error("Empty file");
  if (data.length > MAX_BYTES) throw new Error("File larger than 40 MB");

  const sniffed = sniffMime(data);
  if (!sniffed || !ALLOWED.has(sniffed)) {
    throw new Error("Unsupported or corrupt file (JPEG, PNG or WebP required)");
  }
  if (ALLOWED.has(declaredMime) && declaredMime !== sniffed) {
    // Signature wins; declared type mismatch is suspicious but tolerable.
  }

  let meta;
  try {
    meta = await sharp(data).metadata();
  } catch {
    throw new Error("Corrupt image file");
  }
  const rawW = meta.width ?? 0;
  const rawH = meta.height ?? 0;
  if (Math.max(rawW, rawH) < MIN_LONG_EDGE) {
    throw new Error(`Image too small (${rawW}x${rawH}); minimum long edge ${MIN_LONG_EDGE}px`);
  }

  const warnings: string[] = [];
  if (Math.max(rawW, rawH) < 2200) {
    warnings.push(
      "Resolution below ~2200px long edge: motion will be limited to micro templates.",
    );
  }

  const needsReencode =
    (meta.orientation ?? 1) !== 1 ||
    (meta.space && meta.space !== "srgb" && meta.space !== "rgb");

  const base = sharp(data).rotate(); // bakes EXIF orientation
  let normalized: Buffer;
  let normalizedExt: string;
  if (needsReencode) {
    normalized = await base.clone().toColorspace("srgb").png({ compressionLevel: 6 }).toBuffer();
    normalizedExt = "png";
  } else {
    normalized = data;
    normalizedExt = sniffed === "image/jpeg" ? "jpg" : sniffed === "image/png" ? "png" : "webp";
  }

  const normMeta = await sharp(normalized).metadata();
  const width = normMeta.width ?? rawW;
  const height = normMeta.height ?? rawH;

  const proxy = await base
    .clone()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();
  const thumb = await base
    .clone()
    .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return {
    contentHash: createHash("sha256").update(data).digest("hex"),
    width,
    height,
    mimeType: sniffed,
    ext: sniffed === "image/jpeg" ? "jpg" : sniffed === "image/png" ? "png" : "webp",
    original: data,
    normalized,
    normalizedExt,
    proxy,
    thumb,
    warnings,
  };
}
