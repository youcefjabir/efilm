/* ============================================================
   60 — Färg: presets, bildanalys, Auto Enhance, Match Clips
   ============================================================ */
const Color = (() => {

  /** Effektiv grade = manuella värden + preset × intensitet. */
  function effective(clip) {
    const g = { ...M.emptyGrade(), ...(clip.grade || {}) };
    const f = M.filterById(clip.filter || 'none');
    const k = (clip.filterIntensity == null ? 100 : clip.filterIntensity) / 100;
    for (const key in f.g) g[key] = (g[key] || 0) + f.g[key] * k;
    for (const [key, , min, max] of M.GRADE_DEFS) g[key] = U.clamp(g[key] || 0, min, max);
    return g;
  }
  const isNeutral = g => M.GRADE_DEFS.every(d => Math.abs(g[d[0]] - d[5]) < 1e-4);

  /* ---------- bildstatistik från en riktig bildruta ---------- */
  const statCache = new Map();
  async function frameStats(media, t) {
    const key = media.id + '@' + U.round(t, 2);
    if (statCache.has(key)) return statCache.get(key);
    if (!media.url) throw new Error('Mediefilen är inte tillgänglig — importera om den.');
    const v = await Media.loadVideoEl(media.url);
    await Media.seekTo(v, U.clamp(t, 0, Math.max(0, (media.duration || 1) - .05)));
    const w = 192, h = Math.max(2, Math.round(w * (v.videoHeight / Math.max(1, v.videoWidth))));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(v, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data;
    try { v.src = ''; v.load(); } catch (e) { }

    let sr = 0, sg = 0, sb = 0, sl = 0, n = w * h, clipped = 0, crushed = 0, midR = 0, midG = 0, midB = 0, midN = 0;
    const hist = new Uint32Array(64);
    const lum = new Float32Array(n);
    for (let i = 0, p = 0; i < n; i++, p += 4) {
      const r = d[p] / 255, gg = d[p + 1] / 255, b = d[p + 2] / 255;
      const l = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
      lum[i] = l;
      sr += r; sg += gg; sb += b; sl += l;
      hist[Math.min(63, (l * 64) | 0)]++;
      if (l > 0.965) clipped++;
      if (l < 0.02) crushed++;
      if (l > 0.22 && l < 0.78) { midR += r; midG += gg; midB += b; midN++; }
    }
    let varSum = 0; const meanL = sl / n;
    for (let i = 0; i < n; i++) { const dd = lum[i] - meanL; varSum += dd * dd; }
    // detaljnivå + brus: hög- resp. mycket högfrekvent energi
    let hf = 0, hf2 = 0;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = lum[i + 1] - lum[i - 1], gy = lum[i + w] - lum[i - w];
      const m = Math.hypot(gx, gy);
      hf += m;
      const lap = Math.abs(4 * lum[i] - lum[i - 1] - lum[i + 1] - lum[i - w] - lum[i + w]);
      if (m < 0.06) hf2 += lap;                 // laplace i platta ytor ≈ brus
    }
    const px = (w - 2) * (h - 2);

    // konvergerande vertikaler (keystone): lutning på nära-vertikala kanter, vänster vs höger
    let lSlope = 0, lN = 0, rSlope = 0, rN = 0;
    for (let y = 2; y < h - 2; y += 2) for (let x = 2; x < w - 2; x += 2) {
      const i = y * w + x;
      const gx = lum[i + 1] - lum[i - 1], gy = lum[i + w] - lum[i - w];
      if (Math.abs(gx) > 0.05 && Math.abs(gx) > Math.abs(gy) * 2.2) {   // nära vertikal linje
        const slope = gy / gx;                                          // lutning
        if (x < w / 2) { lSlope += slope; lN++; } else { rSlope += slope; rN++; }
      }
    }
    const keystone = (lN > 12 && rN > 12) ? (lSlope / lN - rSlope / rN) : 0;

    // fönster: ljusa sammanhängande ytor omgivna av mörkare
    let windowish = 0;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (lum[i] > 0.88) {
        const around = (lum[i - 1] + lum[i + 1] + lum[i - w] + lum[i + w]) / 4;
        if (around < 0.8) windowish++;
      }
    }
    const st = {
      meanL, meanR: sr / n, meanG: sg / n, meanB: sb / n,
      midR: midN ? midR / midN : .5, midG: midN ? midG / midN : .5, midB: midN ? midB / midN : .5,
      contrast: Math.sqrt(varSum / n),
      clipped: clipped / n, crushed: crushed / n,
      detail: hf / px, noise: hf2 / px,
      keystone, windowRatio: windowish / n,
      hist: Array.from(hist),
    };
    statCache.set(key, st);
    return st;
  }

  /* ---------- Auto Enhance for Real Estate ---------- */
  async function autoEnhance(clip, media, prevClipStats) {
    const t = clip.in + Math.min(1.0, (clip.out - clip.in) * .35);
    const s = await frameStats(media, t);
    const sug = [];
    const push = (key, value, why) => {
      const def = M.GRADE_DEFS.find(d => d[0] === key);
      const v = U.clamp(value, def[2], def[3]);
      if (Math.abs(v) < (key === 'exposure' ? 0.02 : 1.5)) return;
      sug.push({ key, label: def[1], value: U.round(v, key === 'exposure' ? 2 : 0), why });
    };
    // exponering mot 0,50 i medelluminans — försiktigt, max ±0,45 EV
    const target = 0.50;
    const ev = U.clamp(Math.log2(target / Math.max(0.03, s.meanL)), -0.45, 0.45);
    push('exposure', ev, `Medelluminans ${(s.meanL * 100).toFixed(0)} % → mål ${(target * 100) | 0} %`);
    // vitbalans via mellantonerna (grå värld på väggar)
    const avg = (s.midR + s.midG + s.midB) / 3;
    const rb = (s.midR - s.midB) / Math.max(0.05, avg);
    const gm = (s.midG - (s.midR + s.midB) / 2) / Math.max(0.05, avg);
    push('temperature', U.clamp(-rb * 55, -22, 22), rb > 0 ? 'Bilden drar mot varmt/orange' : 'Bilden drar mot kallt/blått');
    push('tint', U.clamp(gm * 55, -18, 18), gm > 0 ? 'Grönt stick i mellantonerna' : 'Magenta stick i mellantonerna');
    // högdagrar och fönster
    if (s.clipped > 0.012) push('highlightRecovery', U.clamp(s.clipped * 900, 0, 55), `${(s.clipped * 100).toFixed(1)} % utbrända pixlar`);
    if (s.windowRatio > 0.008) push('windowProtect', U.clamp(s.windowRatio * 1600, 0, 60), 'Ljusa fönsterytor upptäckta');
    if (s.crushed > 0.02) push('shadowRecovery', U.clamp(s.crushed * 700, 0, 45), `${(s.crushed * 100).toFixed(1)} % helsvarta pixlar`);
    // kontrast
    if (s.contrast < 0.16) push('contrast', U.clamp((0.19 - s.contrast) * 240, 0, 18), 'Låg kontrast — bilden ser platt ut');
    // brus & skärpa
    if (s.noise > 0.012) push('denoise', U.clamp((s.noise - 0.008) * 2200, 0, 45), 'Brus i jämna ytor');
    if (s.detail < 0.055) push('sharpen', U.clamp((0.07 - s.detail) * 700, 0, 35), 'Mjuk bild — tål lite skärpa');
    // vertikaler
    if (Math.abs(s.keystone) > 0.05) push('verticalCorrection', U.clamp(-s.keystone * 40, -18, 18), 'Vertikaler konvergerar (kameran lutar)');
    const match = [];
    if (prevClipStats) {
      const dEv = U.clamp(Math.log2(Math.max(0.03, prevClipStats.meanL) / Math.max(0.03, s.meanL)), -0.4, 0.4);
      if (Math.abs(dEv) > 0.05) match.push({ key: 'exposure', label: 'Exposure (matcha föregående klipp)', value: U.round(dEv, 2), why: 'Föregående klipp är ljusare/mörkare' });
      const dT = U.clamp(-((s.midR - s.midB) - (prevClipStats.midR - prevClipStats.midB)) * 130, -20, 20);
      if (Math.abs(dT) > 2) match.push({ key: 'temperature', label: 'Temperature (matcha föregående klipp)', value: Math.round(dT), why: 'Vitbalansen skiljer sig från föregående klipp' });
    }
    return { stats: s, suggestions: sug, match };
  }

  /* ---------- Match Clips ---------- */
  async function collectStats(project, clips, onProgress) {
    const out = new Map();
    for (let i = 0; i < clips.length; i++) {
      const c = clips[i], m = M.mediaById(project, c.mediaId);
      if (!m || !m.url) continue;
      onProgress && onProgress(i / clips.length, m.name);
      try { out.set(c.id, await frameStats(m, c.in + (c.out - c.in) * .4)); } catch (e) { }
    }
    onProgress && onProgress(1, '');
    return out;
  }
  function deviation(stats, ref) {
    if (!stats || !ref) return 0;
    const dl = Math.abs(stats.meanL - ref.meanL) / Math.max(.05, ref.meanL);
    const dwb = Math.abs((stats.midR - stats.midB) - (ref.midR - ref.midB)) * 3;
    const dc = Math.abs(stats.contrast - ref.contrast) / Math.max(.05, ref.contrast);
    return U.clamp(dl * .9 + dwb * 1.5 + dc * .5, 0, 2);
  }
  function matchDelta(stats, ref, opts) {
    const d = {};
    if (opts.exposure) d.exposure = U.round(U.clamp(Math.log2(Math.max(.03, ref.meanL) / Math.max(.03, stats.meanL)), -.7, .7), 2);
    if (opts.wb) {
      d.temperature = Math.round(U.clamp(-((stats.midR - stats.midB) - (ref.midR - ref.midB)) * 140, -35, 35));
      d.tint = Math.round(U.clamp(((stats.midG - (stats.midR + stats.midB) / 2) - (ref.midG - (ref.midR + ref.midB) / 2)) * -140, -30, 30));
    }
    if (opts.contrast) d.contrast = Math.round(U.clamp((ref.contrast - stats.contrast) * 260, -40, 40));
    if (opts.tone) {
      d.saturation = Math.round(U.clamp(((ref.midR + ref.midG + ref.midB) - (stats.midR + stats.midG + stats.midB)) * 30, -25, 25));
    }
    return d;
  }
  const clearStatCache = () => statCache.clear();

  return { effective, isNeutral, frameStats, autoEnhance, collectStats, deviation, matchDelta, clearStatCache };
})();
