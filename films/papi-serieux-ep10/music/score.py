"""Original score for "Papi, sérieux ? — La livraison": the series theme as a piano rag, then one soft slow piano, 1930s hot dance band, 120 BPM (1 beat = 12 frames), 35.5 s.
Samples through core/audio/sampler.py (VSCO 2 CE trumpet / muted trumpet / trombone / clarinet / tuba / upright piano / percussion,
VCSL woodblock, Salamander grand piano for the slow second half) + a numpy slide whistle. Output: out/score.wav (48 kHz stereo).
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

BEAT = .5; DUR = 36.7; N = int(DUR * SR)
buf = np.zeros((N, 2), np.float32)
LEAD = {'tuba_stac': .022, 'tuba': .025, 'trumpet': .018, 'trumpet_mute': .02, 'trombone': .02, 'clarinet': .015}
def nt(inst, p, d, v=.7): return S.note(inst, p, d, v)
def put(x, t, g=1.0, pan=0.0, inst=None): add(buf, np.asarray(x, np.float32), t - LEAD.get(inst, 0), g, pan)
def play(inst, t, p, d, v=.7, g=1.0, pan=0.0): put(nt(inst, p, d, v), t, g, pan, inst)
def up(p, k=12): return S.name(S.midi(p) + k)

CH = {'C': ('C2', 'G2', ['E3', 'G3', 'C4']), 'G7': ('G2', 'D2', ['F3', 'B3', 'D4']), 'A7': ('A1', 'E2', ['G3', 'C#4', 'E4']),
      'Dm': ('D2', 'A2', ['F3', 'A3', 'D4']), 'D7': ('D2', 'A2', ['F#3', 'C4', 'D4']), 'F': ('F2', 'C2', ['A3', 'C4', 'F4']),
      'C7': ('C2', 'G2', ['E3', 'Bb3', 'C4']), 'Bb': ('Bb1', 'F2', ['F3', 'Bb3', 'D4']), 'F#dim': ('F#2', 'C2', ['A3', 'C4', 'Eb4']), 'Cm': ('C2', 'G2', ['Eb3', 'G3', 'C4'])}
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

def xylo(t, p, v=.55):
    try: play('xylophone', t, p, .5, v, .6, .2)
    except Exception: play('glockenspiel', t, p, .5, v, .6, .2)
def rag(t0, notes, v=.7, shift=0):
    """the right hand of the upright piano: (beats, duration in beats, pitch), doubled an octave up, softer"""
    for off, d, p in notes:
        pp = up(p, shift) if shift else p
        play('upright', t0 + off * BEAT, pp, d * BEAT * .9, v, .85, .15); play('upright', t0 + off * BEAT, up(pp), d * BEAT * .9, v * .7, .45, .2)
def left(t0, chords, v=.55, tuba=False):
    for i, c in enumerate(chords):
        if c is None: continue
        root, fifth, tri = CH[c]; t = t0 + i * 2 * BEAT; b = root if i % 2 == 0 else fifth
        play('upright', t, b, BEAT * .8, v, .9, -.2); play('upright', t, up(b), BEAT * .8, v * .85, .6, -.2)
        if tuba: play('tuba_stac', t, up(b) if S.midi(b) < 36 else b, BEAT * .6, v * .8, 1.0, -.1)
        for p in tri: play('upright', t + BEAT, p, BEAT * .35, v * .8, .5, 0)
# 0.0–4.5  light ragtime, piano lead (Léo is proud of his order)
left(0.0, ['C', 'C', 'G7', 'C'], .58, True); brush(0.0, 9, .45)
rag(0.0, A1, .7); rag(2.0, A2, .68)
# 4.5–8.5  left hand only under the newspaper
left(4.5, ['C', 'A7', 'Dm'], .36); play('upright', 7.5, 'G2', .4, .36, .9, -.2); play('upright', 8.0, 'G2', .3, .36, .9, -.2)
# 8.5–14.0  the rag again, busier, a clarinet answering (I can see him on the map!)
left(8.5, ['C', 'C', 'D7', 'G7', 'C'], .58, True); brush(8.5, 11, .5)
rag(8.5, B1, .74); rag(10.5, B2, .72); rag(11.5, [(0, .5, 'D5'), (.5, .5, 'B4'), (1, .5, 'G4')], .7); rag(12.5, [(0, .5, 'E5'), (.5, .5, 'G5'), (1.5, .5, 'C6')], .7)
mel('clarinet', 9.5, [(0, .5, 'G5'), (.5, .5, 'E5'), (4, .5, 'A5'), (4.5, .5, 'F#5')], .55, -.3, .6)
# 14.0–15.7  left hand while the paper comes down, then nothing; woodblock glances in the silences
left(14.0, ['C', 'G7'], .4); play('upright', 15.5, 'C3', .15, .4, .8, -.2)
wood(16.2, .5, 'c'); wood(18.9, .45, 'c')
# 20.85  the muted trumpet laughs after "avec le pain"
for i, p in enumerate(['G5', 'E5', 'G5']): play('trumpet_mute', 20.85 + i * .125, p, .1, .75, .85, .2)
# 21.0–24.5  the turning point: the rag stalls with the scooter, a sad trombone under the hourglass
for k, (t, p) in enumerate([(21.0, 'E5'), (21.3, 'D5'), (21.65, 'C5')]): play('upright', t, p, .3, .55 - k * .08, .8, .15)
play('upright', 21.0, 'C3', .4, .45, .8, -.2)
play('trombone', 22.25, 'D4', .22, .55, .75, -.2); play('trombone', 22.5, 'C#4', .45, .55, .75, -.2)
# 24.5–36.0  one soft, slow piano; the slam of the jar gets a low note; the theme at half speed, slowing still
def soft(t, p, d, v=.32, pan=.05): play('piano', t, p, d + .6, v, .9, pan)
for t, p, d in [(24.6, 'E5', .5), (25.1, 'G5', .9)]: soft(t, p, d, .28)
for t, p in [(24.6, 'C3'), (25.1, 'G3')]: soft(t, p, 1.0, .24, -.1)
soft(26.3, 'C2', 1.0, .4, -.1); soft(26.3, 'C3', 1.0, .36, -.1)
for t, p, d in [(28.2, 'E5', .5), (28.7, 'G5', .9), (29.8, 'A5', .4), (30.3, 'G5', .4), (30.8, 'E5', 1.0)]: soft(t, p, d)
for t, p in [(28.2, 'C3'), (28.7, 'G3'), (29.8, 'A2'), (30.3, 'E3'), (31.3, 'F2'), (31.8, 'C3')]: soft(t, p, 1.0, .26, -.1)
for t, p, d in [(32.7, 'D5', .6), (33.3, 'F5', 1.0), (34.4, 'E5', .5)]: soft(t, p, d, .3)
for t, p in [(32.7, 'G2'), (33.3, 'D3'), (34.4, 'C3')]: soft(t, p, 1.2, .24, -.1)
for t, p in [(35.0, 'C3'), (35.02, 'G3'), (35.04, 'E4'), (35.06, 'C5')]: soft(t, p, .9, .3, 0)
xylo(35.75, 'C6', .45)

out = np.stack([limit(buf[:, c], .95) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, '..', 'out'), exist_ok=True)
sf.write(os.path.join(HERE, '..', 'out', 'score.wav'), out.astype(np.float32), SR)
print('score.wav', DUR, 's peak', float(np.abs(out).max()))
