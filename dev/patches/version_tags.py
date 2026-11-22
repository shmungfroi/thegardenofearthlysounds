#!/usr/bin/env python3
"""Version tags for the Garden's script files (idempotent patch).

Why: GitHub Pages serves the .js files with a 10-minute cache, and index.html
loaded them without a version tag. After an update a visitor could get the new
index.html with an old card.js or gx_data.js, and parts of the page broke until
a reload. This adds src/vtag.py and a last step to build.sh that tags every
local <script src="X.js"> in index.html with ?v=<first 10 hex of its sha256>.
A new page then always asks for the matching files.

Run from the repo root:  python3 dev/patches/version_tags.py && ./build.sh
"""
import os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

VTAG = '''#!/usr/bin/env python3
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
s2, n = re.subn(r'(<script[^>]*\\ssrc=")([A-Za-z0-9_./-]+\\.js)(\\?v=[^"]*)?(")', tag, s)
if s2 != s:
    open(p, 'w', encoding='utf-8').write(s2)
print('vtag: %d script tags versioned' % n)
'''

def main():
    vt = os.path.join(ROOT, 'src', 'vtag.py')
    open(vt, 'w').write(VTAG)
    b = os.path.join(ROOT, 'build.sh')
    s = open(b).read()
    line = 'python3 src/vtag.py\n'
    if line not in s:
        if not s.endswith('\n'):
            s += '\n'
        s += line
        open(b, 'w').write(s)
    print('version_tags: src/vtag.py written; build.sh runs it last')

if __name__ == '__main__':
    sys.exit(main())
