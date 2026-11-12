// scenes.js — the performance (one continuous piece of acting, a pure function of t), the cameras, the iris and the title-card subtitles.
// Characters act on twos (tq); cameras move on ones (t).
import * as T from './toon.js';
import { P } from './parts.js';
import { papi, leo, pan, crepe, PAN_C } from './people.js';
import { drawBG, stove, hangingPans, wallClock, flourJar, phoneOnTable, FLOOR, TABLE, PAN_REST } from './kitchen.js';
import { BEAT, DUR, LINES, SUBS, CUTS, FLIPS, T_SET, T_SPIN, T_GRAB, T_IRIS, shotAt, beats } from './story.js';
import { clamp, lerp, seg, ss, eo, env, hash } from '/core/lib.js';

let BG, SG, LIP;
export function initScenes(bg, sg, lip) { BG = bg; SG = sg; LIP = lip; }

const PAPI_X = 800, LEO_X = 330, HOLD = [-95, -205];
const twos = t => Math.floor(t * 12 + 1e-6) / 12;
function kf(t, K) {
  const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
  let i = 0; while (t > K[i + 1][0]) i++;
  const u = ss((t - K[i][0]) / (K[i + 1][0] - K[i][0])), a = K[i][1], b = K[i + 1][1];
  return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], u)) : lerp(a, b, u);
}
const at = (t, a, b) => t >= a && t < b;
function step(t, K, d) { let v = d; for (const [t0, x] of K) if (t >= t0) v = x; return v; }   // held values (mouth types, hands)
function talk(id, t) {
  const L = LINES.find(l => l.id === id), e = LIP[id].env, i = Math.floor((t - L.t) * 24);
  return i >= 0 && i < e.length ? Math.max(e[i], e[Math.min(e.length - 1, i + 1)] * .7) : 0;
}
const talkOf = (who, t) => Math.max(...LINES.filter(l => l.who === who).map(l => talk(l.id, t)));
const breath = t => Math.cos(Math.PI * 2 * beats(twos(t)));   // +1 on the beat (stretch), −1 on the off-beat

// ———————————————————— the pan and the crêpe ————————————————————
function flickOff(t) {   // Papi's wrist: anticipation dip, snap, settle; a small give on every landing
  let dy = 0, rot = 0;
  for (const f of FLIPS) {
    if (f.leo) continue;
    const a = t - f.t0;
    if (a > -.3 && a < 0) { const k = ss((a + .3) / .3); dy += 24 * k; rot -= .1 * k; }
    else if (a >= 0 && a < .1) { const u = a / .1; dy += lerp(24, -46, u); rot += lerp(-.1, .3, u); }
    else if (a >= .1 && a < .45) { const u = ss((a - .1) / .35); dy += lerp(-46, 0, u); rot += lerp(.3, 0, u); }
    const b = t - f.t1; if (b >= 0 && b < .25 && f.t1 < T_SET) dy += 14 * (1 - b / .25);
  }
  return { dy, rot };
}
// handle end in world coordinates, facing (sxk: 1 = bowl left of the handle … −1 = bowl right), rotation, who holds it
function panState(t) {
  if (t < T_SET + .1) { const o = flickOff(t), k = ss(seg(t, T_SET, T_SET + .1)); return { x: lerp(PAPI_X + HOLD[0], PAN_REST.x + PAN_C, k), y: lerp(FLOOR + HOLD[1] + o.dy, PAN_REST.y + 15, k), rot: o.rot * (1 - k), sxk: 1, by: k < 1 ? 'papi' : 'stove' }; }
  const u = seg(t, T_SPIN[0], T_SPIN[1]), sxk = Math.cos(Math.PI * ss(u));
  let dy = -18 * Math.sin(Math.PI * u), rot = 0;
  const land = t - FLIPS[4].t1; if (land >= 0 && land < .3) dy += 8 * (1 - land / .3);
  if (t >= T_GRAB) {   // Léo lifts, dips, flicks
    dy = kf(t, [[T_GRAB + .1, 0], [29.0, -14], [29.2, 0], [29.3, -46], [29.75, -22]]);
    rot = kf(t, [[29.0, 0], [29.2, .1], [29.3, -.32], [29.75, -.06]]);
  }
  return { x: PAN_REST.x + PAN_C * sxk, y: PAN_REST.y + 15 + dy, rot, sxk, by: t >= T_GRAB ? 'leo' : 'stove' };
}
const bowlOf = s => ({ x: s.x - PAN_C * s.sxk * Math.cos(s.rot), y: s.y - 15 + PAN_C * s.sxk * Math.sin(s.rot) * -1 });
function crepeState(t) {
  for (const f of FLIPS) if (t > f.t0 + .04 && t < f.t1) {
    const u = (t - f.t0) / (f.t1 - f.t0), a = bowlOf(panState(f.t0 + .08)), b = bowlOf(panState(Math.min(f.t1, DUR)));
    return { fly: true, x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) - f.h * 4 * u * (1 - u), flip: u * f.turns * Math.PI * 2, rot: .25 * Math.sin(u * 9), f };
  }
  return { fly: false };
}

// ———————————————————— Papi ————————————————————
function papiPose(t0) {
  const t = twos(t0), b = breath(t0), fo = flickOff(t), hero = at(t, 21.5, 25.5);
  const p = { x: PAPI_X, y: FLOOR };
  p.turn = kf(t, [[3.95, -.75], [4.2, 0], [8.1, 0], [8.5, -.55], [14.7, -.55], [14.95, 0], [16.45, 0], [16.7, -.7], [18.5, -.7], [18.8, -.55], [21.4, -.55], [21.5, 0], [25.45, 0], [25.7, -.5]]);
  const lk = kf(t, [[3.95, [-.3, .6]], [4.2, [0, 0]], [8.1, [0, 0]], [8.5, [-.8, .15]], [14.7, [-.8, .15]], [14.95, [0, 0]], [16.45, [0, 0]], [16.7, [-.3, .5]], [17.5, [-.3, .5]], [17.95, [-.2, -.95]], [18.45, [-.3, .5]], [18.8, [-.8, .15]], [21.4, [-.8, .15]], [21.5, [0, -.1]], [25.45, [0, -.1]], [25.7, [-.8, .35]], [29.25, [-.8, .35]], [29.6, [-.5, -.95]]]);
  p.look = { lx: lk[0], ly: lk[1] };
  p.lid = kf(t, [[4.2, .2], [4.35, .5], [8.1, .5], [8.5, .3], [14.9, .3], [15.0, .52], [16.4, .52], [16.6, .2], [21.4, .2], [21.5, .05], [23.3, .05], [23.6, .32], [25.5, .32], [25.7, .15], [27.5, .15], [28.0, .34]]);
  for (const tb of [2.9, 5.75, 9.6, 13.4, 19.0, 26.9]) if (at(t, tb, tb + .16)) p.lid = 1;
  const oneBrow = env(t, 4.4, 5.5, .12, .2), bothUp = Math.max(env(t, 10.9, 11.7, .12, .2) * .8, env(t, 21.9, 23.1, .1, .3)), tender = ss(seg(t, 27.3, 27.8));
  p.brows = [{ raise: bothUp, tilt: tender * .7 }, { raise: Math.max(bothUp, oneBrow), tilt: tender * .7 }];
  p.stache = kf(t, [[4.2, 0], [4.35, -.4], [8.1, -.4], [14.9, -.3], [16.05, -.3], [16.2, .8], [16.6, .3], [21.4, .2], [21.6, .6], [23.5, .6], [23.8, 1], [25.45, 1], [25.7, 0], [27.5, 0], [27.9, .7], [30, .8]]);
  p.tremble = at(t, 27.4, 27.9) ? Math.sin(t * Math.PI * 12) * 5 : 0;
  if (at(t, 16.15, 16.42)) p.wink = 0;
  if (t >= 28.5) p.eyes = 'happy';
  p.talk = talkOf('papi', t);
  p.shrug = env(t, 7.1, 7.8, .12, .2);
  // squash and stretch: breathing + the anticipation and snap of every flick
  let sy = 1 + .03 * b;
  for (const f of FLIPS) { if (f.leo) continue; const a = t - f.t0; if (a > -.3 && a < 0) sy -= .07 * ss((a + .3) / .3); else if (a >= 0 && a < .3) sy += .07 * (1 - a / .3); }
  if (hero) sy += .035 * b + .04;
  p.sy = sy; p.sx = 1 - (sy - 1) * .6;
  // the pan arm (stove side)
  const idle = [-74, -132];
  if (t < T_SET + .1) { p.armA = { x: HOLD[0], y: HOLD[1] + fo.dy, hand: 'fist', rot: Math.PI, bend: 16, flip: false }; p.held = (hx, hy) => pan(hx, hy, -1, fo.rot, 1, !crepeState(t0).fly); }
  else if (hero) { const up = ss(seg(t, 22.45, 23.3)), wig = Math.sin(t * Math.PI * 8) * (at(t, 23.8, 25.2) ? .32 : .08); const a = lerp2([-96, -170], [-122, -338], up); p.armA = { x: a[0], y: a[1], hand: 'open', rot: -Math.PI / 2 - .25 + wig, k: lerp(1.15, 1.75, up), bend: -26, front: true, flip: true }; }
  else {
    const a = kf(t, [[25.5, idle], [27.6, idle], [27.95, [-104, -196]], [28.05, [-116, -194]], [28.45, [-128, -178]], [28.9, [-128, -178]], [29.2, idle]]);
    p.armA = { x: a[0], y: a[1], hand: at(t, 27.8, 28.2) ? 'point' : 'open', rot: at(t, 27.8, 29.0) ? Math.PI : undefined, flip: at(t, 27.8, 29.0) ? false : undefined };
  }
  // the free arm
  const rest = [74, -130];
  if (hero) { const up = ss(seg(t, 22.45, 23.3)), wig = Math.sin(t * Math.PI * 8 + 1.3) * (at(t, 23.8, 25.2) ? .32 : .08); const a = lerp2([96, -170], [122, -338], up); p.armB = { x: a[0], y: a[1], hand: 'open', rot: -Math.PI / 2 + .25 + wig, k: lerp(1.15, 1.75, up), bend: 26, front: true }; }
  else {
    const bob = (at(t, 13.0, 13.17) || at(t, 14.3, 14.47)) ? 14 : 0;
    const a = kf(t, [[7.1, rest], [7.25, [128, -214]], [7.65, [128, -214]], [7.9, rest], [12.3, rest], [12.6, [98, -268]], [14.75, [98, -268]], [15.05, [100, -200]], [15.45, [132, -216]], [15.6, [140, -176]], [16.0, [118, -150]], [16.5, rest], [18.6, rest], [18.85, [-28, -214]], [19.5, [-28, -214]], [19.6, rest]]);
    const cross = at(t, 18.7, 19.55);
    p.armB = { x: a[0], y: a[1] + bob, hand: at(t, 12.4, 14.9) || cross ? 'point' : 'open', rot: at(t, 12.4, 14.9) ? -Math.PI / 2 : at(t, 7.15, 7.85) ? -.5 : cross ? Math.PI : undefined, front: cross, flip: cross ? false : undefined, bend: cross ? -30 : undefined };
  }
  return p;
}
const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

// ———————————————————— Léo ————————————————————
function leoPose(t0) {
  const t = twos(t0), b = breath(t0), bt = beats(t);
  const p = { y: FLOOR };
  p.x = t < 1.85 ? lerp(-140, 318, eo(seg(t, 1.0, 1.85))) : t < 28.25 ? lerp(318, LEO_X, ss(seg(t, 1.85, 2.2))) : lerp(LEO_X, 372, ss(seg(t, 28.25, 28.5)));
  const running = at(t, 0, 1.85), skid = env(t, 1.85, 2.3, .05, .3);
  if (running) { p.run = 1; p.runPh = t * Math.PI * 8; p.lean = .2; }
  if (skid) { p.lean = -.26 * skid; p.sx = 1 + .1 * skid; p.sy = 1 - .08 * skid; }
  // hops: alarm (L1), insisting (L3), the last hop to the stove
  let hop = 0;
  if (at(t, 2.3, 3.5)) hop = Math.abs(Math.sin(Math.PI * bt * 2)) * 11;
  if (at(t, 8.2, 10.7)) hop = Math.abs(Math.sin(Math.PI * bt)) * 16;
  if (at(t, 28.25, 28.5)) hop = Math.sin(Math.PI * seg(t, 28.25, 28.5)) * 28;
  const laugh = at(t, 16.0, 16.5);
  if (laugh) { const k = Math.floor(t * 12) % 2 ? 1 : -1; p.sy = 1 + .07 * k; p.sx = 1 - .04 * k; p.headRot = -.14; hop = k > 0 ? 8 : 0; }
  p.y -= hop; p.phones = hop * .5 + (at(t, 21.1, 25.5) ? -7 : 0);
  if (!running && !skid && !laugh) { p.sy = 1 + .028 * b; p.sx = 1 - .017 * b; }
  p.turn = kf(t, [[19.4, .55], [19.5, .1], [20.55, .1], [20.75, .5], [25.5, .5], [25.65, -.35], [25.95, -.35], [26.15, .55]]);
  const lk = kf(t, [[19.4, [.7, -.35]], [19.5, [-.2, .85]], [20.55, [-.2, .85]], [20.75, [.8, -.3]], [25.5, [.7, -.35]], [25.65, [-.6, .7]], [25.95, [-.6, .7]], [26.15, [.75, -.5]], [29.25, [.75, -.5]], [29.5, [.5, -1]]]);
  p.look = { lx: lk[0], ly: lk[1] };
  p.eyes = step(t, [[1.0, 'wide'], [3.7, 'open'], [16.0, 'happy'], [16.5, 'open'], [26.0, 'wide'], [27.9, 'open'], [29.3, 'wide']], 'open');
  p.brows = step(t, [[1.0, 'sad'], [3.7, 'flat'], [8.2, 'up'], [10.7, 'flat'], [16.0, null], [16.5, 'up'], [19.5, 'flat'], [20.7, 'sad'], [25.5, 'flat'], [26.0, 'sad'], [27.9, 'up']], 'flat');
  p.mouth = { type: step(t, [[1.0, 'o'], [3.6, 'flat'], [8.0, 'smile'], [10.7, 'flat'], [16.0, 'beam'], [16.5, 'smile'], [19.5, 'flat'], [21.1, 'frown'], [25.5, 'flat'], [27.9, 'grin'], [29.25, 'beam']], 'flat') };
  p.talk = talkOf('leo', t);
  p.hair = kf(t, [[1.0, .9], [3.5, .9], [3.8, 0], [16.0, 0], [16.05, .6], [16.5, .1], [19.5, 0], [21.1, -.4], [25.5, 0], [29.2, 0], [29.35, 1]]);
  for (const tb of [5.2, 12.1, 14.0, 18.2, 23.0]) if (at(t, tb, tb + .16)) p.lid = 1;
  // the phone hand
  const low = [-36, -150], shake = at(t, 1.0, 3.5) ? [(hash(Math.floor(t * 12)) - .5) * 12, (hash(Math.floor(t * 12) + 7) - .5) * 10] : [0, 0];
  const toTable = [TABLE.x + 6 - LEO_X, TABLE.top - 8 - FLOOR];
  let a = kf(t, [[1.0, [-8, -262]], [1.9, [-8, -262]], [2.2, [-44, -258]], [3.45, [-44, -258]], [3.75, low], [8.1, low], [8.35, [-40, -252]], [10.6, [-40, -252]], [10.9, low], [19.4, low], [19.5, [-14, -110]], [21.5, [-14, -110]], [21.6, low], [25.6, low], [25.95, toTable], [26.0, toTable], [26.3, [-14, -104]], [28.45, [-14, -104]]]);
  p.phone = t < 25.98 ? { rot: at(t, 19.4, 21.5) ? .12 : -.2 } : null;
  p.armA = { x: a[0] + shake[0], y: a[1] + shake[1], front: at(t, 19.4, 21.5) || t >= 26.2, hand: t >= 26.0 ? 'open' : 'grab', bend: at(t, 25.6, 26.1) ? 10 : undefined };
  // the other hand: flailing, pointing, tapping, pleading
  const tapk = [19.6, 19.85, 20.1].some(x => at(t, x, x + .09)) ? 7 : 0, rest = [52, -88];
  let c = kf(t, [[1.0, [70, -210]], [3.5, [70, -210]], [3.8, rest], [8.1, rest], [8.35, [98, -192]], [10.6, [98, -192]], [10.9, rest], [19.4, rest], [19.5, [26, -128]], [20.5, [26, -128]], [20.75, rest], [21.05, rest], [21.2, [88, -152]], [21.45, [88, -152]], [21.6, rest], [26.0, rest], [26.3, [14, -104]], [28.45, [14, -104]]]);
  const flail = at(t, 1.0, 3.5) ? Math.sin(t * Math.PI * 6) * 14 : 0;
  p.armB = { x: c[0] - tapk, y: c[1] + flail + tapk * .6, hand: at(t, 8.3, 10.7) || at(t, 19.45, 20.6) ? 'point' : 'open', rot: at(t, 8.3, 10.7) ? -.15 : at(t, 19.45, 20.6) ? Math.PI * .86 : at(t, 21.1, 21.5) ? -.5 : undefined, front: at(t, 19.4, 20.7) || t >= 26.2 };
  if (at(t, 21.1, 21.5)) { p.sy = .95; p.armA.x -= 10; }
  if (t >= 28.5) {   // both hands on the handle
    const s = panState(t), k = ss(seg(t, 28.5, T_GRAB)), hx = s.x - p.x, hy = s.y - p.y - 2;
    p.armA = { x: lerp(-14, hx + 6, k), y: lerp(-104, hy, k), hand: 'fist', rot: 0, front: false, bend: -8 };
    p.armB = { x: lerp(14, hx + 44, k), y: lerp(-104, hy, k), hand: 'fist', rot: 0, front: true, bend: 18 };
  }
  return p;
}

// ———————————————————— cameras ————————————————————
function camOf(t) {
  const i = shotAt(t);
  if (i === 0) return { x: 600, y: 730, z: 2.5 };
  if (i === 1) { const k = ss(seg(t, 1.0, 4.0)); return { x: lerp(475, 500, k), y: 640, z: lerp(1.28, 1.4, k) }; }
  if (i === 2) return { x: 790, y: 715, z: lerp(2.05, 2.15, seg(t, 4, 8)) };
  if (i === 3) { const k = ss(seg(t, 14.75, 15.1)); return { x: lerp(565, 578, k), y: lerp(680, 690, k), z: lerp(1.5, 1.58, k) }; }
  if (i === 4) { const c = crepeState(t), up = c.fly ? clamp((760 - c.y) / 300, 0, 1) : 0; return { x: 705, y: 740 - 170 * ss(up), z: 1.9 }; }
  if (i === 5) return { x: 322, y: 800, z: lerp(2.5, 2.6, seg(t, 19.5, 21.5)) };
  if (i === 6) { const k = seg(t, 21.5, 25.5); return { x: lerp(790, 780, k), y: 668, z: lerp(2.0, 2.2, eo(k)) }; }
  const k = ss(seg(t, 25.5, 29.0)), c = crepeState(t), up = c.fly ? clamp((760 - c.y) / 260, 0, 1) : 0;
  return { x: lerp(560, 545, k), y: lerp(720, 745, k) - 150 * ss(up) * ss(seg(t, 29.25, 29.7)), z: lerp(1.5, 1.72, k) };
}
const toScreen = (c, x, y) => [540 + (x - c.x) * c.z, 960 + (y - c.y) * c.z];

// ———————————————————— one frame ————————————————————
export function drawScene(t) {
  const sg = SG, c = camOf(t), b = breath(t), hero = at(t, 21.5, 25.5), bt = beats(twos(t));
  drawBG(sg, BG, c, hero ? b * .02 : b * .005);
  T.frame(t); T.transform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z);
  if (hero) {   // the window light fans out behind him
    const [hx, hy] = toScreen(c, PAPI_X, 690); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(hx, hy); sg.rotate(Math.floor(t * 12) * .02);
    const a = .2 * ss(seg(t, 22.45, 23.3)) + .05; sg.fillStyle = `rgba(252,251,247,${a})`;
    for (let i = 0; i < 12; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.arc(0, 0, 1600, i * Math.PI / 6, i * Math.PI / 6 + Math.PI / 12); sg.closePath(); sg.fill(); }
    sg.restore();
  }
  wallClock(b, t, bt); flourJar(b); hangingPans(b, t);
  if (t >= 25.98) phoneOnTable();
  const ps = panState(t), cs = crepeState(t);
  stove(b, t, 1);
  if (ps.by !== 'papi') pan(ps.x, ps.y, -1, ps.rot, ps.sxk, !cs.fly);
  if (t >= 1.0) leo(leoPose(t));
  papi(papiPose(t));
  if (cs.fly) crepe(cs.x, cs.y, cs.flip, cs.rot);
  // landings: a little puff of steam
  for (const f of FLIPS) { const a = t - f.t1; if (a >= 0 && a < .33) { const o = bowlOf(panState(f.t1)), k = a / .33; for (const s of [-1, 0, 1]) T.shape(T.ell(o.x + s * (26 + 30 * k), o.y - 14 - 34 * k - Math.abs(s) * -8, 10 + 10 * k, 8 + 8 * k), { fill: P.white, lw: T.S.lw * .6, alpha: 1 - k * .5 }); } }
  // speed lines behind the running boy
  if (at(t, 1.0, 1.85)) { const lp = leoPose(t); for (let i = 0; i < 4; i++) T.stroke([[lp.x - 80 - i * 14, FLOOR - 60 - i * 44], [lp.x - 150 - i * 20 - hash(i + Math.floor(t * 12)) * 40, FLOOR - 60 - i * 44]], T.S.lw * .8); }
  irisMask(t, c, cs);
  subtitles(t);
}

// iris in on the crêpe, iris out on the crêpe
function irisMask(t, c, cs) {
  let r = -1, cx = 540, cy = 960;
  if (t < .75) { r = 110 + 1400 * Math.pow(seg(t, 0, .7), 1.6); const o = cs.fly ? cs : bowlOf(panState(t));[cx, cy] = toScreen(c, o.x, o.y); }
  else if (t >= T_IRIS[0]) { r = 1400 * Math.pow(1 - seg(t, T_IRIS[0], T_IRIS[1]), 1.8); if (t >= T_IRIS[1]) r = 0; const o = cs.fly ? cs : { x: 560, y: 600 };[cx, cy] = toScreen(c, o.x, o.y); }
  if (r < 0) return;
  const sg = SG; sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#060606';
  sg.beginPath(); sg.rect(0, 0, 1080, 1920); if (r > 0) sg.arc(cx, cy, r, 0, Math.PI * 2, true); sg.fill('evenodd');
  if (r > 0) { sg.strokeStyle = 'rgba(0,0,0,.5)'; sg.lineWidth = 10; sg.beginPath(); sg.arc(cx, cy, r + 4, 0, 7); sg.stroke(); }
  sg.restore();
}

// period title card (from the style's ui.js, two lines, no announcer microphone): pops on and off, drawn in the scene so it weaves with the film
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
