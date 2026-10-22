/* =====================================================================
   SIDA 16 — KAMPANJEN: NY AKTÖR INOM BOSTADSFOTOGRAFI
   Tre annonser för den enskilda mäklaren i Skåne på Facebook och Instagram.

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
V3_KEYS.rs_dusk1 = "rsDusk1"; V3_KEYS.rs_dusk2 = "rsDusk2"; V3_POS.rs_dusk1 = [.5, .5]; V3_POS.rs_dusk2 = [.45, .5];
var P = {chair:"rs_chair", dining:"rs_dining", kitchen:"rs_kitchen", floor:"rs_floor", statue:"rs_statue", bed:"bedroom"};

/* ---------- redigerbara texter ---------- */
var TX = {
  "a8.ny.l1":["Bostadsfoto.", "1 · rubrik, rad 1"], "a8.ny.l2":["Och lite till.", "1 · rubrik, rad 2"],
  "a8.ny.a1":["Starkare närvaro,", "1 · budskap 1, del 1"], "a8.ny.a2":["starkare varumärke.", "1 · budskap 1, del 2"], "a8.ny.b1":["Mindre administration,", "1 · budskap 2, del 1"], "a8.ny.b2":["mer försäljning.", "1 · budskap 2, del 2"], "a8.ny.c1":["Bättre prestationer,", "1 · budskap 3, del 1"], "a8.ny.c2":["större möjligheter.", "1 · budskap 3, del 2"],
  "a8.re.l1":["Ett objekt.", "2 · rubrik, rad 1"], "a8.re.l2":["Hela vägen.", "2 · rubrik, rad 2"],
  "a8.re.addr":["Storgatan 15", "2 · adressen"], "a8.re.city":["Helsingborg", "2 · orten"], "a8.re.facts":["3 rum · 74 m²", "2 · rum och yta"],
  "a8.re.s1a":["Redan på intaget.", "2 · intag, rad 1"], "a8.re.s1b":["Hur annonsen kan se ut.", "2 · intag, rad 2"],
  "a8.re.s2a":["Bokningen", "2 · bokning, rad 1"], "a8.re.s2b":["fyller i resten.", "2 · bokning, rad 2"],
  "a8.re.s3a":["Leveransen", "2 · leverans, rad 1"], "a8.re.s3b":["i ert varumärke.", "2 · leverans, rad 2"],
  "a8.re.s4a":["Annonstexten", "2 · annonstext, rad 1"], "a8.re.s4b":["med ett klick.", "2 · annonstext, rad 2"],
  "a8.re.s5a":["Inläggen", "2 · inlägg, rad 1"], "a8.re.s5b":["av era levererade bilder.", "2 · inlägg, rad 2"],
  "a8.re.f1":["Spara tid.", "2 · slutsats, del 1"], "a8.re.f2":["Få bättre resultat.", "2 · slutsats, del 2"],
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

/* =====================================================================
   1 · BOSTADSFOTO. OCH LITE TILL.   (mörk, fotografisk, kännedom)
   Fotografering först. "Lite till" är det som skiljer er: mer än en fotograf,
   mäklarens presentation och varumärke, ett starkare intag och resultat.
   ===================================================================== */
var L1 = 13.8;
/* samma takt överallt: första delen animeras in, en liten paus, sedan andra delen */
var PART = .75, PAUSE = .3, NY_CUT = [3.0, 7.6, 10.7];
var NY_S = [["a1", "a2", 4.8], ["b1", "b2", 7.9], ["c1", "c2", 11.0]];
function twoPart(c, t, t0, tOut, l1, l2, size, cy){
  var aOut = 1 - rev(t, tOut, .35), a1 = rev(t, t0, .3)*aOut, a2 = rev(t, t0 + PART + PAUSE, .3)*aOut;
  v3Text(c, l1, 50, cy, {size:size, color:"#fff", align:"c", alpha:a1, p:oQ(k3(t, t0, t0 + PART)), rise:2, shadow:true});
  v3Text(c, l2, 50, cy + size*1.18, {size:size, italic:true, color:C3.cream, align:"c", alpha:a2, p:oQ(k3(t, t0 + PART + PAUSE, t0 + 2*PART + PAUSE)), rise:2, shadow:true});
  if(a1 > .5) reg("rubrik", 8, cy - size*.85, 84, size*(a2 > .5 ? 2.3 : 1.1), {head:1});
}
function adNy(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Fill(c, 0, 0, 100, H, DARK);
  /* bildspåret: sängen, stolen, matplatsen, sängen, med hårda klipp */
  var a2 = t >= NY_CUT[0] ? 1 : 0, a3 = t >= NY_CUT[1] ? 1 : 0, a4 = t >= NY_CUT[2] ? 1 : 0;
  v3Photo(c, P.bed, 0, 0, 100, H, {scale:lerp(1.05, 1.16, k3(t, 0, 5)), pos:V3_POS.bedroom, alpha:ioC(k3(t, 0, .6))});
  if(a2 > 0) v3Photo(c, P.chair, 0, 0, 100, H, {scale:lerp(1.05, 1.14, k3(t, NY_CUT[0], 8)), pos:V3_POS.rs_chair, alpha:1});
  if(a3 > 0) v3Photo(c, P.dining, 0, 0, 100, H, {scale:lerp(1.05, 1.14, k3(t, NY_CUT[1], 10.7)), pos:V3_POS.rs_dining, alpha:1});
  if(a4 > 0) v3Photo(c, P.bed, 0, 0, 100, H, {scale:lerp(1.16, 1.05, k3(t, NY_CUT[2], 13.8)), pos:V3_POS.bedroom, alpha:1});
  var hold = rev(t, 4.0, .8);
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", .28 + .10*a2 + .30*hold);
  v3Grad(c, 0, 0, 100, H*.3, [[0, "rgba(8,7,7,.55)"], [1, "rgba(8,7,7,0)"]]);
  v3Frame(c, 4, 4, 92, H - 8, "#fff", .26, oQ(k3(t, .2, 1.8)), .5);
  lab(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, S.y0 + 2.6, rev(t, .4, .8)*.92, {size:2.1, color:"#fff", align:"c", weight:500, sp:.3});
  reg("etikett", 10, S.y0, 80, 3.8);
  var sH = G.is9 ? 15 : 12, cy = S.y0 + S.h*.46;
  /* en gemensam storlek för alla budskap, så att de ser likadana ut */
  var sU = sH, l1 = T("a8.ny.l1"), l2 = T("a8.ny.l2"), keys = ["a1", "a2", "b1", "b2", "c1", "c2"];
  var sHero = Math.min(fz(c, l1, {size:sH, weight:300}, 84), fz(c, l2, {size:sH, weight:300, italic:true}, 84));
  keys.forEach(function(k, j){ sU = Math.min(sU, fz(c, T("a8.ny." + k), {size:sH, weight:300, italic:j % 2 === 1}, 84)) });
  /* öppningen och de tre budskapen: alla med samma takt */
  twoPart(c, t, .6, 4.0, l1, l2, sHero, cy);
  for(i = 0; i < 3; i++) twoPart(c, t, NY_S[i][2], i < 2 ? NY_S[i][2] + 2.4 : 99, T("a8.ny." + NY_S[i][0]), T("a8.ny." + NY_S[i][1]), sU, cy);
}
function sndNy(H){ H.s("shutter", .1, .6); NY_CUT.forEach(function(s){ H.s("shutter", s, .6) }) }

/* =====================================================================
   2 · ETT OBJEKT. HELA VÄGEN.   (mörk, fotografisk: ett objekt följs genom hela flödet)
   Intag, bokning, leverans i mäklarportalen, annonstext och inlägg. Samma bostad,
   samma uppgifter och kontorets utseende hela vägen. Sparar tid och ger bättre resultat.
   ===================================================================== */
var L6 = 17.3, STN = ["INTAG", "BOKNING", "LEVERANS", "ANNONS", "INLÄGG"];
var SC6 = [2.6, 5.8, 8.4, 10.0, 11.5, 14.4], TS6 = [12.0, 12.9, 13.7], RE_CUT = [2.6, 5.8, 8.4, 11.5];
var WHITE = "#fff", SOFT = "rgba(255,255,255,.74)";
function glass(c, x, y, w, h, a, r){
  if(a <= .02) return; c.save(); c.globalAlpha = a;
  c.fillStyle = "rgba(16,14,14,.46)"; rr(c, x, y, w, h, r == null ? 2 : r); c.fill();
  c.strokeStyle = "rgba(255,255,255,.3)"; c.lineWidth = .25; rr(c, x, y, w, h, r == null ? 2 : r); c.stroke(); c.restore();
}
function reTitle(c, G, t, i, y0, sT){
  var t0 = i === 3 ? SC6[3] : i === 4 ? SC6[4] : SC6[i], t1 = i === 2 ? SC6[3] : i === 3 ? SC6[4] : i === 4 ? SC6[5] : SC6[i + 1];
  var a = rev(t, t0 + .1, .45)*(1 - rev(t, t1 - .3, .3)), l1 = T("a8.re.s" + (i + 1) + "a"), l2 = T("a8.re.s" + (i + 1) + "b");
  if(a > .02){
    v3Text(c, l1, MX, y0 + sT*.8, {size:sT, color:WHITE, alpha:a, p:oQ(k3(t, t0 + .1, t0 + .8)), rise:2, shadow:true});
    v3Text(c, l2, MX, y0 + sT*1.95, {size:sT, italic:true, color:"#e9eadf", alpha:a*rev(t, t0 + .45, .4), p:oQ(k3(t, t0 + .45, t0 + 1.2)), rise:2, shadow:true});
    if(a > .5) reg("rubrik", MX, y0, 84, sT*2.3, {head:1});
  }
}
function adResa(c, G, t){
  var H = G.H, S = SG(G), i, j;
  v3Fill(c, 0, 0, 100, H, DARK);
  /* bildspåret med hårda klipp: sängen, matplatsen, köket, skymningen, skymningen från hörnet */
  var bgK = t < RE_CUT[0] ? P.bed : t < RE_CUT[1] ? P.dining : t < RE_CUT[2] ? P.kitchen : t < RE_CUT[3] ? "rs_dusk1" : "rs_dusk2";
  var bgS = t < RE_CUT[0] ? 0 : t < RE_CUT[1] ? RE_CUT[0] : t < RE_CUT[2] ? RE_CUT[1] : t < RE_CUT[3] ? RE_CUT[2] : RE_CUT[3];
  var bgE = t < RE_CUT[0] ? 5 : t < RE_CUT[1] ? RE_CUT[1] + 1 : t < RE_CUT[2] ? RE_CUT[2] + 1 : t < RE_CUT[3] ? RE_CUT[3] + 1 : L6;
  v3Photo(c, bgK, 0, 0, 100, H, {scale:lerp(1.05, 1.13, k3(t, bgS, bgE)), pos:V3_POS[bgK], alpha:t < .6 ? ioC(k3(t, 0, .6)) : 1});
  var introDim = t < RE_CUT[0] ? .30 + .30*rev(t, 1.0, .6) : .66;
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", introDim + .14*rev(t, SC6[5], .5));
  v3Grad(c, 0, 0, 100, H*.3, [[0, "rgba(8,7,7,.55)"], [1, "rgba(8,7,7,0)"]]);
  v3Frame(c, 4, 4, 92, H - 8, WHITE, .26, oQ(k3(t, .2, 1.8)), .5);
  /* öppningen */
  var introA = 1 - rev(t, 2.3, .3);
  lab(c, "VIEWLY · FÖR FASTIGHETSMÄKLARE", 50, S.y0 + 2.6, rev(t, .4, .8)*.92*introA, {size:2.1, color:WHITE, align:"c", weight:500, sp:.3});
  var sH = G.is9 ? 15 : 12, l1 = T("a8.re.l1"), l2 = T("a8.re.l2"), sHero = Math.min(sH, fz(c, l1, {size:sH, weight:300}, 84), fz(c, l2, {size:sH, weight:300, italic:true}, 84));
  twoPart(c, t, .6, 2.2, l1, l2, sHero, S.y0 + S.h*.42);
  /* stationsraden */
  var ra = rev(t, 2.7, .5)*(1 - rev(t, SC6[5] - .4, .3)), st = t < SC6[1] ? 0 : t < SC6[2] ? 1 : t < SC6[3] ? 2 : t < SC6[4] ? 3 : 4;
  var ends = [SC6[1], SC6[2], SC6[3], SC6[4], SC6[5]], begs = [SC6[0], SC6[1], SC6[2], SC6[3], SC6[4]];
  if(ra > .02){
    var sw = (84 - 4*1.2)/5, ry = S.y0 + 1.8;
    for(i = 0; i < 5; i++){
      var sx = MX + i*(sw + 1.2), pr = clamp((t - begs[i])/(ends[i] - begs[i]), 0, 1);
      v3Fill(c, sx, ry, sw, .5, WHITE, .22*ra); if(pr > 0) v3Fill(c, sx, ry, sw*pr, .5, i < st ? C3.olil : WHITE, .95*ra);
    }
    lab(c, (st + 1) + " · " + STN[st], MX, ry + 4.4, ra*.95, {size:2.3, color:WHITE, weight:600, sp:.3, shadow:true});
    lab(c, (T("a8.re.addr") + " · " + T("a8.re.city")).toUpperCase(), 100 - MX, ry + 4.4, ra*.8, {size:2, color:SOFT, align:"r", weight:500, sp:.26, shadow:true});
  }
  var sT = G.is9 ? 7.4 : 6.4, Y0 = S.y0 + 9, yc = Y0 + sT*2.3 + 3.2, hAv = S.y1 - yc, u;
  for(i = 0; i < 5; i++) reTitle(c, G, t, i, Y0, sT);
  /* 1 · intag: mäklaren visar säljaren hur annonsen kan se ut */
  if(t >= SC6[0] && t < SC6[1]){
    u = Math.min(1.2, hAv/68);
    var o = 1 - rev(t, SC6[1] - .3, .3), rh = 12.2*u, gp = 1.5*u, rows = [["BOSTADSTYP", "Lägenhet"], ["STORLEK", T("a8.re.facts")], ["PRISSEGMENT", "4–7 miljoner"]];
    for(i = 0; i < 3; i++){
      var r0 = 3.4 + i*.4, ra2 = rev(t, r0, .45)*o, ry2 = yc + i*(rh + gp);
      if(ra2 <= .02) continue;
      glass(c, MX, ry2, 84, rh, ra2, 2);
      lab(c, rows[i][0], MX + 4, ry2 + 3.7, ra2, {size:2, color:SOFT, shadow:true});
      v3Text(c, rows[i][1], MX + 4, ry2 + rh - 2.4, {size:4.5*Math.max(.85, u), color:WHITE, alpha:ra2, p:oQ(k3(t, r0 + .1, r0 + .7))});
      tickC(c, 100 - MX - 5, ry2 + rh/2, 2.2, k3(t, r0 + .5, r0 + .9), C3.olil);
      if(ra2 > .5) reg("kort", MX, ry2, 84, rh);
    }
    var cy2 = yc + 3*(rh + gp) + 1.5*u, ch = 25*u, ca = rev(t, 4.3, .5)*o;
    if(ca > .02){
      var sc = lerp(.97, 1, oQ(k3(t, 4.3, 5.0))); c.save(); c.translate(50, cy2 + ch/2); c.scale(sc, sc); c.translate(-50, -cy2 - ch/2);
      glass(c, MX, cy2, 84, ch, ca, 2.2);
      lab(c, "FÖRSLAG · PREMIUM", MX + 4, cy2 + 5, ca, {size:2.1, color:C3.olil, weight:600, shadow:true});
      var tw = 84 - 8 - 19, a1 = "Bostadsfilm och skymningsbilder", a2 = "ger ett starkare första intryck.";
      v3Text(c, a1, MX + 4, cy2 + ch*.6, {size:Math.min(4, fz(c, a1, {size:4}, tw)), color:WHITE, alpha:ca, p:oQ(k3(t, 4.5, 5.2))});
      v3Text(c, a2, MX + 4, cy2 + ch*.6 + 5, {size:Math.min(3.3, fz(c, a2, {size:3.3, italic:true}, tw)), italic:true, color:C3.cream, alpha:ca*rev(t, 4.8, .4), p:oQ(k3(t, 4.8, 5.4))});
      thumb(c, "rs_dusk1", 100 - MX - 4 - 15, cy2 + 3.5, 15, ch - 7, ca, 1);
      c.restore(); if(ca > .5) reg("kort", MX, cy2, 84, ch);
    }
  }
  /* 2 · bokning: uppgifterna fylls i */
  if(t >= SC6[1] && t < SC6[2]){
    u = Math.min(1.2, hAv/46);
    var o2 = 1 - rev(t, SC6[2] - .3, .3), bh = 17*u, by = yc, ba = rev(t, 6.3, .5)*o2, sc2 = lerp(.97, 1, oQ(k3(t, 6.3, 7.0)));
    if(ba > .02){
      c.save(); c.translate(50, by + bh/2); c.scale(sc2, sc2); c.translate(-50, -by - bh/2);
      glass(c, MX, by, 84, bh, ba, 2.2);
      lab(c, "BOKNING", MX + 4, by + 4.8, ba, {size:2.1, color:C3.olil, weight:600, shadow:true});
      v3Text(c, T("a8.re.addr"), MX + 4, by + bh - 3.4, {size:6.2*Math.max(.85, u), color:WHITE, alpha:ba, p:oQ(k3(t, 6.5, 7.2))});
      v3Text(c, T("a8.re.city") + " · " + T("a8.re.facts"), 100 - MX - 4, by + bh - 3.8, {size:2.9, weight:500, f:"sans", color:SOFT, align:"r", alpha:ba*rev(t, 6.9, .4)});
      tickC(c, 100 - MX - 5, by + 4.2, 2, k3(t, 7.1, 7.5), C3.olil);
      c.restore(); if(ba > .5) reg("kort", MX, by, 84, bh);
    }
    var chy = by + bh + 2.6*u, chh = 6.6*u, chips = ["Foto", "Skymning", "Planritning", "Områdesbilder"], cw = (84 - 3*1.4)/4;
    for(i = 0; i < 4; i++){
      var ca2 = rev(t, 6.8 + i*.14, .4)*o2, cx = MX + i*(cw + 1.4); if(ca2 <= .02) continue;
      glass(c, cx, chy, cw, chh, ca2, chh/2);
      v3Text(c, chips[i], cx + cw/2, chy + chh*.66, {size:Math.min(2.8, fz(c, chips[i], {size:2.8, f:"sans", weight:500}, cw - 2.2)), f:"sans", weight:500, color:WHITE, align:"c", alpha:ca2});
    }
    if(o2*rev(t, 6.8, .4) > .5) reg("rad", MX, chy, 84, chh);
    var ty = chy + chh + 8*u, tx0 = MX + 8, tx1 = 100 - MX - 8, ta = rev(t, 6.9, .5)*o2, names = ["BOKAD", "FOTOGRAFERAD", "LEVERERAD"], tn = [6.9, 7.3, 7.7];
    if(ta > .02){
      v3Fill(c, tx0, ty, tx1 - tx0, .4, WHITE, .25*ta);
      v3Fill(c, tx0, ty, (tx1 - tx0)*k3(t, 6.9, 7.8), .4, C3.olil, .95*ta);
      for(i = 0; i < 3; i++){
        var nx = tx0 + i*(tx1 - tx0)/2, on = t >= tn[i];
        dot(c, nx, ty + .2, 1.5, on ? C3.olil : "rgba(255,255,255,.35)", ta);
        lab(c, names[i], nx, ty + 6, ta*(on ? 1 : .6), {size:2.1, color:WHITE, align:i === 0 ? "c" : i === 1 ? "c" : "c", weight:600, sp:.2, shadow:true});
      }
      reg("rad", MX, ty - 2, 84, 11);
    }
  }
  /* 3 + 4 · leverans i portalen i kontorets utseende, sedan annonstexten */
  if(t >= SC6[2] && t < SC6[4]){
    u = Math.min(1.2, hAv/72);
    var o3 = 1 - rev(t, SC6[4] - .3, .3), ph0 = yc, hh = 10*u, ph = 37*u, pa = rev(t, 8.9, .5)*o3, sc3 = lerp(.97, 1, oQ(k3(t, 8.9, 9.6)));
    if(pa > .02){
      c.save(); c.translate(50, ph0 + ph/2); c.scale(sc3, sc3); c.translate(-50, -ph0 - ph/2);
      glass(c, MX, ph0, 84, ph, pa, 2.2);
      dot(c, MX + 7, ph0 + hh/2 + .6, 2.8*Math.max(.85, u), C3.cream, pa);
      v3Text(c, "ER", MX + 7, ph0 + hh/2 + 1.6, {size:2.7, weight:700, f:"sans", color:"#1F4B39", align:"c", alpha:pa});
      v3Text(c, "Er Mäklarbyrå", MX + 12.5, ph0 + hh/2 + 1.3, {size:4*Math.max(.85, u), color:WHITE, alpha:pa, p:oQ(k3(t, 9.0, 9.7))});
      var pw2 = 19; glass(c, 100 - MX - 4 - pw2, ph0 + hh/2 - 2.1, pw2, 4.4, pa, 2.2);
      lab(c, "LEVERERAD", 100 - MX - 4 - pw2/2, ph0 + hh/2 + .8, pa, {size:2, color:C3.olil, align:"c", weight:600, sp:.2});
      var tks = ["rs_dusk1", "rs_dusk2", P.dining, P.chair], tw2 = (84 - 8 - 3*1.6)/4, th2 = tw2*.72, ty2 = ph0 + hh + 3*u;
      for(j = 0; j < 4; j++) thumb(c, tks[j], MX + 4 + j*(tw2 + 1.6), ty2, tw2, th2, pa*rev(t, 9.2 + j*.18, .4), 1);
      lab(c, "4 BILDER KLARA · I KONTORETS PROFIL", MX + 4, ty2 + th2 + 5*u, pa*rev(t, 9.9, .4), {size:2.1, color:SOFT, weight:500, sp:.2, shadow:true});
      c.restore(); if(pa > .5) reg("kort", MX, ph0, 84, ph);
    }
    var by3 = ph0 + ph + 2.6*u, bh3 = 8*u, ba3 = rev(t, 9.6, .45)*o3, press = t > 10.1 ? 1 - Math.min(1, k3(t, 10.1, 10.4)) : 0;
    if(ba3 > .02){
      var bw = 42, bsc = 1 - .05*Math.sin(Math.min(1, k3(t, 10.1, 10.4))*Math.PI); c.save(); c.translate(50, by3 + bh3/2); c.scale(bsc, bsc); c.translate(-50, -by3 - bh3/2);
      c.save(); c.globalAlpha = ba3; c.fillStyle = C3.olil; rr(c, 50 - bw/2, by3, bw, bh3, bh3/2); c.fill(); c.restore();
      v3Text(c, "Skapa annonstext", 50, by3 + bh3*.64, {size:Math.min(3.5, bh3*.46), f:"sans", weight:600, color:"#1c1c1e", align:"c", alpha:ba3});
      c.restore(); if(ba3 > .5) reg("rad", 50 - bw/2, by3, bw, bh3);
    }
    var ay = by3 + bh3 + 2.2*u, ah = Math.max(16, Math.min(24*u, S.y1 - ay)), aa = rev(t, 10.4, .5)*o3;
    if(aa > .02){
      glass(c, MX, ay, 84, ah, aa, 2);
      lab(c, "ANNONSTEXT", MX + 4, ay + 4.6, aa, {size:2, color:C3.olil, weight:600, shadow:true});
      var tl = ["Välkommen till " + T("a8.re.addr") + ". En ljus trea", "med inglasad balkong och utsikt", "över " + T("a8.re.city") + "."];
      for(j = 0; j < 3; j++){
        var s0 = 10.5 + j*.5;
        v3Text(c, tl[j], MX + 4, ay + 10 + j*4.6*Math.max(.85, u), {size:Math.min(3.3, fz(c, tl[j], {size:3.3}, 76)), color:WHITE, alpha:aa*(t >= s0 ? 1 : 0), p:clamp(k3(t, s0, s0 + .55), 0, 1)});
      }
      if(aa > .5) reg("kort", MX, ay, 84, ah);
    }
  }
  /* 5 · inlägg: välj levererade bilder, välj mall, färdigt */
  if(t >= SC6[4] && t < SC6[5]){
    var o5 = 1 - rev(t, SC6[5] - .3, .3), pw = Math.min(46, hAv/1.25), ph5 = pw*1.25, px = MX, pa5 = rev(t, 11.9, .6)*o5, k5 = t < TS6[1] ? 0 : t < TS6[2] ? 1 : 2;
    if(pa5 > .02){
      var sc5 = lerp(.95, 1, oQ(k3(t, 11.9, 12.8)));
      c.save(); c.globalAlpha = pa5; c.translate(px + pw/2, yc + ph5/2); c.scale(sc5, sc5); c.translate(-px - pw/2, -yc - ph5/2);
      c.shadowColor = "rgba(0,0,0,.4)"; c.shadowBlur = 7; c.shadowOffsetY = 1.6; c.fillStyle = "#000"; rr(c, px, yc, pw, ph5, pw*.025); c.fill(); c.shadowColor = "transparent";
      var wk = k5 > 0 ? ioC(k3(t, TS6[k5], TS6[k5] + .8)) : 1;
      for(i = wk < .999 ? Math.max(0, k5 - 1) : k5; i <= k5; i++){
        var wp = i === 0 ? 1 : ioC(k3(t, TS6[i], TS6[i] + .8)), prog = k3(t, TS6[i] + (i === 0 ? .1 : .4), TS6[i] + (i === 0 ? 1.5 : 1.8));
        if(i === k5 && i > 0){ c.save(); c.beginPath(); c.rect(px, yc, pw*wp, ph5); c.clip(); tpl(c, KINDS[i], px, yc, pw, prog, DOBJ()); c.restore(); if(wp < 1) v3Fill(c, px + pw*wp - .2, yc, .4, ph5, WHITE, .7) }
        else tpl(c, KINDS[i], px, yc, pw, i < k5 ? 1 : prog, DOBJ());
      }
      c.restore(); if(pa5 > .5) reg("inlagg", px, yc, pw, ph5);
    }
    var cx0 = MX + pw + 4, cw5 = 84 - pw - 4, ra5 = rev(t, 11.7, .5)*o5, tw5 = (cw5 - 1.6)/2, th5 = tw5*.7, sel = [0, 2, 1][k5];
    var tk5 = ["rs_dusk1", "rs_dusk2", P.dining, P.chair];
    lab(c, "VÄLJ BILDER", cx0, yc + 2, ra5, {size:2.1, color:SOFT, weight:600, sp:.22, shadow:true});
    for(i = 0; i < 4; i++) thumb(c, tk5[i], cx0 + (i % 2)*(tw5 + 1.6), yc + 4.6 + Math.floor(i/2)*(th5 + 1.6), tw5, th5, ra5*rev(t, 11.8 + i*.1, .4), 1);
    if(ra5 > .3){
      var ring = [[0, 0], [1, 0], [0, 1], [1, 1]][sel], rx = cx0 + ring[0]*(tw5 + 1.6), ryy = yc + 4.6 + ring[1]*(th5 + 1.6);
      c.save(); c.globalAlpha = ra5*rev(t, 12.1, .3); c.strokeStyle = C3.olil; c.lineWidth = .55; rr(c, rx - .5, ryy - .5, tw5 + 1, th5 + 1, 1.3); c.stroke(); c.restore();
    }
    var sy5 = yc + 4.6 + 2*th5 + 1.6 + 6, cols = [ORANGE, GREEN, "#F4F0E8"];
    lab(c, "VÄLJ MALL", cx0, sy5, ra5*rev(t, 12.0, .4), {size:2.1, color:SOFT, weight:600, sp:.22, shadow:true});
    for(i = 0; i < 3; i++){
      var scx = cx0 + 3.6 + i*8.4, scy = sy5 + 5.4, sa = ra5*rev(t, 12.1 + i*.1, .4);
      dot(c, scx, scy, 3, cols[i], sa);
      if(i === k5 && sa > .1){ c.save(); c.globalAlpha = sa; c.strokeStyle = WHITE; c.lineWidth = .45; c.beginPath(); c.arc(scx, scy, 4.1, 0, 7); c.stroke(); c.restore() }
    }
    var qa = ra5*rev(t, 12.6, .4), qy = sy5 + 12;
    if(qa > .02){ glass(c, cx0, qy, cw5, 6, qa, 3); v3Text(c, "Kontorets profil", cx0 + 3, qy + 4, {size:2.6, f:"sans", weight:500, color:WHITE, alpha:qa}); tickC(c, cx0 + cw5 - 4, qy + 3, 1.6, k3(t, 12.9, 13.3), C3.olil) }
    if(ra5 > .5) reg("kort", cx0, yc, cw5, qy + 6 - yc);
  }
  /* slutsatsen */
  if(t >= SC6[5]) twoPart(c, t, SC6[5] + .5, 99, T("a8.re.f1"), T("a8.re.f2"), G.is9 ? 12 : 10, S.y0 + S.h*.46);
}
function DOBJ(){ return {addr:T("a8.re.addr"), city:T("a8.re.city"), facts:T("a8.re.facts"), agent:"Anna Lindqvist", ph:{o:"rs_dusk1", g:P.dining, e:"rs_dusk2"}} }
function sndResa(H){ H.s("shutter", .1, .6); RE_CUT.forEach(function(s){ H.s("shutter", s, .6) }); [6.9, 7.3, 7.7, 10.1, 12.9, 13.7].forEach(function(s){ H.s("tick1", s, .05) }) }

/* =====================================================================
   5 · SKÅNE   (foto + ett inlägg i tre kontors utseende, uppgifterna följer med)
   ===================================================================== */
var L5 = 13.6, CITIES = ["Malmö", "Lund", "Landskrona", "Helsingborg"];
var ORANGE = "#F2681C", GREEN = "#1F4B39", DATA = {addr:"Storgatan 13", city:"Landskrona", facts:"4 rum · 112 m²", agent:"Anna Lindqvist"};
/* tre mallar med egna nyanser och egna layouter: orange med kräm-kort, grön med båge, editorial. Inga namn eller märken. */
function archPath(c, x0, y0, w, y1){ var R = w/2; c.beginPath(); c.moveTo(x0, y1); c.lineTo(x0, y0 + R); c.arc(x0 + R, y0 + R, R, Math.PI, 0); c.lineTo(x0 + w, y1); c.closePath() }
function tpl(c, kind, x, y, w, prog, d){
  var D = d || DATA, PH = d ? d.ph : {o:P.chair, g:P.dining, e:P.bed};
  var f = function(a, b){ return k3(prog, a, b) };
  c.save(); c.translate(x, y); c.scale(w/100, w/100);
  c.beginPath(); rr(c, 0, 0, 100, 125, 2.4); c.clip();
  if(kind === "o"){
    v3Photo(c, PH.o, 0, 0, 100, 125, {scale:1.12, pos:[.45, .5]});
    v3Grad(c, 0, 0, 100, 40, [[0, "rgba(0,0,0,.28)"], [1, "rgba(0,0,0,0)"]]);
    var rp = oQ(f(0, .25)), ry = -22 + 22*rp;
    c.save(); c.translate(0, ry); c.fillStyle = ORANGE; c.beginPath(); c.moveTo(7, 0); c.lineTo(41, 0); c.lineTo(41, 21); c.lineTo(24, 15.2); c.lineTo(7, 21); c.closePath(); c.fill();
    v3Text(c, "Till salu", 24, 9.2, {size:4.4, weight:600, f:"sans", color:"#fff", align:"c"}); c.restore();
    var cp = oQ(f(0, .3)); c.save(); c.translate(0, (1 - cp)*10); c.globalAlpha = cp;
    c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 10; c.shadowOffsetY = 2; c.fillStyle = "#FBF7F0"; rr(c, 6, 76, 88, 43, 1.6); c.fill(); c.shadowColor = "transparent"; c.restore();
    if(cp > .5){
      v3Text(c, D.addr, 12, 90.5, {size:8.6, weight:700, f:"sans", color:"#1c1c1e", alpha:f(.1, .35), p:f(.1, .4)});
      v3Text(c, D.city.toUpperCase(), 12, 97, {size:3, weight:500, f:"sans", sp:.2, color:"#8c867e", alpha:f(.3, .55), p:f(.3, .6)});
      v3Line(c, 12, 26, 101.4, ORANGE, .9, f(.45, .6), 1); c.globalAlpha = 1;
      v3Text(c, D.facts, 12, 109, {size:4.6, weight:600, f:"sans", color:ORANGE, alpha:f(.5, .75), p:f(.5, .8)});
      v3Text(c, D.agent, 12, 115.4, {size:3.5, weight:500, f:"sans", color:"#6a655e", alpha:f(.7, .95), p:f(.7, .98)});
      var ia = f(.7, .95); if(ia > .02){ c.save(); c.globalAlpha = ia; c.fillStyle = ORANGE; c.beginPath(); c.arc(84, 104, 5.4, 0, 7); c.fill(); c.restore(); v3Text(c, "AL", 84, 105.5, {size:3.7, weight:700, f:"sans", color:"#fff", align:"c", alpha:ia}) }
    }
  } else if(kind === "g"){
    v3Fill(c, 0, 0, 100, 125, GREEN);
    c.save(); c.globalAlpha = .3; c.strokeStyle = "#F3EFE7"; c.lineWidth = .35; c.strokeRect(3.2, 3.2, 93.6, 118.6); c.restore();
    c.save(); archPath(c, 17, 11, 66, 80); c.clip(); v3Photo(c, PH.g, 17, 11, 66, 69, {scale:1.14, pos:[.5, .55]}); c.restore();
    c.save(); c.globalAlpha = .55; c.strokeStyle = "#F3EFE7"; c.lineWidth = .35; archPath(c, 14.6, 8.6, 70.8, 80); c.stroke(); c.restore();
    var pa = f(0, .25); if(pa > .02){ c.save(); c.globalAlpha = pa; c.fillStyle = "#F3EFE7"; rr(c, 35, 77.6, 30, 7.4, 3.7); c.fill(); c.restore(); v3Text(c, "TILL SALU", 50, 82.5, {size:3, weight:700, f:"sans", sp:.26, color:GREEN, align:"c", alpha:pa}) }
    v3Text(c, D.addr, 50, 100, {size:11, color:"#F3EFE7", align:"c", alpha:f(.1, .35), p:f(.1, .4)});
    v3Text(c, D.city.toUpperCase(), 50, 106.4, {size:2.8, weight:500, f:"sans", sp:.3, color:"rgba(243,239,231,.85)", align:"c", alpha:f(.3, .55)});
    v3Line(c, 44, 56, 109.6, "#F3EFE7", .3, f(.45, .6), .6);
    v3Text(c, D.facts, 50, 115, {size:3.4, weight:500, f:"sans", color:"rgba(243,239,231,.92)", align:"c", alpha:f(.5, .75)});
    v3Text(c, D.agent, 50, 120.4, {size:3.7, italic:true, color:"rgba(243,239,231,.78)", align:"c", alpha:f(.7, .95)});
  } else {
    v3Fill(c, 0, 0, 100, 125, "#F4F0E8");
    c.save(); c.globalAlpha = .4; c.strokeStyle = "#1c1c1e"; c.lineWidth = .3; c.strokeRect(3.2, 3.2, 93.6, 118.6); c.restore();
    v3Text(c, "TILL SALU", 8, 10.2, {size:2.8, weight:700, f:"sans", sp:.3, color:"#1c1c1e", alpha:f(0, .2), p:f(0, .25)});
    v3Text(c, D.city.toUpperCase(), 92, 10.2, {size:2.8, weight:500, f:"sans", sp:.3, color:"#5f5a55", align:"r", alpha:f(.2, .45)});
    v3Fill(c, 8, 13, 84, .25, "#1c1c1e", .55);
    c.save(); c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 5; c.fillStyle = "#fff"; c.fillRect(8, 17, 84, 61); c.restore();
    c.save(); c.beginPath(); c.rect(9.4, 18.4, 81.2, 58.2); c.clip(); v3Photo(c, PH.e, 9.4, 18.4, 81.2, 58.2, {scale:1.12, pos:[.5, .6]}); c.restore();
    v3Text(c, D.addr, 8, 98, {size:15, italic:true, color:"#1c1c1e", alpha:f(.1, .35), p:f(.1, .42)});
    v3Fill(c, 8, 103, 84, .25, "#1c1c1e", .55);
    v3Text(c, D.facts.toUpperCase(), 8, 112, {size:2.9, weight:600, f:"sans", sp:.22, color:"#1c1c1e", alpha:f(.4, .65), p:f(.4, .7)});
    v3Text(c, D.agent, 92, 112, {size:4, italic:true, color:"#5f5a55", align:"r", alpha:f(.6, .85), p:f(.6, .9)});
  }
  c.restore();
}
/* var uppgifterna sitter i varje mall (för de små prickarna som flyger in) */
function tplAnch(kind, x, y, w){
  var u = w/100, A = kind === "o" ? [[28, 89], [24, 108], [26, 115]] : kind === "g" ? [[50, 99], [50, 114], [50, 120]] : [[30, 97], [24, 111], [72, 111]];
  return A.map(function(p){ return [x + p[0]*u, y + p[1]*u] });
}
var KINDS = ["o", "g", "e"], TS5 = [7.4, 9.6, 11.6];
function adSkane(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Fill(c, 0, 0, 100, H, DARK);
  var bg = [P.chair, P.dining, P.statue, P.bed], step = 1.1, k = Math.min(3, Math.max(0, Math.floor((t - .3)/step))), a;
  for(i = 0; i < 4; i++){
    a = i === k ? 1 : 0;
    if(a > 0) v3Photo(c, bg[i], 0, 0, 100, H, {scale:lerp(1.04, 1.12, k3(t, .3 + i*step, 7)), pos:bg[i] === P.statue ? [.5, .2] : V3_POS[bg[i]], alpha:a});
  }
  var dim = rev(t, 4.6, .8);
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", .30 + .46*dim);
  v3Grad(c, 0, 0, 100, H*.28, [[0, "rgba(8,7,7,.5)"], [1, "rgba(8,7,7,0)"]]);
  /* orterna */
  var sC = G.is9 ? 15 : 12, cy = S.y0 + S.h*.42, gone = rev(t, 4.5, .4);
  lab(c, T("a8.sk.l"), 50, cy - sC*1.0, rev(t, .3, .7)*.92*(1 - gone), {size:2.1, color:"#fff", align:"c", weight:500, sp:.3, shadow:true});
  CITIES.forEach(function(ci, j){
    var s0 = .3 + j*step, va = (t >= s0 ? 1 : 0)*(j < 3 ? (t < s0 + step ? 1 : 0) : 1 - gone);
    if(va > 0) v3Text(c, ci, 50, cy, {size:Math.min(sC, fz(c, ci, {size:sC, weight:300}, 84)), color:"#fff", align:"c", alpha:va, p:oQ(k3(t, s0, s0 + .5)), rise:2, shadow:true});
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
  }
}
function sndSkane(H){ [0, 1, 2, 3].forEach(function(i){ H.s("shutter", i === 0 ? .08 : .3 + i*1.1, .6) }); H.s("tick1", 7.0, .07) }

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
reg8("a8_resa", "2 · Ett objekt. Hela vägen.", "Ett objekt följs från intag och bokning till leverans, annonstext och inlägg.", L6, adResa, 16.0, sndResa);
reg8("a8_skane", "3 · Din bostadsfotograf i Skåne", "Orterna, och ett inlägg som byter mall medan uppgifterna ligger kvar.", L5, adSkane, 12.4, sndSkane);

/* ---------- annonsplan ---------- */
var PLAN = [
  {t:"1 · Bostadsfoto. Och lite till.", syfte:"Kännedom. Ny aktör inom bostadsfotografering, och fotografering är kärnan. \"Lite till\" visar allt som ingår.", steg:"Överst i tratten. Kall målgrupp.", prim:"Bostadsfoto. Och lite till. Foto, skymningsbild, film, planritning, solbana och karta, i en bokning.", rub:"Ny aktör inom bostadsfotografering", cta:"Läs mer", mal:"Räckvidd, ThruPlay."},
  {t:"2 · Ett objekt. Hela vägen.", syfte:"Förståelse. Ett objekt följs genom hela flödet: intag, bokning, leverans, annonstext och inlägg. Sparar tid och ger bättre resultat.", steg:"Mitten. Visas efter annons 1.", prim:"Ett objekt. Hela vägen. Från intagsmötet och bokningen till leverans i mäklarportalen, annonstext och färdiga inlägg, allt i kontorets utseende.", rub:"Ett objekt. Hela vägen.", cta:"Boka fotografering", mal:"Visningstid, klick."},
  {t:"3 · Din bostadsfotograf i Skåne", syfte:"Lokalt. Foto är kärnan, och inlägget byter mall medan uppgifterna ligger kvar.", steg:"Botten. Retargeting mot dem som sett minst hälften av en annons.", prim:"Din bostadsfotograf i Skåne. Ett inlägg, ditt kontors utseende, uppgifterna från bokningen. Boka fotografering på viewly.se.", rub:"Din bostadsfotograf i Skåne", cta:"Boka fotografering", mal:"Bokningar, kostnad per klick."}
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
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 16 · bygge 50</div><h2>Kampanjen</h2>'
    + '<p>Tre annonser för mäklare i Skåne på Facebook och Instagram, var och en med en egen uppgift: kännedom, förståelse för hela flödet och det lokala. Fotografering är kärnan, och allt som följer med bokningen visas som en del av den. Lugn rörelse, få riktiga ljud, begripligt utan ljud. Alla slutar med Boka fotografering. Förslag, inget publicerat.</p></div>'
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
    + '<p class="a3lede">En kampanj med målet kännedom (räckvidd och videovisningar) mot mäklare i Skåne, med alla tre annonser i samma annonsgrupp. Annonserna är olika på riktigt (olika vinst, upplägg och bild), eftersom Meta visar lika annonser mot varandra i stället för att nå fler. Ett andra steg riktas mot dem som sett minst hälften av en annons, med annons 2 och 3 och knappen Boka fotografering.</p>'
    + '<div class="a3copy">' + PLAN.map(function(p){ return '<div><b>' + esc(p.t) + '</b><p>' + esc(p.syfte) + '</p><b>Steg i tratten</b><p>' + esc(p.steg) + '</p><b>Primärtext</b><p>' + esc(p.prim) + '</p><b>Rubrik · knapp</b><p>' + esc(p.rub) + ' · ' + esc(p.cta) + '</p><b>Mäts på</b><p>' + esc(p.mal) + '</p></div>' }).join("") + '</div>'
    + '<details class="a3det a3cust"><summary>Slutet, knappens text</summary><div class="a3hxs">' + ["a7.btnB", "a7.url", "a7.tag"].map(function(k){ return v3TxField(k, k === "a7.btnB" ? "Slutet · knappens text" : k === "a7.url" ? "Slutet · adressen" : "Slutet · raden efter adressen") }).join("") + '</div></details>'
    + ["ny", "re", "sk"].map(function(p, i){ return txEd("a8." + p + ".", ["1 · Bostadsfoto. Och lite till.", "2 · Ett objekt. Hela vägen.", "3 · Din bostadsfotograf i Skåne"][i]) }).join("")
    + '<details class="a3det"><summary>Underlag: vad som är kontrollerat och vad som inte är det</summary><div class="a3und">'
    + '<div><b>Metas säkra yta (kontrollerat)</b><p>Metas annonsguide rekommenderar att cirka 14 % överst, 35 % nederst och 6 % på sidorna lämnas fria från text och logotyper i Reels. Allt i 9:16 ligger därför i mitten. Slutkortet är litet och centrerat. Se <a href="https://www.facebook.com/business/ads-guide/update/image/instagram-reels" target="_blank" rel="noopener">Metas annonsguide för Reels</a>.</p></div>'
    + '<div><b>Olika annonser (delvis kontrollerat)</b><p>Flera branschkällor skriver att Meta slår ihop och konkurrerar ut annonser som liknar varandra. Det kommer från byråer och inte från Meta själv.</p></div>'
    + '<div><b>Ljud av, text på (branschkällor)</b><p>Många tittar utan ljud, så allt som betyder något står som text.</p></div>'
    + '<div><b>Längd (branschkällor)</b><p>Källorna går isär: 6 till 15 sekunder för kännedom eller 15 till 30. Annonserna är 22 till 25 sekunder med slutet.</p></div>'
    + '<div><b>Målgruppen på Meta (inte kontrollerat)</b><p>Kontrollera i annonshanteraren om yrket fastighetsmäklare går att rikta mot, och om Meta räknar annonserna som bostadsannonser (särskild annonskategori).</p></div>'
    + '<div><b>Påståenden</b><p>Inga siffror, inga löften om tid eller intäkter. Vad som ingår (fotografering, skymningsbild, bostadsfilm, planritning 2D och 3D, solbana, områdeskarta, områdesbilder) följer verktygets egen lista. Texten och inläggen hämtar uppgifterna från bokningen. Adress, namn och kontor i bilderna är exempel.</p></div>'
    + '<div><b>Mallarna i annons 2 och 3</b><p>Orange, grön och editorial är egna nyanser och egna layouter som kan påminna om olika kontor. Inga namn, märken eller kedjornas egna mallar. Använd bara kontorets egna material med kontorets tillåtelse.</p></div>'
    + '<div><b>Bilder och ljud</b><p>Bara era egna bilder (sida 15 och sängen från Såld). Riktiga ljud, CC0. Ingen musik. De små bilderna för skymningsbild, planritning, solbana och karta är ritade illustrationer, inga riktiga leveranser.</p></div></div></details></div>';
};
})();
