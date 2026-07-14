"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResultActions({
  projectId,
  downloadUrl,
  filename,
}: {
  projectId: string;
  downloadUrl: string;
  filename: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function newVersion() {
    setBusy("version");
    setError("");
    // Re-render everything with current storyboard settings.
    const res = await fetch(`/api/projects/${projectId}/render-final`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not start render");
      setBusy(null);
      return;
    }
    router.push(`/projects/${projectId}/render`);
  }

  async function duplicate() {
    setBusy("dup");
    setError("");
    const res = await fetch(`/api/projects/${projectId}/duplicate`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not duplicate");
      setBusy(null);
      return;
    }
    router.push(`/projects/${data.project.id}/analysis`);
  }

  async function deleteProject() {
    if (!confirm("Delete this project including all images and rendered files?")) return;
    setBusy("del");
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (res.ok) router.push("/projects");
    else {
      setError("Could not delete the project");
      setBusy(null);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
      <a className="btn primary" href={downloadUrl} download={filename}>
        Download MP4
      </a>
      <button className="btn" onClick={newVersion} disabled={busy !== null}>
        {busy === "version" ? "Starting…" : "Render new version"}
      </button>
      <button className="btn" onClick={duplicate} disabled={busy !== null}>
        {busy === "dup" ? "Duplicating…" : "Duplicate project"}
      </button>
      <span style={{ flex: 1 }} />
      <button className="btn danger" onClick={deleteProject} disabled={busy !== null}>
        {busy === "del" ? "Deleting…" : "Delete project"}
      </button>
      {error && <p className="error-text" style={{ width: "100%" }}>{error}</p>}
    </div>
  );
}
