// story.js — episode 2 « Le GPS »: 120 bpm (1 beat = 12 frames at 24 fps), voice times, title cards, cuts, sound events.
export const BPM = 120, BEAT = 60 / BPM, DUR = 34.0;
export const beats = t => t / BEAT;
export const LINES = [
  { id: 'l1', who: 'leo', t: 2.3, d: 3.58 }, { id: 'l2', who: 'papi', t: 6.3, d: 2.32 }, { id: 'l3', who: 'leo', t: 9.2, d: 2.73 },
  { id: 'l4', who: 'papi', t: 12.5, d: .77 }, { id: 'l4b', who: 'papi', t: 14.5, d: 1.29 }, { id: 'l5', who: 'leo', t: 17.4, d: 1.14 },
  { id: 'l6', who: 'papi', t: 20.0, d: 2.65 }, { id: 'l7', who: 'leo', t: 25.2, d: 2.19 }, { id: 'l8', who: 'papi', t: 29.6, d: 1.44 },
];
export const SUBS = [
  [2.3, 5.95, 'Papi, c’est quoi ce truc ?', 'T’as pas de GPS ?'],
  [6.3, 8.95, 'Non. Je demande aux gens.'],
  [9.2, 11.95, 'Papi, sérieux ?', 'À des inconnus ?'],
  [12.5, 14.45, 'Dans mon temps…'],
  [14.5, 16.9, '… on appelait ça des voisins.'],
  [17.4, 18.95, 'Et si tu te perds ?'],
  [20.0, 23.6, 'C’est en me perdant que j’ai', 'rencontré ta grand-mère.'],
  [25.2, 27.9, 'On se perd ensemble, dimanche ?'],
  [29.6, 31.6, 'Laisse ton téléphone ici.'],
];
export const CUTS = [1.5, 6.0, 9.0, 12.0, 17.0, 19.0, 24.0, 28.0];
export const shotAt = t => { let i = 0; while (i < CUTS.length && t >= CUTS[i]) i++; return i; };
// the map: unfolds one panel per eighth note at the start, folds in two claps at the end
export const UNFOLD = [0.25, 0.5, 0.75, 1.0, 1.25], FOLD = [28.5, 29.0], T_POCKET = [24.3, 24.9], T_PHONE = [31.3, 32.1], T_IRIS = [32.7, 33.5];
export function buildEvents() {
  const E = LINES.map(l => ({ t: l.t, type: 'vo', id: l.id, who: l.who, d: l.d }));
  for (const t of UNFOLD) E.push({ t, type: 'paper' });
  for (let t = 1.55; t < 2.35; t += .25) E.push({ t, type: 'step' });
  E.push({ t: 2.35, type: 'skid', d: .25 });
  E.push({ t: 4.9, type: 'rustle', d: .3 }, { t: 6.9, type: 'rustle', d: .35 });
  E.push({ t: 8.7, type: 'tick' }, { t: 12.3, type: 'rustle', d: .3 }, { t: 13.75, type: 'tick' }, { t: 14.1, type: 'tick' });
  E.push({ t: 17.1, type: 'cloth' }, { t: 19.3, type: 'rustle', d: .5 });
  E.push({ t: T_POCKET[0] + .1, type: 'cloth' }, { t: T_POCKET[1], type: 'pat' });
  for (const t of FOLD) E.push({ t, type: 'paper', big: true });
  E.push({ t: 29.4, type: 'pat' }, { t: 30.55, type: 'knock' });
  E.push({ t: T_PHONE[0], type: 'cloth' }, { t: T_PHONE[1], type: 'phoneDown' }, { t: T_IRIS[1], type: 'irisThunk' });
  return E.sort((a, b) => a.t - b.t);
}
