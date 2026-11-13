#!/bin/sh
# The outro of an episode (3 s): the medallion and tomorrow's question.
#   sh films/papi-serieux-opening/make-outro.sh "Demain : Papi contre le mot de passe" out.mp4
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
TEXT=$1; OUT=$2
[ -n "$TEXT" ] && [ -n "$OUT" ] || { echo 'usage: sh make-outro.sh "<question>" <out.mp4>'; exit 1; }
case "$OUT" in /*) ;; *) OUT="$PWD/$OUT";; esac
sh "$HERE/tools/fonts.sh"
QS="outro=1&text=$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$TEXT")"
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 24 --workers 2 --size 1080x1920 --q "$QS" --out "$HERE/out/outro-video.mp4" >/dev/null
"$LIB/.venv/bin/python" "$HERE/sound.py" outro >/dev/null
sh core/render/mux.sh "$HERE/out/outro-video.mp4" "$HERE/out/outro.wav" "$OUT" 24 3 >/dev/null
echo "$OUT"
