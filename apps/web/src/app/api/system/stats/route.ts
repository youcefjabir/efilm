import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";

import { getDb, schema } from "@/db/client";
import { requireOwner } from "@/lib/auth";
import { env } from "@/lib/env";

export async function GET() {
  try {
    await requireOwner();
    const db = await getDb();

    const usageByKind = await db
      .select({
        kind: schema.usageEvents.kind,
        total: sql<number>`sum(${schema.usageEvents.quantity})`,
        cost: sql<number>`sum(${schema.usageEvents.estimatedCostUsd})`,
        count: sql<number>`count(*)`,
      })
      .from(schema.usageEvents)
      .groupBy(schema.usageEvents.kind);

    const jobStats = await db
      .select({
        type: schema.renderJobs.type,
        status: schema.renderJobs.status,
        count: sql<number>`count(*)`,
      })
      .from(schema.renderJobs)
      .groupBy(schema.renderJobs.type, schema.renderJobs.status);

    const avgRender = await db
      .select({
        mode: schema.shotVersions.mode,
        avgSeconds: sql<number>`avg(${schema.shotVersions.renderSeconds})`,
        count: sql<number>`count(*)`,
      })
      .from(schema.shotVersions)
      .groupBy(schema.shotVersions.mode);

    const gateStats = await db
      .select({
        passed: schema.qualityReports.passed,
        count: sql<number>`count(*)`,
      })
      .from(schema.qualityReports)
      .groupBy(schema.qualityReports.passed);

    const recentJobs = await db
      .select({
        id: schema.renderJobs.id,
        type: schema.renderJobs.type,
        status: schema.renderJobs.status,
        error: schema.renderJobs.error,
        message: schema.renderJobs.message,
        createdAt: schema.renderJobs.createdAt,
        updatedAt: schema.renderJobs.updatedAt,
      })
      .from(schema.renderJobs)
      .orderBy(desc(schema.renderJobs.createdAt))
      .limit(25);

    const recentAudit = await db
      .select()
      .from(schema.auditEvents)
      .orderBy(desc(schema.auditEvents.createdAt))
      .limit(25);

    return NextResponse.json({
      providers: {
        auth: env.authProvider,
        database: env.databaseProvider,
        storage: env.storageProvider,
        director: env.directorProvider,
        depth: env.depthProvider,
        compute: process.env.COMPUTE_PROVIDER ?? "local",
        geminiConfigured: Boolean(env.geminiApiKey),
      },
      flags: {
        ownerOnlyMode: env.ownerOnlyMode,
        publicSignupEnabled: env.publicSignupEnabled,
        billingEnabled: env.billingEnabled,
        hybridMotionEnabled: env.hybridMotionEnabled,
        generativeLifePatchEnabled: env.generativeLifePatchEnabled,
      },
      usageByKind,
      jobStats,
      avgRender,
      gateStats,
      recentJobs,
      recentAudit,
    });
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
}
