import { NextRequest, NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";

import { schema } from "@/db/client";
import { requireProject } from "../route";

type Params = { params: Promise<{ id: string }> };

/** Polling endpoint for progress pages: project, jobs, shots snapshot. */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { project, db } = await requireProject(id);
    const jobs = await db
      .select({
        id: schema.renderJobs.id,
        type: schema.renderJobs.type,
        status: schema.renderJobs.status,
        progress: schema.renderJobs.progress,
        message: schema.renderJobs.message,
        error: schema.renderJobs.error,
        shotId: schema.renderJobs.shotId,
        createdAt: schema.renderJobs.createdAt,
      })
      .from(schema.renderJobs)
      .where(eq(schema.renderJobs.projectId, id))
      .orderBy(desc(schema.renderJobs.createdAt))
      .limit(50);
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
    return NextResponse.json({ project, jobs, shots, exports: exportsRows });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 403;
    return NextResponse.json({ error: "not available" }, { status });
  }
}
