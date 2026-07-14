"""Occlusion analysis: how much hidden image information each camera move
would need to reveal, per direction. Produces per-image motion limits that the
Motion Budget Engine applies on top of template and risk-class caps.

With a backward-warp renderer, disocclusion appears as local stretching at
depth discontinuities. The risk is proportional to the strength of depth
edges perpendicular to the motion direction, weighted by how near the
occluder is.
"""
from __future__ import annotations

import cv2
import numpy as np


def occlusion_risks(inverse_depth: np.ndarray) -> dict:
    d = inverse_depth.astype(np.float32)
    h, w = d.shape[:2]
    if w > 960:
        f = 960 / w
        d = cv2.resize(d, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
        h, w = d.shape[:2]

    gx = cv2.Sobel(d, cv2.CV_32F, 1, 0, ksize=5)
    gy = cv2.Sobel(d, cv2.CV_32F, 0, 1, ksize=5)

    near_weight = np.clip((d - 0.35) / 0.65, 0.0, 1.0)

    # Scale constants calibrated against the neural depth provider (real
    # per-object edges) on a diverse photo sample: raw risk_push there ranges
    # ~2.9-8.0 and raw risk_left/right ~0.3-3.6, so dividing by ~6-8.5 puts a
    # typical real photo around risk ~0.5-0.8 rather than saturating every
    # textured photograph to the 1.0 ceiling (which happened at the original
    # *35/*50 scale, tuned against the near-edgeless geometric depth fallback,
    # and collapsed max_scale_delta to near zero on any real photo).
    risk_right = float(np.mean(np.clip(-gx, 0, None) * near_weight) * 8.5)
    risk_left = float(np.mean(np.clip(gx, 0, None) * near_weight) * 8.5)
    risk_down = float(np.mean(np.clip(-gy, 0, None) * near_weight) * 8.5)
    risk_up = float(np.mean(np.clip(gy, 0, None) * near_weight) * 8.5)
    # Push-in reveals area behind near objects in all directions; pull-out is
    # safe (reveals nothing, only compresses).
    edge_mag = np.hypot(gx, gy)
    risk_push = float(np.mean(edge_mag * near_weight) * 6.0)

    risk_left = min(risk_left, 1.0)
    risk_right = min(risk_right, 1.0)
    risk_up = min(risk_up, 1.0)
    risk_down = min(risk_down, 1.0)
    risk_push = min(risk_push, 1.0)

    # Softer falloff: risk 1.0 (max, busiest real photos) still keeps 40% of
    # the base budget rather than collapsing toward zero; risk 0 keeps 100%.
    def limit(risk: float, base: float) -> float:
        return float(base / (1.0 + risk * 1.5))

    return {
        "risk_left": risk_left,
        "risk_right": risk_right,
        "risk_up": risk_up,
        "risk_down": risk_down,
        "risk_push": risk_push,
        "orbit_risk": min((risk_left + risk_right) * 0.6 + risk_push * 0.4, 1.0),
        "limits": {
            "max_pan_x": limit(max(risk_left, risk_right), 0.20),
            "max_scale_delta": limit(risk_push, 0.24),
            "max_roll_deg": limit((risk_left + risk_right) / 2, 7.0),
        },
    }
