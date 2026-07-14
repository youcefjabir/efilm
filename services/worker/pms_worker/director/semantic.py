"""Semantic director providers.

GeminiDirector    — calls the Gemini API with a strict JSON response schema for
                    room classification, story value, aerial verification and
                    open-window checks. Never used for rendering/depth/masks.
DeterministicDirector — no API calls: conservative heuristics from the local
                    analysis. Cannot verify aerial shots or open windows, so
                    aerial templates and curtain effects stay disabled.

Both return the same record shape; hard rules are enforced on top in
`apply_hard_rules` — AI output is never accepted blindly.
"""
from __future__ import annotations

import base64
import json
import os

import cv2
import numpy as np

SCENE_TYPES = [
    "facade", "entrance", "hall", "living_room", "kitchen", "dining",
    "bedroom", "bathroom", "office", "stairs", "balcony", "patio",
    "garden", "pool_exterior", "view", "aerial", "detail", "other_interior",
    "other_exterior", "unknown",
]

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "scene_type": {"type": "STRING", "enum": SCENE_TYPES},
        "is_aerial": {"type": "BOOLEAN"},
        "is_exterior": {"type": "BOOLEAN"},
        "story_value": {"type": "NUMBER"},
        "is_hero_candidate": {"type": "BOOLEAN"},
        "open_window_or_door_visible": {"type": "BOOLEAN"},
        "curtain_near_opening": {"type": "BOOLEAN"},
        "water_visible": {"type": "BOOLEAN"},
        "reason": {"type": "STRING"},
    },
    "required": [
        "scene_type", "is_aerial", "is_exterior", "story_value",
        "is_hero_candidate", "open_window_or_door_visible",
        "curtain_near_opening", "water_visible", "reason",
    ],
}

PROMPT = """You are classifying a single professional real-estate photograph
for an automated property film. Answer strictly in the JSON schema.

- scene_type: the best matching room/scene type.
- is_aerial: true ONLY if this is clearly a drone/aerial photograph taken from
  significant height above ground. Elevated balcony shots are NOT aerial.
- is_exterior: true for outdoor photographs.
- story_value: 0..1, how important this image is for presenting the home
  (wide social spaces and strong exteriors high; narrow utility shots low).
- is_hero_candidate: true if this could open or close the film.
- open_window_or_door_visible: true ONLY if a window or exterior door is
  clearly open in the image.
- curtain_near_opening: true ONLY if a thin/light curtain hangs immediately at
  a visibly open window or door.
- water_visible: true if a pool, sea, lake or other real water surface is visible.
- reason: one short sentence.
Be conservative: when uncertain, answer false."""


def _default_semantics(analysis: dict) -> dict:
    if analysis.get("scene_life_candidates"):
        water = any(c["type"] == "pool_water" for c in analysis["scene_life_candidates"])
    else:
        water = False
    exterior = bool(analysis.get("is_probably_exterior"))
    return {
        "scene_type": "other_exterior" if exterior else "unknown",
        "is_aerial": False,  # never verifiable without the semantic model
        "is_exterior": exterior,
        "story_value": float(np.clip(analysis.get("quality_score", 0.5) * 0.9 + 0.05, 0, 1)),
        "is_hero_candidate": analysis.get("quality_score", 0) > 0.62,
        "open_window_or_door_visible": False,
        "curtain_near_opening": False,
        "water_visible": water,
        "reason": "Deterministic heuristics (no semantic model configured).",
        "provider": "deterministic",
    }


class DeterministicDirector:
    name = "deterministic"

    def classify(self, image_bgr: np.ndarray, analysis: dict) -> dict:
        sem = _default_semantics(analysis)
        if analysis.get("is_probably_exterior"):
            if any(c["type"] == "pool_water" for c in analysis.get("scene_life_candidates", [])):
                sem["scene_type"] = "pool_exterior"
            elif analysis.get("green_fraction", 0) > 0.3:
                sem["scene_type"] = "garden"
        return sem


class GeminiDirector:
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        self.primary = os.environ.get("GEMINI_PRIMARY_MODEL", "gemini-3.1-flash-lite")
        self.fallback = os.environ.get("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash")
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY not configured")

    name = "gemini"

    def _call(self, model: str, jpeg_b64: str) -> dict:
        import requests

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        )
        body = {
            "contents": [
                {
                    "parts": [
                        {"text": PROMPT},
                        {"inline_data": {"mime_type": "image/jpeg", "data": jpeg_b64}},
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": RESPONSE_SCHEMA,
                "temperature": 0.1,
            },
        }
        r = requests.post(
            url, json=body, headers={"x-goog-api-key": self.api_key}, timeout=60
        )
        r.raise_for_status()
        data = r.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        usage = data.get("usageMetadata", {})
        parsed = json.loads(text)
        parsed["_usage"] = {
            "model": model,
            "input_tokens": usage.get("promptTokenCount", 0),
            "output_tokens": usage.get("candidatesTokenCount", 0),
        }
        return parsed

    def _validate(self, result: dict) -> bool:
        try:
            return (
                result["scene_type"] in SCENE_TYPES
                and isinstance(result["is_aerial"], bool)
                and 0.0 <= float(result["story_value"]) <= 1.0
            )
        except (KeyError, TypeError, ValueError):
            return False

    def classify(self, image_bgr: np.ndarray, analysis: dict) -> dict:
        # Analysis proxy: long edge <= 1024, JPEG q80 — enough for semantics.
        img = image_bgr
        long_edge = max(img.shape[:2])
        if long_edge > 1024:
            f = 1024 / long_edge
            img = cv2.resize(img, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
        ok, buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if not ok:
            return _default_semantics(analysis)
        b64 = base64.b64encode(buf.tobytes()).decode()

        for model in (self.primary, self.fallback):
            try:
                result = self._call(model, b64)
                if self._validate(result):
                    result["provider"] = f"gemini:{model}"
                    return result
            except Exception:
                continue
        sem = _default_semantics(analysis)
        sem["reason"] = "Gemini unavailable/invalid; deterministic fallback used."
        return sem


def apply_hard_rules(semantics: dict, analysis: dict) -> dict:
    """Hard validation on top of any provider output (never trust AI blindly)."""
    sem = dict(semantics)
    sem["story_value"] = float(np.clip(float(sem.get("story_value", 0.5)), 0.0, 1.0))
    if sem.get("scene_type") not in SCENE_TYPES:
        sem["scene_type"] = "unknown"
    # Aerial requires BOTH the semantic claim and a plausible signal.
    if sem.get("is_aerial"):
        if not sem.get("is_exterior", False):
            sem["is_aerial"] = False
    # Curtain effects require a verified open passage.
    if sem.get("curtain_near_opening") and not sem.get("open_window_or_door_visible"):
        sem["curtain_near_opening"] = False
    # Water Scene Life requires an actual local water mask, not just semantics.
    has_water_mask = any(
        c["type"] in ("pool_water", "natural_water")
        for c in analysis.get("scene_life_candidates", [])
    )
    if sem.get("water_visible") and not has_water_mask:
        sem["water_visible"] = False
    return sem


def get_director(provider: str | None = None):
    pref = (provider or os.environ.get("DIRECTOR_PROVIDER", "deterministic")).lower()
    if pref == "gemini":
        try:
            return GeminiDirector()
        except RuntimeError:
            return DeterministicDirector()
    return DeterministicDirector()
