/**
 * Step 1 of the direct-upload flow: hand the browser a URL it can PUT raw
 * bytes to directly (Supabase Storage in production, our own server in local
 * mode) — see lib/storage.ts#createDirectUploadUrl for why this exists
 * (Vercel's serverless functions cap request bodies at ~4.5 MB, far below a
 * single modern photo, so the upload itself cannot go through our API).
 */
import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createDirectUploadUrl } from "@/lib/storage";
import { requireProject } from "../../route";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  files: z
    .array(z.object({ filename: z.string().min(1).max(300), mimeType: z.string().min(1).max(100) }))
    .min(1)
    .max(60),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { project } = await requireProject(id);
    if (["analyzing", "rendering", "exporting"].includes(project.status)) {
      return NextResponse.json(
        { error: "Project is busy; wait for the current job to finish." },
        { status: 409 },
      );
    }
    const { files } = bodySchema.parse(await req.json());
    const base = req.nextUrl.origin;

    const out = await Promise.all(
      files.map(async (f) => {
        const stagingId = randomUUID();
        const key = `${id}/staging/${stagingId}.upload`;
        const uploadUrl = await createDirectUploadUrl("originals", key, base);
        return { stagingId, filename: f.filename, mimeType: f.mimeType, key, uploadUrl };
      }),
    );
    return NextResponse.json({ files: out });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 400;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
