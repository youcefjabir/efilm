/* =====================================================================
   SIDA 16 — KAMPANJEN: NY AKTÖR INOM BOSTADSFOTOGRAFI
   Fem annonser för den enskilda mäklaren i Skåne på Facebook och Instagram.
   Målet är kännedom och nyfikenhet: att mäklaren förstår att det finns en
   ny aktör inom bostadsfotografering, och att hela flödet, från intag till
   fotografering, mäklarportal, appar och sociala medier, finns på ett ställe.
   Varje annons har ett eget syfte och ett eget uttryck (inte samma film
   med ny rad). Alla slutar som varumärkesfilmen: Boka fotografering,
   viewly.se, För fastighetsmäklare som vill mer, loggan.

   Meta: 9:16 (Reels, Stories) och 4:5 (flöde). I 9:16 ligger allt viktigt
   i den säkra ytan enligt Metas riktlinje: 14 % överst, 35 % nederst och
   6 % på sidorna lämnas fria från text och logotyper. Allt är begripligt
   utan ljud. Inga siffror eller löften som inte går att styrka.
   Bilder: bara era egna (sida 15 + sängen från Såld).
   ===================================================================== */
(function(){
var K = window.A7K, A7 = K.A7, END_L = K.END_L, rr = K.rr, reg = K.rawReg, MX = 8;
var PAPER = C3.paper, INK = C3.ink, MUT = "#5f5a55", DARK = "#070606", OLI = C3.oli;

/* bilder: sida 15 + sängen */
V3_KEYS.bedroom = "adBedroom"; V3_POS.bedroom = [.5, .55];
var P = {chair:"rs_chair", dining:"rs_dining", kitchen:"rs_kitchen", floor:"rs_floor", statue:"rs_statue", bed:"bedroom"};

/* ---------- redigerbara texter ---------- */
var TX = {
  "a8.ny.l1":["Bostadsfoto.", "Ny aktör · rubrik, rad 1"], "a8.ny.l2":["Och lite till.", "Ny aktör · rubrik, rad 2"],
  "a8.ny.r1":["Intag", "Ny aktör · steg 1"], "a8.ny.r2":["Fotografering", "Ny aktör · steg 2"], "a8.ny.r3":["Mäklarportal", "Ny aktör · steg 3"], "a8.ny.r4":["Sociala medier", "Ny aktör · steg 4"],
  "a8.ny.f1":["Allt i ett flöde.", "Ny aktör · slutrad"], "a8.ny.f2":["NY AKTÖR FÖR MÄKLARE I SKÅNE", "Ny aktör · liten rad"],
  "a8.pl.s1":["Intag", "Plattformen · steg 1"], "a8.pl.s2":["Fotografering", "Plattformen · steg 2"], "a8.pl.s3":["Kampanj", "Plattformen · steg 3"], "a8.pl.s4":["Sociala medier", "Plattformen · steg 4"],
  "a8.pl.f1":["Hela flödet.", "Plattformen · slutrad 1"], "a8.pl.f2":["En plattform.", "Plattformen · slutrad 2"],
  "a8.ti.h1":["Mellan intag och visning", "Tiden · rubrik, rad 1"], "a8.ti.h2":["finns en lång lista.", "Tiden · rubrik, rad 2"],
  "a8.ti.t1":["Boka fotograf", "Tiden · uppgift 1"], "a8.ti.t2":["Välja bilder", "Tiden · uppgift 2"], "a8.ti.t3":["Få bilderna redigerade", "Tiden · uppgift 3"], "a8.ti.t4":["Skriva text", "Tiden · uppgift 4"],
  "a8.ti.t5":["Göra inläggsmallar", "Tiden · uppgift 5"], "a8.ti.t6":["Anpassa till alla format", "Tiden · uppgift 6"], "a8.ti.t7":["Dela på Instagram", "Tiden · uppgift 7"], "a8.ti.t8":["Dela på Facebook", "Tiden · uppgift 8"],
  "a8.ti.f1":["En leverans.", "Tiden · slutrad 1"], "a8.ti.f2":["Mer tid till nästa intag.", "Tiden · slutrad 2"],
  "a8.in.h1":["Din nästa säljare", "Intagsmötet · rubrik, rad 1"], "a8.in.h2":["har redan sett ditt flöde.", "Intagsmötet · rubrik, rad 2"],
  "a8.in.g1":["Gör det värt", "Intagsmötet · slutrad 1"], "a8.in.g2":["att scrolla.", "Intagsmötet · slutrad 2"],
  "a8.sk.l":["BOSTADSFOTOGRAFI I", "Skåne · liten rad"], "a8.sk.h1":["Din bostadsfotograf", "Skåne · rubrik, rad 1"], "a8.sk.h2":["i Skåne.", "Skåne · rubrik, rad 2"],
  "a8.sk.f":["Och allt som kommer efter.", "Skåne · rad ovanför inläggen"]
};
Object.keys(TX).forEach(function(k){ V3_TXD[k] = TX[k][0] });
var T = function(k){ return v3t(k) };

/* ---------- gemensamma delar ---------- */
function rev(t, a, d){ return ioC(k3(t, a, a + (d == null ? .6 : d))) }
function fz(c, s, o, maxW){ var w = v3Measure(c, s, o); return w > maxW ? o.size*maxW/w : o.size }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)) }
/* Metas säkra yta: 14 % överst, 35 % nederst, 6 % på sidorna i 9:16. 4:5 har ingen överlagring. */
function SG(G){ var y0 = G.top + 3, y1 = G.is9 ? G.H*.65 - 3 : G.H - G.bot - 4; return {y0:y0, y1:y1, h:y1 - y0} }
function lab(c, s, x, y, a, o){ o = o || {}; return v3Text(c, s, x, y, {size:o.size || 1.7, weight:o.weight || 600, f:"sans", sp:o.sp == null ? .28 : o.sp, color:o.color || MUT, align:o.align || "l", alpha:a, p:o.p, shadow:o.shadow}) }
function line2(c, G, t, t0, y, l1, l2, o){
  /* två rader: en rak och en kursiv. Rubrikerna sitter alltid inom 84 bredd. */
  o = o || {}; var s0 = o.size || (G.is9 ? 8.8 : 7), a = (o.a == null ? 1 : o.a)*rev(t, t0, .7);
  var s = Math.min(fz(c, l1, {size:s0, weight:300}, 84), fz(c, l2, {size:s0, weight:300, italic:true}, 84)), al = o.align || "l", x = al === "c" ? 50 : MX;
  if(a <= .01) return y + s*2.2;
  v3Text(c, l1, x, y + s*.8, {size:s, color:o.c1 || INK, align:al, alpha:a, p:oQ(k3(t, t0, t0 + .9)), rise:2, shadow:o.shadow});
  v3Text(c, l2, x, y + s*1.95, {size:s, italic:true, color:o.c2 || OLI, align:al, alpha:a, p:oQ(k3(t, t0 + .3, t0 + 1.2)), rise:2, shadow:o.shadow});
  if(a > .5) reg("rubrik", al === "c" ? 50 - 42 : MX, y, 84, s*2.3, {head:1});
  return y + s*2.3;
}
function rrect(c, x, y, w, h, r, fill, a, shadow){
  c.save(); c.globalAlpha = a; if(shadow){ c.shadowColor = "rgba(0,0,0,.16)"; c.shadowBlur = shadow; c.shadowOffsetY = shadow*.25 }
  c.fillStyle = fill; rr(c, x, y, w, h, r); c.fill(); c.restore();
}
function tickC(c, x, y, r, p, col){ if(p <= 0) return; c.save(); c.strokeStyle = col || OLI; c.lineWidth = r*.26; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(x - r*.5, y); c.lineTo(x - r*.1, y + r*.42*Math.min(1, p*2)); if(p > .5) c.lineTo(x - r*.1 + r*.75*(p - .5)*2, y + r*.42 - r*.95*(p - .5)*2); c.stroke(); c.restore() }
function dot(c, x, y, r, col, a){ c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore() }
function thumb(c, key, x, y, w, h, a, r){
  if(a <= .02) return; c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 3; c.shadowOffsetY = .8; c.fillStyle = "#fff"; rr(c, x - .6, y - .6, w + 1.2, h + 1.2, (r || 1.2) + .4); c.fill(); c.restore();
  c.save(); c.globalAlpha = a; rr(c, x, y, w, h, r || 1.2); c.clip(); v3Photo(c, key, x, y, w, h, {scale:1.08, pos:V3_POS[key]}); c.restore();
}

/* =====================================================================
   1 · NY AKTÖR — Bostadsfoto. Och lite till.   (mörk, fotografisk, kännedom)
   ===================================================================== */
var L1 = 11.6;
function adNy(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Fill(c, 0, 0, 100, H, DARK);
  var a2 = rev(t, 2.9, .8);
  v3Photo(c, P.bed, 0, 0, 100, H, {scale:lerp(1.05, 1.16, k3(t, 0, 5)), pos:V3_POS.bedroom, alpha:ioC(k3(t, 0, .6))});
  if(a2 > 0) v3Photo(c, P.chair, 0, 0, 100, H, {scale:lerp(1.05, 1.14, k3(t, 2.9, 7)), pos:V3_POS.rs_chair, alpha:a2});
  var hold = rev(t, 5.3, .8);
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", .30 + .10*a2 + .30*hold);
  v3Grad(c, 0, 0, 100, H*.3, [[0, "rgba(8,7,7,.55)"], [1, "rgba(8,7,7,0)"]]);
  v3Frame(c, 4, 4, 92, H - 8, "#fff", .26, oQ(k3(t, .2, 1.8)), .5);
  lab(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, S.y0 + 2, rev(t, .4, .8)*.92, {size:1.9, color:"#fff", align:"c", weight:500, sp:.3});
  reg("etikett", 12, S.y0, 76, 3.4);
  /* öppningen */
  var sH = G.is9 ? 12.5 : 10.4, cy = S.y0 + S.h*.46, out = 1 - rev(t, 4.9, .6);
  v3Text(c, T("a8.ny.l1"), 50, cy, {size:sH, color:"#fff", align:"c", alpha:out, p:oQ(k3(t, .8, 2.1)), rise:2, shadow:true});
  v3Text(c, T("a8.ny.l2"), 50, cy + sH*1.18, {size:sH, italic:true, color:C3.cream, align:"c", alpha:out*rev(t, 3.2, .6), p:oQ(k3(t, 3.2, 4.5)), rise:2, shadow:true});
  if(out > .5 && t > 1.5) reg("rubrik", 8, cy - sH*.85, 84, sH*2.3, {head:1});
  /* flödet: fyra steg på en linje */
  var rows = [T("a8.ny.r1"), T("a8.ny.r2"), T("a8.ny.r3"), T("a8.ny.r4")], top = S.y0 + (G.is9 ? 14 : 12), foot = G.is9 ? 20 : 17, rh = clamp((S.y1 - top - foot)/4, 8, 17), lx = MX + 3, st = Math.min(8.4, rh*.52);
  var lp = ioC(k3(t, 5.6, 8.2));
  v3VLine(c, lx, top + rh*.5, top + rh*3.5, "rgba(255,255,255,.55)", .22, lp);
  for(i = 0; i < 4; i++){
    var s0 = 5.7 + i*.8, a = rev(t, s0, .6), y = top + i*rh;
    dot(c, lx, y + rh*.5, 1.1, "#fff", a);
    lab(c, "0" + (i + 1), lx + 6, y + rh*.5 - st*.55, a*.8, {size:1.6, color:"#e9eadf", weight:500});
    v3Text(c, rows[i], lx + 6, y + rh*.5 + st*.35, {size:Math.min(st, fz(c, rows[i], {size:st, weight:300}, 74)), color:"#fff", alpha:a, p:oQ(k3(t, s0, s0 + .8)), rise:1.6, shadow:true});
    if(a > .5) reg("steg", MX, y + 1, 84, rh - 2);
  }
  var fy = top + 4*rh + 5, f1 = T("a8.ny.f1"), fa = rev(t, 9.0, .8), fs = Math.min(G.is9 ? 8.2 : 6.8, fz(c, f1, {size:G.is9 ? 8.2 : 6.8, italic:true, weight:300}, 84));
  v3Text(c, f1, MX, fy + fs*.8, {size:fs, italic:true, color:C3.cream, alpha:fa, p:oQ(k3(t, 9.0, 10.0)), rise:2, shadow:true});
  lab(c, T("a8.ny.f2"), MX, fy + fs*.8 + 5.2, rev(t, 9.6, .7)*.9, {size:1.7, color:"#e9eadf", weight:500, shadow:true});
  if(fa > .5) reg("slutrad", MX, fy, 84, fs*1.1 + 7);
}
function sndNy(H){ H.s("shutter", .25, .5); H.s("shutter2", 2.95, .45); [0, 1, 2, 3].forEach(function(i){ H.s("tick1", 5.7 + i*.8, .15) }); H.s("thunk", 9.05, .45) }

/* =====================================================================
   2 · PLATTFORMEN — från intag till inlägg   (ljus, mäklarportalen)
   ===================================================================== */
var L2 = 12.6, ST2 = [.9, 3.3, 5.7, 8.1];
function adPlatt(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Fill(c, 0, 0, 100, H, C3.ui);
  var q = rev(t, .1, .7);
  c.save(); c.globalAlpha = q; v3Lock(c, 0, S.y0 + 2.2, 2.4, INK, OLI, {left:MX}); c.restore();
  lab(c, "MÄKLARPORTALEN", 100 - MX, S.y0 + 2.9, q, {size:1.7, align:"r", weight:500, sp:.24});
  v3Line(c, MX, 100 - MX, S.y0 + 6.6, C3.uil, .2, oQ(k3(t, .2, 1.1)), 1);
  reg("topp", MX, S.y0, 84, 7);
  var st = t < ST2[1] ? 0 : t < ST2[2] ? 1 : t < ST2[3] ? 2 : 3, fin = rev(t, 10.0, .4), fin2 = rev(t, 10.7, .8);
  /* förlopp: fyra punkter på en linje */
  var py = S.y0 + 12.4, px0 = MX + 3, px1 = 100 - MX - 3, pr = ioC(k3(t, ST2[0] - .3, ST2[0] + .5));
  v3Line(c, px0, px1, py, "rgba(28,28,30,.2)", .3, 1, pr*(1 - fin));
  var cur = st + (st < 3 ? ioC(k3(t, ST2[st + 1] - .5, ST2[st + 1])) : 0);
  v3Line(c, px0, px0 + (px1 - px0)*(cur/3), py, INK, .5, 1, pr*(1 - fin));
  for(i = 0; i < 4; i++){ var xx = lerp(px0, px1, i/3); dot(c, xx, py, i <= cur + .01 ? 1.5 : 1.0, i <= cur + .01 ? INK : "#bdb8b2", pr*(1 - fin)) }
  /* stegets rubrik */
  var titles = [T("a8.pl.s1"), T("a8.pl.s2"), T("a8.pl.s3"), T("a8.pl.s4")], hy = py + 4.6, hs = G.is9 ? 8.4 : 7;
  for(i = 0; i < 4; i++){
    var inA = rev(t, ST2[i], .6), outA = i < 3 ? 1 - rev(t, ST2[i + 1] - .5, .45) : 1 - fin; var a = inA*outA; if(a <= .02) continue;
    lab(c, "0" + (i + 1), MX, hy + 2, a, {size:1.7, weight:600});
    v3Text(c, titles[i], MX + 8, hy + hs*.85, {size:Math.min(hs, fz(c, titles[i], {size:hs, weight:300}, 74)), color:INK, alpha:a, p:oQ(k3(t, ST2[i], ST2[i] + .9)), rise:2});
    if(a > .5) reg("stegrubrik", MX, hy, 84, hs*1.1);
  }
  /* kort för varje steg */
  var cy0 = hy + hs*1.1 + 3.6, ch = S.y1 - cy0, cw = 84, cx0 = MX;
  function card(i, fn){
    var a = rev(t, ST2[i] + .1, .6)*(i < 3 ? 1 - rev(t, ST2[i + 1] - .45, .4) : 1 - fin); if(a <= .02) return;
    var dy = (1 - oQ(k3(t, ST2[i] + .1, ST2[i] + .8)))*2.2; rrect(c, cx0, cy0 + dy, cw, ch, 2.4, "#fff", a, 6);
    if(a > .5) reg("kort", cx0, cy0 + dy, cw, ch);
    c.save(); c.translate(0, dy); fn(a); c.restore();
  }
  card(0, function(a){
    var rows = [["ADRESS", "Storgatan 13"], ["ORT", "Landskrona"], ["MÄKLARE", "Anna Lindqvist"], ["KONTOR", "Nordvik"]], rh = Math.min(15, (ch - 18)/4), x0 = cx0 + 5;
    lab(c, "NYTT UPPDRAG", x0, cy0 + 6, a*rev(t, ST2[0] + .3, .5), {size:1.8, color:OLI});
    for(var j = 0; j < 4; j++){
      var s0 = ST2[0] + .6 + j*.28, aa = a*rev(t, s0, .45), yy = cy0 + 11 + j*rh;
      v3Line(c, x0, cx0 + cw - 5, yy - 1.4, "rgba(28,28,30,.12)", .16, ioC(k3(t, s0, s0 + .5)), a);
      lab(c, rows[j][0], x0, yy + 1.4, aa, {size:1.6, color:MUT}); v3Text(c, rows[j][1], x0, yy + 6.2, {size:Math.min(5.6, rh*.42), color:INK, alpha:aa});
      tickC(c, cx0 + cw - 8, yy + 3.4, 2, k3(t, s0 + .3, s0 + .7), OLI);
    }
  });
  card(1, function(a){
    var gw = (cw - 10 - 2*2)/3, gh = Math.min(gw*1.25, (ch - 24)/2), x0 = cx0 + 5, ks = [P.chair, P.dining, P.kitchen, P.floor, P.statue, P.bed];
    lab(c, "12 BILDER LEVERERADE", x0, cy0 + 6, a*rev(t, ST2[1] + .3, .5), {size:1.8, color:OLI});
    for(var j = 0; j < 6; j++){ var s0 = ST2[1] + .5 + j*.22, aa = a*rev(t, s0, .45); thumb(c, ks[j], x0 + (j%3)*(gw + 2), cy0 + 10 + Math.floor(j/3)*(gh + 2) + (1 - aa)*1.4, gw, gh, aa, 1.2) }
    tickC(c, cx0 + cw - 8, cy0 + 6, 2.2, k3(t, ST2[1] + 1.9, ST2[1] + 2.3), OLI);
  });
  card(2, function(a){
    var pw = (cw - 10 - 2*3)/3, ph = pw*1.25, x0 = cx0 + 5, sty = [["badge", "kommande"], ["overlay", "tillsalu"], ["editorial", "sald"]], pk = [P.dining, P.chair, P.bed];
    lab(c, "3 MALLAR · 3 FORMAT", x0, cy0 + 6, a*rev(t, ST2[2] + .3, .5), {size:1.8, color:OLI});
    for(var j = 0; j < 3; j++){
      var s0 = ST2[2] + .5 + j*.35, aa = a*rev(t, s0, .5), sc = lerp(.92, 1, oQ(k3(t, s0, s0 + .7)));
      if(aa > .02){ c.save(); c.globalAlpha = aa; var xx = x0 + j*(pw + 3), yy = cy0 + 10; c.translate(xx + pw/2, yy + ph/2); c.scale(sc, sc); c.translate(-xx - pw/2, -yy - ph/2); v3Post(c, sty[j][0], sty[j][1], pk[j], xx, yy, pw, 1.25, k3(t, s0, s0 + 1.1)); c.restore() }
      if(aa > .5) reg("inlagg", x0 + j*(pw + 3), cy0 + 10, pw, ph, {child:1});
    }
  });
  card(3, function(a){
    var rows = [["Instagram", "Story · flöde"], ["Facebook", "Flöde"]], x0 = cx0 + 5, rh = Math.min(22, (ch - 16)/2), ph = rh - 4, pw = ph*.8, pk = [P.chair, P.dining];
    lab(c, "REDO ATT DELA", x0, cy0 + 6, a*rev(t, ST2[3] + .3, .5), {size:1.8, color:OLI});
    for(var j = 0; j < 2; j++){
      var s0 = ST2[3] + .6 + j*.5, aa = a*rev(t, s0, .5), yy = cy0 + 10 + j*rh;
      v3Line(c, x0, cx0 + cw - 5, yy - 1.6, "rgba(28,28,30,.12)", .16, ioC(k3(t, s0, s0 + .5)), a);
      if(aa > .02){ c.save(); c.globalAlpha = aa; v3Post(c, "overlay", "tillsalu", pk[j], x0, yy, pw, ph/pw, 1); c.restore() }
      v3Text(c, rows[j][0], x0 + pw + 5, yy + ph*.42, {size:Math.min(6.4, ph*.3), color:INK, alpha:aa});
      lab(c, rows[j][1], x0 + pw + 5, yy + ph*.42 + 4.6, aa, {size:1.7, color:MUT});
      tickC(c, cx0 + cw - 8, yy + ph*.4, 2.2, k3(t, s0 + .35, s0 + .8), OLI);
      if(aa > .5) reg("kanal", x0, yy, pw, ph, {child:1});
    }
  });
  /* slutrad: kommer först när steget har tonat ut */
  if(fin2 > .02){
    var fs = G.is9 ? 10 : 8.2, f1 = T("a8.pl.f1"), f2 = T("a8.pl.f2"), y = S.y0 + S.h*.46, ff = Math.min(fs, fz(c, f1, {size:fs, weight:300}, 84), fz(c, f2, {size:fs, weight:300, italic:true}, 84));
    v3Text(c, f1, 50, y, {size:ff, color:INK, align:"c", alpha:fin2, p:oQ(k3(t, 10.7, 11.7)), rise:2});
    v3Text(c, f2, 50, y + ff*1.2, {size:ff, italic:true, color:OLI, align:"c", alpha:fin2*rev(t, 11.2, .6), p:oQ(k3(t, 11.2, 12.2)), rise:2});
    if(fin2 > .5) reg("rubrik", 8, y - ff*.85, 84, ff*2.3, {head:1});
  }
}
function sndPlatt(H){ ST2.forEach(function(s, i){ H.s("tick1", s + .55, .2) }); [0, 1, 2].forEach(function(j){ H.s("tick1", ST2[1] + .55 + j*.44, .12) }); H.s("shutter", ST2[1] + .5, .4); H.s("thunk", ST2[2] + .6, .4); H.s("thunk", 10.8, .45) }

/* =====================================================================
   3 · TIDEN — det som tar din tid   (ljus, typografisk, listan som blir en leverans)
   ===================================================================== */
var L3 = 12.0;
function adTid(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Fill(c, 0, 0, 100, H, PAPER);
  lab(c, "VIEWLY", MX, S.y0 + 2, rev(t, .1, .6), {size:1.9, color:INK, weight:600, sp:.34});
  var hb = line2(c, G, t, .3, S.y0 + 5, T("a8.ti.h1"), T("a8.ti.h2"), {size:G.is9 ? 8 : 6.6, a:1 - rev(t, 8.6, .5)});
  var tasks = []; for(i = 1; i <= 8; i++) tasks.push(T("a8.ti.t" + i));
  var top = hb + 4, rh = clamp((S.y1 - top)/8, 5.2, 10.5), ts = Math.min(G.is9 ? 5.4 : 5, rh*.56);
  var outList = 1 - rev(t, 8.6, .5);
  for(i = 0; i < 8; i++){
    var s0 = 1.7 + i*.4, a = rev(t, s0, .45)*outList, y = top + i*rh, sx = rev(t, 6.0 + i*.14, .5);
    if(a <= .02) continue;
    v3Line(c, MX, 100 - MX, y, "rgba(28,28,30,.2)", .14, ioC(k3(t, s0, s0 + .5)), a);
    c.save(); c.globalAlpha = a*.9; c.strokeStyle = INK; c.lineWidth = .2; rr(c, MX, y + rh*.5 - 1.2, 2.4, 2.4, .5); c.stroke(); c.restore();
    v3Text(c, tasks[i], MX + 6, y + rh*.5 + ts*.33, {size:Math.min(ts, fz(c, tasks[i], {size:ts, weight:400}, 70)), color:INK, alpha:a*(1 - .62*sx), p:oQ(k3(t, s0, s0 + .6)), rise:1.2});
    var w = v3Measure(c, tasks[i], {size:ts, weight:400});
    v3Line(c, MX + 6, MX + 6 + Math.min(w, 70)*1, y + rh*.5 + .1, INK, .22, sx, a);
    tickC(c, 100 - MX - 3, y + rh*.5, 2, sx, OLI);
    if(a > .5) reg("uppgift", MX, y + .4, 84, rh - .8);
  }
  /* listan blir en leverans */
  var fa = rev(t, 9.3, .8);
  if(fa > .02){
    var cw = 76, chh = G.is9 ? 34 : 28, cx = 50 - cw/2, cy = S.y0 + S.h*.34, sc = lerp(.94, 1, oQ(k3(t, 9.3, 10.1)));
    c.save(); c.translate(50, cy + chh/2); c.scale(sc, sc); c.translate(-50, -cy - chh/2);
    rrect(c, cx, cy, cw, chh, 2.6, "#fff", fa, 7);
    dot(c, cx + 9, cy + chh/2, 3.2, INK, fa); c.restore();
    tickC(c, 50 - cw/2 + 9.3, cy + chh/2 - .2, 2.8, k3(t, 9.9, 10.4), "#fff");
    var f1 = T("a8.ti.f1"), fs = Math.min(G.is9 ? 7.4 : 6.2, fz(c, f1, {size:G.is9 ? 7.4 : 6.2, weight:400}, 52));
    v3Text(c, f1, cx + 16, cy + chh/2 - .4, {size:fs, color:INK, alpha:fa, p:oQ(k3(t, 9.4, 10.3))});
    lab(c, "FOTON OCH FÄRDIGA INLÄGG", cx + 16, cy + chh/2 + 4.6, rev(t, 10.0, .6), {size:1.45, color:MUT});
    if(fa > .5) reg("leverans", cx, cy, cw, chh);
    var g2 = T("a8.ti.f2"), gs = Math.min(G.is9 ? 8 : 6.6, fz(c, g2, {size:G.is9 ? 8 : 6.6, italic:true, weight:300}, 84)), gy = cy + chh + 12;
    v3Text(c, g2, 50, gy + gs*.8, {size:gs, italic:true, color:OLI, align:"c", alpha:rev(t, 10.7, .8), p:oQ(k3(t, 10.7, 11.8)), rise:2});
    if(t > 11.3) reg("rubrik", 8, gy, 84, gs*1.2, {head:1});
  }
}
function sndTid(H){ for(var i = 0; i < 8; i++) H.s("tick1", 1.7 + i*.4, .1); for(var j = 0; j < 8; j++) H.s("tick1", 6.1 + j*.14, .08); H.s("thunk", 9.4, .45) }

/* =====================================================================
   4 · INTAGSMÖTET — innan säljaren ringer   (mörk, telefon, flödet fylls)
   ===================================================================== */
var L4 = 10.8;
function adMote(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Fill(c, 0, 0, 100, H, "#0c0b0b");
  v3Grad(c, 0, 0, 100, H, [[0, "rgba(46,52,44,.5)"], [.55, "rgba(12,11,11,0)"], [1, "rgba(30,34,28,.35)"]]);
  var swap = rev(t, 6.7, .5);
  lab(c, "VIEWLY", MX, S.y0 + 2, rev(t, .1, .6), {size:1.9, color:"#fff", weight:600, sp:.34});
  var h1 = line2(c, G, t, .3, S.y0 + 5, T("a8.in.h1"), T("a8.in.h2"), {c1:"#fff", c2:C3.olil, size:G.is9 ? 8 : 6.8, a:1 - swap});
  line2(c, G, t, 7.4, S.y0 + 5, T("a8.in.g1"), T("a8.in.g2"), {c1:"#fff", c2:C3.olil, size:G.is9 ? 8.6 : 7.2, a:1});
  var hb = S.y0 + 5 + (G.is9 ? 8 : 6.8)*2.3;
  /* telefonen */
  var pw = G.is9 ? 46 : 42, px = 50 - pw/2, py = hb + 5, ph = S.y1 - py + 40, pa = rev(t, .8, .9), dy = (1 - oQ(k3(t, .8, 1.8)))*5;
  c.save(); c.globalAlpha = pa; c.translate(0, dy);
  c.save(); rr(c, px, py, pw, ph, 5); c.clip();
  c.fillStyle = "#1b1a19"; c.fillRect(px, py, pw, ph);
  var sx = px + 1.1, sw = pw - 2.2; c.fillStyle = "#fff"; rr(c, sx, py + 1.1, sw, ph, 4); c.fill();
  /* profil */
  var ax = sx + 5, ay = py + 9; c.fillStyle = OFF.accent; c.beginPath(); c.arc(ax + 3.6, ay, 3.6, 0, 7); c.fill();
  v3Text(c, "AL", ax + 3.6, ay + 1.2, {size:3, weight:600, f:"sans", color:"#fff", align:"c"});
  v3Text(c, "Anna Lindqvist", ax + 9.6, ay - .6, {size:2.9, weight:600, f:"sans", color:INK});
  v3Text(c, "Fastighetsmäklare · Nordvik", ax + 9.6, ay + 2.6, {size:1.75, weight:500, f:"sans", color:MUT});
  v3Line(c, sx + 3, sx + sw - 3, ay + 7, "rgba(28,28,30,.14)", .16, 1, 1);
  var cs = (sw - 6 - 2*1)/3, gx = sx + 3, gy = ay + 9.4, ks = [[P.chair, "p"], ["tillsalu", "s"], [P.dining, "p"], ["sald", "s"], [P.bed, "p"], ["kommande", "s"], [P.kitchen, "p"], ["tillsalu", "s"], [P.floor, "p"]];
  for(i = 0; i < 9; i++){
    var s0 = 2.0 + i*.5, aa = rev(t, s0, .5), x = gx + (i%3)*(cs + 1), y = gy + Math.floor(i/3)*(cs*1.25 + 1);
    if(aa <= .02) continue; c.save(); c.globalAlpha = aa;
    if(ks[i][1] === "p") v3Photo(c, ks[i][0], x, y, cs, cs*1.25, {scale:1.1, pos:V3_POS[ks[i][0]]});
    else v3Post(c, ks[i][0] === "kommande" ? "badge" : ks[i][0] === "sald" ? "editorial" : "overlay", ks[i][0], i === 1 ? P.chair : i === 3 ? P.bed : P.dining, x, y, cs, 1.25, 1);
    c.restore();
  }
  c.restore();
  c.restore();
  c.save(); c.globalAlpha = pa; c.strokeStyle = "#3a3836"; c.lineWidth = .9; rr(c, px, py + dy, pw, ph, 5); c.stroke(); c.restore();
  reg("telefon", px, py + dy, pw, Math.min(ph, S.y1 - py - dy));
  /* tona ut mot botten, så att den inte krockar med Metas knappar */
  v3Grad(c, 0, S.y1 - 16, 100, 16, [[0, "rgba(12,11,11,0)"], [1, "rgba(12,11,11,1)"]], pa);
  v3Fill(c, 0, S.y1, 100, H - S.y1, "#0c0b0b", 1);
}
function sndMote(H){ for(var i = 0; i < 9; i++) H.s(i % 3 === 0 ? "shutter2" : "tick1", 2.0 + i*.5, i % 3 === 0 ? .3 : .13); H.s("thunk", 7.5, .4) }

/* =====================================================================
   5 · SKÅNE — din bostadsfotograf, och allt efter   (foto, lokal)
   ===================================================================== */
var L5 = 11.4, CITIES = ["Malmö", "Lund", "Landskrona", "Helsingborg"];
function adSkane(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Fill(c, 0, 0, 100, H, DARK);
  var bg = [P.chair, P.dining, P.kitchen, P.bed], k = Math.min(3, Math.floor(Math.max(0, t - .4)/1.3)), fin = rev(t, 5.6, .8), a;
  for(i = 0; i < 4; i++){
    a = i < k ? 0 : i === k ? rev(t, .4 + i*1.3, .3) : 0; if(i === k && k > 0) a = 1; if(i === 0) a = Math.max(a, ioC(k3(t, 0, .6)));
    if(a > 0) v3Photo(c, bg[i], 0, 0, 100, H, {scale:lerp(1.06, 1.16, k3(t, .4 + i*1.3, 5.6)), pos:V3_POS[bg[i]], alpha:a});
  }
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", .34 + .34*fin);
  v3Grad(c, 0, 0, 100, H*.28, [[0, "rgba(8,7,7,.5)"], [1, "rgba(8,7,7,0)"]]);
  var sC = G.is9 ? 13 : 10.6, cy = S.y0 + S.h*.42, gone = rev(t, 5.2, .5);
  lab(c, T("a8.sk.l"), 50, cy - sC*1.05, rev(t, .3, .7)*.92*(1 - gone), {size:1.9, color:"#fff", align:"c", weight:500, sp:.3, shadow:true});
  CITIES.forEach(function(ci, j){
    var s0 = .4 + j*1.3, va = rev(t, s0, .3)*(j < 3 ? 1 - rev(t, s0 + 1.0, .3) : 1 - gone);
    if(va > 0) v3Text(c, ci, 50, cy, {size:Math.min(sC, fz(c, ci, {size:sC, weight:300}, 84)), color:"#fff", align:"c", alpha:va, p:oQ(k3(t, s0, s0 + .6)), rise:2, shadow:true});
  });
  if(t > 1 && t < 5.2) reg("stad", 8, cy - sC*.85, 84, sC*1.1, {head:1});
  /* efter fotograferingen: rubrik och tre färdiga inlägg */
  var inT = rev(t, 5.9, .7);
  if(inT > .02){
    var pw = 24, ph = pw*1.25, py = S.y1 - ph, hs = G.is9 ? 8.6 : 7, h1 = T("a8.sk.h1"), h2 = T("a8.sk.h2"), hy = S.y0 + (G.is9 ? 10 : 6);
    var ss = Math.min(hs, fz(c, h1, {size:hs, weight:300}, 84), fz(c, h2, {size:hs, weight:300, italic:true}, 84));
    v3Text(c, h1, 50, hy + ss*.8, {size:ss, color:"#fff", align:"c", alpha:inT, p:oQ(k3(t, 5.9, 6.9)), rise:2, shadow:true});
    v3Text(c, h2, 50, hy + ss*1.95, {size:ss, italic:true, color:C3.cream, align:"c", alpha:inT*rev(t, 6.3, .6), p:oQ(k3(t, 6.3, 7.3)), rise:2, shadow:true});
    reg("rubrik", 8, hy, 84, ss*2.3, {head:1});
    var fl = T("a8.sk.f"), fy = py - 7;
    lab(c, fl.toUpperCase(), 50, fy, rev(t, 7.2, .6)*.9, {size:1.7, color:"#e9eadf", align:"c", weight:500, shadow:true}); reg("rad", 14, fy - 2.4, 72, 3.6);
    var sty = [["badge", "kommande", P.dining], ["overlay", "tillsalu", P.chair], ["editorial", "sald", P.bed]];
    for(i = 0; i < 3; i++){
      var s0 = 7.6 + i*.45, aa = rev(t, s0, .5), sc = lerp(.92, 1, oQ(k3(t, s0, s0 + .7))), x = 11 + i*(pw + 3);
      if(aa > .02){ c.save(); c.globalAlpha = aa; c.translate(x + pw/2, py + ph/2); c.scale(sc, sc); c.translate(-x - pw/2, -py - ph/2); v3Post(c, sty[i][0], sty[i][1], sty[i][2], x, py, pw, 1.25, k3(t, s0, s0 + 1.1)); c.restore() }
      if(aa > .5) reg("inlagg", x, py, pw, ph);
    }
  }
}
function sndSkane(H){ [0, 1, 2, 3].forEach(function(i){ H.s(i % 2 ? "shutter2" : "shutter", .45 + i*1.3, .45) }); [0, 1, 2].forEach(function(i){ H.s("thunk", 7.65 + i*.45, .35) }) }

/* ---------- komponera ---------- */
var BOOK = {b:"a7.btnB"};
window.V3_ADS8 = [];
function loadAudio8(){ return v3SfxLoad() }
function reg8(id, n, d, L, fn, thumb, sched, purpose){
  var comp = {n:n, d:d, group:"ads8", dur:L + END_L, thumb:thumb, id:id, v:{id:id}, L:L, purpose:purpose};
  comp.draw = function(c, G, t){ fn(c, G, t); if(t >= L) K.endSeq(c, G, t, L, BOOK) };
  comp.mix = K.makeMix(sched); comp.loadAudio = loadAudio8;
  V3_COMPS[id] = comp; V3_ADS8.push(id);
}
reg8("a8_ny", "1 · Ny aktör", "Bostadsfoto. Och lite till. Fyra steg, ett flöde.", L1, adNy, 10.4, sndNy);
reg8("a8_plattform", "2 · Plattformen", "Från intag till inlägg i mäklarportalen.", L2, adPlatt, 11.2, sndPlatt);
reg8("a8_tid", "3 · Tiden", "Listan över allt som tar tid blir en leverans.", L3, adTid, 10.8, sndTid);
reg8("a8_mote", "4 · Intagsmötet", "Din nästa säljare har redan sett ditt flöde.", L4, adMote, 9.0, sndMote);
reg8("a8_skane", "5 · Skåne", "Din bostadsfotograf i Skåne, och allt efter fotograferingen.", L5, adSkane, 9.6, sndSkane);

/* ---------- annonsplan ---------- */
var PLAN = [
  {id:"a8_ny", t:"1 · Ny aktör", syfte:"Kännedom. Mäklaren förstår att det finns en ny aktör inom bostadsfotografering, och att den gör mer än foton.", steg:"Överst i tratten. Kall målgrupp. Visas först.", prim:"Bostadsfoto. Och lite till. Viewly samlar hela flödet för mäklare i Skåne, från intag och fotografering till portal, appar och sociala medier.", rub:"Ny aktör inom bostadsfotografering", cta:"Läs mer", mal:"Räckvidd, ThruPlay, andel som ser över 3 sekunder."},
  {id:"a8_plattform", t:"2 · Plattformen", syfte:"Förklaring. Det här är hur det ser ut när allt ligger i en plattform.", steg:"Mitten. Visas för dem som sett annons 1 eller delar av den.", prim:"Intag, fotografering, kampanj och sociala medier på samma ställe. Se hur ett uppdrag går från start till färdiga inlägg.", rub:"Från intag till inlägg", cta:"Läs mer", mal:"ThruPlay, klick till viewly.se."},
  {id:"a8_tid", t:"3 · Tiden", syfte:"Sälja tidsvinsten utan att lova siffror: allt som tar tid mellan intag och visning blir en leverans.", steg:"Mitten. Tydligast för mäklare som redan tänker på sin tid.", prim:"Mellan intag och visning finns en lång lista. Vi samlar den i en leverans, så du får mer tid till nästa intag.", rub:"En leverans. Mer tid.", cta:"Boka nu", mal:"Klick, tid på sidan, bokningar."},
  {id:"a8_mote", t:"4 · Intagsmötet", syfte:"Resultat: en starkare digital närvaro gör att säljaren redan har en bild av dig före mötet.", steg:"Mitten till botten. Känslan: det här gäller min nästa säljare.", prim:"Din nästa säljare tittar på ditt flöde innan hen bokar möte. Gör det värt att scrolla.", rub:"Starkare närvaro före intaget", cta:"Läs mer", mal:"Klick, delningar, sparade."},
  {id:"a8_skane", t:"5 · Skåne", syfte:"Lokal tyngd. Bostadsfotografering är kärnan, och allt efter fotograferingen ingår.", steg:"Botten. Retargeting mot dem som sett minst hälften av en tidigare annons.", prim:"Din bostadsfotograf i Skåne. Och allt som kommer efter fotograferingen. Boka fotografering på viewly.se.", rub:"Din bostadsfotograf i Skåne", cta:"Boka nu", mal:"Bokningar, kostnad per klick."}
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
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 16 · bygge 48</div><h2>Kampanjen</h2>'
    + '<p>Fem annonser, var och en med ett eget syfte, för mäklare i Skåne på Facebook och Instagram. De ska skapa kännedom: att det finns en ny aktör inom bostadsfotografering, och att hela flödet, från intag och fotografering till portal, appar och sociala medier, finns på ett ställe. Lugn rörelse, få och riktiga ljud, begripligt utan ljud. Alla slutar med Boka fotografering. Förslag, inget publicerat.</p></div>'
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
    + '<p class="a3lede">Så här är kampanjen tänkt: en kampanj med målet kännedom (räckvidd och videovisningar) mot mäklare i Skåne, med alla fem annonser i samma annonsgrupp. Annonserna är olika på riktigt (olika syfte, upplägg och bild), eftersom Meta visar lika annonser mot varandra i stället för att nå fler. Ett andra steg riktas mot dem som sett minst hälften av en annons, med annons 3 och 5 och knappen Boka nu.</p>'
    + '<div class="a3copy">' + PLAN.map(function(p){ return '<div><b>' + esc(p.t) + '</b><p>' + esc(p.syfte) + '</p><b>Steg i tratten</b><p>' + esc(p.steg) + '</p><b>Primärtext</b><p>' + esc(p.prim) + '</p><b>Rubrik · knapp</b><p>' + esc(p.rub) + ' · ' + esc(p.cta) + '</p><b>Mäts på</b><p>' + esc(p.mal) + '</p></div>' }).join("") + '</div>'
    + '<details class="a3det a3cust"><summary>Texter i filmerna</summary><div class="a3hxs">' + ["a7.btnB", "a7.url", "a7.tag"].map(function(k){ return v3TxField(k, k === "a7.btnB" ? "Slutet · knappens text" : k === "a7.url" ? "Slutet · adressen" : "Slutet · raden efter adressen") }).join("") + '</div></details>'
    + ["ny", "pl", "ti", "in", "sk"].map(function(p, i){ return txEd("a8." + p + ".", ["1 · Ny aktör", "2 · Plattformen", "3 · Tiden", "4 · Intagsmötet", "5 · Skåne"][i]) }).join("")
    + '<details class="a3det"><summary>Underlag: vad som är kontrollerat och vad som inte är det</summary><div class="a3und">'
    + '<div><b>Metas säkra yta (kontrollerat)</b><p>Metas annonsguide rekommenderar att cirka 14 % överst, 35 % nederst och 6 % på sidorna lämnas fria från text och logotyper i Reels. Allt viktigt i 9:16 ligger därför i mitten, och rubriker, bilder och text i filmerna ligger ovanför den nedre delen. Slutkortet är litet och centrerat, och ligger utanför Metas nedre zon. Förklaringen bygger på <a href="https://www.facebook.com/business/ads-guide/update/image/instagram-reels" target="_blank" rel="noopener">Metas annonsguide för Reels</a>.</p></div>'
    + '<div><b>Olika annonser, inte varianter (delvis kontrollerat)</b><p>Flera branschkällor skriver att Meta slår ihop och konkurrerar ut annonser som liknar varandra, och att 3 till 5 riktigt olika annonser är rimligt för en liten kampanj. Det kommer från byråer och inte från Meta själv. Siffrorna om likhetströsklar är obekräftade.</p></div>'
    + '<div><b>Ljud av, text på (branschkällor)</b><p>Många tittar utan ljud, så allt som betyder något står som text. Siffran 85 % kommer från branschsammanställningar, inte från Meta.</p></div>'
    + '<div><b>Längd (branschkällor)</b><p>Källorna går isär: 6 till 15 sekunder för kännedom eller 15 till 30. Annonserna är 18 till 20 sekunder med slutet, vilket ligger mellan de två.</p></div>'
    + '<div><b>Målgruppen på Meta (inte kontrollerat)</b><p>Det går inte att lita på att yrket fastighetsmäklare går att rikta mot på Meta. Kontrollera i annonshanteraren om det finns, annars rikta mot Skåne, och låta annonsen själv välja målgrupp genom att tala till mäklare. Kontrollera även om Meta räknar annonserna som bostadsannonser (särskild annonskategori).</p></div>'
    + '<div><b>Psykologin (hypoteser)</b><p>Samlat flöde minskar valbördan. Förlustformulering ("den långa listan") brukar väga tyngre än vinstformulering, men det finns inga mätningar för just den här målgruppen. Testa annons 3 mot annons 5.</p></div>'
    + '<div><b>Påståenden</b><p>Inga siffror, inga löften om tid eller intäkter. Stegen Intag, Fotografering, Mäklarportal och Sociala medier ska stämma med vad plattformen gör i dag. Namn, adress och mäklare i bilderna är exempel.</p></div>'
    + '<div><b>Bilder och ljud</b><p>Bara era egna bilder (sida 15 och sängen från Såld). Riktiga ljud, CC0: klick, kameraslutare, mjuk duns, tick. Ingen musik.</p></div></div></details></div>';
};
})();
