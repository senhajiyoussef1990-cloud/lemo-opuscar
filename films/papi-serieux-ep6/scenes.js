// scenes.js — episode 6 « Les émojis »: the performance (a pure function of t), the newspaper, the phone and its screen, the cameras, the iris, the title cards.
// Characters act on twos (tq); cameras move on ones (t).
import * as T from './toon.js';
import { P, glove, hose } from './parts.js';
import { papi, leo } from './people.js';
import { PICTO } from './pictos.js';
import { drawBG, hangingPans, wallClock, flourJar, FLOOR } from './kitchen.js';
import { BEAT, DUR, LINES, SUBS, CUTS, T_LOWER, T_GIVE, TAPS, T_BURST, T_BUZZ, T_BACK, T_IRIS, shotAt, beats } from './story.js';
import { clamp, lerp, seg, ss, eo, env, hash, back } from '/core/lib.js';

let BG, SG, LIP;
export function initScenes(bg, sg, lip) { BG = bg; SG = sg; LIP = lip; }

const PX = 700, PY = 936, LEO_X = 300, TAB = { x0: 430, x1: 950, y: 830 };
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
  const h = kf(t, [[T_LOWER[0], 258], [T_LOWER[1], 118], [18.75, 118], [19.0, 14]]), cx = kf(t, [[18.75, PX], [19.0, 858]]), sx = 1;
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

// the phone in Papi's glove, with one pictogram on its screen
function bigPhone(x, y, rot, icon, buzz = 0) {
  T.push(); T.translate(x + buzz, y); T.rotate(rot);
  T.shape(T.rr(-24, -78, 48, 80, 8), { fill: P.dark });
  T.shape(T.rr(-18, -70, 36, 62, 4), { fill: P.white, stroke: false, boil: .3 });
  if (icon) PICTO[icon](0, -42, 12);
  T.pop();
}

// ———————————————————— Papi (seated) ————————————————————
const L2 = v => [v[0] - PX, v[1] - PY];
const FAR = [452, 610], OPEN = [506, TAB.y - 18], SHOW = [468, 800], GIVE = [446, 806];
const phoneHand = t => kf(t, [[19.0, OPEN], [19.75, OPEN], [20.05, FAR], [22.5, FAR], [27.5, SHOW], [31.5, SHOW], [32.3, GIVE]]);
function papiPose(t0, m) {
  const t = twos(t0), b = breath(t0);
  const p = { x: PX, y: PY, seated: true };
  p.turn = kf(t, [[13.2, 0], [15.4, 0], [15.6, -.3], [19.0, -.4], [19.9, -.45], [20.1, -.6], [22.5, -.6], [27.5, -.5], [35, -.5]]);
  let lk = kf(t, [[12.5, [0, .7]], [13.2, [0, 0]], [15.4, [0, 0]], [15.6, [-.7, 0]], [19.0, [-.8, .2]], [19.9, [-.8, .2]], [20.1, [-.8, -.6]], [22.5, [-.8, -.6]], [27.5, [-.8, .2]], [35, [-.8, .25]]]);
  if (at(t, 14.6, 14.9)) lk = [.6, -.15];
  p.look = { lx: lk[0], ly: lk[1] };
  p.lid = kf(t, [[12.5, .5], [15.4, .5], [15.6, .4], [19.0, .35], [19.9, .35], [20.1, .68], [22.5, .68], [27.5, .25], [35, .2]]);
  for (const tb of [14.2, 17.0, 21.2, 29.5, 33.4]) if (at(t, tb, tb + .16)) p.lid = 1;
  const lecture = env(t, 13.3, 14.2, .1, .15) * .7, one = Math.max(env(t, 14.3, 15.4, .1, .15), env(t, 20.1, 22.4, .15, .1)), tender = ss(seg(t, 31.5, 32.0)) * .75;
  p.brows = [{ raise: lecture, tilt: tender }, { raise: Math.max(lecture, one), tilt: tender }];
  p.stache = kf(t, [[12.5, -.3], [17.6, -.3], [18.25, 0], [18.4, .9], [19.0, .3], [27.5, .3], [31.5, .4], [32.0, .7], [35, .8]]);
  p.tremble = at(t, 31.6, 32.0) ? Math.sin(t * Math.PI * 12) * 5 : 0;
  if (t >= 34.5) p.eyes = 'happy';
  p.talk = talkOf('papi', t);
  p.sy = 1 + .028 * b; p.sx = 1 - .017 * b;
  const side = L2([m.cx - m.w / 2 - 2, m.by - m.h * .55]), restA = L2([650, TAB.y - 14]), restB = L2([852, TAB.y - 16]);
  // the hand on Léo's side: holds the paper, opens for the phone, holds it at arm's length, shows it, gives it back
  const ph = L2(phoneHand(t)), hasPhone = at(t, T_GIVE, T_BACK);
  const a = t < 18.8 ? side : t < 19.0 ? [lerp(side[0], ph[0], ss(seg(t, 18.8, 19.0))), lerp(side[1], ph[1], ss(seg(t, 18.8, 19.0)))] : t < T_BACK + .1 ? ph : [lerp(ph[0], restA[0], ss(seg(t, T_BACK + .1, 33.3))), lerp(ph[1], restA[1], ss(seg(t, T_BACK + .1, 33.3)))];
  const armLen = at(t, 19.9, 27.5);
  p.armA = { x: a[0], y: a[1], hand: t < 18.8 || hasPhone ? 'grab' : 'open', rot: t < 18.8 ? -.2 : at(t, 19.0, T_GIVE) ? Math.PI + .5 : hasPhone ? (armLen ? -Math.PI / 2 - .2 : Math.PI + .2) : Math.PI - .35, front: true, flip: at(t, 19.0, T_GIVE), bend: armLen ? -46 : -18 };
  if (hasPhone) p.held = (hx, hy) => bigPhone(hx, hy - (armLen ? 14 : 6), armLen ? .12 : -1.1, t < 22.5 ? 'thumb' : 'heart', at(t0, T_BUZZ, T_BUZZ + .5) || at(t0, T_BUZZ + .7, T_BUZZ + 1.0) ? Math.sin(t0 * 150) * 4 : 0);
  // the other hand: the paper, a raised finger, then at rest
  let B = t < 18.8 ? L2([m.cx + m.w / 2 + 2, m.by - m.h * .55]) : restB, handB = t < 18.8 ? 'grab' : 'open', rotB = t < 18.8 ? Math.PI + .2 : Math.PI - .5;
  const fing = ss(seg(t, 13.1, 13.35)) * (1 - ss(seg(t, 18.4, 18.75)));
  if (fing > 0) { const wag = at(t, 15.5, 18.1) ? Math.sin(t * Math.PI * 4) * 8 : 0; B = [lerp(B[0], 152 + wag, fing), lerp(B[1], -318, fing)]; if (fing > .5) { handB = 'point'; rotB = -Math.PI / 2; } }
  p.armB = { x: B[0], y: B[1], hand: handB, rot: rotB, front: true, flip: handB !== 'point', bend: 20 };
  return p;
}

// ———————————————————— Léo ————————————————————
function leoPose(t0) {
  const t = twos(t0), b = breath(t0), bt = beats(t);
  const p = { y: FLOOR, x: lerp(40, LEO_X, ss(seg(t, 0, .7))) };
  if (t < .7) { p.run = 1; p.runPh = t * Math.PI * 4; p.lean = .08; } else { p.sy = 1 + .028 * b; p.sx = 1 - .017 * b; }
  let hop = 0; if (at(t, 8.6, 12.4)) hop = Math.abs(Math.sin(Math.PI * bt)) * 9;
  p.y -= hop; p.phones = hop * .5;
  p.turn = .55;
  const lk = kf(t, [[19.0, [.75, -.3]], [19.3, [.85, .1]], [19.8, [.8, -.5]], [27.4, [.8, -.5]], [27.5, [.85, 0]], [31.5, [.8, -.1]], [32.5, [.8, .1]], [33.2, [.75, -.4]]]);
  p.look = { lx: lk[0], ly: lk[1] };
  p.eyes = step(t, [[0, 'open'], [8.5, 'wide'], [12.5, 'open'], [27.6, 'wide'], [29.0, 'open'], [34.5, 'happy']], 'open');
  p.brows = step(t, [[0, 'sad'], [5.0, 'flat'], [8.5, 'up'], [12.5, 'flat'], [19.0, 'up'], [22.5, 'flat'], [27.5, 'up']], 'sad');
  p.browUp = at(t, 8.5, 12.5) ? 1 : 0;
  p.mouth = { type: step(t, [[0, 'frown'], [5.0, 'flat'], [8.5, 'o'], [12.5, 'flat'], [19.0, 'smile'], [22.5, 'flat'], [27.6, 'o'], [28.0, 'smile'], [31.5, 'grin']], 'frown') };
  p.talk = talkOf('leo', t) * (at(t, 27.5, 31.5) ? .6 : 1);
  p.hair = kf(t, [[8.4, 0], [8.5, 1], [12.4, .7], [12.6, 0], [27.6, 0], [27.7, .6], [28.3, 0]]);
  for (const tb of [3.6, 6.8, 16.0, 21.5, 30.4, 33.8]) if (at(t, tb, tb + .16)) p.lid = 1;
  // the phone hand: held out to Papi, then into his open glove; back at the end
  const low = [-36, -150], out = [104, -206], give = [OPEN[0] - LEO_X, TAB.y - 26 - FLOOR], take = [GIVE[0] - 16 - LEO_X, GIVE[1] - FLOOR], chest = [-14, -112];
  const a = kf(t, [[0, low], [.5, low], [.9, out], [4.6, out], [5.0, low], [8.4, low], [8.6, [-44, -250]], [12.2, [-44, -250]], [12.6, low], [19.1, low], [T_GIVE, give], [T_GIVE + .1, give], [19.9, [-50, -88]], [32.4, [-50, -88]], [T_BACK, take], [33.2, chest]]);
  const has = t < T_GIVE || t >= T_BACK, shake = at(t, 8.6, 12.2) ? [(hash(Math.floor(t * 12)) - .5) * 14, (hash(Math.floor(t * 12) + 7) - .5) * 10] : [0, 0];
  p.phone = has ? { rot: t >= T_BACK ? .12 : -.2, icon: t < T_GIVE ? 'thumb' : 'heart' } : null;
  p.armA = { x: a[0] + shake[0], y: a[1] + shake[1], front: at(t, .5, 5.0) || at(t, 19.1, 19.9) || t >= 32.4, hand: has ? 'grab' : 'open', bend: at(t, .5, 5.0) || at(t, 19.1, 19.9) || at(t, 32.4, 32.9) ? 22 : undefined };
  const rest = [52, -88];
  const c = kf(t, [[2.7, rest], [3.0, [70, -160]], [4.6, [70, -160]], [5.0, rest], [8.5, rest], [8.8, [84, -200]], [12.2, [84, -200]], [12.6, rest], [19.8, rest], [20.0, [106, -196]], [21.4, [106, -196]], [21.8, rest]]);
  p.armB = { x: c[0], y: c[1] + (at(t, 8.8, 12.2) ? Math.sin(t * Math.PI * 6) * 10 : 0), hand: at(t, 19.9, 21.6) ? 'point' : 'open', rot: at(t, 19.9, 21.6) ? -.9 : at(t, 2.9, 4.8) ? -.4 : undefined };
  return p;
}

// ———————————————————— shot 6: the screen, full frame ————————————————————
const KEYS = ['heart', 'smiley', 'fish', 'thumb', 'tractor', 'umbrella'];
function screenShot(t) {
  const sg = SG; sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#8F8C84'; sg.fillRect(0, 0, 1080, 1920);
  T.frame(t);
  T.shape(T.rr(130, 300, 820, 1420, 80), { fill: P.dark });
  T.shape(T.rr(172, 372, 736, 1276, 30), { fill: P.white, stroke: false, boil: 0 });
  // header: who he is writing to
  T.shape(T.ell(250, 440, 34, 34), { fill: P.light, lw: T.S.lw * .7 }); T.text('MAMAN', 310, 442, { font: '40px Limelight', fill: P.ink, align: 'left' });
  T.stroke([[172, 500], [908, 500]], T.S.lw * .6, { boil: .2 });
  // the thread: her message, his thumb, her question mark
  T.shape(T.rr(200, 540, 330, 96, 30), { fill: P.light, lw: T.S.lw * .6 }); for (const y of [572, 602]) T.stroke([[230, y], [y === 572 ? 500 : 430, y]], T.S.lw * .6, { line: P.dmid, boil: .2 });
  T.shape(T.rr(730, 664, 150, 110, 30), { fill: P.pale, lw: T.S.lw * .6 }); PICTO.thumb(805, 722, 34);
  T.shape(T.rr(200, 802, 130, 96, 30), { fill: P.light, lw: T.S.lw * .6 }); T.text('?', 265, 852, { font: '64px "IM Fell English SC"', fill: P.ink });
  // what he sends: one drawing per slow tap, then everything at once
  const items = []; TAPS.forEach((u, i) => { if (t >= u + .08) items.push([['heart', 'fish', 'heart'][i], t - u - .08]); });
  for (let i = 0; i < 14; i++) { const u = T_BURST + i * .05; if (t >= u) items.push([KEYS[Math.floor(hash(i * 7.3 + 2) * KEYS.length)], t - u]); }
  if (items.length) {
    const rows = Math.ceil(items.length / 6), sent = t >= T_BURST + .8, jump = sent ? -14 * Math.sin(Math.PI * clamp((t - T_BURST - .8) / .25)) : 0;
    const bw = Math.min(6, items.length) * 96 + 44, bx = 884 - bw, by = 930 + jump;
    T.shape(T.rr(bx, by, bw, rows * 92 + 36, 30), { fill: sent ? P.pale : P.white, lw: T.S.lw * .6 });
    items.forEach(([k, age], i) => { const s = 30 * (age < .12 ? back(age / .12, 3) : 1); PICTO[k](bx + 68 + (i % 6) * 96, by + 62 + Math.floor(i / 6) * 92, s); });
  }
  // the keyboard: three rows of small drawings
  T.shape(T.rr(172, 1290, 736, 358, 0), { fill: P.light, stroke: false, boil: 0 }); T.stroke([[172, 1290], [908, 1290]], T.S.lw * .6, { boil: .2 });
  const key = (i, j) => [240 + i * 120, 1356 + j * 106];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) { const [x, y] = key(i, j); T.shape(T.rr(x - 48, y - 42, 96, 84, 14), { fill: P.white, lw: T.S.lw * .5, boil: .2 }); PICTO[KEYS[(i + j * 2) % 6]](x, y, 22); }
  // Papi's glove: three slow taps with one finger, then the whole hand lands on the keys
  const tq = twos(t), tgt = [key(0, 0), key(2, 1), key(0, 0)];
  let tip = [760, 1700], press = 0;
  TAPS.forEach((u, i) => { const k = ss(seg(tq, u - .45, u - .05)); if (k > 0) tip = [lerp(tip[0], tgt[i][0] + 20, k), lerp(tip[1], tgt[i][1] + 14, k)]; if (at(tq, u, u + .1)) press = 12; });
  const slip = ss(seg(tq, T_BURST - .25, T_BURST)), lift = ss(seg(tq, 25.5, 26.0));
  tip = [lerp(tip[0], 560, slip) + 0, lerp(tip[1], 1440, slip) + lift * 190]; if (at(tq, T_BURST, T_BURST + .7)) press = 10 + 6 * Math.sin(tq * 40);
  const ang = -2.25, k = 3.3, wx = tip[0] - Math.cos(ang) * 66 * k - press * .5, wy = tip[1] - Math.sin(ang) * 66 * k + press;
  hose([wx + 420, wy + 560], [wx, wy], 60, 50);
  glove(wx, wy, ang, slip > .5 && lift < .5 ? 'open' : 'point', k, { flip: true });
}

// ———————————————————— cameras ————————————————————
function camOf(t) {
  const i = shotAt(t);
  if (i === 0) { const k = ss(seg(t, 0, 5)); return { x: lerp(515, 525, k), y: 730, z: lerp(1.45, 1.55, k) }; }
  if (i === 1) return { x: 700, y: 690, z: lerp(2.05, 2.12, seg(t, 5, 8.5)) };
  if (i === 2) return { x: 300, y: 790, z: 2.7 };
  if (i === 3) { const k = seg(t, 12.5, 19); return { x: 705, y: lerp(685, 668, k), z: lerp(2.1, 2.3, k) }; }
  if (i === 4) { const k = eo(seg(t, 19.9, 20.6)); return { x: lerp(585, 600, k), y: lerp(720, 650, k), z: lerp(1.95, 1.85, k) }; }
  if (i === 6) { const k = seg(t, 27.5, 31.5); return { x: 380, y: lerp(795, 785, k), z: lerp(2.6, 2.8, ss(k)) }; }
  const k = ss(seg(t, 31.5, 35)); return { x: lerp(505, 500, k), y: lerp(740, 755, k), z: lerp(1.6, 1.8, k) };
}
const toScreen = (c, x, y) => [540 + (x - c.x) * c.z, 960 + (y - c.y) * c.z];

// ———————————————————— one frame ————————————————————
export function drawScene(t, nosub) {
  const sg = SG, c = camOf(t), b = breath(t), bt = beats(twos(t)), tq = twos(t);
  if (shotAt(t) === 5) { screenShot(t); if (!nosub) subtitles(t); return; }
  drawBG(sg, BG, c, b * .005);
  T.frame(t); T.transform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z);
  if (t >= 27.5) {   // the window light, once she has answered
    const [hx, hy] = toScreen(c, 562, 420); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(hx, hy); sg.rotate(Math.floor(t * 12) * .01);
    sg.fillStyle = `rgba(252,251,247,${.04 + .13 * ss(seg(t, 28.0, 29.2))})`;
    for (let i = 0; i < 12; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.arc(0, 0, 2400, i * Math.PI / 6, i * Math.PI / 6 + Math.PI / 12); sg.closePath(); sg.fill(); }
    sg.restore();
  }
  if (at(t, 19.9, 22.5)) { const o = phoneHand(tq), [hx, hy] = toScreen(c, o[0], o[1] - 60), g = sg.createRadialGradient(hx, hy, 20, hx, hy, 420); g.addColorStop(0, 'rgba(252,251,247,.3)'); g.addColorStop(1, 'rgba(252,251,247,0)'); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = g; sg.fillRect(0, 0, 1080, 1920); sg.restore(); }
  wallClock(b, t, bt); flourJar(b); hangingPans(b, t);
  const m = paperState(at(t, 18.7, 19.0) ? t : tq), pp = papiPose(t, m), up = m.h > 150;
  if (!up) papi(pp); else papi({ ...pp, armA: { ...pp.armA, front: false }, armB: { ...pp.armB, front: false } });
  drawPaper(m, up ? pp.talk * 4 : 0);
  if (up) {   // his gloves on the edges of the raised paper; on "avec le doigt" one of them answers for him
    const thumb = at(tq, 7.15, 8.3);
    for (const s of [-1, 1]) {
      const x = m.cx + s * (m.w / 2 + 2), y = m.by - m.h * .55;
      if (s > 0 && thumb) { const k = back(seg(tq, 7.15, 7.35), 2.5); glove(x - 16, m.by - m.h - 6 - 40 * k, 0, 'thumb', 1.5, {}); continue; }
      T.push(); T.translate(x, y); T.scale(s, 1); T.shape(T.ell(-4, 0, 17, 22), { fill: P.white }); for (const dy of [-12, 0, 12]) T.shape(T.rr(-30, dy - 6, 24, 12, 6), { fill: P.white, lw: T.S.lw * .8 }); T.pop();
    }
  }
  table(b);
  leo(leoPose(t));
  // the phone buzzes: little lines around it
  if (at(t, T_BUZZ, T_BUZZ + .5) || at(t, T_BUZZ + .7, T_BUZZ + 1.0)) { const o = phoneHand(tq), f = Math.floor(t * 24) % 2; for (const s of [-1, 1]) for (const dy of [-70, -44, -18]) T.stroke([[o[0] + s * (34 + f * 6), o[1] + dy], [o[0] + s * (50 + f * 6), o[1] + dy - 6]], T.S.lw * .7); }
  irisMask(t, c);
  if (!nosub) subtitles(t);
}

// no iris at the start (the series opening comes first); iris out on the heart
function irisMask(t, c) {
  if (t < T_IRIS[0]) return;
  const k = seg(t, T_IRIS[0], T_IRIS[1]), r = t >= T_IRIS[1] ? 0 : 1500 * Math.pow(1 - k, 1.8), [cx, cy] = toScreen(c, LEO_X - 12, FLOOR - 142);   // on the heart on Léo's screen
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
