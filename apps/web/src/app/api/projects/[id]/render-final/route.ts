import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { schema } from "@/db/client";
import { audit } from "@/lib/auth";
import { enqueueRenderShot } from "@/lib/jobs";
import { requireProject } from "../route";

type Params = { params: Promise<{ id: string }> };

/** Start final render: enqueue final render jobs for every included shot that
 * lacks an approved final version. Export is chained automatically when the
 * last one completes. */
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { db } = await requireProject(id);
    const shots = await db
      .select()
      .from(schema.shots)
      .where(and(eq(schema.shots.projectId, id), eq(schema.shots.includedInFilm, true)));
    if (shots.length === 0) {
      return NextResponse.json({ error: "No shots in the storyboard" }, { status: 400 });
    }

    const jobIds: string[] = [];
    for (const shot of shots) {
      const hasFinal =
        shot.selectedVersionId &&
        (
          await db
            .select()
            .from(schema.shotVersions)
            .where(eq(schema.shotVersions.id, shot.selectedVersionId))
            .limit(1)
        )[0]?.mode === "final";
      if (!hasFinal) {
        jobIds.push(await enqueueRenderShot(shot.id, "final"));
      }
    }
    await db
      .update(schema.projects)
      .set({ status: "rendering", updatedAt: new Date() })
      .where(eq(schema.projects.id, id));
    await audit("project.render_final", id, { jobs: jobIds.length });
    return NextResponse.json({ jobIds, alreadyRendered: shots.length - jobIds.length });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 400;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
