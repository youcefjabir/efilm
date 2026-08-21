# -*- coding: utf-8 -*-
"""
rug-scandinavian-wool-001 — Scandinavian textured wool rug, 200 × 300

Ofärgad ullmatta i grädde med en mycket återhållen randning i varm grå
mot kortsidorna. Luggen är medelhög. Det som gör den skandinavisk är att
mönstret nästan inte finns — mattan ska ligga still under möblerna.
"""
from lib import rug, mats
W, D = 200.0, 300.0

def build(base="cream", pattern="taupe"):
    P = rug.field(W, D, base, "rect", pile=0.62)
    P += rug.stripes(W, D, pattern, n=4, frac=0.10)
    return P

META = dict(id="rug-scandinavian-wool-001", name="Scandinavian textured wool rug 200x300",
    category="rugs", subcategory="scandinavian", style="contemporary-scandinavian",
    dimensions_cm=dict(width=int(W), depth=int(D), height=2),
    footprint_cm=dict(width=int(W), depth=int(D)), shape="rectangular",
    size_presets=["140x200","160x230","200x300","250x350"],
    materials=["fabric", "pattern"], default_colors=dict(fabric="cream", pattern="taupe"),
    recommended_colors=dict(fabric=["cream","warm-white","sand","light-grey"],
                            pattern=["taupe","beige","medium-grey","warm-brown"]))
