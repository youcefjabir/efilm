# -*- coding: utf-8 -*-
import bpy, os

def _coverage(path):
    """Andel av bilden som är vit och ogenomskinlig."""
    try:
        im = bpy.data.images.load(path)
        px = list(im.pixels)
        n = len(px)//4
        c = sum(1 for i in range(n) if px[i*4] > 0.5 and px[i*4+3] > 0.5)
        bpy.data.images.remove(im)
        return c/max(1, n)
    except Exception:
        return 1.0
from . import scene as S
from .scene import bounds

def _out(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)

def render_catalog(objs, path, samples=180):
    from .cams import catalog_cam
    sc = bpy.context.scene
    cam, rad = catalog_cam(objs)
    sc.render.resolution_x = S.CAT_PX
    sc.render.resolution_y = S.CAT_PX
    sc.cycles.samples = samples
    _out(path)
    return rad

def render_top(objs, path, foot_w_cm, foot_d_cm, samples=180):
    from .cams import top_cam
    sc = bpy.context.scene
    cam, w, h = top_cam(objs, foot_w_cm, foot_d_cm)
    sc.cycles.samples = samples
    _out(path)
    return w, h

# ---------------------------------------------------------------------
# MASKER
#
# Samma geometri, samma kamera, bara andra shaders: målmaterialet lyser
# vitt, allt annat svart. Därför KAN masken inte glida ur läge mot bilden
# den hör till — det är samma render, med annan färg.
# ---------------------------------------------------------------------
def _flat(name, val):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission")
    e.inputs[0].default_value = (val, val, val, 1)
    e.inputs[1].default_value = 1.0
    o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(e.outputs[0], o.inputs[0])
    return m

S_ORDER = ("fabric", "pattern", "wood", "metal", "stone")

def groups_present(objs):
    g = []
    for o in objs:
        if o.type != 'MESH': continue
        for s in o.material_slots:
            k = s.material.get("vg_mask") if s.material else None
            if k and k not in g: g.append(k)
    return [x for x in S_ORDER if x in g] + [x for x in g if x not in S_ORDER]

def render_masks(objs, outdir, catcher=None):
    """En fil per materialgrupp som faktiskt finns på modellen. Tomma
       masker skapas aldrig — grupperna läses ur geometrin."""
    sc = bpy.context.scene
    gs = groups_present(objs)
    white, black = _flat("_mask_w", 1.0), _flat("_mask_b", 0.0)
    keep = {}
    for o in objs:
        if o.type == 'MESH':
            keep[o.name] = [s.material for s in o.material_slots]
    lights = [o for o in bpy.data.objects if o.type == 'LIGHT']
    lit = [(l, l.hide_render) for l in lights]
    for l in lights: l.hide_render = True
    cw = catcher.hide_render if catcher else None
    if catcher: catcher.hide_render = True
    old_s, old_b = sc.cycles.samples, sc.cycles.max_bounces
    sc.cycles.samples = 24; sc.cycles.max_bounces = 0
    made = []
    for g in gs:
        for o in objs:
            if o.type != 'MESH': continue
            for i, s in enumerate(o.material_slots):
                orig = keep[o.name][i]
                grp = orig.get("vg_mask") if orig else None
                s.material = white if grp == g else black
        p = os.path.join(outdir, g + ".png")
        _out(p)
        # En mask utan täckning får inte bli en fil. Soffans träben är helt
        # dolda rakt uppifrån, och en tom wood.png i topvyn vore precis den
        # sortens skräp punkt 12 förbjuder.
        cov = _coverage(p)
        if cov < 0.0004:
            os.remove(p)
        else:
            made.append((g, round(cov*100, 3)))
    for o in objs:
        if o.type != 'MESH': continue
        for i, s in enumerate(o.material_slots):
            s.material = keep[o.name][i]
    for l, h in lit: l.hide_render = h
    if catcher: catcher.hide_render = cw
    sc.cycles.samples, sc.cycles.max_bounces = old_s, old_b
    return made
