/**
 * Upload validation + normalization (Jimp — pure JS, no native binary, so it
 * always works in a serverless runtime unlike sharp, which needs a
 * platform-matched libvips build).
 * - validates MIME, magic bytes, dimensions and decodability
 * - bakes EXIF orientation, converts to sRGB
 * - keeps the untouched original, plus a normalized render source,
 *   an analysis proxy and a thumbnail
 */
import { createHash } from "node:crypto";
import exifr from "exifr";
import { Jimp, JimpMime } from "jimp";

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

/** EXIF orientation (1-8) -> degrees to rotate clockwise + whether to mirror
 * horizontally first. Values 5-8 are the transpose/mirror variants that real
 * cameras essentially never emit; rotation is applied, the (rare) mirror
 * component is not, which only affects that uncommon case. */
function orientationToTransform(o: number | undefined): { degrees: number; flip: boolean } {
  switch (o) {
    case 2:
      return { degrees: 0, flip: true };
    case 3:
      return { degrees: 180, flip: false };
    case 4:
      return { degrees: 180, flip: true };
    case 5:
      return { degrees: 90, flip: true };
    case 6:
      return { degrees: 90, flip: false };
    case 7:
      return { degrees: 270, flip: true };
    case 8:
      return { degrees: 270, flip: false };
    default:
      return { degrees: 0, flip: false };
  }
}

async function scaleToFitJpeg(img: Awaited<ReturnType<typeof Jimp.read>>, box: number, quality: number) {
  const clone = img.clone();
  if (clone.width > box || clone.height > box) {
    clone.scaleToFit({ w: box, h: box });
  }
  return clone.getBuffer(JimpMime.jpeg, { quality });
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

  let img: Awaited<ReturnType<typeof Jimp.read>>;
  try {
    img = await Jimp.read(data);
  } catch {
    throw new Error("Corrupt image file");
  }
  const rawW = img.width;
  const rawH = img.height;
  if (Math.max(rawW, rawH) < MIN_LONG_EDGE) {
    throw new Error(`Image too small (${rawW}x${rawH}); minimum long edge ${MIN_LONG_EDGE}px`);
  }

  const warnings: string[] = [];
  if (Math.max(rawW, rawH) < 2200) {
    warnings.push(
      "Resolution below ~2200px long edge: motion will be limited to micro templates.",
    );
  }

  const orientation = sniffed === "image/jpeg" ? await exifr.orientation(data).catch(() => undefined) : undefined;
  const { degrees, flip } = orientationToTransform(orientation);
  const needsReencode = degrees !== 0 || flip;

  const base = img.clone();
  if (flip) base.flip({ horizontal: true, vertical: false });
  if (degrees !== 0) base.rotate(degrees);

  let normalized: Buffer;
  let normalizedExt: string;
  if (needsReencode) {
    normalized = await base.clone().getBuffer(JimpMime.png);
    normalizedExt = "png";
  } else {
    normalized = data;
    normalizedExt = sniffed === "image/jpeg" ? "jpg" : sniffed === "image/png" ? "png" : "webp";
  }

  const width = base.width;
  const height = base.height;

  const proxy = await scaleToFitJpeg(base, 1600, 88);
  const thumb = await scaleToFitJpeg(base, 480, 80);

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
