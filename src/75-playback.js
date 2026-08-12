/* ============================================================
   75 — Uppspelningsmotor: klocka, videopool, ljudgraf, komposition
   ============================================================ */
const Playback = (() => {
  const MAX_ELEMENTS = 8;
  const pool = new Map();          // clipId -> {video, src, gain, used}
  let audioCtx = null, master = null, musicEl = null, musicSrc = null, musicGain = null, musicClipId = null;
  let raf = 0, lastNow = 0;
  const view = {
    guides: false, fitFill: 'fit', compare: false, compareX: 0.5, zoomView: false,
    loopClip: false, muted: false, volume: 1, exporting: false,
  };
  let onFrame = null;

  /* ---------- ljud ---------- */
  function ctx() {
    if (!audioCtx) {
      audioCtx = Media.getAudioCtx();
      master = audioCtx.createGain();
      master.gain.value = 1;
      master.connect(audioCtx.destination);
    }
    return audioCtx;
  }
  function resume() { try { ctx().resume(); } catch (e) { } }
  function setMasterVolume(v) { view.volume = v; if (master) master.gain.value = view.muted ? 0 : v; }
  function setMuted(m) { view.muted = m; if (master) master.gain.value = m ? 0 : view.volume; }
  function audioDest() { ctx(); return master; }

  /* ---------- videopool ---------- */
  function acquire(clip, media) {
    let e = pool.get(clip.id);
    if (e && e.mediaId === media.id) { e.used = performance.now(); return e; }
    if (e) release(clip.id);
    if (pool.size >= MAX_ELEMENTS) {
      let oldest = null;
      for (const [k, v] of pool) if (!oldest || v.used < oldest[1].used) oldest = [k, v];
      if (oldest) release(oldest[0]);
    }
    const v = document.createElement('video');
    v.preload = 'auto'; v.playsInline = true; v.muted = false; v.crossOrigin = 'anonymous';
    v.src = media.url;
    v.load();
    e = { video: v, mediaId: media.id, used: performance.now(), gain: null, src: null, ready: false, mediaTime: null };
    v.addEventListener('loadeddata', () => { e.ready = true; });
    // Stabiliseringen MÅSTE hämtas för exakt den bildruta som visas. Klockan i
    // timelinen och videons egen tid glider isär med 1–2 rutor, och eftersom
    // korrigeringen är lika snabb som skakningen den ska ta bort blir en
    // felfasad korrigering lika illa som ingen alls — den lägger till skakning.
    // requestVideoFrameCallback ger presentationstiden för den visade rutan.
    try {
      const c = ctx();
      e.src = c.createMediaElementSource(v);
      e.gain = c.createGain();
      e.src.connect(e.gain); e.gain.connect(master);
      e.gain.gain.value = 0;
    } catch (err) { /* ljudgraf ej tillgänglig */ }
    pool.set(clip.id, e);
    // startas EFTER pool.set — annars avbryter vaktvillkoret direkt
    if (typeof v.requestVideoFrameCallback === 'function') {
      const pump = () => {
        if (pool.get(clip.id) !== e) return;
        try {
          v.requestVideoFrameCallback((now, meta) => { e.mediaTime = meta.mediaTime; e.presentedAt = now; pump(); });
        } catch (err) { /* elementet är borta */ }
      };
      pump();
    }
    return e;
  }
  function release(clipId) {
    const e = pool.get(clipId);
    if (!e) return;
    e.mediaTime = null;
    try { e.video.pause(); e.video.removeAttribute('src'); e.video.load(); } catch (x) { }
    try { if (e.gain) e.gain.disconnect(); if (e.src) e.src.disconnect(); } catch (x) { }
    pool.delete(clipId);
  }
  function releaseAll() { [...pool.keys()].forEach(release); if (musicEl) { try { musicEl.pause(); } catch (e) { } } }

  /* ---------- käll-tid ---------- */
  function sourceTime(clip, t) {
    const local = t - clip.start;
    if (clip.freeze) return clip.in;
    const s = Math.max(0.05, clip.speed || 1);
    return clip.reverse ? (clip.out - local * s) : (clip.in + local * s);
  }
  function syncVideo(e, clip, srcT, playing, rate) {
    const v = e.video;
    if (!v || v.readyState < 1) return;
    const dur = isFinite(v.duration) ? v.duration : 1e9;
    const target = U.clamp(srcT, 0, Math.max(0, dur - 0.03));
    const drift = target - v.currentTime;
    const stepMode = clip.reverse || clip.freeze || !playing;
    if (stepMode) {
      if (!v.paused) v.pause();
      if (Math.abs(drift) > 0.012) { try { v.currentTime = target; } catch (x) { } }
      return;
    }
    if (Math.abs(drift) > 0.32) { try { v.currentTime = target; } catch (x) { } }
    v.playbackRate = U.clamp(rate * (1 + U.clamp(drift * 0.6, -0.12, 0.12)), 0.0625, 8);
    if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => { }); }
  }

  /* ---------- rörelsepreset ---------- */
  const ease = (k, e) => e === 'in' ? k * k : e === 'out' ? 1 - (1 - k) * (1 - k) : e === 'inout' ? (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2) : k;
  function motionAt(clip, localT, dur) {
    const mo = clip.motion;
    if (!mo || mo.preset === 'none') return null;
    const p = { ...M.motionById(mo.preset).p };
    const strength = (mo.strength == null ? 100 : mo.strength) / 100;
    const dirX = (p.dirX || 0) + (mo.dirX || 0), dirY = (p.dirY || 0) + (mo.dirY || 0);
    const zoomAmt = (p.zoom || 0) + (mo.zoom || 0), rotAmt = (p.rot || 0) + (mo.rot || 0), tilt = (p.tilt || 0) + (mo.tilt || 0);
    const s0 = U.clamp(mo.start || 0, 0, .99), s1 = U.clamp(mo.end == null ? 1 : mo.end, s0 + .01, 1);
    let k = U.clamp((localT / Math.max(.01, dur) - s0) / (s1 - s0), 0, 1);
    k = ease(k, mo.easing || p.easing || 'inout');
    const sp = mo.speed == null ? 1 : mo.speed;
    k = U.clamp(k * sp, 0, 1);
    const kk = (k - 0.5) * 2;                       // -1 .. 1 kring mitten
    const zoom = 1 + (zoomAmt / 100) * strength * (0.5 + kk * 0.5);
    return {
      x: -(dirX / 100) * strength * kk,
      y: -(dirY / 100) * strength * kk,
      rot: (rotAmt * Math.PI / 180) * strength * kk,
      zoom: Math.max(0.2, zoom),
      keystone: (tilt / 100) * strength * kk * (mo.cropComp == null ? 1 : 1),
      pad: Math.abs(dirX) + Math.abs(dirY) > 0 ? (Math.abs(dirX) + Math.abs(dirY)) / 100 * strength : 0,
    };
  }

  /* ---------- huvudkomposition ---------- */
  function layerFor(clip, t, project) {
    const media = M.mediaById(project, clip.mediaId);
    if (!media || !media.url) return null;
    const e = acquire(clip, media);
    const dur = M.clipDuration(clip);
    const srcT = sourceTime(clip, t);
    const grade = Color.effective(clip);
    let stab = null;
    if (clip.stabEnabled && media.stab && media.stab.traj) {
      const corr = Stab.corrFor(media);
      // tiden för den bildruta som faktiskt ligger i texturen — inte den tid
      // timelinen tror att vi är på
      // Texturen laddas från den bildruta som webbläsaren PRESENTERAR just nu,
      // och rVFC:s mediaTime kommer från exakt samma källa. currentTime kan
      // ligga ett par rutor före efter en sökning — då hämtas fel korrigering
      // och skakningen blir kvar. Följ därför alltid presentationstiden.
      const v = e.video;
      const shown = e.mediaTime != null ? e.mediaTime
        : (v.readyState >= 2 ? v.currentTime : srcT);
      stab = corr ? Stab.sample(corr, shown) : null;
    }
    const motion = motionAt(clip, t - clip.start, dur);
    // extra marginal när rörelsepresetet panorerar
    if (motion && motion.pad) motion.zoom = Math.max(motion.zoom, 1 + motion.pad * ((clip.motion.cropComp == null ? 100 : clip.motion.cropComp) / 100));
    let alpha = (clip.transform.opacity == null ? 100 : clip.transform.opacity) / 100;
    const local = t - clip.start;
    if (clip.fade.in > 0) alpha *= U.clamp(local / clip.fade.in, 0, 1);
    if (clip.fade.out > 0) alpha *= U.clamp((dur - local) / clip.fade.out, 0, 1);
    return { clip, media, e, srcT, grade, stab, motion, alpha, dur };
  }
  function matrixFor(L, project, opts = {}) {
    const sz = Renderer.size();
    return Renderer.buildMatrix({
      srcW: L.media.width || 1920, srcH: L.media.height || 1080,
      outW: sz.w, outH: sz.h,
      fitMode: view.fitFill,
      crop: L.clip.transform.crop,
      keystone: (Color.effective(L.clip).verticalCorrection || 0) / 400,
      stab: opts.noStab ? null : L.stab,
      motion: opts.noMotion ? null : L.motion,
      transform: L.clip.transform,
      viewZoom: view.zoomView ? 2 : 1,
    });
  }

  /** Renderar hela projektet vid tiden t. */
  function renderAt(t, project, opts = {}) {
    if (!Renderer.ok) return;
    const sz = Renderer.size();
    Renderer.clear();
    const V = project.tracks.video;
    if (!V.length) { Renderer.present(); drawOverlay(t, project, null); return; }

    const idx = V.findIndex(c => t >= c.start - 1e-6 && t < c.start + M.clipDuration(c) - 1e-6);
    const cur = idx >= 0 ? V[idx] : (t >= (V[V.length - 1].start) ? V[V.length - 1] : V[0]);
    const i = idx >= 0 ? idx : (t >= V[V.length - 1].start ? V.length - 1 : 0);

    // pågående övergång?
    let trans = null;
    const inc = V[i], prevC = V[i - 1];
    if (inc && prevC && inc.transitionIn && inc.transitionIn.type !== 'cut' && inc.transitionIn.dur > 0) {
      const d = Math.min(inc.transitionIn.dur, M.clipDuration(prevC) * .9, M.clipDuration(inc) * .9);
      const b = inc.start;
      if (t >= b - d / 2 && t <= b + d / 2) trans = { type: inc.transitionIn.type, p: (t - (b - d / 2)) / d, a: prevC, b: inc, d };
    }
    const nxt = V[i + 1];
    if (!trans && nxt && nxt.transitionIn && nxt.transitionIn.type !== 'cut' && nxt.transitionIn.dur > 0) {
      const d = Math.min(nxt.transitionIn.dur, M.clipDuration(cur) * .9, M.clipDuration(nxt) * .9);
      const b = nxt.start;
      if (t >= b - d / 2 && t <= b + d / 2) trans = { type: nxt.transitionIn.type, p: (t - (b - d / 2)) / d, a: cur, b: nxt, d };
    }

    const compare = view.compare && !opts.noCompare;
    const drawOne = (L, alpha, extra = {}) => {
      if (!L) return;
      const rate = (L.clip.speed || 1);
      syncVideo(L.e, L.clip, L.srcT, opts.playing && !opts.exportSeek, rate);
      if (L.e.gain) {
        const on = opts.playing && !L.clip.muted && alpha > 0.02;
        const target = on ? (L.clip.volume / 100) * alpha : 0;
        try { L.e.gain.gain.setTargetAtTime(target * (opts.duck || 1), audioCtx.currentTime, 0.05); } catch (x) { L.e.gain.gain.value = target; }
      }
      const g = extra.grade || L.grade;
      if (compare) {
        // höger sida = original (utan stabilisering och utan färg)
        const sx = Math.round(sz.w * view.compareX);
        Renderer.setScissor({ x: 0, y: 0, w: sx, h: sz.h });
        Renderer.drawVideo(L.e.video, matrixFor(L, project), g, { alpha: alpha * L.alpha, blur: extra.blur || 0 });
        Renderer.setScissor({ x: sx, y: 0, w: sz.w - sx, h: sz.h });
        Renderer.drawVideo(L.e.video, matrixFor(L, project, { noStab: true, noMotion: true }), M.emptyGrade(), { alpha: alpha * L.alpha, blur: extra.blur || 0 });
        Renderer.setScissor(null);
      } else {
        Renderer.drawVideo(L.e.video, matrixFor(L, project), g, { alpha: alpha * L.alpha, blur: extra.blur || 0 });
      }
    };

    if (trans) {
      const A = layerFor(trans.a, t, project), B = layerFor(trans.b, t, project);
      const p = U.clamp(trans.p, 0, 1);
      switch (trans.type) {
        case 'black': case 'white': {
          const col = trans.type === 'white' ? [1, 1, 1] : [0, 0, 0];
          if (trans.type === 'white') Renderer.drawSolid(col, 1);
          if (p < .5) drawOne(A, 1 - p * 2); else drawOne(B, p * 2 - 1);
          break;
        }
        case 'blur':
          drawOne(A, 1, { blur: p * 5 });
          drawOne(B, p, { blur: (1 - p) * 5 });
          break;
        case 'dip': {
          const dip = Math.sin(Math.PI * p) * .55;
          const ga = { ...(A ? A.grade : M.emptyGrade()) }; ga.exposure -= dip;
          const gb = { ...(B ? B.grade : M.emptyGrade()) }; gb.exposure -= dip;
          drawOne(A, 1, { grade: ga });
          drawOne(B, p, { grade: gb });
          break;
        }
        case 'match': {
          if (A && A.motion) A.motion = { ...A.motion, zoom: A.motion.zoom * (1 + p * .03) };
          else if (A) A.motion = { x: 0, y: 0, rot: 0, zoom: 1 + p * .03 };
          if (B) B.motion = B.motion ? { ...B.motion, zoom: B.motion.zoom * (1 + (1 - p) * .03) } : { x: 0, y: 0, rot: 0, zoom: 1 + (1 - p) * .03 };
          drawOne(A, 1); drawOne(B, p);
          break;
        }
        default:
          drawOne(A, 1); drawOne(B, p);
      }
      // tysta klipp som inte är aktiva
      for (const [id, e] of pool) if (e.gain && id !== trans.a.id && id !== trans.b.id) { try { e.gain.gain.value = 0; e.video.pause(); } catch (x) { } }
    } else {
      const L = layerFor(cur, t, project);
      drawOne(L, 1);
      for (const [id, e] of pool) if (e.gain && id !== cur.id) { try { e.gain.gain.value = 0; if (!e.video.paused) e.video.pause(); } catch (x) { } }
      // förladda nästa klipp
      const nx = V[i + 1];
      if (nx && (nx.start - t) < 1.6) {
        const nm = M.mediaById(project, nx.mediaId);
        if (nm && nm.url) { const ne = acquire(nx, nm); if (ne.video.readyState >= 1 && Math.abs(ne.video.currentTime - nx.in) > .3) { try { ne.video.currentTime = nx.in; } catch (x) { } } }
      }
    }
    Renderer.present();
    drawOverlay(t, project, cur);
  }

  /* ---------- 2D-överlägg: text, watermark, guider ---------- */
  function drawOverlay(t, project, cur) {
    const g = Renderer.ctx2d(); if (!g) return;
    const { w, h } = Renderer.size();
    for (const tx of project.tracks.text) {
      const local = t - tx.start;
      if (local < 0 || local > tx.duration) continue;
      let a = (tx.opacity == null ? 100 : tx.opacity) / 100;
      if (tx.fade.in > 0) a *= U.clamp(local / tx.fade.in, 0, 1);
      if (tx.fade.out > 0) a *= U.clamp((tx.duration - local) / tx.fade.out, 0, 1);
      drawText(g, tx, a, w, h);
    }
    if (project.export && project.export.watermark) {
      g.save();
      g.globalAlpha = .5; g.fillStyle = '#fff';
      g.font = `600 ${Math.round(h * .028)}px -apple-system,Segoe UI,Roboto,sans-serif`;
      g.textAlign = 'right'; g.textBaseline = 'bottom';
      g.fillText(project.export.watermarkText || 'VIEWLY', w - h * .04, h - h * .04);
      g.restore();
    }
    if (view.guides && !view.exporting) {
      g.save();
      g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = Math.max(1, h / 900);
      for (let i = 1; i < 3; i++) {
        g.beginPath(); g.moveTo(w * i / 3, 0); g.lineTo(w * i / 3, h); g.stroke();
        g.beginPath(); g.moveTo(0, h * i / 3); g.lineTo(w, h * i / 3); g.stroke();
      }
      g.strokeStyle = 'rgba(109,114,102,.85)';
      g.strokeRect(w * .05, h * .05, w * .9, h * .9);
      g.setLineDash([6, 6]); g.strokeStyle = 'rgba(255,255,255,.35)';
      g.strokeRect(w * .1, h * .1, w * .8, h * .8);
      g.restore();
    }
    if (view.compare && !view.exporting) {
      const x = Math.round(w * view.compareX);
      g.save();
      g.strokeStyle = '#fff'; g.lineWidth = Math.max(1, h / 700);
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke();
      g.font = `600 ${Math.round(h * .022)}px -apple-system,sans-serif`;
      g.fillStyle = 'rgba(0,0,0,.55)';
      g.fillRect(8, 8, h * .13, h * .04); g.fillRect(x + 8, 8, h * .11, h * .04);
      g.fillStyle = '#fff'; g.textBaseline = 'top';
      g.fillText('EFTER', 16, 8 + h * .008); g.fillText('FÖRE', x + 16, 8 + h * .008);
      g.restore();
    }
  }
  function drawText(g, tx, alpha, w, h) {
    const size = h * (tx.size || 4) / 100;
    const pad = h * .07;
    g.save();
    g.globalAlpha = alpha;
    g.textBaseline = 'alphabetic';
    const preset = M.TEXT_PRESETS.find(p => p.id === tx.preset) || M.TEXT_PRESETS[0];
    const st = preset.style;
    let x = tx.align === 'center' ? w / 2 : tx.align === 'right' ? w - pad : pad;
    let y = tx.pos === 'center' ? h / 2 : tx.pos === 'upper' ? pad + size : h - pad;
    g.textAlign = tx.align === 'center' ? 'center' : tx.align === 'right' ? 'right' : 'left';
    if (st.plate) { g.fillStyle = 'rgba(10,11,12,.82)'; g.fillRect(0, 0, w, h); }
    if (st.bar) {
      g.fillStyle = 'rgba(109,114,102,.95)';
      const bw = Math.max(2, h * .004), bh = size * 1.9;
      if (tx.align === 'left') g.fillRect(x - bw * 4, y - bh + size * .25, bw, bh);
    }
    g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = h * .012; g.shadowOffsetY = h * .002;
    g.fillStyle = tx.color || '#f2f3f1';
    g.font = `${st.weight} ${size}px -apple-system,"Segoe UI",Roboto,Helvetica,sans-serif`;
    if (st.track) g.letterSpacing = (size * st.track) + 'px';
    const subSize = size * .42;
    if (tx.pos === 'center') {
      g.fillText(tx.title || '', x, y);
      if (tx.sub) { g.font = `400 ${subSize}px -apple-system,sans-serif`; g.letterSpacing = (subSize * .12) + 'px'; g.globalAlpha = alpha * .82; g.fillText(tx.sub, x, y + size * .95); }
    } else {
      if (tx.sub) { g.font = `400 ${subSize}px -apple-system,sans-serif`; g.letterSpacing = (subSize * .12) + 'px'; g.globalAlpha = alpha * .82; g.fillText(tx.sub, x, y); g.globalAlpha = alpha; }
      g.font = `${st.weight} ${size}px -apple-system,"Segoe UI",Roboto,sans-serif`;
      if (st.track) g.letterSpacing = (size * st.track) + 'px';
      g.fillText(tx.title || '', x, y - (tx.sub ? subSize * 1.5 : 0));
    }
    g.restore();
  }

  /* ---------- musik ---------- */
  function syncMusic(t, project, playing) {
    const list = project.tracks.music;
    const a = list.find(c => t >= c.start && t < c.start + (c.out - c.in));
    if (!a) { if (musicEl && !musicEl.paused) musicEl.pause(); if (musicGain) musicGain.gain.value = 0; return; }
    const media = M.mediaById(project, a.mediaId);
    if (!media || !media.url) return;
    if (!musicEl) {
      musicEl = document.createElement('audio');
      musicEl.preload = 'auto';
      try { musicSrc = ctx().createMediaElementSource(musicEl); musicGain = ctx().createGain(); musicSrc.connect(musicGain); musicGain.connect(master); }
      catch (e) { }
    }
    if (musicEl._mediaId !== media.id) { musicEl.src = media.url; musicEl._mediaId = media.id; musicEl.load(); }
    musicClipId = a.id;
    const local = t - a.start;
    const target = a.in + local;
    if (Math.abs(musicEl.currentTime - target) > 0.3) { try { musicEl.currentTime = target; } catch (e) { } }
    if (playing && musicEl.paused) { const p = musicEl.play(); if (p && p.catch) p.catch(() => { }); }
    if (!playing && !musicEl.paused) musicEl.pause();
    let v = a.muted ? 0 : a.volume / 100;
    const len = a.out - a.in;
    if (a.fade.in > 0) v *= U.clamp(local / a.fade.in, 0, 1);
    if (a.fade.out > 0) v *= U.clamp((len - local) / a.fade.out, 0, 1);
    // auto fade mot filmens slut
    const total = M.totalDuration(project);
    if (total - t < 1.6) v *= U.clamp((total - t) / 1.6, 0, 1);
    if (musicGain) { try { musicGain.gain.setTargetAtTime(v, audioCtx.currentTime, .06); } catch (e) { musicGain.gain.value = v; } }
    return a;
  }
  function duckFactor(t, project) {
    const a = project.tracks.music.find(c => t >= c.start && t < c.start + (c.out - c.in));
    return (a && a.duck) ? 0.35 : 1;
  }

  /* ---------- loop ---------- */
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const project = S.project;
    const dt = Math.min(.25, (now - lastNow) / 1000 || 0);
    lastNow = now;
    let t = S.st.playhead;
    if (S.st.playing) {
      t += dt;
      const total = M.totalDuration(project);
      const sel = view.loopClip ? S.primaryClip() : null;
      if (sel && sel.kind === 'video') {
        const e0 = sel.start, e1 = sel.start + M.clipDuration(sel);
        if (t >= e1 || t < e0) t = e0;
      } else if (t >= total) {
        if (view.loopClip) t = 0; else { t = total; S.st.playing = false; S.bus.emit('playstate', false); }
      }
      S.st.playhead = t;
      S.bus.emit('time', t);
    }
    const duck = duckFactor(t, project);
    renderAt(t, project, { playing: S.st.playing, duck });
    syncMusic(t, project, S.st.playing);
    if (onFrame) onFrame(t);
  }
  function start() { if (!raf) { lastNow = performance.now(); raf = requestAnimationFrame(tick); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function play() {
    resume();
    const total = M.totalDuration(S.project);
    if (S.st.playhead >= total - .02) S.st.playhead = 0;
    S.st.playing = true; S.bus.emit('playstate', true);
  }
  function pause() {
    S.st.playing = false; S.bus.emit('playstate', false);
    for (const [, e] of pool) { try { e.video.pause(); } catch (x) { } }
    if (musicEl) { try { musicEl.pause(); } catch (x) { } }
  }
  const toggle = () => S.st.playing ? pause() : play();

  return {
    start, stop, play, pause, toggle, renderAt, view, releaseAll, release, acquire,
    setMasterVolume, setMuted, audioDest, ctx, resume, sourceTime, motionAt, syncMusic, duckFactor,
    set frameHook(f) { onFrame = f; },
    get pool() { return pool; },
    get musicEl() { return musicEl; },
  };
})();
