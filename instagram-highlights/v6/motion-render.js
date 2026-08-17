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

/* ---------- 01 ANNONSSKRIVAREN ----------
   Omritad efter hur verktyget faktiskt fungerar enligt viewly.se. Den
   förra versionen visade bara "bilder in, text ut" och hoppade över
   steg 1 helt — det är där mäklaren gör sitt arbete.

   Det riktiga förloppet har TRE ingångar, inte en:
     1  bostadens uppgifter — adress, ort, stadsdel, rum, boarea, typ
        (omkring 30 sekunder att fylla i)
     2  upp till sex bilder, ur vilka verktyget läser ljusinsläpp,
        takhöjd, material och planlösning
     3  områdets karaktär
   och resultatet är en RUBRIK plus tre till fyra stycken redigerbar text,
   med två omskrivningar inkluderade i en credit.

   Balansen är också omgjord: förra versionen lämnade halva ytan tom och
   la allt i underkant. Nu delas höjden i tre band som byter innehåll —
   uppgifter, avläsning, färdig text — så att ingen del av plåten står
   oanvänd. */
var ANF = [["Adress","Silvergården 9A"],["Ort","Landskrona · Kv. Sanden"],
           ["Storlek","4 rum · 112 m²"],["Typ","Bostadsrätt"]];
var ANIM6 = ["hero","kitchen","living","dining","boucle","eames"];
var ANSIG = ["Ljusinsläpp","Takhöjd","Material","Planlösning"];
var ANP = ["Fyra rum med genomgående planlösning och eftermiddagssol rakt in i vardagsrummet.",
           "Ekparkett, kalkputsade väggar och 3,1 meter i takhöjd ger en ovanlig rymd för storleken.",
           "Kvarteret Sanden ligger ett kvarter från hamnen, med skola och pendeltåg inom gångavstånd."];
var ANTONE = ["Saklig","Varm","Exklusiv"];

/* liten hjälpare: en textrad som skrivs fram med mask */
function anrow(T, lab, val, p, y){
  return '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+y+'cqw;display:flex;'
   +'align-items:baseline;gap:3cqw;border-bottom:1px solid '+T.line+';padding-bottom:1.6cqw">'
   +'<span style="flex:0 0 22cqw;font-family:Montserrat,sans-serif;font-size:1.95cqw;letter-spacing:.18em;'
   +'text-transform:uppercase;color:'+T.mut+'">'+esc(lab)+'</span>'
   +'<span style="flex:1;clip-path:inset(0 '+((1-mclamp(p))*100).toFixed(1)+'% 0 0);'
   +'font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:4.6cqw;color:'+T.ink+'">'
   + esc(val) +'</span></div>';
}
function anpara(T, txt, p, size){
  return '<div style="clip-path:inset(0 0 '+((1-mclamp(p))*100).toFixed(1)+'% 0);'
   +'font-family:Montserrat,sans-serif;font-weight:400;font-size:'+(size||2.55)+'cqw;line-height:1.66;'
   +'color:'+(T.dark?"#A8A6A0":"#4A4744")+'">'+esc(txt)+'</div>';
}

/* Spökrad: layouten ska vara KOMPLETT vid t=0 och bara fyllas. Förra
   versionen lämnade två tredjedelar av plåten tom i början och i slutet —
   det var obalansen. Nu står rutnätet där från första bildrutan. */
function anghost(T, w, y){
  return '<div style="height:1.4cqw;width:'+w+'%;background:'+T.line+';opacity:.55;margin-bottom:2.1cqw"></div>';
}

MK.annons = {
 /* EDITORIAL — uppslaget sätts. Tre band som ligger still: uppgifterna,
    de sex bildplatserna och textytan. Ingenting flyttar sig; allt fylls. */
 editorial:function(D, t){
   var T = mtone(D);
   var fP = seg(t,.04,.30), iP = seg(t,.28,.52), hP = seg(t,.52,.68), pP = seg(t,.64,.94);

   var rows = ANF.map(function(f,j){
     return anrow(T, f[0], f[1], seg(fP, j*.2, j*.2+.34), 34 + j*9.4);
   }).join("");

   /* sex platser, tomma från början — "upp till sex bilder" */
   var slots = ANIM6.map(function(k,j){
     var p = eOut(mclamp((iP - j*.085)/.52));
     return '<div style="position:absolute;left:'+(6.4+j*14.6).toFixed(2)+'cqw;top:78cqw;width:12.8cqw;'
      +'height:16cqw;overflow:hidden;border:1px solid '+T.line+'">'
      + (p>0 ? '<div style="position:absolute;inset:0;'+bg(k,"m-"+k)+';opacity:'+p.toFixed(3)+'"></div>' : '')
      +'</div>';
   }).join("");

   var words = "Ljuset som gör skillnad".split(" ");
   var head = '<div style="display:flex;flex-wrap:wrap;gap:0 2.2cqw;min-height:10cqw">'
     + words.map(function(w,j){ return mreveal(mdisp(D,w,7.4), seg(hP, j*.17, j*.17+.34)) }).join("")
     +'</div>';
   var paras = ANP.map(function(x,j){
     var p = seg(pP, j*.24, j*.24+.5);
     return p<=0 ? anghost(T,[100,96,88][j], 0) : '<div style="margin-bottom:1.8cqw">'+anpara(T,x,p,2.4)+'</div>';
   }).join("");

   return mshell(D, mkick(D,"Annonsskrivaren")
     + mrule(D,30,6.4,6.4,.7)
     + rows + slots
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:72cqw;font-family:Montserrat,sans-serif;'
     +'font-size:1.8cqw;letter-spacing:.2em;text-transform:uppercase;color:'+T.mut+'">Upp till sex bilder</div>'
     + mrule(D,99,6.4,6.4,.7)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:104cqw">'+ head
     +'<div style="height:2.4cqw"></div>'+ paras +'</div>'
     + mfoot(D));
 },

 /* SYSTEM — hela mekaniken som diagram. Tre band, jämnt fördelade över
    höjden, alla synliga från första bildrutan. In, avläsning, ut. */
 system:function(D, t){
   var T = mtone(D);
   var inP = seg(t,.03,.32), sigP = seg(t,.32,.62), outP = seg(t,.60,.92);
   var ins = [["Bostadens uppgifter","Adress, ort, rum, boarea, typ","30 s"],
              ["Sex bilder","Laddas upp av mäklaren","6"],
              ["Områdets karaktär","Läge, service, kvarter","auto"]];
   var inRows = ins.map(function(x,j){
     var p = eOut(seg(inP, j*.26, j*.26+.5));
     return '<div style="display:flex;align-items:center;gap:2.6cqw;padding:2.2cqw 0;border-bottom:1px solid '+T.line+'">'
      +'<span style="width:1.8cqw;height:1.8cqw;border-radius:50%;flex:0 0 auto;background:'+(p>.6?T.oli:T.line)+'"></span>'
      +'<span style="flex:1"><b style="display:block;font-family:Montserrat,sans-serif;font-size:2.4cqw;'
      +'font-weight:600;color:'+(p>.4?T.ink:T.mut)+'">'+esc(x[0])+'</b>'
      +'<span style="display:block;font-family:Montserrat,sans-serif;font-size:1.9cqw;color:'+T.mut+'">'
      + esc(x[1])+'</span></span>'
      +'<span style="font-family:Montserrat,sans-serif;font-size:1.9cqw;letter-spacing:.14em;color:'
      +(p>.6?T.oli:T.line)+'">'+esc(x[2])+'</span></div>';
   }).join("");

   var sigs = ANSIG.map(function(x,j){
     var p = seg(sigP, j*.19, j*.19+.34);
     return '<div style="flex:1"><div style="height:3px;background:'+(p>.5?T.oli:T.line)+';margin-bottom:1.8cqw"></div>'
      +'<span style="font-family:Montserrat,sans-serif;font-size:1.8cqw;letter-spacing:.08em;'
      +'text-transform:uppercase;color:'+(p>.5?T.ink:T.mut)+'">'+esc(x)+'</span></div>';
   }).join("");

   var lines = [[100,0],[94,1],[100,2],[72,3],[86,4]].map(function(l){
     var p = eOut(seg(outP, .22 + l[1]*.12, .22 + l[1]*.12 + .3));
     return '<div style="height:1.5cqw;width:'+l[0]+'%;background:'+T.line+';opacity:.5;margin-bottom:1.7cqw;'
      +'position:relative"><i style="position:absolute;left:0;top:0;bottom:0;width:'+(p*100).toFixed(1)
      +'%;background:'+(T.dark?"#6E7266":"#B6B0A8")+'"></i></div>';
   }).join("");

   return mshell(D, mkick(D,"Så fungerar den")
     + mrule(D,30,6.4,6.4,.7)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:34cqw">'
     +'<div style="font-family:Montserrat,sans-serif;font-size:1.85cqw;letter-spacing:.22em;'
     +'text-transform:uppercase;color:'+T.mut+';margin-bottom:1.2cqw">In · tre källor</div>'+inRows+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:86cqw">'
     +'<div style="font-family:Montserrat,sans-serif;font-size:1.85cqw;letter-spacing:.22em;'
     +'text-transform:uppercase;color:'+T.mut+';margin-bottom:2.6cqw">Läses ur bilderna</div>'
     +'<div style="display:flex;gap:2.2cqw">'+sigs+'</div></div>'
     + mrule(D,106,6.4,6.4,.7)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:110cqw">'
     +'<div style="font-family:Montserrat,sans-serif;font-size:1.85cqw;letter-spacing:.22em;'
     +'text-transform:uppercase;color:'+T.mut+';margin-bottom:1.8cqw">Ut · rubrik och tre stycken</div>'
     + mreveal(mdisp(D,"Ljuset som gör skillnad", 6.2), seg(outP,0,.26))
     +'<div style="height:2.4cqw"></div>'+ lines +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+6)+'cqw;'
     +'font-family:Montserrat,sans-serif;font-size:1.9cqw;letter-spacing:.16em;text-transform:uppercase;'
     +'color:'+T.oli+';opacity:'+eOut(seg(t,.90,1)).toFixed(2)+'">1 credit · två omskrivningar ingår</div>'
     + mfoot(D));
 },

 /* OBJECT — annonsen på bostaden, och omskrivningen inför ögonen. Att
    tonen går att byta är den del av produkten som är lättast att missa. */
 object:function(D, t){
   var T = mtone(D);
   var factP = seg(t,.05,.18), headP = seg(t,.18,.34), pP = seg(t,.30,.58);
   var toneP = seg(t,.62,1);
   var tone = toneP<=0 ? 0 : toneP<.42 ? 0 : toneP<.74 ? 1 : 2;
   var local = toneP<.42 ? 1 : toneP<.74 ? seg(toneP,.42,.52) : seg(toneP,.74,.84);
   var heads = ["Ljuset som gör skillnad","Hemmet där eftermiddagen dröjer","Ett kvarter från hamnen"];
   var leads = [ANP[0],
                "Eftermiddagssolen når hela vägen in i vardagsrummet, och rummen hänger ihop utan en enda tröskel.",
                "Fyra rum i Kvarteret Sanden, med 3,1 meter i takhöjd och hamnen som närmaste granne."];
   var chips = ANTONE.map(function(x,j){
     var on = j===tone, vis = eOut(seg(t,.58,.68));
     return '<span style="padding:1.2cqw 2.8cqw;border:1px solid '+(on?T.oli:T.line)+';background:'
      +(on?T.oli:"transparent")+';font-family:Montserrat,sans-serif;font-size:1.9cqw;letter-spacing:.14em;'
      +'text-transform:uppercase;opacity:'+vis.toFixed(2)+';color:'
      +(on?(T.dark?"#0E0E0D":"#F2EFEF"):T.mut)+'">'+esc(x)+'</span>';
   }).join("");

   return mshell(D,
     mimg("kitchen", 0, 0, 100, 68)
     + mkick(D,"Annonsskrivaren")
     +'<div style="position:absolute;left:0;right:0;top:68cqw;bottom:0;background:'+T.paper+'"></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:76cqw;clip-path:inset(0 '
     +((1-mclamp(factP))*100).toFixed(1)+'% 0 0);font-family:Montserrat,sans-serif;font-size:2cqw;'
     +'letter-spacing:.18em;text-transform:uppercase;color:'+T.mut+'">'
     +'Silvergården 9A · 4 rum · 112 m² · Bostadsrätt</div>'
     + mrule(D,83,6.4,6.4,.7)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:90cqw">'
     +'<div style="min-height:19cqw">'
     + mreveal(mdisp(D, heads[tone], 8.4), toneP>0 ? local : headP) +'</div>'
     +'<div style="height:2.4cqw"></div>'
     + (pP>0 || toneP>0
        ? '<div style="margin-bottom:2.1cqw">'+anpara(T, leads[tone], toneP>0?local:pP, 2.55)+'</div>'
          +'<div style="margin-bottom:2.1cqw">'+anpara(T, ANP[2], toneP>0?1:seg(pP,.45,1), 2.55)+'</div>'
        : anghost(T,100,0)+anghost(T,92,0)+anghost(T,100,0)+anghost(T,68,0))
     +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+9)+'cqw;display:flex;gap:1.6cqw">'
     + chips +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+1.5)+'cqw;'
     +'font-family:Montserrat,sans-serif;font-size:1.85cqw;letter-spacing:.16em;text-transform:uppercase;'
     +'color:'+T.oli+';opacity:'+eOut(seg(t,.68,.80)).toFixed(2)+'">Två omskrivningar ingår</div>');
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

/* ---------- 04 KAMPANJFASERNA ----------
   Omritad. Den förra versionen visade fyra FOTOGRAFIER med en etikett
   ovanpå — alltså inte produkten. Kampanjen ÄR de fyra mallarna, och
   poängen är att samma underlag sätts fyra gånger på fyra sätt. Utan
   artboarden på plåten demonstreras ingenting.

   Nu renderas varje fas med produktionens egen post() — exakt samma
   funktion som bygger inläggen i vy 05, inklusive redigeringar gjorda
   där. Motionen visar därför de faktiska mallarna:

     Kommande   bilden dominerar, hårlinje och spärrad status
     Till salu  adress + faktarad med rum, yta och byggår
     Visning    en enda uppgift satt stort
     Såld       ordet tar över och bilden backar

   Artboarden ligger i en egen container (container-type: inline-size),
   så mallens cqw räknas mot kortets bredd och inte mot ramen. Ett kort
   på 76 cqw är alltså en korrekt nedskalad 1080-artboard, inte en
   omritning i mindre skala.

   Inga korsfades. Byten sker med masker — ett tryckark läggs över nästa,
   eller lyfts av från överkanten. Två halvgenomskinliga mallar ovanpå
   varandra ger dubbelexponerad text, och det är precis den mjuka
   webbanimationen som briefen förbjuder. */
var MPH4  = ["p1","p2","p3","p4"];
var MPCAP = [["Kommande",  "Bilden dominerar. Adressen som löfte."],
             ["Till salu", "Faktaraden läggs på: rum, yta, byggår."],
             ["Visning",   "En enda uppgift, satt stort."],
             ["Såld",      "Ordet tar över, bilden backar."]];

function mpost(id){ for(var j=0;j<POSTS.length;j++){ if(POSTS[j].id===id) return POSTS[j] } return null }

/* En riktig artboard, absolut placerad. w anges i ramens cqw; höjden
   följer formatet. Ingen stand-in — post() är samma renderare som
   produktionen använder. */
function martb(D, id, x, y, w, ar, extra){
  var p = mpost(id); if(!p) return '';
  var q = (typeof AR!=="undefined" && AR[ar]) || [4,5];
  return '<div style="position:absolute;left:'+x.toFixed(2)+'cqw;top:'+y.toFixed(2)+'cqw;width:'+w.toFixed(2)
   +'cqw;height:'+(w*q[1]/q[0]).toFixed(2)+'cqw;overflow:hidden;container-type:inline-size;text-align:left;'
   +(extra||'')+'">'+post(D, p, ar)+'</div>';
}
/* n faser -> {i, local}. local är förloppet inom den aktuella fasen. */
function mphN(t, a, b, n){
  var u = seg(t,a,b)*n, i = Math.min(n-1, Math.floor(u));
  return {i:i, local:mclamp(u-i)};
}
function mphase4(t, a, b){ return mphN(t, a, b, 4) }
/* Byter två färdiga fragment maskerat: det gamla dras tillbaka, det nya
   sätts. Ytan står aldrig tom mitt i bytet. */
function mswap2(a, b, p){
  p = mclamp(p);
  return p < .5 ? mreveal(a, 1-seg(p,0,.5)) : mreveal(b, seg(p,.5,1));
}
function mrail(D, y, i, n, dark){
  var T = mtone(D);
  var on  = dark ? "#98A088" : T.oli;
  var off = dark ? "rgba(239,237,231,.24)" : T.line;
  var s = '';
  for(var j=0;j<n;j++){ s += '<span style="flex:1;height:2px;background:'+(j<=i?on:off)+'"></span>' }
  return '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+y+'cqw;display:flex;gap:1.4cqw">'+s+'</div>';
}

MK.kampanj = {
 /* 01 EDITORIAL — uppslaget: kick, rubrik, ingress, plåt. Mallen byts
    genom att den nya artboarden SÄTTS över den föregående från vänster,
    med en olivfärgad hårlinje i skarven. Ingen fade — ett tryckark. */
 editorial:function(D, t){
   var T = mtone(D), ph = mphase4(t, 0, .96), i = ph.i;
   var X = 12, Y = 48, W = 76;
   var w  = i>0 ? eInOut(Math.min(1, ph.local/.26)) : 1;
   var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
   var prv = MPCAP[i>0 ? i-1 : 0], cur = MPCAP[i];
   var seam = (i>0 && w>.001 && w<.999)
     ? '<div style="position:absolute;left:'+(X+W*w).toFixed(2)+'cqw;top:'+Y+'cqw;width:1.5px;height:'
       +(W*1.25).toFixed(2)+'cqw;background:'+T.oli+'"></div>' : '';
   return mshell(D, mkick(D,"Kampanjen · Silvergården 9A")
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:29cqw">'
     + mswap2(mdisp(D, prv[0], 8.2), mdisp(D, cur[0], 8.2), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:39.5cqw">'
     + mswap2(mbody(D, prv[1]), mbody(D, cur[1]), sp) +'</div>'
     + (i>0 ? martb(D, MPH4[i-1], X, Y, W, "4:5") : '')
     + martb(D, MPH4[i], X, Y, W, "4:5",
             w<1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '')
     + seam
     + mrail(D, 146.5, i, 4)
     + mfoot(D));
 },
 /* 02 SYSTEM — alla fyra mallarna samtidigt, i rutnät. Ingen skalning och
    ingen förflyttning: läget vandrar genom ljusstyrka och ram. Att alla
    fyra syns hela tiden är hela argumentet — det är en uppsättning, inte
    fyra engångslayouter. */
 system:function(D, t){
   var T = mtone(D), now = mphase4(t, .06, .94).i;
   var cards = MPH4.map(function(id, j){
     var pp = mpost(id); if(!pp) return '';
     var cur = j === now, on = j <= now;
     return '<div style="opacity:'+(cur?1:on?.8:.38)+'">'
      +'<div style="position:relative;width:100%;aspect-ratio:4/5;overflow:hidden;container-type:inline-size;'
      +'text-align:left;outline:'+(cur ? '2px solid '+T.oli : '1px solid '+T.line)+'">'
      + post(D, pp, "4:5") +'</div>'
      +'<div style="margin-top:1.5cqw;font-family:Montserrat,sans-serif;font-size:1.8cqw;letter-spacing:.14em;'
      +'text-transform:uppercase;color:'+(cur?T.oli:T.mut)+'">'+esc(pp.stage)+' · '+esc(MPCAP[j][0])+'</div></div>';
   }).join("");
   return mshell(D, mkick(D,"Kampanjfaserna")
     + mrule(D, 30, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:33.5cqw">'
     + mdisp(D, "Ett underlag, fyra mallar", 6.6) +'</div>'
     +'<div style="position:absolute;left:15.4cqw;right:15.4cqw;top:44cqw;display:grid;'
     +'grid-template-columns:1fr 1fr;gap:3.2cqw">'+cards+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:140.5cqw">'
     + mbody(D, "Adress och faktarad står still. Bara mallen byts.", lerp(.42, 1, eOut(seg(t,.72,.94)))) +'</div>'
     + mfoot(D));
 },
 /* 03 OBJECT — mallarna som tryckta ark i en bunt. Det översta arket
    lyfts av — maskerat uppifrån och ned, inte nedtonat — och nästa
    ligger redan under. Materialet är leveransen: fyra färdiga inlägg
    ur ett och samma objekt. */
 object:function(D, t){
   var T = mtone(D), ph = mphase4(t, 0, .96), i = ph.i;
   var peel = i>0 ? eInOut(Math.min(1, ph.local/.24)) : 0;
   var sp   = i>0 ? Math.min(1, ph.local/.34) : 1;
   var X = 17, Y = 36, W = 66;
   var sh = 'box-shadow:0 1.1cqw 3.4cqw rgba(0,0,0,'+(T.dark?.62:.18)+');';
   var eb = function(j){
     var pp = mpost(MPH4[j]);
     return '<div style="font-family:Montserrat,sans-serif;font-size:2.1cqw;font-weight:500;letter-spacing:.34em;'
      +'text-transform:uppercase;color:'+T.mut+'">'+esc(pp.stage+" · "+MPCAP[j][0])+'</div>';
   };
   var stack = '';
   for(var g=2; g>=1; g--){
     stack += '<div style="position:absolute;left:'+(X+g*1.5)+'cqw;top:'+(Y+g*1.5)+'cqw;width:'+W
       +'cqw;height:'+(W*1.25).toFixed(2)+'cqw;background:'+T.plate+';border:1px solid '+T.line+';'+sh+'"></div>';
   }
   stack += martb(D, MPH4[i], X, Y, W, "4:5", sh);
   if(i>0 && peel<1){
     stack += martb(D, MPH4[i-1], X, Y - peel*3, W, "4:5",
                    'clip-path:inset('+(peel*100).toFixed(1)+'% 0 0 0);'+sh);
   }
   return mshell(D, mkick(D,"Kampanjen")
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:29cqw">'
     + mswap2(eb(i>0?i-1:0), eb(i), sp) +'</div>'
     + stack
     + mrail(D, 123, i, 4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:127.5cqw">'
     + mdisp(D, "Silvergården 9A", 8.6) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:139cqw">'
     + mbody(D, "Fyra tryckfärdiga inlägg ur samma underlag.") +'</div>'
     + mfoot(D));
 }
};

/* ---------- 05 ETT OBJEKT, TRE FORMAT ----------
   Samma fel som kampanjen hade: den förra versionen beskar ett
   FOTOGRAFI i tre proportioner. Men påståendet är "samma mall
   exporterar samtliga" — och mallen syntes aldrig. En bild som beskärs
   bevisar ingenting; det som ska bevisas är att LAYOUTEN håller när
   ytan byter proportion.

   Nu renderas Till salu-mallen — den tätaste av de fyra, alltså den som
   är svårast att få att hålla — genom post() i 9:16, 4:5 och 1:1. Det
   är samma artboards som exporteras i vy 05, och de sätter om sig
   själva per format: bandhöjd, faktarad och bottenmarginal räknas om.
   Alla tre är 1080 px breda, vilket är varför de jämförs vid samma
   bredd och inte vid samma höjd. */
var FMT3 = [["9:16","Story","1080 × 1920",9,16],
            ["4:5", "Inlägg","1080 × 1350",4,5],
            ["1:1", "Kvadrat","1080 × 1080",1,1]];
var FMTP = "p2";   /* Till salu — tätaste mallen, hårdast prov */

MK.format = {
 /* 01 EDITORIAL — en plåt i taget, i full storlek. Formatbytet sker under
    en vandrande kant: den gamla ytan tas bort uppifrån samtidigt som den
    nya sätts, av samma kant. Ingen korsfade. */
 editorial:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .96, 3), i = ph.i;
   var H = 88, f = FMT3[i], pf = FMT3[i>0?i-1:0];
   var e  = i>0 ? eInOut(Math.min(1, ph.local/.30)) : 1;   /* kantens läge */
   var sp = i>0 ? Math.min(1, ph.local/.36) : 1;
   var wc = H*f[3]/f[4], wp = H*pf[3]/pf[4], Y = 36;
   var box = function(fm, w, clip){
     return martb(D, FMTP, (100-w)/2, Y, w, fm, clip);
   };
   return mshell(D, mkick(D,"Ett objekt, tre format")
     + (i>0 && e<1 ? box(pf[0], wp, 'clip-path:inset('+(e*100).toFixed(1)+'% 0 0 0);') : '')
     + box(f[0], wc, e<1 ? 'clip-path:inset(0 0 '+((1-e)*100).toFixed(1)+'% 0);' : '')
     + (i>0 && e>.001 && e<.999
        ? '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(Y+H*e).toFixed(2)
          +'cqw;height:1.5px;background:'+T.oli+'"></div>' : '')
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:128cqw">'
     + mswap2(mdisp(D, pf[1], 8.2), mdisp(D, f[1], 8.2), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:139cqw">'
     + mswap2(mbody(D, pf[2]+" · "+pf[0]), mbody(D, f[2]+" · "+f[0]), sp) +'</div>'
     + mfoot(D));
 },
 /* 02 SYSTEM — alla tre uppe samtidigt, satta vid samma bredd, eftersom
    alla tre exporteras 1080 px breda. Story till vänster, flödets två
    format staplade till höger. Läget vandrar med ram och ljusstyrka. */
 system:function(D, t){
   var T = mtone(D), now = mphN(t, .06, .94, 3).i;
   var cell = function(k, x, y, w){
     var f = FMT3[k], cur = k === now, on = k <= now;
     var h = w*f[4]/f[3];
     return '<div style="position:absolute;left:'+x+'cqw;top:'+y.toFixed(2)+'cqw;width:'+w
      +'cqw;opacity:'+(cur?1:on?.8:.38)+'">'
      +'<div style="position:relative;width:100%;height:'+h.toFixed(2)+'cqw;overflow:hidden;'
      +'container-type:inline-size;text-align:left;outline:'+(cur?'2px solid '+T.oli:'1px solid '+T.line)+'">'
      + post(D, mpost(FMTP), f[0]) +'</div>'
      +'<div style="margin-top:1.4cqw;font-family:Montserrat,sans-serif;font-size:1.8cqw;letter-spacing:.14em;'
      +'text-transform:uppercase;color:'+(cur?T.oli:T.mut)+'">'+esc(f[0]+" · "+f[1])+'</div></div>';
   };
   /* botten linjeras: 9:16 till vänster, 4:5 + 1:1 staplade till höger */
   var W = 36, L = 11, R = 53, BOT = 134, LAB = 4.2;
   return mshell(D, mkick(D,"Ett objekt, tre format")
     + mrule(D, 30, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:33.5cqw">'
     + mdisp(D, "Samma mall exporterar samtliga", 6.6) +'</div>'
     + cell(0, L, BOT - LAB - W*16/9, W)
     + cell(1, R, BOT - LAB - W*5/4 - 3 - W - LAB, W)
     + cell(2, R, BOT - LAB - W, W)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:137.5cqw">'
     + mbody(D, "Alla tre är 1080 px breda. Bandet räknas om, inte layouten.",
             lerp(.42, 1, eOut(seg(t,.72,.94)))) +'</div>'
     + mfoot(D));
 },
 /* 03 OBJECT — trimboxen. Ytan sätts först, tom, och mallen sätts sedan
    in i den. Det är så en formatuppsättning faktiskt går till: man
    bestämmer ytan, sedan sätter man om satsen. */
 object:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .96, 3), i = ph.i;
   var H = 96, Y = 34, f = FMT3[i], pf = FMT3[i>0?i-1:0];
   var m  = i>0 ? eInOut(Math.min(1, ph.local/.20)) : 1;
   var s  = i>0 ? eOut(seg(ph.local, .22, .54)) : 1;
   var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
   var w  = lerp(H*pf[3]/pf[4], H*f[3]/f[4], m), x = (100-w)/2;
   return mshell(D, mkick(D,"Trimytan")
     +'<div style="position:absolute;left:'+x.toFixed(2)+'cqw;top:'+Y+'cqw;width:'+w.toFixed(2)
     +'cqw;height:'+H+'cqw;background:'+T.plate+';outline:1px solid '+T.oli+'"></div>'
     + (s>.001 ? martb(D, FMTP, x, Y, w, f[0],
                       s<1 ? 'clip-path:inset(0 0 '+((1-s)*100).toFixed(1)+'% 0);' : '') : '')
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:29cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.1cqw;font-weight:500;letter-spacing:.34em;text-transform:uppercase;color:'+T.mut+'">'
     + esc((sp<.5?pf:f)[2]+" · "+(sp<.5?pf:f)[0]) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:134cqw">'
     + mswap2(mdisp(D, pf[1], 8.6), mdisp(D, f[1], 8.6), sp) +'</div>'
     + mfoot(D));
 }
};

/* ---------- 06 WHITE LABEL ----------
   Samma fel igen: den förra versionen visade en TRÅDMODELL — grå staplar
   där texten skulle stå. Men påståendet är att visningssidan levereras
   färdig i kontorets varumärke, och en trådmodell bevisar inte att en
   sida är färdig. Den bevisar tvärtom att den inte är det.

   msite() ritar därför den faktiska sidstrukturen: varumärkeslist,
   hero, status, adress, faktarad, tre ingångar och en handlingsknapp.
   Allt utom loggan och accentfärgen är identiskt mellan kontoren — det
   är hela poängen, och den syns bara när sidan är satt. */
var MWB = [["", "", "Utan varumärke"],
           ["Nordvik", "#1F3A2E", "Nordvik"],
           ["Alvhem",  "#7A3B2E", "Alvhem"]];

/* Visningssidan i miniatyr. Egen container: allt inuti räknas mot
   sidans bredd, så samma funktion fungerar på 41 cqw och på 86. */
function msite(D, bi, x, y, w, extra){
  var T = mtone(D), b = MWB[bi], c = b[1] || T.mut, on = !!b[1];
  var plate = T.dark ? "#141416" : "#FFFFFF";
  var line  = T.dark ? "#26262A" : "#E4DEDB";
  var ink   = T.dark ? "#EFEDE7" : "#1C1C1E";
  var mut   = T.dark ? "#8C8A84" : "#8A8580";
  var thumbs = ["threed","om3","drone"].map(function(k,j){
    return '<div style="flex:1;position:relative;aspect-ratio:4/3;overflow:hidden;border:1px solid '+line+'">'
     +'<div style="position:absolute;inset:0;'+bg(k,"m-site-"+j)+'"></div></div>';
  }).join("");
  return '<div style="position:absolute;left:'+x.toFixed(2)+'cqw;top:'+y.toFixed(2)+'cqw;width:'+w.toFixed(2)
   +'cqw;container-type:inline-size;text-align:left;background:'+plate+';border:1px solid '+line+';'
   +'overflow:hidden;'+(extra||'')+'">'
   /* varumärkeslist */
   +'<div style="height:11cqw;display:flex;align-items:center;gap:2.6cqw;padding:0 5cqw;border-bottom:1px solid '+line+'">'
   + (on ? '<span style="width:4.6cqw;height:4.6cqw;background:'+c+';flex:0 0 4.6cqw"></span>'
          +'<span style="font-family:Montserrat,sans-serif;font-size:3.2cqw;font-weight:700;letter-spacing:.18em;'
          +'text-transform:uppercase;color:'+ink+'">'+esc(b[0])+'</span>'
        : '<span style="width:4.6cqw;height:4.6cqw;border:1px solid '+line+';flex:0 0 4.6cqw"></span>'
          +'<span style="width:24cqw;height:2.6cqw;background:'+line+'"></span>')
   +'</div>'
   /* hero */
   +'<div style="position:relative;height:44cqw;overflow:hidden">'
   +'<div style="position:absolute;inset:0;'+bg("matterport","m-site-hero")+'"></div></div>'
   /* innehåll */
   +'<div style="padding:5cqw">'
   +'<div style="font-family:Montserrat,sans-serif;font-size:2.9cqw;font-weight:500;letter-spacing:.3em;'
   +'text-transform:uppercase;color:'+c+'">Till salu</div>'
   +'<div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9.4cqw;'
   +'line-height:1.04;color:'+ink+';margin-top:1.6cqw">Silvergården 9A</div>'
   +'<div style="font-family:Montserrat,sans-serif;font-size:3cqw;color:'+mut+';margin-top:1.6cqw">'
   +'Landskrona · 4 rum · 112 m² · 1968</div>'
   +'<div style="height:1px;background:'+line+';margin:4.4cqw 0"></div>'
   +'<div style="display:flex;gap:2.4cqw">'+thumbs+'</div>'
   +'<div style="margin-top:5cqw;display:inline-block;padding:2.6cqw 5.4cqw;background:'+(on?c:line)+';'
   +'font-family:Montserrat,sans-serif;font-size:2.9cqw;font-weight:500;letter-spacing:.16em;'
   +'text-transform:uppercase;color:'+(on?"#FFFFFF":mut)+'">Se bostaden i 3D</div>'
   +'</div>'
   /* kolofon — det enda stället Viewly nämns */
   +'<div style="height:8cqw;border-top:1px solid '+line+';display:flex;align-items:center;'
   +'justify-content:space-between;padding:0 5cqw;font-family:Montserrat,sans-serif;font-size:2.4cqw;'
   +'letter-spacing:.18em;text-transform:uppercase;color:'+mut+'">'
   +'<span>'+esc(on ? b[0].toLowerCase()+'.se' : '')+'</span><span>Produktion Viewly</span></div>'
   +'</div>';
}

MK.white = {
 /* 01 EDITORIAL — en sida, satt tre gånger. Bara loggan och accentfärgen
    byts; adress, faktarad, ingångar och knapp står stilla. */
 editorial:function(D, t){
   var ph = mphN(t, 0, .96, 3), i = ph.i;
   var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
   /* accentfärgen sveper över sidan — maskerat byte, ingen korsfade */
   var w  = i>0 ? eInOut(Math.min(1, ph.local/.28)) : 1;
   var CAP = [["Strukturen.","En sida, samma varje gång."],
              ["Nordvik.",   "Logga och accentfärg satta av kontoret."],
              ["Alvhem.",    "Samma sida, ett annat varumärke."]];
   var prv = CAP[i>0?i-1:0], cur = CAP[i];
   return mshell(D, mkick(D,"White label")
     + (i>0 ? msite(D, i-1, 15, 30, 70) : '')
     + msite(D, i, 15, 30, 70, w<1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '')
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:127.5cqw">'
     + mswap2(mdisp(D, prv[0], 8.6), mdisp(D, cur[0], 8.6), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:139cqw">'
     + mswap2(mbody(D, prv[1]), mbody(D, cur[1]), sp) +'</div>'
     + mfoot(D));
 },
 /* 02 SYSTEM — de två kontoren sida vid sida. Samma sida, två varumärken,
    inget annat skiljer. Att de står bredvid varandra är beviset. */
 system:function(D, t){
   var T = mtone(D), now = mphN(t, .06, .94, 3).i;
   var lab = function(k, x){
     var cur = now === k;
     return '<div style="position:absolute;left:'+x+'cqw;top:122cqw;font-family:Montserrat,sans-serif;'
      +'font-size:1.9cqw;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:'
      +(cur?T.oli:T.mut)+'">'+esc(MWB[k][2])+'</div>';
   };
   return mshell(D, mkick(D,"Ett uttryck, satt en gång")
     + mrule(D, 30, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:33.5cqw">'
     + mdisp(D, "Kontoret sätter, systemet upprepar", 6.6) +'</div>'
     + msite(D, 1, 6.4, 48, 41, now===1?'outline:2px solid '+T.oli+';':'opacity:'+(now>1?.62:.4)+';')
     + msite(D, 2, 52.6, 48, 41, now===2?'outline:2px solid '+T.oli+';':'opacity:'+(now>2?.62:.4)+';')
     + lab(1, 6.4) + lab(2, 52.6)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:130cqw">'
     + mbody(D, "Innehållet är identiskt. Bara uttrycket byts.",
             lerp(.42, 1, eOut(seg(t,.70,.94)))) +'</div>'
     + mfoot(D));
 },
 /* 03 OBJECT — sidan i stort sett i full storlek. Ingen förklaring:
    leveransen får stå för sig själv, och kontorets namn står i listen. */
 object:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .96, 3), i = ph.i;
   var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
   var w  = i>0 ? eInOut(Math.min(1, ph.local/.28)) : 1;
   var nm = function(j){
     return '<div style="font-family:Montserrat,sans-serif;font-size:2.25cqw;font-weight:500;'
      +'letter-spacing:.24em;text-transform:uppercase;color:'+T.oli+'">'
      + esc("White label · " + MWB[j][2]) +'</div>';
   };
   return mshell(D,
     '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+SAFE.top+'cqw">'
     + mswap2(nm(i>0?i-1:0), nm(i), sp) +'</div>'
     + (i>0 ? msite(D, i-1, 7, 29, 86) : '')
     + msite(D, i, 7, 29, 86, w<1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '')
     + mfoot(D));
 }
};

/* ---------- 07 3D VISNING — PLAN, VOLYM, RUNDVANDRING ----------
   Den förra versionen var ett diagram: en isometrisk streckritning som
   lyfte sig, med rubrikerna satta i vitt rakt på ljusa fotografier. Två
   fel. Diagrammet visade inte produkten — 3D-visningen är en riktig
   yta som kunden klickar i — och den vita texten på ljus bild gick inte
   att läsa.

   mviewer() ritar den faktiska visningsytan: lägesväljaren Dollhouse /
   Planvy / Rundvandring, själva vyn, och sidfoten med objektets data.
   Planritningen är kvar, men nu som ETT AV LÄGENA i produkten i stället
   för som en illustration av den. */
/* Planen ritas i en viewBox som beskurits till figuren och vars bas
   följer lyftet, så att volymen står stilla i mitten i stället för att
   krympa till en prick i ett tomt fält. */
function mplan(c, a, lift){
  var k = 1 - lift*.34, base = 25 - 24*k + 21*lift;
  var y = function(v){ return base + (v-50)*k - lift*8 };
  var top = 26*lift;
  return '<svg viewBox="18 0 64 50" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block">'
   +'<path d="M20 '+y(74)+' L50 '+y(88)+' L80 '+y(74)+' L50 '+y(60)+' Z" fill="none" stroke="'+c+'" stroke-width="1.4"/>'
   + (lift>.001 ? '<path d="M20 '+y(74)+' V'+(y(74)-top)+' L50 '+(y(88)-top)+' V'+y(88)+'" fill="none" stroke="'+c+'" stroke-width="1.4" opacity=".8"/>'
     +'<path d="M80 '+y(74)+' V'+(y(74)-top)+' L50 '+(y(88)-top)+' V'+y(88)+'" fill="none" stroke="'+c+'" stroke-width="1.4" opacity=".8"/>'
     +'<path d="M20 '+(y(74)-top)+' L50 '+(y(60)-top)+' L80 '+(y(74)-top)+' L50 '+(y(88)-top)+' Z" fill="'+c
     +'" opacity="'+(.07*lift).toFixed(3)+'" stroke="'+c+'" stroke-width="1.4"/>' : '')
   +'<circle cx="50" cy="'+(y(74)-13*lift)+'" r="3.2" fill="'+a+'"/></svg>';
}
var M3D = [["Dollhouse","threed",     "Hela bostaden som en volym."],
           ["Planvy",   "",          "Måtten och planlösningen."],
           ["Rundvandring","matterport","Kunden går igenom rummen själv."]];

/* Visningsytan i miniatyr — egen container, så samma funktion håller
   på 42 cqw och på 88. mode 0/1/2 följer M3D. lift driver planritningen
   från platt uppifrån till rest volym. */
function mviewer(D, mode, x, y, w, lift, extra, vh){
  var T = mtone(D);
  vh = vh || 74;   /* vyns höjd i sidans egna cqw; total = 22 + vh */
  var plate = T.dark ? "#141416" : "#FFFFFF";
  var line  = T.dark ? "#26262A" : "#E4DEDB";
  var ink   = T.dark ? "#EFEDE7" : "#1C1C1E";
  var mut   = T.dark ? "#8C8A84" : "#8A8580";
  var tabs = M3D.map(function(m, j){
    var on = j === mode;
    return '<span style="font-family:Montserrat,sans-serif;font-size:2.7cqw;font-weight:500;letter-spacing:.16em;'
     +'text-transform:uppercase;color:'+(on?T.oli:mut)+';padding-bottom:1.6cqw;'
     +'border-bottom:'+(on?'2px solid '+T.oli:'2px solid transparent')+'">'+esc(m[0])+'</span>';
  }).join("");
  var view = (mode === 1)
    ? '<div style="position:absolute;inset:0;background:'+(T.dark?"#0E0E0D":"#F7F5F2")+';padding:4cqw">'
      + mplan(ink, T.oli, lift) +'</div>'
    : '<div style="position:absolute;inset:0;'+bg(M3D[mode][1], "m-3d-"+mode)+'"></div>';
  return '<div style="position:absolute;left:'+x.toFixed(2)+'cqw;top:'+y.toFixed(2)+'cqw;width:'+w.toFixed(2)
   +'cqw;container-type:inline-size;text-align:left;background:'+plate+';border:1px solid '+line+';'
   +'overflow:hidden;'+(extra||'')+'">'
   +'<div style="height:11cqw;display:flex;align-items:flex-end;gap:5cqw;padding:0 5cqw;'
   +'border-bottom:1px solid '+line+'">'+tabs+'</div>'
   +'<div style="position:relative;height:'+vh+'cqw;overflow:hidden">'+view+'</div>'
   +'<div style="height:11cqw;border-top:1px solid '+line+';display:flex;align-items:center;'
   +'justify-content:space-between;padding:0 5cqw">'
   +'<span style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:5cqw;color:'+ink+'">'
   +'Silvergården 9A</span>'
   +'<span style="font-family:Montserrat,sans-serif;font-size:2.5cqw;letter-spacing:.18em;text-transform:uppercase;'
   +'color:'+mut+'">112 m² · 4 rum</span></div></div>';
}

MK.tredim = {
 /* 01 EDITORIAL — planritningen reser sig till volym inne i visningsytan,
    och lägesväljaren följer med. Det är samma rörelse som förut, men nu
    sker den i produkten i stället för bredvid den. */
 editorial:function(D, t){
   var ph = mphN(t, 0, .96, 3), i = ph.i;
   var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
   var lift = i===1 ? eInOut(ph.local) : (i>1 ? 1 : 0);
   /* lägesbytet är en maskerad övergång, inte en korsfade */
   var w  = i>0 ? eInOut(Math.min(1, ph.local/.26)) : 1;
   var CAP = [["Volymen.","Hela bostaden i en bild, ovanifrån."],
              ["Planritningen.","Måtten och planlösningen, samma modell."],
              ["Rundvandringen.","Kunden går igenom rummen själv."]];
   var prv = CAP[i>0?i-1:0], cur = CAP[i];
   return mshell(D, mkick(D,"3D visning · Silvergården 9A")
     + (i>0 ? mviewer(D, i-1, 7, 36, 86, i-1===1?1:0) : '')
     + mviewer(D, i, 7, 36, 86, lift,
               w<1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '')
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:123cqw">'
     + mswap2(mdisp(D, prv[0], 8.6), mdisp(D, cur[0], 8.6), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:134.5cqw">'
     + mswap2(mbody(D, prv[1]), mbody(D, cur[1]), sp) +'</div>'
     + mfoot(D));
 },
 /* 02 SYSTEM — de tre lägena uppe samtidigt. Att det är EN modell läst
    på tre sätt är hela argumentet, och det syns bara när de står
    bredvid varandra. */
 system:function(D, t){
   var T = mtone(D), now = mphN(t, .06, .94, 3).i;
   var lift = eInOut(seg(t, .30, .74));
   var cell = function(k, x, y, w){
     var cur = k === now;
     return mviewer(D, k, x, y, w, lift,
              cur ? 'outline:2px solid '+T.oli+';' : 'opacity:'+(k<now?.66:.4)+';')
      +'<div style="position:absolute;left:'+x+'cqw;top:'+(y+w*.96+2).toFixed(2)+'cqw;'
      +'font-family:Montserrat,sans-serif;font-size:1.85cqw;font-weight:500;letter-spacing:.16em;'
      +'text-transform:uppercase;color:'+(cur?T.oli:T.mut)+'">'+esc(M3D[k][0])+'</div>';
   };
   return mshell(D, mkick(D,"Från plan till rum")
     + mrule(D, 30, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:33.5cqw">'
     + mdisp(D, "En modell, tre sätt att läsa den", 6.6) +'</div>'
     + cell(0, 6.4, 46, 42) + cell(1, 51.6, 46, 42)
     + cell(2, 6.4, 96, 42)
     +'<div style="position:absolute;left:51.6cqw;right:6.4cqw;top:104cqw">'
     + mbody(D, "Skannas en gång. Levereras i kontorets varumärke.",
             lerp(.42, 1, eOut(seg(t,.70,.94)))) +'</div>'
     + mfoot(D));
 },
 /* 03 OBJECT — ytan i stort sett i full storlek. Ingen text ovanpå
    fotografiet: rubriken står på pappret, inte i bilden. Det var därför
    den förra versionen inte gick att läsa. */
 object:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .96, 3), i = ph.i;
   var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
   var lift = i===1 ? eInOut(ph.local) : (i>1 ? 1 : 0);
   var w  = i>0 ? eInOut(Math.min(1, ph.local/.26)) : 1;
   var nm = function(j){
     return '<div style="font-family:Montserrat,sans-serif;font-size:2.25cqw;font-weight:500;'
      +'letter-spacing:.24em;text-transform:uppercase;color:'+T.oli+'">'
      + esc("3D visning · " + M3D[j][0]) +'</div>';
   };
   var bd = function(j){ return mbody(D, M3D[j][2]) };
   return mshell(D,
     '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+SAFE.top+'cqw">'
     + mswap2(nm(i>0?i-1:0), nm(i), sp) +'</div>'
     + (i>0 ? mviewer(D, i-1, 4, 29, 92, i-1===1?1:0, '', 92) : '')
     + mviewer(D, i, 4, 29, 92, lift,
               w<1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '', 92)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:137cqw">'
     + mswap2(bd(i>0?i-1:0), bd(i), sp) +'</div>'
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
var MDUR = {annons:7.8, motion:6.4, estyl:6.2, kampanj:8.4, format:6.6, white:6.6, tredim:6.6};

function motionOf(sid){
  var c = MSID[sid], d = MPICK[sid];
  return (c && d && MK[c] && MK[c][d]) ? {cand:c, dir:d, dur:MDUR[c]||6} : null;
}
function motionFrame(dirId, sid, t){
  var m = motionOf(sid); if(!m) return null;
  return MK[m.cand][m.dir](dirId, mclamp(t));
}
