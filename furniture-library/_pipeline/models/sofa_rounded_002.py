# -*- coding: utf-8 -*-
"""
sofa-rounded-002 — Rundad loungesoffa

OMRITAD. Den förra var en fyrkantig låda med två liggande valsar
fastsatta i ändarna: rund och fyrkantig samtidigt, och därför ful.

Den här är en enda svept form. Ett ovalt tvärsnitt följer en U-kurva i
planet — bakåt, runt hörnen, fram längs sidorna — och avsmalnar mot de
främre ändarna. Rygg och armstöd är alltså inte tre delar utan en, och
det är just kontinuiteten som ger den sitt lugna, dyra uttryck.

Sitsen är två djupa dynor med rundad framkant, på en indragen sockel så
soffan ser ut att vila direkt på golvet.

Mått 232 × 104 × 72 cm. Sitthöjd 42, sittdjup 66.
"""
import math
from lib import build as B, mats2

W, D, H = 232.0, 104.0, 72.0
PLINT_H = 8.0
SEAT_Z  = PLINT_H + 14.0
SHELL_W, SHELL_H = 30.0, 34.0        # skalets tvärsnitt

def build(fabric="cream", wood=None):
    f  = mats2.boucle(fabric, loop_mm=7.5)
    fs = [mats2.boucle(fabric, loop_mm=7.5) for _ in range(2)]
    P = []

    # Skalet: en U-kurva i planet. Ändarna ligger framme vid sitsens
    # framkant, toppen av bågen ligger i ryggen.
    hx = W/2 - SHELL_W/2
    by = D/2 - SHELL_W/2
    fy = -D/2 + SHELL_W/2 + 4.0
    path = [
        (  hx,  fy, SEAT_Z + 2.0),
        (  hx,  by - 26.0, SEAT_Z + 8.0),
        (  hx*0.80,  by, SEAT_Z + 15.0),
        (  0.0,  by + 1.0, SEAT_Z + 17.0),
        ( -hx*0.80,  by, SEAT_Z + 15.0),
        ( -hx,  by - 26.0, SEAT_Z + 8.0),
        ( -hx,  fy, SEAT_Z + 2.0),
    ]
    # avsmalning: smalare vid de främre ändarna, fylligast i ryggen
    taper = [(-100, 0, 0), (-70, 0.80, 0), (0, 1.0, 0), (70, 0.80, 0), (100, 0, 0)]
    taper = [(x, 0.62 + 0.38*y, 0) for x, y, _ in
             [(-100, 0.62, 0), (-62, 0.92, 0), (0, 1.0, 0), (62, 0.92, 0), (100, 0.62, 0)]]
    shell = B.sweep("shell", path, SHELL_W, SHELL_H, cyclic=False, mat=f,
                    taper=[(-100, 0.70, 0), (-60, 0.95, 0), (0, 1.0, 0),
                           (60, 0.95, 0), (100, 0.70, 0)])
    P.append(shell)

    # Sockel: rundad, indragen, låg.
    P.append(B.rounded_plate("plinth", W - 30.0, D - 26.0, PLINT_H, 16.0,
                             (0, 0, 0), mat=f, seg=8))

    # Sittbädd under dynorna, följer skalets insida.
    P.append(B.rounded_plate("bed", W - SHELL_W*1.7, D - SHELL_W - 6.0, 12.0, 14.0,
                             (0, -3.0, PLINT_H), mat=f, seg=8))

    # Två djupa dynor med rundad framkant.
    cw = (W - SHELL_W*1.7)/2 - 1.6
    for i, x in enumerate((-(cw/2 + 0.9), cw/2 + 0.9)):
        c = B.cushion("seat_%d" % i, cw, D - SHELL_W - 14.0, 19.0,
                      (x, -6.0, PLINT_H + 11.0), soft=0.82, sag=0.17, mat=fs[i])
        P.append(c)
        P.append(B.piping("seam_%d" % i, cw - 2.0, D - SHELL_W - 16.0, 9.5, 11.0,
                          (x, -6.0, PLINT_H + 11.0), thick=1.5, mat=fs[i]))

    # Två lösa ryggkuddar, lutade mot skalet.
    for i, x in enumerate((-(cw/2 + 0.9), cw/2 + 0.9)):
        c = B.cushion("bck_%d" % i, cw - 8.0, 17.0, 30.0,
                      (x, D/2 - SHELL_W - 4.0, PLINT_H + 26.0),
                      soft=0.9, sag=0.05, mat=fs[1-i])
        c.rotation_euler = (math.radians(-15.0), 0, 0)
        P.append(c)
    return P

META = dict(
    id="sofa-rounded-002", name="Rundad loungesoffa",
    display_name="Loungesoffa",
    category="living-room", subcategory="sofas", style="quiet-luxury",
    dimensions_cm=dict(width=int(W), depth=int(D), height=int(H)),
    footprint_cm=dict(width=int(W), depth=int(D)),
    seat_height_cm=42, seats=2,
    materials=["fabric"], default_colors=dict(fabric="cream"),
    recommended_colors=dict(fabric=["cream","sand","greige","taupe","olive","charcoal"]),
)
