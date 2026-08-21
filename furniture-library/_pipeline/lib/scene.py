# -*- coding: utf-8 -*-
"""
GEMENSAM VISUELL STANDARD
=========================

Hela biblioteket renderas ur EN mastermodell per möbel. Katalogvyn och
topvyn är två kameror mot samma geometri — inte två tolkningar. Det är
kravet i punkt 1 och 8, och det är också anledningen till att det här är
en 3D-pipeline och inte bildgenerering: en generator kan inte garantera
att två bilder visar samma fysiska föremål, och kan inte göra en sann
ortografisk projektion.

Låsta värden. Ändra inget av detta mellan modeller.

  Enhet            1 Blender-enhet = 1 meter
  Katalogkamera    perspektiv, 85 mm, azimut 34°, elevation 21°
                   avstånd beräknas ur objektets omslutande sfär, så
                   alla objekt får samma marginal oavsett storlek
  Topkamera        ortografisk, rakt ner, noll lutning
  Topskala         6 px/cm genom hela biblioteket, så två objekt kan
                   läggas bredvid varandra på samma planritning
  Ljus             tre mjuka areaklot: nyckel, fyll, kant, plus ett
                   svagt gradientklot för reflektioner
  Skugga           skuggfångare — kontaktskugga i alfa, aldrig ett golv
  Film             transparent
  Masker           en render per material, vitt mot svart, noll studsar.
                   De följer materialytan exakt eftersom det är samma
                   geometri och samma kamera.
"""
import bpy, math, os
from mathutils import Vector

PX_PER_CM   = 6.0          # topvyns skala, hela biblioteket
TOP_PAD_CM  = 6.0          # transparent luft runt footprint i topvyn
CAT_PX      = 1200         # katalogvyns kvadrat
CAT_AZIM    = 34.0
CAT_ELEV    = 21.0
CAT_LENS    = 85.0
CAT_FILL    = 0.78         # hur stor del av ramen objektet fyller

def nuke():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in (bpy.data.meshes, bpy.data.materials, bpy.data.objects,
              bpy.data.lights, bpy.data.cameras, bpy.data.images):
        for x in list(c):
            c.remove(x)

def setup_render(samples=160, res=CAT_PX):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    # Glansstudsar var 4 och tröskeln 0.02. Det räcker för matta ytor och
    # inte alls för blanka: krom som bara får fyra studsar blir grått, och en
    # brusig reflektion sopas bort av avbrusningen. Kostnaden är renderingstid,
    # och det är rätt pris för att en yta ska spegla något.
    sc.cycles.max_bounces = 12
    sc.cycles.diffuse_bounces = 4
    sc.cycles.glossy_bounces = 6
    sc.cycles.transmission_bounces = 8
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.012
    sc.render.film_transparent = True
    sc.render.resolution_x = res
    sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.color_depth = '8'
    sc.render.filter_size = 1.5
    # 'Standard' ger färgen som materialet faktiskt är. AgX och Filmic
    # avfärgar och mjukar upp, vilket är rätt för foto och fel för en
    # produktbild där paletten ska gå att lita på.
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.view_settings.exposure = 0.0
    return sc

def world_gradient(top=(0.92,0.92,0.94), bot=(0.62,0.60,0.58), strength=0.28):
    """Ett svagt gradientklot. Syns aldrig i bild — filmen är transparent —
       men ger materialen något att spegla, vilket är skillnaden mellan
       plastigt och verkligt."""
    w = bpy.data.worlds.new("W"); bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg  = nt.nodes.new("ShaderNodeBackground"); bg.inputs[1].default_value = strength
    ramp= nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*bot, 1)
    ramp.color_ramp.elements[1].color = (*top, 1)
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mapr= nt.nodes.new("ShaderNodeMapRange")
    mapr.inputs['From Min'].default_value = -1.0
    mapr.inputs['From Max'].default_value =  1.0
    tex = nt.nodes.new("ShaderNodeTexCoord")
    nt.links.new(tex.outputs['Generated'], sep.inputs[0])
    nt.links.new(sep.outputs['Z'], mapr.inputs['Value'])
    nt.links.new(mapr.outputs['Result'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], bg.inputs[0])
    nt.links.new(bg.outputs[0], out.inputs[0])

def area(name, loc, rot, size, energy, color=(1,1,1)):
    d = bpy.data.lights.new(name, 'AREA')
    d.shape = 'RECTANGLE'; d.size = size[0]; d.size_y = size[1]
    d.energy = energy; d.color = color
    o = bpy.data.objects.new(name, d)
    o.location = loc; o.rotation_euler = rot
    bpy.context.collection.objects.link(o)
    return o

# Ljusstyrkan är kalibrerad EN gång mot en vit referensyta och skalas
# sedan med r² — dubbelt så stort objekt behöver fyra gånger effekten för
# samma exponering. Konstanterna nedan får inte ändras per modell; det är
# de som gör att alla bilder i biblioteket har samma ljus.
KEY_W, FILL_W, RIM_W, BOUNCE_W = 58.0, 19.0, 26.0, 9.0

def top_light(radius, mult=1.0):
    """Topvyn behöver en egen rigg. Med sidoljuset från katalogen blev
       skuggan ett stort snedställt fält bredvid möbeln; på en planritning
       ska den vara en tunn kontaktskugga rakt under.

       Skuggan var ändå för tung. Halvskuggans bredd är ungefär
       ljuskällans storlek gånger (objektets höjd / ljusets avstånd). Med
       5r stort ljus på 4,2r höjd blev det nästan en meter mjuk kant runt
       varje möbel — ett grått moln, inte en kontaktskugga. Nyckeln är nu
       mindre och högre, vilket ger cirka en fjärdedel så bred halvskugga,
       och fyllnadsljuset kastar ingen skugga alls utan finns bara för att
       ovansidorna inte ska bli platta."""
    # En liten nyckel löste skuggan men skapade ett nytt fel: på en lackad
    # bordsskiva speglades den som en skarp ljusfläck mitt i topvyn. Riggen
    # är därför delad i två uppgifter. t_key är liten och kastar skuggan.
    # t_soft är stor, kastar ingen skugga alls, och är det som blanka ytor
    # faktiskt speglar — en softbox, inte en punkt. Båda står på samma höjd
    # så effektfördelningen mellan dem inte ändrar exponeringen.
    r = max(radius, 0.5)
    k = area("t_key",  (0.16*r, -0.16*r, 6.0*r), (0, 0, 0), (1.6*r, 1.6*r), 88.0*r*r*mult)
    sf = area("t_soft", (0.10*r, -0.30*r, 6.0*r), (0, 0, 0), (6.5*r, 5.0*r), 102.0*r*r*mult)
    sf.data.use_shadow = False
    f = area("t_fill", (-1.6*r, 1.2*r, 3.0*r),
             (math.radians(22), 0, math.radians(-52)), (4.0*r, 4.0*r), 22.0*r*r*mult,
             (0.97,0.98,1.0))
    f.data.use_shadow = False
    return k, sf, f

def three_point(radius, mult=1.0):
    r = max(radius, 0.5)
    k = area("key",  ( 1.9*r,-2.2*r, 2.5*r), (math.radians(48), 0, math.radians(40)),
             (3.2*r, 2.4*r), KEY_W*r*r*mult)
    f = area("fill", (-2.6*r,-1.5*r, 1.5*r), (math.radians(66), 0, math.radians(-58)),
             (3.6*r, 2.8*r), FILL_W*r*r*mult, (0.96,0.97,1.0))
    b = area("rim",  (-0.6*r, 2.8*r, 2.2*r), (math.radians(126), 0, math.radians(-16)),
             (2.6*r, 1.6*r), RIM_W*r*r*mult, (1.0,0.98,0.95))
    # Golvstuds. Utan den gick allt under en soffa i kolsvart, vilket varken
    # är verkligt eller vackert — i ett riktigt rum studsar golvet upp.
    g = area("bounce", (0.2*r, -0.9*r, -0.9*r), (math.radians(180), 0, 0),
             (4.0*r, 3.0*r), BOUNCE_W*r*r*mult, (1.0,0.98,0.95))
    return k, f, b, g

def shadow_catcher(size):
    bpy.ops.mesh.primitive_plane_add(size=size*6, location=(0,0,0))
    p = bpy.context.object; p.name = "catcher"
    p.is_shadow_catcher = True
    return p

def bounds(objs):
    lo = Vector(( 1e9, 1e9, 1e9)); hi = Vector((-1e9,-1e9,-1e9))
    for o in objs:
        if o.type != 'MESH': continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            lo = Vector((min(lo[i], w[i]) for i in range(3)))
            hi = Vector((max(hi[i], w[i]) for i in range(3)))
    return lo, hi
