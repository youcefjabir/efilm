/* ---------- 08 KAMPANJEN, STEG FÖR STEG ----------
   Hör till Social / Ads Studio, alltså kapitel 10, och ligger som
   rörelse på mallbiblioteksrutan. Inget eget kapitel — studion har
   redan sitt.

   Två saker styr hela den här filen.

   FÖRSTA: mallarna finns redan. Kommande, Till salu, Visning och Såld
   är byggda artboards i systemet och renderas med martb(). Att rita
   platshållare bredvid dem vore att visa en sämre version av något som
   finns färdigt. Varje gång en mall syns här är det den riktiga.

   ANDRA: ingen app-krom. Jag har inte studions gränssnitt, och att
   hitta på paneler, kryssrutor och statusmärken gör bilden fel utan att
   göra den tydligare. Det som ritas är VALET — mallarna själva, en
   markering på de valda, och en rad text. Inget mer. Det är också den
   enklaste möjliga ux:en, vilket är vad rutan ska förmedla.

   Fyra steg. Bekräftelsesteget är borta: det tillför ingenting när
   inget nytt fylls i. */

var BTXT = [
  ["Välj objekt",  "Ur en order som redan är levererad."],
  ["Välj mallar",  "En eller flera av kontorets egna."],
  ["Välj bilder",  "En bild per mall, ur ordern."],
  ["Klar",         "Dela direkt eller schemalägg."]
];
var BPOST = ["p1","p2","p3","p4"];            /* de riktiga mallarna */
var BVALD = [0,1,2];                          /* tre av fyra valda */

/* Räknaren. Fyra streck, det aktuella fyllt. Det enda navigationsspår
   som behövs när stegen är fyra och heter något. */
function bSteg(D, i){
  var T = mtone(D);
  return '<div style="display:flex;gap:1.4cqw;align-items:center">'
   + BTXT.map(function(x, j){
       return '<span style="width:5.4cqw;height:.5cqw;display:block;background:'
        +(j <= i ? T.oli : T.line)+';opacity:'+(j === i ? 1 : j < i ? .55 : 1)+'"></span>';
     }).join("")
   +'<span style="font-family:Montserrat,sans-serif;font-size:2.05cqw;font-weight:500;'
   +'letter-spacing:.24em;text-transform:uppercase;color:'+T.mut+';margin-left:1.6cqw">'
   + String(i+1).padStart(2,"0") +' / 04</span></div>';
}
/* En markering på det valda. En liten fylld kvadrat — inte en kryssruta,
   för det är inte ett formulär vi ritar. */
function bPrick(D, on){
  var T = mtone(D);
  return '<span style="width:2.2cqw;height:2.2cqw;display:block;background:'
   +(on ? T.oli : "transparent")+';border:1px solid '+(on ? T.oli : T.line)+'"></span>';
}

MK.bygg = {
 /* 01 EDITORIAL — ett val i taget, stort.
    Räknaren överst, rubriken, saken som väljs, en rad text. Fyra zoner
    på fasta höjder, så bytet syns i innehållet och aldrig i layouten. */
 editorial:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .97, 4), i = ph.i;
   var sp = i > 0 ? Math.min(1, ph.local/.34) : 1;
   var IM = ["hero","kitchen","living","dining","boucle"];

   var scen = function(k){
     /* 01 — ordrarna, som ren typografi. Ingen lista, inga rutor. */
     if(k === 0){
       return ORDERS.map(function(o, j){
         var vald = j === 0;
         return '<div style="display:flex;align-items:center;gap:2.8cqw;padding:3cqw 0;'
          +'border-bottom:1px solid '+T.line+';opacity:'+(vald ? 1 : .34)+'">'
          + bPrick(D, vald)
          +'<span style="flex:1"><span style="display:block;font-family:\'Cormorant Garamond\',Georgia,serif;'
          +'font-weight:300;font-size:6.2cqw;line-height:1.02;color:'+T.ink+'">'+esc(o.addr)+'</span>'
          +'<span style="display:block;font-family:Montserrat,sans-serif;font-size:2.2cqw;'
          +'letter-spacing:.06em;color:'+T.mut+';margin-top:1cqw">'+esc(o.city)+' · '+o.n+' bilder</span>'
          +'</span></div>';
       }).join("");
     }
     /* 02 — de RIKTIGA mallarna, tre valda. */
     if(k === 1){
       var W = 19.4, G = 2.2;
       return '<div style="position:relative;height:32cqw">'
        + BPOST.map(function(pid, j){
            var on = BVALD.indexOf(j) >= 0;
            return martb(D, pid, j*(W+G), 4.6, W, "4:5",
                     'opacity:'+(on ? 1 : .3)+';outline:1px solid '+(on ? T.oli : T.line)+';outline-offset:-1px;')
             +'<div style="position:absolute;left:'+(j*(W+G))+'cqw;top:0">'+bPrick(D, on)+'</div>';
          }).join("")
        +'</div>';
     }
     /* 03 — en mall stor, orderns bilder som en rad under. */
     if(k === 2){
       return '<div style="position:relative;height:64cqw">'
        + martb(D, "p2", 21.5, 0, 44, "4:5", 'outline:1px solid '+T.line+';outline-offset:-1px;')
        +'<div style="position:absolute;left:0;right:0;top:58cqw;display:flex;gap:1.6cqw">'
        + IM.map(function(m, j){
            return '<div style="flex:1;aspect-ratio:1/1;position:relative;overflow:hidden;'
             +'outline:'+(j === 1 ? '2px solid '+T.oli : '1px solid '+T.line)+';outline-offset:-1px;'
             +'opacity:'+(j === 1 ? 1 : .38)+'">'
             +'<div style="position:absolute;inset:0;'+bg(m,"m-b-"+m)+'"></div></div>';
          }).join("")
        +'</div></div>';
     }
     /* 04 — de tre färdiga mallarna, och kanalerna som två ord. */
     var W2 = 27.7, G2 = 2.1;
     return '<div style="position:relative;height:50cqw">'
      + BVALD.map(function(v, j){
          return martb(D, BPOST[v], j*(W2+G2), 0, W2, "4:5",
                   'outline:1px solid '+T.line+';outline-offset:-1px;');
        }).join("")
      +'<div style="position:absolute;left:0;right:0;top:38.5cqw;display:flex;gap:3.4cqw;align-items:center">'
      +'<span style="font-family:Montserrat,sans-serif;font-size:2.05cqw;font-weight:500;'
      +'letter-spacing:.24em;text-transform:uppercase;color:'+T.mut+'">Ut i</span>'
      + BKANAL.map(function(c){
          return '<span style="display:flex;align-items:center;gap:1.4cqw">'+bPrick(D, true)
           +'<span style="font-family:Montserrat,sans-serif;font-size:2.6cqw;color:'+T.ink+'">'
           + esc(c.n)+'</span></span>';
        }).join("")
      +'</div></div>';
   };

   var prv = BTXT[i > 0 ? i-1 : 0], cur = BTXT[i];
   return mshell(D, mkick(D, "Social / Ads Studio")
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+9)+'cqw">'
     + bSteg(D, i) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+18)+'cqw">'
     + mswap2(mdisp(D, prv[0], 9.2), mdisp(D, cur[0], 9.2), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+31)+'cqw">'
     + mswap2(mbody(D, prv[1]), mbody(D, cur[1]), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+44)+'cqw">'
     + mswap2(scen(i > 0 ? i-1 : 0), scen(i), sp) +'</div>'
     + mfoot(D));
 },

 /* 02 SYSTEM — hela vägen syns hela tiden.
    Fyra rader som tänds i tur och ordning. Det säger det en stillbild
    inte kan: hur många steg det är, och att det tar slut. */
 system:function(D, t){
   var T = mtone(D), now = mphN(t, .05, .95, 4).i;
   var rows = BTXT.map(function(x, j){
     var on = j <= now, nu = j === now;
     return '<div style="display:flex;align-items:baseline;gap:3.4cqw;padding:3.4cqw 0;'
      +'border-bottom:1px solid '+T.line+';opacity:'+(nu ? 1 : on ? .72 : .26)+'">'
      +'<span style="font-family:Montserrat,sans-serif;font-size:2.2cqw;font-weight:600;'
      +'letter-spacing:.18em;width:6.4cqw;flex:0 0 6.4cqw;color:'+(on ? T.oli : T.mut)+'">'
      + String(j+1).padStart(2,"0") +'</span>'
      +'<span><span style="display:block;font-family:\'Cormorant Garamond\',Georgia,serif;'
      +'font-weight:300;font-size:6.4cqw;line-height:1.04;color:'+T.ink+'">'+esc(x[0])+'</span>'
      +'<span style="display:block;font-family:Montserrat,sans-serif;font-size:2.5cqw;'
      +'line-height:1.55;margin-top:1cqw;color:'+(T.dark?"#A8A6A0":"#4A4744")+'">'+esc(x[1])+'</span>'
      +'</span></div>';
   }).join("");
   return mshell(D, mkick(D, "Social / Ads Studio")
     + mrule(D, 30, 6.4, 6.4)
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:33.5cqw">'
     + mdisp(D, "Fyra steg", 9.6) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:52cqw">'+rows+'</div>'
     + mfoot(D));
 },

 /* 03 OBJECT — mallarna är huvudpersonen.
    De fyra riktiga artboardsen ligger uppe hela klippet. De väljs, de
    fylls, de går ut. Ingen text förklarar gränssnittet, för det finns
    inget gränssnitt att förklara — bara mallarna. */
 object:function(D, t){
   var T = mtone(D), ph = mphN(t, 0, .97, 4), i = ph.i;
   var sp = i > 0 ? Math.min(1, ph.local/.34) : 1;
   var W = 19.4, G = 2.2;
   var brad = BPOST.map(function(pid, j){
     var on = BVALD.indexOf(j) >= 0;
     /* steg 0: alla lika · 1: tre valda · 2 och 3: de valda står kvar */
     var stark = i === 0 ? .55 : on ? 1 : .18;
     return martb(D, pid, j*(W+G), 0, W, "4:5",
              'opacity:'+stark+';outline:1px solid '+((i >= 1 && on) ? T.oli : T.line)+';outline-offset:-1px;');
   }).join("");
   var prv = BTXT[i > 0 ? i-1 : 0], cur = BTXT[i];
   return mshell(D,
     '<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+SAFE.top+'cqw;'
     +'font-family:Montserrat,sans-serif;font-size:2.25cqw;font-weight:500;letter-spacing:.24em;'
     +'text-transform:uppercase;color:'+T.oli+'">Kontorets mallar</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+11)+'cqw;height:25cqw">'
     + brad +'</div>'
     /* den valda mallen i stor skala, en per takt efter valet */
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+42)+'cqw;height:57cqw">'
     + (i === 0
        ? ORDERS.map(function(o, j){
            return '<div style="display:flex;align-items:center;gap:2.6cqw;padding:2.6cqw 0;'
             +'border-bottom:1px solid '+T.line+';opacity:'+(j === 0 ? 1 : .3)+'">'
             + bPrick(D, j === 0)
             +'<span style="font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;'
             +'font-size:5.6cqw;color:'+T.ink+'">'+esc(o.addr)+'</span></div>';
          }).join("")
        : martb(D, BPOST[Math.min(2, i-1)], 27, 0, 45, "4:5",
                'outline:1px solid '+T.line+';outline-offset:-1px;'))
     +'</div>'
     /* Texten låg med underkanten exakt på sidfotens rad och krockade med
        VIEWLY. Fyra cqw luft räcker för att de ska läsas isär. */
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+104)+'cqw">'
     + mswap2(mdisp(D, prv[0], 8.4), mdisp(D, cur[0], 8.4), sp) +'</div>'
     +'<div style="position:absolute;left:6.4cqw;right:6.4cqw;top:'+(SAFE.top+116)+'cqw">'
     + mswap2(mbody(D, prv[1]), mbody(D, cur[1]), sp) +'</div>'
     + mfoot(D));
 },

 /* 04 STILLHET — fyra meningar över en mall.
    Ingen räknare, inga markeringar. För flöden där lugnet är tonen. */
 stillhet:function(D, t){
   var ph = mphN(t, 0, .97, 4), i = ph.i;
   var sp = i > 0 ? Math.min(1, ph.local/.36) : 1;
   var w  = i > 0 ? eInOut(Math.min(1, ph.local/.28)) : 1;
   var P = ["p1","p1","p2","p3"];
   /* Mallen är 4:5 och äter höjd fort: 84 cqw bred blev 105 hög och tryckte
      texten ner i Instagrams egen nederkant. 70 lämnar plats åt båda. */
   var W = 70, X = 15, Y = 34;
   return mshell(D,
     (i > 0 ? martb(D, P[i-1], X, Y, W, "4:5") : '')
   + martb(D, P[i], X, Y, W, "4:5", w < 1 ? 'clip-path:inset(0 '+((1-w)*100).toFixed(1)+'% 0 0);' : '')
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:128cqw">'
   + mswap2(mdisp(D, BTXT[i > 0 ? i-1 : 0][0], 8.4), mdisp(D, BTXT[i][0], 8.4), sp) +'</div>'
   +'<div style="position:absolute;left:8cqw;right:8cqw;top:140cqw">'
   + mswap2(mbody(D, BTXT[i > 0 ? i-1 : 0][1]), mbody(D, BTXT[i][1]), sp) +'</div>'
   + mmark(D));
 }
};
