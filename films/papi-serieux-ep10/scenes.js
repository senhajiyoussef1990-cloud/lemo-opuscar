// scenes.js — episode 10 « La livraison »: the performance (a pure function of t), the newspaper, the map on the screen, the flour jar, the dough and the pizza, the cameras, the iris, the title cards.
// Characters act on twos (tq); cameras move on ones (t).
import * as T from './toon.js';
import { P, glove, hose } from './parts.js';
import { papi, leo } from './people.js';
import { PICTO } from './pictos.js';
import { drawBG, hangingPans, wallClock, flourJar, FLOOR } from './kitchen.js';
import { BEAT, DUR, LINES, SUBS, CUTS, T_LOWER, T_STOP, T_GLASS, T_GRAB, T_SLAM, T_IRIS, shotAt, beats } from './story.js';
import { clamp, lerp, seg, ss, eo, env, hash, back } from '/core/lib.js';

let BG, SG, LIP;
export function initScenes(bg, sg, lip) { BG = bg; SG = sg; LIP = lip; }

const PX = 700, PY = 936, LEO_X = 300, TAB = { x0: 430, x1: 950, y: 830 }, SHELF = [340, 566], JAR_TABLE = [812, 830];
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

// ———————————————————— the newspaper ————————————————————
function paperState(t) {
  const h = kf(t, [[T_LOWER[0], 258], [T_LOWER[1], 118], [20.75, 118], [21.0, 14]]), cx = kf(t, [[20.75, PX], [21.0, 858]]), sx = 1;
  return { h, cx, w: (h < 30 ? 170 : 250) * sx, by: TAB.y - 2 };
}
function drawPaper(m, wob = 0) {
  const { h, cx, w, by } = m, x0 = cx - w / 2, top = by - h + wob;
  T.shape(T.rect(x0, top, w, h - wob), {
    fill: P.paper, shade: () => {
      if (h < 60) return;
      const lw = T.S.lw, k = w / 250;
      if (h > 200) { T.text('LE JOURNAL', cx, top + 30, { font: `${Math.round(27 * Math.min(1, k + .05))}px Limelight`, fill: P.ink }); T.stroke([[x0 + 14 * k, top + 52], [x0 + w - 14 * k, top + 52]], lw * .7, { boil: .2 }); T.stroke([[x0 + 14 * k, top + 59], [x0 + w - 14 * k, top + 59]], lw * .35, { boil: .2 }); }
      const y0 = h > 200 ? top + 74 : top + 14;
      T.shape(T.rect(x0 + 16 * k, y0, 96 * k, 62), { fill: P.light, lw: lw * .5, boil: .2 });
      for (let i = 0; i < 9; i++) { const y = y0 + 6 + i * 13; if (y > by - 10) break; T.stroke([[x0 + (i < 5 ? 126 : 16) * k, y], [x0 + w - (i % 3 === 2 ? 40 : 16) * k, y]], lw * .45, { line: P.mid, boil: .2 }); }
      for (let i = 0; i < 7; i++) { const y = y0 + 76 + i * 13; if (y > by - 10) break; T.stroke([[x0 + 16 * k, y], [x0 + 116 * k, y]], lw * .45, { line: P.mid, boil: .2 }); }
    }
  });
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


// ———————————————————— the map on the screen: streets, the route, the scooter ————————————————————
// drawn in a w×h box whose top-left corner is (x0, y0); prog = how far along the route the scooter is (0..1)
const ROUTE = [[.1, .82], [.1, .55], [.42, .55], [.42, .28], [.78, .28], [.78, .12]];
function routeAt(p) { const n = ROUTE.length - 1, f = clamp(p) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i; return [lerp(ROUTE[i][0], ROUTE[i + 1][0], u), lerp(ROUTE[i][1], ROUTE[i + 1][1], u)]; }
function mapView(x0, y0, w, h, prog, lw, glass = -1, jitter = 0) {
  const X = u => x0 + u * w, Y = v => y0 + v * h;
  T.shape(T.rect(x0, y0, w, h), { fill: P.pale, stroke: false, boil: 0 });
  for (const [a, b, c, d] of [[.02, .06, .3, .4], [.5, .06, .2, .14], [.5, .36, .44, .12], [.18, .64, .16, .3], [.52, .64, .42, .3], [.02, .64, .0, 0]]) if (c) T.shape(T.rr(X(a), Y(b), c * w, d * h, lw * 2), { fill: P.light, stroke: false, boil: 0 });
  for (const v of [.55, .28]) T.stroke([[X(0), Y(v)], [X(1), Y(v)]], lw * 2.2, { line: P.white, boil: 0 });
  for (const u of [.1, .42, .78]) T.stroke([[X(u), Y(0)], [X(u), Y(1)]], lw * 2.2, { line: P.white, boil: 0 });
  const n = 26; for (let i = 0; i <= n; i++) { const q = routeAt(i / n); if (i / n > prog) T.dot(X(q[0]), Y(q[1]), lw * .55 / T.zoom(), P.dmid); }   // what is left of the route
  const hx = X(.78), hy = Y(.1); T.shape([[hx - w * .05, hy], [hx, hy - h * .06], [hx + w * .05, hy], [hx + w * .05, hy + h * .06], [hx - w * .05, hy + h * .06]], { fill: P.ink, stroke: false, boil: .3 });   // home
  const s = routeAt(prog); PICTO.scooter(X(s[0]) + jitter, Y(s[1]) - h * .03, w * .075);
  if (glass >= 0) { const k = glass < .2 ? back(glass / .2, 2.6) : 1; PICTO.hourglass(X(s[0]) + w * .2, Y(s[1]) - h * .1, w * .07 * k); }
}
const progAt = t => .08 + .5 * seg(t, 8.5, T_STOP) * (.55 + .45 * seg(t, 21.0, T_STOP)) ;
function mapCard(x, y, k, t) {
  T.push(); T.translate(x, y); T.rotate(-.05); T.scale(k);
  T.shape(T.rr(-88, -70, 176, 140, 12), { fill: P.white, lw: T.S.lw * .8 });
  mapView(-78, -60, 156, 120, progAt(t), 1.6, -1, Math.sin(t * 40) * .6);
  T.pop();
}

// ———————————————————— the flour jar, the dough, the rolling pin, the pizza ————————————————————
function jarAt(x, y, sq = 0) {
  T.push(); T.translate(x, y); T.scale(1 + sq * .5, 1 - sq);
  T.shape(T.rr(-34, -86, 68, 86, 12), { fill: P.white }); T.shape(T.rr(-38, -100, 76, 18, 6), { fill: P.dark });
  T.text('FARINE', 0, -42, { font: '15px Limelight', fill: P.ink }); T.stroke([[-24, -28], [24, -28]], T.S.lw * .5, { boil: .3 });
  T.pop();
}
function puff(x, y, k, n = 5, spread = 60) { for (let i = 0; i < n; i++) { const a = (i / (n - 1) - .5) * 2.2 - Math.PI / 2, r = spread * k; T.shape(T.ell(x + Math.cos(a) * r, y + Math.sin(a) * r * .7, 10 + 14 * k, 8 + 10 * k), { fill: P.white, lw: T.S.lw * .5, alpha: 1 - k }); } }
function dough(x, w) { T.shape(T.spline([[x - w, TAB.y], [x - w * .7, TAB.y - 13], [x, TAB.y - 16], [x + w * .7, TAB.y - 13], [x + w, TAB.y], [x, TAB.y + 4]], true, 6), { fill: P.paper, lw: T.S.lw * .8 }); }
function pizza(x, y, k) {
  T.push(); T.translate(x, y); T.scale(k);
  T.shape(T.ell(0, 0, 120, 44), { fill: P.light }); T.shape(T.ell(0, -2, 100, 34), { fill: P.pale, lw: T.S.lw * .6 });
  for (const [dx, dy, r, c] of [[-60, -6, 11, P.dark], [-20, 10, 12, P.dark], [30, -12, 11, P.dark], [62, 6, 10, P.dark], [-34, -16, 7, P.mid], [6, -2, 7, P.mid], [44, 14, 7, P.mid], [-74, 10, 6, P.mid]]) T.shape(T.ell(dx, dy, r, r * .5), { fill: c, lw: T.S.lw * .4 });
  T.pop();
}

// ———————————————————— Papi (seated) ————————————————————
const L2 = v => [v[0] - PX, v[1] - PY];
const jarHand = t => kf(t, [[24.6, [640, TAB.y - 14]], [25.25, [SHELF[0] + 40, SHELF[1] - 46]], [T_GRAB + .1, [SHELF[0] + 40, SHELF[1] - 46]], [26.15, [JAR_TABLE[0] - 196, JAR_TABLE[1] - 150]], [T_SLAM, [JAR_TABLE[0] - 196 + 0, JAR_TABLE[1] - 46]]]);
function papiPose(t0, m) {
  const t = twos(t0), b = breath(t0), baking = at(t, 28.0, 32.5), end = t >= 32.5;
  const p = { x: PX, y: PY, seated: true };
  p.turn = kf(t, [[14.7, 0], [16.8, 0], [17.0, -.3], [21.0, -.35], [24.5, -.4], [24.8, -.7], [25.5, -.7], [26.2, -.2], [28.0, -.3], [32.5, -.3], [32.6, -.15], [35, -.3]]);
  let lk = kf(t, [[14.0, [0, .7]], [14.7, [0, 0]], [16.8, [0, 0]], [17.0, [-.7, 0]], [24.5, [-.8, .2]], [24.8, [-.9, -.5]], [25.5, [-.9, -.5]], [26.2, [.3, .8]], [26.6, [-.8, .2]], [28.0, [-.3, .85]], [32.4, [-.3, .85]], [32.6, [0, 0]], [33.2, [-.8, .2]]]);
  if (at(t, 16.2, 16.5)) lk = [.6, -.15];
  p.look = { lx: lk[0], ly: lk[1] };
  p.lid = kf(t, [[14.0, .5], [16.8, .5], [17.0, .4], [21.0, .35], [24.5, .3], [28.0, .3], [32.5, .3], [32.6, .48], [36, .45]]);
  for (const tb of [15.8, 19.0, 23.0, 27.4, 30.2, 34.4]) if (at(t, tb, tb + .16)) p.lid = 1;
  const lecture = env(t, 14.8, 15.7, .1, .15) * .7, one = Math.max(env(t, 15.9, 16.8, .1, .15), end ? .8 : 0);
  p.brows = [{ raise: lecture }, { raise: Math.max(lecture, one) }];
  p.stache = kf(t, [[14.0, -.3], [20.5, -.3], [20.8, 0], [20.9, .9], [21.5, .3], [26.2, .3], [26.4, .6], [28.0, .5], [32.5, .6], [33.2, .9]]);
  if (at(t, 30.9, 32.4)) p.eyes = 'happy';
  p.talk = talkOf('papi', t);
  p.sy = 1 + .028 * b; p.sx = 1 - .017 * b;
  if (at(t, T_SLAM, T_SLAM + .25)) { p.sy -= .06 * (1 - (t - T_SLAM) / .25); p.sx += .04; }
  const side = L2([m.cx - m.w / 2 - 2, m.by - m.h * .55]), restA = L2([640, TAB.y - 14]), restB = L2([852, TAB.y - 16]);
  // rolling pin: both hands, back and forth
  const rollX = 640 + 46 * Math.sin((t - 28.0) * Math.PI * 2 / 1.8), pinY = TAB.y - 34;
  // Léo-side hand: the paper, the long reach to the shelf, the jar; then the pin; then the pizza
  let A = side, handA = 'grab', rotA = -.2, bendA = -18;
  if (t >= 20.8) { A = restA; handA = 'open'; rotA = Math.PI - .35; }
  if (at(t, 24.6, 26.6)) { A = L2(jarHand(t)); handA = 'grab'; rotA = t < 25.8 ? Math.PI + .5 : Math.PI / 2 + .2; bendA = t < 26.0 ? -70 : -20; if (at(t, T_GRAB, T_SLAM)) p.held = (hx, hy) => jarAt(hx + (t < 25.8 ? -40 : 196 - 196), hy + 46); }
  if (baking) { A = L2([rollX - 96, pinY]); handA = 'fist'; rotA = Math.PI / 2; }
  if (end) { A = [-100, -176]; handA = 'open'; rotA = Math.PI * .5 - .5; }
  p.armA = { x: A[0], y: A[1], hand: handA, rot: rotA, front: true, flip: handA === 'grab' && t < 20.8 ? false : handA === 'open' && !end ? false : end, bend: bendA };
  if (baking) p.held = (hx, hy) => { const x = hx + 96; T.shape(T.rr(x - 124, hy - 4, 248, 10, 5), { fill: P.dark }); T.shape(T.rr(x - 84, hy - 15, 168, 32, 14), { fill: P.light }); T.stroke([[x - 60, hy - 6], [x + 60, hy - 6]], T.S.lw * .5, { line: P.white }); };
  if (end) p.held = (hx, hy) => pizza(hx + 100, hy - 14, .98);
  // other hand: the paper, a raised finger, the pin, the pizza
  let B = t < 20.8 ? L2([m.cx + m.w / 2 + 2, m.by - m.h * .55]) : restB, handB = t < 20.8 ? 'grab' : 'open', rotB = t < 20.8 ? Math.PI + .2 : Math.PI - .5;
  const fing = ss(seg(t, 14.6, 14.85)) * (1 - ss(seg(t, 20.4, 20.75)));
  if (fing > 0) { const wag = at(t, 16.9, 20.7) ? Math.sin(t * Math.PI * 4) * 8 : 0; B = [lerp(B[0], 152 + wag, fing), lerp(B[1], -318, fing)]; if (fing > .5) { handB = 'point'; rotB = -Math.PI / 2; } }
  if (baking) { B = L2([rollX + 96, pinY]); handB = 'fist'; rotB = Math.PI / 2; }
  if (end) { B = [100, -176]; handB = 'open'; rotB = Math.PI * .5 + .5; }
  p.armB = { x: B[0], y: B[1], hand: handB, rot: rotB, front: true, flip: handB === 'grab' || (handB === 'open' && !end), bend: 20 };
  return p;
}

// ———————————————————— Léo ————————————————————
function leoPose(t0) {
  const t = twos(t0), b = breath(t0), bt = beats(t), baking = t >= 28.0;
  const p = { y: FLOOR, x: baking ? 372 : lerp(40, LEO_X, ss(seg(t, 0, .7))) };
  if (t < .7) { p.run = 1; p.runPh = t * Math.PI * 4; p.lean = .08; } else { p.sy = 1 + .028 * b; p.sx = 1 - .017 * b; }
  let hop = 0; if (at(t, .8, 4.2)) hop = Math.abs(Math.sin(Math.PI * bt)) * 9; if (at(t, 8.7, 13.5)) hop = Math.abs(Math.sin(Math.PI * bt)) * 7;
  const laugh = at(t, 30.9, 32.4); if (laugh) { const k = Math.floor(t * 12) % 2 ? 1 : -1; p.sy = 1 + .06 * k; p.sx = 1 - .035 * k; hop = k > 0 ? 7 : 0; p.headRot = -.1; }
  p.y -= hop; p.phones = hop * .5;
  p.turn = .55;
  const lk = baking ? kf(t, [[28.0, [.5, .8]], [29.4, [.5, .8]], [29.7, [.85, -.4]], [32.5, [.85, -.4]], [33.0, [.9, .1]]]) : [.75, -.3];
  p.look = { lx: lk[0], ly: lk[1] };
  p.eyes = laugh || t >= 34.6 ? 'happy' : step(t, [[0, 'open'], [8.5, 'wide'], [14.0, 'open'], [32.5, 'wide']], 'open');
  p.brows = laugh ? null : step(t, [[0, 'up'], [4.5, 'flat'], [8.5, 'up'], [14.0, 'flat'], [28.0, 'up']], 'up');
  p.mouth = { type: step(t, [[0, 'grin'], [4.5, 'flat'], [8.5, 'o'], [14.0, 'flat'], [28.0, 'smile'], [30.9, 'beam'], [32.5, 'o'], [34.6, 'grin']], 'grin') };
  p.talk = talkOf('leo', t);
  p.hair = kf(t, [[8.4, 0], [8.5, .7], [13.5, .5], [14.0, 0], [30.9, 0], [31.0, .5], [32.5, .2]]);
  for (const tb of [3.0, 6.6, 12.0, 17.5, 29.0, 33.9]) if (!laugh && at(t, tb, tb + .16)) p.lid = 1;
  if (baking) {   // both hands in the dough
    const pat = (at(t, 28.8, 28.9) || at(t, 30.6, 30.7)) ? 8 : 0, base = [510 - p.x, TAB.y - 24 - FLOOR];
    p.armA = { x: base[0] - 26, y: base[1] + pat, front: true, hand: 'open', rot: Math.PI / 2 - .3, bend: 16 };
    p.armB = { x: base[0] + 22, y: base[1] + (pat ? 0 : 4), front: true, hand: 'open', rot: Math.PI / 2 + .2, bend: 20 };
    return p;
  }
  // the phone hand: raised, proud; then shown to Papi
  const low = [-36, -150];
  const a = kf(t, [[0, low], [.4, low], [.8, [-44, -258]], [4.2, [-44, -258]], [4.6, low], [8.4, low], [8.6, [-14, -112]], [13.8, [-14, -112]], [14.1, low]]);
  p.phone = { rot: at(t, 8.5, 14) ? .12 : -.2, icon: 'scooter' };
  p.armA = { x: a[0], y: a[1], front: at(t, 8.5, 14.0), hand: 'grab' };
  const rest = [52, -88];
  const c = kf(t, [[.7, rest], [1.0, [70, -200]], [4.2, [70, -200]], [4.6, rest], [8.6, rest], [11.3, rest], [11.5, [30, -150]], [13.6, [30, -150]], [14.0, rest]]);
  p.armB = { x: c[0], y: c[1] + (at(t, 1.0, 4.2) ? Math.sin(t * Math.PI * 4) * 8 : 0), hand: at(t, 11.4, 13.8) ? 'point' : 'open', rot: at(t, 11.4, 13.8) ? Math.PI + .5 : undefined, front: at(t, 11.4, 13.8) };
  return p;
}

// ———————————————————— shot 5: the map, full frame ————————————————————
function mapShot(t) {
  const sg = SG, tq = twos(t); sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#8F8C84'; sg.fillRect(0, 0, 1080, 1920);
  T.frame(t);
  T.shape(T.rr(130, 300, 820, 1240, 80), { fill: P.dark });
  const scr = T.shape(T.rr(172, 372, 736, 1096, 30), { fill: P.white, stroke: false, boil: 0 });
  sg.save(); sg.clip(scr);
  const stopped = t >= T_STOP, skid = at(t, T_STOP, T_STOP + .25) ? Math.sin((t - T_STOP) * 60) * 6 * (1 - (t - T_STOP) / .25) : stopped ? 0 : Math.sin(t * 40) * 2;
  mapView(172, 372, 736, 1096, progAt(t), 5, t >= T_GLASS ? t - T_GLASS : -1, skid);
  sg.restore();
  if (t >= T_GLASS + .25) { const s = routeAt(progAt(t)), x = 172 + s[0] * 736 + 150, y = 372 + s[1] * 1096 + 20; T.shape(T.rr(x - 120, y - 34, 240, 68, 20), { fill: P.white, lw: T.S.lw * .8 }); T.text('+ 45 MIN', x, y + 2, { font: '40px Limelight', fill: P.ink }); }
  // Léo, at the bottom of the frame: his shoulders drop
  const sad = ss(seg(tq, T_GLASS, T_GLASS + .6));
  leo({ x: 250, y: 2090 + 40 * sad, k: 2.0, seated: true, turn: .4, look: { lx: .5, ly: -.7 }, eyes: sad > .5 ? 'open' : 'wide', lid: .4 * sad, brows: 'sad', mouth: { type: sad > .5 ? 'frown' : 'o' }, talk: talkOf('leo', tq) * .6, hair: .4 - .9 * sad, phones: -8 * sad, armA: { x: -40, y: -60 }, armB: { x: 40, y: -60 } });
}

// ———————————————————— cameras ————————————————————
function camOf(t) {
  const i = shotAt(t);
  if (i === 0) { const k = ss(seg(t, 0, 4.5)); return { x: lerp(515, 525, k), y: 730, z: lerp(1.45, 1.55, k) }; }
  if (i === 1) return { x: 700, y: 690, z: lerp(2.05, 2.12, seg(t, 4.5, 8.5)) };
  if (i === 2) return { x: 330, y: 790, z: lerp(2.3, 2.4, seg(t, 8.5, 14)) };
  if (i === 3) { const k = seg(t, 14, 21); return { x: 705, y: lerp(685, 668, k), z: lerp(2.1, 2.3, k) }; }
  if (i === 5) return { x: lerp(545, 560, ss(seg(t, 24.5, 28))), y: 690, z: 1.58 };
  if (i === 6) { const k = seg(t, 28, 32.5); return { x: 565, y: lerp(735, 725, k), z: lerp(1.75, 1.9, ss(k)) }; }
  const k = seg(t, 32.5, 36); return { x: lerp(640, 650, k), y: lerp(735, 725, k), z: lerp(1.95, 2.2, ss(k)) };
}
const toScreen = (c, x, y) => [540 + (x - c.x) * c.z, 960 + (y - c.y) * c.z];

// ———————————————————— one frame ————————————————————
export function drawScene(t, nosub) {
  const sg = SG, c = camOf(t), b = breath(t), bt = beats(twos(t)), tq = twos(t);
  if (shotAt(t) === 4) { mapShot(t); if (!nosub) subtitles(t); return; }
  drawBG(sg, BG, c, b * .005);
  T.frame(t); T.transform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z);
  if (t >= 28.0) {   // the window light, once they are baking
    const [hx, hy] = toScreen(c, 562, 420); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(hx, hy); sg.rotate(Math.floor(t * 12) * .01);
    sg.fillStyle = `rgba(252,251,247,${.04 + .13 * ss(seg(t, 28.2, 29.5))})`;
    for (let i = 0; i < 12; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.arc(0, 0, 2400, i * Math.PI / 6, i * Math.PI / 6 + Math.PI / 12); sg.closePath(); sg.fill(); }
    sg.restore();
  }
  wallClock(b, t, bt); hangingPans(b, t);
  if (t < T_GRAB) flourJar(b);
  const m = paperState(at(t, 20.7, 21.0) ? t : tq), pp = papiPose(t, m), up = m.h > 150, baking = at(t, 28.0, 32.5), end = t >= 32.5;
  if (!up) papi(pp); else papi({ ...pp, armA: { ...pp.armA, front: false }, armB: { ...pp.armB, front: false } });
  if (t < 28.0) drawPaper(m, up ? pp.talk * 4 : 0);
  if (up) for (const s of [-1, 1]) { const x = m.cx + s * (m.w / 2 + 2), y = m.by - m.h * .55; T.push(); T.translate(x, y); T.scale(s, 1); T.shape(T.ell(-4, 0, 17, 22), { fill: P.white }); for (const dy of [-12, 0, 12]) T.shape(T.rr(-30, dy - 6, 24, 12, 6), { fill: P.white, lw: T.S.lw * .8 }); T.pop(); }
  table(b);
  if (t >= T_SLAM) { const j = t - T_SLAM; jarAt(JAR_TABLE[0], JAR_TABLE[1], j < .2 ? .12 * (1 - j / .2) : 0); if (j < .5) puff(JAR_TABLE[0], JAR_TABLE[1] - 96, j / .5, 5, 70); }
  if (baking) { dough(620, 120 + 26 * ss(seg(t, 28, 32.5))); }
  leo(leoPose(t));
  if (baking) { for (const u of [28.8, 30.6]) { const j = t - u; if (j >= 0 && j < .45) puff(510, TAB.y - 30, j / .45, 4, 46); } const lp = leoPose(t);   // flour on his nose
    T.dot(lp.x + 14, lp.y - 196 * (lp.sy || 1), 7, P.white); for (const [dx, dy] of [[-22, -180], [34, -176], [2, -232]]) T.dot(lp.x + dx, lp.y + dy, 3, P.white); }
  if (at(t, 9.0, 14.0)) mapCard(196, 812, back(seg(t, 9.0, 9.25), 2.2), t);
  irisMask(t, c);
  if (!nosub) subtitles(t);
}

// no iris at the start (the series opening comes first); iris out on the pizza
function irisMask(t, c) {
  if (t < T_IRIS[0]) return;
  const k = seg(t, T_IRIS[0], T_IRIS[1]), r = t >= T_IRIS[1] ? 0 : 1500 * Math.pow(1 - k, 1.8), [cx, cy] = toScreen(c, PX, PY - 190);
  const sg = SG; sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#060606';
  sg.beginPath(); sg.rect(0, 0, 1080, 1920); if (r > 0) sg.arc(cx, cy, r, 0, Math.PI * 2, true); sg.fill('evenodd');
  if (r > 0) { sg.strokeStyle = 'rgba(0,0,0,.5)'; sg.lineWidth = 10; sg.beginPath(); sg.arc(cx, cy, r + 4, 0, 7); sg.stroke(); }
  sg.restore();
}

// period title card (two lines, drawn in the scene so it weaves with the film): pops on and off
export function subtitles(t) {
  const s = SUBS.find(q => t >= q[0] && t < q[1]); if (!s) return;
  // ?subs=v2 (series rules, v2): the card sits higher and is bigger; it shrinks only when a line would not fit the frame
  const V2 = new URLSearchParams(location.search).get('subs') === 'v2';
  const g = SG, lines = s.slice(2), cx = 540, cy = V2 ? 1340 : 1640; let size = V2 ? 64 : 46;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const fitW = () => { g.font = `${size}px "IM Fell English SC"`; return Math.max(...lines.map(l => g.measureText(l).width)); };
  let tw = fitW(); while (V2 && tw + size * 2.1 > 1020 && size > 40) { size -= 2; tw = fitW(); }
  const w = tw + size * 2.1, h = size * (lines.length === 2 ? 3.15 : 1.95), x0 = cx - w / 2, y0 = cy - h / 2;
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
