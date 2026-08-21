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
SHELL_W, SHELL_H = 15.0, 47.0        # skalets tvärsnitt: en vägg, inte ett rör

def build(fabric="cream", wood=None):
    f  = mats2.boucle(fabric, loop_mm=7.5)
    fs = [mats2.boucle(fabric, loop_mm=7.5) for _ in range(2)]
    P = []

    # Skalet: en U-kurva i planet. Ändarna ligger framme vid sitsens
    # framkant, toppen av bågen ligger i ryggen.
    #
    # Första versionens kurva var handsatta punkter med en extra centimeter
    # i mitten, och avsmalningen varierade längs hela ryggen. Ovanifrån gav
    # det en böljande ytterkontur — en mustasch, inte en oval. Bågen byggs
    # nu matematiskt: raka sidor, två hörnbågar med KONSTANT radie, rak
    # rygg. Och avsmalningen är konstant över hela mittpartiet och rör sig
    # bara på de yttersta tjugo procenten. Konturen kan då inte vaja.
    hx = W/2 - SHELL_W/2
    by = D/2 - SHELL_W/2
    fy = -D/2 + SHELL_W/2 + 4.0
    RC = 52.0                                   # hörnradie i planet
    span = by - fy

    def z_at(y):
        """Skalet stiger jämnt från främre spetsen till ryggen."""
        t = min(1.0, max(0.0, (y - fy)/span))
        return SEAT_Z + 1.0 + 8.0*(t*t*(3.0 - 2.0*t))

    path = [(hx, fy, z_at(fy)), (hx, by - RC, z_at(by - RC))]
    for k in range(1, 6):                       # höger hörnbåge
        a = math.radians(90.0*k/6.0)
        x = hx - RC + RC*math.cos(a)
        y = by - RC + RC*math.sin(a)
        path.append((x, y, z_at(y)))
    path.append((hx - RC, by, z_at(by)))
    path.append((-(hx - RC), by, z_at(by)))
    for k in range(5, 0, -1):                   # vänster hörnbåge
        a = math.radians(90.0*k/6.0)
        x = -(hx - RC + RC*math.cos(a))
        y = by - RC + RC*math.sin(a)
        path.append((x, y, z_at(y)))
    path += [(-hx, by - RC, z_at(by - RC)), (-hx, fy, z_at(fy))]

    # Tvärsnittet är en rundad rektangel, inte en oval. Med ett ovalt snitt
    # på 30 x 34 cm blev skalet tre feta valsar som satt ihop — en korv.
    # Väggsnittet ger en rak yttersida och en mjukt rundad överkant, och
    # först då läser formen som en soffa.
    shell = B.sweep("shell", path, SHELL_W, SHELL_H, cyclic=False, mat=f,
                    profile="rrect", corner=7.0,
                    taper=[(-100, 0.88, 0), (-88, 0.98, 0), (-70, 1.0, 0),
                           (  70, 1.0,  0), ( 88, 0.98, 0), (100, 0.88, 0)])
    P.append(shell)

    # Sockel: rundad, indragen, låg.
    P.append(B.rounded_plate("plinth", W - 34.0, D - 30.0, PLINT_H, 18.0,
                             (0, 0, 0), mat=f, seg=8))

    # Sitsen låg förut längre fram än skalets främre spetsar, så dynorna
    # rann ut framför armarna och hela ytan lästes uppifrån som en enda
    # ljus platta. En loungesoffa OMSLUTER sitsen — armarna ska sticka fram
    # förbi dynans framkant. Sitsen dras därför bakåt och blir grundare.
    SEAT_D = 62.0
    SEAT_Y = -2.0
    P.append(B.rounded_plate("bed", W - SHELL_W*2.0 - 4.0, SEAT_D + 6.0, 12.0, 14.0,
                             (0, SEAT_Y, PLINT_H), mat=f, seg=8))

    # Två djupa dynor med rundad framkant.
    cw = (W - SHELL_W*2.0 - 4.0)/2 - 1.6
    for i, x in enumerate((-(cw/2 + 0.9), cw/2 + 0.9)):
        c = B.cushion("seat_%d" % i, cw, SEAT_D, 21.0,
                      (x, SEAT_Y, PLINT_H + 14.0), soft=0.82, sag=0.17, mat=fs[i])
        P.append(c)
        P.append(B.piping("seam_%d" % i, cw - 2.0, SEAT_D - 2.0, 10.5, 11.0,
                          (x, SEAT_Y, PLINT_H + 14.0), thick=1.5, mat=fs[i]))

    # Två lösa ryggkuddar, lutade mot skalet.
    for i, x in enumerate((-(cw/2 + 0.9), cw/2 + 0.9)):
        c = B.cushion("bck_%d" % i, cw - 2.0, 30.0, 34.0,
                      (x, D/2 - SHELL_W - 13.0, PLINT_H + 31.0),
                      soft=0.9, sag=0.06, mat=fs[1-i])
        c.rotation_euler = (math.radians(-13.0), 0, 0)
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
