"""The film's one timeline, from the voice durations: when each line is spoken and printed, and where the scenes change. -> timeline.json"""
import json, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
L = json.load(open(os.path.join(D, 'lines.json'), encoding='utf-8')); dur = json.load(open(os.path.join(D, 'voice', 'dur.json')))
t = .7; out = []; marks = {}
for i, l in enumerate(L):
    n = i + 1
    if n == 9: marks['dive'] = t - .1; t += 1.9; marks['walk'] = t - .9          # the camera dives into the open book; the page becomes the path
    if n == 33: marks['back'] = t - .1; t += 1.7; marks['room2'] = t - .8      # the path turns back into the page; the room again
    d = dur[l['id']]
    out.append({**{k: l[k] for k in ('id', 'who', 'text')}, 't0': round(t, 3), 't1': round(t + d, 3)})
    gap = .35 if L[min(i + 1, len(L) - 1)]['who'] != l['who'] else .5
    if n == 1: gap = .9
    if n == 34: gap = .7
    t += d + gap
END = round(t + 1.6, 2)
for i, o in enumerate(out):   # printed from the first word until the next line starts (at least the line + 0.6 s, and 1.8 s)
    nxt = out[i + 1]['t0'] if i + 1 < len(out) else END - .2
    o['s0'] = o['t0']; o['s1'] = round(max(nxt - .05, o['t1'] + .6, o['t0'] + 1.8), 3)
marks['close'] = out[33]['t0'] + .3; marks['end'] = END
json.dump({'lines': out, 'marks': {k: round(v, 3) for k, v in marks.items()}, 'dur': END}, open(os.path.join(D, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
print('film', END, 's', {k: round(v, 1) for k, v in marks.items()})
