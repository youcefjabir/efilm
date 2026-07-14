"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Job = {
  id: string;
  type: string;
  status: string;
  progress: number;
  message: string | null;
  error: string | null;
  shotId: string | null;
};
type Shot = {
  id: string;
  storyboardPosition: number;
  status: string;
  includedInFilm: boolean;
  motionCategory: string;
  cameraMotionTemplate: string | null;
  sceneLifeEffectType: string | null;
};
type Project = { id: string; name: string; status: string };
type Export = { id: string; version: number; status: string };

export function RenderClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [exports, setExports] = useState<Export[]>([]);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/status`);
    if (!res.ok) return;
    const data = await res.json();
    setProject(data.project);
    setJobs(data.jobs ?? []);
    setShots((data.shots ?? []).filter((s: Shot) => s.includedInFilm));
    setExports(data.exports ?? []);
    if (data.project.status === "done") {
      router.push(`/projects/${projectId}/result`);
    }
  }, [projectId, router]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  const activeByShot = new Map(
    jobs
      .filter((j) => j.type === "render_shot" && (j.status === "running" || j.status === "queued"))
      .map((j) => [j.shotId, j]),
  );
  const exportJob = jobs.find((j) => j.type === "export_final");
  const failedJobs = jobs.filter((j) => j.status === "failed");

  const doneCount = shots.filter((s) => s.status === "rendered" || s.status === "skipped").length;

  return (
    <div className="page">
      <h1>{project?.name ?? "…"}</h1>
      <p className="muted">
        Step 3 of 4 — Rendering · {doneCount}/{shots.length} shots finished ·{" "}
        <Link href={`/projects/${projectId}/storyboard`} style={{ textDecoration: "underline" }}>
          Storyboard
        </Link>
      </p>
      <p className="faint">
        You can safely leave this page — jobs run on the worker and resume display when you
        return. Failed shots fall back automatically (reduced motion, safer template, near
        static) before being skipped.
      </p>

      <div className="panel" style={{ marginTop: 14 }}>
        <h2>Shots</h2>
        <table className="data">
          <thead>
            <tr>
              <th>#</th>
              <th>Motion</th>
              <th>Status</th>
              <th style={{ width: "40%" }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {shots.map((s) => {
              const job = activeByShot.get(s.id);
              return (
                <tr key={s.id}>
                  <td>{s.storyboardPosition + 1}</td>
                  <td className="muted">
                    {s.motionCategory === "SCENE_LIFE"
                      ? (s.sceneLifeEffectType ?? "").replaceAll("_", " ")
                      : (s.cameraMotionTemplate ?? "").replaceAll("_", " ")}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        s.status === "rendered"
                          ? "ok"
                          : s.status === "failed" || s.status === "skipped"
                            ? "err"
                            : s.status === "rendering"
                              ? "warn"
                              : ""
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {job ? (
                      <div>
                        <div className="progressbar">
                          <div style={{ width: `${Math.round(job.progress * 100)}%` }} />
                        </div>
                        <span className="faint">{job.message ?? job.status}</span>
                      </div>
                    ) : s.status === "rendered" ? (
                      <span className="ok-text">done</span>
                    ) : (
                      <span className="faint">waiting</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {exportJob && (
        <div className="panel">
          <h2>Film export</h2>
          <div className="progressbar">
            <div style={{ width: `${Math.round(exportJob.progress * 100)}%` }} />
          </div>
          <p className="faint" style={{ marginTop: 6 }}>
            {exportJob.status} {exportJob.message ? `· ${exportJob.message}` : ""}
          </p>
        </div>
      )}

      {failedJobs.length > 0 && (
        <div className="panel" style={{ borderColor: "#4d2f28" }}>
          <h2 style={{ color: "var(--err)" }}>Failed jobs</h2>
          {failedJobs.map((j) => (
            <p key={j.id} className="error-text mono" style={{ margin: "4px 0" }}>
              {j.type}: {j.error}
            </p>
          ))}
          <p className="faint">
            Fix the cause (see /system for logs) and start the render again from the
            storyboard — completed shots are reused.
          </p>
        </div>
      )}

      {exports.length > 0 && exports[0].status === "done" && (
        <Link className="btn primary" href={`/projects/${projectId}/result`}>
          View result
        </Link>
      )}
    </div>
  );
}
