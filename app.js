/* ============================================================
   Mis notas — espacio de notas estilo Notion (100% gratis)
   HTML + CSS + JS puro, sin dependencias.
   Los datos se guardan en localStorage del navegador.
   ============================================================ */
'use strict';

/* ---------- utilidades ---------- */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const BLOCK_TYPES = ['p', 'h1', 'h2', 'h3', 'bullet', 'numbered', 'todo', 'quote', 'callout', 'code', 'image', 'divider'];
const LIST_TYPES = ['bullet', 'numbered', 'todo'];
const isList = (t) => LIST_TYPES.includes(t);

const SLASH_ITEMS = [
  { type: 'p', label: 'Texto', desc: 'Párrafo simple', icon: 'Aa', kw: 'texto parrafo simple plain' },
  { type: 'h1', label: 'Título 1', desc: 'Encabezado grande', icon: 'H1', kw: 'h1 titulo heading encabezado grande' },
  { type: 'h2', label: 'Título 2', desc: 'Encabezado medio', icon: 'H2', kw: 'h2 titulo heading encabezado medio' },
  { type: 'h3', label: 'Título 3', desc: 'Encabezado pequeño', icon: 'H3', kw: 'h3 titulo heading encabezado subtitulo' },
  { type: 'bullet', label: 'Lista', desc: 'Lista con viñetas', icon: '•', kw: 'lista vineta bullet puntos' },
  { type: 'numbered', label: 'Lista numerada', desc: 'Lista con números', icon: '1.', kw: 'lista numerada numero ordered' },
  { type: 'todo', label: 'Tarea', desc: 'Casilla de verificación', icon: '☑', kw: 'tarea checkbox todo pendiente hacer lista' },
  { type: 'quote', label: 'Cita', desc: 'Bloque de cita', icon: '❝', kw: 'cita quote' },
  { type: 'callout', label: 'Destacado', desc: 'Caja para resaltar algo', icon: '💡', kw: 'callout destacado caja nota aviso' },
  { type: 'code', label: 'Código', desc: 'Bloque monoespaciado', icon: '</>', kw: 'codigo code monospace programacion' },
  { type: 'image', label: 'Imagen', desc: 'Imagen por URL', icon: '🖼', kw: 'imagen foto image url picture' },
  { type: 'divider', label: 'Divisor', desc: 'Línea separadora', icon: '—', kw: 'divisor linea separador hr' }
];

const EMOJIS = ['📝','📓','📔','📕','📗','📘','📙','📚','📋','📌','📍','🗂️','🗃️','📁','📂','🗓️','✅','☑️','📅','📊','📈','🔖','🏷️','✂️','📎','🔗','💡','⚡','🔥','✨','🌱','🌸','🌊','🌙','☀️','🌍','⭐','🚀','🎯','🎨','🎵','🎮','☕','🍎','🍕','🧠','💼','🏠','❤️','🎉','🐢','🦄'];

/* ---------- estado ---------- */

const STORAGE_KEY = 'arsweb.notes.v1';
let state = null;
let ui = { search: '', slash: null };
let saveTimer = null;
let toastTimer = null;
let forceScrollTop = false;
let storageWarned = false;

const page = () => state.pages.find((p) => p.id === state.activeId) || state.pages[0] || null;

function newBlock(type = 'p', level = 0) {
  return { id: uid(), type, text: '', level: level || 0, checked: false, src: '' };
}

function seedState() {
  const now = Date.now();
  const welcome = {
    id: uid(), title: 'Tu espacio de notas', icon: '✨',
    createdAt: now, updatedAt: now,
    blocks: [
      { id: uid(), type: 'p', text: 'Bienvenido/a. Este es tu espacio de notas estilo Notion: gratis, sin cuentas y funciona igual de bien en el móvil que en el ordenador.', level: 0, checked: false, src: '' },
      { id: uid(), type: 'divider', text: '', level: 0, checked: false, src: '' },
      { id: uid(), type: 'h2', text: 'Empieza aquí', level: 0, checked: false, src: '' },
      { id: uid(), type: 'todo', text: 'Escribe / en una línea para ver todos los bloques disponibles', level: 0, checked: false, src: '' },
      { id: uid(), type: 'todo', text: 'Toca el icono de arriba para ponerle un emoji a esta página', level: 0, checked: false, src: '' },
      { id: uid(), type: 'todo', text: 'Pulsa ☰ para ver tus páginas y crear nuevas', level: 0, checked: false, src: '' },
      { id: uid(), type: 'h2', text: 'Buen a saber', level: 0, checked: false, src: '' },
      { id: uid(), type: 'callout', text: 'Tus notas se guardan solas en este navegador: sin servidores, sin registros y sin coste. Para pasarlas a otro dispositivo usa el menú ⋯ → Exportar / Importar.', level: 0, checked: false, src: '' },
      { id: uid(), type: 'p', text: 'Atajos rápidos: Enter crea un bloque nuevo · Backspace al inicio une bloques · Tab indenta listas.', level: 0, checked: false, src: '' },
      { id: uid(), type: 'h2', text: 'Escribe algo…', level: 0, checked: false, src: '' },
      { id: uid(), type: 'p', text: '', level: 0, checked: false, src: '' }
    ]
  };
  const guide = {
    id: uid(), title: 'Atajos y trucos', icon: '⚡',
    createdAt: now, updatedAt: now,
    blocks: [
      { id: uid(), type: 'p', text: 'Todo lo que puedes hacer con el teclado:', level: 0, checked: false, src: '' },
      { id: uid(), type: 'bullet', text: 'Enter — bloque nuevo', level: 0, checked: false, src: '' },
      { id: uid(), type: 'bullet', text: 'Shift + Enter — salto de línea dentro del bloque', level: 0, checked: false, src: '' },
      { id: uid(), type: 'bullet', text: 'Backspace al inicio — une con el bloque anterior', level: 0, checked: false, src: '' },
      { id: uid(), type: 'bullet', text: 'Tab / Shift + Tab — indentar o desindentar listas', level: 0, checked: false, src: '' },
      { id: uid(), type: 'bullet', text: 'Ctrl o ⌘ + K — buscar', level: 0, checked: false, src: '' },
      { id: uid(), type: 'bullet', text: 'Escribir / — abre el menú de bloques', level: 0, checked: false, src: '' },
      { id: uid(), type: 'quote', text: 'Consejo: en el móvil, cada bloque tiene un botón ⋮⋮ a la izquierda para moverlo, duplicarlo o convertirlo.', level: 0, checked: false, src: '' }
    ]
  };
  return {
    theme: (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
    pages: [welcome, guide],
    activeId: welcome.id,
    sidebarCollapsed: false
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.pages)) return null;
    s.pages.forEach((p) => {
      if (!Array.isArray(p.blocks)) p.blocks = [];
      p.blocks.forEach((b) => {
        if (!BLOCK_TYPES.includes(b.type)) b.type = 'p';
        b.text = typeof b.text === 'string' ? b.text : '';
        b.level = Number.isInteger(b.level) ? Math.min(4, Math.max(0, b.level)) : 0;
        b.checked = !!b.checked;
        b.src = typeof b.src === 'string' ? b.src : '';
      });
    });
    if (!s.activeId || !s.pages.some((p) => p.id === s.activeId)) s.activeId = s.pages[0] ? s.pages[0].id : null;
    return s;
  } catch (e) { return null; }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    if (!storageWarned) { storageWarned = true; showToast('No se puede guardar en este navegador (¿modo privado?)'); }
  }
  setSaveState('saved');
}

function scheduleSave() {
  setSaveState('saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 500);
}

function setSaveState(s) {
  const el = $('#save-state');
  if (!el) return;
  el.dataset.state = s;
  el.textContent = s === 'saving' ? 'Guardando…' : 'Guardado ✓';
}

function touchBlock(b) {
  const p = page();
  if (p) p.updatedAt = Date.now();
  scheduleSave();
}

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- lectura / escritura de bloques contenteditable ---------- */

function readCE(ce) {
  let s = '';
  for (const n of ce.childNodes) {
    if (n.nodeType === 3) s += n.data;
    else if (n.nodeName === 'BR') s += '\n';
  }
  return s;
}

function writeCE(ce, text) {
  ce.textContent = '';
  const parts = text.split('\n');
  parts.forEach((part, i) => {
    if (i > 0) ce.appendChild(document.createElement('br'));
    if (part) ce.appendChild(document.createTextNode(part));
  });
  ce.classList.toggle('is-empty', text === '');
}

function offsetIn(ce, container, offset) {
  try {
    const r = document.createRange();
    r.selectNodeContents(ce);
    r.setEnd(container, offset);
    let chars = r.toString().length;
    let brs = 0;
    const it = r[Symbol.iterator]();
    for (let n = it.next(); !n.done; n = it.next()) if (n.value.nodeName === 'BR') brs++;
    return chars + brs;
  } catch (e) { return null; }
}

function setCaret(ce, offset) {
  const sel = window.getSelection();
  const range = document.createRange();
  let pos = 0;
  let done = false;
  for (const node of ce.childNodes) {
    if (done) break;
    if (node.nodeType === 3) {
      if (offset <= pos + node.data.length) { range.setStart(node, offset - pos); done = true; }
      pos += node.data.length;
    } else if (node.nodeName === 'BR') {
      if (offset === pos) { range.setStartAfter(node); done = true; }
      else {
        pos += 1;
        if (offset === pos) { range.setStartAfter(node); done = true; }
      }
    }
  }
  if (!done) { range.selectNodeContents(ce); }
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

function focusBlock(id, offset) {
  requestAnimationFrame(() => {
    const el = document.querySelector(`.block[data-id="${id}"] .ce`);
    const p = page();
    const b = p && p.blocks.find((x) => x.id === id);
    if (!el || !b) return;
    el.focus();
    setCaret(el, offset === undefined ? b.text.length : offset);
    el.scrollIntoView({ block: 'center' });
  });
}

function focusTitle() {
  requestAnimationFrame(() => {
    const t = $('#page-title-input');
    if (t) t.focus();
  });
}

function focusFirstBlock() {
  const p = page();
  if (!p) return;
  const b = p.blocks[0];
  if (!b) return;
  if (b.type === 'image') {
    const inp = document.querySelector(`.block[data-id="${b.id}"] .img-url`);
    if (inp) { inp.focus(); return; }
  }
  focusBlock(b.id, 0);
}

/* ---------- construcción del DOM ---------- */

function placeholderFor(type) {
  switch (type) {
    case 'h1': return 'Título 1';
    case 'h2': return 'Título 2';
    case 'h3': return 'Título 3';
    case 'bullet': case 'numbered': return 'Texto de la lista';
    case 'todo': return 'Tarea';
    case 'quote': return 'Cita';
    case 'callout': return 'Nota destacada';
    case 'code': return '// código';
    default: return 'Escribe algo, o escribe / para comandos…';
  }
}

function ceEl(b) {
  const ce = document.createElement('div');
  ce.className = 'ce type-' + b.type;
  ce.contentEditable = 'true';
  ce.spellcheck = b.type === 'code';
  ce.setAttribute('autocorrect', b.type === 'code' ? 'off' : 'on');
  ce.setAttribute('autocapitalize', b.type === 'code' ? 'none' : 'sentences');
  ce.dataset.placeholder = placeholderFor(b.type);
  writeCE(ce, b.text);
  if (!b.text) ce.classList.add('is-empty');
  return ce;
}

function blockEl(b, num) {
  const wrap = document.createElement('div');
  wrap.className = 'block type-' + b.type + (b.checked ? ' done' : '');
  wrap.dataset.id = b.id;
  wrap.style.paddingLeft = (b.level * 26) + 'px';

  const handle = document.createElement('button');
  handle.className = 'block-handle';
  handle.type = 'button';
  handle.textContent = '⋮⋮';
  handle.setAttribute('aria-label', 'Opciones del bloque');
  wrap.appendChild(handle);

  let inner = document.createElement('div');
  inner.className = 'block-inner';

  switch (b.type) {
    case 'divider':
      inner.innerHTML = '<hr>';
      break;

    case 'todo': {
      inner.className = 'block-inner row';
      const lab = document.createElement('label');
      lab.className = 'todo';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = b.checked;
      lab.appendChild(cb);
      inner.appendChild(lab);
      inner.appendChild(ceEl(b));
      cb.addEventListener('change', () => {
        b.checked = cb.checked;
        wrap.classList.toggle('done', b.checked);
        touchBlock(b);
      });
      break;
    }

    case 'image': {
      if (b.src) {
        const img = document.createElement('img');
        img.className = 'block-img';
        img.src = b.src;
        img.alt = '';
        img.title = 'Pulsa para cambiar la URL';
        img.addEventListener('error', () => { b.src = ''; renderEditor(); });
        img.addEventListener('click', () => {
          b.src = '';
          renderEditor();
          const inp = document.querySelector(`.block[data-id="${b.id}"] .img-url`);
          if (inp) inp.focus();
        });
        inner.appendChild(img);
      } else {
        const inp = document.createElement('input');
        inp.className = 'img-url';
        inp.type = 'text';
        inp.placeholder = 'Pega una URL de imagen y pulsa Enter…';
        inp.value = b.src || '';
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            b.src = inp.value.trim();
            if (b.src) { b.text = ''; }
            renderEditor();
            touchBlock(b);
          }
        });
        inner.appendChild(inp);
        const hint = document.createElement('div');
        hint.className = 'img-hint';
        hint.textContent = 'También puedes arrastrar texto: pegue cualquier enlace directo a una imagen (jpg, png, gif…).';
        inner.appendChild(hint);
      }
      break;
    }

    default: {
      if (b.type === 'code') inner.className = 'block-inner code-host';
      const ce = ceEl(b);
      if (b.type === 'bullet') {
        inner.className = 'block-inner row';
        const d = document.createElement('span');
        d.className = 'dot';
        d.textContent = '•';
        d.setAttribute('aria-hidden', 'true');
        inner.appendChild(d);
        inner.appendChild(ce);
      } else if (b.type === 'numbered') {
        inner.className = 'block-inner row';
        const n = document.createElement('span');
        n.className = 'num';
        n.textContent = num + '.';
        n.setAttribute('aria-hidden', 'true');
        inner.appendChild(n);
        inner.appendChild(ce);
      } else if (b.type === 'callout') {
        inner.className = 'block-inner row';
        const ic = document.createElement('span');
        ic.className = 'callout-ic';
        ic.textContent = '💡';
        ic.setAttribute('aria-hidden', 'true');
        inner.appendChild(ic);
        inner.appendChild(ce);
      } else {
        inner.appendChild(ce);
      }
      break;
    }
  }
  wrap.appendChild(inner);
  return wrap;
}

function fmtWhen(ts) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return 'a las ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  const opts = { day: 'numeric', month: 'short' };
  if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric';
  return d.toLocaleDateString('es-ES', opts);
}

function renderEditor() {
  const editor = $('#editor');
  const scroller = editor;
  const prevScroll = forceScrollTop ? 0 : scroller.scrollTop;
  const p = page();

  if (!p) {
    editor.innerHTML =
      '<div class="page-wrap empty-wrap"><div class="empty-state">' +
      '<div class="empty-ic">🗒</div><h2>No hay páginas</h2>' +
      '<p>Crea tu primera página para empezar a escribir.</p>' +
      '<button class="btn" id="btn-new-empty" type="button">＋ Nueva página</button>' +
      '</div></div>';
    const btn = $('#btn-new-empty');
    if (btn) btn.addEventListener('click', newPage);
    forceScrollTop = false;
    return;
  }

  editor.innerHTML =
    '<div class="page-wrap">' +
      '<div class="page-head">' +
        '<button class="page-icon-btn ' + (p.icon ? '' : 'empty') + '" id="btn-icon" type="button" aria-label="Cambiar icono de la página">' + (p.icon || '📄') + '</button>' +
        '<div class="ce-title" id="page-title-input" contenteditable="true" spellcheck="true" data-placeholder="Sin título"></div>' +
        '<div class="page-meta">' + p.blocks.length + ' ' + (p.blocks.length === 1 ? 'bloque' : 'bloques') + ' · editado ' + fmtWhen(p.updatedAt) + '</div>' +
      '</div>' +
      '<div class="blocks" id="blocks"></div>' +
    '</div>';

  const title = $('#page-title-input');
  title.innerText = p.title;

  const c = $('#blocks');
  let num = 0;
  for (const b of p.blocks) {
    if (b.type === 'numbered') num++;
    else num = 0;
    c.appendChild(blockEl(b, num));
  }
  scroller.scrollTop = prevScroll;
  forceScrollTop = false;
}

function highlight(text, q) {
  if (!q) return text;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(esc(q.replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]))), 'gi');
  return text.replace(re, (m) => '<mark>' + m + '</mark>');
}

function renderSidebar() {
  const list = $('#page-list');
  const q = ui.search.trim().toLowerCase();

  if (q) {
    const results = [];
    for (const p of state.pages) {
      const inTitle = (p.title || '').toLowerCase().includes(q);
      let snippet = '';
      for (const b of p.blocks) {
        const i = (b.text || '').toLowerCase().indexOf(q);
        if (i >= 0) { snippet = b.text; break; }
      }
      if (inTitle || snippet) results.push({ p, snippet });
    }
    list.innerHTML = results.length
      ? results.map((r) =>
          '<button class="page-item ' + (r.p.id === state.activeId ? 'active' : '') + '" data-goto="' + r.p.id + '" type="button">' +
            '<span class="page-icon">' + (r.p.icon || '📄') + '</span>' +
            '<span class="page-titles">' +
              '<span class="page-title">' + highlight(escapeHtml(r.p.title || 'Sin título'), q) + '</span>' +
              (r.snippet ? '<small class="snippet">' + highlight(escapeHtml(r.snippet.slice(0, 90)), q) + '</small>' : '') +
            '</span>' +
          '</button>').join('')
      : '<div class="empty-hint">Sin resultados para «' + escapeHtml(ui.search) + '»</div>';
    return;
  }

  list.innerHTML = state.pages.length
    ? state.pages.map((p) =>
        '<div class="page-row">' +
          '<button class="page-item ' + (p.id === state.activeId ? 'active' : '') + '" data-goto="' + p.id + '" type="button">' +
            '<span class="page-icon">' + (p.icon || '📄') + '</span>' +
            '<span class="page-titles"><span class="page-title">' + escapeHtml(p.title || 'Sin título') + '</span></span>' +
          '</button>' +
          '<button class="page-opts" data-pagemenu="' + p.id + '" type="button" aria-label="Opciones de la página">⋯</button>' +
        '</div>').join('')
    : '<div class="empty-hint">No hay páginas todavía.<br>Crea una con «＋ Nueva página».</div>';
}

function renderTopbar() {
  const p = page();
  $('#topbar-title').textContent = p ? (p.icon ? p.icon + ' ' : '') + (p.title || 'Sin título') : 'Mis notas';
  $('#btn-theme').textContent = state.theme === 'dark' ? '☀️' : '🌙';
  const meta = $('#meta-theme');
  if (meta) meta.content = state.theme === 'dark' ? '#191919' : '#ffffff';
  document.title = (p && p.title ? p.title : 'Sin título') + ' · Mis notas';
}

function render() {
  document.documentElement.dataset.theme = state.theme;
  renderTopbar();
  renderSidebar();
  renderEditor();
}

/* ---------- operaciones sobre bloques ---------- */

function onEnter(b, caret) {
  const p = page();
  const idx = p.blocks.indexOf(b);
  const text = b.text;
  const before = text.slice(0, caret);
  const after = text.slice(caret);

  if (isList(b.type) && text.trim() === '') {
    b.type = 'p';
    b.level = 0;
    b.text = '';
    touchBlock(b);
    renderEditor();
    focusBlock(b.id, 0);
    return;
  }
  b.text = before;
  const nb = newBlock(isList(b.type) ? b.type : 'p', b.level);
  nb.text = after;
  p.blocks.splice(idx + 1, 0, nb);
  touchBlock(b);
  touchBlock(nb);
  renderEditor();
  focusBlock(nb.id, 0);
}

function onBackspace(b) {
  const p = page();
  const idx = p.blocks.indexOf(b);
  if (idx === 0) return;
  const prev = p.blocks[idx - 1];

  if (prev.type === 'divider' || prev.type === 'image') {
    p.blocks.splice(idx - 1, 1);
    touchBlock(b);
    renderEditor();
    focusBlock(b.id, 0);
    return;
  }

  if (b.text === '' && b.type !== 'p') {
    if (isList(prev.type) && prev.type === b.type) {
      p.blocks.splice(idx, 1);
      touchBlock(prev);
      renderEditor();
      focusBlock(prev.id, prev.text.length);
    } else {
      b.type = 'p';
      b.level = 0;
      touchBlock(b);
      renderEditor();
      focusBlock(b.id, 0);
    }
    return;
  }

  const pos = prev.text.length;
  prev.text = prev.text + b.text;
  p.blocks.splice(idx, 1);
  touchBlock(prev);
  renderEditor();
  focusBlock(prev.id, pos);
}

function moveBlock(b, d) {
  const p = page();
  const i = p.blocks.indexOf(b);
  const j = i + d;
  if (j < 0 || j >= p.blocks.length) return;
  [p.blocks[i], p.blocks[j]] = [p.blocks[j], p.blocks[i]];
  touchBlock(b);
  renderEditor();
  focusBlock(b.id, 0);
}

function dupBlock(b) {
  const p = page();
  const i = p.blocks.indexOf(b);
  const copy = Object.assign({}, b, { id: uid(), text: b.text });
  p.blocks.splice(i + 1, 0, copy);
  touchBlock(copy);
  renderEditor();
  focusBlock(copy.id, 0);
}

function delBlock(b) {
  const p = page();
  const i = p.blocks.indexOf(b);
  p.blocks.splice(i, 1);
  if (p.blocks.length === 0) p.blocks.push(newBlock('p'));
  touchBlock(b);
  renderEditor();
  const next = p.blocks[Math.min(i, p.blocks.length - 1)];
  focusBlock(next.id, 0);
}

function applyBlockType(b, it, keepText) {
  const p = page();
  const idx = p.blocks.indexOf(b);
  if (it.type === 'divider') {
    b.type = 'divider';
    b.text = '';
    b.level = 0;
    const nb = newBlock('p');
    p.blocks.splice(idx + 1, 0, nb);
    touchBlock(b);
    renderEditor();
    focusBlock(nb.id, 0);
    return;
  }
  b.type = it.type;
  if (!isList(it.type) && it.type !== 'code') b.level = 0;
  b.text = keepText ? (b.text || '') : '';
  if (it.type === 'image') b.src = '';
  touchBlock(b);
  renderEditor();
  if (it.type === 'image') {
    const inp = document.querySelector(`.block[data-id="${b.id}"] .img-url`);
    if (inp) inp.focus();
  } else {
    focusBlock(b.id, 0);
  }
}

/* ---------- menú slash ---------- */

function filterSlash(q) {
  q = q.toLowerCase().trim();
  if (q.includes(' ')) return [];
  return SLASH_ITEMS.filter((it) => !q || it.label.toLowerCase().includes(q) || it.kw.includes(q));
}

function openSlash(b) {
  const items = filterSlash(b.text.slice(1));
  if (!items.length) { closeSlash(); return; }
  ui.slash = { blockId: b.id, items, index: 0 };
  renderSlashMenu();
}

function closeSlash() {
  ui.slash = null;
  const m = $('#slash-menu');
  if (m) m.remove();
}

function renderSlashMenu() {
  if (!ui.slash) return;
  let m = $('#slash-menu');
  if (!m) {
    m = document.createElement('div');
    m.className = 'menu';
    m.id = 'slash-menu';
    document.body.appendChild(m);
  }
  m.style.minWidth = '280px';
  m.innerHTML = ui.slash.items.map((it, i) =>
    '<button class="slash-item ' + (i === ui.slash.index ? 'sel' : '') + '" data-i="' + i + '" type="button">' +
      '<span class="slash-ic">' + it.icon + '</span>' +
      '<span class="slash-tx"><b>' + it.label + '</b><small>' + it.desc + '</small></span>' +
    '</button>').join('');
  positionSlashMenu();
  const sel = m.querySelector('.sel');
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}

function positionSlashMenu() {
  const m = $('#slash-menu');
  if (!m || !ui.slash) return;
  const el = document.querySelector(`.block[data-id="${ui.slash.blockId}"] .ce`);
  if (!el) { closeSlash(); return; }
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) { closeSlash(); return; }
  m.style.left = Math.min(Math.max(8, r.left), window.innerWidth - Math.min(m.offsetWidth, window.innerWidth - 16) - 8) + 'px';
  const spaceBelow = window.innerHeight - r.bottom;
  if (spaceBelow > Math.min(m.offsetHeight, 300) + 12) {
    m.style.top = (r.bottom + 6) + 'px';
  } else {
    m.style.top = Math.max(8, r.top - m.offsetHeight - 6) + 'px';
  }
}

function moveSlash(d) {
  if (!ui.slash) return;
  const n = ui.slash.items.length;
  ui.slash.index = (ui.slash.index + d + n) % n;
  renderSlashMenu();
}

function selectSlashItem(i) {
  if (!ui.slash) return;
  const it = ui.slash.items[i];
  const p = page();
  const b = p && p.blocks.find((x) => x.id === ui.slash.blockId);
  closeSlash();
  if (b && it) applyBlockType(b, it, false);
}

/* ---------- menús flotantes ---------- */

function positionMenu(el, anchorRect, prefer) {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  let x = anchorRect.left;
  let y = anchorRect.bottom + 4;
  if (prefer === 'right') x = Math.min(anchorRect.right - w, window.innerWidth - w - 8);
  x = Math.max(8, Math.min(x, window.innerWidth - w - 8));
  if (y + h > window.innerHeight - 8) y = Math.max(8, anchorRect.top - h - 4);
  el.style.left = x + 'px';
  el.style.top = y + 'px';
}

function makeMenu() {
  const el = document.createElement('div');
  el.className = 'menu';
  document.body.appendChild(el);
  return el;
}

function closeHandleMenu() { const el = $('#handle-menu'); if (el) el.remove(); }
function closeTopMenu() { const el = $('#top-menu'); if (el) el.remove(); }
function closeEmoji() { const el = $('#emoji-picker'); if (el) el.remove(); }
function closePageMenu() { const el = $('#page-menu'); if (el) el.remove(); }
function closeAllMenus() { closeSlash(); closeHandleMenu(); closeTopMenu(); closeEmoji(); closePageMenu(); }

function openHandleMenu(b, anchorRect) {
  closeAllMenus();
  const el = makeMenu();
  el.id = 'handle-menu';
  const actions = [
    { icon: '↑', label: 'Subir', fn: () => moveBlock(b, -1) },
    { icon: '↓', label: 'Bajar', fn: () => moveBlock(b, 1) },
    { icon: '⧉', label: 'Duplicar', fn: () => dupBlock(b) },
    { icon: '🗑', label: 'Borrar', danger: true, fn: () => delBlock(b) }
  ];
  el.innerHTML =
    actions.map((it, i) => '<button class="menu-item ' + (it.danger ? 'danger' : '') + '" data-i="' + i + '" type="button"><span>' + it.icon + '</span>' + it.label + '</button>').join('') +
    '<div class="menu-sep"></div><div class="menu-label">Convertir a</div>' +
    SLASH_ITEMS.filter((it) => it.type !== 'p').map((it) => '<button class="menu-item" data-cv="' + it.type + '" type="button"><span class="mini-ic">' + it.icon + '</span>' + it.label + '</button>').join('');
  positionMenu(el, anchorRect);
  el.addEventListener('click', (e) => {
    const bi = e.target.closest('[data-i]');
    const cv = e.target.closest('[data-cv]');
    if (bi) { actions[+bi.dataset.i].fn(); closeHandleMenu(); }
    else if (cv) {
      const it = SLASH_ITEMS.find((x) => x.type === cv.dataset.cv);
      if (it) applyBlockType(b, it, true);
      closeHandleMenu();
    }
  });
}

function openTopMenu(anchorRect) {
  closeAllMenus();
  const el = makeMenu();
  el.id = 'top-menu';
  const items = [
    { icon: '＋', label: 'Nueva página', fn: () => newPage() },
    { icon: '⬇', label: 'Exportar (.json)', fn: () => exportData() },
    { icon: '⬆', label: 'Importar (.json)', fn: () => $('#file-import').click() },
    { icon: '🗑', label: 'Borrar página actual', danger: true, fn: () => deleteCurrentPage() }
  ];
  el.innerHTML = items.map((it, i) => '<button class="menu-item ' + (it.danger ? 'danger' : '') + '" data-i="' + i + '" type="button"><span>' + it.icon + '</span>' + it.label + '</button>').join('');
  positionMenu(el, anchorRect, 'right');
  el.addEventListener('click', (e) => {
    const bi = e.target.closest('[data-i]');
    if (bi) { closeTopMenu(); items[+bi.dataset.i].fn(); }
  });
}

function openEmoji(anchorRect) {
  closeAllMenus();
  const el = makeMenu();
  el.id = 'emoji-picker';
  el.classList.add('emoji-menu');
  el.innerHTML =
    '<div class="emoji-grid">' + EMOJIS.map((e) => '<button class="emoji-btn" data-e="' + e + '" type="button">' + e + '</button>').join('') + '</div>' +
    '<div class="menu-sep"></div>' +
    '<button class="menu-item" data-e="" type="button"><span>✕</span>Quitar icono</button>';
  positionMenu(el, anchorRect);
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-e]');
    if (!btn) return;
    const p = page();
    if (p) { p.icon = btn.dataset.e; p.updatedAt = Date.now(); scheduleSave(); }
    closeEmoji();
    render();
  });
}

function openPageMenu(pageId, anchorRect) {
  closeAllMenus();
  const el = makeMenu();
  el.id = 'page-menu';
  el.innerHTML =
    '<button class="menu-item" data-a="dup" type="button"><span>⧉</span>Duplicar página</button>' +
    '<button class="menu-item danger" data-a="del" type="button"><span>🗑</span>Eliminar página</button>';
  positionMenu(el, anchorRect);
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-a]');
    if (!btn) return;
    closePageMenu();
    if (btn.dataset.a === 'dup') dupPage(pageId);
    else deletePage(pageId);
  });
}

/* ---------- operaciones sobre páginas ---------- */

function newPage() {
  const p = { id: uid(), title: '', icon: '', createdAt: Date.now(), updatedAt: Date.now(), blocks: [newBlock('p')] };
  state.pages.unshift(p);
  state.activeId = p.id;
  forceScrollTop = true;
  closeSidebar();
  closeAllMenus();
  render();
  persist();
  focusTitle();
}

function openPage(id) {
  if (state.activeId === id) { closeSidebar(); return; }
  state.activeId = id;
  forceScrollTop = true;
  closeSidebar();
  closeAllMenus();
  render();
  persist();
  if (!isMobile()) focusTitle();
}

function dupPage(id) {
  const p = state.pages.find((x) => x.id === id);
  if (!p) return;
  const copy = JSON.parse(JSON.stringify(p));
  copy.id = uid();
  copy.title = (p.title || 'Sin título') + ' (copia)';
  copy.createdAt = Date.now();
  copy.updatedAt = Date.now();
  copy.blocks.forEach((b) => { b.id = uid(); });
  const i = state.pages.indexOf(p);
  state.pages.splice(i + 1, 0, copy);
  state.activeId = copy.id;
  forceScrollTop = true;
  render();
  persist();
  showToast('Página duplicada ✓');
}

async function deletePage(id) {
  const p = state.pages.find((x) => x.id === id);
  if (!p) return;
  const ok = await confirmModal({
    title: '¿Eliminar esta página?',
    body: '«' + (p.title || 'Sin título') + '» y todos sus bloques se borrarán para siempre.',
    ok: 'Eliminar'
  });
  if (!ok) return;
  const i = state.pages.indexOf(p);
  state.pages.splice(i, 1);
  state.activeId = state.pages.length ? state.pages[Math.max(0, i - 1)].id : null;
  render();
  persist();
  showToast('Página eliminada');
}

async function deleteCurrentPage() {
  const p = page();
  if (p) await deletePage(p.id);
}

/* ---------- exportar / importar ---------- */

function exportData() {
  const data = { app: 'arsweb-notes', version: 1, exportedAt: new Date().toISOString(), pages: state.pages };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'mis-notas-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  showToast('Exportación descargada ✓');
}

function sanitizePage(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const p = {
    id: typeof raw.id === 'string' ? raw.id.slice(0, 60) : uid(),
    title: typeof raw.title === 'string' ? raw.title.slice(0, 300) : '',
    icon: typeof raw.icon === 'string' ? raw.icon.slice(0, 8) : '',
    createdAt: +raw.createdAt || Date.now(),
    updatedAt: +raw.updatedAt || Date.now(),
    blocks: []
  };
  if (Array.isArray(raw.blocks)) {
    for (const rb of raw.blocks) {
      if (!rb || typeof rb !== 'object') continue;
      const t = BLOCK_TYPES.includes(rb.type) ? rb.type : 'p';
      p.blocks.push({
        id: typeof rb.id === 'string' ? rb.id.slice(0, 60) : uid(),
        type: t,
        text: typeof rb.text === 'string' ? rb.text.slice(0, 200000) : '',
        level: Math.min(4, Math.max(0, parseInt(rb.level, 10) || 0)),
        checked: !!rb.checked,
        src: typeof rb.src === 'string' ? rb.src.slice(0, 2000) : ''
      });
    }
  }
  if (!p.blocks.length) p.blocks.push(newBlock('p'));
  return p;
}

function importFile(file) {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const data = JSON.parse(fr.result);
      const pages = Array.isArray(data) ? data : data.pages;
      if (!Array.isArray(pages) || !pages.length) throw new Error('formato');
      let added = 0, updated = 0;
      for (const raw of pages) {
        const p = sanitizePage(raw);
        if (!p) continue;
        const i = state.pages.findIndex((x) => x.id === p.id);
        if (i >= 0) { state.pages[i] = p; updated++; }
        else { state.pages.push(p); added++; }
      }
      render();
      persist();
      showToast('Importadas ' + (added + updated) + ' páginas (' + added + ' nuevas) ✓');
    } catch (err) {
      showToast('No se pudo importar ese archivo');
    }
  };
  fr.readAsText(file);
}

/* ---------- modal y toast ---------- */

function confirmModal(opts) {
  return new Promise((resolve) => {
    const root = $('#modal-root');
    root.innerHTML =
      '<div class="modal-back"><div class="modal" role="dialog" aria-modal="true">' +
        '<h3>' + escapeHtml(opts.title) + '</h3>' +
        '<p>' + escapeHtml(opts.body || '') + '</p>' +
        '<div class="modal-btns">' +
          '<button class="btn" data-act="no" type="button">Cancelar</button>' +
          '<button class="btn ' + (opts.danger ? 'btn-danger' : '') + '" data-act="yes" type="button">' + escapeHtml(opts.ok || 'Eliminar') + '</button>' +
        '</div>' +
      '</div></div>';
    const yesBtn = root.querySelector('[data-act="yes"]');
    const noBtn = root.querySelector('[data-act="no"]');
    const done = (v) => {
      root.innerHTML = '';
      document.removeEventListener('keydown', onKey);
      resolve(v);
    };
    const onKey = (e) => { if (e.key === 'Escape') done(false); };
    document.addEventListener('keydown', onKey);
    yesBtn.addEventListener('click', () => done(true));
    noBtn.addEventListener('click', () => done(false));
    root.querySelector('.modal-back').addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-back')) done(false);
    });
    yesBtn.focus();
  });
}

/* ---------- sidebar móvil / colapsada ---------- */

function openSidebar(v) {
  $('#app').classList.toggle('sidebar-open', !!v);
}

function closeSidebar() {
  $('#app').classList.remove('sidebar-open');
}

function toggleSidebar() {
  if (isMobile()) openSidebar(!$('#app').classList.contains('sidebar-open'));
  else {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    $('#app').classList.toggle('sidebar-hidden', state.sidebarCollapsed);
    persist();
  }
}

/* ---------- eventos ---------- */

function bindEvents() {
  const editor = $('#editor');
  const sidebar = $('#sidebar');

  /* --- input (texto y títulos) --- */
  editor.addEventListener('input', (e) => {
    const t = e.target;
    const p = page();
    if (!p) return;
    if (t.classList.contains('ce-title')) {
      p.title = t.innerText.replace(/\n/g, ' ').replace(/\u00a0/g, ' ');
      p.updatedAt = Date.now();
      scheduleSave();
      renderTopbar();
      return;
    }
    if (!t.classList.contains('ce')) return;
    const wrap = t.closest('.block');
    if (!wrap) return;
    const b = p.blocks.find((x) => x.id === wrap.dataset.id);
    if (!b) return;
    b.text = readCE(t);
    t.classList.toggle('is-empty', b.text === '');
    touchBlock(b);
    if (b.text.startsWith('/')) {
      const q = b.text.slice(1);
      if (!q.includes(' ') && q.length < 40) openSlash(b);
      else closeSlash();
    } else {
      closeSlash();
    }
  });

  /* --- keydown --- */
  editor.addEventListener('keydown', (e) => {
    const t = e.target;
    const p = page();
    if (!p) return;

    // Navegación del menú slash
    if (ui.slash && t.classList.contains('ce')) {
      const wrap = t.closest('.block');
      if (wrap && wrap.dataset.id === ui.slash.blockId) {
        if (e.key === 'ArrowDown') { e.preventDefault(); moveSlash(1); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); moveSlash(-1); return; }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          selectSlashItem(ui.slash.index);
          return;
        }
        if (e.key === 'Escape') { e.preventDefault(); closeSlash(); return; }
      }
    }

    if (t.classList.contains('ce-title')) {
      if (e.key === 'Enter') {
        e.preventDefault();
        focusFirstBlock();
      }
      return;
    }

    if (!t.classList.contains('ce')) return;
    const wrap = t.closest('.block');
    if (!wrap) return;
    const b = p.blocks.find((x) => x.id === wrap.dataset.id);
    if (!b) return;

    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!t.contains(range.startContainer) || !t.contains(range.endContainer)) return;
    const s1 = offsetIn(t, range.startContainer, range.startOffset);
    const s2 = offsetIn(t, range.endContainer, range.endOffset);
    if (s1 === null || s2 === null) return;
    const start = Math.min(s1, s2);
    const end = Math.max(s1, s2);

    switch (e.key) {
      case 'Enter': {
        e.preventDefault();
        if (e.shiftKey) {
          if (start === end) {
            b.text = b.text.slice(0, start) + '\n' + b.text.slice(start);
            writeCE(t, b.text);
            setCaret(t, start + 1);
          } else {
            b.text = b.text.slice(0, start) + b.text.slice(end);
            writeCE(t, b.text);
            setCaret(t, start);
          }
          touchBlock(b);
        } else {
          if (start !== end) b.text = b.text.slice(0, start) + b.text.slice(end);
          onEnter(b, start);
        }
        break;
      }
      case 'Backspace': {
        if (start !== 0 || end !== 0) return; // que el navegador borre el carácter
        e.preventDefault();
        onBackspace(b);
        break;
      }
      case 'Tab': {
        if (!isList(b.type)) return;
        e.preventDefault();
        b.level = Math.min(4, Math.max(0, b.level + (e.shiftKey ? -1 : 1)));
        touchBlock(b);
        renderEditor();
        focusBlock(b.id, start);
        break;
      }
      case 'ArrowUp': {
        if (start === 0 && end === 0) {
          const idx = p.blocks.indexOf(b);
          for (let i = idx - 1; i >= 0; i--) {
            if (p.blocks[i].type !== 'divider') {
              e.preventDefault();
              focusBlock(p.blocks[i].id, p.blocks[i].text.length);
              return;
            }
          }
        }
        break;
      }
      case 'ArrowDown': {
        if (start === b.text.length && end === b.text.length) {
          const idx = p.blocks.indexOf(b);
          for (let i = idx + 1; i < p.blocks.length; i++) {
            if (p.blocks[i].type !== 'divider') {
              e.preventDefault();
              focusBlock(p.blocks[i].id, 0);
              return;
            }
          }
        }
        break;
      }
    }
  });

  /* --- pegar (solo texto plano) --- */
  editor.addEventListener('paste', (e) => {
    const t = e.target;
    const p = page();
    if (!p) return;
    const raw = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (!raw) return;

    if (t.classList.contains('ce-title')) {
      e.preventDefault();
      insertTextAtCaret(t, raw.replace(/\n/g, ' '));
      p.title = t.innerText.replace(/\n/g, ' ').replace(/\u00a0/g, ' ');
      p.updatedAt = Date.now();
      scheduleSave();
      renderTopbar();
      return;
    }
    if (!t.classList.contains('ce')) return;
    e.preventDefault();

    const wrap = t.closest('.block');
    if (!wrap) return;
    const b = p.blocks.find((x) => x.id === wrap.dataset.id);
    if (!b) return;

    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const r = sel.getRangeAt(0);
    if (!t.contains(r.startContainer) || !t.contains(r.endContainer)) return;
    const s1 = offsetIn(t, r.startContainer, r.startOffset);
    const s2 = offsetIn(t, r.endContainer, r.endOffset);
    const start = Math.min(s1, s2);
    const end = Math.max(s1, s2);

    const lines = raw.replace(/\r/g, '').split('\n');
    const prefix = b.text.slice(0, start);
    const suffix = b.text.slice(end);

    if (lines.length === 1) {
      b.text = prefix + lines[0] + suffix;
      writeCE(t, b.text);
      setCaret(t, start + lines[0].length);
    } else {
      const idx = p.blocks.indexOf(b);
      b.text = prefix + lines[0];
      const news = [];
      for (let i = 1; i < lines.length; i++) {
        const nb = newBlock(b.type, b.level);
        nb.text = (i === lines.length - 1) ? lines[i] + suffix : lines[i];
        news.push(nb);
      }
      p.blocks.splice(idx + 1, 0, ...news);
      renderEditor();
      const last = news[news.length - 1];
      focusBlock(last.id, lines[lines.length - 1].length);
    }
    touchBlock(b);
    closeSlash();
  });

  /* --- clics --- */
  editor.addEventListener('click', (e) => {
    if (e.target.closest('.block') || e.target.closest('.page-head')) return;
    const p = page();
    if (!p) return;
    const last = p.blocks[p.blocks.length - 1];
    if (last && last.type === 'p' && last.text === '') {
      focusBlock(last.id, 0);
      return;
    }
    const nb = newBlock('p');
    p.blocks.push(nb);
    touchBlock(nb);
    renderEditor();
    focusBlock(nb.id, 0);
  });

  editor.addEventListener('mousedown', (e) => {
    const handle = e.target.closest('.block-handle');
    if (!handle) {
      if (!e.target.closest('#slash-menu')) closeSlash();
      return;
    }
    e.preventDefault();
    const wrap = handle.closest('.block');
    const p = page();
    if (!wrap || !p) return;
    const b = p.blocks.find((x) => x.id === wrap.dataset.id);
    if (!b) return;
    openHandleMenu(b, handle.getBoundingClientRect());
  });

  editor.addEventListener('click', (e) => {
    const btnIcon = e.target.closest('#btn-icon');
    if (btnIcon) {
      e.preventDefault();
      openEmoji(btnIcon.getBoundingClientRect());
    }
  });

  /* --- sidebar --- */
  sidebar.addEventListener('click', (e) => {
    const goto = e.target.closest('[data-goto]');
    if (goto) { openPage(goto.dataset.goto); return; }
    const pm = e.target.closest('[data-pagemenu]');
    if (pm) {
      e.stopPropagation();
      openPageMenu(pm.dataset.pagemenu, pm.getBoundingClientRect());
    }
  });

  sidebar.addEventListener('mousedown', (e) => {
    if (e.target.closest('[data-pagemenu]')) e.preventDefault();
  });

  $('#search').addEventListener('input', (e) => {
    ui.search = e.target.value;
    renderSidebar();
  });
  $('#search').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.target.value = ''; ui.search = ''; renderSidebar(); e.target.blur(); }
  });

  $('#btn-new').addEventListener('click', newPage);
  $('#btn-export').addEventListener('click', exportData);
  $('#btn-import').addEventListener('click', () => $('#file-import').click());
  $('#file-import').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) importFile(f);
    e.target.value = '';
  });

  $('#btn-menu').addEventListener('click', toggleSidebar);
  $('#btn-collapse').addEventListener('click', toggleSidebar);
  $('#backdrop').addEventListener('click', closeSidebar);

  $('#btn-theme').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    persist();
    render();
  });

  $('#btn-topmenu').addEventListener('click', (e) => {
    e.stopPropagation();
    const el = $('#top-menu');
    if (el) { closeTopMenu(); return; }
    openTopMenu(e.currentTarget.getBoundingClientRect());
  });

  /* --- menú slash (clic con ratón) --- */
  document.addEventListener('click', (e) => {
    const m = $('#slash-menu');
    if (m && !e.target.closest('#slash-menu')) {
      closeSlash();
    }
  });
  document.addEventListener('mousedown', (e) => {
    if (e.target.closest('#slash-menu')) e.preventDefault();
    if (!e.target.closest('#handle-menu')) closeHandleMenu();
    if (!e.target.closest('#top-menu') && !e.target.closest('#btn-topmenu')) closeTopMenu();
    if (!e.target.closest('#emoji-picker') && !e.target.closest('#btn-icon')) closeEmoji();
    if (!e.target.closest('#page-menu') && !e.target.closest('[data-pagemenu]')) closePageMenu();
  });

  /* --- scroll / redimensión: reposicionar o cerrar menús --- */
  window.addEventListener('scroll', () => {
    if (ui.slash) positionSlashMenu();
    else { closeHandleMenu(); closeTopMenu(); closeEmoji(); closePageMenu(); }
  }, true);
  window.addEventListener('resize', () => {
    if (ui.slash) positionSlashMenu();
    else { closeHandleMenu(); closeTopMenu(); closeEmoji(); closePageMenu(); }
  });

  /* --- teclado global --- */
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (isMobile()) openSidebar(true);
      const s = $('#search');
      s.focus();
      s.select();
      return;
    }
    if (e.key === 'Escape') {
      closeAllMenus();
      closeSidebar();
    }
  });

  /* --- clic en el menú slash --- */
  document.addEventListener('click', (e) => {
    const item = e.target.closest('#slash-menu .slash-item');
    if (item) selectSlashItem(+item.dataset.i);
  });
}

function insertTextAtCaret(el, text) {
  const sel = window.getSelection();
  if (!text) return;
  if (sel.rangeCount) {
    const r = sel.getRangeAt(0);
    r.deleteContents();
    const n = document.createTextNode(text);
    r.insertNode(n);
    r.setStart(n, text.length);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
  } else {
    el.innerText = el.innerText + text;
  }
}

/* ---------- inicio ---------- */

function init() {
  state = loadState() || seedState();
  if (!Array.isArray(state.pages)) state.pages = [];
  if (state.sidebarCollapsed && !isMobile()) $('#app').classList.add('sidebar-hidden');
  bindEvents();
  render();
  setSaveState('saved');
}

init();
