/* =====================================================================
   ADS 3 — del D: kampanjflödet

   Så fungerar produkten, i den ordning man gör det:
     1  Leveranssidan: välj bilder (tre).
     2  Välj mallar (tre): Kommande, Till salu, Såld. Mallarna visar sin
        riktiga fasta text, och uppgifterna som ska fyllas i står som
        fältnamn.
     3  Skapa kampanj: uppgifterna fylls i av bostadens data, i alla tre.
     4  Din kampanj är klar: de tre inläggen tillsammans, ladda ner.
   Åtta videor använder flödet, med olika bilder, mallar och längd.
   Allt ritas som rena funktioner av tiden, som övriga annonser.
   ===================================================================== */

(function(){
var ALLP = ["home", "dining", "beige", "bedroom", "terrace", "house", "porch"];
var PH = ["kommande", "tillsalu", "sald"];
function phName(i){ return [v3t("tpl.kommande"), v3t("tpl.tillsalu"), String(v3t("tpl.sald")).toUpperCase()][i] }

/* ett lager som tonas som helhet (alla delar i kortet följer med) */
function layer(c, a, fn){
  if(a <= .002) return;
  if(a >= .998){ fn(c); return }
  var cv = c.canvas, off = V3.lay || (V3.lay = document.createElement("canvas"));
  if(off.width !== cv.width || off.height !== cv.height){ off.width = cv.width; off.height = cv.height }
  var oc = off.getContext("2d"); oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, off.width, off.height);
  oc.setTransform(c.getTransform()); oc.globalAlpha = 1; oc.globalCompositeOperation = "source-over";
  fn(oc);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.drawImage(off, 0, 0); c.restore();
}
function rrect(c, x, y, w, h, r){
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function pill(c, cx, cy, w, h, fill, a){
  c.save(); c.globalAlpha = a; c.shadowColor = "rgba(28,28,30,.22)"; c.shadowBlur = 2.6; c.shadowOffsetY = .8; c.fillStyle = fill; rrect(c, cx - w/2, cy - h/2, w, h, h/2); c.fill(); c.restore();
}
/* rutnätet: tre valda bilder på plats 0, 2 och 4, övriga fyller på */
function gridOf(picks){
  var g = [picks[0], null, picks[1], null, picks[2], null], rest = ALLP.filter(function(n){ return picks.indexOf(n) < 0 }), j = 0;
  return g.map(function(x){ return x || rest[j++] });
}
/* hooken på ett foto (samma som tidigare) */
function v3HookPhoto(c, G, t, o){
  var H = G.H, out = 1 - ioC(k3(t, 2.6, 3.4)), sc = lerp(1.14, 1.02, ioC(k3(t, 0, 4)));
  v3Photo(c, o.photo, 0, 0, 100, H, {scale:sc});
  var top = G.top, yb = H - G.bot - 28, hk = o.hook;
  v3Grad(c, 0, H*.42, 100, H*.58, [[0, "rgba(14,11,11,0)"], [1, "rgba(14,11,11,.78)"]], 1);
  v3Grad(c, 0, 0, 100, H*.24, [[0, "rgba(14,11,11,.5)"], [1, "rgba(14,11,11,0)"]], 1);
  v3Frame(c, 4, 4, 92, H - 8, "#fff", .26, oQ(k3(t, .2, 1.8)), .5);
  v3Text(c, "VIEWLY · BOSTADSFOTOGRAFERING", 50, top + 4, {size:2, weight:500, f:"sans", sp:.3, color:"#fff", align:"c", alpha:.92, p:oQ(k3(t, .5, 1.7))});
  v3Text(c, hk[0], 50, yb, {size:11.2, color:"#fff", align:"c", p:oQ(k3(t, 1.0, 2.5)), rise:2, shadow:true});
  v3Text(c, hk[1], 50, yb + 13.6, {size:10.4, italic:true, color:C3.cream, align:"c", p:oQ(k3(t, 2.0, 3.4)), rise:2, shadow:true});
}

/* markörens väg: [tid, x, y, tryck-tid|0] */
function curPath(pts, t){
  var i = 0; while(i + 1 < pts.length && t >= pts[i + 1][0]) i++;
  var a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)], e = a === b ? 1 : ioC(k3(t, a[0], b[0]));
  return [lerp(a[1], b[1], e), lerp(a[2], b[2], e) - (a === b ? 0 : Math.sin(e*Math.PI)*2.2)];
}

/* t = lokal tid i flödet (sekunder) */
function v3Camp(c, G, t, o){
  var H = G.H, m = 8, ink = C3.ink, mut = C3.mut, picks = o.picks, grid = gridOf(picks), IDX = [0, 2, 4];
  var is9 = G.is9, th2 = is9 ? 24 : 21.5, tw = G.tw, gx = function(i){ return m + (i % 3)*(tw + 2.4) }, gy = function(i){ return G.gridY + Math.floor(i/3)*(th2 + 2.4) };
  var ch = tw*1.25, cardX = function(i){ return m + i*(tw + 2.4) };
  var btnY1 = G.gridY + th2*2 + 2.4 + 7.4, btnY2 = G.gridY + ch + 17;
  var fadeIn = ioC(k3(t, 0, .8)), toDark = ioC(k3(t, 13.2, 14.2)), ui = 1 - toDark;

  /* ----- gränssnittet (ljust) ----- */
  v3Fill(c, 0, 0, 100, H, C3.ui, fadeIn);
  if(ui > 0.001){
    var A = fadeIn*ui;
    c.save(); c.globalAlpha = A;
    var q = oQ(k3(t, .4, 1.3));
    v3Lock(c, 0, G.top + 2.2, 2.4, ink, C3.oli, {left:m, alpha:q*A});
    v3Text(c, v3t("ui.portal"), 100 - m, G.top + 3, {size:1.8, weight:500, f:"sans", sp:.24, color:mut, align:"r", alpha:A});
    c.restore();
    v3Line(c, m, 100 - m, G.top + 7.4, C3.uil, .2, oQ(k3(t, .6, 1.6)), A);
    var tq = oQ(k3(t, .9, 1.9)), hs = is9 ? 9.6 : 7.6;
    v3Text(c, V3_OBJ.addr, m, G.titleY, {size:hs, color:ink, alpha:A, p:tq, rise:1.4});
    v3Text(c, (V3_OBJ.city + " · 12 bilder levererade idag").toUpperCase(), m, G.subY, {size:1.85, weight:500, f:"sans", sp:.22, color:mut, alpha:A*tq});
    /* uppgiftskortet */
    var dq = oQ(k3(t, 1.2, 2.2)), cy0 = G.dataY - 4.4 + (1 - dq)*1.6, ch0 = 13.4, cr = 1.7;
    c.save(); c.globalAlpha = A*dq; c.shadowColor = "rgba(28,28,30,.16)"; c.shadowBlur = 3.2; c.shadowOffsetY = 1; c.fillStyle = "#fff"; rrect(c, m, cy0, 84, ch0, cr); c.fill();
    c.shadowColor = "transparent"; c.strokeStyle = "rgba(28,28,30,.08)"; c.lineWidth = .15; c.stroke(); c.restore();
    [[12, "BOSTAD", V3_OBJ.rum + " rum · " + V3_OBJ.yta + " m²"], [41, "ANSVARIG MÄKLARE", V3_OBJ.maklare], [70, "KONTOR", OFF.name.charAt(0) + OFF.name.slice(1).toLowerCase()]].forEach(function(cl){
      v3Text(c, cl[1], cl[0], G.dataY + (1 - dq)*1.6, {size:1.4, weight:600, f:"sans", sp:.2, color:"#6E6A66", alpha:A*dq});
      v3Text(c, cl[2], cl[0], G.dataY + 4.8 + (1 - dq)*1.6, {size:is9 ? 3.7 : 3.3, color:ink, alpha:A*dq});
    });
    var fillP = k3(t, 10.4, 12.9);
    v3Fill(c, m + 2, cy0 + ch0 - .5, 80*fillP, .4, C3.oli, A*dq);

    var s1 = 1 - ioC(k3(t, 6.0, 6.6)), s2 = ioC(k3(t, 6.3, 7.0))*(1 - ioC(k3(t, 10.05, 10.4)));
    /* --- steg 1: välj bilder --- */
    var nSel = (t >= 3.4) + (t >= 4.0) + (t >= 4.6);
    v3Text(c, v3t("ui.valjbilder"), m, G.sectY, {size:1.9, weight:600, f:"sans", sp:.26, color:ink, alpha:A*oQ(k3(t, 1.6, 2.4))*s1});
    v3Text(c, nSel + " " + v3t("ui.av") + " 3 " + v3t("ui.valda"), 100 - m, G.sectY, {size:1.5, weight:600, f:"sans", sp:.2, color:nSel === 3 ? C3.oli : mut, align:"r", alpha:A*oQ(k3(t, 1.6, 2.4))*s1});
    if(s1 > 0) grid.forEach(function(nm, i){
      var qi = oQ(k3(t, 1.9 + i*.1, 2.7 + i*.1)), x = gx(i), y = gy(i) + (1 - qi)*2.4, k = IDX.indexOf(i), selT = k >= 0 ? [3.4, 4.0, 4.6][k] : 99, sel = ioC(k3(t, selT, selT + .3));
      var dim = nSel === 3 && k < 0 ? lerp(1, .45, ioC(k3(t, 4.7, 5.2))) : 1;
      c.save(); c.globalAlpha = A*qi*s1*dim; v3Photo(c, nm, x, y, tw, th2); c.restore();
      if(sel > 0){
        c.save(); c.globalAlpha = A*s1*sel; c.strokeStyle = ink; c.lineWidth = .5; c.strokeRect(x - .7, y - .7, tw + 1.4, th2 + 1.4); c.restore();
        c.save(); c.globalAlpha = A*s1*sel; c.fillStyle = ink; c.beginPath(); c.arc(x + 3.6, y + 3.6, 2.3*oBack(k3(t, selT + .02, selT + .35)), 0, 7); c.fill(); c.restore();
        v3Text(c, String(k + 1), x + 3.6, y + 4.4, {size:2.3, weight:600, f:"sans", color:"#fff", align:"c", alpha:A*s1*k3(t, selT + .1, selT + .35)});
      }
    });
    /* fortsätt */
    var b1 = oQ(k3(t, 4.7, 5.4))*s1, pr1 = k3(t, 5.8, 5.9)*(1 - k3(t, 5.95, 6.1));
    if(b1 > 0){ pill(c, 50, btnY1, 40, 7.2, ink, A*b1*(1 - .06*pr1)); v3Text(c, v3t("ui.fortsatt"), 50, btnY1 + .7, {size:1.9, weight:600, f:"sans", sp:.28, color:"#fff", align:"c", alpha:A*b1}) }

    /* --- steg 2: välj mallar --- */
    if(s2 > 0){
      var nT = (t >= 7.55) + (t >= 8.15) + (t >= 8.75);
      v3Text(c, v3t("ui.valjmallar"), m, G.sectY, {size:1.9, weight:600, f:"sans", sp:.26, color:ink, alpha:A*s2});
      var sw = 19.5, sx = 100 - m - sw*2, sy = G.sectY - 2.3, sh = 3.9;
      c.save(); c.globalAlpha = A*s2; c.strokeStyle = C3.line; c.lineWidth = .2; c.strokeRect(sx, sy, sw*2, sh); c.fillStyle = ink; c.fillRect(sx, sy, sw, sh); c.restore();
      v3Text(c, v3t("ui.mina"), sx + sw/2, G.sectY, {size:1.2, weight:600, f:"sans", sp:.18, color:"#fff", align:"c", alpha:A*s2});
      v3Text(c, v3t("ui.viewlys"), sx + sw*1.5, G.sectY, {size:1.2, weight:500, f:"sans", sp:.18, color:mut, align:"c", alpha:A*s2});
      PH.forEach(function(ph, i){
        var qi = oQ(k3(t, 6.6 + i*.14, 7.4 + i*.14)), x = cardX(i), y = G.gridY + (1 - qi)*2.4, selT = [7.55, 8.15, 8.75][i], sel = ioC(k3(t, selT, selT + .3));
        layer(c, A*s2*qi, function(oc){ v3Shadow(oc, [x, y, tw, ch], .18, 2); v3Post(oc, o.tpl, ph, picks[i], x, y, tw, 1.25, 0, {skel:1}) });
        v3Text(c, phName(i), x + tw/2, G.gridY + ch + 5, {size:1.7, weight:sel > .5 ? 600 : 500, f:"sans", sp:.26, color:ink, align:"c", alpha:A*s2*qi});
        if(sel > 0){ c.save(); c.globalAlpha = A*s2*sel; c.strokeStyle = ink; c.lineWidth = .45; c.strokeRect(x - .9, y - .9, tw + 1.8, ch + 1.8); c.restore(); v3Tick(c, x + tw - .4, y - .4, 2.1, k3(t, selT + .05, selT + .4), C3.oli) }
      });
      v3Text(c, v3t("ui.egen"), 50, G.gridY + ch + 11.5, {size:1.5, weight:500, f:"sans", sp:.22, color:mut, align:"c", alpha:A*s2*oQ(k3(t, 7.2, 7.9))});
      var b2 = oQ(k3(t, 9.0, 9.6))*s2, pr2 = k3(t, 9.9, 10.0)*(1 - k3(t, 10.05, 10.2));
      if(b2 > 0){ pill(c, 50, btnY2 + 5, 46, 7.2, ink, A*b2*(1 - .06*pr2)); v3Text(c, v3t("ui.skapa"), 50, btnY2 + 5.7, {size:1.9, weight:600, f:"sans", sp:.28, color:"#fff", align:"c", alpha:A*b2}) }
    }
    /* --- steg 3: fylls i --- */
    var f3 = ioC(k3(t, 10.4, 10.9));
    if(t >= 10.4){
      v3Text(c, v3t("ui.valjmallar"), m, G.sectY, {size:1.9, weight:600, f:"sans", sp:.26, color:ink, alpha:A*(1 - f3)*0});
      v3Text(c, v3t("camp.skapas"), m, G.sectY, {size:1.9, weight:600, f:"sans", sp:.26, color:ink, alpha:A*f3});
      PH.forEach(function(ph, i){
        var x = cardX(i), y = G.gridY, prog = k3(t, 10.6 + i*.35, 12.7 + i*.35);
        layer(c, A, function(oc){ v3Shadow(oc, [x, y, tw, ch], .18, 2); v3Post(oc, o.tpl, ph, picks[i], x, y, tw, 1.25, prog, {skel:"auto"}) });
        v3Text(c, phName(i), x + tw/2, G.gridY + ch + 5, {size:1.7, weight:600, f:"sans", sp:.26, color:ink, align:"c", alpha:A});
        v3Tick(c, x + tw - .4, y - .4, 2.1, 1, C3.oli);
      });
      v3Text(c, v3t("camp.fyll"), 50, G.gridY + ch + 14, {size:2.3, italic:true, color:C3.oli, align:"c", alpha:A*oQ(k3(t, 11.0, 12.0)), f:"serif"});
    }
  }

  /* ----- kampanjen är klar (mörk) ----- */
  if(toDark > 0){
    var D = toDark;
    v3Fill(c, 0, 0, 100, H, C3.dark, D);
    v3DarkBg(c, G, D*.9, t);
    var ready = ioC(k3(t, 13.6, 14.4));
    v3Text(c, v3t("camp.klar1"), 50, G.top + (is9 ? 13 : 12), {size:is9 ? 10.4 : 8.6, color:"#fff", align:"c", p:oQ(k3(t, 13.7, 14.9)), rise:2, alpha:D});
    v3Text(c, v3t("camp.klar2"), 50, G.top + (is9 ? 13 : 12) + (is9 ? 11.6 : 9.6), {size:is9 ? 10.4 : 8.6, italic:true, color:C3.cream, align:"c", p:oQ(k3(t, 14.1, 15.3)), rise:2, alpha:D});
    var q = ioQ(k3(t, 13.4, 14.9)), cyF = G.cy + (is9 ? 10 : 8);
    var rows = [0, 1, 2].map(function(i){ return [cardX(i) + tw/2, G.gridY + ch/2, tw] });
    var fan = [[50 - 25, cyF + 2, is9 ? 35 : 31, -.08], [50, cyF, is9 ? 42 : 37, 0], [50 + 25, cyF + 2, is9 ? 35 : 31, .08]];
    var order = [0, 2, 1];
    order.forEach(function(i){
      var f = fan[i], r = rows[i], cx = lerp(r[0], f[0], q), cy = lerp(r[1], f[1], q), w = lerp(r[2], f[2], q), rot = lerp(0, f[3], q), h = w*1.25;
      var enter = i === 1 ? 1 : 1;
      layer(c, D, function(oc){
        oc.save(); oc.translate(cx, cy); oc.rotate(rot);
        v3Shadow(oc, [-w/2, -h/2, w, h], .5, 4);
        v3Post(oc, o.tpl, PH[i], picks[i], -w/2, -h/2, w, 1.25, 1); oc.restore();
      });
    });
    /* format och ladda ner */
    var yb = G.H - G.bot - (is9 ? 6.5 : 6), chipY = yb - 12, fa = oQ(k3(t, 15.0, 15.8));
    [["4:5", 36], ["1:1", 50], ["9:16", 64]].forEach(function(ct, i){
      c.save(); c.globalAlpha = fa*D; c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = .22; rrect(c, ct[1] - 6, chipY - 2.4, 12, 4.8, 2.4); c.stroke(); c.restore();
      v3Text(c, ct[0], ct[1], chipY + .65, {size:1.6, weight:600, f:"sans", sp:.2, color:"#fff", align:"c", alpha:fa*D*.9});
    });
    var done = ioC(k3(t, 16.4, 16.7)), pr = k3(t, 16.25, 16.35)*(1 - k3(t, 16.4, 16.55));
    pill(c, 50, yb, 58, 8, done > .5 ? C3.olil : "#fff", fa*D*(1 - .05*pr));
    v3Text(c, done > .5 ? v3t("camp.klart") : v3t("camp.dl"), 50, yb + .75, {size:2, weight:600, f:"sans", sp:.26, color:done > .5 ? C3.dark : ink, align:"c", alpha:fa*D});
  }

  /* ----- markören ----- */
  var wp = [[2.4, 104, H - 12], [3.4, gx(0) + tw*.55, gy(0) + th2*.55], [4.0, gx(2) + tw*.55, gy(2) + th2*.55], [4.6, gx(4) + tw*.55, gy(4) + th2*.55], [5.85, 56, btnY1],
            [7.55, cardX(0) + tw*.55, G.gridY + ch*.55], [8.15, cardX(1) + tw*.55, G.gridY + ch*.55], [8.75, cardX(2) + tw*.55, G.gridY + ch*.55], [9.95, 56, btnY2 + 5], [10.8, 70, btnY2 + 14],
            [15.2, 100, H - 40], [16.3, 56, G.H - G.bot - (is9 ? 6.5 : 6)]];
  var cp = curPath(wp, t), vis = Math.max(k3(t, 2.6, 3.2)*(1 - k3(t, 10.2, 10.8)), k3(t, 15.0, 15.4)*(1 - k3(t, 16.9, 17.3)));
  var taps = [3.4, 4.0, 4.6, 5.85, 7.55, 8.15, 8.75, 9.95, 16.3], pressed = 0, i;
  for(i = 0; i < taps.length; i++){ pressed = Math.max(pressed, k3(t, taps[i] - .12, taps[i])*(1 - k3(t, taps[i] + .05, taps[i] + .2))) }
  if(vis > 0){
    v3Cursor(c, cp[0], cp[1], pressed, vis);
    taps.forEach(function(tp, j){ var wpj = wp.filter(function(w){ return Math.abs(w[0] - (tp === 16.3 ? 16.3 : tp)) < .01 })[0]; if(wpj) v3Tap(c, wpj[1], wpj[2], k3(t, tp, tp + .7)) });
  }
}

/* ---------- komposition och ljud ---------- */
var CFG = {
  salu:     {kind:"photo", photo:"home",    tpl:"overlay",   picks:["house", "home", "bedroom"], k:1,    n:"Till salu · Overlay",   d:"Välj bilder, välj mallar, uppgifterna fylls i, kampanjen är klar."},
  sald:     {kind:"photo", photo:"bedroom", tpl:"editorial", picks:["terrace", "beige", "bedroom"], k:1,  n:"Såld · Editorial",      d:"Samma resa med Editorial-mallarna och andra bilder."},
  kommande: {kind:"photo", photo:"house",   tpl:"badge",     picks:["house", "dining", "terrace"], k:1,  n:"Kommande · Badge",      d:"Tre bilder, tre märkesmallar."},
  portal:   {kind:"typo",  photo:"beige",   tpl:"editorial", picks:["beige", "home", "dining"], k:1,    n:"Välj bild. Välj mall.", d:"Börjar i portalen. Hooken är bara text."},
  sald3:    {kind:"typo",  photo:"terrace", tpl:"badge",     picks:["terrace", "bedroom", "house"], k:1, n:"Såld · Badge",          d:"Portalen först, Badge-mallarna."},
  direkt:   {kind:"photo", photo:"terrace", tpl:"editorial", picks:["terrace", "porch", "home"], k:1.25, n:"Direkt",                d:"Kortversionen av hela flödet."},
  sald2:    {kind:"photo", photo:"porch",   tpl:"overlay",   picks:["porch", "dining", "bedroom"], k:1.25, n:"Såld · Overlay",      d:"Kortversion med Overlay-mallarna."},
  salu3:    {kind:"photo", photo:"beige",   tpl:"badge",     picks:["beige", "terrace", "house"], k:1.25, n:"Till salu · Badge",   d:"Kortversion med märke på bilden."}
};
var WARP = V3_WARP, END = 17.0;
Object.keys(CFG).forEach(function(id){
  var g = CFG[id], off = g.kind === "typo" ? 1.9 : (g.k > 1 ? 2.6 : 3.2), k = g.k, outroAt = off + END/k, raw = outroAt + 4.4, comp = V3_COMPS[id];
  if(!comp) return;
  comp.n = g.n; comp.d = g.d; comp.dur = raw/WARP; comp.thumb = (off + 8.9/k)/WARP;
  comp.draw = function(c, G, t, o){
    var tt = t*WARP, op = {photo:g.photo, tpl:g.tpl, picks:g.picks, hook:o.hook}, loc = (tt - off)*k;
    if(tt < outroAt + .6){
      if(g.kind === "photo" && tt < off + 1.0) v3HookPhoto(c, G, tt, op);
      if(tt >= off - .01) v3Camp(c, G, loc, op);
      if(g.kind === "typo" && tt < 2.6) v3TypoHook(c, G, tt, o.typo);
    }
    if(tt >= outroAt) v3Outro(c, G, o.outro, tt - outroAt);
  };
  /* ljudet: alla tider räknas om från flödets lokala tid */
  var X = function(l){ return off + l/k };
  var taps = [3.4, 4.0, 4.6, 5.85, 7.55, 8.15, 8.75, 9.95, 16.3].map(X);
  var pops = [5.0, 6.8, 7.0, 7.2, 11.2, 11.5, 11.8, 12.2, 12.6, 12.9, 14.3, 14.5, 14.7, 15.4].map(X);
  comp.audio = v3Cues(WARP, {chords:[[0, off, 0], [off, X(13.4), 1], [X(13.4), outroAt, 2], [outroAt, raw, 0]],
    whoosh:[off - .1, X(6.1), X(10.2), X(13.4), outroAt - .1], tap:taps, pop:pops, chime:[X(16.4)], riser:[[outroAt - 1.6, 1.5]], sub:outroAt + .1, tail:raw});
});
})();
