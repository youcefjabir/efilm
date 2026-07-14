import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { claimNextJob } from "@/lib/jobs";
import { requireWorkerAuth } from "@/lib/worker-auth";

export async function POST(req: NextRequest) {
  const denied = requireWorkerAuth(req);
  if (denied) return denied;
  const body = z.object({ worker_id: z.string().max(200) }).safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const job = await claimNextJob(body.data.worker_id);
  return NextResponse.json({ job });
}
