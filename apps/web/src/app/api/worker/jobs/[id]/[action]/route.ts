import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { completeJob, failJob, updateJobProgress } from "@/lib/jobs";
import { requireWorkerAuth } from "@/lib/worker-auth";

type Params = { params: Promise<{ id: string; action: string }> };

const progressSchema = z.object({ progress: z.number().min(0).max(1), message: z.string().max(500).optional() });
const completeSchema = z.object({ result: z.unknown() });
const failSchema = z.object({ error: z.string().max(4000), retryable: z.boolean().default(true) });

export async function POST(req: NextRequest, { params }: Params) {
  const denied = requireWorkerAuth(req);
  if (denied) return denied;
  const { id, action } = await params;
  const body = await req.json().catch(() => null);
  if (body === null) return NextResponse.json({ error: "bad json" }, { status: 400 });

  if (action === "progress") {
    const p = progressSchema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
    await updateJobProgress(id, p.data.progress, p.data.message ?? "");
    return NextResponse.json({ ok: true });
  }
  if (action === "complete") {
    const p = completeSchema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
    await completeJob(id, p.data.result);
    return NextResponse.json({ ok: true });
  }
  if (action === "fail") {
    const p = failSchema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
    await failJob(id, p.data.error, p.data.retryable);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 404 });
}
