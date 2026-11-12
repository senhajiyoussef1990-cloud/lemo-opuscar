"""Original score for "Papi & Léo — Le GPS": the series theme in a new arrangement, 1930s hot dance band, 120 BPM (1 beat = 12 frames), 34 s.
Samples through core/audio/sampler.py (VSCO 2 CE trumpet / muted trumpet / trombone / clarinet / tuba / upright piano / percussion,
VCSL woodblock, Salamander grand piano for the tender middle) + a numpy slide whistle. Output: out/score.wav (48 kHz stereo).
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

BEAT = .5; DUR = 34.6; N = int(DUR * SR)
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

# 0.0–1.5  iris on the map: brushes, a clarinet pick-up (the paper snaps are foley)
brush(0.0, 3, .45); mel('clarinet', 0.5, [(0, .5, 'G4'), (.5, .5, 'C5'), (1, .5, 'D5')], .6, -.25)
# 1.5–6.0  the series theme, clarinet lead this time, muted trumpet answering (Léo walks in and stares)
comp(1.5, ['C', 'C', 'G7', 'C'], .58); brush(1.5, 9, .5)
mel('clarinet', 1.5, A1, .72, -.25); mel('clarinet', 3.5, A2, .7, -.25)
mel('trumpet_mute', 1.5, [(3, .5, 'G5'), (3.5, .5, 'E5'), (7, .5, 'E5'), (7.5, .5, 'C5')], .6, .25, .7)
play('upright', 5.5, 'G2', BEAT * .8, .5, .9, -.15); play('tuba_stac', 5.5, 'G2', .3, .5, 1.2, -.1)
# 6.0–8.5  tuba and soft piano under Papi; it stops, a woodblock on the slow blink
comp(6.0, ['C', 'A7'], .38); play('tuba_stac', 8.0, 'D3', .3, .42, 1.1, -.1); play('tuba_stac', 8.25, 'G2', .3, .42, 1.1, -.1)
wood(8.7, .6, 'c')
# 9.0–12.0  theme again, open trumpet (Léo is shocked)
comp(9.0, ['C', 'C', 'D7'], .62); brush(9.0, 6, .55)
mel('trumpet', 9.0, B1, .76, .15); mel('trumpet', 11.0, B2, .72, .15)
# 12.0–13.3  tuba alone ("Dans mon temps…"), then nothing: two woodblock glances in the silence
for i, p in enumerate(['C3', 'G2', 'C3']): play('tuba_stac', 12.0 + i * BEAT, p, BEAT * .55, .5, 1.1, -.1)
wood(13.75, .55, 'c'); wood(14.1, .5, 'c')
# 16.0  the muted trumpet laughs at the punchline; a two-beat tag
for i, p in enumerate(['G5', 'E5', 'G5', 'E5']): play('trumpet_mute', 16.0 + i * .125, p, .1, .8, .9, .2)
cymbal(16.0); comp(16.5, ['G7'], .45)
# 17.0–19.0  light two-beat; a trombone asks the question
comp(17.0, ['F', 'C'], .42); play('trombone', 18.5, 'G3', .2, .55, .8, -.2); play('trombone', 18.72, 'C4', .3, .6, .8, -.2)
# 19.5–28.0  one piano, soft: the theme at half speed, a low clarinet under the boy's question
def soft(t0, notes, v=.34):
    for off, d, p in notes: play('piano', t0 + off, p, d + .5, v, .9, .05)
soft(19.5, [(0, .5, 'E5'), (.5, .9, 'G5'), (1.5, .4, 'A5'), (2.0, .4, 'G5'), (2.5, 1.2, 'E5')])
soft(22.9, [(0, .5, 'D5'), (.5, .8, 'F5'), (1.5, .4, 'E5'), (2.0, 1.4, 'C5')])
soft(25.9, [(0, .5, 'E5'), (.5, .7, 'G5'), (1.25, .4, 'C6'), (1.75, 1.0, 'A5')], .3)
for t, p in [(19.5, 'C3'), (20.0, 'G3'), (21.0, 'A2'), (21.5, 'E3'), (22.9, 'F2'), (23.4, 'C3'), (24.4, 'G2'), (24.9, 'D3'), (25.9, 'C3'), (26.4, 'G3'), (27.15, 'F2'), (27.6, 'C3')]: play('piano', t, p, 1.3, .28, .9, -.1)
play('clarinet', 24.4, 'G3', 1.3, .3, .5, -.3); play('clarinet', 25.9, 'E3', 1.6, .28, .5, -.3)
# 28.0–31.2  the stride comes back, gently (the map folds on the beats)
comp(28.0, ['C', 'C', 'G7'], .4); brush(28.0, 6, .4)
mel('clarinet', 28.0, [(0, .5, 'E5'), (.5, .5, 'G5'), (1.5, .5, 'A5'), (2, .5, 'G5'), (2.5, 1, 'E5')], .5, -.25, .8)
# 31.2–34  last phrase of the theme, the band together but quiet; the final note on the iris
comp(31.0, ['G7', 'C'], .5); brush(31.0, 4, .45)
mel('trumpet_mute', 31.0, A2, .62, .15, .8); mel('clarinet', 31.0, [(0, 1, 'B4'), (2, 1, 'G4')], .5, -.25, .7)
wood(32.1, .5, 'c')
for p in ['C2', 'G3', 'E4', 'C5']: play('upright', 33.0, p, .5, .6, .8)
play('tuba_stac', 33.0, 'C3', .3, .6, 1.2, -.1)
try: play('xylophone', 33.5, 'C6', .6, .5, .6, .2)
except Exception: play('glockenspiel', 33.5, 'C6', .6, .5, .6, .2)

out = np.stack([limit(buf[:, c], .95) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, '..', 'out'), exist_ok=True)
sf.write(os.path.join(HERE, '..', 'out', 'score.wav'), out.astype(np.float32), SR)
print('score.wav', DUR, 's peak', float(np.abs(out).max()))
