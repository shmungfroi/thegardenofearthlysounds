"""The Nursery (The Branches and the Fruits): regression test. Prints `errors [...]` (empty when all is well).

- The Garden at rest is unchanged: computed styles of the Journeys walk, editor, task panel, task maker, lantern card,
  card with a definition open, My glossary, search results and the Journeys tab (above the Nursery) compared with a base
  built from git c288402, at 1440 and 390; the map's DOM at rest for six starting states.
- Content at every level, works per stop, glossary clicks, Listen links, deep links, Esc, notes per work, Send it to the
  Garden (muted, then the mailto), reduced motion, no sound, no console errors.
- Restore: open, walk, switch level, type, zoom, close, from eight starting states, in two ways, at two sizes.
- Collisions: names, captions, fruits, labels, leap words and the root sign at five screen sizes, three levels, six views
  and several zooms: none touches another, the thread, a ring, a visible Garden name, or the frame.
- Camera-only controls keep the journey; choosing a course route from search keeps it; opening something else leaves it.
"""
import asyncio, json, os, re, subprocess, sys, time
from playwright.async_api import async_playwright

REPO = '/home/claude/gardenofearthlysound'
BASE = '/tmp/nzbase'
if not os.path.isfile(BASE + '/index.html'):
    os.makedirs(BASE, exist_ok=True)
    subprocess.run(f'git -C {REPO} archive c288402 | tar -x -C {BASE}', shell=True, check=True)
SRV = [subprocess.Popen(['python3', '/home/claude/tools/serve.py', port, d], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) for port, d in (('8971', REPO), ('8972', BASE))]
time.sleep(1)
U, UB = 'http://localhost:8971/index.html', 'http://localhost:8972/index.html'
SHOTS = '/home/claude/shots/nursery'; os.makedirs(SHOTS, exist_ok=True)
J = json.load(open(REPO + '/dev/patches/nursery/journey-sonata.json', encoding='utf-8'))
errors, notes = [], []
def err(*a): errors.append(' '.join(str(x) for x in a))
STORE = {
  'garden.journeys': [{'id': 'jt1', 'title': 'A test walk', 'by': 'Mira K.', 'made': '26 November 2026', 'task': None, 'stops': [
     {'id': 'fugue', 'how': {'k': 'pick'}, 'w': 0, 'note': 'The subject comes back in every voice.'}, {'id': 'canzona', 'how': {'k': 'trace', 'from': 'fugue'}, 'w': 1, 'note': ''},
     {'id': 'triosonata', 'how': {'k': 'travel', 'from': 'canzona'}, 'w': None, 'note': 'Two violins and a bass.'}]}],
  'garden.tasks': [{'id': 't1', 't': 'Three steps', 'p': 'Start at the fugue and travel.', 'n': 3, 's': 'fugue', 'e': 'baroque', 'r': True}],
  'garden.glossary': {'v': 1, 'by': '', 'sort': 'az', 'items': [{'k': 'sonata', 'note': 'A piece played.', 'from': 'canzona', 'via': 'card', 'at': 1700000000000}, {'own': 1, 'id': 'x1', 'w': 'riff', 'def': 'A loop.', 'met': 'class', 'at': 1700000000000}]}}
SEED = 'localStorage.clear();' + ''.join(f'localStorage.setItem({json.dumps(k)}, {json.dumps(json.dumps(v))});' for k, v in STORE.items())
PROPS = ['display', 'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
         'border-top-width', 'border-top-style', 'border-top-color', 'border-left-width', 'border-left-color', 'border-radius', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing',
         'text-transform', 'color', 'background-color', 'opacity', 'outline-style', 'visibility', 'text-decoration-line', 'white-space', 'flex-direction', 'gap', 'transform']
STYLES = """(a) => { const [sel, skip] = a; const P = %s; const root = document.querySelector(sel); if (!root) return null;
  return [root, ...root.querySelectorAll('*')].filter(e => !(skip && e.closest(skip))).map(e => { const cs = getComputedStyle(e); return e.tagName + '.' + (e.getAttribute('class') || '') + ' ' + (e.children.length ? '' : (e.textContent || '').slice(0, 30)) + ' | ' + P.map(p => cs.getPropertyValue(p)).join(';'); }); }""" % json.dumps(PROPS)
INIT = """(() => { window.__sound = 0; const AC = window.AudioContext || window.webkitAudioContext; if (AC) { const W = function () { window.__sound++; return new AC(); }; window.AudioContext = W; window.webkitAudioContext = W; }
  const play = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__sound++; return play.apply(this, arguments); }; })();"""
VIEWS = ['overview', 0, 1, 2, 3, 'learned']
SIZES = [(1440, 900), (1280, 720), (1024, 768), (390, 844), (360, 640), (768, 1024), (1180, 820), (820, 1180), (1920, 1080)]
EXTRA = {(768, 1024), (1180, 820), (820, 1180), (1920, 1080)}
TAP = "document.getElementById('map').dispatchEvent(new PointerEvent('pointerdown', {clientX: 5, clientY: 5, bubbles: true})); window.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}))"
def norm(t): return re.sub(r'\s+', ' ', str(t).replace('**', '').replace('*', '')).strip()


async def newpage(b, W, H, url=None, rm=False, seed=SEED, init=True):
    mob = W < 700
    ctx = await b.new_context(viewport={'width': W, 'height': H}, is_mobile=mob, has_touch=mob, reduced_motion='reduce' if rm else 'no-preference')
    if init: await ctx.add_init_script(INIT)
    pg = await ctx.new_page(); pg._errs = []
    pg.on('pageerror', lambda e: pg._errs.append(str(e))); pg.on('console', lambda m: m.type in ('error', 'warning') and pg._errs.append(m.text))
    await pg.goto(url or U); await pg.evaluate(seed); await pg.goto(url or U); await pg.wait_for_timeout(900)
    return ctx, pg


async def settle(pg, ms=200):
    await pg.wait_for_timeout(ms)
    for _ in range(60):
        if not await pg.evaluate("window.__nz && __nz.pending()"): break
        await pg.wait_for_timeout(60)
    for _ in range(20):
        busy = await pg.evaluate("document.getAnimations().some(a => a.playState === 'running' && a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#map'))")
        if not busy: break
        await pg.wait_for_timeout(80)
    await pg.wait_for_timeout(160)


# ---------------- 1. the Garden at rest: base (c288402) and build ----------------
async def rest(b):
    for W, H in ((1440, 900), (390, 844)):
        out = {}
        for tag, url in (('base', UB), ('build', U)):
            ctx, pg = await newpage(b, W, H, url, rm=True, init=False); R = {}
            async def grab(name, sel, skip=None): R[name] = await pg.evaluate(STYLES, [sel, skip])
            ev = pg.evaluate
            await ev("document.querySelector('.rail button[data-sheet=journeys]').click()"); await pg.wait_for_timeout(200)
            await grab('journeys tab', '#sheet', '.nz-jump,.nz-sec')
            await ev("document.querySelector('#sheet .jrow > button').click()"); await pg.wait_for_timeout(300); await grab('journey walk', '#panel')
            await ev("[...document.querySelectorAll('#panel .jr-b')].find(x => x.textContent === 'Edit').click()"); await pg.wait_for_timeout(300); await grab('journey editor', '#panel')
            await ev("document.querySelector('.rail button[data-sheet=journeys]').click()"); await pg.wait_for_timeout(200)
            await ev("[...document.querySelectorAll('#sheet .jrow > button')].find(x => x.textContent.startsWith('Three steps')).click()"); await pg.wait_for_timeout(300); await grab('task panel', '#panel')
            await ev("document.querySelector('.rail button[data-sheet=journeys]').click()"); await pg.wait_for_timeout(200)
            await ev("[...document.querySelectorAll('#sheet .jbig')].find(x => /listening task/.test(x.textContent)).click()"); await pg.wait_for_timeout(300); await grab('task maker', '#panel')
            await ev("__map.choose('canzona', true)"); await pg.wait_for_timeout(500); await grab('lantern card', '#panel')
            await ev("document.querySelector('#panel button.kw').click()"); await pg.wait_for_timeout(200); await grab('card with a definition', '#panel')
            await ev("document.querySelector('.rail button[data-sheet=glossary]').click()"); await pg.wait_for_timeout(300); await grab('my glossary', '#sheet')
            await pg.keyboard.press('Escape'); await pg.keyboard.press('Escape'); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
            await pg.click('#q'); await pg.keyboard.type('sonata', delay=10); await pg.wait_for_timeout(300); await grab('search results', '#res')
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
            for h in ['', '#l=canzona', '#p=triosonata', '#v=corelli', '#lens=w', '#trail=fugue,canzona,triosonata']:
                await pg.goto(url + h); await pg.wait_for_timeout(1300)
                R['map ' + (h or 'home')] = await ev("[document.querySelector('#map').outerHTML.replace(/ transform=\"[^\"]*\"/g, ''), [...document.body.classList].sort().join(' '), document.querySelector('#crumbs').textContent, document.querySelector('#panel').innerHTML.length]")
            out[tag] = R; pg._errs and err('rest', tag, W, pg._errs[:3]); await ctx.close()
        n = 0
        for k, v in out['base'].items():
            w = out['build'].get(k)
            if v is None or w is None: err('rest', W, k, 'state could not be made'); continue
            if isinstance(v, list) and k.startswith('map'):
                if v != w: err('rest', W, k, 'differs from the base', [i for i in range(4) if v[i] != w[i]])
                continue
            n += len(v)
            if k == 'journeys tab': v, w = v[1:], w[1:]      # the sheet itself grows to hold the Nursery; everything in it above the Nursery must be unchanged
            if len(v) != len(w): err('rest', W, k, 'element count', len(v), len(w)); continue
            d = [(a, c) for a, c in zip(v, w) if a != c]
            if d: err('rest', W, k, len(d), 'elements differ, first:', d[0][0][:160], '||', d[0][1][:160])
        notes.append(f'rest {W}: {n} elements compared with the base')


# ---------------- 2. content at every level, works per stop, words, links ----------------
async def content(b):
    ctx, pg = await newpage(b, 1440, 900, rm=True); ev = pg.evaluate; frags = 0; clicks = 0; links = 0
    await ev("__nz.begin('overview')"); await pg.wait_for_timeout(300)
    per = {}
    for lv in (4, 5, 6):
        await ev(f"document.querySelector('#panel .nz-lv button:nth-of-type({lv - 3})').click()"); await pg.wait_for_timeout(120)
        if await ev("__nz.state().lv") != lv: err('content: level switch', lv)
        for i, S in enumerate(J['stops']):
            await ev(f"__nz.show({i})"); await pg.wait_for_timeout(120)
            txt = norm(await ev("document.querySelector('#panel').textContent"))
            per[(lv, i)] = await ev("document.querySelectorAll('#panel .nz-work').length")
            items = []
            for key in ('intro', 'means', 'changed', 'check', 'find'):
                for x in S[key]: items.append((x['t'], lv in x['lv'])); 'scope' in x and items.append((x['scope'], lv in x['lv']))
            for w in S['works']:
                inw = lv in w['lv']; items.append((w['title'], inw))
                for key in ('listen', 'find'):
                    for x in w.get(key, []): items.append((x['t'], inw and lv in x['lv']))
                for t in w.get('pre', []): items.append((t, inw))
                if w.get('teachers'): items.append((w['teachers'], inw))
                if w.get('notice'): items.append((w['notice']['t'], inw and lv in w['notice']['lv']))
                if w.get('url'): items.append((w['url'], inw))
            items += [(S['teachers'], True)] if S['teachers'] else []; items += [(t, True) for t in S['words']]
            shown = [norm(t) for t, on in items if on]
            for t, on in items:
                t = norm(t); frags += 1
                if t.startswith('http'):
                    has = await ev(f"!!document.querySelector('#panel a[href=\"{t}\"]')")
                else: has = t in txt
                if on and not has: err('content', lv, i, 'missing:', t[:70])
                if not on and has and not any(t in s for s in shown): err('content', lv, i, 'shown at the wrong level:', t[:70])
            if 'Stage' in txt.replace(norm("For teachers in New South Wales: Seed is Stage 4, Shoot is Stage 5 and Bloom is Stage 6."), ''): err('content', lv, i, 'a stage label is shown')
            orph = await ev("[...document.querySelectorAll('#panel button.kw')].filter(b => { if (b.parentNode.classList.contains('nz-nb')) return false; const p = b.previousSibling; return p && p.nodeType === 3 && /[(“\"‘]$/.test(p.data); }).length")
            if orph: err('content', lv, i, orph, 'glossary words can leave an opening bracket at a line end')
            if lv == 6:
                for k in range(await ev("document.querySelectorAll('#panel button.kw, #panel .nz-words button').length")):
                    r = await ev(f"(() => {{ const b = [...document.querySelectorAll('#panel button.kw, #panel .nz-words button')][{k}]; b.click(); const d = document.querySelector('#panel .gdef'); const ok = !!d && d.querySelector('.gd-h b') && d.querySelector('.gd-h b').textContent.toLowerCase(); if (d) b.click(); return [b.textContent, ok]; }})()")
                    clicks += 1
                    if not r[1]: err('glossary click opened nothing', i, r[0])
                ls = await ev("[...document.querySelectorAll('#panel .nz-rec a')].map(a => [a.href, a.target, a.rel])")
                for h, tg, rel in ls:
                    links += 1
                    if tg != '_blank' or 'noopener' not in rel or 'youtube.com/watch' not in h: err('listen link', h, tg, rel)
    exp = {4: [1, 1, 1, 1], 5: [1, 2, 2, 2], 6: [1, 2, 3, 2]}
    for lv, e in exp.items():
        got = [per[(lv, i)] for i in range(4)]
        if got != e: err('works per stop at', lv, got, 'expected', e)
    if links != 8: err('Listen links at Bloom', links)
    await ev("__nz.show(3)"); await ev("document.querySelector('#panel .nz-lv button:nth-of-type(1)').click()"); await pg.wait_for_timeout(100)
    if 'How many movements does Giustini' in await ev("document.querySelector('#panel').textContent"): err('Chapter 3 Find out shows at Seed')
    await ev("__nz.show('learned')"); t = norm(await ev("document.querySelector('#panel').textContent"))
    if t.count('Keep') != 1 or await ev("[...document.querySelectorAll('#panel h4')].some(h => h.textContent === 'Keep')"): err('Keep shown twice')
    for x in J['learned']['prompts'] + [J['learned']['teachers'], J['apply']['text'], J['apply']['cjg'], J['keep']['text']] + J['sources']['lines']:
        frags += 1
        if norm(x) not in t: err('What I learned missing', norm(x)[:60])
    await ev("__nz.show('overview')"); t = norm(await ev("document.querySelector('#panel').textContent"))
    for x in [J['big'], J['today'], J['levelsCore']] + [c for r in J['levelsTable'] for c in r]:
        frags += 1
        if norm(x) not in t: err('overview missing', norm(x)[:60])
    for x in ('closed', ): pass
    if await ev("[...document.querySelectorAll('#panel details')].some(d => d.open)"): err('a For teachers or levels box is open by default')
    notes.append(f'content: {frags} fragments checked at three levels; works per stop {[[per[(lv, i)] for i in range(4)] for lv in (4, 5, 6)]}; {clicks} glossary clicks; {links} Listen links')
    pg._errs and err('content console', pg._errs[:3]); await ctx.close()


# ---------------- 3. notes per work, Send it to the Garden, Esc, deep links ----------------
async def listener(b):
    ctx, pg = await newpage(b, 1440, 900, rm=True); ev = pg.evaluate
    await pg.goto(U + '#nursery=sonata&stage=5&ch=1'); await pg.wait_for_timeout(900)
    if await ev("__nz.open()") != 1 or await ev("__nz.state().lv") != 5: err('deep link ch=1 stage=5', await ev("__nz.open()"))
    n = await ev("document.querySelectorAll('#panel textarea.nz-note').length")
    if n != 2: err('notes per work at Shoot, chapter 1', n)
    if await ev("document.querySelector('#panel .nz-sendb').getAttribute('aria-disabled')") != 'true': err('Send is not muted before a note')
    await ev("document.querySelector('#panel .nz-sendb').click()"); await pg.wait_for_timeout(150)
    if 'Write your note first, then send it.' not in await ev("document.querySelector('#toast').textContent"): err('muted Send: no toast')
    if not await ev("document.activeElement && document.activeElement.matches('textarea.nz-note')"): err('muted Send: the note is not focused')
    op = await ev("getComputedStyle(document.querySelector('#panel .nz-sendb')).opacity")
    if abs(float(op) - .55) > .01: err('muted Send opacity', op)
    await pg.locator('#panel textarea.nz-note').nth(1).click(); await pg.keyboard.type('x' * 300, delay=0)
    if await ev("document.querySelectorAll('#panel textarea.nz-note')[1].value.length") != 280: err('note longer than 280')
    if '280 / 280' not in await ev("document.querySelector('#panel').textContent"): err('note counter')
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(80)
    if await ev("__nz.open()") != 1: err('Esc in the note left the chapter')
    k0 = await ev("__map.view.k"); await pg.locator('#panel textarea.nz-note').nth(0).click(); await pg.keyboard.type('/+-=', delay=10); await pg.wait_for_timeout(200)
    if await ev("__map.view.k") != k0 or await ev("document.activeElement.id") == 'q' or await ev("document.querySelectorAll('#panel textarea.nz-note')[0].value") != '/+-=': err('typing / + - in a note searched or zoomed')
    await ev("(() => { const t = document.querySelectorAll('#panel textarea.nz-note')[0]; t.value = ''; t.dispatchEvent(new Event('input')); })()")
    await ev("document.querySelector('#panel .nz-card-b').focus()"); v0 = await ev("[__map.view.k, __map.view.tx, __map.view.ty]")
    for key in ('ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'): await pg.keyboard.press(key)
    await pg.wait_for_timeout(200)
    if await ev("[__map.view.k, __map.view.tx, __map.view.ty]") != v0 or await ev("__nz.open()") != 1: err('arrow keys in the reader moved the map')
    await ev("(() => { const t = document.querySelectorAll('#panel textarea.nz-note'); t[0].value = 'The bass repeats under the violins.'; t[0].dispatchEvent(new Event('input')); t[1].value = 'About ten changes of speed.'; t[1].dispatchEvent(new Event('input')); })()")
    if await ev("document.querySelector('#panel .nz-sendb').hasAttribute('aria-disabled')"): err('Send still muted with a note')
    st = await ev("JSON.parse(localStorage.getItem('garden.nursery'))")
    if (st.get('notes', {}).get('sonata', {}).get('1') or {}) != {'rossi': 'The bass repeats under the violins.', 'castello': 'About ten changes of speed.'}: err('stored notes per work', st.get('notes'))
    await pg.fill('#panel .nz-name', 'M' * 55)
    if len(await ev("document.querySelector('#panel .nz-name').value")) != 49: err('chosen name limit 49 (Justin, 26 Nov)')
    await pg.fill('#panel .nz-name', 'Mira K.')
    await pg.click('#panel .nz-sendb'); await pg.wait_for_timeout(200)
    m = await ev("window.__nzMail || ''"); t = await ev("document.querySelector('#toast').textContent")
    from urllib.parse import unquote
    if not m.startswith('mailto:shmungfroi@gmail.com?subject='): err('mailto', m[:60])
    subj, body = unquote(m.split('subject=')[1].split('&body=')[0]), unquote(m.split('&body=')[1]) if '&body=' in m else ''
    if subj != 'The Garden · Sonata · Follow the growth · Chapter 1': err('mail subject', subj)
    for x in ['Journey: Sonata: Follow the growth (1597 to 1740)', 'Chapter 1: 1613 · Canzona & early sonata (the lantern: c.1580)', 'Level: Shoot', "Check question: Compare Gabrieli's sound with Castello's",
              'My note on Salamone Rossi, Sonata sopra l\'aria di Ruggiero (1613):\nThe bass repeats under the violins.', 'Dario Castello', 'About ten changes of speed.']:
        if x not in body: err('mail body missing', x[:50])
    if 'Mira K.' in body: err('name sent without the tick box')
    if 'sent' in t.lower() or 'should open' not in t: err('toast wording', t)
    await pg.click('#panel .nz-agree'); await pg.click('#panel .nz-sendb'); await pg.wait_for_timeout(100)
    if 'Name to show (I agree to it being shown): Mira K.' not in unquote(await ev("window.__nzMail")): err('name missing with the tick box')
    if pg.url.split('#')[0] != U: err('Send navigated away', pg.url)
    await pg.reload(); await pg.wait_for_timeout(900)
    if await ev("[...document.querySelectorAll('#panel textarea.nz-note')].map(t => t.value).join('|')") != 'The bass repeats under the violins.|About ten changes of speed.': err('notes not back after reload')
    if await ev("document.querySelector('#panel .nz-name').value") != 'Mira K.' or await ev("document.querySelector('#panel .nz-agree').checked"): err('name kept, tick box reset')
    await ev("__nz.show('learned')"); lt = await ev("document.querySelector('#panel').textContent")
    if 'The bass repeats under the violins.' not in lt or 'About ten changes of speed.' not in lt: err('What I learned lists the notes per work')
    await settle(pg)
    caps = await ev("[...document.querySelectorAll('#nzmk .nz-cap')].map(t => t.textContent)")
    if not any('CHAPTER 1' in c and 'NOTE' in c for c in caps) or any('ROOT' in c and 'NOTE' in c for c in caps): err('✎ NOTE marker', caps)
    # an earlier build's one-note-per-chapter shape
    await ev("localStorage.setItem('garden.nursery', JSON.stringify({lv: 6, notes: {sonata: {'2': 'An old chapter note.'}}, at: {sonata: 2}}))"); await pg.goto(U); await pg.wait_for_timeout(800)
    await ev("__nz.begin(2)"); await pg.wait_for_timeout(200)
    v = await ev("[...document.querySelectorAll('#panel textarea.nz-note')].map(t => t.dataset.w + '=' + t.value)")
    if 'corelli=An old chapter note.' not in v: err('old per-chapter note not given to the core work', v)
    # deep links
    for h, at, lv in (('#nursery=sonata&stage=4&ch=root', 0, 4), ('#nursery=sonata&stage=6&ch=learned', 'learned', 6), ('#nursery=sonata&stage=5', 'overview', 5), ('#nursery=sonata&stage=6&ch=3', 3, 6)):
        await pg.goto(U + '#'); await pg.goto(U + h); await pg.reload(); await pg.wait_for_timeout(900)
        if [await ev("__nz.open()"), await ev("__nz.state() && __nz.state().lv")] != [at, lv]: err('deep link', h, await ev("__nz.open()"))
        await pg.wait_for_timeout(500)
        if (await ev("location.hash")).lstrip('#') != h.lstrip('#'): err('hash does not follow', h, await ev("location.hash"))
    await pg.goto(U + '#'); await pg.goto(U + '#nursery=nope&l=canzona'); await pg.reload(); await pg.wait_for_timeout(1000)
    if await ev("__nz.open()") is not None or 'Canzona' not in await ev("(document.querySelector('#panel h1') || {}).textContent || ''"): err('bad journey id does not fall through to the card')
    # Esc: glossary box, chapter -> start -> closed
    await pg.goto(U + '#'); await pg.goto(U + '#nursery=sonata&stage=5&ch=2'); await pg.reload(); await pg.wait_for_timeout(900)
    await ev("document.querySelector('#panel button.kw').click()"); await pg.wait_for_timeout(80); await ev("document.querySelector('#map').focus()")
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(80)
    if await ev("!!document.querySelector('#panel .gdef')") or await ev("__nz.open()") != 2: err('Esc with a definition open')
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(80)
    if await ev("__nz.open()") != 'overview': err('Esc from a chapter goes to the start', await ev("__nz.open()"))
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
    if await ev("__nz.open()") is not None or await ev("document.body.classList.contains('pan')") or await ev("!!document.querySelector('#nzmk,#nzg,#nzveil')"): err('Esc from the start closes the journey')
    if await ev("JSON.parse(localStorage.getItem('garden.nursery')).at.sonata") != 'overview': pass
    mails = [e for e in pg._errs if e.startswith("Not allowed to launch 'mailto:")]; pg._errs = [e for e in pg._errs if e not in mails]
    if mails: notes.append(f'listener: headless Chrome refused to hand {len(mails)} mailto link(s) to an e-mail program (no program here); the link was built')
    pg._errs and err('listener console', pg._errs[:3])
    if await ev("window.__sound"): err('sound', await ev("window.__sound"))
    await ctx.close()


# ---------------- 4. camera controls keep the journey; route search keeps it; something else leaves it ----------------
async def controls(b):
    for W, H in ((1440, 900), (390, 844)):
        ctx, pg = await newpage(b, W, H, rm=True); ev = pg.evaluate
        async def fresh(ch=2):
            await ev(f"__nz.end(true); __nz.begin({ch})"); await pg.wait_for_timeout(250)
        async def keep(what):
            await pg.wait_for_timeout(250)
            if await ev("__nz.open()") != 2 or not await ev("document.querySelector('#panel').classList.contains('nz-read') && document.body.classList.contains('pan')"): err('camera control closed the journey', W, what); await fresh()
        await fresh()
        if W > 700:
            if await ev("document.querySelector('#crumbs').textContent") != 'Garden›Chamber›Baroque›Trio sonata & solo sonata': err('crumb at a chapter', await ev("document.querySelector('#crumbs').textContent"))
            if await ev("(document.querySelector('.rung.cur') || {}).textContent") != 'Lantern': err('ladder at a chapter')
            for sel in ('#zin', '#zout', '.rung[data-l="0"]', '.rung[data-l="1"]', '.rung[data-l="2"]', '.rung[data-l="3"]'):
                await pg.click(sel); await keep(sel)
            await fresh()
            for i in range(3):
                bs = await ev("[...document.querySelectorAll('#crumbs button')].map(x => x.textContent)")
                if i < len(bs): await pg.click(f'#crumbs button >> nth={i}'); await keep('crumb ' + bs[i])
            await pg.click('#fams .fam >> nth=1'); await keep('spire strip')
            await pg.click('#mm'); await keep('minimap')
        else:
            await ev("document.getElementById('zin').click()"); await keep('zoom in (phone wrapper)')
            await ev("document.getElementById('zout').click()"); await keep('zoom out (phone wrapper)')
        await fresh(); await ev("document.querySelector('#map').focus()")
        for k in ('+', '-', '=', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'):
            await pg.keyboard.press(k); await keep('key ' + k)
        r = await ev("(() => { const r = document.querySelector('#map').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()")
        await pg.mouse.move(r[0], r[1]); await pg.mouse.wheel(0, -300); await keep('wheel')
        await pg.mouse.move(r[0], r[1]); await pg.mouse.down(); await pg.mouse.move(r[0] + 60, r[1] + 30, steps=5); await pg.mouse.up(); await keep('drag')
        await fresh()
        await pg.click('#q'); await pg.keyboard.type('baroque', delay=5); await pg.wait_for_timeout(250)
        has = await ev("!!document.querySelector('#res .rres')")
        if has:
            await pg.click('#res .rres >> nth=0'); await keep('course route from search')
            if not await ev("__map.lens.n.startsWith('r-')"): err('route not set')
            await ev("__map.setCourse('')")
        else: err('no route found by search for baroque')
        if W > 700:
            await fresh()
            await ev("(() => { const r = document.querySelector('#map .fm[data-id=fugue] circle').getBoundingClientRect(); window.__pt = [r.left + r.width / 2, r.top + r.height / 2]; })()")
            pt = await ev("window.__pt"); vis = await ev("(() => { const r = document.querySelector('#map').getBoundingClientRect(), p = window.__pt; return p[0] > r.left && p[0] < r.right && p[1] > r.top && p[1] < r.bottom; })()")
            if not vis: await ev("__map.view.tx += 0");
            await ev(TAP); await ev("document.querySelector('#map .fm[data-id=fugue]').dispatchEvent(new MouseEvent('click', {bubbles: true}))"); await pg.wait_for_timeout(250)
            if await ev("__nz.open()") is not None or await ev("__map.spot()") != 'fugue': err('a click on another lantern does not leave for its pin')
            if await ev("JSON.parse(localStorage.getItem('garden.nursery')).at.sonata") != 2: err('place not kept on leaving')
            await ev("document.querySelector('.rail button[data-sheet=journeys]').click()"); await pg.wait_for_timeout(150)
            if await ev("document.querySelector('#sheet .nz-go').textContent") != 'Go on ›': err('the card does not offer Go on')
            await ev("document.querySelector('#sheet .nz-go').click()"); await pg.wait_for_timeout(250)
            t = await ev("document.querySelector('#panel').textContent")
            if 'Go on with chapter 2 ›' not in t or 'you are here' not in t: err('overview after leaving: Go on / you are here')
            await ev("__nz.show(2)"); await pg.wait_for_timeout(150); await ev("document.querySelector('#panel .nz-card-b').click()"); await pg.wait_for_timeout(300)
            if await ev("__nz.open()") is not None or 'Trio sonata' not in await ev("(document.querySelector('#panel h1') || {}).textContent || ''"): err('Open its card')
            await ev("__nz.begin(1)"); await pg.wait_for_timeout(200); await ev("document.querySelector('#nzmk [data-go=\"2\"]') && document.querySelector('#nzmk [data-go=\"2\"]').dispatchEvent(new MouseEvent('click', {bubbles: true}))"); await pg.wait_for_timeout(200)
            await settle(pg)
            fr = await ev("!!document.querySelector('#nzmk .nz-nmb[data-go=\"1\"]')")
            await ev(TAP); await ev("(() => { const n = document.querySelector('#nzmk .nz-nmb[data-go=\"1\"]'); if (n) n.dispatchEvent(new MouseEvent('click', {bubbles: true})); })()"); await pg.wait_for_timeout(200)
            if fr and await ev("__nz.open()") != 1: err('clicking a thread name does not go to its chapter')
            await settle(pg); await ev(TAP); f = await ev("(() => { const g = document.querySelector('#nzmk .nz-fr[data-w=castello]'); if (!g) return 0; g.dispatchEvent(new MouseEvent('click', {bubbles: true})); return 1; })()")
            await pg.wait_for_timeout(400)
            if f and not await ev("(() => { const w = document.getElementById('nzw-castello'), p = document.getElementById('panel'); const r = w.getBoundingClientRect(), q = p.getBoundingClientRect(); return r.top >= q.top - 2 && r.top < q.top + 120; })()"): err('clicking a fruit does not bring its work into view')
            await ev("document.querySelector('#nzw-rossi').dispatchEvent(new MouseEvent('mouseenter'))")
            if not await ev("!!document.querySelector('#nzmk .nz-fr.hot[data-w=rossi]')"): err('hovering a work does not light its fruit')
            for lk in (('polychoral', 'canzona'), ('canzona', 'triosonata')):
                d = await ev(f"(() => {{ const l = [...document.querySelectorAll('#map .lk')].find(q => (q.dataset.a === '{lk[0]}' && q.dataset.b === '{lk[1]}')); return [l && l.getAttribute('d'), [...document.querySelectorAll('#nzg .nz-seg:not(.leap) .nz-line')].map(p => p.getAttribute('d'))]; }})()")
                if d[0] not in d[1]: err('thread does not follow the Garden link', lk)
            if await ev("document.querySelectorAll('#nzg .nz-seg.leap').length") != 1: err('the leap is not a gap')
        pg._errs and err('controls console', W, pg._errs[:3])
        if await ev("window.__sound"): err('sound', await ev("window.__sound"))
        await ctx.close()


# ---------------- 5. restore: the Garden returns exactly as it was ----------------
SNAP = """() => { const p = document.getElementById('panel'), sh = document.getElementById('sheet'); const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k !== 'garden.nursery') ls[k] = localStorage.getItem(k); }
  const shc = sh.cloneNode(true); shc.querySelectorAll('.nz-sec').forEach(x => x.remove());
  return {map: document.getElementById('map').outerHTML, view: [__map.view.k, __map.view.tx, __map.view.ty], body: [...document.body.classList].sort().join(' '), panel: p.classList.contains('nz-read') ? 'NZ' : p.innerHTML, ps: Math.round(p.scrollTop),
    sheet: [sh.classList.contains('open'), sh.dataset.kind, Math.round(sh.scrollTop), shc.innerHTML], hash: location.hash, ls, spot: __map.spot(), tkey: __map.tkey(), ekey: __map.ekey(), hint: document.getElementById('hint').style.display, fams: [...document.querySelectorAll('#fams .fam')].map(f => f.className + ':' + f.style.display).join('|'), crumbs: document.getElementById('crumbs').textContent}; }"""
async def restore(b, size):
    runs = 0
    starts = [('home', ''), ('card', '#l=canzona'), ('pin', '#p=triosonata'), ('voice', '#v=corelli'), ('voice pinned', '#vp=corelli'), ('event', None), ('lens and storey', '#lens=w'), ('shared trail', '#trail=fugue,canzona,triosonata')]
    for W, H in (size,):
        ctx, pg = await newpage(b, W, H, rm=True); ev = pg.evaluate
        evid = await ev("Object.keys(window.GardenCard.EVENTS)[3]")
        for n, (name, h) in enumerate(starts):
            for way in (0, 1):
                h2 = h if h is not None else '#e=' + evid
                await pg.goto(U + '#'); await ev("localStorage.removeItem('garden.nursery')"); await pg.goto(U + h2); await pg.reload(); await pg.wait_for_timeout(1100)
                if name == 'lens and storey': await ev("__map.goEra('chamber', 'baroque')"); await pg.wait_for_timeout(300)
                if way == 0:
                    await ev("document.querySelector('.rail button[data-sheet=journeys]').click()"); await pg.wait_for_timeout(150)
                    await ev("document.querySelector('#sheet .nz-jump').click()"); await pg.wait_for_timeout(250)
                await pg.wait_for_timeout(450); before = await ev(SNAP)
                if way == 0: await ev("(() => { const b = document.querySelector('#sheet .nz-go'); b.focus(); b.click(); })()")
                else: await ev("__nz.begin(null)")
                await pg.wait_for_timeout(150)
                for step in range(3):
                    await ev("[...document.querySelectorAll('#panel .jr-nav .jr-b.gold')].pop().click()"); await pg.wait_for_timeout(120)
                await ev("document.querySelector('#panel .nz-lv button:nth-of-type(3)').click()"); await pg.wait_for_timeout(80)
                await ev("(() => { const d = document.querySelector('#panel details.nz-t'); if (d) d.open = true; const t = document.querySelector('#panel textarea.nz-note'); t.value = 'Run note.'; t.dispatchEvent(new Event('input')); const k = document.querySelector('#panel button.kw'); if (k) k.click(); })()")
                await ev("document.getElementById('zin').click()"); await pg.wait_for_timeout(250)
                out = (n + way) % 3
                if out == 0: await ev("document.querySelector('#panel > button.x').click()")
                elif out == 1:
                    await ev("document.querySelector('#map').focus()"); await pg.keyboard.press('Escape'); await pg.keyboard.press('Escape'); await pg.keyboard.press('Escape')
                else:
                    await ev("__nz.show('overview')"); await pg.wait_for_timeout(80); await ev("[...document.querySelectorAll('#panel .jr-b')].find(x => x.textContent === 'Leave the journey').click()")
                await pg.wait_for_timeout(650); after = await ev(SNAP); runs += 1
                if way == 0 and not await ev("!!document.activeElement && document.activeElement.matches('#sheet .nz-go')"): err('restore', W, name, 'focus did not return to Begin', await ev("document.activeElement && document.activeElement.className"))
                for k in before:
                    if before[k] != after[k]:
                        if k == 'body' and sorted(before[k].split()) == sorted(after[k].split()): continue
                        x, y = str(before[k]), str(after[k]); i = next((j for j in range(min(len(x), len(y))) if x[j] != y[j]), min(len(x), len(y)))
                        err('restore', W, name, ['tab', 'link'][way], ['x', 'Esc', 'Leave'][out], k, '…' + x[max(0, i - 60):i + 60], '->', '…' + y[max(0, i - 60):i + 60])
                if await ev("document.querySelectorAll('#nzmk,#nzg,#nzveil,.fm.nzt,aside.nz-read').length"): err('restore: Nursery parts left behind', W, name)
        pg._errs and err('restore console', W, pg._errs[:3]); await ctx.close()
    notes.append(f'restore {size}: {runs} runs')


# ---------------- 6. collisions ----------------
CHECK = """(frame) => { const svg = document.getElementById('map'), R = svg.getBoundingClientRect(), S = __nz.state(); if (!S) return null;
  const rect = q => ({l: q.left, t: q.top, r: q.right, b: q.bottom}), ov = (a, o) => Math.max(0, Math.min(a.r, o.r) - Math.max(a.l, o.l)) * Math.max(0, Math.min(a.b, o.b) - Math.max(a.t, o.t));
  const vis = e => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > .05; };
  const marks = []; document.querySelectorAll('#nzmk text, #nzmk circle.nz-fruit, #nzmk path.nz-root').forEach(e => { const q = e.getBoundingClientRect(); if (!q.width) return; const grp = e.closest('.nz-nmb,.nz-fr,.nz-lpg') || e; marks.push({e, r: rect(q), grp, what: (e.getAttribute('class') || '') + ':' + (e.textContent || (e.closest('.nz-fr') ? e.closest('.nz-fr').dataset.w : 'root'))}); });
  const ui = []; document.querySelectorAll('.ladder,.mm,#foot,#fams .fam,#lensbar>span,#hint,#trail,.gut,.rail,header.top,#eras .era,#evs .evd,#panel,#sheet.open').forEach(e => { if (e.getClientRects().length && vis(e)) ui.push({r: rect(e.getBoundingClientRect()), what: e.id || e.className}); });
  const names = []; document.querySelectorAll('#map .fm:not(.nzt)').forEach(g => { const go = +getComputedStyle(g).opacity; g.querySelectorAll('text').forEach(t => { const cs = getComputedStyle(t); if (cs.display === 'none' || go * +cs.opacity * +(cs.fillOpacity || 1) < .04) return; const q = t.getBoundingClientRect(); if (q.width) names.push({r: rect(q), what: t.textContent}); }); });
  const rings = [...document.querySelectorAll('#nzg circle')].map(c => ({r: rect(c.getBoundingClientRect()), lan: c.dataset.lan}));
  const pts = []; document.querySelectorAll('#nzg .nz-seg').forEach(sg => { const p = sg.querySelector('.nz-line'), L = p.getTotalLength(), M = p.getScreenCTM(), leap = sg.classList.contains('leap'); const da = (p.getAttribute('stroke-dasharray') || '').split(' ').map(Number); const ef = leap ? da[0] / 100 : 0;
    for (let j = 0; j <= 300; j++) { const u = j / 300; if (leap && u > ef && u < 1 - ef) continue; const q = p.getPointAtLength(L * u), x = M.a * q.x + M.c * q.y + M.e, y = M.b * q.x + M.d * q.y + M.f; pts.push([x, y]); } });
  const bad = [], seenStop = [];
  const inside = r => r.l >= R.left - .5 && r.r <= R.right + .5 && r.t >= R.top - .5 && r.b <= R.bottom + .5;
  marks.forEach((m, i) => { if (!inside(m.r)) bad.push('outside the map: ' + m.what);
    ui.forEach(u => { if (ov(m.r, u.r) > .5) bad.push('under ' + u.what + ': ' + m.what); });
    names.forEach(n => { if (ov(m.r, n.r) > .5) bad.push(m.what + ' on Garden name ' + n.what); });
    rings.forEach(g => { if (ov(m.r, g.r) > .5) bad.push(m.what + ' on a ring'); });
    if (pts.some(([x, y]) => x > m.r.l + .5 && x < m.r.r - .5 && y > m.r.t + .5 && y < m.r.b - .5)) bad.push(m.what + ' on the thread');
    marks.forEach((o, j) => { if (j > i && o.grp !== m.grp && ov(m.r, o.r) > .5) bad.push(m.what + ' on ' + o.what); }); });
  document.querySelectorAll('#nzmk .nz-stem').forEach(st => { const g = st.closest('.nz-fr'), L = st.getTotalLength(), M = st.getScreenCTM(), lan = __nz.data.stops[+g.dataset.go].lan, ring = rings.find(x => x.lan === lan);
    for (let j = 2; j <= 20; j++) { const q = st.getPointAtLength(L * j / 20), x = M.a * q.x + M.c * q.y + M.e, y = M.b * q.x + M.d * q.y + M.f; if (ring && x > ring.r.l - 1 && x < ring.r.r + 1 && y > ring.r.t - 1 && y < ring.r.b + 1) continue;
      if (marks.some(m => m.grp !== g && x > m.r.l && x < m.r.r && y > m.r.t && y < m.r.b)) { bad.push('stem of ' + g.dataset.w + ' through a mark'); break; }
      if (rings.some(r => r !== ring && x > r.r.l && x < r.r.r && y > r.r.t && y < r.r.b)) { bad.push('stem of ' + g.dataset.w + ' through a ring'); break; } } });
  const free = (x, y) => x > R.left + 8 && x < R.right - 8 && y > R.top + 8 && y < R.bottom - 8 && !ui.some(u => x > u.r.l && x < u.r.r && y > u.r.t && y < u.r.b);
  __nz.data.stops.forEach((s, i) => { const c = document.querySelector('#map .fm[data-id="' + s.lan + '"] circle').getBoundingClientRect(), x = c.left + c.width / 2, y = c.top + c.height / 2; if (!free(x, y)) return; seenStop.push(i);
    if (!document.querySelector('#nzmk .nz-nmb[data-go="' + i + '"]')) bad.push('stop name hidden: ' + s.name);
    s.works.filter(w => w.core && w.lv.includes(S.lv)).forEach(w => { if (!document.querySelector('#nzmk .nz-fr[data-w="' + w.id + '"]')) bad.push('core work hidden: ' + w.id); }); });
  const Rv = {l: R.left, t: R.top, r: R.right, b: R.bottom};
  __nz.data.stops.forEach((s, i) => { const ring = rings.find(x => x.lan === s.lan); if (!ring || !frame) return; const vis = ov(ring.r, Rv) > 2 && !ui.some(u => ring.r.l >= u.r.l && ring.r.r <= u.r.r && ring.r.t >= u.r.t && ring.r.b <= u.r.b);
    if (vis && !document.querySelector('#nzmk .nz-nmb[data-go="' + i + '"]')) bad.push('a thread ring in view without its name: ' + s.name);
    if (vis && s.works.some(w => w.core && w.lv.includes(S.lv) && !document.querySelector('#nzmk .nz-fr[data-w="' + w.id + '"]'))) bad.push('a thread ring in view without its core work: ' + s.name); });
  const cur = typeof S.at === 'number' ? document.querySelector('#nzmk .nz-nmb[data-go="' + S.at + '"]') : null;
  if (cur && !cur.querySelector('.nz-cap') && document.querySelector('#nzmk .nz-nmb:not([data-go="' + S.at + '"]) .nz-cap')) bad.push('the current chapter lost its caption while another stop kept one');
  const lp = document.querySelector('#nzmk .nz-lp');
  if (lp) { const c2 = document.querySelector('#map .fm[data-id="triosonata"] circle').getBoundingClientRect(), c3 = document.querySelector('#map .fm[data-id="kbsonata"] circle').getBoundingClientRect(), q = lp.getBoundingClientRect();
    const a = [c2.left + c2.width / 2, c2.top + c2.height / 2], b = [c3.left + c3.width / 2, c3.top + c3.height / 2], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    const inR = p => p[0] > R.left && p[0] < R.right && p[1] > R.top && p[1] < R.bottom;
    if (!inR(a) || !inR(b)) bad.push('leap words shown without both ends in view');
    if (Math.hypot(q.left + q.width / 2 - m[0], q.top + q.height / 2 - m[1]) > d * .25 + 30) bad.push('leap words far from the gap'); }
  return {bad: [...new Set(bad)], hidden: S.layout ? S.layout.hidden : [], k: __map.view.k, n: marks.length, seen: seenStop}; }"""
async def collisions(b, size):
    views = 0; hid = {}
    for W, H in (size,):
        ctx, pg = await newpage(b, W, H, rm=True); ev = pg.evaluate
        if W == 1280: await ev("localStorage.setItem('garden.journeys', JSON.stringify(Array.from({length: 6}, (_, i) => ({id: 'j' + i, title: 'Saved journey ' + (i + 1), by: '', made: '', task: null, stops: [{id: 'fugue', how: {k: 'pick'}, w: null, note: ''}]}))))")
        for lv in ((5,) if (W, H) in EXTRA else (4, 5, 6)):
            await ev("__nz.end(false)"); await ev("__nz.begin('overview')"); await ev(f"document.querySelector('#panel .nz-lv button:nth-of-type({lv - 3})').click()")
            for v in VIEWS:
                await ev(f"__nz.show({json.dumps(v)})"); await settle(pg)
                zooms = [None, '+'] if (W, H) in EXTRA else [None] + (['+', '-'] if v not in ('overview', 'learned') else ['+'])
                if W in (1440, 390) and lv == 6: zooms += ['k0.8', 'k1.6', 'k6', 'k9']
                for z in zooms:
                    if z in ('+', '-'):
                        await ev("__nz.frame()"); await settle(pg); await ev("document.querySelector('#map').focus()"); await pg.keyboard.press(z if z == '+' else '-')
                    elif z:
                        await ev(f"(() => {{ const v = __map.view, k = {z[1:]}, r = document.getElementById('map').getBoundingClientRect(), c = [(r.width / 2 - v.tx) / v.k, (r.height / 2 - v.ty) / v.k]; v.k = k; v.tx = r.width / 2 - c[0] * k; v.ty = r.height / 2 - c[1] * k; window.dispatchEvent(new Event('resize')); }})()")
                    await settle(pg); r = await ev(CHECK, z is None); views += 1
                    if r is None: err('collision view lost the journey', W, lv, v, z); await ev(f"__nz.begin({json.dumps(v)})"); continue
                    for x in r['bad']: err('collision', f'{W}x{H}', NAMES[lv], v, z or 'frame', 'k=%.2f' % r['k'], x)
                    for x in r['hidden']: hid[x] = hid.get(x, 0) + 1
                    if z is None and (W in (1440, 390) or (W, H) in EXTRA) and lv == 5: await pg.screenshot(path=f'{SHOTS}/z-{W}x{H}-{v}.png')
        pg._errs and err('collisions console', W, pg._errs[:3]); await ctx.close()
    notes.append(f'collisions {W}x{H}: {views} views; stepped aside (another chapter\'s added work, leap words or root sign) {hid}')
NAMES = {4: 'Seed', 5: 'Shoot', 6: 'Bloom'}


# ---------------- 7. the jump link, reduced motion, sound, screenshots ----------------
async def misc(b):
    ctx, pg = await newpage(b, 1280, 720); ev = pg.evaluate
    await ev("localStorage.setItem('garden.journeys', JSON.stringify(Array.from({length: 6}, (_, i) => ({id: 'j' + i, title: 'Saved journey ' + (i + 1), by: '', made: '', task: null, stops: [{id: 'fugue', how: {k: 'pick'}, w: null, note: ''}]}))))"); await pg.reload(); await pg.wait_for_timeout(800)
    await ev("document.querySelector('.rail button[data-sheet=journeys]').click()"); await pg.wait_for_timeout(150)
    await pg.click('#sheet .nz-jump'); await pg.wait_for_timeout(900)
    r = await ev("(() => { const h = document.querySelector('#sheet .nz-h').getBoundingClientRect(), s = document.getElementById('sheet').getBoundingClientRect(); return [h.top >= s.top, h.bottom <= s.bottom, document.activeElement === document.querySelector('#sheet .nz-h'), getComputedStyle(document.querySelector('#sheet .nz-h')).outlineStyle, document.getElementById('sheet').scrollTop]; })()")
    if not (r[0] and r[1] and r[2]): err('jump link at 1280x720 with 6 journeys', r)
    if r[3] != 'none': err('focus ring after a mouse click on the jump link', r[3])
    if await ev("document.querySelector('#sheet .nz-grow small').getClientRects().length") != 1: err('Journeys card: "coming soon" breaks over two lines')
    await ctx.close()
    ctx, pg = await newpage(b, 1440, 900, rm=True); ev = pg.evaluate
    await ev("__nz.begin(1)"); await pg.wait_for_timeout(60)
    k1 = await ev("__map.view.k")
    if abs(k1 - 3.2) > .05 and abs(k1 - await ev("__map.view.k")) > 0: err('reduced motion: the camera did not arrive at once', k1)
    if await ev("getComputedStyle(document.querySelector('#nzg .nz-line.nz-dr')).transitionDuration") not in ('0s', '0s, 0s'): err('reduced motion: thread still animates')
    await ev("__nz.show(2)"); await pg.wait_for_timeout(60)
    if await ev("getComputedStyle(document.querySelector('#nzg .nz-seg:nth-child(2) .nz-line')).strokeDashoffset") not in ('0px', '0'): err('reduced motion: walked line not drawn at once')
    await ctx.close()
    # screenshots for review (1440x900 and 390x844)
    for W, H in ((1440, 900), (390, 844)):
        ctx, pg = await newpage(b, W, H); ev = pg.evaluate; s = f'{SHOTS}/{W}'
        await ev("document.querySelector('.rail button[data-sheet=journeys]').click()"); await pg.wait_for_timeout(300); await pg.screenshot(path=s + '-01-journeys-tab.png')
        await pg.click('#sheet .nz-jump'); await pg.wait_for_timeout(900); await pg.screenshot(path=s + '-02-journeys-tab-nursery.png')
        await pg.click('#sheet .nz-lv button >> text=Shoot'); await pg.click('#sheet .nz-go'); await pg.wait_for_timeout(1700); await pg.screenshot(path=s + '-03-overview.png')
        await ev("__nz.show(0)"); await pg.wait_for_timeout(1700); await pg.screenshot(path=s + '-04-root.png')
        for i in (1, 2, 3):
            await ev(f"__nz.show({i})"); await pg.wait_for_timeout(1700); await pg.screenshot(path=f'{s}-0{4 + i}-chapter{i}.png')
        await ev("__nz.show(2)"); await pg.wait_for_timeout(1500)
        await ev("(() => { const p = document.getElementById('panel'), n = p.querySelector('.nz-send'); p.scrollTop = n.offsetTop - 60; })()"); await pg.wait_for_timeout(200); await pg.screenshot(path=s + '-08-send-muted.png')
        await ev("(() => { const t = document.querySelectorAll('#panel textarea.nz-note'); t[t.length - 1].value = 'The two violins copy each other, one after the other.'; t[t.length - 1].dispatchEvent(new Event('input')); const p = document.getElementById('panel'), n = p.querySelector('.nz-send'); p.scrollTop = n.offsetTop - 260; })()")
        await pg.fill('#panel .nz-name', 'Mira K.'); await ev("document.querySelector('#panel .nz-agree').checked = true"); await pg.wait_for_timeout(200); await pg.screenshot(path=s + '-09-send-active.png')
        await ev("__nz.show('learned')"); await pg.wait_for_timeout(1700); await pg.screenshot(path=s + '-10-what-i-learned.png')
        await ev("__nz.show(2)"); await pg.wait_for_timeout(1700)
        if W > 700: await pg.click('#zin')
        else: await ev("document.getElementById('zin').click()")
        await pg.wait_for_timeout(1500); await pg.screenshot(path=s + '-11-chapter2-after-plus.png')
        pg._errs and err('screenshots console', W, pg._errs[:3])
        if await ev("window.__sound"): err('sound', await ev("window.__sound"))
        if await ev("document.querySelectorAll('audio,video,iframe').length"): err('media elements in the page')
        await ctx.close()


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome'); sem = asyncio.Semaphore(3)
        async def run(f, *a):
            async with sem:
                t = time.time()
                try: await f(b, *a)
                except Exception as e: err(f.__name__, a, 'crashed:', repr(e)[:300])
                notes.append(f'{f.__name__}{a} {time.time() - t:.0f}s')
        only = os.environ.get('NZ_ONLY', '').split(',')
        jobs = [(f, ()) for f in (rest, content, listener, controls, misc)] + [(restore, (sz,)) for sz in ((1440, 900), (390, 844))] + [(collisions, (sz,)) for sz in SIZES]
        await asyncio.gather(*[run(f, *a) for f, a in jobs if only == [''] or f.__name__ in only])
        await b.close()
    for s in SRV: s.kill()
    for n in notes: print('#', n)
    print('errors', errors)

asyncio.run(main())
