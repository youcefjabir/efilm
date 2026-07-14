import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { schema } from "@/db/client";
import { signedUrl } from "@/lib/storage";
import { getOwnedShot } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { db, shot } = await getOwnedShot(id);
    const versions = await db
      .select()
      .from(schema.shotVersions)
      .where(eq(schema.shotVersions.shotId, id))
      .orderBy(desc(schema.shotVersions.createdAt));
    const withUrls = await Promise.all(
      versions.map(async (v) => {
        const quality = (
          await db
            .select()
            .from(schema.qualityReports)
            .where(eq(schema.qualityReports.shotVersionId, v.id))
            .limit(1)
        )[0];
        return {
          ...v,
          videoUrl: v.storageKey ? signedUrl("renders", v.storageKey) : null,
          qualityReport: quality?.report ?? null,
          isSelected: shot.selectedVersionId === v.id,
        };
      }),
    );
    return NextResponse.json({ versions: withUrls });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 403;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
