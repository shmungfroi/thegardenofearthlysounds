"""Add the seven Know It Cold landmark works to their lanterns (27 Nov 2026).

Targeted string edits on gx_data.js only: each work is appended to the end of its
lantern's works list, with its media entry appended at the same index, so every existing index reference (qs[].work etc.) stays valid.
Idempotent: a work already present is skipped.

Usage: python3 dev/patches/landmarks_1600_1900.py links.json
links.json: {"groundbass": {"title":..., "composer":..., "year":..., "youtube":..., "imslp":..., "note":...}, ...}
"""
import json, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
P = ROOT / 'gx_data.js'
links = json.load(open(sys.argv[1]))
s = P.read_text()

def j(x):
    return json.dumps(x, ensure_ascii=False, separators=(',', ':'))

def close_of(s, i):
    """index of the ']' that closes the '[' at s[i]"""
    depth, k, ins = 0, i, False
    while True:
        c = s[k]
        if ins:
            if c == '\\': k += 2; continue
            if c == '"': ins = False
        elif c == '"': ins = True
        elif c == '[': depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0: return k
        k += 1

def node_works_span(s, nid):
    key = '{"id":"%s",' % nid
    i = s.index(key)
    w = s.index('"works":[', i) + len('"works":')
    return w, close_of(s, w)

def obj_end(s, i):
    """index of the '}' that closes the '{' at s[i]"""
    depth, k, ins = 0, i, False
    while True:
        c = s[k]
        if ins:
            if c == '\\': k += 2; continue
            if c == '"': ins = False
        elif c == '"': ins = True
        elif c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: return k
        k += 1

def full_field_span(s, nid, field):
    # the field inside ATLAS.full.<nid>, searched only within that object
    a = s.index('"full":{')
    i = s.index('"%s":{' % nid, a) + len('"%s":' % nid)
    e = obj_end(s, i)
    f = s.index('"%s":[' % field, i) + len('"%s":' % field)
    assert f < e, (nid, field, 'field not inside lantern object')
    return f, close_of(s, f)

added = []
for nid, L in links.items():
    a, b = node_works_span(s, nid)
    if L['title'] in s[a:b]:
        continue
    work = [L['title'], L['composer'], L['year'], False]
    s = s[:b] + ',' + j(work) + s[b:]
    a, b = full_field_span(s, nid, 'media')
    s = s[:b] + ',' + j([L['youtube'], L['imslp'], L.get('note', '')]) + s[b:]
    added.append(nid)

P.write_text(s)

# verify: parallel arrays still aligned
obj, _ = json.JSONDecoder().raw_decode(s[s.index('{"DATA"'):])
N = {n['id']: n for n in obj['DATA']['nodes']}
F = obj['ATLAS']['full']
for nid in links:
    nw = len(N[nid]['works'])
    assert len(F[nid]['media']) == nw, (nid, 'media', len(F[nid]['media']), nw)
    assert N[nid]['works'][-1][0] == links[nid]['title']
print('added:', added, '| all parallel arrays aligned')
