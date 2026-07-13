"""Depth Anything V2 Small via ONNX Runtime (CPU-friendly primary provider).

Weights are NOT bundled. `scripts/fetch_models.py` downloads the ONNX export
into services/worker/models/ in environments with open network access
(HuggingFace / GitHub releases). When the file is missing this provider
reports unavailable and the geometric provider takes over.
"""
from __future__ import annotations

import cv2
import numpy as np

from ..config import models_dir
from .base import DepthProvider, DepthResult

MODEL_FILENAMES = (
    "depth_anything_v2_vits_dynamic.onnx",
    "depth_anything_v2_vits.onnx",
)
INPUT_SIZE = 518  # ViT-S default


class DepthAnythingV2Provider(DepthProvider):
    name = "depth_anything_v2_small"

    def __init__(self) -> None:
        self._session = None
        self._model_path = None
        for fname in MODEL_FILENAMES:
            p = models_dir() / fname
            if p.exists():
                self._model_path = p
                break

    def available(self) -> bool:
        return self._model_path is not None

    def _ensure_session(self):
        if self._session is None:
            import onnxruntime as ort

            self._session = ort.InferenceSession(
                str(self._model_path), providers=["CPUExecutionProvider"]
            )
        return self._session

    def estimate(self, image_bgr: np.ndarray) -> DepthResult:
        session = self._ensure_session()
        h, w = image_bgr.shape[:2]

        rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        rgb = cv2.resize(rgb, (INPUT_SIZE, INPUT_SIZE), interpolation=cv2.INTER_AREA)
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        rgb = (rgb - mean) / std
        blob = rgb.transpose(2, 0, 1)[None]

        input_name = session.get_inputs()[0].name
        (pred,) = session.run(None, {input_name: blob})
        depth = pred[0]
        if depth.ndim == 3:
            depth = depth[0]

        depth = cv2.resize(depth.astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
        lo, hi = np.percentile(depth, 1), np.percentile(depth, 99)
        inv = np.clip((depth - lo) / max(hi - lo, 1e-6), 0.0, 1.0)
        # Depth Anything outputs relative *inverse* depth already (large = near).
        return DepthResult(
            inverse_depth=inv.astype(np.float32),
            confidence=0.9,
            provider=self.name,
            meta={"model_path": str(self._model_path)},
        )
