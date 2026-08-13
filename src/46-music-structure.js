/* ============================================================
   46 — Musikstruktur

   Media.analyzeAudio ger transienter och BPM. Här byggs strukturen ovanpå:
   taktrutnät, downbeats, takter, fraser, sektioner, energikurva och — det
   som faktiskt används — en lista kandidater till klipppunkter med styrka
   och typ.

   Att filmen INTE ska klippa på varje beat är själva poängen. Analysen
   levererar möjligheterna; regissören väljer vilka som blir klipp.
   ============================================================ */
const MusicStructure = (() => {

  function analyze(media) {
    if (!media || media.type !== 'audio') throw new Error('Ingen musikfil vald');
    const dur = media.duration || 0;
    const beats = (media.beats || []).slice();
    const peaks = media.wave || [];
    let bpm = media.bpm || null;

    /* --- energikurva ur waveformen, ett värde per 0,25 s --- */
    const step = 0.25;
    const nE = Math.max(4, Math.ceil(dur / step));
    const energy = new Float32Array(nE);
    if (peaks.length) {
      for (let i = 0; i < nE; i++) {
        const t0 = i * step, t1 = t0 + step;
        const a = Math.floor(t0 / dur * peaks.length), b = Math.max(a + 1, Math.floor(t1 / dur * peaks.length));
        let s = 0, c = 0;
        for (let j = a; j < Math.min(peaks.length, b); j++) { s += peaks[j]; c++; }
        energy[i] = c ? s / c / 255 : 0;
      }
    }
    const smoothE = smooth(energy, 6);

    /* --- taktrutnät: regelbundet, förankrat i de starkaste transienterna --- */
    let period = null;
    if (beats.length > 4) {
      const d = [];
      for (let i = 1; i < beats.length; i++) d.push(beats[i] - beats[i - 1]);
      d.sort((a, b) => a - b);
      period = d[d.length >> 1];
      // vik in i ett rimligt tempospann (60–180 BPM)
      while (period > 1.0) period /= 2;
      while (period < 0.333) period *= 2;
      bpm = Math.round(60 / period);
    }
    if (!period && bpm) period = 60 / bpm;
    if (!period) { period = 0.5; bpm = 120; }

    // fasa in rutnätet så att så många detekterade transienter som möjligt hamnar på nätet
    let phase = 0, bestHit = -1;
    for (let k = 0; k < 24; k++) {
      const ph = (k / 24) * period;
      let hit = 0;
      for (const b of beats) {
        const r = ((b - ph) % period + period) % period;
        if (Math.min(r, period - r) < period * 0.12) hit++;
      }
      if (hit > bestHit) { bestHit = hit; phase = ph; }
    }
    const grid = [];
    for (let t = phase; t < dur; t += period) grid.push(U.round(t, 3));

    /* --- downbeats: välj den fas i 4/4 som samlar mest anslagsenergi --- */
    const at = t => smoothE[U.clamp(Math.round(t / step), 0, nE - 1)] || 0;
    let barPhase = 0, bestBar = -1;
    for (let ph = 0; ph < 4; ph++) {
      let s = 0;
      for (let i = ph; i < grid.length; i += 4) s += at(grid[i]);
      if (s > bestBar) { bestBar = s; barPhase = ph; }
    }
    const downbeats = [], bars = [];
    for (let i = barPhase; i < grid.length; i += 4) {
      downbeats.push(grid[i]);
      bars.push({ t: grid[i], index: bars.length, energy: U.round(at(grid[i]), 3) });
    }

    /* --- fraser: 4 takter i normalfallet, 8 vid högt tempo --- */
    const barsPerPhrase = bpm > 128 ? 8 : 4;
    const phrases = [];
    for (let i = 0; i < bars.length; i += barsPerPhrase) {
      const t0 = bars[i].t;
      const t1 = bars[Math.min(bars.length - 1, i + barsPerPhrase)] ? bars[Math.min(bars.length - 1, i + barsPerPhrase)].t : dur;
      let e = 0, c = 0;
      for (let t = t0; t < t1; t += step) { e += at(t); c++; }
      phrases.push({ t: t0, end: U.round(t1, 3), index: phrases.length, energy: U.round(c ? e / c : 0, 3) });
    }

    /* --- sektioner: ihållande energiskiften mellan fraser --- */
    // trösklarna sätts av låtens egen energifördelning, inte absoluta nivåer
    const es = phrases.map(p => p.energy).sort((a, b) => a - b);
    const q = f => es.length ? es[U.clamp(Math.floor(f * (es.length - 1)), 0, es.length - 1)] : 0;
    const lo = q(0.33), hi = q(0.67), spread = Math.max(0.02, q(1) - q(0));
    const sections = [];
    let cur = null;
    for (const p of phrases) {
      const kind = spread < 0.05 ? 'mid'
        : p.energy <= lo ? 'low' : p.energy >= hi ? 'high' : 'mid';
      if (!cur || cur.kind !== kind) {
        if (cur) cur.end = p.t;
        cur = { t: p.t, kind, energy: p.energy, index: sections.length };
        sections.push(cur);
      } else {
        cur.energy = U.round((cur.energy + p.energy) / 2, 3);
      }
    }
    if (cur) cur.end = U.round(dur, 3);
    if (sections.length) {
      sections[0].type = 'intro';
      const peak = sections.reduce((a, b) => b.energy > a.energy ? b : a, sections[0]);
      peak.type = peak.type || 'peak';
      sections[sections.length - 1].type = sections[sections.length - 1].type || 'outro';
      sections.forEach(s => s.type = s.type || (s.kind === 'high' ? 'buildup' : 'body'));
    }

    /* --- accenter: transienter som sticker ut mot lokal bakgrund --- */
    const accents = [];
    for (const b of beats) {
      const e = at(b), before = at(b - 0.6), after = at(b + 0.3);
      if (e > before * 1.55 && e > 0.22) accents.push({ t: U.round(b, 3), strength: U.round(U.clamp(e / Math.max(0.05, before) / 3, 0, 1), 3) });
    }

    /* --- klipppunkter: alla musikaliskt rimliga ställen att klippa på --- */
    const cutPoints = [];
    const push = (t, strength, kind) => {
      if (t < 0.2 || t > dur - 0.4) return;
      const ex = cutPoints.find(c => Math.abs(c.t - t) < 0.06);
      if (ex) { if (strength > ex.strength) { ex.strength = strength; ex.kind = kind; } return; }
      cutPoints.push({ t: U.round(t, 3), strength, kind });
    };
    for (const s of sections) push(s.t, 1.55, 'section');
    for (const p of phrases) push(p.t, 1.25, 'phrase');
    for (const b of downbeats) push(b, 1.0, 'downbeat');
    // halvtakt ger regissören kortare alternativ utan att bli hackigt
    for (let i = 0; i < downbeats.length - 1; i++) push((downbeats[i] + downbeats[i + 1]) / 2, 0.6, 'halfbar');
    for (const a of accents) push(a.t, 0.85 + a.strength * 0.4, 'accent');
    cutPoints.sort((a, b) => a.t - b.t);

    return {
      id: U.uid('ma'), assetId: media.id, at: Date.now(),
      duration: U.round(dur, 3), bpm, beatPeriod: U.round(period, 4),
      beats: beats.map(b => U.round(b, 3)),
      grid, downbeats, bars, phrases, sections, accents, cutPoints,
      energyStep: step, energyCurve: Array.from(smoothE, v => U.round(v, 3)),
      barsPerPhrase,
    };
  }

  function smooth(a, w) {
    const n = a.length, out = new Float32Array(n), r = Math.max(1, w >> 1);
    for (let i = 0; i < n; i++) {
      let s = 0, c = 0;
      for (let j = Math.max(0, i - r); j <= Math.min(n - 1, i + r); j++) { s += a[j]; c++; }
      out[i] = s / c;
    }
    return out;
  }

  /** Energi vid en godtycklig tid — används av regissören. */
  const energyAt = (ma, t) => ma.energyCurve[U.clamp(Math.round(t / ma.energyStep), 0, ma.energyCurve.length - 1)] || 0;

  /** Vilken sektion är vi i? */
  const sectionAt = (ma, t) => ma.sections.find(s => t >= s.t && t < s.end) || ma.sections[ma.sections.length - 1] || null;

  /** Närmaste klipppunkt till en önskad tid, med minsta styrka. */
  function nearestCut(ma, t, minStrength = 0) {
    let best = null, bd = 1e9;
    for (const c of ma.cutPoints) {
      if (c.strength < minStrength) continue;
      const d = Math.abs(c.t - t);
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  }

  return { analyze, energyAt, sectionAt, nearestCut };
})();
