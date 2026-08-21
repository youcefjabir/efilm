# -*- coding: utf-8 -*-
"""
STUDIOMILJÖ

Varför bilderna hittills har sett ut som lera och inte som möbler:

En yta blir fotografisk av vad den SPEGLAR, inte av sin färg. Konkurrenternas
badkar är trovärdigt för att den vita akrylen har en mjuk ljus form i sig och
en mörkare ton undertill — det är en softbox som speglas. Kromblandaren är krom
för att den speglar en studio. Vår värld var en jämn gradient, och en jämn
gradient speglas som ingenting alls. Allt blev matt.

Det här bygger en riktig studio som en equirektangulär HDRI: mörkt golv,
horisont, ljus zenit, och tre softboxar med mjuka kanter. Den syns aldrig i
bild — filmen är transparent — men den syns i varje blank yta.

Exponeringen får inte förändras av det här. Ljuskonstanterna i scene.py är
kalibrerade mot en vit referens och ska fortsätta gälla. Därför delas världen
på strålslag: diffusa strålar ser en svag jämn version, blanka strålar ser den
starka studion. Reflektionerna blir kraftfulla utan att en enda bild blir
ljusare.
"""
import bpy, math
import numpy as np

_IMG_NAME = "studio_env"

def _smooth(x):
    x = np.clip(x, 0.0, 1.0)
    return x*x*(3.0 - 2.0*x)

def _box(A, E, ac, ec, aw, eh, soft):
    """Mjuk rektangel i sfäriska koordinater. Grader."""
    da = np.abs((A - ac + 180.0) % 360.0 - 180.0)
    de = np.abs(E - ec)
    fa = _smooth(1.0 - (da - aw)/soft)
    fe = _smooth(1.0 - (de - eh)/soft)
    return fa*fe

def build_hdri(w=1024, h=512):
    """Equirektangulär studio. u -> azimut, v -> elevation, v=0 nederst."""
    if _IMG_NAME in bpy.data.images:
        return bpy.data.images[_IMG_NAME]
    u = (np.arange(w) + 0.5)/w
    v = (np.arange(h) + 0.5)/h
    A = (u*360.0 - 180.0)[None, :]           # -180..180
    E = (v*180.0 -  90.0)[:, None]           #  -90..90

    # Grundton: mörkt golv, ljus tak. Kontrasten mellan över och under är det
    # som ger en rundad yta sin form — utan den blir en cylinder en platt remsa.
    t = _smooth((E + 90.0)/180.0)
    base = 0.030 + 0.44*t**2.1
    # horisontband, svagt ljusare — motsvarar väggarnas ljus i en studio
    base = base + 0.10*np.exp(-((E - 4.0)/16.0)**2)
    base = np.repeat(base, w, axis=1) if base.shape[1] == 1 else base
    L = np.broadcast_to(base, (h, w)).astype(np.float32).copy()

    # Nyckel-softbox: hög, snett framifrån vänster. Den stora ljusa formen
    # som syns i varje blank yta.
    L += 30.0 * _box(A, E,  46.0, 42.0, 22.0, 14.0, 13.0)
    # Sidopanel höger, svagare och bredare — ger volym åt skuggsidan.
    L +=  7.0 * _box(A, E, -68.0, 22.0, 30.0, 22.0, 20.0)
    # Kantstrip bakifrån: den tunna ljusa linjen längs en kromkant.
    L += 13.0 * _box(A, E, 168.0, 30.0, 34.0,  6.0, 10.0)
    # Golvstuds framifrån och lågt, varm och svag.
    L +=  1.1 * _box(A, E,  10.0,-34.0, 60.0, 22.0, 26.0)

    px = np.empty((h, w, 4), dtype=np.float32)
    px[..., 0] = L*1.000
    px[..., 1] = L*0.992
    px[..., 2] = L*0.978          # aningen varmt studioljus
    px[..., 3] = 1.0
    im = bpy.data.images.new(_IMG_NAME, w, h, alpha=True, float_buffer=True)
    im.colorspace_settings.name = 'Non-Color'
    im.pixels.foreach_set(px.reshape(-1))
    return im

def mean_radiance(im):
    """Sfäriskt medelvärde, viktat med sin(zenit) — annars räknas polerna
       för högt och normaliseringen blir fel."""
    w, h = im.size
    a = np.empty(w*h*4, dtype=np.float32)
    im.pixels.foreach_get(a)
    L = a.reshape(h, w, 4)[..., 0]
    v = (np.arange(h) + 0.5)/h
    wt = np.sin(v*math.pi)[:, None]
    return float((L*wt).sum()/(wt.sum()*w))

# Den gamla världens effektiva bidrag, uppmätt mot en grå referensyta.
# Studion normaliseras till exakt samma tal, så INGEN bild i biblioteket
# byter exponering när miljön byts. Skillnaden ligger i kontrasten inne i
# miljön — en liten mycket ljus softbox mot en mörk omgivning — inte i
# hur mycket energi den lämnar ifrån sig.
LEGACY_MEAN = 0.1284

def studio_world(exposure=LEGACY_MEAN, rot_deg=0.0):
    """En studio med samma totala energi som förut men helt annan struktur.

       Första försöket delade världen på strålslag för att kunna ha en stark
       miljö enbart i reflektioner. Det gick inte: en grå referensyta mätte
       1.00 mot förväntade 0.39, alltså utbränt. Direktsampling av bakgrunden
       går varken via Is Diffuse Ray eller Is Shadow Ray, så uppdelningen
       läcker. Normalisering är i stället exakt och går att mäta."""
    im = build_hdri()
    k = exposure/max(mean_radiance(im), 1e-6)
    w = bpy.data.worlds.new("W"); bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    tc  = nt.nodes.new("ShaderNodeTexCoord")
    mp  = nt.nodes.new("ShaderNodeMapping")
    mp.inputs['Rotation'].default_value = (0, 0, math.radians(rot_deg))
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector'])
    env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = im
    nt.links.new(mp.outputs['Vector'], env.inputs['Vector'])
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs['Strength'].default_value = k
    nt.links.new(env.outputs['Color'], bg.inputs['Color'])
    out = nt.nodes.new("ShaderNodeOutputWorld")
    nt.links.new(bg.outputs[0], out.inputs[0])
    return w
