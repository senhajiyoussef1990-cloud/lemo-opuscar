"""Original score for "Papi, sérieux ? — Les émojis": the series theme as a piano rag, then one soft slow piano, 1930s hot dance band, 120 BPM (1 beat = 12 frames), 35.5 s.
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

BEAT = .5; DUR = 36.2; N = int(DUR * SR)
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
# 0.0–5.0  light ragtime, piano lead (Léo arrives with the thumb on his screen)
left(0.0, ['C', 'C', 'G7', 'C', 'C'], .58, True); brush(0.0, 10, .45)
rag(0.0, A1, .7); rag(2.0, A2, .68); rag(4.0, [(0, .5, 'E5'), (.5, .5, 'G5'), (1, .5, 'C6')], .66)
# 5.0–8.5  left hand only under the newspaper; a slide-whistle "pop" when the glove answers
left(5.0, ['C', 'A7', 'Dm'], .36); slide(7.15, .14, 600, 1300, .16, .8); play('upright', 8.0, 'G2', .4, .36, .9, -.2)
# 8.5–12.5  the rag again, busier, a clarinet answering (a heart, or a smiley!)
left(8.5, ['C', 'C', 'D7', 'G7'], .58, True); brush(8.5, 8, .5)
rag(8.5, B1, .74); rag(10.5, B2, .72); rag(11.5, [(0, .5, 'D5'), (.5, .5, 'B4'), (1, .5, 'G4')], .7)
mel('clarinet', 9.5, [(0, .5, 'G5'), (.5, .5, 'E5'), (4, .5, 'A5'), (4.5, .5, 'F#5')], .55, -.3, .6)
# 12.5–14.2  left hand while the paper comes down, then nothing; a woodblock glance in the silence
left(12.5, ['C', 'G7'], .4); play('upright', 14.0, 'C3', .15, .4, .8, -.2)
wood(14.6, .5, 'c')
# 18.3  the muted trumpet laughs after "en face"
for i, p in enumerate(['G5', 'E5', 'G5', 'E5']): play('trumpet_mute', 18.3 + i * .125, p, .1, .75, .85, .2)
# 19.0–22.5  two-beat tag (the phone changes hands)
left(19.0, ['F', 'C', 'G7'], .46, True); rag(19.0, [(0, .5, 'A5'), (.5, .5, 'C6'), (1.5, .5, 'A5'), (2, 1, 'G5'), (4, .5, 'F5'), (4.5, .5, 'D5')], .6)
play('upright', 22.0, 'G2', .4, .45, .9, -.2)
# 22.5–24.5  one note per slow tap; then the avalanche: a tumbling xylophone run
for t, p in [(22.9, 'C5'), (23.5, 'E5'), (24.1, 'C5')]: play('upright', t, p, .25, .5, .7, .15)
for i in range(14): xylo(24.6 + i * .05, ['C6', 'E6', 'G6', 'A6', 'G6', 'E6', 'D6', 'F6', 'A6', 'C7', 'A6', 'F6', 'E6', 'G6'][i], .4)
play('trombone', 25.35, 'D4', .2, .5, .7, -.2); play('trombone', 25.57, 'C#4', .1, .5, .7, -.2)
# 27.5–35.5  the turning point: one soft, slow piano, the theme at half speed, slowing still
def soft(t, p, d, v=.32, pan=.05): play('piano', t, p, d + .6, v, .9, pan)
for t, p, d in [(27.9, 'E5', .5), (28.4, 'G5', .9), (29.4, 'A5', .4), (29.9, 'G5', .4), (30.4, 'E5', 1.0)]: soft(t, p, d)
for t, p in [(27.9, 'C3'), (28.4, 'G3'), (29.4, 'A2'), (29.9, 'E3'), (30.9, 'F2'), (31.4, 'C3')]: soft(t, p, 1.0, .26, -.1)
for t, p, d in [(31.9, 'D5', .6), (32.5, 'F5', 1.0), (33.6, 'E5', .5)]: soft(t, p, d, .3)
for t, p in [(31.9, 'G2'), (32.5, 'D3'), (33.6, 'C3')]: soft(t, p, 1.2, .24, -.1)
for t, p in [(34.4, 'C3'), (34.42, 'G3'), (34.44, 'E4'), (34.46, 'C5')]: soft(t, p, 1.2, .3, 0)
xylo(35.3, 'C6', .45)

out = np.stack([limit(buf[:, c], .95) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, '..', 'out'), exist_ok=True)
sf.write(os.path.join(HERE, '..', 'out', 'score.wav'), out.astype(np.float32), SR)
print('score.wav', DUR, 's peak', float(np.abs(out).max()))
