/* ====================================================================
   VIEWLY — THREE DESIGN DIRECTIONS
   Full canvas 1080×1920. Critical readable content inside 64–1016 /
   250–1600. Everything else may run off every edge and sit behind
   Instagram's UI. Brand angle 58.0° (measured, IoU 0.9925).
   ==================================================================== */
var M = window.VMEDIA || {};
var TAN=1.6003;
var CL=64, CR=1016, CT=250, CB=1600;
var LIMB="M 0 16.4 L 206.7 16.4 Q 243.7 16.4 259.7 43.4 L 588 552.6 L 462.2 756.3 Z";
var DOT={cx:705.2,cy:153.4,r:153.4};

function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var MO='font-family="Montserrat"', CO='font-family="Cormorant Garamond"';
function T(x,y,t,f,sz,fill,ex){
  return '<text x="'+x+'" y="'+y+'" '+f+' font-size="'+sz+'" fill="'+fill+'" '+(ex||'')+'>'+E(t)+'</text>';
}
var uid=0;
function slot(key,box,o){
  o=o||{}; var f=o.focal||{x:.5,y:.5}, z=o.zoom||1, u=M[key];
  var id="c"+(++uid), ar=/_h$/.test(key)?1.4989:0.5625;
  var clip='<clipPath id="'+id+'">'+(o.path?'<path d="'+o.path+'"/>'
      :'<rect x="'+box.x+'" y="'+box.y+'" width="'+box.w+'" height="'+box.h+'"'+(o.r?' rx="'+o.r+'"':'')+'/>')+'</clipPath>';
  if(!u) return clip+'<g clip-path="url(#'+id+')"><rect x="'+box.x+'" y="'+box.y+'" width="'+box.w
    +'" height="'+box.h+'" fill="#2A2A28"/></g>';
  var sw,sh;
  if(box.w/box.h>ar){ sw=box.w*z; sh=sw/ar } else { sh=box.h*z; sw=sh*ar }
  return clip+'<g clip-path="url(#'+id+')"><image href="'+u+'" x="'+(box.x+(box.w-sw)*f.x).toFixed(1)
    +'" y="'+(box.y+(box.h-sh)*f.y).toFixed(1)+'" width="'+sw.toFixed(1)+'" height="'+sh.toFixed(1)
    +'" preserveAspectRatio="none"/></g>';
}
function mark(x,y,h,ink,dot){
  var w=h*(858.6/756.3);
  return '<g transform="translate('+(x-w)+','+y+') scale('+(h/756.3)+')"><path d="'+LIMB+'" fill="'+ink+'"/>'
   +'<circle cx="'+DOT.cx+'" cy="'+DOT.cy+'" r="'+DOT.r+'" fill="'+dot+'"/></g>';
}
function grad(id,stops){
  return '<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1">'+stops+'</linearGradient>';
}

/* ==================================================================
   SPÅR A — LJUSET
   Photography is the ground, not an element. The system is annotated
   onto the architecture the way a section drawing is annotated.
   Type: Cormorant at monumental scale, Montserrat at 22–26 px.
   ================================================================== */
var A_IMG={a1:"living", a2:"kitchen", a3:"esLivAft"};
function a_base(key,o,fy){
  return slot(key,{x:0,y:0,w:1080,h:1920},{focal:{x:.5,y:(o&&o.fy!=null?o.fy:fy||.5)},zoom:(o&&o.zoom)||1.02});
}
function A1(o){
  o=o||{}; var key=o.img||A_IMG.a1;
  var g='<defs>'+grad("a1s",'<stop offset="0" stop-color="#0B0B0A" stop-opacity=".62"/>'
    +'<stop offset=".30" stop-color="#0B0B0A" stop-opacity=".10"/>'
    +'<stop offset=".56" stop-color="#0B0B0A" stop-opacity=".42"/>'
    +'<stop offset="1" stop-color="#0B0B0A" stop-opacity=".93"/>')+'</defs>';
  g+=a_base(key,o,.38)+'<rect width="1080" height="1920" fill="url(#a1s)"/>';
  /* the annotation spine: everything this one property becomes */
  var items=["FOTO","PLANRITNING","3D","E-STYLING","MOTION","ANNONS","KAMPANJ"];
  var sx=946, y0=436, step=62;
  g+='<line x1="'+sx+'" y1="'+(y0-30)+'" x2="'+sx+'" y2="'+(y0+step*6+16)+'" stroke="#C9CDBF" stroke-opacity=".55" stroke-width="1.5"/>';
  items.forEach(function(t,i){
    var y=y0+i*step;
    g+='<line x1="'+(sx-14)+'" y1="'+y+'" x2="'+sx+'" y2="'+y+'" stroke="#C9CDBF" stroke-opacity=".55" stroke-width="1.5"/>'
     +T(sx-26,y+7,t,MO+' font-weight="500"',23,"#EDEAE3",'letter-spacing="3.2" text-anchor="end"');
  });
  g+='<circle cx="'+sx+'" cy="'+(y0+step*6+16)+'" r="6" fill="#96A084"/>';
  g+=T(CL,300,"01 — VIEWLY",MO+' font-weight="500"',25,"#96A084",'letter-spacing="7"');
  g+=T(CL,1236,"Ett objekt.",CO+' font-weight="300"',150,"#F6F4EF");
  g+=T(CL,1372,"Sju leveranser.",CO+' font-weight="300" font-style="italic"',150,"#96A084");
  g+='<line x1="'+CL+'" y1="1444" x2="300" y2="1444" stroke="#C9CDBF" stroke-opacity=".6" stroke-width="2"/>';
  g+=T(CL,1512,"Fotograferingen är första lagret,",MO+' font-weight="400"',29,"#D6D3CB");
  g+=T(CL,1556,"inte hela arbetet.",MO+' font-weight="400"',29,"#D6D3CB");
  g+=mark(CR,1500,34,"#F6F4EF","#96A084");
  return g;
}
function A2(o){
  o=o||{}; var key=o.img||A_IMG.a2;
  var g='<defs>'+grad("a2s",'<stop offset="0" stop-color="#0B0B0A" stop-opacity=".70"/>'
    +'<stop offset=".34" stop-color="#0B0B0A" stop-opacity=".14"/>'
    +'<stop offset="1" stop-color="#0B0B0A" stop-opacity=".90"/>')+'</defs>';
  g+=a_base(key,o,.46)+'<rect width="1080" height="1920" fill="url(#a2s)"/>';
  /* a section marker down the left edge: the property read as levels */
  var lv=[["BOKA","2 min"],["PRODUKTION","på plats"],["LEVERANS","portalen"],
          ["ANNONS","utkast klart"],["SOCIAL","fyra format"]];
  var lx=CL+6, y0=520, step=152;
  g+='<line x1="'+lx+'" y1="'+(y0-56)+'" x2="'+lx+'" y2="'+(y0+step*4+70)+'" stroke="#96A084" stroke-width="2"/>';
  lv.forEach(function(l,i){
    var y=y0+i*step;
    g+='<line x1="'+lx+'" y1="'+y+'" x2="'+(lx+46)+'" y2="'+y+'" stroke="#96A084" stroke-width="2"/>'
     +'<circle cx="'+lx+'" cy="'+y+'" r="7" fill="#96A084"/>'
     +T(lx+64,y-6,l[0],MO+' font-weight="600"',30,"#F6F4EF",'letter-spacing="3"')
     +T(lx+64,y+30,l[1],MO+' font-weight="400"',24,"#B9B6AE",'letter-spacing="1"');
  });
  g+=T(CL,300,"02 — FÖR MÄKLARE",MO+' font-weight="500"',25,"#96A084",'letter-spacing="7"');
  g+=T(CL,404,"Ett flöde",CO+' font-weight="300"',124,"#F6F4EF");
  g+=T(CR,1420,"Fem leverantörer blir",MO+' font-weight="400"',30,"#D6D3CB",'text-anchor="end"');
  g+=T(CR,1500,"en kontaktyta.",CO+' font-weight="300" font-style="italic"',86,"#F6F4EF",'text-anchor="end"');
  g+=mark(CR,300,34,"#F6F4EF","#96A084");
  return g;
}
function A3(o){
  o=o||{}; var key=o.img||A_IMG.a3;
  var g='<defs>'+grad("a3s",'<stop offset="0" stop-color="#0B0B0A" stop-opacity=".58"/>'
    +'<stop offset=".26" stop-color="#0B0B0A" stop-opacity=".06"/>'
    +'<stop offset=".54" stop-color="#0B0B0A" stop-opacity=".50"/>'
    +'<stop offset="1" stop-color="#0B0B0A" stop-opacity=".95"/>')+'</defs>';
  g+=a_base(key,o,.44)+'<rect width="1080" height="1920" fill="url(#a3s)"/>';
  /* leader lines pinned to what the camera actually saw */
  /* pin positions belong to the editable layer — they are set per image
     in the Studio so the annotation always lands on a real feature. */
  var pins=(o.pins)||[[742,556,946,470,"SÖDERLÄGE","end"],
                      [372,432,150,368,"3,4 M TAKHÖJD","start"],
                      [512,1108,908,1046,"EKPARKETT","end"]];
  pins.forEach(function(p){
    g+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="7" fill="none" stroke="#96A084" stroke-width="2"/>'
     +'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2.5" fill="#96A084"/>'
     +'<path d="M '+p[0]+' '+p[1]+' L '+(p[0]+(p[2]>p[0]?60:-60))+' '+(p[1]+(p[3]>p[1]?60*TAN:-60*TAN))
       +' L '+p[2]+' '+p[3]+'" fill="none" stroke="#96A084" stroke-width="1.5" stroke-opacity=".8"/>'
     +T(p[2]+(p[5]==="end"?6:-6),p[3]-12,p[4],MO+' font-weight="600"',26,"#F6F4EF",
        'letter-spacing="3" text-anchor="'+p[5]+'"');
  });
  g+=T(CL,300,"03 — VERKTYG · ANNONSSKRIVAREN",MO+' font-weight="500"',25,"#96A084",'letter-spacing="6"');
  g+='<line x1="'+CL+'" y1="1180" x2="'+CR+'" y2="1180" stroke="#96A084" stroke-opacity=".5" stroke-width="1.5"/>';
  g+=T(CL,1252,"KAMERAN SÅG DET. TEXTEN SÄGER DET.",MO+' font-weight="600"',24,"#96A084",'letter-spacing="4"');
  [["Söderläget gör sig påmint redan i hallen och",0],
   ["håller kvar ljuset till sen eftermiddag. Ekparketten",0],
   ["löper obruten under 3,4 meter takhöjd.",1]].forEach(function(l,i){
    g+=T(CL,1340+i*62,l[0],CO+' font-weight="300"'+(l[1]?' font-style="italic"':''),50,l[1]?"#96A084":"#F6F4EF");
  });
  g+=mark(CR,1520,34,"#F6F4EF","#96A084");
  return g;
}

/* ==================================================================
   SPÅR B — SVART TAVLA
   No photography, no paper, no serif display. The information is
   rendered at poster scale and the scale contrast is the argument.
   ================================================================== */
var BBG="#0E0E0D", BFG="#F2EFEA", BOL="#98A184", BDIM="#4A4A46";
function B1(){
  var g='<rect width="1080" height="1920" fill="'+BBG+'"/>';
  /* one monumental numeral, bleeding off the corner — the payoff, not a pair */
  g+=T(1240,1900,"7",MO+' font-weight="600"',980,BFG,'text-anchor="end"');
  var items=["FOTO","PLANRITNING","3D","E-STYLING","MOTION","ANNONS","KAMPANJ"];
  var y0=846, step=78;
  items.forEach(function(t,i){
    var y=y0+i*step, x=CL+i*20;
    g+=T(x,y,t,MO+' font-weight="600"',i===6?50:36,i===6?BFG:"#8E8C85",'letter-spacing="'+(i===6?4:3)+'"');
  });
  g+='<line x1="-40" y1="'+(y0-50)+'" x2="560" y2="'+(y0-50)+'" stroke="'+BOL+'" stroke-width="3"/>';
  g+=T(CL,300,"01 — VIEWLY",MO+' font-weight="500"',25,BOL,'letter-spacing="7"');
  g+=T(CL,506,"ETT OBJEKT",MO+' font-weight="600"',104,BFG,'letter-spacing="-1.5"');
  g+=T(CL,624,"BLIR SJU.",MO+' font-weight="600"',104,BOL,'letter-spacing="-1.5"');
  g+=T(CL,1490,"Samma bostad, sju gånger",CO+' font-weight="300" font-style="italic"',54,"#C9C6BE");
  g+=T(CL,1556,"om — en enda produktion.",CO+' font-weight="300" font-style="italic"',54,"#C9C6BE");
  g+=mark(CR,300,34,BFG,BOL);
  return g;
}
function B2(){
  var g='<rect width="1080" height="1920" fill="'+BBG+'"/>';
  /* five ragged bars, then one — the bars are the whole graphic */
  var bars=[[-60,700],[120,560],[-20,880],[260,640],[80,760]];
  bars.forEach(function(b,i){
    var y=706+i*84;
    g+='<rect x="'+b[0]+'" y="'+y+'" width="'+b[1]+'" height="34" fill="'+BDIM+'"/>';
  });
  g+='<rect x="-60" y="1178" width="1200" height="58" fill="'+BOL+'"/>';
  var st=["BOKA","PRODUKTION","LEVERANS","ANNONS","SOCIAL"];
  st.forEach(function(t,i){
    var x=CL+i*((CR-CL)/4);
    g+='<rect x="'+(x-2)+'" y="1178" width="4" height="58" fill="'+BBG+'" opacity=".45"/>'
     +T(x,1290,t,MO+' font-weight="600"',21,"#B9B6AE",'letter-spacing="2.5" text-anchor="'
       +(i===0?"start":i===4?"end":"middle")+'"');
  });
  g+=T(CL,300,"02 — FÖR MÄKLARE",MO+' font-weight="500"',25,BOL,'letter-spacing="7"');
  g+=T(CL,470,"FEM",MO+' font-weight="600"',188,"#5A5954",'letter-spacing="-4"');
  g+=T(CL,624,"BLIR ETT.",MO+' font-weight="600"',188,BFG,'letter-spacing="-4"');
  g+=T(CL,1420,"Fem fakturor, fem tidplaner, fem",MO+' font-weight="400"',30,"#8E8C85");
  g+=T(CL,1464,"kontaktpersoner — eller en bokning.",MO+' font-weight="400"',30,"#8E8C85");
  g+=T(CL,1560,"Ett objekt. En kontaktyta.",CO+' font-weight="300" font-style="italic"',54,BFG);
  g+=mark(CR,300,34,BFG,BOL);
  return g;
}
function B3(){
  var g='<rect width="1080" height="1920" fill="'+BBG+'"/>';
  /* raw data is loud and structural; the language it produces is quiet */
  g+=T(CL,300,"03 — VERKTYG · ANNONSSKRIVAREN",MO+' font-weight="500"',25,BOL,'letter-spacing="6"');
  g+=T(CL,412,"DATA BLIR SPRÅK.",MO+' font-weight="600"',84,BFG,'letter-spacing="-1.5"');
  g+=T(CL-26,880,"78",MO+' font-weight="600"',470,BFG,'letter-spacing="-16"');
  g+=T(762,712,"M²",MO+' font-weight="600"',78,BOL,'letter-spacing="2"');
  g+=T(762,822,"1948",MO+' font-weight="600"',78,"#5A5954",'letter-spacing="1"');
  g+=T(CL,1046,"SÖDER",MO+' font-weight="600"',162,BOL,'letter-spacing="-2"');
  g+=T(CL,1168,"3 ROK",MO+' font-weight="600"',100,"#5A5954",'letter-spacing="-1"');
  g+=T(640,1168,"EKPARKETT",MO+' font-weight="600"',48,"#5A5954",'letter-spacing="1"');
  g+='<line x1="-40" y1="1250" x2="1120" y2="1250" stroke="'+BOL+'" stroke-width="3"/>';
  g+=T(CL,1320,"78 M² SÄGER HUR STORT.",MO+' font-weight="600"',24,BOL,'letter-spacing="4"');
  [["Söderläget säger hur det känns klockan",0],
   ["fyra en tisdag i mars. Annonsskrivaren",0],
   ["använder båda.",1]].forEach(function(l,i){
    g+=T(CL,1420+i*68,l[0],CO+' font-weight="300"'+(l[1]?' font-style="italic"':''),56,l[1]?BOL:BFG);
  });
  g+=mark(CR,300,34,BFG,BOL);
  return g;
}

/* ==================================================================
   SPÅR C — PRODUKTYTA
   Near-white ground, hard charcoal and olive fields, layered image
   tiles, type crossing the boundary between two grounds.
   ================================================================== */
var CBG="#F7F6F3", CINK="#141416", COL="#6E7266";
function C1(o){
  o=o||{};
  var g='<rect width="1080" height="1920" fill="'+CBG+'"/>';
  /* cinematic band bleeding full width, charcoal field beneath */
  g+=slot(o.img||"living",{x:-40,y:-60,w:1160,h:900},{focal:{x:.5,y:(o.fy!=null?o.fy:.44)},zoom:(o.zoom||1.04)});
  g+='<path d="M 0 840 L 1080 '+(840-1080/TAN*0.34)+' L 1080 1920 L 0 1920 Z" fill="'+CINK+'"/>';
  /* the spectrum: one bar, seven segments, the whole system in one form */
  var segs=["FOTO","PLAN","3D","STIL","MOTION","ANNONS","KAMPANJ"];
  var bx=CL, bw=CR-CL, sw=bw/segs.length, by=1130;
  segs.forEach(function(t,i){
    g+='<rect x="'+(bx+i*sw)+'" y="'+by+'" width="'+(sw-5)+'" height="72" fill="'+(i===6?COL:"#2E2E2B")+'"/>'
     +T(bx+i*sw+(sw-5)/2,by+118,t,MO+' font-weight="600"',17,i===6?COL:"#7E7C76",'letter-spacing="1.5" text-anchor="middle"');
  });
  /* headline crosses the hard boundary between image and field */
  g+=T(CL,880,"ETT OBJEKT.",MO+' font-weight="600"',104,"#F7F6F3",'letter-spacing="-2"');
  g+=T(CL,1000,"SJU LEVERANSER.",MO+' font-weight="600"',104,COL,'letter-spacing="-2"');
  g+=T(CL,300,"01 — VIEWLY",MO+' font-weight="500"',25,"#F7F6F3",'letter-spacing="7"');
  g+=T(CL,1380,"En bokning startar hela kedjan.",CO+' font-weight="300"',54,"#EDEBE6");
  g+=T(CL,1444,"Du får tillbaka en färdig presentation —",CO+' font-weight="300"',54,"#9C9A94");
  g+=T(CL,1508,"inte en mapp med filer.",CO+' font-weight="300"',54,"#9C9A94");
  g+=mark(CR,300,34,"#F7F6F3",COL);
  return g;
}
function C2(o){
  o=o||{};
  var g='<rect width="1080" height="1920" fill="'+CBG+'"/>';
  /* charcoal column left, image right — both bleed */
  g+='<rect x="-40" y="-40" width="470" height="2000" fill="'+CINK+'"/>';
  g+=slot(o.img||"kitchen",{x:430,y:-40,w:690,h:2000},{focal:{x:(o.fx!=null?o.fx:.58),y:(o.fy!=null?o.fy:.46)},zoom:(o.zoom||1.02)});
  g+='<path d="M 430 1180 L 1120 '+(1180-690/TAN)+' L 1120 1960 L 430 1960 Z" fill="'+CINK+'" opacity=".82"/>';
  var sup=["FOTOGRAF","STYLIST","FILMARE","PLANRITNING","ANNONSBYRÅ"];
  sup.forEach(function(s,i){
    var y=560+i*54;
    g+='<rect x="'+CL+'" y="'+(y-13)+'" width="'+(14+i*9)+'" height="3" fill="#5A5954"/>'
     +T(CL+34+i*9,y,s,MO+' font-weight="500"',22,"#7E7C76",'letter-spacing="2"');
  });
  g+=T(CL,300,"02 — FÖR MÄKLARE",MO+' font-weight="500"',24,COL,'letter-spacing="6"');
  g+=T(CL,470,"IDAG",MO+' font-weight="600"',34,"#5A5954",'letter-spacing="6"');
  g+='<rect x="'+CL+'" y="900" width="240" height="4" fill="'+COL+'"/>';
  g+=T(CL,976,"MED",MO+' font-weight="600"',34,COL,'letter-spacing="6"');
  g+=T(CL,1064,"VIEWLY",MO+' font-weight="600"',72,"#F7F6F3",'letter-spacing="-1"');
  ["En bokning.","En portal.","En leverans."].forEach(function(t,i){
    g+=T(CL,1160+i*56,t,CO+' font-weight="300"',48,"#C6C4BE");
  });
  g+=T(470,1420,"Fem leverantörer blir",MO+' font-weight="500"',30,"#D6D3CB");
  g+=T(470,1512,"ett flöde.",CO+' font-weight="300" font-style="italic"',92,"#F7F6F3");
  g+=mark(CR,300,34,"#F7F6F3",COL);
  return g;
}
function C3(o){
  o=o||{};
  var g='<rect width="1080" height="1920" fill="'+CBG+'"/>';
  /* layered surfaces: image tile, output panel, data pills on top */
  g+='<rect x="-40" y="-40" width="1160" height="700" fill="'+CINK+'"/>';
  g+=slot(o.img||"dining",{x:520,y:-40,w:600,h:700},{focal:{x:.5,y:(o.fy!=null?o.fy:.5)},zoom:(o.zoom||1.05)});
  g+=T(CL,300,"03 — VERKTYG",MO+' font-weight="500"',24,COL,'letter-spacing="6"');
  g+=T(CL,438,"ANNONS-",MO+' font-weight="600"',96,"#F7F6F3",'letter-spacing="-2"');
  g+=T(CL,536,"SKRIVAREN",MO+' font-weight="600"',96,COL,'letter-spacing="-2"');
  /* the output surface overlaps the image field */
  g+='<rect x="'+CL+'" y="596" width="'+(CR-CL)+'" height="596" fill="#FFFFFF"/>';
  g+='<rect x="'+CL+'" y="596" width="'+(CR-CL)+'" height="8" fill="'+COL+'"/>';
  var pills=["SÖDERLÄGE","EKPARKETT","3,4 M","78 M²"];
  var px=CL+34;
  pills.forEach(function(p){
    var w=p.length*13.4+34;
    g+='<rect x="'+px+'" y="654" width="'+w+'" height="44" fill="'+COL+'"/>'
     +T(px+17,684,p,MO+' font-weight="600"',18,"#FFFFFF",'letter-spacing="1.8"');
    px+=w+10;
  });
  g+=T(CL+34,790,"Ljuset som blir kvar",CO+' font-weight="300"',62,CINK);
  [["Söderläget gör sig påmint redan i hallen",1],
   ["och håller kvar ljuset till sen eftermiddag.",1],
   ["Ekparketten löper obruten under 3,4 meter",0],
   ["takhöjd, genom hela sällskapsytan.",0]].forEach(function(l,i){
    g+=T(CL+34,866+i*50,l[0],CO+' font-weight="300"',40,l[1]?"#3A3A36":"#8E8C85");
  });
  g+='<line x1="'+(CL+34)+'" y1="1104" x2="'+(CR-34)+'" y2="1104" stroke="#DCD9D2" stroke-width="1"/>';
  g+=T(CL+34,1154,"FYRA FÄLT · 4 SEKUNDER",MO+' font-weight="600"',19,COL,'letter-spacing="4"');
  g+=T(CL,1300,"78 m² säger hur stort.",MO+' font-weight="600"',44,CINK);
  g+=T(CL,1366,"Söderläget säger hur det känns.",MO+' font-weight="600"',44,COL);
  g+=T(CL,1462,"Annonsskrivaren använder objektets fakta,",CO+' font-weight="300"',44,"#5A5954");
  g+=T(CL,1516,"bilder och område för att bygga berättelsen.",CO+' font-weight="300"',44,"#5A5954");
  g+=mark(CR,300,34,"#F7F6F3",COL);
  return g;
}

var TRACKS={
 A:{id:"A",name:"LJUSET",tag:"Editorial · arkitektonisk",
    ground:"Fotografiet ÄR sidan",
    desc:"Bilden är grunden, inte ett element. Systemet annoteras på arkitekturen som i en sektionsritning. Cormorant i monumental grad mot 23 px Montserrat — hela skalregistret i en komposition.",
    pal:[["#0B0B0A","Scrim"],["#F6F4EF","Ljus"],["#96A084","Oliv lyft"],["#D6D3CB","Meta"]],
    sys:[["Typografi","Cormorant 300 i 86–150 px som display. Montserrat 500 i 23–30 px som annotation. Inget däremellan."],
         ["Grid","Ingen kolumn. Kompositionen hängs på fotografiets egna linjer."],
         ["Fotografi","Full bleed, alltid. Scrim i tre steg så typografin alltid har ett underlag."],
         ["Mask","Sällsynt. Bilden beskärs av canvasen, inte av former."],
         ["Illustration","Ledarlinjer och måttmarkeringar. Ritteknik, inte ikoner."],
         ["Informationsdesign","Data pinnas på det kameran faktiskt såg."],
         ["Geometri","58° används i ledarlinjernas knä."],
         ["Motion","Långsam push-in i bilden; annotationerna ritas upp i sekvens."],
         ["Whitespace","Fotografiets egna lugna ytor. Aldrig tomt papper."],
         ["Kontrast","Extrem: 150 px serif mot 23 px versaler."]],
    lay:[["LÅST","Scrim-gradienter, annotationsspinens geometri, typskala"],
         ["REDIGERBAR","Fotografiet, rubrik, annotationstexter, brödtext"],
         ["DYNAMISK","Antal annotationer (3–7), objektsdata"]],
    safe:"Fotografiet och scrimmen täcker hela canvasen och går bakom både topp- och bottengränssnittet. All text ligger 250–1600."},
 B:{id:"B",name:"SVART TAVLA",tag:"Grafisk · informationsdesign",
    ground:"Informationen ÄR grafiken",
    desc:"Inget fotografi, inget papper, ingen serif som display. Rådata sätts i affischskala — 430 px siffror — och språket viskar under. Skalkontrasten är hela argumentet.",
    pal:[["#0E0E0D","Grund"],["#F2EFEA","Ljus"],["#98A184","Oliv"],["#5A5954","Dämpad"]],
    sys:[["Typografi","Montserrat 600 som display i 82–430 px. Cormorant italic endast som mänsklig motröst."],
         ["Grid","Vänsterställd bas, medveten överflödning ur canvasen."],
         ["Fotografi","Används inte i detta spår."],
         ["Mask","Siffror och ord beskärs av canvaskanten som mask."],
         ["Illustration","Massiva staplar och regler. Aldrig hårlinjer."],
         ["Informationsdesign","Siffran är motivet. Etiketten är fotnoten."],
         ["Geometri","58° i diagonala steg mellan textnivåer."],
         ["Motion","Siffror räknas upp; staplar växer från vänster."],
         ["Whitespace","Svart yta som andrum, inte tomrum."],
         ["Kontrast","430 px mot 21 px i samma ram."]],
    lay:[["LÅST","Grund, typskala, stapelgeometri, överflödning"],
         ["REDIGERBAR","Alla siffror och etiketter, rubrik, brödtext"],
         ["DYNAMISK","Objektsdata driver siffrornas värden direkt"]],
    safe:"Siffrorna löper ut ur canvasen upptill och nedtill. Etiketter och brödtext ligger 250–1600."},
 C:{id:"C",name:"PRODUKTYTA",tag:"Produkt · cinematisk",
    ground:"Hårda ytor som lagras",
    desc:"Nästan vit grund mot hårda kolfält och olivsignal. Bild, fält och panel läggs i lager; rubriken korsar gränsen mellan två grunder. Registret hos ett samtida medieteknikbolag — utan dashboard-estetik.",
    pal:[["#F7F6F3","Grund"],["#141416","Fält"],["#6E7266","Signal"],["#FFFFFF","Panel"]],
    sys:[["Typografi","Montserrat 600 i 34–104 px som display, tight tracking. Cormorant för produktens egen prosa."],
         ["Grid","Hårda fält som bleed:ar. Rubriken får korsa fältgränsen."],
         ["Fotografi","Kaklade ytor och band. Alltid beskuret av ett fält, aldrig fritt."],
         ["Mask","Fältkanter i 58°. Bilden slutar där fältet slutar."],
         ["Illustration","Spektrumstaplar och solida pills. Inga linjeteckningar."],
         ["Informationsdesign","Systemet som en enda delad form, inte som noder."],
         ["Geometri","58° på varje fältkant."],
         ["Motion","Fält skjuts in från kanten; panelen lyfts.'"],
         ["Whitespace","Den vita panelen är vila mellan två mörka fält."],
         ["Kontrast","Solid mot solid. Färgfält bär hierarkin."]],
    lay:[["LÅST","Fältgeometri, 58°-kanter, panelposition, spektrumdelning"],
         ["REDIGERBAR","Bild i fältet, rubrik, pills, produktens prosa"],
         ["DYNAMISK","Objektsdata i pills, antal segment"]],
    safe:"Kolfält och bild går ut i alla fyra kanter och ligger bakom Instagrams UI. Panelen och all text ligger 250–1600."}
};
var STORIES={
 A:[{id:"A1",t:"Ekosystemet",f:A1,img:true},{id:"A2",t:"Ett sammanhängande flöde",f:A2,img:true},
    {id:"A3",t:"Annonsskrivaren",f:A3,img:true}],
 B:[{id:"B1",t:"Ekosystemet",f:B1},{id:"B2",t:"Ett sammanhängande flöde",f:B2},
    {id:"B3",t:"Annonsskrivaren",f:B3}],
 C:[{id:"C1",t:"Ekosystemet",f:C1,img:true},{id:"C2",t:"Ett sammanhängande flöde",f:C2,img:true},
    {id:"C3",t:"Annonsskrivaren",f:C3,img:true}]
};
