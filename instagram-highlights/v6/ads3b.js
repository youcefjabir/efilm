/* =====================================================================
   ADS 3 — del B: scener, kompositioner, statiska annonser

   Berättelsen, i den ordning en mäklare tar in den:
     1. Fotona är bra.                          (foto först)
     2. De är levererade. I Mäklarportalen:
          Välj bild.  Välj mall.  Uppgifterna hämtas automatiskt.
     3. Inlägget är klart, i kontorets egen profil.
     4. Klart i alla format. Mer tid över.       (budskapet, inte ordagrant)
     5. Varumärket, en egen sekund.              (slutkort)

   Färgerna är Viewlys egna: papper, ink, oliv, och varmt svart. Inget
   blått och inget guld. Kontorets färger (exempelkontoret Nordvik) syns
   bara i inlägget, där de hör hemma.

   Allt som ritas ligger innanför bilden och, i 9:16, innanför ytan som
   Instagrams eget gränssnitt inte täcker.
   ===================================================================== */

function v3Geo(fmt){
  var is9 = fmt === "916", H = is9 ? 177.78 : 125, top = is9 ? 26 : 8, bot = is9 ? 31.5 : 8;
  var g = {is9:is9, H:H, top:top, bot:bot, cy:(top + H - bot)/2, fmt:fmt};
  g.CW = is9 ? 78 : 68; g.CH = g.CW*1.25; g.CX = (100 - g.CW)/2; g.CY = g.cy - g.CH/2;
  g.labY = top + (is9 ? 13.4 : 10.6); g.headY = g.labY + (is9 ? 10.6 : 9.2); g.stepY = g.headY + (is9 ? 8 : 6.6);
  g.gridY = g.stepY + (is9 ? 7.4 : 5.6); g.tw = 26.4; g.th = is9 ? 33 : 30;
  return g;
}
function v3Mix(a, b, p){ return [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p), lerp(a[3], b[3], p)] }
function v3Shadow(c, r, a, blur){
  c.save(); c.shadowColor = "rgba(0,0,0," + a + ")"; c.shadowBlur = blur; c.shadowOffsetY = blur*.3;
  c.fillStyle = "#000"; c.fillRect(r[0], r[1], r[2], r[3]); c.restore();
}
/* Mörk scen: samma foto, mjukt och varmt svart. Ingen blå ton. */
function v3DarkBg(c, G, a, t){
  c.save(); c.globalAlpha = a;
  v3Photo(c, "blur", 0, 0, 100, G.H, {scale:1.3 + .02*Math.sin((t || 0)*.25), pos:[.5 + .02*Math.sin((t || 0)*.2), .5]});
  c.fillStyle = "rgba(14,14,13,.78)"; c.fillRect(0, 0, 100, G.H);
  v3Grad(c, 0, 0, 100, G.H, [[0, "rgba(6,6,5,.35)"], [.5, "rgba(6,6,5,0)"], [1, "rgba(6,6,5,.4)"]]);
  c.restore();
}
function v3Cursor(c, x, y, press, a){
  c.save(); c.globalAlpha = a == null ? 1 : a; c.translate(x, y); var s = (1 - press*.14)*.26; c.scale(s, s);
  c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 6; c.shadowOffsetY = 2;
  c.beginPath(); c.moveTo(2, 2); c.lineTo(2, 28); c.lineTo(9, 21.4); c.lineTo(13.6, 31.8); c.lineTo(17.8, 29.9); c.lineTo(13.2, 19.7); c.lineTo(23, 19.4); c.closePath();
  c.fillStyle = "#1C1C1E"; c.fill(); c.shadowColor = "transparent"; c.lineWidth = 1.8; c.strokeStyle = "#fff"; c.lineJoin = "round"; c.stroke(); c.restore();
}
function v3Tap(c, x, y, p){
  if(p <= 0 || p >= 1) return;
  var rp = oQ(p);
  c.save(); c.globalAlpha = (1 - rp)*.7; c.strokeStyle = C3.oli; c.lineWidth = .4; c.beginPath(); c.arc(x, y, 1.2 + rp*6.5, 0, Math.PI*2); c.stroke(); c.restore();
}
function v3Tick(c, x, y, r, p, col){
  if(p <= 0) return;
  var s = oBack(mclamp(p));
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = col || C3.oli; c.beginPath(); c.arc(0, 0, r, 0, Math.PI*2); c.fill();
  c.strokeStyle = "#fff"; c.lineWidth = r*.2; c.lineCap = "round"; c.lineJoin = "round";
  c.beginPath(); c.moveTo(-r*.42, r*.04); c.lineTo(-r*.1, r*.36); c.lineTo(r*.46, -r*.32); c.stroke(); c.restore();
}

/* —— Mäklarportalen: tre steg ———————————————————————————————————— */
var V3_ALL = ["home", "dining", "beige", "bedroom", "terrace", "house"];
function v3Tiles(sel){ return [sel].concat(V3_ALL.filter(function(n){ return n !== sel })).slice(0, 6) }
var V3_STYLES = ["overlay", "editorial", "badge"], V3_STYLE_N = ["OVERLAY", "EDITORIAL", "BADGE"];
function v3Fields(){
  return [["ADRESS", V3_OBJ.addr + ", " + V3_OBJ.city], ["BOSTAD", V3_OBJ.rum + " rum · " + V3_OBJ.yta + " m²"], ["PRIS", "Utgångspris " + V3_OBJ.pris + " kr"],
          ["VISNING", V3_OBJ.visning], ["MÄKLARE", V3_OBJ.maklare], ["PROFIL", OFF.name.charAt(0) + OFF.name.slice(1).toLowerCase() + " · logga, färger"]];
}
/* tider (råtid) för portalen */
var V3T = {ui:[4.0, 5.0], sel:[7.5, 7.65], m12:[8.3, 9.0], tp:[10.45, 10.6], m23:[11.3, 12.0], chk:12.2, chkStep:.5, uiOut:[15.6, 16.3]};
function v3Portal(c, G, t, ua, o){
  var ink = C3.ink, mut = C3.mut, m = 8, tl = v3Tiles(o.photo), sidx = V3_STYLES.indexOf(o.tpl);
  var m12 = ioC(k3(t, V3T.m12[0], V3T.m12[1])), m23 = ioC(k3(t, V3T.m23[0], V3T.m23[1]));
  var step = m23 > .5 ? 3 : m12 > .5 ? 2 : 1;
  /* sidhuvud */
  var q = oQ(k3(t, 4.4, 5.3));
  c.save(); c.globalAlpha = ua*q;
  v3Lock(c, 0, G.top + 2.2, 2.4, ink, C3.oli, {left:m});
  v3Text(c, "MÄKLARPORTALEN", 100 - m, G.top + 3, {size:1.8, weight:500, f:"sans", sp:.24, color:mut, align:"r"});
  c.restore();
  v3Line(c, m, 100 - m, G.top + 7.4, C3.uil, .2, oQ(k3(t, 4.5, 5.6)), ua);
  v3Text(c, (V3_OBJ.addr + " · " + V3_OBJ.city + " · 12 bilder levererade").toUpperCase(), m, G.labY, {size:1.85, weight:500, f:"sans", sp:.22, color:mut, alpha:ua, p:oQ(k3(t, 4.8, 5.8))});
  /* rubrik per steg */
  var hs = G.is9 ? 9.4 : 7.8, hq = oQ(k3(t, 5.1, 6.2));
  v3Text(c, "Välj bild.", m, G.headY, {size:hs, color:ink, alpha:ua*(1 - m12), p:hq, rise:1.6});
  v3Text(c, "Välj mall.", m, G.headY, {size:hs, color:ink, alpha:ua*m12*(1 - m23), p:m12, rise:1.6});
  v3Text(c, "Uppgifterna hämtas.", m, G.headY, {size:hs, color:ink, alpha:ua*m23, p:m23, rise:1.6});
  /* stegindikator */
  var sq = oQ(k3(t, 5.4, 6.3)), labels = ["VÄLJ BILD", "VÄLJ MALL", "UPPGIFTER"], sx = [m, m + 29, m + 58];
  labels.forEach(function(lb, i){
    var done = step > i + 1, act = step === i + 1, x = sx[i];
    c.save(); c.globalAlpha = ua*sq;
    if(done) v3Tick(c, x + 1.7, G.stepY - .7, 1.7, 1, C3.oli);
    else { c.fillStyle = act ? ink : "rgba(28,28,30,.12)"; c.beginPath(); c.arc(x + 1.7, G.stepY - .7, 1.7, 0, Math.PI*2); c.fill(); v3Text(c, String(i + 1), x + 1.7, G.stepY - .05, {size:1.7, weight:600, f:"sans", color:act ? "#fff" : mut, align:"c"}) }
    v3Text(c, lb, x + 4.4, G.stepY, {size:1.75, weight:act ? 600 : 500, f:"sans", sp:.2, color:act ? ink : mut});
    if(act) v3Fill(c, x + 4.4, G.stepY + 1.7, 22, .3, C3.oli);
    c.restore();
  });
  /* steg 1: bildrutor (nr 0 ritas av fotot som morfar in) */
  var a1 = 1 - m12;
  if(a1 > 0) tl.forEach(function(nm, i){
    if(i === 0) return;
    var col = i % 3, row = Math.floor(i/3), x = m + col*(G.tw + 2.4), y = G.gridY + row*(G.th + 2.4);
    var qi = oQ(k3(t, 5.5 + i*.15, 6.3 + i*.15)), dim = lerp(1, .3, ioC(k3(t, 7.7, 8.1)));
    c.save(); c.globalAlpha = ua*qi*dim*a1;
    v3Photo(c, nm, x, y + (1 - qi)*3, G.tw, G.th);
    if(i === 5){ v3Fill(c, x, y + (1 - qi)*3, G.tw, G.th, "#0e0e0d", .55); v3Text(c, "+7", x + G.tw/2, y + (1 - qi)*3 + G.th/2 + 2.4, {size:7, color:"#fff", align:"c"}) }
    c.restore();
  });
  /* steg 2: mallarna */
  if(m12 > 0 && m23 < 1) V3_STYLES.forEach(function(st, i){
    var x = m + i*(G.tw + 2.4), y = G.gridY, qi = oQ(k3(t, 8.8 + i*.2, 9.6 + i*.2)), dim = i === sidx ? 1 : lerp(1, .32, ioC(k3(t, 10.65, 11.1)));
    var a = ua*qi*dim*(1 - m23);
    if(a <= 0) return;
    c.save(); c.globalAlpha = a;
    v3Shadow(c, [x, y + (1 - qi)*3, G.tw, G.th], .22, 2);
    v3Post(c, st, o.phase, o.photo, x, y + (1 - qi)*3, G.tw, 1.25, 1);
    c.restore();
    c.save(); c.globalAlpha = a;
    v3Text(c, V3_STYLE_N[i], x + G.tw/2, y + G.th + 5, {size:1.7, weight:i === sidx && t > V3T.tp[0] ? 600 : 500, f:"sans", sp:.26, color:ink, align:"c"});
    if(i === sidx){ var rk = k3(t, V3T.tp[0], V3T.tp[1]); if(rk > 0){ c.globalAlpha = a*Math.min(1, rk*2); c.strokeStyle = ink; c.lineWidth = .5; c.strokeRect(x - .9, y - .9 + (1 - qi)*3, G.tw + 1.8, G.th + 1.8); v3Tick(c, x + G.tw - .4, y - .4, 2.2, oQ(k3(t, V3T.tp[0] + .05, V3T.tp[0] + .35)), C3.oli) } }
    c.restore();
  });
  if(m12 > 0 && m23 < 1){
    var na = ua*oQ(k3(t, 9.8, 10.6))*(1 - m23);
    v3Text(c, "Mallen följer kontorets profil:", m, G.gridY + G.th + 15, {size:3.9, italic:true, color:mut, alpha:na});
    v3Text(c, "logga, färger och typsnitt.", m, G.gridY + G.th + 20.2, {size:3.9, italic:true, color:mut, alpha:na});
  }
  /* steg 3: uppgifterna hämtas automatiskt */
  if(m23 > 0){
    var sx0 = m + G.tw + 5, y0 = G.gridY + 5, rowH = G.is9 ? 9.4 : 7.0;
    v3Text(c, "HÄMTAS FRÅN LEVERANSEN", sx0, G.gridY + .4, {size:1.7, weight:600, f:"sans", sp:.24, color:C3.oli, alpha:ua*m23});
    v3Fields().forEach(function(f, i){
      var rs = V3T.chk + i*V3T.chkStep, rq = oQ(k3(t, rs, rs + .5)), tq = k3(t, rs + .35, rs + .65), y = y0 + i*rowH + 3.4;
      v3Line(c, sx0, 100 - m, y + 2.2, C3.uil, .15, rq, ua*m23);
      v3Text(c, f[0], sx0, y - 2.4, {size:1.35, weight:600, f:"sans", sp:.22, color:mut, alpha:ua*m23*rq});
      v3Text(c, f[1], sx0, y + 1.4, {size:G.is9 ? 4.1 : 3.5, color:ink, alpha:ua*m23, p:rq});
      c.save(); c.globalAlpha = ua*m23; v3Tick(c, 100 - m - 1.9, y - .4, 1.9, tq, C3.oli); c.restore();
    });
    var done = k3(t, V3T.chk + 5*V3T.chkStep + .6, V3T.chk + 5*V3T.chkStep + 1.1);
    v3Text(c, "Klart.", m, G.gridY + G.tw*1.25 + (G.is9 ? 12 : 10), {size:G.is9 ? 8 : 6.6, italic:true, color:C3.oli, alpha:ua*m23, p:oQ(done), rise:1.6});
  }
}

/* —— Hook + portal + montering (flödet) ——————————————————————————— */
var V3_FLOW_END = 22.2;
function v3Flow(c, G, t, o){
  var H = G.H, FULL = [0, 0, 100, H], sidx = V3_STYLES.indexOf(o.tpl);
  var TILE = [8, G.gridY, G.tw, G.th], PREV = [8, G.gridY, G.tw, G.tw*1.25], CARD = [G.CX, G.CY, G.CW, G.CH];
  var tcol = [8 + sidx*(G.tw + 2.4), G.gridY, G.tw, G.tw*1.25];
  v3Fill(c, 0, 0, 100, H, C3.dark);
  var nb = ioC(k3(t, 15.8, 16.8));
  if(nb > 0) v3DarkBg(c, G, nb, t);
  var ub = ioC(k3(t, V3T.ui[0], V3T.ui[1]))*(1 - ioC(k3(t, V3T.uiOut[0], V3T.uiOut[1])));
  if(ub > 0){ v3Fill(c, 0, 0, 100, H, C3.ui, ub); v3Portal(c, G, t, ub, o) }

  var q1 = ioQ(k3(t, 4.0, 5.4)), q3 = ioQ(k3(t, 15.8, 17.0));
  var sc = lerp(1.14, 1.02, ioC(k3(t, 0, 5)));
  if(t < 17.0){
    /* fotot: helbild → bildruta 1 → (steg 2/3) mallkort → kort */
    if(t < 8.3){
      var r = t >= 4.0 ? v3Mix(FULL, TILE, q1) : FULL, s2 = t >= 4.0 ? lerp(sc, 1, q1) : sc;
      if(t >= 4.2) v3Shadow(c, r, .16*k3(t, 4.2, 5.4), 2);
      v3Photo(c, o.photo, r[0], r[1], r[2], r[3], {scale:s2});
      var rk = k3(t, V3T.sel[0], V3T.sel[1] + .3)*(1 - k3(t, 8.2, 8.6));
      if(rk > 0){ c.save(); c.globalAlpha = rk; c.strokeStyle = C3.ink; c.lineWidth = .5; c.strokeRect(TILE[0] - .9, TILE[1] - .9, TILE[2] + 1.8, TILE[3] + 1.8); c.restore(); v3Tick(c, TILE[0] + TILE[2] - .4, TILE[1] - .4, 2.2, oQ(k3(t, V3T.sel[0] + .05, V3T.sel[0] + .4)), C3.oli) }
    } else if(t < 11.3){
      /* valda fotot bleknar bort när mallkorten tar över */
      var fa = 1 - ioC(k3(t, 8.4, 8.9));
      if(fa > 0){ c.save(); c.globalAlpha = fa; v3Photo(c, o.photo, TILE[0], TILE[1], TILE[2], TILE[3]); c.restore() }
    }
    /* steg 3: valda mallen står kvar till vänster */
    if(t >= 11.3 && t < 15.8){
      var mv = ioQ(k3(t, V3T.m23[0], V3T.m23[1] + .3)), pr = v3Mix(tcol, PREV, mv);
      c.save(); c.globalAlpha = ioC(k3(t, 11.3, 11.7)) > 0 ? 1 : 0; v3Shadow(c, pr, .22, 2);
      v3Post(c, o.tpl, o.phase, o.photo, pr[0], pr[1], pr[2], 1.25, 0); c.restore();
    }
    if(t >= 15.8){
      var rr = v3Mix(PREV, CARD, q3);
      v3Shadow(c, rr, .5*q3, 5);
      v3Post(c, o.tpl, o.phase, o.photo, rr[0], rr[1], rr[2], 1.25, 0);
    }
    /* markören */
    if(t >= 6.1 && t < 11.0){
      var tx = TILE[0] + TILE[2]*.58, ty = TILE[1] + TILE[3]*.62, px = tcol[0] + tcol[2]*.6, py = tcol[1] + tcol[3]*.6, cx, cy;
      var mA = ioC(k3(t, 6.1, 7.4)), mB = ioC(k3(t, 9.3, 10.35));
      if(t < 9.3){ cx = lerp(96, tx, mA); cy = lerp(G.H - 18, ty, mA) - Math.sin(mA*Math.PI)*4 }
      else { cx = lerp(tx, px, mB); cy = lerp(ty, py, mB) - Math.sin(mB*Math.PI)*3 }
      var prs = Math.max(k3(t, V3T.sel[0] - .15, V3T.sel[0]) * (1 - k3(t, V3T.sel[1], V3T.sel[1] + .15)), k3(t, V3T.tp[0] - .15, V3T.tp[0]) * (1 - k3(t, V3T.tp[1], V3T.tp[1] + .15)));
      v3Cursor(c, cx, cy, prs, k3(t, 6.1, 6.5)*(1 - k3(t, 10.8, 11.2)));
      v3Tap(c, tx, ty, k3(t, V3T.sel[0], V3T.sel[0] + .7)); v3Tap(c, px, py, k3(t, V3T.tp[0], V3T.tp[0] + .7));
    }
  } else if(t < 21.8){
    var prog = k3(t, 17.4, 20.6), zoom = 1 + .025*k3(t, 17.0, 22.2);
    v3Shadow(c, CARD, .5, 5);
    v3Post(c, o.tpl, o.phase, o.photo, CARD[0], CARD[1], CARD[2], 1.25, prog, {zoom:zoom});
  }

  /* hooken */
  if(t < 4.8){
    var out = 1 - ioC(k3(t, 3.9, 4.5)), top = G.top, yb = H - G.bot - 28;
    v3Grad(c, 0, H*.42, 100, H*.58, [[0, "rgba(14,11,11,0)"], [1, "rgba(14,11,11,.78)"]], out);
    v3Grad(c, 0, 0, 100, H*.24, [[0, "rgba(14,11,11,.5)"], [1, "rgba(14,11,11,0)"]], out);
    v3Frame(c, 4, 4, 92, H - 8, "#fff", .26, oQ(k3(t, .2, 1.8)), .5*out);
    v3Text(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, top + 4, {size:2, weight:500, f:"sans", sp:.3, color:"#fff", align:"c", alpha:.92*out, p:oQ(k3(t, .5, 1.7))});
    v3Text(c, o.hook[0], 50, yb, {size:11.2, color:"#fff", align:"c", alpha:out, p:oQ(k3(t, 1.0, 2.5)), rise:2, shadow:true});
    v3Text(c, o.hook[1], 50, yb + 13.6, {size:10.4, italic:true, color:C3.cream, align:"c", alpha:out, p:oQ(k3(t, 2.2, 3.7)), rise:2, shadow:true});
  }
}

/* —— Klart i alla format. Mer tid över. ——————————————————————————— */
function v3Trio(c, G, t, t0, o){
  var is9 = G.is9, a = ioC(k3(t, t0, t0 + .5))*(o.exit ? 1 - ioC(k3(t, t0 + 5.2, t0 + 5.8)) : 1);
  var sw = is9 ? 23 : 21, mw = is9 ? 34 : 31, qw = is9 ? 28 : 25, gap = 3;
  var total = sw + mw + qw + 2*gap, x0 = (100 - total)/2, base = is9 ? G.top + 62 : G.top + 49;
  var main = [G.CX, G.CY, G.CW, G.CH], fin = [x0 + sw + gap, base - mw*1.25, mw, mw*1.25];
  var qm = ioQ(k3(t, t0, t0 + 1.4)), qs = ioQ(k3(t, t0 + .6, t0 + 2.0)), r = v3Mix(main, fin, qm), cx = r[0] + r[2]/2;
  var left = [x0, base - sw*1.7778, sw, sw*1.7778], right = [x0 + sw + gap + mw + gap, base - qw, qw, qw];
  var lr = v3Mix([cx - sw/2, left[1], sw, left[3]], left, qs), rr = v3Mix([cx - qw/2, right[1], qw, right[3]], right, qs);
  var P = [o.tpl, o.phase, o.photo];
  c.save(); c.globalAlpha = a;
  c.save(); c.globalAlpha = a*qs; v3Shadow(c, lr, .4, 4); v3Post(c, P[0], P[1], P[2], lr[0], lr[1], lr[2], 1.7778, 1); c.restore();
  c.save(); c.globalAlpha = a*qs; v3Shadow(c, rr, .4, 4); v3Post(c, P[0], P[1], P[2], rr[0], rr[1], rr[2], 1, 1); c.restore();
  v3Shadow(c, r, .5, 5); v3Post(c, P[0], P[1], P[2], r[0], r[1], r[2], 1.25, 1);
  c.restore();
  var la = oQ(k3(t, t0 + 1.8, t0 + 2.6));
  [[left, "STORY 9:16"], [r, "INLÄGG 4:5"], [right, "KVADRAT 1:1"]].forEach(function(f){
    v3Text(c, f[1], f[0][0] + f[0][2]/2, base + 4.6, {size:1.7, weight:500, f:"sans", sp:.22, color:"#fff", align:"c", alpha:.75*la*a});
  });
  var ty = base + (is9 ? 27 : 20), s1 = is9 ? 14.4 : 11.4;
  v3Text(c, o.msg[0], 50, ty, {size:s1, color:"#fff", align:"c", p:oQ(k3(t, t0 + 1.6, t0 + 3.0)), rise:2.4, alpha:a});
  v3Text(c, o.msg[1], 50, ty + s1*1.0, {size:s1, italic:true, color:C3.olil, align:"c", p:oQ(k3(t, t0 + 2.6, t0 + 4.0)), rise:2.4, alpha:a});
  v3Text(c, "FRÅN LEVERANS TILL FÄRDIG KAMPANJ", 50, ty + s1 + (is9 ? 11 : 8.6), {size:1.9, weight:500, f:"sans", sp:.28, color:"#fff", align:"c", alpha:.8*oQ(k3(t, t0 + 3.6, t0 + 4.6))*a});
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
var V3_TAG = ["En bostadsfotograf som gör", "mer än bara fotografering."];
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
    v3Text(c, "FÖR FASTIGHETSMÄKLARE I SKÅNE", 50, ft - 8, {size:1.95, weight:500, f:"sans", sp:.28, color:col1, align:"c", alpha:A*oQ(k3(t, 3.0, 3.8))});
    v3Text(c, "VIEWLY.SE/MAKLARE", 50, ft - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:col2, align:"c", alpha:A*oQ(k3(t, 3.2, 4.0))});
  };
  if(id === "papper" || id === "mork" || id === "foto"){
    var lp = oQ(k3(t, .5, 1.7)), y = cy - (G.is9 ? 14 : 12);
    v3Lock(c, 50, y, capH, ink, dot, {pm:lp, pd:oQ(k3(t, 1.2, 2.0)), pw:oQ(k3(t, .8, 2.0)), alpha:A});
    v3Line(c, 42, 58, y + capH*1.9, acc, .3, oQ(k3(t, 1.8, 2.6)), A);
    v3Text(c, V3_TAG[0], 50, y + capH*1.9 + 10, {size:G.is9 ? 6 : 5.2, color:tagc, align:"c", p:oQ(k3(t, 2.0, 3.0)), rise:1.6, alpha:A});
    v3Text(c, V3_TAG[1], 50, y + capH*1.9 + 10 + (G.is9 ? 7.4 : 6.4), {size:G.is9 ? 6 : 5.2, italic:true, color:tag2, align:"c", p:oQ(k3(t, 2.5, 3.5)), rise:1.6, alpha:A});
    foot(small, ink);
  } else if(id === "stapel"){
    var mh = G.is9 ? 26 : 21, y2 = cy - (G.is9 ? 24 : 20), fs = G.is9 ? 12 : 10.4;
    v3Mark(c, 50 - mh*858.6/756.3/2, y2, mh, ink, dot, {reveal:oQ(k3(t, .4, 1.6)), dot:oQ(k3(t, 1.2, 2.0)), alpha:A});
    v3Text(c, "VIEWLY", 50, y2 + mh + fs*1.35, {size:fs, weight:500, f:"sans", sp:.3, color:ink, align:"c", p:oQ(k3(t, 1.3, 2.5)), rise:2, alpha:A});
    v3Line(c, 42, 58, y2 + mh + fs*1.35 + 7, acc, .3, oQ(k3(t, 2.2, 3.0)), A);
    v3Text(c, V3_TAG[0] + " " + V3_TAG[1], 50, y2 + mh + fs*1.35 + 16, {size:G.is9 ? 3.6 : 3.2, italic:true, color:C3.oli, align:"c", p:oQ(k3(t, 2.6, 3.6)), alpha:A});
    foot(C3.mut, C3.ink);
  } else if(id === "bokstav"){
    var y3 = cy - (G.is9 ? 12 : 10);
    v3Lock(c, 50, y3, capH, "#fff", C3.olil, {pm:oQ(k3(t, .4, 1.4)), pd:oQ(k3(t, 1.0, 1.8)), letters:k3(t, .9, 2.8), alpha:A});
    v3Line(c, 42, 58, y3 + capH*1.9, C3.olil, .3, oQ(k3(t, 2.6, 3.3)), A);
    v3Text(c, V3_TAG[0] + " " + V3_TAG[1], 50, y3 + capH*1.9 + 9, {size:G.is9 ? 3.8 : 3.3, italic:true, color:C3.cream, align:"c", p:oQ(k3(t, 3.0, 4.0)), alpha:A});
    v3Text(c, "VIEWLY.SE/MAKLARE", 50, ft - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:"#fff", align:"c", alpha:A*oQ(k3(t, 3.4, 4.2))});
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
    v3Text(c, V3_TAG[0] + " " + V3_TAG[1], 50, y4 + capH*1.9 + 9, {size:G.is9 ? 3.8 : 3.3, italic:true, color:C3.oli, align:"c", p:oQ(k3(t, 3.0, 4.0)), alpha:A});
    v3Text(c, "VIEWLY.SE/MAKLARE", 50, ft - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:C3.ink, align:"c", alpha:A*oQ(k3(t, 3.4, 4.2))});
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
    v3Mark(c, 50 - mh3*858.6/756.3/2, y5 - fs3 - mh3 - 5, mh3, "#fff", C3.olil, {reveal:oQ(k3(t, .3, 1.4)), dot:oQ(k3(t, 1.0, 1.8)), alpha:A});
    v3Line(c, 42, 58, y5 + 8, C3.olil, .3, oQ(k3(t, 2.2, 3.0)), A);
    v3Text(c, V3_TAG[0] + " " + V3_TAG[1], 50, y5 + 17, {size:G.is9 ? 3.8 : 3.3, italic:true, color:C3.cream, align:"c", p:oQ(k3(t, 2.6, 3.6)), alpha:A});
    v3Text(c, "VIEWLY.SE/MAKLARE", 50, ft - 3.6, {size:1.95, weight:600, f:"sans", sp:.28, color:"#fff", align:"c", alpha:A*oQ(k3(t, 3.2, 4.0))});
  }
}

/* ---------------------------------------------------------------------
   KOMPOSITIONER — videor i samma stil som "två klick kort": en berättelse,
   fem varianter med olika foto, mall och fas. Råtiden skalas med WARP.
   --------------------------------------------------------------------- */
var V3_WARP = 1.1;
var V3_VARS = [
  {id:"salu",     n:"Till salu · Overlay",    d:"Poster-detaljen. Overlay-mallen, Till salu.",       photo:"home",    tpl:"overlay",   phase:"tillsalu"},
  {id:"salu2",    n:"Till salu · Editorial",  d:"Matsalen. Editorial-mallen, Till salu.",            photo:"dining",  tpl:"editorial", phase:"tillsalu"},
  {id:"visning",  n:"Visning · Badge",        d:"Hallen. Badge-mallen, Visning.",                    photo:"beige",   tpl:"badge",     phase:"visning"},
  {id:"kommande", n:"Kommande · Overlay",     d:"Skymningshuset. Overlay-mallen, Kommande.",         photo:"house",   tpl:"overlay",   phase:"kommande"},
  {id:"sald",     n:"Såld · Editorial",       d:"Sovrummet. Editorial-mallen, Såld.",                photo:"bedroom", tpl:"editorial", phase:"sald"}
];
var V3_RAW = 30.4;
var V3_COMPS = {};
V3_VARS.forEach(function(v){
  V3_COMPS[v.id] = {n:v.n, d:v.d, v:v, dur:V3_RAW/V3_WARP, thumb:3.2,
    draw:function(c, G, t, o){
      var tt = t*V3_WARP, op = {photo:v.photo, tpl:v.tpl, phase:v.phase, hook:o.hook, msg:o.msg};
      if(tt < 26.2) v3Flow(c, G, tt, op);
      if(tt >= 21.8 && tt < 26.6) v3Trio(c, G, tt, 21.8, op);
      if(tt >= 25.8) v3Outro(c, G, o.outro, tt - 25.8);
    },
    audio:{chords:[[0, 4, 0], [4, 11.2, 1], [11.2, 22, 2], [22, 26, 3], [26, 30.4, 0]].map(function(w){ return [w[0]/V3_WARP, w[1]/V3_WARP, w[2]] }),
      whoosh:[3.9, 8.3, 11.3, 15.7, 21.8, 25.8].map(function(x){ return x/V3_WARP }),
      tap:[7.5, 10.45].map(function(x){ return x/V3_WARP }),
      pop:[5.5, 5.7, 5.9, 6.1, 6.3, 8.8, 9.0, 9.2, 12.55, 13.05, 13.55, 14.05, 14.55, 15.05].map(function(x){ return x/V3_WARP }),
      chime:[20.7/V3_WARP], riser:[[24.1/V3_WARP, 1.7/V3_WARP]], sub:26.0/V3_WARP, tail:V3_RAW/V3_WARP}};
});

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
function v3Opts(){ return {photo:V3S_PHOTO(), tpl:"overlay", phase:"tillsalu", hook:V3_CFG.hook, msg:V3_CFG.msg} }
function V3S_PHOTO(){ return "home" }
var V3_STATIC = [
  {id:"p1", n:"Välj bild. Välj mall.", d:"Portalen, steg 2. Markören på mallen.", draw:function(c, G){
      v3Fill(c, 0, 0, 100, G.H, C3.ui); v3Portal(c, G, 10.4, 1, v3Opts());
      v3Photo(c, "home", 8, G.gridY, G.tw, G.th); /* täcks av mallkorten i steg 2 */
  }},
  {id:"p2", n:"Uppgifterna hämtas automatiskt", d:"Portalen, steg 3. Allt bockas av.", draw:function(c, G){
      v3Fill(c, 0, 0, 100, G.H, C3.ui); v3Portal(c, G, 15.2, 1, v3Opts());
      v3Post(c, "overlay", "tillsalu", "home", 8, G.gridY, G.tw, 1.25, 0);
  }},
  {id:"p3", n:"Klart i alla format", d:"Samma inlägg som story, inlägg och kvadrat.", draw:function(c, G){
      v3Fill(c, 0, 0, 100, G.H, C3.dark); v3DarkBg(c, G, 1, 0);
      v3Trio(c, G, 26, 21.8, {photo:"home", tpl:"overlay", phase:"tillsalu", msg:V3_CFG.msg});
      v3Lock(c, 50, G.H - 11, 2.2, "#fff", C3.olil);
  }},
  {id:"p4", n:"Fotona levereras. Kampanjen är klar.", d:"Foto först, ett påstående.", draw:function(c, G){
      v3PhotoFrame(c, G, "home", .4);
      v3Small(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, 11, "#fff", "c", .9);
      v3Headline(c, [["Fotona levereras.", false], ["Kampanjen är klar.", true, C3.cream]], G.H - 33, 10.2, {shadow:true});
      v3Lock(c, 50, G.H - 11, 2.1, "#fff", C3.olil);
  }},
  {id:"p5", n:"Du bokar. Vi sköter resten.", d:"Sloganen ur viewly.se/maklare.", draw:function(c, G){
      v3PhotoFrame(c, G, "dining", .4);
      v3Small(c, "FÖR FASTIGHETSMÄKLARE I SKÅNE", 50, 11, "#fff", "c", .9);
      v3Headline(c, [["Du bokar.", false], ["Vi sköter resten.", true, C3.cream]], G.H - 33, 10.6, {shadow:true});
      v3Lock(c, 50, G.H - 11, 2.1, "#fff", C3.olil);
  }},
  {id:"p6", n:"Varumärket · skymning", d:"Stor logga över foto.", draw:function(c, G){ v3Outro(c, G, "foto", 5, {noFade:true}) }}
];
var V3_CAR = {
  b:{n:"Så fungerar det", d:"Sju bilder: frågan, tre steg i portalen, resultatet, formaten och Viewly.", slides:[
    function(c, G){
      v3PhotoFrame(c, G, "dining", .34);
      v3Small(c, "VIEWLY · EFTER LEVERANSEN", 50, 11, "#fff", "c", .9);
      v3Headline(c, [["Dina bilder", false], ["är levererade.", false], ["Nu då?", true, C3.cream]], G.H - 44, 12, {shadow:true});
    },
    function(c, G){ v3Fill(c, 0, 0, 100, G.H, C3.ui); v3Portal(c, G, 7.0, 1, v3Opts()); v3Photo(c, "home", 8, G.gridY, G.tw, G.th) },
    function(c, G){ v3Fill(c, 0, 0, 100, G.H, C3.ui); v3Portal(c, G, 10.5, 1, v3Opts()) },
    function(c, G){ v3Fill(c, 0, 0, 100, G.H, C3.ui); v3Portal(c, G, 15.2, 1, v3Opts()); v3Post(c, "overlay", "tillsalu", "home", 8, G.gridY, G.tw, 1.25, 0) },
    function(c, G){
      v3Fill(c, 0, 0, 100, G.H, C3.dark); v3DarkBg(c, G, 1, 0);
      v3Shadow(c, [G.CX, G.CY - 3, G.CW, G.CH], .5, 5); v3Post(c, "overlay", "tillsalu", "home", G.CX, G.CY - 3, G.CW, 1.25, 1);
      v3Text(c, "Klart.", 50, G.H - 7.4, {size:7.4, italic:true, color:"#fff", align:"c"});
    },
    function(c, G){ v3Fill(c, 0, 0, 100, G.H, C3.dark); v3DarkBg(c, G, 1, 0); v3Trio(c, G, 26, 21.8, {photo:"home", tpl:"overlay", phase:"tillsalu", msg:V3_CFG.msg}) },
    function(c, G){ v3Outro(c, G, "papper", 5, {noFade:true}) }
  ]}
};
