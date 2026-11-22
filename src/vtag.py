#!/usr/bin/env python3
"""Tag local script files in index.html with ?v=<hash of the file> (run by build.sh)."""
import hashlib, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
p = os.path.join(ROOT, 'index.html')
s = open(p, encoding='utf-8').read()
def tag(m):
    name = m.group(2)
    f = os.path.join(ROOT, name)
    if not os.path.isfile(f):
        return m.group(0)
    h = hashlib.sha256(open(f, 'rb').read()).hexdigest()[:10]
    return '%s%s?v=%s%s' % (m.group(1), name, h, m.group(4))
s2, n = re.subn(r'(<script[^>]*\ssrc=")([A-Za-z0-9_./-]+\.js)(\?v=[^"]*)?(")', tag, s)
if s2 != s:
    open(p, 'w', encoding='utf-8').write(s2)
print('vtag: %d script tags versioned' % n)
