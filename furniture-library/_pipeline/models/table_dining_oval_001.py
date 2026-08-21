# -*- coding: utf-8 -*-
"""
table-dining-oval-001 — Scandinavian oval oak dining table

Oval massiv ekskiva på fyra koniska ben som lutar utåt i båda led.
Skivan har en mjuk underfas så kanten ser tunnare ut än den är — 4 cm
skiva som läser som 2,5.

Mått 200 × 100 × 74 cm. Sex personer.
"""
from lib import build as B, mats
W, D, H = 200.0, 100.0, 74.0
TOP_T = 4.0

def build(wood="natural-oak"):
    w = mats.make("wood", wood)
    P = [B.ellipse_plate("top", W, D, TOP_T, (0, 0, H - TOP_T), mat=w, verts=128)]
    lx, ly = W/2 - 26.0, D/2 - 17.0
    for sx in (-1, 1):
        for sy in (-1, 1):
            P.append(B.leg_taper("leg_%d_%d" % (sx, sy), 3.6, 2.2, H - TOP_T,
                                 (sx*lx, sy*ly, 0), w, tilt=(-sy*5.0, sx*5.0), verts=28))
    # sarg som binder benen
    P.append(B.box("rail_l", 4.0, D - 44.0, 5.0, (-lx, 0, H - TOP_T - 8.0), bevel=0.6, mat=w))
    P.append(B.box("rail_r", 4.0, D - 44.0, 5.0, ( lx, 0, H - TOP_T - 8.0), bevel=0.6, mat=w))
    P.append(B.box("rail_c", 2*lx - 4.0, 4.0, 5.0, (0, 0, H - TOP_T - 8.0), bevel=0.6, mat=w))
    return P

META = dict(id="table-dining-oval-001", name="Scandinavian oval oak dining table",
    category="dining", subcategory="dining-tables", style="contemporary-scandinavian",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)), seats=6, shape="oval",
    materials=["wood"], default_colors=dict(wood="natural-oak"),
    recommended_colors=dict(wood=["light-oak","natural-oak","smoked-oak","walnut","black-stained-wood"]))
