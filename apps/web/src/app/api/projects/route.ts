import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq, isNull, and, sql } from "drizzle-orm";

import { getDb, schema } from "@/db/client";
import { audit, requireOwner } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().max(300).optional(),
  propertyType: z.enum(["auto", "apartment", "house", "townhouse", "vacation_home", "new_construction"]).default("auto"),
  lengthPreference: z.enum(["auto", "short", "normal", "long", "custom"]).default("auto"),
  customLengthSeconds: z.number().min(10).max(120).optional(),
});

export async function GET() {
  try {
    const email = await requireOwner();
    const db = await getDb();
    const rows = await db
      .select()
      .from(schema.projects)
      .where(and(eq(schema.projects.ownerEmail, email), isNull(schema.projects.deletedAt)))
      .orderBy(desc(schema.projects.createdAt));
    return NextResponse.json({ projects: rows });
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  let email: string;
  try {
    email = await requireOwner();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid project data" }, { status: 400 });
  }
  const db = await getDb();
  const [project] = await db
    .insert(schema.projects)
    .values({ ...parsed.data, ownerEmail: email })
    .returning();
  await audit("project.create", project.id, { name: project.name });
  return NextResponse.json({ project });
}
