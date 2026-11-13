// scenes.js — episode 5 « La batterie »: the performance (a pure function of t), the coffee, the chair, the battery, the cameras, the iris, the title cards.
// Characters act on twos (tq); cameras move on ones (t).
import * as T from './toon.js';
import { P, steam } from './parts.js';
import { papi, leo, battery } from './people.js';
import { drawBG, hangingPans, wallClock, flourJar, FLOOR } from './kitchen.js';
import { BEAT, DUR, LINES, SUBS, CUTS, T_DIE, T_FULL, T_IRIS, shotAt, beats } from './story.js';
import { clamp, lerp, seg, ss, eo, env, hash, back } from '/core/lib.js';

let BG, SG, LIP;
export function initScenes(bg, sg, lip) { BG = bg; SG = sg; LIP = lip; }

const PX = 700, PY = 936, LEO_STAND = 300, LEO_SIT = [552, 915], T_SIT = 26.5, TAB = { x0: 430, x1: 950, y: 830 }, CUPX = 772, CHAIR = 552, OFFPHONE = [488, 824], T_FALL = -9;
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

// ———————————————————— the coffee cup, the chair ————————————————————
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

function chair() {
  for (const s of [-1, 1]) T.shape(T.rr(CHAIR + s * 50 - 7, 700, 14, 140, 5), { fill: P.dark });
  T.shape(T.rr(CHAIR - 62, 690, 124, 26, 10), { fill: P.dark }); T.shape(T.rr(CHAIR - 52, 748, 104, 16, 6), { fill: P.dark });
  T.stroke([[CHAIR - 48, 698], [CHAIR + 48, 698]], T.S.lw * .5, { line: P.light });
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

// ———————————————————— Papi (seated) ————————————————————
const L2 = v => [v[0] - PX, v[1] - PY];
function papiPose(t0) {
  const t = twos(t0), b = breath(t0);
  const p = { x: PX, y: PY, seated: true };
  p.turn = kf(t, [[11.6, .12], [11.9, -.3], [13.1, -.3], [13.3, 0], [14.4, 0], [14.6, -.3], [18.5, -.35], [22.5, -.45], [26.5, -.35], [32.9, -.35], [33.3, -.1]]);
  let lk = kf(t, [[11.6, [.3, .85]], [11.9, [-.7, 0]], [13.1, [-.7, 0]], [13.3, [0, 0]], [14.4, [0, 0]], [14.6, [-.7, 0]], [22.5, [-.8, .15]], [26.4, [-.8, .15]], [26.5, [-.8, .65]], [33.0, [-.8, .65]], [33.3, [-.1, -.6]], [34.0, [-.6, .5]]]);
  if (at(t, 13.8, 14.1)) lk = [.6, -.15];
  p.look = { lx: lk[0], ly: lk[1] };
  p.lid = kf(t, [[6.6, .45], [6.7, 1], [6.95, 1], [7.05, .45], [11.6, .45], [11.9, .28], [13.1, .28], [13.3, .5], [14.4, .5], [14.6, .3], [15.6, .3], [15.9, .42], [18.5, .4], [22.5, .2], [35, .2]]);
  for (const tb of [2.2, 9.6, 17.4, 24.9, 29.4]) if (at(t, tb, tb + .16)) p.lid = 1;
  const lecture = env(t, 12.1, 13.1, .12, .15) * .7, one = env(t, 13.3, 14.4, .1, .15), tender = ss(seg(t, 22.5, 22.9)) * .7;
  p.brows = [{ raise: lecture, tilt: tender }, { raise: Math.max(lecture, one), tilt: tender }];
  p.stache = kf(t, [[11.5, -.3], [11.9, 0], [15.5, 0], [15.8, .7], [16.45, .7], [16.6, .95], [17.6, .5], [22.5, .4], [31.9, .5], [32.9, .8], [35, .9]]);
  if (t >= 33.6) p.eyes = 'happy';
  p.talk = talkOf('papi', t);
  p.sy = 1 + .028 * b; p.sx = 1 - .017 * b;
  // the chair-side hand: rests, pats the chair twice, then goes round the boy (hidden behind him)
  const restA = L2([640, TAB.y - 14]), patH = L2([CHAIR + 14, 684]);
  const dn = (at(t, 22.9, 23.02) || at(t, 23.2, 23.32)) ? 10 : 0;
  const a = kf(t, [[22.5, restA], [22.8, [patH[0], patH[1] - 16]], [23.5, [patH[0], patH[1] - 16]], [23.8, L2([596, 740])], [26.4, L2([596, 740])], [26.5, L2([600, 760])]]);
  p.armA = { x: a[0], y: a[1] + dn, hand: 'open', rot: at(t, 22.7, 23.6) ? Math.PI * .5 + .3 : at(t, 23.6, 26.5) ? Math.PI + .5 : Math.PI - .35, front: t < T_SIT, flip: at(t, 23.6, 26.5), bend: -18 };
  // the cup-side hand: stirs, raises a finger, rests
  const sa = t * Math.PI * 2, stir = L2([CUPX + 12 * Math.cos(sa), TAB.y - 72 + 4 * Math.sin(sa)]), restB = L2([CUPX + 62, TAB.y - 14]);
  let B = stirring(t) ? stir : restB, handB = stirring(t) ? 'fist' : 'open', rotB = stirring(t) ? Math.PI / 2 : Math.PI - .4;
  const fing = ss(seg(t, 11.85, 12.15)) * (1 - ss(seg(t, 17.5, 17.9)));
  if (fing > 0) { const wag = at(t, 14.5, 16.3) ? Math.sin(t * Math.PI * 4) * 8 : 0; B = [lerp(restB[0], 152 + wag, fing), lerp(restB[1], -318, fing)]; if (fing > .5) { handB = 'point'; rotB = -Math.PI / 2; } }
  p.armB = { x: B[0], y: B[1], hand: handB, rot: rotB, front: true, flip: handB === 'open', bend: 18 };
  p._spoon = stirring(t) ? [B[0] + PX, B[1] + PY] : null;
  return p;
}

// ———————————————————— Léo ————————————————————
const blinkOn = t => t < T_DIE && (Math.floor(t * 12 + 1e-6) % 6 < 4) && !(t > 19.45 && t < T_DIE);
function leoPose(t0) {
  const t = twos(t0), b = breath(t0), bt = beats(t), sit = t >= T_SIT;
  const p = { y: FLOOR };
  if (sit) { p.x = LEO_SIT[0]; p.y = LEO_SIT[1]; p.seated = true; }
  else p.x = t < .8 ? lerp(-150, LEO_STAND - 12, eo(seg(t, 0, .8))) : lerp(LEO_STAND - 12, LEO_STAND, ss(seg(t, .8, 1.15)));
  const running = t < .8, skid = env(t, .8, 1.25, .05, .3), dead = t >= T_DIE, sad = ss(seg(t, 20.0, 20.5));
  if (running) { p.run = 1; p.runPh = t * Math.PI * 8; p.lean = .2; }
  if (skid) { p.lean = -.26 * skid; p.sx = 1 + .1 * skid; p.sy = 1 - .08 * skid; }
  let hop = 0;
  if (at(t, 1.3, 3.3)) hop = Math.abs(Math.sin(Math.PI * bt * 2)) * 12;
  if (at(t, 7.7, 11.0)) hop = Math.abs(Math.sin(Math.PI * bt)) * 9;
  p.y -= hop; p.phones = hop * .5 - 8 * sad * (sit ? 0 : 1);
  if (!running && !skid) { p.sy = 1 + .028 * b; p.sx = 1 - .017 * b; }
  if (sit) { const nod = ss(seg(t, 26.5, 27.2)); p.lean = .2 * (.6 + .4 * nod); p.headRot = .2 * nod; p.sy = 1 + .02 * Math.sin(t * Math.PI * .8); p.sx = 1; }
  else if (dead) p.headRot = .16 * sad;
  p.turn = sit ? .35 : kf(t, [[18.4, .55], [18.5, .1], [22.5, .1]]);
  const lk = sit ? [.6, .1] : kf(t, [[18.4, [.75, -.3]], [18.5, [-.1, .85]], [22.5, [-.1, .9]]]);
  p.look = { lx: lk[0], ly: lk[1] };
  p.eyes = sit ? (t >= 31.2 ? 'shut' : 'open') : step(t, [[0, 'wide'], [3.5, 'open'], [7.5, 'wide'], [11.5, 'open'], [18.5, 'wide'], [20.0, 'open']], 'open');
  p.lid = sit ? kf(t, [[26.5, .3], [27.3, .55], [31.2, .62]]) : dead ? .45 * sad : 0;
  p.brows = sit ? null : step(t, [[0, 'sad'], [3.5, 'flat'], [7.5, 'up'], [11.5, 'flat'], [18.5, 'sad']], 'sad');
  p.browUp = at(t, 7.5, 11.5) ? 1 : 0;
  p.mouth = { type: sit ? 'smile' : step(t, [[0, 'o'], [3.5, 'wavy'], [7.5, 'o'], [11.5, 'flat'], [18.5, 'wavy'], [T_DIE, 'o'], [20.2, 'frown']], 'o'), w: sit ? 24 : undefined };
  p.talk = talkOf('leo', t) * (sit ? .6 : t >= 18.5 ? .5 : 1);   // murmured lines keep the small mouth
  p.hair = sit ? -.2 : kf(t, [[0, .9], [3.5, .7], [3.8, .2], [7.5, .9], [11.2, .7], [11.5, 0], [18.5, .5], [T_DIE, .5], [T_DIE + .1, 1], [20.0, .6], [20.5, -.5]]);
  for (const tb of [5.1, 15.0, 28.9]) if (at(t, tb, tb + .16)) p.lid = 1;
  if (!sit) {
    const low = [-36, -150], chest = [-14, -112], shake = at(t, .3, 3.3) || at(t, 7.6, 10.2) ? [(hash(Math.floor(t * 12)) - .5) * (t > 7 ? 26 : 12), (hash(Math.floor(t * 12) + 7) - .5) * (t > 7 ? 20 : 10)] : [0, 0];
    const a = kf(t, [[0, [-8, -262]], [.8, [-8, -262]], [1.1, [-44, -258]], [3.3, [-44, -258]], [3.8, low], [7.4, low], [7.6, [-46, -246]], [10.2, [-46, -246]], [10.6, low], [18.4, low], [18.5, chest], [20.0, chest], [20.5, [-14, -100]]]);
    p.phone = { rot: at(t, 18.4, 23) ? .12 : -.2, batt: .12, blank: !dead && !blinkOn(t0), dead };
    p.armA = { x: a[0] + shake[0], y: a[1] + shake[1], front: at(t, 18.4, 23), hand: 'grab' };
    const rest = [52, -88];
    const c = kf(t, [[0, [70, -210]], [3.3, [70, -210]], [3.8, rest], [7.4, rest], [9.6, rest], [9.9, [96, -150]], [11.1, [96, -150]], [11.5, rest]]);
    p.armB = { x: c[0], y: c[1] + (t < 3.3 ? Math.sin(t * Math.PI * 6) * 14 : 0), hand: 'open', rot: at(t, 9.8, 11.3) ? -.5 : undefined };
  } else {
    p.armA = { x: -34, y: -66 }; p.armB = { x: 30, y: -66 };
  }
  return p;
}

// ———————————————————— cameras ————————————————————
function camOf(t) {
  const i = shotAt(t);
  if (i === 0) { const k = ss(seg(t, 0, 3.5)); return { x: lerp(515, 525, k), y: 730, z: lerp(1.45, 1.55, k) }; }
  if (i === 1) return { x: 735, y: 700, z: lerp(2.05, 2.12, seg(t, 3.5, 7.5)) };
  if (i === 2) return { x: 300, y: 790, z: 2.7 };
  if (i === 3) { const k = seg(t, 11.5, 18.5); return { x: 725, y: lerp(685, 668, k), z: lerp(2.1, 2.3, k) }; }
  if (i === 4) { const k = ss(seg(t, 19.9, 20.6)); return { x: lerp(288, 300, k), y: lerp(862, 805, k), z: lerp(5.0, 2.9, k) }; }
  if (i === 5) return { x: 640, y: 705, z: lerp(2.0, 2.08, seg(t, 22.5, 26.5)) };
  const k = seg(t, 26.5, 35.5); return { x: 640, y: lerp(705, 690, k), z: lerp(2.3, 2.6, ss(k)) };
}
const toScreen = (c, x, y) => [540 + (x - c.x) * c.z, 960 + (y - c.y) * c.z];

// ———————————————————— one frame ————————————————————
export function drawScene(t, nosub) {
  const sg = SG, c = camOf(t), b = breath(t), bt = beats(twos(t)), sit = t >= T_SIT;
  drawBG(sg, BG, c, b * .005);
  T.frame(t); T.transform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z);
  if (t >= 26.5) {   // the window light, while they recharge
    const [hx, hy] = toScreen(c, 562, 420); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(hx, hy); sg.rotate(Math.floor(t * 12) * .01);
    sg.fillStyle = `rgba(252,251,247,${.04 + .13 * ss(seg(t, 26.8, 28.5))})`;
    for (let i = 0; i < 12; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.arc(0, 0, 2400, i * Math.PI / 6, i * Math.PI / 6 + Math.PI / 12); sg.closePath(); sg.fill(); }
    sg.restore();
  }
  wallClock(b, t, bt); flourJar(b); hangingPans(b, t);
  chair();
  const pp = papiPose(t), lp = leoPose(t);
  papi(pp);
  if (sit) leo(lp);
  table(b);
  cup(t, b);
  if (pp._spoon) T.stroke([[pp._spoon[0], pp._spoon[1] + 6], [CUPX + (pp._spoon[0] - CUPX) * .5, TAB.y - 40]], T.S.lw * .9, { line: P.light });
  if (sit) T.shape(T.rr(OFFPHONE[0] - 34, OFFPHONE[1] - 9, 68, 13, 5), { fill: P.dark, lw: T.S.lw * .8 });
  if (!sit) leo(lp);
  // the phone dies: a little cloud of smoke
  const d = t - T_DIE; if (d >= 0 && d < .9 && !sit) { const k = d / .9, x = lp.x + lp.armA.x, y = lp.y + lp.armA.y - 40; for (const [dx, s, ph] of [[-12, 1, 0], [10, .8, .15], [0, 1.2, .3]]) { const kk = clamp(k * 1.3 - ph); if (kk > 0 && kk < 1) T.shape(T.ell(x + dx * (1 + kk) + Math.sin(kk * 5 + dx) * 5, y - 16 - 60 * kk, (9 + 12 * kk) * s, (7 + 9 * kk) * s), { fill: P.white, lw: T.S.lw * .6, alpha: 1 - kk * .7 }); } }
  // the full battery pops above them
  const f = t - T_FULL; if (f >= 0) {
    const k = f < .3 ? back(f / .3, 2.4) : 1, x = 645, y = 506 + Math.sin(twos(t) * Math.PI * 1.2) * 4;
    T.push(); T.translate(x, y); T.scale(k); battery(0, 0, 150, 1, T.S.lw, 4); T.pop();
    if (f < .35) { const r = f / .35; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + .2; T.stroke([[x + Math.cos(a) * (95 + 40 * r), y + Math.sin(a) * (60 + 34 * r)], [x + Math.cos(a) * (118 + 60 * r), y + Math.sin(a) * (78 + 50 * r)]], T.S.lw * .8); } }
  }
  irisMask(t, c);
  if (!nosub) subtitles(t);
}

// no iris at the start (the series opening comes first); iris out on the two of them
function irisMask(t, c) {
  if (t < T_IRIS[0]) return;
  const k = seg(t, T_IRIS[0], T_IRIS[1]), r = t >= T_IRIS[1] ? 0 : 1500 * Math.pow(1 - k, 1.8), [cx, cy] = toScreen(c, 645, 690);
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
