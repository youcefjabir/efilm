#!/usr/bin/env node
/* Testar de direkta musinteraktionerna: drag & drop, trimhandtag,
   ordningsändring, scrubbing och kortkommandon. */
const { chromium } = require('playwright');
const path = require('path');
const MEDIA = path.join(__dirname, '..', 'test-media');
const URL = process.env.APP_URL || 'http://127.0.0.1:8099/dist/index.html';
const errors = [];
let fails = 0;
const ok = (n, d) => console.log(`  ✓ ${n}${d ? '  — ' + d : ''}`);
const bad = (n, d) => { fails++; console.log(`  ✗ ${n}${d ? '  — ' + d : ''}`); };
const check = (c, n, d) => c ? ok(n, d) : bad(n, d);

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1680, height: 1000 } });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('body[data-ready]');

  console.log('\n[1] Drag & drop från mediabiblioteket till timelinen');
  await page.setInputFiles('#fileinput', [path.join(MEDIA, 'handheld-pushin.webm'), path.join(MEDIA, 'walking-bob.webm')]);
  await page.waitForFunction(() => S.project.media.length >= 2, null, { timeout: 60000 });
  // första klippet läggs till automatiskt; dra det andra manuellt
  await page.waitForTimeout(400);
  const n0 = await page.evaluate(() => S.project.tracks.video.length);
  const item = page.locator('.mitem').nth(0);
  await item.dragTo(page.locator('#tlcontent'));
  await page.waitForTimeout(400);
  const n1 = await page.evaluate(() => S.project.tracks.video.length);
  check(n1 === n0 + 1, 'Drag & drop lade till ett klipp', `${n0} → ${n1}`);

  console.log('\n[2] Trimma med handtag');
  await page.evaluate(() => Timeline.setZoom(90));
  await page.waitForTimeout(200);
  const before = await page.evaluate(() => +M.clipDuration(S.project.tracks.video[0]).toFixed(3));
  const clip0 = page.locator('#tlcontent .tltrack.video .clip').first();
  const box = await clip0.boundingBox();
  const grip = { x: box.x + box.width - 3, y: box.y + box.height / 2 };
  console.log('    box', JSON.stringify(box), 'hit', await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.className : 'none'; }, [grip.x, grip.y]));
  await page.mouse.move(grip.x, grip.y);
  await page.mouse.down();
  await page.mouse.move(grip.x - 90, grip.y, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => +M.clipDuration(S.project.tracks.video[0]).toFixed(3));
  check(after < before - 0.5, 'Högerhandtaget trimmade klippet', `${before}s → ${after}s`);
  const packed = await page.evaluate(() => {
    const v = S.project.tracks.video;
    return v.every((c, i) => i === 0 ? c.start === 0 : Math.abs(c.start - (v[i - 1].start + M.clipDuration(v[i - 1]))) < 0.001);
  });
  check(packed, 'Timelinen packades om utan glapp efter trim');

  console.log('\n[3] Ändra ordning genom att dra klippet');
  const order0 = await page.evaluate(() => S.project.tracks.video.map(c => c.mediaId));
  const last = page.locator('#tlcontent .tltrack.video .clip').last();
  const lb = await last.boundingBox();
  await page.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2);
  await page.mouse.down();
  await page.mouse.move(lb.x + lb.width / 2 - 40, lb.y + lb.height / 2, { steps: 5 });
  await page.mouse.move(10, lb.y + lb.height / 2, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  const order1 = await page.evaluate(() => S.project.tracks.video.map(c => c.mediaId));
  check(JSON.stringify(order0) !== JSON.stringify(order1), 'Ordningen ändrades med drag', order0 + ' → ' + order1);

  console.log('\n[4] Scrubbing i linjalen');
  const ruler = await page.locator('#ruler').boundingBox();
  await page.mouse.click(ruler.x + 160, ruler.y + 10);
  await page.waitForTimeout(200);
  const ph = await page.evaluate(() => S.st.playhead);
  check(ph > 0.3, 'Playheaden hoppade dit man klickade', ph.toFixed(2) + 's');

  console.log('\n[5] Kortkommandon');
  await page.locator('#tlcontent .tltrack.video .clip').first().click();
  await page.waitForTimeout(150);
  await page.evaluate(() => S.seek(M.clipDuration(S.project.tracks.video[0]) * 0.5));
  const nBefore = await page.evaluate(() => S.project.tracks.video.length);
  await page.keyboard.press('s');
  await page.waitForTimeout(250);
  const nAfterSplit = await page.evaluate(() => S.project.tracks.video.length);
  check(nAfterSplit === nBefore + 1, 'S delade klippet', `${nBefore} → ${nAfterSplit}`);
  await page.keyboard.press('Delete');
  await page.waitForTimeout(200);
  check(await page.evaluate(() => S.project.tracks.video.length) === nBefore, 'Delete tog bort klippet');
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(200);
  check(await page.evaluate(() => S.project.tracks.video.length) === nAfterSplit, 'Ctrl+Z ångrade borttagningen');
  await page.keyboard.press(' ');
  await page.waitForTimeout(700);
  const playing = await page.evaluate(() => S.st.playing);
  check(playing, 'Mellanslag startade uppspelningen');
  await page.keyboard.press(' ');
  await page.waitForTimeout(200);
  check(!(await page.evaluate(() => S.st.playing)), 'Mellanslag pausade igen');

  console.log('\n[6] Övergång och rörelse via panelerna');
  await page.evaluate(() => S.selectClips([S.project.tracks.video[1].id]));
  await page.click('#tabrail button[data-tab="trans"]');
  await page.waitForTimeout(200);
  await page.locator('.preset-card', { hasText: 'Cross dissolve' }).first().click();
  await page.waitForTimeout(200);
  const tr = await page.evaluate(() => S.project.tracks.video[1].transitionIn);
  check(tr.type === 'dissolve' && tr.dur > 0, 'Övergång satt på klipp 2', JSON.stringify(tr));
  check(await page.locator('#tlcontent .trans').count() > 0, 'Övergångsmarkör visas i timelinen');
  await page.click('#tabrail button[data-tab="motion"]');
  await page.waitForTimeout(200);
  await page.locator('.preset-card', { hasText: 'Smooth push in' }).first().click();
  await page.waitForTimeout(300);
  const mo = await page.evaluate(() => S.project.tracks.video[1].motion.preset);
  check(mo === 'pushin', 'Rörelsepreset satt', mo);
  const moved = await page.evaluate(() => {
    const c = S.project.tracks.video[1];
    const a = Playback.motionAt(c, 0.1, M.clipDuration(c));
    const b = Playback.motionAt(c, M.clipDuration(c) - 0.1, M.clipDuration(c));
    return { z0: +a.zoom.toFixed(4), z1: +b.zoom.toFixed(4) };
  });
  check(moved.z1 > moved.z0, 'Rörelsen zoomar in över klippets längd', JSON.stringify(moved));

  console.log('\n[7] Text');
  await page.click('#tabrail button[data-tab="text"]');
  await page.waitForTimeout(200);
  await page.locator('.preset-card', { hasText: 'Intro — adress' }).first().click();
  await page.waitForTimeout(300);
  check(await page.evaluate(() => S.project.tracks.text.length) === 1, 'Textklipp tillagt');
  await page.locator('#panelbody input[type=text]').first().fill('Strandvägen 7B');
  await page.waitForTimeout(250);
  check(await page.evaluate(() => S.project.tracks.text[0].title) === 'Strandvägen 7B', 'Texten uppdateras i state');
  await page.evaluate(() => { S.seek(S.project.tracks.text[0].start + 1); Playback.renderAt(S.st.playhead, S.project, { playing: false }); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(__dirname, '..', 'test-shots', '10-text.png') });

  console.log('\n[8] Auto Enhance');
  await page.evaluate(() => S.selectClips([S.project.tracks.video[0].id]));
  await page.click('#tabrail button[data-tab="image"]');
  await page.waitForTimeout(200);
  await page.locator('#panelbody button', { hasText: 'Auto Enhance' }).click();
  await page.waitForSelector('#modalwrap.on', { timeout: 30000 });
  const sug = await page.locator('#modal .body label').count();
  check(sug > 0, 'Auto Enhance föreslår justeringar', sug + ' förslag');
  await page.locator('#modal footer button', { hasText: 'Applicera valda' }).click();
  await page.waitForTimeout(300);
  const g = await page.evaluate(() => {
    const c = S.project.tracks.video[0];
    return Object.entries(c.grade).filter(([k, v]) => Math.abs(v) > 0.001);
  });
  check(g.length > 0, 'Justeringarna applicerades på klippet', JSON.stringify(g));

  console.log('\n[9] Match Clips');
  await page.locator('#panelbody button', { hasText: 'Matcha klippen' }).click();
  await page.waitForSelector('#modalwrap.on', { timeout: 60000 });
  await page.waitForTimeout(500);
  check(await page.locator('#modal .rrow').count() > 1, 'Avvikelselista visas');
  await page.locator('#modal footer button', { hasText: 'Matcha' }).click();
  await page.waitForTimeout(300);
  ok('Match Clips kördes');

  console.log('\n[10] Projektfil ut och in');
  const exported = await page.evaluate(() => {
    const data = S.serialize();
    return { clips: data.tracks.video.length, media: data.media.length, hasThumb: !!data.media[0].thumb, hasBlob: !!(data.media[0].file || data.media[0].url) };
  });
  check(exported.clips > 0 && exported.media > 0, 'Projektfilen innehåller timeline och media', JSON.stringify(exported));
  check(exported.hasThumb && !exported.hasBlob, 'Thumbnails följer med projektfilen, råa blobbar gör det inte');

  console.log('\n──────── resultat ────────');
  console.log(fails ? `${fails} kontroller misslyckades` : 'Alla kontroller gick igenom');
  if (errors.length) { console.log('Konsolfel:'); [...new Set(errors)].slice(0, 15).forEach(e => console.log('  ! ' + e)); }
  else console.log('Inga konsolfel.');
  await browser.close();
  process.exit(fails || errors.filter(e => e.startsWith('pageerror')).length ? 1 : 0);
})().catch(e => { console.error('KRASCH:', e); process.exit(2); });
