# -*- coding: utf-8 -*-
"""
MATTBYGGARE

En matta byggs som ett tunt plan med lugg i shadern och ett mönster som
egen geometri ovanpå fältet — inte som en textur. Skälet är maskerna:
motivet måste kunna färgas om utan att fältet följer med, och då måste
motivet vara en egen yta.

Mönstren är originalritade geometriska figurer i berbertradition, inte
kopior av någon kommersiell matta.
"""
import math
from lib import build as B, mats, mats2

T_BASE = 1.5      # fältets tjocklek i cm
T_PAT  = 0.5      # motivet ligger ovanpå fältet, som en tätare lugg

# Fältet byggs med rounded_plate/disc, som lägger origo i underkanten och
# alltså spänner 0..T_BASE. Motivet måste därför placeras på T_BASE, inte
# på halva. Med halva hamnade hela mönstret INUTI mattan och syntes inte
# alls — bara fransen, som sitter utanför kanten, kom fram.

def field(w, d, base_col, shape="rect", pile=0.55):
    # Mattan gick från fabric+rug_pile till ullshadern i V2. rug_pile lade
    # en egen bumpnod SIST i kedjan och kopplade bort allt före den, så en
    # matta fick aldrig något av V2:s struktur. Ull är dessutom rätt
    # material: luggen är knippen, inte väv, och färgen varierar per
    # knippe — det är den variationen som bär mattan rakt uppifrån.
    m = mats2.wool(base_col, pile_mm=11.0 + pile*6.0, tone=0.11, mask="fabric")
    if shape == "round":
        return [B.disc("field", w/2, T_BASE, (0, 0, 0), m, verts=128, bevel=0.2)]
    if shape == "oval":
        return [B.ellipse_plate("field", w, d, T_BASE, (0, 0, 0), mat=m, verts=128)]
    return [B.rounded_plate("field", w, d, T_BASE, 1.2, (0, 0, 0), mat=m, seg=2)]

def pat_mat(col, pile=0.75):
    # Motivet är tätare knutet än fältet: kortare lugg, något mattare.
    # tone sattes explicit till 0.13, vilket slog ut den automatiska
    # mörkerkompensationen i wool(). På kolgrått ger 13 % ingen synlig
    # skillnad alls och romberna blev svarta plattor utan lugg.
    return mats2.wool(col, pile_mm=7.5, rough=0.98, mask="pattern")

def diamonds(w, d, col, rows=3, cols=5, sz=0.62):
    """Berbermotiv: rutade romber i rader. Storleken följer mattan, så
       samma mönster fungerar i 140 × 200 och i 200 × 300."""
    m = pat_mat(col); out = []
    cw, ch = w/(cols+1), d/(rows+1)
    r = min(cw, ch)*sz/2
    for i in range(rows):
        for j in range(cols):
            x = -w/2 + cw*(j+1); y = -d/2 + ch*(i+1)
            q = B.box("dia_%d_%d" % (i, j), r*1.42, r*1.42, T_PAT,
                      (x, y, T_BASE - 0.05), bevel=0.22, mat=m)
            q.rotation_euler = (0, 0, math.radians(45))
            out.append(q)
    return out

def stripes(w, d, col, n=7, frac=0.16):
    m = pat_mat(col, 0.6); out = []
    step = d/(n+1)
    for i in range(n):
        y = -d/2 + step*(i+1)
        out.append(B.box("stripe_%d" % i, w - 6.0, step*frac*2, T_PAT,
                         (0, y, T_BASE - 0.05), bevel=0.2, mat=m))
    return out

def border(w, d, col, inset=9.0, t=1.6):
    m = pat_mat(col, 0.6); out = []
    for sy in (-1, 1):
        out.append(B.box("bd_h%d" % sy, w - 2*inset, t, T_PAT,
                         (0, sy*(d/2 - inset), T_BASE - 0.05), bevel=0.2, mat=m))
    for sx in (-1, 1):
        out.append(B.box("bd_v%d" % sx, t, d - 2*inset - 2*t, T_PAT,
                         (sx*(w/2 - inset), 0, T_BASE - 0.05), bevel=0.2, mat=m))
    return out

def fringe(w, d, col, side=1, n=64, ln=7.0):
    """Frans längs kortsidorna. Trådarna är enkla smala lådor — på sex
       pixlar per centimeter läses de som frans och inget mer."""
    m = mats.make("fabric", col, mask="fabric"); out = []
    for i in range(n):
        x = -w/2 + (i + 0.5)*w/n
        out.append(B.box("fr_%d_%d" % (side, i), w/n*0.42, ln, T_BASE*0.55,
                         (x, side*(d/2 + ln/2 - 0.4), T_BASE*0.35), bevel=0.05, mat=m))
    return out
