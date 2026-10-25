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
var tplMark = A8.tplMark, END10 = K.END_L;
V3_KEYS.lockMag = "lockMag"; V3_POS.lockMag = [.36, .55];
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


/* ---------- bakgrund: ett mörkt jordklot (trådnät) som roterar sakta, med en liten markering över Skåne ---------- */
function bgGlobe(c, G, t){
  var H = G.H, R = 70, gx = 50, gy = H*.64, tilt = .42, rot = t*.16 + 3.2, D = Math.PI/180, i, j, pts;
  v3Fill(c, 0, 0, 100, H, "#070606");
  var gr = c.createRadialGradient(gx, gy, R*.2, gx, gy, R*1.25); gr.addColorStop(0, "rgba(120,140,115,.26)"); gr.addColorStop(.62, "rgba(60,74,58,.14)"); gr.addColorStop(1, "rgba(7,6,6,0)");
  c.fillStyle = gr; c.fillRect(0, 0, 100, H);
  var P = function(lat, lon){ var la = lat*D, lo = lon*D - rot, cx = Math.cos(la)*Math.sin(lo), cy = Math.sin(la)*Math.cos(tilt) - Math.cos(la)*Math.cos(lo)*Math.sin(tilt), z = Math.sin(la)*Math.sin(tilt) + Math.cos(la)*Math.cos(lo)*Math.cos(tilt); return [gx + R*cx, gy - R*cy, z] };
  c.save(); c.lineCap = "round"; c.lineWidth = .16;
  var seg = function(a, b){ var z = (a[2] + b[2])/2; if(z <= 0) return; c.strokeStyle = "rgba(214,220,203," + (.08 + .27*Math.pow(z, .8)).toFixed(3) + ")"; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke() };
  for(i = -75; i <= 75; i += 15){ var prev = P(i, -180); for(j = -180 + 4; j <= 180; j += 4){ var q = P(i, j); seg(prev, q); prev = q } }
  for(j = -180; j < 180; j += 15){ var prev2 = P(-90, j); for(i = -90 + 4; i <= 90; i += 4){ var q2 = P(i, j); seg(prev2, q2); prev2 = q2 } }
  for(i = -60; i <= 60; i += 15) for(j = -180; j < 180; j += 15){ var d = P(i, j); if(d[2] > .05){ c.fillStyle = "rgba(226,232,214," + (.1 + .5*d[2]).toFixed(3) + ")"; c.beginPath(); c.arc(d[0], d[1], .26, 0, 7); c.fill() } }
  c.strokeStyle = "rgba(214,220,203,.2)"; c.lineWidth = .22; c.beginPath(); c.arc(gx, gy, R, 0, 7); c.stroke();
  var sk = P(55.9, 13.5);
  if(sk[2] > .1){ var pu = (t*.7) % 1; c.fillStyle = "rgba(240,244,232,.95)"; c.beginPath(); c.arc(sk[0], sk[1], .55, 0, 7); c.fill(); c.strokeStyle = "rgba(240,244,232," + (.6*(1 - pu)).toFixed(3) + ")"; c.lineWidth = .24; c.beginPath(); c.arc(sk[0], sk[1], .8 + pu*3.4, 0, 7); c.stroke() }
  c.restore();
  v3Grad(c, 0, 0, 100, H*.28, [[0, "rgba(7,6,6,.7)"], [1, "rgba(7,6,6,0)"]]);
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
  var f = w/100*1.7, i, ia = rev(rt, .25, .6), D = {addr:v3t("a8.re.addr"), city:v3t("a8.re.city"), facts:v3t("a8.re.facts").split(" · ")};
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
    var yk = .745, rt = Math.max(0, t - RT0);
    var f1 = ioC(k3(t, 9.55, 9.9)), f2 = ioC(k3(t, 9.8, 10.25));
    reelL(c, sc.x, sc.y, sc.w, sc.h, rt, pa, sc.r, f1, f2, RPH, yk);
    A8.reelUI(c, sc.x, sc.y, sc.w, sc.h, pa, rev(rt, .3, .5));
    /* kopplade fält: uppgifterna i kortet överst flyger in i mallen */
    var ff = sc.w/100*1.7, g0 = A8.tplGeo(0, sc.x, sc.y, sc.w, sc.h, ff, yk), inn = g0.inner;
    var xs = cx0 + 6 - .4, ay = Y0 + .5 + 9.2, cl = Y0 + .5 + 14.2, lb2 = {size:2.0, weight:600, f:"sans", sp:.14};
    var SRC = [[xs + v3Measure(c, addr, {size:5.8})/2, ay - 2.2], [xs + v3Measure(c, city.toUpperCase(), lb2)/2, cl - .6], [xs + v3Measure(c, city.toUpperCase() + "  ·  ", lb2) + v3Measure(c, F[0].toUpperCase(), lb2)/2, cl - .6], [xs + v3Measure(c, city.toUpperCase() + "  ·  " + F[0].toUpperCase() + "  ·  ", lb2) + v3Measure(c, F[1].toUpperCase(), lb2)/2, cl - .6]];
    var TXT = [addr, city, F[0], F[1]], TGT = g0.tgt;
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

/* inga kameraljud och inga tick per element: bara knappklicket, rösten och loggans korta ton */
function sched1(H){
  H.soft("tick1", 1.75, .09);
  [3.1, 3.9, 4.18, 4.46].forEach(function(q){ H.soft("tick2", q + .5, .07) });
  H.click(TAP, .4);
  H.soft("tick1", PH_IN + .3, .08);
  for(var i = 0; i < 4; i++) H.soft("tick2", 9.0 + i*.14 + .95, .06);
  SWT.forEach(function(q){ H.soft("tick1", RT0 + q, .08) });
}


/* ---------- annons 2: så fungerar Reel Studio (förklaringsvideo, utan röst) ---------- */
var EX = {RT0:3.7, CUTS:[0, 1.7, 3.4, 5.1, 6.8, 8.5], SWT:[5.3, 7.3], T2:3.6, T3:7.4, T4:11.2, T5:14.8, DUR:19.0, LOGO:15.2};
var RPH6 = ["rs_dining", "rs_chair", "rs_kitchen", "bedroom", "rs_floor", "rs_dining"];
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
  var yk = .745;
  if(pa > .02){
    var py = pcy + (1 - pin)*20 + pout*8, sc = phone2(c, pxx, py, pww, phh, pa, (1 - pin)*-.06), rt = Math.max(0, t - EX.RT0);
    var f1 = ioC(k3(t, 5.2, 5.55)), f2 = ioC(k3(t, 5.45, 5.9));
    reelF(c, sc.x, sc.y, sc.w, sc.h, rt, pa, sc.r, f1, f2, f2, RPH6, EX.CUTS, EX.SWT);
    A8.reelUI(c, sc.x, sc.y, sc.w, sc.h, pa, rev(rt, .3, .5)*(1 - shrink));
    /* scen 2: datakortet och kopplingarna */
    var dk = k3(t, EX.T2 + .2, EX.T2 + .7)*(1 - k3(t, EX.T3 - .5, EX.T3 - .1));
    if(dk > .02){
      var dy = Y0 + 14;
      fcard(c, 10, dy, 80, 17.5, dk, 3.2, "#fff", 0);
      sCard(c, 10 + 80 - 5 - 24, dy + 3.6, 24, 5.2, dk, 2.6, "#E3F0E4", 0); dotc(c, 10 + 80 - 5 - 24 + 3, dy + 6.2, .8, "#2f6a3a", dk); sTx(c, "LEVERERAD", 10 + 80 - 5 - 24 + 5, dy + 7.5, dk, {size:1.9, weight:600, color:"#2f6a3a", sp:.2});
      v3Text(c, addr, 15.6, dy + 9.2, {size:5.8, color:INK, alpha:dk});
      sTx(c, cstr, 15.6, dy + 14.2, dk, {size:2.0, weight:600, color:MUT, sp:.14});
      var lb2 = {size:2.0, weight:600, f:"sans", sp:.14}, ff = sc.w/100*1.7, g0 = postGeo(c, 0, sc.x, sc.y, sc.w, sc.h), inn = 0, xs = 15.6, ay = dy + 9.2, cl = dy + 14.2;
      var SRC = [[xs + v3Measure(c, addr, {size:5.8})/2, ay - 2.2], [xs + v3Measure(c, city.toUpperCase(), lb2)/2, cl - .6], [xs + v3Measure(c, city.toUpperCase() + "  ·  ", lb2) + v3Measure(c, F[0].toUpperCase(), lb2)/2, cl - .6], [xs + v3Measure(c, city.toUpperCase() + "  ·  " + F[0].toUpperCase() + "  ·  ", lb2) + v3Measure(c, F[1].toUpperCase(), lb2)/2, cl - .6]];
      var TXT = [addr, city, F[0], F[1]], TGT = g0.tgt;
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
function sched2(H){ H.click(3.0, .4) }


/* ---------- annons 3: så fungerar Content Studio (förklaringsvideo, utan röst) ----------
   Två steg: välj bild, välj mall. Sedan flödet: uppgifterna kopplas in i det valda inlägget. */
var CX = {T2:3.7, CL1:1.45, CL2:5.9, T3:7.7, T5:12.7, LOGO:13.0, DUR:17.0};
/* inläggen: mörkt foto, en tunn ram inuti, kontorets märke överst och centrerad editorial typografi */
var PKIND = [
  {brand:"SOLVARA", mark:0, acc:"#D2B07A"},
  {brand:"HAVSVIK", mark:1, acc:"#C8CFC0"},
  {brand:"LINDÖ", mark:2, acc:"#F1C9A8"}
];
function postGeo(c, k, x, y, w, h){
  var s = Math.min(w/100, h/125), Wl = w/s, Hl = h/s, cy = Hl*.6, g = {s:s, Wl:Wl, Hl:Hl, cy:cy}, T = function(lx, ly){ return [x + s*lx, y + s*ly] };
  var addr = v3t("a8.re.addr"), city = v3t("a8.re.city"), F = v3t("a8.re.facts").split(" · ");
  if(k === 2){
    var ls = {size:2.6, weight:600, f:"sans", sp:.32}, ls2 = {size:2.4, weight:600, f:"sans", sp:.3}, A = addr.toUpperCase(), C = city.toUpperCase();
    var wl1 = v3Measure(c, A + "  ·  " + C, ls), x1 = Wl/2 - wl1/2, wad = v3Measure(c, A, ls), wa = v3Measure(c, A + "  ·  ", ls), wc = v3Measure(c, C, ls);
    var r = F[0].toUpperCase(), q = F[1].toUpperCase(), wl2 = v3Measure(c, r + "  ·  " + q, ls2), x2 = Wl/2 - wl2/2, wr = v3Measure(c, r, ls2), wd = v3Measure(c, r + "  ·  ", ls2), wy = v3Measure(c, q, ls2);
    g.tgt = [T(x1 + wad/2, cy + 15.8), T(x1 + wa + wc/2, cy + 15.8), T(x2 + wr/2, cy + 22.9), T(x2 + wd + wy/2, cy + 22.9)];
  } else g.tgt = [T(Wl/2, cy - 4.5), T(Wl/2, cy + 7), T(Wl/2 - 13, cy + 21), T(Wl/2 + 13, cy + 21)];
  return g;
}
var SHIM = 0;
var TSTYLE = "ed";
var CARDK = [
  {bg:"#F4EFE6", ink:"#1E2A22", acc:"#A8844F", hair:"rgba(30,42,34,.3)"},
  {bg:"#11161C", ink:"#F3EFE7", acc:"#D2B07A", hair:"rgba(243,239,231,.28)"},
  {bg:"#8F3A22", ink:"#F7EEE4", acc:"#F1C9A8", hair:"rgba(247,238,228,.32)"}
];
/* Reel-mallar: ett kort (platta) i kontorets färg längst ner på fotot, elegant och luftigt */
/* Reel-mallar: ett kontors tre mallar. Ren typografi på fotot (Kommande), ett platt färgfält med logotyp (Till salu) och en stor Såld-bild. Texterna kommer från v3t, så de går att ändra. */
function cardOverlay(c, k, x, y, w, h, a, f1, f2, f3){
  var s = Math.min(w/100, h/125), Wl = w/s, Hl = h/s, tall = Hl > 150, B = tall ? Hl*.765 : Hl - 9, L = 8, R = tall ? 83 : Wl - 8;
  var F = v3t("a8.re.facts").split(" · "), addr = v3t("a8.re.addr"), city = String(v3t("a8.re.city")).toUpperCase(), off = String(v3t("a11.office")), osub = String(v3t("a11.officesub")), agent = String(v3t("a11.agent"));
  var tagK = ["tpl.kommande", "tpl.tillsalu", "tpl.sald"], CREAM = "#EFEDE7", SAGE = "#C8CFC0", mk = 1;
  f1 = f1 == null ? 1 : f1; f2 = f2 == null ? 1 : f2; f3 = f3 == null ? f2 : f3;
  c.save(); c.translate(x, y); c.scale(s, s);
  var bar = function(w0, yy, f){ if(f >= 1) return; c.save(); c.globalAlpha = a*(1 - f)*.3*(.7 + .3*Math.sin(SHIM*4.2)); c.fillStyle = "#fff"; rr(c, L, yy, w0, 1.1, .55); c.fill(); c.restore() };
  var brand = function(yy, col, right){
    var nm = off.toUpperCase(), fs = 2.5, nw = v3Measure(c, nm, {size:fs, weight:600, f:"sans", sp:.3}), bx = right ? R - nw - 7 : L;
    c.save(); c.globalAlpha = a; tplMark(c, mk, bx + 2.3, yy - 1, 2.3, col, "#101010"); c.restore();
    v3Text(c, nm, bx + 7, yy, {size:fs, weight:600, f:"sans", sp:.3, color:col, alpha:.96*a});
  };
  if(k === 0){
    v3Grad(c, 0, Hl*.36, Wl, Hl*.64 + 1, [[0, "rgba(8,7,7,0)"], [1, "rgba(8,7,7," + (.78*a).toFixed(3) + ")"]]);
    v3Grad(c, 0, 0, Wl, Hl*.2, [[0, "rgba(8,7,7," + (.35*a).toFixed(3) + ")"], [1, "rgba(8,7,7,0)"]]);
    c.save(); c.globalAlpha = a; c.fillStyle = "#fff"; c.fillRect(L, B - 62.6, 7, .35); c.restore();
    v3Text(c, String(v3t(tagK[0])).toUpperCase(), L + 10.5, B - 61.4, {size:2.7, weight:600, f:"sans", sp:.36, color:"#fff", alpha:a});
    bar(56, B - 43, f1); v3Text(c, addr, L - .4, B - 40, {size:15, color:"#fff", alpha:a, p:f1});
    bar(24, B - 31.6, f2); v3Text(c, city, L, B - 30.4, {size:2.7, weight:600, f:"sans", sp:.34, color:"#fff", alpha:.88*a, p:f2});
    v3Text(c, String(v3t("a11.soon")), R, B - 30.2, {size:4.6, italic:true, color:"#fff", align:"r", alpha:.88*a*f2});
    c.save(); c.globalAlpha = a*.5; c.fillStyle = "#fff"; c.fillRect(L, B - 21.5, (R - L)*Math.min(1, f3*1.3), .25); c.restore();
    bar(40, B - 13.8, f3); v3Text(c, (F[0] + "     " + F[1]).toUpperCase(), L, B - 12.5, {size:2.7, weight:600, f:"sans", sp:.26, color:"#fff", alpha:.94*a, p:f3});
    brand(B - 1.5, "#fff", false);
    v3Text(c, agent.toUpperCase(), R, B - 1.5, {size:2.2, weight:500, f:"sans", sp:.26, color:"#fff", align:"r", alpha:.7*a});
  } else if(k === 1){
    v3Grad(c, 0, Hl*.5, Wl, Hl*.5 + 1, [[0, "rgba(8,7,7,0)"], [1, "rgba(8,7,7," + (.28*a).toFixed(3) + ")"]]);
    var bt = Hl - (tall ? 56 : 46);
    c.save(); c.globalAlpha = a; c.fillStyle = "#1F392F"; c.fillRect(0, bt, Wl, Hl - bt); c.fillStyle = "rgba(239,237,231,.4)"; c.fillRect(0, bt, Wl, .3); c.restore();
    var tg = String(v3t(tagK[1])).toUpperCase(), tgw = v3Measure(c, tg, {size:2.3, weight:700, f:"sans", sp:.28}) + 9;
    c.save(); c.globalAlpha = a; c.fillStyle = CREAM; rr(c, L, bt + 6, tgw, 6.4, 3.2); c.fill(); c.restore();
    v3Text(c, tg, L + tgw/2 + .4, bt + 10.5, {size:2.3, weight:700, f:"sans", sp:.28, color:"#1c1c1e", align:"c", alpha:a});
    brand(bt + 10, SAGE, true);
    bar(54, bt + 20, f1); v3Text(c, addr, L - .3, bt + 25.6, {size:13, color:CREAM, alpha:a, p:f1});
    bar(46, bt + 34, f3); v3Text(c, city + "     " + (F[0] + "     " + F[1]).toUpperCase(), L, bt + 35.4, {size:2.6, weight:600, f:"sans", sp:.26, color:SAGE, alpha:.95*a, p:f3});
  } else {
    v3Fill(c, 0, 0, Wl, Hl, "#080707", .42*a);
    v3Grad(c, 0, Hl*.4, Wl, Hl*.6 + 1, [[0, "rgba(8,7,7,0)"], [1, "rgba(8,7,7," + (.6*a).toFixed(3) + ")"]]);
    var sy = tall ? Hl*.52 : Hl*.5;
    v3Text(c, String(v3t(tagK[2])), L - 1, sy, {size:38, italic:true, color:CREAM, alpha:a});
    bar(50, sy + 8, f1); v3Text(c, (addr + "   ·   " + city).toUpperCase(), L, sy + 9.4, {size:2.9, weight:600, f:"sans", sp:.3, color:"#fff", alpha:.92*a, p:f1});
    v3Text(c, String(v3t("tpl.tack")), L, sy + 19, {size:5.4, italic:true, color:"#fff", alpha:.86*a*f2});
    brand(B - 1.5, "#fff", false);
    v3Text(c, agent.toUpperCase(), R, B - 1.5, {size:2.2, weight:500, f:"sans", sp:.26, color:"#fff", align:"r", alpha:.7*a});
  }
  c.restore();
}
/* mallens text och ram, utan fotot. a = genomskinlighet (även för texten), f1 adress, f2 ort, f3 rum och yta (0 = tom plats, 1 = ifylld) */
function postOverlay(c, k, x, y, w, h, a, f1, f2, f3){
  if(a <= .02) return;
  if(TSTYLE === "card") return cardOverlay(c, k, x, y, w, h, a, f1, f2, f3);
  var K = PKIND[k], g = postGeo(c, k, x, y, w, h), s = g.s, Wl = g.Wl, Hl = g.Hl, cy = g.cy, W = "#fff", mx = Wl/2, F = v3t("a8.re.facts").split(" · "), addr = v3t("a8.re.addr"), city = v3t("a8.re.city");
  f1 = f1 == null ? 1 : f1; f2 = f2 == null ? 1 : f2; f3 = f3 == null ? f2 : f3;
  c.save(); c.translate(x, y); c.scale(s, s);
  v3Fill(c, 0, 0, Wl, Hl, "#080707", .4*a);
  v3Grad(c, 0, 0, Wl, Hl, [[0, "rgba(8,7,7," + (.34*a).toFixed(3) + ")"], [.45, "rgba(8,7,7," + (.06*a).toFixed(3) + ")"], [1, "rgba(8,7,7," + (.7*a).toFixed(3) + ")"]]);
  c.save(); c.globalAlpha = a*.42; c.strokeStyle = W; c.lineWidth = .35; c.strokeRect(5, 5, Wl - 10, Hl - 10); c.restore();
  var bl = {size:2.5, weight:600, f:"sans", sp:.3}, bw = v3Measure(c, K.brand, bl), tot = 6.2 + bw, lx = mx - tot/2;
  c.save(); c.globalAlpha = a; tplMark(c, K.mark, lx + 2.4, 17, 2.4, K.acc, "#101010"); c.restore();
  v3Text(c, K.brand, lx + 7, 17.9, {size:2.5, weight:600, f:"sans", sp:.3, color:W, alpha:.95*a});
  v3Text(c, "MÄKLARHUS", lx + 7, 22, {size:1.5, weight:500, f:"sans", sp:.34, color:W, alpha:.6*a});
  var cap = function(t, yy, sz, al, p){ v3Text(c, t, mx, yy, {size:sz, weight:600, f:"sans", sp:.32, color:W, align:"c", alpha:al*a, p:p}) };
  var shim = function(){ return .72 + .28*Math.sin(SHIM*4.2) };
  var bar = function(w0, yy, h0, f){ if(f >= 1) return; c.save(); c.globalAlpha = a*(1 - f)*.2*shim(); c.fillStyle = W; rr(c, mx - w0/2, yy, w0, h0, h0*.5); c.fill(); c.restore() };
  var hl = function(yy, w0){ c.save(); c.globalAlpha = a*.55; c.fillStyle = W; c.fillRect(mx - w0/2, yy, w0, .3); c.restore() };
  if(k === 2){
    v3Text(c, "Såld", mx, cy + 4, {size:34, italic:true, color:W, align:"c", alpha:a});
    hl(cy + 10.5, 10);
    bar(60, cy + 11.8, 5.2, f2); cap(addr.toUpperCase() + "  ·  " + city.toUpperCase(), cy + 15.8, 2.6, .92, f2);
    bar(40, cy + 19.4, 4.4, f3); cap(F[0].toUpperCase() + "  ·  " + F[1].toUpperCase(), cy + 22.9, 2.4, .78, f3);
    v3Text(c, "Tack för förtroendet", mx, cy + 33, {size:4.4, italic:true, color:W, align:"c", alpha:.82*a});
  } else {
    cap(k === 0 ? "KOMMANDE" : "TILL SALU", cy - 13.5, 2.3, .88);
    bar(60, cy - 12, 12, f1); v3Text(c, addr, mx, cy, {size:13.5, color:W, align:"c", alpha:a, p:f1});
    if(k === 0){
      hl(cy + 6.6, 10); bar(30, cy + 10.4, 4.6, f2); v3Text(c, "Släpps vecka 12", mx, cy + 15, {size:4.4, italic:true, color:W, align:"c", alpha:.8*a, p:f2});
    } else {
      bar(34, cy + 3.8, 4.6, f2); cap(city.toUpperCase(), cy + 8, 2.6, .9, f2); hl(cy + 12.6, 10);
      if(f3 < 1){ bar(18, cy + 16, 8, f3) }
      [[F[0].split(" ")[0], "RUM", -13], [F[1].split(" ")[0], "M²", 13]].forEach(function(r){
        v3Text(c, r[0], mx + r[2], cy + 23, {size:6.8, color:W, align:"c", alpha:a, p:f3});
        v3Text(c, r[1], mx + r[2], cy + 28, {size:1.9, weight:600, f:"sans", sp:.3, color:W, align:"c", alpha:.64*a*f3});
      });
    }
  }
  c.restore();
}
function drawPost(c, k, x, y, w, h, key, a, f1, f2, f3){
  if(a <= .02) return;
  c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 14; c.shadowOffsetY = 3; c.fillStyle = "#000"; rr(c, x, y, w, h, 1.5); c.fill(); c.shadowColor = "transparent";
  rr(c, x, y, w, h, 1.5); c.clip(); v3Photo(c, key, x, y, w, h, {pos:V3_POS[key]});
  c.restore();
  c.save(); rr(c, x, y, w, h, 1.5); c.clip(); postOverlay(c, k, x, y, w, h, a, f1, f2, f3); c.restore();
}
function adContent(c, G, t){
  var H = G.H, S = SG(G), i, oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy;
  var addr = v3t("a8.re.addr"), city = v3t("a8.re.city"), F = v3t("a8.re.facts").split(" · ");
  bgLight(c, G, t);
  var hs = 6.6, hy = Y0 + 7, PKEY = [GRID7[4], GRID7[0], GRID7[2]];
  kline(c, [["Välj", 0], ["en", 0], ["bild.", 1]], hy, hs, t, .15, CX.T2 - .15);
  kline(c, [["Välj", 0], ["en", 0], ["mall.", 1]], hy, hs, t, CX.T2 + .25, CX.T3 - .2);
  kline(c, [["Uppgifterna", 0], ["fylls", 0], ["i", 1], ["själva.", 1]], hy, hs, t, CX.T3 + .3, CX.T5 - .2);
  /* steg 1 · välj en bild: markören går till bilden och markerar exakt den */
  var ga = Math.min(1, rev(t, .1, .4))*(1 - k3(t, CX.T2 - .3, CX.T2 + .1)), en = oQ(k3(t, 0, .8));
  if(ga > .02){
    var cw = 80, cx = 10, ch = 52, cy = Y0 + 18 + (1 - en)*12, x0 = cx + 6, tw = (cw - 12 - 2*2.4)/3, th = tw*.7, SEL = 1, sel = t >= CX.CL1;
    var pos = function(n){ return [x0 + (n % 3)*(tw + 2.4), cy + 11.5 + Math.floor(n/3)*(th + 2.4)] };
    fcard(c, cx, cy, cw, ch, ga, 3.2, "#fff", 0);
    sTx(c, "STEG 1 · VÄLJ EN BILD", x0, cy + 7, ga*rev(t, .3, .4), {size:2.4, weight:700, sp:.2});
    sTx(c, (sel ? 1 : 0) + " / 1 VALD", cx + cw - 6, cy + 7, ga*rev(t, .3, .4), {size:2.4, weight:600, color:MUT, align:"r", sp:.16});
    for(i = 0; i < 6; i++){
      var q = pos(i), a2 = rev(t, .25 + i*.08, .3)*ga;
      sCard(c, q[0] - .4, q[1] - .4, tw + .8, th + .8, a2, 1.4, "#fff", 2); sPh(c, GRID7[i], q[0], q[1], tw, th, a2, 1.2, 1.14);
      if(i === SEL && sel){
        var sp = oBack(k3(t, CX.CL1, CX.CL1 + .3));
        c.save(); c.globalAlpha = ga; c.strokeStyle = GRN; c.lineWidth = .6; rr(c, q[0] - .9, q[1] - .9, tw + 1.8, th + 1.8, 1.6); c.stroke(); c.fillStyle = GRN; c.beginPath(); c.arc(q[0] + 3.4, q[1] + 3.4, 2.4*Math.max(.01, sp), 0, 7); c.fill(); c.restore();
        if(sp > .6) sTx(c, "✓", q[0] + 3.4, q[1] + 4.4, ga, {size:2.6, weight:700, color:"#fff", align:"c"});
      }
    }
    var tp = pos(SEL), mv = ioC(k3(t, .75, CX.CL1 - .08));
    cursor(c, lerp(80, tp[0] + tw*.55, mv), lerp(cy + ch + 5, tp[1] + th*.5, mv), ga*rev(t, .7, .3)*(1 - k3(t, CX.CL1 + .9, CX.CL1 + 1.3)), k3(t, CX.CL1 - .1, CX.CL1 + .05)*(1 - k3(t, CX.CL1 + .05, CX.CL1 + .3)));
  }
  /* steg 2 · välj en mall: tre mallar, markören väljer Såld */
  var bw = 29, bh = bw*1.25, gap = 1.5, bx0 = 50 - (3*bw + 2*gap)/2, by = Y0 + 20, ma = rev(t, CX.T2 + .1, .45), SELK = 2, chosen = t >= CX.CL2;
  var r2 = {x:bx0 + SELK*(bw + gap), y:by, w:bw, h:bh}, bwB = G.is9 ? 50 : 46, r3 = {x:50 - bwB/2, y:Y0 + 21, w:bwB, h:bwB*1.25};
  var mt = ioC(k3(t, CX.T3 - .25, CX.T3 + .55)), fadeOut = k3(t, CX.T5 - .5, CX.T5 - .1);
  var rst1 = 1 - ioC(k3(t, CX.T3 - .05, CX.T3 + .45)), rst2 = 1 - ioC(k3(t, CX.T3, CX.T3 + .5)), f1 = t < CX.T3 + 1.3 ? rst1 : ioC(k3(t, CX.T3 + 1.9, CX.T3 + 2.3)), f2 = t < CX.T3 + 1.3 ? rst2 : ioC(k3(t, CX.T3 + 2.15, CX.T3 + 2.7));
  if(ma > .02){
    var dim = chosen ? k3(t, CX.CL2 + .15, CX.CL2 + .6)*.6 : 0, offA = 1 - k3(t, CX.T3 - .45, CX.T3 - .05);
    [0, 1].forEach(function(k){
      var rx = bx0 + k*(bw + gap), aa = ma*offA*(1 - fadeOut);
      drawPost(c, k, rx, by, bw, bh, PKEY[k], aa, 1, 1);
      if(dim > 0){ c.save(); c.globalAlpha = aa*dim; c.fillStyle = "#080707"; rr(c, rx, by, bw, bh, 1.5); c.fill(); c.restore() }
    });
    var NM = ["Kommande", "Till salu", "Såld"], pillY = by + bh + 8.5, pw0 = 25.4, px0 = 50 - (3*pw0 + 2*2.2)/2;
    NM.forEach(function(nm, k){
      var on = chosen && k === SELK, pa = ma*offA*(1 - fadeOut), xx = px0 + k*(pw0 + 2.2);
      sCard(c, xx, pillY, pw0, 7, pa, 3.5, on ? GRN : "rgba(236,232,228,.92)", 0);
      sTx(c, nm, xx + pw0/2, pillY + 4.7, pa, {size:2.7, weight:700, color:on ? "#fff" : INK, align:"c", sp:.1});
    });
    sTx(c, "STEG 2 · VÄLJ EN MALL", 50, by - 3.4, ma*offA*(1 - fadeOut)*k3(t, CX.T2 + .3, CX.T2 + .7), {size:2.4, weight:700, color:"#fff", align:"c", sp:.2});
  }
  /* det valda inlägget följer med in i flödet */
  var rs = {x:lerp(r2.x, r3.x, mt), y:lerp(r2.y, r3.y, mt), w:lerp(r2.w, r3.w, mt), h:lerp(r2.h, r3.h, mt)}, sa = ma*(1 - fadeOut);
  if(sa > .02){
    drawPost(c, SELK, rs.x, rs.y, rs.w, rs.h, PKEY[SELK], sa, f1, f2);
    if(chosen && mt < .98){ var rp = oBack(k3(t, CX.CL2, CX.CL2 + .3)); c.save(); c.globalAlpha = sa*(1 - mt); c.strokeStyle = GRN; c.lineWidth = .7; rr(c, rs.x - 1, rs.y - 1, rs.w + 2, rs.h + 2, 2); c.stroke(); c.fillStyle = GRN; c.beginPath(); c.arc(rs.x + rs.w - 3, rs.y + 3, 2.5*Math.max(.01, rp), 0, 7); c.fill(); c.restore(); if(rp > .6){ sTx(c, "✓", rs.x + rs.w - 3, rs.y + 4, sa*(1 - mt), {size:2.8, weight:700, color:"#fff", align:"c"}) } }
    var cmv = ioC(k3(t, CX.CL2 - 1.0, CX.CL2 - .08));
    cursor(c, lerp(84, r2.x + r2.w*.55, cmv), lerp(by + bh + 22, r2.y + r2.h*.5, cmv), ma*rev(t, CX.CL2 - 1.1, .3)*(1 - k3(t, CX.CL2 + .9, CX.CL2 + 1.3)), k3(t, CX.CL2 - .1, CX.CL2 + .05)*(1 - k3(t, CX.CL2 + .05, CX.CL2 + .3)));
  }
  /* flödet: leveransens uppgifter kopplas in i inlägget */
  var dk = rev(t, CX.T3 + .3, .4)*(1 - fadeOut);
  if(dk > .02){
    var dy = Y0 + 11.5, dw = 66, dx = 50 - dw/2;
    fcard(c, dx, dy, dw, 7.4, dk, 3.7, "#fff", 0);
    dotc(c, dx + 4.6, dy + 3.7, .9, "#2f6a3a", dk); sTx(c, "LEVERERAD", dx + 7.2, dy + 4.7, dk, {size:2.0, weight:700, color:"#2f6a3a", sp:.2});
    v3Text(c, addr, dx + dw - 5, dy + 4.9, {size:3.4, color:INK, align:"r", alpha:dk});
    var g1 = postGeo(c, SELK, r3.x, r3.y, r3.w, r3.h), TXT = [addr, city, F[0], F[1]];
    for(i = 0; i < 4; i++) link(c, TXT[i], 50 + (i - 1.5)*7, dy + 7.4, g1.tgt[i][0], g1.tgt[i][1], t, CX.T3 + 1.0 + i*.14, .95, (i - 1.5)*5);
  }
  /* slut */
  var ea = k3(t, CX.LOGO - .1, CX.LOGO + .5);
  if(ea > .01){
    var cy2 = H*.4, mh2 = 15, mw2 = mh2*858.6/756.3, fs = 7.2, ww2 = v3Measure(c, "VIEWLY", {size:fs, weight:500, f:"sans", sp:.3}) - .3*fs, tot3 = mw2 + 3.4 + ww2, lx = 50 - tot3/2, lp = k3(t, CX.LOGO, CX.LOGO + .8);
    v3Mark(c, lx, cy2 - mh2/2, mh2, "#fff", C3.dotL, {reveal:lp, dot:1, alpha:ea});
    v3Text(c, "VIEWLY", lx + mw2 + 3.4, cy2 + fs*.34, {size:fs, weight:500, f:"sans", sp:.3, color:"#fff", alpha:ea*k3(t, CX.LOGO + .15, CX.LOGO + .7)});
    kline(c, [["Content", 0], ["Studio.", 1]], cy2 + 22, 5.6, t, CX.LOGO + .55, 99);
    kline(c, [["Inlägg", 0], ["direkt", 0], ["från", 0], ["leveransen.", 0]], cy2 + 30.5, 3.3, t, CX.LOGO + 1.0, 99);
  }
}
function sched3(H){ H.click(CX.CL1, .35); H.click(CX.CL2, .35) }


/* ---------- annons 1b: samma annons, men öppnar med en iPhone-notis ("Dina foton är klara") ---------- */
var NOF = 4.0;
function adReelNotis(c, G, t){
  var H = G.H, S = SG(G), tf = t - NOF, flowT = Math.max(0, tf);
  if(t >= NOF - .35) adReel1(c, G, flowT);
  var ia = 1 - k3(t, NOF - .3, NOF);
  if(ia <= .01) return;
  c.save(); c.globalAlpha = ia;
  v3Fill(c, 0, 0, 100, H, "#070606");
  v3Photo(c, "rs_dusk2", 0, 0, 100, H, {scale:lerp(1.08, 1.14, k3(t, 0, 4)), pos:V3_POS.rs_dusk2, alpha:ioC(k3(t, 0, .4))});
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", .52);
  v3Grad(c, 0, 0, 100, H*.4, [[0, "rgba(8,7,7,.5)"], [1, "rgba(8,7,7,0)"]]);
  /* låsskärmens klocka */
  var ca = rev(t, .1, .5), ty = S.y0 + 8;
  v3Text(c, NT.d, 50, ty, {size:3.3, weight:500, f:"sans", color:"#fff", align:"c", alpha:.85*ca});
  v3Text(c, NT.t, 50, ty + 15, {size:15, weight:300, f:"sans", color:"#fff", align:"c", alpha:.95*ca});
  /* notisen glider ner */
  var nin = oQ(k3(t, .75, 1.35)), tap = k3(t, 3.0, 3.18), pr = 1 - .035*Math.sin(tap*Math.PI), nw = 88, nx = 6, nh = 21.5, ny = lerp(-26, S.y0 + 31, nin);
  if(nin > .01){
    c.save(); c.translate(50, ny + nh/2); c.scale(pr, pr); c.translate(-50, -ny - nh/2);
    c.save(); c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 9; c.shadowOffsetY = 1.4; c.fillStyle = "rgba(244,243,240,.9)"; rr(c, nx, ny, nw, nh, 5); c.fill(); c.restore();
    c.fillStyle = "#101010"; rr(c, nx + 3.6, ny + 3.6, 8.4, 8.4, 2.2); c.fill();
    v3Mark(c, nx + 5.6, ny + 5.5, 4.6, "#fff", C3.dotL, {reveal:1, dot:1, alpha:1});
    v3Text(c, "VIEWLY", nx + 14.6, ny + 6.4, {size:2.6, weight:600, f:"sans", sp:.12, color:"#1c1c1e"});
    v3Text(c, "nu", nx + nw - 4, ny + 6.4, {size:2.5, weight:400, f:"sans", color:"#6b6b70", align:"r"});
    v3Text(c, "Dina foton är klara", nx + 14.6, ny + 11.8, {size:3.3, weight:600, f:"sans", color:"#1c1c1e"});
    v3Text(c, "Storgatan 15, Helsingborg · 12 bilder levererade", nx + 14.6, ny + 16.4, {size:2.75, weight:400, f:"sans", color:"#3a3a3e"});
    c.restore();
    var cu = ioC(k3(t, 2.1, 2.95)), cxx = lerp(80, 56, cu), cyy = lerp(ny + nh + 30, ny + nh*.55, cu);
    cursor(c, cxx, cyy, rev(t, 2.0, .3)*(1 - k3(t, 3.25, 3.55)), tap*(1 - k3(t, 3.18, 3.4)));
  }
  c.restore();
}
function schedNotis(H){
  var Hs = {s:function(n, t, v, r){ H.s(n, t + NOF, v, r) }, soft:function(n, t, v, r, f){ H.soft(n, t + NOF, v, r, f) }, click:function(t, v){ H.click(t + NOF, v) }, tone:function(f, t, v, d){ H.tone(f, t + NOF, v, d) }};
  H.tone(1318.5, .82, .16, .9); H.tone(1568, .98, .14, .9); H.tone(2093, 1.16, .12, 1.2);
  H.click(3.0, .3);
  sched1(Hs);
}


/* =====================================================================
   FLÖDET (annons 1 och 1b): kort med levererade bilder, Skapa Reel, hämtar mallar och uppgifter, Reelen fyller i sig själv
   ===================================================================== */
var FL = {TAPF:3.25, CEX0:6.1, PH0:6.3, RT0:7.0, CUTS:[0, 1.8, 3.6, 5.4, 7.0], SWT:[3.6, 5.4], FA:8.0, FC:8.7, FD:9.4, PHO:15.4, LOGO:15.9, DUR:20.6, NOF:2.7};
var RPHF = ["rs_dining", "rs_chair", "rs_kitchen", "bedroom", "rs_floor"], THF = ["rs_dining", "rs_chair", "rs_kitchen"];
function reelF(c, x, y, w, h, rt, a, r, fa, fc, fd, ph, cuts, swt, tk){
  var i, ia = rev(rt, .1, .5), fixed = tk != null;
  if(a <= .02) return;
  c.save(); c.globalAlpha = a; rr(c, x, y, w, h, r || 0); c.clip(); v3Fill(c, x, y, w, h, "#000");
  for(i = 0; i < ph.length; i++){
    var s0 = cuts[i], s1 = cuts[i + 1] == null ? s0 + 3 : cuts[i + 1], pa = i === 0 ? 1 : k3(rt, s0, s0 + .55); if(pa <= .01) continue;
    v3Photo(c, ph[i], x, y, w, h, {scale:lerp(1.05, 1.15, k3(rt, s0, s1 + .5)), pos:V3_POS[ph[i]], alpha:ioC(pa)});
  }
  var ti = fixed ? tk : (rt >= swt[1] ? 2 : rt >= swt[0] ? 1 : 0), tp = (fixed || !ti) ? 1 : ioC(k3(rt - swt[ti - 1], 0, .7)), fil = fixed || !ti;
  SHIM = rt;
  if(!fixed && ti > 0 && tp < 1) postOverlay(c, ti - 1, x, y, w, h, a*ia*(1 - tp), 1, 1, 1);
  postOverlay(c, ti, x, y, w, h, a*ia*(fil ? 1 : tp), fil ? fa : 1, fil ? fc : 1, fil ? fd : 1);
  c.restore();
}
function logoEnd(c, G, t, at, h1, h2){
  var H = G.H, ea = k3(t, at - .1, at + .5);
  if(ea <= .01) return;
  var cy = H*.4, mh = 15, mw = mh*858.6/756.3, fs = 7.2, ww = v3Measure(c, "VIEWLY", {size:fs, weight:500, f:"sans", sp:.3}) - .3*fs, tot = mw + 3.4 + ww, lx = 50 - tot/2, lp = k3(t, at, at + .8);
  v3Mark(c, lx, cy - mh/2, mh, "#fff", C3.dotL, {reveal:lp, dot:1, alpha:ea});
  v3Text(c, "VIEWLY", lx + mw + 3.4, cy + fs*.34, {size:fs, weight:500, f:"sans", sp:.3, color:"#fff", alpha:ea*k3(t, at + .15, at + .7)});
  kline(c, h1, cy + 22, 5.6, t, at + .55, 99);
  if(h2 === "url") v3Text(c, "viewly.se", 50, cy + 29.5, {size:3.4, weight:500, f:"sans", color:"#fff", align:"c", alpha:.82*k3(t, at + 1.0, at + 1.6)});
  else kline(c, h2, cy + 30.5, 3.3, t, at + 1.0, 99);
}
function adFlow(c, G, t){
  var H = G.H, S = SG(G), i, oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy;
  var addr = v3t("a8.re.addr"), city = v3t("a8.re.city"), F = v3t("a8.re.facts").split(" · "), cstr = (city + "  ·  " + F[0] + "  ·  " + F[1]).toUpperCase();
  bgLight(c, G, t);
  var hs = 6.6, hy1 = Y0 + 6, hy2 = Y0 + 13.4;
  kline(c, [["Bilderna", 0], ["är", 0], ["redan", 0]], hy1, hs, t, .15, FL.TAPF - .3);
  kline(c, [["levererade.", 1]], hy2, hs, t, .45, FL.TAPF - .3);
  kline(c, [["Hämtar", 0], ["mall", 0], ["och", 0]], hy1, hs, t, FL.TAPF + .5, FL.CEX0 - .1);
  kline(c, [["uppgifter.", 1]], hy2, hs, t, FL.TAPF + .75, FL.CEX0 - .1);
  kline(c, [["Resten", 0], ["fyller", 0]], hy1, hs, t, FL.RT0 + .9, FL.RT0 + 5.6);
  kline(c, [["sig", 1], ["själv.", 1]], hy2, hs, t, FL.RT0 + 1.15, FL.RT0 + 5.6);
  kline(c, [["En", 0], ["Reel", 0], ["i", 0], ["ditt", 0]], hy1, hs, t, FL.RT0 + 5.8, FL.PHO - .2);
  kline(c, [["eget", 1], ["varumärke.", 1]], hy2, hs, t, FL.RT0 + 6.05, FL.PHO - .2);
  var cw0 = 80, cx0 = 10, ch0 = 70, cy0 = Y0 + 19, x0 = cx0 + 6, cex = ioC(k3(t, FL.CEX0, FL.CEX0 + .6));
  var cin = Math.min(1, rev(t, .05, .5))*(1 - k3(t, FL.RT0 + .45, FL.RT0 + .85)), enter = oQ(k3(t, 0, .9)), cyy = lerp(cy0, Y0 + .5, cex), chh = lerp(ch0, 17.5, cex), bob = Math.sin(t*1.2)*.4*(1 - cex);
  var lbl = {size:2.6, weight:600, f:"sans", sp:.14};
  if(cin > .02){
    var cyd = cyy + (1 - enter)*14 + bob;
    fcard(c, cx0, cyd, cw0, chh, cin, 3.2, "#fff", cex*6);
    var big = cin*(1 - cex*1.4 > 0 ? 1 - cex*1.4 : 0), sm = cin*k3(t, FL.CEX0 + .45, FL.CEX0 + .95);
    if(big > .02){
      var chipW = v3Measure(c, "LEVERERAD", {size:2.1, weight:600, f:"sans", sp:.2}) + 10, sy0 = cyd + 5;
      sCard(c, x0, sy0, chipW, 5.6, big, 2.8, "#E3F0E4", 0); dotc(c, x0 + 3.4, sy0 + 2.8, .95, "#2f6a3a", big);
      sTx(c, "LEVERERAD", x0 + 6, sy0 + 3.8, big, {size:2.1, weight:600, color:"#2f6a3a", sp:.2});
      var nb = "25 BILDER", nbw = v3Measure(c, nb, {size:2.1, weight:700, f:"sans", sp:.2}) + 9, nba = big*rev(t, .5, .4);
      sCard(c, cx0 + cw0 - 6 - nbw, sy0, nbw, 5.6, nba, 2.8, "#1C1C1E", 0); sTx(c, nb, cx0 + cw0 - 6 - nbw/2, sy0 + 3.8, nba, {size:2.1, weight:700, color:"#fff", align:"c", sp:.2});
      v3Text(c, addr, x0, cyd + 22, {size:8.4, color:INK, alpha:big*rev(t, .25, .45), p:oQ(k3(t, .25, .85))});
      sTx(c, cstr, x0, cyd + 27.8, big*rev(t, .45, .4), lbl);
      var tw = (cw0 - 12 - 3*2)/4, th = tw*.8, ty = cyd + 32.5, contentFade = 1 - k3(t, FL.TAPF + .1, FL.TAPF + .5);
      for(i = 0; i < 4; i++){
        var t0 = .6 + i*.18, ta = rev(t, t0, .35)*big*contentFade, tx = x0 + i*(tw + 2), sc = lerp(.9, 1, oQ(k3(t, t0, t0 + .5))), ty2 = ty + (1 - oQ(k3(t, t0, t0 + .5)))*1.6;
        c.save(); c.translate(tx + tw/2, ty2 + th/2); c.scale(sc, sc);
        sCard(c, -tw/2 - .4, -th/2 - .4, tw + .8, th + .8, ta, 1.4, "#fff", 2);
        if(i < 3) sPh(c, THF[i], -tw/2, -th/2, tw, th, ta, 1.2, 1.14); else { sCard(c, -tw/2, -th/2, tw, th, ta, 1.2, "#1C1C1E", 0); v3Text(c, "+22", 0, 1.8, {size:5.2, color:"#fff", align:"c", alpha:ta}) }
        c.restore();
      }
      /* knappen glider in mjukt, en bit in i kortet */
      var bw = 52, bh = 8.6, by = ty + th + 6.5, bin = oQ(k3(t, 1.6, 2.4)), ba = rev(t, 1.6, .6)*big*contentFade, press = k3(t, FL.TAPF, FL.TAPF + .22);
      if(ba > .02){
        c.save(); var by2 = by + (1 - bin)*4; c.translate(50, by2 + bh/2); var bs = 1 - .05*Math.sin(press*Math.PI); c.scale(bs, bs); c.translate(-50, -by2 - bh/2);
        fcard(c, 50 - bw/2, by2, bw, bh, ba, bh/2, GRN, 0); sTx(c, "SKAPA REEL  ›", 50, by2 + 5.5, ba, {size:3, weight:700, color:"#fff", align:"c", sp:.14}); c.restore();
        var rp = k3(t, FL.TAPF, FL.TAPF + .7); if(rp > 0 && rp < 1){ c.save(); c.globalAlpha = big*(1 - rp)*.45; c.strokeStyle = GRN; c.lineWidth = .35; rr(c, 50 - bw/2 - rp*4, by - rp*4, bw + rp*8, bh + rp*8, bh/2 + rp*4); c.stroke(); c.restore() }
        var cm = ioC(k3(t, 2.35, FL.TAPF - .1));
        cursor(c, lerp(80, 56, cm), lerp(by + 26, by + 6, cm), rev(t, 2.3, .3)*(1 - k3(t, FL.TAPF + .35, FL.TAPF + .7)), press*(1 - k3(t, FL.TAPF + .2, FL.TAPF + .45)));
      }
      /* hämtar kontorets mallar och bostadens uppgifter */
      var rows = [["Hämtar kontorets mallar", FL.TAPF + .5, FL.TAPF + 1.7], ["Hämtar bostadens uppgifter", FL.TAPF + 1.2, FL.TAPF + 2.4]];
      rows.forEach(function(r, k){
        var ra = rev(t, r[1], .45)*big, ry = ty + 2 + k*10.5 + (1 - oQ(k3(t, r[1], r[1] + .6)))*2, done = k3(t, r[2], r[2] + .35);
        if(ra <= .02) return;
        sCard(c, x0, ry, cw0 - 12, 8.6, ra, 4.3, "#F4F1EA", 0, "rgba(28,26,25,.1)");
        var icx = x0 + 5.2, icy = ry + 4.3;
        if(done < 1){ c.save(); c.globalAlpha = ra*(1 - done); c.strokeStyle = "#2f6a3a"; c.lineWidth = .6; c.lineCap = "round"; c.beginPath(); var ang = t*5; c.arc(icx, icy, 1.9, ang, ang + 4.2); c.stroke(); c.restore() }
        if(done > 0){ c.save(); c.globalAlpha = ra*done; c.fillStyle = "#2f6a3a"; c.beginPath(); c.arc(icx, icy, 2.2*oBack(done), 0, 7); c.fill(); c.restore(); A8.chk(c, icx, icy + .1, 1.7, done, "#fff", .5) }
        sTx(c, r[0], x0 + 10.4, ry + 5.4, ra, {size:2.9, weight:600, color:INK});
      });
    }
    if(sm > .02){
      var lv = "LEVERERAD", lw = v3Measure(c, lv, {size:1.9, weight:600, f:"sans", sp:.2}) + 8, px0 = cx0 + cw0 - 5 - lw;
      sCard(c, px0, cyy + 3.6, lw, 5.2, sm, 2.6, "#E3F0E4", 0); dotc(c, px0 + 3, cyy + 6.2, .8, "#2f6a3a", sm); sTx(c, lv, px0 + 5, cyy + 7.5, sm, {size:1.9, weight:600, color:"#2f6a3a", sp:.2});
      v3Text(c, addr, x0 - .4, cyy + 9.2, {size:5.8, color:INK, alpha:sm}); sTx(c, cstr, x0 - .4, cyy + 14.2, sm, {size:2.0, weight:600, color:MUT, sp:.14});
    }
  }
  /* mobilen med Reelen */
  var pin = oQ(k3(t, FL.PH0, FL.PH0 + .9)), pout = ioC(k3(t, FL.PHO, FL.PHO + .6)), pa = rev(t, FL.PH0, .4)*(1 - pout);
  var pcy = Y0 + 25.5, phh = G.is9 ? 94 : Math.min(S.y1 - pcy + 4, 80), pww = phh/2.05, pxx = 50 - pww/2;
  if(pa > .02){
    var py = pcy + (1 - pin)*24 + pout*10, sc2 = phone2(c, pxx, py, pww, phh, pa, (1 - pin)*-.07), rt = Math.max(0, t - FL.RT0);
    reelF(c, sc2.x, sc2.y, sc2.w, sc2.h, rt, pa, sc2.r, ioC(k3(t, FL.FA, FL.FA + .7)), ioC(k3(t, FL.FC, FL.FC + .6)), ioC(k3(t, FL.FD, FL.FD + .7)), RPHF, FL.CUTS, FL.SWT);
    A8.reelUI(c, sc2.x, sc2.y, sc2.w, sc2.h, pa, rev(rt, .3, .5));
  }
  logoEnd(c, G, t, FL.LOGO, [["För", 0], ["mäklare", 0], ["som", 0], ["vill", 0], ["mer.", 1]], "url");
}
function schedFlow(H){
  H.click(FL.TAPF, .4);
  H.soft("swish", FL.PH0 + .1, .1, .95, 1200);
}
/* variant 1b: öppnar med en iPhone-notis, kort så att man snabbt fattar */
function adFlowNotis(c, G, t){
  var H = G.H, S = SG(G), tf = t - FL.NOF;
  if(t >= FL.NOF - .3) adFlow(c, G, Math.max(0, tf));
  var ia = 1 - k3(t, FL.NOF - .3, FL.NOF);
  if(ia <= .01) return;
  c.save(); c.globalAlpha = ia;
  v3Fill(c, 0, 0, 100, H, "#070606");
  v3Photo(c, "rs_dining", 0, 0, 100, H, {scale:lerp(1.08, 1.14, k3(t, 0, 3)), pos:V3_POS.rs_dining, alpha:ioC(k3(t, 0, .3))});
  v3Fill(c, 0, 0, 100, H, "#0c0a0a", .55);
  v3Grad(c, 0, 0, 100, H*.4, [[0, "rgba(8,7,7,.5)"], [1, "rgba(8,7,7,0)"]]);
  var ca = rev(t, .05, .4), ty = S.y0 + 8;
  v3Text(c, "Lördag 24 oktober", 50, ty, {size:3.3, weight:500, f:"sans", color:"#fff", align:"c", alpha:.85*ca});
  v3Text(c, "9:41", 50, ty + 15, {size:15, weight:300, f:"sans", color:"#fff", align:"c", alpha:.95*ca});
  var nin = oQ(k3(t, .25, .8)), tap = k3(t, 1.75, 1.93), pr = 1 - .035*Math.sin(tap*Math.PI), nw = 88, nx = 6, nh = 21.5, ny = lerp(-26, S.y0 + 31, nin);
  if(nin > .01){
    c.save(); c.translate(50, ny + nh/2); c.scale(pr, pr); c.translate(-50, -ny - nh/2);
    c.save(); c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 9; c.shadowOffsetY = 1.4; c.fillStyle = "rgba(244,243,240,.92)"; rr(c, nx, ny, nw, nh, 5); c.fill(); c.restore();
    c.fillStyle = "#101010"; rr(c, nx + 3.6, ny + 3.6, 8.4, 8.4, 2.2); c.fill();
    v3Mark(c, nx + 5.6, ny + 5.5, 4.6, "#fff", C3.dotL, {reveal:1, dot:1, alpha:1});
    v3Text(c, "VIEWLY", nx + 14.6, ny + 6.4, {size:2.6, weight:600, f:"sans", sp:.12, color:"#1c1c1e"});
    v3Text(c, "nu", nx + nw - 4, ny + 6.4, {size:2.5, weight:400, f:"sans", color:"#6b6b70", align:"r"});
    v3Text(c, "Dina foton är klara", nx + 14.6, ny + 11.8, {size:3.3, weight:600, f:"sans", color:"#1c1c1e"});
    v3Text(c, "Storgatan 15, Helsingborg · 25 bilder levererade", nx + 14.6, ny + 16.4, {size:2.75, weight:400, f:"sans", color:"#3a3a3e"});
    c.restore();
    var cu = ioC(k3(t, 1.0, 1.7)), cxx = lerp(80, 56, cu), cyy = lerp(ny + nh + 26, ny + nh*.55, cu);
    cursor(c, cxx, cyy, rev(t, .9, .25)*(1 - k3(t, 2.0, 2.3)), tap*(1 - k3(t, 1.93, 2.15)));
  }
  c.restore();
}
function schedFlowNotis(H){
  var Hs = {s:function(n, t, v, r){ H.s(n, t + FL.NOF, v, r) }, soft:function(n, t, v, r, f){ H.soft(n, t + FL.NOF, v, r, f) }, click:function(t, v){ H.click(t + FL.NOF, v) }};
  H.tone(1174.7, .32, .07, .8); H.tone(1568, .46, .06, 1.0);
  H.click(1.75, .35);
  schedFlow(Hs);
}


/* =====================================================================
   V2: välj mall först, sedan hämtas bostadens uppgifter och mallen fyller i dem själv (Reel Studio och Content Studio)
   ===================================================================== */
var PRESS = function(t, t0){ return k3(t, t0 - .12, t0 + .04)*(1 - k3(t, t0 + .04, t0 + .32)) };
function deliveredCard(c, t, Y0, btn, tap, fadeA){
  var addr = v3t("a8.re.addr"), city = v3t("a8.re.city"), F = v3t("a8.re.facts").split(" · "), cstr = (city + "  ·  " + F[0] + "  ·  " + F[1]).toUpperCase();
  var cw0 = 80, cx0 = 10, ch0 = 70, cy0 = Y0 + 19, x0 = cx0 + 6, cin = Math.min(1, rev(t, .05, .5))*(1 - k3(t, tap + .15, tap + .6)), enter = oQ(k3(t, 0, .9));
  if(cin <= .02) return;
  var cyd = cy0 + (1 - enter)*14 + Math.sin(t*1.2)*.4, lbl = {size:2.6, weight:600, f:"sans", sp:.14};
  fcard(c, cx0, cyd, cw0, ch0, cin, 3.2, "#fff", 0);
  var chipW = v3Measure(c, "LEVERERAD", {size:2.1, weight:600, f:"sans", sp:.2}) + 10, sy0 = cyd + 5;
  sCard(c, x0, sy0, chipW, 5.6, cin, 2.8, "#E3F0E4", 0); dotc(c, x0 + 3.4, sy0 + 2.8, .95, "#2f6a3a", cin); sTx(c, "LEVERERAD", x0 + 6, sy0 + 3.8, cin, {size:2.1, weight:600, color:"#2f6a3a", sp:.2});
  var nb = "25 BILDER", nbw = v3Measure(c, nb, {size:2.1, weight:700, f:"sans", sp:.2}) + 9, nba = cin*rev(t, .5, .4);
  sCard(c, cx0 + cw0 - 6 - nbw, sy0, nbw, 5.6, nba, 2.8, "#1C1C1E", 0); sTx(c, nb, cx0 + cw0 - 6 - nbw/2, sy0 + 3.8, nba, {size:2.1, weight:700, color:"#fff", align:"c", sp:.2});
  v3Text(c, addr, x0, cyd + 22, {size:8.4, color:INK, alpha:cin*rev(t, .25, .45), p:oQ(k3(t, .25, .85))});
  sTx(c, cstr, x0, cyd + 27.8, cin*rev(t, .45, .4), lbl);
  var tw = (cw0 - 12 - 3*2)/4, th = tw*.8, ty = cyd + 32.5, i;
  for(i = 0; i < 4; i++){
    var t0 = .35 + i*.1, ta = rev(t, t0, .3)*cin, tx = x0 + i*(tw + 2), sc = lerp(.9, 1, oQ(k3(t, t0, t0 + .45))), ty2 = ty + (1 - oQ(k3(t, t0, t0 + .45)))*1.6;
    c.save(); c.translate(tx + tw/2, ty2 + th/2); c.scale(sc, sc);
    sCard(c, -tw/2 - .4, -th/2 - .4, tw + .8, th + .8, ta, 1.4, "#fff", 2);
    if(i < 3) sPh(c, THF[i], -tw/2, -th/2, tw, th, ta, 1.2, 1.14); else { sCard(c, -tw/2, -th/2, tw, th, ta, 1.2, "#1C1C1E", 0); v3Text(c, "+22", 0, 1.8, {size:5.2, color:"#fff", align:"c", alpha:ta}) }
    c.restore();
  }
  var bw = 56, bh = 8.6, by = ty + th + 6.5, bin = oQ(k3(t, tap - 1.2, tap - .45)), ba = rev(t, tap - 1.2, .45)*cin, press = PRESS(t, tap);
  if(ba > .02){
    c.save(); var by2 = by + (1 - bin)*4; c.translate(50, by2 + bh/2); var bs = 1 - .05*press; c.scale(bs, bs); c.translate(-50, -by2 - bh/2);
    fcard(c, 50 - bw/2, by2, bw, bh, ba, bh/2, GRN, 0); sTx(c, btn, 50, by2 + 5.5, ba, {size:3, weight:700, color:"#fff", align:"c", sp:.14}); c.restore();
    var rp = k3(t, tap, tap + .7); if(rp > 0 && rp < 1){ c.save(); c.globalAlpha = cin*(1 - rp)*.45; c.strokeStyle = GRN; c.lineWidth = .35; rr(c, 50 - bw/2 - rp*4, by - rp*4, bw + rp*8, bh + rp*8, bh/2 + rp*4); c.stroke(); c.restore() }
    var cm = ioC(k3(t, tap - .85, tap - .08));
    cursor(c, lerp(80, 56, cm), lerp(by + 26, by + 6, cm), rev(t, tap - .95, .25)*(1 - k3(t, tap + .35, tap + .7)), press);
  }
}
/* tre mallar att välja bland; markören väljer en och de andra tonas ned */
function tilesStage(c, t, Y0, t0, tClick, sel, photos, labels, fadeOut){
  var TW = 25, TH = TW*1.25, gap = 2.5, bx0 = 50 - (3*TW + 2*gap)/2, by = Y0 + 21.5, a0 = (1 - k3(t, fadeOut, fadeOut + .4)), i;
  if(rev(t, t0, .1) <= 0 || a0 <= .02) return;
  var dim = k3(t, tClick + .08, tClick + .5);
  for(i = 0; i < 3; i++){
    var ta = rev(t, t0 + .1 + i*.14, .45)*a0, rise = (1 - oQ(k3(t, t0 + .1 + i*.14, t0 + .75 + i*.14)))*5, x = bx0 + i*(TW + gap), y = by + rise, on = i === sel, sc = on ? 1 + .035*k3(t, tClick, tClick + .35) : 1 - .02*dim;
    c.save(); c.translate(x + TW/2, y + TH/2); c.scale(sc, sc); c.translate(-x - TW/2, -y - TH/2);
    SHIM = t; drawPost(c, i, x, y, TW, TH, photos[i], ta, 1, 1, 1);
    if(!on && dim > 0){ c.save(); c.globalAlpha = ta*dim*.55; c.fillStyle = "#080707"; rr(c, x, y, TW, TH, 1.5); c.fill(); c.restore() }
    if(on && t >= tClick){ var sp = oBack(k3(t, tClick, tClick + .35)); c.save(); c.globalAlpha = ta; c.strokeStyle = "#8fd6a3"; c.lineWidth = .55; rr(c, x - .9, y - .9, TW + 1.8, TH + 1.8, 2); c.stroke(); c.fillStyle = "#2f6a3a"; c.beginPath(); c.arc(x + TW - 2.6, y + 2.8, 2.3*Math.max(.01, sp), 0, 7); c.fill(); c.restore(); if(sp > .6) sTx(c, "✓", x + TW - 2.6, y + 3.8, ta, {size:2.6, weight:700, color:"#fff", align:"c"}) }
    sTx(c, labels[i], x + TW/2, y + TH + 6.5, ta, {size:2.7, weight:700, color:"#fff", align:"c", sp:.14});
    c.restore();
  }
  var sx = bx0 + sel*(TW + gap) + TW*.55, sy = by + TH*.55, cm = ioC(k3(t, tClick - 1.0, tClick - .1));
  cursor(c, lerp(86, sx, cm), lerp(by + TH + 22, sy, cm), rev(t, tClick - 1.1, .3)*a0*(1 - k3(t, tClick + .5, tClick + .9)), PRESS(t, tClick));
}
function statusPill(c, t, Y0, t0, tDone, label, doneLabel, fadeOut){
  var a = rev(t, t0, .45)*(1 - k3(t, fadeOut, fadeOut + .4)); if(a <= .02) return;
  var done = k3(t, tDone, tDone + .35), txt = done > .5 ? doneLabel : label, w = 66, x = 50 - w/2, y = Y0 + 15.8 + (1 - oQ(k3(t, t0, t0 + .6)))*2;
  fcard(c, x, y, w, 7.4, a, 3.7, "#fff", 0);
  var icx = x + 5.2, icy = y + 3.7;
  if(done < 1){ c.save(); c.globalAlpha = a*(1 - done); c.strokeStyle = "#2f6a3a"; c.lineWidth = .6; c.lineCap = "round"; c.beginPath(); c.arc(icx, icy, 1.9, t*5, t*5 + 4.2); c.stroke(); c.restore() }
  if(done > 0){ c.save(); c.globalAlpha = a*done; c.fillStyle = "#2f6a3a"; c.beginPath(); c.arc(icx, icy, 2.3*oBack(done), 0, 7); c.fill(); c.restore(); A8.chk(c, icx, icy + .1, 1.7, done, "#fff", .5) }
  sTx(c, txt, x + 10.4, y + 4.8, a, {size:2.9, weight:600, color:INK});
}
function heads(c, t, Y0, list){
  var hs = 6.6, hy1 = Y0 + 6, hy2 = Y0 + 13.4;
  list.forEach(function(h){
    if(!h[1]){ kline(c, h[0].map(function(w, k){ return [w, k >= h[0].length - 1 ? 1 : 0] }), Y0 + 9.2, 5.1, t, h[2], h[3]); return }
    var w1 = h[0].map(function(w){ return [w, 0] }), w2 = h[1].map(function(w){ return [w, 1] });
    kline(c, w1, hy1, hs, t, h[2], h[3]); kline(c, w2, hy2, hs, t, h[2] + .25, h[3]);
  });
}
/* ---- Reel Studio, välj mall först ---- */
var R2 = {TAP:1.9, TL0:2.55, TCL:4.85, PH0:6.05, RT0:6.75, CUTS:[0, 2.0, 4.0, 6.0, 7.8], FA:8.75, FC:9.55, FD:10.25, PHO:16.65, LOGO:99, DUR:21.75};
var RPH2 = ["rs_chair", "rs_dining", "rs_kitchen", "bedroom", "rs_floor"];
function adReel2(c, G, t){ TSTYLE = "card"; try { adReel2i(c, G, t, R2, 0) } finally { TSTYLE = "ed" } }
function adReel2i(c, G, t, R2, yoff){
  var S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy + yoff;
  bgLight(c, G, t);
  heads(c, t, Y0, [[["Bilderna", "är", "redan"], ["levererade."], .15, R2.TAP - .3], [["Välj", "en"], ["mall."], R2.TL0 + .1, R2.TCL + .4], [["Mallen", "fyller", "sig", "själv."], null, R2.RT0 + 2.7, R2.RT0 + 5.0], [["En", "Reel", "i", "ditt"], ["eget", "varumärke."], R2.RT0 + 5.3, R2.RT0 + 7.4], [["Fotografering", "och", "verktyg"], ["i", "ett", "enda", "flöde."], R2.RT0 + 7.7, R2.PHO - .2]]);
  deliveredCard(c, t, Y0, "SKAPA REEL  ›", R2.TAP);
  tilesStage(c, t, Y0, R2.TL0, R2.TCL, 1, ["rs_dining", "rs_chair", "rs_kitchen"], ["Kommande", "Till salu", "Såld"], R2.PH0 - .1);
  statusPill(c, t, Y0, R2.RT0 + .1, R2.RT0 + 1.4, "Hämtar bostadens uppgifter", "Uppgifterna är hämtade", R2.RT0 + 2.0);
  var pin = oQ(k3(t, R2.PH0, R2.PH0 + .9)), pout = ioC(k3(t, R2.PHO, R2.PHO + .9)), pa = rev(t, R2.PH0, .4)*(1 - pout);
  var pcy = Y0 + 25.5, phh = G.is9 ? 94 - yoff : Math.min(S.y1 - pcy + 4, 80), pww = phh/2.05, pxx = 50 - pww/2;
  if(pa > .02){
    var py = pcy + (1 - pin)*24 - pout*5, sc = phone2(c, pxx, py, pww, phh, pa, (1 - pin)*-.07), rt = Math.max(0, t - R2.RT0);
    reelF(c, sc.x, sc.y, sc.w, sc.h, rt, pa, sc.r, ioC(k3(t, R2.FA, R2.FA + .7)), ioC(k3(t, R2.FC, R2.FC + .6)), ioC(k3(t, R2.FD, R2.FD + .7)), RPH2, R2.CUTS, [99, 99], 1);
    A8.reelUI(c, sc.x, sc.y, sc.w, sc.h, pa, rev(rt, .3, .5));
  }
  logoEnd(c, G, t, R2.LOGO, [["För", 0], ["mäklare", 0], ["som", 0], ["vill", 0], ["mer.", 1]], "url");
}
function schedReel2(H){ H.click(R2.TAP, .4); H.click(R2.TCL, .4) }
/* ---- Content Studio, välj bild och mall ---- */
var C2 = {TAP:1.9, G0:2.55, GCL:4.65, TL0:5.85, TCL:7.95, PO0:9.35, FA:11.35, FC:12.15, FD:12.85, END:16.75, LOGO:99, DUR:21.85};
var GRIDK = ["rs_chair", "rs_dining", "rs_kitchen", "bedroom", "rs_floor", "rs_statue"];
function adContent2(c, G, t){
  var S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy, i;
  bgLight(c, G, t);
  heads(c, t, Y0, [[["Bilderna", "är", "redan"], ["levererade."], .15, C2.TAP - .3], [["Välj", "en"], ["bild."], C2.G0 + .1, C2.GCL + .9], [["Välj", "en"], ["mall."], C2.TL0 + .1, C2.TCL + .4], [["Mallen", "fyller", "sig", "själv."], null, C2.PO0 + 2.7, C2.PO0 + 4.6], [["Fotografering", "och", "verktyg"], ["i", "ett", "enda", "flöde."], C2.PO0 + 4.9, C2.END]]);
  deliveredCard(c, t, Y0, "SKAPA INLÄGG  ›", C2.TAP);
  /* steg 1: välj en bild */
  var ga = rev(t, C2.G0, .45)*(1 - k3(t, C2.GCL + .75, C2.GCL + 1.1));
  if(ga > .02){
    var cw = 80, cx = 10, ch = 56, cy = Y0 + 19 + (1 - oQ(k3(t, C2.G0, C2.G0 + .8)))*10, x0 = cx + 6, tw = (cw - 12 - 2*2.4)/3, th = tw*.7, sel = t >= C2.GCL;
    fcard(c, cx, cy, cw, ch, ga, 3.2, "#fff", 0);
    sTx(c, "VÄLJ EN BILD", x0, cy + 7, ga, {size:2.4, weight:700, sp:.2}); sTx(c, (sel ? 1 : 0) + " / 1 VALD", cx + cw - 6, cy + 7, ga, {size:2.4, weight:600, color:MUT, align:"r", sp:.16});
    var pos = function(n){ return [x0 + (n % 3)*(tw + 2.4), cy + 11.5 + Math.floor(n/3)*(th + 2.4)] };
    for(i = 0; i < 6; i++){
      var q = pos(i), a2 = rev(t, C2.G0 + .15 + i*.07, .35)*ga;
      sCard(c, q[0] - .4, q[1] - .4, tw + .8, th + .8, a2, 1.4, "#fff", 2); sPh(c, GRIDK[i], q[0], q[1], tw, th, a2, 1.2, 1.14);
      if(i === 1 && sel){ var sp = oBack(k3(t, C2.GCL, C2.GCL + .3)); c.save(); c.globalAlpha = ga; c.strokeStyle = GRN; c.lineWidth = .6; rr(c, q[0] - .9, q[1] - .9, tw + 1.8, th + 1.8, 1.6); c.stroke(); c.fillStyle = GRN; c.beginPath(); c.arc(q[0] + 3.4, q[1] + 3.4, 2.4*Math.max(.01, sp), 0, 7); c.fill(); c.restore(); if(sp > .6) sTx(c, "✓", q[0] + 3.4, q[1] + 4.4, ga, {size:2.6, weight:700, color:"#fff", align:"c"}) }
    }
    var tp = pos(1), mv = ioC(k3(t, C2.GCL - 1.0, C2.GCL - .1));
    cursor(c, lerp(80, tp[0] + tw*.55, mv), lerp(cy + ch + 4, tp[1] + th*.5, mv), ga*rev(t, C2.GCL - 1.1, .3)*(1 - k3(t, C2.GCL + .5, C2.GCL + .9)), PRESS(t, C2.GCL));
  }
  /* steg 2: välj en mall på den valda bilden */
  tilesStage(c, t, Y0, C2.TL0, C2.TCL, 1, ["rs_dining", "rs_dining", "rs_dining"], ["Kommande", "Till salu", "Såld"], C2.PO0 - .1);
  statusPill(c, t, Y0, C2.PO0 + .2, C2.PO0 + 1.5, "Hämtar bostadens uppgifter", "Uppgifterna är hämtade", C2.PO0 + 2.1);
  var pin = oQ(k3(t, C2.PO0 - .2, C2.PO0 + .8)), pa = rev(t, C2.PO0 - .2, .4)*(1 - ioC(k3(t, C2.END, C2.END + .9)));
  if(pa > .02){
    var pw = G.is9 ? 50 : 46, ph = pw*1.25, px = 50 - pw/2, py = Y0 + 26 + (1 - pin)*12 - ioC(k3(t, C2.END, C2.END + .9))*5;
    SHIM = t; drawPost(c, 1, px, py, pw, ph, "rs_dining", pa, ioC(k3(t, C2.FA, C2.FA + .7)), ioC(k3(t, C2.FC, C2.FC + .6)), ioC(k3(t, C2.FD, C2.FD + .7)));
  }
  logoEnd(c, G, t, C2.LOGO, [["Content", 0], ["Studio.", 1]], "url");
}
function schedContent2(H){ H.click(C2.TAP, .4); H.click(C2.GCL, .35); H.click(C2.TCL, .4) }


/* låsskärmens bakgrundsbild: ett jordklot som stiger upp ur mörkret, med blå atmosfär och stadsljus */
function lockWallpaper(c, G, t){
  var H = G.H;
  v3Fill(c, 0, 0, 100, H, "#050a0d");
  v3Photo(c, "lockMag", 0, 0, 100, H, {scale:lerp(1.02, 1.08, k3(t, 0, 4)), pos:V3_POS.lockMag});
  v3Fill(c, 0, 0, 100, H, "#04080b", .22);
  v3Grad(c, 0, 0, 100, H*.34, [[0, "rgba(4,8,11,.62)"], [1, "rgba(4,8,11,0)"]]);
  v3Grad(c, 0, H*.62, 100, H*.38 + 1, [[0, "rgba(4,8,11,0)"], [1, "rgba(4,8,11,.55)"]]);
}
var NT = {d:"Lördag 24 oktober", t:"9:41"};
function notisScene(c, G, t, NOF){
  var H = G.H, S = SG(G), ia = 1 - k3(t, NOF - .3, NOF);
  if(ia <= .01) return;
  c.save(); c.globalAlpha = ia;
  lockWallpaper(c, G, t);
  var ca = rev(t, .05, .4), ty = S.y0 + 8;
  v3Text(c, "Lördag 24 oktober", 50, ty, {size:3.3, weight:500, f:"sans", color:"#fff", align:"c", alpha:.85*ca});
  v3Text(c, "9:41", 50, ty + 15, {size:15, weight:300, f:"sans", color:"#fff", align:"c", alpha:.95*ca});
  var nin = oQ(k3(t, .25, .8)), tap = k3(t, 1.75, 1.93), pr = 1 - .035*Math.sin(tap*Math.PI), nw = 88, nx = 6, nh = 21.5, ny = lerp(-26, S.y0 + 31, nin);
  if(nin > .01){
    c.save(); c.translate(50, ny + nh/2); c.scale(pr, pr); c.translate(-50, -ny - nh/2);
    c.save(); c.shadowColor = "rgba(0,0,0,.4)"; c.shadowBlur = 9; c.shadowOffsetY = 1.4; c.fillStyle = "rgba(244,243,240,.92)"; rr(c, nx, ny, nw, nh, 5); c.fill(); c.restore();
    c.fillStyle = "#101010"; rr(c, nx + 3.6, ny + 3.6, 8.4, 8.4, 2.2); c.fill();
    v3Mark(c, nx + 5.6, ny + 5.5, 4.6, "#fff", C3.dotL, {reveal:1, dot:1, alpha:1});
    v3Text(c, "VIEWLY", nx + 14.6, ny + 6.4, {size:2.6, weight:600, f:"sans", sp:.12, color:"#1c1c1e"});
    v3Text(c, "nu", nx + nw - 4, ny + 6.4, {size:2.5, weight:400, f:"sans", color:"#6b6b70", align:"r"});
    v3Text(c, "Dina foton är klara", nx + 14.6, ny + 11.8, {size:3.3, weight:600, f:"sans", color:"#1c1c1e"});
    v3Text(c, "Storgatan 15, Helsingborg · 25 bilder levererade", nx + 14.6, ny + 16.4, {size:2.75, weight:400, f:"sans", color:"#3a3a3e"});
    c.restore();
    var cu = ioC(k3(t, 1.0, 1.7)), cxx = lerp(80, 56, cu), cyy = lerp(ny + nh + 26, ny + nh*.55, cu);
    cursor(c, cxx, cyy, rev(t, .9, .25)*(1 - k3(t, 2.0, 2.3)), tap*(1 - k3(t, 1.93, 2.15)));
  }
  c.restore();
}
function withNotis(fn, NOF){ return function(c, G, t){ if(t >= NOF - .3) fn(c, G, Math.max(0, t - NOF)); notisScene(c, G, t, NOF) } }
function notisSched(sc, NOF){ return function(H){
  var Hs = {s:function(n, t, v, r){ H.s(n, t + NOF, v, r) }, soft:function(n, t, v, r, f){ H.soft(n, t + NOF, v, r, f) }, click:function(t, v){ H.click(t + NOF, v) }, tone:function(f, t, v, d){ H.tone(f, t + NOF, v, d) }};
  H.tone(1174.7, .32, .07, .8); H.tone(1568, .46, .06, 1.0); H.click(1.75, .35); sc(Hs);
} }


/* =====================================================================
   V3: tre hårda bevis (20 sekunder, obegränsat, Hampus) som annonser och statiska bilder
   ===================================================================== */
var HQ = {pull:"…mycket uppskattat av mina kunder.", full:["Snabb och smidig hantering genom hela", "processen, från bokning till leverans av", "färdigt material. Resultatet håller", "genomgående hög kvalitet och har varit", "mycket uppskattat av mina kunder."], name:"Hampus Nilsson", role:"Mäklare · Fastighetsbyrån Landskrona"};
var R3 = {TAP:2.6, TL0:3.4, TCL:5.6, PH0:7.0, RT0:7.7, CUTS:[0, 2.2, 4.4, 6.6, 8.8], FA:10.4, FC:11.2, FD:11.9, PHO:20.9, STOP:20.0, LC:21.7, LOGO:99};
function stopwatch(c, G, t, T0, STOP){
  var S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, y = S.y0 + oy + .5, v = Math.max(0, Math.min(t - T0, STOP)), done = t - T0 >= STOP, m = Math.floor(v/60), sec = Math.floor(v % 60), txt = m + ":" + (sec < 10 ? "0" : "") + sec;
  var a = rev(t, T0, .4), w = done ? 34 : 24;
  c.save(); c.globalAlpha = a; c.fillStyle = done ? "#2f6a3a" : "rgba(244,243,240,.94)"; rr(c, 50 - w/2, y, w, 7.4, 3.7); c.fill(); c.restore();
  if(!done){ c.save(); c.globalAlpha = a*(.5 + .5*Math.sin(t*6)); c.fillStyle = "#c0392b"; c.beginPath(); c.arc(50 - w/2 + 4.4, y + 3.7, .9, 0, 7); c.fill(); c.restore() }
  v3Text(c, done ? txt + "  ·  KLAR" : txt, 50 + (done ? 0 : 2), y + 5.1, {size:3.3, weight:700, f:"sans", sp:.1, color:done ? "#fff" : "#1c1c1e", align:"c", alpha:a});
  var bw = 70, by = y + 9.4; c.save(); c.globalAlpha = a*.35; c.fillStyle = "#fff"; c.fillRect(50 - bw/2, by, bw, .5); c.globalAlpha = a; c.fillStyle = done ? "#8fd6a3" : "#fff"; c.fillRect(50 - bw/2, by, bw*Math.min(1, v/STOP), .5); c.restore();
}
function adT20(c, G, t){
  TSTYLE = "card"; try { adReel2i(c, G, t, R3, 10); stopwatch(c, G, t, 0, R3.STOP) } finally { TSTYLE = "ed" }
}
function schedT20(H){ H.click(R3.TAP, .4); H.click(R3.TCL, .4) }

/* så många du vill */
var M2 = {TILES:16, T0:3.4, TS:7.0, END:14.6};
var MKEYS = ["rs_dining", "rs_chair", "rs_kitchen", "bedroom", "rs_floor", "rs_statue"];
function adMany(c, G, t){
  var H = G.H, S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy, i;
  TSTYLE = "ed"; bgLight(c, G, t);
  kline(c, [["Hur", 0], ["många", 0], ["inlägg", 0]], Y0 + 6, 6.6, t, .2, 2.9);
  kline(c, [["vill", 0], ["du", 0], ["ha?", 1]], Y0 + 13.4, 6.6, t, .45, 2.9);
  kline(c, [["Så", 0], ["många"], ["du", 0], ["vill.", 1]].map(function(w){ return [w[0], w[1] || 0] }), Y0 + 9.2, 5.6, t, 3.3, M2.END - .4);
  var cols = G.is9 ? 4 : 8, gap = G.is9 ? 2.4 : 1.4, gw = G.is9 ? 70 : 84, tw = (gw - gap*(cols - 1))/cols, th = tw*(G.is9 ? 1.1 : 1.25), gx = (100 - gw)/2, gy = Y0 + (G.is9 ? 17 : 16), rows = M2.TILES/cols, last = 0;
  var times = []; for(i = 0; i < M2.TILES; i++) times.push(M2.T0 + (M2.TS - M2.T0)*Math.pow(i/(M2.TILES - 1), .55));
  var fade = 1 - k3(t, M2.END - .5, M2.END);
  for(i = 0; i < M2.TILES; i++){
    var ti = times[i], p = oQ(k3(t, ti, ti + .45)), a = rev(t, ti, .3)*fade;
    if(a <= .02) continue; last = i + 1;
    var x = gx + (i % cols)*(tw + gap), y = gy + Math.floor(i/cols)*(th + gap) + (1 - p)*3;
    SHIM = t; drawPost(c, i % 3, x, y, tw, th, MKEYS[i % MKEYS.length], a, 1, 1, 1);
  }
  /* knappen som trycker i takt, och räknaren */
  var by = gy + rows*th + (rows - 1)*gap + 6, ba = rev(t, M2.T0 - .6, .5)*fade, press = 0;
  for(i = 0; i < M2.TILES; i++){ var d = t - times[i]; if(d > -.05 && d < .14) press = Math.max(press, Math.sin((d + .05)/.19*Math.PI)) }
  if(ba > .02){
    c.save(); c.translate(50, by + 4.3); c.scale(1 - .04*press, 1 - .04*press); c.translate(-50, -by - 4.3);
    fcard(c, 50 - 24, by, 48, 8.6, ba, 4.3, GRN, 0); sTx(c, "SKAPA INLÄGG  ›", 50, by + 5.5, ba, {size:3, weight:700, color:"#fff", align:"c", sp:.14}); c.restore();
    sTx(c, "INLÄGG SKAPADE", 50 - 24, by + 14.6, ba, {size:2.2, weight:700, color:"rgba(255,255,255,.7)", sp:.2});
    v3Text(c, String(last), 50 + 24, by + 15.2, {size:5.4, color:"#fff", align:"r", alpha:ba});
  }
  v3Text(c, "Obegränsat antal inlägg. En leverans.", 50, by + 25, {size:3.4, weight:500, f:"sans", color:"#fff", align:"c", alpha:.85*k3(t, M2.TS + .6, M2.TS + 1.4)*fade});
}
function schedMany(H){ H.click(M2.T0, .35); H.click(M2.T0 + 1.46, .3) }

/* Hampus */
var HM = {END:9.6};
function quoteStars(c, x, y, a, sz){ var i; for(i = 0; i < 5; i++) v3Text(c, "★", x + i*sz*1.15, y, {size:sz, weight:500, f:"sans", color:"#E8C766", alpha:a*rev(k3(a, 0, 1), 0, 1)}) }
function adHampus(c, G, t){
  var H = G.H, S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy;
  bgLight(c, G, t);
  var cy = Y0 + 26;
  kline(c, [["…mycket", 1], ["uppskattat", 0]], cy, 8.2, t, .3, 5.4, {st:.12});
  kline(c, [["av", 0], ["mina", 0], ["kunder.", 1]], cy + 11.5, 8.2, t, .6, 5.4);
  var sa = rev(t, 2.3, .5)*(1 - k3(t, 5.2, 5.6));
  if(sa > .02){ var sw = 5*3.5*1.15; quoteStars(c, 50 - sw/2 + 1.5, cy + 24, sa, 3.5);
    v3Text(c, HQ.name, 50, cy + 33, {size:4.6, weight:700, f:"sans", color:"#fff", align:"c", alpha:sa});
    v3Text(c, HQ.role, 50, cy + 39.5, {size:3, weight:500, f:"sans", sp:.04, color:"#fff", align:"c", alpha:.8*sa}) }
  var ca = rev(t, 5.7, .6)*(1 - k3(t, HM.END - .5, HM.END));
  if(ca > .02){
    var cw = 82, ch = 60, cx = 9, cyy = Y0 + 22;
    fcard(c, cx, cyy, cw, ch, ca, 3.2, "#fff", 0);
    quoteStars(c, cx + 6, cyy + 9.5, ca, 3.2);
    HQ.full.forEach(function(l, k){ v3Text(c, (k === 0 ? "“" : "") + l + (k === 4 ? "”" : ""), cx + 6, cyy + 20 + k*6.0, {size:3.5, color:INK, alpha:ca*rev(t, 5.9 + k*.25, .4)}) });
    sTx(c, HQ.name.toUpperCase(), cx + 6, cyy + 53, ca*rev(t, 7.0, .4), {size:2.4, weight:700, sp:.16});
    sTx(c, HQ.role.toUpperCase(), cx + 6, cyy + 57.4, ca*rev(t, 7.0, .4), {size:1.9, weight:600, color:MUT, sp:.14});
  }
}

/* Ett objekt. Sen bestämmer du. */
var OB = {END:8.8};
function adOffer(c, G, t){
  var H = G.H, S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy;
  bgLight(c, G, t);
  var cy = Y0 + 30;
  kline(c, [["Ett", 0], ["objekt.", 0]], cy, 10, t, .3, OB.END - .6);
  kline(c, [["Sen", 0], ["bestämmer", 1], ["du.", 1]], cy + 13.5, 10, t, 1.3, OB.END - .6);
  var la = rev(t, 2.6, .6)*(1 - k3(t, OB.END - .5, OB.END));
  v3Text(c, "Från 995 kr  ·  Ingen bindning", 50, cy + 28, {size:3.9, weight:500, f:"sans", sp:.04, color:"#fff", align:"c", alpha:.9*la});
  var qa = rev(t, 4.4, .6)*(1 - k3(t, OB.END - .5, OB.END));
  if(qa > .02){
    var cw = 82, ch = 24, cx = 9, cyy = cy + 37;
    fcard(c, cx, cyy, cw, ch, qa, 3.2, "#fff", 0);
    quoteStars(c, cx + 5.5, cyy + 8, qa, 2.8);
    v3Text(c, "“" + HQ.pull.slice(1).replace(".", "") + "”", cx + 5.5, cyy + 16.2, {size:4.4, italic:true, color:INK, alpha:qa});
    sTx(c, (HQ.name + " · " + HQ.role).toUpperCase().replace("MÄKLARE · ", ""), cx + 5.5, cyy + 21, qa, {size:1.8, weight:600, color:MUT, sp:.1});
  }
}

/* statiska bilder med knapp */
function stBtn(c, G, y, a){
  var w = 56, h = 8.8; c.save(); c.globalAlpha = a; c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 6; c.fillStyle = "#fff"; rr(c, 50 - w/2, y, w, h, h/2); c.fill(); c.restore();
  sTx(c, "Boka fotografering  ›", 50, y + 5.6, a, {size:3.1, weight:700, color:INK, align:"c", sp:.04});
}
function stLogo(c, G, y){
  var mh = 6, mw = mh*858.6/756.3, fs = 2.9, ww = v3Measure(c, "VIEWLY", {size:fs, weight:500, f:"sans", sp:.3}) - .3*fs, tot = mw + 2 + ww, lx = 50 - tot/2;
  v3Mark(c, lx, y - mh/2, mh, "#fff", C3.dotL, {reveal:1, dot:1, alpha:.95}); v3Text(c, "VIEWLY", lx + mw + 2, y + fs*.34, {size:fs, weight:500, f:"sans", sp:.3, color:"#fff", alpha:.95});
}
function stBase(c, G){ bgLight(c, G, 5); return G.H }
function st20(c, G, t){
  var H = stBase(c, G), cy = H*.43;
  v3Text(c, "20", 50, cy + 18, {size:G.is9 ? 78 : 66, color:"#fff", align:"c"});
  kline(c, [["sekunder", 0], ["från", 0], ["leverans", 0]], cy + 30, 5.6, 9, 0, 99);
  kline(c, [["till", 0], ["färdig", 0], ["Reel.", 1]], cy + 38, 5.6, 9, 0, 99);
  stBtn(c, G, cy + 54, 1); stLogo(c, G, H - G.bot - 4);
}
function stHampus(c, G, t){
  var H = stBase(c, G), cy = H*.3;
  v3Text(c, "“", 50, cy + 4, {size:22, italic:true, color:"#d6dccb", align:"c", alpha:.9});
  kline(c, [["…mycket", 1], ["uppskattat", 0]], cy + 20, 8, 9, 0, 99);
  kline(c, [["av", 0], ["mina", 0], ["kunder.", 1]], cy + 31, 8, 9, 0, 99);
  quoteStars(c, 50 - 5*3.5*1.15/2 + 1.5, cy + 45, 1, 3.5);
  v3Text(c, HQ.name, 50, cy + 54, {size:4.4, weight:700, f:"sans", color:"#fff", align:"c"});
  v3Text(c, HQ.role, 50, cy + 60, {size:2.9, weight:500, f:"sans", sp:.04, color:"#fff", align:"c", alpha:.8});
  stBtn(c, G, cy + 70, 1); stLogo(c, G, H - G.bot - 4);
}
function stOffer(c, G, t){
  var H = stBase(c, G), cy = H*.36;
  kline(c, [["Ett", 0], ["objekt.", 0]], cy + 8, 10, 9, 0, 99);
  kline(c, [["Sen", 0], ["bestämmer", 1], ["du.", 1]], cy + 21.5, 10, 9, 0, 99);
  v3Text(c, "Från 995 kr  ·  Ingen bindning", 50, cy + 36, {size:3.9, weight:500, f:"sans", sp:.04, color:"#fff", align:"c", alpha:.9});
  stBtn(c, G, cy + 46, 1); stLogo(c, G, H - G.bot - 4);
}


/* =====================================================================
   V4: nytt koncept. Viewly är fotograf och marknadsavdelning i ett: "Du bokar. Resten är redan gjort."
   ===================================================================== */
var EF = {C0:2.7, TC:5.0, DONE:7.35, OUT:9.5, FIN:10.3, L:12.6};
var EFROWS = ["Annonstext", "Planritning", "Bilder i alla format", "Mallar i kontorets grafik", "Inlägg · Kommer snart", "Inlägg · Till salu", "Inlägg · Visning", "Inlägg · Såld"];
function efterCard(c, t, Y0, tc, done, fadeOut, enterT){
  var cw = 82, cx = 9, rh = 6.3, ch = 14 + EFROWS.length*rh + 3.5, enter = oQ(k3(t, enterT, enterT + .9)), a = rev(t, enterT, .5)*(1 - k3(t, fadeOut, fadeOut + .6));
  if(a <= .02) return;
  var cy = Y0 + 19 + (1 - enter)*12 - k3(t, fadeOut, fadeOut + .6)*4, x0 = cx + 6, n = 0, i;
  fcard(c, cx, cy, cw, ch, a, 3.2, "#fff", 0);
  for(i = 0; i < EFROWS.length; i++) if(t >= tc + i*.28 + .12) n++;
  var dn = k3(t, done, done + .4), cw1 = v3Measure(c, "ATT GÖRA", {size:2.1, weight:700, f:"sans", sp:.2}) + 9;
  sCard(c, x0, cy + 5, cw1, 5.6, a*(1 - dn), 2.8, "#1C1C1E", 0); sTx(c, "ATT GÖRA", x0 + cw1/2, cy + 8.8, a*(1 - dn), {size:2.1, weight:700, color:"#fff", align:"c", sp:.2});
  var cw2 = v3Measure(c, "REDAN GJORT", {size:2.1, weight:700, f:"sans", sp:.2}) + 13;
  sCard(c, x0, cy + 5, cw2, 5.6, a*dn, 2.8, "#E3F0E4", 0); dotc(c, x0 + 3.4, cy + 7.8, .95, "#2f6a3a", a*dn); sTx(c, "REDAN GJORT", x0 + 6.2, cy + 8.8, a*dn, {size:2.1, weight:700, color:"#2f6a3a", sp:.2});
  sTx(c, n + " / " + EFROWS.length, cx + cw - 6, cy + 8.8, a, {size:2.6, weight:700, color:dn > .5 ? "#2f6a3a" : MUT, align:"r", sp:.14});
  for(i = 0; i < EFROWS.length; i++){
    var ry = cy + 14 + i*rh, ra = rev(t, enterT + .2 + i*.09, .35)*a, tk = tc + i*.28, ck = oBack(k3(t, tk + .1, tk + .4));
    if(i > 0){ c.save(); c.globalAlpha = ra*.55; c.fillStyle = "rgba(28,28,30,.1)"; c.fillRect(x0, ry, cw - 12, .25); c.restore() }
    var cxx = x0 + 2.3, cyy = ry + rh/2;
    c.save(); c.globalAlpha = ra; c.strokeStyle = "#9a948d"; c.lineWidth = .35; c.beginPath(); c.arc(cxx, cyy, 1.9, 0, 7); c.stroke(); c.restore();
    if(ck > .01){ c.save(); c.globalAlpha = ra; c.fillStyle = "#2f6a3a"; c.beginPath(); c.arc(cxx, cyy, 2.05*Math.max(.01, Math.min(1.12, ck)), 0, 7); c.fill(); c.restore(); A8.chk(c, cxx, cyy + .1, 1.5, k3(t, tk + .1, tk + .4), "#fff", .45) }
    sTx(c, EFROWS[i], x0 + 8, cyy + 1.2, ra, {size:3.3, weight:500, color:INK});
  }
}
function adEfter(c, G, t){
  var S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy;
  bgLight(c, G, t);
  heads(c, t, Y0, [[["Efter", "fotograferingen"], ["börjar", "jobbet."], .25, EF.TC - .3], [["Allt", "det", "där."], ["Redan", "gjort."], EF.DONE + .1, EF.OUT]]);
  efterCard(c, t, Y0, EF.TC, EF.DONE, EF.OUT, EF.C0);
  kline(c, [["Du", 0], ["bokar.", 0]], Y0 + 28, 9, t, EF.FIN, EF.L - .5);
  kline(c, [["Resten", 0], ["är", 0], ["redan", 1], ["gjort.", 1]], Y0 + 40, 9, t, EF.FIN + .9, EF.L - .5);
}
function schedEfter(H){ var i; for(i = 0; i < EFROWS.length; i++) H.click(EF.TC + i*.28 + .12, .13); H.tone(1174.7, EF.DONE, .05, .9); H.tone(1568, EF.DONE + .12, .04, 1.0) }

/* fredag 16:40: notis, kampanjen skapas, fyra inlägg */
var FR = {TAP:1.9, PS:2.5, PD:4.1, G0:4.5, OUT:9.3, FIN:9.9, L:12.4};
var FRK = [["Kommer snart", 0, "rs_chair"], ["Till salu", 1, "rs_dining"], ["Visning", 0, "rs_kitchen"], ["Såld", 2, "rs_floor"]];
function adFredag(c, G, t){
  var S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy, i;
  bgLight(c, G, t);
  heads(c, t, Y0, [[["Bilderna", "är", "redan"], ["levererade."], .15, FR.TAP - .3], [["Hela", "kampanjen", "är", "klar."], null, FR.PD + .1, FR.OUT - .1]]);
  deliveredCard(c, t, Y0, "SKAPA KAMPANJ  ›", FR.TAP);
  statusPill(c, t, Y0, FR.PS, FR.PD, "Skapar kampanjen", "Kampanjen är klar", FR.OUT - .4);
  var tw = G.is9 ? 24 : 20, th = tw*1.25, gap = 3, gx = 50 - tw - gap/2, gy = Y0 + 30, fo = 1 - k3(t, FR.OUT, FR.OUT + .5);
  for(i = 0; i < 4; i++){
    var t0 = FR.G0 + i*.22, p = oQ(k3(t, t0, t0 + .6)), a = rev(t, t0, .4)*fo; if(a <= .02) continue;
    var x = gx + (i % 2)*(tw + gap), y = gy + Math.floor(i/2)*(th + 9) + (1 - p)*4;
    SHIM = t; drawPost(c, FRK[i][1], x, y, tw, th, FRK[i][2], a, 1, 1, 1);
    sTx(c, FRK[i][0].toUpperCase(), x + tw/2, y + th + 4.6, a, {size:2.2, weight:700, color:"#fff", align:"c", sp:.2});
  }
  kline(c, [["Hinn", 0], ["med", 0]], Y0 + 28, 9, t, FR.FIN, FR.L - .5);
  kline(c, [["fredagen.", 1]], Y0 + 40, 9, t, FR.FIN + .8, FR.L - .5);
}
function schedFredag(H){ H.click(FR.TAP, .4); H.tone(1174.7, FR.PD, .05, .9); H.tone(1568, FR.PD + .12, .04, 1.0) }

/* första bilden: tre riktiga Viewly-foton, en rad per bild */
var FO = {B:[0, 3.7, 7.4], L:10.9};
function adForsta(c, G, t){
  var S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, H = G.H, Yb = S.y1 - 10, keys = ["house", "terrace", "porch"], i;
  v3Fill(c, 0, 0, 100, H, "#070606");
  for(i = 0; i < 3; i++){
    var a = i === 0 ? ioC(k3(t, 0, .5)) : ioC(k3(t, FO.B[i] - .3, FO.B[i] + .6));
    if(a > .01) v3Photo(c, keys[i], 0, 0, 100, H, {scale:lerp(1.04, 1.13, k3(t, FO.B[i] - .3, FO.B[i] + 4.2)), pos:V3_POS[keys[i]], alpha:a});
  }
  v3Grad(c, 0, H*.46, 100, H*.54 + 1, [[0, "rgba(6,5,5,0)"], [1, "rgba(6,5,5,.82)"]]);
  v3Grad(c, 0, 0, 100, H*.2, [[0, "rgba(6,5,5,.45)"], [1, "rgba(6,5,5,0)"]]);
  v3Frame(c, 4, 4, 92, H - 8, "#fff", .3, oQ(k3(t, .2, 1.8)), .5);
  var o = function(n){ return k3(t, FO.B[n] + 3.3, FO.B[n] + 3.7) };
  kline(c, [["Första", 0], ["bilden", 0]], Yb - 10, 9.4, t, .5, FO.B[1] + .1);
  kline(c, [["avgör.", 1]], Yb + 3, 9.4, t, 1.1, FO.B[1] + .1);
  kline(c, [["Allt", 0], ["efter", 0], ["den", 0]], Yb - 10, 8.2, t, FO.B[1] + .7, FO.B[2] + .1);
  kline(c, [["är", 0], ["redan", 1], ["gjort.", 1]], Yb + 3, 8.2, t, FO.B[1] + 1.2, FO.B[2] + .1);
  kline(c, [["Du", 0], ["bokar.", 1]], Yb - 3, 10.4, t, FO.B[2] + .7, FO.L - .5);
}
function stEfter(c, G, t){
  var H = bgLightH(c, G), cy = H*.4;
  kline(c, [["Du", 0], ["bokar.", 0]], cy, 11, 9, 0, 99);
  kline(c, [["Resten", 0], ["är", 0], ["redan", 1], ["gjort.", 1]], cy + 15, 8, 9, 0, 99);
  stBtn(c, G, cy + 32, 1); stLogo(c, G, H - G.bot - 4);
}
function bgLightH(c, G){ bgLight(c, G, 5); return G.H }
function stForsta(c, G, t){
  var S = SG(G), H = G.H;
  v3Fill(c, 0, 0, 100, H, "#070606"); v3Photo(c, "house", 0, 0, 100, H, {scale:1.08, pos:V3_POS.house});
  v3Grad(c, 0, H*.4, 100, H*.6 + 1, [[0, "rgba(6,5,5,0)"], [1, "rgba(6,5,5,.88)"]]); v3Frame(c, 4, 4, 92, H - 8, "#fff", .3, 1, .5);
  kline(c, [["Första", 0], ["bilden", 0]], S.y1 - 40, 9.4, 9, 0, 99); kline(c, [["avgör.", 1]], S.y1 - 27, 9.4, 9, 0, 99);
  stBtn(c, G, S.y1 - 17, 1); stLogo(c, G, H - G.bot - 4);
}


/* =====================================================================
   V5, sida 19: "Mindre jobb. Mer varumärke." Fotograf och marknadsavdelning i ett.
   ===================================================================== */
window.V3_ADS11 = [];
var TX11 = {
  "a11.office":["HAVSVIK", "Kontorets namn i mallarna"], "a11.officesub":["MÄKLARHUS", "Kontorets undertext"], "a11.agent":["Anna Lindqvist", "Mäklarens namn"], "a11.role":["FASTIGHETSMÄKLARE", "Mäklarens titel"], "a11.soon":["Släpps vecka 12", "Mall Kommande, raden under adressen"],
  "a11.rt1":["Från foto till", "D · Reel, titel rad 1"], "a11.rt2":["färdig Reel.", "D · Reel, titel rad 2"], "a11.pt1":["Från foto till", "E · Inlägg, titel rad 1"], "a11.pt2":["färdigt inlägg.", "E · Inlägg, titel rad 2"],
  "a11.end1":["Fotografering och verktyg", "D och E · slutrubrik, rad 1"], "a11.end2":["i ett enda flöde.", "D och E · slutrubrik, rad 2"],
  "a11.date":["Torsdag 22 oktober", "Mobilens låsskärm, datum"], "a11.time":["9:41", "Mobilens låsskärm, klocka"], "a11.n.t":["Dina foton är klara", "Notisen, rubrik"], "a11.n.b":["Storgatan 15, Helsingborg · 25 bilder levererade", "Notisen, text"],
  "a11.btnR":["SKAPA REEL  ›", "Knappen i leveransen (Reel)"], "a11.btnP":["SKAPA INLÄGG  ›", "Knappen i leveransen (inlägg)"], "a11.tpl.h":["Välj en mall", "Mallskärmen, rubrik"], "a11.tpl.s":["KONTORETS MALLAR", "Mallskärmen, liten rad"], "a11.tpl.b":["ANVÄND MALLEN  ›", "Mallskärmen, knapp"],
  "a11.img.h":["Välj en bild", "Bildskärmen, rubrik"], "a11.img.b":["FORTSÄTT  ›", "Bildskärmen, knapp"], "a11.f.h1":["Hämtar bostadens", "Uppgiftsskärmen, rad 1"], "a11.f.h2":["uppgifter.", "Uppgiftsskärmen, rad 2"], "a11.f.d1":["Uppgifterna", "Uppgiftsskärmen klar, rad 1"], "a11.f.d2":["är hämtade.", "Uppgiftsskärmen klar, rad 2"],
  "a11.b.h1":["Fotograferingen", "A · bild 1, rad 1"], "a11.b.h2":["är gjord.", "A · bild 1, rad 2"], "a11.b.l1":["Resten gör sig själv.", "A · rubrik medan brädet fylls"], "a11.b.l2":["Allt klart.", "A · rubrik när allt är klart"], "a11.b.f1":["Mindre jobb.", "A · slutrad 1"], "a11.b.f2":["Mer varumärke.", "A · slutrad 2"], "a11.b.sub":["Fotograf och marknadsavdelning i ett.", "A · raden under slutrubriken"],
  "a11.p.h1":["Bilderna är redan", "B · rubrik 1, rad 1"], "a11.p.h2":["levererade.", "B · rubrik 1, rad 2"], "a11.p.l1":["Kampanjen är klar.", "B · rubrik 2"], "a11.p.m1":["Ditt varumärke,", "B · rubrik 3, rad 1"], "a11.p.m2":["på varje inlägg.", "B · rubrik 3, rad 2"], "a11.p.f1":["Hinn med fredagen.", "B · slutrad 1"], "a11.p.f2":["Bygg varumärket.", "B · slutrad 2"],
  "a11.e.h1":["Efter fotograferingen", "C · rubrik 1, rad 1"], "a11.e.h2":["börjar jobbet.", "C · rubrik 1, rad 2"], "a11.e.d1":["Allt det där.", "C · rubrik 2, rad 1"], "a11.e.d2":["Redan gjort.", "C · rubrik 2, rad 2"], "a11.e.f1":["Mindre jobb.", "C · slutrad 1"], "a11.e.f2":["Mer varumärke.", "C · slutrad 2"],
  "a11.e.r1":["Annonstext", "C · rad 1, rubrik"], "a11.e.s1":["Skriven utifrån bostadens uppgifter", "C · rad 1, text"], "a11.e.r2":["Planritning", "C · rad 2, rubrik"], "a11.e.s2":["Ritad och färdig", "C · rad 2, text"], "a11.e.r3":["Bilder i alla format", "C · rad 3, rubrik"], "a11.e.s3":["4:5 · 9:16 · 1:1 · 16:9 · A4", "C · rad 3, text"],
  "a11.e.r4":["Kampanjen", "C · rad 4, rubrik"], "a11.e.s4":["Kommer snart, Till salu, Visning, Såld", "C · rad 4, text"], "a11.e.r5":["Kontorets mallar", "C · rad 5, rubrik"], "a11.e.s5":["I era färger, med ert märke", "C · rad 5, text"], "a11.e.r6":["Ditt varumärke", "C · rad 6, rubrik"], "a11.e.s6":["På varje bild, varje gång", "C · rad 6, text"]
};
Object.keys(TX11).forEach(function(k){ V3_TXD[k] = TX11[k][0] });
var S6 = function(k){ return String(v3t(k)).split(" ").filter(Boolean) };
var W6 = function(k, nAcc){ var ws = S6(k); return ws.map(function(w, i){ return [w, i >= ws.length - (nAcc || 0) ? 1 : 0] }) };
function ptsLen(pts){ var i, L = 0; for(i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L }
function polyP(c, pts, p){
  if(p <= 0) return; var tot = ptsLen(pts)*Math.min(1, p), i, d; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for(i = 1; i < pts.length; i++){ d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if(tot >= d){ c.lineTo(pts[i][0], pts[i][1]); tot -= d } else { var q = tot/d; c.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0])*q, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1])*q); break } }
  c.stroke();
}
function chkDot(c, x, y, t, t0, r){
  var p = k3(t, t0, t0 + .35); if(p <= 0) return;
  c.save(); c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 2; c.fillStyle = "#2f6a3a"; c.beginPath(); c.arc(x, y, r*Math.max(.01, Math.min(1.15, oBack(p))), 0, 7); c.fill(); c.restore();
  A8.chk(c, x, y + .1, r*.72, p, "#fff", .5);
}

/* A: ett foto blir hela marknadsavdelningen */
var BD = {HERO:2.0, HERO1:3.1, TX:3.5, PL:3.9, P0:4.3, FM:5.6, CK:6.5, HL:7.5, OUT:8.8, FIN:9.6, L:12.9};
function boardG(G){ var S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, s = G.is9 ? .84 : .92, Y0 = S.y0 + oy; return {S:S, Y0:Y0, s:s, by:Y0 + 12.5, H:G.H} }
function adBoard(c, G, t){
  var g = boardG(G), s = g.s, by = g.by, Y0 = g.Y0, H = g.H, S = g.S, i;
  var p = ioC(k3(t, BD.HERO, BD.HERO1)), ex = ioC(k3(t, BD.OUT, BD.OUT + .7)), al = 1 - ex;
  var gX = function(l){ return 50 + (l - 50)*s }, gY = function(l){ return by + l*s };
  v3Fill(c, 0, 0, 100, H, "#070606");
  if(p > .01){ c.save(); c.globalAlpha = p; bgLight(c, G, t); c.restore() }
  c.save(); c.globalAlpha = al;
  var hx = lerp(0, gX(8), p), hy = lerp(0, gY(0), p), hw = lerp(100, 55.2*s, p), hh = lerp(H, 42.4*s, p), hr = lerp(0, 1.8*s, p);
  if(p > .2){ c.save(); c.globalAlpha = al*p; c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 12; c.shadowOffsetY = 2; c.fillStyle = "#000"; rr(c, hx, hy, hw, hh, hr); c.fill(); c.restore() }
  c.save(); rr(c, hx, hy, hw, hh, hr); c.clip();
  v3Photo(c, "house", hx, hy, hw, hh, {scale:lerp(1.04, 1.1, k3(t, 0, 4)), pos:V3_POS.house, alpha:(t < .4 ? ioC(k3(t, 0, .4)) : 1)*al});
  if(p < 1) v3Grad(c, hx, hy + hh*.4, hw, hh*.6 + 1, [[0, "rgba(6,5,5,0)"], [1, "rgba(6,5,5," + (.86*(1 - p)).toFixed(2) + ")"]]);
  c.restore();
  if(p < 1){ v3Frame(c, 4, 4, 92, H - 8, "#fff", .3*(1 - p), oQ(k3(t, .2, 1.8)), .5);
    var Yb = S.y1 - 12;
    c.save(); c.globalAlpha = al; kline(c, W6("a11.b.h1", 0), Yb - 9, 8.6, t, .5, BD.HERO + .1); kline(c, W6("a11.b.h2", 1), Yb + 4, 8.6, t, 1.0, BD.HERO + .1); c.restore() }
  if(p > .6){
    var tp = rev(t, BD.HERO1 - .2, .4)*al;
    c.save(); c.translate(50, by); c.scale(s, s); c.translate(-50, 0);
    var cap = function(txt, x, y, a){ var w = v3Measure(c, txt, {size:1.7, weight:700, f:"sans", sp:.16}) + 4; c.save(); c.globalAlpha = a; c.fillStyle = "rgba(8,7,7,.62)"; rr(c, x, y, w, 3.8, 1.9); c.fill(); c.restore(); sTx(c, txt, x + 2, y + 2.6, a, {size:1.7, weight:700, color:"#fff", sp:.16}) };
    cap("25 BILDER · LEVERERADE", 10.4, 2.4, tp);
    var tile = function(t0, x, y, w, h, label){ var a = rev(t, t0, .4)*al, r = (1 - oQ(k3(t, t0, t0 + .7)))*5; if(a <= .02) return null; fcard(c, x, y + r, w, h, a, 2, "#ECE8E4", 0); if(label) sTx(c, label, x + 2.4, y + r + 5.2, a, {size:1.7, weight:700, sp:.16, color:MUT}); return {a:a, y:y + r} };
    var T1 = tile(BD.TX, 65.6, 0, 26.4, 20, "ANNONSTEXT");
    if(T1){ var str = "Storgatan 15", n = Math.floor(str.length*k3(t, BD.TX + .3, BD.TX + 1.2)), a1 = T1.a;
      v3Text(c, str.slice(0, n), 68, T1.y + 11.2, {size:4.4, color:INK, alpha:a1});
      for(i = 0; i < 3; i++){ var bp = k3(t, BD.TX + 1.1 + i*.25, BD.TX + 1.7 + i*.25); c.save(); c.globalAlpha = a1; c.fillStyle = "rgba(28,28,30,.2)"; rr(c, 68, T1.y + 13.4 + i*1.9, (21.6 - (i === 2 ? 8 : 0))*bp, .8, .4); c.fill(); c.restore() }
      if(Math.floor(t*2.2) % 2 === 0 && t < BD.TX + 3.4){ c.save(); c.globalAlpha = a1; c.fillStyle = "#2f6a3a"; c.fillRect(68 + v3Measure(c, str.slice(0, n), {size:4.4}) + .5, T1.y + 7.4, .5, 4.4); c.restore() } }
    var T2 = tile(BD.PL, 65.6, 22.4, 26.4, 20, "PLANRITNING");
    if(T2){ var X0 = 68.4, Y1 = T2.y + 8.4, W = 21, Hh = 9.4, pa2 = T2.a, d0 = BD.PL + .3;
      c.save(); c.globalAlpha = pa2; c.strokeStyle = INK; c.lineWidth = .38; c.lineCap = "round"; c.lineJoin = "round";
      polyP(c, [[X0, Y1], [X0 + W, Y1], [X0 + W, Y1 + Hh], [X0, Y1 + Hh], [X0, Y1]], k3(t, d0, d0 + 1.0));
      polyP(c, [[X0 + W*.42, Y1], [X0 + W*.42, Y1 + Hh*.6]], k3(t, d0 + .8, d0 + 1.2));
      polyP(c, [[X0 + W*.42, Y1 + Hh*.6], [X0 + W, Y1 + Hh*.6]], k3(t, d0 + 1.0, d0 + 1.5));
      polyP(c, [[X0 + W*.72, Y1 + Hh*.6], [X0 + W*.72, Y1 + Hh]], k3(t, d0 + 1.3, d0 + 1.7));
      c.restore() }
    var PK = [[0, "rs_dining", "KOMMER SNART"], [1, "rs_chair", "TILL SALU"], [2, "rs_floor", "SÅLD"]];
    for(i = 0; i < 3; i++){ var t0 = BD.P0 + i*.38, a = rev(t, t0, .4)*al, rs = (1 - oQ(k3(t, t0, t0 + .8)))*6; if(a <= .02) continue;
      SHIM = t; drawPost(c, PK[i][0], 8 + i*28.8, 44.8 + rs, 26.4, 30, PK[i][1], a, 1, 1, 1); cap(PK[i][2], 9.6 + i*28.8, 44.8 + rs + 24.4, a) }
    var FMT = ["4:5", "9:16", "1:1", "16:9", "A4"];
    for(i = 0; i < 5; i++){ var t1 = BD.FM + i*.13, a = rev(t, t1, .3)*al, sc = lerp(.85, 1, oBack(k3(t, t1, t1 + .4))), cx = 8 + i*17.4 + 7.4; if(a <= .02) continue;
      c.save(); c.translate(cx, 81.2); c.scale(sc, sc); fcard(c, -7.4, -4, 14.8, 8, a, 4, "#ECE8E4", 0); sTx(c, FMT[i], 0, 1, a, {size:2.7, weight:700, color:INK, align:"c", sp:.08}); c.restore() }
    var cks = [[60.2, 4.4], [88.4, 3.8], [88.4, 26.2], [30.8, 48.4], [59.6, 48.4], [88.4, 48.4], [91.6, 78.2]];
    if(al > .02) cks.forEach(function(q, k){ c.save(); c.globalAlpha = al; chkDot(c, q[0], q[1], t, BD.CK + k*.13, 2.5); c.restore() });
    c.restore();
  }
  c.restore();
  heads(c, t, Y0, [[S6("a11.b.l1"), null, BD.HERO1 - .1, BD.HL - .1], [S6("a11.b.l2"), null, BD.HL + .1, BD.OUT - .2]]);
  kline(c, W6("a11.b.f1", 0), Y0 + 30, 11, t, BD.FIN, BD.L - .5);
  kline(c, W6("a11.b.f2", 1), Y0 + 43.5, 11, t, BD.FIN + .7, BD.L - .5);
  var sa = rev(t, BD.FIN + 1.9, .6)*(1 - k3(t, BD.L - .5, BD.L));
  v3Text(c, String(v3t("a11.b.sub")), 50, Y0 + 54, {size:3.5, weight:500, f:"sans", sp:.03, color:"#fff", align:"c", alpha:.85*sa});
}
function schedBoard(H){ var i; H.click(BD.TX, .1); H.click(BD.PL, .1); for(i = 0; i < 3; i++) H.click(BD.P0 + i*.38, .1); for(i = 0; i < 7; i++) H.click(BD.CK + i*.13, .1); H.tone(1174.7, BD.HL, .05, .9); H.tone(1568, BD.HL + .12, .04, 1.0) }

/* B: fredag 16:40, notis, kampanjen och profilen som fylls */
var PF = {TAP:1.9, PS:2.5, PD:4.0, C0:4.8, G0:5.4, OUT:9.5, FIN:10.1, L:13.0};
var PFK = [["KOMMER SNART", 0, "rs_chair"], ["TILL SALU", 1, "rs_dining"], ["VISNING", 0, "rs_kitchen"], ["SÅLD", 2, "rs_floor"], ["TILL SALU", 1, "bedroom"], ["KOMMER SNART", 0, "rs_dining"]];
function adProfil(c, G, t){
  var S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy, s = G.is9 ? .84 : .9, i;
  bgLight(c, G, t);
  heads(c, t, Y0, [[S6("a11.p.h1"), S6("a11.p.h2"), .15, PF.TAP - .3], [S6("a11.p.l1"), null, PF.PD + .1, PF.C0 - .1], [S6("a11.p.m1"), S6("a11.p.m2"), PF.C0 + .3, PF.OUT - .1]]);
  deliveredCard(c, t, Y0, "SKAPA KAMPANJ  ›", PF.TAP);
  statusPill(c, t, Y0, PF.PS, PF.PD, "Skapar kampanjen", "Kampanjen är klar", PF.C0 - .4);
  var ci = oQ(k3(t, PF.C0, PF.C0 + .9)), a = rev(t, PF.C0, .5)*(1 - k3(t, PF.OUT, PF.OUT + .6));
  if(a > .02){
    c.save(); c.translate(50, Y0 + 18.5 + (1 - ci)*12); c.scale(s, s); c.translate(-50, 0);
    fcard(c, 9, 0, 82, 79, a, 3.2, "#fff", 0);
    c.save(); c.globalAlpha = a; c.fillStyle = GRN; c.beginPath(); c.arc(19, 9.6, 5.4, 0, 7); c.fill(); c.restore();
    v3Text(c, "H", 19, 12.2, {size:7, color:"#fff", align:"c", alpha:a});
    v3Text(c, String(v3t("a11.agent")), 27.6, 8.4, {size:4.4, color:INK, alpha:a});
    sTx(c, String(v3t("a11.role")) + " · " + String(v3t("a8.re.city")).toUpperCase(), 27.6, 13, a, {size:1.9, weight:600, color:MUT, sp:.12});
    fcard(c, 74, 5.2, 14, 6, a, 3, GRN, 0); sTx(c, "FÖLJ", 81, 9.2, a, {size:2.3, weight:700, color:"#fff", align:"c", sp:.16});
    c.save(); c.globalAlpha = a*.5; c.fillStyle = "rgba(28,28,30,.12)"; c.fillRect(13, 17.4, 74, .25); c.restore();
    for(i = 0; i < 6; i++){
      var x = 14 + (i % 3)*25.6, y = 20.6 + Math.floor(i/3)*28.6, t0 = PF.G0 + i*.4, pa = rev(t, t0, .35), pp = oQ(k3(t, t0, t0 + .7));
      c.save(); c.globalAlpha = a; c.fillStyle = "#E1DCD4"; rr(c, x, y, 24, 26.4, 1.4); c.fill(); c.restore();
      if(pa > .02){ c.save(); var sc = lerp(1.12, 1, pp); c.translate(x + 12, y + 13.2); c.scale(sc, sc); c.translate(-x - 12, -y - 13.2); SHIM = t; drawPost(c, PFK[i][1], x, y, 24, 26.4, PFK[i][2], pa*a, 1, 1, 1);
        var cw = v3Measure(c, PFK[i][0], {size:1.5, weight:700, f:"sans", sp:.14}) + 3.6; c.globalAlpha = pa*a; c.fillStyle = "rgba(8,7,7,.62)"; rr(c, x + 1.4, y + 21.4, cw, 3.4, 1.7); c.fill(); sTx(c, PFK[i][0], x + 3.2, y + 23.7, pa*a, {size:1.5, weight:700, color:"#fff", sp:.14}); c.restore() }
    }
    c.restore();
  }
  kline(c, W6("a11.p.f1", 0), Y0 + 30, 9.6, t, PF.FIN, PF.L - .5);
  kline(c, W6("a11.p.f2", 1), Y0 + 43, 9.6, t, PF.FIN + .8, PF.L - .5);
}
function schedProfil(H){ var i; H.click(PF.TAP, .4); H.tone(1174.7, PF.PD, .05, .9); H.tone(1568, PF.PD + .12, .04, 1.0); for(i = 0; i < 6; i++) H.click(PF.G0 + i*.4, .09) }

/* C: efteråt, med varumärke */
var E2 = {C0:2.4, R0:3.2, ST:.62, OUT:8.9, FIN:9.7, L:13.0};
var E2R = [1, 2, 3, 4, 5, 6];
var E2DONE = E2.R0 + 5*E2.ST + .6;
function adEfter2(c, G, t){
  var S = SG(G), oy = G.is9 ? 0 : (S.h - 83.6)/2, Y0 = S.y0 + oy, s = G.is9 ? .85 : .92, i;
  bgLight(c, G, t);
  heads(c, t, Y0, [[S6("a11.e.h1"), S6("a11.e.h2"), .25, E2DONE - .1], [S6("a11.e.d1"), S6("a11.e.d2"), E2DONE + .1, E2.OUT]]);
  var ci = oQ(k3(t, E2.C0, E2.C0 + .9)), a = rev(t, E2.C0, .5)*(1 - k3(t, E2.OUT, E2.OUT + .6));
  if(a > .02){
    c.save(); c.translate(50, Y0 + 17.5 + (1 - ci)*12 - k3(t, E2.OUT, E2.OUT + .6)*4); c.scale(s, s); c.translate(-50, 0);
    var cw = 82, ch = 78.5, dn = k3(t, E2DONE, E2DONE + .4);
    fcard(c, 9, 0, cw, ch, a, 3.2, "#fff", 0);
    c.save(); c.globalAlpha = a; rr(c, 14, 3.6, 11.5, 10.4, 1.4); c.clip(); v3Photo(c, "house", 14, 3.6, 11.5, 10.4, {pos:V3_POS.house}); c.restore();
    v3Text(c, "Storgatan 15", 28, 9.2, {size:5, color:INK, alpha:a});
    sTx(c, "HELSINGBORG · 25 BILDER", 28, 13, a, {size:1.9, weight:600, color:MUT, sp:.14});
    var w1 = v3Measure(c, "ATT GÖRA", {size:2, weight:700, f:"sans", sp:.2}) + 8, w2 = v3Measure(c, "REDAN GJORT", {size:2, weight:700, f:"sans", sp:.2}) + 12;
    sCard(c, 91 - 5 - w1, 5, w1, 5.6, a*(1 - dn), 2.8, "#1C1C1E", 0); sTx(c, "ATT GÖRA", 91 - 5 - w1/2, 8.8, a*(1 - dn), {size:2, weight:700, color:"#fff", align:"c", sp:.2});
    sCard(c, 91 - 5 - w2, 5, w2, 5.6, a*dn, 2.8, "#E3F0E4", 0); dotc(c, 91 - 5 - w2 + 3.4, 7.8, .95, "#2f6a3a", a*dn); sTx(c, "REDAN GJORT", 91 - 5 - w2 + 6.2, 8.8, a*dn, {size:2, weight:700, color:"#2f6a3a", sp:.2});
    c.save(); c.globalAlpha = a*.5; c.fillStyle = "rgba(28,28,30,.12)"; c.fillRect(13, 17, 74, .25); c.restore();
    for(i = 0; i < E2R.length; i++){
      var ry = 18.4 + i*9.6, ra = rev(t, E2.C0 + .25 + i*.08, .35)*a, tp = E2.R0 + i*E2.ST, ck = k3(t, tp + .5, tp + .85), cxx = 20, cyy = ry + 4.8;
      var act = (t >= tp && t < tp + .55) ? 1 : 0;
      if(act){ c.save(); c.globalAlpha = ra*.9; c.fillStyle = "rgba(47,106,58,.07)"; rr(c, 12, ry + .6, 76, 8.4, 1.6); c.fill(); c.restore() }
      if(i > 0){ c.save(); c.globalAlpha = ra*.5; c.fillStyle = "rgba(28,28,30,.1)"; c.fillRect(13, ry, 74, .25); c.restore() }
      c.save(); c.globalAlpha = ra; c.strokeStyle = "#9a948d"; c.lineWidth = .35; c.beginPath(); c.arc(cxx, cyy, 2.5, 0, 7); c.stroke(); c.restore();
      if(act){ c.save(); c.globalAlpha = ra; c.strokeStyle = "#2f6a3a"; c.lineWidth = .6; c.lineCap = "round"; c.beginPath(); c.arc(cxx, cyy, 2.5, t*7, t*7 + 4.2); c.stroke(); c.restore() }
      if(ck > 0){ c.save(); c.globalAlpha = ra; c.fillStyle = "#2f6a3a"; c.beginPath(); c.arc(cxx, cyy, 2.7*Math.max(.01, Math.min(1.12, oBack(ck))), 0, 7); c.fill(); c.restore(); c.save(); c.globalAlpha = ra; A8.chk(c, cxx, cyy + .1, 1.9, ck, "#fff", .5); c.restore() }
      sTx(c, String(v3t("a11.e.r" + E2R[i])), 26.4, ry + 4.1, ra, {size:3.5, weight:700, color:INK});
      sTx(c, String(v3t("a11.e.s" + E2R[i])), 26.4, ry + 7.5, ra, {size:2.3, weight:500, color:MUT});
    }
    c.restore();
  }
  kline(c, W6("a11.e.f1", 0), Y0 + 30, 11, t, E2.FIN, E2.L - .5);
  kline(c, W6("a11.e.f2", 1), Y0 + 43.5, 11, t, E2.FIN + .7, E2.L - .5);
}
function schedEfter2(H){ var i; for(i = 0; i < E2R.length; i++) H.click(E2.R0 + i*E2.ST + .5, .13); H.tone(1174.7, E2DONE, .05, .9); H.tone(1568, E2DONE + .12, .04, 1.0) }

/* statiska */
function stBoard(c, G, t){ adBoard(c, G, 8.3); if(G.is9) stLogo(c, G, G.H - G.bot - 4) }
function stProfil(c, G, t){ adProfil(c, G, 8.6); if(G.is9) stLogo(c, G, G.H - G.bot - 4) }
function stTpl(c, G, t){
  TSTYLE = "card";
  try {
    var o = g6(G), H = G.H, i, x, y = o.y2 + 10, w = 29, h = Math.min(w*1.78, H - y - (G.is9 ? 40 : 14));
    v3Fill(c, 0, 0, 100, H, BGG);
    kline(c, W6("a11.office", 0).length ? [["Kontorets", 0], ["tre", 0], ["mallar.", 1]] : [], o.y1 + 4, o.ts, 9, 0, 99);
    var tl = ["tpl.kommande", "tpl.tillsalu", "tpl.sald"];
    for(i = 0; i < 3; i++){
      x = 5.5 + i*(w + 2.5);
      c.save(); c.shadowColor = "rgba(0,0,0,.45)"; c.shadowBlur = 8; c.fillStyle = "#000"; rr(c, x, y, w, h, 2.6); c.fill(); c.restore();
      reelF(c, x, y, w, h, 5, 1, 2.6, 1, 1, 1, RPH2, [0, 2, 4, 6, 8], [99, 99], i);
      sTx(c, String(v3t(tl[i])).toUpperCase(), x + w/2, y + h + 6, 1, {size:2.5, weight:700, color:"#fff", align:"c", sp:.2});
    }
  } finally { TSTYLE = "ed" }
}
function stMindre(c, G, t){
  var H = bgLightH(c, G), cy = H*.38;
  kline(c, W6("a11.b.f1", 0), cy, 12, 9, 0, 99);
  kline(c, W6("a11.b.f2", 1), cy + 14.5, 12, 9, 0, 99);
  v3Text(c, String(v3t("a11.b.sub")), 50, cy + 25, {size:3.5, weight:500, f:"sans", sp:.03, color:"#fff", align:"c", alpha:.85});
  stBtn(c, G, cy + 32, 1); stLogo(c, G, H - G.bot - 4);
}


/* =====================================================================
   V6: telefonen direkt, slät bakgrund (viewly.se mörkgrön), en titel som stoppar scrollen och hela flödet i mobilen
   ===================================================================== */
var BGG = "#22261F";
function g6(G){
  var is9 = G.is9;
  var off = is9 ? 26.4 : 0;
  return {is9:is9, y1:off + 15.5, y2:off + 25, ts:7.4, top:off + 31.5, pw:44.6};
}
function statusBar(c, dark, a){
  var col = dark ? INK : "#fff", i;
  c.save(); c.globalAlpha = a == null ? 1 : a; c.fillStyle = "#000"; rr(c, 34, 2.4, 32, 8.4, 4.2); c.fill();
  sTx(c, "9:41", 12.5, 8.4, 1, {size:3.5, weight:700, color:col});
  c.fillStyle = col; for(i = 0; i < 4; i++){ rr(c, 70 + i*2.2, 7.2 - i*.9, 1.3, 1.4 + i*.9, .4); c.fill() }
  c.strokeStyle = col; c.lineWidth = .35; rr(c, 80.5, 4.6, 8.6, 4.2, 1.2); c.stroke(); c.fillStyle = col; rr(c, 81.3, 5.4, 6.2, 2.6, .7); c.fill(); c.fillRect(89.5, 5.9, .6, 1.6);
  c.restore();
}
function phone6(c, G, t, P0, drawFn){
  var o = g6(G), rise = ioC(k3(t, P0, P0 + 1.0)), ph = o.pw*2.05, py = o.top + (1 - rise)*(G.H - o.top + 6), px = 50 - o.pw/2;
  var sc = phone2(c, px, py, o.pw, ph, 1, 0);
  c.save(); c.strokeStyle = "rgba(255,255,255,.34)"; c.lineWidth = .35; rr(c, px, py, o.pw, ph, o.pw*.15); c.stroke(); c.restore();
  c.save(); rr(c, sc.x, sc.y, sc.w, sc.h, sc.r); c.clip();
  var k = sc.w/100; c.translate(sc.x, sc.y); c.scale(k, k);
  drawFn(c, 100, sc.h/k);
  c.restore();
  return sc;
}
/* fingret: en mjuk cirkel som glider in, trycker och släpper en ring */
function touch6(c, x, y, t, t0){
  var a = rev(t, t0 - .75, .25)*(1 - k3(t, t0 + .3, t0 + .6)); if(a <= .01) return;
  var m = ioC(k3(t, t0 - .75, t0 - .08)), px = lerp(x + 16, x, m), py = lerp(y + 26, y, m), pr = PRESS(t, t0), rp = k3(t, t0, t0 + .55);
  c.save(); c.globalAlpha = a; c.fillStyle = "rgba(255,255,255,.62)"; c.strokeStyle = "rgba(20,20,20,.4)"; c.lineWidth = .5; c.shadowColor = "rgba(0,0,0,.3)"; c.shadowBlur = 3;
  c.beginPath(); c.arc(px, py, 5.2*(1 - .16*pr), 0, 7); c.fill(); c.stroke(); c.restore();
  if(rp > 0 && rp < 1){ c.save(); c.globalAlpha = (1 - rp)*.5; c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = .6; c.beginPath(); c.arc(x, y, 5 + rp*9, 0, 7); c.stroke(); c.restore() }
}
/* flödet: skärmar som glider in från höger, med fingret överst */
function flow6(c, t, W, LH, F){
  var S = F.screens, a = 0, i;
  for(i = 0; i < S.length; i++) if(t >= S[i][0]) a = i;
  var p = a === 0 ? 1 : ioC(k3(t, S[a][0], S[a][0] + .55));
  if(a > 0 && p < 1){
    c.save(); c.translate(-p*26, 0); S[a - 1][1](c, t, W, LH, F); c.restore();
    c.save(); c.globalAlpha = p*.34; c.fillStyle = "#000"; c.fillRect(0, 0, 100, LH); c.restore();
    c.save(); c.translate((1 - p)*100, 0); c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 5; c.fillStyle = "#fff"; c.fillRect(0, 0, 100, LH); c.shadowColor = "transparent"; S[a][1](c, t, W, LH, F); c.restore();
  } else S[a][1](c, t, W, LH, F);
  F.taps.forEach(function(q){ touch6(c, q[1], q[2], t, q[0]) });
}
var APPBG = "#F2EFEA", BTNY = 183;
function scLock(c, t, W, LH, F){
  v3Photo(c, "lockMag", 0, 0, 100, LH, {scale:lerp(1.02, 1.08, k3(t, 0, 6)), pos:V3_POS.lockMag});
  v3Fill(c, 0, 0, 100, LH, "#04080b", .22); v3Grad(c, 0, 0, 100, LH*.3, [[0, "rgba(4,8,11,.62)"], [1, "rgba(4,8,11,0)"]]);
  statusBar(c, false);
  var ca = rev(t, F.ph + .5, .5);
  v3Text(c, String(v3t("a11.date")), 50, 30, {size:4, weight:500, f:"sans", color:"#fff", align:"c", alpha:.88*ca});
  v3Text(c, String(v3t("a11.time")), 50, 52, {size:21, weight:300, f:"sans", color:"#fff", align:"c", alpha:.95*ca});
  var nin = oQ(k3(t, F.nt, F.nt + .6)), tp = k3(t, F.taps[0][0], F.taps[0][0] + .16), pr = 1 - .035*Math.sin(tp*Math.PI), nx = 5, nw = 90, nh = 23, ny = lerp(-26, 76, nin);
  if(nin > .01){
    c.save(); c.translate(50, ny + nh/2); c.scale(pr, pr); c.translate(-50, -ny - nh/2);
    c.save(); c.shadowColor = "rgba(0,0,0,.4)"; c.shadowBlur = 9; c.shadowOffsetY = 1.4; c.fillStyle = "rgba(244,243,240,.93)"; rr(c, nx, ny, nw, nh, 5.4); c.fill(); c.restore();
    c.fillStyle = "#101010"; rr(c, nx + 4, ny + 4, 9, 9, 2.4); c.fill();
    v3Mark(c, nx + 6.1, ny + 6.1, 4.9, "#fff", C3.dotL, {reveal:1, dot:1, alpha:1});
    v3Text(c, "VIEWLY", nx + 16, ny + 7, {size:2.8, weight:600, f:"sans", sp:.12, color:"#1c1c1e"});
    v3Text(c, "nu", nx + nw - 4, ny + 7, {size:2.7, weight:400, f:"sans", color:"#6b6b70", align:"r"});
    v3Text(c, String(v3t("a11.n.t")), nx + 16, ny + 13, {size:3.6, weight:600, f:"sans", color:"#1c1c1e"});
    v3Text(c, String(v3t("a11.n.b")), nx + 16, ny + 18, {size:2.9, weight:400, f:"sans", color:"#3a3a3e"});
    c.restore();
  }
}
function btn6(c, t, y, label, a, on, tap){
  var pr = PRESS(t, tap || -9), bs = 1 - .045*pr; c.save(); c.translate(50, y + 7); c.scale(bs, bs); c.translate(-50, -y - 7);
  fcard(c, 8, y, 84, 14, a, 7, on ? GRN : "#CFCBC3", 0); sTx(c, label, 50, y + 8.8, a, {size:3.5, weight:700, color:on ? "#fff" : "#8d877f", align:"c", sp:.16}); c.restore();
}
function scDeliv(c, t, W, LH, F){
  var t0 = F.deliv, e = function(d){ return rev(t, t0 + d, .45) }, r = function(d){ return (1 - oQ(k3(t, t0 + d, t0 + d + .7)))*4 };
  v3Fill(c, 0, 0, 100, LH, APPBG); statusBar(c, true);
  var a = e(.1), cw = v3Measure(c, "LEVERERAD", {size:2.4, weight:700, f:"sans", sp:.2}) + 11;
  sCard(c, 8, 20 + r(.1), cw, 6.4, a, 3.2, "#E3F0E4", 0); dotc(c, 11.9, 23.2 + r(.1), 1, "#2f6a3a", a); sTx(c, "LEVERERAD", 14.5, 24.5 + r(.1), a, {size:2.4, weight:700, color:"#2f6a3a", sp:.2});
  var nb = "25 BILDER", nbw = v3Measure(c, nb, {size:2.4, weight:700, f:"sans", sp:.2}) + 10;
  sCard(c, 92 - nbw, 20 + r(.15), nbw, 6.4, e(.15), 3.2, "#1C1C1E", 0); sTx(c, nb, 92 - nbw/2, 24.5 + r(.15), e(.15), {size:2.4, weight:700, color:"#fff", align:"c", sp:.2});
  v3Text(c, "Storgatan 15", 8, 44 + r(.2), {size:11.5, color:INK, alpha:e(.2)});
  sTx(c, "HELSINGBORG  ·  3 RUM  ·  74 M²", 8, 52 + r(.3), e(.3), {size:2.7, weight:600, color:MUT, sp:.14});
  var ph = ["rs_dining", "rs_chair", "rs_kitchen", "bedroom", "rs_floor", "rs_statue"], i;
  for(i = 0; i < 6; i++){
    var d = .35 + i*.09, x = 8 + (i % 2)*42.5, y = 60 + Math.floor(i/2)*37 + r(d), ia = e(d);
    sCard(c, x - .4, y - .4, 42 + .8, 34 + .8, ia, 2.4, "#fff", 2);
    sPh(c, ph[i], x, y, 42, 34, ia, 2.1, 1.12);
    if(i === 5){ c.save(); c.globalAlpha = ia*.62; c.fillStyle = "#101010"; rr(c, x, y, 42, 34, 2.1); c.fill(); c.restore(); v3Text(c, "+20", x + 21, y + 21, {size:9, color:"#fff", align:"c", alpha:ia}) }
  }
  btn6(c, t, BTNY, F.btn, e(.8), true, F.taps[F.tapB][0]);
}
function scTpl(c, t, W, LH, F){
  var t0 = F.tpl, e = function(d){ return rev(t, t0 + d, .45) }, i;
  v3Fill(c, 0, 0, 100, LH, APPBG); statusBar(c, true);
  v3Text(c, String(v3t("a11.tpl.h")), 8, 40, {size:11, color:INK, alpha:e(.05)});
  sTx(c, String(v3t("a11.tpl.s")), 8, 48, e(.15), {size:2.7, weight:600, color:MUT, sp:.18});
  var cw = 26.3, ch = 48, gap = 2.55, ky = 56, ts = F.taps[F.tapT][0], dim = k3(t, ts + .08, ts + .5), labels = F.tlabels, keys = F.tkeys;
  for(i = 0; i < 3; i++){
    var d = .2 + i*.12, ta = e(d), rise = (1 - oQ(k3(t, t0 + d, t0 + d + .7)))*5, x = 8 + i*(cw + gap), y = ky + rise, on = i === 1, sc2 = on ? 1 + .035*k3(t, ts, ts + .35) : 1 - .02*dim;
    c.save(); c.translate(x + cw/2, y + ch/2); c.scale(sc2, sc2); c.translate(-x - cw/2, -y - ch/2);
    SHIM = t; drawPost(c, i, x, y, cw, ch, keys[i], ta, 1, 1, 1);
    if(!on && dim > 0){ c.save(); c.globalAlpha = ta*dim*.55; c.fillStyle = APPBG; rr(c, x, y, cw, ch, 1.5); c.fill(); c.restore() }
    if(on && t >= ts){ var sp = oBack(k3(t, ts, ts + .35)); c.save(); c.globalAlpha = ta; c.strokeStyle = "#2f6a3a"; c.lineWidth = .6; rr(c, x - .9, y - .9, cw + 1.8, ch + 1.8, 2); c.stroke(); c.fillStyle = "#2f6a3a"; c.beginPath(); c.arc(x + cw - 3.4, y + 3.4, 2.5*Math.max(.01, sp), 0, 7); c.fill(); c.restore(); A8.chk(c, x + cw - 3.4, y + 3.5, 1.8, sp, "#fff", .5) }
    sTx(c, labels[i], x + cw/2, y + ch + 7, ta, {size:2.9, weight:700, color:INK, align:"c", sp:.12});
    c.restore();
  }
  /* förhandsvisning av vald mall */
  var pa = rev(t, ts + .15, .5);
  if(pa > .02){
    sTx(c, "FÖRHANDSVISNING", 8, 126, pa, {size:2.6, weight:700, color:MUT, sp:.18});
    var pw = 44, ph = 52, px = 50 - pw/2, py = 131 + (1 - oQ(k3(t, ts + .15, ts + .85)))*4;
    SHIM = t; drawPost(c, 1, px, py, pw, ph, keys[1], pa, 1, 1, 1);
  }
  btn6(c, t, BTNY, String(v3t("a11.tpl.b")), e(.5), t >= ts + .1);
}
function scImgs(c, t, W, LH, F){
  var t0 = F.imgs, e = function(d){ return rev(t, t0 + d, .45) }, i, ts = F.taps[F.tapI][0], sel = t >= ts;
  v3Fill(c, 0, 0, 100, LH, APPBG); statusBar(c, true);
  v3Text(c, String(v3t("a11.img.h")), 8, 40, {size:11, color:INK, alpha:e(.05)});
  sTx(c, "STORGATAN 15", 8, 48, e(.15), {size:2.7, weight:600, color:MUT, sp:.18}); sTx(c, (sel ? 1 : 0) + " / 1 VALD", 92, 48, e(.15), {size:2.7, weight:700, color:MUT, align:"r", sp:.16});
  var tw = 26.3, th = 28, g = 2.55, ph = ["rs_chair", "rs_dining", "rs_kitchen", "bedroom", "rs_floor", "rs_statue", "house", "terrace", "porch", "rs_dusk1", "rs_dusk2", "dining"];
  for(i = 0; i < 12; i++){
    var d = .15 + i*.05, x = 8 + (i % 3)*(tw + g), y = 56 + Math.floor(i/3)*(th + g) + (1 - oQ(k3(t, t0 + d, t0 + d + .6)))*4, a = e(d);
    sCard(c, x - .4, y - .4, tw + .8, th + .8, a, 2, "#fff", 2); sPh(c, ph[i], x, y, tw, th, a, 1.8, 1.14);
    if(i === 1 && sel){ var sp = oBack(k3(t, ts, ts + .3)); c.save(); c.globalAlpha = a; c.strokeStyle = GRN; c.lineWidth = .7; rr(c, x - 1, y - 1, tw + 2, th + 2, 2.2); c.stroke(); c.fillStyle = GRN; c.beginPath(); c.arc(x + 3.8, y + 3.8, 2.7*Math.max(.01, sp), 0, 7); c.fill(); c.restore(); A8.chk(c, x + 3.8, y + 3.9, 1.9, sp, "#fff", .5) }
  }
  btn6(c, t, BTNY, String(v3t("a11.img.b")), e(.6), sel);
}
function scFetch(c, t, W, LH, F){
  var t0 = F.fetch, e = function(d){ return rev(t, t0 + d, .45) }, i, rows = [["ADRESS", "Storgatan 15"], ["ORT", "Helsingborg"], ["RUM", "3"], ["YTA", "74 m²"], ["MÄKLARE", String(v3t("a11.agent"))], ["KONTOR", String(v3t("a11.office"))]], dn = k3(t, F.fdone, F.fdone + .4);
  v3Fill(c, 0, 0, 100, LH, APPBG); statusBar(c, true);
  var l1 = String(v3t(dn > .5 ? "a11.f.d1" : "a11.f.h1")), l2 = String(v3t(dn > .5 ? "a11.f.d2" : "a11.f.h2"));
  v3Text(c, l1, 8, 42, {size:10, color:INK, alpha:e(.05)}); v3Text(c, l2, 8, 54, {size:10, italic:true, color:"#4a5a44", alpha:e(.05)});
  for(i = 0; i < 6; i++){
    var d = .35 + i*.12, y = 66 + i*17 + (1 - oQ(k3(t, t0 + d, t0 + d + .6)))*4, a = e(d), tk = F.fdone - 1.5 + i*.28, ck = k3(t, tk, tk + .3), act = (t >= t0 + d && t < tk) ? 1 : 0;
    fcard(c, 8, y, 84, 14, a, 2.8, "#fff", 0);
    if(act){ c.save(); c.globalAlpha = a; c.strokeStyle = "#2f6a3a"; c.lineWidth = .6; c.lineCap = "round"; c.beginPath(); c.arc(17, y + 7, 2.6, t*7, t*7 + 4.2); c.stroke(); c.restore() }
    if(ck > 0){ c.save(); c.globalAlpha = a; c.fillStyle = "#2f6a3a"; c.beginPath(); c.arc(17, y + 7, 2.9*Math.max(.01, Math.min(1.12, oBack(ck))), 0, 7); c.fill(); c.restore(); c.save(); c.globalAlpha = a; A8.chk(c, 17, y + 7.1, 2, ck, "#fff", .5); c.restore() }
    if(!act && ck <= 0){ c.save(); c.globalAlpha = a; c.strokeStyle = "#b4aea6"; c.lineWidth = .35; c.beginPath(); c.arc(17, y + 7, 2.6, 0, 7); c.stroke(); c.restore() }
    sTx(c, rows[i][0], 26, y + 8.1, a, {size:2.6, weight:700, color:MUT, sp:.18});
    v3Text(c, rows[i][1], 88, y + 9.3, {size:5.2, color:INK, align:"r", alpha:a});
  }
}
function scReel(c, t, W, LH, F){
  var rt = Math.max(0, t - F.rt);
  reelF(c, 0, 0, 100, LH, rt, 1, 0, ioC(k3(t, F.rt + 1.5, F.rt + 2.2)), ioC(k3(t, F.rt + 2.2, F.rt + 2.8)), ioC(k3(t, F.rt + 2.8, F.rt + 3.5)), RPH2, F.cuts, [99, 99], 1);
  A8.reelUI(c, 0, 0, 100, LH, 1, rev(rt, .3, .5));
}
function scPost(c, t, W, LH, F){
  v3Fill(c, 0, 0, 100, LH, "#fff"); statusBar(c, true);
  c.save(); c.fillStyle = GRN; c.beginPath(); c.arc(11, 22.4, 4.6, 0, 7); c.fill(); c.restore(); v3Text(c, "H", 11, 24.8, {size:5.6, color:"#fff", align:"c"});
  sTx(c, "er.maklarbyra", 18.8, 21.6, 1, {size:3.3, weight:700, color:INK}); sTx(c, "Helsingborg", 18.8, 26.4, 1, {size:2.5, weight:500, color:MUT});
  sTx(c, "•••", 92, 23.6, 1, {size:3.4, weight:700, color:INK, align:"r"});
  var pin = oQ(k3(t, F.rt, F.rt + .7)), ya = 32;
  c.save(); c.globalAlpha = rev(t, F.rt, .3); SHIM = t; drawPost(c, 1, 0, ya + (1 - pin)*3, 100, 125, "rs_dining", 1, ioC(k3(t, F.rt + 1.0, F.rt + 1.7)), ioC(k3(t, F.rt + 1.7, F.rt + 2.3)), ioC(k3(t, F.rt + 2.3, F.rt + 3.0))); c.restore();
  var aa = rev(t, F.rt + .5, .5), iy = ya + 125 + 9;
  c.save(); c.globalAlpha = aa; c.strokeStyle = INK; c.lineWidth = .55; c.lineJoin = "round"; c.lineCap = "round";
  c.beginPath(); c.moveTo(11, iy + 4.4); c.bezierCurveTo(3.5, iy - .6, 7.4, iy - 4.4, 11, iy - 1); c.bezierCurveTo(14.6, iy - 4.4, 18.5, iy - .6, 11, iy + 4.4); c.stroke();
  c.beginPath(); c.arc(25, iy, 3.4, 0, 7); c.stroke();
  c.beginPath(); c.moveTo(36.2, iy + .8); c.lineTo(43.2, iy - 3.4); c.lineTo(39.6, iy + 3.8); c.lineTo(38, iy + 1.8); c.closePath(); c.moveTo(38, iy + 1.8); c.lineTo(43.2, iy - 3.4); c.stroke();
  c.restore();
  sTx(c, "er.maklarbyra", 8, iy + 11, aa, {size:3, weight:700, color:INK}); sTx(c, "Storgatan 15, Helsingborg.", 8 + 25, iy + 11, aa, {size:3, weight:500, color:"#3a3a3e"});
}

function title6(c, G, t, k1, k2, t2, tend){
  var o = g6(G);
  kline(c, W6(k1, 0), o.y1, o.ts, t, .15, t2 - .1);
  kline(c, W6(k2, 1), o.y2, o.ts, t, .4, t2 - .1);
  kline(c, W6("a11.end1", 0), o.y1, o.ts*.86, t, t2, tend);
  kline(c, W6("a11.end2", 2), o.y2, o.ts*.86, t, t2 + .25, tend);
}

/* D: Reel Studio i mobilen */
var RP = {ph:.25, nt:1.0, tn:2.1, deliv:2.4, tb:3.9, tpl:4.2, tt:5.9, fetch:6.5, fdone:8.6, rt:9.0, t2:14.2, L:16.8};
function adReelP(c, G, t){
  TSTYLE = "card";
  try {
    v3Fill(c, 0, 0, 100, G.H, BGG);
    var F = {ph:RP.ph, nt:RP.nt, deliv:RP.deliv, tpl:RP.tpl, fetch:RP.fetch, fdone:RP.fdone, rt:RP.rt, cuts:[0, 1.8, 3.6, 5.4, 7.0], btn:String(v3t("a11.btnR")), sel:1, tapB:1, tapT:2, tlabels:["Kommande", "Till salu", "Såld"], tkeys:["rs_dining", "rs_chair", "rs_kitchen"],
      taps:[[RP.tn, 50, 87.5], [RP.tb, 50, BTNY + 7], [RP.tt, 50, 80]], screens:[]};
    F.screens = [[0, scLock], [RP.deliv, scDeliv], [RP.tpl, scTpl], [RP.fetch, scFetch], [RP.rt, scReel]];
    phone6(c, G, t, RP.ph, function(cc, W, LH){ flow6(cc, t, W, LH, F) });
    title6(c, G, t, "a11.rt1", "a11.rt2", RP.t2, RP.L - .5);
  } finally { TSTYLE = "ed" }
}
function schedReelP(H){ H.tone(1174.7, RP.nt + .1, .06, .8); H.tone(1568, RP.nt + .25, .05, .9); H.click(RP.tn, .35); H.click(RP.tb, .35); H.click(RP.tt, .35); H.tone(1174.7, RP.fdone, .05, .9); H.tone(1568, RP.fdone + .12, .04, 1.0) }

/* E: Content Studio i mobilen */
var CP = {ph:.25, nt:1.0, tn:2.1, deliv:2.4, tb:3.8, imgs:4.1, ti:5.5, tpl:5.8, tt:7.2, fetch:7.8, fdone:9.9, rt:10.3, t2:14.8, L:17.4};
function adPostP(c, G, t){
  TSTYLE = "ed";
  v3Fill(c, 0, 0, 100, G.H, BGG);
  var F = {ph:CP.ph, nt:CP.nt, deliv:CP.deliv, imgs:CP.imgs, tpl:CP.tpl, fetch:CP.fetch, fdone:CP.fdone, rt:CP.rt, btn:String(v3t("a11.btnP")), sel:1, tapB:1, tapI:2, tapT:3, tlabels:["Kommande", "Till salu", "Såld"], tkeys:["rs_dining", "rs_dining", "rs_dining"],
    taps:[[CP.tn, 50, 87.5], [CP.tb, 50, BTNY + 7], [CP.ti, 50, 70], [CP.tt, 50, 80]], screens:[]};
  F.screens = [[0, scLock], [CP.deliv, scDeliv], [CP.imgs, scImgs], [CP.tpl, scTpl], [CP.fetch, scFetch], [CP.rt, scPost]];
  phone6(c, G, t, CP.ph, function(cc, W, LH){ flow6(cc, t, W, LH, F) });
  title6(c, G, t, "a11.pt1", "a11.pt2", CP.t2, CP.L - .5);
}
function schedPostP(H){ H.tone(1174.7, CP.nt + .1, .06, .8); H.tone(1568, CP.nt + .25, .05, .9); H.click(CP.tn, .35); H.click(CP.tb, .35); H.click(CP.ti, .35); H.click(CP.tt, .35); H.tone(1174.7, CP.fdone, .05, .9); H.tone(1568, CP.fdone + .12, .04, 1.0) }

/* ---------- registrering ---------- */
window.V3_ADS10 = [];
function loadAudio10(){ return v3SfxLoad() }
function reg10(id, n, d, fn, sched, thumb){
  var comp = {n:n, d:d, group:"ads10", id:id, v:{id:id}, dur:FL.DUR, thumb:thumb, L:FL.LOGO - .53, logo:true, vo:[]};
  comp.draw = function(c, G, t){ fn(c, G, t) };
  comp.mix = K.makeMix(sched); comp.loadAudio = loadAudio10;
  V3_COMPS[id] = comp; V3_ADS10.push(id);
}
reg10("a10_reel", "1 · Reel Studio", "25 bilder är levererade. Skapa Reel, kontorets mallar och bostadens uppgifter hämtas, och Reelen fyller i sig själv.", adFlow, schedFlow, 9.8);

(function(){
  var comp = {n:"2 · Så fungerar Reel Studio", d:"Förklaringsvideo utan röst: välj bilder, mallen fyller i sig själv, gör den till din, rörelse per element.", group:"ads10", id:"a10_how", v:{id:"a10_how"}, dur:EX.DUR, thumb:8.2, L:EX.LOGO - .53, logo:true};
  comp.draw = function(c, G, t){ adExplain(c, G, t) };
  comp.mix = K.makeMix(sched2); comp.loadAudio = function(){ return v3SfxLoad() };
  V3_COMPS.a10_how = comp; V3_ADS10.push("a10_how");
})();

(function(){
  var comp = {n:"3 · Så fungerar Content Studio", d:"Förklaringsvideo utan röst och utan kamera- eller klickljud: välj en bild, välj en mall, uppgifterna fylls i, ett inlägg i alla format.", group:"ads10", id:"a10_cs", v:{id:"a10_cs"}, dur:CX.DUR, thumb:9.4, L:CX.LOGO - .53, logo:true};
  comp.draw = function(c, G, t){ adContent(c, G, t) };
  comp.mix = K.makeMix(sched3); comp.loadAudio = function(){ return v3SfxLoad() };
  V3_COMPS.a10_cs = comp; V3_ADS10.push("a10_cs");
})();

(function(){
  var comp = {n:"1b · Reel Studio med iPhone-notis", d:"Som annons 1, men öppnar med en iPhone-notis: Dina foton är klara. Utan röst, med ett mjukt notisljud och datorklick.", group:"ads10", id:"a10_reeln", v:{id:"a10_reeln"}, dur:FL.DUR + FL.NOF, thumb:2.0, L:FL.LOGO - .53 + FL.NOF, logo:true, vo:[]};
  comp.draw = function(c, G, t){ adFlowNotis(c, G, t) };
  comp.mix = K.makeMix(schedFlowNotis); comp.loadAudio = function(){ return v3SfxLoad() };
  V3_COMPS.a10_reeln = comp; V3_ADS10.splice(1, 0, "a10_reeln");
})();

(function(){
  var NF = FL.NOF, BOOK10 = {b:"a7.btnB"}, LR = R2.PHO + .9, LC = C2.END + .9;
  var withBook = function(fn, Lc){ var inner = withNotis(fn, NF); return function(c, G, t){ inner(c, G, Math.min(t, NF + Lc)); if(t >= NF + Lc) K.endSeq(c, G, t, NF + Lc, BOOK10) } };
  var defs = [["a10_reel2", "1c · Reel Studio, notis och välj mall först", "iPhone-notis (Dina foton är klara), 25 bilder, Skapa Reel, välj mall, bostadens uppgifter hämtas och mallen fyller i sig själv i Reelen. Slutar på Boka fotografering som blir Viewly.", withBook(adReel2, LR), notisSched(schedReel2, NF), NF + LR + END10, NF + LR, 2.0],
              ["a10_cs2", "3b · Content Studio, notis, välj bild och mall", "iPhone-notis (Dina foton är klara), 25 bilder, välj bild, välj mall, bostadens uppgifter hämtas och mallen fyller i sig själv. Slutar på Boka fotografering som blir Viewly.", withBook(adContent2, LC), notisSched(schedContent2, NF), NF + LC + END10, NF + LC, 2.0]];
  var BK = {b:"a7.btnB"};
  var withEnd = function(fn, L){ return function(c, G, t){ fn(c, G, Math.min(t, L)); if(t >= L) K.endSeq(c, G, t, L, BK) } };
  var NT2 = function(fn){ return function(c, G, t){ NT = {d:"Fredag 23 oktober", t:"16:40"}; try { fn(c, G, t) } finally { NT = {d:"Lördag 24 oktober", t:"9:41"} } } };
  var more = [
    ["a10_efter", "A · Efteråt", "Checklistan med allt som annars görs efter fotograferingen bockas av av sig själv. Du bokar. Resten är redan gjort. Slutar på Boka fotografering.", withEnd(adEfter, EF.L), schedEfter, EF.L + END10, EF.L, 7.6],
    ["a10_sf", "Statisk · Efteråt", "Du bokar. med knapp.", stEfter, function(H){}, 2, 0, 1],
    ["a10_sfs", "Statisk · Första bilden", "Första bilden avgör. med knapp.", stForsta, function(H){}, 2, 0, 1]
  ];
  defs = defs.concat(more);
  defs.forEach(function(d){
    var comp = {n:d[1], d:d[2], group:"ads10", id:d[0], v:{id:d[0]}, dur:d[5], thumb:d[7], L:d[6], vo:[]};
    comp.draw = function(c, G, t){ d[3](c, G, t) };
    comp.mix = K.makeMix(d[4]); comp.loadAudio = function(){ return v3SfxLoad() };
    V3_COMPS[d[0]] = comp; V3_ADS10.push(d[0]);
  });
  var extra = [
    ["a10_fredag", "B · Fredag 16:40", "Notis på låsskärmen en fredag eftermiddag, kampanjen skapas och fyra inlägg är klara. Hinn med fredagen. Slutar på Boka fotografering.", NT2(withBook(adFredag, FR.L)), notisSched(schedFredag, NF), NF + FR.L + END10, NF + FR.L, 6.2],
    ["a10_forsta", "C · Första bilden avgör", "Tre riktiga Viewly-foton, en rad per bild: Första bilden avgör. Allt efter den är redan gjort. Du bokar. Slutar på Boka fotografering.", withEnd(adForsta, FO.L), function(H){}, FO.L + END10, FO.L, 4.5]
  ];
  extra.forEach(function(d){
    var comp = {n:d[1], d:d[2], group:"ads10", id:d[0], v:{id:d[0]}, dur:d[5], thumb:d[7], L:d[6], vo:[]};
    comp.draw = function(c, G, t){ d[3](c, G, t) };
    comp.mix = K.makeMix(d[4]); comp.loadAudio = function(){ return v3SfxLoad() };
    V3_COMPS[d[0]] = comp; V3_ADS10.push(d[0]);
  });
  var defs11 = [
    ["a11_board", "A · Ett foto. Hela marknadsavdelningen.", "Det levererade fotot blir ett bräde: annonstext, planritning, kampanj i kontorets mallar och alla format gör sig själva. Mindre jobb. Mer varumärke. Slutar på Boka fotografering.", withEnd(adBoard, BD.L), schedBoard, BD.L + END10, BD.L, 7.9],
    ["a11_profil", "B · Fredag 16:40, din profil", "Notis en fredag eftermiddag, kampanjen skapas och profilen fylls med inlägg i kontorets grafik. Hinn med fredagen. Bygg varumärket. Slutar på Boka fotografering.", NT2(withBook(adProfil, PF.L)), notisSched(schedProfil, NF), NF + PF.L + END10, NF + PF.L, NF + 8.7],
    ["a11_efter", "C · Efteråt, nu med varumärke", "Checklistan som bockas av av sig själv, nu med mallar och varumärke som två av raderna. Mindre jobb. Mer varumärke. Slutar på Boka fotografering.", withEnd(adEfter2, E2.L), schedEfter2, E2.L + END10, E2.L, 7.4],
    ["a11_sb", "Statisk · Brädet", "Brädet med allt klart.", stBoard, function(H){}, 2, 0, 1],
    ["a11_sp", "Statisk · Profilen", "Profilen med sex inlägg.", stProfil, function(H){}, 2, 0, 1],
    ["a11_sm", "Statisk · Mindre jobb", "Mindre jobb. Mer varumärke. med knapp.", stMindre, function(H){}, 2, 0, 1],
    ["a11_tpl", "Statisk · Reel-mallarna", "Kontorets tre Reel-mallar: Kommande, Till salu och Såld.", stTpl, function(H){}, 2, 0, 1]
  ];
  defs11.forEach(function(d){
    var comp = {n:d[1], d:d[2], group:"ads11", id:d[0], v:{id:d[0]}, dur:d[5], thumb:d[7], L:d[6], vo:[]};
    comp.draw = function(c, G, t){ d[3](c, G, t) };
    comp.mix = K.makeMix(d[4]); comp.loadAudio = function(){ return v3SfxLoad() };
    V3_COMPS[d[0]] = comp; V3_ADS11.push(d[0]);
  });
  ([["a11_reelp", "D · Reel Studio i mobilen", "Slät mörkgrön bakgrund, titeln Från foto till färdig Reel och hela flödet i mobilen: notis, Skapa Reel, välj mall, uppgifterna hämtas, Reelen fylls i. Därefter Fotografering och verktyg i ett enda flöde och Boka fotografering.", withEnd(adReelP, RP.L), schedReelP, RP.L + END10, RP.L, 12.2],
   ["a11_postp", "E · Content Studio i mobilen", "Slät mörkgrön bakgrund, titeln Från foto till färdigt inlägg och hela flödet i mobilen: notis, Skapa inlägg, välj bild, välj mall, uppgifterna hämtas, inlägget fylls i. Därefter Fotografering och verktyg i ett enda flöde och Boka fotografering.", withEnd(adPostP, CP.L), schedPostP, CP.L + END10, CP.L, 13.0]]).forEach(function(d){
    var comp = {n:d[1], d:d[2], group:"ads11", id:d[0], v:{id:d[0]}, dur:d[5], thumb:d[7], L:d[6], vo:[]};
    comp.draw = function(c, G, t){ d[3](c, G, t) };
    comp.mix = K.makeMix(d[4]); comp.loadAudio = function(){ return v3SfxLoad() };
    V3_COMPS[d[0]] = comp; V3_ADS11.unshift(d[0]);
  });
})();

var SCRIPT11 = [
  ["Fotograferingen är gjord.", "Det levererade fotot fyller bilden. Rubrik: Fotograferingen är gjord."],
  ["Resten gör sig själv.", "Fotot flyttar in i ett bräde. Annonstext skrivs, planritning ritas, tre inlägg i kontorets mallar och alla format dyker upp."],
  ["Allt klart.", "Varje del bockas av med ett mjukt klick."],
  ["Mindre jobb. Mer varumärke.", "Slutraden, med Fotograf och marknadsavdelning i ett. Därefter Boka fotografering."]
];
window.secAds11 = function(){
  if(V3_ADS11.indexOf(V3S.comp) < 0){ V3S.comp = "a11_board"; V3S.t = V3_COMPS.a11_board.thumb; V3S.playing = false; v3StopSound() }
  if(V3S.fmt !== "916" && V3S.fmt !== "45") V3S.fmt = "916";
  var comp = V3_COMPS[V3S.comp], fn = V3S.fmt === "916" ? "9:16 · 1080 × 1920" : "4:5 · 1080 × 1350";
  setTimeout(v3Mount, 0);
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 19 · bygge 1</div><h2>Mindre jobb. Mer varumärke.</h2>'
    + '<p>Ny riktning: Viewly är fotograf och marknadsavdelning i ett. Annonserna visar att allt efter fotograferingen redan är gjort och att varumärket byggs på köpet. Utan röst och utan priser, med bara diskreta klick. Förslag, inget publicerat.</p></div>'
    + '<div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w45") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play" aria-label="Spela">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '" aria-label="Tid"></div>'
    + '<span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Annons</div><div class="a3segs col">' + V3_ADS11.map(function(id){ return v3Seg("comp", id, V3_COMPS[id].n, V3S.comp === id) }).join("") + '</div>'
    + '<div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Reel 9:16", V3S.fmt === "916") + v3Seg("fmt", "45", "Flöde 4:5", V3S.fmt === "45") + '</div>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + comp.n + " · " + fn + '</button></div></div></div>'
    + '<details class="a3det a3cust" open><summary>Texter</summary><div class="a3hxs">' + ["a8.re.addr", "a8.re.city", "a8.re.facts"].map(function(k){ return v3TxField(k, "Bostaden · " + k.split(".").pop()) }).join("") + ["tpl.kommande", "tpl.tillsalu", "tpl.sald", "tpl.tack"].map(function(k){ return v3TxField(k, "Mall · " + k.split(".").pop()) }).join("") + Object.keys(TX11).map(function(k){ return v3TxField(k, TX11[k][1]) }).join("") + '</div></details>'
    + '<h3 class="a3sub">Manus och bild</h3><div class="a3copy">' + SCRIPT11.map(function(s, i){ return '<div><b>' + (i + 1) + ' · ' + s[0] + '</b><p>' + s[1] + '</p></div>' }).join("") + '</div></div>';
};


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
