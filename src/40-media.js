/* ============================================================
   40 — Media ingestion: metadata, thumbnails, filmstrip, waveform
   ============================================================ */
const Media = (() => {
  const STD_FPS = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60, 120];
  let audioCtx = null;
  const getAudioCtx = () => audioCtx || (audioCtx = new (window.AudioContext || window.webkitAudioContext)());

  function loadVideoEl(url, { muted = true } = {}) {
    return new Promise((res, rej) => {
      const v = document.createElement('video');
      v.preload = 'auto'; v.muted = muted; v.playsInline = true; v.crossOrigin = 'anonymous';
      v.src = url;
      const to = setTimeout(() => rej(new Error('Tidsgränsen gick ut när videon lästes in')), 25000);
      v.onloadedmetadata = () => { clearTimeout(to); res(v); };
      v.onerror = () => { clearTimeout(to); rej(new Error('Webbläsaren kan inte avkoda den här videofilen (' + (v.error && v.error.code) + ')')); };
    });
  }
  function seekTo(v, t) {
    return new Promise(res => {
      let done = false;
      const ok = () => { if (done) return; done = true; v.removeEventListener('seeked', ok); res(); };
      v.addEventListener('seeked', ok);
      setTimeout(ok, 2500);
      try { v.currentTime = Math.max(0, Math.min(t, (v.duration || 1) - 0.02)); } catch (e) { ok(); }
    });
  }
  async function estimateFps(v) {
    if (!v.requestVideoFrameCallback) return null;
    return new Promise(res => {
      const times = []; const t0 = performance.now(); let stopped = false;
      const finish = () => {
        if (stopped) return; stopped = true;
        try { v.pause(); v.currentTime = 0; } catch (e) { }
        if (times.length < 4) return res(null);
        const d = []; for (let i = 1; i < times.length; i++) { const dt = times[i] - times[i - 1]; if (dt > 0.001) d.push(dt); }
        if (!d.length) return res(null);
        d.sort((a, b) => a - b);
        const med = d[Math.floor(d.length / 2)];
        let fps = 1 / med;
        const near = STD_FPS.find(f => Math.abs(f - fps) < Math.max(0.8, f * 0.04));
        res(near || Math.round(fps * 100) / 100);
      };
      const step = (now, meta) => {
        times.push(meta.mediaTime);
        if (times.length >= 14 || performance.now() - t0 > 1800) return finish();
        v.requestVideoFrameCallback(step);
      };
      v.requestVideoFrameCallback(step);
      v.play().catch(() => finish());
      setTimeout(finish, 2500);
    });
  }

  async function makeThumb(v, t, w = 320) {
    await seekTo(v, t);
    const h = Math.max(1, Math.round(w * (v.videoHeight / Math.max(1, v.videoWidth))));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(v, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.72);
  }
  async function makeStrip(v, duration, frames = 10, fh = 54) {
    const fw = Math.max(1, Math.round(fh * (v.videoWidth / Math.max(1, v.videoHeight))));
    const c = document.createElement('canvas'); c.width = fw * frames; c.height = fh;
    const g = c.getContext('2d');
    for (let i = 0; i < frames; i++) {
      await seekTo(v, (i + .5) / frames * duration);
      g.drawImage(v, i * fw, 0, fw, fh);
    }
    return c.toDataURL('image/jpeg', 0.6);
  }

  /* ---------- audio ---------- */
  async function analyzeAudio(file) {
    const buf = await file.arrayBuffer();
    const ctx = getAudioCtx();
    const audio = await ctx.decodeAudioData(buf.slice(0));
    const ch = audio.getChannelData(0);
    const N = 1600, block = Math.max(1, Math.floor(ch.length / N));
    const peaks = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      let mx = 0; const s = i * block, e = Math.min(ch.length, s + block);
      for (let j = s; j < e; j += 2) { const a = Math.abs(ch[j]); if (a > mx) mx = a; }
      peaks[i] = mx;
    }
    return { duration: audio.duration, peaks: Array.from(peaks, p => Math.round(p * 255)), sampleRate: audio.sampleRate, channels: audio.numberOfChannels, beats: detectBeats(ch, audio.sampleRate, audio.duration) };
  }
  /** Transientdetektering: spektral-energiflöde i korta fönster + adaptiv tröskel. */
  function detectBeats(ch, sr, duration) {
    const hop = Math.floor(sr / 90);
    const n = Math.floor(ch.length / hop);
    const env = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let sum = 0; const s = i * hop, e = Math.min(ch.length, s + hop);
      for (let j = s; j < e; j++) sum += ch[j] * ch[j];
      env[i] = Math.sqrt(sum / Math.max(1, e - s));
    }
    const flux = new Float32Array(n);
    for (let i = 1; i < n; i++) flux[i] = Math.max(0, env[i] - env[i - 1]);
    const W = 40, beats = [];
    let last = -1;
    for (let i = 1; i < n; i++) {
      let m = 0, cnt = 0;
      for (let j = Math.max(0, i - W); j < Math.min(n, i + W); j++) { m += flux[j]; cnt++; }
      m /= Math.max(1, cnt);
      if (flux[i] > m * 1.9 && flux[i] > 0.006 && (i - last) > 12) {
        beats.push(U.round(i * hop / sr, 3)); last = i;
      }
    }
    // uppskatta BPM från medianintervall
    let bpm = null;
    if (beats.length > 5) {
      const d = []; for (let i = 1; i < beats.length; i++) d.push(beats[i] - beats[i - 1]);
      d.sort((a, b) => a - b);
      const med = d[Math.floor(d.length / 2)];
      if (med > 0.2) { bpm = Math.round(60 / med); while (bpm < 70) bpm *= 2; while (bpm > 180) bpm /= 2; bpm = Math.round(bpm); }
    }
    return { times: beats, bpm };
  }

  /* ---------- ingestion ---------- */
  async function ingestFiles(files, onProgress) {
    const out = [];
    const list = [...files].filter(f => f.type.startsWith('video/') || f.type.startsWith('audio/') || /\.(mp4|mov|webm|m4v|mkv|mp3|wav|m4a|aac|ogg)$/i.test(f.name));
    if (!list.length) { U.toast('Inga giltiga filer', 'Ladda upp video (mp4, mov, webm) eller ljud (mp3, wav, m4a).', 'warn'); return out; }
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      onProgress && onProgress(i / list.length, f.name);
      try { out.push(await ingestOne(f)); }
      catch (e) { U.errToast('Kunde inte importera ' + f.name, e); }
    }
    onProgress && onProgress(1, '');
    return out;
  }

  async function ingestOne(file) {
    const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name);
    const id = U.uid(isAudio ? 'aud' : 'vid');
    const url = URL.createObjectURL(file);
    const m = {
      id, name: file.name, size: file.size, mime: file.type || (isAudio ? 'audio/*' : 'video/*'),
      type: isAudio ? 'audio' : 'video', addedAt: Date.now(), folder: 'Alla',
      duration: 0, width: 0, height: 0, fps: null, url, file,
      stab: { status: 'none' },
    };
    if (isAudio) {
      const a = await analyzeAudio(file);
      m.duration = a.duration; m.wave = a.peaks; m.beats = a.beats.times; m.bpm = a.beats.bpm;
      m.sampleRate = a.sampleRate; m.channels = a.channels;
    } else {
      const v = await loadVideoEl(url);
      m.duration = isFinite(v.duration) ? v.duration : 0;
      m.width = v.videoWidth; m.height = v.videoHeight;
      if (!m.width || !m.height) throw new Error('Videon saknar bildström eller stöds inte av webbläsaren');
      m.fps = await estimateFps(v);
      m.thumb = await makeThumb(v, Math.min(m.duration * .12, 2));
      m.strip = await makeStrip(v, m.duration, m.duration > 6 ? 12 : 6);
      v.src = ''; v.load();
      // har klippet ljudspår?
      m.hasAudio = !!(v.mozHasAudio || (v.webkitAudioDecodedByteCount > 0) || (v.audioTracks && v.audioTracks.length));
    }
    try { await DB.putFile(id, file, file.name, file.type); } catch (e) { console.warn('IDB put misslyckades', e); }
    return m;
  }

  /** Återknyt blobbar från IndexedDB efter omladdning. */
  async function rehydrate(project, onMissing) {
    for (const m of project.media) {
      if (!m.url) {
        try {
          const rec = await DB.getFile(m.id);
          if (rec && rec.blob) { m.file = rec.blob; m.url = URL.createObjectURL(rec.blob); m.missing = false; }
          else { m.missing = true; onMissing && onMissing(m); continue; }
        } catch (e) { m.missing = true; onMissing && onMissing(m); continue; }
      }
      // saknade förhandsbilder byggs om från filen (t.ex. äldre projektfiler)
      try {
        if (m.type === 'video' && (!m.thumb || !m.strip)) {
          const v = await loadVideoEl(m.url);
          if (!m.thumb) m.thumb = await makeThumb(v, Math.min(m.duration * .12, 2));
          if (!m.strip) m.strip = await makeStrip(v, m.duration, m.duration > 6 ? 12 : 6);
          v.src = ''; v.load();
        } else if (m.type === 'audio' && !m.wave && m.file) {
          const a = await analyzeAudio(m.file);
          m.wave = a.peaks; m.beats = a.beats.times; m.bpm = a.beats.bpm;
        }
      } catch (e) { console.warn('kunde inte bygga om förhandsbilder för', m.name, e); }
    }
  }
  async function removeMedia(project, id) {
    const i = project.media.findIndex(m => m.id === id);
    if (i < 0) return;
    const m = project.media[i];
    if (m.url) URL.revokeObjectURL(m.url);
    project.media.splice(i, 1);
    project.tracks.video = project.tracks.video.filter(c => c.mediaId !== id);
    project.tracks.music = project.tracks.music.filter(c => c.mediaId !== id);
    try { await DB.delFile(id); } catch (e) { }
  }
  const usedCount = (project, id) => project.tracks.video.filter(c => c.mediaId === id).length + project.tracks.music.filter(c => c.mediaId === id).length;

  return { ingestFiles, ingestOne, rehydrate, removeMedia, usedCount, loadVideoEl, seekTo, makeThumb, analyzeAudio, getAudioCtx };
})();
