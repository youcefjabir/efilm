import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { schema } from "@/db/client";
import { audit } from "@/lib/auth";
import { requireProject } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { db } = await requireProject(id);
    const body = z
      .object({ order: z.array(z.string().uuid()).min(1).max(100) })
      .safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

    for (const [index, shotId] of body.data.order.entries()) {
      await db
        .update(schema.shots)
        .set({ storyboardPosition: index, updatedAt: new Date() })
        .where(eq(schema.shots.id, shotId));
    }
    await audit("storyboard.reorder", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 403;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
