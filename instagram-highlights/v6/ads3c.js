/* =====================================================================
   ADS 3 — del C: inställningar, ljud, export och sidan
   ===================================================================== */

/* Allt som går att ändra: färger, texter, objektuppgifter, kontorsprofil.
   Sparas i webbläsaren och används av alla annonser. */
var V3_DEF = {
  hook:["En fotografering.", "Mer att arbeta med."], fore:["Bilden levereras.", "Kampanjen är klar."], typo:["Välj bild.", "Välj mall."],
  obj:{addr:"Storgatan 13", city:"Landskrona", rum:"4", yta:"112", kommande:"Släpps vecka 12", maklare:"Anna Lindqvist"},
  off:{name:"NORDVIK", sub:"MÄKLARBYRÅ", accent:"#2F6F6B", accentL:"#9CC7C0"},
  col:{dark:"#0E0E0D", paper:"#ECE8E5", ink:"#1C1C1E", oli:"#6E7266", olil:"#98A088"}
};
var V3_CFG = JSON.parse(JSON.stringify(V3_DEF));
var V3_HOOKS = [["En fotografering.", "Mer att arbeta med."], ["Fotona är klara.", "Inläggen också."], ["Dina bilder.", "Din kampanj."]];
function v3Apply(){
  var k;
  for(k in V3_CFG.obj) V3_OBJ[k] = V3_CFG.obj[k];
  for(k in V3_CFG.off) OFF[k] = V3_CFG.off[k];
  C3.dark = V3_CFG.col.dark; C3.paper = V3_CFG.col.paper; C3.ink = V3_CFG.col.ink; C3.oli = V3_CFG.col.oli; C3.olil = V3_CFG.col.olil;
}
function v3LoadCfg(){
  try {
    var raw = localStorage.getItem("viewly.ads3.cfg");
    var rx = localStorage.getItem("viewly.ads3.tx"); if(rx) V3_TX = JSON.parse(rx) || {};
    if(raw){ var o = JSON.parse(raw); ["hook", "fore", "typo"].forEach(function(k){ if(o[k]) V3_CFG[k] = o[k] }); ["obj", "off", "col"].forEach(function(g){ if(o[g]) for(var k in o[g]) V3_CFG[g][k] = o[g][k] }) }
  } catch(e){}
  v3Apply();
}
function v3SaveCfg(){ try { localStorage.setItem("viewly.ads3.cfg", JSON.stringify(V3_CFG)); localStorage.setItem("viewly.ads3.tx", JSON.stringify(V3_TX)) } catch(e){} }
v3LoadCfg();

var V3S = {tab:"video", comp:"salu", fmt:"916", t:3.2, playing:false, raf:0, outro:"papper", sound:true,
           tplStyle:"overlay", tplFmt:"45", outroPreviewFmt:"916", ctxA:null, src:null, startT:0, startCtx:0};
var V3_FPS = 30;
function v3O(){ return {outro:V3S.outro, hook:V3_CFG.hook, fore:V3_CFG.fore, typo:V3_CFG.typo} }

/* ---------- ritar en komposition i en given canvas ---------- */
function v3DrawComp(canvas, wpx, compId, fmt, t){
  var G = v3Geo(fmt), hpx = Math.round(wpx*G.H/100), c = v3Begin(canvas, wpx, hpx);
  c.clearRect(0, 0, 100, G.H);
  V3_COMPS[compId].draw(c, G, t, v3O());
}
function v3Dims(fmt){ return fmt === "916" ? [1080, 1920] : [1080, 1350] }

/* ---------------------------------------------------------------------
   LJUD — ett litet piano och diskreta ljudeffekter, syntetiserat i
   webbläsaren. Samma partitur spelas i förhandsvisningen och går in i
   MP4:n. Jag har skrivit det men inte hört det; lyssna innan ni använder
   det.
   --------------------------------------------------------------------- */
var V3_CHORDS = [[38,50,57,61,64,66], [35,47,54,57,62,66], [43,50,55,59,62,66], [45,52,57,61,64,71]];
var V3_ARP = [0, 2, 3, 4, 5, 4, 3, 2];
function v3Noise(ctx, len){
  var b = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate*len)), ctx.sampleRate), d = b.getChannelData(0);
  for(var i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1;
  return b;
}
function v3Score(ctx, comp){
  var A = comp.audio, dur = comp.dur;
  var master = ctx.createGain(); master.gain.setValueAtTime(.62, 0); master.gain.setValueAtTime(.62, Math.max(0, dur - 1.2)); master.gain.linearRampToValueAtTime(0, dur);
  var cmp = ctx.createDynamicsCompressor(); cmp.threshold.value = -20; cmp.ratio.value = 3; cmp.attack.value = .01; cmp.release.value = .25;
  var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 9000;
  master.connect(cmp); cmp.connect(lp); lp.connect(ctx.destination);
  var rl = Math.floor(ctx.sampleRate*2.4), ir = ctx.createBuffer(2, rl, ctx.sampleRate), ch, i;
  for(ch = 0; ch < 2; ch++){ var d = ir.getChannelData(ch); for(i = 0; i < rl; i++) d[i] = (Math.random()*2 - 1)*Math.pow(1 - i/rl, 2.6) }
  var conv = ctx.createConvolver(); conv.buffer = ir;
  var wet = ctx.createGain(); wet.gain.value = .3; conv.connect(wet); wet.connect(master);
  var dry = ctx.createGain(); dry.gain.value = .85; dry.connect(master);
  var out = function(node, g){ var a = ctx.createGain(); a.gain.value = g == null ? 1 : g; node.connect(a); a.connect(dry); a.connect(conv); return a };

  var piano = function(t, midi, vel, dur2){
    var f = 440*Math.pow(2, (midi - 69)/12), amps = [1, .5, .26, .13, .07, .04], bus = ctx.createGain(), k;
    bus.gain.value = vel*.34;
    var tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = Math.min(7000, 1400 + f*5); bus.connect(tone); out(tone);
    for(k = 0; k < amps.length; k++){
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f*(k + 1)*(1 + .0003*(k + 1)*(k + 1));
      var g = ctx.createGain(), tau = dur2/(1 + k*.9);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amps[k], t + .007); g.gain.setTargetAtTime(0, t + .01, tau/3.2);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur2 + .3);
    }
    var o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f*1.004;
    var g2 = ctx.createGain(); g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(.4, t + .008); g2.gain.setTargetAtTime(0, t + .01, dur2/3.4);
    o2.connect(g2); g2.connect(bus); o2.start(t); o2.stop(t + dur2 + .3);
    var n = ctx.createBufferSource(); n.buffer = v3Noise(ctx, .06);
    var nf = ctx.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 1500 + f; nf.Q.value = .8;
    var ng = ctx.createGain(); ng.gain.setValueAtTime(vel*.05, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .05);
    n.connect(nf); nf.connect(ng); out(ng); n.start(t); n.stop(t + .06);
  };
  var whoosh = function(t, d2, vol){
    var n = ctx.createBufferSource(); n.buffer = v3Noise(ctx, d2 + .1);
    var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = .7; f.frequency.setValueAtTime(350, t); f.frequency.exponentialRampToValueAtTime(2600, t + d2);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + d2*.45); g.gain.linearRampToValueAtTime(0, t + d2);
    n.connect(f); f.connect(g); out(g); n.start(t); n.stop(t + d2 + .1);
  };
  var tap = function(t, vol){
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(1150, t); o.frequency.exponentialRampToValueAtTime(620, t + .07);
    var g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .09);
    o.connect(g); out(g); o.start(t); o.stop(t + .12);
    var n = ctx.createBufferSource(); n.buffer = v3Noise(ctx, .02);
    var hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3000;
    var ng = ctx.createGain(); ng.gain.setValueAtTime(vol*.5, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .015);
    n.connect(hp); hp.connect(ng); out(ng); n.start(t); n.stop(t + .025);
  };
  var pop = function(t, vol, fr){
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(fr*.8, t); o.frequency.exponentialRampToValueAtTime(fr, t + .05);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
    o.connect(g); out(g); o.start(t); o.stop(t + .2);
  };
  var chime = function(t, vol){
    [1320, 1980, 2640, 3960].forEach(function(fr, k){
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = fr*(1 + k*.0012);
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol/(1 + k*.8), t + .004); g.gain.setTargetAtTime(0, t + .01, .5/(1 + k*.35));
      o.connect(g); out(g); o.start(t); o.stop(t + 2.4);
    });
  };
  var riser = function(t, d2, vol){
    var n = ctx.createBufferSource(); n.buffer = v3Noise(ctx, d2 + .1);
    var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(7000, t + d2);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.exponentialRampToValueAtTime(vol, t + d2*.96); g.gain.linearRampToValueAtTime(0, t + d2);
    n.connect(f); f.connect(g); out(g); n.start(t); n.stop(t + d2 + .1);
  };
  var sub = function(t, vol){
    var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = 73.4;
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .9); g.gain.setTargetAtTime(0, t + 1, 1.1);
    o.connect(g); out(g, .8); o.start(t); o.stop(t + 4.5);
  };

  /* pianot: ett ackord per fönster, arpeggio i lugn takt */
  A.chords.forEach(function(w){
    var ch2 = V3_CHORDS[w[2]], t0 = w[0], t1 = w[1], step = .66, n2 = 0;
    piano(t0 + .1, ch2[0], .5, 3.6);
    for(var tt = t0 + .5; tt < t1 - .35; tt += step, n2++){
      var note = ch2[V3_ARP[n2 % V3_ARP.length]] + (n2 % 8 === 4 ? 12 : 0);
      piano(tt, note, .26 + .08*((n2 % 4) === 0), 2.6);
    }
  });
  (A.whoosh || []).forEach(function(t){ whoosh(t, .55, .05) });
  (A.tap || []).forEach(function(t){ tap(t, .15) });
  (A.pop || []).forEach(function(t, k){ pop(t, .042, 560 + (k % 5)*60) });
  (A.chime || []).forEach(function(t){ chime(t, .065) });
  (A.riser || []).forEach(function(r){ riser(r[0], r[1], .04) });
  if(A.sub != null){
    sub(A.sub, .1);
    [38, 50, 54, 57, 61, 64].forEach(function(m, k){ piano(A.sub + .15 + k*.04, m, k ? .3 : .55, 5) });
    piano(A.sub + 1.2, 74, .24, 3);
  }
}
var V3_AUD = {};
function v3Audio(compId, sr){
  var key = compId + "@" + sr;
  if(V3_AUD[key]) return V3_AUD[key];
  var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if(!OAC) return Promise.resolve(null);
  var comp = V3_COMPS[compId], ctx = new OAC(2, Math.ceil(sr*(comp.dur + .3)), sr);
  v3Score(ctx, comp);
  V3_AUD[key] = ctx.startRendering();
  return V3_AUD[key];
}
function v3Wav(buf){
  var n = buf.length, ch = buf.numberOfChannels, sr = buf.sampleRate, bytes = n*ch*2, ab = new ArrayBuffer(44 + bytes), v = new DataView(ab), i, c2, o = 44;
  var w = function(off, s){ for(var k = 0; k < s.length; k++) v.setUint8(off + k, s.charCodeAt(k)) };
  w(0, "RIFF"); v.setUint32(4, 36 + bytes, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, ch, true); v.setUint32(24, sr, true); v.setUint32(28, sr*ch*2, true); v.setUint16(32, ch*2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, bytes, true);
  var data = []; for(c2 = 0; c2 < ch; c2++) data.push(buf.getChannelData(c2));
  for(i = 0; i < n; i++) for(c2 = 0; c2 < ch; c2++){ var s = Math.max(-1, Math.min(1, data[c2][i])); v.setInt16(o, s < 0 ? s*32768 : s*32767, true); o += 2 }
  return new Blob([ab], {type:"audio/wav"});
}

/* ---------------------------------------------------------------------
   MP4 MED LJUD

   Den befintliga muxern (mp4.js) bygger en videospår. Här läggs ett
   ljudspår till: AAC om webbläsaren kan koda det, annars Opus, annars
   ingen ljud. Videon kodas direkt ur canvasen — ingen SVG-rastrering —
   så exporten går i en bråkdel av tiden.
   --------------------------------------------------------------------- */
function _v3VideoTrak(W, H, fps, kod, samples, id, off, durMv){
  var N = samples.length, MDTS = fps*1000, DELTA = 1000, maxCts = 0, i;
  for(i = 0; i < N; i++) if(samples[i].cts > maxCts) maxCts = samples[i].cts;
  var durMd = (maxCts + 1)*DELTA;
  var sizes = new Array(N), keys = [];
  for(i = 0; i < N; i++){ sizes[i] = samples[i].data.length; if(samples[i].key) keys.push(i + 1) }
  var offs = new Array(N), behov = false, neg = false;
  for(i = 0; i < N; i++){ offs[i] = (samples[i].cts - i)*DELTA; if(offs[i] !== 0) behov = true; if(offs[i] < 0) neg = true }
  var stts = _fbox("stts", 0, 0, _u32(1), _u32(N), _u32(DELTA));
  var stss = keys.length === N ? null : _fbox("stss", 0, 0, _u32(keys.length), _cat(keys.map(_u32)));
  var ctts = null;
  if(behov){ var r = _runs(offs); ctts = _fbox("ctts", neg ? 1 : 0, 0, _u32(r.length), _cat(r.map(function(x){ return _cat([_u32(x[0]), _u32(x[1] < 0 ? (x[1] >>> 0) : x[1])]) }))) }
  var stsc = _fbox("stsc", 0, 0, _u32(1), _u32(1), _u32(N), _u32(1));
  var stsz = _fbox("stsz", 0, 0, _u32(0), _u32(N), _cat(sizes.map(_u32)));
  var typ, konf;
  if(kod.kind === "vp9"){
    typ = "vp09";
    konf = _fbox("vpcC", 1, 0, _u8([kod.profile & 255, kod.level & 255, ((kod.depth & 15) << 4) | (1 << 1), 1, 1, 1]), _u16(0));
  } else { typ = "avc1"; konf = _box("avcC", kod.desc) }
  var vse = _box(typ, _u8([0,0,0,0,0,0]), _u16(1), _u16(0), _u16(0), _u32(0), _u32(0), _u32(0), _u16(W), _u16(H),
    _u32(0x00480000), _u32(0x00480000), _u32(0), _u16(1), new Uint8Array(32), _u16(0x0018), _u16(0xFFFF), konf, _box("pasp", _u32(1), _u32(1)));
  var stsd = _fbox("stsd", 0, 0, _u32(1), vse);
  var stbl = _box.apply(null, ["stbl", stsd, stts].concat(ctts ? [ctts] : []).concat(stss ? [stss] : []).concat([stsc, stsz, _fbox("stco", 0, 0, _u32(1), _u32(off))]));
  var minf = _box("minf", _fbox("vmhd", 0, 1, _u16(0), _u16(0), _u16(0), _u16(0)), _box("dinf", _fbox("dref", 0, 0, _u32(1), _fbox("url ", 0, 1))), stbl);
  var mdia = _box("mdia", _fbox("mdhd", 0, 0, _u32(0), _u32(0), _u32(MDTS), _u32(durMd), _u16(0x55C4), _u16(0)),
    _fbox("hdlr", 0, 0, _u32(0), _str("vide"), _u32(0), _u32(0), _u32(0), _str("VideoHandler\0")), minf);
  return _box("trak", _fbox("tkhd", 0, 3, _u32(0), _u32(0), _u32(id), _u32(0), _u32(durMv), _u32(0), _u32(0), _u16(0), _u16(0), _u16(0), _u16(0),
    _MTX9, _u32(W*65536), _u32(H*65536)), mdia);
}
function _v3AudioTrak(au, id, off, durMv){
  var N = au.samples.length, sr = au.sampleRate, i, tot = 0, sizes = [], durs = [];
  for(i = 0; i < N; i++){ sizes.push(au.samples[i].data.length); durs.push(au.samples[i].dur); tot += au.samples[i].dur }
  var runs = _runs(durs);
  var stts = _fbox("stts", 0, 0, _u32(runs.length), _cat(runs.map(function(x){ return _cat([_u32(x[0]), _u32(x[1])]) })));
  var stsc = _fbox("stsc", 0, 0, _u32(1), _u32(1), _u32(N), _u32(1));
  var stsz = _fbox("stsz", 0, 0, _u32(0), _u32(N), _cat(sizes.map(_u32)));
  var head = [_u8([0,0,0,0,0,0]), _u16(1), _u16(0), _u16(0), _u32(0), _u16(au.channels), _u16(16), _u16(0), _u16(0), _u32(sr*65536)];
  var entry;
  if(au.kind === "aac"){
    var asc = au.desc, L = asc.length;
    var esds = _fbox("esds", 0, 0, _u8([0x03, L + 23, 0, 2, 0, 0x04, L + 15, 0x40, 0x15, 0, 0, 0]), _u32(0), _u32(au.bitrate || 128000), _u8([0x05, L]), asc, _u8([0x06, 1, 2]));
    entry = _box.apply(null, ["mp4a"].concat(head).concat([esds]));
  } else {
    var dops = _box("dOps", _u8([0, au.channels]), _u16(312), _u32(sr), _u16(0), _u8([0]));
    entry = _box.apply(null, ["Opus"].concat(head).concat([dops]));
  }
  var stsd = _fbox("stsd", 0, 0, _u32(1), entry);
  var stbl = _box("stbl", stsd, stts, stsc, stsz, _fbox("stco", 0, 0, _u32(1), _u32(off)));
  var minf = _box("minf", _fbox("smhd", 0, 0, _u16(0), _u16(0)), _box("dinf", _fbox("dref", 0, 0, _u32(1), _fbox("url ", 0, 1))), stbl);
  var mdia = _box("mdia", _fbox("mdhd", 0, 0, _u32(0), _u32(0), _u32(sr), _u32(tot), _u16(0x55C4), _u16(0)),
    _fbox("hdlr", 0, 0, _u32(0), _str("soun"), _u32(0), _u32(0), _u32(0), _str("SoundHandler\0")), minf);
  return _box("trak", _fbox("tkhd", 0, 3, _u32(0), _u32(0), _u32(id), _u32(0), _u32(durMv), _u32(0), _u32(0), _u16(0), _u16(1), _u16(0x0100), _u16(0),
    _MTX9, _u32(0), _u32(0)), mdia);
}
function v3MuxAV(W, H, fps, kod, vs, au){
  var vTotal = 0, aTotal = 0, i;
  for(i = 0; i < vs.length; i++) vTotal += vs[i].data.length;
  if(au) for(i = 0; i < au.samples.length; i++) aTotal += au.samples[i].data.length;
  var maxCts = 0; for(i = 0; i < vs.length; i++) if(vs[i].cts > maxCts) maxCts = vs[i].cts;
  var durMv = Math.round((maxCts + 1)/fps*1000);
  if(au){ var ad = 0; for(i = 0; i < au.samples.length; i++) ad += au.samples[i].dur; durMv = Math.max(durMv, Math.round(ad/au.sampleRate*1000)) }
  var mvhd = _fbox("mvhd", 0, 0, _u32(0), _u32(0), _u32(1000), _u32(durMv), _u32(0x00010000), _u16(0x0100), _u16(0), _u32(0), _u32(0),
    _MTX9, _cat([_u32(0), _u32(0), _u32(0), _u32(0), _u32(0), _u32(0)]), _u32(au ? 3 : 2));
  var ftyp = _box("ftyp", _str("isom"), _u32(512), _str("isom"), _str("iso2"), _str("mp41"), _str("mp42"), _str(kod.kind === "vp9" ? "iso6" : "avc1"));
  var build = function(offV, offA){
    var parts = ["moov", mvhd, _v3VideoTrak(W, H, fps, kod, vs, 1, offV, durMv)];
    if(au) parts.push(_v3AudioTrak(au, 2, offA, durMv));
    return _box.apply(null, parts);
  };
  var moov = build(0, 0), dataOff = ftyp.length + moov.length + 8;
  moov = build(dataOff, dataOff + vTotal);
  var bits = [ftyp, moov, _cat([_u32(vTotal + aTotal + 8), _str("mdat")])];
  for(i = 0; i < vs.length; i++) bits.push(vs[i].data);
  if(au) for(i = 0; i < au.samples.length; i++) bits.push(au.samples[i].data);
  return new Blob(bits, {type:"video/mp4"});
}
/* ljudkodning: AAC först, Opus som reserv */
async function v3EncodeAudio(buf){
  if(typeof AudioEncoder === "undefined" || typeof AudioData === "undefined") return null;
  var sr = buf.sampleRate, nch = buf.numberOfChannels, tries = [
    {kind:"aac", cfg:{codec:"mp4a.40.2", sampleRate:sr, numberOfChannels:nch, bitrate:160000, aac:{format:"aac"}}},
    {kind:"opus", cfg:{codec:"opus", sampleRate:sr, numberOfChannels:nch, bitrate:128000}}], pick2 = null, i;
  for(i = 0; i < tries.length && !pick2; i++){
    try { var r = await AudioEncoder.isConfigSupported(tries[i].cfg); if(r && r.supported) pick2 = {kind:tries[i].kind, cfg:r.config || tries[i].cfg} } catch(e){}
  }
  if(!pick2) return null;
  var samples = [], desc = null, fel = null;
  var enc = new AudioEncoder({
    output:function(chunk, meta){
      if(meta && meta.decoderConfig && meta.decoderConfig.description && !desc){
        var d = meta.decoderConfig.description; desc = new Uint8Array(d.buffer ? d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength) : d);
      }
      var b = new Uint8Array(chunk.byteLength); chunk.copyTo(b);
      samples.push({data:b, dur:Math.round(chunk.duration*sr/1000000)});
    },
    error:function(e){ fel = e }
  });
  enc.configure(pick2.cfg);
  var FR = 1024*4, n = buf.length, ch = [], k;
  for(k = 0; k < nch; k++) ch.push(buf.getChannelData(k));
  for(var s = 0; s < n; s += FR){
    var len = Math.min(FR, n - s), data = new Float32Array(len*nch);
    for(k = 0; k < nch; k++) data.set(ch[k].subarray(s, s + len), k*len);
    var ad = new AudioData({format:"f32-planar", sampleRate:sr, numberOfFrames:len, numberOfChannels:nch, timestamp:Math.round(s/sr*1000000), data:data});
    enc.encode(ad); ad.close();
    if(fel) break;
  }
  try { await enc.flush() } catch(e){ fel = e }
  try { if(enc.state !== "closed") enc.close() } catch(e){}
  if(fel || !samples.length) return null;
  if(pick2.kind === "aac" && !desc) return null;
  return {kind:pick2.kind, sampleRate:sr, channels:nch, desc:desc, samples:samples, bitrate:pick2.cfg.bitrate};
}
async function v3EncodeVideo(canvas, W, H, fps, N, draw, onp){
  var val = await mp4codec(W, H, fps, 12000000);
  if(!val) return null;
  var samples = [], desc = null, fel = null;
  var enc = new VideoEncoder({
    output:function(chunk, meta){
      if(meta && meta.decoderConfig && meta.decoderConfig.description && !desc){
        var d = meta.decoderConfig.description; desc = new Uint8Array(d.buffer ? d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength) : d);
      }
      var b = new Uint8Array(chunk.byteLength); chunk.copyTo(b);
      samples.push({data:b, key:chunk.type === "key", cts:Math.round(chunk.timestamp*fps/1000000)});
    },
    error:function(e){ fel = e }
  });
  enc.configure(val.config);
  var USEC = 1000000/fps, KEY = Math.round(fps*2);
  try {
    for(var i = 0; i < N; i++){
      if(fel) throw fel;
      draw(i);
      var vf = new VideoFrame(canvas, {timestamp:Math.round(i*USEC), duration:Math.round(USEC)});
      enc.encode(vf, {keyFrame:(i % KEY) === 0}); vf.close();
      while(enc.encodeQueueSize > 8 && !fel) await new Promise(function(r){ setTimeout(r, 1) });
      if(onp && (i & 7) === 0){ onp(i + 1, N); await new Promise(function(r){ setTimeout(r, 0) }) }
    }
    await enc.flush();
  } finally { try { if(enc.state !== "closed") enc.close() } catch(e){} }
  if(fel) throw fel;
  if(!samples.length || (val.kind === "avc" && !desc)) return null;
  return {samples:samples, kod:val.kind === "vp9" ? mp4vp9(val.config.codec || val.codec) : {kind:"avc", desc:desc}, kind:val.kind};
}

/* ---------- spara: webbläsarens egen väg om Studions saknas ---------- */
function v3Say(msg, ms){
  var el = document.getElementById("v3toast");
  if(!el){ el = document.createElement("div"); el.id = "v3toast"; document.body.appendChild(el) }
  el.textContent = msg; el.setAttribute("data-on", "");
  clearTimeout(v3Say.t); if(ms !== 0) v3Say.t = setTimeout(function(){ el.removeAttribute("data-on") }, ms || 4200);
}
async function v3Save(blob, filename){
  try {
    var dl = await downloads();
    if(dl){ await dl.save({filename:filename, data:blob}); return true }
  } catch(e){}
  try {
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url) }, 20000);
    return true;
  } catch(e){ return false }
}
var V3_BUSY = false;
async function v3ExportVideo(btn){
  if(V3_BUSY) return; V3_BUSY = true;
  var lbl = btn.textContent, comp = V3_COMPS[V3S.comp], fmt = V3S.fmt, d = v3Dims(fmt), W = d[0], H = d[1];
  btn.disabled = true;
  try {
    if(typeof VideoEncoder === "undefined") throw new Error("Den här webbläsaren saknar videokodare. Använd Chrome, Edge eller Safari.");
    await v3Load(); V3S.playing = false; v3StopSound();
    v3Say("Förbereder ljud…", 0); btn.textContent = "Förbereder…";
    var buf = await v3Audio(V3S.comp, 48000), au = null;
    try { au = buf ? await v3EncodeAudio(buf) : null } catch(e){ au = null }
    var cv = document.createElement("canvas"), N = Math.round(comp.dur*V3_FPS), t0 = performance.now();
    var r = await v3EncodeVideo(cv, W, H, V3_FPS, N, function(i){ v3DrawComp(cv, W, V3S.comp, fmt, i/V3_FPS) }, function(i, n){
      var kv = i > 8 ? Math.round((performance.now() - t0)/i*(n - i)/1000) : 0;
      btn.textContent = "Renderar " + Math.round(i/n*100) + " %" + (kv ? " · " + kv + " s kvar" : ""); v3Say("Renderar videon… " + Math.round(i/n*100) + " %" + (kv ? " · " + kv + " s kvar" : ""), 0);
    });
    if(!r) throw new Error("Webbläsaren kunde inte koda videon.");
    var blob = v3MuxAV(W, H, V3_FPS, r.kod, r.samples, au);
    if(!(await verifyClip(blob, comp.dur))) throw new Error("Filen gick inte att läsa tillbaka, så ingen fil lämnas ut.");
    var name = "viewly-" + V3S.comp + "-" + (fmt === "916" ? "9x16" : "4x5") + ".mp4";
    btn.textContent = "Sparar…"; v3Say("Sparar " + name + "…", 0);
    var ok = await v3Save(blob, name);
    v3Say(ok ? "Klart: " + name + " · " + comp.dur.toFixed(0) + " s · " + (blob.size/1048576).toFixed(1).replace(".", ",") + " MB · "
        + (au ? "med ljud (" + (au.kind === "aac" ? "AAC" : "Opus") + ")" : "utan ljud — webbläsaren kan inte koda ljud, ladda ner WAV separat")
        + (r.kind === "avc" ? "" : " · VP9, spelas inte på iPhone") : "Kunde inte spara filen.", 9000);
  } catch(e){ v3Say("Export misslyckades: " + (e && e.message || e), 9000) }
  btn.disabled = false; btn.textContent = lbl; V3_BUSY = false;
}
async function v3ExportWav(btn){
  if(V3_BUSY) return; V3_BUSY = true; var lbl = btn.textContent; btn.disabled = true; btn.textContent = "Renderar ljud…";
  try {
    var buf = await v3Audio(V3S.comp, 44100); if(!buf) throw new Error("Webbläsaren saknar ljudmotor.");
    var ok = await v3Save(v3Wav(buf), "viewly-" + V3S.comp + "-ljud.wav");
    v3Say(ok ? "Ljudet sparades som WAV." : "Kunde inte spara filen.");
  } catch(e){ v3Say("Ljudet gick inte att rendera: " + (e && e.message || e), 7000) }
  btn.disabled = false; btn.textContent = lbl; V3_BUSY = false;
}
function v3PngBlob(painter, ar){
  var cv = document.createElement("canvas"), W = 1080, H = Math.round(W*ar);
  var c = v3Begin(cv, W, H); painter(c);
  return new Promise(function(res){ cv.toBlob(res, "image/png") });
}
async function v3ExportPng(btn, spec){
  var lbl = btn.textContent; btn.disabled = true; btn.textContent = "Renderar…";
  try {
    await v3Load();
    var p = v3Painter(spec), blob = await v3PngBlob(p.fn, p.ar);
    var ok = await v3Save(blob, "viewly-" + spec.replace(/[:|]/g, "-") + ".png");
    v3Say(ok ? "Sparade " + spec.replace(/[:|]/g, "-") + ".png" : "Kunde inte spara filen.");
  } catch(e){ v3Say("Export misslyckades: " + (e && e.message || e), 7000) }
  btn.disabled = false; btn.textContent = lbl;
}

/* ---------- vad som ritas i en canvas med data-spec ---------- */
/* spec: "static:p1" · "slide:b:0" · "post:overlay:tillsalu:45" · "outro:marin:916" · "comp:kort:916:3.2" */
function v3Painter(spec){
  var p = spec.split(":"), k = p[0];
  if(k === "static"){
    var s = V3_STATIC.filter(function(x){ return x.id === p[1] })[0], G = v3Geo("45");
    return {ar:1.25, fn:function(c){ s.draw(c, G) }};
  }
  if(k === "slide"){
    var G2 = v3Geo("45");
    return {ar:1.25, fn:function(c){ V3_CAR[p[1]].slides[+p[2]](c, G2) }};
  }
  if(k === "post"){
    var ar = p[3] === "916" ? 1.7778 : p[3] === "11" ? 1 : 1.25;
    return {ar:ar, fn:function(c){ v3Fill(c, 0, 0, 100, 100*ar, "#000"); v3Post(c, p[1], p[2], null, 0, 0, 100, ar, 1) }};
  }
  if(k === "outro"){
    var G3 = v3Geo(p[2]), t = p[3] ? +p[3] : 5;
    return {ar:G3.H/100, fn:function(c){ v3Outro(c, G3, p[1], t, {noFade:true}) }};
  }
  var G4 = v3Geo(p[2]);
  return {ar:G4.H/100, fn:function(c){ V3_COMPS[p[1]].draw(c, G4, +p[3], v3O()) }};
}
function v3Mount(){
  var cvs = document.querySelectorAll("canvas[data-v3]");
  if(!cvs.length) return;
  v3Load().then(function(){
    cvs.forEach(function(cv){
      var p = v3Painter(cv.dataset.v3), wpx = +(cv.dataset.w || 540), c = v3Begin(cv, wpx, Math.round(wpx*p.ar));
      p.fn(c);
    });
    v3Stage();
  });
}

/* ---------- scenen: spelar den valda kompositionen ---------- */
function v3Stage(t){
  var cv = document.getElementById("v3stage"); if(!cv || !V3.ready) return;
  var comp = V3_COMPS[V3S.comp], d = v3Dims(V3S.fmt), W = Math.min(d[0], Math.round(cv.clientWidth*(window.devicePixelRatio || 1)) || 720);
  if(t != null) V3S.t = Math.max(0, Math.min(comp.dur, t));
  v3DrawComp(cv, W, V3S.comp, V3S.fmt, V3S.t);
  var sc = document.getElementById("v3scrub"); if(sc && document.activeElement !== sc) sc.value = Math.round(V3S.t/comp.dur*1000);
  var tm = document.getElementById("v3time"); if(tm) tm.textContent = V3S.t.toFixed(1).replace(".", ",") + " / " + comp.dur.toFixed(1).replace(".", ",") + " s";
}
function v3StopSound(){ if(V3S.src){ try{ V3S.src.stop() }catch(e){} V3S.src = null } }
function v3Loop(now){
  if(!V3S.playing) return;
  var comp = V3_COMPS[V3S.comp], t = V3S.src && V3S.ctxA ? V3S.startT + (V3S.ctxA.currentTime - V3S.startCtx) : V3S.startT + (now - V3S.startNow)/1000;
  if(t >= comp.dur){ V3S.playing = false; v3StopSound(); v3Stage(comp.dur); var b = document.getElementById("v3play"); if(b) b.textContent = "▶"; return }
  v3Stage(t);
  V3S.raf = requestAnimationFrame(v3Loop);
}
async function v3Play(){
  var b = document.getElementById("v3play");
  if(V3S.playing){ V3S.playing = false; v3StopSound(); if(b) b.textContent = "▶"; return }
  await v3Load();
  var comp = V3_COMPS[V3S.comp];
  if(V3S.t >= comp.dur - .05) V3S.t = 0;
  V3S.playing = true; if(b) b.textContent = "❚❚";
  V3S.startT = V3S.t; V3S.startNow = performance.now();
  if(V3S.sound){
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if(!V3S.ctxA) V3S.ctxA = new AC();
      if(V3S.ctxA.state === "suspended") await V3S.ctxA.resume();
      var buf = await v3Audio(V3S.comp, 44100);
      if(buf && V3S.playing){
        var s = V3S.ctxA.createBufferSource(); s.buffer = buf; s.connect(V3S.ctxA.destination);
        V3S.startCtx = V3S.ctxA.currentTime + .05; s.start(V3S.startCtx, V3S.startT); V3S.src = s;
      }
    } catch(e){ V3S.src = null }
  }
  V3S.startNow = performance.now();
  V3S.raf = requestAnimationFrame(v3Loop);
}

/* ---------------------------------------------------------------------
   SIDAN
   --------------------------------------------------------------------- */
function v3Seg(kind, val, label, on){
  return '<button type="button" class="a3seg' + (on ? " on" : "") + '" data-a3="' + kind + '" data-v="' + val + '">' + esc(label) + '</button>';
}
function v3Canvas(spec, w, cls){ return '<canvas class="a3cv ' + (cls || "") + '" data-v3="' + spec + '" data-w="' + (w || 540) + '"></canvas>' }
function v3Tabs(){
  var T = [["video", "Videor"], ["kar", "Karusell"], ["stat", "Statiska"], ["inl", "Inlägg"], ["out", "Slutkort"], ["plan", "Kampanjplan"]];
  return '<div class="a3tabs">' + T.map(function(x){
    return '<button type="button" class="a3tab" data-a3="tab" data-v="' + x[0] + '" aria-current="' + (V3S.tab === x[0]) + '">' + x[1] + '</button>';
  }).join("") + '</div>';
}
function v3TxField(key, label){
  return '<label class="a3f"><span>' + esc(label) + '</span><input type="text" value="' + esc(String(v3t(key))) + '" placeholder="' + esc(V3_TXD[key]) + '" data-a3tx="' + key + '"></label>';
}
function v3Field(path, label, type){
  var p = path.split("."), v = V3_CFG[p[0]]; if(p[1]) v = v[p[1]]; else v = V3_CFG[p[0]];
  if(p[0] === "hook" || p[0] === "fore" || p[0] === "typo") v = V3_CFG[p[0]][+p[1]];
  return '<label class="a3f"><span>' + esc(label) + '</span><input type="' + (type || "text") + '" value="' + esc(String(v)) + '" data-a3cfg="' + path + '"></label>';
}
function v3Customizer(open){
  var f = v3Field;
  return '<details class="a3det a3cust"' + (open ? ' open' : '') + ' id="v3cust"><summary>Ändra texter: hook, slutkort, mallar, portal · färger och objektuppgifter</summary><div class="a3custg">'
    + '<div><b>Texter</b>' + f("hook.0", "Hook (Till salu, Såld, Direkt) rad 1") + f("hook.1", "Hook rad 2") + f("fore.0", "Före/efter rad 1") + f("fore.1", "Före/efter rad 2") + f("typo.0", "Välj bild-hooken rad 1") + f("typo.1", "Välj bild-hooken rad 2") + '</div>'
    + '<div><b>Slutkort (outro)</b>' + v3TxField("outro.tag1", "Slagord rad 1") + v3TxField("outro.tag2", "Slagord rad 2 (kursiv)") + v3TxField("outro.aud", "Målgruppsrad") + v3TxField("outro.url", "Adress / länk") + '<small class="a3hint">Tomt fält döljer raden. Logotypen är fast.</small></div>'
    + '<div><b>Mallarnas fasta text</b>' + v3TxField("tpl.tillsalu", "Till salu") + v3TxField("tpl.kommande", "Kommande") + v3TxField("tpl.sald", "Såld") + v3TxField("tpl.tack", "Under Såld") + '</div>'
    + '<div><b>Portalen i videon</b>' + v3TxField("ui.portal", "Portalens namn") + v3TxField("ui.valjbild", "Rubrik 1") + v3TxField("ui.valjmall", "Rubrik 2") + v3TxField("ui.mina", "Väljare, aktiv") + v3TxField("ui.viewlys", "Väljare, andra") + v3TxField("ui.egen", "Knapp: egen mall") + '</div>'
    + '<div><b>Bostad (demodata)</b>' + f("obj.addr", "Adress") + f("obj.city", "Ort") + f("obj.rum", "Rum") + f("obj.yta", "Boarea (m²)") + f("obj.kommande", "Kommande-text") + f("obj.maklare", "Ansvarig mäklare") + '</div>'
    + '<div><b>Kontorsprofil (exempel)</b>' + f("off.name", "Kontorsnamn") + f("off.sub", "Underrad") + f("off.accent", "Kontorets färg", "color") + f("off.accentL", "Kontorets ljusa färg", "color") + '</div>'
    + '<div><b>Viewlys färger</b>' + f("col.dark", "Mörk bakgrund", "color") + f("col.paper", "Papper", "color") + f("col.ink", "Text och logga (ljus bakgrund)", "color") + f("col.oli", "Oliv (ljus bakgrund)", "color") + f("col.olil", "Oliv lyft (mörk bakgrund)", "color")
    + '<button type="button" class="a3mini" data-a3="reset" style="margin-top:12px">Återställ allt</button></div>'
    + '</div></details>';
}
function v3VideoTab(){
  var comp = V3_COMPS[V3S.comp];
  var cards = Object.keys(V3_COMPS).filter(function(id){ return V3_COMPS[id].group !== "hl" }).map(function(id){
    var c2 = V3_COMPS[id];
    return '<button type="button" class="a3card" data-a3="comp" data-v="' + id + '" aria-current="' + (V3S.comp === id) + '">'
      + '<div class="a3cth">' + v3Canvas("comp:" + id + ":916:" + c2.thumb, 270) + '</div>'
      + '<div class="a3ctl"><i>' + c2.dur.toFixed(0) + ' s · 9:16 och 4:5 · ljud</i><b>' + esc(c2.n) + '</b><span>' + esc(c2.d) + '</span></div></button>';
  }).join("");
  var hooks = V3_HOOKS.map(function(h, i){ return v3Seg("hook", i, h[0] + " " + h[1], V3_CFG.hook[0] === h[0] && V3_CFG.hook[1] === h[1]) }).join("");
  var outs = V3_OUT.map(function(o){ return v3Seg("outro", o.id, o.n, V3S.outro === o.id) }).join("");
  return '<div class="a3cards">' + cards + '</div>'
    + '<div class="a3work"><div class="a3stagewrap ' + (V3S.fmt === "916" ? "w916" : "w45") + '">'
    + '<canvas id="v3stage" class="a3cv a3stage"></canvas>'
    + '<div class="a3ctl2"><button class="a3play" type="button" data-a3="play" id="v3play">' + (V3S.playing ? "❚❚" : "▶") + '</button>'
    + '<div class="a3scrubw"><input type="range" id="v3scrub" min="0" max="1000" value="' + Math.round(V3S.t/comp.dur*1000) + '"></div>'
    + '<span class="mono" id="v3time"></span></div></div>'
    + '<div class="a3panel"><div class="a3h">Format</div><div class="a3segs">' + v3Seg("fmt", "916", "Reel · 9:16", V3S.fmt === "916") + v3Seg("fmt", "45", "Flöde · 4:5", V3S.fmt === "45") + '</div>'
    + '<div class="a3h">Ljud</div><div class="a3segs">' + v3Seg("sound", "1", "På", V3S.sound) + v3Seg("sound", "0", "Av", !V3S.sound) + '</div>'
    + '<div class="a3h">Hook (första sekunderna)</div><div class="a3segs col">' + hooks + '</div>'
    + '<label class="a3f" style="margin-top:8px"><span>Egen hook, rad 1</span><input type="text" value="' + esc(V3_CFG.hook[0]) + '" data-a3cfg="hook.0"></label>'
    + '<label class="a3f"><span>Egen hook, rad 2</span><input type="text" value="' + esc(V3_CFG.hook[1]) + '" data-a3cfg="hook.1"></label>'
    + '<div class="a3h">Slutkortets text</div><a class="a3hint" href="#v3cust" data-a3="opencust" style="text-decoration:underline;cursor:pointer">Ändra slagord, adress och mer ↓</a>'
    + '<div class="a3h">Slutkort</div><div class="a3segs col">' + outs + '</div>'
    + '<div class="a3h">Ladda ner</div><div class="a3segs col"><button class="a3seg dl" type="button" data-a3="mp4">MP4 · ' + (V3S.fmt === "916" ? "9:16 · 1080 × 1920" : "4:5 · 1080 × 1350") + ' · med ljud</button>'
    + '<button class="a3seg dl" type="button" data-a3="wav">Ljud · WAV</button></div>'
    + '</div></div>' + v3Customizer(true)
    + '<div class="a3sub">Text till Meta</div><div class="a3copy"><div><b>Rubrik</b><p>Dina bilder är levererade. Kampanjen är redan klar.</p><b>Primärtext</b><p>Dina bilder är levererade. Välj bild, välj mall — bostadens uppgifter följer med från leveransen, och inlägget är klart i ditt kontors egen profil. Det är bara en del av Viewly: bostadsfotografering för mäklare i Skåne.</p></div>'
    + '<div><b>Knapp och länk</b><p>Läs mer · viewly.se/maklare</p><b>Mål</b><p>Trafik till /maklare och bokning av provfotografering.</p></div></div>';
}
function v3Gallery(items, w){
  return '<div class="a3gal">' + items.map(function(it){
    return '<div class="a3gi"><div class="a3gth">' + v3Canvas(it.spec, w || 540) + '</div><div class="a3gm"><div><b>' + esc(it.n) + '</b>' + (it.d ? '<span>' + esc(it.d) + '</span>' : '') + '</div>'
      + '<button type="button" class="a3mini" data-a3="png" data-v="' + it.spec + '">PNG</button></div></div>';
  }).join("") + '</div>';
}
function v3KarTab(){
  var set = V3_CAR.b;
  return '<div class="a3sub">' + esc(set.n) + '</div><p class="a3lede">' + esc(set.d) + '</p><div class="a3slides">'
    + set.slides.map(function(s, i){
      return '<div class="a3sl"><div class="a3gth">' + v3Canvas("slide:b:" + i, 540) + '</div><div class="a3gm"><span class="mono">' + (i + 1) + ' / ' + set.slides.length + '</span><button type="button" class="a3mini" data-a3="png" data-v="slide:b:' + i + '">PNG</button></div></div>';
    }).join("") + '</div>' + v3Customizer()
    + '<div class="a3copy"><div><b>Rubrik</b><p>Dina bilder är levererade. Nu då?</p><b>Primärtext</b><p>Välj bild, välj mall. Bostadens uppgifter följer med från leveransen — och inlägget är klart i ditt kontors egen profil.</p></div></div>';
}
function v3StatTab(){
  return '<p class="a3lede">Enkelbilder i 4:5 för flödet. Samma bildspråk som videon, ett påstående per bild.</p>'
    + v3Gallery(V3_STATIC.map(function(s){ return {spec:"static:" + s.id, n:s.n, d:s.d} })) + v3Customizer();
}
function v3InlTab(){
  var styles = [["overlay", "Overlay"], ["editorial", "Editorial"], ["badge", "Badge"]];
  var ph = [["tillsalu", "Till salu"], ["kommande", "Kommande"], ["sald", "Såld"]];
  var seg = '<div class="a3segs row">' + styles.map(function(s){ return v3Seg("tpl", s[0], s[1], V3S.tplStyle === s[0]) }).join("") + '<span class="a3gap"></span>'
    + [["45", "Inlägg 4:5"], ["916", "Story 9:16"], ["11", "Kvadrat 1:1"]].map(function(f){ return v3Seg("tplfmt", f[0], f[1], V3S.tplFmt === f[0]) }).join("") + '</div>';
  return '<p class="a3lede">Förslag på mallar för Till salu, Kommande och Såld: helbild med overlay, centrerade eller redaktionella. Kontoret är Nordvik Mäklarbyrå som exempel, och kontorets färger ändras under Anpassa. Studions nuvarande mallar är inte ändrade.</p>'
    + seg + v3Gallery(ph.map(function(f){ return {spec:"post:" + V3S.tplStyle + ":" + f[0] + ":" + V3S.tplFmt, n:f[1], d:""} }), 540) + v3Customizer();
}
function v3OutTab(){
  return '<p class="a3lede">Slutkort för varumärket: en egen sekund, och därefter ett par till för tagline och adress. Klicka på ett kort för att använda det i videorna. Märket och ordbilden har samma höjd, med märket något högre så att de väger lika. Färgerna är Viewlys egna.</p>'
    + '<div class="a3segs row">' + v3Seg("ofmt", "916", "9:16", V3S.outroPreviewFmt === "916") + v3Seg("ofmt", "45", "4:5", V3S.outroPreviewFmt === "45") + '</div>'
    + '<div class="a3gal a3out">' + V3_OUT.map(function(o){
      return '<div class="a3gi"><button type="button" class="a3pick" data-a3="outro" data-v="' + o.id + '" aria-current="' + (V3S.outro === o.id) + '"><div class="a3gth">' + v3Canvas("outro:" + o.id + ":" + V3S.outroPreviewFmt, 400) + '</div></button>'
        + '<div class="a3gm"><div><b>' + esc(o.n) + '</b></div><button type="button" class="a3mini" data-a3="png" data-v="outro:' + o.id + ':' + V3S.outroPreviewFmt + '">PNG</button></div></div>';
    }).join("") + '</div>' + v3Customizer();
}
function v3Underlag(){
  return '<details class="a3det"><summary>Vad annonserna säger, och vad som är verifierat</summary><div class="a3und">'
    + '<div><b>Budskapet</b><p>Verktygen är dörren in. När fotona är levererade ligger bostadens uppgifter redan på leveranssidan. Mäklaren väljer bild och mall, och uppgifterna följer med in i mallen i kontorets profil, i alla format. Tidsbesparingen står inte ordagrant — den syns: inget skrivs om, inget laddas upp, inget formateras om. Och det är bara en del av Viewly, därför slutar varje annons i varumärket.</p>'
    + '<p><b>Att bekräfta före publicering:</b> Mäklarportalens riktiga flöde (bild, mall, uppgifter) ska jämföras med skärmarna i annonsen, som är en förenklad återgivning.</p></div>'
    + '<div><b>Verifierat på viewly.se</b><p>Social Media Studio hämtar levererade bilder, adress, rum, boarea, pris, ansvarig mäklare och visningsuppgifter. Kontoret ställer in logga, färger, typsnitt och layout per fas en gång. Faserna är Kommande, Till salu, Visning och Såld. Format: 4:5, 1:1, 9:16, 16:9 och A4. Hör till ViewlyPro, 30 dagar gratis, ingen bindningstid.</p>'
    + '<p>Rubriken på /maklare: "En bostadsfotograf som gör mer än bara fotografering." Sloganen: "Du bokar, vi sköter resten."</p></div>'
    + '<div><b>Demodata och förslag</b><p>Storgatan 13, priset, tiderna och kontoret Nordvik Mäklarbyrå är demodata. Nordviks riktiga profil är inte använd. Inläggsmallarna är ett förslag.</p>'
    + '<p><b>Meta.</b> Annonsen säljer en tjänst till företag och bör inte falla under Bostäder — kontrollera i annonshanteraren. Affischerna i det första fotot är andras konstverk.</p></div></div></details>';
}
function v3PlanTab(){
  var rows = function(items){ return items.map(function(r){ return '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>' }).join("") };
  return '<p class="a3lede">Från prototyp till kampanj: vad den ska åstadkomma, vem den når, hur den delas upp, vad som testas och vad som måste vara klart innan den går live. Inga prestandasiffror är påhittade — mål och gränsvärden sätter ni när ni sett första utfallet.</p>'
  + '<div class="a3plan">'
  + '<div class="a3pc"><h4>Syfte och löfte</h4><p><b>Syfte.</b> Göra Viewly känt som fotografen som gör mer än bara fotografering, och väcka intresse för verktygen i Mäklarportalen. Första konverteringen är bokning av provfotografering. ViewlyPro (30 dagar gratis, ingen bindningstid) är den mjuka vägen in — verifierat på viewly.se.</p>'
  + '<p><b>Löfte.</b> Fotona är bra. De levereras. Uppgifterna följer med, du väljer bild och mall, och inlägget är klart i ditt kontors profil. Det är bara en del av Viewly.</p></div>'
  + '<div class="a3pc"><h4>Målgrupp</h4><p>Fastighetsmäklare och mäklarkontor i Skåne — Malmö, Helsingborg, Lund och hela Skåne. Primär: kontorschef eller den som ansvarar för marknadsföring. Sekundär: enskild mäklare.</p><p>Inriktning i Meta: geografi Skåne, yrkesroll/intresse (verifiera vilka alternativ som finns i annonshanteraren), samt lookalike på befintliga kunder. Antagande, inte testat.</p></div>'
  + '<div class="a3pc"><h4>Struktur: tre steg</h4><table class="a3tb">' + rows([
      ["1 · Kännedom", "Kall publik. Reels 9:16: <b>Till salu · Overlay</b> och <b>Direkt</b>, plus statiska <b>Varumärket · skymning</b>. Mål: räckvidd och videovisningar."],
      ["2 · Intresse", "Varm publik: sett minst hälften av en video, eller engagerat. Karusellen <b>Så fungerar det</b> och <b>Före / efter</b>. Mål: trafik till viewly.se/maklare."],
      ["3 · Beslut", "Het publik: besökt /maklare senaste 30 dagarna. <b>Välj bild. Välj mall.</b>, <b>Du bokar. Vi sköter resten.</b> och <b>Såld · Editorial</b>. Mål: bokning av provfotografering."]]) + '</table></div>'
  + '<div class="a3pc"><h4>Test, ett i taget</h4><p>Hook (tre varianter), slutkort (papper mot mörk), format (9:16 mot 4:5) och mall (Overlay mot Editorial). Ändra en sak åt gången. Lika budget per annonsuppsättning under testet. Byt kreativ när frekvensen stiger eller klickfrekvensen faller — gränsvärden sätter ni själva.</p></div>'
  + '<div class="a3pc"><h4>Mät</h4><p>3-sekundsvisningar och ThruPlay (video), klickfrekvens (länk), kostnad per landningssidevisning, och antal bokningar. Märk länkarna: <span class="mono">utm_source=meta&amp;utm_medium=paid_social&amp;utm_campaign=viewly_maklare&amp;utm_content=&lt;annonsnamn&gt;</span></p>'
  + '<p><b>Hypotes att testa:</b> en annons som visar verktyget ger fler bokningar än en ren fotoannons.</p></div>'
  + '<div class="a3pc"><h4>Namn och filer</h4><p>Namnge så här: <span class="mono">VWL_SE_Q4_REEL916_TILLSALU-OVERLAY_v1</span>. Video: MP4, H.264 och AAC, 1080 × 1920 (Reels/Stories) eller 1080 × 1350 (flöde). Text och logga ligger innanför 250 px topp och 340 px botten i 9:16 — ett antagande om Instagrams gränssnitt, verifiera mot Metas riktlinjer.</p></div>'
  + '<div class="a3pc"><h4>Före lansering</h4><ul><li>Jämför Mäklarportalens riktiga flöde med skärmarna i annonsen. De är en förenklad återgivning.</li><li>Byt ut exempelkontoret Nordvik mot riktig profil, eller håll det anonymt.</li><li>Klarera affischerna i det första fotot, eller byt bild.</li><li>Kontrollera att annonsen inte klassas som Bostäder i annonshanteraren.</li><li>Kontrollera mobilvyn på viewly.se/maklare och att pixel och samtycke fungerar.</li><li>Lyssna på ljudet. Det är syntetiserat och jag har inte hört det.</li></ul></div>'
  + '</div>';
}
function secAds3(){
  if(V3_COMPS[V3S.comp] && V3_COMPS[V3S.comp].group === "hl"){ V3S.comp = "salu"; V3S.t = V3_COMPS.salu.thumb; V3S.playing = false; v3StopSound() }
  var body = V3S.tab === "video" ? v3VideoTab() : V3S.tab === "kar" ? v3KarTab() : V3S.tab === "stat" ? v3StatTab() : V3S.tab === "inl" ? v3InlTab() : V3S.tab === "plan" ? v3PlanTab() : v3OutTab();
  setTimeout(v3Mount, 0);
  return '<div class="a3page"><div class="a3head"><div class="eyebrow">Ads · 11</div><h2>Viewlys annonser</h2>'
    + '<p>Fotona levereras, uppgifterna ligger redan på leveranssidan, man väljer bild och mall. Verktygen är dörren in till Viewly. Video i 9:16, allt annat i 4:5. Förslag, inte låsta krav. Inget publicerat.</p></div>'
    + v3Tabs() + body + v3Underlag() + '</div>';
}
var V3_REPAINT = 0;
function v3Repaint(){ if(V3_REPAINT) return; V3_REPAINT = requestAnimationFrame(function(){ V3_REPAINT = 0; v3Mount() }) }
document.addEventListener("click", function(e){
  var b = e.target.closest("[data-a3]"); if(!b) return;
  var k = b.dataset.a3, v = b.dataset.v;
  if(k === "tab"){ V3S.tab = v; V3S.playing = false; v3StopSound(); render({top:true}); return }
  if(k === "comp"){ V3S.comp = v; V3S.t = V3_COMPS[v].thumb; V3S.playing = false; v3StopSound(); render(); return }
  if(k === "opencust"){ e.preventDefault(); var dc = document.getElementById("v3cust"); if(dc){ dc.open = true; dc.scrollIntoView({behavior:"smooth", block:"start"}) } return }
  if(k === "fmt"){ V3S.fmt = v; render(); return }
  if(k === "sound"){ V3S.sound = v === "1"; if(!V3S.sound) v3StopSound(); render(); return }
  if(k === "hook"){ V3_CFG.hook = V3_HOOKS[+v].slice(); v3SaveCfg(); render(); return }
  if(k === "reset"){ V3_TX = {}; if(window.hlReset) hlReset(); V3_CFG = JSON.parse(JSON.stringify(V3_DEF)); v3Apply(); v3SaveCfg(); render(); return }
  if(k === "outro"){ V3S.outro = v; render(); return }
  if(k === "tpl"){ V3S.tplStyle = v; render(); return }
  if(k === "tplfmt"){ V3S.tplFmt = v; render(); return }
  if(k === "ofmt"){ V3S.outroPreviewFmt = v; render(); return }
  if(k === "play"){ v3Play(); return }
  if(k === "mp4"){ v3ExportVideo(b); return }
  if(k === "wav"){ v3ExportWav(b); return }
  if(k === "png"){ v3ExportPng(b, v); return }
});
document.addEventListener("input", function(e){
  var tx = e.target.dataset && e.target.dataset.a3tx;
  if(tx){ V3_TX[tx] = e.target.value; v3SaveCfg(); v3Repaint(); return }
  var hx = e.target.dataset && e.target.dataset.a3hx;
  if(hx && window.hlSetText){ hlSetText(hx, e.target.value); v3SaveCfg(); v3Repaint(); return }
  var cf = e.target.dataset && e.target.dataset.a3cfg;
  if(cf){
    var p = cf.split("."), val = e.target.value;
    if(p[0] === "hook" || p[0] === "fore" || p[0] === "typo") V3_CFG[p[0]][+p[1]] = val; else V3_CFG[p[0]][p[1]] = val;
    v3Apply(); v3SaveCfg(); v3Repaint(); return;
  }
  if(e.target.id !== "v3scrub") return;
  V3S.playing = false; v3StopSound(); var pb = document.getElementById("v3play"); if(pb) pb.textContent = "▶";
  v3Stage(e.target.value/1000*V3_COMPS[V3S.comp].dur);
});
window.__v3 = {load:v3Load, begin:v3Begin, post:v3Post, comps:V3_COMPS, drawComp:v3DrawComp, painter:v3Painter, S:V3S, geo:v3Geo, outro:v3Outro, audio:v3Audio, wav:v3Wav, encA:v3EncodeAudio, encV:v3EncodeVideo, mux:v3MuxAV, cfg:V3_CFG};
