# Viewly Furniture Library — Phase 1

Ett fristående assetpaket med möbler, mattor och planeringsobjekt avsedda
att läggas ovanpå interaktiva planritningar.

**Detta är Phase 1: femton kompletta modeller för visuell granskning.**
Ingen fullproduktion är påbörjad. Den visuella standarden ska godkännas
först.

---

## Hur biblioteket är gjort

Varje möbel är **en parametrisk 3D-mastermodell**. Katalogvyn och topvyn
är två kameror mot samma geometri.

```
        ONE MASTER DESIGN
                │
    ┌───────────┴───────────┐
    │                       │
3/4 PERSPECTIVE        90° ORTHOGRAPHIC
  catalog.webp            top.webp
    │                       │
masks/catalog/*.png    masks/top/*.png
```

Det är inte en stilistisk preferens utan ett krav i uppdraget: de två
vyerna måste visa exakt samma fysiska möbel, och topvyn måste vara sann
ortografisk projektion. Bildgenerering kan inte garantera någotdera —
två promptar ger två tolkningar, och en genererad "vy uppifrån" har
alltid perspektiv i sig. En mastermodell ger båda gratis, och dessutom
exakta materialmasker, eftersom masken är samma render med andra färger.

## Låst visuell standard

| | |
|---|---|
| Enhet | centimeter |
| Katalogkamera | perspektiv 85 mm, azimut 34°, elevation 21° |
| Katalogram | 1200 × 1200, objektet fyller 78 % av ramen |
| Topkamera | ortografisk, exakt 90° rakt ner, ingen lutning |
| Topskala | **6 px/cm genom hela biblioteket** |
| Toppadding | 6 cm transparent luft runt fotavtrycket |
| Ljus | tre mjuka areakällor plus golvstuds, skalade med objektets storlek |
| Skugga | skuggfångare — kontaktskugga i alfa, aldrig ett golv |
| Bakgrund | transparent i samtliga filer |
| Renderare | Cycles, path tracing, denoising |

Topskalan är låst för hela biblioteket. Två objekt kan därför läggas
bredvid varandra på samma planritning utan omräkning: en soffa på 224 cm
är alltid 1344 px bred i sitt fotavtryck.

## Mappstruktur

```
furniture-library/
├── catalog.json           index över biblioteket
├── qa-report.json         kontrollen i punkt 47, som mätdata
├── README.md
│
├── living-room/
│   ├── sofas/
│   │   └── sofa-scandinavian-001/
│   │       ├── catalog.webp
│   │       ├── top.webp
│   │       ├── metadata.json
│   │       └── masks/
│   │           ├── catalog/  fabric.png  wood.png
│   │           └── top/      fabric.png
│   └── armchairs/
├── dining/
├── bedroom/
├── rugs/
├── office/
├── outdoor/
└── contact-sheets/
```

## Två avsteg från specen, båda medvetna

**1 · Masker ligger per vy.** Specen visar `masks/fabric.png` direkt under
`topview.webp`. Problemet: en soffas träben är helt dolda rakt uppifrån,
så `wood.png` i topvyn blir en tom fil — vilket punkt 12 uttryckligen
förbjuder. Samtidigt måste träet gå att färga om, och det syns i
katalogvyn. Lösningen är `masks/catalog/` och `masks/top/`, med tomma
masker aldrig skrivna. Alternativen var en tom fil eller ett bibliotek
där trä inte går att färga om.

**2 · Måtten är mätta, inte skrivna.** `dimensions_cm` och `footprint_cm`
läses ur modellens verkliga omslutande volym efter rendering.
Designens avsedda mått står kvar som `design_intent_cm`, så avvikelser
går att se i stället för att döljas. Största avvikelse i Phase 1 står i
`qa-report.json`.

## Masker

En mask är samma render som bilden den hör till, med målmaterialet vitt
och allt annat svart. Därför kan den inte glida ur läge.

```
vit          ytan som materialet täcker
svart        andra material inom möbelns siluett
transparent  utanför möbeln
```

Att färga om beige tyg till oliv med masken påverkar inte träben,
skuggor, sömmar eller dagrar — de ligger kvar i grundbilden.

Materialgrupper: `fabric`, `pattern`, `wood`, `metal`, `stone`.
`pattern` finns bara på mattor och skiljer motivet från fältet.

## Fotavtryck

`top.webp` innehåller transparent padding och kontaktskugga. Ingetdera är
möbeln.

```
┌─────────────────────────────┐
│ transparent padding 6 cm    │
│    ┌───────────────────┐    │
│    │ ACTUAL FURNITURE  │    │
│    │ 224 × 95 cm       │    │
│    └───────────────────┘    │
└─────────────────────────────┘
```

`footprint_cm` är möbeln. `assets.top.footprint_px` är samma sak i pixlar.
`assets.top.padding_cm` säger hur mycket luft som ligger runt om.

## Vad som INTE ingår

Ingen webbapp, editor, databas, iframe, frontend, backend eller API.
Paketet är filer och metadata, och antar ingenting om vilken programvara
det senare läses in i.

## Originaldesign

Samtliga modeller är originalritade generiska möbler i ett eget
sammanhängande formspråk. Inga produktnamn, logotyper eller ikoniska
designer från något möbelvarumärke förekommer.
