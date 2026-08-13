/* ============================================================
   44 — Bildanalys

   Regissören måste veta vad varje bild faktiskt visar innan den kan
   bestämma ordning, längd och kamerarörelse. Här mäts bilden: ljus,
   färg, kanter, symmetri, djup, horisont, himmel och grönska. Utifrån
   måtten poängsätts rumstyp, hero-värde och risk för dubbletter.

   VAD SOM ÄR TILLFÖRLITLIGT: ute mot inne, detalj mot rum, hero-poäng,
   symmetri, djup och dubblettdetektering. Det är också det regissören
   främst bygger på.

   VAD SOM INTE ÄR DET: exakt rumstyp inomhus. Ett kök och ett sovrum skiljer
   sig inte tillräckligt i ljus, kant- och färgstatistik för att en handskriven
   heuristik ska klara det — mätt på testmaterialet träffar den ungefär hälften.
   Därför redovisas rumstypen som ett förslag med konfidens, den går att ändra
   i planen, och regissören klarar sig utan den. Rätt lösning är en
   vision-modell; den kopplas in där classify() nu sitter.
   ============================================================ */
const ImageAnalyze = (() => {
  const W = 256;

  function loadImage(url) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('Bilden kunde inte läsas'));
      im.src = url;
    });
  }

  async function analyze(asset) {
    if (!asset.url) throw new Error('Bilden är inte tillgänglig');
    const im = await loadImage(asset.url);
    const h = Math.max(8, Math.round(W * (im.naturalHeight / Math.max(1, im.naturalWidth)) / 2) * 2);
    const c = document.createElement('canvas'); c.width = W; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0, W, h);
    const d = g.getImageData(0, 0, W, h).data;
    const n = W * h;

    const lum = new Float32Array(n);
    let sr = 0, sg = 0, sb = 0, sl = 0, sky = 0, topSky = 0, green = 0, warm = 0, sat = 0, bright = 0, dark = 0;
    for (let i = 0, p = 0; i < n; i++, p += 4) {
      const r = d[p] / 255, gg = d[p + 1] / 255, b = d[p + 2] / 255;
      const l = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
      lum[i] = l;
      sr += r; sg += gg; sb += b; sl += l;
      const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
      const s = mx > 0.01 ? (mx - mn) / mx : 0;
      sat += s;
      if (l > 0.86) bright++;
      if (l < 0.10) dark++;
      const y = (i / W) | 0;
      // himmel: ljus, blådominant, i övre tredjedelen
      if (y < h / 3 && b > r + 0.045 && l > 0.55) sky++;
      // ...men ett fönster inomhus ser också ut så. Äkta himmel fyller den
      // allra översta remsan; ett fönster gör det nästan aldrig.
      if (y < h * 0.12 && b > r + 0.03 && l > 0.5) topSky++;
      // grönska: grön kanal dominerar tydligt
      if (gg > r + 0.035 && gg > b + 0.045) green++;
      // varma ytor (trä, kök)
      if (r > b + 0.06 && l > 0.25 && l < 0.85) warm++;
    }
    const meanL = sl / n;
    let varSum = 0;
    for (let i = 0; i < n; i++) { const dd = lum[i] - meanL; varSum += dd * dd; }

    /* --- kanter och linjeorientering --- */
    let edge = 0, vert = 0, horiz = 0, longV = 0, longH = 0;
    const rowH = new Float32Array(h), colV = new Float32Array(W);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        const gx = lum[i + 1] - lum[i - 1], gy = lum[i + W] - lum[i - W];
        const m = Math.hypot(gx, gy);
        edge += m;
        if (m > 0.08) {
          if (Math.abs(gx) > Math.abs(gy) * 2) { vert++; colV[x] += m; }
          else if (Math.abs(gy) > Math.abs(gx) * 2) { horiz++; rowH[y] += m; }
        }
      }
    }
    const px = (W - 2) * (h - 2);
    // långa sammanhängande linjer = arkitektur
    const colMax = Math.max(...colV), rowMax = Math.max(...rowH);
    for (let x = 0; x < W; x++) if (colV[x] > colMax * 0.45) longV++;
    for (let y = 0; y < h; y++) if (rowH[y] > rowMax * 0.45) longH++;

    /* --- horisont: raden med starkast horisontell kantenergi --- */
    let hy = 0, hyv = 0;
    for (let y = Math.floor(h * 0.15); y < h * 0.85; y++) if (rowH[y] > hyv) { hyv = rowH[y]; hy = y; }
    const horizonY = hy / h;

    /* --- symmetri: vänster halva mot speglad höger halva --- */
    let symErr = 0, symN = 0;
    const half = W >> 1;
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < half; x += 2) {
        symErr += Math.abs(lum[y * W + x] - lum[y * W + (W - 1 - x)]);
        symN++;
      }
    }
    const symmetry = U.clamp(1 - (symErr / Math.max(1, symN)) * 4.5, 0, 1);

    /* --- djup: konvergerar de nära-horisontella linjerna mot mitten? ---
       I ett rum med djup lutar tak- och golvlinjer mot en flyktpunkt. Vi mäter
       lutningen på nära-horisontella kanter i vänster respektive höger halva;
       motsatt tecken betyder konvergens, alltså djup. */
    let lSlope = 0, lN = 0, rSlope = 0, rN = 0;
    for (let y = 2; y < h - 2; y += 2) {
      for (let x = 2; x < W - 2; x += 2) {
        const i = y * W + x;
        const gx = lum[i + 1] - lum[i - 1], gy = lum[i + W] - lum[i - W];
        if (Math.abs(gy) > 0.05 && Math.abs(gy) > Math.abs(gx) * 1.8) {
          const slope = gx / gy;
          if (x < half) { lSlope += slope; lN++; } else { rSlope += slope; rN++; }
        }
      }
    }
    const conv = (lN > 10 && rN > 10) ? (lSlope / lN - rSlope / rN) : 0;
    const depthScore = U.clamp(Math.abs(conv) * 1.8, 0, 1);

    /* --- skärpa: laplace-energi (används för hero och detaljbedömning) --- */
    let lap = 0, lapPeriph = 0, lapCenter = 0, cN = 0, pN = 0;
    for (let y = 2; y < h - 2; y++) {
      for (let x = 2; x < W - 2; x++) {
        const i = y * W + x;
        const v = Math.abs(4 * lum[i] - lum[i - 1] - lum[i + 1] - lum[i - W] - lum[i + W]);
        lap += v;
        const cx = (x / W - 0.5), cy = (y / h - 0.5);
        if (Math.hypot(cx, cy) < 0.25) { lapCenter += v; cN++; } else { lapPeriph += v; pN++; }
      }
    }
    const sharp = lap / px;
    const centerBias = (cN && pN) ? (lapCenter / cN) / Math.max(1e-6, lapPeriph / pN) : 1;

    /* --- perceptuell signatur (8x8 average hash) för dubblettdetektering --- */
    const sig = [];
    let sigMean = 0;
    for (let by = 0; by < 8; by++) for (let bx = 0; bx < 8; bx++) {
      let s = 0, cnt = 0;
      for (let y = Math.floor(by * h / 8); y < (by + 1) * h / 8; y++)
        for (let x = Math.floor(bx * W / 8); x < (bx + 1) * W / 8; x++) { s += lum[y * W + x]; cnt++; }
      const v = s / Math.max(1, cnt); sig.push(v); sigMean += v;
    }
    sigMean /= 64;
    const signature = sig.map(v => v > sigMean ? 1 : 0);

    const f = {
      w: im.naturalWidth, h: im.naturalHeight, aspect: im.naturalWidth / im.naturalHeight,
      meanL: U.round(meanL, 4), contrast: U.round(Math.sqrt(varSum / n), 4),
      saturation: U.round(sat / n, 4),
      warmth: U.round((sr - sb) / n, 4),
      skyFrac: U.round(sky / n, 4), topSkyFrac: U.round(topSky / Math.max(1, W * Math.floor(h * 0.12)), 4),
      greenFrac: U.round(green / n, 4), warmFrac: U.round(warm / n, 4),
      brightFrac: U.round(bright / n, 4), darkFrac: U.round(dark / n, 4),
      edgeDensity: U.round(edge / px, 4), sharpness: U.round(sharp, 4),
      vertLines: U.round(vert / px, 4), horizLines: U.round(horiz / px, 4),
      longVertical: longV, longHorizontal: longH,
      horizonY: U.round(horizonY, 3), symmetry: U.round(symmetry, 3),
      depthScore: U.round(depthScore, 3), centerBias: U.round(centerBias, 3),
      signature,
    };
    const cls = classify(f);
    return {
      id: U.uid('ia'), assetId: asset.id, at: Date.now(),
      ...f, ...cls,
      heroScore: heroScore(f, cls),
    };
  }

  /** Heuristisk rumsklassificering. Varje regel är ett mätbart drag — inte en
   *  gissning ur tomma luften — men den är just en heuristik. */
  function classify(f) {
    const s = {};
    const add = (k, v) => s[k] = (s[k] || 0) + v;

    // normaliserade drag så trösklarna betyder samma sak i alla bilder
    const dense = U.clamp(f.edgeDensity / 0.08, 0, 2);          // kanttäthet
    const hBands = U.clamp(f.longHorizontal / 14, 0, 2);        // horisontella band (skåp, bänkar)
    const vBands = U.clamp(f.longVertical / 14, 0, 2);          // vertikala linjer (karmar, kakelfogar)
    const flat = U.clamp(1 - dense, 0, 1);                      // stora lugna ytor
    const cool = U.clamp((0.2 - f.saturation) / 0.2, 0, 1);     // avfärgat

    // himmel räknas bara om den fyller den översta remsan — annars är det ett fönster
    const realSky = f.topSkyFrac > 0.35 ? f.skyFrac : f.skyFrac * 0.15;
    const outdoor = realSky * 3.2 + f.greenFrac * 2.2;
    add('exterior', outdoor * 1.2);
    add('garden', f.greenFrac * 3.4 - realSky * 0.9);
    add('balcony', (f.topSkyFrac > 0.3 && realSky < 0.2 ? 0.7 : 0) + vBands * 0.25);
    add('drone', (realSky + f.greenFrac) * 1.5 + (f.horizonY < 0.35 ? 0.6 : 0) - vBands * 0.5);

    const indoor = 1 - U.clamp(outdoor, 0, 1);
    // detalj: motivet sitter i mitten, ingen rumsgeometri, få långa linjer
    const detail = (f.centerBias > 1.5 ? 1.0 : 0) + (1 - f.depthScore) * 0.35
      - vBands * 0.6 - hBands * 0.6;
    add('detail', detail);
    // kök: horisontella band över OCH under mitten, ofta varma luckor
    add('kitchen', indoor * (hBands * 1.3 + f.warmFrac * 1.2 - flat * 0.5));
    // badrum: avfärgat, ljust och tätt rutmönster i både led
    add('bathroom', indoor * (cool * 1.1 + (f.meanL > 0.55 ? 0.6 : 0) + Math.min(hBands, vBands) * 0.9 - f.warmFrac * 1.2));
    // sovrum: stora lugna ytor, låg kanttäthet, låg mättnad, få band
    add('bedroom', indoor * (flat * 1.3 + cool * 0.4 - hBands * 0.8 - vBands * 0.4));
    // vardagsrum: djup, blandad struktur, varken extremt platt eller extremt tätt
    add('livingroom', indoor * (0.45 + f.depthScore * 1.0 + (dense > 0.4 && dense < 1.3 ? 0.4 : 0)));
    // matplats: ett horisontellt möbelblock mitt i bilden med djup runt
    add('diningroom', indoor * (hBands * 0.5 + f.depthScore * 0.5 + (f.centerBias > 1.2 && f.centerBias < 1.5 ? 0.4 : 0)));
    add('entry', indoor * (vBands * 0.7 + (f.meanL < 0.4 ? 0.5 : 0) - f.depthScore * 0.4));
    add('other', 0.3);

    const ranked = Object.entries(s).sort((a, b) => b[1] - a[1]);
    const total = ranked.reduce((a, r) => a + Math.max(0, r[1]), 0) || 1;
    const roomGuess = ranked.slice(0, 3).map(([id, v]) => ({ id, p: U.round(Math.max(0, v) / total, 3) }));
    const top = roomGuess[0];
    // marginalen till tvåan säger mer om säkerheten än den normaliserade andelen
    const margin = roomGuess.length > 1 ? top.p - roomGuess[1].p : top.p;
    return {
      roomType: top.id, roomConfidence: U.round(U.clamp(margin * 3.5, 0, 1), 2), roomGuess,
      roomUncertain: margin < 0.12,
      isExterior: outdoor > 0.35, isDrone: top.id === 'drone',
      isDetail: top.id === 'detail',
    };
  }

  /** Hur stark är bilden som blickfång? Skärpa, kontrast, komposition, djup. */
  function heroScore(f, cls) {
    let v = 0;
    v += U.clamp(f.sharpness * 9, 0, 1) * 0.28;
    v += U.clamp(f.contrast * 3.4, 0, 1) * 0.20;
    v += f.symmetry * 0.16;
    v += f.depthScore * 0.18;
    v += U.clamp(1 - Math.abs(f.meanL - 0.5) * 2.6, 0, 1) * 0.12;
    if (cls.isExterior) v += 0.10;
    if (cls.isDetail) v -= 0.16;
    if (f.darkFrac > 0.25) v -= 0.12;
    if (f.brightFrac > 0.18) v -= 0.08;
    return U.round(U.clamp(v, 0, 1), 3);
  }

  /** Hammingavstånd mellan signaturer: 0 = identiska, 64 = motsatta. */
  function similarity(a, b) {
    if (!a || !b || !a.signature || !b.signature) return 0;
    let same = 0;
    for (let i = 0; i < 64; i++) if (a.signature[i] === b.signature[i]) same++;
    return U.round(same / 64, 3);
  }

  /** Analyserar en lista bilder med progress och andningspauser. */
  async function analyzeAll(assets, onProgress) {
    const out = new Map();
    for (let i = 0; i < assets.length; i++) {
      onProgress && onProgress(i / assets.length, assets[i].name);
      try { out.set(assets[i].id, await analyze(assets[i])); }
      catch (e) { console.warn('bildanalys misslyckades', assets[i].name, e); }
      await U.raf();
    }
    onProgress && onProgress(1, '');
    return out;
  }

  return { analyze, analyzeAll, similarity, classify, heroScore };
})();
