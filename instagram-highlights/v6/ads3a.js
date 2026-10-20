/* =====================================================================
   ADS 3 — del A: verktygslådan

   Allt ritas i en <canvas> i enheten "cqw": 100 är bildens bredd, så en
   enhet är 10,8 px i en 1080-bred bild. Samma kod ritar förhandsvisningen
   (60 bilder i sekunden), storyboarden, PNG:erna och videon. Ingen SVG,
   ingen foreignObject, inga DOM-träd som byggs om varje bildruta. Det är
   därför uppspelning och export går mjukt.

   Allt innehåll är DEMODATA: Storgatan 13, priset, tiderna och kontoret
   Nordvik Mäklarbyrå, som är ett exempel och inte deras riktiga profil.
   ===================================================================== */

var V3 = {img:{}, ready:false, loading:null};
var V3_KEYS = {home:"adHome", dining:"adDining", beige:"adBeige", bedroom:"adBedroom", house:"adHouse",
               terrace:"adTerrace", porch:"adPorch", blur:"adHomeBlur"};
var V3_POS = {home:[.5,.45], dining:[.46,.5], beige:[.56,.5], bedroom:[.5,.52], house:[.5,.72], terrace:[.4,.5], porch:[.3,.5]};
var C3 = {paper:"#ECE8E5", ink:"#161616", oli:"#6E7266", mut:"#8C8782", line:"#CFC8C6", dark:"#141211", ui:"#F3F0ED", uil:"#E3DED9",
          navy:"#13293D", navyD:"#0E1F2F", sand:"#C8B79B", cream:"#EADFCF", green:"#6E9A6B"};
var V3F = {serif:"'Cormorant Garamond',Georgia,serif", sans:"Montserrat,sans-serif"};
var V3_OBJ = {addr:"Storgatan 13", city:"Landskrona"};

function v3Load(){
  if(V3.loading) return V3.loading;
  var names = Object.keys(V3_KEYS);
  V3.loading = Promise.all(names.map(function(n){
    return new Promise(function(res){
      var im = new Image(); V3.img[n] = im;
      im.onload = function(){ res() }; im.onerror = function(){ res() };
      im.src = pick(V3_KEYS[n]);
      if(im.decode) im.decode().then(res, res);
    });
  })).then(function(){
    return Promise.all([
      document.fonts.load('300 40px "Cormorant Garamond"'), document.fonts.load('italic 300 40px "Cormorant Garamond"'),
      document.fonts.load('400 40px "Cormorant Garamond"'), document.fonts.load('500 20px Montserrat'), document.fonts.load('600 20px Montserrat')
    ]);
  }).then(function(){ V3.ready = true }, function(){ V3.ready = true });
  return V3.loading;
}

/* ---------- lättnader ---------- */
function oQ(t){ return 1 - Math.pow(1 - t, 5) }
function ioQ(t){ return t < .5 ? 16*t*t*t*t*t : 1 - Math.pow(-2*t + 2, 5)/2 }
function ioC(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2 }
function oBack(t){ var c1 = 1.2, c3 = c1 + 1; return Math.max(0, 1 + c3*Math.pow(t - 1, 3) + c1*Math.pow(t - 1, 2)) }
function k3(t, a, b){ return mclamp((t - a)/(b - a)) }

/* ---------- ritprimitiver (c är redan skalad till cqw) ---------- */
function v3Begin(canvas, wpx, hpx){
  if(canvas.width !== wpx) canvas.width = wpx;
  if(canvas.height !== hpx) canvas.height = hpx;
  var c = canvas.getContext("2d");
  c.setTransform(wpx/100, 0, 0, wpx/100, 0, 0);
  c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
  return c;
}
function v3Fill(c, x, y, w, h, col, a){ c.globalAlpha = a == null ? 1 : a; c.fillStyle = col; c.fillRect(x, y, w, h); c.globalAlpha = 1 }
function v3Photo(c, name, x, y, w, h, o){
  o = o || {};
  var im = V3.img[name]; if(!im || !im.naturalWidth) return;
  var pos = o.pos || V3_POS[name] || [.5, .5], sc = o.scale || 1, iw = im.naturalWidth, ih = im.naturalHeight;
  var s = Math.max(w/iw, h/ih)*sc, dw = iw*s, dh = ih*s;
  var dx = x - (dw - w)*pos[0], dy = y - (dh - h)*pos[1];
  c.save(); c.globalAlpha = o.alpha == null ? 1 : o.alpha;
  c.beginPath(); c.rect(x, y, w, h); c.clip(); c.drawImage(im, dx, dy, dw, dh); c.restore();
}
function v3Grad(c, x, y, w, h, stops, a){
  var g = c.createLinearGradient(0, y, 0, y + h);
  stops.forEach(function(s){ g.addColorStop(s[0], s[1]) });
  c.globalAlpha = a == null ? 1 : a; c.fillStyle = g; c.fillRect(x, y, w, h); c.globalAlpha = 1;
}
function v3Font(o){ return (o.italic ? "italic " : "") + (o.weight || 300) + " " + o.size + "px " + V3F[o.f || "serif"] }
function v3Measure(c, s, o){
  c.font = v3Font(o);
  var sp = (o.sp || 0)*o.size;
  if(!sp) return c.measureText(s).width;
  var w = 0, i; for(i = 0; i < s.length; i++) w += c.measureText(s[i]).width + sp;
  return w - sp;
}
/* Text. y är baslinjen. p 0→1 avslöjar från vänster med en liten höjning;
   skuggan ger läsbarhet över foto. */
function v3Text(c, s, x, y, o){
  var w = v3Measure(c, s, o), al = o.align || "l";
  var x0 = al === "c" ? x - w/2 : al === "r" ? x - w : x;
  var p = o.p == null ? 1 : o.p; if(p <= 0) return w;
  c.save();
  c.globalAlpha = (o.alpha == null ? 1 : o.alpha)*Math.min(1, p*4);
  if(o.rise) c.translate(0, (1 - p)*o.rise);
  if(p < 1){ c.beginPath(); c.rect(x0 - 2, y - o.size*1.2, (w + 4)*p, o.size*1.9); c.clip() }
  if(o.shadow){ c.shadowColor = "rgba(0,0,0,.4)"; c.shadowBlur = o.size*.5; c.shadowOffsetY = o.size*.05 }
  c.fillStyle = o.color || "#fff"; c.font = v3Font(o); c.textBaseline = "alphabetic"; c.textAlign = "left";
  var sp = (o.sp || 0)*o.size;
  if(!sp) c.fillText(s, x0, y);
  else { var cx = x0, i; for(i = 0; i < s.length; i++){ c.fillText(s[i], cx, y); cx += c.measureText(s[i]).width + sp } }
  c.restore();
  return w;
}
function v3Line(c, x1, x2, y, col, th, p, a){
  if(p <= 0) return;
  var cx = (x1 + x2)/2, hw = (x2 - x1)/2*p;
  c.globalAlpha = a == null ? 1 : a; c.fillStyle = col; c.fillRect(cx - hw, y - th/2, hw*2, th); c.globalAlpha = 1;
}
function v3VLine(c, x, y1, y2, col, th, p, a){
  if(p <= 0) return;
  c.globalAlpha = a == null ? 1 : a; c.fillStyle = col; c.fillRect(x - th/2, y1, th, (y2 - y1)*p); c.globalAlpha = 1;
}
/* ram som ritas runt kanten, med start uppe i mitten */
function v3Frame(c, x, y, w, h, col, th, p, a){
  if(p <= 0) return;
  var per = 2*(w + h), len = per*p;
  c.save(); c.globalAlpha = a == null ? 1 : a; c.strokeStyle = col; c.lineWidth = th; c.setLineDash([len, per]); c.lineDashOffset = 0;
  c.beginPath(); c.moveTo(x + w/2, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.lineTo(x, y); c.lineTo(x + w/2, y); c.stroke(); c.restore();
}
var V3_PATH = null;
function v3Mark(c, x, y, h, ink, dot, o){
  if(!V3_PATH) V3_PATH = new Path2D(GEO.limb);
  o = o || {};
  var s = h/756.3;
  c.save(); c.globalAlpha = (o.alpha == null ? 1 : o.alpha);
  c.translate(x, y); c.scale(s, s);
  var rp = o.reveal == null ? 1 : o.reveal;
  if(rp < 1){ c.beginPath(); c.rect(-5, 756.3*(1 - rp) - 5, 900, 756.3*rp + 10); c.clip() }
  c.fillStyle = ink; c.fill(V3_PATH);
  c.restore();
  var dp = o.dot == null ? 1 : o.dot;
  if(dp > 0){
    c.save(); c.globalAlpha = (o.alpha == null ? 1 : o.alpha); c.translate(x, y); c.scale(s, s);
    c.fillStyle = dot; c.beginPath(); c.arc(GEO.dot.cx, GEO.dot.cy, GEO.dot.r*oBack(mclamp(dp)), 0, Math.PI*2); c.fill(); c.restore();
  }
}
/* Viewlys märke och ordbild. capH är ordbildens versalhöjd; märket görs
   mk gånger högre. Proportionen är vald så att det tunga märket och den
   luftiga ordbilden väger lika. Returnerar bredden. */
function v3Lock(c, cx, cy, capH, ink, dot, o){
  o = o || {};
  var mk = o.mk || 1.55, mh = capH*mk, mw = mh*858.6/756.3, fs = capH/0.7, gap = capH*.95;
  var wo = {size:fs, weight:500, f:"sans", sp:.2, color:ink};
  var ww = v3Measure(c, "VIEWLY", wo), tot = mw + gap + ww, x0 = o.left != null ? o.left : cx - tot/2;
  v3Mark(c, x0, cy - mh/2, mh, ink, dot, {reveal:o.pm, dot:o.pd, alpha:o.alpha});
  /* ordbilden: bokstav för bokstav om o.letters, annars en mask */
  var by = cy + capH/2 + capH*.02, wx = x0 + mw + gap;
  if(o.letters != null){
    var s = "VIEWLY", i, x = wx;
    for(i = 0; i < s.length; i++){
      var lp = oQ(k3(o.letters, i*.11, i*.11 + .5));
      v3Text(c, s[i], x, by, {size:fs, weight:500, f:"sans", color:ink, p:lp, rise:capH*.5, alpha:o.alpha});
      x += c.measureText(s[i]).width + .2*fs;
    }
  } else {
    v3Text(c, "VIEWLY", wx, by, {size:fs, weight:500, f:"sans", sp:.2, color:ink, p:o.pw == null ? 1 : o.pw, alpha:o.alpha});
  }
  return tot;
}
/* Kontorets logga (exempel): monogram + ordbild */
var V3_B = {name:"NORDVIK", sub:"MÄKLARBYRÅ"};
function v3NLogo(c, x, y, sz, col, al, p){
  p = p == null ? 1 : p; if(p <= 0) return;
  var bw = 4.8*sz, nw = 0, w1, w2;
  var o1 = {size:2.3*sz, weight:600, f:"sans", sp:.34}, o2 = {size:1.2*sz, weight:500, f:"sans", sp:.44};
  w1 = v3Measure(c, V3_B.name, o1); w2 = v3Measure(c, V3_B.sub, o2);
  var tw = Math.max(w1, w2), tot = bw + 1.8*sz + tw;
  var x0 = al === "c" ? x - tot/2 : al === "r" ? x - tot : x;
  c.save(); c.globalAlpha = p;
  c.strokeStyle = col; c.lineWidth = .3*sz; c.strokeRect(x0, y, bw, bw);
  v3Text(c, "N", x0 + bw/2, y + bw*.72, {size:3.5*sz, weight:400, color:col, align:"c"});
  v3Text(c, V3_B.name, x0 + bw + 1.8*sz, y + bw*.46, {size:2.3*sz, weight:600, f:"sans", sp:.34, color:col});
  v3Text(c, V3_B.sub, x0 + bw + 1.8*sz, y + bw*.9, {size:1.2*sz, weight:500, f:"sans", sp:.44, color:col, alpha:.8});
  c.restore();
  return tot;
}

/* ---------------------------------------------------------------------
   INLÄGGSMALLAR (förslag). Tre stilar, fyra faser, valfritt format.
   Kortet ritas i en egen 100-bred koordinat; ar = höjd/bredd.
   prog 0→1 bygger upp overlayen i lugna steg.
   --------------------------------------------------------------------- */
var V3_PHOTO = {kommande:"dining", tillsalu:"home", visning:"beige", sald:"bedroom"};
function v3Step(prog, a, b){ return oQ(k3(prog, a, b)) }
function v3Post(c, style, phase, name, x, y, w, ar, prog, o){
  o = o || {};
  var H = 100*ar, p = prog == null ? 1 : prog, tall = ar > 1.5;
  c.save(); c.translate(x, y); c.scale(w/100, w/100);
  c.beginPath(); c.rect(0, 0, 100, H); c.clip();
  v3Photo(c, name || V3_PHOTO[phase], 0, 0, 100, H, {scale:o.zoom || 1});
  var main = phase === "tillsalu";
  /* ljusbehandling: bilden får vara bild, bara texten får stöd */
  var sa = k3(p, 0, .3);
  if(!main) v3Fill(c, 0, 0, 100, H, "#0c0a0a", (style === "badge" ? .12 : .26)*sa);
  if(main) v3Grad(c, 0, H*.24, 100, H*.76, [[0, "rgba(12,10,10,0)"], [.3, "rgba(12,10,10,.34)"], [.62, "rgba(12,10,10,.72)"], [1, "rgba(12,10,10,.93)"]], sa);
  else v3Grad(c, 0, H*.34, 100, H*.66, [[0, "rgba(12,10,10,0)"], [.45, "rgba(12,10,10,.16)"], [1, "rgba(12,10,10,.55)"]], sa);
  v3Grad(c, 0, 0, 100, H*.15, [[0, "rgba(12,10,10,.32)"], [1, "rgba(12,10,10,0)"]], sa);
  var m = tall ? 16 : 0;           /* extra luft nertill i 9:16 */
  var S = c; var W = "#fff", sand = C3.sand, cream = C3.cream;
  if(style === "overlay"){
    v3Frame(c, 3.5, 3.5, 93, H - 7, "#fff", .26, v3Step(p, 0, .35), .55);
    v3NLogo(c, 50, 8.5, 1.05, W, "c", v3Step(p, .08, .3));
    if(phase === "tillsalu"){
      var b = H - 9.5 - m;
      v3Text(c, "Visning söndag 13–14", 50, b, {size:3.8, italic:true, color:cream, align:"c", p:v3Step(p, .86, 1), rise:1.6});
      var fy = b - 13.5;
      [["4", "RUM"], ["112", "M²"], ["3 450 000", "KR"]].forEach(function(f, i){
        var cx = [22, 50, 78][i], q = v3Step(p, .68 + i*.05, .84 + i*.05);
        v3Text(c, f[0], cx, fy, {size:f[0].length > 3 ? 5.2 : 6.6, weight:400, color:W, align:"c", p:1, alpha:q, rise:1.6});
        v3Text(c, f[1], cx, fy + 5, {size:1.7, weight:500, f:"sans", sp:.3, color:W, align:"c", alpha:q*.8});
      });
      v3VLine(c, 36, fy - 6, fy + 6, "#fff", .2, v3Step(p, .74, .9), .45);
      v3VLine(c, 64, fy - 6, fy + 6, "#fff", .2, v3Step(p, .78, .94), .45);
      v3Line(c, 43, 57, fy - 12, sand, .3, v3Step(p, .6, .76));
      v3Text(c, V3_OBJ.city.toUpperCase(), 50, fy - 17.5, {size:2.3, weight:500, f:"sans", sp:.38, color:W, align:"c", p:v3Step(p, .5, .66), rise:1.4});
      v3Text(c, V3_OBJ.addr, 50, fy - 26.5, {size:13, color:W, align:"c", p:v3Step(p, .36, .56), shadow:true});
      var lw = v3Measure(c, "TILL SALU", {size:2.2, weight:600, f:"sans", sp:.42});
      var q0 = v3Step(p, .26, .42), ly = fy - 41;
      v3Line(c, 50 - lw/2 - 12, 50 - lw/2 - 3, ly - .8, sand, .3, q0);
      v3Line(c, 50 + lw/2 + 3, 50 + lw/2 + 12, ly - .8, sand, .3, q0);
      v3Text(c, "TILL SALU", 50, ly, {size:2.2, weight:600, f:"sans", sp:.42, color:sand, align:"c", alpha:q0});
    } else if(phase === "kommande"){
      var cy = H/2 + 4;
      var lw2 = v3Measure(c, "KOMMANDE", {size:2.2, weight:600, f:"sans", sp:.42}), q1 = v3Step(p, .22, .4);
      v3Line(c, 50 - lw2/2 - 12, 50 - lw2/2 - 3, cy - 18.8, sand, .3, q1); v3Line(c, 50 + lw2/2 + 3, 50 + lw2/2 + 12, cy - 18.8, sand, .3, q1);
      v3Text(c, "KOMMANDE", 50, cy - 18, {size:2.2, weight:600, f:"sans", sp:.42, color:sand, align:"c", alpha:q1});
      v3Text(c, V3_OBJ.addr, 50, cy, {size:15.5, color:W, align:"c", p:v3Step(p, .34, .6), shadow:true});
      v3Line(c, 43, 57, cy + 8, sand, .3, v3Step(p, .58, .74));
      v3Text(c, "Släpps vecka 12", 50, cy + 17, {size:5.2, italic:true, color:cream, align:"c", p:v3Step(p, .7, .92), rise:1.6});
    } else if(phase === "visning"){
      var cy2 = H/2 + 2, lw3 = v3Measure(c, "VISNING", {size:2.2, weight:600, f:"sans", sp:.42}), q2 = v3Step(p, .22, .4);
      v3Line(c, 50 - lw3/2 - 12, 50 - lw3/2 - 3, cy2 - 22.8, sand, .3, q2); v3Line(c, 50 + lw3/2 + 3, 50 + lw3/2 + 12, cy2 - 22.8, sand, .3, q2);
      v3Text(c, "VISNING", 50, cy2 - 22, {size:2.2, weight:600, f:"sans", sp:.42, color:sand, align:"c", alpha:q2});
      v3Text(c, "Sön 13–14", 50, cy2 + 2, {size:20, color:W, align:"c", p:v3Step(p, .34, .62), shadow:true});
      v3Line(c, 43, 57, cy2 + 11, sand, .3, v3Step(p, .6, .76));
      v3Text(c, (V3_OBJ.addr + " · " + V3_OBJ.city).toUpperCase(), 50, cy2 + 19, {size:2.3, weight:500, f:"sans", sp:.3, color:W, align:"c", p:v3Step(p, .68, .86)});
      v3Text(c, "Anmälan via mäklaren", 50, cy2 + 26, {size:3.8, italic:true, color:cream, align:"c", p:v3Step(p, .82, 1), rise:1.4});
    } else {
      var cy3 = H/2 + 4;
      v3Text(c, "Såld", 50, cy3 + 8, {size:42, italic:true, color:W, align:"c", p:v3Step(p, .3, .62), shadow:true});
      v3Line(c, 40, 60, cy3 + 18, sand, .3, v3Step(p, .6, .76));
      v3Text(c, (V3_OBJ.addr + " · " + V3_OBJ.city).toUpperCase(), 50, cy3 + 27, {size:2.3, weight:500, f:"sans", sp:.3, color:W, align:"c", p:v3Step(p, .7, .88)});
      v3Text(c, "Tack för förtroendet", 50, cy3 + 34, {size:3.8, italic:true, color:cream, align:"c", p:v3Step(p, .84, 1), rise:1.4});
    }
  } else if(style === "editorial"){
    v3NLogo(c, 9, 9, .95, W, "l", v3Step(p, .08, .3));
    v3Line(c, 9, 91, H - 9.5 - m - 31, "#fff", .2, v3Step(p, .2, .5), .5);
    var bb = H - 9.5 - m;
    var lab = {kommande:"KOMMANDE", tillsalu:"TILL SALU", visning:"VISNING", sald:"SÅLD"}[phase];
    var big = phase === "sald" ? 24 : 15, labY = bb - 11.5 - big*.74 - 4.2;
    v3Line(c, 9, 91, labY - 6.4, "#fff", .2, v3Step(p, .2, .5), .5);
    v3Fill(c, 9, labY - .8, 5*v3Step(p, .3, .45), .3, sand);
    v3Text(c, lab, 16, labY, {size:2.2, weight:600, f:"sans", sp:.4, color:sand, alpha:v3Step(p, .3, .45)});
    v3Text(c, phase === "sald" ? "Såld." : phase === "visning" ? "Sön 13–14" : V3_OBJ.addr, 9, bb - 11.5, {size:big, italic:phase === "sald", color:W, p:v3Step(p, .4, .68), shadow:true});
    var sub = phase === "tillsalu" ? "4 rum  ·  112 m²  ·  3 450 000 kr" : phase === "kommande" ? "Släpps vecka 12" : V3_OBJ.addr + " · " + V3_OBJ.city;
    v3Text(c, sub.toUpperCase(), 9, bb - 2.5, {size:2.2, weight:500, f:"sans", sp:.28, color:W, p:v3Step(p, .66, .88), alpha:.95});
    v3Text(c, V3_OBJ.city.toUpperCase(), 91, 12.4, {size:1.9, weight:500, f:"sans", sp:.34, color:W, align:"r", alpha:v3Step(p, .1, .3)*.85});
  } else {   /* badge */
    v3NLogo(c, 9, 9, .95, W, "l", v3Step(p, .08, .3));
    var bq = oBack(k3(p, .18, .5)), r = 12.5;
    if(bq > 0){
      c.save(); c.translate(80, 24); c.rotate(-.12); c.scale(bq, bq);
      c.fillStyle = sand; c.beginPath(); c.arc(0, 0, r, 0, Math.PI*2); c.fill();
      var bl = phase === "tillsalu" ? ["TILL", "SALU"] : phase === "kommande" ? ["KOM-", "MANDE"] : phase === "visning" ? ["VIS-", "NING"] : ["SÅLD", ""];
      v3Text(c, bl[0], 0, bl[1] ? -1 : 2.4, {size:3.3, weight:700, f:"sans", sp:.22, color:C3.navy, align:"c"});
      if(bl[1]) v3Text(c, bl[1], 0, 4.4, {size:3.3, weight:700, f:"sans", sp:.22, color:C3.navy, align:"c"});
      c.restore();
    }
    var b2 = H - 11 - m;
    v3Text(c, phase === "visning" ? "Sön 13–14" : phase === "sald" ? "Såld" : V3_OBJ.addr, 9, b2 - 8, {size:phase === "sald" ? 26 : 14.5, italic:phase === "sald", color:W, p:v3Step(p, .34, .62), shadow:true});
    v3Fill(c, 9, b2 - 3.8, 11*v3Step(p, .56, .72), .35, sand);
    var s2 = phase === "tillsalu" ? "4 rum  ·  112 m²  ·  3 450 000 kr" : phase === "kommande" ? "Släpps vecka 12" : phase === "visning" ? V3_OBJ.addr + " · " + V3_OBJ.city : "Tack för förtroendet";
    v3Text(c, s2.toUpperCase(), 9, b2 + 1.8, {size:2.2, weight:500, f:"sans", sp:.28, color:W, p:v3Step(p, .62, .86)});
  }
  c.restore();
}
