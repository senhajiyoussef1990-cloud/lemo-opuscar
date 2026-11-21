#!/usr/bin/env python3
"""Create an episode-specific illustrated 1930s Story, from the actual cartoon scene."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import sys, math, unicodedata

n=int(sys.argv[1])
subject=sys.argv[2]
date=sys.argv[3]
frame=Path(sys.argv[4])
folder=Path(sys.argv[5])
folder.mkdir(parents=True,exist_ok=True)
W,H=1080,1920
ink=(16,15,13); paper=(243,230,203); cream=(255,248,230)
gold=(204,185,155)
im=Image.new("RGB",(W,H),ink)
d=ImageDraw.Draw(im)
# The original episode artwork (not a generic title card) anchors the announcement.
shot=Image.open(frame).convert("RGB")
art=shot.crop((0,220,1080,1240)).resize((1080,1080),Image.Resampling.LANCZOS)
art=ImageEnhance.Contrast(art).enhance(1.09)
im.paste(art,(0,535))
d=ImageDraw.Draw(im)
d.rectangle((0,0,1079,535),fill=ink)
d.rectangle((0,1540,1079,1919),fill=paper)
for inset,line_width in [(14,10),(28,3),(44,3)]:
    d.rounded_rectangle((inset,inset,1079-inset,1919-inset),radius=45,width=line_width,outline=gold if inset==14 else cream)
for x in (73,1006):
    for y in (70,1850):
        d.ellipse((x-18,y-18,x+18,y+18),fill=ink,outline=paper,width=5)
def font(sz):
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"):
        if Path(f).exists():return ImageFont.truetype(f,sz)
    return ImageFont.load_default()
def centered(txt,y,initial,maxwidth,color=cream,minsize=43):
    sz=initial
    while sz>minsize and d.textbbox((0,0),txt,font=font(sz))[2]>maxwidth:sz-=2
    b=d.textbbox((0,0),txt,font=font(sz))
    x=(W-(b[2]-b[0]))//2
    d.text((x,y),txt,font=font(sz),fill=color,stroke_width=1,stroke_fill=color)
    return y+(b[3]-b[1])+20
# Top typography hierarchy follows the user's vintage episode 7 reference.
centered(f"ÉPISODE {n}",57,88,938)
centered("Papi découvre",172,76,950)
sub=subject.lower()
# Use one or two lines for clarity on mobile.
parts=[sub]
if d.textbbox((0,0),sub,font=font(68))[2]>932:
    words=sub.split()
    split=max(range(1,len(words)),key=lambda i:-abs(len(" ".join(words[:i]))-len(" ".join(words[i:]))))
    parts=[" ".join(words[:split])," ".join(words[split:])]
yy=272
for word in parts: yy=centered(word,yy,70 if len(parts)==1 else 61,928)
centered("Disponible aujourd'hui à 18h",463,47,942)
# Bottom panel and vintage numbered medallion.
d.line([(90,1573),(990,1573)],fill=ink,width=4)
d.line([(90,1840),(990,1840)],fill=ink,width=3)
d.ellipse((428,1595,652,1819),fill=ink,outline=gold,width=9)
d.ellipse((448,1615,632,1799),outline=cream,width=4)
centered(str(n),1631,112,170,cream,80)
for sign in (-1,1):
    cx=540+sign*197
    d.arc((cx-120,1660,cx+120,1740),20 if sign==-1 else 180,145 if sign==-1 else 325,fill=ink,width=7)
    d.ellipse((cx-10,1693,cx+10,1713),fill=ink)
d.text((84,1860),f"« PAPI, SÉRIEUX ? »  |  {date}  |  18H",font=font(26),fill=ink)
for ext in ("jpg","png"):
    out=folder/f"STORY_EP{n}.{ext}"
    im.save(out,quality=94,optimize=True) if ext=="jpg" else im.save(out,optimize=True)
    print(str(out))
