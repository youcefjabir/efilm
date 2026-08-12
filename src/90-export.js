/* ============================================================
   90 — Export: riktig rendering via canvas.captureStream + MediaRecorder

   Renderingen sker i realtid genom samma pipeline som previewn, i full
   projektupplösning. Ljudet tas från Web Audio-grafen. Vill man senare
   flytta renderingen till en backend-worker byter man bara ut runExport()
   — resten av editorn är oberoende av den.
   ============================================================ */
const Exporter = (() => {
  const PRESETS = [
    { id: 'web169', name: 'Hemnet / webbplats 16:9', desc: '1080p, 30 fps, 12 Mbit/s', settings: { aspect: '16:9', resolution: 1080, fps: 30 }, quality: 12 },
    { id: 'reel', name: 'Instagram Reel 9:16', desc: '1080×1920, 30 fps', settings: { aspect: '9:16', resolution: 1920, fps: 30 }, quality: 10 },
    { id: 'feed', name: 'Instagram Feed 4:5', desc: '1080×1350, 30 fps', settings: { aspect: '4:5', resolution: 1350, fps: 30 }, quality: 10 },
    { id: 'story', name: 'Story 9:16', desc: '1080×1920, 30 fps, lättare fil', settings: { aspect: '9:16', resolution: 1920, fps: 30 }, quality: 8 },
    { id: 'master', name: 'High-quality master', desc: 'Högsta upplösning miljön klarar, 28 Mbit/s', settings: { aspect: '16:9', resolution: 2160, fps: 30 }, quality: 28 },
    { id: 'light', name: 'Lightweight preview', desc: '1080p, 25 fps, 4 Mbit/s', settings: { aspect: '16:9', resolution: 1080, fps: 25 }, quality: 4 },
  ];

  const CANDIDATES = [
    ['mp4h264', 'MP4 · H.264 + AAC', 'video/mp4;codecs=avc1.42E01E,mp4a.40.2'],
    ['mp4', 'MP4', 'video/mp4'],
    ['webmvp9', 'WebM · VP9 + Opus', 'video/webm;codecs=vp9,opus'],
    ['webmvp8', 'WebM · VP8 + Opus', 'video/webm;codecs=vp8,opus'],
    ['webm', 'WebM', 'video/webm'],
  ];
  function supported() {
    if (typeof MediaRecorder === 'undefined') return [];
    return CANDIDATES.filter(c => { try { return MediaRecorder.isTypeSupported(c[2]); } catch (e) { return false; } });
  }
  function codecOptions() {
    const s = supported();
    if (!s.length) return [['auto', 'Ingen inbyggd encoder']];
    return [['auto', 'Auto (' + s[0][1] + ')'], ...s.map(c => [c[0], c[1]])];
  }
  function pick(container) {
    const s = supported();
    if (!s.length) return null;
    if (container && container !== 'auto') { const f = s.find(c => c[0] === container); if (f) return f; }
    return s[0];
  }

  const status = { running: false, progress: 0, message: '', result: null, error: null };
  let recorder = null, cancelled = false, chunks = [];

  function outSize(p) {
    const h = p.settings.resolution || 1080;
    const { w, h: hh } = U.frameSize(p.settings.aspect, h);
    return { w, h: hh };
  }
  function projectFps(p) {
    if (p.settings.fps === 'source') {
      const f = p.media.filter(m => m.type === 'video' && m.fps).map(m => m.fps);
      return f.length ? Math.round(f.sort((a, b) => a - b)[Math.floor(f.length / 2)]) : 30;
    }
    return p.settings.fps || 30;
  }
  function estimate(p) {
    const { w, h } = outSize(p);
    const duration = M.totalDuration(p);
    const fps = projectFps(p);
    const bits = (p.export.quality || 12) * 1e6;
    const c = pick(p.export.container);
    return {
      w, h, fps, duration,
      bytes: duration * bits / 8 * (p.export.audio ? 1.03 : 1),
      time: duration + 3,
      codecLabel: c ? c[1] : 'saknas i denna webbläsare',
    };
  }
  function capabilityNote() {
    const s = supported();
    if (!s.length) return 'Den här webbläsaren saknar MediaRecorder — exporten kan inte köras lokalt. Allt annat (projekt, timeline, stabilisering) fungerar, och renderingen kan kopplas till en backend-worker via runExport().';
    return 'Exporten renderas i realtid genom samma GPU-pipeline som previewn, i full projektupplösning, och kodas med webbläsarens inbyggda encoder (' + s[0][1] + '). Långa filmer tar ungefär lika lång tid som de är långa.';
  }

  async function start() {
    if (status.running) return;
    const p = S.project;
    const duration = M.totalDuration(p);
    if (duration < .2) { U.toast('Inget att exportera', 'Lägg minst ett klipp på timelinen först.', 'warn'); return; }
    const codec = pick(p.export.container);
    if (!codec) { U.toast('Export stöds inte här', capabilityNote(), 'err'); return; }
    cancelled = false; chunks = [];
    status.running = true; status.progress = 0; status.result = null; status.error = null;
    status.message = 'Förbereder…';
    Panels.render();
    try {
      await runExport(p, codec, duration);
      if (!cancelled) {
        const blob = new Blob(chunks, { type: codec[2].split(';')[0] });
        const ext = codec[2].includes('mp4') ? 'mp4' : 'webm';
        status.result = { blob, name: (p.export.filename || 'bostadsfilm') + '.' + ext, size: blob.size, url: URL.createObjectURL(blob) };
        status.message = 'Klar';
        U.toast('Exporten är klar', status.result.name + ' · ' + U.bytes(blob.size));
      } else {
        status.message = 'Avbruten';
      }
    } catch (e) {
      status.error = e.message;
      U.errToast('Exporten misslyckades', e);
    } finally {
      status.running = false;
      Playback.view.exporting = false;
      App.applyPreviewSize();
      Panels.render();
    }
  }

  /** Den utbytbara renderingsmodulen. Byt ut denna mot ett anrop till en
      backend-worker om exporten ska ske på server — inget annat behöver ändras. */
  function runExport(p, codec, duration) {
    return new Promise((resolve, reject) => {
      const { w, h } = outSize(p);
      const fps = projectFps(p);
      Playback.pause();
      Playback.view.exporting = true;
      Renderer.setSize(w, h);
      const canvas = Renderer.canvas;
      let stream;
      try { stream = canvas.captureStream(fps); }
      catch (e) { return reject(new Error('canvas.captureStream stöds inte i den här webbläsaren.')); }
      if (p.export.audio) {
        try {
          const ac = Playback.ctx();
          const dest = ac.createMediaStreamDestination();
          Playback.audioDest().connect(dest);
          dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
        } catch (e) { console.warn('ljudspår kunde inte läggas till', e); }
      }
      let rec;
      try {
        rec = new MediaRecorder(stream, {
          mimeType: codec[2],
          videoBitsPerSecond: (p.export.quality || 12) * 1e6,
          audioBitsPerSecond: 160000,
        });
      } catch (e) { return reject(new Error('Encodern kunde inte startas: ' + e.message)); }
      recorder = rec;
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onerror = e => reject(new Error('Inspelningsfel: ' + (e.error && e.error.name)));
      rec.onstop = () => { recorder = null; resolve(); };

      S.st.playhead = 0;
      S.st.playing = false;
      Playback.resume();
      Playback.renderAt(0, p, { playing: false });

      // en kort inledande paus så att första bildrutan hinner dekodas
      setTimeout(() => {
        rec.start(400);
        const t0 = performance.now();
        let last = t0;
        const step = now => {
          if (cancelled) { try { rec.stop(); } catch (e) { } return; }
          const t = (now - t0) / 1000;
          last = now;
          S.st.playhead = Math.min(t, duration);
          Playback.renderAt(S.st.playhead, p, { playing: true, duck: Playback.duckFactor(S.st.playhead, p) });
          Playback.syncMusic(S.st.playhead, p, true);
          status.progress = U.clamp(t / duration, 0, 1);
          status.message = `Renderar ${U.tc(Math.min(t, duration), false)} / ${U.tc(duration, false)} · ${w}×${h} @ ${fps} fps`;
          S.bus.emit('exportprogress', status.progress);
          if (t >= duration + .25) {
            Playback.pause();
            setTimeout(() => { try { rec.stop(); } catch (e) { reject(e); } }, 250);
            return;
          }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 350);
    });
  }

  function cancel() {
    cancelled = true;
    status.message = 'Avbryter…';
    try { if (recorder && recorder.state !== 'inactive') recorder.stop(); } catch (e) { }
    Playback.pause();
  }
  function download() {
    if (!status.result) return;
    const a = document.createElement('a');
    a.href = status.result.url; a.download = status.result.name;
    document.body.append(a); a.click(); a.remove();
  }

  return { PRESETS, start, cancel, download, estimate, codecOptions, capabilityNote, supported, status, outSize, projectFps };
})();
