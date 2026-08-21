# -*- coding: utf-8 -*-
"""
MATERIALSYSTEM V2

Kritiken mot V1 var riktig: möblerna var enfärgade 3D-former. Ett tyg
var en beige yta, tre träslag var tre bruna färger, och en matta var en
polygon. Det här är omskrivningen.

Tre saker skiljer V2 från V1.

FÖRSTA: strukturen är RIKTAD. V1 använde isotropiskt brus, som ser
likadant ut åt alla håll och därför inte läses som något alls. Tyg har
varp och väft, trä har fiberriktning, ull har luggriktning. Riktningen
är det som gör att ögat känner igen materialet.

ANDRA: strukturen är skalad i CENTIMETER, inte i shader-enheter. En
väv med 3 mm rapport försvinner vid sex bildpunkter per centimeter. Allt
nedan är räknat mot topvyns skala, för det är där materialet ska synas.

TREDJE: färgen varierar. En riktig yta har tonvariation — ojämn
infärgning i tyg, ådring i trä, mineral i sten. En platt basfärg är den
enskilt tydligaste signalen om att något är en 3D-modell och inte en
möbel.
"""
import bpy, math
from .mats import PALETTE, srgb_to_linear

GROUPS = ("fabric", "pattern", "wood", "metal", "stone")

def _nt(m):
    m.use_nodes = True
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    return nt, b

def _coord(nt, scale_cm, obj_scale=1.0):
    """Texturkoordinater i centimeter. scale_cm = rapportens längd i cm.
       Object-koordinater ger stabil skala oavsett objektets storlek."""
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    f = 100.0 / max(scale_cm, 0.01)          # 1 blenderenhet = 1 m = 100 cm
    mp.inputs['Scale'].default_value = (f, f, f)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    return mp

def _ramp(nt, src, stops):
    r = nt.nodes.new("ShaderNodeValToRGB")
    el = r.color_ramp.elements
    while len(el) > 1: el.remove(el[-1])
    el[0].position, el[0].color = stops[0][0], (*stops[0][1], 1)
    for p, c in stops[1:]:
        e = el.new(p); e.color = (*c, 1)
    nt.links.new(src, r.inputs['Fac'])
    return r

def _mix_rgb(nt, a_src, b_src, fac_src, fac=0.5):
    mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = 'RGBA'
    mx.inputs[0].default_value = fac
    if fac_src: nt.links.new(fac_src, mx.inputs[0])
    nt.links.new(a_src, mx.inputs[6]); nt.links.new(b_src, mx.inputs[7])
    return mx.outputs[2]

def _bump(nt, b, height_src, strength, dist_cm):
    bm = nt.nodes.new("ShaderNodeBump")
    bm.inputs['Strength'].default_value = strength
    bm.inputs['Distance'].default_value = dist_cm/100.0
    nt.links.new(height_src, bm.inputs['Height'])
    nt.links.new(bm.outputs['Normal'], b.inputs['Normal'])
    return bm

def _tint(rgb, k):
    return tuple(min(1.0, max(0.0, c*k)) for c in rgb)

# ---------------------------------------------------------------------
# TYG
#
# En väv är två trådsystem i rät vinkel. Två vågnoder i kors ger just
# det, och rapporten sätts i millimeter så den syns vid planritningens
# skala utan att bli en tygprovkarta. Ovanpå väven ligger en långsam
# tonvariation som imiterar ojämn infärgning.
# ---------------------------------------------------------------------
def fabric(color, weave_mm=9.0, tone=None, sheen=0.34, name=None, mask="fabric", jitter=0.0):
    rgb = srgb_to_linear(PALETTE[color])
    # En mörk yta tål — och behöver — större relativ tonvariation än en
    # ljus. Olive såg platt ut med samma 5,5 % som sand.
    if tone is None:
        lum = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]
        tone = 0.085 + 0.17*(1.0 - min(1.0, lum*2.2))
    # jitter ger en dyna en aning annan ton än grannen. Riktiga dynor är
    # aldrig exakt lika, och skillnaden är det som gör att tre sittdynor
    # läses som tre dynor och inte som ett fält.
    if jitter:
        rgb = tuple(min(1.0, max(0.0, c*(1.0 + jitter))) for c in rgb)
    m = bpy.data.materials.new(name or "fabric-" + color)
    nt, b = _nt(m)
    co = _coord(nt, weave_mm/10.0)

    warp = nt.nodes.new("ShaderNodeTexWave")
    warp.wave_type = 'BANDS'; warp.bands_direction = 'X'
    warp.wave_profile = 'SIN'
    warp.inputs['Scale'].default_value = 1.0
    warp.inputs['Distortion'].default_value = 0.6
    warp.inputs['Detail'].default_value = 1.0
    nt.links.new(co.outputs['Vector'], warp.inputs['Vector'])

    weft = nt.nodes.new("ShaderNodeTexWave")
    weft.wave_type = 'BANDS'; weft.bands_direction = 'Y'
    weft.wave_profile = 'SIN'
    weft.inputs['Scale'].default_value = 1.0
    weft.inputs['Distortion'].default_value = 0.6
    weft.inputs['Detail'].default_value = 1.0
    nt.links.new(co.outputs['Vector'], weft.inputs['Vector'])

    cross = nt.nodes.new("ShaderNodeMath"); cross.operation = 'MULTIPLY_ADD'
    nt.links.new(warp.outputs['Fac'], cross.inputs[0])
    nt.links.new(weft.outputs['Fac'], cross.inputs[1])
    cross.inputs[2].default_value = 0.0

    # fiberludd ovanpå väven, mycket finare
    fuzz = nt.nodes.new("ShaderNodeTexNoise")
    fuzz.inputs['Scale'].default_value = 26.0
    fuzz.inputs['Detail'].default_value = 8.0
    fuzz.inputs['Roughness'].default_value = 0.72
    nt.links.new(co.outputs['Vector'], fuzz.inputs['Vector'])

    h = nt.nodes.new("ShaderNodeMix"); h.data_type = 'FLOAT'
    h.inputs[0].default_value = 0.32
    nt.links.new(cross.outputs[0], h.inputs[2])
    nt.links.new(fuzz.outputs['Fac'], h.inputs[3])
    _bump(nt, b, h.outputs[0], 0.85, 0.11)

    # långsam tonvariation: ojämn infärgning
    slow = nt.nodes.new("ShaderNodeTexNoise")
    slow.inputs['Scale'].default_value = 0.30
    slow.inputs['Detail'].default_value = 3.0
    nt.links.new(co.outputs['Vector'], slow.inputs['Vector'])
    both = nt.nodes.new("ShaderNodeMix"); both.data_type = 'FLOAT'
    both.inputs[0].default_value = 0.52
    nt.links.new(slow.outputs['Fac'], both.inputs[2])
    nt.links.new(cross.outputs[0], both.inputs[3])
    ramp = _ramp(nt, both.outputs[0],
                 [(0.22, _tint(rgb, 1.0 - tone)), (0.78, _tint(rgb, 1.0 + tone))])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])

    # ruggigheten varierar med väven — det är det som ger tyget liv i ljuset
    rr = _ramp(nt, cross.outputs[0], [(0.0, (0.86, 0.86, 0.86)), (1.0, (0.97, 0.97, 0.97))])
    nt.links.new(rr.outputs['Color'], b.inputs['Roughness'])
    b.inputs['Sheen Weight'].default_value = sheen
    b.inputs['Sheen Roughness'].default_value = 0.38
    b.inputs['Specular IOR Level'].default_value = 0.22
    m["vg_group"] = "fabric"; m["vg_mask"] = mask; m["vg_color"] = color
    return m

# ---------------------------------------------------------------------
# BOUCLÉ
#
# Bouclé är inte en väv utan små öglor. Voronoi ger klumpar; två lager
# med olika skala ger den ojämna fiberkaraktären utan att bli macro.
# ---------------------------------------------------------------------
def boucle(color, loop_mm=7.0, name=None, mask="fabric"):
    rgb = srgb_to_linear(PALETTE[color])
    m = bpy.data.materials.new(name or "boucle-" + color)
    nt, b = _nt(m)
    co = _coord(nt, loop_mm/10.0)
    v1 = nt.nodes.new("ShaderNodeTexVoronoi")
    v1.feature = 'F1'; v1.distance = 'EUCLIDEAN'
    v1.inputs['Scale'].default_value = 1.0
    v1.inputs['Randomness'].default_value = 1.0
    nt.links.new(co.outputs['Vector'], v1.inputs['Vector'])
    v2 = nt.nodes.new("ShaderNodeTexVoronoi")
    v2.inputs['Scale'].default_value = 2.6
    v2.inputs['Randomness'].default_value = 1.0
    nt.links.new(co.outputs['Vector'], v2.inputs['Vector'])
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = 'FLOAT'
    mix.inputs[0].default_value = 0.42
    nt.links.new(v1.outputs['Distance'], mix.inputs[2])
    nt.links.new(v2.outputs['Distance'], mix.inputs[3])
    inv = nt.nodes.new("ShaderNodeMath"); inv.operation = 'SUBTRACT'
    inv.inputs[0].default_value = 1.0
    nt.links.new(mix.outputs[0], inv.inputs[1])
    _bump(nt, b, inv.outputs[0], 1.0, 0.16)
    ramp = _ramp(nt, mix.outputs[0],
                 [(0.05, _tint(rgb, 1.10)), (0.55, rgb), (1.0, _tint(rgb, 0.86))])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.95
    b.inputs['Sheen Weight'].default_value = 0.55
    b.inputs['Sheen Roughness'].default_value = 0.30
    b.inputs['Specular IOR Level'].default_value = 0.18
    m["vg_group"] = "fabric"; m["vg_mask"] = mask; m["vg_color"] = color
    return m

# ---------------------------------------------------------------------
# TRÄ
#
# Tre träslag får inte vara tre bruna färger. Skillnaden mellan ek och
# valnöt sitter i ådringens BREDD, kontrast och hur rak den är: ek har
# tät, rak, lågkontrastig ådring; valnöt har bredare, mörkare och mer
# svängd figur. Det ligger i parametrarna nedan, inte i basfärgen.
#
# Ådringen görs som ihoptryckt brus — brus skalat hårt i en riktning
# blir strimmor, och strimmor är vad ådring är.
# ---------------------------------------------------------------------
# Varje träslag beskrivs av TVÅ färger — den ljusa och den mörka ådern —
# angivna i sRGB, alltså som de ser ut. Multiplikativ tonning fungerade
# för ljus ek men dog på valnöt: en procentuell variation på en mörk yta
# ger nästan ingen synlig skillnad. Färgparen gör skillnaden explicit.
WOOD = {
  "light-oak":          dict(dark=(0.72,0.58,0.40), light=(0.87,0.77,0.60),
                             grain_cm=5.5, warp=0.05, rough=0.44),
  "natural-oak":        dict(dark=(0.58,0.44,0.28), light=(0.80,0.66,0.47),
                             grain_cm=6.0, warp=0.06, rough=0.42),
  "smoked-oak":         dict(dark=(0.26,0.19,0.13), light=(0.52,0.40,0.28),
                             grain_cm=6.5, warp=0.09, rough=0.38),
  "walnut":             dict(dark=(0.20,0.13,0.09), light=(0.48,0.32,0.21),
                             grain_cm=9.0, warp=0.14, rough=0.34),
  "dark-wood":          dict(dark=(0.13,0.09,0.07), light=(0.34,0.24,0.17),
                             grain_cm=8.0, warp=0.12, rough=0.36),
  "black-stained-wood": dict(dark=(0.055,0.052,0.050), light=(0.17,0.16,0.15),
                             grain_cm=6.0, warp=0.06, rough=0.40),
}

def wood(species, along="y", name=None, mask="wood"):
    """along = fiberriktningen. En bordsskiva har fibern längs långsidan;
       ett ben har den längs benet. Att fibern följer delen är en av de
       tydligaste signalerna om att något är verkligt trä."""
    w = WOOD[species]
    c_dark  = srgb_to_linear(w["dark"])
    c_light = srgb_to_linear(w["light"])
    m = bpy.data.materials.new(name or "wood-" + species)
    nt, b = _nt(m)
    co = _coord(nt, w["grain_cm"])
    # tryck ihop koordinaten tvärs fibern -> strimmor
    sq = nt.nodes.new("ShaderNodeMapping")
    ACROSS = 5.0
    s = {"x": (1.0, ACROSS, ACROSS), "y": (ACROSS, 1.0, ACROSS),
         "z": (ACROSS, ACROSS, 1.0)}[along]
    sq.inputs['Scale'].default_value = s
    nt.links.new(co.outputs['Vector'], sq.inputs['Vector'])

    grain = nt.nodes.new("ShaderNodeTexNoise")
    grain.inputs['Scale'].default_value = 1.0
    grain.inputs['Detail'].default_value = 9.0
    grain.inputs['Roughness'].default_value = 0.62
    grain.inputs['Distortion'].default_value = w["warp"]
    nt.links.new(sq.outputs['Vector'], grain.inputs['Vector'])

    # Bredare figur ovanpå den täta ådringen. Den måste också vara RIKTAD,
    # annars suddar den ut ådringen i stället för att komplettera den.
    # Distortion är nästan avstängd av samma skäl: den warpar koordinaten
    # och river sönder riktningen, vilket var därför valnöt — som hade
    # högst distortion — blev plattast av alla träslagen.
    fig = nt.nodes.new("ShaderNodeTexNoise")
    fig.inputs['Scale'].default_value = 0.30
    fig.inputs['Detail'].default_value = 3.0
    fig.inputs['Distortion'].default_value = 0.0
    nt.links.new(sq.outputs['Vector'], fig.inputs['Vector'])
    mixh = nt.nodes.new("ShaderNodeMix"); mixh.data_type = 'FLOAT'
    mixh.inputs[0].default_value = 0.28
    nt.links.new(grain.outputs['Fac'], mixh.inputs[2])
    nt.links.new(fig.outputs['Fac'], mixh.inputs[3])

    mid = tuple((c_dark[i]*0.45 + c_light[i]*0.55) for i in range(3))
    ramp = _ramp(nt, mixh.outputs[0],
                 [(0.18, c_dark), (0.52, mid), (0.86, c_light)])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    # porerna: mycket grund relief längs fibern
    _bump(nt, b, grain.outputs['Fac'], 0.35, 0.022)
    rr = _ramp(nt, grain.outputs['Fac'],
               [(0.0, (w["rough"]-0.06,)*3), (1.0, (w["rough"]+0.06,)*3)])
    nt.links.new(rr.outputs['Color'], b.inputs['Roughness'])
    b.inputs['Specular IOR Level'].default_value = 0.46
    m["vg_group"] = "wood"; m["vg_mask"] = mask; m["vg_color"] = species
    return m

# ---------------------------------------------------------------------
# STEN
#
# Travertin är inte en beige cirkel. Den har lager, porer och en ådring
# som löper i skikt. Musgrave-liknande brus i band ger skiktningen,
# voronoi ger porerna.
# ---------------------------------------------------------------------
def stone(color="travertine", vein_cm=9.0, name=None, mask="stone"):
    rgb = srgb_to_linear(PALETTE[color])
    m = bpy.data.materials.new(name or "stone-" + color)
    nt, b = _nt(m)
    co = _coord(nt, vein_cm)
    sq = nt.nodes.new("ShaderNodeMapping")
    sq.inputs['Scale'].default_value = (1.0, 2.1, 1.0)     # svag skiktning, inte strimmor
    nt.links.new(co.outputs['Vector'], sq.inputs['Vector'])
    lay = nt.nodes.new("ShaderNodeTexNoise")
    lay.inputs['Scale'].default_value = 1.0
    lay.inputs['Detail'].default_value = 7.0
    lay.inputs['Distortion'].default_value = 0.9
    nt.links.new(sq.outputs['Vector'], lay.inputs['Vector'])
    por = nt.nodes.new("ShaderNodeTexVoronoi")
    por.inputs['Scale'].default_value = 5.5
    por.inputs['Randomness'].default_value = 1.0
    nt.links.new(co.outputs['Vector'], por.inputs['Vector'])
    # porerna färgar också, inte bara relief — det är det som skiljer
    # travertin från en jämn beige skiva
    pm = nt.nodes.new("ShaderNodeMix"); pm.data_type = 'FLOAT'
    pm.inputs[0].default_value = 0.38
    nt.links.new(lay.outputs['Fac'], pm.inputs[2])
    nt.links.new(por.outputs['Distance'], pm.inputs[3])
    ramp = _ramp(nt, pm.outputs[0],
                 [(0.22, _tint(rgb, 0.86)), (0.50, rgb), (0.80, _tint(rgb, 1.08))])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    h = nt.nodes.new("ShaderNodeMix"); h.data_type = 'FLOAT'
    h.inputs[0].default_value = 0.45
    nt.links.new(lay.outputs['Fac'], h.inputs[2])
    nt.links.new(por.outputs['Distance'], h.inputs[3])
    _bump(nt, b, h.outputs[0], 0.30, 0.02)
    b.inputs['Roughness'].default_value = 0.36
    b.inputs['Specular IOR Level'].default_value = 0.52
    m["vg_group"] = "stone"; m["vg_mask"] = mask; m["vg_color"] = color
    return m

# ---------------------------------------------------------------------
# ULL OCH MATTOR
#
# Luggen måste synas RAKT UPPIFRÅN. Det var V1:s stora fel: bumpen låg
# i en riktning där topljuset inte kunde skugga den. Här ligger luggen
# som riktade fiberknippen med kraftigare relief, och basfärgen varierar
# per knippe — det är variationen, inte skuggan, som bär strukturen när
# ljuset kommer uppifrån.
# ---------------------------------------------------------------------
def wool(color, pile_mm=9.0, tone=0.10, rough=0.97, name=None, mask="fabric"):
    rgb = srgb_to_linear(PALETTE[color])
    m = bpy.data.materials.new(name or "wool-" + color)
    nt, b = _nt(m)
    co = _coord(nt, pile_mm/10.0)
    tuft = nt.nodes.new("ShaderNodeTexVoronoi")
    tuft.feature = 'F1'
    tuft.inputs['Scale'].default_value = 1.0
    tuft.inputs['Randomness'].default_value = 1.0
    nt.links.new(co.outputs['Vector'], tuft.inputs['Vector'])
    fib = nt.nodes.new("ShaderNodeTexNoise")
    fib.inputs['Scale'].default_value = 4.2
    fib.inputs['Detail'].default_value = 9.0
    fib.inputs['Roughness'].default_value = 0.78
    nt.links.new(co.outputs['Vector'], fib.inputs['Vector'])
    h = nt.nodes.new("ShaderNodeMix"); h.data_type = 'FLOAT'
    h.inputs[0].default_value = 0.50
    nt.links.new(tuft.outputs['Distance'], h.inputs[2])
    nt.links.new(fib.outputs['Fac'], h.inputs[3])
    _bump(nt, b, h.outputs[0], 1.0, 0.22)
    # färgvariation per knippe — bär strukturen även i platt ljus
    ramp = _ramp(nt, h.outputs[0],
                 [(0.10, _tint(rgb, 1.0 + tone)), (0.55, rgb), (1.0, _tint(rgb, 1.0 - tone*1.4))])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough
    b.inputs['Sheen Weight'].default_value = 0.60
    b.inputs['Sheen Roughness'].default_value = 0.25
    b.inputs['Specular IOR Level'].default_value = 0.14
    m["vg_group"] = "fabric"; m["vg_mask"] = mask; m["vg_color"] = color
    return m

def metal(color="black", name=None, mask="metal"):
    rgb = srgb_to_linear(PALETTE[color])
    m = bpy.data.materials.new(name or "metal-" + color)
    nt, b = _nt(m)
    co = _coord(nt, 0.6)
    br = nt.nodes.new("ShaderNodeTexNoise")
    br.inputs['Scale'].default_value = 1.0
    br.inputs['Detail'].default_value = 5.0
    nt.links.new(co.outputs['Vector'], br.inputs['Vector'])
    b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Metallic'].default_value = 1.0
    rr = _ramp(nt, br.outputs['Fac'], [(0.0, (0.28,)*3), (1.0, (0.42,)*3)])
    nt.links.new(rr.outputs['Color'], b.inputs['Roughness'])
    _bump(nt, b, br.outputs['Fac'], 0.12, 0.004)
    m["vg_group"] = "metal"; m["vg_mask"] = mask; m["vg_color"] = color
    return m
