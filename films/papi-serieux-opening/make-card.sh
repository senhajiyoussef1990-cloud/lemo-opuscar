#!/bin/sh
# The title card of an episode (a 1080×1920 still), in one line:
#   sh films/papi-serieux-opening/make-card.sh 5 "Le titre"
# → writes cards/papi-serieux-ep5.jpg here, and a copy named carte-titre.jpg in films/papi-leo-ep5/ when that folder exists.
# A third argument replaces the word above the title (default: Aujourd’hui).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
N=$1; TITLE=$2; WORD=${3:-}
[ -n "$N" ] && [ -n "$TITLE" ] || { echo 'usage: sh make-card.sh <number> "<title>" ["<word above the title>"]'; exit 1; }
sh "$HERE/tools/fonts.sh"
enc() { python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$1"; }
QS="card=1&n=$(enc "$N")&title=$(enc "$TITLE")"; [ -z "$WORD" ] || QS="$QS&word=$(enc "$WORD")"
TMP="$HERE/out/card"; mkdir -p "$TMP" "$HERE/cards"
(cd "$LIB" && node core/render/still.mjs "$HERE" 1 --size 1080x1920 --q "$QS" --out "$TMP" --prefix "ep${N}_" >/dev/null)
OUT="$HERE/cards/papi-serieux-ep$N.jpg"
# the same film grain as the episodes (mux.sh, grain 3)
ffmpeg -y -loglevel error -i "$TMP/ep${N}_1.jpg" -vf "noise=c0s=3:allf=t" -frames:v 1 -q:v 2 "$OUT"
echo "$OUT"
EP="$HERE/../papi-leo-ep$N"; if [ -d "$EP" ]; then cp "$OUT" "$EP/carte-titre.jpg"; echo "$EP/carte-titre.jpg"; fi
