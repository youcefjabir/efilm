# -*- coding: utf-8 -*-
"""
ART DIRECTION — Viewly Design Reference Library

Riktningen är satt av beställarens referensboards: premium Nordic,
Scandinavian Contemporary, Japandi, Soft Minimalism, Quiet Luxury.

Boardsen är UNDERLAG, inte assets. Varje identifierbar möbel på dem
återskapas som en egen modell med eget formspråk. Ingen referensbild
beskärs, kopieras eller används som leverans.

Två saker är låsta för hela biblioteket och får inte variera per modell,
för det är de som gör att åttio bilder känns som ETT bibliotek:

  SCENEN   sömlös vit bakgrund, stor mjuk softbox uppifrån, svag nyckel
           från övre vänster, EN kontaktskugga rakt under möbeln
  KAMERAN  HÖJD trekvartsvy, omkring 40 grader ovanifrån, 50 mm

Det som varierar är möbeln.

VARFÖR KAMERAN LIGGER SÅ HÖGT
Rekonstruktionen bygger bara det den SER. Vid låg trekvartsvinkel ser den
knappt möbelns ovansida, och då hamnar den inte i meshen. Sängen visade
det tydligast: fotot hade täcke, veck och kuddar, meshen hade en slät
skiva, och topvyn blev en vit rektangel. Med kameran uppe på fyrtio grader
följer bäddningen med hela vägen in i topvyn.

Topvyn är bibliotekets huvudprodukt. Alltså ska källfotot vara taget så
att ovansidan syns.
"""

SCEN = (
    "Professional furniture catalogue studio photograph of one single piece of "
    "furniture standing alone. Seamless pure white background. Large soft overhead "
    "softbox plus a gentle key light from the upper left. Exactly one subtle contact "
    "shadow directly beneath the piece and no other shadow. Elevated three-quarter "
    "view looking down on the piece from about forty degrees above, so its whole top "
    "surface is clearly visible and well lit while the front and side faces also "
    "remain visible. 50mm lens, minimal perspective distortion. The "
    "entire piece is fully inside the frame with generous even margin on every side. "
    "Photorealistic, sharp throughout, premium Scandinavian contemporary design, "
    "quiet luxury, warm neutral palette, honest natural materials. "
    "No studio equipment or lighting rigs visible, no people, no plants, no props, "
    "no styling objects, no room, no floor line, no text, no watermark."
)

# Mattor och tavlor fotograferas rakt uppifrån respektive rakt framifrån.
SCEN_TOP = (
    "Flat overhead product photograph of one single item lying perfectly flat, seen "
    "from exactly straight above with its edges parallel to the frame. Seamless pure "
    "white background, completely even soft overhead light, no directional shadow. "
    "The entire item is inside the frame with generous even margin. Photorealistic, "
    "sharp, muted natural palette. No people, no furniture, no props, no room, no text."
)

SCEN_FRONT = (
    "Straight-on front product photograph of one single item against a seamless pure "
    "white background, even soft light, subtle contact shadow only. The entire item is "
    "inside the frame with generous margin. Photorealistic, sharp. "
    "No people, no props, no room, no text."
)

# Materialordlistan. Samma ord ska betyda samma sak i alla åttio prompter,
# annars driver biblioteket isär i ton.
TEXTIL = {
 "ivory":   "ivory white linen with a visible open weave",
 "oatmeal": "oatmeal linen-cotton with visible slubby weave and warm undertone",
 "sand":    "warm sand coloured linen with visible weave",
 "greige":  "warm greige brushed cotton with fine visible weave",
 "olive":   "muted olive wool with visible fibre texture",
 "charcoal":"deep charcoal wool with visible fibre texture",
 "boucle":  "off-white wool boucle with clearly visible looped fibre texture",
}
TRA = {
 "light-oak":   "pale solid oak with fine straight grain and a natural matt oil finish",
 "natural-oak": "solid oak with warm honey tone, visible cathedral grain, matt oil finish",
 "smoked-oak":  "smoked oak with deep brown tone and pronounced dark grain, matt finish",
 "dark-oak":    "dark stained oak with near-espresso tone and visible grain",
 "walnut":      "solid walnut with rich chocolate tone and dramatic cathedral grain, satin oil finish",
 "travertine":  "warm travertine stone with visible open pores and natural banding",
 "black-metal": "slim matt black powder-coated steel",
}
