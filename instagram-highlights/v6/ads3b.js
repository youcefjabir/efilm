/* =====================================================================
   ADS 3 — del B: scener, kompositioner, statiska annonser

   Berättelsen: fotona är bra → de levereras → i Mäklarportalen ligger
   bostadens uppgifter redan på leveranssidan, man väljer bild och mall →
   inlägget fylls med uppgifterna, i kontorets egen profil → varumärket.

   Färgerna är Viewlys egna: papper, ink, oliv och varmt svart. Kontorets
   färger (exempelkontoret Nordvik) syns bara i inlägget.

   Allt ligger innanför bilden och, i 9:16, innanför Instagrams säkra yta.
   ===================================================================== */

function v3Geo(fmt){
  var is9 = fmt === "916", w169 = fmt === "169", sq = fmt === "11", H = is9 ? 177.78 : w169 ? 56.25 : sq ? 100 : 125, top = is9 ? 26 : w169 ? 4 : 8, bot = is9 ? 31.5 : w169 ? 4 : 8;
  var g = {is9:is9, H:H, top:top, bot:bot, cy:(top + H - bot)/2, fmt:fmt};
  g.CW = is9 ? 78 : 68; g.CH = g.CW*1.25; g.CX = (100 - g.CW)/2; g.CY = g.cy - g.CH/2;
  /* leveranssidan */
  g.titleY = top + (is9 ? 22 : 19.5); g.subY = g.titleY + (is9 ? 5.4 : 4.8); g.dataY = g.subY + (is9 ? 7.6 : 6.6);
  g.sectY = g.dataY + (is9 ? 14.4 : 12.4); g.gridY = g.sectY + (is9 ? 4.6 : 4.2); g.tw = 26.4; g.th = is9 ? 28 : 25;
  return g;
}
function v3Mix(a, b, p){ return [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p), lerp(a[3], b[3], p)] }
function v3Shadow(c, r, a, blur){
  c.save(); c.shadowColor = "rgba(0,0,0," + a + ")"; c.shadowBlur = blur; c.shadowOffsetY = blur*.3;
  c.fillStyle = "#000"; c.fillRect(r[0], r[1], r[2], r[3]); c.restore();
}
/* Mörk scen: samma foto, mjukt och varmt svart. */
function v3DarkBg(c, G, a, t){
  c.save(); c.globalAlpha = a;
  v3Photo(c, "blur", 0, 0, 100, G.H, {alpha:1, scale:1.3 + .02*Math.sin((t || 0)*.25), pos:[.5 + .02*Math.sin((t || 0)*.2), .5]});
  c.fillStyle = "rgba(14,14,13,.78)"; c.fillRect(0, 0, 100, G.H);
  v3Grad(c, 0, 0, 100, G.H, [[0, "rgba(6,6,5,.35)"], [.5, "rgba(6,6,5,0)"], [1, "rgba(6,6,5,.4)"]]);
  c.restore();
}
function v3Cursor(c, x, y, press, a){
  if(a != null && a <= .004) return;
  c.save(); c.globalAlpha = a == null ? 1 : a; c.translate(x, y); var s = (1 - press*.14)*.26; c.scale(s, s);
  c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 6; c.shadowOffsetY = 2;
  c.beginPath(); c.moveTo(2, 2); c.lineTo(2, 28); c.lineTo(9, 21.4); c.lineTo(13.6, 31.8); c.lineTo(17.8, 29.9); c.lineTo(13.2, 19.7); c.lineTo(23, 19.4); c.closePath();
  c.fillStyle = "#1C1C1E"; c.fill(); c.shadowColor = "transparent"; c.lineWidth = 1.8; c.strokeStyle = "#fff"; c.lineJoin = "round"; c.stroke(); c.restore();
}
function v3Tap(c, x, y, p){
  if(p <= 0 || p >= 1) return;
  var rp = oQ(p);
  c.save(); c.globalAlpha = (1 - rp)*.6; c.strokeStyle = C3.oli; c.lineWidth = .35; c.beginPath(); c.arc(x, y, 1.2 + rp*5, 0, Math.PI*2); c.stroke(); c.restore();
}
function v3Tick(c, x, y, r, p, col){
  if(p <= 0) return;
  var s = .6 + .4*oQ(mclamp(p));
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = oQ(mclamp(p*2));
  c.fillStyle = col || C3.oli; c.beginPath(); c.arc(0, 0, r, 0, Math.PI*2); c.fill();
  c.strokeStyle = "#fff"; c.lineWidth = r*.2; c.lineCap = "round"; c.lineJoin = "round";
  c.beginPath(); c.moveTo(-r*.42, r*.04); c.lineTo(-r*.1, r*.36); c.lineTo(r*.46, -r*.32); c.stroke(); c.restore();
}

/* —— Mäklarportalen: leveranssidan med uppgifterna, sedan mallen ————————— */
var V3_ALL = ["home", "dining", "beige", "bedroom", "terrace", "house"];
function v3Tiles(sel){ return [sel].concat(V3_ALL.filter(function(n){ return n !== sel })).slice(0, 6) }
var V3_STYLES = ["overlay", "editorial", "badge"], V3_STYLE_N = ["OVERLAY", "EDITORIAL", "BADGE"];
/* tider (råtid). Två lägen: med mallväljare, och direkt (utan). */
var V3T_FULL = {ui:[4.0, 5.0], hdr:4.4, title:4.8, data:5.4, tiles:5.9, curIn:[6.6, 7.8], tap1:7.9, m12:[8.9, 9.6], cards:9.5, curTp:[10.0, 10.9], tap2:11.0,
                uiOut:[11.9, 12.5], dark:[11.9, 12.55], exp:[12.0, 13.2], build:[13.7, 16.6], hold:17.4};
var V3T_DIRECT = {ui:[4.0, 5.0], hdr:4.4, title:4.8, data:5.4, tiles:5.9, curIn:[6.4, 7.4], tap1:7.5, m12:[99, 100], cards:99, curTp:[99, 100], tap2:99,
                  uiOut:[8.2, 8.7], dark:[8.2, 8.75], exp:[8.3, 9.5], build:[10.0, 12.9], hold:13.8, direct:true};
function v3Portal(c, G, t, ua, o){
  var T = o.T || V3T_FULL, ink = C3.ink, mut = C3.mut, m = 8, tl = v3Tiles(o.photo), sidx = V3_STYLES.indexOf(o.tpl);
  var m12 = ioC(k3(t, T.m12[0], T.m12[1]));
  var q = oQ(k3(t, T.hdr, T.hdr + .9));
  c.save(); c.globalAlpha = ua*q;
  v3Lock(c, 0, G.top + 2.2, 2.4, ink, C3.oli, {left:m});
  v3Text(c, v3t("ui.portal"), 100 - m, G.top + 3, {size:1.8, weight:500, f:"sans", sp:.24, color:mut, align:"r"});
  c.restore();
  v3Line(c, m, 100 - m, G.top + 7.4, C3.uil, .2, oQ(k3(t, T.hdr + .1, T.hdr + 1.1)), ua);
  /* leveransen: adress, ort, och uppgifterna som följer med till mallen */
  var tq = oQ(k3(t, T.title, T.title + 1.0)), hs = G.is9 ? 9.6 : 7.6;
  v3Text(c, V3_OBJ.addr, m, G.titleY, {size:hs, color:ink, alpha:ua, p:tq, rise:1.4});
  v3Text(c, (V3_OBJ.city + " · 12 bilder levererade idag").toUpperCase(), m, G.subY, {size:1.85, weight:500, f:"sans", sp:.22, color:mut, alpha:ua*tq});
  var dq = oQ(k3(t, T.data, T.data + 1.0));
  var cols = [[12, "BOSTAD", V3_OBJ.rum + " rum · " + V3_OBJ.yta + " m²"], [41, "ANSVARIG MÄKLARE", V3_OBJ.maklare], [70, "KONTOR", OFF.name.charAt(0) + OFF.name.slice(1).toLowerCase()]];
  /* uppgifterna ligger i ett vitt, rundat kort med mjuk skugga */
  var cy0 = G.dataY - 4.4 + (1 - dq)*1.6, ch0 = 13.4, cr = 1.7;
  c.save(); c.globalAlpha = ua*dq; c.shadowColor = "rgba(28,28,30,.16)"; c.shadowBlur = 3.2; c.shadowOffsetY = 1; c.fillStyle = "#fff";
  c.beginPath(); c.moveTo(m + cr, cy0); c.arcTo(100 - m, cy0, 100 - m, cy0 + ch0, cr); c.arcTo(100 - m, cy0 + ch0, m, cy0 + ch0, cr); c.arcTo(m, cy0 + ch0, m, cy0, cr); c.arcTo(m, cy0, 100 - m, cy0, cr); c.closePath(); c.fill();
  c.shadowColor = "transparent"; c.strokeStyle = "rgba(28,28,30,.08)"; c.lineWidth = .15; c.stroke(); c.restore();
  cols.forEach(function(cl){
    v3Text(c, cl[1], cl[0], G.dataY + (1 - dq)*1.6, {size:1.4, weight:600, f:"sans", sp:.2, color:"#6E6A66", alpha:ua*dq});
    v3Text(c, cl[2], cl[0], G.dataY + 4.8 + (1 - dq)*1.6, {size:G.is9 ? 3.7 : 3.3, color:ink, alpha:ua*dq});
  });
  /* uppgifterna följer med: en oliv linje i kortets nederkant när mallen visas */
  v3Fill(c, m + 2, cy0 + ch0 - .5, (84 - 4)*m12, .4, C3.oli, ua*dq);
  /* sektionsrubrik */
  var sq = oQ(k3(t, T.tiles - .1, T.tiles + .7));
  v3Text(c, v3t("ui.valjbild"), m, G.sectY, {size:1.9, weight:600, f:"sans", sp:.26, color:ink, alpha:ua*sq*(1 - m12)});
  v3Text(c, v3t("ui.valjmall"), m, G.sectY, {size:1.9, weight:600, f:"sans", sp:.26, color:ink, alpha:ua*m12});
  v3Text(c, "12 BILDER", 100 - m, G.sectY, {size:1.5, weight:500, f:"sans", sp:.2, color:mut, align:"r", alpha:ua*sq*(1 - m12)});
  /* väljare: Mina mallar (aktiv) | Viewlys mallar – visar att kontoret har egna mallar */
  if(m12 > 0){
    var sa = ua*m12, sw = 19.5, sx = 100 - m - sw*2, sy = G.sectY - 2.3, sh = 3.9;
    c.save(); c.globalAlpha = sa;
    c.strokeStyle = C3.line; c.lineWidth = .2; c.strokeRect(sx, sy, sw*2, sh);
    c.fillStyle = ink; c.fillRect(sx, sy, sw, sh);
    c.restore();
    v3Text(c, v3t("ui.mina"), sx + sw/2, G.sectY, {size:1.2, weight:600, f:"sans", sp:.18, color:"#fff", align:"c", alpha:sa});
    v3Text(c, v3t("ui.viewlys"), sx + sw*1.5, G.sectY, {size:1.2, weight:500, f:"sans", sp:.18, color:mut, align:"c", alpha:sa});
  }
  /* bildrutorna */
  var a1 = 1 - m12;
  if(a1 > 0) tl.forEach(function(nm, i){
    if(i === 0 && !o.noMorph) return;
    var col = i % 3, row = Math.floor(i/3), x = m + col*(G.tw + 2.4), y = G.gridY + row*(G.th + 2.4);
    var qi = oQ(k3(t, T.tiles + i*.1, T.tiles + .8 + i*.1)), dim = i === 0 ? 1 : lerp(1, .32, ioC(k3(t, T.tap1 + .2, T.tap1 + .6)));
    c.save(); c.globalAlpha = ua*qi*dim*a1;
    v3Photo(c, nm, x, y + (1 - qi)*2.4, G.tw, G.th);
    if(i === 5){ v3Fill(c, x, y + (1 - qi)*2.4, G.tw, G.th, "#0e0e0d", .55); v3Text(c, "+7", x + G.tw/2, y + (1 - qi)*2.4 + G.th/2 + 2.4, {size:7, color:"#fff", align:"c"}) }
    c.restore();
  });
  /* mallarna: layouten med grå staplar där uppgifterna ska stå */
  if(m12 > 0) V3_STYLES.forEach(function(st, i){
    var x = m + i*(G.tw + 2.4), y = G.gridY, qi = oQ(k3(t, T.cards + i*.12, T.cards + .8 + i*.12)), dim = i === sidx ? 1 : lerp(1, .32, ioC(k3(t, T.tap2 + .2, T.tap2 + .7)));
    var a = ua*qi*dim; if(a <= 0) return;
    c.save(); c.globalAlpha = a;
    v3Shadow(c, [x, y + (1 - qi)*2.4, G.tw, G.tw*1.25], .2, 2);
    v3Post(c, st, o.phase, o.photo, x, y + (1 - qi)*2.4, G.tw, 1.25, 0, {skel:1});
    c.restore();
    c.save(); c.globalAlpha = a;
    v3Text(c, V3_STYLE_N[i], x + G.tw/2, y + G.tw*1.25 + 5, {size:1.7, weight:i === sidx && t > T.tap2 ? 600 : 500, f:"sans", sp:.26, color:ink, align:"c"});
    if(i === sidx && t > T.tap2){
      var rk = k3(t, T.tap2, T.tap2 + .3); c.globalAlpha = a*rk; c.strokeStyle = ink; c.lineWidth = .45; c.strokeRect(x - .9, y - .9 + (1 - qi)*2.4, G.tw + 1.8, G.tw*1.25 + 1.8);
    }
    c.restore();
    if(i === sidx && t > T.tap2) v3Tick(c, x + G.tw - .4, y - .4, 2.1, k3(t, T.tap2 + .05, T.tap2 + .4), C3.oli);
  });
  /* + Skapa egen mall */
  if(m12 > 0){
    var ba = ua*oQ(k3(t, T.cards + .5, T.cards + 1.2))*lerp(1, .32, ioC(k3(t, T.tap2 + .2, T.tap2 + .7))), by = G.gridY + G.tw*1.25 + 9.5;
    if(ba > 0){
      c.save(); c.globalAlpha = ba; c.strokeStyle = C3.mut; c.lineWidth = .22; c.setLineDash([.8, .7]);
      c.strokeRect(m, by, 100 - m*2, 5.6); c.restore();
      v3Text(c, v3t("ui.egen"), 50, by + 3.5, {size:1.3, weight:600, f:"sans", sp:.22, color:ink, align:"c", alpha:ba});
    }
  }
}

/* —— hook + portal + mall som fylls (flödet) ———————————————————————— */
function v3Flow(c, G, t, o){
  var T = o.T || V3T_FULL, H = G.H, FULL = [0, 0, 100, H], sidx = V3_STYLES.indexOf(o.tpl), dir = !!T.direct;
  var TILE = [8, G.gridY, G.tw, G.th], CARD = [G.CX, G.CY, G.CW, G.CH];
  var TC = dir ? TILE : [8 + sidx*(G.tw + 2.4), G.gridY, G.tw, G.tw*1.25];
  v3Fill(c, 0, 0, 100, H, o.skipHook ? C3.ui : C3.dark);
  var nb = ioC(k3(t, T.dark[0], T.dark[1])); if(nb > 0) v3DarkBg(c, G, nb, t);
  var ub = ioC(k3(t, T.ui[0], T.ui[1]))*(1 - ioC(k3(t, T.uiOut[0], T.uiOut[1])));
  if(ub > 0){ v3Fill(c, 0, 0, 100, H, C3.ui, ub); v3Portal(c, G, t, ub, o) }

  var q1 = ioQ(k3(t, 4.0, 5.4)), sc = lerp(1.14, 1.02, ioC(k3(t, 0, 5)));
  var cardEnd = T.hold;
  if(t < T.exp[0]){
    /* fotot: helbild → bildruta 1 (om ingen hook: bildrutan ritas av portalen) */
    if(!o.noMorph){
      var r = t >= 4.0 ? v3Mix(FULL, TILE, q1) : FULL, s2 = t >= 4.0 ? lerp(sc, 1, q1) : sc;
      var fa = dir ? 1 : 1 - ioC(k3(t, T.m12[0] - .2, T.m12[0] + .4));
      if(fa > 0){
        c.save(); c.globalAlpha = fa;
        if(t >= 4.2) v3Shadow(c, r, .14*k3(t, 4.2, 5.4), 2);
        v3Photo(c, o.photo, r[0], r[1], r[2], r[3], {scale:s2}); c.restore();
      }
    }
    var rk = k3(t, T.tap1 + .05, T.tap1 + .3)*(dir ? 1 - k3(t, T.exp[0] - .3, T.exp[0]) : 1 - k3(t, T.m12[0] - .3, T.m12[0] + .1));
    if(rk > 0){ c.save(); c.globalAlpha = rk; c.strokeStyle = C3.ink; c.lineWidth = .45; c.strokeRect(TILE[0] - .9, TILE[1] - .9, TILE[2] + 1.8, TILE[3] + 1.8); c.restore(); v3Tick(c, TILE[0] + TILE[2] - .4, TILE[1] - .4, 2.1, k3(t, T.tap1 + .1, T.tap1 + .4), C3.oli) }
  }
  if(t >= T.exp[0] && t < cardEnd){
    var eq = ioQ(k3(t, T.exp[0], T.exp[1])), rr = v3Mix(TC, CARD, eq), prog = k3(t, T.build[0], T.build[1]);
    v3Shadow(c, rr, .45*eq, 5);
    v3Post(c, o.tpl, o.phase, o.photo, rr[0], rr[1], rr[2], rr[3]/rr[2], prog, {skel:"auto", zoom:1 + .02*k3(t, T.exp[1], T.hold)});
  }
  /* markören */
  var ce = dir ? T.exp[0] - .1 : T.tap2 + .5;
  if(t >= T.curIn[0] && t < ce + .5){
    var tx = TILE[0] + TILE[2]*.58, ty = TILE[1] + TILE[3]*.62, px = TC[0] + TC[2]*.6, py = TC[1] + TC[3]*.6, cx, cy;
    var mA = ioC(k3(t, T.curIn[0], T.curIn[1])), mB = ioC(k3(t, T.curTp[0], T.curTp[1]));
    if(t < T.curTp[0]){ cx = lerp(96, tx, mA); cy = lerp(H - 18, ty, mA) - Math.sin(mA*Math.PI)*4 }
    else { cx = lerp(tx, px, mB); cy = lerp(ty, py, mB) - Math.sin(mB*Math.PI)*3 }
    var prs = Math.max(k3(t, T.tap1 - .15, T.tap1)*(1 - k3(t, T.tap1 + .05, T.tap1 + .2)), dir ? 0 : k3(t, T.tap2 - .15, T.tap2)*(1 - k3(t, T.tap2 + .05, T.tap2 + .2)));
    v3Cursor(c, cx, cy, prs, k3(t, T.curIn[0], T.curIn[0] + .4)*(1 - k3(t, ce, ce + .5)));
    v3Tap(c, tx, ty, k3(t, T.tap1, T.tap1 + .7)); if(!dir) v3Tap(c, px, py, k3(t, T.tap2, T.tap2 + .7));
  }
  /* hooken */
  if(!o.skipHook && t < 4.8){
    var out = 1 - ioC(k3(t, 3.9, 4.5)), top = G.top, yb = H - G.bot - 28, hk = o.hook;
    v3Grad(c, 0, H*.42, 100, H*.58, [[0, "rgba(14,11,11,0)"], [1, "rgba(14,11,11,.78)"]], out);
    v3Grad(c, 0, 0, 100, H*.24, [[0, "rgba(14,11,11,.5)"], [1, "rgba(14,11,11,0)"]], out);
    v3Frame(c, 4, 4, 92, H - 8, "#fff", .26, oQ(k3(t, .2, 1.8)), .5*out);
    v3Text(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, top + 4, {size:2, weight:500, f:"sans", sp:.3, color:"#fff", align:"c", alpha:.92*out, p:oQ(k3(t, .5, 1.7))});
    v3Text(c, hk[0], 50, yb, {size:11.2, color:"#fff", align:"c", alpha:out, p:oQ(k3(t, 1.0, 2.5)), rise:2, shadow:true});
    v3Text(c, hk[1], 50, yb + 13.6, {size:10.4, italic:true, color:C3.cream, align:"c", alpha:out, p:oQ(k3(t, 2.2, 3.7)), rise:2, shadow:true});
  }
}

/* —— Klart i alla format. Ingen text — formaten visar sig själva. ———————— */
function v3Trio(c, G, t, t0, o){
  var is9 = G.is9, a = ioC(k3(t, t0, t0 + .5))*(o.exit ? 1 - ioC(k3(t, t0 + 2.6, t0 + 3.2)) : 1);
  var sw = is9 ? 23 : 21, mw = is9 ? 34 : 31, qw = is9 ? 28 : 25, gap = 3;
  var total = sw + mw + qw + 2*gap, x0 = (100 - total)/2, base = G.cy + (is9 ? 24 : 18);
  var main = [G.CX, G.CY, G.CW, G.CH], fin = [x0 + sw + gap, base - mw*1.25, mw, mw*1.25];
  var qm = ioQ(k3(t, t0, t0 + 1.2)), qs = ioQ(k3(t, t0 + .5, t0 + 1.7)), r = v3Mix(main, fin, qm), cx = r[0] + r[2]/2;
  var left = [x0, base - sw*1.7778, sw, sw*1.7778], right = [x0 + sw + gap + mw + gap, base - qw, qw, qw];
  var lr = v3Mix([cx - sw/2, left[1], sw, left[3]], left, qs), rr = v3Mix([cx - qw/2, right[1], qw, right[3]], right, qs);
  var P = [o.tpl, o.phase, o.photo];
  c.save(); c.globalAlpha = a;
  c.save(); c.globalAlpha = a*qs; v3Shadow(c, lr, .4, 4); v3Post(c, P[0], P[1], P[2], lr[0], lr[1], lr[2], 1.7778, 1); c.restore();
  c.save(); c.globalAlpha = a*qs; v3Shadow(c, rr, .4, 4); v3Post(c, P[0], P[1], P[2], rr[0], rr[1], rr[2], 1, 1); c.restore();
  v3Shadow(c, r, .5, 5); v3Post(c, P[0], P[1], P[2], r[0], r[1], r[2], 1.25, 1);
  c.restore();
}

/* —— hook som bara är text: Välj bild. Välj mall. ————————————————————— */
function v3TypoHook(c, G, t, lines){
  var a = 1 - ioC(k3(t, 1.9, 2.5));
  v3Fill(c, 0, 0, 100, G.H, C3.paper, a);
  v3Text(c, "VIEWLY · MÄKLARPORTALEN", 50, G.top + 4, {size:2, weight:500, f:"sans", sp:.3, color:C3.mut, align:"c", alpha:a, p:oQ(k3(t, .2, 1.2))});
  v3Text(c, lines[0], 50, G.cy - 2, {size:G.is9 ? 17 : 14, color:C3.ink, align:"c", alpha:a, p:oQ(k3(t, .3, 1.4)), rise:2.4});
  v3Text(c, lines[1], 50, G.cy + (G.is9 ? 16 : 13), {size:G.is9 ? 17 : 14, italic:true, color:C3.oli, align:"c", alpha:a, p:oQ(k3(t, 1.0, 2.1)), rise:2.4});
}

/* —— före / efter: reglaget som visar vad som hände med bilden ————————— */
function v3Fore(c, G, t, o){
  var H = G.H, ar = H/100, sc = lerp(1.12, 1.0, ioC(k3(t, 0, 3.4))), hs = ioQ(k3(t, 3.6, 6.0)), hx = 100 - 100*hs;
  v3Photo(c, o.photo, 0, 0, 100, H, {scale:sc});
  var cap = 1 - ioC(k3(t, 3.2, 3.7));
  v3Grad(c, 0, H*.42, 100, H*.58, [[0, "rgba(14,11,11,0)"], [1, "rgba(14,11,11,.78)"]], cap);
  v3Grad(c, 0, 0, 100, H*.24, [[0, "rgba(14,11,11,.5)"], [1, "rgba(14,11,11,0)"]], cap*.9 + .1);
  if(cap > 0){
    v3Frame(c, 4, 4, 92, H - 8, "#fff", .26, oQ(k3(t, .2, 1.8)), .5*cap);
    var yb = H - G.bot - 28;
    v3Text(c, o.fore[0], 50, yb, {size:11.2, color:"#fff", align:"c", alpha:cap, p:oQ(k3(t, 1.0, 2.5)), rise:2, shadow:true});
    v3Text(c, o.fore[1], 50, yb + 13.6, {size:10.4, italic:true, color:C3.cream, align:"c", alpha:cap, p:oQ(k3(t, 2.2, 3.7)), rise:2, shadow:true});
  }
  if(hs > 0){
    c.save(); c.beginPath(); c.rect(hx, 0, 100 - hx, H); c.clip();
    v3Post(c, o.tpl, o.phase, o.photo, 0, 0, 100, ar, 1);
    c.restore();
    var ha = k3(t, 3.6, 3.9)*(1 - k3(t, 6.1, 6.6));
    c.save(); c.globalAlpha = ha; v3Fill(c, hx - .15, 0, .3, H, "#fff"); c.shadowColor = "rgba(0,0,0,.4)"; c.shadowBlur = 8;
    c.fillStyle = "#fff"; c.beginPath(); c.arc(hx, G.cy, 3.4, 0, Math.PI*2); c.fill(); c.shadowColor = "transparent";
    c.strokeStyle = C3.ink; c.lineWidth = .35; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); c.moveTo(hx - .6, G.cy - 1.2); c.lineTo(hx - 1.8, G.cy); c.lineTo(hx - .6, G.cy + 1.2); c.moveTo(hx + .6, G.cy - 1.2); c.lineTo(hx + 1.8, G.cy); c.lineTo(hx + .6, G.cy + 1.2); c.stroke();
    c.restore();
    var la = k3(t, 3.7, 4.1)*(1 - k3(t, 6.0, 6.5));
    v3Text(c, "LEVERERAT", 8, G.top + 3, {size:1.9, weight:600, f:"sans", sp:.3, color:"#fff", alpha:la*(hx > 24 ? 1 : 0)*.9});
    v3Text(c, "KLART", 92, G.top + 3, {size:1.9, weight:600, f:"sans", sp:.3, color:"#fff", align:"r", alpha:la*(hx < 76 ? 1 : 0)*.9});
  }
}

/* —— Slutkort: en egen sekund för varumärket ———————————————————————— */
var V3_OUT = [
  {id:"papper",  n:"Papper · stor logga"},
  {id:"mork",    n:"Mörk · stor logga"},
  {id:"stapel",  n:"Stapel · märke över ordbild"},
  {id:"foto",    n:"Över foto · skymning"},
  {id:"bokstav", n:"Bokstav för bokstav"},
  {id:"marke",   n:"Märket först, ordbilden glider ut"},
  {id:"ordbild", n:"Foto i ordbilden"}
];
function v3Outro(c, G, id, t, o){
  o = o || {}; var H = G.H, cy = G.cy, dark = id === "mork" || id === "bokstav" || id === "ordbild" || id === "foto";
  var ink = dark ? "#fff" : C3.ink, dot = dark ? C3.olil : C3.oli, acc = dot, tagc = dark ? C3.cream : C3.ink, tag2 = dark ? C3.olil : C3.oli, small = dark ? "rgba(255,255,255,.78)" : C3.mut;
  var a = o.noFade ? 1 : ioC(k3(t, 0, .6));
  c.save(); c.globalAlpha = a;
  if(id === "foto"){
    v3Photo(c, "terrace", 0, 0, 100, H, {scale:1.08 - .04*k3(t, 0, 4.6)});
    v3Fill(c, 0, 0, 100, H, "#0e0e0d", .62);
    v3Grad(c, 0, 0, 100, H, [[0, "rgba(14,14,13,.4)"], [.5, "rgba(14,14,13,.1)"], [1, "rgba(14,14,13,.55)"]]);
  } else if(id === "ordbild" || id === "mork" || id === "bokstav"){
    v3Fill(c, 0, 0, 100, H, C3.dark);
  } else v3Fill(c, 0, 0, 100, H, C3.paper);
  c.restore();
  var A = a, capH = G.is9 ? 7.3 : 6.8, ft = H - G.bot;
  var foot = function(col1, col2){
    v3Text(c, v3t("outro.aud"), 50, ft - 8, {size:1.95, weight:500, f:"sans", sp:.28, color:col1, align:"c", alpha:A*oQ(k3(t, 3.0, 3.8))});
    v3Text(c, v3t("outro.url"), 50, ft - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:col2, align:"c", alpha:A*oQ(k3(t, 3.2, 4.0))});
  };
  if(id === "papper" || id === "mork" || id === "foto"){
    var lp = oQ(k3(t, .5, 1.7)), y = cy - (G.is9 ? 14 : 12);
    v3Lock(c, 50, y, capH, ink, dot, {pm:lp, pd:oQ(k3(t, 1.2, 2.0)), pw:oQ(k3(t, .8, 2.0)), alpha:A});
    v3Line(c, 42, 58, y + capH*1.9, acc, .3, oQ(k3(t, 1.8, 2.6)), A);
    v3Text(c, v3t("outro.tag1"), 50, y + capH*1.9 + 10, {size:G.is9 ? 6 : 5.2, color:tagc, align:"c", p:oQ(k3(t, 2.0, 3.0)), rise:1.6, alpha:A});
    v3Text(c, v3t("outro.tag2"), 50, y + capH*1.9 + 10 + (G.is9 ? 7.4 : 6.4), {size:G.is9 ? 6 : 5.2, italic:true, color:tag2, align:"c", p:oQ(k3(t, 2.5, 3.5)), rise:1.6, alpha:A});
    foot(small, ink);
  } else if(id === "stapel"){
    var mh = G.is9 ? 26 : 21, y2 = cy - (G.is9 ? 24 : 20), fs = G.is9 ? 12 : 10.4;
    v3Mark(c, 50 - mh*858.6/756.3/2, y2, mh, ink, dot, {reveal:oQ(k3(t, .4, 1.6)), dot:oQ(k3(t, 1.2, 2.0)), alpha:A});
    v3Text(c, "VIEWLY", 50, y2 + mh + fs*1.35, {size:fs, weight:500, f:"sans", sp:.3, color:ink, align:"c", p:oQ(k3(t, 1.3, 2.5)), rise:2, alpha:A});
    v3Line(c, 42, 58, y2 + mh + fs*1.35 + 7, acc, .3, oQ(k3(t, 2.2, 3.0)), A);
    v3Text(c, (v3t("outro.tag1") + " " + v3t("outro.tag2")).trim(), 50, y2 + mh + fs*1.35 + 16, {size:G.is9 ? 3.6 : 3.2, italic:true, color:C3.oli, align:"c", p:oQ(k3(t, 2.6, 3.6)), alpha:A});
    foot(C3.mut, C3.ink);
  } else if(id === "bokstav"){
    var y3 = cy - (G.is9 ? 12 : 10);
    v3Lock(c, 50, y3, capH, "#fff", C3.dotL, {pm:oQ(k3(t, .4, 1.4)), pd:oQ(k3(t, 1.0, 1.8)), letters:k3(t, .9, 2.8), alpha:A});
    v3Line(c, 42, 58, y3 + capH*1.9, C3.olil, .3, oQ(k3(t, 2.6, 3.3)), A);
    v3Text(c, (v3t("outro.tag1") + " " + v3t("outro.tag2")).trim(), 50, y3 + capH*1.9 + 9, {size:G.is9 ? 3.8 : 3.3, italic:true, color:C3.cream, align:"c", p:oQ(k3(t, 3.0, 4.0)), alpha:A});
    v3Text(c, v3t("outro.url"), 50, ft - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:"#fff", align:"c", alpha:A*oQ(k3(t, 3.4, 4.2))});
  } else if(id === "marke"){
    var y4 = cy - (G.is9 ? 12 : 10), mh2 = capH*1.55, mw2 = mh2*858.6/756.3;
    var fs2 = capH/.7, ww = v3Measure(c, "VIEWLY", {size:fs2, weight:500, f:"sans", sp:.2}), gap = capH*.95, tot = mw2 + gap + ww;
    var slide = ioQ(k3(t, 1.5, 2.8)), ms = lerp(2.6, 1, ioQ(k3(t, .3, 1.5)));
    var xC = 50 - mw2*ms/2, xL = 50 - tot/2, mx = lerp(xC, xL, slide);
    v3Mark(c, mx, y4 - mh2*ms/2, mh2*ms, C3.ink, C3.oli, {alpha:A*oQ(k3(t, .2, .8)), dot:oQ(k3(t, 1.0, 1.7))});
    var wx = xL + mw2 + gap;
    c.save(); c.beginPath(); c.rect(xL + mw2 + 1, y4 - capH*2, ww + gap + 3, capH*4); c.clip();
    v3Text(c, "VIEWLY", wx - (1 - slide)*(ww + gap), y4 + capH/2 + capH*.02, {size:fs2, weight:500, f:"sans", sp:.2, color:C3.ink, alpha:A*slide});
    c.restore();
    v3Line(c, 42, 58, y4 + capH*1.9, C3.oli, .3, oQ(k3(t, 2.6, 3.3)), A);
    v3Text(c, (v3t("outro.tag1") + " " + v3t("outro.tag2")).trim(), 50, y4 + capH*1.9 + 9, {size:G.is9 ? 3.8 : 3.3, italic:true, color:C3.oli, align:"c", p:oQ(k3(t, 3.0, 4.0)), alpha:A});
    v3Text(c, v3t("outro.url"), 50, ft - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:C3.ink, align:"c", alpha:A*oQ(k3(t, 3.4, 4.2))});
  } else {   /* foto i ordbilden */
    var w20 = v3Measure(c, "VIEWLY", {size:20, weight:700, f:"sans", sp:.06}), fs3 = 20*80/w20, y5 = cy + 4;
    var w3 = v3Measure(c, "VIEWLY", {size:fs3, weight:700, f:"sans", sp:.06}), reveal = oQ(k3(t, .6, 2.2));
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
    v3Mark(c, 50 - mh3*858.6/756.3/2, y5 - fs3 - mh3 - 5, mh3, "#fff", C3.dotL, {reveal:oQ(k3(t, .3, 1.4)), dot:oQ(k3(t, 1.0, 1.8)), alpha:A});
    v3Line(c, 42, 58, y5 + 8, C3.olil, .3, oQ(k3(t, 2.2, 3.0)), A);
    v3Text(c, (v3t("outro.tag1") + " " + v3t("outro.tag2")).trim(), 50, y5 + 17, {size:G.is9 ? 3.8 : 3.3, italic:true, color:C3.cream, align:"c", p:oQ(k3(t, 2.6, 3.6)), alpha:A});
    v3Text(c, v3t("outro.url"), 50, ft - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:"#fff", align:"c", alpha:A*oQ(k3(t, 3.2, 4.0))});
  }
}

/* ---------------------------------------------------------------------
   KOMPOSITIONER — fem videor med olika uppbyggnad, samma bildspråk.
     1  Till salu · Overlay   hook på fotot → leveranssidan → mall → formaten → logga
     2  Såld · Editorial       samma resa, slutar på Såld, utan formatbilden
     3  Före / efter           ett reglage visar vad som hände med bilden
     4  Välj bild. Välj mall.  börjar i portalen, hooken är bara text
     5  Direkt                 kortversion: bild vald, mallen fylls, logga
   Råtiden skalas med WARP (utom nr 3). Varje sekund är räknad.
   --------------------------------------------------------------------- */
var V3_WARP = 1.08;
function v3W(list, w){ return list.map(function(x){ return Array.isArray(x) ? x.map(function(y, i){ return i < 2 && typeof y === "number" ? y/w : y }) : x/w }) }
function v3Cues(w, d){
  var o = {chords:d.chords.map(function(k){ return [k[0]/w, k[1]/w, k[2]] }), whoosh:d.whoosh.map(function(x){ return x/w }), tap:d.tap.map(function(x){ return x/w }),
           pop:d.pop.map(function(x){ return x/w }), chime:d.chime.map(function(x){ return x/w }), riser:d.riser.map(function(r){ return [r[0]/w, r[1]/w] }), sub:d.sub/w, tail:d.tail/w};
  return o;
}
var V3_VARS = [
  {id:"salu",   n:"Till salu · Overlay",   d:"Poster-detaljen. Hook, leveranssida, mall, formaten, logga.",   photo:"home",    tpl:"overlay",   phase:"tillsalu", kind:"flow",   trio:true},
  {id:"sald",   n:"Såld · Editorial",      d:"Sovrummet. Samma resa, slutar på Såld.",                          photo:"bedroom", tpl:"editorial", phase:"sald",     kind:"flow",   trio:false},
  {id:"fore",   n:"Före / efter",          d:"Matsalen. Ett reglage visar vad som hände med bilden.",          photo:"dining",  tpl:"badge",     phase:"tillsalu", kind:"fore"},
  {id:"portal", n:"Välj bild. Välj mall.", d:"Hallen. Börjar i portalen, hooken är bara text.",                photo:"beige",   tpl:"editorial", phase:"kommande", kind:"portal"},
  {id:"direkt", n:"Direkt",                d:"Terrassen. Kortversion: bild vald, mallen fylls, logga.",        photo:"terrace", tpl:"editorial", phase:"tillsalu", kind:"direkt"},
  {id:"kommande", n:"Kommande · Badge",     d:"Huset. Samma resa, mallen visar Kommande.",                     photo:"house",   tpl:"badge",     phase:"kommande", kind:"flow",   trio:false},
  {id:"sald2",  n:"Såld · Overlay",        d:"Förstugan. Kortversion som slutar på Såld.",                     photo:"porch",   tpl:"overlay",   phase:"sald",     kind:"direkt"},
  {id:"salu3",  n:"Till salu · Badge",     d:"Hallen. Kortversion med märke på bilden.",                       photo:"beige",   tpl:"badge",     phase:"tillsalu", kind:"direkt"},
  {id:"sald3",  n:"Såld · Badge",          d:"Terrassen. Börjar i portalen, slutar på Såld.",                  photo:"terrace", tpl:"badge",     phase:"sald",     kind:"portal"}
];
var V3_COMPS = {};
(function(){
  var FLOW = {whoosh:[3.9, 8.9, 11.9], tap:[7.9, 11.0], pop:[5.9, 6.2, 6.5, 9.5, 9.7, 9.9, 13.9, 14.7, 15.6]};
  var DIR = {whoosh:[3.9, 8.3], tap:[7.5], pop:[5.9, 6.2, 6.5, 10.2, 10.9, 11.8]};
  V3_VARS.forEach(function(v){
    var comp = {n:v.n, d:v.d, v:v, thumb:3.4}, mk = function(extra){ return {photo:v.photo, tpl:v.tpl, phase:v.phase, hook:extra.hook, fore:extra.fore, typo:extra.typo} };
    if(v.kind === "flow"){
      var w = V3_WARP, outroAt = v.trio ? 19.6 : 17.0, raw = outroAt + 4.4; comp.dur = raw/w;
      comp.draw = function(c, G, t, o){
        var tt = t*w, op = mk(o);
        if(tt < outroAt + .6) v3Flow(c, G, tt, op);
        if(v.trio && tt >= 17.0 && tt < outroAt + .8)v3Trio(c, G, tt, 17.0, op);
        if(tt >= outroAt) v3Outro(c, G, o.outro, tt - outroAt);
      };
      comp.audio = v3Cues(w, {chords:v.trio ? [[0, 4, 0], [4, 12, 1], [12, 17, 2], [17, 19.6, 3], [19.6, raw, 0]] : [[0, 4, 0], [4, 12, 1], [12, 17, 2], [17, raw, 0]],
        whoosh:FLOW.whoosh.concat(v.trio ? [17.0, 19.5] : [16.9]), tap:FLOW.tap, pop:FLOW.pop, chime:[16.6], riser:[[outroAt - 1.6, 1.5]], sub:outroAt + .1, tail:raw});
    } else if(v.kind === "fore"){
      var rawF = 7.6 + 4.4; comp.dur = rawF; comp.thumb = 3.0;
      comp.draw = function(c, G, t, o){
        var op = mk(o);
        if(t < 8.2) v3Fore(c, G, t, op);
        if(t >= 7.6) v3Outro(c, G, o.outro, t - 7.6);
      };
      comp.audio = v3Cues(1, {chords:[[0, 3.6, 0], [3.6, 7.6, 2], [7.6, rawF, 0]], whoosh:[3.5, 7.5], tap:[], pop:[], chime:[6.0], riser:[[6.0, 1.5]], sub:7.7, tail:rawF});
    } else if(v.kind === "portal"){
      var w2 = V3_WARP, outroAt2 = 15.2, raw2 = outroAt2 + 4.4; comp.dur = raw2/w2; comp.thumb = 1.0;
      comp.draw = function(c, G, t, o){
        var tt = t*w2, op = mk(o); op.skipHook = true; op.noMorph = true;
        if(tt >= 1.7 && tt < outroAt2 + .6) v3Flow(c, G, tt + 1.8, op);
        if(tt < 2.6) v3TypoHook(c, G, tt, o.typo);
        if(tt >= outroAt2) v3Outro(c, G, o.outro, tt - outroAt2);
      };
      comp.audio = v3Cues(w2, {chords:[[0, 2.2, 0], [2.2, 10, 1], [10, 15.2, 2], [15.2, raw2, 0]],
        whoosh:[2.1, 7.1, 10.1, 15.1], tap:[6.1, 9.2], pop:[4.1, 4.4, 4.7, 7.7, 7.9, 8.1, 12.1, 12.9, 13.8], chime:[14.8], riser:[[13.6, 1.5]], sub:15.3, tail:raw2});
    } else {
      var w3 = V3_WARP, outroAt3 = 13.4, raw3 = outroAt3 + 4.4; comp.dur = raw3/w3;
      comp.draw = function(c, G, t, o){
        var tt = t*w3, op = mk(o); op.hook = o.fore; op.T = V3T_DIRECT;
        if(tt < outroAt3 + .6) v3Flow(c, G, tt, op);
        if(tt >= outroAt3) v3Outro(c, G, o.outro, tt - outroAt3);
      };
      comp.audio = v3Cues(w3, {chords:[[0, 4, 0], [4, 8.3, 1], [8.3, 13.4, 2], [13.4, raw3, 0]], whoosh:DIR.whoosh.concat([13.3]), tap:DIR.tap, pop:DIR.pop, chime:[12.9], riser:[[11.8, 1.5]], sub:13.5, tail:raw3});
    }
    V3_COMPS[v.id] = comp;
  });
})();

/* ---------------------------------------------------------------------
   STATISKA ANNONSER OCH KARUSELL (4:5). Samma kod som videon, fruset.
   --------------------------------------------------------------------- */
function v3Headline(c, lines, y, size, o){
  o = o || {};
  lines.forEach(function(l, i){
    v3Text(c, l[0], o.x == null ? 50 : o.x, y + i*size*1.04, {size:size, italic:l[1], color:l[2] || "#fff", align:o.align || "c", shadow:o.shadow});
  });
}
function v3Small(c, s, x, y, col, al, a, sz){ v3Text(c, s, x, y, {size:sz || 2, weight:500, f:"sans", sp:.28, color:col || "#fff", align:al || "c", alpha:a == null ? .85 : a}) }
function v3PhotoFrame(c, G, name, scrimTop){
  v3Photo(c, name, 0, 0, 100, G.H);
  v3Grad(c, 0, G.H*(scrimTop || .36), 100, G.H*(1 - (scrimTop || .36)), [[0, "rgba(14,14,13,0)"], [1, "rgba(14,14,13,.86)"]]);
  v3Grad(c, 0, 0, 100, G.H*.18, [[0, "rgba(14,14,13,.45)"], [1, "rgba(14,14,13,0)"]]);
  v3Frame(c, 4, 4, 92, G.H - 8, "#fff", .26, 1, .5);
}
function v3Opts(){ return {photo:"home", tpl:"overlay", phase:"tillsalu", noMorph:true, T:V3T_FULL, hook:V3_CFG.hook, fore:V3_CFG.fore, typo:V3_CFG.typo} }
var V3_STATIC = [
  {id:"p1", n:"Välj bild. Välj mall.", d:"Text och det färdiga inlägget.", draw:function(c, G){
      v3Fill(c, 0, 0, 100, G.H, C3.paper);
      v3Small(c, "VIEWLY · MÄKLARPORTALEN", 50, 11, C3.mut, "c", 1);
      v3Text(c, V3_CFG.typo[0], 50, 31, {size:14, color:C3.ink, align:"c"});
      v3Text(c, V3_CFG.typo[1], 50, 45, {size:14, italic:true, color:C3.oli, align:"c"});
      var w = 50, x = 25, y = 53; v3Shadow(c, [x, y, w, w*1.25], .35, 4); v3Post(c, "overlay", "tillsalu", "home", x, y, w, 1.25, 1);
  }},
  {id:"p2", n:"Leveranssidan", d:"Uppgifterna ligger redan där. Markören på bilden.", draw:function(c, G){
      var o = v3Opts(); v3Fill(c, 0, 0, 100, G.H, C3.ui); v3Portal(c, G, 7.2, 1, o);
      var tx = 8 + G.tw*.58, ty = G.gridY + G.th*.62; v3Tap(c, tx, ty, .3); v3Cursor(c, tx, ty, 0, 1);
  }},
  {id:"p3", n:"Klart i alla format", d:"Samma inlägg som story, inlägg och kvadrat.", draw:function(c, G){
      v3Fill(c, 0, 0, 100, G.H, C3.dark); v3DarkBg(c, G, 1, 0);
      v3Trio(c, G, 20, 17.0, {photo:"home", tpl:"overlay", phase:"tillsalu"});
      v3Lock(c, 50, G.H - 11, 2.2, "#fff", C3.dotL);
  }},
  {id:"p4", n:"Fotona levereras. Kampanjen är klar.", d:"Foto först, ett påstående.", draw:function(c, G){
      v3PhotoFrame(c, G, "home", .4);
      v3Small(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, 11, "#fff", "c", .9);
      v3Headline(c, [["Fotona levereras.", false], ["Kampanjen är klar.", true, C3.cream]], G.H - 33, 10.2, {shadow:true});
      v3Lock(c, 50, G.H - 11, 2.1, "#fff", C3.dotL);
  }},
  {id:"p5", n:"Du bokar. Vi sköter resten.", d:"Sloganen ur viewly.se/maklare.", draw:function(c, G){
      v3PhotoFrame(c, G, "dining", .4);
      v3Small(c, "FÖR FASTIGHETSMÄKLARE I SKÅNE", 50, 11, "#fff", "c", .9);
      v3Headline(c, [["Du bokar.", false], ["Vi sköter resten.", true, C3.cream]], G.H - 33, 10.6, {shadow:true});
      v3Lock(c, 50, G.H - 11, 2.1, "#fff", C3.dotL);
  }},
  {id:"p6", n:"Varumärket · skymning", d:"Stor logga över foto.", draw:function(c, G){ v3Outro(c, G, "foto", 5, {noFade:true}) }}
];
var V3_CAR = {
  b:{n:"Så fungerar det", d:"Sex bilder: frågan, leveranssidan, mallen, resultatet, formaten och Viewly.", slides:[
    function(c, G){
      v3PhotoFrame(c, G, "dining", .34);
      v3Small(c, "VIEWLY · EFTER LEVERANSEN", 50, 11, "#fff", "c", .9);
      v3Headline(c, [["Dina bilder", false], ["är levererade.", false], ["Nu då?", true, C3.cream]], G.H - 44, 12, {shadow:true});
    },
    function(c, G){ var o = v3Opts(); v3Fill(c, 0, 0, 100, G.H, C3.ui); v3Portal(c, G, 7.2, 1, o); var tx = 8 + G.tw*.58, ty = G.gridY + G.th*.62; v3Tap(c, tx, ty, .3); v3Cursor(c, tx, ty, 0, 1) },
    function(c, G){ var o = v3Opts(); v3Fill(c, 0, 0, 100, G.H, C3.ui); v3Portal(c, G, 11.4, 1, o) },
    function(c, G){
      v3Fill(c, 0, 0, 100, G.H, C3.dark); v3DarkBg(c, G, 1, 0);
      v3Shadow(c, [G.CX, G.CY, G.CW, G.CH], .5, 5); v3Post(c, "overlay", "tillsalu", "home", G.CX, G.CY, G.CW, 1.25, 1);
    },
    function(c, G){ v3Fill(c, 0, 0, 100, G.H, C3.dark); v3DarkBg(c, G, 1, 0); v3Trio(c, G, 20, 17.0, {photo:"home", tpl:"overlay", phase:"tillsalu"}) },
    function(c, G){ v3Outro(c, G, "papper", 5, {noFade:true}) }
  ]}
};
