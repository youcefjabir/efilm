/* ---------- 08 KAMPANJBYGGAREN ----------
   Den här funktionen är det starkaste argumentet i hela biblioteket för
   att över huvud taget göra rörligt. Produkten ÄR ett förlopp: fem steg
   som följer på varandra. En stillbild kan bara visa ett av dem, och då
   blir det en skärmdump. Sex sekunder visar hela vägen — och det är
   vägen, inte skärmen, som säljer.

   Sex takter i alla fyra riktningar: fem steg plus delningen. Skenan
   ligger still och bara innehållet byts, för det är precis så en guide
   uppför sig. Delningen kommer sist och aldrig tidigare — den hör till
   efter att kampanjen finns. */

/* rubrik och underrad per takt, delad av riktningarna */
var BTXT = [
  ["Välj objekt",   "Ur en order som redan är levererad."],
  ["Välj mallar",   "En eller flera. Tre är vanligast."],
  ["Välj bilder",   "En bild per mall, ur ordern."],
  ["Kontrollera",   "Fyra rader att godkänna. Inget nytt att fylla i."],
  ["Kampanjen är byggd", "Tre mallar i tre format vardera."],
  ["Dela eller schemalägg", "Instagram och Facebook, direkt ur studion."]
];

MK.bygg = {
 /* 01 EDITORIAL — skenan står, panelen byts maskerat.
    Rubriken är stor och byts med samma mask som panelen, så att bytet
    läses som ETT skifte och inte som två saker som råkar hända. */
 editorial:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .97, 6), i = ph.i;
   var sp = i > 0 ? Math.min(1, ph.local/.34) : 1;
   var prv = BTXT[i > 0 ? i-1 : 0], cur = BTXT[i];
   var panel = function(k){
     return k >= 5 ? bShare(T.dark) : bBody({step:k}, T.dark);
   };
   return mshell(D, mkick(D, "Kampanjbyggaren · " + (i < 5 ? "steg " + (i+1) + " av 5" : "klar"))
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+9)+'cqw">'
     + bRail(Math.min(4, i), T.dark) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+23)+'cqw">'
     + mswap2(mdisp(D, prv[0], 8.6), mdisp(D, cur[0], 8.6), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+35)+'cqw">'
     + mswap2(mbody(D, prv[1]), mbody(D, cur[1]), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+48)+'cqw">'
     + mswap2(panel(i > 0 ? i-1 : 0), panel(i), sp) +'</div>'
     + mfoot(D));
 },

 /* 02 SYSTEM — förloppet isärplockat.
    Alla sex takterna står uppradade hela tiden och tänds i tur och
    ordning. Det säger något stillbilden inte kan: hur MÅNGA steg det
    är, och att det tar slut. */
 system:function(D, t){
   var T = mtone(D), now = mphN(t, .04, .96, 6).i;
   var rows = BTXT.map(function(x, j){
     var on = j <= now, nu = j === now;
     return '<div style="display:flex;align-items:flex-start;gap:3cqw;padding:2.5cqw 0;'
      +'border-bottom:1px solid '+T.line+';opacity:'+(nu?1:on?.78:.3)+'">'
      +'<span style="font-family:Montserrat,sans-serif;font-size:2.1cqw;font-weight:600;'
      +'letter-spacing:.16em;width:6cqw;flex:0 0 6cqw;margin-top:1.1cqw;color:'+(on?T.oli:T.mut)+'">'
      + (j < 5 ? String(j+1).padStart(2,"0") : "→") +'</span>'
      +'<span><span style="display:block;font-family:\'Cormorant Garamond\',Georgia,serif;'
      +'font-weight:300;font-size:5.6cqw;line-height:1.06;color:'+T.ink+'">'+esc(x[0])+'</span>'
      +'<span style="display:block;font-family:Montserrat,sans-serif;font-size:2.5cqw;'
      +'line-height:1.55;margin-top:.9cqw;color:'+(T.dark?"#A8A6A0":"#4A4744")+'">'+esc(x[1])+'</span>'
      +'</span></div>';
   }).join("");
   return mshell(D, mkick(D, "Så byggs en kampanj")
     + mrule(D, 30, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:33.5cqw">'
     + mdisp(D, "Fem steg, och ett till", 6.8) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:50cqw">'+rows+'</div>'
     + mfoot(D));
 },

 /* 03 OBJECT — materialet leder.
    Ingen skena, inga kryssrutor. Orderns bilder ligger som en remsa och
    blir tre färdiga inlägg framför tittaren. Gränssnitt syns bara i
    sista takten, där det faktiskt förklarar något: kanalerna.

    Första versionen la kanalpanelen UNDER remsan och sprängde ramen med
    32 cqw. Mittzonen håller därför en sak i taget: remsan medan man
    väljer, kanalerna när kampanjen finns. Rubriken står kvar på samma
    höjd genom hela klippet, så bytet syns i innehållet och inte i
    layouten. */
 object:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .97, 6), i = ph.i;
   var sp = i > 0 ? Math.min(1, ph.local/.34) : 1;
   var IM = ["hero","kitchen","living","dining","boucle"];
   /* remsan: bilderna ur ordern, en i taget markerad */
   var remsa = function(k){
     return '<div style="display:flex;gap:1.6cqw">'
      + IM.map(function(m, j){
          var vald = j < Math.min(3, k);
          return '<div style="flex:1;aspect-ratio:1/1;position:relative;overflow:hidden;'
           +'outline:'+(vald ? '2px solid '+T.oli : '1px solid '+T.line)+';outline-offset:-1px;'
           +'opacity:'+(vald ? 1 : .38)+'">'
           +'<div style="position:absolute;inset:0;'+bg(m,"m-bygg-"+m)+'"></div></div>';
        }).join("")
      +'</div>';
   };
   /* de färdiga inläggen växer fram ett i taget */
   var klara = function(k){
     return '<div style="display:flex;gap:2cqw">'
      + [0,1,2].map(function(j){
          var pa = j < Math.max(0, k - 2);
          /* Ramen håller full styrka hela tiden och bara BILDEN tonas.
             Med opacitet på hela rutan blev de tre ytorna nästan osynliga
             i första tredjedelen, och det lästes som att något var
             sönder i stället för som att platsen väntar på sitt inlägg. */
          return '<div style="flex:1;aspect-ratio:4/5;position:relative;overflow:hidden;'
           +'border:1px solid '+T.line+';background:'+(T.dark?"#141416":"#FFFFFF")+'">'
           +'<div style="position:absolute;inset:0;'+bg(IM[j],"m-bk-"+IM[j])
           +';opacity:'+(pa ? 1 : 0)+'"></div>'
           + (pa ? '' : '<span style="position:absolute;left:50%;top:50%;width:3.4cqw;height:1px;'
               +'transform:translate(-50%,-50%);background:'+T.line+'"></span>')
           +'</div>';
        }).join("")
      +'</div>';
   };
   var mitten = function(k){ return k >= 5 ? bShare(T.dark) : remsa(k) };
   var prv = BTXT[i > 0 ? i-1 : 0], cur = BTXT[i];
   return mshell(D,
     '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+SAFE.top+'cqw;'
     +'font-family:Montserrat,sans-serif;font-size:2.25cqw;font-weight:500;letter-spacing:.24em;'
     +'text-transform:uppercase;color:'+T.oli+'">Kampanjbyggaren</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:33cqw">'+klara(i)+'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:76cqw">'
     + mswap2(mitten(i > 0 ? i-1 : 0), mitten(i), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:126cqw">'
     + mswap2(mdisp(D, prv[0], 7.8), mdisp(D, cur[0], 7.8), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:138cqw">'
     + mswap2(mbody(D, prv[1]), mbody(D, cur[1]), sp) +'</div>'
     + mfoot(D));
 },

 /* 04 STILLHET — en mening i taget.
    Inget gränssnitt alls, bara räkningen och en rad. För flöden där
    lugnet är tonen och en skärmbild vore för högljudd. */
 stillhet:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .97, 6), i = ph.i;
   var sp = i > 0 ? Math.min(1, ph.local/.36) : 1;
   var w  = i > 0 ? eInOut(Math.min(1, ph.local/.28)) : 1;
   var IM = ["hero","kitchen","living","dining","boucle","hero"];
   var rakn = function(k){
     return '<div style="font-family:Montserrat,sans-serif;font-size:2.15cqw;font-weight:500;'
      +'letter-spacing:.38em;text-transform:uppercase;color:'+T.oli+'">'
      + (k < 5 ? "Steg " + String(k+1).padStart(2,"0") + " av 05" : "Klar") +'</div>';
   };
   return mshell(D,
     (i > 0 ? mimg(IM[i-1], 8, 44, 84, 63) : '')
   + mimg(IM[i], 8, 44, 84, 63, w < 1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '')
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:116cqw">'
   + mswap2(rakn(i > 0 ? i-1 : 0), rakn(i), sp) +'</div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:122cqw">'
   + mswap2(mdisp(D, BTXT[i > 0 ? i-1 : 0][0], 8.4), mdisp(D, BTXT[i][0], 8.4), sp) +'</div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:136cqw">'
   + mswap2(mbody(D, BTXT[i > 0 ? i-1 : 0][1]), mbody(D, BTXT[i][1]), sp) +'</div>'
   + mmark(D));
 }
};
