import { NextRequest, NextResponse } from "next/server";

import { audit } from "@/lib/auth";
import { enqueueRenderShot } from "@/lib/jobs";
import { getOwnedShot } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await getOwnedShot(id);
    const jobId = await enqueueRenderShot(id, "preview");
    await audit("shot.preview", id, { jobId });
    return NextResponse.json({ jobId });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 400;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
