# -*- coding: utf-8 -*-
"""Kamerorna. Båda tittar på samma geometri; det är hela poängen."""
import bpy, math
from mathutils import Vector
from .scene import (PX_PER_CM, TOP_PAD_CM, CAT_PX, CAT_AZIM, CAT_ELEV,
                    CAT_LENS, CAT_FILL, bounds)

def _cam(name, typ):
    d = bpy.data.cameras.new(name); d.type = typ
    o = bpy.data.objects.new(name, d)
    bpy.context.collection.objects.link(o)
    return o

def catalog_cam(objs):
    """3/4-perspektiv. Vinkeln är låst; bara AVSTÅNDET räknas om per objekt,
       ur den omslutande sfären, så marginalen blir densamma för en pall
       som för en fyrsitssoffa."""
    lo, hi = bounds(objs)
    ctr = (lo + hi) / 2
    rad = max((hi - lo).length / 2, 0.15)
    cam = _cam("cam_catalog", 'PERSP')
    cam.data.lens = CAT_LENS
    cam.data.sensor_width = 36.0
    half_fov = math.atan(18.0 / CAT_LENS)
    dist = rad / (math.sin(half_fov) * CAT_FILL)
    az, el = math.radians(CAT_AZIM), math.radians(CAT_ELEV)
    cam.location = ctr + Vector((math.sin(az)*math.cos(el),
                                 -math.cos(az)*math.cos(el),
                                 math.sin(el))) * dist
    # rikta mot en punkt strax under mitten: möbler läses bättre en aning ovanifrån
    look = ctr - Vector((0, 0, rad*0.06))
    d = look - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam
    return cam, rad

def top_cam(objs, foot_w_cm, foot_d_cm):
    """Sann ortografisk projektion rakt ner. Ingen lutning, ingen perspektiv-
       förkortning: en rektangulär möbel får en geometriskt korrekt fotavtryck.
       Skalan är låst till PX_PER_CM för hela biblioteket."""
    lo, hi = bounds(objs)
    ctr = (lo + hi) / 2
    w_cm = foot_w_cm + 2*TOP_PAD_CM
    d_cm = foot_d_cm + 2*TOP_PAD_CM
    px_w = int(round(w_cm * PX_PER_CM))
    px_h = int(round(d_cm * PX_PER_CM))
    cam = _cam("cam_top", 'ORTHO')
    cam.data.ortho_scale = max(w_cm, d_cm) / 100.0        # meter
    cam.location = (ctr.x, ctr.y, hi.z + 4.0)
    cam.rotation_euler = (0.0, 0.0, 0.0)                  # exakt 90° uppifrån
    sc = bpy.context.scene
    sc.camera = cam
    sc.render.resolution_x = px_w
    sc.render.resolution_y = px_h
    # ortho_scale gäller den längsta sidan; se till att bredden stämmer
    if px_w >= px_h:
        cam.data.ortho_scale = w_cm / 100.0
    else:
        cam.data.ortho_scale = d_cm / 100.0
    return cam, px_w, px_h
