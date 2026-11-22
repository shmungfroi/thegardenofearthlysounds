#!/bin/sh
# Rebuild the map from gx_data.js: one command.
set -e
cd "$(dirname "$0")"
node src/export_data.js
LIVE=1 python3 src/build.py
python3 src/pack.py
python3 src/vtag.py
