# -*- coding: utf-8 -*-
"""
sofa-scandinavian-001 — Contemporary Scandinavian 3-sits

Låg rak stomme i tyg, tre sittdynor, tre ryggdynor, smala rakskurna
armstöd och låga svagt utåtlutande ekben. Armstödets bredd är det som
mest avgör om en soffa läses som svensk samtida eller som soffa i
allmänhet — här 16 cm, smalt nog att kännas lätt.

Mått 224 × 92 × 78 cm. Sitthöjd 44, sittdjup 58.

Byggregel som gäller hela biblioteket: INGA sammanfallande ytor. Första
versionen lät armstöd och stomme dela ytterplan på millimetern, vilket
gav z-fighting och svarta fläckar i renderingen. Delar som möts skjuts
alltid in i varandra med några millimeter.
"""
import math
from lib import build as B, mats
from lib import mats2

W, D, H   = 224.0, 92.0, 78.0
ARM_W     = 16.0
ARM_H     = 61.0
LEG_H     = 15.0
BASE_H    = 14.0                    # stommens sarg
SEAT_T    = 17.0                    # sittdynans tjocklek
BACK_T    = 16.0                    # ryggstommens tjocklek
INNER     = W - 2*ARM_W             # fri bredd mellan armstöden

def build(fabric="sand", wood="natural-oak"):
    # V2-materialen: väv, ådring och tonvariation i stället för platt färg
    f  = mats2.fabric(fabric, weave_mm=9.0)
    fs = [mats2.fabric(fabric, weave_mm=9.0, jitter=j) for j in (-0.035, 0.0, 0.03)]
    fb = [mats2.fabric(fabric, weave_mm=9.0, jitter=j) for j in (0.02, -0.025, 0.01)]
    w = mats2.wood(wood, along="z")          # benens fiber löper längs benet
    P = []

    # sarg mellan armstöden, indragen 3 mm i djupled så inget plan sammanfaller
    P.append(B.box("base", INNER + 1.0, D - 0.6, BASE_H, (0, 0, LEG_H),
                   bevel=1.6, mat=f))

    # armstöd — de definierar ytterkanten
    for sgn, nm in ((-1, "arm_l"), (1, "arm_r")):
        P.append(B.box(nm, ARM_W, D, ARM_H - LEG_H, (sgn*(W/2 - ARM_W/2), 0, LEG_H),
                       bevel=3.0, seg=4, mat=f))

    # ryggstomme, svagt bakåtlutad, indragen mellan armstöden
    bk = B.box("back", INNER + 1.0, BACK_T, H - LEG_H - 4.0,
               (0, D/2 - BACK_T/2 - 0.4, LEG_H), bevel=2.4, mat=f)
    bk.rotation_euler = (math.radians(-5.0), 0, 0)
    P.append(bk)

    # tre sittdynor, plana upptill och lätt buktande
    cw = INNER/3.0 - 1.4
    for i, x in enumerate((-INNER/3.0, 0.0, INNER/3.0)):
        P.append(B.cushion("seat_%d" % i, cw, D - BACK_T - 6.0, SEAT_T,
                           (x, -(BACK_T/2 + 1.0), LEG_H + BASE_H - 1.0),
                           soft=0.60, sag=0.14, mat=fs[i]))

    # tre ryggdynor, fylligare än sittdynorna och lutade med ryggen
    bh = H - (LEG_H + BASE_H + SEAT_T) + 6.0
    for i, x in enumerate((-INNER/3.0, 0.0, INNER/3.0)):
        c = B.cushion("bck_%d" % i, cw, 17.0, bh,
                      (x, D/2 - BACK_T - 4.0, LEG_H + BASE_H + SEAT_T - 5.0),
                      soft=0.72, sag=0.06, mat=fb[i])
        c.rotation_euler = (math.radians(-11.0), 0, 0)
        P.append(c)

    # ben: koniska, svagt utåtlutade åt båda håll
    lx, ly = W/2 - 14.0, D/2 - 14.0
    for sx in (-1, 1):
        for sy in (-1, 1):
            P.append(B.leg_taper("leg_%d_%d" % (sx, sy), 2.7, 1.6, LEG_H + 1.5,
                                 (sx*lx, sy*ly, 0), w, tilt=(-sy*7.0, sx*7.0)))
    return P

META = dict(
    id="sofa-scandinavian-001",
    name="Contemporary Scandinavian 3-seat sofa",
    category="living-room", subcategory="sofas",
    style="contemporary-scandinavian",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)),
    seat_height_cm=44, seats=3,
    materials=["fabric", "wood"],
    default_colors=dict(fabric="sand", wood="natural-oak"),
    recommended_colors=dict(
        fabric=["cream","sand","beige","taupe","light-grey","charcoal","olive"],
        wood=["light-oak","natural-oak","smoked-oak","walnut"]),
)
