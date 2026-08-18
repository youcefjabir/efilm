/* ---------------------------------------------------------------------
   MP4 — FILEN BYGGS, DEN SPELAS INTE IN

   Den uppladdade filen mättes och sa allt. 210 bildrutor med 137 OLIKA
   avstånd mellan sig: kortast 7,3 ms, längst 258,3 ms. Sjutton rutor låg
   mer än halva medelavståndet fel. Snittet blev 25,6 rutor per sekund
   där det skulle stå 30. Ovanpå det var filen fragmenterad, med noll som
   längd i huvudet och ingen sidx — det är därför telefonen vägrar ta
   emot den.

   Ingen av de sakerna går att tuta bort med jämnare produktion, för de
   kommer inte ur hur snabbt rutorna ritas. De kommer ur MediaRecorder.
   Den är en REALTIDSINSPELARE: den stämplar varje ruta med väggklockan i
   det ögonblick requestFrame() råkar anropas, och skriver en ström som
   är gjord för att sändas medan den skapas, inte för att sparas. Varje
   hack i webbläsaren hamnar därför i filen som en tidsstämpel, och
   spelaren gör helt rätt när den visar hacket — det står ju i filen.

   Alltså slutar vi spela in. Vi KODAR.

   VideoEncoder tar en bildruta och en tidsstämpel som VI bestämmer. Den
   arbetar så fort maskinen orkar, utan någon koppling till hur lång
   filmen ska bli. Sedan lägger den här filen rutorna i en vanlig,
   ofragmenterad MP4 där stts har en enda post: alla rutor lika långa.

   Två saker följer av det, och de är precis de två användaren saknar:

     · Hack går inte längre att representera. Avståndet mellan två rutor
       är samma tal genom hela filen. En långsam dator gör exporten
       långsammare — aldrig filmen ryckigare.
     · Filen är en riktig MP4 med längd i huvudet, moov före mdat och
       avc1-profil. Den öppnas i telefonens galleri, i Instagram och i
       allt annat som vägrade den fragmenterade strömmen.

   Kostnaden är att vi får skriva muxern själv. Det är den här filen.
   --------------------------------------------------------------------- */

/* ---------- små byggstenar ---------- */
function _u8(a){ return new Uint8Array(a) }
function _u16(n){ return _u8([(n>>8)&255, n&255]) }
function _u32(n){ return _u8([(n>>>24)&255, (n>>>16)&255, (n>>>8)&255, n&255]) }
function _u64(n){
  var hi = Math.floor(n / 4294967296), lo = n >>> 0;
  return _u8([(hi>>>24)&255,(hi>>>16)&255,(hi>>>8)&255,hi&255,
              (lo>>>24)&255,(lo>>>16)&255,(lo>>>8)&255,lo&255]);
}
function _str(s){
  var b = new Uint8Array(s.length);
  for(var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 255;
  return b;
}
function _cat(list){
  var n = 0, i;
  for(i = 0; i < list.length; i++) n += list[i].length;
  var b = new Uint8Array(n), o = 0;
  for(i = 0; i < list.length; i++){ b.set(list[i], o); o += list[i].length }
  return b;
}
/* en box är längd, fyra bokstäver och innehållet */
function _box(type){
  var parts = Array.prototype.slice.call(arguments, 1);
  var body = _cat(parts);
  return _cat([_u32(body.length + 8), _str(type), body]);
}
/* full box: samma sak med version och flaggor först */
function _fbox(type, ver, flags){
  var parts = Array.prototype.slice.call(arguments, 3);
  return _box.apply(null, [type, _u8([ver, (flags>>16)&255, (flags>>8)&255, flags&255])].concat(parts));
}

/* enhetsmatrisen — alla filer har den, ingen roterar bilden */
var _MTX9 = _cat([_u32(0x10000),_u32(0),_u32(0), _u32(0),_u32(0x10000),_u32(0),
                  _u32(0),_u32(0),_u32(0x40000000)]);

/* Löplängdskodar en lista av tal till [antal, värde]-poster. stts och
   ctts är byggda så, och för en jämn film blir stts en enda post. */
function _runs(vals){
  var out = [], i = 0;
  while(i < vals.length){
    var j = i;
    while(j < vals.length && vals[j] === vals[i]) j++;
    out.push([j - i, vals[i]]); i = j;
  }
  return out;
}

/* ---------------------------------------------------------------------
   MUXERN

   samples  [{data:Uint8Array, key:bool, cts:heltal i rutor}]  i avkodnings-
            ordning. cts är rutans plats i UPPSPELNINGEN — samma som
            avkodningsordningen så länge kodaren inte lägger in B-rutor,
            och annars förskjuten, vilket ctts tar hand om.
   kod      {kind:"avc", desc}  eller  {kind:"vp9", profile, level, depth}

   Två kodekar, för att H.264 inte finns i alla webbläsare. Där den
   saknas ger VP9 i MP4 fortfarande en riktig, ofragmenterad fil med jämn
   takt — sämre spridning på telefoner, men aldrig det hackiga formatet.
   --------------------------------------------------------------------- */
function mp4build(W, H, fps, kod, samples){
  var N = samples.length;
  var MVTS = 1000;            /* filmens tidsskala */
  var MDTS = fps * 1000;      /* spårets: en ruta = exakt 1000 enheter */
  var DELTA = 1000;

  /* längden räknas ur den sista rutans uppspelningstid, inte ur antalet
     rutor — med B-rutor är det inte samma sak */
  var maxCts = 0;
  for(var i = 0; i < N; i++) if(samples[i].cts > maxCts) maxCts = samples[i].cts;
  var durMd = (maxCts + 1) * DELTA;
  var durMv = Math.round(durMd / MDTS * MVTS);

  /* --- var rutan ligger, hur stor den är, vilka som är nyckelrutor --- */
  var sizes = new Array(N), keys = [], total = 0;
  for(var s = 0; s < N; s++){
    sizes[s] = samples[s].data.length;
    total += sizes[s];
    if(samples[s].key) keys.push(s + 1);   /* stss räknar från 1 */
  }

  /* --- ctts bara om uppspelningen avviker från avkodningen --- */
  var offs = new Array(N), behov = false;
  for(var c = 0; c < N; c++){
    offs[c] = (samples[c].cts - c) * DELTA;
    if(offs[c] !== 0) behov = true;
  }
  var negativ = false;
  for(var g = 0; g < N; g++) if(offs[g] < 0) negativ = true;

  var stts = _fbox("stts", 0, 0, _u32(1), _u32(N), _u32(DELTA));
  var stss = keys.length === N ? null
    : _fbox("stss", 0, 0, _u32(keys.length), _cat(keys.map(_u32)));
  var ctts = null;
  if(behov){
    var r = _runs(offs);
    ctts = _fbox("ctts", negativ ? 1 : 0, 0, _u32(r.length),
      _cat(r.map(function(x){ return _cat([_u32(x[0]), _u32(x[1] < 0 ? (x[1] >>> 0) : x[1])]) })));
  }
  var stsc = _fbox("stsc", 0, 0, _u32(1), _u32(1), _u32(N), _u32(1));
  var stsz = _fbox("stsz", 0, 0, _u32(0), _u32(N), _cat(sizes.map(_u32)));

  /* --- provbeskrivningen --- */
  var namn = new Uint8Array(32); /* compressorname, tomt är tillåtet */
  var typ, konf;
  if(kod.kind === "vp9"){
    typ = "vp09";
    /* vpcC: profil, nivå, och en byte där djup, delsampling och
       färgomfång ligger packade. VP9 behöver ingen SPS ur kodaren —
       allt som behövs står i kodeksträngen. */
    konf = _fbox("vpcC", 1, 0,
      _u8([kod.profile & 255, kod.level & 255,
           ((kod.depth & 15) << 4) | (1 << 1) | 0,   /* 4:2:0 colocated, tv-omfång */
           1, 1, 1]),                                 /* BT.709 genomgående */
      _u16(0));
  } else {
    typ = "avc1";
    konf = _box("avcC", kod.desc);
  }
  var vse = _box(typ,
    _u8([0,0,0,0,0,0]), _u16(1),               /* reserverat, dataref */
    _u16(0), _u16(0), _u32(0), _u32(0), _u32(0),
    _u16(W), _u16(H),
    _u32(0x00480000), _u32(0x00480000),         /* 72 dpi */
    _u32(0), _u16(1),                            /* rutor per prov */
    namn, _u16(0x0018), _u16(0xFFFF),
    konf,
    /* pasp: bildpunkterna är kvadratiska. Utan den gissar vissa spelare
       fel och drar ut bilden på höjden. */
    _box("pasp", _u32(1), _u32(1)));
  var stsd = _fbox("stsd", 0, 0, _u32(1), vse);

  var stbl = _box.apply(null, ["stbl", stsd, stts]
    .concat(ctts ? [ctts] : []).concat(stss ? [stss] : [])
    .concat([stsc, stsz, _fbox("stco", 0, 0, _u32(1), _u32(0))]));

  var minf = _box("minf",
    _fbox("vmhd", 0, 1, _u16(0), _u16(0), _u16(0), _u16(0)),
    _box("dinf", _fbox("dref", 0, 0, _u32(1), _fbox("url ", 0, 1))),
    stbl);

  var mdia = _box("mdia",
    _fbox("mdhd", 0, 0, _u32(0), _u32(0), _u32(MDTS), _u32(durMd), _u16(0x55C4), _u16(0)),
    _fbox("hdlr", 0, 0, _u32(0), _str("vide"), _u32(0), _u32(0), _u32(0), _str("VideoHandler\0")),
    minf);

  var trak = _box("trak",
    _fbox("tkhd", 0, 3, _u32(0), _u32(0), _u32(1), _u32(0), _u32(durMv),
      _u32(0), _u32(0), _u16(0), _u16(0), _u16(0), _u16(0),
      _MTX9, _u32(W * 65536), _u32(H * 65536)),
    mdia);

  var mvhd = _fbox("mvhd", 0, 0, _u32(0), _u32(0), _u32(MVTS), _u32(durMv),
    _u32(0x00010000), _u16(0x0100), _u16(0), _u32(0), _u32(0),
    _MTX9, _cat([_u32(0),_u32(0),_u32(0),_u32(0),_u32(0),_u32(0)]), _u32(2));

  var ftyp = _box("ftyp", _str("isom"), _u32(512),
    _str("isom"), _str("iso2"), _str("mp41"), _str("mp42"),
    _str(kod.kind === "vp9" ? "iso6" : "avc1"));

  /* Chunkens plats beror på hur stor moov är, och moov innehåller
     platsen. Storleken ändras däremot inte av VILKET tal som står där,
     så vi bygger en gång för att mäta och en gång på riktigt. */
  var moov = _box("moov", mvhd, trak);
  var stor = total + 8 > 4294967295;
  var mdatHdr = stor ? 16 : 8;
  var dataOff = ftyp.length + moov.length + mdatHdr;

  var stbl2 = _box.apply(null, ["stbl", stsd, stts]
    .concat(ctts ? [ctts] : []).concat(stss ? [stss] : [])
    .concat([stsc, stsz, _fbox("stco", 0, 0, _u32(1), _u32(dataOff))]));
  var minf2 = _box("minf",
    _fbox("vmhd", 0, 1, _u16(0), _u16(0), _u16(0), _u16(0)),
    _box("dinf", _fbox("dref", 0, 0, _u32(1), _fbox("url ", 0, 1))),
    stbl2);
  var mdia2 = _box("mdia",
    _fbox("mdhd", 0, 0, _u32(0), _u32(0), _u32(MDTS), _u32(durMd), _u16(0x55C4), _u16(0)),
    _fbox("hdlr", 0, 0, _u32(0), _str("vide"), _u32(0), _u32(0), _u32(0), _str("VideoHandler\0")),
    minf2);
  var trak2 = _box("trak",
    _fbox("tkhd", 0, 3, _u32(0), _u32(0), _u32(1), _u32(0), _u32(durMv),
      _u32(0), _u32(0), _u16(0), _u16(0), _u16(0), _u16(0),
      _MTX9, _u32(W * 65536), _u32(H * 65536)),
    mdia2);
  var moov2 = _box("moov", mvhd, trak2);

  var bitar = [ftyp, moov2];
  bitar.push(stor ? _cat([_u32(1), _str("mdat"), _u64(total + 16)])
                  : _cat([_u32(total + 8), _str("mdat")]));
  for(var k = 0; k < N; k++) bitar.push(samples[k].data);
  return new Blob(bitar, {type:"video/mp4"});
}

/* ---------------------------------------------------------------------
   KODAREN

   H.264 först: den spelas av allt, inklusive iPhone och Instagram.
   1080 × 1920 i 30 rutor per sekund ligger strax under taket för nivå
   4.0, så vi ber om 5.1 och faller nedåt tills webbläsaren säger ja.

   Saknas H.264 — vissa Linux- och Firefox-byggen har den inte — tas VP9
   i MP4 i stället. Sämre spridning på telefoner, men fortfarande en
   riktig fil med jämn takt, vilket är hela poängen.
   --------------------------------------------------------------------- */
var MP4CODECS = [
  {c:"avc1.640033", k:"avc"}, {c:"avc1.640032", k:"avc"},
  {c:"avc1.64002A", k:"avc"}, {c:"avc1.640028", k:"avc"},
  {c:"avc1.4D0033", k:"avc"}, {c:"avc1.4D0028", k:"avc"},
  {c:"avc1.42E033", k:"avc"}, {c:"avc1.42E028", k:"avc"},
  {c:"vp09.00.41.08", k:"vp9"}, {c:"vp09.00.40.08", k:"vp9"},
  {c:"vp09.00.51.08", k:"vp9"}
];

async function mp4codec(W, H, fps, bitrate){
  if(typeof VideoEncoder === "undefined" || typeof VideoFrame === "undefined") return null;
  for(var i = 0; i < MP4CODECS.length; i++){
    var e = MP4CODECS[i];
    var cfg = {codec:e.c, width:W, height:H, bitrate:bitrate, framerate:fps};
    if(e.k === "avc"){
      cfg.avc = {format:"avc"};
      /* "realtime" låter kodaren inte kasta om rutorna. Vi kodar ändå
         inte i realtid, så namnet är missvisande — det vi köper är att
         inga B-rutor uppstår, och därmed ingen omkastning som en spelare
         kan tolka fel. Vid 12 Mbit/s för den här sortens grafik syns
         ingen skillnad mot "quality". */
      cfg.latencyMode = "realtime";
    } else {
      cfg.latencyMode = "quality";
    }
    try {
      var r = await VideoEncoder.isConfigSupported(cfg);
      if(r && r.supported) return {config:r.config || cfg, kind:e.k, codec:e.c};
    } catch(err){ /* nästa profil */ }
  }
  return null;
}

/* vp09.PP.LL.DD -> profil, nivå, bitdjup */
function mp4vp9(codec){
  var q = String(codec).split(".");
  return {kind:"vp9", profile:+q[1] || 0, level:+q[2] || 41, depth:+q[3] || 8};
}

/* Kodar N rutor. draw(i) ska rita ruta i i canvasen och inget annat —
   hur lång tid det tar spelar ingen roll för resultatet.
   onp(i, N) får rapportera hur långt det gått. */
async function mp4encode(canvas, W, H, fps, N, draw, onp, bitrate){
  var val = await mp4codec(W, H, fps, bitrate || 12000000);
  if(!val) return null;

  var samples = [], desc = null, fel = null;
  var enc = new VideoEncoder({
    output: function(chunk, meta){
      if(meta && meta.decoderConfig && meta.decoderConfig.description && !desc){
        var d = meta.decoderConfig.description;
        desc = new Uint8Array(d.buffer ? d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength)
                                       : d);
      }
      var buf = new Uint8Array(chunk.byteLength);
      chunk.copyTo(buf);
      /* tidsstämpeln är vår egen, så rutans plats i uppspelningen är
         exakt räknebar — ingen avrundning av väggklockan */
      samples.push({data:buf, key:chunk.type === "key",
                    cts:Math.round(chunk.timestamp * fps / 1000000)});
    },
    error: function(e){ fel = e }
  });
  enc.configure(val.config);

  var KEY = Math.max(1, Math.round(fps * 2));   /* nyckelruta varannan sekund */
  var USEC = 1000000 / fps;
  try {
    for(var i = 0; i < N; i++){
      if(fel) throw fel;
      await draw(i);
      var vf = new VideoFrame(canvas, {timestamp:Math.round(i * USEC),
                                       duration:Math.round(USEC)});
      enc.encode(vf, {keyFrame:(i % KEY) === 0});
      vf.close();
      /* håll kön kort så minnet inte växer med hela filmen */
      while(enc.encodeQueueSize > 6 && !fel){
        await new Promise(function(r){ setTimeout(r, 2) });
      }
      if(onp && (i & 7) === 0) onp(i + 1, N);
    }
    await enc.flush();
  } finally {
    try { if(enc.state !== "closed") enc.close() } catch(e){}
  }
  if(fel) throw fel;
  if(!samples.length) return null;
  if(val.kind === "avc" && !desc) return null;   /* utan SPS går filen inte att spela */

  var kod = val.kind === "vp9" ? mp4vp9(val.config.codec || val.codec)
                               : {kind:"avc", desc:desc};
  /* Ordningen lämnas som kodaren gav den — det ÄR avkodningsordningen,
     och muxern räknar ut uppspelningsförskjutningen ur den. Att sortera
     här skulle förstöra just den uppgiften. */
  return {blob:mp4build(W, H, fps, kod, samples), kind:val.kind,
          codec:val.config.codec || val.codec, frames:samples.length};
}
