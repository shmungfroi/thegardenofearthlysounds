#!/usr/bin/env python3
"""The Nursery: The Branches and the Fruits, with its first journey "Sonata · Follow the growth" (idempotent patch, 26 Nov 2026).

Approved: framework 22 Nov 10:04, design 22 Nov 10:30; Justin's answers of 25 Nov 18:49 built in
(Seed / Shoot / Bloom, Send muted until a note is written, one note per work, a route chosen from search keeps the
journey open; and on 26 Nov: the NSW sentence kept, a 49-character chosen name).

What it does (run from the repo root after phone_zoom.py, then ./build.sh):
1. runs nursery/convert.py: the checked journey text -> nursery_data.js (window.NURSERY), reporting words not carried;
2. card.js exports glossKey and gloss(button, key, root) so the reader opens the Garden's own definitions;
3. src/template.html: the Nursery's stylesheet (nursery/nz.css) and code (nursery/nz.js) between markers, so a rerun
   replaces them; a <script> tag for nursery_data.js; and one-line hooks in the Garden's code. Every hook tests NZS
   first and does nothing while no journey is open;
4. dev/run_tests.sh and dev/README.md: the Nursery test.
A rerun gives byte-identical files.
"""
import os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
NZ = os.path.join(HERE, 'nursery')
T = os.path.join(ROOT, 'src', 'template.html')
CARD = os.path.join(ROOT, 'card.js')
CSS_A, CSS_B = '/* nursery:css:start */', '/* nursery:css:end */'
JS_A, JS_B = '/* nursery:js:start */', '/* nursery:js:end */'

HOOKS = [
    # (where, old, new): each old must occur exactly once before the patch, each new exactly once after
    ('apply', "  declutter(); chrome(); }\nfunction declutter()", "  declutter(); chrome(); if (NZS) nzOnApply(); }\nfunction declutter()"),
    ('light', "function light(id) {\n  svg.classList.toggle('focus', !!id);", "function light(id) { if (NZS) return nzLight();\n  svg.classList.toggle('focus', !!id);"),
    ('stepBack', "  if (walking || jpanel) { endJourneyPanel(); return true; }", "  if (NZS) return nzBack(); if (walking || jpanel) { endJourneyPanel(); return true; }"),
    ('closePanel', "function closePanel() { if (!sel && !tkey", "function closePanel() { if (NZS) return; if (!sel && !tkey"),
    ('quitWalk', "function quitWalk() { if (inWalk) return;", "function quitWalk() { if (NZS) nzEnd(false); if (inWalk) return;"),
    ('openJPanel', "function openJPanel(build) { closeSheet();", "function openJPanel(build) { if (NZS) nzEnd(false); closeSheet();"),
    ('hashOf', "  if (tkey) P.push((pan ? 'v=' : 'vp=') + tkey);", "  if (NZS) P.push(nzHash()); else if (tkey) P.push((pan ? 'v=' : 'vp=') + tkey);"),
    ('readHash', "  if (Q.l && N[Q.l] && LAY.nodes[Q.l]) choose(Q.l, true);", "  if (Q.nursery && nzFromHash(Q)) return true;\n  if (Q.l && N[Q.l] && LAY.nodes[Q.l]) choose(Q.l, true);"),
    ('journeySheet top', "function journeySheet() { sheet.innerHTML = ''; el('h3', '', sheet, 'JOURNEYS');", "function journeySheet() { sheet.innerHTML = ''; el('h3', '', sheet, 'JOURNEYS'); nzJump(sheet);"),
    ('journeySheet foot', "  el('p', 'lnote', sheet, 'Kept in this browser: as many as it will hold. A link is the safest copy.'); }", "  el('p', 'lnote', sheet, 'Kept in this browser: as many as it will hold. A link is the safest copy.'); nzSection(sheet); }"),
    ('keydown', "  if (e.target.closest('input')) return;\n  if (e.key === '/')", "  if (e.target.closest('input')) return; if (NZS && e.key.startsWith('Arrow') && e.target.closest('aside.nz-read')) return;\n  if (e.key === '/')"),
    ('chrome', "lv = level(), f = sel ? famAt(LAY.nodes[sel].x) : (lv >= 1 ? (curFam || famAt(cx)) : null), e = sel ? eraOf(sel) : (lv >= 1 ? eraAt(cy) : null);",
     "lv = level(), zs = sel || nzCrumbLan(), f = zs ? famAt(LAY.nodes[zs].x) : (lv >= 1 ? (curFam || famAt(cx)) : null), e = zs ? eraOf(zs) : (lv >= 1 ? eraAt(cy) : null);"),
    ('chrome storey', "  if (e && (lv >= 2 || sel)) steps.push(", "  if (e && (lv >= 2 || zs)) steps.push("),
    ('chrome lantern', "  if (sel) steps.push([N[sel].t, () => frameNet(sel, true)]);", "  if (zs) steps.push([N[zs].t, () => sel ? frameNet(sel, true) : nzFrame()]);"),
    ('shift pin', "  if (!spot && !sel && !tkey && !ekey && hoverId) { pin(hoverId); shiftMade = true; } });", "  if (!spot && !sel && !tkey && !ekey && !NZS && hoverId) { pin(hoverId); shiftMade = true; } });"),
    ('hover light', "if (g && !sel && !spot && !tkey && !ekey) { light(g.dataset.id);", "if (g && !sel && !spot && !tkey && !ekey && !NZS) { light(g.dataset.id);"),
    ('hover out', "if (g && !sel && !spot && !tkey && !ekey && !(e.relatedTarget", "if (g && !sel && !spot && !tkey && !ekey && !NZS && !(e.relatedTarget"),
    ('lantern click', "  if (g) { e.stopPropagation(); const id = g.dataset.id;\n", "  if (g) { e.stopPropagation(); const id = g.dataset.id; if (NZS && nzLanClick(id)) return;\n"),
    ('data script', '<script src="card.js"></script>\n', '<script src="card.js"></script>\n<script src="nursery_data.js"></script>\n'),
]


def block(s, a, b, body, anchor):
    """put body between markers a and b; if the markers are not there yet, insert the block before anchor"""
    new = a + '\n' + body.rstrip('\n') + '\n' + b
    if a in s:
        i, j = s.index(a), s.index(b) + len(b)
        return s[:i] + new + s[j:]
    assert s.count(anchor) == 1, ('anchor', anchor[:60])
    i = s.index(anchor)
    return s[:i] + new + '\n' + s[i:]


def main():
    r = subprocess.run([sys.executable, os.path.join(NZ, 'convert.py')], capture_output=True, text=True)
    print(r.stdout.strip() or r.stderr.strip())
    if r.returncode:
        print('nursery: the journey text did not convert cleanly; nothing else changed'); return 1

    c = open(CARD, encoding='utf-8').read()
    exp = "window.GardenCard = {render, renderComposer, renderEvent, VOICES, voiceTags, EVENTS: E, NSW, STRAND, COURSES, WINS, LEVELS, ELX};"
    if exp in c:
        c = c.replace(exp, exp[:-2] + ", glossKey, gloss: (b, key, root) => { card = root; toggleGloss(b, key); }};")
        open(CARD, 'w', encoding='utf-8').write(c)
    assert 'glossKey, gloss: (b, key, root)' in c

    s = open(T, encoding='utf-8').read()
    for name, old, new in HOOKS:
        if s.count(new) == 1:
            continue
        assert s.count(old) == 1, ('hook', name, s.count(old))
        s = s.replace(old, new)
    css = open(os.path.join(NZ, 'nz.css'), encoding='utf-8').read()
    js = open(os.path.join(NZ, 'nz.js'), encoding='utf-8').read()
    for part, text in (('nz.css', css), ('nz.js', js)):
        bad = [ln for ln in text.split('\n') if re.search(r'(?<![:"\'])//', ln)]
        assert not bad, (part, 'a // comment would swallow the rest of its line', bad[:2])
    s = block(s, CSS_A, CSS_B, css, '</style></head>\n<body>\n<a class="skip"')
    s = block(s, JS_A, JS_B, js, 'readHash(location.hash); drawTrail();')
    open(T, 'w', encoding='utf-8').write(s)

    rt = os.path.join(ROOT, 'dev', 'run_tests.sh')
    t = open(rt, encoding='utf-8').read()
    if 'nurserytest' not in t:
        t = t.replace('searchtest myglossarytest; do', 'searchtest myglossarytest nurserytest; do')
        open(rt, 'w', encoding='utf-8').write(t)
    rd = os.path.join(ROOT, 'dev', 'README.md')
    t = open(rd, encoding='utf-8').read()
    t2 = t.replace('runs the 13 regression suites (every one should print `errors []`).',
                   'runs the 16 regression suites (every one should print `errors []`; `livetest` is stale and fails with `__map is not defined`, and `nowtest` prints `[]` without the label).')
    if 'nurserytest.py' not in t2:
        t2 = t2.replace('- The other scripts in `tests/`',
                        '- `tests/nurserytest.py` checks the Nursery (The Branches and the Fruits): the Garden at rest against a base built from git c288402, the journey text at every level, the map marks at five screen sizes, notes, Send it to the Garden, links and keys. It serves the base from `/tmp/nzbase` (made from `git archive c288402` when missing).\n- The other scripts in `tests/`')
    if t2 != t:
        open(rd, 'w', encoding='utf-8').write(t2)
    print('nursery: applied')
    return 0


if __name__ == '__main__':
    sys.exit(main())
