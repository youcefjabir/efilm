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
  "a8.sa.l1":["Ditt nästa objekt.", "4 · rubrik, rad 1"], "a8.sa.l2":["Som tre färdiga inlägg.", "4 · rubrik, rad 2"], "a8.sa.f1":["Från leverans.", "4 · slutsats, del 1"], "a8.sa.f2":["Till färdiga inlägg.", "4 · slutsats, del 2"],
  "a8.sb.l1":["Bilder blir", "5 · rubrik, rad 1"], "a8.sb.l2":["inlägg.", "5 · rubrik, rad 2"],
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
var WHITE = "#fff";
var L6 = 27.8, WIN6 = [2.5, 23.0];
var SR6 = [[3.0, 8.0], [8.0, 9.6], [10.2, 13.8], [13.8, 23.0]];
var SYS = {bg:"#ECE8E4", ink:"#1c1a19", mut:"#6f6a65", line:"rgba(28,26,25,.12)", grn:"#2f3a2d", org:"#F2681C"};
var LABS = ["Till salu", "Visning", "Såld"], KB = ["salu", "visning", "sald"];
var BR_G = "#1F4B39", BR_C = "#F3EFE7";
function sTx(c, s, x, y, a, o){ o = o || {}; return v3Text(c, s, x, y, {size:o.size || 3, weight:o.weight || 500, f:"sans", sp:o.sp || 0, color:o.color || SYS.ink, align:o.align || "l", alpha:a, p:o.p, rise:o.rise}) }
function sCard(c, x, y, w, h, a, r, fill, sh, stroke){
  if(a <= .02) return; c.save(); c.globalAlpha = a;
  if(sh !== 0){ c.shadowColor = "rgba(40,30,20,.18)"; c.shadowBlur = sh || 5; c.shadowOffsetY = 1 }
  c.fillStyle = fill || "#fff"; rr(c, x, y, w, h, r); c.fill(); c.shadowColor = "transparent";
  if(stroke){ c.strokeStyle = stroke; c.lineWidth = .3; rr(c, x, y, w, h, r); c.stroke() } c.restore();
}
function sPh(c, key, x, y, w, h, a, r, sc, pos){ if(a <= .02) return; c.save(); c.globalAlpha = a; rr(c, x, y, w, h, r); c.clip(); v3Photo(c, key, x, y, w, h, {scale:sc || 1.1, pos:pos || V3_POS[key]}); c.restore() }
function sBtn(c, cx, y, w, h, label, a, press, col, tcol){
  if(a <= .02) return; var sc = 1 - .04*Math.sin(clamp(press, 0, 1)*Math.PI); c.save(); c.translate(cx, y + h/2); c.scale(sc, sc); c.translate(-cx, -y - h/2);
  sCard(c, cx - w/2, y, w, h, a, h/2, col || SYS.grn, col ? 0 : 3, col ? SYS.line : null); sTx(c, label, cx, y + h*.63, a, {size:Math.min(3, h*.38), weight:600, color:tcol || "#fff", align:"c", sp:.14}); c.restore();
}
function sChip(c, label, x, y, h, a, on, size){ var w = v3Measure(c, label, {size:size, weight:500, f:"sans"}) + h*1.4; sCard(c, x, y, w, h, a, h/2, on ? SYS.org : "#fff", 0, on ? null : SYS.line); sTx(c, label, x + w/2, y + h*.64, a, {size:size, weight:500, color:on ? "#fff" : SYS.ink, align:"c"}); return w }
function chk(c, cx, cy, r, p, col, lw){ if(p <= 0) return; c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round"; var a = [cx - r*.46, cy + r*.02], b = [cx - r*.1, cy + r*.38], d = [cx + r*.5, cy - r*.34]; c.beginPath(); c.moveTo(a[0], a[1]);
  var p1 = Math.min(1, p*2); c.lineTo(lerp(a[0], b[0], p1), lerp(a[1], b[1], p1)); if(p > .5){ var p2 = (p - .5)*2; c.lineTo(lerp(b[0], d[0], p2), lerp(b[1], d[1], p2)) } c.stroke(); c.restore() }
/* ett kontor, tre mallar: samma färger, samma typsnitt, samma sidfot. Bara layouten byter med skedet. */
function tplB(c, kind, x, y, w, prog, d){
  var f = function(a, b){ return k3(prog, a, b) }, CR = "#F3EFE7";
  c.save(); c.translate(x, y); c.scale(w/100, w/100); c.beginPath(); rr(c, 0, 0, 100, 125, 2.4); c.clip();
  v3Photo(c, d.photo, 0, 0, 100, 125, {scale:1.1, pos:[.5, .5]});
  v3Grad(c, 0, 0, 100, 36, [[0, "rgba(8,16,11,.5)"], [1, "rgba(8,16,11,0)"]]);
  v3Grad(c, 0, kind === "sald" ? 0 : 52, 100, kind === "sald" ? 125 : 73, kind === "sald" ? [[0, "rgba(8,16,11,.5)"], [1, "rgba(8,16,11,.6)"]] : [[0, "rgba(8,16,11,0)"], [1, "rgba(8,16,11,.82)"]]);
  /* samma kontor i alla: monogram uppe till vänster */
  var ma = f(0, .3); c.save(); c.globalAlpha = ma; c.fillStyle = CR; c.beginPath(); c.arc(11, 11, 4.8, 0, 7); c.fill(); c.restore();
  v3Text(c, "ER", 11, 12.4, {size:3.6, weight:700, f:"sans", color:BR_G, align:"c", alpha:ma});
  v3Text(c, "Er Mäklarbyrå", 18.4, 12.2, {size:3.6, weight:500, f:"sans", color:CR, alpha:ma});
  var sub = d.city.toUpperCase() + "  ·  " + d.facts.toUpperCase();
  if(d.slot > .02){
    var bx = kind === "salu" ? [[8, 88, 52, 15], [8, 105.2, 66, 7]] : kind === "visning" ? [[25, 85, 50, 11], [18, 97.6, 64, 6.6]] : [[25, 81, 50, 11], [18, 93, 64, 6.6]], sa1 = d.slot*(1 - f(.12, .3)), sa2 = d.slot*(1 - f(.38, .55));
    [[bx[0], sa1], [bx[1], sa2]].forEach(function(q){ if(q[1] <= .02) return; c.save(); c.globalAlpha = q[1]; c.fillStyle = "rgba(243,239,231,.2)"; rr(c, q[0][0], q[0][1], q[0][2], q[0][3], 1.6); c.fill(); c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = .3; rr(c, q[0][0], q[0][1], q[0][2], q[0][3], 1.6); c.stroke(); c.restore() });
  }
  if(kind === "salu"){
    v3Text(c, "TILL SALU", 8, 82, {size:3.6, weight:600, f:"sans", sp:.3, color:CR, alpha:f(0, .25), p:f(0, .3)});
    v3Line(c, 8, 12, 87, CR, .4, f(.2, .45), .8);
    v3Text(c, d.addr, 8, 101, {size:14, color:CR, alpha:f(.1, .4), p:f(.1, .45)});
    v3Text(c, sub, 8, 109.4, {size:3.2, weight:500, f:"sans", sp:.16, color:"rgba(243,239,231,.88)", alpha:f(.35, .65)});
    v3Text(c, d.agent, 8, 118, {size:3.4, f:"sans", color:"rgba(243,239,231,.7)", alpha:f(.55, .85)});
  } else if(kind === "visning"){
    v3Text(c, "VISNING", 50, 58, {size:3.6, weight:600, f:"sans", sp:.34, color:CR, align:"c", alpha:f(0, .25), p:f(0, .3)});
    v3Text(c, "Sön 14:00 – 14:45", 50, 72, {size:11, italic:true, color:CR, align:"c", alpha:f(.1, .4), p:f(.1, .45)});
    v3Line(c, 44, 12, 80, CR, .4, f(.3, .55), .8);
    v3Text(c, d.addr, 50, 94, {size:8.4, color:CR, align:"c", alpha:f(.3, .6)});
    v3Text(c, sub, 50, 101.4, {size:3.1, weight:500, f:"sans", sp:.16, color:"rgba(243,239,231,.88)", align:"c", alpha:f(.45, .75)});
    v3Text(c, d.agent, 50, 118, {size:3.4, f:"sans", color:"rgba(243,239,231,.7)", align:"c", alpha:f(.6, .9)});
  } else {
    v3Text(c, "Såld", 50, 62, {size:24, italic:true, color:CR, align:"c", alpha:f(.05, .3), p:f(.05, .4)});
    v3Line(c, 44, 12, 72, CR, .4, f(.4, .6), .8);
    v3Text(c, d.addr, 50, 90, {size:8.4, color:CR, align:"c", alpha:f(.3, .55)});
    v3Text(c, sub, 50, 97.4, {size:3.1, weight:500, f:"sans", sp:.16, color:"rgba(243,239,231,.88)", align:"c", alpha:f(.45, .7)});
    v3Text(c, d.agent, 50, 118, {size:3.4, f:"sans", color:"rgba(243,239,231,.7)", align:"c", alpha:f(.6, .9)});
  }
  c.restore();
}
function DO(i, ph, slot){ return {addr:T("a8.re.addr"), city:T("a8.re.city"), facts:T("a8.re.facts"), agent:"Anna Lindqvist", photo:ph, slot:slot || 0} }
/* en scen i fönstret: mjuk in och ut, utan hårda klipp */
function scn(t, s0, s1){ var i = rev(t, s0 - .05, .6), o = rev(t, s1 - .55, .45); return {a:i*(1 - o), dy:(1 - i)*2.6 - o*1.6} }
function adResa(c, G, t){
  var H = G.H, S = SG(G), i;
  v3Fill(c, 0, 0, 100, H, DARK);
  /* bakgrund: sängen i öppningen, sedan ett mörkt skymningsfoto som tonar fram, och samma slutbild som förut */
  v3Photo(c, P.bed, 0, 0, 100, H, {scale:lerp(1.05, 1.13, k3(t, 0, 6)), pos:V3_POS.bedroom, alpha:t < .6 ? ioC(k3(t, 0, .6)) : 1});
  var OFF = 1.9, mid = rev(t, 3.8, 1.2)*(1 - rev(t, WIN6[1] + OFF - .8, .6)), fin = rev(t, WIN6[1] + OFF - .8, .6);
  if(mid > .01) v3Photo(c, "rs_dusk1", 0, 0, 100, H, {scale:lerp(1.05, 1.1, k3(t, 3.8, WIN6[1] + OFF + .8)), pos:V3_POS.rs_dusk1, alpha:mid});
  if(fin > .01) v3Photo(c, "rs_dusk2", 0, 0, 100, H, {scale:lerp(1.05, 1.1, k3(t, WIN6[1] + OFF - .8, L6)), pos:V3_POS.rs_dusk2, alpha:fin});
  var dim = (.30 + .30*rev(t, 1.0, .6))*(1 - rev(t, 3.8, .9)) + .72*rev(t, 3.8, .9)*(1 - fin) + .80*fin;
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", dim);
  v3Grad(c, 0, 0, 100, H*.3, [[0, "rgba(8,7,7,.55)"], [1, "rgba(8,7,7,0)"]]);
  v3Frame(c, 4, 4, 92, H - 8, WHITE, .26, oQ(k3(t, .2, 1.8)), .5);
  /* öppningen (oförändrad) */
  var introA = 1 - rev(t, 3.7, .4);
  lab(c, "VIEWLY · FÖR FASTIGHETSMÄKLARE", 50, S.y0 + 2.6, rev(t, .4, .8)*.92*introA, {size:2.1, color:WHITE, align:"c", weight:500, sp:.3});
  var sH = G.is9 ? 15 : 12, l1 = T("a8.re.l1"), l2 = T("a8.re.l2"), sHero = Math.min(sH, fz(c, l1, {size:sH, weight:300}, 84), fz(c, l2, {size:sH, weight:300, italic:true}, 84));
  twoPart(c, t, .6, 4.0, l1, l2, sHero, S.y0 + S.h*.42);
  var tr = t; t = t - OFF; if(t >= 9.6) t += .6;
  /* fönstret: ett system som glider genom hela resan, ett enda fokus i taget */
  var wa = rev(t, WIN6[0], .8)*(1 - rev(t, WIN6[1], .6));
  if(wa > .02){
    var wy = S.y0, wh = S.h + 1, wx = 7, ww = 86, x0 = 13, cw = 74;
    var slide = (1 - oQ(k3(t, WIN6[0], WIN6[0] + 1.2)))*12 + rev(t, WIN6[1], .6)*5;
    var cen = function(ch){ return wy + 16 + Math.max(0, (wh - 20 - ch)/2) }, k;
    c.save(); c.translate(0, slide);
    sCard(c, wx, wy, ww, wh, wa, 3.2, SYS.bg, 12);
    /* en tunn stegindikator och en etikett */
    var st = t < SR6[1][0] ? 0 : t < SR6[2][0] ? 1 : t < SR6[3][0] ? 2 : 3, sw = (cw - 3*1.6)/4, STN = ["INTAG", "BOKNING", "LEVERANS", "KAMPANJ"];
    for(i = 0; i < 4; i++){
      var pr = clamp((t - SR6[i][0])/(SR6[i][1] - SR6[i][0]), 0, 1), sx = x0 + i*(sw + 1.6);
      sCard(c, sx, wy + 6, sw, .7, wa, .35, "rgba(28,26,25,.14)", 0); if(pr > 0) sCard(c, sx, wy + 6, sw*pr, .7, wa, .35, SYS.ink, 0);
    }
    var sub = st < 3 ? "" : t < 16.8 ? "  ·  MALLAR" : t < 20.4 ? "  ·  BILDER" : "  ·  KLART";
    sTx(c, (st + 1) + " · " + STN[st] + sub, 50, wy + 12, wa, {size:2.8, weight:600, sp:.22, align:"c"});
    /* 1 · intag: så kan bostaden presenteras. En stor bild, en rad val. */
    k = scn(t, 3.0, 8.0);
    if(k.a > .02){
      var ih = 30, ch1 = 5 + ih + 5 + 12 + 6 + 8.6, y0 = cen(ch1);
      c.save(); c.translate(0, k.dy);
      sTx(c, "EXEMPEL · SÅ KAN ANNONSEN SE UT", 50, y0 + 2, k.a*rev(t, 3.3, .7), {size:2.5, weight:500, color:SYS.mut, align:"c", sp:.3});
      var imgs = [P.kitchen, "rs_dusk1", P.bed], t0s = [3.8, 4.8, 5.8], act = t < t0s[1] ? 0 : t < t0s[2] ? 1 : 2, ia = rev(t, 3.6, .8)*k.a, iy = y0 + 7;
      sCard(c, x0, iy, cw, ih, ia, 2, "#fff", 3);
      for(i = 0; i < 3; i++){ var pa = i === act ? rev(t, t0s[i], .8) : (i === act - 1 ? 1 - rev(t, t0s[act], .8) : 0); sPh(c, imgs[i], x0 + .8, iy + .8, cw - 1.6, ih - 1.6, ia*pa, 1.4, 1.1) }
      var items = ["Fotografering", "Skymningsbild", "Bostadsfilm", "Planritning", "Solbana"], cx = x0, cy = iy + ih + 5, row = 0;
      items.forEach(function(s, q){ var ca = rev(t, 3.9 + q*.1, .5)*k.a, w = v3Measure(c, s, {size:2.8, weight:500, f:"sans"}) + 6.4; if(cx + w > x0 + cw + .5 && row === 0){ cx = x0; cy += 7.2; row = 1 } sChip(c, s, cx, cy, 5.6, ca, q === Math.min(act, 2) && t > 3.9 && q < 3, 2.8); cx += w + 1.6 });
      sBtn(c, 50, cy + 10, 48, 8.6, "VÄLJ PREMIUM  ›", rev(t, 6.0, .6)*k.a, k3(t, 7.05, 7.35));
      c.restore();
    }
    /* 2 · bokad: bocken exakt i mitten, tunn linje */
    k = scn(t, 8.0, 9.6);
    if(k.a > .02){
      c.save(); c.translate(0, k.dy);
      var cy0 = wy + wh*.5 - 3, cp = oBack(k3(t, 8.25, 8.85)), R0 = 11;
      c.save(); c.globalAlpha = k.a; c.shadowColor = "rgba(40,30,20,.16)"; c.shadowBlur = 8; c.shadowOffsetY = 1.5; c.fillStyle = "#fff"; c.beginPath(); c.arc(50, cy0, R0*Math.max(.01, cp), 0, 7); c.fill(); c.restore();
      chk(c, 50, cy0, R0*.8, k3(t, 8.75, 9.2), SYS.ink, .55);
      sTx(c, "BOKAD", 50, cy0 + R0 + 8, k.a*rev(t, 8.9, .5), {size:3.4, weight:500, align:"c", sp:.55});
      sTx(c, T("a8.re.addr") + ", " + T("a8.re.city"), 50, cy0 + R0 + 13.4, k.a*rev(t, 9.0, .5), {size:2.7, color:SYS.mut, align:"c"});
      c.restore();
    }
    /* 3 · mäklarportalen: levererad, bilderna fylls i */
    k = scn(t, 10.2, 13.8);
    if(k.a > .02){
      var rh3 = 15, tw = (cw - 3*2.4)/4, th = tw*.78, ch3 = rh3 + 5 + th + 10 + 8.6, y3 = cen(ch3);
      c.save(); c.translate(0, k.dy);
      var ra3 = k.a*rev(t, 10.6, .7);
      sCard(c, x0, y3, cw, rh3, ra3, 2.2, "#fff", 3);
      sTx(c, T("a8.re.addr"), x0 + 4.5, y3 + 6.4, ra3, {size:3.7, weight:600}); sTx(c, T("a8.re.city") + " · " + T("a8.re.facts"), x0 + 4.5, y3 + 11.4, ra3, {size:2.5, color:SYS.mut});
      var dn = t >= 11.3, pulse = dn ? 1 - clamp(k3(t, 11.3, 12.1), 0, 1) : 0, sx2 = x0 + cw - 4 - 22, sy2 = y3 + rh3/2 - 2.8;
      if(pulse > .02){ c.save(); c.globalAlpha = pulse*.5*k.a; c.strokeStyle = "#2f6a3a"; c.lineWidth = .4; rr(c, sx2 - pulse*2, sy2 - pulse*2, 22 + pulse*4, 5.6 + pulse*4, 3.8); c.stroke(); c.restore() }
      sCard(c, sx2, sy2, 22, 5.6, ra3, 2.8, dn ? "#dfeedd" : "#f3e7c9", 0);
      sTx(c, dn ? "Levererad" : "Pågår", sx2 + 11, sy2 + 3.9, ra3, {size:2.7, weight:500, color:dn ? "#2f6a3a" : "#8a6a1c", align:"c"});
      var ty = y3 + rh3 + 5, tks = ["rs_dusk1", "rs_dusk2", P.dining, P.kitchen];
      for(i = 0; i < 4; i++){ var ta = rev(t, 11.5 + i*.25, .6)*k.a, tx = x0 + i*(tw + 2.4); sCard(c, tx - .4, ty - .4, tw + .8, th + .8, ta, 1.5, "#fff", 2); sPh(c, tks[i], tx, ty, tw, th, ta, 1.2, 1.14) }
      sBtn(c, 50, ty + th + 10, 52, 8.6, "SKAPA KAMPANJ  ›", rev(t, 12.2, .6)*k.a, k3(t, 13.05, 13.35));
      c.restore();
    }
    /* 4a · välj mallar: tre mallar i samma kontors utseende */
    k = scn(t, 13.8, 16.8);
    if(k.a > .02){
      var mw = (cw - 2*2.6)/3, mh = mw*1.25, ch5 = 5 + 6 + mh + 8 + 10 + 8.6, y5 = cen(ch5);
      c.save(); c.translate(0, k.dy);
      sTx(c, "VÄLJ VILKA MALLAR SOM SKA INGÅ", 50, y5 + 2, k.a*rev(t, 14.2, .7), {size:2.5, weight:500, color:SYS.mut, align:"c", sp:.3});
      var my = y5 + 8;
      for(i = 0; i < 3; i++){
        var mx = x0 + i*(mw + 2.6), ma = rev(t, 14.4 + i*.2, .6)*k.a, sel = clamp(k3(t, 15.0 + i*.3, 15.3 + i*.3), 0, 1);
        sCard(c, mx - .6, my - .6, mw + 1.2, mh + 1.2, ma, 1.8, "#fff", 3, sel > .5 ? SYS.ink : null);
        if(ma > .02){ c.save(); c.globalAlpha = ma; tplB(c, KB[i], mx, my, mw, 1, DO(i, ["rs_dusk1", P.bed, "rs_dusk2"][i])); c.restore() }
        sTx(c, LABS[i], mx + .6, my + mh + 6, ma, {size:3, weight:600});
        if(sel > .02){ var br = 2.2*oBack(sel); c.save(); c.globalAlpha = ma; c.fillStyle = SYS.grn; c.beginPath(); c.arc(mx + mw - 2.6, my + mh + 5, Math.max(.01, br), 0, 7); c.fill(); c.restore(); if(sel > .6) sTx(c, String(i + 1), mx + mw - 2.6, my + mh + 6, ma, {size:2.2, weight:600, color:"#fff", align:"c"}) }
      }
      sBtn(c, 50, my + mh + 12, 56, 8.6, "FORTSÄTT MED 3 INLÄGG  ›", rev(t, 15.5, .5)*k.a, k3(t, 16.1, 16.4));
      c.restore();
    }
    /* 4b · välj bilder: en mall får en ny bild från leveransen */
    k = scn(t, 16.8, 20.4);
    if(k.a > .02){
      var pw = 36, ph5 = pw*1.25, y6 = cen(ph5 + 6 + 8.6), gx = x0 + pw + 4, gw = cw - pw - 4, tw6 = (gw - 2)/2, th6 = tw6*.78;
      c.save(); c.translate(0, k.dy);
      var from = "rs_dusk2", to = "rs_dusk1", mv = rev(t, 18.1, .8), pa6 = rev(t, 17.0, .7)*k.a;
      sCard(c, x0 - .6, y6 - .6, pw + 1.2, ph5 + 1.2, pa6, 2, "#fff", 4);
      if(pa6 > .02){
        c.save(); c.globalAlpha = pa6; tplB(c, "salu", x0, y6, pw, k3(t, 17.2, 18.4), DO(0, from));
        if(mv > 0){ c.save(); c.globalAlpha = pa6*mv; tplB(c, "salu", x0, y6, pw, 1, DO(0, to)); c.restore() } c.restore();
      }
      sTx(c, "Välj bild till Till salu", gx, y6 + 3.4, k.a*rev(t, 17.2, .7), {size:3, weight:600});
      var grid = [P.kitchen, "rs_dusk1", P.dining, "rs_dusk2"], gy = y6 + 8;
      for(i = 0; i < 4; i++){ var gxx = gx + (i % 2)*(tw6 + 2), gyy = gy + Math.floor(i/2)*(th6 + 2), ga = rev(t, 17.4 + i*.15, .7)*k.a; sCard(c, gxx - .4, gyy - .4, tw6 + .8, th6 + .8, ga, 1.3, "#fff", 1.5); sPh(c, grid[i], gxx, gyy, tw6, th6, ga, 1.1, 1.14) }
      var rp = ioC(k3(t, 18.0, 18.6)), rf = 3, rt = 1, rx = lerp(gx + (rf % 2)*(tw6 + 2), gx + (rt % 2)*(tw6 + 2), rp), ry2 = lerp(gy + Math.floor(rf/2)*(th6 + 2), gy + Math.floor(rt/2)*(th6 + 2), rp);
      c.save(); c.globalAlpha = k.a*rev(t, 17.6, .5); c.strokeStyle = SYS.ink; c.lineWidth = .6; rr(c, rx - .9, ry2 - .9, tw6 + 1.8, th6 + 1.8, 1.5); c.stroke(); c.restore();
      sBtn(c, 50, y6 + ph5 + 6, 54, 8.6, "SKAPA 3 INLÄGG  ›", rev(t, 18.5, .5)*k.a, k3(t, 19.65, 19.95));
      c.restore();
    }
    /* 4c · klart */
    k = scn(t, 20.4, 23.3);
    if(k.a > .02){
      var fw = (cw - 2*2.6)/3, fh = fw*1.25, ch8 = 8 + fh + 9 + 8.6, y8 = cen(ch8);
      c.save(); c.translate(0, k.dy);
      sTx(c, "KAMPANJEN ÄR KLAR", 50, y8 + 2, k.a*rev(t, 20.7, .6), {size:2.5, weight:500, color:SYS.mut, align:"c", sp:.3});
      for(i = 0; i < 3; i++){ var fx = x0 + i*(fw + 2.6), fa = rev(t, 20.8 + i*.2, .6)*k.a;
        sCard(c, fx - .6, y8 + 8 - .6, fw + 1.2, fh + 1.2, fa, 1.8, "#fff", 3);
        if(fa > .02){ c.save(); c.globalAlpha = fa; tplB(c, KB[i], fx, y8 + 8, fw, 1, DO(i, ["rs_dusk1", P.bed, "rs_dusk2"][i])); c.restore() }
        sTx(c, LABS[i], fx + .6, y8 + 8 + fh + 5.6, fa, {size:3, weight:600}) }
      var by8 = y8 + 8 + fh + 10, ba8 = rev(t, 21.6, .6)*k.a;
      sBtn(c, 50, by8, 56, 8.6, "PUBLICERA KAMPANJEN  ›", ba8, k3(t, 22.35, 22.65));
      c.restore();
    }
    c.restore();
  }
  t = tr;
  /* slutsatsen (oförändrad) */
  if(t >= WIN6[1] + OFF - .3) twoPart(c, t, WIN6[1] + OFF - .3, L6 + .05, T("a8.re.f1"), T("a8.re.f2"), G.is9 ? 12 : 10, S.y0 + S.h*.46);
}
/* =====================================================================
   4 · TRE INLÄGG. NÅGRA KLICK.   (samma system som annons 2, nu med bilder och mallar)
   Leveransen i portalen: välj bilder, välj mallar, kampanjen skapas och uppgifterna
   fylls i automatiskt, sedan laddas alla tre ner. Ett kontor, en profil.
   ===================================================================== */
var L7 = 25.6, OFF7 = 3.9, WEND7 = 17.6;
var SR7 = [[.2, 5.2], [5.2, 8.8], [8.8, 12.9], [12.9, 17.6]], SEL7 = [0, 2, 4], SELT7 = [1.6, 2.3, 3.0];
var GRID7 = ["rs_dusk1", P.dining, P.bed, P.kitchen, "rs_dusk2", P.chair];
function miniLogo(c, G, S, a, bright){
  if(a <= .02) return; bright = bright || 0; var cy = Math.min(S.y1 + 12, G.H - 11), mh = 4.4, mw = mh*858.6/756.3, fs = 2.6, ww = v3Measure(c, "VIEWLY", {size:fs, weight:500, f:"sans", sp:.3}) - .3*fs, tot = mw + 2.2 + ww, x0 = 50 - tot/2, ty = cy + mh/2 + 3.6;
  if(bright < .98){ var wa = a*.85*(1 - bright); v3Mark(c, x0, cy - mh/2, mh, "#fff", C3.dotL, {reveal:1, dot:1, alpha:wa}); v3Text(c, "VIEWLY", x0 + mw + 2.2, cy + fs*.34, {size:fs, weight:500, f:"sans", sp:.3, color:"#fff", alpha:wa}); v3Text(c, "BOSTADSFOTOGRAFERING", 50, ty, {size:1.75, weight:500, f:"sans", sp:.34, color:"#fff", align:"c", alpha:wa*.7}) }
  if(bright > .02){ var wb = a*.85*bright; v3Mark(c, x0, cy - mh/2, mh, SYS.ink, C3.oli, {reveal:1, dot:1, alpha:wb}); v3Text(c, "VIEWLY", x0 + mw + 2.2, cy + fs*.34, {size:fs, weight:500, f:"sans", sp:.3, color:SYS.ink, alpha:wb}); v3Text(c, "BOSTADSFOTOGRAFERING", 50, ty, {size:1.75, weight:500, f:"sans", sp:.34, color:SYS.mut, align:"c", alpha:wb*.9}) }
}
/* variant B: leveransens bilder slår om till färdiga inlägg, ljust och med innehåll i första bildrutan */
function hookGrid(c, G, S, t){
  var fq = .8, cw = 27*fq, chh = 33.75*fq, gp = 2.2, gw = 3*cw + 2*gp, left = (100 - gw)/2, top = S.y0 + S.h*(G.is9 ? .345 : .36), out = rev(t, 3.9, .5), ph7 = [GRID7[0], GRID7[2], GRID7[4]], POST = {0:0, 2:1, 4:2}, i;
  var ink = SYS.ink, ta = rev(t, -.25, .3)*(1 - out), ts = G.is9 ? 8.6 : 7.4, ty0 = S.y0 + S.h*.115;
  v3Text(c, T("a8.sb.l1"), 50, ty0 + ts*.8, {size:ts, color:ink, align:"c", alpha:ta, p:oQ(k3(t, -.35, .35))});
  v3Text(c, T("a8.sb.l2"), 50, ty0 + ts*1.95, {size:ts, italic:true, color:BR_G, align:"c", alpha:ta*rev(t, .35, .3), p:oQ(k3(t, .35, .9))});
  /* diskret status: fotograferas, sedan levererad när den sjätte bilden landat */
  var sa = rev(t, -.2, .25)*(1 - out), lev = rev(t, .95, .25), s1 = "FOTOGRAFERAS", s2 = "LEVERERAD", sw1 = v3Measure(c, s1, {size:2.1, weight:600, f:"sans", sp:.2}) + 10, sw2 = v3Measure(c, s2, {size:2.1, weight:600, f:"sans", sp:.2}) + 10, sw = lerp(sw1, sw2, lev), sy = S.y0 + .6;
  sCard(c, 50 - sw/2, sy, sw, 5.6, sa, 2.8, "#fff", 0, SYS.line);
  dot(c, 50 - sw/2 + 3.4, sy + 2.8, .95, lev > .5 ? "#2f6a3a" : "#b9822c", sa);
  sTx(c, s1, 50 - sw/2 + 6, sy + 3.8, sa*(1 - lev), {size:2.1, weight:600, color:SYS.mut, sp:.2});
  sTx(c, s2, 50 - sw/2 + 6, sy + 3.8, sa*lev, {size:2.1, weight:600, color:"#2f6a3a", sp:.2});
  for(i = 0; i < 6; i++){
    var col = i % 3, row = Math.floor(i/3), cx0 = left + col*(cw + gp), cy0 = top + row*(chh + gp), pi = POST[i], t0 = i*.14, pop = rev(t, t0, .2), pscale = lerp(.84, 1, oBack(k3(t, t0, t0 + .35)));
    if(pop <= .01) continue;
    if(pi === undefined){
      var a = pop*(1 - ioC(k3(t, 1.4, 2.0)))*(1 - out); if(a <= .02) continue;
      var sc = pscale*lerp(1, .9, ioC(k3(t, 1.4, 2.0))); c.save(); c.translate(cx0 + cw/2, cy0 + chh/2); c.scale(sc, sc); sCard(c, -cw/2 - .4, -chh/2 - .4, cw + .8, chh + .8, a, 1.6, "#fff", 3); sPh(c, GRID7[i], -cw/2, -chh/2, cw, chh, a, 1.4, 1.14); c.restore();
    } else {
      var e = ioC(k3(t, 2.1, 3.1)), tw = G.is9 ? 27 : 24, tx = lerp(cx0 + cw/2, 50 + (pi - 1)*(tw + 2.2), e), ty = lerp(cy0 + chh/2, top + chh + gp/2 - 1, e), w = lerp(cw, tw, e), h = w*1.25, pa = rev(t, 1.4, .35), a2 = pop*(1 - out), sc2 = (t < 1.4 ? pscale : 1);
      if(a2 <= .02) continue;
      c.save(); c.translate(tx, ty + out*4); c.scale(sc2, sc2); c.globalAlpha = a2;
      if(pa < 1){ sCard(c, -cw/2 - .4, -chh/2 - .4, cw + .8, chh + .8, 1 - pa, 1.6, "#fff", 3); sPh(c, GRID7[i], -cw/2, -chh/2, cw, chh, 1 - pa, 1.4, 1.14) }
      if(pa > .02){ c.save(); c.globalAlpha = a2*pa; c.shadowColor = "rgba(30,25,20,.35)"; c.shadowBlur = 8; c.shadowOffsetY = 2; c.fillStyle = "#000"; rr(c, -w/2, -h/2, w, h, w*.025); c.fill(); c.shadowColor = "transparent"; tplB(c, KB[pi], -w/2, -h/2, w, k3(t, 1.45 + pi*.15, 2.7 + pi*.15), DO(pi, ph7[pi])); c.restore() }
      c.restore();
    }
  }
}
/* krok: tre färdiga inlägg faller på plats, rubriken säger att det är ditt nästa objekt */
function hookPosts(c, G, S, t){
  var pw = 27, ph = pw*1.25, cy = S.y0 + S.h*.64, ph7 = [GRID7[0], GRID7[2], GRID7[4]], out = rev(t, 3.2, .5);
  [[0, -25, -6, 3], [2, 25, 6, 3], [1, 0, 0, -1]].forEach(function(o){
    var i = o[0], t0 = .12 + [0, .3, .15][[0, 2, 1].indexOf(i)], a = rev(t, t0, .5)*(1 - out); if(a <= .02) return;
    var ent = 1 - oBack(k3(t, t0, t0 + .8)), prog = k3(t, t0 + .35, t0 + 1.5), fl = Math.sin(t*1.3 + i)*.5;
    c.save(); c.translate(50 + o[1], cy + o[3] + ent*16 + out*4 + fl); c.rotate((o[2] + ent*(o[1] < 0 ? -8 : o[1] > 0 ? 8 : 0))*Math.PI/180); c.globalAlpha = a;
    c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 10; c.shadowOffsetY = 2.4; c.fillStyle = "#000"; rr(c, -pw/2, -ph/2, pw, ph, pw*.025); c.fill(); c.shadowColor = "transparent";
    tplB(c, KB[i], -pw/2, -ph/2, pw, prog, DO(i, ph7[i])); c.restore();
  });
}
function flyChip(c, txt, fx, fy, tx, ty, tr, t0, dur, a){
  var p = (tr - t0)/dur; if(p <= 0 || p >= 1) return; var q;
  var pos = function(e){ return [lerp(fx, tx, e), lerp(fy, ty, e) - Math.sin(e*Math.PI)*8] }, e = ioC(p), P0 = pos(e);
  var al = a*Math.min(1, p*7)*(1 - clamp((p - .86)/.14, 0, 1)), w = v3Measure(c, txt, {size:2.4, weight:600, f:"sans"}) + 5;
  sCard(c, P0[0] - w/2, P0[1] - 2.6, w, 5.2, al, 2.6, "#fff", 4, "#2f6a3a"); sTx(c, txt, P0[0], P0[1] + 1.0, al, {size:2.4, weight:600, color:SYS.ink, align:"c"});
}
function adSalu(c, G, t, v){
  var H = G.H, S = SG(G), i, j, O7 = v ? OFF7 + .7 : OFF7, Lx = v ? L7 + .7 : L7;
  v3Fill(c, 0, 0, 100, H, DARK);
  v3Photo(c, P.bed, 0, 0, 100, H, {scale:lerp(1.05, 1.13, k3(t, 0, 6)), pos:V3_POS.bedroom, alpha:t < .4 ? ioC(k3(t, 0, .4)) : 1});
  var wend = O7 + WEND7, mid = rev(t, O7 - .5, 1.2)*(1 - rev(t, wend - .8, .6)), fin = rev(t, wend - .8, .6);
  if(mid > .01) v3Photo(c, P.chair, 0, 0, 100, H, {scale:lerp(1.05, 1.1, k3(t, O7 - .5, wend)), pos:V3_POS.rs_chair, alpha:mid});
  if(fin > .01) v3Photo(c, "rs_dusk2", 0, 0, 100, H, {scale:lerp(1.05, 1.1, k3(t, wend - .8, Lx)), pos:V3_POS.rs_dusk2, alpha:fin});
  var dim = (.46 + .14*rev(t, 1.0, .6))*(1 - rev(t, O7 - .5, .9)) + .76*rev(t, O7 - .5, .9)*(1 - fin) + .80*fin;
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", dim);
  v3Grad(c, 0, 0, 100, H*.3, [[0, "rgba(8,7,7,.55)"], [1, "rgba(8,7,7,0)"]]);
  v3Frame(c, 4, 4, 92, H - 8, WHITE, .26, oQ(k3(t, .2, 1.8)), .5);
  /* kroken: ditt nästa objekt, som tre färdiga inlägg */
  var l1 = T("a8.sa.l1"), l2 = T("a8.sa.l2"), sH = G.is9 ? 9.4 : 8, sHero = Math.min(sH, fz(c, l1, {size:sH, weight:300}, 84), fz(c, l2, {size:sH, weight:300, italic:true}, 84));
  var bright = v ? 1 - rev(t, O7 - .8, .7) : 0;
  if(v){ if(bright > .01) v3Fill(c, 0, 0, 100, H, SYS.bg, bright); hookGrid(c, G, S, t) }
  else { twoPart(c, t, .1, 3.2, l1, l2, sHero, S.y0 + S.h*.19); hookPosts(c, G, S, t) }
  /* varumärket, litet och diskret under kortet, så att även den som inte ser hela filmen ser det */
  miniLogo(c, G, S, (v ? 1 : rev(t, .8, .8))*(1 - rev(t, wend + 1.0, .5)), bright);
  var tr = t - O7, wa = rev(tr, -.1, .8)*(1 - rev(tr, WEND7, .6));
  if(wa > .02){
    var wy = S.y0, wh = S.h + 1, wx = 7, ww = 86, x0 = 13, cw = 74, k;
    var slide = (1 - oQ(k3(tr, -.1, 1.1)))*12 + rev(tr, WEND7, .6)*5, yc = wy + 23;
    c.save(); c.translate(0, slide);
    sCard(c, wx, wy, ww, wh, wa, 3.2, SYS.bg, 12);
    /* stegindikatorn */
    var st = tr < SR7[1][0] ? 0 : tr < SR7[2][0] ? 1 : tr < SR7[3][0] ? 2 : 3, sw = (cw - 3*1.6)/4, STN = ["VÄLJ BILDER", "VÄLJ MALLAR", "SKAPAR KAMPANJ", "KLART"];
    for(i = 0; i < 4; i++){
      var pr = clamp((tr - SR7[i][0])/(SR7[i][1] - SR7[i][0]), 0, 1), sx = x0 + i*(sw + 1.6);
      sCard(c, sx, wy + 5.5, sw, .7, wa, .35, "rgba(28,26,25,.14)", 0); if(pr > 0) sCard(c, sx, wy + 5.5, sw*pr, .7, wa, .35, SYS.ink, 0);
    }
    /* leveransen: adressen, bostadsuppgifterna och statusen syns hela tiden */
    var ha = wa*rev(tr, .1, .6), pulse = (tr > 9.4 && tr < 12.2) ? .5 + .5*Math.sin((tr - 9.4)*5) : 0;
    v3Text(c, T("a8.re.addr"), x0, wy + 15, {size:7.2, color:SYS.ink, alpha:ha, p:oQ(k3(tr, .1, .9))});
    sTx(c, (T("a8.re.city") + "  ·  " + T("a8.re.facts")).toUpperCase(), x0, wy + 20, ha, {size:2.7, weight:600, color:pulse > 0 ? "#2f6a3a" : SYS.mut, sp:.14});
    var pw3 = 24; sCard(c, x0 + cw - pw3, wy + 10.2, pw3, 5.8, ha, 2.9, "#dfeedd", 0); sTx(c, "LEVERERAD", x0 + cw - pw3/2, wy + 14.1, ha, {size:2.3, weight:600, color:"#2f6a3a", align:"c", sp:.14});
    /* 1 · välj bilder ur leveransen */
    k = scn(tr, .2, 5.2);
    if(k.a > .02){
      var tw = (cw - 2*2.4)/3, th = tw*.62, gh = 2*th + 2.4, nsel = 0;
      c.save(); c.translate(0, k.dy);
      for(i = 0; i < 3; i++) if(tr >= SELT7[i]) nsel++;
      sTx(c, "KAMPANJ AV LEVERANSEN", x0, yc + 2, k.a*rev(tr, .6, .6), {size:2.4, weight:600, sp:.2});
      sTx(c, nsel + " / 3 VALDA", x0 + cw, yc + 2, k.a*rev(tr, .6, .6), {size:2.4, color:SYS.mut, align:"r", sp:.16});
      var gy = yc + 5.4;
      for(i = 0; i < 6; i++){
        var gx2 = x0 + (i % 3)*(tw + 2.4), gy2 = gy + Math.floor(i/3)*(th + 2.4), ga = rev(tr, .7 + i*.1, .5)*k.a;
        sCard(c, gx2 - .4, gy2 - .4, tw + .8, th + .8, ga, 1.4, "#fff", 2); sPh(c, GRID7[i], gx2, gy2, tw, th, ga, 1.2, 1.14);
        var si = SEL7.indexOf(i);
        if(si >= 0 && tr >= SELT7[si]){
          var sp = oBack(k3(tr, SELT7[si], SELT7[si] + .35));
          c.save(); c.globalAlpha = k.a; c.strokeStyle = SYS.ink; c.lineWidth = .6; rr(c, gx2 - .9, gy2 - .9, tw + 1.8, th + 1.8, 1.6); c.stroke(); c.fillStyle = SYS.ink; c.beginPath(); c.arc(gx2 + 3.4, gy2 + 3.4, 2.4*Math.max(.01, sp), 0, 7); c.fill(); c.restore();
          if(sp > .6) sTx(c, String(si + 1), gx2 + 3.4, gy2 + 4.4, k.a, {size:2.6, weight:600, color:"#fff", align:"c"});
        }
      }
      sBtn(c, 50, gy + gh + 5.5, 46, 8.2, "FORTSÄTT  ›", rev(tr, 3.4, .5)*k.a, k3(tr, 4.4, 4.7));
      c.restore();
    }
    /* 2–4 · mallar, kampanjen skapas, klart: samma mallar ligger kvar hela vägen */
    k = scn(tr, 5.2, WEND7);
    if(k.a > .02){
      var mw = (cw - 2*2.4)/3, mh = mw*1.25, my = yc + 6, ph7 = [GRID7[0], GRID7[2], GRID7[4]];
      c.save(); c.translate(0, k.dy);
      var l8 = rev(tr, 8.7, .5), lbl1 = k.a*rev(tr, 5.5, .6)*(1 - l8), lbl2 = k.a*l8*(1 - rev(tr, 12.8, .4)), lbl3 = k.a*rev(tr, 13.0, .5);
      sTx(c, "VÄLJ VILKA MALLAR SOM SKA INGÅ", x0, yc + 2, lbl1, {size:2.4, weight:600, sp:.2});
      sTx(c, "KAMPANJEN SKAPAS", x0, yc + 2, lbl2, {size:2.4, weight:600, sp:.2});
      sTx(c, "KAMPANJEN ÄR KLAR", x0, yc + 2, lbl3, {size:2.4, weight:600, sp:.2});
      var slotA = rev(tr, 8.95, .5)*(1 - rev(tr, 12.6, .4)), SL = [[[38, 96], [36, 108.5]], [[50, 90.5], [50, 100.9]], [[50, 86.5], [50, 96.3]]];
      for(i = 0; i < 3; i++){
        var mx = x0 + i*(mw + 2.4), ma = rev(tr, 5.7 + i*.2, .6)*k.a, selT = 6.5 + i*.45, sel = clamp(k3(tr, selT, selT + .3), 0, 1), prog = clamp(k3(tr, 9.95 + i*.6, 11.45 + i*.6), 0, 1);
        sCard(c, mx - .6, my - .6, mw + 1.2, mh + 1.2, ma, 1.8, "#fff", 3, sel > .5 && tr < 8.8 ? SYS.ink : null);
        if(ma > .02){ c.save(); c.globalAlpha = ma; tplB(c, KB[i], mx, my, mw, prog, DO(i, ph7[i], slotA)); c.restore() }
        sTx(c, LABS[i], mx + .6, my + mh + 5.4, ma, {size:2.9, weight:600});
        if(sel > .02){ var br = 2.1*oBack(sel); c.save(); c.globalAlpha = ma; c.fillStyle = SYS.grn; c.beginPath(); c.arc(mx + mw - 2.4, my + mh + 4.4, Math.max(.01, br), 0, 7); c.fill(); c.restore(); chk(c, mx + mw - 2.4, my + mh + 4.4, 1.6, k3(tr, selT + .1, selT + .4), "#fff", .4) }
      }
      /* bostadsuppgifterna lyfts ur leveransen och landar i mallens fält */
      for(i = 0; i < 3; i++){
        var mx2 = x0 + i*(mw + 2.4), pxy = function(q){ return [mx2 + q[0]*mw/100, my + q[1]*mw/100] };
        flyChip(c, T("a8.re.addr"), x0 + 11, wy + 13.2, pxy(SL[i][0])[0], pxy(SL[i][0])[1], tr, 9.4 + i*.6, .85, k.a);
        flyChip(c, T("a8.re.facts"), x0 + 16, wy + 19.2, pxy(SL[i][1])[0], pxy(SL[i][1])[1], tr, 9.8 + i*.6, .85, k.a);
      }
      var zy = my + mh + 9.5;
      sBtn(c, 50, zy + 1.5, 52, 8.2, "SKAPA KAMPANJ  ›", rev(tr, 7.5, .5)*k.a*(1 - rev(tr, 8.5, .4)), k3(tr, 8.15, 8.45));
      var pa = rev(tr, 9.0, .5)*k.a*(1 - rev(tr, 12.6, .4)), pp = k3(tr, 9.3, 12.2);
      if(pa > .02){
        sCard(c, x0, zy + 1.4, cw, .7, pa, .35, "rgba(28,26,25,.14)", 0); sCard(c, x0, zy + 1.4, Math.max(.4, cw*pp), .7, pa, .35, "#2f6a3a", 0);
        sTx(c, "MALLARNA FYLLS I AUTOMATISKT", 50, zy + 8, pa, {size:2.7, weight:600, color:SYS.ink, align:"c", sp:.16});
        sTx(c, "Adress, rum och yta kommer från leveransen", 50, zy + 13.3, pa, {size:2.5, weight:500, color:SYS.mut, align:"c"});
      }
      var ca = rev(tr, 13.8, .5)*k.a, fx = x0, done = tr >= 15.45;
      ["4:5", "1:1", "9:16"].forEach(function(s, q){ var w = v3Measure(c, s, {size:2.6, weight:500, f:"sans"}) + 6.4; sCard(c, fx, zy - 1.2, w, 5.4, ca*rev(tr, 14.0 + q*.12, .4), 2.7, "#fff", 0, SYS.line); sTx(c, s, fx + w/2, zy + 2.4, ca*rev(tr, 14.0 + q*.12, .4), {size:2.6, weight:500, color:SYS.mut, align:"c"}); fx += w + 1.6 });
      var bpress = k3(tr, 15.4, 15.7);
      sBtn(c, 50, zy + 6, 56, 8.2, done ? "✓  NEDLADDAD" : "LADDA NER ALLA 3  ›", rev(tr, 14.3, .5)*k.a, bpress, done ? "#2f6a3a" : null, done ? "#fff" : null);
      if(done && ca > .02){ var pz = clamp(k3(tr, 15.45, 16.15), 0, 1); c.save(); c.globalAlpha = ca*(1 - pz)*.5; c.strokeStyle = "#2f6a3a"; c.lineWidth = .4; rr(c, 50 - 28 - pz*2.5, zy + 6 - pz*2.5, 56 + pz*5, 8.2 + pz*5, 4.1 + pz*2); c.stroke(); c.restore() }
      c.restore();
    }
    c.restore();
  }
  if(t >= wend + .3) twoPart(c, t, wend + .3, Lx + .05, T("a8.sa.f1"), T("a8.sa.f2"), G.is9 ? 12 : 10, S.y0 + S.h*.46);
}
function adSaluA(c, G, t){ adSalu(c, G, t, 0) }
function adSaluB(c, G, t){ adSalu(c, G, t, 1) }
function sndSaluB(H){ sndSalu(H, OFF7 + .7, true); for(var q = 0; q < 6; q++) H.s("shutter", q*.14, .26); H.s("tick2", .95, .07); H.s("shutter", 1.4, .3) }
function sndSalu(H, off, skipOpen){ var O = off == null ? OFF7 : off; if(!skipOpen) H.s("shutter", .1, .5);
  SELT7.forEach(function(s){ H.click(s + O, .18) }); H.click(4.45 + O, .26);
  H.click(8.2 + O, .26);
  H.s("tick2", 12.2 + O, .07); H.click(15.45 + O, .26); H.s("tick2", 15.6 + O, .09) }

function DOBJ(){ return {addr:T("a8.re.addr"), city:T("a8.re.city"), facts:T("a8.re.facts"), agent:"Anna Lindqvist", ph:{o:"rs_dusk1", g:P.dining, e:"rs_dusk2"}} }
function sndResa(H){ var O = 1.9; H.s("shutter", .1, .6); [7.05, 12.45, 15.5, 19.05, 21.75].forEach(function(s){ H.s("tick1", s + O, .06) }); [8.85, 10.7].forEach(function(s){ H.s("tick2", s + O, .1) }) }

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
    v3Text(c, D.lab || "Till salu", 24, 9.2, {size:4.4, weight:600, f:"sans", color:"#fff", align:"c"}); c.restore();
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
    var pa = f(0, .25); if(pa > .02){ c.save(); c.globalAlpha = pa; c.fillStyle = "#F3EFE7"; rr(c, 35, 77.6, 30, 7.4, 3.7); c.fill(); c.restore(); v3Text(c, (D.lab || "Till salu").toUpperCase(), 50, 82.5, {size:3, weight:700, f:"sans", sp:.26, color:GREEN, align:"c", alpha:pa}) }
    v3Text(c, D.addr, 50, 100, {size:11, color:"#F3EFE7", align:"c", alpha:f(.1, .35), p:f(.1, .4)});
    v3Text(c, D.city.toUpperCase(), 50, 106.4, {size:2.8, weight:500, f:"sans", sp:.3, color:"rgba(243,239,231,.85)", align:"c", alpha:f(.3, .55)});
    v3Line(c, 44, 56, 109.6, "#F3EFE7", .3, f(.45, .6), .6);
    v3Text(c, D.facts, 50, 115, {size:3.4, weight:500, f:"sans", color:"rgba(243,239,231,.92)", align:"c", alpha:f(.5, .75)});
    v3Text(c, D.agent, 50, 120.4, {size:3.7, italic:true, color:"rgba(243,239,231,.78)", align:"c", alpha:f(.7, .95)});
  } else {
    v3Fill(c, 0, 0, 100, 125, "#F4F0E8");
    c.save(); c.globalAlpha = .4; c.strokeStyle = "#1c1c1e"; c.lineWidth = .3; c.strokeRect(3.2, 3.2, 93.6, 118.6); c.restore();
    v3Text(c, (D.lab || "Till salu").toUpperCase(), 8, 10.2, {size:2.8, weight:700, f:"sans", sp:.3, color:"#1c1c1e", alpha:f(0, .2), p:f(0, .25)});
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
var BOOK = {b:"a7.btnB"}, BOVER = {logo:true};
window.V3_ADS8 = [];
function loadAudio8(){ return v3SfxLoad() }
function reg8(id, n, d, L, fn, thumb, sched, over){
  var comp = {n:n, d:d, group:"ads8", dur:L + END_L, thumb:thumb, id:id, v:{id:id}, L:L};
  comp.draw = function(c, G, t){ fn(c, G, t); if(t >= L) K.endSeq(c, G, t, L, over ? BOVER : BOOK) };
  comp.mix = K.makeMix(sched); comp.loadAudio = loadAudio8;
  if(over){ comp.dur = L + 4.1; comp.logo = true }
  V3_COMPS[id] = comp; V3_ADS8.push(id);
}
reg8("a8_ny", "1 · Bostadsfoto. Och lite till.", "Fotografering och allt som ingår i presentationen.", L1, adNy, 9.6, sndNy);
reg8("a8_resa", "2 · Ett objekt. Hela vägen.", "Ett objekt följs från intag och bokning till leverans, annonstext och inlägg.", L6, adResa, 16.0, sndResa, true);
reg8("a8_skane", "3 · Din bostadsfotograf i Skåne", "Orterna, och ett inlägg som byter mall medan uppgifterna ligger kvar.", L5, adSkane, 12.4, sndSkane);
reg8("a8_salu", "4 · Ditt nästa objekt. Som tre färdiga inlägg.", "Välj bilder, välj mallar, kampanjen skapas med uppgifterna ifyllda, ladda ner alla tre.", L7, adSaluA, 14.0, sndSalu, true);
reg8("a8_salub", "5 · Bilder blir inlägg (variant B av 4)", "Samma film som 4, men med en annan öppning: leveransens bilder slår om till färdiga inlägg.", L7 + .7, adSaluB, 2.0, sndSaluB, true);

/* ---------- annonsplan ---------- */
var PLAN = [
  {t:"1 · Bostadsfoto. Och lite till.", syfte:"Kännedom. Ny aktör inom bostadsfotografering, och fotografering är kärnan. \"Lite till\" visar allt som ingår.", steg:"Överst i tratten. Kall målgrupp.", prim:"Bostadsfoto. Och lite till. Foto, skymningsbild, film, planritning, solbana och karta, i en bokning.", rub:"Ny aktör inom bostadsfotografering", cta:"Läs mer", mal:"Räckvidd, ThruPlay."},
  {t:"2 · Ett objekt. Hela vägen.", syfte:"Förståelse. Ett objekt följs genom hela flödet: intag, bokning, leverans, annonstext och inlägg. Sparar tid och ger bättre resultat.", steg:"Mitten. Visas efter annons 1.", prim:"Ett objekt. Hela vägen. Från intagsmötet och bokningen till leverans i mäklarportalen, annonstext och färdiga inlägg, allt i kontorets utseende.", rub:"Ett objekt. Hela vägen.", cta:"Boka fotografering", mal:"Visningstid, klick."},
  {t:"3 · Din bostadsfotograf i Skåne", syfte:"Lokalt. Foto är kärnan, och inlägget byter mall medan uppgifterna ligger kvar.", steg:"Botten. Retargeting mot dem som sett minst hälften av en annons.", prim:"Din bostadsfotograf i Skåne. Ett inlägg, ditt kontors utseende, uppgifterna från bokningen. Boka fotografering på viewly.se.", rub:"Din bostadsfotograf i Skåne", cta:"Boka fotografering", mal:"Bokningar, kostnad per klick."},
  {t:"4 · Ditt nästa objekt. Som tre färdiga inlägg.", syfte:"Förståelse och nyfikenhet. Visar hur leveransen blir tre färdiga inlägg: välj bilder, välj mallar, uppgifterna fylls i automatiskt.", steg:"Mitten. Visas efter annons 1.", prim:"Ditt nästa objekt. Som tre färdiga inlägg. Välj bilder från leveransen, välj mallar, och kampanjen skapas med adress, ort, rum och yta ifyllda. I kontorets utseende.", rub:"Från leverans till färdiga inlägg", cta:"Läs mer", mal:"Visningstid, klick."}
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
    + '<p>Fyra annonser för mäklare i Skåne på Facebook och Instagram, var och en med en egen uppgift: kännedom, förståelse för hela flödet, hur leveransen blir inlägg och det lokala. Fotografering är kärnan, och allt som följer med bokningen visas som en del av den. Lugn rörelse, få riktiga ljud, begripligt utan ljud. Alla slutar med Boka fotografering. Förslag, inget publicerat.</p></div>'
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
    + '<p class="a3lede">En kampanj med målet kännedom (räckvidd och videovisningar) mot mäklare i Skåne, med alla fyra annonser i samma annonsgrupp. Annonserna är olika på riktigt (olika vinst, upplägg och bild), eftersom Meta visar lika annonser mot varandra i stället för att nå fler. Ett andra steg riktas mot dem som sett minst hälften av en annons, med annons 2, 3 och 4.</p>'
    + '<div class="a3copy">' + PLAN.map(function(p){ return '<div><b>' + esc(p.t) + '</b><p>' + esc(p.syfte) + '</p><b>Steg i tratten</b><p>' + esc(p.steg) + '</p><b>Primärtext</b><p>' + esc(p.prim) + '</p><b>Rubrik · knapp</b><p>' + esc(p.rub) + ' · ' + esc(p.cta) + '</p><b>Mäts på</b><p>' + esc(p.mal) + '</p></div>' }).join("") + '</div>'
    + '<details class="a3det a3cust"><summary>Slutet, knappens text</summary><div class="a3hxs">' + ["a7.btnB", "a7.url", "a7.tag"].map(function(k){ return v3TxField(k, k === "a7.btnB" ? "Slutet · knappens text" : k === "a7.url" ? "Slutet · adressen" : "Slutet · raden efter adressen") }).join("") + '</div></details>'
    + ["ny", "re", "sa", "sb", "sk"].map(function(p, i){ return txEd("a8." + p + ".", ["1 · Bostadsfoto. Och lite till.", "2 · Ett objekt. Hela vägen.", "4 · Ditt nästa objekt. Som tre färdiga inlägg.", "5 · Bilder blir inlägg (variant B)", "3 · Din bostadsfotograf i Skåne"][i]) }).join("")
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
