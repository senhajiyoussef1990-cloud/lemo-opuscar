"""Mix: foley (from events.json) + voices + score (ducked ~7 dB under the voices) + one ambience bed per world → out/mix.wav
Run after: core/render/events.mjs, tools/voice.py, tools/score.py. Loudness (−14 LUFS) is set by core/render/mux.sh."""
import os, sys, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); sys.path.insert(0, HERE)
from foley import *   # noqa
from scipy.signal import fftconvolve
E = json.load(open(os.path.join(ROOT, 'events.json'))); DUR = E['dur']; N = int((DUR + .5) * SR)
LINES = {l['id']: l for l in json.load(open(os.path.join(ROOT, 'lines.json'), encoding='utf-8'))}
sfxb, vob, amb = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros((N, 2)); vobP = np.zeros((N, 2))   # Papy on his own track (NO_PAPY=1 leaves him out)
def zip_(): d = .5; tt = t_(d); return norm(bp(nz(d), 2000, 7000) * (.5 + .5 * (np.sin(2 * np.pi * 60 * tt) > 0)) * np.sin(np.pi * tt / d))
def toy(): d = .25; tt = t_(d); return norm(np.sin(2 * np.pi * (1300 + 500 * np.sin(np.pi * tt / d)) * tt) * np.sin(np.pi * tt / d))
def pagef(): d = .35; tt = t_(d); return norm(hp(nz(d), 2000) * (.4 + .6 * (rng.random(len(tt)) > .5)) * np.sin(np.pi * tt / d))
def bulbpop(): d = .25; tt = t_(d); return norm(np.concatenate([bp(nz(.02), 1500, 9000) * 3, (np.sin(2 * np.pi * 900 * tt) * env_exp(d, .03) + bp(nz(d), 3000, 9000) * env_exp(d, .05) * .6)]))
def screw(): d = .2; tt = t_(d); return norm(bp(nz(d), 2500, 8000) * (.4 + .6 * (np.sin(2 * np.pi * 40 * tt) > .3)) * np.sin(np.pi * tt / d))
def sclick(): d = .05; return norm(np.concatenate([click(1.2), np.zeros(int(.03 * SR)), click(.8)]))
def lhum(d=2.5): tt = t_(d); return fade(norm(np.sin(2 * np.pi * 100 * tt) + .3 * np.sin(2 * np.pi * 200 * tt)) * np.minimum(1, tt / .2), .02, .6)
FXT = {'portalOpen': (portal_open, .6), 'portalClose': (portal_close, .45), 'suck': (suck, .4), 'pop': (lambda: pop(1), .35), 'boing': (boing, .35),
       'thud': (thud, .5), 'slam': (slam, .6), 'whoosh': (portal_whoosh, .45), 'page': (pagef, .3), 'cloth': (cloth, .2), 'zip': (zip_, .3), 'toy': (toy, .2), 'bulbPop': (bulbpop, .5), 'screw': (screw, .25), 'click': (sclick, .4), 'hum': (lhum, .04)}
for e in E['ev']:
    ty, t, v = e['type'], e['t'], e.get('v', 1.0)
    if ty in FXT: f, gdb = FXT[ty]; add(sfxb, f() * v, t, gdb, float(rng.uniform(-.2, .2)))
    elif ty == 'portalHum': add(sfxb, portal_hum(e['d']) * v, t, .12)

# —— ambience beds ——
def bed(d, lpf=500, g=.03): return lp(brown_(d), lpf) * g
def chirps(d, n, f0=2800):
    x = np.zeros(len(t_(d)))
    for k in range(n):
        s = int(rng.random() * max(1, d - .3) * SR)
        for r in range(rng.integers(1, 4)):
            dd = .09; f = np.linspace(f0 + rng.random() * 900, f0 + 1000 + rng.random() * 900, int(dd * SR)); c = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.arange(len(f)) / len(f)) ** 2 * .04
            i = s + int(r * .12 * SR); x[i:i + len(c)] += c[:max(0, len(x) - i)]
    return x
def ticks(d):
    x = np.zeros(len(t_(d)))
    for k in range(int(d)): s = int(k * SR); tk = hp(nz(.025), 2500) * env_exp(.025, .003) * (.06 if k % 2 else .045); x[s:s + len(tk)] += tk[:len(x) - s]
    return x
def hum(d): tt = t_(d); return (np.sin(2 * np.pi * 100 * tt) + .4 * np.sin(2 * np.pi * 200 * tt)) * .006
def rain(d): return hp(bp(nz(d), 2500, 9000), 2000) * .05
def crackle(d): x = np.zeros(len(t_(d))); idx = rng.integers(0, len(x) - 200, int(d * 25)); [x.__setitem__(slice(i, i + 120), x[i:i + 120] + hp(nz(.0025), 3000) * .3) for i in idx]; return x + lp(brown_(d), 300) * .03
def murmur(d, g=.025):
    tt = t_(d); x = np.zeros_like(tt)
    for k in range(5): am = uniform_filter1d((rng.random(len(tt)) > .9995).astype(float), int(.25 * SR)) * 60; x += bp(nz(d), 300 + k * 110, 900 + k * 160) * np.clip(am, 0, 1)
    return norm(x) * g
for e in E['ev']:
    if e['type'] != 'amb': continue
    t, d, w = e['t'], e['d'], e['w']
    x = {'home': lambda: hum(d) + ticks(d) + bed(d, 300, .015), 'home2': lambda: hum(d) + ticks(d) + bed(d, 300, .015),
         'w1': lambda: bed(d, 700, .035) + chirps(d, int(d * .6)), 'w2': lambda: crackle(d) * .6, 'w3': lambda: bed(d, 900, .06),
         'w4': lambda: bed(d, 500, .02) + chirps(d, int(d * .4), 3400), 'w5': lambda: rain(d) + bed(d, 400, .02), 'w6': lambda: murmur(d, .02) + chirps(d, int(d * .3)),
         'w7': lambda: murmur(d, .022) + hum(d)}[w]()
    add(amb, fade(x, .03, .05), t, 1.0)

# —— voices: compressed, matched by RMS, a short room ——
for e in E['ev']:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(ROOT, 'voices', e['id'] + '.wav'))
    y = compress(y / np.abs(y).max(), .28, 3.2); y = y / (np.sqrt((y ** 2).mean()) + 1e-9) * .12
    who = LINES[e['id']]['who']; add(vobP if who == 'PAPY' else vob, y, e['t'], 1.0 if who == 'PAPY' else .92, .1 if who == 'PAPY' else -.1)
er = np.zeros(int(.09 * SR)); er[0] = 1
for dly, gdb in [(.011, .25), (.019, .18), (.031, .12), (.047, .08), (.067, .05)]: er[int(dly * SR)] += gdb
vob = np.stack([fftconvolve(vob[:, c], er)[:N] for c in range(2)], 1); vobP = np.stack([fftconvolve(vobP[:, c], er)[:N] for c in range(2)], 1)

mus, _ = sf.read(os.path.join(ROOT, 'out', 'score.wav')); mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
act = (np.abs(vob + vobP).max(1) > .01).astype(float)   # the music still dips where Papy speaks, so a voice can be recorded over it
duck = 1 - .55 * np.clip(uniform_filter1d(maximum_filter1d(act, int(.3 * SR)), int(.15 * SR)), 0, 1)
mix = mus * .6 * duck[:, None] + sfxb * .8 + vob + (0 if os.environ.get('NO_PAPY') else vobP) + amb * .9
# a gentle top cut, then a look-ahead peak limiter on a 4× oversampled copy (true peaks), so mux.sh can normalise in linear mode
from scipy.signal import resample_poly
mix = np.stack([lp(mix[:, c], 15000) for c in range(2)], 1)
up = np.abs(np.stack([resample_poly(mix[:, c], 4, 1) for c in range(2)], 1)).max(1).reshape(-1, 4).max(1)[:N]
need = np.minimum(1, .45 / (up + 1e-9)); w = int(.005 * SR)
gain = -maximum_filter1d(-need, 2 * w + 1); gain = uniform_filter1d(gain, w)
mix = mix * gain[:, None] / .5 * .5
sf.write(os.path.join(ROOT, 'out', os.environ.get('MIX_OUT', 'mix.wav')), mix.astype(np.float32), SR)
def db(x): return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('mix peak %.2f | voice %.1f  music %.1f  sfx %.1f  amb %.1f dB' % (np.abs(mix).max(), db(vob), db(mus * .6 * duck[:, None]), db(sfxb * .8), db(amb)))
