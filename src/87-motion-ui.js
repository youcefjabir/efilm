/* ============================================================
   87 — Motion: gränssnittet

   Tre steg för användaren: bilder → musik → skapa. All komplexitet
   (analys, regi, jobbkö, QC) ligger bakom en enkel progressvy.
   ============================================================ */
const Motion = (() => {
  const st = {
    step: 'images',
    images: [],            // media-objekt i vald ordning
    music: null,
    imageAnalysis: new Map(),
    musicAnalysis: null,
    plan: null,
    provider: 'local',
    targetDuration: 45,
    aspect: '16:9',
    propertyName: '',
    aiOrder: true,
    phase: '', progress: 0,
    result: null,
    credits: null,
  };
  let root = null;

  /* ---------- vy ---------- */
  function open() {
    if (!root) {
      root = U.el('div', { id: 'motionview' });
      document.body.append(root);
    }
    root.style.display = 'flex';
    document.body.classList.add('motion-open');
    render();
  }
  function close() {
    if (root) root.style.display = 'none';
    document.body.classList.remove('motion-open');
  }

  const shell = (title, sub, body, footer) => U.el('div', { class: 'mo-shell' },
    U.el('div', { class: 'mo-steps' }, ...['images', 'music', 'plan'].map((s, i) => {
      const order = ['images', 'music', 'plan'];
      const cur = order.indexOf(st.step === 'run' || st.step === 'done' ? 'plan' : st.step);
      return U.el('div', { class: 'mo-step' + (i === cur ? ' on' : '') + (i < cur ? ' past' : '') },
        U.el('span', { class: 'n', text: String(i + 1) }),
        ['Bilder', 'Musik', 'Motion'][i]);
    })),
    U.el('div', { class: 'mo-card' },
      U.el('h2', { text: title }),
      sub ? U.el('p', { class: 'mo-sub', text: sub }) : null,
      body),
    footer || null);

  function render() {
    if (!root) return;
    U.clear(root);
    root.append(U.el('button', { class: 'mo-close', onclick: close, 'data-tip': 'Stäng Motion' }, '✕'));
    const view = { images: viewImages, music: viewMusic, plan: viewPlan, run: viewRun, done: viewDone }[st.step];
    root.append(view());
  }

  /* ---------- steg 1: bilder ---------- */
  function viewImages() {
    const grid = U.el('div', { class: 'mo-grid' });
    st.images.forEach((m, i) => {
      const cell = U.el('div', {
        class: 'mo-img', draggable: 'true',
        ondragstart: e => { e.dataTransfer.setData('text/idx', String(i)); e.dataTransfer.effectAllowed = 'move'; },
        ondragover: e => { e.preventDefault(); cell.classList.add('over'); },
        ondragleave: () => cell.classList.remove('over'),
        ondrop: e => {
          e.preventDefault(); cell.classList.remove('over');
          const from = parseInt(e.dataTransfer.getData('text/idx'), 10);
          if (isNaN(from) || from === i) return;
          const [x] = st.images.splice(from, 1);
          st.images.splice(i, 0, x);
          st.aiOrder = false;
          render();
        },
      },
        U.el('img', { src: m.thumb, alt: m.name }),
        U.el('span', { class: 'idx', text: String(i + 1) }),
        U.el('button', {
          class: 'rm', 'data-tip': 'Ta bort',
          onclick: () => { st.images.splice(i, 1); render(); },
        }, '✕'),
        U.el('span', { class: 'nm', text: m.name }));
      grid.append(cell);
    });

    const drop = U.el('div', {
      class: 'mo-drop',
      onclick: () => pickFiles('image'),
      ondragover: e => { e.preventDefault(); drop.classList.add('over'); },
      ondragleave: () => drop.classList.remove('over'),
      ondrop: async e => {
        e.preventDefault(); drop.classList.remove('over');
        if (e.dataTransfer.files.length) await addFiles(e.dataTransfer.files);
      },
    },
      U.el('div', { style: { fontSize: '14px', color: 'var(--fg-1)' } }, st.images.length ? 'Lägg till fler bilder' : 'Släpp bostadsbilderna här'),
      U.el('div', { class: 'hint', style: { marginTop: '4px' } }, 'JPG, PNG eller WebP · eller klicka för att välja'));

    const aiRow = U.el('div', { class: 'mo-toggle' },
      U.el('div', {},
        U.el('div', { style: { fontSize: '12.5px', color: 'var(--fg-0)' } }, 'AI-bildordning'),
        U.el('div', { class: 'hint' }, 'Claude analyserar bilderna och bygger en logisk rundtur i stället för filordning.')),
      U.el('button', {
        class: 'mo-switch' + (st.aiOrder ? ' on' : ''),
        onclick: () => { st.aiOrder = !st.aiOrder; render(); },
      }, U.el('i')));

    const name = U.el('input', {
      type: 'text', placeholder: 'Adress eller projektnamn', value: st.propertyName,
      oninput: e => st.propertyName = e.target.value, style: { width: '100%' },
    });

    return shell('Välj bilder',
      st.images.length ? `${st.images.length} bilder valda. Du kan dra för att ändra ordning, och redigera allt efteråt.` : 'Börja med bilderna som ska bli film.',
      U.el('div', {}, drop, grid.children.length ? grid : null,
        U.el('div', { class: 'mo-field' }, U.el('label', {}, 'Bostad'), name), aiRow),
      U.el('div', { class: 'mo-foot' },
        U.el('span', { class: 'hint', text: st.images.length < 3 ? 'Minst 3 bilder behövs' : `${st.images.length} bilder` }),
        U.el('span', { class: 'spacer' }),
        U.el('button', {
          class: 'btn primary', disabled: st.images.length < 3,
          onclick: () => { st.step = 'music'; render(); },
        }, 'Fortsätt →')));
  }

  /* ---------- steg 2: musik ---------- */
  function viewMusic() {
    const list = U.el('div', { class: 'mo-tracks' });
    const tracks = S.project.media.filter(m => m.type === 'audio');
    if (!tracks.length) list.append(U.el('div', { class: 'hint', style: { padding: '10px 0' } }, 'Ingen musik importerad ännu.'));

    for (const m of tracks) {
      const sel = st.music && st.music.id === m.id;
      const wave = U.el('canvas', { class: 'mo-wave', width: 600, height: 40 });
      const row = U.el('div', {
        class: 'mo-track' + (sel ? ' on' : ''),
        onclick: () => { st.music = m; render(); },
      },
        U.el('button', {
          class: 'mo-play', onclick: e => { e.stopPropagation(); togglePlay(m); },
        }, playingId === m.id ? '❚❚' : '▶'),
        U.el('div', { class: 'mo-tmeta' },
          U.el('div', { class: 'nm', text: m.name.replace(/\.[^.]+$/, '') }),
          U.el('div', { class: 'hint mono' }, `${m.bpm ? m.bpm + ' BPM · ' : ''}${U.dur(m.duration)}${m.beats ? ' · ' + m.beats.length + ' transienter' : ''}`)),
        sel ? wave : U.el('span', { class: 'hint mono', text: U.dur(m.duration) }));
      list.append(row);
      if (sel) requestAnimationFrame(() => drawWave(wave, m));
    }

    return shell('Välj soundtrack',
      'Musiken är inte bakgrund — den bestämmer var filmen klipper.',
      U.el('div', {}, list,
        U.el('button', { class: 'btn', style: { marginTop: '10px' }, onclick: () => pickFiles('audio') }, 'Ladda upp musik'),
        U.el('div', { class: 'mo-field', style: { marginTop: '14px' } },
          U.el('label', {}, 'Ungefärlig filmlängd'),
          U.el('div', { class: 'row', style: { padding: 0, gap: '8px' } },
            ...[30, 45, 60, 90].map(v => U.el('button', {
              class: 'btn sm' + (st.targetDuration === v ? ' on' : ''),
              onclick: () => { st.targetDuration = v; render(); },
            }, v + ' s')))),
        U.el('div', { class: 'mo-field' },
          U.el('label', {}, 'Format'),
          U.el('div', { class: 'row', style: { padding: 0, gap: '8px' } },
            ...['16:9', '9:16', '4:5', '1:1'].map(a => U.el('button', {
              class: 'btn sm' + (st.aspect === a ? ' on' : ''),
              onclick: () => { st.aspect = a; render(); },
            }, a))))),
      U.el('div', { class: 'mo-foot' },
        U.el('button', { class: 'btn', onclick: () => { st.step = 'images'; render(); } }, '← Tillbaka'),
        U.el('span', { class: 'spacer' }),
        U.el('button', {
          class: 'btn primary', disabled: !st.music,
          onclick: () => startPlanning(),
        }, 'Fortsätt →')));
  }

  let playingId = null, audioEl = null;
  function togglePlay(m) {
    if (!audioEl) audioEl = new Audio();
    if (playingId === m.id) { audioEl.pause(); playingId = null; render(); return; }
    audioEl.src = m.url; audioEl.currentTime = 0;
    audioEl.play().catch(() => { });
    playingId = m.id;
    audioEl.onended = () => { playingId = null; render(); };
    render();
  }
  function drawWave(cv, m) {
    if (!m.wave) return;
    const g = cv.getContext('2d'), w = cv.width, h = cv.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(139,144,128,.75)';
    for (let x = 0; x < w; x++) {
      const v = (m.wave[Math.floor(x / w * m.wave.length)] / 255) * (h * .46);
      g.fillRect(x, h / 2 - v, 1, v * 2);
    }
  }

  /* ---------- steg 3: planen ---------- */
  async function startPlanning() {
    st.step = 'run'; st.phase = 'Analyserar bostaden'; st.progress = 0; render();
    try {
      st.imageAnalysis = await ImageAnalyze.analyzeAll(st.images, (p, name) => {
        st.phase = 'Analyserar bostaden'; st.progress = p * 0.5;
        st.detail = name || ''; renderProgress();
      });
      st.phase = 'Lyssnar igenom musiken'; st.progress = 0.55; renderProgress();
      await U.raf();
      st.musicAnalysis = MusicStructure.analyze(st.music);

      st.phase = 'Regisserar filmen'; st.progress = 0.8; renderProgress();
      await U.raf();
      st.plan = Director.buildPlan({
        assets: st.images, imageAnalysis: st.imageAnalysis, musicAnalysis: st.musicAnalysis,
        targetDuration: st.targetDuration, provider: st.provider, aspect: st.aspect,
      });
      const errs = Director.validate(st.plan, { assets: st.images, musicAnalysis: st.musicAnalysis, provider: st.provider });
      if (errs.length) console.warn('planvalidering', errs);
      st.planErrors = errs;
      st.step = 'plan'; render();
    } catch (e) {
      U.errToast('Kunde inte skapa planen', e);
      st.step = 'music'; render();
    }
  }

  function viewPlan() {
    const plan = st.plan;
    const cost = MM.planCost(plan, st.provider);
    const prov = MM.providerById(st.provider);

    const shots = U.el('div', { class: 'mo-shots' });
    plan.shots.forEach(s => {
      const a = st.images.find(x => x.id === s.assetId);
      shots.append(U.el('div', { class: 'mo-shot' },
        U.el('img', { src: a ? a.thumb : '', alt: '' }),
        U.el('div', { class: 'mo-shotmeta' },
          U.el('div', { class: 'top' },
            U.el('span', { class: 'tag accent', text: 'SHOT ' + String(s.index + 1).padStart(2, '0') }),
            roomSelect(s),
            s.role === 'hero' || s.role === 'closer' ? U.el('span', { class: 'tag ok', text: s.role.toUpperCase() }) : null,
            U.el('span', { class: 'tag', text: MM.moveById(s.movementId).name })),
          U.el('div', { class: 'hint', text: s.motivation }),
          U.el('div', { class: 'hint mono' },
            `${U.tc(s.timelineIn, false)}–${U.tc(s.timelineOut, false)} · ${s.timelineDuration}s i filmen · genererar ${s.generatedDuration}s, använder ${s.sourceIn}–${s.sourceOut}`))));
    });

    const provRow = U.el('div', { class: 'mo-field' },
      U.el('label', {}, 'Generering'),
      U.el('div', {},
        ...Object.values(MM.PROVIDERS).map(p => U.el('div', {
          class: 'preset-card' + (st.provider === p.id ? ' on' : ''), style: { margin: '4px 0' },
          onclick: () => { st.provider = p.id; st.plan.provider = p.id; render(); },
        },
          U.el('div', { style: { flex: '1' } },
            U.el('div', { class: 'pn' }, p.name,
              p.id !== 'stub' && p.creditsPer5s ? U.el('span', { class: 'tag warn', style: { marginLeft: '6px' }, text: MM.planCost(plan, p.id) + ' credits' }) : null),
            U.el('div', { class: 'pd', text: p.note }))))));

    const warn = [];
    if (plan.droppedImages) warn.push(`${plan.droppedImages} bilder rymdes inte i ${st.targetDuration} s — höj längden eller ta bort bilder.`);
    if (st.provider === 'higgsfield_kling3') {
      warn.push(`Genereringen kostar ${cost} credits av dina ${st.credits != null ? st.credits : '–'}.`);
      if (!Generation.bridgeAlive) warn.push('Ingen brygga ansluten: jobben läggs i kön och exporteras som manifest som Claude kör via Higgsfield MCP.');
    }
    if (st.planErrors && st.planErrors.length) warn.push('Planvarning: ' + st.planErrors[0]);

    return shell('Motion',
      plan.rationale,
      U.el('div', {},
        U.el('div', { class: 'mo-stats' },
          stat(st.images.length, 'bilder'),
          stat(plan.shots.length, 'shots'),
          stat(U.round(plan.duration, 1) + ' s', 'film'),
          stat(st.musicAnalysis.bpm + ' BPM', st.music.name.replace(/\.[^.]+$/, '')),
          stat(st.aiOrder ? 'AI' : 'Manuell', 'bildordning')),
        provRow,
        warn.length ? U.el('div', { class: 'mo-warn' }, ...warn.map(w => U.el('div', { text: w }))) : null,
        U.el('h3', { class: 'sectitle', text: 'Director Plan' }),
        U.el('div', { class: 'hint', style: { padding: '0 0 8px' } },
          'Rumstypen är ett förslag från bildanalysen. Ändra den om den är fel — planen regisseras om direkt.'),
        shots),
      U.el('div', { class: 'mo-foot' },
        U.el('button', { class: 'btn', onclick: () => { st.step = 'music'; render(); } }, '← Tillbaka'),
        U.el('span', { class: 'spacer' }),
        st.provider === 'higgsfield_kling3'
          ? U.el('button', { class: 'btn', onclick: exportManifest }, 'Exportera jobbmanifest')
          : null,
        U.el('button', { class: 'btn primary', onclick: confirmAndRun },
          st.provider === 'higgsfield_kling3' ? `Skapa Motion · ${cost} credits` : 'Skapa Motion')));
  }
  const stat = (v, l) => U.el('div', { class: 'mo-stat' }, U.el('b', { text: String(v) }), U.el('span', { text: l }));

  /** Rumstypen är ett förslag — användaren rättar den här och planen byggs om. */
  function roomSelect(s) {
    const f = st.imageAnalysis.get(s.assetId);
    const uncertain = f && f.roomUncertain;
    const sel = U.el('select', {
      class: 'mo-room' + (uncertain ? ' uncertain' : ''),
      'data-tip': uncertain ? 'Osäker gissning — välj rätt rum så byggs planen om' : 'Rumstyp',
      onchange: () => {
        if (f) { f.roomType = sel.value; f.roomUncertain = false; f.isDetail = sel.value === 'detail'; }
        rebuildPlan();
      },
    });
    MM.ROOMS.forEach(([id, name]) => sel.append(U.el('option', { value: id, selected: id === s.roomType }, name)));
    sel.value = s.roomType;
    return sel;
  }
  function rebuildPlan() {
    try {
      st.plan = Director.buildPlan({
        assets: st.images, imageAnalysis: st.imageAnalysis, musicAnalysis: st.musicAnalysis,
        targetDuration: st.targetDuration, provider: st.provider, aspect: st.aspect,
      });
      st.planErrors = Director.validate(st.plan, { assets: st.images, musicAnalysis: st.musicAnalysis, provider: st.provider });
      render();
      U.toast('Planen omregisserad', 'Ordning, längder och rörelser räknades om.');
    } catch (e) { U.errToast('Kunde inte bygga om planen', e); }
  }

  function exportManifest() {
    const man = Generation.manifest(st.plan, { id: st.plan.id, propertyName: st.propertyName || 'Motion' }, st.images);
    const blob = new Blob([JSON.stringify(man, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'motion-jobs.json';
    document.body.append(a); a.click(); a.remove();
    U.toast('Jobbmanifest exporterat', `${man.jobs.length} jobb · ${man.totalCredits} credits`);
  }

  function confirmAndRun() {
    if (st.provider !== 'higgsfield_kling3') return runGeneration();
    const cost = MM.planCost(st.plan, st.provider);
    U.modal({
      title: 'Bekräfta generering',
      body: U.el('div', {},
        U.el('div', { text: `${st.plan.shots.length} shots genereras med Kling v3.0.` }),
        U.el('div', { class: 'hint', style: { marginTop: '6px' } },
          `Detta drar ${cost} credits från ditt Higgsfield-konto${st.credits != null ? ` (saldo ${st.credits})` : ''}. Kostnaden är inte återbetalbar.`),
        !Generation.bridgeAlive ? U.el('div', { class: 'hint', style: { marginTop: '6px' } },
          'Ingen brygga är ansluten, så jobben läggs i kön utan att köras. Exportera manifestet och låt Claude köra dem via Higgsfield MCP.') : null),
      actions: [{ label: 'Avbryt' }, { label: `Generera för ${cost} credits`, primary: true, onclick: runGeneration }],
    });
  }

  /* ---------- körning ---------- */
  async function runGeneration() {
    st.step = 'run'; st.phase = 'Skapar kamerarörelser'; st.progress = 0; render();
    const off = Generation.bus.on('progress', s => {
      st.progress = s.total ? s.done / s.total : 0;
      st.detail = s.message; renderProgress();
    });
    try {
      const results = await Generation.runPlan(st.plan, { assets: st.images });
      st.phase = 'Bygger projektet'; st.progress = 0.97; renderProgress();
      const project = Generation.buildProject(st.plan, {
        assets: st.images, music: st.music, musicAssetId: st.music.id,
        musicAnalysis: st.musicAnalysis, propertyName: st.propertyName || 'Motion',
      }, results);
      for (const r of results) if (r.shot.needsStabilization) {
        const c = project.tracks.video.find(c => c.shotId === r.shot.id);
        if (c) c.stabEnabled = true;
      }
      st.result = { project, results };
      st.step = 'done'; render();
      await Autosave.saveNow(true);
    } catch (e) {
      U.errToast('Genereringen misslyckades', e);
      st.step = 'plan'; render();
    } finally { off(); }
  }

  function viewRun() {
    const phases = ['Analyserar bostaden', 'Lyssnar igenom musiken', 'Regisserar filmen', 'Skapar kamerarörelser', 'Bygger projektet'];
    return shell('Skapar din film', null,
      U.el('div', {},
        U.el('div', { class: 'progress', style: { margin: '18px 0 10px' } }, U.el('i', { id: 'mo-bar', style: { width: (st.progress * 100) + '%' } })),
        U.el('div', { class: 'mo-phases' }, ...phases.map(p => {
          const done = phases.indexOf(p) < phases.indexOf(st.phase);
          return U.el('div', { class: 'mo-phase' + (p === st.phase ? ' on' : '') + (done ? ' done' : '') },
            U.el('span', { class: 'dot' }), p);
        })),
        U.el('div', { class: 'hint', id: 'mo-detail', style: { marginTop: '10px' }, text: st.detail || '' })),
      U.el('div', { class: 'mo-foot' },
        U.el('span', { class: 'spacer' }),
        U.el('button', { class: 'btn danger', onclick: () => { Generation.cancel(); } }, 'Avbryt')));
  }
  function renderProgress() {
    const bar = document.getElementById('mo-bar');
    if (bar) bar.style.width = (st.progress * 100) + '%';
    const d = document.getElementById('mo-detail');
    if (d) d.textContent = st.detail || '';
    const phases = root && root.querySelectorAll('.mo-phase');
    if (phases) phases.forEach(el => el.classList.toggle('on', el.textContent.trim() === st.phase));
  }

  /* ---------- klar ---------- */
  function viewDone() {
    const r = st.result;
    const failed = r.results.filter(x => x.shot.status === 'qc_fail' || x.shot.status === 'failed').length;
    const stabbed = r.results.filter(x => x.shot.needsStabilization).length;
    return shell('Filmen är klar',
      `${r.results.length} shots · ${U.round(M.totalDuration(r.project), 1)} s · ${st.music.name.replace(/\.[^.]+$/, '')}`,
      U.el('div', {},
        U.el('div', { class: 'mo-stats' },
          stat(r.results.length, 'shots'),
          stat(U.round(M.totalDuration(r.project), 1) + ' s', 'längd'),
          stat(failed, 'QC-anmärkningar'),
          stat(stabbed, 'stabiliserade')),
        failed ? U.el('div', { class: 'mo-warn' }, U.el('div', { text: `${failed} shots klarade inte QC efter tre försök. Öppna i Master Editor och generera om dem.` })) : null,
        U.el('div', { class: 'hint', style: { marginTop: '10px' } },
          'Projektet ligger nu under Mina projekt med hela Director Plan, musikanalysen och alla shots.')),
      U.el('div', { class: 'mo-foot' },
        U.el('span', { class: 'spacer' }),
        U.el('button', { class: 'btn', onclick: () => { st.step = 'plan'; render(); } }, 'Se planen'),
        U.el('button', {
          class: 'btn primary', onclick: () => {
            Playback.releaseAll();
            S.setProject(st.result.project);
            App.applyPreviewSize(); Timeline.zoomFit();
            close();
            U.toast('Öppnad i Master Editor', 'Alla shots ligger på timelinen med musiken.');
          },
        }, 'Öppna i Master Editor →')));
  }

  /* ---------- filhantering ---------- */
  let pickKind = 'image';
  function pickFiles(kind) {
    pickKind = kind;
    const inp = U.$('#motionfiles');
    inp.accept = kind === 'audio' ? 'audio/*' : 'image/*';
    inp.click();
  }
  async function addFiles(files) {
    const t = U.toast('Importerar…');
    try {
      const items = await Media.ingestFiles(files);
      t.remove();
      if (!items.length) return;
      S.update(p => { p.media.push(...items); }, 'motion-import');
      for (const m of items) {
        if (m.type === 'image') st.images.push(m);
        else if (m.type === 'audio' && !st.music) st.music = m;
      }
      render();
    } catch (e) { t.remove(); U.errToast('Import misslyckades', e); }
  }

  function init() {
    const inp = U.el('input', { type: 'file', id: 'motionfiles', multiple: true, accept: 'image/*', style: { display: 'none' } });
    inp.addEventListener('change', async e => { await addFiles(e.target.files); e.target.value = ''; });
    document.body.append(inp);
    Generation.bus.on('bridge', () => { if (st.step === 'plan') render(); });
  }

  return { init, open, close, render, st, startPlanning, runGeneration };
})();
