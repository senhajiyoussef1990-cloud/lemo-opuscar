// story.js — the single timeline: 120 bpm (1 beat = 12 frames at 24 fps), voice times, subtitle cards, shots, crêpe flips, sound events.
export const BPM = 120, BEAT = 60 / BPM, DUR = 30.0;
export const beats = t => t / BEAT;

// voice lines (durations from voice/dur.json)
export const LINES = [
  { id: 'l1', who: 'leo', t: 1.3, d: 2.08 }, { id: 'l2', who: 'papi', t: 4.3, d: 3.61 }, { id: 'l3', who: 'leo', t: 8.2, d: 2.43 },
  { id: 'l4', who: 'papi', t: 10.9, d: 3.8 }, { id: 'l4b', who: 'papi', t: 15.0, d: 1.0 }, { id: 'l5', who: 'papi', t: 17.0, d: 2.14 },
  { id: 'l6', who: 'leo', t: 19.8, d: 1.7 }, { id: 'l7', who: 'papi', t: 21.9, d: 3.04 }, { id: 'l8', who: 'leo', t: 26.0, d: 1.53 },
  { id: 'l9', who: 'papi', t: 27.9, d: 1.37 },
];
// period title cards: [t0, t1, line 1, line 2]
export const SUBS = [
  [1.3, 3.95, 'Papi, l’IA va prendre', 'ton travail !'],
  [4.3, 8.0, 'Mon travail ? Je suis retraité', 'depuis 18 ans.'],
  [8.2, 10.8, 'Ben alors, elle va prendre', 'celui de papa !'],
  [10.9, 14.85, 'Ton père ? Il fait des réunions', 'pour organiser des réunions.'],
  [15.0, 16.9, 'Elle peut le prendre.'],
  [17.0, 19.45, 'Dis-lui de me faire', 'une crêpe, ton IA.'],
  [19.8, 21.75, 'Elle propose… une recette.'],
  [21.9, 23.7, 'Une recette !'],
  [23.8, 25.6, 'Moi, j’ai les mains.'],
  [26.0, 27.8, 'Papi… apprends-moi.'],
  [27.9, 29.6, 'Enfin une bonne question.'],
];
// shots: cuts land on beats
export const CUTS = [1.0, 4.0, 8.0, 16.5, 19.5, 21.5, 25.5];
export const shotAt = t => { let i = 0; while (i < CUTS.length && t >= CUTS[i]) i++; return i; };
// crêpe flips: launched at t0, back in the pan at t1, h = height of the arc (world units)
export const FLIPS = [
  { t0: -0.5, t1: 0.75, h: 150, turns: 1 }, { t0: 2.5, t1: 3.5, h: 160, turns: 1 }, { t0: 5.0, t1: 6.0, h: 170, turns: 1 },
  { t0: 17.5, t1: 18.5, h: 350, turns: 2 }, { t0: 21.4, t1: 25.0, h: 2400, turns: 5 }, { t0: 29.2, t1: 31.2, h: 520, turns: 2, leo: true },
];
export const T_SET = 21.4, T_SPIN = [28.0, 28.45], T_GRAB = 28.7, T_IRIS = [29.35, 29.95];

export function buildEvents() {
  const E = LINES.map(l => ({ t: l.t, type: 'vo', id: l.id, who: l.who, d: l.d }));
  for (const f of FLIPS) { if (f.t0 >= 0) E.push({ t: f.t0, type: 'flick', big: f.h > 300 }); if (f.t1 < DUR) E.push({ t: f.t1, type: 'land' }); }
  E.push({ t: 1.0, type: 'door' });
  for (let t = 1.05; t < 1.85; t += .125) E.push({ t, type: 'step' });
  E.push({ t: 1.85, type: 'skid', d: .35 });
  E.push({ t: 4.45, type: 'tick' }, { t: 7.5, type: 'tick' }, { t: 7.75, type: 'tick' });
  E.push({ t: 13.0, type: 'tick' }, { t: 14.3, type: 'tick' });
  for (const t of [19.6, 19.85, 20.1]) E.push({ t, type: 'tap' });
  E.push({ t: 21.1, type: 'sag' });
  E.push({ t: 25.95, type: 'phoneDown' });
  E.push({ t: 28.0, type: 'poke' }, { t: 28.05, type: 'spin', d: .4 }, { t: T_GRAB, type: 'grab' });
  E.push({ t: 28.3, type: 'hop' });
  E.push({ t: T_IRIS[1], type: 'irisThunk' });
  return E.sort((a, b) => a.t - b.t);
}
