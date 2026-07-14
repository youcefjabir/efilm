"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { MaskEditor } from "./mask-editor";
import { ShotEditor, type Shot } from "./shot-editor";

type Project = { id: string; name: string; status: string };

export function StoryboardClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editShot, setEditShot] = useState<Shot | null>(null);
  const [maskShot, setMaskShot] = useState<Shot | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/status`);
    if (!res.ok) return;
    const data = await res.json();
    setProject(data.project);
    setShots(data.shots ?? []);
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll while previews render.
  const anyRendering = shots.some((s) => s.status === "previewing" || s.status === "rendering");
  useEffect(() => {
    if (!anyRendering) return;
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [anyRendering, refresh]);

  async function persistOrder(next: Shot[]) {
    setShots(next);
    await fetch(`/api/projects/${projectId}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((s) => s.id) }),
    });
  }

  function moveTo(sourceId: string, targetId: string) {
    const cur = [...shots];
    const from = cur.findIndex((s) => s.id === sourceId);
    const to = cur.findIndex((s) => s.id === targetId);
    if (from < 0 || to < 0 || from === to) return;
    const [item] = cur.splice(from, 1);
    cur.splice(to, 0, item);
    persistOrder(cur);
  }

  async function toggleIncluded(shot: Shot) {
    await fetch(`/api/shots/${shot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includedInFilm: !shot.includedInFilm }),
    });
    refresh();
  }

  async function renderPreview(shot: Shot) {
    setError("");
    const res = await fetch(`/api/shots/${shot.id}/preview`, { method: "POST" });
    if (!res.ok) setError((await res.json()).error ?? "Preview failed to start");
    refresh();
  }

  async function startFinalRender() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/projects/${projectId}/render-final`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not start the final render");
      return;
    }
    router.push(`/projects/${projectId}/render`);
  }

  const included = shots.filter((s) => s.includedInFilm);
  const totalSeconds = included.reduce((acc, s) => acc + s.durationSeconds, 0);

  return (
    <div className="page">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h1>{project?.name ?? "…"}</h1>
          <p className="muted">
            Step 2 of 4 — Storyboard · {included.length} shots · ≈{Math.round(totalSeconds)}s film
            {" · "}
            <Link href={`/projects/${projectId}/analysis`} style={{ textDecoration: "underline" }}>
              Back to images
            </Link>
          </p>
        </div>
        <span style={{ flex: 1 }} />
        <button className="btn primary" onClick={startFinalRender} disabled={busy || included.length === 0}>
          {busy ? "Starting…" : "Render film"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
      <p className="faint" style={{ margin: "6px 0 16px" }}>
        Drag cards to reorder. Every shot uses exactly one source photo and one motion
        category. Preview single shots before rendering the full film.
      </p>

      <div className="grid cols-3">
        {shots.map((shot) => (
          <div
            key={shot.id}
            className={`shotcard${dragId === shot.id ? " dragging" : ""}${shot.includedInFilm ? "" : " excluded"}`}
            draggable
            onDragStart={() => setDragId(shot.id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) moveTo(dragId, shot.id);
              setDragId(null);
            }}
          >
            <div className="thumbwrap">
              <span className="num">{shot.storyboardPosition + 1}</span>
              <img
                src={`/api/storage/thumbs/${encodeURIComponent(`${projectId}/${shot.sourceAssetId}.jpg`)}`}
                alt={`Shot ${shot.storyboardPosition + 1}`}
                loading="lazy"
              />
            </div>
            <div className="body">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className={`badge ${shot.motionCategory === "SCENE_LIFE" ? "accent" : ""}`}>
                  {shot.motionCategory === "SCENE_LIFE" ? "Scene Life" : "Camera"}
                </span>
                <span className="badge">
                  {shot.motionCategory === "SCENE_LIFE"
                    ? (shot.sceneLifeEffectType ?? "").replaceAll("_", " ")
                    : (shot.cameraMotionTemplate ?? "").replaceAll("_", " ")}
                </span>
                <span className="badge">{shot.durationSeconds}s</span>
                <span
                  className={`badge ${
                    shot.status === "previewed" || shot.status === "rendered"
                      ? "ok"
                      : shot.status === "failed" || shot.status === "skipped"
                        ? "err"
                        : shot.status === "previewing" || shot.status === "rendering"
                          ? "warn"
                          : ""
                  }`}
                >
                  {shot.status}
                </span>
              </div>
              {shot.sceneType && <span className="faint">{shot.sceneType.replaceAll("_", " ")}
                {typeof shot.confidenceScore === "number" && <> · conf {Math.round(shot.confidenceScore * 100)}%</>}
              </span>}
              {shot.reason && <span className="faint" style={{ fontStyle: "italic" }}>{shot.reason}</span>}
              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                <button className="btn small" onClick={() => setEditShot(shot)}>
                  Edit
                </button>
                <button
                  className="btn small"
                  onClick={() => renderPreview(shot)}
                  disabled={shot.status === "previewing" || shot.status === "rendering"}
                >
                  {shot.status === "previewing" ? "Rendering…" : "Preview"}
                </button>
                {shot.motionCategory === "SCENE_LIFE" && (
                  <button className="btn small" onClick={() => setMaskShot(shot)}>
                    Mask
                  </button>
                )}
                <span style={{ flex: 1 }} />
                <button className="btn small" onClick={() => toggleIncluded(shot)}>
                  {shot.includedInFilm ? "Exclude" : "Include"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {shots.length === 0 && (
        <div className="panel" style={{ textAlign: "center", padding: 40 }}>
          <p className="muted">No storyboard yet. Run the analysis first.</p>
          <Link className="btn" href={`/projects/${projectId}/analysis`}>
            Go to analysis
          </Link>
        </div>
      )}

      {editShot && (
        <ShotEditor
          shot={editShot}
          onClose={() => {
            setEditShot(null);
            refresh();
          }}
        />
      )}
      {maskShot && (
        <MaskEditor
          shot={maskShot}
          onClose={() => {
            setMaskShot(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
