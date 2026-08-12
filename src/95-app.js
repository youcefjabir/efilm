/* ============================================================
   95 — App: bootstrap, kommandon, kortkommandon, projekthantering
   ============================================================ */
const App = (() => {
  const state = { showBeats: true, snapBeats: false, ready: false };
  let cancelStab = false;

  /* ---------- storlek & preview ---------- */
  function applyPreviewSize() {
    const p = S.project;
    const { w, h } = Exporter.outSize(p);
    const q = U.clamp(p.settings.previewQuality || .55, .2, 1);
    Renderer.setSize(Math.round(w * q / 2) * 2, Math.round(h * q / 2) * 2);
    fitStage();
  }
  function fitStage() {
    const stage = U.$('#stage'), inner = U.$('#stageinner');
    if (!stage || !inner) return;
    const p = S.project;
    const ar = U.ASPECTS[p.settings.aspect] || 16 / 9;
    const sw = stage.clientWidth - 16, sh = stage.clientHeight - 16;
    let w = sw, h = w / ar;
    if (h > sh) { h = sh; w = h * ar; }
    inner.style.width = Math.max(40, Math.floor(w)) + 'px';
    inner.style.height = Math.max(24, Math.floor(h)) + 'px';
    const empty = U.$('#emptyprev');
    if (empty) empty.style.display = p.tracks.video.length ? 'none' : 'flex';
  }

  /* ---------- media → timeline ---------- */
  function addMediaToTimeline(media, at) {
    if (!media) return;
    if (media.missing) { U.toast('Filen saknas', 'Importera om ' + media.name, 'err'); return; }
    S.update(p => {
      if (media.type === 'audio') {
        const c = M.newAudioClip(media, at == null ? 0 : Math.max(0, at));
        p.tracks.music.push(c);
        S.selectClips([c.id]);
      } else {
        const c = M.newClip(media, 0);
        p.tracks.video.push(c);
        M.relayout(p.tracks.video);
        S.selectClips([c.id]);
      }
    }, 'add-clip');
    U.toast('Lagt till på timelinen', media.name);
    Timeline.zoomFit();
  }

  /* ---------- klippkommandon ---------- */
  function splitAtPlayhead() {
    const t = S.st.playhead;
    const p = S.project;
    const c = M.clipAt(p, t);
    if (!c) { U.toast('Inget klipp vid playhead', 'Flytta playheaden till ett klipp först.', 'warn'); return; }
    const local = t - c.start;
    const dur = M.clipDuration(c);
    if (local < .08 || local > dur - .08) { U.toast('För nära klippets kant', 'Dela minst 0,1 s in i klippet.', 'warn'); return; }
    S.update(pp => {
      const arr = pp.tracks.video;
      const i = arr.findIndex(x => x.id === c.id);
      const orig = arr[i];
      const cut = orig.in + local * (orig.speed || 1);
      const b = U.clone(orig);
      b.id = U.uid('clip');
      b.in = cut; b.transitionIn = { type: 'cut', dur: 0 };
      orig.out = cut;
      orig.fade.out = 0; b.fade.in = 0;
      arr.splice(i + 1, 0, b);
      M.relayout(arr);
      S.selectClips([b.id]);
    }, 'split');
    U.toast('Klippet delat');
  }
  function deleteSelected(ripple) {
    const sel = S.selectedClips();
    if (!sel.length) return;
    S.update(p => {
      for (const c of sel) {
        if (c.kind === 'video') {
          const d = M.clipDuration(c);
          p.tracks.video = p.tracks.video.filter(x => x.id !== c.id);
          if (ripple) {
            for (const a of p.tracks.music) if (a.start > c.start) a.start = Math.max(0, a.start - d);
            for (const a of p.tracks.text) if (a.start > c.start) a.start = Math.max(0, a.start - d);
          }
        } else if (c.kind === 'music') p.tracks.music = p.tracks.music.filter(x => x.id !== c.id);
        else p.tracks.text = p.tracks.text.filter(x => x.id !== c.id);
      }
      M.relayout(p.tracks.video);
      S.selectClips([]);
    }, 'delete');
  }
  const deleteClip = id => { S.selectClips([id]); deleteSelected(false); };
  function duplicateSelected() {
    const sel = S.selectedClips();
    if (!sel.length) return;
    S.update(p => {
      const ids = [];
      for (const c of sel) {
        const n = U.clone(c); n.id = U.uid(c.kind === 'video' ? 'clip' : c.kind === 'music' ? 'aclip' : 'txt');
        if (c.kind === 'video') { const i = p.tracks.video.findIndex(x => x.id === c.id); p.tracks.video.splice(i + 1, 0, n); }
        else if (c.kind === 'music') { n.start = c.start + (c.out - c.in); p.tracks.music.push(n); }
        else { n.start = c.start + c.duration; p.tracks.text.push(n); }
        ids.push(n.id);
      }
      M.relayout(p.tracks.video);
      S.selectClips(ids);
    }, 'duplicate');
  }

  /* ---------- stabilisering ---------- */
  async function runStabAnalysis(media) {
    if (!media) return;
    cancelStab = false;
    Panels.ui.stabBusy = { pct: 0, msg: 'Startar…' };
    try {
      await Stab.analyze(media, (pct, msg) => {
        Panels.ui.stabBusy = { pct, msg };
        const bar = U.$('#panelbody .progress i'); if (bar) bar.style.width = (pct * 100) + '%';
        const h = U.$('#panelbody .progress + .row'); if (h) h.textContent = msg;
      });
      Panels.ui.stabBusy = null;
      Panels.render();
      const r = media.stab.report;
      U.toast('Analys klar · ' + M.stabModeById(r.recommended).name,
        `${r.samples} bildrutor · skakning ${r.shake.label} · crop ≈ ${r.estimatedCrop} %`);
      const clip = S.primaryClip();
      if (clip && clip.mediaId === media.id && !clip.stabEnabled) toggleStabOnClip(true);
    } catch (e) {
      Panels.ui.stabBusy = null;
      if (e.message !== 'cancelled') U.errToast('Analysen misslyckades', e);
      Panels.render();
    }
  }
  function toggleStabOnClip(on) {
    const clip = S.primaryClip();
    if (!clip || clip.kind !== 'video') return;
    const media = M.mediaById(S.project, clip.mediaId);
    if (on && (!media.stab || media.stab.status !== 'analyzed')) {
      U.toast('Klippet måste analyseras först', 'Kör "Analysera klippet" i stabiliseringspanelen.', 'warn');
      Panels.open('stab');
      return;
    }
    S.update(p => { M.findClip(p, clip.id).stabEnabled = !!on; }, 'stab-toggle');
  }
  function applyStabToAll(media) {
    if (!media || !media.stab || media.stab.status !== 'analyzed') { U.toast('Analysera först', '', 'warn'); return; }
    let n = 0;
    S.update(p => { for (const c of p.tracks.video) if (c.mediaId === media.id) { c.stabEnabled = true; n++; } }, 'stab-all');
    U.toast('Stabilisering på ' + n + ' klipp', media.name);
  }
  async function analyzeAllUsedMedia() {
    const p = S.project;
    const ids = [...new Set(p.tracks.video.map(c => c.mediaId))];
    const list = ids.map(id => M.mediaById(p, id)).filter(m => m && m.type === 'video' && (!m.stab || m.stab.status !== 'analyzed'));
    if (!list.length) { U.toast('Alla klipp är redan analyserade'); return; }
    for (const m of list) {
      if (cancelStab) break;
      await runStabAnalysis(m);
    }
    S.update(pp => { for (const c of pp.tracks.video) { const m = M.mediaById(pp, c.mediaId); if (m && m.stab && m.stab.status === 'analyzed') c.stabEnabled = true; } }, 'stab-all');
    U.toast('Alla klipp analyserade och stabiliserade');
  }

  /* ---------- färg ---------- */
  async function autoEnhance(clip) {
    const media = M.mediaById(S.project, clip.mediaId);
    if (!media) return;
    const t = U.toast('Analyserar bildruta…', media.name);
    try {
      const idx = S.project.tracks.video.findIndex(c => c.id === clip.id);
      let prevStats = null;
      if (idx > 0) {
        const pc = S.project.tracks.video[idx - 1];
        const pm = M.mediaById(S.project, pc.mediaId);
        if (pm && pm.url) prevStats = await Color.frameStats(pm, pc.in + (pc.out - pc.in) * .4);
      }
      const res = await Color.autoEnhance(clip, media, prevStats);
      t.remove();
      const all = [...res.suggestions, ...res.match];
      if (!all.length) { U.toast('Inget att justera', 'Klippet ser redan balanserat ut.'); return; }
      const box = U.el('div');
      const checks = all.map(s => {
        const inp = U.el('input', { type: 'checkbox' }); inp.checked = true;
        box.append(U.el('label', { class: 'row', style: { cursor: 'pointer', alignItems: 'flex-start' } },
          inp,
          U.el('div', { style: { flex: '1' } },
            U.el('div', {}, s.label, ' ', U.el('span', { class: 'tag accent', text: (s.value > 0 ? '+' : '') + s.value })),
            U.el('div', { class: 'hint', text: s.why }))));
        return { inp, s };
      });
      box.append(U.el('div', { class: 'hint', style: { marginTop: '8px' } },
        'Förslagen är begränsade till försiktiga värden — inga extrema ändringar appliceras automatiskt.'));
      U.modal({
        title: 'Auto Enhance for Real Estate', body: box,
        actions: [{ label: 'Avbryt' }, {
          label: 'Applicera valda', primary: true, onclick: () => {
            S.update(p => {
              const c = M.findClip(p, clip.id);
              for (const { inp, s } of checks) if (inp.checked) c.grade[s.key] = U.clamp((c.grade[s.key] || 0) + s.value, -200, 200);
            }, 'auto-enhance');
            U.toast('Auto Enhance applicerad');
          }
        }],
      });
    } catch (e) { t.remove(); U.errToast('Auto Enhance misslyckades', e); }
  }
  function copyGradeToAll(clip) {
    S.update(p => {
      for (const c of p.tracks.video) if (c.id !== clip.id) { c.grade = U.clone(clip.grade); c.filter = clip.filter; c.filterIntensity = clip.filterIntensity; }
    }, 'copy-grade');
    U.toast('Bildinställningarna kopierade till alla klipp');
  }
  async function openMatchClips() {
    const p = S.project;
    const clips = p.tracks.video;
    if (clips.length < 2) { U.toast('Minst två klipp krävs', '', 'warn'); return; }
    const t = U.toast('Analyserar klippen…');
    const stats = await Color.collectStats(p, clips, () => { });
    t.remove();
    const refSel = U.select(clips.map((c, i) => [c.id, (i + 1) + '. ' + ((M.mediaById(p, c.mediaId) || {}).name || '')]), (S.primaryClip() || clips[0]).id, () => refresh());
    const opts = { exposure: true, wb: true, contrast: true, tone: false };
    const scope = U.select([['all', 'Hela filmen'], ['sel', 'Endast markerade klipp']], 'all', v => scope.value = v);
    const listBox = U.el('div');
    function refresh() {
      U.clear(listBox);
      const ref = stats.get(refSel.value);
      for (const c of clips) {
        const dev = Color.deviation(stats.get(c.id), ref);
        c._deviation = c.id === refSel.value ? 0 : dev;
        const m = M.mediaById(p, c.mediaId);
        listBox.append(U.el('div', { class: 'rrow' },
          U.el('span', { class: 'k', style: { flex: '1' }, text: (m ? m.name : '?') }),
          U.el('span', { class: 'meter', style: { flex: '0 0 90px' } }, U.el('i', { class: dev > .55 ? 'warn' : '', style: { width: U.clamp(dev / 1.2, 0, 1) * 100 + '%' } })),
          U.el('span', { class: 'v mono', style: { flex: '0 0 54px', textAlign: 'right' }, text: c.id === refSel.value ? 'referens' : dev.toFixed(2) })));
      }
      Timeline.render();
    }
    const box = U.el('div', {},
      U.el('div', { class: 'row' }, U.el('label', { class: 'lbl', text: 'Referensklipp' }), refSel),
      U.el('div', { class: 'row' }, U.el('label', { class: 'lbl', text: 'Applicera på' }), scope),
      U.el('div', { class: 'row wrap' },
        U.check('Exponering', true, v => opts.exposure = v),
        U.check('Vitbalans', true, v => opts.wb = v),
        U.check('Kontrast', true, v => opts.contrast = v),
        U.check('Färgton', false, v => opts.tone = v)),
      U.el('h3', { class: 'sectitle', text: 'Avvikelse mot referensen' }), listBox);
    refresh();
    U.modal({
      title: 'Match Clips', wide: true, body: box,
      actions: [{ label: 'Stäng' }, {
        label: 'Matcha', primary: true, onclick: () => {
          const ref = stats.get(refSel.value);
          const selIds = new Set(S.sel.clips);
          let n = 0;
          S.update(pp => {
            for (const c of pp.tracks.video) {
              if (c.id === refSel.value) continue;
              if (scope.value === 'sel' && !selIds.has(c.id)) continue;
              const s = stats.get(c.id); if (!s) continue;
              const d = Color.matchDelta(s, ref, opts);
              for (const k in d) c.grade[k] = U.clamp((c.grade[k] || 0) + d[k], -200, 200);
              n++;
            }
          }, 'match-clips');
          U.toast('Matchade ' + n + ' klipp', 'Referens: ' + ((M.mediaById(p, (M.findClip(p, refSel.value) || {}).mediaId) || {}).name || ''));
        }
      }],
    });
  }

  /* ---------- text ---------- */
  function addText(presetId) {
    S.update(p => {
      const c = M.newTextClip(presetId, S.st.playhead);
      if (presetId === 'end') { c.title = 'Visning söndag 14–15'; c.sub = 'Boka via mäklaren'; }
      p.tracks.text.push(c);
      S.selectClips([c.id]);
    }, 'add-text');
    Panels.open('text');
  }
  function addPropertyIntro() {
    S.update(p => {
      const total = M.totalDuration(p);
      const a = M.newTextClip('address', 0.6); a.duration = 3.4;
      const b = M.newTextClip('end', Math.max(1, total - 3.5)); b.title = 'Viewly'; b.sub = 'Premium bostadsfilm';
      p.tracks.text.push(a, b);
    }, 'text-auto');
    U.toast('Intro och slutkort tillagda', 'Redigera texten i Text-panelen');
    Panels.open('text');
  }

  /* ---------- musik ---------- */
  function trimMusicToFilm(c) {
    const total = M.totalDuration(S.project);
    S.update(p => { const x = M.findClip(p, c.id); x.out = Math.min(x.in + Math.max(1, total - x.start), (M.mediaById(p, x.mediaId) || {}).duration || x.out); }, 'music-trim');
    U.toast('Musiken trimmad till filmens längd');
  }
  function loopMusicToFilm(c) {
    const p0 = S.project;
    const total = M.totalDuration(p0);
    const m = M.mediaById(p0, c.mediaId);
    if (!m) return;
    S.update(p => {
      p.tracks.music = p.tracks.music.filter(x => x.mediaId !== c.mediaId || x.id === c.id);
      const len = c.out - c.in;
      let t = c.start + len;
      let guard = 0;
      while (t < total - .3 && guard++ < 40) {
        const n = M.newAudioClip(m, t);
        n.in = c.in; n.out = c.out; n.volume = c.volume; n.loop = true; n.fade = { in: .2, out: Math.min(2, len / 3) };
        p.tracks.music.push(n);
        t += len;
      }
      const cc = M.findClip(p, c.id); if (cc) cc.loop = true;
    }, 'music-loop');
    U.toast('Musiken loopad över hela filmen');
  }
  function beatSyncSuggest(c) {
    const p = S.project;
    const m = M.mediaById(p, c.mediaId);
    if (!m || !m.beats || !m.beats.length) { U.toast('Inga transienter hittade', '', 'warn'); return; }
    const times = m.beats.map(b => c.start + (b - c.in)).filter(t => t > .3 && t < M.totalDuration(p));
    const clips = p.tracks.video;
    const rows = clips.map((cl, i) => {
      if (i === 0) return null;
      const cut = cl.start;
      let best = null, bd = 1e9;
      for (const t of times) { const d = Math.abs(t - cut); if (d < bd) { bd = d; best = t; } }
      return best == null ? null : { clip: cl, cut, beat: best, delta: best - cut };
    }).filter(Boolean).filter(r => Math.abs(r.delta) < 1.2);
    if (!rows.length) { U.toast('Inga klippunkter nära en beat'); return; }
    const box = U.el('div');
    box.append(U.el('div', { class: 'hint', style: { marginBottom: '6px' } }, 'Förslagen flyttar klippgränsen genom att justera föregående klipps längd. Inget tvingas på dig — bocka ur det du inte vill ha.'));
    const checks = rows.map(r => {
      const inp = U.el('input', { type: 'checkbox' }); inp.checked = Math.abs(r.delta) < .5;
      box.append(U.el('label', { class: 'row', style: { cursor: 'pointer' } }, inp,
        U.el('span', { style: { flex: '1' }, text: `Klippunkt ${U.tc(r.cut, false)} → beat ${U.tc(r.beat, false)}` }),
        U.el('span', { class: 'tag mono', text: (r.delta > 0 ? '+' : '') + r.delta.toFixed(2) + ' s' })));
      return { inp, r };
    });
    U.modal({
      title: 'Beat Sync', body: box, wide: true,
      actions: [{ label: 'Avbryt' }, {
        label: 'Applicera valda', primary: true, onclick: () => {
          S.update(pp => {
            for (const { inp, r } of checks) {
              if (!inp.checked) continue;
              const arr = pp.tracks.video;
              const i = arr.findIndex(x => x.id === r.clip.id);
              if (i <= 0) continue;
              const prev = arr[i - 1];
              const want = M.clipDuration(prev) + r.delta;
              const media = M.mediaById(pp, prev.mediaId);
              const maxOut = media ? media.duration : prev.out;
              prev.out = U.clamp(prev.in + want * (prev.speed || 1), prev.in + .15, maxOut);
              M.relayout(arr);
            }
          }, 'beatsync');
          U.toast('Klippunkter synkade mot musiken');
        }
      }],
    });
  }

  /* ---------- vy ---------- */
  const setCompare = v => { Playback.view.compare = v; document.body.classList.toggle('cmp', v); U.$('#btnBeforeAfter').classList.toggle('on', v); Panels.render(); };
  const setLoop = v => { Playback.view.loopClip = v; U.$('#btnLoopClip').classList.toggle('on', v); Panels.render(); };
  const setZoomView = v => { Playback.view.zoomView = v; U.$('#btnZoomView').classList.toggle('on', v); Panels.render(); };

  /* ---------- projekt ---------- */
  async function newProject() {
    if (!await confirmUnsaved()) return;
    Playback.releaseAll();
    S.setProject(M.newProject());
    applyPreviewSize();
    U.toast('Nytt projekt skapat');
  }
  function confirmUnsaved() {
    if (!S.st.dirty) return Promise.resolve(true);
    return new Promise(res => {
      U.modal({
        title: 'Osparade ändringar',
        body: U.el('div', { text: 'Projektet har ändringar som inte är sparade. Vill du fortsätta?' }),
        actions: [{ label: 'Avbryt', onclick: () => res(false) }, { label: 'Spara först', onclick: async () => { await Autosave.saveNow(true); res(true); } }, { label: 'Fortsätt utan att spara', danger: true, onclick: () => res(true) }],
      });
    });
  }
  async function duplicateProject() {
    await Autosave.saveNow(true);
    const copy = S.serialize();
    copy.id = U.uid('proj'); copy.name = S.project.name + ' (kopia)'; copy.createdAt = Date.now();
    const byId = new Map(S.project.media.map(m => [m.id, m]));
    copy.media.forEach(m => { const live = byId.get(m.id); if (live) { m.url = live.url; m.thumb = live.thumb; m.strip = live.strip; m.wave = live.wave; m.file = live.file; } });
    S.setProject(copy);
    await Autosave.saveNow(true);
    U.toast('Projektet duplicerat', copy.name);
  }
  function exportProjectFile() {
    const data = S.serialize();
    data._note = 'Projektfil för Master Bostadsfilm Editor. Videofilerna ligger kvar lokalt i webbläsaren och följer inte med denna fil.';
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = (S.project.name || 'projekt').replace(/\s+/g, '-') + '.bfproj.json';
    document.body.append(a); a.click(); a.remove();
    U.toast('Projektfil exporterad', a.download);
  }
  async function importProjectFile(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!data.tracks || !data.settings) throw new Error('Filen ser inte ut som en projektfil.');
      Playback.releaseAll();
      S.setProject(data);
      await Media.rehydrate(data, m => console.warn('saknad fil', m.name));
      const missing = data.media.filter(m => m.missing);
      S.touch(null, 'import');
      applyPreviewSize();
      Timeline.zoomFit();
      U.toast('Projekt importerat', missing.length ? `${missing.length} mediefiler saknas i den här webbläsaren — importera om dem.` : data.name);
    } catch (e) { U.errToast('Kunde inte importera projektfilen', e); }
  }
  async function projectsModal() {
    let list = [];
    try { list = await DB.allProjects(); } catch (e) { }
    const box = U.el('div');
    box.append(U.el('div', { class: 'row wrap' },
      U.el('button', { class: 'btn', onclick: () => { newProject(); } }, 'Nytt projekt'),
      U.el('button', { class: 'btn', onclick: () => duplicateProject() }, 'Duplicera'),
      U.el('button', { class: 'btn', onclick: () => exportProjectFile() }, 'Exportera projektfil'),
      U.el('button', { class: 'btn', onclick: () => U.$('#projinput').click() }, 'Importera projektfil')));
    box.append(U.el('h3', { class: 'sectitle', text: 'Sparade projekt' }));
    if (!list.length) box.append(U.el('div', { class: 'hint' }, 'Inga sparade projekt ännu.'));
    list.sort((a, b) => b.updatedAt - a.updatedAt).forEach(pr => {
      box.append(U.el('div', { class: 'rrow' },
        U.el('span', { class: 'k', style: { flex: '1' }, text: pr.name + (pr.id === S.project.id ? '  (öppet)' : '') }),
        U.el('span', { class: 'hint mono', text: `${pr.tracks.video.length} klipp · ${new Date(pr.updatedAt).toLocaleString('sv-SE')}` }),
        U.el('button', { class: 'btn sm', onclick: async () => { await openProject(pr.id); U.$('#modalwrap').classList.remove('on'); } }, 'Öppna'),
        U.el('button', { class: 'btn sm danger', onclick: async e => { await DB.delProject(pr.id); e.target.closest('.rrow').remove(); } }, '×')));
    });
    U.modal({ title: 'Projekt', body: box, wide: true, actions: [{ label: 'Stäng' }] });
  }
  async function openProject(id) {
    if (!await confirmUnsaved()) return;
    const pr = await DB.getProject(id);
    if (!pr) return U.toast('Projektet hittades inte', '', 'err');
    Playback.releaseAll();
    S.setProject(pr);
    await Media.rehydrate(pr);
    S.touch(null, 'open');
    applyPreviewSize(); Timeline.zoomFit();
    U.toast('Projekt öppnat', pr.name);
  }

  /* ---------- filimport ---------- */
  async function handleFiles(files) {
    const t = U.toast('Importerar…', '');
    try {
      const items = await Media.ingestFiles(files, (pct, name) => { t.firstChild.textContent = `Importerar ${Math.round(pct * 100)} % ${name || ''}`; });
      t.remove();
      if (!items.length) return;
      S.update(p => { p.media.push(...items); }, 'import-media');
      U.toast(items.length + ' fil(er) importerade', items.map(i => i.name).join(', ').slice(0, 90));
      Panels.open('media');
      // första videon: lägg direkt på timelinen om projektet är tomt
      if (!S.project.tracks.video.length) {
        const firstVideo = items.find(i => i.type === 'video');
        if (firstVideo) addMediaToTimeline(firstVideo);
      }
      Autosave.refreshStorage();
    } catch (e) { t.remove(); U.errToast('Import misslyckades', e); }
  }

  /* ---------- topbar & kontroller ---------- */
  function wire() {
    const p = () => S.project;
    U.$('#projname').addEventListener('input', e => S.update(pp => { pp.name = e.target.value; }, 'name', true));
    U.$('#btnUndo').onclick = () => { if (!S.undo()) U.toast('Inget att ångra'); };
    U.$('#btnRedo').onclick = () => { if (!S.redo()) U.toast('Inget att göra om'); };
    U.$('#btnSave').onclick = () => Autosave.saveNow(false);
    U.$('#btnProjects').onclick = projectsModal;
    U.$('#btnExport').onclick = () => Panels.open('export');
    U.$('#btnEmptyUpload').onclick = () => U.$('#fileinput').click();

    const selA = U.$('#selAspect'); Object.keys(U.ASPECTS).forEach(a => selA.append(U.el('option', { value: a }, a)));
    selA.onchange = () => { S.update(pp => { pp.settings.aspect = selA.value; }, 'aspect'); applyPreviewSize(); };
    const selR = U.$('#selRes'); M.RESOLUTIONS.forEach(([v, l]) => selR.append(U.el('option', { value: v }, l)));
    selR.onchange = () => { S.update(pp => { pp.settings.resolution = +selR.value; }, 'res'); applyPreviewSize(); };
    const selF = U.$('#selFps'); M.FPS_OPTS.forEach(([v, l]) => selF.append(U.el('option', { value: v }, l)));
    selF.onchange = () => S.update(pp => { pp.settings.fps = selF.value === 'source' ? 'source' : +selF.value; }, 'fps');
    const selQ = U.$('#selPQ'); M.PQ_OPTS.forEach(([v, l]) => selQ.append(U.el('option', { value: v }, l)));
    selQ.onchange = () => { S.update(pp => { pp.settings.previewQuality = +selQ.value; }, 'pq'); applyPreviewSize(); };

    U.$('#btnPlay').onclick = () => Playback.toggle();
    U.$('#btnFrameBack').onclick = () => step(-1);
    U.$('#btnFrameFwd').onclick = () => step(1);
    U.$('#btnPrevClip').onclick = () => jumpClip(-1);
    U.$('#btnNextClip').onclick = () => jumpClip(1);
    U.$('#btnLoopClip').onclick = () => setLoop(!Playback.view.loopClip);
    U.$('#btnBeforeAfter').onclick = () => setCompare(!Playback.view.compare);
    U.$('#btnZoomView').onclick = () => setZoomView(!Playback.view.zoomView);
    U.$('#btnGuides').onclick = () => { Playback.view.guides = !Playback.view.guides; U.$('#btnGuides').classList.toggle('on', Playback.view.guides); };
    U.$('#btnFitFill').onclick = () => {
      const v = Playback.view.fitFill === 'fit' ? 'fill' : 'fit';
      Playback.view.fitFill = v;
      S.update(pp => { pp.settings.fitMode = v; }, 'fit');
      U.$('#btnFitFill').textContent = v === 'fit' ? 'Fit' : 'Fill';
    };
    U.$('#btnFull').onclick = () => {
      const el = U.$('#stage');
      if (document.fullscreenElement) document.exitFullscreen();
      else if (el.requestFullscreen) el.requestFullscreen().catch(() => U.toast('Fullscreen nekades av webbläsaren', '', 'warn'));
    };
    U.$('#btnMute').onclick = () => {
      const m = !Playback.view.muted;
      Playback.setMuted(m);
      U.$('#btnMute').textContent = m ? '🔇' : '🔊';
      U.$('#btnMute').classList.toggle('on', m);
    };
    U.$('#volume').oninput = e => { const v = e.target.value / 100; Playback.setMasterVolume(v); S.update(pp => { pp.masterVolume = e.target.value | 0; }, 'vol', true); };
    U.$('#scrub').oninput = e => { const total = M.totalDuration(S.project); S.seek(total * e.target.value / 1000); };

    U.$('#tlSplit').onclick = splitAtPlayhead;
    U.$('#tlDup').onclick = duplicateSelected;
    U.$('#tlDel').onclick = () => deleteSelected(false);
    U.$('#tlRipple').onclick = () => deleteSelected(true);
    U.$('#tlSnap').onclick = () => { const on = !Timeline.snap; Timeline.setSnap(on); U.$('#tlSnap').classList.toggle('on', on); };
    U.$('#tlZoomIn').onclick = Timeline.zoomIn;
    U.$('#tlZoomOut').onclick = Timeline.zoomOut;
    U.$('#tlZoomFit').onclick = Timeline.zoomFit;

    U.$('#fileinput').onchange = e => { handleFiles(e.target.files); e.target.value = ''; };
    U.$('#projinput').onchange = e => { if (e.target.files[0]) importProjectFile(e.target.files[0]); e.target.value = ''; };

    // drag & drop
    let dragDepth = 0;
    window.addEventListener('dragenter', e => { if (!e.dataTransfer.types.includes('Files')) return; dragDepth++; document.body.classList.add('dragging'); });
    window.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; document.body.classList.remove('dragging'); } });
    window.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('Files')) e.preventDefault(); });
    window.addEventListener('drop', e => {
      if (!e.dataTransfer.files.length) return;
      e.preventDefault(); dragDepth = 0; document.body.classList.remove('dragging');
      handleFiles(e.dataTransfer.files);
    });

    // jämförelselinje
    const sb = U.$('#splitbar');
    sb.addEventListener('pointerdown', e => {
      const inner = U.$('#stageinner');
      U.drag(e, {
        cursor: 'ew-resize', onMove: (dx, dy, ev) => {
          const r = inner.getBoundingClientRect();
          Playback.view.compareX = U.clamp((ev.clientX - r.left) / r.width, 0, 1);
          sb.style.left = (Playback.view.compareX * 100) + '%';
        }
      });
    });
    sb.style.left = '50%';

    // timeline-höjd
    U.$('#tlresizer').addEventListener('pointerdown', e => {
      const wrap = U.$('#timelinewrap'), h0 = wrap.clientHeight;
      U.drag(e, { cursor: 'ns-resize', onMove: (dx, dy) => { wrap.style.flex = `0 0 ${U.clamp(h0 - dy, 120, window.innerHeight - 260)}px`; Timeline.render(); fitStage(); } });
    });

    window.addEventListener('resize', () => { fitStage(); Timeline.render(); });
    document.addEventListener('keydown', keys);
    S.bus.on('playstate', on => { U.$('#btnPlay').textContent = on ? '❚❚' : '▶'; });
    S.bus.on('project', syncTopbar);
    S.bus.on('change', U.debounce(syncTopbar, 120));
    S.bus.on('time', updateTime);
    S.bus.on('seek', updateTime);
  }
  function syncTopbar() {
    const p = S.project;
    const nm = U.$('#projname'); if (nm && nm.value !== p.name) nm.value = p.name;
    U.$('#selAspect').value = p.settings.aspect;
    U.$('#selRes').value = p.settings.resolution;
    U.$('#selFps').value = p.settings.fps;
    U.$('#selPQ').value = p.settings.previewQuality;
    U.$('#btnUndo').disabled = !S.canUndo();
    U.$('#btnRedo').disabled = !S.canRedo();
    updateTime(S.st.playhead);
    const empty = U.$('#emptyprev');
    if (empty) empty.style.display = p.tracks.video.length ? 'none' : 'flex';
  }
  function updateTime(t) {
    const total = M.totalDuration(S.project);
    const fps = Exporter.projectFps(S.project);
    const tc = U.$('#timecode');
    if (tc) tc.innerHTML = `${U.tc(t, true, fps)} <span class="tot">/ ${U.tc(total, true, fps)}</span>`;
    const sc = U.$('#scrub');
    if (sc && document.activeElement !== sc) sc.value = total > 0 ? Math.round(t / total * 1000) : 0;
  }
  function step(dir) {
    const fps = Exporter.projectFps(S.project);
    Playback.pause();
    S.seek(U.clamp(S.st.playhead + dir / fps, 0, M.totalDuration(S.project)));
  }
  function jumpClip(dir) {
    const v = S.project.tracks.video;
    if (!v.length) return;
    const t = S.st.playhead + (dir > 0 ? .05 : -.05);
    let target = 0;
    if (dir > 0) { const n = v.find(c => c.start > t); target = n ? n.start : M.totalDuration(S.project); }
    else { const prev = [...v].reverse().find(c => c.start < t - .1); target = prev ? prev.start : 0; }
    S.seek(target);
    const c = M.clipAt(S.project, target + .01); if (c) S.selectClips([c.id]);
  }
  function keys(e) {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (tag === 'button' && (e.key === ' ' || e.key === 'Enter')) return;
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? S.redo() : S.undo(); return; }
    if (ctrl && e.key.toLowerCase() === 'y') { e.preventDefault(); S.redo(); return; }
    if (ctrl && e.key.toLowerCase() === 's') { e.preventDefault(); Autosave.saveNow(false); return; }
    if (ctrl && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelected(); return; }
    switch (e.key) {
      case ' ': e.preventDefault(); Playback.toggle(); break;
      case 'Delete': case 'Backspace': e.preventDefault(); deleteSelected(e.shiftKey); break;
      case 's': case 'S': splitAtPlayhead(); break;
      case 'ArrowLeft': e.preventDefault(); step(-1); break;
      case 'ArrowRight': e.preventDefault(); step(1); break;
      case 'Home': S.seek(0); break;
      case 'End': S.seek(M.totalDuration(S.project)); break;
      case '+': case '=': Timeline.zoomIn(); break;
      case '-': case '_': Timeline.zoomOut(); break;
      case 'z': case 'Z': if (e.shiftKey) Timeline.zoomFit(); break;
      case 'b': case 'B': setCompare(!Playback.view.compare); break;
      case 'l': case 'L': setLoop(!Playback.view.loopClip); break;
    }
  }

  /* ---------- start ---------- */
  async function boot() {
    const ok = Renderer.init(U.$('#outcanvas'));
    if (!ok) U.toast('WebGL kunde inte startas', 'Previewn kan inte rendera i den här miljön. Timeline, analys och projekt fungerar ändå.', 'err');
    wire();
    Timeline.init();
    Panels.init();
    Autosave.init();
    applyPreviewSize();
    syncTopbar();
    Playback.start();
    new ResizeObserver(() => { fitStage(); }).observe(U.$('#stage'));

    try {
      await DB.open();
      const lastId = await DB.getMeta('lastProject');
      if (lastId) {
        const pr = await DB.getProject(lastId);
        if (pr && (pr.media.length || pr.tracks.video.length)) {
          S.setProject(pr);
          await Media.rehydrate(pr, () => { });
          const missing = pr.media.filter(m => m.missing);
          applyPreviewSize(); Timeline.zoomFit(); syncTopbar();
          Autosave.markClean('Sparad');
          U.toast('Senaste projektet återställt', pr.name + (missing.length ? ` · ${missing.length} mediefiler saknas` : ''));
        }
      }
    } catch (e) {
      U.toast('Lokal lagring ej tillgänglig', 'Projektet lever bara i den här fliken. ' + (DB.error || ''), 'warn');
    }
    state.ready = true;
    document.body.setAttribute('data-ready', '1');
  }

  return {
    state, boot, applyPreviewSize, fitStage, addMediaToTimeline, splitAtPlayhead, deleteSelected, deleteClip,
    duplicateSelected, runStabAnalysis, toggleStabOnClip, applyStabToAll, analyzeAllUsedMedia,
    autoEnhance, copyGradeToAll, openMatchClips, addText, addPropertyIntro, trimMusicToFilm, loopMusicToFilm,
    beatSyncSuggest, setCompare, setLoop, setZoomView, newProject, duplicateProject, exportProjectFile,
    importProjectFile, projectsModal, openProject, handleFiles,
    get cancelStab() { return cancelStab; }, set cancelStab(v) { cancelStab = v; },
  };
})();

document.addEventListener('DOMContentLoaded', () => App.boot());
