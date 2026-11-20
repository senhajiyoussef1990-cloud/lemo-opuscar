#!/usr/bin/env python3
"""Create an inspectable storyboard of 25 REAL frames from the finished vertical MP4.
Seven eras x 3 moments + opening, book portal, return + the final Story.
Image-generation-free, reproducible; visual anatomy still needs human review.
"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

d=Path(sys.argv[1])
slug=sys.argv[2]
src=d/f'le-livre-de-papy-{slug}-short-9x16.mp4'
assert src.is_file() and src.stat().st_size>100000
ev=json.loads((d/'events.json').read_text())['ev']
cues={x['name']:x for x in ev if x['type']=='cue' and 'name' in x}
assert all(f'w{i}' in cues for i in range(1,8)), list(cues)
frames=[]
for i in range(1,8):
    c=cues[f'w{i}']; a=float(c['t0']); b=float(c['t1'])
    for fraction in (.22,.52,.78):
        frames.append((f'EPOQUE {i} · {int(fraction*100)}%',round(a+(b-a)*fraction,3),None))
for w,fraction,caption in [
  ('home',.10,'SALON · MALIK ET OBJET'),
  ('home',.73,'LIVRE MAGIQUE / PORTAIL'),
  ('home2',.48,'RETOUR · OBJET TENU')]:
    assert w in cues,w
    c=cues[w]
    frames.append((caption,round(float(c['t0'])+(float(c['t1'])-float(c['t0']))*fraction,3),None))
frames.append(('STORY · YEUX OUVERTS',0,d/'story.jpg'))
assert len(frames)==25
TW,TH,PAD,BAR=270,480,14,36
cols=5;rows=5
sheet=Image.new('RGB',(cols*(TW+PAD)+PAD,rows*(TH+BAR+PAD)+PAD),'#17191e')
draw=ImageDraw.Draw(sheet)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',15)
temp=d/'out'/'visual-qc-thumbnails'
temp.mkdir(parents=True,exist_ok=True)
for i,(cap,time,static) in enumerate(frames):
    if static is not None:
        img=Image.open(static).convert('RGB').resize((TW,TH),Image.Resampling.LANCZOS)
    else:
        out=temp/f'{i+1:02d}.jpg'
        command=['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(time),'-i',str(src),'-frames:v','1','-vf',f'scale={TW}:{TH}','-q:v','4',str(out)]
        subprocess.run(command,check=True,capture_output=True,text=True)
        img=Image.open(out).convert('RGB')
    x=PAD+(i%cols)*(TW+PAD);y=PAD+(i//cols)*(TH+BAR+PAD)
    sheet.paste(img,(x,y))
    draw.rectangle((x,y+TH,x+TW,y+TH+BAR),fill='#2d3038')
    draw.text((x+8,y+TH+10),cap,fill='#fff2c2',font=font)
output=d/'controles-visuels.jpg'
sheet.save(output,quality=88,optimize=True)
assert output.is_file() and output.stat().st_size>100000
print('CONTROLES VISUELS :',len(frames),'frames reels /',len([k for k in cues if k.startswith('w')]),'epoques ->',output)
