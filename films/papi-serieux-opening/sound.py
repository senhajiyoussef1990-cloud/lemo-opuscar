"""Sound of the opening: a 1.5 s ragtime piano flourish (upright piano samples, VSCO 2 CE, through core/audio/sampler.py),
a little room, the optical-soundtrack pass of the series, and vinyl crackle. No voice. → out/mix.wav"""
import os, sys
import numpy as np
import soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S               # noqa: E402
from core.audio.sfx import SR, add, bp, lp, hp, limit   # noqa: E402

OUTRO = len(sys.argv) > 1 and sys.argv[1] == 'outro'   # python sound.py outro → the 3 s closing tag, out/outro.wav
CARD = len(sys.argv) > 1 and sys.argv[1] == 'card'     # python sound.py card → the 2 s title-card tag, out/card.wav
POINT = OUTRO and len(sys.argv) > 2 and sys.argv[2] == 'point'   # sound.py outro point → the 3 s outro where Papi points at the follow button
DUR = (float(sys.argv[2]) if OUTRO and len(sys.argv) > 2 and not POINT else 3.0) if OUTRO else 2.0 if CARD else 1.5;   # sound.py outro 4 → a 4 s outro
N = int(DUR * SR); R = np.random.default_rng(4 if OUTRO else 6 if CARD else 9)
buf = np.zeros((N + SR, 2), np.float32)
def play(t, p, d, v=.7, g=1.0, pan=0.0): add(buf, S.note('upright', p, d, v), t, g, pan)
if CARD:
    # two bars of soft stride under the title: bass, chord, bass, chord, and a little turn on top
    for t, b, ch in [(.1, 'C3', ['E4', 'G4', 'C5']), (.9, 'G2', ['F4', 'B4', 'D5'])]:
        play(t, b, .3, .75, 1.0, -.2)
        for q in ch: play(t + .4, q, .2, .65, .7, 0)
    for t, q in [(.1, 'E5'), (.5, 'G5'), (.9, 'A5'), (1.3, 'G5'), (1.7, 'E5')]: play(t, q, .25, .7, 1.0, .15)
elif OUTRO:
    # a run down, two closing chords, a last high note left ringing
    for i, q in enumerate(['C6', 'G5', 'E5', 'C5']): play(i * .07, q, .12, .7 - i * .04, .8, .1)
    for t, b, ch in [(.4, 'G2', ['F4', 'B4', 'D5']), (.85, 'C3', ['E4', 'G4', 'C5'])]:
        play(t, b, .3, .75, .95, -.2); play(t, S.name(S.midi(b) - 12), .3, .7, .7, -.2)
        for q in ch: play(t + .02, q, .28, .66, .65, 0)
    if POINT:   # the questions get two chords; then the arm, the cartouche, the arrow, the wink, the iris
        for q, v in [('E5', .6), ('G5', .55)]: play(1.2, q, .25, v, .7, .15)
        for q in ['D5', 'F5', 'B5']: play(1.5, q, .2, .55, .55, .1)
        play(1.5, 'G2', .3, .6, .8, -.2)
        play(2.0, 'C5', .15, .5, .6, .2); play(2.12, 'E5', .15, .5, .6, .2); play(2.24, 'G5', .35, .55, .6, .2)
        for q, v in [('C3', .6), ('G3', .55), ('E4', .55), ('C5', .6), ('C6', .55)]: play(2.62, q, .5, v, .8, 0)
    else:
        for q, v in [('C6', .7), ('E6', .6)]: play(1.3, q, 1.2, v, .7, .15)
        play(1.3, 'C2', 1.2, .6, .8, -.2)
    if DUR > 3.2:   # the longer outro (v2): one more soft answer under the viewer's question
        for q, v in [('E5', .55), ('G5', .5)]: play(2.4, q, 1.0, v, .7, .1)
        play(2.4, 'C3', 1.0, .5, .8, -.2); play(3.2, 'C6', .7, .45, .6, .15)
else:
    # 0.00–0.30  a run up while the iris opens
    for i, p in enumerate(['G4', 'C5', 'E5', 'G5', 'C6']): play(i * .058, p, .12, .6 + i * .05, .8, .1)
    # 0.30–1.20  four beats of stride at 200 bpm (0.3 s a beat), a syncopated right hand on top
    for i, (b, ch) in enumerate([('C3', ['E4', 'G4', 'C5']), ('G2', ['F4', 'B4', 'D5'])]):
        t = .3 + i * .45
        play(t, b, .2, .75, .95, -.2); play(t, S.name(S.midi(b) - 12), .2, .7, .7, -.2)
        for p in ch: play(t + .225, p, .12, .62, .6, 0)
    for t, p in [(.3, 'E5'), (.45, 'G5'), (.6, 'A5'), (.75, 'G5'), (.9, 'D5'), (.975, 'F5'), (1.05, 'B5')]: play(t, p, .14, .72, .85, .15)
    # 1.20  the last chord, held under the pose
    for p, v in [('C2', .85), ('C3', .8), ('G3', .7), ('E4', .7), ('C5', .75), ('C6', .8)]: play(1.2, p, .5, v, .9, 0)
x = buf[:N].astype(np.float64)
if POINT:   # foley: a rubber stretch for the arm, a woodblock for the cartouche, a little ting for the wink, the iris thunk
    tt = lambda d: np.arange(int(d * SR)) / SR
    def put(y, t0, g):
        s = int(t0 * SR); e = min(N, s + len(y)); x[s:e, 0] += y[:e - s] * g; x[s:e, 1] += y[:e - s] * g
    d = .3; u = tt(d); f = 160 + 360 * u / d; saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    put(bp(saw, 300, 2600) * np.abs(np.sin(2 * np.pi * 26 * u)) ** 2 * np.sin(np.pi * u / d), 1.2, .22)
    d = .09; u = tt(d); put((np.sin(2 * np.pi * 900 * u) + .5 * np.sin(2 * np.pi * 2160 * u)) * np.exp(-u / .018), 1.25, .25)
    d = .35; u = tt(d); put(np.sin(2 * np.pi * 2637 * u) * np.exp(-u / .08) + .4 * np.sin(2 * np.pi * 3951 * u) * np.exp(-u / .05), 2.52, .14)
    d = .3; u = tt(d); put(np.sin(2 * np.pi * 90 * u * (1 - .3 * u)) * np.exp(-u / .07), 2.95, .45)
# series' optical pass: band-limit, light saturation
x = np.stack([hp(lp(x[:, c], 6200, 2), 110, 2) for c in range(2)], 1); x = np.tanh(x * 1.4) / np.tanh(1.4)
# vinyl: hiss, crackle, a few louder pops
hiss = bp(R.standard_normal(N), 800, 6000) * .006
crk = np.zeros(N)
for p in (R.random(int(DUR * 40)) * (N - 200)).astype(int): L = R.integers(8, 60); crk[p:p + L] += R.standard_normal(L) * np.exp(-np.arange(L) / 10) * (.03 + R.random() * .08)
for p in (R.random(4) * (N - 400)).astype(int): crk[p:p + 120] += R.standard_normal(120) * np.exp(-np.arange(120) / 14) * (.07 if CARD else .22)
crk = hp(crk, 900)
mix = x + np.stack([hiss + crk, hiss * .9 + crk], 1)
fade = np.ones(N); k = int(.04 * SR); fade[-k:] = np.linspace(1, 0, k); mix *= fade[:, None]
for c in range(2): mix[:, c] = limit(mix[:, c], .95)
mix = mix / np.abs(mix).max() * .89
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
name = 'outro.wav' if OUTRO else 'card.wav' if CARD else 'mix.wav'
sf.write(os.path.join(HERE, 'out', name), mix.astype(np.float32), SR)
print(name, DUR, 's')
