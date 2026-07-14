/**
 * Database client: embedded PGlite (zero-setup local mode) or any Postgres /
 * Supabase via DATABASE_URL. One schema, one migration set for both.
 */
import fs from "node:fs";
import path from "node:path";

import { env } from "@/lib/env";
import * as schema from "./schema";

export type Db = ReturnType<typeof buildPglite> extends Promise<infer T> ? T : never;

function findMigrationsDir(): string {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, "packages", "database", "migrations");
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  throw new Error("Could not locate packages/database/migrations");
}

async function buildPglite() {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");

  fs.mkdirSync(env.dataDir, { recursive: true });
  const pg = new PGlite(path.join(env.dataDir, "pglite"));
  const db = drizzle(pg, { schema });
  await migrate(db, { migrationsFolder: findMigrationsDir() });
  return db;
}

async function buildPostgres() {
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  const db = drizzle(env.databaseUrl, { schema });
  await migrate(db, { migrationsFolder: findMigrationsDir() });
  return db as unknown as Awaited<ReturnType<typeof buildPglite>>;
}

const globalForDb = globalThis as unknown as { __pmsDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  if (!globalForDb.__pmsDb) {
    globalForDb.__pmsDb =
      env.databaseProvider === "postgres" && env.databaseUrl
        ? (buildPostgres() as Promise<Db>)
        : buildPglite();
  }
  return globalForDb.__pmsDb;
}

export { schema };
