/* =====================================================================
   INNEHÅLL — informationsarkitektur, kompositionsprimitiv, riktningar
   Alla rubriker och texter är förslag och riktning, inte låsta krav.
   ===================================================================== */

/* =====================================================================
   BIBLIOTEKET — fjorton kapitel

   Segmenteringen följer viewly.se, inte en tänkt gruppering. Varje tjänst
   på /tjanster får ett eget kapitel, plus Motion som har egen sida:

     Fotografering · 3D visning · E-styling · Atmosphere ·
     Drönarfotografering · Områdeskarta · Motion

   Apparna (Annonsskrivaren, Social / Ads Studio) är inte tjänster och
   ligger som egna kapitel efter dem. Kapitel 01 är index, 11–14 är
   kontext: systemet, beviset, människorna och bostadsägaren.

   Två tjänster levereras i KUNDENS varumärke — 3D-visningssidan och
   områdeskartan. Det står uttryckligen på båda sidorna och är därför
   ritat, inte påstått: primitivet whitelabel.

   Alla rubriker och texter är förslag och riktning, inte låsta krav.
   `need` markerar var biblioteket saknar bild — inte var designen brister.
   ===================================================================== */
var HL = [

 /* 01 — VIEWLY. Index och manifest. Här namnges tjänsterna en gång,
    därefter äger varje tjänst sitt eget kapitel. */
 {glyph:"vmark", id:"viewly", num:"01", name:"VIEWLY", label:"Viewly", cover:"hero",
  q:"Vad är Viewly?", why:"Manifestet och innehållsförteckningen. Sätter ramen: ett ekosystem, inte en tjänst.",
  st:[
   {p:"mark", m:"hero", k:"VIEWLY", h:"Bostadspresentation", s:"byggd för hur bostäder marknadsförs idag."},
   {p:"quiet", h:"Ett objekt är inte en fotografering.", em:"Det är en presentation.", k:"01 — Viewly"},
   {p:"system", k:"Tjänsterna", h:"Sju delar.", s:"Var och en står för sig. Tillsammans blir de en annons.",
    items:["Fotografering","3D visning","E-styling","Atmosphere","Drönarfotografering","Områdeskarta","Motion"]},
   {p:"editorial", m:"kitchen", k:"Grunden", h:"Foto är grunden.", s:"Resten bygger på den — och får annonsen att sticka ut på Hemnet."},
   {p:"fullbleed", m:"living", k:"", h:"", s:""},
   {p:"product", m:"portal", fy:.55, zoom:1.12, k:"Portalen", h:"Allt om bostaden på ett ställe.", s:"Boka, följ produktionen, hämta materialet.",
    need:"Vertikalt portalutsnitt 9:16 — nuvarande bild är beskuren desktop."},
   {p:"cta", h:"Upptäck Viewly", s:"viewly.se", k:"01 — Viewly"}
  ]},

 /* 02 — FOTOGRAFERING. Hantverket. Nästan ingen försäljning förrän
    omfattningen, som är den fråga mäklaren faktiskt ställer. */
 {glyph:"aperture", id:"foto", num:"02", name:"FOTOGRAFERING", label:"Fotografering", cover:"kitchen",
  q:"Hur ser kvaliteten ut?", why:"Basen i erbjudandet. Ren fotografi, sedan omfattning och pris — utan att låsa ett antal bilder.",
  st:[
   {p:"fullbleed", m:"hero", k:"02 — Fotografering", h:"Bostadsfotografering", s:""},
   {p:"quiet", h:"Ljus.", em:"Vi väntar in det.", s:"Vi lägger inte till det.", k:"02 — Fotografering"},
   {p:"fullbleed", m:"kitchen", k:"", h:"", s:""},
   {p:"editorial", m:"boucle", k:"Detalj", h:"Det som gör ett hus till ett hem.", s:"Textur, material, slitage, ljus."},
   {p:"system", k:"Omfattning", h:"Inget fast antal.", s:"Vi levererar alla bilder som tillför värde.",
    items:["Lägenhet — 15–35 bilder","Villa — 25–50 bilder","Leverans 1–3 dagar","Från 1 800 kr exkl. moms"]},
   {p:"fullbleed", m:"drone", k:"Exteriör", h:"", s:"",
    need:"Fullscreen premium-exteriör i blue hour, vertikalt 9:16."},
   {p:"cta", h:"Fotograferingen är början.", s:"Se hela ekosystemet", k:"02 — Fotografering"}
  ]},

 /* 03 — 3D VISNING. Egen tjänst, egen sida, eget kapitel.
    Levereras på en visningssida i KUNDENS varumärke — story 04. */
 {glyph:"cube", id:"visning", num:"03", name:"3D VISNING", label:"3D visning", cover:"matterport",
  q:"Vad kan jag skapa?", why:"Interaktiv visning som eget kapitel. White label-löftet visas i stället för att påstås.",
  st:[
   {p:"mark", m:"matterport", k:"3D VISNING", h:"Visning dygnet runt", s:"En upplevelse som stannar kvar efter att annonsen är stängd."},
   {p:"quiet", h:"Låt spekulanten kliva in.", em:"När som helst.", k:"03 — 3D visning"},
   {p:"product", m:"threed", k:"I visningen", h:"Dollhouse och planritning.", s:"Inbyggt mätverktyg och guidade rundturspunkter leder blicken genom bostaden."},
   {p:"whitelabel", m:"matterport", k:"Er logga, era färger", h:"Levereras i ert varumärke.",
    s:"Kontoret sätter logotyp, färger, typografi och knappstil en gång. Därefter skapas varje ny visningssida automatiskt i rätt uttryck.",
    brands:[["Kontor A","#8A5A1A","Starta visning"],["Kontor B","#3D5A7A","Visa bostaden"]]},
   {p:"system", k:"Så går det till", h:"Tre steg.", s:"1–3 arbetsdagar från skanning till publicerad länk.",
    items:["Boka skanning","Matterport-produktion","Länk klar att publicera"]},
   {p:"editorial", m:"threedcam", k:"Räckvidd", h:"Fungerar där annonsen finns.", s:"Hemnet, Booli, Hitta Hem, mäklarsystem och egna hemsidor."},
   {p:"cta", h:"Visningen tar aldrig slut.", s:"3D visning", k:"03 — 3D visning"}
  ]},

 /* 04 — E-STYLING. Egen tjänst. Profilens starkaste visuella bevis:
    två före/efter-par i rad, sedan transparenskravet. */
 {glyph:"halves", id:"estyling", num:"04", name:"E-STYLING", label:"E-styling", cover:"esLivAft",
  q:"Varför är Viewly annorlunda?", why:"Digital inredning som eget kapitel. Nästan ordlöst — bevisen bär.",
  st:[
   {p:"fullbleed", m:"esLivAft", k:"04 — E-styling", h:"Starkare presentation", s:""},
   {p:"quiet", h:"Vi skapar liv i tomma rum.", em:"Utan att flytta en vägg.", k:"04 — E-styling"},
   {p:"split", m:["esLivBef","esLivAft"], la:"Före", lb:"Efter", k:"E-styling", h:"Vardagsrum"},
   {p:"split", m:["esBedBef","esBedAft"], la:"Före", lb:"Efter", k:"E-styling", h:"Sovrum"},
   {p:"system", k:"Så går det till", h:"Tre steg.", s:"Digital inredning anpassad efter svensk bostadsmarknad.",
    items:["Ladda upp bilderna","Välj stil och paket","Annonsklart på 1–3 dagar"]},
   {p:"editorial", m:"hero", k:"Transparens", h:"Både original och e-stylat.", s:"Alla e-stylade bilder är tydligt märkta, så att marknadsföringen följer kraven på transparens."},
   {p:"cta", h:"Bostadens fulla potential.", s:"Alltid ärligt mot rummet.", k:"04 — E-styling"}
  ]},

 /* 05 — ATMOSPHERE. Egen tjänst. Tre effekter: skymning, blå himmel,
    sommar. Bara den tredje saknar bildpar i biblioteket. */
 {glyph:"sun", id:"atmosphere", num:"05", name:"ATMOSPHERE", label:"Atmosphere", cover:"skyAft",
  q:"Varför är Viewly annorlunda?", why:"Ljus, väder och årstid som eget kapitel. Håller isär vad som ändras och vad som aldrig rörs.",
  st:[
   {p:"mark", m:"skyAft", k:"ATMOSPHERE", h:"Rätt förutsättningar", s:"Ge bostaden rätt förutsättningar att göra intryck."},
   {p:"quiet", h:"Bostaden fotograferas ofta när förutsättningarna är som sämst.", em:"Vädret får inte bestämma.", k:"05 — Atmosphere"},
   {p:"split", m:["skyBef","skyAft"], la:"Dag", lb:"Skymning", k:"Effekt 01", h:"Skymning"},
   {p:"split", m:["vadBef","vadAft"], la:"Grått", lb:"Blå himmel", k:"Effekt 02", h:"Blå himmel"},
   {p:"editorial", m:"drone", k:"Effekt 03", h:"Sommar.", s:"Trädgården som ännu inte blommat fram — grön, i juni.",
    need:"Före/efter-par för sommareffekten saknas. Behövs: samma tomt grå respektive grönskande."},
   {p:"quiet", h:"Inga möbler flyttas.", em:"Bara ljus, väder och årstid.", s:"Annonsklara bilder inom 1–3 arbetsdagar.", k:"05 — Atmosphere"},
   {p:"cta", h:"Ge annonsen wow-faktorn.", s:"Atmosphere", k:"05 — Atmosphere"}
  ]},

 /* 06 — DRÖNARFOTOGRAFERING. Egen tjänst. Läget, inte bostaden. */
 {glyph:"drone", id:"dronare", num:"06", name:"DRÖNARE", label:"Drönarfotografering", cover:"drone",
  q:"Vad kan jag skapa?", why:"Flygbilder som eget kapitel. Säljer perspektivet — inte utrustningen.",
  st:[
   {p:"fullbleed", m:"drone", k:"06 — Drönarfotografering", h:"Upplev från luften", s:""},
   {p:"quiet", h:"Marken visar bostaden.", em:"Luften visar läget.", k:"06 — Drönare"},
   {p:"editorial", m:"drone", k:"Vad bilderna visar", h:"Läge, tomt och omgivning.", s:"Ett perspektiv marken inte kan ge.",
    need:"Flygbild rakt över tomten — nuvarande bild är en snedbild från låg höjd."},
   {p:"system", k:"Leverans", h:"Bilder och klipp.", s:"Efterbearbetade och klara att publicera.",
    items:["Flygbilder för Hemnet","Korta klipp för sociala","Flygning enligt regelverk","Leverans 1–3 dagar"]},
   {p:"fullbleed", m:"hero", k:"", h:"", s:"",
    need:"Flygbild i blue hour — helheten med bostaden i sitt kvarter."},
   {p:"cta", h:"Boka flygning", s:"Drönarfotografering", k:"06 — Drönare"}
  ]},

 /* 07 — OMRÅDESKARTA. Egen tjänst. Levereras i KUNDENS varumärke —
    story 04. Ingen faktisk karta finns i biblioteket ännu: varje
    bildslot i kapitlet är därför markerad med need. */
 {glyph:"map", id:"omradeskarta", num:"07", name:"OMRÅDESKARTA", label:"Områdeskarta", cover:"drone",
  q:"Vad kan jag skapa?", why:"Kartan som eget kapitel. Andra tjänsten som levereras i kontorets grafiska profil.",
  st:[
   {p:"mark", m:"drone", k:"OMRÅDESKARTA", h:"Läget", s:"Läget, servicen och sammanhanget.",
    need:"Ingen områdeskarta finns i biblioteket. Behövs: renderad karta 9:16."},
   {p:"quiet", h:"Köparen väljer inte bara bostad.", em:"Hen väljer läge.", k:"07 — Områdeskarta"},
   {p:"product", m:"drone", k:"Kartan", h:"En stiliserad karta.", s:"Kommunikationer, skolor, service och natur — markerade runt bostaden.",
    need:"Produktbild: faktisk områdeskarta i 9:16."},
   {p:"whitelabel", m:"drone", k:"Levereras i ert varumärke", h:"Ert formspråk, varje objekt.",
    s:"Färger, typsnitt och format anpassas efter kontorets grafiska profil. Samma formspråk på varje objekt gör kontorets annonser igenkännbara.",
    brands:[["Kontor A","#8A5A1A","Se området"],["Kontor B","#3D5A7A","Se området"]],
    need:"Korten ska visa två faktiska kartor, en i vardera kontors färger."},
   {p:"editorial", m:"hero", k:"Leverans", h:"Högupplöst PNG.", s:"Inom 1–2 arbetsdagar. Ett elegant komplement till bostadsannonsen.",
    need:"Kartan i användning — i prospekt eller Hemnet-annons."},
   {p:"cta", h:"Placera bostaden i sitt sammanhang.", s:"Områdeskarta", k:"07 — Områdeskarta"}
  ]},

 /* 08 — MOTION. Egen sida på viewly.se, eget kapitel här.
    Poängen är att ingen extra filmning sker — det måste ramas tydligt. */
 {glyph:"motion", id:"motion", num:"08", name:"MOTION", label:"Motion", cover:"dining",
  q:"Vad kan jag skapa?", why:"Bostadsfilm byggd av fotograferingen. Säljer resultatet — aldrig tekniken bakom.",
  st:[
   {p:"mark", m:"dining", k:"MOTION", h:"Bostadsfilm", s:"utan en separat filmning.",
    need:"Nyckelbildruta ur faktisk Motion-film."},
   {p:"quiet", h:"Bilderna finns redan.", em:"Filmen är nästa steg.", k:"08 — Motion"},
   {p:"split", m:["living","dining"], la:"Stillbild", lb:"Rörligt", k:"Samma material", h:"Ny puls",
    need:"Motion-frame som B-sida, inte en andra stillbild."},
   {p:"system", k:"Så byggs filmen", h:"Fyra steg.", s:"Naturliga kamerarörelser, genomtänkt klippning och musik som lyfter helheten.",
    items:["Bilderna","Rörelsen","Redigeringen","Filmen"]},
   {p:"matrix", m:"dining2", k:"Format", h:"En film, tre format.",
    fmts:[["9:16","Story",9,16],["1:1","Kvadrat",1,1],["4:5","Inlägg",4,5]],
    s:"Samma klipp genom hela kanalen.",
    need:"Faktisk motion-frame med synlig rörelseoskärpa."},
   {p:"quiet", h:"Kostar ingen extra fotografering.", em:"Syns i flödet.", s:"Ger bostaden sammanhang.", k:"08 — Motion"},
   {p:"cta", h:"Låt bostaden ta plats i rörelse.", s:"Beställ Motion", k:"08 — Motion"}
  ]},

 /* 09 — ANNONSSKRIVAREN. App, inte tjänst. Eget kapitel: texten.
    Copy hämtad ur viewly.se/annonsskrivaren. */
 {glyph:"lines", id:"annonsen", num:"09", name:"ANNONSEN", label:"Annonsen", cover:"kitchen",
  q:"Vem skriver texten?",
  why:"Annonsskrivaren som eget kapitel. Säljer utfallet — en färdig text — aldrig AI:n bakom.",
  st:[
   {p:"mark", m:"kitchen", k:"ANNONSSKRIVAREN", h:"Annonsen", s:"skriven på trettio sekunder."},
   {p:"quiet", h:"Färdig bostadsannons", em:"på 30 sekunder.", s:"Fyll i bostaden. Ladda upp bilderna.", k:"09 — Annonsen"},
   {p:"flow", k:"Annonsskrivaren", h:"Från sex bilder till färdig text.",
    inp:{lab:"Du laddar upp", ims:["hero","kitchen","living","dining","boucle","eames"]},
    mid:{lab:"AI:n läser bilderna", items:["Ljusinsläpp","Takhöjd och volym","Material och ytskikt","Planlösning","Utsikt och läge","Områdets karaktär"]},
    out:{lab:"Färdig annons — exempel", tones:["Saklig","Varm","Exklusiv"], now:1,
         title:"Ljuset som gör skillnad",
         lead:"Fyra rum med genomgående planlösning och eftermiddagssol rakt in i vardagsrummet.",
         lines:[97,100,88,64]}},
   {p:"system", k:"Tonläge", h:"Tre röster.", s:"Samma bostad, olika tilltal. Två omskrivningar ingår.",
    items:["Saklig — fakta först","Varm — känslan först","Exklusiv — sparsmakat"]},
   {p:"editorial", m:"portal", fy:.52, zoom:1.06, k:"Din text", h:"Utkastet är ditt att ändra.",
    s:"Ingenting publiceras automatiskt. Du redigerar, kortar och godkänner.",
    need:"Produktbild Annonsskrivaren 9:16: redigeringsvyn med tonlägesval."},
   {p:"cta", h:"Objektbeskrivningen", s:"är inte längre en flaskhals.", k:"09 — Annonsen"}
  ]},

 /* 10 — SOCIAL / ADS STUDIO. App, inte tjänst. Formaten och kampanjen —
    det som händer efter att texten är skriven. */
 {glyph:"formats", id:"kampanjen", num:"10", name:"KAMPANJEN", label:"Kampanjen", cover:"portal", coverFy:.55,
  q:"Hur når objektet ut?",
  why:"Social / Ads Studio som eget kapitel. Mallarna, formaten och kampanjfaserna.",
  st:[
   {p:"mark", m:"hero", k:"SOCIAL / ADS STUDIO", h:"Ett objekt", s:"En komplett kampanj."},
   {p:"editorial", m:"portal", fy:.52, zoom:1.06, k:"Mallbiblioteket", h:"Kontorets egna mallar.",
    s:"Obegränsat antal, i valfritt format. Designen är satt — innehållet fylls i åt dig.",
    need:"Skärmbild ur Social / Ads Studio: mallbiblioteket."},
   {p:"matrix", m:"hero", k:"Format", h:"Ett objekt, alla format.",
    fmts:[["4:5","Inlägg",4,5],["1:1","Kvadrat",1,1],["9:16","Story",9,16]],
    s:"Samma mall exporterar samtliga. Instagram, Facebook och LinkedIn."},
   {p:"phases", k:"Kampanjfaser", h:"Fyra mallar. En kampanj.", now:1,
    items:["p1","p2","p3","p4"],
    s:"Statusen är inte en etikett — den bestämmer hela kompositionen."},
   {p:"quiet", h:"Under en minut.", em:"När mallarna är satta.", s:"Ladda ner som JPG, PNG eller PDF — eller hela serien som zip.", k:"10 — Kampanjen"},
   {p:"cta", h:"Ett objekt.", s:"Hela kampanjen.", k:"10 — Kampanjen"}
  ]},

 /* 11 — SYSTEMET. Portalen som håller ihop de sju tjänsterna. */
 {glyph:"spine", id:"systemet", num:"11", name:"SYSTEMET", label:"Systemet", cover:"portal", coverFy:.55,
  q:"Hur fungerar det?", why:"Den kommersiellt viktigaste. Talar direkt till mäklaren.",
  st:[
   {p:"quiet", h:"Mer tid för affären.", em:"Mindre tid i mappar.", k:"11 — Systemet"},
   {p:"product", m:"portal", fy:.55, zoom:1.12, k:"Mäklarportalen", h:"Ett ställe för hela bostaden.", s:"Boka, följ, hämta, publicera.",
    need:"Vertikala portalskärmar 9:16."},
   {p:"system", k:"Flödet", h:"Fyra steg.", s:"Från bokning till publicerad kampanj.",
    items:["Boka","Produktion","Leverans","Publicera"]},
   {p:"editorial", m:"hero", k:"Skillnaden", h:"Inte en mapp med filer.", s:"En färdig presentation, redo att publiceras."},
   {p:"product", m:"portal", fy:.6, zoom:1.12, k:"Samlat", h:"En faktura. Ett konto.", s:"Beställning, mallar, material och fakturering på samma ställe.",
    need:"Vertikal portalvy 9:16: faktureringsöversikt."},
   {p:"cta", h:"Ett ställe.", s:"Hela produktionen.", k:"11 — Systemet"}
  ]},

 /* 12 — OBJEKT. Beviset: tjänsterna samlade på ett enda objekt. */
 {glyph:"gable", id:"objekt", num:"12", name:"OBJEKT", label:"Objekt", cover:"eames",
  q:"Kan jag lita på dem?", why:"Beviset. Varje case är en liten redaktionell feature. Skalar utan omdesign.",
  st:[
   {p:"case", m:"drone", k:"Objekt 01", h:"Silvergården 9A", s:"Landskrona",
    need:"Verklig exteriör för caset."},
   {p:"fullbleed", m:"living", k:"", h:"", s:"", need:"Interiör från samma objekt."},
   {p:"editorial", m:"eames", k:"Detalj", h:"", s:"", need:"Detalj från samma objekt."},
   {p:"product", m:"threed", k:"3D", h:"Planlösningen.", s:"", need:"3D-vy från samma objekt."},
   {p:"fullbleed", m:"dining2", k:"Rörelse", h:"", s:"", need:"Motion-frame från samma objekt."},
   {p:"cta", h:"Ett objekt.", s:"Hela presentationen.", k:"12 — Objekt"}
  ]},

 /* 13 — INIFRÅN. Om oss + fotografer. */
 {glyph:"people", id:"inifran", num:"13", name:"INIFRÅN", label:"Inifrån", cover:"om3",
  q:"Vilka är ni?", why:"Om oss + fotografer sammanslagna. Rekrytering blir en följd av varumärket, inte en jobbannons.",
  st:[
   {p:"mark", m:"om1", k:"INIFRÅN", h:"Människorna", s:"bakom presentationen."},
   {p:"quiet", h:"Vi bygger inte för hur bostäder presenterades igår.", k:"13 — Inifrån"},
   {p:"editorial", m:"om3", k:"Så arbetar vi", h:"Hantverk och teknik.", s:"Ingen av delarna räcker ensam."},
   {p:"fullbleed", m:"om4", k:"", h:"", s:""},
   {p:"editorial", m:"kontakt", k:"Fotograferna", h:"Fotografen är inte en underleverantör.", s:"Fotografen är Viewly.",
    need:"Reportagebild: fotograf i arbete på plats."},
   {p:"quiet", h:"Din blick. Ditt hantverk.", em:"Vår organisation.", k:"13 — Inifrån"},
   {p:"cta", h:"Fotografera med Viewly", s:"viewly.se/fotografer", k:"13 — Inifrån"}
  ]},

 /* 14 — DITT HEM. Sekundär målgrupp. Medvetet kort. */
 {glyph:"door", id:"ditthem", num:"14", name:"DITT HEM", label:"Ditt hem", cover:"dining",
  q:"Hur börjar jag?", why:"Sekundär målgrupp. Medvetet kort — svarar på en enda fråga.",
  st:[
   {p:"fullbleed", m:"dining", k:"14 — Ditt hem", h:"", s:""},
   {p:"quiet", h:"Ditt hem säljs en gång.", em:"Presentationen betyder något.", k:"14 — Ditt hem"},
   {p:"fullbleed", m:"living", k:"", h:"", s:""},
   {p:"editorial", m:"hero", k:"Vad Viewly tillför", h:"Foto, rum och rörelse i en presentation.", s:"Din mäklare beställer. Vi producerar."},
   {p:"cta", h:"Arbetar din mäklare med Viewly?", s:"Gör bostadstestet", k:"14 — Ditt hem"}
  ]}
];

/* =====================================================================
   FÖRSLAG B OCH C

   Varje bildruta finns i tre utföranden. A är originalet nedan i HL; B och
   C ligger här som PATCHAR ovanpå det. En patch byter komposition (`p`) och
   omformulerar budskapet — den ändrar aldrig originaldatan, och egna
   redigeringar läggs alltid ovanpå det valda förslaget.

   Principen bakom paren:

     B  samma budskap, annan komposition. Vill man ha samma sak sagd men
        med en annan bildyta väljer man B.
     C  annan ingång till samma sak — oftast kortare och mer konkret, ibland
        en faktaram i stället för en känsla.

   Byter en patch primitiv måste den bära med sig det primitivet ritar:
   `split` behöver två bilder och två etiketter, `system` behöver poster,
   `matrix` format. Därför ser vissa patchar längre ut än andra.

   All copy är hämtad ur eller förenlig med respektive sida på viewly.se.
   Förslag och riktning, inte låsta krav.
   ===================================================================== */
/* ALTS deklareras i draw.js; här fylls den. */
ALTS = {

/* ---------- 01 VIEWLY ---------- */
"viewly-0":[
 {p:"fullbleed", m:"hero", k:"Viewly", h:"Bostadspresentation"},
 {p:"quiet", k:"01 — Viewly", h:"Vi levererar inte bilder.", em:"Vi levererar presentationen.",
  s:"Foto, rum, rörelse och annonsmaterial i en och samma produktion."}],
"viewly-1":[
 {p:"editorial", m:"hero", k:"Utgångspunkten", h:"Ett objekt är inte en fotografering.",
  s:"Det är en presentation — och den avgör hur bostaden möts på Hemnet."},
 {p:"mark", m:"living", k:"VIEWLY", h:"En presentation", s:"inte en mapp med filer."}],
"viewly-2":[
 {p:"quiet", k:"Tjänsterna", h:"Sju delar. Ett flöde.", em:"Var och en står för sig.",
  s:"Fotografering · 3D visning · E-styling · Atmosphere · Drönarfotografering · Områdeskarta · Motion"},
 {p:"system", k:"Vad ingår", h:"Välj det bostaden behöver.", s:"Inget är obligatoriskt. Delarna fungerar var för sig och tillsammans.",
  items:["Fotografering","3D visning","E-styling","Atmosphere","Drönarfotografering","Områdeskarta","Motion"]}],
"viewly-3":[
 {p:"quiet", k:"01 — Viewly", h:"Foto är grunden.", em:"Resten bygger på den.",
  s:"3D, e-styling och atmosfär är det som får annonsen att sticka ut."},
 {p:"split", m:["kitchen","esLivAft"], la:"Bara foto", lb:"Foto och tillägg", k:"Grunden", h:"Skillnaden"}],
"viewly-4":[
 {p:"editorial", m:"living", k:"Hantverket", h:"Varje rum fotograferas för sitt bästa läge.",
  s:"Inte för att bocka av en lista."},
 {p:"fullbleed", m:"dining", k:"", h:""}],
"viewly-5":[
 {p:"editorial", m:"portal", k:"Portalen", h:"Allt om bostaden på ett ställe.",
  s:"Boka, följ produktionen, hämta materialet — utan mejltrådar."},
 {p:"system", k:"Portalen", h:"Fyra steg.", s:"Från bokning till publicerad kampanj.",
  items:["Boka","Produktion","Leverans","Publicera"]}],
"viewly-6":[
 {p:"cta", k:"01 — Viewly", h:"Se vad bostaden kan bli", s:"viewly.se"},
 {p:"mark", m:"hero", k:"VIEWLY", h:"viewly.se", s:"Bostadspresentation, samlad."}],

/* ---------- 02 FOTOGRAFERING ---------- */
"foto-0":[
 {p:"mark", m:"hero", k:"FOTOGRAFERING", h:"Bostadsfotografering", s:"Genomtänkta fotopaket, anpassade efter bostaden."},
 {p:"editorial", m:"hero", k:"02 — Fotografering", h:"Foto är grunden.",
  s:"Allt annat vi gör bygger på bilderna från den här dagen."}],
"foto-1":[
 {p:"editorial", m:"kitchen", k:"Ljuset", h:"Vi väntar in det.", s:"Vi lägger inte till det. Rätt timme gör mer för ett rum än någon efterbearbetning."},
 {p:"split", m:["kitchen","hero"], la:"Fel timme", lb:"Rätt timme", k:"Ljuset", h:"Timing"}],
"foto-2":[
 {p:"editorial", m:"kitchen", k:"Rymd", h:"Ett rum ska kännas.", s:"Inte mätas. Perspektivet ska visa hur bostaden används, inte hur stor den är på pappret."},
 {p:"quiet", k:"02 — Fotografering", h:"Rymd.", em:"Ett rum ska kännas.", s:"Inte mätas."}],
"foto-3":[
 {p:"fullbleed", m:"boucle", k:"Detalj", h:"Det som gör ett hus till ett hem"},
 {p:"split", m:["boucle","eames"], la:"Textur", lb:"Form", k:"Detalj", h:"Närbilderna"}],
"foto-4":[
 {p:"quiet", k:"Omfattning", h:"Inget fast antal.", em:"Alla bilder som tillför värde.",
  s:"Lägenhet 15–35 bilder, villa 25–50. Leverans 1–3 dagar. Från 1 800 kr exkl. moms."},
 {p:"system", k:"Vad du får", h:"Fyra löften.", s:"Samma för varje objekt, oavsett storlek.",
  items:["Alla bilder som tillför värde","Leverans 1–3 arbetsdagar","Bilder klara för Hemnet","Från 1 800 kr exkl. moms"]}],
"foto-5":[
 {p:"editorial", m:"drone", k:"Exteriör", h:"Bostaden i sitt sammanhang.", s:"Fasad, tomt och läge — fotograferat när ljuset gör dem rättvisa."},
 {p:"case", m:"drone", k:"Exteriör", h:"Fasaden", s:"Blue hour"}],
"foto-6":[
 {p:"cta", k:"02 — Fotografering", h:"Boka fotografering", s:"Från 1 800 kr exkl. moms"},
 {p:"quiet", k:"02 — Fotografering", h:"Fotograferingen är början.", em:"Inte leveransen.",
  s:"Se hela ekosystemet på viewly.se"}],

/* ---------- 03 3D VISNING ---------- */
"visning-0":[
 {p:"fullbleed", m:"matterport", k:"03 — 3D visning", h:"Visning dygnet runt"},
 {p:"quiet", k:"3D VISNING", h:"Annonsen stänger.", em:"Visningen gör det inte.",
  s:"En upplevelse som stannar kvar efter att annonsen är borta."}],
"visning-1":[
 {p:"editorial", m:"matterport", k:"Tillgänglighet", h:"Låt spekulanten kliva in.",
  s:"När som helst, var som helst, hur många gånger som helst."},
 {p:"system", k:"Vad det ger", h:"Fyra siffror.", s:"Från våra egna visningssidor.",
  items:["99 % vill ha 3D i annonsen","90 % väljer bostad med 3D först","32 % snabbare försäljning","9 % högre slutpris"]}],
"visning-2":[
 {p:"editorial", m:"threed", k:"I visningen", h:"Dollhouse och planritning.",
  s:"Inbyggt mätverktyg och guidade rundturspunkter leder blicken genom bostaden."},
 {p:"system", k:"Inbyggt", h:"Fyra verktyg.", s:"Ingen app, ingen inloggning.",
  items:["Dollhouse-vy","Planritning","Mätverktyg","Guidade rundturspunkter"]}],
"visning-3":[
 {p:"whitelabel", m:"matterport", k:"White label", h:"Er logga. Era färger.",
  s:"Kontoret sätter uttrycket en gång. Varje ny visningssida byggs automatiskt i det.",
  brands:[["Nordvik","#1F3A2E","Se bostaden"],["Alvhem","#7A3B2E","Boka visning"]]},
 {p:"whitelabel", m:"threedcam", k:"Levereras i ert varumärke", h:"Aldrig i vårt.",
  s:"Logotyp, färger, typografi och knappstil är kontorets. Viewly syns inte på sidan.",
  brands:[["Kontor A","#8A5A1A","Starta visning"],["Kontor B","#3D5A7A","Visa bostaden"]]}],
"visning-4":[
 {p:"quiet", k:"Så går det till", h:"Skanning på plats.", em:"Länk inom 1–3 dagar.",
  s:"Boka skanning · Matterport-produktion · Länk klar att publicera"},
 {p:"product", m:"threedcam", k:"Så går det till", h:"Vi skannar. Ni publicerar.",
  s:"1–3 arbetsdagar från skanning till färdig länk."}],
"visning-5":[
 {p:"system", k:"Räckvidd", h:"Fungerar där annonsen finns.", s:"En länk, alla kanaler.",
  items:["Hemnet","Booli","Hitta Hem","Mäklarsystem och egen hemsida"]},
 {p:"quiet", k:"03 — 3D visning", h:"En länk.", em:"Alla kanaler.",
  s:"Hemnet, Booli, Hitta Hem, mäklarsystem och egna hemsidor."}],
"visning-6":[
 {p:"cta", k:"03 — 3D visning", h:"Boka skanning", s:"Länk klar inom 1–3 dagar"},
 {p:"mark", m:"matterport", k:"3D VISNING", h:"Öppet dygnet runt", s:"viewly.se/3d-visning"}],

/* ---------- 04 E-STYLING ---------- */
"estyling-0":[
 {p:"mark", m:"esLivAft", k:"E-STYLING", h:"Starkare presentation", s:"Tydligare bostad."},
 {p:"split", m:["esLivBef","esLivAft"], la:"Tomt", lb:"Möblerat", k:"04 — E-styling", h:"Digital inredning"}],
"estyling-1":[
 {p:"editorial", m:"esBedAft", k:"Poängen", h:"Vi skapar liv i tomma rum.",
  s:"Ett tomt rum är svårt att läsa. Möblerat blir det en bostad att föreställa sig i."},
 {p:"system", k:"Vad det ger", h:"Fyra siffror.", s:"Från e-stylade objekt.",
  items:["83 % lättare att föreställa sig hemmet","60 % fler visningsbokningar","48 % kortare tid till affär","20 % höjde buden"]}],
"estyling-2":[
 {p:"split", m:["esLivBef","esLivAft"], la:"Original", lb:"E-stylat", k:"Vardagsrum", h:"Samma rum"},
 {p:"fullbleed", m:"esLivAft", k:"Vardagsrum", h:"E-stylat"}],
"estyling-3":[
 {p:"split", m:["esBedBef","esBedAft"], la:"Original", lb:"E-stylat", k:"Sovrum", h:"Samma rum"},
 {p:"editorial", m:"esBedAft", k:"Sovrum", h:"Möblerat för svensk marknad.",
  s:"Stilen väljs efter bostaden och köparen — inte efter en katalog."}],
"estyling-4":[
 {p:"quiet", k:"Så går det till", h:"Ladda upp bilderna.", em:"Annonsklart på 1–3 dagar.",
  s:"Välj stil och paket. Vi gör resten."},
 {p:"product", m:"esLivAft", k:"Så går det till", h:"Tre steg.", s:"Ladda upp · välj stil och paket · annonsklart på 1–3 dagar."}],
"estyling-5":[
 {p:"quiet", k:"Transparens", h:"Både original och e-stylat.", em:"Alltid båda.",
  s:"Alla e-stylade bilder är tydligt märkta, så att marknadsföringen följer kraven på transparens."},
 {p:"system", k:"Villkoren", h:"Tre löften.", s:"Så att ingen behöver fråga.",
  items:["Du får både original och e-stylat","Alla e-stylade bilder är märkta","Omgjort inom 24 timmar utan kostnad"]}],
"estyling-6":[
 {p:"cta", k:"04 — E-styling", h:"Ladda upp bilderna", s:"Annonsklart på 1–3 dagar"},
 {p:"quiet", k:"04 — E-styling", h:"Bostadens fulla potential.", em:"Alltid ärligt mot rummet.",
  s:"Vi möblerar. Vi flyttar inga väggar."}],

/* ---------- 05 ATMOSPHERE ---------- */
"atmosphere-0":[
 {p:"fullbleed", m:"skyAft", k:"05 — Atmosphere", h:"Ge annonsen wow-faktorn"},
 {p:"quiet", k:"ATMOSPHERE", h:"Vädret bestämde.", em:"Nu gör det inte det.",
  s:"Ljus, väder och årstid — justerat efter hur bostaden faktiskt ser ut när den är som bäst."}],
"atmosphere-1":[
 {p:"editorial", m:"vadBef", k:"Problemet", h:"Grå himmel. Skarpa skuggor.",
  s:"Många bostäder fotograferas när förutsättningarna är som sämst — och annonsen ligger uppe i månader."},
 {p:"split", m:["vadBef","vadAft"], la:"Som det var", lb:"Som det kan vara", k:"05 — Atmosphere", h:"Samma dag"}],
"atmosphere-2":[
 {p:"split", m:["skyBef","skyAft"], la:"Eftermiddag", lb:"Skymning", k:"Effekt 01", h:"Skymning"},
 {p:"fullbleed", m:"skyAft", k:"Effekt 01 — Skymning", h:""}],
"atmosphere-3":[
 {p:"split", m:["vadBef","vadAft"], la:"Mulet", lb:"Klart", k:"Effekt 02", h:"Blå himmel"},
 {p:"editorial", m:"vadAft", k:"Effekt 02", h:"Blå himmel.", s:"Himlen byts, inte huset. Fasad, tomt och skuggor följer med i rätt riktning."}],
"atmosphere-4":[
 {p:"quiet", k:"Effekt 03", h:"Sommar.", em:"Trädgården som ännu inte blommat fram.",
  s:"Grön, i juni — även när bilderna togs i mars.",
  need:"Före/efter-par för sommareffekten saknas. Behövs: samma tomt grå respektive grönskande."},
 {p:"system", k:"Effekterna", h:"Tre lägen.", s:"Väljs per bild, inte per objekt.",
  items:["Skymning","Blå himmel","Sommar"]}],
"atmosphere-5":[
 {p:"editorial", m:"skyAft", k:"Gränsen", h:"Inga möbler flyttas.",
  s:"Vi ändrar ljus, väder och årstid. Ingenting annat. Annonsklara bilder inom 1–3 arbetsdagar."},
 {p:"system", k:"Gränsen", h:"Vad vi rör.", s:"Och vad vi aldrig rör.",
  items:["Ljus — ja","Väder — ja","Årstid — ja","Möbler och objekt — aldrig"]}],
"atmosphere-6":[
 {p:"cta", k:"05 — Atmosphere", h:"Rätt förutsättningar", s:"Annonsklart inom 1–3 dagar"},
 {p:"mark", m:"skyAft", k:"ATMOSPHERE", h:"Wow-faktorn", s:"viewly.se/atmosphere"}],

/* ---------- 06 DRÖNARE ---------- */
"dronare-0":[
 {p:"mark", m:"drone", k:"DRÖNARFOTOGRAFERING", h:"Upplev från luften", s:"Perspektivet som visar mer än bostaden."},
 {p:"editorial", m:"drone", k:"06 — Drönare", h:"Läget syns inte från marken.",
  s:"Luftbilder visar tomt, omgivning och avstånd på ett sätt en fasadbild aldrig kan."}],
"dronare-1":[
 {p:"editorial", m:"drone", k:"Perspektivet", h:"Marken visar bostaden. Luften visar läget.",
  s:"Tomtens storlek, grannskapet, vattnet bakom huset — sådant som avgör men sällan syns."},
 {p:"case", m:"drone", k:"Från luften", h:"Läget", s:"Tomt, omgivning, helhet"}],
"dronare-2":[
 {p:"fullbleed", m:"drone", k:"Vad bilderna visar", h:"Läge, tomt och omgivning"},
 {p:"quiet", k:"06 — Drönare", h:"Ett perspektiv marken inte kan ge.", em:"Läget, tomten, helheten.",
  s:"Efterbearbetade flygbilder och korta klipp."}],
"dronare-3":[
 {p:"quiet", k:"Leverans", h:"Bilder och klipp.", em:"Klara att publicera.",
  s:"Flygbilder för Hemnet och prospekt, korta klipp för sociala medier. Flygning enligt gällande regler. 1–3 dagar."},
 {p:"system", k:"Leverans", h:"Vad du får.", s:"Efterbearbetat och publiceringsklart.",
  items:["Flygbilder — Hemnet och prospekt","Korta klipp — sociala medier","Flygning enligt gällande regler","Leverans 1–3 dagar"]}],
"dronare-4":[
 {p:"editorial", m:"hero", k:"Helheten", h:"Bostaden i sitt kvarter.",
  s:"En bild som placerar objektet — inte bara visar det.",
  need:"Flygbild i blue hour — helheten med bostaden i sitt kvarter."},
 {p:"split", m:["hero","drone"], la:"Från marken", lb:"Från luften", k:"Helheten", h:"Två perspektiv",
  need:"Flygbild i blue hour som B-sida."}],
"dronare-5":[
 {p:"cta", k:"06 — Drönare", h:"Lägg till flygning", s:"Bokas med fotograferingen"},
 {p:"quiet", k:"06 — Drönare", h:"Boka flygning.", em:"Läget säljer.",
  s:"viewly.se/dronarfotografering"}],

/* ---------- 07 OMRÅDESKARTA ---------- */
"omradeskarta-0":[
 {p:"fullbleed", m:"drone", k:"07 — Områdeskarta", h:"Läget, servicen, sammanhanget",
  need:"Ingen områdeskarta finns i biblioteket. Behövs: renderad karta 9:16."},
 {p:"quiet", k:"OMRÅDESKARTA", h:"En stiliserad karta.", em:"Bostaden i sitt sammanhang.",
  s:"Kommunikationer, skolor, service och natur — samlat i en bild.",
  need:"Ingen områdeskarta finns i biblioteket."}],
"omradeskarta-1":[
 {p:"editorial", m:"drone", k:"Varför", h:"Köparen väljer inte bara bostad.",
  s:"Hen väljer läge. Kartan svarar på den frågan innan någon hinner ställa den.",
  need:"Produktbild: faktisk områdeskarta."},
 {p:"mark", m:"drone", k:"OMRÅDESKARTA", h:"Läget", s:"Köparen väljer inte bara bostad — hen väljer läge.",
  need:"Produktbild: faktisk områdeskarta."}],
"omradeskarta-2":[
 {p:"system", k:"På kartan", h:"Fyra lager.", s:"Markerade runt bostaden, i kontorets uttryck.",
  items:["Kommunikationer","Skolor","Service","Natur"], need:"Produktbild: faktisk områdeskarta i 9:16."},
 {p:"editorial", m:"drone", k:"Kartan", h:"Ett elegant komplement till annonsen.",
  s:"Inte en skärmdump från Google — en ritad karta i kontorets grafiska profil.",
  need:"Produktbild: faktisk områdeskarta i 9:16."}],
"omradeskarta-3":[
 {p:"whitelabel", m:"drone", k:"White label", h:"Ert formspråk. Varje objekt.",
  s:"Samma uttryck på varje karta gör kontorets annonser igenkännbara i flödet.",
  brands:[["Nordvik","#1F3A2E","Se området"],["Alvhem","#7A3B2E","Se området"]],
  need:"Korten ska visa två faktiska kartor, en i vardera kontors färger."},
 {p:"whitelabel", m:"drone", k:"Levereras i ert varumärke", h:"Inte i vårt.",
  s:"Färger, typsnitt och format anpassas efter kontorets grafiska profil.",
  brands:[["Kontor A","#8A5A1A","Se området"],["Kontor B","#3D5A7A","Se området"]],
  need:"Korten ska visa två faktiska kartor."}],
"omradeskarta-4":[
 {p:"quiet", k:"Leverans", h:"Högupplöst PNG.", em:"Inom 1–2 arbetsdagar.",
  s:"Klar för prospekt, Hemnet och sociala medier.",
  need:"Kartan i användning — i prospekt eller Hemnet-annons."},
 {p:"system", k:"Leverans", h:"Tre saker.", s:"Inget mer behöver beställas.",
  items:["Högupplöst PNG","Kontorets grafiska profil","Inom 1–2 arbetsdagar"],
  need:"Kartan i användning."}],
"omradeskarta-5":[
 {p:"cta", k:"07 — Områdeskarta", h:"Beställ områdeskarta", s:"Klar inom 1–2 arbetsdagar"},
 {p:"mark", m:"drone", k:"OMRÅDESKARTA", h:"Läget", s:"viewly.se/omradeskarta",
  need:"Renderad karta 9:16."}],

/* ---------- 08 MOTION ---------- */
"motion-0":[
 {p:"fullbleed", m:"dining", k:"08 — Motion", h:"Bostadsfilm", need:"Nyckelbildruta ur faktisk Motion-film."},
 {p:"quiet", k:"MOTION", h:"Bostadsfilm.", em:"Utan en separat filmning.",
  s:"Motion bygger filmen av fotograferingen som redan är gjord."}],
"motion-1":[
 {p:"editorial", m:"dining", k:"Idén", h:"Bilderna finns redan.",
  s:"Motion skapar en sammanhängande film av dem — kamerarörelser, klippning och musik.",
  need:"Nyckelbildruta ur faktisk Motion-film."},
 {p:"mark", m:"living", k:"MOTION", h:"Nästa steg", s:"Filmen byggs av fotograferingen."}],
"motion-2":[
 {p:"editorial", m:"dining2", k:"Rörelsen", h:"Naturliga kamerarörelser.",
  s:"Ingen zoom, ingen effekt — en långsam rörelse som låter rummet tala.",
  need:"Motion-frame med synlig rörelseoskärpa."},
 {p:"fullbleed", m:"dining2", k:"Rörelse", h:"", need:"Motion-frame med synlig rörelseoskärpa."}],
"motion-3":[
 {p:"quiet", k:"Så byggs filmen", h:"Fyra steg.", em:"Bilderna, rörelsen, redigeringen, filmen.",
  s:"Genomtänkt klippning och musik som lyfter helheten."},
 {p:"product", m:"dining", k:"Så byggs filmen", h:"Bilderna blir en berättelse.",
  s:"Rörelse, klippning och musik — i den ordningen."}],
"motion-4":[
 {p:"system", k:"Format", h:"En film, tre format.", s:"Samma klipp genom hela kanalen.",
  items:["9:16 — Story och Reel","1:1 — Kvadrat i flödet","4:5 — Inlägg"]},
 {p:"matrix", m:"living", k:"Format", h:"Ett klipp, alla ytor.",
  fmts:[["9:16","Reel",9,16],["4:5","Inlägg",4,5],["1:1","Kvadrat",1,1]],
  s:"Instagram, Facebook och LinkedIn ur samma film."}],
"motion-5":[
 {p:"system", k:"Varför", h:"Tre skäl.", s:"Utan en extra produktionsdag.",
  items:["Syns i flödet","Ger bostaden sammanhang","Kostar ingen extra fotografering"]},
 {p:"editorial", m:"dining", k:"Varför", h:"Kostar ingen extra fotografering.",
  s:"Rörligt syns i flödet där stillbilden scrollas förbi — och bostaden får sammanhang."}],
"motion-6":[
 {p:"cta", k:"08 — Motion", h:"Beställ Motion", s:"Byggs av fotograferingen"},
 {p:"quiet", k:"08 — Motion", h:"Låt bostaden ta plats.", em:"I rörelse.", s:"viewly.se/motion"}],

/* ---------- 09 ANNONSEN ---------- */
"annonsen-0":[
 {p:"fullbleed", m:"kitchen", k:"09 — Annonsskrivaren", h:"Annonsen på trettio sekunder"},
 {p:"quiet", k:"ANNONSSKRIVAREN", h:"Objektbeskrivningen.", em:"Inte längre en flaskhals.",
  s:"Fyll i bostaden, ladda upp bilderna, få ett färdigt utkast."}],
"annonsen-1":[
 {p:"editorial", m:"kitchen", k:"Så snabbt", h:"Färdig bostadsannons på 30 sekunder.",
  s:"Fyll i bostaden. Ladda upp bilderna. Läs igenom och justera."},
 {p:"product", m:"portal", k:"Så snabbt", h:"30 sekunder.", s:"Från uppladdade bilder till läsbart utkast.",
  need:"Produktbild Annonsskrivaren 9:16."}],
"annonsen-2":[
 {p:"system", k:"Vad AI:n läser", h:"Sex signaler.", s:"Ur bilderna du laddar upp — inte ur en mall.",
  items:["Ljusinsläpp","Takhöjd och volym","Material och ytskikt","Planlösning","Utsikt och läge","Områdets karaktär"]},
 {p:"editorial", m:"living", k:"Underlaget", h:"Texten skrivs ur bilderna.",
  s:"Ljus, takhöjd, material, planlösning, utsikt och områdets karaktär — läst ur det du laddat upp."}],
"annonsen-3":[
 {p:"quiet", k:"Tonläge", h:"Tre röster.", em:"Samma bostad, olika tilltal.",
  s:"Saklig, varm eller exklusiv. Två omskrivningar ingår."},
 {p:"split", m:["kitchen","boucle"], la:"Saklig", lb:"Exklusiv", k:"Tonläge", h:"Samma bostad"}],
"annonsen-4":[
 {p:"quiet", k:"Din text", h:"Utkastet är ditt att ändra.", em:"Ingenting publiceras automatiskt.",
  s:"Du redigerar, kortar och godkänner.", need:"Produktbild Annonsskrivaren 9:16: redigeringsvyn."},
 {p:"system", k:"Kontrollen", h:"Tre saker som gäller.", s:"Verktyget skriver. Du bestämmer.",
  items:["Ingenting publiceras automatiskt","Två omskrivningar ingår","Texten är din att ändra"]}],
"annonsen-5":[
 {p:"cta", k:"09 — Annonsen", h:"Testa Annonsskrivaren", s:"viewly.se/annonsskrivaren"},
 {p:"mark", m:"kitchen", k:"ANNONSSKRIVAREN", h:"Trettio sekunder", s:"till ett färdigt utkast."}],

/* ---------- 10 KAMPANJEN ---------- */
"kampanjen-0":[
 {p:"fullbleed", m:"hero", k:"10 — Social / Ads Studio", h:"Ett objekt, en kampanj"},
 {p:"quiet", k:"SOCIAL / ADS STUDIO", h:"Ett objekt.", em:"En komplett kampanj.",
  s:"Mallarna är satta. Innehållet fylls i åt dig."}],
"kampanjen-1":[
 {p:"quiet", k:"Mallbiblioteket", h:"Kontorets egna mallar.", em:"Obegränsat antal.",
  s:"I valfritt format. Designen är satt — innehållet fylls i åt dig.",
  need:"Skärmbild ur Social / Ads Studio: mallbiblioteket."},
 {p:"system", k:"Mallbiblioteket", h:"Tre saker som är satta.", s:"En gång, sedan aldrig igen.",
  items:["Kontorets design","Obegränsat antal mallar","Valfritt format"],
  need:"Skärmbild ur Social / Ads Studio."}],
"kampanjen-2":[
 {p:"matrix", m:"living", k:"Format", h:"Samma mall, alla ytor.",
  fmts:[["9:16","Story",9,16],["4:5","Inlägg",4,5],["1:1","Kvadrat",1,1]],
  s:"Instagram, Facebook och LinkedIn ur en och samma export."},
 {p:"system", k:"Format", h:"Tre ytor.", s:"Exporteras samtidigt ur samma mall.",
  items:["4:5 — Inlägg, störst yta i flödet","1:1 — Kvadrat i profilrutnätet","9:16 — Story och Reel"]}],
"kampanjen-3":[
 {p:"phases", k:"Kampanjen", h:"Fyra lägen. Ett objekt.", now:2,
  items:["p1","p2","p3","p4"],
  s:"Mallen byts när kampanjen går vidare — bilden, adressen och fakta står kvar."},
 {p:"phases", k:"Status styr allt", h:"Inte en etikett i hörnet.", now:3,
  items:["p1","p2","p3","p4"],
  s:"Kommande håller tillbaka. Till salu är tätast. Visning säger en sak. Såld låter ordet ta över."}],
"kampanjen-4":[
 {p:"system", k:"Export", h:"Fyra vägar ut.", s:"När mallarna är satta tar det under en minut.",
  items:["JPG","PNG","PDF","Hela serien som zip"]},
 {p:"editorial", m:"portal", k:"Export", h:"Under en minut.", s:"Ladda ner som JPG, PNG eller PDF — eller hela serien som zip.",
  need:"Skärmbild: exportvyn."}],
"kampanjen-5":[
 {p:"cta", k:"10 — Kampanjen", h:"Öppna Social / Ads Studio", s:"viewly.se/some-studio"},
 {p:"mark", m:"hero", k:"SOCIAL / ADS STUDIO", h:"Ett objekt", s:"Hela kampanjen."}],

/* ---------- 11 SYSTEMET ---------- */
"systemet-0":[
 {p:"mark", m:"portal", k:"SYSTEMET", h:"Mäklarportalen", s:"Mer tid för affären."},
 {p:"editorial", m:"hero", k:"11 — Systemet", h:"Mindre tid i mappar.",
  s:"Beställning, produktion, material och fakturering på samma ställe."}],
"systemet-1":[
 {p:"editorial", m:"portal", k:"Mäklarportalen", h:"Ett ställe för hela bostaden.",
  s:"Boka, följ produktionen, hämta materialet, publicera.",
  need:"Vertikala portalskärmar 9:16."},
 {p:"quiet", k:"Mäklarportalen", h:"Ett ställe.", em:"Hela bostaden.",
  s:"Boka, följ, hämta, publicera — utan en enda mejltråd."}],
"systemet-2":[
 {p:"quiet", k:"Flödet", h:"Fyra steg.", em:"Från bokning till publicerad kampanj.",
  s:"Boka · Produktion · Leverans · Publicera"},
 {p:"product", m:"portal", k:"Flödet", h:"Du ser var objektet står.", s:"Hela vägen, i realtid.",
  need:"Vertikal portalvy: produktionsstatus."}],
"systemet-3":[
 {p:"quiet", k:"Skillnaden", h:"Inte en mapp med filer.", em:"En färdig presentation.",
  s:"Redo att publiceras, i rätt format, med rätt text."},
 {p:"split", m:["hero","portal"], la:"Filer", lb:"Presentation", k:"Skillnaden", h:"Vad du får"}],
"systemet-4":[
 {p:"system", k:"Samlat", h:"Fyra saker på ett ställe.", s:"En faktura. Ett konto.",
  items:["Beställning","Mallar","Material","Fakturering"]},
 {p:"editorial", m:"portal", k:"Samlat", h:"En faktura. Ett konto.",
  s:"Beställning, mallar, material och fakturering på samma ställe.",
  need:"Vertikal portalvy: faktureringsöversikt."}],
"systemet-5":[
 {p:"cta", k:"11 — Systemet", h:"Skapa konto", s:"viewly.se"},
 {p:"mark", m:"portal", k:"SYSTEMET", h:"Ett ställe", s:"Hela produktionen."}],

/* ---------- 12 OBJEKT ---------- */
"objekt-0":[
 {p:"mark", m:"drone", k:"OBJEKT 01", h:"Silvergården 9A", s:"Landskrona",
  need:"Verklig exteriör för caset."},
 {p:"fullbleed", m:"drone", k:"Objekt 01 — Landskrona", h:"Silvergården 9A",
  need:"Verklig exteriör för caset."}],
"objekt-1":[
 {p:"editorial", m:"living", k:"Interiör", h:"Samma dag, samma ljus.",
  s:"Alla bilder i kapitlet kommer från ett och samma objekt.", need:"Interiör från samma objekt."},
 {p:"case", m:"living", k:"Objekt 01", h:"Interiören", s:"Silvergården 9A", need:"Interiör från samma objekt."}],
"objekt-2":[
 {p:"fullbleed", m:"eames", k:"Detalj", h:"", need:"Detalj från samma objekt."},
 {p:"split", m:["eames","boucle"], la:"Detalj", lb:"Material", k:"Objekt 01", h:"Närbilderna",
  need:"Två detaljer från samma objekt."}],
"objekt-3":[
 {p:"editorial", m:"threed", k:"3D", h:"Planlösningen.", s:"Samma bostad, nu att gå igenom.",
  need:"3D-vy från samma objekt."},
 {p:"fullbleed", m:"threed", k:"3D-visning", h:"", need:"3D-vy från samma objekt."}],
"objekt-4":[
 {p:"editorial", m:"dining2", k:"Rörelse", h:"Och som film.", s:"Motion byggd av samma fotografering.",
  need:"Motion-frame från samma objekt."},
 {p:"case", m:"dining2", k:"Objekt 01", h:"Filmen", s:"Motion", need:"Motion-frame från samma objekt."}],
"objekt-5":[
 {p:"system", k:"Ett objekt", h:"Fem leveranser.", s:"Silvergården 9A, från en enda bokning.",
  items:["Fotografering","3D visning","Motion","Annonstext","Kampanjmallar"]},
 {p:"cta", k:"12 — Objekt", h:"Se fler objekt", s:"viewly.se"}],

/* ---------- 13 INIFRÅN ---------- */
"inifran-0":[
 {p:"fullbleed", m:"om1", k:"13 — Inifrån", h:"Människorna bakom"},
 {p:"editorial", m:"om1", k:"INIFRÅN", h:"Vilka vi är.", s:"Fotografer, redigerare och utvecklare i samma organisation."}],
"inifran-1":[
 {p:"editorial", m:"om3", k:"Hållningen", h:"Vi bygger inte för igår.",
  s:"Bostäder marknadsförs på skärm nu. Presentationen borde vara byggd för det."},
 {p:"mark", m:"om3", k:"INIFRÅN", h:"Byggt för idag", s:"inte för hur det såg ut igår."}],
"inifran-2":[
 {p:"quiet", k:"Så arbetar vi", h:"Hantverk och teknik.", em:"Ingen av delarna räcker ensam.",
  s:"Fotografen ser rummet. Systemet ser till att det kommer fram."},
 {p:"system", k:"Så arbetar vi", h:"Fyra roller.", s:"Samma organisation, samma leverans.",
  items:["Fotograf på plats","Redigering","Produktion","Support"]}],
"inifran-3":[
 {p:"editorial", m:"om4", k:"Platsen", h:"Vi är där bostaden är.", s:"Fotograferna arbetar lokalt, systemet är detsamma överallt."},
 {p:"fullbleed", m:"om4", k:"", h:""}],
"inifran-4":[
 {p:"quiet", k:"Fotograferna", h:"Fotografen är inte en underleverantör.", em:"Fotografen är Viewly.",
  s:"Samma hantverk, samma standard, samma leverans.", need:"Reportagebild: fotograf i arbete på plats."},
 {p:"case", m:"kontakt", k:"Fotograferna", h:"Fotografen är Viewly", s:"Inte en underleverantör",
  need:"Reportagebild: fotograf i arbete på plats."}],
"inifran-5":[
 {p:"editorial", m:"om1", k:"Att arbeta med oss", h:"Din blick. Ditt hantverk.",
  s:"Vår organisation, våra kunder, vårt system. Du fotograferar."},
 {p:"system", k:"Att arbeta med oss", h:"Fyra saker vi står för.", s:"Du tar med dig blicken.",
  items:["Uppdrag i ditt område","Fast ersättning","Redigering ingår","Utrustningsstöd"]}],
"inifran-6":[
 {p:"cta", k:"13 — Inifrån", h:"Fotografera med Viewly", s:"viewly.se/fotografer"},
 {p:"mark", m:"kontakt", k:"INIFRÅN", h:"Bli fotograf", s:"viewly.se/fotografer"}],

/* ---------- 14 DITT HEM ---------- */
"ditthem-0":[
 {p:"mark", m:"dining", k:"DITT HEM", h:"Din bostad", s:"säljs en gång."},
 {p:"editorial", m:"dining", k:"14 — Ditt hem", h:"Presentationen betyder något.",
  s:"De flesta möter bostaden på en skärm, långt innan de går på visning."}],
"ditthem-1":[
 {p:"editorial", m:"living", k:"Varför", h:"Ditt hem säljs en gång.",
  s:"Det första intrycket sker på Hemnet, i en scroll, på några sekunder."},
 {p:"fullbleed", m:"living", k:"14 — Ditt hem", h:"En gång"}],
"ditthem-2":[
 {p:"editorial", m:"living", k:"Vad som ingår", h:"Foto, rum och rörelse.",
  s:"Din mäklare beställer. Vi producerar. Du ser resultatet i annonsen."},
 {p:"quiet", k:"14 — Ditt hem", h:"Din mäklare beställer.", em:"Vi producerar.",
  s:"Foto, 3D, e-styling och film — i en och samma presentation."}],
"ditthem-3":[
 {p:"system", k:"Vad Viewly tillför", h:"Fyra delar.", s:"Beställs av mäklaren, syns i annonsen.",
  items:["Fotografering","3D visning","E-styling","Motion"]},
 {p:"split", m:["esLivBef","esLivAft"], la:"Utan", lb:"Med Viewly", k:"Vad Viewly tillför", h:"Skillnaden"}],
"ditthem-4":[
 {p:"cta", k:"14 — Ditt hem", h:"Fråga din mäklare om Viewly", s:"viewly.se"},
 {p:"quiet", k:"14 — Ditt hem", h:"Arbetar din mäklare med Viewly?", em:"Fråga innan ni bestämmer.",
  s:"viewly.se"}]
};


/* Varje media-slot får ett stabilt id så bildval, fokalpunkt och zoom kan
   sparas per plats i biblioteket. En Story kan ange fy/zoom som utgångsläge —
   det är slotens defaultvärde, inte en låsning. "Återställ slot" i studion
   nollar tillbaka till systemets 50 % / 100 %. */
HL.forEach(function(h){
  h.st.forEach(function(s,i){
    s.sid = h.id+"-"+i;
    if(s.fy!=null || s.zoom!=null) SLOTS[s.sid] = {fy:s.fy, zoom:s.zoom};
  });
  if(h.coverFy!=null) SLOTS["cover-"+h.id] = {fy:h.coverFy};
});

var PRIMS = [
  {id:"mark",      n:"Mark",            d:"V-geometrin bär kompositionen — mask, ram eller överdimensionerat vattenmärke."},
  {id:"fullbleed", n:"Full bleed",      d:"Bilden äger hela ytan. Nästan ingen typografi."},
  {id:"quiet",     n:"Quiet statement", d:"Nära tom. En mening som får bära."},
  {id:"editorial", n:"Editorial",       d:"Kontrollerad typografi i komponerad relation till bilden."},
  {id:"product",   n:"Product moment",  d:"Ren presentation av 3D, motion eller portal."},
  {id:"split",     n:"Split",           d:"Två ytor: före/efter, still/rörligt, jämförelse."},
  {id:"system",    n:"System",          d:"Ekosystemet som typografisk ryggrad — aldrig en ikonlista."},
  {id:"case",      n:"Case cover",      d:"Objekt, plats, en bild som får tala."},
  {id:"cta",       n:"CTA",             d:"Extremt enkel slutbild."},
  /* --- informationsdesign: ritar hur något fungerar, inte bara vad det heter --- */
  {id:"flow",      n:"Flow",            d:"Input → bearbetning → output. Visar processen, med ett faktiskt resultat i slutet."},
  {id:"matrix",    n:"Format matrix",   d:"Samma objekt i sanna formatproportioner. 4:5, 1:1 och 9:16 mätbart mot varandra."},
  {id:"phases",    n:"Phases",          d:"En kampanj som fyra faktiska artboards, med aktuellt läge tänt."},
  {id:"whitelabel",n:"White label",     d:"Samma leverans i två kontors varumärken, sida vid sida. För 3D-visningssidan och områdeskartan, som inte bär Viewlys uttryck utan kundens."}
];

/* ett representativt exempel per primitiv, för specimen-rutnätet */
var SPECS = [
  {p:"mark",       ref:["viewly",0]},
  {p:"quiet",      ref:["foto",1]},
  {p:"editorial",  ref:["foto",3]},
  {p:"system",     ref:["viewly",2]},
  {p:"product",    ref:["visning",2]},
  {p:"split",      ref:["estyling",2]},
  {p:"fullbleed",  ref:["foto",2]},
  {p:"case",       ref:["objekt",0]},
  {p:"cta",        ref:["viewly",6]},
  {p:"flow",       ref:["annonsen",2]},
  {p:"matrix",     ref:["kampanjen",2]},
  {p:"phases",     ref:["kampanjen",3]},
  {p:"whitelabel", ref:["visning",3]}
];

/* --------------------------------------------------------------------
   ANDRA FORMAT
   Social / Ads Studio exporterar inlägg 4:5, kvadrat 1:1 och story 9:16.
   Samma fyra inlägg renderade i alla tre — designen ska hålla i alla,
   annars är det ingen mall utan en engångslayout.
   -------------------------------------------------------------------- */
var POSTS = [
  {id:"p1", phase:"kommande", stage:"Vecka 1",  m:"hero",    addr:"Silvergården 9A", city:"Landskrona",
   when:"Släpps vecka 12"},
  {id:"p2", phase:"tillsalu", stage:"Vecka 2",  m:"kitchen", addr:"Silvergården 9A", city:"Landskrona",
   facts:[["4","rum och kök"],["112","kvadratmeter"],["1968","byggår"]], when:"Visning sön 13–14"},
  {id:"p3", phase:"visning",  stage:"Vecka 3",  m:"living",  addr:"Silvergården 9A", city:"Landskrona",
   when:"Söndag 13–14", note:"Anmälan via mäklaren"},
  {id:"p4", phase:"sald",     stage:"Vecka 5",  m:"drone",   addr:"Silvergården 9A", city:"Landskrona",
   note:"Tio dagar", when:"Utgångspris 3 950 000 kr"}
];
var FORMATS = [
  {ar:"9:16", n:"Story",   d:"Instagram och Facebook Stories. Kritisk zon 250 / 320 px."},
  {ar:"4:5",  n:"Inlägg",  d:"Störst yta i flödet. Standard för objektinlägg."},
  {ar:"1:1",  n:"Kvadrat", d:"Kvadrat i profilrutnätet och som LinkedIn-annons."}
];
/* de fyra kampanjmallarna, i ordning */
var PHASEDOC = [
  {id:"kommande", n:"Kommande", d:"Bilden dominerar, informationen hålls tillbaka. Hårlinje, spärrad status, adressen som löfte."},
  {id:"tillsalu", n:"Till salu", d:"Tätaste mallen: adress, faktarad med rum, yta och byggår, samt visningstid."},
  {id:"visning",  n:"Visning",  d:"En enda uppgift satt stort. Allt annat backar."},
  {id:"sald",     n:"Såld",     d:"Ordet tar över och bilden backar. Beviset står i kolofonen."}
];

var DIRS = [
 {id:"arkiv", n:"ARKIV", tag:"Tryckt monografi",
  desc:"Boken som referens. Generösa marginaler, hårfina linjer, kapitelnummer och en display-serif satt i ljus vikt. "
      +"Bilden ligger i en ram på pappret snarare än att spränga den. Fotografi används där det bevisar något — "
      +"resten av sekvensen är typografi, linje och luft.",
  logo:"Märket förekommer blint — papper på papper — eller som ett överdimensionerat blekt vattenmärke som löper ut ur kanten.",
  pal:[["#F2EFEF","Papper"],["#1C1C1E","Ink"],["#6E7266","Oliv"],["#D8D2CF","Hårlinje"],["#8A8580","Meta"]],
  type:"Cormorant Garamond 300 för display · Montserrat 500 / .24em för metadata",
  cov:"Kapitelnummer i cirkel på papper. Ljusast i profilraden — högst kontrast mot Instagrams vita gränssnitt.",
  risk:"Kräver marginaldisciplin. Faller isär om bilder tillåts spränga ramen godtyckligt.",
  hero:["viewly",1]},
 {id:"skugga", n:"SKUGGA", tag:"Cinematisk",
  desc:"Mörkret är grunden och fotografiet är ljuskällan. Bilder i full bleed eller som 2.39:1-remsor som svävar i svart. "
      +"Typografin är liten och precis; olivgrönt används som en enda ljuspunkt. Kursiv serif bär de tysta meningarna.",
  logo:"V-formen används som mask — fotografiet framträder genom märket, resten är svart.",
  pal:[["#0E0E0D","Svart"],["#EFEDE7","Ljus"],["#98A088","Oliv lyft"],["#2A2A27","Linje"],["#A8A6A0","Meta"]],
  type:"Cormorant Garamond 300 / italic för statements · Montserrat 500 / .32em, 2.15cqw",
  cov:"Foto under radialt mörker med siffran i Montserrat. Låg kontrast mot vitt — kräver tonal variation mellan kapitel.",
  risk:"Covers blir mörka cirklar i profilraden — lägst igenkänning vid 56 px.",
  hero:["foto",1]}
];

/* --------------------------------------------------------------------
   LAGERMODELL — vad som är låst, redigerbart respektive halvredigerbart
   -------------------------------------------------------------------- */
var LAYERS = [
 {s:"LÅST",         n:"Rutnät och marginaler",  d:"6,4 cqw sidmarginal, kritisk zon 23,2 / 26,0 cqw. Ändras aldrig per Story."},
 {s:"LÅST",         n:"Logotypgeometri",         d:"Spårad path, 58,0°, olivpunkt cx 705,2 / r 153,4. Skalas — omritas inte."},
 {s:"LÅST",         n:"Typskala och vikter",     d:"Display 8,2–12,4 cqw · brödtext 2,75–3,05 cqw · meta 2,05–2,25 cqw."},
 {s:"LÅST",         n:"Kompositionsmask",        d:"Bildens form och plats i primitivet. Bilden byts — masken flyttas inte."},
 {s:"LÅST",         n:"Palett",                  d:"Fem värden per riktning. Inga tillfälliga färger."},
 {s:"LÅST",         n:"Formatramar",             d:"9:16, 4:5 och 1:1. Samma typskala, olika vertikal rytm — inga fria format."},
 {s:"HALV",         n:"Kicker och folio",        d:"Texten är fri, positionen och graden är det inte."},
 {s:"HALV",         n:"Primitivval",             d:"Valfritt bland tretton — men max två full bleed i rad per sekvens."},
 {s:"HALV",         n:"Sekvenslängd",            d:"5–7 Stories. Under fem bär inte kapitlet, över sju tappar tittaren."},
 {s:"REDIGERBAR",   n:"Bild i slot",             d:"Vilket foto som helst ur biblioteket. Masken tar hand om utsnittet."},
 {s:"REDIGERBAR",   n:"Fokalpunkt och zoom",     d:"Y-fokus 0–100 %, zoom 100–170 %. Kompositionen står still."},
 {s:"REDIGERBAR",   n:"Rubrik och brödtext",     d:"Graden härleds ur längsta ordet — svensk sammansättning klipps aldrig."},
 {s:"REDIGERBAR",   n:"Etiketter i split",       d:"Före/Efter, Dag/Skymning, Stillbild/Rörligt."}
];

/* --------------------------------------------------------------------
   MEDIA — bilder som finns, och luckor som behöver produceras
   -------------------------------------------------------------------- */
var MEDIAKEYS = ["hero","kitchen","living","dining","dining2","boucle","eames","drone",
                 "matterport","threed","threedcam","portal","om1","om3","om4","kontakt",
                 "esLivBef","esLivAft","esBedBef","esBedAft","skyBef","skyAft","vadBef","vadAft"];
