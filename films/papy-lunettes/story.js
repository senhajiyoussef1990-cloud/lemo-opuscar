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
  ['home', [['h1', 'two', { pre: .7 }], ['h2', 'cuM'], ['h3', 'cuP'], ['h4', 'cuM'], ['h5', 'cuP'], ['h6', 'two'], ['BURST', 1.0], ['TITLE', 2.3], ['h7', 'cuM', { post: .3 }], ['RUSH', .4]]],
  ['w1', [['ARRIVE', 1.05], ['a1', 'wide'], ['a2', 'ins'], ['a3', 'cuM'], ['a4', 'cuP', { post: .3 }], ['OUT', .7], ['RUSH', .35]]],
  ['w2', [['ARRIVE', 1.05], ['b1', 'wide'], ['b2', 'ins'], ['b3', 'cuM'], ['b4', 'cuP', { pre: .3, post: .6 }], ['OUT', .7], ['RUSH', .35]]],
  ['w3', [['ARRIVE', 1.05], ['c1', 'wide'], ['c2', 'ins'], ['c3', 'cuM', { post: .3 }], ['OUT', .7], ['RUSH', .35]]],
  ['w4', [['ARRIVE', 1.05], ['d1', 'wide'], ['d2', 'ins'], ['d3', 'cuM'], ['d4', 'cuP', { post: .2 }], ['STARE', .8], ['OUT', .7], ['RUSH', .35]]],
  ['w5', [['ARRIVE', 1.05], ['e1', 'wide'], ['e2', 'cuM'], ['e3', 'ins', { post: .3 }], ['OUT', .7], ['RUSH', .35]]],
  ['w6', [['ARRIVE', 1.05], ['f1', 'wide'], ['f2', 'cuM'], ['f3', 'cuP', { post: .4 }], ['OUT', .7], ['RUSH', .35]]],
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
  w1: ['MOYEN ÂGE · VERS L’AN MIL', 'UN SCRIPTORIUM', '#8a5a34', '#fff'],
  w2: ['ITALIE · FIN DU XIIIe SIÈCLE', 'UN ATELIER DE VERRIER', '#c22f3a', '#fff'],
  w3: ['LONDRES · XVIIIe SIÈCLE', 'LA BOUTIQUE DE L’OPTICIEN', '#2a5a8a', '#fff'],
  w4: ['AMÉRIQUE · VERS 1784', 'UN BUREAU À PHILADELPHIE', '#2f6a4a', '#fff'],
  w5: ['ÉPOQUE : XIXe SIÈCLE', 'PINCE-NEZ ET MONOCLES', '#7b4fd1', '#fff'],
  w6: ['ÉTATS-UNIS · 1929', 'AU BORD DE LA MER', '#e8742a', '#fff'],
  w7: ['PRAGUE · 1961', 'LES LENTILLES SOUPLES', '#2fbf9b', '#fff'],
};
// Music cues: one per world, each one's first beat is the cut
export const CUES = PLAN.map(([w]) => { const [a, b] = worldSpan(w); return { name: w, t0: +a.toFixed(3), t1: +b.toFixed(3) }; });
