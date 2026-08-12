#!/usr/bin/env node
/* Jämför stabiliseringsanalysen mot den kända rörelsen i testklippen. */
const { chromium } = require('playwright');
const path = require('path');
const URL = process.env.APP_URL || 'http://127.0.0.1:8099/dist/index.html';
const MEDIA = path.join(__dirname, '..', 'test-media');
const file = process.argv[2] || 'walking-bob.webm';

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('pageerror', e.message));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('body[data-ready]');
  await page.setInputFiles('#fileinput', [path.join(MEDIA, file)]);
  await page.waitForFunction(() => S.project.media.length >= 1, null, { timeout: 60000 });
  const out = await page.evaluate(async () => {
    const m = S.project.media[0];
    const { traj, report, deltas } = await StabAnalyze.analyze(m, { maxSamples: 200 });
    const st = a => { const n = a.length; const mu = a.reduce((x, y) => x + y, 0) / n; const sd = Math.sqrt(a.reduce((x, y) => x + (y - mu) ** 2, 0) / n); return { mu: +mu.toFixed(6), sd: +sd.toFixed(6) }; };
    return {
      name: m.name, fps: +traj.fps.toFixed(2), n: traj.n,
      dx: st(deltas.dx), dy: st(deltas.dy), drot: st(deltas.drot), dscale: st(deltas.dscale), dshear: st(deltas.dshear),
      cum: {
        tx: +traj.tx[traj.n - 1].toFixed(4), ty: +traj.ty[traj.n - 1].toFixed(4),
        rot: +(traj.rot[traj.n - 1] * 180 / Math.PI).toFixed(3),
        scale: +((Math.exp(traj.scale[traj.n - 1]) - 1) * 100).toFixed(2),
        shear: +traj.shear[traj.n - 1].toFixed(4),
      },
      rangeY: +(Math.max(...traj.ty) - Math.min(...traj.ty)).toFixed(4),
      rangeScale: +((Math.exp(Math.max(...traj.scale) - Math.min(...traj.scale)) - 1) * 100).toFixed(2),
      rangeShear: +(Math.max(...traj.shear) - Math.min(...traj.shear)).toFixed(4),
      ms: report.ms, samples: report.samples, inliers: +report.trackingQuality.toFixed(2), wobble: report.wobble,
      wobbleScore: +report.wobble.score.toFixed(2), rec: report.recommended, crop: report.estimatedCrop,
      bob: report.bob, shake: report.shake.pct,
    };
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
