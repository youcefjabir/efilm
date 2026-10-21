/* =====================================================================
   SIDA 14 — VARUMÄRKESFILM "VERKTYG"

   Berättarrösten bär filmen, musiken (Over, uppladdad av dig) är
   motorn, och resten är motion graphics som i förebilden. Fotografier
   och klipp är de ni själva hämtat; allt annat ritas här.

   Tiden i sekunder följer låten: släppet ligger vid 28,3 s och basen
   faller vid 40,3 s. Alla tider är mätta mot de genererade röstraderna.
   ===================================================================== */
(function(){
var FX = window.BR_FX, DARK = "#050505", CLICK = 39.6, DUR = 45.8, DROP = 28.3;

/* ---------- media ---------- */
var IMG = {f_ali:"filmAli", f_astro:"filmAstro", f_malcolm:"filmMalcolm", f_maradona:"filmMaradona", f_jordan:"filmJordan"};
Object.keys(IMG).forEach(function(k){ V3_KEYS[k] = IMG[k] });
V3_POS.f_ali = [.55, .5]; V3_POS.f_jordan = [.72, .45]; V3_POS.f_maradona = [.45, .4]; V3_POS.f_malcolm = [.62, .45]; V3_POS.f_astro = [.58, .5];
var VIDS = {earth1:"media/earth1.webm", earth2:"media/earth2.webm", rocket:"media/rocket.webm", eye:"media/eye.webm", ct:"media/ct.webm", engine:"media/engine.webm"};
var VEL = {}, MEDIA_P = null;
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
var CLIPS = [
  {v:"engine", t0:7.0, t1:9.2, from:.3, speed:.85},
  {v:"rocket", t0:9.2, t1:12.1, from:0, speed:.8},
  {v:"earth1", t0:12.1, t1:13.9, from:2.4, speed:1},
  {v:"earth2", t0:13.9, t1:16.4, from:.8, speed:1},
  {v:"eye", t0:15.9, t1:19.0, from:.4, speed:1},
  {v:"ct", t0:18.3, t1:21.1, from:0, speed:.9}
];
function clipTime(c, t){ return c.from + Math.max(0, Math.min(t, c.t1) - c.t0)*c.speed }
function prep(t){
  return loadMedia().then(function(){
    var jobs = [];
    CLIPS.forEach(function(c){
      if(t >= c.t0 - .15 && t < (c.hold || c.t1) + .15) jobs.push(seek(vel(c.v), clipTime(c, t)));
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
var SUBS = [
  {t0:.6, d:5.93, txt:"Nittonhundrasextionio. Hundratals miljoner tittar på samma skärm."},
  {t0:7.0, d:4.6, txt:"Det som fastnar är ingen raket. Det är en bild."},
  {t0:12.1, d:3.4, txt:"En bild på jorden. Vårt hem."},
  {t0:16.0, d:4.96, txt:"Så fungerar vår hjärna. Den minns bilder bättre än ord."},
  {t0:21.1, d:3.92, txt:"Därför minns vi dem som nådde längre än alla andra."},
  {t0:34.2, d:2.2, txt:"Men ingen nådde dit utan rätt"},
  {t0:CLICK, d:.9, txt:"verktyg."},
  {t0:0, d:0, txt:"Upptäck verktygen", btn:1},
  {t0:0, d:0, txt:"viewly.se", url:1}];
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
    s = SUBS[i]; if(s.btn || s.url || t < s.t0 || t >= s.t0 + s.d + .25) continue;
    ch = chunks(subText(i)); if(!ch.length) continue;
    tot = ch.join("").length; acc = 0;
    for(k = 0; k < ch.length; k++){
      var a0 = s.t0 + s.d*acc/tot, a1 = s.t0 + s.d*(acc + ch[k].length)/tot; acc += ch[k].length;
      if(k === ch.length - 1) a1 = s.t0 + s.d + .25;
      if(t >= a0 && t < a1){
        v3Text(c, ch[k], 50, y, {size:3.1, weight:500, f:"sans", sp:.04, color:"#fff", align:"c", shadow:true, alpha:Math.min(1, (t - a0)/.07)});
      }
    }
  }
}

/* ---------- tv, raket, jorden, ögat ---------- */
function tvScene(c, G, t){
  var H = G.H, u = k3(t, .6, 7.0), cx = 50, cy = G.cy - 2, w = 88, h = 66;
  var on = oQ(k3(t, .6, 1.1)), zoom = lerp(1, 1.55, ioC(u));
  c.save(); c.translate(cx, cy); c.scale(zoom, zoom); c.translate(-cx, -cy);
  var g = c.createRadialGradient(50, cy, 10, 50, cy, 70); g.addColorStop(0, "rgba(120,120,120,.25)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(-30, -30, 160, H + 60);
  c.fillStyle = "#101010"; c.beginPath(); c.roundRect ? c.roundRect(cx - w/2 - 3.5, cy - h/2 - 3.5, w + 7, h + 7, 6) : c.rect(cx - w/2 - 3.5, cy - h/2 - 3.5, w + 7, h + 7); c.fill();
  var sh = h*on, sy = cy - sh/2;
  c.save(); c.beginPath(); c.roundRect ? c.roundRect(cx - w/2, sy, w, Math.max(.4, sh), 3.4) : c.rect(cx - w/2, sy, w, Math.max(.4, sh)); c.clip();
  v3Fill(c, cx - w/2, sy, w, sh, "#000");
  v3Photo(c, "f_astro", cx - w/2, cy - h/2, w, h, {scale:lerp(1.02, 1.16, u), pos:[.56, .5]});
  /* linjer, rullande band, brus */
  var yy; c.globalAlpha = .13; c.fillStyle = "#000"; for(yy = cy - h/2; yy < cy + h/2; yy += .55) c.fillRect(cx - w/2, yy, w, .22); c.globalAlpha = 1;
  var rb = ((t*.22) % 1)*(h + 14) - 7 + cy - h/2; var gr = c.createLinearGradient(0, rb - 6, 0, rb + 6); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.5, "rgba(255,255,255,.10)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(cx - w/2, rb - 6, w, 12);
  var vg = c.createRadialGradient(cx, cy, h*.25, cx, cy, h*.85); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.65)"); c.fillStyle = vg; c.fillRect(cx - w/2, cy - h/2, w, h);
  v3Fill(c, cx - w/2, cy - h/2, w, h, "#fff", .04 + .03*Math.sin(t*37));
  c.restore();
  if(on < 1) v3Fill(c, cx - w/2, cy - .25, w, .5, "#fff", (1 - on)*.9);
  c.restore();
}
function rocketScene(c, G, t){
  var H = G.H;
  v3Fill(c, 0, 0, 100, H, DARK);
  if(t < 9.2) vcover(c, "engine", 0, 0, 100, H, {scale:lerp(1.35, 1.7, k3(t, 7, 9.2)), pos:[.5, lerp(.6, .45, k3(t, 7, 9.2))]});
  else vcover(c, "rocket", 0, 0, 100, H, {scale:lerp(1.9, 2.3, k3(t, 9.2, 12.1)), pos:[.5, lerp(.55, .3, k3(t, 9.2, 12.1))]});
  var vg = c.createRadialGradient(50, H/2, H*.2, 50, H/2, H*.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.55)"); c.fillStyle = vg; c.fillRect(0, 0, 100, H);
}
function earthScene(c, G, t){
  var H = G.H, full = [0, 0, 100, H], fr = frameRect(G);
  var e = ioC(k3(t, 15.35, 16.05)), r = mixR(fr, full, e), b = lerp(2.3, 0, e);
  v3Fill(c, 0, 0, 100, H, DARK);
  print(c, r, b, lerp(-.012, 0, e), function(x, y, w, h){
    if(t < 13.9) vcover(c, "earth1", x, y, w, h, {scale:lerp(1.0, 1.12, k3(t, 12.1, 13.9)), pos:[.5, .6]});
    else vcover(c, "earth2", x, y, w, h, {scale:lerp(1.05, 1.0, k3(t, 13.9, 16.0)), pos:[.35, .5]});
  });
  /* blixt när bilden tas */
}
function vplace(c, name, x, y, w, h, scale, ux, uy, sx, sy){
  var e = vel(name); if(!e.videoWidth) return;
  var s = Math.max(w/e.videoWidth, h/e.videoHeight)*scale, dw = e.videoWidth*s, dh = e.videoHeight*s;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.drawImage(e, x + w*sx - ux*dw, y + h*sy - uy*dh, dw, dh); c.restore();
}
function eyeScene(c, G, t){
  var H = G.H, d = ioC(k3(t, 17.6, 18.9)), scale = lerp(1.08, 8, d*d), pupil = [.46, .5];
  if(t >= 16.4) v3Fill(c, 0, 0, 100, H, DARK);
  /* irisen öppnas ur jordens mitt */
  var rr = ioC(k3(t, 15.75, 16.35))*130;
  c.save(); c.beginPath(); c.arc(50, H*.48, rr, 0, 7); c.clip();
  vplace(c, "eye", 0, 0, 100, H, scale, lerp(.5, pupil[0], d), lerp(.5, pupil[1], d), .5, .5);
  c.restore();
  var ctA = ioC(k3(t, 18.35, 19.0));
  if(ctA > 0){ v3Fill(c, 0, 0, 100, H, "#000", ctA); vcover(c, "ct", 0, 0, 100, H, {scale:2.5, pos:[.5, .46], alpha:ctA*.95});
    var cm = c.createRadialGradient(50, H*.47, 30, 50, H*.47, 58); cm.addColorStop(0, "rgba(0,0,0,0)"); cm.addColorStop(1, "rgba(0,0,0," + ctA + ")"); c.fillStyle = cm; c.fillRect(0, 0, 100, H) }
  var vg = c.createRadialGradient(50, H/2, H*.2, 50, H/2, H*.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.7)"); c.fillStyle = vg; c.fillRect(0, 0, 100, H);
}
/* neuroner som tänds i takt med pulsen och till sist samlas till en jordcirkel */
var NEU = null;
function neurons(){
  if(NEU) return NEU;
  var s = 4711, rnd = function(){ s = (s*1664525 + 1013904223) >>> 0; return s/4294967296 }, n = 70, pts = [], i, j;
  for(i = 0; i < n; i++){ var a = rnd()*Math.PI*2, r = Math.sqrt(rnd()); pts.push({x:Math.cos(a)*r, y:Math.sin(a)*r, d:Math.hypot(Math.cos(a)*r, Math.sin(a)*r), ring:{x:Math.cos(i/n*Math.PI*2), y:Math.sin(i/n*Math.PI*2)}}) }
  var ed = [];
  for(i = 0; i < n; i++){ var ds = []; for(j = 0; j < n; j++) if(j !== i) ds.push([Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y), j]); ds.sort(function(a, b){ return a[0] - b[0] }); for(j = 0; j < 3; j++) ed.push([i, ds[j][1]]) }
  NEU = {pts:pts, ed:ed}; return NEU;
}
function neuronLayer(c, G, t){
  var N = neurons(), H = G.H, cx = 50, cy = H*.46, R = 34, a = ioC(k3(t, 18.2, 18.9))*(1 - ioC(k3(t, 20.8, 21.1)));
  if(a <= 0) return;
  var conv = ioC(k3(t, 19.7, 20.7)), pulse = function(d){ var ph = (t*1.15 - d*.9) % 1; if(ph < 0) ph += 1; return Math.pow(Math.max(0, 1 - ph*2.2), 2) };
  c.save(); c.globalAlpha = a;
  N.ed.forEach(function(e){
    var p = N.pts[e[0]], q = N.pts[e[1]];
    var x1 = lerp(p.x, p.ring.x, conv), y1 = lerp(p.y, p.ring.y, conv), x2 = lerp(q.x, q.ring.x, conv), y2 = lerp(q.y, q.ring.y, conv);
    var l = Math.max(pulse(p.d), pulse(q.d));
    c.strokeStyle = "rgba(255,255,255," + (.1 + .5*l) + ")"; c.lineWidth = .12 + .1*l; c.beginPath(); c.moveTo(cx + x1*R, cy + y1*R); c.lineTo(cx + x2*R, cy + y2*R); c.stroke();
  });
  N.pts.forEach(function(p){
    var l = pulse(p.d), x = cx + lerp(p.x, p.ring.x, conv)*R, y = cy + lerp(p.y, p.ring.y, conv)*R;
    c.fillStyle = "rgba(255,255,255," + (.35 + .65*l) + ")"; c.beginPath(); c.arc(x, y, .35 + .8*l, 0, 7); c.fill();
    if(l > .3){ var g = c.createRadialGradient(x, y, 0, x, y, 3.2); g.addColorStop(0, "rgba(255,255,255," + .5*l + ")"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(x - 3.2, y - 3.2, 6.4, 6.4) }
  });
  c.restore();
}

/* ---------- fyra ikoner, tryckta på kopior av sig själva ---------- */
var ICONS = [[21.1, 22.9, "f_ali", [.55, .5], 1], [22.9, 24.7, "f_jordan", [.85, .65], 1.4], [24.7, 26.5, "f_maradona", [.45, .4], 1], [26.5, 28.3, "f_malcolm", [.62, .45], 1]];
function iconScene(c, G, t){
  var H = G.H, i, s = null, key, rot;
  v3Fill(c, 0, 0, 100, H, DARK);
  if(t >= 27.55){
    var k = Math.floor((t - 27.55)/.12) % 4; s = ICONS[k]; key = s[2]; rot = 0; blurBg(c, G, key, .45);
    var f = fit(key, 86, G.is9 ? 112 : 96); print(c, [(100 - f[0])/2, (H - f[1])/2 - 3, f[0], f[1]], 2, (k - 1.5)*.008, function(x, y, w, h){ v3Photo(c, key, x, y, w, h, {pos:s[3], scale:s[4]*1.04}) });
    return;
  }
  for(i = 0; i < ICONS.length; i++) if(t >= ICONS[i][0] && t < ICONS[i][1]){ s = ICONS[i]; break }
  if(!s) return;
  key = s[2]; rot = ((s[0]*7) % 5 - 2)*.006;
  var u = k3(t, s[0], s[1]), land = oQ(k3(t, s[0], s[0] + .28)), f2 = fit(key, 86, G.is9 ? 112 : 96), sc = lerp(1.14, 1, land);
  blurBg(c, G, key, .5*land + .1);
  c.save(); c.translate(50, H/2 - 3); c.scale(sc, sc); c.translate(-50, -(H/2 - 3));
  print(c, [(100 - f2[0])/2, (H - f2[1])/2 - 3, f2[0], f2[1]], 2.2, rot, function(x, y, w, h){ v3Photo(c, key, x, y, w, h, {pos:s[3], scale:s[4]*lerp(1.0, 1.08, u)}) });
  c.restore();
}

/* ---------- släppet: motion graphics ---------- */
var SOLD = [["Storgatan 13", "Landskrona", "4 850 000 kr"], ["Kungsgatan 7", "Helsingborg", "5 295 000 kr"], ["Parkvägen 21", "Lund", "6 100 000 kr"], ["Strandvägen 3", "Malmö", "7 450 000 kr"], ["Björkgatan 18", "Landskrona", "3 975 000 kr"], ["Fyrvägen 5", "Höganäs", "5 890 000 kr"], ["Ekbacken 9", "Lund", "4 420 000 kr"], ["Skolgatan 12", "Helsingborg", "3 650 000 kr"]];
var CH = (function(){ var s = 99, pts = [], v = .08, i; for(i = 0; i <= 40; i++){ s = (s*1664525 + 1013904223) >>> 0; v += .022 + ((s/4294967296) - .35)*.05; pts.push(Math.max(.04, Math.min(.98, v))) } return pts })();
function moneyFmt(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") }
/* en mekanisk räknare: varje siffra rullar för sig */
function odometer(c, x, y, n, size, a, u){
  var str = moneyFmt(n), len = str.length, cw = size*.62, sp = size*.3, tot = 0, i, k;
  for(i = 0; i < len; i++) tot += str[i] === " " ? sp : cw;
  var px = x - tot/2;
  var digs = [], pw = 1; for(k = 0; k < 9; k++){ digs.push(pw); pw *= 10 }
  var di = 0, nd = str.replace(/ /g, "").length;
  for(i = 0; i < len; i++){
    if(str[i] === " "){ px += sp; continue }
    var pos = nd - 1 - di, val = n/Math.pow(10, pos), whole = Math.floor(val), fr = val - whole;
    var d0 = whole % 10, roll = pos === 0 ? fr : Math.pow(fr, 6), d1 = (d0 + 1) % 10;
    c.save(); c.beginPath(); c.rect(px - cw*.1, y - size*.74, cw*1.2, size*.86); c.clip();
    v3Text(c, String(d0), px + cw/2, y + roll*size*.9, {size:size, weight:300, f:"sans", color:"#fff", align:"c", alpha:a*(1 - roll*.6)});
    v3Text(c, String(d1), px + cw/2, y + (roll - 1)*size*.9, {size:size, weight:300, f:"sans", color:"#fff", align:"c", alpha:a*(.4 + roll*.6)});
    c.restore();
    px += cw; di++;
  }
}
function graphScene(c, G, t){
  var H = G.H, u = t - DROP, i, y0 = G.top + 3, R = {x0:8, x1:92}, beat = (u*2) % 1, pulse = Math.pow(1 - beat, 3);
  v3Fill(c, 0, 0, 100, H, "#060606");
  var gl = c.createRadialGradient(50, y0 + 22, 2, 50, y0 + 22, 60); gl.addColorStop(0, "rgba(255,255,255," + (.07 + .05*pulse) + ")"); gl.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gl; c.fillRect(0, 0, 100, H);
  /* räknaren, mitt på skärmen som i förebilden */
  var cnt = oQ(k3(u, .1, 5.0))*48250000, sz = G.is9 ? 12.5 : 10.5, ca = ioC(k3(u, 0, .3));
  v3Text(c, "SÅLT I ÅR", 50, y0 + 6, {size:1.7, weight:600, f:"sans", sp:.34, color:C3.olil, align:"c", alpha:ca});
  odometer(c, 50, y0 + 6 + sz*1.15, cnt, sz, ca, u);
  v3Text(c, "kr", 50, y0 + 6 + sz*1.15 + 7.6, {size:3.2, italic:true, color:C3.cream, align:"c", alpha:ca});
  /* en rad per sålt objekt, SÅLD stämplas in på varje slag */
  var rh = G.is9 ? 12.5 : 10.2, nrow = G.is9 ? 6 : 5, top = y0 + 6 + sz*1.15 + 15, k = Math.floor(Math.max(0, u - .35)/.45), r;
  for(r = 0; r < nrow; r++){
    var idx = k - r; if(idx < 0) continue;
    var row = SOLD[idx % SOLD.length], age = (u - .35) - idx*.45, en = oQ(k3(age, 0, .18)), y = top + r*rh, a = en*(1 - r*.1);
    var st = oBack(k3(age, .05, .3)), sa = Math.min(1, st);
    v3Line(c, R.x0, R.x1, y, "rgba(255,255,255,.22)", .14, 1, a);
    v3Text(c, row[0], R.x0, y + 5.6, {size:3.5, weight:400, color:"#fff", alpha:a});
    v3Text(c, row[1].toUpperCase() + "  ·  " + row[2], R.x0, y + 8.6, {size:1.35, weight:500, f:"sans", sp:.22, color:"rgba(255,255,255,.6)", alpha:a});
    /* stämpeln */
    c.save(); var bx = R.x1 - 12, by = y + 5.8, sc = lerp(1.9, 1, Math.min(1, st)); c.translate(bx, by); c.rotate(-.08); c.scale(sc, sc);
    c.globalAlpha = a*sa; c.strokeStyle = "#fff"; c.lineWidth = .32; c.strokeRect(-9.2, -3.1, 18.4, 6.2);
    c.restore();
    v3Text(c, "SÅLD", bx, by + 1.05, {size:2.9, weight:700, f:"sans", sp:.22, color:"#fff", align:"c", alpha:a*sa});
  }
  /* till sist ett enda ord */
  var fin = k3(u, 4.55, 5.0);
  if(fin > 0){
    var fa = oQ(fin); v3Fill(c, 0, 0, 100, H, "#050505", ioC(k3(u, 4.5, 4.8)));
    var s2 = lerp(1.25, 1, oBack(fin));
    c.save(); c.translate(50, G.cy); c.scale(s2, s2); c.translate(-50, -G.cy);
    v3Text(c, "SÅLD", 50, G.cy + 6.2, {size:G.is9 ? 24 : 21, weight:300, color:"#fff", align:"c", alpha:fa});
    c.restore();
  }
}

/* ---------- bländaren, knappen, adressen ---------- */
function aperture(c, cx, cy, R, open, rot){
  var i, n = 8, hole = R*(.03 + .8*open);
  var g = c.createRadialGradient(cx, cy, R*.1, cx, cy, R); g.addColorStop(0, "#232323"); g.addColorStop(1, "#0b0b0b");
  c.save(); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI*2);
  for(i = 0; i < n; i++){ var a = rot + i*Math.PI*2/n; c.lineTo(cx + Math.cos(a)*hole, cy + Math.sin(a)*hole) }
  c.closePath(); c.fill("evenodd");
  c.strokeStyle = "rgba(255,255,255,.16)"; c.lineWidth = .16;
  for(i = 0; i < n; i++){
    var a1 = rot + i*Math.PI*2/n, vx = cx + Math.cos(a1)*hole, vy = cy + Math.sin(a1)*hole, a2 = a1 + .9;
    c.beginPath(); c.moveTo(vx, vy); c.lineTo(cx + Math.cos(a2)*R*.97, cy + Math.sin(a2)*R*.97); c.stroke();
  }
  c.strokeStyle = "rgba(255,255,255,.28)"; c.lineWidth = .3; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI*2); c.stroke();
  c.beginPath(); c.arc(cx, cy, R*1.07, 0, Math.PI*2); c.strokeStyle = "rgba(255,255,255,.1)"; c.lineWidth = .2; c.stroke();
  c.restore();
  var lg = c.createRadialGradient(cx, cy, 0, cx, cy, hole*1.15); lg.addColorStop(0, "rgba(255,255,255,1)"); lg.addColorStop(.6, "rgba(235,235,235,.95)"); lg.addColorStop(1, "rgba(200,200,200,0)");
  c.save(); c.globalCompositeOperation = "lighter"; c.fillStyle = lg; c.fillRect(cx - hole*1.2, cy - hole*1.2, hole*2.4, hole*2.4); c.restore();
}
function apertureScene(c, G, t){
  var H = G.H, u = k3(t, 34.2, 37.4), o = ioC(u)*.9 + .05*oQ(k3(t, 34.2, 34.4));
  v3Fill(c, 0, 0, 100, H, DARK);
  aperture(c, 50, G.cy - 2, 36*(1 + .004*Math.sin(t*3)), o, t*.18 + .3);
  v3Fill(c, 0, 0, 100, H, "#fff", oQ(k3(t, 36.9, 37.4))*.9);
}
function btnPath(c, cx, cy, bw, bh){
  c.beginPath(); c.moveTo(cx - bw/2 + bh/2, cy - bh/2); c.arcTo(cx + bw/2, cy - bh/2, cx + bw/2, cy + bh/2, bh/2); c.arcTo(cx + bw/2, cy + bh/2, cx - bw/2, cy + bh/2, bh/2); c.arcTo(cx - bw/2, cy + bh/2, cx - bw/2, cy - bh/2, bh/2); c.arcTo(cx - bw/2, cy - bh/2, cx + bw/2, cy - bh/2, bh/2); c.closePath();
}
function buttonScene(c, G, t){
  var H = G.H, cx = 50, cy = G.cy, w = G.is9 ? 66 : 62, h = 10.4;
  v3Fill(c, 0, 0, 100, H, DARK);
  var u = oQ(k3(t, 37.5, 38.3)), press = k3(t, CLICK - .12, CLICK) * (1 - k3(t, CLICK + .08, CLICK + .26)), gone = ioC(k3(t, CLICK + .12, CLICK + .55));
  /* knappen, som i förebilden: ljus, mjuk, med skugga */
  if(gone < 1){
    var bw = w*(1 - .05*press), bh = h*(1 - .05*press), a = u*(1 - gone), sc = 1 + .08*gone;
    c.save(); c.translate(cx, cy); c.scale(sc, sc); c.translate(-cx, -cy);
    c.globalAlpha = a; c.shadowColor = "rgba(255,255,255," + (.18 + .08*Math.sin(t*5)) + ")"; c.shadowBlur = 7; c.shadowOffsetY = 1.2;
    var bg = c.createLinearGradient(0, cy - bh/2, 0, cy + bh/2); bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "#cfcfcf");
    c.fillStyle = bg; btnPath(c, cx, cy, bw, bh); c.fill(); c.restore();
    var lab = subText(SUBS.length - 2); 
    v3Text(c, lab, cx, cy + 1.05, {size:3.1, weight:500, f:"sans", sp:.02, color:"#0a0a0a", align:"c", alpha:a});
    var cp = ioC(k3(t, 38.2, CLICK - .15)), curX = lerp(106, cx + 14, cp), curY = lerp(H - 20, cy + 3.4, cp) - Math.sin(cp*Math.PI)*4;
    v3Cursor(c, curX, curY, press, k3(t, 38.2, 38.5)*(1 - k3(t, CLICK + .5, CLICK + .8)));
    v3Tap(c, cx + 14, cy + 3.4, k3(t, CLICK - .02, CLICK + .55));
  }
  /* efter klicket: adressen */
  var ua = k3(t, CLICK + .45, CLICK + 1.5);
  if(ua > 0){
    var ra = ioC(ua), ur = subText(SUBS.length - 1);
    v3Text(c, ur, cx, cy + 3.6 + (1 - ra)*1.6, {size:G.is9 ? 9.4 : 8.6, weight:300, color:"#fff", align:"c", alpha:ra});
  }
}

/* ---------- hela filmen ---------- */
function draw(c, G, t, o){
  var H = G.H;
  v3Fill(c, 0, 0, 100, H, DARK);
  if(t >= .6 && t < 7.0) tvScene(c, G, t);
  if(t >= 7.0 && t < 12.1) rocketScene(c, G, t);
  if(t >= 12.1 && t < 16.4) earthScene(c, G, t);
  if(t >= 15.75 && t < 21.1){ eyeScene(c, G, t); neuronLayer(c, G, t) }
  if(t >= 21.1 && t < DROP) iconScene(c, G, t);
  if(t >= DROP && t < 34.2) graphScene(c, G, t);
  if(t >= 34.2 && t < 37.4) apertureScene(c, G, t);
  if(t >= 37.4) buttonScene(c, G, t);
  if((t >= .6 && t < 12.1) || (t >= 21.1 && t < DROP)) FX.tone(c, G, 1, .12);
  FX.finish(c, G, t, {vig:t >= DROP && t < 34.2 ? .35 : .62});
  [9.2, 12.1, 16.0, 21.1, 22.9, 24.7, 26.5].forEach(function(h){ FX.flash(c, G, t, h, .5, .12) });
  FX.flash(c, G, t, DROP, 1, .35); FX.flash(c, G, t, CLICK, .6, .22); FX.flash(c, G, t, 37.4, .3, .1);
  subtitles(c, G, t);
}

/* ---------- ljudet: din låt, rösten, och ljudeffekterna ---------- */
var V6 = {music:null, musicName:"", vo:[], voReady:null};
var VO_FILES = [["media/vo/vo1.mp3", .6], ["media/vo/vo2.mp3", 7.0], ["media/vo/vo3.mp3", 12.1], ["media/vo/vo4.mp3", 16.0], ["media/vo/vo5.mp3", 21.1], ["media/vo/vo6a.mp3", 34.2], ["media/vo/vo6b.mp3", CLICK - .07]];
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
  var master = ctx.createGain(); master.gain.value = .72;
  var cmp = ctx.createDynamicsCompressor(); cmp.threshold.value = -14; cmp.ratio.value = 3; cmp.attack.value = .005; cmp.release.value = .2;
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
    var ms = ctx.createBufferSource(); ms.buffer = V6.music; var mg = ctx.createGain(); mg.gain.setValueAtTime(.95, 0);
    voiceWin.forEach(function(w){ mg.gain.setTargetAtTime(.36, w[0] - .1, .08); mg.gain.setTargetAtTime(.95, w[1] + .15, .25) });
    ms.connect(mg); mg.connect(master); ms.start(0, 0); ms.stop(DUR);
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
  [9.2, 12.1, 16.0, 21.1, 22.9, 24.7, 26.5].forEach(function(t){ shutter(t, .2) });
  for(i = 0; i < 6; i++) shutter(27.55 + i*.12, .1 + i*.02);
  for(i = 0; i < 6; i++){ thud(16.2 + i*.88, .22); thud(16.2 + i*.88 + .2, .14) }
  riser(24.9, 3.4, .07); impact(DROP, .55); shutter(DROP, .3);
  for(i = 0; i < 12; i++) tick(DROP + .3 + i*.5, .025);
  riser(35.0, 2.4, .06); drone(36.4, 3.2, .1);
  click(CLICK, .26); impact(CLICK + .02, .5); thud(CLICK, .3);
  [38, 45, 52, 57, 64, 69].forEach(function(m, k){ piano(CLICK + .5, m, k ? .26 : .45, 5) });
}

/* ---------- komposition ---------- */
window.V3_FILM2 = [];
(function(){
  var comp = {n:"Verktyg", d:"Varumärkesfilm för mäklare. Berättare, Over, motion graphics och en knapp som öppnar verktygen.", group:"film2", dur:DUR, thumb:23.5, id:"fm_verktyg", v:{id:"fm_verktyg"}};
  comp.prep = prep; comp.loadAudio = loadAudio; comp.mix = mix;
  comp.draw = function(c, G, t, o){
    draw(c, G, t, o);
  };
  V3_COMPS.fm_verktyg = comp; V3_FILM2.push("fm_verktyg");
})();

/* ---------- sidan ---------- */
var SLOTS = [["f_astro", "Månlandning (bild)", "img"], ["rocket", "Raket som lyfter (klipp)", "vid"], ["earth1", "Jorden som reser sig (klipp)", "vid"], ["earth2", "Jorden med solen (klipp)", "vid"], ["eye", "Öga i närbild (klipp)", "vid"], ["ct", "Hjärnskanning (klipp)", "vid"],
  ["f_ali", "Ikon 1 (bild)", "img"], ["f_jordan", "Ikon 2 (bild)", "img"], ["f_maradona", "Ikon 3 (bild)", "img"], ["f_malcolm", "Ikon 4 (bild)", "img"], ["engine", "Raketen i närbild (klipp)", "vid"]];
function slots(){
  return '<details class="a3det a3cust" open><summary>Byt bilder och klipp</summary><p class="a3hint">Välj en egen fil för en plats. Bilden eller klippet får samma bildbehandling och samma rörelse automatiskt. Filerna stannar i din webbläsare.</p><div class="a3hxs">'
    + SLOTS.map(function(s){ return '<label class="a3f"><span>' + esc(s[1]) + '</span><input type="file" accept="' + (s[2] === "img" ? "image/*" : "video/*") + '" data-a3slot="' + s[0] + '" data-kind="' + s[2] + '"></label>' }).join("") + '</div></details>';
}
function subEd(){
  return '<details class="a3det a3cust" open><summary>Ändra undertexterna och knappen</summary><p class="a3hint">Undertexterna följer rösten, två–tre ord i taget. Rösten ändras inte av texten, så ändrar du en rad behöver rösten spelas in på nytt.</p><div class="a3hxs">'
    + SUBS.map(function(s, i){ return '<label class="a3f"><span>' + (s.btn ? "Knappens text" : s.url ? "Adressen efter klicket" : "Replik " + (i + 1) + " · " + s.t0.toFixed(1).replace(".", ",") + " s") + '</span><input type="text" value="' + esc(subText(i)) + '" data-a3fx="' + i + '"></label>' }).join("")
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
  var comp = V3_COMPS[V3S.comp], outs = V3_OUT.map(function(o){ return v3Seg("outro", o.id, o.n, V3S.outro === o.id) }).join("");
  setTimeout(v3Mount, 0);
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Varumärke · 14</div><h2>Verktyg</h2>'
    + '<p>Varumärkesfilmen för mäklare: berättarrösten Arthur, din låt Over, fotografier, klipp och motion graphics. Over följer med. Förslag, inget publicerat.</p></div>'
    + '<div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w45") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '"></div>'
    + '<span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Story · 9:16", V3S.fmt === "916") + v3Seg("fmt", "45", "Flöde · 4:5", V3S.fmt === "45") + '</div>'
    + '<div class="a3h">Låt</div><label class="a3f"><span id="v6music">' + (V6.music ? "Låt: " + esc(V6.musicName) + ". Byt genom att välja en annan fil." : "Over laddas in automatiskt. Eller välj en egen låt här.") + '</span><input type="file" accept="audio/*" data-a3music="1"></label>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + (V3S.fmt === "916" ? "9:16 · 1080 × 1920" : "4:5 · 1080 × 1350") + ' · med ljud</button>'
    + '<button class="a3seg dl" type="button" data-a3="wav">Ljud · WAV</button></div></div></div>'
    + subEd() + slots()
    + '<details class="a3det"><summary>Underlag, rättigheter och vad som inte är klart</summary><div class="a3und"><div><b>Musiken</b><p>Over (Drake, 2010) är en kommersiell låt. Den laddas upp av dig i webbläsaren och följer inte med sidan. För publicering krävs licens från skivbolag och förlag, eller ett annat spår.</p></div>'
    + '<div><b>Rösten</b><p>Arthur är en AI-röst. Jag har inte hört om uttalet håller som svenska, och en riktig röst kan ersätta raderna.</p></div>'
    + '<div><b>Bilderna</b><p>Bilderna på Ali, Jordan, Maradona och Malcolm X, och månlandningsbilden, kommer från dig. Rättigheter för bilderna och för personernas bild i en annons måste klaras. Jordan-bilden visar sponsorer i bakgrunden. Jordklippen är renderade.</p></div>'
    + '<div><b>Siffrorna</b><p>Raderna med sålda objekt och summan är exempeldata, inte riktiga uppgifter.</p></div></div></details></div>';
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
