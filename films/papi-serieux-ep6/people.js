// people.js — Papi Gaston and Léo as rubber-hose characters, plus the pan and the crêpe.
// Local coordinates: origin = the floor between the feet, y positive downwards. Papi is ~365 tall, Léo ~270.
import * as T from './toon.js';
import { P, pieEye, brow, mouth, glove, shoe, hose, union, ribbon } from './parts.js';
import { clamp, lerp } from '/core/lib.js';
import { PICTO } from './pictos.js';
const { shape, stroke, ell, arc, spline, quad, rr, push, pop, translate, rotate, scale, tx, S } = T;

function fillLocal(pts, col) { const s = pts.map(p => tx(p[0], p[1])); const g = T.g; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = col; g.beginPath(); g.moveTo(s[0][0], s[0][1]); for (const q of s) g.lineTo(q[0], q[1]); g.closePath(); g.fill(); }
const SHADOW = 'rgba(14,13,12,.17)';

// arm: a black hose from the shoulder to the hand, then the glove. a = { x, y, hand, rot, bend, k, flip, sleeve }
function arm(sh, a, col = P.ink, w = 15, mid = null) {
  const k = a.k || 1, hx = a.x, hy = a.y;
  const dir = Math.atan2(hy - sh[1], hx - sh[0]);
  hose(sh, [hx, hy], a.bend ?? 14 * Math.sign(hx - sh[0] || 1), w, col);
  if (mid) mid(hx, hy);
  glove(hx, hy, a.rot ?? dir, a.hand || 'open', k, { flip: a.flip ?? (hx < sh[0]) });
}

// ———————————————————— Papi Gaston ————————————————————
// p: { x, y, k, sx, sy, lean, turn (−1 = facing left … +1 right), look:{lx,ly}, lid, eyes ('open'|'happy'), wink,
//      brows:[{raise,tilt},{raise,tilt}] (0 = his right/left on screen: left, right), talk 0..1, stache (−1 droop … +1 proud), tremble,
//      seated (no legs), shrug 0..1, armA (stove side, −x), armB (+x): { x, y, hand, rot, bend, k, front }, held: fn drawn at armA's hand }
export function papi(p) {
  const turn = p.turn ?? 0, fx = turn * 22, sh = (p.shrug || 0) * 16;
  push(); translate(p.x, p.y); scale(p.k || 1); scale(p.sx || 1, p.sy || 1); if (p.lean) rotate(p.lean);
  const A = p.armA || { x: -70, y: -130 }, B = p.armB || { x: 70, y: -130 };
  const shA = [-62, -236 - sh], shB = [62, -236 - sh];
  // legs + shoes
  if (!p.seated) {   // seated behind a table: the legs are hidden
    hose([-26, -100], [-32, -16], -4, 18); hose([26, -100], [32, -16], 4, 18);
    shoe(-22, 0, -1, 1.3); shoe(22, 0, 1, 1.3);
  }
  if (!A.front) arm(shA, A, P.ink, 15, p.held);
  if (!B.front) arm(shB, B, P.ink, 15, p.heldB);
  // body: white shirt, dark trousers, suspenders
  const body = spline([[-60, -250 - sh], [-84, -180], [-86, -120], [-56, -92], [0, -86], [56, -92], [86, -120], [84, -180], [60, -250 - sh], [0, -262 - sh * .4]], true, 8);
  shape(body, {
    fill: P.white, shade: () => {
      fillLocal([[-120, -134], [120, -134], [120, -60], [-120, -60]], P.dark);
      for (const s of [-1, 1]) fillLocal([[s * 46 - 9, -134], [s * 46 + 9, -134], [s * 34 + 9, -280], [s * 34 - 9, -280]], P.dmid);
      fillLocal([[50, -300], [130, -300], [130, -40], [62, -40]], SHADOW);
    }
  });
  stroke([[-84, -134], [84, -134]], S.lw * .7);
  for (const s of [-1, 1]) T.dot(s * 45, -144, 4.5, P.white);
  for (const yy of [-216, -186, -158]) T.dot(0, yy, 3.6);
  // head
  push(); translate(8 * turn, -306 - sh * .5); if (p.headRot) rotate(p.headRot); scale(p.hsx || 1, p.hsy || 1);
  for (const s of [-1, 1]) if (s * turn < .5) shape(ell(s * 66 - fx * .3, 6, 13, 18), { fill: P.white });
  shape(ell(0, 0, 68, 64), { fill: P.white, shade: () => fillLocal([[50, -80], [90, -80], [90, 80], [58, 80]], SHADOW) });
  // mouth (under the moustache)
  const open = p.talk || 0;
  if (open > .08) shape(ell(fx, 42 + open * 4, 13 + open * 3, 4 + open * 13), { fill: P.ink, lw: S.lw * .8 });
  else if ((p.stache || 0) > .4) stroke(quad([fx - 20, 40], [fx, 52], [fx + 20, 40]), S.lw * .8);
  // moustache: two fat lobes; it carries the mood
  const st = p.stache || 0, tr = p.tremble || 0;
  const lobes = [-1, 1].map(s => ribbon(quad([fx + s * 3, 26], [fx + s * 32, 22 - st * 10], [fx + s * 60, 36 - st * 22 + tr * s], 10), 27, 9));
  union(lobes, P.white);
  for (const s of [-1, 1]) stroke(quad([fx + s * 16, 30], [fx + s * 30, 32 - st * 6], [fx + s * 44, 36 - st * 14 + tr * s], 6), S.lw * .45, { boil: .5 });
  shape(ell(fx + turn * 8, 14, 16, 13), { fill: P.pale, lw: S.lw * .85 });
  // eyes + bushy brows
  const look = p.look || {}, lid = p.lid ?? .12;
  [-1, 1].forEach((s, i) => {
    const ex = fx + s * 23, far = s * turn > 0 ? 1 - Math.abs(turn) * .22 : 1;
    const type = p.wink === i ? 'shut' : (p.eyes || 'open');
    pieEye(ex, -10, 15 * far, 21, { lx: look.lx ?? 0, ly: look.ly ?? 0, lid, lidCol: P.white, type });
    const b = (p.brows && p.brows[i]) || {}, r = b.raise || 0, tl = b.tilt || 0;   // tilt > 0 = inner end up (worried), < 0 = inner end down (stern)
    shape(ribbon(quad([ex - s * 15, -38 - r * 12 - tl * 7], [ex, -46 - r * 14], [ex + s * 17, -36 - r * 10 + tl * 5], 8), 12, 8), { fill: P.white, lw: S.lw * .8 });
  });
  // beret
  shape(spline([[-64 + fx * .2, -34], [-74, -58], [-34, -84], [22, -86], [70, -64], [68, -38], [24, -47], [-28, -44]], true, 7), { fill: P.ink });
  stroke([[2, -84], [8, -98]], S.lw * .9);
  shape(ell(-26, -66, 16, 5, 12, -.3), { fill: P.dmid, stroke: false, boil: .3 });
  pop();
  if (A.front) arm(shA, A, P.ink, 15, p.held);
  if (B.front) arm(shB, B, P.ink, 15, p.heldB);
  pop();
}

// ———————————————————— Léo ————————————————————
// p: { x, y, k, sx, sy, lean, turn, look, lid, eyes ('open'|'wide'|'happy'), brows ('up'|'sad'|'angry'|'flat'|null), mouth:{type,open}, talk,
//      hair (tuft stretch), phones (headphone bounce, px), armA (−x: the phone hand), armB (+x), phone: {rot, n (like counter), wifi ('off' | 'on'), batt (0..1), blank, dead, icon (a pictogram of pictos.js)} | null, seated, run 0..1 (windmill legs), runPh }
export function leo(p) {
  const turn = p.turn ?? 0, fx = turn * 18;
  push(); translate(p.x, p.y); scale(p.k || 1); scale(p.sx || 1, p.sy || 1); if (p.lean) rotate(p.lean);
  const A = p.armA || { x: -52, y: -86 }, B = p.armB || { x: 52, y: -86 };
  const shA = [-44, -150], shB = [44, -150];
  // legs: standing, or a windmill when running
  if (p.seated) { /* seated behind a table: the legs are hidden */ }
  else if (p.run) {
    for (const [s, ph] of [[-1, 0], [1, Math.PI]]) { const a = (p.runPh || 0) + ph, fxp = Math.cos(a) * 34, fyp = -22 + Math.sin(a) * 20; hose([s * 14, -74], [fxp, Math.min(-4, fyp)], 10, 15); shoe(fxp - 8, Math.min(0, fyp + 6), 1, 1.05, Math.sin(a) * .5); }
  } else {
    hose([-20, -74], [-24, -14], -3, 15); hose([20, -74], [24, -14], 3, 15);
    shoe(-17, 0, -1, 1.08); shoe(17, 0, 1, 1.08);
  }
  const phone = () => { if (!p.phone) return; push(); translate(A.x, A.y); rotate(p.phone.rot ?? -.2); shape(rr(-17, -52, 34, 60, 6), { fill: P.dark, lw: S.lw * .8 }); shape(rr(-12, -46, 24, 44, 3), { fill: p.phone.dead ? P.ink : P.white, stroke: false, boil: .3 }); if (p.phone.dead || p.phone.blank) { /* nothing on the screen */ } else if (p.phone.icon) { PICTO[p.phone.icon](0, -24, 9); } else if (p.phone.batt != null) { battery(0, -26, 17, p.phone.batt, S.lw * .5); } else if (p.phone.wifi) { wifi(0, -18, 5.2, p.phone.wifi === 'off', S.lw * .55); } else if (p.phone.n != null) { shape(heart(0, -38, 6.5), { fill: P.ink, stroke: false, boil: .3 }); T.text(String(p.phone.n), 0, -22, { font: '15px Limelight', fill: P.ink }); } else for (let i = 0; i < 4; i++) fillLocal([[-8, -40 + i * 9], [i % 2 ? 4 : 8, -40 + i * 9], [i % 2 ? 4 : 8, -36 + i * 9], [-8, -36 + i * 9]], P.mid); pop(); };
  if (!A.front) { hose(shA, [A.x, A.y], A.bend ?? -12, 15, P.pale); phone(); glove(A.x, A.y, A.rot ?? Math.atan2(A.y - shA[1], A.x - shA[0]), A.hand || 'grab', .88, { flip: true }); }
  if (!B.front) { hose(shB, [B.x, B.y], B.bend ?? 12, 15, P.pale); glove(B.x, B.y, B.rot ?? Math.atan2(B.y - shB[1], B.x - shB[0]), B.hand || 'open', .88, {}); }
  // hood (behind the head) + oversized hoodie
  shape(ell(0, -166, 50, 30), { fill: P.pale });
  shape(spline([[-46, -160], [-62, -104], [-60, -66], [0, -58], [60, -66], [62, -104], [46, -160], [0, -168]], true, 8), {
    fill: P.pale, shade: () => fillLocal([[36, -200], [90, -200], [90, -40], [44, -40]], SHADOW)
  });
  stroke(quad([-30, -92], [0, -84], [30, -92]), S.lw * .6); stroke([[-30, -92], [-34, -66]], S.lw * .6); stroke([[30, -92], [34, -66]], S.lw * .6);   // pocket
  stroke([[-9, -150], [-11, -118]], S.lw * .55); stroke([[9, -150], [11, -122]], S.lw * .55);                                                          // drawstrings
  // head
  push(); translate(6 * turn, -214); if (p.headRot) rotate(p.headRot); scale(p.hsx || 1, p.hsy || 1);
  for (const s of [-1, 1]) if (s * turn < .5) shape(ell(s * 60 - fx * .3, 6, 11, 15), { fill: P.white });
  shape(ell(0, 0, 62, 58), { fill: P.white, shade: () => fillLocal([[36, -70], [80, -70], [80, 70], [48, 70]], SHADOW) });
  const look = p.look || {}, et = p.eyes || 'open';
  [-1, 1].forEach(s => {
    const ex = fx + s * 21, far = s * turn > 0 ? 1 - Math.abs(turn) * .22 : 1;
    pieEye(ex, -4, 14.5 * far, 21, { lx: look.lx ?? 0, ly: look.ly ?? 0, lid: p.lid ?? 0, lidCol: P.white, type: et, side: -s });
    if (p.brows) brow(ex, -40 - (p.browUp || 0) * 8, 30, p.brows, s);
  });
  stroke(arc(fx + turn * 6, 18, 6, 5, .2, Math.PI - .2, 6), S.lw * .7);                       // nose
  for (const s of [-1, 1]) for (const [dx, dy] of [[0, 0], [9, 5], [-2, 9]]) T.dot(fx + s * 38 + dx * s, 20 + dy, 1.8);   // freckles
  const talk = p.talk || 0, m = p.mouth || { type: 'smile' };
  if (talk > .12) mouth(fx, 32, 34, talk > .55 ? 'open' : 'o', { open: talk > .55 ? .35 + talk * .4 : .7 + talk * .5 });
  else mouth(fx, 34, m.w || 34, m.type, { open: m.open ?? .6 });
  // messy hair: one inked spiky cap, the tuft stretches with the mood
  const hs = 1 + (p.hair || 0) * .35;
  shape([[-60, -8], [-66, -34], [-52, -30], [-56, -58 * hs], [-36, -48], [-32, -76 * hs], [-13, -56], [0, -86 * hs], [12, -58], [30, -78 * hs], [34, -50], [54, -60 * hs], [50, -32], [66, -36], [60, -8], [34, -28], [4, -34], [-30, -28]].map(q => [q[0] + fx * .15, q[1]]), { fill: P.ink });
  pop();
  // headphones around the neck
  const hp = -(p.phones || 0);
  stroke(arc(0, -158 + hp, 46, 22, .1, Math.PI - .1, 12), S.lw * 1.5);
  for (const s of [-1, 1]) shape(ell(s * 48, -160 + hp, 13, 18), { fill: P.dark });
  if (A.front) { hose(shA, [A.x, A.y], A.bend ?? -12, 15, P.pale); phone(); glove(A.x, A.y, A.rot ?? Math.atan2(A.y - shA[1], A.x - shA[0]), A.hand || 'grab', .88, { flip: true }); }
  if (B.front) { hose(shB, [B.x, B.y], B.bend ?? 12, 15, P.pale); glove(B.x, B.y, B.rot ?? Math.atan2(B.y - shB[1], B.x - shB[0]), B.hand || 'open', .88, {}); }
  pop();
}

// a battery, centred on (x, y), w wide, filled to level 0..1 (bars = segments drawn when > 0)
export function battery(x, y, w, level, lw = S.lw, bars = 0) {
  const h = w * .5;
  shape(rr(x - w / 2, y - h / 2, w, h, h * .18), { fill: P.white, lw });
  shape(rr(x + w / 2, y - h * .2, w * .09, h * .4, 1), { fill: P.ink, lw: lw * .6 });
  if (bars) { const n = Math.round(level * bars), bw = (w - h * .3) / bars; for (let i = 0; i < n; i++) fillLocal([[x - w / 2 + h * .15 + i * bw + bw * .1, y - h * .32], [x - w / 2 + h * .15 + (i + 1) * bw - bw * .1, y - h * .32], [x - w / 2 + h * .15 + (i + 1) * bw - bw * .1, y + h * .32], [x - w / 2 + h * .15 + i * bw + bw * .1, y + h * .32]], P.ink); }
  else if (level > 0) fillLocal([[x - w / 2 + h * .16, y - h * .3], [x - w / 2 + h * .16 + (w - h * .32) * level, y - h * .3], [x - w / 2 + h * .16 + (w - h * .32) * level, y + h * .3], [x - w / 2 + h * .16, y + h * .3]], P.ink);
}
// the Wi-Fi sign: a dot and three arcs, s = spacing; crossed out when the network is down
export function wifi(x, y, s, off = false, lw = S.lw) {
  T.dot(x, y, s * .45);
  for (let i = 1; i <= 3; i++) stroke(arc(x, y, s * 1.5 * i, s * 1.5 * i, -Math.PI * .78, -Math.PI * .22, 10), lw, { boil: .4 });
  if (off) { stroke([[x - s * 4, y - s * 5], [x + s * 4, y + s * 1.5]], lw * 1.3, { boil: .4 }); stroke([[x + s * 4, y - s * 5], [x - s * 4, y + s * 1.5]], lw * 1.3, { boil: .4 }); }
}
// a heart, centred on (cx, cy), about 2·s wide
export function heart(cx, cy, s) { const q = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; q.push([cx + s * Math.pow(Math.sin(a), 3), cy - s * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]); } return q; }

// ———————————————————— the pan and the crêpe ————————————————————
// The handle's end is at the origin; dir = −1: the bowl is to the left of the handle (Papi's grip), +1 to the right. sx fakes a turn in depth.
export function pan(x, y, dir = -1, rot = 0, sxk = 1, crepeIn = true) {
  push(); translate(x, y); rotate(rot); scale(dir * sxk, 1);
  shape(rr(0, -7, 78, 14, 6), { fill: P.dark });
  shape(spline([[62, -12], [66, 6], [84, 17], [150, 17], [168, 6], [172, -12]], true, 6), { fill: P.dark });
  stroke([[70, -12], [164, -12]], S.lw * .7, { line: P.light });
  if (crepeIn) shape(ell(117, -15, 42, 6.5, 22), { fill: P.paper, lw: S.lw * .8 });
  pop();
}
export const PAN_C = 117;   // distance handle end → bowl centre
export function crepe(x, y, flip, rot = 0, k = 1) {
  const c = Math.cos(flip);
  push(); translate(x, y); rotate(rot);
  shape(ell(0, 0, 44 * k, (4 + 34 * Math.abs(c)) * k, 26), { fill: c >= 0 ? P.paper : P.pale, lw: S.lw * .85 });
  if (Math.abs(c) > .35) for (const [dx, dy] of [[-16, -6], [12, 4], [-2, 10], [20, -10]]) T.dot(dx * k, dy * c * k, 3.2 * k, P.mid);
  pop();
}
