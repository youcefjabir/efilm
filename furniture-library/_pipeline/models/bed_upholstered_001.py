# -*- coding: utf-8 -*-
"""
bed-upholstered-001 — Stoppad dubbelsäng 180

OMRITAD. Den förra var en soffa: en stoppad låda med ryggparti, två
dynor som sittdynor, madrass i möbeltyg och inget täcke. Uppifrån gick
den inte att skilja från en divan.

En säng läses som en säng ovanifrån av tre saker, och alla tre saknades:

  TÄCKET   den största ytan, i sängtextil och inte i möbeltyg, med en
           uppvikt övre kant och mjuka veck
  KUDDARNA fylliga, liggande på tvären, tydligt skilda från täcket
  GAVELN   högre än sängen, kanaltuftad så den läses ovanifrån

Materialen skiljer också: ramen är möbeltyg, bäddningen är bomull.
Det är den skillnaden som gör att ytan uppifrån inte blir ett enda fält.

Mått 194 × 222 × 108 cm. Madrass 180 × 200.
"""
import math
from lib import build as B, mats2

MW, ML = 180.0, 200.0
W, D, H = MW + 14.0, ML + 22.0, 108.0
LEG_H, FRAME_H = 12.0, 24.0
MATT_T = 22.0
MATT_Z = LEG_H + FRAME_H

def build(fabric="greige", wood="natural-oak", bedding="warm-white"):
    f  = mats2.fabric(fabric, weave_mm=9.0)
    ft = mats2.fabric(fabric, weave_mm=9.0, jitter=-0.03)
    w  = mats2.wood(wood, along="z")
    bd = mats2.fabric(bedding, weave_mm=6.5, sheen=0.28)          # lakan
    du = mats2.fabric(bedding, weave_mm=11.0, sheen=0.42, jitter=-0.02)  # täcke
    pl = mats2.fabric(bedding, weave_mm=7.5, sheen=0.5, jitter=0.02)     # kuddar
    P = []

    # ram i möbeltyg, indragen så madrassen skjuter ut en aning
    P.append(B.box("frame", W, D - 16.0, FRAME_H, (0, -8.0, LEG_H), bevel=2.0, mat=f))

    # madrass — bomullslakan, inte möbeltyg
    P.append(B.cushion("mattress", MW, ML, MATT_T, (0, -8.0, MATT_Z - 1.0),
                       soft=0.28, sag=0.04, mat=bd))

    # TÄCKET: täcker nedre två tredjedelar, med uppvikt övre kant.
    duv_len = ML*0.66
    duv_y = -8.0 - (ML - duv_len)/2 + 2.0
    P.append(B.cushion("duvet", MW + 5.0, duv_len, 13.0,
                       (0, duv_y, MATT_Z + MATT_T - 3.0),
                       soft=0.75, sag=0.10, mat=du))
    # uppvikten: en rulle tvärs sängen där täcket slår tillbaka
    fold = B.cyl("fold", 6.5, MW + 5.0, (0, duv_y + duv_len/2 + 1.0,
                 MATT_Z + MATT_T + 6.0), 40, du, bevel=0.8, zc=True)
    fold.rotation_euler = (0, math.radians(90), 0)
    P.append(fold)

    # KUDDARNA: två fylliga, liggande på tvären
    for sgn in (-1, 1):
        P.append(B.cushion("pillow_%d" % sgn, MW/2 - 9.0, 46.0, 15.0,
                           (sgn*(MW/4 + 2.0), -8.0 + ML/2 - 33.0,
                            MATT_Z + MATT_T - 2.0),
                           soft=0.95, sag=0.16, mat=pl))

    # GAVELN: kanaltuftad, högre än sängen
    hb_h = H - LEG_H - 6.0
    P += B.channel_tufting("hb", W, hb_h, 13.0, 7,
                           (0, D/2 - 7.0, LEG_H), ft, gap=1.1)
    # gavelns ram bakom kanalerna
    P.append(B.box("hb_back", W, 4.0, hb_h, (0, D/2 - 1.5, LEG_H), bevel=1.0, mat=f))

    # ben
    for sx in (-1, 1):
        for sy in (-1, 1):
            P.append(B.leg_taper("leg_%d_%d" % (sx, sy), 2.8, 1.8, LEG_H + 1.5,
                                 (sx*(W/2 - 11.0), sy*(D/2 - 20.0), 0), w,
                                 tilt=(-sy*5.0, sx*5.0)))
    return P

META = dict(
    id="bed-upholstered-001", name="Stoppad dubbelsäng 180",
    display_name="Dubbelsäng 180",
    category="bedroom", subcategory="beds", style="quiet-luxury",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)),
    mattress_cm=dict(width=int(MW), length=int(ML)),
    size_presets=["140x200","160x200","180x200"],
    materials=["fabric", "wood"],
    default_colors=dict(fabric="greige", wood="natural-oak", bedding="warm-white"),
    recommended_colors=dict(
        fabric=["sand","greige","olive","charcoal","taupe","light-grey"],
        wood=["light-oak","smoked-oak","walnut"]))
