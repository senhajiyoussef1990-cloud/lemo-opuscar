"""Mix for "Papi & Léo — L'IA": foley synthesised by material, the voices through a 1930s microphone chain, the score ducked under them,
then an optical-soundtrack pass and a bed of hiss, crackle and projector clatter (the only sound inside a silence). → out/mix.wav"""
import os, sys, json
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import uniform_filter1d
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
import sfx as X
from sfx import SR, t_, env_exp, bp, lp, hp, norm, add

J = json.load(open(os.path.join(HERE, 'events.json'))); E = J['ev']; DUR = J['dur']
N = int(DUR * SR); R = np.random.default_rng(5)
FX = np.zeros((N, 2)); VOX = np.zeros((N, 2)); BED = np.zeros((N, 2))
nz = lambda d: R.standard_normal(int(round(d * SR)))
def sweep(f0, f1, d): n = int(round(d * SR)); return np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR)
def woodblock(f=900, d=.09): tt = t_(d); return norm((np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * f * 2.4 * tt)) * env_exp(d, .018) + hp(nz(d), 3000) * env_exp(d, .002) * .3)
def rubber(d, f0, f1):   # sawtooth creak through a band-pass
    n = int(round(d * SR)); ph = np.cumsum(np.linspace(f0, f1, n)) / SR; saw = 2 * (ph % 1) - 1
    return norm(bp(saw, 300, 2600) * (np.abs(np.sin(2 * np.pi * 26 * t_(d))) ** 2) * np.sin(np.pi * t_(d) / d))
def slap(d=.22):         # a crêpe landing in a hot pan: soft wet slap + a hiss of butter
    return norm(bp(nz(d), 250, 2800) * env_exp(d, .02) + np.sin(2 * np.pi * 120 * t_(d)) * env_exp(d, .03) * .5 + hp(nz(d), 4000) * env_exp(d, .08) * .25)
def clank(d=.3, f=640): tt = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * m * tt) * env_exp(d, tau) for m, a, tau in [(1, 1, .05), (2.76, .5, .035), (5.4, .3, .02)]) + hp(nz(d), 2500) * env_exp(d, .003) * .4)
def boing(f=380, d=.3): tt = t_(d); fr = f * (1 + .8 * np.exp(-tt * 10)) * (1 + .1 * np.sin(2 * np.pi * 20 * tt)); return norm(np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 7))
def door(): d = .35; return norm(X.thump(1, 85)[:int(d * SR)] + np.pad(woodblock(420, .12), (0, int(d * SR) - int(round(.12 * SR)))) * .6)
RECIPES = {
    'door': lambda e: (door(), .55, -.5), 'step': lambda e: (woodblock(700 + R.random() * 120, .06), .22, -.4),
    'skid': lambda e: (rubber(e['d'], 420, 160), .32, -.3),
    'flick': lambda e: (X.whoosh(.28 if not e.get('big') else .4), .32 if not e.get('big') else .42, .2),
    'land': lambda e: (slap(), .5, .1), 'tick': lambda e: (woodblock(1100, .07), .3, .3),
    'tap': lambda e: (norm(hp(nz(.04), 2500) * env_exp(.04, .003) + np.sin(2 * np.pi * 1900 * t_(.04)) * env_exp(.04, .006) * .5), .3, -.35),
    'sag': lambda e: (norm(sweep(520, 260, .28) * np.sin(np.pi * t_(.28) / .28)), .2, -.35),
    'phoneDown': lambda e: (woodblock(520, .1), .4, -.4), 'poke': lambda e: (X.pop(), .3, .15),
    'spin': lambda e: (norm(bp(nz(e['d']), 1800, 5200) * (.6 + .4 * np.sin(2 * np.pi * 22 * t_(e['d']))) * np.sin(np.pi * t_(e['d']) / e['d']) + np.pad(clank(.25, 760), (0, int(round(e['d'] * SR)) - int(round(.25 * SR)))) * .4), .32, .05),
    'grab': lambda e: (norm(lp(nz(.06), 900) * env_exp(.06, .012)), .35, -.1), 'hop': lambda e: (boing(420, .25), .22, -.2),
    'irisThunk': lambda e: (norm(X.thump(1, 90)[:int(.3 * SR)] + np.pad(bp(nz(.2), 400, 2000) * env_exp(.2, .05) * .5, (0, int(.3 * SR) - int(round(.2 * SR))))), .5, 0),
}
for e in E:
    if e['type'] == 'vo': continue
    x, g, pan = RECIPES[e['type']](e); add(FX, np.asarray(x, np.float64), e['t'], g, pan)
# the pan: butter sizzling, quieter under the lines, gone in the two silences
siz = hp(R.standard_normal(N), 2600) * .2; pops = np.zeros(N); idx = R.integers(0, N, int(DUR * 110)); pops[idx] = R.uniform(.3, 1, len(idx)) * R.choice([-1, 1], len(idx))
siz = norm(siz + bp(pops, 2000, 9000) * 3)
lvl = np.interp(np.arange(N) / SR, [0, .3, 1, 4, 8, 14.7, 14.85, 16.0, 16.3, 21.4, 21.6, 25.2, 25.5, 27.6, 28.2, 29.4, 30], [.3, .5, .3, .2, .2, .2, 0, 0, .22, .25, .16, .16, 0, 0, .18, .2, 0])
add(FX, siz * lvl, 0, .3, .1)

# —— the voices: a period microphone (band-limited, a little saturation, a short room), Papi a touch warmer ——
def room_ir(d=.25): tt = t_(d); ir = R.standard_normal(len(tt)) * np.exp(-tt / .05); ir[0] = 1; return ir / np.abs(ir).sum() * 6
IR = room_ir(); vo_mask = np.zeros(N)
for e in E:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(HERE, 'voice', e['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = resample_poly(y, SR, sr)
    y = hp(y, 230 if e['who'] == 'papi' else 280, 3); y = lp(y, 5000, 3)
    y = np.tanh(y / (np.abs(y).max() + 1e-9) * 1.9) / np.tanh(1.9)
    y = y + np.convolve(y, IR)[:len(y)] * .1
    y = X.compress(norm(y), .3, 3.0)
    g = .78 if e['id'] == 'l8' else 1.05        # Léo's last line is almost whispered
    add(VOX, norm(y), e['t'], g, .12 if e['who'] == 'papi' else -.12)
    s = int(e['t'] * SR); vo_mask[max(0, s - 2400): s + len(y) + 4800] = 1

mus, msr = sf.read(os.path.join(HERE, 'out', 'score.wav'))
mus = mus[:N]; mus = np.pad(mus, ((0, N - len(mus)), (0, 0)))
duck = uniform_filter1d(vo_mask, int(.12 * SR)); mus = mus * (1 - .62 * duck)[:, None]

def optical(x):
    y = np.stack([hp(lp(x[:, c], 6200, 2), 110, 2) for c in range(2)], 1)
    tt = np.arange(N) / SR; dl = (.00035 * np.sin(2 * np.pi * .6 * tt) + .00008 * np.sin(2 * np.pi * 7 * tt)) * SR
    idx = np.clip(np.arange(N) - 40 + dl, 0, N - 1); i0 = idx.astype(int); fr = idx - i0; i1 = np.minimum(i0 + 1, N - 1)
    y = y[i0] * (1 - fr)[:, None] + y[i1] * fr[:, None]
    return np.tanh(y * 1.4) / np.tanh(1.4)
bus = optical(mus * .9 + FX * .9)
hiss = bp(R.standard_normal(N), 800, 6000) * .0035
crk = np.zeros(N)
for p in (R.random(int(DUR * 9)) * (N - 200)).astype(int): L_ = R.integers(8, 60); crk[p:p + L_] += R.standard_normal(L_) * np.exp(-np.arange(L_) / 10) * (.02 + R.random() * .05)
crk = hp(crk, 900)
proj = np.zeros(N); per = SR / 24
for k in range(int(DUR * 24)): s = int(k * per); c = hp(R.standard_normal(200), 1500) * np.exp(-np.arange(200) / 30); m = max(0, min(200, N - s)); proj[s:s + m] += c[:m] * .012
proj += np.sin(2 * np.pi * 50 * np.arange(N) / SR) * .002 + lp(R.standard_normal(N), 180) * .006
BED[:, 0] = hiss + crk + proj; BED[:, 1] = hiss * .9 + crk + proj * .95
mix = bus + VOX * .95 + BED
for c in range(2): mix[:, c] = X.limit(mix[:, c], .95)
mix = mix / np.abs(mix).max() * .89
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
m = vo_mask > 0
print('mix.wav', DUR, 's | VO', round(db(VOX[m]), 1), 'dB  music under VO', round(db(bus[m]), 1), 'dB  music alone', round(db(bus[~m]), 1), 'dB')
