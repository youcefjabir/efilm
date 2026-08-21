# Pipeline

Allt i biblioteket produceras härifrån. Ingen bild är handretuscherad och
ingen bild är genererad — varje fil kommer ur en modell.

```
lib/scene.py    låst visuell standard: kamera, ljus, film, skala
lib/cams.py     katalogkamera (perspektiv) och topkamera (ortografisk)
lib/mats.py     fem materialgrupper och paletten
lib/build.py    modelleringsverktyg: dynor, fasade lådor, koniska ben
lib/rug.py      mattfält, mönster och frans
lib/render.py   rendering och maskrendering
models/*.py     en fil per mastermodell
shoot.py        renderar en modell (för designloopen)
make.py         produktion: alla modeller, hela mappstrukturen, metadata
pack.py         catalog.json, kontaktark och qa-report.json
recolor.py      omfärgningsbevis med hjälp av maskerna
artifact.py     granskningssidan
```

## Köra

```
pip install bpy pillow
python3 make.py 96 80          # samples: katalog, top
python3 pack.py
```

`make.py` skriver om mappen för varje modell från grunden, så en omkörning
kan aldrig lämna kvar gamla filer.

## Regler som gäller alla modeller

**Inga sammanfallande ytor.** Två delar som möts skjuts in i varandra med
några millimeter. Delade ytterplan ger z-fighting och svarta fläckar.

**Liggande valsar behöver `zc=True`.** Annars förskjuts de med halva sin
längd i höjdled.

**Ljuskonstanterna i scene.py ändras aldrig per modell.** De är kalibrerade
en gång mot en vit referensyta och skalas med objektets storlek i kvadrat.

**Paletten är sRGB** och konverteras till linjärt i `mats.make`.
