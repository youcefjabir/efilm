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

    # Moving camera right reveals area on the right side of near occluders
    # (where depth drops moving right: gx < 0).
    risk_right = float(np.mean(np.clip(-gx, 0, None) * near_weight) * 50.0)
    risk_left = float(np.mean(np.clip(gx, 0, None) * near_weight) * 50.0)
    risk_down = float(np.mean(np.clip(-gy, 0, None) * near_weight) * 50.0)
    risk_up = float(np.mean(np.clip(gy, 0, None) * near_weight) * 50.0)
    # Push-in reveals area behind near objects in all directions; pull-out is
    # safe (reveals nothing, only compresses).
    edge_mag = np.hypot(gx, gy)
    risk_push = float(np.mean(edge_mag * near_weight) * 35.0)

    def limit(risk: float, base: float) -> float:
        return float(base / (1.0 + risk * 3.0))

    return {
        "risk_left": min(risk_left, 1.0),
        "risk_right": min(risk_right, 1.0),
        "risk_up": min(risk_up, 1.0),
        "risk_down": min(risk_down, 1.0),
        "risk_push": min(risk_push, 1.0),
        "orbit_risk": min((risk_left + risk_right) * 0.6 + risk_push * 0.4, 1.0),
        "limits": {
            "max_pan_x": limit(max(risk_left, risk_right), 0.12),
            "max_scale_delta": limit(risk_push, 0.15),
            "max_roll_deg": limit((risk_left + risk_right) / 2, 5.0),
        },
    }
