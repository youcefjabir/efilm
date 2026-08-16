# Viewly — Instagram Highlights

Isolerat design- och strukturprojekt för Viewlys Instagram-profil.

**Status: designunderlag för granskning. Ingen riktning är vald.**

Ingenting här är kopplat till produktion, publicering, databaser eller automation.
Inga befintliga flöden är rörda. Instagram är inte kopplat. Fas 7 är orörd.

---

## Öppna

```
instagram-highlights/v6/highlights.html   ← aktuellt underlag (ARKIV + SKUGGA)
```

Öppna filen direkt i en webbläsare. Den är helt fristående — typografi och all
bild ligger inbäddad som data-URI, inga externa anrop.

| # | Vy | Vad den visar |
|---|----|----|
| 01 | Riktning | ARKIV och SKUGGA sida vid sida, palett, typografi, logotypbruk, risk — och samma Story löst i båda |
| 02 | Kompositioner | De tolv primitiven renderade i vald riktning, plus den faktiska fördelningen över biblioteket |
| 03 | Profil | Tio covers i verklig Instagram-skala, båda riktningarna, samt igenkänningstest vid 56 px |
| 04 | Format | Fyra kampanjmallar och tre artboards: 9:16, 4:5, 1:1 — plus profilrutnätet |
| 05 | Bibliotek | Alla tio kapitel med sekvensuppspelning |
| 06 | Lager & media | Vad som är låst, halvlåst och redigerbart — med en live media-slot |

Klicka på ett kapitel för att spela sekvensen. `←` `→` bläddrar · `Esc` stänger.
**Instagrams UI** kan slås på i varje vy: det är Instagrams riktiga gränssnitt i
skala, inte en debug-overlay med färgade zoner.

---

## Två riktningar

Tredje spåret (KONSTRUKTION) och de senare A/B/C-spåren är avförda. Kvar står de
två som faktiskt bär varumärket:

**ARKIV** — tryckt monografi. Papper `#F2EFEF`, ink `#1C1C1E`, oliv `#6E7266`.
Cormorant Garamond 300 för display, Montserrat 500 / .24em för metadata. Bilden
ligger i en ram på pappret. Covers är kapitelnummer i cirkel — högst kontrast mot
Instagrams vita gränssnitt.

**SKUGGA** — cinematisk. Svart `#0E0E0D`, ljus `#EFEDE7`, oliv lyft `#98A088`.
Mörkret är grunden, fotografiet är ljuskällan. V-formen används som bländare:
fotografiet framträder genom märket. Risken är dokumenterad — covers blir mörka
cirklar med lägst igenkänning vid 56 px.

---

## Tolv kompositionsprimitiv

Varje Story byggs av ett av tolv primitiv. Bara **full bleed** och **case** låter
fotografiet äga hela ytan — 13 av 69 bildrutor. Resten bärs av typografi, linje,
plåt och luft, med bilden i en mask.

| Primitiv | Roll |
|---|---|
| `mark` | V-geometrin bär kompositionen — mask, ram eller överdimensionerat vattenmärke |
| `fullbleed` | Bilden äger hela ytan. Nästan ingen typografi |
| `quiet` | Nära tom. En mening som får bära |
| `editorial` | Kontrollerad typografi i komponerad relation till bilden |
| `product` | Ren presentation av 3D, motion eller portal |
| `split` | Två ytor: före/efter, still/rörligt, jämförelse |
| `system` | Ekosystemet som typografisk ryggrad — aldrig en ikonlista |
| `case` | Objekt, plats, en bild som får tala |
| `cta` | Extremt enkel slutbild |

De tre sista ritar hur något fungerar i stället för att beskriva det:

| Primitiv | Roll |
|---|---|
| `flow` | Input → bearbetning → output. Slutar i ett faktiskt resultat, inte en påstådd fördel |
| `matrix` | Samma objekt i sanna formatproportioner, med px-mått. 4:5, 1:1 och 9:16 mätbart mot varandra |
| `phases` | En kampanj som fyra faktiska artboards, med aktuellt läge tänt |

---

## Två zoner

**Canvas** — hela 1080 × 1920. Fotografi, papper, masker, gradienter och geometri
får bo här och gå ut i kant.

**Kritisk** — 250 px topp och 320 px botten tillhör Instagram. Rubrik, brödtext,
kicker, folio, watermark och CTA håller sig innanför: 23,2 cqw uppe, 26,0 cqw
nere, 6,4 cqw sidor. Detta är inte en krympning av designen — bilden och
geometrin använder fortfarande hela ytan.

Allt ritas i HTML/CSS inuti `container-type: inline-size`, så `1cqw` = 1 % av
ramens bredd = 10,8 px i en 1080-px-Story. Måtten är därför upplösningsoberoende.

---

## Lagermodell

Systemet är bara användbart om någon annan kan producera i det utan att designen
glider.

**Låst:** rutnät och marginaler · logotypgeometri · typskala och vikter ·
kompositionsmask · palett.

**Halvlåst:** kicker och folio (texten fri, positionen inte) · primitivval (max
två full bleed i rad) · sekvenslängd (5–7 Stories).

**Redigerbart:** bild i slot · fokalpunkt och zoom · rubrik och brödtext ·
etiketter i split.

En Story kan ange `fy` och `zoom` som utgångsläge för sin slot. Det är ett
defaultvärde, inte en låsning — *Återställ slot* nollar tillbaka till systemets
50 % / 100 %.

Media-sloten är implementerad, inte bara beskriven: byt bild, dra i fokalpunkt
och zoom i vy 05 eller i spelaren — masken, marginalerna och typskalan står still.

---

## Format och kampanjmallar

Designen är bara ett system om den håller utanför 9:16. Social / Ads Studio
exporterar tre format ur samma mall:

| Format | Px | Roll |
|---|---|---|
| 9:16 | 1080 × 1920 | Story. Bandet växer och får extra bottenmarginal så inget hamnar under Instagrams svarsfält |
| 4:5 | 1080 × 1350 | Inlägg. Störst yta i flödet, standard för objektinlägg |
| 1:1 | 1080 × 1080 | Kvadrat i profilrutnätet och som LinkedIn-annons |

**Statusen är inte en etikett i hörnet.** Varje kampanjfas är en egen mall där
status bestämmer hela kompositionen — hur mycket bild, hur mycket information,
och vad som får vara störst:

| Mall | Grepp |
|---|---|
| **Kommande** | Bilden dominerar, informationen hålls tillbaka. Hårlinje, spärrad status, adressen som löfte |
| **Till salu** | Tätast: adress, faktarad med rum, yta och byggår, samt visningstid |
| **Visning** | En enda uppgift satt stort. Allt annat backar |
| **Såld** | Ordet tar över och bilden tonas ned. Beviset står i kolofonen |

Samma objekt hela vägen — Silvergården 9A. Bara mallen byts när kampanjen går
vidare. Alla fyra × tre format × två riktningar finns renderade i vy 04, och
`phases`-primitivet visar samma fyra mallar inuti en Story.

Post-renderaren delar palett, typskala och logotypgeometri med Story-renderaren
men har egen vertikal rytm per mall och per format.

---

## Export

Ramarna är HTML/CSS, inte bilder. `Ladda ner PNG` serialiserar ramen till ett
SVG med `foreignObject`, rastrerar den i en canvas och lämnar över filen till
artefaktens `downloads`-funktion. Typsnitt och foton ligger redan som data-URI,
så inget hämtas externt och canvasen blir aldrig tainted.

- **Enskild bildruta** — 1080 × 1920 PNG, i spelaren. Instagram-overlayen följer
  med om den är påslagen.
- **Hela kapitlet** — en kontaktkarta med alla bildrutor i en enda PNG, så det
  blir en dialogruta i stället för sju.
- **Artboards** — varje format i vy 04, 1080 px bredd.

Webbläsaren visar en bekräftelse innan något sparas. Det finns också ett litet
API på sidan om exporten behöver skriptas:

```js
await viewlyExport.frame("annonsen", 2, "arkiv");   // Blob, 1080×1920 PNG
await viewlyExport.sheet("kampanjen", "skugga");    // kontaktkarta
await viewlyExport.post("p4", "4:5", "arkiv");      // artboard: mallen Såld
```

---

## Verifierad logotypgeometri

Spårad ur `viewly-logo-mark.png` (1080 × 941), **IoU 0,9925** mot originalet.
Ingen approximerad V-form.

```
viewBox  0 0 858.6 756.3
limb     M 0 16.4 L 206.7 16.4 Q 243.7 16.4 259.7 43.4 L 588 552.6 L 462.2 756.3 Z
punkt    cx 705.2 · cy 153.4 · r 153.4
vinkel   58.0° · tan 1.6003
svart    #141416   (djupare än UI-ink #1C1C1E)
```

Se `v6/brand-geometry.json`.

---

## Struktur

Elva kapitel, 69 Stories. Produkter som bara är en rad i en tjänstelista är
absorberade i större berättelser; de två som bär eget innehåll — Annonsskrivaren
och Social / Ads Studio — har egna kapitel.

| # | Highlight | Besvarar | Stories |
|---|-----------|----------|---------|
| 01 | Viewly | Vad är Viewly? | 7 |
| 02 | Seendet | Hur ser kvaliteten ut? | 7 |
| 03 | Rörelse | Vad kan jag skapa? | 6 |
| 04 | Rummet | Vad kan jag skapa? | 6 |
| 05 | Förvandling | Varför är Viewly annorlunda? | 7 |
| 06 | Systemet | Hur fungerar det? | 6 |
| 07 | Annonsen | Vem skriver texten? | 6 |
| 08 | Kampanjen | Hur når objektet ut? | 6 |
| 09 | Objekt | Kan jag lita på dem? | 6 |
| 10 | Inifrån | Vilka är ni? | 7 |
| 11 | Ditt hem | Hur börjar jag? | 5 |

Absorberade: planritning och områdeskarta → **04 Rummet** · e-styling och
Atmosphere → **05 Förvandling** · beställning, mallar och fakturering →
**06 Systemet**. Om oss och Fotografer är sammanslagna till **10 Inifrån**.

### 07 Annonsen — Annonsskrivaren

Eget kapitel. Säljer utfallet — en färdig text — aldrig AI:n bakom. Copy hämtad
ur `viewly.se/annonsskrivaren`: färdig bostadsannons på 30 sekunder, de sex
signalerna AI:n läser ur bilderna, tonlägena saklig / varm / exklusiv med två
omskrivningar. `flow`-ramen ritar hela kedjan och slutar i ett faktiskt
annonsutkast, inte i ett påstående.

### 08 Kampanjen — Social / Ads Studio

Eget kapitel. Copy hämtad ur `viewly.se/some-studio`: kontorets egna mallar,
obegränsat antal i valfritt format, 4:5 / 1:1 / 9:16 för Instagram, Facebook och
LinkedIn, kampanjfaserna kommande → till salu → visning → såld, och under en
minut när mallarna är satta. Kapitlet slutar på produktens egen rad: *Ett objekt.
Hela kampanjen.*

All copy är förslag och riktning, inte låsta krav.

---

## Materialläge

24 verkliga assets hämtade från viewly.se används i underlaget. 15 av 69 Stories
saknar rätt material och är märkta med vad som behöver produceras — slå på
**Markera saknat material** i vy 02 eller 04.

De kritiska luckorna:

1. **Motion-frames** ur faktisk bostadsfilm (03 Rörelse).
2. **Ett komplett case** fotograferat genom hela kedjan (08 Objekt).
3. **Vertikala portalskärmar 9:16.** Nuvarande `portal`-asset är en beskuren
   desktopvy och används som platshållare i 01, 06 och 07 med fokalpunkt satt så
   att gränssnittet åtminstone går att läsa.
4. **Produktbilder för 07 Annonsen och 08 Kampanjen:** Annonsskrivarens
   redigeringsvy med tonlägesval, och Social / Ads Studios mallbibliotek.

---

## Filer

```
v6/highlights.html      fristående underlag — öppna denna
v6/shell.html           skalet: tokens, komponenter, layout
v6/draw.js              geometri, media-slots, riktningsstilar, tolv primitiv × två riktningar,
                        fyra kampanjmallar × tre format × två riktningar
v6/content.js           innehållsmodell: kapitel, primitiv, riktningar, lagermodell
v6/app.js               studiovyerna och spelaren
v6/brand-geometry.json  spårad logotyp + safe-area-spec
```

---

## Historik

- **v1** `studio.html` — audit, arkitektur, tre spår (ARKIV, SKUGGA, KONSTRUKTION).
- **v2** `v2/` — brutal audit, spårad logotypgeometri, tre hero-prototyper.
- **v3** `v3/` — hela biblioteket i SVG. Övertolkade safe area, all komposition
  drogs in mot mitten.
- **v4** `v4/` — tvåzonsmodell och media-slots. Fel creative direction.
- **v5** `v5/` — tre nya spår. Förkastade: helbild på nästan varje ram.
- **v6** `v6/` — **här är vi.** Tillbaka till ARKIV och SKUGGA från v1, med
  verifierad geometri, skarpare media, riktig Instagram-overlay och
  implementerade media-slots.

---

## Nästa steg

Granska vy 01 och välj riktning — eller be om en tredje som blandar. Ingenting
migreras, ingenting publiceras och ingen automation rörs förrän riktningen är
godkänd.
