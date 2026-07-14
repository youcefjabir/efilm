# Models

Not committed to git (~99 MB). Fetch before first run:

```bash
python3 scripts/fetch_models.py
```

Downloads `depth_anything_v2_vits.onnx` (Depth Anything V2 Small, ONNX
export) here. The Docker worker image (`infrastructure/Dockerfile.worker`)
runs this automatically at build time.

Without this file the worker falls back to a deterministic geometric depth
provider (vanishing-point heuristic). That fallback never crashes the
renderer, but it has no notion of individual objects — camera-motion
parallax computed from it is not spatially coherent with the actual scene.
Always run this script before evaluating render quality.
