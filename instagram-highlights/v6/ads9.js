/* =====================================================================
   SIDA 17 — LANSERING (Ads): lanseringserbjudandet i november och december 2026
   Fyra statiska annonser (4:5 och 9:16) och tre videoannonser, i samma språk som
   sida 16: mörk helbild, stor serif i två delar, hårda klipp med kameraljud,
   systemfönstret med vita kort, och loggan som sista bild.
   Erbjudandet (ändras inte utan godkännande): 50 % på Bas, Plus och Premium,
   60 dagars fri tillgång till appar, ingen bindning, planritning ingår, från 995 kr.
   ===================================================================== */
(function(){
var K = window.A7K, A8 = window.A8K, rr = K.rr, MX = 8;
var INK = "#1C1C1E", MUT = "#5f5a55", OLI = "#6E7266", WHITE = "#fff", DARKC = "#070606", GRN = "#2f3a2d";
var rev = A8.rev, clamp = A8.clamp, fz = A8.fz, sCard = A8.sCard, sPh = A8.sPh, sTx = A8.sTx;

var QUOTE = ["Snabb och smidig hantering genom", "hela processen, från bokning till", "leverans av färdigt material."];
var AD9 = {
  A:{n:"1 · Från 995 kr", svar:"Vad erbjuder Viewly, och varför just nu?",
     meta:{prim:"Lansering i november och december: bostadsfotografering från 995 kr (exkl. moms) för dig som är mäklare i Skåne. Planritning ingår, och du får 60 dagars fri tillgång till våra appar för inlägg och annonstext. Ingen bindning och inget krav på fortsatt samarbete. Gäller till och med 31 december.", head:"Bostadsfotografering från 995 kr", desc:"Lansering nov–dec · Ingen bindning", btn:"Ansök nu"}},
  B:{n:"2 · Bilder blir inlägg", svar:"Varför är Viewly intressant för mig som mäklare?",
     meta:{prim:"Efter fotograferingen blir dina bilder färdiga inlägg. Content Studio fyller i adress, rum och yta automatiskt, och Annonsskrivaren skriver texten. Under lanseringen får du 60 dagars fri tillgång till apparna. Ingen bindning.", head:"Bilder blir inlägg", desc:"60 dagar fria appar · Från 995 kr", btn:"Ansök nu"}},
  C:{n:"3 · Behåll din fotograf", svar:"Varför vågar jag prova Viewly?",
     meta:{prim:"Du behöver inte byta fotograf. Prova Viewly på ett objekt under lanseringen: bostadsfotografering från 995 kr, planritning ingår och 60 dagars fria appar. Ingen bindning och inget krav på mer.", head:"Behåll din fotograf. Prova oss på ett objekt.", desc:"Ingen bindning · Från 995 kr", btn:"Ansök nu"}}
};
var OFFER = {small:"Lansering t.o.m. 31 dec 2026  ·  Bas, lägenhet  ·  Pris exkl. moms"};

/* ---------- gemensamt för statiska ---------- */
function SR9(G){ return {y0:G.top + 2, y1:G.H - G.bot} }
function base(c, G, key, pos, dim, z){
  v3Fill(c, 0, 0, 100, G.H, DARKC); v3Photo(c, key, 0, 0, 100, G.H, {scale:z || 1.08, pos:pos});
  v3Fill(c, 0, 0, 100, G.H, "#0c0a0a", dim);
  v3Grad(c, 0, 0, 100, G.H*.3, [[0, "rgba(8,7,7,.6)"], [1, "rgba(8,7,7,0)"]]);
  v3Grad(c, 0, G.H*.45, 100, G.H*.55, [[0, "rgba(8,7,7,0)"], [1, "rgba(8,7,7,.7)"]]);
  v3Frame(c, 4, 4, 92, G.H - 8, WHITE, .26, 1, .5);
  var S = SR9(G); v3Text(c, "VIEWLY  ·  LANSERING", 50, S.y0 + 3, {size:2.2, weight:500, f:"sans", sp:.32, color:WHITE, align:"c", alpha:.92});
  return S;
}
function pill(c, cx, y, w, h, label, a){
  c.save(); c.globalAlpha = a == null ? 1 : a; c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 6; c.shadowOffsetY = 1.4; c.fillStyle = "#fff"; rr(c, cx - w/2, y, w, h, h/2); c.fill(); c.restore();
  v3Text(c, label, cx, y + h*.63, {size:Math.min(3.7, h*.36), weight:600, f:"sans", sp:.08, color:"#0a0a0a", align:"c", alpha:a == null ? 1 : a});
}
function sm(c, y, txt, a){ txt = txt || OFFER.small; var sz = Math.min(1.9, fz(c, txt, {size:1.9, weight:500, f:"sans", sp:.1}, 86)); v3Text(c, txt, 50, y, {size:sz, weight:500, f:"sans", sp:.1, color:"rgba(255,255,255,.72)", align:"c", alpha:a == null ? 1 : a}) }
function hero(c, G, y, l1, l2, s1, s2, shadow){
  var a = Math.min(s1, fz(c, l1, {size:s1, weight:300}, 84)), b = Math.min(s2, fz(c, l2, {size:s2, weight:300, italic:true}, 84));
  v3Text(c, l1, 50, y, {size:a, weight:300, color:WHITE, align:"c", shadow:true});
  v3Text(c, l2, 50, y + a*.62 + b*.62, {size:b, weight:300, italic:true, color:C3.cream, align:"c", shadow:true});
  return y + a*.62 + b*.62;
}
function strikeW(c, x, y, w){ c.save(); c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = .3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y - .7); c.stroke(); c.restore() }

/* ---------- 1 · från 995 kr ---------- */
function st1(c, G){
  var S = base(c, G, "rs_dusk1", [.5, .55], .34), is9 = G.is9, RH = S.y1 - S.y0;
  var yl = hero(c, G, S.y0 + RH*(is9 ? .36 : .33), "Från 995 kr.", "Din första bostadsfotografering.", is9 ? 21 : 17.4, is9 ? 6.6 : 5.6);
  var fy = yl + (is9 ? 13 : 10);
  v3Fill(c, MX, fy - 6, 84, .25, WHITE, .5);
  v3Text(c, "Planritning ingår  ·  60 dagar fria appar  ·  Ingen bindning", 50, fy, {size:2.6, weight:500, f:"sans", color:WHITE, align:"c", shadow:true});
  pill(c, 50, fy + (is9 ? 9 : 7), 62, is9 ? 11.4 : 9.8, "Hämta erbjudandet");
  sm(c, S.y1 - 1);
}
/* ---------- 2 · bilder blir inlägg ---------- */
function st2(c, G){
  var S = base(c, G, "bedroom", [.5, .55], .46), is9 = G.is9, RH = S.y1 - S.y0, T9 = A8.tplB, DO = A8.DO, ph = [A8.GRID7[0], A8.GRID7[2], A8.GRID7[5]];
  hero(c, G, S.y0 + RH*(is9 ? .15 : .14), "Bilder blir", "inlägg.", is9 ? 15 : 11.4, is9 ? 11 : 8.4);
  var wy = S.y0 + RH*(is9 ? .33 : .33), wh = RH*(is9 ? .5 : .5), x0 = 13, cw = 74;
  sCard(c, 7, wy, 86, wh, 1, 3.2, "#F5F2EF", 12);
  v3Text(c, "Storgatan 15", x0, wy + 11, {size:is9 ? 7 : 6.2, color:INK});
  sTx(c, "HELSINGBORG  ·  3 RUM  ·  74 M²", x0, wy + 16, 1, {size:2.4, weight:600, color:"#2f6a3a", sp:.14});
  sCard(c, x0 + cw - 22, wy + 6, 22, 5.4, 1, 2.7, "#dfeedd", 0); sTx(c, "LEVERERAD", x0 + cw - 11, wy + 9.7, 1, {size:2.1, weight:600, color:"#2f6a3a", align:"c", sp:.14});
  var pw = is9 ? 20.6 : 15.6, gap = (cw - 3*pw)/2, py = wy + 21;
  [0, 1, 2].forEach(function(i){ var px = x0 + i*(pw + gap); c.save(); c.shadowColor = "rgba(30,25,20,.3)"; c.shadowBlur = 6; c.shadowOffsetY = 1.6; c.fillStyle = "#000"; rr(c, px, py, pw, pw*1.25, pw*.025); c.fill(); c.restore(); T9(c, A8.KB[i], px, py, pw, 1, DO(i, ph[i], 0, 1)); sTx(c, A8.LABS[i], px, py + pw*1.25 + 4.6, 1, {size:2.4, weight:600}) });
  sTx(c, "ADRESS, RUM OCH YTA FYLLS I AUTOMATISKT", 50, py + pw*1.25 + (is9 ? 11 : 10.4), 1, {size:2.4, weight:600, color:INK, align:"c", sp:.1});
  var cy = wy + wh + (is9 ? 7 : 5);
  pill(c, 50, cy, 62, is9 ? 11 : 9.2, "Hämta erbjudandet");
  sm(c, S.y1 - 1, "60 dagar fria appar  ·  Från 995 kr  ·  Ingen bindning  ·  Pris exkl. moms");
}
/* ---------- 3 · behåll din fotograf ---------- */
function st3(c, G){
  var S = base(c, G, "rs_dining", [.5, .6], .5), is9 = G.is9, RH = S.y1 - S.y0;
  hero(c, G, S.y0 + RH*(is9 ? .2 : .19), "Behåll din fotograf.", "Prova oss på ett objekt.", is9 ? 15 : 11.6, is9 ? 8.4 : 6.8);
  var cy = S.y0 + RH*(is9 ? .42 : .43), ch = is9 ? 31 : 30;
  sCard(c, 7, cy, 86, ch, 1, 2.4, "rgba(255,255,255,.95)", 8);
  v3Text(c, "★★★★★", 50, cy + 7.6, {size:4, weight:500, f:"sans", sp:.2, color:INK, align:"c"});
  QUOTE.forEach(function(l, i){ v3Text(c, l, 50, cy + 14.4 + i*4.8, {size:is9 ? 3.6 : 3.3, weight:400, italic:true, color:INK, align:"c"}) });
  v3Text(c, "MÄKLARE I SKÅNE", 50, cy + ch - 3, {size:1.9, weight:600, f:"sans", sp:.28, color:MUT, align:"c"});
  var by = cy + ch + (is9 ? 9 : 7);
  v3Text(c, "Ingen bindning  ·  Inget krav på fortsatt samarbete", 50, by, {size:2.6, weight:500, f:"sans", color:WHITE, align:"c", shadow:true});
  pill(c, 50, by + 5, 62, is9 ? 11 : 9.2, "Hämta erbjudandet");
  sm(c, S.y1 - 1, "Bostadsfotografering från 995 kr  ·  Planritning ingår  ·  Pris exkl. moms");
}

/* ===================== VIDEO ===================== */
var fast = function(c, t, t0, tOut, l1, l2, size, cy){ var sz = Math.min(size, fz(c, l1, {size:size, weight:300}, 84), fz(c, l2, {size:size, weight:300, italic:true}, 84)); return A8.twoPartFast(c, t, t0, tOut, l1, l2, sz, cy) };
function scene(c, G, key, p, dim, pos){
  v3Fill(c, 0, 0, 100, G.H, DARKC); v3Photo(c, key, 0, 0, 100, G.H, {scale:lerp(1.05, 1.14, p), pos:pos || V3_POS[key]});
  v3Fill(c, 0, 0, 100, G.H, "#0c0a0a", dim); v3Grad(c, 0, 0, 100, G.H*.3, [[0, "rgba(8,7,7,.55)"], [1, "rgba(8,7,7,0)"]]);
  v3Frame(c, 4, 4, 92, G.H - 8, WHITE, .26, 1, .5);
}
function lab9(c, S, txt, a){ v3Text(c, txt, 50, S.y0 + 3, {size:2.2, weight:500, f:"sans", sp:.32, color:WHITE, align:"c", alpha:a == null ? .92 : a}) }
function logoEnd(c, G, u){
  var cy = G.cy, capH = 6.2, mh = capH*1.7, mw = mh*858.6/756.3, fs = capH/.7*.8, gap = capH*.8, ww = v3Measure(c, "VIEWLY", {size:fs, weight:500, f:"sans", sp:.2}) - .2*fs, tot = mw + gap + ww, fx = 50 - tot/2 - capH*.113;
  var slide = ioC(k3(u, 1.0, 1.7)), x0 = lerp(50 - mw/2, fx, slide), mx = x0 + mw/2;
  c.save(); c.translate(mx, cy); c.rotate(-1.25*(1 - oQ(k3(u, 0, .95)))); var sc = lerp(.45, 1, oBack(k3(u, 0, .85))); c.scale(sc, sc); c.translate(-mx, -cy);
  v3Mark(c, x0, cy - mh/2, mh, "#fff", C3.dotL, {reveal:ioC(k3(u, .05, .8)), dot:oBack(k3(u, .75, 1.05)), alpha:ioC(k3(u, 0, .25))}); c.restore();
  var by = cy + capH/2 + capH*.02, x = fx + mw + gap, i, str = "VIEWLY";
  for(i = 0; i < str.length; i++){ var lp = oQ(k3(u, 1.15 + i*.07, 1.15 + i*.07 + .45)); v3Text(c, str[i], x, by, {size:fs, weight:500, f:"sans", color:"#fff", p:lp, rise:capH*.5}); x += c.measureText(str[i]).width + .2*fs }
  var ta = ioC(k3(u, 2.0, 2.6)); if(ta > 0) v3Text(c, "För mäklare som vill mer.", 50, cy + 14 + (1 - ta)*1.2, {size:G.is9 ? 3.6 : 3.3, weight:500, f:"sans", sp:.03, color:"#e9eadf", align:"c", alpha:ta*.9});
}
/* slutet: erbjudandet, knappen som trycks, svart, adressen och loggan */
var END_S = 5.3, END_LOGO_AT = 3.0;
function endShort(c, G, u, key, cfg){
  cfg = cfg || {h1:"Från 995 kr", h2:"på din första fotografering.", facts:"Planritning ingår  ·  60 dagar fria appar  ·  Ingen bindning"};
  var S = SR9(G), is9 = G.is9, cx = 50, cy = G.cy + 6, w = is9 ? 66 : 58, h = is9 ? 10.4 : 9, CL = 1.35;
  if(key) scene(c, G, key, .6, .74, V3_POS[key]);
  else v3Fill(c, 0, 0, 100, G.H, "#0c0a0a", .0);
  var oa = rev(u, .0, .45)*(1 - ioC(k3(u, CL + .1, CL + .45)));
  v3Text(c, "LANSERING  ·  T.O.M. 31 DEC", 50, cy - (is9 ? 38 : 30), {size:2.2, weight:600, f:"sans", sp:.3, color:WHITE, align:"c", alpha:oa*.9, shadow:true});
  v3Text(c, cfg.h1, 50, cy - (is9 ? 24 : 19), {size:is9 ? 16 : 13.4, weight:300, color:WHITE, align:"c", alpha:oa, p:oQ(k3(u, 0, .6)), rise:2, shadow:true});
  v3Text(c, cfg.h2, 50, cy - (is9 ? 13 : 10.6), {size:is9 ? 6 : 5, weight:300, italic:true, color:C3.cream, align:"c", alpha:oa*rev(u, .2, .35), p:oQ(k3(u, .2, .8)), rise:2, shadow:true});
  v3Text(c, cfg.facts, 50, cy - 3, {size:2.4, weight:500, f:"sans", color:WHITE, align:"c", alpha:oa*rev(u, .5, .35), shadow:true});
  var press = k3(u, CL - .1, CL)*(1 - k3(u, CL + .08, CL + .26)), gone = ioC(k3(u, CL + .08, CL + .26)), ap = oQ(k3(u, .4, .9)), by = cy + 6;
  var bgA = ioC(k3(u, CL + .1, CL + .6)); v3Fill(c, 0, 0, 100, G.H, "#050505", bgA);
  if(gone < 1){
    var bw = w*(1 - .05*press), bh = h*(1 - .05*press), a = ap*(1 - gone);
    c.save(); c.translate(cx, by + h/2); c.scale(1 + .05*gone, 1 + .05*gone); c.translate(-cx, -by - h/2);
    c.save(); c.globalAlpha = a; c.shadowColor = "rgba(255,255,255," + (.18 + .08*Math.sin(u*5)) + ")"; c.shadowBlur = 7; c.shadowOffsetY = 1.2;
    var bg = c.createLinearGradient(0, by + h/2 - bh/2, 0, by + h/2 + bh/2); bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "#cfcfcf"); c.fillStyle = bg; rr(c, cx - bw/2, by + h/2 - bh/2, bw, bh, bh/2); c.fill(); c.restore();
    v3Text(c, "Hämta erbjudandet", cx, by + h/2 + h*.3*.34, {size:h*.3, weight:500, f:"sans", sp:.02, color:"#0a0a0a", align:"c", alpha:a}); c.restore();
    var cp = ioC(k3(u, CL - .85, CL - .08)), curX = lerp(106, cx + w*.21, cp), curY = lerp(G.H - (is9 ? 20 : 8), by + h*.8, cp) - Math.sin(cp*Math.PI)*4;
    v3Cursor(c, curX, curY, press, k3(u, CL - .85, CL - .6)*(1 - k3(u, CL + .3, CL + .55))); v3Tap(c, cx + w*.21, by + h*.8, k3(u, CL - .02, CL + .5));
  }
  var T1 = CL + .55, T2 = CL + 1.55, aA = ioC(k3(u, T1, T1 + .3))*(1 - ioC(k3(u, T2 - .3, T2)));
  if(aA > 0) v3Text(c, "viewly.se", 50, G.cy + 2.2, {size:is9 ? 6 : 5.4, weight:500, f:"sans", sp:.01, color:"#fff", align:"c", alpha:aA});
  if(u >= END_LOGO_AT) logoEnd(c, G, u - END_LOGO_AT);
}

/* ---------- Video 1 · från 995 kr, cirka 12,5 s ---------- */
var V1 = [0, 2.4, 4.9, 7.3];
function v1(c, G, t){
  var S = SR9(G), is9 = G.is9, RH = S.y1 - S.y0;
  if(t < V1[1]){
    scene(c, G, "rs_dusk1", k3(t, 0, 2.4), .36, [.5, .55]); lab9(c, S, "VIEWLY  ·  LANSERING");
    fast(c, t, .0, 99, "Från 995 kr.", "Bostadsfoto.", is9 ? 20 : 16.4, S.y0 + RH*.44);
    v3Text(c, "FÖR MÄKLARE I SKÅNE", 50, S.y0 + RH*.64, {size:2.4, weight:600, f:"sans", sp:.28, color:WHITE, align:"c", alpha:rev(t, 1.3, .3), shadow:true});
    return;
  }
  if(t < V1[2]){ var u = t - V1[1]; scene(c, G, "rs_chair", k3(u, 0, 2.5), .5, [.5, .5]); lab9(c, S, "VIEWLY  ·  LANSERING"); fast(c, u, .05, 99, "Planritning ingår.", "60 dagar fria appar.", is9 ? 12 : 10, S.y0 + RH*.44); return }
  if(t < V1[3]){ var u2 = t - V1[2]; scene(c, G, "rs_dining", k3(u2, 0, 2.4), .52, [.5, .6]); lab9(c, S, "VIEWLY  ·  LANSERING"); fast(c, u2, .05, 99, "Ingen bindning.", "Prova på ett objekt.", is9 ? 12 : 10, S.y0 + RH*.44); return }
  endShort(c, G, t - V1[3], "rs_dusk2", {h1:"Från 995 kr", h2:"på din första fotografering.", facts:"Planritning ingår  ·  60 dagar fria appar  ·  Ingen bindning"});
}
function snd1(H){ H.s("shutter", .05, .4); [V1[1], V1[2]].forEach(function(s){ H.s("shutter", s, .5) }); H.click(V1[3] + 1.35, .38) }

/* ---------- Video 2 · bilder blir inlägg, cirka 19 s (flödet från annons 6) ---------- */
var V2W = A8.O8 + A8.WEND8 + .6;
function v2(c, G, t){
  A8.adInlagg(c, G, Math.min(t, V2W), true);
  if(t >= V2W) endShort(c, G, t - V2W, null, {h1:"60 dagar", h2:"fria appar.", facts:"Content Studio och Annonsskrivare  ·  Från 995 kr  ·  Ingen bindning"});
}
function snd2(H){ var O = A8.O8; for(var q = 0; q < 6; q++) H.s("shutter", q*.14, .26); H.s("tick2", .95, .07); H.s("shutter", 1.0, .3);
  H.click(1.0 + O, .18); H.click(2.5 + O, .26); H.click(3.9 + O, .18); H.click(5.1 + O, .26); H.s("tick2", 8.8 + O, .08); H.click(V2W + 1.35, .38) }

/* ---------- Video 3 · behåll din fotograf, cirka 13 s ---------- */
var V3 = [0, 2.3, 4.7, 8.0];
function v3q(c, G, S, u, a){
  var is9 = G.is9, cy = S.y0 + (S.y1 - S.y0)*.36, ch = is9 ? 32 : 26;
  sCard(c, 7, cy, 86, ch, a*.95, 2.4, "rgba(255,255,255,.95)", 8);
  v3Text(c, "★★★★★", 50, cy + 7.8, {size:4.2, weight:500, f:"sans", sp:.2, color:INK, align:"c", alpha:a*rev(u, .3, .3)});
  QUOTE.forEach(function(l, i){ var ts = .5 + i*.55; v3Text(c, l, 50, cy + 14.6 + i*5, {size:is9 ? 3.8 : 3.3, weight:400, italic:true, color:INK, align:"c", alpha:a*(u >= ts ? 1 : 0), p:clamp(k3(u, ts, ts + .5), 0, 1)}) });
  v3Text(c, "MÄKLARE I SKÅNE", 50, cy + ch - 3.6, {size:1.9, weight:600, f:"sans", sp:.28, color:MUT, align:"c", alpha:a*rev(u, 2.0, .4)});
}
function v3f(c, G, t){
  var S = SR9(G), is9 = G.is9, RH = S.y1 - S.y0;
  if(t < V3[1]){ scene(c, G, "rs_chair", k3(t, 0, 2.3), .4, [.5, .5]); lab9(c, S, "VIEWLY  ·  LANSERING"); fast(c, t, .0, 99, "Har du redan", "en fotograf?", is9 ? 17 : 14, S.y0 + RH*.44); return }
  if(t < V3[2]){ var u = t - V3[1]; scene(c, G, "rs_dining", k3(u, 0, 2.4), .5, [.5, .6]); lab9(c, S, "VIEWLY  ·  LANSERING"); fast(c, u, .05, 99, "Behåll din fotograf.", "Prova oss på ett objekt.", is9 ? 13 : 10.6, S.y0 + RH*.44); return }
  if(t < V3[3]){ var u2 = t - V3[2]; scene(c, G, "bedroom", k3(u2, 0, 3.3), .6, [.5, .55]); lab9(c, S, "VIEWLY  ·  LANSERING"); v3q(c, G, S, u2, rev(u2, .1, .35)); fast(c, u2, 2.4, 99, "Ingen bindning.", "Inget krav på mer.", is9 ? 9 : 7.6, S.y0 + RH*.76); return }
  endShort(c, G, t - V3[3], "rs_dusk2", {h1:"Från 995 kr", h2:"på din första fotografering.", facts:"Planritning ingår  ·  60 dagar fria appar  ·  Ingen bindning"});
}
function snd3(H){ H.s("shutter", .05, .4); [V3[1], V3[2]].forEach(function(s){ H.s("shutter", s, .5) }); [V3[2] + .5, V3[2] + 1.05, V3[2] + 1.6].forEach(function(q){ H.s("tick1", q, .05) }); H.click(V3[3] + 1.35, .38) }

/* ---------- registrera i systemet ---------- */
window.V3_ADS9S = []; window.V3_ADS9 = [];
function regS(id, n, fn){
  V3_COMPS[id] = {n:n, d:"", group:"ads9", id:id, v:{id:id}, dur:1, thumb:0, L:1, stat:true, draw:function(c, G, t){ fn(c, G) }, mix:function(){}, loadAudio:function(){ return Promise.resolve() }};
  V3_ADS9S.push(id);
}
regS("l_s1", "1 · Från 995 kr", st1); regS("l_s2", "2 · Bilder blir inlägg", st2); regS("l_s3", "3 · Behåll din fotograf", st3);
function regV(id, n, d, dur, logoAt, fn, thumb, sched){
  var comp = {n:n, d:d, group:"ads9", id:id, v:{id:id}, dur:dur, thumb:thumb, L:logoAt - .53, logo:true, draw:function(c, G, t){ fn(c, G, t) }};
  comp.mix = K.makeMix(sched); comp.loadAudio = function(){ return v3SfxLoad() };
  V3_COMPS[id] = comp; V3_ADS9.push(id);
}
regV("l_v1", "1 · Från 995 kr", "Priset, planritning och appar, ingen bindning.", V1[3] + END_S, V1[3] + END_LOGO_AT, v1, .9, snd1);
regV("l_v2", "2 · Bilder blir inlägg", "En bild blir ett inlägg, uppgifterna fylls i automatiskt.", V2W + END_S, V2W + END_LOGO_AT, v2, 2.2, snd2);
regV("l_v3", "3 · Behåll din fotograf", "Prova oss på ett objekt, med kundcitat.", V3[3] + END_S, V3[3] + END_LOGO_AT, v3f, .9, snd3);

/* ---------- storyboard ---------- */
var MUSIC = "Ingen musik i filen, bara kameraljud, klick och loggljud. Allt som betyder något står som text, så det fungerar utan ljud.";
var SB = {
  l_v1:[
    [0, V1[1], "Hook", "Från 995 kr.\nBostadsfoto.\nFÖR MÄKLARE I SKÅNE", "Helbild, texten syns i första bildrutan, långsam inzoomning.", "Kameraljud."],
    [V1[1], V1[2], "Det som ingår", "Planritning ingår.\n60 dagar fria appar.", "Hårt klipp, stor serif i två delar.", "Kameraljud."],
    [V1[2], V1[3], "Ingen risk", "Ingen bindning.\nProva på ett objekt.", "Hårt klipp, samma rytm.", "Kameraljud."],
    [V1[3], V1[3] + END_S, "Avslut", "Från 995 kr på din första fotografering.\nPlanritning ingår · 60 dagar fria appar · Ingen bindning.\nHämta erbjudandet · viewly.se", "Knappen trycks, bilden blir svart, adressen och loggan animeras in.", "Musklick och loggljud."]],
  l_v2:[
    [0, 3.2, "Hook", "En bild blir\nett inlägg.\nFOTOGRAFERAS → LEVERERAD", "Sex bilder poppar in med varsitt kameraljud, en slår om till ett färdigt inlägg.", "Sex kameraljud, ett ping."],
    [3.2, 6.7, "Leverans och bild", "Storgatan 15 · Helsingborg · 3 rum · 74 m² · LEVERERAD\nVÄLJ EN BILD UR LEVERANSEN", "Mjuk övergång till systemfönstret. En bild väljs.", "Musklick."],
    [6.7, 9.2, "Välj mall", "VÄLJ EN MALL\nTill salu · Visning · Såld", "Mallen väljs, de andra tonar bort och den växer.", "Musklick."],
    [9.2, 12.3, "Fylls i automatiskt", "MALLEN FYLLS I\nADRESS, RUM OCH YTA FYLLS I AUTOMATISKT\nDirekt från leveransen. Inget att skriva.", "Adress, ort, rum och yta lyfts ur leveransen och landar i mallens fält.", "Lågt ping."],
    [12.3, V2W, "Klart", "INLÄGGET ÄR KLART\n✓ Adress, rum och yta ifyllda", "Fönstret tonar ut.", "—"],
    [V2W, V2W + END_S, "Avslut", "60 dagar fria appar.\nContent Studio och Annonsskrivare · Från 995 kr · Ingen bindning.\nHämta erbjudandet · viewly.se", "Knappen trycks, bilden blir svart, adressen och loggan animeras in.", "Musklick och loggljud."]],
  l_v3:[
    [0, V3[1], "Hook: frågan", "Har du redan\nen fotograf?", "Helbild, frågan syns direkt.", "Kameraljud."],
    [V3[1], V3[2], "Svaret", "Behåll din fotograf.\nProva oss på ett objekt.", "Hårt klipp.", "Kameraljud."],
    [V3[2], V3[3], "Kundcitat", "★★★★★\n”Snabb och smidig hantering genom hela processen, från bokning till leverans av färdigt material.”\nMÄKLARE I SKÅNE\nIngen bindning. Inget krav på mer.", "Hårt klipp. Citatet skrivs fram i ett vitt kort.", "Kameraljud, tre låga tick."],
    [V3[3], V3[3] + END_S, "Avslut", "Från 995 kr på din första fotografering.\nPlanritning ingår · 60 dagar fria appar · Ingen bindning.\nHämta erbjudandet · viewly.se", "Knappen trycks, bilden blir svart, adressen och loggan animeras in.", "Musklick och loggljud."]]
};
var VMETA = {
  l_v1:{prim:AD9.A.meta.prim, head:AD9.A.meta.head, desc:AD9.A.meta.desc, btn:AD9.A.meta.btn},
  l_v2:{prim:AD9.B.meta.prim, head:AD9.B.meta.head, desc:AD9.B.meta.desc, btn:AD9.B.meta.btn},
  l_v3:{prim:AD9.C.meta.prim, head:AD9.C.meta.head, desc:AD9.C.meta.desc, btn:AD9.C.meta.btn}
};

/* ---------- sidan ---------- */
function esc9(x){ return String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") }
function tf(x){ return x.toFixed(1).replace(".", ",") }
function metaBlock(m){ return '<div class="l9meta"><b>Primärtext</b><p>' + esc9(m.prim) + '</p><b>Rubrik</b><p>' + esc9(m.head) + '</p><b>Beskrivning</b><p>' + esc9(m.desc) + '</p><b>Knapp · länk</b><p>' + esc9(m.btn) + ' · viewly.se/maklare</p></div>' }
function staticCards(){
  return V3_ADS9S.map(function(id, i){
    var k = "ABC"[i], d = AD9[k];
    return '<div class="l9card"><div class="l9pair">'
      + '<div class="l9fmt"><div class="l9th">' + v3Canvas("comp:" + id + ":45:0", 520) + '</div><div class="l9fm"><span class="mono">4:5 · 1080 × 1350</span><button type="button" class="a3mini" data-a3="png" data-v="comp:' + id + ':45:0">PNG</button></div></div>'
      + '<div class="l9fmt"><div class="l9th">' + v3Canvas("comp:" + id + ":916:0", 420) + '</div><div class="l9fm"><span class="mono">9:16 · 1080 × 1920</span><button type="button" class="a3mini" data-a3="png" data-v="comp:' + id + ':916:0">PNG</button></div></div>'
      + '</div><div class="l9cap"><h4>' + esc9(d.n) + '</h4><p class="l9q">' + esc9(d.svar) + '</p><details><summary>Text till Meta</summary>' + metaBlock(d.meta) + '</details></div></div>';
  }).join("");
}
function filmstrip(id){
  var comp = V3_COMPS[id], rows = SB[id];
  return '<div class="l9film">' + rows.map(function(r){
    var mid = Math.min(comp.dur - .1, r[0] + Math.min(1.6, (r[1] - r[0])*.7));
    return '<div class="l9sc"><div class="l9th">' + v3Canvas("comp:" + id + ":916:" + mid.toFixed(2), 230) + '</div><div class="l9scm"><span class="mono">' + tf(r[0]) + '–' + tf(r[1]) + ' s</span><b>' + esc9(r[2]) + '</b><p>' + esc9(r[3]).replace(/\n/g, "<br>") + '</p><i>' + esc9(r[4]) + '</i><i>' + esc9(r[5]) + '</i></div></div>';
  }).join("") + '</div><p class="l9mus">' + esc9(MUSIC) + '</p>';
}
var L9CSS = '<style>.l9card{padding:30px 0;border-top:1px solid rgba(28,28,30,.12)}.l9pair{display:grid;grid-template-columns:1.25fr 1fr;gap:22px;align-items:start;max-width:980px}.l9th canvas{width:100%;height:auto;display:block;border-radius:8px;box-shadow:0 3px 18px rgba(30,25,20,.2)}.l9fm{display:flex;justify-content:space-between;align-items:center;margin-top:9px;font-size:11px;color:#6f6a65}.l9cap{max-width:980px;margin-top:14px}.l9cap h4{font:400 26px/1.15 "Cormorant Garamond",Georgia,serif;margin:0 0 3px}.l9q{font-size:13px;color:#6f6a65;margin:0 0 10px;font-style:italic}.l9cap summary{cursor:pointer;font:600 10px/1 Montserrat,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#6E7266;padding:6px 0}.l9meta b{display:block;font:600 10px/1 Montserrat,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#6E7266;margin:12px 0 4px}.l9meta p{margin:0;font-size:13px;line-height:1.5;max-width:720px}.l9film{display:flex;gap:16px;overflow-x:auto;padding:6px 2px 14px}.l9sc{flex:0 0 230px}.l9sc .l9th canvas{box-shadow:0 2px 12px rgba(30,25,20,.2);border-radius:6px}.l9scm{margin-top:10px;font-size:12.5px;line-height:1.45}.l9scm .mono{display:block;font-size:11px;color:#6E7266;margin-bottom:3px}.l9scm b{display:block;font-weight:600;margin-bottom:4px}.l9scm p{margin:0 0 6px}.l9scm i{display:block;font-style:normal;font-size:11.5px;color:#6f6a65}.l9mus{margin:6px 0 0;font-size:12.5px;color:#6f6a65;max-width:760px}@media (max-width:860px){.l9pair{grid-template-columns:1fr 1fr}}</style>';
window.secAds9 = function(){
  if(V3_ADS9.indexOf(V3S.comp) < 0){ V3S.comp = V3_ADS9[0]; V3S.t = V3_COMPS[V3S.comp].thumb; V3S.playing = false; v3StopSound() }
  if(V3S.fmt !== "916" && V3S.fmt !== "45") V3S.fmt = "916";
  setTimeout(v3Mount, 0);
  var comp = V3_COMPS[V3S.comp], fn = V3S.fmt === "916" ? "9:16 · 1080 × 1920" : "4:5 · 1080 × 1350";
  return L9CSS + '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 17 · bygge 53</div><h2>Lansering</h2>'
    + '<p>Tre annonser, en idé var: priset, förvandlingen och risken. En statisk bild och en video per idé. Förslag, inget publicerat.</p></div>'
    + '<h3 class="a3sub">Videoannonser</h3><div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w45") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play" aria-label="Spela">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '" aria-label="Tid"></div><span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Video</div><div class="a3segs col">' + V3_ADS9.map(function(id){ return v3Seg("comp", id, V3_COMPS[id].n + " · " + V3_COMPS[id].dur.toFixed(0) + " s", V3S.comp === id) }).join("") + '</div>'
    + '<div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Reel · 9:16", V3S.fmt === "916") + v3Seg("fmt", "45", "Flöde · 4:5", V3S.fmt === "45") + '</div>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + esc9(comp.n) + " · " + fn + ' · med ljud</button></div></div></div>'
    + '<h3 class="a3sub">Storyboard · ' + esc9(comp.n) + '</h3>' + filmstrip(V3S.comp)
    + '<details class="l9cap"><summary>Text till Meta</summary>' + metaBlock(VMETA[V3S.comp]) + '</details>'
    + '<h3 class="a3sub">Statiska annonser</h3>' + staticCards() + '</div>';
};
window.A9K = {AD9:AD9, OFFER:OFFER};
})();
