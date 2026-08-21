# -*- coding: utf-8 -*-
"""
rug-contemporary-003 — Contemporary neutral rug, 160 × 230

Låg tät väv i sand med en indragen ram i dämpad oliv. Ramen sitter nio
centimeter in, vilket ger mattan en tydlig kant utan att bli grafisk.
"""
from lib import rug
W, D = 160.0, 230.0

def build(base="sand", pattern="olive"):
    P = rug.field(W, D, base, "rect", pile=0.35)
    P += rug.border(W, D, pattern, inset=9.0, t=1.8)
    return P

META = dict(id="rug-contemporary-003", name="Contemporary neutral rug 160x230",
    category="rugs", subcategory="contemporary", style="soft-minimal",
    dimensions_cm=dict(width=int(W), depth=int(D), height=1),
    footprint_cm=dict(width=int(W), depth=int(D)), shape="rectangular",
    size_presets=["80x150","140x200","160x230","200x300"],
    materials=["fabric", "pattern"], default_colors=dict(fabric="sand", pattern="olive"),
    recommended_colors=dict(fabric=["sand","cream","beige","light-grey"],
                            pattern=["olive","muted-green","taupe","charcoal","warm-brown"]))
