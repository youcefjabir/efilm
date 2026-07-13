"""Scene Life mask proposals.

Launch pipeline: (1) classical detectors propose candidate masks for water,
foliage and grass; (2) the optional Gemini director confirms semantics
(is there a pool? is the window open?); (3) the owner can correct any mask in
the mask editor. A SegmentationProvider interface allows a future
Grounding DINO + SAM 2 backend (torch/GPU) to replace the classical proposals
without touching the rest of the pipeline.

Detectors are conservative: at low confidence they return nothing, and the
Scene Life effect stays off (per the non-negotiable rules).
"""
from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np


@dataclass
class MaskProposal:
    effect_type: str
    mask: np.ndarray  # uint8, 255 = candidate region
    confidence: float
    meta: dict


def _clean(mask: np.ndarray, min_area_fraction: float, img_area: int) -> np.ndarray:
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    num, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
    out = np.zeros_like(mask)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] >= img_area * min_area_fraction:
            out[labels == i] = 255
    return out


def propose_water(image_bgr: np.ndarray) -> MaskProposal | None:
    """Pool/water candidate: saturated cyan-blue region in the lower 2/3 of the
    frame with low texture."""
    h, w = image_bgr.shape[:2]
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    hh, s, v = cv2.split(hsv)
    water = ((hh >= 85) & (hh <= 115) & (s >= 60) & (v >= 90)).astype(np.uint8) * 255
    water[: h // 4, :] = 0  # never in the top quarter (sky)

    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    texture = cv2.Laplacian(gray, cv2.CV_32F, ksize=3)
    texture = cv2.GaussianBlur(np.abs(texture), (0, 0), 9)
    water[texture > 45] = 0  # water (incl. ripples) is smoother than plants/tiles

    water = _clean(water, 0.01, h * w)

    # Sky is in the same hue range: drop any component connected to the sky
    # region (touching the top quarter of the frame).
    num, labels = cv2.connectedComponents((water > 0).astype(np.uint8))
    for lab in np.unique(labels[: h // 4 + 2, :]):
        if lab != 0:
            water[labels == lab] = 0
    frac = (water > 0).mean()
    if frac < 0.015:
        return None
    hue_std = float(hh[water > 0].std()) if (water > 0).any() else 99.0
    confidence = float(np.clip(0.45 + frac * 2.0 + (12 - hue_std) * 0.02, 0.0, 0.97))
    if confidence < 0.55:
        return None
    return MaskProposal("pool_water", water, confidence, {"area_fraction": float(frac), "hue_std": hue_std})


def propose_foliage(image_bgr: np.ndarray) -> MaskProposal | None:
    """Outdoor foliage candidate: green, textured vegetation region."""
    h, w = image_bgr.shape[:2]
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    hh, s, v = cv2.split(hsv)
    green = ((hh >= 30) & (hh <= 85) & (s >= 50) & (v >= 40) & (v <= 235)).astype(np.uint8) * 255

    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    texture = cv2.Laplacian(gray, cv2.CV_32F, ksize=3)
    texture = cv2.GaussianBlur(np.abs(texture), (0, 0), 7)
    green[texture < 4] = 0  # foliage is textured; painted walls are not

    green = _clean(green, 0.008, h * w)
    frac = (green > 0).mean()
    if frac < 0.02:
        return None
    confidence = float(np.clip(0.40 + frac * 1.6, 0.0, 0.9))
    if confidence < 0.5:
        return None
    return MaskProposal("outdoor_foliage", green, confidence, {"area_fraction": float(frac)})


def propose_high_grass(image_bgr: np.ndarray) -> MaskProposal | None:
    """High-grass candidate: green + strongly vertical texture near the ground."""
    h, w = image_bgr.shape[:2]
    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    hh, s, v = cv2.split(hsv)
    green = ((hh >= 25) & (hh <= 90) & (s >= 40)).astype(np.uint8)
    green[: int(h * 0.45), :] = 0  # grass lives in the lower half

    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    gx = np.abs(cv2.Sobel(gray, cv2.CV_32F, 1, 0, 3))
    gy = np.abs(cv2.Sobel(gray, cv2.CV_32F, 0, 1, 3))
    verticality = cv2.GaussianBlur(gx - gy, (0, 0), 9)  # blades create x-gradients
    grass = ((green > 0) & (verticality > 6)).astype(np.uint8) * 255
    grass = _clean(grass, 0.01, h * w)
    frac = (grass > 0).mean()
    if frac < 0.02:
        return None
    confidence = float(np.clip(0.35 + frac * 1.5, 0.0, 0.85))
    if confidence < 0.5:
        return None
    return MaskProposal("high_grass", grass, confidence, {"area_fraction": float(frac)})


def propose_all(image_bgr: np.ndarray) -> list[MaskProposal]:
    proposals = []
    for fn in (propose_water, propose_foliage, propose_high_grass):
        p = fn(image_bgr)
        if p is not None:
            proposals.append(p)
    return proposals
