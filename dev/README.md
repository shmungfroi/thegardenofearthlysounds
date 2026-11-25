# Developer tools

- `run_tests.sh` runs the 16 regression suites (every one should print `errors []`; `livetest` is stale and fails with `__map is not defined`, and `nowtest` prints `[]` without the label).
- `tests/glossaudit.py` opens every card (lanterns, composers, events) on desktop and phone, clicks every highlighted term and element chip, and reports any box that covers text or spills out of the card (should report 0 problems).
- `tests/nurserytest.py` checks the Nursery (The Branches and the Fruits): the Garden at rest against a base built from git c288402, the journey text at every level, the map marks at five screen sizes, notes, Send it to the Garden, links and keys. It needs the base build at `/tmp/nzbase` (it makes it with `git worktree` if missing).
- The other scripts in `tests/` take screenshots used when reviewing a change (grass, stars, journey sheet, research challenge).
- `serve.py PORT DIR` is the small local web server the suites use.

Build first with `./build.sh` (it must report 0 name clashes).
