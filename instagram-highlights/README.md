# Viewly — Instagram Highlights

Isolerat design- och strukturprojekt för Viewlys Instagram-profil.

**Status: Fas 5 + 6 byggda. Systemet ligger i `v3/`.**

Ingenting här är kopplat till produktion, publicering, databaser eller automation.
Inga befintliga flöden är rörda. Instagram är inte kopplat.

---

## Öppna

```
instagram-highlights/v3/highlights.html     ← systemet (aktuellt)
instagram-highlights/v2/story-system.html   ← audit, strategi, prototyper
instagram-highlights/studio.html            ← v1, granskad och förkastad
```

Öppna filen direkt i en webbläsare. Den är helt fristående — all typografi och
all bild ligger inbäddad, inga externa anrop.

Innehåller fem vyer:

| # | Vy | Vad den visar |
|---|----|----|
| 01 | Audit | Viewlys faktiska färger, typsnitt och bildbibliotek, hämtat från viewly.se |
| 02 | Arkitektur | Rekommenderad Highlight-struktur med motivering |
| 03 | Designspår | Tre art directions, varje kompositionsprimitiv renderad |
| 04 | Profilvy | Alla nio covers i verklig Instagram-skala, alla tre spår sida vid sida |
| 05 | Bibliotek | Samtliga Highlights, med uppspelning av varje sekvens |

Klicka på ett Highlight för att spela sekvensen som på Instagram.
`←` `→` bläddrar · `mellanslag` pausar · `Esc` stänger.

---

## Struktur

```
instagram-highlights/
├── README.md
├── studio.html              Preview-appen (fristående)
└── content/
    ├── highlights.json      9 Highlights, 57 Stories: copy, primitiv, mediareferenser
    ├── directions.json      De tre designspårens tokens
    ├── assets.json          27 tillgängliga assets + 7 identifierade luckor
    └── brand.json           Färg, typografi och kompositionsprimitiv
```

Tre principer i datamodellen:

1. **Numret är ordningen.** Ingen separat sorteringskolumn som kan hamna i otakt.
2. **Assets ägs aldrig av en Story.** Stories refererar via `media`-nycklar till
   `assets.json`, så samma bild kan användas i flera Highlights utan dubbletter.
3. **Designspåret är ett lager ovanpå innehållet.** Byte av spår ändrar ingen
   copy och ingen mediakoppling.

---

## Rekommenderad struktur

Briefens tio Highlights har blivit nio. Fem produkter som annars hade blivit egna
rubriker är i stället absorberade i större berättelser — det är skillnaden mellan
en tjänstekatalog och ett ekosystem.

| # | Highlight | Besvarar | Stories |
|---|-----------|----------|---------|
| 01 | Viewly | Vad är Viewly? | 7 |
| 02 | Seendet | Hur ser kvaliteten ut? | 7 |
| 03 | Rörelse | Vad kan jag skapa? | 6 |
| 04 | Rummet | Vad kan jag skapa? | 6 |
| 05 | Förvandling | Varför är Viewly annorlunda? | 7 |
| 06 | Systemet | Hur fungerar det? | 6 |
| 07 | Objekt | Kan jag lita på dem? | 6 |
| 08 | Inifrån | Vilka är ni? | 7 |
| 09 | Ditt hem | Hur börjar jag? | 5 |

Absorberade: planritning och områdeskarta → **04 Rummet** · e-styling och
Atmosphere → **05 Förvandling** · Annonsskrivaren och Ad Studio → **06 Systemet**.
Om oss och Fotografer är sammanslagna till **08 Inifrån**.

---

## Materialläge

27 verkliga assets hämtade från viewly.se används i previewen. 13 av 57 Stories
saknar rätt material och är märkta `needsAsset` med en beskrivning av vad som
behöver produceras. De renderas med en tydligt angiven ersättningsbild — slå på
**Visa asset-status** i vyn Designspår för att se dem markerade.

De två kritiska luckorna är **motion-frames** (03) och **ett komplett case**
fotograferat genom hela kedjan (07).

---

## Faser

- **Fas 1–3** — audit, arkitektur, tre designspår. Levererat, sedan förkastat.
- **Fas 4** — omtag: brutal audit, ny grafikdriven strategi, tre hero-prototyper. Godkänd.
- **Fas 5–6** — hela Story-systemet byggt. Ligger i `v3/`. **Här är vi.**
- **Fas 7 — Publicering.** Diskuteras separat. Ingår inte i detta arbete.

---

## v3 — det byggda systemet

Nio Highlights, 53 stories, ritade som SVG i 1080 × 1920. **74 % grafisk design,
informationsdesign eller illustration.** Fotografi används på de 26 % där
fotografiet faktiskt är berättelsen.

| # | Highlight | Stories | Grafik |
|---|-----------|---------|--------|
| 01 | Viewly | 7 | 86 % |
| 02 | För mäklare | 7 | 86 % |
| 03 | Verktyg | 6 | 100 % |
| 04 | Foto | 6 | 50 % |
| 05 | 3D | 5 | 80 % |
| 06 | Motion | 5 | 80 % |
| 07 | E-styling | 6 | 67 % |
| 08 | Cases | 6 | 33 % |
| 09 | Om oss | 5 | 80 % |

### Bärande grepp

**Lokaliseringsdiagrammet.** Produkt-Highlights (04–07) öppnar med samma
ekosystem-spine där en nod är tänd. Den som bara öppnar 3D förstår ändå helheten.
Ekosystemet kommuniceras genom upprepning, inte genom en Highlight som påstår det.

**58,0°.** Varje förgrening, konvergens, mask och blockkant använder logotypens
uppmätta vinkel. Igenkänningen blir strukturell i stället för påklistrad. I
`01 Viewly` bildar diagrammets ändpunkter själva en 58°-linje — vinkeln uppstår
ur informationen.

**Covers är pictogram, inte ikoner.** Varje cover är sitt eget Highlights kärnidé
reducerad till två till fyra streck, ritad för ändamålet. Endast `09 Om oss`
använder logotypen bokstavligt.

### Safe area

1080 × 1920 · 250 px reserverat upptill · 320 px nedtill · 64 px sidor ·
levande yta x 64–1016, y 250–1600. Overlay kan slås på över varje ram.

### Filer

```
v3/highlights.html   fristående bibliotek med uppspelning
v3/highlights.json   53 stories som data — copy, primitiv, media, luckor
v3/draw.js           renderarbiblioteket, 8 primitiv
v3/content.js        innehållsmodellen
v2/brand-geometry.json  tracead logotyp + safe-area-spec
```

### Kvar att producera

6 stories saknar rätt material. Två kritiska: **motion-frames** ur faktisk
bostadsfilm och **ett komplett case** fotograferat genom hela kedjan.
Se `needsAsset` i `v3/highlights.json`.
