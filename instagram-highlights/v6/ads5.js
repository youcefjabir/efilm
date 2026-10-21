/* =====================================================================
   VARUMÄRKESFILMER — sida 13

   Manifestfilmer i samma anda som de bästa varumärkesfilmerna: ett enda
   påstående berättat två–tre ord i taget, klippt på takten, i svartvitt
   som sakta stramas åt. En takt tystnad. Sedan färg, produkten och
   varumärket. Allt är Viewlys egna bilder och egna skärmar.

   Tre filmer, samma dramaturgi:
     A  Ett hem säljs en gång   (varumärket)
     B  Sex kontakter. Eller en. (Systemet, riktad till mäklare)
     C  Sju delar               (vad Viewly är)

   Allt ritas som rena funktioner av tiden. Musiken är syntetiserad i
   webbläsaren från samma tidslinje: tempo 120, a-moll, uppbyggnad,
   tystnad, släpp. Jag har skrivit den men inte hört den.
   ===================================================================== */
(function(){
var BPM = 120, BT = 60/BPM;
function T(b){ return b*BT }
var DARK = "#050505";

/* ---------- bildbehandling ---------- */
var GRAIN = null;
function grainTile(){
  if(GRAIN) return GRAIN;
  var cv = document.createElement("canvas"); cv.width = cv.height = 192; var g = cv.getContext("2d"), im = g.createImageData(192, 192), s = 1234567, i, v;
  for(i = 0; i < im.data.length; i += 4){ s = (s*1664525 + 1013904223) >>> 0; v = 90 + (s >>> 24)*.5; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255 }
  g.putImageData(im, 0, 0); GRAIN = cv; return cv;
}
/* svartvitt utan canvas-filter (fungerar även i Safari): mättnad bort, kontrast på */
function tone(c, G, bw, dim){
  var H = G.H;
  if(bw > .002){
    c.save(); c.globalCompositeOperation = "saturation"; c.globalAlpha = bw; c.fillStyle = "#808080"; c.fillRect(0, 0, 100, H); c.restore();
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "overlay"; c.globalAlpha = .55*bw; c.drawImage(c.canvas, 0, 0); c.restore();
  }
  if(dim) v3Fill(c, 0, 0, 100, H, "#000", dim);
}
function finish(c, G, t, o){
  var H = G.H, a = o && o.vig != null ? o.vig : .62;
  var vg = c.createRadialGradient(50, H/2, H*.18, 50, H/2, H*.72); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0," + a + ")");
  c.save(); c.fillStyle = vg; c.fillRect(0, 0, 100, H); c.restore();
  var fr = Math.floor(t*24), ox = (fr*53) % 192, oy = (fr*97) % 192, cv = c.canvas, pat = c.createPattern(grainTile(), "repeat");
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = .1; c.globalCompositeOperation = "overlay"; c.translate(-ox, -oy); c.fillStyle = pat; c.fillRect(0, 0, cv.width + 192, cv.height + 192); c.restore();
}
function flash(c, G, t, tHit, amp, dec){
  var u = (t - tHit)/(dec || .16); if(u < 0 || u > 1) return;
  v3Fill(c, 0, 0, 100, G.H, "#fff", amp*(1 - u)*(1 - u));
}
/* ett fotografi i helbild med långsam inzoomning och en liten ryckning på klippet */
function shot(c, G, t, b0, b1, key, o){
  o = o || {};
  var t0 = T(b0), t1 = T(b1); if(t < t0 || t >= t1) return false;
  var u = (t - t0)/(t1 - t0), sc = lerp(o.s0 || 1.2, o.s1 || 1.05, o.rev ? 1 - u : u), pos = o.pos || V3_POS[key] || [.5, .5], jit = Math.max(0, 1 - (t - t0)/.18);
  var jx = Math.sin(t*91)*jit*.02, jy = Math.cos(t*77)*jit*.02;
  v3Photo(c, key, 0, 0, 100, G.H, {scale:sc, pos:[Math.min(1, Math.max(0, pos[0] + jx)), Math.min(1, Math.max(0, pos[1] + jy))]});
  return true;
}
/* ljusband som sveper över bilden */
function sweep(c, G, t, b0, b1){
  var t0 = T(b0), t1 = T(b1); if(t < t0 || t > t1) return;
  var u = (t - t0)/(t1 - t0), y = lerp(-8, G.H + 8, ioC(u)), g = c.createLinearGradient(0, y - 7, 0, y + 7);
  g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.5, "rgba(255,255,255,.34)"); g.addColorStop(1, "rgba(255,255,255,0)");
  c.save(); c.fillStyle = g; c.fillRect(0, y - 7, 100, 14); c.restore();
}

/* ---------- texten ---------- */
var BX = {};
try { BX = JSON.parse(localStorage.getItem("viewly.brand.tx") || "{}") || {} } catch(e){ BX = {} }
function bxSave(){ try { localStorage.setItem("viewly.brand.tx", JSON.stringify(BX)) } catch(e){} }
window.brSetText = function(key, v){ var p = key.split("|"); (BX[p[0]] = BX[p[0]] || {})[p[1]] = v; bxSave() };
window.brReset = function(){ BX = {}; bxSave() };
function capText(film, i, def){ var o = BX[film]; return o && o[i] != null ? o[i] : def }
/* ord som klipps in på takten: [takt, text, kursiv, längd i takter, läge] */
function capsDraw(c, G, t, film, CAPS, bwDark){
  var i, cp, t0, t1, u, size, txt, w, sizes = [13.4, 11.6, 10, 8.6, 7.4, 6.4], k, sc, y, ink;
  for(i = 0; i < CAPS.length; i++){
    cp = CAPS[i]; if(cp[4] === "cta") continue; t0 = T(cp[0]); t1 = T(cp[0] + (cp[3] || 2)); if(t < t0 || t >= t1) continue;
    txt = capText(film, i, cp[1]); if(!txt) continue; ink = cp[4] === "ui";
    u = t - t0; size = sizes[sizes.length - 1];
    for(k = 0; k < sizes.length; k++){ w = v3Measure(c, txt, {size:sizes[k], weight:300, italic:!!cp[2]}); if(w <= 82){ size = sizes[k]; break } }
    if(ink){ size = Math.min(size, 6.6) } else if(cp[4] === "low"){ size = Math.min(size, 8.6) }
    sc = 1 + .08*(1 - oQ(k3(u, 0, .16)));
    y = ink ? G.H - G.bot - 6 : cp[4] === "low" ? G.H - G.bot - 7 : G.cy + size*.3;
    if(!ink){ var bd = c.createLinearGradient(0, y - size*1.4, 0, y + size*.9); bd.addColorStop(0, "rgba(0,0,0,0)"); bd.addColorStop(.5, "rgba(0,0,0,.5)"); bd.addColorStop(1, "rgba(0,0,0,0)"); c.save(); c.globalAlpha = oQ(k3(u, 0, .1)); c.fillStyle = bd; c.fillRect(0, y - size*1.4, 100, size*2.3); c.restore() }
    c.save(); c.translate(50, y); c.scale(sc, sc); c.translate(-50, -y);
    v3Text(c, txt, 50, y, {size:size, weight:300, italic:!!cp[2], color:ink ? C3.ink : (cp[2] ? C3.cream : "#fff"), align:"c", shadow:!ink, sp:cp[2] ? 0 : 0});
    c.restore();
  }
}
function progress(c, G, t, dur){
  var y = G.H - G.bot + (G.is9 ? 2.6 : 3.4);
  v3Fill(c, 8, y, 84, .18, "#fff", .18); v3Fill(c, 8, y, 84*Math.min(1, t/dur), .18, "#fff", .7);
}

/* ---------- filmen: "Förutom några." ---------- */
var BR = {br_moon:"brMoon", br_rocket:"brRocket", br_sprint:"brSprint", br_stage:"brStage", br_dunk:"brDunk", br_earth:"brEarth", br_eye:"brEye", br_photog:"brPhotog", br_door:"brDoor"};
Object.keys(BR).forEach(function(k){ V3_KEYS[k] = BR[k] });
V3_POS.br_moon = [.5, .5]; V3_POS.br_door = [.6, .5]; V3_POS.br_eye = [.5, .45];

/* ord som klipps in på takten: [takt, text, kursiv, längd, läge] */
var CAPS_V = [
  [1, "Vissa ögonblick", 0, 2], [3, "avgör allt.", 1, 2],
  [5.2, "Historien", 0, 1.3], [6.7, "minns inte alla.", 0, 1.8],
  [8.7, "Den minns", 0, 1.3], [10.2, "dem som fick", 0, 1.8], [12, "världen", 0, 1.5], [13.4, "att stanna upp.", 1, 2.6],
  [16.2, "På en skärm", 0, 1.6], [17.8, "ser nästan alla", 0, 1.3], [19.1, "bostäder", 0, 1], [20.1, "likadana ut.", 1, 1.6],
  [21.9, "Köparen", 0, 1], [22.9, "scrollar vidare.", 1, 1.2],
  [24.5, "Förutom några.", 1, 1.2],
  [25.8, "Några mäklare", 0, 1.6], [27.5, "vinner uppdraget", 0, 1.5], [29.1, "innan de ens", 0, 1.3], [30.5, "har ringt.", 1, 2.2],
  [34.6, "Vad vet de", 0, 1.5], [36.2, "som du inte vet?", 1, 2.4],
  [40.6, "Ta reda på det", 0, 3, "cta"]];
var SHOTS_I = [[.5, 3, "br_moon", [.5, .5]], [3, 5, "br_rocket", [.5, .5]], [5, 6.5, "br_sprint", [.5, .5]], [6.5, 8.5, "br_stage", [.5, .5]], [8.5, 10, "br_dunk", [.5, .5]],
               [10, 12, "br_earth", [.5, .38]], [12, 13.5, "br_eye", [.5, .45]], [13.5, 16, "br_door", [.55, .5]]];
var SOLD = [["Storgatan 13", "Landskrona", "4 850 000 kr"], ["Kungsgatan 7", "Helsingborg", "5 295 000 kr"], ["Parkvägen 21", "Lund", "6 100 000 kr"], ["Strandvägen 3", "Malmö", "7 450 000 kr"],
            ["Björkgatan 18", "Landskrona", "3 975 000 kr"], ["Fyrvägen 5", "Höganäs", "5 890 000 kr"], ["Ekbacken 9", "Lund", "4 420 000 kr"], ["Skolgatan 12", "Helsingborg", "3 650 000 kr"]];
var PH_III = ["house", "terrace", "home", "bedroom", "dining", "porch", "beige", "h_hero"];
var FEED = ["home", "dining", "beige", "bedroom", "terrace", "house", "porch", "h_kitchen", "h_living"];
var END_V = 43;
function feed(c, G, t, t0){
  var H = G.H, tw = 26.4, th = 21, gap = 2.4, rows, p = 25*t + 135*t*t, rowH = th + gap + 5, r0 = Math.floor(p/rowH) - 1, r, ci, x, y, idx;
  v3Fill(c, 0, 0, 100, H, "#0a0a0a");
  for(r = r0; r < r0 + Math.ceil(H/rowH) + 3; r++){
    for(ci = 0; ci < 3; ci++){
      idx = ((r*3 + ci)*7 + (r % 3)) % FEED.length; if(idx < 0) idx += FEED.length;
      x = 8 + ci*(tw + gap); y = r*rowH - p + 6;
      if(y < -rowH || y > H + rowH) continue;
      v3Photo(c, FEED[idx], x, y, tw, th, {scale:1.15, pos:[.5, .5]});
      v3Fill(c, x, y, tw, th, "#8a8a8a", .38);
      v3Fill(c, x, y + th + 1.4, tw*.5, .9, "#fff", .3); v3Fill(c, x, y + th + 3.2, tw*.32, .9, "#fff", .18);
    }
  }
  tone(c, G, 1, .2);
}
function ticker(c, G, t, t0){
  var R = {x0:8, x1:92}, y1 = G.H - G.bot, n = 5, rh = G.is9 ? 10.6 : 9.2, top = y1 - n*rh - 2, i;
  v3Grad(c, 0, top - 22, 100, y1 - top + 26, [[0, "rgba(5,5,5,0)"], [.35, "rgba(5,5,5,.78)"], [1, "rgba(5,5,5,.94)"]]);
  var k = Math.floor((t - t0)/(BT*.5)); /* en ny rad var halv takt */
  for(i = 0; i < n; i++){
    var rowIdx = k - i; if(rowIdx < 0) continue;
    var row = SOLD[rowIdx % SOLD.length], age = (t - t0) - rowIdx*BT*.5, enter = oQ(k3(age, 0, .2)), y = top + i*rh + (1 - enter)*-3, a = enter*(1 - i*.14);
    v3Line(c, R.x0, R.x1, y, "rgba(255,255,255,.18)", .15, 1, a);
    v3Text(c, "SÅLD", R.x0, y + 6.7, {size:1.7, weight:700, f:"sans", sp:.3, color:C3.olil, alpha:a});
    v3Text(c, row[0], R.x0 + 12, y + 6.9, {size:4.2, weight:400, color:"#fff", alpha:a});
    v3Text(c, row[1].toUpperCase(), R.x0 + 12, y + 9.3, {size:1.3, weight:500, f:"sans", sp:.26, color:"rgba(255,255,255,.55)", alpha:a});
    v3Text(c, row[2], R.x1, y + 6.8, {size:2.5, weight:600, f:"sans", color:"#fff", align:"r", alpha:a});
  }
}
function drawVem(c, G, t, o){
  var H = G.H, b = t/BT, i, ci;
  v3Fill(c, 0, 0, 100, H, DARK);
  var shutters = [.5, 3, 5, 6.5, 8.5, 10, 12, 13.5], act3 = b >= 25.5 && b < 34;
  if(b < 16){
    for(i = 0; i < SHOTS_I.length; i++){ var s = SHOTS_I[i]; if(shot(c, G, t, s[0], s[1], s[2], {s0:1.22, s1:1.05, pos:s[3]})) break }
    tone(c, G, 0, 0);
  } else if(b < 24){
    var t0 = T(16);
    feed(c, G, t - t0, t0);
    var wh = 1 - ioC(k3(t - t0, 0, .35)); if(wh > 0) v3Fill(c, 0, 0, 100, H, "#fff", wh);
  } else if(act3){
    var ia = Math.min(PH_III.length - 1, Math.floor(b - 25.5)), ta = T(25.5 + ia);
    shot(c, G, t, 25.5 + ia, 26.5 + ia, PH_III[ia], {s0:1.18, s1:1.04});
    v3Grad(c, 0, H*.3, 100, H*.7, [[0, "rgba(5,5,5,0)"], [1, "rgba(5,5,5,.88)"]]);
    v3Grad(c, 0, 0, 100, H*.2, [[0, "rgba(5,5,5,.45)"], [1, "rgba(5,5,5,0)"]]);
    ticker(c, G, t, T(25.5));
  } else if(b >= 34 && b < 39){
    shot(c, G, t, 34, 39, "br_photog", {s0:1.25, s1:1.04, pos:[.5, .5]}); tone(c, G, 1, .1);
  } else if(b >= 40 && b < END_V + .6){
    /* knappen */
    var u = oQ(k3(b, 40.4, 41.3)), cx = 50, cy = G.cy + 2, w = 58, h = 9, press = k3(b, 41.45, 41.6)*(1 - k3(b, 41.7, 41.95));
    var capI = CAPS_V.length - 1, label = capText("vem", capI, CAPS_V[capI][1]);
    c.save(); c.globalAlpha = u; c.shadowColor = "rgba(255,255,255,.25)"; c.shadowBlur = 5 + 3*Math.sin(t*5); c.fillStyle = "#fff";
    var bw = w*(1 - .05*press), bh = h*(1 - .05*press); c.beginPath(); c.moveTo(cx - bw/2 + bh/2, cy - bh/2); c.arcTo(cx + bw/2, cy - bh/2, cx + bw/2, cy + bh/2, bh/2); c.arcTo(cx + bw/2, cy + bh/2, cx - bw/2, cy + bh/2, bh/2); c.arcTo(cx - bw/2, cy + bh/2, cx - bw/2, cy - bh/2, bh/2); c.arcTo(cx - bw/2, cy - bh/2, cx + bw/2, cy - bh/2, bh/2); c.closePath(); c.fill(); c.restore();
    v3Text(c, label.toUpperCase(), cx - 1.8, cy + .85, {size:2.2, weight:600, f:"sans", sp:.26, color:"#0a0a0a", align:"c", alpha:u});
    c.save(); c.globalAlpha = u; c.strokeStyle = "#0a0a0a"; c.lineWidth = .35; c.lineCap = "round"; c.lineJoin = "round"; var ax = cx + v3Measure(c, label.toUpperCase(), {size:2.2, weight:600, f:"sans", sp:.26})/2 + 1.8 - 1.8;
    c.beginPath(); c.moveTo(ax, cy); c.lineTo(ax + 3.2, cy); c.moveTo(ax + 2.2, cy - 1.1); c.lineTo(ax + 3.2, cy); c.lineTo(ax + 2.2, cy + 1.1); c.stroke(); c.restore();
    var cp = ioC(k3(b, 40.7, 41.45)), curX = lerp(104, cx + 8, cp), curY = lerp(H - 20, cy + 3, cp) - Math.sin(cp*Math.PI)*4;
    v3Cursor(c, curX, curY, press, k3(b, 40.7, 41.0));
    v3Tap(c, cx + 8, cy + 3, k3(b, 41.5, 42.2));
  }
  if(!(b >= 16 && b < 24) && !act3) finish(c, G, t, {vig:b >= 40 ? .5 : .66});
  if(act3) finish(c, G, t, {vig:.5});
  if(b >= 16 && b < 24) finish(c, G, t, {vig:.7});
  shutters.forEach(function(h){ flash(c, G, t, T(h), .55, .1) });
  for(i = 0; i < 8; i++) flash(c, G, t, T(25.5 + i), i ? .4 : 1, i ? .1 : .3);
  flash(c, G, t, T(34), .3, .12); flash(c, G, t, T(41.5), .6, .14); flash(c, G, t, T(END_V - .08), .9, .25);
  capsDraw(c, G, t, "vem", CAPS_V);
}

/* ---------- komposition ---------- */
window.V3_BR = [];
(function(){
  var outroAt = T(END_V), comp = {n:"Förutom några.", d:"Ett ögonblick som avgör allt, en bransch där allt ser likadant ut, och en cliffhanger. Ingen produkt visas.", group:"brand", dur:outroAt + 4.4, thumb:T(12.8), caps:CAPS_V, id:"br_vem", v:{id:"br_vem"}, endAt:outroAt,
    cin:{bpm:BPM, kick:[3, 24], hat:[12, 24], pluck:[10, 24], snare:[17, 24], riser:[17, 24], sil:[24, 25.5], quiet:null, drop:25.5, calm:34, suspend:true, cta:41.5, tick:[0, 9], hits:[],
         shut:[.5, 3, 5, 6.5, 8.5, 10, 12, 13.5, 25.5, 26.5, 27.5, 28.5, 29.5, 30.5, 31.5, 32.5, 34]}};
  comp.draw = function(c, G, t, o){
    if(t < outroAt + .6) drawVem(c, G, t, o);
    if(t >= outroAt) v3Outro(c, G, o.outro, t - outroAt);
  };
  V3_COMPS.br_vem = comp; V3_BR.push("br_vem");
})();

/* ---------- ljudet: uppbyggnad, tystnad, släpp ---------- */
var CH = [[33, [57, 60, 64], [69, 72, 76]], [29, [53, 57, 60], [65, 69, 72]], [36, [55, 60, 64], [67, 72, 76]], [31, [55, 59, 62], [67, 71, 74]]];
window.v3CinScore = function(ctx, comp){
  var C = comp.cin, bt = 60/C.bpm, dur = comp.dur, TT = function(b){ return b*bt }, sr = ctx.sampleRate;
  var master = ctx.createGain(); master.gain.value = .46;
  var comp1 = ctx.createDynamicsCompressor(); comp1.threshold.value = -9; comp1.ratio.value = 2.5; comp1.attack.value = .004; comp1.release.value = .2; comp1.knee.value = 8;
  var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 14000;
  var fade = ctx.createGain(); fade.gain.setValueAtTime(1, Math.max(0, dur - 1.6)); fade.gain.linearRampToValueAtTime(0, dur);
  var lim = ctx.createDynamicsCompressor(); lim.threshold.value = -4; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .1; lim.knee.value = 0;
  master.connect(comp1); comp1.connect(lp); lp.connect(lim); lim.connect(fade); fade.connect(ctx.destination);
  var rl = Math.floor(sr*3.2), ir = ctx.createBuffer(2, rl, sr), ch, i;
  for(ch = 0; ch < 2; ch++){ var d = ir.getChannelData(ch); for(i = 0; i < rl; i++) d[i] = (Math.random()*2 - 1)*Math.pow(1 - i/rl, 2.4) }
  var conv = ctx.createConvolver(); conv.buffer = ir; var wet = ctx.createGain(); wet.gain.value = .32; conv.connect(wet); wet.connect(master);
  var dry = ctx.createGain(); dry.gain.value = 1; dry.connect(master);
  var out = function(n, g, send){ var a = ctx.createGain(); a.gain.value = g == null ? 1 : g; n.connect(a); a.connect(dry); if(send){ var s = ctx.createGain(); s.gain.value = send; a.connect(s); s.connect(conv) } return a };
  var mtof = function(m){ return 440*Math.pow(2, (m - 69)/12) };
  var noiseBuf = function(len){ var bf = ctx.createBuffer(1, Math.max(1, Math.floor(sr*len)), sr), dd = bf.getChannelData(0), k; for(k = 0; k < dd.length; k++) dd[k] = Math.random()*2 - 1; return bf };

  var kick = function(t, v){
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(46, t + .12);
    var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .42); o.connect(g); out(g); o.start(t); o.stop(t + .45);
    var n = ctx.createBufferSource(); n.buffer = noiseBuf(.02); var ng = ctx.createGain(); ng.gain.setValueAtTime(v*.3, t); ng.gain.exponentialRampToValueAtTime(.001, t + .015); n.connect(ng); out(ng); n.start(t);
  };
  var hat = function(t, v, open){
    var n = ctx.createBufferSource(); n.buffer = noiseBuf(open ? .18 : .05); var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7200;
    var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + (open ? .17 : .04)); n.connect(hp); hp.connect(g); out(g); n.start(t);
  };
  var snare = function(t, v){
    var n = ctx.createBufferSource(); n.buffer = noiseBuf(.2); var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2100; bp.Q.value = .7;
    var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .15); n.connect(bp); bp.connect(g); out(g, 1, .25); n.start(t);
    var o = ctx.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + .08);
    var g2 = ctx.createGain(); g2.gain.setValueAtTime(v*.5, t); g2.gain.exponentialRampToValueAtTime(.001, t + .1); o.connect(g2); out(g2); o.start(t); o.stop(t + .12);
  };
  var clap = function(t, v){ [0, .011, .024].forEach(function(dt){ var n = ctx.createBufferSource(); n.buffer = noiseBuf(.12); var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1500; bp.Q.value = 1.1;
    var g = ctx.createGain(); g.gain.setValueAtTime(v, t + dt); g.gain.exponentialRampToValueAtTime(.001, t + dt + .1); n.connect(bp); bp.connect(g); out(g, 1, .3); n.start(t + dt) }) };
  var bass = function(t, m, d2, v){
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = mtof(m); var o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = mtof(m + 12);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .02); g.gain.setTargetAtTime(0, t + d2*.6, d2*.25);
    var g2 = ctx.createGain(); g2.gain.value = .25; o.connect(g); o2.connect(g2); g2.connect(g); out(g); o.start(t); o2.start(t); o.stop(t + d2 + .3); o2.stop(t + d2 + .3);
  };
  var pad = function(t, d2, notes, v, c0, c1){
    var f = ctx.createBiquadFilter(); f.type = "lowpass"; f.Q.value = .6; f.frequency.setValueAtTime(c0, t); f.frequency.exponentialRampToValueAtTime(c1, t + d2);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + Math.min(1.2, d2*.4)); g.gain.setValueAtTime(v, t + Math.max(.1, d2 - .5)); g.gain.linearRampToValueAtTime(0, t + d2);
    f.connect(g); out(g, 1, .5);
    notes.forEach(function(m){ [-6, 0, 7].forEach(function(dt){ var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = dt; var gg = ctx.createGain(); gg.gain.value = .33; o.connect(gg); gg.connect(f); o.start(t); o.stop(t + d2 + .1) }) });
  };
  var pluck = function(t, m, v, cut){
    var f = ctx.createBiquadFilter(); f.type = "lowpass"; f.Q.value = 3; f.frequency.setValueAtTime(cut, t); f.frequency.exponentialRampToValueAtTime(Math.max(300, cut*.18), t + .22);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .004); g.gain.exponentialRampToValueAtTime(.001, t + .3); f.connect(g); out(g, 1, .35);
    [0, 6].forEach(function(dt, k){ var o = ctx.createOscillator(); o.type = k ? "square" : "sawtooth"; o.frequency.value = mtof(m); o.detune.value = dt; var gg = ctx.createGain(); gg.gain.value = k ? .25 : .5; o.connect(gg); gg.connect(f); o.start(t); o.stop(t + .32) });
  };
  var piano = function(t, m, v, d2){
    var f = mtof(m), bus = ctx.createGain(); bus.gain.value = v*.36; var tone2 = ctx.createBiquadFilter(); tone2.type = "lowpass"; tone2.frequency.value = Math.min(7000, 1400 + f*5); bus.connect(tone2); out(tone2, 1, .45);
    [1, .5, .26, .13, .07].forEach(function(a, k){ var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f*(k + 1)*(1 + .0003*(k + 1)*(k + 1)); var g = ctx.createGain(), tau = d2/(1 + k*.9);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + .007); g.gain.setTargetAtTime(0, t + .01, tau/3.2); o.connect(g); g.connect(bus); o.start(t); o.stop(t + d2 + .3) });
  };
  var riser = function(t, d2, v){
    var n = ctx.createBufferSource(); n.buffer = noiseBuf(d2 + .1); var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = .8; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(9000, t + d2);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.exponentialRampToValueAtTime(v, t + d2*.97); g.gain.linearRampToValueAtTime(0, t + d2); n.connect(f); f.connect(g); out(g, 1, .3); n.start(t);
    var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(1760, t + d2); var f2 = ctx.createBiquadFilter(); f2.type = "lowpass"; f2.frequency.setValueAtTime(400, t); f2.frequency.exponentialRampToValueAtTime(6000, t + d2);
    var g2 = ctx.createGain(); g2.gain.setValueAtTime(0, t); g2.gain.exponentialRampToValueAtTime(v*.5, t + d2*.97); g2.gain.linearRampToValueAtTime(0, t + d2); o.connect(f2); f2.connect(g2); out(g2); o.start(t); o.stop(t + d2 + .05);
  };
  var revCym = function(t, d2, v){ var n = ctx.createBufferSource(); n.buffer = noiseBuf(d2); var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3500;
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.exponentialRampToValueAtTime(v, t + d2*.98); g.gain.linearRampToValueAtTime(0, t + d2); n.connect(hp); hp.connect(g); out(g, 1, .4); n.start(t) };
  var impact = function(t, v){
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(30, t + 1.6);
    var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + 2.2); o.connect(g); out(g); o.start(t); o.stop(t + 2.3);
    var n = ctx.createBufferSource(); n.buffer = noiseBuf(2.4); var f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(9000, t); f.frequency.exponentialRampToValueAtTime(400, t + 2.2);
    var g2 = ctx.createGain(); g2.gain.setValueAtTime(v*.55, t); g2.gain.exponentialRampToValueAtTime(.001, t + 2.3); n.connect(f); f.connect(g2); out(g2, 1, .55); n.start(t);
  };
  var tok = function(t, k, v){
    var sc = [0, 3, 5, 7, 10, 12, 15, 17], m = 69 + sc[k % sc.length];
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = mtof(m); var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .003); g.gain.exponentialRampToValueAtTime(.001, t + .35);
    o.connect(g); out(g, 1, .5); o.start(t); o.stop(t + .4);
    var n = ctx.createBufferSource(); n.buffer = noiseBuf(.012); var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2500; var gn = ctx.createGain(); gn.gain.value = v*.6; n.connect(hp); hp.connect(gn); out(gn); n.start(t);
  };

  var shutter = function(t, v){
    var n = ctx.createBufferSource(); n.buffer = noiseBuf(.03); var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3200; bp.Q.value = 1.2;
    var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .025); n.connect(bp); bp.connect(g); out(g, 1, .15); n.start(t);
    var n2 = ctx.createBufferSource(); n2.buffer = noiseBuf(.05); var bp2 = ctx.createBiquadFilter(); bp2.type = "bandpass"; bp2.frequency.value = 1800; bp2.Q.value = 1;
    var g2 = ctx.createGain(); g2.gain.setValueAtTime(v*.8, t + .055); g2.gain.exponentialRampToValueAtTime(.001, t + .09); n2.connect(bp2); bp2.connect(g2); out(g2); n2.start(t + .055);
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(90, t + .07); var g3 = ctx.createGain(); g3.gain.setValueAtTime(v*.7, t); g3.gain.exponentialRampToValueAtTime(.001, t + .09); o.connect(g3); out(g3); o.start(t); o.stop(t + .1);
  };
  var tick = function(t, k, v){
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = k ? 1050 : 1500; var g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .06);
    o.connect(g); out(g, 1, .25); o.start(t); o.stop(t + .08);
    var n = ctx.createBufferSource(); n.buffer = noiseBuf(.008); var gn = ctx.createGain(); gn.gain.value = v*.5; n.connect(gn); out(gn); n.start(t);
  };
  var b, chordAt = function(bb){ return CH[Math.floor(bb/4) % 4] };
  var sil0 = C.sil[0], drop = C.drop, k0 = C.kick[0], k1 = C.kick[1];
  /* i. uppbyggnad: puls, hattar, arpeggio, virvel — allt stiger */
  pad(TT(0), TT(sil0), [33, 40, 45], .07, 140, 2600);
  for(b = k0; b < k1; b += 1){ var pr = (b - k0)/(k1 - k0); kick(TT(b), .1 + .62*pr*pr + .1*pr); if(b % 4 === 0) bass(TT(b), chordAt(b)[0], 1.8, .12 + .4*pr) }
  for(b = C.hat[0]; b < C.hat[1]; b += .5){ hat(TT(b), .015 + .07*(b - C.hat[0])/(C.hat[1] - C.hat[0]), false) }
  for(b = C.pluck[0]; b < C.pluck[1]; b += .5){
    var pp = (b - C.pluck[0])/(C.pluck[1] - C.pluck[0]), ch2 = chordAt(b), idx = Math.floor((b - C.pluck[0])*2) % 6, note = [ch2[2][0], ch2[2][1], ch2[2][2], ch2[2][1], ch2[2][2], ch2[2][1]][idx];
    pluck(TT(b), note - 12*(idx % 2), .02 + .13*pp, 600 + 5600*pp);
  }
  /* virvelrull som blir tätare */
  var sA = C.snare[0], sB = C.sil[0], span = sB - sA, tt2 = sA, step;
  while(tt2 < sB - .01){ var pg = (tt2 - sA)/span; step = pg < .4 ? .5 : pg < .7 ? .25 : pg < .9 ? .125 : .0625; snare(TT(tt2), .05 + .3*pg*pg); tt2 += step }
  riser(TT(C.riser[0]), TT(sil0) - TT(C.riser[0]), .09);
  /* ii. tystnad: bara ett svagt hjärtslag och efterklang, sedan stopp */
  if(C.quiet){
    kick(TT(C.sil[0] + .5), .22); kick(TT(C.sil[0] + .5 + .45), .14);
    pad(TT(C.quiet[0]), TT(C.quiet[1]) - TT(C.quiet[0]) - .05, [45, 52, 57], .06, 300, 900);
    piano(TT(C.quiet[0] + .5), 57, .3, 3); piano(TT(C.quiet[0] + 1.5), 60, .24, 3); if(C.quiet[1] - C.quiet[0] > 3) piano(TT(C.quiet[0] + 3), 64, .26, 3.5);
  }
  revCym(TT(drop) - 1.1, 1.1, .1);
  /* iii. släppet: slag, full takt, ljus */
  impact(TT(drop), 1.0);
  var calm = C.calm;
  pad(TT(drop), TT(calm) - TT(drop), [45, 52, 57, 64], .08, 900, 5200);
  for(b = drop; b < calm; b += 1){
    var ch3 = chordAt(b - drop), beatN = Math.round(b - drop);
    kick(TT(b), .95);
    if(beatN % 2 === 1) clap(TT(b), .2);
    hat(TT(b + .5), .07, true); hat(TT(b + .25), .03, false); hat(TT(b + .75), .03, false);
    if((b - drop) % 4 === 0){ bass(TT(b), ch3[0], 1.9, .5); [0, 1, 2].forEach(function(k){ piano(TT(b) + k*.012, ch3[1][k], .34, 2.2) }) }
    if((b - drop) % 4 === 2) bass(TT(b), ch3[0] + 7, .9, .36);
    var arp = ch3[2], q2;
    for(q2 = 0; q2 < 4; q2++){ pluck(TT(b + q2*.25), arp[(beatN*4 + q2) % 3] + (q2 % 2 ? 12 : 0), .08, 6200) }
  }
  /* iv. andas ut: ett långt a-mollackord som ljusnar mot a-dur, och slutkortets ackord */
  var end = TT(calm), outro = comp.endAt != null ? comp.endAt : end;
  if(C.suspend){
    pad(end, TT(C.cta != null ? C.cta : calm + 6) - end, [45, 52, 59], .07, 260, 800);
    piano(end + .05, 45, .45, 6); [59, 64, 66].forEach(function(m, k){ piano(end + .4 + k*.9, m, .26, 4) });
    for(b = calm; b < (C.cta != null ? C.cta - 1 : calm + 6); b += 2) kick(TT(b), .12);
  } else {
  piano(end + .05, 45, .5, 5); [57, 64, 69, 72, 76].forEach(function(m, k){ piano(end + .1 + k*.05, m, k ? .3 : .45, 5) });
  }
  bass(end, 33, 4, .5);
  piano(outro + .1, 38, .5, 5); [57, 61, 64, 69, 73].forEach(function(m, k){ piano(outro + .15 + k*.05, m, .32, 5) });
  [1320, 1980, 2640].forEach(function(fr, k){ var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = fr; var g = ctx.createGain(); g.gain.setValueAtTime(0, outro + .6); g.gain.linearRampToValueAtTime(.05/(1 + k), outro + .61); g.gain.setTargetAtTime(0, outro + .7, .6); o.connect(g); out(g, 1, .5); o.start(outro + .6); o.stop(outro + 3.5) });
  /* kameraslut vid varje bildbyte, tickande klocka i inledningen */
  (C.shut || []).forEach(function(sb){ shutter(TT(sb), .22) });
  if(C.tick) for(b = C.tick[0], i = 0; b < C.tick[1]; b += 1, i++) tick(TT(b), i % 2, .05 + .07*(b - C.tick[0])/(C.tick[1] - C.tick[0]));
  if(C.cta != null){ riser(TT(C.cta) - 1.4, 1.4, .06); tok(TT(C.cta), 7, .14); shutter(TT(C.cta), .25) }
  /* ordens klick, ett per inklippt ord, stiger i tonhöjd */
  var ci = 0; (comp.caps || []).forEach(function(cp, k){ if(cp[4] === "ui" || cp[4] === "cta") return; tok(TT(cp[0]), ci++, .1) });
  /* markörens klick i gränssnittet */
  (comp.uiTaps || []).forEach(function(tp){ tok(tp, 5, .07) });
  /* träffar */
  (C.hits || []).forEach(function(h){ kick(TT(h), .35) });
};


/* ---------- sidan ---------- */
function brEditor(){
  return '<details class="a3det a3cust" open><summary>Ändra orden i filmen</summary><p class="a3hint">Varje rad är ord som klipps in på takten, två–tre åt gången. Kortare är bättre. Sista raden är knappens text.</p><div class="a3hxs">'
    + CAPS_V.map(function(cp, i){ return '<label class="a3f"><span>' + (i + 1) + ' · takt ' + cp[0] + (cp[4] === "cta" ? ' · knappen' : '') + '</span><input type="text" value="' + esc(String(capText("vem", i, cp[1]))) + '" data-a3bx="vem|' + i + '"></label>' }).join("")
    + '</div></details>';
}
function outroEd(){
  var f = v3TxField;
  return '<details class="a3det a3cust" open><summary>Ändra slutkortets text</summary><div class="a3custg"><div>' + f("outro.tag1", "Slagord rad 1") + f("outro.tag2", "Slagord rad 2 (kursiv)") + '</div><div>' + f("outro.aud", "Målgruppsrad") + f("outro.url", "Adress / länk") + '<button type="button" class="a3mini" data-a3="reset" style="margin-top:6px">Återställ allt</button></div></div></details>';
}
function para(h, body){ return '<div class="a3pc"><h4>' + h + '</h4>' + body + '</div>' }
var BR_FIRST = true;
window.secBrand = function(){
  if(V3_BR.indexOf(V3S.comp) < 0){ V3S.comp = "br_vem"; V3S.t = V3_COMPS.br_vem.thumb; V3S.playing = false; v3StopSound() }
  if(BR_FIRST){ BR_FIRST = false; V3S.outro = "mork" }
  var comp = V3_COMPS[V3S.comp], outs = V3_OUT.map(function(o){ return v3Seg("outro", o.id, o.n, V3S.outro === o.id) }).join("");
  setTimeout(v3Mount, 0);
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Varumärke · 13</div><h2>Varumärkesfilm för mäklare</h2>'
    + '<p>Inte en annons och inget produktvisande. En film som skapar nyfikenhet och lämnar en cliffhanger: ett ögonblick som avgör allt, en bransch där allt ser likadant ut, och en fråga som mäklaren inte släpper. Förslag, inget publicerat.</p></div>'
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
    + brEditor() + outroEd()
    + '<div class="a3sub">Idén</div><div class="a3plan">'
    + para("Förebilden och vår version", '<p>Förebilden gör fyra saker: den öppnar med ögonblick som alla känner igen och som fick världen att stanna upp, den vänder det mot sin egen målgrupp, den ger socialt bevis i form av en ström av resultat, och den slutar med en knapp och en rad. Produkten förklaras aldrig.</p><p>Vår version följer samma kurva, men i mäklarens värld: <b>historien minns dem som fick världen att stanna upp. På en skärm ser nästan alla bostäder likadana ut. Förutom några.</b> Sedan en ström av sålda objekt, och en fråga: vad vet de som du inte vet? Knappen: Ta reda på det.</p>')
    + para("Dramaturgin", '<table class="a3tb"><tr><th>0–8 s</th><td><b>Prestige.</b> Månen, raketen, mållinjen, scenen. Svartvitt, kamerasluten klickar på varje bild, en klocka tickar. "Vissa ögonblick avgör allt."</td></tr><tr><td colspan="2"></td></tr><tr><th>8–12 s</th><td><b>Tesen.</b> Hoppet, jorden, ögat, dörren som öppnas mot ljus. "Historien minns dem som fick världen att stanna upp."</td></tr><tr><th>12–15 s</th><td><b>Vändningen.</b> Flöde av bostäder som scrollas förbi, snabbare och snabbare. "På en skärm ser nästan alla bostäder likadana ut. Köparen scrollar vidare."</td></tr><tr><th>15 s</th><td><b>Stillhet.</b> Svart. "Förutom några."</td></tr><tr><th>15–20 s</th><td><b>Släppet.</b> Färg, slag och en ström av sålda objekt. "Några mäklare vinner uppdraget innan de ens har ringt."</td></tr><tr><th>20–24 s</th><td><b>Cliffhangern.</b> Fotografen i siluett i ett tomt rum. "Vad vet de som du inte vet?" Musiken löser sig inte.</td></tr><tr><th>24–26 s</th><td><b>Knappen och varumärket.</b> "Ta reda på det." Slutkortet löser ackordet.</td></tr></table>')
    + '</div>'
    + '<div class="a3sub">Hur man pratar med en mäklare</div><div class="a3plan">'
    + para("Det som väcker en mäklare", '<ul><li><b>Uppdraget.</b> Mäklarens valuta är att vinna uppdraget. Säljaren väljer den som presenterar bäst. Allt handlar om att vinna rummet innan det börjar.</li><li><b>Resultat, inte funktioner.</b> Sålt är språket. Siffror och namn på objekt väger mer än adjektiv.</li><li><b>Skärmen är arenan.</b> Köparens första visning sker på en skärm. Den som stannar blicken vinner.</li><li><b>Status och yrkesstolthet.</b> Mäklaren vill se proffsig ut inför säljaren. Det är varumärke, inte teknik.</li><li><b>Insiderkänsla.</b> "De som redan vet" är starkare än "alla borde".</li></ul>')
    + para("Hur vi låter", '<p>Korta, trygga meningar. Understatement: inga utropstecken, inga superlativ, ingen jargong. Ett påstående per scen. Frågor som inte besvaras. Svenska, torrt, självsäkert, lite hårt.</p><p>Vi lovar inga priser eller försäljningsresultat. Vi påstår ingenting som inte går att stå för.</p>')
    + para("Vad Viewly är i filmen", '<p>Aldrig en lista på tjänster. Viewly är det som syns när blicken stannar: fotografiet. Därför är den sista bilden före slutkortet fotografen, i siluett, i ett tomt rum med ljuset som faller in. Det är svaret på frågan, utan att säga det.</p>')
    + para("Knappen", '<p>"Ta reda på det" leder till den första konverteringen: bokning av provfotografering (verifierat på viewly.se/maklare). Texten är ett förslag och ändras i fältet ovan.</p>')
    + '</div>'
    + '<details class="a3det"><summary>Underlag, rättigheter och vad som inte är klart</summary><div class="a3und"><div><b>Bildmaterial</b><p>De nio bilderna i inledningen (astronaut, raket, löpare, scen, basketspelare, jorden, öga, fotograf, dörr) är <b>AI-genererade stilleben</b> i dokumentär svartvit stil, tagna fram för det här förslaget. De föreställer inga verkliga personer och är inte arkivmaterial. Månens, raketens och jordens motiv liknar välkända bilder, men är egna. Innan publicering: bestäm om de ska ersättas med licensierat material eller eget filmat material, och märk AI-bilder om det krävs.</p></div>'
    + '<div><b>SÅLD-listan</b><p>Adresserna, orterna och priserna i strömmen är <b>exempeldata</b> och finns inte. Byt mot riktiga sålda objekt med mäklarens och säljarens godkännande, eller ta bort priserna.</p></div>'
    + '<div><b>Texten</b><p>Raderna är förslag. "Några mäklare vinner uppdraget innan de ens har ringt" är ett resonemang, inte en mätning. Kontrollera att det går att stå för.</p></div>'
    + '<div><b>Ljud</b><p>Syntetiserat och ohört av mig: klocka, kameraslut, puls, riser, tystnad, släpp, hängande ackord och ett slutackord. För lansering bör en kompositör göra en egen version med samma struktur.</p></div></div></details></div>';
};
})();
