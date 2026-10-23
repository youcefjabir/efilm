/* =====================================================================
   SIDA 17 — LANSERING (Ads): lanseringserbjudandet i november och december 2026
   Fyra statiska annonser (4:5 och 9:16) och tre videoannonser.
   Ljus editorial: greige, vitt och neutrala toner, professionella bostadsbilder.
   Erbjudandet (ändras inte utan godkännande): 50 % på Bas, Plus och Premium,
   60 dagars fri tillgång till appar, ingen bindningstid, planritning ingår.
   ===================================================================== */
(function(){
var K = window.A7K, A8 = window.A8K, rr = K.rr, MX = 8;
var INK = "#1C1C1E", PAPER = "#ECE8E5", MUT = "#5f5a55", OLI = "#6E7266", WHITE = "#fff", GRN = "#2f3a2d";
var rev = A8.rev, clamp = A8.clamp, fz = A8.fz, sCard = A8.sCard, sPh = A8.sPh, sTx = A8.sTx, sBtn = A8.sBtn;

/* ---------- text och erbjudande på ett ställe ---------- */
var OFFER = {
  bas:"1 000 kr", basOrd:"2 000 kr", plus:"1 750 kr", prem:"3 000 kr",
  small:"Lanseringserbjudande november–december 2026  ·  Priser exkl. moms", sub:"Planritning ingår  ·  60 dagar fria appar  ·  Ingen bindningstid"
};
var AD9 = {
  A:{n:"A · Lanseringserbjudandet", svar:"Vad erbjuder Viewly, och varför just nu?",
     h1:"Halva priset", h2:"på din första fotografering.", cta:"Boka fotografering",
     meta:{prim:"Lansering i november och december: 50 % rabatt på Bas, Plus och Premium när du bokar fotografering hos Viewly. Planritning ingår, och du får 60 dagars fri tillgång till våra appar för inlägg och annonstext. Ingen bindningstid, och du behöver inte byta fotograf. Prova på ett objekt.", head:"Halva priset på din första fotografering", desc:"Lansering nov–dec 2026. Priser exkl. moms.", btn:"Boka nu"}},
  B:{n:"B · Fotografering och appar", svar:"Varför är Viewly intressant för mig som mäklare?",
     h1:"Från bostadsfoto", h2:"till färdiga inlägg.", cta:"Prova Viewly",
     meta:{prim:"Efter fotograferingen använder du dina levererade bilder direkt: Content Studio gör inlägg av dem, och Annonsskrivaren skriver annonstexten. Under lanseringen får du 60 dagars fri tillgång till apparna och 50 % på fotograferingen. Ingen bindningstid.", head:"Bilderna blir färdiga inlägg", desc:"60 dagar fria appar · 50 % på fotograferingen", btn:"Läs mer"}},
  C:{n:"C · Viewlys helhet", svar:"Vad erbjuder Viewly, mer än bilder?",
     h1:"Mer än en fotograf.", h2:"En fotopartner för hela flödet.", cta:"Boka fotografering",
     meta:{prim:"Bostadsfoto i tre paket, planritning som ingår, Content Studio för inlägg och Annonsskrivare för annonstext. Allt av samma leverans, i kontorets utseende. Under lanseringen: halva priset på fotograferingen och 60 dagar fria appar.", head:"Mer än en fotograf", desc:"Foto, planritning, Content Studio och Annonsskrivare", btn:"Boka nu"}},
  D:{n:"D · Sista chansen", svar:"Varför ska jag prova Viewly just nu?",
     h1:"Prova Viewly", h2:"för halva priset.", cta:"Boka innan 31 december",
     meta:{prim:"Lanseringserbjudandet gäller till och med den 31 december: 50 % rabatt på Bas, Plus och Premium, 60 dagars fria appar och ingen bindningstid. Boka fotografering på ett objekt och se själv.", head:"Sista chansen: halva priset", desc:"Gäller till 31 dec · Ingen bindningstid", btn:"Boka nu"}}
};

/* ---------- gemensamma delar ---------- */
function reg9Geo(G){ return {y0:G.top + (G.is9 ? 3 : 2), y1:G.H - G.bot - (G.is9 ? 1 : 0)} }
function brand(c, G, y, a){
  var mh = 3.8, mw = mh*858.6/756.3;
  v3Mark(c, MX, y - mh*.78, mh, INK, C3.oli, {reveal:1, dot:1, alpha:a == null ? 1 : a});
  v3Text(c, "VIEWLY", MX + mw + 2, y, {size:2.5, weight:500, f:"sans", sp:.32, color:INK, alpha:a == null ? 1 : a});
  v3Text(c, "LANSERING  ·  NOV–DEC 2026", 100 - MX, y, {size:2, weight:500, f:"sans", sp:.22, color:MUT, align:"r", alpha:a == null ? 1 : a});
}
function cta(c, G, cx, y, w, h, label, a){
  c.save(); c.globalAlpha = a == null ? 1 : a; c.shadowColor = "rgba(20,15,10,.22)"; c.shadowBlur = 5; c.shadowOffsetY = 1.2; c.fillStyle = INK; rr(c, cx - w/2, y, w, h, h/2); c.fill(); c.restore();
  v3Text(c, label, cx, y + h*.62, {size:Math.min(3.5, h*.36), weight:600, f:"sans", sp:.1, color:WHITE, align:"c", alpha:a == null ? 1 : a});
}
function small(c, G, y, txt){ v3Text(c, txt || OFFER.small, 50, y, {size:1.85, weight:500, f:"sans", sp:.1, color:MUT, align:"c"}) }
function strike(c, x, y, w, col){ c.save(); c.strokeStyle = col; c.lineWidth = .3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y - .6); c.stroke(); c.restore() }
function head2(c, x, y, l1, l2, s1, s2, maxW){
  var a = Math.min(s1, fz(c, l1, {size:s1, weight:300}, maxW)), b = Math.min(s2, fz(c, l2, {size:s2, weight:300, italic:true}, maxW));
  v3Text(c, l1, x, y, {size:a, weight:300, color:INK});
  v3Text(c, l2, x, y + a*.62 + b*.58, {size:b, weight:300, italic:true, color:OLI});
  return y + a*.62 + b*.58;
}

/* ---------- A · lanseringserbjudandet ---------- */
function stA(c, G){
  var R = reg9Geo(G), is9 = G.is9, y = R.y0 + 4, d = AD9.A;
  v3Fill(c, 0, 0, 100, G.H, PAPER); brand(c, G, y);
  y += is9 ? 16 : 13; var yl = head2(c, MX, y, d.h1, d.h2, is9 ? 17 : 14, is9 ? 6.4 : 5.6, 84);
  var pt = yl + (is9 ? 7 : 6), bot = is9 ? 38 : 33, ph = R.y1 - bot - pt;
  c.save(); rr(c, MX, pt, 84, ph, 1.2); c.clip(); v3Photo(c, "rs_dusk1", MX, pt, 84, ph, {scale:1.06, pos:[.5, .55]}); c.restore();
  /* prisen ligger som ett tyst vitt kort på bilden */
  var cw = 42, chh = 22, cx = MX + 3, cy = pt + ph - chh - 3;
  sCard(c, cx, cy, cw, chh, 1, 1.2, WHITE, 5);
  v3Text(c, "BAS · LÄGENHET", cx + 3.4, cy + 5, {size:1.9, weight:600, f:"sans", sp:.2, color:MUT});
  v3Text(c, OFFER.bas, cx + 3.4, cy + 13.4, {size:8.2, weight:300, f:"sans", color:INK});
  var ow = v3Measure(c, OFFER.basOrd, {size:2.5, weight:500, f:"sans"});
  v3Text(c, "ord. " + OFFER.basOrd, cx + 3.4, cy + 18.6, {size:2.3, weight:500, f:"sans", color:MUT}); strike(c, cx + 3.4 + v3Measure(c, "ord. ", {size:2.3, weight:500, f:"sans"}), cy + 17.8, ow*2.3/2.5, MUT);
  v3Text(c, "exkl. moms", cx + cw - 3.4, cy + 18.6, {size:1.9, weight:500, f:"sans", color:MUT, align:"r"});
  v3Text(c, "Plus " + OFFER.plus, 100 - MX - 3, cy + chh - 6.4, {size:2.5, weight:600, f:"sans", color:WHITE, align:"r", shadow:true});
  v3Text(c, "Premium " + OFFER.prem, 100 - MX - 3, cy + chh - 2, {size:2.5, weight:600, f:"sans", color:WHITE, align:"r", shadow:true});
  var yb = pt + ph + (is9 ? 8 : 7);
  v3Text(c, OFFER.sub, 50, yb, {size:2.45, weight:500, f:"sans", sp:.04, color:INK, align:"c"});
  cta(c, G, 50, yb + (is9 ? 6 : 5), 56, is9 ? 10.6 : 9.4, d.cta);
  small(c, G, R.y1 - 1);
}

/* ---------- B · fotografering och appar ---------- */
function stB(c, G){
  var R = reg9Geo(G), is9 = G.is9, y = R.y0 + 4, d = AD9.B, T9 = A8.tplB, DO = A8.DO, ph = [A8.GRID7[0], A8.GRID7[2], A8.GRID7[5]];
  v3Fill(c, 0, 0, 100, G.H, PAPER); brand(c, G, y);
  y += is9 ? 16 : 11; var yl = head2(c, MX, y, d.h1, d.h2, is9 ? 13.6 : 9.6, is9 ? 11 : 7.8, 84);
  var sy = yl + (is9 ? 7 : 5);
  var lines = is9 ? ["Efter fotograferingen skapar du inlägg,", "Reels och annonstext direkt av dina", "levererade bilder."] : ["Efter fotograferingen skapar du inlägg, Reels", "och annonstext direkt av dina levererade bilder."];
  lines.forEach(function(l, i){ v3Text(c, l, MX, sy + i*4.4, {size:3.05, weight:400, f:"sans", color:MUT}) });
  var vy = sy + lines.length*4.4 + (is9 ? 5 : 3.6), vw = is9 ? 25.5 : 19.2, vh = vw*1.25;
  c.save(); c.shadowColor = "rgba(30,25,20,.22)"; c.shadowBlur = 6; c.shadowOffsetY = 1.6; c.fillStyle = "#000"; rr(c, MX, vy, vw, vh, 1); c.fill(); c.restore();
  c.save(); rr(c, MX, vy, vw, vh, 1); c.clip(); v3Photo(c, "rs_dusk1", MX, vy, vw, vh, {scale:1.2, pos:[.5, .5]}); c.restore();
  v3Text(c, "LEVERERAD BILD", MX, vy + vh + 5, {size:1.9, weight:600, f:"sans", sp:.2, color:MUT});
  var ax = MX + vw + 3, ay = vy + vh/2;
  c.save(); c.strokeStyle = OLI; c.lineWidth = .3; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + 7, ay); c.moveTo(ax + 5.4, ay - 1.4); c.lineTo(ax + 7, ay); c.lineTo(ax + 5.4, ay + 1.4); c.stroke(); c.restore();
  var px0 = ax + 10, pw = is9 ? 25 : 19.2, step = (100 - MX - pw - px0)/2;
  [0, 1, 2].forEach(function(i){ var px = px0 + i*step, py = vy + (2 - i)*1.4; c.save(); c.shadowColor = "rgba(30,25,20,.3)"; c.shadowBlur = 6; c.shadowOffsetY = 1.6; c.fillStyle = "#000"; rr(c, px, py, pw, pw*1.25, pw*.025); c.fill(); c.restore(); T9(c, A8.KB[i], px, py, pw, 1, DO(i, ph[i], 0, 1)) });
  v3Text(c, "INLÄGG OCH REELS", px0, vy + vh + 6.4, {size:1.9, weight:600, f:"sans", sp:.2, color:MUT});
  var ty = vy + vh + (is9 ? 10 : 9.4), th = is9 ? 17 : 12.6;
  sCard(c, MX, ty, 84, th, 1, 1.4, WHITE, 3);
  v3Text(c, "ANNONSTEXT", MX + 4, ty + 4.4, {size:1.9, weight:600, f:"sans", sp:.2, color:OLI});
  ["Välkommen till Storgatan 15. En ljus trea med", "inglasad balkong och utsikt över Helsingborg."].forEach(function(l, i){ v3Text(c, l, MX + 4, ty + 8.4 + i*3.4, {size:2.65, weight:500, f:"sans", color:INK}) });
  var ch = is9 ? 10.6 : 8.6, by = ty + th + (is9 ? 7 : 4.6);
  cta(c, G, 50, by, 46, ch, d.cta);
  small(c, G, is9 ? by + ch + 6 : R.y1 - .5, "60 dagar fria appar  ·  50 % på fotograferingen  ·  Priser exkl. moms  ·  Nov–dec 2026");
}

/* ---------- C · helheten ---------- */
function stC(c, G){
  var R = reg9Geo(G), is9 = G.is9, y = R.y0 + 4, d = AD9.C;
  v3Fill(c, 0, 0, 100, G.H, PAPER); brand(c, G, y);
  y += is9 ? 16 : 11; var yl = head2(c, MX, y, d.h1, d.h2, is9 ? 15 : 10.6, is9 ? 5.6 : 4.4, 84);
  var pt = yl + (is9 ? 6 : 4.4), phh = is9 ? 30 : 17;
  c.save(); rr(c, MX, pt, 84, phh, 1.2); c.clip(); v3Photo(c, "rs_dining", MX, pt, 84, phh, {scale:1.1, pos:[.5, .6]}); c.restore();
  var rows = [["01", "Bostadsfoto", "Tre paket."], ["02", "Planritning", "Ingår vid fotografering."], ["03", "Content Studio", "Inlägg och Reels."], ["04", "Annonsskrivare", "Annonstext från leveransen."]];
  var ry = pt + phh + (is9 ? 7 : 5), rh = is9 ? 12.2 : 9.6;
  rows.forEach(function(r, i){
    var y0 = ry + i*rh;
    v3Fill(c, MX, y0 - 1.2, 84, .22, INK, .35);
    v3Text(c, r[0], MX, y0 + rh*.5 + 1.0, {size:2.3, weight:600, f:"sans", sp:.1, color:OLI});
    v3Text(c, r[1], MX + 9, y0 + rh*.5 + 1.9, {size:is9 ? 5.6 : 4.6, weight:400, color:INK});
    v3Text(c, r[2], 100 - MX, y0 + rh*.5 + 1.0, {size:2.4, weight:500, f:"sans", color:MUT, align:"r"});
  });
  v3Fill(c, MX, ry + 4*rh - 1.2, 84, .22, INK, .35);
  var ch = is9 ? 10.6 : 8.6, by = ry + 4*rh + (is9 ? 5 : 3.4);
  cta(c, G, 50, by, 56, ch, d.cta);
  small(c, G, is9 ? by + ch + 6 : R.y1 - .5, "Lanseringspris: halva priset i november och december  ·  Priser exkl. moms");
}

/* ---------- D · sista chansen ---------- */
function stD(c, G){
  var R = reg9Geo(G), is9 = G.is9, y = R.y0 + 4, d = AD9.D;
  v3Fill(c, 0, 0, 100, G.H, PAPER); brand(c, G, y);
  y += is9 ? 10 : 9; v3Text(c, "SISTA CHANSEN", MX, y, {size:2.6, weight:600, f:"sans", sp:.34, color:OLI});
  y += is9 ? 14 : 13; var yl = head2(c, MX, y, d.h1, d.h2, is9 ? 17 : 14.4, is9 ? 11 : 9.4, 84);
  /* två stora tal, utan rabattgrafik */
  var sy = yl + (is9 ? 7 : 7), colW = 40;
  [["50 %", "på Bas, Plus och Premium"], ["60", "dagar fria appar"]].forEach(function(s, i){
    var x = MX + i*(colW + 4);
    v3Fill(c, x, sy, colW, .22, INK, .5);
    v3Text(c, s[0], x, sy + (is9 ? 14 : 12), {size:is9 ? 12 : 10, weight:300, f:"sans", color:INK});
    v3Text(c, s[1], x, sy + (is9 ? 20 : 17), {size:2.6, weight:500, f:"sans", color:MUT});
  });
  var py = sy + (is9 ? 22 : 19), ph = R.y1 - (is9 ? 25 : 22) - py;
  c.save(); rr(c, MX, py, 84, ph, 1.2); c.clip(); v3Photo(c, "bedroom", MX, py, 84, ph, {scale:1.08, pos:[.5, .55]}); c.restore();
  v3Text(c, "Ingen bindningstid", 100 - MX - 3, py + ph - 3.4, {size:2.5, weight:600, f:"sans", sp:.1, color:WHITE, align:"r", shadow:true});
  var by = py + ph + (is9 ? 6 : 5);
  cta(c, G, 50, by, 60, is9 ? 10.6 : 9.4, d.cta);
  small(c, G, R.y1 - 1);
}


/* ===================== VIDEO ===================== */
function SR9(G){ return {y0:G.top + 2, y1:G.H - G.bot} }
function vis(t, t0, t1, fi, fo){ return rev(t, t0, fi || .3)*(1 - rev(t, t1 - (fo || .3), fo || .3)) }
function pho(c, G, key, p, dim, pos, z0, z1){ v3Photo(c, key, 0, 0, 100, G.H, {scale:lerp(z0 || 1.04, z1 || 1.14, p), pos:pos || V3_POS[key]}); v3Fill(c, 0, 0, 100, G.H, "#0c0a0a", dim) }
function brandV(c, G, S, a){ brand(c, G, S.y0 + 3, a) }
function vText(c, s, x, y, o){ return v3Text(c, s, x, y, o) }
/* slutkortet: erbjudandet, knappen som trycks, adressen och loggan */
function endCard(c, G, u, nolabel){
  var is9 = G.is9, cy = G.cy - 2, a;
  v3Fill(c, 0, 0, 100, G.H, PAPER);
  a = rev(u, 0, .4); v3Text(c, "LANSERINGSERBJUDANDE  ·  NOV–DEC 2026", 50, cy - (is9 ? 31 : 27), {size:2.1, weight:600, f:"sans", sp:.24, color:OLI, align:"c", alpha:a});
  var s1 = is9 ? 16 : 13.4; a = rev(u, .15, .4);
  v3Text(c, "Halva priset", 50, cy - (is9 ? 17 : 15), {size:s1, weight:300, color:INK, align:"c", alpha:a, p:oQ(k3(u, .15, .8)), rise:2});
  v3Text(c, "på din första fotografering.", 50, cy - (is9 ? 6 : 6.4), {size:is9 ? 6 : 5, weight:300, italic:true, color:OLI, align:"c", alpha:rev(u, .45, .4), p:oQ(k3(u, .45, 1.0)), rise:2});
  v3Text(c, "Planritning ingår  ·  60 dagar fria appar  ·  Ingen bindningstid", 50, cy + 4, {size:2.45, weight:500, f:"sans", color:INK, align:"c", alpha:rev(u, .8, .4)});
  var bw = 58, bh = is9 ? 11 : 9.6, by = cy + (is9 ? 12 : 10), pr = k3(u, 1.7, 1.95)*(1 - k3(u, 2.0, 2.3)), ba = rev(u, 1.0, .4), sc = 1 - .05*pr;
  c.save(); c.translate(50, by + bh/2); c.scale(sc, sc); c.translate(-50, -by - bh/2); c.globalAlpha = ba; c.shadowColor = "rgba(20,15,10," + (.22 - .1*pr) + ")"; c.shadowBlur = 5; c.shadowOffsetY = 1.2; c.fillStyle = INK; rr(c, 50 - bw/2, by, bw, bh, bh/2); c.fill(); c.restore();
  v3Text(c, "Boka fotografering", 50, by + bh*.63, {size:3.6, weight:600, f:"sans", sp:.08, color:WHITE, align:"c", alpha:ba});
  if(u > 1.75){ var rp = clamp(k3(u, 1.75, 2.5), 0, 1); c.save(); c.globalAlpha = (1 - rp)*.45; c.strokeStyle = INK; c.lineWidth = .35; rr(c, 50 - bw/2 - rp*3, by - rp*3, bw + rp*6, bh + rp*6, bh/2 + rp*3); c.stroke(); c.restore() }
  v3Text(c, "viewly.se/maklare", 50, by + bh + 7.4, {size:3.3, weight:500, f:"sans", sp:.04, color:INK, align:"c", alpha:rev(u, 2.0, .4)});
  var la = rev(u, 2.5, .3), ly = by + bh + (is9 ? 22 : 18.5), mh = 5.2, mw = mh*858.6/756.3, ww = v3Measure(c, "VIEWLY", {size:3, weight:500, f:"sans", sp:.32}) - .32*3, tot = mw + 2.6 + ww, x0 = 50 - tot/2;
  v3Mark(c, x0, ly - mh*.8, mh, INK, C3.oli, {reveal:oQ(k3(u, 2.5, 3.1)), dot:oBack(k3(u, 2.9, 3.3)), alpha:la});
  v3Text(c, "VIEWLY", x0 + mw + 2.6, ly, {size:3, weight:500, f:"sans", sp:.32, color:INK, alpha:rev(u, 2.9, .4)});
}
var END_DUR = 4.0, END_LOGO = 2.5;

/* ---------- Video A · Lanseringen, 13 s ---------- */
var VA = [0, 1.7, 4.4, 6.9, 9.0];
function vA(c, G, t){
  var S = SR9(G), is9 = G.is9, cyy = S.y0 + (S.y1 - S.y0)*.46, i;
  if(t < VA[1]){
    pho(c, G, "rs_dusk1", k3(t, 0, 1.7), .4, [.5, .55]);
    v3Grad(c, 0, 0, 100, G.H*.32, [[0, "rgba(8,7,7,.5)"], [1, "rgba(8,7,7,0)"]]);
    v3Text(c, "VIEWLY  ·  LANSERING", 50, S.y0 + 3, {size:2.2, weight:500, f:"sans", sp:.3, color:WHITE, align:"c", alpha:.92});
    v3Text(c, "Halva priset", 50, cyy, {size:is9 ? 18 : 15, weight:300, color:WHITE, align:"c", p:oQ(k3(t, 0, .45)), rise:2, shadow:true});
    v3Text(c, "på bostadsfotografering.", 50, cyy + (is9 ? 11.4 : 9.4), {size:is9 ? 6.6 : 5.4, weight:300, italic:true, color:C3.cream, align:"c", alpha:rev(t, .2, .3), p:oQ(k3(t, .2, .8)), rise:2, shadow:true});
    v3Text(c, "50 % PÅ BAS, PLUS OCH PREMIUM", 50, cyy + (is9 ? 21 : 18), {size:2.3, weight:600, f:"sans", sp:.26, color:WHITE, align:"c", alpha:rev(t, .85, .3), shadow:true});
    return;
  }
  if(t < VA[2]){
    var u = t - VA[1];
    v3Fill(c, 0, 0, 100, G.H, PAPER); brandV(c, G, S);
    v3Text(c, "50 % på Bas, Plus", MX, S.y0 + (is9 ? 20 : 17), {size:is9 ? 8.6 : 7.6, weight:300, color:INK, alpha:rev(u, .1, .3), p:oQ(k3(u, .1, .7)), rise:2});
    v3Text(c, "och Premium.", MX, S.y0 + (is9 ? 20 : 17) + (is9 ? 8.2 : 7.2), {size:is9 ? 8.6 : 7.6, weight:300, italic:true, color:OLI, alpha:rev(u, .3, .3), p:oQ(k3(u, .3, .9)), rise:2});
    var rows = [["Bas", "1 000 kr", "2 000 kr"], ["Plus", "1 750 kr", "3 500 kr"], ["Premium", "3 000 kr", "6 000 kr"]], rh = is9 ? 22 : 17.5, ry = S.y0 + (is9 ? 44 : 34);
    rows.forEach(function(r, k){
      var t0 = .5 + k*.3, a = rev(u, t0, .3), y0 = ry + k*rh;
      v3Fill(c, MX, y0, 84, .22, INK, .4*a);
      v3Text(c, r[0], MX, y0 + rh*.62, {size:is9 ? 8 : 6.6, weight:400, color:INK, alpha:a});
      v3Text(c, "lägenhet, exkl. moms", MX, y0 + rh*.62 + 4.2, {size:1.9, weight:500, f:"sans", color:MUT, alpha:a});
      var pw = v3Measure(c, r[1], {size:is9 ? 8.4 : 7, weight:300, f:"sans"});
      v3Text(c, r[1], 100 - MX, y0 + rh*.64, {size:is9 ? 8.4 : 7, weight:300, f:"sans", color:INK, align:"r", alpha:a});
      var ow = v3Measure(c, r[2], {size:3.2, weight:500, f:"sans"}), ox = 100 - MX - pw - 5 - ow;
      v3Text(c, r[2], ox, y0 + rh*.64, {size:3.2, weight:500, f:"sans", color:MUT, alpha:a});
      var sp = k3(u, 1.5 + k*.15, 1.9 + k*.15); if(sp > 0){ c.save(); c.globalAlpha = a; c.strokeStyle = MUT; c.lineWidth = .3; c.beginPath(); c.moveTo(ox - .5, y0 + rh*.64 - .8); c.lineTo(ox - .5 + (ow + 1)*sp, y0 + rh*.64 - 1.4); c.stroke(); c.restore() }
    });
    v3Fill(c, MX, ry + 3*rh, 84, .22, INK, .4*rev(u, 1.3, .3));
    v3Text(c, "Lanseringspris, november–december.", MX, ry + 3*rh + 6, {size:2.5, weight:500, f:"sans", color:MUT, alpha:rev(u, 1.5, .4)});
    return;
  }
  if(t < VA[3]){
    var u2 = t - VA[2];
    v3Fill(c, 0, 0, 100, G.H, PAPER); brandV(c, G, S);
    var hy = S.y0 + (is9 ? 20 : 17);
    v3Text(c, "Professionella", MX, hy, {size:is9 ? 8.6 : 7.6, weight:300, color:INK, alpha:rev(u2, .0, .3), p:oQ(k3(u2, 0, .6))});
    v3Text(c, "bostadsbilder.", MX, hy + (is9 ? 8.2 : 7.2), {size:is9 ? 8.6 : 7.6, weight:300, italic:true, color:OLI, alpha:rev(u2, .15, .3), p:oQ(k3(u2, .15, .75))});
    var cw = 26, chh = cw*1.3, cy0 = S.y0 + (is9 ? 46 : 36), keys = ["rs_dusk1", "bedroom", "rs_chair"], tt = [.25, .55, .85];
    keys.forEach(function(k, q){
      var a = rev(u2, tt[q], .2), sc = lerp(.86, 1, oBack(k3(u2, tt[q], tt[q] + .35))), x = MX + q*(cw + 3), cxm = x + cw/2, cym = cy0 + chh/2;
      c.save(); c.globalAlpha = a; c.translate(cxm, cym); c.scale(sc, sc); c.shadowColor = "rgba(30,25,20,.25)"; c.shadowBlur = 6; c.shadowOffsetY = 1.6; c.fillStyle = "#000"; rr(c, -cw/2, -chh/2, cw, chh, 1); c.fill(); c.shadowColor = "transparent"; rr(c, -cw/2, -chh/2, cw, chh, 1); c.clip(); v3Photo(c, k, -cw/2, -chh/2, cw, chh, {scale:1.2, pos:V3_POS[k] || [.5, .5]}); c.restore();
    });
    var ph0 = cy0 + chh + (is9 ? 12 : 9);
    sCard(c, MX, ph0, 84, is9 ? 16 : 13, rev(u2, 1.2, .3), 1.4, WHITE, 3);
    v3Text(c, "PLANRITNING", MX + 4, ph0 + 5.2, {size:1.9, weight:600, f:"sans", sp:.2, color:OLI, alpha:rev(u2, 1.3, .3)});
    v3Text(c, "Ingår vid fotografering.", MX + 4, ph0 + (is9 ? 12 : 10.2), {size:is9 ? 5.2 : 4.6, weight:400, color:INK, alpha:rev(u2, 1.35, .3), p:oQ(k3(u2, 1.35, 1.9))});
    return;
  }
  if(t < VA[4]){
    var u3 = t - VA[3];
    v3Fill(c, 0, 0, 100, G.H, PAPER); brandV(c, G, S);
    var hy2 = S.y0 + (is9 ? 20 : 17);
    v3Text(c, "60 dagar", MX, hy2, {size:is9 ? 11 : 9.4, weight:300, color:INK, alpha:rev(u3, 0, .3), p:oQ(k3(u3, 0, .6))});
    v3Text(c, "fria appar.", MX, hy2 + (is9 ? 10 : 8.6), {size:is9 ? 11 : 9.4, weight:300, italic:true, color:OLI, alpha:rev(u3, .15, .3), p:oQ(k3(u3, .15, .75))});
    var cw2 = 40, ch2 = is9 ? 44 : 34, cy2 = S.y0 + (is9 ? 44 : 34);
    [["Content Studio", "Inlägg och Reels av dina bilder."], ["Annonsskrivare", "Annonstext från leveransen."]].forEach(function(m, q){
      var x = MX + q*(cw2 + 4), a = rev(u3, .4 + q*.25, .3);
      sCard(c, x, cy2, cw2, ch2, a, 1.4, WHITE, 3);
      v3Text(c, m[0], x + 3.6, cy2 + 7.4, {size:4.6, weight:400, color:INK, alpha:a});
      v3Text(c, m[1], x + 3.6, cy2 + 12, {size:2.2, weight:500, f:"sans", color:MUT, alpha:a});
      if(q === 0){ var pw0 = 17, ph0b = pw0*1.25; c.save(); c.globalAlpha = a; A8.tplB(c, "salu", x + 3.6, cy2 + 16, pw0, 1, A8.DO(0, "rs_dusk1", 0, 1)); c.restore() }
      else { ["Välkommen till", "Storgatan 15. En ljus", "trea med inglasad", "balkong och utsikt", "över Helsingborg."].forEach(function(l, k){ var ts = .9 + k*.18; v3Text(c, l, x + 3.6, cy2 + 18 + k*3.5, {size:2.4, weight:500, f:"sans", color:INK, alpha:a*(u3 >= ts ? 1 : 0), p:clamp(k3(u3, ts, ts + .25), 0, 1)}) }) }
    });
    v3Text(c, "Ingen bindningstid.", MX, cy2 + ch2 + (is9 ? 10 : 8), {size:is9 ? 5.8 : 5, weight:400, color:INK, alpha:rev(u3, 1.3, .4), p:oQ(k3(u3, 1.3, 1.9))});
    return;
  }
  endCard(c, G, t - VA[4]);
}
function sndA(H){ H.s("shutter", .05, .35); H.s("shutter", VA[1], .5); H.s("tick1", VA[1] + .5, .05); H.s("tick1", VA[1] + .8, .05); H.s("tick1", VA[1] + 1.1, .05);
  [.25, .55, .85].forEach(function(q){ H.s("shutter", VA[2] + q, .3) }); H.s("tick1", VA[3] + .5, .05); H.s("tick1", VA[3] + .75, .05);
  H.click(VA[4] + 1.8, .38) }


/* ---------- Video B · från foto till färdigt innehåll, 18 s ---------- */
var VB = [0, 2.6, 6.6, 10.6, 14.0], GRID9 = [A8.GRID7[0], A8.GRID7[1], A8.GRID7[2], A8.GRID7[3], A8.GRID7[4], A8.GRID7[5]], PH9 = [A8.GRID7[0], A8.GRID7[2], A8.GRID7[5]];
function hookB(c, G, S, t){
  var fq = .8, cw = 27*fq, chh = 33.75*fq, gp = 2.2, gw = 3*cw + 2*gp, left = (100 - gw)/2, top = S.y0 + (S.y1 - S.y0)*(G.is9 ? .34 : .38), out = ioC(k3(t, 2.1, 2.6)), i;
  var ts = G.is9 ? 9.4 : 7.6, ty0 = S.y0 + (S.y1 - S.y0)*.12, ta = rev(t, -.25, .3)*(1 - out), POST = {0:0, 2:1, 5:2};
  v3Text(c, "Foto in.", 50, ty0 + ts*.8, {size:ts, color:INK, align:"c", alpha:ta, p:oQ(k3(t, -.35, .35))});
  v3Text(c, "Inlägg ut.", 50, ty0 + ts*1.95, {size:ts, italic:true, color:OLI, align:"c", alpha:ta*rev(t, 1.35, .3), p:oQ(k3(t, 1.35, 1.9))});
  var sa = rev(t, -.2, .25)*(1 - out), lev = rev(t, .85, .25), sw1 = v3Measure(c, "FOTOGRAFERAS", {size:2.1, weight:600, f:"sans", sp:.2}) + 10, sw2 = v3Measure(c, "LEVERERAD", {size:2.1, weight:600, f:"sans", sp:.2}) + 10, sw = lerp(sw1, sw2, lev), sy = S.y0 + .4;
  sCard(c, 50 - sw/2, sy, sw, 5.6, sa, 2.8, WHITE, 0, "rgba(28,28,30,.12)");
  c.save(); c.globalAlpha = sa; c.fillStyle = lev > .5 ? "#2f6a3a" : "#b9822c"; c.beginPath(); c.arc(50 - sw/2 + 3.4, sy + 2.8, .95, 0, 7); c.fill(); c.restore();
  sTx(c, "FOTOGRAFERAS", 50 - sw/2 + 6, sy + 3.8, sa*(1 - lev), {size:2.1, weight:600, color:MUT, sp:.2});
  sTx(c, "LEVERERAD", 50 - sw/2 + 6, sy + 3.8, sa*lev, {size:2.1, weight:600, color:"#2f6a3a", sp:.2});
  for(i = 0; i < 6; i++){
    var col = i % 3, row = Math.floor(i/3), cx0 = left + col*(cw + gp), cy0 = top + row*(chh + gp), t0 = i*.12, pop = rev(t, t0, .2), ps = lerp(.84, 1, oBack(k3(t, t0, t0 + .35))), pi = POST[i];
    if(pop <= .01) continue;
    if(pi === undefined){
      var a = pop*(1 - ioC(k3(t, 1.0, 1.5)))*(1 - out); if(a <= .02) continue;
      var sc = ps*lerp(1, .9, ioC(k3(t, 1.0, 1.5))); c.save(); c.translate(cx0 + cw/2, cy0 + chh/2); c.scale(sc, sc); sCard(c, -cw/2 - .4, -chh/2 - .4, cw + .8, chh + .8, a, 1.6, WHITE, 3); sPh(c, GRID9[i], -cw/2, -chh/2, cw, chh, a, 1.4, 1.14); c.restore();
    } else {
      var e = ioC(k3(t, 1.45, 2.2)), tw = G.is9 ? 27 : 23, tx = lerp(cx0 + cw/2, 50 + (pi - 1)*(tw + 2.2), e), ty = lerp(cy0 + chh/2, top + chh + gp/2 - 1, e), w = lerp(cw, tw, e), h = w*1.25, pa = rev(t, 1.0, .35), a2 = pop*(1 - out), sc2 = t < 1.0 ? ps : 1;
      if(a2 <= .02) continue;
      c.save(); c.translate(tx, ty); c.scale(sc2*(1 - .05*out), sc2*(1 - .05*out)); c.globalAlpha = a2;
      if(pa < 1){ sCard(c, -cw/2 - .4, -chh/2 - .4, cw + .8, chh + .8, 1 - pa, 1.6, WHITE, 3); sPh(c, GRID9[i], -cw/2, -chh/2, cw, chh, 1 - pa, 1.4, 1.14) }
      if(pa > .02){ c.save(); c.globalAlpha = a2*pa; c.shadowColor = "rgba(30,25,20,.35)"; c.shadowBlur = 8; c.shadowOffsetY = 2; c.fillStyle = "#000"; rr(c, -w/2, -h/2, w, h, w*.025); c.fill(); c.shadowColor = "transparent"; A8.tplB(c, A8.KB[pi], -w/2, -h/2, w, k3(t, 1.05 + pi*.12, 2.0 + pi*.12), A8.DO(pi, PH9[pi])); c.restore() }
      c.restore();
    }
  }
}
function winCard(c, G, S, a, slide){
  var wy = S.y0 + 2, wh = (S.y1 - S.y0) - 4, wx = 7, ww = 86;
  c.save(); c.translate(0, slide); sCard(c, wx, wy, ww, wh, a, 3.2, "#F5F2EF", 12, "rgba(28,28,30,.08)");
  return {wy:wy, wh:wh, x0:13, cw:74};
}
function vB(c, G, t){
  var S = SR9(G), is9 = G.is9, i;
  v3Fill(c, 0, 0, 100, G.H, PAPER);
  if(t < VB[1] + .5){ hookB(c, G, S, t); brandVfoot(c, G, S, 1) }
  if(t >= VB[1] - .5 && t < VB[2]){
    var tr = t - VB[1], wa = vis(tr, -.5, 4.0, .5, .4), g = winCard(c, G, S, wa, (1 - oQ(k3(tr, -.5, .5)))*6 + rev(tr, 3.6, .4)*3), x0 = g.x0, cw = g.cw, wy = g.wy;
    if(wa > .02){
      sTx(c, "CONTENT STUDIO", x0, wy + 8, wa, {size:2.5, weight:600, sp:.24});
      sTx(c, "LEVERERAD", x0 + cw, wy + 8, wa, {size:2.2, weight:600, color:"#2f6a3a", align:"r", sp:.2});
      v3Text(c, "Storgatan 15", x0, wy + 17, {size:7, color:INK, alpha:wa});
      sTx(c, "HELSINGBORG  ·  3 RUM  ·  74 M²", x0, wy + 22, wa, {size:2.6, weight:600, color:tr > 1.0 && tr < 3.0 ? "#2f6a3a" : MUT, sp:.14});
      var BW = is9 ? 36 : 30, bx = 50 - BW/2, by = wy + 28, ph = A8.GRID7[0], slot = rev(tr, .3, .4);
      c.save(); c.globalAlpha = wa; c.shadowColor = "rgba(30,25,20,.3)"; c.shadowBlur = 8; c.shadowOffsetY = 2; c.fillStyle = "#000"; rr(c, bx, by, BW, BW*1.25, BW*.025); c.fill(); c.restore();
      c.save(); c.globalAlpha = wa*rev(tr, .2, .4); A8.tplB(c, "salu", bx, by, BW, clamp(k3(tr, 1.4, 3.0), 0, 1), A8.DO(0, ph, slot, 1)); c.restore();
      var SL = [[38, 96], [18, 108.5], [30, 108.5], [43, 108.5]], tg = function(q){ return [bx + q[0]*BW/100, by + q[1]*BW/100] }, ft = ["Storgatan 15", "Helsingborg", "3 rum", "74 m²"], fs0 = [x0 + 11, x0 + 13, x0 + 21, x0 + 29];
      for(i = 0; i < 4; i++) A8.flyChip(c, ft[i], fs0[i], wy + (i === 0 ? 14 : 20), tg(SL[i])[0], tg(SL[i])[1], tr, .9 + i*.4, .75, wa);
      sTx(c, "MALLEN FYLLS I AUTOMATISKT", 50, by + BW*1.25 + 8, wa*rev(tr, .9, .4), {size:2.6, weight:600, color:INK, align:"c", sp:.14});
      sTx(c, "Direkt från leveransen. Inget att skriva.", 50, by + BW*1.25 + 13, wa*rev(tr, 1.0, .4), {size:2.4, weight:500, color:MUT, align:"c"});
    }
    c.restore();
    brandVfoot(c, G, S, rev(tr, 0, .5)*(1 - rev(tr, 3.6, .4)));
  }
  if(t >= VB[2] && t < VB[3]){
    var u = t - VB[2], v = vis(u, 0, 4.0, .3, .35);
    brandV(c, G, S, v);
    var hy = S.y0 + (is9 ? 20 : 16);
    v3Text(c, "Och Reels.", MX, hy, {size:is9 ? 9 : 7.6, weight:300, color:INK, alpha:v*rev(u, .05, .3), p:oQ(k3(u, 0, .6))});
    v3Text(c, "Och annonstext.", MX, hy + (is9 ? 8.8 : 7.4), {size:is9 ? 9 : 7.6, weight:300, italic:true, color:OLI, alpha:v*rev(u, .3, .3), p:oQ(k3(u, .3, 1.0))});
    var pw = is9 ? 34 : 28, ph1 = pw*1.78, py = S.y0 + (is9 ? 42 : 32), pa = v*rev(u, .35, .4);
    c.save(); c.globalAlpha = pa; c.shadowColor = "rgba(30,25,20,.3)"; c.shadowBlur = 8; c.shadowOffsetY = 2; c.fillStyle = "#000"; rr(c, MX, py, pw, ph1, 2.2); c.fill(); c.shadowColor = "transparent"; c.save(); rr(c, MX, py, pw, ph1, 2.2); c.clip(); v3Photo(c, "rs_dusk1", MX, py, pw, ph1, {scale:lerp(1.1, 1.3, k3(u, 0, 4)), pos:[lerp(.35, .6, k3(u, 0, 4)), .5]}); v3Grad(c, MX, py + ph1*.55, pw, ph1*.45, [[0, "rgba(8,16,11,0)"], [1, "rgba(8,16,11,.8)"]]); c.restore();
    c.restore();
    v3Text(c, "ER", MX + pw/2, py + 8, {size:4.6, color:WHITE, align:"c", sp:.3, alpha:pa}); v3Text(c, "Till salu", MX + 3.2, py + ph1 - 14, {size:2.6, weight:600, f:"sans", sp:.2, color:WHITE, alpha:pa*rev(u, .8, .3)});
    v3Text(c, "Storgatan 15", MX + 3.2, py + ph1 - 7.4, {size:5, color:WHITE, alpha:pa*rev(u, .9, .3)}); v3Text(c, "3 RUM · 74 M²", MX + 3.2, py + ph1 - 3.4, {size:1.9, weight:500, f:"sans", sp:.1, color:"rgba(255,255,255,.85)", alpha:pa*rev(u, 1.0, .3)});
    sTx(c, "REELS", MX, py + ph1 + 5, pa, {size:2.1, weight:600, color:OLI, sp:.2});
    var cx2 = MX + pw + 5, cw2 = 100 - MX - cx2, ch2 = is9 ? 44 : 38, ca = v*rev(u, 1.0, .4);
    sCard(c, cx2, py, cw2, ch2, ca, 1.6, WHITE, 3);
    sTx(c, "ANNONSTEXT", cx2 + 3.4, py + 6, ca, {size:1.9, weight:600, color:OLI, sp:.2});
    ["Välkommen till", "Storgatan 15. En ljus", "trea med inglasad", "balkong och utsikt", "över Helsingborg."].forEach(function(l, k){ var ts = 1.4 + k*.4; sTx(c, l, cx2 + 3.4, py + 12.6 + k*4.2, ca*(u >= ts ? 1 : 0), {size:2.7, weight:500, color:INK, p:clamp(k3(u, ts, ts + .35), 0, 1)}) });
  }
  if(t >= VB[3] && t < VB[4]){
    var u2 = t - VB[3], v2 = vis(u2, 0, 3.4, .3, .35);
    brandV(c, G, S, v2);
    var hy2 = S.y0 + (is9 ? 20 : 16);
    v3Text(c, "Av samma bilder.", MX, hy2, {size:is9 ? 9 : 7.6, weight:300, color:INK, alpha:v2*rev(u2, .05, .3), p:oQ(k3(u2, 0, .6))});
    v3Text(c, "Direkt efter fotograferingen.", MX, hy2 + (is9 ? 8.8 : 7.4), {size:is9 ? 5.4 : 4.6, weight:300, italic:true, color:OLI, alpha:v2*rev(u2, .3, .3), p:oQ(k3(u2, .3, 1.0))});
    var rows = [["Inlägg", "Till salu, visning, såld"], ["Reels", "Av samma bilder"], ["Annonstext", "Skriven av Annonsskrivaren"]], ry = S.y0 + (is9 ? 42 : 34), rh = is9 ? 19 : 15;
    rows.forEach(function(r, k){
      var a = v2*rev(u2, .6 + k*.35, .3), y0 = ry + k*rh;
      sCard(c, MX, y0, 84, rh - 3, a, 1.4, WHITE, 3);
      v3Text(c, r[0], MX + 5, y0 + (rh - 3)*.62, {size:is9 ? 6.4 : 5.2, weight:400, color:INK, alpha:a});
      sTx(c, r[1], 100 - MX - 12, y0 + (rh - 3)*.58, a, {size:2.5, weight:500, color:MUT, align:"r"});
      A8.chk(c, 100 - MX - 6, y0 + (rh - 3)/2, 2.2, k3(u2, .8 + k*.35, 1.1 + k*.35), "#2f6a3a", .5);
    });
    sCard(c, MX, ry + 3*rh + 2, 84, is9 ? 13 : 11, v2*rev(u2, 1.9, .3), 1.4, "#dfeedd", 0);
    sTx(c, "60 DAGAR FRIA APPAR", 50, ry + 3*rh + 2 + (is9 ? 8 : 7), v2*rev(u2, 1.9, .3), {size:3, weight:600, color:"#2f6a3a", align:"c", sp:.2});
  }
  if(t >= VB[4]) endCard(c, G, t - VB[4]);
}
function brandVfoot(c, G, S, a){ /* ingen: håller tråden mellan scener */ }
function sndB(H){ for(var q = 0; q < 6; q++) H.s("shutter", q*.12, .26); H.s("tick2", .85, .07); H.s("shutter", 1.0, .3);
  [VB[1] + 1.3, VB[1] + 1.7, VB[1] + 2.1, VB[1] + 2.5].forEach(function(s){ H.s("tick1", s, .05) });
  H.s("tick2", VB[1] + 3.3, .08); [VB[2] + 1.4, VB[2] + 1.8, VB[2] + 2.2].forEach(function(s){ H.s("tick1", s, .05) });
  [.8, 1.15, 1.5].forEach(function(q){ H.s("tick2", VB[3] + q, .07) }); H.click(VB[4] + 1.8, .38) }

/* ---------- Video C · Viewlys nya standard, 18 s ---------- */
var VC = [0, 2.4, 4.6, 7.2, 9.6, 12.4, 14.4];
function lowerText(c, G, S, l1, l2, t0, u, dark){
  var is9 = G.is9, y = S.y1 - (is9 ? 30 : 22);
  var sz = Math.min(is9 ? 15 : 12, fz(c, l1, {size:is9 ? 15 : 12, weight:300}, 84));
  v3Text(c, l1, MX, y, {size:sz, weight:300, color:WHITE, alpha:rev(u, t0, .3), p:oQ(k3(u, t0, t0 + .6)), rise:2, shadow:true});
  if(l2) v3Text(c, l2, MX, y + (is9 ? 7 : 6), {size:is9 ? 3.4 : 3, weight:500, f:"sans", sp:.04, color:"rgba(255,255,255,.88)", alpha:rev(u, t0 + .35, .3), shadow:true});
}
function vC(c, G, t){
  var S = SR9(G), is9 = G.is9, i;
  var sc = [["rs_dusk1", [.5, .55], "Bostadsfoto.", "Professionella bilder i tre paket."], ["rs_dining", [.5, .6], "Planritning.", "Ingår vid fotografering."], ["rs_chair", [.5, .5], "Inlägg och Reels.", "Av dina levererade bilder."], ["bedroom", [.5, .55], "Annonstext.", "Skriven av Annonsskrivaren."]];
  if(t < VC[4]){
    var k = t < VC[1] ? 0 : t < VC[2] ? 1 : t < VC[3] ? 2 : 3, u = t - VC[k], d = sc[k], dur = VC[k + 1] - VC[k];
    pho(c, G, d[0], k3(u, 0, dur), .32, d[1]);
    v3Grad(c, 0, G.H*.5, 100, G.H*.5, [[0, "rgba(8,7,7,0)"], [1, "rgba(8,7,7,.62)"]]); v3Grad(c, 0, 0, 100, G.H*.25, [[0, "rgba(8,7,7,.45)"], [1, "rgba(8,7,7,0)"]]);
    v3Text(c, "VIEWLY", MX, S.y0 + 3, {size:2.4, weight:500, f:"sans", sp:.34, color:WHITE, alpha:.92}); v3Text(c, (k + 1) + " / 4", 100 - MX, S.y0 + 3, {size:2.1, weight:500, f:"sans", sp:.2, color:WHITE, align:"right" in {} ? "r" : "r", alpha:.8});
    lowerText(c, G, S, d[2], d[3], k === 0 ? 0 : .05, u);
    if(k === 2){ var pw = is9 ? 30 : 24, pa = rev(u, .8, .4), pe = oBack(k3(u, .8, 1.3)); c.save(); c.globalAlpha = pa; c.translate(100 - MX - pw/2, S.y0 + (is9 ? 44 : 34) + pw*.625); c.scale(lerp(.85, 1, pe), lerp(.85, 1, pe)); c.shadowColor = "rgba(0,0,0,.45)"; c.shadowBlur = 8; c.shadowOffsetY = 2; c.fillStyle = "#000"; rr(c, -pw/2, -pw*.625, pw, pw*1.25, pw*.025); c.fill(); c.shadowColor = "transparent"; A8.tplB(c, "salu", -pw/2, -pw*.625, pw, k3(u, 1.0, 2.2), A8.DO(0, "rs_dusk1", 0, 1)); c.restore() }
    if(k === 3){ var tx0 = ["Välkommen till Storgatan 15.", "En ljus trea med inglasad balkong", "och utsikt över Helsingborg."]; sCard(c, MX, S.y0 + (is9 ? 28 : 22), 84, is9 ? 18 : 15, rev(u, .5, .3)*.92, 1.4, "rgba(255,255,255,.94)", 3); tx0.forEach(function(l, q){ var ts = .8 + q*.45; sTx(c, l, MX + 4, S.y0 + (is9 ? 28 : 22) + 6.4 + q*4.2, rev(u, .5, .3)*(u >= ts ? 1 : 0), {size:2.9, weight:500, color:INK, p:clamp(k3(u, ts, ts + .4), 0, 1)}) }) }
    return;
  }
  if(t < VC[5]){
    var u3 = t - VC[4];
    v3Fill(c, 0, 0, 100, G.H, PAPER); brandV(c, G, S);
    var hy = S.y0 + (is9 ? 36 : 28);
    v3Text(c, "Allt från", MX, hy, {size:is9 ? 15 : 12.6, weight:300, color:INK, alpha:rev(u3, 0, .3), p:oQ(k3(u3, 0, .6))});
    v3Text(c, "samma leverans.", MX, hy + (is9 ? 13 : 11), {size:is9 ? 15 : 12.6, weight:300, italic:true, color:OLI, alpha:rev(u3, .3, .3), p:oQ(k3(u3, .3, 1.1))});
    var sy = hy + (is9 ? 26 : 22);
    ["Foto  ·  Planritning  ·  Inlägg", "Reels  ·  Annonstext"].forEach(function(l, q){ v3Text(c, l, MX, sy + q*5.4, {size:3.4, weight:500, f:"sans", sp:.04, color:INK, alpha:rev(u3, 1.0 + q*.25, .3)}) });
    v3Text(c, "Viewlys nya standard för bostadsmarknadsföring.", MX, sy + 16, {size:2.7, weight:500, f:"sans", color:MUT, alpha:rev(u3, 1.7, .4)});
    return;
  }
  if(t < VC[6]){
    var u4 = t - VC[5];
    pho(c, G, "rs_dusk2", k3(u4, 0, 2), .5, [.45, .5]); v3Grad(c, 0, 0, 100, G.H*.3, [[0, "rgba(8,7,7,.5)"], [1, "rgba(8,7,7,0)"]]);
    v3Text(c, "LANSERING  ·  NOV–DEC 2026", 50, S.y0 + 3, {size:2.2, weight:600, f:"sans", sp:.28, color:WHITE, align:"c", alpha:.92});
    var y4 = S.y0 + (S.y1 - S.y0)*.42;
    v3Text(c, "Halva priset.", 50, y4, {size:is9 ? 15 : 12.6, weight:300, color:WHITE, align:"c", alpha:rev(u4, 0, .3), p:oQ(k3(u4, 0, .6)), shadow:true});
    v3Text(c, "60 dagar fria appar.", 50, y4 + (is9 ? 11 : 9.4), {size:is9 ? 9.4 : 8, weight:300, italic:true, color:C3.cream, align:"c", alpha:rev(u4, .4, .3), p:oQ(k3(u4, .4, 1.0)), shadow:true});
    return;
  }
  endCard(c, G, t - VC[6]);
}
function sndC(H){ H.s("shutter", .05, .35); [VC[1], VC[2], VC[3]].forEach(function(s){ H.s("shutter", s, .5) }); H.s("tick1", VC[2] + 1.0, .05); H.s("tick1", VC[3] + .8, .05); H.s("tick1", VC[3] + 1.25, .05); H.s("shutter", VC[5], .4); H.click(VC[6] + 1.8, .38) }

/* ---------- registrera i systemet (statiska som kompositioner) ---------- */
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
regV("l_va", "A · Lanseringen", "Halva priset, planritning, 60 dagar fria appar.", 13.0, VA[4] + END_LOGO, vA, .9, sndA);
regV("l_vb", "B · Från foto till färdigt innehåll", "Foto in, inlägg ut: Content Studio, Reels och annonstext.", 18.0, VB[4] + END_LOGO, vB, 1.9, sndB);
regV("l_vc", "C · Viewlys nya standard", "Filmisk: bostadsfoto, planritning, inlägg, Reels och annonstext.", 18.4, VC[6] + END_LOGO, vC, 1.0, sndC);

/* ---------- storyboard ---------- */
var MUSIC = "Musik: ingen i filen. Om ni vill lägga på musik: lugn, minimal instrumental (piano eller mjuk elektronisk), 70–85 bpm, mixad lågt, eftersom många tittar utan ljud. Allt som betyder något står som text.";
var SB = {
  l_va:{rows:[
    [0, 1.7, "Hook", "Halva priset.\npå bostadsfotografering.\n50 % PÅ BAS, PLUS OCH PREMIUM", "Helbild på bostadsbild, texten syns i första bildrutan, långsam inzoomning.", "Kameraljud vid klippet."],
    [1.7, 4.4, "Priset", "50 % på Bas, Plus och Premium.\nBas 1 000 kr (ord. 2 000), Plus 1 750 kr (ord. 3 500), Premium 3 000 kr (ord. 6 000).\nLanseringspris, november–december.", "Raderna kommer in en och en, de ordinarie priserna stryks över. Hårt klipp från bilden.", "Tre låga tick."],
    [4.4, 6.9, "Foto och planritning", "Professionella bostadsbilder.\nPlanritning: Ingår vid fotografering.", "Tre bilder poppar in, en och en.", "Ett kameraljud per bild."],
    [6.9, 9.0, "Apparna", "60 dagar fria appar.\nContent Studio: Inlägg och Reels av dina bilder.\nAnnonsskrivare: Annonstext från leveransen.\nIngen bindningstid.", "Två kort kommer in, annonstexten skrivs fram.", "Två låga tick."],
    [9.0, 13.0, "Avslut", "Halva priset på din första fotografering.\nPlanritning ingår · 60 dagar fria appar · Ingen bindningstid.\nBoka fotografering · viewly.se/maklare", "Knappen trycks, adressen och loggan animeras in.", "Musklick och loggljud."]]},
  l_vb:{rows:[
    [0, 2.6, "Hook", "Foto in.\nInlägg ut.\nFOTOGRAFERAS → LEVERERAD", "Sex bilder poppar in med varsitt kameraljud, tre slår om till färdiga inlägg. Diskret status.", "Sex kameraljud, ett ping."],
    [2.6, 6.6, "Content Studio", "CONTENT STUDIO · LEVERERAD\nStorgatan 15 · Helsingborg · 3 rum · 74 m²\nMALLEN FYLLS I AUTOMATISKT\nDirekt från leveransen. Inget att skriva.", "Mallen visas med tomma fält. Adress, ort, rum och yta lyfts ur leveransen och landar i fälten.", "Fyra låga tick."],
    [6.6, 10.6, "Reels och annonstext", "Och Reels.\nOch annonstext.\nREELS · ANNONSTEXT", "Reelsen zoomar långsamt på bilden, annonstexten skrivs fram rad för rad.", "Tre låga tick."],
    [10.6, 14.0, "Samma bilder", "Av samma bilder.\nDirekt efter fotograferingen.\nInlägg · Reels · Annonstext\n60 DAGAR FRIA APPAR", "Tre rader bockas av, sedan det gröna kortet.", "Tre låga ping."],
    [14.0, 18.0, "Avslut", "Halva priset på din första fotografering.\nPlanritning ingår · 60 dagar fria appar · Ingen bindningstid.\nBoka fotografering · viewly.se/maklare", "Knappen trycks, adressen och loggan animeras in.", "Musklick och loggljud."]]},
  l_vc:{rows:[
    [0, 2.4, "Hook: bostadsfoto", "Bostadsfoto.\nProfessionella bilder i tre paket.", "Helbild, texten syns direkt, långsam inzoomning. Hårda klipp mellan bilderna.", "Kameraljud."],
    [2.4, 4.6, "Planritning", "Planritning.\nIngår vid fotografering.", "Hårt klipp, ny bild.", "Kameraljud."],
    [4.6, 7.2, "Inlägg och Reels", "Inlägg och Reels.\nAv dina levererade bilder.", "Ett färdigt inlägg faller på plats över bilden.", "Kameraljud, tick."],
    [7.2, 9.6, "Annonstext", "Annonstext.\nSkriven av Annonsskrivaren.", "Annonstexten skrivs fram i ett vitt kort.", "Kameraljud, tick."],
    [9.6, 12.4, "Helheten", "Allt från samma leverans.\nFoto · Planritning · Inlägg · Reels · Annonstext.\nViewlys nya standard för bostadsmarknadsföring.", "Ljus scen, texten kommer in rad för rad.", "Stilla."],
    [12.4, 14.4, "Erbjudandet", "LANSERING · NOV–DEC 2026\nHalva priset.\n60 dagar fria appar.", "Hårt klipp tillbaka till en bild.", "Kameraljud."],
    [14.4, 18.4, "Avslut", "Halva priset på din första fotografering.\nBoka fotografering · viewly.se/maklare", "Knappen trycks, adressen och loggan animeras in.", "Musklick och loggljud."]]}
};
function tfmt(x){ return x.toFixed(1).replace(".", ",") }
function storyboard(id){
  var d = SB[id], comp = V3_COMPS[id];
  return '<table class="l9sb"><tr><th>Tid</th><th>Scen</th><th>Text</th><th class="s">Animation och övergång</th><th class="s">Ljud</th></tr>' + d.rows.map(function(r){
    var mid = Math.min(comp.dur - .1, (r[0] + r[1])/2 + .35);
    return '<tr><td class="t">' + tfmt(r[0]) + '–' + tfmt(r[1]) + ' s</td><td><div style="display:flex;gap:10px;align-items:flex-start">' + v3Canvas("comp:" + id + ":916:" + mid.toFixed(2), 110) + '<b>' + esc9(r[2]) + '</b></div></td><td>' + esc9(r[3]).replace(/\n/g, "<br>") + '</td><td class="s">' + esc9(r[4]) + '</td><td class="s">' + esc9(r[5]) + '</td></tr>';
  }).join("") + '</table><p class="l9mus">' + esc9(MUSIC) + '</p>';
}
var VMETA = {
  l_va:{prim:"Halva priset på din första fotografering hos Viewly: 50 % på Bas, Plus och Premium i november och december. Planritning ingår, och du får 60 dagars fria appar. Ingen bindningstid.", head:"Halva priset på bostadsfotografering", desc:"Lansering nov–dec 2026 · Priser exkl. moms", btn:"Boka nu"},
  l_vb:{prim:"Efter fotograferingen blir dina bilder färdiga inlägg, Reels och annonstext. Content Studio och Annonsskrivaren hämtar adress, rum och yta från leveransen. 60 dagars fria appar när du bokar under lanseringen.", head:"Foto in. Inlägg ut.", desc:"60 dagar fria appar · 50 % på fotograferingen", btn:"Läs mer"},
  l_vc:{prim:"Bostadsfoto, planritning, inlägg, Reels och annonstext från samma leverans. Under lanseringen: halva priset och 60 dagars fria appar. Ingen bindningstid.", head:"Viewlys nya standard", desc:"Foto, planritning, Content Studio och Annonsskrivare", btn:"Boka nu"}
};
window.l9VideoSection = function(){
  var comp = V3_COMPS[V3S.comp], fn = V3S.fmt === "916" ? "9:16 · 1080 × 1920" : "4:5 · 1080 × 1350";
  return '<h3 class="a3sub">Videoannonser</h3><div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w45") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play" aria-label="Spela">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '" aria-label="Tid"></div><span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Video</div><div class="a3segs col">' + V3_ADS9.map(function(id){ return v3Seg("comp", id, V3_COMPS[id].n + " · " + V3_COMPS[id].dur.toFixed(0) + " s", V3S.comp === id) }).join("") + '</div>'
    + '<div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Reel · 9:16", V3S.fmt === "916") + v3Seg("fmt", "45", "Flöde · 4:5", V3S.fmt === "45") + '</div>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + comp.n + " · " + fn + ' · med ljud</button></div></div></div>'
    + '<h3 class="a3sub">Storyboard · ' + esc9(comp.n) + '</h3>' + storyboard(V3S.comp)
    + '<div class="l9meta" style="margin-top:6px">' + metaBlock(VMETA[V3S.comp]).replace('<div class="l9meta">', "").replace(/<\/div>$/, "") + '</div>';
};
window.A9K = {AD9:AD9, OFFER:OFFER, INK:INK, PAPER:PAPER, MUT:MUT, OLI:OLI, GRN:GRN, brand:brand, cta:cta};

/* ---------- sidan ---------- */
function esc9(x){ return String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") }
function metaBlock(m){ return '<div class="l9meta"><b>Primärtext</b><p>' + esc9(m.prim) + '</p><b>Rubrik</b><p>' + esc9(m.head) + '</p><b>Beskrivning</b><p>' + esc9(m.desc) + '</p><b>Knapp · länk</b><p>' + esc9(m.btn) + ' · viewly.se/maklare</p></div>' }
function staticCards(){
  return V3_ADS9S.map(function(id, i){
    var k = "ABCD"[i], d = AD9[k];
    return '<div class="l9card"><div class="l9pair">'
      + '<div class="l9fmt"><div class="l9th">' + v3Canvas("comp:" + id + ":45:0", 420) + '</div><div class="l9fm"><span class="mono">4:5 · 1080 × 1350</span><button type="button" class="a3mini" data-a3="png" data-v="comp:' + id + ':45:0">PNG</button></div></div>'
      + '<div class="l9fmt"><div class="l9th">' + v3Canvas("comp:" + id + ":916:0", 330) + '</div><div class="l9fm"><span class="mono">9:16 · 1080 × 1920</span><button type="button" class="a3mini" data-a3="png" data-v="comp:' + id + ':916:0">PNG</button></div></div>'
      + '</div><div class="l9txt"><h4>' + esc9(d.n) + '</h4><p class="l9q">' + esc9(d.svar) + '</p>' + metaBlock(d.meta) + '</div></div>';
  }).join("");
}
var L9CSS = '<style>.l9card{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:28px;padding:26px 0;border-top:1px solid rgba(28,28,30,.12)}.l9pair{display:grid;grid-template-columns:1.25fr 1fr;gap:18px;align-items:start}.l9th canvas{width:100%;height:auto;display:block;border-radius:6px;box-shadow:0 2px 14px rgba(30,25,20,.14)}.l9fm{display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:11px;color:#6f6a65}.l9txt h4{font:400 24px/1.15 "Cormorant Garamond",Georgia,serif;margin:0 0 4px}.l9q{font-size:13px;color:#6f6a65;margin:0 0 14px;font-style:italic}.l9meta b{display:block;font:600 10px/1 Montserrat,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#6E7266;margin:12px 0 4px}.l9meta p{margin:0;font-size:13px;line-height:1.5}.l9sb{width:100%;border-collapse:collapse;margin-top:14px}.l9sb td,.l9sb th{border-top:1px solid rgba(28,28,30,.12);padding:12px 10px 12px 0;vertical-align:top;font-size:12.5px;line-height:1.45;text-align:left}.l9sb th{font:600 10px/1 Montserrat,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#6E7266}.l9sb td.t{white-space:nowrap;font-family:ui-monospace,Menlo,monospace;font-size:11.5px}.l9sb canvas{width:96px;height:auto;display:block;border-radius:4px;box-shadow:0 1px 8px rgba(30,25,20,.14)}.l9mus{margin:14px 0 0;font-size:12.5px;color:#6f6a65}@media (max-width:860px){.l9card{grid-template-columns:1fr}.l9pair{grid-template-columns:1fr 1fr}.l9sb td.s{display:none}.l9sb th.s{display:none}}</style>';
window.secAds9 = function(){
  var vid = window.V3_ADS9 || [];
  if(vid.length && vid.indexOf(V3S.comp) < 0){ V3S.comp = vid[0]; V3S.t = V3_COMPS[vid[0]].thumb; V3S.playing = false; v3StopSound() }
  if(V3S.fmt !== "916" && V3S.fmt !== "45") V3S.fmt = "916";
  setTimeout(v3Mount, 0);
  var html = L9CSS + '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 17 · bygge 51</div><h2>Lansering</h2>'
    + '<p>Lanseringserbjudandet i november och december 2026: fyra statiska annonser och tre videor, färdiga att ladda ner. Förslag, inget publicerat.</p></div>'
    + '<h3 class="a3sub">Statiska annonser</h3>' + staticCards();
  if(window.l9VideoSection) html += window.l9VideoSection();
  return html + '</div>';
};
})();
