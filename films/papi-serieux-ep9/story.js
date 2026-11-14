// story.js — episode 9 « Le selfie »: 120 bpm (1 beat = 12 frames at 24 fps), voice times, title cards, cuts, sound events.
export const BPM = 120, BEAT = 60 / BPM, DUR = 35.0;
export const beats = t => t / BEAT;
export const LINES = [
  { id: 'l1', who: 'leo', t: 0.3, d: 2.4 }, { id: 'l2', who: 'papi', t: 4.4, d: .73 }, { id: 'l3', who: 'leo', t: 6.7, d: 4.14 },
  { id: 'l4', who: 'papi', t: 11.8, d: .77 }, { id: 'l4b', who: 'papi', t: 14.0, d: 3.17 }, { id: 'l5', who: 'leo', t: 18.4, d: 2.63 },
  { id: 'l6', who: 'papi', t: 24.6, d: 1.34 }, { id: 'l7', who: 'leo', t: 27.4, d: 1.52 }, { id: 'l8', who: 'papi', t: 30.8, d: 2.83 },
];
export const SUBS = [
  [0.3, 3.4, 'Papi, souris, on fait un selfie !'],
  [4.4, 6.4, 'Je souris.'],
  [6.7, 10.95, 'Papi, sérieux ? J’en ai pris', 'quarante, t’es flou sur toutes !'],
  [11.8, 13.95, 'Dans mon temps…'],
  [14.0, 17.6, 'On avait une seule photo.', 'On s’appliquait.'],
  [18.4, 21.4, 'Une seule ?', 'Et si elle était ratée ?'],
  [24.6, 26.45, 'On la gardait quand même.'],
  [27.4, 29.95, 'C’est qui, le bébé ?'],
  [30.8, 33.9, 'Ton père. Il était flou aussi.'],
];
export const CUTS = [3.5, 6.5, 11.0, 18.0, 21.5, 26.5, 30.0];
export const shotAt = t => { let i = 0; while (i < CUTS.length && t >= CUTS[i]) i++; return i; };
export const FLASH = [3.0, 5.7], T_WALLET = [21.9, 22.8], T_PULL = [23.0, 24.4], T_IRIS = [33.9, 34.6];
export function buildEvents() {
  const E = LINES.map(l => ({ t: l.t, type: 'vo', id: l.id, who: l.who, d: l.d }));
  E.push({ t: .15, type: 'stretch', d: .3 }); for (const t of FLASH) E.push({ t, type: 'shutter' });
  E.push({ t: 6.6, type: 'cloth' }, { t: 13.4, type: 'tick' }, { t: 15.9, type: 'tick' }, { t: 18.1, type: 'cloth' });
  E.push({ t: T_WALLET[0], type: 'leather', d: .7 }, { t: T_PULL[0], type: 'paper', d: 1.2 }, { t: 26.6, type: 'cloth' }, { t: T_IRIS[1], type: 'irisThunk' });
  return E.sort((a, b) => a.t - b.t);
}
