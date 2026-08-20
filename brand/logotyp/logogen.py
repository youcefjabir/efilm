# -*- coding: utf-8 -*-
"""VIEWLYS MÄRKE I FÄRG

   Geometrin rörs inte. Sökvägen och cirkeln är spårade ur logotyp-PNG:en
   med en överlappning på 0,9925 mot originalet, och de talen står kvar
   oförändrade här. Det enda som varieras är färg och fält.

   Två familjer:
     REN     ett fält, en märkesfärg. Lem och punkt i samma ton.
     TVÅ     ett fält, lem i en ton och punkt i en annan — husets eget
             uppträdande, där punkten bär oliven.

   Fältet är en fyrkant, inte en cirkel. Cirkeln hör till Instagrams
   omslag och ska inte sitta i logotypen."""

VB   = "0 0 858.6 756.3"
LIMB = "M 0 16.4 L 206.7 16.4 Q 243.7 16.4 259.7 43.4 L 588 552.6 L 462.2 756.3 Z"
DOT  = (705.2, 153.4, 153.4)
RATIO = 858.6 / 756.3

# Placeringen i fältet, mätt och inte gissad.
#
# Märkets tyngdpunkt ligger på y 37,1 medan boxens mitt ligger på 49,9 —
# lemmen är bred upptill och slutar i en spets, och punkten sitter högt.
# Box-centrerat ser märket därför topptungt ut. Ett prov på fyra lägen
# gav 52,5 som det som sitter still; 55 och nedåt börjar hänga.
#
# Bredden 50 av 100 valdes efter samma sorts prov, med cirkelbeskärning
# påslagen: halvdiagonalen blir 33,3 av radien 50, så märket klarar den
# runda beskärning som Instagram och LinkedIn lägger på ändå.
CY = 52.5
BREDD = 50.0

P = {
 "papper":   "#EFECE7",  "sand":     "#E7E4DC",  "ljus":     "#F2EFEF",
 "salvia":   "#C8CCBF",  "salvia2":  "#98A088",  "oliv":     "#6E7266",
 "mossa":    "#48503E",  "djup":     "#333A2E",  "skog":     "#2C322A",
 "natt":     "#22261F",  "svart":    "#141416",  "skugga":   "#0E0E0D",
}

def lum(hexs):
    c = [int(hexs[i:i+2],16)/255 for i in (1,3,5)]
    c = [x/12.92 if x <= 0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2]

def kontrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la,lb), min(la,lb)
    return (hi+0.05)/(lo+0.05)

def marke(ink, dot, bredd=BREDD, cx=50.0, cy=CY):
    """Märket placerat i ett 100 × 100-fält, mitt i, med angiven bredd."""
    h = bredd / RATIO
    x, y = cx - bredd/2, cy - h/2
    s = bredd / 858.6
    return ('<g transform="translate(%.4f %.4f) scale(%.6f)">' % (x, y, s)
      + '<path d="%s" fill="%s"/>' % (LIMB, ink)
      + '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s"/>' % (DOT[0], DOT[1], DOT[2], dot)
      + '</g>')

def tile(bg, ink, dot, bredd=BREDD, storlek=1024):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" '
            'width="%d" height="%d">' % (storlek, storlek)
      + ('<rect width="100" height="100" fill="%s"/>' % bg if bg else '')
      + marke(ink, dot, bredd) + '</svg>')

# --------------------------------------------------------------------------
# VARIANTERNA
#
# REN  = ett fält, en märkesfärg. Det användaren bad om: "en bg färg,
#        en logo färg". Lem och punkt i samma ton, så märket blir en
#        enda form.
# TVÅ  = husets eget uppträdande, där punkten bär oliven och lemmen
#        bär ink. Samma geometri, två toner.
# --------------------------------------------------------------------------
REN = [
 ("papper-svart",   "papper", "svart",   "Grundformen. Den som gäller när inget annat är bestämt."),
 ("svart-papper",   "svart",  "papper",  "Inverterad. Samma tyngd, mörkt fält."),
 ("sand-djup",      "sand",   "djup",    "Varmare papper, mörk oliv. Mjukare än svart utan att tappa."),
 ("natt-salvia",    "natt",   "salvia",  "Mörk oliv med ljus salvia. Den lugnaste av de mörka."),
 ("skugga-salvia2", "skugga", "salvia2", "Nästan svart fält, dämpad salvia. Diskret."),
 ("skog-ljus",      "skog",   "ljus",    "Djupgrön botten, rent ljus form."),
 ("oliv-ljus",      "oliv",   "ljus",    "Husets oliv som fält. Märket i ljus."),
 ("papper-oliv",    "papper", "oliv",    "Oliv på papper. Lägst kontrast av alla — se måtten."),
]
TVA = [
 ("papper-svart-oliv", "papper", "svart",   "oliv",    "Husets standard: svart lem, oliv punkt."),
 ("skugga-ljus-oliv",  "skugga", "ljus",    "salvia2", "Mörk motsvarighet. Punkten bär salvian."),
 ("oliv-ljus-svart",   "oliv",   "ljus",    "svart",   "Oliv fält, ljus lem, svart punkt."),
 ("sand-djup-oliv",    "sand",   "djup",    "oliv",    "Varm sand, mörk lem, oliv punkt."),
 ("natt-salvia-ljus",  "natt",   "salvia",  "ljus",    "Punkten ljusast — ögat går dit först."),
 ("papper-oliv-svart", "papper", "oliv",    "svart",   "Omvänd fördelning: oliv lem, svart punkt."),
]


def marke_ensam(ink, dot, storlek=1024):
    """Märket utan fält, i sin egen ram. Ingen optisk förskjutning här —
       den hör till fältet, inte till formen. Den som placerar det här
       märket i en egen layout gör sin egen justering."""
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" width="%d" height="%d">'
            % (VB, storlek, int(round(storlek/RATIO)))
      + '<path d="%s" fill="%s"/>' % (LIMB, ink)
      + '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s"/>' % (DOT[0], DOT[1], DOT[2], dot)
      + '</svg>')
