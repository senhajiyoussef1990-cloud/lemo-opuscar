#!/bin/sh
# One command: fonts → voices → picture → score → mix → master → the series opening and the title card in front, the outro after. Run from anywhere.
# The voices come from Microsoft's online speech service (edge-tts): it needs the network. Behind an HTTPS proxy, the websocket needs wss_proxy too.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
sh "$HERE/tools/fonts.sh"
"$PY" "$LIB/core/audio/sampler.py" --need "$HERE/music/score.py"
cd "$LIB"
wss_proxy=${wss_proxy:-$HTTPS_PROXY} "$PY" core/tts/tts_zh.py "$HERE/lines.json" "$HERE/voice"
"$PY" "$HERE/tools/lip.py"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
"$PY" "$HERE/music/score.py"
"$PY" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/episode.mp4" 24 3
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix-sans-voix.wav" "$HERE/out/episode-sans-voix.mp4" 24 3
"$PY" core/render/srt.py "$HERE/out/cues.json" "$HERE/out/episode.srt" 2>/dev/null || true
Q="Papi doit affronter quoi demain ?"
sh "$HERE/../papi-serieux-opening/assemble.sh" "$HERE/out/episode.mp4" "$Q" "$HERE/papi-serieux-ep10.mp4" 10 "La livraison"
sh "$HERE/../papi-serieux-opening/assemble.sh" "$HERE/out/episode-sans-voix.mp4" "$Q" "$HERE/papi-serieux-ep10-sans-voix.mp4" 10 "La livraison"
sh "$HERE/../papi-serieux-opening/make-card.sh" 10 "La livraison"
