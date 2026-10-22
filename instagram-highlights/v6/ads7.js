/* =====================================================================
   SIDA 15 — ANNONSSERIE FÖR MÄKLARE

   Mål: att den enskilda mäklaren ska få veta att Viewly finns och bli
   nyfiken. Inget erbjudande, ingen musik, bara subtila ljud. Facebook
   och Instagram: 9:16, 4:5 och 1:1. Samma bilder och samma exempel-
   uppgifter som i Ads (sida 11). Exempelkontoret Nordvik och namnen i
   annons 4 är påhittade.

   Varje annons har ett eget slut som i varumärkesfilmen: en knapp som
   trycks, adressen på knappens plats, en rad, och loggan.
   ===================================================================== */
(function(){
var DARK = "#050505", PAPER = C3.paper, INK = C3.ink, MUT = C3.mut || "#8a867f";
var END_L = 7.9, E_CLICK = 1.25, E_T2 = 1.9, E_T3 = 3.5;

/* ---------- redigerbara texter ---------- */
var TX = {
  "a7.btn":["Upptäck verktygen", "Slutet · knappens text"],
  "a7.url":["viewly.se", "Slutet · adressen efter klicket"],
  "a7.tag":["För fastighetsmäklare som vill mer.", "Slutet · raden efter adressen"],
  "a7.k1a1":["Uppgifterna finns redan", "1 Klick · rubrik 1, rad 1"], "a7.k1a2":["i bokningen.", "1 Klick · rubrik 1, rad 2"],
  "a7.k1b1":["Välj bild.", "1 Klick · rubrik 2, rad 1"], "a7.k1b2":["Välj mall.", "1 Klick · rubrik 2, rad 2"],
  "a7.k1h1":["Det här inlägget", "1 Klick · öppning, rad 1"], "a7.k1h2":["tog två klick.", "1 Klick · öppning, rad 2"],
  "a7.k1c1":["Klart.", "1 Klick · rubrik 3, rad 1"], "a7.k1c2":["Timmar blir sekunder.", "1 Klick · rubrik 3, rad 2"],
  "a7.k2a1":["Samma inlägg.", "2 Timmar · rubrik 1, rad 1"], "a7.k2a2":["Två vägar dit.", "2 Timmar · rubrik 1, rad 2"],
  "a7.k2b1":["Timmar eller", "2 Timmar · rubrik 2, rad 1"], "a7.k2b2":["två klick.", "2 Timmar · rubrik 2, rad 2"],
  "a7.k3q1":["Levererar din fotograf", "3 Fotografen · frågan, rad 1"], "a7.k3q2":["inläggen också?", "3 Fotografen · frågan, rad 2"],
  "a7.k3a1":["Vi gör det.", "3 Fotografen · svar, rad 1"], "a7.k3a2":["Foton och färdiga inlägg.", "3 Fotografen · svar, rad 2"],
  "a7.k4a1":["Dina objekt.", "4 Varumärket · rubrik, rad 1"], "a7.k4a2":["Ditt varumärke.", "4 Varumärket · rubrik, rad 2"],
  "a7.k5a":["Bilderna först.", "5 Bilderna först · text på bilderna"],
  "a7.k5b1":["Sedan fixar vi", "5 Bilderna först · rubrik, rad 1"], "a7.k5b2":["resten.", "5 Bilderna först · rubrik, rad 2"],
  "a7.k6a":["BOSTADSFOTOGRAFI I", "6 Skåne · liten rad"],
  "a7.k6b1":["Hela Skåne.", "6 Skåne · slutrad 1"], "a7.k6b2":["Foton och färdiga inlägg.", "6 Skåne · slutrad 2"]
};
Object.keys(TX).forEach(function(k){ V3_TXD[k] = TX[k][0] });
var T = function(k){ return v3t(k) };

/* ---------- gemensamma delar ---------- */
function rr(c, x, y, w, h, r){ c.beginPath(); if(c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h) }
function box(G){ var y0 = G.top + (G.is9 ? 3 : 4), y1 = G.H - G.bot - (G.is9 ? 3 : 4); return {y0:y0, y1:y1, h:y1 - y0} }
function hsz(G){ return G.is9 ? 10 : (G.H > 110 ? 8.2 : 6.8) }
function headBlock(c, G, t, a0, a1, l1, l2, o){
  o = o || {}; var B = box(G), s = hsz(G)*(o.k || 1), a = ioC(k3(t, a0, a0 + .5))*(1 - ioC(k3(t, a1 - .3, a1)));
  if(a <= 0) return; var y = B.y0 + s*1.05;
  v3Text(c, l1, 50, y, {size:s, color:o.c1 || INK, align:"c", alpha:a, p:oQ(k3(t, a0, a0 + .8)), rise:2});
  if(l2) v3Text(c, l2, 50, y + s*1.18, {size:s, italic:true, color:o.c2 || C3.oli, align:"c", alpha:a, p:oQ(k3(t, a0 + .3, a0 + 1.1)), rise:2});
}
/* en virtuell scen på 100 × 84 under rubriken, nedskalad om utrymmet är mindre */
function stageGeom(G){ var B = box(G), headH = hsz(G)*2.45 + 2, y = B.y0 + headH, h = B.y1 - y, u = Math.min(1, h/84); return {u:u, ox:50 - 50*u, oy:y + (h - 84*u)/2} }
function stage(c, G, fn){ var g = stageGeom(G); c.save(); c.translate(g.ox, g.oy); c.scale(g.u, g.u); fn(); c.restore() }
function stageRect(G, x, y, w, h){ var g = stageGeom(G); return [g.ox + x*g.u, g.oy + y*g.u, w*g.u, h*g.u] }
function path(t, keys){
  var i = 0; while(i < keys.length - 2 && t >= keys[i + 1][0]) i++;
  var a = keys[i], b = keys[i + 1], p = ioC(k3(t, a[0], b[0]));
  return [lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
}
function post(c, x, y, w, ar, prog, o, style, phase, photo){ v3Post(c, style || "overlay", phase || "tillsalu", photo || null, x, y, w, ar, prog, o) }
function chip(c, x, y, w, h, label, on, a){
  c.save(); c.globalAlpha = a; c.strokeStyle = "rgba(28,28,30,.22)"; c.lineWidth = .18; rr(c, x, y, w, h, h/2); c.stroke();
  if(on > 0){ c.globalAlpha = a*on; c.fillStyle = INK; rr(c, x, y, w, h, h/2); c.fill() }
  c.restore();
  v3Text(c, label, x + w/2, y + h*.62, {size:h*.27, weight:600, f:"sans", sp:.1, color:on > .5 ? "#fff" : INK, align:"c", alpha:a});
}
var FIELDS = [["ADRESS", "Storgatan 13"], ["OMRÅDE", "Landskrona"], ["RUM", "4 rum"], ["YTA", "112 m²"], ["MÄKLARE", "Anna Lindqvist"], ["KONTOR", "Nordvik"]];
function bookCard(c, x, y, s, a, hi){
  var W = 84, H = 38, pos = [], i, col, row, fx, fy;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.14)"; c.shadowBlur = 7; c.shadowOffsetY = 1.6; c.fillStyle = "#fff"; rr(c, 0, 0, W, H, 3); c.fill(); c.restore();
  v3Text(c, "BOKNING", 5, 7, {size:1.5, weight:600, f:"sans", sp:.3, color:MUT, alpha:a});
  for(i = 0; i < 6; i++){
    col = i % 2; row = (i/2) | 0; fx = 5 + col*40; fy = 14 + row*8.4;
    v3Text(c, FIELDS[i][0], fx, fy, {size:1.25, weight:600, f:"sans", sp:.2, color:MUT, alpha:a});
    v3Text(c, FIELDS[i][1], fx, fy + 4.3, {size:2.9, color:INK, alpha:a});
    if(hi && hi[i] > 0) v3Line(c, fx, fx + 30, fy + 5.6, C3.oli, .35, 1, a*hi[i]);
    pos.push([x + (fx + 8)*s, y + (fy + 3)*s]);
  }
  c.restore(); return pos;
}
function thumb(c, key, x, y, w, h, a, state){
  c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 4; c.shadowOffsetY = 1; c.fillStyle = "#fff"; rr(c, x - .7, y - .7, w + 1.4, h + 1.4, 1.6); c.fill(); c.restore();
  c.save(); c.globalAlpha = a; rr(c, x, y, w, h, 1.2); c.clip(); v3Photo(c, key, x, y, w, h, {scale:1.15}); c.restore();
  if(state > 0){ c.save(); c.globalAlpha = a*state; c.strokeStyle = INK; c.lineWidth = .5; rr(c, x - .7, y - .7, w + 1.4, h + 1.4, 1.6); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(x + 3.6, y + 3.6, 2.1, 0, 7); c.fill(); c.restore();
    v3Text(c, "1", x + 3.6, y + 4.4, {size:2.3, weight:600, f:"sans", color:"#fff", align:"c", alpha:a*state}) }
}
function tick(c, x, y, r, p, col){ if(p <= 0) return; c.save(); c.strokeStyle = col || INK; c.lineWidth = r*.28; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(x - r*.5, y); c.lineTo(x - r*.1, y + r*.42*Math.min(1, p*2)); if(p > .5) c.lineTo(x - r*.1 + (r*.75)*(p - .5)*2, y + r*.42 - r*.95*(p - .5)*2); c.stroke(); c.restore() }

/* ---------- slutet, som i varumärkesfilmen ---------- */
function endSeq(c, G, t, e0){
  var u0 = t - e0; if(u0 < 0) return;
  var H = G.H, cx = 50, cy = G.cy, w = G.is9 ? 66 : 58, h = G.is9 ? 10.4 : 9, ts = h*.3;
  var bgA = ioC(k3(u0, 0, .5)), ap = oQ(k3(u0, .3, .8)), press = k3(u0, E_CLICK - .1, E_CLICK)*(1 - k3(u0, E_CLICK + .08, E_CLICK + .26)), gone = ioC(k3(u0, E_CLICK + .08, E_CLICK + .26));
  v3Fill(c, 0, 0, 100, H, "#050505", bgA);
  if(gone < 1){
    var bw = w*(1 - .05*press), bh = h*(1 - .05*press), a = ap*(1 - gone);
    c.save(); c.translate(cx, cy); c.scale(1 + .05*gone, 1 + .05*gone); c.translate(-cx, -cy);
    c.save(); c.globalAlpha = a; c.shadowColor = "rgba(255,255,255," + (.18 + .08*Math.sin(u0*5)) + ")"; c.shadowBlur = 7; c.shadowOffsetY = 1.2;
    var bg = c.createLinearGradient(0, cy - bh/2, 0, cy + bh/2); bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "#cfcfcf");
    c.fillStyle = bg; rr(c, cx - bw/2, cy - bh/2, bw, bh, bh/2); c.fill(); c.restore();
    v3Text(c, T("a7.btn"), cx, cy + ts*.34, {size:ts, weight:500, f:"sans", sp:.02, color:"#0a0a0a", align:"c", alpha:a});
    c.restore();
    var cp = ioC(k3(u0, E_CLICK - .85, E_CLICK - .08)), curX = lerp(106, cx + w*.21, cp), curY = lerp(H - (G.is9 ? 20 : 8), cy + h*.33, cp) - Math.sin(cp*Math.PI)*4;
    v3Cursor(c, curX, curY, press, k3(u0, E_CLICK - .85, E_CLICK - .6)*(1 - k3(u0, E_CLICK + .3, E_CLICK + .55)));
    v3Tap(c, cx + w*.21, cy + h*.33, k3(u0, E_CLICK - .02, E_CLICK + .5));
  }
  var T1 = E_CLICK + .2, T2 = E_CLICK + E_T2, T3 = E_CLICK + E_T3, ts2 = G.is9 ? 6.4 : 5.8;
  var aA = ioC(k3(u0, T1, T1 + .3))*(1 - ioC(k3(u0, T2 - .3, T2)));
  if(aA > 0) v3Text(c, T("a7.url"), cx, cy + ts2*.34 + (1 - ioC(k3(u0, T1, T1 + .3)))*1.2 - ioC(k3(u0, T2 - .3, T2))*1.2, {size:ts2, weight:500, f:"sans", sp:.01, color:"#fff", align:"c", alpha:aA});
  var aB = ioC(k3(u0, T2, T2 + .45))*(1 - ioC(k3(u0, T3 - .3, T3)));
  if(aB > 0){
    var tg = T("a7.tag"), sz = ts2*.8, mw = v3Measure(c, tg, {size:sz, weight:500, f:"sans", sp:.01});
    if(mw > 90) sz *= 90/mw;
    v3Text(c, tg, cx, cy + sz*.37 + (1 - ioC(k3(u0, T2, T2 + .45)))*1.2 - ioC(k3(u0, T3 - .3, T3))*1.2, {size:sz, weight:500, f:"sans", sp:.01, color:"#fff", align:"c", alpha:aB});
  }
  if(u0 >= T3) endLogo(c, G, u0 - T3);
}
function endLogo(c, G, u){
  var cy = G.cy, capH = 6.2, mh = capH*1.7, mw = mh*858.6/756.3, fs = capH/.7*.8, gap = capH*.8;
  var wo = {size:fs, weight:500, f:"sans", sp:.2, color:"#fff"}, ww = v3Measure(c, "VIEWLY", wo) - .2*fs;
  var tot = mw + gap + ww, fx = 50 - tot/2 - capH*.113;
  var slide = ioC(k3(u, 1.0, 1.7)), x0 = lerp(50 - mw/2, fx, slide), mx = x0 + mw/2;
  c.save(); c.translate(mx, cy); c.rotate(-1.25*(1 - oQ(k3(u, 0, .95)))); var sc = lerp(.45, 1, oBack(k3(u, 0, .85))); c.scale(sc, sc); c.translate(-mx, -cy);
  v3Mark(c, x0, cy - mh/2, mh, "#fff", C3.olil, {reveal:ioC(k3(u, .05, .8)), dot:oBack(k3(u, .75, 1.05)), alpha:ioC(k3(u, 0, .25))});
  c.restore();
  var by = cy + capH/2 + capH*.02, wx = fx + mw + gap, i, str = "VIEWLY", x = wx;
  for(i = 0; i < str.length; i++){
    var lp = oQ(k3(u, 1.15 + i*.07, 1.15 + i*.07 + .45));
    v3Text(c, str[i], x, by, {size:fs, weight:500, f:"sans", color:"#fff", p:lp, rise:capH*.5});
    x += c.measureText(str[i]).width + .2*fs;
  }
}

/* ===== 1 · Klick. Klick. ===== */
var L1 = 11.8, D1 = 1.6;
function ad1(c, G, t0){
  var t = t0 - D1;
  v3Fill(c, 0, 0, 100, G.H, PAPER);
  /* först resultatet: inlägget som tog två klick */
  headBlock(c, G, t0, .1, 1.9, T("a7.k1h1"), T("a7.k1h2"));
  if(t0 < 1.9) stage(c, G, function(){
    var ex = ioC(k3(t0, 1.3, 1.85)), sc = lerp(.92, 1, oQ(k3(t0, .05, .6)))*lerp(1, .5, ex), cx = 50, cy = lerp(42, 76, ex);
    c.save(); c.translate(cx, cy); c.scale(sc, sc); c.translate(-cx, -cy); post(c, 27, 12, 46, 1.25, 1); c.restore();
  });
  headBlock(c, G, t, .2, 2.6, T("a7.k1a1"), T("a7.k1a2"));
  headBlock(c, G, t, 2.6, 7.3, T("a7.k1b1"), T("a7.k1b2"));
  headBlock(c, G, t, 7.4, L1 - D1, T("a7.k1c1"), T("a7.k1c2"));
  stage(c, G, function(){
    var inA = ioC(k3(t, .3, 1.0)), dock = ioC(k3(t, 2.4, 3.1)), bs = lerp(1, .62, dock), bw = 84*bs;
    var hi = [0, 1, 2, 3, 4, 5].map(function(i){ return ioC(k3(t, 5.7 + i*.1, 6.0 + i*.1))*(1 - ioC(k3(t, 6.9, 7.3))) });
    var fieldPos = bookCard(c, (100 - bw)/2, lerp(23 + (1 - inA)*4, 0, dock), bs, inA, hi);
    /* tre bilder */
    var ta = ioC(k3(t, 2.8, 3.4))*(1 - ioC(k3(t, 5.9, 6.4))), sel = ioC(k3(t, 3.9, 4.15)), keys = ["dining", "home", "bedroom"], i;
    for(i = 0; i < 3; i++) thumb(c, keys[i], 8 + i*29, 28 + (1 - ta)*3, 26, 31, ta*(i === 1 ? 1 : 1 - .55*sel), i === 1 ? sel : 0);
    /* tre mallar */
    var ca = ioC(k3(t, 4.5, 5.0))*(1 - ioC(k3(t, 5.9, 6.4))), cs = ioC(k3(t, 5.6, 5.85)), labs = ["Kommande", "Till salu", "Såld"];
    for(i = 0; i < 3; i++) chip(c, 8 + i*29, 65, 26, 8, labs[i], i === 1 ? cs : 0, ca);
    /* inlägget växer fram */
    var pa = ioC(k3(t, 5.9, 6.4)), prog = k3(t, 6.0, 7.5);
    if(pa > 0){
      var fan = oBack(k3(t, 7.6, 8.5));
      if(fan > 0){
        c.save(); c.globalAlpha = Math.min(1, fan);
        post(c, lerp(34, 1, fan), 38, 25, 1.778, 1, null, "overlay", "tillsalu");
        post(c, lerp(34, 72, fan), 48, 27, 1, 1, null, "overlay", "tillsalu");
        c.restore();
      }
      c.save(); c.globalAlpha = pa; var sc = lerp(.9, 1, oQ(k3(t, 5.9, 6.6))); c.translate(50, 55); c.scale(sc, sc); c.translate(-50, -55);
      post(c, 27, 26, 46, 1.25, prog, {skel:"auto"}); c.restore();
    }
    /* uppgifterna flyger från bokningen in i mallen */
    for(i = 0; i < 6; i++){
      var fp = k3(t, 5.95 + i*.09, 6.7 + i*.09); if(fp <= 0 || fp >= 1) continue;
      var tx = 32 + (i % 3)*14, ty = 66 + ((i/3) | 0)*5, e = ioC(fp), x = lerp(fieldPos[i][0], tx, e), y = lerp(fieldPos[i][1], ty, e) - Math.sin(e*Math.PI)*6;
      c.save(); c.globalAlpha = Math.sin(fp*Math.PI)*.95; c.fillStyle = C3.oli; c.beginPath(); c.arc(x, y, .9, 0, 7); c.fill(); c.restore();
    }
    /* pekaren */
    var cur = path(t, [[2.9, 108, 56], [3.85, 50, 44], [4.9, 50, 44], [5.55, 50, 69], [6.3, 62, 78]]), ca2 = k3(t, 2.9, 3.2)*(1 - k3(t, 5.95, 6.4));
    v3Cursor(c, cur[0], cur[1], Math.max(k3(t, 3.8, 3.9)*(1 - k3(t, 4.05, 4.2)), k3(t, 5.5, 5.6)*(1 - k3(t, 5.75, 5.9))), ca2);
    v3Tap(c, 50, 44, k3(t, 3.85, 4.5)); v3Tap(c, 50, 69, k3(t, 5.55, 6.2));
  });
}

/* ===== 2 · Timmar eller två klick ===== */
var L2 = 9.4;
function ad2(c, G, t){
  v3Fill(c, 0, 0, 100, G.H, PAPER);
  headBlock(c, G, t, .2, 6.1, T("a7.k2a1"), T("a7.k2a2"));
  headBlock(c, G, t, 6.3, L2, T("a7.k2b1"), T("a7.k2b2"));
  stage(c, G, function(){
    var A = ioC(k3(t, .6, 1.3)), B = ioC(k3(t, 3.0, 3.7)), i;
    /* i dag */
    c.save(); c.globalAlpha = A; c.shadowColor = "rgba(0,0,0,.12)"; c.shadowBlur = 6; c.shadowOffsetY = 1.4; c.fillStyle = "#fff"; rr(c, 8, 0 + (1 - A)*3, 84, 38, 3); c.fill(); c.restore();
    v3Text(c, "I DAG", 14, 8, {size:1.5, weight:600, f:"sans", sp:.3, color:MUT, alpha:A});
    var cx = 24, cy = 24;
    c.save(); c.globalAlpha = A; c.strokeStyle = INK; c.lineWidth = .5; c.beginPath(); c.arc(cx, cy, 8.5, 0, 7); c.stroke();
    for(i = 0; i < 12; i++){ var an = i/12*Math.PI*2; c.beginPath(); c.moveTo(cx + Math.sin(an)*7.2, cy - Math.cos(an)*7.2); c.lineTo(cx + Math.sin(an)*8.2, cy - Math.cos(an)*8.2); c.stroke() }
    var am = t*9, ah = t*.75; c.lineCap = "round"; c.lineWidth = .6; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(am)*6.8, cy - Math.cos(am)*6.8); c.stroke();
    c.lineWidth = .8; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(ah)*4.4, cy - Math.cos(ah)*4.4); c.stroke(); c.restore();
    v3Text(c, "Timmar.", 38, 25, {size:7.4, color:INK, alpha:A});
    var items = ["Hitta rätt bild", "Skriva texten", "Anpassa formaten", "Exportera"];
    for(i = 0; i < 4; i++){
      var ia = ioC(k3(t, 1.2 + i*.35, 1.7 + i*.35)), ok = k3(t, 2.2 + i*1.0, 2.7 + i*1.0);
      v3Text(c, items[i], 38 + (i % 2)*27, 31 + ((i/2) | 0)*4.4, {size:1.55, weight:500, f:"sans", color:MUT, alpha:A*ia});
      tick(c, 36 + (i % 2)*27, 30.4 + ((i/2) | 0)*4.4, 1.6, ok, C3.oli);
    }
    /* med Viewly */
    c.save(); c.globalAlpha = B; c.shadowColor = "rgba(0,0,0,.12)"; c.shadowBlur = 6; c.shadowOffsetY = 1.4; c.fillStyle = "#fff"; rr(c, 8, 44 + (1 - B)*3, 84, 40, 3); c.fill(); c.restore();
    v3Text(c, "MED VIEWLY", 14, 52, {size:1.5, weight:600, f:"sans", sp:.3, color:MUT, alpha:B});
    v3Text(c, "Två klick.", 14, 66, {size:7.4, color:INK, alpha:B});
    var s1 = ioC(k3(t, 4.0, 4.2)), s2 = ioC(k3(t, 4.85, 5.05));
    chip(c, 14, 72, 30, 8, "Välj bild", s1, B); chip(c, 48, 72, 30, 8, "Välj mall", s2, B);
    var done = ioC(k3(t, 5.1, 5.4)); c.save(); c.globalAlpha = done; c.fillStyle = INK; c.beginPath(); c.arc(80, 60, 5.2, 0, 7); c.fill(); c.restore();
    tick(c, 80.5, 59.6, 4, k3(t, 5.15, 5.6), "#fff");
    v3Text(c, "Sekunder.", 80, 70, {size:2.2, italic:true, color:C3.oli, align:"c", alpha:done});
    var cur = path(t, [[3.4, 100, 80], [4.0, 29, 76], [4.8, 63, 76], [5.6, 96, 84]]);
    v3Cursor(c, cur[0], cur[1], Math.max(k3(t, 3.95, 4.05)*(1 - k3(t, 4.15, 4.25)), k3(t, 4.78, 4.88)*(1 - k3(t, 4.98, 5.08))), k3(t, 3.4, 3.7)*(1 - k3(t, 5.4, 5.9)));
    v3Tap(c, 29, 76, k3(t, 4.0, 4.6)); v3Tap(c, 63, 76, k3(t, 4.85, 5.4));
  });
}

/* ===== 3 · Levererar din fotograf inläggen också? ===== */
var L3 = 9.6;
function ad3(c, G, t){
  var H = G.H, dark = 1 - ioC(k3(t, 3.5, 4.2));
  v3Fill(c, 0, 0, 100, H, PAPER);
  if(dark > 0){
    c.save(); c.globalAlpha = dark; v3Photo(c, "home", 0, 0, 100, H, {scale:lerp(1.05, 1.16, k3(t, 0, 3.8)), pos:[.5, .45]}); c.restore();
    v3Fill(c, 0, 0, 100, H, "#0c0a0a", .55*dark);
    var s = G.is9 ? 10.4 : (H > 110 ? 8.6 : 7.4), B = box(G), y = B.y0 + B.h*.42;
    v3Text(c, T("a7.k3q1"), 50, y, {size:s, color:"#fff", align:"c", alpha:dark, p:oQ(k3(t, .5, 1.8)), rise:2, shadow:true});
    v3Text(c, T("a7.k3q2"), 50, y + s*1.2, {size:s, italic:true, color:C3.cream, align:"c", alpha:dark, p:oQ(k3(t, 1.5, 2.8)), rise:2, shadow:true});
  }
  headBlock(c, G, t, 4.3, L3, T("a7.k3a1"), T("a7.k3a2"));
  stage(c, G, function(){
    var a = ioC(k3(t, 4.5, 5.1)), i;
    c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.14)"; c.shadowBlur = 7; c.shadowOffsetY = 1.6; c.fillStyle = "#fff"; rr(c, 8, 4 + (1 - a)*3, 84, 76, 3); c.fill(); c.restore();
    v3Text(c, "LEVERANS · STORGATAN 13", 14, 13, {size:1.5, weight:600, f:"sans", sp:.3, color:MUT, alpha:a});
    var r1 = ioC(k3(t, 5.0, 5.5)); v3Text(c, "12 bilder levererade", 14, 23, {size:3.6, color:INK, alpha:a*r1});
    c.save(); c.globalAlpha = r1; c.fillStyle = INK; c.beginPath(); c.arc(84, 21.4, 3, 0, 7); c.fill(); c.restore(); tick(c, 84.2, 21.2, 2.4, k3(t, 5.4, 5.8), "#fff");
    var ph = ["bedroom", "home", "dining", "terrace"];
    for(i = 0; i < 4; i++){ var pa = ioC(k3(t, 5.2 + i*.1, 5.6 + i*.1)); thumb(c, ph[i], 14 + i*18.6, 28 + (1 - pa)*2, 16.4, 10, a*pa, 0) }
    var r2 = ioC(k3(t, 6.2, 6.7)); v3Text(c, "3 inlägg klara", 14, 50, {size:3.6, color:INK, alpha:a*r2});
    c.save(); c.globalAlpha = r2; c.fillStyle = INK; c.beginPath(); c.arc(84, 48.4, 3, 0, 7); c.fill(); c.restore(); tick(c, 84.2, 48.2, 2.4, k3(t, 6.6, 7.0), "#fff");
    var sty = [["badge", "kommande"], ["overlay", "tillsalu"], ["editorial", "sald"]];
    for(i = 0; i < 3; i++){ var qa = ioC(k3(t, 6.4 + i*.18, 6.9 + i*.18)); if(qa > .02){ var sq = lerp(.85, 1, qa), qx = 14 + i*25.6 + 11, qy = 54 + 13.75; c.save(); c.translate(qx, qy); c.scale(sq, sq); c.translate(-qx, -qy); post(c, 14 + i*25.6, 54, 22, 1.25, 1, null, sty[i][0], sty[i][1]); c.restore() } }
  });
}

/* ===== 4 · Dina objekt. Ditt varumärke. ===== */
var L4 = 9.6;
var PROF = [
  {off:{name:"NORDVIK", sub:"MÄKLARBYRÅ", accent:"#2F6F6B", accentL:"#9CC7C0"}, mk:"Anna Lindqvist", photo:"home", style:"overlay"},
  {off:{name:"HAMNEN", sub:"FASTIGHETER", accent:"#3a3a3c", accentL:"#cfcbc5"}, mk:"Marcus Ek", photo:"dining", style:"overlay"},
  {off:{name:"KUSTEN", sub:"MÄKLARE", accent:"#6E7266", accentL:"#c3cab4"}, mk:"Sara Holm", photo:"terrace", style:"overlay"}
];
function withProfile(p, fn){
  var o0 = {name:OFF.name, sub:OFF.sub, accent:OFF.accent, accentL:OFF.accentL}, m0 = V3_OBJ.maklare;
  OFF.name = p.off.name; OFF.sub = p.off.sub; OFF.accent = p.off.accent; OFF.accentL = p.off.accentL; V3_OBJ.maklare = p.mk;
  try { fn() } finally { OFF.name = o0.name; OFF.sub = o0.sub; OFF.accent = o0.accent; OFF.accentL = o0.accentL; V3_OBJ.maklare = m0 }
}
var SW = [2.3, 5.0];
function ad4(c, G, t){
  v3Fill(c, 0, 0, 100, G.H, PAPER);
  headBlock(c, G, t, .2, L4, T("a7.k4a1"), T("a7.k4a2"));
  stage(c, G, function(){
    var pi = t >= SW[1] ? 2 : t >= SW[0] ? 1 : 0, sx = 1, i;
    for(i = 0; i < SW.length; i++){ var d = Math.abs(t - SW[i]); if(d < .22) sx = d/.22 }
    var a = ioC(k3(t, .3, .9)), p = PROF[pi];
    c.save(); c.globalAlpha = a; c.translate(50, 34); c.scale(Math.max(.02, sx), 1); c.translate(-50, -34);
    withProfile(p, function(){ post(c, 25, 2, 50, 1.25, 1, null, p.style, "tillsalu", p.photo) });
    c.restore();
    var labs = ["Ditt namn", "Din färg", "Din logga"];
    for(i = 0; i < 3; i++){ var on = ioC(k3(t, .9 + i*.9, 1.2 + i*.9)); chip(c, 8 + i*29, 72, 26, 8, labs[i], on, a) }
    /* en liten markör som visar vilket kontor det är */
    v3Text(c, "EXEMPELKONTOR", 50, 83.4, {size:1.2, weight:500, f:"sans", sp:.3, color:MUT, align:"c", alpha:a*.8});
  });
}

/* ===== 5 · Bilderna först. Sedan resten. ===== */
var L5 = 10.6, P5 = ["home", "dining", "bedroom", "terrace"];
function ad5(c, G, t){
  var H = G.H, B = box(G), collapse = ioC(k3(t, 6.4, 7.5)), paper = ioC(k3(t, 6.8, 7.6));
  v3Fill(c, 0, 0, 100, H, PAPER);
  var tgt = stageRect(G, 26, 6, 48, 60), r = [lerp(0, tgt[0], collapse), lerp(0, tgt[1], collapse), lerp(100, tgt[2], collapse), lerp(H, tgt[3], collapse)];
  if(t < 7.6){
    c.save(); rr(c, r[0], r[1], r[2], r[3], lerp(0, 2, collapse)); c.clip();
    var k = Math.min(3, Math.floor(t/1.65)), u = k3(t, k*1.65, (k + 1)*1.65), nxt = Math.min(3, k + 1), fade = k < 3 ? ioC(k3(t, (k + 1)*1.65 - .3, (k + 1)*1.65)) : 0;
    v3Photo(c, P5[k], r[0], r[1], r[2], r[3], {scale:lerp(1.05, 1.16, u), pos:[.5, .5]});
    if(fade > 0) v3Photo(c, P5[nxt], r[0], r[1], r[2], r[3], {scale:1.05, pos:[.5, .5], alpha:fade});
    c.restore();
    var tx = 1 - collapse;
    if(tx > .01){
      v3Grad(c, 0, H*.5, 100, H*.5, [[0, "rgba(12,10,10,0)"], [1, "rgba(12,10,10,.7)"]], tx);
      v3Text(c, "BOSTADSFOTOGRAFERING", 50, B.y0 + 1, {size:1.9, weight:500, f:"sans", sp:.3, color:"#fff", align:"c", alpha:.9*tx*ioC(k3(t, .2, .8))});
      v3Text(c, T("a7.k5a"), 50, B.y1 - 6, {size:G.is9 ? 11 : 9, color:"#fff", align:"c", alpha:tx, p:oQ(k3(t, .5, 1.6)), rise:2, shadow:true});
    }
  }
  headBlock(c, G, t, 7.4, L5, T("a7.k5b1"), T("a7.k5b2"));
  if(t >= 7.4) stage(c, G, function(){
    var pa = ioC(k3(t, 7.5, 7.9)), fan = oBack(k3(t, 8.4, 9.3));
    if(fan > 0){ c.save(); c.globalAlpha = Math.min(1, fan);
      post(c, lerp(34, 2, fan), 22, 34, 1.778, 1, null, "overlay", "tillsalu", "dining");
      post(c, lerp(34, 62, fan), 38, 36, 1, 1, null, "overlay", "tillsalu", "bedroom"); c.restore() }
    c.save(); c.globalAlpha = pa; post(c, 26, 6, 48, 1.25, k3(t, 7.4, 8.2), null, "overlay", "tillsalu", "home"); c.restore();
    var labs = ["Annonser", "Kampanj", "Alla format"];
    for(var i = 0; i < 3; i++) chip(c, 8 + i*29, 72, 26, 8, labs[i], 0, ioC(k3(t, 8.9 + i*.2, 9.3 + i*.2)));
  });
}

/* ===== 6 · Hela Skåne ===== */
var L6 = 8.6, CITIES = [["Malmö", "terrace"], ["Lund", "dining"], ["Landskrona", "home"], ["Helsingborg", "bedroom"]];
function ad6(c, G, t){
  var H = G.H, B = box(G), fin = ioC(k3(t, 5.6, 6.2));
  v3Fill(c, 0, 0, 100, H, DARK);
  var k = Math.min(3, Math.floor(Math.max(0, t - .5)/1.25)), t0 = .5 + k*1.25, kk, a;
  for(kk = 0; kk < 4; kk++){
    a = kk < k ? 0 : kk === k ? ioC(k3(t, t0, t0 + .25)) : 0; if(kk === k && k > 0) a = 1;
    if(kk === 0) a = Math.max(a, ioC(k3(t, 0, .6)));
    if(a > 0) v3Photo(c, CITIES[kk][1], 0, 0, 100, H, {scale:lerp(1.06, 1.16, k3(t, .5 + kk*1.25, 5.8)), pos:[.5, .5], alpha:a});
  }
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", .42 + .2*fin);
  var s = G.is9 ? 12 : 9.6, cy = B.y0 + B.h*.46;
  v3Text(c, T("a7.k6a"), 50, cy - s*1.15, {size:1.9, weight:500, f:"sans", sp:.3, color:"#fff", align:"c", alpha:.9*ioC(k3(t, .3, .9))*(1 - fin)});
  CITIES.forEach(function(ci, i){
    var s0 = .5 + i*1.25, va = ioC(k3(t, s0, s0 + .25))*(1 - ioC(k3(t, s0 + 1.0, s0 + 1.25)))*(1 - fin); if(i === 3) va = ioC(k3(t, s0, s0 + .25))*(1 - fin);
    if(va > 0) v3Text(c, ci[0], 50, cy, {size:s, color:"#fff", align:"c", alpha:va, p:oQ(k3(t, s0, s0 + .5)), rise:2, shadow:true});
  });
  if(fin > 0){
    v3Text(c, T("a7.k6b1"), 50, cy, {size:s, color:"#fff", align:"c", alpha:fin, p:oQ(k3(t, 5.7, 6.5)), rise:2, shadow:true});
    v3Text(c, T("a7.k6b2"), 50, cy + s*.95, {size:s*.58, italic:true, color:C3.cream, align:"c", alpha:fin, p:oQ(k3(t, 6.1, 7.0)), rise:2, shadow:true});
  }
}

/* ---------- ljudet: bara subtila effekter ---------- */
function makeMix(sched){
  return function(ctx, comp){
    var DUR = comp.dur, master = ctx.createGain(); master.gain.value = .8;
    var cmp = ctx.createDynamicsCompressor(); cmp.threshold.value = -16; cmp.ratio.value = 2.2;
    var lim = ctx.createDynamicsCompressor(); lim.threshold.value = -3; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .08; lim.knee.value = 0;
    var fade = ctx.createGain(); fade.gain.setValueAtTime(1, Math.max(0, DUR - .6)); fade.gain.linearRampToValueAtTime(0, DUR);
    master.connect(cmp); cmp.connect(lim); lim.connect(fade); fade.connect(ctx.destination);
    var bus = function(g){ var a = ctx.createGain(); a.gain.value = g == null ? 1 : g; a.connect(master); return a };
    var nb = function(len){ var b = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate*len)), ctx.sampleRate), d = b.getChannelData(0), k; for(k = 0; k < d.length; k++) d[k] = Math.random()*2 - 1; return b };
    var H = {};
    H.tickN = function(t, v, tone){ var n = ctx.createBufferSource(); n.buffer = nb(.02); var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = tone; bp.Q.value = .9; var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .012); n.connect(bp); bp.connect(g); g.connect(bus(1)); n.start(t);
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(120, t + .018); var g2 = ctx.createGain(); g2.gain.setValueAtTime(v*.55, t); g2.gain.exponentialRampToValueAtTime(.001, t + .025); o.connect(g2); g2.connect(bus(1)); o.start(t); o.stop(t + .03) };
    H.click = function(t, v, up){ H.tickN(t, v, 3200); if(up !== false) H.tickN(t + .075, v*.55, 4200) };
    H.pop = function(t, v){ var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(880, t + .05); var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(g); g.connect(bus(1)); o.start(t); o.stop(t + .14) };
    H.soft = function(t, v){ var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = 1800; var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .04); o.connect(g); g.connect(bus(1)); o.start(t); o.stop(t + .05) };
    H.whoosh = function(t, dd, v){ var n = ctx.createBufferSource(); n.buffer = nb(dd + .1); var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1; f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(3000, t + dd); var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dd*.6); g.gain.linearRampToValueAtTime(0, t + dd); n.connect(f); f.connect(g); g.connect(bus(1)); n.start(t) };
    H.thud = function(t, v){ var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(48, t + .12); var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .22); o.connect(g); g.connect(bus(1)); o.start(t); o.stop(t + .25) };
    H.shutter = function(t, v){ var n = ctx.createBufferSource(); n.buffer = nb(.03); var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3000; bp.Q.value = 1.1; var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .03); n.connect(bp); bp.connect(g); g.connect(bus(1)); n.start(t) };
    sched(H, comp);
    /* slutet: tryck, och enkla klick när texten byter */
    var e0 = comp.dur - END_L;
    H.click(e0 + E_CLICK, .8); H.click(e0 + E_CLICK + .2, .45, false); H.click(e0 + E_CLICK + E_T2, .45, false); H.click(e0 + E_CLICK + E_T3, .45, false);
  };
}

/* ---------- komponera ---------- */
window.V3_ADS7 = [];
function reg(id, n, d, L, fn, thumb, sched){
  var comp = {n:n, d:d, group:"ads7", dur:L + END_L, thumb:thumb, id:id, v:{id:id}, L:L};
  comp.draw = function(c, G, t){ fn(c, G, t); if(t >= L) endSeq(c, G, t, L) };
  comp.mix = makeMix(sched);
  V3_COMPS[id] = comp; V3_ADS7.push(id);
}
reg("a7_klick", "Klick. Klick.", "Först resultatet, sedan hur: uppgifterna finns redan, välj bild, välj mall.", L1, ad1, 9.8, function(H){
  H.pop(.15, .08); H.whoosh(1.3, .5, .05);
  H.click(3.85 + 1.6, .7); H.click(5.6 + 1.6, .7); H.pop(3.9 + 1.6, .07);
  [0, 1, 2, 3, 4, 5].forEach(function(i){ H.soft(6.65 + 1.6 + i*.09, .05) });
  H.whoosh(7.55 + 1.6, .5, .06); H.pop(7.4 + 1.6, .1); H.pop(8.3 + 1.6, .06); H.pop(8.45 + 1.6, .06);
});
reg("a7_timmar", "Timmar eller två klick", "Samma inlägg, två vägar.", L2, ad2, 6.0, function(H){
  [0, 1, 2, 3].forEach(function(i){ H.soft(2.2 + i*1.0 + .3, .05) });
  H.click(4.0, .7); H.click(4.85, .7); H.pop(5.2, .1); H.pop(5.35, .06);
});
reg("a7_fotograf", "Levererar din fotograf inläggen också?", "En fråga som får mäklaren att tänka efter.", L3, ad3, 7.4, function(H){
  H.whoosh(3.4, .8, .08); H.pop(4.3, .08); H.pop(5.4, .08); H.soft(5.3, .06); H.pop(6.6, .08);
  [0, 1, 2].forEach(function(i){ H.soft(6.6 + i*.18, .05) });
});
reg("a7_varumarke", "Dina objekt. Ditt varumärke.", "Samma foto i tre kontors färger, namn och mallar.", L4, ad4, 3.4, function(H){
  [0.9, 1.8, 2.7].forEach(function(t){ H.soft(t, .05) });
  SW.forEach(function(s){ H.whoosh(s - .22, .3, .06); H.pop(s + .1, .07) });
});
reg("a7_bilderna", "Bilderna först. Sedan resten.", "Fotohantverket först, sedan allt som följer.", L5, ad5, 2.8, function(H){
  [0, 1.65, 3.3, 4.95].forEach(function(t){ H.shutter(t + .05, .1) });
  H.whoosh(6.3, 1.0, .08); H.pop(7.5, .08); H.pop(8.6, .06); H.pop(8.75, .06);
});
reg("a7_skane", "Hela Skåne", "Malmö, Lund, Landskrona och Helsingborg.", L6, ad6, 3.0, function(H){
  [0, 1, 2, 3].forEach(function(i){ H.soft(.55 + i*1.25, .06) }); H.whoosh(5.4, .6, .06); H.pop(5.8, .07);
});

/* ---------- sidan ---------- */
function txEd(prefix, title){
  var keys = Object.keys(TX).filter(function(k){ return k.indexOf(prefix) === 0 });
  return '<details class="a3det a3cust"><summary>' + esc(title) + '</summary><div class="a3hxs">' + keys.map(function(k){ return v3TxField(k, TX[k][1]) }).join("") + '</div></details>';
}
window.secAds7 = function(){
  if(V3_ADS7.indexOf(V3S.comp) < 0){ V3S.comp = "a7_klick"; V3S.t = V3_COMPS.a7_klick.thumb; V3S.playing = false; v3StopSound() }
  if(V3S.fmt !== "916" && V3S.fmt !== "45" && V3S.fmt !== "11") V3S.fmt = "916";
  var comp = V3_COMPS[V3S.comp], fn = V3S.fmt === "916" ? "9:16 · 1080 × 1920" : V3S.fmt === "45" ? "4:5 · 1080 × 1350" : "1:1 · 1080 × 1080";
  setTimeout(v3Mount, 0);
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 15</div><h2>Annonsserie</h2>'
    + '<p>Sex korta annonser för den enskilda mäklaren på Facebook och Instagram. Målet är att de ska få veta att Viewly finns och bli nyfikna, inte att boka. Ingen musik, bara subtila ljud. Varje annons slutar som varumärkesfilmen. Förslag, inget publicerat.</p></div>'
    + '<div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w45") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '"></div>'
    + '<span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Annons</div><div class="a3segs col">' + V3_ADS7.map(function(id){ return v3Seg("comp", id, V3_COMPS[id].n, V3S.comp === id) }).join("") + '</div>'
    + '<div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Reel · 9:16", V3S.fmt === "916") + v3Seg("fmt", "45", "Flöde · 4:5", V3S.fmt === "45") + v3Seg("fmt", "11", "Kvadrat · 1:1", V3S.fmt === "11") + '</div>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + fn + ' · med ljud</button></div></div></div>'
    + '<details class="a3det a3cust"><summary>Slutet, gemensamt för alla</summary><div class="a3hxs">' + ["a7.btn", "a7.url", "a7.tag"].map(function(k){ return v3TxField(k, TX[k][1]) }).join("") + '</div></details>'
    + txEd("a7.k1", "Annons 1 · Klick. Klick.") + txEd("a7.k2", "Annons 2 · Timmar eller två klick") + txEd("a7.k3", "Annons 3 · Fotografen") + txEd("a7.k4", "Annons 4 · Varumärket")
    + txEd("a7.k5", "Annons 5 · Bilderna först") + txEd("a7.k6", "Annons 6 · Hela Skåne")
    + '<details class="a3det"><summary>Underlag, rättigheter och vad som inte är klart</summary><div class="a3und">'
    + '<div><b>Siffror och löften</b><p>"Timmar blir sekunder" är er egen beskrivning. Mät hur lång tid en mäklare lägger i dag innan annonsen går ut, så vi kan stå för formuleringen. Inga andra tal används.</p></div>'
    + '<div><b>Exempeldata</b><p>Storgatan 13, Anna Lindqvist och Nordvik är exempel, som i Ads. Kontoren i annons 4 är påhittade. Byt mot riktiga exempel innan lansering.</p></div>'
    + '<div><b>Bilder</b><p>Samma bostadsbilder som i Ads. Kontrollera att ni har rätt att använda dem i reklam.</p></div>'
    + '<div><b>Kanaler</b><p>Facebook och Instagram. Reels och Stories 9:16, flöde 4:5, och 1:1. Märk med viewly.se och spåra klick separat per annons.</p></div></div></details></div>';
};
})();
