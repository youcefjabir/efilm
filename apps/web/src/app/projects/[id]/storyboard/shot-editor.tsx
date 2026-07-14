"use client";

import { useEffect, useRef, useState } from "react";

import templatesConfig from "@pms/config/motion-templates.json";

export type Shot = {
  id: string;
  projectId: string;
  sourceAssetId: string;
  storyboardPosition: number;
  sceneType: string | null;
  motionCategory: "CAMERA_MOTION" | "SCENE_LIFE";
  cameraMotionTemplate: string | null;
  sceneLifeEffectType: string | null;
  anchorMode: "START_ANCHOR" | "MIDPOINT_ANCHOR";
  durationSeconds: number;
  motionStrength: number;
  riskClass: string;
  confidenceScore: number | null;
  includedInFilm: boolean;
  status: string;
  reason: string | null;
};

type Version = {
  id: string;
  mode: string;
  status: string;
  gatePassed: boolean | null;
  renderSeconds: number | null;
  videoUrl: string | null;
  qualityReport: { pass: boolean; checks: Record<string, { pass: boolean; value: number }> } | null;
  isSelected: boolean;
  createdAt: string;
};

const TEMPLATE_IDS = Object.keys(templatesConfig.templates);
const EFFECTS = [
  "pool_water",
  "natural_water",
  "outdoor_foliage",
  "small_outdoor_branches",
  "high_grass",
  "outdoor_plants",
  "thin_curtain_near_open_window",
  "thin_curtain_near_open_door",
];

export function ShotEditor({ shot, onClose }: { shot: Shot; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [category, setCategory] = useState(shot.motionCategory);
  const [template, setTemplate] = useState(shot.cameraMotionTemplate ?? "gentle_push_in");
  const [effect, setEffect] = useState(shot.sceneLifeEffectType ?? "pool_water");
  const [duration, setDuration] = useState(shot.durationSeconds);
  const [strength, setStrength] = useState(shot.motionStrength);
  const [anchor, setAnchor] = useState(shot.anchorMode);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    fetch(`/api/shots/${shot.id}/versions`)
      .then((r) => r.json())
      .then((d) => setVersions(d.versions ?? []))
      .catch(() => {});
  }, [shot.id]);

  async function save() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/shots/${shot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        motionCategory: category,
        cameraMotionTemplate: category === "CAMERA_MOTION" ? template : undefined,
        sceneLifeEffectType: category === "SCENE_LIFE" ? effect : undefined,
        durationSeconds: duration,
        motionStrength: strength,
        anchorMode: anchor,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save");
      return;
    }
    onClose();
  }

  async function selectVersion(versionId: string) {
    const res = await fetch(`/api/shots/${shot.id}/select-version`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    });
    if (res.ok) {
      const d = await fetch(`/api/shots/${shot.id}/versions`).then((r) => r.json());
      setVersions(d.versions ?? []);
    }
  }

  const anchorModes =
    (templatesConfig.templates as Record<string, { anchor_modes: string[] }>)[template]
      ?.anchor_modes ?? ["START_ANCHOR"];

  return (
    <dialog ref={dialogRef} onClose={onClose} aria-label="Edit shot">
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px", minWidth: 280 }}>
          <h2>Shot {shot.storyboardPosition + 1}</h2>
          <label className="field">
            <span className="lbl">Motion category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Shot["motionCategory"])}
            >
              <option value="CAMERA_MOTION">Camera Motion (camera moves, scene locked)</option>
              <option value="SCENE_LIFE">Scene Life (camera locked, one element moves)</option>
            </select>
          </label>

          {category === "CAMERA_MOTION" ? (
            <>
              <label className="field">
                <span className="lbl">Camera template</span>
                <select value={template} onChange={(e) => setTemplate(e.target.value)}>
                  {TEMPLATE_IDS.map((t) => (
                    <option key={t} value={t}>
                      {t.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="lbl">Anchor mode</span>
                <select
                  value={anchor}
                  onChange={(e) => setAnchor(e.target.value as Shot["anchorMode"])}
                >
                  {anchorModes.map((m) => (
                    <option key={m} value={m}>
                      {m === "START_ANCHOR" ? "Start (photo is first frame)" : "Midpoint (photo at center)"}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <label className="field">
              <span className="lbl">Scene Life effect</span>
              <select value={effect} onChange={(e) => setEffect(e.target.value)}>
                {EFFECTS.map((t) => (
                  <option key={t} value={t}>
                    {t.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="field">
            <span className="lbl">Duration: {duration.toFixed(1)}s</span>
            <input
              type="range"
              min={2}
              max={8}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span className="lbl">Strength: {Math.round(strength * 100)}% (clamped by the safety budget)</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
            />
          </label>

          {error && <p className="error-text">{error}</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button className="btn primary" onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
          <p className="faint" style={{ marginTop: 10 }}>
            Saving resets renders for this shot. Risk class: {shot.riskClass}.
          </p>
        </div>

        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <h3>Versions</h3>
          {versions.length === 0 && <p className="faint">No rendered versions yet.</p>}
          {versions.map((v) => (
            <div key={v.id} className="panel" style={{ padding: 10, marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                <span className="badge">{v.mode}</span>
                <span className={`badge ${v.gatePassed ? "ok" : "err"}`}>
                  {v.gatePassed ? "gate passed" : v.status}
                </span>
                {v.renderSeconds != null && <span className="faint">{v.renderSeconds.toFixed(0)}s render</span>}
                <span style={{ flex: 1 }} />
                {v.isSelected ? (
                  <span className="badge accent">selected</span>
                ) : (
                  v.gatePassed && (
                    <button className="btn small" onClick={() => selectVersion(v.id)}>
                      Use this
                    </button>
                  )
                )}
              </div>
              {v.videoUrl && (
                <div className="videoframe">
                  <video src={v.videoUrl} controls loop muted playsInline preload="metadata" />
                </div>
              )}
              {v.qualityReport && (
                <details style={{ marginTop: 6 }}>
                  <summary className="faint" style={{ cursor: "pointer" }}>
                    Quality checks
                  </summary>
                  <table className="data">
                    <tbody>
                      {Object.entries(v.qualityReport.checks).map(([k, c]) => (
                        <tr key={k}>
                          <td>{k}</td>
                          <td className="mono">{typeof c.value === "number" ? c.value.toFixed(4) : String(c.value)}</td>
                          <td>
                            <span className={`badge ${c.pass ? "ok" : "err"}`}>
                              {c.pass ? "pass" : "fail"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    </dialog>
  );
}
