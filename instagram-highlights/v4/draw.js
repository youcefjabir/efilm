/* ====================================================================
   VIEWLY VISUAL COMMUNICATION SYSTEM — v4
   Two zones, not one:
     CANVAS   0–1080 × 0–1920   photography, masks, geometry, bleed
     CRITICAL 64–1016 × 250–1600 headline, copy, labels, data, CTA
   Brand angle 58.0° (measured, IoU 0.9925). tan = 1.6003.
   ==================================================================== */
var M = window.VMEDIA || {};
var GEO={viewBox:"0 0 858.6 756.3",
  limb:"M 0 16.4 L 206.7 16.4 Q 243.7 16.4 259.7 43.4 L 588 552.6 L 462.2 756.3 Z",
  dot:{cx:705.2,cy:153.4,r:153.4}, angle:58.0, iou:0.9925};
var TAN=1.6003;
var CV={W:1080,H:1920};
var CR={T:250,B:1600,L:64,R:1016};

var PAPER="#EFECE7", INK="#141416", INK2="#4A4843", MUT="#8E8A82",
    OLIVE="#6E7266", OLIVE_L="#A8AD9E", LINE="#D3CEC7", PANEL="#E4E0D9", FAINT="#C4BEB5";

function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var FS={k:'font-family="Montserrat" font-weight="500"',
        k6:'font-family="Montserrat" font-weight="600"',
        s:'font-family="Cormorant Garamond" font-weight="300"',
        si:'font-family="Cormorant Garamond" font-weight="300" font-style="italic"'};
function T(x,y,t,f,sz,fill,ex){
  return '<text x="'+x+'" y="'+y+'" '+f+' font-size="'+sz+'" fill="'+fill+'" '+(ex||'')+'>'+E(t)+'</text>';
}
function fitSize(lines,cap,adv,avail){
  var m=lines.reduce(function(a,l){
    return Math.max(a,String(l).split(/\s+/).reduce(function(b,w){return Math.max(b,w.length)},1))},1);
  return Math.min(cap, avail/(adv*m));
}
var SERIF=0.455, CAPS=0.66;

/* ---- MEDIA SLOT ---------------------------------------------------
   A slot is locked geometry (the mask) plus replaceable content.
   focal 0..1 picks the visible region; zoom ≥1 scales inside the mask.
   Layout never moves — only what is seen through it.               */
var AR={};                                  /* source aspect per key */
function srcAR(k){ return AR[k] || (/_h$/.test(k)? 1.4989 : 0.5625) }
function slot(key,box,opt){
  opt=opt||{};
  var focal=opt.focal||{x:.5,y:.5}, zoom=opt.zoom||1, id=opt.clip;
  var u=M[key];
  if(!u){
    return '<g'+(id?' clip-path="url(#'+id+')"':'')+'>'
      +'<rect x="'+box.x+'" y="'+box.y+'" width="'+box.w+'" height="'+box.h+'" fill="'+PANEL+'"/>'
      +T(box.x+box.w/2,box.y+box.h/2,"NEEDS ASSET",FS.k6,26,MUT,'letter-spacing="6" text-anchor="middle"')+'</g>';
  }
  var a=srcAR(key), sw, sh;
  if(box.w/box.h > a){ sw=box.w*zoom; sh=sw/a } else { sh=box.h*zoom; sw=sh*a }
  var x=box.x+(box.w-sw)*focal.x, y=box.y+(box.h-sh)*focal.y;
  return '<g'+(id?' clip-path="url(#'+id+')"':'')+'>'
    +'<image href="'+u+'" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+sw.toFixed(1)
    +'" height="'+sh.toFixed(1)+'" preserveAspectRatio="none"/></g>';
}
function wm(x,y,h,light){
  h=h||30; var w=h*(858.6/756.3);
  return '<g transform="translate('+(x-w)+','+y+') scale('+(h/756.3)+')">'
   +'<path d="'+GEO.limb+'" fill="'+(light?"#F4F2ED":INK)+'"/>'
   +'<circle cx="'+GEO.dot.cx+'" cy="'+GEO.dot.cy+'" r="'+GEO.dot.r+'" fill="'+(light?"#A8AD9E":OLIVE)+'"/></g>';
}
/* the object primitive, in seven states — the alphabet of the system */
function obj(state,x,y,w,h){
  var g='', cx=x+w, cy=y+h;
  function frame(f,st){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+(f||'none')
    +'" stroke="'+(st||INK)+'" stroke-width="3"/>' }
  if(state==="foto"){ g=frame(OLIVE,OLIVE) }
  else if(state==="plan"){
    g=frame()+'<line x1="'+(x+w*.6)+'" y1="'+y+'" x2="'+(x+w*.6)+'" y2="'+cy+'" stroke="'+INK+'" stroke-width="3"/>'
     +'<line x1="'+(x+w*.6)+'" y1="'+(y+h*.55)+'" x2="'+cx+'" y2="'+(y+h*.55)+'" stroke="'+INK+'" stroke-width="3"/>';
  }
  else if(state==="tred"){
    var d=w*.22;
    g='<path d="M '+x+' '+y+' L '+(x+d)+' '+(y-d*.62)+' L '+(cx+d)+' '+(y-d*.62)+' L '+cx+' '+y+' Z" fill="none" stroke="'+INK+'" stroke-width="3"/>'
     +'<path d="M '+cx+' '+y+' L '+(cx+d)+' '+(y-d*.62)+' L '+(cx+d)+' '+(cy-d*.62)+' L '+cx+' '+cy+' Z" fill="'+OLIVE+'" fill-opacity=".2" stroke="'+INK+'" stroke-width="3"/>'
     +frame();
  }
  else if(state==="stil"){
    g=frame()
     +'<rect x="'+(x+w*.08)+'" y="'+(y+h*.52)+'" width="'+(w*.38)+'" height="'+(h*.3)+'" fill="'+OLIVE+'"/>'
     +'<circle cx="'+(x+w*.74)+'" cy="'+(y+h*.36)+'" r="'+(h*.16)+'" fill="none" stroke="'+OLIVE+'" stroke-width="3"/>';
  }
  else if(state==="motion"){
    g='<rect x="'+(x+16)+'" y="'+(y+10)+'" width="'+w+'" height="'+h+'" fill="'+INK+'" opacity=".13"/>'
     +'<rect x="'+(x+8)+'" y="'+(y+5)+'" width="'+w+'" height="'+h+'" fill="'+INK+'" opacity=".26"/>'
     +frame(PAPER);
  }
  else if(state==="annons"){
    g=frame();
    for(var i=0;i<4;i++) g+='<line x1="'+(x+14)+'" y1="'+(y+18+i*16)+'" x2="'+(x+w-(i===3?46:14))+'" y2="'+(y+18+i*16)+'" stroke="'+INK+'" stroke-width="2.5"/>';
  }
  else if(state==="kampanj"){
    g='<rect x="'+x+'" y="'+y+'" width="'+(w*.42)+'" height="'+h+'" fill="none" stroke="'+INK+'" stroke-width="3"/>'
     +'<rect x="'+(x+w*.48)+'" y="'+(y+h*.16)+'" width="'+(w*.30)+'" height="'+(h*.68)+'" fill="'+OLIVE+'"/>'
     +'<rect x="'+(x+w*.84)+'" y="'+(y+h*.30)+'" width="'+(w*.22)+'" height="'+(h*.40)+'" fill="none" stroke="'+INK+'" stroke-width="3"/>';
  }
  return g;
}

/* ====================================================================
   PROTOTYPE A — VIEWLY / ECOSYSTEM
   Composition: a 58° system band bleeds corner to corner; the object
   primitive is restated seven times along it, each state visibly
   transformed. Type sits in the two counter-triangles, not stacked at
   the top. Nothing is a list; the reader sees the transformation.
   ==================================================================== */
function protoA(o){
  o=o||{};
  var g='<rect width="1080" height="1920" fill="'+PAPER+'"/>';
  /* CANVAS: the band runs off both corners */
  var x0=-210, y0=-40, bw=250;
  function bx(y){ return x0+(y-y0)/TAN }
  g+='<path d="M '+(bx(-60)-bw)+' -60 L '+(bx(-60)+bw)+' -60 L '+(bx(1980)+bw)+' 1980 L '+(bx(1980)-bw)+' 1980 Z" '
    +'fill="'+OLIVE+'" fill-opacity=".085"/>';
  g+='<line x1="'+bx(-60)+'" y1="-60" x2="'+bx(1980)+'" y2="1980" stroke="'+OLIVE+'" stroke-width="2" stroke-opacity=".5"/>';

  var states=[["foto","FOTO"],["plan","PLANRITNING"],["tred","3D"],["stil","E-STYLING"],
              ["motion","MOTION"],["annons","ANNONS"],["kampanj","KAMPANJ"]];
  var yA=560, step=124, w=138, h=98;
  states.forEach(function(s,i){
    var y=yA+i*step, cx=bx(y);
    g+=obj(s[0], cx-w/2, y-h/2, w, h);
    g+=T(cx+w/2+56, y+11, s[1], FS.k, 30, INK, 'letter-spacing="5"');
    if(i<states.length-1){
      var ny=yA+(i+1)*step;
      g+='<circle cx="'+bx(y+step/2)+'" cy="'+(y+step/2)+'" r="4" fill="'+OLIVE+'"/>';
    }
  });
  /* CRITICAL: top-right counter-triangle */
  g+=T(CR.R,300,"01 — VIEWLY",FS.k,26,OLIVE,'letter-spacing="7" text-anchor="end"');
  var t1=["Ett objekt."], s1=fitSize(t1,132,SERIF,600);
  g+=T(CR.R,470,t1[0],FS.s,s1,INK,'text-anchor="end"');
  g+='<line x1="'+(CR.R-150)+'" y1="512" x2="'+CR.R+'" y2="512" stroke="'+OLIVE+'" stroke-width="2"/>';
  /* CRITICAL: bottom-left counter-triangle */
  var t2=["Hela","presentationen."], s2=fitSize(t2,112,SERIF,560);
  g+=T(CR.L,1424,t2[0],FS.s,s2,INK)+T(CR.L,1424+s2*1.02,t2[1],FS.s,s2,INK);
  g+=T(CR.L,1572,"Sju tillstånd. Ett material.",FS.si,44,OLIVE);
  g+=wm(CR.R,1520,30);
  return g;
}

/* ====================================================================
   PROTOTYPE B — FÖR MÄKLARE / FRAGMENTED → WHOLE
   The photograph carries the argument. One image, torn into five
   misaligned slabs, then restated whole. Media is a slot: replacing
   the photograph updates both states and the layout does not move.
   ==================================================================== */
function protoB(o){
  o=o||{};
  var key=o.img||"kitchen", focal=o.focal||{x:.5,y:.44}, zoom=o.zoom||1.06;
  var g='<rect width="1080" height="1920" fill="'+PAPER+'"/>';
  var defs='';
  var labs=["FOTOGRAF","STYLIST","FILMARE","PLANRITNING","ANNONS"];
  var off=[0,86,34,124,52], n=5, gap=16, sw=(1080-gap*(n-1))/n;
  /* CANVAS: slabs bleed off the top edge */
  for(var i=0;i<n;i++){
    var sx=i*(sw+gap), top=-70+off[i], bot=812+off[i]*.5;
    defs+='<clipPath id="sl'+i+'"><rect x="'+sx+'" y="'+top+'" width="'+sw+'" height="'+(bot-top)+'"/></clipPath>';
    g+=slot(key,{x:-40,y:-90,w:1160,h:1010},{focal:focal,zoom:zoom,clip:"sl"+i});
    g+=T(sx+6,bot+40,labs[i],FS.k6,20,MUT,'letter-spacing="2.5"');
  }
  /* CRITICAL: the argument sits between the two states, not on top */
  g+=T(CR.L,986,"02 — FÖR MÄKLARE",FS.k,26,OLIVE,'letter-spacing="7"');
  var t=["Fem leverantörer.","Ett flöde."], sz=fitSize(t,104,SERIF,CR.R-CR.L);
  g+=T(CR.L,1102,t[0],FS.s,sz,INK)+T(CR.L,1102+sz*1.02,t[1],FS.s,sz,INK);
  /* CANVAS: the same photograph, whole, bleeding off both sides and the base */
  defs+='<clipPath id="band"><rect x="-20" y="1290" width="1120" height="520"/></clipPath>'
     +'<linearGradient id="bs" x1="0" y1="0" x2="0" y2="1">'
     +'<stop offset="0" stop-color="#0C0C0B" stop-opacity=".18"/>'
     +'<stop offset=".55" stop-color="#0C0C0B" stop-opacity=".62"/>'
     +'<stop offset="1" stop-color="#0C0C0B" stop-opacity=".78"/></linearGradient>';
  g+=slot(key,{x:-20,y:1180,w:1120,h:740},{focal:focal,zoom:zoom,clip:"band"});
  g+='<rect x="-20" y="1290" width="1120" height="520" fill="url(#bs)" clip-path="url(#band)"/>';
  /* CRITICAL: the process, read directly off the photograph */
  var st=["BOKA","PRODUKTION","LEVERANS","ANNONS","SOCIAL"], ly=1418;
  g+='<line x1="'+CR.L+'" y1="'+ly+'" x2="'+CR.R+'" y2="'+ly+'" stroke="#C9CDBF" stroke-width="2.5"/>';
  st.forEach(function(t2,i){
    var x=CR.L+i*((CR.R-CR.L)/(st.length-1));
    g+='<circle cx="'+x+'" cy="'+ly+'" r="8" fill="#C9CDBF"/>'
     +T(x,ly+52,t2,FS.k6,21,"#F4F2ED",'letter-spacing="2.5" text-anchor="'
       +(i===0?"start":i===st.length-1?"end":"middle")+'"');
  });
  g+=T(CR.L,1560,"Ett objekt. En kontaktyta.",FS.si,44,"#C9CDBF");
  g+=wm(CR.R,1520,30,true);
  return '<defs>'+defs+'</defs>'+g;
}

/* ====================================================================
   PROTOTYPE C — VERKTYG / ANNONSSKRIVAREN
   You watch the product work: six data fields enter, three of them
   surface as phrases in the finished prose, connected at 58°.
   The mapping is the information design — no boxes, no arrows.
   ==================================================================== */
function protoC(o){
  o=o||{};
  var g='<rect width="1080" height="1920" fill="'+PAPER+'"/>';
  var GX=364;                              /* prose column */
  /* CANVAS: the output panel bleeds off the right edge, cut at 58° */
  g+='<path d="M '+(GX-46)+' 762 L 966 762 L 1140 '+(762+174*TAN)+' L 1140 1980 L '+(GX-46)+' 1980 Z" '
    +'fill="'+PANEL+'"/>';
  /* the field column rules run off the left edge */
  g+='<line x1="-40" y1="586" x2="236" y2="586" stroke="'+FAINT+'" stroke-width="1"/>';

  g+=T(CR.L,300,"03 — VERKTYG · ANNONSSKRIVAREN",FS.k,26,OLIVE,'letter-spacing="7"');
  g+=T(CR.L,470,"Data blir språk.",FS.s,fitSize(["Data blir språk."],124,SERIF,CR.R-CR.L),INK);

  /* LEFT: the six fields that come out of the object */
  var fields=[["SÖDERLÄGE",1],["EKPARKETT",1],["TAKHÖJD 3,4 M",1],
              ["78 M²",0],["1948",0],["3 ROK",0]];
  g+=T(CR.L,624,"OBJEKTSDATA",FS.k6,20,MUT,'letter-spacing="5"');
  var fy0=690, fstep=58, edge=236, pos={};
  fields.forEach(function(f,i){
    var y=fy0+i*fstep;
    g+=T(edge,y,f[0],FS.k6,22,f[1]?OLIVE:MUT,'letter-spacing="2.5" text-anchor="end"');
    g+='<circle cx="'+(edge+16)+'" cy="'+(y-7)+'" r="'+(f[1]?5:3)+'" fill="'+(f[1]?OLIVE:FAINT)+'"/>';
    if(f[1]) pos[f[0]]={x:edge+16,y:y-7};
  });
  g+='<line x1="-40" y1="'+(fy0+5*fstep+34)+'" x2="'+edge+'" y2="'+(fy0+5*fstep+34)+'" stroke="'+FAINT+'" stroke-width="1"/>';
  g+=T(edge,fy0+5*fstep+76,"SEX FÄLT",FS.k,19,MUT,'letter-spacing="4" text-anchor="end"');

  /* RIGHT: the prose. Highlighted phrases begin their line so the 58°
     connectors land exactly, at any type size. */
  var para=[["Söderläget"," gör sig påmint redan"],
            [null,"i hallen och håller kvar ljuset"],
            [null,"till sen eftermiddag."],
            ["Ekparketten"," löper obruten genom"],
            [null,"de öppna sällskapsytorna."],
            ["Takhöjden"," ger rummet en stillhet"],
            [null,"som är ovanlig för årgången."]];
  var map={"Söderläget":"SÖDERLÄGE","Ekparketten":"EKPARKETT","Takhöjden":"TAKHÖJD 3,4 M"};
  var py=828, lh=70, psz=44, gut=[278,300,322], gi=0;
  para.forEach(function(l,i){
    var y=py+i*lh;
    if(l[0]){
      g+='<text x="'+GX+'" y="'+y+'" '+FS.s+' font-size="'+psz+'" fill="'+INK+'">'
        +'<tspan fill="'+OLIVE+'">'+E(l[0])+'</tspan>'+E(l[1])+'</text>';
      var a=pos[map[l[0]]], gx=gut[gi++], ty=y-14, drop=(GX-gx)*TAN;
      /* stub right, run down the gutter, enter at exactly 58° */
      g+='<path d="M '+a.x+' '+a.y+' L '+gx+' '+a.y+' L '+gx+' '+(ty-drop)+' L '+GX+' '+ty+'" '
        +'fill="none" stroke="'+OLIVE+'" stroke-width="2" stroke-opacity=".6"/>';
      g+='<circle cx="'+GX+'" cy="'+ty+'" r="4.5" fill="'+OLIVE+'"/>';
    } else {
      g+=T(GX,y,l[1],FS.s,psz,INK2);
    }
  });

  /* the tool adapts tone — new information, and it earns the lower third */
  g+='<line x1="-40" y1="1306" x2="'+CR.R+'" y2="1306" stroke="'+FAINT+'" stroke-width="1"/>';
  g+=T(CR.L,1366,"SAMMA FÄLT · ANNAN TON",FS.k6,20,OLIVE,'letter-spacing="5"');
  g+=T(CR.L,1452,"Ljuset i söder är husets tydligaste",FS.si,46,INK2);
  g+=T(CR.L,1514,"tillgång — och det märks hela dagen.",FS.si,46,INK2);
  g+=wm(CR.R,300,30);
  return g;
}

var PROTO={a:protoA,b:protoB,c:protoC};
