/* ============================================================
   80 — Timeline: rendering, drag, trim, snapping, zoom
   ============================================================ */
const Timeline = (() => {
  let pps = 60;                 // pixlar per sekund
  let snap = true;
  let scroll, content, ruler, trackV, trackM, trackT, playhead, snapline;
  const PAD = 40;

  function init() {
    scroll = U.$('#tlscroll'); content = U.$('#tlcontent');
    U.clear(content);
    ruler = U.el('div', { id: 'ruler' });
    trackV = U.el('div', { class: 'tltrack video' });
    trackM = U.el('div', { class: 'tltrack music' });
    trackT = U.el('div', { class: 'tltrack text' });
    playhead = U.el('div', { id: 'playhead' });
    snapline = U.el('div', { class: 'snapline' });
    content.append(ruler, trackV, trackM, trackT, playhead, snapline);

    ruler.addEventListener('pointerdown', e => {
      const scrubTo = ev => {
        const x = ev.clientX - scroll.getBoundingClientRect().left + scroll.scrollLeft;
        S.seek(Math.max(0, x / pps));
      };
      scrubTo(e);
      U.drag(e, { onMove: (dx, dy, ev) => scrubTo(ev), cursor: 'ew-resize' });
    });
    [trackV, trackM, trackT].forEach(tr => tr.addEventListener('pointerdown', e => {
      if (e.target === tr) { S.selectClips([]); }
    }));
    // släpp media direkt på timelinen
    content.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
    content.addEventListener('drop', e => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/media-id');
      if (!id) return;
      const m = M.mediaById(S.project, id);
      if (!m) return;
      const x = e.clientX - scroll.getBoundingClientRect().left + scroll.scrollLeft;
      App.addMediaToTimeline(m, m.type === 'audio' ? Math.max(0, x / pps) : null);
    });
    S.bus.on('change', render);
    S.bus.on('project', () => { zoomFit(); render(); });
    S.bus.on('selection', render);
    S.bus.on('seek', updatePlayhead);
    S.bus.on('time', updatePlayhead);
    render();
  }

  const timeAt = clientX => (clientX - scroll.getBoundingClientRect().left + scroll.scrollLeft) / pps;

  /* ---------- snapping ---------- */
  function snapTargets(exceptId) {
    const p = S.project, out = [0, M.totalDuration(p), S.st.playhead];
    for (const c of p.tracks.video) { if (c.id === exceptId) continue; out.push(c.start, c.start + M.clipDuration(c)); }
    for (const c of p.tracks.music) { if (c.id === exceptId) continue; out.push(c.start, c.start + (c.out - c.in)); }
    for (const c of p.tracks.text) { if (c.id === exceptId) continue; out.push(c.start, c.start + c.duration); }
    for (const c of p.tracks.music) {
      const m = M.mediaById(p, c.mediaId);
      if (m && m.beats && App.state.snapBeats) for (const b of m.beats) { const t = c.start + (b - c.in); if (t >= 0) out.push(t); }
    }
    return out;
  }
  function applySnap(t, exceptId) {
    if (!snap) return { t, hit: null };
    const tol = 8 / pps;
    let best = null, bd = tol;
    for (const s of snapTargets(exceptId)) { const d = Math.abs(s - t); if (d < bd) { bd = d; best = s; } }
    return best != null ? { t: best, hit: best } : { t, hit: null };
  }
  function showSnap(t) {
    if (t == null) { snapline.style.display = 'none'; return; }
    snapline.style.display = 'block';
    snapline.style.left = (t * pps) + 'px';
  }

  /* ---------- rendering ---------- */
  function render() {
    if (!content) return;
    const p = S.project;
    const total = M.totalDuration(p);
    const w = Math.max(scroll.clientWidth, total * pps + PAD);
    content.style.width = w + 'px';
    renderRuler(total, w);
    renderVideo(p);
    renderMusic(p);
    renderText(p);
    updatePlayhead();
    const zi = U.$('#tlzoomval'); if (zi) zi.textContent = pps.toFixed(0) + ' px/s';
    const info = U.$('#tlinfo');
    if (info) info.textContent = `${p.tracks.video.length} klipp · ${U.tc(total, false)} totalt`;
    const sel = U.$('#tlsel');
    if (sel) {
      const cs = S.selectedClips();
      sel.textContent = cs.length ? (cs.length === 1 ? nameOf(cs[0]) + ' · ' + U.dur(lenOf(cs[0])) : cs.length + ' klipp markerade') : 'Inget markerat';
    }
  }
  const nameOf = c => c.kind === 'text' ? (c.title || 'Text') : (M.mediaById(S.project, c.mediaId) || { name: '?' }).name;
  const lenOf = c => c.kind === 'video' ? M.clipDuration(c) : c.kind === 'text' ? c.duration : (c.out - c.in);

  function renderRuler(total, w) {
    U.clear(ruler);
    const steps = [.1, .25, .5, 1, 2, 5, 10, 15, 30, 60, 120, 300];
    const step = steps.find(s => s * pps >= 62) || 600;
    const sub = step / (step >= 5 ? 5 : 2);
    for (let t = 0; t <= (w / pps); t += sub) {
      const major = Math.abs(t / step - Math.round(t / step)) < 1e-6;
      const d = U.el('div', { class: 'tick' + (major ? '' : ' minor'), style: { left: (t * pps) + 'px' } });
      if (major) d.append(U.el('span', { text: U.tc(t, false) }));
      ruler.append(d);
      if (t > 100000) break;
    }
  }

  function badges(c) {
    const b = [];
    if (c.stabEnabled) b.push(U.el('span', { class: 'tag accent', text: 'STAB' }));
    if (c.filter && c.filter !== 'none') b.push(U.el('span', { class: 'tag', title: M.filterById(c.filter).name, text: M.filterById(c.filter).name.split(' ')[0].slice(0, 5).toUpperCase() }));
    else if (!Color.isNeutral(Color.effective(c))) b.push(U.el('span', { class: 'tag', text: 'GRADE' }));
    if (Math.abs((c.speed || 1) - 1) > .001) b.push(U.el('span', { class: 'tag', text: (c.speed).toFixed(2).replace(/0$/, '') + '×' }));
    if (c.reverse) b.push(U.el('span', { class: 'tag', text: 'REV' }));
    if (c.motion && c.motion.preset !== 'none') b.push(U.el('span', { class: 'tag', text: 'MOVE' }));
    if (c._deviation > .55) b.push(U.el('span', { class: 'tag warn', text: 'AVVIKER' }));
    return b;
  }

  function renderVideo(p) {
    U.clear(trackV);
    const selIds = new Set(S.sel.clips);
    p.tracks.video.forEach((c, i) => {
      const m = M.mediaById(p, c.mediaId);
      const dur = M.clipDuration(c);
      const left = c.start * pps, wid = Math.max(6, dur * pps);
      const node = U.el('div', {
        class: 'clip' + (selIds.has(c.id) ? ' sel' : '') + (c._deviation > .55 ? ' offbeat' : ''),
        style: { left: left + 'px', width: wid + 'px' },
        'data-id': c.id,
      });
      if (m && m.strip) {
        const srcDur = m.duration || 1;
        const full = wid * (srcDur / Math.max(.05, (c.out - c.in)));
        node.append(U.el('div', {
          class: 'cthumb',
          style: { backgroundImage: `url(${m.strip})`, backgroundSize: `${full}px 100%`, backgroundPosition: `${-full * (c.in / srcDur)}px 0`, backgroundRepeat: 'no-repeat' },
        }));
      }
      node.append(U.el('div', { class: 'cbody' },
        U.el('div', { class: 'cname', text: (m ? m.name : 'Saknad fil') }),
        U.el('div', { class: 'cbadges' }, badges(c)),
        U.el('div', { class: 'cdur', text: U.dur(dur) })));
      node.append(U.el('div', { class: 'grip l', 'data-grip': 'l' }), U.el('div', { class: 'grip r', 'data-grip': 'r' }));
      node.addEventListener('pointerdown', e => onClipDown(e, c, 'video', i));
      node.addEventListener('dblclick', () => { S.seek(c.start); S.selectClips([c.id]); });
      trackV.append(node);
      // övergångsmarkör vid starten
      if (i > 0) {
        const tr = c.transitionIn || { type: 'cut', dur: 0 };
        const t = M.transById(tr.type);
        const chip = U.el('div', {
          class: 'trans' + (tr.type === 'cut' ? ' cut' : ''), style: { left: left + 'px' },
          'data-tip': t.name + (tr.dur ? ` · ${tr.dur.toFixed(1)}s` : ''), title: t.name,
          onpointerdown: e => { e.stopPropagation(); S.selectClips([c.id]); Panels.open('trans'); },
        }, tr.type === 'cut' ? '│' : t.name.split(' ')[0] + (tr.dur ? ' ' + tr.dur.toFixed(1) + 's' : ''));
        trackV.append(chip);
      }
    });
    if (!p.tracks.video.length) {
      trackV.append(U.el('div', { class: 'hint', style: { padding: '22px 14px' } }, 'Dra videoklipp hit från mediabiblioteket'));
    }
  }

  function renderMusic(p) {
    U.clear(trackM);
    const selIds = new Set(S.sel.clips);
    for (const c of p.tracks.music) {
      const m = M.mediaById(p, c.mediaId);
      const len = c.out - c.in;
      const wid = Math.max(6, len * pps);
      const node = U.el('div', { class: 'clip music' + (selIds.has(c.id) ? ' sel' : ''), style: { left: (c.start * pps) + 'px', width: wid + 'px' }, 'data-id': c.id });
      const cv = U.el('canvas'); node.append(cv);
      requestAnimationFrame(() => drawWave(cv, m, c, Math.min(wid, 4000)));
      node.append(U.el('div', { class: 'cbody' },
        U.el('div', { class: 'cname', text: (m ? m.name : 'Saknat ljud') + (c.muted ? ' (mute)' : '') }),
        U.el('div', { class: 'cdur', text: U.dur(len) + (m && m.bpm ? ` · ${m.bpm} BPM` : '') })));
      node.append(U.el('div', { class: 'grip l', 'data-grip': 'l' }), U.el('div', { class: 'grip r', 'data-grip': 'r' }));
      node.addEventListener('pointerdown', e => onClipDown(e, c, 'music'));
      trackM.append(node);
      if (m && m.beats && App.state.showBeats) {
        for (const b of m.beats) {
          const t = c.start + (b - c.in);
          if (t < c.start || t > c.start + len) continue;
          trackM.append(U.el('div', { class: 'beatmark', style: { left: (t * pps) + 'px' } }));
        }
      }
    }
    if (!p.tracks.music.length) trackM.append(U.el('div', { class: 'hint', style: { padding: '13px 14px' } }, 'Musikspår — ladda upp en låt i Ljud-panelen'));
  }
  function drawWave(cv, m, c, w) {
    if (!m || !m.wave) return;
    const h = cv.clientHeight || 40;
    cv.width = Math.max(2, Math.round(w)); cv.height = h;
    const g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, h);
    g.fillStyle = 'rgba(140,160,132,.55)';
    const N = m.wave.length, dur = m.duration || 1;
    for (let x = 0; x < cv.width; x++) {
      const t = c.in + (x / cv.width) * (c.out - c.in);
      const i = U.clamp(Math.floor(t / dur * N), 0, N - 1);
      const v = (m.wave[i] / 255) * (h * .46);
      g.fillRect(x, h / 2 - v, 1, v * 2);
    }
  }

  function renderText(p) {
    U.clear(trackT);
    const selIds = new Set(S.sel.clips);
    for (const c of p.tracks.text) {
      const node = U.el('div', {
        class: 'clip text' + (selIds.has(c.id) ? ' sel' : ''),
        style: { left: (c.start * pps) + 'px', width: Math.max(8, c.duration * pps) + 'px' }, 'data-id': c.id,
      });
      node.append(U.el('div', { class: 'cbody' }, U.el('div', { class: 'cname', text: c.title || 'Text' })));
      node.append(U.el('div', { class: 'grip l', 'data-grip': 'l' }), U.el('div', { class: 'grip r', 'data-grip': 'r' }));
      node.addEventListener('pointerdown', e => onClipDown(e, c, 'text'));
      trackT.append(node);
    }
    if (!p.tracks.text.length) trackT.append(U.el('div', { class: 'hint', style: { padding: '7px 14px' } }, 'Textspår'));
  }

  function updatePlayhead() {
    if (!playhead) return;
    playhead.style.left = (S.st.playhead * pps) + 'px';
    if (S.st.playing) {
      const x = S.st.playhead * pps, l = scroll.scrollLeft, w = scroll.clientWidth;
      if (x < l || x > l + w - 40) scroll.scrollLeft = Math.max(0, x - w * .35);
    }
  }

  /* ---------- interaktion ---------- */
  function onClipDown(e, clip, kind, index) {
    e.stopPropagation();
    const grip = e.target.getAttribute && e.target.getAttribute('data-grip');
    if (e.shiftKey || e.metaKey || e.ctrlKey) S.toggleClip(clip.id);
    else if (!S.sel.clips.includes(clip.id)) S.selectClips([clip.id]);
    if (grip) return startTrim(e, clip, kind, grip);
    startMove(e, clip, kind, index);
  }

  function startTrim(e, clip, kind, side) {
    const t0 = timeAt(e.clientX);
    const orig = { in: clip.in, out: clip.out, start: clip.start, duration: clip.duration };
    const media = M.mediaById(S.project, clip.mediaId);
    const maxDur = media ? media.duration : (clip.out || 10);
    U.drag(e, {
      cursor: 'ew-resize',
      onMove: (dx, dy, ev) => {
        let t = timeAt(ev.clientX);
        const sn = applySnap(t, clip.id); t = sn.t; showSnap(sn.hit);
        const d = t - t0;
        S.update(p => {
          const c = M.findClip(p, clip.id); if (!c) return;
          if (kind === 'text') {
            if (side === 'l') { const ns = U.clamp(orig.start + d, 0, orig.start + orig.duration - .2); c.duration = orig.duration - (ns - orig.start); c.start = ns; }
            else c.duration = Math.max(.2, orig.duration + d);
            return;
          }
          const speed = kind === 'video' ? Math.max(.05, c.speed || 1) : 1;
          if (side === 'l') {
            const ni = U.clamp(orig.in + d * speed, 0, orig.out - .08);
            c.in = ni;
            if (kind === 'music') c.start = U.clamp(orig.start + (ni - orig.in), 0, 1e6);
          } else {
            c.out = U.clamp(orig.out + d * speed, c.in + .08, maxDur);
          }
        }, 'trim', true);
      },
      onEnd: () => { showSnap(null); S.bus.emit('change', 'trim-end'); },
    });
  }

  function startMove(e, clip, kind, index) {
    const t0 = timeAt(e.clientX);
    const orig = clip.start;
    let moved = false;
    const node = e.currentTarget;
    U.drag(e, {
      cursor: 'grabbing',
      onMove: (dx, dy, ev, didMove) => {
        if (!didMove) return;
        moved = true;
        node.classList.add('dragging');
        if (kind === 'video') {
          // ordningsändring: hitta målindex utifrån muspekarens position
          const t = timeAt(ev.clientX);
          const list = S.project.tracks.video;
          let target = list.length - 1;
          for (let i = 0; i < list.length; i++) {
            const c = list[i], d = M.clipDuration(c);
            if (t < c.start + d / 2) { target = i; break; }
          }
          const from = list.findIndex(c => c.id === clip.id);
          if (target !== from && target >= 0) {
            S.update(p => {
              const arr = p.tracks.video;
              const f = arr.findIndex(c => c.id === clip.id);
              const [it] = arr.splice(f, 1);
              arr.splice(U.clamp(target, 0, arr.length), 0, it);
              M.relayout(arr);
            }, 'reorder', true);
          }
          showSnap(null);
        } else {
          let t = orig + (timeAt(ev.clientX) - t0);
          const sn = applySnap(t, clip.id); t = Math.max(0, sn.t); showSnap(sn.hit);
          S.update(p => { const c = M.findClip(p, clip.id); if (c) c.start = t; }, 'move', true);
        }
      },
      onEnd: () => {
        node.classList.remove('dragging');
        showSnap(null);
        if (moved) S.bus.emit('change', 'move-end');
      },
    });
  }

  /* ---------- zoom ---------- */
  function setZoom(v, anchorTime) {
    const old = pps;
    pps = U.clamp(v, 2, 800);
    if (anchorTime != null && scroll) {
      const x = anchorTime * old - scroll.scrollLeft;
      scroll.scrollLeft = Math.max(0, anchorTime * pps - x);
    }
    render();
  }
  const zoomIn = () => setZoom(pps * 1.35, S.st.playhead);
  const zoomOut = () => setZoom(pps / 1.35, S.st.playhead);
  function zoomFit() {
    const total = M.totalDuration(S.project) || 10;
    const w = (scroll ? scroll.clientWidth : 900) - PAD;
    setZoom(U.clamp(w / total, 2, 400));
  }
  const setSnap = v => { snap = v; };

  return { init, render, updatePlayhead, zoomIn, zoomOut, zoomFit, setZoom, setSnap, get pps() { return pps; }, get snap() { return snap; }, drawWave };
})();
