/* =====================================================================
   SIDA 17 — LANSERING (Ads): lanseringserbjudandet i november och december 2026
   Fyra statiska annonser (4:5 och 9:16) och tre videoannonser, i samma språk som
   sida 16: mörk helbild, stor serif i två delar, hårda klipp med kameraljud,
   systemfönstret med vita kort, och loggan som sista bild.
   Erbjudandet (ändras inte utan godkännande): 50 % på Bas, Plus och Premium,
   60 dagars fri tillgång till appar, ingen bindningstid, planritning ingår.
   ===================================================================== */
(function(){
var K = window.A7K, A8 = window.A8K, rr = K.rr, MX = 8;
var INK = "#1C1C1E", MUT = "#5f5a55", OLI = "#6E7266", WHITE = "#fff", DARKC = "#070606", GRN = "#2f3a2d";
var rev = A8.rev, clamp = A8.clamp, fz = A8.fz, sCard = A8.sCard, sPh = A8.sPh, sTx = A8.sTx;

var OFFER = {bas:"1 000 kr", basOrd:"2 000 kr", plus:"1 750 kr", plusOrd:"3 500 kr", prem:"3 000 kr", premOrd:"6 000 kr", small:"Lanseringserbjudande nov–dec 2026  ·  Priser exkl. moms"};
var AD9 = {
  A:{n:"A · Lanseringserbjudandet", svar:"Vad erbjuder Viewly, och varför just nu?",
     meta:{prim:"Lansering i november och december: 50 % rabatt på Bas, Plus och Premium när du bokar fotografering hos Viewly. Planritning ingår, och du får 60 dagars fri tillgång till våra appar för inlägg och annonstext. Ingen bindningstid, och du behöver inte byta fotograf. Prova på ett objekt.", head:"Halva priset på din första fotografering", desc:"Lansering nov–dec 2026. Priser exkl. moms.", btn:"Boka nu"}},
  B:{n:"B · Fotografering och appar", svar:"Varför är Viewly intressant för mig som mäklare?",
     meta:{prim:"Efter fotograferingen använder du dina levererade bilder direkt: Content Studio gör inlägg av dem, och Annonsskrivaren skriver annonstexten. Under lanseringen får du 60 dagars fri tillgång till apparna och 50 % på fotograferingen. Ingen bindningstid.", head:"Foto in. Inlägg ut.", desc:"60 dagar fria appar · 50 % på fotograferingen", btn:"Läs mer"}},
  C:{n:"C · Viewlys helhet", svar:"Vad erbjuder Viewly, mer än bilder?",
     meta:{prim:"Bostadsfoto i tre paket, planritning som ingår, Content Studio för inlägg och Annonsskrivare för annonstext. Allt av samma leverans, i kontorets utseende. Under lanseringen: halva priset på fotograferingen och 60 dagar fria appar.", head:"Mer än en fotograf", desc:"Foto, planritning, Content Studio och Annonsskrivare", btn:"Boka nu"}},
  D:{n:"D · Sista chansen", svar:"Varför ska jag prova Viewly just nu?",
     meta:{prim:"Lanseringserbjudandet gäller till och med den 31 december: 50 % rabatt på Bas, Plus och Premium, 60 dagars fria appar och ingen bindningstid. Boka fotografering på ett objekt och se själv.", head:"Sista chansen: halva priset", desc:"Gäller till 31 dec · Ingen bindningstid", btn:"Boka nu"}}
};

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

/* ---------- A · lanseringserbjudandet ---------- */
function stA(c, G){
  var S = base(c, G, "rs_dusk1", [.5, .55], .34), is9 = G.is9, RH = S.y1 - S.y0;
  var yl = hero(c, G, S.y0 + RH*(is9 ? .3 : .27), "Halva priset.", "på din första fotografering.", is9 ? 21 : 17.4, is9 ? 7.4 : 6.2);
  var ry = S.y0 + RH*(is9 ? .52 : .5);
  v3Fill(c, MX, ry, 84, .25, WHITE, .5);
  [["BAS", OFFER.bas, OFFER.basOrd], ["PLUS", OFFER.plus, OFFER.plusOrd], ["PREMIUM", OFFER.prem, OFFER.premOrd]].forEach(function(r, i){
    var cx = 20 + i*30, sz = is9 ? 5.6 : 5;
    v3Text(c, r[0], cx, ry + 6.4, {size:2.1, weight:600, f:"sans", sp:.28, color:"rgba(255,255,255,.8)", align:"c"});
    v3Text(c, r[1], cx, ry + 6.4 + sz*1.05 + 1, {size:sz, weight:300, f:"sans", color:WHITE, align:"c", shadow:true});
    var ow = v3Measure(c, r[2], {size:2.5, weight:500, f:"sans"});
    v3Text(c, r[2], cx, ry + 6.4 + sz*1.05 + 6.4, {size:2.5, weight:500, f:"sans", color:"rgba(255,255,255,.68)", align:"c"}); strikeW(c, cx - ow/2 - .3, ry + 6.4 + sz*1.05 + 5.6, ow + .6);
  });
  var fy = ry + (is9 ? 31 : 26);
  v3Fill(c, MX, fy - 5, 84, .25, WHITE, .5);
  v3Text(c, "Planritning ingår  ·  60 dagar fria appar  ·  Ingen bindningstid", 50, fy, {size:2.5, weight:500, f:"sans", color:WHITE, align:"c", shadow:true});
  pill(c, 50, fy + (is9 ? 9 : 7), 58, is9 ? 11 : 9.6, "Boka fotografering");
  sm(c, S.y1 - 1);
}

/* ---------- B · foto in, inlägg ut ---------- */
function stB(c, G){
  var S = base(c, G, "bedroom", [.5, .55], .46), is9 = G.is9, RH = S.y1 - S.y0, T9 = A8.tplB, DO = A8.DO, ph = [A8.GRID7[0], A8.GRID7[2], A8.GRID7[5]];
  hero(c, G, S.y0 + RH*(is9 ? .15 : .15), "Foto in.", "Inlägg ut.", is9 ? 14 : 11.4, is9 ? 8.6 : 7);
  var wy = S.y0 + RH*(is9 ? .33 : .31), wh = RH*(is9 ? .52 : .52), x0 = 13, cw = 74;
  sCard(c, 7, wy, 86, wh, 1, 3.2, "#F5F2EF", 12);
  v3Text(c, "Storgatan 15", x0, wy + 11, {size:is9 ? 7 : 6.2, color:INK});
  sTx(c, "HELSINGBORG  ·  3 RUM  ·  74 M²", x0, wy + 16, 1, {size:2.4, weight:600, color:"#2f6a3a", sp:.14});
  sCard(c, x0 + cw - 22, wy + 6, 22, 5.4, 1, 2.7, "#dfeedd", 0); sTx(c, "LEVERERAD", x0 + cw - 11, wy + 9.7, 1, {size:2.1, weight:600, color:"#2f6a3a", align:"c", sp:.14});
  var pw = is9 ? 20.6 : 16.2, gap = (cw - 3*pw)/2, py = wy + 21;
  [0, 1, 2].forEach(function(i){ var px = x0 + i*(pw + gap); c.save(); c.shadowColor = "rgba(30,25,20,.3)"; c.shadowBlur = 6; c.shadowOffsetY = 1.6; c.fillStyle = "#000"; rr(c, px, py, pw, pw*1.25, pw*.025); c.fill(); c.restore(); T9(c, A8.KB[i], px, py, pw, 1, DO(i, ph[i], 0, 1)); sTx(c, A8.LABS[i], px, py + pw*1.25 + 4.6, 1, {size:2.4, weight:600}) });
  sTx(c, "MALLEN FYLLS I AUTOMATISKT", 50, py + pw*1.25 + (is9 ? 11 : 10.4), 1, {size:2.6, weight:600, color:INK, align:"c", sp:.14});
  var cy = wy + wh + (is9 ? 7 : 5);
  pill(c, 50, cy, 50, is9 ? 11 : 9.2, "Prova Viewly");
  sm(c, S.y1 - 1, "60 dagar fria appar  ·  50 % på fotograferingen  ·  Priser exkl. moms  ·  Nov–dec 2026");
}

/* ---------- C · helheten ---------- */
function stC(c, G){
  var S = base(c, G, "rs_chair", [.5, .5], .5), is9 = G.is9, RH = S.y1 - S.y0;
  hero(c, G, S.y0 + RH*(is9 ? .2 : .19), "Mer än en fotograf.", "En fotopartner för hela flödet.", is9 ? 15 : 11.6, is9 ? 5.8 : 4.8);
  var rows = [["01", "Bostadsfoto", "Tre paket"], ["02", "Planritning", "Ingår vid fotografering"], ["03", "Content Studio", "Inlägg och Reels"], ["04", "Annonsskrivare", "Annonstext från leveransen"]], ry = S.y0 + RH*(is9 ? .4 : .38), rh = RH*(is9 ? .105 : .1);
  rows.forEach(function(r, i){
    var y0 = ry + i*rh;
    v3Fill(c, MX, y0, 84, .25, WHITE, .5);
    v3Text(c, r[0], MX, y0 + rh*.62, {size:2.3, weight:600, f:"sans", sp:.1, color:"rgba(255,255,255,.75)"});
    v3Text(c, r[1], MX + 9, y0 + rh*.68, {size:is9 ? 6.4 : 5.2, weight:300, color:WHITE, shadow:true});
    v3Text(c, r[2], 100 - MX, y0 + rh*.6, {size:2.5, weight:500, f:"sans", color:"rgba(255,255,255,.85)", align:"r", shadow:true});
  });
  v3Fill(c, MX, ry + 4*rh, 84, .25, WHITE, .5);
  var cy = ry + 4*rh + (is9 ? 8 : 6);
  pill(c, 50, cy, 58, is9 ? 11 : 9.2, "Boka fotografering");
  sm(c, S.y1 - 1, "Halva priset i november och december  ·  60 dagar fria appar  ·  Priser exkl. moms");
}

/* ---------- D · sista chansen ---------- */
function stD(c, G){
  var S = base(c, G, "rs_dusk2", [.45, .5], .4), is9 = G.is9, RH = S.y1 - S.y0;
  v3Text(c, "SISTA CHANSEN", 50, S.y0 + RH*.15, {size:2.6, weight:600, f:"sans", sp:.38, color:WHITE, align:"c", shadow:true});
  var yl = hero(c, G, S.y0 + RH*(is9 ? .3 : .29), "Halva priset", "slutar 31 december.", is9 ? 19 : 15.4, is9 ? 8.4 : 7);
  var sy = S.y0 + RH*(is9 ? .52 : .5);
  [["50 %", "på Bas, Plus och Premium"], ["60", "dagar fria appar"]].forEach(function(s, i){
    var x = MX + i*44;
    v3Fill(c, x, sy, 40, .25, WHITE, .5);
    v3Text(c, s[0], x, sy + (is9 ? 13 : 11), {size:is9 ? 12 : 9.8, weight:300, f:"sans", color:WHITE, shadow:true});
    v3Text(c, s[1], x, sy + (is9 ? 19 : 16.4), {size:2.6, weight:500, f:"sans", color:"rgba(255,255,255,.85)"});
  });
  v3Text(c, "Ingen bindningstid  ·  Planritning ingår", 50, sy + (is9 ? 31 : 26), {size:2.6, weight:500, f:"sans", color:WHITE, align:"c", shadow:true});
  pill(c, 50, sy + (is9 ? 38 : 31), 62, is9 ? 11 : 9.6, "Boka innan 31 december");
  sm(c, S.y1 - 1);
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
function endShort(c, G, u, key){
  var S = SR9(G), is9 = G.is9, cx = 50, cy = G.cy + 6, w = is9 ? 66 : 58, h = is9 ? 10.4 : 9, CL = 1.35;
  if(key) scene(c, G, key, .6, .74, V3_POS[key]);
  else v3Fill(c, 0, 0, 100, G.H, "#0c0a0a", .0);
  var oa = rev(u, .0, .45)*(1 - ioC(k3(u, CL + .1, CL + .45)));
  v3Text(c, "LANSERING  ·  NOV–DEC 2026", 50, cy - (is9 ? 38 : 30), {size:2.2, weight:600, f:"sans", sp:.3, color:WHITE, align:"c", alpha:oa*.9, shadow:true});
  v3Text(c, "Halva priset", 50, cy - (is9 ? 24 : 19), {size:is9 ? 16 : 13.4, weight:300, color:WHITE, align:"c", alpha:oa, p:oQ(k3(u, 0, .6)), rise:2, shadow:true});
  v3Text(c, "på din första fotografering.", 50, cy - (is9 ? 13 : 10.6), {size:is9 ? 6 : 5, weight:300, italic:true, color:C3.cream, align:"c", alpha:oa*rev(u, .2, .35), p:oQ(k3(u, .2, .8)), rise:2, shadow:true});
  v3Text(c, "Planritning ingår  ·  60 dagar fria appar  ·  Ingen bindningstid", 50, cy - 3, {size:2.4, weight:500, f:"sans", color:WHITE, align:"c", alpha:oa*rev(u, .5, .35), shadow:true});
  var press = k3(u, CL - .1, CL)*(1 - k3(u, CL + .08, CL + .26)), gone = ioC(k3(u, CL + .08, CL + .26)), ap = oQ(k3(u, .4, .9)), by = cy + 6;
  var bgA = ioC(k3(u, CL + .1, CL + .6)); v3Fill(c, 0, 0, 100, G.H, "#050505", bgA);
  if(gone < 1){
    var bw = w*(1 - .05*press), bh = h*(1 - .05*press), a = ap*(1 - gone);
    c.save(); c.translate(cx, by + h/2); c.scale(1 + .05*gone, 1 + .05*gone); c.translate(-cx, -by - h/2);
    c.save(); c.globalAlpha = a; c.shadowColor = "rgba(255,255,255," + (.18 + .08*Math.sin(u*5)) + ")"; c.shadowBlur = 7; c.shadowOffsetY = 1.2;
    var bg = c.createLinearGradient(0, by + h/2 - bh/2, 0, by + h/2 + bh/2); bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "#cfcfcf"); c.fillStyle = bg; rr(c, cx - bw/2, by + h/2 - bh/2, bw, bh, bh/2); c.fill(); c.restore();
    v3Text(c, "Boka fotografering", cx, by + h/2 + h*.3*.34, {size:h*.3, weight:500, f:"sans", sp:.02, color:"#0a0a0a", align:"c", alpha:a}); c.restore();
    var cp = ioC(k3(u, CL - .85, CL - .08)), curX = lerp(106, cx + w*.21, cp), curY = lerp(G.H - (is9 ? 20 : 8), by + h*.8, cp) - Math.sin(cp*Math.PI)*4;
    v3Cursor(c, curX, curY, press, k3(u, CL - .85, CL - .6)*(1 - k3(u, CL + .3, CL + .55))); v3Tap(c, cx + w*.21, by + h*.8, k3(u, CL - .02, CL + .5));
  }
  var T1 = CL + .55, T2 = CL + 1.55, aA = ioC(k3(u, T1, T1 + .3))*(1 - ioC(k3(u, T2 - .3, T2)));
  if(aA > 0) v3Text(c, "viewly.se/maklare", 50, G.cy + 2.2, {size:is9 ? 6 : 5.4, weight:500, f:"sans", sp:.01, color:"#fff", align:"c", alpha:aA});
  if(u >= END_LOGO_AT) logoEnd(c, G, u - END_LOGO_AT);
}

/* ---------- Video A · Lanseringen, cirka 14 s ---------- */
var VA = [0, 2.3, 5.1, 7.5, 9.4];
function vA(c, G, t){
  var S = SR9(G), is9 = G.is9, RH = S.y1 - S.y0, i;
  if(t < VA[1]){
    scene(c, G, "rs_dusk1", k3(t, 0, 2.3), .36, [.5, .55]); lab9(c, S, "VIEWLY  ·  LANSERING");
    fast(c, t, .0, 99, "Halva priset.", "på fotografering.", is9 ? 19 : 15.6, S.y0 + RH*.44);
    v3Text(c, "50 % PÅ BAS, PLUS OCH PREMIUM", 50, S.y0 + RH*.64, {size:2.4, weight:600, f:"sans", sp:.26, color:WHITE, align:"c", alpha:rev(t, 1.3, .3), shadow:true});
    return;
  }
  if(t < VA[2]){
    var u = t - VA[1];
    scene(c, G, "bedroom", k3(u, 0, 2.8), .64, [.5, .55]); lab9(c, S, "VIEWLY  ·  LANSERING");
    fast(c, u, .05, 99, "50 % på alla", "tre paket.", is9 ? 10.4 : 8.6, S.y0 + RH*.2);
    var wy = S.y0 + RH*(is9 ? .36 : .38), wh = RH*(is9 ? .5 : .52), x0 = 13, cw = 74, a = rev(u, .3, .4);
    sCard(c, 7, wy, 86, wh, a, 3.2, "#F5F2EF", 12);
    sTx(c, "LANSERINGSPRIS  ·  LÄGENHET  ·  EXKL. MOMS", x0, wy + 8, a, {size:2.1, weight:600, color:MUT, sp:.2});
    var rows = [["Bas", OFFER.bas, OFFER.basOrd], ["Plus", OFFER.plus, OFFER.plusOrd], ["Premium", OFFER.prem, OFFER.premOrd]], rh = (wh - 14)/3;
    rows.forEach(function(r, k){
      var t0 = .5 + k*.3, ra = rev(u, t0, .3), y0 = wy + 12 + k*rh;
      sCard(c, x0 - 2, y0, cw + 4, rh - 2.4, ra, 1.8, WHITE, 2);
      v3Text(c, r[0], x0 + 2, y0 + (rh - 2.4)*.64, {size:is9 ? 5.6 : 5, weight:400, color:INK, alpha:ra});
      var pw = v3Measure(c, r[1], {size:is9 ? 6.6 : 5.6, weight:300, f:"sans"}); v3Text(c, r[1], x0 + cw - 2, y0 + (rh - 2.4)*.66, {size:is9 ? 6.6 : 5.6, weight:300, f:"sans", color:INK, align:"r", alpha:ra});
      var ow = v3Measure(c, r[2], {size:2.7, weight:500, f:"sans"}), ox = x0 + cw - 2 - pw - 5 - ow; v3Text(c, r[2], ox, y0 + (rh - 2.4)*.66, {size:2.7, weight:500, f:"sans", color:MUT, alpha:ra});
      var sp = k3(u, 1.3 + k*.15, 1.7 + k*.15); if(sp > 0){ c.save(); c.globalAlpha = ra; c.strokeStyle = MUT; c.lineWidth = .3; c.beginPath(); c.moveTo(ox - .5, y0 + (rh - 2.4)*.66 - .9); c.lineTo(ox - .5 + (ow + 1)*sp, y0 + (rh - 2.4)*.66 - 1.5); c.stroke(); c.restore() }
    });
    return;
  }
  if(t < VA[3]){
    var u2 = t - VA[2];
    scene(c, G, "rs_chair", k3(u2, 0, 2.4), .5, [.5, .5]); lab9(c, S, "VIEWLY  ·  LANSERING");
    fast(c, u2, .05, 99, "Planritning ingår.", "60 dagar fria appar.", is9 ? 12 : 10, S.y0 + RH*.44);
    return;
  }
  if(t < VA[4]){
    var u3 = t - VA[3];
    scene(c, G, "rs_dining", k3(u3, 0, 1.9), .52, [.5, .6]); lab9(c, S, "VIEWLY  ·  LANSERING");
    fast(c, u3, .05, 99, "Ingen bindningstid.", "Prova på ett objekt.", is9 ? 12 : 10, S.y0 + RH*.44);
    return;
  }
  endShort(c, G, t - VA[4], "rs_dusk2");
}
function sndA(H){ H.s("shutter", .05, .4); [VA[1], VA[2], VA[3]].forEach(function(s){ H.s("shutter", s, .5) }); [.5, .8, 1.1].forEach(function(q){ H.s("tick1", VA[1] + q, .05) }); H.click(VA[4] + 1.35, .38) }

/* ---------- Video B · från foto till färdigt innehåll, cirka 19 s (samma flöde som annons 6, med erbjudandet) ---------- */
var VBW = A8.O8 + A8.WEND8 + .6;
function vB(c, G, t){
  var S = SR9(G);
  A8.adInlagg(c, G, Math.min(t, VBW), true);
  if(t >= VBW) endShort(c, G, t - VBW, null);
}
function sndB(H){ var O = A8.O8; for(var q = 0; q < 6; q++) H.s("shutter", q*.14, .26); H.s("tick2", .95, .07); H.s("shutter", 1.0, .3);
  H.click(1.0 + O, .18); H.click(2.5 + O, .26); H.click(3.9 + O, .18); H.click(5.1 + O, .26); H.s("tick2", 8.8 + O, .08); H.click(VBW + 1.35, .38) }

/* ---------- Video C · Viewlys nya standard, cirka 19 s ---------- */
var VC = [0, 3.0, 5.8, 8.8, 11.6, 14.0];
function vC(c, G, t){
  var S = SR9(G), is9 = G.is9, RH = S.y1 - S.y0, k, sz = is9 ? 17 : 13.6;
  var sc = [["bedroom", [.5, .55], "Bostadsfoto.", "i tre paket."], ["rs_dusk1", [.5, .55], "Planritning ingår.", "Vid fotografering."], ["rs_chair", [.5, .5], "Inlägg och Reels.", "Av dina bilder."], ["rs_dining", [.5, .6], "Annonstext.", "Från leveransen."], ["rs_dusk2", [.45, .5], "Halva priset.", "60 dagar fria appar."]];
  if(t < VC[5]){
    k = t < VC[1] ? 0 : t < VC[2] ? 1 : t < VC[3] ? 2 : t < VC[4] ? 3 : 4; var u = t - VC[k], d = sc[k];
    scene(c, G, d[0], k3(u, 0, VC[k + 1] - VC[k]), k === 4 ? .5 : .42, d[1]); lab9(c, S, k === 4 ? "LANSERING  ·  NOV–DEC 2026" : "VIEWLY  ·  BOSTADSFOTOGRAFERING");
    fast(c, u, .05, 99, d[2], d[3], k === 4 ? sz*1.15 : sz, S.y0 + RH*.42);
    if(k === 2){ var pw = is9 ? 26 : 21, pa = rev(u, 1.0, .4), pe = oBack(k3(u, 1.0, 1.5)); c.save(); c.globalAlpha = pa; c.translate(50, S.y0 + RH*.76); c.scale(lerp(.86, 1, pe), lerp(.86, 1, pe)); c.shadowColor = "rgba(0,0,0,.45)"; c.shadowBlur = 8; c.shadowOffsetY = 2; c.fillStyle = "#000"; rr(c, -pw/2, -pw*.625, pw, pw*1.25, pw*.025); c.fill(); c.shadowColor = "transparent"; A8.tplB(c, "salu", -pw/2, -pw*.625, pw, k3(u, 1.2, 2.3), A8.DO(0, "rs_dusk1", 0, 1)); c.restore() }
    if(k === 3){ var tx0 = ["Välkommen till Storgatan 15.", "En ljus trea med inglasad balkong", "och utsikt över Helsingborg."], cy0 = S.y0 + RH*.66; sCard(c, 7, cy0, 86, is9 ? 19 : 16, rev(u, 1.0, .3)*.95, 1.8, "rgba(255,255,255,.95)", 4); tx0.forEach(function(l, q){ var ts = 1.3 + q*.45; sTx(c, l, 13, cy0 + 7 + q*4.6, rev(u, 1.0, .3)*(u >= ts ? 1 : 0), {size:3, weight:500, color:INK, p:clamp(k3(u, ts, ts + .4), 0, 1)}) }) }
    return;
  }
  endShort(c, G, t - VC[5], "rs_dusk2");
}
function sndC(H){ H.s("shutter", .05, .4); [VC[1], VC[2], VC[3], VC[4]].forEach(function(s){ H.s("shutter", s, .5) }); H.s("tick1", VC[2] + 1.2, .05); H.s("tick1", VC[3] + 1.3, .05); H.s("tick1", VC[3] + 1.75, .05); H.click(VC[5] + 1.35, .38) }

/* ---------- registrera i systemet ---------- */
window.V3_ADS9S = []; window.V3_ADS9 = [];
function regS(id, n, fn){
  V3_COMPS[id] = {n:n, d:"", group:"ads9", id:id, v:{id:id}, dur:1, thumb:0, L:1, stat:true, draw:function(c, G, t){ fn(c, G) }, mix:function(){}, loadAudio:function(){ return Promise.resolve() }};
  V3_ADS9S.push(id);
}
regS("l_sa", "A · Lanseringserbjudandet", stA); regS("l_sb", "B · Fotografering och appar", stB); regS("l_sc", "C · Viewlys helhet", stC); regS("l_sd", "D · Sista chansen", stD);
function regV(id, n, d, dur, logoAt, fn, thumb, sched){
  var comp = {n:n, d:d, group:"ads9", id:id, v:{id:id}, dur:dur, thumb:thumb, L:logoAt - .53, logo:true, draw:function(c, G, t){ fn(c, G, t) }};
  comp.mix = K.makeMix(sched); comp.loadAudio = function(){ return v3SfxLoad() };
  V3_COMPS[id] = comp; V3_ADS9.push(id);
}
regV("l_va", "A · Lanseringen", "Halva priset, planritning, 60 dagar fria appar.", VA[4] + END_S, VA[4] + END_LOGO_AT, vA, 1.0, sndA);
regV("l_vb", "B · Från foto till färdigt innehåll", "En bild blir ett inlägg: Content Studio, uppgifterna fylls i, sedan erbjudandet.", VBW + END_S, VBW + END_LOGO_AT, vB, 2.2, sndB);
regV("l_vc", "C · Viewlys nya standard", "Filmisk: bostadsfoto, planritning, inlägg, Reels, annonstext och erbjudandet.", VC[5] + END_S, VC[5] + END_LOGO_AT, vC, 1.0, sndC);

/* ---------- storyboard ---------- */
var MUSIC = "Musik: ingen i filen. Om ni vill lägga på musik: lugn, minimal instrumental (piano eller mjuk elektronisk), 70–85 bpm, mixad lågt, eftersom många tittar utan ljud. Allt som betyder något står som text.";
var SB = {
  l_va:[
    [0, VA[1], "Hook", "Halva priset.\npå fotografering.\n50 % PÅ BAS, PLUS OCH PREMIUM", "Helbild, texten syns i första bildrutan, långsam inzoomning.", "Kameraljud."],
    [VA[1], VA[2], "Priset", "50 % på alla tre paket.\nBas 1 000 kr (ord. 2 000), Plus 1 750 kr (ord. 3 500), Premium 3 000 kr (ord. 6 000). Lägenhet, exkl. moms.", "Hårt klipp. Ett vitt fönster, raderna kommer in en och en och de ordinarie priserna stryks över.", "Kameraljud, tre låga tick."],
    [VA[2], VA[3], "Planritning och appar", "Planritning ingår.\n60 dagar fria appar.", "Hårt klipp, stor serif i två delar.", "Kameraljud."],
    [VA[3], VA[4], "Ingen risk", "Ingen bindningstid.\nProva på ett objekt.", "Hårt klipp, samma rytm.", "Kameraljud."],
    [VA[4], VA[4] + END_S, "Avslut", "Halva priset på din första fotografering.\nPlanritning ingår · 60 dagar fria appar · Ingen bindningstid.\nBoka fotografering · viewly.se/maklare · Viewly", "Knappen trycks, bilden blir svart, adressen och loggan animeras in.", "Musklick och loggljud."]],
  l_vb:[
    [0, 3.2, "Hook", "En bild blir\nett inlägg.\nFOTOGRAFERAS → LEVERERAD", "Sex bilder poppar in med varsitt kameraljud, en slår om till ett färdigt inlägg.", "Sex kameraljud, ett ping."],
    [3.2, 6.7, "Leverans och bild", "Storgatan 15 · Helsingborg · 3 rum · 74 m² · LEVERERAD\nVÄLJ EN BILD UR LEVERANSEN", "Mjuk övergång till systemfönstret. En bild väljs.", "Musklick."],
    [6.7, 9.2, "Välj mall", "VÄLJ EN MALL\nTill salu · Visning · Såld", "Mallen väljs, de andra tonar bort och den växer.", "Musklick."],
    [9.2, 12.3, "Fylls i automatiskt", "MALLEN FYLLS I\nADRESS, RUM OCH YTA FYLLS I AUTOMATISKT\nDirekt från leveransen. Inget att skriva.", "Adress, ort, rum och yta lyfts ur leveransen och landar i mallens fält.", "Lågt ping."],
    [12.3, VBW, "Klart", "INLÄGGET ÄR KLART\n✓ Adress, rum och yta ifyllda", "Fönstret tonar ut.", "—"],
    [VBW, VBW + END_S, "Avslut", "Halva priset på din första fotografering.\nPlanritning ingår · 60 dagar fria appar · Ingen bindningstid.\nBoka fotografering · viewly.se/maklare · Viewly", "Knappen trycks, bilden blir svart, adressen och loggan animeras in.", "Musklick och loggljud."]],
  l_vc:[
    [0, VC[1], "Hook: bostadsfoto", "Bostadsfoto.\ni tre paket.", "Helbild, texten syns direkt. Hårda klipp mellan bilderna.", "Kameraljud."],
    [VC[1], VC[2], "Planritning", "Planritning ingår.\nVid fotografering.", "Hårt klipp.", "Kameraljud."],
    [VC[2], VC[3], "Inlägg och Reels", "Inlägg och Reels.\nAv dina bilder.", "Ett färdigt inlägg faller på plats över bilden.", "Kameraljud, tick."],
    [VC[3], VC[4], "Annonstext", "Annonstext.\nFrån leveransen.", "Annonstexten skrivs fram i ett vitt kort.", "Kameraljud, tick."],
    [VC[4], VC[5], "Erbjudandet", "LANSERING · NOV–DEC 2026\nHalva priset.\n60 dagar fria appar.", "Hårt klipp.", "Kameraljud."],
    [VC[5], VC[5] + END_S, "Avslut", "Halva priset på din första fotografering.\nBoka fotografering · viewly.se/maklare · Viewly", "Knappen trycks, bilden blir svart, adressen och loggan animeras in.", "Musklick och loggljud."]]
};
var VMETA = {
  l_va:{prim:"Halva priset på din första fotografering hos Viewly: 50 % på Bas, Plus och Premium i november och december. Planritning ingår, och du får 60 dagars fria appar. Ingen bindningstid.", head:"Halva priset på bostadsfotografering", desc:"Lansering nov–dec 2026 · Priser exkl. moms", btn:"Boka nu"},
  l_vb:{prim:"En bild från leveransen blir ett färdigt inlägg. Adress, ort, rum och yta fylls i automatiskt av Content Studio. 60 dagars fria appar när du bokar under lanseringen, och halva priset på fotograferingen.", head:"En bild blir ett inlägg", desc:"60 dagar fria appar · 50 % på fotograferingen", btn:"Läs mer"},
  l_vc:{prim:"Bostadsfoto, planritning, inlägg, Reels och annonstext från samma leverans. Under lanseringen: halva priset och 60 dagars fria appar. Ingen bindningstid.", head:"Viewlys nya standard", desc:"Foto, planritning, Content Studio och Annonsskrivare", btn:"Boka nu"}
};

/* ---------- sidan ---------- */
function esc9(x){ return String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") }
function tf(x){ return x.toFixed(1).replace(".", ",") }
function metaBlock(m){ return '<div class="l9meta"><b>Primärtext</b><p>' + esc9(m.prim) + '</p><b>Rubrik</b><p>' + esc9(m.head) + '</p><b>Beskrivning</b><p>' + esc9(m.desc) + '</p><b>Knapp · länk</b><p>' + esc9(m.btn) + ' · viewly.se/maklare</p></div>' }
function staticCards(){
  return V3_ADS9S.map(function(id, i){
    var k = "ABCD"[i], d = AD9[k];
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
  return L9CSS + '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 17 · bygge 52</div><h2>Lansering</h2>'
    + '<p>Lanseringserbjudandet i november och december 2026: fyra statiska annonser och tre videor, färdiga att ladda ner. Förslag, inget publicerat.</p></div>'
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
