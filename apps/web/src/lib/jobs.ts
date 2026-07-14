/**
 * Job orchestration. Jobs live in the render_jobs table; the Python worker
 * claims them over the internal API. Completion handlers here write the
 * domain rows (analysis, shots, versions, quality reports, exports).
 */
import { and, asc, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";

import { getDb, schema } from "@/db/client";
import { geminiCost, logUsage, PRICES } from "./costs";
import { env } from "./env";
import { signedUrl } from "./storage";

const JOB_TIMEOUT_MINUTES = { analyze_project: 30, render_shot: 30, export_final: 20 };

function workerBaseUrl(): string {
  return (process.env.WEB_INTERNAL_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

// ---------- enqueue ----------

export async function enqueueAnalyzeProject(projectId: string): Promise<string> {
  const db = await getDb();
  const assetRows = await db
    .select()
    .from(schema.assets)
    .where(and(eq(schema.assets.projectId, projectId), eq(schema.assets.status, "uploaded")));
  if (assetRows.length === 0) throw new Error("No uploaded images to analyze");

  const project = (
    await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).limit(1)
  )[0];
  if (!project) throw new Error("Project not found");

  const base = workerBaseUrl();
  const payload = {
    project_id: projectId,
    length_preference: project.lengthPreference,
    custom_seconds: project.customLengthSeconds,
    director_provider: env.directorProvider,
    depth_provider: env.depthProvider,
    assets: assetRows.map((a) => ({
      asset_id: a.id,
      content_hash: a.contentHash,
      url: signedUrl("proxies", a.storageKeyProxy ?? "", { baseUrl: base }),
    })),
  };

  const idempotencyKey = `analyze:${projectId}:${assetRows.map((a) => a.contentHash.slice(0, 8)).join(",")}`;
  const existing = await db
    .select()
    .from(schema.renderJobs)
    .where(
      and(
        eq(schema.renderJobs.idempotencyKey, idempotencyKey),
        inArray(schema.renderJobs.status, ["queued", "running"]),
      ),
    )
    .limit(1);
  if (existing[0]) return existing[0].id;

  const [job] = await db
    .insert(schema.renderJobs)
    .values({ projectId, type: "analyze_project", payload, idempotencyKey })
    .returning();
  await db
    .update(schema.projects)
    .set({ status: "analyzing", updatedAt: new Date() })
    .where(eq(schema.projects.id, projectId));
  return job.id;
}

export async function enqueueRenderShot(shotId: string, mode: "preview" | "final"): Promise<string> {
  const db = await getDb();
  const shot = (
    await db.select().from(schema.shots).where(eq(schema.shots.id, shotId)).limit(1)
  )[0];
  if (!shot) throw new Error("Shot not found");
  const asset = (
    await db.select().from(schema.assets).where(eq(schema.assets.id, shot.sourceAssetId)).limit(1)
  )[0];
  if (!asset) throw new Error("Source asset not found");

  const base = workerBaseUrl();
  const versionKey = `${shot.projectId}/${shot.id}/${Date.now()}.${mode}.mp4`;
  const anchorKey = versionKey.replace(/\.mp4$/, ".anchor.png");

  let maskUrl: string | undefined;
  if (shot.motionCategory === "SCENE_LIFE") {
    const mask = (
      await db
        .select()
        .from(schema.segmentationMasks)
        .where(
          and(
            eq(schema.segmentationMasks.assetId, asset.id),
            eq(schema.segmentationMasks.effectType, shot.sceneLifeEffectType ?? ""),
            eq(schema.segmentationMasks.isActive, true),
          ),
        )
        .orderBy(sql`${schema.segmentationMasks.version} desc`)
        .limit(1)
    )[0];
    if (mask) maskUrl = signedUrl("masks", mask.storageKey, { baseUrl: base });
  }

  const payload = {
    shot_id: shotId,
    mode,
    motion_category: shot.motionCategory,
    depth_provider: env.depthProvider,
    asset_url: signedUrl("originals", asset.storageKeyOriginal, { baseUrl: base }),
    mask_url: maskUrl,
    output_put_url: signedUrl("renders", versionKey, { method: "PUT", baseUrl: base }),
    anchor_put_url: signedUrl("renders", anchorKey, { method: "PUT", baseUrl: base }),
    output_storage_key: versionKey,
    anchor_storage_key: anchorKey,
    params: {
      template_id: shot.cameraMotionTemplate,
      effect_type: shot.sceneLifeEffectType,
      duration_seconds: shot.durationSeconds,
      strength: shot.motionStrength,
      anchor_mode: shot.anchorMode,
      risk_class: shot.riskClass,
    },
  };

  const [job] = await db
    .insert(schema.renderJobs)
    .values({ projectId: shot.projectId, shotId, type: "render_shot", payload })
    .returning();
  await db
    .update(schema.shots)
    .set({ status: mode === "preview" ? "previewing" : "rendering", updatedAt: new Date() })
    .where(eq(schema.shots.id, shotId));
  return job.id;
}

export async function enqueueExportFinal(projectId: string): Promise<string> {
  const db = await getDb();
  const shotRows = await db
    .select()
    .from(schema.shots)
    .where(and(eq(schema.shots.projectId, projectId), eq(schema.shots.includedInFilm, true)))
    .orderBy(asc(schema.shots.storyboardPosition));

  const clips: { url: string; position: number }[] = [];
  const base = workerBaseUrl();
  for (const shot of shotRows) {
    if (!shot.selectedVersionId) continue;
    const version = (
      await db
        .select()
        .from(schema.shotVersions)
        .where(eq(schema.shotVersions.id, shot.selectedVersionId))
        .limit(1)
    )[0];
    if (version?.storageKey && version.mode === "final" && version.gatePassed) {
      clips.push({
        url: signedUrl("renders", version.storageKey, { baseUrl: base }),
        position: shot.storyboardPosition,
      });
    }
  }
  if (clips.length === 0) throw new Error("No approved final shots to export");

  const versionNum =
    ((
      await db
        .select({ v: sql<number>`coalesce(max(${schema.finalExports.version}), 0)` })
        .from(schema.finalExports)
        .where(eq(schema.finalExports.projectId, projectId))
    )[0]?.v ?? 0) + 1;

  const exportKey = `${projectId}/final_v${versionNum}.mp4`;
  const [exp] = await db
    .insert(schema.finalExports)
    .values({ projectId, version: versionNum, storageKey: exportKey, status: "rendering" })
    .returning();

  const payload = {
    project_id: projectId,
    export_id: exp.id,
    clips,
    output_put_url: signedUrl("exports", exportKey, { method: "PUT", baseUrl: base }),
  };
  const [job] = await db
    .insert(schema.renderJobs)
    .values({ projectId, type: "export_final", payload })
    .returning();
  await db
    .update(schema.projects)
    .set({ status: "exporting", updatedAt: new Date() })
    .where(eq(schema.projects.id, projectId));
  return job.id;
}

// ---------- claim / progress / complete / fail ----------

export async function claimNextJob(workerId: string) {
  const db = await getDb();
  // Requeue timed-out jobs first.
  await db
    .update(schema.renderJobs)
    .set({ status: "queued", claimedBy: null, message: "requeued after timeout" })
    .where(and(eq(schema.renderJobs.status, "running"), lt(schema.renderJobs.timeoutAt, new Date())));

  const candidates = await db
    .select()
    .from(schema.renderJobs)
    .where(eq(schema.renderJobs.status, "queued"))
    .orderBy(asc(schema.renderJobs.createdAt))
    .limit(1);
  const job = candidates[0];
  if (!job) return null;

  const timeoutMinutes = JOB_TIMEOUT_MINUTES[job.type as keyof typeof JOB_TIMEOUT_MINUTES] ?? 30;
  const updated = await db
    .update(schema.renderJobs)
    .set({
      status: "running",
      claimedBy: workerId,
      claimedAt: new Date(),
      attempts: job.attempts + 1,
      timeoutAt: new Date(Date.now() + timeoutMinutes * 60 * 1000),
      updatedAt: new Date(),
    })
    .where(and(eq(schema.renderJobs.id, job.id), eq(schema.renderJobs.status, "queued")))
    .returning();
  if (!updated[0]) return null; // lost the race
  return { id: job.id, type: job.type, payload: job.payload };
}

export async function updateJobProgress(jobId: string, progress: number, message: string) {
  const db = await getDb();
  await db
    .update(schema.renderJobs)
    .set({ progress, message, updatedAt: new Date() })
    .where(and(eq(schema.renderJobs.id, jobId), eq(schema.renderJobs.status, "running")));
}

export async function failJob(jobId: string, error: string, retryable: boolean) {
  const db = await getDb();
  const job = (
    await db.select().from(schema.renderJobs).where(eq(schema.renderJobs.id, jobId)).limit(1)
  )[0];
  if (!job) return;
  const canRetry = retryable && job.attempts < job.maxAttempts;
  await db
    .update(schema.renderJobs)
    .set({
      status: canRetry ? "queued" : "failed",
      error,
      claimedBy: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.renderJobs.id, jobId));

  if (!canRetry) {
    if (job.type === "render_shot" && job.shotId) {
      await db
        .update(schema.shots)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(schema.shots.id, job.shotId));
    }
    if (job.type === "analyze_project" && job.projectId) {
      await db
        .update(schema.projects)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(schema.projects.id, job.projectId));
    }
    if (job.type === "export_final" && job.projectId) {
      const exportId = (job.payload as { export_id?: string }).export_id;
      if (exportId) {
        await db
          .update(schema.finalExports)
          .set({ status: "failed" })
          .where(eq(schema.finalExports.id, exportId));
      }
    }
  }
}

export async function cancelJob(jobId: string) {
  const db = await getDb();
  await db
    .update(schema.renderJobs)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(schema.renderJobs.id, jobId),
        or(eq(schema.renderJobs.status, "queued"), eq(schema.renderJobs.status, "running")),
      ),
    );
}

export async function completeJob(jobId: string, result: unknown) {
  const db = await getDb();
  const job = (
    await db.select().from(schema.renderJobs).where(eq(schema.renderJobs.id, jobId)).limit(1)
  )[0];
  if (!job || job.status !== "running") return;

  if (job.type === "analyze_project") await completeAnalyze(job, result as AnalyzeResult);
  else if (job.type === "render_shot") await completeRenderShot(job, result as RenderResult);
  else if (job.type === "export_final") await completeExport(job, result as ExportResult);

  await db
    .update(schema.renderJobs)
    .set({ status: "completed", progress: 1, result, updatedAt: new Date() })
    .where(eq(schema.renderJobs.id, jobId));
}

// ---------- completion handlers ----------

type AnalyzeResult = {
  assets: {
    asset_id: string;
    analysis: Record<string, unknown>;
    semantics: Record<string, unknown>;
    analysis_seconds: number;
  }[];
  storyboard: {
    shots: Record<string, unknown>[];
    rejected: { asset_id: string; reason: string }[];
    estimated_duration_seconds: number;
    length_preference: string;
  };
  usage: { model: string; input_tokens: number; output_tokens: number; asset_id: string }[];
};

async function completeAnalyze(job: typeof schema.renderJobs.$inferSelect, result: AnalyzeResult) {
  const db = await getDb();
  const projectId = job.projectId!;

  let cpuSeconds = 0;
  for (const a of result.assets) {
    const analysis = a.analysis as Record<string, unknown> & {
      phash?: string;
      quality_score?: number;
      risk_score?: number;
      depth_provider?: string;
      depth_confidence?: number;
      depth_meta?: unknown;
      scene_life_candidates?: { type: string; confidence: number }[];
    };
    const semantics = a.semantics as Record<string, unknown> & {
      scene_type?: string;
      is_aerial?: boolean;
      provider?: string;
    };
    const assetRow = (
      await db.select().from(schema.assets).where(eq(schema.assets.id, a.asset_id)).limit(1)
    )[0];
    if (!assetRow) continue;

    await db.insert(schema.assetAnalysis).values({
      assetId: a.asset_id,
      contentHash: assetRow.contentHash,
      analysis: a.analysis,
      semantics: a.semantics,
      qualityScore: (analysis.quality_score as number) ?? null,
      riskScore: (analysis.risk_score as number) ?? null,
      sceneType: (semantics.scene_type as string) ?? null,
      isAerial: Boolean(semantics.is_aerial),
      provider: (semantics.provider as string) ?? null,
    });
    if (analysis.phash) {
      await db.insert(schema.assetEmbeddings).values({
        assetId: a.asset_id,
        contentHash: assetRow.contentHash,
        phash: analysis.phash,
      });
    }
    await db.insert(schema.depthMaps).values({
      assetId: a.asset_id,
      contentHash: assetRow.contentHash,
      provider: (analysis.depth_provider as string) ?? "unknown",
      confidence: (analysis.depth_confidence as number) ?? null,
      meta: analysis.depth_meta ?? null,
    });
    for (const cand of analysis.scene_life_candidates ?? []) {
      await db.insert(schema.sceneLifeEffects).values({
        assetId: a.asset_id,
        effectType: cand.type,
        confidence: cand.confidence,
        eligible: cand.confidence >= 0.8,
      });
    }
    await db
      .update(schema.assets)
      .set({ status: "analyzed" })
      .where(eq(schema.assets.id, a.asset_id));
    cpuSeconds += a.analysis_seconds ?? 0;
  }

  for (const rej of result.storyboard.rejected) {
    await db
      .update(schema.assets)
      .set({ status: "rejected" })
      .where(eq(schema.assets.id, rej.asset_id));
  }

  // Storyboard + shots.
  const [storyboard] = await db
    .insert(schema.storyboards)
    .values({
      projectId,
      estimatedDurationSeconds: result.storyboard.estimated_duration_seconds,
    })
    .returning();
  await db.insert(schema.storyboardVersions).values({
    storyboardId: storyboard.id,
    version: 1,
    proposal: result.storyboard,
    createdBy: "ai_director",
  });

  const semanticsByAsset = new Map(result.assets.map((a) => [a.asset_id, a.semantics]));
  for (const s of result.storyboard.shots as {
    asset_id: string;
    storyboard_position: number;
    motion_category: string;
    camera_motion_template?: string | null;
    scene_life_effect_type?: string | null;
    anchor_mode?: string;
    duration_seconds: number;
    strength: number;
    risk_class: string;
    confidence?: number;
    reason?: string;
  }[]) {
    const sem = semanticsByAsset.get(s.asset_id) as { scene_type?: string } | undefined;
    await db.insert(schema.shots).values({
      projectId,
      sourceAssetId: s.asset_id,
      storyboardPosition: s.storyboard_position,
      sceneType: sem?.scene_type ?? null,
      motionCategory: s.motion_category,
      cameraMotionTemplate: s.camera_motion_template ?? null,
      sceneLifeEffectType: s.scene_life_effect_type ?? null,
      anchorMode: s.anchor_mode ?? "START_ANCHOR",
      durationSeconds: s.duration_seconds,
      motionStrength: s.strength,
      riskClass: s.risk_class,
      confidenceScore: s.confidence ?? null,
      reason: s.reason ?? null,
    });
  }

  await db
    .update(schema.projects)
    .set({ status: "storyboard", updatedAt: new Date() })
    .where(eq(schema.projects.id, projectId));

  await logUsage(projectId, "analysis_cpu", cpuSeconds, "s", cpuSeconds * PRICES.cpuSecond);
  for (const u of result.usage ?? []) {
    await logUsage(
      projectId,
      "gemini_call",
      u.input_tokens + u.output_tokens,
      "tokens",
      geminiCost(u.model, u.input_tokens, u.output_tokens),
      u,
    );
  }
}

type RenderResult = {
  ok: boolean;
  skipped: boolean;
  category: string;
  attempts: { outcome?: string; plan?: unknown; quality?: unknown; spec?: unknown }[];
  final_plan: Record<string, unknown> | null;
  quality_report: { pass: boolean } | null;
  render_seconds: number;
};

async function completeRenderShot(job: typeof schema.renderJobs.$inferSelect, result: RenderResult) {
  const db = await getDb();
  const payload = job.payload as {
    mode: "preview" | "final";
    output_storage_key: string;
    anchor_storage_key?: string;
  };
  const shotId = job.shotId!;

  const [version] = await db
    .insert(schema.shotVersions)
    .values({
      shotId,
      mode: payload.mode,
      params: result.final_plan ?? {},
      storageKey: result.ok ? payload.output_storage_key : null,
      anchorStorageKey: result.ok && payload.mode === "final" ? payload.anchor_storage_key : null,
      status: result.ok ? "passed" : result.skipped ? "skipped" : "failed",
      gatePassed: result.quality_report?.pass ?? false,
      renderSeconds: result.render_seconds,
    })
    .returning();

  for (const [i, attempt] of (result.attempts ?? []).entries()) {
    await db.insert(schema.renderAttempts).values({
      shotVersionId: version.id,
      attemptIndex: i,
      parameters: attempt,
      outcome: (attempt.outcome as string) ?? "unknown",
    });
  }
  if (result.quality_report) {
    await db.insert(schema.qualityReports).values({
      shotVersionId: version.id,
      passed: result.quality_report.pass,
      report: result.quality_report,
    });
  }
  if (result.ok) {
    await db.insert(schema.shotOutputs).values({
      shotVersionId: version.id,
      kind: payload.mode === "preview" ? "preview_mp4" : "final_mp4",
      storageKey: payload.output_storage_key,
    });
  }

  // Scene Life fallback may have reclassified the shot to camera motion.
  const categoryChanged =
    result.ok &&
    result.category === "CAMERA_MOTION" &&
    (job.payload as { motion_category?: string }).motion_category === "SCENE_LIFE";

  await db
    .update(schema.shots)
    .set({
      status: result.ok
        ? payload.mode === "preview"
          ? "previewed"
          : "rendered"
        : "skipped",
      selectedVersionId: result.ok && payload.mode === "final" ? version.id : undefined,
      includedInFilm: result.ok ? undefined : false,
      ...(categoryChanged
        ? {
            motionCategory: "CAMERA_MOTION",
            cameraMotionTemplate:
              ((result.final_plan?.template_id as string) ?? "micro_push_in"),
            sceneLifeEffectType: null,
          }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.shots.id, shotId));

  await logUsage(
    job.projectId,
    "render_cpu",
    result.render_seconds,
    "s",
    result.render_seconds * PRICES.cpuSecond,
    { mode: payload.mode, shotId },
  );

  // Chain the film export automatically once every included shot has a final
  // verdict (approved final version or skipped).
  if (payload.mode === "final" && job.projectId) {
    const project = (
      await db.select().from(schema.projects).where(eq(schema.projects.id, job.projectId)).limit(1)
    )[0];
    if (project?.status === "rendering") {
      const remaining = await db
        .select()
        .from(schema.shots)
        .where(
          and(
            eq(schema.shots.projectId, job.projectId),
            eq(schema.shots.includedInFilm, true),
            inArray(schema.shots.status, ["planned", "previewing", "previewed", "rendering"]),
          ),
        );
      if (remaining.length === 0) {
        try {
          await enqueueExportFinal(job.projectId);
        } catch (e) {
          await db
            .update(schema.projects)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(schema.projects.id, job.projectId));
        }
      }
    }
  }
}

type ExportResult = { probe: unknown; clip_count: number };

async function completeExport(job: typeof schema.renderJobs.$inferSelect, result: ExportResult) {
  const db = await getDb();
  const payload = job.payload as { export_id: string };
  const probe = result.probe as { format?: { duration?: string } };
  const duration = parseFloat(probe?.format?.duration ?? "0");
  await db
    .update(schema.finalExports)
    .set({ status: "done", probe: result.probe, durationSeconds: duration })
    .where(eq(schema.finalExports.id, payload.export_id));
  await db
    .update(schema.projects)
    .set({ status: "done", updatedAt: new Date() })
    .where(eq(schema.projects.id, job.projectId!));
}
