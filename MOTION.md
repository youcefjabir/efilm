# Motion — arkitekturplan

Motion är framsidan till projektet: bilder in, färdig AI-regisserad bostadsfilm
ut, som öppnas i Master Editor för finjustering. Det här dokumentet är planen
som implementationen följer.

---

## 1. Utgångsläget — vad som redan finns och återanvänds

Repot innehåller idag Master Editor: ~4 500 rader i fjorton fristående moduler.
Motion byggs **inuti** den kodbasen, inte bredvid den. Följande återanvänds rakt av:

| Finns redan | Används i Motion till |
|---|---|
| `S` (store, undo/redo, serialisering) | Motion-projektets state, samma historik |
| `DB` (IndexedDB: files/projects/meta) | assets, projekt, planer, jobb |
| `M` (projektmodell, klipp, spår) | **Motion producerar ett vanligt projekt** |
| `Media` (ingestion, thumbnails, `analyzeAudio`, `detectBeats`) | bild- och musikimport, grund för musikanalysen |
| `StabAnalyze` (motion tracking) | **QC av genererade klipp** — mäter wobble, bob och deformation |
| `Renderer` / `Playback` / `Timeline` | preview av resultatet, ingen egen spelare behövs |
| `Exporter` | export av färdig film |
| `style.css` (mörkt neutralt, accent `#6d7266`) | Motion ärver designsystemet |

**Konsekvens som styr allt annat:** Motions output är inte ett eget format. Det
är ett `M.newProject()` med ett `motion`-dokument bredvid. "Öppna i Master
Editor" är därför ett vylägesbyte — ingen konvertering, ingen synkning, inget
parallellt system.

---

## 2. Den obekväma sanningen om MCP i webbläsaren

MCP är ett protokoll mellan en klient (Claude) och en server. **En publicerad
webbsida har varken MCP-klient eller Higgsfield-nycklar.** En "trigger-knapp"
som direkt anropar MCP från sidan går alltså inte att bygga ärligt. Tre vägar
finns, och Motion byggs så att alla tre kopplas in i *samma* jobbkö:

| Väg | Hur | Kräver | Läge |
|---|---|---|---|
| **A. Agentbrygga** | Sidan lägger jobben i kön och exporterar ett manifest. Claude (den här sessionen) kör `generate_video_batch` via MCP och importerar klippen. | inget — fungerar nu | ✅ default |
| **B. Lokal brygga** | `tools/motion-bridge.js` lyssnar på localhost, sidan POST:ar jobb dit, bryggan anropar Higgsfields API. | en Higgsfield API-nyckel | helautomatiskt |
| **C. Higgsfield-hostad site** | Sidan deployas via Higgsfields website-verktyg och får server-side-åtkomst. | verifiering av deras runtime | utreds |

Generationslagret har därför ett `Provider`-interface med tre adaptrar. Resten
av Motion vet ingenting om vilken som används.

---

## 3. Kostnad — en förstklassig del av modellen, inte en fotnot

Kling v3.0, standardläge, ljud av: **7,5 credits per 5-sekundersklipp.**
Saldot är 160,5 credits ⇒ **21 shots totalt**, alltså ungefär *en* film på 16 shots.

Det gör kostnaden till en produktegenskap:

- Director Plan visar exakt kostnad **innan** något genereras.
- Skapa-knappen är spärrad tills användaren bekräftat summan.
- Varje enskild regenerering visar sitt pris (7,5 cr) innan den körs.
- Saldot hämtas och visas i gränssnittet; räcker det inte får användaren veta
  hur många shots som ryms.
- Kling tar heltalssekunder 3–15. Vi genererar `ceil(timelineDuration + marginal)`
  och trimmar — aldrig tvärtom.

---

## 4. Datamodell — normaliserad, inte en JSON-klump

Fem nya object stores i samma IndexedDB. Assets ligger kvar i `files`.

```
motionProjects   { id, projectId, propertyName, status, createdAt, updatedAt,
                   musicAssetId, targetDuration, aspect, credits{estimated,spent} }

imageAnalysis    { id, assetId, w, h, exposure, contrast, colorTemp,
                   symmetry, depthScore, horizonY, vanishing, edgeEnergy,
                   dominantLines, brightnessProfile, roomGuess[], quality,
                   heroScore, isExterior, isDrone, isDetail, signature }

musicAnalysis    { id, assetId, bpm, beats[], downbeats[], bars[], phrases[],
                   sections[{t,type,energy}], energyCurve[], accents[],
                   cutPoints[{t, strength, kind}] }

directorPlans    { id, motionProjectId, version, createdBy:'engine'|'claude',
                   rationale, shots[shotId], createdAt }

shots            { id, planId, index, assetId, movementId, prompt,
                   timelineIn, timelineOut, timelineDuration,
                   generatedDuration, sourceIn, sourceOut,
                   role:'hero'|'support'|'detail'|'closer', roomType,
                   motivation, status, jobId, outputAssetId, qc{} }

generationJobs   { id, shotId, provider, model:'kling3_0', params,
                   status, attempts, cost, requestId, outputUrl, error, log[] }
```

Statusar:

```
motionProject : draft → analyzing → planned → generating → qc → ready | failed
shot          : planned → queued → generating → generated → qc_pass | qc_fail → approved
job           : pending → submitted → running → done | failed | cancelled
```

---

## 5. Pipeline

```
bilder ─┐
        ├─► bildanalys ──┐
musik ──┴─► musikanalys ─┴─► DIRECTOR ─► Director Plan ─► jobbkö ─► generering
                                                                       │
                                         Master Editor ◄── projekt ◄── QC
```

Ingenting genereras innan planen finns. Musiken bestämmer klipppunkterna, och
videogeneratorn anpassas efter klippningen — inte tvärtom.

### 5.1 Musiken skapas av appen

`MusicMake` komponerar låten i stället för att analysera fram en. Det är inte
en finess utan grunden för allt annat: en uppmätt beatgrid är alltid ungefärlig,
medan en komponerad låt har ett *känt* taktrutnät. `MusicStructure.analyze()`
känner igen en komponerad låt på `media.composed` och returnerar strukturen
oförändrad i stället för att mäta upp den igen.

Fem stilar, med tempon valda så att en takt hamnar där bostadsfilm faktiskt
klipper:

| Stil | BPM | Takt | Karaktär |
|---|---|---|---|
| Nordic Calm | 80 | 3,00 s | stilla piano, standardvalet |
| Warm Daylight | 76 | 3,16 s | dur, ljust, villa och trädgård |
| Modern Deep | 100 | 2,40 s | stadig puls, nyproduktion |
| Uplift | 112 | 2,14 s | plock och rörelse |
| Cinematic Wide | 88 | 2,73 s | breda svep, exteriör och drönare |

Låten byggs ur ett arrangemang med nivåer per fras (intro → uppbyggnad → peak →
avslut), och antalet fraser sätts av önskad filmlängd. Sektionsgränser,
frasgränser, downbeats och halvtakter blir därmed exakta klipplägen, och det
är den listan användaren stegar mellan när ett klipps längd ändras för hand.
Syntesen är additiv och skrivs rakt in i en `Float32Array` — inget
WebAudio-beroende, så låtarna går att bygga och verifiera headless.

---

## 6. Regissören — två nivåer, samma schema

Sidan måste fungera utan LLM-uppkoppling. Därför:

**Nivå 1 — Director Engine (alltid, i webbläsaren).** Riktig analys, inte
hårdkodad sortering:

- *Bildanalys*: ljushet, kontrast, färgtemperatur, kantenergi, symmetri kring
  vertikalaxeln, djupmått ur perspektivlinjernas konvergens, horisontlinje,
  andel himmel/grönska (exteriör), närhet/oskärpa (detalj), samt en
  perceptuell signatur för att hitta nästan identiska bilder.
- *Rumsgruppering*: bilderna grupperas efter färgvärld — färghistogram, ett
  ljusstyrkeoberoende kromatikhistogram, ton, värme och textur — med
  agglomerativ klustring vars snitt sätts där sammanslagningspoängen faller av
  en klippa. Samma rum fotograferat från två håll hamnar därmed i samma grupp.
  Regissören gissar däremot **inte** vad rummet heter: kök och sovrum går inte
  att skilja åt på pixelstatistik, och ett felaktigt namn var precis det som
  gjorde tidigare versioner opålitliga. Rummen heter "Rum 1", "Rum 2" tills
  användaren döper dem, en gång per rum.
- *Scentyp*: exteriör, drönare, detalj eller interiör. Drönare kräver att
  marken fyller bilden, hög horisont och nästan inga stående linjer. Gissningen
  går att rätta i planen, och kamerareglerna följer med rättelsen.
- *Ordning*: en rundtur byggd som en sekvens med öppning (starkaste exteriör),
  ett rum i taget, närbilder som övergång **mellan** rum (aldrig mitt i ett),
  avslut på reveal. Straffar nästan identiska grannar och mekaniska mönster.
- *Längder*: alltid en klipppunkt ur musiken — aldrig en längd som ligger
  bredvid takten. Ryms inte alla bilder inom filmens längd får bilder utgå, och
  planen säger vilken filmlängd som hade räckt.
- *Rörelser*: varje rörelse deklarerar vilka scentyper den hör hemma i
  (`scenes`), och det är en hård regel — en drönarbild kan inte få en
  sidledsslide, ett badrum kan inte lyftas som en fasad, en närbild får bara
  lugn push. Inom ramen väljs rörelsen utifrån bildens geometri, ljusbalansen
  (slide går mot det ljusare hållet, alltså mot fönstret) och grannarnas
  rörelser.
- *Handredigering*: rum, kamerarörelse och längd går att ändra per shot.
  Ändringarna ligger som overrides på assetId och överlever att planen
  regisseras om; efterföljande klipp flyttas med och snäpps om mot musiken.

**Nivå 2 — Claude som regissör (när bryggan finns).** Analysen serialiseras och
skickas till Claude, som får returnera en plan i exakt samma schema. Planen
valideras mot samma regler (täcker musiken, inga otillåtna rörelser, längder
inom modellens gränser). Faller valideringen används motorns plan. Båda
versionerna sparas — `createdBy` visar vilken som gäller.

---

## 7. QC — återanvänder stabilisatorn

Varje genererat klipp körs genom `StabAnalyze`. Rapporten ger redan exakt de
mått vi behöver: skakningsnivå, vertikal bob, rotationsdrift, perspektiv-
förändring och wobble-risk (residual + kvadrantvis divergens). Regler:

- wobble-risk > 0,55 eller spårningskvalitet < 0,5 ⇒ `qc_fail`
- oväntad rörelse mot beställd rörelse (t.ex. push-in som driver i sidled) ⇒ flagga
- `qc_fail` ⇒ automatisk regenerering, max 2 försök, därefter manuellt val
- klipp som passerar men skakar lite får stabiliseringen påslagen automatiskt

---

## 8. Integration med Master Editor

Motion-projektet **är** editorprojektet. Konkret:

- varje shot blir ett klipp med `in = sourceIn`, `out = sourceOut`
- klippen packas sekventiellt — cuts hamnar på Claudes musikpunkter
- musiken läggs på musikspåret med auto-fade mot slutet
- default är rena hard cuts; transitions bara där planen motiverar det
- klippet får `shotId` så editorn kan koppla tillbaka till planen

Nytt i editorn: **Shot-panel** för klipp som kommer från Motion — visar
motivering, rörelse, prompt, QC-resultat och knapparna *Regenerera* (auto eller
vald rörelse) och *Byt källbild*. Endast den shoten genereras om.

Byte av musik i editorn erbjuder *Anpassa cuts till nya musiken*: ny musikanalys
→ ny edit plan → nya cuts, **utan** att generera om videoklippen.

---

## 9. Vyer

`App.view = 'motion' | 'editor' | 'projects'`, samma toppbar. Motion är en
wizard i tre steg (Bilder → Musik → Motion), sedan en körvy med verklig progress
per fas, och en klarvy med preview + *Öppna i Master Editor*.

---

## 10. Byggordning

1. Datamodell + stores + statusmaskin
2. Bildimport och bildanalys
3. Musikanalys (beats → downbeats → barer → fraser → sektioner → cut points)
4. Director Engine + plan-schema + validator
5. Motion-UI: tre steg, sammanfattning, progress, klarvy
6. Generationslager: provider-interface, jobbkö, kostnadsspärr, agentbrygga
7. QC via StabAnalyze + automatisk regenerering
8. Timeline-bygge och överlämning till Master Editor
9. Shot-panel i editorn: regenerera, byt rörelse, byt bild
10. Mina projekt
11. Tester: syntetiska bostadsbilder, plan-validering, hela flödet i webbläsare
