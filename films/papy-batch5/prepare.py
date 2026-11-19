#!/usr/bin/env python3
"""Prepare one of the five Papy stories from the approved soap / glasses model.
Usage: python films/papy-batch5/prepare.py papier
Output: films/papy-papier/ ready for TTS, event extraction and dual-aspect render.
Source episodes and production templates are committed in GitHub; nothing is made up at render time.
"""
import json, re, sys, shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BATCH=ROOT/'films/papy-batch5'
BASE=ROOT/'films/papy-savon'
DATA=json.loads((BATCH/'episodes.json').read_text(encoding='utf8'))
assert len(DATA['ids'])==39
ALL={x['slug']:x for x in DATA['episodes']}
slug=sys.argv[1] if len(sys.argv)>1 else ''
if slug not in ALL: raise SystemExit('Select: '+', '.join(ALL))
e=ALL[slug]; out=ROOT/'films'/('papy-'+slug)
out.mkdir(parents=True,exist_ok=True)
(out/'tools').mkdir(exist_ok=True)
(out/'fonts').mkdir(exist_ok=True)
for name in ['chars.js','worlds.js','index.html']:
    shutil.copy2(BASE/name,out/name)
shutil.copy2(BATCH/'people.js',out/'people.js')
shutil.copy2(BATCH/'objects.js',out/'objects.js')
shutil.copy2(BATCH/'workshops.js',out/'workshops.js')
for name in ['score.py','synth.py','mix.py','voice.py','foley.py','fonts.sh']:
    shutil.copy2(BASE/'tools'/name,out/'tools'/name)
shutil.copy2(BASE/'fonts/fonts.css',out/'fonts/fonts.css')
# Avoid intentionally generated crackles, electrical hum and loud transient FX.
# The original soap ambience is inappropriate for quiet historical workshops.
mixpath=out/'tools/mix.py'
mix=mixpath.read_text(encoding='utf8')
mix=mix.replace("'w2': lambda: crackle(d) * .6","'w2': lambda: bed(d, 450, .012)")
mix=mix.replace("'w7': lambda: murmur(d, .022) + hum(d)","'w7': lambda: bed(d, 400, .012)")
mix=mix.replace("'home': lambda: hum(d) + ticks(d) + bed(d, 300, .015)","'home': lambda: bed(d, 300, .012)")
mix=mix.replace("'home2': lambda: hum(d) + ticks(d) + bed(d, 300, .015)","'home2': lambda: bed(d, 300, .012)")
mix=mix.replace("mus * .6 * duck[:, None] + sfxb * .8","mus * .38 * duck[:, None] + sfxb * .26")
# Every sound effect fades in and out to avoid sample-step noise at cue boundaries.
old_fx="if ty in FXT: f, gdb = FXT[ty]; add(sfxb, f() * v, t, gdb, float(rng.uniform(-.2, .2)))"
new_fx="if ty in FXT: f, gdb = FXT[ty]; add(sfxb, fade(f() * v, .010, .035), t, gdb * .75, float(rng.uniform(-.2, .2)))"
assert old_fx in mix, "FX insertion changed"
mix=mix.replace(old_fx,new_fx)
# Avoid miscellaneous artificial background sounds that clash with the artisan demonstrations.
mix=mix.replace("'w1': lambda: bed(d, 700, .035) + chirps(d, int(d * .6))","'w1': lambda: bed(d, 600, .014)")
mix=mix.replace("'w3': lambda: bed(d, 900, .06)","'w3': lambda: bed(d, 600, .014)")
mix=mix.replace("'w4': lambda: bed(d, 500, .02) + chirps(d, int(d * .4), 3400)","'w4': lambda: bed(d, 500, .014)")
mix=mix.replace("'w5': lambda: rain(d) + bed(d, 400, .02)","'w5': lambda: bed(d, 450, .014)")
mix=mix.replace("'w6': lambda: murmur(d, .02) + chirps(d, int(d * .3)","'w6': lambda: bed(d, 600, .014) + chirps(d, 0")
# Gentle anti-alias top cut is sufficient for speech, and tames harsh synthesized foley.
mix=mix.replace("lp(mix[:, c], 15000)","lp(mix[:, c], 9500)")
mix=mix.replace("+ amb * .9","+ amb * .55")
mixpath.write_text(mix,encoding='utf8')
# Voice fade edges avoid audible splice clicks between independently synthesized lines.
voicepath=out/'tools/voice.py'
voice=voicepath.read_text(encoding='utf8')
needle="    sf.write(os.path.join(HERE, 'voices', l['id'] + '.wav'), y.astype(np.float32), SR)"
assert needle in voice
voice=voice.replace(needle,"    edge = min(int(.012 * SR), len(y)//4)\\n    if edge > 1:\\n        ramp = np.linspace(0,1,edge)\\n        y[:edge] *= ramp\\n        y[-edge:] *= ramp[::-1]\\n"+needle)
voice=voice.replace('\\n','\n')
voicepath.write_text(voice,encoding='utf8')

toon=(BASE/'toon.js').read_text(encoding='utf8')
before='export const W = 1080, H = 1920;'
after=('const WIDE = new URLSearchParams(location.search).get("wide") === "1";\n'
       'export const W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920;')
assert before in toon
toon=toon.replace(before,after)
before="export function init(canvas) { g = canvas.getContext('2d'); return g; }"
after="export function init(canvas) { canvas.width = W; canvas.height = H; g = canvas.getContext('2d'); return g; }"
assert before in toon
toon=toon.replace(before,after)
(out/'toon.js').write_text(toon,encoding='utf8')
main=(BASE/'main.js').read_text(encoding='utf8')
checks=[
("import * as Wd from './soap.js';","import * as Wd from './objects.js';"),
("Wd.heldSoap(w,t)","Wd.heldObject(w,t)"),
("Wd.soap(x+18,y-28,.27,{kind:'modern',t})","Wd.homeObject(x+18,y-28,t)"),
("L’HISTOIRE DU SAVON","L’HISTOIRE DU "+e['title'].split('du ',1)[-1].upper() if "du " in e['title'] else e['title'].upper().replace("L'HISTOIRE DE ","L’HISTOIRE DE ")),
("init(document.getElementById('c'));","init(document.getElementById('c'));\nconst WIDE = W > H;"),
("const lines = wrap(s.text), lh = 70, y0 = 1560 - (lines.length - 1) * lh;",
 "const lines = wrap(s.text, WIDE ? 1470 : 920), lh = WIDE ? 65 : 70, y0 = (WIDE ? H - 168 : 1560) - (lines.length - 1) * lh;"),
("reset(); translate(540, 300); scale(s * out, s); titleArt(t);",
 "reset(); translate(WIDE ? W / 2 : 540, WIDE ? 164 : 300); scale((WIDE ? .8 : 1) * s * out, (WIDE ? .8 : 1) * s); titleArt(t);"),
("reset(); translate(540, 300); scale(back(seg(q(t), a, a + .3), 2.2)); titleArt(t, .95);",
 "reset(); translate(WIDE ? W/2 : 540, WIDE ? 174 : 300); scale((WIDE ? .75 : 1) * back(seg(q(t), a, a + .3), 2.2)); titleArt(t, .95);"),
("translate(540, 640); scale(k);","translate(WIDE ? W/2 : 540, WIDE ? H-128 : 640); scale(k * (WIDE ? .85 : 1));"),
("reset(); push(); translate(W / 2, H * .135);","reset(); push(); translate(W / 2, H * (WIDE ? .145 : .135));"),
("scale(0.92 + 0.08 * back(seg(t, a1, a1 + .3), 1.4));","scale((WIDE ? 1.08 : 1) * (0.92 + 0.08 * back(seg(t, a1, a1 + .3), 1.4)));")
]
for a,b in checks:
    if a not in main: raise RuntimeError('Template changed, missing: '+a)
    main=main.replace(a,b)
# Synchronize artisan activity and materials with the currently spoken line,
# including the moving worker's hand during the full insert shot.
assert "BR = [w, t]; Wd.VIEW.ins = shot === 'ins';" in main
main=main.replace("BR = [w, t]; Wd.VIEW.ins = shot === 'ins';",
                  "BR = [w, t]; Wd.setAction(id,u); Wd.VIEW.ins = shot === 'ins';")
assert "BR = [w, t]; Wd.SUN.on = false;" in main
main=main.replace("BR = [w, t]; Wd.SUN.on = false;",
                  "BR = [w, t]; Wd.setAction(null,0); Wd.SUN.on = false;")
main=main.replace("vertical 1080 × 1920","dual 9:16 et 16:9")
(out/'main.js').write_text(main,encoding='utf8')
story=(BASE/'story.js').read_text(encoding='utf8')
begin=story.index('export const TAGS = {')
end=story.index('\n};',begin)+3
tags={f'w{i+1}':[x[0]+' · '+x[1],x[2],'#70543c','#fff'] for i,x in enumerate(e['eras'])}
story=story[:begin]+'export const TAGS = '+json.dumps(tags,ensure_ascii=False,indent=2)+';'+story[end:]
(out/'story.js').write_text(story,encoding='utf8')
for ident,sentence in zip(DATA['ids'],e['lines']):
    assert sentence and isinstance(sentence,str),ident
WHO={**{f'h{i}':('MALIK' if i%2 else 'PAPY') for i in range(1,8)}}
WHO.update({'h6':'PAPY','h7':'MALIK'})
for group,person in [('a',{3:'MALIK'}),('b',{3:'MALIK'}),('c',{3:'MALIK'}),('d',{3:'MALIK'}),('e',{3:'MALIK'}),('f',{3:'MALIK'}),('g',{3:'MALIK'}),('z',{2:'MALIK'})]:
    for k in range(1,6): WHO[group+str(k)]=person.get(k,'PAPY')
WHO.update({'o1':'PAPY','o2':'PAPY'})
lines=[{'id':id,'who':WHO[id],'text':text,
        'voice':'fr-CH-FabriceNeural' if WHO[id]=='PAPY' else 'fr-FR-EloiseNeural',
        'rate':'+0%' if WHO[id]=='PAPY' else '+14%','pitch':'+0Hz'}
        for id,text in zip(DATA['ids'],e['lines'])]
assert len(lines)==39 and len({x['id'] for x in lines})==39
(out/'lines.json').write_text(json.dumps(lines,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(out/'episode.json').write_text(json.dumps(e,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
sources='# Repères documentaires : '+e['title']+'\n\n'
sources+='Les dates des cartouches sont des jalons du développement de cet objet, et non un inventeur unique. Les dialogues sont fictifs.\n\n'
sources+='\n'.join('- '+u for u in e['sources'])+'\n'
(out/'SOURCES.md').write_text(sources,encoding='utf8')
subj=e['title'][0].upper()+e['title'][1:]
publication=f"""YouTube Shorts — titre
Le Livre de Papy | {subj} 🕰️ #Shorts

YouTube — format classique 16:9 — titre
{str(subj)} | Le Livre de Papy — un voyage à travers 7 époques

YouTube — description
Pourquoi cet objet existe-t-il ? Malik pose la question à Papy. Son livre magique les emmène à travers sept époques et sept pays ou lieux pour comprendre l'histoire de cet objet du quotidien.
Deux formats : Shorts 9:16 et vidéo YouTube 16:9. Voix de Papy et Malik dans les deux.
#LeLivreDePapy #Histoire #CultureGenerale #Animation

TikTok
Un objet tout simple… et une histoire qui traverse les siècles ! Papy et Malik explorent : {subj}. 📖✨
#LeLivreDePapy #LeSaviezVous #Histoire #Animation

Instagram Reels
📚 {subj} — sept époques, un livre magique, et deux générations pour découvrir le passé. Nouveau voyage de Papy et Malik !
#LeLivreDePapy #Curiosite #Animation

Facebook
C'est le moment du nouveau voyage de Papy et Malik ! Aujourd'hui : {subj}. Découvrez les inventions, les artisans et les idées qui ont façonné cet objet du quotidien.

Story
NOUVEL ÉPISODE
{str(subj).upper()}
AUJOURD'HUI À 18 H
"""
(out/'publication.txt').write_text(publication,encoding='utf8')
script='# '+subj+' — Le Livre de Papy\n\n'
for id,line in zip(DATA['ids'],lines):
    script+=f"**{'Papy' if line['who']=='PAPY' else 'Malik'} ({id}) :** « {line['text']} »\n\n"
(out/'SCENARIO.md').write_text(script,encoding='utf8')
print('Episode prêt:',slug,'39 voix, 7 époques, formats 1080x1920 et 1920x1080')
