# The Garden of Earthly Sounds: rules for every Claude session

Owner: Justin Ossher (music teacher, Sydney). Live: https://shmungfroi.github.io/thegardenofearthlysounds/ (GitHub Pages from `main`). Preview: https://claude.ai/artifact/3kcmFsn1jajLacaxz9Wy9K.

## Start here
1. Run `sh dev/resume.sh` (clone with enough history, symlink, build, print file hashes).
2. Read `claude/HANDOFF.md` in the claude.ai project "garden of earthly sounds" (current state, open items, standing rules). Read only what the task needs.
3. Compare the printed hashes with the preview (`list_files`) and the live site (built-in browser, `fetch(..., {cache:'no-store'})`). If the preview is ahead, bring its files in first.

## Never lose work (the Nursery was built three times because of this)
- A session's workspace is temporary and is lost on restarts. **Commit and push work in progress to a side branch at every milestone**: `git -c push.negotiate=true push -u origin <branch>`. Never keep work only on disk.
- Agents write their reports to a file as they go, and those reports are saved to the claude.ai project as soon as they exist.
- Push to `main` only with Justin's explicit go ("push", "publish the live site"). Never commit to `baseline-2`.
- Push a checked commit with `git push origin <commit>:refs/heads/main`. If git says "unrelated histories" or "non-fast-forward", run `git fetch --depth=50 origin main <branch>` and `git merge-base --is-ancestor origin/main <commit>`; retry the push once. Never force-push.

## Build and test
- `./build.sh` must print `0 name clashes`. Patches in `dev/patches/` are idempotent; the Nursery runs `nursery.py` after `phone_zoom.py`.
- `sh dev/run_tests.sh` (~9 min, foreground, long timeout): 14 suites print `errors []`; `nowtest` prints `[]` unlabelled (pass); `livetest` is stale (`__map is not defined`).
- Run the full suite once before a push, not after every small fix.
- Checks scale with risk: new features get a full independent check (an agent that did not build it). Small fixes get a focused check of the diff only.

## Standing rules (Justin)
- Framework and approval before multi-step builds; preview before visual changes unless he says publish; "don't change anything else" means report, don't fix; silence is not approval.
- Code trap: a `//` comment mid-line has broken the page three times. Use `/* */` and parse-check with `node --check`.
- No sound in the page (works are linked, never played). Australian spelling. "Elements of music", never "concepts". Levels are Seed / Shoot / Bloom (= NSW Stage 4 / 5 / 6). Never abbreviate "Aboriginal and Torres Strait Islander".
- Scores: real sources only (IMSLP etc.), cropped and credited; never engraved from memory.
- Kodály syllables follow note values: ta, ti, ti-ti, tika, tim-ka, ta-a (dotted crotchet), tum (minim; each extra u adds a beat).
- Student-facing design must be crafted and must not look AI-generated.
- `gx_data.js`: targeted string edits only.
