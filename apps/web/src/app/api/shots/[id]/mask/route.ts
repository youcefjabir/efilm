/**
 * Mask editor backend.
 * GET  — current active mask (if any) + image URL + eligible effect types.
 * POST — save a new mask version (PNG, white = animated region).
 */
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import sharp from "sharp";

import { schema } from "@/db/client";
import { audit } from "@/lib/auth";
import { putObject, signedUrl } from "@/lib/storage";
import { getOwnedShot } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { db, shot } = await getOwnedShot(id);
    const asset = (
      await db.select().from(schema.assets).where(eq(schema.assets.id, shot.sourceAssetId)).limit(1)
    )[0];
    if (!asset) return NextResponse.json({ error: "asset missing" }, { status: 404 });

    const effect = shot.sceneLifeEffectType;
    let maskUrl: string | null = null;
    let maskVersion = 0;
    if (effect) {
      const mask = (
        await db
          .select()
          .from(schema.segmentationMasks)
          .where(
            and(
              eq(schema.segmentationMasks.assetId, asset.id),
              eq(schema.segmentationMasks.effectType, effect),
              eq(schema.segmentationMasks.isActive, true),
            ),
          )
          .orderBy(desc(schema.segmentationMasks.version))
          .limit(1)
      )[0];
      if (mask) {
        maskUrl = signedUrl("masks", mask.storageKey);
        maskVersion = mask.version;
      }
    }
    const candidates = await db
      .select()
      .from(schema.sceneLifeEffects)
      .where(eq(schema.sceneLifeEffects.assetId, asset.id));

    return NextResponse.json({
      imageUrl: signedUrl("originals", asset.storageKeyOriginal),
      width: asset.width,
      height: asset.height,
      effectType: effect,
      maskUrl,
      maskVersion,
      candidates,
    });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 403;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const { db, shot, project } = await getOwnedShot(id);
    const effect = shot.sceneLifeEffectType ?? req.nextUrl.searchParams.get("effect");
    if (!effect) {
      return NextResponse.json({ error: "Shot has no scene life effect" }, { status: 400 });
    }
    const data = Buffer.from(await req.arrayBuffer());
    if (data.length === 0 || data.length > 30 * 1024 * 1024) {
      return NextResponse.json({ error: "Invalid mask payload" }, { status: 400 });
    }
    // Validate + binarize to a clean single-channel PNG.
    let png: Buffer;
    try {
      png = await sharp(data).greyscale().threshold(128).png().toBuffer();
    } catch {
      return NextResponse.json({ error: "Mask must be a decodable image" }, { status: 400 });
    }

    const nextVersion =
      ((
        await db
          .select({ v: sql<number>`coalesce(max(${schema.segmentationMasks.version}), 0)` })
          .from(schema.segmentationMasks)
          .where(
            and(
              eq(schema.segmentationMasks.assetId, shot.sourceAssetId),
              eq(schema.segmentationMasks.effectType, effect),
            ),
          )
      )[0]?.v ?? 0) + 1;

    const key = `${project.id}/${shot.sourceAssetId}/${effect}.v${nextVersion}.png`;
    await putObject("masks", key, png);

    await db
      .update(schema.segmentationMasks)
      .set({ isActive: false })
      .where(
        and(
          eq(schema.segmentationMasks.assetId, shot.sourceAssetId),
          eq(schema.segmentationMasks.effectType, effect),
        ),
      );
    const [row] = await db
      .insert(schema.segmentationMasks)
      .values({
        assetId: shot.sourceAssetId,
        effectType: effect,
        version: nextVersion,
        source: "manual",
        storageKey: key,
        isActive: true,
      })
      .returning();
    // A new mask invalidates prior renders of this shot.
    await db
      .update(schema.shots)
      .set({ status: "planned", selectedVersionId: null, updatedAt: new Date() })
      .where(eq(schema.shots.id, id));
    await audit("mask.save", id, { effect, version: nextVersion });
    return NextResponse.json({ mask: row, maskUrl: signedUrl("masks", key) });
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 403;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
