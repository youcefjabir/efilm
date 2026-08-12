/* ============================================================
   00 — Utilities
   ============================================================ */
const U = (() => {
  const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const round = (v, d = 2) => { const m = Math.pow(10, d); return Math.round(v * m) / m; };

  function tc(sec, withFrames = true, fps = 30) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    if (!withFrames) return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const f = Math.floor((sec % 1) * fps);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(f).padStart(2, '0')}`;
  }
  const dur = s => (!isFinite(s) ? '–' : s < 60 ? s.toFixed(1) + 's' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`);
  const bytes = b => {
    if (b == null || !isFinite(b)) return '–';
    const u = ['B', 'KB', 'MB', 'GB'];
    let i = 0; while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
    return b.toFixed(b < 10 && i > 0 ? 1 : 0) + ' ' + u[i];
  };

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(k));
    return n;
  }
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clear = n => { while (n.firstChild) n.removeChild(n.firstChild); return n; };
  const clone = o => JSON.parse(JSON.stringify(o));

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  const raf = () => new Promise(r => requestAnimationFrame(r));
  const idle = () => new Promise(r => (window.requestIdleCallback || setTimeout)(r, 1));

  /* --- tiny emitter --- */
  class Emitter {
    constructor() { this.m = new Map(); }
    on(e, f) { (this.m.get(e) || this.m.set(e, []).get(e)).push(f); return () => this.off(e, f); }
    off(e, f) { const a = this.m.get(e); if (a) a.splice(a.indexOf(f) >>> 0, 1); }
    emit(e, ...d) { (this.m.get(e) || []).forEach(f => { try { f(...d); } catch (err) { console.error('[' + e + ']', err); } }); }
  }

  /* --- toasts --- */
  function toast(title, detail, kind) {
    const host = $('#toasts');
    const n = el('div', { class: 'toast' + (kind ? ' ' + kind : '') }, el('div', { text: title }), detail ? el('div', { class: 't2', text: detail }) : null);
    host.append(n);
    setTimeout(() => { n.style.transition = 'opacity .3s'; n.style.opacity = '0'; setTimeout(() => n.remove(), 320); }, kind === 'err' ? 8000 : 4200);
    return n;
  }
  const errToast = (ctx, e) => { console.error(ctx, e); toast(ctx, (e && (e.message || e.name)) || String(e), 'err'); };

  /* --- modal --- */
  function modal({ title, body, actions, wide }) {
    const wrap = $('#modalwrap'), m = $('#modal');
    clear(m);
    if (wide) m.style.minWidth = '620px'; else m.style.minWidth = '380px';
    m.append(el('header', {}, title));
    const b = el('div', { class: 'body' }); if (body) b.append(body); m.append(b);
    const close = () => { wrap.classList.remove('on'); clear(m); };
    const f = el('footer');
    (actions || [{ label: 'Stäng' }]).forEach(a => {
      f.append(el('button', {
        class: 'btn' + (a.primary ? ' primary' : '') + (a.danger ? ' danger' : ''),
        onclick: () => { const r = a.onclick && a.onclick(); if (r !== false) close(); }
      }, a.label));
    });
    m.append(f);
    wrap.classList.add('on');
    wrap.onclick = e => { if (e.target === wrap) close(); };
    return { close, body: b };
  }

  /* --- controls --- */
  function slider(name, value, min, max, step, onInput, opts = {}) {
    const fmt = opts.fmt || (v => (step >= 1 ? v.toFixed(0) : v.toFixed(2)));
    const def = opts.def != null ? opts.def : 0;
    const val = el('span', { class: 'val', text: fmt(value) });
    const inp = el('input', { type: 'range', min, max, step, value });
    const wrap = el('div', { class: 'sl' + (Math.abs(value - def) > 1e-6 ? ' mod' : '') },
      el('span', { class: 'name', text: name, title: name }), inp, val,
      el('button', { class: 'reset', title: 'Återställ', onclick: () => { inp.value = def; inp.dispatchEvent(new Event('input')); } }, '⨯'));
    inp.addEventListener('input', () => {
      const v = parseFloat(inp.value);
      val.textContent = fmt(v);
      wrap.classList.toggle('mod', Math.abs(v - def) > 1e-6);
      onInput(v);
    });
    wrap.setValue = v => { inp.value = v; val.textContent = fmt(v); wrap.classList.toggle('mod', Math.abs(v - def) > 1e-6); };
    if (opts.tip) { wrap.setAttribute('data-tip', opts.tip); wrap.classList.add('tipup'); }
    return wrap;
  }
  function check(label, value, onChange, tip) {
    const inp = el('input', { type: 'checkbox', onchange: () => onChange(inp.checked) });
    inp.checked = !!value;
    const r = el('label', { class: 'row', style: { cursor: 'pointer', padding: '3px 12px' } }, inp, el('span', { text: label, style: { fontSize: '11px' } }));
    if (tip) { r.setAttribute('data-tip', tip); r.classList.add('tipup'); }
    r.setValue = v => { inp.checked = !!v; };
    return r;
  }
  function select(options, value, onChange, tip) {
    const s = el('select', { onchange: () => onChange(s.value) });
    options.forEach(o => {
      const [v, l] = Array.isArray(o) ? o : [o, o];
      s.append(el('option', { value: v, selected: String(v) === String(value) }, l));
    });
    s.value = value;
    if (tip) s.setAttribute('data-tip', tip);
    return s;
  }
  function num(value, onChange, opts = {}) {
    const i = el('input', { type: 'number', value, step: opts.step || 0.1, min: opts.min, max: opts.max, style: { width: (opts.w || 66) + 'px' } });
    i.addEventListener('change', () => { let v = parseFloat(i.value); if (!isFinite(v)) v = 0; if (opts.min != null) v = Math.max(opts.min, v); if (opts.max != null) v = Math.min(opts.max, v); i.value = round(v, 3); onChange(v); });
    return i;
  }
  const section = t => el('h3', { class: 'sectitle', text: t });
  const row = (...k) => el('div', { class: 'row' }, ...k);
  const lrow = (label, ...k) => el('div', { class: 'row' }, el('label', { class: 'lbl', text: label }), ...k);

  /* --- pointer drag helper --- */
  function drag(startEvt, { onMove, onEnd, cursor }) {
    startEvt.preventDefault();
    const x0 = startEvt.clientX, y0 = startEvt.clientY;
    const prevCursor = document.body.style.cursor;
    if (cursor) document.body.style.cursor = cursor;
    let moved = false;
    const mv = e => { moved = moved || Math.abs(e.clientX - x0) > 2 || Math.abs(e.clientY - y0) > 2; onMove && onMove(e.clientX - x0, e.clientY - y0, e, moved); };
    const up = e => {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
      document.body.style.cursor = prevCursor; onEnd && onEnd(moved, e);
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  }

  const ASPECTS = { '16:9': 16 / 9, '9:16': 9 / 16, '4:5': 4 / 5, '1:1': 1 };
  function frameSize(aspect, height) {
    const r = ASPECTS[aspect] || 16 / 9;
    let h = height, w = Math.round(h * r);
    if (w % 2) w++; if (h % 2) h++;
    return { w, h };
  }

  return {
    uid, clamp, lerp, round, tc, dur, bytes, el, $, $$, clear, clone, debounce, raf, idle,
    Emitter, toast, errToast, modal, slider, check, select, num, section, row, lrow, drag, ASPECTS, frameSize
  };
})();
