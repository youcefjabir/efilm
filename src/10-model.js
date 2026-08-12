/* ============================================================
   10 — Data model, defaults and presets
   ============================================================ */
const M = (() => {

  /* ---------- grade (bildjustering) ---------- */
  const GRADE_DEFS = [
    ['exposure', 'Exposure', -2, 2, 0.01, 0],
    ['contrast', 'Contrast', -100, 100, 1, 0],
    ['highlights', 'Highlights', -100, 100, 1, 0],
    ['shadows', 'Shadows', -100, 100, 1, 0],
    ['whites', 'Whites', -100, 100, 1, 0],
    ['blacks', 'Blacks', -100, 100, 1, 0],
    ['temperature', 'Temperature', -100, 100, 1, 0],
    ['tint', 'Tint', -100, 100, 1, 0],
    ['saturation', 'Saturation', -100, 100, 1, 0],
    ['vibrance', 'Vibrance', -100, 100, 1, 0],
    ['clarity', 'Clarity', -100, 100, 1, 0],
    ['dehaze', 'Dehaze', -100, 100, 1, 0],
    ['sharpen', 'Sharpening', 0, 100, 1, 0],
    ['denoise', 'Noise reduction', 0, 100, 1, 0],
    ['highlightRecovery', 'Highlight recovery', 0, 100, 1, 0],
    ['shadowRecovery', 'Shadow recovery', 0, 100, 1, 0],
    ['windowProtect', 'Window protection', 0, 100, 1, 0],
    ['verticalCorrection', 'Vertical correction', -50, 50, 0.5, 0],
    ['vignette', 'Vignette', -100, 100, 1, 0],
  ];
  const emptyGrade = () => { const g = {}; GRADE_DEFS.forEach(d => g[d[0]] = d[5]); return g; };

  /* Diskreta presets byggda för bostadsfilm: neutrala väggar, inga orangea interiörer. */
  const FILTERS = [
    { id: 'none', name: 'No Filter', desc: 'Ingen färgbehandling', g: {} },
    { id: 'viewly', name: 'Viewly Natural', desc: 'Husets signaturlook — neutral och ren', g: { exposure: .06, contrast: 8, highlights: -12, shadows: 10, whites: 4, blacks: -3, temperature: -3, saturation: -2, vibrance: 10, clarity: 8, highlightRecovery: 18, windowProtect: 22, sharpen: 12 } },
    { id: 'scandi', name: 'Scandinavian Bright', desc: 'Ljust, luftigt, kalla vita väggar', g: { exposure: .16, contrast: 4, highlights: -18, shadows: 16, whites: 8, blacks: -2, temperature: -8, tint: -2, saturation: -6, vibrance: 8, clarity: 4, highlightRecovery: 24, windowProtect: 26, sharpen: 10 } },
    { id: 'luxury', name: 'Soft Luxury', desc: 'Mjuka högdagrar, låg kontrast, dyr känsla', g: { exposure: .04, contrast: -6, highlights: -22, shadows: 18, blacks: 6, temperature: 3, saturation: -6, vibrance: 12, clarity: -6, highlightRecovery: 20, windowProtect: 18, vignette: 8 } },
    { id: 'warmeve', name: 'Warm Evening', desc: 'Kvällsljus utan att bli orange', g: { exposure: -.04, contrast: 10, highlights: -14, shadows: 12, temperature: 12, tint: 2, saturation: -2, vibrance: 8, clarity: 6, vignette: 14, windowProtect: 10 } },
    { id: 'neutral', name: 'Clean Neutral', desc: 'Korrigerad och rak — inget uttryck', g: { exposure: .02, contrast: 5, highlights: -8, shadows: 8, whites: 3, temperature: 0, vibrance: 4, clarity: 5, sharpen: 14 } },
    { id: 'editorial', name: 'Editorial Interior', desc: 'Magasinslook, djupare svärta', g: { exposure: .02, contrast: 16, highlights: -16, shadows: 6, blacks: -10, temperature: -2, saturation: -8, vibrance: 14, clarity: 14, sharpen: 16, highlightRecovery: 16 } },
    { id: 'extday', name: 'Exterior Day', desc: 'Fasad, himmel och grönska i dagsljus', g: { exposure: -.06, contrast: 12, highlights: -24, shadows: 14, whites: 4, temperature: -4, saturation: 4, vibrance: 12, clarity: 10, dehaze: 14, sharpen: 16, highlightRecovery: 22 } },
    { id: 'bluehour', name: 'Blue Hour Exterior', desc: 'Skymning med varma fönster', g: { exposure: .08, contrast: 10, highlights: -10, shadows: 20, blacks: -4, temperature: -14, tint: 4, saturation: -4, vibrance: 16, clarity: 6, vignette: 12, windowProtect: 30 } },
    { id: 'softcon', name: 'Soft Contrast', desc: 'Filmisk låg kontrast', g: { contrast: -10, highlights: -12, shadows: 14, blacks: 10, vibrance: 8, clarity: -4 } },
    { id: 'window', name: 'Window Recovery', desc: 'Räddar utbrända fönster', g: { exposure: -.1, contrast: 6, highlights: -34, shadows: 22, whites: -10, highlightRecovery: 55, windowProtect: 60, vibrance: 10, clarity: 6 } },
    { id: 'wood', name: 'Natural Wood', desc: 'Trägolv och ek utan gult stick', g: { exposure: .04, contrast: 8, highlights: -12, shadows: 10, temperature: 5, tint: -3, saturation: -4, vibrance: 16, clarity: 10, sharpen: 14 } },
    { id: 'muted', name: 'Premium Muted', desc: 'Dämpad, återhållsam, dyr', g: { exposure: .02, contrast: 4, highlights: -14, shadows: 12, blacks: 4, temperature: -2, saturation: -16, vibrance: 10, clarity: 2, vignette: 6 } },
  ];
  const filterById = id => FILTERS.find(f => f.id === id) || FILTERS[0];

  /* ---------- stabilisering ---------- */
  const STAB_DEFS = [
    ['strength', 'Stabiliseringsstyrka', 0, 100, 1, 70],
    ['smoothness', 'Smoothness', 0, 100, 1, 55],
    ['crop', 'Crop amount', 0, 25, 0.5, 6],
    ['zoomComp', 'Zoom compensation', 0, 100, 1, 100],
    ['rotation', 'Rotation correction', 0, 100, 1, 60],
    ['perspective', 'Perspective correction', 0, 100, 1, 0],
    ['verticalBob', 'Vertical bob reduction', 0, 100, 1, 0],
    ['wobble', 'Wobble reduction', 0, 100, 1, 0],
    ['motionPreservation', 'Motion preservation', 0, 100, 1, 40],
    ['rollingShutter', 'Rolling shutter correction', 0, 100, 1, 0],
  ];
  const STAB_FLAGS = [
    ['autoCrop', 'Auto crop', true, 'Räknar ut minsta crop som döljer kanterna'],
    ['lockHorizon', 'Lock horizon', false, 'Nollar rotationsdrift så horisonten står stilla'],
    ['lockLines', 'Lock architectural lines', true, 'Viktar spårningen mot väggar, dörrkarmar och fönster'],
    ['reduceEdgeWarp', 'Reduce edge warping', true, 'Extra marginal + dämpning nära bildkanten'],
  ];
  const emptyStab = () => {
    const s = { mode: 'auto' };
    STAB_DEFS.forEach(d => s[d[0]] = d[5]);
    STAB_FLAGS.forEach(f => s[f[0]] = f[2]);
    return s;
  };
  const STAB_MODES = [
    { id: 'auto', name: 'Auto', desc: 'Analyserar klippet och väljer inställningar automatiskt', s: {} },
    { id: 'subtle', name: 'Subtle', desc: 'Behåller rörelsen, tar bara bort små vibrationer', s: { strength: 45, smoothness: 26, crop: 3, motionPreservation: 75, rotation: 35, verticalBob: 10 } },
    { id: 'smooth', name: 'Smooth', desc: 'Jämnar ut kamerabanan tydligt', s: { strength: 78, smoothness: 62, crop: 7, motionPreservation: 35, rotation: 65, verticalBob: 35 } },
    { id: 'locked', name: 'Locked', desc: 'Försöker skapa tripod- eller sliderkänsla', s: { strength: 100, smoothness: 96, crop: 12, motionPreservation: 0, rotation: 100, verticalBob: 80, lockHorizon: true } },
    { id: 'bob', name: 'Walking Bob Removal', desc: 'Reducerar rytmisk vertikal rörelse från gående kamera', s: { strength: 82, smoothness: 55, crop: 8, motionPreservation: 45, verticalBob: 100, rotation: 55 } },
    { id: 'wobble', name: 'AI Wobble Repair', desc: 'För genererade klipp där arkitekturen böjer sig', s: { strength: 85, smoothness: 72, crop: 11, wobble: 100, perspective: 55, rollingShutter: 45, motionPreservation: 25, reduceEdgeWarp: true, lockLines: true } },
    { id: 'horizon', name: 'Horizon Lock', desc: 'Håller vertikaler och horisont stabila', s: { strength: 60, smoothness: 45, crop: 6, rotation: 100, perspective: 40, lockHorizon: true, lockLines: true, motionPreservation: 60 } },
  ];
  const stabModeById = id => STAB_MODES.find(m => m.id === id) || STAB_MODES[0];

  /* ---------- rörelse (virtuell kamerarörelse) ---------- */
  const MOTION_PRESETS = [
    { id: 'none', name: 'Ingen', desc: '—', p: {} },
    { id: 'pushin', name: 'Smooth push in', desc: 'Långsam inzoomning', p: { zoom: 8, easing: 'inout' } },
    { id: 'pullout', name: 'Smooth pull out', desc: 'Långsam utzoomning', p: { zoom: -8, easing: 'inout' } },
    { id: 'panl', name: 'Pan left', desc: 'Panorering vänster', p: { dirX: -10, easing: 'inout', zoom: 5 } },
    { id: 'panr', name: 'Pan right', desc: 'Panorering höger', p: { dirX: 10, easing: 'inout', zoom: 5 } },
    { id: 'rise', name: 'Rise up', desc: 'Kameran stiger', p: { dirY: -9, easing: 'inout', zoom: 5 } },
    { id: 'descend', name: 'Descend', desc: 'Kameran sjunker', p: { dirY: 9, easing: 'inout', zoom: 5 } },
    { id: 'tiltup', name: 'Tilt up', desc: 'Tiltar uppåt', p: { dirY: -7, tilt: 1.2, easing: 'inout', zoom: 6 } },
    { id: 'tiltdown', name: 'Tilt down', desc: 'Tiltar nedåt', p: { dirY: 7, tilt: -1.2, easing: 'inout', zoom: 6 } },
    { id: 'risetilt', name: 'Rise + tilt down', desc: 'Stiger och tiltar ner', p: { dirY: -9, tilt: -1.4, easing: 'inout', zoom: 7 } },
    { id: 'desctilt', name: 'Descend + tilt up', desc: 'Sjunker och tiltar upp', p: { dirY: 9, tilt: 1.4, easing: 'inout', zoom: 7 } },
    { id: 'orbit', name: 'Subtle orbit', desc: 'Diskret orbit runt motivet', p: { dirX: 7, rot: .5, easing: 'inout', zoom: 7 } },
    { id: 'static', name: 'Static lock', desc: 'Helt stilla — nollar all rörelse', p: {} },
  ];
  const EASINGS = [['linear', 'Linear'], ['in', 'Ease in'], ['out', 'Ease out'], ['inout', 'Ease in and out']];
  const emptyMotion = () => ({ preset: 'none', strength: 100, start: 0, end: 1, easing: 'inout', speed: 1, dirX: 0, dirY: 0, zoom: 0, tilt: 0, rot: 0, cropComp: 100 });
  const motionById = id => MOTION_PRESETS.find(m => m.id === id) || MOTION_PRESETS[0];

  /* ---------- övergångar ---------- */
  const TRANSITIONS = [
    { id: 'cut', name: 'Clean cut', desc: 'Rak klippning — standard', defDur: 0 },
    { id: 'dissolve', name: 'Cross dissolve', desc: 'Mjuk korsning', defDur: 0.4 },
    { id: 'black', name: 'Fade through black', desc: 'Genom svart', defDur: 0.7 },
    { id: 'white', name: 'Fade through white', desc: 'Genom vitt', defDur: 0.7 },
    { id: 'blur', name: 'Subtle blur', desc: 'Mjuk oskärpa i klippet', defDur: 0.5 },
    { id: 'dip', name: 'Light dip', desc: 'Kort ljusdipp', defDur: 0.5 },
    { id: 'match', name: 'Match movement', desc: 'Dissolve + matchad rörelse mellan klippen', defDur: 0.6 },
  ];
  const transById = id => TRANSITIONS.find(t => t.id === id) || TRANSITIONS[0];

  /* ---------- text ---------- */
  const TEXT_PRESETS = [
    { id: 'address', name: 'Intro — adress', fields: ['title', 'sub'], style: { align: 'left', pos: 'lower', size: 4.2, weight: 300, track: .08, bar: true } },
    { id: 'facts', name: 'Fakta — rum & boarea', fields: ['title', 'sub'], style: { align: 'left', pos: 'lower', size: 3.0, weight: 400, track: .04, bar: true } },
    { id: 'center', name: 'Centrerad titel', fields: ['title', 'sub'], style: { align: 'center', pos: 'center', size: 4.6, weight: 300, track: .12, bar: false } },
    { id: 'end', name: 'Slutkort', fields: ['title', 'sub'], style: { align: 'center', pos: 'center', size: 3.6, weight: 400, track: .1, bar: false, plate: true } },
    { id: 'agent', name: 'Mäklare', fields: ['title', 'sub'], style: { align: 'right', pos: 'lower', size: 2.6, weight: 400, track: .05, bar: false } },
  ];

  /* ---------- projekt ---------- */
  const RESOLUTIONS = [[1080, '1080p'], [1440, '1440p'], [2160, '4K']];
  const FPS_OPTS = [[24, '24 fps'], [25, '25 fps'], [30, '30 fps'], ['source', 'Match source']];
  const PQ_OPTS = [[0.35, 'Låg (snabb)'], [0.55, 'Medel'], [0.75, 'Hög'], [1, 'Full']];

  const emptyTransform = () => ({ rot: 0, scale: 100, x: 0, y: 0, crop: { l: 0, r: 0, t: 0, b: 0 }, opacity: 100 });

  function newClip(media, at = 0) {
    return {
      id: U.uid('clip'), mediaId: media.id, kind: 'video',
      start: at, in: 0, out: media.duration, speed: 1, reverse: false, freeze: false,
      transform: emptyTransform(),
      fade: { in: 0, out: 0 },
      volume: 100, muted: false,
      grade: emptyGrade(), filter: 'none', filterIntensity: 100,
      stabEnabled: false,
      motion: emptyMotion(),
      transitionIn: { type: 'cut', dur: 0 },
    };
  }
  function newAudioClip(media, at = 0) {
    return {
      id: U.uid('aclip'), mediaId: media.id, kind: 'music',
      start: at, in: 0, out: media.duration, volume: 80, muted: false, loop: false,
      fade: { in: 1.2, out: 2.0 }, duck: true,
    };
  }
  function newTextClip(preset, at = 0) {
    const p = TEXT_PRESETS.find(x => x.id === preset) || TEXT_PRESETS[0];
    return {
      id: U.uid('txt'), kind: 'text', preset: p.id, start: at, duration: 3.5,
      title: 'Storgatan 14', sub: 'Stockholm · 3 rok · 78 m²',
      color: '#f2f3f1', opacity: 100, fade: { in: .5, out: .5 }, size: p.style.size, align: p.style.align, pos: p.style.pos,
    };
  }

  function newProject(name = 'Ny bostadsfilm') {
    return {
      id: U.uid('proj'), name, version: 1,
      createdAt: Date.now(), updatedAt: Date.now(),
      settings: { aspect: '16:9', resolution: 1080, fps: 30, previewQuality: .55, fitMode: 'fit' },
      media: [],
      folders: ['Alla'],
      tracks: { video: [], music: [], text: [] },
      export: {
        preset: 'web169', container: 'auto', quality: 12, filename: 'bostadsfilm',
        audio: true, watermark: false, watermarkText: 'VIEWLY',
      },
      masterVolume: 100,
    };
  }

  /* ---------- härledda värden ---------- */
  const clipDuration = c => Math.max(0.04, (c.out - c.in) / Math.max(0.05, c.speed || 1));
  function relayout(list) { // videospåret packas sekventiellt — inga ologiska överlapp
    let t = 0;
    for (const c of list) { c.start = t; t += clipDuration(c); }
    return t;
  }
  const totalDuration = p => {
    let d = relayout(p.tracks.video);
    for (const a of p.tracks.music) d = Math.max(d, a.start + (a.out - a.in));
    for (const t of p.tracks.text) d = Math.max(d, t.start + t.duration);
    return d;
  };
  const mediaById = (p, id) => p.media.find(m => m.id === id);
  const clipAt = (p, t) => {
    const v = p.tracks.video;
    for (let i = 0; i < v.length; i++) { const d = clipDuration(v[i]); if (t >= v[i].start - 1e-6 && t < v[i].start + d - 1e-6) return v[i]; }
    return v.length && t >= (v[v.length - 1].start) ? v[v.length - 1] : null;
  };
  const allClips = p => [...p.tracks.video, ...p.tracks.music, ...p.tracks.text];
  const findClip = (p, id) => allClips(p).find(c => c.id === id);

  return {
    GRADE_DEFS, emptyGrade, FILTERS, filterById,
    STAB_DEFS, STAB_FLAGS, STAB_MODES, emptyStab, stabModeById,
    MOTION_PRESETS, EASINGS, emptyMotion, motionById,
    TRANSITIONS, transById, TEXT_PRESETS,
    RESOLUTIONS, FPS_OPTS, PQ_OPTS,
    emptyTransform, newClip, newAudioClip, newTextClip, newProject,
    clipDuration, relayout, totalDuration, mediaById, clipAt, allClips, findClip,
  };
})();
