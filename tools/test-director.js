#!/usr/bin/env node
/* Mäter det användaren faktiskt klagade på:
     1. hamnar samma rum i samma grupp, även från en annan vinkel?
     2. får en drönarbild aldrig en sidled-slide?
     3. går längd och kamerarörelse att ändra, och följer resten med?
     4. skapar appen låtar med exakta klipplägen?
   Inget här mäter att "något ändrades" — allt mäts mot facit. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const PHOTOS = path.join(ROOT, 'test-photos');
const URL = process.env.APP_URL || 'http://127.0.0.1:8099/dist/index.html';

let fails = 0, step = 0;
const ok = (n, d) => console.log(`  ✓ ${n}${d ? '  — ' + d : ''}`);
const bad = (n, d) => { fails++; console.log(`  ✗ ${n}${d ? '  — ' + d : ''}`); };
const check = (c, n, d) => c ? ok(n, d) : bad(n, d);
const head = t => console.log(`\n[${++step}] ${t}`);

(async () => {
  const truth = JSON.parse(fs.readFileSync(path.join(PHOTOS, 'truth.json'), 'utf8'));
  const files = truth.map(t => path.join(PHOTOS, t.file));
  const errors = [];

  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('body[data-ready]');
  await page.click('#btnMotion');
  await page.setInputFiles('#motionfiles', files);
  await page.waitForFunction(n => Motion.st.images.length >= n, truth.length, { timeout: 90000 });

  head('Rumsgruppering mot facit');
  const grp = await page.evaluate(async () => {
    const ia = await ImageAnalyze.analyzeAll(Motion.st.images);
    const list = Motion.st.images.map(m => ia.get(m.id)).filter(Boolean);
    ImageAnalyze.clusterRooms(list);
    const pairs = [];
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++)
        pairs.push({
          a: Motion.st.images[i].name, b: Motion.st.images[j].name,
          same: list[i].clusterId === list[j].clusterId,
          score: ImageAnalyze.sameRoomScore(list[i], list[j]),
        });
    Motion.st.imageAnalysis = ia;
    return {
      pairs,
      assign: Motion.st.images.map((m, i) => ({ name: m.name, cid: list[i].clusterId, scene: list[i].scene })),
    };
  });
  const roomOf = new Map(truth.map(t => [t.file, t.room]));
  const outdoor = r => ['exterior', 'drone', 'garden'].includes(r);
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (const p of grp.pairs) {
    const ra = roomOf.get(p.a), rb = roomOf.get(p.b);
    // exteriörbilder grupperas medvetet efter ute/drönare, inte per motiv
    if (outdoor(ra) || outdoor(rb)) continue;
    const want = ra === rb;
    if (want && p.same) tp++; else if (want && !p.same) fn++;
    else if (!want && p.same) fp++; else tn++;
  }
  console.log('    ' + grp.assign.map(a => `${a.name.replace('.jpg', '')}→${a.cid}`).join('  '));
  console.log(`    par: ${tp} rätt ihop, ${fn} felaktigt isär, ${fp} felaktigt ihop, ${tn} rätt isär`);
  check(fn === 0, 'Samma rum från olika vinklar hamnar i samma grupp', `${tp}/${tp + fn} par`);
  check(fp === 0, 'Olika rum blandas inte ihop', `${fp} felaktiga sammanslagningar`);
  const worstSame = grp.pairs.filter(p => roomOf.get(p.a) === roomOf.get(p.b) && !outdoor(roomOf.get(p.a)))
    .reduce((a, p) => Math.min(a, p.score), 1);
  const bestDiff = grp.pairs.filter(p => roomOf.get(p.a) !== roomOf.get(p.b) && !outdoor(roomOf.get(p.a)) && !outdoor(roomOf.get(p.b)))
    .reduce((a, p) => Math.max(a, p.score), 0);
  console.log(`    lägsta poäng inom ett rum ${worstSame}, högsta mellan olika rum ${bestDiff}`);
  check(worstSame > bestDiff, 'Måttet separerar samma rum från olika rum', `marginal ${(worstSame - bestDiff).toFixed(3)}`);

  head('Skapad låt');
  const mus = await page.evaluate(async () => {
    const t0 = performance.now();
    const m = await MusicMake.makeTrack('nordic', 45);
    const ms = performance.now() - t0;
    S.update(p => { p.media.push(m); }, 'test');
    Motion.st.music = m;
    const a = MusicStructure.analyze(m);
    return {
      ms: Math.round(ms), dur: m.duration, bpm: a.bpm, bar: a.barSeconds,
      cuts: a.cutPoints.length, kinds: [...new Set(a.cutPoints.map(c => c.kind))],
      sections: a.sections.map(s => s.type), composed: !!a.composed,
      offGrid: a.cutPoints.filter(c => {
        const k = c.t / (a.beatPeriod / 2);
        return Math.abs(k - Math.round(k)) > 0.002;
      }).length,
      silent: m.wave.reduce((s, v) => s + v, 0) / m.wave.length,
    };
  });
  console.log('    ', JSON.stringify(mus));
  check(mus.composed, 'Låten bär med sig sin exakta struktur');
  check(mus.bpm === 80 && Math.abs(mus.bar - 3) < 0.001, 'Tempot är exakt, inte uppskattat', `${mus.bpm} BPM, takt ${mus.bar}s`);
  check(mus.dur >= 45, 'Låten räcker till hela filmen', mus.dur.toFixed(1) + 's');
  check(mus.offGrid === 0, 'Alla klipplägen ligger exakt på rutnätet');
  check(mus.sections.includes('intro') && mus.sections.includes('peak'), 'Låten har intro, peak och avslut', mus.sections.join(','));
  check(mus.silent > 30, 'Låten innehåller riktigt ljud', 'medelamplitud ' + mus.silent.toFixed(0));
  check(mus.ms < 20000, 'Komponeringen tar rimlig tid', mus.ms + ' ms');

  head('Planen och kamerarörelserna');
  const plan = await page.evaluate(() => {
    Motion.st.musicAnalysis = MusicStructure.analyze(Motion.st.music);
    Motion.st.targetDuration = 45;
    Motion.st.provider = 'local';
    Motion.st.plan = Director.buildPlan({
      assets: Motion.st.images, imageAnalysis: Motion.st.imageAnalysis,
      musicAnalysis: Motion.st.musicAnalysis, targetDuration: 45,
      provider: 'local', aspect: '16:9', overrides: Motion.st.overrides,
    });
    return Motion.st.plan.shots.map(s => {
      const f = Motion.st.imageAnalysis.get(s.assetId);
      const a = Motion.st.images.find(x => x.id === s.assetId);
      return {
        name: a.name, cid: s.clusterId, label: s.roomLabel, mv: s.movementId,
        axis: MM.moveById(s.movementId).axis, droneOnly: !!MM.moveById(s.movementId).droneOnly,
        isDrone: f.isDrone, isDetail: f.isDetail, dur: s.timelineDuration,
        in: s.timelineIn, out: s.timelineOut, gen: s.generatedDuration,
      };
    });
  });
  plan.forEach((s, i) => console.log(`     ${String(i + 1).padStart(2)} ${s.name.replace('.jpg', '').padEnd(18)} ${String(s.label).padEnd(9)} ${s.mv.padEnd(20)} ${s.dur}s`));

  const droneBad = plan.filter(s => s.isDrone && !(s.droneOnly || s.axis === 'y' || s.axis === 'yz'));
  check(droneBad.length === 0, 'Ingen drönarbild får en sidledsrörelse', droneBad.map(s => s.name + '→' + s.mv).join(', '));
  const droneOnLand = plan.filter(s => !s.isDrone && s.droneOnly);
  check(droneOnLand.length === 0, 'Drönarrörelser används bara på drönarbilder');
  const detailBad = plan.filter(s => s.isDetail && !['slow_push_in', 'slow_push_out'].includes(s.mv));
  check(detailBad.length === 0, 'Närbilder får bara lugn push', detailBad.map(s => s.name + '→' + s.mv).join(', '));

  // Samma rum ska ligga i följd. Närbilder räknas inte: de är medvetet
  // utspridda som övergångar mellan rummen.
  let split = 0;
  const seen = new Set();
  // Exteriörerna räknas inte heller: filmen öppnar och stänger medvetet ute.
  for (const s of plan.filter(s => !s.isDetail && /^room/.test(String(s.cid)))) {
    if (seen.has(s.cid) && [...seen].pop() !== s.cid) split++;
    seen.delete(s.cid); seen.add(s.cid);
  }
  check(split === 0, 'Varje rum visas i följd, inte utspritt', split + ' avbrutna rum');
  check(plan.every(s => s.gen === 3 || s.gen === 4), 'Genereringslängden är 3 s som standard',
    [...new Set(plan.map(s => s.gen))].join('/') + ' s');

  head('Ändra längd för hand');
  const dur = await page.evaluate(() => {
    const before = Motion.st.plan.shots.map(s => ({ id: s.assetId, d: s.timelineDuration, in: s.timelineIn }));
    const target = Motion.st.plan.shots[1];
    const opts = Director.durationOptions(Motion.st.musicAnalysis, target.timelineIn);
    const longer = opts.find(o => o.duration > target.timelineDuration);
    Motion.st.overrides.durations.set(target.assetId, longer.duration);
    Motion.st.plan = Director.buildPlan({
      assets: Motion.st.images, imageAnalysis: Motion.st.imageAnalysis,
      musicAnalysis: Motion.st.musicAnalysis, targetDuration: 45,
      provider: 'local', aspect: '16:9', overrides: Motion.st.overrides,
    });
    const after = Motion.st.plan.shots.map(s => ({ id: s.assetId, d: s.timelineDuration, in: s.timelineIn }));
    const s1 = Motion.st.plan.shots[1];
    return {
      options: opts.map(o => o.duration), asked: longer.duration, got: s1.timelineDuration,
      gen: s1.generatedDuration, locked: s1.durationLocked,
      rippled: after[2] && before[2] ? Math.abs(after[2].in - before[2].in) : 0,
      onGrid: Motion.st.musicAnalysis.cutPoints.some(c => Math.abs(c.t - s1.timelineOut) < 0.02),
      contiguous: after.every((s, i) => i === 0 ? s.in === 0 : Math.abs(s.in - (after[i - 1].in + after[i - 1].d)) < 0.02),
    };
  });
  console.log('    valbara längder:', dur.options.join(', '));
  check(dur.options.length >= 3, 'Flera längder att välja på', dur.options.length + ' st');
  check(Math.abs(dur.got - dur.asked) < 0.02, 'Den valda längden används', `${dur.got}s`);
  check(dur.onGrid, 'Den handsatta längden ligger fortfarande på musiken');
  check(dur.rippled > 0.05, 'Efterföljande klipp flyttas med', dur.rippled.toFixed(2) + 's');
  check(dur.contiguous, 'Timelinen är fortfarande sammanhängande');
  check(dur.gen >= 3 && Number.isInteger(dur.gen) && dur.gen >= dur.got, 'Genereringslängden följer med', dur.gen + 's');

  head('Ändra kamerarörelse för hand');
  const mv = await page.evaluate(() => {
    const s0 = Motion.st.plan.shots[0];
    const f = Motion.st.imageAnalysis.get(s0.assetId);
    const opts = Director.moveOptions({ a: { id: s0.assetId }, f }, null, null, 0.5);
    const pick = opts.find(o => o.suitable && o.move.id !== s0.movementId);
    Motion.st.overrides.moves.set(s0.assetId, pick.move.id);
    Motion.st.plan = Director.buildPlan({
      assets: Motion.st.images, imageAnalysis: Motion.st.imageAnalysis,
      musicAnalysis: Motion.st.musicAnalysis, targetDuration: 45,
      provider: 'local', aspect: '16:9', overrides: Motion.st.overrides,
    });
    const s = Motion.st.plan.shots[0];
    return {
      suitable: opts.filter(o => o.suitable).length, total: opts.length,
      asked: pick.move.id, got: s.movementId, locked: s.movementLocked,
      prompt: s.prompt, motivation: s.motivation,
    };
  });
  check(mv.got === mv.asked, 'Den valda rörelsen används', mv.got);
  check(mv.locked, 'Shot markeras som handredigerad');
  check(mv.prompt === (await page.evaluate(id => MM.moveById(id).prompt, mv.asked)), 'Prompten följer den valda rörelsen');
  check(mv.suitable >= 2 && mv.suitable < mv.total, 'Olämpliga rörelser är avskilda', `${mv.suitable} av ${mv.total} passar bilden`);
  check(/för hand/.test(mv.motivation), 'Motiveringen påstår inte att regissören valde', mv.motivation);

  head('Byt namn och flytta mellan rum');
  const rooms = await page.evaluate(() => {
    const rs = Director.roomsOf(Motion.st.images, Motion.st.imageAnalysis, Motion.st.overrides);
    const interior = rs.filter(r => r.id !== 'exterior' && r.id !== 'drone');
    Motion.st.overrides.names.set(interior[0].id, 'Vardagsrum');
    const moved = Motion.st.plan.shots.find(s => s.clusterId === interior[1].id);
    if (moved) Motion.st.overrides.rooms.set(moved.assetId, interior[0].id);
    Motion.st.plan = Director.buildPlan({
      assets: Motion.st.images, imageAnalysis: Motion.st.imageAnalysis,
      musicAnalysis: Motion.st.musicAnalysis, targetDuration: 45,
      provider: 'local', aspect: '16:9', overrides: Motion.st.overrides,
    });
    return {
      rooms: rs.map(r => r.label),
      named: Motion.st.plan.shots.filter(s => s.roomLabel === 'Vardagsrum').length,
      movedInto: moved ? Motion.st.plan.shots.find(s => s.assetId === moved.assetId).clusterId : null,
      want: interior[0].id,
    };
  });
  console.log('    rum:', rooms.rooms.join(', '));
  check(rooms.named >= 2, 'Namnet gäller alla bilder i rummet', rooms.named + ' bilder heter Vardagsrum');
  check(rooms.movedInto === rooms.want, 'En bild går att flytta till ett annat rum');

  head('Validering efter handredigering');
  const errs = await page.evaluate(() => Director.validate(Motion.st.plan, {
    assets: Motion.st.images, musicAnalysis: Motion.st.musicAnalysis, provider: 'local',
  }));
  check(errs.length === 0, 'Planen validerar även efter alla ändringar', errs.join('; '));

  console.log('\n──────── resultat ────────');
  console.log(fails ? `${fails} kontroller misslyckades` : 'Alla kontroller gick igenom');
  if (errors.length) { console.log('Konsolfel:'); [...new Set(errors)].slice(0, 8).forEach(e => console.log('  ! ' + e)); }
  await browser.close();
  process.exit(fails || errors.length ? 1 : 0);
})().catch(e => { console.error('KRASCH:', e); process.exit(2); });
