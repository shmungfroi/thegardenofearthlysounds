# Know It Cold: Garden changes (branch know-it-cold, 27 Nov 2026)

## Data changes (gx_data.js, targeted string edits; index.html rebuilt by ./build.sh, 0 name clashes)
Seven works appended to the end of their lantern's works list, with media at the same index (all qs[].work and other index references unchanged):
groundbass + Strozzi "Che si può fare" · concertogrosso + Brandenburg 5 · buffa + Don Giovanni Catalogue aria · quartet + Op. 76/3 "Emperor" II · lied + Erlkönig · romsym + Brahms 4 finale · romquartet + Verklärte Nacht (sextet).
Correction register (weak/wrong recordings on landmark cards, replaced with verified uploads):
- progsym[1] Symphonie fantastique: old upload was only "Un bal" → Detroit SO / Bignamini, complete (Must: wrong content)
- clconcerto[3] K. 467: anonymous, performers unknown → Netherlands Phil / Brautigam (AVROTROS)
- pianochamber[3] Clara Schumann Trio: anonymous re-upload → Trio Gaia (NEC)
- imppiano[0] Jeux d'eau: anonymous, pianist unnamed → Bavouzet (CMS Lincoln Center)
All new and replacement links verified by YouTube oembed (title + uploader) on 27 Nov 2026; see research.json in the project unit folder.

## Not changed (flagged for Justin)
- fugue[4] title "Little Fugue in G minor, BWV 578 (and WTC I, BWV 846)" wrongly adds BWV 846.
- oratorio[5] Messiah: recording is Part 1 only (no Hallelujah). Whole-work card, so left; the booklet links the Hallelujah chorus separately.

## Tests (self-check; no independent Garden check run)
Full suite: 13 of 14 suites `errors []`; livetest stale (known). nowtest prints [] (pass).
nurserytest: 4 diffs, all "map #lens=w" and "map #trail=…" (the lens persists into the trail state in that test).
Cause verified: lens w = Women composers; Strozzi now lights the ground bass lantern. A fresh load of #trail=fugue,canzona,triosonata is identical before and after. Expected change, not a regression.
