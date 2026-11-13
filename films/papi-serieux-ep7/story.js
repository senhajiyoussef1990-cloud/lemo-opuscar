// story.js — episode 7 « Le mot de passe »: 120 bpm (1 beat = 12 frames at 24 fps), voice times, title cards, cuts, sound events.
export const BPM = 120, BEAT = 60 / BPM, DUR = 35.5;
export const beats = t => t / BEAT;
export const LINES = [
  { id: 'l1', who: 'leo', t: 0.5, d: 2.6 }, { id: 'l2', who: 'papi', t: 4.0, d: 2.97 }, { id: 'l3', who: 'leo', t: 7.8, d: 3.14 },
  { id: 'l4', who: 'papi', t: 12.3, d: .77 }, { id: 'l4b', who: 'papi', t: 14.5, d: 2.97 }, { id: 'l5', who: 'leo', t: 19.6, d: 2.16 },
  { id: 'l6', who: 'papi', t: 26.7, d: .6 }, { id: 'l7', who: 'leo', t: 28.3, d: .69 }, { id: 'l8', who: 'papi', t: 31.6, d: 1.05 },
];
export const SUBS = [
  [0.5, 3.45, 'Papi, ton mot de passe,', 'c’est « motdepasse » ?!'],
  [4.0, 7.3, 'Oui. Comme ça, je m’en souviens.'],
  [7.8, 11.3, 'Papi, sérieux ?', 'Tout le monde peut entrer !'],
  [12.3, 14.45, 'Dans mon temps…'],
  [14.5, 18.0, 'On avait une clé.', 'Sous le paillasson.'],
  [19.6, 21.95, 'Il faut un truc que personne', 'peut deviner.'],
  [26.7, 27.45, 'Voilà.'],
  [27.5, 28.25, 'Voilà.'],
  [28.3, 30.45, 'C’est quoi ?'],
  [31.6, 34.2, 'Le jour où t’es né.'],
];
export const CUTS = [3.5, 7.5, 11.5, 18.5, 22.0, 27.5, 30.5];
export const shotAt = t => { let i = 0; while (i < CUTS.length && t >= CUTS[i]) i++; return i; };
export const T_CUP = 5.5, T_PUSH = [18.9, 19.5], TAPS = [23.9, 24.25, 24.6, 24.95, 25.3, 25.65, 26.0, 26.35], T_LOCK = 26.7, T_IRIS = [34.3, 35.0];
export function buildEvents() {
  const E = LINES.map(l => ({ t: l.t, type: 'vo', id: l.id, who: l.who, d: l.d }));
  E.push({ t: .25, type: 'gasp' }, { t: T_CUP, type: 'clinkDown' }, { t: 7.6, type: 'cloth' }, { t: 13.8, type: 'tick' }, { t: 16.2, type: 'tick' });
  E.push({ t: T_PUSH[0], type: 'slide', d: .6 }, { t: 22.6, type: 'cloth' });
  TAPS.forEach((t, i) => E.push({ t, type: 'tap', i }));
  E.push({ t: T_LOCK, type: 'lock' }, { t: 27.7, type: 'cloth' }, { t: T_IRIS[1], type: 'irisThunk' });
  return E.sort((a, b) => a.t - b.t);
}
