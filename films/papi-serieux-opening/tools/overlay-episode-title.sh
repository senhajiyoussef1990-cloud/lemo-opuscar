#!/bin/sh
# Adds episode number + title UNDER the existing Papi, sérieux ? logo.
# Usage: sh films/papi-serieux-opening/tools/overlay-episode-title.sh INPUT.mp4 NUMBER "TITRE" HOOK_SECONDS OUTPUT.mp4
# Hook precedes the 1.5-second original opening; all other shots and original audio remain unchanged.
set -eu
IN=$1
NUM=$2
TITLE=$3
HOOK=$4
OUT=$5
DUR=$(awk -v t="$HOOK" 'BEGIN { printf "%.3f",t+1.45 }')
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
[ -f "$FONT" ] || FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
[ -f "$FONT" ] || { echo "Missing suitable TTF font for episode title." >&2; exit 1; }
# For titles coming from our own scripts: strip the few characters that have meaning in ffmpeg filters.
SAFE=$(printf '%s' "$TITLE" | sed "s/[':,;\\\\]/ /g")
EN="between(t,$HOOK,$DUR)"
VF="drawbox=x=205:y=1500:w=670:h=3:color=0xE8E3D8@0.95:t=fill:enable='$EN',drawtext=fontfile=$FONT:text='ÉPISODE $NUM':fontsize=68:fontcolor=0xF7F4E8:x=(w-text_w)/2:y=1530:enable='$EN',drawtext=fontfile=$FONT:text='$SAFE':fontsize=50:fontcolor=0xF7F4E8:x=(w-text_w)/2:y=1635:enable='$EN',drawbox=x=270:y=1722:w=540:h=2:color=0xE8E3D8@0.9:t=fill:enable='$EN'"
# Persistent watermark throughout the finished film (independent of social platform).
VF="$VF,drawtext=fontfile=$FONT:textfile=$(dirname \"$0\")/copyright.txt:fontcolor=0xF3EBDA@0.65:fontsize=32:borderw=1:bordercolor=0x191715@0.5:x=60:y=250"

ffmpeg -y -hide_banner -loglevel error -i "$IN" -vf "$VF" -map 0:v:0 -map 0:a:0 -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a copy -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 "$OUT"
