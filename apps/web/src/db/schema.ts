/**
 * Database schema (Drizzle, Postgres dialect).
 * Runs identically on embedded PGlite (local mode) and Supabase Postgres.
 * Critical status fields are real columns; structured detail lives in JSONB.
 */
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const profiles = pgTable("profiles", {
  id: id(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  isOwner: boolean("is_owner").default(false).notNull(),
  createdAt: createdAt(),
});

export const authTokens = pgTable("auth_tokens", {
  id: id(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const projects = pgTable("projects", {
  id: id(),
  ownerEmail: text("owner_email").notNull(),
  name: text("name").notNull(),
  address: text("address"),
  propertyType: text("property_type").default("auto").notNull(),
  lengthPreference: text("length_preference").default("auto").notNull(), // auto|short|normal|long|custom
  customLengthSeconds: doublePrecision("custom_length_seconds"),
  status: text("status").default("created").notNull(), // created|uploading|analyzing|storyboard|rendering|exporting|done|failed
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const assets = pgTable("assets", {
  id: id(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  originalFilename: text("original_filename").notNull(),
  contentHash: text("content_hash").notNull(),
  mimeType: text("mime_type").notNull(),
  width: integer("width"),
  height: integer("height"),
  fileSizeBytes: integer("file_size_bytes"),
  storageKeyOriginal: text("storage_key_original").notNull(),
  storageKeyProxy: text("storage_key_proxy"),
  storageKeyThumb: text("storage_key_thumb"),
  status: text("status").default("uploaded").notNull(), // uploaded|analyzing|analyzed|rejected|deleted
  createdAt: createdAt(),
});

export const assetAnalysis = pgTable("asset_analysis", {
  id: id(),
  assetId: uuid("asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  contentHash: text("content_hash").notNull(),
  analysis: jsonb("analysis").notNull(), // deterministic analysis record
  semantics: jsonb("semantics").notNull(), // director semantics record
  qualityScore: doublePrecision("quality_score"),
  riskScore: doublePrecision("risk_score"),
  sceneType: text("scene_type"),
  isAerial: boolean("is_aerial").default(false).notNull(),
  provider: text("provider"),
  createdAt: createdAt(),
});

export const assetEmbeddings = pgTable("asset_embeddings", {
  id: id(),
  assetId: uuid("asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  contentHash: text("content_hash").notNull(),
  phash: text("phash").notNull(),
  embedding: jsonb("embedding"), // reserved for a future local embedding model
  createdAt: createdAt(),
});

export const depthMaps = pgTable("depth_maps", {
  id: id(),
  assetId: uuid("asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  contentHash: text("content_hash").notNull(),
  provider: text("provider").notNull(),
  confidence: doublePrecision("confidence"),
  storageKey: text("storage_key"),
  meta: jsonb("meta"),
  createdAt: createdAt(),
});

export const segmentationMasks = pgTable("segmentation_masks", {
  id: id(),
  assetId: uuid("asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  effectType: text("effect_type").notNull(),
  version: integer("version").default(1).notNull(),
  source: text("source").notNull(), // proposal|manual
  confidence: doublePrecision("confidence"),
  storageKey: text("storage_key").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: createdAt(),
});

export const sceneLifeEffects = pgTable("scene_life_effects", {
  id: id(),
  assetId: uuid("asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  effectType: text("effect_type").notNull(),
  confidence: doublePrecision("confidence"),
  eligible: boolean("eligible").default(false).notNull(),
  reason: text("reason"),
  createdAt: createdAt(),
});

export const storyboards = pgTable("storyboards", {
  id: id(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  activeVersion: integer("active_version").default(1).notNull(),
  estimatedDurationSeconds: doublePrecision("estimated_duration_seconds"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const storyboardVersions = pgTable("storyboard_versions", {
  id: id(),
  storyboardId: uuid("storyboard_id").notNull().references(() => storyboards.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  proposal: jsonb("proposal").notNull(), // full proposal incl. rejected list
  createdBy: text("created_by").notNull(), // ai_director|owner
  createdAt: createdAt(),
});

export const shots = pgTable("shots", {
  id: id(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sourceAssetId: uuid("source_asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  storyboardPosition: integer("storyboard_position").notNull(),
  sceneType: text("scene_type"),
  motionCategory: text("motion_category").notNull(), // CAMERA_MOTION | SCENE_LIFE
  cameraMotionTemplate: text("camera_motion_template"),
  sceneLifeEffectType: text("scene_life_effect_type"),
  anchorMode: text("anchor_mode").default("START_ANCHOR"),
  durationSeconds: doublePrecision("duration_seconds").notNull(),
  motionStrength: doublePrecision("motion_strength").notNull(),
  riskClass: text("risk_class").default("normal_interior").notNull(),
  riskScore: doublePrecision("risk_score"),
  confidenceScore: doublePrecision("confidence_score"),
  includedInFilm: boolean("included_in_film").default(true).notNull(),
  status: text("status").default("planned").notNull(), // planned|previewing|previewed|rendering|rendered|approved|failed|skipped
  selectedVersionId: uuid("selected_version_id"),
  reason: text("reason"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const shotVersions = pgTable("shot_versions", {
  id: id(),
  shotId: uuid("shot_id").notNull().references(() => shots.id, { onDelete: "cascade" }),
  mode: text("mode").notNull(), // preview|final
  params: jsonb("params").notNull(), // full motion plan / effect params as rendered
  storageKey: text("storage_key"),
  anchorStorageKey: text("anchor_storage_key"),
  status: text("status").default("pending").notNull(), // pending|rendering|passed|failed|skipped
  gatePassed: boolean("gate_passed"),
  renderSeconds: doublePrecision("render_seconds"),
  createdAt: createdAt(),
});

export const motionPlans = pgTable("motion_plans", {
  id: id(),
  shotVersionId: uuid("shot_version_id").notNull().references(() => shotVersions.id, { onDelete: "cascade" }),
  plan: jsonb("plan").notNull(),
  createdAt: createdAt(),
});

export const renderAttempts = pgTable("render_attempts", {
  id: id(),
  shotVersionId: uuid("shot_version_id").notNull().references(() => shotVersions.id, { onDelete: "cascade" }),
  attemptIndex: integer("attempt_index").notNull(),
  parameters: jsonb("parameters").notNull(),
  outcome: text("outcome").notNull(),
  createdAt: createdAt(),
});

export const qualityReports = pgTable("quality_reports", {
  id: id(),
  shotVersionId: uuid("shot_version_id").notNull().references(() => shotVersions.id, { onDelete: "cascade" }),
  passed: boolean("passed").notNull(),
  report: jsonb("report").notNull(),
  createdAt: createdAt(),
});

export const shotOutputs = pgTable("shot_outputs", {
  id: id(),
  shotVersionId: uuid("shot_version_id").notNull().references(() => shotVersions.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(), // preview_mp4|final_mp4|anchor_png
  storageKey: text("storage_key").notNull(),
  createdAt: createdAt(),
});

export const renderJobs = pgTable("render_jobs", {
  id: id(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  shotId: uuid("shot_id"),
  type: text("type").notNull(), // analyze_project|render_shot|export_final
  status: text("status").default("queued").notNull(), // queued|running|completed|failed|cancelled
  payload: jsonb("payload").notNull(),
  result: jsonb("result"),
  progress: doublePrecision("progress").default(0).notNull(),
  message: text("message"),
  error: text("error"),
  attempts: integer("attempts").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(2).notNull(),
  idempotencyKey: text("idempotency_key"),
  claimedBy: text("claimed_by"),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  timeoutAt: timestamp("timeout_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const finalExports = pgTable("final_exports", {
  id: id(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  version: integer("version").default(1).notNull(),
  storageKey: text("storage_key"),
  durationSeconds: doublePrecision("duration_seconds"),
  width: integer("width").default(1920),
  height: integer("height").default(1080),
  fps: integer("fps").default(24),
  status: text("status").default("pending").notNull(), // pending|rendering|done|failed
  probe: jsonb("probe"),
  createdAt: createdAt(),
});

export const usageEvents = pgTable("usage_events", {
  id: id(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  kind: text("kind").notNull(), // gemini_call|analysis_cpu|render_cpu|encode|storage|egress
  quantity: doublePrecision("quantity").notNull(), // seconds, tokens, bytes...
  unit: text("unit").notNull(),
  estimatedCostUsd: doublePrecision("estimated_cost_usd").default(0).notNull(),
  meta: jsonb("meta"),
  createdAt: createdAt(),
});

export const auditEvents = pgTable("audit_events", {
  id: id(),
  actorEmail: text("actor_email"),
  action: text("action").notNull(),
  subject: text("subject"),
  meta: jsonb("meta"),
  createdAt: createdAt(),
});
