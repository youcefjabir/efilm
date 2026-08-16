/* =====================================================================
   VIEWLY — STORY RENDERER
   Två riktningar: ARKIV (tryckt monografi) och SKUGGA (cinematisk).
   Nio kompositionsprimitiv per riktning — inte helbild på allt.

   Allt ritas i HTML/CSS inuti en container med container-type:inline-size,
   så 1cqw = 1 % av ramens bredd = 10,8 px i en 1080 × 1920-Story.
   ===================================================================== */
var M = window.VMEDIA || {};
var esc = function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};

/* ---------------------------------------------------------------------
   VERIFIERAD LOGOTYPGEOMETRI
   Spårad ur viewly-logo-mark.png (1080 × 941) — IoU 0,9925 mot originalet.
   Ingen approximerad V-form: det här ÄR märket.
   --------------------------------------------------------------------- */
var GEO = {
  vb:"0 0 858.6 756.3",
  limb:"M 0 16.4 L 206.7 16.4 Q 243.7 16.4 259.7 43.4 L 588 552.6 L 462.2 756.3 Z",
  dot:{cx:705.2, cy:153.4, r:153.4},
  ratio:1.1353,          /* 858.6 / 756.3 */
  angle:58.0,            /* uppmätt lemvinkel */
  tan:1.6003,
  black:"#141416",       /* märkets svarta — djupare än UI-ink #1C1C1E */
  iou:0.9925
};
function vmark(ink,dot,extra){
  return '<svg viewBox="'+GEO.vb+'" '+(extra||'')+' aria-hidden="true">'
   +'<path d="'+GEO.limb+'" fill="'+ink+'"/>'
   +'<circle cx="'+GEO.dot.cx+'" cy="'+GEO.dot.cy+'" r="'+GEO.dot.r+'" fill="'+dot+'"/></svg>';
}

/* ---------------------------------------------------------------------
   TVÅ ZONER
   CANVAS  = hela 1080 × 1920. Fotografi, papper, masker, gradienter,
             geometri får bo här och gå ut i kant.
   KRITISK = 250 px topp / 320 px botten reserverat åt Instagrams eget UI.
             Rubrik, brödtext, kicker, folio, watermark och CTA lever här.
   I cqw:  250/1080 = 23,15   ·   280/1080 = 25,93
   --------------------------------------------------------------------- */
var SAFE = {top:23.2, bot:26.0};

/* Display-typ får aldrig klippas av ett långt svenskt sammansatt ord
   ("Bostadspresentation" = 19 tecken). Graden härleds ur det längsta ordet. */
function dsize(text, cap, adv, pad){
  var w = 100 - 2*(pad==null?6.4:pad);
  var m = String(text||"").split(/\s+/).reduce(function(a,x){return Math.max(a,x.length)},1);
  return "font-size:"+Math.min(cap, w/(adv*m)).toFixed(2)+"cqw;";
}
var SERIF=0.46;

/* ---------------------------------------------------------------------
   MEDIA-SLOTS
   Masken och kompositionen är LÅSTA. Bilden, fokalpunkten och zoomen
   är REDIGERBARA. bg() läser en override ur SLOTS om slot-id finns.
   --------------------------------------------------------------------- */
var SLOTS = {};
function pick(k, wide){
  if(wide && M[k+"_h"]) return M[k+"_h"];
  return M[k];
}
function bg(k, sid, wide){
  var o = (sid && SLOTS[sid]) || {};
  var key = o.img || k;
  var u = pick(key, wide);
  if(!u) return 'background:repeating-linear-gradient(135deg,#DAD6D0 0 8px,#D2CDC6 8px 16px);';
  var fy = (o.fy!=null ? o.fy : 0.5)*100;
  var z  = o.zoom || 1;
  return 'background-image:url('+u+');background-size:cover;background-position:50% '+fy.toFixed(1)+'%;'
   + (z!==1 ? 'transform:scale('+z.toFixed(3)+');transform-origin:50% '+fy.toFixed(1)+'%;' : '');
}
/* varje media-slot i biblioteket får ett stabilt id: <highlight>-<index>[-b] */
function sid(s, b){ return s.sid ? (s.sid+(b?"-b":"")) : null }

/* =====================================================================
   RIKTNINGSSTILAR
   ===================================================================== */
var CSS = ''
/* ---------------- A · ARKIV — tryckt monografi ---------------- */
+'.a{background:#F2EFEF;color:#1C1C1E;font-family:"Cormorant Garamond",Georgia,serif;position:absolute;inset:0;display:flex;flex-direction:column}'
+'.a-pad{padding:'+SAFE.top+'cqw 6.4cqw '+SAFE.bot+'cqw;display:flex;flex-direction:column;flex:1;min-height:0;position:relative;z-index:2}'
+'.a-top{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #D8D2CF;padding-bottom:2.4cqw;flex:0 0 auto}'
+'.a-k{font-family:Montserrat,sans-serif;font-size:2.25cqw;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:#6E7266}'
+'.a-fol{font-family:Montserrat,sans-serif;font-size:2.05cqw;font-weight:400;letter-spacing:.14em;color:#A9A29E}'
+'.a-bot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #D8D2CF;padding-top:2.4cqw;flex:0 0 auto}'
+'.a-wm{display:flex;align-items:center;gap:1.5cqw;font-family:Montserrat,sans-serif;font-size:2.05cqw;font-weight:600;letter-spacing:.26em}'
+'.a-wm svg{width:3.5cqw;height:auto;display:block}'
+'.a-d{font-weight:300;font-size:12.4cqw;line-height:.94;letter-spacing:-.014em}'
+'.a-d.sm{font-size:8.6cqw;line-height:1.02}'
+'.a-l{font-family:Montserrat,sans-serif;font-weight:400;font-size:3.05cqw;line-height:1.66;color:#4A4744}'
+'.a-pl{border:1px solid #D8D2CF;overflow:hidden;position:relative}'
+'.a-r{width:6.6cqw;height:1px;background:#6E7266;flex:0 0 auto}'
+'.a-c{font-family:Montserrat,sans-serif;font-size:2.05cqw;letter-spacing:.17em;text-transform:uppercase;color:#8A8580}'
+'.a-it{font-style:italic;color:#6E7266}'
+'.a-fig{font-family:Montserrat,sans-serif;font-size:1.85cqw;letter-spacing:.2em;text-transform:uppercase;color:#A9A29E}'
/* ---------------- B · SKUGGA — cinematisk ---------------- */
+'.b{background:#0E0E0D;color:#EFEDE7;font-family:Montserrat,sans-serif;position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden}'
+'.b-k{font-size:2.15cqw;font-weight:500;letter-spacing:.32em;text-transform:uppercase;color:#98A088}'
+'.b-d{font-family:"Cormorant Garamond",Georgia,serif;font-weight:300;font-size:11.4cqw;line-height:1.0;letter-spacing:-.008em}'
+'.b-i{font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-weight:300;font-size:10.4cqw;line-height:1.08;color:#EFEDE7}'
+'.b-b{font-size:2.75cqw;line-height:1.72;color:#A8A6A0;font-weight:400;letter-spacing:.012em}'
+'.b-s{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,14,13,.74) 0%,rgba(14,14,13,.12) 26%,rgba(14,14,13,.05) 42%,rgba(14,14,13,.62) 78%,rgba(14,14,13,.94) 100%)}'
+'.b-v{position:absolute;inset:0;background:radial-gradient(115% 78% at 50% 42%,rgba(0,0,0,0) 42%,rgba(0,0,0,.55) 100%)}'
+'.b-let{width:100%;aspect-ratio:2.39/1;overflow:hidden;position:relative}'
+'.b-dot{width:1.5cqw;height:1.5cqw;border-radius:50%;background:#98A088;flex:0 0 auto}'
+'.b-wm{display:flex;align-items:center;gap:1.5cqw;font-size:2cqw;font-weight:600;letter-spacing:.28em;color:#EFEDE7}'
+'.b-wm svg{width:3.3cqw;height:auto;display:block}'
/* delad chrome-nivå */
+'.z{position:absolute;z-index:6}';

/* =====================================================================
   RENDERARE
   ===================================================================== */
function fol(i,n){ return String(i+1).padStart(2,"0")+" / "+String(n).padStart(2,"0") }

/* ---------------------------------------------------------------- A · ARKIV */
var A = {
 shell:function(inner){ return '<div class="a">'+inner+'</div>' },
 chrome:function(k,i,n,body){
   return A.shell('<div class="a-pad">'
    +'<div class="a-top"><span class="a-k">'+esc(k||"Viewly")+'</span><span class="a-fol">'+fol(i,n)+'</span></div>'
    +body
    +'<div class="a-bot"><span class="a-wm">'+vmark("#1C1C1E","#6E7266")+'VIEWLY</span><span class="a-c">viewly.se</span></div>'
    +'</div>');
 },

 /* 01 · MARK — märket som blekt vattenmärke, bilden inramad på pappret */
 mark:function(s,i,n){
   return A.shell(
     '<div style="position:absolute;left:-27cqw;bottom:-7cqw;width:76cqw;opacity:.055">'+vmark("#1C1C1E","#6E7266",'style="width:100%;height:auto;display:block"')+'</div>'
    +'<div class="a-pl" style="position:absolute;left:6.4cqw;right:6.4cqw;top:11cqw;height:93cqw;overflow:hidden">'
      +'<div style="position:absolute;inset:0;'+bg(s.m,sid(s))+'"></div></div>'
    +'<div class="a-pad" style="justify-content:flex-end">'
    +'<div style="display:flex;flex-direction:column;gap:2.4cqw">'
    +'<span class="a-k">'+esc(s.k)+'</span><div class="a-r"></div>'
    +'<div class="a-d" style="'+dsize(s.h,11,SERIF)+'">'+esc(s.h)+'</div>'
    +(s.s?'<div class="a-l" style="max-width:80%">'+esc(s.s)+'</div>':'')
    +'</div>'
    +'<div class="a-bot" style="margin-top:4.4cqw"><span class="a-wm">'+vmark("#1C1C1E","#6E7266")+'VIEWLY</span><span class="a-c">'+fol(i,n)+'</span></div>'
    +'</div>');
 },

 /* 02 · FULL BLEED — bilden äger canvas, texten står på en pappersremsa */
 fullbleed:function(s,i,n){
   var cap = s.h||s.k;
   return A.shell('<div style="position:absolute;inset:0;overflow:hidden"><div style="position:absolute;inset:0;'+bg(s.m,sid(s))+'"></div></div>'
    +(cap
      ? '<div style="position:absolute;left:0;right:0;bottom:0;background:#F2EFEF;padding:5cqw 6.4cqw '+SAFE.bot+'cqw;display:flex;flex-direction:column;gap:2cqw">'
        +(s.k?'<span class="a-k">'+esc(s.k)+'</span>':'')
        +(s.h?'<div class="a-d sm" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>':'')
        +'</div>'
      : '<div style="position:absolute;left:0;right:0;bottom:0;height:40cqw;background:linear-gradient(180deg,rgba(20,18,16,0),rgba(20,18,16,.55))"></div>'
        +'<div class="z" style="left:6.4cqw;bottom:'+SAFE.bot+'cqw"><span class="a-wm" style="color:#F2EFEF">'+vmark("#F2EFEF","#98A088")+'VIEWLY</span></div>')
   );
 },

 /* 03 · QUIET — nästan tom sida. En mening bär hela ytan. */
 quiet:function(s,i,n){
   return A.chrome(s.k,i,n,
     '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:3.4cqw;padding-bottom:8cqw">'
    +'<div class="a-r"></div>'
    +'<div class="a-d" style="'+dsize((s.h||"")+" "+(s.em||""),12.4,SERIF)+'">'+esc(s.h)+(s.em?'<br><span class="a-it">'+esc(s.em)+'</span>':'')+'</div>'
    +(s.s?'<div class="a-l" style="max-width:70%">'+esc(s.s)+'</div>':'')
    +'</div>');
 },

 /* 04 · EDITORIAL — bildplåt med bildtext, typografi i komponerad relation */
 editorial:function(s,i,n){
   return A.chrome(s.k,i,n,
     '<div class="a-pl" style="height:54cqw;margin-top:4.4cqw;overflow:hidden">'
      +'<div style="position:absolute;inset:0;'+bg(s.m,sid(s))+'"></div></div>'
    +'<div style="margin-top:2.2cqw"><span class="a-fig">Fig. '+String(i+1).padStart(2,"0")+'</span></div>'
    +'<div style="margin-top:3.4cqw;display:flex;flex-direction:column;gap:2.4cqw">'
    +(s.h?'<div class="a-d sm" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>':'')
    +'<div class="a-r"></div>'
    +(s.s?'<div class="a-l">'+esc(s.s)+'</div>':'')
    +'</div>');
 },

 /* 05 · PRODUCT — ren presentation av portal, 3D eller motion */
 product:function(s,i,n){
   return A.chrome(s.k,i,n,
     '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:4cqw">'
    +'<div class="a-pl" style="aspect-ratio:4/3;overflow:hidden">'
      +'<div style="position:absolute;inset:0;'+bg(s.m,sid(s))+'"></div></div>'
    +'<div style="display:flex;flex-direction:column;gap:2.2cqw">'
    +'<div class="a-d sm" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>'
    +(s.s?'<div class="a-l">'+esc(s.s)+'</div>':'')+'</div></div>');
 },

 /* 06 · SPLIT — före/efter, still/rörligt. Två plåtar, en etikett vardera. */
 split:function(s,i,n){
   var a=s.m[0], b=s.m[1];
   return A.chrome(s.k,i,n,
     '<div style="flex:1;display:flex;flex-direction:column;gap:2.6cqw;padding:4cqw 0">'
    +(s.h?'<div class="a-d sm" style="margin-bottom:.6cqw;'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>':'')
    +'<div style="flex:1;display:flex;flex-direction:column;gap:2.6cqw;min-height:0">'
    +'<div style="flex:1;position:relative;min-height:0"><div class="a-pl" style="position:absolute;inset:0;overflow:hidden">'
      +'<div style="position:absolute;inset:0;'+bg(a,sid(s))+'"></div></div>'
      +'<span class="a-c" style="position:absolute;left:2.4cqw;bottom:2cqw;background:#F2EFEF;padding:.7cqw 1.6cqw">'+esc(s.la)+'</span></div>'
    +'<div style="flex:1;position:relative;min-height:0"><div class="a-pl" style="position:absolute;inset:0;overflow:hidden">'
      +'<div style="position:absolute;inset:0;'+bg(b,sid(s,1))+'"></div></div>'
      +'<span class="a-c" style="position:absolute;left:2.4cqw;bottom:2cqw;background:#6E7266;color:#F2EFEF;padding:.7cqw 1.6cqw">'+esc(s.lb)+'</span></div>'
    +'</div></div>');
 },

 /* 07 · SYSTEM — ekosystemet som typografisk ryggrad, aldrig en ikonlista */
 system:function(s,i,n){
   var rows = s.items.map(function(t,j){
     return '<div style="display:flex;align-items:baseline;gap:3cqw;padding:2.4cqw 0;border-bottom:1px solid #E2DCD9">'
      +'<span class="a-fol" style="width:5cqw;flex:0 0 5cqw;color:#6E7266">'+String(j+1).padStart(2,"0")+'</span>'
      +'<span style="font-size:6.2cqw;font-weight:300;line-height:1">'+esc(t)+'</span></div>';
   }).join("");
   return A.chrome(s.k,i,n,
     '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:3.4cqw">'
    +'<div class="a-d sm" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>'
    +(s.s?'<div class="a-l">'+esc(s.s)+'</div>':'')
    +'<div style="margin-top:1.6cqw;border-top:1px solid #E2DCD9">'+rows+'</div></div>');
 },

 /* 08 · CASE — objekt, plats. Bilden får tala, kolofonen står på papper. */
 "case":function(s,i,n){
   return A.shell('<div style="position:absolute;inset:0;overflow:hidden"><div style="position:absolute;inset:0;'+bg(s.m,sid(s))+'"></div></div>'
    +'<div style="position:absolute;left:0;right:0;bottom:0;background:#F2EFEF;padding:5.4cqw 6.4cqw '+SAFE.bot+'cqw;display:flex;flex-direction:column;gap:2.2cqw">'
    +'<span class="a-k">'+esc(s.k)+'</span>'
    +'<div class="a-d sm" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>'
    +'<div class="a-r"></div>'
    +'<span class="a-c">'+esc(s.s)+'</span></div>');
 },

 /* 09 · CTA — extremt enkel slutbild */
 cta:function(s,i,n){
   return A.shell('<div style="position:absolute;right:-18cqw;bottom:6cqw;width:80cqw;opacity:.06">'+vmark("#1C1C1E","#6E7266",'style="width:100%;height:auto;display:block"')+'</div>'
    +'<div class="a-pad">'
    +'<div class="a-top"><span class="a-k">'+esc(s.k||"Viewly")+'</span><span class="a-fol">'+fol(i,n)+'</span></div>'
    +'<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:3.2cqw">'
    +'<div class="a-d" style="'+dsize(s.h,12.4,SERIF)+'">'+esc(s.h)+'</div><div class="a-r"></div>'
    +'<div class="a-l" style="display:flex;align-items:center;gap:2cqw"><span style="font-size:4cqw;line-height:1">→</span>'+esc(s.s)+'</div>'
    +'</div>'
    +'<div class="a-bot"><span class="a-wm">'+vmark("#1C1C1E","#6E7266")+'VIEWLY</span><span class="a-c">viewly.se</span></div></div>');
 }
};

/* ---------------------------------------------------------------- B · SKUGGA */
var B = {
 shell:function(inner){ return '<div class="b">'+inner+'</div>' },
 kick:function(k){ return k?'<div class="z" style="left:6cqw;top:'+SAFE.top+'cqw"><span class="b-k">'+esc(k)+'</span></div>':'' },
 foot:function(i,n,light){
   return '<div class="z" style="left:6cqw;right:6cqw;bottom:'+SAFE.bot+'cqw;display:flex;justify-content:space-between;align-items:center">'
    +'<span class="b-wm">'+vmark(light||"#EFEDE7","#98A088")+'VIEWLY</span>'
    +'<span class="b-k" style="letter-spacing:.2em;color:#6E6C66">'+fol(i,n)+'</span></div>';
 },

 /* 01 · MARK — V:et blir bländaren. Fotografiet finns bara inuti märket. */
 mark:function(s,i,n){
   var id="m"+Math.random().toString(36).slice(2,8);
   return B.shell(
     '<svg viewBox="'+GEO.vb+'" style="position:absolute;left:-8cqw;top:34cqw;width:116cqw;height:'+(116/GEO.ratio).toFixed(1)+'cqw">'
    +'<defs><clipPath id="'+id+'"><path d="'+GEO.limb+'"/></clipPath></defs>'
    +'<foreignObject x="0" y="0" width="858.6" height="756.3" clip-path="url(#'+id+')">'
    +'<div xmlns="http://www.w3.org/1999/xhtml" style="width:858.6px;height:756.3px;'+bg(s.m,sid(s))+'"></div></foreignObject>'
    +'<circle cx="'+GEO.dot.cx+'" cy="'+GEO.dot.cy+'" r="'+GEO.dot.r+'" fill="#98A088"/></svg>'
    +B.kick(s.k)
    +'<div class="z" style="left:6cqw;right:6cqw;bottom:'+(SAFE.bot+11)+'cqw;display:flex;flex-direction:column;gap:2.4cqw">'
    +'<div class="b-d" style="'+dsize(s.h,11.4,SERIF)+'">'+esc(s.h)+'</div>'
    +(s.s?'<div class="b-b" style="max-width:76%">'+esc(s.s)+'</div>':'')+'</div>'
    +B.foot(i,n));
 },

 /* 02 · FULL BLEED — mörkret som grund, fotografiet som ljuskälla */
 fullbleed:function(s,i,n){
   return B.shell('<div style="position:absolute;inset:0;overflow:hidden"><div style="position:absolute;inset:0;'+bg(s.m,sid(s))+'"></div></div>'
    +'<div class="b-v"></div><div class="b-s"></div>'
    +B.kick(s.k)
    +(s.h?'<div class="z" style="left:6cqw;right:6cqw;bottom:'+(SAFE.bot+10)+'cqw"><div class="b-d" style="'+dsize(s.h,11.4,SERIF)+'">'+esc(s.h)+'</div></div>':'')
    +B.foot(i,n));
 },

 /* 03 · QUIET — en olivpunkt, en mening, svart */
 quiet:function(s,i,n){
   return B.shell(
     B.kick(s.k)
    +'<div class="z" style="left:6cqw;right:8cqw;top:50%;transform:translateY(-54%);display:flex;flex-direction:column;gap:3.4cqw">'
    +'<div class="b-dot"></div>'
    +'<div class="b-d" style="'+dsize(s.h,11.4,SERIF)+'">'+esc(s.h)+'</div>'
    +(s.em?'<div class="b-i" style="color:#98A088">'+esc(s.em)+'</div>':'')
    +(s.s?'<div class="b-b">'+esc(s.s)+'</div>':'')
    +'</div>'+B.foot(i,n));
 },

 /* 04 · EDITORIAL — 2.39:1-remsa som svävar i svart */
 editorial:function(s,i,n){
   return B.shell(
     '<div style="position:absolute;left:0;right:0;top:44cqw"><div class="b-let">'
      +'<div style="position:absolute;inset:0;'+bg(s.m,sid(s),true)+'"></div></div></div>'
    +B.kick(s.k)
    +'<div class="z" style="left:6cqw;right:7cqw;bottom:'+(SAFE.bot+11)+'cqw;display:flex;flex-direction:column;gap:2.8cqw">'
    +(s.h?'<div class="b-d" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>':'')
    +(s.s?'<div class="b-b">'+esc(s.s)+'</div>':'')+'</div>'
    +B.foot(i,n));
 },

 /* 05 · PRODUCT — hörnmarkeringar i oliv, bilden mätt och ställd */
 product:function(s,i,n){
   var c='position:absolute;width:5cqw;height:5cqw;border-color:#98A088;border-style:solid;';
   return B.shell(
     B.kick(s.k)
    +'<div style="position:absolute;left:8cqw;right:8cqw;top:34cqw;aspect-ratio:3/4">'
      +'<div style="position:absolute;inset:0;overflow:hidden"><div style="position:absolute;inset:0;'+bg(s.m,sid(s))+'"></div></div>'
      +'<div class="b-v"></div>'
      +'<i style="'+c+'left:-1.4cqw;top:-1.4cqw;border-width:1px 0 0 1px"></i>'
      +'<i style="'+c+'right:-1.4cqw;top:-1.4cqw;border-width:1px 1px 0 0"></i>'
      +'<i style="'+c+'left:-1.4cqw;bottom:-1.4cqw;border-width:0 0 1px 1px"></i>'
      +'<i style="'+c+'right:-1.4cqw;bottom:-1.4cqw;border-width:0 1px 1px 0"></i></div>'
    +'<div class="z" style="left:6cqw;right:7cqw;bottom:'+(SAFE.bot+10)+'cqw;display:flex;flex-direction:column;gap:2.4cqw">'
    +'<div class="b-d" style="'+dsize(s.h,8.2,SERIF)+'">'+esc(s.h)+'</div>'
    +(s.s?'<div class="b-b">'+esc(s.s)+'</div>':'')+'</div>'
    +B.foot(i,n));
 },

 /* 06 · SPLIT — två remsor, etiketten på den aktiva i oliv */
 split:function(s,i,n){
   var row=function(k,lab,on,sd){
     return '<div style="position:relative"><div class="b-let">'
      +'<div style="position:absolute;inset:0;'+bg(k,sd,true)+'"></div></div>'
      +'<span class="b-k" style="position:absolute;left:3cqw;top:50%;transform:translateY(-50%);z-index:3;'
      +'background:rgba(10,10,9,.86);padding:1.1cqw 2cqw;color:'+(on?"#98A088":"#CFCDC7")+'">'+esc(lab)+'</span></div>';
   };
   return B.shell(
     B.kick(s.k)
    +'<div style="position:absolute;left:0;right:0;top:36cqw;display:flex;flex-direction:column;gap:2.2cqw">'
      +row(s.m[0],s.la,false,sid(s))+row(s.m[1],s.lb,true,sid(s,1))+'</div>'
    +(s.h?'<div class="z" style="left:6cqw;right:7cqw;bottom:'+(SAFE.bot+10)+'cqw"><div class="b-i" style="'+dsize(s.h,10.4,SERIF)+'">'+esc(s.h)+'</div></div>':'')
    +B.foot(i,n));
 },

 /* 07 · SYSTEM — punkter längs en linje, första ledet tänt */
 system:function(s,i,n){
   var rows=s.items.map(function(t,j){
     return '<div style="position:relative;display:flex;align-items:center;min-height:7cqw">'
      +'<span style="position:absolute;left:-4.05cqw;top:50%;transform:translateY(-50%);width:1.5cqw;height:1.5cqw;'
      +'border-radius:50%;background:'+(j===0?"#98A088":"#33332F")+'"></span>'
      +'<span style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:6cqw;line-height:1.2;color:'+(j===0?"#EFEDE7":"#8C8A84")+'">'+esc(t)+'</span></div>';
   }).join("");
   return B.shell(
     B.kick(s.k)
    +'<div class="z" style="left:6cqw;right:7cqw;top:34cqw;display:flex;flex-direction:column;gap:2.4cqw">'
    +'<div class="b-d" style="'+dsize(s.h,8.4,SERIF)+'">'+esc(s.h)+'</div>'
    +(s.s?'<div class="b-b" style="margin-bottom:1.6cqw">'+esc(s.s)+'</div>':'')
    +'<div style="border-left:1px solid #2A2A27;padding-left:4.8cqw;display:flex;flex-direction:column">'+rows+'</div></div>'
    +B.foot(i,n));
 },

 /* 08 · CASE — objektet i mörker, plats som liten versal */
 "case":function(s,i,n){
   return B.shell('<div style="position:absolute;inset:0;overflow:hidden"><div style="position:absolute;inset:0;'+bg(s.m,sid(s))+'"></div></div>'
    +'<div class="b-v"></div><div class="b-s"></div>'
    +B.kick(s.k)
    +'<div class="z" style="left:6cqw;right:6cqw;bottom:'+(SAFE.bot+10)+'cqw;display:flex;flex-direction:column;gap:2cqw">'
    +'<div class="b-d" style="'+dsize(s.h,11.4,SERIF)+'">'+esc(s.h)+'</div>'
    +'<span class="b-k" style="color:#A8A6A0">'+esc(s.s)+'</span></div>'
    +B.foot(i,n));
 },

 /* 09 · CTA — märket centrerat, en linje, en uppmaning */
 cta:function(s,i,n){
   return B.shell(
     B.kick(s.k)
    +'<div class="z" style="left:0;right:0;top:50%;transform:translateY(-56%);display:flex;flex-direction:column;align-items:center;gap:4cqw;text-align:center;padding:0 8cqw">'
    +'<div style="width:10cqw">'+vmark("#EFEDE7","#98A088",'style="width:100%;height:auto;display:block"')+'</div>'
    +'<div class="b-d" style="'+dsize(s.h,8.8,SERIF,8)+'">'+esc(s.h)+'</div>'
    +'<div style="width:8cqw;height:1px;background:#98A088"></div>'
    +'<div class="b-b" style="letter-spacing:.16em;text-transform:uppercase;font-size:2.3cqw;color:#98A088">'+esc(s.s)+'</div>'
    +'</div>'+B.foot(i,n));
 }
};

var RENDER = {arkiv:A, skugga:B};

function story(dirId, s, i, n){
  var r = RENDER[dirId] || A;
  var f = r[s.p] || r.fullbleed;
  return f(s, i, n);
}

/* =====================================================================
   COVERS — bedömda vid 56 px i profilraden
   ===================================================================== */
function cover(dirId, h){
  if(dirId==="skugga"){
    return '<div style="position:absolute;inset:0;'+bg(h.cover,"cover-"+h.id)+'"></div>'
      +'<div style="position:absolute;inset:0;background:radial-gradient(70% 70% at 50% 45%,rgba(14,14,13,.42),rgba(14,14,13,.86))"></div>'
      +'<div style="position:absolute;inset:0;display:grid;place-items:center">'
      +'<span style="font-family:Montserrat,sans-serif;font-size:19cqw;font-weight:500;letter-spacing:.06em;color:#EFEDE7">'+h.num+'</span></div>'
      +'<div style="position:absolute;left:50%;bottom:15cqw;transform:translateX(-50%);width:2.6cqw;height:2.6cqw;border-radius:50%;background:#98A088"></div>';
  }
  return '<div style="position:absolute;inset:0;background:#F2EFEF;display:flex;flex-direction:column;'
    +'align-items:center;justify-content:center;gap:3cqw;font-family:\'Cormorant Garamond\',Georgia,serif">'
    +'<div style="position:absolute;inset:6cqw;border:1px solid #CEC7C3;border-radius:50%"></div>'
    +'<div style="font-size:33cqw;font-weight:400;line-height:.8;color:#1C1C1E;letter-spacing:-.03em;'
    +'font-variant-numeric:lining-nums;font-feature-settings:\'lnum\' 1">'+h.num+'</div>'
    +'<div style="width:13cqw;height:1.5px;background:#6E7266"></div></div>';
}

/* =====================================================================
   INSTAGRAMS EGET UI — riktig overlay, ingen debugfärg
   Måtten är Instagrams, omräknade till cqw (1080 px bred ram).
   ===================================================================== */
function igOverlay(n, idx){
  n = n||5; idx = idx||0;
  var gp=0.74, pad=2.22, tw=(100-2*pad-gp*(n-1))/n, bars='';
  for(var j=0;j<n;j++){
    bars += '<i style="position:absolute;left:'+(pad+j*(tw+gp)).toFixed(2)+'cqw;top:1.85cqw;width:'+tw.toFixed(2)
      +'cqw;height:.42cqw;border-radius:.21cqw;background:rgba(255,255,255,'+(j<=idx?'.95':'.34')+')"></i>';
  }
  return '<div style="position:absolute;inset:0;z-index:30;pointer-events:none;font-family:Montserrat,-apple-system,sans-serif">'
   +'<div style="position:absolute;left:0;right:0;top:0;height:21.3cqw;background:linear-gradient(180deg,rgba(0,0,0,.42),rgba(0,0,0,0))"></div>'
   +'<div style="position:absolute;left:0;right:0;bottom:0;height:25.9cqw;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.46))"></div>'
   +bars
   +'<div style="position:absolute;left:2.6cqw;top:6.3cqw;display:flex;align-items:center;gap:1.9cqw">'
     +'<span style="width:5.6cqw;height:5.6cqw;border-radius:50%;background:#F2EFEF;display:grid;place-items:center;overflow:hidden">'
       +vmark("#1C1C1E","#6E7266",'style="width:56%;height:auto"')+'</span>'
     +'<span style="font-size:2.78cqw;font-weight:600;color:#fff">viewly.se</span>'
     +'<span style="font-size:2.5cqw;color:rgba(255,255,255,.7)">2 h</span></div>'
   +'<span style="position:absolute;right:3cqw;top:7.4cqw;font-size:3.2cqw;font-weight:700;color:#fff;letter-spacing:.06em">···</span>'
   +'<div style="position:absolute;left:2.8cqw;right:2.8cqw;bottom:5.6cqw;display:flex;align-items:center;gap:2.6cqw">'
     +'<span style="flex:1;height:8.1cqw;border:1px solid rgba(255,255,255,.85);border-radius:4.05cqw;display:flex;align-items:center;padding:0 3.8cqw;font-size:2.7cqw;color:rgba(255,255,255,.82)">Skicka meddelande</span>'
     +'<svg viewBox="0 0 24 24" style="width:5.4cqw;height:5.4cqw;flex:0 0 5.4cqw;fill:none;stroke:#fff;stroke-width:1.7"><path d="M20.8 8.6c0 4.6-8.8 9.6-8.8 9.6s-8.8-5-8.8-9.6a4.4 4.4 0 0 1 8.8-1.3 4.4 4.4 0 0 1 8.8 1.3z"/></svg>'
     +'<svg viewBox="0 0 24 24" style="width:5.4cqw;height:5.4cqw;flex:0 0 5.4cqw;fill:none;stroke:#fff;stroke-width:1.7;stroke-linejoin:round"><path d="M21.5 3.5 2.8 10.2l7.4 2.6 2.6 7.4z"/></svg>'
   +'</div></div>';
}
