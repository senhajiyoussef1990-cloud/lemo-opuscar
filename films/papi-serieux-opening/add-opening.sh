#!/bin/sh
# Put the « Papi, sérieux ? » opening in front of an episode, in one line:
#   sh films/papi-serieux-opening/add-opening.sh films/papi-leo-ep5/papi-leo-ep5.mp4
# → writes papi-leo-ep5-opening.mp4 next to it (or the name given as a second argument).
# If a .srt with the episode's name sits next to it, a shifted copy (+1.5 s) is written too.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
OPEN="$HERE/papi-serieux-opening.mp4"
EP=$1; [ -f "$EP" ] || { echo "usage: sh add-opening.sh <episode.mp4> [out.mp4]"; exit 1; }
[ -f "$OPEN" ] || { echo "the opening is not rendered yet: run sh $HERE/build.sh"; exit 1; }
OUT=${2:-${EP%.mp4}-opening.mp4}
# both are re-encoded together, so the cut is frame-accurate and the sound stays in sync
ffmpeg -y -loglevel error -i "$OPEN" -i "$EP" -filter_complex \
  "[0:v]fps=24,scale=1080:1920,setsar=1,format=yuv420p[v0];[1:v]fps=24,scale=1080:1920,setsar=1,format=yuv420p[v1];[0:a]aresample=48000,aformat=channel_layouts=stereo[a0];[1:a]aresample=48000,aformat=channel_layouts=stereo[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 20 -tune grain -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "$OUT"
SRT=${EP%.mp4}.srt
if [ -f "$SRT" ]; then
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OPEN")
  python3 - "$SRT" "${OUT%.mp4}.srt" "$D" <<'PY'
import re, sys
src, dst, d = sys.argv[1], sys.argv[2], float(sys.argv[3])
def sh(m):
    h, mi, s, ms = map(int, m.groups()); t = h * 3600 + mi * 60 + s + ms / 1000 + d
    return '%02d:%02d:%02d,%03d' % (t // 3600, t % 3600 // 60, t % 60, round(t * 1000) % 1000)
open(dst, 'w', encoding='utf-8').write(re.sub(r'(\d+):(\d+):(\d+),(\d+)', sh, open(src, encoding='utf-8').read()))
print(dst)
PY
fi
