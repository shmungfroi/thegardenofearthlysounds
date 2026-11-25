#!/usr/bin/env python3
"""The Nursery: turn the checked journey text (journey-sonata.md) into the reader's data.

Writes journey-sonata.json beside this file and nursery_data.js at the repo root (window.NURSERY).
The words are carried exactly: nothing is retyped or reworded. The only changes are the ones Justin
decided (25 Nov 18:49): where the text uses a stage as a level label, the level's name is shown
(Stage 4 = Seed, Stage 5 = Shoot, Stage 6 = Bloom), and the "Stage N:" labels on level lines are dropped
because the reader shows only the chosen level's lines.

At the end it checks both ways and reports:
  - words of the md not carried into the data (must be none), and
  - text in the data that is not in the md (must be none).
Run:  python3 dev/patches/nursery/convert.py
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
MD = os.path.join(HERE, 'journey-sonata.md')

LANTERN = {'Polychoral music': 'polychoral', 'Canzona & early sonata': 'canzona', 'Trio sonata & solo sonata': 'triosonata', 'Keyboard sonata': 'kbsonata'}
ELS = {'dynamics': 'dyn', 'texture': 'tex', 'performing media': 'pmt', 'structure': 'str', 'duration': 'dur', 'pitch': 'pit'}
ALL = [4, 5, 6]
# Level names where the text uses a stage as a level label (Justin, 25 Nov 18:49: "keep seed shoot bloom")
LEVEL_MAP = [("How the stages use this journey", "How the levels use this journey"), ("Stages 4, 5 and 6", "Seed, Shoot and Bloom"),
             ("the Garden's own Stage 6 text", "the Garden's own Bloom text"), ("Stage 5 adds", "Shoot adds"), ("Stage 6 only", "Bloom only"),
             ("for every stage", "for every level"), ("Stages 5 and 6: the first work here", "Shoot and Bloom: the first work here")]


def lvmap(t):
    for a, b in LEVEL_MAP:
        t = t.replace(a, b)
    return t


def levels(s):
    """'Stage 4' -> [4]; 'Stages 4 and 5' -> [4, 5]; 'Stages 4, 5, 6' -> [4, 5, 6]"""
    return sorted({int(x) for x in re.findall(r'[456]', s)})


NAMES_56 = 'Shoot and Bloom'
LVTAG = re.compile(r'\s*\*(Stages? [456](?:(?:, | and )[456])*\.|Core work for every stage\.)\*\s*$')
LVLEAD = re.compile(r'^(Stages? [456](?:(?:, | and )[456])*)(?: \(([^)]*)\))?: ')


def lvline(t, default=ALL):
    """A line that may start 'Stage 5:' / 'Stage 4 (Corelli only):' or end '*Stages 4, 5, 6.*'"""
    o = {'lv': list(default)}
    m = LVLEAD.match(t)
    if m:
        o['lv'] = levels(m.group(1)); t = t[m.end():]
        if m.group(2): o['scope'] = m.group(2)
    m = LVTAG.search(t)
    if m:
        o['lv'] = ALL if m.group(1).startswith('Core') else levels(m.group(1)); t = t[:m.start()]
    o['t'] = t.strip()
    return o


def listen_item(t, default):
    o = lvline(t, default)
    m = re.match(r'^\(([a-z ]+)\) ', o['t'])
    if m and m.group(1) in ELS:
        o['el'] = m.group(1); o['t'] = o['t'][m.end():]
    return o


def parse():
    md = open(MD, encoding='utf-8').read()
    secs = re.split(r'\n(?=## )', md)
    J = {'id': 'sonata', 'stops': []}
    head = secs[0].splitlines()
    J['title'] = head[0][2:]
    J['nursery'] = head[2].strip('*'); J['tagline'] = head[3].strip('*')
    J['label'] = head[5].split(': ', 1)[1]
    J['meta'] = lvmap(head[6])
    for sec in secs[1:]:
        lines = [l for l in sec.split('\n')]
        h = lines[0][3:]
        body = [l for l in lines[1:] if l.strip() and l.strip() != '---']
        if h.startswith('How the stages'):
            J['levelsHead'] = lvmap(h)
            rows = [l for l in body if l.startswith('|') and not l.startswith('|---')]
            cells = [[c.strip() for c in r.strip('|').split('|')] for r in rows]
            names = {'4': 'Seed', '5': 'Shoot', '6': 'Bloom'}
            J['levelsTable'] = [['Level'] + cells[0][1:]] + [[names[r[0]], r[1], lvmap(r[2])] for r in cells[1:]]
            J['levelsCore'] = lvmap([l for l in body if l.startswith('Core works')][0])
        elif h == 'Opening':
            J['big'] = re.sub(r'^Big question: \*(.*)\*$', r'\1', body[0]); J['bigHead'] = 'Big question'
            k, v = body[1].split(': ', 1)
            J['todayHead'] = k.replace(' (one sentence)', ''); J['today'] = v
        elif h.startswith('Root') or h.startswith('Chapter'):
            J['stops'].append(parse_stop(h, body))
        elif h == 'What I learned':
            J['learned'] = {'head': h, 'prompts': [re.sub(r'^\d\. ', '', l) for l in body if re.match(r'^\d\. ', l)],
                            'teachers': [l for l in body if l.startswith('**For teachers.**')][0][len('**For teachers.** '):]}
        elif h == 'Apply it':
            J['apply'] = {'head': h, 'cjg': body[0], 'text': body[1]}
            J['keep'] = {'head': 'Keep', 'text': body[2][len('**Keep** '):]}
        elif h == 'Sources':
            J['sources'] = {'head': h, 'lines': body}
    return J


def parse_stop(h, body):
    m = re.match(r'^(Root|Chapter (\d))[:.] (\d{4}) · (.+?) \(the lantern: ([^)]+)\)$', h)
    S = {'key': 'root' if m.group(1) == 'Root' else int(m.group(2)), 'label': m.group(1), 'year': m.group(3), 'name': m.group(4), 'lanDate': m.group(5), 'lan': LANTERN[m.group(4)],
         'intro': [], 'means': [], 'changed': [], 'works': [], 'words': [], 'check': [], 'find': [], 'teachers': ''}
    i, mode, W = 0, 'intro', None
    while i < len(body):
        l = body[i]
        if mode == 'intro' and not l.startswith('**What "sonata"'):
            if l.startswith('**A leap'):
                mm = re.match(r'^\*\*(.+?)\*\* (.*)$', l); S['lead'] = mm.group(1); l = mm.group(2)
            parts = re.split(r' (?=Stages 5 and 6: )', l)
            S['intro'].append({'lv': ALL, 't': lvmap(parts[0])})
            if len(parts) > 1: S['intro'].append(dict(lvline(parts[1]), label=NAMES_56))
            i += 1; continue
        if l.startswith('**What "sonata" means here.**'):
            S['meansHead'] = 'What "sonata" means here.'; mode = 'means'; i += 1; continue
        if l.startswith('**What changed'):
            mm = re.match(r'^\*\*(What changed[^*]*)\*\*(.*)$', l); S['changedHead'] = mm.group(1)
            if mm.group(2).strip(): S['changed'].append({'lv': ALL, 't': mm.group(2).strip()})
            mode = 'changed'; i += 1; continue
        if l.startswith('- ') and mode in ('means', 'changed'):
            S[mode].append(lvline(l[2:])); i += 1; continue
        mm = re.match(r'^\*\*The work\.\*\* (.+), ([^,]+), (\d{4})\.$', l)
        if mm:
            W = {'title': mm.group(1), 'composer': mm.group(2), 'year': mm.group(3), 'lv': ALL, 'core': True}
            S['works'].append(W); mode = 'work'; i += 1; continue
        mm = re.match(r'^\*\*(\d)\. (\S+) · (.+), ([^,]+)\.\*\*(.*)$', l)
        if mm:
            tag = mm.group(5).strip()
            W = {'title': mm.group(3), 'composer': mm.group(4), 'year': mm.group(2), 'lv': ALL if 'Core' in tag else levels(tag), 'core': 'Core' in tag}
            S['works'].append(W); mode = 'work'; i += 1; continue
        if l.startswith('Recording: '):
            mm = re.match(r'^Recording: (\S+)(?: \((.+)\))?$', l); W['url'] = mm.group(1)
            if mm.group(2): W['perf'] = mm.group(2)
            i += 1; continue
        if l in ('**Listen for.**', 'Listen for:'):
            W['listen'] = []; i += 1
            while i < len(body) and body[i].startswith('- '):
                W['listen'].append(listen_item(body[i][2:], W['lv'])); i += 1
            continue
        if l.startswith('Listen for: '):
            W['listen'] = [listen_item(x, W['lv']) for x in l[len('Listen for: '):].split('; ')]; i += 1; continue
        if l in ('**Find out by listening.**', 'Find out by listening:') and mode == 'work' and S['works'] and not S['words']:
            W['find'] = []; i += 1
            while i < len(body) and body[i].startswith('- '):
                W['find'].append(lvline(body[i][2:], W['lv'])); i += 1
            continue
        if l.startswith('Find out by listening: '):
            W['find'] = [lvline(l[len('Find out by listening: '):], W['lv'])]; i += 1; continue
        if l.startswith('For teachers: '):
            W['teachers'] = l[len('For teachers: '):]; i += 1; continue
        mm = re.match(r'^\*Notice(?: \(([^)]*)\))?:\* (.*)$', l)
        if mm:
            W['notice'] = {'lv': levels(mm.group(1)) if mm.group(1) else W['lv'], 't': mm.group(2)}; i += 1; continue
        if l.startswith('**New words.** '):
            S['words'] = [w.strip('*') for w in l[len('**New words.** '):].rstrip('.').split(', ')]; mode = 'end'; i += 1; continue
        if l.startswith('**Check question.**'):
            rest = l[len('**Check question.**'):].strip(); i += 1
            if rest: S['check'].append({'lv': ALL, 't': rest})
            while i < len(body) and body[i].startswith('- '):
                S['check'].append(lvline(body[i][2:])); i += 1
            continue
        if l == '**Find out by listening.**':
            i += 1
            while i < len(body) and body[i].startswith('- '):
                S['find'].append(lvline(body[i][2:])); i += 1
            continue
        if l.startswith('**For teachers.** '):
            S['teachers'] = l[len('**For teachers.** '):]; i += 1; continue
        if l.startswith('**My note:**'):
            i += 1; continue
        if l.startswith('**Send it to the Garden.** '):
            S['send'] = l[len('**Send it to the Garden.** '):]; i += 1; continue
        if mode == 'work' and W is not None and 'url' not in W:
            W.setdefault('pre', []).append(l); i += 1; continue
        raise SystemExit('convert.py: line not understood in %s: %s' % (h, l))
    for W in S['works']:
        W['id'] = re.sub(r'[^a-z]', '', W['composer'].split()[-1].lower())
    return S


# ---------- the check, both ways ----------
STRUCT = [r'^## ', r'^\*\*My note:\*\* ______$', r'^---$', r'^\|---']


def norm(t):
    t = t.replace('**', '').replace('*', '')
    return re.sub(r'\s+', ' ', t).strip()


def strings(o, out):
    if isinstance(o, str): out.append(o)
    elif isinstance(o, list): [strings(x, out) for x in o]
    elif isinstance(o, dict): [strings(v, out) for k, v in o.items() if k not in ('lv', 'id', 'key', 'lan', 'core')]
    return out


def check(J):
    md = open(MD, encoding='utf-8').read()
    corpus = ' ‖ '.join(norm(s) for s in strings(J, []))
    mdn = norm(lvmap(md)).replace('\n', ' ')
    lost = []
    for line in md.split('\n'):
        if not line.strip() or any(re.match(p, line) for p in STRUCT):
            if line.startswith('## '):
                if line[3:] == 'Opening': continue
                for w in re.findall(r"[\w'&.–-]+", lvmap(line[3:])):
                    w = w.strip('.')
                    if w and w not in ('Chapter', 'Root') and w not in corpus and lvmap(w) not in corpus: lost.append(w)
            continue
        t = re.sub(r'^# ', '', line)
        t = re.sub(r'^\s*(- |\d\. )', '', t)
        t = LVTAG.sub('', t)
        t = lvmap(t)
        t = re.sub(r'^(Stages? [456](?:(?:, | and )[456])*)(?: \(([^)]*)\))?: ', lambda m: (m.group(2) + ' \u2016 ') if m.group(2) else '', t)
        t = t.replace(' Stages 5 and 6: ', ' \u2016 ').replace(' Shoot and Bloom: ', ' \u2016 Shoot and Bloom \u2016 ')
        for lab in ('**What "sonata" means here.**', '**Listen for.**', '**Find out by listening.**', '**New words.**', '**Check question.**', '**For teachers.**',
                    '**Send it to the Garden.**', '**The work.**', 'Listen for:', 'Find out by listening:', 'For teachers:', 'Recording:', 'Big question:', 'Label:', '**Keep**'):
            t = t.replace(lab, ' \u2016 ')
        t = re.sub(r'\*Notice(?: \([^)]*\))?:\*', ' \u2016 ', t)
        t = re.sub(r'\((dynamics|texture|performing media|structure|duration|pitch)\) ', ' \u2016 ', t)
        t = re.sub(r'(https?://\S+) \(', '\\1 \u2016 ', t)
        mm = re.match(r'^\*\*(\d)\. (\S+) · (.+), ([^,]+)\.\*\*\s*$', t.strip())
        if mm: t = ' \u2016 '.join(mm.group(k) for k in (2, 3, 4))
        mm = re.match(r'^\s*\*\*([^*]+)\*\*\s*(.*)$', t)
        if mm and not t.strip().startswith('**' + mm.group(1) + '**,'): t = mm.group(1) + ' \u2016 ' + mm.group(2)
        if t.count('**, **') >= 1: t = t.replace(', ', ' \u2016 ')
        t = t.replace('What a sonata is today (one sentence):', 'What a sonata is today \u2016')
        t = re.sub(r'^\| ?Level ?\|', '', t)
        for frag in re.split(r'‖|\|| \((?=[a-z ]+\) )|; \((?=[a-z ]+\) )', t):
            f = norm(frag).strip(' ,.;:()').replace('Seed, Shoot and Bloom', 'Seed, Shoot and Bloom')
            if f in ('Stage', '4', '5', '6', 'Seed', 'Shoot', 'Bloom'): continue
            if not f: continue
            if f.endswith(', ' + 'Giovanni Gabrieli, 1597'): f = f.split(', Giovanni')[0]
            if f not in corpus:
                pieces = [p.strip(' ,.') for p in re.split(r', (?=[^,]+$)', f)]
                if all(p in corpus for p in pieces if p): continue
                lost.append(f)
    extra = [s for s in strings(J, []) if norm(s) and norm(s) not in mdn and norm(s) not in ('Level', 'Keep', 'Big question', 'What a sonata is today')]
    words = len(re.findall(r'\w+', norm(md)))
    return lost, extra, words


def main():
    J = parse()
    lost, extra, words = check(J)
    open(os.path.join(HERE, 'journey-sonata.json'), 'w', encoding='utf-8').write(json.dumps(J, ensure_ascii=False, indent=1) + '\n')
    js = '/* The Nursery: the checked journey "Sonata · Follow the growth", made by dev/patches/nursery/convert.py from journey-sonata.md. Do not edit by hand. */\nwindow.NURSERY = {sonata: ' + json.dumps(J, ensure_ascii=False, separators=(',', ':')) + '};\n'
    open(os.path.join(ROOT, 'nursery_data.js'), 'w', encoding='utf-8').write(js)
    nw = sum(len(s['works']) for s in J['stops'])
    print('convert.py: %d stops, %d works, %d words; words not carried: %s; text not in the md: %s' % (len(J['stops']), nw, words, len(lost) and lost or 'none', len(extra) and extra or 'none'))
    return 1 if lost or extra else 0


if __name__ == '__main__':
    sys.exit(main())
