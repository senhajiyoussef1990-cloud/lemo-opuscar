#!/bin/sh
# The outro of an episode: the medallion and tomorrow's question (3 s); with the viewer's question under it (4 s);
# with the viewer's question and the follow line (3 s: questions, Papi points at the follow button, Léo winks, iris) — the series rule.
#   sh films/papi-serieux-opening/make-outro.sh "Demain : Papi contre le mot de passe" out.mp4 ["Et ton papi, il dit quoi, lui ?"] ["Abonne-toi, petit. Dans mon temps, on disait : reviens demain."]
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
TEXT=$1; OUT=$2; CTA=${3:-}; SUB=${4:-}
[ -n "$TEXT" ] && [ -n "$OUT" ] || { echo 'usage: sh make-outro.sh "<question>" <out.mp4> ["<question for the viewer>"]'; exit 1; }
case "$OUT" in /*) ;; *) OUT="$PWD/$OUT";; esac
sh "$HERE/tools/fonts.sh"
enc() { python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$1"; }
QS="outro=1&text=$(enc "$TEXT")"; D=3; [ -z "$CTA" ] || { QS="$QS&cta=$(enc "$CTA")"; D=4; }; [ -z "$SUB" ] || { QS="$QS&sub=$(enc "$SUB")"; D=point; }
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 24 --workers 2 --size 1080x1920 --q "$QS" --out "$HERE/out/outro-video.mp4" >/dev/null
"$LIB/.venv/bin/python" "$HERE/sound.py" outro $D >/dev/null
sh core/render/mux.sh "$HERE/out/outro-video.mp4" "$HERE/out/outro.wav" "$OUT" 24 3 >/dev/null
echo "$OUT"
