/* =====================================================================
   ADS 2 — tredje versionen, byggd efter genomgången

   Utkast 1 (sektion 09) ligger kvar orört. Det här ersätter första
   versionen av sektion 10.

   Vad som ändrats och varför:
     · Berättelsen utspelar sig i Mäklarportalen, vid leveransen. Man
       trycker Skapa kampanj, väljer en bild, och inlägget byggs efter
       kontorets egen mall. Kontoret är Nordvik Mäklarbyrå som EXEMPEL.
     · Inläggen är nya: helbild med overlay, centrerade, med kontorets
       logga och färger. Ingen uppdelning i bild och panel.
     · Slutkortet har Viewlys märke och ordbild i samma höjd.
     · Annonsen har ljud: ett litet piano och diskreta ljudeffekter,
       syntetiserade i webbläsaren. Samma partitur spelas i förhandsvisning
       och renderas till WAV.
     · Bilderna är de riktiga fotona från leveransen. Inga stand-ins.

   Formaten är fasta: video 9:16, allt annat 4:5. Annons A finns i båda,
   komponerad för formatet och inte beskuren.

   Allt är en ren funktion av tiden (a2Frame). Kontor, objekt, pris och
   tider är DEMODATA. Mallarna här är ett förslag på hur Studions inlägg
   kan se ut; Studions nuvarande mallar är inte ändrade.
   ===================================================================== */

var A2 = {tab:"a", fmt:"916", view:"ren", t:2.4, playing:false, raf:0, t0:0, last:0, hook:0, end:0, sound:true};
var A2_DUR = 16;
var A2_HOOKS = [["En fotografering.","Mer att arbeta med."],["Fotona är klara.","Inläggen också."],["Samma bilder.","Färdig marknadsföring."]];
var A2_ENDS  = [["Professionell bostadsfotografering.","Smartare marknadsföring."],["Du bokar.","Vi sköter resten."],["Bilderna först.","Resten följer."]];
var A2C = {paper:"#ECE8E5", ink:"#161616", oli:"#6E7266", mut:"#8C8782", line:"#CFC8C6", dark:"#141211", ui:"#F3F0ED", uil:"#E3DED9"};
var A2B = {name:"NORDVIK", sub:"MÄKLARBYRÅ", navy:"#13293D", sand:"#C8B79B"};
var A2_SER = "font-family:'Cormorant Garamond',Georgia,serif;font-weight:300;";
var A2_SAN = "font-family:Montserrat,sans-serif;";
var A2_OBJ = {addr:"Storgatan 13", city:"Landskrona"};
var A2P = {home:{k:"adHome",pos:"50% 45%"}, dining:{k:"adDining",pos:"46% 50%"}, beige:{k:"adBeige",pos:"56% 50%"},
           bedroom:{k:"adBedroom",pos:"50% 52%"}, house:{k:"adHouse",pos:"50% 72%"}, terrace:{k:"adTerrace",pos:"40% 50%"},
           porch:{k:"adPorch",pos:"30% 50%"}};
var A2_KEYS = ["adHome","adHomeBlur","adDining","adBeige","adBedroom","adHouse","adTerrace","adPorch"];
var A2_PHASEPH = {kommande:"dining", tillsalu:"home", visning:"beige", sald:"bedroom"};
var A2_GRID = [["kommande",0,0],["tillsalu",1,0],["visning",0,1],["sald",1,1]];

function a2Url(k, inline){ return inline ? 'url('+pick(k)+')' : 'var(--a2-'+k+')'; }
function a2Ph(name, inline, extra){
  var p = A2P[name];
  return '<div style="position:absolute;inset:0;background-image:'+a2Url(p.k,inline)+';background-size:cover;background-position:'+p.pos+';'+(extra||'')+'"></div>';
}
function a2Blur(inline, extra){
  return '<div style="position:absolute;inset:0;background-image:'+a2Url("adHomeBlur",inline)+';background-size:cover;background-position:50% 50%;transform:scale(1.25);'+(extra||'')+'"></div>';
}
function a2Rect(r, name, inline, scale, pos, extra){
  var p = A2P[name], pp = pos || p.pos, oy = pp.split(" ")[1] || "50%";
  return '<div style="position:absolute;left:'+r[0].toFixed(2)+'cqw;top:'+r[1].toFixed(2)+'cqw;width:'+r[2].toFixed(2)+'cqw;height:'+r[3].toFixed(2)
   +'cqw;overflow:hidden;'+(extra||'')+'"><div style="position:absolute;inset:0;background-image:'+a2Url(p.k,inline)+';background-size:cover;background-position:'+pp
   +';transform:scale('+scale.toFixed(4)+');transform-origin:50% '+oy+'"></div></div>';
}
function a2Mix(a, b, p){ return [lerp(a[0],b[0],p), lerp(a[1],b[1],p), lerp(a[2],b[2],p), lerp(a[3],b[3],p)]; }
function a2Cap(x, y, txt, st){
  return '<div style="position:absolute;left:'+x+'cqw;top:'+y+'cqw;'+A2_SAN+'font-weight:500;font-size:2.1cqw;letter-spacing:.3em;text-transform:uppercase;white-space:nowrap;'+(st||'')+'">'+esc(txt)+'</div>';
}
/* clip som inte skär nedstaplar: marginal upp och ned */
function a2Wipe(p){ return 'clip-path:inset(-14% '+((1-mclamp(p))*100).toFixed(1)+'% -34% 0)'; }

/* Kontorets logga (exempel). sz skalar hela märket. */
function a2NLogo(sz, col){
  return '<div style="display:inline-flex;align-items:center;gap:'+(1.7*sz)+'cqw;color:'+col+'">'
   +'<div style="width:'+(4.6*sz)+'cqw;height:'+(4.6*sz)+'cqw;border:'+(.32*sz)+'cqw solid '+col+';display:flex;align-items:center;justify-content:center;'
   +A2_SER+'font-size:'+(3.4*sz)+'cqw;line-height:1;font-weight:400">N</div>'
   +'<div style="text-align:left;line-height:1.15"><div style="'+A2_SAN+'font-weight:600;font-size:'+(2.3*sz)+'cqw;letter-spacing:.34em">'+A2B.name+'</div>'
   +'<div style="'+A2_SAN+'font-weight:500;font-size:'+(1.2*sz)+'cqw;letter-spacing:.44em;opacity:.8">'+A2B.sub+'</div></div></div>';
}
/* Viewlys märke och ordbild i samma höjd: versalhöjden i Montserrat är ≈ 0,7 em */
function a2VLock(h, ink, dot){
  var fs = h/0.7;
  return '<div style="display:inline-flex;align-items:center;gap:'+(h*.6).toFixed(2)+'cqw">'
   +'<div style="height:'+h+'cqw;width:'+(h*1.135).toFixed(2)+'cqw">'+vmark(ink, dot, 'width="100%" height="100%"')+'</div>'
   +'<div style="'+A2_SAN+'font-weight:500;font-size:'+fs.toFixed(2)+'cqw;line-height:1;letter-spacing:.22em;color:'+ink+';margin-top:'+(h*.02).toFixed(2)+'cqw;transform:translateY('+(h*.03).toFixed(2)+'cqw)">VIEWLY</div></div>';
}

/* ---------------------------------------------------------------
   INLÄGGEN — helbild med overlay, centrerade. prog 0 → 1 bygger upp dem.
   --------------------------------------------------------------- */
function a2Post(phase, prog, inline){
  var p = prog == null ? 1 : prog, o = '';
  var ph = A2_PHASEPH[phase];
  var rv = function(a, b, inner, st){
    var q = seg(p, a, b);
    return '<div style="opacity:'+q.toFixed(3)+';transform:translateY('+((1-q)*2.4).toFixed(2)+'cqw);'+(st||'')+'">'+inner+'</div>';
  };
  o += a2Ph(ph, inline);
  var heavy = phase === "tillsalu" ? 0 : .26;
  o += '<div style="position:absolute;inset:0;background:rgba(12,10,10,'+heavy+')"></div>';
  o += '<div style="position:absolute;left:0;right:0;bottom:0;height:'+(phase === "tillsalu" ? 66 : 100)+'%;background:linear-gradient(180deg,rgba(12,10,10,0) 0%,rgba(12,10,10,'
     +(phase === "tillsalu" ? .5 : .12)+') 42%,rgba(12,10,10,'+(phase === "tillsalu" ? .9 : .5)+') 100%)"></div>';
  o += '<div style="position:absolute;left:0;right:0;top:0;height:26%;background:linear-gradient(180deg,rgba(12,10,10,.5),rgba(12,10,10,0))"></div>';
  o += '<div style="position:absolute;inset:4cqw;border:.28cqw solid rgba(255,255,255,'+(.5*seg(p,0,.15)).toFixed(2)+')"></div>';
  o += '<div style="position:absolute;left:0;right:0;top:9cqw;display:flex;justify-content:center;opacity:'+seg(p,.1,.3).toFixed(3)+'">'+a2NLogo(1.05, "#fff")+'</div>';
  var pill = function(txt, solid){
    return '<div style="display:inline-block;'+A2_SAN+'font-weight:600;font-size:2.15cqw;letter-spacing:.3em;text-transform:uppercase;padding:1.3cqw 3.4cqw;'
      +(solid ? 'background:'+A2B.sand+';color:'+A2B.navy+';' : 'border:.28cqw solid rgba(255,255,255,.8);color:#fff;')+'">'+esc(txt)+'</div>';
  };
  var hair = '<div style="width:15cqw;height:.3cqw;background:'+A2B.sand+';margin:0 auto"></div>';
  var small = function(txt){ return '<div style="'+A2_SAN+'font-weight:500;font-size:2.4cqw;letter-spacing:.3em;text-transform:uppercase;color:#fff;text-shadow:0 0 1.6cqw rgba(0,0,0,.45)">'+esc(txt)+'</div>'; };
  var col = 'position:absolute;left:8cqw;right:8cqw;display:flex;flex-direction:column;align-items:center;text-align:center;color:#fff;';
  if(phase === "tillsalu"){
    o += '<div style="'+col+'bottom:12cqw">'
      + rv(.3, .45, pill("Till salu", true))
      + rv(.45, .62, '<div style="'+A2_SER+'font-size:13cqw;line-height:1.02;margin-top:3cqw">'+esc(A2_OBJ.addr)+'</div>')
      + rv(.58, .72, '<div style="margin-top:2cqw">'+small(A2_OBJ.city)+'</div>')
      + rv(.68, .8, '<div style="margin:3.6cqw 0">'+hair+'</div>')
      + rv(.78, .92, small("4 rum   ·   112 m²   ·   3 450 000 kr"))
      + rv(.9, 1, '<div style="'+A2_SER+'font-style:italic;font-size:3.9cqw;margin-top:3.2cqw;color:#EADFCF">Visning söndag 13–14</div>')
      +'</div>';
  } else if(phase === "kommande"){
    o += '<div style="'+col+'top:50%;transform:translateY(-50%)">'
      + rv(.3, .45, pill("Kommande", false))
      + rv(.45, .65, '<div style="'+A2_SER+'font-size:15cqw;line-height:1.02;margin-top:4cqw">'+esc(A2_OBJ.addr)+'</div>')
      + rv(.62, .8, '<div style="margin:4cqw 0">'+hair+'</div>')
      + rv(.78, .95, '<div style="'+A2_SER+'font-style:italic;font-size:5cqw;color:#EADFCF">Släpps vecka 12</div>')
      +'</div>';
  } else if(phase === "visning"){
    o += '<div style="'+col+'top:50%;transform:translateY(-50%)">'
      + rv(.3, .45, pill("Visning", true))
      + rv(.45, .65, '<div style="'+A2_SER+'font-size:19cqw;line-height:1;margin-top:4cqw">Sön 13–14</div>')
      + rv(.62, .8, '<div style="margin:4cqw 0 3cqw">'+hair+'</div>')
      + rv(.78, .95, small(A2_OBJ.addr+" · "+A2_OBJ.city))
      + rv(.9, 1, '<div style="'+A2_SER+'font-style:italic;font-size:3.9cqw;margin-top:3cqw;color:#EADFCF">Anmälan via mäklaren</div>')
      +'</div>';
  } else {
    o += '<div style="'+col+'top:50%;transform:translateY(-50%)">'
      + rv(.3, .55, '<div style="'+A2_SER+'font-style:italic;font-size:38cqw;line-height:.9">Såld</div>')
      + rv(.55, .75, '<div style="margin:3cqw 0 4cqw">'+hair+'</div>')
      + rv(.72, .9, small(A2_OBJ.addr+" · "+A2_OBJ.city))
      + rv(.88, 1, '<div style="'+A2_SER+'font-style:italic;font-size:3.9cqw;margin-top:3cqw;color:#EADFCF">Tack för förtroendet</div>')
      +'</div>';
  }
  return o;
}
function a2Card(x, y, w, inner, st){
  return '<div style="position:absolute;left:'+x.toFixed(2)+'cqw;top:'+y.toFixed(2)+'cqw;width:'+w.toFixed(2)+'cqw;height:'+(w*1.25).toFixed(2)
   +'cqw;overflow:hidden;container-type:inline-size;background:#1b1918;box-shadow:0 2.4cqw 7cqw -1.6cqw rgba(0,0,0,.6);'+(st||'')+'">'+inner+'</div>';
}

function a2Geo(fmt){
  var is9 = fmt === "916", H = is9 ? 177.78 : 125, top = is9 ? 26 : 8, bot = is9 ? 31.5 : 8;
  var cy = (top + H - bot)/2, CW = is9 ? 78 : 70, CH = CW*1.25;
  var g = {is9:is9, H:H, top:top, bot:bot, cy:cy, CW:CW, CX:(100-CW)/2, CH:CH, CY:cy - CH/2 + (is9 ? 0 : 0)};
  g.labY = top + (is9 ? 12 : 9.5); g.headY = g.labY + 4.6; g.statY = g.headY + (is9 ? 12.4 : 10.4);
  g.gridY = g.statY + (is9 ? 8 : 6.2); g.th = is9 ? 33 : 24; g.tw = 26.4;
  g.btnY = g.gridY + 2*g.th + 2.4 + (is9 ? 6 : 5); g.btnH = is9 ? 10 : 9;
  return g;
}
function a2Cursor(x, y, press){
  return '<svg viewBox="0 0 24 34" style="position:absolute;left:'+x.toFixed(2)+'cqw;top:'+y.toFixed(2)+'cqw;width:6.2cqw;height:8.8cqw;overflow:visible;'
   +'filter:drop-shadow(0 .6cqw 1cqw rgba(0,0,0,.35));transform:scale('+(1-press*.16).toFixed(3)+')"><path d="M2 2v26l7-6.6 4.6 10.4 4.2-1.9-4.6-10.2 9.8-.3z" fill="#161616" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>';
}
function a2Chip(x, y, inner, done, right, p){
  var st = 'position:absolute;'+(right ? 'right:'+x : 'left:'+x)+'cqw;top:'+y.toFixed(2)+'cqw;opacity:'+p.toFixed(2)+';transform:translateY('+((1-p)*1.4).toFixed(2)+'cqw);'
   +'display:flex;align-items:center;gap:1.6cqw;'+A2_SAN+'font-weight:500;font-size:1.85cqw;letter-spacing:.16em;text-transform:uppercase;color:#fff;border:1px solid rgba(255,255,255,.5);padding:1.1cqw 2.2cqw;border-radius:99px;white-space:nowrap;background:rgba(14,12,12,.35)';
  return '<div style="'+st+'"><span style="width:1.7cqw;height:1.7cqw;border-radius:50%;border:1px solid #C9D2B6;background:'+(done ? '#C9D2B6' : 'transparent')+';display:inline-block"></span>'+inner+'</div>';
}

/* Mäklarportalen: leveransen, "Skapa kampanj", välj bild */
function a2Portal(t, G, inline){
  var o = '', up = seg(t, 3.5, 4.3), sel = t >= 5.95, mode = seg(t, 5.9, 6.4);
  var tiles = [["home",0],["dining",1],["beige",2],["bedroom",3],["terrace",4],["house",5]];
  var ink = A2C.ink, mut = A2C.mut;
  o += '<div style="opacity:'+up.toFixed(3)+'">';
  /* sidhuvud */
  o += '<div style="position:absolute;left:8cqw;right:8cqw;top:'+G.top+'cqw;display:flex;justify-content:space-between;align-items:center">'
     + a2VLock(3.2, ink, A2C.oli)
     + '<div style="'+A2_SAN+'font-weight:500;font-size:1.8cqw;letter-spacing:.22em;color:'+mut+'">MÄKLARPORTALEN</div></div>';
  o += '<div style="position:absolute;left:8cqw;right:8cqw;top:'+(G.top + 7.2)+'cqw;height:1px;background:'+A2C.uil+'"></div>';
  o += a2Cap(8, G.labY, A2_OBJ.addr+" · "+A2_OBJ.city, 'color:'+mut+';font-size:1.95cqw');
  /* rubrik byter när man trycker Skapa kampanj */
  var h1 = '<div style="position:absolute;left:8cqw;right:8cqw;top:'+G.headY.toFixed(2)+'cqw;'+A2_SER+'font-size:'+(G.is9 ? 9 : 7.6)+'cqw;line-height:1.05;color:'+ink+';opacity:'+(1-mode).toFixed(2)+'">12 bilder levererade</div>';
  var h2 = '<div style="position:absolute;left:8cqw;right:8cqw;top:'+G.headY.toFixed(2)+'cqw;'+A2_SER+'font-size:'+(G.is9 ? 9 : 7.6)+'cqw;line-height:1.05;color:'+ink+';opacity:'+mode.toFixed(2)+'">Välj en bild.</div>';
  o += h1 + h2;
  o += '<div style="position:absolute;left:8cqw;top:'+G.statY.toFixed(2)+'cqw;display:flex;align-items:center;gap:1.8cqw;'+A2_SAN+'font-size:2.3cqw;color:'+mut+'">'
     + '<span style="width:1.9cqw;height:1.9cqw;border-radius:50%;background:#6E9A6B;display:inline-block"></span>'
     + '<span style="opacity:'+(1-mode).toFixed(2)+'">Levererad idag 09:41</span>'
     + '<span style="position:absolute;left:3.7cqw;white-space:nowrap;opacity:'+mode.toFixed(2)+'">Bilden blir kampanjens motiv</span></div>';
  /* bildrutor (nr 0 ritas av fotot som morfar in) */
  tiles.forEach(function(tl, i){
    if(i === 0) return;
    var col = i % 3, row = Math.floor(i/3), x = 8 + col*(G.tw + 2.4), y = G.gridY + row*(G.th + 2.4);
    var q = seg(t, 3.9 + i*.12, 4.5 + i*.12), dim = t >= 7.0 ? .32 : 1;
    var r = [x, y + (1-q)*3, G.tw, G.th];
    var cnt = i === 5 ? '<div style="position:absolute;inset:0;background:rgba(18,16,16,.55);display:flex;align-items:center;justify-content:center;color:#fff;'+A2_SER+'font-size:7cqw">+7</div>' : '';
    o += '<div style="position:absolute;left:'+r[0].toFixed(2)+'cqw;top:'+r[1].toFixed(2)+'cqw;width:'+G.tw+'cqw;height:'+G.th+'cqw;overflow:hidden;opacity:'+(q*dim).toFixed(3)
      +'"><div style="position:absolute;inset:0;background-image:'+a2Url(A2P[tl[0]].k, inline)+';background-size:cover;background-position:'+A2P[tl[0]].pos+'"></div>'+cnt
      +(sel && t < 7.0 ? '<div style="position:absolute;inset:0;border:.3cqw solid rgba(22,22,22,.35)"></div>' : '')+'</div>';
  });
  /* knappen */
  var bp = seg(t, 4.5, 5.1), press = seg(t, 5.7, 5.8) * (1 - seg(t, 5.85, 5.95)), bout = seg(t, 5.95, 6.4);
  if(bout < 1){
    o += '<div style="position:absolute;left:8cqw;right:8cqw;top:'+(G.btnY + bout*6).toFixed(2)+'cqw;height:'+G.btnH+'cqw;background:'+(press > 0 ? '#3a3d37' : ink)
      +';color:#fff;display:flex;align-items:center;justify-content:center;gap:2.4cqw;'+A2_SAN+'font-weight:500;font-size:2.7cqw;letter-spacing:.24em;text-transform:uppercase;opacity:'
      +(bp*(1-bout)).toFixed(3)+';transform:scale('+(1 - press*.02).toFixed(3)+')"><span style="font-size:3.4cqw;line-height:1;margin-top:-.3cqw">+</span>Skapa kampanj</div>';
  }
  o += '</div>';
  return o;
}

/* Hela annonsen som funktion av tiden. */
function a2Frame(t, fmt, inline){
  var G = a2Geo(fmt), H = G.H, top = G.top, bot = G.bot, cy = G.cy, is9 = G.is9;
  var hk = A2_HOOKS[A2.hook];
  var o = '<div style="position:absolute;inset:0;background:'+A2C.dark+'"></div>';

  /* mörk bakgrund (scen 3–4) */
  var bd = seg(t, 7.2, 8.0) * (1 - seg(t, 13.4, 13.9));
  if(bd > 0) o += '<div style="position:absolute;inset:0;opacity:'+bd.toFixed(3)+'">'+a2Blur(inline)+'<div style="position:absolute;inset:0;background:rgba(15,32,48,.66)"></div></div>';

  /* portalens ljusa bakgrund + gränssnitt (scen 2) */
  var ub = seg(t, 3.0, 3.9) * (1 - seg(t, 7.0, 7.8));
  if(ub > 0){
    o += '<div style="position:absolute;inset:0;background:'+A2C.ui+';opacity:'+ub.toFixed(3)+'"></div>';
    o += '<div style="position:absolute;inset:0;opacity:'+(1 - seg(t, 7.0, 7.6)).toFixed(3)+'">'+a2Portal(t, G, inline)+'</div>';
  }

  /* fotot: helbild → bildruta 1 i portalen → kortets motiv */
  var FULL = [0, 0, 100, H], TILE = [8, G.gridY, G.tw, G.th], CARD = [G.CX, G.CY, G.CW, G.CH];
  var q1 = eInOut(seg(t, 3.0, 4.0)), q3 = eInOut(seg(t, 7.2, 8.2));
  var r = FULL, sc = lerp(1.14, 1.0, eOut(seg(t, 0, 3.4)));
  if(t >= 3.0){ r = a2Mix(FULL, TILE, q1); sc = lerp(sc, 1, q1); }
  if(t >= 7.2){ r = a2Mix(TILE, CARD, q3); }
  if(t < 8.2){
    var sh = t >= 3.2 && t < 7.2 ? 'box-shadow:0 .8cqw 2.4cqw -1cqw rgba(0,0,0,.35)' : (t >= 7.2 ? 'box-shadow:0 2.4cqw 7cqw -1.6cqw rgba(0,0,0,'+(.6*q3).toFixed(2)+')' : '');
    o += a2Rect(r, "home", inline, sc, null, sh);
    /* valring + bock */
    var rk = seg(t, 6.85, 7.15) * (1 - seg(t, 7.2, 7.6));
    if(rk > 0) o += '<div style="position:absolute;left:'+(TILE[0]-1).toFixed(2)+'cqw;top:'+(TILE[1]-1).toFixed(2)+'cqw;width:'+(TILE[2]+2)+'cqw;height:'+(TILE[3]+2)+'cqw;border:.5cqw solid '+A2C.ink+';opacity:'+rk.toFixed(2)+'"></div>'
      +'<div style="position:absolute;left:'+(TILE[0]+TILE[2]-3).toFixed(2)+'cqw;top:'+(TILE[1]-2).toFixed(2)+'cqw;width:4.6cqw;height:4.6cqw;border-radius:50%;background:'+A2C.oli+';opacity:'+rk.toFixed(2)
      +';display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" width="58%" height="58%"><path d="M2.2 6.3l2.5 2.5 5-5.4" fill="none" stroke="#fff" stroke-width="1.5"/></svg></div>';
  }

  /* markören */
  if(t >= 4.7 && t < 7.4){
    var m1 = eInOut(seg(t, 4.7, 5.65)), m2 = eInOut(seg(t, 6.2, 6.85));
    var bx = 50, by = G.btnY + G.btnH/2 - 1, tx = TILE[0] + TILE[2]*.55, ty = TILE[1] + TILE[3]*.6;
    var cx, cyy;
    if(t < 6.2){ cx = lerp(94, bx, m1); cyy = lerp(H - 14, by, m1) }
    else { cx = lerp(bx, tx, m2); cyy = lerp(by, ty, m2) }
    var pr = Math.max(seg(t, 5.65, 5.8)*(1 - seg(t, 5.85, 6.0)), seg(t, 6.85, 6.95)*(1 - seg(t, 7.0, 7.15)));
    o += '<div style="opacity:'+(seg(t, 4.7, 5.0) * (1 - seg(t, 7.1, 7.4))).toFixed(2)+'">'+a2Cursor(cx, cyy, pr)+'</div>';
  }

  /* scen 3: kortet byggs efter kontorets mall */
  if(t >= 8.2 && t < 11.4){
    var prog = seg(t, 8.9, 10.7);
    var lift = seg(t, 11.0, 11.4);
    o += a2Card(G.CX, G.CY - lift*3, G.CW, a2Post("tillsalu", prog, inline), '');
    var co1 = seg(t, 8.3, 8.8), co2 = seg(t, 8.6, 9.1), ex = 1 - seg(t, 11.0, 11.3);
    var sw = ['#13293D','#C8B79B','#F4EFE8'].map(function(c){ return '<span style="width:1.9cqw;height:1.9cqw;border-radius:50%;background:'+c+';border:1px solid rgba(255,255,255,.6);display:inline-block"></span>' }).join('');
    o += '<div style="opacity:'+ex.toFixed(2)+'">'
      + a2Chip(G.CX, G.CY - 8.6, '<span>Objektdata</span>', prog > .55, false, co1)
      + a2Chip(G.CX, G.CY - 8.6, '<span>Nordvik</span><span style="display:inline-flex;gap:.9cqw">'+sw+'</span>', prog > .2, true, co2) + '</div>';
    var cap = seg(t, 10.8, 11.4);
    o += '<div style="position:absolute;left:0;right:0;top:'+(G.CY + G.CH + 4.6).toFixed(2)+'cqw;text-align:center;'+A2_SER+'font-style:italic;font-size:5.2cqw;color:#fff;opacity:'+cap.toFixed(2)+'">Klart. I kontorets egen profil.</div>';
    o += a2Cap(0, top - (is9 ? 1.2 : 0), "Demodata", 'right:8cqw;left:auto;color:rgba(255,255,255,.5);font-size:1.7cqw;opacity:'+seg(t, 8.4, 8.8).toFixed(2));
  }

  /* scen 1: hook på bilden */
  if(t < 3.6){
    var s1 = 1 - seg(t, 2.8, 3.4), yb = H - bot - 27;
    o += '<div style="position:absolute;left:0;right:0;bottom:0;height:'+(is9 ? 62 : 66)+'%;opacity:'+s1.toFixed(3)+';background:linear-gradient(180deg,rgba(14,11,11,0),rgba(14,11,11,.74))"></div>';
    o += '<div style="position:absolute;left:0;right:0;top:0;height:26%;opacity:'+s1.toFixed(3)+';background:linear-gradient(180deg,rgba(14,11,11,.48),rgba(14,11,11,0))"></div>';
    o += '<div style="position:absolute;inset:4cqw;border:.28cqw solid rgba(255,255,255,'+(.5*s1*seg(t,.1,.9)).toFixed(2)+')"></div>';
    o += '<div style="opacity:'+s1.toFixed(3)+';transform:translateY('+(-seg(t,2.8,3.4)*3).toFixed(2)+'cqw)">'
      + a2Cap(0, top - (is9 ? 6 : 0) + (is9 ? 3 : 4), "Viewly · Bostadsfotografering", 'left:0;right:0;text-align:center;color:rgba(255,255,255,.9);'+a2Wipe(seg(t,.2,1.0)))
      + '<div style="position:absolute;left:0;right:0;top:'+yb.toFixed(2)+'cqw;text-align:center;'+A2_SER+'font-size:11.4cqw;line-height:1.1;color:#fff;white-space:nowrap;'+a2Wipe(eOut(seg(t,.45,1.35)))+'">'+esc(hk[0])+'</div>'
      + '<div style="position:absolute;left:0;right:0;top:'+(yb + 13.2).toFixed(2)+'cqw;text-align:center;'+A2_SER+'font-style:italic;font-size:10.6cqw;line-height:1.1;color:#EADFCF;white-space:nowrap;'+a2Wipe(eOut(seg(t,1.35,2.35)))+'">'+esc(hk[1])+'</div></div>';
  }

  /* scen 4: en leverans, hela kampanjen */
  if(t >= 11.2 && t < 14.2){
    var GW = is9 ? 36 : 33, GH = GW*1.25, GG = 3.2, GTOP = is9 ? top + 24 : top + 20;
    var GX0 = (100 - (GW*2 + GG))/2;
    var hp = seg(t, 12.0, 12.8);
    o += '<div style="position:absolute;left:0;right:0;top:'+(top - 1).toFixed(2)+'cqw;text-align:center;opacity:'+hp.toFixed(2)+'">'
      +'<div style="'+A2_SER+'font-size:'+(is9 ? 9.4 : 8)+'cqw;line-height:1.08;color:#fff">En leverans.</div>'
      +'<div style="'+A2_SER+'font-style:italic;font-size:'+(is9 ? 9.4 : 8)+'cqw;line-height:1.08;color:#EADFCF">Hela kampanjen.</div></div>';
    A2_GRID.forEach(function(g, i){
      var gx = GX0 + g[1]*(GW + GG), gy = GTOP + g[2]*(GH + GG), isMain = g[0] === "tillsalu", x, y, w, op;
      if(isMain){
        var lp = eInOut(seg(t, 11.2, 12.1));
        x = lerp(G.CX, gx, lp); y = lerp(G.CY - 3, gy, lp); w = lerp(G.CW, GW, lp); op = 1;
      } else {
        var lp2 = eOut(seg(t, 11.9 + i*.28, 12.7 + i*.28));
        x = gx; y = gy + (1 - lp2)*8; w = GW; op = lp2;
      }
      o += a2Card(x, y, w, a2Post(g[0], 1, inline), 'opacity:'+op.toFixed(3));
    });
    o += '<div style="position:absolute;left:0;right:0;top:'+(GTOP + GH*2 + GG + 4.4).toFixed(2)+'cqw;text-align:center;'+A2_SAN+'font-weight:500;font-size:2.1cqw;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.75);opacity:'
      +seg(t, 12.8, 13.3).toFixed(2)+'">Kommande · Till salu · Visning · Såld</div>';
  }

  /* scen 5: slutkort */
  if(t >= 13.8) o += a2EndHTML(G, t);
  return o;
}

function a2EndHTML(G, t, noWipe){
  var en = A2_ENDS[A2.end], ep = noWipe ? 1 : eInOut(seg(t, 13.8, 14.6)), y0 = G.is9 ? G.cy - 26 : 15;
  var big = A2.end === 0 ? (G.is9 ? 9.4 : 8.2) : (G.is9 ? 12.6 : 10.4), dh = G.is9 ? 17 : 14, dt = G.is9 ? 25 : 21;
  return '<div style="position:absolute;inset:0;background:'+A2C.paper+';clip-path:inset('+((1-ep)*100).toFixed(2)+'% 0 0 0)">'
   +'<div style="position:absolute;left:0;right:0;top:'+y0.toFixed(2)+'cqw;display:flex;justify-content:center;opacity:'+seg(t,14.2,14.8).toFixed(2)+'">'+a2VLock(6.6, A2C.ink, A2C.oli)+'</div>'
   +'<div style="position:absolute;left:0;right:0;top:'+(y0 + dh).toFixed(2)+'cqw;display:flex;justify-content:center"><div style="width:14cqw;height:1px;background:'+A2C.line+'"></div></div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:'+(y0 + dt).toFixed(2)+'cqw;text-align:center">'
     +'<div style="'+A2_SER+'font-size:'+big+'cqw;line-height:1.08;color:'+A2C.ink+';'+a2Wipe(eOut(seg(t,14.6,15.3)))+'">'+esc(en[0])+'</div>'
     +'<div style="'+A2_SER+'font-style:italic;font-size:'+big+'cqw;line-height:1.08;color:'+A2C.oli+';margin-top:1.4cqw;'+a2Wipe(eOut(seg(t,15.0,15.7)))+'">'+esc(en[1])+'</div></div>'
   + a2Cap(0, G.H - G.bot - 10.6, "För fastighetsmäklare i Skåne", 'left:0;right:0;text-align:center;color:'+A2C.mut+';opacity:'+seg(t,15.3,15.9).toFixed(2))
   + a2Cap(0, G.H - G.bot - 5.8, "viewly.se/maklare", 'left:0;right:0;text-align:center;color:'+A2C.ink+';opacity:'+seg(t,15.4,16).toFixed(2))
   +'</div>';
}

/* ---------------------------------------------------------------
   KARUSELLERNA (4:5). Bilderna är samma som i videon: samma portal,
   samma inlägg, samma slutkort.
   --------------------------------------------------------------- */
function a2PhotoSlide(name, inline, opts){
  opts = opts || {};
  return a2Ph(name, inline)
   +'<div style="position:absolute;left:0;right:0;bottom:0;height:'+(opts.h || 38)+'%;background:linear-gradient(180deg,rgba(12,10,10,0),rgba(12,10,10,'+(opts.a || .62)+'))"></div>'
   +'<div style="position:absolute;left:0;right:0;top:0;height:22%;background:linear-gradient(180deg,rgba(12,10,10,.4),rgba(12,10,10,0))"></div>'
   +'<div style="position:absolute;inset:4cqw;border:.28cqw solid rgba(255,255,255,.5)"></div>';
}
function a2Slide(set, i, inline){
  var G = a2Geo("45");
  if(set === "b"){
    if(i === 0) return a2PhotoSlide("dining", inline, {h:62, a:.78})
      + a2Cap(0, 10, "Viewly · Efter leveransen", 'left:0;right:0;text-align:center;color:rgba(255,255,255,.9)')
      +'<div style="position:absolute;left:9cqw;right:9cqw;bottom:13cqw;text-align:center;'+A2_SER+'font-size:11.2cqw;line-height:1.08;color:#fff">Vad händer efter att bilderna är levererade?</div>';
    var tt = [0, 5.15, 6.95, 11.0, 13.2, 16][i];
    return a2Frame(tt, "45", inline);
  }
  if(set === "c"){
    if(i === 4) return a2EndHTMLSlide("Det börjar med bilden.", "", "Bostadsfotografering för fastighetsmäklare i Skåne", inline);
    var nm = ["home","dining","beige","terrace"][i];
    return a2PhotoSlide(nm, inline, {h:26, a:.5})
      +'<div style="position:absolute;left:0;right:0;bottom:8.5cqw;text-align:center;'+A2_SAN+'font-weight:500;font-size:1.95cqw;letter-spacing:.34em;color:rgba(255,255,255,.92)">'
      +(i === 0 ? 'DET BÖRJAR MED BILDEN' : 'VIEWLY')+'</div>'
      +'<div style="position:absolute;right:8cqw;top:8.4cqw;'+A2_SAN+'font-weight:500;font-size:1.9cqw;letter-spacing:.3em;color:rgba(255,255,255,.85)">'+(i+1)+' / 5</div>';
  }
  return '';
}
function a2EndHTMLSlide(l1, l2, sub){
  return '<div style="position:absolute;inset:0;background:'+A2C.paper+'">'
   +'<div style="position:absolute;left:0;right:0;top:20cqw;display:flex;justify-content:center">'+a2VLock(6.6, A2C.ink, A2C.oli)+'</div>'
   +'<div style="position:absolute;left:0;right:0;top:38cqw;display:flex;justify-content:center"><div style="width:14cqw;height:1px;background:'+A2C.line+'"></div></div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:46cqw;text-align:center"><div style="'+A2_SER+'font-size:11.6cqw;line-height:1.08;color:'+A2C.ink+'">'+esc(l1)+'</div>'
   +(l2 ? '<div style="'+A2_SER+'font-style:italic;font-size:11.6cqw;line-height:1.08;color:'+A2C.oli+';margin-top:1.4cqw">'+esc(l2)+'</div>' : '')+'</div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;bottom:14cqw;text-align:center;'+A2_SAN+'font-weight:500;font-size:2.1cqw;letter-spacing:.26em;text-transform:uppercase;color:'+A2C.mut+'">'+esc(sub)
   +'<div style="color:'+A2C.ink+';margin-top:2.2cqw">viewly.se/maklare</div></div></div>';
}

/* ---------------------------------------------------------------
   LJUD — ett litet piano och diskreta ljudeffekter, syntetiserat i
   webbläsaren. Samma partitur spelas i förhandsvisningen och renderas
   till WAV. Tider i sekunder, samma tidslinje som bilden.
   --------------------------------------------------------------- */
var A2_PIANO = [
  [.25,50,.5,3.2],[.85,57,.42,3],[1.45,64,.36,3],[2.05,66,.34,3],[2.65,69,.4,3.2],
  [3.25,47,.5,3.2],[3.85,54,.4,3],[4.4,57,.34,3],[4.95,62,.32,3],[5.5,66,.3,3],[6.1,69,.3,3],[6.7,71,.3,3],
  [7.3,43,.55,3.4],[7.9,50,.4,3],[8.45,55,.34,3],[9.0,59,.32,3],[9.55,62,.3,3],[10.1,66,.3,3],
  [10.5,57,.4,4],[10.5,61,.32,4],[10.5,64,.3,4],[10.5,71,.26,4],
  [11.3,50,.5,3],[11.7,57,.38,3],[12.1,66,.34,3],[12.5,69,.34,3],[12.9,73,.32,3],[13.3,74,.3,3.2],
  [13.9,38,.6,5],[14.0,50,.36,5],[14.0,54,.3,5],[14.0,57,.3,5],[14.0,61,.26,5],[14.0,64,.24,5],[15.0,74,.25,3]
];
function a2Noise(ctx, len){
  var b = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate*len)), ctx.sampleRate), d = b.getChannelData(0);
  for(var i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1;
  return b;
}
function a2Score(ctx){
  var master = ctx.createGain(); master.gain.value = .7;
  var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = .01; comp.release.value = .25;
  var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 9000;
  master.connect(comp); comp.connect(lp); lp.connect(ctx.destination);
  /* rum: syntetiskt impulssvar */
  var rl = Math.floor(ctx.sampleRate*2.4), ir = ctx.createBuffer(2, rl, ctx.sampleRate);
  for(var c = 0; c < 2; c++){ var d = ir.getChannelData(c); for(var i = 0; i < rl; i++) d[i] = (Math.random()*2 - 1)*Math.pow(1 - i/rl, 2.6) }
  var conv = ctx.createConvolver(); conv.buffer = ir;
  var wet = ctx.createGain(); wet.gain.value = .3; conv.connect(wet); wet.connect(master);
  var dry = ctx.createGain(); dry.gain.value = .85; dry.connect(master);
  var send = ctx.createGain(); send.gain.value = 1; send.connect(conv);
  var out = function(node, g){ var a = ctx.createGain(); a.gain.value = g == null ? 1 : g; node.connect(a); a.connect(dry); a.connect(send); return a };

  var piano = function(t, midi, vel, dur){
    var f = 440*Math.pow(2, (midi - 69)/12), amps = [1, .5, .26, .13, .07, .04], bus = ctx.createGain(), i;
    bus.gain.value = vel*.34;
    var tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = Math.min(7000, 1400 + f*5); bus.connect(tone); out(tone);
    for(i = 0; i < amps.length; i++){
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f*(i + 1)*(1 + .0003*(i + 1)*(i + 1));
      var g = ctx.createGain(), tau = dur/(1 + i*.9);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amps[i], t + .007);
      g.gain.setTargetAtTime(0, t + .01, tau/3.2);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + .3);
    }
    var o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f*1.004;
    var g2 = ctx.createGain(); g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(.4, t + .008); g2.gain.setTargetAtTime(0, t + .01, dur/3.4);
    o2.connect(g2); g2.connect(bus); o2.start(t); o2.stop(t + dur + .3);
    var n = ctx.createBufferSource(); n.buffer = a2Noise(ctx, .06);
    var nf = ctx.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 1500 + f; nf.Q.value = .8;
    var ng = ctx.createGain(); ng.gain.setValueAtTime(vel*.05, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .05);
    n.connect(nf); nf.connect(ng); out(ng); n.start(t); n.stop(t + .06);
  };
  var whoosh = function(t, dur, vol){
    var n = ctx.createBufferSource(); n.buffer = a2Noise(ctx, dur + .1);
    var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = .7;
    f.frequency.setValueAtTime(350, t); f.frequency.exponentialRampToValueAtTime(2600, t + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur*.45); g.gain.linearRampToValueAtTime(0, t + dur);
    n.connect(f); f.connect(g); out(g); n.start(t); n.stop(t + dur + .1);
  };
  var tap = function(t, vol){
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(1150, t); o.frequency.exponentialRampToValueAtTime(620, t + .07);
    var g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .09);
    o.connect(g); out(g); o.start(t); o.stop(t + .12);
    var n = ctx.createBufferSource(); n.buffer = a2Noise(ctx, .02);
    var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3000;
    var ng = ctx.createGain(); ng.gain.setValueAtTime(vol*.5, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .015);
    n.connect(hp); hp.connect(ng); out(ng); n.start(t); n.stop(t + .025);
  };
  var pop = function(t, vol, fr){
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(fr*.8, t); o.frequency.exponentialRampToValueAtTime(fr, t + .05);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
    o.connect(g); out(g); o.start(t); o.stop(t + .2);
  };
  var chime = function(t, vol){
    [1320, 1980, 2640, 3960].forEach(function(fr, i){
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = fr*(1 + i*.0012);
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol/(1 + i*.8), t + .004); g.gain.setTargetAtTime(0, t + .01, .5/(1 + i*.35));
      o.connect(g); out(g); o.start(t); o.stop(t + 2.4);
    });
  };
  var riser = function(t, dur, vol){
    var n = ctx.createBufferSource(); n.buffer = a2Noise(ctx, dur + .1);
    var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(7000, t + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.exponentialRampToValueAtTime(vol, t + dur*.96); g.gain.linearRampToValueAtTime(0, t + dur);
    n.connect(f); f.connect(g); out(g); n.start(t); n.stop(t + dur + .1);
  };
  var sub = function(t, vol){
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = 73.4;
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .9); g.gain.setTargetAtTime(0, t + 1, 1.1);
    o.connect(g); out(g, .8); o.start(t); o.stop(t + 4.5);
  };

  A2_PIANO.forEach(function(n){ piano(n[0], n[1], n[2], n[3]) });
  [2.9, 7.1, 11.0, 13.7].forEach(function(t){ whoosh(t, .55, .055) });
  [5.72, 6.88].forEach(function(t){ tap(t, .16) });
  [4.0, 4.15, 4.3, 4.45, 4.6].forEach(function(t, i){ pop(t, .05, 520 + i*60) });
  [8.95, 9.25, 9.55, 9.85, 10.15].forEach(function(t, i){ pop(t, .045, 760 + i*70) });
  chime(10.55, .07);
  riser(12.6, 1.2, .045);
  sub(13.85, .11);
}
var A2_AUDIO = {buf:null, src:null, ctx:null, busy:null};
function a2RenderAudio(){
  if(A2_AUDIO.buf) return Promise.resolve(A2_AUDIO.buf);
  if(A2_AUDIO.busy) return A2_AUDIO.busy;
  var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if(!OAC) return Promise.resolve(null);
  var ctx = new OAC(2, 44100*(A2_DUR + .5), 44100);
  a2Score(ctx);
  A2_AUDIO.busy = ctx.startRendering().then(function(b){ A2_AUDIO.buf = b; return b });
  return A2_AUDIO.busy;
}
function a2WavBlob(buf){
  var n = buf.length, ch = buf.numberOfChannels, sr = buf.sampleRate, bytes = n*ch*2, ab = new ArrayBuffer(44 + bytes), v = new DataView(ab), i, c, o = 44;
  var w = function(off, s){ for(var k = 0; k < s.length; k++) v.setUint8(off + k, s.charCodeAt(k)) };
  w(0, "RIFF"); v.setUint32(4, 36 + bytes, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, ch, true); v.setUint32(24, sr, true); v.setUint32(28, sr*ch*2, true); v.setUint16(32, ch*2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, bytes, true);
  var data = []; for(c = 0; c < ch; c++) data.push(buf.getChannelData(c));
  for(i = 0; i < n; i++) for(c = 0; c < ch; c++){ var s = Math.max(-1, Math.min(1, data[c][i])); v.setInt16(o, s < 0 ? s*32768 : s*32767, true); o += 2 }
  return new Blob([ab], {type:"audio/wav"});
}
function a2StopAudio(){
  if(A2_AUDIO.src){ try{ A2_AUDIO.src.stop() }catch(e){} A2_AUDIO.src = null }
}
async function a2StartAudio(offset){
  a2StopAudio();
  if(!A2.sound) return;
  var buf = await a2RenderAudio(); if(!buf || !A2.playing) return;
  if(!A2_AUDIO.ctx){ var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return; A2_AUDIO.ctx = new AC() }
  if(A2_AUDIO.ctx.state === "suspended") await A2_AUDIO.ctx.resume();
  var s = A2_AUDIO.ctx.createBufferSource(); s.buffer = buf; s.connect(A2_AUDIO.ctx.destination);
  s.start(0, Math.max(0, Math.min(A2_DUR, offset))); A2_AUDIO.src = s;
}

/* ---------------------------------------------------------------
   SIDAN
   --------------------------------------------------------------- */
var A2_BOARD = [[2.4,"Hook","Fotot först, helbild i långsam rörelse. Hooken skrivs på bilden."],
                [5.5,"Mäklarportalen","Leveransen. Man trycker Skapa kampanj och väljer vilken bild som ska bli inlägget."],
                [9.6,"Inlägget byggs","Objektdata och kontorets profil läggs på efter kontorets mall. Här: Nordvik Mäklarbyrå som exempel."],
                [12.9,"En leverans, hela kampanjen","Fyra faser ur samma leverans. Visar bredden utan att prata om den."],
                [15.9,"Avsändare","Viewlys märke och ordbild i samma höjd, två rader och en hårlinje."]];

function a2Opt(kind, val, label, on){
  return '<button type="button" class="a2seg'+(on ? ' on' : '')+'" data-a2="'+kind+'" data-v="'+val+'">'+esc(label)+'</button>';
}
function a2Tabs(){
  var T = [["a","A","En fotografering. Mer att arbeta med.","Video · 9:16 och 4:5 · 16 s · ljud", "frame"],
           ["b","B","Vad händer efter att bilderna är levererade?","Karusell · 4:5 · 6 bilder", "b"],
           ["c","C","Det börjar med bilden.","Karusell · 4:5 · 5 bilder", "c"]];
  return '<div class="a2tabs">'+T.map(function(x){
    var thumb = x[4] === "frame"
      ? '<div class="a2-th a2-th916"><div class="a2fr">'+a2Frame(2.4, "916", false)+'</div></div>'
      : '<div class="a2-th a2-th45"><div class="a2fr">'+a2Slide(x[4], 0, false)+'</div></div>';
    return '<button type="button" class="a2tab" data-a2="tab" data-v="'+x[0]+'" aria-current="'+(A2.tab === x[0])+'">'+thumb
      +'<span class="a2tl"><i>Annons '+x[1]+'</i><b>'+esc(x[2])+'</b><em>'+x[3]+'</em></span></button>';
  }).join('')+'</div>';
}
function a2Stage(){
  var is9 = A2.fmt === "916";
  var fr = '<div class="a2fr a2screen '+(is9 ? 'f916' : 'f45')+'" id="a2screen">'+a2Frame(A2.t, A2.fmt, false)+'</div>';
  if(A2.view === "plats"){
    var av = '<span class="a2av">'+vmark("#161616","#6E7266",'width="100%" height="100%"')+'</span>';
    if(is9) fr = '<div class="a2plats a2reels">'+fr
      +'<div class="a2scrim"></div><div class="a2rt"><b>Reels</b><span>•••</span></div>'
      +'<div class="a2rb"><div class="a2who">'+av+'<b>viewly.se</b><i>Sponsrad</i></div>'
      +'<p>Bilderna är bara början. Med Viewly blir fotograferingen också färdigt material. <u>mer</u></p><div class="a2cta">Läs mer</div></div></div>';
    else fr = '<div class="a2plats a2feed"><div class="a2fh">'+av+'<div><b>viewly.se</b><i>Sponsrad</i></div><span class="a2dots">•••</span></div>'
      +fr+'<div class="a2fc"><span>viewly.se<br><b>'+esc(A2_HOOKS[A2.hook][0]+' '+A2_HOOKS[A2.hook][1])+'</b></span><em>Läs mer</em></div>'
      +'<div class="a2fp"><b>viewly.se</b> Bilderna är bara början. Med Viewly blir fotograferingen också färdigt material. <u>mer</u></div></div>';
  }
  return fr;
}
function a2A(){
  var t = A2.t;
  var board = A2_BOARD.map(function(b){
    return '<div class="a2bc"><div class="a2bfr '+(A2.fmt === "916" ? 'f916' : 'f45')+'"><div class="a2fr">'+a2Frame(b[0], A2.fmt, false)+'</div></div>'
     +'<div class="a2bt mono">'+b[0].toFixed(1).replace(".", ",")+' s</div><h5>'+esc(b[1])+'</h5><p>'+esc(b[2])+'</p></div>';
  }).join('');
  var hooks = A2_HOOKS.map(function(h, i){ return a2Opt("hook", i, h[0]+" "+h[1], A2.hook === i) }).join('');
  var ends = A2_ENDS.map(function(h, i){ return a2Opt("end", i, h[0]+" "+h[1], A2.end === i) }).join('');
  return '<div class="a2work">'
   +'<div class="a2stagewrap '+(A2.fmt === "916" ? 'w916' : 'w45')+'">'+a2Stage()
   +'<div class="a2ctl"><button class="a2play" type="button" data-a2="play" id="a2play">'+(A2.playing ? '❚❚' : '▶')+'</button>'
   +'<div class="a2scrubw"><input type="range" id="a2scrub" min="0" max="1000" value="'+Math.round(t/A2_DUR*1000)+'"></div>'
   +'<span class="mono" id="a2time">'+t.toFixed(1).replace(".", ",")+' / '+A2_DUR+' s</span></div></div>'
   +'<div class="a2panel">'
   +'<div class="a2h">Format</div><div class="a2segs">'+a2Opt("fmt","916","Reel · 9:16",A2.fmt === "916")+a2Opt("fmt","45","Flöde · 4:5",A2.fmt === "45")+'</div>'
   +'<div class="a2h">Visning</div><div class="a2segs">'+a2Opt("view","ren","Ren",A2.view === "ren")+a2Opt("view","plats","I Instagram",A2.view === "plats")+'</div>'
   +'<div class="a2h">Ljud</div><div class="a2segs">'+a2Opt("sound","1","På",A2.sound)+a2Opt("sound","0","Av",!A2.sound)+'</div>'
   +'<div class="a2h">Hook</div><div class="a2segs col">'+hooks+'</div>'
   +'<div class="a2h">Slutrad</div><div class="a2segs col">'+ends+'</div>'
   +'<div class="a2h">Exportera</div><div class="a2segs col">'
   +'<button class="a2seg dl" type="button" data-a2="export" data-v="916">MP4 · 9:16 · 1080 × 1920</button>'
   +'<button class="a2seg dl" type="button" data-a2="export" data-v="45">MP4 · 4:5 · 1080 × 1350</button>'
   +'<button class="a2seg dl" type="button" data-a2="wav" data-v="1">Ljud · WAV · 16 s</button></div>'
   +'<p class="a2note" id="dlstat"></p>'
   +'<p class="a2note">MP4-filen kodas utan ljud. Ljudet sparas som WAV och läggs på i redigeringsprogrammet, eller i en färdig fil där de är ihopsatta.</p>'
   +'</div></div>'
   +'<div class="a2sub">Hur den byggs</div><div class="a2board">'+board+'</div>'
   +'<div class="a2sub">Text till Meta</div>'
   +'<div class="a2copy"><div><b>Primärtext</b><p>Bilderna är bara början.<br>Med Viewly blir fotograferingen också färdigt material: objektets uppgifter och kontorets profil läggs på automatiskt i Social Media Studio.<br>Bostadsfotografering för mäklare i Skåne.</p></div>'
   +'<div><b>Rubrik</b><p>'+esc(A2_HOOKS[A2.hook][0]+" "+A2_HOOKS[A2.hook][1])+'</p><b>Beskrivning</b><p>Viewly · bostadsfotografering för mäklare</p><b>Knapp och länk</b><p>Läs mer · viewly.se/maklare</p></div>'
   +'<div><b>Kortare variant</b><p>Fina bilder. Och färdiga inlägg direkt efteråt.<br>Viewly fotograferar för mäklare i Skåne.</p><b>Mål</b><p>Trafik till /maklare och bokning av provfotografering.</p></div></div>';
}
function a2Slides(set, n){
  var items = [];
  for(var i = 0; i < n; i++){
    items.push('<div class="a2slw"><div class="a2sl"><div class="a2fr f45">'+a2Slide(set, i, false)+'</div></div>'
     +'<div class="a2slm"><span class="mono">'+(i+1)+' / '+n+'</span>'
     +'<button type="button" class="a2mini" data-a2="png" data-v="'+set+':'+i+'">Ladda ner PNG</button></div></div>');
  }
  return '<div class="a2slides">'+items.join('')+'</div>';
}
function a2B(){
  return a2Slides("b", 6)
   +'<div class="a2copy"><div><b>Primärtext</b><p>Bilderna är levererade. Vad händer sen?<br>Du trycker Skapa kampanj, väljer en bild, och inlägget byggs efter kontorets egen mall.</p></div>'
   +'<div><b>Rubrik</b><p>Vad händer efter att bilderna är levererade?</p><b>Knapp och länk</b><p>Läs mer · viewly.se/maklare</p></div>'
   +'<div><b>Roll i kampanjen</b><p>Svaret för den som blev nyfiken av Annons A. Bild 2–5 följer exakt samma flöde som videon.</p></div></div>';
}
function a2C(){
  return a2Slides("c", 5)
   +'<div class="a2need"><b>Behöver för publicering</b><ol>'
   +'<li>Bilderna här kommer från olika objekt. För publicering: en serie från samma objekt, stående 4:5.</li>'
   +'<li>Tillstånd att använda objekten i annonsering, och besked om affischerna i bild 1 får synas.</li></ol></div>'
   +'<div class="a2copy"><div><b>Primärtext</b><p>Det börjar med bilden.<br>Bostadsfotografering för fastighetsmäklare i Skåne.</p></div>'
   +'<div><b>Rubrik</b><p>Det börjar med bilden.</p><b>Knapp och länk</b><p>Läs mer · viewly.se/maklare</p></div>'
   +'<div><b>Roll i kampanjen</b><p>Ren kvalitetsbevisning för den som redan känner Viewly. Nästan helt fotografi.</p></div></div>';
}
function a2Underlag(){
  return '<details class="a2det"><summary>Bedömning, research och vad som är verifierat</summary><div class="a2und">'
   +'<div><b>Bedömning</b><p><b>Fotografering är produkten.</b> Annons A öppnar med enbart fotot, visar portalflödet som följd och slutar med fotografering.</p>'
   +'<p><b>En annons, en fördel.</b> Bilderna blir färdigt material. Inga priser, rabatter eller löften om fler affärer.</p>'
   +'<p><b>Inläggsmallarna är ett förslag.</b> Helbild med overlay, centrerad. Studions nuvarande mallar är inte ändrade; vill ni ha dem så behöver mallbiblioteket byggas om.</p>'
   +'<p><b>Meta.</b> Annonsen säljer en tjänst till företag och bör inte falla under Bostäder. Kontrollera i annonshanteraren.</p></div>'
   +'<div><b>Verifierat på viewly.se</b><p>Social Media Studio hämtar levererade bilder, adress, rum, boarea, pris, ansvarig mäklare och visningsuppgifter. Kontoret ställer in logga, färger, typsnitt och layout per fas en gång. Faserna är Kommande, Till salu, Visning och Såld. Format 4:5, 1:1, 9:16, 16:9 och A4. Hör till ViewlyPro, 30 dagar gratis, ingen bindningstid.</p>'
   +'<p>Konkurrenter: SE360 och Bofoto säljer foto, film, planritning och tryckt material. Ingen av dem visar färdigt marknadsföringsmaterial som följd av fotograferingen (antagande, tre av fyra sidor lästa).</p></div>'
   +'<div><b>Behöver bekräftas</b><p>Hur Mäklarportalens flöde Skapa kampanj faktiskt ser ut. Skärmarna i annonsen är en förenklad återgivning, inte skärmdumpar. "Plus/Premium" finns inte på /maklare, så annonsen påstår inget om paket. Diakrit och Metas annonsbibliotek gick inte att läsa.</p>'
   +'<p><b>Hypotes att testa:</b> en fotoannons med portalflödet som följd ger fler förfrågningar än en ren fotoannons.</p>'
   +'<p>Alla uppgifter (Storgatan 13, pris, tider) och kontoret Nordvik Mäklarbyrå är <b>demodata</b>. Nordviks riktiga profil är inte använd.</p></div></div></details>';
}
function secAds2(){
  a2Inject();
  var body = A2.tab === "a" ? a2A() : A2.tab === "b" ? a2B() : a2C();
  return '<div class="a2page"><div class="a2head"><div class="eyebrow">Ads · 10</div><h2>Viewlys första annonser</h2>'
    +'<p>Video i 9:16, allt annat i 4:5. Berättelsen börjar i Mäklarportalen vid leveransen. Förslag, inte låsta krav. Inget publicerat.</p></div>'
    + a2Tabs() + body + a2Underlag() + '</div>';
}

/* —— uppspelning, export, reglage —— */
function a2Inject(){
  if(document.getElementById("a2css")) return;
  var s = document.createElement("style"); s.id = "a2css";
  s.textContent = ":root{" + A2_KEYS.map(function(k){ return "--a2-"+k+":url("+pick(k)+")" }).join(";") + "}";
  document.head.appendChild(s);
}
function a2Paint(){
  var el = document.getElementById("a2screen"); if(el) el.innerHTML = a2Frame(A2.t, A2.fmt, false);
  var sc = document.getElementById("a2scrub"); if(sc && document.activeElement !== sc) sc.value = Math.round(A2.t/A2_DUR*1000);
  var tm = document.getElementById("a2time"); if(tm) tm.textContent = A2.t.toFixed(1).replace(".", ",")+" / "+A2_DUR+" s";
}
function a2Tick(now){
  if(!A2.playing) return;
  A2.t = (now - A2.t0)/1000;
  if(A2.t >= A2_DUR){ A2.t = A2_DUR; A2.playing = false; a2StopAudio(); a2Paint(); var b = document.getElementById("a2play"); if(b) b.textContent = "▶"; return }
  if(now - A2.last > 30){ A2.last = now; a2Paint() }
  A2.raf = requestAnimationFrame(a2Tick);
}
function a2Play(){
  var b = document.getElementById("a2play");
  if(A2.playing){ A2.playing = false; a2StopAudio(); if(b) b.textContent = "▶"; return }
  if(A2.t >= A2_DUR - .05) A2.t = 0;
  A2.playing = true; A2.t0 = performance.now() - A2.t*1000; if(b) b.textContent = "❚❚";
  a2StartAudio(A2.t).then(function(){ if(A2.playing) A2.t0 = performance.now() - A2.t*1000 });
  A2.raf = requestAnimationFrame(a2Tick);
}
async function a2Export(btn, fmt){
  if(busy) return; busy = true;
  var lbl = btn.textContent, W = 1080, H = fmt === "916" ? 1920 : 1350, fps = 30, blob = null, vag = "";
  btn.disabled = true;
  var dl = await downloads();
  if(!dl){ status(codeText("unavailable")); btn.disabled = false; busy = false; return }
  if(typeof VideoEncoder === "undefined"){
    status("Den här webbläsaren saknar videokodare. Öppna sidan i Chrome, Edge eller Safari för att exportera MP4.");
    btn.disabled = false; busy = false; return;
  }
  var keep = A2.t; A2.playing = false; a2StopAudio();
  try {
    var render = function(tt){
      return svgImage(svgDoc(W, H, '<foreignObject x="0" y="0" width="'+W+'" height="'+H+'">'+xhtml(a2Frame(tt, fmt, true), W, H, A2C.dark)+'</foreignObject>'), W, H);
    };
    var N = Math.round(A2_DUR*fps), c = document.createElement("canvas"); c.width = W; c.height = H;
    var ctx = c.getContext("2d", {alpha:false}), t0 = performance.now();
    var draw = async function(i){ var img = await render(i/fps); ctx.fillStyle = A2C.dark; ctx.fillRect(0, 0, W, H); ctx.drawImage(img, 0, 0, W, H) };
    var onp = function(i, n){ var kv = i > 4 ? Math.round((performance.now()-t0)/i*(n-i)/1000) : 0; btn.textContent = "Kodar "+i+" / "+n+(kv ? " · "+kv+" s kvar" : "") };
    btn.textContent = "Förbereder…";
    var r = await mp4encode(c, W, H, fps, N, draw, onp, 12000000);
    if(r && r.blob && await verifyClip(r.blob, A2_DUR)){ blob = r.blob; vag = r.kind }
    else status("Den kodade filen gick inte att läsa tillbaka, så ingen fil lämnas ut.");
  } catch(e){ status("Kodningen misslyckades: "+(e && e.message || e)) }
  A2.t = keep; a2Paint();
  btn.disabled = false; btn.textContent = lbl; busy = false;
  if(blob){
    var ok = await offer(blob, "viewly-annons-a-"+(fmt === "916" ? "reel-9x16" : "flode-4x5")+".mp4", btn);
    if(ok) status("Annons A · "+(fmt === "916" ? "9:16" : "4:5")+" · "+A2_DUR+" s · 30 bilder/s · "+fmtBytes(blob.size)+" · utan ljud"
      +(vag === "avc" ? "" : " · webbläsaren saknar H.264, filen är VP9 och spelas inte på iPhone"));
  }
}
async function a2Wav(btn){
  if(busy) return; busy = true;
  var lbl = btn.textContent; btn.disabled = true; btn.textContent = "Renderar ljud…";
  try {
    var dl = await downloads(); if(!dl){ status(codeText("unavailable")); throw new Error("nodl") }
    var buf = await a2RenderAudio(); if(!buf) throw new Error("noaudio");
    busy = false;
    await offer(a2WavBlob(buf), "viewly-annons-a-ljud.wav", btn);
  } catch(e){ }
  busy = false; btn.disabled = false; btn.textContent = lbl;
}
async function a2PNG(btn, spec){
  if(busy) return; busy = true;
  var p = spec.split(":"), W = 1080, H = 1350, lbl = btn.textContent;
  btn.disabled = true; btn.textContent = "Renderar…";
  try {
    var dl = await downloads();
    if(!dl){ status(codeText("unavailable")); throw new Error("nodl") }
    var img = await svgImage(svgDoc(W, H, '<foreignObject x="0" y="0" width="'+W+'" height="'+H+'">'+xhtml(a2Slide(p[0], +p[1], true), W, H, A2C.paper)+'</foreignObject>'), W, H);
    var c = document.createElement("canvas"); c.width = W; c.height = H;
    var ctx = c.getContext("2d"); ctx.fillStyle = A2C.paper; ctx.fillRect(0, 0, W, H); ctx.drawImage(img, 0, 0, W, H);
    var blob = await new Promise(function(res){ c.toBlob(res, "image/png") });
    busy = false;
    await offer(blob, "viewly-annons-"+p[0]+"-"+(+p[1]+1)+"-4x5.png", btn);
  } catch(e){ }
  busy = false; btn.disabled = false; btn.textContent = lbl;
}
document.addEventListener("click", function(e){
  var b = e.target.closest("[data-a2]"); if(!b) return;
  var k = b.dataset.a2, v = b.dataset.v;
  if(k === "tab"){ A2.tab = v; A2.playing = false; a2StopAudio(); render({top:true}); return }
  if(k === "play"){ a2Play(); return }
  if(k === "fmt"){ A2.fmt = v; render(); return }
  if(k === "view"){ A2.view = v; render(); return }
  if(k === "sound"){ A2.sound = v === "1"; if(!A2.sound) a2StopAudio(); else if(A2.playing) a2StartAudio(A2.t); render(); return }
  if(k === "hook"){ A2.hook = +v; render(); return }
  if(k === "end"){ A2.end = +v; render(); return }
  if(k === "export"){ a2Export(b, v); return }
  if(k === "wav"){ a2Wav(b); return }
  if(k === "png"){ a2PNG(b, v); return }
});
document.addEventListener("input", function(e){
  if(e.target.id !== "a2scrub") return;
  A2.t = e.target.value/1000*A2_DUR;
  var was = A2.playing; A2.playing = false; a2StopAudio();
  var b = document.getElementById("a2play"); if(b) b.textContent = "▶";
  a2Paint();
});
