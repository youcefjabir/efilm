/* =====================================================================
   MOTION — tidsfunktioner

   Ingen animationsmotor. Varje rörelse är en REN FUNKTION AV TIDEN:

       mframe(kandidat, riktning, dirId, t)  ->  HTML

   där t går 0 → 1 över klippets längd. Samma funktion driver både
   förhandsvisningen i studion och exporten, så de kan aldrig glida isär,
   och ruta n ser likadan ut varje gång den renderas.

   Mätt på den här datan: att bygga en bildrutas HTML tar 0,19 ms och att
   rastrera 1080 × 1920 tar 39 ms. Att bygga om hela ramen per bildruta är
   alltså gratis i förhandsvisning och kostar ~7 s för ett sexsekunders
   klipp i export. Därför behövs varken GSAP, WAAPI eller Remotion.

   Keyframe-galleriet i vy 07 anropar samma funktioner med t = 0, 0,5 och 1.
   ===================================================================== */

/* ---------- tid ---------- */
function mclamp(v){ return v<0?0:v>1?1:v }
/* seg() klipper ut ett tidsfönster ur klippet och normaliserar det till 0–1.
   Det är hela verktygslådan för sekvensering — inga tidslinjeobjekt. */
function seg(t, a, b){ return mclamp((t-a)/(b-a)) }
function lerp(a, b, t){ return a+(b-a)*t }
function eIn(t){ return t*t*t }
function eOut(t){ return 1-Math.pow(1-t,3) }
function eInOut(t){ return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2 }

/* ---------- palett och byggstenar ---------- */
function mtone(dirId){
  var d = dirId === "skugga";
  return {dark:d, paper:d?"#0E0E0D":"#F2EFEF", ink:d?"#EFEDE7":"#1C1C1E",
          mut:d?"#8C8A84":"#8A8580", line:d?"#2A2A27":"#D8D2CF",
          oli:d?"#98A088":"#6E7266", plate:d?"#17171A":"#FFFFFF"};
}
function mshell(dirId, inner){
  var T = mtone(dirId);
  return '<div class="'+(T.dark?"b":"a")+'" style="background:'+T.paper+'">'+inner+'</div>';
}
function mkick(dirId, t){
  var T = mtone(dirId);
  return '<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;font-family:Montserrat,sans-serif;'
   +'font-size:2.25cqw;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:'+T.oli+'">'+esc(t)+'</div>';
}
function mfoot(dirId){
  var T = mtone(dirId);
  return '<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+SAFE.bot+'cqw;display:flex;'
   +'justify-content:space-between;align-items:baseline;font-family:Montserrat,sans-serif;font-size:2.05cqw;'
   +'letter-spacing:.2em;text-transform:uppercase;color:'+T.mut+'"><span>VIEWLY</span><span>viewly.se</span></div>';
}
function mrule(dirId, y, x1, x2, o){
  var T = mtone(dirId);
  return '<div style="position:absolute;left:'+x1+'cqw;right:'+x2+'cqw;top:'+y+'cqw;height:1px;background:'
   +T.line+';opacity:'+(o==null?1:o)+'"></div>';
}
function mimg(k, x, y, w, h, extra){
  return '<div style="position:absolute;left:'+x+'cqw;top:'+y+'cqw;width:'+w+'cqw;height:'+h+'cqw;'
   +'overflow:hidden;'+(extra||'')+'"><div style="position:absolute;inset:0;'+bg(k,"m-"+k)+'"></div></div>';
}
function mdisp(dirId, txt, cap){
  var T = mtone(dirId);
  return '<div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;color:'+T.ink+';'
   + dsize(txt, cap||9.6, SERIF) +'line-height:1.02">'+esc(txt)+'</div>';
}
function mbody(dirId, txt, op){
  var T = mtone(dirId);
  return '<div style="font-family:Montserrat,sans-serif;font-weight:400;font-size:2.9cqw;line-height:1.6;color:'
   +(T.dark?"#A8A6A0":"#4A4744")+';opacity:'+(op==null?1:op)+'">'+esc(txt)+'</div>';
}
/* Maskerat radbyte: texten avslöjas genom en clip, inte en fade. Det är
   skillnaden mellan en tryckt rad som sätts och en webbanimation. */
function mreveal(inner, p){
  return '<div style="clip-path:inset(0 '+((1-mclamp(p))*100).toFixed(1)+'% 0 0)">'+inner+'</div>';
}
function mfade(inner, p){
  return '<div style="opacity:'+mclamp(p).toFixed(3)+'">'+inner+'</div>';
}
/* Byter mellan två rader med en maskerad övergång i stället för korsfade. */
function mswap(dirId, a, b, p, cap){
  p = mclamp(p);
  return p < .5 ? mreveal(mdisp(dirId,a,cap), 1-seg(p,0,.5))
                : mreveal(mdisp(dirId,b,cap), seg(p,.5,1));
}

/* =====================================================================
   KANDIDATERNA
   Varje funktion tar (dirId, t) och returnerar en färdig bildruta.
   Tidsfönstren följer storyboarden i vy 07.
   ===================================================================== */
var MK = {};

/* ---------- 01 ANNONSSKRIVAREN ---------- */
MK.annons = {
 editorial:function(D, t){
   var T=mtone(D), ims=["hero","kitchen","living","dining","boucle","eames"];
   var inP = seg(t,.14,.46), outP = seg(t,.46,.58), setP = seg(t,.58,.86), leadP = seg(t,.86,1);
   var strip = ims.map(function(k,j){
     var p = eOut(mclamp((inP - j*.10) / .55));           /* 70 ms isär */
     var y = lerp(41, 34, p) + outP*13;
     var o = p * lerp(1, .34, eInOut(outP));
     return '<div style="position:absolute;left:'+(6.4+j*14.8)+'cqw;top:'+y.toFixed(2)+'cqw;width:13cqw;'
      +'height:17cqw;overflow:hidden;opacity:'+o.toFixed(3)+'">'
      +'<div style="position:absolute;inset:0;'+bg(k,"m-"+k)+'"></div></div>';
   }).join("");
   var head = outP<.5
     ? '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:56cqw">'+mreveal(mdisp(D,"Sex bilder in.",10.4),1-outP*2)+'</div>'
     : '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:31cqw">'+mreveal(mdisp(D,"Färdig.",10.4),(outP-.5)*2)+'</div>';
   var words = "Ljuset som gör skillnad".split(" ");
   var body = setP>0 ? '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:60cqw">'
      +'<div style="display:flex;flex-wrap:wrap;gap:0 2.4cqw">'
      + words.map(function(w,j){ return mreveal(mdisp(D,w,9.2), seg(setP, j*.2, j*.2+.3)) }).join("")
      +'</div><div style="height:3cqw"></div>'
      + mbody(D,"Fyra rum med genomgående planlösning och eftermiddagssol rakt in i vardagsrummet.", eOut(leadP))
      +'</div>' : '';
   return mshell(D, mkick(D,"Annonsskrivaren") + head + strip + body + mfoot(D));
 },
 system:function(D, t){
   var T=mtone(D), sig=["Ljusinsläpp","Takhöjd och volym","Material och ytskikt","Planlösning","Utsikt och läge","Områdets karaktär"];
   var lp = seg(t,.16,.80);
   var rows = sig.map(function(x,j){
     var on = lp > (j+1)/6 - .04;
     return '<div style="display:flex;align-items:center;gap:2.4cqw;padding:1.9cqw 0">'
      +'<span style="width:1.6cqw;height:1.6cqw;border-radius:50%;background:'+(on?T.oli:T.line)+';flex:0 0 auto"></span>'
      +'<span style="font-family:Montserrat,sans-serif;font-size:2.5cqw;color:'+(on?T.ink:T.mut)+'">'+esc(x)+'</span></div>';
   }).join("");
   var n = Math.min(6, Math.floor(lp*6.2));
   var status = t<.16 ? "Väntar på underlag" : lp>=1 ? "Utkast klart" : "Läser "+n+" av 6";
   return mshell(D, mkick(D,"Så läses bilderna")
     + mrule(D,30.5,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:36cqw">'+mdisp(D,"Sex signaler",8.4)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:52cqw">'+rows+'</div>'
     + mrule(D,108,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:113cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.3cqw;letter-spacing:.16em;text-transform:uppercase;color:'+T.mut+'">'+esc(status)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:120cqw">'
     + mreveal(mdisp(D,"Ljuset som gör skillnad",6.4), seg(t,.84,1)) +'</div>'
     + mfoot(D));
 },
 object:function(D, t){
   var T=mtone(D);
   var buildP = seg(t,.16,.50), cropP = eInOut(seg(t,.50,.72)), headP = seg(t,.72,.90);
   var imgH = lerp(88, 52, cropP), txtY = lerp(96, 60, cropP);
   var lines=[97,100,88,64];
   return mshell(D,
     mimg("kitchen", 0, 0, 100, imgH)
     + mkick(D,"Annonsskrivaren")
     +'<div style="position:absolute;left:0;right:0;bottom:0;top:'+imgH.toFixed(2)+'cqw;background:'+T.paper+'"></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+txtY.toFixed(2)+'cqw">'
     + mswap(D, "Utkast", "Ljuset som gör skillnad", headP, 8.2)
     +'<div style="height:2.6cqw"></div>'
     + lines.map(function(w,j){
        var p = eOut(seg(buildP, j*.18, j*.18+.4));
        return '<div style="height:1.5cqw;width:'+(w*p).toFixed(1)+'%;background:'+T.line+';margin-bottom:1.6cqw"></div>';
       }).join("")
     +'</div>' + mfoot(D));
 }
};

/* ---------- 02 MOTION ---------- */
MK.motion = {
 editorial:function(D, t){
   var z = lerp(1, 1.13, t), fy = lerp(.5, .42, t);
   var lab = t<.25 ? ["Stillbilden.", null, 0] : t<.75 ? ["Rörelsen.", null, seg(t,.22,.30)] : ["Filmen.", null, seg(t,.72,.80)];
   return mshell(D,
     '<div style="position:absolute;left:0;right:0;top:26cqw;height:96cqw;overflow:hidden">'
     +'<div style="position:absolute;inset:0;background-image:url('+(mediaURL("dining")||"")+');background-size:'
     +(z*100).toFixed(2)+'% auto;background-position:50% '+(fy*100).toFixed(1)+'%"></div></div>'
     + mkick(D,"Motion")
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:132cqw">'
     + mreveal(mdisp(D, lab[0], 10.6), lab[2]===0?1:lab[2]) +'</div>'
     + mfoot(D));
 },
 system:function(D, t){
   var T=mtone(D), steps=["Bilderna","Rörelsen","Redigeringen","Filmen"];
   var p = eInOut(seg(t,.10,.86));
   return mshell(D, mkick(D,"Så byggs filmen")
     + mimg("dining", 6.4, 30, 87.2, 49)
     +'<div style="position:absolute;left:'+(6.4+(87.2-40)*p).toFixed(2)+'cqw;top:34cqw;width:40cqw;height:41cqw;'
     +'border:1px solid '+T.oli+'"></div>'
     + mrule(D,88,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:94cqw;display:flex;justify-content:space-between">'
     + steps.map(function(x,j){ var on = p >= j/3 - .02;
        return '<span style="font-family:Montserrat,sans-serif;font-size:2.2cqw;letter-spacing:.14em;'
         +'text-transform:uppercase;color:'+(on?T.ink:T.mut)+'">'+esc(x)+'</span>' }).join("")
     +'</div>'
     +'<div style="position:absolute;left:6.4cqw;top:101cqw;width:'+(8+72*p).toFixed(1)+'cqw;height:2px;background:'+T.oli+'"></div>'
     + mrule(D,103,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:112cqw">'
     + mreveal(mdisp(D,"En film, tre format",7.2), seg(t,.86,1)) +'</div>'
     + mfoot(D));
 },
 object:function(D, t){
   var a = seg(t,.24,.34), b = seg(t,.44,.54), c = seg(t,.74,.84);
   var k = c>.5 ? "dining2" : b>.5 ? "dining" : "living";
   var btnP = eOut(seg(t,.18,.30)), btnFade = 1 - .82*seg(t,.42,.52);
   var head = c>.5 ? ["Filmen är klar.", seg(t,.76,.86)]
            : b>.5 ? ["Rörelsen läggs på.", seg(t,.46,.56)]
                   : ["Bilderna finns redan.", 1];
   return mshell(D,
     mimg(k, 0, 0, 100, 177.8)
     +'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,14,13,.34),rgba(14,14,13,0) 34%,rgba(14,14,13,.62))"></div>'
     +'<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.25cqw;letter-spacing:.24em;text-transform:uppercase;color:#98A088">Motion</div>'
     + (btnP>0 ? '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale('
        +lerp(.88,1,btnP).toFixed(3)+');width:15cqw;height:15cqw;border-radius:50%;background:rgba(239,237,231,'
        +(.92*btnFade).toFixed(3)+');display:grid;place-items:center">'
        +'<span style="width:0;height:0;border-left:5cqw solid rgba(28,28,30,'+btnFade.toFixed(2)
        +');border-top:3.2cqw solid transparent;border-bottom:3.2cqw solid transparent;margin-left:1.4cqw"></span></div>' : '')
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+8)+'cqw;color:#EFEDE7">'
     +'<div style="clip-path:inset(0 '+((1-mclamp(head[1]))*100).toFixed(1)+'% 0 0);'
     +'font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9cqw;line-height:1">'
     + esc(head[0]) +'</div></div>'
     + mfoot(D));
 }
};

/* ---------- 03 E-STYLING ---------- */
function mwipe(a, b, pct, edge){
  return '<div style="position:absolute;inset:0;'+bg(a,"m-w1")+'"></div>'
   +'<div style="position:absolute;inset:0;clip-path:inset(0 '+(100-pct).toFixed(2)+'% 0 0)">'
   +'<div style="position:absolute;inset:0;'+bg(b,"m-w2")+'"></div></div>'
   + (edge && pct>0.5 && pct<99.5
      ? '<div style="position:absolute;top:0;bottom:0;left:'+pct.toFixed(2)+'%;width:1px;background:'+edge+'"></div>' : '');
}
MK.estyl = {
 editorial:function(D, t){
   var pct = eInOut(seg(t,.20,.78))*100, hp = seg(t,.80,.92);
   return mshell(D, mkick(D,"E-styling")
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:34cqw;height:76cqw;overflow:hidden">'
     + mwipe("esLivBef","esLivAft", pct, "#EFEDE7") +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:120cqw">'
     + mswap(D, "Tomt.", "Möblerat.", hp, 10.8) +'</div>'
     + mfoot(D));
 },
 system:function(D, t){
   var T=mtone(D), p = eInOut(seg(t,.16,.80)), pct = p*100, n = Math.round(pct);
   return mshell(D, mkick(D,"Före och efter")
     + mrule(D,30.5,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:38cqw;height:70cqw;overflow:hidden;'
     +'border:1px solid '+T.line+'">'+ mwipe("esLivBef","esLivAft", pct, T.oli) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:112cqw;display:flex;justify-content:space-between;'
     +'font-family:Montserrat,sans-serif;font-size:2.2cqw;letter-spacing:.16em;text-transform:uppercase">'
     +'<span style="color:'+(pct<50?T.ink:T.mut)+'">Original</span>'
     +'<span style="color:'+T.oli+';font-variant-numeric:tabular-nums">'+n+' %</span>'
     +'<span style="color:'+(pct>=50?T.ink:T.mut)+'">E-stylat</span></div>'
     + mrule(D,120,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:127cqw">'
     + mbody(D,"Inga väggar flyttas. Möbleringen läggs till digitalt.", eOut(seg(t,.84,1))) +'</div>'
     + mfoot(D));
 },
 object:function(D, t){
   var pct = eInOut(seg(t,.22,.80))*100, hp = seg(t,.82,.94);
   return mshell(D,
     '<div style="position:absolute;inset:0;overflow:hidden">'+ mwipe("esLivBef","esLivAft", pct, null) +'</div>'
     +'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,14,13,.30),rgba(14,14,13,0) 30%,rgba(14,14,13,.55))"></div>'
     +'<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.25cqw;letter-spacing:.24em;text-transform:uppercase;color:#98A088">E-styling</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+6)+'cqw;color:#EFEDE7;'
     +'clip-path:inset(0 '+((1-(hp<.5?1-hp*2:(hp-.5)*2))*100).toFixed(1)+'% 0 0);'
     +'font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9.4cqw;line-height:1">'
     + esc(hp<.5 ? "Samma rum." : "Ny känsla.") +'</div>'
     + mfoot(D));
 }
};

/* ---------- 04 KAMPANJFASERNA ---------- */
var MPH = {names:["Kommande","Till salu","Visning","Såld"], ims:["hero","kitchen","living","drone"]};
function mphase(t){ return Math.min(3, Math.floor(seg(t,.04,.94)*4)) }
MK.kampanj = {
 editorial:function(D, t){
   var T=mtone(D), i = mphase(t);
   var local = seg(t,.04,.94)*4 - i;                       /* 0–1 inom fasen */
   return mshell(D, mkick(D,"Kampanjen")
     + mimg(MPH.ims[i], 6.4, 32, 87.2, 62)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:104cqw">'
     + mreveal(mdisp(D, MPH.names[i], 11.2), Math.min(1, local*4))
     +'<div style="height:3cqw"></div>'
     + mbody(D,"Silvergården 9A · Landskrona") +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:140cqw;display:flex;gap:1.4cqw">'
     + MPH.names.map(function(x,j){ return '<span style="flex:1;height:2px;background:'
        +(j<=i?T.oli:T.line)+'"></span>' }).join("") +'</div>'
     + mfoot(D));
 },
 system:function(D, t){
   var T=mtone(D), now = mphase(t);
   var cards = MPH.names.map(function(x,j){
     var on = j<=now, cur = j===now;
     return '<div style="flex:1;display:flex;flex-direction:column;gap:1.6cqw;opacity:'+(on?1:.32)+'">'
      +'<div style="position:relative;aspect-ratio:9/16;overflow:hidden;border:1px solid '+(cur?T.oli:T.line)+'">'
      +'<div style="position:absolute;inset:0;'+bg(MPH.ims[j],"m-p"+j)+'"></div>'
      +(cur?'':'<div style="position:absolute;inset:0;background:'+T.paper+';opacity:.55"></div>')+'</div>'
      +'<span style="font-family:Montserrat,sans-serif;font-size:1.9cqw;letter-spacing:.14em;text-transform:uppercase;'
      +'color:'+(cur?T.oli:T.mut)+'">'+esc(x)+'</span></div>';
   }).join("");
   return mshell(D, mkick(D,"Kampanjfaser")
     + mrule(D,30.5,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:38cqw">'+mdisp(D,"En kampanj, fyra lägen",7.6)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:62cqw;display:flex;gap:2.6cqw">'+cards+'</div>'
     + mrule(D,120,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:126cqw">'
     + mbody(D,"Adressen och faktaraden står still. Bara mallen byts.", eOut(seg(t,.86,1))) +'</div>'
     + mfoot(D));
 },
 object:function(D, t){
   var now = mphase(t), local = seg(t,.04,.94)*4 - now;
   return mshell(D,
     mimg(MPH.ims[now], 0, 0, 100, 177.8)
     +'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,14,13,.30),rgba(14,14,13,0) 32%,rgba(14,14,13,.70))"></div>'
     +'<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;clip-path:inset(0 '
     +((1-Math.min(1,local*5))*100).toFixed(1)+'% 0 0);font-family:Montserrat,sans-serif;'
     +'font-size:2.25cqw;letter-spacing:.3em;text-transform:uppercase;color:#98A088">'+esc(MPH.names[now])+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+14)+'cqw;color:#EFEDE7">'
     +'<div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9.6cqw;line-height:1">Silvergården 9A</div>'
     +'<div style="height:2.4cqw"></div>'
     +'<div style="font-family:Montserrat,sans-serif;font-size:2.3cqw;letter-spacing:.18em;text-transform:uppercase;'
     +'color:#98A088">4 rum · 112 m² · 1968</div></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+SAFE.bot+'cqw;display:flex;gap:1.2cqw">'
     + MPH.names.map(function(x,j){ return '<span style="flex:1;height:2px;background:'
        +(j<=now?"#98A088":"rgba(239,237,231,.28)")+'"></span>' }).join("")+'</div>');
 }
};

/* ---------- 05 ETT OBJEKT, TRE FORMAT ---------- */
MK.format = {
 editorial:function(D, t){
   var T=mtone(D);
   var p1 = eInOut(seg(t,.18,.42)), p2 = eInOut(seg(t,.50,.74));
   var w = lerp(lerp(87.2, 52, p1), 40, p2), h = lerp(lerp(49, 65, p1), 71, p2);
   var lab = p2>.5 ? "9:16" : p1>.5 ? "1:1" : "4:5";
   return mshell(D, mkick(D,"Formaten")
     +'<div style="position:absolute;left:50%;top:34cqw;transform:translateX(-50%);width:'+w.toFixed(2)
     +'cqw;height:'+h.toFixed(2)+'cqw;overflow:hidden">'
     +'<div style="position:absolute;inset:0;'+bg("living","m-f")+'"></div></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:118cqw">'
     + mswap(D, p1<.5?"Ett objekt.":"Tre ytor.", "Samma bild.", seg(t,.74,.90), 10.6) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;top:146cqw;font-family:Montserrat,sans-serif;font-size:2.1cqw;'
     +'letter-spacing:.2em;text-transform:uppercase;color:'+T.mut+'">'+lab+'</div>'
     + mfoot(D));
 },
 system:function(D, t){
   var T=mtone(D), fmts=[["9:16",9,16],["4:5",4,5],["1:1",1,1]];
   var cards = fmts.map(function(f,j){
     var p = eOut(seg(t, .10+j*.22, .10+j*.22+.26));
     if(p<=0) return '';
     return '<div style="display:flex;flex-direction:column;gap:1.6cqw;opacity:'+p.toFixed(3)
      +';transform:translateY('+lerp(6,0,p).toFixed(2)+'cqw)">'
      +'<div style="position:relative;width:24cqw;aspect-ratio:'+f[1]+'/'+f[2]+';overflow:hidden;border:1px solid '+T.line+'">'
      +'<div style="position:absolute;inset:0;'+bg("living","m-f2")+'"></div></div>'
      +'<span style="font-family:Montserrat,sans-serif;font-size:1.9cqw;letter-spacing:.16em;color:'+T.mut+'">'+f[0]+'</span></div>';
   }).join("");
   return mshell(D, mkick(D,"Ett objekt, alla format")
     + mrule(D,30.5,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:38cqw">'+mdisp(D,"Samma mall exporterar samtliga",7)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:66cqw;display:flex;gap:3cqw;align-items:flex-end">'+cards+'</div>'
     + mrule(D,126,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:132cqw">'
     + mbody(D,"1080 × 1920 · 1080 × 1350 · 1080 × 1080", eOut(seg(t,.78,.96))) +'</div>'
     + mfoot(D));
 },
 object:function(D, t){
   var p1 = eInOut(seg(t,.18,.42)), p2 = eInOut(seg(t,.50,.74)), fade = 1-seg(t,.80,.94);
   var ix = lerp(0, 14, p2), iy = lerp(lerp(0,14,p1), 14, p2);
   var lab = p2>.5 ? "1:1 Kvadrat" : p1>.5 ? "4:5 Inlägg" : "9:16 Story";
   return mshell(D,
     '<div style="position:absolute;inset:0;'+bg("living","m-f3")+'"></div>'
     +'<div style="position:absolute;left:'+ix.toFixed(2)+'cqw;right:'+ix.toFixed(2)+'cqw;top:'+iy.toFixed(2)
     +'cqw;bottom:'+iy.toFixed(2)+'cqw;border:1px solid rgba(239,237,231,'+(.85*fade).toFixed(2)+')"></div>'
     +'<div style="position:absolute;inset:0;background:rgba(14,14,13,.26)"></div>'
     +'<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.25cqw;letter-spacing:.24em;text-transform:uppercase;color:#98A088">'+esc(lab)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+4)+'cqw;color:#EFEDE7;'
     +'font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9cqw;line-height:1">Ett objekt</div>'
     + mfoot(D));
 }
};

/* ---------- 06 WHITE LABEL ---------- */
var MWB = [["","#00000000"],["Nordvik","#1F3A2E"],["Alvhem","#7A3B2E"]];
function mbrand(t){ return t<.24 ? 0 : t<.58 ? 1 : 2 }
MK.white = {
 editorial:function(D, t){
   var T=mtone(D), bi = mbrand(t), b = MWB[bi];
   var on = bi>0;
   return mshell(D, mkick(D,"White label")
     +'<div style="position:absolute;left:12cqw;right:12cqw;top:32cqw;bottom:52cqw;background:'+T.plate
     +';border:1px solid '+T.line+';overflow:hidden">'
     +'<div style="height:9cqw;display:flex;align-items:center;gap:2cqw;padding:0 3cqw;border-bottom:1px solid '+T.line+'">'
     + (on ? '<span style="width:3.4cqw;height:3.4cqw;background:'+b[1]+'"></span>'
        +'<span style="font-family:Montserrat,sans-serif;font-size:2cqw;font-weight:700;letter-spacing:.16em;'
        +'text-transform:uppercase;color:'+T.ink+'">'+esc(b[0])+'</span>'
        : '<span style="width:22cqw;height:2.4cqw;background:'+T.line+'"></span>')
     +'</div>'
     +'<div style="position:relative;height:34cqw;overflow:hidden"><div style="position:absolute;inset:0;'
     + bg("matterport","m-w")+'"></div></div>'
     +'<div style="padding:3cqw">'
     +'<div style="height:1.6cqw;width:70%;background:'+(on?b[1]:T.line)+';margin-bottom:2cqw"></div>'
     +'<div style="height:1.3cqw;width:92%;background:'+T.line+';margin-bottom:1.4cqw"></div>'
     +'<div style="height:1.3cqw;width:58%;background:'+T.line+'"></div>'
     +'<div style="margin-top:3cqw;display:inline-block;padding:1.4cqw 3cqw;background:'+(on?b[1]:T.line)+';'
     +'font-family:Montserrat,sans-serif;font-size:1.9cqw;letter-spacing:.14em;text-transform:uppercase;color:#fff">'
     +(on?"Se bostaden":"&nbsp;")+'</div></div></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+9)+'cqw">'
     + mdisp(D, bi===0?"Er logga.":bi===1?"Era färger.":"Varje objekt.", 9.4) +'</div>'
     + mfoot(D));
 },
 system:function(D, t){
   var T=mtone(D), bi = mbrand(t), cols=[["#1F3A2E","Nordvik"],["#7A3B2E","Alvhem"]];
   var sw = cols.map(function(c,j){
     var on = bi === j+1;
     return '<span style="width:5cqw;height:5cqw;background:'+c[0]+';outline:'+(on?"2px solid "+T.oli:"none")
      +';outline-offset:1.4cqw;display:block"></span>';
   }).join("");
   return mshell(D, mkick(D,"Ett uttryck, satt en gång")
     + mrule(D,30.5,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:38cqw">'+mdisp(D,"Kontoret sätter, systemet upprepar",6.8)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;top:66cqw;display:flex;gap:9cqw">'+sw+'</div>'
     + mrule(D,80,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:88cqw;display:grid;grid-template-columns:1fr 1fr;gap:3cqw">'
     + [0,1].map(function(j){
        var active = bi === j+1;
        return '<div style="border:1px solid '+(active?T.oli:T.line)+';padding:2.4cqw;opacity:'+(bi===0?.4:1)+'">'
         +'<div style="height:2cqw;width:60%;background:'+cols[j][0]+';margin-bottom:2cqw"></div>'
         +'<div style="height:1.2cqw;width:100%;background:'+T.line+';margin-bottom:1.2cqw"></div>'
         +'<div style="height:1.2cqw;width:74%;background:'+T.line+'"></div></div>';
       }).join("")+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:126cqw">'
     + mbody(D,"Innehållet är identiskt. Bara uttrycket byts.", eOut(seg(t,.80,.96))) +'</div>'
     + mfoot(D));
 },
 object:function(D, t){
   var T=mtone(D), bi = mbrand(t);
   var c = ["#6E7266","#1F3A2E","#7A3B2E"][bi], nm = ["Viewly","Nordvik","Alvhem"][bi];
   return mshell(D,
     mimg("matterport", 0, 0, 100, 106)
     +'<div style="position:absolute;left:0;right:0;top:0;height:14cqw;background:'+c+';display:flex;'
     +'align-items:center;padding:0 6.4cqw;font-family:Montserrat,sans-serif;font-size:2.4cqw;font-weight:700;'
     +'letter-spacing:.2em;text-transform:uppercase;color:#fff">'+esc(nm)+'</div>'
     +'<div style="position:absolute;left:0;right:0;top:106cqw;bottom:0;background:'+T.paper+'"></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:116cqw">'
     + mdisp(D,"Samma visningssida",8.6)
     +'<div style="height:2.6cqw"></div>'
     + mbody(D,"Levereras i kontorets varumärke, aldrig i vårt.", eOut(seg(t,.72,.92))) +'</div>'
     + mfoot(D));
 }
};

/* ---------- 07 3D — PLAN TILL VOLYM ---------- */
function mplan(c, a, lift){
  var y = function(v){ return 50 + (v-50)*(1-lift*.34) - lift*8 };
  var top = 26*lift;
  return '<svg viewBox="0 0 100 100" style="width:100%;height:100%;display:block">'
   +'<path d="M20 '+y(74)+' L50 '+y(88)+' L80 '+y(74)+' L50 '+y(60)+' Z" fill="none" stroke="'+c+'" stroke-width="1.4"/>'
   + (lift>.001 ? '<path d="M20 '+y(74)+' V'+(y(74)-top)+' L50 '+(y(88)-top)+' V'+y(88)+'" fill="none" stroke="'+c+'" stroke-width="1.4" opacity=".8"/>'
     +'<path d="M80 '+y(74)+' V'+(y(74)-top)+' L50 '+(y(88)-top)+' V'+y(88)+'" fill="none" stroke="'+c+'" stroke-width="1.4" opacity=".8"/>'
     +'<path d="M20 '+(y(74)-top)+' L50 '+(y(60)-top)+' L80 '+(y(74)-top)+' L50 '+(y(88)-top)+' Z" fill="'+c
     +'" opacity="'+(.07*lift).toFixed(3)+'" stroke="'+c+'" stroke-width="1.4"/>' : '')
   +'<circle cx="50" cy="'+(y(74)-13*lift)+'" r="3.2" fill="'+a+'"/></svg>';
}
MK.tredim = {
 editorial:function(D, t){
   var T=mtone(D), lift = eInOut(seg(t,.22,.68));
   return mshell(D, mkick(D,"3D visning")
     +'<div style="position:absolute;left:14cqw;right:14cqw;top:38cqw;height:72cqw">'+ mplan(T.ink, T.oli, lift) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:122cqw">'
     + mswap(D, "Planritningen.", "Bostaden.", seg(t,.70,.86), 10.4) +'</div>'
     + mfoot(D));
 },
 system:function(D, t){
   var T=mtone(D), lift = eInOut(seg(t,.20,.72)), labs=["Planritning","Volym","Dollhouse"];
   return mshell(D, mkick(D,"Från plan till rum")
     + mrule(D,30.5,6.4,6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:38cqw">'+mdisp(D,"Samma bostad, två sätt att läsa den",6.6)+'</div>'
     +'<div style="position:absolute;left:10cqw;right:10cqw;top:64cqw;height:62cqw;border:1px solid '+T.line+'">'
     + mplan(T.ink, T.oli, lift) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:132cqw;display:flex;justify-content:space-between">'
     + labs.map(function(x,j){ var on = lift >= j*.45 - .02;
        return '<span style="font-family:Montserrat,sans-serif;font-size:2.2cqw;letter-spacing:.14em;'
         +'text-transform:uppercase;color:'+(on?T.ink:T.mut)+'">'+esc(x)+'</span>' }).join("")
     +'</div>' + mrule(D,140,6.4,6.4) + mfoot(D));
 },
 object:function(D, t){
   var geo = seg(t,.20,.44), lift = eInOut(seg(t,.30,.72));
   var k = t>.72 ? "matterport" : t>.46 ? "threedcam" : "threed";
   var head = t>.72 ? ["Gå igenom det.", seg(t,.74,.86)] : t>.46 ? ["Mätt och skannat.", seg(t,.48,.60)] : ["Ett rum.", 1];
   return mshell(D,
     mimg(k, 0, 0, 100, 177.8)
     +'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,14,13,.32),rgba(14,14,13,0) 34%,rgba(14,14,13,.66))"></div>'
     +'<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.25cqw;letter-spacing:.24em;text-transform:uppercase;color:#98A088">3D visning</div>'
     + (geo>0 ? '<div style="position:absolute;left:16cqw;right:16cqw;top:56cqw;height:52cqw;opacity:'
        +(geo * (1-.72*seg(t,.62,.78))).toFixed(3)+'">'+ mplan("#EFEDE7","#98A088", lift) +'</div>' : '')
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+6)+'cqw;color:#EFEDE7;'
     +'clip-path:inset(0 '+((1-mclamp(head[1]))*100).toFixed(1)+'% 0 0);'
     +'font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9.2cqw;line-height:1">'
     + esc(head[0]) +'</div>'
     + mfoot(D));
 }
};

/* ---------------------------------------------------------------------
   KOPPLINGEN TILL BIBLIOTEKET
   Motion är ett ALTERNATIV, aldrig ett utbyte. MPICK är tomt som default
   och då renderas bildrutan precis som förut. Sätts den renderas
   tidsfunktionen i stället — originalet ligger orört kvar under.
   --------------------------------------------------------------------- */
var MSID = {
  "annonsen-2":"annons", "motion-2":"motion", "estyling-2":"estyl",
  "kampanjen-3":"kampanj", "kampanjen-2":"format", "visning-3":"white", "visning-2":"tredim"
};
var MPICK = {};            /* sid -> "editorial" | "system" | "object" */
var MOTION_T = 0;          /* nuvarande position 0–1, satt av spelaren/exporten */
var MDUR = {annons:6.8, motion:6.4, estyl:6.2, kampanj:6.6, format:6.2, white:6.4, tredim:6.4};

function motionOf(sid){
  var c = MSID[sid], d = MPICK[sid];
  return (c && d && MK[c] && MK[c][d]) ? {cand:c, dir:d, dur:MDUR[c]||6} : null;
}
function motionFrame(dirId, sid, t){
  var m = motionOf(sid); if(!m) return null;
  return MK[m.cand][m.dir](dirId, mclamp(t));
}
