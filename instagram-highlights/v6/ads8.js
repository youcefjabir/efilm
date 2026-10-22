/* =====================================================================
   SIDA 16 — MAGASIN
   Annonser för mäklaren på Facebook och Instagram med tidningskänsla:
   omslag, innehållsförteckning, citat, uppslag, register och steg-för-steg.
   Samma regler som sida 15: bara era egna bilder, ingen musik, bara få
   riktiga ljud, och samma slut som varumärkesfilmen. Skillnaden är att
   knappen i slutet kan säga "Boka fotografering" när annonsen handlar om
   fotograferingen, och "Upptäck verktygen" när den handlar om verktygen.
   Varje annons finns i A, B och C (olika bild i huvudrollen och olika rader).
   Avstånd: sidomarginal 8, glapp 5, och allt som ritas registrerar sin ruta
   så att layouttest.js kan kontrollera att inget krockar i 9:16, 4:5 och 1:1.
   ===================================================================== */
(function(){
var K = window.A7K, A7 = K.A7, ph = K.ph, box = K.box, MX = K.MX, GAP = K.GAP, END_L = K.END_L, reg = K.rawReg, rr = K.rr;
var PAPER = C3.paper, INK = C3.ink, MUT = "#5f5a55", DARK = "#070606", OLI = C3.oli;

/* ---------- texter ---------- */
var TX = {
  "a8.r1t":["Bostadsfoton", "Innehåll · rad 1"], "a8.r1d":["Redigerade", "Innehåll · rad 1, förklaring"],
  "a8.r2t":["Färdiga inlägg", "Innehåll · rad 2"], "a8.r2d":["Kommande, till salu, såld", "Innehåll · rad 2, förklaring"],
  "a8.r3t":["Tre format", "Innehåll · rad 3"], "a8.r3d":["Story, flöde, kvadrat", "Innehåll · rad 3, förklaring"],
  "a8.r4t":["Ditt varumärke", "Innehåll · rad 4"], "a8.r4d":["Namn, färg, logga", "Innehåll · rad 4, förklaring"],
  "a8.s1t":["Boka", "Steg · 1"], "a8.s1d":["Välj tid, så kommer fotografen.", "Steg · 1, förklaring"],
  "a8.s2t":["Vi fotograferar", "Steg · 2"], "a8.s2d":["Bilderna redigeras och levereras.", "Steg · 2, förklaring"],
  "a8.s3t":["Du får allt", "Steg · 3"], "a8.s3d":["Foton och färdiga inlägg, med ditt namn.", "Steg · 3, förklaring"],
  "a8.cap1":["Bara bilder", "Uppslag · vänster sida, etikett"], "a8.cap1b":["Bilderna, och sedan väntan.", "Uppslag · vänster sida, text"],
  "a8.cap2":["Bilder + inlägg", "Uppslag · höger sida, etikett"], "a8.cap2b":["Båda i samma leverans.", "Uppslag · höger sida, text"],
  "a8.attr":["VIEWLY · BOSTADSFOTOGRAFI I SKÅNE", "Citat · avsändare"],
  "a8.sk.foot":["Foton och färdiga inlägg.", "Register · slutrad"]
};
var HOOK = {
  omslag:{n:"Omslag", A:["Foton som säljer.", "Och inlägg som redan är färdiga.", "ALLT I SAMMA LEVERANS"], B:["Bilderna först.", "Inläggen direkt efter.", "I SAMMA LEVERANS"], C:["Fotografering", "som inte slutar vid bilderna.", "BOKA DIN FÖRSTA LEVERANS"]},
  innehall:{n:"Innehåll", A:["Det här ingår", "i en leverans.", "Allt på en gång."], B:["Vad får du", "egentligen?", "Allt på en gång."], C:["I det här numret", "av din leverans.", "Allt på en gång."]},
  citat:{n:"Citat", A:["Bilderna är bara", "halva leveransen.", "Andra halvan:", "färdiga inlägg."], B:["Efter fotograferingen", "börjar nästa jobb.", "Foton och inlägg.", "I samma leverans."], C:["Du ska inte behöva", "göra inläggen själv.", "Bilder och inlägg.", "Samma leverans."]},
  uppslag:{n:"Uppslag", A:["Samma foto.", "Olika leverans."], B:["Bara bilder,", "eller bilder och inlägg?"], C:["Vad får du", "av din fotograf?"]},
  skane:{n:"Register", A:["BOSTADSFOTOGRAFI I", "Skåne"], B:["VI FINNS I", "Skåne"], C:["FOTO OCH INLÄGG I", "Skåne"]},
  steg:{n:"Steg", A:["Så går det", "till."], B:["Tre steg till", "färdiga inlägg."], C:["Från bokning", "till inlägg."]}
};
Object.keys(HOOK).forEach(function(id){ ["A", "B", "C"].forEach(function(v){ HOOK[id][v].forEach(function(s, i){ TX["a8." + id + "." + v + "." + (i + 1)] = [s, HOOK[id].n + " · " + v + " · rad " + (i + 1)] }) }) });
Object.keys(TX).forEach(function(k){ V3_TXD[k] = TX[k][0] });
var T = function(k){ return v3t(k) };
function h8(id, i){ return T("a8." + id + "." + (A7.vo ? "A" : A7.v) + "." + (i + 1)) }

/* ---------- gemensamma delar ---------- */
function rev(t, a, d){ return ioC(k3(t, a, a + (d == null ? .6 : d))) }
function fz(c, s, o, maxW){ var w = v3Measure(c, s, o); return w > maxW ? o.size*maxW/w : o.size }
function tx(c, s, x, y, o, maxW){ if(maxW) o.size = fz(c, s, o, maxW); return v3Text(c, s, x, y, o) }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)) }
/* tidningens hårfina streck och små versaler */
function label(c, s, x, y, a, o){ o = o || {}; return v3Text(c, s, x, y, {size:o.size || 1.5, weight:o.weight || 600, f:"sans", sp:o.sp == null ? .28 : o.sp, color:o.color || MUT, align:o.align || "l", alpha:a, p:o.p}) }
function mast(c, G, t, o){
  o = o || {}; var B = box(G), t0 = o.t0 || 0, col = o.col || INK, mut = o.mut || MUT, a = rev(t, t0, .7), y = B.y0 + 2.3;
  label(c, "VIEWLY", MX, y, a, {size:2, color:col, sp:.34});
  label(c, o.right || "BOSTADSFOTOGRAFI · SKÅNE", 100 - MX, y, a, {size:1.45, color:mut, align:"r", weight:500});
  v3Line(c, MX, 100 - MX, B.y0 + 4.4, col, .18, ioC(k3(t, t0 + .1, t0 + .9)), .5);
  reg("mast", MX, B.y0, 100 - 2*MX, 5);
  return B.y0 + 5;
}
/* rubrik: två rader om det finns plats (9:16), annars en rad med kursiv fortsättning */
function headM(c, G, t, t0, l1, l2, y, o){
  o = o || {}; var s0 = G.is9 ? 8.6 : (G.H > 110 ? 6.6 : 5.4), a = rev(t, t0, .7), p1 = oQ(k3(t, t0, t0 + .9)), p2 = oQ(k3(t, t0 + .3, t0 + 1.2));
  var col1 = o.c1 || INK, col2 = o.c2 || OLI, two = G.is9, h;
  if(two){
    var s = Math.min(fz(c, l1, {size:s0, weight:300}, 84), fz(c, l2, {size:s0, weight:300, italic:true}, 84));
    v3Text(c, l1, MX, y + s*.8, {size:s, color:col1, alpha:a, p:p1, rise:2});
    v3Text(c, l2, MX, y + s*1.95, {size:s, italic:true, color:col2, alpha:a, p:p2, rise:2});
    h = s*2.3;
  } else {
    var w1 = v3Measure(c, l1 + " ", {size:s0, weight:300}), w2 = v3Measure(c, l2, {size:s0, weight:300, italic:true}), s = w1 + w2 > 84 ? s0*84/(w1 + w2) : s0;
    w1 = v3Measure(c, l1 + " ", {size:s, weight:300});
    v3Text(c, l1 + " ", MX, y + s*.8, {size:s, color:col1, alpha:a, p:p1, rise:2});
    v3Text(c, l2, MX + w1, y + s*.8, {size:s, italic:true, color:col2, alpha:a, p:p2, rise:2});
    h = s*1.15;
  }
  if(a > .5) reg("rubrik", MX, y, 84, h, {head:1});
  return y + h;
}
function pframe(c, key, x, y, w, h, a, o){
  o = o || {}; if(a <= .02) return;
  c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.16)"; c.shadowBlur = 4; c.shadowOffsetY = 1; c.fillStyle = "#fff"; rr(c, x - .7, y - .7, w + 1.4, h + 1.4, .8); c.fill(); c.restore();
  c.save(); c.globalAlpha = a; v3Photo(c, key, x, y, w, h, {scale:o.scale || 1.06, pos:o.pos || V3_POS[key]}); c.restore();
}
function check(c, x, y, r, p, col){ if(p <= 0) return; c.save(); c.strokeStyle = col || OLI; c.lineWidth = r*.26; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(x - r*.5, y); c.lineTo(x - r*.1, y + r*.42*Math.min(1, p*2)); if(p > .5) c.lineTo(x - r*.1 + r*.75*(p - .5)*2, y + r*.42 - r*.95*(p - .5)*2); c.stroke(); c.restore() }

/* =====================================================================
   1 · OMSLAG
   ===================================================================== */
function cover(c, G, t, o){
  var H = G.H, B = box(G), TT = o.T, pk = ph(0), i;
  v3Fill(c, 0, 0, 100, H, DARK);
  v3Photo(c, pk, 0, 0, 100, H, {scale:lerp(1.04, 1.15, k3(t, 0, o.L)), pos:V3_POS[pk], alpha:ioC(k3(t, 0, .5))});
  v3Grad(c, 0, 0, 100, H*.4, [[0, "rgba(8,7,7,.82)"], [.55, "rgba(8,7,7,.45)"], [1, "rgba(8,7,7,0)"]]);
  v3Grad(c, 0, H*.4, 100, H*.6, [[0, "rgba(8,7,7,0)"], [1, "rgba(8,7,7,.9)"]]);
  var mo = {size:G.is9 ? 15 : (H > 110 ? 12.5 : 10.5), weight:300, sp:.3, color:"#fff"}; mo.size = fz(c, "VIEWLY", mo, 84);
  var ms = mo.size, my = B.y0 + ms*.78, mp = oQ(k3(t, .2, 1.2));
  mo.align = "c"; mo.alpha = ioC(k3(t, .2, .6)); mo.p = mp; v3Text(c, "VIEWLY", 50, my, mo);
  label(c, "BOSTADSFOTOGRAFI FÖR MÄKLARE · SKÅNE", 50, my + 3.8, rev(t, .7, .6)*.9, {size:1.75, color:"#fff", align:"c", sp:.3, weight:500});
  reg("mast", MX, B.y0, 84, my + 4.6 - B.y0);
  var s1 = G.is9 ? 11 : (H > 110 ? 8.6 : 6.8), s2 = s1*.5, g = 3.4, h1 = s1*.78, h2 = s2*.8, total = 1.5 + h1 + h2 + 2.1 + 3*g, top = B.y1 - total;
  var y1 = top + 1.5 + g + h1, y2 = y1 + g + h2 + s2*.1, y3 = y2 + g + 2.1;
  v3Line(c, MX, 100 - MX, top - 2.5, "#fff", .2, ioC(k3(t, TT[0] - .3, TT[0] + .7)), .55);
  label(c, "I DET HÄR NUMRET", MX, top + 1.5, rev(t, TT[0] - .2, .6)*.85, {size:1.4, color:"#d9dfcd", weight:500});
  var o1 = {size:s1, weight:300, color:"#fff", shadow:true}; o1.size = fz(c, h8("omslag", 0), o1, 84);
  v3Text(c, h8("omslag", 0), MX, y1, {size:o1.size, color:"#fff", shadow:true, alpha:rev(t, TT[0], .6), p:oQ(k3(t, TT[0], TT[0] + .9)), rise:2});
  var o2 = {size:s2, weight:300, italic:true, color:C3.cream, shadow:true}; o2.size = fz(c, h8("omslag", 1), o2, 84);
  v3Text(c, h8("omslag", 1), MX, y2, {size:o2.size, italic:true, color:C3.cream, shadow:true, alpha:rev(t, TT[1], .6), p:oQ(k3(t, TT[1], TT[1] + .9)), rise:2});
  var l3 = h8("omslag", 2), lo = {size:2.1, weight:600, f:"sans", sp:.24}; lo.size = fz(c, l3, lo, 84);
  label(c, l3, MX, y3, rev(t, TT[2], .6), {size:lo.size, color:"#fff"});
  reg("omslagsrader", MX, top - 2.5, 84, B.y1 - top + 2.5);
}
function sndCover(T0){ return function(H){ H.s("shutter", .15, .5); T0.forEach(function(s){ H.s("tick1", s, .16) }) } }

/* =====================================================================
   2 · INNEHÅLL
   ===================================================================== */
function toc(c, G, t, o){
  var H = G.H, B = box(G), R = o.R, i;
  v3Fill(c, 0, 0, 100, H, PAPER);
  var by = mast(c, G, t, {});
  var phH = G.is9 ? 38 : (H > 110 ? 23 : 14), py = by + GAP*.8, cur = ioC(k3(t, .2, 1.1));
  if(cur > .01){ c.save(); c.beginPath(); c.rect(MX, py, 84, phH*cur); c.clip(); v3Photo(c, ph(0), MX, py, 84, phH, {scale:lerp(1.12, 1.04, k3(t, .2, 3)), pos:V3_POS[ph(0)]}); c.restore() }
  if(cur > .5) reg("foto", MX, py, 84, phH);
  var hy = py + phH + GAP*.8, hb = headM(c, G, t, o.H0, h8("innehall", 0), h8("innehall", 1), hy);
  var footH = G.is9 ? 8 : 6.5, ry0 = hb + GAP*.7, rh = clamp((B.y1 - ry0 - footH)/4, 6, G.is9 ? 16 : 11);
  var st = Math.min(5.4, rh*.46), ds = Math.min(1.8, rh*.2);
  for(i = 0; i < 4; i++){
    var a = rev(t, R[i], .55), y = ry0 + i*rh, ti = T("a8.r" + (i + 1) + "t"), de = T("a8.r" + (i + 1) + "d");
    v3Line(c, MX, 100 - MX, y, INK, .16, ioC(k3(t, R[i] - .1, R[i] + .6)), .45);
    label(c, "0" + (i + 1), MX, y + rh*.64, a, {size:Math.min(1.7, rh*.2), color:MUT});
    var so = {size:st, weight:400}; var wd = v3Measure(c, de, {size:ds, weight:500, f:"sans"});
    var maxT = 84 - 9 - 8 - wd - 4; so.size = fz(c, ti, so, Math.max(20, maxT));
    v3Text(c, ti, MX + 9, y + rh*.66, {size:so.size, color:INK, alpha:a, p:oQ(k3(t, R[i], R[i] + .7)), rise:1.5});
    v3Text(c, de, 100 - MX - 7, y + rh*.62, {size:ds, weight:500, f:"sans", color:MUT, align:"r", alpha:a});
    check(c, 100 - MX - 2.2, y + rh*.5, 2.2, k3(t, R[i] + .35, R[i] + .75), OLI);
    if(a > .5) reg("rad", MX, y + .3, 84, rh - .6);
  }
  v3Line(c, MX, 100 - MX, ry0 + 4*rh, INK, .16, ioC(k3(t, R[3], R[3] + .6)), .45);
  var fa = rev(t, o.F, .7);
  v3Text(c, h8("innehall", 2), MX, B.y1 - .6, {size:G.is9 ? 4.6 : 3.8, italic:true, color:OLI, alpha:fa, p:oQ(k3(t, o.F, o.F + .9)), rise:1.5});
  if(fa > .5) reg("slutrad", MX, B.y1 - (G.is9 ? 4.6 : 3.8)*.9, 84, (G.is9 ? 4.6 : 3.8)*1.1);
}

/* =====================================================================
   3 · CITAT
   ===================================================================== */
function quote(c, G, t){
  var H = G.H, B = box(G);
  v3Fill(c, 0, 0, 100, H, PAPER);
  var by = mast(c, G, t, {}), y0 = by + 3;
  var qg = G.is9 ? 30 : (H > 110 ? 22 : 15), ink = qg*.34, sq = G.is9 ? 10.2 : (H > 110 ? 6.8 : 5.4);
  var ga = rev(t, .3, .8);
  v3Text(c, "“", MX - 1, y0 + qg*.62, {size:qg, weight:300, color:C3.olil, alpha:ga, p:oQ(k3(t, .3, 1.1))});
  if(ga > .5) reg("citattecken", MX, y0, qg*.38, ink + 1);
  var q1 = h8("citat", 0), q2 = h8("citat", 1), qs = Math.min(fz(c, q1, {size:sq, weight:300}, 84), fz(c, q2, {size:sq, weight:300, italic:true}, 84));
  var qy = y0 + ink + 2 + qs*.8;
  v3Text(c, q1, MX, qy, {size:qs, color:INK, alpha:rev(t, .9, .7), p:oQ(k3(t, .9, 1.8)), rise:2});
  v3Text(c, q2, MX, qy + qs*1.15, {size:qs, italic:true, color:OLI, alpha:rev(t, 1.8, .7), p:oQ(k3(t, 1.8, 2.7)), rise:2});
  var qb = qy + qs*1.15 + qs*.3;
  if(t > 1.2) reg("citat", MX, qy - qs*.78, 84, qb - qy + qs*.78);
  var aa = rev(t, 3.0, .6), ay = qb + GAP*.9;
  v3Line(c, MX, MX + 14, ay - 2.2, INK, .2, ioC(k3(t, 3.0, 3.7)), .6);
  label(c, T("a8.attr"), MX, ay + .6, aa, {size:1.4, color:MUT, weight:500});
  if(aa > .5) reg("avsandare", MX, ay - 1.5, 52, 3.4);
  var py = ay + GAP + 1.2, avail = B.y1 - py, pw = Math.min(G.is9 ? 44 : 36, avail/1.3), ph1 = pw*1.28;
  var pa = rev(t, 4.2, .7), sc = lerp(.94, 1, oQ(k3(t, 4.2, 5.0)));
  if(pa > .02){
    var px = 100 - MX - pw, pyy = B.y1 - ph1;
    c.save(); c.translate(px + pw/2, pyy + ph1/2); c.scale(sc, sc); c.translate(-px - pw/2, -pyy - ph1/2);
    c.globalAlpha = pa; v3Post(c, "overlay", "tillsalu", ph(0), px, pyy, pw, ph1/pw, k3(t, 4.2, 5.4)); c.restore();
    if(pa > .5) reg("inlagg", px, pyy, pw, ph1);
  }
  var as = Math.min(G.is9 ? 6.4 : 5.2, (84 - pw - GAP)/ (G.is9 ? 3.6 : 3.4)), l1 = h8("citat", 2), l2 = h8("citat", 3), ay1 = B.y1 - ph1 + as*.9;
  var as1 = Math.min(fz(c, l1, {size:as, weight:300}, 84 - pw - GAP), fz(c, l2, {size:as, weight:300, italic:true}, 84 - pw - GAP));
  v3Text(c, l1, MX, ay1, {size:as1, color:INK, alpha:rev(t, 5.2, .7), p:oQ(k3(t, 5.2, 6.1)), rise:2});
  v3Text(c, l2, MX, ay1 + as1*1.2, {size:as1, italic:true, color:OLI, alpha:rev(t, 6.0, .7), p:oQ(k3(t, 6.0, 6.9)), rise:2});
  if(t > 6.3) reg("svar", MX, ay1 - as1*.8, 84 - pw - GAP, as1*2.1);
}

/* =====================================================================
   4 · UPPSLAG
   ===================================================================== */
function spread(c, G, t){
  var H = G.H, B = box(G);
  v3Fill(c, 0, 0, 100, H, PAPER);
  var by = mast(c, G, t, {}), hb = headM(c, G, t, .3, h8("uppslag", 0), h8("uppslag", 1), by + GAP*.8);
  var pw = (84 - GAP)/2, capH = 9, py = hb + GAP*.8, ph1 = Math.min(pw*(G.is9 ? 1.75 : 1.3), B.y1 - py - capH), px1 = MX, px2 = MX + pw + GAP;
  var a1 = rev(t, 1.4, .8), sc1 = lerp(.96, 1, oQ(k3(t, 1.4, 2.2)));
  if(a1 > .02){
    c.save(); c.translate(px1 + pw/2, py + ph1/2); c.scale(sc1, sc1); c.translate(-px1 - pw/2, -py - ph1/2);
    pframe(c, ph(0), px1, py, pw, ph1, a1, {}); c.restore();
    if(a1 > .5) reg("sida1", px1, py, pw, ph1);
  }
  var cy = py + ph1 + 4.2;
  label(c, T("a8.cap1"), px1, cy, rev(t, 2.3, .6), {size:1.45, color:MUT});
  v3Text(c, T("a8.cap1b"), px1, cy + 3.8, {size:Math.min(2.9, fz(c, T("a8.cap1b"), {size:2.9, italic:true, weight:400}, pw)), italic:true, weight:400, color:INK, alpha:rev(t, 2.5, .6)});
  var tp = ioC(k3(t, 3.6, 4.5));
  if(tp > .02){
    c.save(); c.translate(px2, 0); c.scale(Math.max(.02, tp), 1); c.translate(-px2, 0);
    v3Post(c, "overlay", "tillsalu", ph(0), px2, py, pw, ph1/pw, k3(t, 3.8, 5.0));
    v3Fill(c, px2, py, pw, ph1, "#000", (1 - tp)*.35);
    c.restore();
    if(tp > .97) reg("sida2", px2, py, pw, ph1);
  }
  var ca = rev(t, 4.6, .6);
  label(c, T("a8.cap2"), px2, cy, ca, {size:1.45, color:INK});
  v3Text(c, T("a8.cap2b"), px2, cy + 3.8, {size:Math.min(2.9, fz(c, T("a8.cap2b"), {size:2.9, italic:true, weight:400}, pw)), italic:true, weight:400, color:INK, alpha:rev(t, 4.8, .6)});
  if(ca > .5){ reg("text1", px1, cy - 1.8, pw, 6.8); reg("text2", px2, cy - 1.8, pw, 6.8) }
  var kc = k3(t, 5.4, 5.9);
  if(kc > 0){ c.save(); c.globalAlpha = Math.min(1, kc*3); c.fillStyle = INK; c.beginPath(); c.arc(px2 + pw - 4, py + 4, 2.6, 0, 7); c.fill(); c.restore(); check(c, px2 + pw - 4, py + 3.9, 2.3, kc, "#fff") }
}

/* =====================================================================
   5 · REGISTER (Skåne)
   ===================================================================== */
var CITIES = ["Malmö", "Lund", "Landskrona", "Helsingborg"];
function index(c, G, t){
  var H = G.H, B = box(G), i;
  v3Fill(c, 0, 0, 100, H, PAPER);
  var by = mast(c, G, t, {}), y0 = by + GAP*.8, lw = 45, rx = MX + lw + 4, rw = 100 - MX - rx;
  var pa = ioC(k3(t, 1.0, 1.9)), phh = Math.min(rw*(G.is9 ? 2.5 : 1.7), B.y1 - y0 - 6);
  if(pa > .01){ c.save(); c.beginPath(); c.rect(rx, y0, rw, phh*pa); c.clip(); v3Photo(c, ph(0), rx, y0, rw, phh, {scale:lerp(1.14, 1.04, k3(t, 1, 5)), pos:V3_POS[ph(0)]}); c.restore() }
  if(pa > .5) reg("foto", rx, y0, rw, phh);
  var ca = rev(t, 2.2, .6);
  v3Text(c, "Storgatan 13, Landskrona", rx, y0 + phh + 3.4, {size:Math.min(2.3, fz(c, "Storgatan 13, Landskrona", {size:2.3, italic:true, weight:400}, rw)), italic:true, weight:400, color:MUT, alpha:ca});
  if(ca > .5) reg("fototext", rx, y0 + phh + 1.2, rw, 3.2);
  var lab = h8("skane", 0), word = h8("skane", 1), lo = {size:1.5, weight:600, f:"sans", sp:.28}; var ls = fz(c, lab, lo, lw);
  label(c, lab, MX, y0 + 1.5, rev(t, .3, .6), {size:ls, color:MUT});
  var ws = fz(c, word, {size:G.is9 ? 22 : (H > 110 ? 17 : 13), weight:300, italic:true}, lw), base = y0 + 3.6 + ws*.72;
  v3Text(c, word, MX, base, {size:ws, italic:true, color:INK, alpha:rev(t, .5, .8), p:oQ(k3(t, .5, 1.5)), rise:2});
  reg("ord", MX, y0, lw, base - y0 + 1);
  var footH = G.is9 ? 8 : 6, ry0 = base + GAP*.9, rh = clamp((B.y1 - ry0 - footH)/4, 6, G.is9 ? 17 : 11), cs = Math.min(5.6, rh*.5);
  for(i = 0; i < 4; i++){
    var s0 = 1.5 + i*.85, a = rev(t, s0, .5), y = ry0 + i*rh;
    v3Line(c, MX, MX + lw, y, INK, .16, ioC(k3(t, s0 - .1, s0 + .6)), .45);
    label(c, "0" + (i + 1), MX, y + rh*.64, a, {size:Math.min(1.6, rh*.2), color:MUT});
    v3Text(c, CITIES[i], MX + 8, y + rh*.68, {size:Math.min(cs, fz(c, CITIES[i], {size:cs, weight:400}, lw - 8)), color:INK, alpha:a, p:oQ(k3(t, s0, s0 + .7)), rise:1.5});
    if(a > .5) reg("stad", MX, y + .3, lw, rh - .6);
  }
  v3Line(c, MX, MX + lw, ry0 + 4*rh, INK, .16, ioC(k3(t, 4.7, 5.3)), .45);
  var fa = rev(t, 5.4, .7), fo = {size:G.is9 ? 4 : 3.4, italic:true, weight:300};
  fo.size = fz(c, T("a8.sk.foot"), fo, lw);
  v3Text(c, T("a8.sk.foot"), MX, B.y1 - .6, {size:fo.size, italic:true, color:OLI, alpha:fa, p:oQ(k3(t, 5.4, 6.3)), rise:1.5});
  if(fa > .5) reg("slutrad", MX, B.y1 - fo.size, lw, fo.size*1.2);
}

/* =====================================================================
   6 · STEG
   ===================================================================== */
function steps(c, G, t){
  var H = G.H, B = box(G), i;
  v3Fill(c, 0, 0, 100, H, PAPER);
  var by = mast(c, G, t, {}), hb = headM(c, G, t, .3, h8("steg", 0), h8("steg", 1), by + GAP*.8);
  var y0 = hb + GAP*.8, rh = (B.y1 - y0 - 2*GAP*.7)/3, ps = Math.min(rh, G.is9 ? 34 : 30), pw = ps*1.0;
  var S = [1.4, 3.4, 5.4];
  for(i = 0; i < 3; i++){
    var s0 = S[i], a = rev(t, s0, .7), y = y0 + i*(rh + GAP*.7), left = i % 2 === 0, px = left ? MX : 100 - MX - pw, tx0 = left ? MX + pw + 4 : MX, tw = 84 - pw - 4;
    var cy = y + (rh - ps)/2, sc = lerp(.95, 1, oQ(k3(t, s0, s0 + .8)));
    if(a > .02){
      c.save(); c.translate(px + pw/2, cy + ps/2); c.scale(sc, sc); c.translate(-px - pw/2, -cy - ps/2);
      if(i === 2){ c.globalAlpha = a; v3Post(c, "overlay", "tillsalu", ph(0), px, cy, pw, ps/pw, k3(t, s0, s0 + 1.2)) }
      else pframe(c, i === 0 ? ph(1) : ph(0), px, cy, pw, ps, a, {});
      c.restore();
      if(a > .5) reg("bild", px, cy, pw, ps);
    }
    var nsz = Math.min(G.is9 ? 14 : 11, ps*.42), tt = T("a8.s" + (i + 1) + "t"), dd = T("a8.s" + (i + 1) + "d");
    var ts = Math.min(G.is9 ? 6.6 : 5.2, ps*.2), ds = Math.min(2.8, ps*.1);
    var nw = nsz*.55, ty = cy + ps/2 - (nsz*.4 + ts*.4);
    v3Text(c, "0" + (i + 1), tx0, ty, {size:nsz, weight:300, italic:true, color:C3.olil, alpha:a, p:oQ(k3(t, s0 + .1, s0 + .9))});
    var ty2 = ty + ts*1.2, tsz = fz(c, tt, {size:ts, weight:400}, tw);
    v3Text(c, tt, tx0, ty2, {size:tsz, color:INK, alpha:rev(t, s0 + .3, .6), p:oQ(k3(t, s0 + .3, s0 + 1.1)), rise:1.5});
    var dsz = fz(c, dd, {size:ds, weight:500, f:"sans"}, tw), dsz2 = Math.min(ds, dsz);
    /* förklaring på upp till två rader */
    var words = dd.split(" "), l1 = "", l2 = "", wi;
    for(wi = 0; wi < words.length; wi++){ var tryS = (l1 ? l1 + " " : "") + words[wi]; if(!l2 && v3Measure(c, tryS, {size:ds, weight:500, f:"sans"}) <= tw) l1 = tryS; else l2 = (l2 ? l2 + " " : "") + words[wi] }
    var da = rev(t, s0 + .6, .6);
    v3Text(c, l1, tx0, ty2 + ds*2, {size:ds, weight:500, f:"sans", color:MUT, alpha:da});
    if(l2) v3Text(c, l2, tx0, ty2 + ds*3.5, {size:ds, weight:500, f:"sans", color:MUT, alpha:da});
    if(da > .5) reg("text", tx0, ty - nsz*.62, tw, ty2 + ds*(l2 ? 3.8 : 2.4) - (ty - nsz*.62));
  }
}

/* ---------- komponera ---------- */
var CT = {b:"a7.btnB", u:"a7.url", t:"a7.tag"}, CV = CT;
window.V3_ADS8 = [];
var VOB_P8 = null;
function loadAudio8(){
  if(!VOB_P8) VOB_P8 = K.loadVo(["c1", "c2", "c3", "c4", "i1", "i2"], "media/vo5/");
  return Promise.all([v3SfxLoad(), VOB_P8]);
}
function reg8(o){
  var comp = {n:o.n, d:o.d, group:"ads8", dur:o.L + END_L, thumb:o.thumb, id:o.id, v:{id:o.id}, L:o.L, isvo:!!o.vo};
  if(o.vo) comp.vo = o.vo.concat([["c4", o.L + .5]]);
  comp.draw = function(c, G, t){ if(o.vo) A7.vo = true; try { o.fn(c, G, t, o.L) } finally { A7.vo = false } if(t >= o.L) K.endSeq(c, G, t, o.L, o.cta) };
  comp.mix = K.makeMix(o.sched); comp.loadAudio = loadAudio8;
  V3_COMPS[o.id] = comp; V3_ADS8.push(o.id);
}
var TS = [1.0, 2.4, 3.8], TV = [.45, 2.85, 5.85], RS = [2.0, 2.9, 3.8, 4.7], RV = [2.95, 4.15, 5.65, 7.65];
reg8({id:"a8_omslag", n:"Omslag", d:"Ett tidningsomslag: Foton som säljer. Och inlägg som redan är färdiga.", L:7.2, thumb:5.6, cta:CT, fn:function(c, G, t, L){ cover(c, G, t, {T:TS, L:L}) }, sched:sndCover(TS)});
reg8({id:"a8_innehall", n:"Innehåll", d:"Innehållsförteckningen: vad som ingår i en leverans.", L:8.4, thumb:6.8, cta:CV, fn:function(c, G, t){ toc(c, G, t, {R:RS, H0:.9, F:6.0}) },
  sched:function(H){ H.s("shutter", .25, .45); RS.forEach(function(s){ H.s("tick1", s, .16) }) }});
reg8({id:"a8_citat", n:"Citat", d:"Bilderna är bara halva leveransen. Andra halvan: färdiga inlägg.", L:9.0, thumb:7.4, cta:CV, fn:function(c, G, t){ quote(c, G, t) },
  sched:function(H){ H.s("tick1", .9, .14); H.s("thunk", 4.35, .5) }});
reg8({id:"a8_uppslag", n:"Uppslag", d:"Samma foto på två sidor: bara bilder, och bilder med inlägg.", L:9.0, thumb:6.6, cta:CT, fn:function(c, G, t){ spread(c, G, t) },
  sched:function(H){ H.s("shutter", 1.45, .5); H.s("thunk", 3.75, .5) }});
reg8({id:"a8_register", n:"Register", d:"Skåne som ett register: Malmö, Lund, Landskrona och Helsingborg.", L:8.6, thumb:6.5, cta:CT, fn:function(c, G, t){ index(c, G, t) },
  sched:function(H){ H.s("shutter", 1.05, .45); [0, 1, 2, 3].forEach(function(i){ H.s("tick1", 1.5 + i*.85, .15) }) }});
reg8({id:"a8_steg", n:"Steg", d:"Boka, vi fotograferar, du får allt: tre steg.", L:9.4, thumb:8.2, cta:CT, fn:function(c, G, t){ steps(c, G, t) },
  sched:function(H){ H.s("tick1", 1.4, .16); H.s("shutter", 3.4, .5); H.s("thunk", 5.5, .5) }});
reg8({id:"a8_omslag_vo", n:"Omslag · med röst", d:"Svensk röst över omslaget. Slut: Boka fotografering.", L:8.2, thumb:7.0, cta:CT, vo:[["c1", .6], ["c2", 3.0], ["c3", 6.0]],
  fn:function(c, G, t, L){ cover(c, G, t, {T:TV, L:L}) }, sched:sndCover(TV)});
reg8({id:"a8_innehall_vo", n:"Innehåll · med röst", d:"Svensk röst: vad ingår i en leverans? Slut: Boka fotografering.", L:10.6, thumb:8.8, cta:CT, vo:[["i1", .5], ["i2", 3.0]],
  fn:function(c, G, t){ toc(c, G, t, {R:RV, H0:.4, F:9.2}) },
  sched:function(H){ H.s("shutter", .25, .4); RV.forEach(function(s){ H.s("tick1", s, .14) }) }});

/* ---------- sidan ---------- */
function txEd(prefix, title){
  var keys = Object.keys(TX).filter(function(k){ return k.indexOf(prefix) === 0 });
  return '<details class="a3det a3cust"><summary>' + esc(title) + '</summary><div class="a3hxs">' + keys.map(function(k){ return v3TxField(k, TX[k][1]) }).join("") + '</div></details>';
}
window.secAds8 = function(){
  if(V3_ADS8.indexOf(V3S.comp) < 0){ V3S.comp = "a8_omslag"; V3S.t = V3_COMPS.a8_omslag.thumb; V3S.playing = false; v3StopSound() }
  if(V3S.fmt !== "916" && V3S.fmt !== "45" && V3S.fmt !== "11") V3S.fmt = "916";
  var comp = V3_COMPS[V3S.comp], fn = V3S.fmt === "916" ? "9:16 · 1080 × 1920" : V3S.fmt === "45" ? "4:5 · 1080 × 1350" : "1:1 · 1080 × 1080";
  setTimeout(v3Mount, 0);
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 16</div><h2>Magasin</h2>'
    + '<p>Sex annonser med tidningskänsla för mäklaren på Facebook och Instagram, två av dem även med svensk röst. Omslag, innehåll, citat, uppslag, register och steg. Alla i A, B och C. Alla slutar med knappen <b>Boka fotografering</b>. Bara era egna bilder, inga erbjudanden, ingen musik. Förslag, inget publicerat.</p></div>'
    + '<div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w45") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play" aria-label="Spela">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '" aria-label="Tid"></div>'
    + '<span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Annons</div><div class="a3segs col">' + V3_ADS8.map(function(id){ return v3Seg("comp", id, V3_COMPS[id].n, V3S.comp === id) }).join("") + '</div>'
    + '<div class="a3h">Variant</div><div class="a3segs">' + ["A", "B", "C"].map(function(v){ return '<button type="button" class="a3seg' + (A7.v === v ? " on" : "") + '" data-a7var="' + v + '">' + v + '</button>' }).join("") + '</div>'
    + '<div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Reel 9:16", V3S.fmt === "916") + v3Seg("fmt", "45", "Flöde 4:5", V3S.fmt === "45") + v3Seg("fmt", "11", "Kvadrat 1:1", V3S.fmt === "11") + '</div>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + comp.n + " " + A7.v + " · " + fn + ' · med ljud</button></div></div></div>'
    + '<details class="a3det a3cust"><summary>Slutet, knappens text</summary><div class="a3hxs">' + ["a7.btnB", "a7.url", "a7.tag"].map(function(k){ return v3TxField(k, k === "a7.btnB" ? "Slutet · knappens text (Boka fotografering)" : k === "a7.url" ? "Slutet · adressen" : "Slutet · raden efter adressen") }).join("") + '</div></details>'
    + Object.keys(HOOK).map(function(id){ return txEd("a8." + id + ".", "Rader · " + HOOK[id].n) }).join("")
    + txEd("a8.r", "Innehåll · rader") + txEd("a8.s", "Steg · texter") + txEd("a8.cap", "Uppslag · texter")
    + '<details class="a3det"><summary>Underlag, rättigheter och vad som inte är klart</summary><div class="a3und">'
    + '<div><b>Bilder</b><p>Bara de fem bilder ni skickat. Kontrollera att ni får använda dem i reklam.</p></div>'
    + '<div><b>Påståenden</b><p>"Redigerade", "färdiga inlägg", "tre format" och "ditt varumärke" stämmer med studion i dag. Ingen tid eller siffra utlovas. Orterna i registret är de ni fotograferar i, bekräfta innan lansering.</p></div>'
    + '<div><b>Exempeldata</b><p>Storgatan 13, Landskrona är ett exempel, som i Ads.</p></div>'
    + '<div><b>Röst</b><p>Svensk syntetröst (ElevenLabs via Higgsfield). Lyssna på uttalet av "Viewly punkt se" innan publicering.</p></div>'
    + '<div><b>Ljud</b><p>Riktiga inspelade ljud, CC0: musklick, kameraslutare, mjuk duns och en ljus logotyp. Inga swooshar.</p></div></div></details></div>';
};
})();
