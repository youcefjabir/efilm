"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Asset = {
  id: string;
  originalFilename: string;
  status: string;
  width: number | null;
  height: number | null;
};
type Job = {
  id: string;
  type: string;
  status: string;
  progress: number;
  message: string | null;
  error: string | null;
};
type Project = { id: string; name: string; status: string };

export function AnalysisClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [shotCount, setShotCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<{ filename: string; error: string }[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const analyzing = project?.status === "analyzing";
  const analysisJob = useRef<Job | null>(null);
  const [jobView, setJobView] = useState<Job | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/status`);
    if (!res.ok) return;
    const data = await res.json();
    setProject(data.project);
    setShotCount(data.shots?.length ?? 0);
    const aRes = await fetch(`/api/projects/${projectId}`);
    if (aRes.ok) {
      const aData = await aRes.json();
      setAssets(aData.assets ?? []);
    }
    const job = (data.jobs as Job[]).find((j) => j.type === "analyze_project");
    analysisJob.current = job ?? null;
    setJobView(job ?? null);
    if (data.project.status === "storyboard" && (data.shots?.length ?? 0) > 0) {
      router.push(`/projects/${projectId}/storyboard`);
    }
  }, [projectId, router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!analyzing) return;
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [analyzing, refresh]);

  async function readJsonSafely(res: Response) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(res.ok ? "Unexpected response from server" : `${res.status}: ${text.slice(0, 200)}`);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true);
    setError("");
    setUploadErrors([]);
    setWarnings([]);
    try {
      const fileList = Array.from(files);
      // Step 1: ask for a direct upload URL per file (tiny JSON request —
      // never touches the size limit a server function has for its body).
      const initRes = await fetch(`/api/projects/${projectId}/assets/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: fileList.map((f) => ({ filename: f.name, mimeType: f.type || "application/octet-stream" })),
        }),
      });
      const initData = await readJsonSafely(initRes);
      if (!initRes.ok) throw new Error(initData.error ?? "Could not start upload");

      // Step 2: each file's bytes go straight to storage, not through us.
      const confirmed: { filename: string; mimeType: string; key: string }[] = [];
      const uploadErrs: { filename: string; error: string }[] = [];
      await Promise.all(
        initData.files.map(async (target: { filename: string; mimeType: string; key: string; uploadUrl: string }, i: number) => {
          try {
            const putRes = await fetch(target.uploadUrl, { method: "PUT", body: fileList[i] });
            if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);
            confirmed.push({ filename: target.filename, mimeType: target.mimeType, key: target.key });
          } catch (e) {
            uploadErrs.push({ filename: target.filename, error: (e as Error).message });
          }
        }),
      );

      if (confirmed.length === 0) {
        setUploadErrors(uploadErrs);
        return;
      }

      // Step 3: tell the server to validate/normalize what actually arrived
      // (also a tiny JSON request — no image bytes in this body either).
      const confirmRes = await fetch(`/api/projects/${projectId}/assets/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: confirmed }),
      });
      const data = await readJsonSafely(confirmRes);
      if (!confirmRes.ok) throw new Error(data.error ?? "Upload failed");
      setUploadErrors([...uploadErrs, ...(data.errors ?? [])]);
      const warns = (data.uploaded ?? []).flatMap(
        (u: { filename: string; warnings: string[] }) =>
          u.warnings.map((w: string) => `${u.filename}: ${w}`),
      );
      setWarnings(warns);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function startAnalysis() {
    setError("");
    const res = await fetch(`/api/projects/${projectId}/analyze`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not start analysis");
      return;
    }
    await refresh();
  }

  async function removeAsset(assetId: string) {
    await fetch(`/api/assets/${assetId}`, { method: "DELETE" });
    await refresh();
  }

  const uploadedAssets = assets.filter((a) => a.status !== "deleted");

  return (
    <div className="page">
      <h1>{project?.name ?? "…"}</h1>
      <p className="muted">
        Step 1 of 4 — Upload &amp; analysis
        {shotCount > 0 && (
          <>
            {" · "}
            <Link href={`/projects/${projectId}/storyboard`} style={{ textDecoration: "underline" }}>
              Storyboard
            </Link>
          </>
        )}
      </p>

      {!analyzing && (
        <div
          className={`dropzone${dragActive ? " active" : ""}`}
          style={{ marginTop: 16 }}
          role="button"
          tabIndex={0}
          aria-label="Upload images"
          onClick={() => fileInput.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
          }}
        >
          {uploading ? (
            <p>Uploading…</p>
          ) : (
            <>
              <p style={{ margin: 0, fontWeight: 600, color: "var(--text)" }}>
                Drop photos here or click to choose
              </p>
              <p className="faint" style={{ margin: "6px 0 0" }}>
                JPEG, PNG or WebP · any order · duplicates handled automatically
              </p>
            </>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
        </div>
      )}

      {error && <p className="error-text" style={{ marginTop: 10 }}>{error}</p>}
      {uploadErrors.length > 0 && (
        <div className="panel" style={{ marginTop: 10, borderColor: "#4d2f28" }}>
          {uploadErrors.map((e, i) => (
            <p key={i} className="error-text" style={{ margin: "2px 0" }}>
              {e.filename}: {e.error}
            </p>
          ))}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="panel" style={{ marginTop: 10, borderColor: "#4d4227" }}>
          {warnings.map((w, i) => (
            <p key={i} style={{ margin: "2px 0", color: "var(--warn)", fontSize: "0.85rem" }}>
              {w}
            </p>
          ))}
        </div>
      )}

      {uploadedAssets.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", margin: "20px 0 10px" }}>
            <h2 style={{ margin: 0 }}>{uploadedAssets.length} images</h2>
            <span style={{ flex: 1 }} />
            {!analyzing && (
              <button
                className="btn primary"
                onClick={startAnalysis}
                disabled={uploadedAssets.filter((a) => a.status === "uploaded").length === 0 && shotCount > 0}
              >
                {shotCount > 0 ? "Re-analyze" : "Analyze images"}
              </button>
            )}
          </div>

          {analyzing && (
            <div className="panel" style={{ marginBottom: 14 }}>
              <p style={{ margin: "0 0 8px" }}>
                Analyzing… <span className="muted">{jobView?.message ?? ""}</span>
              </p>
              <div className="progressbar" aria-label="Analysis progress">
                <div style={{ width: `${Math.round((jobView?.progress ?? 0) * 100)}%` }} />
              </div>
              <p className="faint" style={{ marginTop: 8 }}>
                Depth, lines, duplicates and scene classification run per image. You can leave
                this page; the job continues on the render worker.
              </p>
            </div>
          )}

          <div className="grid cols-4">
            {uploadedAssets.map((a) => (
              <div key={a.id} className="shotcard">
                <div className="thumbwrap">
                  {/* Owner session grants image access without a signed URL */}
                  <img src={`/api/storage/thumbs/${encodeURIComponent(`${projectId}/${a.id}.jpg`)}`} alt={a.originalFilename} loading="lazy" />
                </div>
                <div className="body">
                  <span className="faint" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.originalFilename}
                  </span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span className={`badge ${a.status === "analyzed" ? "ok" : a.status === "rejected" ? "warn" : ""}`}>
                      {a.status}
                    </span>
                    <span className="faint">{a.width}×{a.height}</span>
                    <span style={{ flex: 1 }} />
                    {!analyzing && (
                      <button
                        className="btn small danger"
                        onClick={() => removeAsset(a.id)}
                        aria-label={`Remove ${a.originalFilename}`}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
