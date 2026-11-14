#!/bin/sh
# The title card of an episode as a 2 s clip (the card of make-card.sh, with living film damage and two bars of piano).
#   sh films/papi-serieux-opening/make-title.sh 5 "La batterie" out.mp4
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
N=$1; TITLE=$2; OUT=$3
[ -n "$N" ] && [ -n "$TITLE" ] && [ -n "$OUT" ] || { echo 'usage: sh make-title.sh <number> "<title>" <out.mp4>'; exit 1; }
case "$OUT" in /*) ;; *) OUT="$PWD/$OUT";; esac
sh "$HERE/tools/fonts.sh"
enc() { python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$1"; }
QS="card=1&n=$(enc "$N")&title=$(enc "$TITLE")"
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 24 --workers 2 --size 1080x1920 --q "$QS" --out "$HERE/out/card-video.mp4" >/dev/null
"$LIB/.venv/bin/python" "$HERE/sound.py" card >/dev/null
sh core/render/mux.sh "$HERE/out/card-video.mp4" "$HERE/out/card.wav" "$OUT" 24 3 >/dev/null
echo "$OUT"
