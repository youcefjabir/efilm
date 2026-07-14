import { NextRequest, NextResponse } from "next/server";

import { audit } from "@/lib/auth";
import { enqueueAnalyzeProject } from "@/lib/jobs";
import { requireProject } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await requireProject(id);
    const jobId = await enqueueAnalyzeProject(id);
    await audit("project.analyze", id, { jobId });
    return NextResponse.json({ jobId });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 400;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
