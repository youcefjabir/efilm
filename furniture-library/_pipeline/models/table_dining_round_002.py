# -*- coding: utf-8 -*-
"""
table-dining-round-002 — Premium round dining table

Rund skiva i travertinlook på en sluten konisk pelarfot i samma sten.
Ingen metall, inga ben — massan är hela uttrycket. Fyra personer.

Mått 120 × 120 × 74 cm.
"""
from lib import build as B, mats
DIA, H = 120.0, 74.0
TOP_T = 5.0

def build(stone="travertine"):
    s = mats.make("stone", stone)
    P = [B.disc("top", DIA/2, TOP_T, (0, 0, H - TOP_T), s, verts=128, bevel=1.2)]
    P.append(B.cyl("column", 20.0, H - TOP_T - 3.0, (0, 0, 3.0), 72, s, r_top=15.0, bevel=1.0))
    P.append(B.disc("base", 34.0, 3.6, (0, 0, 0), s, verts=96, bevel=1.0))
    return P

META = dict(id="table-dining-round-002", name="Premium round dining table",
    category="dining", subcategory="dining-tables", style="quiet-luxury",
    dimensions_cm=dict(width=int(DIA), depth=int(DIA), height=int(H)),
    footprint_cm=dict(width=int(DIA), depth=int(DIA)), seats=4, shape="round",
    materials=["stone"], default_colors=dict(stone="travertine"),
    recommended_colors=dict(stone=["travertine","warm-stone","ceramic","dark-stone"]))
