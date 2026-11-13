// story.js — episode 5 « La batterie »: 120 bpm (1 beat = 12 frames at 24 fps), voice times, title cards, cuts, sound events.
export const BPM = 120, BEAT = 60 / BPM, DUR = 35.5;
export const beats = t => t / BEAT;
export const LINES = [
  { id: 'l1', who: 'leo', t: 0.4, d: 2.86 }, { id: 'l2', who: 'papi', t: 4.0, d: 2.64 }, { id: 'l3', who: 'leo', t: 7.7, d: 3.4 },
  { id: 'l4', who: 'papi', t: 12.3, d: .77 }, { id: 'l4b', who: 'papi', t: 14.5, d: 1.82 }, { id: 'l5', who: 'leo', t: 20.7, d: .83 },
  { id: 'l6', who: 'papi', t: 23.4, d: 2.77 }, { id: 'l7', who: 'leo', t: 27.6, d: 2.39 }, { id: 'l8', who: 'papi', t: 32.0, d: .87 },
];
export const SUBS = [
  [0.4, 3.45, 'Papi ! J’ai plus que 2 %', 'de batterie !'],
  [4.0, 7.3, 'Moi aussi. Depuis vingt ans.'],
  [7.7, 11.45, 'Papi, sérieux ?', 'Il est où, ton chargeur ?'],
  [12.3, 14.45, 'Dans mon temps…'],
  [14.5, 17.6, 'On se rechargeait', 'avec une sieste.'],
  [20.7, 22.45, 'Il est mort…'],
  [23.4, 26.45, 'Assieds-toi. On se recharge.'],
  [27.6, 30.6, 'Papi… t’es à combien, là ?'],
  [32.0, 34.2, 'Cent pour cent.'],
];
export const CUTS = [3.5, 7.5, 11.5, 18.5, 22.5, 26.5, 31.5];
export const shotAt = t => { let i = 0; while (i < CUTS.length && t >= CUTS[i]) i++; return i; };
export const T_DIE = 19.75, T_FULL = 33.2, T_IRIS = [34.2, 34.9];
export function buildEvents() {
  const E = LINES.map(l => ({ t: l.t, type: 'vo', id: l.id, who: l.who, d: l.d }));
  for (let t = .05; t < .8; t += .125) E.push({ t, type: 'step' });
  E.push({ t: .8, type: 'skid', d: .35 });
  for (let t = 1.25; t < 11.6; t += 1.0) E.push({ t, type: 'clink' });
  for (const t of [8.0, 8.5, 9.4]) E.push({ t, type: 'rattle' });
  E.push({ t: 6.75, type: 'tick' }, { t: 11.8, type: 'clinkDown' }, { t: 13.8, type: 'tick' });
  for (const t of [18.6, 19.0, 19.4]) E.push({ t, type: 'beep' });
  E.push({ t: T_DIE, type: 'pof' }, { t: 22.9, type: 'pat' }, { t: 23.2, type: 'pat' }, { t: 26.6, type: 'cloth' });
  E.push({ t: T_FULL, type: 'full' }, { t: T_IRIS[1], type: 'irisThunk' });
  return E.sort((a, b) => a.t - b.t);
}
