/* ============================================================
   50 — Stabilisering: analys (motion tracking)

   Riktig bildanalys. Klippet samplas, varje sampel görs om till en
   gråskalepyramid, arkitektoniska hörn (dörrkarmar, fönster, väggmöten)
   väljs som spårpunkter, punkterna matchas mellan bildrutor och en
   robust affin transform anpassas. Resultatet blir en kamerabana i
   sex kanaler (x, y, rotation, skala, shear, aspekt) plus ett mått på
   hur mycket av rörelsen som INTE går att beskriva med en global
   transform — vilket är precis det som avslöjar AI-wobble.

   Enheter: all translation uttrycks i "halva bildbredder" (u), så att
   banan kan appliceras i vilken renderingsupplösning som helst.
   ============================================================ */
const StabAnalyze = (() => {
  const AW = 320;                 // analysbredd i px
  const GRID_X = 10, GRID_Y = 6;  // spårpunktsraster
  const PATCH = 7;                // halv patchstorlek på L0 (15x15)

  /* ---------- pyramid ---------- */
  function grayPyramid(imgData, w, h) {
    const src = imgData.data;
    const L0 = new Float32Array(w * h);
    for (let i = 0, p = 0; i < L0.length; i++, p += 4)
      L0[i] = (src[p] * 0.299 + src[p + 1] * 0.587 + src[p + 2] * 0.114);
    const d1 = down(L0, w, h), d2 = down(d1.a, d1.w, d1.h);
    return { L0, w0: w, h0: h, L1: d1.a, w1: d1.w, h1: d1.h, L2: d2.a, w2: d2.w, h2: d2.h };
  }
  function down(a, w, h) {
    const w2 = w >> 1, h2 = h >> 1, o = new Float32Array(w2 * h2);
    for (let y = 0; y < h2; y++) {
      const r0 = (y * 2) * w, r1 = r0 + w, or_ = y * w2;
      for (let x = 0; x < w2; x++) {
        const i = x * 2;
        o[or_ + x] = (a[r0 + i] + a[r0 + i + 1] + a[r1 + i] + a[r1 + i + 1]) * .25;
      }
    }
    return { a: o, w: w2, h: h2 };
  }

  /* ---------- spårpunkter: arkitektur först ----------
     Harris-respons gynnar punkter där både vertikala och horisontella
     linjer möts — dörrkarmar, fönsterhörn, list mot golv. Exakt de punkter
     som gör att bostadsfilm ser billig ut när de rör sig. */
  function pickFeatures(P) {
    const { L1: a, w1: w, h1: h } = P;
    const feats = [];
    const cw = Math.max(4, Math.floor(w / GRID_X)), chh = Math.max(4, Math.floor(h / GRID_Y));
    const m = 6;
    for (let gy = 0; gy < GRID_Y; gy++) {
      for (let gx = 0; gx < GRID_X; gx++) {
        let best = -1, bx = 0, by = 0;
        const x0 = Math.max(m, gx * cw), x1 = Math.min(w - m, (gx + 1) * cw);
        const y0 = Math.max(m, gy * chh), y1 = Math.min(h - m, (gy + 1) * chh);
        for (let y = y0; y < y1; y += 1) {
          for (let x = x0; x < x1; x += 1) {
            let sxx = 0, syy = 0, sxy = 0;
            for (let j = -2; j <= 2; j++) {
              const r = (y + j) * w;
              for (let i = -2; i <= 2; i++) {
                const p = r + x + i;
                const gxv = a[p + 1] - a[p - 1];
                const gyv = a[p + w] - a[p - w];
                sxx += gxv * gxv; syy += gyv * gyv; sxy += gxv * gyv;
              }
            }
            // Harris: hörn > kant > platt yta
            const det = sxx * syy - sxy * sxy, tr = sxx + syy;
            const resp = det - 0.04 * tr * tr;
            if (resp > best) { best = resp; bx = x; by = y; }
          }
        }
        if (best > 260) feats.push({ x: bx * 2, y: by * 2, q: best });
      }
    }
    return feats;
  }

  /* ---------- block matching ---------- */
  /** SAD med tidigt avbrott: hoppar ur så fort summan passerat bästa hittills. */
  function sad(a, wa, b, wb, ax, ay, bx, by, r, limit) {
    let s = 0;
    const lim = limit === undefined ? Infinity : limit;
    for (let j = -r; j <= r; j++) {
      const ra = (ay + j) * wa + ax, rb = (by + j) * wb + bx;
      for (let i = -r; i <= r; i++) { const d = a[ra + i] - b[rb + i]; s += d < 0 ? -d : d; }
      if (s >= lim) return s;
    }
    return s;
  }
  function inb(x, y, w, h, r) { return x >= r && y >= r && x < w - r && y < h - r; }

  /** Grov-till-fin matchning av en punkt mellan två pyramider. */
  const L2R = 6;
  function track(P, Q, fx, fy, hint) {
    // L2 (1/4): grovsökning kring gissningen
    const x2 = fx >> 2, y2 = fy >> 2, r2 = 3;
    const hx = hint ? Math.round(hint.dx / 4) : 0, hy = hint ? Math.round(hint.dy / 4) : 0;
    if (!inb(x2, y2, P.w2, P.h2, r2 + L2R + Math.abs(hx) + Math.abs(hy))) return null;
    let best = Infinity, dx = 0, dy = 0;
    for (let j = -L2R; j <= L2R; j++) for (let i = -L2R; i <= L2R; i++) {
      const cx = x2 + hx + i, cy = y2 + hy + j;
      if (!inb(cx, cy, Q.w2, Q.h2, r2)) continue;
      const s = sad(P.L2, P.w2, Q.L2, Q.w2, x2, y2, cx, cy, r2, best);
      if (s < best) { best = s; dx = hx + i; dy = hy + j; }
    }
    // L1 (1/2): ±2 kring skalad gissning
    const x1 = fx >> 1, y1 = fy >> 1, r1 = 5, gx1 = x1 + dx * 2, gy1 = y1 + dy * 2;
    if (!inb(x1, y1, P.w1, P.h1, r1) || !inb(gx1, gy1, Q.w1, Q.h1, r1 + 2)) return null;
    best = Infinity; let bx1 = gx1, by1 = gy1;
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
      const s = sad(P.L1, P.w1, Q.L1, Q.w1, x1, y1, gx1 + i, gy1 + j, r1, best);
      if (s < best) { best = s; bx1 = gx1 + i; by1 = gy1 + j; }
    }
    // L0: ±2 med subpixelförfining runt minimum
    const gx0 = bx1 * 2, gy0 = by1 * 2, r0 = PATCH, R = 2, D = 2 * R + 1;
    if (!inb(fx, fy, P.w0, P.h0, r0) || !inb(gx0, gy0, Q.w0, Q.h0, r0 + R)) return null;
    const S = new Float32Array(D * D);
    let b0 = Infinity, bi = 0, bj = 0;
    for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
      const s = sad(P.L0, P.w0, Q.L0, Q.w0, fx, fy, gx0 + i, gy0 + j, r0);
      S[(j + R) * D + (i + R)] = s;
      if (s < b0) { b0 = s; bi = i; bj = j; }
    }
    let sx = 0, sy = 0;
    if (bi > -R && bi < R && bj > -R && bj < R) {   // parabel runt minimum
      const at = (i, j) => S[(j + R) * D + (i + R)];
      const c = at(bi, bj), l = at(bi - 1, bj), rr = at(bi + 1, bj), u = at(bi, bj - 1), d = at(bi, bj + 1);
      const denx = (l - 2 * c + rr), deny = (u - 2 * c + d);
      if (denx > 1e-3) sx = U.clamp(0.5 * (l - rr) / denx, -.5, .5);
      if (deny > 1e-3) sy = U.clamp(0.5 * (u - d) / deny, -.5, .5);
    }
    const n = (2 * r0 + 1) * (2 * r0 + 1);
    const err = b0 / n;                       // medelfel per pixel
    if (err > 26) return null;                // matchningen håller inte
    // hur distinkt är minimumet? platta minima ger dålig position
    let second = Infinity;
    for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
      if (Math.abs(i - bi) <= 1 && Math.abs(j - bj) <= 1) continue;
      const s = S[(j + R) * D + (i + R)];
      if (s < second) second = s;
    }
    const sharp = isFinite(second) ? U.clamp((second - b0) / Math.max(1, b0) * 6, 0, 1) : .3;
    return { dx: (gx0 + bi + sx - fx), dy: (gy0 + bj + sy - fy), err, w: 0.25 + sharp };
  }

  /* ---------- robust affinanpassning ---------- */
  function solve3(A, b) { // 3x3 Gauss med partiell pivotering
    const m = [[A[0], A[1], A[2], b[0]], [A[3], A[4], A[5], b[1]], [A[6], A[7], A[8], b[2]]];
    for (let i = 0; i < 3; i++) {
      let p = i;
      for (let k = i + 1; k < 3; k++) if (Math.abs(m[k][i]) > Math.abs(m[p][i])) p = k;
      if (Math.abs(m[p][i]) < 1e-10) return null;
      [m[i], m[p]] = [m[p], m[i]];
      for (let k = i + 1; k < 3; k++) {
        const f = m[k][i] / m[i][i];
        for (let j = i; j < 4; j++) m[k][j] -= f * m[i][j];
      }
    }
    const x = [0, 0, 0];
    for (let i = 2; i >= 0; i--) {
      let s = m[i][3];
      for (let j = i + 1; j < 3; j++) s -= m[i][j] * x[j];
      x[i] = s / m[i][i];
    }
    return x;
  }
  /** Anpassar dx = a*X + b*Y + c (och samma för dy) med IRLS + ridge.
   *  Ridge-termen krymper de linjära leden (skala/rotation/shear) mot noll när
   *  punkterna inte räcker för att belägga dem — utan den blir den integrerade
   *  banan en slumpvandring som ser ut som perspektivdrift. */
  function fitAffine(pts, hw, hh, ridge = 0.06) {
    if (pts.length < 5) return null;
    const W = pts.map(p => p.w || 1);
    let px = null, py = null;
    const spread = (() => {   // hur väl täcker punkterna bilden?
      let mnx = 9, mxx = -9, mny = 9, mxy = -9;
      for (const p of pts) { const X = (p.x - hw) / hw, Y = (p.y - hh) / hw; if (X < mnx) mnx = X; if (X > mxx) mxx = X; if (Y < mny) mny = Y; if (Y > mxy) mxy = Y; }
      return Math.min(1, ((mxx - mnx) * (mxy - mny)) / 1.2);
    })();
    const lam = ridge / Math.max(0.05, spread);
    for (let it = 0; it < 3; it++) {
      const A = new Array(9).fill(0), bx = [0, 0, 0], by = [0, 0, 0];
      let wsum = 0;
      for (let k = 0; k < pts.length; k++) {
        const p = pts[k], w = W[k];
        wsum += w;
        const X = (p.x - hw) / hw, Y = (p.y - hh) / hw;   // isotrop normalisering
        const v = [X, Y, 1];
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) A[i * 3 + j] += w * v[i] * v[j];
          bx[i] += w * v[i] * (p.dx / hw);
          by[i] += w * v[i] * (p.dy / hw);
        }
      }
      A[0] += lam * wsum; A[4] += lam * wsum;             // ridge endast på X- och Y-leden
      px = solve3(A, bx); py = solve3(A, by);
      if (!px || !py) return null;
      // omvikta efter residual
      const res = [];
      for (let k = 0; k < pts.length; k++) {
        const p = pts[k];
        const X = (p.x - hw) / hw, Y = (p.y - hh) / hw;
        const ex = (px[0] * X + px[1] * Y + px[2]) - p.dx / hw;
        const ey = (py[0] * X + py[1] * Y + py[2]) - p.dy / hw;
        res.push(Math.hypot(ex, ey));
      }
      const srt = [...res].sort((a, b) => a - b);
      const med = srt[srt.length >> 1] || 1e-4;
      const sigma = Math.max(med * 1.4826, 2e-4);
      for (let k = 0; k < pts.length; k++) W[k] = (pts[k].w || 1) / (1 + Math.pow(res[k] / (2.5 * sigma), 2));
      if (it === 2) {
        const inl = res.filter(r => r < 3 * sigma).length;
        // kvadrantvis medelresidual = deformation som INTE är global (AI-wobble)
        const q = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
        for (let k = 0; k < pts.length; k++) {
          if (res[k] > 3 * sigma) continue;                 // felmatchningar räknas inte som deformation
          const p = pts[k];
          const X = (p.x - hw) / hw, Y = (p.y - hh) / hw;
          const ex = (px[0] * X + px[1] * Y + px[2]) - p.dx / hw;
          const ey = (py[0] * X + py[1] * Y + py[2]) - p.dy / hw;
          const qi = (p.x < hw ? 0 : 1) + (p.y < hh ? 0 : 2);
          q[qi][0] += ex; q[qi][1] += ey; q[qi][2]++;
        }
        let divergence = 0;
        for (const [ex, ey, n] of q) if (n >= 3) divergence = Math.max(divergence, Math.hypot(ex / n, ey / n));
        return { px, py, residual: med, inliers: inl, total: pts.length, divergence, spread };
      }
    }
    return null;
  }
  /** QR-dekomposition av (I + A) → rot, skala, shear, aspekt. */
  function decompose(px, py) {
    const a11 = 1 + px[0], a12 = px[1], a21 = py[0], a22 = 1 + py[1];
    const sx = Math.hypot(a11, a21) || 1e-6;
    const rot = Math.atan2(a21, a11);
    const shear = (a11 * a12 + a21 * a22) / (sx * sx);
    const sy = Math.hypot(a12 - shear * a11, a22 - shear * a21) || 1e-6;
    return { tx: px[2], ty: py[2], rot, scale: Math.sqrt(Math.abs(sx * sy)), aspect: sx / sy, shear };
  }

  /* ---------- signalhjälp ---------- */
  function highpass(a, win) {
    const out = new Float32Array(a.length), n = a.length, r = Math.max(1, win >> 1);
    for (let i = 0; i < n; i++) {
      let s = 0, c = 0;
      for (let j = Math.max(0, i - r); j <= Math.min(n - 1, i + r); j++) { s += a[j]; c++; }
      out[i] = a[i] - s / c;
    }
    return out;
  }
  const rms = a => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * a[i]; return Math.sqrt(s / Math.max(1, a.length)); };
  const range = a => { let mn = Infinity, mx = -Infinity; for (const v of a) { if (v < mn) mn = v; if (v > mx) mx = v; } return mx - mn; };

  /** Autokorrelation i bandet 0,5–3,5 Hz → rytmisk rörelse (walking bob). */
  function periodicity(sig, fps) {
    const n = sig.length;
    if (n < 24) return { strength: 0, hz: 0, amp: 0 };
    let mean = 0; for (const v of sig) mean += v; mean /= n;
    const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = sig[i] - mean;
    let e0 = 0; for (let i = 0; i < n; i++) e0 += x[i] * x[i];
    if (e0 < 1e-12) return { strength: 0, hz: 0, amp: 0 };
    const lagMin = Math.max(2, Math.floor(fps / 3.5));
    const lagMax = Math.min(Math.floor(n / 3), Math.ceil(fps / 0.5));
    if (lagMax <= lagMin) return { strength: 0, hz: 0, amp: 0 };
    const C = new Float32Array(lagMax + 1);
    let best = 0;
    for (let L = lagMin; L <= lagMax; L++) {
      let s = 0, cnt = 0;
      for (let i = 0; i + L < n; i++) { s += x[i] * x[i + L]; cnt++; }
      C[L] = (s / Math.max(1, cnt)) / (e0 / n);
      if (C[L] > best) best = C[L];
    }
    // ta grundtonen: minsta lag som är en lokal topp nära maxvärdet
    let bestLag = 0;
    for (let L = lagMin + 1; L < lagMax; L++) {
      if (C[L] >= best * 0.82 && C[L] >= C[L - 1] && C[L] >= C[L + 1]) { bestLag = L; break; }
    }
    if (!bestLag) for (let L = lagMin; L <= lagMax; L++) if (C[L] === best) { bestLag = L; break; }
    return { strength: U.clamp(bestLag ? C[bestLag] : 0, 0, 1), hz: bestLag ? fps / bestLag : 0, amp: rms(x) * Math.SQRT2 };
  }

  /* ---------- huvudanalys ---------- */
  /** Fångar bildrutor genom att spela upp klippet (snabbt, tätt samplat) och
   *  faller tillbaka på sökning om requestVideoFrameCallback saknas. */
  async function captureAndTrack(v, duration, opts, onFrame, onProgress) {
    const useRVFC = typeof v.requestVideoFrameCallback === 'function' && !opts.forceSeek;
    const maxSamples = opts.maxSamples || 500;
    if (useRVFC) {
      // uppspelningen ger täta sampel; snabbare än sökning men aldrig snabbare än realtid
      const rate = duration > 40 ? 2 : 1;
      v.muted = true; v.playbackRate = rate;
      try { v.currentTime = 0; } catch (e) { }
      let count = 0, done = false, lastT = -1;
      await new Promise((resolve, reject) => {
        const finish = () => { if (done) return; done = true; try { v.pause(); } catch (e) { } resolve(); };
        const step = (now, meta) => {
          if (done) return;
          if (opts.cancelled && opts.cancelled()) { finish(); return; }
          const t = meta.mediaTime;
          if (t > lastT + 1e-4) { onFrame(t); count++; lastT = t; onProgress(U.clamp(t / duration, 0, 1), `${count} bildrutor`); }
          if (count >= maxSamples || t >= duration - 0.02) return finish();
          v.requestVideoFrameCallback(step);
        };
        v.requestVideoFrameCallback(step);
        const p = v.play();
        if (p && p.catch) p.catch(() => finish());
        v.addEventListener('ended', finish, { once: true });
        setTimeout(finish, Math.min(120000, (duration / rate) * 1000 + 8000));
      });
      if (count >= 12) return count;
    }
    // fallback: sökbaserad sampling
    const fps = U.clamp(Math.min(v.playbackRate ? 15 : 15, 15), 6, 15);
    const step = Math.max(1 / fps, duration / maxSamples);
    let count = 0;
    for (let t = 0; t < duration - 1e-3; t += step) {
      if (opts.cancelled && opts.cancelled()) break;
      await Media.seekTo(v, t);
      onFrame(t); count++;
      if (count % 4 === 0) { onProgress(t / duration, `${count} bildrutor`); await U.raf(); }
    }
    return count;
  }

  async function analyze(media, opts = {}) {
    const onProgress = opts.onProgress || (() => { });
    if (!media.url) throw new Error('Mediefilen är inte tillgänglig i webbläsaren längre — importera om den.');
    const v = await Media.loadVideoEl(media.url);
    const duration = media.duration || v.duration;
    if (!(duration > 0.4)) throw new Error('Klippet är för kort för att analyseras.');

    const w = AW, h = Math.max(2, Math.round(AW * (v.videoHeight / Math.max(1, v.videoWidth)) / 2) * 2);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d', { willReadFrequently: true });
    const hw = w / 2, hh = h / 2;

    const T = { t: [], tx: [], ty: [], rot: [], scale: [], shear: [], aspect: [] };
    const D = { dt: [], dx: [], dy: [], drot: [], dscale: [], dshear: [], residual: [], inlierRatio: [], quad: [] };
    let prev = null, prevT = 0;
    const acc = { tx: 0, ty: 0, rot: 0, scale: 0, shear: 0, aspect: 0 };
    const t0 = performance.now();

    let feats = null, frameIdx = 0;
    const onFrame = (t) => {
      g.drawImage(v, 0, 0, w, h);
      const P = grayPyramid(g.getImageData(0, 0, w, h), w, h);
      if (prev) {
        // punkterna propageras mellan bildrutor och väljs om var femte ruta
        if (!feats || feats.length < 14 || frameIdx % 5 === 0) feats = pickFeatures(prev);
        const pts = [], next = [];
        for (const f of feats) {
          const m = track(prev, P, f.x, f.y, f.hint);
          if (!m) continue;
          pts.push({ x: f.x, y: f.y, dx: m.dx, dy: m.dy, err: m.err, w: m.w });
          next.push({ x: Math.round(f.x + m.dx), y: Math.round(f.y + m.dy), hint: { dx: m.dx, dy: m.dy } });
        }
        feats = next;
        frameIdx++;
        const fit = pts.length >= 10 ? fitAffine(pts, hw, hh) : null;
        if (fit) {
          const d = decompose(fit.px, fit.py);
          acc.tx += d.tx; acc.ty += d.ty; acc.rot += d.rot;
          acc.scale += Math.log(Math.max(1e-3, d.scale));
          acc.shear += d.shear; acc.aspect += Math.log(Math.max(1e-3, d.aspect));
          D.dx.push(d.tx); D.dy.push(d.ty); D.drot.push(d.rot); D.dscale.push(Math.log(Math.max(1e-3, d.scale)));
          D.dshear.push(d.shear); D.residual.push(fit.residual);
          D.inlierRatio.push(fit.inliers / Math.max(1, fit.total));
          D.quad.push(fit.divergence || 0);
          D.dt.push(Math.max(1e-3, t - prevT));
        } else if (pts.length >= 3) {          // för få punkter: bara translation
          let sx = 0, sy = 0;
          for (const p of pts) { sx += p.dx; sy += p.dy; }
          acc.tx += (sx / pts.length) / hw; acc.ty += (sy / pts.length) / hw;
          D.dx.push((sx / pts.length) / hw); D.dy.push((sy / pts.length) / hw);
          D.drot.push(0); D.dscale.push(0); D.dshear.push(0);
          D.residual.push(0); D.inlierRatio.push(0.4); D.quad.push(0); D.dt.push(Math.max(1e-3, t - prevT));
        }
      }
      T.t.push(t); T.tx.push(acc.tx); T.ty.push(acc.ty); T.rot.push(acc.rot);
      T.scale.push(acc.scale); T.shear.push(acc.shear); T.aspect.push(acc.aspect);
      prev = P; prevT = t;
    };

    const count = await captureAndTrack(v, duration, opts, onFrame, onProgress);
    try { v.pause(); v.src = ''; v.load(); } catch (e) { }
    if (opts.cancelled && opts.cancelled()) throw new Error('cancelled');
    if (count < 8 || T.t.length < 8) throw new Error('För få bildrutor kunde läsas ur klippet (' + count + ').');
    onProgress(1, 'Sammanställer');

    const traj = resample(T, duration, w / h);
    const report = buildReport(traj, D, media, performance.now() - t0);
    return { traj, report, deltas: D };
  }

  /** Banan samplas om till ett jämnt tidsraster så att filter och
   *  periodicitetsanalys kan räkna med konstant tidssteg. */
  function resample(T, duration, aspect) {
    const n0 = T.t.length;
    const span = Math.max(1e-3, T.t[n0 - 1] - T.t[0]);
    let fps = U.clamp((n0 - 1) / span, 6, 30);
    let n = Math.max(8, Math.min(600, Math.round(duration * fps)));
    const step = duration / n;
    fps = 1 / step;
    const ch = ['tx', 'ty', 'rot', 'scale', 'shear', 'aspect'];
    const out = {}; ch.forEach(c => out[c] = new Float32Array(n));
    const t = new Float32Array(n);
    let j = 0;
    for (let i = 0; i < n; i++) {
      const tt = i * step;
      t[i] = tt;
      while (j < n0 - 2 && T.t[j + 1] < tt) j++;
      const t0 = T.t[j], t1 = T.t[Math.min(n0 - 1, j + 1)];
      const u = t1 > t0 ? U.clamp((tt - t0) / (t1 - t0), 0, 1) : 0;
      for (const c of ch) {
        const a = T[c][j], b = T[c][Math.min(n0 - 1, j + 1)];
        out[c][i] = a + (b - a) * u;
      }
    }
    return {
      fps, step, n, duration, aspect,
      t: Array.from(t), tx: Array.from(out.tx), ty: Array.from(out.ty), rot: Array.from(out.rot),
      scale: Array.from(out.scale), shear: Array.from(out.shear), aspectCh: Array.from(out.aspect),
      samplesRaw: n0,
    };
  }

  /* ---------- rapport ---------- */
  function buildReport(traj, D, media, ms) {
    const fps = traj.fps;
    const win = Math.max(3, Math.round(fps * 0.6));
    const hpX = highpass(Float32Array.from(traj.tx), win);
    const hpY = highpass(Float32Array.from(traj.ty), win);
    const hpR = highpass(Float32Array.from(traj.rot), win);

    const shakeU = Math.hypot(rms(hpX), rms(hpY));            // i halva bildbredder
    const shakePct = shakeU * 50;                              // % av bildbredden
    const bob = periodicity(Float32Array.from(hpY), fps);
    const bobAmpPct = bob.amp * 50 * (traj.aspect);            // % av bildhöjden
    const rotRangeDeg = range(traj.rot) * 180 / Math.PI;
    const rotShakeDeg = rms(hpR) * 180 / Math.PI;
    const scaleRangePct = (Math.exp(range(traj.scale)) - 1) * 100;
    const shearRange = range(traj.shear);
    const resid = D.residual.length ? [...D.residual].sort((a, b) => a - b)[D.residual.length >> 1] : 0;
    const quad = D.quad.length ? D.quad.reduce((a, b) => a + b, 0) / D.quad.length : 0;
    const inl = D.inlierRatio.length ? D.inlierRatio.reduce((a, b) => a + b, 0) / D.inlierRatio.length : 0;

    // hastighetsjämnhet
    const speed = D.dx.map((v, i) => Math.hypot(v, D.dy[i]));
    const mSpeed = speed.reduce((a, b) => a + b, 0) / Math.max(1, speed.length);
    const sdSpeed = Math.sqrt(speed.reduce((a, b) => a + (b - mSpeed) * (b - mSpeed), 0) / Math.max(1, speed.length));
    const speedIrregularity = mSpeed > 1e-5 ? U.clamp(sdSpeed / mSpeed, 0, 3) : 0;

    // ryck: acceleration över tröskel
    let jerks = 0;
    for (let i = 1; i < speed.length; i++) if (Math.abs(speed[i] - speed[i - 1]) > Math.max(0.004, mSpeed * 1.8)) jerks++;

    // dominerande rörelse
    const dxSum = traj.tx[traj.n - 1] - traj.tx[0], dySum = traj.ty[traj.n - 1] - traj.ty[0];
    const scaleSum = traj.scale[traj.n - 1] - traj.scale[0];
    const types = [];
    if (Math.abs(scaleSum) > 0.018) types.push(scaleSum > 0 ? 'push-in' : 'pull-out');
    if (Math.abs(dxSum) > 0.04) types.push(dxSum > 0 ? 'pan höger' : 'pan vänster');
    if (Math.abs(dySum) > 0.04) types.push(dySum > 0 ? 'tilt ned' : 'tilt upp');
    if (Math.abs(rotRangeDeg) > 1.0) types.push('rotation/orbit');
    if (bob.strength > .45 && bob.hz > .5 && bob.hz < 3.5) types.push('gående kamera');
    if (speedIrregularity > .85) types.push('ojämn kamerahastighet');
    if (!types.length) types.push(shakePct > .25 ? 'handhållen, ingen tydlig riktning' : 'i stort sett statisk');

    // px vid analysupplösningen (normaliserat med halva bildbredden = 160 px)
    const residPx = resid * 160, quadPx = quad * 160;
    // ~0,1 px residual är codec- och interpolationsbrus i ett rigidt klipp;
    // allt däröver är rörelse som ingen global transform kan förklara.
    const residTerm = U.clamp((residPx - 0.09) / 0.35, 0, 1);
    const divTerm = U.clamp((quadPx - 0.10) / 0.50, 0, 1);
    const wobbleRisk = U.clamp(.50 * residTerm + .40 * divTerm + .10 * U.clamp((1 - inl) * 2.5, 0, 1), 0, 1);
    const shakeScore = U.clamp(shakePct / 1.6, 0, 1);
    const bobScore = U.clamp(bob.strength * (bobAmpPct / 0.9), 0, 1);

    // rekommendation
    let preset = 'smooth', why = 'Tydlig men jämn kamerarörelse.';
    if (wobbleRisk > .45) { preset = 'wobble'; why = 'Bilden deformeras icke-rigidt — typiskt för AI-genererade klipp.'; }
    else if (bobScore > .45) { preset = 'bob'; why = 'Rytmisk vertikal rörelse i gånghastighet upptäckt.'; }
    else if (rotShakeDeg > .28 && shakeScore < .55) { preset = 'horizon'; why = 'Rotationen vandrar mer än translationen.'; }
    else if (shakeScore < .12 && Math.abs(scaleSum) + Math.abs(dxSum) + Math.abs(dySum) < .02) { preset = 'locked'; why = 'Kameran står nästan still — kan låsas helt.'; }
    else if (shakeScore < .32) { preset = 'subtle'; why = 'Bara små vibrationer ovanpå en avsiktlig rörelse.'; }

    // uppskattad crop utifrån hur mycket banan faktiskt måste flyttas
    const mode = M.stabModeById(preset);
    const est = estimateCrop(traj, { ...M.emptyStab(), ...mode.s, mode: preset });

    return {
      at: Date.now(), ms: Math.round(ms), samples: traj.samplesRaw || traj.n, fps: U.round(fps, 1),
      motionTypes: types,
      shake: { pct: U.round(shakePct, 3), score: shakeScore, label: lvl(shakeScore) },
      bob: { amplitudePct: U.round(bobAmpPct, 3), hz: U.round(bob.hz, 2), strength: U.round(bob.strength, 2), score: bobScore, label: lvl(bobScore) },
      rotation: { rangeDeg: U.round(rotRangeDeg, 2), shakeDeg: U.round(rotShakeDeg, 3), score: U.clamp(rotShakeDeg / .6, 0, 1), label: lvl(U.clamp(rotShakeDeg / .6, 0, 1)) },
      perspective: { scalePct: U.round(scaleRangePct, 2), shear: U.round(shearRange, 4), score: U.clamp(scaleRangePct / 14 + shearRange * 8, 0, 1), label: lvl(U.clamp(scaleRangePct / 14 + shearRange * 8, 0, 1)) },
      wobble: { residualPx: U.round(residPx, 3), divergencePx: U.round(quadPx, 3), inliers: U.round(inl, 2), score: wobbleRisk, label: lvl(wobbleRisk) },
      speedIrregularity: U.round(speedIrregularity, 2),
      jerks,
      trackingQuality: U.round(inl, 2),
      recommended: preset, why,
      estimatedCrop: est.cropPct,
      unsalvageable: est.cropPct > 18,
      note: est.cropPct > 18
        ? 'Klippet kräver mer än 18 % beskärning för att bli stabilt. Sänk styrkan, välj Subtle, eller använd klippet kortare.'
        : null,
    };
  }
  const lvl = s => s < .18 ? 'Låg' : s < .42 ? 'Måttlig' : s < .7 ? 'Hög' : 'Mycket hög';

  /* estimateCrop deklareras i 55 — här bara en referens som fylls i senare */
  let estimateCrop = () => ({ cropPct: 0 });
  const _bind = fn => { estimateCrop = fn; };

  return { analyze, _bind, highpass, periodicity, rms, range };
})();
