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

Det här är produktens kärna, så den är byggd som en riktig pipeline i fyra
utbytbara moduler:

1. **Analys** (`src/50-stab-analyze.js`) — klippet spelas upp och varje
   levererad bildruta blir en gråskalepyramid i tre nivåer. Harris-respons
   väljer spårpunkter där både vertikala och horisontella linjer möts, alltså
   dörrkarmar, fönsterhörn och väggmöten. Punkterna matchas grov-till-fint med
   SAD-blockmatchning och subpixelförfining, propageras mellan bildrutor och
   väljs om var femte ruta.
2. **Modell** — en robust affin transform anpassas per bildruta med IRLS och
   ridge-regularisering (utan ridge blir den integrerade banan en slumpvandring
   som ser ut som perspektivdrift). Transformen dekomponeras i sex kanaler:
   x, y, rotation, skala, shear och aspekt.
3. **Bearbetning** (`src/55-stab-process.js`) — varje kanal jämnas ut med ett
   gaussfilter vars bredd styrs av Smoothness. Skillnaden mot den råa banan är
   korrigeringen. Walking bob tas bort med ett bandstopp runt den uppmätta
   gångfrekvensen, rolling shutter med en shear proportionell mot horisontell
   hastighet, och motion preservation låter avsiktlig lågfrekvent rörelse vara.
   Nödvändig zoom räknas ut genom att testa vyns fyra hörn i varje bildruta.
4. **Rendering** (`src/70-render.js`) — korrigeringen appliceras som en
   homografi i GPU:n, samma transform i preview och i export.

**Det som inte går att beskriva med en global transform** — äkta icke-rigid
wobble, där väggar böljar i AI-genererade klipp — mäts (residual efter
anpassning + kvadrantvis divergens) och rapporteras som wobble-risk, och dämpas
med extra utjämning, shear-/aspektkorrigering och marginal. Den försvinner inte
helt; det kräver mesh-warp per pixel, vilket inte ryms i den här körmiljön.
Det står också i panelen, i klartext.

### Verifiering mot facit

`tools/make-clips.js` genererar tre testklipp med **känd** kamerarörelse.
Analysen ska hitta tillbaka till den:

| Klipp | Inlagd rörelse | Analysens svar |
|---|---|---|
| `walking-bob.webm` | 9 px vertikal bob @ 1,70 Hz | bob 1,6–1,8 Hz, amplitud 1,9 % → **Walking Bob Removal** |
| `handheld-pushin.webm` | små vibrationer + långsam push-in | skakning låg, wobble 0,03 → **Subtle** |
| `ai-wobble.webm` | 24 remsor som deformeras sinusformat | residual 0,31 px, divergens 0,39 px → **AI Wobble Repair** |

## Tester

```
node tools/make-clips.js      # genererar testklipp + en musikfil med tydliga transienter
node tools/test-app.js        # hela användarscenariot, 44 kontroller
node tools/test-ui.js         # musinteraktioner: drag & drop, trim, ordning, kortkommandon
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
  uppspelning. Sökbaserad sampling finns som fallback men är långsammare.
* Reverse spelas stegvis (bildruteexakt sökning), inte som mjuk baklängesuppspelning.
* Icke-rigid wobble dämpas, men tas inte bort helt (se ovan).
