import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { schema } from "@/db/client";
import { audit } from "@/lib/auth";
import { getObject, putObject } from "@/lib/storage";
import { requireProject } from "../route";

type Params = { params: Promise<{ id: string }> };

/** Duplicate a project: copies source assets (files + rows); analysis and
 * storyboard are re-run fresh in the copy. */
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { db, project, email } = await requireProject(id);
    const [copy] = await db
      .insert(schema.projects)
      .values({
        ownerEmail: email,
        name: `${project.name} (copy)`,
        address: project.address,
        propertyType: project.propertyType,
        lengthPreference: project.lengthPreference,
        customLengthSeconds: project.customLengthSeconds,
        status: "uploading",
      })
      .returning();

    const assets = await db
      .select()
      .from(schema.assets)
      .where(eq(schema.assets.projectId, id));
    for (const a of assets) {
      if (a.status === "deleted") continue;
      const [newAsset] = await db
        .insert(schema.assets)
        .values({
          projectId: copy.id,
          originalFilename: a.originalFilename,
          contentHash: a.contentHash,
          mimeType: a.mimeType,
          width: a.width,
          height: a.height,
          fileSizeBytes: a.fileSizeBytes,
          storageKeyOriginal: "pending",
          status: "uploaded",
        })
        .returning();
      const copyFile = async (bucket: "originals" | "proxies" | "thumbs", oldKey: string | null) => {
        if (!oldKey || oldKey === "pending") return null;
        const data = await getObject(bucket, oldKey);
        if (!data) return null;
        const newKey = oldKey.replace(id, copy.id).replace(a.id, newAsset.id);
        await putObject(bucket, newKey, data);
        return newKey;
      };
      const newOriginal = await copyFile("originals", a.storageKeyOriginal);
      const newProxy = await copyFile("proxies", a.storageKeyProxy);
      await copyFile("thumbs", a.storageKeyThumb);
      await db
        .update(schema.assets)
        .set({
          storageKeyOriginal: newOriginal ?? "pending",
          storageKeyProxy: newProxy,
          storageKeyThumb: newProxy,
        })
        .where(eq(schema.assets.id, newAsset.id));
    }
    await audit("project.duplicate", id, { copyId: copy.id });
    return NextResponse.json({ project: copy });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 403;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
