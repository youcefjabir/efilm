"""Shot pipeline: render -> quality gate -> automatic fallback chain -> encode.

Fallback order (non-negotiable rules §3 / §19):
  Camera Motion: planned -> half strength -> safer template ->
                 stabilized_near_static -> skip.
  Scene Life:    planned -> half strength -> shrink mask ->
                 reclassify as safe camera motion -> skip.
Every attempt is recorded with full parameters for the render_attempts table.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np

from .config import quality_gates
from .depth import get_depth_provider
from .motion.templates import build_motion_plan, get_template
from .perception.occlusion import occlusion_risks
from .quality.gates import CameraMotionGate, SceneLifeGate
from .render.camera_motion import CameraMotionRenderer
from .render.encode import FrameEncoder, probe
from .render.scene_life import SceneLifeRenderer


@dataclass
class ShotResult:
    ok: bool
    category: str
    output_path: str | None
    attempts: list = field(default_factory=list)
    final_plan: dict | None = None
    quality_report: dict | None = None
    skipped: bool = False
    render_seconds: float = 0.0
    anchor_png_path: str | None = None


def _gate_sample_positions(n_frames: int, anchor_index: int) -> list[int]:
    idx = sorted(set(list(range(0, n_frames, 4)) + [anchor_index, n_frames - 1]))
    return idx


def render_camera_motion_shot(
    image_bgr: np.ndarray,
    template_id: str,
    out_path: str | Path,
    *,
    duration_seconds: float | None = None,
    strength: float | None = None,
    anchor_mode: str | None = None,
    risk_class: str = "normal_interior",
    depth_provider: str | None = None,
    inverse_depth: np.ndarray | None = None,
    depth_confidence: float | None = None,
    preview: bool = False,
    out_w: int = 1920,
    out_h: int = 1080,
    save_anchor_png: bool = True,
) -> ShotResult:
    t_start = time.monotonic()
    result = ShotResult(ok=False, category="CAMERA_MOTION", output_path=None)

    if inverse_depth is None:
        provider = get_depth_provider(depth_provider)
        depth_res = provider.estimate(image_bgr)
        inverse_depth = depth_res.edge_aware_smoothed(image_bgr)
        depth_confidence = depth_res.confidence
    depth_confidence = 0.5 if depth_confidence is None else depth_confidence

    occ = occlusion_risks(inverse_depth)

    if preview:
        out_w, out_h = 960, 540

    attempt_specs = [
        {"template_id": template_id, "strength": strength, "note": "planned"},
        {
            "template_id": template_id,
            "strength": (strength if strength is not None else get_template(template_id).get("default_strength", 0.6)) * 0.5,
            "note": "half_strength",
        },
        {
            "template_id": get_template(template_id).get("fallback_template") or "stabilized_near_static",
            "strength": None,
            "note": "safer_template",
        },
        {"template_id": "stabilized_near_static", "strength": None, "note": "near_static"},
    ]
    max_attempts = quality_gates()["retry_policy"]["max_render_attempts"]

    for spec in attempt_specs[:max_attempts]:
        plan = build_motion_plan(
            spec["template_id"],
            duration_seconds=duration_seconds,
            strength=spec["strength"],
            anchor_mode=anchor_mode,
            risk_class=risk_class,
            depth_confidence=depth_confidence,
            occlusion_limits=occ["limits"],
        )
        renderer = CameraMotionRenderer(
            image_bgr, inverse_depth, plan, out_w=out_w, out_h=out_h,
            motion_blur_samples=2 if preview else 3,
        )
        bounds = renderer.source_bounds_check()
        attempt_record = {
            "spec": spec,
            "plan": plan.to_dict(),
            "bounds": bounds,
            "occlusion": {k: v for k, v in occ.items() if k != "limits"},
        }
        if not bounds["ok"]:
            attempt_record["outcome"] = "rejected_bounds"
            result.attempts.append(attempt_record)
            continue

        stretch = renderer.warp_stretch_stats()
        gate = CameraMotionGate(plan.to_dict())
        sample_at = set(_gate_sample_positions(renderer.num_frames, renderer.path.anchor_frame_index))

        encoder = FrameEncoder(out_path, out_w, out_h, fps=plan.fps, preview=preview)
        sampled_frames, sampled_idx = [], []
        try:
            for i, frame in enumerate(renderer.frames()):
                encoder.write(frame)
                if i in sample_at:
                    sampled_frames.append(frame)
                    sampled_idx.append(i)
            encoder.close()
        except Exception as e:  # encoding failure is an attempt failure
            attempt_record["outcome"] = f"encode_error: {e}"
            result.attempts.append(attempt_record)
            continue

        report = gate.evaluate(
            sampled_frames,
            sampled_idx,
            renderer.anchor_reference(),
            renderer.path.anchor_frame_index,
            stretch_stats=stretch,
        )
        attempt_record["quality"] = report
        attempt_record["outcome"] = "pass" if report["pass"] else "gate_failed"
        result.attempts.append(attempt_record)

        if report["pass"]:
            meta = probe(out_path)
            attempt_record["probe"] = meta
            result.ok = True
            result.output_path = str(out_path)
            result.final_plan = plan.to_dict()
            result.quality_report = report
            if save_anchor_png and not preview:
                anchor_png = str(Path(out_path).with_suffix(".anchor.png"))
                cv2.imwrite(anchor_png, renderer.anchor_reference())
                result.anchor_png_path = anchor_png
            break

    if not result.ok:
        result.skipped = True
    result.render_seconds = time.monotonic() - t_start
    return result


def render_scene_life_shot(
    image_bgr: np.ndarray,
    mask: np.ndarray,
    effect_type: str,
    out_path: str | Path,
    *,
    duration_seconds: float = 4.0,
    strength: float = 0.5,
    preview: bool = False,
    out_w: int = 1920,
    out_h: int = 1080,
    camera_motion_fallback_template: str = "micro_push_in",
) -> ShotResult:
    t_start = time.monotonic()
    result = ShotResult(ok=False, category="SCENE_LIFE", output_path=None)

    if preview:
        out_w, out_h = 960, 540

    def shrink(m: np.ndarray) -> np.ndarray:
        k = max(9, int(min(m.shape[:2]) * 0.02) | 1)
        return cv2.erode(m, np.ones((k, k), np.uint8))

    attempt_specs = [
        {"strength": strength, "mask": mask, "note": "planned"},
        {"strength": strength * 0.5, "mask": mask, "note": "half_strength"},
        {"strength": strength * 0.5, "mask": shrink(mask), "note": "shrunk_mask"},
    ]
    fps = 24

    for spec in attempt_specs:
        if (spec["mask"] > 0).mean() < 0.005:
            result.attempts.append({"spec": {"note": spec["note"]}, "outcome": "mask_too_small"})
            continue
        renderer = SceneLifeRenderer(
            image_bgr,
            spec["mask"],
            effect_type,
            duration_seconds=duration_seconds,
            fps=fps,
            strength=spec["strength"],
            out_w=out_w,
            out_h=out_h,
        )
        gate = SceneLifeGate()
        sample_at = set(range(0, renderer.num_frames, 4)) | {renderer.num_frames - 1}

        encoder = FrameEncoder(out_path, out_w, out_h, fps=fps, preview=preview)
        sampled_frames, sampled_idx = [], []
        attempt_record = {
            "spec": {"note": spec["note"], "strength": spec["strength"], "effect": effect_type},
        }
        try:
            for i, frame in enumerate(renderer.frames()):
                encoder.write(frame)
                if i in sample_at:
                    sampled_frames.append(frame)
                    sampled_idx.append(i)
            encoder.close()
        except Exception as e:
            attempt_record["outcome"] = f"encode_error: {e}"
            result.attempts.append(attempt_record)
            continue

        report = gate.evaluate(
            sampled_frames, sampled_idx, renderer.base, renderer.mask, fps=fps
        )
        attempt_record["quality"] = report
        attempt_record["outcome"] = "pass" if report["pass"] else "gate_failed"
        result.attempts.append(attempt_record)

        if report["pass"]:
            meta = probe(out_path)
            attempt_record["probe"] = meta
            result.ok = True
            result.output_path = str(out_path)
            result.final_plan = {
                "effect_type": effect_type,
                "strength": spec["strength"],
                "duration_seconds": duration_seconds,
                "note": spec["note"],
            }
            result.quality_report = report
            break

    if not result.ok:
        # Reclassify to a safe camera-motion shot (fallback step 4).
        cm = render_camera_motion_shot(
            image_bgr,
            camera_motion_fallback_template,
            out_path,
            duration_seconds=duration_seconds,
            risk_class="normal_interior",
            preview=preview,
            out_w=out_w if not preview else 1920,
            out_h=out_h if not preview else 1080,
        )
        cm.attempts = result.attempts + cm.attempts
        cm.render_seconds += time.monotonic() - t_start
        return cm

    result.render_seconds = time.monotonic() - t_start
    return result
