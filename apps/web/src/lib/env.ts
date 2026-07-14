/** Central server-side configuration. Secrets never reach the client. */
import path from "node:path";

function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function bool(name: string, fallback: boolean): boolean {
  const v = process.env[name];
  if (v === undefined) return fallback;
  return v === "true" || v === "1";
}

export const env = {
  appName: process.env.APP_NAME ?? "Property Motion Studio",

  ownerOnlyMode: bool("OWNER_ONLY_MODE", true),
  publicSignupEnabled: bool("PUBLIC_SIGNUP_ENABLED", false),
  billingEnabled: bool("BILLING_ENABLED", false),
  ownerEmail: (process.env.OWNER_EMAIL ?? "youcefjabir8@live.se").toLowerCase(),

  hybridMotionEnabled: bool("HYBRID_MOTION_ENABLED", false),
  generativeLifePatchEnabled: bool("GENERATIVE_LIFE_PATCH_ENABLED", false),
  fireEffectEnabled: bool("FIRE_EFFECT_ENABLED", false),
  cloudEffectEnabled: bool("CLOUD_EFFECT_ENABLED", false),

  authProvider: process.env.AUTH_PROVIDER ?? "local",
  databaseProvider: process.env.DATABASE_PROVIDER ?? "pglite",
  storageProvider: process.env.STORAGE_PROVIDER ?? "local",
  directorProvider: process.env.DIRECTOR_PROVIDER ?? "deterministic",
  depthProvider: process.env.DEPTH_PROVIDER ?? "auto",

  get authSecret() {
    return req("AUTH_SECRET");
  },
  get workerSharedSecret() {
    return req("WORKER_SHARED_SECRET");
  },
  get storageSigningSecret() {
    return req("STORAGE_SIGNING_SECRET");
  },

  dataDir: path.resolve(process.env.DATA_DIR ?? "./var/data"),
  storageDir: path.resolve(process.env.STORAGE_DIR ?? "./var/storage"),

  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  geminiApiKey: process.env.GEMINI_API_KEY ?? "",

  sessionMaxAgeSeconds: 60 * 60 * 24 * 7,
  magicLinkTtlSeconds: 15 * 60,
};

export function isOwner(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === env.ownerEmail;
}
