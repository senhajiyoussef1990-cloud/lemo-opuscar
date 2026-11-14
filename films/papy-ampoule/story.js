// story.js — the single source of truth: worlds, shots, voice start times, wipes, tags, key beats, music cues.
// The timeline is built from the plan below and the measured voice durations (voices/dur.json).
export const ANIM_FPS = 12;
export const q = t => Math.floor(t * ANIM_FPS + 1e-6) / ANIM_FPS;
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
export const LINES = await J('lines.json');
export const DURS = (await J('voices/dur.json')) || {};
export const LINE = Object.fromEntries(LINES.map(l => [l.id, l]));
export const vdur = id => DURS[id] ?? LINE[id].text.length * .065;

// The plan: per world, a list of [line id, shot, {pre, post}] or [BEAT, duration]
// shots: two (two-shot), wide, cuP, cuM, ins (the world's insert object), bag (insert on Malik's bag)
const PLAN = [
  ['home', [['h1', 'two', { pre: .7 }], ['h2', 'cuP'], ['h3', 'cuM'], ['h4', 'cuP'], ['h5', 'cuM'], ['h6', 'two'], ['BURST', 1.0], ['TITLE', 2.3], ['h7', 'cuM', { post: .3 }], ['RUSH', .4]]],
  ['w1', [['ARRIVE', 1.05], ['a1', 'wide'], ['a2', 'ins'], ['a3', 'cuM', { post: .3 }], ['OUT', .7], ['RUSH', .35]]],
  ['w2', [['ARRIVE', 1.05], ['b1', 'wide'], ['b2', 'ins'], ['b3', 'cuM'], ['b4', 'cuP', { pre: .3, post: .5 }], ['OUT', .7], ['RUSH', .35]]],
  ['w3', [['ARRIVE', 1.05], ['c1', 'wide'], ['c2', 'ins'], ['c3', 'cuM'], ['c4', 'cuP'], ['OUT', .7], ['RUSH', .35]]],
  ['w4', [['ARRIVE', 1.05], ['d1', 'wide'], ['d2', 'ins'], ['d3', 'two'], ['d4', 'cuM'], ['d5', 'cuP', { post: .2 }], ['STARE', .8], ['OUT', .7], ['RUSH', .35]]],
  ['w5', [['ARRIVE', 1.05], ['e1', 'wide'], ['e2', 'ins'], ['e3', 'cuM'], ['e4', 'cuP'], ['OUT', .7], ['RUSH', .35]]],
  ['w6', [['ARRIVE', 1.05], ['f1', 'wide'], ['f2', 'cuM'], ['f3', 'ins'], ['OUT', .7], ['RUSH', .35]]],
  ['w7', [['ARRIVE', 1.05], ['g1', 'wide'], ['g2', 'ins'], ['g3', 'cuM'], ['g4', 'cuP', { post: .3 }], ['OUT', .7], ['RUSH', .35]]],
  ['home2', [['ARRIVE', 1.05], ['SILENCE', 1.9], ['z1', 'two'], ['z2', 'cuM', { pre: .2 }], ['z3', 'cuP', { pre: .3, post: .6 }], ['END', 0], ['o1', 'end', { pre: .6 }], ['o2', 'end', { pre: .4, post: 1.8 }]]],
];

export const VO = {};          // id → start time
export const SHOTS = [];       // [t0, t1, shot, world, lineId|beat]
export const WIPES = [];       // [tc, half-width]
export const BEATS = {};       // `${world}.${BEAT}` → [t0, t1]
let t = 0;
for (const [w, items] of PLAN) {
  for (const it of items) {
    if (typeof it[1] === 'number') {
      const [name, d] = it;
      SHOTS.push([t, t + d, name.toLowerCase(), w, name]); BEATS[`${w}.${name}`] = [t, t + d]; t += d;
      if (name === 'RUSH') WIPES.push([t, .2]);
      continue;
    }
    const [id, shot, o = {}] = it, pre = o.pre ?? .1, post = o.post ?? .15, d = vdur(id);
    VO[id] = +(t + pre).toFixed(3);
    SHOTS.push([t, t + pre + d + post, shot, w, id]); t += pre + d + post;
  }
}
// the end card holds both outro lines: merge them into one shot
export const DUR = +t.toFixed(3);
export const shotAt = x => SHOTS.find(s => x >= s[0] && x < s[1]) || SHOTS[SHOTS.length - 1];
export const worldSpan = w => { const s = SHOTS.filter(x => x[3] === w); return [s[0][0], s[s.length - 1][1]]; };
export const B = (w, name) => BEATS[`${w}.${name}`];

// World tags (top-left readout): world → [code, description, background, text colour]
export const TAGS = {
  w1: ['ÉPOQUE : AUTREFOIS', 'BOUGIES ET LAMPES À HUILE', '#e07b39', '#fff'],
  w2: ['ÉPOQUE : XIXe SIÈCLE', 'UNE RUE ÉCLAIRÉE AU GAZ', '#2a7f8a', '#fff'],
  w3: ['ANGLETERRE · 1879', 'LE LABORATOIRE DE SWAN', '#c22f3a', '#fff'],
  w4: ['ÉTATS-UNIS · 1879', 'L’ATELIER D’EDISON', '#7b4fd1', '#fff'],
  w5: ['DÉBUT DU XXe SIÈCLE', 'LE FILAMENT DE TUNGSTÈNE', '#e8742a', '#fff'],
  w6: ['ÉTATS-UNIS · 1962', 'LA PREMIÈRE LED VISIBLE', '#e8452f', '#fff'],
  w7: ['AUJOURD’HUI', 'DES AMPOULES LED', '#2fbf9b', '#fff'],
};
// Music cues: one per world, each one's first beat is the cut
export const CUES = PLAN.map(([w]) => { const [a, b] = worldSpan(w); return { name: w, t0: +a.toFixed(3), t1: +b.toFixed(3) }; });
