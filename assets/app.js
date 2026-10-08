'use strict';

/* =========================================================
   Shortt map / Fix — scan 100% local des ressources FiveM
   ========================================================= */

// Seuls les fichiers de mapping du dossier stream/ sont scannés (pas de .ymf, .lua, .json…)
const STREAM_EXT = new Set(['ymap', 'ytyp', 'ydr', 'ydd', 'yft', 'ytd', 'ybn', 'ynv', 'ynd', 'ycd', 'ypt', 'yld', 'ymt']);
// Fichiers ressource RAGE : doivent commencer par "RSC7" (ou RSC8)
const RSC_EXT = new Set(['ymap', 'ytyp', 'ydr', 'ydd', 'yft', 'ytd', 'ybn', 'ynv', 'ynd', 'ycd', 'ypt', 'yld']);
const SKIP_DIRS = new Set(['.git', 'node_modules', 'cache', '.vscode']);

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ext = (name) => { const i = name.lastIndexOf('.'); return i < 0 ? '' : name.slice(i + 1).toLowerCase(); };

let DATA = null;

/* ---------------- Collecte des fichiers ---------------- */

async function readEntry(entry, prefix, out) {
  if (entry.isFile) {
    const file = await new Promise((res, rej) => entry.file(res, rej));
    out.push({ path: prefix + entry.name, file });
    if (out.length % 500 === 0) setProgress(5, 'p.readingN', { n: out.length });
  } else if (entry.isDirectory) {
    if (SKIP_DIRS.has(entry.name.toLowerCase())) return;
    const reader = entry.createReader();
    let batch;
    do {
      batch = await new Promise((res, rej) => reader.readEntries(res, rej));
      for (const e of batch) await readEntry(e, prefix + entry.name + '/', out);
    } while (batch.length);
  }
}

async function filesFromDrop(dt) {
  const entries = [...dt.items].map((i) => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
  const out = [];
  for (const e of entries) await readEntry(e, '', out);
  return out;
}

function filesFromPicker(list) {
  return [...list]
    .map((f) => ({ path: f.webkitRelativePath || f.name, file: f }))
    .filter((f) => !f.path.split('/').some((p) => SKIP_DIRS.has(p.toLowerCase())));
}

/* ---------------- Utilitaires de lecture ---------------- */

async function pool(items, size, fn, onStep) {
  let i = 0, done = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const item = items[i++];
      try { await fn(item); } catch (e) { item.error = e; }
      done++;
      if (onStep && done % 50 === 0) onStep(done);
    }
  });
  await Promise.all(workers);
}

async function readMagic(file) {
  const buf = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  return String.fromCharCode(...buf);
}

async function hashFile(file) {
  const BIG = 64 * 1048576, PART = 4 * 1048576;
  let buf;
  if (file.size > BIG) {
    const a = new Uint8Array(await file.slice(0, PART).arrayBuffer());
    const b = new Uint8Array(await file.slice(file.size - PART).arrayBuffer());
    buf = new Uint8Array(a.length + b.length); buf.set(a); buf.set(b, a.length);
  } else {
    buf = new Uint8Array(await file.arrayBuffer());
  }
  if (window.crypto && crypto.subtle) {
    const h = new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
    return file.size + ':' + [...h].map((x) => x.toString(16).padStart(2, '0')).join('');
  }
  let h = 0x811c9dc5; // FNV-1a fallback
  for (let k = 0; k < buf.length; k++) { h ^= buf[k]; h = Math.imul(h, 16777619); }
  return file.size + ':' + (h >>> 0).toString(16);
}

/* ---------------- Analyse ---------------- */

async function analyze(files) {
  // 1. Trouver les ressources (dossiers avec fxmanifest.lua / __resource.lua)
  const roots = new Set();
  for (const f of files) {
    const name = f.path.split('/').pop().toLowerCase();
    if (name === 'fxmanifest.lua' || name === '__resource.lua') roots.add(f.path.slice(0, f.path.lastIndexOf('/')));
  }
  // Aucun manifest : chaque sous-dossier de premier niveau = une ressource
  if (!roots.size) {
    for (const f of files) {
      const parts = f.path.split('/');
      if (parts.length > 2) roots.add(parts.slice(0, 2).join('/'));
    }
  }

  const resources = new Map(); // root -> resource
  for (const root of roots) {
    resources.set(root, { root, name: root.split('/').pop(), files: 0, stream: 0, fxap: 0 });
  }

  const findRoot = (path) => {
    let p = path;
    while (p.includes('/')) {
      p = p.slice(0, p.lastIndexOf('/'));
      if (resources.has(p)) return resources.get(p);
    }
    return null;
  };

  const stream = [];
  for (const f of files) {
    const res = findRoot(f.path);
    if (!res) continue;
    res.files++;
    f.res = res;
    f.name = f.path.split('/').pop();
    f.ext = ext(f.name);
    const rel = f.path.slice(res.root.length + 1).toLowerCase();
    // .fxap = ressource escrow (on regarde juste sa présence, rien n'est lu)
    if (f.ext === 'fxap') res.fxap++;
    else if (STREAM_EXT.has(f.ext) && rel.startsWith('stream/')) {
      res.stream++;
      stream.push(f);
    }
  }

  // 2. Vérifier les en-têtes (fichiers chiffrés / illisibles)
  const unreadable = [];
  const toCheck = stream.filter((f) => RSC_EXT.has(f.ext));
  setProgress(20, 'p.check', { n: 0, total: toCheck.length });
  await pool(toCheck, 16, async (f) => {
    if (f.file.size < 4) {
      unreadable.push({ res: f.res.name, path: f.path, rel: f.path.slice(f.res.root.length + 1), reason: 'empty' });
      return;
    }
    const magic = await readMagic(f.file);
    if (magic === 'RSC7' || magic === 'RSC8') return;
    if (magic === 'PSIN' && f.ext === 'ytyp') return;
    unreadable.push({
      res: f.res.name, path: f.path, rel: f.path.slice(f.res.root.length + 1),
      reason: magic === 'FXAP' ? 'escrow' : 'unknown',
    });
  }, (n) => setProgress(20 + (n / toCheck.length) * 30, 'p.check', { n, total: toCheck.length }));

  // 3. Grouper par nom de fichier
  const byName = new Map();
  for (const f of stream) {
    const key = f.name.toLowerCase();
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(f);
  }
  const groups = [...byName.values()].filter((g) => g.length > 1);

  // 4. Comparer le contenu des doublons
  const toHash = groups.flat();
  setProgress(50, 'p.hash', { n: 0, total: toHash.length });
  await pool(toHash, 6, async (f) => { f.hash = await hashFile(f.file); },
    (n) => setProgress(50 + (n / toHash.length) * 48, 'p.hash', { n, total: toHash.length }));

  const conflicts = [];
  const identicals = [];
  for (const g of groups) {
    const item = {
      file: g[0].name,
      ext: g[0].ext,
      entries: g.map((f) => ({ res: f.res.name, path: f.path, rel: f.path.slice(f.res.root.length + 1), size: f.file.size })),
      resources: [...new Set(g.map((f) => f.res.name))],
    };
    const hashes = new Set(g.map((f) => f.hash || f.path));
    (hashes.size === 1 ? identicals : conflicts).push(item);
  }
  const sortFn = (a, b) => b.resources.length - a.resources.length || a.file.localeCompare(b.file);
  conflicts.sort(sortFn);
  identicals.sort(sortFn);

  const protectedRes = [...resources.values()].filter((r) => r.fxap).map((r) => ({ res: r.name, fxap: r.fxap }));

  setProgress(100, 'p.done');
  return {
    date: new Date(),
    totalFiles: files.length,
    resources: [...resources.values()].sort((a, b) => a.name.localeCompare(b.name)),
    streamCount: stream.length,
    conflicts, identicals, unreadable, protectedRes,
  };
}

/* ---------------- Menu déroulant avec recherche ---------------- */

let targets = []; // ressources ciblées ([] = toutes)
const excluded = new Set(); // paires décochées = exclues du récap

const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';

// Clic = une seule ressource. Ctrl / Shift + clic (ou clic sur la case) = plusieurs.
function createSelect(root, onChange) {
  const btn = root.querySelector('.select-btn');
  const label = root.querySelector('.select-label');
  const pop = root.querySelector('.select-pop');
  const search = root.querySelector('.select-search');
  const list = root.querySelector('.select-list');
  const foot = root.querySelector('.select-foot');
  let options = [], shown = [], active = 0;
  let selected = new Set();

  const isOn = (o) => (o.value === '' ? selected.size === 0 : selected.has(o.value));

  const updateLabel = () => {
    const v = [...selected];
    label.textContent = !v.length ? t('sel.all') : v.length <= 2 ? v.join(', ') : t('sel.many', { n: v.length });
    foot.querySelector('.select-clear').hidden = !v.length;
    foot.querySelector('.select-n').textContent = !v.length ? '' : v.length === 1 ? t('sel.one') : t('sel.n', { n: v.length });
  };

  const draw = () => {
    const q = search.value.trim().toLowerCase();
    const label = (o) => (o.value ? o.label : t('sel.all'));
    shown = options.filter((o) => !q || label(o).toLowerCase().includes(q));
    active = Math.min(active, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length
      ? shown.map((o, i) => `<li role="option" data-i="${i}" aria-selected="${isOn(o)}"
          class="${i === active ? 'active' : ''} ${isOn(o) ? 'selected' : ''}">
          <i class="check" title="${t('sel.toggle')}">${CHECK}</i>
          <span>${esc(label(o))}</span><em class="badge ${o.count ? '' : 'zero'}">${o.count}</em></li>`).join('')
      : `<li class="empty">${t('sel.none')}</li>`;
    const el = list.querySelector('li.active');
    if (el) el.scrollIntoView({ block: 'nearest' });
  };

  const emit = () => { updateLabel(); onChange([...selected]); };

  const open = () => {
    root.classList.add('open');
    pop.hidden = false;
    search.value = '';
    active = Math.max(0, options.findIndex(isOn));
    draw();
    search.focus();
  };
  const close = () => { root.classList.remove('open'); pop.hidden = true; };

  const pickOne = (o) => {
    if (!o) return;
    selected = new Set(o.value ? [o.value] : []);
    emit();
    close();
    btn.focus();
  };
  const toggle = (o) => {
    if (!o) return;
    if (!o.value) selected.clear();
    else if (selected.has(o.value)) selected.delete(o.value);
    else selected.add(o.value);
    emit();
    draw();
    search.focus();
  };

  btn.addEventListener('click', () => (pop.hidden ? open() : close()));
  search.addEventListener('input', () => { active = 0; draw(); });
  search.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, shown.length - 1); draw(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); draw(); }
    else if (e.key === 'Enter') { e.preventDefault(); (e.ctrlKey || e.shiftKey || e.metaKey ? toggle : pickOne)(shown[active]); }
    else if (e.key === 'Escape') { e.stopPropagation(); close(); btn.focus(); }
  });
  list.addEventListener('mousedown', (e) => {
    const li = e.target.closest('li[data-i]');
    if (!li) return;
    e.preventDefault();
    // La liste est redessinée pendant le clic : sans ça, le clic passe pour un clic « en dehors » et ferme le menu
    e.stopPropagation();
    active = +li.dataset.i;
    const multi = e.ctrlKey || e.shiftKey || e.metaKey || e.target.closest('.check');
    (multi ? toggle : pickOne)(shown[active]);
  });
  list.addEventListener('mousemove', (e) => {
    const li = e.target.closest('li[data-i]');
    if (li && +li.dataset.i !== active) { active = +li.dataset.i; list.querySelectorAll('li').forEach((x) => x.classList.toggle('active', x === li)); }
  });
  foot.querySelector('.select-clear').addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); selected.clear(); emit(); draw(); });
  document.addEventListener('mousedown', (e) => { if (!root.contains(e.target)) close(); });

  return {
    setOptions(opts) {
      options = opts;
      selected = new Set();
      emit();
    },
    setSelected(values) {
      selected = new Set(values);
      emit();
    },
    refresh() {
      if (options.length) updateLabel();
      if (!pop.hidden) draw();
    },
  };
}

const targetSelect = createSelect($('#target'), (v) => { targets = v; if (DATA) render(); });

/* ---------------- Rendu ---------------- */

const LOCK = '<svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

// Type de fichier affiché à côté de chaque conflit
function fileKind(path) {
  const name = path.split('/').pop().toLowerCase();
  if (/(^|_)occl(_|\d|\.)/.test(name)) return 'Occlusion';
  if (name.includes('lodlights')) return 'Lodlights';
  const e = ext(name);
  return {
    ymap: 'Ymap', ytyp: 'Ytyp', ydr: t('kind.model'), ydd: t('kind.model'), yft: t('kind.model'), ytd: t('kind.textures'),
    ybn: 'Collision', ynv: 'Navmesh', ynd: t('kind.paths'), ymt: t('kind.scenario'), ycd: 'Animation', ypt: t('kind.particles'), yld: 'Cloth',
  }[e] || e.toUpperCase();
}

// Raison d'un fichier illisible (code, ou texte libre des anciens récaps)
const reasonText = (r) => (STR['reason.' + r] ? t('reason.' + r) : r);

// Fichiers chiffrés / illisibles (vérifiés un par un, pas par ressource)
function lockedFiles() {
  return new Map(DATA.unreadable.map((u) => [u.path, reasonText(u.reason)]));
}

function renderStats() {
  const r = buildRecap([]);
  const s = [
    ['', DATA.resources.length, t('st.res')],
    ['red', r.all.length, t('st.pairs')],
    ['orange', r.files, t('st.files')],
    ['orange', DATA.unreadable.length, t('st.locked')],
  ];
  $('#stats').innerHTML = s.map(([c, n, l]) => `<div class="stat ${n ? c : 'green'}"><b>${n}</b><span>${l}</span></div>`).join('');
}

function renderReport() {
  const r = buildRecap(targets);
  const locked = lockedFiles();
  const res = (n) => `<span class="res">${esc(n)}</span>`;
  const file = (rel, path) => `<code${locked.has(path) ? ` class="is-locked" title="${esc(locked.get(path))}"` : ''}>${locked.has(path) ? LOCK : ''}${esc(rel)}</code>`;

  const rows = r.all.map((p) => {
    // La ressource ciblée toujours à gauche
    const swap = targets.includes(p.b) && !targets.includes(p.a);
    const [a, b] = swap ? [p.b, p.a] : [p.a, p.b];
    const files = p.items.map((it) => {
      const [ra, rb, pa, pb] = swap ? [it.relB, it.relA, it.pathB, it.pathA] : [it.relA, it.relB, it.pathA, it.pathB];
      return `<li>
        <div class="ftags"><span class="ftag">${fileKind(ra)}</span>${it.identical ? `<span class="ftag same" title="${t('r.identicalTip')}">${t('r.identical')}</span>` : ''}</div>
        <div class="fpaths">${file(ra, pa)}<span class="sep">↔</span>${file(rb, pb)}</div>
      </li>`;
    }).join('');
    return `<details class="conflict${p.included ? '' : ' off'}" data-key="${esc(p.key)}">
      <summary>
        <span class="pick" role="checkbox" aria-checked="${p.included}" tabindex="0" title="${t('r.pickTip')}">${CHECK}</span>
        <span class="names">${res(a)}<span class="sep">↔</span>${res(b)}</span>
        <span class="nfiles">${t(p.items.length > 1 ? 'r.fileN' : 'r.file1', { n: p.items.length })}</span>
      </summary>
      <ul class="files">${files}</ul>
    </details>`;
  }).join('');

  const lockedHere = DATA.unreadable.filter((u) => !targets.length || targets.includes(u.res));
  const lockedBlock = lockedHere.length ? `
    <details class="conflict locked-list">
      <summary><span class="names">${LOCK}${t('r.locked')}</span><span class="nfiles">${lockedHere.length}</span></summary>
      <ul class="files">${lockedHere.map((u) => `<li><div class="fpaths"><b>${esc(u.res)}</b><code class="is-locked">${LOCK}${esc(u.rel)}</code><span class="why">${esc(reasonText(u.reason))}</span></div></li>`).join('')}</ul>
    </details>` : '';

  $('#report').innerHTML = `
    <div class="card">
      <div class="list-head">
        <h3>${targets.length === 1 ? t('r.titleOf', { name: `<span class="grad">${esc(targets[0])}</span>` })
          : targets.length ? t('r.titleOf', { name: `<span class="grad">${t('r.nres', { n: targets.length })}</span>` })
          : t('r.title')} <span class="count">${r.all.length}</span></h3>
        <span class="legend">${LOCK} ${t('r.legend')}</span>
      </div>
      ${rows ? `<p class="hint">${t('r.hint')}</p>
        <div class="pick-bar">
          <span>${t('r.inRecap')} <b id="pickCount">${r.pairs.length} / ${r.all.length}</b></span>
          <span><button type="button" data-pick="all">${t('r.checkAll')}</button><button type="button" data-pick="none">${t('r.uncheckAll')}</button></span>
        </div>
        <div class="conflicts">${rows}</div>`
        : `<p class="empty">${t('r.empty')}</p>`}
      ${lockedBlock ? `<div class="conflicts" style="margin-top:10px">${lockedBlock}</div>` : ''}
    </div>`;
}

function render() {
  renderReport();
  updateRateTotal();
}

// Cases « dans le récap » : sans ouvrir / fermer la ligne
function setPicked(row, on) {
  const key = row.dataset.key;
  if (on) excluded.delete(key); else excluded.add(key);
  row.classList.toggle('off', !on);
  row.querySelector('.pick').setAttribute('aria-checked', String(on));
}

$('#report').addEventListener('click', (e) => {
  const pick = e.target.closest('.pick');
  if (pick) {
    e.preventDefault();
    const row = pick.closest('.conflict');
    setPicked(row, row.classList.contains('off'));
    updateRateTotal();
    return;
  }
  const all = e.target.closest('[data-pick]');
  if (all) {
    const on = all.dataset.pick === 'all';
    document.querySelectorAll('#report .conflict[data-key]').forEach((row) => setPicked(row, on));
    updateRateTotal();
  }
});
$('#report').addEventListener('keydown', (e) => {
  const pick = e.target.closest('.pick');
  if (pick && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); pick.click(); }
});

function showResults(data, saved) {
  DATA = data;
  excluded.clear();
  if (saved) saved.excluded.forEach((k) => excluded.add(k));
  renderStats();
  // Nombre de ressources en conflit avec chacune, affiché dans le menu déroulant
  const all = buildRecap([]);
  const counts = new Map();
  all.all.forEach((p) => { counts.set(p.a, (counts.get(p.a) || 0) + 1); counts.set(p.b, (counts.get(p.b) || 0) + 1); });
  const names = [...new Set(data.resources.map((r) => r.name))].sort((a, b) => a.localeCompare(b));
  targetSelect.setOptions([{ value: '', label: '', count: all.all.length }]
    .concat(names.map((n) => ({ value: n, label: n, count: counts.get(n) || 0 }))));
  if (saved) targetSelect.setSelected(saved.targets.filter((t) => names.includes(t)));
  render();
  $('#results').hidden = false;
  $('#results').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => startTour('results'), 700);
}

/* ---------------- Récapitulatif des fix (export HTML) ---------------- */

function slug(s) { return (s || t('x.all')).replace(/[^\w-]+/g, '_').slice(0, 80); }

function download(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

const fmtPrice = (n) => n.toFixed(2) + ' €';

function getRate() {
  const n = parseFloat(String($('#rate').value).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

// Une paire de ressources en conflit = un fix facturé
function buildRecap(targets) {
  const pairs = new Map();
  const add = (item, identical) => {
    const byRes = new Map();
    for (const e of item.entries) {
      if (!byRes.has(e.res)) byRes.set(e.res, []);
      byRes.get(e.res).push(e);
    }
    const names = [...byRes.keys()].sort();
    for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
      const a = names[i], b = names[j];
      if (targets.length && !targets.includes(a) && !targets.includes(b)) continue;
      const key = a + '|' + b;
      if (!pairs.has(key)) pairs.set(key, { key, a, b, items: [], included: !excluded.has(key) });
      for (const ea of byRes.get(a)) for (const eb of byRes.get(b)) {
        pairs.get(key).items.push({
          // même chemin dans les deux ressources = « Fichier », sinon collision de nom
          tag: ea.rel.toLowerCase() === eb.rel.toLowerCase() ? 'Fichier' : 'name_collisions',
          relA: ea.rel, relB: eb.rel, pathA: ea.path, pathB: eb.path, identical,
        });
      }
    }
  };
  DATA.conflicts.forEach((c) => add(c, false));
  DATA.identicals.forEach((c) => add(c, true));

  const list = [...pairs.values()].sort((x, y) => y.items.length - x.items.length || (x.a + x.b).localeCompare(y.a + y.b));
  const rate = getRate();
  // Seules les paires cochées vont dans le récap
  const billed = list.filter((p) => p.included);
  return {
    targets, target: targets.join(', '), all: list, pairs: billed, rate,
    detected: list.length,
    files: list.reduce((n, p) => n + p.items.length, 0),
    total: billed.length * rate,
  };
}

function updateRateTotal() {
  if (!DATA) return;
  const r = buildRecap(targets);
  const n = $('#pickCount');
  if (n) n.textContent = `${r.pairs.length} / ${r.all.length}`;
  $('#rateTotal').textContent = `${r.pairs.length} fix × ${fmtPrice(r.rate)} = ${fmtPrice(r.total)}`;
}

/* ---------------- Sauvegarde du scan dans le récap ---------------- */

const toB64url = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64url = (str) => {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return b;
};
const pipeBytes = async (bytes, stream) =>
  new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());

// Résultats + réglages (cases cochées, ciblage, tarif), compressés
async function packState() {
  const state = {
    v: 1,
    data: { ...DATA, resources: DATA.resources.map((r) => ({ name: r.name, root: r.root })) },
    targets, excluded: [...excluded], rate: $('#rate').value,
  };
  const json = new TextEncoder().encode(JSON.stringify(state));
  return toB64url(await pipeBytes(json, new CompressionStream('deflate-raw')));
}

async function unpackState(str) {
  const json = await pipeBytes(fromB64url(str.trim()), new DecompressionStream('deflate-raw'));
  const state = JSON.parse(new TextDecoder().decode(json));
  if (!state || state.v !== 1 || !state.data) throw new Error('données invalides');
  state.data.date = new Date(state.data.date);
  return state;
}

function restoreState(state) {
  $('#rate').value = state.rate;
  showResults(state.data, state);
  setProgress(100, 'p.restored', { date: () => state.data.date.toLocaleString(dateLocale()) });
}

async function importRecap(file) {
  try {
    const m = (await file.text()).match(/<script type="application\/json" id="shortt-data">([^<]+)<\/script>/);
    if (!m) { setProgress(0, 'p.notRecap'); return; }
    restoreState(await unpackState(m[1]));
  } catch (e) {
    console.error(e);
    setProgress(0, 'p.badRecap', { msg: e.message });
  }
}

// Ouverture depuis le bouton « Rouvrir » d'un récap (#data=…)
async function restoreFromHash() {
  if (!location.hash.startsWith('#data=')) return;
  const packed = location.hash.slice(6);
  history.replaceState(null, '', location.pathname + location.search);
  try { restoreState(await unpackState(packed)); } catch (e) {
    console.error(e);
    setProgress(0, 'p.badLink', { msg: e.message });
  }
}

/* ---------------- Export HTML ---------------- */

async function exportHtml() {
  const btn = $('#exportHtml');
  btn.disabled = true;
  try {
    const r = buildRecap(targets);
    const packed = await packState();
    const reopen = location.href.split('#')[0] + '#data=' + packed;
    const pairsHtml = r.pairs.map((p) => `<div class="pair"><h2>${esc(p.a)} &harr; ${esc(p.b)}<span class="price">${fmtPrice(r.rate)}</span></h2><ul>${
      p.items.map((it) => `<li><span class='tag'>${it.tag}</span>${it.identical ? `<span class='tag same'>${t('r.identical')}</span>` : ''} <code>${esc(it.relA)}</code> &harr; <code>${esc(it.relB)}</code></li>`).join('')
    }</ul></div>`).join('');

    const doc = `<!doctype html>
<html lang="${LANG}"><head><meta charset="utf-8">
<title>${t('x.docTitle')}</title>
<style>
  body { font-family: Consolas, monospace; background:#111; color:#eee; padding:24px; }
  h1 { color:#4fd1c5; }
  h2 { color:#f6ad55; margin-top:28px; border-bottom:1px solid #333; padding-bottom:6px;
       display:flex; justify-content:space-between; }
  .price { color:#68d391; }
  ul { margin: 8px 0 0 0; padding-left: 20px; }
  li { margin: 4px 0; }
  .tag { background:#262631; color:#d6a8ff; padding:2px 8px; border-radius:4px; font-size:11px; margin-right:8px; }
  .tag.same { color:#9ae6b4; }
  code { color:#9ae6b4; }
  .total { font-size: 20px; margin-top: 32px; padding-top:16px; border-top: 2px solid #4fd1c5; }
  .foot { color:#666; font-size:11px; margin-top:24px; }
  .reopen { display:inline-block; margin:4px 0 8px; padding:8px 14px; border-radius:8px; background:#5865f2; color:#fff;
            text-decoration:none; font-family: system-ui, sans-serif; font-weight:600; font-size:13px; }
  .reopen:hover { background:#4752c4; }
  @media print { .reopen { display:none; } }
</style></head>
<body>
<h1>${t('x.title')}</h1>
<a class="reopen" href="${esc(reopen)}">${t('x.reopen')}</a>
<p>${r.target ? `${t(r.targets.length > 1 ? 'x.targetN' : 'x.target1')} : <b>${esc(r.target)}</b> &mdash; ` : ''}${t('x.summary', { billed: r.pairs.length, detected: r.detected, rate: fmtPrice(r.rate) })}</p>
${pairsHtml || `<p>${t('x.none')}</p>`}
<p class="total">Total : ${r.pairs.length} x ${fmtPrice(r.rate)} = <strong>${fmtPrice(r.total)}</strong></p>
<p class="foot">${t('x.foot', { date: DATA.date.toLocaleString(dateLocale()) })}</p>
<script type="application/json" id="shortt-data">${packed}</script>
</body></html>`;

    download(`${t('x.file')}_${slug(r.target)}.html`, new Blob([doc], { type: 'text/html;charset=utf-8' }));
  } catch (e) {
    console.error(e);
    alert(t('x.error', { msg: e.message }));
  } finally {
    btn.disabled = false;
  }
}

/* ---------------- Progression / lancement ---------------- */

// Le message est gardé (clé + valeurs) pour être retraduit si on change de langue
let lastProgress = null;
function setProgress(pct, key, vars) {
  lastProgress = { key, vars };
  $('#progress').hidden = false;
  $('#bar').style.width = Math.min(100, pct) + '%';
  drawProgress();
}
function drawProgress() {
  if (!lastProgress) return;
  const vars = {};
  for (const [k, v] of Object.entries(lastProgress.vars || {})) vars[k] = typeof v === 'function' ? v() : v;
  $('#progressText').textContent = t(lastProgress.key, vars);
}

async function run(getFiles) {
  try {
    $('#results').hidden = true;
    setProgress(2, 'p.reading');
    const files = await getFiles();
    if (!files.length) { setProgress(0, 'p.noFiles'); return; }
    const data = await analyze(files);
    if (!data.resources.length) { setProgress(0, 'p.noRes'); return; }
    setProgress(100, 'p.finished', { files: files.length, res: data.resources.length });
    showResults(data);
  } catch (e) {
    console.error(e);
    setProgress(0, 'p.error', { msg: e.message });
  }
}

const drop = $('#drop');
['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('over')));
drop.addEventListener('drop', (e) => {
  e.preventDefault();
  const dt = e.dataTransfer;
  // Un récap .html déposé = on restaure le scan, sinon c'est un dossier à scanner
  const f = dt.files.length === 1 && /\.html?$/i.test(dt.files[0].name) ? dt.files[0] : null;
  if (f) importRecap(f); else run(() => filesFromDrop(dt));
});
$('#picker').addEventListener('change', (e) => { const list = e.target.files; run(async () => filesFromPicker(list)); e.target.value = ''; });
$('#importPicker').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) importRecap(f); e.target.value = ''; });
$('#exportHtml').addEventListener('click', exportHtml);
restoreFromHash();

// Tarif par conflit, mémorisé dans le navigateur
try { const saved = localStorage.getItem('shortt_rate'); if (saved !== null) $('#rate').value = saved; } catch { /* stockage indisponible */ }
$('#rate').addEventListener('input', () => {
  try { localStorage.setItem('shortt_rate', $('#rate').value); } catch { /* stockage indisponible */ }
  updateRateTotal();
});

/* ---------------- Tutoriel (passable) ---------------- */

// Étapes : élément ciblé + clé de traduction (titre = .t, texte = .p)
const TOURS = {
  intro: [['#drop', 'tour.drop'], ['#tourBtn', 'tour.help']],
  results: [['#stats', 'tour.stats'], ['#target', 'tour.target'], ['#report', 'tour.report'], ['.actions', 'tour.export']],
};

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ } },
};

let tour = null;

function startTour(name, force) {
  if (!force && store.get('shortt_tour_' + name)) return;
  const steps = TOURS[name].map(([el, key]) => ({ el, key }))
    .filter((s) => { const el = $(s.el); return el && el.offsetParent !== null; });
  if (!steps.length) return;
  endTour(false);

  const layer = document.createElement('div');
  layer.className = 'tour';
  layer.innerHTML = `<div class="tour-hole"></div>
    <div class="tour-box" role="dialog" aria-live="polite">
      <div class="tour-head"><b class="tour-title"></b><span class="tour-count"></span></div>
      <p class="tour-text"></p>
      <div class="tour-btns">
        <button class="tour-skip"></button>
        <span><button class="btn btn-ghost btn-small tour-prev"></button>
        <button class="btn btn-small tour-next"></button></span>
      </div>
    </div>`;
  document.body.appendChild(layer);
  tour = { name, steps, i: 0, layer };

  layer.querySelector('.tour-skip').onclick = () => endTour(true);
  layer.querySelector('.tour-prev').onclick = () => showStep(tour.i - 1);
  layer.querySelector('.tour-next').onclick = () => (tour.i >= tour.steps.length - 1 ? endTour(true) : showStep(tour.i + 1));
  showStep(0);
}

function showStep(i) {
  if (!tour || i < 0) return;
  tour.i = i;
  const s = tour.steps[i];
  const L = tour.layer;
  drawStep();
  $(s.el).scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(placeTour, 400);
  placeTour();
}

function drawStep() {
  if (!tour) return;
  const { i, steps, layer: L } = tour;
  L.querySelector('.tour-title').textContent = t(steps[i].key + '.t');
  L.querySelector('.tour-text').textContent = t(steps[i].key + '.p');
  L.querySelector('.tour-count').textContent = `${i + 1} / ${steps.length}`;
  L.querySelector('.tour-skip').textContent = t('tour.skip');
  L.querySelector('.tour-prev').textContent = t('tour.back');
  L.querySelector('.tour-prev').style.visibility = i ? 'visible' : 'hidden';
  L.querySelector('.tour-next').textContent = t(i === steps.length - 1 ? 'tour.finish' : 'tour.next');
}

function placeTour() {
  if (!tour) return;
  const el = $(tour.steps[tour.i].el);
  const r = el.getBoundingClientRect();
  const pad = 8;
  const hole = tour.layer.querySelector('.tour-hole');
  Object.assign(hole.style, { top: r.top - pad + 'px', left: r.left - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px' });

  const box = tour.layer.querySelector('.tour-box');
  const bw = Math.min(340, window.innerWidth - 32);
  const bh = box.offsetHeight;
  let top = r.bottom + pad + 12;
  if (top + bh > window.innerHeight - 16) top = Math.max(16, r.top - pad - 12 - bh);
  const left = Math.max(16, Math.min(r.left, window.innerWidth - bw - 16));
  Object.assign(box.style, { top: top + 'px', left: left + 'px', width: bw + 'px' });
}

function endTour(remember) {
  if (!tour) return;
  if (remember) store.set('shortt_tour_' + tour.name, '1');
  tour.layer.remove();
  tour = null;
}

window.addEventListener('resize', placeTour);
window.addEventListener('scroll', placeTour, { passive: true });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') endTour(true); });
$('#tourBtn').addEventListener('click', () => startTour($('#results').hidden ? 'intro' : 'results', true));
window.addEventListener('load', () => setTimeout(() => startTour('intro'), 500));

// Changement de langue (bouton FR / EN de la barre) : on retraduit ce qui est généré
document.addEventListener('langchange', () => {
  drawProgress();
  targetSelect.refresh();
  if (DATA) { renderStats(); render(); }
  drawStep();
  placeTour();
});
