# -*- coding: utf-8 -*-
"""
outdoor-lounge-chair-001 — Scandinavian outdoor lounge chair

Ribbad sits och rygg i ljus teaklook på en enkel ram, med en lös
sittdyna i utomhustyg. Ribborna är verklig geometri och inte en textur
— de syns i topvyn, och det är det som gör att stolen läses som en
utemöbel på en balkongritning.

Mått 70 × 78 × 72 cm. Sitthöjd 39.
"""
import math
from lib import build as B, mats
W, D, H = 70.0, 78.0, 72.0
LEG = 4.0
SEAT_Z = 35.0
SLAT_W, SLAT_GAP = 5.0, 1.6

def build(wood="light-oak", fabric="light-grey"):
    w = mats.make("wood", wood); f = mats.make("fabric", fabric)
    P = []
    for sx in (-1, 1):
        x = sx*(W/2 - LEG/2)
        P.append(B.box("legf_%d" % sx, LEG, LEG, SEAT_Z, (x, -(D/2 - 6.0), 0),
                       bevel=0.4, mat=w))
        bl = B.box("legb_%d" % sx, LEG, LEG, H - 8.0, (x, D/2 - 8.0, 0), bevel=0.4, mat=w)
        bl.rotation_euler = (math.radians(8.0), 0, 0)
        P.append(bl)
        P.append(B.box("armr_%d" % sx, LEG, D - 14.0, 3.2, (x, -1.0, 55.0), bevel=0.5, mat=w))
    # sittribbor
    inner_d = D - 20.0
    n = int(inner_d // (SLAT_W + SLAT_GAP))
    for i in range(n):
        y = -inner_d/2 + SLAT_W/2 + i*(SLAT_W + SLAT_GAP) - 2.0
        P.append(B.box("slat_s%d" % i, W - 2*LEG - 2.0, SLAT_W, 2.2, (0, y, SEAT_Z - 2.2),
                       bevel=0.35, mat=w))
    # ryggribbor
    bn = 6
    for i in range(bn):
        z = SEAT_Z + 6.0 + i*(SLAT_W + SLAT_GAP)
        s = B.box("slat_b%d" % i, W - 2*LEG - 2.0, 2.2, SLAT_W,
                  (0, D/2 - 11.0 + (z - SEAT_Z)*0.14, z), bevel=0.35, mat=w)
        s.rotation_euler = (math.radians(8.0), 0, 0)
        P.append(s)
    P.append(B.cushion("pad", W - 2*LEG - 4.0, inner_d - 2.0, 7.0, (0, -2.0, SEAT_Z),
                       soft=0.5, sag=0.1, mat=f))
    return P

META = dict(id="outdoor-lounge-chair-001", name="Scandinavian outdoor lounge chair",
    category="outdoor", subcategory="lounge-chairs", style="contemporary-scandinavian",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)), seat_height_cm=39, seats=1,
    materials=["wood", "fabric"], default_colors=dict(wood="light-oak", fabric="light-grey"),
    recommended_colors=dict(wood=["light-oak","natural-oak","smoked-oak","black-stained-wood"],
                            fabric=["light-grey","cream","sand","charcoal","olive"]))
