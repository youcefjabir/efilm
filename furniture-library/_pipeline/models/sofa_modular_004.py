# -*- coding: utf-8 -*-
"""
sofa-modular-004 — Modular sofa

Ett modulsystem, inte en soffa som töjts. Grundmodulen är 92 cm bred;
divanen är en egen fysisk modul med eget djup och egen sittdyna, och
hörnet är en kvadratisk modul. Därför har varje variant en egen
geometri och ett eget fotavtryck — punkt 14 i specen.

Varianter
  straight      252 × 98    tre moduler i rad
  chaise-left   252 × 162   divan till vänster sett framifrån
  chaise-right  252 × 162   spegelvänd
"""
import math
from lib import build as B, mats

MOD_W, D, H = 84.0, 98.0, 74.0
ARM_W  = 14.0
LEG_H  = 13.0
BASE_H = 16.0
SEAT_T = 16.0
CH_D   = 162.0           # divanens djup

VARIANTS = {
  "straight":     dict(width=3*MOD_W, depth=D,    label="Straight, 3 modules"),
  "chaise-left":  dict(width=3*MOD_W, depth=CH_D, label="Chaise left"),
  "chaise-right": dict(width=3*MOD_W, depth=CH_D, label="Chaise right"),
}

def _seat_block(P, f, x, w, d, ycen):
    P.append(B.box("base_%.0f" % x, w, d, BASE_H, (x, ycen, LEG_H), bevel=1.4, mat=f))
    P.append(B.cushion("seat_%.0f" % x, w - 2.6, d - 16.0, SEAT_T,
                       (x, ycen - 6.0, LEG_H + BASE_H - 1.0),
                       soft=0.58, sag=0.13, mat=f))

def build(variant="straight", fabric="light-grey", wood="black-stained-wood"):
    f = mats.make("fabric", fabric)
    w = mats.make("wood", wood)
    P = []
    W = 3*MOD_W
    chaise = variant in ("chaise-left", "chaise-right")
    side = -1 if variant == "chaise-left" else 1
    # y-mitt för hela möbeln så fotavtrycket blir symmetriskt runt origo
    dep = CH_D if chaise else D
    y0 = -dep/2                       # främre kant

    # tre sittmoduler längs framkanten
    for i in range(3):
        x = -W/2 + MOD_W/2 + i*MOD_W
        _seat_block(P, f, x, MOD_W - 0.8, D, y0 + D/2)

    # ryggstomme över de moduler som har rygg
    if chaise:
        bw = 2*MOD_W
        bx = -W/2 + bw/2 if side < 0 else W/2 - bw/2
        bx = -bx if False else (W/2 - bw/2 if side < 0 else -W/2 + bw/2)
    else:
        bw, bx = W, 0.0
    P.append(B.box("back", bw, 15.0, H - LEG_H - 4.0,
                   (bx, y0 + D - 7.5, LEG_H), bevel=2.0, mat=f))
    n = max(1, int(round(bw/MOD_W)))
    for i in range(n):
        cx = bx - bw/2 + bw/(2*n) + i*bw/n
        c = B.cushion("bck_%d" % i, bw/n - 2.4, 16.0, H - LEG_H - BASE_H - SEAT_T + 6.0,
                      (cx, y0 + D - 16.0, LEG_H + BASE_H + SEAT_T - 4.0),
                      soft=0.66, sag=0.05, mat=f)
        c.rotation_euler = (math.radians(-10.0), 0, 0)
        P.append(c)

    # ett armstöd på den sida som inte har divan
    ax = (-W/2 + ARM_W/2) if side > 0 else (W/2 - ARM_W/2)
    if not chaise:
        for sgn in (-1, 1):
            P.append(B.box("arm_%d" % sgn, ARM_W, D, 46.0,
                           (sgn*(W/2 - ARM_W/2), y0 + D/2, LEG_H), bevel=2.6, mat=f))
    else:
        P.append(B.box("arm", ARM_W, D, 46.0, (ax, y0 + D/2, LEG_H), bevel=2.6, mat=f))
        # divanmodulen: egen kropp och egen lång dyna
        cx = (W/2 - MOD_W/2) if side < 0 else (-W/2 + MOD_W/2)
        ext = CH_D - D
        P.append(B.box("ch_base", MOD_W - 0.8, ext + 2.0, BASE_H,
                       (cx, y0 + D + ext/2 - 1.0, LEG_H), bevel=1.4, mat=f))
        P.append(B.cushion("ch_seat", MOD_W - 3.4, ext - 4.0, SEAT_T,
                           (cx, y0 + D + ext/2 - 1.0, LEG_H + BASE_H - 1.0),
                           soft=0.58, sag=0.13, mat=f))
        # låg rygg längs divanens yttersida
        P.append(B.box("ch_arm", ARM_W, ext + 2.0, 34.0,
                       (cx + (MOD_W/2 - ARM_W/2)*(1 if side < 0 else -1),
                        y0 + D + ext/2 - 1.0, LEG_H), bevel=2.4, mat=f))

    # ben
    xs = (-W/2 + 9.0, 0.0, W/2 - 9.0)
    ys = [y0 + 9.0, y0 + D - 9.0] + ([y0 + dep - 9.0] if chaise else [])
    for x in xs:
        for y in ys:
            if chaise and y > y0 + D and abs(x) < W/2 - MOD_W:
                continue
            P.append(B.cyl("leg_%.0f_%.0f" % (x, y), 2.0, LEG_H + 1.0, (x, y, 0),
                           20, w, bevel=0.3))
    return P

def meta(variant="straight"):
    v = VARIANTS[variant]
    return dict(
        id="sofa-modular-004" + ("" if variant == "straight" else "-" + variant),
        name="Modular sofa — " + v["label"],
        category="living-room", subcategory="sofas", style="contemporary-scandinavian",
        dimensions_cm=dict(width=int(v["width"]), depth=int(v["depth"]), height=int(H)),
        footprint_cm=dict(width=int(v["width"]), depth=int(v["depth"])),
        seat_height_cm=42, seats=3,
        materials=["fabric", "wood"],
        default_colors=dict(fabric="light-grey", wood="black-stained-wood"),
        recommended_colors=dict(
            fabric=["cream","sand","light-grey","medium-grey","charcoal","olive","taupe"],
            wood=["black-stained-wood","dark-wood","smoked-oak"]))

META = meta("straight")
META["variants"] = ["straight", "chaise-left", "chaise-right"]
