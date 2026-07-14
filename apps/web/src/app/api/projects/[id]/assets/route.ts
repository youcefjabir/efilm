import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { schema } from "@/db/client";
import { audit } from "@/lib/auth";
import { processUpload } from "@/lib/images";
import { logUsage } from "@/lib/costs";
import { putObject } from "@/lib/storage";
import { requireProject } from "../route";

type Params = { params: Promise<{ id: string }> };

// Batches of up to 60 photos are resized/hashed/uploaded synchronously here;
// the platform default (10s on Vercel Hobby) is not enough headroom.
export const maxDuration = 120;

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
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    if (files.length === 0) {
      return NextResponse.json({ error: "No files received" }, { status: 400 });
    }
    if (files.length > 60) {
      return NextResponse.json({ error: "Max 60 images per upload" }, { status: 400 });
    }

    const uploaded: unknown[] = [];
    const errors: { filename: string; error: string }[] = [];
    let bytes = 0;

    for (const file of files) {
      try {
        const data = Buffer.from(await file.arrayBuffer());
        const processed = await processUpload(data, file.type);

        const existing = await db
          .select()
          .from(schema.assets)
          .where(eq(schema.assets.contentHash, processed.contentHash));
        if (existing.some((a) => a.projectId === id && a.status !== "deleted")) {
          errors.push({ filename: file.name, error: "Identical file already uploaded" });
          continue;
        }

        const [asset] = await db
          .insert(schema.assets)
          .values({
            projectId: id,
            originalFilename: file.name,
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
        uploaded.push({ id: asset.id, filename: file.name, warnings: processed.warnings });
      } catch (e) {
        errors.push({ filename: file.name, error: (e as Error).message });
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
