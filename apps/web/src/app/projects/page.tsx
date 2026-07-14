import Link from "next/link";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";

import { getDb, schema } from "@/db/client";
import { requireOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  created: "New",
  uploading: "Images uploaded",
  analyzing: "Analyzing…",
  storyboard: "Storyboard ready",
  rendering: "Rendering…",
  exporting: "Exporting…",
  done: "Done",
  failed: "Failed",
};

export default async function ProjectsPage() {
  const email = await requireOwner();
  const db = await getDb();
  const projects = await db
    .select()
    .from(schema.projects)
    .where(and(eq(schema.projects.ownerEmail, email), isNull(schema.projects.deletedAt)))
    .orderBy(desc(schema.projects.createdAt));

  const enriched = await Promise.all(
    projects.map(async (p) => {
      const [assetCount] = await db
        .select({ n: sql<number>`count(*)` })
        .from(schema.assets)
        .where(eq(schema.assets.projectId, p.id));
      const [shotCount] = await db
        .select({ n: sql<number>`count(*)` })
        .from(schema.shots)
        .where(and(eq(schema.shots.projectId, p.id), eq(schema.shots.includedInFilm, true)));
      const [cost] = await db
        .select({ c: sql<number>`coalesce(sum(${schema.usageEvents.estimatedCostUsd}), 0)` })
        .from(schema.usageEvents)
        .where(eq(schema.usageEvents.projectId, p.id));
      const [renderTime] = await db
        .select({ s: sql<number>`coalesce(sum(${schema.usageEvents.quantity}), 0)` })
        .from(schema.usageEvents)
        .where(
          and(eq(schema.usageEvents.projectId, p.id), eq(schema.usageEvents.kind, "render_cpu")),
        );
      const latestExport = (
        await db
          .select()
          .from(schema.finalExports)
          .where(
            and(eq(schema.finalExports.projectId, p.id), eq(schema.finalExports.status, "done")),
          )
          .orderBy(desc(schema.finalExports.version))
          .limit(1)
      )[0];
      return { ...p, assetCount: assetCount.n, shotCount: shotCount.n, cost: cost.c, renderTime: renderTime.s, latestExport };
    }),
  );

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h1>Projects</h1>
          <p className="muted">Property films from still photographs.</p>
        </div>
        <span style={{ flex: 1 }} />
        <Link href="/projects/new" className="btn primary">
          New project
        </Link>
      </div>

      {enriched.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: 48 }}>
          <p className="muted">No projects yet.</p>
          <Link href="/projects/new" className="btn primary" style={{ marginTop: 8 }}>
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid cols-3">
          {enriched.map((p) => (
            <Link
              key={p.id}
              href={
                p.status === "done"
                  ? `/projects/${p.id}/result`
                  : p.status === "storyboard"
                    ? `/projects/${p.id}/storyboard`
                    : p.status === "rendering" || p.status === "exporting"
                      ? `/projects/${p.id}/render`
                      : `/projects/${p.id}/analysis`
              }
              className="panel"
              style={{ display: "block" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <h2 style={{ marginBottom: 2 }}>{p.name}</h2>
                <span className={`badge ${p.status === "done" ? "ok" : p.status === "failed" ? "err" : ""}`}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>
              {p.address && <p className="muted">{p.address}</p>}
              <p className="faint" style={{ marginTop: 10 }}>
                {new Date(p.createdAt).toLocaleDateString()} · {p.assetCount} images
                {p.shotCount > 0 && <> · {p.shotCount} shots</>}
                {p.latestExport?.durationSeconds ? (
                  <> · {Math.round(p.latestExport.durationSeconds)}s film</>
                ) : null}
              </p>
              <p className="faint">
                Render time {Math.round(p.renderTime)}s · est. cost ${p.cost.toFixed(3)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
