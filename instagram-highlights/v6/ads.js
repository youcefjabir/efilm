/* =====================================================================
   ADS — Viewlys första annonskampanj

   Ligger i Highlights/Social Studio som sektion 09. Allt som visas är
   förslag och riktning, inte låsta krav. Ingenting publiceras och inget
   kopplas: ingen Meta-kontakt, inget annonskonto, ingen automation rörs.

   Annons A är en ren funktion av tiden — adFrame(t) -> HTML — precis som
   Motion i vy 07. Samma funktion driver förhandsvisningen, de tre
   placeringsvyerna, storyboarden och MP4-exporten, så de kan inte glida
   isär. Fotot är det riktiga; objektets uppgifter och kontorsprofilen är
   DEMODATA och är märkta så i bilden.
   ===================================================================== */

var AD = {
  tab:"oversikt", t:0, playing:false, raf:0, t0:0, zones:false,
  hook:0, end:0, last:0
};
var AD_DUR = 14.8;
var AD_HOOKS = [
  ["En fotografering.", "Mer att arbeta med."],
  ["Fotona är klara.", "Inläggen också."],
  ["Samma bilder.", "Färdig marknadsföring."]
];
var AD_ENDS = [
  ["Professionell bostadsfotografering.", "Smartare marknadsföring."],
  ["Du bokar.", "Vi sköter resten."],
  ["Bilderna först.", "Resten följer."]
];
/* Meta rekommenderar att text hålls borta från ytterkanterna i 9:16.
   Siffrorna är ett antagande utifrån vanlig praxis (≈ 14 % topp, ≈ 20 % botten
   av 1920 px) och ska stämmas av mot Metas aktuella riktlinjer före live. */
var AD_SAFE = {top:25.9, bot:31.5};
var AD_PAPER = "#E8E3E3", AD_INK = "#1C1C1E", AD_OLI = "#6E7266", AD_LINE = "#CFC8C6", AD_MUT = "#8A8580";
var AD_SER = "font-family:'Cormorant Garamond',Georgia,serif;font-weight:300;";
var AD_SAN = "font-family:Montserrat,sans-serif;";
var AD_OBJ = {addr:"Silvergården 9A", city:"Landskrona", rum:"4 rum och kök", area:"112 m²", year:"1968",
              maklare:"Anna Lindqvist", kontor:"NORDVIK", visning:"Sön 13–14"};

function adImg(inline){
  return 'class="adph" style="position:absolute;inset:0;'
    + (inline ? 'background-image:url('+pick("adHome")+');background-size:cover;' : '');
}
function adClip(inner, p){
  return '<div style="position:absolute;inset:0;clip-path:inset(-12% '+((1-mclamp(p))*100).toFixed(2)+'% -30% 0)">'+inner+'</div>';
}
function adText(x, y, w, size, txt, st){
  return '<div style="position:absolute;left:'+x+'cqw;top:'+y+'cqw;width:'+w+'cqw;font-size:'+size+'cqw;line-height:1.08;'
    + (st||'') +'">'+esc(txt)+'</div>';
}
function adKick(x, y, txt, st){
  return '<div style="position:absolute;left:'+x+'cqw;top:'+y+'cqw;'+AD_SAN+'font-weight:500;font-size:2.15cqw;'
    +'letter-spacing:.3em;text-transform:uppercase;white-space:nowrap;color:'+AD_MUT+';'+(st||'')+'">'+esc(txt)+'</div>';
}
function adLerpRect(a, b, p){
  return [lerp(a[0],b[0],p), lerp(a[1],b[1],p), lerp(a[2],b[2],p), lerp(a[3],b[3],p)];
}
function adRect(r, inline, zoom, fy, extra){
  return '<div style="position:absolute;left:'+r[0].toFixed(2)+'cqw;top:'+r[1].toFixed(2)+'cqw;width:'+r[2].toFixed(2)
   +'cqw;height:'+r[3].toFixed(2)+'cqw;overflow:hidden;'+(extra||'')+'">'
   +'<div '+adImg(inline)+'background-position:50% '+fy.toFixed(1)+'%;transform:scale('+zoom.toFixed(4)
   +');transform-origin:50% '+fy.toFixed(1)+'%"></div></div>';
}

/* En typad rad: etikett, värde som skrivs, och en liten olivmarkering när
   den är hämtad. Inga ikoner. */
function adField(y, label, val, t, a){
  var p = seg(t, a, a+.55), n = Math.round(p*val.length);
  var done = p >= 1;
  return '<div style="position:absolute;left:39cqw;right:7cqw;top:'+y+'cqw;opacity:'+(p>0?1:0)+'">'
   +'<div style="'+AD_SAN+'font-weight:500;font-size:1.85cqw;letter-spacing:.24em;text-transform:uppercase;color:'+AD_MUT+';'
   +'display:flex;justify-content:space-between"><span>'+esc(label)+'</span>'
   +'<span style="color:'+AD_OLI+';opacity:'+(done?1:0)+'">Hämtad</span></div>'
   +'<div style="'+AD_SER+'font-size:4.6cqw;line-height:1.15;white-space:nowrap;color:'+AD_INK+';margin-top:.6cqw;border-bottom:1px solid '
   +AD_LINE+';padding-bottom:1.1cqw;min-height:5.4cqw">'+esc(val.slice(0,n))+'</div></div>';
}

function adStudio(t){
  var cp = seg(t, 4.95, 5.85);
  var card = 'position:absolute;left:6.4cqw;top:36cqw;width:87.2cqw;height:104cqw;background:#F6F3F3;border:1px solid '+AD_LINE+';';
  var out = '';
  out += adKick(6.4, 28.6, "Content Studio", 'color:'+AD_INK);
  out += '<div style="position:absolute;right:6.4cqw;top:28.2cqw;'+AD_SAN+'font-weight:500;font-size:1.85cqw;letter-spacing:.22em;'
    +'text-transform:uppercase;color:'+AD_OLI+';border:1px solid '+AD_OLI+';padding:.7cqw 1.5cqw">Demodata</div>';
  var body = '';
  /* rad 1: vald bild + objektdata */
  body += '<div style="position:absolute;left:4cqw;top:3.4cqw;'+AD_SAN+'font-weight:500;font-size:1.85cqw;letter-spacing:.24em;'
        +'text-transform:uppercase;color:'+AD_MUT+'">Vald bild</div>';
  body += '<div style="position:absolute;left:4cqw;top:3.4cqw;right:4cqw;border-top:1px solid '+AD_LINE+';margin-top:-1.4cqw"></div>';
  body += adField(9.6,  "Adress",    AD_OBJ.addr, t, 6.25);
  body += adField(22.4, "Bostad",    "4 rum · "+AD_OBJ.area, t, 6.75);
  body += adField(35.2, "Visning",   "Sön 13–14", t, 7.2);
  /* rad 2: kontorsprofil */
  var pp = seg(t, 7.7, 8.5);
  body += '<div style="position:absolute;left:4cqw;right:4cqw;top:53cqw;border-top:1px solid '+AD_LINE+'"></div>';
  body += '<div style="position:absolute;left:4cqw;top:56cqw;'+AD_SAN+'font-weight:500;font-size:1.85cqw;letter-spacing:.24em;'
        +'text-transform:uppercase;color:'+AD_MUT+'">Kontorsprofil</div>';
  body += '<div style="position:absolute;left:4cqw;right:4cqw;top:62.2cqw;height:24cqw;opacity:'+(pp>0?1:0)+'">'
    +'<div style="position:absolute;left:0;top:0;width:34cqw;height:24cqw;background:#FFFFFF;border:1px solid '+AD_LINE+';'
      +'display:flex;align-items:center;justify-content:center;'+AD_SAN+'font-weight:600;font-size:4cqw;letter-spacing:.34em;'
      +'color:'+AD_INK+';clip-path:inset(-12% '+((1-pp)*100).toFixed(1)+'% -30% 0)">'+AD_OBJ.kontor+'</div>'
    +'<div style="position:absolute;left:38cqw;top:0;right:0">'
      +'<div style="display:flex;gap:2cqw;clip-path:inset(-12% '+((1-seg(t,7.95,8.6))*100).toFixed(1)+'% -30% 0)">'
      +['#1C1C1E','#6E7266','#E8E3E3','#B9A99B'].map(function(c){
         return '<span style="width:6.5cqw;height:6.5cqw;background:'+c+';border:1px solid '+AD_LINE+'"></span>'}).join('')+'</div>'
      +'<div style="margin-top:2.4cqw;display:flex;align-items:baseline;gap:3cqw;clip-path:inset(-12% '+((1-seg(t,8.1,8.7))*100).toFixed(1)+'% -30% 0)">'
        +'<span style="'+AD_SER+'font-size:7cqw;line-height:1;color:'+AD_INK+'">Aa</span>'
        +'<span style="'+AD_SAN+'font-weight:500;font-size:2.2cqw;letter-spacing:.14em;color:'+AD_MUT+'">Typsnitt · Layout</span></div>'
      +'<div style="margin-top:2.4cqw;'+AD_SER+'font-size:4cqw;color:'+AD_INK+';clip-path:inset(-12% '+((1-seg(t,8.3,8.9))*100).toFixed(1)+'% -30% 0)">'
        +esc(AD_OBJ.maklare)+'<span style="display:block;'+AD_SAN+'font-weight:500;font-size:1.85cqw;letter-spacing:.24em;'
        +'text-transform:uppercase;color:'+AD_MUT+';margin-top:.8cqw">Ansvarig mäklare</span></div>'
    +'</div></div>';
  /* statusrad */
  var done = t > 9.05;
  body += '<div style="position:absolute;left:4cqw;right:4cqw;bottom:3.6cqw;border-top:1px solid '+AD_LINE+';padding-top:2.6cqw;'
    +'display:flex;justify-content:space-between;align-items:baseline">'
    +'<span style="'+AD_SAN+'font-weight:500;font-size:1.95cqw;letter-spacing:.24em;text-transform:uppercase;color:'+(done?AD_OLI:AD_MUT)+'">'
    +(done ? 'Mall: Till salu · klar' : (t > 8.9 ? 'Bygger inlägget' : 'Objekt + profil hämtas'))+'</span>'
    +'<span style="'+AD_SER+'font-style:italic;font-size:3.6cqw;color:'+AD_INK+'">Ingenting skrivs in för hand</span></div>';
  out += '<div style="'+card+'clip-path:inset(0 0 '+((1-eOut(cp))*100).toFixed(1)+'% 0)">'+body+'</div>';
  return out;
}

function adPost(inline){
  var p = {id:"adA", phase:"tillsalu", m:"adHome", addr:AD_OBJ.addr, city:AD_OBJ.city,
           facts:[["4","rum och kök"],["112","kvadratmeter"],["1968","byggår"]], when:"Visning sön 13–14"};
  return post("arkiv", p, "4:5");
}

/* Hela annonsen som en funktion av tiden. t är sekunder, 0 → AD_DUR. */
function adFrame(t, inline){
  var H = AD_HOOKS[AD.hook], E = AD_ENDS[AD.end];
  var out = '';
  var FULL = [0, 0, 100, 177.78], PLATE = [6.4, 32.4, 87.2, 82], THUMB = [10.4, 46, 24, 38];
  /* fotot: helbild → platta (1,3–2,4) → miniatyr i Studio (5,3–6,3) */
  var r = FULL, zoom = lerp(1.07, 1.0, seg(t, 0, 2.4)), fy = 50;
  var pa = eInOut(seg(t, 1.3, 2.4)), pb = eInOut(seg(t, 5.3, 6.3));
  if(t >= 1.3) { r = adLerpRect(FULL, PLATE, pa); fy = lerp(50, 40, pa); }
  if(t >= 5.3) { r = adLerpRect(PLATE, THUMB, pb); fy = lerp(40, 36, pb); }
  var photoVis = t < 9.4;

  /* Scen 1–2: papper bakom, text, Studio, foto överst */
  if(t < 9.6){
    out += '<div style="position:absolute;inset:0;background:'+AD_PAPER+'"></div>';
    /* hook: kicker + två rader under plattan */
    var hOut = 1 - seg(t, 4.55, 5.2);
    if(hOut > 0){
      var k = seg(t, 1.9, 2.5);
      out += '<div style="opacity:'+hOut.toFixed(3)+'">'
        + (k>0 ? adKick(6.4, 27.4, "Viewly · Bostadsfotografering", 'clip-path:inset(-12% '+((1-k)*100).toFixed(1)+'% -30% 0)') : '')
        + '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:118.4cqw;height:12cqw;'+AD_SER+'color:'+AD_INK
          +';font-size:9cqw;line-height:1.05;clip-path:inset(-12% '+((1-eOut(seg(t,2.05,3.2)))*100).toFixed(1)+'% -30% 0)">'+esc(H[0])+'</div>'
        + '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:129.2cqw;height:12cqw;'+AD_SER+'font-style:italic;color:'+AD_OLI
          +';font-size:9cqw;line-height:1.05;clip-path:inset(-12% '+((1-eOut(seg(t,3.5,4.6)))*100).toFixed(1)+'% -30% 0)">'+esc(H[1])+'</div>'
        + '</div>';
    }
    if(t >= 4.9) out += adStudio(t);
    if(photoVis){
      var thumbBox = t >= 5.3 ? 'outline:1px solid '+AD_LINE+';' : '';
      out += adRect(r, inline, zoom, fy, thumbBox);
      /* bockmarkering när bilden är vald */
      var ck = seg(t, 6.2, 6.7);
      if(ck > 0) out += '<div style="position:absolute;left:'+(THUMB[0]+THUMB[2]-1).toFixed(2)+'cqw;top:'+(THUMB[1]-1.2).toFixed(2)
        +'cqw;width:4.4cqw;height:4.4cqw;border-radius:50%;background:'+AD_OLI+';transform:scale('+ck.toFixed(3)+');'
        +'display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" width="55%" height="55%">'
        +'<path d="M2.2 6.3l2.5 2.5 5-5.4" fill="none" stroke="#fff" stroke-width="1.5"/></svg></div>';
      if(t >= 5.9) out += '<div style="position:absolute;left:10.4cqw;top:86cqw;width:24cqw;'+AD_SAN+'font-weight:500;font-size:1.7cqw;'
        +'letter-spacing:.16em;text-transform:uppercase;color:'+AD_MUT+';opacity:'+seg(t,6.2,6.7).toFixed(2)+'">1 av 24 levererade</div>';
    }
  }

  /* Scen 3: det färdiga inlägget — den riktiga Till salu-mallen */
  var wp = eInOut(seg(t, 9.2, 10.3));
  if(t >= 9.2 && t < 13.0){
    var leave = seg(t, 12.45, 13.0);
    out += '<div style="position:absolute;inset:0;clip-path:inset(-12% '+((1-wp)*100).toFixed(2)+'% -30% 0)">'
      +'<div style="position:absolute;inset:0;background:'+AD_PAPER+'"></div>'
      + adKick(6.4, 27.4, "Klart", 'color:'+AD_OLI)
      +'<div style="position:absolute;left:10cqw;top:33cqw;width:80cqw;height:100cqw;overflow:hidden;container-type:inline-size;'
        +'box-shadow:0 1.6cqw 5cqw -2.4cqw rgba(0,0,0,.28);transform:translateY('+(leave*-4).toFixed(2)+'cqw)">'+adPost(inline)+'</div>'
      +'<div style="position:absolute;left:10cqw;right:10cqw;top:137cqw;display:flex;justify-content:space-between;align-items:baseline;'
        +'opacity:'+seg(t,10.6,11.3).toFixed(2)+'">'
        +'<span style="'+AD_SER+'font-style:italic;font-size:4.4cqw;color:'+AD_INK+'">Färdigt, i kontorets egen profil.</span>'
        +'<span style="'+AD_SAN+'font-weight:500;font-size:1.75cqw;letter-spacing:.2em;color:'+AD_MUT+'">4:5 · 1:1 · 9:16</span></div>'
      +'</div>';
    if(wp > 0 && wp < 1) out += '<div style="position:absolute;top:0;bottom:0;left:'+(wp*100).toFixed(2)+'cqw;width:1px;background:'+AD_OLI+'"></div>';
  }

  /* Scen 4: slutkort */
  if(t >= 12.45){
    var ep = eInOut(seg(t, 12.45, 13.3));
    out += '<div style="position:absolute;inset:0;background:'+AD_PAPER+';clip-path:inset('+((1-ep)*100).toFixed(2)+'% 0 0 0)">'
      +'<div style="position:absolute;left:6.4cqw;top:58cqw;width:15cqw;height:15cqw">'+vmark(AD_INK, AD_OLI, 'width="100%" height="100%"')+'</div>'
      +'<div style="position:absolute;left:25cqw;top:62.4cqw;'+AD_SAN+'font-weight:500;font-size:4.2cqw;letter-spacing:.42em;color:'+AD_INK+'">VIEWLY</div>'
      +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:81cqw;height:1px;background:'+AD_LINE+'"></div>'
      +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:86cqw;'+AD_SER+'font-size:'+(AD.end===0?9.2:12)+'cqw;line-height:1.04;color:'+AD_INK
        +';clip-path:inset(-12% '+((1-eOut(seg(t,13.0,13.9)))*100).toFixed(1)+'% -30% 0)">'+esc(E[0])+'</div>'
      +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(AD.end===0?112:104)+'cqw;'+AD_SER+'font-style:italic;font-size:'+(AD.end===0?9.2:12)+'cqw;line-height:1.04;color:'+AD_OLI
        +';clip-path:inset(-12% '+((1-eOut(seg(t,13.35,14.2)))*100).toFixed(1)+'% -30% 0)">'+esc(E[1])+'</div>'
      +'<div style="position:absolute;left:6.4cqw;top:134cqw;'+AD_SAN+'font-weight:500;font-size:2.2cqw;letter-spacing:.26em;text-transform:uppercase;color:'+AD_MUT
        +';opacity:'+seg(t,13.9,14.5).toFixed(2)+'">För fastighetsmäklare i Skåne</div>'
      +'</div>';
  }
  return out;
}

function adFrameBox(t, opts){
  opts = opts || {};
  return '<div class="ad-fr" style="'+(opts.style||'')+'">'+adFrame(t, opts.inline)+(opts.zones ? adZoneOverlay() : '')+'</div>';
}
function adZoneOverlay(){
  return '<div style="position:absolute;left:0;right:0;top:0;height:'+AD_SAFE.top+'cqw;background:rgba(154,53,53,.18);border-bottom:1px dashed rgba(154,53,53,.7)"></div>'
   +'<div style="position:absolute;left:0;right:0;bottom:0;height:'+AD_SAFE.bot+'cqw;background:rgba(154,53,53,.18);border-top:1px dashed rgba(154,53,53,.7)"></div>'
   +'<div style="position:absolute;top:'+AD_SAFE.top+'cqw;bottom:'+AD_SAFE.bot+'cqw;left:0;right:0;border-top:0"></div>';
}

/* ---------------------------------------------------------------------
   PLACERINGAR — så här ser samma annons ut där den faktiskt visas.
   Gränssnittet är ritat för att visa skala och säkra ytor. Det är inte
   Metas eller Instagrams riktiga gränssnitt och ska inte läsas så.
   --------------------------------------------------------------------- */
var AD_PRIM = "Bilderna är bara början. Med Viewly blir fotograferingen också färdigt material — objektets uppgifter och kontorets profil läggs på automatiskt i Social Media Studio.";
function adAv(){
  return '<span class="ad-av">'+vmark("#1C1C1E","#6E7266",'width="100%" height="100%"')+'</span>';
}
function adMockReels(t, zones){
  return '<div class="ad-mock ad-reels">'
   + '<div class="ad-mvid" id="adm-reels">'+adFrame(t,false)+'</div>'
   + (zones ? adZoneOverlay() : '')
   + '<div class="ad-scrim"></div><div class="ad-rtop"><span>Reels</span><span class="g">•••</span></div>'
   + '<div class="ad-rbot"><div class="ad-who">'+adAv()+'<b>viewly.se</b><i>Sponsrad</i></div>'
   + '<p>'+esc(AD_PRIM.slice(0,64))+'… <u>mer</u></p>'
   + '<div class="ad-cta">Läs mer</div></div>'
   + '<div class="ad-rside"><i></i><i></i><i></i></div></div>';
}
function adMockFeed(t, fb){
  var crop = '<div class="ad-crop" id="adm-'+(fb?'fb':'ig')+'"><div class="ad-cropin">'+adFrame(t,false)+'</div></div>';
  return '<div class="ad-mock ad-feed'+(fb?' fb':'')+'">'
   + '<div class="ad-fh">'+adAv()+'<div><b>'+(fb?'Viewly':'viewly.se')+'</b><i>Sponsrad'+(fb?' · Skåne':'')+'</i></div><span class="g">•••</span></div>'
   + (fb ? '<p class="ad-fp">'+esc(AD_PRIM)+'</p>' : '')
   + crop
   + '<div class="ad-fcta"><span>viewly.se<br><b>En fotografering. Mer att arbeta med.</b></span><em>Läs mer</em></div>'
   + (fb ? '' : '<div class="ad-fl"><span>♡ ▢ ➤</span></div><p class="ad-fp"><b>viewly.se</b> '+esc(AD_PRIM.slice(0,92))+'… <u>mer</u></p>')
   + '</div>';
}

/* ---------------------------------------------------------------------
   B och C — skisser. Byggda av samma renderare som Studion; där riktigt
   material saknas står en tydligt märkt yta, inte en påhittad bild.
   --------------------------------------------------------------------- */
function adCar(inner, cap, extra){
  return '<div class="ad-slide"><div class="ad-slin" style="'+(extra||'')+'">'+inner+'</div><div class="ad-cap mono">'+esc(cap)+'</div></div>';
}
function adHatch(label, need){
  return '<div style="position:absolute;inset:0;background:repeating-linear-gradient(135deg,#DAD6D0 0 8px,#D2CDC6 8px 16px);'
   +'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8cqw;gap:2.4cqw">'
   +'<div style="'+AD_SAN+'font-weight:600;font-size:2.3cqw;letter-spacing:.3em;text-transform:uppercase;color:#9A3535">Material saknas</div>'
   +'<div style="'+AD_SER+'font-size:8cqw;line-height:1.05;color:'+AD_INK+'">'+esc(label)+'</div>'
   +'<div style="'+AD_SAN+'font-size:2.4cqw;line-height:1.5;color:#43464A">'+esc(need)+'</div></div>';
}
function adTxtSlide(kick, head, sub, num){
  return '<div style="position:absolute;inset:0;background:'+AD_PAPER+'">'
   + adKick(7, 8, kick)
   + '<div style="position:absolute;left:7cqw;right:7cqw;top:30cqw;'+AD_SER+'font-size:10.4cqw;line-height:1.04;color:'+AD_INK+'">'+esc(head)+'</div>'
   + (sub ? '<div style="position:absolute;left:7cqw;right:12cqw;top:'+(30+Math.ceil(head.length/15)*11.2+8)+'cqw;'+AD_SAN+'font-size:2.9cqw;line-height:1.6;color:#4A4744">'+esc(sub)+'</div>' : '')
   + '<div style="position:absolute;left:7cqw;right:7cqw;bottom:7cqw;display:flex;justify-content:space-between;border-top:1px solid '+AD_LINE+';padding-top:2.4cqw;'
   +  AD_SAN+'font-weight:500;font-size:1.9cqw;letter-spacing:.24em;color:'+AD_MUT+'"><span>VIEWLY</span><span>'+num+' / 5</span></div></div>';
}
function adAdB(){
  var mini = [0,1,2,3].map(function(i){
    return '<div style="position:absolute;left:'+(i%2?54:12)+'cqw;top:'+(i<2?20:64)+'cqw;width:34cqw;height:42.5cqw;overflow:hidden;container-type:inline-size;'
     +'outline:1px solid '+AD_LINE+';outline-offset:-1px">'+post("arkiv", POSTS[i], "4:5")+'</div>';
  }).join('');
  var thumbs = ['living','kitchen','hero'].map(function(k, i){
    return '<div style="position:absolute;left:'+(7+i*29.6)+'cqw;top:34cqw;width:27cqw;height:40cqw;background-image:url('+pick(k)
     +');background-size:cover;background-position:50% 50%"></div>';
  }).join('');
  return [
    adCar(adTxtSlide("Efter leveransen","Vad händer efter att bilderna är levererade?",null,1), "1 · Frågan. Ren typografi, ingen bild.", ''),
    adCar('<div style="position:absolute;inset:0;background:'+AD_PAPER+'">'+adKick(7,8,"Bilderna levereras")
      +thumbs+'<div style="position:absolute;left:7cqw;right:7cqw;top:80cqw;'+AD_SER+'font-size:7.6cqw;line-height:1.08;color:'+AD_INK+'">Bilderna är bara början.</div>'
      +'<div style="position:absolute;left:7cqw;right:7cqw;bottom:7cqw;display:flex;justify-content:space-between;border-top:1px solid '+AD_LINE+';padding-top:2.4cqw;'+AD_SAN+'font-weight:500;font-size:1.9cqw;letter-spacing:.24em;color:'+AD_MUT+'"><span>VIEWLY</span><span>2 / 5</span></div></div>',
      "2 · Bilder ur biblioteket som stand-in. Byts mot riktigt objekt."),
    adCar(adTxtSlide("Social Media Studio","Objektets uppgifter och kontorets profil läggs på automatiskt.","Adress, rum, boarea och ansvarig mäklare hämtas. Kontoret ställer in logga, färger och typsnitt en gång.",3), "3 · Förklaringen. Ett påstående, ingen UI-vägg."),
    adCar('<div style="position:absolute;inset:0;background:'+AD_PAPER+'">'+adKick(7,8,"Fyra faser")+mini
      +'<div style="position:absolute;left:7cqw;bottom:8.6cqw;'+AD_SER+'font-style:italic;font-size:5.6cqw;color:'+AD_OLI+'">Kommande · Till salu · Visning · Såld</div></div>',
      "4 · De fyra riktiga mallarna ur Studion (ARKIV). Demodata."),
    adCar(adTxtSlide("Viewly","Professionell bostadsfotografering. Smartare marknadsföring.","För fastighetsmäklare i Skåne.",5), "5 · Slutkort. Samma som Annons A.")
  ].join('');
}
function adAdC(){
  var cell = function(n, label, need){
    return adCar('<div style="position:absolute;inset:0">'+adHatch(label, need)+'</div>', n+" · Saknas — se lista nedan.");
  };
  return [
    adCar('<div style="position:absolute;inset:0;overflow:hidden"><div '+adImg(true)+'background-position:50% 40%"></div></div>'
      ,
      "1 · Den riktiga bilden. Fullt format, ingen text över motivet."),
    cell(2, "Totalbild vardagsrum", "Samma objekt. Stående 4:5, ljus dagsljus."),
    cell(3, "Kök eller detalj", "Samma objekt. Ett närstående motiv som visar materialkänsla."),
    cell(4, "Skymning eller exteriör", "Samma objekt. Visar att samma fotograf levererar fler tider på dygnet."),
    adCar(adTxtSlide("Viewly","Det börjar med bilden.","Bostadsfotografering för mäklare i Skåne.",5), "5 · Slutkort. Tar över från sista bilden.")
  ].join('');
}

/* ---------------------------------------------------------------------
   STORYBOARD
   --------------------------------------------------------------------- */
var AD_BOARD = [
  [0.7,  "Fotot, helbild", "Stillbild med en mycket långsam inzoomning. Inget gränssnitt, ingen logga. Fotografiet är det som stoppar tummen."],
  [3.4,  "Bilden sätts i ram", "Fotot drar ihop sig till en plats på papperet. Hooken skrivs under — en rad i taget, avslöjad med en mask."],
  [7.0,  "Content Studio", "Bilden är vald. Adress, bostad och visning hämtas rad för rad. Märkt Demodata."],
  [8.6,  "Kontorets profil", "Logga, färger och typsnitt läggs på. Samma profil som kontoret ställt in en gång."],
  [10.9, "Det färdiga inlägget", "Den riktiga Till salu-mallen ur Studion, med fotot från bild 1. Det här är ögonblicket annonsen är byggd runt."],
  [13.8, "Slutkort", "Viewly som fotograf först. Två rader, en hårlinje och målgruppen. Ingen stor knapp."]
];
var AD_TIME = [
  ["0,0–1,3","Helbild. Slow push-in 107 → 100 %.","—","Ingen text. Fotot först."],
  ["1,3–2,4","Fotot drar ihop sig till en platta.","Kicker: Viewly · Bostadsfotografering","Maskad kant, ingen fade."],
  ["2,0–4,6","Hook rad 1 och 2 skrivs.","Hook (se vald variant)","Clip från vänster, ease-out."],
  ["4,6–6,3","Hook ut. Studio in. Fotot blir miniatyr.","Content Studio · Demodata","Studiokortet avtäcks nedåt."],
  ["6,2–8,9","Bocken sätts. Fält skrivs. Profilen läggs på.","Adress · Bostad · Visning · Kontorsprofil","Ett fält i taget, 0,5 s vardera."],
  ["9,2–12,4","Skarv med olivlinje. Färdigt inlägg.","Klart · Färdigt, i kontorets egen profil.","Tryckark: nytt ark sätts från vänster."],
  ["12,4–14,8","Slutkort.","Slutrad (se vald variant) · För fastighetsmäklare i Skåne","Papper dras upp underifrån."]
];

var AD_ALT = [
  {id:"d1", n:"Fotot blir inlägget", rec:true,
   d:"Ett foto tas från helbild till färdigt Till salu-inlägg. Fotografiet är hjälte och bevis, automationen är följden.",
   s:[5,5,5,4,4,5,4,4], risk:"Låg: fotografiet står först och kvar. Studion visas som konsekvens, aldrig som produkt."},
  {id:"d2", n:"Leveransdagen",
   d:"Mäklarens vardag: en notis om att bilderna är levererade, därefter är inlägget redan klart.",
   s:[3,3,4,4,4,2,3,3], risk:"Hög: läses som app-annons. Fotografiet blir bakgrund till en notis."},
  {id:"d3", n:"Samma bild, fyra faser",
   d:"Ett foto som stegar genom Kommande, Till salu, Visning och Såld. Visar systemet, mindre känsla.",
   s:[3,3,4,5,5,3,2,2], risk:"Medel: tydlig automation, men fotografering blir en underförstådd detalj och fyra mallar på 12 s blir tätt."}
];
var AD_CRIT = ["Stoppar tummen","Tydligt att Viewly säljer fotografering","Wow","Förstår automationen","Premiumkänsla","Relevans för mäklare","Går att producera","Lågt SaaS-annonsrisk"];
function adDots(n){
  var s = ''; for(var i=0;i<5;i++) s += '<span class="ad-dot'+(i<n?' on':'')+'"></span>';
  return '<span class="ad-dots" title="'+n+' av 5">'+s+'</span>';
}

function adOpt(kind, i, label, on){
  return '<button class="tbtn'+(on?' on':'')+'" type="button" data-ad="'+kind+'" data-i="'+i+'">'+esc(label)+'</button>';
}

/* ---------------------------------------------------------------------
   SEKTIONEN
   --------------------------------------------------------------------- */
function adTabs(){
  var T = [["oversikt","Översikt"],["a","Annons A · Reel"],["b","Annons B · Karusell"],["c","Annons C · Fotokarusell"]];
  return '<div class="ad-tabs">'+T.map(function(x){
    return '<button type="button" class="ad-tab" data-ad="tab" data-i="'+x[0]+'" aria-current="'+(AD.tab===x[0])+'">'+x[1]+'</button>';
  }).join('')+'</div>';
}
function adFact(l, v, src){
  return '<tr><th>'+l+'</th><td>'+v+'</td><td class="mono">'+src+'</td></tr>';
}

function adOversikt(){
  var cards = [
    ["A","En fotografering. Mer att arbeta med.","Reel 9:16 · 14,8 s","Ett foto blir ett färdigt, brandat Till salu-inlägg. Fullt producerad här, med förhandsvisning och MP4-export.","Producerad", "a"],
    ["B","Vad händer efter att bilderna är levererade?","Karusell 4:5 · 5 bilder","Förklarar flödet steg för steg för mäklare som vill veta mer. Skiss, byggd av riktiga mallar.","Skiss", "b"],
    ["C","Det börjar med bilden.","Fotokarusell 4:5 · 5 bilder","Premium, nästan helt fotografi. Behöver en riktig serie från samma objekt.","Väntar på material", "c"]
  ].map(function(c){
    return '<button type="button" class="ad-card" data-ad="tab" data-i="'+c[5]+'">'
     +'<div class="eyebrow">Annons '+c[0]+' · '+c[4]+'</div><h4>'+esc(c[1])+'</h4>'
     +'<div class="mono ad-sub">'+c[2]+'</div><p>'+esc(c[3])+'</p></button>';
  }).join('');

  var rows = AD_ALT.map(function(a){
    return '<tr class="'+(a.rec?'rec':'')+'"><th><b>'+esc(a.n)+'</b>'+(a.rec?'<span class="ad-recb">Rekommenderad</span>':'')
      +'<span class="ad-d">'+esc(a.d)+'</span></th>'
      +a.s.map(function(n){return '<td>'+adDots(n)+'</td>'}).join('')
      +'</tr>';
  }).join('');
  var head = AD_CRIT.map(function(c){return '<th class="c"><span>'+esc(c)+'</span></th>'}).join('');

  return sechead("Ads · 09", "Viewlys första annonskampanj",
    "En annons är en fördel. Annons A bär kampanjen: den visar att bilderna är fina innan den visar något annat, och först därefter att "
    +"materialet är färdigt. B och C bygger vidare men är inte lika färdiga, med flit. Allt här är förslag och riktning, inte låsta krav. "
    +"Inget är publicerat, ingen Meta-kontakt finns och inget i Studions flöden är rört.")
   + adTabs()
   + '<div class="ad-cards">'+cards+'</div>'

   + '<h3 class="h3">Bedömning av uppdraget</h3>'
   + '<div class="ad-assess">'
   + '<div><b>1. Fotografering är produkten, Studion är beviset.</b> Briefen vill visa båda. Risken är att en 9:16-annons med gränssnitt läses som en SaaS-annons. '
     +'Därför står fotot ensamt först och längst, Studion kommer som konsekvens och slutkortet säger fotografering.</div>'
   + '<div><b>2. En annons, en fördel.</b> Annons A säger bara: bilderna blir färdigt material. Ingen prisbild, inga rabatter, inga löften om fler affärer eller högre pris.</div>'
   + '<div><b>3. Fotot är starkt men inte ett objektsfoto.</b> Det är en detaljbild med suddig förgrund och lokal känsla, inte rumsbild. Det fungerar som öppning, men inlägget i scen 3 bör i produktion byggas på mäklarens huvudbild. '
     +'Affischer syns i motivet — konstnärlig upphovsrätt bör stämmas av innan publicering.</div>'
   + '<div><b>4. En master, tre placeringar.</b> Allt viktigt ligger inom ramen y 26–146 av 178 (cqw). Det klarar både Reels/Stories (9:16) och flödets 4:5-beskärning från samma fil.</div>'
   + '<div><b>5. "Automatiskt" måste vara sant.</b> Siten säger att Studion hämtar bilder, adress, rum, boarea, pris, ansvarig mäklare och visningsuppgifter. '
     +'Annonsen visar bara fält som nämns där, och märker värdena som demodata. Vilka fält som faktiskt fylls per kontor ska bekräftas av er.</div>'
   + '<div><b>6. Paket.</b> Ni nämnde "Plus/Premium". Det finns inte på /maklare. Annonsen påstår därför inte vad som ingår i vilket paket, och Studion står som ViewlyPro enligt siten.</div>'
   + '<div><b>7. Meta-regler (hypotes).</b> Annonsen säljer en tjänst till företag, inte bostäder, och bör inte falla under kategorin Bostäder. Det ska kontrolleras i annonshanteraren innan start.</div>'
   + '</div>'

   + '<h3 class="h3">Tre riktningar för Annons A</h3>'
   + '<div class="ad-tablewrap"><table class="ad-score"><thead><tr><th></th>'+head+'</tr></thead><tbody>'+rows+'</tbody></table></div>'
   + '<p class="xnote">Poängen är en bedömning, inte ett testresultat. Fem prickar är bäst, och sista kolumnen är vänd så att fler prickar betyder lägre risk. '
   +'<b>Rekommendation:</b> riktning 1. Den enda där fotografiet både öppnar och bär annonsen, och den enda som går att producera ärligt av det material som finns.</p>'

   + '<h3 class="h3">Vad som är verifierat</h3>'
   + '<div class="ad-tablewrap"><table class="ad-facts"><tbody>'
   + adFact("Social Media Studio hämtar levererade bilder, adress, rum, boarea, pris, ansvarig mäklare och visningsuppgifter","Fakta","viewly.se/some-studio")
   + adFact("Kontoret ställer in logga, färger, typsnitt och layout per fas en gång; faserna är Kommande, Till salu, Visning, Såld","Fakta","viewly.se/some-studio")
   + adFact("Format: 4:5, 1:1, 9:16, 16:9, A4. Export JPG/PNG/PDF. Går att publicera, schemalägga och ladda ner","Fakta","viewly.se/some-studio")
   + adFact("Studion hör till ViewlyPro, 30 dagars gratis, ingen bindningstid","Fakta","viewly.se/some-studio")
   + adFact("Rubrik /maklare: “En bostadsfotograf som gör mer än bara fotografering”. “Du bokar, vi sköter resten”. Malmö, Helsingborg, Lund, hela Skåne","Fakta","viewly.se/maklare")
   + adFact("Portfolio: interiör, exteriör, skymning, drönare. Även 3D, e-styling, Atmosphere, områdeskartor, Annonsskrivaren","Fakta","viewly.se/portfolio")
   + adFact("SE360: foto, e-styling, planritning, film; eget boknings- och leveranssystem. Ingen automatiserad marknadsföring nämns","Fakta (konkurrent)","se360.se")
   + adFact("Bofoto: foto, film, drönare, 3D, planritning och tryckt material; “över 4 500 bostäder”. Ingen automation nämns","Fakta (konkurrent)","bofoto.se")
   + adFact("Ingen konkurrent jag kunde läsa visar färdigt marknadsföringsmaterial som direkt följd av fotograferingen","Antagande","3 av 4 sidor lästa")
   + adFact("Diakrit lästes inte (sidan omdirigerar till annan domän). Metas annonsbibliotek kunde inte läsas härifrån","Saknas","—")
   + adFact("Annons A ger fler förfrågningar än en ren fotoannons","Hypotes","Ska testas")
   + '</tbody></table></div>'
   + '<p class="xnote">Siffror som objektsdata, kontorsnamn och mäklare i annonserna är <b>demodata</b> och märkta så i bilden. Det är inga riktiga kunder.</p>';
}

function adA(){
  var t = AD.t;
  var H = AD_HOOKS.map(function(h,i){ return adOpt("hook", i, h[0]+" "+h[1], AD.hook===i) }).join('');
  var E = AD_ENDS.map(function(h,i){ return adOpt("end", i, h[0]+" "+h[1], AD.end===i) }).join('');
  var board = AD_BOARD.map(function(b,i){
    return '<div class="ad-bcard"><div class="ad-bfr"><div class="ad-fr" id="adb'+i+'">'+adFrame(b[0], false)+'</div></div>'
     +'<div class="mono ad-btime">'+(i+1)+' · '+b[0].toFixed(1).replace(".",",")+' s</div><h5>'+esc(b[1])+'</h5><p>'+esc(b[2])+'</p></div>';
  }).join('');
  var tl = AD_TIME.map(function(r){
    return '<tr><td class="mono">'+r[0]+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td>'+esc(r[3])+'</td></tr>';
  }).join('');
  var marks = [1.3, 4.6, 9.2, 12.45].map(function(m){ return '<i style="left:'+(m/AD_DUR*100).toFixed(2)+'%"></i>' }).join('');

  return sechead("Annons A · Reel 9:16", "En fotografering. Mer att arbeta med.",
    "Ett riktigt foto blir ett färdigt Till salu-inlägg. Fotot, Till salu-mallen och typografin är byggda av Studions egna renderare. "
    +"Objektdata, kontor och mäklare är demodata. Förhandsvisningen är en tidsfunktion, inte en film: exportknappen kodar den till en riktig MP4 om webbläsaren klarar det.")
   + adTabs()
   + '<div class="ad-stage">'
   +   '<div class="ad-player">'
   +     '<div class="ad-pframe"><div class="ad-fr" id="adscreen">'+adFrame(t,false)+(AD.zones?adZoneOverlay():'')+'</div></div>'
   +     '<div class="ad-ctl">'
   +       '<button class="tbtn" type="button" data-ad="play" id="adplay">'+(AD.playing?'❚❚ Paus':'▶ Spela')+'</button>'
   +       '<div class="ad-scrub"><input type="range" id="adscrub" min="0" max="1000" value="'+Math.round(t/AD_DUR*1000)+'">'+marks+'</div>'
   +       '<span class="mono" id="adtime">'+t.toFixed(1).replace(".",",")+' / '+AD_DUR.toFixed(1).replace(".",",")+' s</span>'
   +     '</div>'
   +     '<div class="ad-ctl2">'
   +       adOpt("zones", 0, (AD.zones?'Dölj':'Visa')+' säkra zoner', AD.zones)
   +       '<button class="tbtn" type="button" data-ad="export" id="adexp">Exportera MP4 · 1080 × 1920</button>'
   +     '</div>'
   +     '<p class="xnote" id="dlstat"></p>'
   +   '</div>'
   +   '<div class="ad-side">'
   +     '<div class="eyebrow">Hook · de första tre sekunderna</div><div class="ad-opts">'+H+'</div>'
   +     '<div class="eyebrow" style="margin-top:18px">Slutrad</div><div class="ad-opts">'+E+'</div>'
   +     '<p class="xnote" style="margin-top:16px">Hook 1 är rekommenderad: den säger fotografering först och mer än fotografering sist. '
   +     'Slutrad 3 är hämtad ur /maklare. Alla tre lever i samma tidslinje, byter du så byts de överallt här.</p>'
   +     '<div class="eyebrow" style="margin-top:18px">Meta-text · förslag</div>'
   +     '<div class="ad-copy"><b>Primärtext</b><p>Bilderna är bara början.<br>Med Viewly blir fotograferingen också färdigt material: objektets uppgifter och kontorets profil läggs på automatiskt i Social Media Studio.<br>Bostadsfotografering för mäklare i Skåne.</p>'
   +     '<b>Rubrik</b><p>'+esc(AD_HOOKS[AD.hook][0]+" "+AD_HOOKS[AD.hook][1])+'</p>'
   +     '<b>Beskrivning</b><p>Viewly · bostadsfotografering för mäklare</p>'
   +     '<b>Knapp</b><p>Läs mer · viewly.se/maklare</p>'
   +     '<b>Kortare alternativ</b><p>Fina bilder. Och färdiga inlägg direkt efteråt. Viewly fotograferar för mäklare i Skåne.</p></div>'
   +   '</div>'
   + '</div>'

   + '<h3 class="h3">Där den visas</h3>'
   + '<div class="ad-mocks">'
   +   '<div><div class="eyebrow">Instagram Reels</div>'+adMockReels(t, AD.zones)+'</div>'
   +   '<div><div class="eyebrow">Instagram-flödet · 4:5-beskärning</div>'+adMockFeed(t,false)+'</div>'
   +   '<div><div class="eyebrow">Facebook-flödet · 4:5-beskärning</div>'+adMockFeed(t,true)+'</div>'
   + '</div>'
   + '<p class="xnote">Gränssnitten är ritade för att visa skala och säkra ytor. De är inte Instagrams eller Facebooks riktiga. '
   + 'Flödesvyerna visar den 9:16-fil som exporteras, beskuren till 4:5 — allt viktigt ligger inom beskärningen, så en och samma master räcker. Stories går att lägga ut från samma fil.</p>'

   + '<h3 class="h3">Storyboard</h3><div class="ad-board">'+board+'</div>'
   + '<h3 class="h3">Tidslinje</h3>'
   + '<div class="ad-tablewrap"><table class="ad-facts ad-tl"><thead><tr><th>Tid (s)</th><th>Bild och rörelse</th><th>Text på skärmen</th><th>Övergång</th></tr></thead><tbody>'+tl+'</tbody></table></div>'
   + '<p class="xnote"><b>Ljud:</b> annonsen är byggd för att fungera utan ljud och har ingen berättarröst. Valfri diskret musik läggs på vid publicering. '
   + '<b>Finns:</b> förhandsvisning, storyboard, placeringsvyer och MP4-export via Studions befintliga kodare. '
   + '<b>Saknas:</b> riktiga objektuppgifter och kontorsprofil, mäklarens egen huvudbild till inlägget, ljud.</p>';
}

function adB(){
  return sechead("Annons B · Karusell 4:5", "Vad händer efter att bilderna är levererade?",
    "Skiss. För mäklare som är nyfikna efter Annons A: fem bilder, ett påstående per bild, och Studions riktiga mallar som bevis. "
    +"Bilderna på bild 2 är stand-ins ur biblioteket. Riktigt objekt och riktig profil behövs för publicering.")
   + adTabs()
   + '<div class="ad-slides">'+adAdB()+'</div>'
   + '<p class="xnote"><b>Idé:</b> frågan som rubrik, en förklaring per bild, slutkort som Annons A. <b>Behövs:</b> riktigt objekt med bilder, kontorets profil, och att bekräfta vilka fält som verkligen hämtas. '
   + '<b>Text, förslag:</b> “Bilderna är levererade. Vad händer sen? Objektets uppgifter och kontorets profil läggs på automatiskt, så inlägget är färdigt.”</p>';
}
function adC(){
  return sechead("Annons C · Fotokarusell 4:5", "Det börjar med bilden.",
    "Skiss. Nästan helt fotografi, minimal text, avsedd för mäklare som behöver se kvaliteten. En enda bild finns. "
    +"Ingen serie har hittats på: resten är märkta platser med exakt vad som behöver fotograferas.")
   + adTabs()
   + '<div class="ad-slides">'+adAdC()+'</div>'
   + '<div class="ad-need"><div class="eyebrow">Material som behövs</div><ol>'
   + '<li><b>Fyra bilder från samma objekt som fotot på bild 1.</b> Samma hem, samma ljus, helst stående format.</li>'
   + '<li>Bilderna bör vara olika typer: totalbild, kök eller detalj, och en skymnings- eller exteriörbild.</li>'
   + '<li>Tillstånd från mäklare och säljare att använda objektet i annonsering.</li>'
   + '<li>Beslut om affischerna i fotot kan visas, eftersom de är andras konstverk.</li></ol></div>'
   + '<p class="xnote"><b>Text, förslag:</b> “Det börjar med bilden. Bostadsfotografering för mäklare i Skåne.”</p>';
}

function secAds(){
  adInjectImg();
  var body = AD.tab === "a" ? adA() : AD.tab === "b" ? adB() : AD.tab === "c" ? adC() : adOversikt();
  return body;
}

/* ---------------------------------------------------------------------
   UPPSPELNING, REGLAGE, EXPORT
   --------------------------------------------------------------------- */
function adInjectImg(){
  if(document.getElementById("adphcss")) return;
  var s = document.createElement("style"); s.id = "adphcss";
  s.textContent = ".adph{background-image:url("+pick("adHome")+");background-size:cover}";
  document.head.appendChild(s);
}
function adPaint(){
  var el = document.getElementById("adscreen");
  if(el) el.innerHTML = adFrame(AD.t, false) + (AD.zones ? adZoneOverlay() : '');
  var sc = document.getElementById("adscrub");
  if(sc && document.activeElement !== sc) sc.value = Math.round(AD.t/AD_DUR*1000);
  var tm = document.getElementById("adtime");
  if(tm) tm.textContent = AD.t.toFixed(1).replace(".",",")+" / "+AD_DUR.toFixed(1).replace(".",",")+" s";
  var m = document.getElementById("adm-reels"); if(m) m.innerHTML = adFrame(AD.t,false);
  ["adm-ig","adm-fb"].forEach(function(id){
    var c = document.getElementById(id); if(c) c.firstChild.innerHTML = adFrame(AD.t,false);
  });
}
function adTick(now){
  if(!AD.playing) return;
  AD.t = (now - AD.t0)/1000;
  if(AD.t >= AD_DUR){ AD.t = AD_DUR; AD.playing = false; adPaint(); var b = document.getElementById("adplay"); if(b) b.textContent = "▶ Spela"; return }
  if(now - AD.last > 33){ AD.last = now; adPaint() }
  AD.raf = requestAnimationFrame(adTick);
}
function adPlay(){
  if(AD.playing){ AD.playing = false; var b = document.getElementById("adplay"); if(b) b.textContent = "▶ Spela"; return }
  if(AD.t >= AD_DUR - .05) AD.t = 0;
  AD.playing = true; AD.t0 = performance.now() - AD.t*1000;
  var b2 = document.getElementById("adplay"); if(b2) b2.textContent = "❚❚ Paus";
  AD.raf = requestAnimationFrame(adTick);
}

async function exportAd(btn){
  if(busy) return; busy = true;
  var lbl = btn.textContent, W = 1080, H = 1920, fps = 30, blob = null, vag = "";
  btn.disabled = true;
  var dl = await downloads();
  if(!dl){ btn.textContent = codeText("unavailable"); btn.disabled = false; busy = false;
    status(codeText("unavailable")); setTimeout(function(){ btn.textContent = lbl }, 3400); return }
  if(typeof VideoEncoder === "undefined"){
    status("Den här webbläsaren saknar videokodare. Öppna sidan i Chrome, Edge eller Safari för att exportera MP4.");
    btn.disabled = false; busy = false; return;
  }
  var keep = AD.t, wasPlaying = AD.playing; AD.playing = false;
  try {
    var render = function(tt){
      return svgImage(svgDoc(W, H, '<foreignObject x="0" y="0" width="'+W+'" height="'+H+'">'
        + xhtml(adFrame(tt, true), W, H, AD_PAPER) + '</foreignObject>'), W, H);
    };
    var N = Math.round(AD_DUR*fps);
    var c = document.createElement("canvas"); c.width = W; c.height = H;
    var ctx = c.getContext("2d", {alpha:false}), t0 = performance.now();
    var draw = async function(i){
      var img = await render(i/fps);
      ctx.fillStyle = AD_PAPER; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
    };
    var onp = function(i, n){
      var kvar = i > 4 ? Math.round((performance.now()-t0)/i*(n-i)/1000) : 0;
      btn.textContent = "Kodar " + i + " / " + n + (kvar ? " · " + kvar + " s kvar" : "");
    };
    btn.textContent = "Förbereder…";
    var r = await mp4encode(c, W, H, fps, N, draw, onp, 12000000);
    if(r && r.blob && await verifyClip(r.blob, AD_DUR)){ blob = r.blob; vag = r.kind }
    else status("Den kodade filen gick inte att läsa tillbaka, så ingen fil lämnas ut.");
  } catch(e){ status("Kodningen misslyckades: " + (e && e.message || e)) }
  AD.t = keep; adPaint();
  btn.disabled = false; btn.textContent = lbl; busy = false;
  if(blob){
    var ok = await offer(blob, "viewly-annons-a-reel-1080x1920.mp4", btn);
    if(ok) status("Annons A · " + AD_DUR.toFixed(1).replace(".",",") + " s · 30 bilder/s · " + fmtBytes(blob.size)
      + (vag === "avc" ? "" : " · webbläsaren saknar H.264, filen är VP9 och spelas inte på iPhone"));
  }
}

document.addEventListener("click", function(e){
  var b = e.target.closest("[data-ad]"); if(!b) return;
  var k = b.dataset.ad, i = b.dataset.i;
  if(k === "tab"){ AD.tab = i; AD.playing = false; render({top:true}); return }
  if(k === "play"){ adPlay(); return }
  if(k === "hook"){ AD.hook = +i; render(); return }
  if(k === "end"){ AD.end = +i; render(); return }
  if(k === "zones"){ AD.zones = !AD.zones; render(); return }
  if(k === "export"){ exportAd(b); return }
});
document.addEventListener("input", function(e){
  if(e.target.id !== "adscrub") return;
  AD.t = e.target.value/1000*AD_DUR; AD.playing = false;
  var b = document.getElementById("adplay"); if(b) b.textContent = "▶ Spela";
  adPaint();
});
