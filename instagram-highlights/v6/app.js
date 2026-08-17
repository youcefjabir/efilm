/* =====================================================================
   VIEWLY — HIGHLIGHTS STUDIO
   Två riktningar vidareutvecklade ur ARKIV och SKUGGA.
   Ingen riktning är vald. Inget är publicerat. Inget flöde är rört.
   ===================================================================== */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var state={sec:"riktning", dir:"arkiv", ig:false, needs:false, edit:null};
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
   EXPORT — PNG rakt ur webbläsaren
   Ramarna är HTML/CSS, inte bilder. De serialiseras till ett SVG med
   foreignObject, rastreras i en canvas och lämnas över till claude.use
   ("downloads"). Allt — typsnitt och foton — ligger redan som data-URI,
   så inget externt hämtas och canvasen blir aldrig tainted.
   ===================================================================== */
var FRAMECSS = '.__fr *{box-sizing:border-box}.__fr{text-align:left;position:relative;overflow:hidden;'
  + 'container-type:inline-size;font-family:Montserrat,sans-serif}';
var DL = null, dlTried = false;
async function downloads(){
  if(!dlTried){ dlTried = true;
    try { DL = (window.claude && claude.use) ? await claude.use("downloads") : null } catch(e){ DL = null }
  }
  return DL;
}
function xhtml(html, w, h, bgc){
  var d = document.createElement("div");
  d.setAttribute("xmlns","http://www.w3.org/1999/xhtml");
  d.className = "__fr";
  d.setAttribute("style","width:"+w+"px;height:"+h+"px;background:"+(bgc||"#EFECE7"));
  d.innerHTML = html;
  return new XMLSerializer().serializeToString(d);
}
function svgDoc(w, h, body, extraCSS){
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'
   +'<style type="text/css">/*<![CDATA[*/'+(window.VFONTS||"")+FRAMECSS+CSS+(extraCSS||"")+'/*]]>*/</style>'
   + body +'</svg>';
}
function rasterize(svg, w, h){
  return new Promise(function(res, rej){
    var img = new Image();
    img.onload = function(){
      var c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      c.toBlob(function(b){ b ? res(b) : rej(new Error("toBlob")) }, "image/png");
    };
    img.onerror = function(){ rej(new Error("rasterize")) };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}
/* en ram i full Story-upplösning */
function framePNG(html, w, h, bgc, extraCSS){
  return rasterize(svgDoc(w, h,
    '<foreignObject x="0" y="0" width="'+w+'" height="'+h+'">'+xhtml(html,w,h,bgc)+'</foreignObject>', extraCSS), w, h);
}
/* Videoexportens overlay: riktningens grundyta måste bort, annars ligger
   ARKIV:s papper respektive SKUGGAs svarta bakom videorutan och täcker den.
   Grundfärgen målas i stället direkt i canvasen, under klippet. */
var HOLE_CSS = '.a,.b{background:transparent!important}';
var SHELL_BG = {arkiv:"#F2EFEF", skugga:"#0E0E0D"};
/* hela kapitlet som en kontaktkarta — en fil istället för sju dialoger */
function sheetPNG(dirId, hl, cw){
  var ch = Math.round(cw*16/9), gap = Math.round(cw*.05), pad = gap, n = hl.st.length;
  var W = pad*2 + n*cw + (n-1)*gap, H = pad*2 + ch + Math.round(cw*.13);
  var bgc = dirId==="skugga" ? "#0E0E0D" : "#EFECE7";
  var body = '<rect width="'+W+'" height="'+H+'" fill="'+(dirId==="skugga"?"#141414":"#E9E8E5")+'"/>';
  hl.st.forEach(function(s,i){
    var x = pad + i*(cw+gap);
    body += '<foreignObject x="'+x+'" y="'+pad+'" width="'+cw+'" height="'+ch+'">'
          + xhtml(s.html, cw, ch, bgc) + '</foreignObject>'
          + '<text x="'+x+'" y="'+(pad+ch+Math.round(cw*.075))+'" font-family="Montserrat,sans-serif" '
          + 'font-size="'+Math.round(cw*.042)+'" letter-spacing="'+(cw*.006).toFixed(1)+'" '
          + 'fill="'+(dirId==="skugga"?"#8C8A84":"#63676A")+'">'
          + String(i+1).padStart(2,"0") + '  ' + esc(s.lab).toUpperCase() + '</text>';
  });
  return rasterize(svgDoc(W, H, body), W, H);
}
function slug(t){
  return String(t).toLowerCase().replace(/[åä]/g,"a").replace(/ö/g,"o")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
/* Bara en dialogruta åt gången får vara öppen. Kommer nästa för tätt svarar
   runtimen rate_limited — det är inte ett fel utan "vänta". Serien stannade
   på första filen för att det behandlades som dödligt. */
var lastCode = "";
function wait(ms){ return new Promise(function(r){ setTimeout(r, ms) }) }

async function saveOnce(blob, filename){
  var dl = await downloads();
  if(!dl) throw {code:"unavailable"};
  return dl.save({filename:filename, data:blob});
}
/* försöker om vid rate_limited, ger upp vid declined */
async function saveRetry(blob, filename, onWait){
  var delay = 700;
  for(var attempt = 0; attempt < 8; attempt++){
    try { await saveOnce(blob, filename); lastCode = "saved"; return true }
    catch(e){
      var code = (e && e.code) || "unknown";
      lastCode = code;
      if(code !== "rate_limited") throw e;
      if(onWait) onWait(attempt + 1);
      await wait(delay);
      delay = Math.min(delay * 1.6, 4000);
    }
  }
  throw {code:"rate_limited"};
}
function codeText(code){
  return code==="declined"    ? "Du avbröt" :
         code==="unavailable" ? "Öppna sidan på claude.ai för att ladda ner" :
         code==="too_large"   ? "Filen är för stor" :
         code==="rate_limited"? "Dialogrutan hann inte stängas" :
         code==="rejected_extension" || code==="extension_not_enabled" ? "Filtypen tillåts inte" :
         "Kunde inte spara (" + code + ")";
}
function status(txt){
  var el = document.getElementById("dlstat");
  if(el) el.textContent = txt || "";
}
async function offer(blob, filename, btn){
  var lbl = btn && btn.textContent;
  try {
    await saveRetry(blob, filename, function(n){
      if(btn) btn.textContent = "Väntar på dialogrutan… " + n;
    });
    if(btn){ btn.textContent = "Sparad ✓"; setTimeout(function(){ btn.textContent = lbl }, 2200) }
    status("Sparad: " + filename);
    return true;
  } catch(e){
    var code = (e && e.code) || "unknown";
    if(btn){ btn.textContent = codeText(code); setTimeout(function(){ btn.textContent = lbl }, 3400) }
    status(codeText(code) + " · kod " + code);
    return false;
  }
}

/* =====================================================================
   EXPORT — en kö, allt som syns

   Tidigare fanns nedladdning bara på tre ställen: en bildruta, ett
   omslag och de fyra kampanjmallarna. Allt annat gick att titta på men
   inte att få ut — kompositionerna, kontaktkartorna, motionens
   nyckelbilder, en hel riktning på en gång. Det var fel: kan man se det
   ska man kunna ladda ner det.

   Ett jobb är {n: filnamn, w, h, bg, f: () => html} eller, för det som
   inte är en enkel bildruta, {n, b: () => Promise<Blob>}. HTML byggs
   först när rutan ska rastreras, så en lista på 200 filer kostar
   ingenting förrän den körs. Samma kö driver en enda fil och hela
   biblioteket — det finns bara en väg ut.
   ===================================================================== */
function pad2(v){ return String(v).padStart(2,"0") }
function pad3(v){ return String(v).padStart(3,"0") }
function paperOf(d, light){ return d==="skugga" ? "#0E0E0D" : (light || "#EFECE7") }
function job(name, htmlFn, w, h, bg){
  return {n:name, w:w||1080, h:h||1920, bg:bg,
          f:(typeof htmlFn === "function") ? htmlFn : function(){ return htmlFn }};
}

var busy = false;
async function runJobs(jobs, btn){
  if(busy) return false;
  busy = true;
  var lbl = btn.textContent, n = jobs.length, ok = 0, failed = [];
  btn.disabled = true;
  var dl = await downloads();
  if(!dl){
    btn.textContent = codeText("unavailable"); btn.disabled = false; busy = false;
    status(codeText("unavailable"));
    setTimeout(function(){ btn.textContent = lbl }, 3400);
    return false;
  }
  for(var i = 0; i < n; i++){
    var j = jobs[i], blob;
    btn.textContent = n>1 ? ("Renderar " + (i+1) + " / " + n + "…") : "Renderar…";
    try { blob = j.b ? await j.b() : await framePNG(j.f(), j.w, j.h, j.bg) }
    catch(e){ failed.push(j.n); continue }
    if(n>1) btn.textContent = "Sparar " + (i+1) + " / " + n + "…";
    try {
      await saveRetry(blob, j.n, (function(ix){ return function(k){
        btn.textContent = "Väntar " + (ix+1) + " / " + n + "… " + k } })(i));
      ok++;
    } catch(e){
      var code = (e && e.code) || "unknown";
      if(code === "declined"){            /* medvetet nej — sluta fråga */
        btn.disabled = false; busy = false;
        btn.textContent = ok + " av " + n + " sparade";
        status("Avbrutet. " + ok + " av " + n + " sparade.");
        setTimeout(function(){ btn.textContent = lbl }, 3800);
        return false;
      }
      failed.push(j.n);
    }
    if(i < n-1) await wait(650);          /* låt dialogrutan stängas helt */
  }
  btn.disabled = false; busy = false;
  btn.textContent = n===1 ? (ok ? "Sparad ✓" : codeText(lastCode))
                          : (ok + " av " + n + " sparade" + (failed.length ? " ✕" : " ✓"));
  status(failed.length
    ? (ok + " sparade · misslyckades på " + failed.slice(0,2).join(", ") + (failed.length>2 ? " m.fl." : ""))
    : (n===1 ? "Sparad: " + jobs[0].n : "Alla " + ok + " filer sparade"));
  setTimeout(function(){ btn.textContent = lbl }, 3800);
  return true;
}

/* ---------- vad som går att bygga ----------
   Varje byggare tar knappens data-attribut och returnerar en jobblista.
   Att lägga till en ny exportyta är att lägga till en rad här. */
var BUILD = {
  frame: function(a){
    var h = hlOf(a.hl), i = +a.i, d = a.ddir;
    return [job("viewly-"+d+"-"+slug(h.name)+"-"+pad2(i+1)+".png",
      function(){ return story(d, h.st[i], i, h.st.length) + (state.ig ? igOverlay(h.st.length, i) : "") },
      1080, 1920, paperOf(d))];
  },
  cover: function(a){
    var h = hlOf(a.hl), d = a.ddir;
    return [job("viewly-omslag-"+d+"-"+slug(h.name)+".png",
      function(){ return coverFrame(d, h) }, 1080, 1920, paperOf(d, "#F2EFEF"))];
  },
  sheet: function(a){
    var h = hlOf(a.hl), d = a.ddir;
    return [{n:"viewly-"+d+"-"+slug(h.name)+"-kontaktkarta.png",
             b:function(){ return sheetPNG(d, h, 540) }}];
  },
  /* ett helt kapitel: bildrutorna plus omslaget sist */
  chapter: function(a){
    var h = hlOf(a.hl), d = a.ddir, out = [];
    h.st.forEach(function(s, i){
      out.push(job("viewly-"+d+"-"+slug(h.name)+"-"+pad2(i+1)+".png",
        function(){ return story(d, s, i, h.st.length) + (state.ig ? igOverlay(h.st.length, i) : "") },
        1080, 1920, paperOf(d)));
    });
    return out.concat(BUILD.cover({hl:h.id, ddir:d}));
  },
  covers: function(a){
    return HL.map(function(h){ return BUILD.cover({hl:h.id, ddir:a.ddir})[0] });
  },
  sheets: function(a){
    return HL.map(function(h){ return BUILD.sheet({hl:h.id, ddir:a.ddir})[0] });
  },
  /* hela biblioteket i vald riktning — 90 bildrutor + 14 omslag */
  library: function(a){
    var out = [];
    HL.forEach(function(h){ out = out.concat(BUILD.chapter({hl:h.id, ddir:a.ddir})) });
    return out;
  },
  /* kampanjmallarna. ar satt = ett format, annars alla tre */
  post: function(a){
    var d = a.ddir, ar = a.ar, q = AR[ar];
    var p = POSTS.filter(function(x){ return x.id===a.pid })[0];
    if(!p) return [];
    return [job("viewly-"+d+"-"+p.id+"-"+p.phase+"-"+ar.replace(":","x")+".png",
      function(){ return post(d, p, ar) }, 1080, Math.round(1080*q[1]/q[0]), paperOf(d))];
  },
  posts: function(a){
    var d = a.ddir, ars = a.ar ? [a.ar] : ["4:5","1:1","9:16"], out = [];
    POSTS.forEach(function(p){ ars.forEach(function(ar){
      out = out.concat(BUILD.post({pid:p.id, ar:ar, ddir:d})) }) });
    return out;
  },
  /* kompositionerna — ett exempel per primitiv */
  prim: function(a){
    var d = a.ddir, sp = SPECS.filter(function(x){ return x.p===a.p })[0];
    if(!sp) return [];
    var r = refOf(sp.ref);
    return [job("viewly-komposition-"+d+"-"+sp.p+".png",
      function(){ return story(d, r.s, r.i, r.n) }, 1080, 1920, paperOf(d))];
  },
  prims: function(a){
    var out = [];
    SPECS.forEach(function(sp){ out = out.concat(BUILD.prim({p:sp.p, ddir:a.ddir})) });
    return out;
  },
  /* motion: de tre nyckelbilderna ur en riktning */
  mkf: function(a){
    var f = (MK[a.cand]||{})[a.mdir], d = a.ddir;
    if(!f) return [];
    return [0,.5,1].map(function(tt, k){
      return job("viewly-motion-"+a.cand+"-"+a.mdir+"-"+d+"-"+["start","nyckel","slut"][k]+".png",
        function(){ return f(d, tt) }, 1080, 1920, paperOf(d));
    });
  },
  /* motion: bildsekvens genom hela klippet, för klippning i annat program */
  mseq: function(a){
    var f = (MK[a.cand]||{})[a.mdir], d = a.ddir, n = Math.max(2, +(a.n || 16)), out = [];
    if(!f) return [];
    for(var k = 0; k < n; k++){
      out.push((function(tt, ix){
        return job("viewly-motion-"+a.cand+"-"+a.mdir+"-"+d+"-"+pad3(ix+1)+".png",
          function(){ return f(d, tt) }, 1080, 1920, paperOf(d));
      })(k/(n-1), k));
    }
    return out;
  },
  /* alla nyckelbilder: 7 kandidater × 3 riktningar × 3 lägen */
  allmkf: function(a){
    var out = [];
    MCAND.forEach(function(c){ MDIRS.forEach(function(dd){
      out = out.concat(BUILD.mkf({cand:c.id, mdir:dd.id, ddir:a.ddir})) }) });
    return out;
  }
};

/* ---------- ZIP ----------
   En uppsättning på 104 filer betyder 104 spardialoger. Det är inte en
   nedladdning, det är ett straff. Därför packas allt som är mer än en fil
   till ett arkiv: en dialog, en fil.

   Inget bibliotek. PNG är redan komprimerat, så posterna lagras utan
   deflate (metod 0) — då består en ZIP av tre saker: en lokal header per
   fil, en central katalog och en slutpost. Det enda som kräver riktig kod
   är CRC-32, och det är en tabell och en loop. */
var CRCT = (function(){
  var t = new Uint32Array(256);
  for(var n = 0; n < 256; n++){
    var c = n;
    for(var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(u8){
  var c = 0xFFFFFFFF;
  for(var i = 0; i < u8.length; i++) c = CRCT[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
async function zipBlob(files){
  var enc = new TextEncoder(), parts = [], central = [], offset = 0;
  var now = new Date();
  var dtime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
  var ddate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
  for(var i = 0; i < files.length; i++){
    var nameB = enc.encode(files[i].name);
    var data  = new Uint8Array(await files[i].blob.arrayBuffer());
    var crc   = crc32(data);
    var lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);            /* version som behövs */
    lh.setUint16(6, 0x0800, true);        /* filnamn i UTF-8 — å ä ö överlever */
    lh.setUint16(8, 0, true);             /* metod 0: lagrad */
    lh.setUint16(10, dtime, true); lh.setUint16(12, ddate, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true);
    lh.setUint32(22, data.length, true);
    lh.setUint16(26, nameB.length, true);
    parts.push(new Uint8Array(lh.buffer), nameB, data);
    var ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true);
    ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, dtime, true); ch.setUint16(14, ddate, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
    ch.setUint16(28, nameB.length, true);
    ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), nameB);
    offset += 30 + nameB.length + data.length;
  }
  var cdSize = central.reduce(function(a, x){ return a + x.length }, 0);
  var eo = new DataView(new ArrayBuffer(22));
  eo.setUint32(0, 0x06054b50, true);
  eo.setUint16(8, files.length, true); eo.setUint16(10, files.length, true);
  eo.setUint32(12, cdSize, true); eo.setUint32(16, offset, true);
  return new Blob(parts.concat(central, [new Uint8Array(eo.buffer)]), {type:"application/zip"});
}

/* Samma jobblista som runJobs, men allt hamnar i ett arkiv. */
async function runZip(jobs, btn, zipname){
  if(busy) return false;
  busy = true;
  var lbl = btn.textContent, n = jobs.length, files = [], failed = [];
  btn.disabled = true;
  var dl = await downloads();
  if(!dl){
    btn.textContent = codeText("unavailable"); btn.disabled = false; busy = false;
    status(codeText("unavailable"));
    setTimeout(function(){ btn.textContent = lbl }, 3400);
    return false;
  }
  for(var i = 0; i < n; i++){
    var j = jobs[i];
    btn.textContent = "Renderar " + (i+1) + " / " + n + "…";
    try {
      var blob = j.b ? await j.b() : await framePNG(j.f(), j.w, j.h, j.bg);
      files.push({name:j.n, blob:blob});
    } catch(e){ failed.push(j.n) }
    /* släpp tråden så knapptexten hinner ritas om */
    if((i & 3) === 3) await new Promise(function(r){ requestAnimationFrame(r) });
  }
  if(!files.length){
    btn.disabled = false; busy = false; btn.textContent = "Rendering misslyckades";
    setTimeout(function(){ btn.textContent = lbl }, 3000);
    return false;
  }
  btn.textContent = "Packar " + files.length + " filer…";
  var zip;
  try { zip = await zipBlob(files) }
  catch(e){
    btn.disabled = false; busy = false; btn.textContent = "Kunde inte packa";
    setTimeout(function(){ btn.textContent = lbl }, 3000);
    return false;
  }
  btn.disabled = false; busy = false;
  var ok = await offer(zip, zipname, btn);
  if(ok) status(files.length + " filer i " + zipname + " · " + fmtBytes(zip.size)
                + (failed.length ? " · " + failed.length + " misslyckades" : ""));
  return ok;
}

async function runExport(btn){
  if(P.hl){ P.paused = true; clearTimeout(P.timer) }
  var kind = btn.dataset.dl, mk = BUILD[kind];
  if(!mk) return;
  var jobs = [];
  try { jobs = mk(btn.dataset) || [] } catch(e){ jobs = [] }
  if(!jobs.length){ status("Inget att exportera"); return }
  if(btn.dataset.zip && jobs.length > 1){
    var nm = "viewly-" + (btn.dataset.zipname || kind) + "-" + (btn.dataset.ddir || state.dir) + ".zip";
    await runZip(jobs, btn, nm);
  } else {
    await runJobs(jobs, btn);
  }
}
function dlBtn(kind, attrs, label, cls){
  var a = Object.keys(attrs).map(function(k){ return ' data-'+k+'="'+attrs[k]+'"' }).join("");
  return '<button class="dlb'+(cls?" "+cls:"")+'" type="button" data-dl="'+kind+'"'+a+'>'+label+'</button>';
}
/* Ett arkiv i stället för en fil i taget. Används för allt som är mer än
   en handfull filer — annars blir nedladdningen en rad med dialogrutor. */
function zipBtn(kind, attrs, label, name, cls){
  var o = Object.assign({}, attrs, {zip:"1", zipname:name || kind});
  return dlBtn(kind, o, label, cls == null ? "pri" : cls);
}

/* =====================================================================
   VIDEO
   Ett uppladdat klipp läggs i samma slot som en bild. En stillbild ur
   klippet sparas som poster, så allt statiskt — miniatyrer, kontaktkarta,
   PNG-export — fungerar oförändrat. I studion spelas klippet i rutan.

   Videoexporten komponerar i en canvas: designen rastreras en gång med
   videorutan genomskinlig, sedan ritas klippet in i rutan bildruta för
   bildruta med designen ovanpå. MediaRecorder spelar in canvasen.
   ===================================================================== */
var VMAX = 20;                                    /* sekunder — en Story är kort */

function ingestVideo(file, done){
  var url = URL.createObjectURL(file);
  var v = document.createElement("video");
  v.preload = "auto"; v.muted = true; v.playsInline = true; v.src = url;
  var failed = function(){ done(null) };
  v.onerror = failed;
  v.onloadeddata = function(){
    var grab = function(){
      var c = document.createElement("canvas");
      var sc = Math.min(1, 1400/Math.max(v.videoWidth||1, v.videoHeight||1));
      c.width  = Math.max(2, Math.round((v.videoWidth||720)*sc));
      c.height = Math.max(2, Math.round((v.videoHeight||1280)*sc));
      try { c.getContext("2d").drawImage(v, 0, 0, c.width, c.height) } catch(e){ return failed() }
      var key = "video" + (++upN) + "-" + Date.now().toString(36).slice(-4);
      UPLOADS[key] = c.toDataURL("image/jpeg", 0.82);
      VIDEOS[key]  = {url:url, w:v.videoWidth, h:v.videoHeight,
                      dur:Math.min(isFinite(v.duration)?v.duration:5, VMAX), name:file.name};
      done(key);
    };
    if(v.duration && isFinite(v.duration) && v.duration > 0.4){
      v.onseeked = function(){ v.onseeked = null; grab() };
      try { v.currentTime = Math.min(0.35, v.duration/3) } catch(e){ grab() }
    } else grab();
  };
}

/* Efter varje rendering: lägg ett <video> i varje ruta som pekar på ett klipp. */
function mountVideos(root){
  root = root || document;
  root.querySelectorAll('[style*="--vk:"]').forEach(function(el){
    var k = (el.style.getPropertyValue("--vk") || "").trim();
    var v = VIDEOS[k];
    if(!v || el.querySelector("video.vfill")) return;
    var vd = document.createElement("video");
    vd.className = "vfill";
    vd.src = v.url; vd.muted = true; vd.loop = true; vd.autoplay = true;
    vd.playsInline = true; vd.setAttribute("playsinline", "");
    vd.style.objectPosition = "50% " + ((el.style.getPropertyValue("--vfy")||"50").trim()) + "%";
    el.appendChild(vd);
    var go = vd.play(); if(go && go.catch) go.catch(function(){});
  });
}

/* Var ligger videorutorna i en 1080-bred ram? Mät på en kopia utanför skärmen. */
function videoRects(html, w, h){
  var host = document.createElement("div");
  host.className = "__fr";
  host.setAttribute("style", "position:fixed;left:-99999px;top:0;width:"+w+"px;height:"+h+"px;"
    + "container-type:inline-size;overflow:hidden;text-align:left");
  host.innerHTML = html;
  document.body.appendChild(host);
  var hb = host.getBoundingClientRect(), out = [];
  host.querySelectorAll('[style*="--vk:"]').forEach(function(el){
    var k = (el.style.getPropertyValue("--vk")||"").trim();
    if(!VIDEOS[k]) return;
    var r = el.getBoundingClientRect();
    out.push({k:k, x:r.x-hb.x, y:r.y-hb.y, w:r.width, h:r.height,
              fy:parseFloat(el.style.getPropertyValue("--vfy")||"50")/100});
  });
  document.body.removeChild(host);
  return out;
}

function loadImg(src){
  return new Promise(function(res, rej){
    var i = new Image(); i.onload = function(){res(i)}; i.onerror = rej; i.src = src;
  });
}
/* MP4 först — det är vad Instagram tar emot — men vissa webbläsare säger sig
   klara det och muxar ändå en tom fil, så exporten faller tillbaka på WebM
   om resultatet blir noll byte. */
var MIMES = ["video/mp4;codecs=avc1.42E01E", "video/mp4",
             "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
function pickMime(skip){
  for(var i=0;i<MIMES.length;i++){
    var m = MIMES[i];
    if(skip && skip.indexOf(m)>=0) continue;
    if(window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m;
  }
  return null;
}

/* draw source into dest rect, cover-fit, honouring the slot's focal point */
function drawCover(g, src, sw, sh, r){
  if(!sw || !sh) return;
  var s = Math.max(r.w/sw, r.h/sh), dw = sw*s, dh = sh*s;
  var dx = r.x + (r.w - dw)/2;
  var dy = r.y + (r.h - dh)*(r.fy!=null ? r.fy : 0.5);
  g.drawImage(src, dx, dy, dw, dh);
}

async function exportVideo(btn){
  if(busy) return; busy = true;
  var lbl = btn.textContent;
  var h = hlOf(btn.dataset.vhl), i = +btn.dataset.vi, d = btn.dataset.vdir, n = h.st.length;
  btn.disabled = true; btn.textContent = "Förbereder…";
  try {
    VIDEO_HOLE = true;
    var holeHtml = story(d, h.st[i], i, n) + (state.ig ? igOverlay(n, i) : "");
    VIDEO_HOLE = false;
    var full = story(d, h.st[i], i, n);
    var rects = videoRects(full, 1080, 1920);
    if(!rects.length){
      btn.textContent = "Ingen video i den här rutan"; btn.disabled = false; busy = false;
      setTimeout(function(){ btn.textContent = lbl }, 2800); return;
    }
    var res = await renderVideoFrom(holeHtml, full, d, function(p){
      btn.textContent = "Spelar in " + Math.round(p*100) + " %";
    });
    btn.textContent = lbl; btn.disabled = false; busy = false;
    await offer(res.blob, "viewly-"+d+"-"+slug(h.name)+"-"+String(i+1).padStart(2,"0")+"."+res.ext, btn);
  } catch(e){
    btn.disabled = false; busy = false;
    btn.textContent = (e && e.message==="no-recorder") ? "Webbläsaren stödjer inte inspelning"
                    : (e && e.message==="empty") ? "Inspelningen blev tom"
                    : (e && e.message==="truncated") ? "Inspelningen blev avhuggen"
                    : (e && e.message==="no-video") ? "Ingen video i den här rutan" : "Inspelningen misslyckades";
    setTimeout(function(){ btn.textContent = lbl }, 3000);
  }
}
/* separat så att overlay-HTML och mät-HTML kan skilja sig åt */
async function renderVideoFrom(holeHtml, measureHtml, dirId, onProgress, skip){
  var w = 1080, h = 1920, bgc = SHELL_BG[dirId] || SHELL_BG.arkiv;
  var rects = videoRects(measureHtml, w, h);
  if(!rects.length) throw new Error("no-video");
  var mime = pickMime(skip);
  if(!mime) throw new Error("no-recorder");
  var overlay = await loadImg(URL.createObjectURL(
    await framePNG(holeHtml, w, h, "transparent", HOLE_CSS)));
  var vids = rects.map(function(r){
    var v = document.createElement("video");
    v.src = VIDEOS[r.k].url; v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute("playsinline",""); return v;
  });
  await Promise.all(vids.map(function(v){
    return new Promise(function(res){ v.oncanplay = res; v.onerror = res; v.load() });
  }));
  var dur = Math.min.apply(null, rects.map(function(r){ return VIDEOS[r.k].dur }).concat([VMAX]));
  var c = document.createElement("canvas"); c.width = w; c.height = h;
  var g = c.getContext("2d");
  var stream = c.captureStream(30);
  try {
    var s0 = vids[0].captureStream ? vids[0].captureStream()
           : (vids[0].mozCaptureStream ? vids[0].mozCaptureStream() : null);
    if(s0) s0.getAudioTracks().forEach(function(t){ stream.addTrack(t) });
  } catch(e){}
  var rec = new MediaRecorder(stream, {mimeType:mime, videoBitsPerSecond:8000000});
  var chunks = [];
  rec.ondataavailable = function(ev){ if(ev.data && ev.data.size) chunks.push(ev.data) };
  var stopped = new Promise(function(res){ rec.onstop = res });
  rec.onerror = function(){ try{ rec.stop() }catch(e){} };
  await Promise.all(vids.map(function(v){
    try { v.currentTime = 0 } catch(e){}
    var pr = v.play(); return (pr && pr.catch) ? pr.catch(function(){}) : Promise.resolve();
  }));
  /* rita en bildruta innan inspelningen startar — en tom ström ger en tom fil */
  var paint = function(){
    g.fillStyle = bgc; g.fillRect(0,0,w,h);
    rects.forEach(function(r,i){ drawCover(g, vids[i], vids[i].videoWidth, vids[i].videoHeight, r) });
    g.drawImage(overlay, 0, 0, w, h);
  };
  paint();
  await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r) }) });
  rec.start(250);                       /* periodiska chunks — annars tappar vissa muxar allt */
  var t0 = performance.now();
  await new Promise(function(res){
    var tick = function(){
      var el = (performance.now() - t0)/1000;
      paint();
      if(onProgress) onProgress(Math.min(1, el/dur));
      if(el >= dur){ res(); return }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  /* låt sista chunken skrivas ut innan vi stoppar */
  try { rec.requestData() } catch(e){}
  await new Promise(function(r){ setTimeout(r, 320) });
  rec.stop(); vids.forEach(function(v){ v.pause() });
  await stopped;
  var blob = new Blob(chunks, {type:mime});
  /* Muxen ljuger ibland: den säger sig klara formatet men skriver en tom
     eller avhuggen fil. Kontrollera resultatet i stället för att lita på det. */
  var okLen = await verifyClip(blob, dur);
  if(!okLen){
    var next = (skip||[]).concat([mime]);
    if(pickMime(next)) return renderVideoFrom(holeHtml, measureHtml, dirId, onProgress, next);
    if(!blob.size) throw new Error("empty");
    throw new Error("truncated");
  }
  return {blob: blob, ext: mime.indexOf("mp4")>=0 ? "mp4" : "webm"};
}
/* Spelar upp resultatet och läser längden. Rapporterar muxen ingen längd
   faller vi tillbaka på en storleksgräns. */
var LASTCLIP = null;
/* filens verkliga speltid, eller null om den inte går att läsa */
function clipDur(blob){
  return new Promise(function(res){
    var url = URL.createObjectURL(blob), v = document.createElement("video");
    var done = function(x){ URL.revokeObjectURL(url); res(x) };
    var t = setTimeout(function(){ done(null) }, 4000);
    v.preload = "metadata"; v.muted = true;
    v.onloadedmetadata = function(){
      clearTimeout(t);
      /* webm från MediaRecorder rapporterar ibland Infinity tills man
         söker förbi slutet — knuffa den så metadatan skrivs om */
      if(!isFinite(v.duration)){
        v.currentTime = 1e6;
        v.ontimeupdate = function(){ v.ontimeupdate = null;
          done(isFinite(v.duration) ? v.duration : null) };
        setTimeout(function(){ done(isFinite(v.duration) ? v.duration : null) }, 1500);
        return;
      }
      done(v.duration);
    };
    v.onerror = function(){ clearTimeout(t); done(null) };
    v.src = url;
  });
}
function verifyClip(blob, expected){
  if(!blob.size) return Promise.resolve(false);
  return new Promise(function(res){
    var url = URL.createObjectURL(blob), v = document.createElement("video");
    var done = function(ok){ URL.revokeObjectURL(url); res(ok) };
    var t = setTimeout(function(){ done(blob.size > 20000 * Math.max(1, expected/2)) }, 3000);
    v.preload = "metadata"; v.muted = true;
    v.onloadedmetadata = function(){
      clearTimeout(t);
      var d = v.duration;
      if(!isFinite(d) || d <= 0) return done(blob.size > 20000 * Math.max(1, expected/2));
      done(d >= expected * 0.6);
    };
    v.onerror = function(){ clearTimeout(t); done(false) };
    v.src = url;
  });
}

/* =====================================================================
   01 · RIKTNING
   ===================================================================== */
var CMP=[["viewly",1],["foto",3],["estyling",2]];
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
        return '<div class="cmpcell">'
          +'<button class="specbtn" type="button" data-play="'+r.h.id+':'+r.i+':'+d.id+'">'
          +frame(d.id,r.s,r.i,r.n)+'</button>'
          +'<div class="dlrow">'+dlBtn("frame",{hl:r.h.id, i:r.i, ddir:d.id},"PNG · "+d.n)+'</div></div>'
        }).join("")
      +'</div>';
  }).join("");

  return sechead("Riktning","Två riktningar, inte tre",
    "ARKIV och SKUGGA är vidareutvecklade ur de ursprungliga spåren. Båda bygger på samma tolv kompositionsprimitiv och "
   +"samma innehåll — skillnaden ligger i grund, ljus och hur fotografiet används. Ingen riktning är vald.")
   +'<div class="dps">'+panels+'</div>'
   +'<div class="dlbar"><span class="eyebrow">Ladda ner</span>'
   + zipBtn("library",{ddir:"arkiv"},"Hela biblioteket · ARKIV · ZIP","biblioteket")
   + zipBtn("library",{ddir:"skugga"},"Hela biblioteket · SKUGGA · ZIP","biblioteket")
   +'<span class="mut" style="font-size:11.5px">'+(totalStories()+HL.length)
   +' PNG per riktning. Enskilda uppsättningar finns i vy 08.</span></div>'
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
      +'<p class="specd">'+p.d+'</p>'
      +'<div class="dlrow">'+dlBtn("prim",{p:sp.p, ddir:state.dir},"PNG · 1080×1920")+'</div></div>';
  }).join("");
  var counts={}; HL.forEach(function(h){h.st.forEach(function(s){counts[s.p]=(counts[s.p]||0)+1})});
  var total=totalStories();
  var mx=PRIMS.reduce(function(a,p){return Math.max(a,counts[p.id]||0)},1);
  var bars=PRIMS.map(function(p){
    var c=counts[p.id]||0, pct=Math.round(c/total*100);
    return '<div class="bar"><span class="bn">'+p.n+'</span>'
      +'<span class="bt"><i style="width:'+(c/mx*100).toFixed(1)+'%"></i></span>'
      +'<span class="bv">'+c+' <em>'+pct+'%</em></span></div>';
  }).join("");
  var owns=(counts.fullbleed||0)+(counts["case"]||0);
  return sechead("Kompositioner",cap(nw(PRIMS.length))+" primitiv — inte helbild på allt",
    "Varje Story byggs av ett av "+nw(PRIMS.length)+" primitiv. Bara två av dem — full bleed och case — låter fotografiet äga hela ytan, "
   +"och de är "+owns+" av "+total+" bildrutor ("+Math.round(owns/total*100)+" %). Övriga "+(total-owns)+" bärs av typografi, "
   +"linje, plåt och luft, med bilden i en mask. De tre sista — flow, matrix och phases — ritar hur något fungerar "
   +"i stället för att beskriva det. Fördelningen nedan är den faktiska fördelningen i biblioteket.")
   +dirbar()+toggles(true)
   +'<div class="dlbar"><span class="eyebrow">Ladda ner</span>'
   + zipBtn("prims",{ddir:state.dir},"Alla "+SPECS.length+" kompositioner · ZIP","kompositioner")
   + dlBtn("prims",{ddir:state.dir},"Separat, en i taget")+'</div>'
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
   +'<div class="dlbar"><span class="eyebrow">Ladda ner omslagen</span>'
   + zipBtn("covers",{ddir:"arkiv"},"Alla "+HL.length+" · ARKIV · ZIP","omslag")
   + zipBtn("covers",{ddir:"skugga"},"Alla "+HL.length+" · SKUGGA · ZIP","omslag")
   + HL.map(function(h){ return dlBtn("cover",{hl:h.id, ddir:state.dir}, h.num) }).join("")
   +'</div>'
   +'<div class="phones">'+phones+'</div>'
   +'<h3 class="h3">Igenkänning i verklig storlek</h3><div class="minis">'+strip+'</div>'
   +'<h3 class="h3">Ordning och roll</h3><div class="tw"><table><thead><tr>'
   +'<th style="width:44px">#</th><th>Highlight</th><th>Frågan den svarar på</th><th>Roll</th><th style="width:64px">Stories</th></tr></thead><tbody>'
   +HL.map(function(h){return '<tr><td class="mono">'+h.num+'</td><td><b>'+h.name+'</b></td>'
     +'<td class="mut">'+h.q+'</td><td class="mut">'+h.why+'</td><td class="mono">'+h.st.length+'</td></tr>'}).join("")
   +'</tbody></table></div>';
}

/* =====================================================================
   04 · FORMAT — samma system utanför 9:16
   ===================================================================== */
function board(d, p, ar, cls){
  var a=AR[ar];
  return '<div class="bd '+(cls||'')+'" style="--ar:'+a[0]+'/'+a[1]+'">'
    +'<div class="art" style="aspect-ratio:'+a[0]+'/'+a[1]+'">'+post(d,p,ar)+'</div>'
    +'<div class="bdcap"><span class="mono">'+ar+'</span>'
    + dlBtn("post",{pid:p.id, ar:ar, ddir:d},"PNG")+'</div></div>';
}
function secFormat(){
  var d=state.dir, p=POSTS[1];
  var one = FORMATS.map(function(f){
    var a=AR[f.ar];
    return '<div class="fcol"><div class="fmeta"><b>'+f.n+'</b><span class="mono">'+f.ar+'</span>'
      +'<em>'+f.d+'</em></div>'
      +'<div class="art" data-post-pid="'+p.id+'" data-post-ar="'+f.ar+'"'
      + (state.ig && f.ar==="9:16" ? ' data-post-ig="1"' : '')+' style="aspect-ratio:'+a[0]+'/'+a[1]+'">'
      + post(d,p,f.ar) + (state.ig && f.ar==="9:16" ? igOverlay(5,1) : '') + '</div>'
      + dlBtn("post",{pid:p.id, ar:f.ar, ddir:d},"Ladda ner PNG")+'</div>';
  }).join("");
  var tpl = PHASEDOC.map(function(ph,j){
    var pp = POSTS.filter(function(x){return x.phase===ph.id})[0];
    return '<div class="tpl">'
      +'<div class="art" data-post-pid="'+pp.id+'" data-post-ar="4:5" style="aspect-ratio:4/5">'+post(d,pp,"4:5")+'</div>'
      +'<div class="tplcap"><b>'+ph.n+'</b><span class="mono">'+String(j+1).padStart(2,"0")+'</span></div>'
      +'<p class="specd">'+ph.d+'</p>'
      +'<div class="tplrow">'+dlBtn("post",{pid:pp.id, ar:"4:5", ddir:d},"4:5")
        + dlBtn("post",{pid:pp.id, ar:"1:1", ddir:d},"1:1")
        + dlBtn("post",{pid:pp.id, ar:"9:16", ddir:d},"9:16")+'</div></div>';
  }).join("");
  var grid = [0,1,2,3,0,1,2,3,0].map(function(j){
    return '<div class="gcell" data-post-pid="'+POSTS[j].id+'" data-post-ar="1:1">'+post(d,POSTS[j],"1:1")+'</div>'}).join("");
  return sechead("Format","Fyra mallar, tre artboards",
    "Social / Ads Studio exporterar inlägg 4:5, kvadrat 1:1 och story 9:16 ur samma mall. Statusen är inte en etikett i "
   +"hörnet — varje kampanjfas är en egen mall där status bestämmer hela kompositionen: hur mycket bild, hur mycket "
   +"information och vad som får vara störst. Varje artboard går att ladda ner som PNG i 1080 px bredd.")
   +dirbar()+toggles(false)
   +'<div class="objwrap"><span id="flash" class="flash"></span>'+objectPanel()
     +'<button class="dlb pri" type="button" data-act="save">Spara</button></div>'
   +'<div class="dlbar"><span class="eyebrow">Ladda ner</span>'
   + zipBtn("posts",{ddir:d},"Alla 12 artboards · ZIP","kampanjmallar")
   + dlBtn("posts",{ddir:d, ar:"4:5"},"Bara 4:5")
   + dlBtn("posts",{ddir:d, ar:"1:1"},"Bara 1:1")
   + dlBtn("posts",{ddir:d, ar:"9:16"},"Bara 9:16")+'</div>'
   +'<h3 class="h3" style="margin-top:0">Samma inlägg i tre format</h3>'
   +'<div class="fmts">'+one+'</div>'
   +'<h3 class="h3">Kampanjmallarna · 4:5</h3>'
   +'<p class="mut" style="font-size:12.5px;margin-bottom:18px;max-width:74ch">Samma objekt hela vägen: '
   +'Silvergården 9A. Bara mallen byts när kampanjen går vidare — det är hela poängen med studion.</p>'
   +'<div class="tpls">'+tpl+'</div>'
   +'<h3 class="h3">Rutnätet · 1:1</h3>'
   +'<p class="mut" style="font-size:12.5px;margin-bottom:16px;max-width:74ch">Så ser kvadraterna ut mot varandra i '
   +'profilens rutnät, där de faktiskt bedöms.</p>'
   +'<div class="fgrid">'+grid+'</div>';
}

/* =====================================================================
   05 · STUDIO — redigera ett kapitel
   Klicka på ett kapitel, gå igenom bildrutorna, byt bild och text, spara,
   ladda ner. Redigeringarna ligger i EDITS/SLOTS ovanpå originaldatan —
   originalet går alltid att återställa till, per fält eller per bildruta.
   ===================================================================== */
/* ---------------------------------------------------------------------
   LAGRING
   Den förra versionen la ALLT i localStorage, uppladdade bilder inkluderade.
   En bild på 1400 px som base64 väger 200-500 kB och localStorage tar
   omkring 5 MB totalt — efter ett tiotal uppladdningar kastade setItem
   QuotaExceededError och då gick ingenting att spara längre, inte ens en
   ändrad rubrik. Det var felet.

   Lagringen är därför delad i två:

     lätt   texter, slot-inställningar, objektet, omslagsval — några få kB.
            Ligger i localStorage och sparas ALLTID först, så att ett fullt
            bildutrymme aldrig kan ta texten med sig.
     tung   själva bilderna. Ligger i IndexedDB, som mäter i hundratals MB.

   Saknas IndexedDB faller bilderna tillbaka till localStorage och användaren
   får veta det rakt ut i stället för att upptäcka det när sparandet tystnar.
   --------------------------------------------------------------------- */
var STORE = "viewly.highlights.v1";
var IDB_DB = "viewly.highlights", IDB_ST = "blobs", IDB_KEY = "uploads";

function idbOpen(){
  return new Promise(function(res){
    try{
      if(!window.indexedDB) return res(null);
      var rq = indexedDB.open(IDB_DB, 1);
      rq.onupgradeneeded = function(){ rq.result.createObjectStore(IDB_ST) };
      rq.onsuccess = function(){ res(rq.result) };
      rq.onerror   = function(){ res(null) };
      rq.onblocked = function(){ res(null) };
    }catch(e){ res(null) }
  });
}
function idbPut(val){
  return idbOpen().then(function(db){
    if(!db) return false;
    return new Promise(function(res){
      try{
        var tx = db.transaction(IDB_ST, "readwrite");
        tx.objectStore(IDB_ST).put(val, IDB_KEY);
        tx.oncomplete = function(){ res(true) };
        tx.onerror = tx.onabort = function(){ res(false) };
      }catch(e){ res(false) }
    });
  });
}
function idbGet(){
  return idbOpen().then(function(db){
    if(!db) return null;
    return new Promise(function(res){
      try{
        var rq = db.transaction(IDB_ST, "readonly").objectStore(IDB_ST).get(IDB_KEY);
        rq.onsuccess = function(){ res(rq.result || null) };
        rq.onerror   = function(){ res(null) };
      }catch(e){ res(null) }
    });
  });
}
function idbClear(){ return idbPut({}) }

function lightState(){
  return {v:5, edits:EDITS, slots:SLOTS, posts:PEDITS, covers:CEDITS, picks:PICKS,
          csets:CPICKS, motion:MPICK, mtext:MTX};
}
function bankBytes(){
  var n = 0; for(var k in UPLOADS) n += UPLOADS[k].length; return n;
}
function fmtBytes(n){
  return n > 1048576 ? (n/1048576).toFixed(1).replace(".",",")+" MB"
       : n > 1024    ? Math.round(n/1024)+" kB" : n+" B";
}
var bankMode = "idb";      /* idb | local | none — vad som faktiskt bar bilderna */

function saveAll(msg){
  /* Texten först och för sig. Går bilderna inte att spara ska det inte
     kunna radera en enda ändrad rubrik. */
  var lightOK = true;
  try { localStorage.setItem(STORE, JSON.stringify(lightState())) }
  catch(e){ lightOK = false }

  var count = Object.keys(UPLOADS).length;
  if(!count){
    bankMode = "idb";
    idbClear();
    flash(lightOK ? (msg || "Sparat") : "Kunde inte spara", !lightOK);
    return;
  }
  idbPut(UPLOADS).then(function(ok){
    if(ok){
      bankMode = "idb";
      flash(lightOK ? (msg || "Sparat") + " · " + count + " bilder ("+fmtBytes(bankBytes())+")"
                    : "Bilder sparade, men inte texten", !lightOK);
    } else {
      /* Ingen IndexedDB — försök localStorage och var ärlig om utfallet. */
      try {
        localStorage.setItem(STORE+".bank", JSON.stringify(UPLOADS));
        bankMode = "local";
        flash((msg || "Sparat") + " · bildbanken i localStorage");
      } catch(e2){
        bankMode = "none";
        flash("Texten är sparad. Bildbanken ("+fmtBytes(bankBytes())
             +") får inte plats — exportera allt som JSON", true);
      }
    }
    if(state.edit) refreshBankMeter();
  });
}
function loadAll(){
  var any = false;
  try {
    var raw = localStorage.getItem(STORE);
    if(raw){
      var d = JSON.parse(raw);
      Object.assign(EDITS, d.edits||{}); Object.assign(SLOTS, d.slots||{});
      Object.assign(PEDITS, d.posts||{}); Object.assign(CEDITS, d.covers||{});
      Object.assign(PICKS, d.picks||{}); Object.assign(CPICKS, d.csets||{}); Object.assign(MPICK, d.motion||{}); Object.assign(MTX, d.mtext||{});
      /* v1 la bilderna i samma post — flytta över dem tyst. */
      if(d.uploads) Object.assign(UPLOADS, d.uploads);
      any = true;
    }
    var bk = localStorage.getItem(STORE+".bank");
    if(bk){ Object.assign(UPLOADS, JSON.parse(bk)); bankMode = "local"; any = true }
  } catch(e){}
  return any;
}
function loadBank(){
  return idbGet().then(function(u){
    if(u && Object.keys(u).length){ Object.assign(UPLOADS, u); return true }
    return false;
  });
}
function clearAll(){
  [EDITS, SLOTS, UPLOADS, PEDITS, CEDITS, PICKS, CPICKS, MPICK, MTX].forEach(function(o){
    Object.keys(o).forEach(function(k){ delete o[k] }) });
  Object.keys(VIDEOS).forEach(function(k){ delete VIDEOS[k] });
  seedSlots();
  try{ localStorage.removeItem(STORE); localStorage.removeItem(STORE+".bank") }catch(e){}
  idbClear();
}

/* ---------- bildbanken: ta bort ----------
   En borttagen bild får inte lämna en trasig referens efter sig. Varje
   slot och varje omslag som pekade på den återgår till sitt original. */
function dropUpload(key){
  if(!UPLOADS[key]) return false;
  delete UPLOADS[key];
  delete VIDEOS[key];
  Object.keys(SLOTS).forEach(function(sid){
    if(SLOTS[sid] && SLOTS[sid].img === key) delete SLOTS[sid].img;
  });
  Object.keys(CEDITS).forEach(function(hid){
    if(CEDITS[hid] && CEDITS[hid].cover === key) delete CEDITS[hid].cover;
  });
  Object.keys(PEDITS).forEach(function(pid){
    if(PEDITS[pid] && PEDITS[pid].m === key) delete PEDITS[pid].m;
  });
  return true;
}
function dropAllUploads(){
  Object.keys(UPLOADS).forEach(dropUpload);
}
function refreshBankMeter(){
  var el = $("#bankmeter"); if(el) el.innerHTML = bankMeterHTML();
}
function bankMeterHTML(){
  var n = Object.keys(UPLOADS).length;
  if(!n) return '<span class="mut">Bildbanken är tom. '+MEDIAKEYS.length+' bilder följer med underlaget.</span>';
  var where = bankMode==="local" ? "localStorage" : bankMode==="none" ? "inte sparad" : "IndexedDB";
  return '<span class="mut">'+n+' egna '+(n===1?"bild":"bilder")+' · '+fmtBytes(bankBytes())
   +' · '+where+'</span> <button class="lnkb" type="button" data-act="bank-clear">Töm bildbanken</button>';
}

var flashT;
function flash(txt, warn){
  var el = $("#flash"); if(!el) return;
  el.textContent = txt; el.setAttribute("data-on", warn?"warn":"ok");
  clearTimeout(flashT); flashT = setTimeout(function(){ el.removeAttribute("data-on") }, 2400);
}

/* ---------- vilka fält en bildruta faktiskt har ----------
   Listan speglar vad varje primitiv verkligen renderar. Förut erbjöds
   Underrad på fullbleed och split, som aldrig ritar den — fältet fanns,
   men ingenting hände när man skrev i det. */
var RENDERED = {
  mark:      ["k","h","s"],
  fullbleed: ["k","h"],
  quiet:     ["k","h","em","s"],
  editorial: ["k","h","s"],
  product:   ["k","h","s"],
  split:     ["k","h","la","lb"],
  system:    ["k","h","s","items"],
  "case":    ["k","h","s"],
  cta:       ["k","h","s"],
  flow:      ["k","h","flow_inp","flow_items","flow_mid","flow_out","flow_tones","flow_title","flow_lead"],
  matrix:    ["k","h","s","mx_names"],
  phases:    ["k","h","s"],
  whitelabel:["k","h","s"]
};
var FIELDLAB = {
  k:["Kicker","text"], h:["Rubrik","text"], em:["Kursiv rad","text"], s:["Underrad","area"],
  la:["Etikett vänster/övre","text"], lb:["Etikett höger/undre","text"],
  items:["Poster — en per rad","list"],
  flow_inp:["Steg 1 — etikett","text"], flow_items:["AI:ns signaler — en per rad","list"],
  flow_mid:["Steg 2 — etikett","text"], flow_out:["Steg 3 — etikett","text"],
  flow_tones:["Tonlägen — en per rad","list"],
  flow_title:["Annonsrubrik","text"], flow_lead:["Annonsingress","area"],
  mx_names:["Formatnamn — en per rad","list"]
};
function fieldsFor(s){
  return (RENDERED[picked(s).p] || ["k","h","s"]).map(function(k){
    return [k, FIELDLAB[k][0], FIELDLAB[k][1]];
  });
}
function val(s, key){
  /* Fälten speglar det VALDA förslaget, inte alltid original A. */
  s = picked(s);
  var e = EDITS[s.sid] || {};
  if(key==="items")      return (e.items || s.items || []).join("\n");
  if(key==="flow_items") return ((e.mid||s.mid).items || []).join("\n");
  if(key==="flow_inp")   return (e.inp||s.inp).lab || "";
  if(key==="flow_mid")   return (e.mid||s.mid).lab || "";
  if(key==="flow_out")   return (e.out||s.out).lab || "";
  if(key==="flow_tones") return ((e.out||s.out).tones || []).join("\n");
  if(key==="flow_title") return (e.out||s.out).title || "";
  if(key==="flow_lead")  return (e.out||s.out).lead || "";
  if(key==="mx_names")   return (e.fmts||s.fmts).map(function(f){return f[1]}).join("\n");
  return e[key] != null ? e[key] : (s[key] || "");
}
function setVal(s, key, v){
  var sid = s.sid; s = picked(s);
  var e = EDITS[sid] || (EDITS[sid] = {});
  var lines = function(x){ return x.split("\n").filter(function(l){return l.trim()}) };
  if(key==="items")           e.items = lines(v);
  else if(key==="flow_items") e.mid   = Object.assign({}, e.mid||s.mid, {items:lines(v)});
  else if(key==="flow_inp")   e.inp   = Object.assign({}, e.inp||s.inp, {lab:v});
  else if(key==="flow_mid")   e.mid   = Object.assign({}, e.mid||s.mid, {lab:v});
  else if(key==="flow_out")   e.out   = Object.assign({}, e.out||s.out, {lab:v});
  else if(key==="flow_tones") e.out   = Object.assign({}, e.out||s.out, {tones:lines(v)});
  else if(key==="flow_title") e.out   = Object.assign({}, e.out||s.out, {title:v});
  else if(key==="flow_lead")  e.out   = Object.assign({}, e.out||s.out, {lead:v});
  else if(key==="mx_names"){
    var nm = lines(v);
    e.fmts = (e.fmts||s.fmts).map(function(f,j){ return [f[0], nm[j]!=null?nm[j]:f[1], f[2], f[3]] });
  }
  else                        e[key]  = v;
}
function isEdited(s){
  var e = EDITS[s.sid];
  if(PICKS[s.sid]) return true;
  var slotted = SLOTS[s.sid] && !slotIsDefault(s, s.sid);
  return !!(e && Object.keys(e).length) || !!slotted;
}
function slotIsDefault(s, key){
  var o = SLOTS[key] || {};
  return (o.img==null) && (o.fy===s.fy || (o.fy==null && s.fy==null))
      && (o.zoom===s.zoom || (o.zoom==null && s.zoom==null));
}
function resetStory(s){
  delete EDITS[s.sid]; delete SLOTS[s.sid]; delete SLOTS[s.sid+"-b"]; delete PICKS[s.sid];
  if(s.fy!=null || s.zoom!=null) SLOTS[s.sid] = {fy:s.fy, zoom:s.zoom};
}

/* ---------- uppladdning ---------- */
var upN = 0;
function ingest(file, done){
  var fr = new FileReader();
  fr.onload = function(){
    var img = new Image();
    img.onload = function(){
      var max = 1400, sc = Math.min(1, max/Math.max(img.width, img.height));
      var c = document.createElement("canvas");
      c.width = Math.round(img.width*sc); c.height = Math.round(img.height*sc);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      var key = "egen" + (++upN) + "-" + Date.now().toString(36).slice(-4);
      UPLOADS[key] = c.toDataURL("image/jpeg", 0.84);
      done(key);
    };
    img.onerror = function(){ done(null) };
    img.src = fr.result;
  };
  fr.onerror = function(){ done(null) };
  fr.readAsDataURL(file);
}
function handleUpload(files, slot){
  var list = Array.prototype.slice.call(files).filter(function(f){
    return /^image\//.test(f.type) || /^video\//.test(f.type) });
  if(!list.length){ flash("Bara bild- eller videofiler", true); return }
  var left = list.length, first = null, vids = 0;
  flash("Läser in…");
  list.forEach(function(f){
    var isVid = /^video\//.test(f.type);
    (isVid ? ingestVideo : ingest)(f, function(key){
      if(key && !first) first = key;
      if(key && isVid) vids++;
      if(--left === 0){
        if(!first){ flash("Kunde inte läsa filen", true); return }
        if(slot) SLOTS[slot] = Object.assign({}, SLOTS[slot], {img:first});
        flash(vids ? (vids>1 ? vids+" klipp tillagda" : "Klipp tillagt")
                   : (list.length>1 ? list.length+" bilder tillagda" : "Bild tillagd"));
        renderEditor();
      }
    });
  });
}
function allKeys(){ return Object.keys(UPLOADS).concat(MEDIAKEYS) }
/* Egna bilder får ett kryss. De inbyggda kan inte tas bort — de är
   underlaget, inte användarens material. Krysset ligger utanpå knappen så
   att ett klick på det aldrig råkar välja bilden i stället. */
function thumb(k, on, attr){
  return '<span class="mislot'+(on?" on":"")+'">'
    +'<button class="mi'+(on?" on":"")+(isVideo(k)?" vid":"")+'" type="button" '+attr
    +' title="'+k+'"><img src="'+(mediaURL(k)||"")+'" alt="">'
    +(isVideo(k)?'<i class="vbadge">▶</i>':'')+'</button>'
    +(UPLOADS[k] ? '<button class="midel" type="button" data-midel="'+k
       +'" title="Ta bort ur bildbanken" aria-label="Ta bort bilden">×</button>' : '')
    +'</span>';
}


function handleCoverUpload(files, hlId){
  var f = Array.prototype.slice.call(files).filter(function(x){return /^image\//.test(x.type)})[0];
  if(!f){ flash("Bara bildfiler", true); return }
  ingest(f, function(key){
    if(!key){ flash("Kunde inte läsa bilden", true); return }
    CEDITS[hlId] = Object.assign({}, CEDITS[hlId], {cover:key});
    flash("Omslagsbild bytt"); render();
  });
}

/* Två exporter, för att en enda inte kan vara båda. Den lätta är några kB
   och går alltid igenom — den flyttar texten mellan webbläsare och personer.
   Den fullständiga bär bildbanken och kan bli tiotals MB. */
async function exportJSON(btn, withBank){
  var lbl = btn.textContent;
  var body = lightState();
  if(withBank) body.uploads = UPLOADS;
  var data;
  try { data = JSON.stringify(body) }
  catch(e){ status("Kunde inte serialisera — för mycket data"); btn.textContent = lbl; return }
  await offer(new Blob([data], {type:"application/json"}),
    withBank ? "viewly-highlights-allt.json" : "viewly-highlights-text.json", btn);
  btn.textContent = lbl;
}
function importJSON(file){
  var fr = new FileReader();
  fr.onload = function(){
    var d;
    try { d = JSON.parse(fr.result) }
    catch(e){ flash("Filen är inte giltig JSON", true); return }
    if(!d || typeof d !== "object"){ flash("Filen innehåller inga redigeringar", true); return }
    Object.assign(EDITS, d.edits||{}); Object.assign(SLOTS, d.slots||{});
    Object.assign(PEDITS, d.posts||{}); Object.assign(CEDITS, d.covers||{});
    Object.assign(PICKS, d.picks||{}); Object.assign(CPICKS, d.csets||{}); Object.assign(MPICK, d.motion||{}); Object.assign(MTX, d.mtext||{});
    var n = 0;
    if(d.uploads){ Object.assign(UPLOADS, d.uploads); n = Object.keys(d.uploads).length }
    flash("Importerat" + (n ? " · "+n+" bilder" : " · text"));
    saveAll("Importerat och sparat");
    renderEditor();
  };
  fr.onerror = function(){ flash("Kunde inte läsa filen", true) };
  fr.readAsText(file);
}

/* ---------- vyn ---------- */
function secStudio(){
  if(!state.edit) return studioIndex();
  return studioEditor();
}
function studioIndex(){
  var need=0; HL.forEach(function(h){h.st.forEach(function(s){if(s.need)need++})});
  /* Indexet visar en levande bildruta per kapitel plus sekvensen som text.
     Sex miniatyrer gånger elva kapitel blev 66 container-query-kontexter i
     samma vy — dyrt, och onödigt när editorn är där bildrutorna ska synas. */
  var cards = HL.map(function(h){
    var edits = h.st.filter(isEdited).length;
    var seq = h.st.map(function(s,j){
      return '<i class="pchip'+(isEdited(s)?' ed':'')+'">'+String(j+1).padStart(2,"0")+' '+s.p+'</i>';
    }).join("");
    return '<div class="hlwrap"><button class="hlcard" type="button" data-edit="'+h.id+'">'
      +'<span class="top"><span class="cvw">'+coverEl(state.dir,h)+'</span>'
        +'<span class="tt"><b>'+h.name+'</b><span>'+h.q+'</span></span>'
        +(edits?'<span class="chip">'+edits+' ändrade</span>':'')+'</span>'
      +'<span class="body"><span class="lead"><span class="frame">'+story(state.dir,h.st[0],0,h.st.length)+'</span></span>'
        +'<span class="seq">'+seq+'</span></span>'
      +'<span class="foot"><span>'+h.st.length+' Stories</span><span class="open">Öppna →</span></span></button>'
      /* Nedladdning ligger utanför kortknappen — annars går det inte att
         nå kapitlets filer utan att först öppna editorn. */
      +'<div class="dlrow">'
      + zipBtn("chapter",{hl:h.id, ddir:state.dir},"Alla "+(h.st.length+1)+" · ZIP","kapitel-"+h.id,null)
      + dlBtn("sheet",{hl:h.id, ddir:state.dir},"Kontaktkarta")
      + dlBtn("cover",{hl:h.id, ddir:state.dir},"Omslag")
      +'</div></div>';
  }).join("");
  var alts = 0; HL.forEach(function(h){ h.st.forEach(function(x){ alts += variantCount(x) }) });
  var chosen = Object.keys(PICKS).filter(function(k){ return PICKS[k] }).length;
  return sechead("Studio", cap(nw(HL.length))+" kapitel, "+totalStories()+" Stories",
    "Varje bildruta finns i tre utföranden — "+alts+" totalt. Öppna ett kapitel, välj det förslag som "
   +"passar, byt bild, ladda upp egna och skriv om texten. "
   +(chosen ? chosen+" bildrutor har ett annat förslag än A valt. " : "")
   +need+" bildrutor är markerade som Behöver material.")
   +dirbar()+toggles(true)
   +'<div class="dlbar"><span class="eyebrow">Ladda ner</span>'
   + zipBtn("library",{ddir:state.dir},"Hela biblioteket · "+(totalStories()+HL.length)+" PNG · ZIP","biblioteket")
   + zipBtn("covers",{ddir:state.dir},"Alla omslag · ZIP","omslag",null)
   + zipBtn("sheets",{ddir:state.dir},"Alla kontaktkartor · ZIP","kontaktkartor",null)
   +'<span class="mut" style="font-size:11.5px">Fler uppsättningar i vy 08 Export.</span></div>'
   +'<div class="hlgrid">'+cards+'</div>'
   +'<h3 class="h3">Alla ändringar</h3>'
   +'<div class="ctl">'
     +'<button class="dlb pri" type="button" data-act="save">Spara i webbläsaren</button>'
     +'<button class="dlb" type="button" data-act="exportjson">Exportera text som JSON</button>'
     +'<button class="dlb" type="button" data-act="exportall">Exportera allt inkl. bilder</button>'
     +'<label class="dlb" style="cursor:pointer">Importera JSON<input type="file" accept="application/json,.json" id="impjson" hidden></label>'
     +'<button class="dlb" type="button" data-act="reset-all">Återställ allt</button>'
   +'</div>'
   +'<div id="bankmeter" class="bankm">'+bankMeterHTML()+'</div>'
   +'<p class="mut" style="font-size:11.5px;line-height:1.6;max-width:62ch;margin-top:8px">'
   +'Texten ligger i localStorage och är någon kB. Bildbanken ligger i IndexedDB och '
   +'kan bära hundratals MB — därför sparas de var för sig, så att ett fullt bildutrymme '
   +'aldrig kan ta texten med sig. <b>Exportera text</b> går alltid igenom; '
   +'<b>exportera allt</b> tar med bilderna och blir stor.</p>';
}

/* ---------------------------------------------------------------------
   FÖRSLAGSVÄLJAREN
   Tre utföranden av samma bildruta, renderade i verklig komposition — inte
   beskrivna i text. Man väljer med ögat. Egna ändringar ligger kvar ovanpå
   det valda förslaget, så ett byte kastar aldrig en omskriven rubrik.
   --------------------------------------------------------------------- */
var ALTLAB = ["A","B","C","D"];
function variantPanel(s, i, n){
  var a = altsOf(s);
  if(!a) return '<div class="edsec"><div class="eyebrow">Förslag</div>'
    +'<p class="mut" style="font-size:11.5px;line-height:1.55">Den här bildrutan har '
    +'bara ett utförande.</p></div>';
  var cur = PICKS[s.sid]|0;
  var cards = [s].concat(a.map(function(pt){ return Object.assign({}, s, pt) }))
    .map(function(v, j){
      var vs = Object.assign({}, v, EDITS[s.sid]||{});
      return '<button class="vcard'+(j===cur?" on":"")+'" type="button" data-alt="'+s.sid+':'+j+'" '
        +'title="Förslag '+ALTLAB[j]+' — '+v.p+'">'
        +'<span class="vfr">'+story(state.dir, vs, i, n)+'</span>'
        +'<span class="vcap"><b>'+ALTLAB[j]+'</b><i>'+v.p+'</i></span></button>';
    }).join("");
  return '<div class="edsec"><div class="eyebrow">Förslag <em class="cnt">'+(a.length+1)+'</em></div>'
    +'<div class="vgrid">'+cards+'</div>'
    +'<p class="mut" style="font-size:11px;line-height:1.5;margin-top:2px">'
    +'Byter komposition och formulering. Egna ändringar följer med.</p></div>';
}

function studioEditor(){
  var h = hlOf(state.edit.hl), n = h.st.length;
  var isCover = state.edit.i >= n;                 /* sista kortet är omslaget */
  var i = isCover ? n : Math.min(state.edit.i, n-1);
  var s = h.st[isCover ? n-1 : i];
  var eff = Object.assign({}, picked(s), EDITS[s.sid]||{});

  var strip = h.st.map(function(x,j){
    return '<button class="filmb'+(!isCover && j===i?" on":"")+'" type="button" data-pick="'+j+'">'
      +'<span class="filmn">'+String(j+1).padStart(2,"0")+(isEdited(x)?' <i class="dot"></i>':'')+'</span>'
      +'<span class="filmf">'+story(state.dir,x,j,n)+'</span>'
      +'<span class="filmp">'+picked(x).p
        +(PICKS[x.sid]?' <b class="vtag">'+ALTLAB[PICKS[x.sid]]+'</b>':'')+'</span></button>';
  }).join("")
  /* Omslaget ligger sist i remsan därför att det ligger sist i serien. Det
     är ingen bildruta man skriver text i — det redigeras i omslagspanelen. */
  + '<button class="filmb cov'+(isCover?" on":"")+'" type="button" data-pick="'+n+'">'
      +'<span class="filmn">'+String(n+1).padStart(2,"0")+'</span>'
      +'<span class="filmf">'+coverFrame(state.dir,h)+'</span>'
      +'<span class="filmp">omslag</span></button>';

  var fields = fieldsFor(s).map(function(f){
    var v = val(s, f[0]);
    var id = "f_"+f[0];
    if(f[2]==="list" || f[2]==="area")
      return '<label class="fld"><span>'+f[1]+'</span>'
        +'<textarea data-ed="'+f[0]+'" rows="'+(f[2]==="list"?Math.max(3,v.split("\n").length):2)+'">'+esc(v)+'</textarea></label>';
    return '<label class="fld"><span>'+f[1]+'</span>'
      +'<input type="text" data-ed="'+f[0]+'" value="'+esc(v)+'"></label>';
  }).join("");

  var slots = [];
  if(eff.m != null){
    if(Array.isArray(eff.m)){ slots.push([s.sid, eff.m[0], "Bild A"]); slots.push([s.sid+"-b", eff.m[1], "Bild B"]) }
    else slots.push([s.sid, eff.m, "Bild"]);
  }
  var media = slots.length ? slots.map(function(sl){ return mediaPanel(sl[0], sl[1], sl[2]) }).join("")
    : '<p class="mut" style="font-size:12px;line-height:1.55">Den här bildrutan använder inget fotografi — '
      +'all information är typografi och form.</p>';

  return '<div class="edtop">'
    +'<button class="tbtn" type="button" data-act="back">← Alla kapitel</button>'
    +'<div class="edtitle"><b>'+h.num+' · '+h.name+'</b><span>'+h.q+'</span></div>'
    +'<div class="edacts">'
      +'<span id="flash" class="flash"></span>'
      +dirbar()
      +'<label class="tg"><input type="checkbox" data-t="ig"'+(state.ig?" checked":"")+'> Instagrams UI</label>'
      +'<button class="dlb" type="button" data-act="play">▶ Spela sekvensen</button>'
      +'<button class="dlb pri" type="button" data-act="save">Spara</button>'
    +'</div></div>'
   +'<div class="edgrid">'
     +'<div class="film">'+strip+'</div>'
     +'<div class="edstage">'
       +'<div class="frame" id="edframe">'
         +(isCover ? coverFrame(state.dir,h) : story(state.dir,s,i,n)+(state.ig?igOverlay(n,i):''))+'</div>'
       +'<div class="edunder"><span class="mono">'+String(i+1).padStart(2,"0")+' / '+String(n+1).padStart(2,"0")
         +' · '+(isCover?"omslag":picked(s).p)+'</span>'
         +'<span class="edstep"><button class="tbtn" type="button" data-step="-1">←</button>'
         +'<button class="tbtn" type="button" data-step="1">→</button></span></div>'
     +'</div>'
     +'<div class="edside">'
       + (isCover ? '' : motionPanel(s, i, n))
       + (isCover ? '' : variantPanel(s, i, n))
       + (isCover ? '' :
          '<div class="edsec"><div class="eyebrow">Text</div>'+fields
          +'<button class="dlb" type="button" data-act="reset-story">Återställ bildrutan</button></div>')
       + coverPanel(h)
       + (isCover ? '' : '<div class="edsec"><div class="eyebrow">Media</div>'+media+'</div>')
       +(!isCover && s.p==="phases" ? objectPanel() : '')
       +(!isCover && s.need?'<div class="edneed"><b>Behöver material</b>'+esc(s.need)+'</div>':'')
       +'<div class="edsec"><div class="eyebrow">Ladda ner</div>'
         +'<div class="dlcol">'
           + (isCover ? dlBtn("cover",{hl:h.id, ddir:state.dir},"Omslaget · 1080×1920")
                       : dlBtn("frame",{hl:h.id, i:i, ddir:state.dir},"Denna bildruta · 1080×1920"))
           + dlBtn("sheet",{hl:h.id, ddir:state.dir},"Hela serien som kontaktkarta")
           + zipBtn("chapter",{hl:h.id, ddir:state.dir},"Alla "+(n+1)+" bildrutor · ZIP","kapitel-"+h.id)
           + dlBtn("chapter",{hl:h.id, ddir:state.dir},"Alla "+(n+1)+" separat")
           + (!isCover && MPICK[s.sid]
              ? '<button class="dlb pri" type="button" data-mv="1" data-mvsid="'+s.sid+'" data-mvdir="'
                +state.dir+'">Rörelsen som video · '+durOf(MSID[s.sid], MPICK[s.sid]).toFixed(1)+' s</button>' : '')
           + (!isCover && videoRects(story(state.dir,s,i,n), 1080, 1920).length
              ? '<button class="dlb pri" type="button" data-vhl="'+h.id+'" data-vi="'+i+'" data-vdir="'+state.dir+'">'
                +'Denna bildruta som video</button>' : '')
         +'</div>'
         +'<p class="mut" style="font-size:11px;line-height:1.5;margin-top:8px">Separat export ger en bekräftelse '
         +'per fil — godkänn varje ruta, annars stannar serien.</p>'
         +'<div id="dlstat" class="dlstat"></div></div>'
     +'</div>'
   +'</div>';
}

/* ---------------------------------------------------------------------
   OBJEKTET — texten på kampanjmallarna
   Adress, ort och fakta är samma objekt i alla fyra mallar, så de skrivs
   till alla på en gång. Etikett, tid och not är per mall.
   --------------------------------------------------------------------- */
function pv(id, key){
  var p = POSTS.filter(function(x){return x.id===id})[0], e = PEDITS[id] || {};
  if(key==="facts") return ((e.facts || p.facts || []).map(function(f){return f[0]+" | "+f[1]})).join("\n");
  return e[key] != null ? e[key] : (p[key] || "");
}
function setShared(key, v){
  POSTS.forEach(function(p){
    var e = PEDITS[p.id] || (PEDITS[p.id] = {});
    if(key==="facts") e.facts = v.split("\n").filter(function(l){return l.trim()})
      .map(function(l){ var q=l.split("|"); return [(q[0]||"").trim(), (q[1]||"").trim()] });
    else e[key] = v;
  });
}
function setPost(id, key, v){ (PEDITS[id] || (PEDITS[id] = {}))[key] = v }
function objectPanel(){
  var per = PHASEDOC.map(function(ph){
    var p = POSTS.filter(function(x){return x.phase===ph.id})[0];
    return '<div class="opRow"><div class="opName">'+ph.n+'</div>'
      +'<label class="fld"><span>Etikett</span><input type="text" data-po="'+p.id+':stage" value="'+esc(pv(p.id,"stage"))+'"></label>'
      +'<label class="fld"><span>'+(ph.id==="visning"?"Tid":"Rad i kolofonen")+'</span>'
        +'<input type="text" data-po="'+p.id+':when" value="'+esc(pv(p.id,"when"))+'"></label>'
      +(ph.id==="visning"||ph.id==="sald"
        ? '<label class="fld"><span>Not</span><input type="text" data-po="'+p.id+':note" value="'+esc(pv(p.id,"note"))+'"></label>' : '')
      +'</div>';
  }).join("");
  return '<div class="edsec"><div class="eyebrow">Objektet</div>'
   +'<p class="mut" style="font-size:11px;line-height:1.5">Gäller alla fyra kampanjmallar och vy 04 Format.</p>'
   +'<label class="fld"><span>Adress</span><input type="text" data-ps="addr" value="'+esc(pv("p1","addr"))+'"></label>'
   +'<label class="fld"><span>Ort</span><input type="text" data-ps="city" value="'+esc(pv("p1","city"))+'"></label>'
   +'<label class="fld"><span>Fakta — ett per rad, <code class="mono">värde | etikett</code></span>'
     +'<textarea data-ps="facts" rows="3">'+esc(pv("p2","facts"))+'</textarea></label>'
   +'<div class="opGrid">'+per+'</div>'
   +'<button class="dlb" type="button" data-act="reset-object">Återställ objektet</button></div>';
}

/* Kampanjmallarna syns på flera ställen samtidigt — scenen, filmremsan och
   artboardsen i vy 04. Alla ritas om utan att fälten byggs upp på nytt. */
function refreshPosts(){
  if(state.edit){ refreshStage(); return }
  var d = state.dir;
  document.querySelectorAll("[data-post-ar]").forEach(function(el){
    var p = POSTS.filter(function(x){return x.id===el.dataset.postPid})[0];
    if(p){ el.innerHTML = post(d, p, el.dataset.postAr)
      + (el.dataset.postIg==="1" ? igOverlay(5,1) : ""); mountVideos(el) }
  });
}

/* ---------------------------------------------------------------------
   OMSLAGET
   Symbolen är kapitlets identitet, inte dess plats i ordningen. Byt märke,
   byt bild bakom det i SKUGGA, ladda ner som 1080 × 1920 — Instagram
   beskär själv till cirkeln.
   --------------------------------------------------------------------- */
function coverPanel(h){
  var d = state.dir, set = covSetIx(h);
  /* Tre system, renderade i verklig storlek. Man väljer med ögat, som med
     bildrutornas förslag — och kan sätta samma system för hela raden,
     vilket är hur den ser bäst ut. */
  var sets = COVSETS.map(function(cs, j){
    var prev = CPICKS[h.id]; CPICKS[h.id] = j;
    var art = coverEl(d, h);
    if(prev==null) delete CPICKS[h.id]; else CPICKS[h.id] = prev;
    return '<button class="cset'+(j===set?" on":"")+'" type="button" data-cset="'+h.id+':'+j+'" '
      +'title="'+cs.d+'"><span class="csetc">'+art+'</span>'
      +'<span class="csetn"><b>'+cs.n+'</b></span></button>';
  }).join("");

  /* Motivväljaren gäller alla tre systemen — det är samma fjorton motiv,
     olika utföranden. Knapparna ritas i det system som är valt. */
  var GP = covPal(d, set);
  var figs = '<div class="mplab">'+(GLYPHS[cov(h,"glyph")]||GLYPHS.vmark).n
    +' — '+(GLYPHS[cov(h,"glyph")]||GLYPHS.vmark).d
    +' <code class="mono">'+(cov(h,"glyph")||"vmark")+'</code></div>'
    +'<div class="grow">'+GLYPH_IDS.map(function(g){
      var f = (set===1 ? LINE : PICTO)[g];
      return '<button class="gi'+(cov(h,"glyph")===g?" on":"")+'" type="button" data-gl="'+h.id+':'+g+'" '
        +'title="'+GLYPHS[g].n+' — '+GLYPHS[g].d+'"><span class="giw" style="background:'+GP.bg+'">'
        +'<svg viewBox="0 0 100 100">'+f(GP)+'</svg></span></button>';
    }).join("")+'</div>';

  return '<div class="edsec"><div class="eyebrow">Omslag <em class="cnt">3 system</em></div>'
   +'<div class="csets">'+sets+'</div>'
   +'<button class="lnkb" type="button" data-act="cset-all" style="margin:2px 0 10px">'
   +'Sätt '+COVSETS[set].n.toLowerCase()+' för alla '+HL.length+' kapitel</button>'
   +'<div class="covprev"><span class="cvbig">'+coverEl(d,h)+'</span>'
     +'<span class="cvsm">'+coverEl(d,h)+'</span>'
     +'<span class="mut" style="font-size:10.5px;line-height:1.5">'+COVSETS[set].d
     +'<br>64 px och 56 px — så stort det faktiskt visas.</span></div>'
   + figs
   +'<div class="dlcol" style="margin-top:8px">'
     + dlBtn("cover",{hl:h.id, ddir:d},"Ladda ner omslaget · 1080×1920")
     + zipBtn("covers",{ddir:d},"Alla "+HL.length+" omslag · ZIP","omslag",null)
   +'</div>'
   +'<p class="mut" style="font-size:11px;line-height:1.5;margin-top:7px">Omslaget ligger också sist '
   +'i kapitlets bildruteserie, så det följer med när du laddar ner hela serien.</p>'
   +'<button class="dlb" type="button" data-act="reset-cover">Återställ omslaget</button></div>';
}

function mediaPanel(slot, cur, label){
  var o = SLOTS[slot] || {};
  var active = o.img || cur;
  return '<div class="mpan">'
   +'<div class="mplab">'+label+' <code class="mono">'+active+'</code></div>'
   +'<label class="upl">Ladda upp bild eller video'
     +'<input type="file" accept="image/*,video/*" multiple data-up="'+slot+'" hidden></label>'
   +'<div class="mrow">'+allKeys().map(function(k){
      return thumb(k, active===k, 'data-mi="'+slot+':'+k+'"') }).join("")+'</div>'
   +'<div class="bankm sm">'+bankMeterHTML()+'</div>'
   +'<label class="sl">Fokalpunkt Y <em>'+Math.round((o.fy!=null?o.fy:.5)*100)+'%</em>'
     +'<input type="range" data-sl="'+slot+':fy" min="0" max="100" value="'+Math.round((o.fy!=null?o.fy:.5)*100)+'"></label>'
   +'<label class="sl">Zoom <em>'+Math.round((o.zoom||1)*100)+'%</em>'
     +'<input type="range" data-sl="'+slot+':zoom" min="100" max="200" value="'+Math.round((o.zoom||1)*100)+'"></label>'
   +(isVideo(active)
     ? '<p class="mut" style="font-size:10.5px;line-height:1.5">Klipp: '
       +VIDEOS[active].dur.toFixed(1)+' s. Videon ligger kvar under sessionen — '
       +'Spara behåller stillbilden ur klippet, inte filmen. Ladda upp igen efter omladdning.</p>' : '')
   +'</div>';
}

/* ---------------------------------------------------------------------
   RÖRELSE
   Bara sju bildrutor i biblioteket har en motion-variant, och den ligger
   ovanpå A/B/C som ett fjärde alternativ. "Ingen" är default och betyder
   att bildrutan renderas exakt som förut.
   --------------------------------------------------------------------- */
function motionPanel(s, i, n){
  var cand = MSID[s.sid];
  if(!cand) return '';
  var cur = MPICK[s.sid] || "";
  var opts = [{id:"", n:"Ingen", d:"Statisk"}].concat(MDIRS.map(function(d){
    return {id:d.id, n:d.n.replace(/^[0-9]+ . /,""), d:d.d.split(".")[0]} }));
  var keep = MPICK[s.sid];
  var cards = opts.map(function(o){
    var html;
    if(o.id){ html = MK[cand][o.id](state.dir, .5) }
    else { delete MPICK[s.sid]; html = story(state.dir, s, i, n); if(keep) MPICK[s.sid]=keep }
    return '<button class="vcard'+(o.id===cur?" on":"")+'" type="button" data-mo="'+s.sid+':'+o.id+'" '
     +'title="'+esc(o.d)+'"><span class="vfr">'+html+'</span>'
     +'<span class="vcap"><b>'+esc(o.n)+'</b></span></button>';
  }).join("");
  return '<div class="edsec"><div class="eyebrow">Rörelse'
   + (cur ? ' <em class="cnt">'+durOf(cand,cur).toFixed(1)+' s</em>' : '') +'</div>'
   +'<div class="vgrid vgrid4">'+cards+'</div>'
   + (cur ? '<div class="mplay"><button class="dlb pri" type="button" data-act="mplay">&#9654; Spela</button>'
      +'<input type="range" id="mscrub" min="0" max="1000" value="'+Math.round(MOTION_T*1000)+'">'
      +'<span class="mtime mono" id="mtime">'+(MOTION_T*durOf(cand,cur)).toFixed(1)+' s</span></div>' : '')
   +'<p class="mut" style="font-size:11px;line-height:1.5;margin-top:4px">'
   + (cur ? 'Dra i reglaget för att granska bildruta för bildruta. Exporten renderar samma funktion.'
          : 'Statisk är default. Rörelse läggs på som alternativ — originalet ligger kvar under.')
   +'</p></div>'
   /* Rörelsens egna bildplatser. Utan den här listan fanns det inget sätt
      att byta bilderna i ett rörligt alternativ — nycklarna satt i koden. */
   + (cur ? motionText(cand) + motionMedia(cand) : '');
}
/* Rörelsens uppgifter — adress, ort, yta, rubrik, kontorsnamn. Samma
   lagermodell som Storyns text: originalet ligger kvar, ändringen läggs
   på vid rendering och går att nolla per fält. */
function motionText(cand){
  var fs = mofieldsOf(cand);
  if(!fs.length) return '';
  return '<div class="edsec"><div class="eyebrow">Objektet i rörelse '
   +'<em class="cnt">'+fs.length+'</em></div>'
   +'<p class="mut" style="font-size:11px;line-height:1.55;margin:0 0 10px">'
   +'Adressen i vy 04 följer med hit automatiskt. Skriver du något här gäller det '
   +'bara rörelsen. Tomt fält = bibliotekets standardvärde.</p>'
   + fs.map(function(f){
      var raw = MTX[f.k] || "";
      return '<label class="fld"><span>'+esc(f.n)
       + (raw ? ' <button class="rst" type="button" data-mtxrst="'+f.k+'">återställ</button>' : '')
       +'</span><input type="text" data-mtx="'+f.k+'" value="'+esc(raw)
       +'" placeholder="'+esc(mo(f.k))+'"></label>';
     }).join("")
   +'</div>';
}
function motionMedia(cand){
  var slots = mslotsOf(cand);
  if(!slots.length) return '';
  return '<div class="edsec"><div class="eyebrow">Rörelsens bilder '
   +'<em class="cnt">'+slots.length+'</em></div>'
   +'<p class="mut" style="font-size:11px;line-height:1.55;margin:0 0 10px">'
   +'Samma bildbank som Storyn. Byter du här slår det igenom i förhandsvisningen, '
   +'i nyckelbilderna och i videon — det är samma renderare.</p>'
   + slots.map(function(x){ return mediaPanel(x.s, x.k, x.n) }).join("")
   +'</div>';
}

/* ---------------------------------------------------------------------
   MOTION SOM VIDEO
   Ingen tidslinje att synka mot: rutan renderas ur samma tidsfunktion som
   förhandsvisningen, rastreras, ritas i canvasen och spelas in. Mätt kostar
   en 1080 × 1920-rastrering 39 ms, så ett sexsekundersklipp i 30 fps tar
   omkring sju sekunder att producera.
   --------------------------------------------------------------------- */
function svgImage(svg, w, h){
  return new Promise(function(res, rej){
    var img = new Image();
    img.onload = function(){ res(img) };
    img.onerror = function(){ rej(new Error("img")) };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}
async function exportMotion(btn){
  if(busy) return; busy = true;
  var lbl = btn.textContent, d = btn.dataset.mvdir;
  /* Två vägar in: en Story som har fått en rörelse vald (mvsid), eller en
     kandidat och riktning direkt (mvcand + mvmdir) — så vy 07 kan spela in
     ett klipp utan att man först måste välja rörelsen på en Story. */
  var sid = btn.dataset.mvsid || "";
  var cnd = btn.dataset.mvcand || "";
  var m = sid ? motionOf(sid)
              : ((MK[cnd]||{})[btn.dataset.mvmdir]
                 ? {cand:cnd, dir:btn.dataset.mvmdir, dur:durOf(cnd, btn.dataset.mvmdir)} : null);
  if(!m){ busy=false; return }
  var frameAt = sid ? function(tt){ return motionFrame(d, sid, tt) }
                    : function(tt){ return MK[m.cand][m.dir](d, tt) };
  var FPS = 30, W = 1080, H = 1920, fps = 0;
  btn.disabled = true;
  var dl = await downloads();
  if(!dl){ btn.textContent = codeText("unavailable"); btn.disabled=false; busy=false;
    status(codeText("unavailable")); setTimeout(function(){btn.textContent=lbl},3400); return }
  var keepT = MOTION_T, skip = [], blob = null, tries = 0;
  try{
    while(tries < MIMES.length){
      var mime = pickMime(skip);
      if(!mime){ status("Webbläsaren stöder ingen videoinspelning"); break }
      var c = document.createElement("canvas"); c.width = W; c.height = H;
      var ctx = c.getContext("2d");
      var rec = new MediaRecorder(c.captureStream(FPS), {mimeType:mime, videoBitsPerSecond:9000000});
      var chunks = [];
      rec.ondataavailable = function(ev){ if(ev.data && ev.data.size) chunks.push(ev.data) };
      var stopped = new Promise(function(r){ rec.onstop = r });
      /* ---------------------------------------------------------------
         Klockan styr, inte en räknare.

         Den förra versionen renderade dur x 30 rutor och försökte vänta
         in 33 ms per ruta. Men en ruta kostar 26-57 ms att rastrera, så
         väntan blev alltid negativ och slingan tog längre tid än klippet
         skulle vara. MediaRecorder spelar in i REALTID — den bryr sig om
         väggklockan, inte om hur många rutor vi hann med. Resultatet blev
         ett klipp på 13 sekunder där det skulle stå 8,4, och rörelsen
         gick alltså för långsamt. På en långsammare dator blev det 30 s.

         Nu samplas tiden ur klockan precis som granskningsspelaren gör:
         t = förfluten tid / klippets längd. Då stämmer längd och
         hastighet exakt, oavsett hur snabb datorn är. Det som varierar
         är bildfrekvensen, och den redovisas efteråt.
         --------------------------------------------------------------- */
      var render = async function(tt){
        return svgImage(svgDoc(W,H,'<foreignObject x="0" y="0" width="'+W+'" height="'+H+'">'
          + xhtml(frameAt(tt), W, H, d==="skugga"?"#0E0E0D":"#EFECE7") +'</foreignObject>'), W, H);
      };
      /* första rutan innan start — annars blir klippet tomt */
      MOTION_T = 0;
      ctx.drawImage(await render(0), 0, 0, W, H);
      var TAIL = 140;                       /* slutbilden hålls kvar så länge */
      var span = Math.max(1, m.dur*1000 - TAIL);
      rec.start(250);
      var t0 = performance.now(), frames = 1, el = 0;
      while(true){
        el = (performance.now() - t0) / span;
        if(el >= 1) break;
        var img = await render(el);
        ctx.drawImage(img, 0, 0, W, H);
        frames++;
        /* Knapptexten behöver inte skrivas varje ruta, och en rAF per ruta
           kostade upp till 16 ms av en budget på 25 — nästan halva
           bildfrekvensen bortslösad på att vänta in en skärmuppdatering
           som inspelaren ändå inte bryr sig om. */
        if((frames & 7) === 0){
          btn.textContent = "Spelar in " + (el*m.dur).toFixed(1) + " / " + m.dur.toFixed(1) + " s…";
          await new Promise(function(r){ setTimeout(r, 0) });
        }
      }
      ctx.drawImage(await render(1), 0, 0, W, H);
      frames++;
      await new Promise(function(r){ setTimeout(r, TAIL) });
      rec.requestData(); await new Promise(function(r){ setTimeout(r, 60) });
      rec.stop(); await stopped;
      blob = new Blob(chunks, {type:mime});
      fps = frames / m.dur;
      if(await verifyClip(blob, m.dur)) break;
      skip.push(mime); tries++; blob = null;
    }
  } catch(e){ status("Kunde inte spela in: " + (e && e.message || e)) }
  MOTION_T = keepT;
  btn.disabled = false; btn.textContent = lbl; busy = false;
  if(blob){
    var ext = blob.type.indexOf("mp4") >= 0 ? "mp4" : "webm";
    /* klippets faktiska längd läses ur filen, inte antas — det var
       antagandet som dolde felet i första hand */
    LASTCLIP = {dur:await clipDur(blob), fps:fps, size:blob.size, avsedd:m.dur};
    var ok = await offer(blob, "viewly-motion-"+slug(sid||m.cand)+"-"+m.dir+"-"+d+"."+ext, btn);
    if(ok) status("Klippet: " + m.dur.toFixed(1).replace(".",",") + " s · "
      + Math.round(fps) + " bilder/s · " + fmtBytes(blob.size)
      + (fps < 14 ? " — låg bildfrekvens, datorn hann inte mer" : ""));
  } else status("Inspelningen gav ingen giltig fil");
}

/* ---------- granskningsspelare ----------
   Ingen animationsmotor: en rAF-loop som sätter MOTION_T och ritar om
   bildrutan. Samma funktion som exporten anropar, så det man ser är det
   man får. */
var mplayRAF = null, mplayT0 = 0;
function stopMPlay(){ if(mplayRAF){ cancelAnimationFrame(mplayRAF); mplayRAF = null } }
function currentMotion(){
  if(!state.edit) return null;
  var h = hlOf(state.edit.hl), n = h.st.length;
  if(state.edit.i >= n) return null;
  return motionOf(h.st[state.edit.i].sid);
}
function drawMotionFrame(){
  var st = $("#edframe"); if(!st || !state.edit) return;
  var h = hlOf(state.edit.hl), i = state.edit.i, n = h.st.length;
  if(i >= n) return;
  st.innerHTML = story(state.dir, h.st[i], i, n) + (state.ig ? igOverlay(n,i) : "");
  var m = currentMotion(), lab = $("#mtime"), sc = $("#mscrub");
  if(m && lab) lab.textContent = (MOTION_T*m.dur).toFixed(1) + " s";
  if(sc && document.activeElement !== sc) sc.value = Math.round(MOTION_T*1000);
}
function toggleMPlay(btn){
  var m = currentMotion(); if(!m) return;
  if(mplayRAF){ stopMPlay(); btn.innerHTML = "&#9654; Spela"; return }
  btn.innerHTML = "&#10073;&#10073; Pausa";
  if(MOTION_T >= .999) MOTION_T = 0;
  mplayT0 = performance.now() - MOTION_T*m.dur*1000;
  (function loop(){
    var el = (performance.now() - mplayT0) / (m.dur*1000);
    if(el >= 1){ MOTION_T = 1; drawMotionFrame(); stopMPlay();
      var b = document.querySelector('[data-act="mplay"]'); if(b) b.innerHTML = "&#9654; Spela"; return }
    MOTION_T = el; drawMotionFrame();
    mplayRAF = requestAnimationFrame(loop);
  })();
}

/* Bara scenen och remsan ritas om vid tangenttryck — annars tappar fältet fokus. */
function refreshStage(){
  if(!state.edit) return;
  var h = hlOf(state.edit.hl), n = h.st.length, i = state.edit.i;
  var f = $("#edframe"), t = document.querySelectorAll(".filmb")[i];
  if(i >= n){                                  /* omslagskortet */
    var cf = coverFrame(state.dir, h);
    if(f) f.innerHTML = cf;
    if(t){ var cfr = t.querySelector(".filmf"); if(cfr) cfr.innerHTML = cf }
    return;
  }
  var s = h.st[i];
  if(f){ f.innerHTML = story(state.dir,s,i,n) + (state.ig?igOverlay(n,i):''); mountVideos(f) }
  if(t){ var fr = t.querySelector(".filmf"); if(fr) fr.innerHTML = story(state.dir,s,i,n) }
}
function renderEditor(){ render() }

/* =====================================================================
   05 · LAGER OCH MEDIA
   ===================================================================== */
function secLager(){
  var lay=LAYERS.map(function(l){
    var c=l.s==="LÅST"?"lock":l.s==="REDIGERBAR"?"edit":"semi";
    return '<div class="lay '+c+'"><b>'+l.s+'</b><span class="ln">'+l.n+'</span><span class="ld">'+l.d+'</span></div>';
  }).join("");
  var r=refOf(["foto",3]);
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
   08 · EXPORT — ett ställe där allt går att hämta

   Knapparna finns kvar där de hör hemma, ute i sektionerna. Den här vyn
   är registret: varje uppsättning som går att få ut, hur många filer den
   är och ungefär hur lång tid den tar. Rastrering av en 1080 × 1920-ruta
   är uppmätt till 39 ms, och mellan varje fil ligger en paus på 650 ms
   för att spardialogen ska hinna stängas — det är pausen som avgör
   tiden, inte renderingen.
   ===================================================================== */
/* Uppmätt på den här datan: en 1080 × 1920-ruta tar 86 ms att rastrera och
   väger 0,54 MB. Ett arkiv packas på 0,4 s för 104 filer. Sparas filerna en
   och en tillkommer 650 ms per fil för att dialogen ska hinna stängas — det
   är den pausen, inte renderingen, som gör separat-vägen långsam. */
function secs(s){ return s < 60 ? "~"+Math.round(s)+" s" : "~"+Math.round(s/60)+" min" }
function xmeta(n, mb){
  return n + " fil" + (n===1?"":"er")
   + (n>1 ? " · " + secs(n*0.086 + 0.5) + " · ~" + (n*mb).toFixed(n*mb<10?1:0) + " MB" : " · " + secs(1));
}
function xcard(num, title, desc, n, mb, btns){
  return '<div class="xcard"><span class="xn">'+num+' · '+xmeta(n, mb)+'</span>'
   +'<h4>'+esc(title)+'</h4><p>'+desc+'</p><div class="dlrow">'+btns+'</div></div>';
}
function secExport(){
  var d = state.dir, dn = d==="skugga" ? "SKUGGA" : "ARKIV";
  var nSt = totalStories(), nHl = HL.length;
  var chapters = HL.map(function(h){
    return '<div class="xcard"><span class="xn">'+h.num+' · '+xmeta(h.st.length+1, 0.42)
     +'</span><h4>'+esc(h.name)+'</h4>'
     +'<p>'+h.st.length+' bildrutor plus omslaget sist.</p>'
     +'<div class="dlrow">'
     + zipBtn("chapter",{hl:h.id, ddir:d},"Alla "+(h.st.length+1)+" · ZIP","kapitel-"+h.id,null)
     + dlBtn("sheet",{hl:h.id, ddir:d},"Kontaktkarta")
     + dlBtn("cover",{hl:h.id, ddir:d},"Omslag")
     +'</div></div>';
  }).join("");

  return sechead("Export", "Allt som syns går att ladda ner",
     "Allt renderas i webbläsaren, i 1080 px bredd, och sparas via nedladdningsdialogen. Riktningen nedan följer "
    +"valet i sidhuvudet — just nu " + dn + ". Byter du riktning byter allt på den här sidan riktning med. "
    +"Redigeringar du gjort i studion, i objektpanelen och på omslagen följer med i exporten; motion och "
    +"innehållsalternativ likaså, eftersom exporten går genom samma renderare som förhandsvisningen.")
   + dirbar()
   +'<p class="xnote"><b>ZIP är standardvägen.</b> Allt renderas i webbläsaren och packas till ett arkiv — '
   +'en fil, en spardialog. Arkivet lagras utan komprimering eftersom PNG redan är komprimerat, så det väger '
   +'lika mycket som filerna gör var för sig. Hela biblioteket blir omkring 56 MB; nekar webbläsaren en så stor '
   +'fil, ta kapitel för kapitel längre ner i stället. <b>Separat</b> sparar en fil i taget och öppnar då en '
   +'dialog per fil — säger du nej i någon av dem stannar kön där, och knappen berättar hur många som hann sparas. '
   +'Videor spelas in i realtid och ligger kvar i vy 07, en riktning i taget.</p>'
   +'<h3 class="h3" style="margin-top:0">Hela biblioteket</h3>'
   +'<div class="xgrid">'
   + xcard("Allt", "Biblioteket i "+dn,
       "Samtliga "+nSt+" bildrutor plus "+nHl+" omslag, kapitel för kapitel, i filnamnsordning.",
       nSt + nHl, 0.54, zipBtn("library",{ddir:d},"Ladda ner allt · ZIP","biblioteket")
       + dlBtn("library",{ddir:d},"Separat"))
   + xcard("Omslag", "Alla omslag",
       "Ett omslag per highlight i valt omslagssystem, 1080 × 1920.",
       nHl, 0.07, zipBtn("covers",{ddir:d},"Alla "+nHl+" omslag · ZIP","omslag")
       + dlBtn("covers",{ddir:d},"Separat"))
   + xcard("Kartor", "Alla kontaktkartor",
       "En kontaktkarta per kapitel — hela serien på en bild, numrerad, med omslaget sist. Bra att skicka på granskning.",
       nHl, 0.18, zipBtn("sheets",{ddir:d},"Alla "+nHl+" kontaktkartor · ZIP","kontaktkartor")
       + dlBtn("sheets",{ddir:d},"Separat"))
   + xcard("Komp", "Kompositionerna",
       "Ett exempel per primitiv, alltså hela formspråket på "+SPECS.length+" bilder.",
       SPECS.length, 0.55, zipBtn("prims",{ddir:d},"Alla "+SPECS.length+" · ZIP","kompositioner")
       + dlBtn("prims",{ddir:d},"Separat"))
   +'</div>'
   +'<h3 class="h3">Kampanjen och formaten</h3>'
   +'<div class="xgrid">'
   + xcard("Mallar", "Kampanjmallarna i alla format",
       "Kommande, Till salu, Visning och Såld i 4:5, 1:1 och 9:16. Alla med objektets aktuella text ur objektpanelen.",
       POSTS.length*3, 0.96,
       zipBtn("posts",{ddir:d},"Alla 12 · ZIP","kampanjmallar")
       + dlBtn("posts",{ddir:d, ar:"4:5"},"4:5")
       + dlBtn("posts",{ddir:d, ar:"1:1"},"1:1")
       + dlBtn("posts",{ddir:d, ar:"9:16"},"9:16"))
   + xcard("Motion", "Motionens nyckelbilder",
       "Start, nyckel och slut för samtliga kandidater och riktningar. Bildsekvenser och video finns per riktning i vy 07.",
       MCAND.length*MDIRS.length*3, 0.38,
       zipBtn("allmkf",{ddir:d},"Alla "+(MCAND.length*MDIRS.length*3)+" · ZIP","nyckelbilder")
       + dlBtn("allmkf",{ddir:d},"Separat"))
   +'</div>'
   +'<h3 class="h3">Kapitel för kapitel</h3>'
   +'<div class="xgrid">'+chapters+'</div>';
}

/* =====================================================================
   SEKTIONER
   ===================================================================== */
function sechead(eb,t,l){
  return '<div class="sechead"><div class="eyebrow">'+eb+'</div><h2>'+t+'</h2><p class="lede">'+l+'</p></div>';
}
/*__MOTION__*/

var SECTIONS=[
 {id:"riktning", n:"Riktning",     num:"01", f:secRiktning},
 {id:"komp",     n:"Kompositioner",num:"02", f:secKomp},
 {id:"profil",   n:"Profil",       num:"03", f:secProfil},
 {id:"format",   n:"Format",       num:"04", f:secFormat},
 {id:"studio",   n:"Studio",       num:"05", f:secStudio},
 {id:"lager",    n:"Lager & media",num:"06", f:secLager},
 {id:"motion",   n:"Motion",       num:"07", f:secMotion},
 {id:"export",   n:"Export",       num:"08", f:secExport}
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
   +'<div class="pdl">'
     + dlBtn("frame",{hl:h.id, i:P.i, ddir:P.dir},"Ladda ner PNG · 1080×1920")
     + dlBtn("sheet",{hl:h.id, ddir:P.dir},"Hela kapitlet som kontaktkarta")
   +'</div>'
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
/* ---------------------------------------------------------------------
   OMRITNING UTAN ATT TAPPA PLATSEN
   render() scrollade alltid till toppen. Varje klick som ändrade något —
   välja förslag, byta omslagssystem, byta bild — byggde om hela sektionen
   och kastade tillbaka användaren till sidans början. Det var buggen.

   Nu scrollas det bara när man faktiskt byter vy: annan sektion, in i
   editorn eller ut ur den. Allt annat behåller scrollposition, och
   fokuset läggs tillbaka på det element som klickades.
   --------------------------------------------------------------------- */
var lastView = null, MTXT = null;
function viewKey(){ return state.sec + "|" + (state.edit ? state.edit.hl : "") }
function render(opts){
  opts = opts || {};
  var s = SECTIONS.filter(function(x){return x.id===state.sec})[0];
  var key = viewKey(), sameView = (key === lastView);
  var y = window.scrollY;
  /* vilket element hade fokus, uttryckt som en väljare vi kan hitta igen */
  var ae = document.activeElement, sel = null;
  if(ae && ae !== document.body){
    for(var i=0;i<FOCUS_ATTRS.length;i++){
      var a = FOCUS_ATTRS[i], v = ae.getAttribute && ae.getAttribute(a);
      if(v != null){ sel = '['+a+'="'+v.replace(/"/g,'\\"')+'"]'; break }
    }
  }
  $("#canvas").innerHTML = '<div class="sec" data-on>'+s.f()+'</div>';
  mountVideos($("#canvas"));
  document.querySelectorAll(".navb").forEach(function(b){
    b.setAttribute("aria-current", String(b.dataset.s===state.sec))});

  if(opts.top || !sameView){ window.scrollTo(0,0) }
  else {
    /* två steg: direkt, och efter layout — bilder kan ändra höjden */
    window.scrollTo(0,y);
    requestAnimationFrame(function(){ if(Math.abs(window.scrollY-y)>2) window.scrollTo(0,y) });
  }
  if(sel && sameView){
    var el = $(sel);
    if(el && el.focus) try{ el.focus({preventScroll:true}) }catch(e){ el.focus() }
  }
  lastView = key;
}
var FOCUS_ATTRS = ["data-alt","data-cset","data-gl","data-mi","data-ci","data-ed","data-sl","data-pick","data-mo","data-mtx"];
$("#nav").innerHTML=SECTIONS.map(function(s){
  return '<button class="navb" type="button" data-s="'+s.id+'" aria-current="'+(s.id===state.sec)+'">'
   +'<span class="n">'+s.num+'</span><span class="lbl">'+s.n+'</span></button>'}).join("");
$("#railmark").innerHTML=vmark("#1C1C1E","#6E7266")+'<span class="brandname">VIEWLY</span>';

document.addEventListener("click",function(e){
  /* Studio i skenan går alltid till kapitellistan — annars sitter man fast i editorn. */
  var n=e.target.closest(".navb"); if(n){state.sec=n.dataset.s; state.edit=null; render({top:true}); return}
  /* Bara riktningsknapparna — nedladdningsknapparna bär också ett riktnings-
     attribut, och matchade tidigare här först: klicket bytte riktning och
     scrollade upp i stället för att exportera. */
  var d=e.target.closest(".dirb[data-dir]"); if(d){state.dir=d.dataset.dir;render();return}
  /* Bildrutan i filmremsan: byt utan att sidan hoppar. */
  var p=e.target.closest("[data-play]");
  if(p){var q=p.dataset.play.split(":");play(q[0],+q[1],q[2]);return}
  if(e.target.closest("#pclose")){closeP();return}
  if(e.target.closest("#pnext")){step(1);return}
  if(e.target.closest("#pprev")){step(-1);return}
  var pd=e.target.closest("[data-pd]"); if(pd){P.dir=pd.dataset.pd;drawPlayer();return}
  var dl=e.target.closest("[data-dl]"); if(dl){ runExport(dl); return }
  var mrs=e.target.closest("[data-mtxrst]");
  if(mrs){ delete MTX[mrs.dataset.mtxrst]; render(); return }
  if(e.target.closest("[data-mtxall]")){
    Object.keys(MTX).forEach(function(k){ delete MTX[k] }); render(); return;
  }
  var ed=e.target.closest("[data-edit]");
  if(ed){ state.edit={hl:ed.dataset.edit, i:0}; render({top:true}); return }
  var pk=e.target.closest("[data-pick]");
  if(pk){ state.edit.i=+pk.dataset.pick; render(); return }
  var sp=e.target.closest("[data-step]");
  if(sp){ var h=hlOf(state.edit.hl), j=state.edit.i+ +sp.dataset.step;
    state.edit.i=(j+h.st.length+1)%(h.st.length+1); render(); return }
  var mv=e.target.closest("[data-mv]"); if(mv){ exportMotion(mv); return }
  var vx=e.target.closest("[data-vhl]"); if(vx){ exportVideo(vx); return }
  var ac=e.target.closest("[data-act]");
  if(ac){
    var a=ac.dataset.act;
    if(a==="back"){ state.edit=null; render({top:true}) }
    else if(a==="save"){ saveAll() }
    else if(a==="exportjson"){ exportJSON(ac, false) }
    else if(a==="exportall"){ exportJSON(ac, true) }
    else if(a==="mplay"){ toggleMPlay(ac) }
    else if(a==="cset-all"){
      var v = state.edit ? covSetIx(hlOf(state.edit.hl)) : 0;
      HL.forEach(function(x){ CPICKS[x.id] = v });
      saveAll(COVSETS[v].n+" satt för alla kapitel"); render() }
    else if(a==="bank-clear"){
      var bn=Object.keys(UPLOADS).length;
      if(bn && confirm("Ta bort alla "+bn+" egna bilder ur bildbanken? Bildrutor som använder dem går tillbaka till originalbilden.")){
        dropAllUploads(); saveAll("Bildbanken tömd"); render() } }
    else if(a==="play"){ play(state.edit.hl, state.edit.i, state.dir) }
    else if(a==="reset-story"){
      var hh=hlOf(state.edit.hl); resetStory(hh.st[state.edit.i]); saveAll("Bildrutan återställd"); render() }
    else if(a==="reset-cover"){
      if(state.edit){ delete CEDITS[state.edit.hl]; delete CPICKS[state.edit.hl];
        delete SLOTS["cover-"+state.edit.hl];
        var hh0=hlOf(state.edit.hl); if(hh0.coverFy!=null) SLOTS["cover-"+hh0.id]={fy:hh0.coverFy};
        saveAll("Omslaget återställt"); render() } }
    else if(a==="reset-object"){
      Object.keys(PEDITS).forEach(function(k){delete PEDITS[k]}); saveAll("Objektet återställt"); render() }
    else if(a==="reset-all"){
      if(confirm("Ta bort alla ändringar, uppladdade bilder och sparat läge?")){ clearAll(); render() } }
    return;
  }
  var gl=e.target.closest("[data-gl]");
  if(gl){ var q1=gl.dataset.gl.split(":");
    CEDITS[q1[0]] = Object.assign({}, CEDITS[q1[0]], {glyph:q1[1]}); render(); return }
  var ci=e.target.closest("[data-ci]");
  if(ci){ var q2=ci.dataset.ci.split(":");
    CEDITS[q2[0]] = Object.assign({}, CEDITS[q2[0]], {cover:q2[1]}); render(); return }
  var cs=e.target.closest("[data-cset]");
  if(cs){ var qc=cs.dataset.cset.split(":"); CPICKS[qc[0]] = +qc[1];
    saveAll(COVSETS[+qc[1]].n+" valt"); render(); return }
  var mo=e.target.closest("[data-mo]");
  if(mo){
    var qm=mo.dataset.mo.split(":");
    if(qm[1]) MPICK[qm[0]]=qm[1]; else delete MPICK[qm[0]];
    MOTION_T = 0; stopMPlay();
    saveAll(qm[1] ? "Rörelse vald" : "Statisk"); render(); return;
  }
  var al=e.target.closest("[data-alt]");
  if(al){
    var qa=al.dataset.alt.split(":"), pv=+qa[1];
    if(pv) PICKS[qa[0]] = pv; else delete PICKS[qa[0]];
    saveAll("Förslag "+ALTLAB[pv]+" valt"); render(); return;
  }
  var md=e.target.closest("[data-midel]");
  if(md){
    e.preventDefault(); e.stopPropagation();
    var dk=md.dataset.midel;
    if(dropUpload(dk)){ saveAll("Bilden borttagen"); render() }
    return;
  }
  var mi=e.target.closest("[data-mi]");
  if(mi){var a=mi.dataset.mi.split(":");
    SLOTS[a[0]]=Object.assign({},SLOTS[a[0]],{img:a[1]}); afterSlot(a[0]); return}
  var rs=e.target.closest("[data-reset]");
  if(rs){delete SLOTS[rs.dataset.reset]; afterSlot(rs.dataset.reset); return}
});
document.addEventListener("input",function(e){
  if(e.target.id === "mscrub"){ stopMPlay(); MOTION_T = (+e.target.value)/1000; drawMotionFrame();
    var mb=document.querySelector('[data-act="mplay"]'); if(mb) mb.innerHTML="&#9654; Spela"; return }
  var ps=e.target.dataset&&e.target.dataset.ps;
  if(ps){ setShared(ps, e.target.value); refreshPosts(); return }
  var po=e.target.dataset&&e.target.dataset.po;
  if(po){ var q=po.split(":"); setPost(q[0], q[1], e.target.value); refreshPosts(); return }
  var mx=e.target.dataset&&e.target.dataset.mtx;
  if(mx){
    var val=e.target.value;
    if(val==="") delete MTX[mx]; else MTX[mx]=val;
    if(state.edit){ refreshStage() }
    else { clearTimeout(MTXT); MTXT = setTimeout(render, 260) }   /* vy 07: 84 rutor, vänta ut skrivandet */
    return;
  }
  var ed=e.target.dataset&&e.target.dataset.ed;
  if(ed && state.edit){
    var h=hlOf(state.edit.hl);
    setVal(h.st[state.edit.i], ed, e.target.value);
    refreshStage(); return;
  }
  var k=e.target.dataset&&e.target.dataset.sl; if(!k) return;
  var a=k.split(":"), v=+e.target.value;
  SLOTS[a[0]]=Object.assign({},SLOTS[a[0]], a[1]==="fy"?{fy:v/100}:{zoom:v/100});
  var lab=e.target.closest(".sl"); if(lab) lab.querySelector("em").textContent=v+"%";
  afterSlot(a[0], true);
});
function afterSlot(slot, live){
  if(state.edit){ if(live) refreshStage(); else render(); return }
  if(P.hl){ drawPlayer(); if(live) restoreFocus(slot); return }
  if(state.sec==="lager"){
    var r=(function(){var h=byId["foto"];return {s:h.st[3],i:3,n:h.st.length}})();
    var stg=$("#mstage"); if(stg) stg.innerHTML=frame(state.dir,r.s,r.i,r.n);
    if(!live){var c=$("#mctl"); if(c) c.innerHTML=mediaCtl(r.s.sid, r.s.m)}
    return;
  }
  render();
}
function restoreFocus(){}
document.addEventListener("change",function(e){
  if(e.target.dataset && e.target.dataset.up!=null){ handleUpload(e.target.files, e.target.dataset.up); return }
  if(e.target.dataset && e.target.dataset.upc){ handleCoverUpload(e.target.files, e.target.dataset.upc); return }
  if(e.target.id==="impjson" && e.target.files[0]){ importJSON(e.target.files[0]); return }
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
/* slot-defaultvärden ur innehållsmodellen, så "Återställ" har något att gå till */
function seedSlots(){
  HL.forEach(function(h){
    h.st.forEach(function(x){ if(x.fy!=null || x.zoom!=null) SLOTS[x.sid] = {fy:x.fy, zoom:x.zoom} });
    if(h.coverFy!=null) SLOTS["cover-"+h.id] = {fy:h.coverFy};
  });
}
loadAll();
/* Bildbanken ligger i IndexedDB och läses asynkront. Vyn ritas om när den
   är inne — utan det visas gamla nycklar utan bild efter en omladdning. */
loadBank().then(function(got){ if(got) render() });

var s=document.createElement("style"); s.textContent=CSS; document.head.appendChild(s);

/* liten publik export-API — samma väg som knapparna använder, så den går
   att skripta och att testa utan att klicka sig igenom gränssnittet */
/* Lagringen går att köra utifrån, så att kvotbeteendet kan testas på riktigt
   i stället för att klickas fram. */
/* Exportkön går att köra utifrån med en stubbad spardialog, så att
   avbrottsbeteendet testas på riktigt i stället för att klickas fram.
   declineAt = index där stubben säger nej; -1 = aldrig. */
var STUB_N = 0;
function stubDownloads(declineAt){
  STUB_N = 0; dlTried = true;
  DL = {save:function(){
    var i = STUB_N++;
    if(declineAt >= 0 && i === declineAt){ STUB_N--; return Promise.reject({code:"declined"}) }
    return Promise.resolve(true);
  }};
}
window.__vstudio = {
  framePNG:framePNG, motionFrame:function(d,s,tt){ return motionFrame(d,s,tt) },
  exportMotion:exportMotion, BUILD:BUILD, runJobs:runJobs,
  stubDownloads:stubDownloads, stubCount:function(){ return STUB_N }, MTX:MTX,
  zipBlob:zipBlob, runZip:runZip, svgDoc:svgDoc, xhtml:xhtml, svgImage:svgImage,
  durOf:function(c,d){ return durOf(c,d) }, get lastClip(){ return LASTCLIP },
  UPLOADS:UPLOADS, EDITS:EDITS, SLOTS:SLOTS, PICKS:PICKS, CEDITS:CEDITS, PEDITS:PEDITS,
  saveAll:saveAll, loadAll:loadAll, loadBank:loadBank, clearAll:clearAll,
  dropUpload:dropUpload, dropAllUploads:dropAllUploads,
  bankBytes:bankBytes, fmtBytes:fmtBytes,
  get bankMode(){ return bankMode }
};
window.viewlyExport = {
  frame:function(hlId, i, dir){ var h=hlOf(hlId);
    return framePNG(story(dir,h.st[i],i,h.st.length), 1080, 1920, dir==="skugga"?"#0E0E0D":"#EFECE7") },
  sheet:function(hlId, dir, cw){ return sheetPNG(dir, hlOf(hlId), cw||540) },
  cover:function(hlId, dir){ return framePNG(coverFrame(dir, hlOf(hlId)), 1080, 1920,
    dir==="skugga"?"#0E0E0D":"#F2EFEF") },
  post:function(pid, ar, dir){ var p=POSTS.filter(function(x){return x.id===pid})[0], a=AR[ar];
    return framePNG(post(dir,p,ar), 1080, Math.round(1080*a[1]/a[0]), dir==="skugga"?"#0E0E0D":"#EFECE7") },
  video:function(hlId, i, dir, onProgress){
    var h=hlOf(hlId), n=h.st.length;
    VIDEO_HOLE = true;
    var hole = story(dir,h.st[i],i,n) + (state.ig ? igOverlay(n,i) : "");
    VIDEO_HOLE = false;
    return renderVideoFrom(hole, story(dir,h.st[i],i,n), dir, onProgress);
  }
};
render();
})();
