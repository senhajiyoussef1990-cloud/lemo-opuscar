// kitchen.js — Papi's kitchen: a greyscale "watercolour" background painted once (never boils) + the living props that breathe on the beat.
// World: floor line y = 1000. Door on the left, Léo's side table, the stove in the middle, Papi's place on the right.
import * as T from './toon.js';
import { P, pieEye, mouth } from './parts.js';
import { mulberry, TAU } from '/core/lib.js';
const { shape, stroke, ell, arc, rr, rect, spline, quad, push, pop, translate, rotate, scale } = T;

export const FLOOR = 1000, STOVE = { x: 560, top: 800, w: 230 }, TABLE = { x: 240, top: 880 }, PAN_REST = { x: 575, y: 792 };

// —— painting helpers (from the style engine's bg.js) ——
export function wash(pts, col, o = {}) {
  const g = T.g, Pth = shape(pts, { fill: col, stroke: false, boil: 0 });
  const rnd = mulberry(o.seed ?? 7);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clip(Pth);
  const bb = pts.map(p => T.tx(p[0], p[1])), xs = bb.map(p => p[0]), ys = bb.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const n = Math.min(110, Math.max(8, ((x1 - x0) * (y1 - y0)) / 9000 | 0));
  g.filter = 'blur(10px)';
  for (let i = 0; i < n; i++) { const r = 20 + rnd() * 90; g.fillStyle = rnd() > .5 ? `rgba(30,28,25,${.03 + rnd() * .05})` : `rgba(255,253,245,${.03 + rnd() * .05})`; g.beginPath(); g.ellipse(x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0), r, r * (.5 + rnd() * .6), rnd() * 3, 0, 7); g.fill(); }
  if ((o.edge ?? .16) > 0) { g.filter = 'blur(7px)'; g.strokeStyle = `rgba(20,18,16,${o.edge ?? .16})`; g.lineWidth = 26; g.stroke(Pth); }
  g.filter = 'none'; g.restore();
  if (o.line !== false) T.outline(Pth, o.lw ?? 3.2, o.lineCol ?? '#2A2927');
  return Pth;
}
function paperGrain(g, w, h, seed = 3) {
  const rnd = mulberry(seed); g.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < w * h / 900; i++) { g.fillStyle = rnd() > .5 ? 'rgba(20,18,15,.06)' : 'rgba(255,255,250,.05)'; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
}
function withCanvas(bg, fn) {
  const prev = T.g, oldB = T.BASE.slice(), oldL = T.S.lwScale, { PS, ox, oy } = bg;
  T.init(bg.cv); T.BASE.splice(0, 6, PS, 0, 0, PS, -ox * PS, -oy * PS); T.S.lwScale = PS; T.frame(0, { amp: 0 });
  fn(T.g); T.g.setTransform(1, 0, 0, 1, 0, 0);
  paperGrain(T.g, bg.cv.width, bg.cv.height, ox + 3);
  T.BASE.splice(0, 6, ...oldB); T.S.lwScale = oldL; T.init(prev.canvas);
}
function makeBG(x0, y0, x1, y1, PS) { const cv = document.createElement('canvas'); cv.width = Math.round((x1 - x0) * PS); cv.height = Math.round((y1 - y0) * PS); return { cv, ox: x0, oy: y0, PS, w: x1 - x0, h: y1 - y0 }; }
// cam = {x,y,z}: world point at the centre of the 1080×1920 scene; squash = the whole painting breathes around the floor line
export function drawBG(sg, bg, cam, squash = 0) {
  const z = cam.z, ox = 540 - cam.x * z, oy = 960 - cam.y * z;
  sg.save(); sg.setTransform(z, 0, 0, z, ox, oy);
  if (squash) { sg.translate(0, FLOOR); sg.scale(1 - squash * .4, 1 + squash); sg.translate(0, -FLOOR); }
  sg.drawImage(bg.cv, bg.ox, bg.oy, bg.w, bg.h); sg.restore();
}

export function paintKitchen() {
  const bg = makeBG(-260, -500, 1340, 1400, 1.4);
  withCanvas(bg, () => {
    const L = '#2A2927';
    // wall + wallpaper (small diamonds), picture rail
    wash(rect(-270, -510, 1620, 1240), '#918E86', { line: false, seed: 11, edge: 0 });
    for (let j = 0; j < 22; j++) for (let i = 0; i < 28; i++) { const x = -250 + i * 58 + (j % 2) * 29, y = -480 + j * 56; shape([[x, y - 9], [x + 7, y], [x, y + 9], [x - 7, y]], { fill: '#9D9A92', stroke: false, boil: 0 }); }
    wash(rect(-270, -150, 1620, 26), '#6F6D67', { seed: 12, edge: .1 });
    // wainscot
    wash(rect(-270, 720, 1620, 280), '#77746E', { seed: 13 });
    for (let x = -230; x < 1340; x += 150) wash(rr(x, 752, 122, 216, 8), '#817E77', { seed: 20 + x, lw: 2.4, edge: .2 });
    wash(rect(-270, 706, 1620, 22), '#5F5D58', { seed: 14, edge: .1 });
    // checker floor
    wash(rect(-270, FLOOR, 1620, 420), '#A6A39A', { seed: 15, edge: 0 });
    for (let r = 0; r < 5; r++) { const y0 = FLOOR + r * r * 9 + r * 26, h = 30 + r * 18, sx = 96 + r * 14; for (let i = -6; i < 16; i++) if ((i + r) % 2 === 0) shape(rect(540 + (i - 5) * sx, y0, sx, h), { fill: '#4A4845', stroke: false, boil: 0 }); }
    stroke([[-270, FLOOR], [1350, FLOOR]], 4, { boil: 0 });
    // door (left)
    wash(rr(14, 396, 182, 610, 6), '#5A5853', { seed: 30 });
    wash(rr(34, 420, 142, 250, 6), '#66645E', { seed: 31, lw: 2.4 }); wash(rr(34, 700, 142, 270, 6), '#66645E', { seed: 32, lw: 2.4 });
    shape(ell(170, 700, 11, 11), { fill: '#BDBAB1', lw: 3, boil: 0, line: L });
    // shelf with jars (left of the window)
    wash(rect(214, 566, 196, 16), '#55534E', { seed: 33 });
    stroke([[236, 582], [236, 612], [262, 582]], 3, { boil: 0, line: L }); stroke([[388, 582], [388, 612], [362, 582]], 3, { boil: 0, line: L });
    wash(rr(232, 500, 44, 66, 8), '#B4B1A8', { seed: 34, lw: 2.6 }); wash(rect(236, 490, 36, 12), '#6A6862', { seed: 35, lw: 2.4 });
    // window above the stove, a small garden outside
    wash(rr(432, 262, 260, 316, 8), '#D9D6CC', { seed: 36, edge: .05 });
    wash(spline([[432, 578], [432, 500], [470, 468], [520, 492], [560, 452], [620, 476], [660, 446], [692, 470], [692, 578]], true, 6), '#A9A69D', { seed: 37, lw: 2.2, lineCol: '#6A6862' });
    shape(ell(640, 330, 30, 30), { fill: '#F1EEE6', stroke: false, boil: 0 });
    for (const [x0, y0, x1, y1] of [[562, 262, 562, 578], [432, 420, 692, 420]]) stroke([[x0, y0], [x1, y1]], 7, { boil: 0, line: '#55534E' });
    T.outline(shape(rr(432, 262, 260, 316, 8), { stroke: false, boil: 0 }), 9, '#4A4845');
    wash(rect(416, 578, 292, 20), '#55534E', { seed: 38 });
    for (const s of [-1, 1]) wash(spline([[562 + s * 146, 250], [562 + s * 84, 250], [562 + s * 96, 380], [562 + s * 120, 470], [562 + s * 150, 520]], true, 6), '#C9C6BC', { seed: 39 + s, lw: 2.6 });
    wash(rect(404, 236, 316, 18), '#4A4845', { seed: 41 });
    // rail for the hanging pans (right)
    stroke([[730, 380], [1010, 380]], 7, { boil: 0, line: '#3B3A37' });
    for (const x of [736, 1004]) stroke([[x, 380], [x, 352]], 5, { boil: 0, line: '#3B3A37' });
    // tall cupboard on the far right
    wash(rr(960, 470, 300, 536, 8), '#5F5D58', { seed: 42 });
    wash(rr(982, 494, 120, 220, 6), '#6B6963', { seed: 43, lw: 2.4 }); wash(rr(1118, 494, 120, 220, 6), '#6B6963', { seed: 44, lw: 2.4 });
    wash(rr(982, 740, 256, 240, 6), '#6B6963', { seed: 45, lw: 2.4 });
    // Léo's side table (the phone ends up here)
    wash(rect(TABLE.x - 52, TABLE.top, 104, 14), '#4A4845', { seed: 46 });
    for (const s of [-1, 1]) wash([[TABLE.x + s * 40 - 6, TABLE.top + 14], [TABLE.x + s * 40 + 6, TABLE.top + 14], [TABLE.x + s * 46 + 5, FLOOR], [TABLE.x + s * 46 - 5, FLOOR]], '#55534E', { seed: 47 + s, lw: 2.4 });
    wash([[TABLE.x - 44, TABLE.top + 14], [TABLE.x + 44, TABLE.top + 14], [TABLE.x + 38, TABLE.top + 40], [TABLE.x - 38, TABLE.top + 40]], '#C4C1B8', { seed: 49, lw: 2.2 });   // a bit of tablecloth
    for (let i = 0; i < 4; i++) shape(rect(TABLE.x - 40 + i * 22, TABLE.top + 16, 11, 22), { fill: '#8C8981', stroke: false, boil: 0 });
  });
  return bg;
}

// —— living props: b = breath (−1..1, + = stretch on the beat) ——
const breathe = (b, a = .05) => scale(1 - b * a * .6, 1 + b * a);
export function stove(b, t, flame = 1) {
  const { x, top, w } = STOVE;
  push(); translate(x, FLOOR); breathe(b, .035);
  const h = FLOOR - top;
  for (const s of [-1, 1]) shape([[s * (w / 2 - 34), -26], [s * (w / 2 - 10), -26], [s * (w / 2 - 4), 0], [s * (w / 2 - 30), 0]], { fill: P.dark });
  shape(rr(-w / 2, -h, w, h - 22, 16), {
    fill: P.dmid, shade: () => { T.g.fillStyle = 'rgba(14,13,12,.2)'; const a = T.tx(w / 2 - 44, -h), c = T.tx(w / 2 + 6, 0); T.g.setTransform(1, 0, 0, 1, 0, 0); T.g.fillRect(a[0], a[1], c[0] - a[0], c[1] - a[1]); }
  });
  shape(rr(-w / 2 - 12, -h - 14, w + 24, 26, 10), { fill: P.dark });                 // top plate
  shape(rr(-74, -h + 62, 148, 92, 12), { fill: P.dark });                            // oven door
  shape(rr(-54, -h + 78, 108, 44, 8), { fill: P.light, lw: T.S.lw * .7 });
  stroke([[-50, -h + 134], [50, -h + 134]], T.S.lw * 1.2);
  for (const kx of [-78, -26, 26, 78]) shape(ell(kx, -h + 34, 11, 11), { fill: P.white, lw: T.S.lw * .7 });
  // burner flames under the pan
  if (flame > 0) for (let i = 0; i < 5; i++) { const fx = PAN_REST.x - x - 34 + i * 17, fh = (10 + 7 * Math.sin(Math.floor(t * 12) * 2.1 + i * 1.9)) * flame; shape([[fx - 5, -h - 14], [fx, -h - 14 - fh], [fx + 5, -h - 14]], { fill: P.white, lw: T.S.lw * .5 }); }
  pop();
}
export function hangingPans(b, t) {
  const xs = [778, 868, 958];
  xs.forEach((x, i) => {
    push(); translate(x, 380); rotate((i % 2 ? -1 : 1) * b * .09);
    stroke([[0, 0], [0, 26]], T.S.lw * .7);
    shape(rr(-7, 22, 14, 70 - i * 8, 6), { fill: P.dark });
    shape(ell(0, 128 - i * 8, 44 - i * 4, 44 - i * 4), { fill: i === 1 ? P.light : P.mid });
    shape(arc(0, 128 - i * 8, 30 - i * 4, 30 - i * 4, -2.4, -.9, 8), { closed: false, lw: T.S.lw * .6, line: P.white });
    pop();
  });
}
export function wallClock(b, t, beats) {
  push(); translate(105, 268); breathe(b, .04);
  shape(ell(0, 0, 58, 58), { fill: P.dark });
  shape(ell(0, 0, 46, 46), { fill: P.white, lw: T.S.lw * .7 });
  for (let i = 0; i < 12; i += 3) { const a = i / 12 * TAU; stroke([[Math.cos(a) * 36, Math.sin(a) * 36], [Math.cos(a) * 42, Math.sin(a) * 42]], T.S.lw * .6, { boil: .3 }); }
  pieEye(-15, -8, 10, 14, { lx: .5, ly: .4, lwk: .6 }); pieEye(15, -8, 10, 14, { lx: .5, ly: .4, lwk: .6 });
  mouth(0, 20, 22, 'smile');
  pop();
  push(); translate(105, 326); rotate(Math.sin(beats * Math.PI) * .32);   // pendulum: one swing per beat
  stroke([[0, 0], [0, 74]], T.S.lw * .7); shape(ell(0, 86, 15, 15), { fill: P.light, lw: T.S.lw * .7 });
  pop();
}
export function flourJar(b) {
  push(); translate(340, 566); breathe(b, .07);
  shape(rr(-34, -86, 68, 86, 12), { fill: P.white });
  shape(rr(-38, -100, 76, 18, 6), { fill: P.dark });
  T.text('FARINE', 0, -42, { font: '15px Limelight', fill: P.ink });
  stroke([[-24, -28], [24, -28]], T.S.lw * .5, { boil: .3 });
  pop();
}
export function phoneOnTable() {
  push(); translate(TABLE.x + 4, TABLE.top - 5);
  shape(rr(-30, -5, 60, 10, 4), { fill: P.dark, lw: T.S.lw * .7 });
  pop();
}
