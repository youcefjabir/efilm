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
/* Faktaraderna byggs vid rendering ur rörelsens objekt — de låg som
   fasta strängar och gick därför inte att ändra. */
function anf(){
  return [["Adress", mo("addr")],
          ["Ort",    mo("city") + (mo("distr") ? " · " + mo("distr") : "")],
          ["Storlek", mo("rooms") + " · " + mo("area")],
          ["Typ",    mo("typ")]];
}
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

   var rows = anf().map(function(f,j){
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

   var words = mo("head").split(" ");
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
     + mreveal(mdisp(D, mo("head"), 6.2), seg(outP,0,.26))
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
   var heads = [mo("head"),"Hemmet där eftermiddagen dröjer","Ett kvarter från hamnen"];
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
     + esc(mo("addr")+" · "+mo("rooms")+" · "+mo("area")+" · "+mo("typ")) +'</div>'
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
   var z = lerp(1, 1.13, t), fy = lerp(mfy("m-mo2"), mfy("m-mo2")-.08, t);
   var lab = t<.25 ? ["Stillbilden.", null, 0] : t<.75 ? ["Rörelsen.", null, seg(t,.22,.30)] : ["Filmen.", null, seg(t,.72,.80)];
   return mshell(D,
     mzoom("m-mo2", "dining", 0, 26, 100, 96, z, fy)
     + mkick(D,"Motion")
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:132cqw">'
     + mreveal(mdisp(D, lab[0], 10.6), lab[2]===0?1:lab[2]) +'</div>'
     + mfoot(D));
 },
 system:function(D, t){
   var T=mtone(D), steps=["Bilderna","Rörelsen","Redigeringen","Filmen"];
   var p = eInOut(seg(t,.10,.86));
   return mshell(D, mkick(D,"Så byggs filmen")
     + mzoom("m-mo2", "dining", 6.4, 30, 87.2, 49, 1)
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
   var sl = c>.5 ? ["m-mo3","dining2"] : b>.5 ? ["m-mo2","dining"] : ["m-mo1","living"];
   var btnP = eOut(seg(t,.18,.30)), btnFade = 1 - .82*seg(t,.42,.52);
   var head = c>.5 ? ["Filmen är klar.", seg(t,.76,.86)]
            : b>.5 ? ["Rörelsen läggs på.", seg(t,.46,.56)]
                   : ["Bilderna finns redan.", 1];
   return mshell(D,
     mzoom(sl[0], sl[1], 0, 0, 100, 177.8, 1)
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

/* mpost() bor nu i objektavsnittet längst ned — den slår ihop mallen
   med PEDITS och rörelsens objekt. */

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
   return mshell(D, mkick(D,"Kampanjen · "+mo("addr"))
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
     + mdisp(D, mo("addr"), 8.6) +'</div>'
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

/* ---------------------------------------------------------------------
   VISNINGSSIDAN — efter den riktiga

   Den förra msite() var påhittad: vit sida, hero, faktarad, tre
   miniatyrer, olivknapp. Viewlys faktiska visningssida ser inte alls ut
   så. Den är en enda full yta av bostaden med fyra saker ovanpå:

     uppe vänster   kontorets logotyp på en platta
     uppe höger     Viewlys märke, litet och tillbakadraget
     mitten         adressen och EN knapp — Upplev bostaden
     nederkant      mäklaren till vänster, kontaktvägarna till höger

   Ingenting annat. Sidan är bostaden, inte en produktsida om bostaden.

   Det som gör den till white label är att TRE saker byts med kontoret,
   och det är precis de tre som ska gå att se i rörelse:

     1  logotypen och plattan den ligger på
     2  typsnittet i adressen och i knappen
     3  knappens färg, form och hörnradie

   VBRAND bär de tre. Allt annat — bilden, adressen, mäklaren,
   kontaktvägarna — står stilla, för det är hela poängen.
   --------------------------------------------------------------------- */
/* Namnen kommer ur objektet, inte ur koden — annars går kontoren inte
   att byta ut, och då är white label ett påstående igen. */
var VBRAND = [
  {id:"vy", key:null, col:"#6E7266", plate:"#1C1C1E", pcol:"#F2EFEF",
   font:"Montserrat,sans-serif", fw:500, ls:".02em", rad:0, btn:"fill"},
  {id:"nv", key:"b1", col:"#1F3A2E", plate:"#1F3A2E", pcol:"#FFFFFF",
   font:"Montserrat,sans-serif", fw:600, ls:".14em", rad:0, btn:"fill"},
  {id:"al", key:"b2", col:"#7A3B2E", plate:"#F5F1EC", pcol:"#7A3B2E",
   font:"'Cormorant Garamond',Georgia,serif", fw:300, ls:".01em", rad:999, btn:"fill"},
  {id:"lg", key:"b3", col:"#1C3A5E", plate:"transparent", pcol:"#FFFFFF",
   font:"Montserrat,sans-serif", fw:300, ls:".28em", rad:3, btn:"outline"}
];
function vbrand(i){
  var b = VBRAND[((i % VBRAND.length) + VBRAND.length) % VBRAND.length];
  return Object.assign({}, b, {name: b.key ? mo(b.key) : "Viewly"});
}

/* Sidan i miniatyr. Alla mått i sidans egna cqw, så samma funktion
   fungerar på 40 cqw och på 96, och i vilket bildförhållande som helst. */
function vsite(D, bi, x, y, w, ar, extra, opts){
  var b = vbrand(bi), o = opts || {};
  var q = (typeof AR !== "undefined" && AR[ar]) || [16,9];
  var h = w*q[1]/q[0];
  /* smalare sida = mindre yta att sätta i; skalan följer bredden ändå */
  var tall = q[1]/q[0] > 1.1;
  var addr = o.addr || mo("addr");
  var btnBg = b.btn === "outline" ? "transparent" : b.col;
  var btnBd = b.btn === "outline" ? "1px solid rgba(255,255,255,.85)" : "1px solid "+b.col;
  var btnCol = b.btn === "outline" ? "#FFFFFF" : "#FFFFFF";
  var pill = function(t){
    return '<span style="border:1px solid rgba(255,255,255,.7);padding:'+(tall?1.6:1.1)+'cqw '
     +(tall?3:2.2)+'cqw;font-family:Montserrat,sans-serif;font-size:'+(tall?2.1:1.55)+'cqw;'
     +'font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:#FFFFFF;'
     +'white-space:nowrap">'+esc(t)+'</span>';
  };
  return '<div style="position:absolute;left:'+x.toFixed(2)+'cqw;top:'+y.toFixed(2)+'cqw;width:'+w.toFixed(2)
   +'cqw;height:'+h.toFixed(2)+'cqw;overflow:hidden;container-type:inline-size;text-align:left;'
   +'background:#2A2A28;'+(extra||'')+'">'
   /* bostaden fyller hela ytan */
   +'<div style="position:absolute;inset:0;'+bg(o.img||"matterport","m-site-hero")+'"></div>'
   +'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,20,18,.30) 0%,'
   +'rgba(20,20,18,.10) 34%,rgba(20,20,18,.16) 62%,rgba(20,20,18,.62) 100%)"></div>'
   /* 1 · kontorets logotyp */
   +'<div style="position:absolute;left:'+(tall?4:2.6)+'cqw;top:'+(tall?3.4:2.6)+'cqw;'
   +'background:'+b.plate+';padding:'+(tall?2.4:1.9)+'cqw '+(tall?3.4:2.8)+'cqw;'
   +'display:flex;flex-direction:column;gap:.5cqw'+(b.plate==="transparent"?';border:1px solid rgba(255,255,255,.5)':'')+'">'
     +'<span style="font-family:'+b.font+';font-weight:'+b.fw+';font-size:'+(tall?3.4:2.5)
     +'cqw;letter-spacing:'+b.ls+';color:'+b.pcol+';text-transform:'+(b.ls===".28em"?"uppercase":"none")+'">'
     + esc(b.name) +'</span></div>'
   /* 2 · Viewlys märke, tillbakadraget */
   +'<div style="position:absolute;right:'+(tall?4:2.6)+'cqw;top:'+(tall?3.8:3)+'cqw;'
   +'display:flex;align-items:center;gap:'+(tall?1.4:1)+'cqw;opacity:.9">'
     +'<span style="width:'+(tall?3:2.2)+'cqw;display:block">'
     + vmark("#FFFFFF","#FFFFFF",'style="width:100%;height:auto;display:block"') +'</span>'
     +'<span style="font-family:Montserrat,sans-serif;font-size:'+(tall?1.9:1.4)+'cqw;font-weight:600;'
     +'letter-spacing:.3em;color:#FFFFFF">VIEWLY</span></div>'
   /* 3 · adressen och den enda knappen */
   +'<div style="position:absolute;left:6cqw;right:6cqw;top:50%;transform:translateY(-50%);'
   +'display:flex;flex-direction:column;align-items:center;gap:'+(tall?4:3)+'cqw">'
     +'<span style="font-family:'+b.font+';font-weight:'+b.fw+';font-size:'+(tall?7.6:5.4)
     +'cqw;letter-spacing:'+b.ls+';color:#FFFFFF;text-align:center;line-height:1.1">'+esc(addr)+'</span>'
     +'<span style="background:'+btnBg+';border:'+btnBd+';border-radius:'+b.rad+'px;'
     +'padding:'+(tall?2.6:1.9)+'cqw '+(tall?7:5.2)+'cqw;font-family:'+b.font+';font-weight:'+b.fw+';'
     +'font-size:'+(tall?2.9:2.1)+'cqw;letter-spacing:'+b.ls+';color:'+btnCol+'">Upplev bostaden</span>'
   +'</div>'
   /* 4 · mäklaren och kontaktvägarna */
   +'<div style="position:absolute;left:'+(tall?4:3)+'cqw;bottom:'+(tall?4:3)+'cqw;'
   +'display:flex;align-items:center;gap:'+(tall?2.4:1.8)+'cqw">'
     +'<span style="width:'+(tall?7:5)+'cqw;height:'+(tall?7:5)+'cqw;border-radius:50%;'
     +'border:1px solid rgba(255,255,255,.55);flex:0 0 auto"></span>'
     +'<span style="display:flex;flex-direction:column;gap:.4cqw">'
       +'<span style="font-family:Montserrat,sans-serif;font-size:'+(tall?1.7:1.25)+'cqw;font-weight:500;'
       +'letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.75)">Presenteras av</span>'
       +'<span style="font-family:'+b.font+';font-weight:'+b.fw+';font-size:'+(tall?3:2.2)
       +'cqw;color:#FFFFFF">'+esc(o.agent||"Anna Lindqvist")+'</span>'
       +'<span style="font-family:Montserrat,sans-serif;font-size:'+(tall?1.6:1.2)+'cqw;'
       +'letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.65)">Fastighetsmäklare · '
       + esc(b.name) +'</span></span></div>'
   +'<div style="position:absolute;right:'+(tall?4:3)+'cqw;bottom:'+(tall?4.6:3.4)+'cqw;'
   +'display:flex;gap:'+(tall?1.6:1.2)+'cqw">'+ pill("Mejla")+pill("Ring")+pill("SMS") +'</div>'
   +'</div>';
}

/* ---------- 06 WHITE LABEL ----------
   Omritad mot den faktiska visningssidan. Den förra ritade en påhittad
   produktsida med faktarad och miniatyrer; verkligheten är en enda yta
   av bostaden med logotyp, adress, en knapp och kontaktvägar.

   Och påståendet var fel formulerat. Att sidan "levereras i kontorets
   varumärke" bevisas inte av att en accentfärg byts — det ska synas att
   TRE saker byts samtidigt: logotypen, typsnittet och knappen. Det är
   just de tre riktningarna nedan ägnar sig åt.

   Bildförhållandet är också en del av leveransen: samma sida sätts om
   för desktop, surfplatta och mobil. Object-riktningen visar det. */
function mwb(){
  return [["", "", "Utan varumärke"],
          [mo("b1"), "#1F3A2E", mo("b1")],
          [mo("b2"), "#7A3B2E", mo("b2")]];
}

MK.white = {
 /* 01 EDITORIAL — sidan i full bredd, kontoret sveper in maskerat.
    Ingen förklaring behövs: bilden, adressen och mäklaren står still
    medan allt som är kontorets byter skepnad. */
 editorial:function(D, t){
   var ph = mphN(t, 0, .96, 4), i = ph.i;
   var w  = i>0 ? eInOut(Math.min(1, ph.local/.28)) : 1;
   var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
   var b = vbrand(i), pb = vbrand(i>0?i-1:0);
   var nm = function(x){
     return '<div style="font-family:Montserrat,sans-serif;font-size:2.15cqw;font-weight:500;'
      +'letter-spacing:.34em;text-transform:uppercase;color:'+mtone(D).oli+'">'+esc(x)+'</div>';
   };
   var cap = function(x){ return mdisp(D, x, 8.2) };
   var Y = 46, W = 88, X = 6;
   return mshell(D, mkick(D,"White label")
     + (i>0 ? vsite(D, i-1, X, Y, W, "16:9") : '')
     + vsite(D, i, X, Y, W, "16:9",
             w<1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '')
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:29cqw">'
     + mswap2(nm("Visningssidan · "+pb.name), nm("Visningssidan · "+b.name), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:104cqw">'
     + mswap2(cap(pb.name+"."), cap(b.name+"."), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:116cqw">'
     + mbody(D, "Logotyp, typsnitt och knapp är kontorets. Bostaden, adressen och mäklaren står still.") +'</div>'
     + mfoot(D));
 },
 /* 02 SYSTEM — vad som faktiskt byts, utplockat.
    Tre rader: logotypen, typsnittet, knappen. Det är hela white
    label-leveransen, och den syns inte förrän man plockar isär den. */
 system:function(D, t){
   var T = mtone(D), ph = mphN(t, .04, .96, 4), i = ph.i;
   var b = vbrand(i);
   var plate = T.dark ? "#141416" : "#FFFFFF";
   var line  = T.dark ? "#26262A" : "#E4DEDB";
   var row = function(lab, inner, y){
     return '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+y+'cqw">'
      +'<div style="font-family:Montserrat,sans-serif;font-size:1.85cqw;font-weight:500;'
      +'letter-spacing:.24em;text-transform:uppercase;color:'+T.mut+';margin-bottom:2cqw">'+esc(lab)+'</div>'
      +'<div style="background:'+plate+';border:1px solid '+line+';padding:4cqw;'
      +'display:flex;align-items:center;justify-content:center;min-height:15cqw">'+inner+'</div></div>';
   };
   var logo = '<span style="background:'+(b.plate==="transparent"?"transparent":b.plate)
     +';padding:2.2cqw 3.4cqw;'+(b.plate==="transparent"?'border:1px solid '+T.line+';':'')
     +'font-family:'+b.font+';font-weight:'+b.fw+';font-size:4.4cqw;letter-spacing:'+b.ls+';color:'
     +(b.plate==="transparent"?T.ink:b.pcol)+';text-transform:'+(b.ls===".28em"?"uppercase":"none")+'">'
     + esc(b.name) +'</span>';
   var typ = '<span style="font-family:'+b.font+';font-weight:'+b.fw+';font-size:6.6cqw;'
     +'letter-spacing:'+b.ls+';color:'+T.ink+'">'+esc(mo("addr"))+'</span>';
   var knapp = '<span style="background:'+(b.btn==="outline"?"transparent":b.col)+';border:1px solid '
     +b.col+';border-radius:'+b.rad+'px;padding:2.4cqw 6cqw;font-family:'+b.font+';font-weight:'+b.fw+';'
     +'font-size:2.9cqw;letter-spacing:'+b.ls+';color:'+(b.btn==="outline"?b.col:"#FFFFFF")+'">'
     +'Upplev bostaden</span>';
   return mshell(D, mkick(D,"Vad som byts")
     + mrule(D, 30, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:33.5cqw">'
     + mdisp(D, "Tre saker, resten står still", 6.6) +'</div>'
     + row("01 · Logotyp", logo, 48)
     + row("02 · Typsnitt", typ, 83)
     + row("03 · Knapp", knapp, 118)
     + mfoot(D));
 },
 /* 03 OBJECT — samma sida i tre bildförhållanden.
    Desktop, surfplatta och mobil är inte tre sidor utan en, omsatt. */
 object:function(D, t){
   var T = mtone(D), ph = mphN(t, .04, .96, 3), i = ph.i;
   var b = vbrand(1 + (Math.floor(t*2) % 3));
   var FMT = [["16:9","Desktop"],["4:3","Surfplatta"],["9:16","Mobil"]];
   var cell = function(k, x, y, w){
     var cur = k === i;
     return vsite(D, 1 + k, x, y, w, FMT[k][0],
              'outline:'+(cur ? '2px solid '+T.oli : '1px solid '+T.line)+';'
              +'opacity:'+(cur?1:.5)+';')
      +'<div style="position:absolute;left:'+x+'cqw;top:'+(y + w*ratOf(FMT[k][0]) + 2).toFixed(2)+'cqw;'
      +'font-family:Montserrat,sans-serif;font-size:1.8cqw;font-weight:500;letter-spacing:.16em;'
      +'text-transform:uppercase;color:'+(cur?T.oli:T.mut)+'">'+esc(FMT[k][1]+" · "+FMT[k][0])+'</div>';
   };
   return mshell(D, mkick(D,"Ett bygge, alla ytor")
     + mrule(D, 30, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:33.5cqw">'
     + mdisp(D, "Samma sida, omsatt", 6.6) +'</div>'
     /* Höjderna följer förhållandet, så raderna måste räknas: 16:9 på 60
        blir 33,8 hög, 4:3 på 40 blir 30, 9:16 på 25 blir 44,4. Den sista
        är den som styr var brödtexten kan börja. */
     + cell(0, 6.4, 46, 60)
     + cell(1, 6.4, 88, 40)
     + cell(2, 52, 88, 25)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:139cqw">'
     + mbody(D, "Desktop, surfplatta och mobil är inte tre sidor. Det är en, som sätter om sig.",
             lerp(.45, 1, eOut(seg(t,.62,.9)))) +'</div>'
     + mfoot(D));
 },
 /* 04 STILLHET — sidan får stå för sig själv. Kontoret byts, inget annat. */
 stillhet:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .96, 4), i = ph.i;
   var w  = i>0 ? eInOut(Math.min(1, ph.local/.26)) : 1;
   var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
   var b = vbrand(i), pb = vbrand(i>0?i-1:0);
   var kick = function(x){
     return '<div style="font-family:Montserrat,sans-serif;font-size:2.15cqw;font-weight:500;'
      +'letter-spacing:.38em;text-transform:uppercase;color:'+T.oli+'">'+esc(x)+'</div>';
   };
   var Y = 58, W = 84, X = 8;
   return mshell(D,
     (i>0 ? vsite(D, i-1, X, Y, W, "4:3") : '')
   + vsite(D, i, X, Y, W, "4:3", w<1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '')
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:126cqw">'
   + mswap2(kick(pb.name), kick(b.name), sp) +'</div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:131.5cqw">'
   + mdisp(D, "Er visningssida", 8.4) +'</div>'
   + mmark(D));
 }
};
/* höjd/bredd för ett förhållande, som faktor */
function ratOf(ar){
  var q = (typeof AR !== "undefined" && AR[ar]) || [16,9];
  return q[1]/q[0];
}

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

/* ---------- 07 3D VISNING ----------
   Omritad kring vad produkten faktiskt är värd, inte kring hur den ser ut.

   Den förra versionen ritade en lägesväljare — Dollhouse, Planvy,
   Rundvandring — som om produkten vore ett gränssnitt. Det är en
   funktionslista, inte ett säljargument. Ingen mäklare köper en flikrad.

   Vad 3D-visningen faktiskt gör:

     · Bostaden är öppen dygnet runt. Ingen bokad tid, ingen söndag
       klockan tretton. Spekulanten går in när hen vill.
     · Fler når objektet. Den som bor i en annan stad, den som arbetar
       på helgen, den som inte vill anmäla sig innan hen sett något.
     · De som ändå kommer har redan gått igenom bostaden. Färre besök
       men bättre, och frågorna handlar om affären i stället för om
       planlösningen.
     · Måtten finns i sidan. Får soffan plats? Svaret finns utan
       måttband.
     · Länken är kontorets egen sida, inte en tredjepartsvisare. Den
       delas i annonsen, i mejlet, i SMS:et.

   Klockslagen nedan är hela argumentet i en bild: bostaden är öppen
   06:40, 14:15 och 23:20. Det är det en fysisk visning aldrig är. */
var T3D = [["06:40","Före jobbet"],["14:15","Från en annan stad"],["23:20","Efter läggdags"]];
var T3VAL = [
  ["Öppen dygnet runt",   "Ingen bokad tid. Spekulanten går in när det passar."],
  ["Fler når objektet",   "Den som bor långt bort ser bostaden ändå."],
  ["Bättre visningar",    "De som kommer har redan gått igenom hemmet."],
  ["Måtten finns i sidan","Får soffan plats? Svaret finns utan måttband."]
];

/* Klockan som en enkel urtavla — inget gränssnitt, bara en form. */
function m3clock(col, line, hh, mm){
  var a = (hh%12)/12*360 + mm/60*30, b = mm/60*360;
  var pt = function(deg, r){
    var v = (deg-90)*Math.PI/180;
    return (50+Math.cos(v)*r).toFixed(1)+' '+(50+Math.sin(v)*r).toFixed(1);
  };
  return '<svg viewBox="0 0 100 100" style="width:100%;height:100%;display:block" aria-hidden="true">'
   +'<circle cx="50" cy="50" r="42" fill="none" stroke="'+line+'" stroke-width="2"/>'
   +'<line x1="50" y1="50" x2="'+pt(a,22).split(" ")[0]+'" y2="'+pt(a,22).split(" ")[1]
   +'" stroke="'+col+'" stroke-width="4" stroke-linecap="round"/>'
   +'<line x1="50" y1="50" x2="'+pt(b,32).split(" ")[0]+'" y2="'+pt(b,32).split(" ")[1]
   +'" stroke="'+col+'" stroke-width="2.6" stroke-linecap="round"/>'
   +'<circle cx="50" cy="50" r="3" fill="'+col+'"/></svg>';
}

MK.tredim = {
 /* 01 EDITORIAL — samma bostad, tre klockslag. Sidan står still och bara
    tiden byts: det är precis vad en digital visning innebär. */
 editorial:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .96, 3), i = ph.i;
   var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
   var w  = i>0 ? eInOut(Math.min(1, ph.local/.26)) : 1;
   var prv = T3D[i>0?i-1:0], cur = T3D[i];
   var klock = function(x){
     var hh = +x[0].split(":")[0], mm = +x[0].split(":")[1];
     return '<div style="display:flex;align-items:center;gap:3.4cqw">'
      +'<span style="width:9cqw;height:9cqw;flex:0 0 9cqw">'+m3clock(T.oli, T.line, hh, mm)+'</span>'
      +'<span style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9cqw;'
      +'color:'+T.ink+'">'+esc(x[0])+'</span></div>';
   };
   return mshell(D, mkick(D,"3D visning · "+mo("addr"))
     + (i>0 ? vsite(D, 1, 6, 44, 88, "16:9") : '')
     + vsite(D, 1, 6, 44, 88, "16:9",
             w<1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '',
             {img: i===1 ? "threed" : i===2 ? "living" : "matterport"})
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:104cqw">'
     + mswap2(klock(prv), klock(cur), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:118cqw">'
     + mswap2(mbody(D, prv[1]), mbody(D, cur[1]), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:127cqw">'
     + mdisp(D, "Bostaden är alltid öppen.", 7.6) +'</div>'
     + mfoot(D));
 },
 /* 02 SYSTEM — de fyra argumenten, ett i taget tänt. Inte funktioner:
    effekter. Vad mäklaren faktiskt får ut av att sidan finns. */
 system:function(D, t){
   var T = mtone(D), now = mphN(t, .06, .94, 4).i;
   var rows = T3VAL.map(function(x, j){
     var on = j <= now, cur = j === now;
     /* Fyra rader efter en sida måste rymmas ovanför kolofonen: raden är
        därför 13 cqw hög, inte 16. Det är skillnaden mellan att gå ihop
        och att tryckas ur ramen. */
     return '<div style="display:flex;align-items:flex-start;gap:2.6cqw;padding:2cqw 0;'
      +'border-bottom:1px solid '+T.line+';opacity:'+(cur?1:on?.8:.36)+'">'
      +'<span style="width:1.2cqw;height:1.2cqw;border-radius:50%;margin-top:1.4cqw;flex:0 0 1.2cqw;'
      +'background:'+(on?T.oli:T.line)+'"></span>'
      +'<span><span style="display:block;font-family:\'Cormorant Garamond\',Georgia,serif;'
      +'font-weight:300;font-size:4.4cqw;line-height:1.1;color:'+T.ink+'">'+esc(x[0])+'</span>'
      +'<span style="display:block;font-family:Montserrat,sans-serif;font-size:2.35cqw;'
      +'line-height:1.55;margin-top:.8cqw;color:'+(T.dark?"#A8A6A0":"#4A4744")+'">'+esc(x[1])+'</span>'
      +'</span></div>';
   }).join("");
   return mshell(D, mkick(D,"Vad en 3D-visning ger")
     + mrule(D, 30, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:33.5cqw">'
     + mdisp(D, "Bostaden säljer medan du sover", 6.6) +'</div>'
     + vsite(D, 1, 6.4, 46, 52, "16:9", '', {img:"threed"})
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:80cqw">'+rows+'</div>'
     + mfoot(D));
 },
 /* 03 OBJECT — sidan i det närmaste full storlek. Leveransen får tala.
    Rubriken står på pappret, aldrig i bilden. */
 object:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .96, 3), i = ph.i;
   var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
   var w  = i>0 ? eInOut(Math.min(1, ph.local/.26)) : 1;
   var IM = ["matterport","threed","living"];
   var CAP = [["Gå in när du vill.","Sidan är öppen dygnet runt, inte söndag klockan tretton."],
              ["Gå igenom varje rum.","Hela bostaden, i ordning, i egen takt."],
              ["Mät medan du går.","Måtten finns i sidan. Får soffan plats?"]];
   var prv = CAP[i>0?i-1:0], cur = CAP[i];
   return mshell(D,
     '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+SAFE.top+'cqw;'
     +'font-family:Montserrat,sans-serif;font-size:2.25cqw;font-weight:500;letter-spacing:.24em;'
     +'text-transform:uppercase;color:'+T.oli+'">3D visning</div>'
   + (i>0 ? vsite(D, 1, 4, 30, 92, "4:3", '', {img:IM[i>0?i-1:0]}) : '')
   + vsite(D, 1, 4, 30, 92, "4:3", w<1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '',
           {img:IM[i]})
   +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:104cqw">'
   + mswap2(mdisp(D, prv[0], 8.2), mdisp(D, cur[0], 8.2), sp) +'</div>'
   +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:116cqw">'
   + mswap2(mbody(D, prv[1]), mbody(D, cur[1]), sp) +'</div>'
   + mfoot(D));
 },
 /* 04 STILLHET — ett klockslag, en rad. Argumentet utan att argumentera. */
 stillhet:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .96, 3), i = ph.i;
   var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
   var w  = i>0 ? eInOut(Math.min(1, ph.local/.26)) : 1;
   var kick = function(x){
     return '<div style="font-family:Montserrat,sans-serif;font-size:2.15cqw;font-weight:500;'
      +'letter-spacing:.38em;text-transform:uppercase;color:'+T.oli+'">'+esc(x)+'</div>';
   };
   return mshell(D,
     (i>0 ? vsite(D, 1, 8, 44, 84, "4:3", '', {img:"matterport"}) : '')
   + vsite(D, 1, 8, 44, 84, "4:3", w<1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '',
           {img:"matterport"})
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:120cqw">'
   + mswap2(kick(T3D[i>0?i-1:0][0]+" · "+T3D[i>0?i-1:0][1]),
            kick(T3D[i][0]+" · "+T3D[i][1]), sp) +'</div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:126cqw">'
   + mdisp(D, "Alltid öppen", 8.4) +'</div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:138cqw">'
   + mbody(D, "Bostaden går att uppleva när som helst.") +'</div>'
   + mmark(D));
 }
};

/* ---------------------------------------------------------------------
   BILDPLATSER I RÖRELSE

   Rörelsens bilder gick inte att byta. Nycklarna låg inbakade i
   renderarna, och en av dem — push-in-bilden i Motion — gick rakt på
   mediaURL() förbi hela slotsystemet. Editorn hade därför ingenting att
   erbjuda, och den som ville byta bild kunde inte.

   Nu har varje kandidat en namngiven uppsättning platser. msrc() slår
   upp platsen i SLOTS först och faller tillbaka på originalnyckeln, så
   allt ser likadant ut tills någon byter — precis som Storyns bildplats.
   --------------------------------------------------------------------- */
var MSLOTS = {
  annons: ANIM6.map(function(k, j){ return {s:"m-"+k, k:k, n:"Underlag "+(j+1)} }),
  motion: [{s:"m-mo1", k:"living",  n:"Första bilden"},
           {s:"m-mo2", k:"dining",  n:"Push-in / andra"},
           {s:"m-mo3", k:"dining2", n:"Slutbilden"}],
  estyl:  [{s:"m-w1",  k:"esLivBef", n:"Före"},
           {s:"m-w2",  k:"esLivAft", n:"Efter"}],
  /* kampanj och format fylls i vid uppslag — POSTS lastas i ett senare
     script än det här och finns inte när filen körs igenom */
  kampanj:null,
  format: null,
  white:  [{s:"m-site-hero", k:"matterport", n:"Bostaden i sidan"}],
  /* 3D-visningen ritar numera den faktiska visningssidan, och den har
     en bild — bostaden. Lägesväljaren är borta. */
  tredim: [{s:"m-site-hero", k:"matterport", n:"Bostaden i sidan"}]
};
function mslotKey(slot, fallback){
  var o = SLOTS[slot];
  return (o && o.img) || fallback;
}
function msrc(slot, fallback){ return mediaURL(mslotKey(slot, fallback)) || "" }
function mfy(slot, def){ var o = SLOTS[slot] || {}; return o.fy != null ? o.fy : (def == null ? .5 : def) }
/* En bild med egen skala — används av push-in och av Stillhet. Går genom
   samma plats som allt annat, så bytet slår igenom här också. */
function mzoom(slot, k, x, y, w, h, zoom, fyOver, extra){
  var u = msrc(slot, k), fy = (fyOver == null ? mfy(slot) : fyOver) * 100;
  var inner = u
    ? 'background-image:url('+u+');background-size:'+(zoom*100).toFixed(2)+'% auto;'
      +'background-position:50% '+fy.toFixed(1)+'%;'
    : 'background:repeating-linear-gradient(135deg,#DAD6D0 0 8px,#D2CDC6 8px 16px);';
  return '<div style="position:absolute;left:'+x+'cqw;top:'+y+'cqw;width:'+w+'cqw;height:'+h
   +'cqw;overflow:hidden;'+(extra||'')+'"><div style="position:absolute;inset:0;'+inner+'"></div></div>';
}
/* Vilken plats hör en viss kandidat till? Editorn frågar den här. */
function mslotsOf(cand){
  if(cand === "kampanj"){
    return POSTS.map(function(p){ return {s:"post-"+p.id, k:p.m, n:"Mall · "+p.phase} });
  }
  if(cand === "format"){
    var p2 = POSTS.filter(function(x){ return x.id==="p2" })[0];
    return p2 ? [{s:"post-p2", k:p2.m, n:"Mallens bild"}] : [];
  }
  return MSLOTS[cand] || [];
}

/* =====================================================================
   04 · STILLHET — den lätta riktningen

   Referensen är svenska mäklares egna Stories, de som gör det bra.
   Fantastic Frank, Alvhem, Historiska Hem, Skeppsholmen. Titta på dem
   och räkna elementen: ett fotografi, en tunn ram, en rad text. Ofta
   adressen. Ibland ett litet spärrat ord — KOMMANDE, TILL SALU, SÅLD.
   Det är allt.

   De tre första riktningarna förklarar. De har rubrik, ingress, mätlinje
   och kolofon, för att de ska bevisa hur en produkt fungerar. Det är
   rätt för ett säljunderlag och fel för ett flöde. Stillhet är motsatsen:
   ingenting förklaras, ytan får vara tyst.

   Reglerna, och de gäller alla sju kandidaterna:
     · ETT fotografi, i passepartout med generös marginal
     · EN rörelse — en långsam inzoomning på 5,5 %, linjärt över hela
       klippet. Ingen ease, för ease läses som en webbanimation
     · EN rad satt typografi, plus ett litet spärrat ord ovanför
     · texten står HELT STILLA. Bara bilden rör sig
     · ingen ingress, ingen faktarad, ingen mätlinje, ingen kolofon i
       två spalter — bara ett litet märke centrerat i underkant
     · byten sker med mask, aldrig korsfade

   Det som gör den till en riktning och inte sju engångslayouter är att
   allt går genom mstill(). Kandidaterna byter bara ut bilden, ordet och
   raden.
   ===================================================================== */
var STILL = {
  X: 8, Y: 30, W: 84, H: 100,       /* passepartout — stående, som ramen på en vägg */
  KICK: 135.5, LINE: 140.5          /* ordet och raden, båda stilla */
};
/* Märket sitter uppe till vänster i litet format, som ett kontor sätter
   sin logotyp. Nertill hamnade det under Instagrams svarsfält, och utan
   satt bredd renderades SVG:n i sin naturliga storlek — ett jättemärke
   tvärs över plåten. */
function mmark(D){
  var T = mtone(D);
  return '<div style="position:absolute;left:8cqw;top:'+SAFE.top+'cqw;width:4.2cqw;opacity:.5">'
   + vmark(T.ink, T.oli, 'style="width:100%;height:auto;display:block"') +'</div>';
}
/* o = {slot, k, kick, line, t, zoom0, zoom1, prevKick, prevLine, swap, wipe} */
function mstill(D, o){
  var T = mtone(D), S = STILL;
  var z = lerp(o.zoom0 == null ? 1 : o.zoom0, o.zoom1 == null ? 1.055 : o.zoom1, mclamp(o.t));
  var sp = o.swap == null ? 1 : mclamp(o.swap);
  var kick = function(txt){
    return '<div style="font-family:Montserrat,sans-serif;font-size:2.15cqw;font-weight:500;'
     +'letter-spacing:.38em;text-transform:uppercase;color:'+T.oli+'">'+esc(txt)+'</div>';
  };
  var line = function(txt){
    return '<div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;color:'+T.ink+';'
     + dsize(txt, 8.4, SERIF) +'line-height:1.04">'+esc(txt)+'</div>';
  };
  /* bilden: den nya ligger under, den gamla dras bort med en mask */
  var img = o.wipe != null && o.wipe < 1
    ? mzoom(o.slot2, o.k2, S.X, S.Y, S.W, S.H, z)
      + mzoom(o.slot, o.k, S.X, S.Y, S.W, S.H, z,
              null, 'clip-path:inset(0 0 '+(o.wipe*100).toFixed(1)+'% 0);')
    : mzoom(o.slot, o.k, S.X, S.Y, S.W, S.H, z);
  return mshell(D, img
   +'<div style="position:absolute;left:'+S.X+'cqw;right:'+S.X+'cqw;top:'+S.Y+'cqw;height:'+S.H
   +'cqw;outline:1px solid '+(T.dark ? "rgba(239,237,231,.16)" : "rgba(28,28,30,.10)")+';pointer-events:none"></div>'
   +'<div style="position:absolute;left:'+S.X+'cqw;right:'+S.X+'cqw;top:'+S.KICK+'cqw">'
   + (o.prevKick != null ? mswap2(kick(o.prevKick), kick(o.kick), sp) : kick(o.kick)) +'</div>'
   +'<div style="position:absolute;left:'+S.X+'cqw;right:'+S.X+'cqw;top:'+S.LINE+'cqw">'
   + (o.prevLine != null ? mswap2(line(o.prevLine), line(o.line), sp) : line(o.line)) +'</div>'
   + mmark(D));
}

/* ---- 01 Annonsskrivaren: den färdiga rubriken, inte verktyget ---- */
MK.annons.stillhet = function(D, t){
  return mstill(D, {slot:"m-living", k:"living", t:t,
    kick:"Annonsen", line:mo("head")});
};
/* ---- 02 Motion: en enda långsam inzoomning. Det ÄR produkten ---- */
MK.motion.stillhet = function(D, t){
  return mstill(D, {slot:"m-mo2", k:"dining", t:t, zoom1:1.09,
    kick:"Rörlig bild", line:mo("addr")});
};
/* ---- 03 E-styling: tomt blir möblerat under en mask ---- */
MK.estyl.stillhet = function(D, t){
  var w = 1 - eInOut(seg(t, .26, .74));
  return mstill(D, {slot:"m-w1", k:"esLivBef", slot2:"m-w2", k2:"esLivAft",
    wipe:w, t:t, swap:seg(t,.62,.84),
    kick:"E-styling", prevLine:"Tomt", line:"Möblerat"});
};
/* ---- 04 Kampanjen: ordet byts, adressen står still ----
   Det här är precis det svenska mäklare gör: en bild, ett ord, adressen. */
MK.kampanj.stillhet = function(D, t){
  var ph = mphN(t, 0, .96, 4), i = ph.i;
  var pp = mpost(MPH4[i]), pv = mpost(MPH4[i > 0 ? i-1 : 0]);
  return mstill(D, {
    slot:"post-"+MPH4[i], k:pp.m,
    slot2:"post-"+MPH4[i>0?i-1:0], k2:pv.m,
    wipe: i>0 ? 1 - eInOut(Math.min(1, ph.local/.24)) : 0,
    t:t, swap: i>0 ? Math.min(1, ph.local/.34) : 1,
    prevKick: MPCAP[i>0?i-1:0][0], kick: MPCAP[i][0],
    prevLine: pv.addr, line: pp.addr});
};
/* ---- 05 Format: samma bild, ramen byter proportion ----
   Enda kandidaten där passepartouten själv rör sig, eftersom ytan är
   ämnet. Bilden står still i stället. */
MK.format.stillhet = function(D, t){
  var T = mtone(D), ph = mphN(t, 0, .96, 3), i = ph.i;
  var f = FMT3[i], pf = FMT3[i>0?i-1:0];
  var m  = i>0 ? eInOut(Math.min(1, ph.local/.26)) : 1;
  var sp = i>0 ? Math.min(1, ph.local/.34) : 1;
  var H = 100, Y = 30;
  var w = lerp(H*pf[3]/pf[4], H*f[3]/f[4], m), x = (100-w)/2;
  var kick = function(txt){
    return '<div style="font-family:Montserrat,sans-serif;font-size:2.15cqw;font-weight:500;'
     +'letter-spacing:.38em;text-transform:uppercase;color:'+T.oli+'">'+esc(txt)+'</div>';
  };
  var line = function(txt){
    return '<div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;color:'+T.ink+';'
     + dsize(txt, 8.4, SERIF) +'line-height:1.04">'+esc(txt)+'</div>';
  };
  return mshell(D,
    mzoom("post-p2", "kitchen", x, Y, w, H, 1.04)
   +'<div style="position:absolute;left:'+x.toFixed(2)+'cqw;top:'+Y+'cqw;width:'+w.toFixed(2)+'cqw;height:'+H
   +'cqw;outline:1px solid '+(T.dark?"rgba(239,237,231,.16)":"rgba(28,28,30,.10)")+'"></div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:'+STILL.KICK+'cqw">'
   + mswap2(kick(pf[1]+" · "+pf[0]), kick(f[1]+" · "+f[0]), sp) +'</div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:'+STILL.LINE+'cqw">'
   + line(mo("addr")) +'</div>'
   + mmark(D));
};
/* ---- 06 White label: kontorets namn byts, bilden är densamma ---- */
MK.white.stillhet = function(D, t){
  var ph = mphN(t, 0, .96, 3), i = ph.i;
  return mstill(D, {slot:"m-site-hero", k:"matterport", t:t,
    swap: i>0 ? Math.min(1, ph.local/.34) : 1,
    prevKick: mwb()[i>0?i-1:0][2], kick: mwb()[i][2],
    line:mo("addr")});
};
/* ---- 07 3D visning: rummet, långsamt ---- */
MK.tredim.stillhet = function(D, t){
  return mstill(D, {slot:"m-3d-2", k:"matterport", t:t, zoom1:1.07,
    kick:"3D visning", line:"Gå igenom bostaden"});
};

/* ---------------------------------------------------------------------
   OBJEKTET I RÖRELSE

   Adressen, orten, ytan, rubriken och kontorsnamnen låg som strängar
   rakt i renderarna. Bilderna gick att byta, texten gick inte. Man kunde
   alltså inte visa en demo för en riktig bostad.

   Nu läser varje rörelse sina uppgifter härifrån. Upplösningen sker i
   tre steg, så att det finns ETT värde och inte tre:

     1  MTX     — skrivet i studions panel Objektet i rörelse
     2  PEDITS  — objektpanelen i vy 04, om fältet finns där
     3  MOBJ    — bibliotekets standardobjekt

   Skriver du adressen i vy 04 följer rörelsen med automatiskt. Skriver
   du den i rörelsepanelen vinner den, och bara för rörelsen.
   --------------------------------------------------------------------- */
var MOBJ = {
  addr:"Silvergården 9A", city:"Landskrona", distr:"Kv. Sanden",
  rooms:"4 rum", area:"112 m²", year:"1968", typ:"Bostadsrätt",
  head:"Ljuset som gör skillnad",
  b1:"Nordvik", b2:"Alvhem", b3:"Lagerlings"
};
var MTX = {};
/* PEDITS bär adress och ort på mallarna — läs den innan standardvärdet */
function mpedit(k){
  if(typeof PEDITS === "undefined") return null;
  for(var i = 0; i < POSTS.length; i++){
    var e = PEDITS[POSTS[i].id];
    if(e && e[k]) return e[k];
  }
  return null;
}
function mo(k){
  var v = MTX[k];
  if(v != null && v !== "") return v;
  if(k === "addr" || k === "city"){ var p = mpedit(k); if(p) return p }
  return MOBJ[k];
}
/* siffran ur ett fält: "4 rum" -> "4", "112 m²" -> "112" */
function monum(k){ var m = String(mo(k)).match(/\d+([.,]\d+)?/); return m ? m[0] : mo(k) }
var MOFIELDS = [
  {k:"addr",  n:"Adress"},      {k:"city",  n:"Ort"},
  {k:"distr", n:"Stadsdel"},    {k:"typ",   n:"Bostadstyp"},
  {k:"rooms", n:"Antal rum"},   {k:"area",  n:"Boarea"},
  {k:"year",  n:"Byggår"},      {k:"head",  n:"Annonsrubrik"},
  {k:"b1",    n:"Kontor A"},    {k:"b2",    n:"Kontor B"},
  {k:"b3",    n:"Kontor C"}
];
/* vilka fält en kandidat faktiskt visar — panelen ska inte be om mer */
var MOUSE = {
  annons: ["addr","city","distr","typ","rooms","area","head"],
  motion: ["addr"],
  estyl:  [],
  kampanj:["addr","city","rooms","area","year"],
  format: ["addr","city","rooms","area","year"],
  /* visningssidan visar adressen och kontoret — inte faktaraden */
  white:  ["addr","b1","b2","b3"],
  tredim: ["addr"]
};
function mofieldsOf(cand){
  var use = MOUSE[cand] || [];
  return MOFIELDS.filter(function(f){ return use.indexOf(f.k) >= 0 });
}
/* Kampanjmallarna i rörelse: PEDITS först, rörelsens objekt sist, så att
   adressen bara behöver skrivas på ett ställe. */
function mpost(id){
  var p = null;
  for(var j = 0; j < POSTS.length; j++){ if(POSTS[j].id === id) p = POSTS[j] }
  if(!p) return null;
  var q = Object.assign({}, p, (typeof PEDITS !== "undefined" && PEDITS[p.id]) || {});
  q.addr = mo("addr"); q.city = mo("city");
  if(q.facts) q.facts = [[monum("rooms"),"rum och kök"],
                         [monum("area"),"kvadratmeter"],
                         [mo("year"),"byggår"]];
  return q;
}

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
/* Stillhet håller samma längd oavsett kandidat — lugnet är poängen, och
   en inzoomning på 5,5 % behöver tid för att läsas som rörelse alls. */
var MDURX = {stillhet:8.0, kampanj_stillhet:9.6};
function durOf(cand, dir){ return MDURX[cand+"_"+dir] || MDURX[dir] || MDUR[cand] || 6 }

function motionOf(sid){
  var c = MSID[sid], d = MPICK[sid];
  return (c && d && MK[c] && MK[c][d]) ? {cand:c, dir:d, dur:durOf(c,d)} : null;
}
function motionFrame(dirId, sid, t){
  var m = motionOf(sid); if(!m) return null;
  return MK[m.cand][m.dir](dirId, mclamp(t));
}
