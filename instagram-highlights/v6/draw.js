/* =====================================================================
   VIEWLY — STORY RENDERER
   Två riktningar: ARKIV (tryckt monografi) och SKUGGA (cinematisk).
   Nio kompositionsprimitiv per riktning — inte helbild på allt.

   Allt ritas i HTML/CSS inuti en container med container-type:inline-size,
   så 1cqw = 1 % av ramens bredd = 10,8 px i en 1080 × 1920-Story.
   ===================================================================== */
var M = window.VMEDIA || {};
/* egna uppladdade bilder hamnar i samma pool som det medföljande biblioteket */
var UPLOADS = {};
function mediaURL(k){ return UPLOADS[k] || M[k] }

/* Video i en slot: UPLOADS håller en stillbild ur klippet så all statisk
   rendering fungerar oförändrat, och VIDEOS håller själva klippet. Elementet
   märks med --vk så både uppspelningen i studion och videoexporten hittar det.
   VIDEO_HOLE lämnar rutan genomskinlig när overlayen ska rastreras. */
var VIDEOS = {};
var VIDEO_HOLE = false;
function isVideo(k){ return !!VIDEOS[k] }
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

/* dsize mäter längsta ORD — rätt för rubriker som får radbrytas.
   Listrader bryts inte, så där måste hela strängen rymmas. Utan detta
   spränger en lång post ("Lägenhet — 15–35 redigerade bilder") ramen tyst. */
function lsize(items, cap, adv, avail){
  var m = (items||[]).reduce(function(a,x){ return Math.max(a, String(x).length) }, 1);
  return "font-size:"+Math.min(cap, avail/(adv*m)).toFixed(2)+"cqw;";
}

/* ---------------------------------------------------------------------
   MEDIA-SLOTS
   Masken och kompositionen är LÅSTA. Bilden, fokalpunkten och zoomen
   är REDIGERBARA. bg() läser en override ur SLOTS om slot-id finns.
   --------------------------------------------------------------------- */
var SLOTS = {};
function pick(k, wide){
  if(UPLOADS[k]) return UPLOADS[k];
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
  var vid = isVideo(key);
  var out = (vid && VIDEO_HOLE)
    ? 'background:transparent;'
    : 'background-image:url('+u+');background-size:cover;background-position:50% '+fy.toFixed(1)+'%;';
  if(z!==1) out += 'transform:scale('+z.toFixed(3)+');transform-origin:50% '+fy.toFixed(1)+'%;';
  if(vid) out += '--vk:'+key+';--vfy:'+fy.toFixed(1)+';';
  return out;
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
+'.z{position:absolute;z-index:6}'
/* miniatyr-artboard: egen container så cqw räknas mot kortet, inte mot ramen */
+'.mini{display:flex;flex-direction:column;gap:1.2cqw;opacity:.5}'
+'.mini.on{opacity:1}'
+'.miniart{width:100%;aspect-ratio:4/5;position:relative;overflow:hidden;container-type:inline-size;text-align:left}'
/* videoslot: klippet ligger i samma ruta som stillbilden skulle ha legat i */
+'.vfill{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;border:0}';

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
   var fs = lsize(s.items, 6.2, SERIF, 79.2);
   var rows = s.items.map(function(t,j){
     return '<div style="display:flex;align-items:baseline;gap:3cqw;padding:2.4cqw 0;border-bottom:1px solid #E2DCD9">'
      +'<span class="a-fol" style="width:5cqw;flex:0 0 5cqw;color:#6E7266">'+String(j+1).padStart(2,"0")+'</span>'
      +'<span style="'+fs+'font-weight:300;line-height:1.06">'+esc(t)+'</span></div>';
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
    /* V:ets spets korsar rubriken. Med en ljus bild blev vit text på ljus
       plåt — mörkret får därför tillbaka underkanten, utan att dämpa
       märket. */
    +'<div style="position:absolute;left:0;right:0;bottom:0;height:64cqw;z-index:3;'
      +'background:linear-gradient(180deg,rgba(14,14,13,0) 0%,rgba(14,14,13,.70) 46%,rgba(14,14,13,.95) 100%)"></div>'
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
   /* Plåten hade fast 3:4 och texten låg absolut mot underkanten — vid
      två rader rubrik hamnade texten INNE i bilden. Nu delar de en
      kolumn: bilden tar det som blir över, texten tar vad den behöver. */
   var c='position:absolute;width:5cqw;height:5cqw;border-color:#98A088;border-style:solid;';
   return B.shell(
     B.kick(s.k)
    +'<div class="z" style="left:8cqw;right:8cqw;top:34cqw;bottom:'+(SAFE.bot+4)+'cqw;'
      +'display:flex;flex-direction:column;gap:5cqw">'
    +'<div style="flex:1;min-height:0;position:relative">'
      +'<div style="position:absolute;inset:0;overflow:hidden"><div style="position:absolute;inset:0;'+bg(s.m,sid(s))+'"></div></div>'
      +'<div class="b-v"></div>'
      +'<i style="'+c+'left:-1.4cqw;top:-1.4cqw;border-width:1px 0 0 1px"></i>'
      +'<i style="'+c+'right:-1.4cqw;top:-1.4cqw;border-width:1px 1px 0 0"></i>'
      +'<i style="'+c+'left:-1.4cqw;bottom:-1.4cqw;border-width:0 0 1px 1px"></i>'
      +'<i style="'+c+'right:-1.4cqw;bottom:-1.4cqw;border-width:0 1px 1px 0"></i></div>'
    +'<div style="flex:0 0 auto;display:flex;flex-direction:column;gap:2.4cqw">'
    +'<div class="b-d" style="'+dsize(s.h,8.2,SERIF,8)+'">'+esc(s.h)+'</div>'
    +(s.s?'<div class="b-b">'+esc(s.s)+'</div>':'')+'</div></div>'
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
   var fs = lsize(s.items, 6, SERIF, 82.2);
   var rows=s.items.map(function(t,j){
     return '<div style="position:relative;display:flex;align-items:center;min-height:7cqw">'
      +'<span style="position:absolute;left:-4.05cqw;top:50%;transform:translateY(-50%);width:1.5cqw;height:1.5cqw;'
      +'border-radius:50%;background:'+(j===0?"#98A088":"#33332F")+'"></span>'
      +'<span style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;'+fs+'line-height:1.2;color:'+(j===0?"#EFEDE7":"#8C8A84")+'">'+esc(t)+'</span></div>';
   }).join("");
   return B.shell(
     B.kick(s.k)
    /* Listan var förankrad i överkanten och tre poster lämnade halva
       ramen tom. Blocket centreras i stället — det håller för tre lika
       väl som för sju. */
    +'<div class="z" style="left:6cqw;right:7cqw;top:50%;transform:translateY(-52%);display:flex;flex-direction:column;gap:2.4cqw">'
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

/* Redigeringar läggs ovanpå originaldatan vid rendering, aldrig i den.
   Nyckeln är slot-id:t, så ändringen följer sin plats i biblioteket och
   originalet finns alltid kvar att återställa till. */
var EDITS = {};

/* ---------------------------------------------------------------------
   TRE FÖRSLAG PER BILDRUTA
   Varje Story finns i tre utföranden. Förslag A är originalet; B och C är
   PATCHAR ovanpå det — de byter komposition och omformulerar budskapet,
   men de ändrar aldrig originaldatan. Valet ligger i PICKS[sid] och läggs
   på före EDITS, så att en egen text alltid vinner över förslaget.

   Ordningen är därför: original → valt förslag → egna ändringar.
   --------------------------------------------------------------------- */
var PICKS = {};
var ALTS  = {};                      /* sid -> [patchB, patchC] */
function altsOf(s){
  var a = s.sid && ALTS[s.sid];
  return a && a.length ? a : null;
}
function variantCount(s){ var a = altsOf(s); return a ? a.length + 1 : 1 }
/* Bara förslaget, utan egna ändringar. Editorn behöver det som "original"
   att jämföra mot och att återställa till. */
function picked(s){
  var v = s.sid ? (PICKS[s.sid]|0) : 0, a = altsOf(s);
  return (v && a && a[v-1]) ? Object.assign({}, s, a[v-1]) : s;
}
function effective(s){
  s = picked(s);
  var e = s.sid && EDITS[s.sid];
  if(e) s = Object.assign({}, s, e);
  return s;
}
function story(dirId, s, i, n){
  s = effective(s);
  var r = RENDER[dirId] || A;
  var f = r[s.p] || r.fullbleed;
  return f(s, i, n);
}

/* =====================================================================
   COVERS — symboler, inte siffror
   Ett nummer låser ordningen: lägger man till ett kapitel eller flyttar
   ett måste alla omslag ritas om. Varje kapitel har i stället ett eget
   märke, tecknat med två till fyra streck i samma hårlinje som resten
   av systemet. Ordningen är fri.
   ===================================================================== */
var GW = 100;                                       /* glyfernas viewBox */

/* ---------------------------------------------------------------------
   MÄRKENA — graverade kapitelmärken

   Fyra försök ligger bakom den här uppsättningen och alla fyra lärde ut
   något:

     hårlinjer, små      generiska och för svaga — men läsbarheten vid
                         56 px var faktiskt aldrig problemet
     fyllda UI-figurer   massa nog, men läste som ett ikonbibliotek
     beskurna fragment   grafiskt starka, men Bauhaus-affischer
     ljusa tvättar       lugna, men så abstrakta att motivet försvann

   Slutsatsen: linjen var rätt språk, skalan och specificiteten var fel.
   Märkena är nu graverade teckningar — en enda linjevikt genom hela
   uppsättningen, ritade STORT så att de fyller plåten, och varje motiv
   är den faktiska leveransen: ett fönster med ljus, ett rum i
   axonometri, ett kvarter med gator, en kontaktkarta.

   Regler:
     · en linjevikt (3,2 i 100-rutan) — inga blandade tjocklekar
     · fyllning bara som svag tvätt, aldrig som huvudform
     · exakt ett olivelement per märke, och det är alltid det som
       betyder något: solen, ståpunkten, lampan, bostaden
     · logotypen är enda undantaget och får vara helt i bläck

   Varje glyf tar bläck, accent och GRUND. Grunden är vad urkarvningen
   fylls med och skiljer sig mellan riktningarna — samma teckning, rätt
   kontrast i båda.
   --------------------------------------------------------------------- */
function gid(){ return "g"+Math.random().toString(36).slice(2,8) }
var LW = 3.2;                                 /* uppsättningens linjevikt */
function ln(d, w, op){ return '<path d="'+d+'" fill="none" stroke="__C__" stroke-width="'
  +(w||LW)+'" stroke-linecap="square" stroke-linejoin="miter"'+(op?' opacity="'+op+'"':'')+'/>' }
function inkfix(str, c){ return str.split("__C__").join(c) }

var GLYPHS = {

  /* 01 · VIEWLY — logotypen. Enda kapitlet som får bära märket bokstavligt,
     och enda märket som är massa i stället för linje. */
  vmark:   {n:"V-märket", d:"Logotypen, spårad geometri",
    svg:function(c,a,g){ return '<g transform="translate(9 18) scale(.0955)">'
      +'<path d="'+GEO.limb+'" fill="'+c+'"/>'
      +'<circle cx="'+GEO.dot.cx+'" cy="'+GEO.dot.cy+'" r="'+GEO.dot.r+'" fill="'+a+'"/></g>' }},

  /* 02 · FOTOGRAFERING — fönstret, solen och ljuset som faller in på
     golvet. "Ljus. Vi väntar in det." — kapitlets egen mening. */
  aperture:{n:"Ljuset", d:"Fönstret, solen och ljuset på golvet",
    svg:function(c,a,g){ return inkfix(
       '<path d="M42 86 L64 58 H96 L88 86 Z" fill="__C__" opacity=".11"/>'
      +ln("M42 86 L64 58 H96 L88 86", 2.4, ".34")
      +ln("M16 12 H58 V64 H16 Z")
      +ln("M37 12 V64 M16 38 H58", 2.2, ".48")
      +'<circle cx="47.5" cy="25" r="7.5" fill="'+a+'"/>'
      +ln("M4 86 H96"), c) }},

  /* 03 · 3D VISNING — volymen i axonometri, och punkten där betraktaren
     står inne i den. Matterports egen bild av bostaden. */
  cube:    {n:"Volymen", d:"Rummet i axonometri, med ståpunkt",
    svg:function(c,a,g){ return inkfix(
       '<path d="M10 30 L50 50 V90 L10 70 Z" fill="__C__" opacity=".10"/>'
      +ln("M50 10 L90 30 L50 50 L10 30 Z")
      +ln("M10 30 V70 L50 90 L90 70 V30")
      +ln("M50 50 V90")
      +'<circle cx="50" cy="66" r="8.5" fill="'+a+'"/>', c) }},

  /* 04 · E-STYLING — samma rum, halva möblerat. Sömmen i mitten är hela
     tjänsten: tomt till vänster, inrett till höger. */
  halves:  {n:"Halvan", d:"Tomt till vänster, inrett till höger",
    svg:function(c,a,g){ return inkfix(
       ln("M10 24 H90 V80 H10 Z")
      +ln("M50 24 V80", 2.6, ".6")
      +ln("M16 71 H43", 2.4, ".2")
      +'<path d="M57 54 H86 V71 H57 Z" fill="__C__" opacity=".12"/>'
      +ln("M57 54 H86 V71 H57 Z", 2.8)
      +ln("M57 61.5 H86", 2.2, ".45")
      +ln("M55 76 H88", 2.4, ".3")
      +ln("M70 24 V33", 2.4)
      +'<path d="M62 42 L78 42 L74.2 33 L65.8 33 Z" fill="'+a+'"/>', c) }},

  /* 05 · ATMOSPHERE — solen halvt nere över horisonten. Tjänsten ändrar
     ljus, väder och årstid; märket lovar inget annat. */
  sun:     {n:"Himlen", d:"Halv sol över horisonten",
    svg:function(c,a,g){ return inkfix(
       '<path d="M27 64 A23 23 0 0 1 73 64 Z" fill="'+a+'"/>'
      +ln("M4 64 H96")
      +ln("M50 16 V27 M20 27 L27.5 34.5 M80 27 L72.5 34.5", 3, null)
      +ln("M12 76 H88", 2.6, ".34")
      +ln("M24 88 H76", 2.2, ".2"), c) }},

  /* 06 · DRÖNARE — höjden. Blickfältet öppnar sig från en punkt i luften
     ned över tomten. Kvadkoptern är verktyget och syns därför inte. */
  drone:   {n:"Höjden", d:"Blickfältet ned över tomten",
    svg:function(c,a,g){ return inkfix(
       '<path d="M50 10 L78 88 H22 Z" fill="__C__" opacity=".07"/>'
      +ln("M50 10 L72 62 M50 10 L28 62", 2.4, ".42")
      +'<path d="M50 62 L64 74 V88 H36 V74 Z" fill="__C__" opacity=".13"/>'
      +ln("M36 88 V74 L50 62 L64 74 V88")
      +ln("M28 88 H72", 3, ".7")
      +'<circle cx="50" cy="18" r="8.5" fill="'+a+'"/>', c) }},

  /* 07 · OMRÅDESKARTA — kvarteret. Gatorna korsar plåten och går ut i
     kant, ett kvarter är fyllt, punkten är bostaden. Ingen kartnål. */
  map:     {n:"Kvarteret", d:"Gator som korsar, bostaden som punkt",
    svg:function(c,a,g){ return inkfix('<g transform="rotate(-19 50 50)">'
      +'<path d="M32 44 H72 V72 H32 Z" fill="__C__" opacity=".16"/>'
      +'<path d="M-24 -10 H22 V30 H-24 Z" fill="__C__" opacity=".09"/>'
      +ln("M-24 37 H124", 4.6, ".85")
      +ln("M-24 79 H124", 2.6, ".3")
      +ln("M25 -24 V124", 3.4, ".5")
      +ln("M79 -24 V124", 2.4, ".28")
      +'</g><circle cx="53" cy="58" r="8.5" fill="'+a+'"/>', c) }},

  /* 08 · MOTION — tre bildrutor marscherar genom plåten, klippet ligger i
     den främsta. Bilderna finns redan; filmen är nästa steg. */
  motion:  {n:"Svepet", d:"Tre bildrutor, klippet i den främsta",
    svg:function(c,a,g){ return inkfix(
       ln("M6 26 H28 V74 H6 Z", 2.4, ".3")
      +ln("M30 18 H56 V82 H30 Z", 2.8, ".55")
      +'<path d="M58 10 H94 V90 H58 Z" fill="__C__" opacity=".09"/>'
      +ln("M58 10 H94 V90 H58 Z")
      +'<path d="M70 40 L84 50 L70 60 Z" fill="'+a+'"/>', c) }},

  /* 09 · ANNONSEN — spalten. Rubriken i oliv, brödtexten under, sista
     raden kort. Kapitlet säljer utfallet, inte AI:n bakom. */
  lines:   {n:"Spalten", d:"Rubrik i oliv, brödtext under",
    svg:function(c,a,g){ return inkfix(
       '<rect x="14" y="22" width="50" height="7" rx="3.5" fill="'+a+'"/>'
      +ln("M14 44 H86", 3.4, ".8")
      +ln("M14 57 H86", 3.4, ".5")
      +ln("M14 70 H86", 3.4, ".5")
      +ln("M14 83 H58", 3.4, ".5"), c) }},

  /* 10 · KAMPANJEN — formaten, nästlade i sanna proportioner. 9:16 ytterst,
     4:5, 1:1 innerst. Samma objekt, tre ytor. */
  formats: {n:"Formaten", d:"9:16, 4:5 och 1:1 nästlade",
    svg:function(c,a,g){ return inkfix(
       ln("M8 6 H52 V84 H8 Z", 2.4, ".34")
      +ln("M25 22 H73 V82 H25 Z", 2.8, ".55")
      +'<path d="M42 38 H90 V86 H42 Z" fill="__C__" opacity=".09"/>'
      +ln("M42 38 H90 V86 H42 Z")
      +'<rect x="42" y="38" width="48" height="5.4" fill="'+a+'"/>', c) }},

  /* 11 · SYSTEMET — ryggraden. En axel genom plåten med sina noder;
     den översta är tänd. Portalen är det som håller ihop de sju delarna. */
  spine:   {n:"Ryggraden", d:"En axel, noderna på den",
    svg:function(c,a,g){ return inkfix(
       ln("M50 14 V90", 2.6, ".45")
      +ln("M26 40 H45 M55 62 H74", 2.2, ".3")
      +'<circle cx="50" cy="14" r="9.5" fill="'+a+'"/>'
      +'<circle cx="50" cy="40" r="6.6" fill="__C__"/>'
      +'<circle cx="50" cy="62" r="6.6" fill="__C__" opacity=".6"/>'
      +'<circle cx="50" cy="84" r="6.6" fill="__C__" opacity=".35"/>'
      +'<circle cx="26" cy="40" r="3.6" fill="__C__" opacity=".4"/>'
      +'<circle cx="74" cy="62" r="3.6" fill="__C__" opacity=".3"/>', c) }},

  /* 12 · OBJEKT — kontaktkartan. Ett enda objekt genom hela kedjan: sex
     plåtar ur samma bostad, en av dem tänd. */
  gable:   {n:"Kontaktkartan", d:"Sex plåtar ur samma bostad",
    svg:function(c,a,g){ var r='';
      for(var i=0;i<6;i++){ var x=10+(i%2)*42, y=12+(((i/3)|0))*0 + (((i/2)|0))*26;
        r += (i===3)
          ? '<rect x="'+x+'" y="'+y+'" width="38" height="22" fill="'+a+'"/>'
          : ln("M"+x+" "+y+" H"+(x+38)+" V"+(y+22)+" H"+x+" Z", 2.6, (i===2?".8":".45")); }
      return inkfix(r, c) }},

  /* 13 · INIFRÅN — snittet. Två cirklar och det de delar: hantverk och
     teknik, ingen av delarna räcker ensam. */
  people:  {n:"Snittet", d:"Två cirklar och det de delar",
    svg:function(c,a,g){ var id=gid();
      return inkfix('<defs><clipPath id="'+id+'"><circle cx="34" cy="50" r="30"/></clipPath></defs>'
      +'<g clip-path="url(#'+id+')"><circle cx="66" cy="50" r="30" fill="'+a+'"/></g>'
      +'<circle cx="34" cy="50" r="30" fill="none" stroke="__C__" stroke-width="'+LW+'"/>'
      +'<circle cx="66" cy="50" r="30" fill="none" stroke="__C__" stroke-width="'+LW+'"/>', c) }},

  /* 14 · DITT HEM — dörren. Valvet, överljuset och handtaget. Kapitlets
     enda fråga är hur man börjar, så märket är en ingång. */
  door:    {n:"Dörren", d:"Valvet, överljuset och handtaget",
    svg:function(c,a,g){ return inkfix(
       '<path d="M22 88 V48 A28 28 0 0 1 78 48 V88 Z" fill="__C__" opacity=".10"/>'
      +ln("M22 88 V48 A28 28 0 0 1 78 48 V88")
      +ln("M34 56 H66", 2.6, ".55")
      +ln("M8 88 H92")
      +'<circle cx="68" cy="70" r="6" fill="'+a+'"/>', c) }}
};

var GLYPH_IDS = Object.keys(GLYPHS);

/* omslagsredigeringar: symbol, bild, utsnitt — per kapitel */
var CEDITS = {};
function cov(h, key){
  var e = CEDITS[h.id] || {};
  return e[key] != null ? e[key] : h[key];
}
function glyphSVG(h, col, accent, ground, sizeCqw){
  var g = GLYPHS[cov(h,"glyph")] || GLYPHS.vmark;
  return '<svg viewBox="0 0 '+GW+' '+GW+'" style="width:'+sizeCqw+'cqw;height:'+sizeCqw
    +'cqw;display:block;overflow:visible" aria-hidden="true">'+g.svg(col, accent, ground)+'</svg>';
}

/* ---------------------------------------------------------------------
   OMSLAGSGRUNDEN
   Ett omslag är inte en ikon i en cirkel. Det är en liten tryckt plåt,
   och den behöver tre saker som den förra versionen saknade:

   1. En KANT. #F2EFEF mot Instagrams vita profilbakgrund har kontrast
      1,1:1 — omslaget hade ingen ytterkontur alls i ljust läge. En
      hårlinje i bläck ger 15:1 och läser som en tryckt plåtkant.
   2. En GRUND med djup. Papperet får en svag lutning uppifrån och ned,
      mörkret en varm lyftning bakom märket. Platt fyllning ser billigt
      ut i just den här storleken.
   3. STÖRRE MÄRKE. 34 cqw lämnade en tom ring runt varje symbol. 42 cqw
      fyller plåten utan att röra kanten.
   --------------------------------------------------------------------- */
var COVGEO = {
  /* Accenten är lyft ur systemets #6E7266 / #98A088. Samma hue, mer ljushet:
     mot bläcket i ett märke läste den ursprungliga oliven som grå vid 56 px,
     och då är accenten meningslös. Lyftet gäller bara omslagen. */
  arkiv:  {ink:"#1C1C1E", accent:"#7E8A6B", ground:"#F1EDEA",
           ring:"#1C1C1E", inner:"#C6BEB8"},
  skugga: {ink:"#EFEDE7", accent:"#A9B394", ground:"#0E0E0D",
           ring:"#6E6C66", inner:"#2A2A26"}
};

/* ar: "1:1" i profilraden, "9:16" vid export — plåten sitter still, ytan växer */
function cover(dirId, h, ar){
  var sq = ar !== "9:16";
  var t = COVGEO[dirId] || COVGEO.arkiv;
  /* Teckningen fyller plåten och beskärs av cirkeln. Ingen inre marginal:
     marginalen är beskärningen. */
  var plate = sq ? 'inset:0' : 'left:8cqw;right:8cqw;top:50%;transform:translateY(-50%);aspect-ratio:1';
  var art = '<div style="position:absolute;inset:0;overflow:hidden;border-radius:50%">'
    +'<svg viewBox="0 0 '+GW+' '+GW+'" preserveAspectRatio="xMidYMid slice" '
    +'style="position:absolute;inset:0;width:100%;height:100%;display:block" aria-hidden="true">'
    + (GLYPHS[cov(h,"glyph")]||GLYPHS.vmark).svg(t.ink, t.accent, t.ground)
    +'</svg></div>';
  /* Nyckellinjen ligger överst. #F2EFEF mot Instagrams vita profil hade
     kontrast 1,1:1 — plåten saknade ytterkontur helt i ljust läge. */
  /* Mätt: en 1 px-ring gav plåten 1,7:1 mot Instagrams vita profil — under
     3:1-tröskeln för icke-text, alltså ingen ytterkontur alls i ljust läge.
     Linjen anges i cqw så att den skalar: 1,7 cqw är ~1 px vid 56 px, som
     är den enda storlek omslaget faktiskt visas i. */
  var ring = '<div style="position:absolute;inset:0;border:2.6cqw solid '+t.ring
    +';border-radius:50%;opacity:'+(dirId==="skugga"?".85":"1")+';pointer-events:none"></div>';

  if(dirId==="skugga"){
    return '<div style="position:absolute;'+plate+';border-radius:50%;background:#0E0E0D;overflow:hidden">'
      /* Fotografiet är textur under teckningen, inte motiv. Utan den
         nedtoningen blir varje omslag en egen gråton och raden faller isär. */
      +'<div style="position:absolute;inset:0;'+bg(cov(h,"cover"),"cover-"+h.id)+';opacity:.26"></div>'
      +'<div style="position:absolute;inset:0;background:radial-gradient(66% 66% at 50% 44%,'
      +'rgba(14,14,13,.55),rgba(14,14,13,.88) 62%,rgba(14,14,13,.99))"></div>'
      + art + ring +'</div>';
  }
  return '<div style="position:absolute;'+plate+';border-radius:50%;overflow:hidden;'
      +'background:radial-gradient(72% 62% at 50% 32%,#F9F7F5,#F0ECE8 54%,#DED6CF)">'
      + art + ring +'</div>';
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

/* =====================================================================
   INFORMATIONSDESIGN — tre primitiv till
   Här slutar layouten vara en behållare för text och börjar rita hur
   något faktiskt fungerar: input → bearbetning → output, en formatmatris
   i sanna proportioner, och en kampanj som fyra faktiska artboards.
   ===================================================================== */

/* ---- delade byggstenar ---- */
function thumbRow(keys, h, gap, brd){
  return '<div style="display:flex;gap:'+gap+'cqw">'+keys.map(function(k){
    return '<span style="flex:1;height:'+h+'cqw;'+bg(k)+';border:1px solid '+brd+'"></span>'}).join("")+'</div>';
}
function toneRow(o, on, off, act){
  if(!o.tones) return '';
  return '<div style="display:flex;gap:1.2cqw;margin-bottom:2.4cqw">'+o.tones.map(function(t,j){
    var is = j===(o.now||0);
    return '<span style="font-family:Montserrat,sans-serif;font-size:1.75cqw;letter-spacing:.12em;'
     +'text-transform:uppercase;padding:.7cqw 1.6cqw;border:1px solid '+(is?act:off)+';'
     +(is?'background:'+act+';color:'+on+';font-weight:600':'color:'+off)+'">'+esc(t)+'</span>';
  }).join("")+'</div>';
}
function arrowDown(col, h){
  return '<div style="display:flex;flex-direction:column;align-items:center;height:'+h+'cqw;justify-content:center">'
   +'<span style="width:1px;flex:1;background:'+col+'"></span>'
   +'<svg viewBox="0 0 10 10" style="width:2.4cqw;height:2.4cqw;display:block;margin-top:-.2cqw">'
   +'<path d="M5 9 L1 4 M5 9 L9 4" fill="none" stroke="'+col+'" stroke-width="1"/></svg></div>';
}

/* ---------------------------------------------------------------- A · ARKIV */

/* 10 · FLOW — input, bearbetning, output som ett tryckt diagram */
A.flow = function(s,i,n){
  var sig = s.mid.items.map(function(t,j){
    return '<div style="display:flex;align-items:baseline;gap:1.6cqw;padding:1.15cqw 0">'
     +'<span style="width:1.1cqw;height:1.1cqw;border-radius:50%;border:1px solid #6E7266;flex:0 0 1.1cqw"></span>'
     +'<span style="font-size:3.1cqw;font-weight:300;line-height:1.15">'+esc(t)+'</span></div>';
  }).join("");
  var lines = s.out.lines.map(function(w){
    return '<span style="display:block;height:1.15cqw;background:#DFD9D6;margin-bottom:1.15cqw;width:'+w+'%"></span>';
  }).join("");
  var stg = function(t){ return '<div class="a-fig" style="margin-bottom:1.8cqw">'+esc(t)+'</div>' };
  return A.chrome(s.k,i,n,
    '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:3cqw 0">'
   +'<div class="a-d sm" style="'+dsize(s.h,7.4,SERIF)+'margin-bottom:3.4cqw">'+esc(s.h)+'</div>'
   + stg("01 — "+s.inp.lab)
   + thumbRow(s.inp.ims, 9.5, 1.2, "#D8D2CF")
   + arrowDown("#C9C2BE", 5.4)
   + stg("02 — "+s.mid.lab)
   +'<div style="columns:2;column-gap:4cqw;border-top:1px solid #E2DCD9;border-bottom:1px solid #E2DCD9;padding:1.4cqw 0">'+sig+'</div>'
   + arrowDown("#C9C2BE", 5.4)
   + stg("03 — "+s.out.lab)
   + toneRow(s.out, "#F2EFEF", "#A9A29E", "#6E7266")
   +'<div style="border:1px solid #D8D2CF;padding:3cqw 3.2cqw 3.4cqw">'
     +'<div style="font-size:5.2cqw;font-weight:300;line-height:1.06;margin-bottom:2.4cqw">'+esc(s.out.title)+'</div>'
     +'<div class="a-l" style="font-size:2.5cqw;line-height:1.55;margin-bottom:2cqw">'+esc(s.out.lead)+'</div>'
     + lines
   +'</div></div>');
};

/* 11 · MATRIX — samma objekt i sanna formatproportioner */
A.matrix = function(s,i,n){
  var H = 33;                                   /* gemensam höjd — bredden blir formatet */
  var cells = s.fmts.map(function(f){
    var w = (H*f[2]/f[3]).toFixed(1);
    return '<div style="display:flex;flex-direction:column;gap:1.5cqw;flex:0 0 auto">'
     +'<div style="width:'+w+'cqw;height:'+H+'cqw;position:relative;border:1px solid #D8D2CF;overflow:hidden">'
       +'<div style="position:absolute;inset:0;'+bg(s.m,sid(s))+'"></div></div>'
     +'<div><div class="a-c" style="font-size:1.85cqw;color:#1C1C1E">'+esc(f[1])+'</div>'
       +'<div class="a-fig" style="font-size:1.7cqw;margin-top:.5cqw">'+f[0]+' · 1080×'+Math.round(1080*f[3]/f[2])+'</div></div>'
     +'</div>';
  }).join("");
  return A.chrome(s.k,i,n,
    '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:4.4cqw">'
   +'<div class="a-d sm" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>'
   +'<div style="display:flex;gap:2.6cqw;align-items:flex-end">'+cells+'</div>'
   +'<div><div class="a-r" style="margin-bottom:2.2cqw"></div>'
   +'<div class="a-l" style="font-size:2.8cqw">'+esc(s.s)+'</div></div></div>');
};

/* 12 · PHASES — kampanjen som fyra faktiska mallar, inte fyra etiketter */
A.phases = function(s,i,n){
  var cards = s.items.map(function(pid,j){
    var pp = POSTS.filter(function(x){return x.id===pid})[0];
    if(!pp) return '';
    return '<div class="mini'+(j===s.now?' on':'')+'">'
     +'<div class="miniart">'+post("arkiv", pp, "4:5")+'</div>'
     +'<span class="a-fig" style="font-size:1.6cqw">'+esc(pp.stage)+'</span></div>';
  }).join("");
  return A.chrome(s.k,i,n,
    '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:3.4cqw">'
   +'<div class="a-d sm" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>'
   +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:2.4cqw;max-width:64%">'+cards+'</div>'
   +(s.s?'<div class="a-l" style="font-size:2.8cqw">'+esc(s.s)+'</div>':'')+'</div>');
};

/* ---------------------------------------------------------------- B · SKUGGA */

B.flow = function(s,i,n){
  var sig = s.mid.items.map(function(t){
    return '<div style="display:flex;align-items:baseline;gap:1.6cqw;padding:.95cqw 0">'
     +'<span style="width:.9cqw;height:.9cqw;border-radius:50%;background:#98A088;flex:0 0 .9cqw"></span>'
     +'<span style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:3.2cqw;font-weight:300;color:#CFCDC7">'+esc(t)+'</span></div>';
  }).join("");
  var lines = s.out.lines.map(function(w){
    return '<span style="display:block;height:1.05cqw;background:#2C2C28;margin-bottom:1.1cqw;width:'+w+'%"></span>';
  }).join("");
  var stg = function(t){ return '<div class="b-k" style="font-size:1.75cqw;color:#6E6C66;margin-bottom:1.6cqw">'+esc(t)+'</div>' };
  return B.shell(
    B.kick(s.k)
   +'<div class="z" style="left:6cqw;right:6cqw;top:'+(SAFE.top+8)+'cqw">'
   +'<div class="b-d" style="'+dsize(s.h,7.4,SERIF)+'margin-bottom:3.4cqw">'+esc(s.h)+'</div>'
   + stg("01 — "+s.inp.lab)
   + thumbRow(s.inp.ims, 9.5, 1.2, "#23231F")
   + arrowDown("#3A3A34", 5.4)
   + stg("02 — "+s.mid.lab)
   +'<div style="columns:2;column-gap:4cqw;border-top:1px solid #26261F;border-bottom:1px solid #26261F;padding:1.2cqw 0">'+sig+'</div>'
   + arrowDown("#3A3A34", 5.4)
   + stg("03 — "+s.out.lab)
   + toneRow(s.out, "#14150F", "#6E6C66", "#98A088")
   +'<div style="border:1px solid #26261F;padding:2.8cqw 3cqw 3.2cqw;background:#141412">'
     +'<div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:5.2cqw;font-weight:300;line-height:1.06;margin-bottom:2.2cqw">'+esc(s.out.title)+'</div>'
     +'<div class="b-b" style="font-size:2.4cqw;line-height:1.5;margin-bottom:2cqw">'+esc(s.out.lead)+'</div>'
     + lines
   +'</div></div>'
   +B.foot(i,n));
};

B.matrix = function(s,i,n){
  var H = 33;
  var cells = s.fmts.map(function(f){
    var w = (H*f[2]/f[3]).toFixed(1);
    return '<div style="display:flex;flex-direction:column;gap:1.4cqw;flex:0 0 auto">'
     +'<div style="width:'+w+'cqw;height:'+H+'cqw;position:relative;overflow:hidden;outline:1px solid #26261F">'
       +'<div style="position:absolute;inset:0;'+bg(s.m,sid(s))+'"></div></div>'
     +'<div><div class="b-k" style="font-size:1.7cqw;letter-spacing:.2em;color:#EFEDE7">'+esc(f[1])+'</div>'
       +'<div class="b-k" style="font-size:1.6cqw;letter-spacing:.14em;color:#6E6C66;margin-top:.5cqw">'
       +f[0]+' · 1080×'+Math.round(1080*f[3]/f[2])+'</div></div>'
     +'</div>';
  }).join("");
  return B.shell(
    B.kick(s.k)
   +'<div class="z" style="left:6cqw;right:6cqw;top:'+(SAFE.top+24)+'cqw;display:flex;flex-direction:column;gap:4.4cqw">'
   +'<div class="b-d" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>'
   +'<div style="display:flex;gap:2.4cqw;align-items:flex-end">'+cells+'</div>'
   +'<div><div style="width:8cqw;height:1px;background:#98A088;margin-bottom:2.4cqw"></div>'
   +'<div class="b-b">'+esc(s.s)+'</div></div></div>'
   +B.foot(i,n));
};

B.phases = function(s,i,n){
  var cards = s.items.map(function(pid,j){
    var pp = POSTS.filter(function(x){return x.id===pid})[0];
    if(!pp) return '';
    return '<div class="mini'+(j===s.now?' on':'')+'">'
     +'<div class="miniart">'+post("skugga", pp, "4:5")+'</div>'
     +'<span class="b-k" style="font-size:1.55cqw;color:#6E6C66;letter-spacing:.18em">'+esc(pp.stage)+'</span></div>';
  }).join("");
  return B.shell(
    B.kick(s.k)
   +'<div class="z" style="left:6cqw;right:6cqw;top:50%;transform:translateY(-54%);display:flex;flex-direction:column;gap:3.2cqw">'
   +'<div class="b-d" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>'
   +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:2.2cqw;max-width:66%">'+cards+'</div>'
   +(s.s?'<div class="b-b">'+esc(s.s)+'</div>':'')+'</div>'
   +B.foot(i,n));
};

/* ---------------------------------------------------------------------
   13 · WHITE LABEL
   3D-visningssidan och områdeskartan levereras i kundens varumärke, inte
   i Viewlys. Det påståendet går inte att skriva sig ur — det måste visas.
   Samma leverans, två kontor, två uttryck. Färgerna inne i korten tillhör
   de fiktiva kontoren och ingår inte i Viewlys palett.
   --------------------------------------------------------------------- */
function wlCard(b, dark, m, sid_){
  var line = dark ? "rgba(239,237,231,.18)" : "#D8D2CF";
  var ink  = dark ? "#EFEDE7" : "#1C1C1E";
  var mute = dark ? "#8C8A84" : "#A9A29E";
  var pane = dark ? "#141412" : "#FFFFFF";
  return '<div style="border:1px solid '+line+';background:'+pane+';overflow:hidden">'
   +'<div style="display:flex;align-items:center;gap:1.4cqw;padding:2cqw 2.2cqw;border-bottom:1px solid '+line+'">'
     +'<span style="width:3cqw;height:3cqw;border-radius:.5cqw;background:'+b[1]+';flex:0 0 auto"></span>'
     +'<span style="font-family:Montserrat,sans-serif;font-size:1.75cqw;font-weight:700;letter-spacing:.14em;'
     +'text-transform:uppercase;color:'+ink+'">'+esc(b[0])+'</span></div>'
   +'<div style="height:16cqw;position:relative;overflow:hidden">'
     +'<div style="position:absolute;inset:0;'+bg(m, sid_)+'"></div></div>'
   +'<div style="padding:2cqw 2.2cqw 2.4cqw">'
     +'<div style="height:1.1cqw;width:74%;background:'+b[1]+';opacity:.85;margin-bottom:1.2cqw"></div>'
     +'<div style="height:1cqw;width:96%;background:'+line+';margin-bottom:.9cqw"></div>'
     +'<div style="height:1cqw;width:60%;background:'+line+'"></div>'
     +'<div style="margin-top:2cqw;display:inline-block;padding:.9cqw 2cqw;background:'+b[1]+';'
     +'font-family:Montserrat,sans-serif;font-size:1.6cqw;letter-spacing:.12em;text-transform:uppercase;color:#fff">'
     + esc(b[2] || "Visa") +'</div></div></div>';
}
A.whitelabel = function(s,i,n){
  var cards = (s.brands||[]).map(function(b){ return wlCard(b, false, s.m, sid(s)) }).join("");
  return A.chrome(s.k,i,n,
    '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:3.6cqw">'
   +'<div class="a-d sm" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>'
   +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:3cqw">'+cards+'</div>'
   +'<div><div class="a-r" style="margin-bottom:2.2cqw"></div>'
   +'<div class="a-l" style="font-size:2.8cqw">'+esc(s.s)+'</div></div></div>');
};
B.whitelabel = function(s,i,n){
  var cards = (s.brands||[]).map(function(b){ return wlCard(b, true, s.m, sid(s)) }).join("");
  return B.shell(
    B.kick(s.k)
   +'<div class="z" style="left:6cqw;right:6cqw;top:50%;transform:translateY(-54%);display:flex;flex-direction:column;gap:3.4cqw">'
   +'<div class="b-d" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>'
   +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:2.8cqw">'+cards+'</div>'
   +'<div><div style="width:8cqw;height:1px;background:#98A088;margin-bottom:2.2cqw"></div>'
   +'<div class="b-b">'+esc(s.s)+'</div></div></div>'
   +B.foot(i,n));
};

/* =====================================================================
   KAMPANJMALLAR — fyra lägen, tre format, två riktningar
   Det här är vad Social / Ads Studio faktiskt gör: en mall per kampanjfas.
   Statusen är inte en etikett i hörnet — den bestämmer hela kompositionen.
     KOMMANDE  bilden dominerar, informationen hålls tillbaka
     TILL SALU tätast: adress, fakta, visning
     VISNING   en enda uppgift, satt stort
     SÅLD      ordet tar över, bilden backar
   ===================================================================== */
var AR = {"9:16":[9,16], "4:5":[4,5], "1:1":[1,1]};

/* ---------------------------------------------------------------- A · ARKIV */
/* I 9:16 ligger Instagrams svarsfält över de nedersta 26 cqw. Bandet växer
   och får extra bottenpadding där, så faktarad och kolofon aldrig hamnar under. */
function safeBot(ar){ return ar==="9:16" ? SAFE.bot : 4.6 }
function paWrap(p, band, bandH, ar){
  var sb = safeBot(ar), H = bandH + (sb - 4.6);
  return '<div class="a" style="overflow:hidden">'
   +'<div style="position:absolute;left:0;right:0;top:0;bottom:'+H+'cqw;overflow:hidden">'
     +'<div style="position:absolute;inset:0;'+bg(p.m,"post-"+p.id)+'"></div></div>'
   +'<div style="position:absolute;left:0;right:0;bottom:0;height:'+H+'cqw;background:#F2EFEF;'
     +'padding:4.2cqw 5.6cqw '+sb+'cqw;display:flex;flex-direction:column">'+band+'</div></div>';
}
function paFoot(right){
  return '<div style="margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;'
   +'border-top:1px solid #D8D2CF;padding-top:2.4cqw">'
   +'<span class="a-wm" style="font-size:1.95cqw">'+vmark("#1C1C1E","#6E7266")+'VIEWLY</span>'
   +'<span class="a-c" style="font-size:1.8cqw">'+esc(right||"viewly.se")+'</span></div>';
}
function paFacts(f){
  return '<div style="display:flex;border-top:1px solid #D8D2CF;border-bottom:1px solid #D8D2CF">'
   + f.map(function(c,j){
     return '<div style="flex:1;padding:2.2cqw 0 2.2cqw '+(j?'2.6cqw':'0')+';'
      +(j?'border-left:1px solid #E4DEDB;':'')+'">'
      +'<div style="font-size:5.2cqw;font-weight:300;line-height:1">'+esc(c[0])+'</div>'
      +'<div class="a-fig" style="font-size:1.65cqw;margin-top:.9cqw">'+esc(c[1])+'</div></div>';
   }).join("")+'</div>';
}
var PA = {
 /* teaser — hårlinje, spärrad status, adressen som löfte */
 kommande:function(p, ar){
   return paWrap(p,
     '<div style="height:1px;background:#6E7266;width:9cqw;margin-bottom:2.8cqw"></div>'
    +'<div class="a-k" style="font-size:2.35cqw;letter-spacing:.42em">KOMMANDE</div>'
    +'<div class="a-d" style="font-size:7.4cqw;line-height:1.02;margin-top:2.4cqw">'+esc(p.addr)+'</div>'
    +'<div class="a-c" style="font-size:1.9cqw;margin-top:1.6cqw">'+esc(p.city)+'</div>'
    + paFoot(p.when), 34, ar);
 },
 /* tätast — adress, fakta, visning */
 tillsalu:function(p, ar){
   return paWrap(p,
     '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2.2cqw">'
      +'<span class="a-k" style="font-size:2.1cqw">Till salu</span>'
      +'<span class="a-c" style="font-size:1.8cqw">'+esc(p.city)+'</span></div>'
    +'<div class="a-d" style="font-size:6.8cqw;line-height:1.02;margin-bottom:2.8cqw">'+esc(p.addr)+'</div>'
    + paFacts(p.facts)
    + paFoot(p.when), 44, ar);
 },
 /* en enda uppgift, satt stort */
 visning:function(p, ar){
   return paWrap(p,
     '<div class="a-k" style="font-size:2.2cqw;letter-spacing:.34em">Visning</div>'
    +'<div class="a-d" style="font-size:10.4cqw;line-height:.98;margin-top:2.2cqw">'+esc(p.when)+'</div>'
    +'<div style="height:1px;background:#6E7266;width:9cqw;margin:2.6cqw 0 2cqw"></div>'
    +'<div class="a-l" style="font-size:2.4cqw">'+esc(p.addr)+' · '+esc(p.city)+'</div>'
    + paFoot(p.note), 40, ar);
 },
 /* ordet tar över, bilden backar och tonas ner */
 sald:function(p, ar){
   return paWrap(p,
     '<div style="height:1.5px;background:#1C1C1E"></div>'
    +'<div class="a-d" style="font-size:24cqw;line-height:.96;letter-spacing:-.025em;margin:2.4cqw 0 2cqw">Såld</div>'
    +'<div style="height:1.5px;background:#1C1C1E"></div>'
    +'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:2.8cqw">'
      +'<span class="a-l" style="font-size:2.5cqw">'+esc(p.addr)+' · '+esc(p.city)+'</span>'
      +'<span class="a-k" style="font-size:1.9cqw">'+esc(p.note)+'</span></div>'
    + paFoot(p.when), 52, ar)
    .replace('</div></div><div style="position:absolute;left:0;right:0;bottom:0;height:',
             '<div style="position:absolute;inset:0;background:rgba(242,239,239,.26)"></div></div>'
            +'<div style="position:absolute;left:0;right:0;bottom:0;height:');
 }
};

/* ---------------------------------------------------------------- B · SKUGGA */
function pbWrap(p, inner, scrim, ar){
  return '<div class="b" style="overflow:hidden">'
   +'<div style="position:absolute;inset:0;overflow:hidden"><div style="position:absolute;inset:0;'+bg(p.m,"post-"+p.id)+'"></div></div>'
   +'<div style="position:absolute;inset:0;background:'+scrim+'"></div>'
   +'<div style="position:absolute;left:5.6cqw;right:5.6cqw;bottom:'+(ar==="9:16"?SAFE.bot:5)+'cqw;display:flex;flex-direction:column">'+inner+'</div>'
   +'</div>';
}
function pbFoot(right){
  return '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:3.4cqw;'
   +'border-top:1px solid rgba(239,237,231,.18);padding-top:2.4cqw">'
   +'<span class="b-wm" style="font-size:1.95cqw">'+vmark("#EFEDE7","#98A088")+'VIEWLY</span>'
   +'<span class="b-k" style="font-size:1.8cqw;color:#A8A6A0;letter-spacing:.2em">'+esc(right||"viewly.se")+'</span></div>';
}
var SCRIM_LOW  = 'linear-gradient(180deg,rgba(14,14,13,.42) 0%,rgba(14,14,13,0) 26%,rgba(14,14,13,.14) 45%,rgba(14,14,13,.9) 100%)';
var SCRIM_HIGH = 'linear-gradient(180deg,rgba(14,14,13,.5) 0%,rgba(14,14,13,.16) 22%,rgba(14,14,13,.5) 52%,rgba(14,14,13,.96) 100%)';
var PB = {
 kommande:function(p, ar){
   return pbWrap(p,
     '<div style="height:1px;background:#98A088;width:9cqw;margin-bottom:2.6cqw"></div>'
    +'<div class="b-k" style="font-size:2.3cqw;letter-spacing:.42em">KOMMANDE</div>'
    +'<div class="b-d" style="font-size:7.4cqw;line-height:1.02;margin-top:2.2cqw">'+esc(p.addr)+'</div>'
    +'<div class="b-b" style="font-size:2.3cqw;margin-top:1.2cqw">'+esc(p.city)+'</div>'
    + pbFoot(p.when), SCRIM_LOW, ar);
 },
 tillsalu:function(p, ar){
   var facts = p.facts.map(function(c,j){
     return '<div style="flex:1;'+(j?'border-left:1px solid rgba(239,237,231,.18);padding-left:2.6cqw;':'')+'">'
      +'<div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:5cqw;font-weight:300;line-height:1">'+esc(c[0])+'</div>'
      +'<div class="b-k" style="font-size:1.6cqw;color:#8C8A84;margin-top:.9cqw;letter-spacing:.2em">'+esc(c[1])+'</div></div>';
   }).join("");
   return pbWrap(p,
     '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2cqw">'
      +'<span class="b-k" style="font-size:2.1cqw">Till salu</span>'
      +'<span class="b-k" style="font-size:1.8cqw;color:#A8A6A0;letter-spacing:.2em">'+esc(p.city)+'</span></div>'
    +'<div class="b-d" style="font-size:6.8cqw;line-height:1.02;margin-bottom:3cqw">'+esc(p.addr)+'</div>'
    +'<div style="display:flex;border-top:1px solid rgba(239,237,231,.18);border-bottom:1px solid rgba(239,237,231,.18);padding:2.2cqw 0">'+facts+'</div>'
    + pbFoot(p.when), SCRIM_LOW, ar);
 },
 visning:function(p, ar){
   return pbWrap(p,
     '<div class="b-k" style="font-size:2.2cqw;letter-spacing:.34em">Visning</div>'
    +'<div class="b-d" style="font-size:10.4cqw;line-height:.98;margin-top:2cqw">'+esc(p.when)+'</div>'
    +'<div style="height:1px;background:#98A088;width:9cqw;margin:2.6cqw 0 2cqw"></div>'
    +'<div class="b-b" style="font-size:2.4cqw">'+esc(p.addr)+' · '+esc(p.city)+'</div>'
    + pbFoot(p.note), SCRIM_HIGH, ar);
 },
 sald:function(p, ar){
   return pbWrap(p,
     '<div style="height:1.5px;background:#98A088"></div>'
    +'<div class="b-d" style="font-size:24cqw;line-height:.96;letter-spacing:-.025em;margin:2.2cqw 0 1.8cqw">Såld</div>'
    +'<div style="height:1.5px;background:#98A088"></div>'
    +'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:2.6cqw">'
      +'<span class="b-b" style="font-size:2.5cqw;color:#EFEDE7">'+esc(p.addr)+' · '+esc(p.city)+'</span>'
      +'<span class="b-k" style="font-size:1.9cqw">'+esc(p.note)+'</span></div>'
    + pbFoot(p.when),
    'linear-gradient(180deg,rgba(14,14,13,.62),rgba(14,14,13,.78) 40%,rgba(14,14,13,.95))', ar);
 }
};

/* Objektets text — adress, ort, fakta, visningstid — är innehåll, inte design.
   Den redigeras precis som en Story och läggs på vid rendering. */
var PEDITS = {};
function post(dirId, p, ar){
  var e = PEDITS[p.id];
  if(e) p = Object.assign({}, p, e);
  var set = dirId==="skugga" ? PB : PA;
  return (set[p.phase] || set.tillsalu)(p, ar||"4:5");
}
