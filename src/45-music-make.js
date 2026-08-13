/* ============================================================
   45 — Musikmakaren

   Motion skapar sina egna låtar. Det är inte en kosmetisk finess: när
   appen komponerar musiken vet den EXAKT var varje takt, fras och
   sektionsbyte ligger — den behöver inte gissa fram dem ur en waveform.
   Klippunkterna blir därmed exakta i stället för ungefärliga, och det är
   låten som bestämmer hur långt varje klipp blir.

   Tempona är valda så att en takt hamnar nära den längd bostadsfilm
   faktiskt klipper i (2,4–3,2 s). Med halvtakter som mellansteg får
   regissören en stege av musikaliskt riktiga klipplängder att välja på.

   Syntesen är additiv och skrivs rakt in i en Float32Array — inget
   WebAudio-beroende, så låtarna går att bygga och verifiera headless.
   ============================================================ */
const MusicMake = (() => {
  const SR = 44100;
  const TAU = Math.PI * 2;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  const SCALES = {
    minor: [0, 2, 3, 5, 7, 8, 10],
    major: [0, 2, 4, 5, 7, 9, 11],
  };

  /* ---------- stilar ----------
     bpm väljs efter hur lång en takt blir:
       76 → 3,16 s   80 → 3,00 s   88 → 2,73 s   100 → 2,40 s   112 → 2,14 s */
  const STYLES = [
    {
      id: 'nordic', name: 'Nordic Calm', bpm: 80, root: 57, mode: 'minor',
      prog: [0, 5, 3, 4],
      mood: 'Stilla piano och varm pad. Standardvalet för svensk bostadsfilm.',
      palette: { piano: 1, pad: 0.9, sub: 0.5, kick: 0.5, hat: 0.35, clap: 0, pluck: 0.4, impact: 0.5, riser: 0.4 },
      kickPattern: [[], [0], [0, 2], [0, 2, 3.5], [0, 1.5, 2, 3.5]],
    },
    {
      id: 'warm', name: 'Warm Daylight', bpm: 76, root: 60, mode: 'major',
      prog: [0, 3, 5, 4],
      mood: 'Dur, ljust och vänligt. Passar villa, trädgård och morgonljus.',
      palette: { piano: 1, pad: 0.75, sub: 0.45, kick: 0.42, hat: 0.3, clap: 0, pluck: 0.55, impact: 0.4, riser: 0.35 },
      kickPattern: [[], [0], [0, 2], [0, 2, 3.5], [0, 1.5, 2, 3.5]],
    },
    {
      id: 'deep', name: 'Modern Deep', bpm: 100, root: 53, mode: 'minor',
      prog: [0, 5, 6, 4],
      mood: 'Stadig puls och djup bas. Nyproduktion, city, kväll.',
      palette: { piano: 0.35, pad: 0.7, sub: 0.9, kick: 0.95, hat: 0.7, clap: 0.5, pluck: 0.6, impact: 0.7, riser: 0.6 },
      kickPattern: [[], [0], [0, 2], [0, 1, 2, 3], [0, 1, 2, 3]],
    },
    {
      id: 'uplift', name: 'Uplift', bpm: 112, root: 62, mode: 'major',
      prog: [5, 3, 0, 4],
      mood: 'Snabbare puls och plockade toner. Familjebostad, rörelse, ljus.',
      palette: { piano: 0.4, pad: 0.6, sub: 0.7, kick: 0.85, hat: 0.75, clap: 0.65, pluck: 1, impact: 0.6, riser: 0.55 },
      kickPattern: [[], [0], [0, 2], [0, 1, 2, 3], [0, 1, 2, 3]],
    },
    {
      id: 'wide', name: 'Cinematic Wide', bpm: 88, root: 50, mode: 'minor',
      prog: [0, 5, 3, 0],
      mood: 'Breda stråkliknande svep och tunga anslag. Exteriör och drönare.',
      palette: { piano: 0.5, pad: 1, sub: 0.8, kick: 0.6, hat: 0.2, clap: 0, pluck: 0.3, impact: 1, riser: 0.8 },
      kickPattern: [[], [0], [0, 2], [0, 2], [0, 2, 3.5]],
    },
  ];
  const styleById = id => STYLES.find(s => s.id === id) || STYLES[0];

  /* ---------- ackord ur skalan ---------- */
  function chordNotes(style, degree) {
    const sc = SCALES[style.mode];
    const at = d => style.root + Math.floor(d / 7) * 12 + sc[((d % 7) + 7) % 7];
    return [at(degree), at(degree + 2), at(degree + 4)];
  }

  /* ---------- arrangemang ----------
     Nivå 0 intro, 4 peak. Sektionerna faller ut ur nivåerna, så filmen
     kan klippa på ett sektionsbyte som verkligen finns i låten. */
  function arrange(nPhrases) {
    const lv = new Array(nPhrases).fill(2);
    lv[0] = 0;
    if (nPhrases > 1) lv[1] = 1;
    const pk = Math.max(2, Math.round((nPhrases - 1) * 0.62));
    for (let i = 2; i < nPhrases; i++) lv[i] = i < pk ? 2 : i === pk ? 4 : 3;
    lv[nPhrases - 1] = 1;
    if (nPhrases >= 6) lv[nPhrases - 2] = 2;
    return lv;
  }

  /* ---------- instrument ----------
     Alla skriver direkt i mixbufferten. Ingen filterkedja — bara
     summerade partialer med egna envelopes, vilket räcker långt och är
     snabbt nog att köra i en enda synkron passning. */
  function kick(buf, s, g) {
    const n = (SR * 0.4) | 0;
    let ph = 0;
    for (let i = 0; i < n && s + i < buf.length; i++) {
      const t = i / SR;
      const f = 46 + 105 * Math.exp(-t * 34);
      ph += TAU * f / SR;
      const a = Math.exp(-t * 9) * (1 - Math.exp(-t * 900));
      buf[s + i] += Math.sin(ph) * a * g;
    }
  }
  function sub(buf, s, note, dur, g) {
    const n = (SR * dur) | 0, f = mtof(note - 12);
    for (let i = 0; i < n && s + i < buf.length; i++) {
      const t = i / SR, e = Math.min(1, t * 22) * Math.min(1, (dur - t) * 6);
      buf[s + i] += (Math.sin(TAU * f * t) * 0.85 + Math.sin(TAU * f * 2 * t) * 0.15) * e * g;
    }
  }
  function hat(buf, s, g, open) {
    const n = (SR * (open ? 0.2 : 0.055)) | 0;
    let prev = 0;
    for (let i = 0; i < n && s + i < buf.length; i++) {
      const t = i / SR, r = Math.random() * 2 - 1;
      const hp = r - prev; prev = r;                       // enkel diskant
      buf[s + i] += hp * Math.exp(-t * (open ? 16 : 65)) * g * 0.35;
    }
  }
  function clap(buf, s, g) {
    for (let k = 0; k < 3; k++) {
      const off = s + ((SR * 0.009 * k) | 0), n = (SR * 0.09) | 0;
      let prev = 0;
      for (let i = 0; i < n && off + i < buf.length; i++) {
        const t = i / SR, r = Math.random() * 2 - 1, hp = r - prev; prev = r;
        buf[off + i] += hp * Math.exp(-t * 34) * g * 0.3;
      }
    }
    const n2 = (SR * 0.22) | 0;
    let prev = 0;
    for (let i = 0; i < n2 && s + i < buf.length; i++) {
      const t = i / SR, r = Math.random() * 2 - 1, hp = r - prev; prev = r;
      buf[s + i] += hp * Math.exp(-t * 13) * g * 0.11;
    }
  }
  /** Piano: harmoniskt avtagande partialer, ljusare partialer dör först. */
  function piano(buf, s, note, dur, g) {
    const f0 = mtof(note), n = (SR * Math.min(dur, 3.2)) | 0;
    const H = [1, 2, 3, 4, 5, 6], A = [1, 0.42, 0.22, 0.11, 0.06, 0.03];
    for (let h = 0; h < H.length; h++) {
      const f = f0 * H[h] * (1 + h * 0.0006), a = A[h] * g * 0.32, dec = 2.6 + h * 1.5;
      if (f > 16000) continue;
      for (let i = 0; i < n && s + i < buf.length; i++) {
        const t = i / SR;
        buf[s + i] += Math.sin(TAU * f * t) * a * Math.exp(-t * dec) * (1 - Math.exp(-t * 500));
      }
    }
  }
  function pluck(buf, s, note, g) {
    const f0 = mtof(note), n = (SR * 0.55) | 0;
    for (let h = 1; h <= 3; h++) {
      const f = f0 * h, a = g * 0.26 / h;
      if (f > 16000) continue;
      for (let i = 0; i < n && s + i < buf.length; i++) {
        const t = i / SR;
        buf[s + i] += Math.sin(TAU * f * t) * a * Math.exp(-t * (7 + h * 4)) * (1 - Math.exp(-t * 800));
      }
    }
  }
  /** Pad: lätt detunade partialer med långsam attack — filmens grundton. */
  function pad(buf, s, notes, dur, g) {
    const n = (SR * dur) | 0;
    for (const note of notes) {
      const f0 = mtof(note);
      for (const [mul, det, amp] of [[1, 0, 1], [1, 0.004, 0.8], [2, 0.002, 0.32], [3, -0.003, 0.13]]) {
        const f = f0 * mul * (1 + det), a = g * 0.075 * amp;
        if (f > 15000) continue;
        for (let i = 0; i < n && s + i < buf.length; i++) {
          const t = i / SR;
          const e = Math.min(1, t / (dur * 0.35)) * Math.min(1, (dur - t) / (dur * 0.45));
          buf[s + i] += Math.sin(TAU * f * t) * a * e;
        }
      }
    }
  }
  function impact(buf, s, g) {
    const n = (SR * 1.4) | 0;
    let prev = 0;
    for (let i = 0; i < n && s + i < buf.length; i++) {
      const t = i / SR, r = Math.random() * 2 - 1, hp = r - prev; prev = r;
      buf[s + i] += Math.sin(TAU * 41 * t) * Math.exp(-t * 3.2) * g * 0.5
        + hp * Math.exp(-t * 12) * g * 0.09;
    }
  }
  /** Riser inför ett sektionsbyte — hörbar signal om att ett klipp kommer. */
  function riser(buf, s, dur, g) {
    const n = (SR * dur) | 0;
    let lp = 0;
    for (let i = 0; i < n && s + i < buf.length; i++) {
      const t = i / SR, p = t / dur;
      const r = Math.random() * 2 - 1;
      const k = 0.06 + p * 0.5;                            // öppnas uppåt
      lp += (r - lp) * k;
      buf[s + i] += (r - lp) * p * p * g * 0.16;
    }
  }

  /* ---------- komposition ---------- */
  /** Bygger en färdig låt och dess EXAKTA struktur.
   *  targetSeconds styr antalet fraser; låten görs alltid något längre än
   *  filmen så att sista klippet får sluta på en musikalisk punkt. */
  function compose(styleId, targetSeconds) {
    const style = styleById(styleId);
    const beat = 60 / style.bpm, bar = beat * 4, phrase = bar * 4;
    const nPhrases = Math.max(4, Math.ceil((targetSeconds + 1.5) / phrase));
    const levels = arrange(nPhrases);
    const nBars = nPhrases * 4;
    const musicEnd = nBars * bar;
    const tail = 2.2;
    const total = musicEnd + tail;
    const buf = new Float32Array(Math.ceil(total * SR) + 8);
    const P = style.palette;
    const S = t => Math.max(0, Math.round(t * SR));

    for (let b = 0; b < nBars; b++) {
      const t0 = b * bar;
      const ph = (b / 4) | 0, lvl = levels[ph], inPhrase = b % 4;
      const deg = style.prog[b % style.prog.length];
      const notes = chordNotes(style, deg);
      const dens = lvl / 4;
      const isSectionStart = inPhrase === 0 && (ph === 0 || levels[ph - 1] !== lvl);

      // pad: bärlagret, alltid närvarande men svagare i intro/outro
      if (P.pad) pad(buf, S(t0), notes.map(n => n + 12), bar * 1.02, P.pad * (0.45 + dens * 0.55));
      // bas
      if (P.sub && lvl >= 1) sub(buf, S(t0), notes[0], bar * 0.94, P.sub * (0.5 + dens * 0.5));
      if (P.sub && lvl >= 3) sub(buf, S(t0 + beat * 2.5), notes[2] - 12, beat * 1.2, P.sub * 0.4);

      // trummor
      for (const k of style.kickPattern[lvl]) kick(buf, S(t0 + k * beat), P.kick);
      if (P.hat && lvl >= 2) {
        const step = lvl >= 3 ? 0.5 : 1;
        for (let x = (lvl >= 3 ? 0.5 : 1); x < 4; x += step)
          hat(buf, S(t0 + x * beat), P.hat * (0.6 + dens * 0.4), lvl >= 4 && Math.abs(x - 3.5) < 0.01);
      }
      if (P.clap && lvl >= 3) { clap(buf, S(t0 + beat), P.clap); clap(buf, S(t0 + beat * 3), P.clap); }

      // melodi
      if (P.piano) {
        piano(buf, S(t0), notes[0] + 12, bar, P.piano * (0.5 + dens * 0.5));
        if (lvl >= 2) piano(buf, S(t0 + beat * 1.5), notes[1] + 12, beat * 2, P.piano * 0.55);
        if (lvl >= 3) piano(buf, S(t0 + beat * 3), notes[2] + 12, beat, P.piano * 0.5);
      }
      if (P.pluck && lvl >= 2) {
        const seq = lvl >= 4 ? [0, 0.75, 1.5, 2, 2.75, 3.5] : [0.75, 2, 3.25];
        seq.forEach((x, i) => pluck(buf, S(t0 + x * beat), notes[i % 3] + 24, P.pluck * (0.45 + dens * 0.45)));
      }

      // sektionsmarkörer
      if (isSectionStart && lvl >= 2 && P.impact) impact(buf, S(t0), P.impact);
      if (P.riser && inPhrase === 3 && ph + 1 < nPhrases && levels[ph + 1] > lvl)
        riser(buf, S(t0), bar, P.riser);
    }

    space(buf);
    normalize(buf, musicEnd);

    const structure = describe(style, nPhrases, levels, beat, bar, total);
    return { style, samples: buf, sampleRate: SR, duration: total, structure };
  }

  /** Lite rum, utan att transienterna blir grumliga. */
  function space(buf) {
    for (const [ms, g] of [[37, 0.2], [53, 0.15], [71, 0.11]]) {
      const d = (SR * ms / 1000) | 0;
      for (let i = d; i < buf.length; i++) buf[i] += buf[i - d] * g;
    }
  }
  function normalize(buf, musicEnd) {
    let mx = 0;
    for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > mx) mx = a; }
    const g = mx > 0 ? 0.89 / mx : 1;
    const fadeIn = (SR * 0.05) | 0, fadeOutStart = (musicEnd * SR) | 0;
    const fadeLen = buf.length - fadeOutStart;
    for (let i = 0; i < buf.length; i++) {
      let v = buf[i] * g;
      if (i < fadeIn) v *= i / fadeIn;
      if (i > fadeOutStart && fadeLen > 0) v *= Math.max(0, 1 - (i - fadeOutStart) / fadeLen);
      buf[i] = Math.tanh(v * 1.08) * 0.94;                 // mjuk begränsning
    }
  }

  /* ---------- den exakta strukturen ----------
     Samma form som MusicStructure.analyze returnerar, men uträknad ur
     arrangemanget i stället för uppmätt ur ljudet. Inga gissningar. */
  function describe(style, nPhrases, levels, beat, bar, duration) {
    const grid = [], downbeats = [], bars = [], phrases = [];
    const nBars = nPhrases * 4;
    for (let b = 0; b < nBars; b++) {
      const t0 = b * bar, lvl = levels[(b / 4) | 0];
      downbeats.push(U.round(t0, 3));
      bars.push({ t: U.round(t0, 3), index: b, energy: U.round(lvl / 4, 3) });
      for (let k = 0; k < 4; k++) grid.push(U.round(t0 + k * beat, 3));
    }
    for (let p = 0; p < nPhrases; p++) {
      phrases.push({
        t: U.round(p * bar * 4, 3), end: U.round((p + 1) * bar * 4, 3),
        index: p, energy: U.round(levels[p] / 4, 3),
      });
    }

    const sections = [];
    for (let p = 0; p < nPhrases; p++) {
      const lvl = levels[p];
      const last = sections[sections.length - 1];
      if (last && last.level === lvl) { last.end = U.round((p + 1) * bar * 4, 3); continue; }
      sections.push({
        t: U.round(p * bar * 4, 3), end: U.round((p + 1) * bar * 4, 3),
        level: lvl, kind: lvl <= 1 ? 'low' : lvl >= 4 ? 'high' : 'mid',
        energy: U.round(lvl / 4, 3), index: sections.length,
      });
    }
    const peak = sections.reduce((a, b) => b.level > a.level ? b : a, sections[0]);
    sections.forEach((s, i) => {
      s.type = i === 0 ? 'intro' : s === peak ? 'peak'
        : i === sections.length - 1 ? 'outro'
          : s.level > sections[i - 1].level ? 'buildup' : 'body';
    });

    // energikurva var 0,25 s, direkt ur nivåerna
    const step = 0.25, nE = Math.ceil(duration / step);
    const energyCurve = new Array(nE).fill(0);
    for (let i = 0; i < nE; i++) {
      const t = i * step, p = Math.floor(t / (bar * 4));
      energyCurve[i] = U.round(0.12 + 0.22 * (levels[U.clamp(p, 0, nPhrases - 1)] || 0), 3);
    }

    // klipppunkter: exakta, med styrka efter hur stor gränsen är
    const cutPoints = [];
    const push = (t, strength, kind) => {
      if (t < 0.2 || t > nBars * bar - 0.05) return;
      const ex = cutPoints.find(c => Math.abs(c.t - t) < 0.03);
      if (ex) { if (strength > ex.strength) { ex.strength = strength; ex.kind = kind; } return; }
      cutPoints.push({ t: U.round(t, 3), strength, kind });
    };
    for (const s of sections) push(s.t, 1.55, 'section');
    for (const p of phrases) push(p.t, 1.25, 'phrase');
    for (const d of downbeats) push(d, 1.0, 'downbeat');
    for (const d of downbeats) push(d + bar / 2, 0.6, 'halfbar');
    cutPoints.sort((a, b) => a.t - b.t);

    return {
      composed: true, styleId: style.id, styleName: style.name,
      duration: U.round(duration, 3), bpm: style.bpm, beatPeriod: U.round(beat, 4),
      beats: downbeats.flatMap(t => [0, 1, 2, 3].map(k => U.round(t + k * beat, 3))).filter(t => t < duration),
      grid, downbeats, bars, phrases, sections, accents: [], cutPoints,
      energyStep: step, energyCurve, barsPerPhrase: 4,
      barSeconds: U.round(bar, 3),
    };
  }

  /* ---------- WAV ---------- */
  function toWav(samples, sr) {
    const n = samples.length;
    const b = new ArrayBuffer(44 + n * 2), v = new DataView(b);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE');
    str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([b], { type: 'audio/wav' });
  }

  /** Komponerar och lägger in låten i mediabiblioteket som vilken låt som
   *  helst — men med den exakta strukturen fastnitad på mediaobjektet. */
  async function makeTrack(styleId, targetSeconds) {
    const out = compose(styleId, targetSeconds);
    const blob = toWav(out.samples, out.sampleRate);
    const name = `${out.style.name} · ${out.style.bpm} BPM · ${Math.round(out.duration)}s.wav`;
    const file = new File([blob], name, { type: 'audio/wav' });
    const media = await Media.ingestOne(file);
    media.composed = out.structure;
    media.bpm = out.style.bpm;                             // känd, inte uppskattad
    media.beats = out.structure.beats;
    media.generated = { styleId: out.style.id, targetSeconds };
    return media;
  }

  return { STYLES, styleById, compose, toWav, makeTrack, chordNotes, arrange };
})();
