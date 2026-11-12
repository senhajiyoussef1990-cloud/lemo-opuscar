"""Original score for "Papi & Léo — Le Wi-Fi": the series theme as an alarm, then as an easy card-game two-beat, 1930s hot dance band, 120 BPM (1 beat = 12 frames), 37 s.
Samples through core/audio/sampler.py (VSCO 2 CE trumpet / muted trumpet / trombone / clarinet / tuba / upright piano / percussion,
VCSL woodblock, no piano solo in this episode) + a numpy slide whistle. Output: out/score.wav (48 kHz stereo).
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

BEAT = .5; DUR = 37.6; N = int(DUR * SR)
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
# 0.0–1.0  iris on the crossed-out sign: a snare roll
roll(0.0, .95, .15, .75)
# 1.0–4.0  the series theme as an alarm: open trumpet, the whole band (Léo bursts in)
cymbal(1.0); kick(1.0); comp(1.0, ['C', 'C', 'G7'], .66); brush(1.0, 6, .6)
mel('trumpet', 1.0, A1, .8, .15); mel('trumpet', 3.0, A2[:3], .78, .15)
mel('clarinet', 1.0, [(0, .5, 'G5'), (1, .5, 'G5'), (2, .5, 'C6'), (3, .5, 'G5'), (4, .5, 'B5')], .55, -.3, .7)
# 4.0–7.5  the tuba alone under the newspaper; after "les pompiers" the slide whistle plays the siren
for i, p in enumerate(['C3', 'G2', 'C3']): play('tuba_stac', 4.0 + i * BEAT, p, BEAT * .55, .45, 1.1, -.1)
for k in range(2): slide(5.75 + k * .6, .3, 700, 1100, .16, 1.0); slide(6.05 + k * .6, .3, 1100, 700, .16, 1.0)
play('tuba_stac', 7.0, 'G2', .3, .45, 1.1, -.1)
# 7.5–12.0  the theme again, agitated: clarinet lead, brushes (what do I do without Internet?)
comp(7.5, ['C', 'A7', 'Dm', 'G7'], .58); brush(7.5, 9, .55)
mel('clarinet', 7.5, B1, .74, -.25); mel('clarinet', 9.5, [(0, .5, 'F5'), (.5, .5, 'A5'), (1.5, .5, 'G5'), (2, .5, 'F5'), (2.5, .5, 'E5'), (3, .5, 'D5')], .72, -.25)
play('trombone', 11.5, 'G3', .4, .6, .8, -.2)
# 12.0–13.8  tuba alone while the paper comes down; then nothing: woodblock glances in the silences
for i, p in enumerate(['C3', 'G2', 'C3', 'G2']): play('tuba_stac', 12.0 + i * BEAT, p, BEAT * .55, .45, 1.1, -.1)
wood(14.4, .55, 'c'); wood(16.1, .5, 'c')
# 18.4  the muted trumpet laughs at the punchline
for i, p in enumerate(['G5', 'E5', 'G5', 'E5']): play('trumpet_mute', 18.4 + i * .125, p, .1, .8, .9, .2)
cymbal(18.4)
# 19.5–26.0  the card game: an easy two-beat, the theme strolling on muted trumpet
comp(19.5, ['C', 'C', 'F', 'C', 'G7', 'C'], .42); brush(19.5, 13, .4)
mel('trumpet_mute', 20.5, A1, .55, .2, .7); mel('trumpet_mute', 22.5, A2, .55, .2, .7)
wood(25.5, .5, 'c')
# 26.0–28.5  stop for "Atout cœur"; the xylophone turns the card
play('tuba_stac', 26.0, 'G2', .3, .45, 1.1, -.1); xylo(27.6, 'E6'); xylo(27.75, 'C6', .45)
# 29.0  the phone rings back to life (xylophone), silence, then a clarinet alone
xylo(29.0, 'G6', .6); xylo(29.12, 'C7', .5); xylo(29.24, 'E7', .45)
for off, d, p in [(0, 1.0, 'E4'), (1.0, .8, 'G4'), (1.8, .5, 'A4'), (2.3, 1.2, 'G4')]: play('clarinet', 30.3 + off, p, d, .4, .7, -.25)
# 33.0–37  the theme, gently, everyone; last chord on the iris
comp(33.0, ['C', 'C', 'G7', 'C'], .46); brush(33.0, 7, .42)
mel('clarinet', 33.0, A1, .56, -.25, .8); mel('trumpet_mute', 35.0, A2[:4], .56, .2, .75)
for p in ['C2', 'G3', 'E4', 'C5']: play('upright', 36.3, p, .5, .6, .8)
play('tuba_stac', 36.3, 'C3', .3, .6, 1.2, -.1); xylo(36.35, 'C6', .5)

out = np.stack([limit(buf[:, c], .95) for c in (0, 1)], 1)
os.makedirs(os.path.join(HERE, '..', 'out'), exist_ok=True)
sf.write(os.path.join(HERE, '..', 'out', 'score.wav'), out.astype(np.float32), SR)
print('score.wav', DUR, 's peak', float(np.abs(out).max()))
