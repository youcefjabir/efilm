# -*- coding: utf-8 -*-
"""
MATERIALPROV

Varje material på en 30 × 30 cm platta, renderad rakt uppifrån i
biblioteksskalan 6 px/cm. Frågan brädan svarar på är den enda som
betyder något: känns tyg som tyg RAKT UPPIFRÅN, och skiljer sig ek från
valnöt av annat än färgen?

Renderas med två ljusriggar bredvid varandra — den nuvarande, som lyser
nästan rakt ner, och en med strykljus. Det avgör om riggen måste ändras.
"""
import sys, os, math, bpy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import scene, mats2, build as B
from mathutils import Vector

SIDE = 30.0
def plate(x, y, mat):
    o = B.rounded_plate("p", SIDE, SIDE, 2.0, 0.6, (x, y, 0), mat=mat)
    return o

SET = [
 ("Linnetyg sand",   lambda: mats2.fabric("sand")),
 ("Linnetyg olive",  lambda: mats2.fabric("olive")),
 ("Bouclé cream",    lambda: mats2.boucle("cream")),
 ("Ull cream",       lambda: mats2.wool("cream")),
 ("Ull charcoal",    lambda: mats2.wool("charcoal")),
 ("Light oak",       lambda: mats2.wood("light-oak")),
 ("Smoked oak",      lambda: mats2.wood("smoked-oak")),
 ("Walnut",          lambda: mats2.wood("walnut")),
 ("Travertin",       lambda: mats2.stone("travertine")),
 ("Svart metall",    lambda: mats2.metal("black")),
]

def run(rake, out, samples=90):
    scene.nuke(); sc = scene.setup_render(samples)
    scene.world_gradient()
    cols = 5; gap = 6.0
    for i, (nm, f) in enumerate(SET):
        cx = (i % cols)*(SIDE+gap); cy = -(i//cols)*(SIDE+gap)
        plate(cx, cy, f())
    objs = [o for o in bpy.data.objects if o.type == 'MESH']
    lo, hi = scene.bounds(objs); ctr = (lo+hi)/2
    w_cm = (hi.x-lo.x)*100 + 8; d_cm = (hi.y-lo.y)*100 + 8
    r = max((hi-lo).length/2, .5)
    if rake:
        # strykljus: nyckeln flyttas ut till 38° elevation
        scene.area("k", (1.1*r, -1.3*r, 1.05*r),
                   (math.radians(52), 0, math.radians(40)), (3.0*r, 2.4*r), 120*r*r)
        scene.area("f", (-1.4*r, 1.0*r, 2.6*r), (math.radians(20), 0, math.radians(-50)),
                   (4.0*r, 4.0*r), 55*r*r, (0.97,0.98,1.0))
    else:
        scene.top_light(r)
    cam = bpy.data.objects.new("c", bpy.data.cameras.new("c")); cam.data.type='ORTHO'
    bpy.context.collection.objects.link(cam)
    cam.data.ortho_scale = max(w_cm, d_cm)/100.0
    cam.location = (ctr.x, ctr.y, hi.z+4); cam.rotation_euler = (0,0,0)
    sc.camera = cam
    sc.render.resolution_x = int(w_cm*6); sc.render.resolution_y = int(d_cm*6)
    sc.render.film_transparent = False
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)

if __name__ == "__main__":
    run(sys.argv[1] == "rake", sys.argv[2], int(sys.argv[3]) if len(sys.argv)>3 else 90)
    print("klart", sys.argv[2])
