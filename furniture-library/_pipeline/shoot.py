# -*- coding: utf-8 -*-
"""Renderar EN modell: katalog, top och masker, ur samma mastermodell."""
import sys, os, importlib, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from lib import scene, mats, build, render
from lib.scene import bounds

def shoot(modname, outdir, cat_s=180, top_s=180, do_masks=True, scale=100):
    scene.nuke()
    sc = scene.setup_render()
    sc.render.resolution_percentage = scale
    scene.world_gradient()
    mod = importlib.import_module("models." + modname)
    importlib.reload(mod)
    parts = mod.build()
    lo, hi = bounds(parts)
    rad = max((hi-lo).length/2, .2)
    catch = scene.shadow_catcher(rad)
    os.makedirs(outdir, exist_ok=True)
    M = mod.META
    fw, fd = M["footprint_cm"]["width"], M["footprint_cm"]["depth"]

    # Katalogvyn och dess masker — samma kamera, alltså exakt samma utsnitt.
    lights = scene.three_point(rad)
    sc.render.resolution_percentage = scale
    render.render_catalog(parts, os.path.join(outdir, "catalog"), cat_s)
    mc = render.render_masks(parts, os.path.join(outdir, "masks", "catalog"), catch) \
         if do_masks else []
    for l in lights: bpy.data.objects.remove(l, do_unlink=True)

    # Topvyn och dess masker.
    lights = scene.top_light(rad)
    w, h = render.render_top(parts, os.path.join(outdir, "top"), fw, fd, top_s)
    mt = render.render_masks(parts, os.path.join(outdir, "masks", "top"), catch) \
         if do_masks else []
    made = dict(catalog=mc, top=mt)
    # verkligt mått ur geometrin, inte ur metadatan
    real = dict(width=round((hi.x-lo.x)*100, 1), depth=round((hi.y-lo.y)*100, 1),
                height=round((hi.z-lo.z)*100, 1))
    return dict(meta=M, top_px=[w, h], masks=made, measured_cm=real,
                catalog_px=[int(sc.render.resolution_x), int(sc.render.resolution_y)])

if __name__ == "__main__":
    r = shoot(sys.argv[1], sys.argv[2],
              int(sys.argv[3]) if len(sys.argv) > 3 else 180,
              int(sys.argv[4]) if len(sys.argv) > 4 else 180,
              (sys.argv[5] != "nomask") if len(sys.argv) > 5 else True,
              int(sys.argv[6]) if len(sys.argv) > 6 else 100)
    print(json.dumps({k: r[k] for k in ("top_px","masks","measured_cm")}, ensure_ascii=False))
