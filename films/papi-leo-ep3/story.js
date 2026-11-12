// story.js — episode 3 « Les likes »: 120 bpm (1 beat = 12 frames at 24 fps), voice times, title cards, cuts, sound events.
export const BPM = 120, BEAT = 60 / BPM, DUR = 36.0;
export const beats = t => t / BEAT;
export const LINES = [
  { id: 'l1', who: 'leo', t: 1.5, d: 4.25 }, { id: 'l2', who: 'papi', t: 6.4, d: 5.17 }, { id: 'l3', who: 'leo', t: 12.3, d: 3.45 },
  { id: 'l4', who: 'papi', t: 16.5, d: .77 }, { id: 'l4b', who: 'papi', t: 18.5, d: 1.3 }, { id: 'l4c', who: 'papi', t: 20.3, d: 1.18 },
  { id: 'l5', who: 'papi', t: 23.3, d: 1.73 }, { id: 'l6', who: 'papi', t: 27.6, d: 1.78 }, { id: 'l7', who: 'leo', t: 30.8, d: .99 },
  { id: 'l8', who: 'papi', t: 32.9, d: 1.47 },
];
export const SUBS = [
  [1.5, 5.95, 'Papi, ma vidéo a fait trois likes.', 'Ma vie est finie.'],
  [6.4, 9.95, 'Trois ? À mon mariage,', 'on était douze.'],
  [10.0, 11.95, 'C’était parfait.'],
  [12.3, 15.95, 'Papi, sérieux ? Y en a qui ont', 'un million de likes !'],
  [16.5, 18.45, 'Dans mon temps…'],
  [18.5, 20.25, '… on avait un seul like.'],
  [20.3, 22.6, 'Ça s’appelait un ami.'],
  [23.3, 25.45, 'Montre-la-moi, ta vidéo.'],
  [27.6, 29.95, 'Elle est très bien, ta vidéo.'],
  [30.8, 32.45, 'Ça fait quatre.'],
  [32.9, 34.9, 'Le quatrième compte double.'],
];
export const CUTS = [1.0, 6.0, 12.0, 16.0, 23.0, 25.5, 30.0, 32.5];
export const shotAt = t => { let i = 0; while (i < CUTS.length && t >= CUTS[i]) i++; return i; };
export const T_FALL = 4.6, T_GIVE = 25.2, T_LIKE = 29.65, T_BACK = 34.5, T_FIVE = 34.95, T_IRIS = [35.05, 35.6];
export function buildEvents() {
  const E = LINES.map(l => ({ t: l.t, type: 'vo', id: l.id, who: l.who, d: l.d }));
  for (const t of [1.6, 2.1, 2.6, 3.1]) E.push({ t, type: 'step' });
  E.push({ t: T_FALL + .16, type: 'fall' }, { t: T_FALL + .2, type: 'cupJump' });
  for (let t = 6.0; t < 16.0; t += 1.0) if (t < 11.4 || t > 12) E.push({ t: t + .25, type: 'clink' });
  E.push({ t: 11.7, type: 'tick' }, { t: 12.05, type: 'cloth' }, { t: 16.2, type: 'clinkDown' }, { t: 17.9, type: 'tick' }, { t: 19.95, type: 'tick' });
  E.push({ t: 23.1, type: 'cloth' }, { t: T_GIVE, type: 'pat' }, { t: 25.5, type: 'stretch', d: .35 });
  E.push({ t: T_LIKE, type: 'like' }, { t: 32.7, type: 'stretch', d: .3 }, { t: T_BACK, type: 'pat' }, { t: T_FIVE, type: 'like' }, { t: T_IRIS[1], type: 'irisThunk' });
  return E.sort((a, b) => a.t - b.t);
}
