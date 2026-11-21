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

# Pilot V2: improve five-finger silhouette only in this newly generated episode.
# Keep existing published chapters and shared character appearance unchanged.
if slug in ('fermeture-eclair','ciseaux','fourchette','cuillere','couteau','assiette','verre'):
    charpath=out/'chars.js'
    chars=charpath.read_text(encoding='utf8')
    first=chars.index('export function hand(')
    after=chars.index('export const sweat',first)
    detailed_hand="""export function hand(x,y,ang,r=21,col=PAL.skinP,{fist=false,lw=6,flip=false}={}){
  push();translate(x,y);rotate(ang);if(flip)scale(1,-1);
  const edge=Math.max(2,lw*.6);
  // A broad palm, four separate rounded fingers and an opposite thumb.
  shape(ell(-r*.14,0,r*.94,r*.88,20),{fill:col,lw:edge});
  for(let i=0;i<4;i++){
    const yy=(-.71+i*.42)*r;
    const length=(fist?(.59+(.07*(i===1||i===2))):(.80+.15*(i===1||i===2)))*r;
    shape(rr(r*.42,yy,length,r*(fist?.31:.28),r*.14),{fill:col,lw:edge});
    if(!fist)stroke([[r*.72,yy+r*.10],[r*.92,yy+r*.10]],Math.max(1.5,edge*.42),{line:'#c78e75'});
    else stroke([[r*.5,yy+r*.19],[r*.73,yy+r*.19]],Math.max(1.4,edge*.35),{line:'#c78e75'});
  }
  shape(spline([[r*.13,r*.68],[r*.76,r*.98],[r*1.02,r*.79],[r*.72,r*.50],[r*.35,r*.36]]),{fill:col,lw:edge});
  stroke([[r*.32,r*.51],[r*.76,r*.75]],Math.max(1.5,edge*.37),{line:'#c78e75'});
  pop();
}
"""
    chars=chars[:first]+detailed_hand+chars[after:]
    charpath.write_text(chars,encoding='utf8')

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
main=main.replace("vertical 1080 × 1920","vertical 1080 × 1920")
# New vertical episodes: a slim, full-width historic-era ribbon at the VERY top.
# Height 100 px instead of the previous thick 186 px plaque at 13.5% screen height.
tag_start=main.index("function tag(t) {")
tag_end=main.index("// subtitles:",tag_start)
thin_tag="""function tag(t) {
  const s = shotAt(t), w = s[3], T = TAGS[w];
  if (!T) return;
  const [a,b] = worldSpan(w), start=a+.9, end=b-.25;
  if (t < start || t >= end) return;
  const [era, desc] = T;
  const alpha = Math.max(0, Math.min(1,(t-start)/.24,(end-t)/.20));
  // Full-width screen-space ribbon, flush to the top edge, no floating panel.
  g.save();
  g.setTransform(1,0,0,1,0,0);
  g.globalAlpha = alpha;
  g.fillStyle = '#2f2637';
  g.fillRect(0,0,W,100);
  g.fillStyle = '#d8b46c';
  g.fillRect(0,96,W,4);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const fit = (str, maxSize, maxWidth) => {
    let sz=maxSize;
    g.font = '800 '+sz+'px "Baloo 2"';
    while (sz>16 && g.measureText(str).width>maxWidth) {
      sz-=1;
      g.font='800 '+sz+'px "Baloo 2"';
    }
  };
  fit(era,34,W-64);
  g.fillStyle='#fff5db';
  g.fillText(era,W/2,35);
  fit(desc,24,W-68);
  g.fillStyle='#e6cb90';
  g.fillText(desc,W/2,75);
  g.restore();
}
"""
main=main[:tag_start]+thin_tag+main[tag_end:]


# Visual standard V2 for the NEW zipper story: restore a readable top ribbon,
# and put the real episode object in Malik's hand (home, history, return).
if slug in ('fermeture-eclair','ciseaux','fourchette','cuillere','couteau','assiette','verre'):
    for before,after in [
        ('g.fillRect(0,0,W,100)','g.fillRect(0,0,W,128)'),
        ('g.fillRect(0,96,W,4)','g.fillRect(0,124,W,4)'),
        ('fit(era,34,W-64)','fit(era,42,W-64)'),
        ('g.fillText(era,W/2,35)','g.fillText(era,W/2,47)'),
        ('fit(desc,24,W-68)','fit(desc,30,W-68)'),
        ('g.fillText(desc,W/2,75)','g.fillText(desc,W/2,98)')
    ]:
        assert before in main, 'Tag template changed: '+before
        main=main.replace(before,after)
    old_malik="&& !m.holdF && w==='home')"
    assert old_malik in main
    main=main.replace(old_malik,"&& !m.holdF)")
    # Wider insert shots: show BOTH the complete boot/jacket and the
    # manipulations on its closure (old 2.1x zoom cropped the whole object).
    for i in range(1,8):
        old=f"w{i}:[960,{1080 if i in (2,7) else 1090 if i in (4,5,6) else 1100},2.1]"
        if old not in main:
            raise RuntimeError("Historical insert framing changed: "+old)
        main=main.replace(old,f"w{i}:[960,1090,1.72]")

    # Let Malik inspect an appropriately historic object when he reacts.
    # Make it share the original arm and hand rig, not an extra floating hand.
    insert="  if (p) papy(p);"
    assert insert in main
    main=main.replace(insert,"""  if (m && w && /^w[1-7]$/.test(w) && !m.holdF && talk('MALIK',t).talking) {
    m.holdF=Wd.heldObject(w,t);
    m.armF={h:[42,30],bend:14,fist:true};
  }
"""+insert)
    if slug == 'fermeture-eclair':
        # The bag is visibly attached to Malik's hand, with a stuck zip at the
        # beginning and a CLOSED zip after returning to the salon.
        old_bag="Wd.homeObject(x+18,y-28,t)"
        assert old_bag in main
        main=main.replace(old_bag,"Wd.homeObject(x+18,y-28,t,w)")
        # Specific transition: the SAME blue bag is caught by the portal; never
        # show the obsolete generic dinosaur backpack or a disconnected zip.
        old_beat="  if (name === 'pack') {   // Malik swings his bag onto his back"
        assert old_beat in main
        new_beat="""  if (name === 'pack' && w === 'home') {
        cam(470,1060,1.3); world(w,t,{glow:1}); Wd.portal(PORT[0],PORT[1]-120,200,t);
        const k=ss(seg(tq,t0,t0+.58));
        p.holdF='book';p.bookOpen=1;p.armF={h:[-20,150],bend:20};
        if(k<.45) {
          m.holdF=(x,y)=>Wd.homeObject(x+18,y-28,t,'home');
          m.armF={h:[36,34],bend:12,fist:true};
        } else {
          m.armF={h:[64,-72],bend:24,fist:false};
          const z=(k-.45)/.55;
          Wd.homeObject(lerp(MX+124,PORT[0],z),lerp(FLOOR-230,PORT[1]-110,z)-88*Math.sin(z*Math.PI),t,'home');
        }
        malik(m);papy(p);return;
      }
    """
        main=main.replace(old_beat,new_beat+old_beat)
        # And the bag remains visible at the moment the two enter the vortex.
        old_rush="malik(sucked({ ...m, nerv: 1 }, t, t0 + .05, t0 + .3));"
        assert old_rush in main
        main=main.replace(old_rush,"malik(sucked({ ...m, nerv: 1, holdF:(x,y)=>Wd.homeObject(x+18,y-28,t,'home'), armF:{h:[36,34],bend:12,fist:true} }, t, t0 + .05, t0 + .3));")
    
    if slug in ('couteau','assiette','verre'):
        # Avoid literal apostrophes inside the generated JavaScript title.
        title=e['title'].upper()
        main=main.replace(title.replace("L'HISTOIRE DE ","L’HISTOIRE DE "),title.replace("'","’"))
        main=main.replace(title,title.replace("'","’"))
        old_prop="Wd.homeObject(x+18,y-28,t)"
        assert old_prop in main
        main=main.replace(old_prop,"Wd.homeObject(x+18,y-28,t,w)")
        old_rush="malik(sucked({ ...m, nerv: 1 }, t, t0 + .05, t0 + .3));"
        assert old_rush in main
        main=main.replace(old_rush,"malik(sucked({ ...m, nerv: 1, holdF:(x,y)=>Wd.homeObject(x+18,y-28,t,'home'), armF:{h:[36,34],bend:12,fist:true} }, t, t0 + .05, t0 + .3));")

    if slug == 'cuillere':
        # Never insert a straight apostrophe in a single-quoted JS title string.
        main=main.replace("L'HISTOIRE DE LA CUILLÈRE","L’HISTOIRE DE LA CUILLÈRE")
        # The same spoon is physically in Malik's hand in the two salon scenes.
        old_prop="Wd.homeObject(x+18,y-28,t)"
        assert old_prop in main
        main=main.replace(old_prop,"Wd.homeObject(x+18,y-28,t,w)")
        old_rush="malik(sucked({ ...m, nerv: 1 }, t, t0 + .05, t0 + .3));"
        assert old_rush in main
        main=main.replace(old_rush,"malik(sucked({ ...m, nerv: 1, holdF:(x,y)=>Wd.homeObject(x+18,y-28,t,'home'), armF:{h:[36,34],bend:12,fist:true} }, t, t0 + .05, t0 + .3));")
    if slug == 'fourchette':
        # French apostrophe must be typographic inside the JS title literal.
        main=main.replace("L'HISTOIRE DE LA FOURCHETTE","L’HISTOIRE DE LA FOURCHETTE")
        # At both ends of the story, Malik grips the whole fork; the pasta
        # is on a real plate placed on the living-room table by objects.js.
        old_prop="Wd.homeObject(x+18,y-28,t)"
        assert old_prop in main
        main=main.replace(old_prop,"Wd.homeObject(x+18,y-28,t,w)")
        old_rush="malik(sucked({ ...m, nerv: 1 }, t, t0 + .05, t0 + .3));"
        assert old_rush in main
        main=main.replace(old_rush,"malik(sucked({ ...m, nerv: 1, holdF:(x,y)=>Wd.homeObject(x+18,y-28,t,'home'), armF:{h:[36,34],bend:12,fist:true} }, t, t0 + .05, t0 + .3));")
    if slug == 'ciseaux':
        # JavaScript source has a single-quoted title literal; use typographic apostrophe.
        # Prevent SyntaxError: text('L'HISTOIRE DES CISEAUX', ...)
        main=main.replace("L'HISTOIRE DES CISEAUX","L’HISTOIRE DES CISEAUX")
        # Visible complete dragon in the hand for both salon scenes.
        old_prop="Wd.homeObject(x+18,y-28,t)"
        assert old_prop in main
        main=main.replace(old_prop,"Wd.homeObject(x+18,y-28,t,w)")
        # Malik's paper dragon travels with the characters, never a generic prop.
        old_rush="malik(sucked({ ...m, nerv: 1 }, t, t0 + .05, t0 + .3));"
        assert old_rush in main
        main=main.replace(old_rush,"malik(sucked({ ...m, nerv: 1, holdF:(x,y)=>Wd.homeObject(x+18,y-28,t,'home'), armF:{h:[36,34],bend:12,fist:true} }, t, t0 + .05, t0 + .3));")

    # In the salon the same hand visibly grips the object; the old prop is
    # still on the table as a background illustration, not a replacement.

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
# New episodes use a SINGLE vertical master; no redundant 16:9 YouTube master.
if slug in ('crayon','fermeture-eclair','ciseaux','fourchette','cuillere','couteau','assiette','verre'):
    publication=publication.replace(f"YouTube — format classique 16:9 — titre\n{subj} | Le Livre de Papy — un voyage à travers 7 époques\n\n","")
    publication=publication.replace("Deux formats : Shorts 9:16 et vidéo YouTube 16:9. Voix de Papy et Malik dans les deux.","Format vertical 9:16 pour TikTok, Reels, Facebook et Shorts. Voix de Papy et Malik.")
(out/'publication.txt').write_text(publication,encoding='utf8')
script='# '+subj+' — Le Livre de Papy\n\n'
for id,line in zip(DATA['ids'],lines):
    script+=f"**{'Papy' if line['who']=='PAPY' else 'Malik'} ({id}) :** « {line['text']} »\n\n"
(out/'SCENARIO.md').write_text(script,encoding='utf8')
print('Episode prêt:',slug,'39 voix, 7 époques, format vertical 1080x1920' if slug in ('crayon','fermeture-eclair','ciseaux','fourchette','cuillere','couteau','assiette','verre') else 'double format')
