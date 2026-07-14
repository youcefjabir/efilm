"use client";

/**
 * Simple, precise mask editor for Scene Life shots.
 * Paint (white) / erase over a zoomable image; saves versioned PNG masks.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import type { Shot } from "./shot-editor";

type MaskInfo = {
  imageUrl: string;
  width: number;
  height: number;
  effectType: string | null;
  maskUrl: string | null;
  maskVersion: number;
};

export function MaskEditor({ shot, onClose }: { shot: Shot; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [info, setInfo] = useState<MaskInfo | null>(null);
  const [mode, setMode] = useState<"paint" | "erase">("paint");
  const [brush, setBrush] = useState(40);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const painting = useRef(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    fetch(`/api/shots/${shot.id}/mask`)
      .then((r) => r.json())
      .then(async (d: MaskInfo & { error?: string }) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setInfo(d);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = d.imageUrl;
        await img.decode();
        imgRef.current = img;

        const mc = document.createElement("canvas");
        mc.width = img.naturalWidth;
        mc.height = img.naturalHeight;
        const mctx = mc.getContext("2d")!;
        if (d.maskUrl) {
          const m = new Image();
          m.crossOrigin = "anonymous";
          m.src = d.maskUrl;
          await m.decode();
          mctx.drawImage(m, 0, 0, mc.width, mc.height);
        }
        maskCanvasRef.current = mc;
        draw();
      })
      .catch(() => setError("Could not load the mask editor"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shot.id]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !img || !maskCanvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    const scale = canvas.width / img.naturalWidth;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = 0.45;
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.restore();
  }, [pan, zoom]);

  useEffect(() => {
    draw();
  }, [draw]);

  function canvasToImage(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const img = imgRef.current!;
    const rect = canvas.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const cy = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const scale = (canvas.width / img.naturalWidth) * zoom;
    return { x: (cx - pan.x) / scale, y: (cy - pan.y) / scale };
  }

  function paintAt(e: React.PointerEvent<HTMLCanvasElement>) {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const { x, y } = canvasToImage(e);
    const ctx = maskCanvas.getContext("2d")!;
    ctx.globalCompositeOperation = mode === "paint" ? "source-over" : "destination-out";
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, brush / zoom, 0, Math.PI * 2);
    ctx.fill();
    setDirty(true);
    draw();
  }

  async function save() {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    setBusy(true);
    setError("");
    // Flatten to black background + white mask.
    const out = document.createElement("canvas");
    out.width = maskCanvas.width;
    out.height = maskCanvas.height;
    const octx = out.getContext("2d")!;
    octx.fillStyle = "#000";
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(maskCanvas, 0, 0);
    const blob = await new Promise<Blob>((resolve) =>
      out.toBlob((b) => resolve(b!), "image/png"),
    );
    const res = await fetch(`/api/shots/${shot.id}/mask`, { method: "POST", body: blob });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save the mask");
      return;
    }
    setDirty(false);
    onClose();
  }

  async function resetToProposal() {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    setDirty(true);
    draw();
  }

  return (
    <dialog ref={dialogRef} onClose={onClose} aria-label="Mask editor" style={{ width: "min(1100px, 94vw)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>
          Mask — {(info?.effectType ?? "").replaceAll("_", " ")}
        </h2>
        <span style={{ flex: 1 }} />
        <button className={`btn small${mode === "paint" ? " primary" : ""}`} onClick={() => setMode("paint")}>
          Paint
        </button>
        <button className={`btn small${mode === "erase" ? " primary" : ""}`} onClick={() => setMode("erase")}>
          Erase
        </button>
        <label className="faint">
          Brush {brush}px{" "}
          <input
            type="range"
            min={8}
            max={160}
            value={brush}
            onChange={(e) => setBrush(Number(e.target.value))}
            style={{ verticalAlign: "middle", width: 100 }}
          />
        </label>
        <label className="faint">
          Zoom {zoom.toFixed(1)}×{" "}
          <input
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ verticalAlign: "middle", width: 100 }}
          />
        </label>
        <button className="btn small" onClick={resetToProposal}>
          Clear mask
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{ width: "100%", borderRadius: 6, background: "#000", cursor: "crosshair", touchAction: "none" }}
        onPointerDown={(e) => {
          painting.current = true;
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          paintAt(e);
        }}
        onPointerMove={(e) => painting.current && paintAt(e)}
        onPointerUp={() => (painting.current = false)}
      />

      <p className="faint" style={{ margin: "8px 0" }}>
        White = animated region. Everything outside the mask stays pixel-locked. The
        renderer feathers inward, so paint slightly generous but never across pool edges,
        trunks or window frames.
      </p>
      {error && <p className="error-text">{error}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn primary" onClick={save} disabled={busy || !dirty}>
          {busy ? "Saving…" : "Save mask version"}
        </button>
        <button className="btn" onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  );
}
