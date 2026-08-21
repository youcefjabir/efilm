# -*- coding: utf-8 -*-
"""
PRODUKTION — Phase 1

Renderar varje mastermodell en gång och skriver ut hela paketet:
mappstruktur, katalogvy, topvy, masker per vy, metadata och index.

Måtten i metadatan är MÄTTA ur geometrin, inte skrivna för hand. Det är
enda sättet att svara ärligt på punkt 47: stämmer fotavtrycket med
tillgången? Designens avsedda mått står kvar som design_intent_cm så
avvikelser går att se.
"""
import sys, os, json, importlib, shutil, math, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from PIL import Image
from lib import scene, mats, build, render, studio
from lib.scene import bounds, PX_PER_CM, TOP_PAD_CM

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

JOBS = [
 # (modul, variant eller None)
 ("sofa_scandi_001",          None),
 ("sofa_rounded_002",         None),
 ("sofa_japandi_003",         None),
 ("sofa_modular_004",         "straight"),
 ("sofa_modular_004",         "chaise-left"),
 ("sofa_modular_004",         "chaise-right"),
 ("armchair_lounge_001",      None),
 ("armchair_soft_002",        None),
 ("table_dining_oval_001",    None),
 ("table_dining_round_002",   None),
 ("bed_upholstered_001",      None),
 ("bed_wood_002",             None),
 ("rug_scandinavian_wool_001",None),
 ("rug_berber_002",           None),
 ("rug_contemporary_003",     None),
 ("desk_scandinavian_001",    None),
 ("outdoor_lounge_chair_001", None),
]

def webp(src, dst, q=92):
    im = Image.open(src)
    im.save(dst, "WEBP", quality=q, method=6, lossless=False, exact=True)
    os.remove(src)

def one(modname, variant, cat_s, top_s):
    scene.nuke()
    sc = scene.setup_render()
    studio.studio_world()
    mod = importlib.import_module("models." + modname)
    importlib.reload(mod)
    parts = mod.build(variant) if variant else mod.build()
    M = dict(mod.meta(variant) if variant else mod.META)

    lo, hi = bounds(parts)
    rad = max((hi - lo).length / 2, 0.2)
    meas = dict(width=round((hi.x-lo.x)*100), depth=round((hi.y-lo.y)*100),
                height=round((hi.z-lo.z)*100))
    intent = dict(M["dimensions_cm"])

    folder = os.path.join(M["category"], M["subcategory"], M["id"])
    out = os.path.join(ROOT, folder)
    if os.path.isdir(out): shutil.rmtree(out)
    os.makedirs(out, exist_ok=True)

    catch = scene.shadow_catcher(rad)
    lights = scene.three_point(rad)
    render.render_catalog(parts, os.path.join(out, "catalog"), cat_s)
    cat_px = [sc.render.resolution_x, sc.render.resolution_y]
    mc = render.render_masks(parts, os.path.join(out, "masks", "catalog"), catch)
    for l in lights: bpy.data.objects.remove(l, do_unlink=True)

    scene.top_light(rad)
    fw, fd = meas["width"], meas["depth"]
    w, h = render.render_top(parts, os.path.join(out, "top"), fw, fd, top_s)
    mt = render.render_masks(parts, os.path.join(out, "masks", "top"), catch)

    webp(os.path.join(out, "catalog.png"), os.path.join(out, "catalog.webp"))
    webp(os.path.join(out, "top.png"),     os.path.join(out, "top.webp"))
    for d in ("catalog", "top"):
        p = os.path.join(out, "masks", d)
        if os.path.isdir(p) and not os.listdir(p): os.rmdir(p)
    mp = os.path.join(out, "masks")
    if os.path.isdir(mp) and not os.listdir(mp): os.rmdir(mp)

    M["dimensions_cm"] = meas
    M["footprint_cm"]  = dict(width=meas["width"], depth=meas["depth"])
    M["design_intent_cm"] = intent
    M["assets"] = dict(
        catalog=dict(file="catalog.webp", px=cat_px, background="transparent",
                     camera="perspective-85mm", angle_deg=dict(azimuth=scene.CAT_AZIM,
                                                               elevation=scene.CAT_ELEV)),
        top=dict(file="top.webp", px=[w, h], background="transparent",
                 camera="orthographic", px_per_cm=PX_PER_CM,
                 padding_cm=TOP_PAD_CM,
                 footprint_px=[round(meas["width"]*PX_PER_CM),
                               round(meas["depth"]*PX_PER_CM)]),
        masks={k: [dict(material=g, file="masks/%s/%s.png" % (k, g), coverage_pct=c)
                   for g, c in v] for k, v in
               (("catalog", mc), ("top", mt)) if v})
    M["variant"] = variant
    with open(os.path.join(out, "metadata.json"), "w", encoding="utf-8") as fh:
        json.dump(M, fh, ensure_ascii=False, indent=2)
    return M, folder

def run(cat_s=96, top_s=80, only=None):
    idx = []
    for i, (m, v) in enumerate(JOBS):
        if only and m not in only: continue
        t0 = time.time()
        M, folder = one(m, v, cat_s, top_s)
        idx.append(dict(id=M["id"], name=M["name"], category=M["category"],
                        subcategory=M["subcategory"], style=M["style"],
                        folder=folder.replace(os.sep, "/") + "/",
                        dimensions_cm=M["dimensions_cm"],
                        footprint_cm=M["footprint_cm"],
                        materials=M["materials"],
                        variant=M.get("variant")))
        print("[%2d/%2d] %-34s %5.0f s  %s" % (i+1, len(JOBS), M["id"],
              time.time()-t0, M["dimensions_cm"]), flush=True)
    return idx

if __name__ == "__main__":
    only = sys.argv[3:] or None
    idx = run(int(sys.argv[1]) if len(sys.argv) > 1 else 96,
              int(sys.argv[2]) if len(sys.argv) > 2 else 80, only)
    with open(os.path.join(ROOT, "_index_partial.json"), "w", encoding="utf-8") as fh:
        json.dump(idx, fh, ensure_ascii=False, indent=2)
    print("KLART", len(idx), "modeller")
