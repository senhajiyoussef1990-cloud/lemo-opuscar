// story.js — episode 8 « Les vocaux »: 120 bpm (1 beat = 12 frames at 24 fps), voice times, title cards, cuts, sound events.
export const BPM = 120, BEAT = 60 / BPM, DUR = 35.0;
export const beats = t => t / BEAT;
export const LINES = [
  { id: 'l1', who: 'leo', t: 0.5, d: 2.82 }, { id: 'l2', who: 'papi', t: 3.9, d: 3.35 }, { id: 'l3', who: 'leo', t: 7.8, d: 3.45 },
  { id: 'l4', who: 'papi', t: 12.2, d: .77 }, { id: 'l4b', who: 'papi', t: 14.2, d: 3.8 }, { id: 'l5', who: 'leo', t: 19.3, d: 1.37 },
  { id: 'l6', who: 'papi', t: 22.4, d: .38 }, { id: 'l7', who: 'papi', t: 27.2, d: 1.17 }, { id: 'l7b', who: 'leo', t: 28.9, d: .61 },
  { id: 'l8', who: 'papi', t: 31.6, d: 1.07 },
];
export const SUBS = [
  [0.5, 3.45, 'Papi, mamie t’a laissé un vocal', 'de sept minutes.'],
  [3.9, 7.4, 'Sept minutes ? Elle va bien, alors.'],
  [7.8, 11.4, 'Papi, sérieux ? Écoute-le', 'en vitesse fois deux !'],
  [12.2, 14.15, 'Dans mon temps…'],
  [14.2, 18.4, 'Ça s’appelait une conversation.', 'Et on pouvait répondre.'],
  [19.3, 21.4, 'Ben réponds-lui un vocal !'],
  [22.4, 24.6, 'ALLÔ ?'],
  [27.2, 28.8, 'Je vais lui répondre.'],
  [28.9, 30.45, 'Tu vas où ?'],
  [31.6, 33.9, 'Elle est dans le jardin.'],
];
export const CUTS = [3.5, 7.5, 11.5, 18.5, 21.5, 25.5, 30.5];
export const shotAt = t => { let i = 0; while (i < CUTS.length && t >= CUTS[i]) i++; return i; };
export const T_GIVE = 19.0, T_FLIP = [20.7, 21.2], T_SHOUT = 22.4, T_DOWN = 25.9, T_STAND = [26.3, 26.75], T_IRIS = [33.8, 34.5];
export function buildEvents() {
  const E = LINES.map(l => ({ t: l.t, type: 'vo', id: l.id, who: l.who, d: l.d }));
  for (const t of [.05, .3, .55]) E.push({ t, type: 'step' });
  for (let t = 1.25; t < 11.6; t += 1.0) E.push({ t, type: 'clink' });
  E.push({ t: 11.8, type: 'clinkDown' }, { t: 13.6, type: 'tick' }, { t: 16.3, type: 'tick' }, { t: T_GIVE, type: 'pat' }, { t: T_FLIP[0], type: 'cloth' });
  E.push({ t: 21.8, type: 'inhale', d: .55 }, { t: T_SHOUT, type: 'rattle' }, { t: 23.0, type: 'slap' }, { t: 24.3, type: 'tick' });
  E.push({ t: T_DOWN, type: 'phoneDown' }, { t: T_STAND[0], type: 'chair' }, { t: 27.0, type: 'cloth' });
  for (const t of [29.4, 29.9, 30.4]) E.push({ t, type: 'stepSoft' });
  E.push({ t: 30.5, type: 'birds', d: 4.0 }, { t: T_IRIS[1], type: 'irisThunk' });
  return E.sort((a, b) => a.t - b.t);
}
