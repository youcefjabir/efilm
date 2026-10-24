/* =====================================================================
   SIDA 18 — VIEWLY LIGHT
   Ny annonsstil efter referensen: ljus bakgrund med rutnät och mjuka glöd,
   fet kinetisk text med ett accentord, svävande kort och en mobil, kopplade
   fält med prickade linjer, modern svensk röst. Viewlys färger: varm kräm,
   salvia och skogsgrönt.

   Annons 1: Reel Studio. Leveransen finns redan (bilder och uppgifter),
   Skapa Reel, mallen fyller i sig själv, Reelen i ert eget varumärke.
   Ingenting om tid eller siffror skrivs: att det går fort syns på att allt
   redan finns.
   ===================================================================== */
(function(){
var A8 = window.A8K, K = window.A7K, SYS = A8.SYS, sTx = A8.sTx, sCard = A8.sCard, sPh = A8.sPh, sBtn = A8.sBtn, rev = A8.rev, clamp = A8.clamp, SG = A8.SG, GRID7 = A8.GRID7, rr = A8.rr;
var BG = "#070606", INK = "#1C1C1E", MUT = "#6f6a65", GRN = "#2f3a2d", LIN = "#e9eadf";

/* ---------- tider (röstens repliker styr allt) ---------- */
var VO = [["r1", .35], ["r2", 2.9], ["r3", 5.9], ["r4", 8.9], ["r5", 11.2], ["r6", 14.7]];
var TAP = 7.5, PH_IN = 7.8, RT0 = 8.4, CUTS = [0, 1.3, 2.6, 4.2, 5.7], SWT = [2.6, 4.2], PH_OUT = 14.0, LOGO_AT = 14.5, DUR = 19.2;
var RPH = [GRID7[0], GRID7[1], GRID7[4], GRID7[2], GRID7[5]];

function tr1(t){ return Math.max(0, Math.min(1, t)) }
function ioC(x){ x = tr1(x); return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2 }
function oQ(x){ x = tr1(x); return 1 - Math.pow(1 - x, 3) }
function k3(t, a, b){ return tr1((t - a)/(b - a)) }
function lerp(a, b, p){ return a + (b - a)*p }

/* ---------- bakgrund: mörkt foto som på sida 16 (fåtöljen), ram och mjuk toning ---------- */
function bgLight(c, G, t){
  var H = G.H;
  v3Fill(c, 0, 0, 100, H, "#070606");
  v3Photo(c, "rs_chair", 0, 0, 100, H, {scale:lerp(1.05, 1.12, k3(t, 0, 19)), pos:V3_POS.rs_chair, alpha:t < .4 ? ioC(k3(t, 0, .4)) : 1});
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", .76);
  v3Grad(c, 0, 0, 100, H*.3, [[0, "rgba(8,7,7,.55)"], [1, "rgba(8,7,7,0)"]]);
  v3Frame(c, 4, 4, 92, H - 8, "#fff", .26, oQ(k3(t, .2, 1.8)), .5);
}

/* ---------- kinetisk text: ord glider in ur oskärpa, accentord i grönt ---------- */
function kline(c, words, y, size, t, t0, t1, o){
  o = o || {}; var st = o.st == null ? .1 : o.st, gap, wd = [], tot, i, mw = function(w){ return v3Measure(c, w[0], {size:size, italic:!!w[1]}) };
  size = size*1.32; gap = size*.26; tot = -gap; words.forEach(function(w){ var m = mw(w); wd.push(m); tot += m + gap });
  if(tot > 86){ size = size*86/tot; gap = size*.26; wd = []; tot = -gap; words.forEach(function(w){ var m = mw(w); wd.push(m); tot += m + gap }) }
  var x = 50 - tot/2, px = c.getTransform().a, out = k3(t, t1, t1 + .35);
  for(i = 0; i < words.length; i++){
    var p = ioC(k3(t, t0 + i*st, t0 + i*st + .5)), a = p*(1 - out);
    if(a > .01){
      var bl = (1 - p)*size*.5*px + out*size*.25*px;
      c.save(); if(bl > .2) c.filter = "blur(" + bl.toFixed(2) + "px)";
      v3Text(c, words[i][0], x, y + (1 - p)*size*.35 - out*size*.18, {size:size, italic:!!words[i][1], color:words[i][1] ? "#d6dccb" : "#fff", alpha:a});
      c.restore();
    }
    x += wd[i] + gap;
  }
}

/* ---------- svävande kort och mobil ---------- */
function fcard(c, x, y, w, h, a, r, fill, lift){
  if(a <= .02) return; c.save(); c.globalAlpha = a;
  c.shadowColor = "rgba(0,0,0,.4)"; c.shadowBlur = 12 + (lift || 0); c.shadowOffsetY = 2 + (lift || 0)*.2; c.fillStyle = (fill && fill !== "#fff") ? fill : "#ECE8E4"; rr(c, x, y, w, h, r); c.fill(); c.restore();
}
function dotc(c, x, y, r, col, a){ if(a <= .02) return; c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore() }
function cursor(c, x, y, a, press){
  if(a <= .02) return; c.save(); c.globalAlpha = a; c.translate(x, y); var s = 1 - .1*press; c.scale(s, s);
  c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 3; c.shadowOffsetY = .8; c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = .35; c.lineJoin = "round";
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 6.2); c.lineTo(1.7, 4.8); c.lineTo(2.9, 7.6); c.lineTo(4.0, 7.1); c.lineTo(2.8, 4.4); c.lineTo(4.9, 4.3); c.closePath(); c.fill(); c.stroke(); c.restore();
}
function phone2(c, x, y, w, h, a, rot){
  var r = w*.15, b = w*.028; c.save(); c.globalAlpha = a; c.translate(x + w/2, y + h/2); c.rotate(rot || 0); c.translate(-x - w/2, -y - h/2);
  c.shadowColor = "rgba(30,64,44,.38)"; c.shadowBlur = 18; c.shadowOffsetY = 5; c.fillStyle = "#17171a"; rr(c, x, y, w, h, r); c.fill(); c.shadowColor = "transparent";
  c.strokeStyle = "rgba(255,255,255,.28)"; c.lineWidth = .3; rr(c, x, y, w, h, r); c.stroke();
  c.fillStyle = "#000"; rr(c, x + b, y + b, w - 2*b, h - 2*b, r - b); c.fill(); c.restore();
  return {x:x + b*1.3, y:y + b*1.3, w:w - 2.6*b, h:h - 2.6*b, r:r - b*1.3};
}

/* ---------- Reelen i mobilen: bilder med mjuka övertoningar, mallar som byter layout ---------- */
function reelL(c, x, y, w, h, rt, a, r, f1, f2, ph, yk, cuts, swt){
  cuts = cuts || CUTS; swt = swt || SWT;
  var f = w/100*1.5, i, ia = rev(rt, .25, .6), D = {addr:v3t("a8.re.addr"), city:v3t("a8.re.city"), facts:v3t("a8.re.facts").split(" · ")};
  if(a <= .02) return;
  c.save(); c.globalAlpha = a; rr(c, x, y, w, h, r || 0); c.clip(); v3Fill(c, x, y, w, h, "#000");
  for(i = 0; i < ph.length; i++){
    var s0 = cuts[i], s1 = cuts[i + 1] == null ? s0 + 3 : cuts[i + 1], pa = i === 0 ? 1 : k3(rt, s0, s0 + .45); if(pa <= .01) continue;
    v3Photo(c, ph[i], x, y, w, h, {scale:lerp(1.05, 1.15, k3(rt, s0, s1 + .5)), pos:V3_POS[ph[i]], alpha:ioC(pa)});
  }
  v3Grad(c, x, y + h*.5, w, h*.5, [[0, "rgba(8,7,7,0)"], [1, "rgba(8,7,7,.5)"]]);
  v3Grad(c, x, y, w, h*.22, [[0, "rgba(8,7,7,.5)"], [1, "rgba(8,7,7,0)"]]);
  var ti = rt >= swt[1] ? 2 : rt >= swt[0] ? 1 : 0, tp = ti ? ioC(k3(rt - swt[ti - 1], 0, .7)) : 1;
  if(ti > 0 && tp < 1) A8.tplDraw(c, ti - 1, x, y, w, h, f, a*ia*(1 - tp), D, 1, 1, tp*3*f, yk);
  A8.tplDraw(c, ti, x, y, w, h, f, a*ia*(ti ? tp : 1), D, ti ? 1 : f1, ti ? 1 : f2, (1 - tp)*-4*f + (ti ? 0 : (1 - ia)*3*f), yk);
  c.restore();
}

/* ---------- fält som kopplas: prickad linje, brickan följer linjen ---------- */
function link(c, txt, sx, sy, dx, dy, t, t0, dur, off){
  var p = (t - t0)/dur; if(p <= 0 || p > 1.5) return;
  var e = ioC(clamp(p, 0, 1)), mx = (sx + dx)/2 + off, my = (sy + dy)/2, i, q;
  var bz = function(u){ var v = 1 - u; return [v*v*sx + 2*v*u*mx + u*u*dx, v*v*sy + 2*v*u*my + u*u*dy] };
  var la = .75*(1 - k3(p, 1.05, 1.5));
  if(la > .02){
    c.save(); c.strokeStyle = LIN; c.globalAlpha = la; c.lineWidth = .32; c.lineCap = "round"; c.setLineDash([.7, 1.3]); c.beginPath();
    for(i = 0; i <= 24; i++){ q = bz(e*i/24); if(i) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]) } c.stroke(); c.setLineDash([]);
    dotc(c, sx, sy, .8, LIN, 1); if(e > .98) dotc(c, dx, dy, 1.0, LIN, 1); c.restore();
  }
  var pos = bz(e), al = Math.min(1, p*7)*(1 - k3(p, .98, 1.3)), sc = lerp(1, .8, e), w = v3Measure(c, txt, {size:2.4, weight:600, f:"sans"}) + 5;
  if(al <= .02) return;
  c.save(); c.translate(pos[0], pos[1]); c.scale(sc, sc); sCard(c, -w/2, -2.6, w, 5.2, al, 2.6, "#fff", 4, "#2f6a3a"); sTx(c, txt, 0, 1.0, al, {size:2.4, weight:600, color:INK, align:"c"}); c.restore();
}

/* ---------- annons 1: Reel Studio ---------- */
function adReel1(c, G, t){
  var H = G.H, S = SG(G), i, oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy;
  var addr = v3t("a8.re.addr"), city = v3t("a8.re.city"), F = v3t("a8.re.facts").split(" · "), cstr = (city + "  ·  " + F[0] + "  ·  " + F[1]).toUpperCase();
  bgLight(c, G, t, k3(t, LOGO_AT - .3, LOGO_AT + .6));
  var lbl = {size:2.6, weight:600, f:"sans", sp:.14};
  /* rubriker */
  var hs = 6.6, hy1 = Y0 + 6, hy2 = Y0 + 13.4;
  kline(c, [["Bilderna", 0], ["är", 0], ["redan", 0]], hy1, hs, t, .15, 2.55);
  kline(c, [["levererade.", 1]], hy2, hs, t, .45, 2.55);
  kline(c, [["Adressen", 0], ["och", 0], ["uppgifterna", 0]], hy1, hs, t, 2.9, 5.65);
  kline(c, [["finns", 1], ["redan.", 1]], hy2, hs, t, 3.15, 5.65);
  kline(c, [["Tryck", 0], ["på", 0]], hy1, hs, t, 5.9, TAP + .1);
  kline(c, [["Skapa", 1], ["Reel.", 1]], hy2, hs, t, 6.1, TAP + .1);
  kline(c, [["En", 0], ["Reel", 0], ["i", 0], ["ditt", 0]], hy1, hs, t, 11.2, PH_OUT - .2);
  kline(c, [["eget", 1], ["varumärke.", 1]], hy2, hs, t, 11.45, PH_OUT - .2);
  /* leveranskortet: bilderna och uppgifterna finns redan */
  var cx0 = 10, cw0 = 80, cy0 = Y0 + 19, ch0 = 63, tm = ioC(k3(t, TAP + .1, TAP + .65));
  var cxx = cx0, cyy = lerp(cy0, Y0 + .5, tm), cww = cw0, chh = lerp(ch0, 17.5, tm);
  var enter = oQ(k3(t, 0, .9)), cin = Math.min(1, rev(t, .05, .4))*(1 - k3(t, 10.85, 11.25));
  var bob = Math.sin(t*1.3)*.5*(1 - tm);
  if(cin > .02){
    var cyd = cyy + (1 - enter)*14 + bob;
    fcard(c, cxx, cyd, cww, chh, cin, 3.2, "#fff", tm*6);
    var big = cin*(1 - k3(t, TAP + .05, TAP + .35)), sm = cin*k3(t, TAP + .5, TAP + .95), x0 = cx0 + 6;
    if(big > .02){
      var lev = rev(t, 1.6, .25), s1 = "FOTOGRAFERAS", s2 = "BILDERNA ÄR LEVERERADE", sw1 = v3Measure(c, s1, {size:2.1, weight:600, f:"sans", sp:.2}) + 10, sw2 = v3Measure(c, s2, {size:2.1, weight:600, f:"sans", sp:.2}) + 10, sw = lerp(sw1, sw2, lev), sy0 = cyd + 5;
      sCard(c, x0, sy0, sw, 5.6, big, 2.8, "#F4F1EA", 0, "rgba(28,26,25,.12)");
      dotc(c, x0 + 3.4, sy0 + 2.8, .95, lev > .5 ? "#2f6a3a" : "#b9822c", big);
      sTx(c, s1, x0 + 6, sy0 + 3.8, big*(1 - lev), {size:2.1, weight:600, color:MUT, sp:.2});
      sTx(c, s2, x0 + 6, sy0 + 3.8, big*lev, {size:2.1, weight:600, color:"#2f6a3a", sp:.2});
      /* markeringar: uppgifterna lyser upp en och en */
      var aw = v3Measure(c, addr, {size:8.2}), hl = function(xa, ya, wa, ha, p){ if(p <= 0) return; c.save(); c.globalAlpha = big*(1 - k3(t, 5.2, 5.6))*.9; c.fillStyle = "rgba(46,122,77,.17)"; rr(c, xa, ya, wa*p, ha, ha*.3); c.fill(); c.restore() };
      hl(x0 - 1.2, cyd + 14.2, aw + 2.4, 9, ioC(k3(t, 3.1, 3.7)));
      var cp = [0, v3Measure(c, city.toUpperCase() + "  ·  ", lbl), v3Measure(c, city.toUpperCase() + "  ·  " + F[0].toUpperCase() + "  ·  ", lbl)], cwd = [v3Measure(c, city.toUpperCase(), lbl), v3Measure(c, F[0].toUpperCase(), lbl), v3Measure(c, F[1].toUpperCase(), lbl)];
      for(i = 0; i < 3; i++) hl(x0 + cp[i] - .8, cyd + 24.2, cwd[i] + 1.6, 3.9, ioC(k3(t, 3.9 + i*.28, 4.3 + i*.28)));
      v3Text(c, addr, x0, cyd + 21, {size:8.2, color:INK, alpha:big*rev(t, .3, .4)});
      sTx(c, cstr, x0, cyd + 26.8, big*rev(t, .45, .4), lbl);
      var tw = (cw0 - 12 - 3*2)/4, th = tw*.8, ty = cyd + 30.5, THS = [GRID7[0], GRID7[1], GRID7[5], GRID7[4]];
      for(i = 0; i < 4; i++){
        var t0 = .5 + i*.25, ta = rev(t, t0, .25)*big, tx = x0 + i*(tw + 2), sc = lerp(.85, 1, oBack(k3(t, t0, t0 + .35)));
        c.save(); c.translate(tx + tw/2, ty + th/2); c.scale(sc, sc); sCard(c, -tw/2 - .4, -th/2 - .4, tw + .8, th + .8, ta, 1.4, "#fff", 2); sPh(c, THS[i], -tw/2, -th/2, tw, th, ta, 1.2, 1.14); c.restore();
      }
      var bw = 52, by = ty + th + 5, bpress = k3(t, TAP, TAP + .22), ba = rev(t, 6.2, .4)*big;
      if(ba > .02){ c.save(); c.translate(50, by + 4); var bs = 1 - .05*Math.sin(bpress*Math.PI); c.scale(bs, bs); c.translate(-50, -by - 4); fcard(c, 50 - bw/2, by, bw, 8, ba, 4, GRN, 0); sTx(c, "SKAPA REEL  ›", 50, by + 5.2, ba, {size:2.9, weight:700, color:"#fff", align:"c", sp:.14}); c.restore();
        var rp = k3(t, TAP, TAP + .6); if(rp > 0 && rp < 1){ c.save(); c.globalAlpha = big*(1 - rp)*.6; c.strokeStyle = GRN; c.lineWidth = .4; rr(c, 50 - bw/2 - rp*5, by - rp*5, bw + rp*10, 8 + rp*10, 4 + rp*5); c.stroke(); c.restore() }
        var cx1 = lerp(78, 50 + 4, ioC(k3(t, 6.55, 7.4))), cy1 = lerp(by + 22, by + 5.5, ioC(k3(t, 6.55, 7.4))) + Math.sin(k3(t, 6.55, 7.4)*Math.PI)*-3;
        cursor(c, cx1, cy1, ba*(1 - k3(t, TAP + .3, TAP + .6)), bpress*(1 - k3(t, TAP + .25, TAP + .5)));
      }
    }
    if(sm > .02){
      var lv = "LEVERERAD", lw = v3Measure(c, lv, {size:1.9, weight:600, f:"sans", sp:.2}) + 8, px0 = cx0 + cw0 - 5 - lw;
      sCard(c, px0, cyy + 3.6, lw, 5.2, sm, 2.6, "#E3F0E4", 0); dotc(c, px0 + 3, cyy + 6.2, .8, "#2f6a3a", sm); sTx(c, lv, px0 + 5, cyy + 7.5, sm, {size:1.9, weight:600, color:"#2f6a3a", sp:.2});
      v3Text(c, addr, x0 - .4, cyy + 9.2, {size:5.8, color:INK, alpha:sm});
      sTx(c, cstr, x0 - .4, cyy + 14.2, sm, {size:2.0, weight:600, color:MUT, sp:.14});
    }
  }
  /* mobilen med Reelen */
  var pin = oQ(k3(t, PH_IN, PH_IN + .9)), pout = ioC(k3(t, PH_OUT, PH_OUT + .6)), pa = rev(t, PH_IN, .4)*(1 - pout);
  var pcy = Y0 + 25.5, phh = G.is9 ? 94 : Math.min(S.y1 - pcy + 4, 80), pww = phh/2.05, pxx = 50 - pww/2;
  if(pa > .02){
    var py = pcy + (1 - pin)*24 + pout*10, sc = phone2(c, pxx, py, pww, phh, pa, (1 - pin)*-.07);
    var yk = .72, rt = Math.max(0, t - RT0);
    var f1 = ioC(k3(t, 9.55, 9.9)), f2 = ioC(k3(t, 9.8, 10.25));
    reelL(c, sc.x, sc.y, sc.w, sc.h, rt, pa, sc.r, f1, f2, RPH, yk);
    A8.reelUI(c, sc.x, sc.y, sc.w, sc.h, pa, rev(rt, .3, .5));
    /* kopplade fält: uppgifterna i kortet överst flyger in i mallen */
    var ff = sc.w/100*1.5, g0 = A8.tplGeo(0, sc.x, sc.y, sc.w, sc.h, ff, yk), inn = g0.inner;
    var xs = cx0 + 6 - .4, ay = Y0 + .5 + 9.2, cl = Y0 + .5 + 14.2, lb2 = {size:2.0, weight:600, f:"sans", sp:.14};
    var SRC = [[xs + v3Measure(c, addr, {size:5.8})/2, ay - 2.2], [xs + v3Measure(c, city.toUpperCase(), lb2)/2, cl - .6], [xs + v3Measure(c, city.toUpperCase() + "  ·  ", lb2) + v3Measure(c, F[0].toUpperCase(), lb2)/2, cl - .6], [xs + v3Measure(c, city.toUpperCase() + "  ·  " + F[0].toUpperCase() + "  ·  ", lb2) + v3Measure(c, F[1].toUpperCase(), lb2)/2, cl - .6]];
    var TXT = [addr, city, F[0], F[1]], TGT = [[g0.ax + 12*ff, g0.ay - 3.2*ff], [g0.px + 5.5*ff, g0.dy - 1.2*ff], [g0.px + .5*inn + 4*ff, g0.dy - 1.2*ff], [g0.px + .78*inn + 4*ff, g0.dy - 1.2*ff]];
    var lo = 1 - pout;
    for(i = 0; i < 4; i++) link(c, TXT[i], SRC[i][0], SRC[i][1], TGT[i][0], TGT[i][1], t, 9.0 + i*.14, .95, (i - 1.5)*5);
  }
  /* slutbild: loggan, raden och adressen */
  var ea = k3(t, LOGO_AT - .1, LOGO_AT + .5);
  if(ea > .01){
    var cy = H*.4, mh = 15, mw = mh*858.6/756.3, fs = 7.2, ww = v3Measure(c, "VIEWLY", {size:fs, weight:500, f:"sans", sp:.3}) - .3*fs, tot = mw + 3.4 + ww, lx = 50 - tot/2, lp = k3(t, LOGO_AT, LOGO_AT + .8);
    v3Mark(c, lx, cy - mh/2, mh, "#fff", C3.dotL, {reveal:lp, dot:1, alpha:ea});
    v3Text(c, "VIEWLY", lx + mw + 3.4, cy + fs*.34, {size:fs, weight:500, f:"sans", sp:.3, color:"#fff", alpha:ea*k3(t, LOGO_AT + .15, LOGO_AT + .7)});
    kline(c, [["För", 0], ["mäklare", 0], ["som", 0], ["vill", 0], ["mer.", 1]], cy + 20, 5.2, t, LOGO_AT + .55, 99);
    var ua = k3(t, LOGO_AT + 1.5, LOGO_AT + 2.0), uw = v3Measure(c, "viewly.se", {size:3, weight:600, f:"sans", sp:.1}) + 12;
    if(ua > .02){ fcard(c, 50 - uw/2, cy + 28, uw, 8, ua, 4, "#fff", 0); sTx(c, "viewly.se", 50, cy + 33.2, ua, {size:3, weight:600, color:INK, align:"c", sp:.1}) }
  }
}

function sched1(H){
  var i, ph = [.5, .75, 1.0, 1.25];
  ph.forEach(function(q){ H.soft("shutter", q, .2) });
  H.soft("down", TAP, .22); H.soft("up", TAP + .085, .16);
  CUTS.forEach(function(q, k){ H.soft("shutter", RT0 + q + (k ? 0 : .05), .24) });
  for(i = 0; i < 4; i++) H.soft("tick2", 9.0 + i*.14 + .95, .05);
}


/* ---------- annons 2: så fungerar Reel Studio (förklaringsvideo, utan röst) ---------- */
var EX = {RT0:3.7, CUTS:[0, 1.7, 3.4, 5.1, 6.8, 8.5], SWT:[5.3, 7.3], T2:3.6, T3:7.4, T4:11.2, T5:14.8, DUR:19.0, LOGO:15.2};
var RPH6 = [GRID7[0], GRID7[1], GRID7[4], GRID7[2], GRID7[3], GRID7[5]];
function adExplain(c, G, t){
  var H = G.H, S = SG(G), i, oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy;
  var addr = v3t("a8.re.addr"), city = v3t("a8.re.city"), F = v3t("a8.re.facts").split(" · "), cstr = (city + "  ·  " + F[0] + "  ·  " + F[1]).toUpperCase();
  bgLight(c, G, t, k3(t, EX.LOGO - .3, EX.LOGO + .6));
  var hs = 6.6, hy = Y0 + 7;
  kline(c, [["Välj", 0], ["dina", 0], ["bilder.", 1]], hy, hs, t, .15, EX.T2 - .15);
  kline(c, [["Mallen", 0], ["fyller", 0], ["i", 0], ["sig", 1], ["själv.", 1]], hy, hs, t, EX.T2 + .25, EX.T3 - .15);
  kline(c, [["Gör", 0], ["den", 0], ["till", 0], ["din.", 1]], hy, hs, t, EX.T3 + .25, EX.T4 - .15);
  kline(c, [["Varje", 0], ["element", 0], ["rör", 0], ["sig.", 1]], hy, hs, t, EX.T4 + .25, EX.T5 - .15);
  /* 1 · välj bilder: sex bilder, tre väljs, Skapa Reel */
  var ga = Math.min(1, rev(t, .1, .4))*(1 - k3(t, EX.T2 - .25, EX.T2 + .15)), enter = oQ(k3(t, 0, .8));
  if(ga > .02){
    var cw = 80, cx = 10, ch = 59, cy = Y0 + 15 + (1 - enter)*12 - k3(t, EX.T2 - .25, EX.T2 + .15)*3;
    fcard(c, cx, cy, cw, ch, ga, 3.2, "#fff", 0);
    var x0 = cx + 6, tw = (cw - 12 - 2*2.4)/3, th = tw*.62, n = 0, SEL = [[0, 1.0], [1, 1.35], [5, 1.7]];
    SEL.forEach(function(q){ if(t >= q[1]) n++ });
    sTx(c, "VÄLJ BILDER", x0, cy + 6.4, ga*rev(t, .3, .4), {size:2.4, weight:700, sp:.2});
    sTx(c, n + " / 6 VALDA", cx + cw - 6, cy + 6.4, ga*rev(t, .3, .4), {size:2.4, weight:600, color:MUT, align:"r", sp:.16});
    for(i = 0; i < 6; i++){
      var gx = x0 + (i % 3)*(tw + 2.4), gy = cy + 10 + Math.floor(i/3)*(th + 2.4), a2 = rev(t, .25 + i*.08, .3)*ga;
      sCard(c, gx - .4, gy - .4, tw + .8, th + .8, a2, 1.4, "#fff", 2); sPh(c, GRID7[i], gx, gy, tw, th, a2, 1.2, 1.14);
      SEL.forEach(function(q, qi){
        if(q[0] !== i || t < q[1]) return; var sp = oBack(k3(t, q[1], q[1] + .3));
        c.save(); c.globalAlpha = ga; c.strokeStyle = GRN; c.lineWidth = .6; rr(c, gx - .9, gy - .9, tw + 1.8, th + 1.8, 1.6); c.stroke(); c.fillStyle = GRN; c.beginPath(); c.arc(gx + 3.4, gy + 3.4, 2.4*Math.max(.01, sp), 0, 7); c.fill(); c.restore();
        if(sp > .6) sTx(c, String(qi + 1), gx + 3.4, gy + 4.4, ga, {size:2.6, weight:700, color:"#fff", align:"c"});
      });
    }
    var bw = 52, by = cy + ch - 15.8, bp = k3(t, 3.0, 3.22), ba = rev(t, 2.3, .4)*ga;
    if(ba > .02){ c.save(); c.translate(50, by + 4); var bs = 1 - .05*Math.sin(bp*Math.PI); c.scale(bs, bs); c.translate(-50, -by - 4); fcard(c, 50 - bw/2, by, bw, 8, ba, 4, GRN, 0); sTx(c, "SKAPA REEL  ›", 50, by + 5.2, ba, {size:2.9, weight:700, color:"#fff", align:"c", sp:.14}); c.restore();
      var cx1 = lerp(80, 54, ioC(k3(t, 2.45, 3.0))), cy1 = lerp(by + 22, by + 5.5, ioC(k3(t, 2.45, 3.0)));
      cursor(c, cx1, cy1, ba*(1 - k3(t, 3.25, 3.5)), bp*(1 - k3(t, 3.25, 3.45)));
    }
  }
  /* 2–4 · mobilen, med ett datakort som kopplas in i scen 2 */
  var pin = oQ(k3(t, EX.T2 - .1, EX.T2 + .8)), pout = ioC(k3(t, EX.T5 - .5, EX.T5 + .1)), pa = rev(t, EX.T2 - .1, .4)*(1 - pout);
  var up = ioC(k3(t, EX.T3 - .1, EX.T3 + .55)), top2 = Y0 + 34, top3 = Y0 + 14, shrink = ioC(k3(t, EX.T4 - .1, EX.T4 + .55));
  var phh = (G.is9 ? 92 : 78)*lerp(1, .62, shrink), pww = phh/2.05, pxx = 50 - pww/2, pcy = lerp(top2, top3, up);
  var yk = lerp(.62, .7, up);
  if(pa > .02){
    var py = pcy + (1 - pin)*20 + pout*8, sc = phone2(c, pxx, py, pww, phh, pa, (1 - pin)*-.06), rt = Math.max(0, t - EX.RT0);
    var f1 = ioC(k3(t, 5.2, 5.55)), f2 = ioC(k3(t, 5.45, 5.9));
    reelL(c, sc.x, sc.y, sc.w, sc.h, rt, pa, sc.r, f1, f2, RPH6, yk, EX.CUTS, EX.SWT);
    A8.reelUI(c, sc.x, sc.y, sc.w, sc.h, pa, rev(rt, .3, .5)*(1 - shrink));
    /* scen 2: datakortet och kopplingarna */
    var dk = k3(t, EX.T2 + .2, EX.T2 + .7)*(1 - k3(t, EX.T3 - .5, EX.T3 - .1));
    if(dk > .02){
      var dy = Y0 + 14;
      fcard(c, 10, dy, 80, 17.5, dk, 3.2, "#fff", 0);
      sCard(c, 10 + 80 - 5 - 24, dy + 3.6, 24, 5.2, dk, 2.6, "#E3F0E4", 0); dotc(c, 10 + 80 - 5 - 24 + 3, dy + 6.2, .8, "#2f6a3a", dk); sTx(c, "LEVERERAD", 10 + 80 - 5 - 24 + 5, dy + 7.5, dk, {size:1.9, weight:600, color:"#2f6a3a", sp:.2});
      v3Text(c, addr, 15.6, dy + 9.2, {size:5.8, color:INK, alpha:dk});
      sTx(c, cstr, 15.6, dy + 14.2, dk, {size:2.0, weight:600, color:MUT, sp:.14});
      var lb2 = {size:2.0, weight:600, f:"sans", sp:.14}, ff = sc.w/100*1.5, g0 = A8.tplGeo(0, sc.x, sc.y, sc.w, sc.h, ff, yk), inn = g0.inner, xs = 15.6, ay = dy + 9.2, cl = dy + 14.2;
      var SRC = [[xs + v3Measure(c, addr, {size:5.8})/2, ay - 2.2], [xs + v3Measure(c, city.toUpperCase(), lb2)/2, cl - .6], [xs + v3Measure(c, city.toUpperCase() + "  ·  ", lb2) + v3Measure(c, F[0].toUpperCase(), lb2)/2, cl - .6], [xs + v3Measure(c, city.toUpperCase() + "  ·  " + F[0].toUpperCase() + "  ·  ", lb2) + v3Measure(c, F[1].toUpperCase(), lb2)/2, cl - .6]];
      var TXT = [addr, city, F[0], F[1]], TGT = [[g0.ax + 12*ff, g0.ay - 3.2*ff], [g0.px + 5.5*ff, g0.dy - 1.2*ff], [g0.px + .5*inn + 4*ff, g0.dy - 1.2*ff], [g0.px + .78*inn + 4*ff, g0.dy - 1.2*ff]];
      for(i = 0; i < 4; i++) link(c, TXT[i], SRC[i][0], SRC[i][1], TGT[i][0], TGT[i][1], t, 4.5 + i*.14, .95, (i - 1.5)*5);
    }
    /* scen 3: verktygen svävar runt mobilen */
    var pills = [["Text", 9, 0], ["Element", 91, 1], ["Varumärke", 9, 2], ["Rörelse", 91, 3]], pm = (1 - k3(t, EX.T4 - .4, EX.T4 - .05));
    pills.forEach(function(q, k){
      var t0 = EX.T3 + .5 + k*.35, pp = ioC(k3(t, t0, t0 + .45))*pm, al = pp; if(al <= .02) return;
      var px2 = q[1] < 50 ? 8 : 92, ww = v3Measure(c, q[0], {size:2.8, weight:700, f:"sans"}) + 8, py2 = pcy + phh*(.22 + k*.17) + Math.sin(t*1.4 + k)*.6, tx = q[1] < 50 ? px2 : px2 - ww, ex = q[1] < 50 ? sc.x - .5 : sc.x + sc.w + .5;
      c.save(); c.globalAlpha = al*.7; c.strokeStyle = LIN; c.lineWidth = .3; c.setLineDash([.7, 1.3]); c.beginPath(); c.moveTo(q[1] < 50 ? tx + ww : tx, py2 + 2.8); c.lineTo(ex, py2 + 2.8); c.stroke(); c.setLineDash([]); dotc(c, ex, py2 + 2.8, .9, LIN, 1); c.restore();
      fcard(c, tx + (1 - pp)*(q[1] < 50 ? -6 : 6), py2, ww, 5.6, al, 2.8, "#fff", 0); sTx(c, q[0], tx + (1 - pp)*(q[1] < 50 ? -6 : 6) + ww/2, py2 + 3.8, al, {size:2.8, weight:700, color:INK, align:"c"});
    });
    /* scen 4: tidslinje med spår */
    var tl = k3(t, EX.T4 + .35, EX.T4 + .95)*(1 - k3(t, EX.T5 - .5, EX.T5 - .1));
    if(tl > .02){
      var ty = pcy + phh + 4, tx0 = 10, tw2 = 80, rows = [["Platta", 0, .75], ["Text", .12, .85], ["Uppgifter", .24, .95]];
      fcard(c, tx0, ty, tw2, 25, tl, 3, "#fff", 0);
      rows.forEach(function(r, k){
        var ry = ty + 4.6 + k*6.4, bx = tx0 + 24, bwf = (tw2 - 30), p0 = ioC(k3(t, EX.T4 + .6 + k*.3, EX.T4 + 1.3 + k*.3));
        sTx(c, r[0].toUpperCase(), tx0 + 6, ry + 3.2, tl, {size:2.0, weight:700, color:MUT, sp:.2});
        c.save(); c.globalAlpha = tl; c.fillStyle = "rgba(28,26,25,.07)"; rr(c, bx, ry, bwf, 4.2, 2.1); c.fill(); c.fillStyle = GRN; rr(c, bx + bwf*r[1], ry, bwf*(r[2] - r[1])*p0, 4.2, 2.1); c.fill(); c.restore();
      });
      var ph2 = k3(t, EX.T4 + 1.8, EX.T5 - .6), phx = tx0 + 24 + (tw2 - 30)*ph2;
      c.save(); c.globalAlpha = tl*rev(t, EX.T4 + 1.6, .3); c.fillStyle = INK; c.fillRect(phx - .12, ty + 3, .24, 19.6); c.restore();
    }
  }
  /* slut */
  var ea = k3(t, EX.LOGO - .1, EX.LOGO + .5);
  if(ea > .01){
    var cy2 = H*.4, mh = 15, mw = mh*858.6/756.3, fs = 7.2, ww2 = v3Measure(c, "VIEWLY", {size:fs, weight:500, f:"sans", sp:.3}) - .3*fs, tot = mw + 3.4 + ww2, lx = 50 - tot/2, lp = k3(t, EX.LOGO, EX.LOGO + .8);
    v3Mark(c, lx, cy2 - mh/2, mh, "#fff", C3.dotL, {reveal:lp, dot:1, alpha:ea});
    v3Text(c, "VIEWLY", lx + mw + 3.4, cy2 + fs*.34, {size:fs, weight:500, f:"sans", sp:.3, color:"#fff", alpha:ea*k3(t, EX.LOGO + .15, EX.LOGO + .7)});
    kline(c, [["Reel", 0], ["Studio.", 1]], cy2 + 22, 5.6, t, EX.LOGO + .55, 99);
    kline(c, [["Reels", 0], ["direkt", 0], ["från", 0], ["leveransen.", 0]], cy2 + 30.5, 3.3, t, EX.LOGO + 1.0, 99);
  }
}
function sched2(H){
  [1.0, 1.35, 1.7].forEach(function(q){ H.soft("tick2", q, .12) });
  H.soft("down", 3.0, .22); H.soft("up", 3.085, .16);
  EX.CUTS.forEach(function(q, k){ H.soft("shutter", EX.RT0 + q + (k ? 0 : .05), .22) });
  for(var i = 0; i < 4; i++){ H.soft("tick2", 4.5 + i*.14 + .95, .05); H.soft("tick2", EX.T3 + .5 + i*.35 + .2, .08) }
  [0, 1, 2].forEach(function(k){ H.soft("tick2", EX.T4 + .6 + k*.3 + .3, .07) });
}

/* ---------- registrering ---------- */
window.V3_ADS10 = [];
function loadAudio10(){ return Promise.all([v3SfxLoad(), K.loadVo(VO.map(function(v){ return v[0] }), "")]) }
function reg10(id, n, d, fn, sched, thumb){
  var comp = {n:n, d:d, group:"ads10", id:id, v:{id:id}, dur:DUR, thumb:thumb, L:LOGO_AT - .53, logo:true, vo:VO};
  comp.draw = function(c, G, t){ fn(c, G, t) };
  comp.mix = K.makeMix(sched); comp.loadAudio = loadAudio10;
  V3_COMPS[id] = comp; V3_ADS10.push(id);
}
reg10("a10_reel", "1 · Reel Studio", "Leveransen finns redan. Skapa Reel, mallen fyller i sig själv, Reelen i ert eget varumärke.", adReel1, sched1, 9.8);

(function(){
  var comp = {n:"2 · Så fungerar Reel Studio", d:"Förklaringsvideo utan röst: välj bilder, mallen fyller i sig själv, gör den till din, rörelse per element.", group:"ads10", id:"a10_how", v:{id:"a10_how"}, dur:EX.DUR, thumb:8.2, L:EX.LOGO - .53, logo:true};
  comp.draw = function(c, G, t){ adExplain(c, G, t) };
  comp.mix = K.makeMix(sched2); comp.loadAudio = function(){ return v3SfxLoad() };
  V3_COMPS.a10_how = comp; V3_ADS10.push("a10_how");
})();

var SCRIPT = [
  ["Bilderna är redan levererade.", "Rubrik: Bilderna är redan levererade. Kortet visar leveransen med fyra bilder."],
  ["Adressen och uppgifterna finns redan.", "Uppgifterna lyses upp en och en: adress, ort, rum och yta."],
  ["Tryck på Skapa Reel.", "Knappen trycks."],
  ["Mallen fyller i sig själv.", "Uppgifterna kopplas med prickade linjer från kortet till mallens fält."],
  ["En Reel i ditt eget varumärke.", "Mallen byter layout och kontor tre gånger: Kommande, Till salu, Såld."],
  ["Viewly. För mäklare som vill mer.", "Loggan, raden och viewly.se."]
];
window.secAds10 = function(){
  if(V3_ADS10.indexOf(V3S.comp) < 0){ V3S.comp = "a10_reel"; V3S.t = V3_COMPS.a10_reel.thumb; V3S.playing = false; v3StopSound() }
  if(V3S.fmt !== "916" && V3S.fmt !== "45") V3S.fmt = "916";
  var comp = V3_COMPS[V3S.comp], fn = V3S.fmt === "916" ? "9:16 · 1080 × 1920" : "4:5 · 1080 × 1350";
  setTimeout(v3Mount, 0);
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 18 · bygge 2</div><h2>Reel Studio</h2>'
    + '<p>Reel Studio i annonsspråket från sida 16: mörkt foto, serif, ljusa kort och en mobil med Reelen. Kopplade fält med prickade linjer. Annons 1 har svensk röst, annons 2 är utan röst. Förslag, inget publicerat.</p></div>'
    + '<div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w45") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play" aria-label="Spela">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '" aria-label="Tid"></div>'
    + '<span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Annons</div><div class="a3segs col">' + V3_ADS10.map(function(id){ return v3Seg("comp", id, V3_COMPS[id].n, V3S.comp === id) }).join("") + '</div>'
    + '<div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Reel 9:16", V3S.fmt === "916") + v3Seg("fmt", "45", "Flöde 4:5", V3S.fmt === "45") + '</div>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + comp.n + " · " + fn + ' · med röst</button></div></div></div>'
    + '<h3 class="a3sub">Manus och bild</h3><div class="a3copy">' + SCRIPT.map(function(s, i){ return '<div><b>' + (i + 1) + ' · ' + s[0] + '</b><p>' + s[1] + '</p></div>' }).join("") + '</div>'
    + '<details class="a3det"><summary>Underlag</summary><div class="a3und">'
    + '<div><b>Stilen</b><p>Samma språk som sida 16: mörkt foto, serif, ljusa kort med mjuka skuggor. Från referensen tas bara rörelsen: ord som glider in, kort som svävar och kopplade fält.</p></div>'
    + '<div><b>Rösten</b><p>Syntetisk svensk röst (ElevenLabs via Higgsfield). Lyssna igenom innan publicering och byt röst eller rad vid behov.</p></div>'
    + '<div><b>Påståenden</b><p>Inga siffror och inga löften om tid. Att det går fort syns på att bilderna och uppgifterna redan finns. Namn, märken och adress i mallarna är påhittade exempel. Reel Studio visas som under utveckling: publicera när det går att använda.</p></div></div></details></div>';
};
})();
