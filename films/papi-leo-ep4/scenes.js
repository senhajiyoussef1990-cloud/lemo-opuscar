// scenes.js — episode 4 « Le Wi-Fi »: the performance (a pure function of t), the newspaper, the cards, the cameras, the iris, the title cards.
// Characters act on twos (tq); cameras move on ones (t).
import * as T from './toon.js';
import { P } from './parts.js';
import { papi, leo, heart, wifi } from './people.js';
import { drawBG, hangingPans, wallClock, flourJar, FLOOR } from './kitchen.js';
import { BEAT, DUR, LINES, SUBS, CUTS, T_PAGE, T_LOWER, T_DECK, T_TRUMP, T_WIFI, T_FLIP, T_PLAY, T_IRIS, shotAt, beats } from './story.js';
import { clamp, lerp, seg, ss, eo, env, hash } from '/core/lib.js';

let BG, SG, LIP;
export function initScenes(bg, sg, lip) { BG = bg; SG = sg; LIP = lip; }

const PX = 700, PY = 936, LEO_STAND = 300, LEO_SIT = [505, 900], T_SIT = 23.0, TAB = { x0: 430, x1: 950, y: 830 };
const TRUMP = [612, 828], PHONE = [452, 824], PLAYED = [568, 826];
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
  const h = kf(t, [[T_LOWER[0], 258], [T_LOWER[1], 118], [18.75, 118], [19.0, 14]]), cx = kf(t, [[18.75, PX], [19.0, 858]]);
  const u = seg(t, T_PAGE, T_PAGE + .3), sx = u > 0 && u < 1 ? Math.max(.08, Math.abs(Math.cos(Math.PI * u))) : 1;
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
// ———————————————————— cards, phone ————————————————————
function card(x, y, rot, k = 1, face = null) {
  T.push(); T.translate(x, y); T.rotate(rot); T.scale(k);
  T.shape(T.rr(-16, -46, 32, 46, 5), { fill: P.white, lw: T.S.lw * .75 });
  if (face === 'heart') T.shape(heart(0, -23, 8.5), { fill: P.ink, stroke: false, boil: .3 });
  else T.shape(T.rr(-11, -41, 22, 36, 3), { fill: P.mid, lw: T.S.lw * .4, boil: .3 });
  T.pop();
}
function fan(x, y, n, spread, tilt = 0, k = 1) { for (let i = 0; i < n; i++) card(x + (i - (n - 1) / 2) * 7 * k, y, tilt + lerp(-spread, spread, i / (n - 1)), k); }
function deck(x, y, h) { T.shape(T.rr(x - 22, y - h, 44, h, 3), { fill: P.white, lw: T.S.lw * .75 }); for (let i = 1; i < h / 5; i++) T.stroke([[x - 20, y - i * 5], [x + 20, y - i * 5]], T.S.lw * .3, { line: P.mid, boil: .2 }); T.shape(T.rr(x - 17, y - h - 3, 34, 5, 2), { fill: P.mid, lw: T.S.lw * .5 }); }
function phoneFlat(t) {
  const up = t < T_FLIP, j = t - T_FLIP, hop = j >= 0 && j < .2 ? -14 * Math.sin(Math.PI * j / .2) : 0;
  T.shape(T.rr(PHONE[0] - 34, PHONE[1] - 9 + hop, 68, 13, 5), { fill: up ? P.white : P.dark, lw: T.S.lw * .8 });
  if (up) T.stroke([[PHONE[0] - 24, PHONE[1] - 3], [PHONE[0] + 18, PHONE[1] - 3]], T.S.lw * .5, { line: P.mid });
}

// ———————————————————— Papi (seated) ————————————————————
const L2 = v => [v[0] - PX, v[1] - PY];
function papiPose(t0, m) {
  const t = twos(t0), b = breath(t0);
  const p = { x: PX, y: PY, seated: true };
  p.turn = kf(t, [[12.8, 0], [13.9, 0], [14.9, 0], [15.0, -.3], [18.9, -.35], [26.0, -.4], [33.0, -.5]]);
  let lk = kf(t, [[12.0, [0, .7]], [12.8, [0, 0]], [14.9, [0, 0]], [15.0, [-.7, 0]], [19.0, [-.7, 0]], [19.3, [-.4, .8]], [22.9, [-.4, .8]], [23.0, [-.2, .6]], [26.6, [-.2, .6]], [26.8, [-.8, .1]], [33.0, [-.8, .2]]]);
  if (at(t, 14.4, 14.7)) lk = [.6, -.15];
  p.look = { lx: lk[0], ly: lk[1] };
  p.lid = kf(t, [[12.0, .5], [14.9, .5], [15.0, .45], [18.3, .45], [18.5, .35], [26.0, .5], [33.0, .5], [33.2, .25]]);
  for (const tb of [13.9, 16.2, 20.4, 24.6, 31.0, 34.9]) if (at(t, tb, tb + .16)) p.lid = 1;
  const lecture = env(t, 12.9, 13.8, .1, .15) * .7, one = Math.max(env(t, 14.0, 14.9, .1, .15), env(t, 26.3, 28.4, .15, .2)), tender = ss(seg(t, 33.0, 33.5)) * .6;
  p.brows = [{ raise: lecture, tilt: tender }, { raise: Math.max(lecture, one), tilt: tender }];
  p.stache = kf(t, [[12.0, -.3], [16.5, -.3], [18.3, 0], [18.45, .9], [19.0, .4], [26.0, .5], [26.3, .9], [33.0, .7], [36, .8]]);
  if (t >= 35.5) p.eyes = 'happy';
  p.talk = talkOf('papi', t);
  p.sy = 1 + .028 * b; p.sx = 1 - .017 * b;
  const side = L2([m.cx - m.w / 2 - 2, m.by - m.h * .55]), sideB = L2([m.cx + m.w / 2 + 2, m.by - m.h * .55]);
  const restA = L2([652, TAB.y - 14]), deckH = L2([644, TAB.y - 30]), trumpH = L2([TRUMP[0] + 20, TRUMP[1] - 40]), restB = L2([852, TAB.y - 16]), fanH = [24, -146];
  const pat = (at(t, 20.9, 21.0) || at(t, 21.2, 21.3)) ? 8 : 0;
  const a = kf(t, [[18.7, side], [19.0, L2([650, 760])], [T_DECK, deckH], [22.4, deckH], [22.9, restA], [27.2, restA], [T_TRUMP - .1, trumpH], [T_TRUMP + .2, trumpH], [28.0, restA]]);
  p.armA = { x: a[0], y: a[1] + pat, hand: t < 18.8 ? 'grab' : 'open', rot: t < 18.8 ? -.2 : Math.PI - .35, front: true, flip: false, bend: -18 };
  const bb = kf(t, [[18.7, sideB], [19.0, restB], [22.6, restB], [23.0, fanH]]);
  p.armB = { x: bb[0], y: bb[1], hand: t < 18.8 || t >= 23 ? 'grab' : 'open', rot: t < 18.8 ? Math.PI + .2 : t >= 23 ? -Math.PI / 2 : Math.PI - .5, front: true, flip: t >= 23 ? false : true, bend: 20 };
  if (t >= T_SIT) p.heldB = (hx, hy) => fan(hx - 6, hy - 6, 5, .5, -.08, 1.15);
  return p;
}

// ———————————————————— Léo ————————————————————
function leoPose(t0) {
  const t = twos(t0), b = breath(t0), bt = beats(t), sit = t >= T_SIT;
  const p = { y: FLOOR };
  if (sit) { p.x = LEO_SIT[0]; p.y = LEO_SIT[1]; p.seated = true; }
  else p.x = t < 1.0 ? -150 : t < 1.8 ? lerp(-150, LEO_STAND - 12, eo(seg(t, 1.0, 1.8))) : lerp(LEO_STAND - 12, LEO_STAND, ss(seg(t, 1.8, 2.15)));
  const running = at(t, 1.0, 1.8), skid = env(t, 1.8, 2.25, .05, .3);
  if (running) { p.run = 1; p.runPh = t * Math.PI * 8; p.lean = .2; }
  if (skid) { p.lean = -.26 * skid; p.sx = 1 + .1 * skid; p.sy = 1 - .08 * skid; }
  let hop = 0;
  if (at(t, 2.3, 3.9)) hop = Math.abs(Math.sin(Math.PI * bt * 2)) * 12;
  if (at(t, 7.7, 11.9)) hop = Math.abs(Math.sin(Math.PI * bt)) * 9;
  p.y -= hop; p.phones = hop * .5;
  if (!running && !skid) { p.sy = 1 + .028 * b; p.sx = 1 - .017 * b; }
  p.turn = sit ? kf(t, [[23.0, .35], [24.3, .35], [24.5, .55], [29.1, .45], [29.25, -.1], [29.9, -.1], [30.2, .45], [33, .55]]) : kf(t, [[0, .05], [.9, .05], [1.0, .55]]);
  const lk = sit ? kf(t, [[23.0, [.3, .7]], [24.3, [.3, .7]], [24.5, [.8, -.2]], [26.0, [.8, -.2]], [28.5, [.3, .7]], [29.1, [.3, .7]], [29.25, [-.8, .8]], [29.9, [-.8, .8]], [30.2, [.3, .7]], [33.0, [.8, -.2]], [35.0, [.4, .8]], [35.4, [.8, -.2]]]) : kf(t, [[.9, [-.1, .85]], [1.0, [.75, -.3]]]);
  p.look = { lx: lk[0], ly: lk[1] };
  p.eyes = step(t, [[0, 'open'], [.5, 'wide'], [4.0, 'open'], [7.5, 'wide'], [12.0, 'open'], [29.1, 'wide'], [29.5, 'open'], [35.4, 'happy']], 'open');
  p.lid = at(t, 23.0, 26.0) ? .38 : at(t, 30.2, 33.0) ? .25 : 0;
  p.brows = step(t, [[0, 'flat'], [.5, 'up'], [1.0, 'sad'], [12.0, 'flat'], [23.0, 'flat'], [29.1, 'up'], [30.0, 'angry'], [33.0, 'up']], 'flat');
  p.browUp = at(t, .5, 1.0) ? 1 : 0;
  p.mouth = { type: step(t, [[0, 'flat'], [.5, 'o'], [4.0, 'wavy'], [12.0, 'frown'], [23.0, 'flat'], [29.1, 'o'], [29.5, 'flat'], [31.8, 'smile'], [33.0, 'grin']], 'flat') };
  p.talk = talkOf('leo', t);
  p.hair = kf(t, [[.45, 0], [.6, 1], [4.0, .8], [4.3, .3], [7.5, .8], [12.0, .6], [12.3, -.2], [23.0, 0], [29.1, 0], [29.2, .6], [29.6, 0]]);
  for (const tb of [5.5, 14.2, 17.4, 25.6, 27.9, 32.4]) if (at(t, tb, tb + .16)) p.lid = 1;
  if (!sit) {
    const low = [-36, -150], shake = at(t, 1.0, 3.9) || at(t, 7.6, 11.9) ? [(hash(Math.floor(t * 12)) - .5) * (t > 7 ? 26 : 12), (hash(Math.floor(t * 12) + 7) - .5) * (t > 7 ? 20 : 10)] : [0, 0];
    const a = kf(t, [[.9, [-14, -112]], [1.2, [-8, -262]], [1.8, [-8, -262]], [2.1, [-44, -258]], [3.9, [-44, -258]], [4.3, low], [7.4, low], [7.6, [-46, -246]], [11.9, [-46, -246]], [12.2, low]]);
    p.phone = { rot: t < 1.0 ? .12 : -.2, wifi: 'off' };
    p.armA = { x: a[0] + shake[0], y: a[1] + shake[1], front: t < 1.0, hand: 'grab' };
    const c = kf(t, [[.9, [52, -88]], [1.1, [70, -210]], [3.9, [70, -210]], [4.3, [52, -88]], [7.4, [52, -88]], [7.7, [58, -280]], [11.9, [58, -280]], [12.2, [52, -88]]]);
    p.armB = { x: c[0], y: c[1] + (at(t, 1.0, 3.9) ? Math.sin(t * Math.PI * 6) * 14 : 0), hand: 'open', front: false, rot: at(t, 7.6, 12.0) ? -Math.PI / 2 - .4 : undefined };
  } else {
    const rest = [-42, -80], ph = [PHONE[0] - LEO_SIT[0], PHONE[1] - 14 - LEO_SIT[1]], pl = [PLAYED[0] - LEO_SIT[0], PLAYED[1] - 12 - LEO_SIT[1]];
    const a = kf(t, [[29.7, rest], [29.92, ph], [T_FLIP + .12, ph], [30.4, rest], [34.7, rest], [34.95, [26, -128]], [35.05, [26, -128]], [T_PLAY, pl], [35.5, pl], [35.8, rest]]);
    p.armA = { x: a[0], y: a[1], front: true, hand: at(t, 34.9, T_PLAY) ? 'grab' : 'open', rot: Math.PI * .5 + (a[0] > 0 ? -.6 : .6) };
    p.armB = { x: 34, y: -100, front: true, hand: 'grab', rot: -Math.PI / 2, bend: 14 };
  }
  return p;
}

// ———————————————————— cameras ————————————————————
function camOf(t) {
  const i = shotAt(t);
  if (i === 0) { const k = eo(seg(t, 0, 1.0)); return { x: -162, y: lerp(852, 838, k), z: lerp(5.0, 3.6, k) }; }
  if (i === 1) { const k = ss(seg(t, 1.0, 4.0)); return { x: lerp(515, 525, k), y: 730, z: lerp(1.45, 1.55, k) }; }
  if (i === 2) return { x: 700, y: 690, z: lerp(2.05, 2.12, seg(t, 4, 7.5)) };
  if (i === 3) return { x: 300, y: 790, z: 2.7 };
  if (i === 4) { const k = seg(t, 12, 19); return { x: 705, y: lerp(685, 668, k), z: lerp(2.1, 2.3, k) }; }
  if (i === 5) return { x: 640, y: 884, z: lerp(4.3, 4.5, seg(t, 19, 23)) };
  if (i === 6) return { x: 505, y: 735, z: 2.5 };
  if (i === 7) return { x: 680, y: 715, z: 2.4 };
  if (i === 8) { const k = seg(t, 28.5, 33); return { x: 495, y: lerp(752, 742, k), z: lerp(2.5, 2.8, ss(k)) }; }
  const k = ss(seg(t, 33, 35.8)); return { x: lerp(600, 606, k), y: lerp(735, 750, k), z: lerp(1.75, 2.0, k) };
}
const toScreen = (c, x, y) => [540 + (x - c.x) * c.z, 960 + (y - c.y) * c.z];

// ———————————————————— one frame ————————————————————
export function drawScene(t, nosub) {
  const sg = SG, c = camOf(t), b = breath(t), bt = beats(twos(t)), sit = t >= T_SIT, tq = twos(t);
  drawBG(sg, BG, c, b * .005);
  T.frame(t); T.transform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z);
  if (at(t, 30.2, 37)) {   // the window light, once the phone is face down
    const [hx, hy] = toScreen(c, 562, 420); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(hx, hy); sg.rotate(Math.floor(t * 12) * .012);
    sg.fillStyle = `rgba(252,251,247,${.04 + .12 * ss(seg(t, 30.3, 31.2))})`;
    for (let i = 0; i < 12; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.arc(0, 0, 2400, i * Math.PI / 6, i * Math.PI / 6 + Math.PI / 12); sg.closePath(); sg.fill(); }
    sg.restore();
  }
  wallClock(b, t, bt); flourJar(b); hangingPans(b, t);
  const m = paperState(at(t, T_PAGE, T_PAGE + .3) || at(t, 18.7, 19.0) ? t : tq), pp = papiPose(t, m), up = m.h > 150;
  if (!up) papi(pp);                       // the paper is down: Papi, then the paper in front of his chest
  else { const q = { ...pp, armA: null, armB: null }; papi({ ...pp, armA: { ...pp.armA, front: false }, armB: { ...pp.armB, front: false } }); }
  drawPaper(m, up ? pp.talk * 4 : 0);
  if (up) for (const s of [-1, 1]) {       // his gloves on the edges of the raised paper
    const x = m.cx + s * (m.w / 2 + 2), y = m.by - m.h * .55; T.push(); T.translate(x, y); T.scale(s, 1);
    T.shape(T.ell(-4, 0, 17, 22), { fill: P.white }); for (const dy of [-12, 0, 12]) T.shape(T.rr(-30, dy - 6, 24, 12, 6), { fill: P.white, lw: T.S.lw * .8 }); T.pop();
  }
  const lp = leoPose(t);
  if (sit) { leo(lp); fan(lp.x + 30, lp.y - 110, 5, .55, .1, 1.05); }
  table(b);
  if (t >= T_DECK) deck(sit ? 668 : 640, TAB.y - 1, sit ? 9 : 24);
  if (t >= T_TRUMP) card(TRUMP[0], TRUMP[1], -.14, 1.25, 'heart');
  if (sit) phoneFlat(t);
  if (t >= T_PLAY) T.shape(T.rr(PLAYED[0] - 20, PLAYED[1] - 6, 40, 7, 3), { fill: P.white, lw: T.S.lw * .7 });
  if (!sit) leo(lp);
  // the Wi-Fi comes back: the sign bursts out of the phone
  const w = t - T_WIFI; if (w >= 0 && w < .9) {
    const k = w / .9, [hx, hy] = toScreen(c, PHONE[0], PHONE[1] - 20), g = sg.createRadialGradient(hx, hy, 10, hx, hy, 300);
    g.addColorStop(0, `rgba(252,251,247,${.4 * (1 - k)})`); g.addColorStop(1, 'rgba(252,251,247,0)'); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = g; sg.fillRect(0, 0, 1080, 1920); sg.restore();
    wifi(PHONE[0], PHONE[1] - 22 - 30 * eo(k), 5 + 9 * eo(k), false, T.S.lw * 1.1);
  }
  if (at(t, T_PLAY, T_PLAY + .2)) { const k = (t - T_PLAY) / .2; for (const s of [-1, 1]) T.stroke([[PLAYED[0] + s * (30 + 20 * k), PLAYED[1] - 14 - 16 * k], [PLAYED[0] + s * (46 + 34 * k), PLAYED[1] - 22 - 30 * k]], T.S.lw * .8); }
  irisMask(t, c, lp);
  if (!nosub) subtitles(t);
}

// iris in on the crossed-out Wi-Fi sign, iris out on the heart of the trump card
function irisMask(t, c, lp) {
  let r = -1, cx = 540, cy = 960;
  if (t < .8) { r = 150 + 1500 * Math.pow(seg(t, 0, .75), 1.7);[cx, cy] = toScreen(c, lp.x + lp.armA.x, lp.y + lp.armA.y - 30); }
  else if (t >= T_IRIS[0]) { const k = seg(t, T_IRIS[0], T_IRIS[1]); r = t >= T_IRIS[1] + .25 ? 0 : Math.max(80, 1500 * Math.pow(1 - k, 1.8));[cx, cy] = toScreen(c, TRUMP[0] + 4, TRUMP[1] - 30); }
  if (r < 0) return;
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
