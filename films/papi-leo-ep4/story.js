// story.js — episode 4 « Le Wi-Fi »: 120 bpm (1 beat = 12 frames at 24 fps), voice times, title cards, cuts, sound events.
export const BPM = 120, BEAT = 60 / BPM, DUR = 37.0;
export const beats = t => t / BEAT;
export const LINES = [
  { id: 'l1', who: 'leo', t: 1.6, d: 2.29 }, { id: 'l2', who: 'papi', t: 4.6, d: 1.03 }, { id: 'l3', who: 'leo', t: 7.7, d: 4.21 },
  { id: 'l4', who: 'papi', t: 13.0, d: .77 }, { id: 'l4b', who: 'papi', t: 15.0, d: .85 }, { id: 'l4c', who: 'papi', t: 16.6, d: 1.66 },
  { id: 'l5', who: 'papi', t: 19.6, d: 2.96 }, { id: 'l6', who: 'leo', t: 23.6, d: 1.73 }, { id: 'l7', who: 'papi', t: 26.7, d: .81 },
  { id: 'l8', who: 'leo', t: 30.6, d: 1.13 }, { id: 'l9', who: 'papi', t: 33.6, d: 1.22 },
];
export const SUBS = [
  [1.6, 3.95, 'Papi ! Y a plus de Wi-Fi !'],
  [4.6, 7.0, 'Appelle les pompiers.'],
  [7.7, 11.95, 'Papi, sérieux ? Je fais quoi,', 'moi, sans Internet ?'],
  [13.0, 14.95, 'Dans mon temps…'],
  [15.0, 16.55, '… on s’ennuyait.'],
  [16.6, 18.95, 'C’était très bien organisé.'],
  [19.6, 22.95, 'Assieds-toi.', 'Je t’apprends la belote.'],
  [23.6, 25.95, 'C’est quoi, le mot de passe ?'],
  [26.7, 28.45, 'Atout cœur.'],
  [30.6, 32.9, 'Encore une partie.'],
  [33.6, 35.6, 'Tu vas encore perdre.'],
];
export const CUTS = [1.0, 4.0, 7.5, 12.0, 19.0, 23.0, 26.0, 28.5, 33.0];
export const shotAt = t => { let i = 0; while (i < CUTS.length && t >= CUTS[i]) i++; return i; };
export const T_PAGE = 6.2, T_LOWER = [12.0, 12.8], T_DECK = 19.4, T_TRUMP = 27.6, T_WIFI = 29.0, T_FLIP = 30.0, T_PLAY = 35.2, T_IRIS = [35.7, 36.3];
export function buildEvents() {
  const E = LINES.map(l => ({ t: l.t, type: 'vo', id: l.id, who: l.who, d: l.d }));
  for (let t = 1.05; t < 1.8; t += .125) E.push({ t, type: 'step' });
  E.push({ t: 1.8, type: 'skid', d: .35 }, { t: T_PAGE, type: 'page' });
  for (const t of [8.0, 8.5, 9.6, 10.6, 11.2]) E.push({ t, type: 'rattle' });
  E.push({ t: T_LOWER[0], type: 'rustle', d: .8 }, { t: 14.4, type: 'tick' }, { t: 16.1, type: 'tick' });
  E.push({ t: 18.9, type: 'rustle', d: .3 }, { t: T_DECK, type: 'deck' }, { t: 20.9, type: 'pat' }, { t: 21.2, type: 'pat' });
  E.push({ t: 22.3, type: 'shuffle', d: .6 }, { t: 25.5, type: 'card' }, { t: T_TRUMP, type: 'card' });
  E.push({ t: T_WIFI, type: 'ding' }, { t: T_FLIP, type: 'phoneFlip' }, { t: T_PLAY, type: 'slap' }, { t: T_IRIS[1], type: 'irisThunk' });
  return E.sort((a, b) => a.t - b.t);
}
