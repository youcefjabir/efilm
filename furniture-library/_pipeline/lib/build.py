# -*- coding: utf-8 -*-
"""
MODELLERINGSVERKTYG

Skandinaviska möbler är geometriskt enkla: skivor, valsar, koniska ben,
dynor. Det som skiljer en fin möbel från en billig 3D-modell är inte
komplexitet utan KANTERNA. En dyna har ingen skarp kant; ett bordsskiva
har en liten fas; ett ben smalnar av. Verktygen nedan handlar därför
nästan bara om det.

Allt i meter. Funktionerna tar centimeter och räknar om, eftersom möbler
tänks i centimeter.
"""
import bpy, bmesh, math
from mathutils import Vector

def cm(v): return v / 100.0

def _new(name, verts, faces):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate(); me.update()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    return o

def _bm_to(o, bm):
    bm.to_mesh(o.data); bm.free(); o.data.update()

def box(name, w, d, h, loc=(0,0,0), bevel=1.2, seg=3, mat=None, taper=0.0):
    """Rätblock med fasade kanter. bevel i cm. taper krymper toppen —
       används för dynor och koniska stommar."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        sx = 1.0 - (taper if v.co.z > 0 else 0.0)
        v.co.x *= cm(w) * sx; v.co.y *= cm(d) * sx; v.co.z *= cm(h)
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
                        offset=cm(bevel), segments=seg, profile=0.5, affect='EDGES')
    o = _new(name, [], [])
    _bm_to(o, bm)
    o.location = (cm(loc[0]), cm(loc[1]), cm(loc[2]) + cm(h)/2)
    shade_smooth(o, 42)
    if mat: assign(o, mat)
    return o

def cushion(name, w, d, h, loc=(0,0,0), soft=0.42, sag=0.10, mat=None, seam=True):
    """En dyna. Rundade kanter, en aning bredare på mitten och en svag
       insjunkning upptill — det är de tre sakerna som skiljer en dyna
       från ett rätblock."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=6, use_grid_fill=True)
    for v in bm.verts:
        x, y, z = v.co.x*2, v.co.y*2, v.co.z*2       # -1..1
        bulge = 1.0 + soft*0.16*(1.0 - z*z)
        v.co.x = x*0.5*cm(w)*bulge
        v.co.y = y*0.5*cm(d)*bulge
        dip = sag * (1.0 - min(1.0, (x*x + y*y)*0.85))
        v.co.z = (z*0.5 - (dip if z > 0 else 0.0)) * cm(h)
    bmesh.ops.bevel(bm, geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
                    offset=cm(min(w, d, h)*0.20*soft+0.9), segments=4,
                    profile=0.5, affect='EDGES')
    o = _new(name, [], [])
    _bm_to(o, bm)
    o.location = (cm(loc[0]), cm(loc[1]), cm(loc[2]) + cm(h)/2)
    mod = o.modifiers.new("sub", 'SUBSURF'); mod.levels = 1; mod.render_levels = 2
    shade_smooth(o, 55)
    if mat: assign(o, mat)
    return o

def cyl(name, r, h, loc=(0,0,0), verts=48, mat=None, r_top=None, bevel=0.5, zc=False):
    """Vals eller konisk vals. r_top < r ger ett avsmalnande ben.

       zc=True lägger origo i valsens MITT i stället för i dess botten.
       Det behövs så fort valsen ska läggas ner: en liggande vals som
       fått z förskjuten med halva sin LÄNGD hamnar en meter upp i
       luften, vilket är precis vad som hände med den runda soffan."""
    rt = r if r_top is None else r_top
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts,
                          radius1=cm(r), radius2=cm(rt), depth=cm(h))
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
                        offset=cm(bevel), segments=2, profile=0.5, affect='EDGES')
    o = _new(name, [], [])
    _bm_to(o, bm)
    o.location = (cm(loc[0]), cm(loc[1]), cm(loc[2]) + (0 if zc else cm(h)/2))
    shade_smooth(o, 40)
    if mat: assign(o, mat)
    return o

def tube(name, r_out, r_in, h, loc=(0,0,0), verts=48, mat=None):
    o = cyl(name, r_out, h, loc, verts, mat, bevel=0.3)
    i = cyl(name+"_i", r_in, h*1.4, loc, verts, None, bevel=0)
    m = o.modifiers.new("bool", 'BOOLEAN'); m.operation = 'DIFFERENCE'; m.object = i
    i.hide_render = True; i.hide_viewport = True
    return o

def rounded_plate(name, w, d, h, r, loc=(0,0,0), mat=None, seg=6):
    """Skiva med rundade hörn i planet — bordsskivor, sitsar, hyllplan."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= cm(w); v.co.y *= cm(d); v.co.z *= cm(h)
    vert_edges = [e for e in bm.edges
                  if abs(e.verts[0].co.z - e.verts[1].co.z) > cm(h)*0.4]
    bmesh.ops.bevel(bm, geom=vert_edges, offset=cm(r), segments=seg,
                    profile=0.5, affect='EDGES')
    bmesh.ops.bevel(bm, geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
                    offset=cm(min(0.6, h*0.28)), segments=3, profile=0.5, affect='EDGES')
    o = _new(name, [], [])
    _bm_to(o, bm)
    o.location = (cm(loc[0]), cm(loc[1]), cm(loc[2]) + cm(h)/2)
    shade_smooth(o, 46)
    if mat: assign(o, mat)
    return o

def disc(name, r, h, loc=(0,0,0), mat=None, verts=96, bevel=0.5):
    return cyl(name, r, h, loc, verts, mat, bevel=bevel)

def ellipse_plate(name, w, d, h, loc=(0,0,0), mat=None, verts=96):
    o = cyl(name, w/2, h, loc, verts, mat, bevel=min(0.7, h*0.3))
    o.scale = (1.0, d/w, 1.0)
    bpy.context.view_layer.objects.active = o
    o.select_set(True); bpy.ops.object.transform_apply(scale=True)
    o.select_set(False)
    return o

def leg_taper(name, top_r, bot_r, h, loc, mat, tilt=(0,0), verts=24):
    """Ett avsmalnande ben, eventuellt lutat utåt. Lutningen är det som gör
       ett skandinaviskt ben skandinaviskt."""
    o = cyl(name, top_r, h, loc, verts, mat, r_top=bot_r, bevel=0.25)
    o.rotation_euler = (math.radians(tilt[0]), math.radians(tilt[1]), 0)
    return o

def shade_smooth(o, angle_deg=40):
    """Blender 5 tog bort use_auto_smooth; kanter under vinkeln jämnas nu
       med en egen modifierare, som operatorn nedan lägger till."""
    for p in o.data.polygons: p.use_smooth = True
    prev = bpy.context.view_layer.objects.active
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True); bpy.context.view_layer.objects.active = o
    try: bpy.ops.object.shade_auto_smooth(angle=math.radians(angle_deg))
    except Exception: pass
    o.select_set(False)
    if prev: bpy.context.view_layer.objects.active = prev

def assign(o, mat):
    o.data.materials.clear(); o.data.materials.append(mat)

def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    j = bpy.context.object; j.name = name
    return j

def mirror_x(o, name):
    n = o.copy(); n.data = o.data.copy(); n.name = name
    bpy.context.collection.objects.link(n)
    n.location.x = -o.location.x
    n.scale.x = -o.scale.x
    return n
