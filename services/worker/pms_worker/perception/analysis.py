"""Deterministic per-image analysis: sharpness, exposure, resolution class,
perceptual hash (duplicate detection), and geometry-derived risk signals.

These are computed locally and for free; the AI Director combines them with
(optional) Gemini semantics. Results are cached per asset hash by the caller.
"""
from __future__ import annotations

import cv2
import numpy as np


def perceptual_hash(image_bgr: np.ndarray, hash_size: int = 8) -> str:
    """64-bit DCT perceptual hash (pHash), hex-encoded."""
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    small = cv2.resize(gray, (hash_size * 4, hash_size * 4), interpolation=cv2.INTER_AREA)
    dct = cv2.dct(small.astype(np.float32))
    low = dct[:hash_size, :hash_size]
    med = np.median(low[1:, 1:])
    bits = (low > med).flatten()
    value = 0
    for b in bits:
        value = (value << 1) | int(b)
    return f"{value:016x}"


def hamming_distance(hash_a: str, hash_b: str) -> int:
    return bin(int(hash_a, 16) ^ int(hash_b, 16)).count("1")


def sharpness_score(image_bgr: np.ndarray) -> float:
    """Laplacian-variance sharpness normalized to ~[0, 1]."""
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    if max(gray.shape) > 1600:
        f = 1600 / max(gray.shape)
        gray = cv2.resize(gray, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
    var = cv2.Laplacian(gray, cv2.CV_64F).var()
    return float(np.clip(np.log10(var + 1) / 3.5, 0.0, 1.0))


def exposure_stats(image_bgr: np.ndarray) -> dict:
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
    hist /= hist.sum() + 1e-9
    return {
        "mean_luma": float(gray.mean()) / 255.0,
        "clipped_black": float(hist[:8].sum()),
        "clipped_white": float(hist[-8:].sum()),
        "contrast": float(gray.std()) / 255.0,
    }


def resolution_class(width: int, height: int) -> str:
    """Motion headroom class. Reference-strength motion needs ~10% overscan on
    top of the 1920px export, i.e. >= ~2200px source width."""
    long_edge = max(width, height)
    if long_edge >= 2600:
        return "full"
    if long_edge >= 2200:
        return "standard"
    if long_edge >= 1920:
        return "limited"
    return "low"


def line_risk_analysis(image_bgr: np.ndarray) -> dict:
    """Straight-architecture risk: many long straight lines (cabinets, tiles,
    stairs) raise deformation risk and lower the allowed motion class."""
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    scale = 1.0
    if gray.shape[1] > 1600:
        scale = 1600 / gray.shape[1]
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    h, w = gray.shape
    edges = cv2.Canny(gray, 60, 160)
    lines = cv2.HoughLinesP(
        edges, 1, np.pi / 180, threshold=60, minLineLength=w // 10, maxLineGap=6
    )
    lines = [] if lines is None else lines.reshape(-1, 4)

    vertical = horizontal = receding = 0
    total_len = 0.0
    for x1, y1, x2, y2 in lines:
        ang = abs(np.degrees(np.arctan2(y2 - y1, x2 - x1))) % 180
        length = float(np.hypot(x2 - x1, y2 - y1))
        total_len += length
        if ang < 8 or ang > 172:
            horizontal += 1
        elif 82 < ang < 98:
            vertical += 1
        else:
            receding += 1

    density = total_len / (w * h) * 1000.0
    line_count = len(lines)
    # Tile/cabinet-heavy scenes: many parallel lines, high density.
    risk = float(np.clip(0.15 + density * 0.35 + line_count / 220.0, 0.0, 1.0))
    return {
        "line_count": int(line_count),
        "vertical_lines": int(vertical),
        "horizontal_lines": int(horizontal),
        "receding_lines": int(receding),
        "line_density": float(density),
        "straight_line_risk": risk,
    }


def foreground_fraction(inverse_depth: np.ndarray, near_threshold: float = 0.75) -> float:
    return float((inverse_depth >= near_threshold).mean())


def find_duplicates(hashes: dict[str, str], max_distance: int = 10) -> list[list[str]]:
    """Group asset ids whose pHashes are within max_distance bits."""
    ids = list(hashes.keys())
    parent = {i: i for i in ids}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for i, a in enumerate(ids):
        for b in ids[i + 1 :]:
            if hamming_distance(hashes[a], hashes[b]) <= max_distance:
                ra, rb = find(a), find(b)
                if ra != rb:
                    parent[rb] = ra
    groups: dict[str, list[str]] = {}
    for i in ids:
        groups.setdefault(find(i), []).append(i)
    return [g for g in groups.values() if len(g) > 1]
