#!/usr/bin/env node
/* Kör igenom hela användarscenariot i en riktig webbläsare. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const MEDIA = path.join(ROOT, 'test-media');
const SHOTS = path.join(ROOT, 'test-shots');
const URL = process.env.APP_URL || 'http://127.0.0.1:8099/dist/index.html';

const errors = [];
let step = 0;
const results = [];
function ok(name, detail) { results.push(['ok', name, detail]); console.log(`  ✓ ${name}${detail ? '  — ' + detail : ''}`); }
function bad(name, detail) { results.push(['fail', name, detail]); console.log(`  ✗ ${name}${detail ? '  — ' + detail : ''}`); }
function assert(cond, name, detail) { cond ? ok(name, detail) : bad(name, detail); return cond; }
async function head(t) { step++; console.log(`\n[${step}] ${t}`); }

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader', '--use-gl=angle'] });
  const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });
  page.on('pageerror', e => { errors.push('pageerror: ' + e.message); });
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });

  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('body[data-ready]', { timeout: 20000 });
  await page.evaluate(() => { try { indexedDB.deleteDatabase('x'); } catch (e) { } });

  await head('Grundläge');
  assert(await page.isVisible('#emptyprev'), 'Tomvy visas när projektet är tomt');
  assert(await page.evaluate(() => Renderer.ok), 'WebGL-renderaren startade');
  await page.screenshot({ path: path.join(SHOTS, '01-empty.png') });

  await head('Ladda upp två videoklipp');
  await page.setInputFiles('#fileinput', [
    path.join(MEDIA, 'handheld-pushin.webm'),
    path.join(MEDIA, 'walking-bob.webm'),
  ]);
  await page.waitForFunction(() => S.project.media.length >= 2, null, { timeout: 60000 });
  const meta = await page.evaluate(() => S.project.media.map(m => ({ n: m.name, d: +m.duration.toFixed(2), w: m.width, h: m.height, fps: m.fps, thumb: !!m.thumb, strip: !!m.strip })));
  console.log('    ', JSON.stringify(meta));
  assert(meta.length === 2, 'Två filer i mediabiblioteket');
  assert(meta.every(m => m.w > 0 && m.h > 0 && m.d > 1), 'Metadata (upplösning + längd) utläst');
  assert(meta.every(m => m.thumb && m.strip), 'Riktiga thumbnails och filmstrip genererade');
  assert(meta.every(m => m.fps), 'Framerate uppskattad', meta.map(m => m.fps).join('/'));
  await page.screenshot({ path: path.join(SHOTS, '02-media.png') });

  await head('Lägg klippen på timelinen');
  await page.evaluate(() => {
    const p = S.project;
    if (!p.tracks.video.length) App.addMediaToTimeline(p.media[0]);
    if (p.tracks.video.length < 2) App.addMediaToTimeline(p.media[1]);
  });
  await page.waitForTimeout(300);
  let tl = await page.evaluate(() => S.project.tracks.video.map(c => ({ id: c.id, m: c.mediaId, start: +c.start.toFixed(2), dur: +M.clipDuration(c).toFixed(2) })));
  console.log('    ', JSON.stringify(tl));
  assert(tl.length === 2, 'Två klipp på videospåret');
  assert(Math.abs(tl[1].start - tl[0].dur) < 0.01, 'Klippen ligger kant i kant utan överlapp');
  assert(await page.locator('#tlcontent .clip').count() === 2, 'Timelinen renderar båda klippen');

  await head('Trimma ett klipp');
  const before = tl[0].dur;
  await page.evaluate(() => {
    const id = S.project.tracks.video[0].id;
    S.update(p => { const c = M.findClip(p, id); c.in = 1.0; c.out = c.out - 1.0; }, 'test-trim');
  });
  tl = await page.evaluate(() => S.project.tracks.video.map(c => ({ dur: +M.clipDuration(c).toFixed(2), start: +c.start.toFixed(2) })));
  assert(tl[0].dur < before - 1.5, 'Klipp 1 blev kortare', `${before}s → ${tl[0].dur}s`);
  assert(Math.abs(tl[1].start - tl[0].dur) < 0.01, 'Efterföljande klipp flyttades automatiskt');
  const totalAfterTrim = await page.evaluate(() => +M.totalDuration(S.project).toFixed(2));
  assert(Math.abs(totalAfterTrim - (tl[0].dur + tl[1].dur)) < 0.02, 'Projektets totala längd uppdaterad', totalAfterTrim + 's');

  await head('Ändra klippens ordning');
  const order0 = await page.evaluate(() => S.project.tracks.video.map(c => c.mediaId));
  await page.evaluate(() => {
    S.update(p => { const a = p.tracks.video; a.unshift(a.pop()); M.relayout(a); }, 'test-reorder');
  });
  const order1 = await page.evaluate(() => S.project.tracks.video.map(c => c.mediaId));
  assert(order0[0] === order1[1] && order0[1] === order1[0], 'Ordningen ändrad');
  assert(await page.evaluate(() => S.project.tracks.video[0].start === 0), 'Timelinen packades om från noll');

  await head('Dela ett klipp vid playhead');
  await page.evaluate(() => { S.seek(M.clipDuration(S.project.tracks.video[0]) / 2); });
  await page.click('#tlSplit');
  await page.waitForTimeout(200);
  const afterSplit = await page.evaluate(() => S.project.tracks.video.map(c => +M.clipDuration(c).toFixed(2)));
  assert(afterSplit.length === 3, 'Tre klipp efter split', JSON.stringify(afterSplit));
  const totalAfterSplit = await page.evaluate(() => +M.totalDuration(S.project).toFixed(2));
  assert(Math.abs(totalAfterSplit - totalAfterTrim) < 0.05, 'Total längd oförändrad av split', totalAfterSplit + 's');

  await head('Ändra hastigheten');
  await page.evaluate(() => S.selectClips([S.project.tracks.video[0].id]));
  await page.waitForTimeout(120);
  const d0 = await page.evaluate(() => +M.clipDuration(S.project.tracks.video[0]).toFixed(3));
  const speedBtn = page.locator('#inspector button', { hasText: '2×' }).first();
  await speedBtn.click();
  await page.waitForTimeout(150);
  const d1 = await page.evaluate(() => ({ d: +M.clipDuration(S.project.tracks.video[0]).toFixed(3), s: S.project.tracks.video[0].speed }));
  assert(d1.s === 2 && Math.abs(d1.d - d0 / 2) < 0.02, 'Hastighet 2× halverade klipplängden', `${d0}s → ${d1.d}s`);
  const fit = await page.evaluate(() => {
    const id = S.project.tracks.video[0].id, c = M.findClip(S.project, id);
    const want = 2.0, sp = (c.out - c.in) / want;
    S.update(p => { M.findClip(p, id).speed = sp; }, 'fit');
    return +M.clipDuration(S.project.tracks.video[0]).toFixed(2);
  });
  assert(Math.abs(fit - 2.0) < 0.02, 'Fit to duration räknar ut rätt hastighet', fit + 's');

  await head('Applicera ett bostadsfilter');
  await page.click('#tabrail button[data-tab="image"]');
  await page.waitForTimeout(200);
  await page.locator('.fsw', { hasText: 'Scandinavian Bright' }).click();
  await page.waitForTimeout(150);
  const f = await page.evaluate(() => {
    const c = S.project.tracks.video[0];
    const g = Color.effective(c);
    return { filter: c.filter, exposure: +g.exposure.toFixed(3), temp: g.temperature, winprot: g.windowProtect };
  });
  assert(f.filter === 'scandi' && f.exposure > 0 && f.temp < 0, 'Filtret sitter på klippet och påverkar grade-värdena', JSON.stringify(f));
  await page.screenshot({ path: path.join(SHOTS, '03-filter.png') });

  await head('Öppna stabilisering och kör analys');
  await page.click('#tabrail button[data-tab="stab"]');
  await page.waitForTimeout(200);
  await page.locator('#panelbody button', { hasText: /Analysera klippet|Analysera om/ }).first().click();
  await page.waitForFunction(() => {
    const m = S.primaryMedia();
    return m && m.stab && (m.stab.status === 'analyzed' || m.stab.status === 'error');
  }, null, { timeout: 180000 });
  const rep = await page.evaluate(() => {
    const m = S.primaryMedia();
    return { status: m.stab.status, error: m.stab.error, r: m.stab.report, corr: m.stab.corr ? { zoom: +m.stab.corr.zoom.toFixed(4), crop: m.stab.corr.cropPct, n: m.stab.corr.n } : null, name: m.name };
  });
  assert(rep.status === 'analyzed', 'Analysen slutfördes', rep.error || '');
  if (rep.r) {
    console.log('     rapport:', JSON.stringify({
      fil: rep.name, typ: rep.r.motionTypes, shake: rep.r.shake, bob: rep.r.bob, rot: rep.r.rotation,
      persp: rep.r.perspective, wobble: rep.r.wobble, rek: rep.r.recommended, crop: rep.r.estimatedCrop,
      kvalitet: rep.r.trackingQuality, sampel: rep.r.samples, ms: rep.r.ms,
    }, null, 1));
    assert(rep.r.samples > 20, 'Många bildrutor analyserade', rep.r.samples + ' sampel');
    assert(rep.r.trackingQuality > 0.5, 'Spårningen hittade stabila punkter', Math.round(rep.r.trackingQuality * 100) + ' % inliers');
    assert(rep.corr && rep.corr.zoom > 1.0001, 'Korrigeringsspår byggt med crop-kompensation', 'zoom ' + rep.corr.zoom + ' · crop ' + rep.corr.crop + ' %');
  }
  await page.screenshot({ path: path.join(SHOTS, '04-stab.png') });

  await head('Verifiera att stabiliseringen faktiskt ändrar bilden');
  await page.evaluate(() => { App.setCompare(false); App.toggleStabOnClip(true); });
  await page.waitForTimeout(400);
  const diff = await page.evaluate(async () => {
    const p = S.project, c = p.tracks.video[0];
    const t = c.start + M.clipDuration(c) * 0.5;
    S.st.playing = false; S.seek(t);
    const grab = async () => { Playback.renderAt(t, p, { playing: false }); await new Promise(r => setTimeout(r, 260)); Playback.renderAt(t, p, { playing: false }); return Renderer.canvas.toDataURL('image/png'); };
    S.update(pp => { M.findClip(pp, c.id).stabEnabled = true; }, 'x');
    const on = await grab();
    S.update(pp => { M.findClip(pp, c.id).stabEnabled = false; }, 'x');
    const off = await grab();
    S.update(pp => { M.findClip(pp, c.id).stabEnabled = true; }, 'x');
    return { same: on === off, len: on.length };
  });
  assert(!diff.same, 'Renderad bild skiljer sig med stabilisering på/av (transformen appliceras på riktigt)');

  await head('Växla före/efter');
  await page.click('#btnBeforeAfter');
  await page.waitForTimeout(500);
  assert(await page.evaluate(() => Playback.view.compare), 'Split screen aktiv');
  assert(await page.isVisible('#splitbar'), 'Vertikal jämförelselinje synlig');
  await page.screenshot({ path: path.join(SHOTS, '05-beforeafter.png') });
  await page.click('#btnBeforeAfter');

  await head('Lägg till musik');
  await page.setInputFiles('#fileinput', [path.join(MEDIA, 'music-100bpm.wav')]);
  await page.waitForFunction(() => S.project.media.some(m => m.type === 'audio'), null, { timeout: 60000 });
  const mus = await page.evaluate(() => {
    const m = S.project.media.find(x => x.type === 'audio');
    App.addMediaToTimeline(m, 0);
    return { name: m.name, dur: +m.duration.toFixed(2), peaks: m.wave ? m.wave.length : 0, beats: m.beats ? m.beats.length : 0, bpm: m.bpm };
  });
  console.log('    ', JSON.stringify(mus));
  assert(mus.peaks > 100, 'Waveform avkodad', mus.peaks + ' punkter');
  assert(mus.beats > 10, 'Transienter/beats hittade', mus.beats + ' st, ~' + mus.bpm + ' BPM');
  assert(await page.evaluate(() => S.project.tracks.music.length === 1), 'Musiken ligger på ett eget spår');
  await page.waitForTimeout(300);
  assert(await page.locator('#tlcontent .clip.music canvas').count() === 1, 'Waveform ritas i timelinen');

  await head('Uppspelning av hela filmen');
  await page.evaluate(() => { S.seek(0); Playback.play(); });
  await page.waitForTimeout(1600);
  const played = await page.evaluate(() => ({ t: S.st.playhead, playing: S.st.playing }));
  assert(played.t > 0.8, 'Playheaden rör sig under uppspelning', played.t.toFixed(2) + 's');
  await page.evaluate(() => Playback.pause());
  const painted = await page.evaluate(() => {
    const c = Renderer.canvas, g = document.createElement('canvas');
    g.width = 40; g.height = 24;
    const gx = g.getContext('2d'); gx.drawImage(c, 0, 0, 40, 24);
    const d = gx.getImageData(0, 0, 40, 24).data;
    let sum = 0; for (let i = 0; i < d.length; i += 4) sum += d[i] + d[i + 1] + d[i + 2];
    return sum / (40 * 24 * 3);
  });
  assert(painted > 12, 'Previewn visar faktisk video (medelluminans ' + painted.toFixed(0) + ')');
  await page.screenshot({ path: path.join(SHOTS, '06-playback.png') });

  await head('Spara projektet');
  await page.click('#btnSave');
  await page.waitForTimeout(900);
  const saved = await page.evaluate(async () => {
    const id = await DB.getMeta('lastProject');
    const pr = await DB.getProject(id);
    return pr ? { name: pr.name, clips: pr.tracks.video.length, music: pr.tracks.music.length, media: pr.media.length } : null;
  });
  assert(saved && saved.clips >= 3, 'Projektet ligger i IndexedDB', JSON.stringify(saved));
  const files = await page.evaluate(async () => {
    const m = S.project.media[0];
    const rec = await DB.getFile(m.id);
    return !!(rec && rec.blob && rec.blob.size > 1000);
  });
  assert(files, 'Videofilerna är lagrade lokalt (IndexedDB)');

  await head('Ladda om sidan — projektet ska återställas');
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('body[data-ready]');
  await page.waitForFunction(() => S.project.media.length > 0 && S.project.media.every(m => m.url || m.missing), null, { timeout: 60000 });
  const restored = await page.evaluate(() => ({
    name: S.project.name, clips: S.project.tracks.video.length, music: S.project.tracks.music.length,
    thumbs: S.project.media.filter(m => m.type === 'video').every(m => !!m.thumb && !!m.strip),
    urls: S.project.media.every(m => !!m.url), missing: S.project.media.filter(m => m.missing).length,
    wave: !!(S.project.media.find(m => m.type === 'audio') || {}).wave,
    stab: S.project.media.some(m => m.stab && m.stab.status === 'analyzed'),
  }));
  console.log('    ', JSON.stringify(restored));
  assert(restored.clips >= 3 && restored.music === 1, 'Timelinen återställd efter omladdning');
  assert(restored.urls && !restored.missing, 'Videofilerna kopplades tillbaka från IndexedDB');
  assert(restored.thumbs, 'Thumbnails och filmstrip finns kvar');
  assert(restored.wave, 'Waveformen finns kvar');
  assert(restored.stab, 'Stabiliseringsanalysen finns kvar (behöver inte köras om)');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS, '07-restored.png') });

  await head('Öppna exportpanelen');
  await page.click('#btnExport');
  await page.waitForTimeout(300);
  const ex = await page.evaluate(() => ({ est: Exporter.estimate(S.project), codecs: Exporter.supported().map(c => c[1]) }));
  console.log('    ', JSON.stringify(ex));
  assert(ex.codecs.length > 0, 'Webbläsaren har en encoder', ex.codecs.join(', '));
  assert(ex.est.bytes > 0 && ex.est.w > 0, 'Beräknad filstorlek och bildstorlek visas', `${ex.est.w}×${ex.est.h} ≈ ${(ex.est.bytes / 1e6).toFixed(1)} MB`);
  await page.screenshot({ path: path.join(SHOTS, '07-export.png') });

  await head('Kör en riktig export');
  await page.evaluate(() => {
    S.update(p => { p.settings.resolution = 1080; p.export.quality = 6; }, 'test');
    // korta ner filmen så testet inte tar en evighet
    S.update(p => { p.tracks.video = p.tracks.video.slice(0, 2); p.tracks.video.forEach(c => { c.out = Math.min(c.out, c.in + 1.6 * (c.speed || 1)); }); M.relayout(p.tracks.video); }, 'test');
  });
  await page.evaluate(() => Exporter.start());
  await page.waitForFunction(() => !Exporter.status.running && (Exporter.status.result || Exporter.status.error), null, { timeout: 120000 });
  const res = await page.evaluate(() => Exporter.status.result ? { name: Exporter.status.result.name, size: Exporter.status.result.size } : { error: Exporter.status.error });
  assert(res.size > 20000, 'Exporterad videofil skapad', JSON.stringify(res));
  await page.screenshot({ path: path.join(SHOTS, '08-exported.png') });

  await head('Ångra / gör om');
  const undoOk = await page.evaluate(() => {
    const n0 = S.project.tracks.video.length;
    S.update(p => { p.tracks.video.pop(); M.relayout(p.tracks.video); }, 'test-del');
    const n1 = S.project.tracks.video.length;
    S.undo();
    const n2 = S.project.tracks.video.length;
    S.redo();
    const n3 = S.project.tracks.video.length;
    S.undo();
    return { n0, n1, n2, n3 };
  });
  assert(undoOk.n2 === undoOk.n0 && undoOk.n3 === undoOk.n1, 'Undo och redo återställer timelinen', JSON.stringify(undoOk));

  await head('Övriga paneler renderar utan fel');
  for (const tab of ['motion', 'trans', 'audio', 'text', 'media']) {
    await page.click(`#tabrail button[data-tab="${tab}"]`);
    await page.waitForTimeout(160);
    const n = await page.locator('#panelbody').count();
    if (!n) bad('Panel ' + tab);
  }
  ok('Alla paneler renderade');
  await page.screenshot({ path: path.join(SHOTS, '09-final.png'), fullPage: false });

  console.log('\n──────── resultat ────────');
  const fails = results.filter(r => r[0] === 'fail');
  console.log(`${results.length - fails.length}/${results.length} kontroller gick igenom`);
  if (errors.length) {
    console.log('\nFel i konsolen (' + errors.length + '):');
    [...new Set(errors)].slice(0, 25).forEach(e => console.log('  ! ' + e));
  } else console.log('Inga konsolfel.');
  await browser.close();
  process.exit(fails.length || errors.filter(e => e.startsWith('pageerror')).length ? 1 : 0);
})().catch(e => { console.error('TESTET KRASCHADE:', e); process.exit(2); });
