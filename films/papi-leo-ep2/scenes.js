// scenes.js — episode 2 « Le GPS »: the performance (a pure function of t), the map, the table, the cameras, the iris and the title cards.
// Characters act on twos (tq); cameras move on ones (t).
import * as T from './toon.js';
import { P } from './parts.js';
import { papi, leo } from './people.js';
import { drawBG, hangingPans, wallClock, flourJar, FLOOR } from './kitchen.js';
import { BEAT, DUR, LINES, SUBS, CUTS, UNFOLD, FOLD, T_POCKET, T_PHONE, T_IRIS, shotAt, beats } from './story.js';
import { clamp, lerp, seg, ss, eo, env, hash } from '/core/lib.js';

let BG, SG, LIP;
export function initScenes(bg, sg, lip) { BG = bg; SG = sg; LIP = lip; }

const PX = 700, PY = 936, LEO_X = 290, TAB = { x0: 430, x1: 950, y: 830 }, MAPX = 690, PW = 62, PHONE = { x: 468, y: 824 };
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

// ———————————————————— the map ————————————————————
// n panels (fractional while one pops open), height h, dr = droop of the right corner when a hand lets go
function mapState(t) {
  let n = 1; for (const u of UNFOLD) if (t >= u) n += clamp((t - u) / .1, 0, 1) * (1 + .25 * Math.sin(Math.PI * clamp((t - u) / .2, 0, 1)));
  n = Math.min(n, 6.3);
  if (t >= FOLD[0]) n = lerp(6, 3, eo(seg(t, FOLD[0], FOLD[0] + .12)));
  if (t >= FOLD[1]) n = lerp(3, 1.4, eo(seg(t, FOLD[1], FOLD[1] + .12)));
  const h = kf(t, [[19.2, 118], [19.7, 96], [29.2, 96], [29.4, 14]]);
  const dr = kf(t, [[12.2, 0], [12.4, 1], [16.5, 1], [16.9, 0]]);
  return { n, h, dr, w: n * PW };
}
function drawMap(m) {
  const { n, h, dr, w } = m, x0 = MAPX - w / 2, by = TAB.y - 2, k = Math.ceil(n - 1e-6), flat = h < 30;
  const xs = []; for (let i = 0; i <= k; i++) xs.push(x0 + Math.min(i * PW, w));
  const zig = i => (flat ? 0 : (i % 2 ? 5 : -5)), sag = x => dr * 24 * Math.pow(clamp((x - MAPX) / (w / 2 + 1), 0, 1), 2);
  const top = xs.map((x, i) => [x, by - h + zig(i) + sag(x)]), bot = xs.map((x, i) => [x, by + zig(i) * .5]).reverse();
  T.shape([...top, ...bot], {
    fill: P.paper, shade: () => {
      if (flat) return;
      const Y = v => by - h * v, lw = T.S.lw;
      T.stroke(T.spline([[MAPX - 200, Y(.25)], [MAPX - 120, Y(.4)], [MAPX - 50, Y(.3)], [MAPX + 30, Y(.62)], [MAPX + 110, Y(.5)], [MAPX + 200, Y(.78)]], false, 6), lw * 1.1, { line: P.dmid, boil: .4 });
      T.stroke(T.spline([[MAPX - 150, Y(.95)], [MAPX - 90, Y(.6)], [MAPX - 50, Y(.3)]], false, 6), lw * .6, { line: P.mid, boil: .4 });
      T.stroke(T.spline([[MAPX + 30, Y(.62)], [MAPX + 60, Y(.2)], [MAPX + 150, Y(.12)]], false, 6), lw * .6, { line: P.mid, boil: .4 });
      for (let i = 0; i < 9; i++) T.dot(MAPX - 130 + i * 15, Y(.72 + .12 * Math.sin(i * .9)), 2.6, P.dark);          // a dotted route
      for (const [cx, cy] of [[MAPX - 120, .4], [MAPX + 110, .5], [MAPX - 50, .3]]) T.shape(T.ell(cx, Y(cy), 6, 6, 10), { fill: P.white, lw: lw * .5, boil: .3 });   // towns
      const X = [MAPX, Y(.55)]; T.stroke([[X[0] - 9, X[1] - 9], [X[0] + 9, X[1] + 9]], lw * .9, { boil: .3 }); T.stroke([[X[0] - 9, X[1] + 9], [X[0] + 9, X[1] - 9]], lw * .9, { boil: .3 });   // the X
      for (let i = 1; i < k; i++) T.stroke([[xs[i], by - h + zig(i) + sag(xs[i])], [xs[i], by + zig(i) * .5]], lw * .4, { line: P.mid, boil: .2 });   // folds
    }
  });
  return { tl: top[0], tr: top[top.length - 1] };
}
const MAP_X_MARK = t => [MAPX, TAB.y - 2 - mapState(t).h * .55];

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
function phoneFlat() { T.shape(T.rr(PHONE.x - 34, PHONE.y - 9, 68, 13, 5), { fill: P.white, lw: T.S.lw * .8 }); T.stroke([[PHONE.x - 24, PHONE.y - 3], [PHONE.x + 18, PHONE.y - 3]], T.S.lw * .5, { line: P.mid }); }

// ———————————————————— Papi (seated) ————————————————————
function papiPose(t0, m) {
  const t = twos(t0), b = breath(t0);
  const p = { x: PX, y: PY, seated: true };
  p.turn = kf(t, [[12.0, -.12], [12.25, -.35], [13.4, -.35], [13.6, 0], [14.4, 0], [14.6, -.35], [19.0, -.35], [19.4, -.62], [23.9, -.62], [28.0, -.5]]);
  let lk = kf(t, [[12.0, [-.1, .85]], [12.25, [-.7, 0]], [13.4, [-.7, 0]], [13.6, [0, 0]], [14.4, [0, 0]], [14.6, [-.7, 0]], [19.0, [-.7, 0]], [19.4, [-.6, -.6]], [23.9, [-.6, -.6]], [28.0, [-.8, .3]], [28.3, [-.2, .8]], [29.4, [-.2, .8]], [29.6, [-.8, .3]]]);
  if (at(t, 13.75, 14.1)) lk = [.6, -.15];   // one sideways glance in the silence
  p.look = { lx: lk[0], ly: lk[1] };
  p.lid = kf(t, [[5.9, .4], [6.0, .5], [8.55, .5], [8.65, 1], [8.9, 1], [9.0, .5], [12.0, .5], [12.2, .28], [13.4, .28], [13.6, .5], [14.4, .5], [14.6, .3], [15.9, .3], [16.1, .45], [19.0, .45], [19.4, .18], [28.0, .18], [28.2, .3]]);
  for (const tb of [3.4, 10.5, 17.9, 21.4, 26.3]) if (at(t, tb, tb + .16)) p.lid = 1;
  const lecture = env(t, 12.3, 13.4, .12, .15) * .7, one = env(t, 13.5, 14.4, .1, .15), tender = Math.max(ss(seg(t, 19.2, 19.8)) * (1 - ss(seg(t, 27.9, 28.1))) * .8, ss(seg(t, 28.0, 28.4)) * .4);
  p.brows = [{ raise: lecture, tilt: tender }, { raise: Math.max(lecture, one), tilt: tender }];
  p.stache = kf(t, [[5.9, 0], [6.0, -.4], [11.9, -.4], [12.2, 0], [15.9, 0], [16.05, .85], [16.9, .5], [19.0, .2], [19.5, .4], [27.9, .4], [28.2, .7]]);
  p.tremble = at(t, 22.7, 23.5) ? Math.sin(t * Math.PI * 12) * 5 : 0;
  if (t >= 32.3) p.eyes = 'happy';
  p.talk = talkOf('papi', t);
  p.sy = 1 + .028 * b; p.sx = 1 - .017 * b;
  // hands: on the map's top corners; one leaves for the raised finger; then they fold it and rest
  const L = v => [v[0] - PX, v[1] - PY], top = TAB.y - 2 - m.h, cA = L([MAPX - m.w / 2 + 6, top + 6]), cB = L([MAPX + m.w / 2 - 6, top + 6 + m.dr * 20]);
  const restA = L([MAPX - 30, TAB.y - 12]), restB = L([MAPX + 34, TAB.y - 12]);
  const flatK = ss(seg(t, 29.2, 29.45));
  p.armA = { x: lerp(cA[0], restA[0], flatK), y: lerp(cA[1], restA[1], flatK), hand: flatK > .5 ? 'open' : 'grab', rot: lerp(-.2, .5, flatK), front: true, flip: false, bend: -20 };
  let B = [lerp(cB[0], restB[0], flatK), lerp(cB[1], restB[1], flatK)], handB = flatK > .5 ? 'open' : 'grab', rotB = lerp(Math.PI + .2, Math.PI - .5, flatK);
  const fing = ss(seg(t, 12.2, 12.45)) * (1 - ss(seg(t, 16.5, 16.9)));
  if (fing > 0) { const wag = at(t, 14.5, 15.8) ? Math.sin(t * Math.PI * 4) * 8 : 0; B = [lerp(B[0], 152 + wag, fing), lerp(B[1], -318, fing)]; if (fing > .5) { handB = 'point'; rotB = -Math.PI / 2; } }
  const tap = ss(seg(t, 30.2, 30.5)) * (1 - ss(seg(t, 30.9, 31.2)));
  if (tap > 0) { const dn = at(t, 30.5, 30.62) ? 8 : 0; B = [lerp(B[0], 96, tap), lerp(B[1], TAB.y - 44 - PY + dn, tap)]; if (tap > .5) { handB = 'point'; rotB = Math.PI / 2; } }
  p.armB = { x: B[0], y: B[1], hand: handB, rot: rotB, front: true, flip: handB !== 'point', bend: 20 };
  p.held = () => { T.push(); T.translate(-PX, -PY); p._corners = drawMap(m); T.pop(); };
  return p;
}

// ———————————————————— Léo ————————————————————
function leoPose(t0) {
  const t = twos(t0), b = breath(t0), bt = beats(t);
  const p = { y: FLOOR };
  p.x = lerp(-90, LEO_X, seg(t, 1.5, 2.35));
  const walking = t < 2.35, skid = env(t, 2.35, 2.7, .04, .25);
  if (walking) { p.run = 1; p.runPh = t * Math.PI * 4; p.lean = .08; }
  if (skid) { p.lean = -.16 * skid; p.sx = 1 + .07 * skid; p.sy = 1 - .06 * skid; }
  let hop = 0;
  if (at(t, 9.2, 10.0)) hop = Math.abs(Math.sin(Math.PI * bt * 2)) * 12;
  if (at(t, 10.9, 11.9)) hop = Math.abs(Math.sin(Math.PI * bt * 2)) * 9;
  p.y -= hop; p.phones = hop * .5;
  if (!walking && !skid) { p.sy = 1 + .028 * b; p.sx = 1 - .017 * b; }
  const crossed = at(t, 17.0, 19.0);
  if (crossed) p.headRot = .1;
  p.turn = kf(t, [[23.9, .55], [24.0, .1], [24.9, .1], [25.1, .55]]);
  const lk = kf(t, [[2.3, [.8, 0]], [2.6, [.85, .15]], [4.6, [.85, .15]], [4.9, [.75, -.3]], [23.9, [.75, -.3]], [24.0, [-.1, .85]], [24.9, [-.1, .85]], [25.1, [.75, -.45]], [31.2, [.75, -.45]], [31.5, [.6, .3]], [32.2, [.7, .2]], [32.5, [.75, -.4]]]);
  p.look = { lx: lk[0], ly: lk[1] };
  p.eyes = step(t, [[2.35, 'wide'], [6.0, 'open'], [9.0, 'wide'], [12.0, 'open'], [25.0, 'wide'], [27.6, 'open'], [32.4, 'happy']], 'open');
  p.lid = crossed ? .36 : 0;
  p.brows = step(t, [[1.5, 'up'], [6.0, 'flat'], [9.0, 'up'], [12.0, 'flat'], [24.9, 'sad'], [27.6, 'up']], 'up');
  p.browUp = at(t, 9.0, 12.0) ? 1 : 0;
  p.mouth = { type: step(t, [[1.5, 'smile'], [2.35, 'o'], [6.0, 'flat'], [9.0, 'o'], [12.0, 'flat'], [16.0, 'smile'], [17.0, 'flat'], [19.0, 'flat'], [27.5, 'smile'], [32.3, 'grin']], 'smile') };
  p.talk = talkOf('leo', t);
  p.hair = kf(t, [[2.3, 0], [2.4, .7], [5.9, .5], [6.0, 0], [8.9, 0], [9.0, 1], [11.9, .8], [12.0, 0], [17.0, 0], [17.1, -.3], [19.0, 0]]);
  for (const tb of [7.4, 13.0, 15.2, 21.0, 29.9]) if (at(t, tb, tb + .16)) p.lid = 1;
  // the phone hand
  const low = [-36, -150], pocket = [2, -86], reach = [PHONE.x - LEO_X, PHONE.y - 8 - FLOOR];
  const a = kf(t, [[4.6, low], [4.9, [-46, -254]], [5.9, [-46, -254]], [6.2, low], [16.9, low], [17.1, [26, -96]], [18.95, [26, -96]], [19.2, low], [23.8, low], [24.0, [-14, -112]], [T_POCKET[0], [-14, -112]], [T_POCKET[1], pocket], [25.3, pocket], [25.7, [-50, -88]], [31.2, [-50, -88]], [T_PHONE[0] + .15, pocket], [T_PHONE[0] + .3, pocket], [T_PHONE[1], reach], [32.25, reach], [32.6, [-50, -88]]]);
  const hasPhone = (t < T_POCKET[1] - .05 && !crossed) || at(t, T_PHONE[0] + .2, T_PHONE[1]);
  p.phone = hasPhone ? { rot: at(t, 23.9, 24.9) ? .12 : t > 31 ? lerp(-.2, 1.45, ss(seg(t, T_PHONE[0] + .3, T_PHONE[1]))) : -.2 } : null;
  p.armA = { x: a[0], y: a[1], front: crossed || at(t, 23.9, 25.6) || at(t, 31.2, 32.7), hand: hasPhone || crossed ? 'grab' : 'open', bend: at(t, 31.5, 32.4) ? 22 : undefined, rot: crossed ? .3 : undefined };
  // the other hand: points at the map, flies up in shock, crosses
  const rest = [52, -88];
  const c = kf(t, [[2.4, rest], [2.65, [106, -166]], [4.6, [106, -166]], [4.9, rest], [9.0, rest], [9.15, [72, -214]], [11.8, [72, -214]], [12.0, rest], [16.9, rest], [17.1, [-26, -90]], [18.95, [-26, -90]], [19.2, rest]]);
  p.armB = { x: c[0], y: c[1] + (at(t, 9.1, 11.8) ? Math.sin(t * Math.PI * 6) * 8 : 0), hand: at(t, 2.6, 4.7) ? 'point' : crossed ? 'fist' : 'open', rot: at(t, 2.6, 4.7) ? -.05 : crossed ? Math.PI - .3 : undefined, front: crossed };
  return p;
}

// ———————————————————— cameras ————————————————————
function camOf(t) {
  const i = shotAt(t);
  if (i === 0) { const k = eo(seg(t, 0, 1.5)); return { x: MAPX, y: lerp(770, 740, k), z: lerp(3.0, 2.3, k) }; }
  if (i === 1) { const k = ss(seg(t, 1.5, 6.0)); return { x: lerp(530, 545, k), y: 730, z: lerp(1.5, 1.62, k) }; }
  if (i === 2) return { x: 700, y: 690, z: lerp(2.1, 2.18, seg(t, 6, 9)) };
  if (i === 3) return { x: 300, y: 790, z: 2.8 };
  if (i === 4) { const k = seg(t, 12, 17); return { x: 720, y: lerp(680, 665, k), z: lerp(2.1, 2.3, k) }; }
  if (i === 5) return { x: 300, y: 800, z: 2.6 };
  if (i === 6) { const k = seg(t, 19, 24); return { x: lerp(680, 672, k), y: lerp(660, 648, k), z: lerp(2.6, 2.95, ss(k)) }; }
  if (i === 7) { const k = seg(t, 24, 28); return { x: 300, y: lerp(820, 800, k), z: lerp(2.6, 2.9, ss(k)) }; }
  const k = ss(seg(t, 28, 32.5)); return { x: lerp(535, 550, k), y: lerp(740, 760, k), z: lerp(1.6, 1.85, k) };
}
const toScreen = (c, x, y) => [540 + (x - c.x) * c.z, 960 + (y - c.y) * c.z];

// ———————————————————— one frame ————————————————————
export function drawScene(t, nosub) {
  const sg = SG, c = camOf(t), b = breath(t), bt = beats(twos(t)), memory = at(t, 19.0, 24.0);
  drawBG(sg, BG, c, b * .005);
  T.frame(t); T.transform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z);
  if (memory) {   // the window light fans out as he remembers
    const [hx, hy] = toScreen(c, 562, 420); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(hx, hy); sg.rotate(Math.floor(t * 12) * .012);
    sg.fillStyle = `rgba(252,251,247,${.05 + .17 * ss(seg(t, 19.6, 20.6))})`;
    for (let i = 0; i < 12; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.arc(0, 0, 2000, i * Math.PI / 6, i * Math.PI / 6 + Math.PI / 12); sg.closePath(); sg.fill(); }
    sg.restore();
  }
  wallClock(b, t, bt); flourJar(b); hangingPans(b, t);
  const m = mapState(twos(t) < 1.5 ? t : twos(t));
  papi(papiPose(t, m));
  table(b);
  if (t >= T_PHONE[1]) phoneFlat();
  if (t >= 1.5) leo(leoPose(t));
  // paper puffs when a panel snaps open or shut
  for (const u of [...UNFOLD, ...FOLD]) { const a = t - u; if (a >= 0 && a < .17) { const k = a / .17, s = u < 5 ? 1 : -1; for (const sx of [-1, 1]) T.stroke([[MAPX + sx * (m.w / 2 + 10 + 22 * k), TAB.y - 40 - m.h * .5 - 16 * k], [MAPX + sx * (m.w / 2 + 26 + 30 * k), TAB.y - 40 - m.h * .5 - 30 * k * s]], T.S.lw * .7); } }
  irisMask(t, c);
  if (!nosub) subtitles(t);
}

// iris in on the X of the map, iris out on the phone left on the table
function irisMask(t, c) {
  let r = -1, cx = 540, cy = 960;
  if (t < 1.0) { r = 120 + 1500 * Math.pow(seg(t, 0, .9), 1.7); const o = MAP_X_MARK(t);[cx, cy] = toScreen(c, o[0], o[1]); }
  else if (t >= T_IRIS[0]) { const k = seg(t, T_IRIS[0], T_IRIS[1]); r = t >= T_IRIS[1] + .25 ? 0 : Math.max(70, 1500 * Math.pow(1 - k, 1.8));[cx, cy] = toScreen(c, PHONE.x, PHONE.y - 4); }
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
