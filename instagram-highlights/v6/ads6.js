/* =====================================================================
   SIDA 14 — VARUMÄRKESFILM "VERKTYG"

   Berättarrösten bär filmen, musiken (Over, uppladdad av dig) är
   motorn, och resten är motion graphics som i förebilden. Fotografier
   och klipp är de ni själva hämtat; allt annat ritas här.

   Tiden i sekunder följer låten: släppet ligger vid 28,3 s och basen
   faller vid 40,3 s. Alla tider är mätta mot de genererade röstraderna.
   ===================================================================== */
(function(){
var FX = window.BR_FX, DARK = "#050505", CLICK = 27.95, DUR = 34.7;

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
  {v:"engine", t0:6.7, t1:8.9, from:.3, speed:.85},
  {v:"rocket", t0:8.9, t1:11.55, from:0, speed:.85},
  {v:"earth1", t0:11.5, t1:13.9, from:2.4, speed:1},
  {v:"earth2", t0:13.4, t1:15.8, from:.8, speed:1},
  {v:"eye", t0:15.0, t1:18.7, from:.4, speed:.95},
  {v:"ct", t0:17.7, t1:20.5, from:0, speed:.95}
];
function clipTime(c, t){ return c.from + Math.max(0, Math.min(t, c.t1) - c.t0)*c.speed }
/* vid uppspelning går klippen på riktigt, vid skrubbning och export söks varje bildruta fram */
function prep(t){
  return loadMedia().then(function(){
    var live = window.V3S && V3S.playing, jobs = [];
    CLIPS.forEach(function(c){
      var e = vel(c.v), on = t >= c.t0 - .15 && t < c.t1 + .15;
      if(live){
        if(!on){ if(!e.paused) e.pause(); return }
        var want = clipTime(c, t); e.playbackRate = c.speed;
        if(e.paused){ e.currentTime = want; var pr = e.play(); if(pr && pr.catch) pr.catch(function(){}) }
        else if(Math.abs(e.currentTime - want) > .3) e.currentTime = want;
      } else {
        if(!e.paused) e.pause();
        if(on) jobs.push(seek(e, clipTime(c, t)));
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
var SUBS = [
  {t0:.5, d:5.93, txt:"Nittonhundrasextionio. Hundratals miljoner tittar på samma skärm."},
  {t0:6.7, d:4.6, txt:"Det som fastnar är ingen raket. Det är en bild."},
  {t0:11.6, d:3.4, txt:"En bild på jorden. Vårt hem."},
  {t0:15.25, d:4.96, txt:"Så fungerar vår hjärna. Den minns bilder bättre än ord."},
  {t0:20.45, d:3.92, txt:"Därför minns vi dem som nådde längre än alla andra."},
  {t0:24.7, d:2.25, txt:"Men ingen nådde dit utan rätt"},
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
  if(t < 8.9) vcover(c, "engine", 0, 0, 100, H, {scale:lerp(1.35, 1.6, k3(t, 6.7, 8.9)), pos:[.5, lerp(.6, .5, k3(t, 6.7, 8.9))]});
  else vcover(c, "rocket", 0, 0, 100, H, {scale:lerp(1.9, 2.25, k3(t, 8.9, 11.55)), pos:[.5, lerp(.55, .32, k3(t, 8.9, 11.55))]});
  var vg = c.createRadialGradient(50, H/2, H*.2, 50, H/2, H*.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.55)"); c.fillStyle = vg; c.fillRect(0, 0, 100, H);
}
function earthScene(c, G, t){
  var H = G.H;
  v3Fill(c, 0, 0, 100, H, DARK);
  vcover(c, "earth1", 0, 0, 100, H, {scale:lerp(1.0, 1.2, k3(t, 11.5, 13.9)), pos:[.5, .6]});
  if(t >= 13.4) vcover(c, "earth2", 0, 0, 100, H, {scale:lerp(1.0, 1.3, k3(t, 13.4, 15.8)), pos:[.35, .5], alpha:ioC(k3(t, 13.4, 13.95))});
}
function vplace(c, name, x, y, w, h, scale, ux, uy, sx, sy){
  var e = vel(name); if(!e.videoWidth) return;
  var s = Math.max(w/e.videoWidth, h/e.videoHeight)*scale, dw = e.videoWidth*s, dh = e.videoHeight*s;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.drawImage(e, x + w*sx - ux*dw, y + h*sy - uy*dh, dw, dh); c.restore();
}
function eyeScene(c, G, t){
  var H = G.H, ea = ioC(k3(t, 15.0, 15.8)), d = ioC(k3(t, 15.2, 18.2)), pupil = [.46, .5];
  if(t >= 15.8) v3Fill(c, 0, 0, 100, H, DARK);
  /* ögat tonas in ur jorden och kameran glider in mot pupillen */
  c.save(); c.globalAlpha = ea*(1 - ioC(k3(t, 17.7, 18.5))); vplace(c, "eye", 0, 0, 100, H, lerp(1.12, 3.4, d), lerp(.5, pupil[0], d), lerp(.5, pupil[1], d), .5, .5); c.restore();
  /* ur mörkret i pupillen tonar skanningen fram */
  var ca = ioC(k3(t, 17.7, 18.6))*(1 - ioC(k3(t, 20.1, 20.5)));
  if(ca > 0) vcover(c, "ct", 0, 0, 100, H, {scale:lerp(2.3, 2.7, k3(t, 17.7, 20.5)), pos:[.5, .46], alpha:ca});
  var vg = c.createRadialGradient(50, H/2, H*.2, 50, H/2, H*.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.7)"); c.fillStyle = vg; c.fillRect(0, 0, 100, H);
}
/* ---------- fyra ikoner, tryckta på kopior av sig själva ---------- */
var ICONS = [[20.5, 21.5, "f_ali", [.55, .5], 1], [21.5, 22.5, "f_jordan", [.85, .65], 1.4], [22.5, 23.5, "f_maradona", [.45, .4], 1], [23.5, 24.7, "f_malcolm", [.62, .45], 1]];
function iconScene(c, G, t){
  var H = G.H, i, s = null, key, rot;
  v3Fill(c, 0, 0, 100, H, DARK);
  for(i = 0; i < ICONS.length; i++) if(t >= ICONS[i][0] && t < ICONS[i][1]){ s = ICONS[i]; break }
  if(!s) return;
  key = s[2]; rot = ((s[0]*7) % 5 - 2)*.006;
  var u = k3(t, s[0], s[1]), land = oQ(k3(t, s[0], s[0] + .24)), f2 = fit(key, 86, G.is9 ? 112 : 96), sc = lerp(1.14, 1, land);
  blurBg(c, G, key, .5*land + .1);
  c.save(); c.translate(50, H/2 - 3); c.scale(sc, sc); c.translate(-50, -(H/2 - 3));
  print(c, [(100 - f2[0])/2, (H - f2[1])/2 - 3, f2[0], f2[1]], 2.2, rot, function(x, y, w, h){ v3Photo(c, key, x, y, w, h, {pos:s[3], scale:s[4]*lerp(1.0, 1.08, u)}) });
  c.restore();
}

/* ---------- inne i systemet: en lugn gränssnittsrörelse ---------- */
function rr(c, x, y, w, h, r){ c.beginPath(); if(c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h) }
function uiScene(c, G, t){
  var H = G.H, u = t - 24.7, W = 84, Hh = G.is9 ? 76 : 64, x = (100 - W)/2, y = G.cy - Hh/2 - 2, i;
  v3Fill(c, 0, 0, 100, H, "#050505");
  var A = ioC(k3(u, 0, .45))*(1 - ioC(k3(u, 2.5, 2.85)));
  if(A <= 0) return;
  var sc = lerp(.95, 1.03, ioC(k3(u, 0, 2.85)));
  c.save(); c.translate(50, G.cy); c.scale(sc, sc); c.translate(-50, -G.cy + (1 - ioC(k3(u, 0, .45)))*2.5);
  c.save(); c.globalAlpha = A; c.shadowColor = "rgba(255,255,255,.07)"; c.shadowBlur = 8; c.fillStyle = "#0e0e0e"; rr(c, x, y, W, Hh, 3.2); c.fill(); c.restore();
  c.save(); c.globalAlpha = A*.9; c.strokeStyle = "rgba(255,255,255,.13)"; c.lineWidth = .18; rr(c, x, y, W, Hh, 3.2); c.stroke(); c.restore();
  v3Text(c, "NY KAMPANJ", x + 5, y + 7.2, {size:1.45, weight:600, f:"sans", sp:.32, color:"rgba(255,255,255,.55)", alpha:A});
  var step = u < .95 ? 0 : u < 1.95 ? 1 : 2;
  for(i = 0; i < 3; i++){ c.save(); c.globalAlpha = A*(i <= step ? 1 : .3); c.fillStyle = i <= step ? C3.olil : "#fff"; c.beginPath(); c.arc(x + W - 5 - (2 - i)*2.6, y + 6.6, .6, 0, 7); c.fill(); c.restore() }
  /* tre bilder fylls i */
  var gw = (W - 10 - 2*3)/3, gh = gw*1.2, gy = y + 12, px, ti, en, ck;
  for(i = 0; i < 3; i++){
    px = x + 5 + i*(gw + 3); ti = .2 + i*.25; en = oQ(k3(u, ti, ti + .3));
    c.save(); c.globalAlpha = A*en; c.save(); rr(c, px, gy, gw, gh, 1.6); c.clip();
    var gr = c.createLinearGradient(0, gy, 0, gy + gh); gr.addColorStop(0, i === 1 ? "#4a4a46" : "#3a3a37"); gr.addColorStop(.62, i === 2 ? "#2a2a28" : "#1f1f1e"); gr.addColorStop(1, "#111"); c.fillStyle = gr; c.fillRect(px, gy, gw, gh);
    var rg = c.createRadialGradient(px + gw*(.3 + i*.2), gy + gh*.3, 0, px + gw*(.3 + i*.2), gy + gh*.3, gw*.9); rg.addColorStop(0, "rgba(255,255,255,.2)"); rg.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = rg; c.fillRect(px, gy, gw, gh);
    c.restore(); c.strokeStyle = "rgba(255,255,255,.14)"; c.lineWidth = .15; rr(c, px, gy, gw, gh, 1.6); c.stroke(); c.restore();
    ck = oBack(k3(u, ti + .3, ti + .55));
    if(ck > 0){ c.save(); c.globalAlpha = A*Math.min(1, ck); c.fillStyle = C3.olil; c.beginPath(); c.arc(px + gw - 2.6, gy + 2.6, 1.5*Math.max(0, ck), 0, 7); c.fill(); c.strokeStyle = "#0a0a0a"; c.lineWidth = .28; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(px + gw - 3.3, gy + 2.7); c.lineTo(px + gw - 2.7, gy + 3.3); c.lineTo(px + gw - 1.8, gy + 2); c.stroke(); c.restore() }
  }
  /* tre mallar väljs */
  var cy2 = gy + gh + 6.2, labs = ["Kommande", "Till salu", "Såld"], cw = (W - 10 - 2*2.4)/3;
  for(i = 0; i < 3; i++){
    px = x + 5 + i*(cw + 2.4); en = oQ(k3(u, 1.0 + i*.25, 1.25 + i*.25));
    c.save(); c.globalAlpha = A; c.strokeStyle = "rgba(255,255,255," + (.18 + .1*en) + ")"; c.lineWidth = .16; rr(c, px, cy2, cw, 6.2, 3.1); c.stroke(); c.restore();
    c.save(); c.globalAlpha = A*en; c.fillStyle = "#f1eee8"; rr(c, px, cy2, cw, 6.2, 3.1); c.fill(); c.restore();
    v3Text(c, labs[i], px + cw/2, cy2 + 3.9, {size:1.9, weight:600, f:"sans", sp:.04, color:en > .5 ? "#0a0a0a" : "rgba(255,255,255,.6)", align:"c", alpha:A});
  }
  /* förlopp och resultat */
  var by = cy2 + 12, pr = ioC(k3(u, .2, 1.75));
  v3Line(c, x + 5, x + W - 5, by, "rgba(255,255,255,.14)", .22, 1, A);
  v3Line(c, x + 5, x + 5 + (W - 10)*pr, by, "#fff", .3, 1, A);
  var ra = ioC(k3(u, 1.75, 2.1));
  v3Text(c, "Din kampanj är klar", x + 5, by + 7.4 + (1 - ra)*1.2, {size:3.2, weight:400, color:"#fff", alpha:A*ra});
  c.restore();
}

function btnPath(c, cx, cy, bw, bh){
  c.beginPath(); c.moveTo(cx - bw/2 + bh/2, cy - bh/2); c.arcTo(cx + bw/2, cy - bh/2, cx + bw/2, cy + bh/2, bh/2); c.arcTo(cx + bw/2, cy + bh/2, cx - bw/2, cy + bh/2, bh/2); c.arcTo(cx - bw/2, cy + bh/2, cx - bw/2, cy - bh/2, bh/2); c.arcTo(cx - bw/2, cy - bh/2, cx + bw/2, cy - bh/2, bh/2); c.closePath();
}
function buttonScene(c, G, t){
  var H = G.H, cx = 50, cy = G.cy, w = G.is9 ? 66 : 62, h = 10.4;
  var u = oQ(k3(t, 27.3, 27.75)), press = k3(t, CLICK - .1, CLICK)*(1 - k3(t, CLICK + .08, CLICK + .26)), swap = ioC(k3(t, CLICK + .06, CLICK + .45));
  if(t < 27.3) return;
  v3Fill(c, 0, 0, 100, H, "#050505", u);
  /* knappen */
  if(swap < 1){
    var bw = w*(1 - .05*press), bh = h*(1 - .05*press), a = u*(1 - swap);
    c.save(); c.globalAlpha = a; c.shadowColor = "rgba(255,255,255," + (.18 + .08*Math.sin(t*5)) + ")"; c.shadowBlur = 7; c.shadowOffsetY = 1.2;
    var bg = c.createLinearGradient(0, cy - bh/2, 0, cy + bh/2); bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "#cfcfcf");
    c.fillStyle = bg; btnPath(c, cx, cy, bw, bh); c.fill(); c.restore();
    v3Text(c, subText(SUBS.length - 2), cx, cy + 1.05, {size:3.1, weight:500, f:"sans", sp:.02, color:"#0a0a0a", align:"c", alpha:a});
    var cp = ioC(k3(t, 27.45, CLICK - .08)), curX = lerp(106, cx + 14, cp), curY = lerp(H - 20, cy + 3.4, cp) - Math.sin(cp*Math.PI)*4;
    v3Cursor(c, curX, curY, press, k3(t, 27.45, 27.7)*(1 - k3(t, CLICK + .3, CLICK + .55)));
    v3Tap(c, cx + 14, cy + 3.4, k3(t, CLICK - .02, CLICK + .5));
  }
  /* adressen tar knappens plats, i samma storlek */
  if(swap > 0){
    var ur = subText(SUBS.length - 1), m = v3Measure(c, ur, {size:10, weight:300}), fs = 10*w/m;
    v3Text(c, ur, cx, cy + fs*.3, {size:fs, weight:300, color:"#fff", align:"c", alpha:swap});
  }
}

/* ---------- hela filmen ---------- */
function draw(c, G, t, o){
  var H = G.H;
  v3Fill(c, 0, 0, 100, H, DARK);
  if(t >= .5 && t < 6.9) tvScene(c, G, t + .1);
  if(t >= 6.7 && t < 11.55) rocketScene(c, G, t);
  if(t >= 11.5 && t < 15.85) earthScene(c, G, t);
  if(t >= 15.0 && t < 20.55) eyeScene(c, G, t);
  if(t >= 20.45 && t < 24.75) iconScene(c, G, t);
  if(t >= 24.7 && t < 27.6) uiScene(c, G, t);
  if(t >= 27.2) buttonScene(c, G, t);
  if((t >= .5 && t < 11.55) || (t >= 20.45 && t < 24.75)) FX.tone(c, G, 1, .12);
  FX.finish(c, G, t, {vig:.62});
  var dp = Math.max(0, 1 - Math.abs(t - 6.72)/.2, 1 - Math.abs(t - 24.72)/.18);
  if(dp > 0) v3Fill(c, 0, 0, 100, H, "#000", dp);
  [8.9, 11.5, 20.5, 21.5, 22.5, 23.5].forEach(function(h){ FX.flash(c, G, t, h, .4, .12) });
  FX.flash(c, G, t, CLICK, .35, .1);
  subtitles(c, G, t);
}

/* ---------- ljudet: din låt, rösten, och ljudeffekterna ---------- */
var V6 = {music:null, musicName:"", vo:[], voReady:null};
var VO_FILES = [["media/vo/vo1.mp3", .5], ["media/vo/vo2.mp3", 6.7], ["media/vo/vo3.mp3", 11.6], ["media/vo/vo4.mp3", 15.25], ["media/vo/vo5.mp3", 20.45], ["media/vo/vo6a.mp3", 24.7], ["media/vo/vo6b.mp3", CLICK - .08]];
var OUTRO_AT = 210.3;
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
    /* före klicket: låtens början, därefter låtens slut när knappen trycks */
    var ms = ctx.createBufferSource(); ms.buffer = V6.music; var mg = ctx.createGain(); mg.gain.setValueAtTime(.95, 0);
    voiceWin.forEach(function(w){ if(w[0] < CLICK - .3){ mg.gain.setTargetAtTime(.4, w[0] - .1, .08); mg.gain.setTargetAtTime(.95, w[1] + .15, .25) } });
    mg.gain.setValueAtTime(.95, CLICK - .06); mg.gain.linearRampToValueAtTime(0, CLICK + .02);
    ms.connect(mg); mg.connect(master); ms.start(0, 0); ms.stop(CLICK + .05);
    var mo = ctx.createBufferSource(); mo.buffer = V6.music; var og = ctx.createGain(); og.gain.setValueAtTime(0, CLICK - .02); og.gain.linearRampToValueAtTime(1, CLICK + .04); og.gain.setTargetAtTime(.6, CLICK + .1, 1.2);
    mo.connect(og); og.connect(master); mo.start(CLICK - .02, OUTRO_AT); mo.stop(DUR);
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
  [8.9, 11.5, 20.5, 21.5, 22.5, 23.5].forEach(function(t){ shutter(t, .2) });
  for(i = 0; i < 5; i++){ thud(15.4 + i*.9, .2); thud(15.4 + i*.9 + .2, .13) }
  riser(24.9, 3.0, .06);
  click(CLICK, .26); thud(CLICK, .35);
}

/* ---------- komposition ---------- */
window.V3_FILM2 = [];
(function(){
  var comp = {n:"Verktyg", d:"Varumärkesfilm för mäklare. Berättare, Over, motion graphics och en knapp som öppnar verktygen.", group:"film2", dur:DUR, thumb:25.9, id:"fm_verktyg", v:{id:"fm_verktyg"}};
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
    + '<div><b>Slutet</b><p>När knappen trycks byter låten till sitt eget slut. Den delen börjar på ' + String(OUTRO_AT).replace('.', ',') + ' s i filen. Säg till om du vill börja på ett annat ställe.</p></div></div></details></div>';
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
