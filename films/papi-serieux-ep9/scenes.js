// scenes.js — episode 9 « Le selfie »: the performance (a pure function of t), the selfie, the wallet and the old photograph, the cameras, the iris, the title cards.
// Characters act on twos (tq); cameras move on ones (t).
import * as T from './toon.js';
import { P, glove, hose } from './parts.js';
import { papi, leo } from './people.js';
import { drawBG, hangingPans, wallClock, flourJar, FLOOR } from './kitchen.js';
import { BEAT, DUR, LINES, SUBS, CUTS, FLASH, T_WALLET, T_PULL, T_IRIS, shotAt, beats } from './story.js';
import { clamp, lerp, seg, ss, eo, env, hash, back } from '/core/lib.js';

let BG, SG, LIP;
export function initScenes(bg, sg, lip) { BG = bg; SG = sg; LIP = lip; }

const PX = 700, PY = 936, LEO = [530, 905], TAB = { x0: 430, x1: 950, y: 830 }, CHAIR = 530;
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


// ———————————————————— the selfie (as Léo sees it), the wallet, the little photograph ————————————————————
function selfieCard(x, y, k) {
  T.push(); T.translate(x, y); T.rotate(-.06); T.scale(k);
  T.shape(T.rr(-84, -62, 168, 124, 12), { fill: P.white, lw: T.S.lw * .8 });
  T.shape(T.rr(-74, -52, 148, 104, 6), { fill: P.light, stroke: false, boil: .2 });
  // Léo, sharp
  T.shape(T.ell(-36, 12, 26, 25), { fill: P.white, lw: T.S.lw * .6 });
  T.shape([[-62, 6], [-64, -10], [-56, -8], [-56, -26], [-46, -18], [-42, -32], [-34, -20], [-26, -32], [-22, -18], [-12, -24], [-12, -8], [-8, 4], [-22, -6], [-48, -6]], { fill: P.ink, stroke: false, boil: .3 });
  T.dot(-45, 12, 3); T.dot(-28, 12, 3); T.stroke(T.arc(-36, 20, 10, 8, .2, Math.PI - .2, 6), T.S.lw * .5, { boil: .3 });
  // Papi, a blur
  for (let i = 0; i < 6; i++) { T.shape(T.ell(26 + i * 7, 6 + Math.sin(i) * 3, 26, 30), { fill: P.white, stroke: false, boil: .3, alpha: .28 }); T.shape(T.ell(26 + i * 7, -22 + Math.sin(i) * 3, 28, 10), { fill: P.ink, stroke: false, boil: .3, alpha: .2 }); }
  T.pop();
}
function wallet(x, y) { T.shape(T.rr(x - 30, y - 22, 60, 44, 8), { fill: P.dark }); T.stroke([[x - 24, y - 4], [x + 24, y - 4]], T.S.lw * .5, { line: P.light, boil: .3 }); }
function smallPhoto(x, y, rot, k = 1) {
  T.push(); T.translate(x, y); T.rotate(rot); T.scale(k);
  T.shape([[-17, -44], [9, -44], [17, -36], [17, 0], [-17, 0]], { fill: P.paper, lw: T.S.lw * .8 });
  T.shape([[9, -44], [9, -36], [17, -36]], { fill: P.light, lw: T.S.lw * .5 });
  T.shape(T.rr(-12, -38, 24, 30, 2), { fill: P.light, stroke: false, boil: .2 }); T.dot(-3, -22, 5, P.ink); T.dot(6, -16, 3.2, P.white);
  T.pop();
}

// ———————————————————— Papi (seated) ————————————————————
const L2 = v => [v[0] - PX, v[1] - PY];
function papiPose(t0) {
  const t = twos(t0), b = breath(t0);
  const p = { x: PX, y: PY, seated: true };
  p.turn = kf(t, [[11.0, 0], [11.4, -.3], [12.6, -.3], [12.8, 0], [13.9, 0], [14.1, -.3], [21.5, -.35], [21.9, .25], [22.9, .25], [23.2, -.1], [24.4, -.1], [24.7, -.45], [30.0, -.45]]);
  let lk = kf(t, [[11.0, [0, 0]], [11.4, [-.7, 0]], [12.6, [-.7, 0]], [12.8, [0, 0]], [13.9, [0, 0]], [14.1, [-.7, 0]], [21.5, [-.8, .2]], [21.9, [.5, .8]], [22.9, [.5, .8]], [23.2, [-.1, .7]], [24.4, [-.2, .5]], [24.7, [-.8, .3]], [30.0, [-.7, .5]], [31.4, [-.7, .5]], [31.7, [-.85, .3]]]);
  if (at(t, 13.4, 13.7)) lk = [.6, -.15];
  p.look = { lx: lk[0], ly: lk[1] };
  p.lid = kf(t, [[0, .5], [11.0, .5], [11.4, .28], [12.6, .28], [12.8, .5], [13.9, .5], [14.1, .3], [16.3, .3], [16.6, .42], [21.5, .4], [23.0, .25], [30.0, .2]]);
  for (const tb of [1.9, 9.2, 15.4, 19.7, 25.9, 29.0]) if (at(t, tb, tb + .16)) p.lid = 1;
  const lecture = env(t, 11.6, 12.6, .12, .15) * .7, one = env(t, 12.8, 13.9, .1, .15), tender = ss(seg(t, 23.0, 24.4)) * .75;
  p.brows = [{ raise: lecture, tilt: tender }, { raise: Math.max(lecture, one), tilt: tender }];
  p.stache = kf(t, [[0, -.35], [11.0, -.35], [11.4, 0], [16.3, 0], [16.7, .7], [17.25, .7], [17.4, .95], [18.0, .3], [21.5, .1], [24.4, .2], [30.0, .3], [30.4, .8], [35, .95]]);
  p.tremble = at(t, 24.0, 24.5) || at(t, 31.6, 32.2) ? Math.sin(t * Math.PI * 12) * 5 : 0;
  if (t >= 32.6) p.eyes = 'happy';
  p.talk = talkOf('papi', t);
  const stiff = t < 6.5; p.sy = stiff ? 1 : 1 + .028 * b; p.sx = stiff ? 1 : 1 - .017 * b;
  // Léo-side hand: at rest; pulls the photograph out of the wallet, slowly; holds it between them
  const restA = L2([640, TAB.y - 14]), wal = [56, -150], pull = seg(t, T_PULL[0], T_PULL[1]);
  const a = kf(t, [[22.6, restA], [T_PULL[0], [wal[0] - 6, wal[1] - 18]], [T_PULL[1], [wal[0] - 22, wal[1] - 62]], [24.5, [wal[0] - 22, wal[1] - 62]], [24.9, [-84, -146]]]);
  const hasPhoto = t >= T_PULL[0];
  p.armA = { x: a[0], y: a[1], hand: hasPhoto ? 'grab' : 'open', rot: hasPhoto ? -Math.PI / 2 + (t > 24.6 ? -.3 : .2) : Math.PI - .35, front: true, flip: hasPhoto ? true : false, bend: hasPhoto ? -24 : -18 };
  if (hasPhoto) p.held = (hx, hy) => smallPhoto(hx + 4, hy - 4, t > 24.6 ? -.25 : .08, 1.25);
  // other hand: at rest, a raised finger, then the wallet
  const restB = L2([790, TAB.y - 14]);
  let B = restB, handB = 'open', rotB = Math.PI - .4;
  const fing = ss(seg(t, 11.45, 11.75)) * (1 - ss(seg(t, 17.4, 17.8)));
  if (fing > 0) { const wag = at(t, 14.0, 17.1) ? Math.sin(t * Math.PI * 4) * 8 : 0; B = [lerp(restB[0], 152 + wag, fing), lerp(restB[1], -318, fing)]; if (fing > .5) { handB = 'point'; rotB = -Math.PI / 2; } }
  const wk = ss(seg(t, T_WALLET[0], T_WALLET[1])) * (1 - ss(seg(t, 24.6, 25.1)));
  if (wk > 0) { B = [lerp(restB[0], wal[0] + 28, wk), lerp(restB[1], wal[1] + 6, wk)]; handB = 'grab'; rotB = Math.PI + .1; p.heldB = (hx, hy) => wallet(hx - 28, hy - 6); }
  p.armB = { x: B[0], y: B[1], hand: handB, rot: rotB, front: true, flip: handB === 'open', bend: wk > 0 ? -22 : 18 };
  return p;
}

// ———————————————————— Léo (seated next to him) ————————————————————
function leoPose(t0) {
  const t = twos(t0), b = breath(t0), bt = beats(t);
  const p = { x: LEO[0], y: LEO[1], seated: true };
  p.sy = 1 + .028 * b; p.sx = 1 - .017 * b;
  let hop = 0; if (at(t, 6.7, 10.8)) hop = Math.abs(Math.sin(Math.PI * bt)) * 7;
  p.y -= hop; p.phones = hop * .5;
  p.lean = kf(t, [[0, .2], [3.2, .2], [3.5, 0], [30.0, 0], [30.2, .08], [33.0, .14]]);
  p.turn = kf(t, [[0, -.2], [3.3, -.2], [3.5, -.1], [6.5, 0], [10.9, .2], [11.0, .5], [30.0, .5]]);
  const lk = kf(t, [[0, [-.6, -.5]], [3.3, [-.6, -.5]], [6.5, [-.2, .85]], [9.3, [-.2, .85]], [9.6, [.8, -.2]], [18.0, [.8, -.2]], [24.7, [.8, -.2]], [25.0, [.7, .5]], [30.0, [.7, .5]], [31.6, [.7, .5]], [32.0, [.85, -.4]]]);
  p.look = { lx: lk[0], ly: lk[1] };
  p.eyes = step(t, [[0, 'happy'], [3.2, 'open'], [9.5, 'wide'], [11.0, 'open'], [25.0, 'wide'], [26.5, 'open'], [32.4, 'wide'], [33.6, 'happy']], 'open');
  p.lid = at(t, 18.0, 21.5) ? .36 : 0;
  p.brows = step(t, [[0, 'up'], [3.5, 'flat'], [6.5, 'sad'], [9.5, 'angry'], [11.0, 'flat'], [18.0, 'flat'], [21.5, 'flat'], [25.0, 'up'], [30.0, 'up']], 'up');
  p.mouth = { type: step(t, [[0, 'beam'], [3.2, 'smile'], [6.5, 'frown'], [11.0, 'flat'], [17.3, 'smile'], [18.0, 'flat'], [25.0, 'o'], [26.5, 'flat'], [32.0, 'smile'], [33.6, 'grin']], 'flat') };
  p.talk = talkOf('leo', t);
  p.hair = kf(t, [[0, .3], [3.5, 0], [6.5, -.3], [9.5, .8], [10.9, .5], [11.0, 0], [18.0, -.2], [21.5, 0], [25.0, .5], [26.0, 0]]);
  if (at(t, 18.0, 21.5)) p.headRot = .09;
  for (const tb of [5.0, 12.9, 16.6, 23.4, 28.9]) if (at(t, tb, tb + .16)) p.lid = 1;
  // the phone hand: at arm's length for the selfie (we see the back of the phone), then in front of him; later arms crossed
  const tA = [-40, -84], tB = [40, -84], crossed = at(t, 18.0, 21.5);
  const a = kf(t, [[0, [-150, -300]], [3.2, [-150, -300]], [3.5, [-14, -112]], [10.9, [-14, -112]], [11.0, tA], [18.0, tA], [18.15, [22, -100]], [21.4, [22, -100]], [21.5, tA]]);
  const c = kf(t, [[0, [58, -120]], [3.3, [58, -120]], [3.5, tB], [9.5, tB], [9.7, [84, -210]], [10.8, [84, -210]], [11.0, tB], [18.0, tB], [18.15, [-22, -96]], [21.4, [-22, -96]], [21.5, tB]]);
  const sh = at(t, 9.6, 10.8) ? Math.sin(t * Math.PI * 6) * 10 : 0;
  p.phone = t < 11.0 ? { rot: t < 3.3 ? .5 : .12, dead: t < 3.3, blank: t >= 3.3 } : null;
  p.armA = { x: a[0], y: a[1], front: true, hand: t < 11 ? 'grab' : crossed ? 'fist' : 'open', bend: t < 3.3 ? -40 : undefined, rot: crossed ? .3 : undefined };
  p.armB = { x: c[0], y: c[1] + sh, front: true, hand: crossed ? 'fist' : t < 3.3 ? 'point' : 'open', rot: crossed ? Math.PI - .3 : t < 3.3 ? -.5 : undefined };
  return p;
}

// ———————————————————— shot 7: the old photograph, full frame ————————————————————
function photoShot(t) {
  const sg = SG, tq = twos(t); sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#7C7972'; sg.fillRect(0, 0, 1080, 1920);
  const k = seg(t, 26.5, 30.0), z = lerp(1.0, 1.06, ss(k));
  T.frame(t); T.transform(z, 0, 0, z, 540 * (1 - z), 960 * (1 - z)); T.translate(540, 900); T.rotate(-.035); T.translate(-540, -900);
  // the print: a white border, a folded corner
  T.shape([[150, 380], [840, 380], [930, 470], [930, 1420], [150, 1420]], { fill: P.paper });
  T.shape([[840, 380], [840, 470], [930, 470]], { fill: P.light, lw: T.S.lw * .8 });
  const img = T.shape(T.rect(205, 440, 670, 860), { fill: '#C4C1B7', stroke: false, boil: 0 });
  sg.save(); sg.clip(img);
  T.shape(T.ell(700, 560, 60, 60), { fill: P.paper, stroke: false, boil: 0 });                                  // a pale sun
  T.shape(T.spline([[205, 1300], [205, 900], [300, 840], [420, 880], [540, 820], [680, 870], [800, 830], [875, 880], [875, 1300]], true, 6), { fill: '#A19E95', stroke: false, boil: 0 });
  // Papi, forty years younger: the same beret, a black moustache
  papi({ x: 570, y: 1440, k: 1.6, seated: true, turn: -.25, look: { lx: -.5, ly: .6 }, lid: .15, eyes: 'happy', stache: .8, stacheCol: P.ink, brows: [{ tilt: .4 }, { tilt: .4 }],
    armA: { x: -70, y: -150, hand: 'open', rot: .3, front: true, bend: -30 }, armB: { x: 20, y: -128, hand: 'open', rot: Math.PI - .2, front: true, flip: true, bend: 26 },
    held: () => {   // the baby moved: he is a little blurred
      sg.filter = 'blur(5px)';
      T.shape(T.spline([[-150, -150], [-130, -210], [-40, -214], [30, -170], [20, -112], [-70, -96], [-140, -110]], true, 6), { fill: P.pale, lw: T.S.lw * .8 });
      T.shape(T.ell(-108, -196, 38, 36), { fill: P.white, lw: T.S.lw * .8 }); T.dot(-120, -200, 4.5); T.dot(-98, -202, 4.5); T.stroke(T.arc(-108, -186, 9, 6, .3, Math.PI - .3, 5), T.S.lw * .5);
      sg.filter = 'none';
    } });
  sg.restore();
  T.outline(img, 4, '#55534E');
  // the glove that holds it, and Léo leaning in
  T.reset(); T.transform(z, 0, 0, z, 540 * (1 - z), 960 * (1 - z));
  hose([1180, 1760], [900, 1450], -40, 46); glove(900, 1450, -2.5, 'grab', 3.0, { flip: true });
  const lean = ss(seg(tq, 26.6, 27.2));
  leo({ x: lerp(-60, 150, lean), y: 2060, k: 2.0, seated: true, turn: .6, lean: .12, look: { lx: .8, ly: -.5 }, eyes: 'wide', brows: 'up', browUp: 1, mouth: { type: 'o' }, talk: talkOf('leo', tq), hair: .3, armA: { x: -40, y: -60 }, armB: { x: 40, y: -60 } });
}

// ———————————————————— cameras ————————————————————
function camOf(t) {
  const i = shotAt(t);
  if (i === 0) { const k = ss(seg(t, 0, 3.5)); return { x: 590, y: 700, z: lerp(1.85, 1.95, k) }; }
  if (i === 1) return { x: 700, y: 648, z: lerp(2.9, 3.05, seg(t, 3.5, 6.5)) };
  if (i === 2) return { x: 495, y: 718, z: 2.45 };
  if (i === 3) { const k = seg(t, 11, 18); return { x: 728, y: lerp(685, 668, k), z: lerp(2.1, 2.3, k) }; }
  if (i === 4) return { x: 525, y: 715, z: 2.6 };
  if (i === 5) { const k = seg(t, 21.5, 26.5); return { x: lerp(705, 690, k), y: lerp(705, 712, k), z: lerp(2.15, 2.45, ss(k)) }; }
  const k = seg(t, 30, 35); return { x: 615, y: lerp(708, 700, k), z: lerp(2.0, 2.3, ss(k)) };
}
const toScreen = (c, x, y) => [540 + (x - c.x) * c.z, 960 + (y - c.y) * c.z];

// ———————————————————— one frame ————————————————————
export function drawScene(t, nosub) {
  const sg = SG, c = camOf(t), b = breath(t), bt = beats(twos(t)), tq = twos(t);
  if (shotAt(t) === 6) { photoShot(t); if (!nosub) subtitles(t); return; }
  drawBG(sg, BG, c, b * .005);
  T.frame(t); T.transform(c.z, 0, 0, c.z, 540 - c.x * c.z, 960 - c.y * c.z);
  if (t >= 21.5) {   // the window light, from the moment the wallet comes out
    const [hx, hy] = toScreen(c, 562, 420); sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(hx, hy); sg.rotate(Math.floor(t * 12) * .01);
    sg.fillStyle = `rgba(252,251,247,${.04 + .13 * ss(seg(t, 22.5, 24.4))})`;
    for (let i = 0; i < 12; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.arc(0, 0, 2400, i * Math.PI / 6, i * Math.PI / 6 + Math.PI / 12); sg.closePath(); sg.fill(); }
    sg.restore();
  }
  wallClock(b, t, bt); flourJar(b); hangingPans(b, t);
  chair();
  const lp = leoPose(t), pp = papiPose(t);
  if (t < 3.5) { papi(pp); leo(lp); } else { leo(lp); papi(pp); }   // for the selfie he leans in front of his grandfather
  table(b);
  if (at(t, 6.9, 11.0)) selfieCard(404, 792, back(seg(t, 6.9, 7.15), 2.2));
  // the flash
  for (const f of FLASH) { const a = t - f; if (a >= 0 && a < .2) { sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = `rgba(252,251,247,${.95 * (1 - a / .2)})`; sg.fillRect(0, 0, 1080, 1920); sg.restore(); } }
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
