# -*- coding: utf-8 -*-
"""
armchair-lounge-001 — Scandinavian lounge chair

Synlig ekstomme med bakåtlutad sits, lös sittdyna och en ryggdyna som
vilar mellan två bakbensstolpar. Armstöden är massiva träarmar som
löper från framben till bakben i en enda linje — det är den detaljen
som gör stolen skandinavisk snarare än allmän.

Mått 74 × 82 × 76 cm. Sitthöjd 40.
"""
import math
from lib import build as B, mats

W, D, H = 74.0, 82.0, 76.0
LEG = 4.6
SEAT_Z = 36.0

def build(fabric="taupe", wood="natural-oak"):
    f = mats.make("fabric", fabric); w = mats.make("wood", wood)
    P = []
    # fyra ben, bakbenen högre och lutade
    for sx in (-1, 1):
        P.append(B.box("legf_%d" % sx, LEG, LEG, SEAT_Z + 2.0,
                       (sx*(W/2 - LEG/2 - 1.0), -(D/2 - 9.0), 0), bevel=0.5, mat=w))
        bl = B.box("legb_%d" % sx, LEG, LEG, H - 6.0,
                   (sx*(W/2 - LEG/2 - 1.0), D/2 - 7.0, 0), bevel=0.5, mat=w)
        bl.rotation_euler = (math.radians(6.5), 0, 0)
        P.append(bl)
    # armar från fram- till bakben
    for sx in (-1, 1):
        a = B.box("arm_%d" % sx, LEG + 0.6, D - 12.0, 3.6,
                  (sx*(W/2 - LEG/2 - 1.0), 0, 56.0), bevel=1.0, mat=w)
        a.rotation_euler = (math.radians(-3.0), 0, 0)
        P.append(a)
    # sitsram och dyna
    P.append(B.box("seat_frame", W - 2*LEG - 3.0, D - 20.0, 3.0,
                   (0, -3.0, SEAT_Z - 3.0), bevel=0.6, mat=w))
    P.append(B.cushion("seat", W - 2*LEG - 5.0, D - 22.0, 12.0,
                       (0, -3.0, SEAT_Z), soft=0.6, sag=0.14, mat=f))
    # ryggdyna mellan bakbenen
    bk = B.cushion("back", W - 2*LEG - 5.0, 13.0, 34.0,
                   (0, D/2 - 13.0, SEAT_Z + 9.0), soft=0.62, sag=0.05, mat=f)
    bk.rotation_euler = (math.radians(-15.0), 0, 0)
    P.append(bk)
    # tvärslå bak
    P.append(B.box("rail", W - 2*LEG - 3.0, 3.0, 3.0, (0, D/2 - 8.0, 14.0),
                   bevel=0.5, mat=w))
    return P

META = dict(id="armchair-lounge-001", name="Scandinavian lounge chair",
    category="living-room", subcategory="armchairs", style="contemporary-scandinavian",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)), seat_height_cm=40, seats=1,
    materials=["fabric", "wood"], default_colors=dict(fabric="taupe", wood="natural-oak"),
    recommended_colors=dict(
        fabric=["cream","sand","taupe","medium-grey","charcoal","olive","muted-green"],
        wood=["light-oak","natural-oak","smoked-oak","walnut"]))
