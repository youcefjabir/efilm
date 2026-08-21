# -*- coding: utf-8 -*-
"""
rug-berber-002 — Berber-inspired rug, 200 × 300

Hög lugg i varm elfenben med ett glest rombmönster i mörk kol, och
frans i båda kortändarna. Mönstret är originalritat: tre rader om fem
romber, glesare än en marockansk original och mer nordiskt i takten.
"""
from lib import rug
W, D = 200.0, 288.0        # + 6 cm frans i vardera änden = 300 totalt

def build(base="warm-white", pattern="charcoal"):
    P = rug.field(W, D, base, "rect", pile=0.95)
    P += rug.diamonds(W, D, pattern, rows=4, cols=3, sz=0.56)
    P += rug.fringe(W, D, base, side=1, ln=6.0)
    P += rug.fringe(W, D, base, side=-1, ln=6.0)
    return P

META = dict(id="rug-berber-002", name="Berber-inspired high pile rug 200x300",
    category="rugs", subcategory="berber", style="warm-modern",
    dimensions_cm=dict(width=200, depth=300, height=3),
    footprint_cm=dict(width=200, depth=300), shape="rectangular",
    size_presets=["160x230","200x300","250x350"],
    materials=["fabric", "pattern"], default_colors=dict(fabric="warm-white", pattern="charcoal"),
    recommended_colors=dict(fabric=["warm-white","cream","sand"],
                            pattern=["charcoal","warm-brown","taupe","medium-grey"]))
