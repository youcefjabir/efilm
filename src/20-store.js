/* ============================================================
   20 — Project state, selection, undo/redo
   ============================================================ */
const S = (() => {
  const bus = new U.Emitter();
  const HEAVY = ['url', 'thumb', 'strip', 'wave', 'file'];   // hålls utanför historiken
  const RUNTIME = ['url', 'file'];                           // går inte att serialisera alls

  const st = {
    project: M.newProject(),
    sel: { clips: [], media: [] },
    playhead: 0,
    playing: false,
    dirty: false,
    past: [], future: [],
    _last: null, _lastLabel: '', _lastTime: 0,
  };

  /** Lätt ögonblicksbild för ångra/gör om — thumbnails och waveforms utelämnas. */
  function snapshot(p = st.project) {
    const media = p.media.map(m => { const o = {}; for (const k in m) if (!HEAVY.includes(k)) o[k] = m[k]; return o; });
    return JSON.stringify({ ...p, media });
  }
  /** Fullständig serialisering för lagring och projektfil — behåller thumbnails,
   *  filmstrip och waveform så att biblioteket ser likadant ut efter omladdning. */
  function serialize(p = st.project) {
    const media = p.media.map(m => { const o = {}; for (const k in m) if (!RUNTIME.includes(k)) o[k] = m[k]; return o; });
    return JSON.parse(JSON.stringify({ ...p, media }));
  }
  function restore(json) {
    const data = JSON.parse(json);
    const byId = new Map(st.project.media.map(m => [m.id, m]));
    data.media = data.media.map(m => {
      const live = byId.get(m.id);
      if (live) HEAVY.forEach(k => { if (live[k] !== undefined) m[k] = live[k]; });
      return m;
    });
    st.project = data;
    fixSelection();
    bus.emit('project', st.project);
    bus.emit('change');
  }
  function fixSelection() {
    const ids = new Set(M.allClips(st.project).map(c => c.id));
    st.sel.clips = st.sel.clips.filter(id => ids.has(id));
    const mids = new Set(st.project.media.map(m => m.id));
    st.sel.media = st.sel.media.filter(id => mids.has(id));
  }

  /** Muterar projektet och lägger en post i historiken.
   *  coalesce: slår ihop snabba upprepade ändringar med samma label (t.ex. sliderdrag). */
  function update(fn, label = 'edit', coalesce = false) {
    if (st._last == null) st._last = snapshot();
    const before = st._last;
    fn(st.project);
    st.project.updatedAt = Date.now();
    const now = performance.now();
    const merge = coalesce && label === st._lastLabel && (now - st._lastTime) < 800;
    if (!merge) { st.past.push(before); if (st.past.length > 60) st.past.shift(); st.future.length = 0; }
    st._last = snapshot();
    st._lastLabel = label; st._lastTime = now;
    st.dirty = true;
    bus.emit('change', label);
    return st.project;
  }
  /** Ändring utan historik (t.ex. uppspelningsläge, media-status). */
  function touch(fn, label = 'touch') {
    if (fn) fn(st.project);
    st._last = snapshot();
    st.dirty = true;
    bus.emit('change', label);
  }
  function undo() {
    if (!st.past.length) return false;
    st.future.push(snapshot());
    restore(st.past.pop());
    st._last = snapshot(); st._lastLabel = ''; st.dirty = true;
    return true;
  }
  function redo() {
    if (!st.future.length) return false;
    st.past.push(snapshot());
    restore(st.future.pop());
    st._last = snapshot(); st._lastLabel = ''; st.dirty = true;
    return true;
  }
  function setProject(p, { resetHistory = true } = {}) {
    st.project = p;
    if (resetHistory) { st.past.length = 0; st.future.length = 0; }
    st._last = snapshot(); st._lastLabel = '';
    st.sel = { clips: [], media: [] };
    st.playhead = 0;
    bus.emit('project', p);
    bus.emit('change', 'load');
  }

  /* ---------- selection ---------- */
  function selectClips(ids, additive = false) {
    ids = [].concat(ids).filter(Boolean);
    st.sel.clips = additive ? [...new Set([...st.sel.clips, ...ids])] : ids;
    bus.emit('selection', st.sel);
  }
  function toggleClip(id) {
    const i = st.sel.clips.indexOf(id);
    if (i >= 0) st.sel.clips.splice(i, 1); else st.sel.clips.push(id);
    bus.emit('selection', st.sel);
  }
  function selectMedia(ids, additive = false) {
    ids = [].concat(ids).filter(Boolean);
    st.sel.media = additive ? [...new Set([...st.sel.media, ...ids])] : ids;
    bus.emit('selection', st.sel);
  }
  const selectedClips = () => st.sel.clips.map(id => M.findClip(st.project, id)).filter(Boolean);
  const primaryClip = () => selectedClips().find(c => c.kind === 'video') || selectedClips()[0] || null;
  const selectedMedia = () => st.sel.media.map(id => M.mediaById(st.project, id)).filter(Boolean);
  const primaryMedia = () => {
    const m = selectedMedia()[0];
    if (m) return m;
    const c = primaryClip();
    return c && c.mediaId ? M.mediaById(st.project, c.mediaId) : null;
  };

  function seek(t, emit = true) {
    st.playhead = Math.max(0, t);
    if (emit) bus.emit('seek', st.playhead);
  }

  return {
    bus, st,
    get project() { return st.project; },
    get sel() { return st.sel; },
    update, touch, undo, redo, setProject, snapshot, serialize,
    selectClips, toggleClip, selectMedia, selectedClips, selectedMedia, primaryClip, primaryMedia, seek,
    canUndo: () => st.past.length > 0, canRedo: () => st.future.length > 0,
  };
})();
