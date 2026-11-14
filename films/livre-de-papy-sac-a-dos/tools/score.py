"""Score, foley and voices for « L'histoire du sac à dos » → out/mix.wav (48 kHz stereo).
Instruments (core/audio/sampler.py, CC0 libraries): celesta, glockenspiel, recorder, harp (VCSL); clarinet, bassoon (VSCO 2 CE).
One theme (8 bars, C major, 96 bpm): celesta in the room, recorder and clarinet for the walk, heard in full on celesta and recorder together only at the end.
Foley: steps on the path, birds, rain on the campus, the book's pages and covers. A breath of silence when the book closes."""
import os, sys, json
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
HERE = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(HERE, '..')
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(D, '../..')); sys.path.insert(0, LIB)
from core.audio import sampler as S                       # noqa: E402
from core.audio.sfx import SR, add, bp, lp, hp, limit, compress, norm   # noqa: E402

TL = json.load(open(os.path.join(D, 'timeline.json'), encoding='utf-8')); LN = TL['lines']; MK = TL['marks']; DUR = TL['dur']
N = int((DUR + .5) * SR); R = np.random.default_rng(3)
MUS = np.zeros((N, 2)); FX = np.zeros((N, 2)); VOX = np.zeros((N, 2))
L0 = lambda n: LN[n - 1]['t0']; L1 = lambda n: LN[n - 1]['t1']
Q = 60 / 96   # a beat
def play(buf, inst, t, p, d, v=.6, g=1., pan=0.):
    if t < 0 or t > DUR: return
    add(buf, S.note(inst, p, d, v), t, g, pan)

THEME = [('E4', 1), ('G4', 1), ('A4', 1), ('G4', 1), ('E4', 1), ('D4', 1), ('C4', 2), ('D4', 1), ('E4', 1), ('G4', 1), ('E4', 1), ('D4', 4),
         ('E4', 1), ('G4', 1), ('A4', 1), ('C5', 1), ('B4', 1), ('A4', 1), ('G4', 2), ('A4', 1), ('G4', 1), ('E4', 1), ('D4', 1), ('C4', 4)]
CHORDS = [['C3', 'E3', 'G3'], ['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3'], ['C3', 'E3', 'G3'], ['E2', 'G2', 'B2'], ['F2', 'A2', 'C3'], ['C3', 'E3', 'G3']]
up = lambda p, k=12: S.name(S.midi(p) + k)
def theme(t0, inst, v=.5, g=1., pan=0., oct=0, half=False, until=1e9):
    t = t0
    for i, (p, b) in enumerate(THEME[:12] if half else THEME):
        if t >= until: break
        play(MUS, inst, t, up(p, oct) if oct else p, b * Q * .95, v, g, pan); t += b * Q
    return t
def harp(t0, bars, v=.32, until=1e9):
    for b in range(bars):
        ch = CHORDS[b % 8]
        for k in range(8):
            t = t0 + b * 4 * Q + k * Q / 2
            if t >= until: return
            p = [ch[0], ch[1], ch[2], up(ch[0]), up(ch[1]), up(ch[0]), ch[2], ch[1]][k]
            play(MUS, 'harp', t, up(p), Q * 1.4, v * (1.15 if k == 0 else 1), .9, -.25)
def bass(t0, bars, v=.36, until=1e9):
    for b in range(bars):
        for h in (0, 2):
            t = t0 + b * 4 * Q + h * Q
            if t < until: play(MUS, 'bassoon', t, CHORDS[b % 8][0], Q * 1.8, v, .8, -.1)

# the room: celesta theme over a harp, from the first line to the book
harp(.3, 11, .26, until=MK['dive'])
theme(.3 + 4 * Q * 2, 'celesta', .45, .9, .15, oct=12, until=MK['dive'])
# the dive into the page: a glockenspiel run up
for i, p in enumerate(['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7']): play(MUS, 'glockenspiel', MK['dive'] + .1 + i * .12, p, .5, .45 - i * .02, .7, .2)
# the walk: harp and bassoon all along; the theme on the recorder, then the clarinet, then both; a lighter bar where the rain falls
tw = MK['walk']; phrase = 8 * 4 * Q; n = int((MK['back'] - tw) / phrase) + 1
for k in range(n):
    t = tw + k * phrase
    harp(t, 8, .24, until=MK['back']); bass(t, 8, .3, until=MK['back'])
    inst = ['recorder', 'clarinet', 'recorder', 'clarinet', 'recorder', 'clarinet'][k % 6]
    theme(t, inst, .42, .75, .1 if inst == 'recorder' else -.1, oct=12 if inst == 'recorder' else 0, until=MK['back'])
# back into the page: the run comes down
for i, p in enumerate(['G6', 'E6', 'C6', 'G5', 'E5', 'C5']): play(MUS, 'glockenspiel', MK['back'] + .1 + i * .12, p, .5, .45 - i * .02, .7, .2)
# the room again: harp under Papy; a breath of silence as the book closes; then the theme in full, celesta and recorder together
t2 = MK['room2'] + .3
harp(t2, 3, .24, until=MK['close'] - .1)
tE = MK['close'] + 1.2
theme(tE, 'celesta', .45, .9, .15, oct=12); theme(tE, 'recorder', .35, .55, -.1, oct=12); harp(tE, 8, .24); bass(tE, 8, .28)
play(MUS, 'glockenspiel', min(DUR - 1.2, tE + 32 * Q), 'C6', 1.2, .45, .6, .2)

# ───────── foley
nz = lambda d: R.standard_normal(int(round(d * SR)))
t_ = lambda d: np.arange(int(round(d * SR))) / SR
env = lambda d, tau: np.exp(-t_(d) / tau)
def step(): d = .09; return norm(lp(nz(d), 900) * env(d, .018) + bp(nz(d), 1500, 4000) * env(d, .006) * .3)
def page(d=.45): return norm(bp(nz(d), 1500, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5 * (.6 + .4 * np.abs(np.sin(2 * np.pi * 7 * t_(d)))))
def thump(): d = .3; return norm(np.sin(2 * np.pi * 90 * t_(d) * (1 - .3 * t_(d))) * env(d, .06) + lp(nz(d), 500) * env(d, .02) * .6)
def chirp():
    d = .1; f = np.linspace(2800 + R.random() * 900, 3800 + R.random() * 900, int(d * SR))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.arange(len(f)) / len(f)) ** 2
# steps: Malik's quick ones and Papy's slower ones (the same rates as the picture)
for rate, g, pan in ((4, .08, -.1), (3.2, .1, .1)):
    t = tw + .3
    while t < MK['back']: add(FX, step(), t, g, pan); t += 1 / rate * 2
# birds over the walk, quieter during the rain
for i in range(int((MK['back'] - tw) * .7)):
    t = tw + R.random() * (MK['back'] - tw)
    if L0(25) - 1 < t < L1(26) + .6: continue
    for r in range(R.integers(1, 4)): add(FX, chirp(), t + r * .12, .05 * (.4 + R.random() * .6), R.uniform(-.6, .6))
# rain on the campus
ra, rb = L0(25) - 1, L1(26) + .6; d = rb - ra; rn = hp(bp(nz(d), 2500, 9000), 2000) * np.minimum(1, t_(d) / .8) * np.minimum(1, (d - t_(d)) / .8)
add(FX, norm(rn), ra, .08)
for i in range(int(d * 14)): add(FX, norm(np.sin(2 * np.pi * (1800 + R.random() * 1600) * t_(.03)) * env(.03, .006)), ra + R.random() * d, .03, R.uniform(-.7, .7))
# the book: the cover opens (pages), the camera dives in (a page turning), comes back out, the cover closes (a soft thump)
add(FX, page(.5), L0(8) + .4, .3, .1); add(FX, page(.7), MK['dive'], .26, 0); add(FX, page(.7), MK['back'], .26, 0)
add(FX, page(.4), MK['close'], .22, .1); add(FX, thump(), MK['close'] + .8, .5, .1)
# the room: a quiet tone of the room
rm = lp(R.standard_normal(N), 300); rm = rm / np.abs(rm).max() * .006
for c in range(2): FX[:, c] += rm * ((np.arange(N) / SR < MK['dive'] + 1) | (np.arange(N) / SR > MK['room2'] - .3))

# ───────── voices: clean, a little compression and a short room
mask = np.zeros(N)
ir = R.standard_normal(int(.18 * SR)) * np.exp(-np.arange(int(.18 * SR)) / SR / .04); ir[0] = 1; ir = ir / np.abs(ir).sum() * 4
for l in LN:
    y, sr = sf.read(os.path.join(D, 'voice', l['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = resample_poly(y, SR, sr); y = hp(y, 90, 2)
    y = y + np.convolve(y, ir)[:len(y)] * .06
    y = compress(norm(y), .3, 3.0)
    add(VOX, norm(y), l['t0'], .95, .08 if l['who'] == 'papy' else -.08)
    s = int(l['t0'] * SR); mask[max(0, s - 2400): s + len(y) + 4800] = 1
duck = uniform_filter1d(mask, int(.15 * SR)); MUS *= (1 - .6 * duck)[:, None]
# a breath of silence as the book closes: nothing but the thump
sil = (np.arange(N) / SR > MK['close'] + .2) & (np.arange(N) / SR < MK['close'] + 1.2); MUS[sil] *= .0
# nothing harsh at the very start (a lone bright instrument): a low-pass on the first two seconds of music
k = int(2 * SR); MUS[:k] = np.stack([lp(MUS[:k, c], 3500) for c in (0, 1)], 1)

def out(path, mix):
    for c in range(2): mix[:, c] = limit(mix[:, c], .95)
    mix = mix / (np.abs(mix).max() + 1e-9) * .89; sf.write(path, mix.astype(np.float32), SR)
os.makedirs(os.path.join(D, 'out'), exist_ok=True)
out(os.path.join(D, 'out', 'mix.wav'), MUS * 1.0 + FX + VOX * 1.0)
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
m = mask > 0; print('mix.wav', round(DUR, 1), 's | voice', round(db(VOX[m]), 1), 'dB, music under voice', round(db(MUS[m]), 1), 'dB, music alone', round(db(MUS[~m]), 1), 'dB')
