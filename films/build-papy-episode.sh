#!/usr/bin/env bash
# Reconstruit un épisode comme le modèle films/papy-lunettes.
# Dépendances : node >=20, playwright-core + Chromium, ffmpeg, numpy/scipy/soundfile/edge-tts/Pillow.
set -euo pipefail
D="${1:?Dossier épisode requis}"
SLUG="${2:?Slug requis}"
TITLE="${3:?Titre requis}"
test -f "$D/index.html" && test -f "$D/lines.json"

echo "::group::Vérification des scripts"
node --check "$D/main.js"
node --check "$D/story.js"
node --check "$D/chars.js"
node --check "$D/people.js"
if [[ -f "$D/teeth.js" ]]; then node --check "$D/teeth.js"; fi
if [[ -f "$D/worlds.js" ]]; then node --check "$D/worlds.js"; fi
echo "::endgroup::"

echo "::group::Polices et voix"
bash "$D/tools/fonts.sh"
python core/tts/tts_zh.py "$D/lines.json" "$D/raw"
python "$D/tools/voice.py"
echo "::endgroup::"

echo "::group::Timeline et plans"
node core/render/events.mjs "$D" --size 1080x1920
python - "$D" <<'PY'
import sys, os, json
d=sys.argv[1]
ev=json.load(open(f'{d}/events.json'))
lines={x['id']:x for x in json.load(open(f'{d}/lines.json',encoding='utf8'))}
dur=json.load(open(f'{d}/voices/dur.json'))
v=[x for x in ev['ev'] if x['type']=='vo']
assert len(v)==len(lines), (len(v),len(lines))
for e in v: assert e['id'] in dur, e['id']
with open(f'{d}/papy-texte-timeline.txt','w',encoding='utf8') as out:
  for e in v:
    if e['who']!='PAPY': continue
    a=float(e['t']); b=a+float(dur[e['id']])
    out.write(f'{a:07.3f} -> {b:07.3f} | {lines[e["id"]]["text"]}\n')
print(len(v),'répliques, durée film',ev['dur'])
PY
echo "::endgroup::"

echo "::group::Image story dans la même direction artistique"
mkdir -p "$D/story-base"
node films/story-eye-open.mjs "$D" "$D/story-base/cover.jpg"
python - "$D" "$SLUG" "$TITLE" <<'PY'
import sys,glob,os
from PIL import Image, ImageDraw, ImageFont
d,slug,title=sys.argv[1:4]
base=glob.glob(d+'/story-base/*.jpg')
assert len(base)==1,base
im=Image.open(base[0]).convert('RGB')
overlay=Image.new('RGBA',im.size,(0,0,0,0))
z=ImageDraw.Draw(overlay)
z.rounded_rectangle((70,68,1010,340),radius=29,fill=(42,27,69,240),outline=(255,224,102,255),width=8)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
small=ImageFont.truetype(font,44)
large=ImageFont.truetype(font,62)
z.text((540,120),'NOUVEL ÉPISODE',font=small,anchor='mm',fill=(255,245,214,255))
z.text((540,197),"AUJOURD'HUI À 18 H",font=large,anchor='mm',fill=(255,224,102,255))
head=ImageFont.truetype(font,52)
while z.textbbox((0,0),title.upper(),font=head)[2]>790:
  head=ImageFont.truetype(font,head.size-2)
z.text((540,287),title.upper(),font=head,anchor='mm',fill=(255,245,214,255))
# Les personnages sont figés yeux ouverts via cover=1, sans toucher au rendu MP4.
out=Image.alpha_composite(im.convert('RGBA'),overlay).convert('RGB')
out.save(f'{d}/story.jpg',quality=94,subsampling=0)
PY
echo "::endgroup::"

echo "::group::Son et mixages"
python "$D/tools/score.py"
python "$D/tools/mix.py"
NO_PAPY=1 MIX_OUT=mix-sans-papy.wav python "$D/tools/mix.py"
echo "::endgroup::"

echo "::group::Vidéo 1080x1920, ${FPS:-24} fps"
node core/render/video.mjs "$D" --fps "${FPS:-24}" --workers "${RENDER_WORKERS:-3}" --size 1080x1920 --out "$D/out/video.mp4"
# Mode rapide: animer sur les dessins à 12 fps (moteur 2D à 12 fps), livrer une vidéo 24 fps.
if [[ "${OUTPUT_FPS:-${FPS:-24}}" != "${FPS:-24}" ]]; then
  ffmpeg -hide_banner -y -loglevel error -i "$D/out/video.mp4" -vf "fps=${OUTPUT_FPS}" -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -an "$D/out/video-export.mp4"
  mv "$D/out/video-export.mp4" "$D/out/video.mp4"
fi
sh core/render/mux.sh "$D/out/video.mp4" "$D/out/mix.wav" "$D/le-livre-de-papy-$SLUG.mp4" "${OUTPUT_FPS:-${FPS:-24}}" 0
sh core/render/mux.sh "$D/out/video.mp4" "$D/out/mix-sans-papy.wav" "$D/le-livre-de-papy-$SLUG-sans-voix-papy.mp4" "${OUTPUT_FPS:-${FPS:-24}}" 0
echo "::endgroup::"

echo "::group::ZIP de livraison"
python - "$D" "$SLUG" <<'PY'
import os,sys,zipfile
d,slug=sys.argv[1:3]
names=[
f'le-livre-de-papy-{slug}.mp4',
f'le-livre-de-papy-{slug}-sans-voix-papy.mp4',
'papy-texte-timeline.txt','publication.txt','story.jpg','SOURCES.md'
]
missing=[n for n in names if not os.path.isfile(os.path.join(d,n))]
if missing:raise RuntimeError('Livraison incomplète : '+', '.join(missing))
out=os.path.join(d,f'le-livre-de-papy-{slug}-livraison.zip')
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=2) as z:
  for name in names:z.write(os.path.join(d,name),name)
print(out,os.stat(out).st_size,'octets')
PY
echo "::endgroup::"
