// scenes.js — episode 3 « Les likes »: the performance (a pure function of t), the coffee cup, the like counter, the cameras, the iris, the title cards.
// Characters act on twos (tq); cameras move on ones (t).
import * as T from './toon.js';
import { P, steam } from './parts.js';
import { papi, leo, heart } from './people.js';
import { drawBG, hangingPans, wallClock, flourJar, FLOOR } from './kitchen.js';
import { BEAT, DUR, LINES, SUBS, CUTS, T_FALL, T_GIVE, T_LIKE, T_BACK, T_FIVE, T_IRIS, shotAt, beats } from './story.js';
import { clamp, lerp, seg, ss, eo, env, hash } from '/core/lib.js';

let BG, SG, LIP;
export function initScenes(bg, sg, lip) { BG = bg; SG = sg; LIP = lip; }

const PX = 700, PY = 936, LEO_X = 330, TAB = { x0: 430, x1: 950, y: 830 }, CUPX = 640;
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
const likes = t => t < T_LIKE ? 3 : t < T_FIVE ? 4 : 5;
const popK = t => { for (const u of [T_LIKE, T_FIVE]) { const a = t - u; if (a >= 0 && a < .4) return a / .4; } return -1; };

// ———————————————————— the coffee cup ————————————————————
const stirring = t => at(t, 1.0, 16.1) && !at(t, 11.4, 12.2);
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
function bigPhone(x, y, rot, n, pk) {   // the phone in Papi's glove: a heart and the counter
  T.push(); T.translate(x, y); T.rotate(rot);
  T.shape(T.rr(-24, -78, 48, 80, 8), { fill: P.dark });
  T.shape(T.rr(-18, -70, 36, 62, 4), { fill: P.white, stroke: false, boil: .3 });
  const s = pk >= 0 ? 1 + .5 * Math.sin(Math.PI * Math.min(1, pk * 2)) : 1;
  T.shape(heart(0, -50, 9 * s), { fill: P.ink, stroke: false, boil: .3 }); T.text(String(n), 0, -24, { font: '22px Limelight', fill: P.ink });
  T.pop();
}
function likePop(x, y, k, s = 1) {   // a heart bursting out of the screen
  T.shape(heart(x, y - 30 * k * s, (12 + 46 * k) * s), { fill: P.white, lw: T.S.lw * .9, alpha: 1 - k * .8 });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + .4, r0 = (40 + 60 * k) * s, r1 = r0 + 22 * s; T.stroke([[x + Math.cos(a) * r0, y - 10 + Math.sin(a) * r0], [x + Math.cos(a) * r1, y - 10 + Math.sin(a) * r1]], T.S.lw * .8); }
}

// ———————————————————— Papi (seated) ————————————————————
const L2 = v => [v[0] - PX, v[1] - PY];
function papiPose(t0) {
  const t = twos(t0), b = breath(t0);
  const p = { x: PX, y: PY, seated: true };
  p.turn = kf(t, [[6.3, -.12], [6.5, -.3], [6.9, -.12], [7.7, -.12], [8.0, .1], [9.6, .1], [9.9, -.12], [10.6, -.12], [10.8, 0], [11.9, 0], [16.0, -.12], [16.3, -.35], [17.3, -.35], [17.5, 0], [18.4, 0], [18.6, -.35], [23.0, -.45], [25.4, -.45], [25.5, -.6], [28.5, -.6], [28.8, -.45], [29.3, -.6], [32.5, -.5]]);
  let lk = kf(t, [[4.7, [-.1, .85]], [4.9, [-.9, .5]], [6.3, [-.9, .5]], [6.9, [-.1, .85]], [7.7, [-.1, .85]], [8.0, [.4, -.7]], [9.6, [.4, -.7]], [9.9, [-.1, .85]], [10.6, [-.1, .85]], [10.8, [0, 0]], [11.9, [0, 0]], [16.0, [-.1, .85]], [16.3, [-.7, 0]], [17.3, [-.7, 0]], [17.5, [0, 0]], [18.4, [0, 0]], [18.6, [-.7, 0]], [25.4, [-.8, .1]], [25.5, [-.8, -.6]], [28.5, [-.8, -.6]], [28.8, [-.8, .3]], [29.3, [-.8, -.6]], [32.5, [-.8, .3]]]);
  if (at(t, 17.9, 18.2)) lk = [.6, -.15];
  p.look = { lx: lk[0], ly: lk[1] };
  p.lid = kf(t, [[6.0, .4], [10.7, .4], [10.8, .5], [11.55, .5], [11.65, 1], [11.9, 1], [12.0, .45], [16.0, .45], [16.3, .28], [17.3, .28], [17.5, .5], [18.4, .5], [18.6, .3], [23.0, .3], [25.4, .3], [25.5, .68], [26.3, .68], [29.4, .5], [32.5, .25]]);
  for (const tb of [3.0, 8.9, 14.0, 20.0, 24.4, 31.2]) if (at(t, tb, tb + .16)) p.lid = 1;
  const chuckle = at(t, 26.4, 27.4);
  const one = Math.max(env(t, 6.4, 7.0, .1, .15), env(t, 17.5, 18.4, .1, .15), env(t, 23.2, 25.3, .12, .2)), lecture = env(t, 16.3, 17.3, .12, .15) * .7, tender = ss(seg(t, 27.4, 27.8)) * .6;
  p.brows = [{ raise: lecture, tilt: tender }, { raise: Math.max(lecture, one), tilt: tender }];
  p.stache = kf(t, [[6.0, -.3], [16.0, -.3], [16.3, 0], [20.2, 0], [20.4, .4], [21.7, .4], [21.85, .9], [22.8, .4], [25.5, .2], [26.3, .2], [26.45, .9], [32.5, .7]]);
  if (chuckle || t >= 35.0) p.eyes = 'happy';
  if (at(t, 34.0, 34.45)) p.wink = 0;
  p.talk = talkOf('papi', t);
  p.sy = 1 + .028 * b; p.sx = 1 - .017 * b;
  if (chuckle) { const k = Math.floor(t * 12) % 2 ? 1 : -1; p.sy = 1 + .045 * k; p.sx = 1 - .025 * k; p.shrug = k > 0 ? .5 : 0; }
  // the cup hand (stove side, toward Léo): holds the cup, then opens across the table, holds the phone at arm's length, hands it back
  const cupH = L2([CUPX - 34, TAB.y - 22]), open = L2([506, TAB.y - 18]), far = L2([452, 610]), give = L2([446, 806]);
  const a = kf(t, [[22.9, cupH], [23.25, open], [25.35, open], [25.5, far], [32.5, far], [33.2, give], [T_BACK + .05, give], [35.0, cupH]]);
  const beck = at(t, 24.1, 24.7) ? Math.sin(t * Math.PI * 8) * .25 : 0, hasPhone = at(t, T_GIVE, T_BACK);
  p.armA = { x: a[0], y: a[1], hand: at(t, 23.1, T_GIVE) || t >= T_BACK ? 'open' : 'grab', rot: at(t, 23.1, 25.45) ? Math.PI + .5 + beck : hasPhone ? (t < 32.6 ? -Math.PI / 2 - .2 : Math.PI + .2) : Math.PI - .3, front: true, flip: at(t, 23.1, 25.45) ? true : false, bend: at(t, 25.45, 32.6) ? -46 : -16 };
  if (hasPhone) p.held = (hx, hy) => bigPhone(hx, hy - (t < 32.6 ? 14 : 6), t < 25.5 ? -.9 : t < 32.6 ? .12 : -1.1, likes(t), popK(t0));
  // the other hand: stirs, raises a finger, taps the heart
  const sa = t * Math.PI * 2, stir = L2([CUPX + 12 * Math.cos(sa), TAB.y - 72 + 4 * Math.sin(sa)]), restB = L2([CUPX + 70, TAB.y - 12]);
  let B = stirring(t) ? stir : restB, handB = stirring(t) ? 'fist' : 'open', rotB = stirring(t) ? Math.PI / 2 : Math.PI - .4, frontB = true;
  if (!stirring(t) && t < 16.1) B = [lerp(stir[0], restB[0], ss(seg(t, 11.4, 11.6))), lerp(stir[1], restB[1], ss(seg(t, 11.4, 11.6)))];
  const fing = ss(seg(t, 16.2, 16.45)) * (1 - ss(seg(t, 22.3, 22.7)));
  if (fing > 0) { const wag = at(t, 18.5, 19.8) ? Math.sin(t * Math.PI * 4) * 8 : 0; B = [lerp(restB[0], 152 + wag, fing), lerp(restB[1], -318, fing)]; if (fing > .5) { handB = 'point'; rotB = -Math.PI / 2; } }
  const tap = ss(seg(t, 29.3, 29.6)) * (1 - ss(seg(t, 29.8, 30.0)));
  if (tap > 0) { B = [lerp(restB[0], far[0] + 80, tap), lerp(restB[1], far[1] - 62, tap)]; if (tap > .4) { handB = 'point'; rotB = Math.PI; } }
  p.armB = { x: B[0], y: B[1], hand: handB, rot: rotB, front: frontB, flip: handB === 'open', bend: tap > 0 ? -40 : 18 };
  p._spoon = stirring(t) ? [B[0] + PX, B[1] + PY] : null;
  return p;
}
const papiPhone = t => { const a = kf(twos(t), [[25.35, [506, TAB.y - 18]], [25.5, [452, 610]], [32.5, [452, 610]], [33.2, [446, 806]]]); return [a[0], a[1] - 64]; };

// ———————————————————— Léo ————————————————————
function leoPose(t0) {
  const t = twos(t0), b = breath(t0), bt = beats(t);
  const p = { y: FLOOR, x: lerp(LEO_X - 26, LEO_X, ss(seg(t, 1.5, 3.4))) };
  // the collapse onto the table, and getting back up
  const down = kf(t, [[T_FALL, 0], [T_FALL + .16, .62], [12.0, .62], [12.3, .14], [15.9, .14], [16.2, 0]]);
  const fallSq = env(t, T_FALL + .14, T_FALL + .5, .03, .3);
  p.lean = down + (at(t, 1.5, T_FALL) ? Math.sin(t * Math.PI * 2) * .07 : 0);
  p.sy = 1 + .028 * b - .1 * fallSq; p.sx = 1 - .017 * b + .1 * fallSq;
  const lying = at(t, T_FALL + .1, 12.05), upset = at(t, 12.0, 16.0);
  let hop = 0; if (at(t, 14.3, 15.7)) hop = Math.abs(Math.sin(Math.PI * bt * 2)) * 10;
  p.y -= hop; p.phones = hop * .5 + (at(t, 0, T_FALL) ? -6 : 0);
  p.turn = kf(t, [[1.0, .1], [1.3, .55], [T_FALL, .55], [T_FALL + .15, .2], [12.0, .2], [12.3, .55], [34.6, .55], [34.9, .15]]);
  const lk = kf(t, [[1.0, [-.2, .85]], [1.3, [.75, -.3]], [T_FALL, [.75, -.3]], [T_FALL + .15, [0, .9]], [12.0, [0, .9]], [12.3, [.8, -.35]], [24.7, [.8, -.35]], [24.9, [.9, .2]], [25.4, [.8, -.5]], [34.4, [.8, -.4]], [34.9, [-.2, .85]]]);
  p.look = { lx: lk[0], ly: lk[1] };
  p.eyes = step(t, [[0, 'open'], [1.3, 'wide'], [T_FALL + .1, 'squeeze'], [12.0, 'wide'], [16.0, 'open'], [30.0, 'wide'], [32.5, 'open'], [35.1, 'happy']], 'open');
  p.brows = step(t, [[0, 'sad'], [T_FALL + .1, null], [12.0, 'angry'], [16.0, 'sad'], [23.0, 'flat'], [25.3, 'up'], [30.0, 'sad'], [32.5, 'up']], 'sad');
  p.mouth = { type: step(t, [[0, 'frown'], [1.3, 'wavy'], [T_FALL + .1, 'frown'], [12.0, 'o'], [16.0, 'frown'], [23.0, 'flat'], [29.7, 'smile'], [34.9, 'grin']], 'frown') };
  p.talk = lying && t > T_FALL + .3 ? talkOf('leo', t) * .7 : talkOf('leo', t);
  p.hair = kf(t, [[1.0, -.4], [1.3, .2], [T_FALL, .2], [T_FALL + .15, -.5], [12.0, -.5], [12.1, 1], [15.9, .8], [16.2, -.2], [29.6, -.2], [29.9, .2], [34.9, .2], [35.0, .9]]);
  if (!lying) for (const tb of [2.4, 18.0, 21.2, 27.0, 33.6]) if (at(t, tb, tb + .16)) p.lid = 1;
  // the phone hand
  const chest = [-14, -112], low = [-36, -150], flung = [-16, -306], give = [506 - LEO_X, TAB.y - 26 - FLOOR], take = [446 - 16 - LEO_X, 806 - FLOOR];
  const a = kf(t, [[1.0, chest], [1.4, [-40, -246]], [T_FALL, [-40, -246]], [T_FALL + .16, flung], [12.0, flung], [12.3, [-44, -250]], [15.8, [-44, -250]], [16.2, low], [24.6, low], [T_GIVE, give], [T_GIVE + .1, give], [25.6, [-50, -88]], [34.2, [-50, -88]], [T_BACK, take], [34.85, chest]]);
  const has = t < T_GIVE || t >= T_BACK, shake = at(t, 1.4, T_FALL) || at(t, 12.3, 15.8) ? [(hash(Math.floor(t * 12)) - .5) * 12, (hash(Math.floor(t * 12) + 7) - .5) * 10] : [0, 0];
  p.phone = has ? { rot: t < 1.4 || t >= 34.6 ? .12 : lying ? -.5 : -.2, n: likes(t) } : null;
  p.armA = { x: a[0] + shake[0], y: a[1] + shake[1], front: t < 1.5 || lying || at(t, 24.6, 25.6) || t >= 34.2, hand: has ? 'grab' : 'open', bend: at(t, 24.6, 25.6) || at(t, 34.2, 34.6) ? 22 : undefined };
  const rest = [52, -88];
  const c = kf(t, [[1.3, rest], [1.6, [74, -214]], [T_FALL, [74, -214]], [T_FALL + .16, [44, -290]], [12.0, [44, -290]], [12.3, [84, -196]], [14.2, [84, -196]], [14.4, [118, -236]], [15.7, [118, -236]], [16.2, rest], [30.0, rest], [30.3, [10, -106]], [32.4, [10, -106]], [32.6, rest]]);
  p.armB = { x: c[0], y: c[1] + (at(t, 1.6, T_FALL) || at(t, 14.4, 15.7) ? Math.sin(t * Math.PI * 6) * 12 : 0), hand: 'open', front: lying || at(t, 30.0, 32.5) };
  return p;
}
const leoPhone = t => { const p = leoPose(t); return [p.x + p.armA.x, p.y + p.armA.y - 22]; };

// ———————————————————— cameras ————————————————————
function camOf(t) {
  const i = shotAt(t);
  if (i === 0) { const k = eo(seg(t, 0, 1.0)); return { x: 318, y: lerp(862, 850, k), z: lerp(5.2, 4.2, k) }; }
  if (i === 1) { const k = ss(seg(t, 1.0, 6.0)); return { x: lerp(530, 545, k), y: 730, z: lerp(1.5, 1.62, k) }; }
  if (i === 2) return { x: 690, y: 690, z: lerp(2.05, 2.15, seg(t, 6, 12)) };
  if (i === 3) return { x: 400, y: 800, z: 2.45 };
  if (i === 4) { const k = seg(t, 16, 23); return { x: 720, y: lerp(680, 665, k), z: lerp(2.1, 2.3, k) }; }
  if (i === 5) return { x: 640, y: 720, z: 1.95 };
  if (i === 6) { const k = eo(seg(t, 25.5, 26.5)); return { x: 600, y: 650, z: lerp(2.0, 1.85, k) }; }
  if (i === 7) { const k = seg(t, 30, 32.5); return { x: 345, y: lerp(815, 800, k), z: lerp(2.6, 2.9, ss(k)) }; }
  const k = ss(seg(t, 32.5, 35.2)); return { x: lerp(540, 520, k), y: lerp(740, 770, k), z: lerp(1.6, 1.9, k) };
}
const toScreen = (c, x, y) => [540 + (x - c.x) * c.z, 960 + (y - c.y) * c.z];

// ———————————————————— one frame ————————————————————
export function drawScene(t, nosub) {
  const sg = SG, c = camOf(t), b = breath(t), bt = beats(twos(t));
  drawBG(sg, BG, c, b * .005);
  T.frame(t); T.transform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z);
  if (at(t, 30.0, 32.5)) {   // the window light, for the boy
    const [hx, hy] = toScreen(c, 562, 420); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(hx, hy); sg.rotate(Math.floor(t * 12) * .012);
    sg.fillStyle = `rgba(252,251,247,${.05 + .15 * ss(seg(t, 30.2, 31.0))})`;
    for (let i = 0; i < 12; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.arc(0, 0, 2400, i * Math.PI / 6, i * Math.PI / 6 + Math.PI / 12); sg.closePath(); sg.fill(); }
    sg.restore();
  }
  if (at(t, 25.5, 30.0)) {   // the screen's glow
    const o = papiPhone(t), [hx, hy] = toScreen(c, o[0], o[1]), g = sg.createRadialGradient(hx, hy, 20, hx, hy, 420);
    g.addColorStop(0, 'rgba(252,251,247,.34)'); g.addColorStop(1, 'rgba(252,251,247,0)'); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = g; sg.fillRect(0, 0, 1080, 1920); sg.restore();
  }
  wallClock(b, t, bt); flourJar(b); hangingPans(b, t);
  const pp = papiPose(t);
  papi(pp);
  table(b);
  cup(t, b);
  if (pp._spoon) T.stroke([[pp._spoon[0], pp._spoon[1] + 6], [CUPX + (pp._spoon[0] - CUPX) * .5, TAB.y - 40]], T.S.lw * .9, { line: P.light });
  leo(leoPose(t));
  const pk = popK(t); if (pk >= 0) { const o = t < 32 ? papiPhone(t) : leoPhone(t); likePop(o[0], o[1] - (t < 32 ? 0 : 14), pk, t < 32 ? 1 : .45); }
  if (at(t, T_FALL + .14, T_FALL + .4)) { const k = (t - T_FALL - .14) / .26; for (const s of [-1, 1]) T.stroke([[470 + s * (60 + 40 * k), TAB.y - 14 - 30 * k], [470 + s * (90 + 60 * k), TAB.y - 30 - 50 * k]], T.S.lw * .8); }   // impact lines
  irisMask(t, c);
  if (!nosub) subtitles(t);
}

// iris in on the heart, iris out on the heart
function irisMask(t, c) {
  let r = -1, cx = 540, cy = 960;
  if (t < .8) { r = 150 + 1500 * Math.pow(seg(t, 0, .75), 1.7); const o = leoPhone(t);[cx, cy] = toScreen(c, o[0], o[1] - 8); }
  else if (t >= T_IRIS[0]) { const k = seg(t, T_IRIS[0], T_IRIS[1]); r = t >= T_IRIS[1] + .25 ? 0 : Math.max(86, 1500 * Math.pow(1 - k, 1.8)); const o = leoPhone(t);[cx, cy] = toScreen(c, o[0], o[1] - 8); }
  if (r < 0) return;
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
