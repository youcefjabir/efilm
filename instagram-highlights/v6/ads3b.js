/* =====================================================================
   ADS 3 — del B: scener, kompositioner, statiska annonser

   Budskapet, i den ordning en mäklare tar in det:
     1. Fotona är bra.                    (foto först)
     2. De är levererade, och portalen    (Mäklarportalen: Skapa kampanj,
        gör kampanjen åt dig.              välj bild — två klick)
     3. Två klick. Inte två timmar.       (inlägget i alla format)
     4. Och det är bara en del av Viewly. (tjänsterna, verifierade på siten)
     5. Varumärket, en egen sekund.       (slutkort, flera varianter)

   Tempot är avsiktligt lugnt: varje rad avslöjas under ungefär en sekund
   och står kvar minst lika länge innan den lämnar bilden.
   ===================================================================== */

function v3Geo(fmt){
  var is9 = fmt === "916", H = is9 ? 177.78 : 125, top = is9 ? 26 : 8, bot = is9 ? 31.5 : 8;
  var g = {is9:is9, H:H, top:top, bot:bot, cy:(top + H - bot)/2, fmt:fmt};
  g.CW = is9 ? 78 : 70; g.CH = g.CW*1.25; g.CX = (100 - g.CW)/2; g.CY = g.cy - g.CH/2;
  g.labY = top + (is9 ? 13 : 10.5); g.headY = g.labY + (is9 ? 10.5 : 9.5); g.statY = g.headY + (is9 ? 6.2 : 5.4);
  g.gridY = g.statY + (is9 ? 8 : 6.4); g.th = is9 ? 32 : 24; g.tw = 26.4;
  g.btnY = g.gridY + 2*g.th + 2.4 + (is9 ? 7 : 5.4); g.btnH = is9 ? 10.5 : 9;
  return g;
}
function v3Mix(a, b, p){ return [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p), lerp(a[3], b[3], p)] }
function v3Shadow(c, r, a, blur){
  c.save(); c.shadowColor = "rgba(0,0,0," + a + ")"; c.shadowBlur = blur; c.shadowOffsetY = blur*.3;
  c.fillStyle = "#000"; c.fillRect(r[0], r[1], r[2], r[3]); c.restore();
}
function v3NavyBg(c, G, a, t){
  c.save(); c.globalAlpha = a;
  v3Photo(c, "blur", 0, 0, 100, G.H, {scale:1.3 + .02*Math.sin((t || 0)*.25), pos:[.5 + .02*Math.sin((t || 0)*.2), .5]});
  c.fillStyle = "rgba(15,32,48,.7)"; c.fillRect(0, 0, 100, G.H);
  v3Grad(c, 0, 0, 100, G.H, [[0, "rgba(8,18,28,.35)"], [.5, "rgba(8,18,28,0)"], [1, "rgba(8,18,28,.4)"]]);
  c.restore();
}
function v3Cursor(c, x, y, press, a){
  c.save(); c.globalAlpha = a == null ? 1 : a; c.translate(x, y); var s = (1 - press*.14)*.26; c.scale(s, s);
  c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 6; c.shadowOffsetY = 2;
  c.beginPath(); c.moveTo(2, 2); c.lineTo(2, 28); c.lineTo(9, 21.4); c.lineTo(13.6, 31.8); c.lineTo(17.8, 29.9); c.lineTo(13.2, 19.7); c.lineTo(23, 19.4); c.closePath();
  c.fillStyle = "#161616"; c.fill(); c.shadowColor = "transparent"; c.lineWidth = 1.8; c.strokeStyle = "#fff"; c.lineJoin = "round"; c.stroke(); c.restore();
}
function v3Click(c, x, y, label, p){
  if(p <= 0 || p >= 1) return;
  var a = k3(p, 0, .15)*(1 - k3(p, .75, 1)), ry = (1 - oQ(k3(p, 0, .5)))*3;
  /* ring */
  var rp = oQ(k3(p, 0, .6));
  c.save(); c.globalAlpha = (1 - rp)*.8; c.strokeStyle = C3.sand; c.lineWidth = .35; c.beginPath(); c.arc(x, y, 1.2 + rp*6, 0, Math.PI*2); c.stroke(); c.restore();
  var o = {size:1.75, weight:600, f:"sans", sp:.3}, w = v3Measure(c, label, o) + 5.6, px = x + 4, py = y - 10 + ry;
  c.save(); c.globalAlpha = a; c.fillStyle = C3.navy; c.beginPath();
  var h = 4.6, r = h/2; c.moveTo(px + r, py); c.arcTo(px + w, py, px + w, py + h, r); c.arcTo(px + w, py + h, px, py + h, r); c.arcTo(px, py + h, px, py, r); c.arcTo(px, py, px + w, py, r); c.fill();
  c.restore();
  v3Text(c, label, px + w/2, py + 3.1, {size:1.75, weight:600, f:"sans", sp:.3, color:"#fff", align:"c", alpha:a});
}

/* —— Mäklarportalen ————————————————————————————————————————————— */
function v3Portal(c, G, t, ua){
  var ink = C3.ink, mut = C3.mut, m = 8;
  var mode = ioC(k3(t, 8.0, 8.7));
  var sel = k3(t, 9.7, 9.95);
  var tl = ["home", "dining", "beige", "bedroom", "terrace", "house"];
  /* sidhuvud */
  var q = oQ(k3(t, 4.4, 5.3));
  c.save(); c.globalAlpha = ua*q;
  v3Lock(c, 0, G.top + 2.2, 2.4, ink, C3.oli, {left:m});
  v3Text(c, "MÄKLARPORTALEN", 100 - m, G.top + 3, {size:1.8, weight:500, f:"sans", sp:.24, color:mut, align:"r"});
  c.restore();
  v3Line(c, m, 100 - m, G.top + 7.4, C3.uil, .2, oQ(k3(t, 4.5, 5.6)), ua);
  /* rubriker */
  var q2 = oQ(k3(t, 4.8, 5.8));
  v3Text(c, "STORGATAN 13 · LANDSKRONA", m, G.labY, {size:1.95, weight:500, f:"sans", sp:.24, color:mut, alpha:ua, p:q2});
  var hs = G.is9 ? 9.2 : 7.8, q3 = oQ(k3(t, 5.1, 6.2));
  v3Text(c, "12 bilder levererade", m, G.headY, {size:hs, color:ink, alpha:ua*(1 - mode), p:q3, rise:1.6});
  v3Text(c, "Välj en bild.", m, G.headY, {size:hs, color:ink, alpha:ua*mode, p:mode, rise:1.6});
  c.save(); c.globalAlpha = ua*oQ(k3(t, 5.6, 6.4)); c.fillStyle = C3.green; c.beginPath(); c.arc(m + .95, G.statY - .75, .95, 0, Math.PI*2); c.fill(); c.restore();
  v3Text(c, "Levererad idag 09:41", m + 3.2, G.statY, {size:2.3, weight:400, f:"sans", color:mut, alpha:ua*(1 - mode)*oQ(k3(t, 5.6, 6.4))});
  v3Text(c, "Bilden blir kampanjens motiv", m + 3.2, G.statY, {size:2.3, weight:400, f:"sans", color:mut, alpha:ua*mode});
  /* bildrutor */
  tl.forEach(function(nm, i){
    var col = i % 3, row = Math.floor(i/3), x = m + col*(G.tw + 2.4), y = G.gridY + row*(G.th + 2.4);
    if(i === 0) return;
    var qi = oQ(k3(t, 5.4 + i*.15, 6.2 + i*.15)), dim = lerp(1, .3, ioC(k3(t, 9.9, 10.3)));
    var yy = y + (1 - qi)*3;
    c.save(); c.globalAlpha = ua*qi*dim;
    v3Photo(c, nm, x, yy, G.tw, G.th);
    if(i === 5){ v3Fill(c, x, yy, G.tw, G.th, "#120f10", .55); v3Text(c, "+7", x + G.tw/2, yy + G.th/2 + 2.4, {size:7, color:"#fff", align:"c"}) }
    if(mode > 0){ c.globalAlpha = ua*qi*dim*mode*.5; c.strokeStyle = ink; c.lineWidth = .22; c.strokeRect(x, yy, G.tw, G.th) }
    c.restore();
  });
  /* knappen */
  var bq = oQ(k3(t, 6.0, 6.9)), hover = ioC(k3(t, 7.35, 7.7)), press = k3(t, 7.8, 7.9)*(1 - k3(t, 7.95, 8.1)), bout = ioC(k3(t, 8.1, 8.7));
  if(bout < 1){
    var by = G.btnY + (1 - bq)*3 + bout*5, ba = ua*bq*(1 - bout);
    c.save(); c.globalAlpha = ba; c.fillStyle = hover > 0 ? "#2d302b" : ink;
    var sc = 1 - press*.02, bw = 100 - 2*m; c.translate(50, by + G.btnH/2); c.scale(sc, sc); c.fillRect(-bw/2, -G.btnH/2, bw, G.btnH); c.restore();
    v3Text(c, "SKAPA KAMPANJ", 50 + 1.8, by + G.btnH/2 + 1, {size:2.6, weight:500, f:"sans", sp:.26, color:"#fff", align:"c", alpha:ba});
    v3Text(c, "+", 50 - 17, by + G.btnH/2 + 1.3, {size:4, weight:300, f:"sans", color:"#fff", align:"c", alpha:ba});
  }
}

/* —— Hook + portal + montering (flödet) ——————————————————————————— */
var V3_FLOW_END = 16.6;
function v3Flow(c, G, t, o){
  o = o || {};
  var H = G.H, FULL = [0, 0, 100, H], TILE = [8, G.gridY, G.tw, G.th], CARD = [G.CX, G.CY, G.CW, G.CH];
  var hook = o.hook || ["En fotografering.", "Mer att arbeta med."];
  v3Fill(c, 0, 0, 100, H, C3.dark);
  var nb = ioC(k3(t, 10.2, 11.2));
  if(nb > 0) v3NavyBg(c, G, nb, t);
  var ub = ioC(k3(t, 4.0, 5.0))*(1 - ioC(k3(t, 10.2, 11.0)));
  if(ub > 0){ v3Fill(c, 0, 0, 100, H, C3.ui, ub); v3Portal(c, G, t, ub) }

  /* fotot */
  var q1 = ioQ(k3(t, 4.0, 5.4)), q3 = ioQ(k3(t, 10.4, 11.8));
  var sc = lerp(1.14, 1.02, ioC(k3(t, 0, 5)));
  if(t < 11.8){
    var r = FULL;
    if(t >= 4.0) r = v3Mix(FULL, TILE, q1);
    if(t >= 10.4) r = v3Mix(TILE, CARD, q3);
    var s2 = t >= 4.0 ? lerp(sc, 1, q1) : sc;
    if(t >= 4.2) v3Shadow(c, r, (t >= 10.4 ? .55*q3 + .12*(1 - q3) : .16*k3(t, 4.2, 5.4)), t >= 10.4 ? 5 : 2);
    v3Photo(c, "home", r[0], r[1], r[2], r[3], {scale:s2});
    /* markering av vald bild */
    var rk = k3(t, 9.7, 10.0)*(1 - k3(t, 10.4, 10.9));
    if(rk > 0){
      c.save(); c.globalAlpha = rk; c.strokeStyle = C3.ink; c.lineWidth = .5; c.strokeRect(TILE[0] - .9, TILE[1] - .9, TILE[2] + 1.8, TILE[3] + 1.8);
      c.fillStyle = C3.oli; c.beginPath(); c.arc(TILE[0] + TILE[2] - .4, TILE[1] - .4, 2.4*oBack(k3(t, 9.75, 10.05)), 0, Math.PI*2); c.fill();
      c.strokeStyle = "#fff"; c.lineWidth = .4; c.beginPath(); c.moveTo(TILE[0] + TILE[2] - 1.5, TILE[1] - .3); c.lineTo(TILE[0] + TILE[2] - .6, TILE[1] + .6); c.lineTo(TILE[0] + TILE[2] + .9, TILE[1] - 1.3); c.stroke(); c.restore();
    }
  } else if(t < 16.4){
    var prog = k3(t, 12.2, 15.4), lift = 0;
    var zoom = 1 + .025*k3(t, 11.8, 16.6);
    v3Shadow(c, [CARD[0], CARD[1], CARD[2], CARD[3]], .55, 5);
    v3Post(c, o.tpl || "overlay", "tillsalu", "home", CARD[0], CARD[1], CARD[2], 1.25, prog, {zoom:zoom});
  }

  /* markör och klick */
  if(t >= 6.5 && t < 11.2){
    var bx = 50 + 6, by = G.btnY + G.btnH*.55, tx = TILE[0] + TILE[2]*.58, ty = TILE[1] + TILE[3]*.62;
    var mA = ioC(k3(t, 6.5, 7.8)), mB = ioC(k3(t, 8.7, 9.6)), cx, cy;
    if(t < 8.7){ cx = lerp(96, bx, mA); cy = lerp(G.H - 16, by, mA) - Math.sin(mA*Math.PI)*4 }
    else { cx = lerp(bx, tx, mB); cy = lerp(by, ty, mB) - Math.sin(mB*Math.PI)*3 }
    var pr = Math.max(k3(t, 7.8, 7.9)*(1 - k3(t, 7.95, 8.1)), k3(t, 9.7, 9.8)*(1 - k3(t, 9.85, 10.0)));
    v3Cursor(c, cx, cy, pr, k3(t, 6.5, 6.9)*(1 - k3(t, 10.5, 10.9)));
    v3Click(c, bx, by, "KLICK 1", k3(t, 7.8, 9.2));
    v3Click(c, tx, ty, "KLICK 2", k3(t, 9.7, 11.0));
  }

  /* hooken */
  if(t < 4.8){
    var out = 1 - ioC(k3(t, 3.9, 4.5)), top = G.top, yb = H - G.bot - 28;
    v3Grad(c, 0, H*.42, 100, H*.58, [[0, "rgba(14,11,11,0)"], [1, "rgba(14,11,11,.78)"]], out);
    v3Grad(c, 0, 0, 100, H*.24, [[0, "rgba(14,11,11,.5)"], [1, "rgba(14,11,11,0)"]], out);
    v3Frame(c, 4, 4, 92, H - 8, "#fff", .26, oQ(k3(t, .2, 1.8)), .5*out);
    v3Text(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, top + 4, {size:2, weight:500, f:"sans", sp:.3, color:"#fff", align:"c", alpha:.92*out, p:oQ(k3(t, .5, 1.7))});
    v3Text(c, hook[0], 50, yb, {size:11.2, color:"#fff", align:"c", alpha:out, p:oQ(k3(t, 1.0, 2.5)), rise:2, shadow:true});
    v3Text(c, hook[1], 50, yb + 13.6, {size:10.4, italic:true, color:C3.cream, align:"c", alpha:out, p:oQ(k3(t, 2.2, 3.7)), rise:2, shadow:true});
  }
}

/* —— Två klick. Inte två timmar. ————————————————————————————————— */
function v3Trio(c, G, t, t0, o){
  o = o || {};
  var is9 = G.is9, H = G.H, a = ioC(k3(t, t0, t0 + .5))*(o.exit ? 1 - ioC(k3(t, t0 + 4.6, t0 + 5.2)) : 1);
  var sw = is9 ? 23 : 21, mw = is9 ? 34 : 31, qw = is9 ? 28 : 25, gap = 3;
  var total = sw + mw + qw + 2*gap, x0 = (100 - total)/2, base = is9 ? G.top + 62 : G.top + 49;
  var main = [G.CX, G.CY, G.CW, G.CH];
  var final = [x0 + sw + gap, base - mw*1.25, mw, mw*1.25];
  var qm = ioQ(k3(t, t0, t0 + 1.4)), qs = ioQ(k3(t, t0 + .6, t0 + 2.0));
  var r = v3Mix(main, final, qm);
  var cx = r[0] + r[2]/2;
  var left = [x0, base - sw*1.7778, sw, sw*1.7778], right = [x0 + sw + gap + mw + gap, base - qw, qw, qw];
  var lr = v3Mix([cx - sw/2, left[1], sw, left[3]], left, qs), rr = v3Mix([cx - qw/2, right[1], qw, right[3]], right, qs);
  c.save(); c.globalAlpha = a;
  c.save(); c.globalAlpha = a*qs; v3Shadow(c, lr, .4, 4); v3Post(c, "overlay", "tillsalu", "home", lr[0], lr[1], lr[2], 1.7778, 1); c.restore();
  c.save(); c.globalAlpha = a*qs; v3Shadow(c, rr, .4, 4); v3Post(c, "overlay", "tillsalu", "home", rr[0], rr[1], rr[2], 1, 1); c.restore();
  v3Shadow(c, r, .5, 5); v3Post(c, "overlay", "tillsalu", "home", r[0], r[1], r[2], 1.25, 1);
  c.restore();
  /* format-etiketter */
  var ly = base + 4.4, la = oQ(k3(t, t0 + 1.8, t0 + 2.6));
  [[left, "9:16"], [r, "4:5"], [right, "1:1"]].forEach(function(f){
    v3Text(c, f[1], f[0][0] + f[0][2]/2, ly, {size:1.9, weight:500, f:"sans", sp:.3, color:"#fff", align:"c", alpha:.75*la});
  });
  /* texten */
  var ty = base + (is9 ? 27 : 20), s1 = is9 ? 16 : 12.4;
  v3Text(c, "Två klick.", 50, ty, {size:s1, color:"#fff", align:"c", p:oQ(k3(t, t0 + 1.6, t0 + 3.0)), rise:2.4, alpha:a});
  v3Text(c, "Inte två timmar.", 50, ty + s1*.98, {size:s1, italic:true, color:C3.sand, align:"c", p:oQ(k3(t, t0 + 2.6, t0 + 4.0)), rise:2.4, alpha:a});
  v3Text(c, "FRÅN LEVERANS TILL FÄRDIGA INLÄGG", 50, ty + s1*.98 + (is9 ? 12 : 9.4), {size:2, weight:500, f:"sans", sp:.28, color:"#fff", align:"c", alpha:.8*oQ(k3(t, t0 + 3.6, t0 + 4.6))*a});
}

/* —— Och det är bara en del av Viewly ——————————————————————————————— */
function v3Statement(c, G, t, t0){
  var a = (1 - ioC(k3(t, t0 + 3.2, t0 + 3.8)));
  var y = G.cy - 2;
  v3Text(c, "Och det är bara", 50, y, {size:G.is9 ? 12 : 10, color:"#fff", align:"c", p:oQ(k3(t, t0 + .3, t0 + 1.6)), rise:2.4, alpha:a});
  v3Text(c, "en del av Viewly.", 50, y + (G.is9 ? 14 : 11.6), {size:G.is9 ? 12 : 10, italic:true, color:C3.sand, align:"c", p:oQ(k3(t, t0 + 1.2, t0 + 2.6)), rise:2.4, alpha:a});
  v3Line(c, 42, 58, y + (G.is9 ? 24 : 19), C3.sand, .3, oQ(k3(t, t0 + 2.2, t0 + 3.0)), a);
}
var V3_SERV = ["Fotografering", "Skymning", "3D-visning", "E-styling", "Drönare", "Områdeskartor", "Verktyg för mäklare"];
function v3Services(c, G, t, t0){
  var H = G.H, a = ioC(k3(t, t0, t0 + .8))*(1 - ioC(k3(t, t0 + 4.3, t0 + 4.9)));
  var ph = H*(G.is9 ? .44 : .36);
  c.save(); c.globalAlpha = a;
  v3Photo(c, "house", 0, 0, 100, ph + 12, {scale:1.04 + .03*k3(t, t0, t0 + 5), pos:[.5, .74]});
  v3Grad(c, 0, ph - 24, 100, 36, [[0, "rgba(15,32,48,0)"], [1, C3.navy]]);
  v3Fill(c, 0, ph + 12, 100, H - ph - 12, C3.navy);
  c.restore();
  v3Text(c, "VIEWLY GÖR MER ÄN BARA FOTOGRAFERING", 50, G.top + 4, {size:1.95, weight:500, f:"sans", sp:.28, color:"#fff", align:"c", alpha:.9*a, p:oQ(k3(t, t0 + .4, t0 + 1.4))});
  var y0 = ph + (G.is9 ? 8 : 5), step = G.is9 ? 10.8 : 8.6, fs = G.is9 ? 7.6 : 6.4;
  V3_SERV.forEach(function(s, i){
    var q = oQ(k3(t, t0 + 1.0 + i*.38, t0 + 1.9 + i*.38)), y = y0 + i*step;
    v3Text(c, String(i + 1).padStart(2, "0"), 10, y - fs*.22, {size:1.9, weight:500, f:"sans", sp:.2, color:C3.sand, alpha:a*q});
    v3Text(c, s, 19, y, {size:fs, color:"#fff", alpha:a, p:q, rise:1.6});
    v3Line(c, 19, 90, y + 2.8, "#fff", .15, q, .18*a);
  });
}

/* —— Slutkort: en egen sekund för varumärket ———————————————————————— */
var V3_OUT = [
  {id:"marin",   n:"Marin · stor logga"},
  {id:"papper",  n:"Papper · stor logga"},
  {id:"stapel",  n:"Stapel · märke över ordbild"},
  {id:"foto",    n:"Över foto · skymning"},
  {id:"bokstav", n:"Bokstav för bokstav"},
  {id:"marke",   n:"Märket först, ordbilden glider ut"},
  {id:"ordbild", n:"Foto i ordbilden"}
];
var V3_TAG = ["En bostadsfotograf som gör", "mer än bara fotografering."];
function v3Outro(c, G, id, t, o){
  o = o || {}; var H = G.H, cy = G.cy, dark = id === "marin" || id === "bokstav" || id === "ordbild";
  var ink = dark || id === "foto" ? "#fff" : C3.ink, dot = dark || id === "foto" ? C3.sand : C3.oli, bgc = dark ? C3.navy : C3.paper;
  var a = o.noFade ? 1 : ioC(k3(t, 0, .6));
  c.save(); c.globalAlpha = a;
  if(id === "foto"){
    v3Photo(c, "terrace", 0, 0, 100, H, {scale:1.08 - .04*k3(t, 0, 4.6)});
    v3Fill(c, 0, 0, 100, H, "#0c1824", .62);
    v3Grad(c, 0, 0, 100, H, [[0, "rgba(10,20,32,.4)"], [.5, "rgba(10,20,32,.1)"], [1, "rgba(10,20,32,.55)"]]);
  } else if(id === "ordbild"){
    v3Fill(c, 0, 0, 100, H, C3.navyD);
  } else v3Fill(c, 0, 0, 100, H, bgc);
  c.restore();
  var A = a;
  var capH = G.is9 ? 7.3 : 6.8;
  if(id === "marin" || id === "papper" || id === "foto"){
    var lp = oQ(k3(t, .5, 1.7)), y = cy - (G.is9 ? 14 : 12);
    v3Lock(c, 50, y, capH, ink, dot, {pm:lp, pd:oQ(k3(t, 1.2, 2.0)), pw:oQ(k3(t, .8, 2.0)), alpha:A});
    v3Line(c, 42, 58, y + capH*1.9, dot, .3, oQ(k3(t, 1.8, 2.6)), A);
    v3Text(c, V3_TAG[0], 50, y + capH*1.9 + 10, {size:G.is9 ? 6 : 5.2, color:ink, align:"c", p:oQ(k3(t, 2.0, 3.0)), rise:1.6, alpha:A});
    v3Text(c, V3_TAG[1], 50, y + capH*1.9 + 10 + (G.is9 ? 7.4 : 6.4), {size:G.is9 ? 6 : 5.2, italic:true, color:id === "papper" ? C3.oli : C3.sand, align:"c", p:oQ(k3(t, 2.5, 3.5)), rise:1.6, alpha:A});
    v3Text(c, "FÖR FASTIGHETSMÄKLARE I SKÅNE", 50, H - G.bot - 8, {size:1.95, weight:500, f:"sans", sp:.28, color:ink, align:"c", alpha:.75*A*oQ(k3(t, 3.0, 3.8))});
    v3Text(c, "VIEWLY.SE/MAKLARE", 50, H - G.bot - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:ink, align:"c", alpha:A*oQ(k3(t, 3.2, 4.0))});
  } else if(id === "stapel"){
    var mh = G.is9 ? 26 : 21, y2 = cy - (G.is9 ? 24 : 20);
    v3Mark(c, 50 - mh*858.6/756.3/2, y2, mh, ink, dot, {reveal:oQ(k3(t, .4, 1.6)), dot:oQ(k3(t, 1.2, 2.0)), alpha:A});
    var fs = G.is9 ? 12 : 10.4;
    v3Text(c, "VIEWLY", 50, y2 + mh + fs*1.35, {size:fs, weight:500, f:"sans", sp:.3, color:ink, align:"c", p:oQ(k3(t, 1.3, 2.5)), rise:2, alpha:A});
    v3Line(c, 42, 58, y2 + mh + fs*1.35 + 7, dot, .3, oQ(k3(t, 2.2, 3.0)), A);
    v3Text(c, V3_TAG[0] + " " + V3_TAG[1], 50, y2 + mh + fs*1.35 + 16, {size:G.is9 ? 3.6 : 3.2, italic:true, color:C3.oli, align:"c", p:oQ(k3(t, 2.6, 3.6)), alpha:A});
    v3Text(c, "FÖR FASTIGHETSMÄKLARE I SKÅNE", 50, H - G.bot - 8, {size:1.95, weight:500, f:"sans", sp:.28, color:C3.mut, align:"c", alpha:A*oQ(k3(t, 3.0, 3.8))});
    v3Text(c, "VIEWLY.SE/MAKLARE", 50, H - G.bot - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:C3.ink, align:"c", alpha:A*oQ(k3(t, 3.2, 4.0))});
  } else if(id === "bokstav"){
    var y3 = cy - (G.is9 ? 12 : 10);
    v3Lock(c, 50, y3, capH, "#fff", C3.sand, {pm:oQ(k3(t, .4, 1.4)), pd:oQ(k3(t, 1.0, 1.8)), letters:k3(t, .9, 2.8), alpha:A});
    v3Line(c, 42, 58, y3 + capH*1.9, C3.sand, .3, oQ(k3(t, 2.6, 3.3)), A);
    v3Text(c, V3_TAG[0] + " " + V3_TAG[1], 50, y3 + capH*1.9 + 9, {size:G.is9 ? 3.8 : 3.3, italic:true, color:C3.cream, align:"c", p:oQ(k3(t, 3.0, 4.0)), alpha:A});
    v3Text(c, "VIEWLY.SE/MAKLARE", 50, H - G.bot - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:"#fff", align:"c", alpha:A*oQ(k3(t, 3.4, 4.2))});
  } else if(id === "marke"){
    var y4 = cy - (G.is9 ? 12 : 10), mh2 = capH*1.55, mw2 = mh2*858.6/756.3;
    var fs2 = capH/.7, wo = {size:fs2, weight:500, f:"sans", sp:.2}, ww = v3Measure(c, "VIEWLY", wo), gap = capH*.95, tot = mw2 + gap + ww;
    var slide = ioQ(k3(t, 1.5, 2.8)), ms = lerp(2.6, 1, ioQ(k3(t, .3, 1.5)));
    var xC = 50 - mw2*ms/2, xL = 50 - tot/2, mx = lerp(xC, xL, slide);
    v3Mark(c, mx - (mh2*ms - mh2)*.5*(1 - slide)*0, y4 - mh2*ms/2, mh2*ms, C3.ink, C3.oli, {alpha:A*oQ(k3(t, .2, .8)), dot:oQ(k3(t, 1.0, 1.7))});
    var wx = xL + mw2 + gap;
    c.save(); c.beginPath(); c.rect(xL + mw2 + 1, y4 - capH*2, ww + gap + 3, capH*4); c.clip();
    v3Text(c, "VIEWLY", wx - (1 - slide)*(ww + gap), y4 + capH/2 + capH*.02, {size:fs2, weight:500, f:"sans", sp:.2, color:C3.ink, alpha:A*slide});
    c.restore();
    v3Line(c, 42, 58, y4 + capH*1.9, C3.oli, .3, oQ(k3(t, 2.6, 3.3)), A);
    v3Text(c, V3_TAG[0] + " " + V3_TAG[1], 50, y4 + capH*1.9 + 9, {size:G.is9 ? 3.8 : 3.3, italic:true, color:C3.oli, align:"c", p:oQ(k3(t, 3.0, 4.0)), alpha:A});
    v3Text(c, "VIEWLY.SE/MAKLARE", 50, H - G.bot - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:C3.ink, align:"c", alpha:A*oQ(k3(t, 3.4, 4.2))});
  } else {   /* ordbild: foto i bokstäverna */
    var w20 = v3Measure(c, "VIEWLY", {size:20, weight:700, f:"sans", sp:.06}), fs3 = 20*80/w20, y5 = cy + 4, wo3 = {size:fs3, weight:700, f:"sans", sp:.06};
    var w3 = v3Measure(c, "VIEWLY", wo3), reveal = oQ(k3(t, .6, 2.2));
    var off = V3.off || (V3.off = document.createElement("canvas")), cw = c.canvas.width, ch = c.canvas.height;
    if(off.width !== cw || off.height !== ch){ off.width = cw; off.height = ch }
    var oc = off.getContext("2d"), kk = cw/100; oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, cw, ch); oc.setTransform(kk, 0, 0, kk, 0, 0);
    oc.globalCompositeOperation = "source-over";
    v3Text(oc, "VIEWLY", 50, y5, {size:fs3, weight:700, f:"sans", sp:.06, color:"#fff", align:"c"});
    oc.globalCompositeOperation = "source-in";
    v3Photo(oc, "house", 50 - w3/2 - 4, y5 - fs3*.9, w3 + 8, fs3*1.2, {scale:1.3 - .08*k3(t, 0, 4.6), pos:[.5, .16]});
    oc.globalCompositeOperation = "source-over";
    c.save(); c.globalAlpha = A*reveal; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(off, 0, 0); c.restore();
    var mh3 = G.is9 ? 14 : 11.5;
    v3Mark(c, 50 - mh3*858.6/756.3/2, y5 - fs3 - mh3 - 5, mh3, "#fff", C3.sand, {reveal:oQ(k3(t, .3, 1.4)), dot:oQ(k3(t, 1.0, 1.8)), alpha:A});
    v3Line(c, 42, 58, y5 + 8, C3.sand, .3, oQ(k3(t, 2.2, 3.0)), A);
    v3Text(c, V3_TAG[0] + " " + V3_TAG[1], 50, y5 + 17, {size:G.is9 ? 3.8 : 3.3, italic:true, color:C3.cream, align:"c", p:oQ(k3(t, 2.6, 3.6)), alpha:A});
    v3Text(c, "VIEWLY.SE/MAKLARE", 50, H - G.bot - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:"#fff", align:"c", alpha:A*oQ(k3(t, 3.2, 4.0))});
  }
}

/* —— Förr / Nu (video D) ———————————————————————————————————————— */
function v3ForrNu(c, G, t){
  var H = G.H, cy = G.cy, a1 = 1 - ioC(k3(t, 3.4, 4.0));
  v3Fill(c, 0, 0, 100, H, C3.paper);
  /* förr */
  if(t < 4.2){
    v3Text(c, "FÖRR", 10, cy - 20, {size:2.2, weight:600, f:"sans", sp:.4, color:C3.mut, alpha:a1, p:oQ(k3(t, .2, 1.0))});
    v3Text(c, "Timmar.", 10, cy - 2, {size:G.is9 ? 24 : 21, color:C3.ink, alpha:a1, p:oQ(k3(t, .5, 2.0)), rise:2.4});
    v3Fill(c, 10, cy + 12, 80, .5, C3.line, a1*oQ(k3(t, 1.2, 1.8)));
    v3Fill(c, 10, cy + 12, 80*.18*ioC(k3(t, 1.4, 3.8)), .5, C3.ink, a1);
    v3Text(c, "ETT INLÄGG, FRÅN BÖRJAN", 10, cy + 20, {size:1.9, weight:500, f:"sans", sp:.28, color:C3.mut, alpha:a1*oQ(k3(t, 1.6, 2.4))});
  }
  /* nu */
  if(t >= 3.6 && t < 7.2){
    var q = t - 3.6, a2 = ioC(k3(q, 0, .7))*(1 - ioC(k3(q, 3.0, 3.6)));
    v3Text(c, "NU", 10, cy - 20, {size:2.2, weight:600, f:"sans", sp:.4, color:C3.oli, alpha:a2, p:oQ(k3(q, .2, 1.0))});
    v3Text(c, "Två klick.", 10, cy - 2, {size:G.is9 ? 24 : 21, color:C3.ink, alpha:a2, p:oQ(k3(q, .5, 1.9)), rise:2.4});
    [["1", "Skapa kampanj"], ["2", "Välj bild"]].forEach(function(s, i){
      var qq = oQ(k3(q, 1.5 + i*.7, 2.3 + i*.7)), y = cy + 14 + i*10;
      c.save(); c.globalAlpha = a2*qq; c.fillStyle = C3.navy; c.beginPath(); c.arc(12.5, y - 1, 2.8, 0, Math.PI*2); c.fill(); c.restore();
      v3Text(c, s[0], 12.5, y + .3, {size:2.8, weight:600, f:"sans", color:"#fff", align:"c", alpha:a2*qq});
      v3Text(c, s[1].toUpperCase(), 19, y + .1, {size:2.3, weight:500, f:"sans", sp:.26, color:C3.ink, alpha:a2*qq, p:qq});
    });
  }
  /* resultat */
  if(t >= 6.6){
    var r = t - 6.6, ra = ioC(k3(r, 0, .8));
    v3NavyBg(c, G, ra, t);
    var prog = k3(r, .9, 3.3), cw = G.CW, cxx = G.CX, cyy = G.CY;
    c.save(); c.globalAlpha = ra; v3Shadow(c, [cxx, cyy, cw, G.CH], .55, 5); c.restore();
    c.save(); c.globalAlpha = ra; v3Post(c, "overlay", "tillsalu", "home", cxx, cyy, cw, 1.25, prog, {zoom:1 + .025*k3(r, 0, 4)}); c.restore();
  }
}

/* ---------------------------------------------------------------------
   KOMPOSITIONER — video. Varje har en längd, en draw(c,G,t) och ljudcuer.
   --------------------------------------------------------------------- */
function v3Warp(c, G, t, w, fn){ fn(c, G, t*w) }
var V3_COMPS = {
  lang: {n:"A · Två klick (lång)", dur:33.8, d:"Hook, portal, två klick, formaten, Viewly-tjänsterna och en egen sekund för varumärket.",
    draw:function(c, G, t, o){
      var ol = o.outro, hk = o.hook;
      if(t < 25.2) v3Flow(c, G, t, {hook:hk});
      if(t >= 16.2 && t < 21.6) v3Trio(c, G, t, 16.2, {exit:true});
      if(t >= 21.2 && t < 25.2) v3Statement(c, G, t, 21.2);
      if(t >= 24.4 && t < 29.6){ v3Services(c, G, t, 24.4) }
      if(t >= 29.0){ v3Outro(c, G, ol, t - 29.0) }
    },
    audio:{chords:[[0, 4.4, 0], [4.4, 10.4, 1], [10.4, 16.6, 2], [16.6, 24.4, 3], [24.4, 29.0, 0], [29.0, 33.8, 3]],
      whoosh:[4.0, 10.4, 16.2, 21.0, 24.4, 28.9], tap:[7.84, 9.74], pop:[5.6, 5.75, 5.9, 6.05, 6.2, 12.9, 13.6, 14.2, 14.7, 15.1, 17.6, 18.0],
      chime:[15.4, 19.0], riser:[[27.0, 2.0]], sub:29.1, tail:33.8}},
  kort: {n:"A · Två klick (kort)", dur:21.2, d:"Samma berättelse, tajtare: hook, portal, två klick, formaten och varumärket.",
    draw:function(c, G, t, o){
      var w = 1.22, tt = t*w;
      if(tt < 16.6) v3Flow(c, G, tt, {hook:o.hook});
      if(tt >= 16.2 && tt < 21.4){
        v3NavyBg(c, G, ioC(k3(tt, 16.2, 16.9))*(1 - ioC(k3(t, 17.0, 17.8))), tt);
        v3Trio(c, G, tt, 16.2);
      }
      if(t >= 17.3) v3Outro(c, G, o.outro, t - 17.3);
    },
    audio:{chords:[[0, 3.6, 0], [3.6, 8.5, 1], [8.5, 13.6, 2], [13.6, 17.4, 3], [17.4, 21.2, 0]],
      whoosh:[3.3, 8.5, 13.2, 17.2], tap:[6.4, 7.95], pop:[4.6, 4.7, 4.8, 4.9, 10.5, 11.1, 11.7, 12.1, 12.5], chime:[12.7], riser:[[15.2, 1.8]], sub:17.4, tail:21.2}},
  mer: {n:"C · Mer än fotografering", dur:15.4, d:"Varumärkesvideo: vad Viewly är, utan verktygen. Tjänsterna som ett index.",
    draw:function(c, G, t, o){
      v3Fill(c, 0, 0, 100, G.H, C3.navy);
      var ha = 1 - ioC(k3(t, 3.6, 4.3)), hp = 1.5 + 0*t;
      if(t < 4.6){
        v3Photo(c, "dining", 0, 0, 100, G.H, {scale:lerp(1.14, 1.02, ioC(k3(t, 0, 4.4)))});
        v3Grad(c, 0, G.H*.4, 100, G.H*.6, [[0, "rgba(12,10,10,0)"], [1, "rgba(12,10,10,.8)"]], ha);
        v3Frame(c, 4, 4, 92, G.H - 8, "#fff", .26, oQ(k3(t, .2, 1.8)), .5*ha);
        var yb = G.H - G.bot - 26;
        v3Text(c, "En bostadsfotograf som gör", 50, yb, {size:G.is9 ? 7.4 : 6.4, color:"#fff", align:"c", alpha:ha, p:oQ(k3(t, .8, 2.2)), rise:2, shadow:true});
        v3Text(c, "mer än bara fotografering.", 50, yb + (G.is9 ? 9.2 : 8), {size:G.is9 ? 7.4 : 6.4, italic:true, color:C3.cream, alpha:ha, p:oQ(k3(t, 1.8, 3.2)), rise:2, shadow:true});
        v3Text(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, G.top + 4, {size:2, weight:500, f:"sans", sp:.3, color:"#fff", align:"c", alpha:.9*ha, p:oQ(k3(t, .5, 1.6))});
      }
      if(t >= 4.0 && t < 10.4) v3Services(c, G, t, 4.0);
      if(t >= 9.8) v3Outro(c, G, o.outro, t - 9.8);
    },
    audio:{chords:[[0, 4.2, 0], [4.2, 9.8, 1], [9.8, 15.4, 3]], whoosh:[3.9, 9.7], tap:[], pop:[5.0, 5.4, 5.8, 6.2, 6.6, 7.0, 7.4], chime:[], riser:[[8.0, 1.7]], sub:9.9, tail:15.4}},
  forrnu: {n:"D · Förr / Nu", dur:13.6, d:"Typografisk jämförelse: timmar mot två klick, sedan resultatet och varumärket.",
    draw:function(c, G, t, o){
      if(t < 9.6) v3ForrNu(c, G, t);
      if(t >= 9.4) v3Outro(c, G, o.outro, t - 9.4);
    },
    audio:{chords:[[0, 3.6, 0], [3.6, 6.8, 1], [6.8, 9.6, 2], [9.6, 13.6, 3]], whoosh:[3.4, 6.5, 9.3], tap:[5.1, 5.8], pop:[8.0, 8.5, 9.0], chime:[8.8], riser:[], sub:9.5, tail:13.6}}
};

/* ---------------------------------------------------------------------
   STATISKA ANNONSER OCH KARUSELLER (4:5). Samma kod som videon, fruset.
   --------------------------------------------------------------------- */
function v3Headline(c, lines, y, size, o){
  o = o || {};
  lines.forEach(function(l, i){
    v3Text(c, l[0], o.x == null ? 50 : o.x, y + i*size*1.02, {size:size, italic:l[1], color:l[2] || "#fff", align:o.align || "c", shadow:o.shadow});
  });
}
function v3Small(c, s, x, y, col, al, a, sz){ v3Text(c, s, x, y, {size:sz || 2, weight:500, f:"sans", sp:.28, color:col || "#fff", align:al || "c", alpha:a == null ? .85 : a}) }
var V3_STATIC = [
  {id:"p1", n:"Två klick. Inte två timmar.", d:"Formaten som bevis. Marin bakgrund.", draw:function(c, G){
      v3Fill(c, 0, 0, 100, G.H, C3.navy); v3NavyBg(c, G, 1, 0);
      v3Trio(c, G, 20, 0);
      v3Lock(c, 50, G.H - 14, 2.2, "#fff", C3.sand);
  }},
  {id:"p2", n:"Mer än fotografering", d:"Tjänsterna som ett index över ett skymningsfoto.", draw:function(c, G){
      v3Services(c, G, 4.2, 0);
      v3Lock(c, 50, G.H - 11, 2.2, "#fff", C3.sand);
  }},
  {id:"p3", n:"Varumärke · skymning", d:"Stor logga över foto.", draw:function(c, G){ v3Outro(c, G, "foto", 5, {noFade:true}) }},
  {id:"p4", n:"Skapa kampanj", d:"Portalen med markören på knappen.", draw:function(c, G){
      v3Fill(c, 0, 0, 100, G.H, C3.ui);
      v3Portal(c, G, 7.7, 1);
      var tile = [8, G.gridY, G.tw, G.th]; v3Photo(c, "home", tile[0], tile[1], tile[2], tile[3]);
      var bx = 56, by = G.btnY + G.btnH*.55; v3Cursor(c, bx, by, 0, 1); v3Click(c, bx, by, "KLICK 1", .25);
  }},
  {id:"p5", n:"Leveransen är bara början", d:"Foto först, ett påstående.", draw:function(c, G){
      v3Photo(c, "home", 0, 0, 100, G.H); v3Grad(c, 0, G.H*.4, 100, G.H*.6, [[0, "rgba(12,10,10,0)"], [1, "rgba(12,10,10,.82)"]]);
      v3Grad(c, 0, 0, 100, G.H*.2, [[0, "rgba(12,10,10,.45)"], [1, "rgba(12,10,10,0)"]]);
      v3Frame(c, 4, 4, 92, G.H - 8, "#fff", .26, 1, .5);
      v3Small(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, 11, "#fff", "c", .9);
      v3Headline(c, [["Leveransen", false], ["är bara början.", true, C3.cream]], G.H - 33, 10.6, {shadow:true});
      v3Lock(c, 50, G.H - 11, 2.1, "#fff", C3.sand);
  }},
  {id:"p6", n:"Du bokar. Vi sköter resten.", d:"Slogan ur viewly.se/maklare.", draw:function(c, G){
      v3Photo(c, "dining", 0, 0, 100, G.H); v3Grad(c, 0, G.H*.4, 100, G.H*.6, [[0, "rgba(12,10,10,0)"], [1, "rgba(12,10,10,.84)"]]);
      v3Grad(c, 0, 0, 100, G.H*.2, [[0, "rgba(12,10,10,.45)"], [1, "rgba(12,10,10,0)"]]);
      v3Frame(c, 4, 4, 92, G.H - 8, "#fff", .26, 1, .5);
      v3Small(c, "FÖR FASTIGHETSMÄKLARE I SKÅNE", 50, 11, "#fff", "c", .9);
      v3Headline(c, [["Du bokar.", false], ["Vi sköter resten.", true, C3.cream]], G.H - 33, 10.6, {shadow:true});
      v3Lock(c, 50, G.H - 11, 2.1, "#fff", C3.sand);
  }}
];
/* Karusell B: så fungerar det */
var V3_CAR = {
  b:{n:"B · Så fungerar det", d:"Sex bilder: frågan, leveransen, två klick, resultatet, och Viewly.", slides:[
    function(c, G){
      v3Photo(c, "dining", 0, 0, 100, G.H); v3Grad(c, 0, G.H*.34, 100, G.H*.66, [[0, "rgba(12,10,10,0)"], [1, "rgba(12,10,10,.86)"]]);
      v3Grad(c, 0, 0, 100, G.H*.2, [[0, "rgba(12,10,10,.45)"], [1, "rgba(12,10,10,0)"]]);
      v3Frame(c, 4, 4, 92, G.H - 8, "#fff", .26, 1, .5);
      v3Small(c, "VIEWLY · EFTER LEVERANSEN", 50, 11, "#fff", "c", .9);
      v3Headline(c, [["Dina bilder", false], ["är levererade.", false], ["Nu då?", true, C3.cream]], G.H - 44, 12, {shadow:true});
    },
    function(c, G){ v3Fill(c, 0, 0, 100, G.H, C3.ui); v3Portal(c, G, 6.6, 1); v3Photo(c, "home", 8, G.gridY, G.tw, G.th) },
    function(c, G){ v3Fill(c, 0, 0, 100, G.H, C3.ui); v3Portal(c, G, 7.78, 1); v3Photo(c, "home", 8, G.gridY, G.tw, G.th);
      var bx = 56, by = G.btnY + G.btnH*.55; v3Cursor(c, bx, by, .6, 1); v3Click(c, bx, by, "KLICK 1", .22) },
    function(c, G){ v3Fill(c, 0, 0, 100, G.H, C3.ui); v3Portal(c, G, 9.8, 1); v3Photo(c, "home", 8, G.gridY, G.tw, G.th);
      var tx = 8 + G.tw*.58, ty = G.gridY + G.th*.62; v3Cursor(c, tx, ty, .5, 1); v3Click(c, tx, ty, "KLICK 2", .22) },
    function(c, G){
      v3Fill(c, 0, 0, 100, G.H, C3.dark); v3NavyBg(c, G, 1, 0);
      v3Shadow(c, [G.CX, G.CY - 3, G.CW, G.CH], .55, 5); v3Post(c, "overlay", "tillsalu", "home", G.CX, G.CY - 3, G.CW, 1.25, 1);
      v3Text(c, "Klart.", 50, G.H - 7.4, {size:7.4, italic:true, color:"#fff", align:"c"});
    },
    function(c, G){ v3Outro(c, G, "marin", 5, {noFade:true}) }
  ]},
  c:{n:"C · Mer än fotografering", d:"Fem bilder: vad Viewly är, två tjänster som foto, indexet och varumärket.", slides:[
    function(c, G){
      v3Photo(c, "house", 0, 0, 100, G.H); v3Grad(c, 0, G.H*.34, 100, G.H*.66, [[0, "rgba(10,20,32,0)"], [1, "rgba(10,20,32,.88)"]]);
      v3Grad(c, 0, 0, 100, G.H*.2, [[0, "rgba(10,20,32,.5)"], [1, "rgba(10,20,32,0)"]]);
      v3Frame(c, 4, 4, 92, G.H - 8, "#fff", .26, 1, .5);
      v3Small(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, 11, "#fff", "c", .9);
      v3Headline(c, [["En bostadsfotograf", false], ["som gör mer än", false], ["bara fotografering.", true, C3.cream]], G.H - 44, 9.4, {shadow:true});
    },
    function(c, G){
      v3Photo(c, "dining", 0, 0, 100, G.H); v3Grad(c, 0, G.H*.62, 100, G.H*.38, [[0, "rgba(12,10,10,0)"], [1, "rgba(12,10,10,.7)"]]);
      v3Frame(c, 4, 4, 92, G.H - 8, "#fff", .26, 1, .5);
      v3Small(c, "01", 11, 12, C3.sand, "l", 1); v3Text(c, "Fotografering", 50, G.H - 16, {size:12, color:"#fff", align:"c", shadow:true});
      v3Small(c, "INTERIÖR · EXTERIÖR · DETALJER", 50, G.H - 9, "#fff", "c", .85);
    },
    function(c, G){
      v3Photo(c, "terrace", 0, 0, 100, G.H); v3Grad(c, 0, G.H*.62, 100, G.H*.38, [[0, "rgba(12,10,10,0)"], [1, "rgba(12,10,10,.7)"]]);
      v3Frame(c, 4, 4, 92, G.H - 8, "#fff", .26, 1, .5);
      v3Small(c, "02", 11, 12, C3.sand, "l", 1); v3Text(c, "Skymning", 50, G.H - 16, {size:12, color:"#fff", align:"c", shadow:true});
      v3Small(c, "BILDERNA SOM STOPPAR SCROLLEN", 50, G.H - 9, "#fff", "c", .85);
    },
    function(c, G){ v3Services(c, G, 4.2, 0) },
    function(c, G){ v3Outro(c, G, "papper", 5, {noFade:true}) }
  ]}
};
