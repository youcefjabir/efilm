import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { getDb, schema } from "@/db/client";
import { requireOwner } from "@/lib/auth";
import { signedUrl } from "@/lib/storage";
import { ResultActions } from "./result-actions";

export const dynamic = "force-dynamic";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const email = await requireOwner();
  const db = await getDb();
  const project = (
    await db
      .select()
      .from(schema.projects)
      .where(
        and(
          eq(schema.projects.id, id),
          eq(schema.projects.ownerEmail, email),
          isNull(schema.projects.deletedAt),
        ),
      )
      .limit(1)
  )[0];
  if (!project) notFound();

  const exportsRows = await db
    .select()
    .from(schema.finalExports)
    .where(and(eq(schema.finalExports.projectId, id), eq(schema.finalExports.status, "done")))
    .orderBy(desc(schema.finalExports.version));
  const latest = exportsRows[0];

  const [cost] = await db
    .select({ c: sql<number>`coalesce(sum(${schema.usageEvents.estimatedCostUsd}), 0)` })
    .from(schema.usageEvents)
    .where(eq(schema.usageEvents.projectId, id));
  const [renderCpu] = await db
    .select({ s: sql<number>`coalesce(sum(${schema.usageEvents.quantity}), 0)` })
    .from(schema.usageEvents)
    .where(and(eq(schema.usageEvents.projectId, id), eq(schema.usageEvents.kind, "render_cpu")));

  return (
    <div className="page">
      <h1>{project.name}</h1>
      <p className="muted">
        Step 4 of 4 — Result ·{" "}
        <Link href={`/projects/${id}/storyboard`} style={{ textDecoration: "underline" }}>
          Back to storyboard
        </Link>
      </p>

      {!latest ? (
        <div className="panel" style={{ textAlign: "center", padding: 40 }}>
          <p className="muted">No finished film yet.</p>
          <Link className="btn" href={`/projects/${id}/render`}>
            Render status
          </Link>
        </div>
      ) : (
        <>
          <div className="videoframe" style={{ marginTop: 14, maxWidth: 960 }}>
            <video
              src={signedUrl("exports", latest.storageKey!)}
              controls
              playsInline
              preload="metadata"
            />
          </div>
          <p className="faint" style={{ marginTop: 8 }}>
            Version {latest.version} · {Math.round(latest.durationSeconds ?? 0)}s · 1920×1080 ·
            24 fps · H.264 · total render CPU {Math.round(renderCpu.s)}s · est. cost $
            {cost.c.toFixed(3)}
          </p>
          <ResultActions
            projectId={id}
            downloadUrl={signedUrl("exports", latest.storageKey!)}
            filename={`${project.name.replaceAll(/[^\w\-]+/g, "_")}_v${latest.version}.mp4`}
          />
          {exportsRows.length > 1 && (
            <div className="panel" style={{ marginTop: 16, maxWidth: 960 }}>
              <h3>Earlier versions</h3>
              {exportsRows.slice(1).map((e) => (
                <p key={e.id} style={{ margin: "4px 0" }}>
                  <a
                    href={signedUrl("exports", e.storageKey!)}
                    style={{ textDecoration: "underline" }}
                  >
                    Version {e.version}
                  </a>{" "}
                  <span className="faint">{Math.round(e.durationSeconds ?? 0)}s</span>
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
