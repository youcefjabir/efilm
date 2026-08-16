/* =====================================================================
   INNEHÅLL — informationsarkitektur, kompositionsprimitiv, riktningar
   Alla rubriker och texter är förslag och riktning, inte låsta krav.
   ===================================================================== */

var HL = [
 {id:"viewly", num:"01", name:"VIEWLY", label:"Viewly", cover:"hero",
  q:"Vad är Viewly?", why:"Manifestet. Sätter ramen: ett ekosystem, inte en tjänst.",
  st:[
   {p:"mark", m:"hero", k:"VIEWLY", h:"Bostadspresentation", s:"byggd för hur bostäder marknadsförs idag."},
   {p:"quiet", h:"Ett objekt är inte en fotografering.", em:"Det är en presentation.", k:"01 — Viewly"},
   {p:"system", k:"Ekosystemet", h:"En produktion.", s:"Sju lager. Ett flöde.",
    items:["Foto","Rörelse","Rum","Stil","Område","Annons","Kampanj"]},
   {p:"product", m:"portal", fy:.55, zoom:1.12, k:"Portalen", h:"Från bokning till färdigt material.", s:"Allt om bostaden på ett ställe.",
    need:"Vertikalt portalutsnitt 9:16 — nuvarande bild är beskuren desktop."},
   {p:"fullbleed", m:"living", k:"", h:"", s:""},
   {p:"editorial", m:"kitchen", k:"För mäklare", h:"Byggt för mäklare som vill presentera bostäder bättre.", s:"Inte för att fylla en tjänstelista."},
   {p:"cta", h:"Upptäck Viewly", s:"viewly.se", k:"01 — Viewly"}
  ]},

 {id:"seendet", num:"02", name:"SEENDET", label:"Seendet", cover:"kitchen",
  q:"Hur ser kvaliteten ut?", why:"Hantverket. Ren fotografi — nästan ingen försäljning.",
  st:[
   {p:"fullbleed", m:"hero", k:"02 — Seendet", h:"Bostadsfotografering", s:""},
   {p:"quiet", h:"Ljus.", em:"Vi väntar in det.", s:"Vi lägger inte till det.", k:"02 — Seendet"},
   {p:"fullbleed", m:"kitchen", k:"", h:"", s:""},
   {p:"quiet", h:"Rymd.", em:"Ett rum ska kännas.", s:"Inte mätas.", k:"02 — Seendet"},
   {p:"editorial", m:"boucle", k:"Detalj", h:"Det som gör ett hus till ett hem.", s:"Textur, material, slitage, ljus."},
   {p:"fullbleed", m:"drone", k:"Exteriör", h:"", s:"",
    need:"Fullscreen premium-exteriör i blue hour, vertikalt 9:16."},
   {p:"cta", h:"Fotograferingen är början.", s:"Se hela ekosystemet", k:"02 — Seendet"}
  ]},

 {id:"rorelse", num:"03", name:"RÖRELSE", label:"Rörelse", cover:"dining",
  q:"Vad kan jag skapa?", why:"Flaggskeppet. Säljer resultatet — aldrig tekniken bakom.",
  st:[
   {p:"mark", m:"dining", k:"RÖRELSE", h:"Bostadsfilm", s:"Stillbild blir berättelse.",
    need:"Nyckelbildruta ur faktisk bostadsfilm."},
   {p:"quiet", h:"En bostad behöver inte bara visas.", em:"Den kan berättas.", k:"03 — Rörelse"},
   {p:"split", m:["living","dining"], la:"Stillbild", lb:"Rörligt", k:"Transformation",
    h:"Samma rum. Ny puls.", need:"Motion-frame som B-sida, inte en andra stillbild."},
   {p:"product", m:"dining2", k:"Cinematiskt", h:"Långsam push-in.", s:"Ingen zoom. Ingen effekt. Bara rörelse.",
    need:"Faktisk motion-frame med synlig rörelseoskärpa."},
   {p:"system", k:"Ett klipp", h:"Fyra format.", s:"Samma material — hela kanalen.",
    items:["Reel","Story","Annons","Presentation"]},
   {p:"cta", h:"Ett objekt.", s:"Fler sätt att berätta det.", k:"03 — Rörelse"}
  ]},

 {id:"rummet", num:"04", name:"RUMMET", label:"Rummet", cover:"matterport",
  q:"Vad kan jag skapa?", why:"3D, planritning och områdeskarta samlat som ett rumsligt lager.",
  st:[
   {p:"fullbleed", m:"matterport", k:"04 — Rummet", h:"3D-visning", s:""},
   {p:"quiet", h:"Låt spekulanten kliva in.", em:"När som helst.", k:"04 — Rummet"},
   {p:"product", m:"threed", k:"Planlösning", h:"Förstå hur rummen hänger ihop.", s:"Innan första visningen."},
   {p:"fullbleed", m:"threedcam", k:"", h:"", s:""},
   {p:"editorial", m:"hero", k:"Tillgänglighet", h:"Visningen tar aldrig slut.", s:"Öppet dygnet runt, från soffan."},
   {p:"cta", h:"En del av presentationen.", s:"Inte en gimmick.", k:"04 — Rummet"}
  ]},

 {id:"forvandling", num:"05", name:"FÖRVANDLING", label:"Förvandling", cover:"esLivAft",
  q:"Varför är Viewly annorlunda?", why:"Profilens starkaste visuella bevis. Nästan ordlös.",
  st:[
   {p:"fullbleed", m:"esLivAft", k:"05 — Förvandling", h:"", s:""},
   {p:"split", m:["esLivBef","esLivAft"], la:"Före", lb:"Efter", k:"E-styling", h:"Vardagsrum"},
   {p:"split", m:["esBedBef","esBedAft"], la:"Före", lb:"Efter", k:"E-styling", h:"Sovrum"},
   {p:"split", m:["skyBef","skyAft"], la:"Dag", lb:"Skymning", k:"Atmosphere", h:"Samma timme"},
   {p:"split", m:["vadBef","vadAft"], la:"Grått", lb:"Klart", k:"Atmosphere", h:"Rätt förutsättningar"},
   {p:"quiet", h:"Samma bostad.", em:"Ny känsla.", k:"05 — Förvandling"},
   {p:"cta", h:"Bostadens fulla potential.", s:"Alltid ärligt mot rummet.", k:"05 — Förvandling"}
  ]},

 {id:"systemet", num:"06", name:"SYSTEMET", label:"Systemet", cover:"portal", coverFy:.55,
  q:"Hur fungerar det?", why:"Den kommersiellt viktigaste. Talar direkt till mäklaren.",
  st:[
   {p:"quiet", h:"Mer tid för affären.", em:"Mindre tid i mappar.", k:"06 — Systemet"},
   {p:"product", m:"portal", fy:.55, zoom:1.12, k:"Mäklarportalen", h:"Ett ställe för hela bostaden.", s:"Boka, följ, hämta, publicera.",
    need:"Vertikala portalskärmar 9:16."},
   {p:"system", k:"Flödet", h:"Fyra steg.", s:"Från bokning till publicerad kampanj.",
    items:["Boka","Produktion","Leverans","Publicera"]},
   {p:"editorial", m:"hero", k:"Skillnaden", h:"Inte en mapp med filer.", s:"En färdig presentation, redo att publiceras."},
   {p:"product", m:"portal", fy:.6, zoom:1.12, k:"Samlat", h:"En faktura. Ett konto.", s:"Beställning, mallar, material och fakturering på samma ställe.",
    need:"Vertikal portalvy 9:16: faktureringsöversikt."},
   {p:"cta", h:"Ett ställe.", s:"Hela produktionen.", k:"06 — Systemet"}
  ]},

 /* 07 — Annonsskrivaren + Social / Ads Studio.
    Två verktyg, ett kapitel: det som händer efter fotograferingen.
    All copy nedan är hämtad ur viewly.se/annonsskrivaren och viewly.se/some-studio. */
 {id:"kampanjen", num:"07", name:"KAMPANJEN", label:"Kampanjen", cover:"portal", coverFy:.55,
  q:"Hur når objektet ut?",
  why:"Annonsskrivaren och Social / Ads Studio som ett lager — text och format ur samma order. Säljer utfallet, inte AI:n.",
  st:[
   {p:"mark", m:"hero", k:"KAMPANJEN", h:"Ett objekt", s:"En komplett kampanj."},
   {p:"quiet", h:"Färdig bostadsannons", em:"på 30 sekunder.", s:"Fyll i bostaden. Ladda upp bilderna.", k:"07 — Kampanjen"},
   {p:"flow", k:"Annonsskrivaren", h:"Från sex bilder till färdig text.",
    inp:{lab:"Du laddar upp", ims:["hero","kitchen","living","dining","boucle","eames"]},
    mid:{lab:"AI:n läser bilderna", items:["Ljusinsläpp","Takhöjd och volym","Material och ytskikt","Planlösning","Utsikt och läge","Områdets karaktär"]},
    out:{lab:"Färdig annons — exempel", tones:["Saklig","Varm","Exklusiv"], now:1,
         title:"Ljuset som gör skillnad",
         lead:"Fyra rum med genomgående planlösning och eftermiddagssol rakt in i vardagsrummet.",
         lines:[97,100,88,64]}},
   {p:"editorial", m:"portal", fy:.52, zoom:1.06, k:"Social / Ads Studio", h:"Kontorets egna mallar.",
    s:"Inlägg 4:5, kvadrat 1:1 och story 9:16 — samtidigt. Instagram, Facebook och LinkedIn.",
    need:"Skärmbild ur Social / Ads Studio: samma objekt i tre format."},
   {p:"matrix", m:"hero", k:"Format", h:"Ett objekt, alla format.",
    fmts:[["4:5","Inlägg",4,5],["1:1","Kvadrat",1,1],["9:16","Story",9,16]],
    s:"Samma mall exporterar samtliga. Instagram, Facebook och LinkedIn."},
   {p:"phases", m:"hero", k:"Kampanjfaser", h:"Fyra lägen. En mall.", now:1,
    items:[["Kommande","Vecka 1"],["Till salu","Vecka 2"],["Visning","Söndag"],["Såld","Vecka 5"]],
    s:"Samma objekt hela resan — bara statusen byts."},
   {p:"cta", h:"Ett objekt.", s:"Hela kampanjen.", k:"07 — Kampanjen"}
  ]},

 {id:"objekt", num:"08", name:"OBJEKT", label:"Objekt", cover:"eames",
  q:"Kan jag lita på dem?", why:"Beviset. Varje case är en liten redaktionell feature. Skalar utan omdesign.",
  st:[
   {p:"case", m:"drone", k:"Objekt 01", h:"Silvergården 9A", s:"Landskrona",
    need:"Verklig exteriör för caset."},
   {p:"fullbleed", m:"living", k:"", h:"", s:"", need:"Interiör från samma objekt."},
   {p:"editorial", m:"eames", k:"Detalj", h:"", s:"", need:"Detalj från samma objekt."},
   {p:"product", m:"threed", k:"3D", h:"Planlösningen.", s:"", need:"3D-vy från samma objekt."},
   {p:"fullbleed", m:"dining2", k:"Rörelse", h:"", s:"", need:"Motion-frame från samma objekt."},
   {p:"cta", h:"Ett objekt.", s:"Hela presentationen.", k:"08 — Objekt"}
  ]},

 {id:"inifran", num:"09", name:"INIFRÅN", label:"Inifrån", cover:"om3",
  q:"Vilka är ni?", why:"Om oss + fotografer sammanslagna. Rekrytering blir en följd av varumärket, inte en jobbannons.",
  st:[
   {p:"mark", m:"om1", k:"INIFRÅN", h:"Människorna", s:"bakom presentationen."},
   {p:"quiet", h:"Vi bygger inte för hur bostäder presenterades igår.", k:"09 — Inifrån"},
   {p:"editorial", m:"om3", k:"Så arbetar vi", h:"Hantverk och teknik.", s:"Ingen av delarna räcker ensam."},
   {p:"fullbleed", m:"om4", k:"", h:"", s:""},
   {p:"editorial", m:"kontakt", k:"Fotograferna", h:"Fotografen är inte en underleverantör.", s:"Fotografen är Viewly.",
    need:"Reportagebild: fotograf i arbete på plats."},
   {p:"quiet", h:"Din blick. Ditt hantverk.", em:"Vår organisation.", k:"09 — Inifrån"},
   {p:"cta", h:"Fotografera med Viewly", s:"viewly.se/fotografer", k:"09 — Inifrån"}
  ]},

 {id:"ditthem", num:"10", name:"DITT HEM", label:"Ditt hem", cover:"dining",
  q:"Hur börjar jag?", why:"Sekundär målgrupp. Medvetet kort — svarar på en enda fråga.",
  st:[
   {p:"fullbleed", m:"dining", k:"10 — Ditt hem", h:"", s:""},
   {p:"quiet", h:"Ditt hem säljs en gång.", em:"Presentationen betyder något.", k:"10 — Ditt hem"},
   {p:"fullbleed", m:"living", k:"", h:"", s:""},
   {p:"editorial", m:"hero", k:"Vad Viewly tillför", h:"Foto, rum och rörelse i en presentation.", s:"Din mäklare beställer. Vi producerar."},
   {p:"cta", h:"Arbetar din mäklare med Viewly?", s:"Gör bostadstestet", k:"10 — Ditt hem"}
  ]}
];

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
  {id:"phases",    n:"Phases",          d:"En kampanj som fyra faktiska artboards, med aktuellt läge tänt."}
];

/* ett representativt exempel per primitiv, för specimen-rutnätet */
var SPECS = [
  {p:"mark",      ref:["viewly",0]},
  {p:"quiet",     ref:["seendet",1]},
  {p:"editorial", ref:["seendet",4]},
  {p:"system",    ref:["viewly",2]},
  {p:"product",   ref:["rorelse",3]},
  {p:"split",     ref:["forvandling",1]},
  {p:"fullbleed", ref:["seendet",2]},
  {p:"case",      ref:["objekt",0]},
  {p:"cta",       ref:["viewly",6]},
  {p:"flow",      ref:["kampanjen",2]},
  {p:"matrix",    ref:["kampanjen",4]},
  {p:"phases",    ref:["kampanjen",5]}
];

/* --------------------------------------------------------------------
   ANDRA FORMAT
   Social / Ads Studio exporterar inlägg 4:5, kvadrat 1:1 och story 9:16.
   Samma fyra inlägg renderade i alla tre — designen ska hålla i alla,
   annars är det ingen mall utan en engångslayout.
   -------------------------------------------------------------------- */
var POSTS = [
  {id:"p1", m:"hero",   k:"Kommande",  h:"Silvergården 9A", s:"Landskrona · 4 rok · 112 m²", meta:"Snart till salu"},
  {id:"p2", m:"kitchen",k:"Till salu", h:"Ljuset som gör skillnad", s:"Visning söndag 13–14", meta:"viewly.se"},
  {id:"p3", m:"boucle", k:"Detalj",    h:"Material och ljus", s:"", meta:"Fotograf · Viewly"},
  {id:"p4", m:"drone",  k:"Såld",      h:"Såld på tio dagar", s:"", meta:"Tack för förtroendet"}
];
var FORMATS = [
  {ar:"9:16", n:"Story",   d:"Instagram och Facebook Stories. Kritisk zon 250 / 320 px."},
  {ar:"4:5",  n:"Inlägg",  d:"Störst yta i flödet. Standard för objektinlägg."},
  {ar:"1:1",  n:"Kvadrat", d:"Kvadrat i profilrutnätet och som LinkedIn-annons."}
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
  hero:["seendet",1]}
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
 {s:"HALV",         n:"Primitivval",             d:"Valfritt bland tolv — men max två full bleed i rad per sekvens."},
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
