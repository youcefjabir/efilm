import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, isNull } from "drizzle-orm";

import { getDb, schema } from "@/db/client";
import { audit, requireOwner } from "@/lib/auth";
import { deletePrefix } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

export async function requireProject(id: string) {
  const email = await requireOwner();
  const db = await getDb();
  const project = (
    await db
      .select()
      .from(schema.projects)
      .where(
        and(
          eq(schema.projects.id, id),
          eq(schema.projects.ownerEmail, email),
          isNull(schema.projects.deletedAt),
        ),
      )
      .limit(1)
  )[0];
  if (!project) {
    const err = new Error("not_found");
    (err as Error & { status?: number }).status = 404;
    throw err;
  }
  return { project, db, email };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { project, db } = await requireProject(id);
    const assets = await db
      .select()
      .from(schema.assets)
      .where(eq(schema.assets.projectId, id))
      .orderBy(asc(schema.assets.createdAt));
    const shots = await db
      .select()
      .from(schema.shots)
      .where(eq(schema.shots.projectId, id))
      .orderBy(asc(schema.shots.storyboardPosition));
    const exportsRows = await db
      .select()
      .from(schema.finalExports)
      .where(eq(schema.finalExports.projectId, id))
      .orderBy(desc(schema.finalExports.version));
    return NextResponse.json({ project, assets, shots, exports: exportsRows });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 403;
    return NextResponse.json({ error: "not available" }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { db } = await requireProject(id);
    // Remove stored files first, then rows (cascade), then tombstone.
    for (const bucket of ["originals", "proxies", "thumbs", "renders", "exports", "masks"] as const) {
      await deletePrefix(bucket, id);
    }
    await db.delete(schema.projects).where(eq(schema.projects.id, id));
    await audit("project.delete", id);
    return NextResponse.json({ ok: true, deleted: true });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 403;
    return NextResponse.json({ error: "not available" }, { status });
  }
}
