"""Full deterministic per-asset analysis (no API calls, cached per hash).

Combines the perception modules into one AssetAnalysis record. The semantic
director (Gemini or deterministic heuristics) is layered on top of this.
"""
from __future__ import annotations

import hashlib

import cv2
import numpy as np

from ..depth import get_depth_provider
from ..perception import analysis as pa
from ..perception.masks import propose_all
from ..perception.occlusion import occlusion_risks


def content_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def analyze_asset(image_bgr: np.ndarray, depth_provider: str | None = None) -> dict:
    h, w = image_bgr.shape[:2]

    provider = get_depth_provider(depth_provider)
    depth_res = provider.estimate(image_bgr)
    smoothed = depth_res.edge_aware_smoothed(image_bgr)
    occ = occlusion_risks(smoothed)

    lines = pa.line_risk_analysis(image_bgr)
    exposure = pa.exposure_stats(image_bgr)
    sharp = pa.sharpness_score(image_bgr)
    res_class = pa.resolution_class(w, h)
    proposals = propose_all(image_bgr)

    # Coarse exterior signal: sky + vegetation fractions.
    sky_fraction = float(depth_res.meta.get("sky_fraction", 0.0))
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    hh, s, v = cv2.split(hsv)
    green_fraction = float(((hh >= 30) & (hh <= 85) & (s >= 50)).mean())
    is_probably_exterior = sky_fraction > 0.04 or green_fraction > 0.22

    fg = pa.foreground_fraction(smoothed)
    risk_score = float(
        np.clip(
            lines["straight_line_risk"] * 0.5
            + fg * 0.3
            + max(occ["risk_left"], occ["risk_right"], occ["risk_push"]) * 0.2,
            0.0,
            1.0,
        )
    )

    if risk_score > 0.62 and not is_probably_exterior:
        risk_class = "high_risk_interior"
    elif is_probably_exterior:
        risk_class = "open_exterior"
    else:
        risk_class = "normal_interior"

    quality_score = float(
        np.clip(
            sharp * 0.45
            + exposure["contrast"] * 0.9 * 0.25
            + (1.0 - exposure["clipped_white"] * 4 - exposure["clipped_black"] * 4) * 0.15
            + {"full": 0.15, "standard": 0.11, "limited": 0.06, "low": 0.0}[res_class],
            0.0,
            1.0,
        )
    )

    return {
        "width": w,
        "height": h,
        "phash": pa.perceptual_hash(image_bgr),
        "sharpness": sharp,
        "exposure": exposure,
        "resolution_class": res_class,
        "quality_score": quality_score,
        "line_analysis": lines,
        "occlusion": {k: v for k, v in occ.items() if k != "limits"},
        "occlusion_limits": occ["limits"],
        "depth_provider": depth_res.provider,
        "depth_confidence": depth_res.confidence,
        "depth_meta": depth_res.meta,
        "sky_fraction": sky_fraction,
        "green_fraction": green_fraction,
        "is_probably_exterior": is_probably_exterior,
        "foreground_fraction": fg,
        "risk_score": risk_score,
        "risk_class": risk_class,
        "scene_life_candidates": [
            {
                "type": p.effect_type,
                "confidence": p.confidence,
                "area_fraction": p.meta.get("area_fraction", 0.0),
            }
            for p in proposals
        ],
    }
