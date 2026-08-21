# -*- coding: utf-8 -*-
"""
desk-scandinavian-001 — Scandinavian desk

Ekskiva på en ram i svart stål. En grund låda under skivan till vänster
och en kabelbygel bak. Bordet är 130 cm — det som faktiskt får plats i
en svensk bostadsrätt, inte ett kontorsskrivbord.

Mått 130 × 62 × 74 cm.
"""
from lib import build as B, mats
W, D, H = 130.0, 62.0, 74.0
TOP_T = 3.0
LEG_S = 3.2

def build(wood="light-oak", metal="black"):
    w = mats.make("wood", wood); m = mats.make("metal", metal)
    P = [B.rounded_plate("top", W, D, TOP_T, 1.4, (0, 0, H - TOP_T), mat=w)]
    for sx in (-1, 1):
        x = sx*(W/2 - 7.0)
        for sy in (-1, 1):
            P.append(B.box("leg_%d_%d" % (sx, sy), LEG_S, LEG_S, H - TOP_T,
                           (x, sy*(D/2 - 6.0), 0), bevel=0.35, mat=m))
        P.append(B.box("side_%d" % sx, LEG_S, D - 12.0 - LEG_S, LEG_S,
                       (x, 0, H - TOP_T - LEG_S - 1.0), bevel=0.35, mat=m))
    P.append(B.box("stretcher", 2*(W/2 - 7.0) - LEG_S, LEG_S, LEG_S,
                   (0, D/2 - 6.0, 12.0), bevel=0.35, mat=m))
    # grund låda
    P.append(B.box("drawer", 46.0, D - 14.0, 8.0, (-W/2 + 30.0, -1.0, H - TOP_T - 9.5),
                   bevel=0.7, mat=w))
    return P

META = dict(id="desk-scandinavian-001", name="Scandinavian desk",
    category="office", subcategory="desks", style="contemporary-scandinavian",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)),
    materials=["wood", "metal"], default_colors=dict(wood="light-oak", metal="black"),
    recommended_colors=dict(wood=["light-oak","natural-oak","smoked-oak","walnut"],
                            metal=["black","dark-bronze","brushed-steel"]))
