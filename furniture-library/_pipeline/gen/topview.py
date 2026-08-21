# -*- coding: utf-8 -*-
"""
TOPVY UR MASTERMESHEN

Katalogbilden är fotot. Topvyn måste vara SAMMA fysiska föremål, och det
är därför den renderas ur den mesh som rekonstruerats ur just det fotot —
inte genereras som en andra bild. Det är hela skillnaden mot att be en
bildmodell om "samma soffa uppifrån".

Tre saker normaliseras innan renderingen:

ORIENTERING  längsta vågräta måttet till X, ryggen mot +Y. Ryggen hittas
             genom att jämföra medelhöjden i främre och bakre halvan.
SKALA        varje axel till sitt verkliga centimetermått. Registret är
             källan till sanning, inte meshen.
PLACERING    centrerad i planet, stående på golvet.

Texturen från rekonstruktionen är ett BAKAT foto: den innehåller redan
ljus och skuggor. Lyser man på den igen blir den mörk och grötig. Den
blandas därför till största delen som emission, med en diffus andel kvar
så formen får skuggning och kontaktskuggan fungerar.
"""
import sys, os, math, json
sys.path.insert(0, "/home/user/efilm/furniture-library/_pipeline")
import bpy
from mathutils import Vector
from lib import scene, studio
from gen import cleanup as CL
from lib.scene import PX_PER_CM, TOP_PAD_CM

EMISSION = 0.72

def _bounds(P):
    return scene.bounds(P)

def prepare(glb, W, D, H):
    bpy.ops.import_scene.gltf(filepath=glb)
    P = [o for o in bpy.data.objects if o.type == 'MESH']
    if not P: raise SystemExit("tom mesh: " + glb)
    for o in P: o.select_set(True)
    bpy.context.view_layer.objects.active = P[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    lo, hi = _bounds(P); d = hi - lo
    def apply_rot(deg):
        for o in P: o.rotation_euler.z += math.radians(deg)
        bpy.context.view_layer.objects.active = P[0]
        for o in P: o.select_set(True)
        bpy.ops.object.transform_apply(rotation=True)
    if d.y > d.x: apply_rot(90)

    lo, hi = _bounds(P); ymid = (lo.y + hi.y)/2
    back = front = 0.0; nb = nf = 0
    for o in P:
        mw = o.matrix_world
        for v in o.data.vertices:
            w = mw @ v.co
            if w.y >= ymid: back += w.z; nb += 1
            else: front += w.z; nf += 1
    if nb and nf and (front/nf) > (back/nb): apply_rot(180)

    lo, hi = _bounds(P); d = hi - lo
    s = Vector((W/100.0/max(d.x,1e-6), D/100.0/max(d.y,1e-6), H/100.0/max(d.z,1e-6)))
    for o in P: o.scale = s
    bpy.context.view_layer.objects.active = P[0]
    for o in P: o.select_set(True)
    bpy.ops.object.transform_apply(scale=True)
    lo, hi = _bounds(P); c = (lo + hi)/2
    for o in P: o.location -= Vector((c.x, c.y, lo.z))
    bpy.context.view_layer.update()
    return P

def bake_shading():
    for m in bpy.data.materials:
        if not m.node_tree: continue
        nt = m.node_tree
        b = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        tex = next((n for n in nt.nodes if n.type == 'TEX_IMAGE'), None)
        out = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None)
        if not (b and tex and out): continue
        b.inputs['Roughness'].default_value = 0.62
        em = nt.nodes.new("ShaderNodeEmission")
        nt.links.new(tex.outputs['Color'], em.inputs['Color'])
        mx = nt.nodes.new("ShaderNodeMixShader")
        mx.inputs[0].default_value = EMISSION
        nt.links.new(b.outputs[0], mx.inputs[1])
        nt.links.new(em.outputs[0], mx.inputs[2])
        nt.links.new(mx.outputs[0], out.inputs['Surface'])

def _clean_alpha(path, floor=0.10, ceil=0.92):
    """Rester av den breda skuggan bort. Under floor blir alfa noll, och
       resten sträcks ut igen så kontaktskuggan behåller sin styrka."""
    from PIL import Image
    import numpy as np
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).astype(np.float32)
    al = a[..., 3]/255.0
    al = np.clip((al - floor)/max(ceil - floor, 1e-6), 0.0, 1.0)
    a[..., 3] = al*255.0
    Image.fromarray(a.astype(np.uint8)).save(path)

_WSTR = 0.0

def shoot(glb, outdir, W, D, H, samples=120, qa=True):
    global _WSTR
    scene.nuke()
    sc = scene.setup_render(samples=samples)
    sc.cycles.adaptive_threshold = 0.02
    studio.studio_world()
    _WSTR = bpy.context.scene.world.node_tree.nodes["Background"].inputs['Strength'].default_value
    P = prepare(glb, W, D, H)
    # Sanera FÖRE mätningen: spegling, planutjämning och riktning. Mätt
    # sänker det symmetrifelet från omkring 1,2 procent till under 0,01.
    P, cinfo = CL.clean(P)
    # skalan kan ha ändrats en aning av speglingen — normalisera om
    lo, hi = _bounds(P); d = hi - lo
    from mathutils import Vector as V
    s2 = V((W/100.0/max(d.x,1e-6), D/100.0/max(d.y,1e-6), H/100.0/max(d.z,1e-6)))
    for o in P: o.scale = s2
    bpy.context.view_layer.objects.active = P[0]
    for o in P: o.select_set(True)
    bpy.ops.object.transform_apply(scale=True)
    lo, hi = _bounds(P); c = (lo + hi)/2
    for o in P: o.location -= V((c.x, c.y, lo.z))
    bpy.context.view_layer.update()
    bake_shading()
    lo, hi = _bounds(P)
    meas = dict(width=round((hi.x-lo.x)*100,1), depth=round((hi.y-lo.y)*100,1),
                height=round((hi.z-lo.z)*100,1))
    rad = max((hi-lo).length/2, .2)
    scene.shadow_catcher(rad)
    os.makedirs(outdir, exist_ok=True)

    # Skuggfångaren mätte 21 % alfa ända ut i hörnen. Orsaken är att
    # miljön lyser brett och möbeln skymmer en stor del av himlen även en
    # bit ifrån sig — fysikaliskt riktigt, men på en planritning blir det
    # en grå tvätt över hela rutan i stället för en kontaktskugga. I
    # topvyn stängs världen därför av som ljuskälla; riggens lampor ger
    # all exponering, och materialet är till största delen emission ändå.
    bpy.context.scene.world.node_tree.nodes["Background"].inputs['Strength'].default_value = 0.0
    from lib.cams import top_cam
    scene.top_light(rad)
    cam, w, h = top_cam(P, W, D)
    sc.cycles.samples = samples
    sc.render.filepath = os.path.join(outdir, "top")
    bpy.ops.render.render(write_still=True)
    _clean_alpha(os.path.join(outdir, "top.png"))

    qa_px = None
    if qa:
        bpy.context.scene.world.node_tree.nodes["Background"].inputs['Strength'].default_value = _WSTR
        for l in [o for o in bpy.data.objects if o.type == 'LIGHT']:
            bpy.data.objects.remove(l, do_unlink=True)
        scene.three_point(rad)
        from lib.cams import catalog_cam
        catalog_cam(P)
        sc.render.resolution_x = sc.render.resolution_y = 700
        sc.cycles.samples = max(60, samples//2)
        sc.render.filepath = os.path.join(outdir, "qa_catalog")
        bpy.ops.render.render(write_still=True)
        qa_px = 700
    from gen import measure as MS
    return dict(top_px=[w, h], measured_cm=meas, px_per_cm=PX_PER_CM,
                pad_cm=TOP_PAD_CM, qa_px=qa_px, cleanup=cinfo,
                geometry=MS.measure(P))

if __name__ == "__main__":
    glb, out, W, D, H = sys.argv[-5], sys.argv[-4], float(sys.argv[-3]), float(sys.argv[-2]), float(sys.argv[-1])
    r = shoot(glb, out, W, D, H)
    print("RESULT " + json.dumps(r))
