#!/usr/bin/env python3
"""Levels and curriculum links (Justin, 22 Nov 2026, 10:21: "approved. seed shoot bloom yes. elements crosswalk now").

- Analyst questions show Seed / Shoot / Bloom (Levels 1-3) instead of NSW Stage 4 / 5 / 6.
  The data keeps "stage": 4/5/6 unchanged; only the display maps it.
- The deep text is headed "Bloom · going deeper" instead of "Stage 6".
- NSW course chips on Bloom questions move into the curriculum fold; the "Describe ..." line is labelled "Simpler".
- "NSW syllabus · for teachers" becomes "Curriculum links · for teachers": levels first, then NSW (unchanged content),
  then "Elements across curricula" with a curriculum picker (replaces the 3-column NSW-only terms table).
Idempotent: run after map_focus.py, then ./build.sh.
"""
import pathlib, sys

P = pathlib.Path(__file__).resolve().parents[2] / 'card.js'
s = P.read_text(encoding='utf8')
if 'const LEVELS = ' in s:
    print('levels.py: already applied'); sys.exit(0)

def rep(old, new):
    global s
    assert s.count(old) == 1, ('not unique / missing', old[:80], s.count(old))
    s = s.replace(old, new)

# 1. Level names and the crosswalk data, defined after the NSW layer
LEVELS_JS = r'''
/* Levels (22 Nov 2026): the Garden's own depth ladder. Data keeps the NSW stage number (4, 5, 6); display maps it. */
const LEVELS = {4: {n: 1, name: 'Seed', does: 'hear it and respond, in simple words'}, 5: {n: 2, name: 'Shoot', does: 'the elements and their context'}, 6: {n: 3, name: 'Bloom', does: 'analysis and evaluation'}};
/* Elements across curricula (22 Nov 2026). Each cell says where the Garden's element sits in that curriculum, in its own words. */
const ELX = [
  {t: 'NSW Music 7–10 (2024)', umb: 'elements of music', src: 'https://curriculum.nsw.edu.au/learning-areas/creative-arts/music-7-10-2024/overview',
    c: {dur: 'duration', pit: 'pitch', dyn: 'dynamics and expression', pmt: 'performing media and timbre', tex: 'texture', str: 'structure'}},
  {t: 'NSW Music 1 11–12 (2025, from 2027)', umb: 'no single term: they sit in Music language, under Theoretical language and Compositional language', src: 'https://curriculum.nsw.edu.au/learning-areas/creative-arts/music-1-11-12-2025/content',
    c: {dur: 'metre (simple and compound); note values and rhythmic patterns; rhythmic devices', pit: 'scales and modes; chords; chord qualities; chord progressions and cadences; melodic devices; harmonic devices', dyn: 'expressive devices', pmt: 'performing media; and a separate item for looping, sampling, delay, echo and digital reverb', tex: 'textural devices', str: 'structural devices'}},
  {t: 'NSW Music 2 and Music Extension 11–12 (2025, from 2027)', umb: 'no single term: they sit in Music language, under Theoretical language and Compositional language', src: 'https://curriculum.nsw.edu.au/learning-areas/creative-arts/music-2-11-12-2025/content/year-11/fa9ec28184',
    c: {dur: 'metre; tempo; note values and rhythm groupings; rhythmic devices', pit: 'scales, modes and tonality; chord qualities; chord progressions and cadences; melodic devices; harmonic devices', dyn: 'expressive devices', pmt: 'performing media; and a separate item for looping, sampling, delay, echo and digital reverb', tex: 'textural devices', str: 'structural devices'}},
  {t: 'Australian Curriculum v9 (F–10)', umb: 'elements of music', src: 'https://www.australiancurriculum.edu.au/curriculum-information/understand-this-learning-area/the-arts/#muskeycons',
    c: {dur: 'duration/time (including beat and rhythm)', pit: 'pitch', dyn: 'dynamics and expression', pmt: 'timbre', tex: 'texture', str: 'form and structure'}},
  {t: 'Victorian Curriculum F–10 2.0', umb: 'elements of music', src: 'https://f10.vcaa.vic.edu.au/sites/default/files/2024-10/Music%20glossary.docx',
    c: {dur: 'duration (including tempo, rhythm and metre)', pit: 'pitch', dyn: 'dynamics; articulation', pmt: 'tone colour/timbre', tex: 'texture', str: 'structure/form'}},
  {t: 'England, Key Stage 3 (national curriculum, 2013)', umb: 'the interrelated dimensions of music', src: 'https://www.gov.uk/government/publications/national-curriculum-in-england-music-programmes-of-study/national-curriculum-in-england-music-programmes-of-study',
    c: {dur: 'duration; tempo', pit: 'pitch', dyn: 'dynamics', pmt: 'timbre', tex: 'texture', str: 'structure'}},
  {t: 'England, GCSE and A level (DfE subject content)', umb: 'musical elements', src: ['https://dera.ioe.ac.uk/id/eprint/21930/1/GCSE_subject_content_for_music.pdf', 'https://dera.ioe.ac.uk/id/eprint/21927/1/GCE_AS_and_A_level_subject_content_for_music.pdf'],
    c: {dur: 'tempo, metre and rhythm', pit: 'organisation of pitch (melodically and harmonically); tonality', dyn: 'dynamics', pmt: 'sonority (GCSE puts articulation here)', tex: 'texture', str: 'structure'}},
  {t: 'USA, National Core Arts Standards (2014)', umb: 'elements of music', src: 'https://nationalartsstandards.org/sites/default/files/Music%20Glossary.pdf',
    c: {dur: 'rhythm (tempo is listed under expressive qualities)', pit: 'pitch; harmony', dyn: 'dynamics; style/articulation (dynamics, tempo and articulation are also listed as expressive qualities)', pmt: 'timbre', tex: 'texture', str: 'form'}}];
const ELX_ROWS = ['dur', 'pit', 'dyn', 'pmt', 'tex', 'str'];
'''
rep("return {A, set, yr, oldHSC, newHSC, XW};\n})();\n", "return {A, set, yr, oldHSC, newHSC, XW};\n})();\n" + LEVELS_JS)

# 2. Question chips: level name; NSW course chip removed (it now lives in the fold)
rep("h('span', 'st', qm, 'Stage ' + q.stage);",
    "{ const L = LEVELS[q.stage] || LEVELS[4], lc = h('span', 'st', qm, L.name); lc.title = 'Level ' + L.n + ' · ' + L.name + ': ' + L.does; }")
rep("if (q.stage === 6) { const t = h('span', 'crs', qm, q.verb === 'evaluate' ? 'Music 2 Y12' : 'Music 1 Y12 · Music 2 Y11'); t.title = q.verb === 'evaluate' ? 'Music 2 Year 12 outcomes evaluate the ways Music context and Music language shape meaning' : 'Music 1 Year 12 and Music 2 Year 11 outcomes analyse the ways Music context and Music language shape music'; }\n",
    "")
rep("c1 = h('span', 'crs', d1, 'Music 1 Y11'); c1.title = 'Music 1 Year 11 outcomes describe the ways Music context and Music language shape music';",
    "c1 = h('span', 'crs', d1, 'Simpler'); c1.title = 'The same question one step gentler: describe instead of analyse or evaluate';")
rep("// G5 Answer like an analyst: the Stage 4, 5 and 6 questions", "// G5 Answer like an analyst: Seed, Shoot and Bloom questions (stored as stage 4, 5, 6)")

# 3. Deep text heading
rep("['Stage 6', F.deep]", "['Bloom · going deeper', F.deep]")

# 4. The fold: Curriculum links, levels first, then NSW
rep("h('summary', '', d, 'NSW syllabus · for teachers'); const box = h('div', 'nsw-in', d);",
    "h('summary', '', d, 'Curriculum links · for teachers'); const box = h('div', 'nsw-in', d);\n"
    "    { const p = h('p', '', box); h('b', '', p, 'Levels: '); p.append('Seed (Level 1) hears and responds in simple words; Shoot (Level 2) works with the elements and their context; Bloom (Level 3) analyses and evaluates.'); }\n"
    "    h('h4', 'cl-h', box, 'New South Wales');\n"
    "    { const p = h('p', '', box); h('b', '', p, 'Levels in NSW: '); p.append('Seed = Stage 4 (Years 7–8) · Shoot = Stage 5 (Years 9–10) · Bloom = Stage 6 (Years 11–12: Music 1, Music 2; Music Extension in Year 12).'); }\n"
    "    if ((F.qs || []).some(q => q.stage === 6)) { const p = h('p', '', box); h('b', '', p, 'Bloom questions in NSW (2025 syllabuses): '); p.append('analyse and explain questions suit Music 1 Year 12 (MU1-12L-01: analyses the ways Music context and Music language shape music) and Music 2 Year 11 (MU2-11L-01: analyses the ways Music context and Music language shape meaning in musical pieces); evaluate questions suit Music 2 Year 12 (MU2-12L-01: evaluates the ways Music context and Music language shape meaning and expressive intent in musical pieces). Each “Simpler” line suits Music 1 Year 11 (MU1-11L-01: describes the ways Music context and Music language shape music).'); }")

# 5. Elements across curricula: picker + two-column table (replaces the NSW-only terms table)
old_xw_start = "const xd = h('details', 'nsw-x', box); h('summary', '', xd, 'Terms across the syllabuses');"
i = s.index(old_xw_start); j = s.index("NSW.XW.forEach(r => { const tr = h('tr', '', tb); r.forEach(t => h('td', '', tr, t)); });", i)
j = s.index('\n', j) + 1
s = s[:i] + ("const xd = h('details', 'nsw-x', box); h('summary', '', xd, 'Elements across curricula');\n"
    "    { const sel = h('select', 'cl-pick', xd); sel.setAttribute('aria-label', 'Choose a curriculum'); ELX.forEach((c, k) => { const o = h('option', '', sel, c.t); o.value = k; });\n"
    "      const um = h('p', 'nsw-note', xd), tb = h('table', '', xd), src = h('p', 'nsw-note', xd);\n"
    "      const draw = () => { const c = ELX[+sel.value] || ELX[0]; um.textContent = 'What it calls them: ' + c.umb + '.'; tb.textContent = ''; const hr = h('tr', '', tb); h('th', '', hr, 'The Garden'); h('th', '', hr, c.t);\n"
    "        ELX_ROWS.forEach(e => { const tr = h('tr', '', tb); h('td', '', tr, elName(e)); h('td', '', tr, c.c[e] || '—'); }); src.textContent = ''; src.append('Source: '); [].concat(c.src).forEach((u, k) => { if (k) src.append(' · '); ext(src, u, (k ? 'A level' : c.t) + ' ↗'); }); };\n"
    "      sel.addEventListener('change', draw); draw();\n"
    "      h('p', 'nsw-note', xd, 'Each curriculum groups things a little differently. A cell shows where the Garden’s element sits in that curriculum, in its own words.'); }\n") + s[j:]

# 6. Export
rep("window.GardenCard = {render, renderComposer, renderEvent, VOICES, voiceTags, EVENTS: E, NSW, STRAND, COURSES, WINS};",
    "window.GardenCard = {render, renderComposer, renderEvent, VOICES, voiceTags, EVENTS: E, NSW, STRAND, COURSES, WINS, LEVELS, ELX};")

P.write_text(s, encoding='utf8')

# 7. Styles for the new heading and picker
T = P.parent / 'src' / 'template.html'
t = T.read_text(encoding='utf8')
css = "aside .nsw-x th{color:var(--gold);font-weight:500}"
assert t.count(css) == 1
t = t.replace(css, css + " aside .nsw-in h4.cl-h{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin:14px 0 4px;font-weight:500} aside .nsw-x select.cl-pick{margin:6px 0;max-width:100%;background:#14120c;color:inherit;border:1px solid #3a3222;border-radius:6px;padding:3px 6px;font:inherit;font-size:12px}")
T.write_text(t, encoding='utf8')
print('levels.py: applied')

# 8. Drop every reference to the 2009 Stage 6 syllabuses (Justin, 22 Nov 10:43: "drop any 2009 syllabus reference at all, it has been superseded")
s = P.read_text(encoding='utf8')
i = s.index("  if (oldHSC) {\n"); d = 0; k = s.index('{', i)
while True:
    if s[k] == '{': d += 1
    elif s[k] == '}':
        d -= 1
        if d == 0: break
    k += 1
s = s[:i] + s[k + 2:]
def rep2(old, new):
    global s
    assert s.count(old) == 1, ('2009 step', old[:70], s.count(old)); s = s.replace(old, new)
rep2("const oldHSC = nextHSC <= 2027 ? 2027 : 0, newHSC = Math.max(nextHSC, 2028);", "const newHSC = Math.max(nextHSC, 2028);")
rep2(", O2 = 'Music 2 (2009) · HSC 2027', O1 = 'Music 1 (2009) · HSC 2027';", ";")
i = s.index("  const XW = [['concepts of music'"); k = s.index("]];\n", i) + 4; s = s[:i] + s[k:]
rep2("return {A, set, yr, oldHSC, newHSC, XW};", "return {A, set, yr, newHSC};")
rep2("    if (NSW.oldHSC) { grpRow('Music 2 (2009) · HSC 2027'); grpRow('Music 1 (2009) · HSC 2027'); }\n", "")
rep2("[[NSW.oldHSC, '2009 syllabuses'], [NSW.newHSC, '2025 syllabuses']].forEach(([y, lab]) => { if (!y) return;", "[[NSW.newHSC, '2025 syllabuses']].forEach(([y, lab]) => { if (!y) return;")
assert '2009' not in s and 'oldHSC' not in s and 'concepts' not in s.lower().replace('concept album', '').replace('concept musical', '')
P.write_text(s, encoding='utf8')
print('levels.py: 2009 references removed')
