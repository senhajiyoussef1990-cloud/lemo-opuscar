#!/bin/sh
# One command: font → voices → timeline → picture → score and mix → master. Run from anywhere.
# The voices come from Microsoft's online speech service (edge-tts): it needs the network. Behind an HTTPS proxy, the websocket needs wss_proxy too.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
"$PY" "$HERE/tools/fonts.py"
"$PY" "$LIB/core/audio/sampler.py" --need "$HERE/tools/score.py"
cd "$LIB"
wss_proxy=${wss_proxy:-$HTTPS_PROXY} "$PY" core/tts/tts_zh.py "$HERE/lines.json" "$HERE/voice"
"$PY" "$HERE/tools/timeline.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
"$PY" "$HERE/tools/score.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/livre-de-papy-sac-a-dos.mp4" 24 0
