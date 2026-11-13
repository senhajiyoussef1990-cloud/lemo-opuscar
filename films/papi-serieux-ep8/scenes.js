// scenes.js — episode 8 « Les vocaux »: the performance (a pure function of t), the coffee, the phone, the open door, the cameras, the iris, the title cards.
// Characters act on twos (tq); cameras move on ones (t).
import * as T from './toon.js';
import { P, steam } from './parts.js';
import { papi, leo } from './people.js';
import { PICTO } from './pictos.js';
import { drawBG, hangingPans, wallClock, flourJar, FLOOR } from './kitchen.js';
import { BEAT, DUR, LINES, SUBS, CUTS, T_GIVE, T_FLIP, T_SHOUT, T_DOWN, T_STAND, T_IRIS, shotAt, beats } from './story.js';
import { clamp, lerp, seg, ss, eo, env, hash, back } from '/core/lib.js';

let BG, SG, LIP;
export function initScenes(bg, sg, lip) { BG = bg; SG = sg; LIP = lip; }

const PX = 700, PY = 936, LEO_X = 300, TAB = { x0: 430, x1: 950, y: 830 }, CUPX = 772, T_FALL = -9, DOOR_X = 150, OFFPHONE = [600, 824];
const twos = t => Math.floor(t * 12 + 1e-6) / 12;
function kf(t, K) {
  const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
  let i = 0; while (t > K[i + 1][0]) i++;
  const u = ss((t - K[i][0]) / (K[i + 1][0] - K[i][0])), a = K[i][1], b = K[i + 1][1];
  return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], u)) : lerp(a, b, u);
}
const at = (t, a, b) => t >= a && t < b;
function step(t, K, d) { let v = d; for (const [t0, x] of K) if (t >= t0) v = x; return v; }
function talk(id, t) {
  const L = LINES.find(l => l.id === id), e = LIP[id].env, i = Math.floor((t - L.t) * 24);
  return i >= 0 && i < e.length ? Math.max(e[i], e[Math.min(e.length - 1, i + 1)] * .7) : 0;
}
const talkOf = (who, t) => Math.max(...LINES.filter(l => l.who === who).map(l => talk(l.id, t)));
const breath = t => Math.cos(Math.PI * 2 * beats(twos(t)));

// ———————————————————— the coffee cup ————————————————————
const stirring = t => t < 11.75;
function cup(t, b) {
  const j = t - (T_FALL + .2), jump = j >= 0 && j < .35 ? -26 * Math.sin(Math.PI * j / .35) : 0, y = TAB.y + jump;
  T.shape(T.ell(CUPX, y - 2, 46, 7), { fill: P.white, lw: T.S.lw * .8 });                                    // saucer
  T.shape(T.arc(CUPX - 30, y - 22, 13, 11, Math.PI * .5, Math.PI * 1.5, 10), { closed: false, lw: T.S.lw * 2.2 });
  T.shape(T.arc(CUPX - 30, y - 22, 13, 11, Math.PI * .5, Math.PI * 1.5, 10), { closed: false, lw: T.S.lw * .8, line: P.white });
  T.shape(T.spline([[CUPX - 28, y - 40], [CUPX - 26, y - 14], [CUPX - 14, y - 5], [CUPX + 14, y - 5], [CUPX + 26, y - 14], [CUPX + 28, y - 40]], true, 6), { fill: P.white });
  T.shape(T.ell(CUPX, y - 40, 28, 6), { fill: P.dark, lw: T.S.lw * .8 });
  if (j >= 0 && j < .4) for (const s of [-1, 1]) T.shape(T.ell(CUPX + s * (14 + 40 * j), y - 58 - 60 * Math.sin(Math.PI * j / .4), 5, 7), { fill: P.dark, lw: T.S.lw * .5 });   // coffee jumps out
  steam(CUPX, y - 48, 'lazy', twos(t), .55);
}

// ———————————————————— the table ————————————————————
function table(b) {
  const { x0, x1, y } = TAB;
  T.shape(T.rect(x0 + 10, y + 14, x1 - x0 - 20, FLOOR - y - 14), {
    fill: P.pale, shade: () => {
      const g = T.g; g.fillStyle = P.light;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) if ((r + c) % 2 === 0) { const a = T.tx(x0 + 10 + c * 36, y + 14 + r * 36), d = T.tx(x0 + 46 + c * 36, y + 50 + r * 36); g.setTransform(1, 0, 0, 1, 0, 0); g.fillRect(a[0], a[1], d[0] - a[0], d[1] - a[1]); }
      g.fillStyle = 'rgba(14,13,12,.16)'; const a = T.tx(x1 - 70, y), d = T.tx(x1, FLOOR + 10); g.setTransform(1, 0, 0, 1, 0, 0); g.fillRect(a[0], a[1], d[0] - a[0], d[1] - a[1]);
    }
  });
  T.shape(T.rr(x0, y, x1 - x0, 18, 7), { fill: P.dark });
}
// the phone in Papi's glove, with one pictogram on its screen
function bigPhone(x, y, rot, icon, buzz = 0) {
  T.push(); T.translate(x + buzz, y); T.rotate(rot);
  T.shape(T.rr(-24, -78, 48, 80, 8), { fill: P.dark });
  T.shape(T.rr(-18, -70, 36, 62, 4), { fill: P.white, stroke: false, boil: .3 });
  if (icon) PICTO[icon](0, -42, 12);
  T.pop();
}


// the door, open on the garden (last shot)
function doorOpen(t) {
  T.shape(T.rect(22, 404, 166, 596), { fill: '#DAD7CD', stroke: false, boil: 0 });
  T.shape(T.ell(120, 470, 26, 26), { fill: P.white, stroke: false, boil: 0 });
  T.shape(T.spline([[22, 1000], [22, 800], [60, 760], [100, 790], [140, 745], [188, 780], [188, 1000]], true, 6), { fill: '#A9A69D', lw: 2.2, line: '#6A6862', boil: 0 });
  T.shape([[70, 1000], [150, 1000], [118, 850], [102, 850]], { fill: '#C9C6BC', stroke: false, boil: 0 });      // a path
  T.shape([[14, 396], [-38, 420], [-38, 1010], [14, 1006]], { fill: '#55534E', lw: 3.2, line: '#2A2927', boil: 0 });  // the leaf, swung in
  T.shape([[22, 1000], [188, 1000], [330, 1120], [70, 1120]], { fill: 'rgba(252,251,247,.22)', stroke: false, boil: 0 });   // light on the floor
  T.outline(T.shape(T.rect(22, 404, 166, 596), { stroke: false, boil: 0 }), 6, '#3B3A37');
}

// ———————————————————— Papi ————————————————————
const L2 = v => [v[0] - PX, v[1] - PY];
const OPEN = [506, TAB.y - 18];
function papiPose(t0) {
  const t = twos(t0), b = breath(t0);
  if (t >= 30.5) {   // at the door, looking back
    const p = { x: DOOR_X + 20, y: FLOOR, turn: .5, look: { lx: .8, ly: .15 }, lid: .2, sy: 1 + .028 * b, sx: 1 - .017 * b };
    const tender = ss(seg(t, 30.5, 31.2)) * .7; p.brows = [{ tilt: tender }, { tilt: tender }];
    p.stache = kf(t, [[30.5, .4], [31.4, .7], [35, .9]]); p.talk = talkOf('papi', t); if (t >= 33.0) p.eyes = 'happy';
    p.armA = { x: -86, y: -176, hand: 'open', rot: Math.PI + .3, bend: -14 }; p.armB = { x: 74, y: -130 };
    return p;
  }
  const up = ss(seg(t, T_STAND[0], T_STAND[1])), walk = seg(t, 29.3, 30.5);
  const p = { x: PX - 90 * ss(walk), y: PY - 56 * up - (walk > 0 ? Math.abs(Math.sin(t * Math.PI * 2)) * 8 : 0), seated: t < T_STAND[0] };   // once up, his legs show above the table
  const ox = p.x - PX, oy = p.y - PY, L = v => [v[0] - p.x, v[1] - p.y];
  p.turn = kf(t, [[11.5, .12], [11.9, -.3], [13.0, -.3], [13.2, 0], [14.1, 0], [14.3, -.3], [18.5, -.4], [20.6, -.45], [21.5, -.5], [25.5, -.4], [26.3, -.2], [27.0, 0], [28.6, 0], [29.0, -.45], [29.4, -.75]]);
  let lk = kf(t, [[11.5, [.3, .85]], [11.9, [-.7, 0]], [13.0, [-.7, 0]], [13.2, [0, 0]], [14.1, [0, 0]], [14.3, [-.7, 0]], [18.9, [-.8, .2]], [19.2, [-.7, .7]], [21.4, [-.7, .7]], [21.5, [-.8, .2]], [23.4, [-.8, .2]], [23.7, [-.7, .5]], [25.5, [-.7, .5]], [26.3, [0, .3]], [27.0, [0, -.1]], [28.6, [0, -.1]], [29.0, [-.8, .2]]]);
  if (at(t, 13.6, 13.9)) lk = [.6, -.15];
  p.look = { lx: lk[0], ly: lk[1] };
  p.lid = kf(t, [[11.5, .45], [11.9, .28], [13.0, .28], [13.2, .5], [14.1, .5], [14.3, .3], [18.5, .35], [21.5, .3], [21.7, .1], [23.3, .1], [23.6, .45], [25.5, .45], [26.3, .25], [30.5, .22]]);
  for (const tb of [2.2, 6.9, 9.6, 15.9, 20.2, 24.6, 28.0]) if (at(t, tb, tb + .16)) p.lid = 1;
  const shout = at(t, T_SHOUT, 23.2), inhale = env(t, 21.75, T_SHOUT, .3, .05);
  const lecture = env(t, 12.0, 13.0, .12, .15) * .7, one = Math.max(env(t, 13.2, 14.1, .1, .15), env(t, 3.9, 4.6, .1, .2), env(t, 23.6, 25.4, .2, .2));
  p.brows = [{ raise: Math.max(lecture, shout ? 1 : inhale * .6) }, { raise: Math.max(lecture, one, shout ? 1 : inhale * .6) }];
  p.stache = kf(t, [[11.5, -.3], [11.9, 0], [17.9, 0], [18.05, .9], [18.5, .3], [21.5, .2], [T_SHOUT, .2], [T_SHOUT + .05, 1], [23.2, 1], [23.5, 0], [25.5, -.2], [26.8, .3], [30.5, .5]]);
  p.talk = shout ? 1 : talkOf('papi', t);
  p.sy = 1 + .028 * b + .05 * inhale - (shout ? .06 : 0) + .09 * Math.sin(Math.PI * seg(t, T_STAND[0], T_STAND[1] + .15)); p.sx = 1 - (p.sy - 1) * .6;
  p.lean = -.06 * inhale + (shout ? .1 : 0) - .05 * ss(walk);
  if (shout) { p.hsx = 1.05; p.hsy = 1.08; }
  // Léo-side hand: rest, open for the phone, turns it upside down, shouts into it, puts it down
  const restA = L([640, TAB.y - 14]), mouthH = [-58, -268], downH = L([OFFPHONE[0] + 6, OFFPHONE[1] - 12]);
  const a = kf(t, [[18.5, restA], [18.8, L(OPEN)], [19.6, L(OPEN)], [20.2, [-120, -200]], [21.3, [-120, -200]], [21.7, mouthH], [23.5, mouthH], [23.9, [-96, -236]], [25.5, [-96, -236]], [T_DOWN, downH], [26.1, downH], [26.5, [-70, -130]]]);
  const hasPhone = at(t, T_GIVE, T_DOWN);
  p.armA = { x: a[0], y: a[1], hand: at(t, 18.6, T_GIVE) ? 'open' : hasPhone ? 'grab' : 'open', rot: at(t, 18.6, T_GIVE) ? Math.PI + .5 : hasPhone ? -Math.PI / 2 - .2 : Math.PI - .35, front: t < 26.2, flip: at(t, 18.6, T_GIVE), bend: -22 };
  if (hasPhone) { const fl = ss(seg(t, T_FLIP[0], T_FLIP[1])); p.held = (hx, hy) => bigPhone(hx, hy + lerp(-14, 26, fl), lerp(.12, Math.PI + .25, fl), 'vocal'); }
  // cup-side hand: stirs, raises a finger, rests, straightens the beret
  const sa = t * Math.PI * 2, stir = L([CUPX + 12 * Math.cos(sa), TAB.y - 72 + 4 * Math.sin(sa)]), restB = L([CUPX + 62, TAB.y - 14]);
  let B = stirring(t) ? stir : restB, handB = stirring(t) ? 'fist' : 'open', rotB = stirring(t) ? Math.PI / 2 : Math.PI - .4;
  const fing = ss(seg(t, 11.85, 12.15)) * (1 - ss(seg(t, 18.1, 18.45)));
  if (fing > 0) { const wag = at(t, 14.2, 18.0) ? Math.sin(t * Math.PI * 4) * 8 : 0; B = [lerp(restB[0], 152 + wag, fing), lerp(restB[1], -318, fing)]; if (fing > .5) { handB = 'point'; rotB = -Math.PI / 2; } }
  const beret = ss(seg(t, 26.8, 27.05)) * (1 - ss(seg(t, 27.6, 27.9)));
  if (t >= T_STAND[0]) { const side = [74, -130]; B = [lerp(lerp(restB[0], side[0], up), 46, beret), lerp(lerp(restB[1], side[1], up), -372 + (at(t, 27.2, 27.3) ? 6 : 0), beret)]; handB = beret > .5 ? 'grab' : 'open'; rotB = beret > .5 ? -Math.PI / 2 - .5 : undefined; }
  p.armB = { x: B[0], y: B[1], hand: handB, rot: rotB, front: t < T_STAND[0] || beret > .2, flip: handB === 'open' && t < T_STAND[0], bend: beret > .2 ? 30 : 18 };
  p._spoon = stirring(t) ? [B[0] + p.x, B[1] + p.y] : null;
  return p;
}

// ———————————————————— Léo ————————————————————
function leoPose(t0) {
  const t = twos(t0), b = breath(t0), bt = beats(t), last = t >= 30.5;
  const p = { y: FLOOR, x: last ? 420 : lerp(40, LEO_X, ss(seg(t, 0, .7))) };
  if (t < .7) { p.run = 1; p.runPh = t * Math.PI * 4; p.lean = .08; } else { p.sy = 1 + .028 * b; p.sx = 1 - .017 * b; }
  let hop = 0; if (at(t, 7.8, 11.2)) hop = Math.abs(Math.sin(Math.PI * bt)) * 9;
  p.y -= hop; p.phones = hop * .5;
  const palm = at(t, 23.0, 25.4);
  p.turn = last ? -.55 : kf(t, [[22.9, .55], [23.05, .1], [25.4, .1], [25.6, .55]]);
  const lk = last ? [-.8, -.2] : kf(t, [[18.6, [.75, -.3]], [18.9, [.85, .1]], [19.3, [.8, -.4]], [26.2, [.8, -.4]], [26.8, [.8, -.7]], [29.3, [.8, -.6]], [30.4, [.2, -.3]]]);
  p.look = { lx: lk[0], ly: lk[1] };
  p.eyes = palm ? 'squeeze' : step(t, [[0, 'open'], [7.5, 'open'], [21.5, 'open'], [22.4, 'wide'], [25.5, 'open'], [26.3, 'wide'], [30.5, 'open'], [33.2, 'happy']], 'open');
  p.lid = at(t, 7.5, 11.5) ? .3 : 0;
  p.brows = palm ? null : step(t, [[0, 'flat'], [7.5, 'angry'], [11.5, 'flat'], [18.5, 'up'], [21.5, 'flat'], [22.4, 'up'], [25.5, 'flat'], [26.3, 'up'], [30.5, 'up']], 'flat');
  p.mouth = { type: step(t, [[0, 'smile'], [3.5, 'flat'], [7.5, 'frown'], [11.5, 'flat'], [18.5, 'smile'], [21.5, 'flat'], [22.4, 'wavy'], [23.0, 'frown'], [25.5, 'flat'], [26.3, 'o'], [30.5, 'flat'], [32.6, 'smile'], [33.2, 'grin']], 'flat') };
  p.talk = talkOf('leo', t);
  p.hair = kf(t, [[7.4, 0], [7.5, .8], [11.2, .6], [11.5, 0], [22.35, 0], [22.45, 1], [23.0, .3], [25.5, 0], [26.3, 0], [26.4, .5], [27.5, .1]]);
  for (const tb of [2.6, 5.6, 14.9, 17.2, 20.4, 28.2, 32.0]) if (!palm && at(t, tb, tb + .16)) p.lid = 1;
  if (last) { p.armA = { x: -50, y: -88 }; p.armB = { x: 52, y: -88 }; return p; }
  // the phone hand: held out to Papi, then into his open glove; later both hands over his face
  const low = [-36, -150], out = [104, -206], give = [OPEN[0] - LEO_X, TAB.y - 26 - FLOOR], rest = [-50, -88];
  const a = kf(t, [[0, low], [.4, low], [.8, out], [3.2, out], [3.6, low], [7.5, low], [7.7, [-46, -246]], [11.2, [-46, -246]], [11.5, low], [18.6, low], [T_GIVE, give], [T_GIVE + .1, give], [19.4, rest], [22.9, rest], [23.05, [-26, -212]], [25.4, [-26, -212]], [25.7, rest]]);
  const has = t < T_GIVE, shake = at(t, 7.8, 11.2) ? [(hash(Math.floor(t * 12)) - .5) * 14, (hash(Math.floor(t * 12) + 7) - .5) * 10] : [0, 0];
  p.phone = has ? { rot: -.2, icon: 'vocal' } : null;
  p.armA = { x: a[0] + shake[0], y: a[1] + shake[1], front: at(t, .4, 3.5) || at(t, 18.6, 19.4) || palm, hand: has ? 'grab' : 'open', bend: at(t, .4, 3.5) || at(t, 18.6, 19.4) ? 22 : undefined, rot: palm ? -Math.PI / 2 + .3 : undefined };
  const restB = [52, -88];
  const c = kf(t, [[7.5, restB], [7.75, [84, -200]], [11.2, [84, -200]], [11.5, restB], [19.2, restB], [19.4, [106, -196]], [20.7, [106, -196]], [21.0, restB], [22.9, restB], [23.05, [26, -212]], [25.4, [26, -212]], [25.7, restB], [28.8, restB], [29.0, [96, -170]], [30.4, [96, -170]]]);
  p.armB = { x: c[0], y: c[1] + (at(t, 7.75, 11.2) ? Math.sin(t * Math.PI * 6) * 10 : 0), hand: at(t, 19.3, 20.8) ? 'point' : 'open', rot: at(t, 19.3, 20.8) ? -.9 : palm ? -Math.PI / 2 - .3 : at(t, 28.9, 30.5) ? -.3 : undefined, front: palm };
  return p;
}

// ———————————————————— cameras ————————————————————
function camOf(t) {
  const i = shotAt(t);
  if (i === 0) { const k = ss(seg(t, 0, 3.5)); return { x: lerp(515, 525, k), y: 730, z: lerp(1.45, 1.55, k) }; }
  if (i === 1) return { x: 735, y: 700, z: lerp(2.05, 2.12, seg(t, 3.5, 7.5)) };
  if (i === 2) return { x: 300, y: 790, z: 2.7 };
  if (i === 3) { const k = seg(t, 11.5, 18.5); return { x: 725, y: lerp(685, 668, k), z: lerp(2.1, 2.3, k) }; }
  if (i === 4) return { x: 585, y: 720, z: lerp(1.9, 1.97, seg(t, 18.5, 21.5)) };
  if (i === 5) { const sh = at(t, T_SHOUT, T_SHOUT + .5) ? (1 - (t - T_SHOUT) / .5) : 0, f = Math.floor(t * 24); return { x: 520 + (hash(f) - .5) * 16 * sh, y: 725 + (hash(f + 3) - .5) * 14 * sh, z: 1.6 + .05 * sh }; }
  if (i === 6) { const k = ss(seg(t, 25.5, 30.5)); return { x: lerp(640, 585, k), y: lerp(705, 690, k), z: lerp(1.95, 1.8, k) }; }
  const k = seg(t, 30.5, 35); return { x: lerp(250, 240, k), y: lerp(725, 715, k), z: lerp(1.85, 2.05, ss(k)) };
}
const toScreen = (c, x, y) => [540 + (x - c.x) * c.z, 960 + (y - c.y) * c.z];

// ———————————————————— one frame ————————————————————
export function drawScene(t, nosub) {
  const sg = SG, c = camOf(t), bt = beats(twos(t)), tq = twos(t), last = t >= 30.5;
  const shout = at(t, T_SHOUT, T_SHOUT + .5) ? Math.sin((t - T_SHOUT) * 40) * (1 - (t - T_SHOUT) / .5) : 0, b = breath(t) + shout * 4;
  drawBG(sg, BG, c, b * .005);
  T.frame(t); T.transform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z);
  if (last) doorOpen(t);
  wallClock(b, t, bt); flourJar(b); hangingPans(b, t);
  const pp = papiPose(t), lp = leoPose(t);
  if (!last) { papi(pp); table(breath(t)); cup(t, b); }
  if (pp._spoon) T.stroke([[pp._spoon[0], pp._spoon[1] + 6], [CUPX + (pp._spoon[0] - CUPX) * .5, TAB.y - 40]], T.S.lw * .9, { line: P.light });
  if (!last && t >= T_DOWN) T.shape(T.rr(OFFPHONE[0] - 34, OFFPHONE[1] - 9, 68, 13, 5), { fill: P.dark, lw: T.S.lw * .8 });
  leo(lp);
  if (last) papi(pp);
  // he shouts: lines fly out of his mouth
  if (at(t, T_SHOUT, 23.2)) { const k = (t - T_SHOUT) / .8, mx = pp.x - 40, my = pp.y - 262; for (let i = 0; i < 7; i++) { const a = Math.PI + (i - 3) * .28, r0 = 50 + 120 * k, r1 = r0 + 40 + 30 * (i % 2); T.stroke([[mx + Math.cos(a) * r0, my + Math.sin(a) * r0 * .8], [mx + Math.cos(a) * r1, my + Math.sin(a) * r1 * .8]], T.S.lw * (1 - k * .5)); } }
  irisMask(t, c);
  if (!nosub) subtitles(t);
}

// no iris at the start (the series opening comes first); iris out on Papi at the door
function irisMask(t, c) {
  if (t < T_IRIS[0]) return;
  const k = seg(t, T_IRIS[0], T_IRIS[1]), r = t >= T_IRIS[1] ? 0 : 1500 * Math.pow(1 - k, 1.8), [cx, cy] = toScreen(c, DOOR_X + 28, FLOOR - 300);
  const sg = SG; sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#060606';
  sg.beginPath(); sg.rect(0, 0, 1080, 1920); if (r > 0) sg.arc(cx, cy, r, 0, Math.PI * 2, true); sg.fill('evenodd');
  if (r > 0) { sg.strokeStyle = 'rgba(0,0,0,.5)'; sg.lineWidth = 10; sg.beginPath(); sg.arc(cx, cy, r + 4, 0, 7); sg.stroke(); }
  sg.restore();
}

// period title card (two lines, drawn in the scene so it weaves with the film): pops on and off
export function subtitles(t) {
  const s = SUBS.find(q => t >= q[0] && t < q[1]); if (!s) return;
  const g = SG, lines = s.slice(2), size = 46, cx = 540, cy = 1640;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.font = `${size}px "IM Fell English SC"`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const tw = Math.max(...lines.map(l => g.measureText(l).width)), w = tw + size * 2.1, h = size * (lines.length === 2 ? 3.15 : 1.95), x0 = cx - w / 2, y0 = cy - h / 2;
  g.fillStyle = 'rgba(12,11,10,.93)'; g.beginPath(); g.roundRect(x0, y0, w, h, size * .22); g.fill();
  g.strokeStyle = P.paper; g.lineWidth = 2.4; g.beginPath(); g.roundRect(x0 + 8, y0 + 8, w - 16, h - 16, size * .16); g.stroke();
  g.lineWidth = 1.1; g.beginPath(); g.roundRect(x0 + 14, y0 + 14, w - 28, h - 28, size * .12); g.stroke();
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const ax = sx > 0 ? x0 + 14 : x0 + w - 14, ay = sy > 0 ? y0 + 14 : y0 + h - 14;
    g.fillStyle = P.paper; g.beginPath(); g.arc(ax + sx * 8, ay + sy * 8, 3.4, 0, 7); g.fill();
    g.lineWidth = 1.5; g.beginPath(); g.arc(ax + sx * 8, ay + sy * 8, 8, 0, 7); g.stroke();
  }
  g.fillStyle = P.paper;
  lines.forEach((l, i) => g.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * size * 1.2 + size * .05));
  g.restore();
}
