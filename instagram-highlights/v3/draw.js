/* ====================================================================
   VIEWLY STORY SYSTEM — drawing library
   Every frame is SVG at 1080 × 1920, the real production canvas.
   Every diagonal is 58.0°, the measured brand angle (IoU 0.9925).
   ==================================================================== */
var M = window.VMEDIA || {};

var GEO={
  viewBox:"0 0 858.6 756.3",
  limb:"M 0 16.4 L 206.7 16.4 Q 243.7 16.4 259.7 43.4 L 588 552.6 L 462.2 756.3 Z",
  dot:{cx:705.2,cy:153.4,r:153.4}, angle:58.0, iou:0.9925
};
var TAN=1.6003;                              /* tan 58.0° */
var SA={W:1080,H:1920,TOP:250,BOT:320,SIDE:64};
SA.bot=SA.H-SA.BOT; SA.L=SA.SIDE; SA.R=SA.W-SA.SIDE; SA.mid=SA.W/2;

var PAPER="#EFECE7", INK="#141416", INK2="#4A4843", MUT="#8E8A82",
    OLIVE="#6E7266", LINE="#D3CEC7", PANEL="#E4E0D9", FAINT="#C4BEB5";

function esc2(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var FS={
  k :'font-family="Montserrat" font-weight="500"',
  k6:'font-family="Montserrat" font-weight="600"',
  s :'font-family="Cormorant Garamond" font-weight="300"',
  si:'font-family="Cormorant Garamond" font-weight="300" font-style="italic"'
};
function TX(x,y,t,f,sz,fill,ex){
  return '<text x="'+x+'" y="'+y+'" '+f+' font-size="'+sz+'" fill="'+fill+'" '+(ex||'')+'>'+esc2(t)+'</text>';
}
/* display type is sized from the longest word so a Swedish compound never clips */
function fit(t,cap,adv,pad){
  var w=1080-2*(pad==null?SA.SIDE:pad);
  var m=String(t||"").split(/\s+/).reduce(function(a,x){return Math.max(a,x.length)},1);
  return Math.min(cap, w/(adv*m));
}
var SERIF=0.455, CAPS=0.66;
function disp(x,y,lines,cap,fill,lead){
  var sz=lines.reduce(function(a,l){return Math.min(a,fit(l,cap||98,SERIF))},999);
  lead=lead||(sz*1.04);
  return lines.map(function(l,i){return TX(x,y+i*lead,l,FS.s,sz,fill||INK)}).join("");
}
function kick(t,x,y){ return TX(x||SA.L,y||300,t,FS.k,26,OLIVE,'letter-spacing="7"') }
function wm(x,y,h){
  h=h||30; var w=h*(858.6/756.3);
  return '<g transform="translate('+(x-w)+','+y+') scale('+(h/756.3)+')">'
   +'<path d="'+GEO.limb+'" fill="'+INK+'"/>'
   +'<circle cx="'+GEO.dot.cx+'" cy="'+GEO.dot.cy+'" r="'+GEO.dot.r+'" fill="'+OLIVE+'"/></g>';
}
function base(inner,bg){ return '<rect width="1080" height="1920" fill="'+(bg||PAPER)+'"/>'+inner }
function img(k,x,y,w,h,cl){
  var u=M[k];
  if(!u) return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+PANEL+'"/>'
    +TX(x+w/2,y+h/2,"NEEDS ASSET",FS.k6,26,MUT,'letter-spacing="6" text-anchor="middle"');
  return '<image href="'+u+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" '
    +'preserveAspectRatio="xMidYMid slice"'+(cl?' clip-path="'+cl+'"':'')+'/>';
}
/* the object primitive — the atom of the whole illustration language */
function plan(x,y,w,h,fill,stroke){
  var g='';
  if(fill) g+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"/>';
  if(stroke) g+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="none" stroke="'+stroke+'" stroke-width="2.5"/>';
  var c=fill?PAPER:(stroke||INK), sw=fill?2.5:2;
  g+='<line x1="'+(x+w*.6)+'" y1="'+y+'" x2="'+(x+w*.6)+'" y2="'+(y+h)+'" stroke="'+c+'" stroke-width="'+sw+'"/>'
   +'<line x1="'+(x+w*.6)+'" y1="'+(y+h*.56)+'" x2="'+(x+w)+'" y2="'+(y+h*.56)+'" stroke="'+c+'" stroke-width="'+sw+'"/>';
  return g;
}

/* ====================================================================
   THE SEVEN LAYERS — shared by the ecosystem diagram and every locator
   ==================================================================== */
var LAYERS=["FOTO","PLANRITNING","3D","E-STYLING","MOTION","ANNONS","KAMPANJ"];

function ecosystem(o){
  o=o||{};
  var lit = o.lit==null? -1 : o.lit;
  var y0=o.y0||800, step=o.step||112, rise=56, run=rise/TAN;
  var ox=SA.L, oy=o.oy||610, ow=o.ow||150, oh=o.oh||104;
  var sx=ox+ow/2, e0=o.e0||430, e1=o.e1||850;
  var g='';
  g+='<line x1="'+e0+'" y1="'+y0+'" x2="'+e1+'" y2="'+(y0+step*6)+'" stroke="'+INK+'" '
    +'stroke-opacity=".16" stroke-width="1.5" stroke-dasharray="2 8"/>';
  g+='<line x1="'+sx+'" y1="'+(oy+oh)+'" x2="'+sx+'" y2="'+(y0+step*6)+'" stroke="'+(lit<0?INK:FAINT)+'" stroke-width="1.5"/>';
  LAYERS.forEach(function(t,i){
    var y=y0+i*step, ex=e0+i*((e1-e0)/6), on=(i===lit)||lit<0;
    var col=on?INK:FAINT, sw=(i===lit)?2.6:1.5;
    g+='<path d="M '+sx+' '+(y-rise)+' L '+(sx+run)+' '+y+' L '+ex+' '+y+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'"/>'
     +'<circle cx="'+ex+'" cy="'+y+'" r="'+((i===lit)?8:4.5)+'" fill="'+((i===lit)?OLIVE:col)+'"/>'
     +TX(sx+run+6,y-20,t,FS.k,29,on?INK:FAINT,'letter-spacing="4.5"');
  });
  g+=plan(ox,oy,ow,oh,lit<0?OLIVE:FAINT);
  return g;
}

/* ====================================================================
   PRIMITIVES
   ==================================================================== */
var P={};

P.statement=function(s){
  var y=s.y||520, lines=s.head||[];
  var g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,y,lines,s.cap||98);
  var sz=lines.reduce(function(a,l){return Math.min(a,fit(l,s.cap||98,SERIF))},999);
  var below=y+(lines.length-1)*sz*1.04;
  if(s.em){ g+=TX(SA.L,below+sz*1.12,s.em,FS.si,Math.min(sz*.78,76),OLIVE) }
  if(s.sub){
    var yy=below+sz*1.12+(s.em?sz*.95:0)+64;
    g+='<line x1="'+SA.L+'" y1="'+(yy-42)+'" x2="'+(SA.L+90)+'" y2="'+(yy-42)+'" stroke="'+OLIVE+'" stroke-width="2"/>';
    (Array.isArray(s.sub)?s.sub:[s.sub]).forEach(function(l,i){
      g+=TX(SA.L,yy+i*46,l,FS.k,30,INK2);
    });
  }
  return base(g);
};

P.photo=function(s){
  var g=img(s.m,0,0,1080,1920);
  if(s.head||s.k){
    g+='<rect y="1160" width="1080" height="760" fill="url(#botFade)"/>';
    if(s.k) g+=TX(SA.L,1420,s.k,FS.k,26,"#C9CDBF",'letter-spacing="7"');
    if(s.head) g+=disp(SA.L,1520,s.head,86,"#F4F2ED");
  } else {
    g+='<rect y="1500" width="1080" height="420" fill="url(#botFade)"/>';
  }
  g+='<g opacity=".9">'+wmLight(SA.R,276,30)+'</g>';
  return base(g,INK);
};
function wmLight(x,y,h){
  h=h||30; var w=h*(858.6/756.3);
  return '<g transform="translate('+(x-w)+','+y+') scale('+(h/756.3)+')">'
   +'<path d="'+GEO.limb+'" fill="#F4F2ED"/>'
   +'<circle cx="'+GEO.dot.cx+'" cy="'+GEO.dot.cy+'" r="'+GEO.dot.r+'" fill="#A8AD9E"/></g>';
}

P.comparison=function(s){
  var w=SA.R-SA.L, h=470, y1=700, y2=y1+h+56;
  var g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,470,s.head||[],72);
  g+=img(s.m[0],SA.L,y1,w,h)
   +'<rect x="'+SA.L+'" y="'+y1+'" width="'+w+'" height="'+h+'" fill="none" stroke="'+LINE+'" stroke-width="1"/>'
   +'<rect x="'+SA.L+'" y="'+(y1+h-58)+'" width="150" height="58" fill="'+PAPER+'"/>'
   +TX(SA.L+26,y1+h-20,s.la||"FÖRE",FS.k6,24,INK2,'letter-spacing="5"');
  g+=img(s.m[1],SA.L,y2,w,h)
   +'<rect x="'+SA.L+'" y="'+y2+'" width="'+w+'" height="'+h+'" fill="none" stroke="'+LINE+'" stroke-width="1"/>'
   +'<rect x="'+SA.L+'" y="'+(y2+h-58)+'" width="164" height="58" fill="'+OLIVE+'"/>'
   +TX(SA.L+26,y2+h-20,s.lb||"EFTER",FS.k6,24,"#F4F2ED",'letter-spacing="5"');
  /* the 58° tick marks the transition between the two states */
  g+='<path d="M '+(SA.mid-30)+' '+(y2-14)+' L '+(SA.mid+30)+' '+(y2-14-60*TAN/2)+'" stroke="'+OLIVE+'" stroke-width="3" fill="none"/>';
  return base(g);
};

P.transition=function(s){
  var g='<rect width="1080" height="1920" fill="'+INK+'"/>';
  g+='<path d="M 0 1920 L 1080 '+(1920-1080*TAN*0.36)+' L 1080 1920 Z" fill="'+OLIVE+'" opacity=".26"/>';
  g+=TX(SA.L,300,s.k||"VIEWLY",FS.k,26,"#A8AD9E",'letter-spacing="7"');
  g+=disp(SA.L,720,s.head||[],92,"#F4F2ED");
  g+='<line x1="'+SA.L+'" y1="900" x2="'+(SA.L+90)+'" y2="900" stroke="#A8AD9E" stroke-width="2"/>';
  if(s.next) g+=TX(SA.L,980,s.next,FS.k6,28,"#A8AD9E",'letter-spacing="6"');
  g+=wmLight(SA.R,276,30);
  return g;
};

P.case_=function(s){
  var cut=(100-0)*0; var g=img(s.m,0,0,1080,1300);
  g+='<path d="M 0 1300 L 1080 1300 L 1080 1920 L 0 1920 Z" fill="'+PAPER+'"/>';
  g+='<path d="M 0 1300 L 1080 '+(1300-1080*TAN*0.10)+' L 1080 1300 Z" fill="'+PAPER+'"/>';
  g+=TX(SA.L,1420,s.k||"OBJEKT",FS.k,26,OLIVE,'letter-spacing="7"');
  g+=disp(SA.L,1520,s.head||[],80);
  g+='<line x1="'+SA.L+'" y1="1566" x2="'+(SA.L+90)+'" y2="1566" stroke="'+OLIVE+'" stroke-width="2"/>';
  if(s.sub) g+=TX(SA.L,1560+72,s.sub,FS.k6,26,INK2,'letter-spacing="6"');
  return base(g,INK);
};

/* -------- DIAGRAMS ------------------------------------------------- */
var D={};

D.ecosystem=function(s){
  return base(kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],98)+ecosystem({}));
};

D.locator=function(s){
  var g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],92);
  g+=ecosystem({lit:s.lit, oy:640, ow:112, oh:78, y0:812, step:96, e0:410, e1:800});
  if(s.sub) g+=TX(SA.L,1548,s.sub,FS.si,50,OLIVE);
  return base(g);
};

D.flow=function(s){
  var st=s.items||[], n=st.length, ly=s.ly||1080;
  var x0=140, x1=940, gap=(x1-x0)/(n-1);
  var g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],98);
  g+='<line x1="'+SA.L+'" y1="'+ly+'" x2="'+SA.R+'" y2="'+ly+'" stroke="'+OLIVE+'" stroke-width="3"/>';
  st.forEach(function(t,i){
    var x=x0+i*gap;
    g+='<circle cx="'+x+'" cy="'+ly+'" r="9" fill="'+OLIVE+'"/>'
     +'<line x1="'+x+'" y1="'+(ly+22)+'" x2="'+x+'" y2="'+(ly+46)+'" stroke="'+FAINT+'" stroke-width="1.5"/>'
     +TX(x,ly+92,t[0],FS.k6,24,INK,'letter-spacing="3" text-anchor="middle"');
    if(t[1]) g+=TX(x,ly+134,t[1],FS.k,21,MUT,'text-anchor="middle"');
  });
  if(s.sub) g+=TX(SA.L,1440,s.sub,FS.si,54,INK2);
  return base(g);
};

D.states=function(s){
  /* fragmented → unified: the operations argument */
  var frag=s.frag||[], g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],98);
  g+=TX(SA.L,660,"IDAG",FS.k6,23,MUT,'letter-spacing="8"');
  frag.forEach(function(f){
    var x=f[1],y=f[2],w=f[3];
    g+='<line x1="'+x+'" y1="'+y+'" x2="'+(x+w)+'" y2="'+y+'" stroke="'+MUT+'" stroke-width="2"/>'
     +'<circle cx="'+x+'" cy="'+y+'" r="6" fill="none" stroke="'+MUT+'" stroke-width="2"/>'
     +'<circle cx="'+(x+w)+'" cy="'+y+'" r="6" fill="none" stroke="'+MUT+'" stroke-width="2"/>'
     +TX(x+w+22,y+8,f[0],FS.k,24,MUT,'letter-spacing="3.5"');
  });
  g+='<line x1="'+SA.L+'" y1="1090" x2="'+SA.R+'" y2="1090" stroke="'+LINE+'" stroke-width="1"/>'
   +TX(SA.L,1168,"MED VIEWLY",FS.k6,23,OLIVE,'letter-spacing="8"');
  var ly=1280, sx=[120,320,520,720,920], lab=s.items||[];
  g+='<line x1="'+SA.L+'" y1="'+ly+'" x2="'+SA.R+'" y2="'+ly+'" stroke="'+OLIVE+'" stroke-width="3"/>';
  sx.forEach(function(x,i){
    g+='<circle cx="'+x+'" cy="'+ly+'" r="9" fill="'+OLIVE+'"/>'
     +TX(x,ly+46,lab[i],FS.k6,23,INK,'letter-spacing="3" text-anchor="middle"');
  });
  if(s.sub) g+=disp(SA.L,1470,[s.sub],84);
  return base(g);
};

D.converge=function(s){
  /* n inputs meeting at one node — Annonsskrivaren, branding */
  var rows=s.items||[], nodeX=768, nodeY=784, x0=470, stop=nodeX-80/TAN;
  var g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],98);
  rows.forEach(function(r,i){
    var y=704+i*80;
    g+=TX(SA.L+92,y+9,r,FS.k,27,INK,'letter-spacing="4.5"');
    g+= (y===nodeY)
      ? '<line x1="'+x0+'" y1="'+y+'" x2="'+nodeX+'" y2="'+y+'" stroke="'+INK+'" stroke-width="1.5"/>'
      : '<path d="M '+x0+' '+y+' L '+stop+' '+y+' L '+nodeX+' '+nodeY+'" fill="none" stroke="'+INK+'" stroke-width="1.5"/>';
  });
  g+=(s.glyphs||'');
  g+='<circle cx="'+nodeX+'" cy="'+nodeY+'" r="11" fill="'+OLIVE+'"/>'
   +'<line x1="'+nodeX+'" y1="'+(nodeY+11)+'" x2="'+nodeX+'" y2="938" stroke="'+INK+'" stroke-width="1.5"/>'
   +'<path d="M '+(nodeX-13)+' 922 L '+nodeX+' 946 L '+(nodeX+13)+' 922" fill="none" stroke="'+INK+'" stroke-width="1.5" stroke-linejoin="round"/>';
  g+=(s.out||'');
  if(s.sub) g+=TX(SA.L,1572,s.sub,FS.si,50,OLIVE);
  return base(g);
};

D.campaign=function(s){
  /* one object → four campaign states */
  var g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],98);
  g+=plan(SA.L,640,120,84,OLIVE);
  var st=s.items||[], y0=830, step=104;
  var sx=SA.L+60;
  g+='<line x1="'+sx+'" y1="724" x2="'+sx+'" y2="'+(y0+step*(st.length-1))+'" stroke="'+INK+'" stroke-width="1.5"/>';
  st.forEach(function(t,i){
    var y=y0+i*step, run=56/TAN;
    g+='<path d="M '+sx+' '+(y-56)+' L '+(sx+run)+' '+y+' L '+(sx+run+300)+' '+y+'" fill="none" stroke="'+INK+'" stroke-width="1.5"/>';
    /* each state is the same footprint, progressively filled */
    var bx=sx+run+330, bw=96, bh=68;
    g+='<rect x="'+bx+'" y="'+(y-bh/2)+'" width="'+bw+'" height="'+bh+'" fill="none" stroke="'+INK+'" stroke-width="2"/>'
     +'<rect x="'+bx+'" y="'+(y-bh/2)+'" width="'+(bw*(i+1)/st.length)+'" height="'+bh+'" fill="'+OLIVE+'"/>';
    g+=TX(sx+run+6,y-20,t,FS.k,29,INK,'letter-spacing="4.5"');
  });
  if(s.sub) g+=TX(SA.L,1560,s.sub,FS.si,50,OLIVE);
  return base(g);
};

D.formats=function(s){
  /* the format family: one object, four crops */
  var g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],98);
  var specs=[["9:16",.5625],["4:5",.8],["1:1",1],["16:9",1.7778]];
  var baseH=300, y=760, x=SA.L;
  specs.forEach(function(sp){
    var h=baseH, w=h*sp[1];
    g+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="none" stroke="'+INK+'" stroke-width="2"/>'
     +'<rect x="'+(x+10)+'" y="'+(y+10)+'" width="'+(w-20)+'" height="'+(h-20)+'" fill="'+OLIVE+'" opacity=".16"/>'
     +TX(x,y+h+40,sp[0],FS.k6,24,INK2,'letter-spacing="4"');
    x+=w+26;
  });
  g+='<line x1="'+SA.L+'" y1="'+(y+baseH+92)+'" x2="'+SA.R+'" y2="'+(y+baseH+92)+'" stroke="'+LINE+'" stroke-width="1"/>';
  if(s.sub) g+=disp(SA.L,y+baseH+220,[s.sub],76);
  return base(g);
};

D.triad=function(s){
  /* A × B × C — the om-oss equation */
  var it=s.items||[], g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],98);
  var y=880, cx=[SA.L+120,SA.mid,SA.R-120];
  it.forEach(function(t,i){
    g+='<circle cx="'+cx[i]+'" cy="'+y+'" r="128" fill="none" stroke="'+(i===1?OLIVE:INK)+'" stroke-width="2"/>'
     +TX(cx[i],y+10,t,FS.k6,26,i===1?OLIVE:INK,'letter-spacing="4" text-anchor="middle"');
    if(i<2) g+=TX((cx[i]+cx[i+1])/2,y+14,"×",FS.s,58,MUT,'text-anchor="middle"');
  });
  if(s.sub) g+=disp(SA.L,1240,[s.sub],76);
  return base(g);
};

D.output=function(s){
  /* what one object produced — the case inventory */
  var it=s.items||[], g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],92);
  var y0=760, step=98;
  it.forEach(function(t,i){
    var y=y0+i*step;
    g+='<line x1="'+SA.L+'" y1="'+y+'" x2="'+SA.R+'" y2="'+y+'" stroke="'+LINE+'" stroke-width="1"/>'
     +TX(SA.L,y-22,t[0],FS.k,28,INK,'letter-spacing="4.5"')
     +TX(SA.R,y-22,t[1],FS.k6,28,OLIVE,'text-anchor="end"');
  });
  if(s.sub) g+=TX(SA.L,y0+step*it.length+70,s.sub,FS.si,50,INK2);
  return base(g);
};

/* -------- ILLUSTRATIONS -------------------------------------------- */
var I={};

I.axo=function(s){
  /* plan → room → whole, in light axonometric */
  var g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],98);
  var y=820, w=250, h=170, k=0.38;
  function box(x,y,fill,lv){
    var dx=w*k*0.55, dy=-h*k*0.55;
    var p='<path d="M '+x+' '+y+' L '+(x+w)+' '+y+' L '+(x+w)+' '+(y+h)+' L '+x+' '+(y+h)+' Z" fill="'+(fill||'none')+'" stroke="'+INK+'" stroke-width="2"/>';
    if(lv>0){
      p+='<path d="M '+x+' '+y+' L '+(x+dx)+' '+(y+dy)+' L '+(x+w+dx)+' '+(y+dy)+' L '+(x+w)+' '+y+' Z" fill="none" stroke="'+INK+'" stroke-width="2"/>'
       +'<path d="M '+(x+w)+' '+y+' L '+(x+w+dx)+' '+(y+dy)+' L '+(x+w+dx)+' '+(y+dy+h)+' L '+(x+w)+' '+(y+h)+' Z" fill="'+(lv>1?OLIVE:'none')+'" fill-opacity=".18" stroke="'+INK+'" stroke-width="2"/>';
    }
    if(lv>1){
      p+='<line x1="'+(x+w*.42)+'" y1="'+y+'" x2="'+(x+w*.42)+'" y2="'+(y+h)+'" stroke="'+INK+'" stroke-width="1.5"/>'
       +'<line x1="'+(x+w*.42)+'" y1="'+(y+h*.52)+'" x2="'+(x+w)+'" y2="'+(y+h*.52)+'" stroke="'+INK+'" stroke-width="1.5"/>';
    }
    return p;
  }
  var labs=s.items||["PLAN","RUM","HELHET"];
  [0,1,2].forEach(function(i){
    var x=SA.L+i*0, yy=y+i*310;
    g+=box(SA.L+i*40,yy,i===0?OLIVE:null,i);
    g+=TX(SA.L+i*40+w+70,yy+h/2+10,labs[i],FS.k6,28,i===2?OLIVE:INK,'letter-spacing="5"');
    if(i<2) g+='<path d="M '+(SA.L+i*40+40)+' '+(yy+h+26)+' L '+(SA.L+i*40+40+58/TAN)+' '+(yy+h+26+58)+'" stroke="'+FAINT+'" stroke-width="2" fill="none"/>';
  });
  return base(g);
};

I.motion=function(s){
  /* one still fanning into frames */
  var g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],98);
  var w=190,h=338,y=760,n=5;
  for(var i=n-1;i>=0;i--){
    var x=SA.L+i*118, op=(i===0)?1:(0.16+0.14*(n-1-i));
    g+='<rect x="'+x+'" y="'+(y+i*16)+'" width="'+w+'" height="'+h+'" fill="'+INK+'" opacity="'+op.toFixed(2)+'"/>';
  }
  g+='<line x1="'+SA.L+'" y1="'+(y+h+110)+'" x2="'+SA.R+'" y2="'+(y+h+110)+'" stroke="'+LINE+'" stroke-width="1"/>';
  g+=TX(SA.L,y+h+80,"STILLBILD",FS.k6,24,INK,'letter-spacing="5"')
   +TX(SA.R,y+h+80,"RÖRELSE",FS.k6,24,OLIVE,'letter-spacing="5" text-anchor="end"');
  if(s.sub) g+=disp(SA.L,y+h+240,[s.sub],76);
  return base(g);
};

I.styling=function(s){
  /* the e-styling mechanism: empty plan → zoned → furnished */
  var g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],98);
  var w=272,h=196,y=790,gap=44,labs=s.items||["TOM YTA","ZONERING","MÖBLERING"];
  [0,1,2].forEach(function(i){
    var x=SA.L+i*(w+gap);
    g+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="none" stroke="'+INK+'" stroke-width="2"/>';
    if(i>0) g+='<line x1="'+(x+w*.58)+'" y1="'+y+'" x2="'+(x+w*.58)+'" y2="'+(y+h)+'" stroke="'+FAINT+'" stroke-width="1.5" stroke-dasharray="5 6"/>';
    if(i>1){
      g+='<rect x="'+(x+22)+'" y="'+(y+h-72)+'" width="112" height="46" fill="'+OLIVE+'" opacity=".85"/>'
       +'<rect x="'+(x+w*.58+18)+'" y="'+(y+34)+'" width="58" height="58" fill="'+OLIVE+'" opacity=".4"/>'
       +'<circle cx="'+(x+w*.30)+'" cy="'+(y+56)+'" r="21" fill="none" stroke="'+OLIVE+'" stroke-width="2.5"/>';
    }
    g+=TX(x,y+h+44,labs[i],FS.k6,22,i===2?OLIVE:INK2,'letter-spacing="3.5"');
  });
  if(s.sub) g+=disp(SA.L,y+h+180,[s.sub],76);
  return base(g);
};

/* -------- PRODUCT --------------------------------------------------- */
var PR={};

PR.annons=function(s){
  var glyph='<g stroke="'+OLIVE+'" stroke-width="2.5" fill="none">'
   +'<line x1="64" y1="696" x2="128" y2="696"/><line x1="64" y1="706" x2="108" y2="706"/><line x1="64" y1="716" x2="120" y2="716"/>'
   +'<rect x="64" y="766" width="40" height="30"/><rect x="76" y="774" width="40" height="30"/>'
   +'<circle cx="86" cy="864" r="7"/><line x1="86" y1="840" x2="86" y2="888"/><line x1="62" y1="864" x2="110" y2="864"/></g>';
  var px=SA.L,py=976,pw=SA.R-SA.L,ph=490,notch=96;
  var out='<path d="M '+px+' '+py+' L '+(px+pw-notch)+' '+py+' L '+(px+pw)+' '+(py+notch*TAN)
    +' L '+(px+pw)+' '+(py+ph)+' L '+px+' '+(py+ph)+' Z" fill="'+PANEL+'"/>'
   +TX(px+48,1044,"ANNONSSKRIVAREN",FS.k6,21,OLIVE,'letter-spacing="6"')
   +TX(px+48,1122,"Ljuset som blir kvar",FS.s,54,INK);
  ["Söderläget gör sig påmint redan i hallen. Ljuset når in",
   "över den breda ekparketten och fortsätter genom de",
   "öppna sällskapsytorna, där takhöjden ger rummet en",
   "stillhet som är ovanlig för adressen. Köket vetter mot",
   "gården och rymmer ett längre bord. Sovrummen ligger",
   "avskilt från det gemensamma."].forEach(function(l,i){
    out+=TX(px+48,1200+i*46,l,FS.s,33,INK2,i>4?'opacity=".35"':(i>3?'opacity=".62"':''));
  });
  return D.converge({k:s.k,head:s.head,items:["OBJEKTSDATA","BILDER","OMRÅDE"],
                     glyphs:glyph,out:out,sub:s.sub});
};

PR.portal=function(s){
  /* the portal reconstructed as typography and rule, never a screenshot */
  var g=kick(s.k)+wm(SA.R,276,30)+disp(SA.L,420,s.head||[],98);
  var x=SA.L,y=700,w=SA.R-SA.L,h=760,notch=110;
  g+='<path d="M '+x+' '+y+' L '+(x+w-notch)+' '+y+' L '+(x+w)+' '+(y+notch*TAN)
    +' L '+(x+w)+' '+(y+h)+' L '+x+' '+(y+h)+' Z" fill="'+PANEL+'"/>';
  g+='<line x1="'+x+'" y1="'+(y+92)+'" x2="'+(x+w)+'" y2="'+(y+92)+'" stroke="'+FAINT+'" stroke-width="1.5"/>';
  g+=TX(x+40,y+58,"SILVERGÅRDEN 9A",FS.k6,25,INK,'letter-spacing="5"')
   +TX(x+40+352,y+58,"LANDSKRONA",FS.k,23,MUT,'letter-spacing="4"');
  var rows=s.items||[];
  rows.forEach(function(r,i){
    var ry=y+92+64+i*84;
    g+=TX(x+40,ry,r[0],FS.k,27,INK,'letter-spacing="3.5"')
     +TX(x+w-40,ry,r[1],FS.k6,23,r[2]?OLIVE:MUT,'letter-spacing="4" text-anchor="end"');
    if(r[2]) g+='<rect x="'+(x+w-40-1)+'" y="'+(ry-40)+'" width="1" height="0" fill="none"/>';
    g+='<line x1="'+(x+40)+'" y1="'+(ry+26)+'" x2="'+(x+w-40)+'" y2="'+(ry+26)+'" stroke="'+FAINT+'" stroke-width="1" stroke-opacity=".7"/>';
  });
  if(s.sub) g+=TX(SA.L,1560,s.sub,FS.si,50,OLIVE);
  return base(g);
};

/* -------- dispatcher ------------------------------------------------ */
function drawStory(s){
  if(s.p==="statement")  return P.statement(s);
  if(s.p==="photo")      return P.photo(s);
  if(s.p==="comparison") return P.comparison(s);
  if(s.p==="transition") return P.transition(s);
  if(s.p==="case")       return P.case_(s);
  if(s.p==="diagram")    return (D[s.d]||D.ecosystem)(s);
  if(s.p==="illustration")return (I[s.i]||I.axo)(s);
  if(s.p==="product")    return (PR[s.r]||PR.portal)(s);
  return P.statement(s);
}
