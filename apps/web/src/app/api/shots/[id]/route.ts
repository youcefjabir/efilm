import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "@/db/client";
import { audit, requireOwner } from "@/lib/auth";
import templatesConfig from "@pms/config/motion-templates.json";

type Params = { params: Promise<{ id: string }> };

const TEMPLATE_IDS = Object.keys(templatesConfig.templates);
const EFFECT_TYPES = [
  "pool_water", "natural_water", "outdoor_foliage", "small_outdoor_branches",
  "high_grass", "outdoor_plants", "thin_curtain_near_open_window",
  "thin_curtain_near_open_door",
];

const patchSchema = z.object({
  motionCategory: z.enum(["CAMERA_MOTION", "SCENE_LIFE"]).optional(),
  cameraMotionTemplate: z.string().optional(),
  sceneLifeEffectType: z.string().nullable().optional(),
  durationSeconds: z.number().min(2).max(8).optional(),
  motionStrength: z.number().min(0).max(1).optional(),
  anchorMode: z.enum(["START_ANCHOR", "MIDPOINT_ANCHOR"]).optional(),
  includedInFilm: z.boolean().optional(),
});

export async function getOwnedShot(id: string) {
  const email = await requireOwner();
  const db = await getDb();
  const shot = (
    await db.select().from(schema.shots).where(eq(schema.shots.id, id)).limit(1)
  )[0];
  if (!shot) throw Object.assign(new Error("not found"), { status: 404 });
  const project = (
    await db
      .select()
      .from(schema.projects)
      .where(and(eq(schema.projects.id, shot.projectId), eq(schema.projects.ownerEmail, email)))
      .limit(1)
  )[0];
  if (!project) throw Object.assign(new Error("forbidden"), { status: 403 });
  return { shot, project, db };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { shot, db } = await getOwnedShot(id);
    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid shot update" }, { status: 400 });
    }
    const patch = parsed.data;

    // ---- hard constraint validation (blocked impossible choices) ----
    const category = patch.motionCategory ?? shot.motionCategory;
    if (category === "CAMERA_MOTION") {
      const tpl = patch.cameraMotionTemplate ?? shot.cameraMotionTemplate;
      if (!tpl || !TEMPLATE_IDS.includes(tpl)) {
        return NextResponse.json({ error: "Unknown camera motion template" }, { status: 400 });
      }
      const tplDef = (templatesConfig.templates as Record<string, { requires_verified_aerial?: boolean }>)[tpl];
      if (tplDef.requires_verified_aerial) {
        const analysis = (
          await db
            .select()
            .from(schema.assetAnalysis)
            .where(eq(schema.assetAnalysis.assetId, shot.sourceAssetId))
            .limit(1)
        )[0];
        if (!analysis?.isAerial) {
          return NextResponse.json(
            { error: "Aerial templates require a verified drone photo" },
            { status: 400 },
          );
        }
      }
    }
    if (category === "SCENE_LIFE") {
      const effect = patch.sceneLifeEffectType ?? shot.sceneLifeEffectType;
      if (!effect || !EFFECT_TYPES.includes(effect)) {
        return NextResponse.json({ error: "Unknown scene life effect" }, { status: 400 });
      }
      // Requires an eligible candidate or a manual mask.
      const eligible = await db
        .select()
        .from(schema.sceneLifeEffects)
        .where(
          and(
            eq(schema.sceneLifeEffects.assetId, shot.sourceAssetId),
            eq(schema.sceneLifeEffects.effectType, effect),
            eq(schema.sceneLifeEffects.eligible, true),
          ),
        );
      const manualMask = await db
        .select()
        .from(schema.segmentationMasks)
        .where(
          and(
            eq(schema.segmentationMasks.assetId, shot.sourceAssetId),
            eq(schema.segmentationMasks.effectType, effect),
            eq(schema.segmentationMasks.isActive, true),
          ),
        );
      if (eligible.length === 0 && manualMask.length === 0) {
        return NextResponse.json(
          {
            error:
              "Scene Life requires a verified candidate or a manually drawn mask for this effect",
          },
          { status: 400 },
        );
      }
    }

    const [updated] = await db
      .update(schema.shots)
      .set({
        motionCategory: category,
        cameraMotionTemplate:
          category === "CAMERA_MOTION"
            ? (patch.cameraMotionTemplate ?? shot.cameraMotionTemplate)
            : null,
        sceneLifeEffectType:
          category === "SCENE_LIFE"
            ? (patch.sceneLifeEffectType ?? shot.sceneLifeEffectType)
            : null,
        durationSeconds: patch.durationSeconds ?? shot.durationSeconds,
        motionStrength: patch.motionStrength ?? shot.motionStrength,
        anchorMode: patch.anchorMode ?? shot.anchorMode,
        includedInFilm: patch.includedInFilm ?? shot.includedInFilm,
        // Editing invalidates previous renders for this shot.
        status: "planned",
        selectedVersionId: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.shots.id, id))
      .returning();
    await audit("shot.update", id, patch);
    return NextResponse.json({ shot: updated });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 403;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
