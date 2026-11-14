#!/bin/sh
# A finished episode of « Papi, sérieux ? », in one line: opening, title card, episode, outro.
#   sh films/papi-serieux-opening/assemble.sh <episode.mp4> "<question of the outro>" <out.mp4> <number> "<title>"
#   e.g. sh films/papi-serieux-opening/assemble.sh films/papi-serieux-ep6/out/episode.mp4 "Demain : Papi contre le mot de passe" films/papi-serieux-ep6/papi-serieux-ep6.mp4 6 "Les émojis"
# Without the number and the title, the title card is left out (opening, episode, outro).
# If a .srt with the episode's name sits next to it, a copy shifted by what comes before the episode is written next to the result.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
OPEN="$HERE/papi-serieux-opening.mp4"
EP=$1; Q=$2; OUT=$3; NUM=$4; TITLE=$5
[ -f "$EP" ] && [ -n "$Q" ] && [ -n "$OUT" ] || { echo 'usage: sh assemble.sh <episode.mp4> "<question of the outro>" <out.mp4> [<number> "<title>"]'; exit 1; }
[ -f "$OPEN" ] || { echo "the opening is not rendered yet: run sh $HERE/build.sh"; exit 1; }
OUTRO="$HERE/out/outro.mp4"; sh "$HERE/make-outro.sh" "$Q" "$OUTRO" >/dev/null
N="fps=24,scale=1080:1920,setsar=1,format=yuv420p"; A="aresample=48000,aformat=channel_layouts=stereo"
ENC="-c:v libx264 -preset medium -crf 20 -tune grain -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart"
SHIFT=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OPEN")
if [ -n "$NUM" ] && [ -n "$TITLE" ]; then
  CARD="$HERE/out/title.mp4"; sh "$HERE/make-title.sh" "$NUM" "$TITLE" "$CARD" >/dev/null
  SHIFT=$(python3 -c "print($SHIFT + $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CARD"))")
  ffmpeg -y -loglevel error -i "$OPEN" -i "$CARD" -i "$EP" -i "$OUTRO" -filter_complex \
    "[0:v]$N[v0];[1:v]$N[v1];[2:v]$N[v2];[3:v]$N[v3];[0:a]$A[a0];[1:a]$A[a1];[2:a]$A[a2];[3:a]$A[a3];[v0][a0][v1][a1][v2][a2][v3][a3]concat=n=4:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" $ENC "$OUT"
else
  ffmpeg -y -loglevel error -i "$OPEN" -i "$EP" -i "$OUTRO" -filter_complex \
    "[0:v]$N[v0];[1:v]$N[v1];[2:v]$N[v2];[0:a]$A[a0];[1:a]$A[a1];[2:a]$A[a2];[v0][a0][v1][a1][v2][a2]concat=n=3:v=1:a=1[v][a]" \
    -map "[v]" -map "[a]" $ENC "$OUT"
fi
echo "$OUT"
SRT=${EP%.mp4}.srt
if [ -f "$SRT" ]; then
  python3 - "$SRT" "${OUT%.mp4}.srt" "$SHIFT" <<'PY'
import re, sys
src, dst, d = sys.argv[1], sys.argv[2], float(sys.argv[3])
def sh(m):
    h, mi, s, ms = map(int, m.groups()); t = h * 3600 + mi * 60 + s + ms / 1000 + d
    return '%02d:%02d:%02d,%03d' % (t // 3600, t % 3600 // 60, t % 60, round(t * 1000) % 1000)
open(dst, 'w', encoding='utf-8').write(re.sub(r'(\d+):(\d+):(\d+),(\d+)', sh, open(src, encoding='utf-8').read()))
print(dst)
PY
fi
