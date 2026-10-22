/* =====================================================================
   HIGHLIGHT-VIDEOR — en kort film per kapitel i Studion.

   Samma verktygslåda, samma ljud och samma export som annonserna (ads3a–c).
   Varje film är en lista scener ("beats") som hämtar sin text ur kapitlets
   egna rader i highlights-data.js, och slutar i Viewlys slutkort.
   Ingen text är ny: det som står här är kapitlens egna förslag, kortade.

   Scenerna ritas som rena funktioner av tiden, så förhandsvisning, PNG och
   MP4 blir identiska. Byten sker med en lugn gardin (klippning), aldrig
   med genomskinlighet, så texten aldrig ligger dubbelt.
   ===================================================================== */

(function(){
var HK = {hero:"h_hero", kitchen:"h_kitchen", living:"h_living", dining2:"h_dining2", boucle:"h_boucle", eames:"h_eames",
          drone:"h_drone", matterport:"h_matterport", threed:"h_threed", om1:"h_om1", om3:"h_om3", om4:"h_om4", kontakt:"h_kontakt",
          esLivBef:"h_esLivBef", esLivAft:"h_esLivAft", esBedBef:"h_esBedBef", esBedAft:"h_esBedAft",
          skyBef:"h_skyBef", skyAft:"h_skyAft", vadBef:"h_vadBef", vadAft:"h_vadAft", portal:"h_portal", dining:"h_dining"};
Object.keys(HK).forEach(function(k){ V3_KEYS[HK[k]] = k });
V3_POS.h_portal = [.5, .55];
function hp(k){ return HK[k] || k }

/* ---------- layout och text ---------- */
function L(G){ return {m:8, x0:8, x1:92, w:84, y0:G.top + 2, y1:G.H - G.bot, H:G.H, cy:G.cy, is9:G.is9} }
function wrap(c, s, o, maxW){
  var words = String(s).split(" "), lines = [], cur = "";
  words.forEach(function(w){
    var t = cur ? cur + " " + w : w;
    if(cur && v3Measure(c, t, o) > maxW){ lines.push(cur); cur = w } else cur = t;
  });
  if(cur) lines.push(cur);
  return lines;
}
/* Rubrik som passar: provar fyra storlekar tills den ryms på högst maxL rader. */
function fit(c, s, maxW, maxL, sizes, italic, weight){
  var i, sz, ls;
  for(i = 0; i < sizes.length; i++){
    sz = sizes[i]; ls = wrap(c, s, {size:sz, weight:weight || 300, italic:italic}, maxW);
    if(ls.length <= maxL) return {size:sz, lines:ls};
  }
  return {size:sizes[sizes.length - 1], lines:wrap(c, s, {size:sizes[sizes.length - 1], weight:weight || 300, italic:italic}, maxW)};
}
function TH(dark){
  return dark ? {bg:C3.dark, ink:"#fff", soft:"rgba(255,255,255,.78)", acc:C3.olil, hair:"rgba(255,255,255,.22)", dark:true}
              : {bg:C3.paper, ink:C3.ink, soft:C3.mut, acc:C3.oli, hair:C3.line, dark:false};
}
/* kapitelmärke uppe till vänster, på varje scen */
function tag(c, R, F, th, a){
  if(!F.name) return;
  v3Text(c, F.num + " — " + F.name, R.x0, R.y0 + 2.6, {size:1.5, weight:500, f:"sans", sp:.3, color:th.dark ? "rgba(255,255,255,.8)" : C3.mut, alpha:a});
}
/* Wrapped headline. Draws lines top-down from y, returns the y after the last line. */
function head(c, lines, x, y, size, col, align, t, t0, italic, rise){
  lines.forEach(function(l, i){
    var p = oQ(k3(t, t0 + i*.14, t0 + .9 + i*.14));
    v3Text(c, l, x, y + size*.82 + i*size*1.06, {size:size, italic:italic, color:col, align:align || "l", p:p, rise:rise == null ? size*.35 : rise});
  });
  return y + lines.length*size*1.06;
}
function kick(c, s, x, y, col, align, t, t0){
  var a = ioC(k3(t, t0, t0 + .6));
  v3Text(c, s.toUpperCase(), x, y, {size:1.6, weight:600, f:"sans", sp:.3, color:col, align:align || "l", alpha:a});
}
function sub(c, s, x, y, col, align, t, t0, size, maxW){
  size = size || 2.3;
  var ls = wrap(c, s, {size:size, weight:400, f:"sans"}, maxW || 80), a = ioC(k3(t, t0, t0 + .8));
  ls.forEach(function(l, i){ v3Text(c, l, x, y + size + i*size*1.5, {size:size, weight:400, f:"sans", color:col, align:align || "l", alpha:a, rise:.8*(1 - a)}) });
  return y + ls.length*size*1.5 + size*.3;
}
function subH(c, s, size, maxW){ return wrap(c, s, {size:size || 2.3, weight:400, f:"sans"}, maxW || 80).length*(size || 2.3)*1.5 + (size || 2.3)*.3 }

/* ---------- scener ---------- */

/* foto i helbild: kapitlets egen bild, rubrik nederst */
function bPhoto(c, G, t, b, F){
  var R = L(G), H = G.H, d = b.dur, th = TH(true);
  v3Photo(c, hp(b.m), 0, 0, 100, H, {scale:1.1 - .1*ioC(k3(t, 0, d + .8)), pos:b.pos || V3_POS[hp(b.m)] || [.5, b.fy == null ? .5 : b.fy]});
  v3Grad(c, 0, H*.34, 100, H*.66, [[0, "rgba(14,14,13,0)"], [1, "rgba(14,14,13,.9)"]]);
  v3Grad(c, 0, 0, 100, H*.2, [[0, "rgba(14,14,13,.5)"], [1, "rgba(14,14,13,0)"]]);
  v3Frame(c, 4, 4, 92, H - 8, "#fff", .26, oQ(k3(t, 0, 1.4)), .5);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  var hf = b.h ? fit(c, b.h, R.w, 3, [8.4, 7.2, 6.2, 5.4]) : null, sh = b.s ? subH(c, b.s, 2.3, 76) : 0;
  var tot = (b.k ? 4 : 0) + (hf ? hf.lines.length*hf.size*1.06 : 0) + (sh ? sh + 2.4 : 0), y = R.y1 - 3 - tot;
  if(b.k){ kick(c, b.k, R.x0, y + 2, C3.olil, "l", t, .5); y += 4 }
  if(hf){ y = head(c, hf.lines, R.x0, y, hf.size, "#fff", "l", t, .7); v3Line(c, R.x0, R.x0 + 12, y + 1.6, C3.olil, .3, oQ(k3(t, 1.3, 1.9)), 1) }
  if(b.s) sub(c, b.s, R.x0, y + 3, "rgba(255,255,255,.86)", "l", t, 1.5, 2.3, 76);
}

/* typografisk scen: rubrik, kursiv rad, liten text */
function bQuiet(c, G, t, b, F){
  var R = L(G), th = TH(b.dark !== false);
  v3Fill(c, 0, 0, 100, G.H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  var h1 = fit(c, b.h, R.w, 4, [8.2, 7.2, 6.2, 5.4]), h2 = b.em ? fit(c, b.em, R.w, 3, [h1.size, h1.size - 1, h1.size - 2], true) : null;
  var sh = b.s ? subH(c, b.s, 2.4, 70) : 0;
  var tot = h1.lines.length*h1.size*1.06 + (h2 ? h2.lines.length*h2.size*1.06 + 1.2 : 0) + (sh ? sh + 5 : 0), y = R.cy - tot/2;
  y = head(c, h1.lines, 50, y, h1.size, th.ink, "c", t, .4);
  if(h2){ y += 1.2; y = head(c, h2.lines, 50, y, h2.size, th.acc, "c", t, 1.1, true) }
  if(b.s){ v3Line(c, 44, 56, y + 2.6, th.hair, .2, oQ(k3(t, 1.8, 2.4)), 1); sub(c, b.s, 50, y + 5, th.soft, "c", t, 2.0, 2.4, 70) }
}

/* uppställning: rubrik, rader som kommer en i taget */
function itemParts(it){
  if(Array.isArray(it)) return it;
  var i = it.indexOf(" — "); return i < 0 ? [it, ""] : [it.slice(0, i), it.slice(i + 3)];
}
function bList(c, G, t, b, F){
  var R = L(G), th = TH(b.dark === true);
  v3Fill(c, 0, 0, 100, G.H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  var y = R.y0 + 8;
  if(b.k){ kick(c, b.k, R.x0, y, th.acc, "l", t, .3); y += 3.6 }
  var hf = fit(c, b.h, R.w, 2, [7.4, 6.4, 5.6]);
  y = head(c, hf.lines, R.x0, y, hf.size, th.ink, "l", t, .5) + 3.6;
  var n = b.items.length, subs = b.s ? subH(c, b.s, 2.4, 80) + 2 : 0, avail = R.y1 - subs - y - 1;
  var rh = Math.min(R.is9 ? 20 : 15, avail/n), step = b.step || Math.min(.8, Math.max(.4, (b.dur - 2.4)/n)), i;
  for(i = 0; i < n; i++){
    var pr = itemParts(b.items[i]), ti = 1.0 + i*step, ry = y + i*rh, pa = oQ(k3(t, ti, ti + .8));
    v3Line(c, R.x0, R.x1, ry, th.hair, .18, pa, 1);
    v3Text(c, (i + 1 < 10 ? "0" : "") + (i + 1), R.x0, ry + 4.2, {size:1.5, weight:500, f:"sans", sp:.2, color:th.acc, alpha:pa});
    var tf = fit(c, pr[0], R.w - 9, 2, pr[1] ? [4.4, 3.8] : [4.8, 4.0, 3.4]), ty = ry + 1.6;
    tf.lines.forEach(function(l, j){ v3Text(c, l, R.x0 + 8, ty + tf.size*.9 + j*tf.size*1.04, {size:tf.size, color:th.ink, p:pa, rise:1.2}) });
    if(pr[1]){
      var dl = wrap(c, pr[1], {size:2.3, weight:400, f:"sans"}, R.w - 9), dy = ty + tf.lines.length*tf.size*1.04 + .6;
      dl.slice(0, 2).forEach(function(l, j){ v3Text(c, l, R.x0 + 8, dy + 2.3 + j*3.3, {size:2.3, weight:400, f:"sans", color:th.soft, alpha:pa}) });
    }
  }
  v3Line(c, R.x0, R.x1, y + n*rh, th.hair, .18, oQ(k3(t, 1.0 + (n - 1)*step + .3, 1.0 + (n - 1)*step + 1.1)), 1);
  if(b.s) sub(c, b.s, R.x0, R.y1 - subs + 2, th.soft, "l", t, 1.2 + n*step, 2.4, 80);
}

/* siffror: 31 % … i ett rutnät */
function bStats(c, G, t, b, F){
  var R = L(G), th = TH(true);
  v3Fill(c, 0, 0, 100, G.H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  var y = R.y0 + 8;
  kick(c, b.k, R.x0, y, th.acc, "l", t, .3); y += 3.6;
  var hf = fit(c, b.h, R.w, 2, [7.4, 6.4, 5.6]); y = head(c, hf.lines, R.x0, y, hf.size, th.ink, "l", t, .5) + 5;
  var cw = 40, gh = R.is9 ? 25 : 22;
  b.items.forEach(function(s, i){
    var m = /^(\d+%\+?)\s+(.*)$/.exec(s) || [0, s, ""], cx = R.x0 + (i % 2)*(cw + 4), cy = y + Math.floor(i/2)*gh, ti = 1.0 + i*.55, pa = oQ(k3(t, ti, ti + .9));
    v3Line(c, cx, cx + cw, cy, th.hair, .18, pa, 1);
    v3Text(c, m[1], cx, cy + 11.5, {size:10.4, color:"#fff", p:pa, rise:2});
    var dl = wrap(c, m[2], {size:2.5, weight:400, f:"sans"}, cw - 2);
    dl.forEach(function(l, j){ v3Text(c, l, cx, cy + 16.5 + j*3.5, {size:2.5, weight:400, f:"sans", color:th.soft, alpha:pa}) });
  });
  if(b.s) sub(c, b.s, R.x0, R.y1 - 7, th.soft, "l", t, 3.6, 2, 80);
}

/* före / efter: ett reglage sveper över bilden */
function bSplit(c, G, t, b, F){
  var R = L(G), H = G.H, th = TH(true), A = hp(b.m[0]), B = hp(b.m[1]);
  var p = ioC(k3(t, .9, b.dur - .9)), x = lerp(0, 100, p);
  v3Photo(c, A, 0, 0, 100, H, {scale:1.05});
  c.save(); c.beginPath(); c.rect(0, 0, x, H); c.clip(); v3Photo(c, B, 0, 0, 100, H, {scale:1.05}); c.restore();
  v3Grad(c, 0, H*.5, 100, H*.5, [[0, "rgba(14,14,13,0)"], [1, "rgba(14,14,13,.82)"]]);
  v3Grad(c, 0, 0, 100, H*.2, [[0, "rgba(14,14,13,.5)"], [1, "rgba(14,14,13,0)"]]);
  v3Fill(c, x - .15, 0, .3, H, "#fff", p > 0 && p < 1 ? .85 : 0);
  c.save(); c.globalAlpha = p > 0 && p < 1 ? 1 : 0; c.fillStyle = "#fff"; c.beginPath(); c.arc(x, G.cy, 2.2, 0, 7); c.fill(); c.restore();
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  var sw = x > 20; v3Text(c, b.lb.toUpperCase(), R.x0, R.y1 - 14, {size:1.6, weight:600, f:"sans", sp:.3, color:"#fff", alpha:ioC(k3(x, 14, 26))});
  v3Text(c, b.la.toUpperCase(), R.x1, R.y1 - 14, {size:1.6, weight:600, f:"sans", sp:.3, color:"#fff", align:"r", alpha:1 - ioC(k3(x, 74, 88))});
  kick(c, b.k, R.x0, R.y1 - 9, C3.olil, "l", t, .5);
  head(c, [b.h], R.x0, R.y1 - 7, 6.6, "#fff", "l", t, .7);
}

/* steg: numrerade punkter på en linje som växer */
function bChain(c, G, t, b, F){
  var R = L(G), th = TH(b.dark === true);
  v3Fill(c, 0, 0, 100, G.H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  var y = R.y0 + 8; kick(c, b.k, R.x0, y, th.acc, "l", t, .3); y += 3.6;
  var hf = fit(c, b.h, R.w, 2, [7.2, 6.2, 5.4]); y = head(c, hf.lines, R.x0, y, hf.size, th.ink, "l", t, .5) + 4;
  var n = b.items.length, subs = b.s ? subH(c, b.s, 2.4, 80) + 2 : 0, avail = R.y1 - subs - y, rh = Math.min(R.is9 ? 28 : 21, avail/n), step = b.step || Math.min(.9, (b.dur - 2.6)/n);
  var lx = R.x0 + 3.2;
  v3VLine(c, lx, y + 3, y + 3 + (n - 1)*rh, th.hair, .22, ioC(k3(t, 1.0, 1.0 + n*step)), 1);
  b.items.forEach(function(it, i){
    var ti = 1.0 + i*step, pa = oQ(k3(t, ti, ti + .8)), ry = y + i*rh, pr = itemParts(it), last = i === b.now;
    c.save(); c.globalAlpha = pa; c.beginPath(); c.arc(lx, ry + 3, 3.2*oBack(k3(t, ti, ti + .7)), 0, 7); c.fillStyle = th.bg; c.fill();
    c.strokeStyle = th.acc; c.lineWidth = .28; c.stroke(); c.restore();
    v3Text(c, String(i + 1), lx, ry + 4.1, {size:2.8, color:th.ink, align:"c", alpha:pa});
    var tf = fit(c, pr[0], R.w - 11, 2, [4.8, 4.0]);
    tf.lines.forEach(function(l, j){ v3Text(c, l, R.x0 + 10, ry + 1.4 + tf.size*.9 + j*tf.size*1.04, {size:tf.size, color:th.ink, p:pa, rise:1.2}) });
    var dy = ry + 1.4 + tf.lines.length*tf.size*1.04 + .8;
    wrap(c, pr[1], {size:2.3, weight:400, f:"sans"}, R.w - 11).slice(0, 3).forEach(function(l, j){ v3Text(c, l, R.x0 + 10, dy + 2.3 + j*3.3, {size:2.3, weight:400, f:"sans", color:th.soft, alpha:pa}) });
  });
  if(b.s) sub(c, b.s, R.x0, R.y1 - subs + 2, th.soft, "l", t, 1.2 + n*step, 2.4, 80);
}

/* produktbild i en ram, text under */
function bProduct(c, G, t, b, F){
  var R = L(G), th = TH(true), H = G.H;
  v3Fill(c, 0, 0, 100, H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  var cw = R.is9 ? 56 : 42, ch = cw*1.5, cx = (100 - cw)/2, cyy = R.y0 + 8, q = oQ(k3(t, .1, 1.1));
  c.save(); c.globalAlpha = q;
  v3Shadow(c, [cx, cyy + (1 - q)*3, cw, ch], .5, 3);
  v3Photo(c, hp(b.m), cx, cyy + (1 - q)*3, cw, ch, {scale:(b.zoom || 1.02) + .05*(1 - ioC(k3(t, 0, b.dur))), pos:[.5, b.fy == null ? .5 : b.fy]});
  c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = .25; c.strokeRect(cx, cyy + (1 - q)*3, cw, ch);
  c.restore();
  var y = cyy + ch + 5; kick(c, b.k, 50, y, th.acc, "c", t, .8); y += 3.2;
  var hf = fit(c, b.h, R.w, 2, [5.6, 5, 4.4]); y = head(c, hf.lines, 50, y, hf.size, "#fff", "c", t, 1.0);
  if(b.s) sub(c, b.s, 50, y + 1.2, th.soft, "c", t, 1.8, 2.1, 66);
}

/* avslutande rad, innan slutkortet */
function bCta(c, G, t, b, F){
  var R = L(G), th = TH(b.dark !== false);
  v3Fill(c, 0, 0, 100, G.H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  var h1 = fit(c, b.h, R.w, 3, [8.4, 7.4, 6.4]), sh = b.s ? 5 : 0, tot = h1.lines.length*h1.size*1.06 + sh, y = R.cy - tot/2;
  y = head(c, h1.lines, 50, y, h1.size, th.ink, "c", t, .4);
  if(b.s){ v3Line(c, 44, 56, y + 2.4, th.hair, .2, oQ(k3(t, 1.4, 2.0)), 1); v3Text(c, b.s.toUpperCase(), 50, y + 6.4, {size:1.8, weight:600, f:"sans", sp:.3, color:th.acc, align:"c", alpha:ioC(k3(t, 1.6, 2.3))}) }
}

/* ekosystemet: ett objekt i mitten, delarna runt det */
function bOrbit(c, G, t, b, F){
  var R = L(G), th = TH(true), cx = 50, cy = R.cy + 4, rad = R.is9 ? 29 : 25, n = b.items.length, dir = b.dir === "out";
  v3Fill(c, 0, 0, 100, G.H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  kick(c, b.k, R.x0, R.y0 + 8, th.acc, "l", t, .3);
  var hf = fit(c, b.h, R.w, 2, [6.6, 5.8, 5]); head(c, hf.lines, R.x0, R.y0 + 11.2, hf.size, "#fff", "l", t, .5);
  c.save(); c.strokeStyle = "rgba(255,255,255,.14)"; c.lineWidth = .2; c.setLineDash([.6, .9]); c.beginPath(); c.arc(cx, cy, rad, 0, 7*oQ(k3(t, .6, 1.8))); c.stroke(); c.restore();
  var i;
  for(i = 0; i < n; i++){
    var ang = -Math.PI/2 + i*2*Math.PI/n, ti = 1.2 + i*.5, pp = oQ(k3(t, ti, ti + .9)), r2 = dir ? lerp(rad*.35, rad, pp) : lerp(rad*1.25, rad, pp);
    var nx = cx + Math.cos(ang)*r2, ny = cy + Math.sin(ang)*r2, pa = k3(t, ti, ti + .5);
    c.save(); c.globalAlpha = pa*.5; c.strokeStyle = th.acc; c.lineWidth = .22; c.beginPath(); c.moveTo(cx + Math.cos(ang)*5.6, cy + Math.sin(ang)*5.6); c.lineTo(nx, ny); c.stroke(); c.restore();
    c.save(); c.globalAlpha = pa; c.fillStyle = th.acc; c.beginPath(); c.arc(nx, ny, 1.1, 0, 7); c.fill(); c.restore();
    var cs = Math.cos(ang), al = Math.abs(cs) < .3 ? "c" : cs > 0 ? "l" : "r", lx = nx + (al === "c" ? 0 : cs > 0 ? 2.4 : -2.4), ly = ny + (Math.abs(cs) < .3 ? (Math.sin(ang) < 0 ? -2.6 : 4.8) : 1.2);
    v3Text(c, b.items[i], lx, ly, {size:2.5, weight:400, f:"sans", color:"#fff", align:al, alpha:pa});
  }
  v3Mark(c, cx - 4.3, cy - 3.8, 7.6, "#fff", C3.dotL, {alpha:ioC(k3(t, .4, 1.2)), reveal:oQ(k3(t, .4, 1.4))});
  if(b.s) sub(c, b.s, R.x0, R.y1 - subH(c, b.s, 2.4, 80) + 1, th.soft, "l", t, 1.2 + n*.5, 2.1, 80);
}

/* ekosystemet: sex kontakter blir en yta */
function bMerge(c, G, t, b, F){
  var R = L(G), th = TH(false), n = b.before.length;
  v3Fill(c, 0, 0, 100, G.H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  kick(c, b.k, R.x0, R.y0 + 8, th.acc, "l", t, .3);
  var hf = fit(c, b.h, R.w, 2, [6.6, 5.8, 5]), y = head(c, hf.lines, R.x0, R.y0 + 11.2, hf.size, th.ink, "l", t, .5) + 4;
  var merge = ioC(k3(t, 3.4, 4.6)), i, rowH = R.is9 ? 11 : 8.4, cy = y + 3*rowH;
  for(i = 0; i < n; i++){
    var ti = .9 + i*.28, pa = oQ(k3(t, ti, ti + .6))*(1 - ioC(k3(t, 3.9, 4.6))), yy = lerp(y + i*rowH, cy, merge), x = lerp(R.x0, 50 - 12, merge*.0 + 0);
    c.save(); c.globalAlpha = pa; c.strokeStyle = th.hair; c.lineWidth = .2; c.strokeRect(R.x0, yy - 1.6, 36, 5.2); c.restore();
    v3Text(c, b.before[i], R.x0 + 2.4, yy + 1.8, {size:2.2, weight:500, f:"sans", color:th.ink, alpha:pa});
  }
  var pl = oQ(k3(t, 4.0, 5.0)), pw = 84*pl;
  if(pl > 0){
    c.save(); c.globalAlpha = pl; c.fillStyle = th.bg === C3.paper ? C3.ink : "#000"; c.fillRect(50 - pw/2, cy - 3.6, pw, 7.2); c.restore();
    v3Text(c, b.plate.toUpperCase(), 50, cy + 1.2, {size:2.2, weight:600, f:"sans", sp:.3, color:"#fff", align:"c", alpha:k3(pl, .6, 1)});
  }
  b.after.forEach(function(s, j){
    var ti = 5.3 + j*.45, pa = oQ(k3(t, ti, ti + .8));
    v3Line(c, R.x0, R.x1, cy + 10 + j*10.4, th.hair, .18, pa, 1);
    v3Text(c, s, R.x0, cy + 17.2 + j*10.4 - 2.6, {size:4, color:th.ink, p:pa, rise:1.2});
  });
}

/* annonsen: sex bilder blir en färdig text */
function bWrite(c, G, t, b, F){
  var R = L(G), th = TH(false), H = G.H;
  v3Fill(c, 0, 0, 100, H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  var y = R.y0 + 8; kick(c, b.k, R.x0, y, th.acc, "l", t, .3); y += 3.6;
  var hf = fit(c, b.h, R.w, 2, [6.6, 5.8, 5]); y = head(c, hf.lines, R.x0, y, hf.size, th.ink, "l", t, .5) + 4;
  var tw = 12.6, gap = 1.6, i;
  for(i = 0; i < 6; i++){
    var ti = .9 + i*.14, pa = oQ(k3(t, ti, ti + .6)), mv = ioC(k3(t, 2.6, 3.4));
    var x = R.x0 + i*(tw + gap), yy = y + (1 - pa)*2;
    c.save(); c.globalAlpha = pa*(1 - .55*mv); v3Photo(c, hp(b.ims[i]), x, yy, tw, tw*1.25); c.restore();
  }
  var cy2 = y + tw*1.25 + 4, ca = oQ(k3(t, 2.8, 3.8)), ch = Math.min(R.y1 - cy2 - 1, 54);
  if(ca > 0){
    c.save(); c.globalAlpha = ca; v3Shadow(c, [R.x0, cy2 + (1 - ca)*3, R.w, ch], .16, 2); c.fillStyle = "#fff"; c.fillRect(R.x0, cy2 + (1 - ca)*3, R.w, ch); c.restore();
    var ix = R.x0 + 4, iy = cy2 + (1 - ca)*3 + 4;
    var tf = fit(c, b.title, R.w - 8, 2, [5.4, 4.8]);
    head(c, tf.lines, ix, iy + 1, tf.size, C3.ink, "l", t, 3.4);
    var ly = iy + 1 + tf.lines.length*tf.size*1.06 + 2.4;
    v3Text(c, b.lead.length ? "" : "", ix, ly, {size:2});
    var ll = wrap(c, b.lead, {size:2.1, weight:400, f:"sans"}, R.w - 8);
    ll.forEach(function(l, j){ v3Text(c, l, ix, ly + 2.1 + j*3.2, {size:2.1, weight:400, f:"sans", color:C3.ink, p:oQ(k3(t, 4.0 + j*.5, 4.9 + j*.5))}) });
    var ky = ly + ll.length*3.2 + 2;
    b.lines.forEach(function(wd, j){ v3Fill(c, ix, ky + j*3.4, (R.w - 8)*wd/100*oQ(k3(t, 5.0 + j*.3, 5.8 + j*.3)), .9, C3.line) });
    var cyt = R.y1 - 8, tx = ix, ti2 = Math.floor(k3(t, 6.0, 8) * 3), j2;
    b.tones.forEach(function(tn, j){
      var on = j === (ti2 > 2 ? 2 : ti2), w = v3Measure(c, tn.toUpperCase(), {size:1.5, weight:600, f:"sans", sp:.2}) + 4;
      c.save(); c.globalAlpha = ioC(k3(t, 5.6, 6.2)); c.strokeStyle = on ? C3.ink : C3.line; c.lineWidth = .22; if(on){ c.fillStyle = C3.ink; c.fillRect(tx, cyt, w, 4.2) } c.strokeRect(tx, cyt, w, 4.2); c.restore();
      v3Text(c, tn.toUpperCase(), tx + 2, cyt + 2.9, {size:1.5, weight:600, f:"sans", sp:.2, color:on ? "#fff" : C3.mut, alpha:ioC(k3(t, 5.6, 6.2))});
      tx += w + 1.6;
    });
  }
}

/* kampanjen: samma mall i tre format */
function bFmts(c, G, t, b, F){
  var R = L(G), th = TH(true), H = G.H;
  v3Fill(c, 0, 0, 100, H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  kick(c, b.k, R.x0, R.y0 + 8, th.acc, "l", t, .3);
  var hf = fit(c, b.h, R.w, 2, [6.6, 5.8, 5]); head(c, hf.lines, R.x0, R.y0 + 11.2, hf.size, "#fff", "l", t, .5);
  var fh = R.is9 ? 29 : 25, fr = [[4, 5, "4:5", "Inlägg"], [1, 1, "1:1", "Kvadrat"], [9, 16, "9:16", "Story"]], tw = 0, gap = 4;
  fr.forEach(function(f){ tw += fh*f[0]/f[1] }); tw += gap*2;
  var x = (100 - tw)/2, y = R.cy - fh/2 + 6;
  fr.forEach(function(f, i){
    var w = fh*f[0]/f[1], ti = 1.0 + i*.5, pa = oQ(k3(t, ti, ti + .9));
    c.save(); c.globalAlpha = pa; v3Shadow(c, [x, y + (1 - pa)*3, w, fh], .5, 2.4);
    v3Photo(c, hp(b.m), x, y + (1 - pa)*3, w, fh, {scale:1.08}); c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = .22; c.strokeRect(x, y + (1 - pa)*3, w, fh);
    v3Fill(c, x, y + fh*.55 + (1 - pa)*3, w, fh*.45, "#0e0e0d", 0); c.restore();
    v3Text(c, f[2], x + w/2, y + fh + 5.4, {size:2.2, weight:600, f:"sans", sp:.2, color:"#fff", align:"c", alpha:pa});
    v3Text(c, f[3].toUpperCase(), x + w/2, y + fh + 8.8, {size:1.3, weight:500, f:"sans", sp:.26, color:th.soft, align:"c", alpha:pa});
    x += w + gap;
  });
  if(b.s) sub(c, b.s, R.x0, R.y1 - subH(c, b.s, 2.4, 80) + 1, th.soft, "l", t, 3.0, 2.1, 80);
}

/* kampanjen: fyra faser, fyra mallar */
function bPhases(c, G, t, b, F){
  var R = L(G), th = TH(false), H = G.H;
  v3Fill(c, 0, 0, 100, H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  kick(c, b.k, R.x0, R.y0 + 8, th.acc, "l", t, .3);
  var hf = fit(c, b.h, R.w, 2, [6.6, 5.8, 5]), y = head(c, hf.lines, R.x0, R.y0 + 11.2, hf.size, th.ink, "l", t, .5) + 5;
  var ph = [["kommande", "Kommande"], ["tillsalu", "Till salu"], ["sald", "Såld"]], pw = 26.4, ph2 = pw*1.25, i;
  ph.forEach(function(p, i){
    var ti = 1.0 + i*.5, pa = oQ(k3(t, ti, ti + .9)), cx = 8 + i*(pw + 2.4), cy = R.cy - ph2/2 + 4;
    c.save(); c.globalAlpha = pa; v3Shadow(c, [cx, cy + (1 - pa)*3, pw, ph2], .2, 2);
    v3Post(c, "overlay", p[0], null, cx, cy + (1 - pa)*3, pw, ph2/pw, 1); c.restore();
    v3Text(c, p[1].toUpperCase(), cx + pw/2, cy + ph2 + 4.4, {size:1.5, weight:600, f:"sans", sp:.26, color:th.ink, align:"c", alpha:pa});
  });
}

/* planritning: väggar ritas, möbler placeras och mäts */
function bPlan(c, G, t, b, F){
  var R = L(G), th = TH(false), H = G.H;
  v3Fill(c, 0, 0, 100, H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  kick(c, b.k, R.x0, R.y0 + 8, th.acc, "l", t, .3);
  var hf = fit(c, b.h, R.w, 2, [6.6, 5.8, 5]), y = head(c, hf.lines, R.x0, R.y0 + 11.2, hf.size, th.ink, "l", t, .5) + 5;
  var bw = 76, bh = R.is9 ? 54 : 44, bx = 12, by = y + 3;
  c.save(); c.strokeStyle = C3.ink; c.lineWidth = .9; c.lineJoin = "miter";
  var wp = oQ(k3(t, .6, 2.2)), per = 2*(bw + bh);
  c.setLineDash([per*wp, per]); c.strokeRect(bx, by, bw, bh); c.restore();
  var wx = bx + bw*.58; v3VLine(c, wx, by, by + bh*.55, C3.ink, .7, oQ(k3(t, 1.8, 2.8)), 1);
  v3Line(c, bx, wx, by + bh*.55, C3.ink, .7, 0, 1);
  c.save(); c.globalAlpha = oQ(k3(t, 2.2, 3)); c.strokeStyle = C3.ink; c.lineWidth = .7; c.beginPath(); c.moveTo(wx - bw*.58, by + bh*.55); c.lineTo(wx, by + bh*.55); c.stroke(); c.restore();
  var fur = [[.07, .12, 22, 9, 0, "Soffa"], [.46, .12, 9, 14, 1.2, "Bord"], [.64, .12, 20, 15, 2.0, "Säng"], [.07, .66, 14, 9, 1.0, "Fåtölj"]];
  fur.forEach(function(f, i){
    var ti = 3.0 + i*.6, pp = oQ(k3(t, ti, ti + 1.0)), fx = bx + bw*f[0], fy = by + bh*f[1] + (1 - pp)*-7, rot = (1 - pp)*.6*(i % 2 ? 1 : -1);
    c.save(); c.globalAlpha = pp; c.translate(fx + f[2]/2, fy + f[3]/2); c.rotate(rot); c.fillStyle = "rgba(110,114,102,.18)"; c.strokeStyle = C3.oli; c.lineWidth = .4;
    c.fillRect(-f[2]/2, -f[3]/2, f[2], f[3]); c.strokeRect(-f[2]/2, -f[3]/2, f[2], f[3]); c.restore();
    v3Text(c, f[5].toUpperCase(), fx + f[2]/2, fy + f[3]/2 + .6, {size:1.2, weight:500, f:"sans", sp:.2, color:C3.oli, align:"c", alpha:pp});
  });
  var dm = oQ(k3(t, 5.6, 6.6)), dy = by + bh + 5;
  v3Line(c, bx, bx + bw, dy, C3.oli, .22, dm, 1); v3VLine(c, bx, dy - 1.4, dy + 1.4, C3.oli, .22, dm, 1); v3VLine(c, bx + bw, dy - 1.4, dy + 1.4, C3.oli, .22, dm, 1);
  v3Text(c, "MÅTT", 50, dy + 4.4, {size:1.4, weight:600, f:"sans", sp:.3, color:C3.oli, align:"c", alpha:dm});
  if(b.s) sub(c, b.s, R.x0, R.y1 - subH(c, b.s, 2.4, 80) + 1, th.soft, "l", t, 4.6, 2.1, 80);
}

/* solbanan: fyra bågar, solen följer en */
function bSun(c, G, t, b, F){
  var R = L(G), th = TH(true), H = G.H;
  v3Fill(c, 0, 0, 100, H, th.bg);
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  kick(c, b.k, R.x0, R.y0 + 8, th.acc, "l", t, .3);
  var hf = fit(c, b.h, R.w, 2, [6.6, 5.8, 5]); head(c, hf.lines, R.x0, R.y0 + 11.2, hf.size, "#fff", "l", t, .5);
  var gy = R.cy + 14, rx = 40, hs = [26, 20, 12, 7], seas = b.items;
  var order = [3, 0, 2, 1]; /* vinter, vår, höst, sommar */
  c.save(); c.strokeStyle = "rgba(255,255,255,.3)"; c.lineWidth = .3; c.beginPath(); c.moveTo(R.x0, gy); c.lineTo(R.x1, gy); c.stroke(); c.restore();
  var i;
  for(i = 0; i < 4; i++){
    var idx = [1, 0, 2, 3][i], pa = oQ(k3(t, .8 + i*.3, 2.2 + i*.3)), hh = [20, 26, 15, 8][i];
    c.save(); c.strokeStyle = i === 0 ? C3.olil : "rgba(255,255,255,.22)"; c.lineWidth = i === 0 ? .55 : .25; c.setLineDash([.7, .9]);
    c.beginPath(); c.ellipse(50, gy, rx, hh, 0, Math.PI, Math.PI + Math.PI*pa); c.stroke(); c.restore();
  }
  /* solen på sommarbågen, långsamt */
  var sp = ioC(k3(t, 1.6, b.dur - .8)), ang = Math.PI + Math.PI*sp, sx = 50 + Math.cos(ang)*rx, sy = gy + Math.sin(ang)*26;
  var glow = c.createRadialGradient(sx, sy, 0, sx, sy, 8); glow.addColorStop(0, "rgba(152,160,136,.55)"); glow.addColorStop(1, "rgba(152,160,136,0)");
  c.save(); c.globalAlpha = k3(t, 1.0, 1.8); c.fillStyle = glow; c.fillRect(sx - 8, sy - 8, 16, 16); c.fillStyle = "#fff"; c.beginPath(); c.arc(sx, sy, 1.5, 0, 7); c.fill(); c.restore();
  /* skuggan växer och krymper på marken */
  var sl = Math.abs(Math.cos(ang))*22 + 3;
  c.save(); c.globalAlpha = .35*k3(t, 1.2, 2); c.fillStyle = "#000"; c.fillRect(sx < 50 ? 50 + 1 : 50 - 1 - sl*.3, gy + .6, sl*.3, 1.6); c.restore();
  seas.forEach(function(s, j){
    var xx = j === 3 ? R.x1 : R.x0 + j*(R.w/3), pa = ioC(k3(t, 2.6 + j*.35, 3.4 + j*.35));
    v3Text(c, s.toUpperCase(), xx, gy + 9, {size:1.8, weight:600, f:"sans", sp:.28, color:"#fff", align:j === 3 ? "r" : "l", alpha:pa});
  });
  if(b.s) sub(c, b.s, R.x0, R.y1 - subH(c, b.s, 2.4, 80) + 1, th.soft, "l", t, 3.6, 2.1, 80);
}

/* områdeskartan: stiliserat läge med nålar */
function bMap(c, G, t, b, F){
  var R = L(G), th = TH(false), H = G.H;
  v3Fill(c, 0, 0, 100, H, "#E3DED9");
  tag(c, R, F, th, ioC(k3(t, .2, .8)));
  var mx = 8, my = R.y0 + 4, mw = 84, mh = H - G.bot - my - 24;
  c.save(); c.beginPath(); c.rect(mx, my, mw, mh); c.clip();
  v3Fill(c, mx, my, mw, mh, "#ECE8E5");
  c.fillStyle = "rgba(110,154,107,.28)"; c.beginPath(); c.ellipse(mx + mw*.2, my + mh*.28, 17, 12, .3, 0, 7); c.fill();
  c.fillStyle = "rgba(152,170,180,.34)"; c.beginPath(); c.ellipse(mx + mw*.92, my + mh*.8, 24, 15, -.4, 0, 7); c.fill();
  c.strokeStyle = "#fff"; c.lineWidth = 2.4; c.lineCap = "round";
  var rd = [[0, .3, 1, .55], [.3, 0, .55, 1], [0, .8, .7, .6], [.8, 0, .72, .5], [.1, 1, .9, .1]], i;
  rd.forEach(function(r, i){
    var p = oQ(k3(t, .3 + i*.2, 1.6 + i*.2)); c.beginPath(); c.moveTo(mx + mw*r[0], my + mh*r[1]); c.lineTo(mx + mw*(r[0] + (r[2] - r[0])*p), my + mh*(r[1] + (r[3] - r[1])*p)); c.stroke();
  });
  c.strokeStyle = "rgba(28,28,30,.12)"; c.lineWidth = .2; for(i = 0; i < 9; i++){ c.beginPath(); c.moveTo(mx + mw*i/8, my); c.lineTo(mx + mw*i/8, my + mh); c.stroke() }
  c.restore();
  var pins = [[.2, .28, 0], [.8, .24, 1], [.3, .74, 2], [.78, .7, 3]], cxh = mx + mw*.52, cyh = my + mh*.5;
  var pk = oQ(k3(t, 1.2, 2.2));
  c.save(); c.globalAlpha = pk; c.fillStyle = C3.ink; c.beginPath(); c.arc(cxh, cyh, 2.1*pk, 0, 7); c.fill(); c.strokeStyle = C3.ink; c.lineWidth = .3;
  var pr = (t*.5)%1; c.globalAlpha = pk*(1 - pr)*.6; c.beginPath(); c.arc(cxh, cyh, 2.1 + pr*8, 0, 7); c.stroke(); c.restore();
  pins.forEach(function(p, i){
    var ti = 2.2 + i*.5, pa = oBack(k3(t, ti, ti + .7)), px = mx + mw*p[0], py = my + mh*p[1], lb = b.items[p[2]] || "";
    c.save(); c.globalAlpha = k3(t, ti, ti + .4); c.fillStyle = C3.oli; c.beginPath(); c.arc(px, py, 1.4*pa, 0, 7); c.fill(); c.restore();
    v3Text(c, lb.toUpperCase(), px, py + 4.6, {size:1.4, weight:600, f:"sans", sp:.22, color:C3.ink, align:"c", alpha:k3(t, ti + .2, ti + .7)});
  });
  var y = my + mh + 6; kick(c, b.k, R.x0, y, th.acc, "l", t, .8);
  var hf = fit(c, b.h, R.w, 2, [5.8, 5, 4.4]); head(c, hf.lines, R.x0, y + 1.6, hf.size, th.ink, "l", t, 1.0);
}

var BEATS = {photo:bPhoto, quiet:bQuiet, list:bList, stats:bStats, split:bSplit, chain:bChain, product:bProduct, cta:bCta, orbit:bOrbit, merge:bMerge, write:bWrite, fmts:bFmts, phases:bPhases, plan:bPlan, sun:bSun, map:bMap};

/* ---------- filmerna: scener per kapitel ---------- */
var SC = {
 viewly:[
  {t:"photo", m:"hero", k:"Viewly", h:"Bostadspresentation", s:"byggd för hur bostäder marknadsförs idag.", dur:3.6},
  {t:"quiet", h:"Ett objekt är inte en fotografering.", em:"Det är en presentation.", dur:3.6},
  {t:"list", k:"Tjänsterna", h:"Sju delar.", s:"Var och en står för sig. Tillsammans blir de en annons.", items:["Fotografering","3D visning","E-styling","Atmosphere","Drönarfotografering","Områdeskarta","Motion"], dur:5.4, step:.5},
  {t:"photo", m:"kitchen", k:"Grunden", h:"Foto är grunden.", s:"Resten bygger på den.", dur:3.4},
  {t:"product", m:"portal", fy:.55, zoom:1.12, k:"Portalen", h:"Allt om bostaden på ett ställe.", s:"Boka, följ produktionen, hämta materialet.", dur:3.8},
  {t:"cta", h:"Upptäck Viewly", s:"viewly.se", dur:2.8}],
 foto:[
  {t:"photo", m:"hero", k:"Fotografering", h:"Bostadsfotografering", dur:3.4},
  {t:"quiet", h:"Ljus.", em:"Vi väntar in det.", s:"Vi lägger inte till det.", dur:3.6},
  {t:"photo", m:"kitchen", dur:2.8},
  {t:"photo", m:"boucle", k:"Detalj", h:"Det som gör ett hus till ett hem.", s:"Textur, material, slitage, ljus.", dur:3.8},
  {t:"list", k:"Omfattning", h:"Inget fast antal.", s:"Vi levererar alla bilder som tillför värde.", items:["Lägenhet — 15–35 bilder","Villa — 25–50 bilder","Leverans 1–3 dagar","Från 1 800 kr exkl. moms"], dur:5.2, step:.6},
  {t:"cta", h:"Fotograferingen är början.", s:"Se hela ekosystemet", dur:2.8}],
 visning:[
  {t:"photo", m:"matterport", k:"3D visning", h:"Alltid öppen", s:"Bostaden går att uppleva när som helst, av vem som helst, var som helst.", dur:4},
  {t:"quiet", h:"Ingen bokad visning.", em:"Bostaden är öppen 06:40 och 23:20.", s:"Spekulanten går in när det passar hen.", dur:3.8},
  {t:"product", m:"threed", k:"I visningen", h:"Gå igenom varje rum.", s:"Dollhouse ovanifrån, planvy med mått och en rundvandring i egen takt.", dur:4},
  {t:"chain", k:"Så går det till", h:"Från skanning till länk.", now:2, items:[["Boka skanning","En timme på plats, samma besök som fotograferingen."],["Produktion","Modellen byggs och sidan sätts i kontorets uttryck."],["Länken publiceras","1–3 arbetsdagar. Delas i annons, mejl och SMS."]], dur:6.4},
  {t:"cta", h:"Bostaden är alltid öppen.", s:"3D visning", dur:2.8}],
 estyling:[
  {t:"photo", m:"esLivAft", k:"E-styling", h:"Starkare presentation", dur:3.4},
  {t:"quiet", h:"Vi skapar liv i tomma rum.", em:"Utan att flytta en vägg.", dur:3.6},
  {t:"split", m:["esLivBef","esLivAft"], la:"Före", lb:"Efter", k:"E-styling", h:"Vardagsrum", dur:4.6},
  {t:"split", m:["esBedBef","esBedAft"], la:"Före", lb:"Efter", k:"E-styling", h:"Sovrum", dur:4.6},
  {t:"list", k:"Så går det till", h:"Tre steg.", s:"Digital inredning anpassad efter svensk bostadsmarknad.", items:["Ladda upp bilderna","Välj stil och paket","Annonsklart på 1–3 dagar"], dur:4.8, step:.7},
  {t:"cta", h:"Bostadens fulla potential.", s:"Alltid ärligt mot rummet.", dur:2.8}],
 atmosphere:[
  {t:"photo", m:"skyAft", k:"Atmosphere", h:"Rätt förutsättningar", s:"Ge bostaden rätt förutsättningar att göra intryck.", dur:3.8},
  {t:"quiet", h:"Vädret får inte bestämma.", s:"Bostaden fotograferas ofta när förutsättningarna är som sämst.", dur:3.8},
  {t:"split", m:["skyBef","skyAft"], la:"Dag", lb:"Skymning", k:"Effekt 01", h:"Skymning", dur:4.6},
  {t:"split", m:["vadBef","vadAft"], la:"Grått", lb:"Blå himmel", k:"Effekt 02", h:"Blå himmel", dur:4.6},
  {t:"quiet", h:"Inga möbler flyttas.", em:"Bara ljus, väder och årstid.", s:"Annonsklara bilder inom 1–3 arbetsdagar.", dur:3.8},
  {t:"cta", h:"Ge annonsen wow-faktorn.", s:"Atmosphere", dur:2.8}],
 dronare:[
  {t:"photo", m:"drone", k:"Drönarfotografering", h:"Upplev från luften", dur:3.6},
  {t:"quiet", h:"Marken visar bostaden.", em:"Luften visar läget.", dur:3.6},
  {t:"photo", m:"drone", pos:[.5, .3], k:"Vad bilderna visar", h:"Läge, tomt och omgivning.", s:"Ett perspektiv marken inte kan ge.", dur:3.8},
  {t:"list", k:"Leverans", h:"Bilder och klipp.", s:"Efterbearbetade och klara att publicera.", items:["Flygbilder för Hemnet","Korta klipp för sociala","Flygning enligt regelverk","Leverans 1–3 dagar"], dur:5.2, step:.6},
  {t:"cta", h:"Boka flygning", s:"Drönarfotografering", dur:2.8}],
 omradeskarta:[
  {t:"photo", m:"drone", k:"Områdeskarta", h:"Läget", s:"Läget, servicen och sammanhanget.", dur:3.4},
  {t:"quiet", h:"Köparen väljer inte bara bostad.", em:"Hen väljer läge.", dur:3.6},
  {t:"map", k:"Kartan", h:"En stiliserad karta.", items:["Kommunikationer","Skolor","Service","Natur"], dur:6.2},
  {t:"quiet", k:"Leverans", h:"Högupplöst PNG.", s:"Inom 1–2 arbetsdagar. Ett elegant komplement till bostadsannonsen.", dark:false, dur:3.8},
  {t:"cta", h:"Placera bostaden i sitt sammanhang.", s:"Områdeskarta", dur:2.8}],
 motion:[
  {t:"photo", m:"dining", k:"Motion", h:"En film. Byggd av era bilder.", s:"Ingen extra fotografering — bilderna blir video.", dur:3.8},
  {t:"quiet", h:"En annons som spekulanter sparar,", em:"delar och kommer tillbaka till.", dur:3.8},
  {t:"stats", k:"Effekten, mätt", h:"Rörlig bild presterar.", items:["31% fler sparningar","44% mer visningsintresse","76% fler delningar","350%+ fler videoöppningar i galleriet"], s:"Branschdata för videoannonserade bostäder.", dur:6.2},
  {t:"fmts", m:"dining", k:"Format", h:"En film. Tre format. Samtidigt.", s:"Inget tillval — alla tre ingår i varje beställning.", dur:5},
  {t:"cta", h:"Sätt bostaden i rörelse.", s:"Beställ Motion", dur:2.8}],
 annonsen:[
  {t:"photo", m:"kitchen", k:"Annonsskrivaren", h:"Annonsen", s:"skriven på trettio sekunder.", dur:3.4},
  {t:"quiet", h:"Färdig bostadsannons", em:"på 30 sekunder.", s:"Fyll i bostaden. Ladda upp bilderna.", dur:3.6},
  {t:"write", k:"Annonsskrivaren", h:"Från sex bilder till färdig text.", ims:["hero","kitchen","living","dining2","boucle","eames"], title:"Ljuset som gör skillnad", lead:"Fyra rum med genomgående planlösning och eftermiddagssol rakt in i vardagsrummet.", lines:[97,100,88,64], tones:["Saklig","Varm","Exklusiv"], dur:9},
  {t:"quiet", h:"Utkastet är ditt att ändra.", s:"Ingenting publiceras automatiskt. Du redigerar, kortar och godkänner.", dark:false, dur:3.8},
  {t:"cta", h:"Objektbeskrivningen", s:"är inte längre en flaskhals.", dur:2.8}],
 kampanjen:[
  {t:"photo", m:"hero", k:"Social / Ads Studio", h:"Ett objekt", s:"En komplett kampanj.", dur:3.4},
  {t:"quiet", h:"Kontorets egna mallar.", s:"Obegränsat antal, i valfritt format. Designen är satt — innehållet fylls i åt dig.", dur:3.8},
  {t:"fmts", m:"hero", k:"Format", h:"Ett objekt, alla format.", s:"Samma mall exporterar samtliga. Instagram, Facebook och LinkedIn.", dur:5},
  {t:"phases", k:"Kampanjfaser", h:"Mallar per fas. En kampanj.", dur:5.6},
  {t:"cta", h:"Ett objekt.", s:"Hela kampanjen.", dur:2.8}],
 planritning:[
  {t:"photo", m:"living", k:"Planritningen", h:"En planritning som lever.", s:"Möbler, mått och solljus — innan första visningen.", dur:3.8},
  {t:"quiet", h:"Inte en skiss.", em:"En kalibrerad yta.", s:"Varje vägg och varje möbel har sitt verkliga mått.", dur:3.8},
  {t:"plan", k:"Planritningen", h:"Möbler i rätt skala.", s:"Skandinaviskt, japanskt, italienskt — kuraterat, inte generiskt.", dur:7.6},
  {t:"list", k:"Tre frågor", h:"Det spekulanten faktiskt undrar.", s:"En planritning som svarar, inte bara visar.", items:["Får möbeln plats?","Hur möbleras rummet bäst?","När får bostaden sol?"], dur:4.8, step:.7},
  {t:"cta", h:"En planritning.", s:"Möblerad, mätt, i rätt ljus.", dur:2.8}],
 mobler:[
  {t:"photo", m:"eames", k:"Möblera rätt", h:"Dra in. Vrid. Mät.", s:"Möblera planritningen som om du redan stod i rummet.", dur:3.8},
  {t:"quiet", h:"Måttbandet.", em:"Inbyggt i varje möbel.", s:"Vrid en soffa nittio grader och se direkt om den får plats.", dur:3.8},
  {t:"plan", k:"Planritningen", h:"Från tom yta till möblerat rum.", s:"Allt kalibrerat mot bostadens verkliga mått.", dur:7.6},
  {t:"chain", k:"Så går det till", h:"Välj. Placera. Mät.", items:[["Välj möbel","Sök i biblioteket eller bläddra per rum."],["Placera och vrid","Dra möbeln på plats, rotera den fritt."],["Mät","Avstånd och ytor räknas ut automatiskt."]], dur:6, dark:true},
  {t:"cta", h:"Möblera det.", s:"Innan du frågar om det går.", dur:2.8}],
 solbana:[
  {t:"photo", m:"dining2", k:"Solbanan", h:"Solen, exakt som den går.", s:"Astronomiskt beräknad efter bostadens egna koordinater.", dur:3.8},
  {t:"quiet", h:"Samma metod.", em:"Som arkitekten använder.", s:"Inte en uppskattning — en beräkning.", dur:3.6},
  {t:"sun", k:"Fyra årstider", h:"Ett klick byter säsong.", items:["Vår","Sommar","Höst","Vinter"], s:"Samma bostad, fyra helt olika ljusförhållanden.", dur:7.4},
  {t:"quiet", h:"Morgonsolen i köket.", em:"Eller kvällssolen på balkongen.", dur:3.8},
  {t:"cta", h:"Se ljuset.", s:"Innan du flyttar in.", dur:2.8}],
 systemet:[
  {t:"quiet", h:"Mer tid för affären.", em:"Mindre tid i mappar.", dur:3.8},
  {t:"product", m:"portal", fy:.55, zoom:1.12, k:"Mäklarportalen", h:"Ett ställe för hela bostaden.", s:"Boka, följ, hämta, publicera.", dur:4},
  {t:"chain", k:"Flödet", h:"Fyra steg.", s:"Från bokning till publicerad kampanj.", items:[["Boka","Beställ i portalen."],["Produktion","Foto, 3D, styling och karta."],["Leverans","Allt material samlat."],["Publicera","Kampanjen ut i alla format."]], dur:6.8},
  {t:"merge", k:"Administrationen", h:"Från sex kontakter till en yta.", before:["Fotograf","Filmare","3D-leverantör","Stylist","Textbyrå","Annonsverktyg"], plate:"Mäklarportalen", after:["En beställning","Ett arbetsflöde","En leverans","En faktura"], dur:9.4},
  {t:"product", m:"portal", fy:.6, zoom:1.12, k:"Samlat", h:"En faktura. Ett konto.", s:"Beställning, mallar, material och fakturering på samma ställe.", dur:4},
  {t:"cta", h:"Ett ställe.", s:"Hela produktionen.", dur:2.8}],
 ekosystem:[
  {t:"quiet", h:"Ett objekt.", em:"Hela bostadsaffären.", s:"Viewly är inte sju tjänster bredvid varandra. Det är en kedja där varje steg gör nästa enklare.", dur:4.6},
  {t:"orbit", k:"Grundmaterialet", dir:"in", h:"Allt börjar i bostaden.", items:["Fotografering","3D visning","Drönare","E-styling","Atmosphere"], s:"Fem produktioner, ett besök.", dur:5.4},
  {t:"orbit", k:"Förädlingen", dir:"out", h:"Samma objekt, vidare.", items:["Planritning","Motion","Områdeskarta","Annonstext","Social / Ads"], s:"Ingenting produceras om.", dur:5.4},
  {t:"chain", k:"Arbetsflödet", h:"Fem steg, en beställning.", now:4, items:[["Intagning","Objektets uppgifter samlas in en gång."],["Produktion","Foto, 3D, styling och karta i samma besök."],["Mäklarportalen","Allt material samlas färdigt för publicering."],["Annonsskrivaren","Objektbeskrivningen skrivs ur underlaget."],["Social / Ads Studio","Kampanjen distribueras i alla format."]], s:"Du beställer i steg ett och hämtar i steg fem.", dur:7.2},
  {t:"merge", k:"Administrationen", h:"Från sex kontakter till en yta.", before:["Fotograf","Filmare","3D-leverantör","Stylist","Textbyrå","Annonsverktyg"], plate:"Mäklarportalen", after:["En beställning","Ett arbetsflöde","En leverans","En faktura"], dur:9.4},
  {t:"cta", h:"Ett objekt.", s:"Hela marknadsföringen.", dur:2.8}]
};

/* ---------- sätter ihop komposition och ljud ---------- */
var TR = .9;
/* ---------- ändrade texter (sparas i webbläsaren) ---------- */
var HX = {};
try { HX = JSON.parse(localStorage.getItem("viewly.hl.tx") || "{}") || {} } catch(e){ HX = {} }
function hxSave(){ try { localStorage.setItem("viewly.hl.tx", JSON.stringify(HX)) } catch(e){} }
var LINES = {items:1, before:1, after:1, tones:1};
function beatOf(id, i){
  var b = SC[id][i], o = HX[id] && HX[id][i]; if(!o) return b;
  var r = {}, k; for(k in b) r[k] = b[k]; for(k in o) r[k] = o[k]; return r;
}
function toLines(v){ return (v || []).map(function(x){ return Array.isArray(x) ? x.join(" | ") : x }).join("\n") }
function fromLines(txt, orig){
  var ls = String(txt).split("\n").filter(function(l){ return l.trim() }), pair = orig && Array.isArray(orig[0]);
  return ls.map(function(l, j){
    if(!pair) return l.trim();
    var p = l.split("|"); return [p[0].trim(), (p[1] || "").trim()];
  });
}
window.hlSetText = function(key, val){
  var p = key.split("|"), id = p[0], i = +p[1], f = p[2], b = SC[id][i];
  if(!HX[id]) HX[id] = {}; if(!HX[id][i]) HX[id][i] = {};
  HX[id][i][f] = LINES[f] ? fromLines(val, b[f]) : val;
  hxSave();
};
window.hlReset = function(){ HX = {}; hxSave() };
function chapter(id){ return HL.filter(function(h){ return h.id === id })[0] }
window.V3_HL = [];
window.HL_BEATS = BEATS;
Object.keys(SC).forEach(function(id){
  var ch = chapter(id); if(!ch) return;
  var F = {num:ch.num, name:ch.name}, beats = SC[id].map(function(_, i){ return beatOf(id, i) }), starts = [], acc = 0;
  beats.forEach(function(b){ starts.push(acc); acc += b.dur });
  var outroAt = acc, raw = outroAt + 4.4;
  var comp = {n:ch.label, d:ch.q + " — " + beats.length + " scener", group:"hl", dur:raw, thumb:Math.min(starts[Math.min(2, beats.length - 1)] + 2.4, outroAt - .5), id:id, v:{id:id}};
  comp.draw = function(c, G, t, o){
    var i = 0; while(i + 1 < beats.length && t >= starts[i + 1]) i++;
    var bt = t >= outroAt ? beats.length - 1 : i, lt = t - starts[bt], b = beatOf(id, bt), prev = bt > 0 ? bt - 1 : -1;
    if(t >= outroAt) lt = beats[bt].dur + (t - outroAt);
    if(prev >= 0 && lt < TR){
      var pb = beatOf(id, prev); BEATS[pb.t](c, G, pb.dur + lt, pb, F);
      var e = ioC(k3(lt, 0, TR)); if(e <= .002) return; c.save(); c.beginPath();
      if(bt % 2) c.rect(0, G.H*(1 - e), 100, G.H*e + .1); else c.rect(0, 0, 100*e + .1, G.H);
      c.clip();
      BEATS[b.t](c, G, lt, b, F); c.restore();
    } else BEATS[b.t](c, G, lt, b, F);
    if(t >= outroAt) v3Outro(c, G, o.outro, t - outroAt);
  };
  var chords = [], whoosh = [], pop = [], n = beats.length;
  beats.forEach(function(b, i){
    chords.push([starts[i], i + 1 < n ? starts[i + 1] : outroAt, [0, 1, 1, 2, 2, 3, 0][Math.min(6, Math.floor(i*7/n))] % 3]);
    if(i > 0) whoosh.push(starts[i] - .05);
    var k = b.items ? b.items.length : b.before ? b.before.length + b.after.length : 0, st = b.step || .6, j;
    for(j = 0; j < k; j++) pop.push(starts[i] + 1.1 + j*st);
  });
  chords.push([outroAt, raw, 0]); whoosh.push(outroAt - .05);
  comp.audio = v3Cues(1, {chords:chords, whoosh:whoosh, tap:[], pop:pop, chime:[starts[n - 1] + .5], riser:[[outroAt - 1.6, 1.5]], sub:outroAt + .1, tail:raw});
  V3_COMPS["hl_" + id] = comp; V3_HL.push("hl_" + id);
});

/* ---------- sidan ---------- */
function hlCards(){
  return '<div class="a3cards">' + V3_HL.map(function(id){
    var c2 = V3_COMPS[id];
    return '<button type="button" class="a3card" data-a3="comp" data-v="' + id + '" aria-current="' + (V3S.comp === id) + '">'
      + '<div class="a3cth">' + v3Canvas("comp:" + id + ":916:" + c2.thumb, 270) + '</div>'
      + '<div class="a3ctl"><i>' + c2.dur.toFixed(0) + ' s · 9:16 och 4:5 · ljud</i><b>' + esc(c2.n) + '</b><span>' + esc(c2.d) + '</span></div></button>';
  }).join("") + '</div>';
}
var FLAB = {k:"Etikett", h:"Rubrik", em:"Kursiv rad", s:"Text under", la:"Före-etikett", lb:"Efter-etikett", title:"Annonsrubrik", lead:"Annonstext", plate:"Plattan", items:"Rader (en per rad)", before:"Före (en per rad)", after:"Efter (en per rad)", tones:"Tonlägen (en per rad)"};
var FORDER = ["k", "h", "em", "s", "la", "lb", "title", "lead", "items", "before", "plate", "after", "tones"];
var TLAB = {photo:"Bild", quiet:"Text", list:"Lista", stats:"Siffror", split:"Före / efter", chain:"Steg", product:"Produktbild", cta:"Avslutande rad", orbit:"Delarna runt objektet", merge:"Sex blir en", write:"Annonsskrivaren", fmts:"Tre format", phases:"Mallar per fas", plan:"Planritning", sun:"Solbana", map:"Karta"};
function hlEditor(id){
  var chp = chapter(id.replace("hl_", "")), html = "";
  SC[id.replace("hl_", "")].forEach(function(b0, i){
    var b = beatOf(id.replace("hl_", ""), i), fs = FORDER.filter(function(f){ return b0[f] !== undefined || ({photo:"k h s", quiet:"k h em s", cta:"h s", product:"k h s"}[b0.t] || "").split(" ").indexOf(f) >= 0 });
    html += '<div class="a3hxb"><div class="a3hxh"><span class="mono">' + (i + 1) + '</span> ' + esc(TLAB[b0.t] || b0.t) + '</div>' + fs.map(function(f){
      var key = id.replace("hl_", "") + "|" + i + "|" + f, v = b[f];
      if(LINES[f] || f === "lead" || (f === "s" && String(v).length > 60)) return '<label class="a3f"><span>' + esc(FLAB[f]) + '</span><textarea rows="' + (LINES[f] ? Math.min(7, (v || []).length + 1) : 3) + '" data-a3hx="' + key + '">' + esc(LINES[f] ? toLines(v) : String(v || "")) + '</textarea></label>';
      return '<label class="a3f"><span>' + esc(FLAB[f]) + '</span><input type="text" value="' + esc(String(v == null ? "" : v)) + '" data-a3hx="' + key + '"></label>';
    }).join("") + '</div>';
  });
  return '<details class="a3det a3cust" open><summary>Ändra texterna i den här filmen</summary><p class="a3hint">Ändringarna syns direkt och sparas i webbläsaren. Rubrikerna anpassar sin storlek efter längden. Tomt fält döljer raden. Steg skrivs som <b>Titel | beskrivning</b>.</p><div class="a3hxs">' + html + '</div></details>';
}
function hlOutroEditor(){
  var f = v3TxField;
  return '<details class="a3det a3cust" open><summary>Ändra slutkortets text (gäller alla filmer)</summary><div class="a3custg"><div>' + f("outro.tag1", "Slagord rad 1") + f("outro.tag2", "Slagord rad 2 (kursiv)") + '</div><div>' + f("outro.aud", "Målgruppsrad") + f("outro.url", "Adress / länk") + '<button type="button" class="a3mini" data-a3="reset" style="margin-top:6px">Återställ allt</button></div></div></details>';
}
window.secAds4 = function(){
  if(V3_HL.indexOf(V3S.comp) < 0){ V3S.comp = "hl_systemet"; V3S.t = V3_COMPS.hl_systemet.thumb; V3S.playing = false; v3StopSound() }
  var comp = V3_COMPS[V3S.comp], outs = V3_OUT.map(function(o){ return v3Seg("outro", o.id, o.n, V3S.outro === o.id) }).join("");
  setTimeout(v3Mount, 0);
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Highlights · 12</div><h2>Highlight-videor</h2>'
    + '<p>En kort film per kapitel, byggd av kapitlens egna rader och bilder, i Viewlys färger och med samma slutkort som annonserna. Systemet och Ekosystemet är störst. Video i 9:16, och 4:5 för flödet. Förslag, inget publicerat.</p></div>'
    + hlCards()
    + '<div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w45") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '"></div>'
    + '<span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Story · 9:16", V3S.fmt === "916") + v3Seg("fmt", "45", "Flöde · 4:5", V3S.fmt === "45") + '</div>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Slutkort</div><div class="a3segs col">' + outs + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + (V3S.fmt === "916" ? "9:16 · 1080 × 1920" : "4:5 · 1080 × 1350") + ' · med ljud</button>'
    + '<button class="a3seg dl" type="button" data-a3="wav">Ljud · WAV</button></div></div></div>'
    + hlEditor(V3S.comp) + hlOutroEditor()
    + '<details class="a3det"><summary>Underlag och vad som inte är klart</summary><div class="a3und"><div><b>Text</b><p>Allt som står i filmerna är kapitlens egna rader ur Highlights, kortade. Siffrorna i Motion är branschdata från viewly.se/bostadsfilm, som kapitlet anger. Inga nya påståenden.</p></div>'
    + '<div><b>Bilder</b><p>Filmerna använder bibliotekets egna bilder. Skärmbilder av portalen, planritningen och kartan finns inte i biblioteket (se <i>need</i> i kapitlen), så de scenerna är ritade förenklat och ska bytas mot riktiga skärmar. Bilderna är 648 × 1152 px och blir något mjuka i 1080-bredd.</p></div>'
    + '<div><b>Ljud</b><p>Syntetiserat piano, samma som annonserna. Jag har inte hört det; lyssna innan ni använder det.</p></div></div></details></div>';
};
})();
