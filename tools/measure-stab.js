#!/usr/bin/env node
/* Mäter hur mycket skakning som FAKTISKT försvinner.

   Spelar upp klippet genom den riktiga renderingskedjan, fångar den
   färdiga utbilden bildruta för bildruta, och kör samma motion tracking
   på utbilden. Restskakningen med stabilisering på jämförs med av.
   Det är det enda måttet som betyder något. */
const { chromium } = require('playwright');
const path = require('path');
const MEDIA = path.join(__dirname, '..', 'test-media');
const URL = process.env.APP_URL || 'http://127.0.0.1:8099/dist/index.html';
const file = process.argv[2] || 'walking-bob.webm';
const mode = process.argv[3] || null;

const HARNESS = () => {
  window.__measure = async function (opts) {
    const { grayPyramid, pickFeatures, track, fitAffine, decompose } = StabAnalyze.internals;
    const p = S.project, clip = p.tracks.video[0];
    const media = M.mediaById(p, clip.mediaId);
    const W = 320, H = Math.round(W * 9 / 16 / 2) * 2;
    const cap = document.createElement('canvas'); cap.width = W; cap.height = H;
    const g = cap.getContext('2d', { willReadFrequently: true });

    S.update(pp => { M.findClip(pp, clip.id).stabEnabled = !!opts.stab; }, 'measure');
    Playback.pause();
    await new Promise(r => setTimeout(r, 300));

    // Deterministisk fångst: sök exakt till varje bildruta och vänta på att
    // sökningen är klar. Ingen realtidsjitter, samma bildrutor varje körning.
    const ent = Playback.acquire(clip, media);
    const el = ent.video;
    // Vänta tills bildrutan är BÅDE sökt och presenterad (rVFC), annars mäter
    // vi en ruta som ligger före den korrigering som applicerades.
    const seekTo = t => new Promise(res => {
      let done = false;
      const finish = () => { if (done) return; done = true; el.removeEventListener('seeked', onSeek); res(); };
      const onSeek = () => {
        if (typeof el.requestVideoFrameCallback === 'function') el.requestVideoFrameCallback(() => finish());
        else finish();
      };
      el.addEventListener('seeked', onSeek);
      setTimeout(finish, 2000);
      try { el.currentTime = t; } catch (e) { finish(); }
    });
    const frames = [], times = [];
    const srcFps = media.fps || 30;
    const n = Math.min(opts.frames || 90, Math.floor((opts.seconds || 4) * srcFps));
    for (let i = 0; i < n; i++) {
      const t = clip.in + i / srcFps;
      await seekTo(t);
      S.st.playhead = t - clip.in;
      Playback.renderAt(S.st.playhead, p, { playing: false });
      await new Promise(r => requestAnimationFrame(r));
      Playback.renderAt(S.st.playhead, p, { playing: false });
      g.drawImage(Renderer.canvas, 0, 0, W, H);
      frames.push(g.getImageData(0, 0, W, H));
      times.push(ent.mediaTime != null ? ent.mediaTime : el.currentTime);
    }

    // spåra rörelsen i den renderade utbilden
    const hw = W / 2, hh = H / 2;
    const dx = [], dy = [], drot = [];
    let prev = null, feats = null, idx = 0;
    for (const f of frames) {
      const P = grayPyramid(f, W, H);
      if (prev) {
        if (!feats || feats.length < 14 || idx % 5 === 0) feats = pickFeatures(prev);
        const pts = [], next = [];
        for (const ft of feats) {
          const m = track(prev, P, ft.x, ft.y, ft.hint);
          if (!m) continue;
          pts.push({ x: ft.x, y: ft.y, dx: m.dx, dy: m.dy, err: m.err, w: m.w });
          next.push({ x: Math.round(ft.x + m.dx), y: Math.round(ft.y + m.dy), hint: { dx: m.dx, dy: m.dy } });
        }
        feats = next; idx++;
        const fit = pts.length >= 10 ? fitAffine(pts, hw, hh) : null;
        if (fit) { const d = decompose(fit.px, fit.py); dx.push(d.tx); dy.push(d.ty); drot.push(d.rot); }
        else { dx.push(0); dy.push(0); drot.push(0); }
      }
      prev = P;
    }
    // kumulativ bana → högpassa → restskakning
    const cum = a => { let s = 0; return a.map(v => (s += v)); };
    const X = Float32Array.from(cum(dx)), Y = Float32Array.from(cum(dy)), R = Float32Array.from(cum(drot));
    const fps = media.fps || 30;
    const win = Math.max(3, Math.round(fps * 0.6));
    const hp = StabAnalyze.highpass, rms = StabAnalyze.rms;
    const shake = Math.hypot(rms(hp(X, win)), rms(hp(Y, win))) * 50;      // % av bildbredden
    const rot = rms(hp(R, win)) * 180 / Math.PI;
    // bildruta-till-bildruta-rörelse (det ögat uppfattar som ryckighet)
    const jitter = Math.hypot(rms(Float32Array.from(dx)), rms(Float32Array.from(dy))) * 50;
    return {
      frames: frames.length, fps: +fps.toFixed(1),
      shakePct: +shake.toFixed(4), jitterPct: +jitter.toFixed(4), rotDeg: +rot.toFixed(4),
    };
  };
};

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('body[data-ready]');
  await page.addScriptTag({ content: '(' + HARNESS.toString() + ')()' });
  await page.setInputFiles('#fileinput', [path.join(MEDIA, file)]);
  await page.waitForFunction(() => S.project.tracks.video.length >= 1, null, { timeout: 60000 });

  console.log('analyserar ' + file + ' …');
  const rep = await page.evaluate(async (mode) => {
    const m = S.project.media[0];
    await Stab.analyze(m);
    if (mode) S.update(() => { m.stab.settings = Stab.applyMode(m, mode); m.stab.corr = null; }, 'x');
    const c = Stab.corrFor(m);
    const s = Stab.settingsFor(m);
    return {
      rec: m.stab.report.recommended, mode: s.mode, strength: s.strength, smoothness: s.smoothness,
      crop: s.crop, autoCrop: s.autoCrop, zoom: +c.zoom.toFixed(4), cropPct: c.cropPct,
      limited: c.limited, scaleDown: c.scaleDown,
    };
  }, mode);
  console.log('inställningar:', JSON.stringify(rep));

  const off = await page.evaluate(() => window.__measure({ stab: false, seconds: 4 }));
  const pct = (a, b) => a > 0 ? ((1 - b / a) * 100).toFixed(1) + ' %' : '–';
  console.log('\n  utan stabilisering: skakning ' + off.shakePct.toFixed(3) + ' · ruta-till-ruta ' + off.jitterPct.toFixed(3) + ' · rot ' + off.rotDeg.toFixed(3));
  console.log('\n  läge                skakning   ruta-till-ruta   rotation');
  const modes = (process.env.MODES || mode || 'auto').split(',');
  for (const md of modes) {
    await page.evaluate(async (md) => {
      const m = S.project.media[0];
      S.update(() => { m.stab.settings = Stab.applyMode(m, md === 'auto' ? 'auto' : md); m.stab.corr = null; }, 'x');
      Stab.corrFor(m);
    }, md);
    const on = await page.evaluate(() => window.__measure({ stab: true, seconds: 4 }));
    const zz = await page.evaluate(() => { const c = Stab.corrFor(S.project.media[0]); return { z: +c.zoom.toFixed(3), lim: c.limited }; });
    console.log(`  ${md.padEnd(18)} ${pct(off.shakePct, on.shakePct).padStart(8)}   ${pct(off.jitterPct, on.jitterPct).padStart(12)}   ${pct(off.rotDeg, on.rotDeg).padStart(8)}   zoom ${zz.z}`);
  }
  await browser.close();
})();
