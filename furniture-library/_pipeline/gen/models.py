# -*- coding: utf-8 -*-
"""
MODELLREGISTER

En rad per möbel. Registret är bibliotekets källa till sanning: härifrån
kommer ID, kategori, mått, resize-läge, materialzoner, kuraterade färger
och den prompt som bygger designen.

Måtten är verkliga möbelmått och sätts HÄR, inte av bilden. Bilden bidrar
med form och material; geometrin normaliseras alltid mot de här talen.

resize
  FIXED         fysisk design med fasta mått
  PRESET        finns i namngivna storlekar, egen geometri per storlek
  PROPORTIONAL  får skalas proportionellt inom rimligt intervall
  FREE          fri fotavtrycksskalning är logisk (mattor, trallar)

view
  34    trekvartsvy i studio          (möbler)
  top   rakt uppifrån                 (mattor)
  front rakt framifrån                (tavlor, vägglampor)
"""

def M(id, name, cat, sub, w, d, h, desc, resize="FIXED", presets=None,
      mats=("upholstery",), colors=None, view="34", style="scandinavian-contemporary",
      gate=False):
    return dict(id=id, name=name, category=cat, subcategory=sub,
                widthCm=w, depthCm=d, heightCm=h, desc=desc, resizeMode=resize,
                presets=presets or [], materials=list(mats),
                colors=colors or {}, view=view, style=style, gate=gate)

TEX7 = ["ivory","oatmeal","sand","greige","olive","charcoal"]
OAK4 = ["light-oak","natural-oak","smoked-oak","walnut"]

MODELS = [
# ---------------------------------------------------------------- SOFFOR
M("sofa_lund_3s_001","Lund 3-sits","living-room","sofas",240,96,68,
  "modular three-seat sofa with a low wide silhouette, deep seat, three broad flat "
  "seat cushions and three low back cushions forming an unbroken line, soft square "
  "arms flush with the seat, upholstered in {oatmeal}, on very short pale oak feet",
  "PRESET",["2-sits 180","3-sits 240","4-sits 300"],("upholstery","wood"),
  dict(upholstery=TEX7, wood=["light-oak","natural-oak"]), gate=True),
M("sofa_kyst_25s_002","Kyst 2,5-sits","living-room","sofas",210,90,72,
  "compact two-and-a-half-seat sofa with softly rounded tight-upholstered arms, two "
  "plump seat cushions and two loose back cushions, upholstered in {greige}, raised "
  "on slender slightly splayed round {natural-oak} legs",
  "PRESET",["2-sits 170","2,5-sits 210","3-sits 240"],("upholstery","wood"),
  dict(upholstery=TEX7, wood=OAK4)),
M("sofa_norr_4s_003","Norr 4-sits","living-room","sofas",300,100,64,
  "long low four-seat sofa with a very slim profile, four flat seat cushions, four "
  "soft back cushions and thin tight arms, upholstered in {ivory}, on discreet low "
  "pale oak plinth feet",
  "PRESET",["3-sits 240","4-sits 300"],("upholstery","wood"),
  dict(upholstery=TEX7, wood=["light-oak"])),
M("sofa_hav_mod_004","Hav 3-sits modulär","living-room","sofas",280,100,68,
  "three-seat modular sofa built from three visibly separate soft blocks with rounded "
  "edges and no visible frame, generous deep seat, low chunky back, upholstered in "
  "{oatmeal}, sitting almost directly on the floor",
  "PRESET",["2 moduler 190","3 moduler 280","4 moduler 370"],("upholstery",),
  dict(upholstery=TEX7)),
M("sofa_kai_l_005","Kai L-soffa vänster","living-room","sofas",280,160,68,
  "left-facing L-shaped corner sofa with a long chaise, soft square modular blocks, "
  "flat wide seat cushions and low back cushions, upholstered in {olive}, on very low "
  "dark feet",
  "PRESET",["vänster 280x160","höger 280x160"],("upholstery",),
  dict(upholstery=["olive","oatmeal","greige","charcoal","sand"])),
M("sofa_lomma_bcl_006","Lomma bouclé","living-room","sofas",230,100,72,
  "organic curved sofa with one continuous kidney-shaped back sweeping into rounded "
  "arms, a single long curved seat cushion and one round bolster, upholstered "
  "entirely in {boucle}, on a hidden low plinth",
  "FIXED",[],("upholstery",), dict(upholstery=["boucle","ivory","oatmeal","sand"])),
M("sofa_ram_ek_007","Ram 3-sits","living-room","sofas",200,88,75,
  "three-seat sofa with an exposed solid {light-oak} frame, visible slim armrests and "
  "tapered legs, loose flat seat and back cushions in {ivory} resting inside the frame",
  "PRESET",["2-sits 160","3-sits 200"],("upholstery","wood"),
  dict(upholstery=TEX7, wood=OAK4)),
# ------------------------------------------------- FÅTÖLJER OCH PALLAR
M("armchair_aurora_001","Aurora fåtölj","living-room","armchairs",85,80,75,
  "enveloping barrel armchair with one continuous curved back and arm shell, a single "
  "soft seat cushion, upholstered in {boucle}, on a small hidden swivel base",
  "FIXED",[],("upholstery",), dict(upholstery=["boucle","ivory","oatmeal","greige"]),
  gate=True),
M("armchair_nordic_002","Nordic lounge","living-room","armchairs",78,84,72,
  "low lounge chair with a sculpted solid {natural-oak} frame, gently curved back "
  "rails, wide flat armrests and a thick loose seat and back cushion in {sand}",
  "FIXED",[],("upholstery","wood"), dict(upholstery=TEX7, wood=OAK4)),
M("armchair_kubo_003","Kubo fåtölj","living-room","armchairs",80,78,70,
  "compact cube armchair with clean square tight upholstery, slightly angled back, "
  "low square arms, upholstered in {greige}, on short square {smoked-oak} legs",
  "FIXED",[],("upholstery","wood"), dict(upholstery=TEX7, wood=OAK4)),
M("armchair_timmer_004","Timmer fåtölj","living-room","armchairs",70,76,74,
  "slim spindle-back armchair in solid {light-oak} with rounded tapered legs, open "
  "back rails and a thin flat seat pad in {oatmeal}",
  "FIXED",[],("upholstery","wood"), dict(upholstery=TEX7, wood=OAK4)),
M("stool_rund_005","Rund pall","living-room","stools",55,55,42,
  "round upholstered pouffe fully covered in {boucle} with a soft crowned top and a "
  "clean vertical side seam",
  "PROPORTIONAL",[],("upholstery",), dict(upholstery=["boucle","oatmeal","olive","charcoal"])),
M("stool_lag_006","Låg pall","living-room","stools",80,50,40,
  "long low rectangular bench stool with tight upholstery in {olive} and slim square "
  "{smoked-oak} legs",
  "PROPORTIONAL",[],("upholstery","wood"), dict(upholstery=TEX7, wood=OAK4)),
]

# ------------------------------------------------ SOFFBORD OCH SIDOBORD
MODELS += [
M("table_coffee_sten_001","Sten runt bord","living-room","coffee-tables",90,90,35,
  "round coffee table carved from a single block of {travertine}, thick round top on "
  "one wide cylindrical pedestal, all edges softly eased",
  "FIXED",[],("stone",), dict(stone=["travertine","warm-stone","dark-stone"])),
M("table_coffee_oval_002","Trä ovalt bord","living-room","coffee-tables",130,70,32,
  "oval coffee table in solid {natural-oak} with a thick top, softly eased edge and "
  "four slim slightly splayed round legs",
  "PROPORTIONAL",[],("wood",), dict(wood=OAK4)),
M("table_coffee_kvad_003","Massivt kvadratbord","living-room","coffee-tables",90,90,30,
  "low square coffee table in solid {light-oak} with a thick slab top and two solid "
  "slab side panels forming the base",
  "PROPORTIONAL",[],("wood",), dict(wood=OAK4)),
M("table_side_pelare_004","Pelare sidobord","living-room","side-tables",40,40,50,
  "small round pedestal side table in {travertine}, thick round top on a slender "
  "cylindrical column and a round foot",
  "FIXED",[],("stone",), dict(stone=["travertine","warm-stone","dark-stone"])),
M("table_side_sibo_005","Sibo sidobord","living-room","side-tables",45,45,45,
  "small round side table in {smoked-oak} with a thick round top and a solid turned "
  "drum base",
  "FIXED",[],("wood",), dict(wood=OAK4)),
M("table_side_spar_006","Spår sidobord","living-room","side-tables",38,38,52,
  "slim round side table in {light-oak} with a thick round top on a fluted reeded "
  "cylindrical base with vertical grooves",
  "FIXED",[],("wood",), dict(wood=OAK4)),
# --------------------------------------------------------------- MATPLATS
M("table_dining_atelje_001","Ateljé matbord","dining","dining-tables",220,100,75,
  "large rectangular dining table in solid {light-oak} with a thick top, softly eased "
  "edges and two wide solid slab legs set in from the ends",
  "PRESET",["180x90","220x100","260x110"],("wood",), dict(wood=OAK4), gate=True),
M("table_dining_nord_002","Nord matbord","dining","dining-tables",180,90,75,
  "rectangular dining table in solid {natural-oak} with a slim top and four round "
  "tapered legs placed at the corners",
  "PRESET",["160x90","180x90","200x100"],("wood",), dict(wood=OAK4)),
M("table_dining_boa_003","Boa runt matbord","dining","dining-tables",120,120,75,
  "round dining table in solid {smoked-oak} with a thick round top on a single wide "
  "fluted cylindrical pedestal",
  "PRESET",["Ø110","Ø120","Ø140"],("wood",), dict(wood=OAK4)),
M("chair_viken_004","Viken matstol","dining","dining-chairs",52,54,82,
  "dining chair with a solid {light-oak} frame, softly curved upholstered back panel "
  "and a fully upholstered seat in {oatmeal}, round tapered legs",
  "FIXED",[],("upholstery","wood"), dict(upholstery=TEX7, wood=OAK4)),
M("chair_linnea_005","Linnea stol","dining","dining-chairs",52,55,86,
  "dining chair with a tall softly rounded upholstered back in {greige}, slim solid "
  "{natural-oak} legs and a visible wooden back rail",
  "FIXED",[],("upholstery","wood"), dict(upholstery=TEX7, wood=OAK4)),
M("bench_bruk_006","Bruk bänk","dining","benches",140,38,45,
  "long slim dining bench in solid {light-oak} with a thick seat plank and two solid "
  "slab legs",
  "PROPORTIONAL",[],("wood",), dict(wood=OAK4)),
M("chair_karm_007","Karm stol","dining","dining-chairs",54,56,80,
  "dining armchair with a low curved solid {natural-oak} back and armrest in one "
  "piece, upholstered seat in {sand}, round tapered legs",
  "FIXED",[],("upholstery","wood"), dict(upholstery=TEX7, wood=OAK4)),
M("chair_barstol_008","Barstol","dining","stools",44,46,95,
  "counter bar stool with a low upholstered back and seat in {oatmeal}, slim solid "
  "{light-oak} legs and a wooden footrest ring",
  "PRESET",["sitthöjd 65","sitthöjd 75"],("upholstery","wood"),
  dict(upholstery=TEX7, wood=OAK4)),
]

# ---------------------------------------------------------------- SOVRUM
MODELS += [
M("bed_linne_180_001","Säng Linne 180","bedroom","beds",194,215,105,
  "upholstered double bed with a wide low platform base and a tall softly padded "
  "headboard, upholstered in {oatmeal}, made up with crisp ivory cotton bedding, a "
  "duvet folded back near the head with soft natural creases and two plump pillows",
  "PRESET",["140x200","160x200","180x200"],("upholstery","bedding","wood"),
  dict(upholstery=TEX7, wood=["light-oak","natural-oak"]), gate=True),
M("bed_ram_tra_160_002","Säng Ram Trä 160","bedroom","beds",176,213,95,
  "double bed with a visible solid {natural-oak} frame and a slatted wooden headboard, "
  "mattress set inside the frame, made up with ivory cotton bedding and two pillows",
  "PRESET",["120x200","140x200","160x200","180x200"],("wood","bedding"),
  dict(wood=OAK4)),
M("bed_boucle_180_003","Säng Bouclé 180","bedroom","beds",196,216,110,
  "upholstered double bed fully covered in {boucle} with a generous rounded headboard "
  "and a soft plinth base, made up with ivory bedding, duvet folded back, two pillows",
  "PRESET",["160x200","180x200"],("upholstery","bedding"),
  dict(upholstery=["boucle","ivory","oatmeal","greige"])),
M("nightstand_ribb_004","Nattduksbord Ribb","bedroom","nightstands",50,38,52,
  "small bedside table in {light-oak} with two drawers, vertical reeded fluting across "
  "the drawer fronts and slim round tapered legs",
  "FIXED",[],("wood",), dict(wood=OAK4)),
M("nightstand_sten_005","Nattduksbord Sten","bedroom","nightstands",45,35,50,
  "small bedside cube in {travertine} with one open niche, solid stone body and softly "
  "eased edges",
  "FIXED",[],("stone",), dict(stone=["travertine","warm-stone","dark-stone"])),
M("dresser_3_006","Byrå 3 lådor","bedroom","dressers",120,50,80,
  "three-drawer chest in solid {natural-oak} with flush handleless drawer fronts, a "
  "thin top and slim round tapered legs",
  "PROPORTIONAL",[],("wood",), dict(wood=OAK4)),
M("dresser_6_007","Byrå 6 lådor","bedroom","dressers",160,50,80,
  "wide six-drawer chest in solid {light-oak} in two columns of three, flush "
  "handleless fronts, slim round tapered legs",
  "PROPORTIONAL",[],("wood",), dict(wood=OAK4)),
M("bench_sovrum_008","Sängbänk","bedroom","benches",120,45,45,
  "long low upholstered bedroom bench in {oatmeal} with a softly crowned seat and slim "
  "square {light-oak} legs",
  "PROPORTIONAL",[],("upholstery","wood"), dict(upholstery=TEX7, wood=OAK4)),
]

# ------------------------------------------------------ FÖRVARING OCH HYLLOR
MODELS += [
M("sideboard_ribb_001","Skänk Ribbad","storage","sideboards",180,45,75,
  "long low sideboard in {smoked-oak} with four doors in vertical reeded fluting, a "
  "thin top and a slim recessed plinth",
  "PRESET",["140x45","180x45","220x45"],("wood",), dict(wood=OAK4)),
M("sideboard_slat_002","Skänk Slät","storage","sideboards",180,45,75,
  "long low sideboard in solid {light-oak} with four flush handleless doors, a thin "
  "top and slim round tapered legs",
  "PRESET",["140x45","180x45","220x45"],("wood",), dict(wood=OAK4)),
M("cabinet_vitrin_003","Vitrinskåp","storage","cabinets",90,40,180,
  "tall slim display cabinet in {natural-oak} with two fluted glass doors in a slender "
  "wooden frame, three internal shelves, on low tapered legs",
  "FIXED",[],("wood","glass"), dict(wood=OAK4)),
M("shelf_bokhylla_004","Bokhylla Öppen","storage","shelving",100,35,190,
  "tall open bookcase in solid {light-oak} with five shelves, slim uprights and no "
  "back panel",
  "PRESET",["100x190","140x190"],("wood",), dict(wood=OAK4)),
M("shelf_vagg_005","Bokhylla Vägg","storage","shelving",120,22,180,
  "wall-mounted shelving system with four slim {natural-oak} shelves on two slender "
  "matt black uprights",
  "PROPORTIONAL",[],("wood","metal"), dict(wood=OAK4)),
M("wardrobe_2d_006","Garderob 2 dörrar","storage","wardrobes",100,60,200,
  "tall two-door wardrobe in solid {light-oak} with flush handleless doors, a subtle "
  "shadow gap between them and a slim recessed plinth",
  "PRESET",["100x200","150x200","200x200"],("wood",), dict(wood=OAK4)),
M("wardrobe_3d_007","Garderob 3 dörrar","storage","wardrobes",150,60,200,
  "tall three-door wardrobe in {smoked-oak} with flush handleless doors, shadow gaps "
  "and a slim recessed plinth",
  "PRESET",["100x200","150x200","200x200"],("wood",), dict(wood=OAK4)),
M("cabinet_hog_008","Högskåp","storage","cabinets",100,45,180,
  "tall two-door cabinet in {natural-oak} with woven cane door panels in a slim "
  "wooden frame, on low tapered legs",
  "FIXED",[],("wood",), dict(wood=OAK4)),
]

# ---------------------------------------------------------------- MATTOR
# Mattornas huvudasset är topvyn. De fotograferas därför rakt uppifrån och
# behöver ingen 3D-master: en matta ÄR en plan yta, och en rekonstruktion
# skulle bara tillföra brus. Fotavtrycket kommer direkt ur måtten.
MODELS += [
M("rug_berber_lin_001","Berber Lin","rugs","woven",200,300,2,
  "hand-knotted wool rug with an undyed ivory ground and a sparse original berber "
  "inspired lattice of fine charcoal lines and small diamonds, short knotted fringe "
  "at both short ends, visible wool pile and yarn variation",
  "FREE",["140x200","170x240","200x300","250x350"],("pile",),
  dict(pile=["ivory","oatmeal","sand"]), view="top", gate=True),
M("rug_berber_sand_002","Berber Sand","rugs","woven",200,300,2,
  "hand-knotted wool rug with a warm sand ground and a sparse original geometric "
  "motif of small dark brown lozenges in even rows, short fringe at both short ends",
  "FREE",["140x200","170x240","200x300","250x350"],("pile",),
  dict(pile=["sand","oatmeal","greige"]), view="top"),
M("rug_ull_stripe_003","Ull Stripe","rugs","woven",170,240,2,
  "flatwoven wool rug with wide irregular horizontal bands in oatmeal, sand and warm "
  "greige, visible flat weave structure and a neat bound edge",
  "FREE",["140x200","170x240","200x300"],("pile",),
  dict(pile=["oatmeal","sand","greige","olive"]), view="top"),
M("rug_kelim_004","Kelim Väv","rugs","woven",200,300,2,
  "flatwoven kelim style wool rug with an original angular diamond and chevron pattern "
  "in warm brown and charcoal on an oatmeal ground, visible tight flat weave",
  "FREE",["170x240","200x300"],("pile",),
  dict(pile=["oatmeal","sand"]), view="top"),
M("rug_melange_005","Ull Melange","rugs","woven",170,240,2,
  "thick plain wool rug in a soft heathered greige melange with no pattern, deep even "
  "pile and a subtle colour variation across the surface",
  "FREE",["140x200","170x240","200x300"],("pile",),
  dict(pile=["greige","oatmeal","charcoal","olive"]), view="top"),
M("rug_rund_ull_006","Rund Ull","rugs","round",200,200,2,
  "large round wool rug in undyed ivory with a subtle concentric ring texture and a "
  "dense soft pile",
  "FREE",["Ø150","Ø200","Ø250"],("pile",),
  dict(pile=["ivory","oatmeal","sand"]), view="top"),
]

# -------------------------------------------------------------- BELYSNING
MODELS += [
M("lamp_floor_bage_001","Golvlampa Båge","lighting","floor-lamps",120,35,150,
  "arc floor lamp with a slim matt black stem curving over a round travertine base and "
  "a small conical ivory linen shade",
  "FIXED",[],("metal","stone"), dict()),
M("lamp_floor_tra_002","Golvlampa Trä","lighting","floor-lamps",40,40,150,
  "floor lamp with a slender solid {light-oak} column, a small round base and a tall "
  "drum shade in ivory linen",
  "FIXED",[],("wood",), dict(wood=OAK4)),
M("lamp_pendant_003","Taklampa Linne","lighting","pendants",50,50,40,
  "large dome pendant lamp shade in natural ivory linen with a visible weave and a "
  "slim fabric cord",
  "PROPORTIONAL",[],("shade",), dict()),
M("lamp_table_keramik_004","Bordslampa Keramik","lighting","table-lamps",30,30,45,
  "table lamp with a rounded matte ceramic base in warm off-white and a small tapered "
  "ivory linen shade",
  "FIXED",[],("ceramic","shade"), dict()),
M("lamp_wall_005","Vägglampa","lighting","wall-lamps",20,18,35,
  "wall sconce with a slim matt black arm and a small oval opal glass diffuser",
  "FIXED",[],("metal","glass"), dict(), view="front"),
]

# -------------------------------------------------- DETALJER OCH TEXTIL
MODELS += [
M("cushion_linne_001","Kudde Linne","accessories","cushions",50,50,14,
  "square cushion in {oatmeal} linen with a visible weave, soft filled corners and a "
  "narrow flange edge",
  "PROPORTIONAL",[],("upholstery",), dict(upholstery=TEX7)),
M("cushion_ull_002","Kudde Ull","accessories","cushions",50,50,14,
  "square cushion in {olive} wool with a visible fibre texture and plump filled corners",
  "PROPORTIONAL",[],("upholstery",), dict(upholstery=TEX7)),
M("throw_ull_003","Plåd Ull","accessories","throws",130,170,4,
  "soft folded wool throw in warm oatmeal with a subtle herringbone weave and hand "
  "knotted fringe along both short ends, laid flat and neatly folded once",
  "PROPORTIONAL",[],("upholstery",), dict(upholstery=TEX7), view="top"),
M("vase_keramik_004","Vas Keramik","accessories","vases",22,22,25,
  "tall rounded ceramic vase in warm off-white with a matte chalky glaze and a narrow "
  "neck, empty",
  "FIXED",[],("ceramic",), dict()),
M("vase_glas_005","Vas Glas","accessories","vases",18,18,20,
  "small rounded vase in smoky grey glass with a soft satin surface and a wide mouth, "
  "empty",
  "FIXED",[],("glass",), dict()),
M("bowl_tra_006","Träskål","accessories","bowls",30,30,10,
  "wide shallow turned bowl in solid {light-oak} with visible grain and a matt oil "
  "finish, empty",
  "FIXED",[],("wood",), dict(wood=OAK4)),
M("candle_007","Ljusstake","accessories","candleholders",10,10,26,
  "slim turned candleholder in {smoked-oak} with a single tapered candle in ivory",
  "FIXED",[],("wood",), dict(wood=OAK4)),
M("art_print_008","Konsttryck","accessories","art",70,4,100,
  "framed abstract art print in a slim {light-oak} frame, muted ochre and sand organic "
  "shapes on an off-white ground, wide white mount",
  "PROPORTIONAL",[],("wood",), dict(wood=OAK4), view="front"),
]

# --------------------------------------------------------------- UTEMILJÖ
MODELS += [
M("outdoor_sofa_mod_001","Modulsoffa Ute","outdoor","lounge",240,90,70,
  "outdoor modular three-seat sofa with a solid weathered {light-oak} frame, open "
  "slatted sides and thick pale off-white outdoor cushions",
  "PRESET",["2 moduler 170","3 moduler 240","hörn 240x170"],("upholstery","wood"),
  dict(upholstery=["ivory","oatmeal","greige"], wood=["light-oak","natural-oak"])),
M("outdoor_chair_002","Loungefåtölj Ute","outdoor","lounge",85,82,72,
  "outdoor lounge chair with a solid {light-oak} slatted frame, low wide arms and a "
  "thick off-white outdoor seat and back cushion",
  "FIXED",[],("upholstery","wood"),
  dict(upholstery=["ivory","oatmeal","greige"], wood=["light-oak","natural-oak"])),
M("outdoor_table_low_003","Lågt Bord Ute","outdoor","tables",120,70,35,
  "low outdoor coffee table with a slatted solid {light-oak} top and slim square legs",
  "PROPORTIONAL",[],("wood",), dict(wood=["light-oak","natural-oak"])),
M("outdoor_stool_004","Pall Ute","outdoor","lounge",60,60,40,
  "square outdoor stool with a slatted {light-oak} top and a thick off-white outdoor "
  "cushion on top",
  "PROPORTIONAL",[],("upholstery","wood"),
  dict(upholstery=["ivory","oatmeal"], wood=["light-oak","natural-oak"])),
M("outdoor_table_dining_005","Matbord Ute","outdoor","tables",220,100,75,
  "large outdoor dining table with a slatted solid {light-oak} top, softly eased edges "
  "and two solid slab legs",
  "PRESET",["180x90","220x100"],("wood",), dict(wood=["light-oak","natural-oak"])),
M("outdoor_chair_dining_006","Matstol Ute","outdoor","chairs",58,58,82,
  "outdoor dining chair with a solid {light-oak} frame and a woven natural cord seat "
  "and back",
  "FIXED",[],("wood",), dict(wood=["light-oak","natural-oak"])),
M("outdoor_sunbed_007","Solsäng","outdoor","lounge",200,70,70,
  "outdoor sun lounger with a slatted solid {light-oak} frame, an adjustable raised "
  "backrest and a long thin off-white outdoor mattress",
  "FIXED",[],("upholstery","wood"),
  dict(upholstery=["ivory","oatmeal"], wood=["light-oak","natural-oak"])),
M("outdoor_parasol_008","Parasoll","outdoor","shade",300,300,250,
  "large round garden parasol, open, with an off-white canvas canopy and a slim solid "
  "{light-oak} pole",
  "PRESET",["Ø250","Ø300","Ø350"],("shade","wood"), dict(wood=["light-oak"])),
M("planter_small_009","Kruka Liten","outdoor","planters",40,40,40,
  "round tapered planter pot in warm off-white fibre concrete with a matte lightly "
  "textured surface, empty",
  "PROPORTIONAL",[],("stone",), dict()),
M("planter_large_010","Kruka Stor","outdoor","planters",60,60,60,
  "large round tapered planter pot in warm off-white fibre concrete with a matte "
  "lightly textured surface, empty",
  "PROPORTIONAL",[],("stone",), dict()),
M("planter_box_011","Odlingskruka","outdoor","planters",80,40,45,
  "long rectangular planter box in warm off-white fibre concrete with softly eased "
  "edges, empty",
  "PROPORTIONAL",[],("stone",), dict()),
M("outdoor_deck_012","Utetrall","outdoor","decking",80,80,8,
  "square modular decking tile made of parallel {light-oak} slats with even gaps, "
  "seen as a single tile",
  "FREE",[],("wood",), dict(wood=["light-oak","natural-oak"])),
M("outdoor_grill_013","Grill","outdoor","cooking",120,60,110,
  "freestanding outdoor charcoal grill with a rounded matt black body, a hinged lid, "
  "two side shelves and two wheels",
  "FIXED",[],("metal",), dict()),
]

# ------------------------------------------------------- KONTOR OCH HALL
# Boardsen visar inte de här kategorierna, men masterspecen kräver dem för
# att en vanlig bostad ska gå att möblera. De ritas i samma formspråk.
MODELS += [
M("desk_atelje_001","Skrivbord Ateljé","office","desks",140,70,74,
  "slim writing desk in solid {light-oak} with a thin top, one shallow flush drawer "
  "and four round tapered legs",
  "PRESET",["120x60","140x70","160x70"],("wood",), dict(wood=OAK4)),
M("chair_office_002","Kontorsstol","office","chairs",60,60,88,
  "low-back office chair with a softly curved upholstered shell in {greige}, a slim "
  "matt black five-star swivel base and castors",
  "FIXED",[],("upholstery","metal"), dict(upholstery=TEX7)),
M("shelf_office_003","Kontorsförvaring","office","storage",80,40,120,
  "medium-height storage unit in {natural-oak} with two open shelves above and two "
  "flush handleless doors below, on a slim plinth",
  "PROPORTIONAL",[],("wood",), dict(wood=OAK4)),
M("bench_hall_001","Hallbänk","hallway","benches",100,38,45,
  "narrow hallway bench in solid {light-oak} with a slatted lower shelf and a thin "
  "upholstered seat pad in {oatmeal}",
  "PROPORTIONAL",[],("upholstery","wood"), dict(upholstery=TEX7, wood=OAK4)),
M("shoerack_hall_002","Skohylla","hallway","storage",80,30,80,
  "slim shoe cabinet in {light-oak} with two tilting flush fronts and a thin top",
  "PROPORTIONAL",[],("wood",), dict(wood=OAK4)),
M("console_hall_003","Konsolbord","hallway","consoles",120,35,80,
  "narrow console table in solid {natural-oak} with a thin top, one slim drawer and "
  "four square tapered legs",
  "PROPORTIONAL",[],("wood",), dict(wood=OAK4)),
M("bed_kids_001","Barnsäng 90","kids","beds",106,213,80,
  "single childrens bed with a visible solid {light-oak} frame, a low slatted "
  "headboard and footboard, made up with plain ivory cotton bedding and one pillow",
  "PRESET",["90x200","120x200"],("wood","bedding"), dict(wood=OAK4)),
M("desk_kids_002","Barnskrivbord","kids","desks",110,55,72,
  "small childrens desk in solid {light-oak} with a thin top, a low back rail and four "
  "round tapered legs",
  "PROPORTIONAL",[],("wood",), dict(wood=OAK4)),
]
