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
| 02 | Kompositioner | De tretton primitiven renderade i vald riktning, plus den faktiska fördelningen över biblioteket |
| 03 | Profil | Fjorton omslag i verklig Instagram-skala, båda riktningarna, samt igenkänningstest vid 56 px |
| 04 | Format | Fyra kampanjmallar och tre artboards: 9:16, 4:5, 1:1 — plus profilrutnätet |
| 05 | Studio | Redigera: välj bland tre förslag per bildruta, byt bild, ladda upp egna, skriv om texten, spara, ladda ner |
| 06 | Lager & media | Vad som är låst, halvlåst och redigerbart — med en live media-slot |

I Studio öppnar du ett kapitel och får filmremsa, live-scen och inspektör. `▶ Spela
sekvensen` startar uppspelningen; `←` `→` bläddrar · `Esc` stänger.
**Instagrams UI** kan slås på i varje vy: det är Instagrams riktiga gränssnitt i
skala, inte en debug-overlay med färgade zoner.

---

## Två riktningar

Tredje spåret (KONSTRUKTION) och de senare A/B/C-spåren är avförda. Kvar står de
två som faktiskt bär varumärket:

**ARKIV** — tryckt monografi. Papper `#F2EFEF`, ink `#1C1C1E`, oliv `#6E7266`.
Cormorant Garamond 300 för display, Montserrat 500 / .24em för metadata. Bilden
ligger i en ram på pappret. Omslaget är kapitlets märke i en hårfin cirkel — högst kontrast mot
Instagrams vita gränssnitt.

**SKUGGA** — cinematisk. Svart `#0E0E0D`, ljus `#EFEDE7`, oliv lyft `#98A088`.
Mörkret är grunden, fotografiet är ljuskällan. V-formen används som bländare:
fotografiet framträder genom märket. Risken är dokumenterad — covers blir mörka
cirklar med lägst igenkänning vid 56 px, så scrimen är kraftigare i mitten
än i kanten för att märket ska bära.

---

## Tretton kompositionsprimitiv

Varje Story byggs av ett av tretton primitiv. Bara **full bleed** och **case**
låter fotografiet äga hela ytan — 13 av 90 bildrutor. Resten bärs av typografi,
linje, plåt och luft, med bilden i en mask.

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
| `whitelabel` | Samma leverans i två kontors varumärken, sida vid sida |

---

## Två zoner

**Canvas** — hela 1080 × 1920. Fotografi, papper, masker, gradienter och geometri
får bo här och gå ut i kant.

**Kritisk** — 250 px topp och 280 px botten tillhör Instagram. Rubrik, brödtext,
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

## Omslagen — tre ikonsystem

Ett nummer på omslaget låser ordningen, så varje kapitel har ett eget märke.
Ordningen är fri.

### Utvärdering av den förra ikonomgången

Sju av fjorton var informativa. Resten var geometri som råkade se ut som något:

| Märke | Läste som |
|---|---|
| Kortet | ett profilkort |
| Rummet möblerat | en bänk |
| Höjden | en lampa |
| Kvarteret | en propeller |
| Formaten, Portalen, Kontaktkartan | block |

Över hela uppsättningen tre fel som gjorde den *billig* snarare än bara fel:
formerna gick nästan ut i kant, valörerna låg för nära varandra, och varje märke
hade sin egen skala.

En mellanomgång svarade med att ta bort ikonerna helt — monogram i Cormorant och
tonade fotografier. Det var fel svar: ett omslag ska vara **informativt**, och
varken en bokstav eller en suddig bild säger vilken tjänst kapitlet handlar om.

### Rättningen: färre detaljer, satta i ett system

| Regel | |
|---|---|
| **Optisk ruta** | varje motiv ryms i 56 × 56 av 100. Marginalen är det som gör en form dyr |
| **Fyra toner** | platta, ljus, form, accent. Inga mellanlägen, ingen opacitet |
| **En accent** | exakt en yta per märke, och den ligger på det som betyder något |
| **Minst 6 brett** | ingen fylld form tunnare än 6 enheter |
| **Ett budskap** | märket ska gå att namnge på en halv sekund |

### Tre system, alla ikoner

Samma fjorton motiv, tre utföranden — precis som bildrutorna har tre förslag:

| System | Grepp |
|---|---|
| **Pictogram** | Fylld form med utskurna detaljer. Rak och tyst |
| **Linjen** | Samma motiv i hårlinje, med stort andrum |
| **Negativ** | Formen urskuren ur en fylld olivplatta — en tyngre rad |

En länk i panelen sätter valt system för alla fjorton kapitel; motivet kan bytas
per kapitel bland de fjorton.

| Kapitel | Motiv |
|---|---|
| Viewly | logotypen |
| Fotografering | ett foto med landskap |
| 3D visning | kuben, volym i tre ytor |
| E-styling | fåtöljen — en möbel säger möblerat snabbare än ett rum |
| Atmosphere | solen över horisonten |
| Drönare | kvadkoptern med lins |
| Områdeskarta | nålen |
| Motion | bildrutan med spelknappen |
| Annonsen | dokumentet med rubrik |
| Kampanjen | tre format på gemensam baslinje |
| Systemet | portalen som fönster med lister |
| Objekt | tre plåtar på varandra |
| Inifrån | fotografen med kamera |
| Ditt hem | huset med tänt fönster |

Paletten är brevpapperets: `#EFECE6` respektive `#0E0E0D`, oliv `#6E7266`,
bläck `#1C1C1E`. Inga främmande färger, inga rundade hörn, inga scener.

### Omslaget är sista bildrutan

Omslaget ligger **sist i varje kapitels bildruteserie** — i filmremsan, i
kontaktkartan och i serienedladdningen. Ett kapitel med sju Stories laddar ner
åtta filer. Exportbilden är 1080 × 1920 med cirkeln centrerad och kapitlets namn
satt i Cormorant under; Instagram beskär själv till cirkeln.

Klickar man sista kortet i remsan öppnas omslagsvyn med sin egen
nedladdningsknapp. Textfälten göms — det är ingen bildruta man skriver i.

## Motion — som alternativ, aldrig som ersättning

Sju bildrutor i biblioteket har en rörelsevariant. Den ligger **ovanpå** A/B/C
som ett fjärde alternativ, och `Ingen` är default: rör man ingenting renderas
allt exakt som förut.

| # | Bildruta | Primitiv | Längd |
|---|---|---|---|
| 01 | Annonsskrivaren | `flow` | 6,8 s |
| 02 | Motion | `split` | 6,4 s |
| 03 | E-styling | `split` | 6,2 s |
| 04 | Kampanjfaserna | `phases` | 6,6 s |
| 05 | Tre format | `matrix` | 6,2 s |
| 06 | White label | `whitelabel` | 6,4 s |
| 07 | 3D — plan till volym | `product` | 6,4 s |

Varje kandidat finns i tre riktningar — **Editorial reveal**, **System / process**
och **Object / material** — så det finns 21 rörelser att välja bland. Auditen som
ligger bakom urvalet, med A/B/C-klassificering av alla femton templates, står i
vy 07.

### Ingen animationsmotor

Rörelsen är en **ren funktion av tiden**:

```js
mframe(kandidat, riktning, dirId, t)   // t går 0 → 1 över klippets längd
```

Ingen tidslinje, inga animationsobjekt, inget bibliotek. Sekvensering görs med en
enda hjälpfunktion, `seg(t, a, b)`, som klipper ut ett tidsfönster och normaliserar
det till 0–1.

Det bygger på en mätning: att bygga en bildrutas HTML ur datan tar **0,19 ms**.
Att rita om hela ramen per bildruta är alltså gratis, och då behövs ingen motor
som muterar DOM-egenskaper över tid.

Konsekvenserna är hela poängen:

- **En källa till sanning.** Granskningsspelaren och exporten anropar samma
  funktion. De kan inte glida isär.
- **Deterministiskt.** Ruta *n* ser likadan ut varje gång. Inget att synka mot.
- **Noll beroenden.** Fungerar under artefaktens CSP, behåller enfilsleveransen.
- **Skrubbningsbart.** Reglaget i panelen sätter `t` direkt — man kan granska
  bildruta för bildruta.

### Export

`Rörelsen som video` renderar varje ruta ur samma funktion, rastrerar den och
spelar in canvasen med `MediaRecorder` — samma pipeline som redan fanns för
uppladdade klipp.

| Mätt | |
|---|---|
| Rastrering, typisk ram | 39 ms |
| Rastrering, ram med två helbilder och wipe | 78 ms |
| 6,2 s i 30 fps = 186 rutor | ≈ 15 s |

MP4 där webbläsaren klarar det, annars WebM. Filen kontrolleras efteråt med
samma `verifyClip` som resten av videoexporten.

### Varför inte Remotion, GSAP eller Framer Motion

Projektet har inget `package.json`, inget byggsteg och inget ramverk, och
levereras som en fristående HTML-fil under en CSP som blockerar externa värdar.
GSAP och Motion One kräver bundler eller CDN; Framer Motion kräver React;
Remotion kräver Node, React, byggsteg och ffmpeg. Remotion är rätt verktyg den
dag renderingen flyttar till en Node-tjänst med H.264 i skala — det är en annan
leveransmodell och bör tas som ett eget beslut.

---

## Stabilitet i gränssnittet

`render()` scrollade alltid till toppen. Varje klick som ändrade något — välja
förslag, byta omslagssystem, byta bild — byggde om hela sektionen och kastade
tillbaka användaren till sidans början.

Nu scrollas det bara när vyn faktiskt byts: annan sektion, in i editorn eller ut
ur den. Allt annat behåller scrollpositionen, i två steg — direkt och efter
layout, eftersom bilder kan ändra sidhöjden. Fokus läggs tillbaka på det element
som klickades, så tangentbordsnavigering inte tappar sin plats.

Verifierat med ett skript som scrollar ner 900 px och sedan klickar sig igenom
förslagsbyte, omslagssystem, figurbyte, bildrutebyte och riktningsbyte: alla fem
behåller positionen.

---

## Tre förslag per bildruta

Varje Story finns i **tre utföranden**. 90 bildrutor blir 270. Förslag A är
originalet; B och C ligger som patchar ovanpå det och byter både komposition
och formulering.

| | Grepp |
|---|---|
| **A** | Originalet |
| **B** | Samma budskap, annan komposition — vill man ha samma sak sagd men med en annan bildyta |
| **C** | Annan ingång till samma sak. Oftast kortare och mer konkret, ibland en faktaram i stället för en känsla |

Ett exempel, 03 · 3D visning, bildruta 02:

| | Primitiv | Rubrik |
|---|---|---|
| A | `quiet` | *Låt spekulanten kliva in. När som helst.* |
| B | `editorial` | *Låt spekulanten kliva in* — med bilden som stöd |
| C | `system` | *Fyra siffror:* 99 % · 90 % · 32 % snabbare · 9 % högre slutpris |

I studion ligger de tre som **live-renderade bildrutor** överst i inspektören,
inte som beskrivningar — man väljer med ögat. Filmremsan märker upp vilka
bildrutor som har ett annat förslag än A.

Ordningen vid rendering är **original → valt förslag → egna ändringar**. En
omskriven rubrik ligger alltså kvar när man byter förslag, och `Återställ
bildrutan` går tillbaka hela vägen till A.

Byter en patch primitiv bär den med sig det primitivet ritar: `split` behöver
två bilder och två etiketter, `system` poster, `matrix` format. All copy är
hämtad ur eller förenlig med respektive sida på viewly.se.

Svepet renderar alla 270 utförandena i båda riktningarna — 540 renderingar,
noll text i Instagrams kritiska zoner.

---

## Bildbanken

Egna bilder och klipp laddas upp per bildruta och hamnar i en gemensam bank som
alla bildrutor och omslag delar. Varje egen bild har ett **kryss** för
borttagning; de 24 som följer med underlaget kan inte tas bort — de är
underlaget, inte användarens material.

En borttagen bild får inte lämna en trasig referens efter sig, så varje
media-slot, omslag och kampanjmall som pekade på den återgår till sitt original
i samma operation. `Töm bildbanken` gör samma sak för allt på en gång.

En mätare under bildväljaren visar hur många egna bilder som finns, hur mycket
de väger och var de faktiskt ligger.

### Varför sparandet slutade fungera

Den förra versionen la **allt** i localStorage, uppladdade bilder inkluderade.
En bild på 1400 px som base64 väger 200–500 kB, och localStorage tar omkring
5 MB totalt. Mätt i webbläsaren: `QuotaExceededError` vid **13 bilder / 5,2 MB**
— därefter gick ingenting att spara, inte ens en ändrad rubrik.

Lagringen är därför delad i två:

| | Innehåll | Var | Storlek i praktiken |
|---|---|---|---|
| **Lätt** | texter, valda förslag, slot-inställningar, objektet, omslagsval | `localStorage` | ~400 B |
| **Tung** | bildbanken | `IndexedDB` | hundratals MB |

Den lätta delen sparas **alltid först**, så att ett fullt bildutrymme aldrig
kan ta texten med sig. Saknas IndexedDB faller bilderna tillbaka till
localStorage, och om inte heller det räcker sägs det rakt ut i stället för att
sparandet tystnar.

Verifierat med 25 bilder på 9,8 MB: allt sparat, texten och de valda förslagen
oskadda, bildbanken korrekt inläst efter omladdning.

Exporten är också delad, av samma skäl:

- **Exportera text som JSON** — några kB, går alltid igenom. Flyttar texter och
  val mellan webbläsare eller personer.
- **Exportera allt inkl. bilder** — tar med bildbanken och blir stor.

Import läser båda, och en trasig fil ger ett besked i stället för att tyst göra
ingenting.

---

## Studio — redigera och ladda ner

Vy 05 är en editor, inte en katalog. Öppna ett kapitel och du får tre kolumner:
filmremsa med alla bildrutor, live-scen i mitten, inspektör till höger.

**Vad som går att ändra per bildruta**

| Fält | Gäller |
|---|---|
| Kicker, rubrik, kursiv rad, underrad | Endast de primitiv som faktiskt renderar dem |
| Etiketter | `split` — Före/Efter, Dag/Skymning |
| Poster, en per rad | `system` |
| Stegetiketter, AI-signaler, tonlägen, annonsrubrik, annonsingress | `flow` |
| Formatnamn, en per rad | `matrix` |
| Objektet: adress, ort, fakta, etikett, tid, not | `phases` och vy 04 Format |
| Utförande | Tre förslag per bildruta — A, B eller C |
| Bild i slot | Hela biblioteket **plus egna uppladdade bilder**, med borttagning |
| Fokalpunkt Y och zoom | 0–100 % respektive 100–200 % |
| Omslag: märke, bild, fokalpunkt | Per kapitel |

Fältlistan speglar vad primitivet verkligen ritar. `fullbleed` och `split`
renderar ingen underrad och `flow` ingen heller — de fälten erbjuds inte längre,
i stället för att stå kvar och inte göra någonting.

**Objektet.** Adress, ort och faktaraden är samma bostad i alla fyra
kampanjmallar, så de skrivs till alla på en gång. Etikett, tid och not är per
mall. Panelen finns både i editorn när `phases` är vald och överst i vy 04
Format, och en ändring slår igenom i alla artboards direkt — 4:5, 1:1, 9:16,
miniatyrerna och profilrutnätet.

Texten uppdaterar scenen och filmremsan medan du skriver, utan att fältet tappar
fokus. `Återställ bildrutan` tar tillbaka originalet för just den rutan.

**Egna bilder och video.** `Ladda upp bild eller video` tar emot en eller flera
filer. Bilder skalas ned till max 1400 px. Ett videoklipp får en stillbild
sparad som poster — så miniatyrer, kontaktkarta och PNG-export fungerar
oförändrat — och spelas upp i rutan i studion. Klippen ligger kvar under
sessionen; `Spara` behåller stillbilden, inte filmen.

**Video ut.** Har bildrutan ett klipp dyker `Denna bildruta som video` upp.
Exporten rastrerar designen en gång med videorutan genomskinlig, ritar sedan
klippet i rutan bildruta för bildruta med designen ovanpå, och spelar in
canvasen med `MediaRecorder`. Resultatet är 1080 × 1920, MP4 där webbläsaren
klarar det och annars WebM. Filen kontrolleras efteråt — muxen säger sig ibland
klara MP4 men skriver en tom eller avhuggen fil, och då körs exporten om med
nästa format. Ljudet från klippet följer med när webbläsaren
tillåter det. Max 20 sekunder.

**Spara.** `Spara` lägger texter, valda förslag och slot-inställningar i
`localStorage` och bildbanken i `IndexedDB` — se **Bildbanken** ovan för varför de
är åtskilda. `Återställ allt` nollar tillbaka till originalet.

Redigeringarna ligger aldrig i innehållsmodellen: de lagras i `PICKS` (valt
förslag), `EDITS` (Stories), `SLOTS` (media), `CEDITS` (omslag) och `PEDITS`
(objektet), och läggs på vid rendering i ordningen original → förslag →
ändringar. Originalet finns alltid kvar. `Återställ bildrutan`, `Återställ
objektet` och `Återställ allt` går tillbaka olika långt.

### Export

Ramarna är HTML/CSS, inte bilder. Exporten serialiserar ramen till ett SVG med
`foreignObject`, rastrerar den i en canvas och lämnar över filen till artefaktens
`downloads`-funktion. Typsnitt och foton ligger redan som data-URI, så inget
hämtas externt och canvasen blir aldrig tainted. **Alla redigeringar följer med.**

| Knapp | Ger |
|---|---|
| Denna bildruta · 1080×1920 | En PNG. Instagram-overlayen följer med om den är påslagen |
| Hela serien som kontaktkarta | Alla bildrutor i **en** PNG — en dialogruta |
| Alla N bildrutor separat | En PNG per bildruta, sekventiellt med räknare i knappen |
| PNG i vy 04 Format | Varje kampanjmall i 9:16, 4:5 och 1:1, 1080 px bredd |

Separat export ger en bekräftelse per fil. Bara en dialogruta får vara öppen åt
gången — kommer nästa för tätt svarar runtimen `rate_limited`, och exporten
väntar och försöker igen i stället för att stanna. Avbryter du en fil medvetet
stannar serien där. En statusrad under knapparna visar utfallet och felkoden.
Det finns också ett litet API på sidan om exporten behöver skriptas:

```js
await viewlyExport.frame("annonsen", 2, "arkiv");   // Blob, 1080×1920 PNG
await viewlyExport.sheet("kampanjen", "skugga");    // kontaktkarta
await viewlyExport.post("p4", "4:5", "arkiv");      // artboard: mallen Såld
await viewlyExport.video("foto", 0, "arkiv");       // {blob, ext} — 1080×1920
```

Nedladdningen använder artefaktens `downloads`-funktion, som bara finns när
sidan körs på claude.ai. Öppnas filen lokalt säger knappen det rakt ut i stället
för att tyst göra ingenting.

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

## Struktur — en tjänst, ett kapitel

Fjorton kapitel, 90 Stories. Segmenteringen följer `viewly.se`, inte en tänkt
gruppering: varje tjänst på `/tjanster` äger sitt eget kapitel, plus Motion som
har egen sida. Apparna är inte tjänster och ligger som egna kapitel efter dem.

| # | Highlight | Källa | Besvarar | Stories |
|---|-----------|-------|----------|---------|
| 01 | Viewly | `/` | Vad är Viewly? | 7 |
| 02 | Fotografering | `/bostadsfotografering` | Hur ser kvaliteten ut? | 7 |
| 03 | 3D visning | `/3d-visning` | Vad kan jag skapa? | 7 |
| 04 | E-styling | `/e-styling` | Varför är Viewly annorlunda? | 7 |
| 05 | Atmosphere | `/atmosphere` | Varför är Viewly annorlunda? | 7 |
| 06 | Drönarfotografering | `/dronarfotografering` | Vad kan jag skapa? | 6 |
| 07 | Områdeskarta | `/omradeskarta` | Vad kan jag skapa? | 6 |
| 08 | Motion | `/motion` | Vad kan jag skapa? | 7 |
| 09 | Annonsen | `/annonsskrivaren` | Vem skriver texten? | 6 |
| 10 | Kampanjen | `/some-studio` | Hur når objektet ut? | 6 |
| 11 | Systemet | portalen | Hur fungerar det? | 6 |
| 12 | Objekt | case | Kan jag lita på dem? | 6 |
| 13 | Inifrån | `/om-oss`, `/fotografer` | Vilka är ni? | 7 |
| 14 | Ditt hem | bostadsägare | Hur börjar jag? | 5 |

Tidigare låg tjänsterna hopslagna: *Rummet* bar 3D och områdeskarta, *Förvandling*
bar e-styling och Atmosphere, *Rörelse* bar Motion. Det gick inte att länka en
enskild tjänst, och en kund som bara vill se e-styling fick fyra bildrutor om
något annat först. Nu är de sju tjänsterna sju kapitel, och 01 Viewly är index:
`system`-ramen namnger dem en gång, i samma ordning som webbplatsen.

Kapitel 11–14 är kontext, inte tjänster: systemet som håller ihop dem, beviset
på ett objekt, människorna bakom och bostadsägarens ingång.

### White label — 03 och 07

Två leveranser bär **kundens** varumärke, inte Viewlys: 3D-visningssidan och
områdeskartan. Det står uttryckligen på båda sidorna, och ett påstående av den
sorten går inte att skriva sig ur — det måste visas. Därför primitivet
`whitelabel`: samma leverans renderad som två miniatyrsidor bredvid varandra,
med två kontors logotypfärg, textrytm och knappstil. Färgerna i korten tillhör
de fiktiva kontoren och ingår inte i Viewlys palett.

- **03 · 3D visning** — *"Kontoret sätter logotyp, färger, typografi och
  knappstil en gång. Därefter skapas varje ny visningssida automatiskt i rätt
  uttryck."*
- **07 · Områdeskarta** — *"Färger, typsnitt och format anpassas efter kontorets
  grafiska profil. Samma formspråk på varje objekt gör kontorets annonser
  igenkännbara."*

### Copy

All copy i tjänstekapitlen är hämtad ur respektive sida på `viewly.se` —
omfattning och pris i 02, dollhouse, planritning och mätverktyg i 03,
transparenskravet på märkta e-stylade bilder i 04, de tre effekterna skymning /
blå himmel / sommar i 05, regelverket i 06, högupplöst PNG på 1–2 arbetsdagar i
07, och de fyra stegen Bilderna → Rörelsen → Redigeringen → Filmen i 08.
Ingenting är påhittat. Den är fortfarande förslag och riktning, inte låsta krav.

### 09 Annonsen — Annonsskrivaren

Eget kapitel. Säljer utfallet — en färdig text — aldrig AI:n bakom. Copy hämtad
ur `viewly.se/annonsskrivaren`: färdig bostadsannons på 30 sekunder, de sex
signalerna AI:n läser ur bilderna, tonlägena saklig / varm / exklusiv med två
omskrivningar. `flow`-ramen ritar hela kedjan och slutar i ett faktiskt
annonsutkast, inte i ett påstående.

### 10 Kampanjen — Social / Ads Studio

Eget kapitel. Copy hämtad ur `viewly.se/some-studio`: kontorets egna mallar,
obegränsat antal i valfritt format, 4:5 / 1:1 / 9:16 för Instagram, Facebook och
LinkedIn, kampanjfaserna kommande → till salu → visning → såld, och under en
minut när mallarna är satta. Kapitlet slutar på produktens egen rad: *Ett objekt.
Hela kampanjen.*

---

## Materialläge

24 verkliga assets hämtade från viewly.se används i underlaget. 22 av 90 Stories
saknar rätt material och är märkta med vad som behöver produceras — slå på
**Markera saknat material** i vy 02 eller 04.

Uppdelningen i en tjänst per kapitel gör luckorna synliga i stället för att dölja
dem: så länge tre tjänster delade ett kapitel räckte en bild per tjänst.

De kritiska luckorna, i ordning:

1. **Områdeskarta — hela kapitel 07.** Ingen renderad karta finns i biblioteket.
   Alla fyra bildslots i kapitlet använder en drönarbild som platshållare, och
   `whitelabel`-korten behöver två faktiska kartor i respektive kontors färger.
2. **Motion-frames** ur faktisk bostadsfilm (08 Motion) — split-ramens B-sida är
   i dag en andra stillbild.
3. **Sommareffekten** (05 Atmosphere). Skymning och blå himmel har verkliga
   före/efter-par; sommar saknar par — behövs: samma tomt grå respektive
   grönskande.
4. **Ett komplett case** fotograferat genom hela kedjan (12 Objekt).
5. **Vertikala portalskärmar 9:16.** Nuvarande `portal`-asset är en beskuren
   desktopvy och används som platshållare i 01, 09, 10 och 11 med fokalpunkt satt
   så att gränssnittet åtminstone går att läsa.
6. **Produktbilder för 09 Annonsen och 10 Kampanjen:** Annonsskrivarens
   redigeringsvy med tonlägesval, och Social / Ads Studios mallbibliotek.

---

## Filer

```
v6/highlights.html      fristående underlag — öppna denna
v6/shell.html           skalet: tokens, komponenter, layout
v6/draw.js              geometri, media-slots, riktningsstilar, tretton primitiv × två riktningar,
                        fjorton illustrerade omslag, fyra kampanjmallar × tre format × två riktningar
v6/content.js           innehållsmodell: kapitel, primitiv, riktningar, lagermodell
v6/app.js               vyerna, editorn, exporten och spelaren
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
  implementerade media-slots. Senast: tjänsterna uppdelade i ett kapitel var,
  efter `viewly.se`, med `whitelabel` för de två leveranser som bär kundens
  varumärke.

---

## Nästa steg

Granska vy 01 och välj riktning — eller be om en tredje som blandar. Ingenting
migreras, ingenting publiceras och ingen automation rörs förrän riktningen är
godkänd.
