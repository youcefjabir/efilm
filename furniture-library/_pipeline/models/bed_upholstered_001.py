# -*- coding: utf-8 -*-
"""
bed-upholstered-001 — Scandinavian upholstered bed, 160 × 200

Klädd sänggavel med låg, bred kudde och en klädd ram som går ner till
låga ekben. Gaveln lutar bakåt 4° — tillräckligt för att sitta emot,
inte så mycket att den tar plats i rummet.

Mått 168 × 214 × 96 cm. Madrasshöjd 55.
"""
import math
from lib import build as B, mats
MW, ML = 160.0, 200.0                       # madrassen
W, D, H = MW + 8.0, ML + 14.0, 96.0
LEG_H, FRAME_H = 14.0, 26.0

def build(fabric="light-grey", wood="natural-oak"):
    f = mats.make("fabric", fabric); w = mats.make("wood", wood)
    P = []
    # ram
    P.append(B.box("frame", W, D - 12.0, FRAME_H, (0, -6.0, LEG_H), bevel=2.0, mat=f))
    # madrass
    P.append(B.cushion("mattress", MW, ML, 22.0, (0, -6.0, LEG_H + FRAME_H - 1.0),
                       soft=0.35, sag=0.05, mat=f))
    # gavel
    hb = B.box("headboard", W, 13.0, H - LEG_H, (0, D/2 - 7.0, LEG_H), bevel=2.6, mat=f)
    hb.rotation_euler = (math.radians(-4.0), 0, 0)
    P.append(hb)
    # två kuddar
    for sgn in (-1, 1):
        P.append(B.cushion("pillow_%d" % sgn, MW/2 - 8.0, 42.0, 13.0,
                           (sgn*(MW/4 + 1.0), ML/2 - 32.0, LEG_H + FRAME_H + 19.0),
                           soft=0.9, sag=0.14, mat=f))
    # ben
    for sx in (-1, 1):
        for sy in (-1, 1):
            P.append(B.leg_taper("leg_%d_%d" % (sx, sy), 2.8, 1.8, LEG_H + 1.5,
                                 (sx*(W/2 - 11.0), sy*(D/2 - 16.0), 0), w,
                                 tilt=(-sy*6.0, sx*6.0)))
    return P

META = dict(id="bed-upholstered-001", name="Scandinavian upholstered bed 160",
    category="bedroom", subcategory="beds", style="contemporary-scandinavian",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)),
    mattress_cm=dict(width=int(MW), length=int(ML)), size_presets=["140x200","160x200","180x200"],
    materials=["fabric", "wood"], default_colors=dict(fabric="light-grey", wood="natural-oak"),
    recommended_colors=dict(
        fabric=["cream","sand","beige","taupe","light-grey","medium-grey","charcoal"],
        wood=["light-oak","natural-oak","smoked-oak","walnut"]))
