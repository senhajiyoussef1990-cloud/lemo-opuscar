#!/bin/sh
# One command: fonts → voices → picture → events → score → mix → master. Run from anywhere. The voices need the network (edge-tts).
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-$(cd "$HERE/../.." && pwd)}; PY="$LIB/.venv/bin/python"
sh "$HERE/tools/fonts.sh"
cd "$LIB"
wss_proxy=${wss_proxy:-$HTTPS_PROXY} "$PY" core/tts/tts_zh.py "$HERE/lines.json" "$HERE/raw"
"$PY" "$HERE/tools/voice.py"
node core/render/events.mjs "$HERE" --size 1080x1920
"$PY" "$HERE/tools/score.py"
"$PY" "$HERE/tools/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/le-livre-de-papy-sac-a-dos-sitcom.mp4" 24 0
