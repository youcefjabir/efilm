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

# Fysiska föremål har ingen matematiskt skarp kant. Varje kant har en liten
# radie, och den radien fångar en ljus linje. Det är den linjen ögat läser som
# "tillverkat föremål" i stället för "polygon". Bevel-noden rundar normalen
# utan att ändra geometrin, så den kan ligga på precis allt utan att kosta
# något i modellbygget.
BEVEL_CM = 0.32

def bevel(nt, cm=BEVEL_CM, samples=6):
    bv = nt.nodes.new("ShaderNodeBevel")
    bv.samples = samples
    bv.inputs['Radius'].default_value = cm/100.0
    return bv.outputs['Normal']

def _bump(nt, b, height_src, strength, dist_cm):
    bm = nt.nodes.new("ShaderNodeBump")
    bm.inputs['Strength'].default_value = strength
    bm.inputs['Distance'].default_value = dist_cm/100.0
    nt.links.new(height_src, bm.inputs['Height'])
    nt.links.new(bevel(nt), bm.inputs['Normal'])
    nt.links.new(bm.outputs['Normal'], b.inputs['Normal'])
    return bm

def macro(nt, b, prev_bump, scale_cm=13.0, strength=0.30, dist_cm=0.55,
          detail=4.0, distort=0.35):
    """Storskalig ojämnhet ovanpå materialets egen struktur.

       Katalogvyn har omkring 2 px/cm. Allt under en halv centimeter är
       borta där. Det här lagret ligger i decimeterskala och syns därför i
       BÅDA vyerna — det är det som gör att en dyna har form på håll i
       stället för att vara en färgplätt."""
    co = _coord(nt, scale_cm)
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs['Scale'].default_value = 1.0
    n.inputs['Detail'].default_value = detail
    n.inputs['Roughness'].default_value = 0.55
    n.inputs['Distortion'].default_value = distort
    nt.links.new(co.outputs['Vector'], n.inputs['Vector'])
    bm = nt.nodes.new("ShaderNodeBump")
    bm.inputs['Strength'].default_value = strength
    bm.inputs['Distance'].default_value = dist_cm/100.0
    nt.links.new(n.outputs['Fac'], bm.inputs['Height'])
    if prev_bump is not None:
        nt.links.new(prev_bump.outputs['Normal'], bm.inputs['Normal'])
    else:
        nt.links.new(bevel(nt), bm.inputs['Normal'])
    nt.links.new(bm.outputs['Normal'], b.inputs['Normal'])
    return n

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
    fine = _bump(nt, b, h.outputs[0], 0.85, 0.11)

    # MAKROLAGER.
    #
    # Väven är 9 mm. I topvyn är det 5,4 bildpunkter och syns; i katalogvyn
    # täcker ramen omkring 2,4 meter på 1200 punkter, alltså 2 px/cm, och då
    # är väven 1,8 punkter — den försvinner helt och tyget blir en platt
    # färgplätt. Det var precis det som såg ut som lera.
    #
    # Lösningen är inte en grövre väv, för då blir soffan en säckväv. Det som
    # bär tyget på håll är storskalig ojämnhet: stoppningens veck, ljusets
    # variation över en dyna, en aning skiftande ton. Rapporten här är
    # 14 cm — 28 punkter i katalogvyn och 84 i topvyn, alltså synlig i båda.
    mac = _coord(nt, 14.0)
    macro = nt.nodes.new("ShaderNodeTexNoise")
    macro.inputs['Scale'].default_value = 1.0
    macro.inputs['Detail'].default_value = 4.0
    macro.inputs['Roughness'].default_value = 0.55
    macro.inputs['Distortion'].default_value = 0.35
    nt.links.new(mac.outputs['Vector'], macro.inputs['Vector'])
    mb = nt.nodes.new("ShaderNodeBump")
    mb.inputs['Strength'].default_value = 0.30
    mb.inputs['Distance'].default_value = 0.0055
    nt.links.new(macro.outputs['Fac'], mb.inputs['Height'])
    nt.links.new(fine.outputs['Normal'], mb.inputs['Normal'])
    nt.links.new(mb.outputs['Normal'], b.inputs['Normal'])

    # långsam tonvariation: ojämn infärgning
    slow = nt.nodes.new("ShaderNodeTexNoise")
    slow.inputs['Scale'].default_value = 0.30
    slow.inputs['Detail'].default_value = 3.0
    nt.links.new(co.outputs['Vector'], slow.inputs['Vector'])
    both = nt.nodes.new("ShaderNodeMix"); both.data_type = 'FLOAT'
    both.inputs[0].default_value = 0.52
    nt.links.new(slow.outputs['Fac'], both.inputs[2])
    nt.links.new(cross.outputs[0], both.inputs[3])
    withmac = nt.nodes.new("ShaderNodeMix"); withmac.data_type = 'FLOAT'
    withmac.inputs[0].default_value = 0.45
    nt.links.new(both.outputs[0], withmac.inputs[2])
    nt.links.new(macro.outputs['Fac'], withmac.inputs[3])
    ramp = _ramp(nt, withmac.outputs[0],
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
    fine = _bump(nt, b, inv.outputs[0], 1.0, 0.16)
    mac = macro(nt, b, fine, 12.0, 0.34, 0.6)
    both = nt.nodes.new("ShaderNodeMix"); both.data_type = 'FLOAT'
    both.inputs[0].default_value = 0.42
    nt.links.new(mix.outputs[0], both.inputs[2])
    nt.links.new(mac.outputs['Fac'], both.inputs[3])
    ramp = _ramp(nt, both.outputs[0],
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
  # Avståndet mellan mörk och ljus åder var bara omkring 20 % på ekarna,
  # och då blir ådringen grötig i stället för tydlig. Riktig ek har mörka
  # strålar mot ett ljust ved; spannet är vidgat därefter.
  "light-oak":          dict(dark=(0.62,0.47,0.30), light=(0.91,0.83,0.67),
                             grain_cm=5.5, warp=0.05, rough=0.44),
  "natural-oak":        dict(dark=(0.46,0.33,0.19), light=(0.85,0.72,0.53),
                             grain_cm=6.0, warp=0.06, rough=0.42),
  "smoked-oak":         dict(dark=(0.19,0.13,0.09), light=(0.58,0.45,0.31),
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
    sqf = nt.nodes.new("ShaderNodeMapping")
    FIG = 1.9                     # figuren är bara svagt riktad
    sqf.inputs['Scale'].default_value = {"x": (1.0, FIG, FIG), "y": (FIG, 1.0, FIG),
                                         "z": (FIG, FIG, 1.0)}[along]
    nt.links.new(co.outputs['Vector'], sqf.inputs['Vector'])
    fig = nt.nodes.new("ShaderNodeTexNoise")
    fig.inputs['Scale'].default_value = 0.34
    fig.inputs['Detail'].default_value = 4.0
    fig.inputs['Distortion'].default_value = 0.25
    nt.links.new(sqf.outputs['Vector'], fig.inputs['Vector'])
    mixh = nt.nodes.new("ShaderNodeMix"); mixh.data_type = 'FLOAT'
    mixh.inputs[0].default_value = 0.46
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
    b.inputs['Specular IOR Level'].default_value = 0.5
    b.inputs['Coat Weight'].default_value = 0.22
    b.inputs['Coat Roughness'].default_value = 0.26
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
def wool(color, pile_mm=9.0, tone=None, rough=0.97, name=None, mask="fabric"):
    rgb = srgb_to_linear(PALETTE[color])
    if tone is None:
        lum = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2]
        tone = 0.10 + 0.42*(1.0 - min(1.0, lum*3.0))
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
    fine = _bump(nt, b, h.outputs[0], 1.0, 0.22)
    macro(nt, b, fine, 16.0, 0.26, 0.7)
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

def metal(color="black", finish="satin", along="z", name=None, mask="metal"):
    """finish: 'chrome' | 'satin' | 'matt'.

       Borstningen går LÄNGS delen, som på riktigt stål. Ett borstat rör som
       borstats runt är omedelbart fel för ögat även om man inte kan säga
       varför. Ruggigheten är dessutom nedskruvad: 0.30 ger en suddig grå yta
       utan reflektion, och det var precis vad våra ben såg ut som."""
    rgb = srgb_to_linear(PALETTE[color])
    R = {"chrome": (0.035, 0.075), "satin": (0.13, 0.22), "matt": (0.32, 0.44)}[finish]
    m = bpy.data.materials.new(name or "metal-" + color)
    nt, b = _nt(m)
    co = _coord(nt, 1.2)
    sq = nt.nodes.new("ShaderNodeMapping")
    K = 34.0
    sq.inputs['Scale'].default_value = {"x": (1.0, K, K), "y": (K, 1.0, K),
                                        "z": (K, K, 1.0)}[along]
    nt.links.new(co.outputs['Vector'], sq.inputs['Vector'])
    br = nt.nodes.new("ShaderNodeTexNoise")
    br.inputs['Scale'].default_value = 1.0
    br.inputs['Detail'].default_value = 6.0
    br.inputs['Roughness'].default_value = 0.75
    nt.links.new(sq.outputs['Vector'], br.inputs['Vector'])
    if finish == "chrome":
        rgb = tuple(min(1.0, c*1.35 + 0.34) for c in rgb)
    b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Metallic'].default_value = 1.0
    rr = _ramp(nt, br.outputs['Fac'], [(0.0, (R[0],)*3), (1.0, (R[1],)*3)])
    nt.links.new(rr.outputs['Color'], b.inputs['Roughness'])
    b.inputs['Anisotropic'].default_value = 0.55 if finish != "chrome" else 0.0
    _bump(nt, b, br.outputs['Fac'], 0.06 if finish == "chrome" else 0.14, 0.003)
    m["vg_group"] = "metal"; m["vg_mask"] = mask; m["vg_color"] = color
    return m

def chrome(name=None, mask="metal"):
    return metal("brushed-steel", finish="chrome", name=name or "chrome", mask=mask)

# ---------------------------------------------------------------------
# KERAMIK OCH LACK
#
# En vit yta utan klarlack är gips. Med klarlack är den porslin. Skillnaden
# är ett coat-lager och en svag ojämnhet i lacken — helt jämn lack läser som
# plast, och det är därför ett coat-brus ligger på ruggigheten.
# ---------------------------------------------------------------------
def ceramic(color="ceramic", gloss=0.055, name=None, mask="stone"):
    rgb = srgb_to_linear(PALETTE[color])
    m = bpy.data.materials.new(name or "ceramic-" + color)
    nt, b = _nt(m)
    co = _coord(nt, 22.0)
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs['Scale'].default_value = 1.0
    n.inputs['Detail'].default_value = 4.0
    nt.links.new(co.outputs['Vector'], n.inputs['Vector'])
    b.inputs['Base Color'].default_value = (*rgb, 1)
    rr = _ramp(nt, n.outputs['Fac'], [(0.0, (gloss,)*3), (1.0, (gloss*2.1,)*3)])
    nt.links.new(rr.outputs['Color'], b.inputs['Roughness'])
    b.inputs['Specular IOR Level'].default_value = 0.62
    b.inputs['Coat Weight'].default_value = 1.0
    b.inputs['Coat Roughness'].default_value = 0.04
    _bump(nt, b, n.outputs['Fac'], 0.07, 0.01)
    m["vg_group"] = "stone"; m["vg_mask"] = mask; m["vg_color"] = color
    return m

def lacquer(color, sheen_rough=0.14, name=None, mask="wood"):
    """Lackad MDF: förvaringsluckor, bordsskivor, sängstommar."""
    rgb = srgb_to_linear(PALETTE[color])
    m = bpy.data.materials.new(name or "lacquer-" + color)
    nt, b = _nt(m)
    co = _coord(nt, 14.0)
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs['Scale'].default_value = 1.0
    n.inputs['Detail'].default_value = 5.0
    nt.links.new(co.outputs['Vector'], n.inputs['Vector'])
    b.inputs['Base Color'].default_value = (*rgb, 1)
    rr = _ramp(nt, n.outputs['Fac'], [(0.0, (sheen_rough,)*3), (1.0, (sheen_rough+0.09,)*3)])
    nt.links.new(rr.outputs['Color'], b.inputs['Roughness'])
    b.inputs['Specular IOR Level'].default_value = 0.55
    b.inputs['Coat Weight'].default_value = 0.55
    b.inputs['Coat Roughness'].default_value = 0.12
    _bump(nt, b, n.outputs['Fac'], 0.10, 0.008)
    m["vg_group"] = "wood"; m["vg_mask"] = mask; m["vg_color"] = color
    return m

# ---------------------------------------------------------------------
# LÄDER
#
# Läder är narv: ett oregelbundet cellmönster med små veck emellan, plus
# en ojämn glans. Utan glansvariationen blir det bara ett brunt tyg.
# ---------------------------------------------------------------------
def leather(color="warm-brown", grain_mm=4.0, name=None, mask="fabric"):
    rgb = srgb_to_linear(PALETTE[color])
    m = bpy.data.materials.new(name or "leather-" + color)
    nt, b = _nt(m)
    co = _coord(nt, grain_mm/10.0)
    cell = nt.nodes.new("ShaderNodeTexVoronoi")
    cell.feature = 'DISTANCE_TO_EDGE'
    cell.inputs['Scale'].default_value = 1.0
    cell.inputs['Randomness'].default_value = 1.0
    nt.links.new(co.outputs['Vector'], cell.inputs['Vector'])
    # Narven är 4 mm och syns bara på nära håll. Vecken är det som bär
    # lädret på avstånd, så de får en egen rapport i decimeterskala.
    cw = _coord(nt, 11.0)
    wr = nt.nodes.new("ShaderNodeTexNoise")
    wr.inputs['Scale'].default_value = 1.0
    wr.inputs['Detail'].default_value = 6.0
    wr.inputs['Roughness'].default_value = 0.5
    wr.inputs['Distortion'].default_value = 0.9
    nt.links.new(cw.outputs['Vector'], wr.inputs['Vector'])
    h = nt.nodes.new("ShaderNodeMix"); h.data_type = 'FLOAT'
    h.inputs[0].default_value = 0.48
    nt.links.new(cell.outputs['Distance'], h.inputs[2])
    nt.links.new(wr.outputs['Fac'], h.inputs[3])
    _bump(nt, b, h.outputs[0], 0.9, 0.24)
    ramp = _ramp(nt, h.outputs[0],
                 [(0.0, _tint(rgb, 0.78)), (0.45, rgb), (1.0, _tint(rgb, 1.16))])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    rr = _ramp(nt, h.outputs[0], [(0.0, (0.52,)*3), (1.0, (0.30,)*3)])
    nt.links.new(rr.outputs['Color'], b.inputs['Roughness'])
    b.inputs['Specular IOR Level'].default_value = 0.48
    b.inputs['Coat Weight'].default_value = 0.14
    b.inputs['Coat Roughness'].default_value = 0.34
    m["vg_group"] = "fabric"; m["vg_mask"] = mask; m["vg_color"] = color
    return m

# ---------------------------------------------------------------------
# BOMULL — BÄDDTEXTIL
#
# Ett täcke i möbeltyg blir en skiva. Bomullslakan är något annat: tätare
# väv, ett kallare vitt, mycket lägre lugg och en tydlig men bruten glans
# eftersom ytan är svagt skrynklig. Skrynklan är hela poängen — ett helt
# slätt vitt fält har ingen form, och det var precis vad täcket saknade.
# ---------------------------------------------------------------------
def cotton(color="warm-white", weave_mm=5.0, crease_cm=9.0, crease=0.55,
           quilt_cm=0.0, name=None, mask="fabric"):
    rgb = srgb_to_linear(PALETTE[color])
    m = bpy.data.materials.new(name or "cotton-" + color)
    nt, b = _nt(m)
    co = _coord(nt, weave_mm/10.0)

    warp = nt.nodes.new("ShaderNodeTexWave")
    warp.wave_type = 'BANDS'; warp.bands_direction = 'X'; warp.wave_profile = 'SIN'
    warp.inputs['Scale'].default_value = 1.0
    warp.inputs['Distortion'].default_value = 0.35
    nt.links.new(co.outputs['Vector'], warp.inputs['Vector'])
    weft = nt.nodes.new("ShaderNodeTexWave")
    weft.wave_type = 'BANDS'; weft.bands_direction = 'Y'; weft.wave_profile = 'SIN'
    weft.inputs['Scale'].default_value = 1.0
    weft.inputs['Distortion'].default_value = 0.35
    nt.links.new(co.outputs['Vector'], weft.inputs['Vector'])
    cross = nt.nodes.new("ShaderNodeMath"); cross.operation = 'MULTIPLY'
    nt.links.new(warp.outputs['Fac'], cross.inputs[0])
    nt.links.new(weft.outputs['Fac'], cross.inputs[1])

    # skrynkla: långa mjuka veck i decimeterskala, det som ger vitt form
    cw = _coord(nt, crease_cm)
    wr = nt.nodes.new("ShaderNodeTexNoise")
    wr.inputs['Scale'].default_value = 1.0
    wr.inputs['Detail'].default_value = 5.0
    wr.inputs['Roughness'].default_value = 0.45
    wr.inputs['Distortion'].default_value = 0.9
    nt.links.new(cw.outputs['Vector'], wr.inputs['Vector'])

    h = nt.nodes.new("ShaderNodeMix"); h.data_type = 'FLOAT'
    h.inputs[0].default_value = crease
    nt.links.new(cross.outputs[0], h.inputs[2])
    nt.links.new(wr.outputs['Fac'], h.inputs[3])
    src = h.outputs[0]

    if quilt_cm > 0:
        # stickningsrutor på ett täcke
        qc = _coord(nt, quilt_cm)
        qx = nt.nodes.new("ShaderNodeTexWave")
        qx.wave_type = 'BANDS'; qx.bands_direction = 'X'; qx.wave_profile = 'SIN'
        qx.inputs['Scale'].default_value = 1.0
        nt.links.new(qc.outputs['Vector'], qx.inputs['Vector'])
        qy = nt.nodes.new("ShaderNodeTexWave")
        qy.wave_type = 'BANDS'; qy.bands_direction = 'Y'; qy.wave_profile = 'SIN'
        qy.inputs['Scale'].default_value = 1.0
        nt.links.new(qc.outputs['Vector'], qy.inputs['Vector'])
        qm = nt.nodes.new("ShaderNodeMath"); qm.operation = 'MULTIPLY'
        nt.links.new(qx.outputs['Fac'], qm.inputs[0])
        nt.links.new(qy.outputs['Fac'], qm.inputs[1])
        qmix = nt.nodes.new("ShaderNodeMix"); qmix.data_type = 'FLOAT'
        # 0.45 gav ett hårt rutmönster över hela täcket — vaffeljärn, inte
        # sängkläder. Stickningen ska anas, inte dominera.
        qmix.inputs[0].default_value = 0.13
        nt.links.new(src, qmix.inputs[2])
        nt.links.new(qm.outputs[0], qmix.inputs[3])
        src = qmix.outputs[0]

    fine = _bump(nt, b, src, 1.0, 0.16)
    macro(nt, b, fine, 19.0, 0.34, 0.9, detail=3.0, distort=0.8)
    ramp = _ramp(nt, src, [(0.12, _tint(rgb, 0.90)), (0.55, rgb), (1.0, _tint(rgb, 1.05))])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    rr = _ramp(nt, src, [(0.0, (0.62,)*3), (1.0, (0.80,)*3)])
    nt.links.new(rr.outputs['Color'], b.inputs['Roughness'])
    b.inputs['Sheen Weight'].default_value = 0.16
    b.inputs['Sheen Roughness'].default_value = 0.55
    b.inputs['Specular IOR Level'].default_value = 0.38
    m["vg_group"] = "fabric"; m["vg_mask"] = mask; m["vg_color"] = color
    return m

def glass(tint=(0.90,0.93,0.92), rough=0.02, name=None, mask="metal"):
    m = bpy.data.materials.new(name or "glass")
    nt, b = _nt(m)
    b.inputs['Base Color'].default_value = (*tint, 1)
    b.inputs['Transmission Weight'].default_value = 1.0
    b.inputs['Roughness'].default_value = rough
    b.inputs['IOR'].default_value = 1.52
    nt.links.new(bevel(nt), b.inputs['Normal'])
    m["vg_group"] = "metal"; m["vg_mask"] = mask; m["vg_color"] = "glass"
    return m
