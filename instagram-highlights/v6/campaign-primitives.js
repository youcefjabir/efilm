
/* =====================================================================
   STEPS — kampanjbyggaren som primitiv

   Ett flöde är svårt att visa i en stillbild: man ser vad som finns,
   inte vad som händer. Lösningen här är att varje bildruta visar ETT
   steg, och att alla fem stegen alltid finns kvar i en skena överst.
   Läsaren ser hela vägen och var i den man står — samma sak en riktig
   guide gör.

   Skenan är inte dekoration. Den bär tre uppgifter: hur många steg det
   är, vilket som är aktuellt, och vilka som redan är gjorda. Det är
   därför den ritas som fyllda, aktuella och tomma rutor i stället för
   som en rad prickar.
   ===================================================================== */

/* --- skenan: fem rutor, klara fyllda, aktuell inramad --- */
function bRail(cur, dark){
  var line = dark ? "#33332F" : "#D8D2CF";
  var oli  = dark ? "#98A088" : "#6E7266";
  var ink  = dark ? "#EFEDE7" : "#1C1C1E";
  var mut  = dark ? "#6E6C66" : "#A9A29E";
  return '<div style="display:flex;gap:1.2cqw;align-items:stretch">'
   + BSTEG.map(function(x, j){
       var gjort = j < cur, nu = j === cur;
       return '<div style="flex:1;display:flex;flex-direction:column;gap:1.1cqw">'
        +'<span style="display:block;height:.55cqw;background:'
          +(gjort ? oli : nu ? oli : line)+';opacity:'+(gjort ? .5 : nu ? 1 : 1)+'"></span>'
        +'<span style="font-family:Montserrat,sans-serif;font-size:1.7cqw;font-weight:'
          +(nu ? 600 : 500)+';letter-spacing:.14em;text-transform:uppercase;color:'
          +(nu ? ink : gjort ? oli : mut)+'">'+String(j+1).padStart(2,"0")+'</span>'
        +'<span style="font-family:Montserrat,sans-serif;font-size:1.75cqw;line-height:1.25;color:'
          +(nu ? ink : mut)+'">'+esc(x.n)+'</span>'
        +'</div>';
     }).join("")
   +'</div>';
}

/* --- en liten bildruta med ram --- */
function bThumb(k, w, h, dark, extra){
  return '<div style="width:'+w+'cqw;height:'+h+'cqw;border:1px solid '
   +(dark?"#33332F":"#D8D2CF")+';overflow:hidden;position:relative;flex:0 0 auto;'+(extra||'')+'">'
   +'<div style="position:absolute;inset:0;'+bg(k)+'"></div></div>';
}
/* --- bocken: en fylld ruta med ett vitt kryss ur --- */
function bTick(on, dark, s){
  var d = s || 3.2, oli = dark ? "#98A088" : "#6E7266";
  return '<span style="width:'+d+'cqw;height:'+d+'cqw;flex:0 0 '+d+'cqw;display:block;'
   +'border:1px solid '+(on ? oli : (dark?"#3A3A34":"#C9C2BE"))+';background:'+(on?oli:"transparent")+';'
   +'position:relative">'
   + (on ? '<svg viewBox="0 0 24 24" style="position:absolute;inset:0;width:100%;height:100%">'
         +'<path d="M6 12.4 L10.2 16.6 L18 8.8" fill="none" stroke="'+(dark?"#0E0E0D":"#F2EFEF")
         +'" stroke-width="2.6" stroke-linecap="square"/></svg>' : '')
   +'</span>';
}
/* --- radetikett i versal grotesk --- */
function bLab(t, dark, col){
  return '<div style="font-family:Montserrat,sans-serif;font-size:1.85cqw;font-weight:600;'
   +'letter-spacing:.2em;text-transform:uppercase;color:'
   +(col || (dark?"#98A088":"#6E7266"))+'">'+esc(t)+'</div>';
}

/* ---------- stegens innehåll ----------
   Varje steg ritar exakt den valsituation det handlar om. Inga
   påhittade kontroller: en lista att välja ur, kryssrutor, en remsa
   bilder, en kvittens, ett resultat. */
function bBody(s, dark){
  var line = dark ? "#33332F" : "#D8D2CF";
  var pl   = dark ? "#141416" : "#FFFFFF";
  var ink  = dark ? "#EFEDE7" : "#1C1C1E";
  var mut  = dark ? "#8E8C86" : "#7A736F";
  var oli  = dark ? "#98A088" : "#6E7266";
  var kort = function(inner, pad){
    return '<div style="background:'+pl+';border:1px solid '+line+';padding:'+(pad||3)+'cqw">'+inner+'</div>';
  };
  var st = s.step;

  /* 01 — ORDERN. En lista med levererade ordrar, den valda markerad.
     Bilderna följer med i raden: det är materialet man bygger av. */
  if(st === 0){
    return kort(ORDERS.map(function(o, j){
      var vald = j === 0;
      return '<div style="display:flex;align-items:center;gap:2.4cqw;padding:2.2cqw 0'
       +(j ? ';border-top:1px solid '+line : '')+';opacity:'+(vald?1:.42)+'">'
       + bTick(vald, dark)
       +'<span style="flex:1;min-width:0">'
         +'<span style="display:block;font-family:\'Cormorant Garamond\',Georgia,serif;font-weight:300;'
         +'font-size:4.4cqw;line-height:1.05;color:'+ink+'">'+esc(o.addr)+'</span>'
         +'<span style="display:block;font-family:Montserrat,sans-serif;font-size:2cqw;'
         +'letter-spacing:.06em;color:'+mut+';margin-top:.7cqw">'+esc(o.city)+' · '+o.n+' bilder · '
         + esc(o.when)+'</span></span>'
       +'<span style="display:flex;gap:.9cqw">'
         + o.ims.slice(0,3).map(function(k){ return bThumb(k, 7.4, 7.4, dark) }).join("")
       +'</span></div>';
    }).join(""));
  }

  /* 02 — MALLARNA. Fyra kort, tre valda. Att flera går att välja är
     hela poängen, så det ska synas att det är kryss och inte radio. */
  if(st === 1){
    var valda = [0,1,2];
    return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:2.2cqw">'
     + BMALL.map(function(m, j){
        var on = valda.indexOf(j) >= 0;
        return '<div style="background:'+pl+';border:1px solid '+(on?oli:line)+';padding:2.2cqw;'
         +'display:flex;flex-direction:column;gap:1.8cqw;opacity:'+(on?1:.45)+'">'
         +'<div style="display:flex;align-items:center;gap:1.6cqw">'+bTick(on, dark, 2.8)
           +'<span style="font-family:Montserrat,sans-serif;font-size:2.15cqw;font-weight:600;'
           +'letter-spacing:.16em;text-transform:uppercase;color:'+ink+'">'+esc(m.n)+'</span></div>'
         + bThumb(m.m, 0, 22, dark, "width:100%")
         +'<span style="font-family:Montserrat,sans-serif;font-size:1.9cqw;color:'+mut+'">'+esc(m.d)+'</span>'
         +'</div>';
       }).join("")
     +'</div>';
  }

  /* 03 — BILDEN. En mall åt gången, med orderns bilder som remsa under.
     Räknaren säger var i serien man är: mall 2 av 3. */
  if(st === 2){
    var o = ORDERS[0];
    return kort(
      '<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:2.2cqw">'
      + bLab("Till salu", dark)
      +'<span style="font-family:Montserrat,sans-serif;font-size:1.9cqw;color:'+mut+'">mall 2 av 3</span></div>'
      + bThumb("kitchen", 0, 34, dark, "width:100%")
      +'<div style="height:1px;background:'+line+';margin:2.6cqw 0"></div>'
      + bLab("Ur ordern · "+o.n+" bilder", dark, mut)
      +'<div style="display:flex;gap:1.2cqw;margin-top:1.8cqw">'
      + ["kitchen","hero","living","dining","boucle"].map(function(k, j){
          return bThumb(k, 13.4, 13.4, dark,
            j === 0 ? "outline:2px solid "+oli+";outline-offset:1px" : "opacity:.5");
        }).join("")
      +'</div>');
  }

  /* 04 — KONTROLLEN. Ingen ny information, bara det man redan valt,
     uppradat. Det är vad ett bekräftelsesteg ÄR. */
  if(st === 3){
    var rad = function(lab, val, sub){
      return '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:3cqw;'
       +'padding:2.1cqw 0;border-bottom:1px solid '+line+'">'
       +'<span style="font-family:Montserrat,sans-serif;font-size:1.9cqw;font-weight:500;'
       +'letter-spacing:.16em;text-transform:uppercase;color:'+mut+';flex:0 0 auto">'+esc(lab)+'</span>'
       +'<span style="text-align:right"><span style="display:block;font-family:Montserrat,sans-serif;'
       +'font-size:2.5cqw;color:'+ink+'">'+esc(val)+'</span>'
       + (sub ? '<span style="display:block;font-family:Montserrat,sans-serif;font-size:1.85cqw;'
         +'color:'+mut+';margin-top:.5cqw">'+esc(sub)+'</span>' : '')
       +'</span></div>';
    };
    return kort(rad("Objekt", ORDERS[0].addr, ORDERS[0].city)
      + rad("Mallar", "Tre", "Kommande · Till salu · Visning")
      + rad("Bilder", "Tre valda", "en per mall")
      + rad("Format", "4:5 · 1:1 · 9:16", "alla tre exporteras")
      +'<div style="display:flex;align-items:center;gap:2cqw;padding-top:2.6cqw">'
      + bTick(true, dark, 2.8)
      +'<span style="font-family:Montserrat,sans-serif;font-size:2.1cqw;color:'+ink+'">'
      +'Uppgifterna stämmer</span></div>');
  }

  /* 05 — KLAR. Resultatet, och först nu kanalerna. Delningen hör till
     slutet av flödet och ingen annanstans. */
  var klar = '<div style="display:flex;gap:1.8cqw;margin-bottom:2.8cqw">'
    + ["hero","kitchen","living"].map(function(k){
        return bThumb(k, 0, 27, dark, "flex:1");
      }).join("")
    +'</div>';
  return kort(klar
    +'<div style="height:1px;background:'+line+';margin-bottom:2.4cqw"></div>'
    + bLab("Anslutna kanaler", dark, mut)
    +'<div style="display:flex;gap:2.4cqw;margin-top:1.8cqw">'
    + BKANAL.map(function(c){
        return '<span style="display:flex;align-items:center;gap:1.4cqw;flex:1">'
         + bTick(true, dark, 2.6)
         +'<span><span style="display:block;font-family:Montserrat,sans-serif;font-size:2.15cqw;'
         +'color:'+ink+'">'+esc(c.n)+'</span>'
         +'<span style="display:block;font-family:Montserrat,sans-serif;font-size:1.8cqw;color:'+mut+'">'
         + esc(c.h)+'</span></span></span>';
      }).join("")
    +'</div>');
}

/* ---------- STEPS i arkiv ---------- */
A.steps = function(s,i,n){
  return A.chrome(s.k, i, n,
    '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:3.4cqw;padding:2cqw 0">'
   + bRail(s.step, false)
   +'<div>'
     +'<div class="a-d sm" style="'+dsize(s.h, 7.6, SERIF)+'">'+esc(s.h)+'</div>'
     + (s.s ? '<div class="a-l" style="font-size:2.5cqw;margin-top:1.8cqw;max-width:92%">'+esc(s.s)+'</div>' : '')
   +'</div>'
   + bBody(s, false)
   +'</div>');
};
/* ---------- STEPS i skugga ---------- */
B.steps = function(s,i,n){
  return B.shell(B.kick(s.k)
   +'<div class="z" style="left:6cqw;right:6cqw;top:'+(SAFE.top+9)+'cqw">'+bRail(s.step, true)+'</div>'
   +'<div class="z" style="left:6cqw;right:6cqw;top:'+(SAFE.top+22)+'cqw">'
     +'<div class="b-d" style="'+dsize(s.h, 7.2, SERIF)+'">'+esc(s.h)+'</div>'
     + (s.s ? '<div class="b-l" style="font-size:2.4cqw;margin-top:1.8cqw;max-width:92%">'+esc(s.s)+'</div>' : '')
   +'</div>'
   +'<div class="z" style="left:6cqw;right:6cqw;top:'+(SAFE.top+42)+'cqw">'+bBody(s, true)+'</div>'
   + B.foot(i,n));
};

/* =====================================================================
   SHARE — dela och schemalägg

   Egen bildruta, för det är en egen sak. Fem steg bygger kampanjen;
   det här är vad som händer efteråt. Två kanaler, ett val mellan nu
   och senare, och en tidsangivelse. Ingenting mer — en schemaläggare
   som visar en hel kalender skulle säga mindre, inte mer.
   ===================================================================== */
function bShare(dark){
  var line = dark ? "#33332F" : "#D8D2CF";
  var pl   = dark ? "#141416" : "#FFFFFF";
  var ink  = dark ? "#EFEDE7" : "#1C1C1E";
  var mut  = dark ? "#8E8C86" : "#7A736F";
  var oli  = dark ? "#98A088" : "#6E7266";
  var val = function(t, d, on){
    return '<div style="flex:1;border:1px solid '+(on?oli:line)+';background:'+(on?(dark?"#1A1E18":"#F4F2ED"):"transparent")
     +';padding:2.4cqw;display:flex;flex-direction:column;gap:1.2cqw;opacity:'+(on?1:.5)+'">'
     +'<div style="display:flex;align-items:center;gap:1.4cqw">'+bTick(on, dark, 2.6)
       +'<span style="font-family:Montserrat,sans-serif;font-size:2.2cqw;font-weight:600;'
       +'letter-spacing:.14em;text-transform:uppercase;color:'+ink+'">'+esc(t)+'</span></div>'
     +'<span style="font-family:Montserrat,sans-serif;font-size:1.9cqw;color:'+mut+'">'+esc(d)+'</span></div>';
  };
  return '<div style="background:'+pl+';border:1px solid '+line+';padding:3cqw">'
   + BKANAL.map(function(c, j){
       return '<div style="display:flex;align-items:center;gap:2.2cqw;padding:2.2cqw 0'
        +(j ? ';border-top:1px solid '+line : '')+'">'
        + bTick(true, dark)
        +'<span style="flex:1"><span style="display:block;font-family:Montserrat,sans-serif;'
        +'font-size:2.6cqw;color:'+ink+'">'+esc(c.n)+'</span>'
        +'<span style="display:block;font-family:Montserrat,sans-serif;font-size:1.9cqw;color:'+mut+'">'
        + esc(c.h)+' · '+esc(c.d)+'</span></span>'
        +'<span style="font-family:Montserrat,sans-serif;font-size:1.8cqw;letter-spacing:.16em;'
        +'text-transform:uppercase;color:'+oli+'">Ansluten</span></div>';
     }).join("")
   +'<div style="height:1px;background:'+line+';margin:2.4cqw 0"></div>'
   +'<div style="display:flex;gap:2cqw">'+ val("Publicera nu","Går ut direkt", false)
   + val("Schemalägg","Tisdag 08:00", true) +'</div></div>';
}
A.share = function(s,i,n){
  return A.chrome(s.k, i, n,
    '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:3.4cqw;padding:2cqw 0">'
   +'<div><div class="a-d sm" style="'+dsize(s.h, 8.2, SERIF)+'">'+esc(s.h)+'</div>'
   + (s.s ? '<div class="a-l" style="font-size:2.5cqw;margin-top:1.8cqw;max-width:92%">'+esc(s.s)+'</div>' : '')
   +'</div>'
   + bShare(false)
   +'</div>');
};
B.share = function(s,i,n){
  return B.shell(B.kick(s.k)
   +'<div class="z" style="left:6cqw;right:6cqw;top:'+(SAFE.top+10)+'cqw">'
     +'<div class="b-d" style="'+dsize(s.h, 7.8, SERIF)+'">'+esc(s.h)+'</div>'
     + (s.s ? '<div class="b-l" style="font-size:2.4cqw;margin-top:1.8cqw;max-width:92%">'+esc(s.s)+'</div>' : '')
   +'</div>'
   +'<div class="z" style="left:6cqw;right:6cqw;top:'+(SAFE.top+34)+'cqw">'+bShare(true)+'</div>'
   + B.foot(i,n));
};
