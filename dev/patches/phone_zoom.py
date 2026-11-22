#!/usr/bin/env python3
"""Phone zoom (idempotent patch, 22 Nov 2026).

Why: on a phone the whole Garden is drawn at about 0.28 scale, and the first +
jumped straight to spire level (2.4), about 8x in one step, centred on the middle
of the screen. That lands halfway up The Commons, in a stretch with no lanterns,
so the screen fills with plain green and it looks like a glitch. - jumped back
out just as hard.

Now, on narrow screens only (map narrower than 700 px):
- + from the whole Garden goes in two steps, and aims at the middle of that
  spire's lanterns, so names are on screen.
- - from spire level goes out in two steps.
Desktop and everything else is unchanged: the original handlers run as before.

Run from the repo root after the other patches:  python3 dev/patches/phone_zoom.py && ./build.sh
"""
import os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
T = os.path.join(ROOT, 'src', 'template.html')
ANCHOR = "$('#zin').onclick = () => goLevel(level() + 1);"
MARK = '/* phone zoom (22 Nov) */'
CODE = MARK + r""" (() => { const NARROW = () => aw < 700, MIDY = {};
  const midY = f => { if (MIDY[f] == null) { const ys = Object.values(LAY.nodes).filter(n => n.f === f).map(n => n.y).sort((a, b) => a - b); MIDY[f] = ys.length ? ys[ys.length >> 1] : centre()[1]; } return MIDY[f]; };
  const zi = $('#zin').onclick, zo = $('#zout').onclick;
  $('#zin').onclick = e => { if (NARROW() && !tkey && !sel && !ekey && level() === 0) { const f = famAt(centre()[0]), F = LAY.fams[f], fx = (F.x0 + F.x1) / 2, y = midY(f); closePanel(); clearSpot();
      if (K_FAMILY() / view.k > 3) { nav = 0; return flyTo(Math.sqrt(view.k * K_FAMILY()), fx, y); }
      return goFamily(f, y); } return zi(e); };
  $('#zout').onclick = e => { if (NARROW() && !tkey && !sel && !ekey && level() === 1 && view.k / fitK > 3) { const [cx, cy] = centre(); nav = 0; curFam = null; return flyTo(Math.sqrt(view.k * fitK), cx, cy); } return zo(e); };
})();
"""

def main():
    s = open(T, encoding='utf-8').read()
    if MARK in s:
        print('phone_zoom: already applied'); return 0
    i = s.find(ANCHOR)
    if i < 0:
        print('phone_zoom: anchor not found'); return 1
    j = s.index('\n', i) + 1
    s = s[:j] + CODE + s[j:]
    open(T, 'w', encoding='utf-8').write(s)
    print('phone_zoom: applied')
    return 0

if __name__ == '__main__':
    sys.exit(main())
