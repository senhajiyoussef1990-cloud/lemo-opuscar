"""Mouth envelopes for lip-sync: one loudness value per frame (24 fps) for every voice line → lip.json"""
import json, os
import numpy as np, soundfile as sf
HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out = {}
for l in json.load(open(os.path.join(HERE, 'lines.json'))):
    y, sr = sf.read(os.path.join(HERE, 'voice', l['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    hop = sr // 24; e = [float(np.sqrt(np.mean(y[i * hop:(i + 1) * hop] ** 2) + 1e-12)) for i in range(len(y) // hop + 1)]; m = max(e)
    out[l['id']] = {'dur': round(len(y) / sr, 3), 'env': [round(min(1, v / m * 1.6), 2) for v in e]}
json.dump(out, open(os.path.join(HERE, 'lip.json'), 'w'))
