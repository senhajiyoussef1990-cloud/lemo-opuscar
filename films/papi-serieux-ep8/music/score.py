"""Original score for "Papi, sérieux ? — Les vocaux": the series theme as a piano rag, then one soft slow piano, 1930s hot dance band, 120 BPM (1 beat = 12 frames), 35.5 s.
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

BEAT = .5; DUR = 35.7; N = int(DUR * SR)
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
# 0.0–3.5  light ragtime, piano lead (Léo comes in with the seven-minute message)
left(0.0, ['C', 'C', 'G7', 'C'], .58, True); brush(0.0, 7, .45)
rag(0.0, A1, .7); rag(2.0, A2[:4], .68)
# 3.5–7.5  left hand only under Papi
left(3.5, ['C', 'A7', 'Dm'], .36); play('upright', 6.5, 'G2', .4, .36, .9, -.2)
# 7.5–11.5  the rag again, at double time in the right hand (listen to it at twice the speed!)
left(7.5, ['C', 'C', 'D7', 'G7'], .58, True); brush(7.5, 8, .5)
rag(7.5, [(o / 2, d / 2, p) for o, d, p in B1], .7); rag(8.75, [(o / 2, d / 2, p) for o, d, p in A1], .7); rag(10.25, [(o / 2, d / 2, p) for o, d, p in B2], .7)
mel('clarinet', 9.5, [(0, .5, 'F5'), (.5, .5, 'A5'), (1.5, .5, 'G5'), (2, .5, 'F5'), (2.5, .5, 'E5'), (3, .5, 'D5')], .55, -.3, .6)
# 11.5–13.0  left hand ("Dans mon temps…"), then nothing; woodblock glances in the silences
left(11.5, ['C', 'G7'], .4); play('upright', 13.0, 'C3', .15, .4, .8, -.2)
wood(13.6, .5, 'c'); wood(16.3, .45, 'c')
# 18.05  the muted trumpet laughs after "répondre"
for i, p in enumerate(['G5', 'E5', 'G5']): play('trumpet_mute', 18.05 + i * .125, p, .1, .75, .85, .2)
# 18.5–21.5  two-beat tag (the phone changes hands)
left(18.5, ['F', 'C', 'G7'], .46, True); rag(18.5, [(0, .5, 'A5'), (.5, .5, 'C6'), (1.5, .5, 'A5'), (2, 1, 'G5'), (4, .5, 'F5'), (4.5, .5, 'D5')], .6)
# 21.5–22.4  a snare roll while he breathes in; on "ALLÔ" everything stops with a cymbal and a tuba blast
roll(21.75, 22.4, .1, .7); cymbal(22.4, False, .9); kick(22.4, .95); play('tuba', 22.4, 'C2', .5, .85, 1.2, -.1); play('trombone', 22.4, 'C3', .5, .85, .9, -.2)
play('trombone', 23.35, 'D4', .22, .5, .7, -.2); play('trombone', 23.6, 'C#4', .45, .5, .7, -.2); wood(24.3, .5, 'c')
# 25.5–35.0  the turning point: one soft, slow piano, the theme at half speed, slowing still
def soft(t, p, d, v=.32, pan=.05): play('piano', t, p, d + .6, v, .9, pan)
for t, p, d in [(26.3, 'E5', .5), (26.8, 'G5', .9), (27.9, 'A5', .4), (28.4, 'G5', .4), (28.9, 'E5', 1.0)]: soft(t, p, d)
for t, p in [(26.3, 'C3'), (26.8, 'G3'), (27.9, 'A2'), (28.4, 'E3'), (29.4, 'F2'), (29.9, 'C3')]: soft(t, p, 1.0, .26, -.1)
for t, p, d in [(30.6, 'D5', .6), (31.2, 'F5', 1.0), (32.8, 'E5', .5)]: soft(t, p, d, .3)
for t, p in [(30.6, 'G2'), (31.2, 'D3'), (32.8, 'C3')]: soft(t, p, 1.2, .24, -.1)
for t, p in [(33.6, 'C3'), (33.62, 'G3'), (33.64, 'E4'), (33.66, 'C5')]: soft(t, p, 1.2, .3, 0)
xylo(34.5, 'C6', .45)

out = np.stack([limit(buf[:, c], .95) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, '..', 'out'), exist_ok=True)
sf.write(os.path.join(HERE, '..', 'out', 'score.wav'), out.astype(np.float32), SR)
print('score.wav', DUR, 's peak', float(np.abs(out).max()))
