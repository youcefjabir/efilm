#!/usr/bin/env node
/* Kör hela Motion-flödet i en riktig webbläsare: bilder → musik → analys →
   regi → generering → projekt → Master Editor. Använder den lokala providern
   så att inga credits spenderas. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const PHOTOS = path.join(ROOT, 'test-photos');
const MEDIA = path.join(ROOT, 'test-media');
const SHOTS = path.join(ROOT, 'test-shots');
const URL = process.env.APP_URL || 'http://127.0.0.1:8099/dist/index.html';

const errors = [];
let step = 0, fails = 0;
const ok = (n, d) => console.log(`  ✓ ${n}${d ? '  — ' + d : ''}`);
const bad = (n, d) => { fails++; console.log(`  ✗ ${n}${d ? '  — ' + d : ''}`); };
const check = (c, n, d) => c ? ok(n, d) : bad(n, d);
const head = t => console.log(`\n[${++step}] ${t}`);

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const truth = JSON.parse(fs.readFileSync(path.join(PHOTOS, 'truth.json'), 'utf8'));
  const files = truth.map(t => path.join(PHOTOS, t.file));

  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('body[data-ready]');

  head('Öppna Motion');
  await page.click('#btnMotion');
  await page.waitForSelector('#motionview', { state: 'visible' });
  check(await page.isVisible('.mo-steps'), 'Motion-vyn öppnas med tre steg');
  await page.screenshot({ path: path.join(SHOTS, 'm1-images.png') });

  head('Importera bostadsbilder');
  await page.setInputFiles('#motionfiles', files);
  await page.waitForFunction(n => Motion.st.images.length >= n, truth.length, { timeout: 90000 });
  const imgs = await page.evaluate(() => Motion.st.images.map(m => ({ n: m.name, w: m.width, thumb: !!m.thumb })));
  check(imgs.length === truth.length, `${truth.length} bilder importerade`);
  check(imgs.every(i => i.w > 0 && i.thumb), 'Alla bilder har mått och thumbnail');
  await page.screenshot({ path: path.join(SHOTS, 'm2-images.png') });

  head('Bildanalys och rumsgruppering');
  const cls = await page.evaluate(async () => {
    const ia = await ImageAnalyze.analyzeAll(Motion.st.images);
    const list = Motion.st.images.map(m => ia.get(m.id));
    ImageAnalyze.clusterRooms(list);
    Motion.st.imageAnalysis = ia;
    return Motion.st.images.map((m, i) => ({
      name: m.name, scene: list[i].scene, cid: list[i].clusterId,
      hero: list[i].heroScore, ext: list[i].isExterior, detail: list[i].isDetail,
    }));
  });
  const map = new Map(truth.map(t => [t.file, t.room]));
  console.log('    ' + cls.map(c => `${c.name.replace('.jpg', '')}→${c.cid}`).join('  '));
  const outdoorTruth = f => ['exterior', 'drone', 'garden'].includes(map.get(f));
  const splitOk = cls.filter(c => outdoorTruth(c.name) === c.ext).length;
  check(splitOk === cls.length, `Ute/inne stämmer för ${splitOk}/${cls.length}`);
  check(cls.filter(c => c.ext).length >= 3, 'Exteriörer identifierade', cls.filter(c => c.ext).length + ' st');
  check(cls.every(c => c.hero >= 0 && c.hero <= 1), 'Hero-poäng inom [0,1]');
  // samma rum från två vinklar ska hamna i samma grupp
  let pairsOk = 0, pairs = 0;
  for (let i = 0; i < cls.length; i++) for (let j = i + 1; j < cls.length; j++) {
    if (outdoorTruth(cls[i].name) || map.get(cls[i].name) !== map.get(cls[j].name)) continue;
    pairs++; if (cls[i].cid === cls[j].cid) pairsOk++;
  }
  check(pairsOk === pairs, 'Samma rum från olika vinklar grupperas ihop', `${pairsOk}/${pairs} par`);

  head('Välj musik');
  await page.click('.mo-foot .btn.primary');
  await page.waitForTimeout(300);
  await page.evaluate(() => { Motion.st.targetDuration = 30; });
  await page.locator('.mo-styles .preset-card', { hasText: 'Nordic Calm' }).locator('.btn').click();
  await page.waitForFunction(() => !!Motion.st.music, null, { timeout: 120000 });
  check(await page.evaluate(() => !!Motion.st.music), 'Låten skapad och vald');
  check(await page.evaluate(() => !!Motion.st.music.composed), 'Låten bär med sig sin exakta struktur');
  await page.screenshot({ path: path.join(SHOTS, 'm3-music.png') });

  head('Musikanalys');
  const ma = await page.evaluate(() => {
    const a = MusicStructure.analyze(Motion.st.music);
    return {
      bpm: a.bpm, beats: a.beats.length, downbeats: a.downbeats.length, bars: a.bars.length,
      phrases: a.phrases.length, sections: a.sections.map(s => s.type),
      cuts: a.cutPoints.length, kinds: [...new Set(a.cutPoints.map(c => c.kind))],
    };
  });
  console.log('    ', JSON.stringify(ma));
  check(ma.bpm === 80, 'Tempot är exakt känt', ma.bpm + ' BPM');
  check(ma.downbeats > 4 && ma.bars > 4, 'Takter och downbeats hittade');
  check(ma.phrases >= 2, 'Fraser identifierade', ma.phrases + ' st');
  check(ma.sections.length >= 2, 'Sektioner identifierade', ma.sections.join(','));
  check(ma.sections.includes('intro'), 'Intro hittat');
  check(ma.cuts > 10 && ma.kinds.includes('section'), 'Klipppunkter med typ', ma.kinds.join(','));

  head('Regissören bygger planen');
  await page.evaluate(() => { Motion.st.targetDuration = 30; Motion.st.provider = 'local'; });
  await page.click('.mo-foot .btn.primary');
  await page.waitForFunction(() => Motion.st.step === 'plan', null, { timeout: 120000 });
  const plan = await page.evaluate(() => {
    const p = Motion.st.plan;
    return {
      shots: p.shots.length, duration: p.duration, rationale: p.rationale, dropped: p.droppedImages,
      list: p.shots.map(s => ({ i: s.index, room: s.roomType, role: s.role, mv: s.movementId, in: s.timelineIn, out: s.timelineOut, gen: s.generatedDuration, sIn: s.sourceIn, sOut: s.sourceOut })),
      errs: Motion.st.planErrors,
    };
  });
  console.log('    ', plan.rationale);
  plan.list.forEach(s => console.log(`     ${String(s.i + 1).padStart(2)} ${s.room.padEnd(11)} ${s.role.padEnd(7)} ${s.mv.padEnd(20)} ${s.in}–${s.out}s  genererar ${s.gen}s @ ${s.sIn}–${s.sOut}`));
  check(plan.shots >= 5, 'Planen har shots', plan.shots + ' st');
  check(!plan.errs || !plan.errs.length, 'Planen validerar', (plan.errs || []).join('; '));

  head('Regiregler');
  let repeats = 0;
  for (let i = 1; i < plan.list.length; i++) if (plan.list[i].mv === plan.list[i - 1].mv) repeats++;
  check(repeats === 0, 'Ingen kamerarörelse upprepas direkt', repeats + ' upprepningar');
  const uniqueMoves = new Set(plan.list.map(s => s.mv)).size;
  check(uniqueMoves >= 3, 'Flera olika rörelser används', uniqueMoves + ' olika');
  const gaps = plan.list.every((s, i) => i === 0 ? s.in === 0 : Math.abs(s.in - plan.list[i - 1].out) < 0.02);
  check(gaps, 'Timelinen är sammanhängande utan glapp');
  const durOk = plan.list.every(s => (s.out - s.in) >= 1.5 && (s.out - s.in) <= 8);
  check(durOk, 'Alla shots har rimlig längd');
  const genOk = plan.list.every(s => s.gen >= 3 && s.gen <= 15 && Number.isInteger(s.gen) && s.sOut - s.sIn <= s.gen + 0.01);
  check(genOk, 'Genereringslängder följer modellens gränser och rymmer segmentet');
  const onMusic = await page.evaluate(() => {
    const ma = MusicStructure.analyze(Motion.st.music);
    return Motion.st.plan.shots.slice(0, -1).filter(s =>
      ma.cutPoints.some(c => Math.abs(c.t - s.timelineOut) < 0.08)).length;
  });
  check(onMusic === plan.shots - 1, 'Alla klipp ligger på musikaliska punkter', `${onMusic}/${plan.shots - 1}`);
  const firstIsExt = plan.list[0].room === 'exterior' || plan.list[0].room === 'drone' || plan.list[0].role === 'hero';
  check(firstIsExt, 'Filmen öppnar med en etableringsbild', plan.list[0].room);
  const genDefault = plan.list.every(s => s.gen >= 3 && s.gen <= 5);
  check(genDefault, 'Genereringen håller sig kring 3 s', [...new Set(plan.list.map(s => s.gen))].join('/') + ' s');
  const noAudio = await page.evaluate(() => MM.newJob(Motion.st.plan.shots[0], 'higgsfield_kling3', '16:9').params);
  check(noAudio.sound === 'off', 'Kling genererar utan ljud — musiken läggs på i editorn');
  check(noAudio.duration === plan.list[0].gen && Number.isInteger(noAudio.duration), 'Jobbet får planens längd i heltalssekunder');
  await page.screenshot({ path: path.join(SHOTS, 'm4-plan.png'), fullPage: true });

  head('Kostnadsberäkning');
  const cost = await page.evaluate(() => ({
    local: MM.planCost(Motion.st.plan, 'local'),
    kling: MM.planCost(Motion.st.plan, 'higgsfield_kling3'),
    perShot: MM.shotCost('higgsfield_kling3', 5),
  }));
  check(cost.local === 0, 'Lokal rendering kostar inget');
  check(cost.perShot === 7.5 && cost.kling > 0, 'Kling-kostnad räknas per shot', `${cost.kling} credits totalt`);

  head('Generering med lokal provider');
  await page.evaluate(() => Motion.runGeneration());
  await page.waitForFunction(() => Motion.st.step === 'done' || Motion.st.step === 'plan', null, { timeout: 300000 });
  const res = await page.evaluate(() => Motion.st.result ? {
    shots: Motion.st.result.results.length,
    clips: Motion.st.result.project.tracks.video.length,
    music: Motion.st.result.project.tracks.music.length,
    dur: M.totalDuration(Motion.st.result.project),
    qc: Motion.st.result.results.map(r => ({ pass: r.shot.qc && r.shot.qc.pass, stab: !!r.shot.needsStabilization })),
    sizes: Motion.st.result.results.map(r => r.media.duration),
    hasMotionDoc: !!Motion.st.result.project.motion,
  } : null);
  check(!!res, 'Genereringen slutfördes');
  if (res) {
    console.log('    ', JSON.stringify({ shots: res.shots, clips: res.clips, dur: +res.dur.toFixed(2), qcPass: res.qc.filter(q => q.pass).length }));
    check(res.clips === res.shots && res.clips > 0, 'Alla shots blev klipp på timelinen');
    check(res.music === 1, 'Musiken ligger på musikspåret');
    check(res.sizes.every(d => d > 1), 'Varje genererat klipp är en riktig videofil');
    check(res.hasMotionDoc, 'Director Plan sparas i projektet');
    check(Math.abs(res.dur - plan.duration) < 1.5, 'Filmens längd följer planen', `${res.dur.toFixed(1)}s mot ${plan.duration}s`);
  }
  await page.screenshot({ path: path.join(SHOTS, 'm5-done.png') });

  head('Öppna i Master Editor');
  await page.locator('.mo-foot .btn.primary', { hasText: 'Master Editor' }).click();
  await page.waitForTimeout(1200);
  const ed = await page.evaluate(() => ({
    hidden: getComputedStyle(document.getElementById('motionview')).display,
    clips: S.project.tracks.video.length,
    shotIds: S.project.tracks.video.filter(c => c.shotId).length,
    motion: !!S.project.motion,
    tlClips: document.querySelectorAll('#tlcontent .tltrack.video .clip').length,
  }));
  check(ed.hidden === 'none', 'Motion-vyn stängs');
  check(ed.clips > 0 && ed.tlClips === ed.clips, 'Klippen ligger i editorns timeline', ed.clips + ' klipp');
  check(ed.shotIds === ed.clips, 'Varje klipp är kopplat till sin shot');
  check(ed.motion, 'Projektet bär med sig Director Plan');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS, 'm6-editor.png') });

  head('Filmen går att spela upp');
  await page.evaluate(() => { S.seek(0); Playback.play(); });
  await page.waitForTimeout(1800);
  const played = await page.evaluate(() => {
    const c = Renderer.canvas, g = document.createElement('canvas');
    g.width = 40; g.height = 24;
    const gx = g.getContext('2d'); gx.drawImage(c, 0, 0, 40, 24);
    const d = gx.getImageData(0, 0, 40, 24).data;
    let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2];
    return { t: S.st.playhead, lum: s / (40 * 24 * 3) };
  });
  await page.evaluate(() => Playback.pause());
  check(played.t > 1, 'Playheaden rör sig', played.t.toFixed(2) + 's');
  check(played.lum > 12, 'Previewn visar bild', 'medelluminans ' + played.lum.toFixed(0));

  console.log('\n──────── resultat ────────');
  console.log(fails ? `${fails} kontroller misslyckades` : 'Alla kontroller gick igenom');
  if (errors.length) { console.log('Konsolfel:'); [...new Set(errors)].slice(0, 12).forEach(e => console.log('  ! ' + e)); }
  else console.log('Inga konsolfel.');
  await browser.close();
  process.exit(fails || errors.filter(e => e.startsWith('pageerror')).length ? 1 : 0);
})().catch(e => { console.error('KRASCH:', e); process.exit(2); });
