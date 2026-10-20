/* =====================================================================
   ADS 2 — om gjort från grunden

   Utkast 1 (sektion 09) ligger kvar orört. Det här är den nya versionen.

   Formaten är fasta: video är 9:16, allt annat är 4:5. Annons A finns i
   båda — som Reel 9:16 och som flödesvideo 4:5, komponerad för formatet
   och inte beskuren. B och C är karuseller i 4:5.

   Allt är en ren funktion av tiden (a2Frame) eller en ren funktion av
   bildnummer (a2Slide), byggd av Studions egna renderare. Samma kod ger
   förhandsvisning, storyboard, MP4 och PNG. Objektdata är DEMODATA.
   ===================================================================== */

var A2 = {tab:"a", fmt:"916", view:"ren", t:2.4, playing:false, raf:0, t0:0, last:0, hook:0, end:0};
var A2_DUR = 15;
var A2_HOOKS = [["En fotografering.","Mer att arbeta med."],["Fotona är klara.","Inläggen också."],["Samma bilder.","Färdig marknadsföring."]];
var A2_ENDS  = [["Professionell bostadsfotografering.","Smartare marknadsföring."],["Du bokar.","Vi sköter resten."],["Bilderna först.","Resten följer."]];
var A2C = {paper:"#ECE8E5", ink:"#161616", oli:"#6E7266", mut:"#8C8782", line:"#CFC8C6", dark:"#141211"};
var A2_SER = "font-family:'Cormorant Garamond',Georgia,serif;font-weight:300;";
var A2_SAN = "font-family:Montserrat,sans-serif;";
var A2_OBJ = {addr:"Storgatan 13", city:"Landskrona"};
var A2_PHR = 0.58;   /* fotots andel av inläggets höjd i ARKIV · Till salu */
var A2_GRID = [["kommande",0,0,-1.4],["tillsalu",1,0,1.1],["visning",0,1,1.2],["sald",1,1,-1.0]];

function a2Url(k, inline){ return inline ? 'url('+pick(k)+')' : 'var(--a2-'+k+')'; }
function a2Layer(k, inline, extra){
  return '<div style="position:absolute;inset:0;background-image:'+a2Url(k,inline)+';background-size:cover;'+(extra||'')+'"></div>';
}
function a2Rect(r, inline, scale, fy, extra){
  return '<div style="position:absolute;left:'+r[0].toFixed(2)+'cqw;top:'+r[1].toFixed(2)+'cqw;width:'+r[2].toFixed(2)+'cqw;height:'
   +r[3].toFixed(2)+'cqw;overflow:hidden;'+(extra||'')+'"><div style="position:absolute;inset:0;background-image:'+a2Url("adHome",inline)
   +';background-size:cover;background-position:50% '+fy.toFixed(1)+'%;transform:scale('+scale.toFixed(4)+');transform-origin:50% '+fy.toFixed(1)+'%"></div></div>';
}
function a2Mix(a, b, p){ return [lerp(a[0],b[0],p), lerp(a[1],b[1],p), lerp(a[2],b[2],p), lerp(a[3],b[3],p)]; }
function a2Clip(inner, l, t, r, b){
  return '<div style="position:absolute;inset:0;clip-path:inset('+t.toFixed(2)+'% '+r.toFixed(2)+'% '+b.toFixed(2)+'% '+l.toFixed(2)+'%)">'+inner+'</div>';
}
function a2Cap(x, y, txt, st){
  return '<div style="position:absolute;left:'+x+'cqw;top:'+y+'cqw;'+A2_SAN+'font-weight:500;font-size:2.1cqw;letter-spacing:.3em;'
   +'text-transform:uppercase;white-space:nowrap;'+(st||'')+'">'+esc(txt)+'</div>';
}

/* En artboard ur Studion. Förhandsvisningen byter den inbäddade bilden mot en
   CSS-variabel — annars får webbläsaren avkoda 80 kB text fyra gånger per bildruta. */
function a2PostHTML(phase, inline){
  var p = {id:"a2-"+phase, phase:phase, m:"adHome", addr:A2_OBJ.addr, city:A2_OBJ.city};
  if(phase === "tillsalu"){ p.facts = [["4","rum och kök"],["112","kvadratmeter"],["3 450 000","kr utgångspris"]]; p.when = "Visning sön 13–14"; }
  if(phase === "kommande"){ p.when = "Släpps vecka 12"; }
  if(phase === "visning"){ p.when = "Söndag 13–14"; p.note = "Anmälan via mäklaren"; }
  if(phase === "sald"){ p.note = "Tack för förtroendet"; p.when = "Storgatan 13, Landskrona"; }
  var h = post("arkiv", p, "4:5");
  return inline ? h : h.split('url('+pick("adHome")+')').join('var(--a2-adHome)');
}
function a2Card(x, y, w, inner, st){
  return '<div style="position:absolute;left:'+x.toFixed(2)+'cqw;top:'+y.toFixed(2)+'cqw;width:'+w.toFixed(2)+'cqw;height:'+(w*1.25).toFixed(2)
   +'cqw;overflow:hidden;container-type:inline-size;background:#F2EFEF;box-shadow:0 2.2cqw 6cqw -1.6cqw rgba(0,0,0,.6);'+(st||'')+'">'+inner+'</div>';
}
function a2Tag(x, y, label, done, alignRight, p){
  var dc = done ? '#C9D2B6' : 'transparent';
  return '<div style="position:absolute;'+(alignRight ? 'right:'+x : 'left:'+x)+'cqw;top:'+y+'cqw;opacity:'+p.toFixed(2)+';transform:translateY('+((1-p)*1.6).toFixed(2)
   +'cqw);display:flex;align-items:center;gap:1.6cqw;font-family:Montserrat,sans-serif;font-weight:500;font-size:1.85cqw;letter-spacing:.16em;text-transform:uppercase;color:#fff;'
   +'border:1px solid rgba(255,255,255,.5);padding:1.1cqw 2.2cqw;border-radius:99px;white-space:nowrap">'
   +'<span style="width:1.7cqw;height:1.7cqw;border-radius:50%;border:1px solid #C9D2B6;background:'+dc+';display:inline-block"></span><span>'+esc(label)+'</span></div>';
}
function a2Cursor(x, y, press){
  return '<svg viewBox="0 0 24 34" style="position:absolute;left:'+x.toFixed(2)+'cqw;top:'+y.toFixed(2)+'cqw;width:6.4cqw;height:9cqw;overflow:visible;'
   +'filter:drop-shadow(0 .6cqw 1cqw rgba(0,0,0,.5));transform:scale('+(1-press*.14).toFixed(3)+')"><path d="M2 2v26l7-6.6 4.6 10.4 4.2-1.9-4.6-10.2 9.8-.3z" fill="#fff" stroke="#161616" stroke-width="1.6" stroke-linejoin="round"/></svg>';
}

function a2Dims(fmt){ return fmt === "916" ? {H:177.78, top:26, bot:31.5} : {H:125, top:8, bot:8}; }

/* Hela annonsen som funktion av tiden. */
function a2Frame(t, fmt, inline){
  var D = a2Dims(fmt), H = D.H, top = D.top, bot = D.bot, hk = A2_HOOKS[A2.hook], en = A2_ENDS[A2.end];
  var is9 = fmt === "916", cy = (top + H - bot)/2;
  var CW = is9 ? 78 : 70, CX = (100 - CW)/2, CH = CW*1.25, CY = cy - CH/2 - (is9 ? 1.5 : .5);
  var PH = CH*A2_PHR;
  var o = '<div style="position:absolute;inset:0;background:'+A2C.dark+'"></div>';

  /* mörk, mjuk bakgrund av samma foto — en 24 px bild uppskalad, ingen filterkostnad */
  var bgp = seg(t, 3.0, 3.9);
  if(bgp > 0 && t < 13.9) o += '<div style="position:absolute;inset:0;opacity:'+bgp.toFixed(3)+'">'+a2Layer("adHomeBlur", inline, 'background-position:50% 50%;transform:scale(1.25)')
    +'<div style="position:absolute;inset:0;background:rgba(16,13,13,.5)"></div></div>';

  /* fotot: helbild → plats i bildremsan → fotodelen av inlägget */
  var FULL = [0,0,100,H], SLOT = [33, cy-21.25, 34, 42.5], CARDPH = [CX, CY, CW, PH];
  var q1 = eInOut(seg(t, 3.0, 4.0)), q2 = eInOut(seg(t, 5.9, 6.8));
  var r = FULL, fy = 45, sc = lerp(1.14, 1.0, eOut(seg(t, 0, 3.4)));
  if(t >= 3.0){ r = a2Mix(FULL, SLOT, q1); fy = lerp(45, 42, q1); sc = lerp(sc, 1, q1); }
  if(t >= 5.9){ r = a2Mix(SLOT, CARDPH, q2); fy = lerp(42, 50, q2); }

  /* —— scen 2: bildremsa (grannbilder ur biblioteket) —— */
  if(t >= 3.3 && t < 6.5){
    var np = seg(t, 3.5, 4.2), nout = 1 - seg(t, 5.9, 6.4);
    var nb = [['living', 33-37], ['kitchen', 33+37]];
    nb.forEach(function(n){
      var dim = lerp(1, .32, seg(t, 5.3, 5.8));
      o += '<div style="position:absolute;left:'+n[1]+'cqw;top:'+(cy-21.25).toFixed(2)+'cqw;width:34cqw;height:42.5cqw;overflow:hidden;opacity:'
        +(np*nout*dim).toFixed(3)+'"><div style="position:absolute;inset:0;background-image:url('+pick(n[0])+');background-size:cover;background-position:50% 50%"></div></div>';
    });
    if(t < 6.2) o += a2Cap(0, top, "Välj bild", 'left:0;right:0;text-align:center;color:rgba(255,255,255,.75);opacity:'+np.toFixed(2));
  }
  /* valring + bock på den valda bilden */
  var sel = seg(t, 5.25, 5.6);
  if(sel > 0 && t < 6.9){
    var ring = lerp(1, 0, seg(t, 6.2, 6.8));
    o += '<div style="position:absolute;left:'+(SLOT[0]-1.2)+'cqw;top:'+(SLOT[1]-1.2).toFixed(2)+'cqw;width:36.4cqw;height:44.9cqw;border:.45cqw solid rgba(255,255,255,'
      +(sel*ring*.95).toFixed(2)+')"></div>';
  }

  /* —— kortet: bakgrundsskugga, fotot, pappret under, och mallen —— */
  var sh = seg(t, 5.9, 6.8);
  if(t >= 5.9 && t < 10.0) o += '<div style="position:absolute;left:'+CX+'cqw;top:'+CY.toFixed(2)+'cqw;width:'+CW+'cqw;height:'+CH.toFixed(2)
    +'cqw;box-shadow:0 2.2cqw 6cqw -1.6cqw rgba(0,0,0,'+(.6*sh).toFixed(2)+')"></div>';
  if(t >= 5.9 && t < 6.8) o += '<div style="position:absolute;left:'+CX+'cqw;top:'+(CY+PH).toFixed(2)+'cqw;width:'+CW+'cqw;height:'+((CH-PH)*q2).toFixed(2)+'cqw;background:#F2EFEF"></div>';

  var inMain = t >= 6.8 && t < 10.0;
  if(t < 6.8 || t < 4.0 && false) o += a2Rect(r, inline, sc, fy, t >= 3.0 ? 'box-shadow:0 1.6cqw 5cqw -1.6cqw rgba(0,0,0,'+(.55*q1).toFixed(2)+')' : '');
  if(inMain){
    var pp = eInOut(seg(t, 7.0, 9.2)), main = a2PostHTML("tillsalu", inline);
    var inner = a2Clip(main, 0, 0, 0, 100 - A2_PHR*100) + a2Clip(main, 0, lerp(100, A2_PHR*100, pp), 0, 0);
    o += '<div style="position:absolute;left:'+CX+'cqw;top:'+CY.toFixed(2)+'cqw;width:'+CW+'cqw;height:'+CH.toFixed(2)
      +'cqw;overflow:hidden;container-type:inline-size;background:#F2EFEF;box-shadow:0 2.2cqw 6cqw -1.6cqw rgba(0,0,0,.6);transform:translateY('+(seg(t,9.7,10.0)*-3).toFixed(2)+'cqw)">'+inner+'</div>';
  }

  /* markör och taggar */
  if(t >= 6.9 && t < 9.9){
    var o1 = seg(t, 6.9, 7.4), o2 = seg(t, 7.4, 7.9), d1 = t > 8.7, d2 = t > 9.1, ex = 1 - seg(t, 9.6, 9.9);
    o += '<div style="opacity:'+ex.toFixed(2)+'">'+a2Tag(CX, CY-7.4, "Objektdata", d1, false, o1)+a2Tag(CX, CY-7.4, "Kontorsprofil", d2, true, o2)
      +'<div style="position:absolute;left:'+CX+'cqw;right:'+CX+'cqw;top:'+(CY-2.4).toFixed(2)+'cqw;height:1px;background:rgba(255,255,255,.22)"></div></div>';
  }
  if(t >= 8.9 && t < 10.2){
    var cap = seg(t, 9.0, 9.7) * (1 - seg(t, 9.8, 10.2));
    o += '<div style="position:absolute;left:0;right:0;top:'+(CY+CH+4.4).toFixed(2)+'cqw;text-align:center;'+A2_SER+'font-style:italic;font-size:5.4cqw;color:#fff;opacity:'
      +cap.toFixed(2)+'">Klart. I kontorets egen profil.</div>';
  }
  if(t >= 7.0 && t < 10.0) o += a2Cap(0, top - (is9 ? 1 : 0), "Demodata", 'right:8cqw;left:auto;color:rgba(255,255,255,.5);font-size:1.8cqw;opacity:'+seg(t,7.0,7.4).toFixed(2));

  /* markören: kommer in nedifrån, trycker på bilden */
  if(t >= 4.3 && t < 6.2){
    var mp = eInOut(seg(t, 4.3, 5.25)), pr = seg(t, 5.25, 5.4) * (1 - seg(t, 5.5, 5.75)), mo = 1 - seg(t, 5.85, 6.2);
    var cx = lerp(92, 55, mp), cyy = lerp(H - 12, cy + 4, mp);
    o += '<div style="opacity:'+mo.toFixed(2)+'">'+a2Cursor(cx, cyy, pr)+'</div>';
  }

  /* —— scen 1: hook på bilden —— */
  if(t < 3.6){
    var sc1 = 1 - seg(t, 2.8, 3.4), yb = H - bot - 25;
    o += '<div style="position:absolute;left:0;right:0;bottom:0;height:'+(is9 ? 66 : 70)+'%;opacity:'+sc1.toFixed(3)
      +';background:linear-gradient(180deg,rgba(14,11,11,0),rgba(14,11,11,.78))"></div>';
    o += '<div style="position:absolute;left:0;right:0;top:0;height:30%;opacity:'+sc1.toFixed(3)+';background:linear-gradient(180deg,rgba(14,11,11,.5),rgba(14,11,11,0))"></div>';
    o += '<div style="opacity:'+sc1.toFixed(3)+';transform:translateY('+(-seg(t,2.8,3.4)*3).toFixed(2)+'cqw)">'
      + a2Cap(8, top, "Viewly · Bostadsfotografering", 'color:rgba(255,255,255,.85);clip-path:inset(-12% '+((1-eOut(seg(t,.2,1.0)))*100).toFixed(1)+'% -30% 0)')
      + '<div style="position:absolute;left:8cqw;right:6cqw;top:'+yb.toFixed(2)+'cqw;'+A2_SER+'font-size:11cqw;line-height:1.04;color:#fff;white-space:nowrap;clip-path:inset(0 '
        +((1-eOut(seg(t,.45,1.35)))*100).toFixed(1)+'% -30% 0)">'+esc(hk[0])+'</div>'
      + '<div style="position:absolute;left:8cqw;right:6cqw;top:'+(yb+12.6).toFixed(2)+'cqw;'+A2_SER+'font-style:italic;font-size:10.2cqw;line-height:1.04;color:#E6DCCF;white-space:nowrap;clip-path:inset(0 '
        +((1-eOut(seg(t,1.35,2.35)))*100).toFixed(1)+'% -30% 0)">'+esc(hk[1])+'</div></div>';
  }

  /* —— scen 4: samma bild, fyra faser — mallarna i ett rutnät —— */
  if(t >= 9.9 && t < 14.0){
    var GW = is9 ? 36 : 34, GH = GW*1.25, GG = 3.2, GTOP = is9 ? top + 25 : top + 21;
    var GX0 = (100 - (GW*2 + GG))/2;
    var hp = seg(t, 10.9, 11.9);
    o += '<div style="position:absolute;left:8cqw;right:8cqw;top:'+(top-1).toFixed(2)+'cqw;opacity:'+hp.toFixed(2)+'">'
      +'<div style="'+A2_SER+'font-size:'+(is9 ? 9.4 : 8)+'cqw;line-height:1.04;color:#fff">Samma bild.</div>'
      +'<div style="'+A2_SER+'font-style:italic;font-size:'+(is9 ? 9.4 : 8)+'cqw;line-height:1.04;color:#E6DCCF">Fyra faser.</div></div>';
    A2_GRID.forEach(function(g, i){
      var gx = GX0 + g[1]*(GW + GG), gy = GTOP + g[2]*(GH + GG), isMain = g[0] === "tillsalu";
      var lp = isMain ? eInOut(seg(t, 9.8, 10.8)) : eOut(seg(t, 10.3 + i*.3, 11.2 + i*.3));
      var x, y, w;
      if(isMain){ x = lerp(CX, gx, lp); y = lerp(CY - (seg(t,9.7,10.0)*3), gy, lp); w = lerp(CW, GW, lp); }
      else { x = gx; y = gy + (1 - lp)*10; w = GW; }
      var op = isMain ? 1 : lp;
      var inner = a2PostHTML(g[0], inline);
      o += a2Card(x, y, w, inner, 'opacity:'+op.toFixed(3)+';transform:rotate('+(g[3]*lp*(isMain ? 1 : 1)).toFixed(2)+'deg)');
    });
    o += '<div style="position:absolute;left:0;right:0;top:'+(GTOP + GH*2 + GG + 4.4).toFixed(2)+'cqw;text-align:center;'+A2_SAN+'font-weight:500;font-size:2.1cqw;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.7);opacity:'
      +seg(t, 11.8, 12.4).toFixed(2)+'">Kommande · Till salu · Visning · Såld</div>';
  }

  /* —— scen 5: slutkort —— */
  if(t >= 13.0){
    var ep = eInOut(seg(t, 13.0, 13.8)), y0 = cy - (is9 ? 30 : 24);
    o += '<div style="position:absolute;inset:0;background:'+A2C.paper+';clip-path:inset('+((1-ep)*100).toFixed(2)+'% 0 0 0)">'
      +'<div style="position:absolute;left:8cqw;top:'+y0.toFixed(2)+'cqw;width:13cqw;height:13cqw">'+vmark(A2C.ink, A2C.oli, 'width="100%" height="100%"')+'</div>'
      +'<div style="position:absolute;left:24.6cqw;top:'+(y0+4.2).toFixed(2)+'cqw;'+A2_SAN+'font-weight:500;font-size:3.9cqw;letter-spacing:.44em;color:'+A2C.ink+'">VIEWLY</div>'
      +'<div style="position:absolute;left:8cqw;right:8cqw;top:'+(y0+22).toFixed(2)+'cqw">'
        +'<div style="'+A2_SER+'font-size:'+(A2.end === 0 ? 10 : 13.4)+'cqw;line-height:1.02;color:'+A2C.ink+';clip-path:inset(-12% '+((1-eOut(seg(t,13.4,14.2)))*100).toFixed(1)+'% -30% 0)">'+esc(en[0])+'</div>'
        +'<div style="'+A2_SER+'font-style:italic;font-size:'+(A2.end === 0 ? 10 : 13.4)+'cqw;line-height:1.02;color:'+A2C.oli+';margin-top:1.6cqw;clip-path:inset(-12% '+((1-eOut(seg(t,13.8,14.6)))*100).toFixed(1)+'% -30% 0)">'+esc(en[1])+'</div></div>'
      + a2Cap(8, H - bot - 11, "För fastighetsmäklare i Skåne", 'color:'+A2C.mut+';opacity:'+seg(t,14.2,14.8).toFixed(2))
      + a2Cap(8, H - bot - 6.4, "viewly.se/maklare", 'color:'+A2C.ink+';opacity:'+seg(t,14.4,14.9).toFixed(2))
      +'</div>';
  }
  return o;
}

/* —— karusellerna (4:5) —— */
function a2Edge(){ return '<div style="position:absolute;inset:3cqw;border:1px solid rgba(255,255,255,.5);pointer-events:none"></div>'; }
function a2Foot(i, n, dark){
  var c = dark ? 'rgba(255,255,255,.8)' : A2C.mut;
  return '<div style="position:absolute;left:8cqw;right:8cqw;bottom:7cqw;display:flex;justify-content:space-between;'+A2_SAN+'font-weight:500;font-size:1.9cqw;letter-spacing:.3em;color:'+c+'"><span>VIEWLY</span><span>'+(i+1)+' / '+n+'</span></div>';
}
function a2End(i, n, l1, l2, sub){
  return '<div style="position:absolute;inset:0;background:'+A2C.paper+'">'
   +'<div style="position:absolute;left:8cqw;top:15cqw;width:12cqw;height:12cqw">'+vmark(A2C.ink, A2C.oli, 'width="100%" height="100%"')+'</div>'
   +'<div style="position:absolute;left:23.4cqw;top:19cqw;'+A2_SAN+'font-weight:500;font-size:3.6cqw;letter-spacing:.44em;color:'+A2C.ink+'">VIEWLY</div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:44cqw"><div style="'+A2_SER+'font-size:11.4cqw;line-height:1.03;color:'+A2C.ink+'">'+esc(l1)+'</div>'
   +(l2 ? '<div style="'+A2_SER+'font-style:italic;font-size:11.4cqw;line-height:1.03;color:'+A2C.oli+';margin-top:1.4cqw">'+esc(l2)+'</div>' : '')+'</div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;bottom:21cqw;border-top:1px solid '+A2C.line+';padding-top:3.4cqw;'+A2_SAN+'font-weight:500;font-size:2.2cqw;letter-spacing:.26em;text-transform:uppercase;color:'+A2C.mut+'">'+esc(sub)
   +'<div style="color:'+A2C.ink+';margin-top:2.2cqw">viewly.se/maklare</div></div>'
   + a2Foot(i, n, false)+'</div>';
}
function a2Bg(inline){
  return '<div style="position:absolute;inset:0;background:'+A2C.dark+'"></div>'+a2Layer("adHomeBlur", inline, 'transform:scale(1.25)')
   +'<div style="position:absolute;inset:0;background:rgba(16,13,13,.5)"></div>';
}
function a2Slide(set, i, inline){
  var o = '', n = 5;
  if(set === "b"){
    if(i === 0){
      o = a2Layer("adHome", inline, 'background-position:50% 44%')
       +'<div style="position:absolute;left:0;right:0;bottom:0;height:70%;background:linear-gradient(180deg,rgba(14,11,11,0),rgba(14,11,11,.82))"></div>'
       + a2Edge() + a2Cap(8, 8.5, "Viewly · Efter leveransen", 'color:rgba(255,255,255,.85)')
       +'<div style="position:absolute;left:8cqw;right:9cqw;bottom:20cqw;'+A2_SER+'font-size:11.4cqw;line-height:1.04;color:#fff">Vad händer efter att bilderna är levererade?</div>'
       +'<div style="position:absolute;right:8cqw;bottom:7cqw;'+A2_SAN+'font-weight:500;font-size:2.1cqw;letter-spacing:.3em;color:rgba(255,255,255,.85)">SVEPA →</div>';
    } else if(i === 1){
      o = a2Bg(inline) + a2Cap(8, 8.5, "01 · Levererat", 'color:rgba(255,255,255,.7)')
       +'<div style="position:absolute;left:8cqw;right:8cqw;top:16cqw;'+A2_SER+'font-size:10.4cqw;line-height:1.04;color:#fff">Bilderna levereras.</div>'
       + a2Card(5, 52, 38, '<div style="position:absolute;inset:0;background-image:url('+pick("living")+');background-size:cover;background-position:50% 50%"></div>', 'transform:rotate(-5deg)')
       + a2Card(57, 52, 38, '<div style="position:absolute;inset:0;background-image:url('+pick("kitchen")+');background-size:cover;background-position:50% 50%"></div>', 'transform:rotate(5deg)')
       + a2Card(26, 46, 48, '<div style="position:absolute;inset:0;background-image:'+a2Url("adHome",inline)+';background-size:cover;background-position:50% 45%"></div>', '')
       + a2Foot(i, n, true);
    } else if(i === 2){
      var py = 37, pw = 50, ph = pw*1.25;
      var mk = function(yp, k){ return '<div style="position:absolute;left:'+(25-2.2)+'cqw;top:'+(py+ph*yp-2.2)+'cqw;width:4.4cqw;height:4.4cqw;border-radius:50%;background:#fff;color:'+A2C.ink+';'+A2_SAN+'font-weight:600;font-size:2.2cqw;display:flex;align-items:center;justify-content:center;box-shadow:0 .6cqw 1.6cqw rgba(0,0,0,.4)">'+k+'</div>'; };
      o = a2Bg(inline) + a2Cap(8, 8.5, "02 · Automatiskt", 'color:rgba(255,255,255,.7)')
       +'<div style="position:absolute;left:8cqw;right:8cqw;top:15cqw;'+A2_SER+'font-size:8.6cqw;line-height:1.04;color:#fff">Resten läggs på av sig självt.</div>'
       + a2Card(25, py, pw, '<div style="position:absolute;inset:0">'+(inline ? a2PostHTML("tillsalu", true) : a2PostHTML("tillsalu", false))+'</div>', '')
       + mk(.665,"1") + mk(.80,"2") + mk(.935,"3")
       +'<div style="position:absolute;left:8cqw;right:8cqw;top:104cqw;display:grid;grid-template-columns:1fr 1fr;gap:1.8cqw 6cqw;'+A2_SAN+'font-weight:500;font-size:2.15cqw;letter-spacing:.14em;line-height:1.4;color:rgba(255,255,255,.88)">'
       +'<div><b style="color:#C9D2B6">1</b>&nbsp; Adress</div><div><b style="color:#C9D2B6">2</b>&nbsp; Rum, yta och pris</div>'
       +'<div><b style="color:#C9D2B6">3</b>&nbsp; Visning</div><div><b style="color:#C9D2B6">+</b>&nbsp; Kontorets profil</div></div>'
       + a2Foot(i, n, true);
    } else if(i === 3){
      var gw = 38, gh = gw*1.25;
      o = a2Bg(inline) + a2Cap(8, 8.5, "03 · Faser", 'color:rgba(255,255,255,.7)')
       +'<div style="position:absolute;left:8cqw;right:8cqw;top:15cqw"><div style="'+A2_SER+'font-size:9.4cqw;line-height:1.04;color:#fff">Samma bild.</div><div style="'+A2_SER+'font-style:italic;font-size:9.4cqw;line-height:1.04;color:#E6DCCF">Fyra faser.</div></div>';
      A2_GRID.forEach(function(g){
        o += a2Card(50 - gw - 1.6 + g[1]*(gw+3.2), 44 + g[2]*(gh+3.2) - 4, gw, a2PostHTML(g[0], inline), 'transform:rotate('+g[3]+'deg)');
      });
      o += a2Foot(i, n, true);
    } else {
      o = a2End(i, n, "Professionell bostadsfotografering.", "Smartare marknadsföring.", "För fastighetsmäklare i Skåne");
    }
  } else {
    var libs = ["adHome","living","hero","kitchen"];
    if(i < 4){
      var k = libs[i], pos = i === 0 ? '50% 40%' : '50% 50%';
      o = (i === 0 ? a2Layer("adHome", inline, 'background-position:'+pos)
          : '<div style="position:absolute;inset:0;background-image:url('+pick(k)+');background-size:cover;background-position:'+pos+'"></div>')
       +'<div style="position:absolute;left:0;right:0;bottom:0;height:24%;background:linear-gradient(180deg,rgba(14,11,11,0),rgba(14,11,11,.5))"></div>'
       + a2Edge()
       + (i === 0 ? a2Cap(8, 8.5, "Viewly", 'color:rgba(255,255,255,.9)') : '')
       +'<div style="position:absolute;left:8cqw;right:8cqw;bottom:7cqw;display:flex;justify-content:space-between;'+A2_SAN+'font-weight:500;font-size:1.9cqw;letter-spacing:.3em;color:rgba(255,255,255,.9)"><span>'+(i === 0 ? 'DET BÖRJAR MED BILDEN' : 'VIEWLY')+'</span><span>'+(i+1)+' / '+n+'</span></div>';
    } else {
      o = a2End(i, n, "Det börjar med bilden.", "", "Bostadsfotografering för fastighetsmäklare i Skåne");
    }
  }
  return o;
}

/* —— sidan —— */
var A2_BOARD = [[1.0,"Hook","Fotot först, helbild i långsam rörelse. Hooken skrivs på bilden."],
                [4.7,"Välj bild","Bilden dras in i en bildrem och väljs. Det är här automationen börjar."],
                [8.1,"Mallen fylls","Objektdata och kontorsprofil läggs på av sig själva. Det färdiga inlägget är den riktiga Till salu-mallen."],
                [12.0,"Samma bild, fyra faser","Hela kampanjen ur samma foto. Visar bredden utan att prata om den."],
                [14.3,"Avsändare","Viewly som fotograf först. Två rader och en hårlinje."]];

function a2Opt(kind, val, label, on){
  return '<button type="button" class="a2seg'+(on ? ' on' : '')+'" data-a2="'+kind+'" data-v="'+val+'">'+esc(label)+'</button>';
}
function a2Tabs(){
  var T = [["a","A","En fotografering. Mer att arbeta med.","Video · 9:16 och 4:5 · 15 s", "frame"],
           ["b","B","Vad händer efter att bilderna är levererade?","Karusell · 4:5 · 5 bilder", "b"],
           ["c","C","Det börjar med bilden.","Karusell · 4:5 · 5 bilder", "c"]];
  return '<div class="a2tabs">'+T.map(function(x){
    var thumb = x[4] === "frame"
      ? '<div class="a2-th a2-th916"><div class="a2fr">'+a2Lite(a2Frame(2.4, "916", false))+'</div></div>'
      : '<div class="a2-th a2-th45"><div class="a2fr">'+a2Lite(a2Slide(x[4], 0, false))+'</div></div>';
    return '<button type="button" class="a2tab" data-a2="tab" data-v="'+x[0]+'" aria-current="'+(A2.tab === x[0])+'">'+thumb
      +'<span class="a2tl"><i>Annons '+x[1]+'</i><b>'+esc(x[2])+'</b><em>'+x[3]+'</em></span></button>';
  }).join('')+'</div>';
}
function a2Lite(h){ return h; }

function a2Stage(){
  var is9 = A2.fmt === "916";
  var fr = '<div class="a2fr a2screen '+(is9 ? 'f916' : 'f45')+'" id="a2screen">'+a2Frame(A2.t, A2.fmt, false)+'</div>';
  if(A2.view === "plats"){
    if(is9) fr = '<div class="a2plats a2reels">'+fr
      +'<div class="a2scrim"></div><div class="a2rt"><b>Reels</b><span>•••</span></div>'
      +'<div class="a2rb"><div class="a2who"><span class="a2av">'+vmark("#161616","#6E7266",'width="100%" height="100%"')+'</span><b>viewly.se</b><i>Sponsrad</i></div>'
      +'<p>Bilderna är bara början. Med Viewly blir fotograferingen också färdigt material. <u>mer</u></p><div class="a2cta">Läs mer</div></div></div>';
    else fr = '<div class="a2plats a2feed"><div class="a2fh"><span class="a2av">'+vmark("#161616","#6E7266",'width="100%" height="100%"')+'</span><div><b>viewly.se</b><i>Sponsrad</i></div><span class="a2dots">•••</span></div>'
      +fr+'<div class="a2fc"><span>viewly.se<br><b>'+esc(A2_HOOKS[A2.hook][0]+' '+A2_HOOKS[A2.hook][1])+'</b></span><em>Läs mer</em></div>'
      +'<div class="a2fp"><b>viewly.se</b> Bilderna är bara början. Med Viewly blir fotograferingen också färdigt material. <u>mer</u></div></div>';
  }
  return fr;
}

function a2A(){
  var t = A2.t;
  var board = A2_BOARD.map(function(b, i){
    return '<div class="a2bc"><div class="a2bfr '+(A2.fmt === "916" ? 'f916' : 'f45')+'"><div class="a2fr" id="a2b'+i+'">'+a2Frame(b[0], A2.fmt, false)+'</div></div>'
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
   +'<div class="a2h">Hook</div><div class="a2segs col">'+hooks+'</div>'
   +'<div class="a2h">Slutrad</div><div class="a2segs col">'+ends+'</div>'
   +'<div class="a2h">Exportera</div><div class="a2segs col">'
   +'<button class="a2seg dl" type="button" data-a2="export" data-v="916">MP4 · 9:16 · 1080 × 1920</button>'
   +'<button class="a2seg dl" type="button" data-a2="export" data-v="45">MP4 · 4:5 · 1080 × 1350</button></div>'
   +'<p class="a2note" id="dlstat"></p>'
   +'</div></div>'
   +'<div class="a2sub">Hur den byggs</div><div class="a2board">'+board+'</div>'
   +'<div class="a2sub">Text till Meta</div>'
   +'<div class="a2copy"><div><b>Primärtext</b><p>Bilderna är bara början.<br>Med Viewly blir fotograferingen också färdigt material: objektets uppgifter och kontorets profil läggs på automatiskt i Social Media Studio.<br>Bostadsfotografering för mäklare i Skåne.</p></div>'
   +'<div><b>Rubrik</b><p>'+esc(A2_HOOKS[A2.hook][0]+" "+A2_HOOKS[A2.hook][1])+'</p><b>Beskrivning</b><p>Viewly · bostadsfotografering för mäklare</p><b>Knapp och länk</b><p>Läs mer · viewly.se/maklare</p></div>'
   +'<div><b>Kortare variant</b><p>Fina bilder. Och färdiga inlägg direkt efteråt.<br>Viewly fotograferar för mäklare i Skåne.</p><b>Mål</b><p>Trafik till /maklare och bokning av provfotografering.</p></div></div>';
}

function a2Slides(set){
  var items = [0,1,2,3,4].map(function(i){
    var stand = set === "c" && i > 0 && i < 4;
    return '<div class="a2slw"><div class="a2sl"><div class="a2fr f45">'+a2Slide(set, i, false)+'</div></div>'
     +'<div class="a2slm"><span class="mono">'+(i+1)+' / 5'+(stand ? ' · stand-in' : '')+'</span>'
     +'<button type="button" class="a2mini" data-a2="png" data-v="'+set+':'+i+'">Ladda ner PNG</button></div></div>';
  }).join('');
  return '<div class="a2slides">'+items+'</div>';
}
function a2B(){
  return a2Slides("b")
   +'<div class="a2copy"><div><b>Primärtext</b><p>Bilderna är levererade. Vad händer sen?<br>Objektets uppgifter och kontorets profil läggs på automatiskt, så inlägget är färdigt.</p></div>'
   +'<div><b>Rubrik</b><p>Vad händer efter att bilderna är levererade?</p><b>Knapp och länk</b><p>Läs mer · viewly.se/maklare</p></div>'
   +'<div><b>Roll i kampanjen</b><p>Ger svaret för den som blev nyfiken av Annons A. Ett påstående per bild.</p></div></div>';
}
function a2C(){
  return a2Slides("c")
   +'<div class="a2need"><b>Behöver för publicering</b><ol>'
   +'<li>Fyra bilder från samma objekt som bild 1: totalbild, kök eller detalj, skymning eller exteriör. Stående 4:5.</li>'
   +'<li>Tillstånd att använda objektet i annonsering, och besked om affischerna får synas.</li>'
   +'<li>Bild 2–4 är stand-ins ur biblioteket och byts ut. Ingen fotoserie har hittats på.</li></ol></div>'
   +'<div class="a2copy"><div><b>Primärtext</b><p>Det börjar med bilden.<br>Bostadsfotografering för fastighetsmäklare i Skåne.</p></div>'
   +'<div><b>Rubrik</b><p>Det börjar med bilden.</p><b>Knapp och länk</b><p>Läs mer · viewly.se/maklare</p></div>'
   +'<div><b>Roll i kampanjen</b><p>Ren kvalitetsbevisning för den som redan känner Viewly. Nästan helt fotografi.</p></div></div>';
}

function a2Underlag(){
  return '<details class="a2det"><summary>Bedömning, research och vad som är verifierat</summary><div class="a2und">'
   +'<div><b>Bedömning</b><p><b>Fotografering är produkten.</b> Annons A öppnar med enbart fotot, visar automationen som följd och slutar med fotografering.</p>'
   +'<p><b>En annons, en fördel.</b> Bilderna blir färdigt material. Inga priser, rabatter eller löften om fler affärer.</p>'
   +'<p><b>Fotot är en detaljbild.</b> Starkt som öppning, men inlägget bör i produktion byggas på mäklarens huvudbild. Affischerna är andras konstverk, så klarera dem.</p>'
   +'<p><b>Meta.</b> Annonsen säljer en tjänst till företag och bör inte falla under Bostäder. Kontrollera i annonshanteraren.</p></div>'
   +'<div><b>Verifierat på viewly.se</b><p>Social Media Studio hämtar levererade bilder, adress, rum, boarea, pris, ansvarig mäklare och visningsuppgifter. Kontoret ställer in logga, färger, typsnitt och layout per fas en gång. Faserna är Kommande, Till salu, Visning och Såld. Format 4:5, 1:1, 9:16, 16:9 och A4. Hör till ViewlyPro, 30 dagar gratis, ingen bindningstid.</p>'
   +'<p>Konkurrenter: SE360 och Bofoto säljer foto, film, planritning och tryckt material. Ingen av dem visar färdigt marknadsföringsmaterial som följd av fotograferingen (antagande, tre av fyra sidor lästa).</p></div>'
   +'<div><b>Behöver bekräftas</b><p>Vilka fält Studion fyller i automatiskt per kontor. "Plus/Premium" finns inte på /maklare, så annonsen påstår inget om paket. Diakrit och Metas annonsbibliotek gick inte att läsa.</p>'
   +'<p><b>Hypotes att testa:</b> en fotoannons med automation som följd ger fler förfrågningar än en ren fotoannons.</p>'
   +'<p>Alla uppgifter i annonserna (Storgatan 13, pris, tider, kontor) är <b>demodata</b>.</p></div></div></details>';
}

function secAds2(){
  a2Inject();
  var body = A2.tab === "a" ? a2A() : A2.tab === "b" ? a2B() : a2C();
  return '<div class="a2page"><div class="a2head"><div class="eyebrow">Ads · 10</div><h2>Viewlys första annonser</h2>'
    +'<p>Video i 9:16, allt annat i 4:5. Byggt av Studions egna mallar med ett riktigt foto. Förslag, inte låsta krav. Inget publicerat.</p></div>'
    + a2Tabs() + body + a2Underlag() + '</div>';
}

/* —— uppspelning, export, reglage —— */
function a2Inject(){
  if(document.getElementById("a2css")) return;
  var s = document.createElement("style"); s.id = "a2css";
  s.textContent = ":root{--a2-adHome:url("+pick("adHome")+");--a2-adHomeBlur:url("+pick("adHomeBlur")+")}";
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
  if(A2.t >= A2_DUR){ A2.t = A2_DUR; A2.playing = false; a2Paint(); var b = document.getElementById("a2play"); if(b) b.textContent = "▶"; return }
  if(now - A2.last > 30){ A2.last = now; a2Paint() }
  A2.raf = requestAnimationFrame(a2Tick);
}
function a2Play(){
  var b = document.getElementById("a2play");
  if(A2.playing){ A2.playing = false; if(b) b.textContent = "▶"; return }
  if(A2.t >= A2_DUR - .05) A2.t = 0;
  A2.playing = true; A2.t0 = performance.now() - A2.t*1000; if(b) b.textContent = "❚❚";
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
  var keep = A2.t; A2.playing = false;
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
    if(ok) status("Annons A · "+(fmt === "916" ? "9:16" : "4:5")+" · "+A2_DUR+" s · 30 bilder/s · "+fmtBytes(blob.size)
      +(vag === "avc" ? "" : " · webbläsaren saknar H.264, filen är VP9 och spelas inte på iPhone"));
  }
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
  if(k === "tab"){ A2.tab = v; A2.playing = false; render({top:true}); return }
  if(k === "play"){ a2Play(); return }
  if(k === "fmt"){ A2.fmt = v; render(); return }
  if(k === "view"){ A2.view = v; render(); return }
  if(k === "hook"){ A2.hook = +v; render(); return }
  if(k === "end"){ A2.end = +v; render(); return }
  if(k === "export"){ a2Export(b, v); return }
  if(k === "png"){ a2PNG(b, v); return }
});
document.addEventListener("input", function(e){
  if(e.target.id !== "a2scrub") return;
  A2.t = e.target.value/1000*A2_DUR; A2.playing = false;
  var b = document.getElementById("a2play"); if(b) b.textContent = "▶";
  a2Paint();
});
