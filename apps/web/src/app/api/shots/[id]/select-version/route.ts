import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { schema } from "@/db/client";
import { audit } from "@/lib/auth";
import { getOwnedShot } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { db } = await getOwnedShot(id);
    const body = z.object({ versionId: z.string().uuid() }).safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
    const version = (
      await db
        .select()
        .from(schema.shotVersions)
        .where(
          and(
            eq(schema.shotVersions.id, body.data.versionId),
            eq(schema.shotVersions.shotId, id),
          ),
        )
        .limit(1)
    )[0];
    if (!version || !version.gatePassed) {
      return NextResponse.json(
        { error: "Only versions that passed the quality gate can be selected" },
        { status: 400 },
      );
    }
    await db
      .update(schema.shots)
      .set({
        selectedVersionId: version.id,
        status: version.mode === "final" ? "rendered" : "previewed",
        updatedAt: new Date(),
      })
      .where(eq(schema.shots.id, id));
    await audit("shot.select_version", id, { versionId: version.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 403;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
