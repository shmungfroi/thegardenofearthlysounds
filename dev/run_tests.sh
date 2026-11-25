#!/bin/sh
# Runs the Garden's regression suites. Each suite starts its own local server and drives Chrome with Playwright.
# The suites expect the repo at /home/claude/gardenofearthlysound and the server at /home/claude/tools/serve.py
# (the paths of the working session that wrote them); this script puts the server in place first.
# Needs: python3, playwright (pip), Google Chrome at /usr/bin/google-chrome.
set -e
mkdir -p /home/claude/tools && cp "$(dirname "$0")/serve.py" /home/claude/tools/serve.py
cd "$(dirname "$0")/.."
for t in f2test f3test f4test f5test cardtest clicktest livetest nowtest pintest f6test jtest resettest starkey searchtest myglossarytest nurserytest; do
  printf "%-10s " $t; timeout 400 python3 dev/tests/$t.py 2>&1 | grep -E "^errors|Traceback" | tail -1
done
echo "Full glossary-box audit (slow, ~10 min):  python3 dev/tests/glossaudit.py 8926 check"
