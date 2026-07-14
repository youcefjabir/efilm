/**
 * Step 2 of the direct-upload flow: the browser has already PUT the raw
 * bytes straight to storage (see assets/init); this endpoint's request body
 * is tiny (just keys/filenames, no image bytes) so it is never affected by
 * Vercel's request body size cap. It fetches each staged upload server-side
 * (server -> storage has no such cap), validates/normalizes it exactly like
 * the old single-request upload did, and cleans up the staging object.
 */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { schema } from "@/db/client";
import { audit } from "@/lib/auth";
import { logUsage } from "@/lib/costs";
import { processUpload } from "@/lib/images";
import { deleteObject, getObject, putObject } from "@/lib/storage";
import { requireProject } from "../../route";

type Params = { params: Promise<{ id: string }> };

// Fetching + normalizing/re-encoding several full-size photos server-side
// can take a while; the platform default (10s on Vercel Hobby) is not enough.
export const maxDuration = 120;

const bodySchema = z.object({
  files: z
    .array(
      z.object({
        filename: z.string().min(1).max(300),
        mimeType: z.string().min(1).max(100),
        key: z.string().min(1).max(500),
      }),
    )
    .min(1)
    .max(60),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { project, db } = await requireProject(id);
    if (["analyzing", "rendering", "exporting"].includes(project.status)) {
      return NextResponse.json(
        { error: "Project is busy; wait for the current job to finish." },
        { status: 409 },
      );
    }
    const { files } = bodySchema.parse(await req.json());

    const uploaded: unknown[] = [];
    const errors: { filename: string; error: string }[] = [];
    let bytes = 0;

    for (const f of files) {
      try {
        const data = await getObject("originals", f.key);
        if (!data) {
          errors.push({ filename: f.filename, error: "Upload did not arrive at storage" });
          continue;
        }
        const processed = await processUpload(data, f.mimeType);

        const existing = await db
          .select()
          .from(schema.assets)
          .where(eq(schema.assets.contentHash, processed.contentHash));
        if (existing.some((a) => a.projectId === id && a.status !== "deleted")) {
          await deleteObject("originals", f.key);
          errors.push({ filename: f.filename, error: "Identical file already uploaded" });
          continue;
        }

        const [asset] = await db
          .insert(schema.assets)
          .values({
            projectId: id,
            originalFilename: f.filename,
            contentHash: processed.contentHash,
            mimeType: processed.mimeType,
            width: processed.width,
            height: processed.height,
            fileSizeBytes: data.length,
            storageKeyOriginal: "pending",
          })
          .returning();

        const rawKey = `${id}/${asset.id}.raw.${processed.ext}`;
        const normKey = `${id}/${asset.id}.norm.${processed.normalizedExt}`;
        const proxyKey = `${id}/${asset.id}.jpg`;
        await putObject("originals", rawKey, processed.original);
        if (processed.normalizedExt !== processed.ext || processed.normalized !== processed.original) {
          await putObject("originals", normKey, processed.normalized);
        }
        await putObject("proxies", proxyKey, processed.proxy);
        await putObject("thumbs", proxyKey, processed.thumb);
        await deleteObject("originals", f.key);

        const renderSourceKey =
          processed.normalized === processed.original ? rawKey : normKey;
        await db
          .update(schema.assets)
          .set({
            storageKeyOriginal: renderSourceKey,
            storageKeyProxy: proxyKey,
            storageKeyThumb: proxyKey,
          })
          .where(eq(schema.assets.id, asset.id));

        bytes += data.length;
        uploaded.push({ id: asset.id, filename: f.filename, warnings: processed.warnings });
      } catch (e) {
        errors.push({ filename: f.filename, error: (e as Error).message });
      }
    }

    if (uploaded.length > 0) {
      await db
        .update(schema.projects)
        .set({ status: "uploading", updatedAt: new Date() })
        .where(eq(schema.projects.id, id));
      await logUsage(id, "storage", bytes, "bytes", 0, { op: "upload" });
      await audit("assets.upload", id, { count: uploaded.length });
    }
    return NextResponse.json({ uploaded, errors });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 403;
    return NextResponse.json({ error: "not available" }, { status });
  }
}
