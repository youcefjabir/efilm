# -*- coding: utf-8 -*-
"""
MATERIAL

Fyra grupper, och bara fyra: fabric, wood, metal, stone. Varje yta i
biblioteket tillhör exakt en av dem. Det är den indelningen maskerna
bygger på, och den som gör att en beige soffa kan bli oliv utan att
träbenen följer med.

Texturerna är avsiktligt återhållna. En soffa i ett planritningsbibliotek
ska läsa som tyg, inte som en tygprovkarta.
"""
import bpy

GROUPS = ("fabric", "wood", "metal", "stone")

PALETTE = {
 # tyg
 "cream":(0.855,0.835,0.795), "warm-white":(0.905,0.890,0.860),
 "sand":(0.760,0.712,0.630),  "beige":(0.700,0.655,0.585),
 # greige: den grå-beige som är V1:s textilbas enligt planen
 "greige":(0.678,0.652,0.612),
 "taupe":(0.545,0.505,0.462), "light-grey":(0.672,0.672,0.665),
 "medium-grey":(0.470,0.472,0.470), "charcoal":(0.212,0.215,0.218),
 "warm-brown":(0.385,0.300,0.232), "olive":(0.372,0.382,0.290),
 "muted-green":(0.418,0.455,0.400),
 # trä
 "light-oak":(0.760,0.640,0.470), "natural-oak":(0.660,0.520,0.352),
 "smoked-oak":(0.352,0.268,0.196), "walnut":(0.290,0.192,0.128),
 "dark-wood":(0.185,0.135,0.098), "black-stained-wood":(0.085,0.078,0.072),
 # metall
 "black":(0.055,0.055,0.058), "dark-bronze":(0.152,0.122,0.095),
 "brushed-steel":(0.560,0.565,0.575), "warm-metal":(0.545,0.442,0.288),
 # sten
 "travertine":(0.775,0.735,0.672), "warm-stone":(0.700,0.672,0.630),
 "dark-stone":(0.250,0.248,0.245), "ceramic":(0.815,0.805,0.788),
}

def srgb_to_linear(c):
    """Paletten är skriven som sRGB, alltså som färgerna SER ut. Blender vill
       ha linjärt. Utan den här omräkningen renderades sand som nästan vitt
       och hela paletten tappade sin karaktär."""
    return tuple(x/12.92 if x <= 0.04045 else ((x+0.055)/1.055)**2.4 for x in c)

def _pbsdf(nt):
    for n in nt.nodes:
        if n.type == 'BSDF_PRINCIPLED': return n
    return None

def _tex(nt, bsdf, kind, scale, bump):
    """Subtil ytstruktur via bumpnod. Ingen färgtextur — färgen är platt och
       styrs av paletten, vilket är precis vad maskerna behöver."""
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs['Scale'].default_value = scale
    n.inputs['Detail'].default_value = 6.0
    n.inputs['Roughness'].default_value = 0.62
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs['Strength'].default_value = bump
    b.inputs['Distance'].default_value = 0.0016
    nt.links.new(n.outputs['Fac'], b.inputs['Height'])
    nt.links.new(b.outputs['Normal'], bsdf.inputs['Normal'])
    if kind == "weave":
        w = nt.nodes.new("ShaderNodeTexWave")
        w.wave_type = 'BANDS'; w.bands_direction = 'DIAGONAL'
        w.inputs['Scale'].default_value = scale*0.5
        w.inputs['Distortion'].default_value = 2.0
        mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = 'FLOAT'
        mix.inputs[0].default_value = 0.35
        nt.links.new(n.outputs['Fac'], mix.inputs[2])
        nt.links.new(w.outputs['Fac'], mix.inputs[3])
        nt.links.new(mix.outputs[0], b.inputs['Height'])

def make(group, color_name, name=None, mask=None, along=None, finish=None):
    """Ett material ur en av de fyra grupperna.

       ÖVERGÅNG TILL V2. Tolv av modellerna byggdes mot den här funktionen
       medan tre skrevs om mot mats2. Resultatet syntes direkt: det ovala
       matbordet renderades som en platt orange skiva bredvid en soffa med
       synlig väv. Skillnaden var inte modellen utan shadern.

       I stället för att skriva om tolv modellfiler pekar den gamla
       ingången nu på V2. Anropen ser likadana ut, ytorna blir de nya.
       mask, vg_group och vg_color sätts av V2-funktionerna på exakt samma
       sätt, så maskrenderingen och omfärgningen är oförändrade.

       along och finish är nya och frivilliga: fiberriktning för trä,
       ytbehandling för metall. Utan dem gäller vettiga standardvärden."""
    from . import mats2
    if group == "fabric":
        return mats2.fabric(color_name, name=name, mask=mask or "fabric")
    if group == "wood":
        return mats2.wood(color_name, along=along or "y",
                          name=name, mask=mask or "wood")
    if group == "metal":
        return mats2.metal(color_name, finish=finish or "satin",
                           along=along or "z", name=name, mask=mask or "metal")
    if group == "stone":
        return mats2.stone(color_name, name=name, mask=mask or "stone")
    raise ValueError("okänd materialgrupp: " + group)

# ---------------------------------------------------------------------
# MATTOR
#
# En matta är inte en möbel med en färg utan en yta med ett mönster, och
# mönstret måste gå att färga om separat. Därför får fältet och motivet
# två material i samma grupp men med olika mask: "fabric" och "pattern".
#
# Luggen görs med förskjutning i shadern, inte med geometri. Det ger
# textur i topvyn utan att en matta kostar en miljon polygoner.
# ---------------------------------------------------------------------
def rug_pile(mat, scale=150.0, strength=0.95, dist=0.007):
    """Luggen måste synas vid 6 px/cm, annars blir mattan en platt
       rektangel — precis det punkt 33 förbjuder. Med skala 760 blev
       varje fiber 2,6 mm, alltså under en och en halv bildpunkt, och
       medelvärdesbildades bort. Skala 150 ger ungefär 1,3 cm, som är
       åtta bildpunkter: det läses som väv."""
    nt = mat.node_tree; b = _pbsdf(nt)
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs['Scale'].default_value = scale
    n.inputs['Detail'].default_value = 8.0
    n.inputs['Roughness'].default_value = 0.75
    bm = nt.nodes.new("ShaderNodeBump")
    bm.inputs['Strength'].default_value = strength
    bm.inputs['Distance'].default_value = dist
    nt.links.new(n.outputs['Fac'], bm.inputs['Height'])
    nt.links.new(bm.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Roughness'].default_value = 0.96
    b.inputs['Sheen Weight'].default_value = 0.45
    return mat
