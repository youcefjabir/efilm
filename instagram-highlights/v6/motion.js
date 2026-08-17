/* =====================================================================
   07 · MOTION — audit och keyframes

   Ingenting här animeras. Sektionen finns för att kunna JÄMFÖRA riktningar
   innan någon animationsarkitektur byggs: varje kandidat visas som tre
   designriktningar × tre stillbilder — startbild, nyckelbild, slutbild.

   Stage-parametern är ett designtillstånd, inte en tidsaxel. Den säger
   "så här ser kompositionen ut när tre av sex signaler är lästa", inte
   "det här händer vid 1,4 s". Tidsättningen ligger i storyboarden.
   ===================================================================== */

/* ---------- audit ---------- */
var MAUDIT = [
 /* primitiv, klass, syfte, motivering, vad som rör sig, vad som står still */
 {p:"flow", n:"Flow", k:"A", use:"annonsen-2",
  purpose:"Input → bearbetning → resultat. Annonsskrivarens hela kedja.",
  why:"Ett förlopp som ritas som ett diagram ber tittaren själv föreställa sig tiden. Rörelse behöver inte läggas på — den finns redan i innehållet.",
  move:"Bilderna matas in, signalerna tänds en och en, texten sätts rad för rad.",
  still:"Rutnätet, kolumnbredden, typskalan och kickern."},
 {p:"split", n:"Split", k:"A", use:"estyling-2, estyling-3, atmosphere-2, atmosphere-3, motion-2",
  purpose:"Före och efter på samma bostad.",
  why:"Två bilder bredvid varandra tvingar ögat att jämföra i minnet. En wipe lägger förändringen på SAMMA pixlar — det är mätbart lättare att läsa, och det är hela tjänstens bevis.",
  move:"Wipe-kanten. Ingenting annat.",
  still:"Etiketterna, ramen, rubriken. Bilderna får inte panorera under wipen."},
 {p:"matrix", n:"Format matrix", k:"A", use:"motion-4, kampanjen-2",
  purpose:"Samma objekt i 9:16, 4:5 och 1:1.",
  why:"Poängen är att ETT material blir TRE ytor. Statiskt visas tre rutor och man får själv anta släktskapet; i rörelse ser man att det är samma bild som beskärs om.",
  move:"En bild delar sig i tre format som växer ut till sina proportioner.",
  still:"Måttsättningen och formatnamnen — de är fakta, inte effekt."},
 {p:"phases", n:"Phases", k:"A", use:"kampanjen-3",
  purpose:"Kommande → Till salu → Visning → Såld.",
  why:"Kampanjen ÄR en tidsaxel. Fyra miniatyrer bredvid varandra är en lista; i rörelse blir det ett förlopp med en riktning.",
  move:"Statusen vandrar. Varje mall tänds när den blir aktuell.",
  still:"Adressen, faktaraden och bilden — det är samma objekt hela vägen, och det är poängen."},
 {p:"whitelabel", n:"White label", k:"A", use:"visning-3, omradeskarta-3",
  purpose:"Samma leverans i kundens varumärke.",
  why:"Påståendet är att uttrycket byts men innehållet står still. Det går inte att bevisa med två kort bredvid varandra — det bevisas av att man ser bytet ske.",
  move:"Logotyp, färg och knappstil byts. Innehållet står kvar orört.",
  still:"Layouten, bilden, textmassan. Om något av det rör sig faller argumentet."},
 {p:"product", n:"Product moment", k:"A", use:"visning-2 (3D)",
  purpose:"Ren presentation av 3D-visningen.",
  why:"Rumslig förståelse är den enda sak som verkligen kräver rörelse. En planritning som reser sig till volym förklarar Matterport på två sekunder.",
  move:"Plan → volym. En enda kontrollerad kamerarörelse.",
  still:"Hörnmarkeringarna, rubriken, brödtexten.",
  note:"Bara för 3D. Samma primitiv på portalen (systemet-1, systemet-4) är B."},

 {p:"system", n:"System", k:"B", use:"8 bildrutor",
  purpose:"Numrerad ryggrad.",
  why:"Legitimt när posterna är STEG (Boka → Produktion → Leverans → Publicera). Meningslöst när de är en uppräkning av jämbördiga tjänster — då är ordningen inte innehåll.",
  move:"Vid steg: posterna tonar in i ordning, 90 ms isär.",
  still:"Vid uppräkning: allt. Låt den vara stilla."},
 {p:"mark", n:"Mark", k:"B", use:"8 bildrutor",
  purpose:"Logotypen som mask eller vattenmärke.",
  why:"En långsam skalning av fotografiet inuti V:et är smakfull men tillför ingen förståelse. Ren dekoration — tillåten som öppningsbild i en sekvens, aldrig mitt i.",
  move:"Fotografiet inuti masken, 4 % över 6 s. Aldrig masken själv.",
  still:"Geometrin. Logotypen skalas — den animeras inte."},
 {p:"fullbleed", n:"Full bleed", k:"B", use:"12 bildrutor",
  purpose:"Bilden äger ytan.",
  why:"Push-in är den mest använda och mest urvattnade effekten som finns. Fungerar när bildrutan är ett andningshål i en sekvens; blir billig i samma sekund den läggs på alla.",
  move:"Högst 3 % skala över hela klippet, linjärt.",
  still:"Typografin. Rör sig texten samtidigt som bilden blir det musikvideo."},
 {p:"case", n:"Case cover", k:"B", use:"objekt-0",
  purpose:"Objektet med kolofon.",
  why:"Samma bedömning som full bleed, men kolofonen gör den till en titelbild — och titelbilder tål en långsam rörelse.",
  move:"Bilden, mycket lite.",
  still:"Kolofonen."},

 {p:"quiet", n:"Quiet statement", k:"C", use:"16 bildrutor",
  purpose:"En mening som får bära.",
  why:"Hela primitivet är byggt på stillhet. Det finns ingenting att förklara och ingenting att demonstrera — bara en mening man ska hinna läsa. Animerar man den förstör man exakt det den är till för.",
  move:"Ingenting.",
  still:"Allt."},
 {p:"editorial", n:"Editorial", k:"C", use:"14 bildrutor",
  purpose:"Kontrollerad typografi i komponerad relation till bilden.",
  why:"Kompositionen ÄR budskapet. Varje rörelse bryter den relation som primitivet finns till för att hålla.",
  move:"Ingenting.",
  still:"Allt."},
 {p:"cta", n:"CTA", k:"C", use:"14 bildrutor",
  purpose:"Slutbilden.",
  why:"En uppmaning ska landa, inte röra sig. Sista bildrutan i en sekvens är den enda tittaren står still inför — där ska ingenting konkurrera.",
  move:"Ingenting.",
  still:"Allt."},
 {p:"cover", n:"Omslagen (alla tre system)", k:"C", use:"14 kapitel",
  purpose:"Kapitelmärket i profilraden.",
  why:"Instagram visar omslaget som en STILLBILD i en cirkel, 56 px. Plattformen spelar inte upp det. Att animera exportfilen är inte återhållsamhet — det är arbete som aldrig når någon.",
  move:"Ingenting. Tekniskt omöjligt i den yta märket visas.",
  still:"Allt."},
 {p:"post", n:"Kampanjmallarna p1–p4 som inlägg", k:"C", use:"4 mallar × 3 format",
  purpose:"Inlägg och annonsmaterial.",
  why:"De exporteras som JPG/PNG till flöde och annonsköp. Som Story täcks förloppet redan av phases; som inlägg finns ingen tidsaxel att röra sig i.",
  move:"Ingenting.",
  still:"Allt."}
];

/* ---------- de utvalda kandidaterna ---------- */
var MCAND = [
 {id:"annons", num:"01", n:"Annonsskrivaren", ref:["annonsen",2], prim:"flow",
  claim:"Färdig bostadsannons på 30 sekunder.",
  rank:"Starkast i hela biblioteket. Produkten är ett förlopp, och förloppet är osynligt i en stillbild."},
 {id:"motion", num:"02", n:"Motion", ref:["motion",2], prim:"split",
  claim:"Bostadsfilm, byggd av fotograferingen.",
  rank:"Produkten ÄR rörelse. Att sälja den med en stillbild är att visa fel sak."},
 {id:"estyl", num:"03", n:"E-styling", ref:["estyling",2], prim:"split",
  claim:"Vi skapar liv i tomma rum.",
  rank:"Före/efter på samma pixlar. Den enda bildruta där rörelse gör beviset mätbart tydligare."},
 {id:"kampanj", num:"04", n:"Kampanjfaserna", ref:["kampanjen",3], prim:"phases",
  claim:"Fyra mallar. En kampanj.",
  rank:"Innehållet är en tidsaxel. Statiskt blir det en lista över mallar."},
 {id:"format", num:"05", n:"Ett objekt, tre format", ref:["kampanjen",2], prim:"matrix",
  claim:"Samma mall exporterar samtliga.",
  rank:"Släktskapet mellan formaten är hela argumentet, och det syns bara när de växer ur samma bild."},
 {id:"white", num:"06", n:"White label", ref:["visning",3], prim:"whitelabel",
  claim:"Levereras i ert varumärke.",
  rank:"Ett påstående som bara går att bevisa genom att visa bytet."},
 {id:"tredim", num:"07", n:"3D — plan till volym", ref:["visning",2], prim:"product",
  claim:"Dollhouse och planritning.",
  rank:"Rumslig förståelse är det enda som genuint kräver rörelse."}
];

/* =====================================================================
   KEYFRAMES
   Tre riktningar, tre bilder var. Riktningarna är samma tre genom hela
   uppsättningen så att kandidaterna går att jämföra mot varandra.
   ===================================================================== */
var MDIRS = [
 {id:"editorial", n:"01 · Editorial reveal",
  d:"Mycket luft. Stor typografi. Innehållet avslöjas genom masker och beskärningar. Magasinets kampanjuppslag."},
 {id:"system", n:"02 · System / process",
  d:"Visar hur Viewly arbetar. Tunna linjer, rutnät, rena geometriska element. Ingen HUD, inga sken."},
 {id:"object", n:"03 · Object / material",
  d:"Materialet är huvudpersonen. Fotografi, plan eller text byggs upp framför tittaren. Gränssnitt bara där det förklarar."}
];

function mtone(){
  var d = state.dir === "skugga";
  return {dark:d, paper:d?"#0E0E0D":"#F2EFEF", ink:d?"#EFEDE7":"#1C1C1E",
          mut:d?"#8C8A84":"#8A8580", line:d?"#2A2A27":"#D8D2CF",
          oli:d?"#98A088":"#6E7266", plate:d?"#17171A":"#FFFFFF"};
}
function mshell(inner){
  var T = mtone();
  return '<div class="'+(T.dark?"b":"a")+'" style="background:'+T.paper+'">'+inner+'</div>';
}
function mkick(t){
  var T = mtone();
  return '<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;font-family:Montserrat,sans-serif;'
   +'font-size:2.25cqw;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:'+T.oli+'">'+esc(t)+'</div>';
}
function mfoot(lab){
  var T = mtone();
  return '<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+SAFE.bot+'cqw;display:flex;'
   +'justify-content:space-between;align-items:baseline;font-family:Montserrat,sans-serif;font-size:2.05cqw;'
   +'letter-spacing:.2em;text-transform:uppercase;color:'+T.mut+'"><span>VIEWLY</span><span>'+esc(lab)+'</span></div>';
}
/* en rad tunna mätlinjer — systemriktningens enda dekor */
function mrule(y, x1, x2, o){
  var T = mtone();
  return '<div style="position:absolute;left:'+x1+'cqw;right:'+x2+'cqw;top:'+y+'cqw;height:1px;background:'
   +T.line+(o?';opacity:'+o:'')+'"></div>';
}
function mbar(x,y,w,h,c,o){
  return '<div style="position:absolute;left:'+x+'cqw;top:'+y+'cqw;width:'+w+'cqw;height:'+h+'cqw;background:'
   +c+(o!=null?';opacity:'+o:'')+'"></div>';
}
function mimg(k, x, y, w, h, extra){
  return '<div style="position:absolute;left:'+x+'cqw;top:'+y+'cqw;width:'+w+'cqw;height:'+h+'cqw;'
   +'overflow:hidden;'+(extra||'')+'"><div style="position:absolute;inset:0;'+bg(k,"m-"+k)+'"></div></div>';
}
function mdisp(t, cap){
  var T = mtone();
  return '<div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;color:'+T.ink+';'
   + dsize(t, cap||9.6, SERIF) +'line-height:1.02">'+esc(t)+'</div>';
}
function mbody(t){
  var T = mtone();
  return '<div style="font-family:Montserrat,sans-serif;font-weight:400;font-size:2.9cqw;line-height:1.6;color:'
   +(T.dark?"#A8A6A0":"#4A4744")+'">'+esc(t)+'</div>';
}

/* ---------------------------------------------------------------------
   01 ANNONSSKRIVAREN
   --------------------------------------------------------------------- */
var MK = {};
MK.annons = {
 editorial:function(s){
   var T=mtone(), ims=["hero","kitchen","living","dining","boucle","eames"];
   /* s0 tomt uppslag · s1 bilderna faller in · s2 texten satt */
   var strip = ims.map(function(k,j){
     var on = s>=1;
     return '<div style="position:absolute;left:'+(6.4+j*14.8)+'cqw;top:'+(s>=2?47:(s>=1?34:41))+'cqw;width:13cqw;height:17cqw;'
      +'overflow:hidden;opacity:'+(on?(s>=2?.34:1):0)+'"><div style="position:absolute;inset:0;'+bg(k,"m-"+k)+'"></div></div>';
   }).join("");
   var text = s>=2 ? '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:60cqw">'
      + mdisp("Ljuset som gör skillnad", 9.2)
      +'<div style="height:3cqw"></div>'
      + mbody("Fyra rum med genomgående planlösning och eftermiddagssol rakt in i vardagsrummet.")
      +'</div>' : '';
   return mshell(mkick("Annonsskrivaren")
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(s>=2?31:56)+'cqw">'
     + mdisp(s>=2 ? "Färdig." : "Sex bilder in.", 10.4) +'</div>'
     + strip + text + mfoot(["Start","Nyckel","Slut"][s]));
 },
 system:function(s){
   var T=mtone(), sig=["Ljusinsläpp","Takhöjd och volym","Material och ytskikt","Planlösning","Utsikt och läge","Områdets karaktär"];
   var lit = s===0?0 : s===1?3 : 6;
   var rows = sig.map(function(t,j){
     var on = j<lit;
     return '<div style="display:flex;align-items:center;gap:2.4cqw;padding:1.9cqw 0">'
      +'<span style="width:1.6cqw;height:1.6cqw;border-radius:50%;background:'+(on?T.oli:T.line)+';flex:0 0 auto"></span>'
      +'<span style="font-family:Montserrat,sans-serif;font-size:2.5cqw;letter-spacing:.02em;color:'
      +(on?T.ink:T.mut)+'">'+esc(t)+'</span></div>';
   }).join("");
   return mshell(mkick("Så läses bilderna")
     + mrule(30.5, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:36cqw">'+ mdisp("Sex signaler", 8.4) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:52cqw">'+rows+'</div>'
     + mrule(108, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:113cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.3cqw;letter-spacing:.16em;text-transform:uppercase;color:'+T.mut+'">'
     + (s===0?"Väntar på underlag":s===1?"Läser 3 av 6":"Utkast klart") +'</div>'
     + (s>=2 ? '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:120cqw">'
        + mdisp("Ljuset som gör skillnad", 6.4)+'</div>' : '')
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 object:function(s){
   var T=mtone();
   var lines=[97,100,88,64].slice(0, s===0?0 : s===1?2 : 4);
   return mshell(
     mimg("kitchen", 0, 0, 100, s>=2?52:88)
     + mkick("Annonsskrivaren")
     +'<div style="position:absolute;left:0;right:0;bottom:0;top:'+(s>=2?52:88)+'cqw;background:'+T.paper+'"></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(s>=2?60:96)+'cqw">'
     + (s>=1 ? mdisp("Ljuset som gör skillnad", 8.2) : mdisp("Utkast", 8.2))
     +'<div style="height:2.6cqw"></div>'
     + lines.map(function(w){ return '<div style="height:1.5cqw;width:'+w+'%;background:'+T.line+';margin-bottom:1.6cqw"></div>' }).join("")
     +'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 }
};

/* ---------------------------------------------------------------------
   02 MOTION — stillbild till film
   --------------------------------------------------------------------- */
MK.motion = {
 editorial:function(s){
   var T=mtone();
   var z = [1, 1.06, 1.13][s], fy=[.5,.46,.42][s];
   return mshell(
     '<div style="position:absolute;left:0;right:0;top:26cqw;height:96cqw;overflow:hidden">'
     +'<div style="position:absolute;inset:0;background-image:url('+(mediaURL("dining")||"")+');background-size:'
     +(z*100).toFixed(1)+'% auto;background-position:50% '+(fy*100)+'%"></div></div>'
     + mkick("Motion")
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:132cqw">'
     + mdisp(["Stillbilden.","Rörelsen.","Filmen."][s], 10.6)+'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 system:function(s){
   var T=mtone();
   var steps=["Bilderna","Rörelsen","Redigeringen","Filmen"];
   var w=[8,44,80][s];
   return mshell(mkick("Så byggs filmen")
     + mimg("dining", 6.4, 30, 87.2, 49)
     /* beskärningsramen som vandrar — systemriktningens enda rörelse */
     +'<div style="position:absolute;left:'+(6.4+(87.2-40)*(s/2))+'cqw;top:34cqw;width:40cqw;height:41cqw;'
     +'border:1px solid '+T.oli+'"></div>'
     + mrule(88, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:94cqw;display:flex;justify-content:space-between">'
     + steps.map(function(t,j){ return '<span style="font-family:Montserrat,sans-serif;font-size:2.2cqw;'
        +'letter-spacing:.14em;text-transform:uppercase;color:'+(j<=s?T.ink:T.mut)+'">'+esc(t)+'</span>' }).join("")
     +'</div>'
     +'<div style="position:absolute;left:6.4cqw;top:101cqw;width:'+w+'cqw;height:2px;background:'+T.oli+'"></div>'
     + mrule(103, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:112cqw">'+mdisp("En film, tre format", 7.2)+'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 object:function(s){
   var T=mtone();
   return mshell(
     mimg(["living","dining","dining2"][s], 0, 0, 100, 177.8)
     +'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,14,13,.34),rgba(14,14,13,0) 34%,rgba(14,14,13,.62))"></div>'
     +'<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.25cqw;letter-spacing:.24em;text-transform:uppercase;color:#98A088">Motion</div>'
     + (s>=1 ? '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:15cqw;height:15cqw;'
        +'border-radius:50%;background:rgba(239,237,231,'+(s===1?".92":".18")+');display:grid;place-items:center">'
        +'<span style="width:0;height:0;border-left:5cqw solid '+(s===1?"#1C1C1E":"#EFEDE7")
        +';border-top:3.2cqw solid transparent;border-bottom:3.2cqw solid transparent;margin-left:1.4cqw"></span></div>' : '')
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+8)+'cqw;color:#EFEDE7">'
     +'<div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9cqw;line-height:1">'
     + esc(["Bilderna finns redan.","Rörelsen läggs på.","Filmen är klar."][s]) +'</div></div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 }
};

/* ---------------------------------------------------------------------
   03 E-STYLING — wipe på samma pixlar
   --------------------------------------------------------------------- */
MK.estyl = {
 editorial:function(s){
   var T=mtone(), pct=[0,52,100][s];
   return mshell(mkick("E-styling")
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:34cqw;height:76cqw;overflow:hidden">'
     +'<div style="position:absolute;inset:0;'+bg("esLivBef","m-b")+'"></div>'
     +'<div style="position:absolute;inset:0;clip-path:inset(0 '+(100-pct)+'% 0 0)">'
     +'<div style="position:absolute;inset:0;'+bg("esLivAft","m-a")+'"></div></div>'
     + (s===1 ? '<div style="position:absolute;top:0;bottom:0;left:'+pct+'%;width:1px;background:#EFEDE7"></div>' : '')
     +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:120cqw">'
     + mdisp(["Tomt.","","Möblerat."][s] || " ", 10.8) +'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 system:function(s){
   var T=mtone(), pct=[0,52,100][s];
   return mshell(mkick("Före och efter")
     + mrule(30.5, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:38cqw;height:70cqw;overflow:hidden;'
     +'border:1px solid '+T.line+'">'
     +'<div style="position:absolute;inset:0;'+bg("esLivBef","m-b2")+'"></div>'
     +'<div style="position:absolute;inset:0;clip-path:inset(0 '+(100-pct)+'% 0 0)">'
     +'<div style="position:absolute;inset:0;'+bg("esLivAft","m-a2")+'"></div></div>'
     +'<div style="position:absolute;top:0;bottom:0;left:'+pct+'%;width:1px;background:'+T.oli+'"></div></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:112cqw;display:flex;justify-content:space-between;'
     +'font-family:Montserrat,sans-serif;font-size:2.2cqw;letter-spacing:.16em;text-transform:uppercase">'
     +'<span style="color:'+(pct<50?T.ink:T.mut)+'">Original</span>'
     +'<span style="color:'+T.oli+'">'+pct+' %</span>'
     +'<span style="color:'+(pct>=50?T.ink:T.mut)+'">E-stylat</span></div>'
     + mrule(120, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:127cqw">'
     + mbody("Inga väggar flyttas. Möbleringen läggs till digitalt.")+'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 object:function(s){
   var pct=[0,52,100][s];
   return mshell(
     '<div style="position:absolute;inset:0;overflow:hidden">'
     +'<div style="position:absolute;inset:0;'+bg("esLivBef","m-b3")+'"></div>'
     +'<div style="position:absolute;inset:0;clip-path:inset(0 '+(100-pct)+'% 0 0)">'
     +'<div style="position:absolute;inset:0;'+bg("esLivAft","m-a3")+'"></div></div></div>'
     +'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,14,13,.30),rgba(14,14,13,0) 30%,rgba(14,14,13,.55))"></div>'
     +'<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.25cqw;letter-spacing:.24em;text-transform:uppercase;color:#98A088">E-styling</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+6)+'cqw;color:#EFEDE7;'
     +'font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9.4cqw;line-height:1">'
     + esc(["Samma rum.","","Ny känsla."][s] || " ") +'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 }
};

/* ---------------------------------------------------------------------
   04 KAMPANJFASERNA
   --------------------------------------------------------------------- */
MK.kampanj = {
 editorial:function(s){
   var T=mtone(), names=["Kommande","Till salu","Visning","Såld"];
   return mshell(mkick("Kampanjen")
     + mimg(["hero","kitchen","living","drone"][s===2?3:s], 6.4, 32, 87.2, 62)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:104cqw">'
     + mdisp(names[s===2?3:s], 11.2)
     +'<div style="height:3cqw"></div>'
     + mbody("Silvergården 9A · Landskrona") +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:140cqw;display:flex;gap:1.4cqw">'
     + names.map(function(x,j){ var on = j <= (s===2?3:s);
        return '<span style="flex:1;height:2px;background:'+(on?T.oli:T.line)+'"></span>' }).join("")
     +'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 system:function(s){
   var T=mtone(), names=["Kommande","Till salu","Visning","Såld"], now=[0,2,3][s];
   var cards = names.map(function(x,j){
     var on = j<=now, cur = j===now;
     return '<div style="flex:1;display:flex;flex-direction:column;gap:1.6cqw;opacity:'+(on?1:.32)+'">'
      +'<div style="position:relative;aspect-ratio:9/16;overflow:hidden;border:1px solid '+(cur?T.oli:T.line)+'">'
      +'<div style="position:absolute;inset:0;'+bg(["hero","kitchen","living","drone"][j],"m-p"+j)+'"></div>'
      + (cur?'':'<div style="position:absolute;inset:0;background:'+T.paper+';opacity:.55"></div>')+'</div>'
      +'<span style="font-family:Montserrat,sans-serif;font-size:1.9cqw;letter-spacing:.14em;text-transform:uppercase;'
      +'color:'+(cur?T.oli:T.mut)+'">'+esc(x)+'</span></div>';
   }).join("");
   return mshell(mkick("Kampanjfaser")
     + mrule(30.5, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:38cqw">'+mdisp("En kampanj, fyra lägen", 7.6)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:62cqw;display:flex;gap:2.6cqw">'+cards+'</div>'
     + mrule(120, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:126cqw">'
     + mbody("Adressen och faktaraden står still. Bara mallen byts.")+'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 object:function(s){
   var T=mtone(), now=[0,2,3][s], names=["Kommande","Till salu","Visning","Såld"];
   return mshell(
     mimg(["hero","kitchen","living","drone"][now], 0, 0, 100, 177.8)
     +'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,14,13,.30),rgba(14,14,13,0) 32%,rgba(14,14,13,.70))"></div>'
     +'<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.25cqw;letter-spacing:.3em;text-transform:uppercase;color:#98A088">'+esc(names[now])+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+14)+'cqw;color:#EFEDE7">'
     +'<div style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9.6cqw;line-height:1">Silvergården 9A</div>'
     +'<div style="height:2.4cqw"></div>'
     +'<div style="font-family:Montserrat,sans-serif;font-size:2.3cqw;letter-spacing:.18em;text-transform:uppercase;color:#98A088">'
     +'4 rum · 112 m² · 1968</div></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+SAFE.bot+'cqw;display:flex;gap:1.2cqw">'
     + names.map(function(x,j){ return '<span style="flex:1;height:2px;background:'
        +(j<=now?"#98A088":"rgba(239,237,231,.28)")+'"></span>' }).join("")+'</div>');
 }
};

/* ---------------------------------------------------------------------
   05 ETT OBJEKT, TRE FORMAT
   --------------------------------------------------------------------- */
MK.format = {
 editorial:function(s){
   var T=mtone();
   var W=[[87.2,49],[52,65],[40,71]][s];
   return mshell(mkick("Formaten")
     +'<div style="position:absolute;left:50%;top:34cqw;transform:translateX(-50%);width:'+W[0]+'cqw;height:'+W[1]
     +'cqw;overflow:hidden"><div style="position:absolute;inset:0;'+bg("living","m-f")+'"></div></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:118cqw">'
     + mdisp(["Ett objekt.","Tre ytor.","Samma bild."][s], 10.6)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;top:146cqw;font-family:Montserrat,sans-serif;font-size:2.1cqw;'
     +'letter-spacing:.2em;text-transform:uppercase;color:'+T.mut+'">'+["4:5","1:1","9:16"][s]+'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 system:function(s){
   var T=mtone(), fmts=[["9:16",9,16],["4:5",4,5],["1:1",1,1]];
   var shown = s===0?1:s===1?2:3;
   var cards = fmts.slice(0,shown).map(function(f){
     return '<div style="display:flex;flex-direction:column;gap:1.6cqw">'
      +'<div style="position:relative;width:'+(20*f[1]/f[2]*(f[2]/f[1])*0+24)+'cqw;aspect-ratio:'+f[1]+'/'+f[2]
      +';overflow:hidden;border:1px solid '+T.line+'">'
      +'<div style="position:absolute;inset:0;'+bg("living","m-f2")+'"></div></div>'
      +'<span style="font-family:Montserrat,sans-serif;font-size:1.9cqw;letter-spacing:.16em;color:'+T.mut+'">'
      + f[0]+'</span></div>';
   }).join("");
   return mshell(mkick("Ett objekt, alla format")
     + mrule(30.5, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:38cqw">'+mdisp("Samma mall exporterar samtliga", 7)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:66cqw;display:flex;gap:3cqw;align-items:flex-end">'
     + cards +'</div>'
     + mrule(126, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:132cqw">'
     + mbody("1080 × 1920 · 1080 × 1350 · 1080 × 1080")+'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 object:function(s){
   var T=mtone();
   var insets=[[0,0],[0,14],[14,14]][s];
   return mshell(
     '<div style="position:absolute;inset:0;'+bg("living","m-f3")+'"></div>'
     +'<div style="position:absolute;left:'+insets[0]+'cqw;right:'+insets[0]+'cqw;top:'+insets[1]
     +'cqw;bottom:'+insets[1]+'cqw;border:1px solid rgba(239,237,231,.85)"></div>'
     +'<div style="position:absolute;inset:0;background:rgba(14,14,13,.26)"></div>'
     +'<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.25cqw;letter-spacing:.24em;text-transform:uppercase;color:#98A088">'
     + ["9:16 Story","4:5 Inlägg","1:1 Kvadrat"][s] +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+4)+'cqw;color:#EFEDE7;'
     +'font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9cqw;line-height:1">Ett objekt</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 }
};

/* ---------------------------------------------------------------------
   06 WHITE LABEL
   --------------------------------------------------------------------- */
MK.white = {
 editorial:function(s){
   var T=mtone();
   var brands=[["","#00000000"],["Nordvik","#1F3A2E"],["Alvhem","#7A3B2E"]];
   var b=brands[s];
   return mshell(mkick("White label")
     +'<div style="position:absolute;left:12cqw;right:12cqw;top:32cqw;bottom:52cqw;background:'+T.plate
     +';border:1px solid '+T.line+';overflow:hidden">'
     +'<div style="height:9cqw;display:flex;align-items:center;gap:2cqw;padding:0 3cqw;border-bottom:1px solid '+T.line+'">'
     + (s>0 ? '<span style="width:3.4cqw;height:3.4cqw;background:'+b[1]+'"></span>'
        +'<span style="font-family:Montserrat,sans-serif;font-size:2cqw;font-weight:700;letter-spacing:.16em;'
        +'text-transform:uppercase;color:'+(T.dark?"#EFEDE7":"#1C1C1E")+'">'+esc(b[0])+'</span>'
        : '<span style="width:22cqw;height:2.4cqw;background:'+T.line+'"></span>')
     +'</div>'
     +'<div style="position:relative;height:34cqw;overflow:hidden"><div style="position:absolute;inset:0;'
     + bg("matterport","m-w")+'"></div></div>'
     +'<div style="padding:3cqw">'
     +'<div style="height:1.6cqw;width:70%;background:'+(s>0?b[1]:T.line)+';margin-bottom:2cqw"></div>'
     +'<div style="height:1.3cqw;width:92%;background:'+T.line+';margin-bottom:1.4cqw"></div>'
     +'<div style="height:1.3cqw;width:58%;background:'+T.line+'"></div>'
     +'<div style="margin-top:3cqw;display:inline-block;padding:1.4cqw 3cqw;background:'+(s>0?b[1]:T.line)+';'
     +'font-family:Montserrat,sans-serif;font-size:1.9cqw;letter-spacing:.14em;text-transform:uppercase;color:#fff">'
     + (s>0?"Se bostaden":"") +'</div></div></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+9)+'cqw">'
     + mdisp(s===0?"Er logga.":s===1?"Era färger.":"Varje objekt.", 9.4)+'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 system:function(s){
   var T=mtone();
   var cols=[["#1F3A2E","Nordvik"],["#7A3B2E","Alvhem"]];
   var sw = cols.map(function(c,j){
     var on = (s===1&&j===0)||(s===2&&j===1);
     return '<span style="width:5cqw;height:5cqw;background:'+c[0]+';outline:'+(on?"2px solid "+T.oli:"none")
      +';outline-offset:1.4cqw;display:block"></span>';
   }).join("");
   return mshell(mkick("Ett uttryck, satt en gång")
     + mrule(30.5, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:38cqw">'+mdisp("Kontoret sätter, systemet upprepar", 6.8)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;top:66cqw;display:flex;gap:9cqw">'+sw+'</div>'
     + mrule(80, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:88cqw;display:grid;'
     +'grid-template-columns:1fr 1fr;gap:3cqw">'
     + [0,1].map(function(j){
        var active=(s===1&&j===0)||(s===2&&j===1);
        return '<div style="border:1px solid '+(active?T.oli:T.line)+';padding:2.4cqw;opacity:'+(s===0?.4:1)+'">'
         +'<div style="height:2cqw;width:60%;background:'+cols[j][0]+';margin-bottom:2cqw"></div>'
         +'<div style="height:1.2cqw;width:100%;background:'+T.line+';margin-bottom:1.2cqw"></div>'
         +'<div style="height:1.2cqw;width:74%;background:'+T.line+'"></div></div>';
       }).join("")+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:126cqw">'
     + mbody("Innehållet är identiskt. Bara uttrycket byts.")+'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 object:function(s){
   var T=mtone(), c=["#6E7266","#1F3A2E","#7A3B2E"][s], nm=["Viewly","Nordvik","Alvhem"][s];
   return mshell(
     mimg("matterport", 0, 0, 100, 106)
     +'<div style="position:absolute;left:0;right:0;top:0;height:14cqw;background:'+c+';display:flex;'
     +'align-items:center;padding:0 6.4cqw;font-family:Montserrat,sans-serif;font-size:2.4cqw;font-weight:700;'
     +'letter-spacing:.2em;text-transform:uppercase;color:#fff">'+esc(nm)+'</div>'
     +'<div style="position:absolute;left:0;right:0;top:106cqw;bottom:0;background:'+T.paper+'"></div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:116cqw">'
     + mdisp("Samma visningssida", 8.6)
     +'<div style="height:2.6cqw"></div>'
     + mbody("Levereras i kontorets varumärke, aldrig i vårt.")+'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 }
};

/* ---------------------------------------------------------------------
   07 3D — PLAN TILL VOLYM
   --------------------------------------------------------------------- */
function mplan(P, s){
  /* s0 platt plan · s1 halvrest · s2 volym. Ren geometri, ingen HUD. */
  var lift=[0,.42,1][s], c=P.c, a=P.a;
  var y=function(v){ return 50 + (v-50)*(1-lift*.34) - lift*8 };
  var d1="M20 "+y(74)+" L50 "+y(88)+" L80 "+y(74)+" L50 "+y(60)+" Z";
  return '<svg viewBox="0 0 100 100" style="width:100%;height:100%;display:block">'
   +'<path d="'+d1+'" fill="none" stroke="'+c+'" stroke-width="1.4"/>'
   + (lift>0 ? '<path d="M20 '+y(74)+' V'+(y(74)-26*lift)+' L50 '+(y(88)-26*lift)+' V'+y(88)+'" fill="none" stroke="'+c+'" stroke-width="1.4" opacity=".8"/>'
     +'<path d="M80 '+y(74)+' V'+(y(74)-26*lift)+' L50 '+(y(88)-26*lift)+' V'+y(88)+'" fill="none" stroke="'+c+'" stroke-width="1.4" opacity=".8"/>'
     +'<path d="M20 '+(y(74)-26*lift)+' L50 '+(y(60)-26*lift)+' L80 '+(y(74)-26*lift)+' L50 '+(y(88)-26*lift)+' Z" fill="'+c+'" opacity=".07" stroke="'+c+'" stroke-width="1.4"/>' : '')
   +'<circle cx="50" cy="'+(y(74)-13*lift)+'" r="3.2" fill="'+a+'"/></svg>';
}
MK.tredim = {
 editorial:function(s){
   var T=mtone();
   return mshell(mkick("3D visning")
     +'<div style="position:absolute;left:14cqw;right:14cqw;top:38cqw;height:72cqw">'
     + mplan({c:T.ink,a:T.oli}, s)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:122cqw">'
     + mdisp(["Planritningen.","","Bostaden."][s] || " ", 10.4)+'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 system:function(s){
   var T=mtone(), labs=["Planritning","Volym","Dollhouse"];
   return mshell(mkick("Från plan till rum")
     + mrule(30.5, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:38cqw">'+mdisp("Samma bostad, två sätt att läsa den", 6.6)+'</div>'
     +'<div style="position:absolute;left:10cqw;right:10cqw;top:64cqw;height:62cqw;border:1px solid '+T.line+'">'
     + mplan({c:T.ink,a:T.oli}, s)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:132cqw;display:flex;justify-content:space-between">'
     + labs.map(function(t,j){ return '<span style="font-family:Montserrat,sans-serif;font-size:2.2cqw;'
        +'letter-spacing:.14em;text-transform:uppercase;color:'+(j<=s?T.ink:T.mut)+'">'+esc(t)+'</span>' }).join("")
     +'</div>'
     + mrule(140, 6.4, 6.4)
     + mfoot(["Start","Nyckel","Slut"][s]));
 },
 object:function(s){
   var T=mtone();
   return mshell(
     mimg(s===0?"threed":s===1?"threedcam":"matterport", 0, 0, 100, 177.8)
     +'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,14,13,.32),rgba(14,14,13,0) 34%,rgba(14,14,13,.66))"></div>'
     +'<div style="position:absolute;left:6.4cqw;top:'+SAFE.top+'cqw;font-family:Montserrat,sans-serif;'
     +'font-size:2.25cqw;letter-spacing:.24em;text-transform:uppercase;color:#98A088">3D visning</div>'
     + (s>=1 ? '<div style="position:absolute;left:16cqw;right:16cqw;top:56cqw;height:52cqw;pointer-events:none;opacity:'
        +(s===1?".95":".28")+'">'+mplan({c:"#EFEDE7",a:"#98A088"}, s)+'</div>' : '')
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;bottom:'+(SAFE.bot+6)+'cqw;color:#EFEDE7;'
     +'font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;font-size:9.2cqw;line-height:1">'
     + esc(["Ett rum.","Mätt och skannat.","Gå igenom det."][s]) +'</div>'
     + mfoot(["Start","Nyckel","Slut"][s]));
 }
};

/* ---------- storyboards ---------- */
var MSTORY = {
 annons:{
  editorial:[["0,0 s","Tomt uppslag. Bara kickern och rubriken <i>Sex bilder in.</i> Papper, ingenting annat."],
   ["1,2 s","Sex miniatyrer faller in underifrån, 70 ms isär, 12 cqw resa. Ease-out 420 ms. Ingen skalning."],
   ["3,0 s","Miniatyrerna tonas till 34 % och sjunker 7 cqw. Rubriken byts genom en maskerad radbyte — inte en fade."],
   ["4,2 s","Annonsrubriken sätts ord för ord genom en clip-mask från vänster, 90 ms per ord."],
   ["6,0 s","Ingressen tonar in på plats. Slutbild hålls 1,2 s."]],
  system:[["0,0 s","Rutnätet ligger. Sex signaler i grått, alla släckta. Statusrad: <i>Väntar på underlag.</i>"],
   ["1,0 s","Signalerna tänds en och en, 180 ms isär: punkten går från linjefärg till oliv, texten till bläck."],
   ["3,2 s","Statusraden byter till <i>Läser 3 av 6</i> — sifferbytet är ett rullande tal, inte en fade."],
   ["5,0 s","Sista signalen tänds. Statusraden byter till <i>Utkast klart.</i>"],
   ["6,0 s","Rubriken skrivs ut under den nedre mätlinjen. Slutbild hålls 1,5 s."]],
  object:[["0,0 s","Fotografiet fyller 88 cqw. Under: ordet <i>Utkast</i> och tomma radlinjer."],
   ["1,4 s","Textblocket bygger sig: fyra linjer växer i bredd, 120 ms isär, ease-out."],
   ["3,4 s","Bilden dras upp till 52 cqw med en maskerad beskärning — bilden själv står still, ramen krymper."],
   ["4,6 s","Rubriken ersätter ordet <i>Utkast</i>, maskerad från vänster."],
   ["6,4 s","Slutbild: halv bild, färdig text."]]},
 motion:{
  editorial:[["0,0 s","Stillbilden i sitt fönster. Rubrik: <i>Stillbilden.</i>"],
   ["1,5 s","Bilden börjar en push-in på 6 % — linjärt, inte ease. Rubriken byts maskerat till <i>Rörelsen.</i>"],
   ["4,5 s","Push-in fortsätter till 13 %. Ingenting annat händer. Det är hela poängen."],
   ["6,0 s","Rubriken byts till <i>Filmen.</i> Rörelsen stannar mjukt på slutbilden."]],
  system:[["0,0 s","Bilden ligger still. Beskärningsramen i oliv står till vänster. Fyra stegnamn, det första i bläck."],
   ["1,2 s","Ramen vandrar åt höger. Förloppslinjen under stegnamnen växer i takt med den."],
   ["3,6 s","Andra och tredje steget tänds när ramen passerar sina positioner."],
   ["5,4 s","Ramen når höger kant, fjärde steget tänds, linjen full."],
   ["6,4 s","Under nedre mätlinjen: <i>En film, tre format.</i>"]],
  object:[["0,0 s","Fotografiet i full bleed, mörkt vinjetterat. <i>Bilderna finns redan.</i>"],
   ["1,6 s","Spelknappen växer in i mitten, 92 % vit, från 0,88 till 1,00 i skala. En enda rörelse."],
   ["3,0 s","Knappen tonar till 18 %, bilden byts genom en korsning på 600 ms. Rubrik: <i>Rörelsen läggs på.</i>"],
   ["5,2 s","Andra bildbytet. Rubrik: <i>Filmen är klar.</i>"],
   ["6,6 s","Slutbild hålls."]]},
 estyl:{
  editorial:[["0,0 s","Originalbilden i sin ram. Rubrik: <i>Tomt.</i>"],
   ["1,4 s","Wipe-kanten startar från vänster. Ren clip-inset, ingen suddighet, ingen linje som glöder."],
   ["3,2 s","Halvvägs. En 1 px ljus linje markerar kanten — det enda grafiska tillägget."],
   ["5,0 s","Wipen når höger kant och linjen försvinner."],
   ["5,6 s","Rubriken byts maskerat till <i>Möblerat.</i> Slutbild hålls 1,4 s."]],
  system:[["0,0 s","Ramad bild, mätlinjer, etiketterna <i>Original</i> / <i>E-stylat</i> och räknaren på 0 %."],
   ["1,2 s","Wipen startar. Räknaren räknar upp med rullande siffror, inte fade."],
   ["3,4 s","Vid 50 % byter etiketternas vikt: <i>Original</i> går till grått, <i>E-stylat</i> till bläck."],
   ["5,4 s","100 %. Wipe-linjen står kvar i oliv vid högerkanten."],
   ["6,2 s","Brödtexten tonar in: <i>Inga väggar flyttas.</i>"]],
  object:[["0,0 s","Full bleed original. <i>Samma rum.</i>"],
   ["1,6 s","Wipen går över hela ytan, 3,2 s, ease-in-out. Texten står helt still under tiden."],
   ["5,0 s","Wipen klar."],
   ["5,4 s","Rubriken byts maskerat till <i>Ny känsla.</i> Slutbild hålls 1,6 s."]]},
 kampanj:{
  editorial:[["0,0 s","Bilden på objektet, rubrik <i>Kommande</i>, förloppsstrecken tomma utom det första."],
   ["1,8 s","Bild och rubrik byts samtidigt genom en gemensam maskerad övergång. Andra strecket fylls."],
   ["3,6 s","Tredje bytet. Adressen under rubriken står oförändrad hela vägen — det är beviset."],
   ["5,4 s","Fjärde: <i>Såld.</i> Alla fyra streck i oliv."],
   ["6,6 s","Slutbild hålls."]],
  system:[["0,0 s","Fyra artboards i rad, den första i full opacitet, resten på 32 %."],
   ["1,6 s","Läget vandrar: nästa kort går till full opacitet och får olivram, det förra dämpas."],
   ["3,4 s","Tredje kortet. Ingen skalning, ingen förflyttning — bara ljusstyrka och ram."],
   ["5,2 s","Fjärde kortet."],
   ["6,2 s","Brödtexten tonar in: <i>Adressen står still. Bara mallen byts.</i>"]],
  object:[["0,0 s","Full bleed, statusen spärrad i oliv överst, adressen i Cormorant nertill."],
   ["2,0 s","Bilden byts genom korsning 700 ms. Statusordet byts maskerat. Adressen rör sig inte."],
   ["4,0 s","Tredje bytet."],
   ["5,6 s","Fjärde: <i>Såld.</i> Förloppsstrecken fylls sist, 200 ms."],
   ["7,0 s","Slutbild hålls."]]},
 format:{
  editorial:[["0,0 s","En bild i 4:5 centrerad. Rubrik: <i>Ett objekt.</i>"],
   ["1,6 s","Ramen ändrar proportion till 1:1 — bilden inuti står still, det är ramen som rör sig."],
   ["3,4 s","Ny proportion, 9:16. Formatetiketten nertill byts i takt."],
   ["5,0 s","Rubriken byts till <i>Samma bild.</i>"],
   ["6,2 s","Slutbild."]],
  system:[["0,0 s","En ram, 9:16, med sitt mått."],
   ["1,4 s","Andra ramen växer ut från den första i sin sanna proportion, 420 ms, ease-out."],
   ["3,0 s","Tredje ramen."],
   ["4,6 s","Måtten skrivs ut under mätlinjen: 1080 × 1920 · 1080 × 1350 · 1080 × 1080."],
   ["6,0 s","Slutbild."]],
  object:[["0,0 s","Fotografiet i full bleed med en ljus 9:16-ram inritad."],
   ["1,8 s","Ramen dras in till 4:5. Bilden står still — beskärningen är det som rör sig."],
   ["3,6 s","Ramen dras in till 1:1."],
   ["5,2 s","Ramen tonar bort, bilden ligger kvar. Rubrik: <i>Ett objekt.</i>"]]},
 white:{
  editorial:[["0,0 s","Visningssidan utan varumärke — grå platshållare i logotypraden och på knappen."],
   ["1,6 s","Kontor A:s färg fyller logotypruta, rubrikstreck och knapp samtidigt, 320 ms."],
   ["3,6 s","Bytet till kontor B. Enbart färgytorna och namnet korsar; layout, bild och textmassa rör sig inte en pixel."],
   ["5,4 s","Rubriken byts till <i>Varje objekt.</i>"],
   ["6,4 s","Slutbild."]],
  system:[["0,0 s","Två färgprover, båda omarkerade. Två identiska sidor på 40 % opacitet."],
   ["1,4 s","Första provet får olivmarkering, vänstra sidan går till full opacitet och får sin färg."],
   ["3,4 s","Markeringen flyttar till andra provet, högra sidan färgas."],
   ["5,2 s","Brödtext: <i>Innehållet är identiskt. Bara uttrycket byts.</i>"]],
  object:[["0,0 s","Visningssidan med Viewlys egen olivlist."],
   ["2,0 s","Listen byter färg och namn till kontor A. Fotografiet under står helt still."],
   ["4,0 s","Byte till kontor B."],
   ["5,6 s","Texten under skrivs ut: <i>Levereras i kontorets varumärke, aldrig i vårt.</i>"]]},
 tredim:{
  editorial:[["0,0 s","Planritningen platt, sedd rakt uppifrån. Rubrik: <i>Planritningen.</i>"],
   ["1,8 s","Planen reser sig. En enda kamerarörelse, ease-in-out 2,4 s, ingen rotation."],
   ["4,2 s","Volymen står. Olivpunkten stiger med den — det är ståpunkten."],
   ["5,4 s","Rubriken byts maskerat till <i>Bostaden.</i>"],
   ["6,4 s","Slutbild."]],
  system:[["0,0 s","Planen i sin ram. Tre etiketter, den första i bläck."],
   ["1,6 s","Resningen börjar. Etiketterna tänds i takt med geometrin."],
   ["4,0 s","Dollhouse-läget."],
   ["5,2 s","Slutbild med alla tre etiketter tända."]],
  object:[["0,0 s","Fotografi av rummet, full bleed. <i>Ett rum.</i>"],
   ["1,6 s","Geometrin ritas ovanpå fotografiet i ljus hårlinje, 900 ms."],
   ["3,4 s","Bilden byts till skanningsvyn, geometrin tonas till 28 %."],
   ["5,4 s","Sista bytet till dollhouse. Rubrik: <i>Gå igenom det.</i>"]]}
};

/* =====================================================================
   VYN
   ===================================================================== */
function secMotion(){
  var cls = {A:"lock", B:"semi", C:"edit"};   /* återanvänder lagerfärgerna */
  var counts = {A:0,B:0,C:0};
  MAUDIT.forEach(function(x){ counts[x.k]++ });

  var rows = MAUDIT.map(function(x){
    return '<tr><td><b>'+esc(x.n)+'</b><br><code class="mono" style="font-size:10px">'+esc(x.p)+'</code></td>'
     +'<td><span class="lay '+cls[x.k]+'" style="display:inline-block;padding:2px 7px;border-radius:4px;'
     +'font-size:10px;font-weight:700">'+x.k+'</span></td>'
     +'<td>'+esc(x.purpose)+'<br><span class="mut" style="font-size:11px">'+esc(x.use)+'</span></td>'
     +'<td>'+esc(x.why)+'</td>'
     +'<td>'+esc(x.move)+'</td>'
     +'<td class="mut">'+esc(x.still)+'</td></tr>';
  }).join("");

  var cands = MCAND.map(function(c){
    var dirs = MDIRS.map(function(d){
      var f = (MK[c.id]||{})[d.id];
      var frames = [0,1,2].map(function(st){
        return '<div class="mkf"><div class="frame">'+(f?f(st):'')+'</div>'
         +'<span class="mkfl">'+["Start","Nyckel","Slut"][st]+'</span></div>';
      }).join("");
      var board = (MSTORY[c.id]||{})[d.id] || [];
      return '<div class="mdir">'
       +'<div class="mdirh"><b>'+esc(d.n)+'</b><span>'+esc(d.d)+'</span></div>'
       +'<div class="mkfs">'+frames+'</div>'
       +'<ol class="mboard">'+board.map(function(b){
          return '<li><span class="t">'+esc(b[0])+'</span><span class="w">'+b[1]+'</span></li>' }).join("")+'</ol>'
       +'</div>';
    }).join("");
    return '<div class="mcand"><div class="mcandh">'
     +'<span class="mnum">'+c.num+'</span>'
     +'<div><b>'+esc(c.n)+'</b><span class="mut"> · '+esc(c.claim)+'</span>'
     +'<p class="mut" style="font-size:12.5px;line-height:1.6;margin-top:5px;max-width:80ch">'+esc(c.rank)+'</p></div>'
     +'<code class="mono">'+esc(c.prim)+'</code></div>'
     + dirs +'</div>';
  }).join("");

  return sechead("Motion", "Var rörelse faktiskt tillför något",
     "Ingenting här är animerat. Sektionen finns för att kunna jämföra riktningar innan någon "
    +"animationsarkitektur byggs. Först en klassificering av hela templatebiblioteket, sedan sju kandidater "
    +"med tre designriktningar var — startbild, nyckelbild, slutbild.")
   + dirbar()
   +'<div class="mstat">'
     +'<div><b>'+counts.A+'</b><span>A — motion rekommenderas</span></div>'
     +'<div><b>'+counts.B+'</b><span>B — valfritt</span></div>'
     +'<div><b>'+counts.C+'</b><span>C — behåll statisk</span></div>'
     +'<div><b>7</b><span>kandidater</span></div>'
   +'</div>'
   +'<h3 class="h3">Audit</h3>'
   +'<div class="tw"><table><thead><tr><th>Template</th><th>Klass</th><th>Syfte</th><th>Varför</th>'
   +'<th>Vad rör sig</th><th>Vad står still</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
   +'<h3 class="h3">Kandidater och riktningar</h3>'
   + cands;
}
