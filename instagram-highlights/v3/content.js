/* ====================================================================
   CONTENT — nine highlights, graphic-first
   ==================================================================== */
var HL=[

{id:"viewly",num:"01",name:"VIEWLY",lab:"Viewly",q:"Vad är Viewly och varför finns det?",cov:"viewly",st:[
 {p:"statement",k:"VIEWLY",head:["Bostadspresentation.","Ombyggd från grunden."],y:560,
  sub:["Foto, rum, rörelse och kampanj","i en och samma produktion."]},
 {p:"statement",k:"01 — VIEWLY",head:["Ett objekt är inte","en fotografering."],em:"Det är en presentation.",y:520},
 {p:"diagram",d:"ecosystem",k:"01 — VIEWLY",head:["Ett objekt.","Hela presentationen."]},
 {p:"diagram",d:"flow",k:"ARBETSFLÖDET",head:["En bokning.","Ett flöde."],ly:1020,
  items:[["BOKA","2 min"],["PRODUKTION","På plats"],["LEVERANS","Portalen"],["PUBLICERA","Alla kanaler"]],
  sub:"Du bokar en gång. Resten kommer till dig."},
 {p:"photo",m:"hero",k:"",head:null},
 {p:"statement",k:"01 — VIEWLY",head:["Byggt för hur bostäder","marknadsförs idag."],y:540,
  sub:["Inte för hur de fotograferades igår."]},
 {p:"transition",k:"01 — VIEWLY",head:["Vad det betyder","för dig som mäklare."],next:"02 — FÖR MÄKLARE"}
]},

{id:"maklare",num:"02",name:"FÖR MÄKLARE",lab:"För mäklare",q:"Varför ska jag bry mig?",cov:"maklare",st:[
 {p:"statement",k:"02 — FÖR MÄKLARE",head:["Mer tid","för affären."],em:"Mindre tid i mappar.",y:560},
 {p:"diagram",d:"states",k:"02 — FÖR MÄKLARE",head:["Fem leverantörer.","Eller ett flöde."],
  frag:[["FOTOGRAF",64,740,210],["STYLIST",196,806,268],["FILMARE",110,864,232],
        ["PLANRITNING",330,930,300],["ANNONSBYRÅ",232,996,258]],
  items:["BOKA","PRODUKTION","LEVERANS","ANNONS","SOCIAL"],
  sub:"Mer tid för affären."},
 {p:"product",r:"portal",k:"MÄKLARPORTALEN",head:["Allt om bostaden.","På ett ställe."],
  items:[["Fotografering","LEVERERAD",1],["3D-visning","LEVERERAD",1],["Planritning","LEVERERAD",1],
         ["E-styling","I PRODUKTION",0],["Motion","I PRODUKTION",0],["Annons","UTKAST KLART",0]],
  sub:"Du ser produktionen medan den pågår."},
 {p:"diagram",d:"output",k:"LEVERANSEN",head:["Vad som kommer","tillbaka."],
  items:[["Högupplösta bilder","32"],["3D-rundtur","1"],["Planritning","2"],
         ["Bostadsfilm","1"],["Sociala format","9"],["Annonstext","1"]],
  sub:"Inte en mapp med filer. En färdig presentation."},
 {p:"photo",m:"kitchen",k:"KVALITETEN",head:["Samma nivå.","Varje objekt."]},
 {p:"statement",k:"02 — FÖR MÄKLARE",head:["Ett objekt.","Hela kampanjen."],y:560,
  sub:["Från första bokningen","till publicerad annons."]},
 {p:"transition",k:"02 — FÖR MÄKLARE",head:["Verktygen du får","på köpet."],next:"03 — VERKTYG"}
]},

{id:"verktyg",num:"03",name:"VERKTYG",lab:"Verktyg",q:"Vad får jag som ingen annan ger mig?",cov:"verktyg",st:[
 {p:"statement",k:"03 — VERKTYG",head:["Digitala verktyg,","inte fler filer."],y:560,
  sub:["Annonsskrivaren · SoMe Studio · Branding"]},
 {p:"product",r:"annons",k:"03 — VERKTYG",head:["Objektsdata in.","Färdig annons ut."],
  sub:"Din text. Ditt tonläge."},
 {p:"diagram",d:"campaign",k:"SOME STUDIO",head:["Ett objekt.","Fyra lägen."],
  items:["KOMMANDE","TILL SALU","VISNING","SÅLD"],
  sub:"Kampanjen följer affären automatiskt."},
 {p:"diagram",d:"formats",k:"FORMATEN",head:["Ett material.","Alla ytor."],
  sub:"Beskuret rätt från början — aldrig i efterhand."},
 {p:"diagram",d:"converge",k:"BRANDING",head:["Ert kontor.","Vår produktion."],
  items:["LOGOTYP","FÄRGER","TYPOGRAFI"],
  out:'<rect x="64" y="990" width="952" height="300" fill="'+"#E4E0D9"+'"/>'
     +'<text x="112" y="1064" font-family="Montserrat" font-weight="600" font-size="21" fill="'+"#6E7266"+'" letter-spacing="6">APPLICERAS AUTOMATISKT</text>'
     +'<text x="112" y="1146" font-family="Cormorant Garamond" font-weight="300" font-size="48" fill="'+"#141416"+'">Varje bild. Varje film. Varje annons.</text>'
     +'<line x1="112" y1="1196" x2="968" y2="1196" stroke="'+"#C4BEB5"+'" stroke-width="1"/>'
     +'<text x="112" y="1250" font-family="Montserrat" font-size="25" fill="'+"#4A4843"+'">Kontoret sätter identiteten en gång.</text>',
  sub:"Sedan slutar ni tänka på den."},
 {p:"transition",k:"03 — VERKTYG",head:["Och under allt:","hantverket."],next:"04 — FOTO"}
]},

{id:"foto",num:"04",name:"FOTO",lab:"Foto",q:"Håller kvaliteten?",cov:"foto",st:[
 {p:"diagram",d:"locator",k:"04 — FOTO",lit:0,head:["Där allt","börjar."],
  sub:"Varje lager bygger på den här bilden."},
 {p:"photo",m:"hero",k:"",head:null},
 {p:"statement",k:"04 — FOTO",head:["Ljus."],em:"Vi väntar in det.",y:640,
  sub:["Vi lägger inte till det i efterhand."]},
 {p:"photo",m:"kitchen",k:"RYMD",head:["Ett rum ska kännas.","Inte mätas."]},
 {p:"photo",m:"boucle",k:"DETALJ",head:["Det som gör ett hus","till ett hem."]},
 {p:"transition",k:"04 — FOTO",head:["Sedan låter vi","köparen kliva in."],next:"05 — 3D"}
]},

{id:"tred",num:"05",name:"3D",lab:"3D",q:"Hur upplever spekulanten bostaden?",cov:"tred",st:[
 {p:"diagram",d:"locator",k:"05 — 3D",lit:2,head:["Bostaden,","tillgänglig."],
  sub:"Dygnet runt, från soffan."},
 {p:"photo",m:"matterport",k:"3D-VISNING",head:["Låt köparen","kliva in."]},
 {p:"illustration",i:"axo",k:"RUMSFÖRSTÅELSE",head:["Från yta","till helhet."],
  items:["PLAN","RUM","HELHET"]},
 {p:"statement",k:"05 — 3D",head:["Visningen","tar aldrig slut."],em:"Öppet dygnet runt.",y:600},
 {p:"transition",k:"05 — 3D",head:["Och när bostaden","ska berättas."],next:"06 — MOTION"}
]},

{id:"motion",num:"06",name:"MOTION",lab:"Motion",q:"Hur berättas bostaden?",cov:"motion",st:[
 {p:"diagram",d:"locator",k:"06 — MOTION",lit:4,head:["Bostaden,","berättad."],
  sub:"Samma material. Ny puls."},
 {p:"illustration",i:"motion",k:"06 — MOTION",head:["Från stillbild","till film."],
  sub:"Långsam push-in. Ingen effekt."},
 {p:"photo",m:"dining",k:"MOTION",head:["En bostad kan","berättas."],
  need:"Nyckelbildruta ur faktisk bostadsfilm med synlig rörelseoskärpa."},
 {p:"diagram",d:"formats",k:"VIDAREANVÄNDNING",head:["Ett klipp.","Fyra ytor."],
  sub:"Reel, story, annons och presentation ur samma produktion."},
 {p:"transition",k:"06 — MOTION",head:["Och när rummet","behöver mer."],next:"07 — E-STYLING"}
]},

{id:"estyling",num:"07",name:"E-STYLING",lab:"E-styling",q:"Vad är potentialen?",cov:"estyling",st:[
 {p:"diagram",d:"locator",k:"07 — E-STYLING",lit:3,head:["Bostadens","potential."],
  sub:"Alltid ärligt mot rummet."},
 {p:"comparison",k:"E-STYLING",head:["Vardagsrum"],m:["esLivBef","esLivAft"],la:"FÖRE",lb:"EFTER"},
 {p:"comparison",k:"E-STYLING",head:["Sovrum"],m:["esBedBef","esBedAft"],la:"FÖRE",lb:"EFTER"},
 {p:"illustration",i:"styling",k:"MEKANISMEN",head:["Så byggs","känslan."],
  items:["TOM YTA","ZONERING","MÖBLERING"],
  sub:"Möblering vald efter köparen, inte efter katalogen."},
 {p:"statement",k:"07 — E-STYLING",head:["Samma bostad."],em:"Ny känsla.",y:620},
 {p:"transition",k:"07 — E-STYLING",head:["Så här ser det ut","på ett riktigt objekt."],next:"08 — CASES"}
]},

{id:"cases",num:"08",name:"CASES",lab:"Cases",q:"Vad producerar systemet i verkligheten?",cov:"cases",st:[
 {p:"case",m:"drone",k:"OBJEKT 01",head:["Silvergården 9A"],sub:"LANDSKRONA",
  need:"Verklig exteriör för caset, blue hour, vertikalt."},
 {p:"photo",m:"living",k:"",head:null,need:"Interiör från samma objekt."},
 {p:"photo",m:"eames",k:"DETALJ",head:null,need:"Detalj från samma objekt."},
 {p:"photo",m:"threed",k:"3D",head:["Hela planlösningen","att gå igenom."],need:"3D-vy från samma objekt."},
 {p:"diagram",d:"output",k:"RESULTATET",head:["Vad objektet","producerade."],
  items:[["Bilder","32"],["3D-rundtur","1"],["Planritning","2"],["Bostadsfilm","1"],
         ["Sociala format","9"],["Annonstext","1"]],
  sub:"En bokning. Sex leveranser."},
 {p:"transition",k:"08 — CASES",head:["Vilka som bygger","det här."],next:"09 — OM OSS"}
]},

{id:"om",num:"09",name:"OM OSS",lab:"Om oss",q:"Vilka bygger det här?",cov:"om",st:[
 {p:"statement",k:"09 — OM OSS",head:["Vi bygger inte","ännu ett fotobolag."],y:540},
 {p:"statement",k:"09 — OM OSS",head:["Vi bygger infrastrukturen","runt bostadens","presentation."],y:500,
  em:"Det är en större uppgift."},
 {p:"diagram",d:"triad",k:"SÅ ARBETAR VI",head:["Tre delar.","Ingen räcker ensam."],
  items:["HANTVERK","TEKNIK","SYSTEM"],
  sub:"Fotografen ser. Systemet levererar."},
 {p:"photo",m:"om3",k:"MÄNNISKORNA",head:["Fotografen är","inte en underleverantör."],
  need:"Reportagebild: Viewly-fotograf i arbete på plats."},
 {p:"transition",k:"09 — OM OSS",head:["Bostadspresentation,","ombyggd från grunden."],next:"viewly.se"}
]}
];

/* ====================================================================
   COVERS — each is that highlight's own idea, reduced to survive 56 px
   ==================================================================== */
var COV={};
function cbase(inner){ return '<rect width="100" height="100" fill="#EFECE7"/>'+inner }
var CI="#141416", CO="#6E7266";

COV.viewly=function(){   /* the object and its branches */
  var g='<rect x="16" y="24" width="20" height="14" fill="'+CO+'"/>';
  g+='<line x1="26" y1="38" x2="26" y2="76" stroke="'+CI+'" stroke-width="3.5"/>';
  [50,63,76].forEach(function(y){
    g+='<path d="M26 '+(y-9)+' L31.6 '+y+' L'+(50+ (y-50)*0.5)+' '+y+'" fill="none" stroke="'+CI+'" stroke-width="3.5"/>';
  });
  return cbase(g);
};
COV.maklare=function(){  /* scattered becomes one line */
  var g='';
  [[18,26,22],[34,36,26],[24,46,20]].forEach(function(s){
    g+='<line x1="'+s[0]+'" y1="'+s[1]+'" x2="'+(s[0]+s[2])+'" y2="'+s[1]+'" stroke="#A9A49B" stroke-width="3"/>';
  });
  g+='<line x1="14" y1="70" x2="86" y2="70" stroke="'+CO+'" stroke-width="4.5"/>';
  [20,38,56,74].forEach(function(x){ g+='<circle cx="'+x+'" cy="70" r="4.5" fill="'+CO+'"/>' });
  return cbase(g);
};
COV.verktyg=function(){  /* three inputs converge */
  var g='';
  [30,50,70].forEach(function(y){
    g+= y===50 ? '<line x1="14" y1="50" x2="62" y2="50" stroke="'+CI+'" stroke-width="3.5"/>'
      : '<path d="M14 '+y+' L44 '+y+' L62 50" fill="none" stroke="'+CI+'" stroke-width="3.5"/>';
  });
  g+='<circle cx="66" cy="50" r="8" fill="'+CO+'"/>';
  return cbase(g);
};
COV.foto=function(){     /* light entering a frame, cut at the brand angle */
  return cbase('<clipPath id="fc"><rect x="18" y="24" width="64" height="52"/></clipPath>'
   +'<g clip-path="url(#fc)"><polygon points="26,24 42,24 74.5,76 58.5,76" fill="'+CO+'"/></g>'
   +'<rect x="18" y="24" width="64" height="52" fill="none" stroke="'+CI+'" stroke-width="4"/>');
};
COV.tred=function(){     /* axonometric volume */
  return cbase('<path d="M20 40 L50 26 L80 40 L80 70 L50 84 L20 70 Z" fill="none" stroke="'+CI+'" stroke-width="4"/>'
   +'<path d="M20 40 L50 54 L80 40" fill="none" stroke="'+CI+'" stroke-width="3.5"/>'
   +'<line x1="50" y1="54" x2="50" y2="84" stroke="'+CO+'" stroke-width="4"/>');
};
COV.motion=function(){   /* frames in a trail */
  var g='';
  [0,1,2,3].forEach(function(i){
    g+='<rect x="'+(16+i*17)+'" y="'+(30+i*3)+'" width="26" height="40" fill="'+CI+'" opacity="'+(i===3?1:0.16+i*0.16).toFixed(2)+'"/>';
  });
  return cbase(g);
};
COV.estyling=function(){ /* one room, two states */
  return cbase('<rect x="18" y="28" width="64" height="44" fill="none" stroke="'+CI+'" stroke-width="4"/>'
   +'<rect x="50" y="28" width="32" height="44" fill="'+CO+'"/>'
   +'<line x1="50" y1="28" x2="50" y2="72" stroke="'+CI+'" stroke-width="4"/>');
};
COV.cases=function(){    /* a plan footprint */
  return cbase('<rect x="18" y="26" width="64" height="48" fill="none" stroke="'+CI+'" stroke-width="4"/>'
   +'<line x1="56" y1="26" x2="56" y2="74" stroke="'+CI+'" stroke-width="4"/>'
   +'<line x1="56" y1="53" x2="82" y2="53" stroke="'+CI+'" stroke-width="4"/>'
   +'<rect x="18" y="26" width="38" height="27" fill="'+CO+'"/>');
};
COV.om=function(){       /* the mark itself, the only literal use */
  return cbase('<g transform="translate(20,22) scale(0.0755)">'
   +'<path d="'+GEO.limb+'" fill="'+CI+'"/>'
   +'<circle cx="'+GEO.dot.cx+'" cy="'+GEO.dot.cy+'" r="'+GEO.dot.r+'" fill="'+CO+'"/></g>');
};
function cover(id){ return (COV[id]||COV.om)() }
