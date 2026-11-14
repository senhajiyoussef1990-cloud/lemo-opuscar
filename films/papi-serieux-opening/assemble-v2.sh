#!/bin/sh
# Version 2 of an episode (series rules, v2): the hook first, at 0 s, then the opening, then the rest of the episode;
# no title card; bigger subtitles set higher; no black screen before the outro; the outro asks the viewer « Et ton papi, il dit quoi, lui ? ».
#   sh films/papi-serieux-opening/assemble-v2.sh <episode folder> <end of the hook, s> "<tomorrow's question>" <out.mp4>
#   e.g. sh films/papi-serieux-opening/assemble-v2.sh films/papi-serieux-ep6 5.0 "Demain : Papi contre le mot de passe" films/papi-serieux-ep6/papi-serieux-ep6-v2.mp4
# Needs the episode's out/mix.wav and out/cues.json (its build.sh makes them). Writes <out>.srt next to the film.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
EP=$(cd "$1" && pwd); H=$2; Q=$3; OUT=$4; CTA="Et ton papi, il dit quoi, lui ?"
[ -f "$EP/out/mix.wav" ] && [ -n "$H" ] && [ -n "$Q" ] && [ -n "$OUT" ] || { echo 'usage: sh assemble-v2.sh <episode folder> <hook end> "<question>" <out.mp4>'; exit 1; }
case "$OUT" in /*) ;; *) OUT="$PWD/$OUT";; esac
OPEN="$HERE/papi-serieux-opening.mp4"
cd "$LIB"
# 1. the picture again, with the v2 subtitles burnt in; the same mix
node core/render/video.mjs "$EP" --fps 24 --workers 4 --size 1080x1920 --q 'subs=v2' --out "$EP/out/video-v2.mp4" | tail -1
sh core/render/mux.sh "$EP/out/video-v2.mp4" "$EP/out/mix.wav" "$EP/out/episode-v2.mp4" 24 3 | grep LUFS
# 2. where the closing iris goes fully black: the episode stops there (no black screen before the outro)
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$EP/out/episode-v2.mp4")
B=$(ffmpeg -hide_banner -i "$EP/out/episode-v2.mp4" -vf "blackdetect=d=0.04:pix_th=0.10:pic_th=0.97" -an -f null - 2>&1 | python3 -c "
import re, sys
d = float(sys.argv[1]); s = [float(x) for x in re.findall(r'black_start:([0-9.]+)', sys.stdin.read())]
s = [x for x in s if x > d - 4]; print(f'{(s[0] if s else d):.4f}')" "$D")
echo "hook 0–$H s, episode cut at $B s (of $D)"
# 3. the outro with the viewer's question
sh "$HERE/make-outro.sh" "$Q" "$HERE/out/outro-v2.mp4" "$CTA" >/dev/null
# 4. hook, opening, the rest, outro (short fades on the cuts so the music does not click)
V="fps=24,scale=1080:1920,setsar=1,format=yuv420p"; A="aresample=48000,aformat=channel_layouts=stereo"
ffmpeg -y -loglevel error -i "$EP/out/episode-v2.mp4" -i "$OPEN" -i "$HERE/out/outro-v2.mp4" -filter_complex "\
[0:v]trim=0:$H,setpts=PTS-STARTPTS,$V[v0];[0:a]atrim=0:$H,asetpts=PTS-STARTPTS,$A,afade=t=out:st=$(python3 -c "print($H-.03)"):d=.03[a0];\
[1:v]$V[v1];[1:a]$A[a1];\
[0:v]trim=$H:$B,setpts=PTS-STARTPTS,$V[v2];[0:a]atrim=$H:$B,asetpts=PTS-STARTPTS,$A,afade=t=in:d=.03,afade=t=out:st=$(python3 -c "print($B-$H-.05)"):d=.05[a2];\
[2:v]$V[v3];[2:a]$A[a3];\
[v0][a0][v1][a1][v2][a2][v3][a3]concat=n=4:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 20 -tune grain -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$OUT"
# 5. subtitles: the hook keeps its times, the rest moves by the opening's length
OD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OPEN")
python3 - "$EP/out/cues.json" "${OUT%.mp4}.srt" "$H" "$B" "$OD" <<'PY'
import json, sys
src, dst, h, b, od = sys.argv[1], sys.argv[2], *map(float, sys.argv[3:])
f = lambda t: '%02d:%02d:%02d,%03d' % (t // 3600, t % 3600 // 60, t % 60, round(t * 1000) % 1000)
out = []
for c in json.load(open(src)):
    t0, t1 = c['t0'], min(c['t1'], b)
    if t0 >= b: continue
    if t0 >= h: t0, t1 = t0 + od, t1 + od
    out.append(f"{len(out) + 1}\n{f(t0)} --> {f(t1)}\n{c['text']}\n")
open(dst, 'w', encoding='utf-8').write('\n'.join(out)); print(dst, len(out), 'cues')
PY
echo "$OUT $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT") s"
