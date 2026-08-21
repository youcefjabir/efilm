# -*- coding: utf-8 -*-
"""
sofa-japandi-003 — Japandi low-profile sofa

Låg, bred och öppen. En synlig ram i rökt ek bär dynorna, och ramen
sticker ut några centimeter i sidled så träet läses som konstruktion och
inte som list. Ryggen är låg — 66 cm — vilket är det som ger den
japandiska horisontella tyngden.

Mått 216 × 96 × 66 cm. Sitthöjd 38, sittdjup 62.
"""
import math
from lib import build as B, mats

W, D, H = 216.0, 96.0, 66.0
FR_T    = 7.0            # ramens tjocklek
LEG_H   = 12.0
SEAT_Z  = LEG_H + FR_T + 4.0

def build(fabric="beige", wood="smoked-oak"):
    f = mats.make("fabric", fabric)
    w = mats.make("wood", wood)
    P = []
    # ram: två långsidor och två kortsidor, utstickande i hörnen
    P.append(B.box("rail_f", W, FR_T, FR_T, (0, -(D/2 - FR_T/2), LEG_H), bevel=0.8, mat=w))
    P.append(B.box("rail_b", W, FR_T, FR_T, (0,  (D/2 - FR_T/2), LEG_H), bevel=0.8, mat=w))
    for sgn, nm in ((-1, "rail_l"), (1, "rail_r")):
        P.append(B.box(nm, FR_T, D - 2*FR_T - 0.6, FR_T,
                       (sgn*(W/2 - FR_T/2), 0, LEG_H), bevel=0.8, mat=w))
    # armstöd i trä: låga plattor som fortsätter ramens språk
    for sgn, nm in ((-1, "arm_l"), (1, "arm_r")):
        P.append(B.box(nm, FR_T, D - 4.0, 30.0,
                       (sgn*(W/2 - FR_T/2), 0, LEG_H + FR_T), bevel=1.0, mat=w))
    # sittdynor — två stora, tunna, fasta
    inner = W - 2*FR_T - 2.0
    cw = inner/2 - 1.2
    for i, x in enumerate((-(cw/2 + 0.8), cw/2 + 0.8)):
        P.append(B.cushion("seat_%d" % i, cw, D - 2*FR_T - 12.0, 13.0,
                           (x, -4.0, LEG_H + FR_T), soft=0.42, sag=0.08, mat=f))
    # låga ryggdynor
    for i, x in enumerate((-(cw/2 + 0.8), cw/2 + 0.8)):
        c = B.cushion("bck_%d" % i, cw, 14.0, 32.0,
                      (x, D/2 - FR_T - 8.0, LEG_H + FR_T + 13.0),
                      soft=0.55, sag=0.05, mat=f)
        c.rotation_euler = (math.radians(-9.0), 0, 0)
        P.append(c)
    # fyrkantiga ben, raka — japandi lutar inte
    lx, ly = W/2 - 8.0, D/2 - 8.0
    for sx in (-1, 1):
        for sy in (-1, 1):
            P.append(B.box("leg_%d_%d" % (sx, sy), 5.0, 5.0, LEG_H + 1.0,
                           (sx*lx, sy*ly, 0), bevel=0.5, mat=w))
    return P

META = dict(
    id="sofa-japandi-003", name="Japandi low-profile sofa",
    category="living-room", subcategory="sofas", style="japandi",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)),
    seat_height_cm=38, seats=2,
    materials=["fabric", "wood"],
    default_colors=dict(fabric="beige", wood="smoked-oak"),
    recommended_colors=dict(
        fabric=["cream","sand","beige","taupe","warm-brown","muted-green"],
        wood=["smoked-oak","natural-oak","walnut","dark-wood"]),
)
