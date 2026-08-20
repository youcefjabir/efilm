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
  /* Motion är ett fjärde alternativ ovanpå A/B/C, inte en ersättning.
     Är inget valt går allt exakt som förut. */
  if(s.sid && typeof motionFrame === "function"){
    var mf = motionFrame(dirId, s.sid, MOTION_T);
    if(mf) return mf;
  }
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
   OMSLAGEN — pictogram

   Utvärdering av den förra ikonomgången, märke för märke. Sju av fjorton
   var informativa; resten var geometri som råkade se ut som något:

     Kortet          ett kort med block i — läste som ett profilkort
     Rummet möblerat en bänk, inte ett möblerat rum
     Höjden          en lampa, inte en drönare
     Kvarteret       en propeller
     Formaten        block, men proportionerna gick inte att läsa
     Portalen        block
     Kontaktkartan   block

   Och över hela uppsättningen tre fel som gjorde den billig snarare än
   fel: formerna gick nästan ut i kant (ingen luft), valörerna låg för
   nära varandra (grå gröt), och varje märke hade sin egen skala.

   Rättningen är inte fler detaljer utan färre, satta i ett system:

     OPTISK RUTA  varje motiv ryms i 56 × 56 av 100. Marginalen är inte
                  tom yta, den är det som gör en form dyr.
     FYRA TONER   platta, ljus, form, accent. Inga mellanlägen, ingen
                  opacitet — valörerna ska gå att räkna.
     EN ACCENT    exakt en yta i accentfärg per märke, och den ligger på
                  det som betyder något.
     MINST 6 BRED ingen form tunnare än 6 enheter. Hårlinjer hör till
                  systemet Linjen, inte hit.
     ETT BUDSKAP  märket ska gå att namnge på en halv sekund. Kan det
                  inte det är motivet fel, inte utförandet.
   --------------------------------------------------------------------- */
function gid(){ return "g"+Math.random().toString(36).slice(2,8) }

/* Fyra roller. `t3` är accenten och används en gång per märke. */
var COVPAL = {
  arkiv:  {pictogram:{bg:"#EFECE6", t1:"#C8CCBF", t2:"#6E7266", t3:"#1C1C1E"},
           negativ:  {bg:"#6E7266", t1:"#98A088", t2:"#F2F0EA", t3:"#1C1C1E"},
           line:     {bg:"#EFECE6", t1:"#C8CCBF", t2:"#1C1C1E", t3:"#6E7266"}},
  skugga: {pictogram:{bg:"#0E0E0D", t1:"#3A4034", t2:"#98A088", t3:"#EFEDE7"},
           negativ:  {bg:"#2C322A", t1:"#5A6350", t2:"#EFEDE7", t3:"#98A088"},
           line:     {bg:"#0E0E0D", t1:"#33332F", t2:"#EFEDE7", t3:"#98A088"}}
};

/* ---------------------------------------------------------------------
   PICTOGRAM
   Fjorton motiv, alla i den optiska rutan 22–78. Formen är fylld, dess
   detaljer är URSKURNA i plattans färg — aldrig pålagda linjer.
   --------------------------------------------------------------------- */
var PICTO = {
  /* Logotypen. Enda märket som får bryta rutan, för den ÄR märket. */
  vmark:   function(P){ return '<g transform="translate(24 31) scale(.0605)">'
             +'<path d="'+GEO.limb+'" fill="'+P.t2+'"/>'
             +'<circle cx="'+GEO.dot.cx+'" cy="'+GEO.dot.cy+'" r="'+GEO.dot.r+'" fill="'+P.t3+'"/></g>' },

  /* Fotografering: ett kort med ett landskap i. Solen är accenten. */
  aperture:function(P){ return '<rect x="22" y="28" width="56" height="44" fill="'+P.t2+'"/>'
             +'<rect x="28" y="34" width="44" height="32" fill="'+P.bg+'"/>'
             +'<path d="M28 66 L43 50 L53 60 L61 53 L72 66 Z" fill="'+P.t1+'"/>'
             +'<circle cx="62" cy="42" r="5.5" fill="'+P.t3+'"/>' },

  /* 3D: kuben. Tre ytor, tre toner — det är hela poängen med volym. */
  steps:   function(P){ return '<rect x="24" y="60" width="16" height="16" fill="'+P.t1+'"/>'
             +'<rect x="42" y="42" width="16" height="16" fill="'+P.t2+'"/>'
             +'<rect x="60" y="24" width="16" height="16" fill="'+P.t3+'"/>' },
  cube:    function(P){ return '<path d="M50 22 L78 38 L50 54 L22 38 Z" fill="'+P.t1+'"/>'
             +'<path d="M22 38 L50 54 V78 L22 62 Z" fill="'+P.t2+'"/>'
             +'<path d="M78 38 L50 54 V78 L78 62 Z" fill="'+P.t3+'"/>' },

  /* E-styling: fåtöljen. En möbel säger möblerat snabbare än ett rum. */
  halves:  function(P){ return '<rect x="30" y="22" width="40" height="30" fill="'+P.t2+'"/>'
             +'<rect x="22" y="40" width="9" height="24" fill="'+P.t2+'"/>'
             +'<rect x="69" y="40" width="9" height="24" fill="'+P.t2+'"/>'
             +'<rect x="30" y="50" width="40" height="14" fill="'+P.t2+'"/>'
             +'<rect x="27" y="64" width="7" height="12" fill="'+P.t1+'"/>'
             +'<rect x="66" y="64" width="7" height="12" fill="'+P.t1+'"/>'
             +'<rect x="37" y="28" width="17" height="13" fill="'+P.t3+'"/>' },

  /* Atmosphere: solen över horisonten. */
  sun:     function(P){ return '<path d="M30 58 A20 20 0 0 1 70 58 Z" fill="'+P.t2+'"/>'
             +'<rect x="20" y="58" width="60" height="6" fill="'+P.t3+'"/>'
             +'<rect x="26" y="68" width="48" height="5" fill="'+P.t1+'"/>'
             +'<rect x="34" y="77" width="32" height="4" fill="'+P.t1+'"/>' },

  /* Drönare: kvadkoptern. Fyra rotorer, en lins. */
  drone:   function(P){ return '<path d="M31 31 L69 69 M69 31 L31 69" stroke="'+P.t1+'" stroke-width="7"/>'
             +'<circle cx="28" cy="28" r="11" fill="'+P.t2+'"/><circle cx="72" cy="28" r="11" fill="'+P.t2+'"/>'
             +'<circle cx="28" cy="72" r="11" fill="'+P.t2+'"/><circle cx="72" cy="72" r="11" fill="'+P.t2+'"/>'
             +'<rect x="38" y="40" width="24" height="20" fill="'+P.t2+'"/>'
             +'<circle cx="50" cy="50" r="6" fill="'+P.t3+'"/>' },

  /* Områdeskarta: nålen. Den universella kartsymbolen, ritad smalare och
     rakare än standardnålen så att den inte läser som en app-ikon. */
  map:     function(P){ return '<ellipse cx="50" cy="74" rx="14" ry="4.5" fill="'+P.t1+'"/>'
             +'<path d="M50 22 A16 16 0 0 0 34 38 C34 50 50 70 50 70 S66 50 66 38 A16 16 0 0 0 50 22 Z" fill="'+P.t2+'"/>'
             +'<circle cx="50" cy="38" r="6.5" fill="'+P.t3+'"/>' },

  /* Motion: bildrutan med spelknappen. */
  motion:  function(P){ return '<rect x="22" y="28" width="56" height="38" fill="'+P.t2+'"/>'
             +'<path d="M44 39 L60 47 L44 55 Z" fill="'+P.bg+'"/>'
             +'<rect x="22" y="70" width="34" height="6" fill="'+P.t3+'"/>'
             +'<rect x="60" y="70" width="18" height="6" fill="'+P.t1+'"/>' },

  /* Annonsen: dokumentet. Rubriken är accenten. */
  lines:   function(P){ return '<rect x="27" y="22" width="46" height="56" fill="'+P.t2+'"/>'
             +'<rect x="33" y="30" width="26" height="7" fill="'+P.t3+'"/>'
             +'<g fill="'+P.bg+'">'
             +'<rect x="33" y="43" width="34" height="5"/><rect x="33" y="52" width="34" height="5"/>'
             +'<rect x="33" y="61" width="20" height="5"/></g>' },

  /* Kampanjen: tre format i sanna proportioner — 9:16, 4:5, 1:1. */
  formats: function(P){ return '<rect x="22" y="22" width="16" height="52" fill="'+P.t1+'"/>'
             +'<rect x="42" y="32" width="18" height="42" fill="'+P.t2+'"/>'
             +'<rect x="64" y="52" width="22" height="22" fill="'+P.t3+'"/>'
             +'<rect x="22" y="78" width="64" height="4" fill="'+P.t1+'"/>' },

  /* Systemet: portalen som fyra ytor, en tänd. */
  spine:   function(P){ return '<rect x="20" y="26" width="60" height="48" fill="'+P.t2+'"/>'
             +'<rect x="20" y="26" width="60" height="10" fill="'+P.t3+'"/>'
             +'<rect x="26" y="42" width="22" height="12" fill="'+P.bg+'"/>'
             +'<rect x="52" y="42" width="22" height="12" fill="'+P.bg+'"/>'
             +'<rect x="26" y="59" width="48" height="9" fill="'+P.t1+'"/>' },

  /* Objekt: plåtarna på varandra. Ett objekt, flera leveranser. */
  gable:   function(P){ return '<rect x="22" y="22" width="40" height="30" fill="'+P.t1+'"/>'
             +'<rect x="30" y="32" width="40" height="30" fill="'+P.bg+'"/>'
             +'<rect x="32" y="34" width="36" height="26" fill="'+P.t2+'"/>'
             +'<rect x="38" y="44" width="40" height="30" fill="'+P.bg+'"/>'
             +'<rect x="40" y="46" width="36" height="26" fill="'+P.t3+'"/>' },

  /* Inifrån: fotografen. Kameran är accenten. */
  people:  function(P){ return '<circle cx="50" cy="34" r="11" fill="'+P.t2+'"/>'
             +'<path d="M50 48 A22 22 0 0 1 72 70 V78 H28 V70 A22 22 0 0 1 50 48 Z" fill="'+P.t2+'"/>'
             +'<rect x="39" y="56" width="22" height="14" fill="'+P.t3+'"/>'
             +'<circle cx="50" cy="63" r="4.4" fill="'+P.bg+'"/>' },

  /* Ditt hem: huset med tänt fönster. */
  /* Navet — ekosystemets motiv, i de aldre systemens skala */
  orbitmark:function(P){
    var out = '<circle cx="50" cy="50" r="13" fill="'+P.t2+'"/>';
    for(var i = 0; i < 6; i++){
      var a = (-90 + i*60)*Math.PI/180;
      out += '<circle cx="'+(50+Math.cos(a)*27).toFixed(1)+'" cy="'+(50+Math.sin(a)*27).toFixed(1)
        +'" r="6.4" fill="'+(i%2 ? P.t1 : P.t3)+'"/>';
    }
    return out;
  },
  door:    function(P){ return '<path d="M22 48 L50 24 L78 48 Z" fill="'+P.t2+'"/>'
             +'<rect x="30" y="48" width="40" height="30" fill="'+P.t1+'"/>'
             +'<rect x="44" y="60" width="12" height="18" fill="'+P.t2+'"/>'
             +'<rect x="34" y="54" width="8" height="8" fill="'+P.t3+'"/>' }
};

/* ---------------------------------------------------------------------
   LINJEN
   Samma fjorton motiv i hårlinje. Ritas i samma optiska ruta, men får
   vara större eftersom en linje väger mindre än en fylld yta.
   --------------------------------------------------------------------- */
function ln2(d, c, w){ return '<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+(w||2)
  +'" stroke-linecap="square" stroke-linejoin="miter"/>' }
var LINE = {
  vmark:   function(P){ return '<g transform="translate(22 29) scale(.0653)">'
             +'<path d="'+GEO.limb+'" fill="'+P.t2+'"/>'
             +'<circle cx="'+GEO.dot.cx+'" cy="'+GEO.dot.cy+'" r="'+GEO.dot.r+'" fill="'+P.t3+'"/></g>' },
  aperture:function(P){ return ln2("M20 28 H80 V72 H20 Z", P.t2)
             +ln2("M20 64 L38 46 L50 58 L60 50 L80 66", P.t2)
             +'<circle cx="64" cy="40" r="6" fill="'+P.t3+'"/>' },
  steps:   function(P){ return ln2("M20 76 H38 V58 H56 V40 H74 V22", P.t2)
             +'<circle cx="74" cy="22" r="5" fill="'+P.t3+'"/>' },
  cube:    function(P){ return ln2("M50 18 L82 36 V64 L50 82 L18 64 V36 Z", P.t2)
             +ln2("M18 36 L50 54 L82 36 M50 54 V82", P.t2)
             +'<circle cx="50" cy="54" r="5" fill="'+P.t3+'"/>' },
  halves:  function(P){ return ln2("M28 20 H72 V50 H28 Z", P.t2)
             +ln2("M18 38 H28 V64 H18 Z M72 38 H82 V64 H72 Z", P.t2)
             +ln2("M28 50 H72 V64 H28 Z", P.t2)
             +ln2("M26 64 V78 M74 64 V78", P.t2)
             +'<rect x="38" y="27" width="16" height="12" fill="'+P.t3+'"/>' },
  sun:     function(P){ return '<path d="M30 58 A20 20 0 0 1 70 58 Z" fill="'+P.t3+'"/>'
             +ln2("M14 58 H86", P.t2)+ln2("M24 70 H76", P.t2)+ln2("M34 80 H66", P.t2)
             +ln2("M50 22 V30 M28 30 L34 36 M72 30 L66 36", P.t2) },
  drone:   function(P){ return ln2("M32 32 L68 68 M68 32 L32 68", P.t2)
             +'<circle cx="26" cy="26" r="11" fill="none" stroke="'+P.t2+'" stroke-width="2"/>'
             +'<circle cx="74" cy="26" r="11" fill="none" stroke="'+P.t2+'" stroke-width="2"/>'
             +'<circle cx="26" cy="74" r="11" fill="none" stroke="'+P.t2+'" stroke-width="2"/>'
             +'<circle cx="74" cy="74" r="11" fill="none" stroke="'+P.t2+'" stroke-width="2"/>'
             +ln2("M38 40 H62 V60 H38 Z", P.t2)
             +'<circle cx="50" cy="50" r="6" fill="'+P.t3+'"/>' },
  map:     function(P){ return ln2("M50 20 A17 17 0 0 0 33 37 C33 50 50 72 50 72 S67 50 67 37 A17 17 0 0 0 50 20 Z", P.t2)
             +'<circle cx="50" cy="37" r="6.5" fill="'+P.t3+'"/>'
             +ln2("M32 78 H68", P.t2) },
  motion:  function(P){ return ln2("M18 28 H82 V66 H18 Z", P.t2)
             +'<path d="M43 38 L61 47 L43 56 Z" fill="'+P.t3+'"/>'
             +ln2("M18 74 H50", P.t2) },
  lines:   function(P){ return ln2("M26 18 H74 V82 H26 Z", P.t2)
             +'<rect x="34" y="30" width="26" height="7" fill="'+P.t3+'"/>'
             +ln2("M34 46 H66 M34 56 H66 M34 66 H54", P.t2) },
  formats: function(P){ return ln2("M16 18 H36 V74 H16 Z", P.t2)
             +ln2("M42 30 H64 V74 H42 Z", P.t2)
             +ln2("M70 52 H92 V74 H70 Z", P.t2)
             +'<rect x="16" y="80" width="76" height="3" fill="'+P.t3+'"/>' },
  spine:   function(P){ return ln2("M16 24 H84 V76 H16 Z", P.t2)
             +ln2("M16 38 H84", P.t2)
             +ln2("M24 48 H48 V62 H24 Z", P.t2)
             +'<rect x="54" y="48" width="24" height="14" fill="'+P.t3+'"/>' },
  gable:   function(P){ return ln2("M16 20 H58 V50 H16 Z", P.t2)
             +'<rect x="26" y="30" width="44" height="32" fill="'+P.bg+'"/>'
             +ln2("M26 30 H70 V62 H26 Z", P.t2)
             +'<rect x="36" y="42" width="46" height="34" fill="'+P.bg+'"/>'
             +ln2("M36 42 H82 V76 H36 Z", P.t2)
             +'<circle cx="70" cy="64" r="6" fill="'+P.t3+'"/>' },
  people:  function(P){ return ln2("M50 24 A11 11 0 1 1 49.9 24 Z", P.t2)
             +ln2("M26 80 V72 A24 24 0 0 1 74 72 V80", P.t2)
             +'<rect x="40" y="56" width="20" height="13" fill="'+P.t3+'"/>' },
  orbitmark:function(P){
    var out = '<circle cx="50" cy="50" r="13" fill="none" stroke="'+P.t2+'" stroke-width="3"/>';
    for(var i = 0; i < 6; i++){
      var a = (-90 + i*60)*Math.PI/180;
      out += '<circle cx="'+(50+Math.cos(a)*27).toFixed(1)+'" cy="'+(50+Math.sin(a)*27).toFixed(1)
        +'" r="6" fill="none" stroke="'+P.t2+'" stroke-width="3"/>';
    }
    return out;
  },
  door:    function(P){ return ln2("M18 50 L50 22 L82 50", P.t2)
             +ln2("M28 50 V80 H72 V50", P.t2)
             +ln2("M44 80 V62 H56 V80", P.t2)
             +'<rect x="33" y="56" width="9" height="9" fill="'+P.t3+'"/>' }
};

/* Namn och beskrivning till väljaren och dokumentationen. */
var GLYPHS = {
  steps:{n:"Trappan", d:"Ett förlopp i fem steg"},
  vmark:{n:"V-märket", d:"Logotypen"},        aperture:{n:"Kortet", d:"Ett foto med landskap"},
  cube:{n:"Kuben", d:"Volym i tre ytor"},     halves:{n:"Fåtöljen", d:"Möblerat rum"},
  sun:{n:"Solen", d:"Sol över horisont"},     drone:{n:"Drönaren", d:"Kvadkopter med lins"},
  map:{n:"Nålen", d:"Platsen på kartan"},     motion:{n:"Spelknappen", d:"Bildruta med play"},
  lines:{n:"Dokumentet", d:"Text med rubrik"},formats:{n:"Formaten", d:"9:16, 4:5, 1:1"},
  spine:{n:"Portalen", d:"Fyra ytor, en tänd"},gable:{n:"Plåtarna", d:"Tre kort på varandra"},
  people:{n:"Fotografen", d:"Person med kamera"}, door:{n:"Huset", d:"Hem med tänt fönster"},
  orbitmark:{n:"Navet", d:"Mitten och det som hänger ihop"}
};
var GLYPH_IDS = Object.keys(GLYPHS);

/* omslagsredigeringar: system, symbol, bild, utsnitt — per kapitel */
var CEDITS = {};
function cov(h, key){
  var e = CEDITS[h.id] || {};
  return e[key] != null ? e[key] : h[key];
}

/* ---------------------------------------------------------------------
   TRE SYSTEM — alla tre är ikoner
   Samma fjorton motiv, tre utföranden. Valet ligger i CPICKS[kapitel-id].
   --------------------------------------------------------------------- */
/* ---------------------------------------------------------------------
   SIGNUM — det lilla märket

   Referensen är de mäklarkontor som gör highlights bäst: en cirkel i en
   lugn ton och ETT litet fyllt märke mitt i, med mycket luft omkring.
   Ingenting mer.

   Skillnaden mot våra tidigare system är mätbar, inte en smaksak:

     storlek     märket upptar 32 av 100 enheter, alltså knappt en
                 tredjedel av cirkeln. De gamla fyller 60–80 % och blir
                 tunga i profilraden.
     toner       EN ton på märket mot EN ton i fältet. De gamla använder
                 tre, vilket vid 56 px blir grumligt i stället för
                 elegant.
     form        fyllda silhuetter, inga hårlinjer. En linje på 1 px
                 försvinner i profilraden; en fylld form håller.

   Det som gör vårt bättre än förlagan är att märkena inte är ett inköpt
   ikonpaket. De är ritade i EN uppsättning på samma rutnät, med samma
   optiska vikt och samma hörnradie, och var och en betyder något i vår
   verksamhet — inte ett hjärta och ett flygplan.
   --------------------------------------------------------------------- */
var SIGN = {
  /* logotypen, skalad till samma 32 enheter som allt annat */
  vmark: function(P){
    var k = 32/858.6;
    return '<g transform="translate('+(50-858.6*k/2).toFixed(2)+' '+(50-756.3*k/2).toFixed(2)
     +') scale('+k.toFixed(5)+')">'
     +'<path d="'+GEO.limb+'" fill="'+P.ink+'"/>'
     +'<circle cx="'+GEO.dot.cx+'" cy="'+GEO.dot.cy+'" r="'+GEO.dot.r+'" fill="'+P.ink+'"/></g>';
  },
  /* Fotografering — kamerahuset, objektivet utskuret */
  aperture: function(P){
    return '<path fill="'+P.ink+'" fill-rule="evenodd" d="'
     +'M44.5 37 h11 a2 2 0 0 1 2 2 v2 h5.5 a3 3 0 0 1 3 3 v16 a3 3 0 0 1 -3 3 h-26 '
     +'a3 3 0 0 1 -3 -3 v-16 a3 3 0 0 1 3 -3 h5.5 v-2 a2 2 0 0 1 2 -2 z '
     +'M50 46 a6.2 6.2 0 1 0 0.01 0 z"/>';
  },
  /* 3D visning — kuben, kanterna utskurna */
  cube: function(P){
    return '<path fill="'+P.ink+'" d="M50 34 L66 43 V57 L50 66 L34 57 V43 Z"/>'
     +'<path stroke="'+P.bg+'" stroke-width="1.6" fill="none" stroke-linejoin="round" '
     +'d="M34 43 L50 52 L66 43 M50 52 V66"/>';
  },
  /* E-styling — fåtöljen. Rygg, armstöd och sits måste läsa isär vid
     56 px, annars blir det en klump; därför luft mellan delarna. */
  halves: function(P){
    return '<g fill="'+P.ink+'">'
     +'<rect x="38.5" y="34" width="23" height="12" rx="3"/>'
     +'<rect x="34" y="44" width="6" height="13" rx="3"/>'
     +'<rect x="60" y="44" width="6" height="13" rx="3"/>'
     +'<rect x="41.5" y="48.5" width="17" height="8.5" rx="2"/>'
     +'<rect x="40" y="59" width="3.4" height="6.5" rx="1.4"/>'
     +'<rect x="56.6" y="59" width="3.4" height="6.5" rx="1.4"/></g>';
  },
  /* Atmosphere — solen över horisonten. Solen måste dominera, annars
     läses figuren som tre streck. */
  sun: function(P){
    return '<g fill="'+P.ink+'">'
     +'<path d="M35.5 51.2 a14.5 14.5 0 0 1 29 0 z"/>'
     +'<rect x="34" y="54.7" width="32" height="3.2" rx="1.6"/>'
     +'<rect x="42" y="60.7" width="16" height="2.6" rx="1.3"/></g>';
  },
  /* Drönare — kroppen, fyra armar i kors och fyra rotorer. Armarna satt
     först inte med, men utan dem blev figuren fyra punkter runt en mitt
     och gick inte att skilja från navet i Ekosystemet. Som fyllda armar
     i stället för streck håller korset ihop även vid 56 bildpunkter. */
  drone: function(P){
    return '<g fill="'+P.ink+'">'
     +'<rect x="33.9" y="48.3" width="32.2" height="3.4" rx="1.7" transform="rotate(45 50 50)"/>'
     +'<rect x="33.9" y="48.3" width="32.2" height="3.4" rx="1.7" transform="rotate(-45 50 50)"/>'
     +'<rect x="43" y="43" width="14" height="14" rx="3.4"/>'
     +'<circle cx="38.6" cy="38.6" r="4.7"/><circle cx="61.4" cy="38.6" r="4.7"/>'
     +'<circle cx="38.6" cy="61.4" r="4.7"/><circle cx="61.4" cy="61.4" r="4.7"/></g>';
  },
  /* Kampanjbyggaren — trappan. Fem steg som stiger; tre block räcker
     för att formen ska läsas som ett förlopp och inte som en graf.
     Ritad i samma ruta som de andra: 32 av 100, mitt i 50/50. */
  steps: function(P){
    return '<g fill="'+P.ink+'">'
     +'<rect x="34" y="56" width="10" height="10"/>'
     +'<rect x="45" y="45" width="10" height="10"/>'
     +'<rect x="56" y="34" width="10" height="10"/></g>';
  },
  /* Områdeskarta — nålen */
  map: function(P){
    return '<path fill="'+P.ink+'" fill-rule="evenodd" d="'
     +'M50 34 a11 11 0 0 1 11 11 c0 8 -11 21 -11 21 s-11 -13 -11 -21 a11 11 0 0 1 11 -11 z '
     +'M50 41 a4 4 0 1 0 0.01 0 z"/>';
  },
  /* Motion — bildrutan med play utskuret */
  motion: function(P){
    return '<path fill="'+P.ink+'" fill-rule="evenodd" d="'
     +'M37 36 h26 a3 3 0 0 1 3 3 v22 a3 3 0 0 1 -3 3 h-26 a3 3 0 0 1 -3 -3 v-22 a3 3 0 0 1 3 -3 z '
     +'M46 43 v14 l12 -7 z"/>';
  },
  /* Annonsen — den satta texten */
  lines: function(P){
    return '<g fill="'+P.ink+'">'
     +'<rect x="34" y="35.8" width="17" height="5" rx="2.5"/>'
     +'<rect x="34" y="45.8" width="32" height="3.4" rx="1.7"/>'
     +'<rect x="34" y="53.3" width="32" height="3.4" rx="1.7"/>'
     +'<rect x="34" y="60.8" width="21" height="3.4" rx="1.7"/></g>';
  },
  /* Kampanjen — de tre formaten, i sanna proportioner */
  formats: function(P){
    return '<g fill="'+P.ink+'">'
     +'<rect x="34" y="36" width="9" height="28" rx="1.6"/>'
     +'<rect x="45.5" y="50.25" width="11" height="13.75" rx="1.6"/>'
     +'<rect x="59" y="57" width="7" height="7" rx="1.4"/></g>';
  },
  /* Systemet och Ekosystemet — portalens fyra ytor */
  spine: function(P){
    return '<g fill="'+P.ink+'">'
     +'<rect x="34" y="34" width="14" height="14" rx="2.6"/>'
     +'<rect x="52" y="34" width="14" height="14" rx="2.6"/>'
     +'<rect x="34" y="52" width="14" height="14" rx="2.6"/>'
     +'<rect x="52" y="52" width="14" height="14" rx="2.6"/></g>';
  },
  /* Objekt — plåtarna på varandra */
  gable: function(P){
    return '<g fill="'+P.ink+'">'
     +'<rect x="41" y="34" width="25" height="23" rx="2.4"/>'
     +'<path d="M34 41.6 h27.6 a2.4 2.4 0 0 1 2.4 2.4 v22 h-30 v-22 a2.4 2.4 0 0 1 2.4 -2.4 z" '
     +'fill="'+P.bg+'"/>'
     +'<rect x="34" y="43" width="26" height="23" rx="2.4"/></g>';
  },
  /* Inifrån — fotografen */
  people: function(P){
    return '<g fill="'+P.ink+'">'
     +'<circle cx="50" cy="42" r="7"/>'
     +'<path d="M35 66 a15 15 0 0 1 30 0 z"/></g>';
  },
  /* Ekosystemet — navet och det som hänger ihop med det. Systemet har
     rutnätet; de två får inte dela märke. */
  orbitmark: function(P){
    var s = '<circle cx="50" cy="50" r="6.6" fill="'+P.ink+'"/>';
    for(var i = 0; i < 6; i++){
      var a = (-90 + i*60) * Math.PI/180;
      s += '<circle cx="'+(50+Math.cos(a)*13.4).toFixed(2)+'" cy="'+(50+Math.sin(a)*13.4).toFixed(2)
        +'" r="3.3" fill="'+P.ink+'"/>';
    }
    return s;
  },
  /* Ditt hem — huset med tänt fönster */
  door: function(P){
    return '<path fill="'+P.ink+'" fill-rule="evenodd" d="'
     +'M50 34.5 L66 47.5 a1 1 0 0 1 -0.6 1.8 h-2.4 v13.4 a3 3 0 0 1 -3 3 h-20 a3 3 0 0 1 -3 -3 '
     +'v-13.4 h-2.4 a1 1 0 0 1 -0.6 -1.8 z '
     +'M46.4 53.5 h7.2 v11.2 h-7.2 z"/>';
  }
};

/* ---------------------------------------------------------------------
   TRE SYSTEM TILL — ren design

   De tre första systemen ritar motivet i en cirkel med kapitlets namn
   under. Det är informativt men det är inte ett omslag — det är en ikon
   med etikett.

   De tre nya har varken cirkel eller text. Instagram beskär ändå rutan
   till en cirkel i profilraden, så det är fel att rita en till; ytan ska
   komponeras för att tåla beskärningen, inte upprepa den. Och namnet står
   redan under omslaget i Instagrams eget gränssnitt.

   Kvar blir bara designen:

     FÄLT    motivet uppförstorat 1,75 gånger och beskuret av rutan.
             Två toner, ingen ram. Läses som en form långt innan den
             läses som en symbol.
     SNITT   ett enda diagonalt snitt i märkets egen vinkel, 58 grader.
             Motivet ligger över snittet och byter färg där det korsar.
     RELIEF  motivet två gånger med förskjutning — oliv bakom, bläck
             framför. Tryckkänslan, utan att låtsas vara papper.

   Samma fjorton motiv som förut. Det som byts är hur de presenteras.
   --------------------------------------------------------------------- */
var COVPAL2 = {
  arkiv: {
    /* Lugnt varmgratt falt, market i mork oliv. Kontrasten ar 9,4:1 —
       hogt over kravet aven vid 56 px. */
    signum: {bg:"#E7E4DC", ink:"#333A2E"},
    falt:   {bg:"#6E7266", t1:"#8A9080", t2:"#F2EFEF", t3:"#1C1C1E"},
    snitt:  {bg:"#EFECE6", t1:"#C8CCBF", t2:"#1C1C1E", t3:"#6E7266"},
    relief: {bg:"#EFECE6", t1:"#C8CCBF", t2:"#1C1C1E", t3:"#6E7266"}
  },
  skugga: {
    signum: {bg:"#22261F", ink:"#E7E4DC"},
    falt:   {bg:"#2C322A", t1:"#48503E", t2:"#EFEDE7", t3:"#98A088"},
    snitt:  {bg:"#0E0E0D", t1:"#33332F", t2:"#EFEDE7", t3:"#98A088"},
    relief: {bg:"#0E0E0D", t1:"#33332F", t2:"#EFEDE7", t3:"#98A088"}
  }
};
/* snittets motsida: grunden och motivet byter plats */
function covInv(P){
  return {bg:P.t2, t1:P.t3, t2:P.bg, t3:P.t1};
}
/* Märkets vinkel, 58 grader, uttryckt som en linje tvärs över rutan. */
function covCut(){
  var t = (typeof GEO !== "undefined" && GEO.tan) ? GEO.tan : 1.6003;
  /* y = 50 + tan*(x-50), klippt mot rutans kanter */
  var y0 = 50 - t*50, y1 = 50 + t*50;
  return {y0:y0, y1:y1};
}
function covMotif(key, P){
  var f = PICTO[key] || PICTO.vmark;
  return f(P);
}
/* ---- de tre nya ytorna, alla i en 0 0 100 100-ruta ---- */
/* Fältet fyller hela rutan, märket ligger centrerat och litet. */
function covSignum(key, P){
  var f = SIGN[key] || SIGN.vmark;
  return '<rect width="100" height="100" fill="'+P.bg+'"/>' + f(P);
}
function covFalt(key, P){
  /* Uppförstorat kring rutans mitt, inte kring origo — annars hamnar
     beskärningen där motivet råkar ligga och halva uppsättningen blir
     oigenkännlig. 1,5 gånger fyller ytan och lämnar silhuetten läsbar;
     förskjutningen uppåt vänster ger asymmetrin. */
  var k = 1.5, c = 50 - 50*k;
  return '<rect width="100" height="100" fill="'+P.bg+'"/>'
   +'<g transform="translate('+(c-5).toFixed(1)+' '+(c-3).toFixed(1)+') scale('+k+')">'
   + covMotif(key, P) +'</g>';
}
function covSnitt(key, P){
  var c = covCut(), id = "cut"+Math.abs(hashStr(key))%99999;
  var I = covInv(P);
  return '<defs>'
   +'<clipPath id="'+id+'a"><path d="M 0 '+c.y0+' L 100 '+c.y1+' L 100 -200 L 0 -200 Z"/></clipPath>'
   +'<clipPath id="'+id+'b"><path d="M 0 '+c.y0+' L 100 '+c.y1+' L 100 300 L 0 300 Z"/></clipPath>'
   +'</defs>'
   +'<g clip-path="url(#'+id+'a)"><rect width="100" height="100" fill="'+P.bg+'"/>'
     + covMotif(key, P) +'</g>'
   +'<g clip-path="url(#'+id+'b)"><rect width="100" height="100" fill="'+I.bg+'"/>'
     + covMotif(key, I) +'</g>';
}
function covRelief(key, P){
  /* Förskjutningen måste synas vid 56 px, annars är det bara ett
     pictogram igen. 6 enheter av 100 syns; 3 gör det inte. Skuggan är
     helt i oliv och motivet helt i bläck, så paret läses som två lager. */
  var S = {bg:P.t3, t1:P.t3, t2:P.t3, t3:P.t3};
  var F = {bg:P.bg, t1:P.t2, t2:P.t2, t3:P.t2};
  return '<rect width="100" height="100" fill="'+P.bg+'"/>'
   +'<g transform="translate(6 6)">'+ covMotif(key, S) +'</g>'
   + covMotif(key, F);
}
/* stabil liten hash så clipPath-id:t inte krockar mellan omslag */
function hashStr(s){
  var h = 0; s = String(s);
  for(var i = 0; i < s.length; i++){ h = (h*31 + s.charCodeAt(i)) | 0 }
  return h;
}

var CPICKS = {};
var COVSETS = [
  {id:"signum",    k:"signum",    n:"Signum",    d:"Ett litet fyllt märke i mycket luft. En ton mot en ton, 32 av 100 enheter. Det som de bästa kontoren gör, ritat i vår egen uppsättning."},
  {id:"pictogram", k:"pictogram", n:"Pictogram", d:"Fylld form, utskurna detaljer. Rak och tyst."},
  {id:"linjen",    k:"line",      n:"Linjen",    d:"Samma motiv i hårlinje, med stort andrum."},
  {id:"negativ",   k:"negativ",   n:"Negativ",   d:"Formen urskuren ur en fylld olivplatta."},
  /* --- utan cirkel, utan text: bara designen --- */
  {id:"falt",   k:"falt",   n:"Fält",   d:"Motivet uppförstorat och beskuret av rutan. Två toner, ingen ram.", pure:true},
  {id:"snitt",  k:"snitt",  n:"Snitt",  d:"Ett diagonalt snitt i märkets egen vinkel. Motivet byter färg där det korsar.", pure:true},
  {id:"relief", k:"relief", n:"Relief", d:"Motivet två gånger med förskjutning — oliv bakom, bläck framför.", pure:true}
];
/* Ett rent omslag ritar varken cirkel eller etikett. */
function covPure(ix){ return !!(COVSETS[ix] && COVSETS[ix].pure) }
/* Valet lagras som SYSTEMETS ID, inte som dess plats i listan. Ett tal
   pekar fel sa fort ordningen andras — och den andras varje gang ett nytt
   system tillkommer. Gamla sparade tal tolkas mot den ordning de skrevs i. */
var COVOLD = ["pictogram","linjen","negativ","falt","snitt","relief"];
function covIxOf(id){
  for(var i = 0; i < COVSETS.length; i++){ if(COVSETS[i].id === id) return i }
  return 0;
}
function covSetIx(h){
  var v = CPICKS[h.id];
  if(typeof v === "string") return covIxOf(v);
  if(typeof v === "number" && COVOLD[v]) return covIxOf(COVOLD[v]);
  return 0;
}
function covPal(dirId, ix){
  var k = COVSETS[ix].k;
  var d = COVPAL[dirId] || COVPAL.arkiv;
  var d2 = COVPAL2[dirId] || COVPAL2.arkiv;
  return d[k] || d2[k];
}
/* Vilken ritning hör till vilket system? Uppslaget gick tidigare på
   PLATSEN i listan — ix===1 antogs vara Linjen. Så fort ett system
   tillkom pekade det fel, och ett motiv som bara fanns i en uppsättning
   sprängde hela editorn. Nu frågar vi systemet vad det heter. */
function covSet(ix){ return (COVSETS[ix] && COVSETS[ix].k) || "pictogram" }
function covMotifFor(ix, key, P){
  var k = covSet(ix);
  var tab = k === "signum" ? SIGN : k === "line" ? LINE : PICTO;
  var f = tab[key] || tab.vmark || PICTO.vmark;
  return f(P);
}
function covArt(dirId, h, ix){
  var P = covPal(dirId, ix), key = cov(h,"glyph"), body;
  var k = COVSETS[ix].k;
  if(k === "signum")      body = covSignum(key, P);
  else if(k === "falt")   body = covFalt(key, P);
  else if(k === "snitt")  body = covSnitt(key, P);
  else if(k === "relief") body = covRelief(key, P);
  else body = covMotifFor(ix, key, P);
  return '<div style="position:absolute;inset:0;display:grid;place-items:center">'
    +'<svg viewBox="0 0 100 100" style="width:100%;height:100%;display:block" aria-hidden="true">'
    + body +'</svg></div>';
}

/* ar: "1:1" i profilraden, "9:16" vid export */
function cover(dirId, h, ar){
  var sq = ar !== "9:16", ix = covSetIx(h), P = covPal(dirId, ix);
  var plate = sq ? 'inset:0' : 'left:8cqw;right:8cqw;top:50%;transform:translateY(-50%);aspect-ratio:1';
  /* Instagram beskär ändå rutan till en cirkel i profilraden. De rena
     systemen ritar därför ingen egen — ytan komponeras för beskärningen
     i stället för att upprepa den. */
  var rad = covPure(ix) ? '' : 'border-radius:50%;';
  return '<div style="position:absolute;'+plate+';'+rad+'overflow:hidden;background:'+P.bg+'">'
    + covArt(dirId, h, ix) +'</div>';
}

/* Omslaget som bildruta: sist i varje Highlight och det som exporteras. */
function coverFrame(dirId, h){
  var ix = covSetIx(h), P = covPal(dirId, ix);
  var pap = dirId==="skugga" ? "#0E0E0D" : "#F2EFEF";
  var ink = dirId==="skugga" ? "#EFEDE7" : "#1C1C1E";
  var oli = dirId==="skugga" ? "#98A088" : "#6E7266";
  /* Rena system exporteras som just bara designen — ingen cirkel, ingen
     etikett, ingen mätlinje. Ytan är omslaget. */
  if(covPure(ix)){
    return '<div class="'+(dirId==="skugga"?"b":"a")+'" style="background:'+P.bg+'">'
      +'<div style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);'
      +'aspect-ratio:1;overflow:hidden;container-type:inline-size">'
      + cover(dirId,h,"1:1") +'</div></div>';
  }
  return '<div class="'+(dirId==="skugga"?"b":"a")+'" style="background:'+pap+'">'
    +'<div style="position:absolute;left:0;right:0;top:'+SAFE.top+'cqw;bottom:'+SAFE.bot+'cqw;'
    +'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7cqw">'
    +'<div style="position:relative;width:60cqw;aspect-ratio:1;border-radius:50%;overflow:hidden;'
    +'container-type:inline-size">'+cover(dirId,h,"1:1")+'</div>'
    +'<div style="display:flex;flex-direction:column;align-items:center;gap:2.8cqw">'
    +'<div style="width:7cqw;height:1px;background:'+oli+'"></div>'
    +'<div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:7.6cqw;'
    +'color:'+ink+'">'+esc(h.label||h.name)+'</div></div></div></div>';
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
/* Visningssidan i miniatyr, efter den faktiska.

   Den förra ritade en produktsida med rubrikstreck och textrader — en
   trådmodell. Viewlys visningssida är en enda yta av bostaden med
   kontorets logotyp uppe till vänster, adressen och EN knapp i mitten,
   mäklaren och kontaktvägarna nertill. Det är den som ska stå här, för
   det är den kunden får.

   b = [namn, färg, knapptext, typsnitt, hörnradie] — de tre sista
   posterna är valfria och styr just det som byts med kontoret. */
function wlCard(b, dark, m, sid_){
  var line = dark ? "rgba(239,237,231,.18)" : "#D8D2CF";
  var col  = b[1] || "#6E7266";
  var font = b[3] || "Montserrat,sans-serif";
  var rad  = b[4] == null ? 0 : b[4];
  var serif = /Cormorant/.test(font);
  var pill = function(t){
    return '<span style="border:1px solid rgba(255,255,255,.7);padding:.8cqw 1.4cqw;'
     +'font-family:Montserrat,sans-serif;font-size:1.15cqw;font-weight:500;letter-spacing:.2em;'
     +'text-transform:uppercase;color:#fff;white-space:nowrap">'+esc(t)+'</span>';
  };
  return '<div style="position:relative;width:100%;aspect-ratio:4/3;overflow:hidden;'
   +'container-type:inline-size;text-align:left;border:1px solid '+line+';background:#2A2A28">'
   +'<div style="position:absolute;inset:0;'+bg(m, sid_)+'"></div>'
   +'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,20,18,.30),'
   +'rgba(20,20,18,.08) 36%,rgba(20,20,18,.60))"></div>'
   /* kontorets logotyp */
   +'<div style="position:absolute;left:3.4cqw;top:3.4cqw;background:'+col+';padding:1.8cqw 2.6cqw">'
     +'<span style="font-family:'+font+';font-weight:'+(serif?300:600)+';font-size:3cqw;'
     +'letter-spacing:'+(serif?".01em":".14em")+';color:#fff;'
     +'text-transform:'+(serif?"none":"uppercase")+'">'+esc(b[0])+'</span></div>'
   /* Viewlys märke, tillbakadraget */
   +'<div style="position:absolute;right:3.4cqw;top:4cqw;display:flex;align-items:center;gap:1.1cqw;opacity:.9">'
     +'<span style="width:2.4cqw;display:block">'+vmark("#fff","#fff",'style="width:100%;height:auto;display:block"')+'</span>'
     +'<span style="font-family:Montserrat,sans-serif;font-size:1.4cqw;font-weight:600;'
     +'letter-spacing:.28em;color:#fff">VIEWLY</span></div>'
   /* adressen och den enda knappen */
   +'<div style="position:absolute;left:5cqw;right:5cqw;top:50%;transform:translateY(-50%);'
   +'display:flex;flex-direction:column;align-items:center;gap:3cqw">'
     +'<span style="font-family:'+font+';font-weight:'+(serif?300:500)+';font-size:6.4cqw;'
     +'color:#fff;text-align:center;line-height:1.1">'+esc(typeof mo==="function"?mo("addr"):"Silvergården 9A")+'</span>'
     +'<span style="background:'+col+';border-radius:'+rad+'px;padding:2cqw 5cqw;font-family:'+font+';'
     +'font-weight:'+(serif?300:500)+';font-size:2.4cqw;color:#fff">'+esc(b[2] || "Upplev bostaden")+'</span>'
   +'</div>'
   /* mäklaren och kontaktvägarna */
   +'<div style="position:absolute;left:3.4cqw;bottom:3.4cqw;display:flex;align-items:center;gap:1.8cqw">'
     +'<span style="width:5cqw;height:5cqw;border-radius:50%;border:1px solid rgba(255,255,255,.55)"></span>'
     +'<span style="display:flex;flex-direction:column;gap:.3cqw">'
       +'<span style="font-family:Montserrat,sans-serif;font-size:1.2cqw;font-weight:500;'
       +'letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.75)">Presenteras av</span>'
       +'<span style="font-family:'+font+';font-weight:'+(serif?300:500)+';font-size:2.4cqw;color:#fff">'
       +'Anna Lindqvist</span></span></div>'
   +'<div style="position:absolute;right:3.4cqw;bottom:3.8cqw;display:flex;gap:1cqw">'
   + pill("Mejla")+pill("Ring") +'</div></div>';
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
var AR = {"9:16":[9,16], "4:5":[4,5], "1:1":[1,1], "16:9":[16,9], "4:3":[4,3], "3:2":[3,2]};

/* ---------------------------------------------------------------- A · ARKIV */
/* I 9:16 ligger Instagrams svarsfält över de nedersta 26 cqw. Bandet växer
   och får extra bottenpadding där, så faktarad och kolofon aldrig hamnar under. */
function safeBot(ar){ return ar==="9:16" ? SAFE.bot : 4.6 }
/* veil lägger en ljus slöja över fotografiet — SÅLD backar bilden. Den låg
   tidigare inne som en strängersättning på den färdiga markupen, vilket tappade
   ett </div> och lämnade artboarden obalanserad. Nu är den en parameter. */
function paWrap(p, band, bandH, ar, veil){
  var sb = safeBot(ar), H = bandH + (sb - 4.6);
  return '<div class="a" style="overflow:hidden">'
   +'<div style="position:absolute;left:0;right:0;top:0;bottom:'+H+'cqw;overflow:hidden">'
     +'<div style="position:absolute;inset:0;'+bg(p.m,"post-"+p.id)+'"></div>'
     +(veil ? '<div style="position:absolute;inset:0;background:'+veil+'"></div>' : '')
   +'</div>'
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
    + paFoot(p.when), 52, ar, 'rgba(242,239,239,.26)');
 }
};

/* =====================================================================
   ILLUSTRATIONSPRIMITIV — ekosystemet ritat, inte fotograferat

   Kapitel 15 handlar om hur delarna hänger ihop. Det går inte att
   fotografera. Ett foto på ett kök säger ingenting om att samma objekt
   bär både planritningen, filmen och annonsen — det måste RITAS.

   Därför tre nya primitiv som bara använder geometri, linje och typografi:

     orbit   en nod i mitten och n satelliter runt den. dir:"in" när
             satelliterna matar mitten (grundmaterialet), dir:"out" när
             mitten matar satelliterna (förädlingen). Samma figur, vänd.
     chain   numrerade steg under varandra med förbindelser. Flödet på
             viewly.se/maklare: intagning, produktion, portal, annons,
             kampanj.
     portal  spridda märken till vänster som samlas i en enda yta till
             höger. Administrationen före och efter.

   Ingen av dem tar en bild. De ritas i SVG med samma två färger som
   resten av riktningen, så de sitter i samma system som allt annat.
   ===================================================================== */

/* Nodens position på en cirkel. Startar rakt upp och går medsols. */
function ekoPos(i, n, r, cx, cy){
  var a = -Math.PI/2 + i*2*Math.PI/n;
  return {x:cx + Math.cos(a)*r, y:cy + Math.sin(a)*r};
}
/* En pil längs linjen mellan två punkter, en bit in från slutet. */
function ekoArrow(x1, y1, x2, y2, col, at, sz){
  var dx = x2-x1, dy = y2-y1, L = Math.sqrt(dx*dx+dy*dy) || 1;
  var ux = dx/L, uy = dy/L, px = x1+ux*L*at, py = y1+uy*L*at;
  var nx = -uy, ny = ux;
  sz = sz || 2.1;
  return '<path d="M '+(px+ux*sz)+' '+(py+uy*sz)
   +' L '+(px-ux*sz*.5+nx*sz*.72)+' '+(py-uy*sz*.5+ny*sz*.72)
   +' L '+(px-ux*sz*.5-nx*sz*.72)+' '+(py-uy*sz*.5-ny*sz*.72)
   +' Z" fill="'+col+'"/>';
}
/* Själva figuren, i en 0 0 100 100-ruta. p är 0–1 och används av motion;
   statiskt renderas den alltid färdig (p = 1). */
function ekoOrbit(ink, oli, line, items, out, p){
  p = (p == null) ? 1 : mclampX(p);
  var n = items.length, cx = 50, cy = 50, R = 34, rr = 3.1;
  var s = '<circle cx="50" cy="50" r="'+R+'" fill="none" stroke="'+line+'" stroke-width=".5"/>';
  for(var i = 0; i < n; i++){
    var q = ekoPos(i, n, R, cx, cy);
    var on = p >= (i+1)/(n+1) - .001;
    /* ekern ritas från mitten ut, eller utifrån in */
    var a = out ? [cx, cy, q.x, q.y] : [q.x, q.y, cx, cy];
    var grow = out ? Math.max(0, Math.min(1, (p-(i)/(n+1))*(n+1)))
                   : Math.max(0, Math.min(1, (p-(i)/(n+1))*(n+1)));
    var ex = a[0] + (a[2]-a[0])*grow, ey = a[1] + (a[3]-a[1])*grow;
    s += '<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+ex+'" y2="'+ey+'" stroke="'+oli+'" stroke-width=".9"/>';
    if(grow > .55) s += ekoArrow(a[0], a[1], a[2], a[3], oli, .62);
    s += '<circle cx="'+q.x+'" cy="'+q.y+'" r="'+rr+'" fill="'+(on?oli:"none")
       + '" stroke="'+(on?oli:line)+'" stroke-width=".9"/>';
  }
  /* mitten: objektet */
  s += '<circle cx="50" cy="50" r="8.6" fill="none" stroke="'+ink+'" stroke-width="1.1"/>'
     + '<circle cx="50" cy="50" r="3.4" fill="'+ink+'"/>';
  return '<svg viewBox="0 0 100 100" style="width:100%;height:100%;display:block" aria-hidden="true">'+s+'</svg>';
}
function mclampX(v){ return v<0?0:v>1?1:v }

/* ---------------------------------------------------------------- A · ARKIV */
/* 14 · ORBIT */
A.orbit = function(s,i,n){
  var out = s.dir === "out";
  var labs = s.items.map(function(x,j){
    var q = ekoPos(j, s.items.length, 44, 50, 50);
    return '<span style="position:absolute;left:'+q.x.toFixed(2)+'%;top:'+q.y.toFixed(2)+'%;'
     +'transform:translate(-50%,-50%);font-family:Montserrat,sans-serif;font-size:2.1cqw;'
     +'font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#4A4744;'
     +'white-space:nowrap;background:#F2EFEF;padding:0 1cqw">'+esc(x)+'</span>';
  }).join("");
  return A.chrome(s.k,i,n,
    '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:4cqw">'
   +'<div class="a-d sm" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div>'
   +'<div style="position:relative;width:100%;aspect-ratio:1;max-height:74cqw;align-self:center">'
   + ekoOrbit("#1C1C1E","#6E7266","#D8D2CF", s.items, out) + labs +'</div>'
   +(s.s?'<div><div class="a-r" style="margin-bottom:2.2cqw"></div>'
        +'<div class="a-l" style="font-size:2.8cqw">'+esc(s.s)+'</div></div>':'')+'</div>');
};
/* 15 · CHAIN */
A.chain = function(s,i,n){
  var steps = s.items.map(function(x,j){
    var on = s.now == null || j <= s.now;
    return '<div style="display:flex;align-items:flex-start;gap:3.4cqw;position:relative">'
     +'<div style="flex:0 0 8cqw;display:flex;flex-direction:column;align-items:center">'
       +'<span style="width:8cqw;height:8cqw;border-radius:50%;border:1px solid '+(on?"#6E7266":"#D8D2CF")
       +';background:'+(on?"#6E7266":"transparent")+';display:grid;place-items:center;'
       +'font-family:Montserrat,sans-serif;font-size:2.1cqw;font-weight:600;letter-spacing:.06em;'
       +'color:'+(on?"#F2EFEF":"#A9A29E")+'">'+String(j+1).padStart(2,"0")+'</span>'
       + (j < s.items.length-1
          ? '<span style="width:1px;flex:1;min-height:5.2cqw;background:'+(on?"#6E7266":"#D8D2CF")+'"></span>' : '')
     +'</div>'
     +'<div style="padding-bottom:'+(j<s.items.length-1?4.4:0)+'cqw">'
       +'<div style="font-family:Montserrat,sans-serif;font-size:2.3cqw;font-weight:600;letter-spacing:.2em;'
       +'text-transform:uppercase;color:'+(on?"#1C1C1E":"#A9A29E")+'">'+esc(x[0])+'</div>'
       +'<div class="a-l" style="font-size:2.55cqw;margin-top:.9cqw;color:'+(on?"#4A4744":"#A9A29E")+'">'
       +esc(x[1])+'</div></div></div>';
  }).join("");
  return A.chrome(s.k,i,n,
    '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:4.2cqw">'
   +'<div class="a-d sm" style="'+dsize(s.h,8.2,SERIF)+'">'+esc(s.h)+'</div>'
   +'<div>'+steps+'</div>'
   +(s.s?'<div class="a-l" style="font-size:2.8cqw">'+esc(s.s)+'</div>':'')+'</div>');
};
/* 16 · PORTAL — spritt blir samlat */
A.portal = function(s,i,n){
  var scat = (s.before||[]).map(function(x,j){
    var pos = [[4,6],[46,0],[16,30],[54,26],[2,54],[40,54]][j%6];
    return '<span style="position:absolute;left:'+pos[0]+'%;top:'+pos[1]+'%;border:1px solid #D8D2CF;'
     +'background:#F2EFEF;padding:1.5cqw 2.2cqw;font-family:Montserrat,sans-serif;font-size:1.95cqw;'
     +'letter-spacing:.12em;text-transform:uppercase;color:#8A8580;white-space:nowrap">'+esc(x)+'</span>';
  }).join("");
  var rows = (s.after||[]).map(function(x){
    return '<div style="display:flex;align-items:center;gap:2cqw;padding:1.5cqw 0;border-bottom:1px solid #E4DEDB">'
     +'<span style="width:.85cqw;height:.85cqw;border-radius:50%;background:#6E7266;flex:0 0 .85cqw"></span>'
     +'<span style="font-family:Montserrat,sans-serif;font-size:2.25cqw;color:#1C1C1E">'+esc(x)+'</span></div>';
  }).join("");
  return A.chrome(s.k,i,n,
    '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:3cqw;min-height:0">'
   +'<div class="a-d sm" style="'+dsize(s.h,7.4,SERIF)+'">'+esc(s.h)+'</div>'
   +'<div style="position:relative;height:29cqw;opacity:.85;flex:0 0 auto">'+scat+'</div>'
   +'<div style="display:flex;align-items:center;gap:2.4cqw">'
     +'<span style="flex:1;height:1px;background:#D8D2CF"></span>'
     +'<span class="a-c" style="font-size:1.9cqw">Blir</span>'
     +'<span style="flex:1;height:1px;background:#D8D2CF"></span></div>'
   +'<div style="border:1px solid #6E7266;padding:2.8cqw 3.4cqw">'
     +'<div class="a-k" style="font-size:2.1cqw;margin-bottom:1.2cqw">'+esc(s.plate||"Mäklarportalen")+'</div>'
     + rows +'</div>'
   +(s.s?'<div class="a-l" style="font-size:2.6cqw">'+esc(s.s)+'</div>':'')+'</div>');
};

/* ---------------------------------------------------------------- B · SKUGGA */
B.orbit = function(s,i,n){
  var out = s.dir === "out";
  var labs = s.items.map(function(x,j){
    var q = ekoPos(j, s.items.length, 44, 50, 50);
    return '<span style="position:absolute;left:'+q.x.toFixed(2)+'%;top:'+q.y.toFixed(2)+'%;'
     +'transform:translate(-50%,-50%);font-family:Montserrat,sans-serif;font-size:2.1cqw;'
     +'font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#CFCDC7;'
     +'white-space:nowrap;background:#0E0E0D;padding:0 1cqw">'+esc(x)+'</span>';
  }).join("");
  return B.shell(
    B.kick(s.k)
   +'<div class="z" style="left:6cqw;right:6cqw;top:'+(SAFE.top+9)+'cqw">'
   +'<div class="b-d" style="'+dsize(s.h,8.6,SERIF)+'">'+esc(s.h)+'</div></div>'
   +'<div class="z" style="left:9cqw;right:9cqw;top:52cqw"><div style="position:relative;width:100%;aspect-ratio:1">'
   + ekoOrbit("#EFEDE7","#98A088","#2A2A27", s.items, out) + labs +'</div></div>'
   +(s.s?'<div class="z" style="left:6cqw;right:6cqw;bottom:'+(SAFE.bot+2)+'cqw">'
        +'<div class="b-b" style="font-size:2.7cqw">'+esc(s.s)+'</div></div>':'')
   + B.foot(i,n));
};
B.chain = function(s,i,n){
  var steps = s.items.map(function(x,j){
    var on = s.now == null || j <= s.now;
    return '<div style="display:flex;align-items:flex-start;gap:3.4cqw">'
     +'<div style="flex:0 0 8cqw;display:flex;flex-direction:column;align-items:center">'
       +'<span style="width:8cqw;height:8cqw;border-radius:50%;border:1px solid '+(on?"#98A088":"#2A2A27")
       +';background:'+(on?"#98A088":"transparent")+';display:grid;place-items:center;'
       +'font-family:Montserrat,sans-serif;font-size:2.1cqw;font-weight:600;'
       +'color:'+(on?"#0E0E0D":"#6E6C66")+'">'+String(j+1).padStart(2,"0")+'</span>'
       + (j < s.items.length-1
          ? '<span style="width:1px;flex:1;min-height:5.2cqw;background:'+(on?"#98A088":"#2A2A27")+'"></span>' : '')
     +'</div>'
     +'<div style="padding-bottom:'+(j<s.items.length-1?4.4:0)+'cqw">'
       +'<div style="font-family:Montserrat,sans-serif;font-size:2.3cqw;font-weight:600;letter-spacing:.2em;'
       +'text-transform:uppercase;color:'+(on?"#EFEDE7":"#6E6C66")+'">'+esc(x[0])+'</div>'
       +'<div class="b-b" style="font-size:2.55cqw;margin-top:.9cqw;color:'+(on?"#A8A6A0":"#6E6C66")+'">'
       +esc(x[1])+'</div></div></div>';
  }).join("");
  return B.shell(
    B.kick(s.k)
   +'<div class="z" style="left:6cqw;right:6cqw;top:'+(SAFE.top+9)+'cqw">'
   +'<div class="b-d" style="'+dsize(s.h,8.2,SERIF)+'">'+esc(s.h)+'</div></div>'
   +'<div class="z" style="left:6cqw;right:6cqw;top:54cqw">'+steps+'</div>'
   + B.foot(i,n));
};
B.portal = function(s,i,n){
  var scat = (s.before||[]).map(function(x,j){
    var pos = [[4,6],[46,0],[16,30],[54,26],[2,54],[40,54]][j%6];
    return '<span style="position:absolute;left:'+pos[0]+'%;top:'+pos[1]+'%;border:1px solid #2A2A27;'
     +'padding:1.5cqw 2.2cqw;font-family:Montserrat,sans-serif;font-size:1.95cqw;'
     +'letter-spacing:.12em;text-transform:uppercase;color:#6E6C66;white-space:nowrap">'+esc(x)+'</span>';
  }).join("");
  var rows = (s.after||[]).map(function(x){
    return '<div style="display:flex;align-items:center;gap:2cqw;padding:1.9cqw 0;'
     +'border-bottom:1px solid rgba(239,237,231,.12)">'
     +'<span style="width:.85cqw;height:.85cqw;border-radius:50%;background:#98A088;flex:0 0 .85cqw"></span>'
     +'<span style="font-family:Montserrat,sans-serif;font-size:2.25cqw;color:#EFEDE7">'+esc(x)+'</span></div>';
  }).join("");
  return B.shell(
    B.kick(s.k)
   +'<div class="z" style="left:6cqw;right:6cqw;top:'+(SAFE.top+9)+'cqw">'
   +'<div class="b-d" style="'+dsize(s.h,8.2,SERIF)+'">'+esc(s.h)+'</div></div>'
   +'<div class="z" style="left:6cqw;right:6cqw;top:52cqw;height:32cqw;opacity:.9">'+scat+'</div>'
   +'<div class="z" style="left:6cqw;right:6cqw;top:88cqw;display:flex;align-items:center;gap:2.4cqw">'
     +'<span style="flex:1;height:1px;background:#2A2A27"></span>'
     +'<span class="b-k" style="font-size:1.9cqw">Blir</span>'
     +'<span style="flex:1;height:1px;background:#2A2A27"></span></div>'
   +'<div class="z" style="left:6cqw;right:6cqw;top:96cqw;border:1px solid #98A088;padding:3.4cqw 3.8cqw">'
     +'<div class="b-k" style="font-size:2.1cqw;margin-bottom:1.6cqw">'+esc(s.plate||"Mäklarportalen")+'</div>'
     + rows +'</div>'
   + B.foot(i,n));
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
