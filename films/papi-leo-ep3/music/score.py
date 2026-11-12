"""Original score for "Papi & Léo — Les likes": the series theme, first in minor (trombone), then in major, 1930s hot dance band, 120 BPM (1 beat = 12 frames), 36 s.
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

BEAT = .5; DUR = 36.6; N = int(DUR * SR)
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

# the theme in C minor, for the mock tragedy (trombone lead)
M1 = [(0, .5, 'Eb4'), (.5, .5, 'G4'), (1.5, .5, 'Ab4'), (2, .5, 'G4'), (2.5, 1, 'Eb4'), (3.5, .5, 'C4')]
M2 = [(0, .5, 'D4'), (.5, .5, 'F4'), (1.5, .5, 'Eb4'), (2, 1.5, 'C4')]
# 0.0–1.0  iris on the heart: a sad trombone, two notes
play('trombone', 0.1, 'G3', .3, .6, .8, -.2); play('trombone', 0.45, 'F#3', .5, .6, .8, -.2)
# 1.0–4.6  the series theme in minor, dragging (Léo staggers to the table); the fall gets the bass drum
comp(1.0, ['Cm', 'Cm', 'G7'], .5); brush(1.0, 7, .4)
mel('trombone', 1.0, M1, .68, -.2); mel('trombone', 3.0, M2[:3], .66, -.2)
mel('clarinet', 1.0, [(0, 1.5, 'G4'), (2, 1.5, 'Eb4'), (4, 1.5, 'D4')], .4, .25, .6)
kick(4.78, .95); cymbal(4.78); play('tuba', 4.78, 'C2', .5, .7, 1.1, -.1)
# 6.0–11.5  Papi stirs: tuba and soft piano, in major; it stops before "C'était parfait"; a woodblock on the blink
comp(7.5, ['C', 'A7'], .36); play('tuba_stac', 9.5, 'D3', .3, .4, 1.1, -.1); play('tuba_stac', 9.75, 'G2', .3, .4, 1.1, -.1)
wood(11.7, .6, 'c')
# 12.0–16.0  the theme in major, open trumpet, the whole band (a million likes!)
comp(12.0, ['C', 'C', 'D7', 'G7'], .64); brush(12.0, 8, .55)
mel('trumpet', 12.0, B1, .78, .15); mel('trumpet', 14.0, B2, .74, .15); play('trumpet', 15.0, 'D5', .6, .76, 1.0, .15)
# 16.0–17.3  tuba alone ("Dans mon temps…"), then nothing: woodblock glances in the silences
for i, p in enumerate(['C3', 'G2', 'C3']): play('tuba_stac', 16.0 + i * BEAT, p, BEAT * .55, .5, 1.1, -.1)
wood(17.9, .55, 'c'); wood(19.95, .5, 'c')
# 21.75  the muted trumpet laughs at the punchline; a two-beat tag
for i, p in enumerate(['G5', 'E5', 'G5', 'E5']): play('trumpet_mute', 21.75 + i * .125, p, .1, .8, .9, .2)
cymbal(21.75); comp(22.25, ['G7'], .45)
# 23.0–25.5  light two-beat (the open hand)
comp(23.0, ['F', 'C'], .42); play('upright', 25.0, 'G2', .4, .45, .9, -.15)
# 26.4  the clarinet chuckles for Papi
for i, p in enumerate(['E5', 'D5', 'E5', 'D5', 'E5', 'C5']): play('clarinet', 26.45 + i * .15, p, .09, .7, .8, -.25)
# 27.5–32.5  one piano, soft: the theme at half speed; the like rings on the xylophone
def soft(t0, notes, v=.34):
    for off, d, p in notes: play('piano', t0 + off, p, d + .5, v, .9, .05)
soft(27.5, [(0, .5, 'E5'), (.5, .9, 'G5'), (1.5, .4, 'A5'), (2.0, .4, 'G5'), (2.5, 1.2, 'E5')])
soft(30.5, [(0, .5, 'D5'), (.5, .8, 'F5'), (1.3, .4, 'E5'), (1.7, 1.0, 'C5')], .3)
for t, p in [(27.5, 'C3'), (28.0, 'G3'), (29.0, 'A2'), (29.5, 'E3'), (30.5, 'F2'), (31.0, 'C3'), (31.8, 'G2'), (32.1, 'D3')]: play('piano', t, p, 1.3, .28, .9, -.1)
def xylo(t, p, v=.55):
    try: play('xylophone', t, p, .5, v, .6, .2)
    except Exception: play('glockenspiel', t, p, .5, v, .6, .2)
xylo(29.65, 'E6'); xylo(29.78, 'G6', .45)
# 32.5–36  the stride comes back, gently; the "5" rings; last chord on the iris
comp(32.5, ['C', 'C', 'G7'], .42); brush(32.5, 5, .4)
mel('clarinet', 32.5, [(0, .5, 'E5'), (.5, .5, 'G5'), (1.5, .5, 'A5'), (2, .5, 'G5'), (2.5, 1, 'E5'), (4, .5, 'D5'), (4.5, .5, 'F5')], .5, -.25, .8)
xylo(34.95, 'G6'); xylo(35.08, 'C7', .45)
for p in ['C2', 'G3', 'E4', 'C5']: play('upright', 35.5, p, .5, .6, .8)
play('tuba_stac', 35.5, 'C3', .3, .6, 1.2, -.1); xylo(35.6, 'C6', .5)

out = np.stack([limit(buf[:, c], .95) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, '..', 'out'), exist_ok=True)
sf.write(os.path.join(HERE, '..', 'out', 'score.wav'), out.astype(np.float32), SR)
print('score.wav', DUR, 's peak', float(np.abs(out).max()))
