import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/db/client";
import { audit, requireOwner } from "@/lib/auth";
import { deleteObject } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await requireOwner();
    const db = await getDb();
    const asset = (
      await db.select().from(schema.assets).where(eq(schema.assets.id, id)).limit(1)
    )[0];
    if (!asset) return NextResponse.json({ error: "not found" }, { status: 404 });

    for (const key of [asset.storageKeyOriginal, asset.storageKeyProxy, asset.storageKeyThumb]) {
      if (key && key !== "pending") {
        await deleteObject("originals", key).catch(() => {});
        await deleteObject("proxies", key).catch(() => {});
        await deleteObject("thumbs", key).catch(() => {});
      }
    }
    await db.delete(schema.assets).where(eq(schema.assets.id, id));
    await audit("asset.delete", id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
}
