# -*- coding: utf-8 -*-
"""
sofa-rounded-002 — Soft rounded premium sofa

Quiet luxury. Inga ben: soffan står på en indragen sockel så den ser ut
att vila direkt på golvet. Armstöden är valsar som fortsätter runt i
ryggen i en enda svepande linje, och sitsen är en djup, mjuk bädd.
Bouclé-look i grädde. Det som gör den premium är frånvaron av detaljer.

Mått 236 × 104 × 72 cm. Sitthöjd 42, sittdjup 66.
"""
import math
from lib import build as B, mats

W, D, H = 236.0, 104.0, 72.0
ROLL_R  = 17.0          # armstödsvalsens radie
PLINT_H = 9.0
SEAT_Z  = PLINT_H + 16.0

def build(fabric="cream", wood=None):
    f = mats.make("fabric", fabric)
    P = []
    # indragen sockel — soffan tycks vila på golvet
    P.append(B.rounded_plate("plinth", W - 22.0, D - 22.0, PLINT_H, 10.0,
                             (0, 0, 0), mat=f))
    # sittbädd
    P.append(B.rounded_plate("bed", W - 2*ROLL_R + 2.0, D - ROLL_R - 2.0, 15.0, 12.0,
                             (0, -ROLL_R/2 + 1.0, PLINT_H), mat=f))
    # armstöd som liggande valsar
    for sgn, nm in ((-1, "roll_l"), (1, "roll_r")):
        r = B.cyl(nm, ROLL_R, D - 6.0, (sgn*(W/2 - ROLL_R), 0, PLINT_H + ROLL_R + 4.0),
                  56, f, bevel=1.2, zc=True)
        r.rotation_euler = (math.radians(90), 0, 0)
        P.append(r)
    # ryggvals, samma radie — det är kontinuiteten som gör formen
    bk = B.cyl("back_roll", ROLL_R, W - 2*ROLL_R + 6.0,
               (0, D/2 - ROLL_R + 1.0, PLINT_H + ROLL_R + 21.0), 56, f, bevel=1.2, zc=True)
    bk.rotation_euler = (0, math.radians(90), 0)
    P.append(bk)
    # ryggens stöd bakom bädden
    P.append(B.rounded_plate("back_pad", W - 2*ROLL_R + 4.0, 20.0, 34.0, 9.0,
                             (0, D/2 - 15.0, PLINT_H + 12.0), mat=f))
    # två breda sittdynor
    cw = (W - 2*ROLL_R - 4.0)/2 - 1.2
    for i, x in enumerate((-(cw/2 + 1.0), cw/2 + 1.0)):
        P.append(B.cushion("seat_%d" % i, cw, D - ROLL_R - 16.0, 18.0,
                           (x, -8.0, PLINT_H + 14.0), soft=0.78, sag=0.16, mat=f))
    # två lösa ryggkuddar
    for i, x in enumerate((-(cw/2 + 1.0), cw/2 + 1.0)):
        c = B.cushion("bck_%d" % i, cw - 6.0, 16.0, 30.0,
                      (x, D/2 - 24.0, PLINT_H + 28.0), soft=0.85, sag=0.05, mat=f)
        c.rotation_euler = (math.radians(-13.0), 0, 0)
        P.append(c)
    return P

META = dict(
    id="sofa-rounded-002", name="Soft rounded premium sofa",
    category="living-room", subcategory="sofas", style="quiet-luxury",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)),
    seat_height_cm=42, seats=3,
    materials=["fabric"],
    default_colors=dict(fabric="cream"),
    recommended_colors=dict(fabric=["cream","warm-white","sand","beige","taupe","light-grey"]),
)
