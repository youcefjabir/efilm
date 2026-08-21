# -*- coding: utf-8 -*-
"""
GEOMETRISANERING

En rekonstruktion ur ETT foto gissar baksidan. Gissningen blir aldrig
riktigt lik framsidan, och mätningen visade 0,7 till 1,6 procents
snedhet — på en 240 cm soffa nästan två centimeter. Det syns.

Tre ingrepp, alla utan kostnad:

SPEGLING     Nästan varje möbel är spegelsymmetrisk kring sin mittlinje.
             Meshen kapas i mittplanet, den bättre halvan behålls och
             speglas. Felet blir per definition noll, och den sämre
             gissade halvan försvinner. Det är exakt vad en modellerare
             gör för hand.

PLANUTJÄMNING Nästan plana ytor slås ihop till faktiskt plana. En
             bordsskiva ska vara en skiva, inte ett böljande fält.

RIKTNING     Meshen vrids så dess dominerande vertikala ytor ligger
             parallellt med axlarna. En soffa vars framsida lutar två
             grader ger ett snedställt fotavtryck på planritningen.
"""
import math, bmesh, bpy, numpy as np
from mathutils import Vector

def _bbox(P):
    lo = Vector((1e9,)*3); hi = Vector((-1e9,)*3)
    for o in P:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            lo = Vector(min(lo[i], w[i]) for i in range(3))
            hi = Vector(max(hi[i], w[i]) for i in range(3))
    return lo, hi

def join_all(P, name="master"):
    if len(P) == 1:
        P[0].name = name; return P[0]
    bpy.ops.object.select_all(action='DESELECT')
    for o in P: o.select_set(True)
    bpy.context.view_layer.objects.active = P[0]
    bpy.ops.object.join()
    o = bpy.context.object; o.name = name
    return o

def yaw_align(o, step=0.5, span=14.0):
    """Vrid runt Z tills de lodräta ytorna ligger så axelparallellt som
       möjligt. Söker bara några grader — meshen är redan grovt riktad."""
    me = o.data; me.calc_loop_triangles()
    M = np.array(o.matrix_world.to_4x4())
    vs = np.empty((len(me.vertices), 3), np.float64)
    me.vertices.foreach_get("co", vs.reshape(-1))
    vs = vs @ M[:3, :3].T + M[:3, 3]
    idx = np.array([t.vertices[:] for t in me.loop_triangles], dtype=np.int64)
    if len(idx) == 0: return 0.0
    a, b, c = vs[idx[:,0]], vs[idx[:,1]], vs[idx[:,2]]
    cr = np.cross(b-a, c-a); ar = np.linalg.norm(cr, axis=1)
    ok = ar > 1e-12
    n = cr[ok]/ar[ok, None]; w = ar[ok]*0.5
    vert = np.abs(n[:, 2]) < 0.35            # bara lodräta ytor bär riktningen
    n, w = n[vert], w[vert]
    if len(n) < 20: return 0.0
    best, bang = -1.0, 0.0
    for k in range(int(-span/step), int(span/step)+1):
        t = math.radians(k*step); ct, st = math.cos(t), math.sin(t)
        nx = n[:,0]*ct - n[:,1]*st; ny = n[:,0]*st + n[:,1]*ct
        score = (w*np.maximum(np.abs(nx), np.abs(ny))**6).sum()
        if score > best: best, bang = score, k*step
    if abs(bang) > 1e-6:
        o.rotation_euler.z += math.radians(bang)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True)
        bpy.ops.object.transform_apply(rotation=True)
    return bang

def symmetrise(o):
    """Kapa i mittplanet, behåll den halva med störst yta, spegla den."""
    lo, hi = _bbox([o])
    cx = (lo.x + hi.x)/2
    o.location.x -= cx
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True)
    bpy.ops.object.transform_apply(location=True)

    def half_area(sign):
        me = o.data; me.calc_loop_triangles()
        vs = np.empty((len(me.vertices), 3), np.float64)
        me.vertices.foreach_get("co", vs.reshape(-1))
        tot = 0.0
        for t in me.loop_triangles:
            p = vs[list(t.vertices)]
            if np.sign(p[:,0].mean()) == sign:
                tot += float(np.linalg.norm(np.cross(p[1]-p[0], p[2]-p[0]))*0.5)
        return tot
    keep = 1 if half_area(1) >= half_area(-1) else -1

    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.bisect_plane(bm, geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
                           plane_co=(0,0,0), plane_no=(1,0,0),
                           clear_inner=(keep > 0), clear_outer=(keep < 0))
    bm.to_mesh(o.data); bm.free(); o.data.update()

    m = o.modifiers.new("spegel", 'MIRROR')
    m.use_axis = (True, False, False)
    m.use_clip = True; m.use_mirror_merge = True; m.merge_threshold = 0.002
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier=m.name)
    return keep

def planarise(o, angle_deg=4.0):
    """Slå ihop nästan plana ytor till plana."""
    m = o.modifiers.new("plan", 'DECIMATE')
    m.decimate_type = 'DISSOLVE'
    m.angle_limit = math.radians(angle_deg)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier=m.name)

def clean(P, do_yaw=True, do_sym=True, do_plan=True, plan_deg=4.0):
    o = join_all(P)
    info = {}
    if do_yaw:  info["yaw_deg"] = round(yaw_align(o), 2)
    if do_sym:  info["kept_half"] = symmetrise(o)
    if do_plan: planarise(o, plan_deg)
    return [o], info
