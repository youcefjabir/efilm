#!/usr/bin/env node
/* Regressionstest för stabilisatorn.

   Kravet är inte "bilden förändras" utan "skakningen försvinner". Testet
   renderar klippet genom hela kedjan, spårar rörelsen i den färdiga utbilden
   och kräver en faktisk minskning. Utan det här testet gick det att tro att
   stabiliseringen fungerade när den i själva verket gjorde ingenting. */
const { chromium } = require('playwright');
const path = require('path');
const MEDIA = path.join(__dirname, '..', 'test-media');
const URL = process.env.APP_URL || 'http://127.0.0.1:8099/dist/index.html';

/* fil → minsta godkända minskning i procent */
const KRAV = [
  { file: 'walking-bob.webm', shake: 70, jitter: 55 },
  { file: 'handheld-pushin.webm', shake: 45, jitter: 25 },
];

const HARNESS = () => {
  window.__measure = async function (opts) {
    const { grayPyramid, pickFeatures, track, fitAffine, decompose } = StabAnalyze.internals;
    const p = S.project, clip = p.tracks.video[0];
    const media = M.mediaById(p, clip.mediaId);
    const W = 320, H = Math.round(W * (media.height / media.width) / 2) * 2;
    const cap = document.createElement('canvas'); cap.width = W; cap.height = H;
    const g = cap.getContext('2d', { willReadFrequently: true });
    S.update(pp => { M.findClip(pp, clip.id).stabEnabled = !!opts.stab; }, 'measure');
    Playback.pause();
    await new Promise(r => setTimeout(r, 250));

    const ent = Playback.acquire(clip, media), el = ent.video;
    // vänta tills bildrutan både är sökt OCH presenterad
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
    const srcFps = media.fps || 30, n = opts.frames || 70;
    const frames = [];
    for (let i = 0; i < n; i++) {
      await seekTo(clip.in + 0.5 + i / srcFps);
      S.st.playhead = 0.5 + i / srcFps;
      Playback.renderAt(S.st.playhead, p, { playing: false });
      await new Promise(r => requestAnimationFrame(r));
      Playback.renderAt(S.st.playhead, p, { playing: false });
      g.drawImage(Renderer.canvas, 0, 0, W, H);
      frames.push(g.getImageData(0, 0, W, H));
    }
    const dx = [], dy = [];
    let prev = null, feats = null, idx = 0;
    for (const f of frames) {
      const P = grayPyramid(f, W, H);
      if (prev) {
        if (!feats || feats.length < 14 || idx % 5 === 0) feats = pickFeatures(prev);
        const pts = [], next = [];
        for (const ft of feats) {
          const m = track(prev, P, ft.x, ft.y, ft.hint);
          if (!m) continue;
          pts.push({ x: ft.x, y: ft.y, dx: m.dx, dy: m.dy, w: m.w });
          next.push({ x: Math.round(ft.x + m.dx), y: Math.round(ft.y + m.dy), hint: { dx: m.dx, dy: m.dy } });
        }
        feats = next; idx++;
        const fit = pts.length >= 10 ? fitAffine(pts, W / 2, H / 2) : null;
        if (fit) { const d = decompose(fit.px, fit.py); dx.push(d.tx); dy.push(d.ty); }
        else { dx.push(0); dy.push(0); }
      }
      prev = P;
    }
    const cum = a => { let s = 0; return a.map(v => (s += v)); };
    const X = Float32Array.from(cum(dx)), Y = Float32Array.from(cum(dy));
    const win = Math.max(3, Math.round(srcFps * 0.6));
    const hp = StabAnalyze.highpass, rms = StabAnalyze.rms;
    return {
      shake: Math.hypot(rms(hp(X, win)), rms(hp(Y, win))) * 50,
      jitter: Math.hypot(rms(Float32Array.from(dx)), rms(Float32Array.from(dy))) * 50,
    };
  };
};

(async () => {
  let fails = 0;
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'] });
  for (const krav of KRAV) {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    page.on('pageerror', e => { console.log('  ! pageerror', e.message); fails++; });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForSelector('body[data-ready]');
    await page.addScriptTag({ content: '(' + HARNESS.toString() + ')()' });
    await page.setInputFiles('#fileinput', [path.join(MEDIA, krav.file)]);
    await page.waitForFunction(() => S.project.tracks.video.length >= 1, null, { timeout: 90000 });
    const info = await page.evaluate(async () => {
      const m = S.project.media[0];
      await Stab.analyze(m);
      return { rek: m.stab.report.recommended, täckning: m.stab.report.coverage, fps: m.stab.report.captureFps };
    });
    const off = await page.evaluate(() => window.__measure({ stab: false }));
    const on = await page.evaluate(() => window.__measure({ stab: true }));
    const red = k => (1 - on[k] / off[k]) * 100;
    const s = red('shake'), j = red('jitter');
    const okS = s >= krav.shake, okJ = j >= krav.jitter;
    if (!okS || !okJ) fails++;
    console.log(`${okS && okJ ? '  ✓' : '  ✗'} ${krav.file}  (${info.rek}, ${info.fps} fps infångat, täckning ${info.täckning})`);
    console.log(`      skakning  ${off.shake.toFixed(3)} → ${on.shake.toFixed(3)}   ${s.toFixed(1)} % borta  (krav ${krav.shake} %)${okS ? '' : '   ← FÖR LÅGT'}`);
    console.log(`      ryckighet ${off.jitter.toFixed(3)} → ${on.jitter.toFixed(3)}   ${j.toFixed(1)} % borta  (krav ${krav.jitter} %)${okJ ? '' : '   ← FÖR LÅGT'}`);
    await page.close();
  }
  await browser.close();
  console.log(fails ? `\n${fails} kontroll(er) misslyckades` : '\nStabilisatorn klarar kraven.');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('KRASCH:', e); process.exit(2); });
