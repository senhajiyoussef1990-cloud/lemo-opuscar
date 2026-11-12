"""Original score for "Papi & Léo — L'IA": 1930s hot dance band, 120 BPM (1 beat = 12 frames), 30 s.
Samples through core/audio/sampler.py (VSCO 2 CE trumpet / muted trumpet / trombone / clarinet / tuba / upright piano / percussion,
VCSL woodblock, Salamander grand piano for the last solo) + a numpy slide whistle. Output: out/score.wav (48 kHz stereo).
Every time below is in seconds on the film's timeline (story.js)."""
import os, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../../..'))
sys.path.insert(0, LIB)
from core.audio import sampler as S          # noqa: E402
from core.audio.sfx import SR, add, limit    # noqa: E402

BEAT = .5; DUR = 30.6; N = int(DUR * SR)
buf = np.zeros((N, 2), np.float32)
LEAD = {'tuba_stac': .022, 'tuba': .025, 'trumpet': .018, 'trumpet_mute': .02, 'trombone': .02, 'clarinet': .015}
def nt(inst, p, d, v=.7): return S.note(inst, p, d, v)
def put(x, t, g=1.0, pan=0.0, inst=None): add(buf, np.asarray(x, np.float32), t - LEAD.get(inst, 0), g, pan)
def play(inst, t, p, d, v=.7, g=1.0, pan=0.0): put(nt(inst, p, d, v), t, g, pan, inst)
def up(p, k=12): return S.name(S.midi(p) + k)

CH = {'C': ('C2', 'G2', ['E3', 'G3', 'C4']), 'G7': ('G2', 'D2', ['F3', 'B3', 'D4']), 'A7': ('A1', 'E2', ['G3', 'C#4', 'E4']),
      'Dm': ('D2', 'A2', ['F3', 'A3', 'D4']), 'D7': ('D2', 'A2', ['F#3', 'C4', 'D4']), 'F': ('F2', 'C2', ['A3', 'C4', 'F4']),
      'C7': ('C2', 'G2', ['E3', 'Bb3', 'C4']), 'Bb': ('Bb1', 'F2', ['F3', 'Bb3', 'D4']), 'F#dim': ('F#2', 'C2', ['A3', 'C4', 'Eb4'])}
def stride(t, chord, v=.6, tuba=True, beats=2):
    """Two beats of stride: bass octave on the first, chord on the second (+ tuba on the bass note)"""
    root, fifth, tri = CH[chord]
    play('upright', t, root, BEAT * .8, v, .9, -.15); play('upright', t, up(root), BEAT * .8, v * .85, .7, -.15)
    if tuba: play('tuba_stac', t, up(root) if S.midi(root) < 36 else root, BEAT * .6, v, 1.2, -.1)
    if beats > 1:
        for p in tri: play('upright', t + BEAT, p, BEAT * .35, v * .8, .55, .1)
def comp(t0, chords, v=.6, tuba=True):
    """chords: one per half bar (2 beats), alternating root / fifth in the bass"""
    for i, c in enumerate(chords):
        if c is None: continue
        root, fifth, tri = CH[c]; t = t0 + i * 2 * BEAT
        b = root if i % 2 == 0 else fifth
        play('upright', t, b, BEAT * .8, v, .9, -.15); play('upright', t, up(b), BEAT * .8, v * .85, .7, -.15)
        if tuba: play('tuba_stac', t, up(b) if S.midi(b) < 36 else b, BEAT * .6, v, 1.2, -.1)
        for p in tri: play('upright', t + BEAT, p, BEAT * .35, v * .8, .55, .1)
def brush(t0, n, v=.5):
    rng = np.random.default_rng(int(t0 * 13))
    for k in range(n):
        m = int(BEAT * .9 * SR); w = sosfilt(butter(2, [1800, 7000], 'band', fs=SR, output='sos'), rng.standard_normal(m))
        e = np.linspace(0, 1, m) ** .5 * np.exp(-np.linspace(0, 4, m)); put((w * e * .05 * v).astype(np.float32), t0 + k * BEAT, 1, .05)
        if k % 2: put(S.hit('snare2', 'taps', v * .7), t0 + k * BEAT, .9, 0)
def roll(t0, t1, v0=.3, v1=.8):
    d = t1 - t0; x = S.hit('snare', 'roll', .8)
    if len(x) < d * SR: x = np.concatenate([x] * int(np.ceil(d * SR / len(x) + 1)))
    x = x[:int(d * SR)].copy(); x *= np.linspace(v0, v1, len(x), dtype=np.float32); x[-240:] *= np.linspace(1, 0, 240); put(x, t0)
def cymbal(t, short=True, v=.8): put(S.hit('clash', 'short') if short else S.hit('crash', None, v), t - .012, .85 if short else .7, .1)
def kick(t, v=.7): put(S.hit('bass_drum', None, v), t, .9)
def wood(t, v=.6, var='c'): put(S.hit('woodblock', var, v), t, 1.0, .25)
def slide(t0, d, f0, f1, vel=.22, curve=1.0):
    n = int(d * SR); u = np.linspace(0, 1, n) ** curve
    f = f0 * (f1 / f0) ** u * (1 + .006 * np.sin(2 * np.pi * 6 * np.arange(n) / SR)); ph = 2 * np.pi * np.cumsum(f) / SR
    br = sosfilt(butter(2, [1500, 5000], 'band', fs=SR, output='sos'), np.random.default_rng(3).standard_normal(n)) * .08
    e = np.minimum(1, np.arange(n) / (.03 * SR)) * np.minimum(1, (n - np.arange(n)) / (.05 * SR))
    put(((np.sin(ph) + .12 * np.sin(2 * ph) + br) * e * vel).astype(np.float32), t0, 1, .2)
def mel(inst, t0, notes, v=.72, pan=0., g=1.0, shift=0, legato=.92):
    for off, d, p in notes: play(inst, t0 + off * BEAT, up(p, shift) if shift else p, d * BEAT * legato, v, g, pan)

# —— the theme: two syncopated bars in C, and its answer ——
A1 = [(0, .5, 'E5'), (.5, .5, 'G5'), (1.5, .5, 'A5'), (2, .5, 'G5'), (2.5, 1, 'E5'), (3.5, .5, 'C5')]
A2 = [(0, .5, 'D5'), (.5, .5, 'F5'), (1.5, .5, 'E5'), (2, 1, 'C5'), (3, .5, 'G4')]
B1 = [(0, .5, 'E5'), (.5, .5, 'G5'), (1.5, .5, 'C6'), (2, .5, 'A5'), (2.5, 1, 'G5')]
B2 = [(0, .5, 'F#5'), (.5, .5, 'A5'), (1.5, .5, 'G5')]

# 0.0–1.0  iris: roll, cymbal when the crêpe lands
roll(0.0, .75, .15, .7); cymbal(.75); kick(.75)
# 1.0–4.0  theme A, the band (Léo bursts in)
comp(1.0, ['C', 'C', 'G7'], .62); brush(1.0, 6, .5)
mel('trumpet', 1.0, A1, .7, .15); mel('trumpet', 3.0, A2[:3], .68, .15)
mel('clarinet', 1.0, [(0, 1, 'C5'), (2, 1, 'E5'), (4, 1, 'B4')], .5, -.3, .7)
# 4.0–7.5  the band drops under Papi; it stops on "18 ans"
comp(4.0, ['C', 'A7', 'Dm'], .4); play('upright', 7.0, 'G2', BEAT * .8, .4, .9, -.15); play('tuba_stac', 7.0, 'G2', .3, .45, 1.2, -.1)
mel('clarinet', 4.0, [(0, 1.5, 'G4'), (2, 1.5, 'E4'), (4, 1.5, 'F4')], .42, -.3, .7)
wood(7.5, .7, 'c'); wood(7.75, .55, 'c')
# 8.0–10.75  theme again, clarinet lead (Léo insists)
comp(8.0, ['C', 'C', 'D7'], .58); brush(8.0, 5, .5)
mel('clarinet', 8.0, B1, .72, -.25); mel('clarinet', 10.0, B2, .7, -.25)
# 11.0–14.5  the tuba alone, oom-pah (meetings about meetings)
for i, p in enumerate(['C3', 'G2', 'C3', 'G2', 'C3', 'G2', 'D3', 'G2']): play('tuba_stac', 11.0 + i * BEAT, p, BEAT * .55, .5, 1.1, -.1)
wood(13.0, .6, 'c'); wood(14.3, .6, 'c'); play('tuba', 14.5, 'C2', .22, .5, 1.0, -.1)
# 14.75–16.0  stop. 16.0  the muted trumpet laughs
for i, p in enumerate(['G5', 'E5', 'G5', 'E5']): play('trumpet_mute', 16.0 + i * .125, p, .1, .8, .9, .2)
# 16.5–19.5  light two-beat; the slide whistle goes up and comes down with the crêpe
comp(16.5, ['F', 'F'], .42); slide(17.5, .5, 520, 1500, .22, .7); slide(18.0, .5, 1500, 560, .2, 1.4)
cymbal(18.5); kick(18.5); comp(18.5, ['C7'], .45)
# 19.5–21.5  Léo and his phone: a sad trombone
play('trombone', 20.85, 'D4', .22, .6, .8, -.2); play('trombone', 21.08, 'C#4', .42, .6, .8, -.2)
# 21.5–25.0  tutti, up a fourth (F): "Moi, j'ai les mains"
comp(21.5, ['F', 'F', 'C7', 'F', 'F', 'F#dim'], .7); brush(21.5, 13, .6)
mel('trumpet', 21.5, A1, .8, .15, 1.0, 5); mel('trumpet', 23.5, A2[:4], .8, .15, 1.0, 5)
mel('clarinet', 21.5, [(0, .5, 'C5'), (.5, .5, 'A4'), (1.5, .5, 'C5'), (2, .5, 'A4'), (2.5, 1, 'F4'), (4, .5, 'G4'), (4.5, .5, 'Bb4'), (5.5, .5, 'A4')], .6, -.3, .75, 12)
mel('trombone', 21.5, [(0, 1.5, 'F3'), (2, 1.5, 'A3'), (4, 1.5, 'G3'), (6, 1, 'F3')], .6, -.2, .7)
for p in ['F2', 'C4', 'F4', 'A4']: play('upright', 25.0, p, .3, .8, .8)
play('trumpet', 25.0, 'F5', .22, .85, 1.0, .15); play('tuba_stac', 25.0, 'F2', .3, .8, 1.2, -.1); cymbal(25.0); kick(25.0, .9)
# 27.5–30  one piano, soft: the theme at half speed
for t, p, d in [(27.5, 'E5', .5), (28.0, 'G5', .7), (28.75, 'A5', .25), (29.0, 'G5', .25), (29.25, 'E5', .7)]: play('piano', t, p, d + .4, .34, .9, .05)
for t, p in [(27.5, 'C3'), (27.75, 'G3'), (28.5, 'A2'), (28.75, 'E3'), (29.5, 'C3'), (29.5, 'G3'), (29.5, 'E4'), (29.52, 'C5')]: play('piano', t, p, 1.2, .3, .9, -.1)
try: play('xylophone', 29.95, 'C6', .6, .5, .6, .2)
except Exception: play('glockenspiel', 29.95, 'C6', .6, .5, .6, .2)

out = np.stack([limit(buf[:, c], .95) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, '..', 'out'), exist_ok=True)
sf.write(os.path.join(HERE, '..', 'out', 'score.wav'), out.astype(np.float32), SR)
print('score.wav', DUR, 's peak', float(np.abs(out).max()))
