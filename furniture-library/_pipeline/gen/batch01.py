# -*- coding: utf-8 -*-
"""
PRODUKTIONSBATCH 01

Beställarens egna källbilder och egna ID. ID:na är PERMANENTA och får
aldrig omnumreras. 21 saknas medvetet i beställarens lista och ska inte
fyllas, härledas eller döpas om.

Bilden är sanningen för design, form och material.
Måtten här är sanningen för fysisk skala.

Å, Ä och Ö förekommer inte i ID — SKÄR blir skar — enligt regeln från
den ursprungliga specen.
"""

def B(n, slug, name, typ, w, d, h, mat, cat, sub, resize="FIXED", presets=None):
    return dict(seq=n, id="viewly-%02d-%s" % (n, slug), name=name, type=typ,
                widthCm=w, depthCm=d, heightCm=h, material=mat,
                category=cat, subcategory=sub, resizeMode=resize,
                presets=presets or [])

BATCH = [
 B( 1,"norr",  "Norr",  "3-seat sofa",                240, 96, 76,"oatmeal wool/linen","living-room","sofas","PRESET",["2-sits","3-sits"]),
 B( 2,"solvik","Solvik","compact 2.5-seat sofa",      210, 92, 74,"warm greige textile","living-room","sofas","PRESET",["2-sits","2,5-sits"]),
 B( 3,"fjord", "Fjord", "left-chaise sectional sofa", 280,160, 76,"sand textured wool","living-room","sofas","PRESET",["vänster","höger"]),
 B( 4,"aalto", "Aalto", "4-seat modular sofa",        300,100, 73,"warm ivory textile","living-room","sofas","PRESET",["3-sits","4-sits"]),
 B( 5,"mira",  "Mira",  "rounded sofa",               230, 95, 72,"cream bouclé","living-room","sofas"),
 B( 6,"saga",  "Saga",  "3-seat exposed-frame sofa",  225, 90, 78,"light oak + oatmeal linen","living-room","sofas"),
 B( 7,"skar",  "Skär",  "deep lounge sofa",           250,105, 70,"taupe wool + dark stained oak","living-room","sofas"),
 B( 8,"alva",  "Alva",  "compact 2-seat sofa",        185, 88, 76,"muted olive wool blend + dark wood","living-room","sofas"),
 B( 9,"vik",   "Vik",   "modular sofa",               270,100, 72,"light greige textile","living-room","sofas","PRESET",["3 moduler","4 moduler"]),
 B(10,"hav",   "Hav",   "right-chaise sectional sofa",290,165, 74,"light ivory linen blend + light oak detail","living-room","sofas","PRESET",["vänster","höger"]),
 B(11,"koya",  "Koya",  "lounge chair",                82, 86, 78,"bouclé","living-room","armchairs"),
 B(12,"esme",  "Esme",  "timber lounge chair",         71, 82, 74,"light oak + woven oatmeal seat/back","living-room","armchairs"),
 B(13,"lumen", "Lumen", "swivel lounge chair",         78, 78, 72,"taupe wool/textile","living-room","armchairs"),
 B(14,"skagen","Skagen","lounge chair",                74, 80, 76,"dark oak + cognac leather","living-room","armchairs"),
 B(15,"holm",  "Holm",  "round pouf",                  58, 58, 42,"cream bouclé","living-room","stools","PROPORTIONAL"),
 B(16,"kea",   "Kea",   "bench / stool",               80, 45, 42,"oak frame + natural textile","living-room","stools","PROPORTIONAL"),
 B(17,"yori",  "Yori",  "low Japandi lounge chair",    75, 83, 70,"smoked oak + sand linen","living-room","armchairs"),
 B(18,"lova",  "Lova",  "sculptural statement chair",  80, 84, 75,"muted olive textured wool","living-room","armchairs"),
 B(19,"sten",  "Sten",  "round coffee table",          90, 90, 35,"travertine","living-room","coffee-tables","PRESET",["Ø80","Ø90"]),
 B(20,"tora",  "Tora",  "oval coffee table",          130, 70, 35,"light oak","living-room","coffee-tables","PROPORTIONAL"),
 # 21 finns inte. Lämna luckan.
 B(22,"pelare","Pelare","pedestal side table",         40, 40, 50,"travertine","living-room","side-tables"),
]

BY_SEQ = {b["seq"]: b for b in BATCH}
BY_ID  = {b["id"]: b for b in BATCH}

def filenames():
    """De filnamn källbilderna ska ha, så ingen ID-koppling kan bli fel."""
    return [b["id"] + ".png" for b in BATCH]

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "files":
        for f in filenames(): print(f)
    else:
        print("%d modeller, ID 21 medvetet utelämnat" % len(BATCH))
        for b in BATCH:
            print("  %-18s %-8s %3dx%3dx%-3d  %s" % (b["id"], b["name"],
                  b["widthCm"], b["depthCm"], b["heightCm"], b["material"]))
