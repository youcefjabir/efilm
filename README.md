# Master Bostadsfilm Editor

En komplett, körbar videoeditor för premium bostadsfilm. Allt körs lokalt i
webbläsaren — inga uppladdningar, ingen server, ingen backend. Öppna
`dist/index.html` så är den igång.

```
node build.js                 # bygger dist/index.html (en enda självständig fil)
npx http-server -p 8099 .     # och öppna http://127.0.0.1:8099/dist/index.html
```

## Vad som faktiskt fungerar

Ingenting i gränssnittet är attrapp. Följande är riktigt implementerat och
verifierat i automatiska tester mot en riktig webbläsare:

| Område | Implementation |
|---|---|
| Import | `File` → `IndexedDB` + object URL. Metadata, upplösning och framerate läses ur filen (`requestVideoFrameCallback`) |
| Thumbnails | Riktiga bildrutor ur videon: en miniatyr + en filmstrip på 6–12 rutor som ligger under klippet i timelinen |
| Preview | WebGL-kompositor. All geometri (crop, stabilisering, rörelse, skala, position, perspektiv) blir en homografi; all färg körs i fragment-shadern |
| Timeline | Sekventiellt videospår (kan inte överlappa ologiskt) + fria musik- och textspår, trimhandtag, drag för ordningsändring, magnetisk snapping, zoom, ripple delete |
| Stabilisering | Riktig motion tracking — se nedan |
| Färg | 13 presets + 19 manuella reglage, alla i shadern. Auto Enhance och Match Clips analyserar riktiga bildrutor |
| Ljud | `decodeAudioData` → waveform + transientdetektering (BPM), Web Audio-graf med master, fades och auto duck |
| Export | `canvas.captureStream()` + `MediaRecorder` i full projektupplösning, med ljudspår från Web Audio. Ger en nedladdningsbar MP4 eller WebM |
| Projekt | IndexedDB, autosave, återställning vid omladdning, duplicera, importera/exportera projektfil |

## Stabiliseringen

Det här är produktens kärna. Den är byggd i fyra utbytbara steg, och varje steg
är mätt — inte antaget.

1. **Infångning** (`src/50-stab-analyze.js`) — klippet spelas upp och varje
   presenterad bildruta lagras som gråskala. Avkodningen är avsiktligt skild
   från spårningen: om spårningen får ligga i infångningsloopen tappas
   bildrutor, och skakning över halva samplingsfrekvensen blir då omöjlig att
   korrigera. Hinner webbläsaren inte med körs klippet om i halv hastighet
   tills täckningen är minst 85 % av källans bildfrekvens.
2. **Spårning** — varje ruta blir en gråskalepyramid i tre nivåer.
   Harris-respons väljer punkter där vertikala och horisontella linjer möts,
   alltså dörrkarmar, fönsterhörn och väggmöten. Punkterna matchas
   grov-till-fint med SAD och subpixelförfining och propageras mellan rutor.
3. **Modell** — en robust affin transform anpassas per ruta med IRLS och
   ridge-regularisering, och dekomponeras i x, y, rotation, skala och shear.
   Aspektkanalen mäts men appliceras aldrig: den skulle töja bilden och ändra
   bildförhållandet.
4. **Bearbetning** (`src/55-stab-process.js`) — varje kanal jämnas ut med ett
   gaussfilter vars bredd styrs av Smoothness; skillnaden mot den råa banan är
   korrigeringen. Walking bob tas bort genom att Y-kanalens filter breddas till
   minst en gångperiod. Nödvändig zoom räknas ut genom att testa vyns fyra hörn
   i varje bildruta.
5. **Rendering** (`src/70-render.js`) — korrigeringen appliceras som en
   homografi i GPU:n, samma transform i preview och export.

### Den svåraste detaljen: rätt korrigering till rätt bildruta

Korrigeringen är lika snabb som skakningen den ska ta bort. Hämtas den för fel
bildruta blir den inte bara verkningslös — den *lägger till* skakning med
omvänd fas. Timelinens klocka och videoelementets `currentTime` glider isär med
en till två rutor, och efter en sökning kan `currentTime` ligga före den ruta
som faktiskt är på skärmen.

Därför följer stabiliseringen `requestVideoFrameCallback`-ens `mediaTime`:
samma källa som texturen laddas från. Det är skillnaden mellan 0 % och 90 %
borttagen skakning, och det syns inte i något test som bara kontrollerar att
bilden "förändras".

### Uppmätt effekt

`tools/test-stab.js` renderar klippet genom hela kedjan, spårar rörelsen i den
**färdiga utbilden** och jämför med stabiliseringen avstängd:

| Klipp | Inlagd rörelse | Skakning borta | Ryckighet borta |
|---|---|---|---|
| `walking-bob.webm` | 9 px bob @ 1,70 Hz + vibrationer | **94,6 %** | **89,1 %** |
| `handheld-pushin.webm` | små vibrationer + push-in | **78,6 %** | **62,5 %** |

Analysen hittar också tillbaka till den inlagda rörelsen: bobfrekvensen mäts
till 1,6–1,8 Hz mot facit 1,70 Hz.

### Vad den inte klarar

`ai-wobble.webm` innehåller icke-rigid deformation — 24 remsor som rör sig åt
olika håll samtidigt. Där mäter testet att *varje* läge gör den globala
rörelsen större, inte mindre. Det är inte en bugg utan en gräns: en global
transform kan bara ta bort kamerans gemensamma rörelse. Deformationen i väggar
och karmar sitter kvar, och en stark korrigering kan förstärka den.

Editorn hanterar det ärligt i stället för att dölja det: wobble-risken mäts
(residual efter anpassning + kvadrantvis divergens), och överstiger den
tröskeln rekommenderar Auto **Subtle** med en varning i klartext — inte ett
läge som låter som en reparation. Att räta ut deformationen kräver mesh-warp
per pixel, vilket inte ryms i den här körmiljön.

## Motion — AI-regisserad bostadsfilm

`Motion` är framsidan: bilder in, färdig film ut, som öppnas i Master Editor.
Arkitekturen ligger i [MOTION.md](MOTION.md). Kortversionen:

```
bilder ─┐
        ├─► bildanalys ──┐
musik ──┴─► musikanalys ─┴─► DIRECTOR ─► Director Plan ─► jobbkö ─► generering
                                                                       │
                                         Master Editor ◄── projekt ◄── QC
```

Inget genereras innan planen finns. Musiken bestämmer klipppunkterna, och
videomodellen får rätta sig efter klippningen — behöver ett shot 3,08 s medan
Kling bara gör heltalssekunder genereras 4 s och segmentet 0,9–3,98 används.

| Del | Status |
|---|---|
| Bildanalys | ljus, kontrast, kanter, symmetri, djup, horisont, himmel, hero-poäng, dubblettsignatur |
| Musikstruktur | taktrutnät, downbeats, takter, fraser, sektioner, energikurva, klipppunkter med typ och styrka |
| Regissör | ordning som rundtur, längder på musikens punkter, rörelseval med grannhänsyn, motivering per shot |
| Generering | provider-interface: lokal rendering (gratis) och Kling v3.0 via brygga/manifest |
| QC | stabilisatorns mätningar återanvänds för att hitta wobble och skakning |
| Överlämning | planen blir ett vanligt editorprojekt — samma format, ingen konvertering |

### Vad analysen klarar och inte klarar

Mätt mot 13 syntetiska bostadsbilder med känt facit:

* **ute mot inne: 13/13.** Ett fönster inomhus skiljs från riktig himmel genom
  att äkta himmel fyller bildens översta remsa.
* **exakt rumstyp inomhus: 5/13.** Ett kök och ett sovrum skiljer sig inte
  tillräckligt i ljus-, kant- och färgstatistik för att en handskriven
  heuristik ska klara det. Därför är rumstypen ett *förslag*: osäkra gissningar
  markeras, går att ändra i planen, och planen regisseras om direkt. Regissören
  bygger i övrigt på det som faktiskt håller — ute/inne, detalj, hero-poäng,
  symmetri och djup. Rätt lösning är en vision-modell, och den kopplas in där
  `ImageAnalyze.classify()` sitter.

### Kostnad

Kling v3.0 kostar **7,5 credits per 5-sekundersklipp**. En film på 16 shots
landar därför runt 120 credits. Kostnaden visas innan något genereras, Skapa-
knappen kräver bekräftelse, och varje enskild regenerering visar sitt pris.
Den lokala providern renderar rörelsen i webbläsaren utan kostnad, så hela
flödet går att provköra först.

### Higgsfield-kopplingen

En webbsida har varken MCP-klient eller Higgsfield-nycklar, så en knapp som
direkt anropar MCP går inte att bygga. Genereringslagret har därför tre
adaptrar mot samma jobbkö: lokal rendering, en lokal brygga
(`tools/motion-bridge.js`, kräver API-nyckel) och ett exporterat jobbmanifest
som Claude kör via Higgsfield MCP och importerar tillbaka.

## Tester

```
node tools/make-clips.js      # genererar testklipp + en musikfil med tydliga transienter
node tools/test-app.js        # hela användarscenariot, 44 kontroller
node tools/test-ui.js         # musinteraktioner: drag & drop, trim, ordning, kortkommandon
node tools/test-stab.js       # KRÄVER att skakningen faktiskt minskar i utbilden
node tools/make-photos.js     # syntetiska bostadsbilder med känd rumstyp
node tools/test-motion.js     # hela Motion-flödet: bilder → musik → regi → generering → editor
node tools/measure-stab.js <fil> [läge]   # mäter effekten per stabiliseringsläge
node tools/diag-stab.js <fil> # rå analysrapport för ett klipp
```

`test-app.js` kör hela kedjan: ladda upp två klipp → timeline → trimma →
ändra ordning → dela → hastighet → filter → stabiliseringsanalys →
före/efter → musik → uppspelning → spara → ladda om sidan → export av en
riktig videofil → ångra/gör om.

## Struktur

Modulerna är avsiktligt fristående och laddas i ordning. `build.js` slår ihop
dem till en fil; `index.html` laddar dem var för sig för utveckling.

```
src/00-utils.js        DOM, kontroller, toasts, modaler, drag-hjälp
src/10-model.js        datamodell + alla presets (filter, rörelse, övergångar, text)
src/20-store.js        projektstate, markering, ångra/gör om
src/30-persist.js      IndexedDB + autosave
src/40-media.js        import, metadata, thumbnails, filmstrip, ljudanalys
src/50-stab-analyze.js motion tracking + analysrapport
src/55-stab-process.js banutjämning, cropkompensation, cache
src/60-color.js        gradeberäkning, Auto Enhance, Match Clips
src/70-render.js       WebGL-kompositor + 2D-överlägg (text, watermark, guider)
src/75-playback.js     klocka, videopool, ljudgraf, komposition, övergångar
src/80-timeline.js     timeline-UI och alla draginteraktioner
src/85-panels.js       vänsterpaneler + inspektor
src/90-export.js       exportpipeline (utbytbar mot en backend-worker)
src/95-app.js          bootstrap, kommandon, kortkommandon, projekthantering
```

### Byta ut renderingen mot en backend

Hela exporten ligger i `Exporter.runExport()`. Byt den mot ett anrop till en
worker eller ett API så påverkas ingenting annat — projektmodellen,
stabiliseringsbanorna och gradevärdena är rena data och kan skickas som JSON.

## Kortkommandon

`Mellanslag` play/paus · `S` dela vid playhead · `Delete` ta bort ·
`Shift+Delete` ripple delete · `Ctrl+Z` / `Ctrl+Shift+Z` ångra/gör om ·
`←` / `→` en bildruta · `+` / `−` timeline-zoom · `Shift+Z` anpassa ·
`Ctrl+S` spara · `Ctrl+D` duplicera · `B` före/efter · `L` loopa klipp

## Kända begränsningar

* Exporten renderas i realtid — en två minuter lång film tar ungefär två
  minuter. Codec beror på webbläsaren (MP4/H.264 i Chrome, annars WebM).
* Analysen går inte snabbare än uppspelning, eftersom bildrutorna hämtas under
  uppspelning — och halveras hastigheten om webbläsaren tappar rutor. Ett 10
  sekunders klipp tar 10–20 sekunder att analysera.
* Reverse spelas stegvis (bildruteexakt sökning), inte som mjuk baklängesuppspelning.
* Icke-rigid wobble kan inte rätas ut av en global transform (se ovan).
