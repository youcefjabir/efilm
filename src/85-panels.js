/* ============================================================
   85 — Vänsterpaneler + inspektor
   ============================================================ */
const Panels = (() => {
  const TABS = [
    ['media', 'Media'], ['stab', 'Stabilisering'], ['image', 'Bild'], ['motion', 'Rörelse'],
    ['trans', 'Övergångar'], ['audio', 'Ljud'], ['text', 'Text'], ['export', 'Export'],
  ];
  let active = 'media';
  const ui = { mediaView: 'grid', search: '', sort: 'added', filter: 'all', folder: 'Alla', stabBusy: null, matchRef: null, matchStats: null };

  function init() {
    const rail = U.$('#tabrail');
    U.clear(rail);
    TABS.forEach(([id, label]) => {
      const b = U.el('button', { class: 'tab' + (id === active ? ' on' : ''), 'data-tab': id, onclick: () => open(id) }, label);
      rail.append(b);
    });
    S.bus.on('change', () => { render(); Inspector.render(); });
    S.bus.on('selection', () => { render(); Inspector.render(); });
    S.bus.on('media', () => { if (active === 'media' || active === 'stab') render(); });
    render(); Inspector.render();
  }
  function open(tab) {
    active = tab;
    U.$$('#tabrail .tab').forEach(b => b.classList.toggle('on', b.getAttribute('data-tab') === tab));
    render();
  }
  function render() {
    const host = U.$('#panelbody');
    if (!host) return;
    const scrollTop = host.querySelector('.scroll') ? host.querySelector('.scroll').scrollTop : 0;
    U.clear(host);
    const fn = { media: mediaPanel, stab: stabPanel, image: imagePanel, motion: motionPanel, trans: transPanel, audio: audioPanel, text: textPanel, export: exportPanel }[active] || mediaPanel;
    host.append(fn());
    const sc = host.querySelector('.scroll'); if (sc) sc.scrollTop = scrollTop;
  }
  const panel = (title, right, ...body) => {
    const head = U.el('div', { class: 'panelhead' }, U.el('span', { class: 'title', text: title }), U.el('span', { class: 'spacer' }), right || null);
    const scroll = U.el('div', { class: 'scroll' }, ...body);
    return U.el('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 } }, head, scroll);
  };

  /* ==========================================================
     MEDIA
     ========================================================== */
  function mediaPanel() {
    const p = S.project;
    const dz = U.el('div', { id: 'dropzone', onclick: () => U.$('#fileinput').click() },
      U.el('div', { text: 'Ladda upp videoklipp' }),
      U.el('div', { class: 'hint', style: { marginTop: '3px' } }, 'Dra och släpp video eller musik här'));

    const tools = U.el('div', { class: 'row wrap' },
      U.el('input', { type: 'text', placeholder: 'Sök…', value: ui.search, style: { flex: '1' }, oninput: e => { ui.search = e.target.value; render(); } }),
      U.select([['added', 'Senast tillagd'], ['name', 'Namn'], ['duration', 'Längd'], ['used', 'Använd']], ui.sort, v => { ui.sort = v; render(); }, 'Sortering'),
    );
    const tools2 = U.el('div', { class: 'row wrap' },
      U.select([['all', 'Alla filer'], ['video', 'Endast video'], ['audio', 'Endast ljud'], ['used', 'I projektet'], ['unused', 'Ej använda'], ['stab', 'Stabiliserade']], ui.filter, v => { ui.filter = v; render(); }, 'Filter'),
      U.select(p.folders, ui.folder, v => { ui.folder = v; render(); }, 'Samling'),
      U.el('button', { class: 'btn sm', 'data-tip': 'Ny samling', onclick: newFolder }, '+'),
      U.el('span', { class: 'spacer' }),
      U.el('div', { class: 'seg' },
        U.el('button', { class: ui.mediaView === 'grid' ? 'on' : '', onclick: () => { ui.mediaView = 'grid'; render(); } }, 'Rutnät'),
        U.el('button', { class: ui.mediaView === 'list' ? 'on' : '', onclick: () => { ui.mediaView = 'list'; render(); } }, 'Lista')),
    );

    let list = p.media.filter(m => {
      if (ui.search && !m.name.toLowerCase().includes(ui.search.toLowerCase())) return false;
      if (ui.folder !== 'Alla' && m.folder !== ui.folder) return false;
      const used = Media.usedCount(p, m.id);
      if (ui.filter === 'video' && m.type !== 'video') return false;
      if (ui.filter === 'audio' && m.type !== 'audio') return false;
      if (ui.filter === 'used' && !used) return false;
      if (ui.filter === 'unused' && used) return false;
      if (ui.filter === 'stab' && !(m.stab && m.stab.status === 'analyzed')) return false;
      return true;
    });
    list.sort((a, b) => ui.sort === 'name' ? a.name.localeCompare(b.name)
      : ui.sort === 'duration' ? b.duration - a.duration
        : ui.sort === 'used' ? Media.usedCount(p, b.id) - Media.usedCount(p, a.id)
          : b.addedAt - a.addedAt);

    const grid = U.el('div', { class: 'mediagrid' + (ui.mediaView === 'list' ? ' list' : '') });
    if (!p.media.length) {
      grid.append(U.el('div', { class: 'empty' },
        U.el('div', { text: 'Mediabiblioteket är tomt' }),
        U.el('div', { class: 'hint' }, 'Importera dina bostadsklipp för att börja.')));
    }
    for (const m of list) grid.append(mediaItem(m, p));

    const stats = U.el('div', { class: 'row', style: { color: 'var(--fg-3)', fontSize: '10.5px' } },
      `${p.media.length} filer · ${U.bytes(p.media.reduce((a, m) => a + (m.size || 0), 0))}`);

    return panel('Mediabibliotek',
      U.el('button', { class: 'btn sm', onclick: () => U.$('#fileinput').click(), 'data-tip': 'Importera filer' }, 'Importera'),
      dz, tools, tools2, grid, stats);
  }

  function mediaItem(m, p) {
    const used = Media.usedCount(p, m.id);
    const selected = S.sel.media.includes(m.id);
    const st = m.stab || {};
    const node = U.el('div', {
      class: 'mitem' + (ui.mediaView === 'list' ? ' list-mode' : '') + (selected ? ' sel' : '') + (m.type === 'audio' ? ' audio' : ''),
      draggable: 'true',
      onclick: e => { S.selectMedia([m.id], e.shiftKey); },
      ondblclick: () => App.addMediaToTimeline(m),
      ondragstart: e => { e.dataTransfer.setData('text/media-id', m.id); e.dataTransfer.effectAllowed = 'copy'; },
    });
    if (m.type === 'audio') node.append(U.el('div', { class: 'thumb' }, '♪'));
    else if (m.thumb) node.append(U.el('img', { class: 'thumb', src: m.thumb, alt: m.name }));
    else node.append(U.el('div', { class: 'thumb' }));
    const sub = U.el('div', { class: 'sub' });
    if (m.type === 'video') {
      sub.append(U.el('span', { text: `${m.width}×${m.height}` }));
      sub.append(U.el('span', { text: m.fps ? `${m.fps} fps` : 'fps ?' }));
    } else sub.append(U.el('span', { text: m.bpm ? `${m.bpm} BPM` : 'ljud' }));
    sub.append(U.el('span', { text: U.bytes(m.size) }));
    node.append(U.el('div', { class: 'meta' }, U.el('div', { class: 'nm', text: m.name, title: m.name }), sub));
    node.append(U.el('span', { class: 'dur', text: U.dur(m.duration) }));
    const bd = U.el('div', { class: 'badges' });
    if (m.missing) bd.append(U.el('span', { class: 'tag danger', text: 'SAKNAS' }));
    if (used) bd.append(U.el('span', { class: 'tag accent', text: '×' + used }));
    if (st.status === 'analyzed') bd.append(U.el('span', { class: 'tag ok', text: 'STAB' }));
    if (st.status === 'analyzing') bd.append(U.el('span', { class: 'tag warn', text: 'ANALYS…' }));
    if (st.status === 'error') bd.append(U.el('span', { class: 'tag danger', text: 'FEL' }));
    node.append(bd);
    const acts = U.el('div', { class: 'acts' },
      U.el('button', { class: 'btn icon sm', 'data-tip': 'Lägg på timeline', onclick: e => { e.stopPropagation(); App.addMediaToTimeline(m); } }, '+'),
      m.type === 'video' ? U.el('button', { class: 'btn icon sm', 'data-tip': 'Stabilisering', onclick: e => { e.stopPropagation(); S.selectMedia([m.id]); open('stab'); } }, '≋') : null,
      U.el('button', { class: 'btn icon sm danger', 'data-tip': 'Ta bort ur biblioteket', onclick: e => { e.stopPropagation(); confirmDelete(m); } }, '×'));
    node.append(acts);
    return node;
  }
  function confirmDelete(m) {
    const used = Media.usedCount(S.project, m.id);
    U.modal({
      title: 'Ta bort media',
      body: U.el('div', {}, U.el('div', { text: `Ta bort "${m.name}" ur biblioteket?` }),
        used ? U.el('div', { class: 'hint', style: { marginTop: '6px' } }, `Filen används i ${used} klipp på timelinen. De tas också bort.`) : null),
      actions: [{ label: 'Avbryt' }, {
        label: 'Ta bort', danger: true, onclick: () => {
          S.update(p => { Media.removeMedia(p, m.id); M.relayout(p.tracks.video); }, 'delete-media');
          U.toast('Media borttagen', m.name);
        }
      }],
    });
  }
  function newFolder() {
    const inp = U.el('input', { type: 'text', placeholder: 'Namn på samling', style: { width: '100%' } });
    U.modal({
      title: 'Ny samling', body: inp,
      actions: [{ label: 'Avbryt' }, {
        label: 'Skapa', primary: true, onclick: () => {
          const v = inp.value.trim(); if (!v) return;
          S.update(p => { if (!p.folders.includes(v)) p.folders.push(v); }, 'folder');
          ui.folder = v; render();
        }
      }],
    });
  }

  /* ==========================================================
     STABILISERING
     ========================================================== */
  function stabPanel() {
    const media = S.primaryMedia();
    const clip = S.primaryClip();
    if (!media || media.type !== 'video') {
      return panel('Stabilisering', null, U.el('div', { class: 'empty' },
        U.el('div', { text: 'Välj ett videoklipp' }),
        U.el('div', { class: 'hint' }, 'Markera ett klipp på timelinen eller en fil i mediabiblioteket för att analysera kamerarörelsen.')));
    }
    const st = media.stab || (media.stab = { status: 'none' });
    const settings = Stab.settingsFor(media);
    const body = [];

    body.push(U.el('div', { class: 'row', style: { paddingTop: '8px' } },
      media.thumb ? U.el('img', { src: media.thumb, style: { width: '64px', borderRadius: '2px' } }) : null,
      U.el('div', { style: { minWidth: 0 } },
        U.el('div', { style: { fontSize: '11.5px', overflow: 'hidden', textOverflow: 'ellipsis' }, text: media.name }),
        U.el('div', { class: 'hint mono' }, `${media.width}×${media.height} · ${U.dur(media.duration)}${media.fps ? ' · ' + media.fps + ' fps' : ''}`))));

    // --- analys ---
    if (st.status === 'analyzing') {
      const bar = U.el('div', { class: 'progress' }, U.el('i', { style: { width: (ui.stabBusy ? ui.stabBusy.pct : 0) * 100 + '%' } }));
      body.push(U.section('Analys pågår'), bar,
        U.el('div', { class: 'row hint', text: ui.stabBusy ? ui.stabBusy.msg : 'Startar…' }),
        U.el('div', { class: 'row' }, U.el('button', { class: 'btn sm', onclick: () => { App.cancelStab = true; } }, 'Avbryt')));
    } else {
      body.push(U.el('div', { class: 'row' },
        U.el('button', {
          class: 'btn primary', style: { flex: '1' }, 'data-tip': 'Spårar riktig rörelse i bilden — kan ta några sekunder',
          onclick: () => App.runStabAnalysis(media),
        }, st.status === 'analyzed' ? 'Analysera om' : 'Analysera klippet'),
        st.status === 'analyzed' ? U.el('button', { class: 'btn', 'data-tip': 'Aktivera stabilisering på markerat klipp', onclick: () => App.toggleStabOnClip(true) }, 'Applicera') : null));
      if (st.status === 'error') body.push(U.el('div', { class: 'row' }, U.el('span', { class: 'tag danger', text: 'Analysen misslyckades' })), U.el('div', { class: 'row hint', text: st.error || '' }));
    }

    // --- rapport ---
    if (st.report) {
      const r = st.report;
      body.push(U.section('Analysrapport'));
      const rep = U.el('div', { class: 'report' });
      const meter = (label, score, text) => U.el('div', { class: 'rrow' },
        U.el('span', { class: 'k', text: label }),
        U.el('span', { class: 'meter' }, U.el('i', { class: score > .7 ? 'danger' : score > .42 ? 'warn' : '', style: { width: U.clamp(score, 0, 1) * 100 + '%' } })),
        U.el('span', { class: 'v mono', style: { flex: '0 0 92px', textAlign: 'right' }, text }));
      rep.append(U.el('div', { class: 'rrow' }, U.el('span', { class: 'k', text: 'Rörelsetyp' }), U.el('span', { class: 'v', text: r.motionTypes.join(', ') })));
      rep.append(meter('Skakningsnivå', r.shake.score, `${r.shake.label} · ${r.shake.pct} %`));
      rep.append(meter('Vertikal bob', r.bob.score, r.bob.hz ? `${r.bob.amplitudePct} % @ ${r.bob.hz} Hz` : 'ingen'));
      rep.append(meter('Rotationsdrift', r.rotation.score, `${r.rotation.rangeDeg}° spann`));
      rep.append(meter('Perspektivförändring', r.perspective.score, `${r.perspective.scalePct} % skala`));
      rep.append(meter('Wobble-risk', r.wobble.score, `${r.wobble.label}`));
      rep.append(U.el('div', { class: 'rrow' }, U.el('span', { class: 'k', text: 'Ojämn hastighet' }), U.el('span', { class: 'v mono', text: r.speedIrregularity.toFixed(2) + ' (0 = jämn)' })));
      rep.append(U.el('div', { class: 'rrow' }, U.el('span', { class: 'k', text: 'Plötsliga ryck' }), U.el('span', { class: 'v mono', text: r.jerks + ' st' })));
      rep.append(U.el('div', { class: 'rrow' }, U.el('span', { class: 'k', text: 'Spårningskvalitet' }), U.el('span', { class: 'v mono', text: Math.round(r.trackingQuality * 100) + ' % inliers · ' + r.samples + ' sampel' })));
      rep.append(U.el('div', { class: 'rrow' }, U.el('span', { class: 'k', text: 'Rekommendation' }),
        U.el('span', { class: 'v' }, U.el('span', { class: 'tag accent', text: M.stabModeById(r.recommended).name }), ' ', r.why)));
      const corr = Stab.corrFor(media);
      rep.append(U.el('div', { class: 'rrow' }, U.el('span', { class: 'k', text: 'Beräknad crop' }),
        U.el('span', { class: 'v mono', text: (corr ? corr.cropPct : r.estimatedCrop) + ' % per sida' })));
      body.push(rep);
      if (r.unsalvageable) body.push(U.el('div', { class: 'row' }, U.el('span', { class: 'tag danger', text: 'VARNING' })), U.el('div', { class: 'row hint', text: r.note }));
      if (corr && corr.limited) body.push(U.el('div', { class: 'row hint', text: corr.note }));
    }

    // --- lägen ---
    body.push(U.section('Stabiliseringsläge'));
    for (const mode of M.STAB_MODES) {
      const on = settings.mode === mode.id;
      const rec = st.report && st.report.recommended === mode.id;
      body.push(U.el('div', {
        class: 'preset-card' + (on ? ' on' : ''),
        onclick: () => { S.update(() => { media.stab.settings = Stab.applyMode(media, mode.id); media.stab.corr = null; }, 'stab-mode'); render(); },
      }, U.el('div', { style: { flex: '1' } },
        U.el('div', { class: 'pn' }, mode.name, on && mode.id === 'auto' && settings.autoResolved ? U.el('span', { class: 'tag accent', style: { marginLeft: '5px' }, text: M.stabModeById(settings.autoResolved).name }) : null,
          rec ? U.el('span', { class: 'tag ok', style: { marginLeft: '5px' }, text: 'REK' }) : null),
        U.el('div', { class: 'pd', text: mode.desc }))));
    }

    // --- kontroller ---
    body.push(U.section('Kontroller'));
    for (const [key, label, min, max, step] of M.STAB_DEFS) {
      body.push(U.slider(label, settings[key], min, max, step, v => {
        S.update(() => { media.stab.settings = { ...settings, [key]: v, mode: settings.mode === 'auto' ? 'auto' : settings.mode }; media.stab.corr = null; }, 'stab-' + key, true);
      }, { def: M.STAB_DEFS.find(d => d[0] === key)[5], fmt: v => step >= 1 ? v.toFixed(0) : v.toFixed(1) }));
    }
    for (const [key, label, def, tip] of M.STAB_FLAGS) {
      body.push(U.check(label, settings[key], v => {
        S.update(() => { media.stab.settings = { ...settings, [key]: v }; media.stab.corr = null; }, 'stab-' + key);
      }, tip));
    }

    // --- före/efter ---
    body.push(U.section('Före / efter'));
    body.push(U.el('div', { class: 'row wrap' },
      U.el('button', { class: 'btn sm' + (Playback.view.compare ? ' on' : ''), onclick: () => App.setCompare(!Playback.view.compare) }, 'Split screen'),
      U.el('button', { class: 'btn sm' + (Playback.view.loopClip ? ' on' : ''), onclick: () => App.setLoop(!Playback.view.loopClip) }, 'Loop'),
      U.el('button', { class: 'btn sm' + (Playback.view.zoomView ? ' on' : ''), onclick: () => App.setZoomView(!Playback.view.zoomView) }, 'Detaljvy 200 %'),
      clip ? U.el('button', { class: 'btn sm' + (clip.stabEnabled ? ' on' : ''), onclick: () => App.toggleStabOnClip(!clip.stabEnabled) }, clip.stabEnabled ? 'Stabilisering PÅ' : 'Stabilisering AV') : null));
    body.push(U.slider('Jämförelselinje', Playback.view.compareX * 100, 0, 100, 1, v => { Playback.view.compareX = v / 100; }, { def: 50, fmt: v => v.toFixed(0) + ' %' }));

    body.push(U.section('Applicera'));
    body.push(U.el('div', { class: 'row wrap' },
      U.el('button', { class: 'btn sm', onclick: () => App.applyStabToAll(media) }, 'Alla klipp med denna fil'),
      U.el('button', { class: 'btn sm', onclick: () => App.analyzeAllUsedMedia() }, 'Analysera alla klipp i projektet')));

    body.push(U.section('Vad som faktiskt görs'));
    body.push(U.el('div', { class: 'row hint', style: { display: 'block' } },
      'Spårning: Harris-hörn viktade mot raka linjer (dörrkarmar, fönster, väggmöten), grov-till-fin blockmatchning i tre nivåer, robust affinanpassning med IRLS. ' +
      'Korrigering: banan jämnas ut per kanal (x, y, rotation, skala, shear, aspekt) och skillnaden appliceras som en homografi i GPU-renderingen — samma transform i preview och export. ' +
      'Begränsning: korrigeringen är global per bildruta. Äkta icke-rigid wobble (böjda väggar i AI-klipp) dämpas men försvinner inte helt; det kräver mesh-warp per pixel som inte ryms i den här körmiljön.'));
    return panel('Stabilisering', null, ...body);
  }

  /* ==========================================================
     BILD (färg)
     ========================================================== */
  function imagePanel() {
    const clip = S.primaryClip();
    if (!clip || clip.kind !== 'video') return panel('Bild', null, emptySel('Markera ett videoklipp för att färgsätta det.'));
    const media = M.mediaById(S.project, clip.mediaId);
    const body = [];
    body.push(U.section('Preset-filter för bostadsfilm'));
    const grid = U.el('div', { class: 'fgrid' });
    for (const f of M.FILTERS) {
      const sw = U.el('div', { class: 'fsw' + (clip.filter === f.id ? ' on' : ''), onclick: () => S.update(p => { M.findClip(p, clip.id).filter = f.id; }, 'filter'), 'data-tip': f.desc });
      const cv = U.el('canvas', { width: 96, height: 54 });
      sw.append(cv, U.el('span', { text: f.name }));
      grid.append(sw);
      if (media && media.thumb) drawSwatch(cv, media.thumb, f);
    }
    body.push(grid);
    body.push(U.slider('Intensitet', clip.filterIntensity, 0, 100, 1, v => S.update(p => { M.findClip(p, clip.id).filterIntensity = v; }, 'fint', true), { def: 100, fmt: v => v.toFixed(0) + ' %' }));
    body.push(U.el('div', { class: 'row' },
      U.el('button', { class: 'btn sm', onclick: () => S.update(p => { const c = M.findClip(p, clip.id); c.grade = M.emptyGrade(); c.filter = 'none'; c.filterIntensity = 100; }, 'reset-grade') }, 'Återställ allt'),
      U.el('button', { class: 'btn sm' + (Playback.view.compare ? ' on' : ''), onclick: () => App.setCompare(!Playback.view.compare) }, 'Före/efter'),
      U.el('button', { class: 'btn sm', onclick: () => App.copyGradeToAll(clip) }, 'Kopiera till alla')));

    body.push(U.section('Smart automatisk korrigering'));
    body.push(U.el('div', { class: 'row' },
      U.el('button', { class: 'btn primary', style: { flex: '1' }, onclick: () => App.autoEnhance(clip) }, 'Auto Enhance for Real Estate')));
    body.push(U.el('div', { class: 'row hint', style: { display: 'block' } }, 'Analyserar en riktig bildruta ur klippet och föreslår justeringar. Inget appliceras förrän du godkänner.'));

    body.push(U.section('Match Clips'));
    body.push(U.el('div', { class: 'row' }, U.el('button', { class: 'btn', style: { flex: '1' }, onclick: () => App.openMatchClips() }, 'Matcha klippen mot ett referensklipp')));

    body.push(U.section('Manuella kontroller'));
    for (const [key, label, min, max, step, def] of M.GRADE_DEFS) {
      body.push(U.slider(label, clip.grade[key], min, max, step, v => S.update(p => { M.findClip(p, clip.id).grade[key] = v; }, 'g-' + key, true),
        { def, fmt: v => step < 1 ? v.toFixed(2) : v.toFixed(0) }));
    }
    return panel('Bild', null, ...body);
  }
  function drawSwatch(cv, thumbSrc, f) {
    const img = new Image();
    img.onload = () => {
      const g = cv.getContext('2d');
      const gr = { ...M.emptyGrade(), ...f.g };
      // approximativ förhandsvisning med canvas-filter (den riktiga körs i GPU-shadern)
      const br = Math.pow(2, gr.exposure) * (1 + gr.shadows / 500 - gr.highlights / 900);
      const ct = 1 + gr.contrast / 160, sa = 1 + gr.saturation / 130 + gr.vibrance / 260;
      const hue = gr.temperature * -0.06 + gr.tint * 0.05;
      g.filter = `brightness(${br.toFixed(3)}) contrast(${ct.toFixed(3)}) saturate(${sa.toFixed(3)}) hue-rotate(${hue.toFixed(1)}deg) sepia(${Math.max(0, gr.temperature) / 400})`;
      g.drawImage(img, 0, 0, cv.width, cv.height);
      g.filter = 'none';
    };
    img.src = thumbSrc;
  }
  const emptySel = msg => U.el('div', { class: 'empty' }, U.el('div', { text: 'Inget klipp markerat' }), U.el('div', { class: 'hint' }, msg));

  /* ==========================================================
     RÖRELSE
     ========================================================== */
  function motionPanel() {
    const clip = S.primaryClip();
    if (!clip || clip.kind !== 'video') return panel('Rörelse', null, emptySel('Markera ett videoklipp för att lägga till kamerarörelse.'));
    const mo = clip.motion;
    const body = [U.section('Rörelsepresets')];
    for (const p0 of M.MOTION_PRESETS) {
      body.push(U.el('div', {
        class: 'preset-card' + (mo.preset === p0.id ? ' on' : ''),
        onclick: () => S.update(p => { const c = M.findClip(p, clip.id); c.motion = { ...M.emptyMotion(), preset: p0.id }; }, 'motion'),
      }, U.el('div', { style: { flex: '1' } }, U.el('div', { class: 'pn', text: p0.name }), U.el('div', { class: 'pd', text: p0.desc }))));
    }
    body.push(U.section('Justering'));
    const set = (k, v) => S.update(p => { M.findClip(p, clip.id).motion[k] = v; }, 'mo-' + k, true);
    body.push(U.slider('Rörelsestyrka', mo.strength, 0, 200, 1, v => set('strength', v), { def: 100, fmt: v => v + ' %' }));
    body.push(U.slider('Startpunkt', mo.start * 100, 0, 99, 1, v => set('start', v / 100), { def: 0, fmt: v => v + ' %' }));
    body.push(U.slider('Slutpunkt', mo.end * 100, 1, 100, 1, v => set('end', v / 100), { def: 100, fmt: v => v + ' %' }));
    body.push(U.lrow('Easing', U.select(M.EASINGS, mo.easing, v => set('easing', v))));
    body.push(U.slider('Hastighet', mo.speed, .2, 3, .05, v => set('speed', v), { def: 1, fmt: v => v.toFixed(2) + '×' }));
    body.push(U.slider('Horisontell riktning', mo.dirX, -30, 30, .5, v => set('dirX', v), { def: 0 }));
    body.push(U.slider('Vertikal riktning', mo.dirY, -30, 30, .5, v => set('dirY', v), { def: 0 }));
    body.push(U.slider('Zoom', mo.zoom, -30, 30, .5, v => set('zoom', v), { def: 0 }));
    body.push(U.slider('Rotation', mo.rot, -5, 5, .1, v => set('rot', v), { def: 0 }));
    body.push(U.slider('Tilt (perspektiv)', mo.tilt, -5, 5, .1, v => set('tilt', v), { def: 0 }));
    body.push(U.slider('Crop compensation', mo.cropComp, 0, 200, 1, v => set('cropComp', v), { def: 100, fmt: v => v + ' %' }));
    body.push(U.el('div', { class: 'row hint', style: { display: 'block' } }, 'Rörelsen renderas i GPU:n ovanpå stabiliseringen. Crop compensation zoomar in så att inga tomma kanter syns när bilden panorerar.'));
    return panel('Rörelse', null, ...body);
  }

  /* ==========================================================
     ÖVERGÅNGAR
     ========================================================== */
  function transPanel() {
    const p = S.project;
    const clip = S.primaryClip();
    const idx = clip ? p.tracks.video.findIndex(c => c.id === clip.id) : -1;
    const body = [];
    if (idx <= 0) {
      body.push(U.el('div', { class: 'row hint', style: { display: 'block' } },
        idx === 0 ? 'Första klippet har ingen ingående övergång. Markera ett senare klipp.' : 'Markera ett klipp på timelinen för att sätta dess ingående övergång.'));
    } else {
      const tr = clip.transitionIn;
      body.push(U.section('Övergång in i markerat klipp'));
      for (const t of M.TRANSITIONS) {
        body.push(U.el('div', {
          class: 'preset-card' + (tr.type === t.id ? ' on' : ''),
          onclick: () => S.update(pp => { const c = M.findClip(pp, clip.id); c.transitionIn = { type: t.id, dur: t.defDur }; }, 'trans'),
        }, U.el('div', { style: { flex: '1' } }, U.el('div', { class: 'pn', text: t.name }), U.el('div', { class: 'pd', text: t.desc }))));
      }
      if (tr.type !== 'cut') {
        body.push(U.slider('Längd', tr.dur, .1, 2.5, .05, v => S.update(pp => { M.findClip(pp, clip.id).transitionIn.dur = v; }, 'trd', true), { def: M.transById(tr.type).defDur, fmt: v => v.toFixed(2) + ' s' }));
      }
    }
    body.push(U.section('Alla klipp'));
    const sel = U.select(M.TRANSITIONS.map(t => [t.id, t.name]), 'dissolve', () => { });
    const dur = U.num(0.4, () => { }, { step: .1, min: .1, max: 2.5, w: 60 });
    body.push(U.lrow('Typ', sel), U.lrow('Längd (s)', dur));
    body.push(U.el('div', { class: 'row' }, U.el('button', {
      class: 'btn', style: { flex: '1' },
      onclick: () => {
        const type = sel.value, d = parseFloat(dur.value) || 0.4;
        S.update(pp => { pp.tracks.video.forEach((c, i) => { if (i > 0) c.transitionIn = { type, dur: type === 'cut' ? 0 : d }; }); }, 'trans-all');
        U.toast('Övergång applicerad mellan alla klipp', M.transById(type).name);
      }
    }, 'Applicera mellan alla klipp')));
    body.push(U.el('div', { class: 'row hint', style: { display: 'block' } },
      'Standard är clean cut. Övergången läggs centrerad över klippunkten och använder material utanför in-/utpunkten när det finns — timelinens totala längd påverkas inte.'));
    return panel('Övergångar', null, ...body);
  }

  /* ==========================================================
     LJUD
     ========================================================== */
  function audioPanel() {
    const p = S.project;
    const body = [];
    body.push(U.el('div', { class: 'row' },
      U.el('button', { class: 'btn primary', style: { flex: '1' }, onclick: () => U.$('#fileinput').click() }, 'Ladda upp musik')));
    const tracks = p.media.filter(m => m.type === 'audio');
    if (tracks.length) {
      body.push(U.section('Ljudfiler'));
      for (const m of tracks) {
        body.push(U.el('div', { class: 'row' },
          U.el('div', { style: { flex: '1', minWidth: 0, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis' }, text: m.name }),
          U.el('span', { class: 'hint mono', text: U.dur(m.duration) + (m.bpm ? ` · ${m.bpm} BPM` : '') }),
          U.el('button', { class: 'btn sm', onclick: () => App.addMediaToTimeline(m, 0) }, 'Lägg till')));
      }
    }
    const clips = p.tracks.music;
    if (!clips.length) {
      body.push(U.el('div', { class: 'row hint', style: { display: 'block' } }, 'Ingen musik på timelinen ännu. Musiken hamnar på ett eget spår och kan trimmas, fadas och beat-synkas.'));
    }
    for (const c of clips) {
      const m = M.mediaById(p, c.mediaId);
      body.push(U.section((m ? m.name : 'Musik')));
      const set = (k, v) => S.update(pp => { const x = M.findClip(pp, c.id); if (k.includes('.')) { const [a, b] = k.split('.'); x[a][b] = v; } else x[k] = v; }, 'a-' + k, true);
      body.push(U.slider('Volym', c.volume, 0, 100, 1, v => set('volume', v), { def: 80, fmt: v => v + ' %' }));
      body.push(U.slider('Fade in', c.fade.in, 0, 8, .1, v => set('fade.in', v), { def: 1.2, fmt: v => v.toFixed(1) + ' s' }));
      body.push(U.slider('Fade out', c.fade.out, 0, 8, .1, v => set('fade.out', v), { def: 2, fmt: v => v.toFixed(1) + ' s' }));
      body.push(U.el('div', { class: 'row wrap' },
        U.el('button', { class: 'btn sm' + (c.muted ? ' on' : ''), onclick: () => set('muted', !c.muted) }, 'Mute'),
        U.el('button', { class: 'btn sm' + (c.loop ? ' on' : ''), onclick: () => App.loopMusicToFilm(c) }, 'Loopa till filmens längd'),
        U.el('button', { class: 'btn sm' + (c.duck ? ' on' : ''), onclick: () => set('duck', !c.duck), 'data-tip': 'Sänker originalljudet när musiken spelar' }, 'Auto duck'),
        U.el('button', { class: 'btn sm', onclick: () => App.trimMusicToFilm(c) }, 'Trimma till filmen'),
        U.el('button', { class: 'btn sm danger', onclick: () => App.deleteClip(c.id) }, 'Ta bort')));
      if (m && m.beats && m.beats.length) {
        body.push(U.el('div', { class: 'row wrap' },
          U.el('span', { class: 'hint', text: `${m.beats.length} transienter${m.bpm ? ` · ~${m.bpm} BPM` : ''}` }),
          U.el('button', { class: 'btn sm' + (App.state.showBeats ? ' on' : ''), onclick: () => { App.state.showBeats = !App.state.showBeats; Timeline.render(); render(); } }, 'Visa beats'),
          U.el('button', { class: 'btn sm' + (App.state.snapBeats ? ' on' : ''), onclick: () => { App.state.snapBeats = !App.state.snapBeats; render(); } }, 'Snappa till beat'),
          U.el('button', { class: 'btn sm', onclick: () => App.beatSyncSuggest(c) }, 'Beat Sync — föreslå klippunkter')));
      }
    }
    body.push(U.section('Master'));
    body.push(U.slider('Master volume', p.masterVolume, 0, 100, 1, v => { S.update(pp => { pp.masterVolume = v; }, 'master', true); Playback.setMasterVolume(v / 100); }, { def: 100, fmt: v => v + ' %' }));
    body.push(U.check('Exportera med ljud', p.export.audio, v => S.update(pp => { pp.export.audio = v; }, 'exaudio')));
    return panel('Ljud', null, ...body);
  }

  /* ==========================================================
     TEXT
     ========================================================== */
  function textPanel() {
    const p = S.project;
    const body = [U.section('Lägg till text')];
    for (const t of M.TEXT_PRESETS) {
      body.push(U.el('div', {
        class: 'preset-card', onclick: () => App.addText(t.id),
      }, U.el('div', { style: { flex: '1' } }, U.el('div', { class: 'pn', text: t.name }), U.el('div', { class: 'pd', text: 'Minimalistisk, för premium bostadsfilm' }))));
    }
    const sel = S.selectedClips().find(c => c.kind === 'text');
    if (sel) {
      body.push(U.section('Redigera text'));
      const set = (k, v) => S.update(pp => { const x = M.findClip(pp, sel.id); if (k.includes('.')) { const [a, b] = k.split('.'); x[a][b] = v; } else x[k] = v; }, 't-' + k, true);
      const ti = U.el('input', { type: 'text', value: sel.title || '', style: { flex: '1' }, oninput: e => set('title', e.target.value) });
      const su = U.el('input', { type: 'text', value: sel.sub || '', style: { flex: '1' }, oninput: e => set('sub', e.target.value) });
      body.push(U.lrow('Rubrik', ti), U.lrow('Underrad', su));
      body.push(U.lrow('Placering', U.select([['lower', 'Nedre'], ['center', 'Mitten'], ['upper', 'Övre']], sel.pos, v => set('pos', v)),
        U.select([['left', 'Vänster'], ['center', 'Mitten'], ['right', 'Höger']], sel.align, v => set('align', v))));
      body.push(U.slider('Storlek', sel.size, 1.5, 9, .1, v => set('size', v), { def: 4, fmt: v => v.toFixed(1) + ' %' }));
      body.push(U.slider('Längd', sel.duration, .5, 12, .1, v => set('duration', v), { def: 3.5, fmt: v => v.toFixed(1) + ' s' }));
      body.push(U.slider('Fade in', sel.fade.in, 0, 3, .1, v => set('fade.in', v), { def: .5, fmt: v => v.toFixed(1) + ' s' }));
      body.push(U.slider('Fade out', sel.fade.out, 0, 3, .1, v => set('fade.out', v), { def: .5, fmt: v => v.toFixed(1) + ' s' }));
      body.push(U.slider('Opacitet', sel.opacity, 0, 100, 1, v => set('opacity', v), { def: 100, fmt: v => v + ' %' }));
      body.push(U.el('div', { class: 'row' },
        U.el('button', { class: 'btn sm', onclick: () => S.seek(sel.start) }, 'Gå till'),
        U.el('button', { class: 'btn sm danger', onclick: () => App.deleteClip(sel.id) }, 'Ta bort')));
    }
    body.push(U.section('Bostadsinformation'));
    body.push(U.el('div', { class: 'row hint', style: { display: 'block' } },
      'Fyll i adress, ort, antal rum, boarea och mäklare i fälten ovan — presets är byggda för att hålla texten sekundär mot bilden.'));
    body.push(U.el('div', { class: 'row' }, U.el('button', { class: 'btn sm', onclick: () => App.addPropertyIntro() }, 'Skapa intro + slutkort automatiskt')));
    return panel('Text', null, ...body);
  }

  /* ==========================================================
     EXPORT
     ========================================================== */
  function exportPanel() {
    const p = S.project, x = p.export;
    const body = [];
    body.push(U.section('Exportpresets'));
    for (const pr of Exporter.PRESETS) {
      body.push(U.el('div', {
        class: 'preset-card' + (x.preset === pr.id ? ' on' : ''),
        onclick: () => { S.update(pp => { Object.assign(pp.export, { preset: pr.id, quality: pr.quality }); Object.assign(pp.settings, pr.settings); }, 'export-preset'); App.applyPreviewSize(); },
      }, U.el('div', { style: { flex: '1' } }, U.el('div', { class: 'pn', text: pr.name }), U.el('div', { class: 'pd', text: pr.desc }))));
    }
    body.push(U.section('Inställningar'));
    body.push(U.lrow('Format', U.select(Object.keys(U.ASPECTS), p.settings.aspect, v => S.update(pp => { pp.settings.aspect = v; }, 'aspect'))));
    body.push(U.lrow('Upplösning', U.select(M.RESOLUTIONS, p.settings.resolution, v => S.update(pp => { pp.settings.resolution = +v; }, 'res'))));
    body.push(U.lrow('Framerate', U.select(M.FPS_OPTS, p.settings.fps, v => S.update(pp => { pp.settings.fps = v === 'source' ? 'source' : +v; }, 'fps'))));
    body.push(U.lrow('Codec', U.select(Exporter.codecOptions(), x.container, v => S.update(pp => { pp.export.container = v; }, 'codec'))));
    body.push(U.slider('Quality (Mbit/s)', x.quality, 2, 60, 1, v => S.update(pp => { pp.export.quality = v; }, 'q', true), { def: 12, fmt: v => v + ' Mbps' }));
    const fn = U.el('input', { type: 'text', value: x.filename, style: { flex: '1' }, oninput: e => S.update(pp => { pp.export.filename = e.target.value; }, 'fn', true) });
    body.push(U.lrow('Filnamn', fn));
    body.push(U.check('Ljud', x.audio, v => S.update(pp => { pp.export.audio = v; }, 'exa')));
    body.push(U.check('Watermark', x.watermark, v => S.update(pp => { pp.export.watermark = v; }, 'exw')));
    if (x.watermark) body.push(U.lrow('Text', U.el('input', { type: 'text', value: x.watermarkText, style: { flex: '1' }, oninput: e => S.update(pp => { pp.export.watermarkText = e.target.value; }, 'exwt', true) })));

    const est = Exporter.estimate(p);
    body.push(U.section('Beräknat'));
    body.push(U.el('div', { class: 'report' },
      U.el('div', { class: 'rrow' }, U.el('span', { class: 'k', text: 'Längd' }), U.el('span', { class: 'v mono', text: U.tc(est.duration, false) })),
      U.el('div', { class: 'rrow' }, U.el('span', { class: 'k', text: 'Bild' }), U.el('span', { class: 'v mono', text: `${est.w}×${est.h} @ ${est.fps} fps` })),
      U.el('div', { class: 'rrow' }, U.el('span', { class: 'k', text: 'Filstorlek' }), U.el('span', { class: 'v mono', text: '≈ ' + U.bytes(est.bytes) })),
      U.el('div', { class: 'rrow' }, U.el('span', { class: 'k', text: 'Exporttid' }), U.el('span', { class: 'v mono', text: '≈ ' + U.tc(est.time, false) })),
      U.el('div', { class: 'rrow' }, U.el('span', { class: 'k', text: 'Codec' }), U.el('span', { class: 'v mono', text: est.codecLabel }))));

    const st = Exporter.status;
    if (st.running) {
      body.push(U.el('div', { class: 'progress' }, U.el('i', { style: { width: (st.progress * 100) + '%' } })));
      body.push(U.el('div', { class: 'row hint', text: st.message }));
      body.push(U.el('div', { class: 'row' }, U.el('button', { class: 'btn danger', onclick: () => Exporter.cancel() }, 'Avbryt export')));
    } else {
      body.push(U.el('div', { class: 'row' }, U.el('button', { class: 'btn primary', style: { flex: '1' }, onclick: () => Exporter.start() }, 'Exportera film')));
    }
    if (st.result) {
      body.push(U.el('div', { class: 'row' },
        U.el('button', { class: 'btn primary', onclick: () => Exporter.download() }, 'Ladda ner ' + st.result.name),
        U.el('span', { class: 'hint mono', text: U.bytes(st.result.size) })));
    }
    body.push(U.el('div', { class: 'row hint', style: { display: 'block' } }, Exporter.capabilityNote()));
    return panel('Export', null, ...body);
  }

  return { init, open, render, get active() { return active; }, ui };
})();

/* ============================================================
   Inspektor — klippverktyg
   ============================================================ */
const Inspector = (() => {
  function render() {
    const host = U.$('#inspector'); if (!host) return;
    const top = host.scrollTop;
    U.clear(host);
    const clip = S.primaryClip();
    if (!clip) {
      host.append(U.el('div', { class: 'panelhead' }, U.el('span', { class: 'title', text: 'Klippverktyg' })),
        U.el('div', { class: 'empty' }, U.el('div', { text: 'Inget klipp markerat' }),
          U.el('div', { class: 'hint' }, 'Klicka på ett klipp i timelinen för att redigera in-/utpunkt, hastighet, bild och stabilisering.')));
      return;
    }
    if (clip.kind !== 'video') { renderOther(host, clip); return; }
    const p = S.project;
    const media = M.mediaById(p, clip.mediaId);
    const dur = M.clipDuration(clip);
    const set = (fn, label, coalesce) => S.update(pp => fn(M.findClip(pp, clip.id), pp), label, coalesce);
    const body = [];

    body.push(U.el('div', { class: 'panelhead' },
      U.el('span', { class: 'title', text: media ? media.name : 'Klipp' }),
      U.el('span', { class: 'spacer' }),
      U.el('span', { class: 'tag mono', text: U.dur(dur) })));

    const sc = U.el('div', { class: 'scroll' });
    body.push(sc);
    const add = (...n) => sc.append(...n.filter(Boolean));

    add(U.section('Tid'));
    add(U.lrow('In point', U.num(U.round(clip.in, 2), v => set(c => { c.in = U.clamp(v, 0, c.out - .05); }, 'in'), { min: 0, step: .05 }), U.el('span', { class: 'hint', text: 's' })));
    add(U.lrow('Out point', U.num(U.round(clip.out, 2), v => set(c => { c.out = U.clamp(v, c.in + .05, media ? media.duration : v); }, 'out'), { min: 0, step: .05 }), U.el('span', { class: 'hint', text: 's' })));
    add(U.lrow('Duration', U.num(U.round(dur, 2), v => set(c => { c.out = U.clamp(c.in + v * c.speed, c.in + .05, media ? media.duration : c.out); }, 'dur'), { min: .05, step: .1 }), U.el('span', { class: 'hint', text: 's' })));

    add(U.section('Hastighet'));
    const speeds = [.5, .75, 1, 1.25, 1.5, 2];
    add(U.el('div', { class: 'row wrap' }, ...speeds.map(s =>
      U.el('button', { class: 'btn sm' + (Math.abs(clip.speed - s) < .001 ? ' on' : ''), onclick: () => set(c => { c.speed = s; }, 'speed') }, s + '×'))));
    add(U.slider('Speed', clip.speed, .25, 4, .05, v => set(c => { c.speed = v; }, 'speed', true), { def: 1, fmt: v => v.toFixed(2) + '×' }));
    const fitInp = U.num(U.round(dur, 1), () => { }, { min: .2, step: .1, w: 60 });
    add(U.lrow('Fit to duration', fitInp, U.el('button', {
      class: 'btn sm', 'data-tip': 'Räknar ut hastigheten som ger önskad klipplängd',
      onclick: () => {
        const want = parseFloat(fitInp.value);
        if (!(want > .1)) return;
        const sp = U.clamp((clip.out - clip.in) / want, .1, 8);
        set(c => { c.speed = sp; }, 'fit');
        U.toast('Hastighet satt till ' + sp.toFixed(2) + '×', 'Klipplängd ' + want.toFixed(1) + ' s');
      }
    }, 'Räkna ut')));
    add(U.el('div', { class: 'row wrap' },
      U.el('button', { class: 'btn sm' + (clip.reverse ? ' on' : ''), onclick: () => set(c => { c.reverse = !c.reverse; }, 'rev'), 'data-tip': 'Baklängesuppspelning (stegvis i preview)' }, 'Reverse'),
      U.el('button', { class: 'btn sm' + (clip.freeze ? ' on' : ''), onclick: () => set(c => { c.freeze = !c.freeze; }, 'freeze'), 'data-tip': 'Frys bildrutan vid in-punkten' }, 'Freeze frame')));

    add(U.section('Transform'));
    add(U.slider('Rotation', clip.transform.rot, -20, 20, .1, v => set(c => { c.transform.rot = v; }, 'rot', true), { def: 0, fmt: v => v.toFixed(1) + '°' }));
    add(U.slider('Scale', clip.transform.scale, 25, 400, 1, v => set(c => { c.transform.scale = v; }, 'scale', true), { def: 100, fmt: v => v + ' %' }));
    add(U.slider('Position X', clip.transform.x, -100, 100, .5, v => set(c => { c.transform.x = v; }, 'px', true), { def: 0 }));
    add(U.slider('Position Y', clip.transform.y, -100, 100, .5, v => set(c => { c.transform.y = v; }, 'py', true), { def: 0 }));
    add(U.slider('Crop vänster', clip.transform.crop.l, 0, 45, .5, v => set(c => { c.transform.crop.l = v; }, 'cl', true), { def: 0, fmt: v => v + ' %' }));
    add(U.slider('Crop höger', clip.transform.crop.r, 0, 45, .5, v => set(c => { c.transform.crop.r = v; }, 'cr', true), { def: 0, fmt: v => v + ' %' }));
    add(U.slider('Crop topp', clip.transform.crop.t, 0, 45, .5, v => set(c => { c.transform.crop.t = v; }, 'ct', true), { def: 0, fmt: v => v + ' %' }));
    add(U.slider('Crop botten', clip.transform.crop.b, 0, 45, .5, v => set(c => { c.transform.crop.b = v; }, 'cb', true), { def: 0, fmt: v => v + ' %' }));
    add(U.slider('Opacity', clip.transform.opacity, 0, 100, 1, v => set(c => { c.transform.opacity = v; }, 'op', true), { def: 100, fmt: v => v + ' %' }));

    add(U.section('Fade & ljud'));
    add(U.slider('Fade in', clip.fade.in, 0, 4, .05, v => set(c => { c.fade.in = v; }, 'fi', true), { def: 0, fmt: v => v.toFixed(2) + ' s' }));
    add(U.slider('Fade out', clip.fade.out, 0, 4, .05, v => set(c => { c.fade.out = v; }, 'fo', true), { def: 0, fmt: v => v.toFixed(2) + ' s' }));
    add(U.slider('Volume', clip.volume, 0, 100, 1, v => set(c => { c.volume = v; }, 'vol', true), { def: 100, fmt: v => v + ' %' }));
    add(U.check('Mute originalljud', clip.muted, v => set(c => { c.muted = v; }, 'mute')));

    add(U.section('Effekter'));
    const st = media && media.stab;
    add(U.el('div', { class: 'row wrap' },
      U.el('button', {
        class: 'btn sm' + (clip.stabEnabled ? ' on' : ''),
        onclick: () => App.toggleStabOnClip(!clip.stabEnabled),
        'data-tip': st && st.status === 'analyzed' ? 'Slå på/av stabilisering' : 'Klippet måste analyseras först',
      }, 'Stabilisering'),
      U.el('button', { class: 'btn sm', onclick: () => Panels.open('stab') }, 'Öppna stabilisering'),
      st && st.status === 'analyzed' ? U.el('span', { class: 'tag ok', text: M.stabModeById(Stab.settingsFor(media).mode).name }) : U.el('span', { class: 'tag', text: 'ej analyserad' })));
    add(U.el('div', { class: 'row wrap' },
      U.el('span', { class: 'hint', style: { flex: '0 0 72px' }, text: 'Filter' }),
      U.select(M.FILTERS.map(f => [f.id, f.name]), clip.filter, v => set(c => { c.filter = v; }, 'filter')),
      U.el('button', { class: 'btn sm', onclick: () => Panels.open('image') }, 'Bild')));
    add(U.el('div', { class: 'row wrap' },
      U.el('span', { class: 'hint', style: { flex: '0 0 72px' }, text: 'Rörelse' }),
      U.select(M.MOTION_PRESETS.map(f => [f.id, f.name]), clip.motion.preset, v => set(c => { c.motion = { ...M.emptyMotion(), preset: v }; }, 'motion')),
      U.el('button', { class: 'btn sm', onclick: () => Panels.open('motion') }, 'Rörelse')));
    const idx = p.tracks.video.findIndex(c => c.id === clip.id);
    add(U.el('div', { class: 'row wrap' },
      U.el('span', { class: 'hint', style: { flex: '0 0 72px' }, text: 'Transition' }),
      idx > 0 ? U.select(M.TRANSITIONS.map(t => [t.id, t.name]), clip.transitionIn.type, v => set(c => { c.transitionIn = { type: v, dur: M.transById(v).defDur }; }, 'tin'))
        : U.el('span', { class: 'hint', text: 'första klippet' })));

    add(U.section('Åtgärder'));
    add(U.el('div', { class: 'row wrap' },
      U.el('button', { class: 'btn sm', onclick: () => App.splitAtPlayhead(), 'data-tip': 'Dela vid playhead (S)' }, 'Split'),
      U.el('button', { class: 'btn sm', onclick: () => App.duplicateSelected(), 'data-tip': 'Duplicera (Ctrl+D)' }, 'Duplicera'),
      U.el('button', { class: 'btn sm', onclick: () => App.deleteSelected(false) }, 'Ta bort'),
      U.el('button', { class: 'btn sm danger', onclick: () => App.deleteSelected(true), 'data-tip': 'Tar bort och stänger luckan' }, 'Ripple delete')));

    host.append(...body);
    host.scrollTop = top;
  }

  function renderOther(host, clip) {
    const isText = clip.kind === 'text';
    host.append(U.el('div', { class: 'panelhead' }, U.el('span', { class: 'title', text: isText ? 'Textklipp' : 'Musikklipp' })));
    const sc = U.el('div', { class: 'scroll' });
    const set = (k, v) => S.update(pp => { const x = M.findClip(pp, clip.id); if (k.includes('.')) { const [a, b] = k.split('.'); x[a][b] = v; } else x[k] = v; }, 'i-' + k, true);
    sc.append(U.section('Tid'));
    sc.append(U.lrow('Start', U.num(U.round(clip.start, 2), v => set('start', Math.max(0, v)), { step: .1 })));
    if (isText) sc.append(U.lrow('Längd', U.num(U.round(clip.duration, 2), v => set('duration', Math.max(.2, v)), { step: .1 })));
    else {
      sc.append(U.lrow('In', U.num(U.round(clip.in, 2), v => set('in', Math.max(0, v)), { step: .1 })));
      sc.append(U.lrow('Out', U.num(U.round(clip.out, 2), v => set('out', v), { step: .1 })));
      sc.append(U.slider('Volym', clip.volume, 0, 100, 1, v => set('volume', v), { def: 80, fmt: v => v + ' %' }));
    }
    sc.append(U.el('div', { class: 'row' },
      U.el('button', { class: 'btn sm', onclick: () => Panels.open(isText ? 'text' : 'audio') }, 'Öppna panel'),
      U.el('button', { class: 'btn sm danger', onclick: () => App.deleteClip(clip.id) }, 'Ta bort')));
    host.append(sc);
  }
  return { render };
})();
