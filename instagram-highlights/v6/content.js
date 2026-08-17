/* =====================================================================
   INNEHÅLL — informationsarkitektur, kompositionsprimitiv, riktningar
   Alla rubriker och texter är förslag och riktning, inte låsta krav.
   ===================================================================== */

/*__HL__*/
/*__ALT__*/

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
