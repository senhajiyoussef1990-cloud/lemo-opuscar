"""Voice post-processing: raw/<id>.wav (edge-tts) → voices/<id>.wav (48 kHz, per character) + voices/dur.json + voices/lips.json
PAPY: light saturation + a 180 Hz bump (gravel); MALIK: a presence boost. Lip sync = RMS (open) and spectral centroid (wide) per 1/24 s.
Technique from the style's demo voice.py, without librosa."""
import json, os, numpy as np, soundfile as sf
from scipy.signal import resample_poly, lfilter, stft
HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'); SR = 48000
L = json.load(open(os.path.join(HERE, 'lines.json'), encoding='utf-8'))
os.makedirs(os.path.join(HERE, 'voices'), exist_ok=True)
def peq(x, f, gain_db, q=1.0):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]; a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return lfilter(np.array(b) / a[0], np.array(a) / a[0], x)
dur, lips = {}, {}
for l in L:
    y, sr = sf.read(os.path.join(HERE, 'raw', l['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = resample_poly(y, SR, sr)
    a = np.abs(y) > .01 * np.abs(y).max(); i0, i1 = np.argmax(a), len(y) - np.argmax(a[::-1])   # trim silence, keep 40 ms
    y = y[max(0, i0 - 1900): i1 + 1900]
    y = y / (np.abs(y).max() + 1e-9) * .9
    if l['who'] == 'PAPY':
        y = peq(y, 160, 1.5, .8)   # natural voice: no saturation, no pitch shift, just a little warmth
    else: y = peq(y, 3200, 2.0, .9)
    y = y / (np.abs(y).max() + 1e-9) * .9
    sf.write(os.path.join(HERE, 'voices', l['id'] + '.wav'), y.astype(np.float32), SR)
    dur[l['id']] = round(len(y) / SR, 3)
    hop = SR // 24
    f, _, Z = stft(y, SR, nperseg=2400, noverlap=2400 - hop, nfft=4096, boundary='even', padded=True)
    S = np.abs(Z); rms = np.sqrt((S ** 2).mean(0)); p = np.percentile(rms, 95) + 1e-9
    cen = (S * f[:, None]).sum(0) / (S.sum(0) + 1e-9)
    lips[l['id']] = {'o': [round(float(np.clip((r / p - .1) / .8, 0, 1)), 2) for r in rms], 'b': [round(float(np.clip((c - 1200) / 2600, 0, 1)), 2) for c in cen]}
json.dump(dur, open(os.path.join(HERE, 'voices/dur.json'), 'w'), indent=0)
json.dump(lips, open(os.path.join(HERE, 'voices/lips.json'), 'w'))
print(len(dur), 'lines,', round(sum(dur.values()), 1), 's of voice')
