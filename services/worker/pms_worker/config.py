"""Load shared product configuration (motion templates, quality gates).

The JSON files in packages/config are the single source of truth shared by the
TypeScript app and this worker.
"""
from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path

_HERE = Path(__file__).resolve()


def repo_root() -> Path:
    for parent in _HERE.parents:
        if (parent / "pnpm-workspace.yaml").exists():
            return parent
    # Fallback for a worker deployed standalone: config files copied next to package
    return _HERE.parents[1]


def _config_dir() -> Path:
    override = os.environ.get("PMS_CONFIG_DIR")
    if override:
        return Path(override)
    root = repo_root()
    candidate = root / "packages" / "config"
    if candidate.exists():
        return candidate
    return _HERE.parents[1] / "config"


@lru_cache(maxsize=None)
def motion_templates() -> dict:
    with open(_config_dir() / "motion-templates.json") as f:
        return json.load(f)


@lru_cache(maxsize=None)
def quality_gates() -> dict:
    with open(_config_dir() / "quality-gates.json") as f:
        return json.load(f)


def models_dir() -> Path:
    override = os.environ.get("PMS_MODELS_DIR")
    if override:
        return Path(override)
    return Path(__file__).resolve().parents[1] / "models"
