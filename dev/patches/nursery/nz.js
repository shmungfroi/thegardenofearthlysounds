/* ---------- The Nursery: The Branches and the Fruits (guided journeys, 26 Nov 2026) ----------
   One journey for now: Sonata · Follow the growth (window.NURSERY.sonata, made from the checked text by convert.py).
   Nothing is drawn and nothing in the Garden behaves differently while no journey is open: NZS is null (or not yet set),
   and every hook placed in the Garden's own code tests it first. Notes, level, chosen name and place are kept in
   localStorage 'garden.nursery'. No sound: every recording is a link that opens in a new tab. */
var NZS = null;
const NZJ = window.NURSERY && window.NURSERY.sonata, NZK = 'garden.nursery', NZ_ADDR = 'shmungfroi@gmail.com', NZ_NAMEMAX = 49;
const NZ_NSW = 'For teachers in New South Wales: Seed is Stage 4, Shoot is Stage 5 and Bloom is Stage 6.';      /* confirmed by Justin, 26 Nov */
const NZLV = {4: 'Seed', 5: 'Shoot', 6: 'Bloom'}, NZLVS = [4, 5, 6];
const NZ_SEED = 'M6 1.2c1.9 0 3.1 1.2 3.1 2.6S7.9 6.3 6 6.3 2.9 5.2 2.9 3.8 4.1 1.2 6 1.2zM6 6.3v6.4M6 8.6c-1 .5-2 1.6-2.7 3.3M6 8.6c1 .5 2 1.6 2.7 3.3M6 10.4c-.7.4-1.2 1.1-1.5 2.1M6 10.4c.7.4 1.2 1.1 1.5 2.1';      /* a seed with its first roots, 12 x 13 */

/* ---- what is kept in this browser ---- */
const NZ = (() => { const o = LS(NZK, {}), S = {v: 2, lv: 5, name: '', at: {}, notes: {}};
  if (!o || typeof o !== 'object' || Array.isArray(o)) return S;
  const lv = +(o.lv || o.level || o.stage); if (NZLVS.includes(lv)) S.lv = lv;
  S.name = S60(o.name, NZ_NAMEMAX);
  const at = o.at && typeof o.at === 'object' ? o.at.sonata : o.place; if (at === 'overview' || at === 'learned' || [0, 1, 2, 3].includes(at)) S.at.sonata = at;
  const src = o.notes && typeof o.notes === 'object' ? (o.notes.sonata && typeof o.notes.sonata === 'object' ? o.notes.sonata : o.notes) : {}, out = {};
  if (NZJ) NZJ.stops.forEach((st, i) => { const k = i ? String(i) : 'root', v = src[k] != null ? src[k] : src[i];
    if (typeof v === 'string') { const core = st.works.find(w => w.core) || st.works[0]; if (v.trim()) out[k] = {[core.id]: v.slice(0, 280)}; }      /* an earlier build kept one note per chapter: it now belongs to the chapter's core work */
    else if (v && typeof v === 'object') st.works.forEach(w => { if (typeof v[w.id] === 'string' && v[w.id]) (out[k] = out[k] || {})[w.id] = v[w.id].slice(0, 280); }); });
  S.notes.sonata = out; return S; })();
const nzSave = () => LSset(NZK, NZ);
const nzKey = i => i === 0 ? 'root' : String(i);
const nzLabel = i => i === 0 ? 'Root' : 'Chapter ' + i;
const nzNote = (i, w) => ((NZ.notes.sonata || {})[nzKey(i)] || {})[w] || '';
function nzSetNote(i, w, v) { const n = NZ.notes.sonata = NZ.notes.sonata || {}, k = nzKey(i); n[k] = n[k] || {}; if (v) n[k][w] = v.slice(0, 280); else delete n[k][w]; if (!Object.keys(n[k]).length) delete n[k]; nzSave(); }
const nzIn = (arr, lv) => (arr || []).filter(x => x.lv.includes(lv));
const nzWorks = (i, lv) => NZJ.stops[i].works.filter(w => w.lv.includes(lv));
const nzHasNote = (i, lv) => nzWorks(i, lv).some(w => nzNote(i, w.id).trim());
const nzIsCh = at => typeof at === 'number';
const nzSur = w => w.composer.split(' ').pop();
const nzHd = t => String(t).replace(/\.$/, '');      /* the text's bold headings end in a full stop; as headings they are set without it */

/* ---- text: **term** opens the Garden's own definition, *title* is set in italics ---- */
function nzRich(parent, text) {
  String(text || '').split('**').forEach((part, i) => { if (!part) return;
    if (i % 2) { const key = GC.glossKey && GC.glossKey(part); if (key) { let host = parent; const last = parent.lastChild;      /* an opening bracket or quote never waits alone at a line end */
      if (last && last.nodeType === 3 && /[(“"‘]$/.test(last.data)) { const ch = last.data.slice(-1); last.data = last.data.slice(0, -1); host = el('span', 'nz-nb', parent); host.append(ch); }
      const b = el('button', 'kw', host, part); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.onclick = () => GC.gloss(b, key, panel); } else el('b', '', parent, part); return; }
    part.split('*').forEach((q, j) => { if (!q) return; if (j % 2) el('em', '', parent, q); else parent.append(q); }); });
  return parent; }
const nzP = (parent, cls, text) => nzRich(el('p', cls, parent), text);
function nzFruitMark(parent, core) { const s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('viewBox', '0 0 12 12'); s.setAttribute('class', 'nz-fm'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = core ? '<circle cx="6" cy="6" r="4.2" fill="#f0d48a"/>' : '<circle cx="6" cy="6" r="3.7" fill="none" stroke="#f0d48a" stroke-width="1.4"/>'; parent.appendChild(s); return s; }
function nzSeed(parent, cls) { const s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('viewBox', '0 0 12 14'); s.setAttribute('class', cls || 'nz-seed'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = `<path d="${NZ_SEED}" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>`; parent.appendChild(s); return s; }

/* ---- the level switch: Seed / Shoot / Bloom (links keep stage=4/5/6) ---- */
function nzLevels(parent, onPick) { const box = el('div', 'nz-lv', parent); box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Level'); el('span', '', box, 'Level');
  NZLVS.forEach(lv => { const b = el('button', '', box, NZLV[lv]); b.type = 'button'; b.setAttribute('aria-pressed', (NZS ? NZS.lv : NZ.lv) === lv ? 'true' : 'false');
    b.title = {4: 'Seed: hear it and respond, in simple words', 5: 'Shoot: the elements and their context', 6: 'Bloom: analysis and evaluation'}[lv];
    b.onclick = () => { NZ.lv = lv; nzSave(); if (NZS) NZS.lv = lv; box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); onPick && onPick(lv); }; });
  return box; }

/* ---- the Journeys tab: a jump link at the top, the Nursery at the foot ---- */
function nzJump(sh) { if (!NZJ) return; const b = el('button', 'nz-jump', sh, 'The Nursery ↓'); b.type = 'button'; b.title = 'Go to the Nursery, at the foot of this tab';
  b.onclick = () => { const h = sh.querySelector('.nz-h'); if (!h) return; sh.scrollTo({top: Math.max(0, h.parentNode.offsetTop - 8), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); h.focus({preventScroll: true}); }; }
function nzSection(sh) { if (!NZJ) return; const S = el('section', 'nz-sec', sh); S.setAttribute('aria-labelledby', 'nz-h');
  const h = el('h3', 'nz-h', S, NZJ.nursery.toUpperCase()); h.id = 'nz-h'; h.tabIndex = -1;
  el('p', 'nz-tag', S, NZJ.tagline);
  el('div', 'nz-feat', S, 'The Branches and the Fruits');
  const m = NZJ.meta.split(' · '), c = el('div', 'nz-card', S), tt = el('div', 'nz-tt', c);
  el('b', '', tt, m[0]); el('span', '', tt, m[1]); const lab = el('span', 'nz-lab ok', tt, NZJ.label); lab.title = 'Checked: written and fact-checked';
  el('div', 'nz-meta', c, [m[2], m[4]].join(' · '));
  const row = el('div', 'nz-row', c); nzLevels(row);
  const at = NZ.at.sonata, go = el('button', 'nz-go', row, at != null && at !== 'overview' ? 'Go on ›' : 'Begin ›'); go.type = 'button';
  if (at != null && at !== 'overview') go.title = 'Go on where you left off: ' + (at === 'learned' ? 'What I learned' : nzLabel(at));
  go.setAttribute('aria-label', (at != null && at !== 'overview' ? 'Go on with ' : 'Begin ') + m[0] + ', ' + m[1]);
  go.onclick = () => nzBegin(null);
  const g = el('div', 'nz-grow', S); el('span', '', g, '＋ Grow your own (type an idea)'); el('small', '', g, ' · coming soon');
  const k = el('div', 'nz-key', S); [['ok', NZJ.label, 'written and fact-checked'], ['grow', 'Growing', 'built from data or contributions']].forEach(([c2, t, d]) => { const p = el('p', '', k); el('span', 'nz-lab ' + c2, p, t); p.append(' ' + d); }); }

/* ---- open, step, leave ---- */
function nzBegin(at) { if (!NZJ) return;
  if (NZS) return nzShow(at == null ? 'overview' : at);
  const pan = document.body.classList.contains('pan');
  const snap = {fams: [...document.querySelectorAll('#fams .fam')].map(f => f.className), focus: document.activeElement, hid: NZJ.stops.map(st => !!(NODE[st.lan] && NODE[st.lan].classList.contains('hid'))), svgCls: svg.getAttribute('class'), hint: $('#hint').style.display, view: {...view}, curFam, curEra, nav, sel, spot, tkey, ekey, pan, ps: panel.scrollTop,
    sheet: sheet.classList.contains('open') ? {kind: sheet.dataset.kind, top: sheet.scrollTop} : null, walk: walking ? {j: walking.j, i: walking.i, shared: walking.shared} : null};
  closeSheet(); quitWalk(); clearTrace(); clearThread(); clearEvent(); hidePill(); commonsNote(false); tip.style.display = 'none'; sel = null; spot = null;
  NZS = {lv: NZ.lv, at: null, snap};
  panel.classList.add('nz-read'); document.body.classList.add('pan', 'nzon'); measure(); clamp(view);
  nzMapOn(); nzShow(at == null ? 'overview' : at, true); }
function nzShow(at, first) { if (!NZS) return; const prev = NZS.at; NZS.at = at; if (at !== 'overview') { NZ.at.sonata = at; nzSave(); }
  nzRender(); nzLight(); nzThreadState(first ? null : prev, at); nzFrame();
  say(at === 'overview' ? 'Sonata, Follow the growth. The start of the journey.' : at === 'learned' ? 'What I learned.' : `${nzLabel(at)}: ${NZJ.stops[at].name}.`); }
function nzBack() { if (!NZS) return false;
  const g = panel.querySelector('.gdef'); if (g) { g.remove(); panel.querySelectorAll('button.kw[aria-expanded=true]').forEach(x => { x.setAttribute('aria-expanded', 'false'); x.focus(); }); return true; }
  if (NZS.at === 'overview') nzEnd(true); else nzShow('overview'); return true; }
function nzEnd(restore) { if (!NZS) return; const S = NZS; NZS = null; clearTimeout(nzT);
  nzMapOff(); panel.classList.remove('nz-read'); document.body.classList.remove('nzon'); if (nav === 3) nav = null;
  if (!restore) { light(null); return; }
  const s = S.snap; panel.innerHTML = ''; document.body.classList.remove('pan'); measure(); clamp(view);
  if (s.walk) walkJourney(s.walk.j, s.walk.i, s.walk.shared);
  else if (s.sel && N[s.sel]) choose(s.sel, false);
  else if (s.tkey && VOICES[s.tkey]) showThread(s.tkey, !s.pan);
  else if (s.ekey && EVENTS[s.ekey]) showEvent(s.ekey, !s.pan);
  else if (s.spot && N[s.spot]) pin(s.spot);
  else light(null);
  cancelAnimationFrame(anim); measure(); Object.assign(view, s.view); curFam = s.curFam; curEra = s.curEra; nav = s.nav; apply();
  if (s.pan) panel.scrollTop = s.ps;
  NZJ.stops.forEach((st, i) => NODE[st.lan] && NODE[st.lan].classList.toggle('hid', s.hid[i]));
  const cl = svg.getAttribute('class') || ''; if (s.svgCls != null && cl.split(' ').sort().join(' ') === s.svgCls.split(' ').sort().join(' ')) svg.setAttribute('class', s.svgCls); $('#hint').style.display = s.hint;
  if (s.sheet) { const b = document.querySelector(`.rail button[data-sheet="${s.sheet.kind}"]`); if (b) { openSheet(s.sheet.kind, b); sheet.scrollTop = s.sheet.top; } }
  const f = s.focus; if (f && f !== document.body && document.contains(f)) f.focus({preventScroll: true});      /* focus goes back to what opened the journey */
  else if (f && f.classList && (f.classList.contains('nz-go') || f.classList.contains('nz-jump'))) { const g = sheet.querySelector('.' + (f.classList.contains('nz-go') ? 'nz-go' : 'nz-jump')); if (g) g.focus({preventScroll: true}); }
  setTimeout(() => { if (NZS) return; chrome(); document.querySelectorAll('#fams .fam').forEach((f, i) => { if (f.style.display === 'none' && s.fams[i] != null) f.className = s.fams[i]; }); }, 350);      /* the spire strip is measured once more after the panel has gone; a label out of sight keeps the form it had */
  say('The journey is closed. The Garden is as it was.'); }
function nzLight() { if (!NZS) return; svg.classList.add('focus');
  document.querySelectorAll('#map .on,#map .me').forEach(x => { x.classList.remove('on', 'me', 'fade'); if (x.classList.contains('fm')) x.removeAttribute('transform'); });
  const cur = nzIsCh(NZS.at) ? NZJ.stops[NZS.at].lan : null; NZJ.stops.forEach(s => { const g = NODE[s.lan]; if (g) g.classList.add(s.lan === cur ? 'me' : 'on'); });
  drawReach(null); hits(); apply(); }
function nzLanClick(id) { if (!NZS) return false; const i = NZJ.stops.findIndex(s => s.lan === id); if (i < 0) return false; if (NZS.at !== i) nzShow(i); return true; }
function nzHash() { const a = NZS.at; return 'nursery=sonata&stage=' + NZS.lv + (a === 'overview' ? '' : '&ch=' + (a === 0 ? 'root' : a)); }
function nzFromHash(Q) { if (Q.nursery !== 'sonata' || !NZJ) return false; const lv = +Q.stage; if (NZLVS.includes(lv)) { NZ.lv = lv; if (NZS) NZS.lv = lv; }
  const c = Q.ch, at = c == null || c === '' ? 'overview' : c === 'root' ? 0 : c === 'learned' ? 'learned' : ['1', '2', '3'].includes(c) ? +c : 'overview';
  if (NZS) { nzShow(at); return true; } nzBegin(at); return true; }
function nzCrumbLan() { return NZS && nav === 3 && nzIsCh(NZS.at) ? NZJ.stops[NZS.at].lan : null; }

/* ---- the reader, in the side panel (on a phone, the lower sheet) ---- */
function nzRender() { const at = NZS.at, lv = NZS.lv, P = panel; P.innerHTML = ''; P.scrollTop = 0;
  const x = el('button', 'x', P, '×'); x.type = 'button'; x.setAttribute('aria-label', 'Leave the journey'); x.title = 'Leave the journey (the Garden returns as it was)'; x.onclick = () => nzEnd(true);
  const bar = el('div', 'nz-lvbar', P); nzLevels(bar, () => { const st = P.scrollTop; nzRender(); P.scrollTop = st; nzLight(); nzSolve(); });
  const k = el('div', 'k', P); k.append(NZJ.nursery + ' · '); el('span', 'nz-ok', k, NZJ.label);
  const h1 = el('h1', 'jr-jt', P, NZJ.meta.split(' · ')[0]); el('small', '', h1, NZJ.meta.split(' · ')[1]);
  el('div', 'lin', P, NZJ.meta.split(' · ')[2] + ' · ' + NZJ.meta.split(' · ')[4]);
  const dots = el('div', 'jr-dots nz-dots', P); dots.setAttribute('role', 'navigation'); dots.setAttribute('aria-label', 'The stops of this journey');
  NZJ.stops.forEach((s, i) => { const d = el('button', at === i ? 'cur' : '', dots); d.type = 'button'; if (i === 0) nzSeed(d); else d.append(String(i));
    d.setAttribute('aria-label', `${nzLabel(i)}: ${s.name}`); d.title = `${nzLabel(i)} · ${s.year} · ${s.name}`; if (at === i) d.setAttribute('aria-current', 'step'); d.onclick = () => nzShow(i); });
  const dl = el('button', at === 'learned' ? 'cur' : '', dots, '✦'); dl.type = 'button'; dl.setAttribute('aria-label', 'What I learned'); dl.title = 'What I learned'; if (at === 'learned') dl.setAttribute('aria-current', 'step'); dl.onclick = () => nzShow('learned');
  if (at === 'overview') nzOverview(P, lv); else if (at === 'learned') nzLearned(P, lv); else nzChapter(P, at, lv);
  const ft = el('div', 'jr-act nz-foot', P), lv2 = el('button', 'jr-b', ft, 'Leave the journey'); lv2.type = 'button'; lv2.onclick = () => nzEnd(true);
  el('p', 'jr-small', P, 'Your notes are saved as you type, in this browser only.');
  setTimeout(() => { const h = P.querySelector('.nz-focus'); if (h && NZS && (!document.activeElement || document.activeElement === document.body || P.contains(document.activeElement))) { h.tabIndex = -1; h.focus({preventScroll: true}); } }, 60); }
function nzGo(parent, label, fn, gold) { const b = el('button', 'jr-b' + (gold ? ' gold' : ''), parent, label); b.type = 'button'; b.onclick = fn; return b; }
function nzOverview(P, lv) {
  el('h2', 'jr-stopname nz-focus', P, 'The start');
  el('h4', '', P, NZJ.bigHead); nzP(P, 'jr-q nz-big', NZJ.big);
  el('h4', '', P, NZJ.todayHead); nzP(P, '', NZJ.today);
  el('h4', '', P, 'The stops'); const ol = el('ol', 'nz-stops', P), here = NZ.at.sonata;
  NZJ.stops.forEach((s, i) => { const li = el('li', '', ol), b = el('button', 'nz-stop', li); b.type = 'button';
    const m = el('span', 'nz-sm', b); if (i === 0) nzSeed(m); else m.textContent = String(i);
    const t = el('span', 'nz-st', b); el('small', '', t, `${nzLabel(i)} · ${s.year}`); el('span', '', t, s.name); el('em', '', t, 'the lantern: ' + s.lanDate);
    const nw = nzWorks(i, lv).length; el('i', 'nz-nw', b, nw + (nw === 1 ? ' work' : ' works')); if (i === 3) el('i', 'nz-leap', b, 'a leap');
    b.onclick = () => nzShow(i); });
  { const li = el('li', '', ol), b = el('button', 'nz-stop', li); b.type = 'button'; el('span', 'nz-sm', b, '✦'); const t = el('span', 'nz-st', b); el('small', '', t, 'At the end'); el('span', '', t, NZJ.learned.head); b.onclick = () => nzShow('learned'); }
  const nv = el('div', 'jr-nav', P);
  if (nzIsCh(here) || here === 'learned') { nzGo(nv, 'Begin again', () => nzShow(0)); nzGo(nv, here === 'learned' ? 'Go on: ' + NZJ.learned.head + ' ›' : here === 0 ? 'Go on at the root ›' : `Go on with chapter ${here} ›`, () => nzShow(here), true);
    const li = ol.children[here === 'learned' ? 4 : here]; if (li) el('span', 'nz-here', li.firstChild, 'you are here'); }
  else { el('span', '', nv); nzGo(nv, 'Begin ›', () => nzShow(0), true); }
  const d = el('details', 'nz-t', P); el('summary', '', d, NZJ.levelsHead); const tb = el('table', 'nz-tb', d);
  NZJ.levelsTable.forEach((r, i) => { const tr = el('tr', '', tb); r.forEach(c => el(i ? 'td' : 'th', '', tr, c)); }); nzP(d, 'nz-small', NZJ.levelsCore);
  if (NZ_NSW) { const t = el('details', 'nz-t', P); el('summary', '', t, 'For teachers'); el('div', 'tnote', t, NZ_NSW); } }
function nzBox(parent, head, items) { if (!items.length) return; el('small', 'nz-k', parent, head); const b = el('div', 'research nz-qbox', parent); el('small', '', b, 'a question for you'); items.forEach(x => nzP(b, '', x.t)); }
function nzTeach(parent, text) { if (!text) return; const d = el('details', 'nz-t', parent); el('summary', '', d, 'For teachers'); nzP(el('div', 'tnote', d), '', text); }
function nzChapter(P, i, lv) { const S = NZJ.stops[i], n = N[S.lan] || {}, f = famOf(S.lan);
  el('div', 'nz-cap', P, `${nzLabel(i)} · ${S.year}`);
  const h2 = el('h2', 'jr-stopname nz-focus', P, S.name);
  const ln = el('div', 'lin nz-lin', P); ln.append('the lantern: ' + S.lanDate + ' · '); const sp = el('span', 'nz-spire', ln, FT(f)); sp.style.color = FC(f); sp.style.borderColor = FC(f); ln.append(' · ' + ERANAME(n.period) + ' storey');
  const oc = el('button', 'jr-b nz-card-b', P, 'Open its card'); oc.type = 'button'; oc.title = 'Open the lantern card (you can come back to this chapter)'; oc.onclick = () => choose(S.lan, true);
  if (S.lead) { const p = el('p', 'nz-lead', P); el('b', '', p, S.lead); }
  nzIn(S.intro, lv).forEach(x => { const q = el('p', 'nz-intro', P); if (x.label) el('span', 'nz-lvl', q, x.label + ': '); nzRich(q, x.t); });
  el('h4', '', P, nzHd(S.meansHead)); nzIn(S.means, lv).forEach(x => nzP(P, '', x.t));
  el('h4', '', P, nzHd(S.changedHead)); nzIn(S.changed, lv).forEach(x => { if (x.scope) el('p', 'nz-scope', P, x.scope); nzP(P, '', x.t); });
  const ws = nzWorks(i, lv); const wh = el('h4', '', P, ws.length === 1 ? 'The work' : 'The works · ' + ws.length);
  if (ws.some(w => !w.core)) { const key = el('span', 'nz-wkey', wh); nzFruitMark(key, true); key.append('core '); nzFruitMark(key, false); key.append('added at ' + NZLV[Math.min(...ws.filter(w => !w.core).map(w => Math.min(...w.lv)))]); }
  ws.forEach(w => nzWork(P, i, w, lv));
  if (S.words.length) { el('h4', '', P, 'New words'); const ch = el('div', 'chips nz-words', P); S.words.forEach(t => { const key = GC.glossKey && GC.glossKey(t), b = el('button', '', ch, t); b.type = 'button'; if (key) { b.setAttribute('aria-expanded', 'false'); b.className = 'kw-chip'; b.onclick = () => GC.gloss(b, key, panel); } }); }
  nzBox(P, 'Check question', nzIn(S.check, lv));
  nzBox(P, 'Find out by listening', nzIn(S.find, lv));
  nzTeach(P, S.teachers);
  nzSend(P, i, lv);
  const nv = el('div', 'jr-nav', P);
  nzGo(nv, i === 0 ? '‹ The start' : '‹ ' + nzLabel(i - 1), () => nzShow(i === 0 ? 'overview' : i - 1));
  nzGo(nv, i === 3 ? NZJ.learned.head + ' ›' : nzLabel(i + 1) + (i + 1 === 3 ? ' · a leap' : '') + ' ›', () => nzShow(i === 3 ? 'learned' : i + 1), true); }
function nzWork(P, i, w, lv) { const W = el('div', 'nz-work', P); W.dataset.w = w.id; W.id = 'nzw-' + w.id;
  const hd = el('div', 'nz-wh', W); nzFruitMark(hd, w.core).setAttribute('aria-hidden', 'true'); const tt = el('div', 'nz-wt', hd); el('span', 'pg-y', tt, w.year); nzRich(el('span', 'nz-ti', tt), w.title);
  el('div', 'nz-by', tt, w.composer + (w.core ? ' · core work' : ' · added at ' + NZLV[Math.min(...w.lv)]));
  (w.pre || []).forEach(t => nzP(W, 'nz-pre', t));
  const ls = nzIn(w.listen, lv); if (ls.length) { el('small', 'nz-k', W, 'Listen for'); const ul = el('ul', 'nz-cues', W); ls.forEach(c => { const li = el('li', '', ul); nzRich(li, c.t); if (c.el) { const g = el('span', 'gel', li); el('i', '', g, c.el); } }); }
  nzBox(W, 'Find out by listening', nzIn(w.find, lv));
  if (w.url) { const a = el('div', 'acts nz-rec', W), l = el('a', '', a, 'Listen ↗'); l.href = w.url; l.target = '_blank'; l.rel = 'noopener'; l.setAttribute('aria-label', `Listen: ${w.composer}, ${w.title.replace(/\*/g, '')} (opens in a new tab)`); if (w.perf) el('span', 'nz-perf', a, w.perf); }
  nzTeach(W, w.teachers);
  const lab = el('label', 'nz-nl', W); el('span', 'nz-k me', lab, 'My note · ' + nzSur(w));
  const ta = quiet(el('textarea', 'nz-note', lab)); ta.maxLength = 280; ta.rows = 3; ta.value = nzNote(i, w.id); ta.placeholder = 'What did you hear? Say it in your own words.'; ta.dataset.w = w.id;
  ta.setAttribute('aria-label', `My note on ${w.composer}, ${w.title.replace(/\*/g, '')}. 280 characters at most`);
  const cnt = el('div', 'jr-cnt', W, `${ta.value.length} / 280`); cnt.setAttribute('aria-live', 'polite');
  ta.oninput = () => { if (ta.value.length > 280) ta.value = ta.value.slice(0, 280); cnt.textContent = `${ta.value.length} / 280`; nzSetNote(i, w.id, ta.value); nzSendState(); };
  ta.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); ta.blur(); } });
  if (w.notice && w.notice.lv.includes(lv)) { const p = el('p', 'nz-notice', W); el('em', '', p, 'Notice: '); nzRich(p, w.notice.t); }
  W.onmouseenter = () => nzHot(w.id, true); W.onmouseleave = () => nzHot(w.id, false); }
function nzHot(id, on) { document.querySelectorAll(`#nzmk .nz-fr[data-w="${id}"]`).forEach(g => g.classList.toggle('hot', on)); }

/* ---- Send it to the Garden: an e-mail with this chapter's notes, each labelled with its work ---- */
function nzSend(P, i, lv) { const S = NZJ.stops[i], box = el('section', 'nz-send', P); box.setAttribute('aria-label', 'Send it to the Garden');
  el('h4', '', box, 'Send it to the Garden');
  const line = S.send.split(NZ_ADDR); const p = el('p', 'nz-to', box); p.append(line[0]); el('span', 'nz-addr', p, NZ_ADDR); if (line[1]) p.append(line[1]);
  const fl = el('label', 'jr-f', box); el('span', '', fl, 'Your chosen name'); const nm = quiet(el('input', 'jr-by nz-name', fl)); nm.maxLength = NZ_NAMEMAX; nm.value = NZ.name; nm.placeholder = 'First name and initial, or a pen name'; nm.autocomplete = 'off';
  nm.oninput = () => { NZ.name = nm.value.slice(0, NZ_NAMEMAX); nzSave(); }; nm.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); nm.blur(); } });
  const ck = el('label', 'jr-chk', box), cb = el('input', 'nz-agree', ck); cb.type = 'checkbox'; ck.append(' I agree to this name being shown with my finding');
  const b = el('button', 'jr-b gold nz-sendb', box, 'Send it to the Garden'); b.type = 'button';
  b.onclick = () => { if (!nzHasNote(i, NZS.lv)) { toast('Write your note first, then send it.', 3000); say('Write your note first, then send it.'); const t = panel.querySelector('textarea.nz-note'); if (t) { t.focus({preventScroll: true}); t.scrollIntoView({block: 'center'}); } return; }
    const url = nzMail(i, NZS.lv, cb.checked ? nm.value.trim() : ''); window.__nzMail = url;
    toast(`Your e-mail should open now. If it does not, write to <b>${NZ_ADDR}</b> and paste in your notes.`, 6000); say('Your e-mail should open now.');
    const a = document.createElement('a'); a.href = url; a.rel = 'noopener'; document.body.appendChild(a); try { a.click(); } catch (err) {} a.remove(); };
  el('p', 'jr-small nz-fine', box, `If no e-mail opens, write to ${NZ_ADDR} and paste in your notes. Nothing you send appears in the Garden until Justin has approved it and it has been checked.`);
  nzSendState(); }
function nzSendState() { const b = panel.querySelector('.nz-sendb'); if (!b || !NZS || !nzIsCh(NZS.at)) return; const ok = nzHasNote(NZS.at, NZS.lv);
  if (ok) { b.removeAttribute('aria-disabled'); b.title = 'Opens an e-mail with your notes from this chapter'; } else { b.setAttribute('aria-disabled', 'true'); b.title = 'Write your note first, then send it'; }
  const m = panel.querySelector('.nz-dots button.cur'); if (m) m.classList.toggle('nz-noted', ok); }
function nzMail(i, lv, name) { const S = NZJ.stops[i], ch = nzIn(S.check, lv)[0], L = [];
  L.push('Journey: ' + NZJ.title, `${nzLabel(i)}: ${S.year} · ${S.name} (the lantern: ${S.lanDate})`, 'Level: ' + NZLV[lv]);
  if (ch) L.push('Check question: ' + ch.t.replace(/\*/g, ''));
  nzWorks(i, lv).forEach(w => { const t = nzNote(i, w.id).trim(); if (!t) return; L.push('', `My note on ${w.composer}, ${w.title.replace(/\*/g, '')} (${w.year}):`, t); });
  if (name) L.push('', 'Name to show (I agree to it being shown): ' + name);
  return 'mailto:' + NZ_ADDR + '?subject=' + encodeURIComponent('The Garden · ' + NZJ.meta.split(' · ').slice(0, 2).join(' · ') + ' · ' + nzLabel(i)) + '&body=' + encodeURIComponent(L.join('\n')); }

/* ---- What I learned ---- */
function nzLearned(P, lv) { const Lr = NZJ.learned;
  el('div', 'nz-cap', P, 'At the end'); el('h2', 'jr-stopname nz-focus', P, Lr.head);
  const ol = el('ol', 'nz-prompts', P); Lr.prompts.forEach((t, n) => { const li = el('li', '', ol), b = el('div', 'research nz-qbox', li); el('small', '', b, `${n + 1} · a question for you`); nzP(b, '', t); });
  nzTeach(P, Lr.teachers);
  el('h4', '', P, 'Your notes'); let any = false;
  NZJ.stops.forEach((S, i) => { const ws = S.works.filter(w => nzNote(i, w.id).trim()); const d = el('div', 'nz-mine', P); const h = el('button', 'nz-mh', d); h.type = 'button'; el('small', '', h, `${nzLabel(i)} · ${S.year}`); h.append(S.name); h.onclick = () => nzShow(i);
    if (!ws.length) { el('p', 'nz-none', d, 'No note yet.'); return; } any = true;
    ws.forEach(w => { const q = el('blockquote', 'jr-q nz-mq', d); el('cite', '', q, `${nzSur(w)} · ${w.year}`); q.append(nzNote(i, w.id).trim()); }); });
  if (!any) el('p', 'jr-small', P, 'Notes you write at each work gather here.');
  el('h4', '', P, NZJ.apply.head); el('p', 'nz-small', P, NZJ.apply.cjg); nzP(P, '', NZJ.apply.text);
  { const p = el('p', 'nz-small nz-keep', P); el('b', '', p, NZJ.keep.head); p.append(' ' + NZJ.keep.text); }
  const d = el('details', 'nz-t', P); el('summary', '', d, NZJ.sources.head); NZJ.sources.lines.forEach(t => nzP(d, 'nz-src', t));
  const nv = el('div', 'jr-nav', P); nzGo(nv, '‹ ' + nzLabel(3), () => nzShow(3)); nzGo(nv, 'Back to the start', () => nzShow('overview'), true); }

/* ---- the thread on the map: the Garden's own link curves, a gap for the leap, the walked part bright ---- */
const nzS = (t, a, par) => { const e = document.createElementNS(SVGNS, t); for (const k in a) e.setAttribute(k, a[k]); if (par) par.appendChild(e); return e; };
function nzMapOn() { const first = cam.querySelector(':scope > .fm');
  const veil = nzS('rect', {id: 'nzveil', x: B[0] - 600, y: B[1] - 600, width: B[2] - B[0] + 1200, height: B[3] - B[1] + 1200}); cam.insertBefore(veil, first);
  const g = nzS('g', {id: 'nzg'}); cam.insertBefore(g, first); const segs = [];
  for (let i = 0; i < NZJ.stops.length - 1; i++) { const a = NZJ.stops[i].lan, b = NZJ.stops[i + 1].lan, A = LAY.nodes[a], Bn = LAY.nodes[b];
    const lk = [...document.querySelectorAll('#map .lk')].find(q => (q.dataset.a === a && q.dataset.b === b) || (q.dataset.a === b && q.dataset.b === a));
    let d, fwd = true, leap = !lk;
    if (lk) { d = lk.getAttribute('d'); const p0 = lk.getPointAtLength(0); fwd = Math.hypot(p0.x - A.x, p0.y - A.y) <= Math.hypot(p0.x - Bn.x, p0.y - Bn.y); }
    else { const L = Math.hypot(Bn.x - A.x, Bn.y - A.y), bow = Math.min(18, L * .14); d = `M${A.x},${A.y} Q${(A.x + Bn.x) / 2 + (A.y - Bn.y) / L * bow},${(A.y + Bn.y) / 2 - Math.abs(Bn.x - A.x) / L * bow} ${Bn.x},${Bn.y}`; }
    const sg = nzS('g', {class: 'nz-seg' + (leap ? ' leap' : '')}, g), at = {d, pathLength: 100};
    const faint = nzS('path', {...at, class: 'nz-faint'}, sg), glow = nzS('path', {...at, class: 'nz-glow nz-dr'}, sg), line = nzS('path', {...at, class: 'nz-line nz-dr'}, sg);
    if (leap) [faint, glow, line].forEach(p => p.setAttribute('stroke-dasharray', '9 80 11'));
    else [glow, line].forEach(p => { p.setAttribute('stroke-dasharray', '100 100'); p.style.strokeDashoffset = fwd ? 100 : -100; });
    segs.push({sg, faint, glow, line, fwd, leap, i}); }
  NZJ.stops.forEach((s, i) => { const p = LAY.nodes[s.lan]; nzS('circle', {cx: p.x, cy: p.y, r: 2.4, class: 'nz-ring' + (i ? '' : ' first'), 'data-lan': s.lan}, g); NODE[s.lan] && NODE[s.lan].classList.add('nzt'); });
  const mk = nzS('g', {id: 'nzmk'}); svg.appendChild(mk);
  mk.addEventListener('click', e => { const t = e.target.closest('[data-go]'); if (!t || moved) return; e.stopPropagation(); const i = +t.dataset.go, w = t.dataset.w;
    if (NZS.at !== i) nzShow(i); if (w) setTimeout(() => { const W = document.getElementById('nzw-' + w); if (!W) return; W.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); W.classList.add('flash'); setTimeout(() => W.classList.remove('flash'), 1400); }, 80); });
  mk.addEventListener('mouseover', e => { const t = e.target.closest('.nz-fr'); if (t) { const W = document.getElementById('nzw-' + t.dataset.w); if (W) W.classList.add('hot'); } });
  mk.addEventListener('mouseout', e => { const t = e.target.closest('.nz-fr'); if (t) { const W = document.getElementById('nzw-' + t.dataset.w); if (W) W.classList.remove('hot'); } });
  NZS.map = {veil, g, mk, segs}; }
function nzMapOff() { document.querySelectorAll('#nzveil,#nzg,#nzmk').forEach(x => x.remove()); document.querySelectorAll('#map .fm.nzt').forEach(x => x.classList.remove('nzt', 'hid')); }      /* hid: the Garden's declutter may have hidden a thread lantern's name while the journey lit it, and never clears it */
function nzThreadState(prev, at) { const M = NZS.map; if (!M) return; const whole = at === 'overview' || at === 'learned', walk = i => whole || (nzIsCh(at) && i < at);
  const fade = prev == null || !nzIsCh(prev) || !nzIsCh(at), rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const set = () => M.segs.forEach(s => { const on = walk(s.i); s.sg.classList.toggle('on', on); if (!s.leap) [s.glow, s.line].forEach(p => { p.style.strokeDashoffset = on ? 0 : (s.fwd ? 100 : -100); }); });
  if (fade || rm) { M.segs.forEach(s => s.sg.classList.add('nz-now')); M.g.classList.add('nzfade'); svg.getBoundingClientRect(); set(); svg.getBoundingClientRect();
    setTimeout(() => { M.segs.forEach(s => s.sg.classList.remove('nz-now')); M.g.classList.remove('nzfade'); }, rm ? 0 : 30); }
  else set(); }

/* ---- framing: the chapter (with the stop before when names stay readable), or the whole thread ---- */
function nzSafe(dx, dy) { const R = svg.getBoundingClientRect(); let l = 0, t = 0, r = R.width, b = R.height; dx = dx || 1; dy = dy || 1;
  document.querySelectorAll('#fams .fam,.ladder,#lensbar>span,#foot,#trail,#hint').forEach(e => { if (!e.getClientRects().length) return; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .05) return;
    const q = e.getBoundingClientRect(), x0 = q.left - R.left, x1 = q.right - R.left, y0 = q.top - R.top, y1 = q.bottom - R.top; if (x1 <= l || x0 >= r || y1 <= t || y0 >= b) return;
    const fit = (w, h) => Math.min(w / dx, h / dy), c = [['t', fit(r - l, b - y1)], ['b', fit(r - l, y0 - t)], ['l', fit(r - x1, b - t)], ['r', fit(x0 - l, b - t)]].sort((u, v) => v[1] - u[1])[0][0];
    if (c === 't') t = y1; else if (c === 'b') b = y0; else if (c === 'l') l = x1; else r = x0; });
  return {l: l + 8, t: t + 8, r: r - 8, b: b - 8}; }
function nzFrame() { if (!NZS) return; measure(); const at = NZS.at, P = i => LAY.nodes[NZJ.stops[i].lan], phone = aw < 700; let k, cx, cy, pair = false;
  const ext = nzIsCh(at) ? (at > 0 && !phone ? [Math.abs(P(at).x - P(at - 1).x) + 250 / 3, Math.abs(P(at).y - P(at - 1).y) + 170 / 3] : [1, 1]) : [Math.max(...NZJ.stops.map((s, i) => P(i).x)) - Math.min(...NZJ.stops.map((s, i) => P(i).x)), Math.max(...NZJ.stops.map((s, i) => P(i).y)) - Math.min(...NZJ.stops.map((s, i) => P(i).y))];
  const S = nzSafe(ext[0], ext[1]), W = S.r - S.l, Hh = S.b - S.t; if (W < 40 || Hh < 40) { NZS.pending = false; return; }
  if (nzIsCh(at)) { const p = P(at), q = at > 0 ? P(at - 1) : null, mx = phone ? 70 : 125, my = phone ? 60 : 85;
    const kb = q ? Math.min((W - 2 * mx) / Math.max(1, Math.abs(p.x - q.x)), (Hh - 2 * my) / Math.max(1, Math.abs(p.y - q.y))) : 0;
    if (q && !phone && kb >= 2.4) { k = Math.min(kb, 4.2); cx = (p.x + q.x) / 2; cy = (p.y + q.y) / 2; pair = true; }
    else { k = phone ? 3.4 : 3.2; const nb = [at - 1, at + 1].filter(j => j >= 0 && j < NZJ.stops.length).map(P).filter(o => Math.abs(o.x - p.x) * k < W * .5 && Math.abs(o.y - p.y) * k < Hh * .45);      /* a near neighbour shares the frame */
      cx = nb.length ? (p.x + nb.reduce((a, o) => a + o.x, 0)) / (nb.length + 1) : p.x; cy = (nb.length ? (p.y + nb.reduce((a, o) => a + o.y, 0)) / (nb.length + 1) : p.y) + (phone ? 4 : 6); }
    curFam = famAt(p.x); curEra = eraOf(NZJ.stops[at].lan); }
  else { const xs = NZJ.stops.map((s, i) => P(i).x), ys = NZJ.stops.map((s, i) => P(i).y), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), mx = phone ? 40 : 90, my = phone ? 45 : 80;
    k = Math.min((W - 2 * mx) / (x1 - x0), (Hh - 2 * my) / (y1 - y0)); if (phone) k = Math.min(k, fitK * 2.65); cx = (x0 + x1) / 2; cy = (y0 + y1) / 2; curFam = curEra = null; }
  k = Math.max(KMIN(), Math.min(KMAX, k)); let ox = ((S.l + S.r) / 2 - aw / 2) / k, oy = ((S.t + S.b) / 2 - ah / 2) / k;
  const need = nzIsCh(at) ? (pair ? [at, at - 1] : [at]) : NZJ.stops.map((s, i) => i), m2 = phone ? 24 : 40;      /* the Garden's edges can stop the camera short: then come a little closer until the stops sit clear of the frame */
  for (let n = 0; n < 16; n++) { const v = clamp({k, tx: aw / 2 - (cx - ox) * k, ty: ah / 2 - (cy - oy) * k});
    if (need.every(i => { const p = P(i), x = v.tx + p.x * v.k, y = v.ty + p.y * v.k; return x > S.l + m2 && x < S.r - m2 && y > S.t + m2 && y < S.b - m2; })) break;
    k = Math.min(KMAX, k * 1.05); ox = ((S.l + S.r) / 2 - aw / 2) / k; oy = ((S.t + S.b) / 2 - ah / 2) / k; }
  /* a lantern is either well inside the frame, with room for its name, or out of sight: never a ring at the edge */
  const R = svg.getBoundingClientRect(), UIR = [...document.querySelectorAll('.ladder,#fams .fam,#lensbar>span,#foot,#trail,#hint')].filter(e => e.getClientRects().length && getComputedStyle(e).display !== 'none' && +getComputedStyle(e).opacity > .05).map(e => { const q = e.getBoundingClientRect(); return {l: q.left - R.left, t: q.top - R.top, r: q.right - R.left, b: q.bottom - R.top}; });
  let C = [cx - ox, cy - oy]; const at2 = c => { const v = clamp({k, tx: aw / 2 - c[0] * k, ty: ah / 2 - c[1] * k}); return NZJ.stops.map((st, i) => [v.tx + P(i).x * v.k, v.ty + P(i).y * v.k]); };
  const rr = 2.4 * k + 6, isIn = ([x, y]) => x > S.l + m2 && x < S.r - m2 && y > S.t + m2 && y < S.b - m2, isOut = ([x, y]) => x < -rr || x > aw + rr || y < -rr || y > ah + rr || UIR.some(u => x - rr > u.l && x + rr < u.r && y - rr > u.t && y + rr < u.b);
  for (let n = 0; n < 8; n++) { const pts = at2(C), j = pts.findIndex(q => !isIn(q) && !isOut(q)); if (j < 0) break; const [x, y] = pts[j], moves = [];
    if (x < S.l + m2) moves.push([S.l + m2 + 2 - x, 0]); if (x > S.r - m2) moves.push([S.r - m2 - 2 - x, 0]); if (y < S.t + m2) moves.push([0, S.t + m2 + 2 - y]); if (y > S.b - m2) moves.push([0, S.b - m2 - 2 - y]);
    moves.push([-(x + rr + 2), 0], [aw + rr + 2 - x, 0], [0, -(y + rr + 2)], [0, ah + rr + 2 - y]);
    const ok = moves.map(([dx, dy]) => [dx, dy, [C[0] - dx / k, C[1] - dy / k]]).filter(([, , c]) => { const q = at2(c); return need.every(i => isIn(q[i])) && (isIn(q[j]) || isOut(q[j])); }).sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]));
    if (!ok.length) break; C = ok[0][2]; }
  if (NZS.map) NZS.map.mk.classList.add('nzfade'); NZS.pending = true;
  flyTo(k, C[0], C[1]); nav = nzIsCh(at) ? 3 : 0; nzFrame.busy = true;
  clearTimeout(nzFrame.t); nzFrame.t = setTimeout(() => { nzFrame.busy = false; if (!NZS) return; nzSettle(); NZS.map && NZS.map.mk.classList.remove('nzfade'); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 20 : 700); }

/* ---- the marks: names, captions, fruits on stems, the root sign and the leap's words, placed so that none touches another,
   the thread, a lantern ring or a name of the Garden's, and none sits under the frame ---- */
let nzT = 0;
const nzScr = p => [view.tx + p.x * view.k, view.ty + p.y * view.k];
function nzOnApply() { if (!NZS || !NZS.map) return; nzPos(); clearTimeout(nzT); NZS.pending = true; nzT = setTimeout(nzSettle, 110); }
function nzSettle(n) { if (!NZS) return; n = n || 0;      /* wait until the Garden's names have finished fading in or out, so what is measured is what is seen */
  const busy = document.getAnimations ? document.getAnimations().some(a => a.playState === 'running' && a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#map') && !a.effect.target.closest('#nzg,#nzmk')) : false;
  if (busy && n < 8) { nzT = setTimeout(() => nzSettle(n + 1), 90); return; } nzSolve(); }
function nzPos() { const M = NZS.map; if (!M || !M.st) return; M.st.forEach((g, i) => { const [x, y] = nzScr(LAY.nodes[NZJ.stops[i].lan]); g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`); });
  if (M.lg && M.lm) { const [x, y] = nzScr(M.lm); M.lg.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`); } }
function nzObstacles(R) { const out = [], W = R.width, Hh = R.height;
  const vis = e => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > .05; };
  const add = (q, pad, tag) => { if (!q.width && !q.height) return; const r = {l: q.left - R.left - pad, t: q.top - R.top - pad, r: q.right - R.left + pad, b: q.bottom - R.top + pad, tag}; if (r.r < -30 || r.l > W + 30 || r.b < -30 || r.t > Hh + 30) return; out.push(r); };
  document.querySelectorAll('.ladder,.mm,#foot,#fams .fam,#lensbar>span,#hint,#trail,.gut,.rail,header.top,#eras .era,#evs .evd,#tmark,#sheet.open,#toast,#panel,#cpop.show').forEach(e => { if (e.getClientRects().length && vis(e)) add(e.getBoundingClientRect(), 3, 'ui'); });
  document.querySelectorAll('#map .fm').forEach(g => { const go = +getComputedStyle(g).opacity; if (go < .05) return; const own = g.classList.contains('nzt');
    if (!own) g.querySelectorAll('text').forEach(t => { const cs = getComputedStyle(t); if (cs.display === 'none' || go * +cs.opacity * +(cs.fillOpacity || 1) < .04) return; const q = t.getBoundingClientRect(); add(q, 2 + q.height * .12, 'name'); });
    const c = g.querySelector('circle'); if (c) add(c.getBoundingClientRect(), 2, own ? 'pt:' + g.dataset.id : 'pt'); });
  document.querySelectorAll('#lens circle,#lens .rt-b,#trailg .tr-b,#evlayer circle,#reachspots .spot,#stars .st,#thread circle').forEach(e => { if (vis(e)) add(e.getBoundingClientRect(), 1.5, 'mark'); });
  document.querySelectorAll('#stars .stn').forEach(t => { if (vis(t)) add(t.getBoundingClientRect(), 1.5, 'name'); });
  document.querySelectorAll('#nzg circle').forEach(c => add(c.getBoundingClientRect(), 1.5, 'pt:' + c.dataset.lan));
  return out; }
function nzThreadPts(R) { const pts = [], M = NZS.map; M.segs.forEach(s => { const p = s.line, L = p.getTotalLength(), n = Math.min(500, Math.max(8, Math.ceil(L * view.k / 2.5)));
    if (s.leap) { s.ef = Math.max(.03, Math.min(.12, 22 / (view.k * L))); const a = (s.ef * 100).toFixed(2), gap = (100 - 2 * s.ef * 100).toFixed(2); [s.faint, s.glow, s.line].forEach(q => q.setAttribute('stroke-dasharray', `${a} ${gap} ${a}`)); }
    for (let j = 0; j <= n; j++) { const u = j / n; if (s.leap && u > s.ef + .005 && u < 1 - s.ef - .005) continue; const q = p.getPointAtLength(L * u), [x, y] = nzScr(q); if (x < -10 || y < -10 || x > R.width + 10 || y > R.height + 10) continue; pts.push({l: x - 1.6, t: y - 1.6, r: x + 1.6, b: y + 1.6, tag: 'thread'}); } });
  return pts; }
const nzW = (() => { const c = {}; return (txt, cls) => { const k = cls + '|' + txt; if (c[k] != null) return c[k]; const t = nzS('text', {class: cls, x: -9999, y: -9999}, NZS.map.mk); t.textContent = txt; const w = t.getComputedTextLength(); t.remove(); return c[k] = w; }; })();
function nzSolve() { if (!NZS || !NZS.map) return; const R = svg.getBoundingClientRect(); if (R.width < 60 || R.height < 60 || !(view.k > .02)) return;
  nzPos(); const OB = nzObstacles(R), TP = nzThreadPts(R), BOX = {l: 3, t: 3, r: R.width - 3, b: R.height - 3};
  /* up to three tries: the chapter's core works first; its name first; its name first with the other stops' captions left off. The best keeps everything clear, then the current caption */
  const score = L => [L.forced.length, L.curCap ? 0 : 1, L.curCap ? 0 : L.capsOn, L.hidden.length, L.capsOff], better = (a, b) => { const x = score(a), y = score(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] < y[i]; return false; };
  let L = nzPlace(R, OB, TP, BOX, 0), best = 0;
  if (L.forced.length || !L.curCap) for (const m of [1, 2]) { const L2 = nzPlace(R, OB, TP, BOX, m); if (better(L2, L)) { L = L2; best = m; } }
  if (best !== 2 && (L.forced.length || !L.curCap || best === 1)) L = nzPlace(R, OB, TP, BOX, best);
  NZS.layout = {hidden: L.hidden, forced: L.forced, off: L.off, soft: L.soft, k: view.k}; NZS.pending = !!nzFrame.busy; NZS.dbg = {OB, TP, PL: L.PL, BOX, SP: L.SP}; }
/* one placement. mode 0: the chapter's core works first, then the names; mode 1: the names first */
function nzPlace(R, OB, TP, BOX, mode) { const M = NZS.map, mk = M.mk, at = NZS.at, lv = NZS.lv, cur = nzIsCh(at) ? at : -1, labels = cur >= 0 && view.k >= 2.3;
  mk.innerHTML = ''; M.st = []; M.lg = null; const PL = [], hidden = [], forced = [], off = [], soft = []; let curCap = true, capsOff = 0, capsOn = 0;
  const SP = NZJ.stops.map(s => nzScr(LAY.nodes[s.lan])), ALL = OB.concat(TP);
  const near = (x, y, rad) => ALL.filter(o => o.r > x - rad && o.l < x + rad && o.b > y - rad && o.t < y + rad);
  const ov = (a, o) => Math.max(0, Math.min(a.r, o.r) - Math.max(a.l, o.l)) * Math.max(0, Math.min(a.b, o.b) - Math.max(a.t, o.t));
  const GARDEN = o => o.tag === 'name' || o.tag === 'pt' || o.tag === 'mark';
  /* cost of a set of rects: [hard, soft]. Soft: the faint points of the Garden's other lanterns, and (isSoft) whatever the caller allows */
  const cost = (rs, lists, skip, isSoft) => { let h = 0, sf = 0; for (const r of rs) { if (r.l < BOX.l || r.t < BOX.t || r.r > BOX.r || r.b > BOX.b) return [1e9, 0];
      for (const Ls of lists) for (const o of Ls) { if (skip && skip(o)) continue; if (o.l < r.r + 1.5 && o.r > r.l - 1.5 && o.t < r.b + 1.5 && o.b > r.t - 1.5) { const a = ov(r, o) + 1; if (o.tag === 'pt' || (isSoft && isSoft(o))) sf += a; else h += o.tag === 'ui' ? a * 40 : a; } } } return [h, sf]; };
  const UI = OB.filter(o => o.tag === 'ui'), seen = i => { const [x, y] = SP[i]; return x > BOX.l + 4 && x < BOX.r - 4 && y > BOX.t + 4 && y < BOX.b - 4 && !UI.some(u => x > u.l && x < u.r && y > u.t && y < u.b); };
  const g0 = NZJ.stops.map((s, i) => { const g = nzS('g', {class: 'nz-st' + (i === cur ? ' cur' : '') + (cur >= 0 && i !== cur ? ' other' : '')}, mk); M.st.push(g); return g; }); nzPos();
  const leapSeg = M.segs.find(s => s.leap);
  /* stop names with their caption, in the Garden's own line breaks: never hidden */
  const nameBlock = (i, fs) => { const s = NZJ.stops[i], lines = [...(NODE[s.lan] ? NODE[s.lan].querySelectorAll('text') : [])].map(t => t.textContent.trim()).filter(Boolean), cap = `${i ? 'CHAPTER ' + i : 'ROOT'} · ${s.year}${at === 'learned' && s.works.some(w => nzNote(i, w.id).trim()) ? '  ✎ NOTE' : ''}`;
    if (fs === 'num') { const t = i ? String(i) : 'ROOT', w = nzW(t, 'nz-num') + 2; return {cap: '', lines: [t], w, h: 14, fs: 'num', lh: 12, top: 0, num: true}; }
    const nc = fs < 0, f2 = Math.abs(fs), w = Math.max(nc ? 0 : nzW(cap, 'nz-cap'), ...lines.map(t => nzW(t, 'nz-nm f' + f2))) + 2, lh = f2 + 2.5, top = nc ? 0 : 11; return {cap: nc ? '' : cap, lines, w, h: top + lines.length * lh + 2, fs: f2, lh, top}; };
  const placeName = i => { if (!seen(i)) { off.push('name:' + i); return; } const [px, py] = SP[i], lists = [near(px, py, 280), PL]; let best = null;
    const forms = mode === 2 && i !== cur ? [-11, -10, -9] : [11, 10, 9, -10, -9]; if (R.width < 320) forms.push('num');
    for (const fs of forms) { const B2 = nameBlock(i, fs), w = B2.w, h = B2.h, cand = [];
      [1, 1.6, 2.3, 3.2, 4.4, 5.8, 7.4].forEach(m => { const g = 6 * m; cand.push([-w / 2, -h - g, 'm'], [g + 2, -h / 2, 's'], [-w - g - 2, -h / 2, 'e'], [-w / 2, g + 1, 'm'], [g, -h - g * .6, 's'], [-w - g, -h - g * .6, 'e'], [g, g * .6, 's'], [-w - g, g * .6, 'e']); });
      for (const [dx, dy, al] of cand) { const r = {l: px + dx, t: py + dy, r: px + dx + w, b: py + dy + h}, [hd, sf] = cost([r], lists), key = hd * 1e4 + sf + (fs === 'num' ? 600 : (11 - Math.abs(fs)) * 30 + (fs < 0 ? 200 : 0));
        if (!best || key < best.key) best = {key, hd, sf, dx, dy, al, B2, r}; if (!hd && !sf) break; }
      if (best && !best.hd && !best.sf) break; }
    if (best.hd) { forced.push('name:' + i); best.dx = Math.max(BOX.l - px, Math.min(BOX.r - px - best.B2.w, best.dx)); best.dy = Math.max(BOX.t - py, Math.min(BOX.b - py - best.B2.h, best.dy)); best.r = {l: px + best.dx, t: py + best.dy, r: px + best.dx + best.B2.w, b: py + best.dy + best.B2.h}; }
    else if (best.sf) soft.push('name:' + i);
    const {dx, dy, al, B2} = best, g = nzS('g', {class: 'nz-nmb' + (i === cur ? ' cur' : ''), 'data-go': i, role: 'button', 'aria-label': `${nzLabel(i)}: ${NZJ.stops[i].name}`}, g0[i]), ax = al === 'm' ? dx + B2.w / 2 : al === 'e' ? dx + B2.w : dx, an = al === 'm' ? 'middle' : al === 'e' ? 'end' : 'start';
    nzS('rect', {x: dx, y: dy, width: B2.w, height: B2.h, class: 'nz-hit'}, g);
    if (B2.cap) nzS('text', {class: 'nz-cap', x: ax, y: dy + 8, 'text-anchor': an}, g).textContent = B2.cap; else { soft.push('caption:' + i); if (i === cur) curCap = false; capsOff++; }
    if (B2.num) { nzS('text', {class: 'nz-num', x: ax, y: dy + 11, 'text-anchor': an}, g).textContent = B2.lines[0]; nzS('title', {}, g).textContent = `${nzLabel(i)} · ${NZJ.stops[i].year} · ${NZJ.stops[i].name}`; } else
    B2.lines.forEach((t, j) => { nzS('text', {class: 'nz-nm f' + B2.fs, x: ax, y: dy + B2.top + B2.lh * (j + 1) - 2.5, 'text-anchor': an}, g).textContent = t; });
    if (B2.cap) capsOn++; PL.push(best.r); };
  /* fruits: hanging down first, longer stems before turning upward, then smaller, then without a label */
  const ANG = []; for (let j = 0; j <= 12; j++) { ANG.push(90 + j * 15); if (j && j < 12) ANG.push(90 - j * 15); }
  const LEN = []; for (let j = 0; j < 20; j++) LEN.push(14 + j * 4);
  const CAND = []; ANG.forEach(a => LEN.forEach(Ln => CAND.push([a, Ln, Math.abs(((a - 90 + 540) % 360) - 180) / 15 + (Ln - 14) / 9]))); CAND.sort((u, v) => u[2] - v[2]);
  const placeFruit = (i, w, opt) => { if (!seen(i)) { off.push(w.id); return; } const [px, py] = SP[i], lists = [near(px, py, 280), PL], lab = opt.label ? `${w.year} · ${nzSur(w)}` : '', lw = lab ? nzW(lab, 'nz-fl') : 0, own = 'pt:' + NZJ.stops[i].lan; let best = null;
    const tryAll = (sizes, withLab) => { for (const rr of sizes) for (const [a, Ln] of CAND) { const t = a * Math.PI / 180, ux = Math.cos(t), uy = Math.sin(t), fx = px + ux * (Ln + rr), fy = py + uy * (Ln + rr);
        const rs = [{l: fx - rr - 1, t: fy - rr - 1, r: fx + rr + 1, b: fy + rr + 1}], side = ux >= -.15 ? 1 : -1, stem = [];
        const cxq = (px + fx) / 2 - uy * Ln * .12 * side, cyq = (py + fy) / 2 + Math.abs(ux) * Ln * .12;
        const ns = Math.max(6, Math.ceil(Ln / 3)); for (let k = 1; k < ns; k++) { const u = k / ns; if (u < .14) continue; const qx = (1 - u) * (1 - u) * px + 2 * (1 - u) * u * cxq + u * u * fx, qy = (1 - u) * (1 - u) * py + 2 * (1 - u) * u * cyq + u * u * fy; stem.push({l: qx - 1, t: qy - 1, r: qx + 1, b: qy + 1}); }
        let lr = null; if (withLab) { lr = side > 0 ? {l: fx + rr + 3, t: fy - 8, r: fx + rr + 3 + lw, b: fy + 7} : {l: fx - rr - 3 - lw, t: fy - 8, r: fx - rr - 3, b: fy + 7}; rs.push(lr); }
        const a1 = cost(rs, lists), a2 = cost(stem, lists, o => o.tag === own, GARDEN), hd = a1[0] + a2[0]; if (hd >= 1e9) continue;
        const sf = a1[1] + a2[1], key = hd * 1e4 + sf * 2 + (withLab ? 0 : 60) + (sizes[0] - rr) * 12;
        if (!best || key < best.key) best = {key, hd, sf, fx, fy, rr, cxq, cyq, lr, side, rs: rs.concat(stem), withLab}; if (!hd && !sf) return true; } return false; };
    const ok = (lab && tryAll(opt.sizes, true)) || tryAll(opt.sizes, false);
    if (!best) { (opt.must ? forced : hidden).push(w.id + ':nowhere'); return; }
    if (!ok && !best.hd) soft.push(w.id); else if (!ok && !opt.must) { hidden.push(w.id); return; } else if (!ok) forced.push(w.id);
    const b = best, g = nzS('g', {class: 'nz-fr' + (w.core ? ' core' : ''), 'data-go': i, 'data-w': w.id, role: 'button', 'aria-label': `${w.composer}, ${w.title.replace(/\*/g, '')}, ${w.year}`}, g0[i]), dx = b.fx - px, dy = b.fy - py, dl = Math.hypot(dx, dy) || 1;
    nzS('path', {class: 'nz-stem', d: `M0,0 Q${(b.cxq - px).toFixed(1)},${(b.cyq - py).toFixed(1)} ${(dx - dx / dl * b.rr).toFixed(1)},${(dy - dy / dl * b.rr).toFixed(1)}`}, g);
    nzS('circle', {class: 'nz-hit', cx: dx.toFixed(1), cy: dy.toFixed(1), r: Math.max(7, b.rr + 4)}, g);
    nzS('circle', {class: 'nz-fruit', cx: dx.toFixed(1), cy: dy.toFixed(1), r: w.core ? b.rr : b.rr - .6}, g);
    nzS('title', {}, g).textContent = `${w.year} · ${w.title.replace(/\*/g, '')} · ${w.composer}`;
    if (b.withLab && b.lr) nzS('text', {class: 'nz-fl', x: ((b.side > 0 ? b.lr.l : b.lr.r) - px).toFixed(1), y: (b.fy - py + 3.6).toFixed(1), 'text-anchor': b.side > 0 ? 'start' : 'end'}, g).textContent = lab;
    PL.push(...b.rs); };
  /* the root sign, under the root and clear of its ring */
  const placeRoot = () => { if (!seen(0)) return; const [px, py] = SP[0], lists = [near(px, py, 90), PL], rg = 2.4 * view.k + 2.5; let best = null;
    for (const [dx, dy] of [[-6, 0], [-6, 3], [-13, 1], [1, 1], [-6, 7], [-15, 6], [3, 6], [-20, 0], [8, 0], [-6, 13], [-24, -4], [-28, 2], [12, -4], [-34, -6], [-6, 20], [-40, -4], [-40, 3], [-46, -2], [-52, 0]]) { const r = {l: px + dx - 1, t: py + rg + dy - 1, r: px + dx + 13, b: py + rg + dy + 15}, [hd, sf] = cost([r], lists), key = hd * 1e4 + sf;
      if (!best || key < best.key) best = {key, hd, dx, dy: rg + dy, r}; if (!key) break; }
    if (best.hd) { hidden.push('root-sign'); return; }
    nzS('path', {class: 'nz-root', d: NZ_SEED, transform: `translate(${best.dx.toFixed(1)},${best.dy.toFixed(1)}) scale(1.05)`}, g0[0]); PL.push(best.r); };
  /* the leap's words, in the gap between its two ends */
  const placeLeap = () => { if (!leapSeg || !seen(2) || !seen(3)) { if (leapSeg) hidden.push('leap'); return; } const p = leapSeg.line, Ln = p.getTotalLength(), mp = p.getPointAtLength(Ln / 2); M.lm = {x: mp.x, y: mp.y}; const [mx, my] = nzScr(M.lm);
    const a = nzScr(p.getPointAtLength(Ln * .4)), b = nzScr(p.getPointAtLength(Ln * .6)), tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
    const txt = 'a leap · no link', w = nzW(txt, 'nz-lp'), lists = [near(mx, my, 220), PL]; let best = null;
    if (Math.hypot(SP[2][0] - SP[3][0], SP[2][1] - SP[3][1]) < w * .9) { hidden.push('leap'); return; }
    for (const d of [0, 9, -9, 15, -15, 22, -22]) for (const sh of [0, .08, -.08, .15, -.15]) { const cx = mx + nx * d + tx * sh * 2, cy = my + ny * d + ty * sh * 2, r = {l: cx - w / 2, t: cy - 8, r: cx + w / 2, b: cy + 4}, [hd, sf] = cost([r], lists), key = hd * 1e4 + sf;
      if (!best || key < best.key) best = {key, hd, cx, cy, r}; if (!key) break; }
    if (best.hd) { hidden.push('leap'); return; }
    M.lg = nzS('g', {class: 'nz-lpg'}, mk); nzS('text', {class: 'nz-lp', x: (best.cx - mx).toFixed(1), y: (best.cy - my).toFixed(1), 'text-anchor': 'middle'}, M.lg).textContent = txt; nzPos(); PL.push(best.r); };
  const order = cur >= 0 ? [cur, ...[0, 1, 2, 3].filter(i => i !== cur)] : [0, 1, 2, 3], curWs = cur >= 0 ? nzWorks(cur, lv) : [];
  const coreCur = () => curWs.filter(w => w.core).forEach(w => placeFruit(cur, w, {label: labels, sizes: [4.6, 3.6, 2.8], must: true}));
  placeRoot(); if (mode) { placeName(order[0]); coreCur(); order.slice(1).forEach(placeName); } else { coreCur(); order.forEach(placeName); }
  curWs.filter(w => !w.core).forEach(w => placeFruit(cur, w, {label: labels, sizes: [4.2, 3.4, 2.6], must: true}));
  order.filter(i => i !== cur).forEach(i => nzWorks(i, lv).filter(w => w.core).forEach(w => placeFruit(i, w, {label: false, sizes: [3.8, 3, 2.3], must: true})));
  order.filter(i => i !== cur).forEach(i => nzWorks(i, lv).filter(w => !w.core).forEach(w => placeFruit(i, w, {label: false, sizes: [3.4, 2.7, 2.1], must: false})));
  placeLeap();
  return {hidden, forced, off, soft, PL, SP, curCap, capsOff, capsOn}; }
window.__nz = {begin: nzBegin, show: nzShow, end: nzEnd, back: nzBack, solve: nzSolve, frame: nzFrame, open: () => NZS ? NZS.at : null, pending: () => !!(NZS && (NZS.pending || nzFrame.busy)), state: () => NZS, store: () => NZ, mail: nzMail, data: NZJ};
