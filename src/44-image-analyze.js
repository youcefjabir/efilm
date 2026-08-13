/* ============================================================
   44 — Bildanalys

   Regissören måste veta vad varje bild faktiskt visar innan den kan
   bestämma ordning, längd och kamerarörelse. Här mäts bilden: ljus,
   färg, kanter, symmetri, djup, horisont, himmel och grönska. Utifrån
   måtten poängsätts rumstyp, hero-värde och risk för dubbletter.

   VAD SOM ÄR TILLFÖRLITLIGT: ute mot inne, detalj mot rum, hero-poäng,
   symmetri, djup, dubblettdetektering — och vilka bilder som visar SAMMA rum.

   VAD SOM INTE ÄR DET: vad rummet HETER. Ett kök och ett sovrum skiljer sig
   inte tillräckligt i ljus-, kant- och färgstatistik för att en handskriven
   heuristik ska sätta rätt namn; den gissade tidigare ändå, och kunde kalla
   samma rum "entré" i en bild och "kök" i nästa.

   Därför gissas inget namn längre. Bilderna grupperas i stället efter
   färgvärld — se sameRoomScore och clusterRooms — vilket är en fråga som
   pixlarna FAKTISKT kan svara på, och som är den regissören behöver:
   rundturen ska ta ett rum i taget. Namnet sätter användaren, en gång per
   rum. Vill man ha automatiska namn krävs en vision-modell; den kopplas in
   där classify() nu sitter, utan att något annat behöver ändras.
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

    /* --- ljusbalans vänster/höger ---
       Ger kamerarörelsen en riktning som motiveras av bilden i stället för
       av slumpen: en slide åt det ljusare hållet avslöjar fönstret, vilket
       är den rörelse en riktig fotograf väljer. */
    let lumL = 0, lumR = 0, lumN = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < (W >> 2); x++) { lumL += lum[y * W + x]; lumR += lum[y * W + (W - 1 - x)]; lumN++; }
    }
    const lumBalance = lumN ? (lumR - lumL) / lumN : 0;

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

    /* --- färg- och layoutsignatur: 4x4 rutor med medelfärg ---
       Det här är nyckeln till att känna igen SAMMA RUM från en annan vinkel.
       Väggfärg, golvton och ljusfördelning ändras knappt när man flyttar
       kameran några meter — men de skiljer sig tydligt mellan olika rum. */
    const colorSig = [];
    for (let by = 0; by < 4; by++) for (let bx = 0; bx < 4; bx++) {
      let r = 0, gg = 0, b = 0, cnt = 0;
      const y0 = Math.floor(by * h / 4), y1 = Math.floor((by + 1) * h / 4);
      const x0 = Math.floor(bx * W / 4), x1 = Math.floor((bx + 1) * W / 4);
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const q = (y * W + x) * 4;
        r += d[q]; gg += d[q + 1]; b += d[q + 2]; cnt++;
      }
      colorSig.push(U.round(r / cnt / 255, 3), U.round(gg / cnt / 255, 3), U.round(b / cnt / 255, 3));
    }

    /* --- färghistogram: rummets färgvärld oberoende av var sakerna står ---
       Det spatiala rutnätet ovan ändras när kameran flyttas. Ett histogram
       gör det inte: väggfärg, golvton och materialpalett är desamma oavsett
       vinkel, men skiljer sig mellan ett kaklat badrum och ett kök i trä.
       chroma-histogrammet räknar bort ljusstyrkan, så samma rum känns igen
       även när man fotograferar mot respektive från fönstret. */
    const hist = new Float32Array(64), chroma = new Float32Array(36);
    for (let i = 0, p = 0; i < n; i++, p += 4) {
      const r = d[p], gg = d[p + 1], b = d[p + 2];
      hist[((r >> 6) << 4) + ((gg >> 6) << 2) + (b >> 6)]++;
      const s = r + gg + b || 1;
      const cr = Math.min(5, (r / s * 9) | 0), cg = Math.min(5, (gg / s * 9) | 0);
      chroma[cr * 6 + cg]++;
    }
    for (let i = 0; i < hist.length; i++) hist[i] /= n;
    for (let i = 0; i < chroma.length; i++) chroma[i] /= n;

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
      lumBalance: U.round(lumBalance, 4),
      depthScore: U.round(depthScore, 3), centerBias: U.round(centerBias, 3),
      signature, colorSig,
      hist: Array.from(hist, v => U.round(v, 5)), chroma: Array.from(chroma, v => U.round(v, 5)),
    };
    const cls = classify(f);
    return {
      id: U.uid('ia'), assetId: asset.id, at: Date.now(),
      ...f, ...cls,
      heroScore: heroScore(f, cls),
    };
  }

  /** Vad som faktiskt går att avgöra ur pixlarna med rimlig säkerhet:
   *  ute eller inne, och om det är en närbild eller ett helt rum.
   *
   *  Vad som INTE går: att sätta rätt namn på ett rum. Ett kök och ett
   *  vardagsrum skiljer sig inte tillräckligt i ljus-, kant- och färgstatistik.
   *  Tidigare gissades namnet ändå, vilket gjorde att samma rum fotograferat
   *  från två håll kunde bli "entré" i ena bilden och "kök" i den andra.
   *  Nu gissas inget namn — bilderna grupperas i stället efter hur lika de är,
   *  så att samma rum hamnar ihop oavsett vad rummet heter. */
  function classify(f) {
    // himmel räknas bara om den fyller den översta remsan — annars är det ett fönster
    const realSky = f.topSkyFrac > 0.35 ? f.skyFrac : f.skyFrac * 0.15;
    const outdoor = realSky * 3.2 + f.greenFrac * 2.2;
    const isExterior = outdoor > 0.35;
    /* Drönare: marken fyller bilden, horisonten ligger högt och det finns
       nästan inga stående linjer — uppifrån ser man tak, inte fasader. Bara
       hög horisont räcker inte: en fasadbild med taknock högt upp får också
       det. Marktäckningen är det som skiljer. Gissningen är ändå just en
       gissning, och användaren kan flytta bilden till Exteriör i planen. */
    const vBands = U.clamp(f.longVertical / 14, 0, 2);
    const isDrone = isExterior && f.greenFrac > 0.5 && vBands < 0.5 && f.horizonY < 0.35;
    /* Närbild: motivet sitter i mitten och periferin är tom. Tröskeln ligger
       högt med flit — ett rum med ett starkt centralmotiv ska inte bli
       "detalj" och därmed berövas alla rörelser utom push. */
    const isDetail = !isExterior && f.centerBias > 2.2 && f.depthScore < 0.3
      && vBands < 0.6 && U.clamp(f.longHorizontal / 14, 0, 2) < 0.6;
    const scene = isDrone ? 'drone' : isExterior ? 'exterior' : isDetail ? 'detail' : 'interior';
    return {
      scene, isExterior, isDrone, isDetail,
      roomType: scene,            // fylls med klusternamn av regissören
      roomLabel: null, clusterId: null,
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

  /** Strukturlikhet (average hash): fångar samma bildutsnitt. */
  function similarity(a, b) {
    if (!a || !b || !a.signature || !b.signature) return 0;
    let same = 0;
    for (let i = 0; i < 64; i++) if (a.signature[i] === b.signature[i]) same++;
    return U.round(same / 64, 3);
  }

  /** Histogramsnitt: hur stor andel av färgerna är gemensam? */
  function intersect(a, b) {
    if (!a || !b) return 0;
    let s = 0;
    for (let i = 0; i < a.length; i++) s += Math.min(a[i], b[i]);
    return s;
  }

  /** Rumslikhet: hur troligt är det att två bilder visar SAMMA rum?
   *
   *  Färgvärlden bär informationen. Ett rum behåller sin palett när kameran
   *  flyttas — möblerna hamnar någon annanstans i bilden, men väggfärgen,
   *  golvtonen och materialen är kvar. Därför väger histogrammen tyngst och
   *  det spatiala rutnätet nästan ingenting: det senare säger mer om
   *  bildutsnittet än om rummet. */
  function sameRoomScore(a, b) {
    if (!a || !b) return 0;
    const histMatch = intersect(a.hist, b.hist);          // hela paletten
    const chromaMatch = intersect(a.chroma, b.chroma);    // paletten utan ljusstyrka
    const toneMatch = U.clamp(1 - Math.abs(a.meanL - b.meanL) * 3.0, 0, 1);
    const warmMatch = U.clamp(1 - Math.abs(a.warmth - b.warmth) * 6, 0, 1);
    const textureMatch = U.clamp(1 - Math.abs(a.edgeDensity - b.edgeDensity) * 10, 0, 1);
    let dc = 0;
    if (a.colorSig && b.colorSig) {
      for (let i = 0; i < a.colorSig.length; i++) dc += Math.abs(a.colorSig[i] - b.colorSig[i]);
      dc /= a.colorSig.length;
    }
    const layoutMatch = U.clamp(1 - dc * 4.5, 0, 1);
    return U.round(histMatch * 0.34 + chromaMatch * 0.30 + toneMatch * 0.14
      + warmMatch * 0.09 + textureMatch * 0.08 + layoutMatch * 0.05, 3);
  }

  /** Grupperar bilder i rum utan att gissa vad rummen heter.
   *
   *  Agglomerativ klustring med average linkage. Var gränsen går kan inte
   *  vara en enda fast siffra: hur lika två bilder av samma rum är beror på
   *  bostaden, kameran och ljuset. Därför slås grupperna ihop hela vägen ner
   *  till en, och sammanslagningarna accepteras så länge de håller sig i
   *  samma kvalitetsband som de föregående — när poängen faller av en klippa
   *  har vi lämnat rummet. FLOOR är skyddsräcket: under det är det aldrig
   *  samma rum, hur likt materialet i övrigt än är. */
  const FLOOR = 0.75, BAND = 0.08;
  function clusterRooms(analyses) {
    const items = analyses.filter(a => !a.isExterior);
    let groups = items.map(a => [a]);
    const score = (g1, g2) => {
      let s = 0, n = 0;
      for (const a of g1) for (const b of g2) { s += sameRoomScore(a, b); n++; }
      return n ? s / n : 0;
    };
    const merges = [];
    while (groups.length > 1) {
      let best = -1, bi = 0, bj = 0;
      for (let i = 0; i < groups.length; i++)
        for (let j = i + 1; j < groups.length; j++) {
          const v = score(groups[i], groups[j]);
          if (v > best) { best = v; bi = i; bj = j; }
        }
      merges.push({ score: best, i: bi, j: bj });
      groups[bi] = groups[bi].concat(groups[bj]);
      groups.splice(bj, 1);
    }

    // hur många av sammanslagningarna behåller vi?
    let keep = 0, weakest = 1;
    for (const m of merges) {
      if (m.score < FLOOR || m.score < weakest - BAND) break;
      weakest = Math.min(weakest, m.score);
      keep++;
    }

    // bygg om klustringen med bara de sammanslagningar vi behöll
    groups = items.map(a => [a]);
    for (let k = 0; k < keep; k++) {
      const m = merges[k];
      groups[m.i] = groups[m.i].concat(groups[m.j]);
      groups.splice(m.j, 1);
    }
    // störst och ljusast först — troligen sällskapsytorna
    groups.sort((a, b) => (b.length - a.length) || (avg(b, 'meanL') - avg(a, 'meanL')));
    groups.forEach((g, i) => g.forEach(a => {
      a.clusterId = 'room' + (i + 1);
      a.roomLabel = g.length > 1 ? `Rum ${i + 1}` : (a.isDetail ? 'Detalj' : `Rum ${i + 1}`);
      a.roomType = a.isDetail ? 'detail' : a.clusterId;
      a.clusterSize = g.length;
    }));
    for (const a of analyses) if (a.isExterior) {
      a.clusterId = a.isDrone ? 'drone' : 'exterior';
      a.roomLabel = a.isDrone ? 'Drönare' : 'Exteriör';
      a.roomType = a.clusterId;
    }
    return groups;
  }
  const avg = (g, k) => g.reduce((s, a) => s + a[k], 0) / Math.max(1, g.length);

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

  return { analyze, analyzeAll, similarity, sameRoomScore, clusterRooms, classify, heroScore };
})();
