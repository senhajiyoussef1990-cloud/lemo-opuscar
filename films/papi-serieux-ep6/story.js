// story.js — episode 6 « Les émojis »: 120 bpm (1 beat = 12 frames at 24 fps), voice times, title cards, cuts, sound events.
export const BPM = 120, BEAT = 60 / BPM, DUR = 35.5;
export const beats = t => t / BEAT;
export const LINES = [
  { id: 'l1', who: 'leo', t: 0.4, d: 4.32 }, { id: 'l2', who: 'papi', t: 5.5, d: 2.48 }, { id: 'l3', who: 'leo', t: 8.6, d: 3.83 },
  { id: 'l4', who: 'papi', t: 13.4, d: .77 }, { id: 'l4b', who: 'papi', t: 15.5, d: 2.65 }, { id: 'l5', who: 'leo', t: 19.9, d: 1.53 },
  { id: 'l6', who: 'papi', t: 25.7, d: 1.18 }, { id: 'l7', who: 'leo', t: 28.2, d: 2.97 }, { id: 'l8', who: 'papi', t: 32.0, d: 2.4 },
];
export const SUBS = [
  [0.4, 2.75, 'Papi, t’as répondu à maman', 'avec un pouce.'],
  [2.8, 4.95, 'Elle croit que t’es fâché.'],
  [5.5, 8.4, 'J’ai dit oui. Avec le doigt.'],
  [8.6, 12.45, 'Papi, sérieux ? Faut mettre', 'un cœur, ou un smiley !'],
  [13.4, 15.45, 'Dans mon temps…'],
  [15.5, 18.6, 'Quand on était fâché,', 'on le disait en face.'],
  [19.9, 22.3, 'Vas-y. Envoie-lui un cœur.'],
  [25.7, 27.45, '… J’ai appuyé partout.'],
  [28.2, 31.45, 'Elle a répondu :', '« Je t’aime aussi, papa. »'],
  [32.0, 34.5, 'Tu vois. Elle a compris.'],
];
export const CUTS = [5.0, 8.5, 12.5, 19.0, 22.5, 27.5, 31.5];
export const shotAt = t => { let i = 0; while (i < CUTS.length && t >= CUTS[i]) i++; return i; };
export const T_LOWER = [12.5, 13.2], T_GIVE = 19.5, TAPS = [22.9, 23.5, 24.1], T_BURST = 24.6, T_BUZZ = 27.7, T_BACK = 32.7, T_IRIS = [34.6, 35.3];
export function buildEvents() {
  const E = LINES.map(l => ({ t: l.t, type: 'vo', id: l.id, who: l.who, d: l.d }));
  for (const t of [.05, .3, .55]) E.push({ t, type: 'step' });
  E.push({ t: 7.15, type: 'pop' }, { t: T_LOWER[0], type: 'rustle', d: .7 }, { t: 14.6, type: 'tick' }, { t: 18.85, type: 'rustle', d: .3 });
  E.push({ t: T_GIVE, type: 'pat' }, { t: 19.75, type: 'stretch', d: .3 });
  for (const t of TAPS) E.push({ t, type: 'tap' });
  for (let i = 0; i < 14; i++) E.push({ t: T_BURST + i * .05, type: 'blip', i });
  E.push({ t: T_BURST + .8, type: 'send' }, { t: T_BUZZ, type: 'buzz', d: .5 }, { t: T_BUZZ + .7, type: 'buzz', d: .3 });
  E.push({ t: T_BACK, type: 'pat' }, { t: T_IRIS[1], type: 'irisThunk' });
  return E.sort((a, b) => a.t - b.t);
}
