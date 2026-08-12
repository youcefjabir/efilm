/* ============================================================
   55 — Stabilisering: bearbetning (banutjämning + cropkompensation)

   Analysen ger den råa kamerabanan. Här beräknas den korrigerande
   transformen per bildruta: banan jämnas ut, skillnaden mot den råa
   banan blir korrigeringen, och nödvändig zoom räknas ut så att inga
   tomma kanter syns.
   ============================================================ */
const StabProcess = (() => {

  function gauss(a, sigma) {
    const n = a.length;
    if (!(sigma > 0.4) || n < 3) return Float32Array.from(a);
    const r = Math.max(1, Math.min(Math.ceil(sigma * 3), n));
    const k = new Float32Array(2 * r + 1);
    let sum = 0;
    for (let i = -r; i <= r; i++) { const v = Math.exp(-(i * i) / (2 * sigma * sigma)); k[i + r] = v; sum += v; }
    for (let i = 0; i < k.length; i++) k[i] /= sum;
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let j = -r; j <= r; j++) {
        let idx = i + j;
        if (idx < 0) idx = -idx;                       // spegling i kanterna
        if (idx >= n) idx = 2 * n - 2 - idx;
        s += a[U.clamp(idx, 0, n - 1)] * k[j + r];
      }
      out[i] = s;
    }
    return out;
  }
  const sub = (a, b) => { const o = new Float32Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] - b[i]; return o; };
  const constArr = (n, v) => { const o = new Float32Array(n); o.fill(v); return o; };
  const mean = a => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s / Math.max(1, a.length); };

  /* --- bandpass runt en frekvens: skillnad mellan två glidande medel --- */
  function bandpass(a, fps, hz) {
    if (!(hz > 0.2)) return new Float32Array(a.length);
    const period = fps / hz;
    const s1 = gauss(a, Math.max(0.6, period / 6));
    const s2 = gauss(a, Math.max(1.2, period * 0.9));
    return sub(s1, s2);
  }

  const hashSettings = s => JSON.stringify(s);

  /** Bygger korrigeringsspåret för ett medium + inställningar. */
  function build(traj, settings, report) {
    const n = traj.n, fps = traj.fps, a = 1 / traj.aspect;   // halvhöjd i halvbredds-enheter
    const st = settings;
    const g = st.strength / 100;
    const smoothSec = U.lerp(0.10, 1.9, Math.pow(st.smoothness / 100, 0.85));
    let sigma = smoothSec * fps;
    if (st.mode === 'locked') sigma = Math.max(sigma, n);     // i praktiken hela klippet = tripod

    const raw = { tx: Float32Array.from(traj.tx), ty: Float32Array.from(traj.ty), rot: Float32Array.from(traj.rot), scale: Float32Array.from(traj.scale), shear: Float32Array.from(traj.shear), aspect: Float32Array.from(traj.aspectCh) };

    // extra utjämning där spårningen visade icke-rigid deformation
    const wob = st.wobble / 100;
    const sigmaShape = sigma * (1 + wob * 1.6);

    // Walking bob: för att ta bort en svängning på f Hz måste lågpassfiltret
    // ligga klart under f. Ett extra bandstopp ovanpå utjämningen dubbelräknar
    // samma rörelse och gör resultatet sämre — bredda filtret i stället.
    const bobHzDet = (report && report.bob && report.bob.hz) || 0;
    let sigmaY = sigma;
    if (st.verticalBob > 0 && bobHzDet > 0.4 && bobHzDet < 4) {
      const need = (fps / bobHzDet) * 1.1;             // ~1,1 perioder
      sigmaY = Math.max(sigmaY, need * (st.verticalBob / 100));
    }
    const sm = {
      tx: gauss(raw.tx, sigma), ty: gauss(raw.ty, sigmaY),
      rot: st.lockHorizon ? constArr(n, mean(raw.rot)) : gauss(raw.rot, sigma * (0.6 + 0.8 * st.rotation / 100)),
      scale: gauss(raw.scale, sigma), shear: gauss(raw.shear, sigmaShape), aspect: gauss(raw.aspect, sigmaShape),
    };
    if (st.mode === 'locked') { sm.tx = constArr(n, mean(raw.tx)); sm.ty = constArr(n, mean(raw.ty)); sm.scale = constArr(n, mean(raw.scale)); }

    const gRot = g * (st.rotation / 100);
    const gPersp = g * (st.perspective / 100);
    const gScale = g * (0.55 + 0.45 * st.perspective / 100);

    let cTx = sub(sm.tx, raw.tx), cTy = sub(sm.ty, raw.ty);
    let cRot = sub(sm.rot, raw.rot), cScale = sub(sm.scale, raw.scale);
    let cShear = sub(sm.shear, raw.shear), cAspect = sub(sm.aspect, raw.aspect);

    // --- rolling shutter: shear proportionell mot horisontell hastighet ---
    if (st.rollingShutter > 0) {
      const k = st.rollingShutter / 100 * 0.10;
      for (let i = 1; i < n; i++) cShear[i] += -(raw.tx[i] - raw.tx[i - 1]) * fps * k * 0.02;
    }
    // --- motion preservation: låt avsiktlig lågfrekvent rörelse vara ifred ---
    const mp = st.motionPreservation / 100;
    if (mp > 0.01) {
      const bigSigma = Math.max(sigma * 2.2, fps * 1.2);
      const keep = (c) => { const lp = gauss(c, bigSigma); const o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = c[i] - lp[i] * mp; return o; };
      cTx = keep(cTx); cTy = keep(cTy); cRot = keep(cRot); cScale = keep(cScale);
    }
    // --- global styrka + gränser ---
    const maxShift = U.lerp(0.30, 0.06, mp) * (st.mode === 'locked' ? 1.4 : 1);
    for (let i = 0; i < n; i++) {
      cTx[i] = U.clamp(cTx[i] * g, -maxShift, maxShift);
      cTy[i] = U.clamp(cTy[i] * g, -maxShift * a * 1.6, maxShift * a * 1.6);
      cRot[i] = U.clamp(cRot[i] * gRot, -0.12, 0.12);
      cScale[i] = U.clamp(cScale[i] * gScale, -0.08, 0.08);
      cShear[i] = U.clamp(cShear[i] * gPersp * (1 + wob), -0.03, 0.03);
      cAspect[i] = 0;   // bildförhållandet får aldrig ändras
    }

    // --- nödvändig zoom: minsta z så att hela vyn täcks i varje bildruta ---
    const need = requiredZoom(n, a, cTx, cTy, cRot, cScale, cShear, cAspect);
    let extra = st.reduceEdgeWarp ? 0.015 : 0;
    extra += wob * 0.02;
    let zoomNeed = need * (1 + extra);
    const zoomCap = 1 / Math.max(0.5, 1 - 2 * (st.crop / 100));
    let limited = false, scaleDown = 1;
    if (st.autoCrop) {
      if (zoomNeed > zoomCap) {
        // dämpa hela korrigeringen tills den ryms inom tillåten crop
        limited = true;
        scaleDown = U.clamp((zoomCap - 1) / Math.max(1e-4, zoomNeed - 1), 0.15, 1);
        for (let i = 0; i < n; i++) { cTx[i] *= scaleDown; cTy[i] *= scaleDown; cRot[i] *= scaleDown; cScale[i] *= scaleDown; cShear[i] *= scaleDown; cAspect[i] *= scaleDown; }
        zoomNeed = requiredZoom(n, a, cTx, cTy, cRot, cScale, cShear, cAspect) * (1 + extra);
      }
    } else {
      zoomNeed = zoomCap;
    }
    const zoom = 1 + (zoomNeed - 1) * (st.zoomComp / 100);
    const cropPct = U.round((1 - 1 / zoom) / 2 * 100, 1);

    return {
      hash: hashSettings(st), n, fps, step: traj.step, duration: traj.duration,
      tx: cTx, ty: cTy, rot: cRot, scale: cScale, shear: cShear, aspect: cAspect,
      zoom, cropPct, limited, scaleDown: U.round(scaleDown, 2),
      note: limited ? `Korrigeringen dämpades till ${Math.round(scaleDown * 100)} % för att hålla sig inom ${st.crop} % crop.` : null,
    };
  }

  /** Minsta zoom som gör att vyn aldrig hamnar utanför källbilden. */
  function requiredZoom(n, a, cTx, cTy, cRot, cScale, cShear, cAspect) {
    const corners = [[-1, -a], [1, -a], [1, a], [-1, a]];
    let z = 1;
    for (let i = 0; i < n; i++) {
      const cs = Math.cos(cRot[i]), sn = Math.sin(cRot[i]);
      const s = Math.exp(cScale[i]), ar = Math.exp(cAspect[i]);
      const m00 = cs * s * ar, m01 = (cShear[i] * cs - sn) * s / ar;
      const m10 = sn * s * ar, m11 = (cShear[i] * sn + cs) * s / ar;
      for (const [cx, cy] of corners) {
        const x = m00 * cx + m01 * cy + cTx[i];
        const y = m10 * cx + m11 * cy + cTy[i];
        // vyn måste rymmas innanför den transformerade bilden i varje bildruta
        z = Math.max(z, Math.abs(x), Math.abs(y) / a);
      }
    }
    return U.clamp(z, 1, 1.6);
  }

  /** Interpolerar korrigeringen vid en godtycklig källtid. */
  function sample(corr, t) {
    if (!corr || !corr.n) return null;
    const f = U.clamp(t / corr.step, 0, corr.n - 1);
    const i = Math.floor(f), j = Math.min(corr.n - 1, i + 1), u = f - i;
    const L = (arr) => arr[i] + (arr[j] - arr[i]) * u;
    return { tx: L(corr.tx), ty: L(corr.ty), rot: L(corr.rot), scale: L(corr.scale), shear: L(corr.shear), aspect: L(corr.aspect), zoom: corr.zoom };
  }

  /** Snabb cropuppskattning för rapporten (utan att bygga hela spåret). */
  function estimateCrop(traj, settings) {
    try {
      const c = build(traj, settings, null);
      return { cropPct: c.cropPct, zoom: c.zoom };
    } catch (e) { return { cropPct: 0, zoom: 1 }; }
  }
  StabAnalyze._bind(estimateCrop);

  return { build, sample, estimateCrop, gauss };
})();

/* ============================================================
   Stab — publik fasad: analys, cache, presetval
   ============================================================ */
const Stab = (() => {
  const running = new Map();

  function settingsFor(media, clipStab) {
    const base = M.emptyStab();
    // Presetvärdena skrivs in i settings när läget väljs (applyMode) — de får
    // INTE återappliceras här, annars nollas användarens egna reglage.
    const s = { ...base, ...(media.stab && media.stab.settings) };
    if (clipStab) Object.assign(s, clipStab);
    return s;
  }
  function applyMode(media, mode) {
    const cur = (media.stab && media.stab.settings) || M.emptyStab();
    let next;
    if (mode === 'auto') {
      const rec = (media.stab && media.stab.report && media.stab.report.recommended) || 'smooth';
      next = { ...M.emptyStab(), ...M.stabModeById(rec).s, mode: 'auto', autoResolved: rec };
    } else {
      next = { ...M.emptyStab(), ...M.stabModeById(mode).s, mode };
    }
    next.autoCrop = cur.autoCrop !== undefined ? cur.autoCrop : true;
    return next;
  }

  async function analyze(media, onProgress) {
    if (running.has(media.id)) return running.get(media.id);
    const p = (async () => {
      media.stab = media.stab || {};
      media.stab.status = 'analyzing';
      S.bus.emit('media', media);
      try {
        const { traj, report } = await StabAnalyze.analyze(media, { onProgress, cancelled: () => App.cancelStab });
        media.stab.traj = traj;
        media.stab.report = report;
        media.stab.status = 'analyzed';
        if (!media.stab.settings || media.stab.settings.mode === 'auto')
          media.stab.settings = applyMode(media, 'auto');
        media.stab.corr = null;
        corrFor(media);
        S.touch(null, 'stab-analyzed');
        S.bus.emit('media', media);
        return report;
      } catch (e) {
        media.stab.status = e.message === 'cancelled' ? 'none' : 'error';
        media.stab.error = e.message;
        S.bus.emit('media', media);
        throw e;
      } finally { running.delete(media.id); }
    })();
    running.set(media.id, p);
    return p;
  }

  /** Hämtar (och cachar) korrigeringsspåret för ett medium. */
  function corrFor(media) {
    const s = media.stab;
    if (!s || !s.traj) return null;
    const set = settingsFor(media);
    const hash = JSON.stringify(set);
    if (s.corr && s.corr.hash === hash) return s.corr;
    s.corr = StabProcess.build(s.traj, set, s.report);
    s.corr.hash = hash;
    return s.corr;
  }
  const isAnalyzing = id => running.has(id);

  return { analyze, corrFor, settingsFor, applyMode, sample: StabProcess.sample, isAnalyzing };
})();
