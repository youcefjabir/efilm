#!/usr/bin/env python3
"""Download the neural depth model (Depth Anything V2 Small, ONNX export).

Without this file the render worker silently falls back to the deterministic
geometric depth provider — a vanishing-point heuristic that has no notion of
individual objects (see docs/DEPTH.md). That fallback is safe (it cannot tear
the warp) but it is not scene-accurate: camera motion parallax computed from
it looks incoherent rather than three-dimensional. Run this once before first
use; the Docker worker image runs it automatically at build time.

Usage: python3 scripts/fetch_models.py
"""
from __future__ import annotations

import os
import sys
import urllib.request
from pathlib import Path

MODEL_URL = (
    "https://huggingface.co/onnx-community/depth-anything-v2-small/"
    "resolve/main/onnx/model.onnx"
)
MIN_EXPECTED_BYTES = 90_000_000  # fp32 export is ~99 MB; a stub/error page is not


def _models_dir() -> Path:
    override = os.environ.get("PMS_MODELS_DIR")
    if override:
        return Path(override)
    return Path(__file__).resolve().parents[1] / "services" / "worker" / "models"


DEST = _models_dir() / "depth_anything_v2_vits.onnx"


def main() -> int:
    if DEST.exists():
        print(f"already present: {DEST} ({DEST.stat().st_size / 1e6:.1f} MB)")
        return 0
    DEST.parent.mkdir(parents=True, exist_ok=True)
    tmp = DEST.with_suffix(".onnx.part")
    print(f"downloading {MODEL_URL}")
    try:
        urllib.request.urlretrieve(MODEL_URL, tmp)
        if tmp.stat().st_size < MIN_EXPECTED_BYTES:
            raise RuntimeError(f"downloaded file too small ({tmp.stat().st_size} bytes)")
    except Exception as e:  # network unavailable: not fatal, geometric fallback covers it
        print(f"download failed ({e}); the app will use the geometric depth fallback.")
        tmp.unlink(missing_ok=True)
        return 0
    tmp.rename(DEST)
    print(f"saved {DEST} ({DEST.stat().st_size / 1e6:.1f} MB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
