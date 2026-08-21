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
    # Fasen får ALDRIG vara bredare än rutnätets minsta cell. Kuben är
    # delad i sju steg per axel; en 16 cm hög dyna har alltså 2,3 cm mellan
    # kantslingorna, och en fas på 2,2 cm äter upp hela cellen. Resultatet
    # blir överlappande fasar som läser som en stapel pannkakor. Det var
    # precis det som hände.
    cell = min(w, d, h)/7.0
    off  = min(min(w, d, h)*0.20*soft + 0.9, cell*0.42)
    bmesh.ops.bevel(bm, geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
                    offset=cm(off), segments=4,
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
        # Samma sak för valsen: med 64 segment på radie 11 cm är varje
        # sidoyta 1,1 cm bred, och en fas på 0,5 cm åt vardera hållet äter
        # upp den. Då blir en slät kon räfflad.
        seg_w = 2.0*math.pi*max(r, rt)/max(verts, 3)
        bevel = min(bevel, seg_w*0.30, min(r, rt, h)*0.30)
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

# =====================================================================
# SVEPTA FORMER OCH SÖMMAR
#
# Två saker som V1 saknade och som är precis vad kritiken handlade om.
#
# En rundad soffa byggd av en låda plus två liggande valsar blir rund
# OCH fyrkantig samtidigt. En genuint rundad form måste svepas: ett
# tvärsnitt som följer en kurva i planet, i ett enda stycke.
#
# En söm som är en textur syns inte vid sex bildpunkter per centimeter.
# En söm som är en fysisk fåra gör det. Därför är piping riktig geometri.
# =====================================================================

def _bezier(name, pts, cyclic=False):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'; cu.resolution_u = 12
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(pts)-1)
    for i, (x, y, z) in enumerate(pts):
        bp = sp.bezier_points[i]
        bp.co = (cm(x), cm(y), cm(z))
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    sp.use_cyclic_u = cyclic
    o = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(o)
    return o

def sweep(name, path_pts, prof_w, prof_h, cyclic=False, mat=None,
          taper=None, res=16, profile="oval", corner=None):
    """Sveper ett tvärsnitt längs en kurva i planet.

       profile="oval"  liggande ovalt snitt — en stoppad rulle.
       profile="rrect" rundad rektangel — en stoppad VÄGG.

       Skillnaden är avgörande för hur en rundad soffa läses. Ett ovalt
       snitt på 30 x 34 cm längs en U-kurva ger tre feta valsar som sitter
       ihop; det blir en korv, inte en möbel. En rundad rektangel på
       14 x 46 med 7 cm hörnradie ger i stället ett sammanhängande stoppat
       skal med en vertikal yttersida och en mjukt rundad överkant, vilket
       är vad en riktig rundad loungesoffa faktiskt är."""
    path = _bezier(name + "_path", path_pts, cyclic)
    pc = bpy.data.curves.new(name + "_prof", 'CURVE')
    pc.dimensions = '2D'; pc.resolution_u = 8
    sp = pc.splines.new('BEZIER')
    if profile == "rrect":
        r = cm(corner if corner is not None else min(prof_w, prof_h)*0.5)
        hw, hh = cm(prof_w)/2 - r, cm(prof_h)/2 - r
        pts = []
        for cx, cy, a0 in ((hw, hh, 0), (-hw, hh, 90), (-hw, -hh, 180), (hw, -hh, 270)):
            for k in range(4):
                a = math.radians(a0 + k*30.0)
                pts.append((cx + math.cos(a)*r, cy + math.sin(a)*r))
        sp.bezier_points.add(len(pts)-1)
        for i, (x, y) in enumerate(pts):
            bp = sp.bezier_points[i]
            bp.co = (x, y, 0)
            bp.handle_left_type = bp.handle_right_type = 'AUTO'
    else:
        n = 12
        sp.bezier_points.add(n-1)
        for i in range(n):
            a = 2*math.pi*i/n
            bp = sp.bezier_points[i]
            bp.co = (math.cos(a)*cm(prof_w)/2, math.sin(a)*cm(prof_h)/2, 0)
            bp.handle_left_type = bp.handle_right_type = 'AUTO'
    sp.use_cyclic_u = True
    prof = bpy.data.objects.new(name + "_prof", pc)
    bpy.context.collection.objects.link(prof)
    path.data.bevel_mode = 'OBJECT'
    path.data.bevel_object = prof
    path.data.use_fill_caps = True
    if taper is not None:
        # Taper-kurvans Y ÄR skalfaktorn, i blenderenheter. _bezier räknar
        # om centimeter till meter, så en faktor 0,7 blev 0,007 och
        # kollapsade hela formen. Värdena skalas därför upp först.
        tp = _bezier(name + "_taper", [(x, y*100.0, z) for x, y, z in taper], False)
        path.data.taper_object = tp
        tp.hide_render = True; tp.hide_viewport = True
    prof.hide_render = True; prof.hide_viewport = True
    # gör om till mesh så maskrendering och mätning fungerar likadant
    bpy.context.view_layer.objects.active = path
    bpy.ops.object.select_all(action='DESELECT'); path.select_set(True)
    bpy.ops.object.convert(target='MESH')
    o = bpy.context.object; o.name = name
    shade_smooth(o, 55)
    if mat: assign(o, mat)
    return o

def piping(name, w, d, h, r, loc=(0,0,0), thick=1.1, mat=None):
    """En söm runt en dynas kant, som fysisk geometri. Vid planritningens
       skala är det den som gör att en dyna läses som en klädd dyna."""
    hw, hd, rr = w/2 - r, d/2 - r, r
    pts = []
    for cx, cy, a0 in ((hw, hd, 0), (-hw, hd, 90), (-hw, -hd, 180), (hw, -hd, 270)):
        for k in range(5):
            a = math.radians(a0 + k*22.5)
            pts.append((cx + math.cos(a)*rr, cy + math.sin(a)*rr, 0))
    pts = [(x + loc[0], y + loc[1], loc[2] + h) for x, y, _ in pts]
    return sweep(name, pts, thick, thick*0.72, cyclic=True, mat=mat)

def channel_tufting(name, w, h, t, n, loc, mat, gap=0.9):
    """Lodräta kanaler i en stoppad gavel. Varje kanal är en egen svagt
       buktande panel — det är mellanrummen som syns uppifrån."""
    out = []
    cw = (w - gap*(n-1))/n
    for i in range(n):
        x = -w/2 + cw/2 + i*(cw + gap)
        p = box(name + "_%d" % i, cw, t, h, (loc[0] + x, loc[1], loc[2]),
                bevel=min(1.6, cw*0.16), seg=4, mat=mat)
        out.append(p)
    return out
