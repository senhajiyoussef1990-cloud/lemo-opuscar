"""Score → out/score.wav (48 kHz stereo). All synthesized (tools/synth.py). Cue times come from events.json, so each world's music starts on its cut.
Theme: a theremin tune in D minor, first heard when the book opens, heard in full only on the end card.
One genre per world: wood percussion and a breathy flute (long ago), fife and drum (19th century), an oom-pah accordion (20th-century mountains),
elevator bossa (Sweden 1960), surf guitar (campus 1967), toy piano (Sweden 1978), warm Rhodes and theremin "aah" (today).
Home is silent but for the room; home again starts with a dead silence."""
import json, os, sys, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); sys.path.insert(0, HERE)
import synth
from synth import *   # noqa
E = json.load(open(os.path.join(ROOT, 'events.json'))); DUR = E['dur']
SR = 48000; N = int((DUR + .5) * SR); synth.N = N; BEAT = .5
CUE = {e['name']: e for e in E['ev'] if e['type'] == 'cue'}
MK = {e['name']: e for e in E['ev'] if e['type'] == 'mark'}
VO = {e['id']: e['t'] for e in E['ev'] if e['type'] == 'vo'}
BUS = {k: synth.Bus(k) for k in ['drums', 'bass', 'lead', 'harm', 'fx']}
D, L, H, F, B = BUS['drums'], BUS['lead'], BUS['harm'], BUS['fx'], BUS['bass']
def span(name, pad0=.0): c = CUE[name]; return c['t0'] + pad0, c['t1']
def loop(t0, t1, step):
    t = t0
    while t < t1 - 1e-6: yield t; t += step
def cut_all(t0, t1, fade=.06):
    for b in BUS.values(): b.cut(t0, t1, fade)

THEME = [(0, 1, 'D5'), (1, .5, 'A4'), (1.5, .5, 'Bb4'), (2, 1, 'A4'), (3, 1, 'E4'), (4, .5, 'F4'), (4.5, .5, 'E4'), (5, .75, 'Eb4'), (5.75, 1.25, 'D4')]
THEME2 = [(8, 1, 'F4'), (9, .5, 'A4'), (9.5, .5, 'G4'), (10, 1, 'F4'), (11, 1, 'D4'), (12, 1.5, 'E4'), (13.5, .5, 'Cs4'), (14, 2, 'D4')]
def mel(base, notes, gain=1., octave=0, until=1e9, **kw):
    ns = [(base + b * BEAT, d * BEAT - .02, M(n.replace('s', '#')) + octave) for b, d, n in notes if base + b * BEAT < until - .1]
    if ns: t0, x = theremin(ns, **kw); L.add(x, t0, .5 * gain, pan=-.1)
CH = [([M('D3'), M('F3'), M('A3')], M('D2')), ([M('Bb2'), M('D3'), M('F3')], M('Bb1')), ([M('G2'), M('Bb2'), M('D3')], M('G1')), ([M('A2'), M('C#3'), M('E3'), M('G3')], M('A1'))]
def band(base, bars, gain=1., drums=True, until=1e9):
    for bi in range(bars):
        ch, root = CH[bi % 4]; tb = base + bi * 4 * BEAT
        if tb >= until: break
        H.add(pad(4 * BEAT, [m + 12 for m in ch], .5, 1800, .05), tb, .5 * gain)
        for k in range(8): B.add(bass(0, .22, [root, root, root + 7, root + 12, root, root, root + 7, root + 10][k], 1., 1100), tb + k * BEAT / 2, .5 * gain)
        for k in range(16): H.add(pluck(0, .09, (ch + [ch[0] + 12])[k % 4] + 24, 1., .25, 3000), tb + k * BEAT / 4, .1 * gain, pan=.35 * (1 if k % 2 else -1))
        if drums:
            for k in range(4):
                if k in (0, 2): D.add(kick(1), tb + k * BEAT, .8 * gain)
                else: D.add(snare(1), tb + k * BEAT, .4 * gain); D.add(clap(1), tb + k * BEAT, .2 * gain)
            for k in range(8): D.add(hat(1), tb + k * BEAT / 2, (.2 if k % 2 else .12) * gain, pan=.3)

# ———————— home: no music until the book opens; then a riser, the theme slams in on the title ————————
bt = MK['home.BURST']['t']; tt_ = MK['home.TITLE']['t']; h1 = CUE['home']['t1']
t0, th = theremin([(bt, .05, M('D3')), (bt + .05, tt_ - bt - .1, M('A5'))], glide=.4, vib=.45, rate=6.2); L.add(th * np.linspace(.25, .9, len(th)), t0, .45)
F.add(noise_riser(tt_ - bt, .5), bt, .5)
D.add(crash(1), tt_, .45); D.add(kick(1.2), tt_, .6)
band(tt_, 2, 1.0); mel(tt_, THEME, 1.0)
# under h8 / h9: just a pad and a pulse, the portal humming
p0 = tt_ + 4.0
H.add(pad(h1 - p0, [M('D3'), M('A3'), M('F4')], .6, 1500, .4), p0, .4)
for t in loop(p0, h1 - .5, BEAT): B.add(bass(0, .2, M('D2'), 1., 700), t, .35)
for t in loop(h1 - 1.6, h1, .0625): D.add(snare(1), t, .05 + .2 * (t - h1 + 1.6) / 1.6)

# ———————— w1, long ago: wood percussion, a breathy flute ————————
a, b = span('w1', .3)
for i, t in enumerate(loop(a, b, BEAT)):
    D.add(tom(50 if i % 4 == 0 else 55, 1), t, .3); D.add(shaker(1), t + BEAT / 2, .08, pan=.4)
    if i % 2 == 1: H.add(xylo(M(['D5', 'F5', 'A5', 'G5'][(i // 2) % 4]), 1), t, .12, pan=-.3)
    if i % 8 == 0: H.add(pad(8 * BEAT, [M('D3'), M('A3')], .5, 900, .3), t, .25)
FL = [(0, 1.5, 'A4'), (1.5, .5, 'G4'), (2, 1, 'F4'), (3, 1, 'D4'), (4, 2, 'E4'), (6, 1, 'F4'), (7, 1, 'G4'), (8, 2, 'A4'), (10, 2, 'D5'), (12, 2, 'C5'), (14, 2, 'A4')]
for k in range(int((b - a) / (16 * BEAT)) + 1): mel(a + k * 16 * BEAT, FL, .7, until=b, vib=.18, bright=.02, rate=4.8)
cut_all(b - .02, b + .5)
# ———————— w2, 19th century: fife and drum ————————
a, b = span('w2', .3)
for i, t in enumerate(loop(a, b, BEAT / 2)):
    D.add(snare(.8), t, .14 if i % 2 else .26, pan=-.2)
    if i % 8 == 0: D.add(tom(40, 1), t, .5)
FF = ['D6', 'F6', 'A6', 'F6', 'G6', 'E6', 'C6', 'E6', 'D6', 'A5', 'D6', 'F6', 'E6', 'C#6', 'D6', 'D6']
for i, t in enumerate(loop(a, b, BEAT)): H.add(pluck(0, .35, M(FF[i % 16]), 1., .5, 4200), t, .1, pan=.25)
for i, t in enumerate(loop(a, b, 2 * BEAT)): B.add(bass(0, .4, [M('D2'), M('A1')][i % 2], 1., 500), t, .4)
b5 = VO['b5']; cut_all(b5 - .1, b5 + 1.1, .004)   # « Non. »: the music stops briefly
# ———————— w3, 20th-century mountains: oom-pah accordion ————————
a, b = span('w3', .3)
AC = [[M('D4'), M('F4'), M('A4')], [M('C#4'), M('E4'), M('G4')], [M('D4'), M('F4'), M('A4')], [M('D4'), M('G4'), M('Bb4')]]
for i, t in enumerate(loop(a, b, BEAT)):
    if i % 2 == 0: B.add(tuba(0, .3, [M('D2'), M('A1'), M('D2'), M('G1')][(i // 4) % 4]), t, .8)
    else:
        acc = pad(.3, AC[(i // 4) % 4], 1, 2600, .01); acc = acc * (1 + .3 * np.sin(2 * np.pi * 6 * np.arange(len(acc)) / SR)); H.add(acc, t, .28)
AM = [(0, .5, 'A4'), (.5, .5, 'D5'), (1, .5, 'F5'), (1.5, .5, 'E5'), (2, 1, 'D5'), (3, 1, 'A4'), (4, .5, 'G4'), (4.5, .5, 'Bb4'), (5, .5, 'D5'), (5.5, .5, 'C#5'), (6, 2, 'D5')]
for k in range(int((b - a) / (8 * BEAT)) + 1):
    for bb, d, n in AM:
        t = a + k * 8 * BEAT + bb * BEAT
        if t < b - .2: H.add(pad(d * BEAT - .03, [M(n.replace('s', '#'))], 1, 3000, .01), t, .28, pan=.2)
cut_all(b - .02, b + .5)
# ———————— w4, Sweden 1960: elevator bossa (a little too nice; Papy says something nice about an object) ————————
a, b = span('w4', .3)
BC = [([M('F3'), M('A3'), M('C4'), M('E4')], M('F2')), ([M('G3'), M('Bb3'), M('D4'), M('F4')], M('G2')), ([M('E3'), M('G3'), M('Bb3'), M('C4')], M('C2')), ([M('F3'), M('A3'), M('C4'), M('E4')], M('F2'))]
for bi, tb in enumerate(loop(a, b, 2)):
    ch, root = BC[bi % 4]
    for btt, m in [(0, root), (1.5, root + 7), (2, root), (3.5, root + 7)]: B.add(ks(m + 12, .6, 1, .2), tb + btt * BEAT, .38)
    for btt in [0.5, 1.5, 2.5, 3, 3.75]:
        for i, m in enumerate(ch): H.add(ks(m + 12, .5, 1, .45), tb + btt * BEAT + i * .008, .08, pan=.25)
    for btt in [1, 2.5, 3.5]: D.add(rim(1), tb + btt * BEAT, .1, pan=-.3)
    for j in range(8): D.add(shaker(1), tb + j * BEAT / 2, .06 if j % 2 else .04, pan=.4)
cut_all(b - .02, b + .5)
# ———————— w5, campus 1967 in the rain: surf guitar ————————
a, b = span('w5', .3)
SG = ['E3', 'E3', 'G3', 'E3', 'A3', 'G3', 'E3', 'D3']
for i, t in enumerate(loop(a, b, BEAT / 2)):
    n = M(SG[(i // 2) % 8]) + 12
    g_ = ks(n, .25, 1, .8); H.add(g_ * (1 + .5 * np.sin(2 * np.pi * 12 * np.arange(len(g_)) / SR)), t, .12, pan=-.25)
for i, t in enumerate(loop(a, b, BEAT)):
    B.add(bass(0, .4, M(['E2', 'E2', 'A2', 'G2'][(i // 4) % 4]), 1., 800), t, .4)
    D.add(kick(1) if i % 2 == 0 else snare(1), t, .45 if i % 2 == 0 else .3); D.add(hat(1), t + BEAT / 2, .12, pan=.3)
cut_all(b - .02, b + .5)
# ———————— w6, Sweden 1978: toy piano ————————
a, b = span('w6', .3)
TP = ['C6', 'E6', 'G6', 'E6', 'F6', 'D6', 'B5', 'D6', 'E6', 'C6', 'A5', 'C6', 'D6', 'B5', 'G5', 'G5']
for i, t in enumerate(loop(a, b, BEAT)):
    H.add(xylo(M(TP[i % 16]), 1), t, .22, pan=.2)
    if i % 2 == 0: H.add(xylo(M(['C5', 'G4', 'A4', 'G4'][(i // 4) % 4]), 1), t, .14, pan=-.2)
for t in loop(a, b, 2 * BEAT): D.add(shaker(1), t + BEAT, .07)
cut_all(b - .02, b + .5)
# ———————— w7, today: warm Rhodes and a theremin "aah" ————————
a, b = span('w7', .3)
RC = [[M('D3'), M('F#3'), M('A3'), M('C#4'), M('E4')], [M('B2'), M('D3'), M('F#3'), M('A3')], [M('G2'), M('B2'), M('D3'), M('F#3')], [M('A2'), M('C#3'), M('E3'), M('G3')]]
for bi, tb in enumerate(loop(a, b, 4 * BEAT)):
    for i, m in enumerate(RC[bi % 4]): H.add(rhodes(1.8, m + 12, 1), tb + i * .02, .12, pan=-.2 + i * .1)
    B.add(bass(0, 1.6, RC[bi % 4][0] - 12, 1., 500), tb, .35)
    for k in range(4): D.add(rim(1) if k % 2 else kick(.6), tb + k * BEAT, .1 if k % 2 else .3)
t0, ah = theremin([(a + .5, 2.0, M('F#5')), (a + 2.5, 2.5, M('A5')), (a + 5, 3.0, M('E5'))], glide=.2, vib=.28, rate=5.2, bright=.06); L.add(ah, t0, .22)
cut_all(b - .02, b + .5)
# ———————— home again: dead silence; then soft Rhodes under the last lines; the theme in full on the end card ————————
a, b = span('home2')
sil = MK['home2.SILENCE']; s1 = sil['t'] + sil['d']
cut_all(a, s1 + .2, .004)
end = MK['home2.END']['t']
for bi, tb in enumerate(loop(s1 + .2, end, 4 * BEAT)):
    for i, m in enumerate(CH[bi % 4][0]): H.add(rhodes(1.8, m + 12, 1), tb + i * .03, .1)
D.add(crash(1), end, .4); D.add(kick(1.2), end, .5)
band(end, int((b - end) / 2) + 1, .8, until=b - .6); mel(end, THEME + THEME2, 1.0, until=b - .6)
for bb in BUS.values(): bb.b[int((b - .6) * SR):] *= np.linspace(1, 0, len(bb.b[int((b - .6) * SR):]))[:, None]

# ———————— reverb + bus ————————
def ir(d=2.0, decay=.45, lpf=5000, pre=.015):
    n = int(d * SR); tn = np.arange(n) / SR
    x = np.stack([lp(rng.standard_normal(n), lpf) * np.exp(-tn / decay), lp(rng.standard_normal(n), lpf) * np.exp(-tn / decay)], 1); x[:int(pre * SR)] = 0; return x / np.sqrt((x ** 2).sum(0))
def conv(x, h): return np.stack([fftconvolve(x[:, c], h[:, c])[:N] for c in range(2)], 1)
send = {'drums': .08, 'bass': 0, 'lead': .3, 'harm': .22, 'fx': .2}
# no fizz: the noise percussion (hats, shakers, snare rolls, brushes) is softened and its top end rolled off,
# and the whole score gets a gentle low-pass, so no hiss runs under the voices through the eras
D_ = BUS['drums'].b; BUS['drums'].b = np.stack([lp(lp(D_[:, c], 4200), 4200) for c in range(2)], 1) * .55
for k in ('harm', 'lead', 'fx'): BUS[k].b = np.stack([lp(BUS[k].b[:, c], 7000) for c in range(2)], 1)
out = sum(b.b for b in BUS.values()) + conv(sum(BUS[k].b * send[k] for k in BUS), ir()) * .9
for c0, c1 in [(b5 - .1, CUE['w2']['t1']), (a, s1 + .2)]:   # silences stay silent, tails included
    i0, i1 = int(c0 * SR), int(c1 * SR); out[i0:i1] = 0; f = int(.01 * SR); out[i0 - f:i0] *= np.linspace(1, 0, f)[:, None]
out = np.stack([hp(out[:, c], 30) for c in range(2)], 1); pk = np.abs(out).max(); out = out / pk * .89 * .67   # same level as before the fizz removal
os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True); sf.write(os.path.join(ROOT, 'out', 'score.wav'), out.astype(np.float32), SR)
print('score.wav', round(DUR, 1), 's')
