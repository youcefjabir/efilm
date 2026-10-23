/* =====================================================================
   SIDA 15 — ANNONSBYGGARE FÖR MÄKLARE

   Mål: att den enskilda mäklaren ska få veta att Viewly finns och bli
   nyfiken. Inget erbjudande, ingen musik, bara få och diskreta ljud
   (riktiga inspelningar, CC0, från Kenney.nl). Facebook och Instagram:
   9:16, 4:5 och 1:1.

   Bilder: bara de fem ni själva skickat (RS_*). Varje annons finns i
   tre varianter, A, B och C, med olika bild i huvudrollen och olika
   öppningsrader. Exempeluppgifterna (Storgatan 13, Anna Lindqvist,
   Nordvik) är påhittade, liksom kontoren i annonsen Varumärket.

   Avstånd: ett fast system. Sidomarginal 8, glapp 5. Varje element
   registrerar sin ruta, och en test (layouttest.js) kontrollerar att
   inget överlappar eller hamnar utanför, i alla tre format.
   ===================================================================== */
(function(){
var DARK = "#050505", PAPER = C3.paper, INK = C3.ink, MUT = C3.mut || "#8a867f";
var END_L = 7.9, E_CLICK = 1.25, E_T2 = 1.9, E_T3 = 3.5;
var MX = 8, GAP = 5;
var A7 = {v:"A"};

/* ---------- era bilder ---------- */
var RS = {rs_chair:"rsChair", rs_dining:"rsDining", rs_kitchen:"rsKitchen", rs_statue:"rsStatue", rs_floor:"rsFloor"};
Object.keys(RS).forEach(function(k){ V3_KEYS[k] = RS[k] });
V3_POS.rs_chair = [.5, .5]; V3_POS.rs_dining = [.5, .55]; V3_POS.rs_kitchen = [.62, .42]; V3_POS.rs_statue = [.5, .6]; V3_POS.rs_floor = [.5, .5];
/* A: stolen och tavlorna först (prio 1), B: matplatsen först (prio 2), C: detaljer först */
var PH = {A:["rs_chair", "rs_dining", "rs_kitchen", "rs_floor", "rs_statue"], B:["rs_dining", "rs_chair", "rs_statue", "rs_kitchen", "rs_floor"], C:["rs_kitchen", "rs_chair", "rs_floor", "rs_dining", "rs_statue"]};
function ph(i){ return PH[A7.v][i % 5] }

/* ---------- redigerbara texter ---------- */
var TX = {
  "a7.btn2":["Kontakta oss", "Slutet med röst · knappens text"], "a7.url2":["viewly.se", "Slutet med röst · adressen"], "a7.tag2":["Foton och färdiga inlägg. I samma leverans.", "Slutet med röst · raden efter adressen"],
  "a7.btn":["Upptäck verktygen", "Slutet · knappens text"],
  "a7.btnB":["Boka fotografering", "Slutet · knappens text när annonsen handlar om fotograf och fotografering"],
  "a7.url":["viewly.se", "Slutet · adressen efter klicket"],
  "a7.tag":["För fastighetsmäklare som vill mer.", "Slutet · raden efter adressen"],
  "a7.k1m1":["Uppgifterna finns redan", "Klick · mellanrubrik 1, rad 1"], "a7.k1m2":["i bokningen.", "Klick · mellanrubrik 1, rad 2"],
  "a7.k1n1":["Välj bild.", "Klick · mellanrubrik 2, rad 1"], "a7.k1n2":["Välj mall.", "Klick · mellanrubrik 2, rad 2"],
  "a7.k1k1":["Klart.", "Klick · slutrubrik, rad 1"], "a7.k1k2":["Tre format på en gång.", "Klick · slutrubrik, rad 2"],
  "a7.k3s1":["Vi gör det.", "Fotografen · svar, rad 1"], "a7.k3s2":["Foton och färdiga inlägg.", "Fotografen · svar, rad 2"],
  "a7.k5b1":["Sedan fixar vi", "Bilderna först · rubrik, rad 1"], "a7.k5b2":["resten.", "Bilderna först · rubrik, rad 2"],
  "a7.k6a":["BOSTADSFOTOGRAFI I", "Skåne · liten rad"], "a7.k6s2":["Foton och färdiga inlägg.", "Skåne · slutrad 2"]
};
/* öppningsrader per variant */
var HOOK = {
  klick:{n:"Klick", A:["Det här inlägget", "tog två klick."], B:["Från foto", "till inlägg på två klick."], C:["Ett foto.", "Ett inlägg. Två klick."]},
  fotograf:{n:"Fotografen", A:["Levererar din fotograf", "inläggen också?"], B:["Får du inläggen", "av din fotograf?"], C:["Din fotograf tar bilderna.", "Vem gör inläggen?"]},
  varumarke:{n:"Varumärket", A:["Dina objekt.", "Ditt varumärke."], B:["Ditt namn.", "Din färg. Din logga."], C:["Samma foto.", "Ditt varumärke."]},
  bilderna:{n:"Bilderna först", A:["Bilderna först."], B:["Först bilden."], C:["Hantverket först."]},
  skane:{n:"Skåne", A:["Hela Skåne.", "Foton och färdiga inlägg."], B:["Skåne runt.", "Foton och färdiga inlägg."], C:["Där du finns.", "Foton och färdiga inlägg."]},
  faser:{n:"Fyra faser", A:["Ett objekt.", "Fyra inlägg."], B:["Kommande, till salu,", "visning och såld."], C:["Samma foto.", "Varje fas."]},
  format:{n:"Alla format", A:["Ett inlägg.", "Alla format."], B:["Story, flöde", "och kvadrat."], C:["Skapat en gång.", "I alla format."]},
  leverans:{n:"Leverans", A:["Din kampanj", "är klar."], B:["Allt i en", "leverans."], C:["Bilder och inlägg.", "Samma leverans."]}
};
Object.keys(HOOK).forEach(function(id){ ["A", "B", "C"].forEach(function(v){ HOOK[id][v].forEach(function(s, i){ var k = "a7." + id + "." + v + "." + (i + 1); TX[k] = [s, HOOK[id].n + " · " + v + " · rad " + (i + 1)] }) }) });
Object.keys(TX).forEach(function(k){ V3_TXD[k] = TX[k][0] });
var T = function(k){ return v3t(k) };
function hook(id, i){ return T("a7." + id + "." + (A7.vo ? "A" : A7.v) + "." + (i + 1)) }

/* ---------- ljud: riktiga inspelningar ---------- */
var SND = V3_SND;
var VOB = {}, VOB_P = null, VO_NAMES = ["k1", "k2", "k3", "k4", "k5", "k6", "f1", "f2", "f3", "f4", "m1", "m2", "m3", "p1", "p2"];
function loadAudio(){
  if(!VOB_P){
    var AC = window.AudioContext || window.webkitAudioContext, ctx = window.__a7ac || (window.__a7ac = new AC());
    VOB_P = Promise.all(VO_NAMES.map(function(n){
      return fetch("media/vo4/" + n + ".mp3").then(function(r){ return r.arrayBuffer() }).then(function(ab){ return new Promise(function(res, rej){ var q = ctx.decodeAudioData(ab, res, rej); if(q && q.then) q.then(res, rej) }) }).then(function(b){ VOB[n] = b }).catch(function(){});
    }));
  }
  return Promise.all([v3SfxLoad(), VOB_P, window.A7K ? A7K.loadVo(["c4"], "media/vo5/") : null]);
}

/* ---------- testläge: varje element registrerar sin ruta ---------- */
var DBG = null, SG = {u:1, ox:0, oy:0};
function reg(n, x, y, w, h, o){ if(DBG) DBG.push({n:n, x:SG.ox + x*SG.u, y:SG.oy + y*SG.u, w:w*SG.u, h:h*SG.u, o:o || {}}) }
window.__a7test = function(on){ DBG = on ? [] : null; return DBG };
window.__a7rects = function(){ return DBG };

/* ---------- gemensamma delar ---------- */
function rr(c, x, y, w, h, r){ c.beginPath(); if(c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h) }
function box(G){ var y0 = G.top + (G.is9 ? 3 : 4), y1 = G.H - G.bot - (G.is9 ? 3 : 4); return {y0:y0, y1:y1, h:y1 - y0} }
function hsz(G){ return G.is9 ? 10 : (G.H > 110 ? 8.2 : 6.8) }
function headBlock(c, G, t, a0, a1, l1, l2, o){
  o = o || {}; var B = box(G), s = hsz(G)*(o.k || 1), a = ioC(k3(t, a0, a0 + .5))*(1 - ioC(k3(t, a1 - .3, a1)));
  if(a <= 0) return; var y = B.y0 + s*1.05;
  if(DBG && a > .5) DBG.push({n:"rubrik", x:MX, y:B.y0, w:100 - 2*MX, h:s*(l2 ? 2.25 : 1.3), o:{head:1}});
  v3Text(c, l1, 50, y, {size:s, color:o.c1 || INK, align:"c", alpha:a, p:oQ(k3(t, a0, a0 + .8)), rise:2});
  if(l2) v3Text(c, l2, 50, y + s*1.18, {size:s, italic:true, color:o.c2 || C3.oli, align:"c", alpha:a, p:oQ(k3(t, a0 + .3, a0 + 1.1)), rise:2});
}
/* en virtuell scen på 100 × 84 under rubriken, nedskalad om utrymmet är mindre */
function stageGeom(G){ var B = box(G), headH = hsz(G)*2.45 + 2, y = B.y0 + headH, h = B.y1 - y, u = Math.min(1, h/84); return {u:u, ox:50 - 50*u, oy:y + (h - 84*u)/2, y0:y, y1:B.y1} }
function stage(c, G, fn){ var g = stageGeom(G); SG = g; c.save(); c.translate(g.ox, g.oy); c.scale(g.u, g.u); fn(); c.restore() }
function stageRect(G, x, y, w, h){ var g = stageGeom(G); return [g.ox + x*g.u, g.oy + y*g.u, w*g.u, h*g.u] }
function path(t, keys){
  var i = 0; while(i < keys.length - 2 && t >= keys[i + 1][0]) i++;
  var a = keys[i], b = keys[i + 1], p = ioC(k3(t, a[0], b[0]));
  return [lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
}
function post(c, x, y, w, ar, prog, o, style, phase, photo){ v3Post(c, style || "overlay", phase || "tillsalu", photo || ph(0), x, y, w, ar, prog, o) }
function chip(c, x, y, w, h, label, on, a){
  if(a > .5) reg("chip", x, y, w, h);
  c.save(); c.globalAlpha = a; c.strokeStyle = "rgba(28,28,30,.22)"; c.lineWidth = .18; rr(c, x, y, w, h, h/2); c.stroke();
  if(on > 0){ c.globalAlpha = a*on; c.fillStyle = INK; rr(c, x, y, w, h, h/2); c.fill() }
  c.restore();
  v3Text(c, label, x + w/2, y + h*.62, {size:h*.27, weight:600, f:"sans", sp:.1, color:on > .5 ? "#fff" : INK, align:"c", alpha:a});
}
var FIELDS = [["ADRESS", "Storgatan 13"], ["OMRÅDE", "Landskrona"], ["RUM", "4 rum"], ["YTA", "112 m²"], ["MÄKLARE", "Anna Lindqvist"], ["KONTOR", "Nordvik"]];
/* bokningen: ett stort kort, och sedan en smal rad */
function bookCard(c, x, y, a, hi){
  var W = 84, H = 38, pos = [], i, col, row, fx, fy;
  if(a > .5) reg("bokning", x, y, W, H);
  c.save(); c.translate(x, y);
  c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.14)"; c.shadowBlur = 7; c.shadowOffsetY = 1.6; c.fillStyle = "#fff"; rr(c, 0, 0, W, H, 3); c.fill(); c.restore();
  v3Text(c, "BOKNING", 6, 7.5, {size:1.5, weight:600, f:"sans", sp:.3, color:MUT, alpha:a});
  for(i = 0; i < 6; i++){
    col = i % 2; row = (i/2) | 0; fx = 6 + col*40; fy = 15 + row*8.4;
    v3Text(c, FIELDS[i][0], fx, fy, {size:1.25, weight:600, f:"sans", sp:.2, color:MUT, alpha:a});
    v3Text(c, FIELDS[i][1], fx, fy + 4.3, {size:2.9, color:INK, alpha:a});
    if(hi && hi[i] > 0) v3Line(c, fx, fx + 30, fy + 5.6, C3.oli, .35, 1, a*hi[i]);
    pos.push([x + fx + 8, y + fy + 3]);
  }
  c.restore(); return pos;
}
function bookStrip(c, x, y, a, hi){
  var W = 84, H = 10, pos = [[x + 16, y + 5], [x + 30, y + 5], [x + 52, y + 5], [x + 62, y + 5], [x + 72, y + 5], [x + 80, y + 5]];
  if(a > .5) reg("bokningsrad", x, y, W, H);
  c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.12)"; c.shadowBlur = 5; c.shadowOffsetY = 1.2; c.fillStyle = "#fff"; rr(c, x, y, W, H, 2.6); c.fill(); c.restore();
  v3Text(c, "Storgatan 13, Landskrona", x + 5, y + 6.1, {size:2.8, color:INK, alpha:a});
  v3Text(c, "4 rum · 112 m² · Anna Lindqvist", x + W - 5, y + 5.9, {size:1.6, weight:500, f:"sans", color:MUT, align:"r", alpha:a});
  if(hi){ var m = 0; hi.forEach(function(v){ m = Math.max(m, v) }); if(m > 0) v3Line(c, x + 5, x + W - 5, y + H - 1.4, C3.oli, .35, 1, a*m) }
  return pos;
}
function thumb(c, key, x, y, w, h, a, state){
  if(a > .5) reg("bild", x, y, w, h, {child:1});
  c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 4; c.shadowOffsetY = 1; c.fillStyle = "#fff"; rr(c, x - .7, y - .7, w + 1.4, h + 1.4, 1.6); c.fill(); c.restore();
  c.save(); c.globalAlpha = a; rr(c, x, y, w, h, 1.2); c.clip(); v3Photo(c, key, x, y, w, h, {scale:1.1}); c.restore();
  if(state > 0){ c.save(); c.globalAlpha = a*state; c.strokeStyle = INK; c.lineWidth = .5; rr(c, x - .7, y - .7, w + 1.4, h + 1.4, 1.6); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(x + 3.8, y + 3.8, 2.1, 0, 7); c.fill(); c.restore();
    v3Text(c, "1", x + 3.8, y + 4.6, {size:2.3, weight:600, f:"sans", color:"#fff", align:"c", alpha:a*state}) }
}
function tick(c, x, y, r, p, col){ if(p <= 0) return; c.save(); c.strokeStyle = col || INK; c.lineWidth = r*.28; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(x - r*.5, y); c.lineTo(x - r*.1, y + r*.42*Math.min(1, p*2)); if(p > .5) c.lineTo(x - r*.1 + (r*.75)*(p - .5)*2, y + r*.42 - r*.95*(p - .5)*2); c.stroke(); c.restore() }
/* tre format bredvid varandra, med samma avstånd och gemensam underkant */
var ROW = {story:{x:6, w:22, ar:1.778}, feed:{x:33, w:30, ar:1.25}, sq:{x:68, w:26, ar:1}};
function rowRect(k, bottom){ var r = ROW[k]; return {x:r.x, y:bottom - r.w*r.ar, w:r.w, h:r.w*r.ar} }
function postBox(c, x, y, w, ar, prog, o, style, phase, photo, name){
  if(name !== null) reg(name || "inlägg", x, y, w, w*ar);
  post(c, x, y, w, ar, prog, o, style, phase, photo);
}

/* ---------- slutet, som i varumärkesfilmen ---------- */
function endSeq(c, G, t, e0, cta){
  var u0 = t - e0; if(u0 < 0) return;
  if(cta && cta.logo){ v3Fill(c, 0, 0, 100, G.H, "#050505", ioC(k3(u0, 0, .7))); if(u0 >= .55) endLogo(c, G, u0 - .55); if(cta.tag){ var tgA = ioC(k3(u0, 2.55, 3.2)), tgS = G.is9 ? 3.7 : 3.4; if(tgA > 0) v3Text(c, T(cta.tag), 50, G.cy + (G.is9 ? 12.5 : 11) + tgS*.34 + (1 - tgA)*1.2, {size:tgS, weight:500, f:"sans", sp:.03, color:"#e9eadf", align:"c", alpha:tgA*.9}) } return }
  var kb = cta ? "a7.btn2" : "a7.btn", ku = cta ? "a7.url2" : "a7.url", kt = cta ? "a7.tag2" : "a7.tag";
  if(cta && cta.b){ kb = cta.b; ku = cta.u || "a7.url"; kt = cta.t || "a7.tag" }
  var H = G.H, cx = 50, cy = G.cy, w = G.is9 ? 66 : 58, h = G.is9 ? 10.4 : 9, ts = h*.3;
  var bgA = cta && cta.over ? ioC(k3(u0, E_CLICK + .05, E_CLICK + .75)) : ioC(k3(u0, 0, .5)), ap = oQ(k3(u0, .3, .8)), press = k3(u0, E_CLICK - .1, E_CLICK)*(1 - k3(u0, E_CLICK + .08, E_CLICK + .26)), gone = ioC(k3(u0, E_CLICK + .08, E_CLICK + .26));
  v3Fill(c, 0, 0, 100, H, "#050505", bgA);
  if(gone < 1){
    var bw = w*(1 - .05*press), bh = h*(1 - .05*press), a = ap*(1 - gone);
    c.save(); c.translate(cx, cy); c.scale(1 + .05*gone, 1 + .05*gone); c.translate(-cx, -cy);
    c.save(); c.globalAlpha = a; c.shadowColor = "rgba(255,255,255," + (.18 + .08*Math.sin(u0*5)) + ")"; c.shadowBlur = 7; c.shadowOffsetY = 1.2;
    var bg = c.createLinearGradient(0, cy - bh/2, 0, cy + bh/2); bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "#cfcfcf");
    c.fillStyle = bg; rr(c, cx - bw/2, cy - bh/2, bw, bh, bh/2); c.fill(); c.restore();
    v3Text(c, T(kb), cx, cy + ts*.34, {size:ts, weight:500, f:"sans", sp:.02, color:"#0a0a0a", align:"c", alpha:a});
    c.restore();
    var cp = ioC(k3(u0, E_CLICK - .85, E_CLICK - .08)), curX = lerp(106, cx + w*.21, cp), curY = lerp(H - (G.is9 ? 20 : 8), cy + h*.33, cp) - Math.sin(cp*Math.PI)*4;
    v3Cursor(c, curX, curY, press, k3(u0, E_CLICK - .85, E_CLICK - .6)*(1 - k3(u0, E_CLICK + .3, E_CLICK + .55)));
    v3Tap(c, cx + w*.21, cy + h*.33, k3(u0, E_CLICK - .02, E_CLICK + .5));
  }
  var T1 = E_CLICK + .2, T2 = E_CLICK + E_T2, T3 = E_CLICK + E_T3, ts2 = G.is9 ? 6.4 : 5.8;
  var aA = ioC(k3(u0, T1, T1 + .3))*(1 - ioC(k3(u0, T2 - .3, T2)));
  if(aA > 0) v3Text(c, T(ku), cx, cy + ts2*.34 + (1 - ioC(k3(u0, T1, T1 + .3)))*1.2 - ioC(k3(u0, T2 - .3, T2))*1.2, {size:ts2, weight:500, f:"sans", sp:.01, color:"#fff", align:"c", alpha:aA});
  var aB = ioC(k3(u0, T2, T2 + .45))*(1 - ioC(k3(u0, T3 - .3, T3)));
  if(aB > 0){
    var tg = T(kt), sz = ts2*.8, mw = v3Measure(c, tg, {size:sz, weight:500, f:"sans", sp:.01});
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
  v3Mark(c, x0, cy - mh/2, mh, "#fff", C3.dotL, {reveal:ioC(k3(u, .05, .8)), dot:oBack(k3(u, .75, 1.05)), alpha:ioC(k3(u, 0, .25))});
  c.restore();
  var by = cy + capH/2 + capH*.02, wx = fx + mw + gap, i, str = "VIEWLY", x = wx;
  for(i = 0; i < str.length; i++){
    var lp = oQ(k3(u, 1.15 + i*.07, 1.15 + i*.07 + .45));
    v3Text(c, str[i], x, by, {size:fs, weight:500, f:"sans", color:"#fff", p:lp, rise:capH*.5});
    x += c.measureText(str[i]).width + .2*fs;
  }
}

/* =====================================================================
   1 · KLICK — resultatet först, sedan hur
   ===================================================================== */
var L1 = 11.8, D1 = 1.6;
function ad1(c, G, t0, Lx){
  var t = t0 - D1;
  v3Fill(c, 0, 0, 100, G.H, PAPER);
  headBlock(c, G, t0, .1, 1.9, hook("klick", 0), hook("klick", 1));
  if(t0 < 1.9) stage(c, G, function(){
    var ex = ioC(k3(t0, 1.3, 1.85)), sc = lerp(.92, 1, oQ(k3(t0, .05, .6)))*lerp(1, .5, ex), cy = lerp(42, 76, ex);
    c.save(); c.translate(50, cy); c.scale(sc, sc); c.translate(-50, -cy); postBox(c, 27, 12.25, 46, 1.25, 1, null, "overlay", "tillsalu", ph(0), "resultat"); c.restore();
  });
  headBlock(c, G, t, .2, 2.6, T("a7.k1m1"), T("a7.k1m2"));
  headBlock(c, G, t, 2.6, 7.3, T("a7.k1n1"), T("a7.k1n2"));
  headBlock(c, G, t, 7.4, (Lx || L1) - D1, T("a7.k1k1"), T("a7.k1k2"));
  stage(c, G, function(){
    var inA = ioC(k3(t, .3, 1.0)), dock = ioC(k3(t, 2.4, 3.1)), i;
    var hi = [0, 1, 2, 3, 4, 5].map(function(j){ return ioC(k3(t, 5.7 + j*.1, 6.0 + j*.1))*(1 - ioC(k3(t, 6.9, 7.3))) });
    var stripA = ioC(k3(t, 2.75, 3.15))*(1 - ioC(k3(t, 7.5, 8.0)));
    var fieldPos = bookStrip(c, 8, 0, stripA, hi);
    if(dock < .98) bookCard(c, 8, lerp(23 + (1 - inA)*4, 8, dock), inA*(1 - ioC(k3(t, 2.4, 2.8))), null);
    /* tre bilder, rad för rad med samma avstånd */
    var ta = ioC(k3(t, 2.8, 3.4))*(1 - ioC(k3(t, 5.7, 6.1))), sel = ioC(k3(t, 3.9, 4.15)), keys = [ph(1), ph(0), ph(2)];
    for(i = 0; i < 3; i++) thumb(c, keys[i], 8 + i*29, 15 + (1 - ta)*3, 26, 31, ta*(i === 1 ? 1 : 1 - .55*sel), i === 1 ? sel : 0);
    var ca = ioC(k3(t, 4.5, 5.0))*(1 - ioC(k3(t, 5.7, 6.1))), cs = ioC(k3(t, 5.6, 5.85)), labs = ["Kommande", "Till salu", "Såld"];
    for(i = 0; i < 3; i++) chip(c, 8 + i*29, 51, 26, 8, labs[i], i === 1 ? cs : 0, ca);
    /* inlägget växer fram under raden, och blir sedan tre format */
    var pa = ioC(k3(t, 5.9, 6.4)), prog = k3(t, 6.0, 7.5), morph = oBack(k3(t, 7.6, 8.6));
    if(pa > 0){
      var main = {x:lerp(27, ROW.feed.x, morph), y:lerp(16, 64 - ROW.feed.w*1.25, morph), w:lerp(46, ROW.feed.w, morph)};
      if(morph > 0){
        var sr = rowRect("story", 64), qr = rowRect("sq", 64), s2 = Math.min(1, morph);
        var fin1 = morph >= .97;
        postBox(c, lerp(main.x, sr.x, s2), lerp(main.y, sr.y, s2), lerp(main.w, sr.w, s2), 1.778, 1, null, "overlay", "tillsalu", ph(0), fin1 ? "story" : null);
        postBox(c, lerp(main.x, qr.x, s2), lerp(main.y, qr.y, s2), lerp(main.w, qr.w, s2), 1, 1, null, "overlay", "tillsalu", ph(0), fin1 ? "kvadrat" : null);
      }
      var sc2 = lerp(.9, 1, oQ(k3(t, 5.9, 6.6)));
      c.save(); c.translate(50, 45); c.scale(sc2, sc2); c.translate(-50, -45);
      postBox(c, main.x, main.y, main.w, 1.25, morph > 0 ? 1 : prog, morph > 0 ? null : {skel:"auto"}, "overlay", "tillsalu", ph(0), morph > 0 && morph < .97 ? null : "flöde"); c.restore();
      var la = ioC(k3(t, 8.4, 8.9)); ["Story 9:16", "Flöde 4:5", "Kvadrat 1:1"].forEach(function(l, j){ var r = [ROW.story, ROW.feed, ROW.sq][j]; v3Text(c, l, r.x + r.w/2, 70.5, {size:1.7, weight:600, f:"sans", sp:.1, color:MUT, align:"c", alpha:la}); if(la > .5) reg("etikett", r.x, 68.5, r.w, 3) });
    }
    /* uppgifterna flyger från raden in i mallen */
    for(i = 0; i < 6; i++){
      var fp = k3(t, 5.95 + i*.09, 6.7 + i*.09); if(fp <= 0 || fp >= 1) continue;
      var tx = 34 + (i % 3)*13, ty = 62 + ((i/3) | 0)*5, e = ioC(fp), x = lerp(fieldPos[i][0], tx, e), y = lerp(fieldPos[i][1], ty, e) - Math.sin(e*Math.PI)*6;
      c.save(); c.globalAlpha = Math.sin(fp*Math.PI)*.95; c.fillStyle = C3.oli; c.beginPath(); c.arc(x, y, .9, 0, 7); c.fill(); c.restore();
    }
    var cur = path(t, [[2.9, 108, 56], [3.85, 50, 46], [4.9, 50, 46], [5.55, 50, 55], [6.3, 62, 78]]), ca2 = k3(t, 2.9, 3.2)*(1 - k3(t, 5.95, 6.4));
    v3Cursor(c, cur[0], cur[1], Math.max(k3(t, 3.8, 3.9)*(1 - k3(t, 4.05, 4.2)), k3(t, 5.5, 5.6)*(1 - k3(t, 5.75, 5.9))), ca2);
    v3Tap(c, 50, 46, k3(t, 3.85, 4.5)); v3Tap(c, 50, 55, k3(t, 5.55, 6.2));
  });
}
function snd1(H){
  var d = D1;
  H.s("shutter", .2, .55);
  [0, 1, 2, 3, 4].forEach(function(i){ H.s("tick1", d + 2.9 + i*.1, .18) });
  H.click(d + 3.85, .9);
  H.click(d + 5.6, .9);
  [0, 1, 2, 3, 4, 5].forEach(function(i){ H.s("tick1", d + 6.65 + i*.09, .2) });
  H.s("shutter2", d + 7.7, .6);
}

/* =====================================================================
   2 · FOTOGRAFEN — frågan, sedan svaret
   ===================================================================== */
var L3 = 9.6;
function ad3(c, G, t, Lx, sh){
  var H = G.H, dark = 1 - ioC(k3(t, 3.5, 4.2));
  v3Fill(c, 0, 0, 100, H, PAPER);
  if(dark > 0){
    c.save(); c.globalAlpha = dark; v3Photo(c, ph(0), 0, 0, 100, H, {scale:lerp(1.05, 1.16, k3(t, 0, 3.8)), pos:V3_POS[ph(0)]}); c.restore();
    v3Fill(c, 0, 0, 100, H, "#0c0a0a", .55*dark);
    var s = G.is9 ? 10.4 : (H > 110 ? 8.6 : 7.4), B = box(G), y = B.y0 + B.h*.42;
    var ta = 1 - ioC(k3(t, 2.8, 3.3));
    v3Text(c, hook("fotograf", 0), 50, y, {size:s, color:"#fff", align:"c", alpha:ta, p:oQ(k3(t, .5, 1.8)), rise:2, shadow:true});
    v3Text(c, hook("fotograf", 1), 50, y + s*1.2, {size:s, italic:true, color:C3.cream, align:"c", alpha:ta, p:oQ(k3(t, 1.5, 2.8)), rise:2, shadow:true});
  }
  headBlock(c, G, t, 4.3, Lx || L3, T("a7.k3s1"), T("a7.k3s2"));
  if(t < 3.9) return;
  var t0 = t;
  stage(c, G, function(){
    var t = t0 - (sh || 0);
    var a = ioC(k3(t, 4.5, 5.1)), i;
    reg("leverans", 8, 3, 84, 78);
    c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.14)"; c.shadowBlur = 7; c.shadowOffsetY = 1.6; c.fillStyle = "#fff"; rr(c, 8, 3 + (1 - a)*3, 84, 78, 3); c.fill(); c.restore();
    v3Text(c, "LEVERANS · STORGATAN 13", 14, 12, {size:1.5, weight:600, f:"sans", sp:.3, color:MUT, alpha:a});
    var r1 = ioC(k3(t, 5.0, 5.5)); v3Text(c, "12 bilder levererade", 14, 22, {size:3.6, color:INK, alpha:a*r1});
    c.save(); c.globalAlpha = r1; c.fillStyle = INK; c.beginPath(); c.arc(84, 20.4, 3, 0, 7); c.fill(); c.restore(); tick(c, 84.2, 20.2, 2.4, k3(t, 5.4, 5.8), "#fff");
    var pk = [ph(0), ph(1), ph(2), ph(3)];
    for(i = 0; i < 4; i++){ var pa = ioC(k3(t, 5.2 + i*.1, 5.6 + i*.1)); thumb(c, pk[i], 14 + i*18.67, 27 + (1 - pa)*2, 16, 10, a*pa, 0) }
    var r2 = ioC(k3(t, 6.2, 6.7)); v3Text(c, "3 inlägg klara", 14, 48, {size:3.6, color:INK, alpha:a*r2});
    c.save(); c.globalAlpha = r2; c.fillStyle = INK; c.beginPath(); c.arc(84, 46.4, 3, 0, 7); c.fill(); c.restore(); tick(c, 84.2, 46.2, 2.4, k3(t, 6.6, 7.0), "#fff");
    var sty = [["badge", "kommande"], ["overlay", "tillsalu"], ["editorial", "sald"]];
    for(i = 0; i < 3; i++){ var qa = ioC(k3(t, 6.4 + i*.18, 6.9 + i*.18)); if(qa > .02){ var sq = lerp(.85, 1, qa), qx = 14 + i*26 + 10, qy = 53 + 12.5; c.save(); c.translate(qx, qy); c.scale(sq, sq); c.translate(-qx, -qy); postBox(c, 14 + i*26, 53, 20, 1.25, 1, null, sty[i][0], sty[i][1], ph(i), "mini"); c.restore() } }
  });
}
function snd3(H){
  H.s("shutter", 4.5, .55);
  [5.4, 6.6].forEach(function(t){ H.s("tick1", t, .25) });
}

/* =====================================================================
   3 · VARUMÄRKET — samma foto, olika kontor
   ===================================================================== */
var L4 = 9.6;
var PROF = [
  {off:{name:"NORDVIK", sub:"MÄKLARBYRÅ", accent:"#2F6F6B", accentL:"#9CC7C0"}, mk:"Anna Lindqvist"},
  {off:{name:"HAMNEN", sub:"FASTIGHETER", accent:"#3a3a3c", accentL:"#cfcbc5"}, mk:"Marcus Ek"},
  {off:{name:"KUSTEN", sub:"MÄKLARE", accent:"#6E7266", accentL:"#c3cab4"}, mk:"Sara Holm"}
];
function withProfile(p, fn){
  var o0 = {name:OFF.name, sub:OFF.sub, accent:OFF.accent, accentL:OFF.accentL}, m0 = V3_OBJ.maklare;
  OFF.name = p.off.name; OFF.sub = p.off.sub; OFF.accent = p.off.accent; OFF.accentL = p.off.accentL; V3_OBJ.maklare = p.mk;
  try { fn() } finally { OFF.name = o0.name; OFF.sub = o0.sub; OFF.accent = o0.accent; OFF.accentL = o0.accentL; V3_OBJ.maklare = m0 }
}
var SW = [2.3, 5.0];
function ad4(c, G, t, Lx, o4){
  o4 = o4 || {}; var SWx = o4.sw || SW, c0 = o4.c0 == null ? .9 : o4.c0, cd = o4.cd == null ? .9 : o4.cd;
  v3Fill(c, 0, 0, 100, G.H, PAPER);
  headBlock(c, G, t, .2, Lx || L4, hook("varumarke", 0), hook("varumarke", 1));
  stage(c, G, function(){
    var pi = t >= SWx[1] ? 2 : t >= SWx[0] ? 1 : 0, sx = 1, i;
    for(i = 0; i < SWx.length; i++){ var d = Math.abs(t - SWx[i]); if(d < .22) sx = d/.22 }
    var a = ioC(k3(t, .3, .9)), p = PROF[pi], pw = 48*Math.max(.02, sx);
    if(a > .02) withProfile(p, function(){ postBox(c, 50 - pw/2, 4, pw, 1.25, 1, null, "overlay", "tillsalu", ph(pi), "inlägg") });
    var labs = ["Ditt namn", "Din färg", "Din logga"];
    for(i = 0; i < 3; i++){ var on = ioC(k3(t, c0 + i*cd, c0 + .3 + i*cd)); chip(c, 8 + i*29, 72, 26, 8, labs[i], on, a) }
  });
}
function snd4(H){
  SW.forEach(function(s){ H.click(s - .05, .7) });
}

/* =====================================================================
   4 · BILDERNA FÖRST — hantverket, sedan resten
   ===================================================================== */
var L5 = 10.6;
function ad5(c, G, t){
  var H = G.H, B = box(G), collapse = ioC(k3(t, 6.4, 7.5));
  v3Fill(c, 0, 0, 100, H, PAPER);
  var tgt = stageRect(G, 26, 4, 48, 60), r = [lerp(0, tgt[0], collapse), lerp(0, tgt[1], collapse), lerp(100, tgt[2], collapse), lerp(H, tgt[3], collapse)];
  var P5 = [ph(0), ph(1), ph(2), ph(3)];
  if(t < 7.6){
    c.save(); rr(c, r[0], r[1], r[2], r[3], lerp(0, 2, collapse)); c.clip();
    var k = Math.min(3, Math.floor(t/1.65)), u = k3(t, k*1.65, (k + 1)*1.65);
    v3Photo(c, P5[k], r[0], r[1], r[2], r[3], {scale:lerp(1.05, 1.16, u), pos:V3_POS[P5[k]]});
    c.restore();
    var tx = 1 - collapse;
    if(tx > .01){
      v3Grad(c, 0, H*.5, 100, H*.5, [[0, "rgba(12,10,10,0)"], [1, "rgba(12,10,10,.7)"]], tx);
      v3Text(c, "BOSTADSFOTOGRAFERING", 50, B.y0 + 1, {size:1.9, weight:500, f:"sans", sp:.3, color:"#fff", align:"c", alpha:.9*tx*ioC(k3(t, .2, .8))});
      v3Text(c, hook("bilderna", 0), 50, B.y1 - 6, {size:G.is9 ? 11 : 9, color:"#fff", align:"c", alpha:tx, p:oQ(k3(t, .5, 1.6)), rise:2, shadow:true});
    }
  }
  headBlock(c, G, t, 7.4, L5, T("a7.k5b1"), T("a7.k5b2"));
  if(t >= 7.4) stage(c, G, function(){
    var pa = ioC(k3(t, 7.5, 7.9)), morph = oBack(k3(t, 8.3, 9.2));
    var main = {x:lerp(26, ROW.feed.x, morph), y:lerp(4, 62 - ROW.feed.w*1.25, morph), w:lerp(48, ROW.feed.w, morph)};
    if(morph > 0){ var sr = rowRect("story", 62), qr = rowRect("sq", 62), s2 = Math.min(1, morph);
      var fin5 = morph >= .97;
      postBox(c, lerp(main.x, sr.x, s2), lerp(main.y, sr.y, s2), lerp(main.w, sr.w, s2), 1.778, 1, null, "overlay", "tillsalu", ph(1), fin5 ? "story" : null);
      postBox(c, lerp(main.x, qr.x, s2), lerp(main.y, qr.y, s2), lerp(main.w, qr.w, s2), 1, 1, null, "overlay", "tillsalu", ph(2), fin5 ? "kvadrat" : null) }
    if(pa > .02) postBox(c, main.x, main.y, main.w, 1.25, morph > 0 ? 1 : k3(t, 7.4, 8.2), null, "overlay", "tillsalu", ph(0), morph > 0 && morph < .97 ? null : "flöde");
    var labs = ["Annonser", "Kampanj", "Alla format"];
    for(var i = 0; i < 3; i++) chip(c, 8 + i*29, 72, 26, 8, labs[i], 0, ioC(k3(t, 8.9 + i*.2, 9.3 + i*.2)));
  });
}
function snd5(H){
  [0, 1.65, 3.3, 4.95].forEach(function(t, i){ H.s("shutter", i === 0 ? .05 : t, .75) });
  H.s("thunk", 7.5, .6);
  [8.9, 9.1, 9.3].forEach(function(t){ H.s("tick1", t, .2) });
}

/* =====================================================================
   5 · SKÅNE — var vi finns
   ===================================================================== */
var L6 = 8.6, CITIES = ["Malmö", "Lund", "Landskrona", "Helsingborg"];
function ad6(c, G, t){
  var H = G.H, B = box(G), fin = ioC(k3(t, 5.6, 6.2)), outT = ioC(k3(t, 5.2, 5.6)), inT = ioC(k3(t, 5.75, 6.3));
  v3Fill(c, 0, 0, 100, H, DARK);
  var bg = [ph(0), ph(1), ph(2), ph(3)], k = Math.min(3, Math.floor(Math.max(0, t - .5)/1.25)), t0 = .5 + k*1.25, kk, a;
  for(kk = 0; kk < 4; kk++){
    a = kk < k ? 0 : kk === k ? ioC(k3(t, t0, t0 + .25)) : 0; if(kk === k && k > 0) a = 1;
    if(kk === 0) a = Math.max(a, ioC(k3(t, 0, .6)));
    if(a > 0) v3Photo(c, bg[kk], 0, 0, 100, H, {scale:lerp(1.06, 1.16, k3(t, .5 + kk*1.25, 5.8)), pos:V3_POS[bg[kk]], alpha:a});
  }
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", .42 + .2*fin);
  var s = G.is9 ? 12 : 9.6, cy = B.y0 + B.h*.46;
  v3Text(c, T("a7.k6a"), 50, cy - s*1.15, {size:1.9, weight:500, f:"sans", sp:.3, color:"#fff", align:"c", alpha:.9*ioC(k3(t, .3, .9))*(1 - outT)});
  CITIES.forEach(function(ci, i){
    var s0 = .5 + i*1.25, va = ioC(k3(t, s0, s0 + .25))*(1 - ioC(k3(t, s0 + 1.0, s0 + 1.25)))*(1 - fin); if(i === 3) va = ioC(k3(t, s0, s0 + .25))*(1 - outT);
    if(va > 0) v3Text(c, ci, 50, cy, {size:s, color:"#fff", align:"c", alpha:va, p:oQ(k3(t, s0, s0 + .5)), rise:2, shadow:true});
  });
  if(inT > 0){
    v3Text(c, hook("skane", 0), 50, cy, {size:s, color:"#fff", align:"c", alpha:inT, p:oQ(k3(t, 5.8, 6.6)), rise:2, shadow:true});
    v3Text(c, T("a7.k6s2"), 50, cy + s*.95, {size:s*.58, italic:true, color:C3.cream, align:"c", alpha:inT, p:oQ(k3(t, 6.2, 7.0)), rise:2, shadow:true});
  }
}
function snd6(H){
  [0, 1, 2, 3].forEach(function(i){ H.s("shutter", i === 0 ? .1 : .5 + i*1.25, .75) });
}

/* =====================================================================
   6 · FYRA FASER — ett objekt, fyra inlägg
   ===================================================================== */
var L7 = 10.0, PHASES = [["Kommande", "badge", "kommande"], ["Till salu", "overlay", "tillsalu"], ["Visning", "overlay", "visning"], ["Såld", "editorial", "sald"]];
function ad7(c, G, t, Lx, o7){
  o7 = o7 || {};
  v3Fill(c, 0, 0, 100, G.H, PAPER);
  headBlock(c, G, t, .2, Lx || L7, hook("faser", 0), hook("faser", 1));
  stage(c, G, function(){
    var a = ioC(k3(t, .3, .9)), S0 = o7.S0 || 1.3, per = o7.per || 1.9, pi = Math.max(0, Math.min(3, Math.floor((t - S0 + per*.0)/per))), i;
    pi = t < S0 + per ? 0 : t < S0 + 2*per ? 1 : t < S0 + 3*per ? 2 : 3;
    var sx = 1; for(i = 1; i < 4; i++){ var d = Math.abs(t - (S0 + i*per)); if(d < .22) sx = d/.22 }
    var pw = 46*Math.max(.02, sx), ph0 = PHASES[pi];
    if(a > .02) postBox(c, 50 - pw/2, 4, pw, 1.25, 1, null, ph0[1], ph0[2], ph(pi % 3), "inlägg");
    /* en kontroll med fyra lägen, som i studion */
    reg("kontroll", 8, 68, 84, 9);
    c.save(); c.globalAlpha = a; c.strokeStyle = "rgba(28,28,30,.22)"; c.lineWidth = .18; rr(c, 8, 68, 84, 9, 4.5); c.stroke(); c.restore();
    var segW = 84/4, pos = lerp(0, 3, 0), tp = 0;
    for(i = 0; i < 4; i++){ var s = S0 + i*per; if(i > 0) tp = i; }
    var cur = pi + (t >= S0 + (pi + 1)*per - .3 && pi < 3 ? ioC(k3(t, S0 + (pi + 1)*per - .3, S0 + (pi + 1)*per)) : 0);
    c.save(); c.globalAlpha = a; c.fillStyle = INK; rr(c, 8 + cur*segW + .8, 68.8, segW - 1.6, 7.4, 3.7); c.fill(); c.restore();
    PHASES.forEach(function(ph1, j){ v3Text(c, ph1[0], 8 + j*segW + segW/2, 73.6, {size:2, weight:600, f:"sans", sp:.04, color:Math.abs(j - cur) < .5 ? "#fff" : INK, align:"c", alpha:a}) });
  });
}
function snd7(H){
  [1, 2, 3].forEach(function(i){ H.click(1.3 + i*1.9 - .05, .75) });
  H.s("shutter", .4, .4);
}

/* =====================================================================
   7 · ALLA FORMAT — ett inlägg, tre format
   ===================================================================== */
var L8 = 9.6;
function ad8(c, G, t){
  v3Fill(c, 0, 0, 100, G.H, PAPER);
  headBlock(c, G, t, .2, L8, hook("format", 0), hook("format", 1));
  stage(c, G, function(){
    var a = ioC(k3(t, .3, .9)), i, ST = [2.2, 4.2], all = ioC(k3(t, 6.0, 7.0));
    var fi = t >= ST[1] ? 2 : t >= ST[0] ? 1 : 0, sx = 1;
    for(i = 0; i < ST.length; i++){ var d = Math.abs(t - ST[i]); if(d < .2) sx = d/.2 }
    var labs = ["Flöde 4:5", "Story 9:16", "Kvadrat 1:1"], on = all > .5 ? 0 : 1;
    for(i = 0; i < 3; i++) chip(c, 8 + i*29, 2, 26, 8, labs[i], (all > .01 ? 0 : (i === fi ? 1 : 0)), a);
    var spec = [{w:46, ar:1.25}, {w:34, ar:1.778}, {w:46, ar:1}][fi], bot = 80;
    if(all < .02){
      var w = spec.w*Math.max(.02, sx), h = spec.w*spec.ar, y = bot - h - (bot - 14 - 64 > 0 ? 0 : 0), cy0 = 14 + (66 - h)/2;
      if(a > .02) postBox(c, 50 - w/2, cy0, w, spec.ar, 1, null, "overlay", "tillsalu", ph(0), "inlägg");
    } else {
      var sr = rowRect("story", 64), fr = rowRect("feed", 64), qr = rowRect("sq", 64), cs = oBack(k3(t, 6.0, 7.0));
      var st = {x:lerp(50 - 17, sr.x, cs), y:lerp(14 + (66 - 60.5)/2, sr.y, cs), w:lerp(34, sr.w, cs)}, fd = {x:lerp(50 - 23, fr.x, cs), y:lerp(14 + (66 - 57.5)/2, fr.y, cs), w:lerp(46, fr.w, cs)}, sq = {x:lerp(50 - 23, qr.x, cs), y:lerp(14 + (66 - 46)/2, qr.y, cs), w:lerp(46, qr.w, cs)};
      var fin8 = cs >= .97 ? 1 : 0;
      postBox(c, st.x, st.y, st.w, 1.778, 1, null, "overlay", "tillsalu", ph(0), fin8 ? "story" : null);
      postBox(c, sq.x, sq.y, sq.w, 1, 1, null, "overlay", "tillsalu", ph(0), fin8 ? "kvadrat" : null);
      postBox(c, fd.x, fd.y, fd.w, 1.25, 1, null, "overlay", "tillsalu", ph(0), fin8 ? "flöde" : null);
    }
  });
}
function snd8(H){
  [2.2, 4.2].forEach(function(s){ H.click(s - .05, .75) });
  H.s("thunk", 6.3, .5);
}

/* =====================================================================
   8 · LEVERANS — kampanjen är klar
   ===================================================================== */
var L9 = 9.2;
function ad9(c, G, t){
  v3Fill(c, 0, 0, 100, G.H, PAPER);
  headBlock(c, G, t, .2, L9, hook("leverans", 0), hook("leverans", 1));
  stage(c, G, function(){
    var i, sty = [["badge", "kommande"], ["overlay", "tillsalu"], ["editorial", "sald"]], w = 26;
    for(i = 0; i < 3; i++){
      var qa = ioC(k3(t, .6 + i*.25, 1.2 + i*.25));
      if(qa > .02){ var sq = lerp(.85, 1, qa), qx = 6 + i*31 + w/2, qy = 6 + w*1.25/2; c.save(); c.translate(qx, qy); c.scale(sq, sq); c.translate(-qx, -qy); postBox(c, 6 + i*31, 6, w, 1.25, 1, null, sty[i][0], sty[i][1], ph(i), "inlägg"); c.restore() }
    }
    var ba = ioC(k3(t, 2.4, 3.0)), bw = 62, bx = 19, by = 50, bh = 10, press = k3(t, 4.4, 4.5)*(1 - k3(t, 4.6, 4.75)), prog = ioC(k3(t, 4.7, 6.0)), done = ioC(k3(t, 6.0, 6.4));
    reg("knapp", bx, by, bw, bh);
    c.save(); c.globalAlpha = ba; c.fillStyle = INK; var ww = bw*(1 - .03*press); rr(c, 50 - ww/2, by + bh*(1 - (1 - .03*press))/2, ww, bh*(1 - .03*press), bh/2); c.fill(); c.restore();
    if(prog > 0 && done < 1){ c.save(); c.globalAlpha = ba*(1 - done); c.fillStyle = C3.oli; rr(c, bx + 1.2, by + 1.2, (bw - 2.4)*prog, bh - 2.4, (bh - 2.4)/2); c.fill(); c.restore() }
    v3Text(c, done > .5 ? "Nedladdat" : "Ladda ner alla 3", 50, by + bh*.62, {size:3, weight:600, f:"sans", sp:.04, color:"#fff", align:"c", alpha:ba});
    tick(c, bx + bw - 9, by + bh*.55, 3, done > .5 ? k3(t, 6.1, 6.5) : 0, "#fff");
    v3Text(c, "Tre mallar. Alla format.", 50, 68, {size:2.1, weight:500, f:"sans", sp:.1, color:MUT, align:"c", alpha:ioC(k3(t, 5.4, 6.0))}); reg("etikett", 20, 65.5, 60, 3.5);
    var cur = path(t, [[3.0, 106, 74], [4.4, 62, by + bh*.5 + 2], [6.4, 70, 66]]);
    v3Cursor(c, cur[0], cur[1], press, k3(t, 3.0, 3.3)*(1 - k3(t, 6.0, 6.5)));
    v3Tap(c, 62, by + bh*.5 + 2, k3(t, 4.4, 5.0));
  });
}
function snd9(H){
  H.click(4.4, .9);
  H.s("shutter", 6.05, .55);
}

/* ---------- ljudet ---------- */
function makeMix(sched){
  return function(ctx, comp){
    var DUR = comp.dur, master = ctx.createGain(); master.gain.value = .9;
    var cmp = ctx.createDynamicsCompressor(); cmp.threshold.value = -16; cmp.ratio.value = 2;
    var lim = ctx.createDynamicsCompressor(); lim.threshold.value = -2; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .08; lim.knee.value = 0;
    var fade = ctx.createGain(); fade.gain.setValueAtTime(1, Math.max(0, DUR - .6)); fade.gain.linearRampToValueAtTime(0, DUR);
    master.connect(cmp); cmp.connect(lim); lim.connect(fade); fade.connect(ctx.destination);
    var H = {};
    H.s = function(name, t, v, rate){ var b = SND[name]; if(!b) return; var src = ctx.createBufferSource(); src.buffer = b; if(rate) src.playbackRate.value = rate; var g = ctx.createGain(); g.gain.value = v == null ? 1 : v; src.connect(g); g.connect(master); src.start(Math.max(0, t)) };
    H.click = function(t, v){ H.s("down", t, v); H.s("up", t + .085, v*.75) };
    (comp.vo || []).forEach(function(l){ var b = VOB[l[0]]; if(!b) return; var src = ctx.createBufferSource(); src.buffer = b; var g = ctx.createGain(); g.gain.value = 1.15; src.connect(g); g.connect(master); src.start(Math.max(0, l[1] < 0 ? comp.dur + l[1] : l[1])) });
    sched(H, comp);
    if(comp.logo){ H.s("sting", comp.L + .55 - .02, .8); return }
    var e0 = comp.dur - END_L;
    H.click(e0 + E_CLICK, .5); H.s("tick2", e0 + E_CLICK + .2, .16); H.s("tick2", e0 + E_CLICK + E_T2, .16); H.s("sting", e0 + E_CLICK + E_T3 - .02, .8);
  };
}

/* ---------- komponera ---------- */
window.V3_ADS7 = [];
var BOOK = {b:"a7.btnB"};
function reg2(id, hid, n, d, L, fn, thumb, sched, cta){
  var comp = {n:n, d:d, group:"ads7", dur:L + END_L, thumb:thumb, id:id, hid:hid, v:{id:id}, L:L};
  comp.draw = function(c, G, t){ fn(c, G, t); if(t >= L) endSeq(c, G, t, L, cta) };
  comp.mix = makeMix(sched); comp.loadAudio = loadAudio;
  V3_COMPS[id] = comp; V3_ADS7.push(id);
}
reg2("a7_klick", "klick", "Klick", "Först resultatet, sedan hur: bokningen, två klick, tre format.", L1, ad1, 9.8, snd1);
reg2("a7_fotograf", "fotograf", "Fotografen", "En fråga över en bild, och sedan svaret: foton och färdiga inlägg i samma leverans.", L3, ad3, 7.8, snd3, BOOK);
reg2("a7_varumarke", "varumarke", "Varumärket", "Samma foto i tre kontors färger och namn.", L4, ad4, 3.4, snd4);
reg2("a7_bilderna", "bilderna", "Bilderna först", "Fotohantverket först, sedan allt som följer.", L5, ad5, 2.8, snd5, BOOK);
reg2("a7_skane", "skane", "Skåne", "Malmö, Lund, Landskrona och Helsingborg.", L6, ad6, 3.0, snd6, BOOK);
reg2("a7_faser", "faser", "Fyra faser", "Samma foto: Kommande, Till salu, Visning och Såld.", L7, ad7, 5.0, snd7);
reg2("a7_format", "format", "Alla format", "Ett inlägg i flöde, story och kvadrat.", L8, ad8, 6.5, snd8);
reg2("a7_leverans", "leverans", "Leverans", "Kampanjen är klar: tre mallar, alla format, ladda ner.", L9, ad9, 4.0, snd9);

/* ---------- annonser med svensk röst, med ett tydligare uppmaningsslut ---------- */
function regVO(id, n, d, L, fn, thumb, sched, vo, book){
  var comp = {n:n, d:d, group:"ads7", dur:L + END_L, thumb:thumb, id:id, v:{id:id}, L:L, vo:vo.concat(book ? [["c4", L + .5]] : [["k6", L + .6]]), isvo:true};
  comp.draw = function(c, G, t){ A7.vo = true; try { fn(c, G, t, L) } finally { A7.vo = false } if(t >= L) endSeq(c, G, t, L, book ? BOOK : true) };
  comp.mix = makeMix(sched); comp.loadAudio = loadAudio;
  V3_COMPS[id] = comp; V3_ADS7.push(id);
}
regVO("a7_klick_vo", "Klick · med röst", "Svensk röst: två klick, uppgifterna finns redan, du väljer bild och mall. Slut: Kontakta oss.", 14.5, ad1, 9.8,
  function(H){ var d = D1; H.s("shutter", .2, .5); [0, 1, 2, 3, 4].forEach(function(i){ H.s("tick1", d + 2.9 + i*.1, .15) }); H.click(d + 3.85, .85); H.click(d + 5.6, .85); [0, 1, 2, 3, 4, 5].forEach(function(i){ H.s("tick1", d + 6.65 + i*.09, .16) }); H.s("shutter2", d + 7.4, .5) },
  [["k1", .2], ["k2", 2.5], ["k3", 5.2], ["k4", 6.75], ["k5", 9.0]]);
regVO("a7_fotograf_vo", "Fotografen · med röst", "Svensk röst: frågan, svaret och leveransen. Slut: Boka fotografering.", 12.0, function(c, G, t, L){ ad3(c, G, t, L, 1.0) }, 8.8,
  function(H){ H.s("shutter", 5.5, .5); [6.4, 7.6].forEach(function(t){ H.s("tick1", t, .2) }) },
  [["f1", .4], ["f2", 4.0], ["f3", 6.15]], true);
regVO("a7_varumarke_vo", "Varumärket · med röst", "Svensk röst: dina objekt, ditt varumärke, ditt namn, din färg och din logga.", 14.0, function(c, G, t, L){ ad4(c, G, t, L, {sw:[3.6, 5.6], c0:3.9, cd:1.0}) }, 5.5,
  function(H){ [3.55, 5.55].forEach(function(s){ H.click(s, .7) }) },
  [["m1", .3], ["m2", 3.8], ["m3", 9.9]]);
regVO("a7_faser_vo", "Fyra faser · med röst", "Svensk röst: ett objekt, fyra inlägg, kommande, till salu, visning, såld.", 8.5, function(c, G, t, L){ ad7(c, G, t, L, {S0:2.55, per:1.0}) }, 5.0,
  function(H){ H.s("shutter", .5, .4); [3.55, 4.55, 5.55].forEach(function(s){ H.click(s - .05, .7) }) },
  [["p1", .3], ["p2", 2.6]]);

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
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 15 · bygge 47</div><h2>Annonsbyggare</h2>'
    + '<p>Åtta annonser för den enskilda mäklaren på Facebook och Instagram, var och en i tre varianter: A (stolen och tavlorna först), B (matplatsen först) och C (detaljerna först). Målet är att de ska få veta att Viewly finns och bli nyfikna, inte att boka. Bara era egna bilder, få och diskreta ljud. Varje annons slutar som varumärkesfilmen. Förslag, inget publicerat.</p></div>'
    + '<div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w45") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '"></div>'
    + '<span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Annons</div><div class="a3segs col">' + V3_ADS7.map(function(id){ return v3Seg("comp", id, V3_COMPS[id].n, V3S.comp === id) }).join("") + '</div>'
    + '<div class="a3h">Variant</div><div class="a3segs">' + ["A", "B", "C"].map(function(v){ return '<button type="button" class="a3seg' + (A7.v === v ? " on" : "") + '" data-a7var="' + v + '">' + v + '</button>' }).join("") + '</div>'
    + '<div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Reel · 9:16", V3S.fmt === "916") + v3Seg("fmt", "45", "Flöde · 4:5", V3S.fmt === "45") + v3Seg("fmt", "11", "Kvadrat · 1:1", V3S.fmt === "11") + '</div>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + comp.n + " " + A7.v + " · " + fn + ' · med ljud</button></div></div></div>'
    + '<details class="a3det a3cust"><summary>Slutet, gemensamt för alla</summary><div class="a3hxs">' + ["a7.btn", "a7.btnB", "a7.url", "a7.tag", "a7.btn2", "a7.url2", "a7.tag2"].map(function(k){ return v3TxField(k, TX[k][1]) }).join("") + '</div></details>'
    + Object.keys(HOOK).map(function(id){ return txEd("a7." + id + ".", "Öppningsrader · " + HOOK[id].n) }).join("")
    + txEd("a7.k1", "Klick · mellanrubriker") + txEd("a7.k3", "Fotografen · svar") + txEd("a7.k5", "Bilderna först · rubrik") + txEd("a7.k6", "Skåne · rader")
    + '<details class="a3det"><summary>Underlag, rättigheter och vad som inte är klart</summary><div class="a3und">'
    + '<div><b>Bilder</b><p>Bara de fem bilder ni skickat: stolen och tavlorna, matplatsen, köksdetaljen, skulpturen och golvet. Kontrollera att ni har rätt att använda dem i reklam, och att skulpturen och fasaden i bilden får visas.</p></div>'
    + '<div><b>Siffror och löften</b><p>Inga tal används utom exempeluppgifterna (12 bilder, 4 rum, 112 m²). "Tre format" och "tre mallar" stämmer med studion som den ser ut i dag.</p></div>'
    + '<div><b>Exempeldata</b><p>Storgatan 13, Anna Lindqvist och Nordvik är exempel, som i Ads. Kontoren Hamnen och Kusten är påhittade. Byt mot riktiga exempel innan lansering.</p></div>'
    + '<div><b>Ljud</b><p>Riktiga inspelade ljud, CC0 (Kenney.nl): musklick, korta tick, en mjuk bekräftelse. Licensen följer med i assets/sfx.</p></div>'
    + '<div><b>Kanaler</b><p>Facebook och Instagram: Reels och Stories 9:16, flöde 4:5 och 1:1. Märk med viewly.se och spåra klick separat per annons och variant.</p></div></div></details></div>';
};
/* delar som sida 16 (Magasin) återanvänder */
function loadVo(names, dir){
  var AC = window.AudioContext || window.webkitAudioContext, ctx = window.__a7ac || (window.__a7ac = new AC());
  return Promise.all(names.map(function(n){
    return fetch(dir + n + ".mp3").then(function(r){ return r.arrayBuffer() }).then(function(ab){ return new Promise(function(res, rej){ var q = ctx.decodeAudioData(ab, res, rej); if(q && q.then) q.then(res, rej) }) }).then(function(b){ VOB[n] = b }).catch(function(){});
  }));
}
window.A7K = {A7:A7, ph:ph, PH:PH, endSeq:endSeq, makeMix:makeMix, loadVo:loadVo, box:box, hsz:hsz, rr:rr, MX:MX, GAP:GAP, END_L:END_L,
  rawReg:function(n, x, y, w, h, o){ if(DBG) DBG.push({n:n, x:x, y:y, w:w, h:h, o:o || {}}) }, dbg:function(){ return DBG }};
document.addEventListener("click", function(e){
  var b = e.target.closest("[data-a7var]"); if(!b) return;
  A7.v = b.dataset.a7var; V3S.playing = false; v3StopSound(); render();
});
})();
