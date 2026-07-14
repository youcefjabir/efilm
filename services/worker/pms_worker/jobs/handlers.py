"""Job handlers: analyze_project, render_shot, export_final.

Inputs arrive as signed URLs; outputs are uploaded with signed PUT URLs.
The worker never talks to the database directly.
"""
from __future__ import annotations

import tempfile
import time
from pathlib import Path

import cv2
import numpy as np
import requests

from ..director.asset_analysis import analyze_asset
from ..director.semantic import apply_hard_rules, get_director
from ..director.storyboard import build_storyboard
from ..perception.masks import propose_all
from ..pipeline import render_camera_motion_shot, render_scene_life_shot
from ..render.encode import concat_with_crossfade, probe


def _download_image(url: str) -> np.ndarray:
    r = requests.get(url, timeout=120)
    r.raise_for_status()
    data = np.frombuffer(r.content, np.uint8)
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Could not decode image from {url[:80]}")
    return img


def _download_file(url: str, dest: Path) -> Path:
    with requests.get(url, timeout=300, stream=True) as r:
        r.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in r.iter_content(1 << 20):
                f.write(chunk)
    return dest


def _upload_file(put_url: str, path: Path, content_type: str) -> None:
    with open(path, "rb") as f:
        r = requests.put(put_url, data=f, headers={"Content-Type": content_type}, timeout=600)
    r.raise_for_status()


def handle_analyze_project(payload: dict, report_progress) -> dict:
    director = get_director(payload.get("director_provider"))
    assets_in = payload["assets"]
    results = []
    usage = []
    n = len(assets_in)
    for i, a in enumerate(assets_in):
        img = _download_image(a["url"])
        t0 = time.monotonic()
        analysis = analyze_asset(img, depth_provider=payload.get("depth_provider"))
        semantics = apply_hard_rules(director.classify(img, analysis), analysis)
        if "_usage" in semantics:
            usage.append({**semantics.pop("_usage"), "asset_id": a["asset_id"]})
        results.append(
            {
                "asset_id": a["asset_id"],
                "analysis": analysis,
                "semantics": semantics,
                "analysis_seconds": time.monotonic() - t0,
            }
        )
        report_progress((i + 1) / (n + 1), f"analyzed {i + 1}/{n}")

    storyboard = build_storyboard(
        results,
        length_preference=payload.get("length_preference", "auto"),
        custom_seconds=payload.get("custom_seconds"),
    )
    report_progress(1.0, "storyboard ready")
    return {"assets": results, "storyboard": storyboard, "usage": usage}


def handle_render_shot(payload: dict, report_progress) -> dict:
    img = _download_image(payload["asset_url"])
    params = payload["params"]
    mode = payload.get("mode", "preview")
    preview = mode == "preview"

    with tempfile.TemporaryDirectory() as td:
        out_path = Path(td) / f"shot.{mode}.mp4"
        report_progress(0.05, "rendering")

        if payload["motion_category"] == "SCENE_LIFE":
            if payload.get("mask_url"):
                mask_img = _download_image(payload["mask_url"])
                mask = cv2.cvtColor(mask_img, cv2.COLOR_BGR2GRAY)
                mask = (mask > 127).astype(np.uint8) * 255
            else:
                proposals = propose_all(img)
                match = [p for p in proposals if p.effect_type == params["effect_type"]]
                if not match:
                    return {
                        "ok": False,
                        "skipped": True,
                        "attempts": [{"outcome": "no_valid_mask"}],
                        "error": "No valid mask for effect",
                    }
                mask = match[0].mask
            result = render_scene_life_shot(
                img,
                mask,
                params["effect_type"],
                out_path,
                duration_seconds=float(params.get("duration_seconds", 4.0)),
                strength=float(params.get("strength", 0.5)),
                preview=preview,
            )
        else:
            result = render_camera_motion_shot(
                img,
                params["template_id"],
                out_path,
                duration_seconds=float(params.get("duration_seconds", 3.0)),
                strength=params.get("strength"),
                anchor_mode=params.get("anchor_mode"),
                risk_class=params.get("risk_class", "normal_interior"),
                depth_provider=payload.get("depth_provider"),
                preview=preview,
            )

        report_progress(0.85, "quality gate done")
        out = {
            "ok": result.ok,
            "skipped": result.skipped,
            "category": result.category,
            "attempts": result.attempts,
            "final_plan": result.final_plan,
            "quality_report": result.quality_report,
            "render_seconds": result.render_seconds,
        }
        if result.ok:
            _upload_file(payload["output_put_url"], Path(result.output_path), "video/mp4")
            if result.anchor_png_path and payload.get("anchor_put_url"):
                _upload_file(payload["anchor_put_url"], Path(result.anchor_png_path), "image/png")
        report_progress(1.0, "uploaded")
        return out


def handle_export_final(payload: dict, report_progress) -> dict:
    clips = sorted(payload["clips"], key=lambda c: c["position"])
    with tempfile.TemporaryDirectory() as td:
        paths = []
        for i, c in enumerate(clips):
            p = Path(td) / f"clip_{i:03d}.mp4"
            _download_file(c["url"], p)
            paths.append(p)
            report_progress(0.6 * (i + 1) / len(clips), f"fetched clip {i + 1}/{len(clips)}")
        out = Path(td) / "final.mp4"
        concat_with_crossfade(paths, out)
        meta = probe(out)
        report_progress(0.9, "encoded")
        _upload_file(payload["output_put_url"], out, "video/mp4")
        report_progress(1.0, "uploaded")
        return {"probe": meta, "clip_count": len(paths)}


HANDLERS = {
    "analyze_project": handle_analyze_project,
    "render_shot": handle_render_shot,
    "export_final": handle_export_final,
}
