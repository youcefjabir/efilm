# Viewly — Instagram Highlights

Isolerat design- och strukturprojekt för Viewlys Instagram-profil.

**Status: Fas 1–3 klara. Väntar på val av designriktning (Fas 4).**

Ingenting här är kopplat till produktion, publicering, databaser eller automation.
Inga befintliga flöden är rörda. Instagram är inte kopplat.

---

## Öppna studion

```
instagram-highlights/studio.html
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

## Nästa steg

- **Fas 4 — Val.** Välj ett av de tre spåren: Arkiv, Skugga eller Konstruktion.
- **Fas 5 — Systemdesign.** Bygg ut det valda spåret till ett fullständigt Story-system.
- **Fas 6 — Innehåll.** Producera de skarpa sekvenserna med rätt material.
- **Fas 7 — Publicering.** Diskuteras separat. Ingår inte i detta arbete.
