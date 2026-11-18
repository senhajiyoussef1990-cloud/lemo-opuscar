#!/usr/bin/env bash
# Repare UNIQUEMENT la Story dans un ZIP de livraison deja fabrique.
# Conserve a l'octet pres les MP4 et les autres fichiers: pas de rendu video.
set -euo pipefail
D="${1:?dossier du film requis}"
SLUG="${2:?slug requis}"
SRC="${3:?dossier artifact telecharge requis}"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
mkdir -p "$STAGE/deliver"
shopt -s nullglob
archives=("$SRC"/*.zip)
if (("${#archives[@]}" != 1)); then echo "Un unique zip interne attendu dans $SRC, trouve ${#archives[@]}" >&2; exit 2; fi
unzip -q "${archives[0]}" -d "$STAGE/deliver"
for required in "le-livre-de-papy-$SLUG.mp4" "le-livre-de-papy-$SLUG-sans-voix-papy.mp4" story.jpg publication.txt papy-texte-timeline.txt SOURCES.md; do
  [[ -s "$STAGE/deliver/$required" ]] || { echo "Livraison originale incomplete: $required" >&2; exit 1; }
done
bash "$D/tools/fonts.sh"
node films/story-eye-open.mjs "$D" "$STAGE/story-base.jpg"
python - "$STAGE/story-base.jpg" "$STAGE/deliver/story.jpg" <<'PY'
import os,sys
from PIL import Image,ImageDraw,ImageFont
input_path,output_path=sys.argv[1:]
im=Image.open(input_path).convert('RGB')
assert im.size==(1080,1920), im.size
overlay=Image.new('RGBA',im.size,(0,0,0,0))
z=ImageDraw.Draw(overlay)
z.rounded_rectangle((70,68,1010,270),radius=29,fill=(42,27,69,240),outline=(255,224,102,255),width=8)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
small=ImageFont.truetype(font,44);large=ImageFont.truetype(font,62)
z.text((540,122),'NOUVEL ÉPISODE',font=small,anchor='mm',fill=(255,245,214,255))
z.text((540,206),"AUJOURD'HUI À 18 H",font=large,anchor='mm',fill=(255,224,102,255))
Image.alpha_composite(im.convert('RGBA'),overlay).convert('RGB').save(output_path,quality=95,subsampling=0)
print('Image Story remplacee:',output_path)
PY
# Conservation des fichiers MP4 sans re-encodage, ZIP final sans double compression.
python - "$STAGE/deliver" "$SLUG" <<'PY'
import os,sys,zipfile
d,slug=sys.argv[1:]
names=[f'le-livre-de-papy-{slug}.mp4',f'le-livre-de-papy-{slug}-sans-voix-papy.mp4',
       'papy-texte-timeline.txt','publication.txt','story.jpg','SOURCES.md']
out=os.path.abspath(f'le-livre-de-papy-{slug}-story-yeux-ouverts.zip')
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_STORED,allowZip64=True) as z:
  for name in names: z.write(os.path.join(d,name),name)
with zipfile.ZipFile(out) as z:
  bad=z.testzip()
  assert bad is None, f'Corruption dans ZIP: {bad}'
print('ZIP corrigé:',out,os.path.getsize(out),'octets')
PY
