// scenes.js — episode 7 « Le mot de passe »: the performance (a pure function of t), the tablet and its password field, the coffee, the cameras, the iris, the title cards.
// Characters act on twos (tq); cameras move on ones (t).
import * as T from './toon.js';
import { P, steam } from './parts.js';
import { papi, leo, heart } from './people.js';
import { drawBG, hangingPans, wallClock, flourJar, FLOOR } from './kitchen.js';
import { BEAT, DUR, LINES, SUBS, CUTS, T_CUP, T_PUSH, TAPS, T_LOCK, T_IRIS, shotAt, beats } from './story.js';
import { clamp, lerp, seg, ss, eo, env, hash, back } from '/core/lib.js';

let BG, SG, LIP;
export function initScenes(bg, sg, lip) { BG = bg; SG = sg; LIP = lip; }

const PX = 700, PY = 936, LEO = [530, 905], TAB = { x0: 430, x1: 950, y: 830 }, CUPX = 800, CHAIR = 530;
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
function cupAt(x, y, t, tilt = 0, withSteam = true) {
  T.push(); T.translate(x, y); T.rotate(tilt);
  T.shape(T.arc(-30, -22, 13, 11, Math.PI * .5, Math.PI * 1.5, 10), { closed: false, lw: T.S.lw * 2.2 });
  T.shape(T.arc(-30, -22, 13, 11, Math.PI * .5, Math.PI * 1.5, 10), { closed: false, lw: T.S.lw * .8, line: P.white });
  T.shape(T.spline([[-28, -40], [-26, -14], [-14, -5], [14, -5], [26, -14], [28, -40]], true, 6), { fill: P.white });
  T.shape(T.ell(0, -40, 28, 6), { fill: P.dark, lw: T.S.lw * .8 });
  T.pop();
  if (withSteam) steam(x, y - 48, 'lazy', twos(t), .55);
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

// ———————————————————— the tablet, flat on the table, and what its screen says ————————————————————
const tabletX = t => lerp(520, 650, ss(seg(t, T_PUSH[0], T_PUSH[1])));
function tablet(x) {
  const y = TAB.y + 1;
  T.shape([[x - 80, y], [x + 80, y], [x + 68, y - 28], [x - 68, y - 28]], { fill: P.dark });
  T.shape([[x - 70, y - 4], [x + 70, y - 4], [x + 61, y - 24], [x - 61, y - 24]], { fill: P.white, stroke: false, boil: .2 });
}
function padlock(x, y, s, shut) {
  T.shape(T.arc(x + (shut ? 0 : s * .5), y - s * .55, s * .5, s * .62, Math.PI, Math.PI * 2, 10), { closed: false, lw: T.S.lw * .9 });
  T.shape(T.rr(x - s * .75, y - s * .55, s * 1.5, s * 1.2, s * .2), { fill: P.ink, stroke: false, boil: .3 });
  T.dot(x, y, s * .16, P.white);
}
// the password field, shown as a card above the tablet: the old password in clear, then one dot per slow tap, then the lock shuts
function field(t, x) {
  const old = at(t, .25, 3.5), neu = t >= 23.5; if (!old && !neu) return;
  const y = TAB.y - 62, k = old ? back(seg(t, .25, .45), 2.2) : back(seg(t, 23.5, 23.7), 2.2), w = old ? 262 : 216, h = 56;
  T.push(); T.translate(x, y); T.scale(k);
  T.shape([[-10, h / 2 - 2], [10, h / 2 - 2], [0, h / 2 + 16]], { fill: P.white, lw: T.S.lw * .7 });
  T.shape(T.rr(-w / 2, -h / 2, w, h, 14), { fill: P.white, lw: T.S.lw * .8 });
  T.shape([[-8, h / 2 - 3], [8, h / 2 - 3], [0, h / 2 + 10]], { fill: P.white, stroke: false, boil: 0 });
  if (old) { padlock(-w / 2 + 28, 6, 12, false); T.text('motdepasse', 22, 2, { font: '26px Limelight', fill: P.ink }); }
  else {
    const shut = t >= T_LOCK, j = t - T_LOCK, pop = j >= 0 && j < .2 ? 1 + .3 * Math.sin(Math.PI * j / .2) : 1;
    padlock(-w / 2 + 28, 6, 12 * pop, shut);
    TAPS.forEach((u, i) => { if (t >= u) { const a = t - u, s = a < .1 ? back(a / .1, 3) : 1; T.dot(-52 + i * 19, 2, 6 * s); } });
    if (!shut && t < TAPS[7] + .3 && Math.floor(t * 4) % 2 === 0) { const n = TAPS.filter(u => t >= u).length; T.stroke([[-62 + n * 19, -12], [-62 + n * 19, 14]], T.S.lw * .5, { boil: 0 }); }   // the cursor
  }
  T.pop();
}

// ———————————————————— Papi (seated) ————————————————————
const L2 = v => [v[0] - PX, v[1] - PY];
function papiPose(t0) {
  const t = twos(t0), b = breath(t0);
  const p = { x: PX, y: PY, seated: true };
  p.turn = kf(t, [[3.4, -.1], [3.5, 0], [7.4, 0], [11.5, -.3], [13.1, -.3], [13.3, 0], [14.4, 0], [14.6, -.3], [18.5, -.4], [22.0, -.4], [22.3, -.62], [23.5, -.62], [23.8, -.2], [26.6, -.2], [26.8, -.4], [30.5, -.5]]);
  let lk = kf(t, [[3.4, [.2, .5]], [3.5, [0, .1]], [7.4, [0, .1]], [11.5, [-.7, 0]], [13.1, [-.7, 0]], [13.3, [0, 0]], [14.4, [0, 0]], [14.6, [-.7, 0]], [18.9, [-.8, .2]], [19.4, [-.6, .8]], [22.0, [-.6, .8]], [22.3, [-.6, -.6]], [23.5, [-.6, -.6]], [23.8, [-.3, .9]], [26.6, [-.3, .9]], [26.8, [-.8, .3]], [35, [-.85, .35]]]);
  if (at(t, 13.8, 14.1)) lk = [.6, -.15];
  p.look = { lx: lk[0], ly: lk[1] };
  p.lid = kf(t, [[3.5, .45], [11.5, .45], [11.9, .28], [13.1, .28], [13.3, .5], [14.4, .5], [14.6, .3], [16.6, .3], [17.0, .42], [18.5, .4], [22.0, .3], [22.3, .15], [23.5, .15], [23.8, .4], [26.6, .4], [26.8, .22], [35, .2]]);
  for (const tb of [2.0, 6.2, 9.4, 15.9, 20.6, 25.1, 29.4, 33.0]) if (at(t, tb, tb + .16)) p.lid = 1;
  const lecture = env(t, 12.1, 13.1, .12, .15) * .7, one = env(t, 13.3, 14.4, .1, .15), think = env(t, 22.3, 23.6, .2, .2) * .5, tender = Math.max(think, ss(seg(t, 30.5, 31.0)) * .75);
  p.brows = [{ raise: lecture, tilt: tender }, { raise: Math.max(lecture, one), tilt: tender }];
  p.stache = kf(t, [[11.5, -.3], [11.9, 0], [16.5, 0], [16.9, .7], [17.55, .7], [17.7, .95], [18.5, .4], [22.0, .2], [26.6, .2], [26.8, .6], [30.5, .5], [31.5, .75], [35, .85]]);
  p.tremble = at(t, 31.0, 31.5) ? Math.sin(t * Math.PI * 12) * 5 : 0;
  if (t >= 34.2) p.eyes = 'happy';
  p.talk = talkOf('papi', t);
  p.sy = 1 + .028 * b; p.sx = 1 - .017 * b;
  // Léo-side hand: at rest, to the moustache while he thinks, then one finger on the tablet
  const restA = L2([612, TAB.y - 14]), chin = [-34, -262], tx = tabletX(t);
  const tapN = TAPS.filter(u => t >= u - .2).length, tapDn = TAPS.some(u => at(t, u, u + .1)) ? 10 : 0, over = L2([tx - 34 + tapN * 7, TAB.y - 62]);
  const a = kf(t, [[22.1, restA], [22.4, chin], [23.45, chin], [23.75, over], [26.5, over], [26.9, restA]]);
  const typing = at(t, 23.6, 26.6), thinking = at(t, 22.3, 23.55);
  p.armA = { x: typing ? over[0] : a[0], y: (typing ? over[1] : a[1]) + (typing ? tapDn : 0) + (thinking ? Math.sin(t * Math.PI * 3) * 3 : 0), hand: typing ? 'point' : 'open', rot: typing ? Math.PI / 2 + .25 : thinking ? -Math.PI / 2 + .3 : Math.PI - .35, front: true, flip: !typing && !thinking ? false : typing, bend: thinking ? -30 : -18 };
  // cup-side hand: sips, puts the cup down, raises a finger, rests
  const sip = [70, -226], down = L2([CUPX + 34, TAB.y - 22]), restB = L2([CUPX + 66, TAB.y - 14]);
  let B = kf(t, [[0, sip], [2.9, sip], [3.4, [70, -210]], [5.2, [70, -210]], [T_CUP, down], [5.8, down], [6.2, restB]]), handB = t < 5.9 ? 'grab' : 'open', rotB = t < 5.9 ? Math.PI + .1 : Math.PI - .4;
  const sipTilt = t < 3.0 ? -.12 : lerp(-.12, 0, ss(seg(t, 3.0, 3.4)));
  if (t < T_CUP + .02) p.heldB = (hx, hy) => cupAt(hx - 34, hy + 24, t0, sipTilt, false);
  const fing = ss(seg(t, 11.85, 12.15)) * (1 - ss(seg(t, 17.7, 18.1)));
  if (fing > 0) { const wag = at(t, 14.5, 17.4) ? Math.sin(t * Math.PI * 4) * 8 : 0; B = [lerp(restB[0], 152 + wag, fing), lerp(restB[1], -318, fing)]; if (fing > .5) { handB = 'point'; rotB = -Math.PI / 2; } }
  p.armB = { x: B[0], y: B[1], hand: handB, rot: rotB, front: true, flip: handB === 'open', bend: t < 5.9 ? -24 : 18 };
  return p;
}

// ———————————————————— Léo (seated next to him) ————————————————————
function leoPose(t0) {
  const t = twos(t0), b = breath(t0), bt = beats(t);
  const p = { x: LEO[0], y: LEO[1], seated: true };
  p.sy = 1 + .028 * b; p.sx = 1 - .017 * b;
  let hop = 0; if (at(t, 7.8, 10.9)) hop = Math.abs(Math.sin(Math.PI * bt)) * 8;
  p.y -= hop; p.phones = hop * .5;
  p.lean = kf(t, [[27.5, 0], [27.9, .16], [30.4, .16], [30.5, .06], [33.0, .06], [33.6, .14]]);
  p.turn = kf(t, [[.2, .1], [.45, .5], [18.5, .5], [18.9, .25], [19.5, .5], [27.5, .5], [27.7, .3], [28.2, .55]]);
  const lk = kf(t, [[.2, [0, .9]], [.45, [.8, -.2]], [18.5, [.8, -.2]], [18.9, [.5, .8]], [19.5, [.8, -.2]], [22.0, [.8, -.2]], [23.8, [.7, .7]], [27.5, [.7, .7]], [28.2, [.85, -.35]], [35, [.85, -.4]]]);
  p.look = { lx: lk[0], ly: lk[1] };
  p.eyes = step(t, [[0, 'wide'], [3.5, 'open'], [7.5, 'wide'], [11.5, 'open'], [27.5, 'open'], [31.9, 'wide'], [34.2, 'happy']], 'open');
  p.brows = step(t, [[0, 'up'], [3.5, 'flat'], [7.5, 'up'], [11.5, 'flat'], [18.5, 'flat'], [27.5, 'up'], [30.5, 'up'], [32.4, 'sad']], 'up');
  p.browUp = at(t, 0, 3.5) || at(t, 7.5, 11.5) ? 1 : 0;
  p.mouth = { type: step(t, [[0, 'o'], [3.5, 'flat'], [7.5, 'o'], [11.5, 'flat'], [17.6, 'smile'], [18.5, 'flat'], [27.5, 'o'], [29.2, 'flat'], [32.2, 'smile'], [34.2, 'grin']], 'o') };
  p.talk = talkOf('leo', t);
  p.hair = kf(t, [[.2, 0], [.35, 1], [3.4, .8], [3.6, .2], [7.5, .9], [11.2, .7], [11.5, 0], [27.5, 0], [27.7, .4], [30.5, .2], [32.0, .2], [32.2, .6], [33, .2]]);
  for (const tb of [5.0, 13.0, 16.8, 21.0, 24.4, 29.8]) if (at(t, tb, tb + .16)) p.lid = 1;
  // hands: on his head, on the table, flung wide, pushing the tablet, then quiet
  const tA = [-40, -84], tB = [40, -84], tx = tabletX(t), push = [tx - 86 - LEO[0], TAB.y - 20 - LEO[1]];
  const a = kf(t, [[.2, tA], [.4, [-64, -246]], [3.2, [-64, -246]], [3.6, tA], [7.5, tA], [7.75, [-124, -206]], [10.9, [-124, -206]], [11.3, tA]]);
  const c = kf(t, [[.2, tB], [.4, [64, -246]], [3.2, [64, -246]], [3.6, tB], [7.5, tB], [7.75, [72, -300]], [10.9, [72, -300]], [11.3, tB], [18.6, tB], [T_PUSH[0], [520 - 86 - LEO[0], TAB.y - 20 - LEO[1]]], [T_PUSH[1], [650 - 86 - LEO[0], TAB.y - 20 - LEO[1]]], [19.9, [650 - 86 - LEO[0], TAB.y - 20 - LEO[1]]], [20.3, tB]]);
  const fl = at(t, 7.75, 10.9) ? Math.sin(t * Math.PI * 6) * 10 : 0, onHead = at(t, .3, 3.4);
  p.armA = { x: a[0], y: a[1] + fl, front: true, hand: 'open', rot: onHead ? -Math.PI / 2 + .5 : undefined };
  p.armB = { x: c[0], y: c[1] - fl, front: true, hand: 'open', rot: onHead ? -Math.PI / 2 - .5 : at(t, 18.7, 20.0) ? .1 : undefined, bend: at(t, 18.7, 20.0) ? 14 : undefined };
  return p;
}

// ———————————————————— cameras ————————————————————
function camOf(t) {
  const i = shotAt(t);
  if (i === 0) { const k = ss(seg(t, 0, 3.5)); return { x: 605, y: 712, z: lerp(1.85, 1.95, k) }; }
  if (i === 1) return { x: 745, y: 700, z: lerp(2.05, 2.12, seg(t, 3.5, 7.5)) };
  if (i === 2) return { x: 515, y: 712, z: 2.5 };
  if (i === 3) { const k = seg(t, 11.5, 18.5); return { x: 728, y: lerp(685, 668, k), z: lerp(2.1, 2.3, k) }; }
  if (i === 4) return { x: 600, y: 725, z: lerp(1.95, 2.02, seg(t, 18.5, 22)) };
  if (i === 5) { const k = seg(t, 22, 27.5); return { x: lerp(695, 688, k), y: lerp(700, 712, k), z: lerp(2.15, 2.4, ss(k)) }; }
  if (i === 6) return { x: 548, y: 715, z: lerp(2.5, 2.62, seg(t, 27.5, 30.5)) };
  const k = seg(t, 30.5, 35.5); return { x: 615, y: lerp(708, 700, k), z: lerp(2.0, 2.3, ss(k)) };
}
const toScreen = (c, x, y) => [540 + (x - c.x) * c.z, 960 + (y - c.y) * c.z];

// ———————————————————— one frame ————————————————————
export function drawScene(t, nosub) {
  const sg = SG, c = camOf(t), b = breath(t), bt = beats(twos(t)), tq = twos(t);
  drawBG(sg, BG, c, b * .005);
  T.frame(t); T.transform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z);
  if (t >= 22.0) {   // the window light, from the moment he looks for something nobody can guess
    const [hx, hy] = toScreen(c, 562, 420); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(hx, hy); sg.rotate(Math.floor(t * 12) * .01);
    sg.fillStyle = `rgba(252,251,247,${.04 + .13 * ss(seg(t, 22.3, 23.6))})`;
    for (let i = 0; i < 12; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.arc(0, 0, 2400, i * Math.PI / 6, i * Math.PI / 6 + Math.PI / 12); sg.closePath(); sg.fill(); }
    sg.restore();
  }
  wallClock(b, t, bt); flourJar(b); hangingPans(b, t);
  chair();
  leo(leoPose(t));
  papi(papiPose(t));
  table(b);
  const tx = tabletX(at(t, T_PUSH[0], T_PUSH[1]) ? t : tq);
  tablet(tx);
  if (t >= T_CUP + .02) { const j = t - T_CUP; cupAt(CUPX, TAB.y + (j < .12 ? -6 * (1 - j / .12) : 0), t); }
  field(t, tx);
  irisMask(t, c);
  if (!nosub) subtitles(t);
}

// no iris at the start (the series opening comes first); iris out on the two of them
function irisMask(t, c) {
  if (t < T_IRIS[0]) return;
  const k = seg(t, T_IRIS[0], T_IRIS[1]), r = t >= T_IRIS[1] ? 0 : 1500 * Math.pow(1 - k, 1.8), [cx, cy] = toScreen(c, 612, 690);
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
