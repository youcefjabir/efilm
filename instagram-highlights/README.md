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
| 02 | Kompositioner | De nio primitiven renderade i vald riktning, plus den faktiska fördelningen över biblioteket |
| 03 | Profil | Tio covers i verklig Instagram-skala, båda riktningarna, samt igenkänningstest vid 56 px |
| 04 | Bibliotek | Alla tio kapitel med sekvensuppspelning |
| 05 | Lager & media | Vad som är låst, halvlåst och redigerbart — med en live media-slot |

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

## Nio kompositionsprimitiv

Varje Story byggs av ett av nio primitiv. Bara **full bleed** och **case** låter
fotografiet äga hela ytan — 13 av 64 bildrutor. Resten bärs av typografi, linje,
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

Tio kapitel, 64 Stories. Briefens tio Highlights är fortfarande tio, men inte
samma tio — produkter som annars hade blivit egna rubriker är absorberade i
större berättelser. Det är skillnaden mellan en tjänstekatalog och ett ekosystem.

| # | Highlight | Besvarar | Stories |
|---|-----------|----------|---------|
| 01 | Viewly | Vad är Viewly? | 7 |
| 02 | Seendet | Hur ser kvaliteten ut? | 7 |
| 03 | Rörelse | Vad kan jag skapa? | 6 |
| 04 | Rummet | Vad kan jag skapa? | 6 |
| 05 | Förvandling | Varför är Viewly annorlunda? | 7 |
| 06 | Systemet | Hur fungerar det? | 6 |
| 07 | Kampanjen | Hur når objektet ut? | 7 |
| 08 | Objekt | Kan jag lita på dem? | 6 |
| 09 | Inifrån | Vilka är ni? | 7 |
| 10 | Ditt hem | Hur börjar jag? | 5 |

Absorberade: planritning och områdeskarta → **04 Rummet** · e-styling och
Atmosphere → **05 Förvandling** · beställning, mallar och fakturering →
**06 Systemet** · Annonsskrivaren och Social / Ads Studio → **07 Kampanjen**.
Om oss och Fotografer är sammanslagna till **09 Inifrån**.

### 07 Kampanjen

Annonsskrivaren och Social / Ads Studio hade blivit två tunna tjänsterubriker var
för sig. Tillsammans är de ett kapitel med en egen fråga: *det som händer efter
fotograferingen*. Sekvensen säljer utfallet, aldrig AI:n.

All copy är hämtad ur `viewly.se/annonsskrivaren` och `viewly.se/some-studio`:
"Färdig bostadsannons på 30 sekunder", de sex sakerna AI:n läser ur bilderna,
tonlägena saklig / varm / exklusiv, kontorets egna mallar i 4:5, 1:1 och 9:16 för
Instagram, Facebook och LinkedIn, samt kampanjfaserna kommande → till salu →
visning → såld. Kapitlet slutar på produktens egen rad: *Ett objekt. Hela
kampanjen.*

Sekvensen är medvetet typdriven — sex av sju bildrutor bärs av typografi och
information, inte av foto. Två `system`-ramar gör tyngdlyftet: de sex signalerna i
bilden, och de fyra kampanjfaserna.

All copy är förslag och riktning, inte låsta krav.

---

## Materialläge

24 verkliga assets hämtade från viewly.se används i underlaget. 15 av 64 Stories
saknar rätt material och är märkta med vad som behöver produceras — slå på
**Markera saknat material** i vy 02 eller 04.

De kritiska luckorna:

1. **Motion-frames** ur faktisk bostadsfilm (03 Rörelse).
2. **Ett komplett case** fotograferat genom hela kedjan (08 Objekt).
3. **Vertikala portalskärmar 9:16.** Nuvarande `portal`-asset är en beskuren
   desktopvy och används som platshållare i 01, 06 och 07 med fokalpunkt satt så
   att gränssnittet åtminstone går att läsa.
4. **Produktbilder för 07 Kampanjen:** Annonsskrivaren med tonlägesval, och
   Social / Ads Studio med samma objekt i 4:5, 1:1 och 9:16.

---

## Filer

```
v6/highlights.html      fristående underlag — öppna denna
v6/shell.html           skalet: tokens, komponenter, layout
v6/draw.js              geometri, media-slots, riktningsstilar, nio primitiv × två riktningar
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
