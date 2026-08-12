/* ============================================================
   30 — Lokal persistens: IndexedDB (filer + projekt), autosave
   ============================================================ */
const DB = (() => {
  const NAME = 'bostadsfilm-editor', VER = 1;
  let db = null, available = null, lastError = '';

  function open() {
    if (db) return Promise.resolve(db);
    return new Promise((res, rej) => {
      let req;
      try { req = indexedDB.open(NAME, VER); }
      catch (e) { available = false; lastError = e.message; return rej(e); }
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains('files')) d.createObjectStore('files', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('projects')) d.createObjectStore('projects', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'k' });
      };
      req.onsuccess = () => { db = req.result; available = true; res(db); };
      req.onerror = () => { available = false; lastError = (req.error && req.error.message) || 'IndexedDB blockerad'; rej(req.error); };
      req.onblocked = () => { lastError = 'IndexedDB blockerad av annan flik'; };
    });
  }
  async function tx(store, mode, fn) {
    const d = await open();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode);
      const s = t.objectStore(store);
      let out;
      try { out = fn(s); } catch (e) { return rej(e); }
      t.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error || new Error('Transaktion avbruten'));
    });
  }
  const putFile = (id, blob, name, type) => tx('files', 'readwrite', s => s.put({ id, blob, name, type }));
  const getFile = id => tx('files', 'readonly', s => s.get(id));
  const delFile = id => tx('files', 'readwrite', s => s.delete(id));
  const putProject = p => tx('projects', 'readwrite', s => s.put(S.serialize(p)));
  const getProject = id => tx('projects', 'readonly', s => s.get(id));
  const allProjects = () => tx('projects', 'readonly', s => s.getAll());
  const delProject = id => tx('projects', 'readwrite', s => s.delete(id));
  const setMeta = (k, v) => tx('meta', 'readwrite', s => s.put({ k, v }));
  const getMeta = async k => { const r = await tx('meta', 'readonly', s => s.get(k)); return r && r.v; };

  async function estimate() {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const e = await navigator.storage.estimate();
        return { usage: e.usage || 0, quota: e.quota || 0 };
      }
    } catch (e) { /* ignore */ }
    return null;
  }
  return { open, putFile, getFile, delFile, putProject, getProject, allProjects, delProject, setMeta, getMeta, estimate, get available() { return available; }, get error() { return lastError; } };
})();

const Autosave = (() => {
  let enabled = true, timer = null, statusEl = null, saving = false;
  const setStatus = (txt, cls) => {
    if (!statusEl) statusEl = U.$('#autosave');
    if (!statusEl) return;
    statusEl.textContent = txt;
    statusEl.className = 'tag' + (cls ? ' ' + cls : '');
  };
  async function saveNow(silent) {
    if (saving) return;
    saving = true;
    try {
      setStatus('Sparar…');
      await DB.putProject(S.project);
      await DB.setMeta('lastProject', S.project.id);
      S.st.dirty = false;
      setStatus('Sparad ' + U.tc((Date.now() % 86400000) / 1000, false), 'ok');
      if (!silent) U.toast('Projektet sparat', S.project.name);
    } catch (e) {
      setStatus('Autosave av', 'danger');
      if (!silent) U.errToast('Kunde inte spara projektet', e);
      else console.warn('autosave', e);
    } finally { saving = false; refreshStorage(); }
  }
  const schedule = U.debounce(() => { if (enabled) saveNow(true); }, 1600);
  function init() {
    S.bus.on('change', () => { setStatus('Osparade ändringar', 'warn'); schedule(); });
    window.addEventListener('beforeunload', e => {
      if (S.st.dirty) { e.preventDefault(); e.returnValue = 'Du har osparade ändringar.'; return e.returnValue; }
    });
    refreshStorage();
    setInterval(refreshStorage, 20000);
  }
  async function refreshStorage() {
    const e = U.$('#storagestat'); if (!e) return;
    const est = await DB.estimate();
    if (DB.available === false) { e.textContent = 'Lagring: ej tillgänglig'; e.className = 'tag danger'; e.setAttribute('data-tip', DB.error || 'IndexedDB blockerat i denna miljö — projektet lever bara i minnet'); return; }
    if (!est) { e.textContent = 'Lagring: lokal'; e.className = 'tag'; return; }
    const pct = est.quota ? (est.usage / est.quota * 100) : 0;
    e.textContent = `Lagring ${U.bytes(est.usage)}`;
    e.className = 'tag' + (pct > 85 ? ' danger' : pct > 60 ? ' warn' : '');
    e.setAttribute('data-tip', `Använt ${U.bytes(est.usage)} av ${U.bytes(est.quota)} (${pct.toFixed(1)} %)\nIndexedDB i denna webbläsare`);
  }
  function markClean(txt) { S.st.dirty = false; setStatus(txt || 'Sparad', 'ok'); }
  return { init, saveNow, refreshStorage, markClean, set enabled(v) { enabled = v; }, get enabled() { return enabled; } };
})();
