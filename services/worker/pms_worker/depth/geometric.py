"""Deterministic geometric depth (fallback provider).

Builds a smooth, plausible inverse-depth field from scene geometry cues:
vanishing-point estimation from line segments, a floor ramp below the horizon,
a radial recession term toward the vanishing point, and sky suppression for
exteriors. It contains no learned weights, is fully reproducible, and is
deliberately smooth — smooth depth cannot tear at edges, so it is safe for the
2.5D reprojection even though its absolute accuracy is lower than the neural
provider. Its low confidence value makes the Motion Budget Engine restrict
shots to low-risk motion profiles.
"""
from __future__ import annotations

import cv2
import numpy as np

from .base import DepthProvider, DepthResult


def _detect_lines(gray: np.ndarray):
    edges = cv2.Canny(gray, 60, 160, apertureSize=3)
    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi / 180,
        threshold=60,
        minLineLength=max(40, gray.shape[1] // 12),
        maxLineGap=8,
    )
    if lines is None:
        return []
    return lines.reshape(-1, 4)


def _estimate_vanishing_point(lines, w: int, h: int):
    """Intersect pairs of receding lines (excludes near-vertical and
    near-horizontal segments) and take the median intersection."""
    candidates = []
    for x1, y1, x2, y2 in lines:
        dx, dy = x2 - x1, y2 - y1
        length = np.hypot(dx, dy)
        if length < 1e-3:
            continue
        angle = abs(np.degrees(np.arctan2(dy, dx))) % 180
        if angle < 12 or angle > 168 or 78 < angle < 102:
            continue  # horizontal or vertical: not a receding line
        candidates.append((x1, y1, x2, y2))

    points = []
    rng = np.random.default_rng(42)
    n = len(candidates)
    if n >= 2:
        max_pairs = min(600, n * (n - 1) // 2)
        for _ in range(max_pairs):
            i, j = rng.integers(0, n, size=2)
            if i == j:
                continue
            x1, y1, x2, y2 = candidates[i]
            x3, y3, x4, y4 = candidates[j]
            d1 = np.array([x2 - x1, y2 - y1], dtype=np.float64)
            d2 = np.array([x4 - x3, y4 - y3], dtype=np.float64)
            denom = d1[0] * d2[1] - d1[1] * d2[0]
            if abs(denom) < 1e-6:
                continue
            t = ((x3 - x1) * d2[1] - (y3 - y1) * d2[0]) / denom
            px, py = x1 + t * d1[0], y1 + t * d1[1]
            if -w * 0.5 <= px <= w * 1.5 and -h * 0.5 <= py <= h * 1.5:
                points.append((px, py))

    if len(points) >= 8:
        pts = np.array(points)
        vp = np.median(pts, axis=0)
        spread = np.median(np.abs(pts - vp), axis=0).mean() / max(w, h)
        conf = float(np.clip(1.0 - spread * 4.0, 0.1, 0.9))
        return float(vp[0]), float(vp[1]), conf
    return w / 2.0, h * 0.45, 0.15


def _sky_mask(image_bgr: np.ndarray) -> np.ndarray:
    """Probable-sky mask for exteriors: bright, low-saturation-or-blue region
    connected to the top border."""
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    h_, s, v = cv2.split(hsv)
    blueish = ((h_ > 90) & (h_ < 135) & (s > 30) & (v > 100)).astype(np.uint8)
    washed = ((s < 40) & (v > 170)).astype(np.uint8)
    cand = ((blueish | washed) * 255).astype(np.uint8)
    cand = cv2.morphologyEx(cand, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    num, labels = cv2.connectedComponents(cand)
    mask = np.zeros_like(cand)
    top_labels = np.unique(labels[0:3, :])
    for lab in top_labels:
        if lab == 0:
            continue
        mask[labels == lab] = 255
    return mask


class GeometricDepthProvider(DepthProvider):
    name = "geometric"

    def estimate(self, image_bgr: np.ndarray) -> DepthResult:
        h, w = image_bgr.shape[:2]
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

        lines = _detect_lines(gray)
        vp_x, vp_y, vp_conf = _estimate_vanishing_point(lines, w, h)
        horizon_y = float(np.clip(vp_y, h * 0.2, h * 0.75))

        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

        # Floor ramp: nearest at the bottom edge, receding to the horizon.
        floor = np.clip((yy - horizon_y) / max(h - horizon_y, 1.0), 0.0, 1.0)

        # Above the horizon: walls/ceiling recede gently; slightly nearer at the
        # very top of the frame (typical interior ceiling geometry).
        above = np.clip((horizon_y - yy) / max(horizon_y, 1.0), 0.0, 1.0) * 0.30

        # Radial recession toward the vanishing point (rooms and streets recede
        # toward the VP; frame borders are nearer).
        dist = np.hypot((xx - vp_x) / w, (yy - vp_y) / h)
        radial = np.clip(dist / 0.75, 0.0, 1.0) * 0.45

        inv = np.maximum(floor, above * 0.5) * 0.7 + radial * 0.3
        inv = np.clip(inv, 0.0, 1.0)

        sky = _sky_mask(image_bgr)
        if sky.any():
            inv[sky > 0] = 0.0

        inv = cv2.GaussianBlur(inv, (0, 0), sigmaX=max(w, h) * 0.01)
        lo, hi = float(inv.min()), float(inv.max())
        inv = (inv - lo) / max(hi - lo, 1e-6)

        confidence = float(np.clip(0.25 + vp_conf * 0.3, 0.25, 0.55))
        return DepthResult(
            inverse_depth=inv.astype(np.float32),
            confidence=confidence,
            provider=self.name,
            meta={
                "vanishing_point": [vp_x, vp_y],
                "horizon_y": horizon_y,
                "vp_confidence": vp_conf,
                "num_lines": int(len(lines)),
                "sky_fraction": float((sky > 0).mean()) if sky.any() else 0.0,
            },
        )
