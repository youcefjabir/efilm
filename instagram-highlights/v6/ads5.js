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
    cp = CAPS[i]; t0 = T(cp[0]); t1 = T(cp[0] + (cp[3] || 2)); if(t < t0 || t >= t1) continue;
    txt = capText(film, i, cp[1]); if(!txt) continue; ink = cp[4] === "ui";
    u = t - t0; size = sizes[sizes.length - 1];
    for(k = 0; k < sizes.length; k++){ w = v3Measure(c, txt, {size:sizes[k], weight:300, italic:!!cp[2]}); if(w <= 82){ size = sizes[k]; break } }
    if(ink){ size = Math.min(size, 6.6) } else if(cp[4] === "low"){ size = Math.min(size, 8.6) }
    sc = 1 + .08*(1 - oQ(k3(u, 0, .16)));
    y = ink ? G.H - G.bot - 6 : cp[4] === "low" ? G.H - G.bot - 7 : G.cy + size*.3;
    c.save(); c.translate(50, y); c.scale(sc, sc); c.translate(-50, -y);
    v3Text(c, txt, 50, y, {size:size, weight:300, italic:!!cp[2], color:ink ? C3.ink : (cp[2] ? C3.cream : "#fff"), align:"c", shadow:!ink, sp:cp[2] ? 0 : 0});
    c.restore();
  }
}
function progress(c, G, t, dur){
  var y = G.H - G.bot + (G.is9 ? 2.6 : 3.4);
  v3Fill(c, 8, y, 84, .18, "#fff", .18); v3Fill(c, 8, y, 84*Math.min(1, t/dur), .18, "#fff", .7);
}

/* ---------- filmerna ---------- */
var SC = {};
/* A — Ett hem säljs en gång */
var CAPS_A = [
  [1, "Varje hem", 0, 2], [3, "säljs bara", 0, 2], [5, "en gång.", 1, 2.6],
  [8, "Första visningen", 0, 2], [10, "sker på", 0, 1.5], [11.5, "en skärm.", 1, 2.4],
  [14, "Därför", 0, 1], [15, "räcker det", 0, 1.5], [16.5, "inte", 0, 1], [17.5, "att dokumentera.", 0, 1.8],
  [19, "Ljus.", 0, 1], [20, "Rum.", 0, 1], [21, "Rörelse.", 0, 1], [22, "Läge.", 0, 1],
  [23.5, "Det handlar om", 0, 2], [25.5, "att få någon", 0, 1.5], [27, "att stanna.", 1, 2],
  [30, "Tänk om", 0, 2], [32, "allt fanns", 0, 1.5], [33.5, "på ett ställe?", 1, 1.5],
  [37.4, "Välj bild.", 0, 2.4, "ui"], [40, "Välj mall.", 0, 2.4, "ui"], [42.6, "Klart.", 1, 2.4, "ui"],
  [49, "Gör första", 0, 1.5], [50.5, "intrycket rätt.", 1, 2.4]];
var SHOTS_A = [[0, 3, "house"], [3, 5, "porch"], [5, 7, "terrace"], [7, 9, "bedroom"], [9, 11, "home"], [11, 13, "h_dining2"], [13, 15, "beige"],
  [15, 16.5, "h_living"], [16.5, 17.5, "h_boucle"], [17.5, 19, "h_kitchen"], [19, 20, "h_hero"], [20, 21, "h_living"], [21, 22, "h_dining"], [22, 23, "h_drone"], [23, 29, "h_eames"]];
var END_A = 52.5;
function drawA(c, G, t, o){
  var H = G.H, b = t/BT, i;
  v3Fill(c, 0, 0, 100, H, DARK);
  if(b < 29.2){
    for(i = 0; i < SHOTS_A.length; i++){ var s = SHOTS_A[i]; if(shot(c, G, t, s[0], s[1], s[2], {s0:1.22, s1:1.05, pos:s[2] === "h_drone" ? [.5, .3] : null})) break }
    tone(c, G, 1, b < 1 ? lerp(1, .3, b) : .3 + (b > 24 ? .1 : 0));
    if(b >= 19 && b < 23) sweep(c, G, t, b - (b % 1), b - (b % 1) + .8);
  } else if(b >= 30 && b < 35){
    v3Photo(c, "blur", 0, 0, 100, H, {alpha:.38, scale:1.4 - .04*(b - 30)}); tone(c, G, 1, .2);
  } else if(b >= 35 && b < 48.5){
    v3Camp(c, G, (t - T(35))*2.4 + 1.0, {photo:"home", tpl:"editorial", picks:["terrace", "beige", "bedroom"], hook:o.hook});
  }
  var ui = b >= 35 && b < 48.5;
  if(!ui) finish(c, G, t, {vig:b > 30 && b < 35 ? .8 : .62});
  [5, 11.5, 19, 20, 21, 22, 27].forEach(function(h){ flash(c, G, t, T(h), .5, .14) });
  flash(c, G, t, T(35), 1, .3); flash(c, G, t, T(48.5), .0, .1);
  capsDraw(c, G, t, "hem", CAPS_A);
  if(!ui && b < 48.5) progress(c, G, t, T(48.5));
}
SC.hem = {n:"Ett hem säljs en gång", d:"Varumärket. Första intrycket sker på en skärm — gör det rätt.", end:END_A, draw:drawA, caps:CAPS_A, thumb:T(21.4),
  cin:{bpm:BPM, kick:[2, 29], hat:[12, 29], pluck:[8, 29], snare:[23, 29], riser:[20, 29], sil:[29, 30], quiet:[30, 35], drop:35, calm:48.5, hits:[5, 11.5, 19, 20, 21, 22, 27]}};

/* B — Sex kontakter. Eller en. */
var VEND = ["Fotograf.", "Filmare.", "3D-leverantör.", "Stylist.", "Textbyrå.", "Annonsverktyg."];
var CAPS_B = [
  [8, "Sex kontakter", 0, 1.8], [9.6, "för varje bostad.", 1, 2.4],
  [12, "Varje bokning.", 0, 1], [13, "Varje faktura.", 0, 1], [14, "Varje mapp.", 0, 1],
  [16.2, "Eller", 0, 1.4], [17.6, "en.", 1, 1.6],
  [32, "Mer tid för affären.", 0, 3], [35, "Mindre tid i mappar.", 1, 3]];
var PH_B = ["h_hero", "h_kitchen", "h_matterport", "h_esLivAft", "h_drone", "h_dining2", "h_living", "h_eames", "home", "terrace"];
var END_B = 38.5;
function drawB(c, G, t, o){
  var H = G.H, b = t/BT, i;
  v3Fill(c, 0, 0, 100, H, DARK);
  var ui = b >= 19.5 && b < 31;
  if(b < 8){
    var k = Math.min(5, Math.floor(b/1.5)); shot(c, G, t, k*1.5, k*1.5 + 1.5, PH_B[k], {s0:1.26, s1:1.08}); tone(c, G, 1, .5);
  } else if(b < 12){
    var q = Math.floor((b - 8)*4); v3Photo(c, PH_B[q % PH_B.length], 0, 0, 100, H, {scale:1.15 + (q % 3)*.05, pos:[.3 + (q % 4)*.15, .5]}); tone(c, G, 1, .18);
  } else if(b < 15){
    var k2 = Math.floor(b - 12); shot(c, G, t, 12 + k2, 13 + k2, PH_B[(k2 + 6) % PH_B.length], {s0:1.35, s1:1.05}); tone(c, G, 1, .38);
  } else if(ui){
    var lt = (t - T(19.5))*1.7; window.HL_BEATS.merge(c, G, lt, window.HL_SC_B, {num:"", name:""});
  } else if(b >= 31 && b < 33){
    v3Photo(c, "blur", 0, 0, 100, H, {alpha:.3, scale:1.4}); tone(c, G, 1, .25);
  }
  /* leverantörerna staplas, en per takt */
  if(b >= 1 && b < 12){
    var n = Math.min(6, Math.floor(b - 1) + 1), fade = 1 - ioC(k3(b, 8, 8.4)), size = 6.8, lh = 9.2, y0 = G.cy - (6*lh)/2 + 7;
    for(i = 0; i < n; i++){
      var tb = T(1 + i), age = t - tb, pop = oQ(k3(age, 0, .12)), last = i === n - 1;
      v3Text(c, VEND[i], 10, y0 + i*lh, {size:size, weight:400, color:"#fff", alpha:fade*(last ? 1 : .62)*pop, shadow:true, rise:1.2*(1 - pop), italic:false});
    }
    v3Text(c, String(n), 92, G.top + 10, {size:20, weight:300, color:"#fff", align:"r", alpha:fade*.9, shadow:true});
    for(i = 0; i < 6; i++) flash(c, G, t, T(1 + i), .38, .12);
  }
  if(!ui) finish(c, G, t, {vig:.66});
  [8, 9.6, 12, 13, 14, 17.6].forEach(function(h){ flash(c, G, t, T(h), .5, .14) });
  flash(c, G, t, T(19.5), 1, .3);
  capsDraw(c, G, t, "sex", CAPS_B);
  if(!ui && b < 31) progress(c, G, t, T(31));
}
SC.sex = {n:"Sex kontakter. Eller en.", d:"Systemet, riktad till mäklare. Från sex leverantörer till en yta.", end:END_B, draw:drawB, caps:CAPS_B, thumb:T(5.2),
  cin:{bpm:BPM, kick:[1, 15], hat:[6, 15], pluck:[4, 15], snare:[10, 15], riser:[8, 15], sil:[15, 19.5], quiet:[15.2, 19.5], drop:19.5, calm:31, hits:[1, 2, 3, 4, 5, 6, 8, 9.6, 12, 13, 14, 17.6]}};

/* C — Sju delar */
var CAPS_C = [
  [1, "Foto.", 0, 1.8], [3, "3D.", 0, 1.8], [5, "E-styling.", 0, 1.8], [7, "Atmosphere.", 0, 1.8], [9, "Drönare.", 0, 1.4], [10.5, "Karta.", 0, 1.3], [12, "Motion.", 1, 1.6],
  [14.5, "Sju delar.", 0, 2.4, "low"], [17, "Ett ekosystem.", 1, 2.4, "low"],
  [27.4, "Ett objekt.", 0, 1.6], [29, "Hela marknadsföringen.", 1, 2.6]];
var END_C = 32.5;
function drawC(c, G, t, o){
  var H = G.H, b = t/BT, i;
  v3Fill(c, 0, 0, 100, H, DARK);
  var bwA = b < 14 ? 1 : 1 - ioC(k3(b, 14, 15)), ui = b >= 14;
  if(b < 14){
    if(b >= 1 && b < 3) shot(c, G, t, 1, 3, "h_hero", {s0:1.3, s1:1.06});
    else if(b >= 3 && b < 5){ shot(c, G, t, 3, 5, "h_matterport", {s0:1.1, s1:1.0}); sweep(c, G, t, 3.2, 4.8) }
    else if(b >= 5 && b < 7){
      var u = ioC(k3(b, 5.4, 6.8)); v3Photo(c, "h_esLivBef", 0, 0, 100, H, {scale:1.08}); c.save(); c.beginPath(); c.rect(0, 0, 100*u, H); c.clip(); v3Photo(c, "h_esLivAft", 0, 0, 100, H, {scale:1.08}); c.restore();
      v3Fill(c, 100*u - .12, 0, .24, H, "#fff", u > 0 && u < 1 ? .8 : 0);
    } else if(b >= 7 && b < 9){
      var u2 = ioC(k3(b, 7.4, 8.8)); v3Photo(c, "h_skyBef", 0, 0, 100, H, {scale:1.08}); c.save(); c.beginPath(); c.rect(0, 0, 100*u2, H); c.clip(); v3Photo(c, "h_skyAft", 0, 0, 100, H, {scale:1.08}); c.restore();
      v3Fill(c, 100*u2 - .12, 0, .24, H, "#fff", u2 > 0 && u2 < 1 ? .8 : 0);
    } else if(b >= 9 && b < 10.5) shot(c, G, t, 9, 10.5, "h_drone", {s0:1.4, s1:1.05, pos:[.5, .35]});
    else if(b >= 10.5 && b < 12){
      window.HL_BEATS.map(c, G, 2.2 + (t - T(10.5)), {k:"", h:"", items:["Kommunikationer", "Skolor", "Service", "Natur"], dur:6}, {num:"", name:""});
      c.save(); c.globalCompositeOperation = "difference"; v3Fill(c, 0, 0, 100, H, "#fff"); c.restore();
    } else if(b >= 12 && b < 14) shot(c, G, t, 12, 14, "h_dining", {s0:1.5, s1:1.05});
    tone(c, G, 1, .2);
  } else {
    var lt = t - T(14.4);
    if(b < 26.4){ window.HL_BEATS.orbit(c, G, lt, {k:"", dir:b < 20 ? "in" : "out", h:b < 20 ? "Allt börjar i bostaden." : "Samma objekt, vidare.", items:b < 20 ? ["Fotografering", "3D visning", "Drönare", "E-styling", "Atmosphere"] : ["Planritning", "Motion", "Områdeskarta", "Annonstext", "Social / Ads"], s:"", dur:6}, {num:"", name:""}) }
    else v3Fill(c, 0, 0, 100, H, DARK);
  }
  if(b >= 14 && b < 26.4){ /* orbit-scenens byte vid takt 19.4 */ }
  if(b < 14) finish(c, G, t, {vig:.66});
  [1, 3, 5, 7, 9, 10.5, 12].forEach(function(h){ flash(c, G, t, T(h), .45, .12) });
  flash(c, G, t, T(14.4), 1, .3);
  capsDraw(c, G, t, "sju", CAPS_C);
  if(b < 14) progress(c, G, t, T(14));
}
SC.sju = {n:"Sju delar", d:"Vad Viewly är. Sju tjänster som en kedja.", end:END_C, draw:drawC, caps:CAPS_C, thumb:T(9.6),
  cin:{bpm:BPM, kick:[2, 13], hat:[7, 13], pluck:[5, 13], snare:[9, 13], riser:[8, 13], sil:[13, 14.4], quiet:[13, 14.4], drop:14.4, calm:26.4, hits:[1, 3, 5, 7, 9, 10.5, 12]}};

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
  piano(end + .05, 45, .5, 5); [57, 64, 69, 72, 76].forEach(function(m, k){ piano(end + .1 + k*.05, m, k ? .3 : .45, 5) });
  bass(end, 33, 4, .5);
  piano(outro + .1, 38, .5, 5); [57, 61, 64, 69, 73].forEach(function(m, k){ piano(outro + .15 + k*.05, m, .32, 5) });
  [1320, 1980, 2640].forEach(function(fr, k){ var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = fr; var g = ctx.createGain(); g.gain.setValueAtTime(0, outro + .6); g.gain.linearRampToValueAtTime(.05/(1 + k), outro + .61); g.gain.setTargetAtTime(0, outro + .7, .6); o.connect(g); out(g, 1, .5); o.start(outro + .6); o.stop(outro + 3.5) });
  /* ordens klick, ett per inklippt ord, stiger i tonhöjd */
  var ci = 0; (comp.caps || []).forEach(function(cp, k){ if(cp[4] === "ui") return; tok(TT(cp[0]), ci++, .1) });
  /* markörens klick i gränssnittet */
  (comp.uiTaps || []).forEach(function(tp){ tok(tp, 5, .07) });
  /* träffar */
  (C.hits || []).forEach(function(h){ kick(TT(h), .35) });
};

/* ---------- komposition ---------- */
var IDS = {hem:"br_hem", sex:"br_sex", sju:"br_sju"};
window.V3_BR = [];
Object.keys(SC).forEach(function(k){
  var s = SC[k], outroAt = T(s.end), comp = {n:s.n, d:s.d, group:"brand", dur:outroAt + 4.4, thumb:s.thumb, caps:s.caps, cin:s.cin, endAt:outroAt, id:IDS[k], v:{id:IDS[k]}};
  comp.draw = function(c, G, t, o){
    if(t < outroAt + .6) s.draw(c, G, t, o);
    if(t >= outroAt) v3Outro(c, G, o.outro, t - outroAt);
  };
  if(k === "hem"){ comp.uiTaps = [3.4, 4.0, 4.6, 5.85, 7.55, 8.15, 8.75, 9.95].map(function(l){ return T(35) + (l - 1.0)/2.4 }) }
  V3_COMPS[IDS[k]] = comp; V3_BR.push(IDS[k]);
});
/* Systemets "sex blir en"-scen är hämtad ur Highlights */
window.HL_SC_B = {t:"merge", k:"Administrationen", h:"Från sex kontakter till en yta.", before:VEND.map(function(v){ return v.replace(".", "") }), plate:"Mäklarportalen", after:["En beställning", "Ett arbetsflöde", "En leverans", "En faktura"], dur:9.4};

/* ---------- sidan ---------- */
function brEditor(film){
  var k = Object.keys(IDS).filter(function(x){ return IDS[x] === film })[0], s = SC[k];
  return '<details class="a3det a3cust" open><summary>Ändra orden i filmen</summary><p class="a3hint">Varje rad är ett ord som klipps in på takten. Kortare är bättre: två–tre ord åt gången. Rubriken krymper om den blir för lång.</p><div class="a3hxs">'
    + s.caps.map(function(cp, i){ return '<label class="a3f"><span>' + (i + 1) + ' · takt ' + cp[0] + (cp[4] === "ui" ? ' · över gränssnittet' : '') + '</span><input type="text" value="' + esc(String(capText(k, i, cp[1]))) + '" data-a3bx="' + k + '|' + i + '"></label>' }).join("")
    + '</div></details>';
}
function outroEd(){
  var f = v3TxField;
  return '<details class="a3det a3cust" open><summary>Ändra slutkortets text</summary><div class="a3custg"><div>' + f("outro.tag1", "Slagord rad 1") + f("outro.tag2", "Slagord rad 2 (kursiv)") + '</div><div>' + f("outro.aud", "Målgruppsrad") + f("outro.url", "Adress / länk") + '<button type="button" class="a3mini" data-a3="reset" style="margin-top:6px">Återställ allt</button></div></div></details>';
}
function brCards(){
  return '<div class="a3cards">' + V3_BR.map(function(id){
    var c2 = V3_COMPS[id];
    return '<button type="button" class="a3card" data-a3="comp" data-v="' + id + '" aria-current="' + (V3S.comp === id) + '">'
      + '<div class="a3cth">' + v3Canvas("comp:" + id + ":916:" + c2.thumb, 270) + '</div>'
      + '<div class="a3ctl"><i>' + c2.dur.toFixed(0) + ' s · 9:16 och 4:5 · ljud</i><b>' + esc(c2.n) + '</b><span>' + esc(c2.d) + '</span></div></button>';
  }).join("") + '</div>';
}
function para(h, body){ return '<div class="a3pc"><h4>' + h + '</h4>' + body + '</div>' }
window.secBrand = function(){
  if(V3_BR.indexOf(V3S.comp) < 0){ V3S.comp = "br_hem"; V3S.t = V3_COMPS.br_hem.thumb; V3S.playing = false; v3StopSound() }
  var comp = V3_COMPS[V3S.comp], outs = V3_OUT.map(function(o){ return v3Seg("outro", o.id, o.n, V3S.outro === o.id) }).join("");
  setTimeout(v3Mount, 0);
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Varumärke · 13</div><h2>Varumärkesfilmer</h2>'
    + '<p>Filmer som inte förklarar produkten utan får en att känna ett påstående. Ett enda budskap, berättat två–tre ord i taget, klippt på takten, i svartvitt som stramas åt, en takt tystnad, och sedan färg, produkten och varumärket. Allt är Viewlys egna bilder och skärmar. Förslag, inget publicerat.</p></div>'
    + brCards()
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
    + brEditor(V3S.comp) + outroEd()
    + '<div class="a3sub">Så är filmerna byggda</div><div class="a3plan">'
    + para("Dramaturgin, samma i alla tre", '<table class="a3tb"><tr><th>Tes</th><td>Ett påstående, två–tre ord i taget. Svartvitt, långsamma inzoomningar, en puls som börjar svagt.</td></tr><tr><th>Press</th><td>Klippen blir kortare, orden färre, virveln tätare, ett riser stiger. Allt pekar mot en punkt.</td></tr><tr><th>Stillhet</th><td>Musiken tar slut. Bilden blir mörk. Ett hjärtslag. Det är den takten som gör släppet kännbart.</td></tr><tr><th>Vändning</th><td>Färg och produkt: Mäklarportalen, i ljus. Samma ögonblick som musiken släpper.</td></tr><tr><th>Varumärket</th><td>En avslutande rad och slutkortet. Varumärket kommer sist, när man redan känner något.</td></tr></table>')
    + para("Musiken", '<p>Tempo 120, a-moll. Låg puls och en mörk pad som öppnar sig, ett arpeggio som ljusnar, en virvelrull som blir tätare, ett riser. Så stillhet i en takt, ett omvänt cymbalsvep och släppet: slag, fyra i golvet, klapp, ljus arpeggio, pianoackord. Efter släppet andas den ut i ett långt ackord, och slutkortet får ett eget.</p><p>Den är syntetiserad i webbläsaren från samma tidslinje som bilden, så varje klipp har ett ljud. <b>Jag har skrivit den men inte hört den.</b> För en riktig lansering: låt en kompositör göra en egen version med samma struktur, och använd WAV-filen som referens.</p>')
    + '</div>'
    + '<div class="a3sub">Budskap och innehåll</div><div class="a3plan">'
    + para("A · Ett hem säljs en gång", '<p><b>Budskap.</b> Första visningen sker på en skärm. Då räcker det inte att dokumentera: man ska få någon att stanna.</p><p><b>Bevis.</b> Mäklarportalens flöde: välj bild, välj mall, uppgifterna fylls i, kampanjen är klar.</p><p><b>Till vem.</b> Mäklare och kontorschefer som inte känner Viewly än. Varumärkesfilmen.</p>')
    + para("B · Sex kontakter. Eller en.", '<p><b>Budskap.</b> Mer tid för affären, mindre tid i mappar. Sex leverantörer blir en yta.</p><p><b>Bevis.</b> Systemet och Ekosystemet i Highlights: en beställning, ett arbetsflöde, en leverans, en faktura.</p><p><b>Till vem.</b> Mäklare som redan koordinerar flera leverantörer. Den vassaste säljfilmen.</p>')
    + para("C · Sju delar", '<p><b>Budskap.</b> Viewly är inte sju tjänster bredvid varandra, det är en kedja där varje steg gör nästa enklare.</p><p><b>Bevis.</b> Fotografering, 3D, e-styling, Atmosphere, drönare, karta och motion, i den ordning de byggs på varandra.</p><p><b>Till vem.</b> Den som undrar vad Viewly är. Passar på startsidan.</p>')
    + para("Röst och regler", '<p>Korta meningar på svenska. Ett påstående per film. Inga siffror utan källa, inga superlativ, inga löften om försäljningspris. Orden vi använder: första intrycket, presentation, ett ställe. Orden vi undviker: bäst, revolutionerande, AI-driven.</p>')
    + para("Det som tar den hela vägen: material att filma", '<p>Förebilden bygger på licensierat arkivmaterial och riktiga inspelningar. Det kan vi inte låna, och vi ska inte. Vår motsvarighet är eget material, och det är det som lyfter filmerna från bra till minnesvärda:</p><ul><li>Ljus som glider över en vägg i ett tomt rum, tidsförlopp</li><li>Handen på dörrhandtaget, dörren öppnas mot ett rum</li><li>Fotografen i en tom lägenhet, kamera på stativ</li><li>Drönaren som lyfter från en tomt och avslöjar läget</li><li>Mäklaren som bläddrar bland bostäder på mobilen</li><li>E-styling före och efter, i rörelse</li><li>Skärminspelning av Mäklarportalen, från början till klar kampanj</li><li>Kvällsljuset som tänds i fönstren</li><li>Skuggan som vandrar över golvet, solbanan på riktigt</li><li>Nycklarna som läggs i en hand</li></ul><p>Tio planer räcker. Med dem byter jag ut stillbilderna och filmerna blir rörliga hela vägen.</p>')
    + '</div>'
    + '<details class="a3det"><summary>Underlag och vad som inte är klart</summary><div class="a3und"><div><b>Text</b><p>Raderna är förslag. Inga siffror eller påståenden som inte redan står i Highlights. "Första visningen sker på en skärm" är ett resonemang, inte en mätning.</p></div>'
    + '<div><b>Bild</b><p>Stillbilder ur biblioteket, behandlade i svartvitt. Gränssnittet är Mäklarportalens flöde i förenklad återgivning och ska jämföras med de riktiga skärmarna. Bilderna är små och blir mjuka i 1080 px.</p></div>'
    + '<div><b>Ljud</b><p>Syntetiserat, ohört. Lyssna innan det används. Lägg gärna ett eget musikspår under.</p></div></div></details></div>';
};
})();
