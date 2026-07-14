"""Storyboard builder: image selection, professional ordering, category and
template assignment, durations and AUTO length.

Follows the brief's narrative guidance (§12) and the FAS 1 sequencing rules:
push-in as the base tone, one pull-out as a rhythm breaker every 5-8 shots,
no more than 3 consecutive same-direction moves, heroes at opening/middle/
close, exact durations (3.0 s standard / 4.0 s open+close / 6.0 s hero).
"""
from __future__ import annotations

import numpy as np

from ..config import motion_templates, quality_gates
from ..perception.analysis import find_duplicates

INTERIOR_SOCIAL = {"living_room", "kitchen", "dining", "other_interior", "unknown"}
INTERIOR_SECONDARY = {"bedroom", "office", "hall", "stairs", "entrance"}
INTERIOR_UTILITY = {"bathroom"}
EXTERIOR = {"facade", "patio", "garden", "pool_exterior", "balcony", "view", "other_exterior"}

SCENE_LIFE_MIN_CONFIDENCE = 0.80
SCENE_LIFE_TYPES_ALWAYS_OK = {"pool_water", "natural_water"}
SCENE_LIFE_TYPES_HIGH_BAR = {"outdoor_foliage", "high_grass", "outdoor_plants", "small_outdoor_branches"}
CURTAIN_TYPES = {"thin_curtain_near_open_window", "thin_curtain_near_open_door"}


def select_assets(assets: list[dict]) -> tuple[list[dict], list[dict]]:
    """Drop duplicate/weak images. Returns (selected, rejected_with_reason)."""
    rejected = []
    hashes = {a["asset_id"]: a["analysis"]["phash"] for a in assets}
    groups = find_duplicates(hashes, max_distance=8)
    dropped_ids = set()
    for group in groups:
        members = [a for a in assets if a["asset_id"] in group]
        members.sort(key=lambda a: a["analysis"]["quality_score"], reverse=True)
        for weaker in members[1:]:
            dropped_ids.add(weaker["asset_id"])
            rejected.append({"asset_id": weaker["asset_id"], "reason": "duplicate_weaker"})

    remaining = [a for a in assets if a["asset_id"] not in dropped_ids]
    if len(remaining) > 6:
        keep = []
        for a in remaining:
            if a["analysis"]["quality_score"] < 0.25:
                rejected.append({"asset_id": a["asset_id"], "reason": "low_quality"})
            else:
                keep.append(a)
        remaining = keep if len(keep) >= 4 else remaining
    return remaining, rejected


def _score(asset: dict) -> float:
    return (
        asset["semantics"]["story_value"] * 0.6
        + asset["analysis"]["quality_score"] * 0.4
    )


def order_assets(assets: list[dict]) -> list[dict]:
    """Build the narrative order per the brief's §12 guidance."""
    exteriors = [a for a in assets if a["semantics"]["scene_type"] in EXTERIOR]
    interiors = [a for a in assets if a["semantics"]["scene_type"] not in EXTERIOR]
    details = [a for a in interiors if a["semantics"]["scene_type"] == "detail"]
    interiors = [a for a in interiors if a["semantics"]["scene_type"] != "detail"]

    exteriors.sort(key=_score, reverse=True)
    interiors.sort(key=_score, reverse=True)

    ordered: list[dict] = []
    closing: list[dict] = []

    # Opening: strongest hero (prefer a strong exterior/aerial establishing shot).
    if exteriors:
        ordered.append(exteriors.pop(0))
    elif interiors:
        ordered.append(interiors.pop(0))

    # Reserve the closing hero: prefer view/aerial/pool exterior, else best remaining.
    def closing_priority(a):
        st = a["semantics"]["scene_type"]
        bonus = 0.3 if st in ("view", "aerial", "pool_exterior", "facade") else 0.0
        return _score(a) + bonus

    pool = exteriors + interiors
    if pool:
        pool.sort(key=closing_priority, reverse=True)
        closing = [pool.pop(0)]
        exteriors = [a for a in exteriors if a not in closing]
        interiors = [a for a in interiors if a not in closing]

    # Early exterior context if another good exterior exists.
    social = [a for a in interiors if a["semantics"]["scene_type"] in INTERIOR_SOCIAL]
    secondary = [a for a in interiors if a["semantics"]["scene_type"] in INTERIOR_SECONDARY]
    utility = [a for a in interiors if a["semantics"]["scene_type"] in INTERIOR_UTILITY]

    social.sort(key=_score, reverse=True)
    secondary.sort(key=_score, reverse=True)
    utility.sort(key=_score, reverse=True)

    body: list[dict] = []
    body.extend(social)
    # Interleave details among wide shots (never two details in a row).
    for i, d in enumerate(details):
        pos = min(2 + i * 3, len(body))
        body.insert(pos, d)
    body.extend(secondary)
    body.extend(utility)
    # A remaining exterior mid-film adds air between interior groups.
    if exteriors:
        mid = len(body) // 2
        body.insert(mid, exteriors.pop(0))
    body.extend(exteriors)

    # Avoid the same scene type more than twice consecutively.
    deduped: list[dict] = []
    for a in body:
        if (
            len(deduped) >= 2
            and deduped[-1]["semantics"]["scene_type"] == a["semantics"]["scene_type"]
            and deduped[-2]["semantics"]["scene_type"] == a["semantics"]["scene_type"]
        ):
            deduped.insert(max(len(deduped) - 2, 0), a)
        else:
            deduped.append(a)

    return ordered + deduped + closing


def target_shot_count(n_available: int, length_preference: str, custom_seconds: float | None) -> int:
    cfg = quality_gates()["auto_length"]
    if length_preference == "custom" and custom_seconds:
        target_s = float(np.clip(custom_seconds, cfg["min_total_seconds"], cfg["max_total_seconds"]))
        return max(3, min(n_available, int(round(target_s / 3.4))))
    if length_preference == "short":
        return max(3, min(n_available, 5))
    if length_preference == "long":
        return min(n_available, 18)
    if length_preference == "normal":
        return min(n_available, 11)
    # AUTO: scale with the material, never pad with weak repeats.
    if n_available <= 4:
        return n_available
    if n_available <= 8:
        return n_available
    if n_available <= 14:
        return max(8, int(n_available * 0.85))
    return min(16, int(n_available * 0.7))


def choose_scene_life(asset: dict) -> dict | None:
    sem = asset["semantics"]
    for cand in asset["analysis"].get("scene_life_candidates", []):
        t, conf = cand["type"], cand["confidence"]
        if t in SCENE_LIFE_TYPES_ALWAYS_OK and conf >= SCENE_LIFE_MIN_CONFIDENCE and sem.get("water_visible"):
            return {"effect_type": "pool_water" if t == "pool_water" else "natural_water", "confidence": conf}
        if t in SCENE_LIFE_TYPES_HIGH_BAR and conf >= 0.85 and sem.get("is_exterior"):
            return {"effect_type": t, "confidence": conf}
        if t in CURTAIN_TYPES and conf >= 0.85 and sem.get("curtain_near_opening"):
            return {"effect_type": t, "confidence": conf}
    return None


def _risk_class_for(asset: dict) -> str:
    sem, ana = asset["semantics"], asset["analysis"]
    if sem.get("is_aerial"):
        return "verified_aerial"
    if sem.get("is_exterior") or sem["scene_type"] in EXTERIOR:
        return "open_exterior"
    return ana.get("risk_class", "normal_interior")


def _scene_class_for_template(asset: dict) -> str:
    st = asset["semantics"]["scene_type"]
    mapping = {
        "facade": "facade", "aerial": "aerial", "view": "view",
        "garden": "garden", "patio": "patio", "pool_exterior": "exterior",
        "balcony": "patio", "other_exterior": "exterior",
        "living_room": "living_room", "kitchen": "kitchen", "dining": "living_room",
        "bedroom": "bedroom", "bathroom": "bathroom", "detail": "detail",
        "stairs": "stairs", "hall": "corridor", "entrance": "corridor",
        "office": "bedroom",
    }
    return mapping.get(st, "living_room")


def _template_allowed(tpl_id: str, tpl: dict, asset: dict) -> bool:
    if tpl.get("requires_verified_aerial") and not asset["semantics"].get("is_aerial"):
        return False
    scene_class = _scene_class_for_template(asset)
    allowed = tpl["allowed_scene_classes"]
    if "any" not in allowed and scene_class not in allowed:
        return False
    if scene_class in tpl.get("forbidden_scene_classes", []):
        return False
    risk = _risk_class_for(asset)
    limits = motion_templates()["risk_class_limits"][risk]
    if tpl["risk_profile"] not in limits["allowed_risk_profiles"]:
        return False
    return True


def assign_templates(ordered: list[dict]) -> list[dict]:
    """Assign camera-motion templates with the FAS 1 sequencing rules."""
    templates = motion_templates()["templates"]
    durations = quality_gates()["shot_durations"]
    n = len(ordered)
    shots = []
    last_directions: list[str] = []
    pushes_since_pull = 0

    for i, asset in enumerate(ordered):
        sem = asset["semantics"]
        is_opening = i == 0
        is_closing = i == n - 1 and n > 1
        is_mid_hero = n >= 7 and i == n // 2 and sem.get("is_hero_candidate")

        life = choose_scene_life(asset)
        if life is not None and not is_opening and not is_closing:
            shots.append(
                {
                    "asset_id": asset["asset_id"],
                    "motion_category": "SCENE_LIFE",
                    "scene_life_effect_type": life["effect_type"],
                    "camera_motion_template": None,
                    "duration_seconds": 4.0,
                    "strength": 0.55,
                    "risk_class": _risk_class_for(asset),
                    "confidence": life["confidence"],
                    "reason": f"Verified {life['effect_type']} candidate "
                    f"(confidence {life['confidence']:.2f}); camera locked.",
                }
            )
            last_directions.append("static")
            continue

        # Camera motion template choice.
        aerial = sem.get("is_aerial", False)
        scene_class = _scene_class_for_template(asset)
        want_pull = pushes_since_pull >= 5 and not is_opening and not is_closing

        candidates: list[str]
        if aerial:
            candidates = ["aerial_push", "aerial_lateral_left", "aerial_lateral_right", "aerial_pullback"]
            if is_closing:
                candidates = ["aerial_pullback", "aerial_push"]
        elif is_opening or is_closing or is_mid_hero:
            candidates = ["strong_push_hero", "gentle_push_in", "diagonal_push_left", "diagonal_push_right"]
        elif want_pull:
            candidates = ["gentle_pull_out", "micro_pull_out"]
        elif scene_class == "facade":
            candidates = ["facade_slide_left", "facade_slide_right", "gentle_push_in"]
        elif scene_class in ("bathroom", "detail"):
            candidates = ["micro_push_in", "micro_pull_out", "stabilized_near_static"]
        else:
            candidates = [
                "gentle_push_in", "diagonal_push_left", "diagonal_push_right",
                "safe_room_arc_left", "safe_room_arc_right", "gentle_pan_left",
                "gentle_pan_right",
            ]

        def direction_of(tpl_id: str) -> str:
            if "left" in tpl_id:
                return "left"
            if "right" in tpl_id:
                return "right"
            if "pull" in tpl_id or "pullback" in tpl_id:
                return "pull"
            return "push"

        chosen = None
        recent = last_directions[-3:]
        for tpl_id in candidates:
            tpl = templates[tpl_id]
            if not _template_allowed(tpl_id, tpl, asset):
                continue
            d = direction_of(tpl_id)
            if len(recent) == 3 and all(r == d for r in recent):
                continue  # never 4 in a row of the same direction
            if d == "pull" and last_directions and last_directions[-1] == "pull":
                continue  # never two pulls in a row
            chosen = tpl_id
            break
        if chosen is None:
            chosen = "micro_push_in" if _template_allowed(
                "micro_push_in", templates["micro_push_in"], asset
            ) else "stabilized_near_static"

        d = direction_of(chosen)
        last_directions.append(d)
        if d == "pull":
            pushes_since_pull = 0
        else:
            pushes_since_pull += 1

        if is_opening or is_closing:
            duration = durations["opening"]
        elif is_mid_hero:
            duration = durations["hero_interior"]
        elif sem.get("is_aerial"):
            duration = durations["exterior"]
        elif sem.get("is_exterior"):
            duration = durations["exterior"]
        elif sem["scene_type"] == "detail":
            duration = durations["detail"]
        else:
            duration = durations["interior"]

        anchor = "START_ANCHOR"
        tpl = templates[chosen]
        if "MIDPOINT_ANCHOR" in tpl["anchor_modes"]:
            occ = asset["analysis"].get("occlusion", {})
            if max(occ.get("risk_left", 1), occ.get("risk_right", 1)) < 0.35:
                anchor = "MIDPOINT_ANCHOR"

        shots.append(
            {
                "asset_id": asset["asset_id"],
                "motion_category": "CAMERA_MOTION",
                "camera_motion_template": chosen,
                "scene_life_effect_type": None,
                "duration_seconds": float(duration),
                "strength": tpl.get("default_strength", 0.6),
                "anchor_mode": anchor,
                "risk_class": _risk_class_for(asset),
                "confidence": float(asset["analysis"]["depth_confidence"]),
                "reason": sem.get("reason", ""),
            }
        )

    return shots


def build_storyboard(
    assets: list[dict],
    length_preference: str = "auto",
    custom_seconds: float | None = None,
) -> dict:
    """assets: [{asset_id, analysis, semantics}]. Returns storyboard proposal."""
    selected, rejected = select_assets(assets)
    ordered = order_assets(selected)
    count = target_shot_count(len(ordered), length_preference, custom_seconds)
    if count < len(ordered):
        # Trim the weakest non-opening/closing assets.
        head, tail = ordered[0], ordered[-1]
        middle = ordered[1:-1]
        middle.sort(key=_score, reverse=True)
        kept_middle = middle[: count - 2]
        kept_ids = {a["asset_id"] for a in kept_middle}
        for a in ordered[1:-1]:
            if a["asset_id"] not in kept_ids:
                rejected.append({"asset_id": a["asset_id"], "reason": "trimmed_for_length"})
        middle_ordered = [a for a in ordered[1:-1] if a["asset_id"] in kept_ids]
        ordered = [head] + middle_ordered + [tail]

    shots = assign_templates(ordered)
    for pos, s in enumerate(shots):
        s["storyboard_position"] = pos
    total = sum(s["duration_seconds"] for s in shots)
    return {
        "shots": shots,
        "rejected": rejected,
        "estimated_duration_seconds": total,
        "length_preference": length_preference,
    }
