#!/usr/bin/env bash
# One narrated TikTok/Shorts master: vertical 1080x1920 ONLY.
# No 16:9 files; no silent tracks; one story, audio QC and publication materials.
set -euo pipefail
SLUG="${1:?usage: bash films/papy-batch5/build-vertical.sh crayon}"
D="films/papy-$SLUG"
DATA="films/papy-batch5/episodes.json"
python films/papy-batch5/prepare.py "$SLUG"
echo "::group::Contrôle des scripts"
node --check "$D/main.js"
node --check "$D/story.js"
node --check "$D/objects.js"
node --check "$D/chars.js"
node --check "$D/toon.js"
echo "::endgroup::"

echo "::group::Polices et voix des deux personnages"
bash "$D/tools/fonts.sh"
python core/tts/tts_zh.py "$D/lines.json" "$D/raw"
python "$D/tools/voice.py"
echo "::endgroup::"

echo "::group::Timings du format vertical 9:16"
node core/render/events.mjs "$D" --size 1080x1920
python - "$D" <<'PY'
import json,sys
from pathlib import Path
d=Path(sys.argv[1]); events=json.loads((d/'events.json').read_text())['ev']
lines={x['id']:x for x in json.loads((d/'lines.json').read_text())}
dur=json.loads((d/'voices/dur.json').read_text())
vo=[x for x in events if x['type']=='vo']
assert len(vo)==39, len(vo)
with (d/'papy-texte-timeline.txt').open('w') as f:
    for e in vo:
        if e['who']=='PAPY':
            t=e['t'];end=t+dur[e['id']]
            f.write(f"{t:07.3f} -> {end:07.3f} | {lines[e['id']]['text']}\n")
print('Timings valides:',len(vo),'répliques')
PY
echo "::endgroup::"

echo "::group::Story yeux ouverts, format vertical"
mkdir -p "$D/story-base" "$D/out"
node films/story-eye-open.mjs "$D" "$D/story-base/cover.jpg"
python - "$D" <<'PY'
from PIL import Image,ImageDraw,ImageFont
import json,sys
from pathlib import Path
d=Path(sys.argv[1]); im=Image.open(d/'story-base/cover.jpg').convert('RGB')
assert im.size==(1080,1920),im.size
title=json.loads((d/'episode.json').read_text())['title'].upper()
overlay=Image.new('RGBA', im.size, (0,0,0,0)); z=ImageDraw.Draw(overlay)
z.rounded_rectangle((70,68,1010,348),radius=30,fill=(42,27,69,242),outline=(255,224,102,255),width=8)
fn='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
small=ImageFont.truetype(fn,44);big=ImageFont.truetype(fn,60)
z.text((540,115),'NOUVEL ÉPISODE',font=small,anchor='mm',fill=(255,245,214,255))
z.text((540,201),"AUJOURD'HUI À 18 H",font=big,anchor='mm',fill=(255,224,102,255))
size=53; fs=ImageFont.truetype(fn,size)
while z.textbbox((0,0),title,font=fs)[2]>822:
    size-=2; fs=ImageFont.truetype(fn,size)
z.text((540,291),title,font=fs,anchor='mm',fill=(255,245,214,255))
Image.alpha_composite(im.convert('RGBA'),overlay).convert('RGB').save(d/'story.jpg',quality=94,subsampling=0)
PY
echo "::endgroup::"

echo "::group::Bande son, mix complet des voix + musique et bruitages"
python "$D/tools/score.py"
python "$D/tools/mix.py"
test -s "$D/out/mix.wav"
# Check the waveform before expensive rendering; fail early if audible impulse-like
# glitches or clipping are measurable in the source mix.
python films/papy-batch5/audio_qc.py "$D" "$SLUG" --mix-only
echo "::endgroup::"

echo "::group::Rendu portrait (Short 9:16) 1080x1920"
node core/render/video.mjs "$D" --fps "${FPS:-12}" --workers "${RENDER_WORKERS:-4}" --size 1080x1920 --out "$D/out/vertical-base.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$D/out/vertical-base.mp4" -vf fps=24 -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -an "$D/out/vertical-24.mp4"
sh core/render/mux.sh "$D/out/vertical-24.mp4" "$D/out/mix.wav" "$D/le-livre-de-papy-$SLUG-short-9x16.mp4" 24 0
echo "::endgroup::"

echo "::group::Contrôle audio du master 9:16"
python films/papy-batch5/audio_qc.py "$D" "$SLUG" --vertical-only
echo "::endgroup::"

echo "::group::Tests du MP4 TikTok et ZIP, voix obligatoire"
python - "$D" "$SLUG" <<'PY'
import json,os,subprocess,sys,zipfile
from pathlib import Path
d=Path(sys.argv[1]); slug=sys.argv[2]
v=d/f'le-livre-de-papy-{slug}-short-9x16.mp4'
for f,(w,hgt) in [(v,(1080,1920))]:
  assert f.is_file() and f.stat().st_size>100000, f
  p=subprocess.run(['ffprobe','-v','error','-show_entries','stream=codec_type,width,height','-of','json',str(f)],capture_output=True,text=True,check=True)
  st=json.loads(p.stdout)['streams']
  vs=next(x for x in st if x['codec_type']=='video')
  assert (vs['width'],vs['height'])==(w,hgt),(f,vs)
  assert any(x['codec_type']=='audio' for x in st),(f,'missing voice track')
names=[v.name,'story.jpg','publication.txt','papy-texte-timeline.txt','SCENARIO.md','SOURCES.md','audio-qc.json','audio-preflight.json']
assert all((d/n).is_file() for n in names)
dest=d/f'le-livre-de-papy-{slug}-tiktok-vertical.zip'
with zipfile.ZipFile(dest,'w',compression=zipfile.ZIP_STORED,allowZip64=True) as z:
    for n in names:z.write(d/n,n)
with zipfile.ZipFile(dest) as z:
    assert z.testzip() is None
    assert len([x for x in z.namelist() if x.endswith('.mp4')])==1
print('LIVRABLE VALIDE:',dest,round(dest.stat().st_size/1024/1024,1),'Mo')
PY
echo "::endgroup::"
