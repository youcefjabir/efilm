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
   {p:"mark", m:"matterport", k:"3D VISNING", h:"Alltid öppen", s:"Bostaden går att uppleva när som helst, av vem som helst, var som helst."},
   {p:"quiet", h:"Ingen bokad visning.", em:"Bostaden är öppen 06:40 och 23:20.",
    s:"Spekulanten går in när det passar hen — inte när det passar kalendern.", k:"03 — 3D visning"},
   {p:"system", k:"Vad det ger", h:"Fyra effekter.",
    items:["Öppen dygnet runt — ingen bokad tid, ingen söndag klockan tretton",
           "Fler når objektet — den som bor i en annan stad ser bostaden ändå",
           "Bättre visningar — de som kommer har redan gått igenom hemmet",
           "Måtten finns i sidan — får soffan plats? Svaret finns utan måttband"],
    s:"Bostaden säljer medan mäklaren sover."},
   {p:"product", m:"threed", k:"I visningen", h:"Gå igenom varje rum.", s:"Dollhouse ovanifrån, planvy med mått och en rundvandring i egen takt."},
   {p:"whitelabel", m:"matterport", k:"Kontorets egen sida", h:"Er sida, inte vår.",
    s:"Logotyp, typsnitt och knapp är kontorets. Bostaden, adressen och mäklaren står still. Sidan sätts en gång och varje nytt objekt får den automatiskt.",
    brands:[["Nordvik","#1F3A2E","Upplev bostaden","Montserrat,sans-serif",0],
            ["Alvhem","#7A3B2E","Se hemmet","'Cormorant Garamond',Georgia,serif",999]]},
   {p:"chain", k:"Så går det till", h:"Från skanning till länk.", now:2,
    items:[["Boka skanning","En timme på plats, samma besök som fotograferingen."],
           ["Produktion","Modellen byggs och sidan sätts i kontorets uttryck."],
           ["Länken publiceras","1–3 arbetsdagar. Delas i annons, mejl och SMS."]],
    s:"Länken fungerar där annonsen finns: Hemnet, Booli, mäklarsystem och egen hemsida."},
   {p:"quiet", h:"Visningen tar aldrig slut.", em:"Den ligger kvar när annonsen stängs.",
    s:"Och den går att dela vidare av den som redan varit inne.", k:"03 — 3D visning"},
   {p:"cta", h:"Bostaden är alltid öppen.", s:"3D visning", k:"03 — 3D visning"}
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
,

 /* 15 — EKOSYSTEMET. Det enda kapitlet utan ett enda fotografi.
    Sammanhanget mellan delarna går inte att fotografera — en bild på ett
    kök säger ingenting om att samma objekt bär både planritningen,
    filmen och annonsen. Det måste ritas. Flödet följer stegen på
    viewly.se/maklare: intagning, produktion, mäklarportal,
    annonsskrivaren, Social / Ads Studio. */
 {glyph:"orbitmark", id:"ekosystem", num:"15", name:"EKOSYSTEMET", label:"Ekosystemet", cover:"portal",
  q:"Hur hänger allt ihop?",
  why:"Hela affärsidén i ett kapitel. Inte en tjänstelista — sambandet mellan delarna.",
  st:[
   {p:"quiet", k:"15 — Ekosystemet", h:"Ett objekt.", em:"Hela bostadsaffären.",
    s:"Viewly är inte sju tjänster bredvid varandra. Det är en kedja där varje steg gör nästa enklare."},

   {p:"orbit", k:"Grundmaterialet", dir:"in", h:"Allt börjar i bostaden.",
    items:["Fotografering","3D visning","Drönare","E-styling","Atmosphere"],
    s:"Fem produktioner, ett besök. Det som spelas in blir underlaget för allt som kommer sedan."},

   {p:"orbit", k:"Förädlingen", dir:"out", h:"Samma objekt, vidare.",
    items:["Planritning","Motion","Områdeskarta","Annonstext","Social / Ads"],
    s:"Ingenting produceras om. Materialet återanvänds genom hela plattformen."},

   {p:"chain", k:"Arbetsflödet", h:"Fem steg, en beställning.", now:4,
    items:[["Intagning","Objektets uppgifter samlas in en gång."],
           ["Produktion","Foto, 3D, styling och karta i samma besök."],
           ["Mäklarportalen","Allt material samlas färdigt för publicering."],
           ["Annonsskrivaren","Objektbeskrivningen skrivs ur underlaget."],
           ["Social / Ads Studio","Kampanjen distribueras i alla format."]],
    s:"Varje steg förenklar nästa. Du beställer i steg ett och hämtar i steg fem."},

   {p:"portal", k:"Administrationen", h:"Från sex kontakter till en yta.",
    before:["Fotograf","Filmare","3D-leverantör","Stylist","Textbyrå","Annonsverktyg"],
    plate:"Mäklarportalen",
    after:["En beställning","Ett arbetsflöde","En leverans","En faktura"],
    s:"Mäklaren slutar koordinera leverantörer och kan lägga tiden på försäljningen."},

   {p:"system", k:"Vad det ger", h:"Fyra effekter.",
    items:["Vinna fler uppdrag — en starkare presentation redan i intaget",
           "Starkare varumärke — allt levereras i kontorets uttryck",
           "Ökade intäkter — fler objekt genom mindre administration",
           "Starkare affärer — bättre underlag ger bättre budgivning"],
    s:"Det är inte bättre bostadsbilder som är målet. Det är en mer komplett marknadsföring per objekt."},

   {p:"chain", k:"Kedjan", h:"Produktion, presentation, marknadsföring.",
    items:[["Produktion","Materialet skapas en gång, på plats."],
           ["Presentation","Objektet sätts i portalen och på visningssidan."],
           ["Marknadsföring","Annons, kampanj och sociala medier ur samma underlag."]],
    s:"Tre led som brukar ligga hos tre leverantörer. Här är de ett."},

   {p:"cta", h:"Ett objekt.", s:"Hela marknadsföringen.", k:"15 — Ekosystemet"}
  ]},

 /* 16 — KAMPANJBYGGAREN. Kapitel 10 visar VAD en kampanj är; det här
    visar hur den blir till. Fem steg, ett per bildruta, plus delningen
    som egen ruta eftersom den är en egen sak. */
 {glyph:"steps", id:"byggaren", num:"16", name:"KAMPANJBYGGAREN", label:"Kampanjbyggaren",
  cover:"kitchen",
  q:"Hur gör jag en kampanj?", why:"Produkten är ett förlopp på fem steg. Visas det som en funktionslista försvinner det som säljer: att det är gjort på några minuter, ur material som redan finns.",
  st:[
   {p:"mark", m:"kitchen", k:"KAMPANJBYGGAREN", h:"Fem steg",
    s:"från levererad order till publicerad kampanj."},
   {p:"steps", step:0, k:"Steg 01 — Objekt", h:"Börja i en order som redan är klar.",
    s:"Ordrarna ligger där med sitt material. Ingenting laddas upp, ingenting letas fram."},
   {p:"steps", step:1, k:"Steg 02 — Mallar", h:"Välj de mallar kampanjen ska bestå av.",
    s:"En eller flera. Tre är vanligast: Kommande, Till salu och Visning."},
   {p:"steps", step:2, k:"Steg 03 — Bilder", h:"En bild per mall, ur ordern.",
    s:"Mall för mall. Bilderna är redan levererade och redan beskurna för formaten."},
   {p:"steps", step:3, k:"Steg 04 — Kontroll", h:"Se att uppgifterna stämmer.",
    s:"Adress, mallar, bilder och format. Inget nytt att fylla i — bara att godkänna."},
   {p:"steps", step:4, k:"Steg 05 — Klar", h:"Kampanjen är byggd.",
    s:"Tre inlägg i tre format vardera, med objektets egna uppgifter i sig."},
   {p:"share", k:"Dela och schemalägg", h:"Ut i kanalerna direkt härifrån.",
    s:"Instagram och Facebook ligger anslutna. Publicera nu, eller lägg det på en tid som passar veckan."},
   {p:"cta", h:"Bygg kampanjen", s:"viewly.se", k:"16 — Kampanjbyggaren"}
  ]}
];