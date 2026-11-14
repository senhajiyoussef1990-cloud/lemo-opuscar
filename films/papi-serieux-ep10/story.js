// story.js — episode 10 « La livraison »: 120 bpm (1 beat = 12 frames at 24 fps), voice times, title cards, cuts, sound events.
export const BPM = 120, BEAT = 60 / BPM, DUR = 36.0;
export const beats = t => t / BEAT;
export const LINES = [
  { id: 'l1', who: 'leo', t: 0.4, d: 3.85 }, { id: 'l2', who: 'papi', t: 4.9, d: 3.36 }, { id: 'l3', who: 'leo', t: 8.7, d: 4.89 },
  { id: 'l4', who: 'papi', t: 14.9, d: .77 }, { id: 'l4b', who: 'papi', t: 16.9, d: 3.89 }, { id: 'l5', who: 'leo', t: 22.4, d: 1.93 },
  { id: 'l6', who: 'papi', t: 26.6, d: 1.03 }, { id: 'l7', who: 'leo', t: 29.6, d: 1.51 }, { id: 'l8', who: 'papi', t: 33.3, d: 1.02 },
];
export const SUBS = [
  [0.4, 2.35, 'Papi, j’ai commandé une pizza.'],
  [2.4, 4.45, 'Elle arrive dans dix minutes !'],
  [4.9, 8.4, 'Dix minutes ? Elle vient d’où,', 'du couloir ?'],
  [8.7, 11.4, 'Papi, sérieux ? Y a un livreur.'],
  [11.45, 13.95, 'Je le vois sur la carte !'],
  [14.9, 16.85, 'Dans mon temps…'],
  [16.9, 20.95, 'Le livreur, c’était moi.', 'Et je revenais avec le pain.'],
  [22.4, 24.45, '… Quarante-cinq minutes', 'de retard.'],
  [26.6, 27.95, 'Sors la farine.'],
  [29.6, 32.2, 'Elle sera meilleure que l’autre ?'],
  [33.3, 35.2, 'Elle sera à l’heure.'],
];
export const CUTS = [4.5, 8.5, 14.0, 21.0, 24.5, 28.0, 32.5];
export const shotAt = t => { let i = 0; while (i < CUTS.length && t >= CUTS[i]) i++; return i; };
export const T_LOWER = [14.0, 14.7], T_STOP = 21.8, T_GLASS = 22.2, T_GRAB = 25.3, T_SLAM = 26.3, T_IRIS = [35.1, 35.75];
export function buildEvents() {
  const E = LINES.map(l => ({ t: l.t, type: 'vo', id: l.id, who: l.who, d: l.d }));
  for (const t of [.05, .3, .55]) E.push({ t, type: 'step' });
  E.push({ t: 9.0, type: 'putt', d: 4.6, v: .5 }, { t: T_LOWER[0], type: 'rustle', d: .7 }, { t: 16.2, type: 'tick' }, { t: 18.9, type: 'tick' }, { t: 20.8, type: 'rustle', d: .25 });
  E.push({ t: 21.0, type: 'putt', d: .8, v: 1 }, { t: T_STOP, type: 'skid', d: .3 }, { t: T_GLASS, type: 'pop' });
  E.push({ t: 24.7, type: 'stretch', d: .6 }, { t: T_GRAB, type: 'clink' }, { t: 25.5, type: 'stretch', d: .6 }, { t: T_SLAM, type: 'slam' });
  for (const t of [28.3, 29.2, 30.1, 31.0, 31.9]) E.push({ t, type: 'roll', d: .7 });
  for (const t of [28.8, 30.6]) E.push({ t, type: 'pat' });
  E.push({ t: 32.6, type: 'ding' }, { t: T_IRIS[1], type: 'irisThunk' });
  return E.sort((a, b) => a.t - b.t);
}
