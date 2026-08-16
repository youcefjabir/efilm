/* =====================================================================
   VIEWLY — HIGHLIGHTS STUDIO
   Två riktningar vidareutvecklade ur ARKIV och SKUGGA.
   Ingen riktning är vald. Inget är publicerat. Inget flöde är rört.
   ===================================================================== */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var state={sec:"riktning", dir:"arkiv", ig:false, needs:false};
var byId={}; HL.forEach(function(h){byId[h.id]=h});
function hlOf(id){return byId[id]}
var NW=["noll","en","två","tre","fyra","fem","sex","sju","åtta","nio","tio","elva","tolv"];
function nw(n){return NW[n]||String(n)}
function cap(t){return t.charAt(0).toUpperCase()+t.slice(1)}
function totalStories(){return HL.reduce(function(a,h){return a+h.st.length},0)}
function refOf(r){var h=byId[r[0]]; return {h:h, s:h.st[r[1]], i:r[1], n:h.st.length}}

/* ---------- ram ---------- */
function frame(dirId, s, i, n, opts){
  opts=opts||{};
  var need = (state.needs && s.need)
    ? '<div style="position:absolute;left:0;right:0;top:'+(state.ig?21.3:0)+'cqw;z-index:40;background:#D9A46A;color:#1C1C1E;'
      +'font-family:Montserrat,sans-serif;font-size:2.1cqw;font-weight:600;letter-spacing:.14em;'
      +'text-transform:uppercase;padding:1.4cqw 2cqw;text-align:center">Behöver material</div>' : '';
  var ig = (opts.ig==null?state.ig:opts.ig) ? igOverlay(n,i) : '';
  return '<div class="frame">'+story(dirId,s,i,n)+ig+need+'</div>';
}
function coverEl(dirId,h){ return '<div class="cvr">'+cover(dirId,h)+'</div>' }
function dirName(d){ return DIRS.filter(function(x){return x.id===d})[0].n }

/* ---------- kontroller ---------- */
function dirbar(){
  return '<div class="dirbar">'+DIRS.map(function(d){
    return '<button class="dirb" type="button" data-dir="'+d.id+'" aria-pressed="'+(state.dir===d.id)+'">'
      +'<b>'+d.n+'</b><span>'+d.tag+'</span></button>'}).join("")+'</div>';
}
function toggles(withNeeds){
  return '<div class="ctl">'
   +'<label class="tg"><input type="checkbox" data-t="ig"'+(state.ig?" checked":"")+'> Instagrams UI</label>'
   +(withNeeds?'<label class="tg"><input type="checkbox" data-t="needs"'+(state.needs?" checked":"")+'> Markera saknat material</label>':'')
   +'<span class="mut" style="font-size:11.5px">Overlayen är Instagrams riktiga gränssnitt i skala — ingen debugfärg, inga zonrutor.</span></div>';
}

/* =====================================================================
   01 · RIKTNING
   ===================================================================== */
var CMP=[["viewly",1],["seendet",4],["forvandling",1]];
function secRiktning(){
  var panels=DIRS.map(function(d){
    var r=refOf(d.hero);
    return '<div class="dp">'
     +'<div class="dphead"><b>'+d.n+'</b><span>'+d.tag+'</span></div>'
     +'<div class="dpbody">'
       +'<div class="dpshot">'+frame(d.id,r.s,r.i,r.n)+'</div>'
       +'<div class="dptext">'
         +'<p>'+d.desc+'</p>'
         +'<div class="pals">'+d.pal.map(function(p){
             return '<span class="sw"><i style="background:'+p[0]+'"></i><b>'+p[1]+'</b><code>'+p[0]+'</code></span>'}).join("")+'</div>'
         +'<dl class="kv"><dt>Typografi</dt><dd>'+d.type+'</dd>'
           +'<dt>Logotyp</dt><dd>'+d.logo+'</dd>'
           +'<dt>Cover</dt><dd>'+d.cov+'</dd>'
           +'<dt>Risk</dt><dd>'+d.risk+'</dd></dl>'
       +'</div></div></div>';
  }).join("");

  var rows=CMP.map(function(ref){
    var r=refOf(ref);
    return '<div class="cmprow">'
      +'<div class="cmplab"><b>'+r.h.name+'</b><span>'+String(r.i+1).padStart(2,"0")+' · '+r.s.p+'</span>'
        +'<em>'+(r.s.h||r.s.k||"—")+'</em></div>'
      +DIRS.map(function(d){
        return '<button class="cmpcell specbtn" type="button" data-play="'+r.h.id+':'+r.i+':'+d.id+'">'
          +frame(d.id,r.s,r.i,r.n)+'</button>'}).join("")
      +'</div>';
  }).join("");

  return sechead("Riktning","Två riktningar, inte tre",
    "ARKIV och SKUGGA är vidareutvecklade ur de ursprungliga spåren. Båda bygger på samma nio kompositionsprimitiv och "
   +"samma innehåll — skillnaden ligger i grund, ljus och hur fotografiet används. Ingen riktning är vald.")
   +'<div class="dps">'+panels+'</div>'
   +'<h3 class="h3">Samma Story, två riktningar</h3>'
   +toggles(false)
   +'<div class="cmphead"><div></div>'+DIRS.map(function(d){return '<span>'+d.n+'</span>'}).join("")+'</div>'
   +rows;
}

/* =====================================================================
   02 · KOMPOSITIONER
   ===================================================================== */
function secKomp(){
  var cards=SPECS.map(function(sp){
    var r=refOf(sp.ref), p=PRIMS.filter(function(x){return x.id===sp.p})[0];
    return '<div class="spec">'
      +'<button class="specbtn" type="button" data-play="'+r.h.id+':'+r.i+':'+state.dir+'">'+frame(state.dir,r.s,r.i,r.n)+'</button>'
      +'<div class="speccap"><span class="t">'+p.n+'</span><span class="p">'+p.id+'</span></div>'
      +'<p class="specd">'+p.d+'</p></div>';
  }).join("");
  var counts={}; HL.forEach(function(h){h.st.forEach(function(s){counts[s.p]=(counts[s.p]||0)+1})});
  var total=totalStories();
  var bars=PRIMS.map(function(p){
    var c=counts[p.id]||0, pct=Math.round(c/total*100);
    return '<div class="bar"><span class="bn">'+p.n+'</span>'
      +'<span class="bt"><i style="width:'+(c/12*100)+'%"></i></span>'
      +'<span class="bv">'+c+' <em>'+pct+'%</em></span></div>';
  }).join("");
  var owns=(counts.fullbleed||0)+(counts["case"]||0);
  return sechead("Kompositioner","Nio primitiv — inte helbild på allt",
    "Varje Story byggs av ett av nio primitiv. Bara två av dem — full bleed och case — låter fotografiet äga hela ytan, "
   +"och de är "+owns+" av "+total+" bildrutor ("+Math.round(owns/total*100)+" %). Övriga "+(total-owns)+" bärs av typografi, "
   +"linje, plåt och luft, med bilden i en mask. Fördelningen nedan är den faktiska fördelningen i biblioteket.")
   +dirbar()+toggles(true)
   +'<div class="specimens">'+cards+'</div>'
   +'<h3 class="h3">Fördelning över biblioteket</h3><div class="bars">'+bars+'</div>';
}

/* =====================================================================
   03 · PROFIL
   ===================================================================== */
function secProfil(){
  var phones=DIRS.map(function(d){
    var hl=HL.map(function(h){
      return '<button class="ighli" type="button" data-play="'+h.id+':0:'+d.id+'">'
        +'<span class="ring"><span>'+coverEl(d.id,h)+'</span></span>'
        +'<span class="lb">'+h.label+'</span></button>';
    }).join("");
    var grid=["hero","kitchen","living","dining","boucle","eames","drone","matterport","om3"].map(function(k){
      return '<div style="'+bg(k)+'"></div>'}).join("");
    return '<div class="phone"><div class="igbody">'
     +'<div class="igtop">viewly.se</div>'
     +'<div class="igmain"><div class="igav">'+vmark("#1C1C1E","#6E7266")+'</div>'
       +'<div class="igstats">'
       +'<div class="igstat"><b>—</b>inlägg</div><div class="igstat"><b>—</b>följare</div><div class="igstat"><b>—</b>följer</div></div></div>'
     +'<div class="igbio"><div class="nm">Viewly</div><div class="cat">Bostadsmedia</div>'
       +'Foto, film, 3D och annonsmaterial i en presentation.<div class="lk">viewly.se</div></div>'
     +'<div class="igbtns"><div class="igbtn pri">Följ</div><div class="igbtn">Meddelande</div><div class="igbtn">▾</div></div>'
     +'<div class="ighl">'+hl+'</div>'
     +'<div class="igtabs"><span>INLÄGG</span><span>REELS</span><span>TAGGADE</span></div>'
     +'<div class="iggrid">'+grid+'</div></div>'
     +'<div class="phonecap"><b>'+d.n+'</b><span>'+d.tag+'</span></div></div>';
  }).join("");

  var strip=DIRS.map(function(d){
    return '<div class="mini"><div class="minirow">'+HL.map(function(h){
      return '<span class="m56">'+coverEl(d.id,h)+'</span>'}).join("")+'</div>'
      +'<div class="minicap"><b>'+d.n+'</b> · 56 px — så stort covret faktiskt är</div></div>';
  }).join("");

  return sechead("Profil","Raden är ett eget designproblem",
    cap(nw(HL.length))+" covers, 64 px breda, som en horisontell rad ovanför rutnätet. De ska gå att skilja åt i ögonvrån, i den "
   +"ordning en ny besökare läser dem: vad är det, hur ser det ut, vad kan jag få, funkar det, vilka är ni, hur börjar jag.")
   +'<div class="phones">'+phones+'</div>'
   +'<h3 class="h3">Igenkänning i verklig storlek</h3><div class="minis">'+strip+'</div>'
   +'<h3 class="h3">Ordning och roll</h3><div class="tw"><table><thead><tr>'
   +'<th style="width:44px">#</th><th>Highlight</th><th>Frågan den svarar på</th><th>Roll</th><th style="width:64px">Stories</th></tr></thead><tbody>'
   +HL.map(function(h){return '<tr><td class="mono">'+h.num+'</td><td><b>'+h.name+'</b></td>'
     +'<td class="mut">'+h.q+'</td><td class="mut">'+h.why+'</td><td class="mono">'+h.st.length+'</td></tr>'}).join("")
   +'</tbody></table></div>';
}

/* =====================================================================
   04 · BIBLIOTEK
   ===================================================================== */
function secBib(){
  var need=0; HL.forEach(function(h){h.st.forEach(function(s){if(s.need)need++})});
  var cards=HL.map(function(h){
    var strip=h.st.slice(0,6).map(function(s,i){
      return '<i>'+story(state.dir,s,i,h.st.length)+'</i>'}).join("");
    return '<button class="hlcard" type="button" data-play="'+h.id+':0:'+state.dir+'">'
      +'<span class="top"><span class="cvw">'+coverEl(state.dir,h)+'</span>'
        +'<span class="tt"><b>'+h.name+'</b><span>'+h.q+'</span></span></span>'
      +'<span class="strip">'+strip+'</span>'
      +'<span class="foot"><span>'+h.st.length+' Stories</span><span class="mono">'+h.num+'</span></span></button>';
  }).join("");
  return sechead("Bibliotek",cap(nw(HL.length))+" kapitel, "+totalStories()+" Stories",
    "Hela biblioteket renderat i den valda riktningen. Klicka på ett kapitel för att spela upp sekvensen — "
   +need+" bildrutor är markerade som Behöver material och renderas med platshållare tills rätt bild finns.")
   +dirbar()+toggles(true)
   +'<div class="hlgrid">'+cards+'</div>';
}

/* =====================================================================
   05 · LAGER OCH MEDIA
   ===================================================================== */
function secLager(){
  var lay=LAYERS.map(function(l){
    var c=l.s==="LÅST"?"lock":l.s==="REDIGERBAR"?"edit":"semi";
    return '<div class="lay '+c+'"><b>'+l.s+'</b><span class="ln">'+l.n+'</span><span class="ld">'+l.d+'</span></div>';
  }).join("");
  var r=refOf(["seendet",4]);
  return sechead("Lager och media","Vad som är låst och vad som får röra sig",
    "Systemet är bara användbart om någon annan kan producera i det utan att designen glider. Därför är varje lager "
   +"klassat. Media-sloten till höger är live: byt bild, dra i fokalpunkt och zoom — masken, marginalerna och typskalan "
   +"står still.")
   +'<div class="lgrid">'
     +'<div class="lcol">'+lay+'</div>'
     +'<div class="mcol"><div class="mstage" id="mstage">'+frame(state.dir,r.s,r.i,r.n)+'</div>'
       +'<div class="mctl" id="mctl">'+mediaCtl(r.s.sid,r.s.m)+'</div></div>'
   +'</div>'
   +'<h3 class="h3">Geometri och zoner</h3>'
   +'<div class="grid g2">'
   +'<div class="card"><div class="eyebrow">Verifierad logotyp</div>'
     +'<div class="geo">'+vmark("#141416","#6E7266",'style="width:76px;height:auto"')
     +'<dl class="kv"><dt>viewBox</dt><dd>'+GEO.vb+'</dd><dt>Vinkel</dt><dd>'+GEO.angle.toFixed(1)+'° · tan '+GEO.tan+'</dd>'
     +'<dt>Punkt</dt><dd>cx '+GEO.dot.cx+' · cy '+GEO.dot.cy+' · r '+GEO.dot.r+'</dd>'
     +'<dt>Svart</dt><dd>'+GEO.black+'</dd><dt>IoU</dt><dd>'+GEO.iou+' mot original-PNG</dd></dl></div></div>'
   +'<div class="card"><div class="eyebrow">Två zoner</div>'
     +'<p class="mut" style="font-size:12.5px;margin-top:9px;line-height:1.62">'
     +'<b style="color:var(--ink)">Canvas</b> — hela 1080 × 1920. Fotografi, papper, masker, gradienter och geometri '
     +'får bo här och gå ut i kant.<br><br>'
     +'<b style="color:var(--ink)">Kritisk</b> — 250 px topp och 320 px botten tillhör Instagram. Rubrik, brödtext, '
     +'kicker, folio, watermark och CTA håller sig innanför: '+SAFE.top+' cqw uppe, '+SAFE.bot+' cqw nere. '
     +'Slå på Instagrams UI i vilken vy som helst för att se det stämma.</p></div>'
   +'</div>';
}
function mediaCtl(slot, cur){
  var o=SLOTS[slot]||{};
  return '<div class="eyebrow">Media-slot <code class="mono">'+slot+'</code></div>'
   +'<div class="mrow">'+MEDIAKEYS.map(function(k){
      return '<button class="mi'+((o.img||cur)===k?" on":"")+'" type="button" data-mi="'+slot+':'+k+'" title="'+k+'">'
        +'<img src="'+(window.VMEDIA[k]||"")+'" alt=""></button>'}).join("")+'</div>'
   +'<label class="sl">Fokalpunkt Y <em>'+Math.round((o.fy!=null?o.fy:.5)*100)+'%</em>'
   +'<input type="range" data-sl="'+slot+':fy" min="0" max="100" value="'+Math.round((o.fy!=null?o.fy:.5)*100)+'"></label>'
   +'<label class="sl">Zoom <em>'+Math.round((o.zoom||1)*100)+'%</em>'
   +'<input type="range" data-sl="'+slot+':zoom" min="100" max="170" value="'+Math.round((o.zoom||1)*100)+'"></label>'
   +'<button class="tbtn" type="button" data-reset="'+slot+'">Återställ slot</button>';
}

/* =====================================================================
   SEKTIONER
   ===================================================================== */
function sechead(eb,t,l){
  return '<div class="sechead"><div class="eyebrow">'+eb+'</div><h2>'+t+'</h2><p class="lede">'+l+'</p></div>';
}
var SECTIONS=[
 {id:"riktning", n:"Riktning",     num:"01", f:secRiktning},
 {id:"komp",     n:"Kompositioner",num:"02", f:secKomp},
 {id:"profil",   n:"Profil",       num:"03", f:secProfil},
 {id:"bib",      n:"Bibliotek",    num:"04", f:secBib},
 {id:"lager",    n:"Lager & media",num:"05", f:secLager}
];

/* =====================================================================
   SPELARE
   ===================================================================== */
var P={hl:null,i:0,dir:null,timer:null,paused:false,DUR:5200};
function play(hid,idx,dir){
  P.hl=hlOf(hid); P.i=idx||0; P.dir=dir||state.dir; P.paused=false;
  $("#player").setAttribute("data-on",""); document.body.style.overflow="hidden";
  drawPlayer();
}
function closeP(){
  $("#player").removeAttribute("data-on"); document.body.style.overflow="";
  clearTimeout(P.timer); P.hl=null;
}
function drawPlayer(){
  if(!P.hl) return;
  var h=P.hl, n=h.st.length, s=h.st[P.i];
  $("#pstage").innerHTML='<div class="frame" style="position:absolute;inset:0;border-radius:0">'
    +story(P.dir,s,P.i,n)+(state.ig?igOverlay(n,P.i):'')+'</div>'
    +'<div class="pbars">'+h.st.map(function(_,j){
        return '<i class="'+(j<P.i?"done":j===P.i?"now":"")+'"><b></b></i>'}).join("")+'</div>'
    +'<div class="pnav"><button id="pprev" type="button" aria-label="Föregående"></button>'
    +'<button id="pnext" type="button" aria-label="Nästa"></button></div>';
  $("#pstage").style.setProperty("--dur",(P.DUR/1000)+"s");
  var slots=[{k:Array.isArray(s.m)?s.m[0]:s.m, id:s.sid}];
  if(Array.isArray(s.m)) slots.push({k:s.m[1], id:s.sid+"-b"});
  $("#pside").innerHTML='<div class="eyebrow" style="color:#8A8E92">'+dirName(P.dir)+'</div>'
   +'<h4>'+h.name+'</h4>'
   +'<div class="row"><span>Bildruta</span><span>'+String(P.i+1).padStart(2,"0")+' / '+String(n).padStart(2,"0")+'</span></div>'
   +'<div class="row"><span>Primitiv</span><span>'+s.p+'</span></div>'
   +'<div class="row"><span>Kapitel</span><span>'+h.num+'</span></div>'
   +(s.h?'<div class="pcopy"><b style="color:#fff;font-weight:600">'+esc(s.h)+'</b>'
      +(s.em?'<br><i>'+esc(s.em)+'</i>':'')+(s.s?'<br>'+esc(s.s):'')+'</div>':'')
   +(s.need?'<div class="pneed">'+esc(s.need)+'</div>':'')
   +'<div class="pctl"><button type="button" data-pd="arkiv"'+(P.dir==="arkiv"?' class="on"':'')+'>ARKIV</button>'
     +'<button type="button" data-pd="skugga"'+(P.dir==="skugga"?' class="on"':'')+'>SKUGGA</button></div>'
   +'<label class="tg dark"><input type="checkbox" data-t="ig"'+(state.ig?" checked":"")+'> Instagrams UI</label>'
   +'<label class="tg dark"><input type="checkbox" id="ppause"'+(P.paused?" checked":"")+'> Pausa</label>'
   +(s.p==="cta"||s.p==="quiet"||s.p==="system"
      ? '<p class="mut" style="font-size:11.5px;line-height:1.55">Den här bildrutan använder inget fotografi.</p>'
      : slots.map(function(sl){return '<div class="pslot">'+mediaCtl(sl.id, sl.k)+'</div>'}).join(""))
   +'<div class="phint">← → bläddrar · Esc stänger</div>';
  clearTimeout(P.timer);
  if(!P.paused) P.timer=setTimeout(function(){step(1)}, P.DUR);
}
function step(d){
  if(!P.hl) return;
  var j=P.i+d;
  if(j<0) j=0;
  if(j>=P.hl.st.length){ closeP(); return }
  P.i=j; drawPlayer();
}

/* =====================================================================
   RENDER
   ===================================================================== */
function render(){
  var s=SECTIONS.filter(function(x){return x.id===state.sec})[0];
  $("#canvas").innerHTML='<div class="sec" data-on>'+s.f()+'</div>';
  document.querySelectorAll(".navb").forEach(function(b){
    b.setAttribute("aria-current", String(b.dataset.s===state.sec))});
  window.scrollTo(0,0);
}
$("#nav").innerHTML=SECTIONS.map(function(s){
  return '<button class="navb" type="button" data-s="'+s.id+'" aria-current="'+(s.id===state.sec)+'">'
   +'<span class="n">'+s.num+'</span><span class="lbl">'+s.n+'</span></button>'}).join("");
$("#railmark").innerHTML=vmark("#1C1C1E","#6E7266")+'<span class="brandname">VIEWLY</span>';

document.addEventListener("click",function(e){
  var n=e.target.closest(".navb"); if(n){state.sec=n.dataset.s;render();return}
  var d=e.target.closest("[data-dir]"); if(d){state.dir=d.dataset.dir;render();return}
  var p=e.target.closest("[data-play]");
  if(p){var q=p.dataset.play.split(":");play(q[0],+q[1],q[2]);return}
  if(e.target.closest("#pclose")){closeP();return}
  if(e.target.closest("#pnext")){step(1);return}
  if(e.target.closest("#pprev")){step(-1);return}
  var pd=e.target.closest("[data-pd]"); if(pd){P.dir=pd.dataset.pd;drawPlayer();return}
  var mi=e.target.closest("[data-mi]");
  if(mi){var a=mi.dataset.mi.split(":");
    SLOTS[a[0]]=Object.assign({},SLOTS[a[0]],{img:a[1]}); afterSlot(a[0]); return}
  var rs=e.target.closest("[data-reset]");
  if(rs){delete SLOTS[rs.dataset.reset]; afterSlot(rs.dataset.reset); return}
});
document.addEventListener("input",function(e){
  var k=e.target.dataset&&e.target.dataset.sl; if(!k) return;
  var a=k.split(":"), v=+e.target.value;
  SLOTS[a[0]]=Object.assign({},SLOTS[a[0]], a[1]==="fy"?{fy:v/100}:{zoom:v/100});
  var lab=e.target.closest(".sl"); if(lab) lab.querySelector("em").textContent=v+"%";
  afterSlot(a[0], true);
});
function afterSlot(slot, live){
  if(P.hl){ drawPlayer(); if(live) restoreFocus(slot); return }
  if(state.sec==="lager"){
    var r=(function(){var h=byId["seendet"];return {s:h.st[4],i:4,n:h.st.length}})();
    var stg=$("#mstage"); if(stg) stg.innerHTML=frame(state.dir,r.s,r.i,r.n);
    if(!live){var c=$("#mctl"); if(c) c.innerHTML=mediaCtl(r.s.sid, r.s.m)}
    return;
  }
  render();
}
function restoreFocus(){}
document.addEventListener("change",function(e){
  var t=e.target.dataset&&e.target.dataset.t;
  if(t==="ig"){state.ig=e.target.checked; if(P.hl) drawPlayer(); else render(); return}
  if(t==="needs"){state.needs=e.target.checked; render(); return}
  if(e.target.id==="ppause"){P.paused=e.target.checked; drawPlayer(); return}
});
document.addEventListener("keydown",function(e){
  if(!P.hl) return;
  if(e.key==="Escape") closeP();
  else if(e.key==="ArrowRight") step(1);
  else if(e.key==="ArrowLeft") step(-1);
});
$("#theme").onclick=function(){
  var r=document.documentElement, c=r.getAttribute("data-theme");
  var d=window.matchMedia("(prefers-color-scheme:dark)").matches;
  r.setAttribute("data-theme", c ? (c==="dark"?"light":"dark") : (d?"light":"dark"));
};
var s=document.createElement("style"); s.textContent=CSS; document.head.appendChild(s);
render();
})();
