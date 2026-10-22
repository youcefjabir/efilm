/* =====================================================================
   SIDA 16 — KAMPANJEN: NY AKTÖR INOM BOSTADSFOTOGRAFI
   Fem annonser för den enskilda mäklaren i Skåne på Facebook och Instagram.

   Mål: kännedom och nyfikenhet. Mäklaren ska förstå att det finns en ny
   aktör inom bostadsfotografering, att fotografering är kärnan, och att
   Viewly är mer än en fotograf: allt från bokningen (foto, film, planritning,
   annonstext, inlägg) kommer med, och uppgifterna hämtas från bokningen.
   Värdet är mer tid, ett starkare resultat och färre led, utan löften om siffror.
   Varje annons har en egen vinst och ett eget uttryck, och slutar som
   varumärkesfilmen: Boka fotografering, viewly.se, tagline, loggan.

   1 Bostadsfoto. Och lite till.  (kännedom: kärnan och allt som ingår)
   2 Boka en fotografering.       (tid: texten och inläggen följer med)
   3 Ett objekt. Fyra inlägg.     (resultat: närvaro utan extra jobb)
   4 Fem leverantörer. Eller en.  (enkelhet: ett ställe, en bokning)
   5 Din bostadsfotograf i Skåne. (lokalt: ett inlägg, tre kontors utseenden)

   Meta: 9:16 och 4:5. I 9:16 ligger allt i Metas säkra yta (14 % överst,
   35 % nederst, 6 % på sidorna lämnas fria). Allt är begripligt utan ljud.
   Bilder: bara era egna. Mallarnas färger är egna nyanser, inga kedjors
   namn eller märken.
   ===================================================================== */
(function(){
var K = window.A7K, A7 = K.A7, END_L = K.END_L, rr = K.rr, reg = K.rawReg, MX = 8;
var PAPER = C3.paper, INK = C3.ink, MUT = "#5f5a55", DARK = "#070606", OLI = C3.oli;

V3_KEYS.bedroom = "adBedroom"; V3_POS.bedroom = [.5, .55];
var P = {chair:"rs_chair", dining:"rs_dining", kitchen:"rs_kitchen", floor:"rs_floor", statue:"rs_statue", bed:"bedroom"};

/* ---------- redigerbara texter ---------- */
var TX = {
  "a8.ny.l1":["Bostadsfoto.", "1 · rubrik, rad 1"], "a8.ny.l2":["Och lite till.", "1 · rubrik, rad 2"], "a8.ny.lab":["I PRESENTATIONEN", "1 · liten rad över listan"], "a8.ny.f":["Allt i en bokning.", "1 · slutrad"],
  "a8.ti.l1":["Boka en fotografering.", "2 · rubrik, rad 1"], "a8.ti.l2":["Texten och inläggen följer med.", "2 · rubrik, rad 2"],
  "a8.fa.l1":["Ett objekt.", "3 · rubrik, rad 1"], "a8.fa.l2":["Fyra inlägg.", "3 · rubrik, rad 2"], "a8.fa.f":["Färdiga med bilderna.", "3 · rad under rubriken"],
  "a8.et.a1":["Fem leverantörer.", "4 · rubrik först"], "a8.et.b1":["Eller en", "4 · rubrik sedan, rak del"], "a8.et.b2":["bokning.", "4 · rubrik sedan, kursiv del"],
  "a8.sk.l":["BOSTADSFOTOGRAFI I", "5 · liten rad"], "a8.sk.h1":["Din bostadsfotograf", "5 · rubrik, rad 1"], "a8.sk.h2":["i Skåne.", "5 · rubrik, rad 2"], "a8.sk.cap":["UPPGIFTERNA HÄMTAS FRÅN BOKNINGEN", "5 · rad över bokningen"]
};
Object.keys(TX).forEach(function(k){ V3_TXD[k] = TX[k][0] });
var T = function(k){ return v3t(k) };

/* ---------- gemensamma delar ---------- */
function rev(t, a, d){ return ioC(k3(t, a, a + (d == null ? .6 : d))) }
function fz(c, s, o, maxW){ var w = v3Measure(c, s, o); return w > maxW ? o.size*maxW/w : o.size }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)) }
/* Metas säkra yta: i 9:16 lämnas 14 % överst, 35 % nederst och 6 % på sidorna fria */
function SG(G){ var y0 = G.top + 3, y1 = G.is9 ? G.H*.65 - 3 : G.H - G.bot - 4; return {y0:y0, y1:y1, h:y1 - y0} }
function lab(c, s, x, y, a, o){ o = o || {}; return v3Text(c, s, x, y, {size:o.size || 2.1, weight:o.weight || 600, f:"sans", sp:o.sp == null ? .26 : o.sp, color:o.color || MUT, align:o.align || "l", alpha:a, p:o.p, shadow:o.shadow}) }
/* rubrik i två rader (rak + kursiv), alltid inom 84 bredd. Returnerar nedre kanten. */
function head2(c, G, t, t0, y, l1, l2, o){
  o = o || {}; var s0 = o.size || (G.is9 ? 11 : 9), a = (o.a == null ? 1 : o.a)*rev(t, t0, .7), al = o.align || "l", x = al === "c" ? 50 : MX;
  var s = Math.min(fz(c, l1, {size:s0, weight:300}, 84), fz(c, l2, {size:s0, weight:300, italic:true}, 84));
  if(a > .01){
    v3Text(c, l1, x, y + s*.8, {size:s, color:o.c1 || INK, align:al, alpha:a, p:oQ(k3(t, t0, t0 + .9)), rise:2, shadow:o.shadow});
    v3Text(c, l2, x, y + s*1.95, {size:s, italic:true, color:o.c2 || OLI, align:al, alpha:a, p:oQ(k3(t, t0 + .3, t0 + 1.2)), rise:2, shadow:o.shadow});
    if(a > .5) reg("rubrik", al === "c" ? 8 : MX, y, 84, s*2.3, {head:1});
  }
  return y + s*2.3;
}
function headDuo(c, G, t, t0, y, l1, l2, o){
  o = o || {}; var s0 = o.size || (G.is9 ? 10 : 8.4), a = (o.a == null ? 1 : o.a)*rev(t, t0, .7), w1 = v3Measure(c, l1 + " ", {size:s0, weight:300}), w2 = v3Measure(c, l2, {size:s0, weight:300, italic:true});
  var s = w1 + w2 > 84 ? s0*84/(w1 + w2) : s0; w1 = v3Measure(c, l1 + " ", {size:s, weight:300});
  if(a > .01){
    v3Text(c, l1 + " ", MX, y + s*.8, {size:s, color:o.c1 || INK, alpha:a, p:oQ(k3(t, t0, t0 + .9)), rise:2});
    v3Text(c, l2, MX + w1, y + s*.8, {size:s, italic:true, color:o.c2 || OLI, alpha:a, p:oQ(k3(t, t0 + .3, t0 + 1.2)), rise:2});
    if(a > .5) reg("rubrik", MX, y, 84, s*1.15, {head:1});
  }
  return y + s*1.15;
}
function rrect(c, x, y, w, h, r, fill, a, shadow){
  if(a <= .02) return;
  c.save(); c.globalAlpha = a; if(shadow){ c.shadowColor = "rgba(0,0,0,.16)"; c.shadowBlur = shadow; c.shadowOffsetY = shadow*.25 }
  c.fillStyle = fill; rr(c, x, y, w, h, r); c.fill(); c.restore();
}
function tickC(c, x, y, r, p, col){ if(p <= 0) return; c.save(); c.strokeStyle = col || OLI; c.lineWidth = r*.26; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(x - r*.5, y); c.lineTo(x - r*.1, y + r*.42*Math.min(1, p*2)); if(p > .5) c.lineTo(x - r*.1 + r*.75*(p - .5)*2, y + r*.42 - r*.95*(p - .5)*2); c.stroke(); c.restore() }
function dot(c, x, y, r, col, a){ if(a <= .02) return; c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore() }
function thumb(c, key, x, y, w, h, a, r){
  if(a <= .02) return; c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 3; c.shadowOffsetY = .8; c.fillStyle = "#fff"; rr(c, x - .5, y - .5, w + 1, h + 1, (r || 1) + .3); c.fill(); c.restore();
  c.save(); c.globalAlpha = a; rr(c, x, y, w, h, r || 1); c.clip(); v3Photo(c, key, x, y, w, h, {scale:1.08, pos:V3_POS[key]}); c.restore();
}
function brandTag(c, G, t, S, col, a){ lab(c, "VIEWLY", MX, S.y0 + 2.6, rev(t, .1, .6)*(a == null ? 1 : a), {size:2.3, color:col || INK, weight:600, sp:.34}) }

/* små bilder för tjänsterna (ritade, inga riktiga leveranser) */
function mini(c, kind, x, y, s, a){
  if(a <= .02) return;
  c.save(); c.globalAlpha = a; rr(c, x, y, s, s, 1); c.clip();
  var i;
  if(kind === "foto"){ v3Photo(c, P.chair, x, y, s, s, {scale:1.6, pos:[.4, .55]}) }
  else if(kind === "dusk"){
    v3Photo(c, P.dining, x, y, s, s, {scale:1.5, pos:[.5, .6]});
    c.globalCompositeOperation = "multiply"; c.fillStyle = "rgb(112,130,190)"; c.fillRect(x, y, s, s); c.globalCompositeOperation = "source-over";
    var g = c.createRadialGradient(x + s*.72, y + s*.32, 0, x + s*.72, y + s*.32, s*.55); g.addColorStop(0, "rgba(255,176,96,.8)"); g.addColorStop(1, "rgba(255,176,96,0)"); c.fillStyle = g; c.fillRect(x, y, s, s);
  }
  else if(kind === "film"){
    v3Photo(c, P.kitchen, x, y, s, s, {scale:1.4, pos:[.6, .45]}); c.fillStyle = "rgba(0,0,0,.3)"; c.fillRect(x, y, s, s);
    c.fillStyle = "rgba(255,255,255,.92)"; c.beginPath(); c.arc(x + s/2, y + s/2, s*.27, 0, 7); c.fill();
    c.fillStyle = "#1c1c1e"; c.beginPath(); c.moveTo(x + s*.45, y + s*.38); c.lineTo(x + s*.45, y + s*.62); c.lineTo(x + s*.63, y + s*.5); c.closePath(); c.fill();
  }
  else if(kind === "p2"){
    c.fillStyle = "#f4f1ec"; c.fillRect(x, y, s, s); c.strokeStyle = "#1c1c1e"; c.lineWidth = s*.035; c.lineJoin = "miter";
    c.strokeRect(x + s*.12, y + s*.14, s*.76, s*.72);
    c.beginPath(); c.moveTo(x + s*.48, y + s*.14); c.lineTo(x + s*.48, y + s*.55); c.moveTo(x + s*.12, y + s*.55); c.lineTo(x + s*.7, y + s*.55); c.moveTo(x + s*.7, y + s*.55); c.lineTo(x + s*.7, y + s*.86); c.stroke();
    c.lineWidth = s*.02; c.beginPath(); c.arc(x + s*.48, y + s*.55, s*.1, Math.PI*1.5, Math.PI*2); c.stroke();
  }
  else if(kind === "p3"){
    c.fillStyle = "#eeeae4"; c.fillRect(x, y, s, s);
    var cx = x + s/2, bx = function(px, py, w, h, col1, col2, col3){
      c.fillStyle = col1; c.beginPath(); c.moveTo(px, py); c.lineTo(px + w, py + w*.5); c.lineTo(px, py + w); c.lineTo(px - w, py + w*.5); c.closePath(); c.fill();
      c.fillStyle = col2; c.beginPath(); c.moveTo(px - w, py + w*.5); c.lineTo(px, py + w); c.lineTo(px, py + w + h); c.lineTo(px - w, py + w*.5 + h); c.closePath(); c.fill();
      c.fillStyle = col3; c.beginPath(); c.moveTo(px + w, py + w*.5); c.lineTo(px, py + w); c.lineTo(px, py + w + h); c.lineTo(px + w, py + w*.5 + h); c.closePath(); c.fill() };
    bx(cx, y + s*.2, s*.34, s*.14, "#d9d2c6", "#b9b1a4", "#cbc3b6"); bx(cx - s*.1, y + s*.14, s*.16, s*.1, "#efe9de", "#cfc7ba", "#e0d9cc");
  }
  else if(kind === "sun"){
    c.fillStyle = "#2f3d36"; c.fillRect(x, y, s, s); c.fillStyle = "#4a5a48"; c.fillRect(x + s*.1, y + s*.55, s*.3, s*.3); c.fillStyle = "#6b6a58"; c.fillRect(x + s*.55, y + s*.62, s*.32, s*.24); c.fillStyle = "#57654f"; c.fillRect(x + s*.5, y + s*.18, s*.4, s*.2);
    c.strokeStyle = "#ffdca2"; c.lineWidth = s*.04; c.beginPath(); c.arc(x + s/2, y + s*.95, s*.7, Math.PI*1.12, Math.PI*1.88); c.stroke();
    c.fillStyle = "#ffb347"; c.beginPath(); c.arc(x + s*.72, y + s*.31, s*.1, 0, 7); c.fill();
  }
  else if(kind === "map"){
    c.fillStyle = "#e9e5dc"; c.fillRect(x, y, s, s); c.fillStyle = "#bcd3df"; c.beginPath(); c.moveTo(x, y + s*.62); c.quadraticCurveTo(x + s*.5, y + s*.4, x + s, y + s*.7); c.lineTo(x + s, y + s); c.lineTo(x, y + s); c.closePath(); c.fill();
    c.strokeStyle = "#fff"; c.lineWidth = s*.06; c.beginPath(); c.moveTo(x + s*.2, y); c.lineTo(x + s*.35, y + s*.6); c.moveTo(x, y + s*.28); c.lineTo(x + s, y + s*.36); c.stroke();
    c.fillStyle = "#1c1c1e"; c.beginPath(); c.arc(x + s*.62, y + s*.3, s*.1, 0, 7); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(x + s*.62, y + s*.3, s*.035, 0, 7); c.fill();
  }
  else if(kind === "area"){ v3Photo(c, P.statue, x, y, s, s, {scale:1.5, pos:[.5, .55]}) }
  c.restore();
}

/* =====================================================================
   1 · BOSTADSFOTO. OCH LITE TILL.   (mörk, fotografisk, kännedom)
   ===================================================================== */
var L1 = 12.0;
var SERV = [["Fotografering", "foto"], ["Digital skymningsbild", "dusk"], ["Bostadsfilm", "film"], ["Planritning 2D och 3D", "p2"], ["Solbana via satellit", "sun"], ["Områdeskarta", "map"], ["Områdesbilder", "area"]];
function adNy(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Fill(c, 0, 0, 100, H, DARK);
  var a2 = rev(t, 3.1, .8);
  v3Photo(c, P.bed, 0, 0, 100, H, {scale:lerp(1.05, 1.16, k3(t, 0, 5)), pos:V3_POS.bedroom, alpha:ioC(k3(t, 0, .6))});
  if(a2 > 0) v3Photo(c, P.chair, 0, 0, 100, H, {scale:lerp(1.05, 1.14, k3(t, 3.1, 8)), pos:V3_POS.rs_chair, alpha:a2});
  var hold = rev(t, 5.5, .8);
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", .28 + .10*a2 + .36*hold);
  v3Grad(c, 0, 0, 100, H*.3, [[0, "rgba(8,7,7,.55)"], [1, "rgba(8,7,7,0)"]]);
  v3Frame(c, 4, 4, 92, H - 8, "#fff", .26, oQ(k3(t, .2, 1.8)), .5);
  lab(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, S.y0 + 2.6, rev(t, .4, .8)*.92, {size:2.1, color:"#fff", align:"c", weight:500, sp:.3});
  reg("etikett", 10, S.y0, 80, 3.8);
  /* öppningen */
  var sH = G.is9 ? 15 : 12, cy = S.y0 + S.h*.46, out = 1 - rev(t, 4.9, .5), l1 = T("a8.ny.l1"), l2 = T("a8.ny.l2");
  var sf = Math.min(fz(c, l1, {size:sH, weight:300}, 84), fz(c, l2, {size:sH, weight:300, italic:true}, 84));
  v3Text(c, l1, 50, cy, {size:sf, color:"#fff", align:"c", alpha:out, p:oQ(k3(t, .8, 2.1)), rise:2, shadow:true});
  v3Text(c, l2, 50, cy + sf*1.18, {size:sf, italic:true, color:C3.cream, align:"c", alpha:out*rev(t, 3.3, .6), p:oQ(k3(t, 3.3, 4.6)), rise:2, shadow:true});
  if(out > .5 && t > 1.5) reg("rubrik", 8, cy - sf*.85, 84, sf*2.3, {head:1});
  /* "lite till": det som ingår */
  var top = S.y0 + (G.is9 ? 12.4 : 11), rowH = clamp((S.y1 - top - (G.is9 ? 15 : 13))/SERV.length, 6.2, 11.5), ts = rowH*.68, th = rowH*.86, la = rev(t, 5.8, .5);
  lab(c, T("a8.ny.lab"), MX, S.y0 + 9, la*.92, {size:2.1, color:"#fff", weight:500, sp:.3, shadow:true}); if(la > .5) reg("etikett2", MX, S.y0 + 6.4, 60, 3.6);
  for(i = 0; i < SERV.length; i++){
    var s0 = 6.2 + i*.42, a = rev(t, s0, .45), y = top + i*rowH;
    if(a <= .02) continue;
    v3Line(c, MX, 100 - MX, y, "rgba(255,255,255,.45)", .16, ioC(k3(t, s0 - .05, s0 + .5)), a);
    v3Text(c, SERV[i][0], MX, y + rowH*.5 + ts*.34, {size:Math.min(ts, fz(c, SERV[i][0], {size:ts, weight:300}, 84 - th - 6)), color:"#fff", alpha:a, p:oQ(k3(t, s0, s0 + .8)), rise:1.6, shadow:true});
    mini(c, SERV[i][1], 100 - MX - th, y + (rowH - th)/2, th, a);
    if(a > .5) reg("rad", MX, y + .3, 84, rowH - .6);
  }
  var fy = top + SERV.length*rowH + (G.is9 ? 9 : 8), f = T("a8.ny.f"), fs = Math.min(G.is9 ? 8.4 : 7, fz(c, f, {size:G.is9 ? 8.4 : 7, italic:true, weight:300}, 84)), fa = rev(t, 9.9, .8);
  v3Text(c, f, MX, fy, {size:fs, italic:true, color:C3.cream, alpha:fa, p:oQ(k3(t, 9.9, 10.9)), rise:2, shadow:true});
  if(fa > .5) reg("slutrad", MX, fy - fs*.8, 84, fs*1.1);
}
function sndNy(H){ H.s("shutter", .25, .5); H.s("shutter2", 3.15, .45); SERV.forEach(function(s, i){ H.s("tick1", 6.2 + i*.42, .14) }); H.s("thunk", 10.0, .45) }

/* =====================================================================
   2 · BOKA EN FOTOGRAFERING   (ljus, tid: texten och inläggen följer med)
   ===================================================================== */
var L2 = 10.2;
var TYPED = ["Trivsam 4:a med stor altan", "i charmiga Centrum."];
function adTid(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Grad(c, 0, 0, 100, H, [[0, "#2f362f"], [1, "#171a17"]]);
  brandTag(c, G, t, S, "#fff");
  var hb = head2(c, G, t, .3, S.y0 + 5.5, T("a8.ti.l1"), T("a8.ti.l2"), {size:G.is9 ? 8.4 : 8.2, c1:"#fff", c2:C3.olil});
  /* bokningen */
  var by = hb + 3, bh = G.is9 ? 12.6 : 12, ba = rev(t, 1.3, .6), sc = lerp(.96, 1, oQ(k3(t, 1.3, 2.1)));
  if(ba > .02){
    c.save(); c.translate(50, by + bh/2); c.scale(sc, sc); c.translate(-50, -by - bh/2);
    rrect(c, MX, by, 84, bh, 2.2, "#fff", ba, 6);
    lab(c, "BOKNING", MX + 4, by + 4.2, ba, {size:1.9, color:OLI});
    v3Text(c, "Storgatan 13", MX + 4, by + bh - 3.2, {size:Math.min(6, bh*.42), color:INK, alpha:ba, p:oQ(k3(t, 1.5, 2.3))});
    v3Text(c, "Landskrona · 4 rum · 112 m²", 100 - MX - 4, by + bh - 3.6, {size:2.7, weight:500, f:"sans", color:MUT, align:"r", alpha:ba*rev(t, 1.9, .5)});
    tickC(c, 100 - MX - 5, by + 4, 2.2, k3(t, 2.3, 2.7), OLI);
    c.restore(); if(ba > .5) reg("bokning", MX, by, 84, bh);
  }
  /* pil: uppgifterna följer med */
  var ar = rev(t, 2.5, .5), oy0 = by + bh + 5.4;
  if(ar > .02){ c.save(); c.globalAlpha = ar; c.strokeStyle = OLI; c.lineWidth = .35; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(50, by + bh + 1); c.lineTo(50, by + bh + 4.6); c.moveTo(48.2, by + bh + 3); c.lineTo(50, by + bh + 4.8); c.lineTo(51.8, by + bh + 3); c.stroke(); c.restore() }
  var gap = 2, oh = clamp((S.y1 - oy0 - 2*gap)/3, 11, 20), tt = Math.min(5, oh*.36);
  var starts = [3.0, 4.6, 6.2], titles = ["Bilder", "Annonstext", "Inlägg"];
  for(i = 0; i < 3; i++){
    var s0 = starts[i], a = rev(t, s0, .6), y = oy0 + i*(oh + gap), x0 = MX + 4, sc2 = lerp(.97, 1, oQ(k3(t, s0, s0 + .8)));
    if(a <= .02) continue;
    c.save(); c.translate(50, y + oh/2); c.scale(sc2, sc2); c.translate(-50, -y - oh/2);
    rrect(c, MX, y, 84, oh, 2.2, "#fff", a, 6);
    v3Text(c, titles[i], x0, y + oh*.5 + tt*.15, {size:tt, color:INK, alpha:a, p:oQ(k3(t, s0, s0 + .8))});
    lab(c, "AUTOMATISKT", x0, y + oh*.5 + tt*.15 + 3.9, a*rev(t, s0 + .4, .5), {size:1.7, color:OLI});
    var rx = MX + 38, rw = 84 - 38 - 10;
    if(i === 0){
      var n = 4, tw = Math.min(11.4, (rw - (n - 1)*1.6)/n), thh = Math.min(oh - 5, tw*1.1), ks = [P.chair, P.dining, P.kitchen, P.floor];
      for(var j = 0; j < n; j++) thumb(c, ks[j], rx + j*(tw + 1.6), y + (oh - thh)/2, tw, thh, a*rev(t, s0 + .35 + j*.22, .4), .8);
    } else if(i === 1){
      for(var l = 0; l < 2; l++){
        var ps = clamp(k3(t, s0 + .5 + l*.7, s0 + 1.3 + l*.7), 0, 1);
        v3Text(c, TYPED[l], rx, y + oh*.5 + (l - .5)*4.4 + 1, {size:2.9, color:INK, alpha:a*(ps > 0 ? 1 : 0), p:ps});
      }
    } else {
      var pw = Math.min(8.6, (oh - 4)/1.25), phh = pw*1.25, sty = [["badge", "kommande", P.dining], ["overlay", "tillsalu", P.chair], ["editorial", "sald", P.bed]];
      for(var m = 0; m < 3; m++){
        var pa = a*rev(t, s0 + .35 + m*.25, .4); if(pa <= .02) continue;
        c.save(); c.globalAlpha = pa; v3Post(c, sty[m][0], sty[m][1], sty[m][2], rx + m*(pw + 2), y + (oh - phh)/2, pw, 1.25, 1); c.restore();
      }
    }
    tickC(c, 100 - MX - 5, y + oh/2, 2.4, k3(t, s0 + 1.6, s0 + 2.0), OLI);
    c.restore();
    if(a > .5) reg("kort", MX, y, 84, oh);
  }
}
function sndTid(H){ H.s("tick1", 1.45, .16); H.s("tick1", 3.0, .18); H.s("shutter", 3.4, .4); H.s("tick1", 4.6, .18); [0, 1].forEach(function(l){ H.s("tick1", 5.1 + l*.7, .1) }); H.s("tick1", 6.2, .18); H.s("thunk", 6.7, .4) }

/* =====================================================================
   3 · ETT OBJEKT. FYRA INLÄGG.   (ljus, resultat: närvaro utan extra jobb)
   ===================================================================== */
var L3 = 9.4, PH3 = [["badge", "kommande", "KOMMANDE", P.dining], ["overlay", "tillsalu", "TILL SALU", P.chair], ["badge", "visning", "VISNING", P.kitchen], ["editorial", "sald", "SÅLD", P.bed]];
function adFaser(c, G, t){
  var H = G.H, S = SG(G), i;
  v3DarkBg(c, G, 1, t);
  brandTag(c, G, t, S, "#fff");
  var hb = headDuo(c, G, t, .3, S.y0 + 5.5, T("a8.fa.l1"), T("a8.fa.l2"), {size:G.is9 ? 10.4 : 8.8, c1:"#fff", c2:C3.olil});
  var f = T("a8.fa.f"), fs = 3.9, fa = rev(t, 1.2, .7);
  v3Text(c, f, MX, hb + 4.6, {size:Math.min(fs, fz(c, f, {size:fs, italic:true, weight:400}, 84)), italic:true, weight:400, color:"#d9dccf", alpha:fa, p:oQ(k3(t, 1.2, 2.2))});
  if(fa > .5) reg("rad", MX, hb + 1.4, 84, 4.6);
  var cy0 = hb + 8.4, chipY = S.y1 - 1, ch = chipY - 7 - cy0, cw = Math.min(41, ch/1.25), cardH = cw*1.25, cyy = cy0 + (ch - cardH)/2, gp = 84 - 2*cw;
  /* karusell: två inlägg syns, och tredje och fjärde panoreras in */
  var pan = ioC(k3(t, 4.7, 5.6)) + ioC(k3(t, 6.4, 7.3)), shown = [rev(t, 1.9, .6), rev(t, 3.3, .6), rev(t, 4.9, .6), rev(t, 6.6, .6)], any = false;
  c.save(); c.beginPath(); c.rect(MX - .5, cyy - 4, 85, cardH + 8); c.clip();
  for(i = 0; i < 4; i++){
    var a = shown[i]; if(a <= .02) continue; any = true;
    var x = MX + i*(cw + gp) - pan*(cw + gp), rise = (1 - oQ(k3(t, [1.9, 3.3, 4.9, 6.6][i], [1.9, 3.3, 4.9, 6.6][i] + .9)))*6, sc = lerp(.95, 1, oQ(k3(t, [1.9, 3.3, 4.9, 6.6][i], [1.9, 3.3, 4.9, 6.6][i] + .9)));
    if(x + cw < MX - 1 || x > 100 - MX + 1) continue;
    c.save(); c.globalAlpha = a; c.translate(x + cw/2, cyy + rise + cardH/2); c.scale(sc, sc); c.translate(-x - cw/2, -cyy - rise - cardH/2);
    c.shadowColor = "rgba(0,0,0,.28)"; c.shadowBlur = 6; c.shadowOffsetY = 1.4; c.fillStyle = "#000"; rr(c, x, cyy + rise, cw, cardH, 1.2); c.fill(); c.shadowColor = "transparent";
    v3Post(c, PH3[i][0], PH3[i][1], PH3[i][3], x, cyy + rise, cw, 1.25, 1); c.restore();
  }
  c.restore();
  if(any) reg("inlagg", MX, cyy, 84, cardH);
  for(i = 0; i < 4; i++){
    var on = rev(t, [1.9, 3.3, 4.9, 6.6][i] + .3, .4), cx = MX + 10.5 + i*21, nxt = i < 3 ? rev(t, [1.9, 3.3, 4.9, 6.6][i + 1] + .3, .4) : 0, act = on*(1 - nxt*0);
    lab(c, PH3[i][2], cx, chipY, rev(t, 1.2, .6), {size:2.1, align:"c", color:act > .5 ? "#fff" : "rgba(255,255,255,.5)", weight:act > .5 ? 700 : 600});
    if(act > .02) v3Line(c, cx - 8, cx + 8, chipY + 1.6, "#fff", .3, act, 1);
    reg("kapsel", cx - 10, chipY - 2.8, 20, 4.8);
  }
}
function sndFaser(H){ [1.9, 3.3, 4.9, 6.6].forEach(function(s){ H.s("thunk", s + .1, .4) }); H.s("tick1", 1.3, .14) }

/* =====================================================================
   4 · FEM LEVERANTÖRER. ELLER EN.   (ljus, enkelhet: ett ställe, en bokning)
   ===================================================================== */
var L4 = 10.4, ET = ["Fotografering", "Bostadsfilm", "Planritning", "Annonstext", "Inlägg"];
function adEtt(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Fill(c, 0, 0, 100, H, PAPER);
  brandTag(c, G, t, S, INK);
  var hs = G.is9 ? 10.4 : 8.8, aOut = 1 - rev(t, 3.1, .45), y0h = S.y0 + 5.5;
  var hbA = headDuo(c, G, t, .3, y0h, T("a8.et.a1"), "", {size:hs, a:aOut});
  var hbB = headDuo(c, G, t, 3.8, y0h, T("a8.et.b1"), T("a8.et.b2"), {size:hs});
  var yS = y0h + hs*1.15 + 4.4, availH = S.y1 - yS, rowH = clamp((availH - 11 - 1.6*4 - 2.4)/5, 6, 10.5), cardH = 11 + 5*rowH + 1.6*4 + 2.4, cardY = yS + (availH - cardH)/2;
  /* kortet som blir en bokning */
  var ca = rev(t, 3.6, .8);
  if(ca > .02){
    rrect(c, MX, cardY, 84, cardH, 2.6, "#fff", ca, 7);
    var hd = rev(t, 5.2, .5); if(hd > .02){ c.save(); c.globalAlpha = hd; v3Lock(c, 0, cardY + 5.6, 2.6, INK, OLI, {left:MX + 4, alpha:hd}); c.restore() }
    lab(c, "EN BOKNING", 100 - MX - 4, cardY + 6.2, hd, {size:1.9, color:OLI, align:"r"});
    v3Line(c, MX + 4, 100 - MX - 4, cardY + 9.6, "rgba(28,28,30,.14)", .16, 1, ca);
    if(ca > .5) reg("kort", MX, cardY, 84, cardH);
  }
  /* de fem rutorna: spridda → rader i kortet */
  var sc0 = [[8, 0, -2.2], [50, 1, 1.8], [12, 2, 1.4], [48, 3, -1.8], [24, 4, 2]], cwi, chh;
  for(i = 0; i < 5; i++){
    var a = rev(t, .8 + i*.26, .5), m0 = 3.6 + i*.12, mv = ioC(k3(t, m0, m0 + 1.0)); if(a <= .02) continue;
    var slot = (cardY - yS > 0 ? 0 : 0) + availH/5, sx = sc0[i][0], sy = yS + i*Math.min(slot, availH/5.2), cw0 = 38, ch0 = Math.min(10, slot*.78);
    var fx = MX + 4, fy = cardY + 11 + i*(rowH + 1.6) + .2, x = lerp(sx, fx, mv), y = lerp(sy, fy, mv), rot = lerp(sc0[i][2], 0, mv)*Math.PI/180, cw = lerp(cw0, 76, mv), chh2 = lerp(ch0, rowH - .4, mv);
    c.save(); c.translate(x + cw/2, y + chh2/2); c.rotate(rot); c.translate(-cw/2, -chh2/2);
    if(mv < .98){ c.globalAlpha = a*(1 - mv); c.shadowColor = "rgba(0,0,0,.14)"; c.shadowBlur = 3; c.shadowOffsetY = .8; c.fillStyle = "#e1dcd5"; rr(c, 0, 0, cw, chh2, 1.8); c.fill(); c.shadowColor = "transparent" }
    c.restore();
    v3Text(c, ET[i], x + (cw > 50 ? 3 : 4), y + chh2/2 + 1.5, {size:Math.min(4.6, chh2*.5), color:INK, alpha:a, weight:400});
    if(mv > .9){ var tp = k3(t, 5.0 + i*.22, 5.4 + i*.22); tickC(c, 100 - MX - 8, y + chh2/2, 2.4, tp, OLI); v3Line(c, MX + 4, 100 - MX - 4, y + chh2 + .8, "rgba(28,28,30,.10)", .14, 1, a) }
    if(a > .5 && mv < .02) reg("ruta" + i, sx, sy, cw0, ch0); else if(mv > .98) reg("rad" + i, MX + 4, fy, 76, rowH - .4);
  }
}
function sndEtt(H){ for(var i = 0; i < 5; i++) H.s("tick1", .8 + i*.26, .12); H.s("thunk", 4.3, .45); for(var j = 0; j < 5; j++) H.s("tick1", 5.0 + j*.22, .13) }

/* =====================================================================
   5 · SKÅNE   (foto + ett inlägg i tre kontors utseende, uppgifterna följer med)
   ===================================================================== */
var L5 = 13.6, CITIES = ["Malmö", "Lund", "Landskrona", "Helsingborg"];
var ORANGE = "#F2681C", GREEN = "#1F4B39", DATA = {addr:"Storgatan 13", city:"Landskrona", facts:"4 rum · 112 m²", agent:"Anna Lindqvist"};
/* tre mallar: orange band, grön med foto, editorial. Egna nyanser, inga namn eller märken. */
function tpl(c, kind, x, y, w, prog, ph){
  var h = w*1.25, f = function(a, b){ return k3(prog, a, b) }, u = w/100;
  c.save(); rr(c, x, y, w, h, w*.025); c.clip();
  if(kind === "o"){
    v3Photo(c, P.chair, x, y, w, h, {scale:1.12, pos:[.45, .5]});
    v3Grad(c, x, y, w, h*.3, [[0, "rgba(0,0,0,.35)"], [1, "rgba(0,0,0,0)"]]);
    var by = y + h*.64; v3Fill(c, x, by, w, h - h*.64, ORANGE);
    v3Fill(c, x, by, w*.34, h*.05, "#fff", .22);
    v3Text(c, "TILL SALU", x + w*.07, by + h*.1, {size:w*.05, weight:700, f:"sans", sp:.22, color:"#fff", alpha:f(0, .2), p:f(0, .25)});
    v3Text(c, DATA.addr, x + w*.07, by + h*.2, {size:w*.095, weight:600, f:"sans", color:"#fff", alpha:f(.1, .35), p:f(.1, .4)});
    v3Text(c, DATA.city.toUpperCase() + "  ·  " + DATA.facts.toUpperCase(), x + w*.07, by + h*.268, {size:w*.036, weight:500, f:"sans", sp:.14, color:"#fff", alpha:f(.35, .6), p:f(.35, .65)});
    v3Text(c, DATA.agent, x + w*.07, by + h*.328, {size:w*.04, weight:500, f:"sans", color:"rgba(255,255,255,.92)", alpha:f(.6, .85), p:f(.6, .9)});
  } else if(kind === "g"){
    v3Fill(c, x, y, w, h, GREEN);
    rr(c, x + w*.06, y + w*.06, w*.88, h*.58, w*.02); c.save(); c.clip(); v3Photo(c, P.dining, x + w*.06, y + w*.06, w*.88, h*.58, {scale:1.12, pos:[.5, .55]}); c.restore();
    c.save(); c.globalAlpha = f(0, .2); c.fillStyle = "#F3EFE7"; rr(c, x + w*.1, y + h*.58 - w*.02, w*.26, w*.075, w*.037); c.fill(); c.restore();
    v3Text(c, "Till salu", x + w*.23, y + h*.58 + w*.032, {size:w*.04, weight:600, f:"sans", color:GREEN, align:"c", alpha:f(0, .2)});
    v3Text(c, DATA.addr, x + w*.06, y + h*.82, {size:w*.105, color:"#F3EFE7", alpha:f(.1, .35), p:f(.1, .4)});
    v3Text(c, DATA.city + "  ·  " + DATA.facts, x + w*.06, y + h*.882, {size:w*.04, weight:500, f:"sans", color:"rgba(243,239,231,.85)", alpha:f(.35, .6), p:f(.35, .65)});
    v3Text(c, DATA.agent, x + w*.06, y + h*.935, {size:w*.04, italic:true, color:"rgba(243,239,231,.78)", alpha:f(.6, .85), p:f(.6, .9)});
  } else {
    v3Fill(c, x, y, w, h, "#F4F0E8");
    v3Text(c, "TILL SALU", x + w*.07, y + h*.07, {size:w*.032, weight:600, f:"sans", sp:.3, color:"#1c1c1e", alpha:f(0, .2), p:f(0, .25)});
    v3Text(c, DATA.city.toUpperCase(), x + w*.93, y + h*.07, {size:w*.032, weight:500, f:"sans", sp:.3, color:"#5f5a55", align:"r", alpha:f(.3, .55)});
    v3Fill(c, x + w*.07, y + h*.09, w*.86, .2, "#1c1c1e", .5);
    rr(c, x + w*.07, y + h*.12, w*.86, h*.52, 0); c.save(); c.clip(); v3Photo(c, P.kitchen, x + w*.07, y + h*.12, w*.86, h*.52, {scale:1.15, pos:[.6, .45]}); c.restore();
    v3Text(c, DATA.addr, x + w*.07, y + h*.78, {size:w*.115, italic:true, color:"#1c1c1e", alpha:f(.1, .35), p:f(.1, .4)});
    v3Fill(c, x + w*.07, y + h*.82, w*.86, .2, "#1c1c1e", .5);
    v3Text(c, DATA.facts.toUpperCase(), x + w*.07, y + h*.89, {size:w*.032, weight:600, f:"sans", sp:.22, color:"#1c1c1e", alpha:f(.35, .6), p:f(.35, .65)});
    v3Text(c, DATA.agent, x + w*.07, y + h*.945, {size:w*.042, italic:true, color:"#5f5a55", alpha:f(.6, .85), p:f(.6, .9)});
  }
  c.restore();
}
/* var uppgifterna sitter i varje mall (för de små prickarna som flyger in) */
function tplAnch(kind, x, y, w){
  var h = w*1.25;
  if(kind === "o") return [[x + w*.2, y + h*.64 + h*.2], [x + w*.3, y + h*.64 + h*.268], [x + w*.2, y + h*.64 + h*.328]];
  if(kind === "g") return [[x + w*.2, y + h*.82], [x + w*.3, y + h*.882], [x + w*.2, y + h*.935]];
  return [[x + w*.2, y + h*.78], [x + w*.3, y + h*.89], [x + w*.2, y + h*.945]];
}
var KINDS = ["o", "g", "e"], TS5 = [7.4, 9.6, 11.6];
function adSkane(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Fill(c, 0, 0, 100, H, DARK);
  var bg = [P.chair, P.dining, P.kitchen, P.bed], step = 1.1, k = Math.min(3, Math.floor(Math.max(0, t - .3)/step)), a;
  for(i = 0; i < 4; i++){
    a = i < k ? 0 : i === k ? rev(t, .3 + i*step, .3) : 0; if(i === k && k > 0) a = 1; if(i === 0) a = Math.max(a, ioC(k3(t, 0, .6)));
    if(a > 0) v3Photo(c, bg[i], 0, 0, 100, H, {scale:lerp(1.06, 1.16, k3(t, .3 + i*step, 7)), pos:V3_POS[bg[i]], alpha:a});
  }
  var dim = rev(t, 4.6, .8);
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", .30 + .46*dim);
  v3Grad(c, 0, 0, 100, H*.28, [[0, "rgba(8,7,7,.5)"], [1, "rgba(8,7,7,0)"]]);
  /* orterna */
  var sC = G.is9 ? 15 : 12, cy = S.y0 + S.h*.42, gone = rev(t, 4.5, .4);
  lab(c, T("a8.sk.l"), 50, cy - sC*1.0, rev(t, .3, .7)*.92*(1 - gone), {size:2.1, color:"#fff", align:"c", weight:500, sp:.3, shadow:true});
  CITIES.forEach(function(ci, j){
    var s0 = .3 + j*step, va = rev(t, s0, .3)*(j < 3 ? 1 - rev(t, s0 + step - .3, .3) : 1 - gone);
    if(va > 0) v3Text(c, ci, 50, cy, {size:Math.min(sC, fz(c, ci, {size:sC, weight:300}, 84)), color:"#fff", align:"c", alpha:va, p:oQ(k3(t, s0, s0 + .6)), rise:2, shadow:true});
  });
  if(t > 1 && t < 4.4) reg("stad", 8, cy - sC*.85, 84, sC*1.1, {head:1});
  /* rubriken */
  var hOut = 1 - rev(t, 6.3, .45), hs = G.is9 ? 11 : 9, h1 = T("a8.sk.h1"), h2 = T("a8.sk.h2"), hy = S.y0 + S.h*.36;
  var ss = Math.min(fz(c, h1, {size:hs, weight:300}, 84), fz(c, h2, {size:hs, weight:300, italic:true}, 84));
  var ha = rev(t, 4.9, .7)*hOut;
  if(ha > .02){
    v3Text(c, h1, 50, hy + ss*.8, {size:ss, color:"#fff", align:"c", alpha:ha, p:oQ(k3(t, 4.9, 5.9)), rise:2, shadow:true});
    v3Text(c, h2, 50, hy + ss*1.95, {size:ss, italic:true, color:C3.cream, align:"c", alpha:ha*rev(t, 5.3, .6), p:oQ(k3(t, 5.3, 6.3)), rise:2, shadow:true});
    if(ha > .5) reg("rubrik", 8, hy, 84, ss*2.3, {head:1});
  }
  /* bokningen och ett inlägg som byter mall */
  var ba = rev(t, 6.8, .6);
  if(ba > .02){
    var sy = S.y0 + 5.4, sh = G.is9 ? 12 : 11.4;
    lab(c, T("a8.sk.cap"), 50, S.y0 + 2.6, ba*.92, {size:1.9, color:"#e9eadf", align:"c", weight:500, sp:.22, shadow:true}); reg("rad", 6, S.y0, 88, 4);
    c.save(); c.translate(50, sy + sh/2); var sc = lerp(.96, 1, oQ(k3(t, 6.8, 7.6))); c.scale(sc, sc); c.translate(-50, -sy - sh/2);
    rrect(c, MX, sy, 84, sh, 2.2, "#fff", ba, 6);
    lab(c, "BOKNING", MX + 4, sy + 4.2, ba, {size:1.8, color:OLI});
    v3Text(c, DATA.addr, MX + 4, sy + sh - 3, {size:Math.min(5.6, sh*.44), color:INK, alpha:ba, p:oQ(k3(t, 7.0, 7.8))});
    v3Text(c, DATA.city + " · " + DATA.facts, 100 - MX - 4, sy + sh - 3.4, {size:2.6, weight:500, f:"sans", color:MUT, align:"r", alpha:ba*rev(t, 7.3, .5)});
    c.restore(); if(ba > .5) reg("bokning", MX, sy, 84, sh);
    var pY = sy + sh + 3.4, pw = Math.min(G.is9 ? 50 : 52, (S.y1 - 3.5 - pY)/1.25), pxx = 50 - pw/2, ph = pw*1.25;
    var kk = t < TS5[1] ? 0 : t < TS5[2] ? 1 : 2, pa = rev(t, 7.3, .7), psc = lerp(.95, 1, oQ(k3(t, 7.3, 8.3)));
    if(pa > .02){
      c.save(); c.globalAlpha = pa; c.translate(50, pY + ph/2); c.scale(psc, psc); c.translate(-50, -pY - ph/2);
      c.shadowColor = "rgba(0,0,0,.4)"; c.shadowBlur = 7; c.shadowOffsetY = 1.6; c.fillStyle = "#000"; rr(c, pxx, pY, pw, ph, pw*.025); c.fill(); c.shadowColor = "transparent";
      var wk = kk > 0 ? ioC(k3(t, TS5[kk], TS5[kk] + .8)) : 1;
      for(i = wk < .999 ? Math.max(0, kk - 1) : kk; i <= kk; i++){
        var wp = i === 0 ? 1 : ioC(k3(t, TS5[i], TS5[i] + .8)), prog = k3(t, TS5[i] + (i === 0 ? .2 : .5), TS5[i] + (i === 0 ? 1.6 : 1.9));
        if(i === kk && i > 0){ c.save(); c.beginPath(); c.rect(pxx, pY, pw*wp, ph); c.clip(); tpl(c, KINDS[i], pxx, pY, pw, prog); c.restore(); if(wp < 1) v3Fill(c, pxx + pw*wp - .2, pY, .4, ph, "#fff", .7) }
        else tpl(c, KINDS[i], pxx, pY, pw, i < kk ? 1 : prog);
      }
      c.restore(); if(pa > .5) reg("inlagg", pxx, pY, pw, ph);
      /* uppgifterna flyger från bokningen in i mallen */
      for(i = 0; i < 3; i++){
        for(var d = 0; d < 3; d++){
          var d0 = TS5[i] + .15 + d*.16, dp = k3(t, d0, d0 + .7); if(dp <= 0 || dp >= 1) continue;
          var an = tplAnch(KINDS[i], pxx, pY, pw)[d], e = ioC(dp), sx2 = 22 + d*28, sy2 = sy + sh - 3, xx = lerp(sx2, an[0], e), yy = lerp(sy2, an[1], e) - Math.sin(e*Math.PI)*3;
          dot(c, xx, yy, .95, OLI, Math.sin(dp*Math.PI)*.95);
        }
      }
    }
    /* sidindikator */
    var pk = rev(t, 8.0, .5);
    for(i = 0; i < 3; i++) dot(c, 50 + (i - 1)*3.4, pY + ph + 3.2, i === kk ? .95 : .6, i === kk ? "#fff" : "rgba(255,255,255,.5)", pk);
  }
}
function sndSkane(H){ [0, 1, 2, 3].forEach(function(i){ H.s(i % 2 ? "shutter2" : "shutter", .35 + i*1.1, .45) }); H.s("tick1", 7.0, .16); H.s("thunk", 7.5, .4); TS5.forEach(function(s, i){ for(var d = 0; d < 3; d++) H.s("tick1", s + .3 + d*.16, .1); if(i > 0) H.s("thunk", s + .2, .35) }) }

/* ---------- komponera ---------- */
var BOOK = {b:"a7.btnB"};
window.V3_ADS8 = [];
function loadAudio8(){ return v3SfxLoad() }
function reg8(id, n, d, L, fn, thumb, sched){
  var comp = {n:n, d:d, group:"ads8", dur:L + END_L, thumb:thumb, id:id, v:{id:id}, L:L};
  comp.draw = function(c, G, t){ fn(c, G, t); if(t >= L) K.endSeq(c, G, t, L, BOOK) };
  comp.mix = K.makeMix(sched); comp.loadAudio = loadAudio8;
  V3_COMPS[id] = comp; V3_ADS8.push(id);
}
reg8("a8_ny", "1 · Bostadsfoto. Och lite till.", "Fotografering och allt som ingår i presentationen.", L1, adNy, 9.6, sndNy);
reg8("a8_tid", "2 · Boka en fotografering", "Texten och inläggen följer med: uppgifterna hämtas från bokningen.", L2, adTid, 9.0, sndTid);
reg8("a8_faser", "3 · Ett objekt. Fyra inlägg.", "Kommande, till salu, visning och såld, färdiga med bilderna.", L3, adFaser, 8.8, sndFaser);
reg8("a8_ett", "4 · Fem leverantörer. Eller en.", "Fem beställningar blir en bokning.", L4, adEtt, 8.8, sndEtt);
reg8("a8_skane", "5 · Din bostadsfotograf i Skåne", "Orterna, och ett inlägg som byter mall medan uppgifterna ligger kvar.", L5, adSkane, 12.4, sndSkane);

/* ---------- annonsplan ---------- */
var PLAN = [
  {t:"1 · Bostadsfoto. Och lite till.", syfte:"Kännedom. Ny aktör inom bostadsfotografering, och fotografering är kärnan. \"Lite till\" visar allt som ingår.", steg:"Överst i tratten. Kall målgrupp.", prim:"Bostadsfoto. Och lite till. Foto, skymningsbild, film, planritning, solbana och karta, i en bokning.", rub:"Ny aktör inom bostadsfotografering", cta:"Läs mer", mal:"Räckvidd, ThruPlay."},
  {t:"2 · Boka en fotografering", syfte:"Tid. Bokningen fyller i texten och inläggen, så de följer med leveransen.", steg:"Mitten. Visas efter annons 1.", prim:"Du bokar en fotografering. Annonstexten och inläggen hämtar uppgifterna från bokningen och följer med leveransen.", rub:"Texten och inläggen följer med", cta:"Boka nu", mal:"Klick, bokningar."},
  {t:"3 · Ett objekt. Fyra inlägg.", syfte:"Resultat. Ett jämnt flöde under hela försäljningen utan extra arbete.", steg:"Mitten.", prim:"Kommande, till salu, visning och såld. Fyra färdiga inlägg per objekt, med bilderna.", rub:"Fyra inlägg per objekt", cta:"Läs mer", mal:"Klick, delningar."},
  {t:"4 · Fem leverantörer. Eller en.", syfte:"Enkelhet och kostnad. Ett ställe och en bokning i stället för flera led.", steg:"Mitten till botten.", prim:"Foto, film, planritning, text och inlägg. Fem beställningar blir en bokning.", rub:"Ett ställe. En bokning.", cta:"Boka nu", mal:"Klick, bokningar."},
  {t:"5 · Din bostadsfotograf i Skåne", syfte:"Lokalt. Foto är kärnan, och inlägget byter mall medan uppgifterna ligger kvar.", steg:"Botten. Retargeting mot dem som sett minst hälften av en annons.", prim:"Din bostadsfotograf i Skåne. Ett inlägg, ditt kontors utseende, uppgifterna från bokningen. Boka fotografering på viewly.se.", rub:"Din bostadsfotograf i Skåne", cta:"Boka nu", mal:"Bokningar, kostnad per klick."}
];

/* ---------- sidan ---------- */
function txEd(prefix, title){
  var keys = Object.keys(TX).filter(function(k){ return k.indexOf(prefix) === 0 });
  return '<details class="a3det a3cust"><summary>' + esc(title) + '</summary><div class="a3hxs">' + keys.map(function(k){ return v3TxField(k, TX[k][1]) }).join("") + '</div></details>';
}
window.secAds8 = function(){
  if(V3_ADS8.indexOf(V3S.comp) < 0){ V3S.comp = "a8_ny"; V3S.t = V3_COMPS.a8_ny.thumb; V3S.playing = false; v3StopSound() }
  if(V3S.fmt !== "916" && V3S.fmt !== "45") V3S.fmt = "916";
  var comp = V3_COMPS[V3S.comp], fn = V3S.fmt === "916" ? "9:16 · 1080 × 1920" : "4:5 · 1080 × 1350";
  setTimeout(v3Mount, 0);
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 16 · bygge 49</div><h2>Kampanjen</h2>'
    + '<p>Fem annonser för mäklare i Skåne på Facebook och Instagram, var och en med en egen vinst: kännedom, tid, resultat, enkelhet och det lokala. Fotografering är kärnan, och allt som följer med bokningen visas som en del av den. Lugn rörelse, få riktiga ljud, begripligt utan ljud. Alla slutar med Boka fotografering. Förslag, inget publicerat.</p></div>'
    + '<div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w45") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play" aria-label="Spela">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '" aria-label="Tid"></div>'
    + '<span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Annons</div><div class="a3segs col">' + V3_ADS8.map(function(id){ return v3Seg("comp", id, V3_COMPS[id].n, V3S.comp === id) }).join("") + '</div>'
    + '<div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Reel 9:16", V3S.fmt === "916") + v3Seg("fmt", "45", "Flöde 4:5", V3S.fmt === "45") + '</div>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + comp.n + " · " + fn + ' · med ljud</button></div></div></div>'
    + '<h3 class="a3sub">Annonsplan för Meta</h3>'
    + '<p class="a3lede">En kampanj med målet kännedom (räckvidd och videovisningar) mot mäklare i Skåne, med alla fem annonser i samma annonsgrupp. Annonserna är olika på riktigt (olika vinst, upplägg och bild), eftersom Meta visar lika annonser mot varandra i stället för att nå fler. Ett andra steg riktas mot dem som sett minst hälften av en annons, med annons 2, 4 och 5 och knappen Boka nu.</p>'
    + '<div class="a3copy">' + PLAN.map(function(p){ return '<div><b>' + esc(p.t) + '</b><p>' + esc(p.syfte) + '</p><b>Steg i tratten</b><p>' + esc(p.steg) + '</p><b>Primärtext</b><p>' + esc(p.prim) + '</p><b>Rubrik · knapp</b><p>' + esc(p.rub) + ' · ' + esc(p.cta) + '</p><b>Mäts på</b><p>' + esc(p.mal) + '</p></div>' }).join("") + '</div>'
    + '<details class="a3det a3cust"><summary>Slutet, knappens text</summary><div class="a3hxs">' + ["a7.btnB", "a7.url", "a7.tag"].map(function(k){ return v3TxField(k, k === "a7.btnB" ? "Slutet · knappens text" : k === "a7.url" ? "Slutet · adressen" : "Slutet · raden efter adressen") }).join("") + '</div></details>'
    + ["ny", "ti", "fa", "et", "sk"].map(function(p, i){ return txEd("a8." + p + ".", ["1 · Bostadsfoto. Och lite till.", "2 · Boka en fotografering", "3 · Ett objekt. Fyra inlägg.", "4 · Fem leverantörer. Eller en.", "5 · Din bostadsfotograf i Skåne"][i]) }).join("")
    + '<details class="a3det"><summary>Underlag: vad som är kontrollerat och vad som inte är det</summary><div class="a3und">'
    + '<div><b>Metas säkra yta (kontrollerat)</b><p>Metas annonsguide rekommenderar att cirka 14 % överst, 35 % nederst och 6 % på sidorna lämnas fria från text och logotyper i Reels. Allt i 9:16 ligger därför i mitten. Slutkortet är litet och centrerat. Se <a href="https://www.facebook.com/business/ads-guide/update/image/instagram-reels" target="_blank" rel="noopener">Metas annonsguide för Reels</a>.</p></div>'
    + '<div><b>Olika annonser (delvis kontrollerat)</b><p>Flera branschkällor skriver att Meta slår ihop och konkurrerar ut annonser som liknar varandra. Det kommer från byråer och inte från Meta själv.</p></div>'
    + '<div><b>Ljud av, text på (branschkällor)</b><p>Många tittar utan ljud, så allt som betyder något står som text.</p></div>'
    + '<div><b>Längd (branschkällor)</b><p>Källorna går isär: 6 till 15 sekunder för kännedom eller 15 till 30. Annonserna är 18 till 22 sekunder med slutet.</p></div>'
    + '<div><b>Målgruppen på Meta (inte kontrollerat)</b><p>Kontrollera i annonshanteraren om yrket fastighetsmäklare går att rikta mot, och om Meta räknar annonserna som bostadsannonser (särskild annonskategori).</p></div>'
    + '<div><b>Påståenden</b><p>Inga siffror, inga löften om tid eller intäkter. Vad som ingår (fotografering, skymningsbild, bostadsfilm, planritning 2D och 3D, solbana, områdeskarta, områdesbilder) följer verktygets egen lista. Texten och inläggen hämtar uppgifterna från bokningen. Adress, namn och kontor i bilderna är exempel.</p></div>'
    + '<div><b>Mallarna i annons 5</b><p>Orange, grön och editorial är egna nyanser och egna layouter som kan påminna om olika kontor. Inga namn, märken eller kedjornas egna mallar. Använd bara kontorets egna material med kontorets tillåtelse.</p></div>'
    + '<div><b>Bilder och ljud</b><p>Bara era egna bilder (sida 15 och sängen från Såld). Riktiga ljud, CC0. Ingen musik. De små bilderna för skymningsbild, planritning, solbana och karta är ritade illustrationer, inga riktiga leveranser.</p></div></div></details></div>';
};
})();
