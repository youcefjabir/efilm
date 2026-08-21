# -*- coding: utf-8 -*-
"""
bed-wood-002 — Minimal wooden / Japandi bed, 160 × 200

En plattform i rökt ek som är bredare än madrassen, så det bildas en
avsats runt om — den avsatsen ersätter nattduksbord på en liten yta.
Gaveln är en enkel skiva i samma trä. Inga ben: plattformen står på två
indragna medar, vilket får sängen att sväva.

Mått 184 × 216 × 78 cm. Madrasshöjd 42.
"""
from lib import build as B, mats
MW, ML = 160.0, 200.0
W, D, H = MW + 24.0, ML + 16.0, 78.0
PLAT_H, RUNNER_H = 8.0, 12.0

def build(wood="smoked-oak", fabric="warm-white"):
    w = mats.make("wood", wood); f = mats.make("fabric", fabric)
    P = []
    P.append(B.rounded_plate("platform", W, D, PLAT_H, 3.0, (0, 0, RUNNER_H), mat=w))
    for sx in (-1, 1):
        P.append(B.box("runner_%d" % sx, 9.0, D - 44.0, RUNNER_H,
                       (sx*(W/2 - 30.0), 0, 0), bevel=0.8, mat=w))
    P.append(B.cushion("mattress", MW, ML, 20.0, (0, -6.0, RUNNER_H + PLAT_H - 0.6),
                       soft=0.3, sag=0.04, mat=f))
    hb = B.box("headboard", W - 8.0, 5.0, H - RUNNER_H - PLAT_H - 4.0,
               (0, D/2 - 6.0, RUNNER_H + PLAT_H), bevel=1.0, mat=w)
    P.append(hb)
    for sgn in (-1, 1):
        P.append(B.cushion("pillow_%d" % sgn, MW/2 - 10.0, 40.0, 12.0,
                           (sgn*(MW/4 + 1.0), ML/2 - 30.0, RUNNER_H + PLAT_H + 18.0),
                           soft=0.88, sag=0.13, mat=f))
    return P

META = dict(id="bed-wood-002", name="Minimal wooden platform bed 160",
    category="bedroom", subcategory="beds", style="japandi",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)),
    mattress_cm=dict(width=int(MW), length=int(ML)), size_presets=["140x200","160x200","180x200"],
    materials=["wood", "fabric"], default_colors=dict(wood="smoked-oak", fabric="warm-white"),
    recommended_colors=dict(
        wood=["light-oak","natural-oak","smoked-oak","walnut","black-stained-wood"],
        fabric=["warm-white","cream","sand","light-grey"]))
