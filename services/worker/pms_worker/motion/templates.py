"""Motion Budget Engine: turn a template + strength + scene risk class into a
concrete, clamped motion plan for one shot.

Safety layering (per the FAS 1 conclusion): templates carry the reference-
calibrated motion *rates*; risk-class caps and occlusion analysis clamp the
final amplitudes; the Quality Gate verifies the rendered result. Strength is
a 0..1 knob interpolating within the template's measured rate range.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from ..config import motion_templates, quality_gates


@dataclass
class MotionPlan:
    template_id: str
    duration_seconds: float
    fps: int
    strength: float
    anchor_mode: str
    total_scale_delta: float
    total_pan_x: float
    total_pan_y: float
    total_roll_deg: float
    parallax_gain: float  # renderer parallax strength, fraction of width at depth extremes
    overscan_fraction: float
    risk_class: str
    clamps_applied: list = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "template_id": self.template_id,
            "duration_seconds": self.duration_seconds,
            "fps": self.fps,
            "strength": self.strength,
            "anchor_mode": self.anchor_mode,
            "total_scale_delta": self.total_scale_delta,
            "total_pan_x": self.total_pan_x,
            "total_pan_y": self.total_pan_y,
            "total_roll_deg": self.total_roll_deg,
            "parallax_gain": self.parallax_gain,
            "overscan_fraction": self.overscan_fraction,
            "risk_class": self.risk_class,
            "clamps_applied": self.clamps_applied,
        }


def get_template(template_id: str) -> dict:
    templates = motion_templates()["templates"]
    if template_id not in templates:
        raise KeyError(f"Unknown camera motion template: {template_id}")
    return templates[template_id]


def _lerp_range(rng, strength: float) -> float:
    lo, hi = float(rng[0]), float(rng[1])
    return lo + (hi - lo) * strength


def build_motion_plan(
    template_id: str,
    *,
    duration_seconds: float | None = None,
    strength: float | None = None,
    anchor_mode: str | None = None,
    risk_class: str = "normal_interior",
    depth_confidence: float = 0.5,
    direction: float = 1.0,
    occlusion_limits: dict | None = None,
) -> MotionPlan:
    """Build a clamped motion plan.

    direction: +1/-1 flips the lateral/rotation sign for _left/_right variants
               whose template already encodes sign in its ranges; keep 1.0 for
               templates used as-is.
    occlusion_limits: optional dict with max_pan_x / max_scale_delta /
               max_roll_deg computed by the occlusion analysis for this image.
    """
    cfg = motion_templates()
    defaults = cfg["defaults"]
    tpl = get_template(template_id)
    limits = cfg["risk_class_limits"].get(risk_class, cfg["risk_class_limits"]["normal_interior"])

    duration = float(duration_seconds or defaults["duration_seconds"])
    fps = int(defaults["fps"])
    s = float(tpl.get("default_strength", 0.6) if strength is None else strength)
    s = min(max(s, 0.0), 1.0)

    # Low depth confidence (geometric fallback) restricts the usable strength
    # range instead of granting a generative model more freedom.
    if depth_confidence < 0.6:
        s = min(s, 0.35 + depth_confidence * 0.5)

    anchor = anchor_mode or tpl["anchor_modes"][0]
    if anchor not in tpl["anchor_modes"]:
        anchor = tpl["anchor_modes"][0]

    zoom_rate = _lerp_range(tpl["zoom_rate"], s)
    pan_rate = _lerp_range(tpl["pan_rate"], s) * direction
    tilt_rate = _lerp_range(tpl.get("tilt_rate", [0.0, 0.0]), s)
    rot_lo, rot_hi = tpl["rot_rate"]
    # Rotation ranges can straddle zero (e.g. hero); pick the strength-scaled
    # magnitude with the sign that matches the pan direction for a natural arc.
    if rot_lo < 0 <= rot_hi:
        rot_mag = _lerp_range([0.0, max(abs(rot_lo), abs(rot_hi))], s)
        rot_rate = rot_mag * (1.0 if pan_rate >= 0 else -1.0)
    else:
        rot_rate = _lerp_range(tpl["rot_rate"], s) * direction

    total_scale = zoom_rate * duration
    total_pan_x = pan_rate * duration
    total_pan_y = -tilt_rate * duration  # tilt up = content moves down
    total_roll = rot_rate * duration

    clamps: list[str] = []

    def _cap(value: float, cap: float, label: str) -> float:
        if abs(value) > cap:
            clamps.append(f"{label}: {value:+.4f} -> {cap * (1 if value >= 0 else -1):+.4f}")
            return cap * (1 if value >= 0 else -1)
        return value

    total_scale = _cap(total_scale, limits["max_total_scale_delta"], "scale(risk_class)")
    total_pan_x = _cap(total_pan_x, limits["max_total_pan_fraction"], "pan_x(risk_class)")
    total_pan_y = _cap(total_pan_y, limits["max_total_pan_fraction"], "pan_y(risk_class)")
    total_roll = _cap(total_roll, limits["max_total_rotation_deg"], "roll(risk_class)")

    if occlusion_limits:
        if "max_pan_x" in occlusion_limits:
            total_pan_x = _cap(total_pan_x, occlusion_limits["max_pan_x"], "pan_x(occlusion)")
        if "max_scale_delta" in occlusion_limits:
            total_scale = _cap(total_scale, occlusion_limits["max_scale_delta"], "scale(occlusion)")
        if "max_roll_deg" in occlusion_limits:
            total_roll = _cap(total_roll, occlusion_limits["max_roll_deg"], "roll(occlusion)")

    parallax_target = _lerp_range(tpl["parallax_target"], s)
    parallax_gain = parallax_target * duration
    if depth_confidence < 0.6:
        parallax_gain *= 0.6
        clamps.append("parallax reduced (low depth confidence)")

    # Overscan sized to worst-case pose + parallax margin.
    max_needed = abs(total_pan_x) + abs(total_scale) * 0.5 + parallax_gain + abs(total_roll) * 0.01
    overscan = min(
        max(defaults["overscan_min_fraction"], max_needed * 1.3),
        defaults["overscan_max_fraction"],
    )

    return MotionPlan(
        template_id=template_id,
        duration_seconds=duration,
        fps=fps,
        strength=s,
        anchor_mode=anchor,
        total_scale_delta=total_scale,
        total_pan_x=total_pan_x,
        total_pan_y=total_pan_y,
        total_roll_deg=total_roll,
        parallax_gain=parallax_gain,
        overscan_fraction=overscan,
        risk_class=risk_class,
        clamps_applied=clamps,
    )


def shot_duration_for(scene_role: str) -> float:
    durations = quality_gates()["shot_durations"]
    return float(durations.get(scene_role, durations["interior"]))
