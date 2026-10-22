/* =====================================================================
   SIDA 14 — VARUMÄRKESFILM "VERKTYG"

   Manuset bär filmen. Berättarrösten (Arthur) läser det rad för rad,
   musiken (Over) är motorn, och klippen och fotografierna är de som
   ni själva hämtat. Allt annat ritas här.

   Tiderna i sekunder följer manuset: SHOTS är bildspåret, VO är
   rösten. Låten är förskjuten så att basen kommer vid 27 s och går ut
   vid 39 s, i tystnaden före bildspelet.
   ===================================================================== */
(function(){
var FX = window.BR_FX, DARK = "#050505", CLICK = 31.9, DUR = 39.5;

/* ---------- media ---------- */
var IMG = {f_ali:"filmAli", f_astro:"filmAstro", f_malcolm:"filmMalcolm", f_maradona:"filmMaradona", f_jordan:"filmJordan"};
Object.keys(IMG).forEach(function(k){ V3_KEYS[k] = IMG[k] });
V3_POS.f_ali = [.55, .5]; V3_POS.f_jordan = [.72, .45]; V3_POS.f_maradona = [.45, .4]; V3_POS.f_malcolm = [.62, .45]; V3_POS.f_astro = [.58, .5];
var VIDS = {tv:"media/tv.webm", earth1:"media/earth1.webm", earth2:"media/earth2.webm", rocket:"media/rocket.webm", eye:"media/eye.webm", ct:"media/ct.webm", engine:"media/engine.webm"};
var VEL = {}, MEDIA_P = null; window.__v6dbg = {VEL:VEL};
function vel(n){
  if(!VEL[n]){ var e = document.createElement("video"); e.muted = true; e.defaultMuted = true; e.playsInline = true; e.preload = "auto"; e.src = VIDS[n]; VEL[n] = e }
  return VEL[n];
}
function loadMedia(){
  if(MEDIA_P) return MEDIA_P;
  MEDIA_P = Promise.all(Object.keys(VIDS).map(function(n){
    return new Promise(function(res){
      var e = vel(n); if(e.readyState >= 2) return res();
      e.addEventListener("loadeddata", function(){ res() }, {once:true}); e.addEventListener("error", function(){ res() }, {once:true}); setTimeout(res, 20000);
    });
  }));
  return MEDIA_P;
}
function seek(e, t){
  if(!e.duration) return Promise.resolve();
  t = Math.max(0, Math.min(t, e.duration - .05));
  if(Math.abs(e.currentTime - t) < .004 && e.readyState >= 2) return Promise.resolve();
  return new Promise(function(res){
    var done = function(){ e.removeEventListener("seeked", done); res() };
    e.addEventListener("seeked", done); e.currentTime = t; setTimeout(done, 2500);
  });
}
/* var klipp visas, från vilken sekund i klippet, i vilken fart, och hur länge sista bilden hålls */
/* bildspåret: a–b är när skottet syns, from/speed är var i klippet och hur fort det spelas, z är inzoomningen, zw skalar den för 16:9 */
var SHOTS = [
  {k:"tv", a:0, b:3.4, v:"tv", from:0, speed:1, z:[2.1, 1.3]},
  {k:"astro", a:3.3, b:4.6},
  {k:"clip", a:4.5, b:5.9, v:"engine", from:.3, speed:1, z:[1, 1.08], pos:[.5, .6]},
  {k:"clip", a:5.8, b:7.4, v:"rocket", from:0, speed:1, z:[1.05, 1.12], pos:[.5, .5], out:.2},
  {k:"icons", a:7.6, b:12.4},
  {k:"clip", a:12.9, b:16.9, v:"eye", from:.3, speed:1, z:[1, 1.1], pos:[.46, .5], out:.2},
  {k:"show", a:17.7, b:23.2},
  {k:"clip", a:24.1, b:28.6, v:"earth1", from:.6, speed:1, z:[1, 1.05], pos:[.5, .6], dim:true, out:.4, color:true},
  {k:"ui", a:27.3, b:30.1}
];
var SHOWCLIPS = [];
function clipTime(c, t){ return c.from + Math.max(0, Math.min(t, c.b) - c.a)*c.speed }
/* vid uppspelning går klippen på riktigt, vid skrubbning och export söks varje bildruta fram */
function prep(t){
  return loadMedia().then(function(){
    var live = window.V3S && V3S.playing, jobs = [];
    SHOTS.concat(SHOWCLIPS).forEach(function(c){
      if(!c.v) return;
      var e = vel(c.v), on = t >= c.a - .15 && t < c.b + .35;
      if(live){
        if(!on){ if(!e.paused) e.pause(); return }
        var want = clipTime(c, t); e.playbackRate = c.speed;
        if(e.paused){ e.currentTime = want; var pr = e.play(); if(pr && pr.catch) pr.catch(function(){}) }
        else if(Math.abs(e.currentTime - want) > .3) e.currentTime = want;
      } else {
        if(on) jobs.push(seek(e, clipTime(c, t)));
        else if(!e.paused) e.pause();
      }
    });
    return Promise.all(jobs);
  });
}
function vcover(c, name, x, y, w, h, o){
  o = o || {}; var e = vel(name); if(!e.videoWidth) return;
  var sc = o.scale || 1, pos = o.pos || [.5, .5], iw = e.videoWidth, ih = e.videoHeight, s = Math.max(w/iw, h/ih)*sc, dw = iw*s, dh = ih*s;
  var dx = x - (dw - w)*pos[0], dy = y - (dh - h)*pos[1];
  c.save(); c.globalAlpha = c.globalAlpha*(o.alpha == null ? 1 : o.alpha); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.drawImage(e, dx, dy, dw, dh); c.restore();
}
var BLUR = {};
function blurBg(c, G, key, a){
  var im = V3.img[key]; if(!im || !im.naturalWidth) return;
  var cv = BLUR[key];
  if(!cv){ cv = BLUR[key] = document.createElement("canvas"); cv.width = 18; cv.height = 32; cv.getContext("2d").drawImage(im, 0, 0, 18, 32) }
  c.save(); c.globalAlpha = a; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high"; c.drawImage(cv, -4, -4, 108, G.H + 8); c.restore();
}

/* ---------- gemensamma delar ---------- */
function frameRect(G){
  var w = 86, h = Math.min(w*1.25, G.H - 2*G.top*.55 - 6), x = (100 - w)/2, y = (G.H - h)/2 - (G.is9 ? 6 : 0);
  return [x, y, w, h];
}
/* ett fotografi med vit kant: inre ritas av fn(x, y, w, h) */
function print(c, r, border, rot, fn){
  var b = border, cx = r[0] + r[2]/2, cy = r[1] + r[3]/2;
  c.save(); c.translate(cx, cy); c.rotate(rot || 0); c.translate(-cx, -cy);
  if(b > .05){
    c.save(); c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 4; c.shadowOffsetY = 1; c.fillStyle = "#f4f1ec"; c.fillRect(r[0] - b, r[1] - b, r[2] + 2*b, r[3] + 2*b + b*.9); c.restore();
  }
  c.save(); c.beginPath(); c.rect(r[0], r[1], r[2], r[3]); c.clip(); fn(r[0], r[1], r[2], r[3]); c.restore();
  c.restore();
}
function mixR(a, b, p){ return [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p), lerp(a[3], b[3], p)] }
function fit(key, maxW, maxH){
  var im = V3.img[key]; if(!im || !im.naturalWidth) return [maxW, maxH];
  var s = Math.min(maxW/im.naturalWidth, maxH/im.naturalHeight); return [im.naturalWidth*s, im.naturalHeight*s];
}

/* ---------- undertexter, två–tre ord i taget, som i förebilden ---------- */
/* rösten: fil, start, längd och text. Klippt i de verkliga pauserna mellan meningarna */
var VO = [
  ["w02", 1.4, 3.74, "Hundratals miljoner människor håller andan."],
  ["w04", 7.6, 4.91, "Genom historien har det alltid funnits människor som vågat drömma större."],
  ["w05", 12.9, 3.89, "Som ser möjligheter där andra ser begränsningar."],
  ["w08", 17.8, 2.43, "Det är så gränser flyttas."],
  ["w09", 20.55, 2.43, "Och människor gör skillnad."],
  ["w10", 24.3, 4.55, "Men ingen har någonsin förverkligat sina största drömmar…"],
  ["w11a", 29.9, 1.28, "Utan rätt"],
  ["w11b", CLICK - .11, 1.07, "verktyg."]];
var SUBS = VO.map(function(v){ return {t0:v[1], d:v[2], txt:v[3]} }).concat([
  {t0:0, d:0, txt:"Upptäck verktygen", btn:1},
  {t0:0, d:0, txt:"viewly.se", url:1},
  {t0:0, d:0, txt:"För fastighetsmäklare.", tag:1}]);
var IDX = {btn:SUBS.length - 3, url:SUBS.length - 2, tag:SUBS.length - 1};
var SX = {};
try { SX = JSON.parse(localStorage.getItem("viewly.film.tx") || "{}") || {} } catch(e){ SX = {} }
function sxSave(){ try { localStorage.setItem("viewly.film.tx", JSON.stringify(SX)) } catch(e){} }
window.flmSetText = function(k, v){ SX[k] = v; sxSave() };
window.flmReset = function(){ SX = {}; sxSave() };
function subText(i){ return SX[i] != null ? SX[i] : SUBS[i].txt }
function chunks(txt){
  var ws = String(txt).split(/\s+/).filter(Boolean), out = [], cur = [];
  ws.forEach(function(w){
    cur.push(w);
    var end = /[.?!…]$/.test(w);
    if(end || cur.length >= 3){ out.push(cur.join(" ")); cur = [] }
  });
  if(cur.length) out.push(cur.join(" "));
  /* en ensam kort bit slås ihop med föregående */
  if(out.length > 1 && out[out.length - 1].split(" ").length === 1 && out[out.length - 2].split(" ").length < 3){ var l = out.pop(); out[out.length - 1] += " " + l }
  return out;
}
function subtitles(c, G, t){
  var i, s, ch, tot, acc, k, y = G.H - G.bot - (G.is9 ? 3.2 : 4.6);
  for(i = 0; i < SUBS.length; i++){
    s = SUBS[i]; if(s.btn || s.url || s.tag || t < s.t0 || t >= s.t0 + s.d + .25) continue;
    ch = chunks(subText(i)); if(!ch.length) continue;
    tot = ch.join("").length; acc = 0;
    for(k = 0; k < ch.length; k++){
      var a0 = s.t0 + s.d*acc/tot, a1 = s.t0 + s.d*(acc + ch[k].length)/tot; acc += ch[k].length;
      if(k === ch.length - 1) a1 = s.t0 + s.d + .25;
      if(t >= a0 && t < a1){
        v3Text(c, ch[k], 50, y, {size:G.is9 ? 3.9 : 3.2, weight:600, f:"sans", sp:.04, color:"#fff", align:"c", shadow:true, alpha:Math.min(1, (t - a0)/.07)});
      }
    }
  }
}

/* ---------- skotten ---------- */
function shotAlpha(t, s){
  var a = s.a === 0 ? 1 : ioC(k3(t, s.a, s.a + (s.fi || .3)));
  if(s.out) a *= 1 - ioC(k3(t, s.b - s.out, s.b));
  return a;
}
/* månlandningen på tv: i stående format börjar apparaten litet i mörkret och kameran går in mot skärmen */
function tvShot(c, G, t, s, a){
  var H = G.H, e = vel(s.v); if(!e.videoWidth) return;
  var u = k3(t, s.a, s.b), vw = e.videoWidth, vh = e.videoHeight;
  c.save(); c.globalAlpha = c.globalAlpha*a;
  if(G.is9){
    var w = 100*lerp(s.z ? s.z[0] : 1, s.z ? s.z[1] : 2.1, ioC(u)), h = w*vh/vw;
    c.drawImage(e, 50 - .47*w, H*.46 - .48*h, w, h);
  } else {
    var sc = Math.max(100/vw, H/vh)*lerp(1.12, 1.0, u), dw = vw*sc, dh = vh*sc;
    c.drawImage(e, 50 - dw*.5, H/2 - dh*.5, dw, dh);
  }
  c.restore();
  var vg = c.createRadialGradient(50, H/2, H*.25, 50, H/2, H*.8); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0," + (.5*a) + ")"); c.fillStyle = vg; c.fillRect(0, 0, 100, H);
}
/* nervceller som tänds i takt med hjärtslagen, med signaler som löper längs trådarna */
var NEU = null;
function neurons(){
  if(NEU) return NEU;
  var sd = 4711, rnd = function(){ sd = (sd*1664525 + 1013904223) >>> 0; return sd/4294967296 }, n = 64, pts = [], i, j;
  for(i = 0; i < n; i++){ var a = rnd()*Math.PI*2, r = Math.sqrt(rnd()); pts.push({x:Math.cos(a)*r, y:Math.sin(a)*r*.86, d:Math.hypot(Math.cos(a)*r, Math.sin(a)*r)}) }
  var ed = [];
  for(i = 0; i < n; i++){ var ds = []; for(j = 0; j < n; j++) if(j !== i) ds.push([Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y), j]); ds.sort(function(a, b){ return a[0] - b[0] }); for(j = 0; j < 2; j++) ed.push([i, ds[j][1]]) }
  NEU = {pts:pts, ed:ed}; return NEU;
}
function neuronLayer(c, G, t, s, a0){
  var N = neurons(), H = G.H, cx = 50, cy = H*.47, R = Math.min(36, H*.4);
  var a = a0*ioC(k3(t, s.a + .5, s.a + 1.2))*(1 - ioC(k3(t, s.b - .5, s.b)));
  if(a <= 0) return;
  var wave = function(d){ var ph = ((t - s.a)/.9 - d*.8) % 1; if(ph < 0) ph += 1; return Math.pow(Math.max(0, 1 - ph*2.4), 2) };
  c.save(); c.globalAlpha = a*.9; c.globalCompositeOperation = "lighter";
  N.ed.forEach(function(e){
    var p = N.pts[e[0]], q = N.pts[e[1]], l = Math.max(wave(p.d), wave(q.d));
    c.strokeStyle = "rgba(255,255,255," + (.07 + .4*l) + ")"; c.lineWidth = .09 + .08*l; c.beginPath(); c.moveTo(cx + p.x*R, cy + p.y*R); c.lineTo(cx + q.x*R, cy + q.y*R); c.stroke();
    if(l > .12){ var f = 1 - Math.min(1, l*1.1), sx = cx + lerp(p.x, q.x, f)*R, sy = cy + lerp(p.y, q.y, f)*R; c.fillStyle = "rgba(255,255,255," + (.8*l) + ")"; c.beginPath(); c.arc(sx, sy, .38, 0, 7); c.fill() }
  });
  N.pts.forEach(function(p){
    var l = wave(p.d), x = cx + p.x*R, y = cy + p.y*R;
    c.fillStyle = "rgba(255,255,255," + (.3 + .7*l) + ")"; c.beginPath(); c.arc(x, y, .3 + .7*l, 0, 7); c.fill();
    if(l > .25){ var g = c.createRadialGradient(x, y, 0, x, y, 3.4); g.addColorStop(0, "rgba(255,255,255," + .55*l + ")"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(x - 3.4, y - 3.4, 6.8, 6.8) }
  });
  c.restore();
}

/* ---------- ikonerna, tryckta på kopior av sig själva, och bildspelet ---------- */
var ICONN = 4;
var ICONS = [["f_ali", [.55, .5], 1], ["f_jordan", [.85, .65], 1.4], ["f_maradona", [.45, .4], 1], ["f_malcolm", [.62, .45], 1], ["f_astro", [.56, .5], 1]];
/* ett foto med vit kant, centrerat i cx, cy; k skalar storleken */
function cardPrint(c, G, i, o){
  var H = G.H, s = ICONS[i], key = s[0], f = fit(key, 86*o.k, Math.min(G.is9 ? 112 : 96, H - 8)*o.k);
  c.save(); c.globalAlpha = c.globalAlpha*(o.a == null ? 1 : o.a); c.translate(o.cx, o.cy); c.scale(o.sc, o.sc); c.translate(-o.cx, -o.cy);
  print(c, [o.cx - f[0]/2, o.cy - f[1]/2, f[0], f[1]], 2.1*o.k, o.rot, function(x, y, w, h){ v3Photo(c, key, x, y, w, h, {pos:s[1], scale:s[2]*o.zoom}) });
  c.restore();
}
function iconCard(c, G, i, rot, sc, zoom, bgA){
  var H = G.H;
  blurBg(c, G, ICONS[i][0], bgA);
  cardPrint(c, G, i, {cx:50, cy:G.is9 ? H/2 - 3 : H/2, sc:sc, rot:rot, zoom:zoom, k:1});
}
/* månlandarens foto landar som en polaroid */
function astroShot(c, G, t, s){
  v3Fill(c, 0, 0, 100, G.H, DARK);
  var land = oBack(k3(t, s.a, s.a + .3));
  iconCard(c, G, 4, lerp(-.05, -.008, land), lerp(1.2, 1, Math.min(1, land)), lerp(1, 1.07, k3(t, s.a, s.b)), .55);
}
function iconScene(c, G, t, s){
  var n = ICONN, per = (s.b - s.a)/n, k = Math.min(n - 1, Math.floor((t - s.a)/per)), t0 = s.a + k*per, u = k3(t, t0, t0 + per), land = oBack(k3(t, t0, t0 + .3));
  v3Fill(c, 0, 0, 100, G.H, DARK);
  if(t < s.b) iconCard(c, G, k, lerp(((k*7) % 5 - 2)*.03, ((k*7) % 5 - 2)*.006, Math.min(1, land)), lerp(1.22, 1, Math.min(1, land)), lerp(1, 1.08, u), .5*oQ(k3(t, t0, t0 + .24)) + .1);
}
var SHOWT = (function(){ var a = 17.7, b = 23.1, n = 16, r = .86, arr = [], k; for(k = 0; k <= n; k++) arr.push(a + (b - a)*(1 - Math.pow(r, k))/(1 - Math.pow(r, n))); return arr })();
/* bildspelet: foton och korta klipp om vartannat, tätare och tätare */
var SHOWQ = [0, 2, 4, 1, "engine", 3, 0, 2, "rocket", 4, 1, "earth2", 3, 0, 4, 2];
var SHOWSRC = {engine:[.3, 1], rocket:[0, .5], earth2:[1, 1]};
SHOWQ.forEach(function(q, k){ if(typeof q === "string") SHOWCLIPS.push({v:q, a:SHOWT[k], b:SHOWT[k + 1] + .12, from:SHOWSRC[q][0], speed:SHOWSRC[q][1]}) });
var PILE = [[-17, -30, -.07], [19, -34, .06], [-22, 27, .05], [23, 31, -.06], [-3, -44, .03], [-27, -2, -.05], [27, 3, .07], [2, 45, -.04]];
function showScene(c, G, t, s){
  v3Fill(c, 0, 0, 100, G.H, DARK);
  var k = 0; while(k < SHOWT.length - 2 && t >= SHOWT[k + 1]) k++;
  var q = SHOWQ[k], u = k3(t, SHOWT[k], SHOWT[k + 1]), H = G.H;
  if(t >= s.b) return;
  /* varje klipp slår till: en kort inzoomning och en liten skakning */
  var pu = Math.pow(1 - k3(t, SHOWT[k], SHOWT[k] + .16), 2), shx = Math.sin(k*91.7)*1.3*pu, shy = Math.cos(k*53.3)*1.3*pu, ps = 1 + .07*pu;
  c.save(); c.translate(50 + shx, H/2 + shy); c.scale(ps, ps); c.translate(-50, -H/2);
  if(typeof q === "string"){
    vcover(c, q, 0, 0, 100, H, {scale:lerp(1.04, 1.12, u), pos:q === "earth2" ? [.35, .5] : [.5, .55]});
    var vg = c.createRadialGradient(50, H/2, H*.2, 50, H/2, H*.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.6)"); c.fillStyle = vg; c.fillRect(0, 0, 100, H);
  } else {
    blurBg(c, G, ICONS[q][0], .45);
    /* korten från tidigare klipp ligger kvar som en växande hög bakom */
    var d, j, kx = G.is9 ? 1 : 1.7, ky = G.is9 ? 1 : .32, cy0 = G.is9 ? H/2 - 3 : H/2, nPile = k < 5 ? 0 : Math.min(7, k - 3);
    for(d = nPile; d >= 1; d--){
      j = k - d; if(j < 0 || typeof SHOWQ[j] === "string") continue;
      var pp = PILE[j % 8];
      cardPrint(c, G, SHOWQ[j], {cx:50 + pp[0]*kx, cy:cy0 + pp[1]*ky, sc:1, rot:pp[2], zoom:1.02, k:G.is9 ? .5 : .45, a:.82});
    }
    cardPrint(c, G, q, {cx:50, cy:cy0, sc:lerp(1.03, 1, oQ(k3(t, SHOWT[k], SHOWT[k] + .1))), rot:(q - 2)*.008, zoom:lerp(1.02, 1.07, u), k:1});
  }
  c.restore();
}

/* ---------- inne i systemet: en lugn gränssnittsrörelse ---------- */
function rr(c, x, y, w, h, r){ c.beginPath(); if(c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h) }
function uiScene(c, G, t, s){
  var H = G.H, u = (t - s.a)*2.85/(s.b - s.a), W = G.is9 ? 84 : 70, gw = (W - 10 - 2*3)/3, gh = G.is9 ? gw*1.2 : gw*.72, Hh = 45 + gh, x = (100 - W)/2, y = G.cy - Hh/2 - (G.is9 ? 2 : 0), i;
  var bgA = ioC(k3(u, 0, .4));
  v3Fill(c, 0, 0, 100, H, "#050505", bgA);
  var A = ioC(k3(u, 0, .45))*(1 - ioC(k3(u, 2.5, 2.85)));
  if(A <= 0) return;
  var sc = lerp(.95, 1.03, ioC(k3(u, 0, 2.85)));
  c.save(); c.translate(50, G.cy); c.scale(sc, sc); c.translate(-50, -G.cy + (1 - ioC(k3(u, 0, .45)))*2.5);
  c.save(); c.globalAlpha = A; c.shadowColor = "rgba(255,255,255,.07)"; c.shadowBlur = 8; c.fillStyle = "#0e0e0e"; rr(c, x, y, W, Hh, 3.2); c.fill(); c.restore();
  c.save(); c.globalAlpha = A*.9; c.strokeStyle = "rgba(255,255,255,.13)"; c.lineWidth = .18; rr(c, x, y, W, Hh, 3.2); c.stroke(); c.restore();
  v3Text(c, "NY KAMPANJ", x + 5, y + 7.2, {size:1.45, weight:600, f:"sans", sp:.32, color:"rgba(255,255,255,.55)", alpha:A});
  var step = u < .95 ? 0 : u < 1.95 ? 1 : 2;
  for(i = 0; i < 3; i++){ c.save(); c.globalAlpha = A*(i <= step ? 1 : .3); c.fillStyle = i <= step ? C3.olil : "#fff"; c.beginPath(); c.arc(x + W - 5 - (2 - i)*2.6, y + 6.6, .6, 0, 7); c.fill(); c.restore() }
  var gy = y + 12, px, ti, en, ck;
  for(i = 0; i < 3; i++){
    px = x + 5 + i*(gw + 3); ti = .2 + i*.25; en = oQ(k3(u, ti, ti + .3));
    c.save(); c.globalAlpha = A*en; c.save(); rr(c, px, gy, gw, gh, 1.6); c.clip();
    var gr = c.createLinearGradient(0, gy, 0, gy + gh); gr.addColorStop(0, i === 1 ? "#4a4a46" : "#3a3a37"); gr.addColorStop(.62, i === 2 ? "#2a2a28" : "#1f1f1e"); gr.addColorStop(1, "#111"); c.fillStyle = gr; c.fillRect(px, gy, gw, gh);
    var rg = c.createRadialGradient(px + gw*(.3 + i*.2), gy + gh*.3, 0, px + gw*(.3 + i*.2), gy + gh*.3, gw*.9); rg.addColorStop(0, "rgba(255,255,255,.2)"); rg.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = rg; c.fillRect(px, gy, gw, gh);
    c.restore(); c.strokeStyle = "rgba(255,255,255,.14)"; c.lineWidth = .15; rr(c, px, gy, gw, gh, 1.6); c.stroke(); c.restore();
    ck = oBack(k3(u, ti + .3, ti + .55));
    if(ck > 0){ c.save(); c.globalAlpha = A*Math.min(1, ck); c.fillStyle = C3.olil; c.beginPath(); c.arc(px + gw - 2.6, gy + 2.6, 1.5*Math.max(0, ck), 0, 7); c.fill(); c.strokeStyle = "#0a0a0a"; c.lineWidth = .28; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(px + gw - 3.3, gy + 2.7); c.lineTo(px + gw - 2.7, gy + 3.3); c.lineTo(px + gw - 1.8, gy + 2); c.stroke(); c.restore() }
  }
  var cy2 = gy + gh + 5.2, labs = ["Kommande", "Till salu", "Såld"], cw = (W - 10 - 2*2.4)/3;
  for(i = 0; i < 3; i++){
    px = x + 5 + i*(cw + 2.4); en = oQ(k3(u, 1.0 + i*.25, 1.25 + i*.25));
    c.save(); c.globalAlpha = A; c.strokeStyle = "rgba(255,255,255," + (.18 + .1*en) + ")"; c.lineWidth = .16; rr(c, px, cy2, cw, 6.2, 3.1); c.stroke(); c.restore();
    c.save(); c.globalAlpha = A*en; c.fillStyle = "#f1eee8"; rr(c, px, cy2, cw, 6.2, 3.1); c.fill(); c.restore();
    v3Text(c, labs[i], px + cw/2, cy2 + 3.9, {size:1.9, weight:600, f:"sans", sp:.04, color:en > .5 ? "#0a0a0a" : "rgba(255,255,255,.6)", align:"c", alpha:A});
  }
  var by = cy2 + 10.5, pr = ioC(k3(u, .2, 1.75));
  v3Line(c, x + 5, x + W - 5, by, "rgba(255,255,255,.14)", .22, 1, A);
  v3Line(c, x + 5, x + 5 + (W - 10)*pr, by, "#fff", .3, 1, A);
  var ra = ioC(k3(u, 1.75, 2.1));
  v3Text(c, "Din kampanj är klar", x + 5, by + 6.4 + (1 - ra)*1.2, {size:3.0, weight:400, color:"#fff", alpha:A*ra});
  c.restore();
}

/* ---------- knappen ---------- */
function btnPath(c, cx, cy, bw, bh){
  c.beginPath(); c.moveTo(cx - bw/2 + bh/2, cy - bh/2); c.arcTo(cx + bw/2, cy - bh/2, cx + bw/2, cy + bh/2, bh/2); c.arcTo(cx + bw/2, cy + bh/2, cx - bw/2, cy + bh/2, bh/2); c.arcTo(cx - bw/2, cy + bh/2, cx - bw/2, cy - bh/2, bh/2); c.arcTo(cx - bw/2, cy - bh/2, cx + bw/2, cy - bh/2, bh/2); c.closePath();
}
/* slutet som i förebilden: knappen trycks, adressen står där knappen var, en rad, och loggan sätts ihop */
var END_T2 = 2.3, END_T3 = 4.1;
function endLogo(c, G, t, u){
  var cy = G.cy, capH = G.is9 ? 6.2 : 4.4, mh = capH*1.55, mw = mh*858.6/756.3, fs = capH/.7, gap = capH*.95;
  var wo = {size:fs, weight:500, f:"sans", sp:.2, color:"#fff"}, ww = v3Measure(c, "VIEWLY", wo), tot = mw + gap + ww, x0 = 50 - tot/2;
  /* ett mjukt sken bakom när märket låser */
  var g = ioC(k3(u, .55, .9))*(1 - ioC(k3(u, .9, 1.9)));
  if(g > 0){ var gr = c.createRadialGradient(x0 + mw/2, cy, 0, x0 + mw/2, cy, mh*1.6); gr.addColorStop(0, "rgba(255,255,255," + (.22*g) + ")"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, 100, G.H) }
  var mx = x0 + mw/2, my = cy;
  c.save(); c.translate(mx, my); c.rotate(-1.25*(1 - oQ(k3(u, 0, .95)))); var sc = lerp(.45, 1, oBack(k3(u, 0, .85))); c.scale(sc, sc); c.translate(-mx, -my);
  v3Mark(c, x0, my - mh/2, mh, "#fff", C3.olil, {reveal:ioC(k3(u, .05, .8)), dot:oBack(k3(u, .75, 1.05)), alpha:ioC(k3(u, 0, .25))});
  c.restore();
  var by = cy + capH/2 + capH*.02, wx = x0 + mw + gap, i, str = "VIEWLY", x = wx;
  for(i = 0; i < str.length; i++){
    var lp = oQ(k3(u, .75 + i*.07, .75 + i*.07 + .45));
    v3Text(c, str[i], x, by, {size:fs, weight:500, f:"sans", color:"#fff", p:lp, rise:capH*.5});
    x += c.measureText(str[i]).width + .2*fs;
  }
}
function buttonScene(c, G, t){
  var H = G.H, cx = 50, cy = G.cy, w = G.is9 ? 66 : 46, h = G.is9 ? 10.4 : 7.6, ts = h*.3;
  if(t < CLICK - .96) return;
  var u = oQ(k3(t, CLICK - .95, CLICK - .5)), press = k3(t, CLICK - .1, CLICK)*(1 - k3(t, CLICK + .08, CLICK + .26)), gone = ioC(k3(t, CLICK + .14, CLICK + .42));
  v3Fill(c, 0, 0, 100, H, "#050505", u);
  if(gone < 1){
    var bw = w*(1 - .05*press), bh = h*(1 - .05*press), a = u*(1 - gone);
    c.save(); c.translate(cx, cy); c.scale(1 + .05*gone, 1 + .05*gone); c.translate(-cx, -cy);
    c.save(); c.globalAlpha = a; c.shadowColor = "rgba(255,255,255," + (.18 + .08*Math.sin(t*5)) + ")"; c.shadowBlur = 7; c.shadowOffsetY = 1.2;
    var bg = c.createLinearGradient(0, cy - bh/2, 0, cy + bh/2); bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "#cfcfcf");
    c.fillStyle = bg; btnPath(c, cx, cy, bw, bh); c.fill(); c.restore();
    v3Text(c, subText(IDX.btn), cx, cy + ts*.34, {size:ts, weight:500, f:"sans", sp:.02, color:"#0a0a0a", align:"c", alpha:a});
    c.restore();
    var cp = ioC(k3(t, CLICK - .8, CLICK - .08)), curX = lerp(106, cx + w*.21, cp), curY = lerp(H - (G.is9 ? 20 : 8), cy + h*.33, cp) - Math.sin(cp*Math.PI)*4;
    v3Cursor(c, curX, curY, press, k3(t, CLICK - .8, CLICK - .55)*(1 - k3(t, CLICK + .3, CLICK + .55)));
    v3Tap(c, cx + w*.21, cy + h*.33, k3(t, CLICK - .02, CLICK + .5));
  }
  /* adressen tar knappens plats */
  var T2 = CLICK + END_T2, T3 = CLICK + END_T3, ts2 = G.is9 ? 6.4 : 4.6;
  var aA = ioC(k3(t, CLICK + .45, CLICK + .9))*(1 - ioC(k3(t, T2 - .3, T2)));
  if(aA > 0) v3Text(c, subText(IDX.url), cx, cy + ts2*.34 - (1 - ioC(k3(t, CLICK + .45, CLICK + .9)))*-1.2 - ioC(k3(t, T2 - .3, T2))*1.2, {size:ts2, weight:500, f:"sans", sp:.01, color:"#fff", align:"c", alpha:aA});
  var aB = ioC(k3(t, T2, T2 + .45))*(1 - ioC(k3(t, T3 - .3, T3)));
  if(aB > 0) v3Text(c, subText(IDX.tag), cx, cy + ts2*.3 + (1 - ioC(k3(t, T2, T2 + .45)))*1.2 - ioC(k3(t, T3 - .3, T3))*1.2, {size:ts2*.8, weight:500, f:"sans", sp:.01, color:"#fff", align:"c", alpha:aB});
  if(t >= T3) endLogo(c, G, t, t - T3);
}

/* ---------- hela filmen ---------- */
function draw(c, G, t, o){
  var H = G.H;
  v3Fill(c, 0, 0, 100, H, DARK);
  SHOTS.forEach(function(s){
    if(t < s.a || t >= s.b + .35) return;
    var a = shotAlpha(t, s), z, zz;
    if(a <= 0) return;
    if(s.k === "clip" || s.k === "ct"){
      zz = s.z[0]; z = lerp(s.z[0], s.z[1], k3(t, s.a, s.b))*(G.is9 || !s.zw ? 1 : s.zw);
      vcover(c, s.v, 0, 0, 100, H, {scale:z, pos:s.pos, alpha:a});
      if(s.dim) v3Fill(c, 0, 0, 100, H, "#000", a*.6*ioC(k3(t, s.a + 1, s.b)));
      if(s.k === "ct") neuronLayer(c, G, t, s, a);
      if(s.k === "clip" && (s.v === "eye" || s.v === "rocket" || s.v === "engine")){ var vg = c.createRadialGradient(50, H/2, H*.2, 50, H/2, H*.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0," + (.55*a) + ")"); c.fillStyle = vg; c.fillRect(0, 0, 100, H) }
    }
    else if(s.k === "tv") tvShot(c, G, t, s, a);
    else if(s.k === "astro") astroShot(c, G, t, s);
    else if(s.k === "icons") iconScene(c, G, t, s);
    else if(s.k === "show") showScene(c, G, t, s);
    else if(s.k === "ui") uiScene(c, G, t, s);
  });
  if(t >= CLICK - 1.0) buttonScene(c, G, t);
  var bwA = 0;
  SHOTS.forEach(function(s){ if(t >= s.a && t < s.b + .35 && !s.color && s.k !== "ui") bwA = Math.max(bwA, s.k === "icons" || s.k === "show" ? 1 : shotAlpha(t, s)) });
  FX.tone(c, G, Math.min(1, bwA), .12);
    FX.finish(c, G, t, {vig:.62});
  [3.3, 4.5, 5.8, 7.6, 12.9, 17.7].forEach(function(h){ FX.flash(c, G, t, h, .4, .12) });
  SHOWT.forEach(function(h, k){ if(k > 0 && k < SHOWT.length - 1) FX.flash(c, G, t, h, .12, k % 3 === 0 ? .16 : .08) });
  FX.flash(c, G, t, CLICK, .35, .1); FX.flash(c, G, t, CLICK + END_T3 + .8, .5, .1);
  subtitles(c, G, t);
}

/* ---------- ljudet: din låt, rösten, och ljudeffekterna ---------- */
var V6 = {music:null, musicName:"", vo:[], voReady:null};
var VO_FILES = VO.map(function(v){ return ["media/vo3/" + v[0] + ".mp3", v[1]] });
var MUSIC_OFFSET = 10.6;
var MUSIC_DIPS = [[16.75, 17.65, .25, .95], [23.0, 24.1, .2, .55]];
var OUTRO_AT = 42.68, OUTRO_DELAY = .85;
function ctxAudio(){ var AC = window.AudioContext || window.webkitAudioContext; return window.__v6ac || (window.__v6ac = new AC()) }
function decode(ab){ return new Promise(function(res, rej){ var p = ctxAudio().decodeAudioData(ab, res, rej); if(p && p.then) p.then(res, rej) }) }
function loadAudio(){
  if(!V6.voReady) V6.voReady = Promise.all(VO_FILES.map(function(f, i){
    return fetch(f[0]).then(function(r){ return r.arrayBuffer() }).then(decode).then(function(b){ V6.vo[i] = b }).catch(function(){ V6.vo[i] = null });
  }));
  if(!V6.musicReady) V6.musicReady = V6.music ? Promise.resolve() : fetch("media/over.mp3").then(function(r){ return r.arrayBuffer() }).then(decode).then(function(b){ if(!V6.music){ V6.music = b; V6.musicName = "Over (inbyggd)" } }).catch(function(){});
  return Promise.all([V6.voReady, V6.musicReady]);
}
function mix(ctx, comp){
  var master = ctx.createGain(); master.gain.value = .5;
  var cmp = ctx.createDynamicsCompressor(); cmp.threshold.value = -14; cmp.ratio.value = 2.2; cmp.attack.value = .005; cmp.release.value = .2;
  var lim = ctx.createDynamicsCompressor(); lim.threshold.value = -3; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .08; lim.knee.value = 0;
  var fade = ctx.createGain(); fade.gain.setValueAtTime(1, Math.max(0, DUR - 1.6)); fade.gain.linearRampToValueAtTime(0, DUR);
  master.connect(cmp); cmp.connect(lim); lim.connect(fade); fade.connect(ctx.destination);
  var rl = Math.floor(ctx.sampleRate*2.6), ir = ctx.createBuffer(2, rl, ctx.sampleRate), ch, i;
  for(ch = 0; ch < 2; ch++){ var d = ir.getChannelData(ch); for(i = 0; i < rl; i++) d[i] = (Math.random()*2 - 1)*Math.pow(1 - i/rl, 2.5) }
  var conv = ctx.createConvolver(); conv.buffer = ir; var wet = ctx.createGain(); wet.gain.value = .28; conv.connect(wet); wet.connect(master);
  var bus = function(g, send){ var a = ctx.createGain(); a.gain.value = g == null ? 1 : g; a.connect(master); if(send){ var s = ctx.createGain(); s.gain.value = send; a.connect(s); s.connect(conv) } return a };
  var nb = function(len){ var b = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate*len)), ctx.sampleRate), dd = b.getChannelData(0), k; for(k = 0; k < dd.length; k++) dd[k] = Math.random()*2 - 1; return b };
  /* musiken, med dämpning under rösten */
  var voiceWin = [];
  VO_FILES.forEach(function(f, k){ if(V6.vo[k]) voiceWin.push([f[1], f[1] + V6.vo[k].duration]) });
  if(V6.music){
    /* före klicket: låtens början, därefter låtens slut när knappen trycks */
    var ms = ctx.createBufferSource(); ms.buffer = V6.music; var mg = ctx.createGain(); mg.gain.setValueAtTime(.95, 0);
    var inDip = function(t){ return MUSIC_DIPS.some(function(d){ return t >= d[0] - .2 && t < d[1] }) };
    voiceWin.forEach(function(w){ if(w[0] < CLICK - .3){ if(!inDip(w[0] - .15)) mg.gain.setTargetAtTime(.55, w[0] - .15, .12); if(!inDip(w[1] + .1)) mg.gain.setTargetAtTime(.95, w[1] + .1, .35) } });
    MUSIC_DIPS.forEach(function(d){ mg.gain.setTargetAtTime(d[2], d[0], .1); mg.gain.setTargetAtTime(d[3], d[1], .04) });
    mg.gain.setValueAtTime(.95, CLICK - .14); mg.gain.linearRampToValueAtTime(0, CLICK + .05);
    ms.connect(mg); mg.connect(master); ms.start(0, MUSIC_OFFSET); ms.stop(CLICK + .06);
    var mo = ctx.createBufferSource(); mo.buffer = V6.music; var og = ctx.createGain(); og.gain.setValueAtTime(0, CLICK + OUTRO_DELAY - .005); og.gain.linearRampToValueAtTime(1, CLICK + OUTRO_DELAY + .02); 
    mo.connect(og); og.connect(master); mo.start(CLICK + OUTRO_DELAY - .005, OUTRO_AT); mo.stop(DUR);
  }
  /* rösten */
  var vg = bus(1.7, .12);
  VO_FILES.forEach(function(f, k){ if(!V6.vo[k]) return; var s = ctx.createBufferSource(); s.buffer = V6.vo[k]; s.connect(vg); s.start(f[1]) });
  /* ljudeffekter */
  var shutter = function(t, v){
    var n = ctx.createBufferSource(); n.buffer = nb(.03); var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3200; bp.Q.value = 1.2; var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .025); n.connect(bp); bp.connect(g); g.connect(bus(1, .12)); n.start(t);
    var n2 = ctx.createBufferSource(); n2.buffer = nb(.05); var bp2 = ctx.createBiquadFilter(); bp2.type = "bandpass"; bp2.frequency.value = 1800; bp2.Q.value = 1; var g2 = ctx.createGain(); g2.gain.setValueAtTime(v*.8, t + .055); g2.gain.exponentialRampToValueAtTime(.001, t + .09); n2.connect(bp2); bp2.connect(g2); g2.connect(bus(1)); n2.start(t + .055);
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(85, t + .07); var g3 = ctx.createGain(); g3.gain.setValueAtTime(v*.7, t); g3.gain.exponentialRampToValueAtTime(.001, t + .09); o.connect(g3); g3.connect(bus(1)); o.start(t); o.stop(t + .1);
  };
  var thud = function(t, v){ var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(42, t + .12); var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .28); o.connect(g); g.connect(bus(1)); o.start(t); o.stop(t + .3) };
  var tick = function(t, v){ var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = 1700; var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .04); o.connect(g); g.connect(bus(1, .1)); o.start(t); o.stop(t + .05) };
  var riser = function(t, dd, v){ var n = ctx.createBufferSource(); n.buffer = nb(dd + .1); var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = .8; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(8000, t + dd); var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.exponentialRampToValueAtTime(v, t + dd*.97); g.gain.linearRampToValueAtTime(0, t + dd); n.connect(f); f.connect(g); g.connect(bus(1, .25)); n.start(t) };
  var impact = function(t, v){ var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(85, t); o.frequency.exponentialRampToValueAtTime(30, t + 1.4); var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + 2); o.connect(g); g.connect(bus(1)); o.start(t); o.stop(t + 2.1) };
  var click = function(t, v){ var o = ctx.createOscillator(); o.type = "square"; o.frequency.setValueAtTime(2200, t); o.frequency.exponentialRampToValueAtTime(700, t + .03); var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .06); o.connect(g); g.connect(bus(1)); o.start(t); o.stop(t + .08) };
  var drone = function(t, dd, v){ var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = 55; var o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = 82.5; var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dd); g.gain.linearRampToValueAtTime(0, t + dd + .4); o.connect(g); o2.connect(g); g.connect(bus(1)); o.start(t); o2.start(t); o.stop(t + dd + .5); o2.stop(t + dd + .5) };
  var piano = function(t, midi, vel, dd){ var fr = 440*Math.pow(2, (midi - 69)/12), b = ctx.createGain(); b.gain.value = vel*.34; var tf = ctx.createBiquadFilter(); tf.type = "lowpass"; tf.frequency.value = Math.min(7000, 1400 + fr*5); b.connect(tf); tf.connect(bus(1, .45));
    [1, .5, .26, .13, .07].forEach(function(a, k){ var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = fr*(k + 1); var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + .007); g.gain.setTargetAtTime(0, t + .01, dd/(1 + k*.9)/3.2); o.connect(g); g.connect(b); o.start(t); o.stop(t + dd + .3) }) };
  var rumble = function(t, dd, v){ var n = ctx.createBufferSource(); n.buffer = nb(dd + .2); var f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 130; var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dd*.6); g.gain.linearRampToValueAtTime(0, t + dd); n.connect(f); f.connect(g); g.connect(bus(1)); n.start(t) };
  var burst = function(t, dd, v){ var n = ctx.createBufferSource(); n.buffer = nb(dd + .1); var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 2400; f.Q.value = .5; var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + dd); n.connect(f); f.connect(g); g.connect(bus(1)); n.start(t) };
  burst(0, .5, .22); drone(0, 6.0, .05);
  shutter(3.3, .22); shutter(4.5, .12);
  rumble(5.2, 2.4, .35); thud(5.8, .3);
  for(i = 0; i < ICONN; i++) shutter(7.6 + i*((12.4 - 7.6)/ICONN), .2);
  for(i = 0; i < 4; i++){ thud(12.9 + i*.9, .17); thud(12.9 + i*.9 + .2, .11) }
  riser(15.4, 2.3, .07); impact(17.7, .4);
  SHOWT.forEach(function(h, k){ if(k < SHOWT.length - 1){ shutter(h, .12 + .16*k/SHOWT.length); if(k % 4 === 0) thud(h, .2) } });
  drone(24.3, CLICK - 24.3, .09); riser(29.0, 2.3, .04);
  click(CLICK, .26); thud(CLICK, .35);
  tick(CLICK + .45, .05); tick(CLICK + END_T2, .05); thud(CLICK + END_T3, .14); impact(CLICK + END_T3 + .8, .22);
}

/* ---------- komposition ---------- */
window.V3_FILM2 = [];
(function(){
  var comp = {n:"Verktyg", d:"Varumärkesfilm för mäklare. Berättare, Over, motion graphics och en knapp som öppnar verktygen.", group:"film2", dur:DUR, thumb:13, id:"fm_verktyg", v:{id:"fm_verktyg"}};
  comp.prep = prep; comp.loadAudio = loadAudio; comp.mix = mix;
  comp.draw = function(c, G, t, o){
    draw(c, G, t, o);
  };
  V3_COMPS.fm_verktyg = comp; V3_FILM2.push("fm_verktyg");
})();

/* ---------- sidan ---------- */
var SLOTS = [["tv", "Månlandningen på TV (klipp)", "vid"], ["f_astro", "Bildspelets femte bild", "img"], ["rocket", "Raket som lyfter (klipp)", "vid"], ["earth1", "Jorden som reser sig (klipp)", "vid"], ["earth2", "Jorden med solen (klipp)", "vid"], ["eye", "Öga i närbild (klipp)", "vid"], ["ct", "Hjärnskanning (klipp)", "vid"],
  ["f_ali", "Ikon 1 (bild)", "img"], ["f_jordan", "Ikon 2 (bild)", "img"], ["f_maradona", "Ikon 3 (bild)", "img"], ["f_malcolm", "Ikon 4 (bild)", "img"], ["engine", "Raketen i närbild (klipp)", "vid"]];
function slots(){
  return '<details class="a3det a3cust" open><summary>Byt bilder och klipp</summary><p class="a3hint">Välj en egen fil för en plats. Bilden eller klippet får samma bildbehandling och samma rörelse automatiskt. Filerna stannar i din webbläsare.</p><div class="a3hxs">'
    + SLOTS.map(function(s){ return '<label class="a3f"><span>' + esc(s[1]) + '</span><input type="file" accept="' + (s[2] === "img" ? "image/*" : "video/*") + '" data-a3slot="' + s[0] + '" data-kind="' + s[2] + '"></label>' }).join("") + '</div></details>';
}
function subEd(){
  return '<details class="a3det a3cust" open><summary>Ändra undertexterna och knappen</summary><p class="a3hint">Undertexterna följer rösten, två–tre ord i taget. Rösten ändras inte av texten, så ändrar du en rad behöver rösten spelas in på nytt.</p><div class="a3hxs">'
    + SUBS.map(function(s, i){ return '<label class="a3f"><span>' + (s.btn ? "Knappens text" : s.url ? "Adressen efter klicket" : s.tag ? "Raden efter adressen" : "Replik " + (i + 1) + " · " + s.t0.toFixed(1).replace(".", ",") + " s") + '</span><input type="text" value="' + esc(subText(i)) + '" data-a3fx="' + i + '"></label>' }).join("")
    + '</div></details>';
}
function outroEd(){
  var f = v3TxField;
  return '<details class="a3det a3cust" open><summary>Ändra slutkortets text</summary><div class="a3custg"><div>' + f("outro.tag1", "Slagord rad 1") + f("outro.tag2", "Slagord rad 2 (kursiv)") + '</div><div>' + f("outro.aud", "Målgruppsrad") + f("outro.url", "Adress / länk") + '<button type="button" class="a3mini" data-a3="reset" style="margin-top:6px">Återställ allt</button></div></div></details>';
}
var FIRST = true;
window.secFilm = function(){
  if(V3_FILM2.indexOf(V3S.comp) < 0){ V3S.comp = "fm_verktyg"; V3S.t = V3_COMPS.fm_verktyg.thumb; V3S.playing = false; v3StopSound() }
  if(FIRST){ FIRST = false; V3S.outro = "mork" }
  if(V3S.fmt !== "916" && V3S.fmt !== "169") V3S.fmt = "916";
  var comp = V3_COMPS[V3S.comp], outs = V3_OUT.map(function(o){ return v3Seg("outro", o.id, o.n, V3S.outro === o.id) }).join("");
  setTimeout(v3Mount, 0);
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Varumärke · 14</div><h2>Verktyg</h2>'
    + '<p>Varumärkesfilmen för mäklare: berättarrösten Arthur, din låt Over, fotografier, klipp och motion graphics. Over följer med. Förslag, inget publicerat.</p></div>'
    + '<div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w169") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '"></div>'
    + '<span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Story · 9:16", V3S.fmt === "916") + v3Seg("fmt", "169", "Bred · 16:9", V3S.fmt === "169") + '</div>'
    + '<div class="a3h">Låt</div><label class="a3f"><span id="v6music">' + (V6.music ? "Låt: " + esc(V6.musicName) + ". Byt genom att välja en annan fil." : "Over laddas in automatiskt. Eller välj en egen låt här.") + '</span><input type="file" accept="audio/*" data-a3music="1"></label>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + (V3S.fmt === "916" ? "9:16 · 1080 × 1920" : "16:9 · 1920 × 1080") + ' · med ljud</button>'
    + '<button class="a3seg dl" type="button" data-a3="wav">Ljud · WAV</button></div></div></div>'
    + subEd() + slots()
    + '<details class="a3det"><summary>Underlag, rättigheter och vad som inte är klart</summary><div class="a3und"><div><b>Musiken</b><p>Over (Drake, 2010) är en kommersiell låt. Den laddas upp av dig i webbläsaren och följer inte med sidan. För publicering krävs licens från skivbolag och förlag, eller ett annat spår.</p></div>'
    + '<div><b>Rösten</b><p>Arthur är en AI-röst. Jag har inte hört om uttalet håller som svenska, och en riktig röst kan ersätta raderna.</p></div>'
    + '<div><b>Bilderna</b><p>Bilderna på Ali, Jordan, Maradona och Malcolm X, och månlandningsbilden, kommer från dig. Rättigheter för bilderna och för personernas bild i en annons måste klaras. Jordan-bilden visar sponsorer i bakgrunden. Jordklippen är renderade.</p></div>'
    + '<div><b>Slutet</b><p>När knappen trycks tystnar musiken en stund, och sedan spelas låten från ' + String(OUTRO_AT).replace('.', ',') + ' s i ljudfilen. Det är en siffra att ändra om du vill börja någon annanstans.</p></div></div></details></div>';
};

/* ---------- händelser: ladda upp låt, byt bild eller klipp, ändra text ---------- */
document.addEventListener("change", function(e){
  var t = e.target, f = t.files && t.files[0]; if(!f) return;
  if(t.dataset.a3music){
    var rd = new FileReader(); rd.onload = function(){ decode(rd.result).then(function(b){ V6.music = b; V6.musicName = f.name; V3_AUD = {}; var el = document.getElementById("v6music"); if(el) el.textContent = "Uppladdad: " + f.name; v3Say("Låten är uppladdad: " + f.name, 3500) }, function(){ v3Say("Det gick inte att läsa ljudfilen.", 5000) }) }; rd.readAsArrayBuffer(f); return;
  }
  var slot = t.dataset.a3slot; if(!slot) return;
  var url = URL.createObjectURL(f);
  if(t.dataset.kind === "img"){ var im = new Image(); im.onload = function(){ V3.img[slot] = im; delete BLUR[slot]; V3_AUD = V3_AUD; v3Stage(); v3Say("Bytte bild.", 2500) }; im.src = url }
  else { var el = vel(slot); el.src = url; el.load(); el.addEventListener("loadeddata", function(){ v3Stage(); v3Say("Bytte klipp.", 2500) }, {once:true}) }
});
})();
