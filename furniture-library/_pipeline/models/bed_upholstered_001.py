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
    # Bäddtextil är bomull, inte möbeltyg. Täcket renderades förut i samma
    # tygshader som soffdynor och blev ett slätt vitt fält utan form.
    bd = mats2.cotton(bedding, weave_mm=4.5, crease_cm=14.0, crease=0.42)   # lakan
    du = mats2.cotton(bedding, weave_mm=5.5, crease_cm=9.0, crease=0.60,
                      quilt_cm=34.0)                                        # täcke
    pl = mats2.cotton(bedding, weave_mm=5.0, crease_cm=7.0, crease=0.70)    # kuddar
    P = []

    # ram i möbeltyg, indragen så madrassen skjuter ut en aning
    P.append(B.box("frame", W, D - 16.0, FRAME_H, (0, -8.0, LEG_H), bevel=2.0, mat=f))

    # madrass — bomullslakan, inte möbeltyg
    P.append(B.cushion("mattress", MW, ML, MATT_T, (0, -8.0, MATT_Z - 1.0),
                       soft=0.28, sag=0.04, mat=bd))

    # TÄCKET: täcker nedre två tredjedelar, med uppvikt övre kant.
    # Det hängde förut kant i kant med madrassen och läste därför som en
    # skiva ovanpå en skiva. Ett riktigt täcke faller UTANFÖR madrassen,
    # och det överhänget är det som gör silhuetten till en bäddad säng.
    duv_len = ML*0.66
    duv_y = -8.0 - (ML - duv_len)/2 + 2.0
    duv_z = MATT_Z + MATT_T - 4.0
    P.append(B.cushion("duvet", MW + 15.0, duv_len, 15.0,
                       (0, duv_y, duv_z),
                       soft=0.85, sag=0.12, mat=du))
    # fallet längs sidorna — täcket hänger ner över madrasskanten
    for sgn in (-1, 1):
        P.append(B.cushion("duvet_fall_%d" % sgn, 7.0, duv_len - 6.0, 17.0,
                           (sgn*(MW/2 + 4.0), duv_y, duv_z - 12.0),
                           soft=0.9, sag=0.05, mat=du))
    # Veck tvärs täcket. Första försöket var två smala valsar strax under
    # ytan och de renderades som två skarpa ljusa streck — lysrör, inte
    # tyg. Ett veck i ett täcke är BRETT och GRUNT: 16 cm brett och drygt
    # en centimeter högt. Då blir det en mjuk skuggning i stället för en
    # linje.
    for k, fy in enumerate((-0.20, 0.18)):
        v = B.cyl("crease_%d" % k, 8.0, MW + 12.0,
                  (0, duv_y + fy*duv_len, duv_z + 13.6), 40, du,
                  bevel=0.6, zc=True)
        v.rotation_euler = (0, math.radians(90), 0)
        # Skalning sker i LOKALA axlar, före rotationen. Valsen ligger
        # längs lokal Z, så (1, 1, 0.16) kortade av själva längden och
        # vecket blev en liten platta mitt på täcket. Det är lokal X som
        # pekar uppåt efter rotationen kring Y.
        v.scale = (0.16, 1.0, 1.0)
        P.append(v)
    # uppvikten: en rulle tvärs sängen där täcket slår tillbaka
    fold = B.cyl("fold", 7.0, MW + 13.0, (0, duv_y + duv_len/2 + 1.0,
                 duv_z + 9.0), 40, du, bevel=0.8, zc=True)
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
    # Kanalerna hade 1,1 cm mellanrum och läste ovanifrån som sju separata
    # kuddar i rad. En tuftad gavel har en SÖM, inte en glipa.
    P += B.channel_tufting("hb", W, hb_h, 11.0, 7,
                           (0, D/2 - 6.0, LEG_H), ft, gap=0.45)
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
