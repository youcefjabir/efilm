# -*- coding: utf-8 -*-
"""
armchair-soft-002 — Soft upholstered armchair

En sluten skalform i bouclé som svänger runt från armstöd till rygg,
på en låg vridbar fot i svart metall. Ingen synlig söm i formen —
mjukheten ÄR designen.

Mått 88 × 84 × 74 cm. Sitthöjd 41.
"""
import math
from lib import build as B, mats

W, D, H = 88.0, 84.0, 74.0
FOOT_H = 10.0

def build(fabric="cream", metal="black"):
    f = mats.make("fabric", fabric); m = mats.make("metal", metal)
    P = []
    # skalet: en stor vals som klipps av sitsen — läses som en famn
    shell = B.cyl("shell", W/2, 44.0, (0, 4.0, FOOT_H + 2.0), 64, f, bevel=2.0)
    shell.scale = (1.0, D/W * 1.06, 1.0)
    P.append(shell)
    # sitsbädden skär ur skalets framkant
    P.append(B.cushion("seat", W - 24.0, D - 26.0, 16.0,
                       (0, -7.0, FOOT_H + 24.0), soft=0.8, sag=0.18, mat=f))
    # ryggkudde
    bk = B.cushion("back", W - 30.0, 14.0, 26.0, (0, D/2 - 17.0, FOOT_H + 32.0),
                   soft=0.85, sag=0.05, mat=f)
    bk.rotation_euler = (math.radians(-14.0), 0, 0)
    P.append(bk)
    # fot: skiva och pelare
    P.append(B.disc("foot_plate", 22.0, 1.6, (0, 0, 0), m, verts=64, bevel=0.4))
    P.append(B.cyl("foot_col", 6.0, FOOT_H + 3.0, (0, 0, 1.2), 32, m, r_top=8.0, bevel=0.4))
    return P

META = dict(id="armchair-soft-002", name="Soft upholstered armchair",
    category="living-room", subcategory="armchairs", style="soft-minimal",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)), seat_height_cm=41, seats=1,
    materials=["fabric", "metal"], default_colors=dict(fabric="cream", metal="black"),
    recommended_colors=dict(
        fabric=["cream","warm-white","sand","beige","light-grey","muted-green"],
        metal=["black","dark-bronze","brushed-steel"]))
