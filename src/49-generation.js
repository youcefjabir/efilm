/* ============================================================
   49 — Generering: providers, jobbkö, QC, projektbygge

   Ett provider-interface, tre sätt att fylla det:

   • local      — renderar kamerarörelsen över stillbilden här i webbläsaren.
                  Kostar ingenting, ger en riktig videofil, och låter hela
                  flödet provköras innan credits spenderas.
   • higgsfield — Kling v3.0. En webbsida kan inte prata MCP, så jobben läggs
                  i kön och lämnas över: antingen till en lokal brygga
                  (tools/motion-bridge.js) eller som ett manifest som Claude
                  kör via MCP och importerar tillbaka.
   • bridge     — samma som higgsfield men helautomatiskt när bryggan svarar.

   Resten av Motion vet ingenting om vilken som används.
   ============================================================ */
const Generation = (() => {
  const bus = new U.Emitter();
  const state = { running: false, cancelled: false, jobs: [], done: 0, total: 0, message: '' };
  let bridgeUrl = null, bridgeAlive = false;

  /* ---------- lokal rendering av kamerarörelsen ---------- */
  const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

  /** Rörelsen uttryckt som zoom/pan över tid, samma semantik som prompten
   *  beskriver för videomodellen. */
  function moveTransform(moveId, k) {
    const e = ease(U.clamp(k, 0, 1));
    const m = MM.moveById(moveId);
    const amt = 0.16, pan = 0.10;
    let zoom = 1.06, dx = 0, dy = 0;
    switch (m.axis) {
      case 'z': zoom = m.dir > 0 ? 1.02 + amt * e : (1.02 + amt) - amt * e; break;
      case 'x': zoom = 1.10; dx = (m.dir > 0 ? -1 : 1) * pan * (e - 0.5) * 2; break;
      case 'y': zoom = 1.10; dy = (m.dir > 0 ? -1 : 1) * pan * (e - 0.5) * 2; break;
      case 'xz': zoom = 1.02 + amt * e; dx = (m.dir > 0 ? -1 : 1) * pan * 0.6 * (e - 0.5) * 2; break;
      case 'yz': zoom = (1.02 + amt) - amt * e; dy = -pan * 0.6 * (e - 0.5) * 2; break;
    }
    if (moveId === 'rise_tilt_down') dy = -pan * (e - 0.5) * 2;
    if (moveId === 'descend_tilt_up') dy = pan * (e - 0.5) * 2;
    return { zoom, dx, dy };
  }

  const LocalProvider = {
    id: 'local', needsBridge: false,
    async run(job, shot, asset, opts) {
      const im = await new Promise((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Bilden kunde inte läsas')); i.src = asset.url;
      });
      const { w, h } = U.frameSize(opts.aspect || '16:9', 720);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d');
      const fps = 30, total = Math.round(job.params.duration * fps);
      const stream = c.captureStream(fps);
      const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
        .find(t => { try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; } });
      if (!mime) throw new Error('Webbläsaren saknar encoder för lokal rendering.');
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8e6 });
      const chunks = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      const done = new Promise(r => rec.onstop = r);
      rec.start();

      const srcAR = im.naturalWidth / im.naturalHeight, outAR = w / h;
      for (let i = 0; i < total; i++) {
        if (state.cancelled) break;
        const { zoom, dx, dy } = moveTransform(shot.movementId, i / Math.max(1, total - 1));
        // fyll bildytan (cover) och lägg rörelsen ovanpå
        let dw = w * zoom, dh = h * zoom;
        if (srcAR > outAR) dw = dh * srcAR; else dh = dw / srcAR;
        g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
        g.drawImage(im, (w - dw) / 2 + dx * w, (h - dh) / 2 + dy * h, dw, dh);
        await new Promise(r => setTimeout(r, 1000 / fps));
      }
      rec.stop(); await done;
      const blob = new Blob(chunks, { type: 'video/webm' });
      if (!blob.size) throw new Error('Renderingen gav en tom fil.');
      return { blob, name: `shot-${String(shot.index + 1).padStart(2, '0')}-${shot.movementId}.webm`, cost: 0 };
    },
  };

  /* ---------- Higgsfield / Kling v3.0 ---------- */
  const HiggsfieldProvider = {
    id: 'higgsfield_kling3', needsBridge: true,
    /** Det som en brygga eller Claude behöver för att köra jobbet. */
    request(job, shot, asset, opts) {
      return {
        jobId: job.id, shotId: shot.id,
        model: 'kling3_0',
        prompt: shot.prompt,
        duration: job.params.duration,
        mode: job.params.mode, sound: job.params.sound,
        aspect_ratio: opts.aspect || '16:9',
        image: { assetId: asset.id, name: asset.name },
        estimatedCredits: job.cost,
      };
    },
    async run(job, shot, asset, opts) {
      if (!bridgeAlive) {
        const e = new Error('Ingen brygga ansluten — jobbet ligger kvar i kön.');
        e.code = 'no_bridge';
        throw e;
      }
      const form = new FormData();
      form.append('request', JSON.stringify(this.request(job, shot, asset, opts)));
      form.append('image', asset.file, asset.name);
      const res = await fetch(bridgeUrl.replace(/\/$/, '') + '/generate', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Bryggan svarade ' + res.status + ': ' + (await res.text()).slice(0, 200));
      const blob = await res.blob();
      if (!blob.size) throw new Error('Bryggan returnerade en tom fil.');
      return { blob, name: `shot-${String(shot.index + 1).padStart(2, '0')}-kling.mp4`, cost: job.cost };
    },
  };

  const providers = { local: LocalProvider, higgsfield_kling3: HiggsfieldProvider };
  const providerFor = id => providers[id] || LocalProvider;

  /* ---------- brygga ---------- */
  async function connectBridge(url) {
    bridgeUrl = url || bridgeUrl;
    if (!bridgeUrl) { bridgeAlive = false; return false; }
    try {
      const r = await fetch(bridgeUrl.replace(/\/$/, '') + '/health', { method: 'GET' });
      bridgeAlive = r.ok;
    } catch (e) { bridgeAlive = false; }
    bus.emit('bridge', bridgeAlive);
    return bridgeAlive;
  }
  /** Manifest som Claude kan köra via MCP när ingen brygga finns. */
  function manifest(plan, project, assets) {
    return {
      version: 1, createdAt: Date.now(),
      project: { id: project.id, name: project.propertyName, aspect: plan.aspect },
      provider: 'higgsfield / kling3_0',
      totalCredits: MM.planCost(plan, plan.provider),
      jobs: plan.shots.map(s => {
        const a = assets.find(x => x.id === s.assetId);
        return {
          shotId: s.id, index: s.index + 1, image: a ? a.name : '?',
          model: 'kling3_0', prompt: s.prompt,
          duration: s.generatedDuration, mode: 'std', sound: 'off',
          aspect_ratio: plan.aspect,
          useSegment: { in: s.sourceIn, out: s.sourceOut },
          timeline: { in: s.timelineIn, out: s.timelineOut },
          estimatedCredits: MM.shotCost(plan.provider, s.generatedDuration),
        };
      }),
    };
  }

  /* ---------- QC: återanvänder stabilisatorns mätningar ---------- */
  async function qc(media) {
    try {
      const { report } = await StabAnalyze.analyze(media, { maxFrames: 240 });
      const bad = report.wobble.score > 0.55 || report.trackingQuality < 0.5;
      const shaky = report.shake.score > 0.35 || report.bob.score > 0.4;
      return {
        pass: !bad,
        wobble: report.wobble.score, shake: report.shake.score, bob: report.bob.score,
        tracking: report.trackingQuality,
        needsStabilization: shaky,
        note: bad
          ? 'Klippet deformeras eller går inte att spåra — bör genereras om.'
          : shaky ? 'Klippet skakar något; stabilisering slås på automatiskt.' : 'Stabilt.',
      };
    } catch (e) {
      return { pass: true, note: 'QC kunde inte köras: ' + e.message, error: true };
    }
  }

  /* ---------- kön ---------- */
  async function runPlan(plan, ctx) {
    if (state.running) throw new Error('En generering pågår redan.');
    state.running = true; state.cancelled = false;
    state.jobs = plan.shots.map(s => MM.newJob(s, plan.provider, plan.aspect, plan.resolution || 'hd', plan.audio || 'off'));
    state.done = 0; state.total = state.jobs.length;
    const results = [];
    const prov = providerFor(plan.provider);
    bus.emit('start', state);

    try {
      for (let i = 0; i < plan.shots.length; i++) {
        if (state.cancelled) break;
        const shot = plan.shots[i], job = state.jobs[i];
        const asset = ctx.assets.find(a => a.id === shot.assetId);
        if (!asset) { job.status = 'failed'; job.error = 'Bilden saknas'; shot.status = 'failed'; continue; }

        let attempt = 0, ok = false;
        while (attempt < 3 && !ok && !state.cancelled) {
          attempt++; job.attempts = attempt;
          job.status = 'running'; shot.status = 'generating';
          state.message = `Shot ${i + 1}/${plan.shots.length} · ${MM.moveById(shot.movementId).name}${attempt > 1 ? ` (försök ${attempt})` : ''}`;
          bus.emit('progress', { ...state, index: i });
          try {
            const out = await prov.run(job, shot, asset, { aspect: plan.aspect });
            const media = await Media.ingestOne(new File([out.blob], out.name, { type: out.blob.type }));
            shot.outputAssetId = media.id;
            job.status = 'done'; job.cost = out.cost;
            shot.status = 'generated';

            state.message = `QC shot ${i + 1}/${plan.shots.length}`;
            bus.emit('progress', { ...state, index: i });
            const q = await qc(media);
            shot.qc = q;
            if (!q.pass && attempt < 3) { shot.status = 'qc_fail'; continue; }
            shot.status = q.pass ? 'approved' : 'qc_fail';
            shot.needsStabilization = !!q.needsStabilization;
            results.push({ shot, media });
            ok = true;
          } catch (e) {
            job.error = e.message; job.log.push(e.message);
            if (e.code === 'no_bridge') { job.status = 'pending'; shot.status = 'queued'; ok = true; break; }
            if (attempt >= 3) { job.status = 'failed'; shot.status = 'failed'; }
          }
        }
        state.done++;
        bus.emit('progress', { ...state, index: i });
      }
    } finally {
      state.running = false;
      bus.emit('done', { results, cancelled: state.cancelled });
    }
    return results;
  }
  const cancel = () => { state.cancelled = true; state.message = 'Avbryter…'; };

  /* ---------- projektbygge: planen blir ett vanligt editorprojekt ---------- */
  function buildProject(plan, ctx, results) {
    const p = M.newProject(ctx.propertyName || 'Motion');
    p.settings.aspect = plan.aspect;
    p.motion = {
      planId: plan.id, createdBy: plan.createdBy, rationale: plan.rationale,
      provider: plan.provider, musicAssetId: ctx.musicAssetId,
      shots: plan.shots.map(s => ({ ...s })),
      musicAnalysisId: ctx.musicAnalysis ? ctx.musicAnalysis.id : null,
    };

    const byShot = new Map(results.map(r => [r.shot.id, r.media]));
    for (const s of plan.shots) {
      const media = byShot.get(s.id);
      if (!media) continue;
      p.media.push(media);
      const clip = M.newClip(media, 0);
      clip.in = s.sourceIn;
      clip.out = Math.min(s.sourceOut, media.duration || s.sourceOut);
      clip.shotId = s.id;
      clip.transitionIn = { type: 'cut', dur: 0 };   // rena klipp mot musiken
      clip.stabEnabled = false;
      p.tracks.video.push(clip);
    }
    M.relayout(p.tracks.video);

    if (ctx.music) {
      p.media.push(ctx.music);
      // Musiken slutar när bilden slutar. Att låta den ringa ut efter sista
      // rutan gör bara filmen längre än den ser ut att vara.
      const videoEnd = p.tracks.video.reduce((a, c) => Math.max(a, c.start + (c.out - c.in)), 0);
      const a = M.newAudioClip(ctx.music, 0);
      a.out = Math.min(ctx.music.duration, videoEnd);
      a.fade = { in: 0.6, out: Math.min(2.2, videoEnd * 0.25) };
      p.tracks.music.push(a);
    }
    for (const img of (ctx.assets || [])) if (!p.media.find(m => m.id === img.id)) p.media.push(img);
    return p;
  }

  return {
    bus, state, providers, providerFor, moveTransform,
    connectBridge, manifest, qc, runPlan, cancel, buildProject,
    get bridgeAlive() { return bridgeAlive; },
    get bridgeUrl() { return bridgeUrl; },
  };
})();
