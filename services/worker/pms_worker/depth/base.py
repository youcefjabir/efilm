"""Depth provider interface.

Providers return a normalized inverse-depth map (1.0 = nearest, 0.0 = farthest)
plus confidence metadata. The renderer only consumes normalized inverse depth,
so providers are interchangeable.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field

import cv2
import numpy as np


@dataclass
class DepthResult:
    """Normalized inverse depth (H x W float32 in [0, 1], 1 = near)."""

    inverse_depth: np.ndarray
    confidence: float  # 0..1 provider self-assessment
    provider: str
    meta: dict = field(default_factory=dict)

    def edge_aware_smoothed(self, guide_bgr: np.ndarray) -> np.ndarray:
        """Edge-aware smoothing that keeps depth discontinuities aligned with
        image edges (furniture, window frames, pool edges)."""
        d = self.inverse_depth.astype(np.float32)
        guide = guide_bgr
        if guide.shape[:2] != d.shape[:2]:
            guide = cv2.resize(guide, (d.shape[1], d.shape[0]))
        try:
            smoothed = cv2.ximgproc.guidedFilter(guide, d, radius=8, eps=1e-4)
        except Exception:
            smoothed = cv2.bilateralFilter(d, d=9, sigmaColor=0.1, sigmaSpace=7)
        return np.clip(smoothed, 0.0, 1.0)


class DepthProvider:
    name = "base"

    def estimate(self, image_bgr: np.ndarray) -> DepthResult:  # pragma: no cover
        raise NotImplementedError


def get_depth_provider(preference: str | None = None) -> DepthProvider:
    """Select a depth provider.

    "auto" prefers the neural model when its weights are present and falls back
    to the deterministic geometric provider otherwise.
    """
    pref = (preference or os.environ.get("DEPTH_PROVIDER", "auto")).lower()

    if pref in ("auto", "depth_anything_v2"):
        try:
            from .depth_anything import DepthAnythingV2Provider

            provider = DepthAnythingV2Provider()
            if provider.available():
                return provider
            if pref == "depth_anything_v2":
                raise RuntimeError(
                    "DEPTH_PROVIDER=depth_anything_v2 but model weights not found. "
                    "Run scripts/fetch_models.py or set DEPTH_PROVIDER=auto."
                )
        except ImportError:
            if pref == "depth_anything_v2":
                raise

    from .geometric import GeometricDepthProvider

    return GeometricDepthProvider()
