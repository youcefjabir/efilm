"""CLI for running individual pipeline stages locally (development/tests).

Examples:
  python3 -m pms_worker.cli depth photo.jpg out_depth.png
  python3 -m pms_worker.cli analyze photo.jpg
  python3 -m pms_worker.cli camera photo.jpg out.mp4 --template gentle_push_in
  python3 -m pms_worker.cli scenelife photo.jpg out.mp4 --effect pool_water
  python3 -m pms_worker.cli storyboard dir_with_images/
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np


def main() -> None:
    p = argparse.ArgumentParser(prog="pms-worker")
    sub = p.add_subparsers(dest="cmd", required=True)

    d = sub.add_parser("depth")
    d.add_argument("image")
    d.add_argument("out")
    d.add_argument("--provider", default=None)

    a = sub.add_parser("analyze")
    a.add_argument("image")

    c = sub.add_parser("camera")
    c.add_argument("image")
    c.add_argument("out")
    c.add_argument("--template", default="gentle_push_in")
    c.add_argument("--strength", type=float, default=None)
    c.add_argument("--duration", type=float, default=None)
    c.add_argument("--risk-class", default="normal_interior")
    c.add_argument("--anchor", default=None)
    c.add_argument("--preview", action="store_true")

    s = sub.add_parser("scenelife")
    s.add_argument("image")
    s.add_argument("out")
    s.add_argument("--effect", default="pool_water")
    s.add_argument("--mask", default=None)
    s.add_argument("--strength", type=float, default=0.5)
    s.add_argument("--duration", type=float, default=4.0)
    s.add_argument("--preview", action="store_true")

    b = sub.add_parser("storyboard")
    b.add_argument("directory")
    b.add_argument("--length", default="auto")

    args = p.parse_args()

    if args.cmd == "depth":
        from .depth import get_depth_provider

        img = cv2.imread(args.image)
        res = get_depth_provider(args.provider).estimate(img)
        vis = (res.edge_aware_smoothed(img) * 255).astype(np.uint8)
        cv2.imwrite(args.out, cv2.applyColorMap(vis, cv2.COLORMAP_INFERNO))
        print(json.dumps({"provider": res.provider, "confidence": res.confidence, "meta": res.meta}, indent=2))

    elif args.cmd == "analyze":
        from .director.asset_analysis import analyze_asset

        img = cv2.imread(args.image)
        print(json.dumps(analyze_asset(img), indent=2, default=float))

    elif args.cmd == "camera":
        from .pipeline import render_camera_motion_shot

        img = cv2.imread(args.image)
        res = render_camera_motion_shot(
            img, args.template, args.out,
            duration_seconds=args.duration, strength=args.strength,
            anchor_mode=args.anchor, risk_class=args.risk_class, preview=args.preview,
        )
        print(json.dumps({
            "ok": res.ok, "skipped": res.skipped, "render_seconds": round(res.render_seconds, 1),
            "attempts": [a.get("outcome") for a in res.attempts],
            "final_plan": res.final_plan,
            "quality": res.quality_report,
        }, indent=2, default=float))
        sys.exit(0 if res.ok else 1)

    elif args.cmd == "scenelife":
        from .perception.masks import propose_all
        from .pipeline import render_scene_life_shot

        img = cv2.imread(args.image)
        if args.mask:
            mask = cv2.imread(args.mask, cv2.IMREAD_GRAYSCALE)
            mask = (mask > 127).astype(np.uint8) * 255
        else:
            props = [pr for pr in propose_all(img) if pr.effect_type == args.effect]
            if not props:
                print(json.dumps({"ok": False, "error": "no mask proposal found"}))
                sys.exit(1)
            mask = props[0].mask
        res = render_scene_life_shot(
            img, mask, args.effect, args.out,
            duration_seconds=args.duration, strength=args.strength, preview=args.preview,
        )
        print(json.dumps({
            "ok": res.ok, "category": res.category,
            "render_seconds": round(res.render_seconds, 1),
            "attempts": [a.get("outcome") for a in res.attempts],
            "quality": res.quality_report,
        }, indent=2, default=float))
        sys.exit(0 if res.ok else 1)

    elif args.cmd == "storyboard":
        from .director.asset_analysis import analyze_asset
        from .director.semantic import apply_hard_rules, get_director
        from .director.storyboard import build_storyboard

        director = get_director()
        assets = []
        for f in sorted(Path(args.directory).iterdir()):
            if f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
                continue
            img = cv2.imread(str(f))
            if img is None:
                continue
            analysis = analyze_asset(img)
            semantics = apply_hard_rules(director.classify(img, analysis), analysis)
            assets.append({"asset_id": f.name, "analysis": analysis, "semantics": semantics})
        sb = build_storyboard(assets, length_preference=args.length)
        print(json.dumps(sb, indent=2, default=float))


if __name__ == "__main__":
    main()
