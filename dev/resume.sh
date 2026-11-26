#!/bin/sh
# Resume work on the Garden in a fresh Claude session.
# Usage: sh dev/resume.sh            (from inside the repo, or from anywhere if it is not cloned yet)
# Clones (if needed) with enough history for pushes, makes the symlink the tests expect,
# builds, and prints the hashes to compare with the claude.ai preview and the live site.
set -e
REPO=/home/claude/thegardenofearthlysounds
URL=https://github.com/shmungfroi/thegardenofearthlysounds

if [ ! -d "$REPO/.git" ]; then
  echo "Cloning (depth 50; may take several minutes through the proxy)..."
  git clone --depth 50 "$URL" "$REPO"
else
  echo "Repo present. Fetching main (depth 50)..."
  git -C "$REPO" fetch -q --depth=50 origin main || echo "fetch failed: check the proxy, then retry once"
fi
ln -sfn "$REPO" /home/claude/gardenofearthlysound
cd "$REPO"

echo "Branch: $(git branch --show-current)   HEAD: $(git log --oneline -1)"
echo "origin/main: $(git log --oneline -1 origin/main 2>/dev/null || echo unknown)"
git status --short | head -10

echo "Building..."
./build.sh 2>&1 | grep -E "clash|rror" || true
if [ -n "$(git status --short -- index.html card.js nursery_data.js)" ]; then
  echo "WARNING: the build changed tracked files. Uncommitted work or a patch not yet run?"
fi

echo "Hashes (first 16 of sha256) to compare with the preview (list_files) and the live site:"
for f in index.html card.js gx_data.js nursery_data.js; do
  [ -f "$f" ] && printf "  %-16s %s\n" "$f" "$(sha256sum "$f" | cut -c1-16)"
done
command -v google-chrome >/dev/null && echo "Chrome: ok (tests can run)" || echo "Chrome missing: tests cannot run"
python3 -c "import playwright" 2>/dev/null && echo "Playwright: ok" || echo "Playwright missing: pip install playwright --break-system-packages"
echo "Next: read claude/HANDOFF.md in the project. Push work in progress to a side branch at every milestone."
