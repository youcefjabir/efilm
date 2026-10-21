/* =====================================================================
   ADS 3 — del A: verktygslådan

   Allt ritas i en <canvas> i enheten "cqw": 100 är bildens bredd, så en
   enhet är 10,8 px i en 1080-bred bild. Samma kod ritar förhandsvisningen
   (60 bilder i sekunden), storyboarden, PNG:erna och videon. Ingen SVG,
   ingen foreignObject, inga DOM-träd som byggs om varje bildruta. Det är
   därför uppspelning och export går mjukt.

   Allt innehåll är DEMODATA: Storgatan 13, priset, tiderna och kontoret
   Nordvik Mäklarbyrå, som är ett exempel och inte deras riktiga profil.
   ===================================================================== */

var V3 = {img:{}, ready:false, loading:null};
var V3_KEYS = {home:"adHome", dining:"adDining", beige:"adBeige", bedroom:"adBedroom", house:"adHouse",
               terrace:"adTerrace", porch:"adPorch", blur:"adHomeBlur"};
var V3_POS = {home:[.5,.45], dining:[.46,.5], beige:[.56,.5], bedroom:[.5,.52], house:[.5,.72], terrace:[.4,.5], porch:[.3,.5]};
/* Viewlys egen palett, hämtad ur Highlights-systemet: ARKIV (papper, ink, oliv)
   och SKUGGA (varmt svart, oliv lyft). Ingen blå, inget guld. */
var C3 = {paper:"#ECE8E5", ink:"#1C1C1E", oli:"#6E7266", olil:"#98A088", dark:"#0E0E0D", ui:"#F3F0ED", uil:"#E3DED9",
          mut:"#8C8782", line:"#D8D2CF", cream:"#EFEDE7", green:"#6E9A6B"};
/* Kontorets profil (exempel). Ändras i panelen Anpassa. */
var OFF = {name:"NORDVIK", sub:"MÄKLARBYRÅ", accent:"#2F6F6B", accentL:"#9CC7C0"};
/* Texter som går att ändra i videorna (Anpassa). Tom sträng döljer texten. */
var V3_TXD = {"outro.tag1":"En bostadsfotograf som gör", "outro.tag2":"mer än bara fotografering.", "outro.aud":"FÖR FASTIGHETSMÄKLARE I SKÅNE", "outro.url":"VIEWLY.SE/MAKLARE",
  "tpl.tillsalu":"TILL SALU", "tpl.kommande":"KOMMANDE", "tpl.sald":"Såld", "tpl.tack":"Tack för förtroendet",
  "ui.portal":"MÄKLARPORTALEN", "ui.valjbild":"VÄLJ BILD", "ui.valjmall":"VÄLJ MALL", "ui.mina":"MINA MALLAR", "ui.viewlys":"VIEWLYS", "ui.egen":"+ Skapa egen mall",
  "ui.valjbilder":"VÄLJ BILDER", "ui.valjmallar":"VÄLJ MALLAR", "ui.av":"AV", "ui.valda":"VALDA", "ui.fortsatt":"FORTSÄTT", "ui.skapa":"SKAPA KAMPANJ",
  "camp.skapas":"KAMPANJEN SKAPAS", "camp.fyll":"Bostadens uppgifter fylls i automatiskt", "camp.klar1":"Din kampanj", "camp.klar2":"är klar.", "camp.dl":"LADDA NER ALLA 3", "camp.klart":"NEDLADDAD"};
var V3_TX = {};
function v3t(k){ return Object.prototype.hasOwnProperty.call(V3_TX, k) ? V3_TX[k] : V3_TXD[k] }
var V3F = {serif:"'Cormorant Garamond',Georgia,serif", sans:"Montserrat,sans-serif"};
var V3_OBJ = {addr:"Storgatan 13", city:"Landskrona", rum:"4", yta:"112", kommande:"Släpps vecka 12", maklare:"Anna Lindqvist"};
function v3Facts(){ return V3_OBJ.rum + " rum  ·  " + V3_OBJ.yta + " m²" }

function v3Load(){
  if(V3.loading) return V3.loading;
  var names = Object.keys(V3_KEYS);
  V3.loading = Promise.all(names.map(function(n){
    return new Promise(function(res){
      var im = new Image(); V3.img[n] = im;
      im.onload = function(){ res() }; im.onerror = function(){ res() };
      im.src = pick(V3_KEYS[n]);
      if(im.decode) im.decode().then(res, res);
    });
  })).then(function(){
    return Promise.all([
      document.fonts.load('300 40px "Cormorant Garamond"'), document.fonts.load('italic 300 40px "Cormorant Garamond"'),
      document.fonts.load('400 40px "Cormorant Garamond"'), document.fonts.load('500 20px Montserrat'), document.fonts.load('600 20px Montserrat')
    ]);
  }).then(function(){ V3.ready = true }, function(){ V3.ready = true });
  return V3.loading;
}

/* ---------- lättnader ---------- */
function oQ(t){ return 1 - Math.pow(1 - t, 5) }
function ioQ(t){ return t < .5 ? 16*t*t*t*t*t : 1 - Math.pow(-2*t + 2, 5)/2 }
function ioC(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2 }
function oBack(t){ var c1 = 1.2, c3 = c1 + 1; return Math.max(0, 1 + c3*Math.pow(t - 1, 3) + c1*Math.pow(t - 1, 2)) }
function k3(t, a, b){ return mclamp((t - a)/(b - a)) }

/* ---------- ritprimitiver (c är redan skalad till cqw) ---------- */
function v3Begin(canvas, wpx, hpx){
  if(canvas.width !== wpx) canvas.width = wpx;
  if(canvas.height !== hpx) canvas.height = hpx;
  var c = canvas.getContext("2d");
  c.setTransform(wpx/100, 0, 0, wpx/100, 0, 0);
  c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
  return c;
}
function v3Fill(c, x, y, w, h, col, a){ c.globalAlpha = a == null ? 1 : a; c.fillStyle = col; c.fillRect(x, y, w, h); c.globalAlpha = 1 }
function v3Photo(c, name, x, y, w, h, o){
  o = o || {};
  var im = V3.img[name]; if(!im || !im.naturalWidth) return;
  var pos = o.pos || V3_POS[name] || [.5, .5], sc = o.scale || 1, iw = im.naturalWidth, ih = im.naturalHeight;
  var s = Math.max(w/iw, h/ih)*sc, dw = iw*s, dh = ih*s;
  var dx = x - (dw - w)*pos[0], dy = y - (dh - h)*pos[1];
  c.save(); c.globalAlpha = c.globalAlpha*(o.alpha == null ? 1 : o.alpha);
  c.beginPath(); c.rect(x, y, w, h); c.clip(); c.drawImage(im, dx, dy, dw, dh); c.restore();
}
function v3Grad(c, x, y, w, h, stops, a){
  var g = c.createLinearGradient(0, y, 0, y + h);
  stops.forEach(function(s){ g.addColorStop(s[0], s[1]) });
  c.globalAlpha = a == null ? 1 : a; c.fillStyle = g; c.fillRect(x, y, w, h); c.globalAlpha = 1;
}
function v3Font(o){ return (o.italic ? "italic " : "") + (o.weight || 300) + " " + o.size + "px " + V3F[o.f || "serif"] }
function v3Measure(c, s, o){
  c.font = v3Font(o);
  var sp = (o.sp || 0)*o.size;
  if(!sp) return c.measureText(s).width;
  var w = 0, i; for(i = 0; i < s.length; i++) w += c.measureText(s[i]).width + sp;
  return w - sp;
}
/* Text. y är baslinjen. p 0→1 avslöjar från vänster med en liten höjning;
   skuggan ger läsbarhet över foto. */
function v3Text(c, s, x, y, o){
  var w = v3Measure(c, s, o), al = o.align || "l";
  var x0 = al === "c" ? x - w/2 : al === "r" ? x - w : x;
  var p = o.p == null ? 1 : o.p; if(p <= 0) return w;
  c.save();
  c.globalAlpha = (o.alpha == null ? 1 : o.alpha)*Math.min(1, p*4);
  if(o.rise) c.translate(0, (1 - p)*o.rise);
  if(p < 1){ c.beginPath(); c.rect(x0 - 2, y - o.size*1.2, (w + 4)*p, o.size*1.9); c.clip() }
  if(o.shadow){ c.shadowColor = "rgba(0,0,0,.4)"; c.shadowBlur = o.size*.5; c.shadowOffsetY = o.size*.05 }
  c.fillStyle = o.color || "#fff"; c.font = v3Font(o); c.textBaseline = "alphabetic"; c.textAlign = "left";
  var sp = (o.sp || 0)*o.size;
  if(!sp) c.fillText(s, x0, y);
  else { var cx = x0, i; for(i = 0; i < s.length; i++){ c.fillText(s[i], cx, y); cx += c.measureText(s[i]).width + sp } }
  c.restore();
  return w;
}
function v3Line(c, x1, x2, y, col, th, p, a){
  if(p <= 0) return;
  var cx = (x1 + x2)/2, hw = (x2 - x1)/2*p;
  c.globalAlpha = a == null ? 1 : a; c.fillStyle = col; c.fillRect(cx - hw, y - th/2, hw*2, th); c.globalAlpha = 1;
}
function v3VLine(c, x, y1, y2, col, th, p, a){
  if(p <= 0) return;
  c.globalAlpha = a == null ? 1 : a; c.fillStyle = col; c.fillRect(x - th/2, y1, th, (y2 - y1)*p); c.globalAlpha = 1;
}
/* ram som ritas runt kanten, med start uppe i mitten */
function v3Frame(c, x, y, w, h, col, th, p, a){
  if(p <= 0) return;
  var per = 2*(w + h), len = per*p;
  c.save(); c.globalAlpha = a == null ? 1 : a; c.strokeStyle = col; c.lineWidth = th; c.setLineDash([len, per]); c.lineDashOffset = 0;
  c.beginPath(); c.moveTo(x + w/2, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.lineTo(x, y); c.lineTo(x + w/2, y); c.stroke(); c.restore();
}
var V3_PATH = null;
function v3Mark(c, x, y, h, ink, dot, o){
  if(!V3_PATH) V3_PATH = new Path2D(GEO.limb);
  o = o || {};
  var s = h/756.3;
  c.save(); c.globalAlpha = (o.alpha == null ? 1 : o.alpha);
  c.translate(x, y); c.scale(s, s);
  var rp = o.reveal == null ? 1 : o.reveal;
  if(rp < 1){ c.beginPath(); c.rect(-5, 756.3*(1 - rp) - 5, 900, 756.3*rp + 10); c.clip() }
  c.fillStyle = ink; c.fill(V3_PATH);
  c.restore();
  var dp = o.dot == null ? 1 : o.dot;
  if(dp > 0){
    c.save(); c.globalAlpha = (o.alpha == null ? 1 : o.alpha); c.translate(x, y); c.scale(s, s);
    c.fillStyle = dot; c.beginPath(); c.arc(GEO.dot.cx, GEO.dot.cy, GEO.dot.r*oBack(mclamp(dp)), 0, Math.PI*2); c.fill(); c.restore();
  }
}
/* Viewlys märke och ordbild. capH är ordbildens versalhöjd; märket görs
   mk gånger högre. Proportionen är vald så att det tunga märket och den
   luftiga ordbilden väger lika. Returnerar bredden. */
function v3Lock(c, cx, cy, capH, ink, dot, o){
  o = o || {};
  var mk = o.mk || 1.55, mh = capH*mk, mw = mh*858.6/756.3, fs = capH/0.7, gap = capH*.95;
  var wo = {size:fs, weight:500, f:"sans", sp:.2, color:ink};
  var ww = v3Measure(c, "VIEWLY", wo), tot = mw + gap + ww, x0 = o.left != null ? o.left : cx - tot/2;
  v3Mark(c, x0, cy - mh/2, mh, ink, dot, {reveal:o.pm, dot:o.pd, alpha:o.alpha});
  /* ordbilden: bokstav för bokstav om o.letters, annars en mask */
  var by = cy + capH/2 + capH*.02, wx = x0 + mw + gap;
  if(o.letters != null){
    var s = "VIEWLY", i, x = wx;
    for(i = 0; i < s.length; i++){
      var lp = oQ(k3(o.letters, i*.11, i*.11 + .5));
      v3Text(c, s[i], x, by, {size:fs, weight:500, f:"sans", color:ink, p:lp, rise:capH*.5, alpha:o.alpha});
      x += c.measureText(s[i]).width + .2*fs;
    }
  } else {
    v3Text(c, "VIEWLY", wx, by, {size:fs, weight:500, f:"sans", sp:.2, color:ink, p:o.pw == null ? 1 : o.pw, alpha:o.alpha});
  }
  return tot;
}
/* Kontorets logga (exempel): monogram + ordbild */
function v3NLogo(c, x, y, sz, col, al, p){
  p = p == null ? 1 : p; if(p <= 0) return;
  var bw = 4.8*sz, nw = 0, w1, w2;
  var o1 = {size:2.3*sz, weight:600, f:"sans", sp:.34}, o2 = {size:1.2*sz, weight:500, f:"sans", sp:.44};
  w1 = v3Measure(c, OFF.name, o1); w2 = v3Measure(c, OFF.sub, o2);
  var tw = Math.max(w1, w2), tot = bw + 1.8*sz + tw;
  var x0 = al === "c" ? x - tot/2 : al === "r" ? x - tot : x;
  c.save(); c.globalAlpha = p;
  c.strokeStyle = col; c.lineWidth = .3*sz; c.strokeRect(x0, y, bw, bw);
  v3Text(c, "N", x0 + bw/2, y + bw*.72, {size:3.5*sz, weight:400, color:col, align:"c"});
  v3Text(c, OFF.name, x0 + bw + 1.8*sz, y + bw*.46, {size:2.3*sz, weight:600, f:"sans", sp:.34, color:col});
  v3Text(c, OFF.sub, x0 + bw + 1.8*sz, y + bw*.9, {size:1.2*sz, weight:500, f:"sans", sp:.44, color:col, alpha:.8});
  c.restore();
  return tot;
}

/* ---------------------------------------------------------------------
   INLÄGGSMALLAR (förslag). Tre stilar, fyra faser, valfritt format.
   Kortet ritas i en egen 100-bred koordinat; ar = höjd/bredd.
   prog 0→1 bygger upp overlayen i lugna steg.
   --------------------------------------------------------------------- */
var V3_PHOTO = {kommande:"dining", tillsalu:"home", visning:"beige", sald:"bedroom"};
function v3Step(prog, a, b){ return oQ(k3(prog, a, b)) }
/* En mall ritas i en egen 100-bred koordinat; ar = höjd/bredd. prog 0→1 bygger
   upp den i tre lugna steg. Mallens FASTA text (TILL SALU, Såld, Tack för
   förtroendet, kontorets logga) syns alltid. De DYNAMISKA fälten — adress,
   ort, rum, yta — visas som fältnamn (Adress, Ort, Rum, Yta) tills inlägget
   skapas, och fylls då med bostadens uppgifter. o.skel: 0/odefinierat =
   färdigt inlägg · tal = andel fältnamn · "auto" = fältnamnen byts mot
   uppgifterna medan prog går 0→1. o.place = vad som är utplacerat i
   mallredigeraren. */
function v3Post(c, style, phase, name, x, y, w, ar, prog, o){
  o = o || {};
  var H = 100*ar, p = prog == null ? 1 : prog, tall = ar > 1.5, pl = o.place || null;
  var tokMode = o.skel !== undefined && o.skel !== 0 && o.skel !== false;
  var tkOf = function(a, b){ return o.skel === "auto" ? 1 - k3(p, a, b) : (o.skel || 0) };
  c.save(); c.translate(x, y); c.scale(w/100, w/100);
  c.beginPath(); c.rect(0, 0, 100, H); c.clip();
  v3Photo(c, name || V3_PHOTO[phase], 0, 0, 100, H, {scale:o.zoom || 1});
  var main = phase === "tillsalu", sa = tokMode || pl ? 1 : k3(p, 0, .25);
  if(!main) v3Fill(c, 0, 0, 100, H, "#0c0a0a", (style === "badge" ? .12 : .26)*sa);
  if(main) v3Grad(c, 0, H*.24, 100, H*.76, [[0, "rgba(12,10,10,0)"], [.3, "rgba(12,10,10,.34)"], [.62, "rgba(12,10,10,.72)"], [1, "rgba(12,10,10,.93)"]], sa);
  else v3Grad(c, 0, H*.34, 100, H*.66, [[0, "rgba(12,10,10,0)"], [.45, "rgba(12,10,10,.16)"], [1, "rgba(12,10,10,.55)"]], sa);
  v3Grad(c, 0, 0, 100, H*.15, [[0, "rgba(12,10,10,.32)"], [1, "rgba(12,10,10,0)"]], sa);
  var m = tall ? 16 : 0, mt = tall ? 18 : 0, W = "#fff", acc = OFF.accentL, cream = C3.cream;
  /* fast text: alltid där i token-läge, annars i steg */
  var st = function(v){ return tokMode ? 1 : (pl ? 0 : v) };
  var plc = function(k){ return pl ? (pl[k] == null ? 0 : pl[k]) : 0 };
  var fixedA = function(k, v){ return pl ? plc(k) : st(v) };
  var w1 = pl ? plc("logo")*.0 + 1 : (tokMode ? 1 : k3(p, 0, .26)), lg = pl ? plc("logo") : (tokMode ? 1 : v3Step(p, .04, .28));
  var sLab = v3Step(p, .22, .4), sAdr = v3Step(p, .3, .58), sCity = v3Step(p, .42, .6), sFact = v3Step(p, .58, .82), sSub = v3Step(p, .74, .96);
  /* dynamiskt fält: värde (uppgiften) och fältnamn (token) */
  var tkA = tkOf(.12, .4), tkC = tkOf(.26, .52), tkF = tkOf(.42, .7);
  /* fältnamnet tonas ut först, uppgiften tonas in efteråt — aldrig båda samtidigt */
  var dynV = function(tk, stage, k){ return pl ? 0 : (tokMode ? ioC(k3(1 - tk, .5, 1)) : stage) };
  var dynT = function(tk, k){ return pl ? plc(k) : (tokMode ? ioC(k3(tk, .5, 1)) : 0) };
  /* fältnamn: rent, utan ruta — namnet i små versaler över en tunn linje, som en rad att fylla i */
  var token = function(cx, base, tw, th, label, al, left, fs){
    if(al <= .01) return;
    var x0 = left ? cx : cx - tw/2, sz = Math.min(fs || 2, 2), ly = base - th*.18;
    c.save(); c.globalAlpha = al*.9; c.fillStyle = "rgba(255,255,255,.7)"; c.fillRect(x0, ly, tw, .2); c.restore();
    v3Text(c, label, left ? x0 : x0 + tw/2, ly - 1.1, {size:sz, weight:500, f:"sans", sp:.3, color:"rgba(255,255,255,.88)", align:left ? "l" : "c", alpha:al});
  };
  var frameA = pl ? plc("logo") : (tokMode ? 1 : k3(p, 0, .26));
  if(style === "overlay"){
    c.globalAlpha = .55*frameA; c.strokeStyle = "#fff"; c.lineWidth = .26; c.strokeRect(3.5, 3.5, 93, H - 7); c.globalAlpha = 1;
    v3NLogo(c, 50, 8.5 + mt, 1.05, W, "c", lg);
    var fy = H - 17 - m;
    if(phase === "tillsalu"){
      var lly = fy - 43, lw = v3Measure(c, v3t("tpl.tillsalu"), {size:2.2, weight:600, f:"sans", sp:.42}), la = fixedA("label", sLab);
      v3Line(c, 50 - lw/2 - 12, 50 - lw/2 - 3, lly - .8, acc, .3, la); v3Line(c, 50 + lw/2 + 3, 50 + lw/2 + 12, lly - .8, acc, .3, la);
      v3Text(c, v3t("tpl.tillsalu"), 50, lly, {size:2.2, weight:600, f:"sans", sp:.42, color:acc, align:"c", alpha:la});
      v3Text(c, V3_OBJ.addr, 50, fy - 29, {size:13, color:W, align:"c", p:tokMode || pl ? 1 : sAdr, alpha:dynV(tkA, 1), shadow:true});
      token(50, fy - 23.6, 58, 11, "ADRESS", dynT(tkA, "addr"));
      v3Text(c, V3_OBJ.city.toUpperCase(), 50, fy - 20, {size:2.3, weight:500, f:"sans", sp:.38, color:W, align:"c", alpha:dynV(tkC, sCity)});
      token(50, fy - 17.4, 22, 5, "ORT", dynT(tkC, "city"), false, 1.8);
      v3Line(c, 43, 57, fy - 14, acc, .3, pl ? plc("addr") : (tokMode ? 1 : sCity));
      [[V3_OBJ.rum, "RUM", 36, "rum"], [V3_OBJ.yta, "M²", 64, "yta"]].forEach(function(f){
        var va = dynV(tkF, sFact), ta = dynT(tkF, f[3]);
        c.save(); c.globalAlpha = va; c.translate(0, (tokMode || pl ? 0 : (1 - sFact)*1.4)); v3Text(c, f[0], f[2], fy, {size:6.6, weight:400, color:W, align:"c", alpha:va}); c.restore();
        token(f[2], fy + 3.1, 15, 8.4, f[3] === "rum" ? "RUM" : "YTA", ta, false, 1.9);
        c.save(); c.globalAlpha = Math.max(va, ta > 0 ? .8 : 0)*(pl ? plc(f[3]) : 1); v3Text(c, f[1], f[2], fy + 5.2 + (ta > 0 ? 1.6 : 0), {size:1.7, weight:500, f:"sans", sp:.3, color:W, align:"c", alpha:.8*Math.max(va, ta > 0 ? 1 : 0)*(pl ? plc(f[3]) : 1)}); c.restore();
      });
      v3VLine(c, 50, fy - 6, fy + 6, "#fff", .2, pl ? Math.max(plc("rum"), plc("yta")) : (tokMode ? 1 : sFact), .45);
    } else if(phase === "kommande"){
      var cy = H/2 + 4, lw2 = v3Measure(c, v3t("tpl.kommande"), {size:2.2, weight:600, f:"sans", sp:.42}), la2 = fixedA("label", sLab);
      v3Line(c, 50 - lw2/2 - 12, 50 - lw2/2 - 3, cy - 18.8, acc, .3, la2); v3Line(c, 50 + lw2/2 + 3, 50 + lw2/2 + 12, cy - 18.8, acc, .3, la2);
      v3Text(c, v3t("tpl.kommande"), 50, cy - 18, {size:2.2, weight:600, f:"sans", sp:.42, color:acc, align:"c", alpha:la2});
      v3Text(c, V3_OBJ.addr, 50, cy, {size:15.5, color:W, align:"c", p:tokMode || pl ? 1 : sAdr, alpha:dynV(tkA, 1), shadow:true});
      token(50, cy + 6, 62, 12, "ADRESS", dynT(tkA, "addr"));
      v3Line(c, 43, 57, cy + 8, acc, .3, tokMode ? 1 : sCity);
      v3Text(c, V3_OBJ.kommande, 50, cy + 17, {size:5.2, italic:true, color:cream, align:"c", alpha:dynV(tkF, sFact)});
      token(50, cy + 21, 36, 6.4, "TEXT", dynT(tkF, "yta"), false, 1.8);
    } else {
      var cy3 = H/2 + 4;
      v3Text(c, v3t("tpl.sald"), 50, cy3 + 8, {size:42, italic:true, color:W, align:"c", p:tokMode || pl ? 1 : v3Step(p, .26, .6), alpha:fixedA("label", 1), shadow:true});
      v3Line(c, 40, 60, cy3 + 18, acc, .3, tokMode ? 1 : sCity);
      v3Text(c, (V3_OBJ.addr + " · " + V3_OBJ.city).toUpperCase(), 50, cy3 + 27, {size:2.3, weight:500, f:"sans", sp:.3, color:W, align:"c", alpha:dynV(tkA, sFact)});
      token(50, cy3 + 29.4, 56, 5.6, "ADRESS · ORT", dynT(tkA, "addr"), false, 1.8);
      v3Text(c, v3t("tpl.tack"), 50, cy3 + 38, {size:3.8, italic:true, color:cream, align:"c", alpha:tokMode ? 1 : sSub});
    }
  } else if(style === "editorial"){
    v3NLogo(c, 9, 9 + mt, .95, W, "l", lg);
    var bb = H - 9.5 - m, lab = {kommande:v3t("tpl.kommande"), tillsalu:v3t("tpl.tillsalu"), visning:"VISNING", sald:String(v3t("tpl.sald")).toUpperCase()}[phase];
    var big = phase === "sald" ? 24 : 15, labY = bb - 11.5 - big*.74 - 4.2, la3 = fixedA("label", sLab);
    v3Line(c, 9, 91, labY - 6.4, "#fff", .2, frameA, .5);
    v3Fill(c, 9, labY - .8, 5*la3, .3, acc);
    v3Text(c, lab, 16, labY, {size:2.2, weight:600, f:"sans", sp:.4, color:acc, alpha:la3});
    var adrTxt = phase === "sald" ? "Såld." : V3_OBJ.addr;
    if(phase === "sald") v3Text(c, adrTxt, 9, bb - 11.5, {size:big, italic:true, color:W, p:tokMode || pl ? 1 : sAdr, alpha:fixedA("label", 1), shadow:true});
    else { v3Text(c, adrTxt, 9, bb - 11.5, {size:big, color:W, p:tokMode || pl ? 1 : sAdr, alpha:dynV(tkA, 1), shadow:true}); token(9, bb - 8.6, 62, 12.4, "ADRESS", dynT(tkA, "addr"), true) }
    var sub = phase === "tillsalu" ? v3Facts() : phase === "kommande" ? V3_OBJ.kommande : V3_OBJ.addr + " · " + V3_OBJ.city;
    v3Text(c, sub.toUpperCase(), 9, bb - 2.5, {size:2.2, weight:500, f:"sans", sp:.28, color:W, alpha:dynV(tkF, sFact)*.95});
    token(9, bb - .4, 46, 5.4, phase === "tillsalu" ? "RUM · YTA" : phase === "kommande" ? "TEXT" : "ADRESS · ORT", dynT(tkF, "yta"), true, 1.8);
    v3Text(c, V3_OBJ.city.toUpperCase(), 91, 12.4 + mt, {size:1.9, weight:500, f:"sans", sp:.34, color:W, align:"r", alpha:Math.max(lg, 0)*.85*dynV(tkC, 1)});
  } else {
    v3NLogo(c, 9, 9 + mt, .95, W, "l", lg);
    var bq = tokMode || pl ? 1 : oBack(k3(p, .2, .5)), r = 12.5;
    if(bq > 0){
      c.save(); c.translate(80, 24 + mt); c.rotate(-.12); c.scale(bq, bq);
      c.fillStyle = OFF.accent; c.beginPath(); c.arc(0, 0, r, 0, Math.PI*2); c.fill();
      var bsp = function(s, d){ s = String(s); if(s === d[0] + d[1] || s === d[0] + " " + d[1]) return d; var w = s.toUpperCase().split(" "); return [w[0], w.slice(1).join(" ")] };
      var bl = phase === "tillsalu" ? bsp(v3t("tpl.tillsalu"), ["TILL", "SALU"]) : phase === "kommande" ? bsp(v3t("tpl.kommande"), ["KOM-", "MANDE"]) : phase === "visning" ? ["VIS-", "NING"] : bsp(v3t("tpl.sald"), ["SÅLD", ""]);
      v3Text(c, bl[0], 0, bl[1] ? -1 : 2.4, {size:3.3, weight:700, f:"sans", sp:.22, color:"#fff", align:"c"}); if(bl[1]) v3Text(c, bl[1], 0, 4.4, {size:3.3, weight:700, f:"sans", sp:.22, color:"#fff", align:"c"});
      c.restore();
    }
    var b2 = H - 11 - m;
    if(phase === "sald") v3Text(c, v3t("tpl.sald"), 9, b2 - 8, {size:26, italic:true, color:W, p:tokMode || pl ? 1 : sAdr, shadow:true});
    else { v3Text(c, phase === "visning" ? "Välkommen." : V3_OBJ.addr, 9, b2 - 8, {size:14.5, color:W, p:tokMode || pl ? 1 : sAdr, alpha:dynV(tkA, 1), shadow:true}); token(9, b2 - 5.6, 62, 11.6, "ADRESS", dynT(tkA, "addr"), true) }
    v3Fill(c, 9, b2 - 3.8, 11*(tokMode ? 1 : sCity), .35, acc);
    var s2 = phase === "tillsalu" ? v3Facts() : phase === "kommande" ? V3_OBJ.kommande : phase === "visning" ? V3_OBJ.addr + " · " + V3_OBJ.city : v3t("tpl.tack");
    v3Text(c, s2.toUpperCase(), 9, b2 + 1.8, {size:2.2, weight:500, f:"sans", sp:.28, color:W, alpha:phase === "sald" ? (tokMode ? 1 : sFact) : dynV(tkF, sFact)});
    if(phase !== "sald") token(9, b2 + 3.4, 46, 5.4, phase === "tillsalu" ? "RUM · YTA" : phase === "kommande" ? "TEXT" : "ADRESS · ORT", dynT(tkF, "yta"), true, 1.8);
  }
  c.restore();
}
