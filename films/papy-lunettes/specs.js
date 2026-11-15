// specs.js — « L'histoire des lunettes »: the home and seven worlds, rich in period detail (see LIVRE-DE-PAPY-DIRECTION-ARTISTIQUE.md).
// The portal and the shared helpers come from worlds.js; period figures from people.js. Inserts sit around x 960 (INS in main.js).
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, bands } from './toon.js';
import { eye } from './chars.js';
import { figure, VIEW } from './people.js';
export { VIEW };
import { FLOOR, portal, GLOW, ground, hills, blink, birds, tree, groundBits, clouds } from './worlds.js';
export { FLOOR, portal, GLOW };
const X0 = -900, X1 = 2000;
export const darkness = () => 0;
export const SUN = { on: false };

// ———— glasses, by kind: 'stone' | 'rivet' | 'temple' | 'bifocal' | 'pince' | 'monocle' | 'sun' | 'lens' ————
export function specs(x, y, s = 1, { kind = 'temple', a = 0, frame = '#3a2a20', t = 0 } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  const lensF = 'rgba(210,235,255,.55)', glint = (cx, cy, r) => fillOnly(ell(cx - r * .35, cy - r * .35, r * .28, r * .16, 10), 'rgba(255,255,255,.85)', { boil: .2 });
  const ring = (cx, cy, r, fill = lensF, lw = 7) => shape(ell(cx, cy, r, r * .92, 30), { fill, lw, line: frame, shade: () => glint(cx, cy, r) });
  if (kind === 'stone') {   // a polished dome of glass that magnifies the letters under it
    shape([...arc(0, 0, 90, 70, Math.PI, TAU, 30), [90, 0], [-90, 0]], { fill: 'rgba(220,240,255,.6)', lw: 6, shade: () => { fillOnly(ell(-30, -40, 22, 12, 10), 'rgba(255,255,255,.9)', { boil: .2 }); for (let k = 0; k < 3; k++) stroke([[-60, -14 + k * -12], [60, -14 + k * -12]], 3, { line: 'rgba(60,40,30,.5)' }); } });
    stroke([[-90, 0], [90, 0]], 6); pop(); return;
  }
  if (kind === 'rivet') {   // two lenses in bone rings, joined by a rivet at the top; worn pinched on the nose
    for (const k of [-1, 1]) { ring(k * 64, 0, 52, lensF, 9); shape(rr(k * 14 - 6, -64, 12, 70, 5), { fill: '#e9d7a8', lw: 4 }); }
    shape(ell(0, -64, 12, 12, 10), { fill: '#b8874f', lw: 4 }); dot(0, -64, 4, '#3a2414'); pop(); return;
  }
  if (kind === 'monocle') { ring(0, 0, 54, lensF, 8); stroke(spline([[50, 20], [90, 80], [70, 160], [110, 230]], false), 3, { line: '#e9b949' }); for (let k = 0; k < 6; k++) dot(56 + k * 9, 40 + k * 34, 3, '#e9b949'); pop(); return; }
  if (kind === 'lens') {   // a soft contact lens, a thin glistening dome
    shape([...arc(0, 0, 60, 40, Math.PI, TAU, 24), [60, 0], [-60, 0]], { fill: 'rgba(170,230,255,.55)', lw: 4, shade: () => fillOnly(ell(-18, -22, 16, 7, 8), 'rgba(255,255,255,.95)', { boil: .2 }) }); stroke(quad([-60, 0], [0, 10], [60, 0], 10), 3); pop(); return;
  }
  const sun = kind === 'sun', L = sun ? 'rgba(40,30,50,.9)' : lensF;
  if (kind === 'pince') { for (const k of [-1, 1]) ring(k * 60, 0, 46, L, 6); stroke(spline([[-14, -10], [-8, -40], [8, -40], [14, -10]], false), 5, { line: frame }); for (const k of [-1, 1]) shape(rr(k * 18 - 6, 8, 12, 22, 5), { fill: '#e9d7a8', lw: 3 }); stroke(spline([[-106, 0], [-140, 60], [-120, 140]], false), 3, { line: '#3a3340' }); pop(); return; }
  // frames with temples (bars over the ears), seen from the front
  for (const k of [-1, 1]) {
    if (sun) shape(rr(k * 66 - 56, -40, 112, 82, 26), { fill: L, lw: 8, line: frame, shade: () => glint(k * 66, -2, 40) });
    else ring(k * 64, 0, 50, L, 7);
    if (kind === 'bifocal') { stroke([[k * 64 - 48, 10], [k * 64 + 48, 10]], 4, { line: frame }); fillOnly(ell(k * 64, 26, 30, 14, 12), 'rgba(255,255,255,.25)', { boil: .2 }); }
    stroke(spline([[k * 114, -6], [k * 150, -10], [k * 190, 0], [k * 200, 26]], false), 6, { line: frame });   // the temples
    dot(k * 112, -6, 5, '#e9b949');   // little hinges
  }
  stroke(quad([-16, -8], [0, -22], [16, -8], 6), 6, { line: frame });   // the bridge
  for (const k of [-1, 1]) shape(ell(k * 18, 18, 7, 10, 8), { fill: 'rgba(255,255,255,.7)', lw: 3 });   // nose pads
  pop();
}
export function titleProp(t) { specs(0, 30, .36, { kind: 'temple' }); }
// the pair of each era, held in Papy's hand (x, y = his fist)
const ERA = { w1: { kind: 'stone', s: .55, dy: -30 }, w2: { kind: 'rivet', s: .55, dy: -50 }, w3: { kind: 'temple', s: .5, dy: -40 }, w4: { kind: 'bifocal', s: .5, dy: -40 }, w5: { kind: 'monocle', s: .6, dy: -50 }, w6: { kind: 'sun', s: .48, dy: -40, frame: '#c22f3a' }, w7: { kind: 'lens', s: .55, dy: -20 } };
export function heldSpecs(w, t) { const e = ERA[w]; if (!e) return null; return (x, y) => specs(x, y + e.dy, e.s, { ...e, t }); }

// little helpers for the décors
const candle = (x, y, s, t, i = 0) => { push(); translate(x, y); scale(s); shape(rr(-12, -90, 24, 90, 4), { fill: '#f6efe0', lw: 4 }); const f = .9 + .1 * Math.sin(t * 9 + i); fillOnly(ell(0, -120, 34, 34, 16), 'rgba(255,200,90,.25)', { boil: .4 }); shape(spline([[0, -130 - 10 * f], [10, -104], [0, -92], [-10, -104]]), { fill: '#ffb23f', lw: 3 }); pop(); };
const book = (x, y, w, h, c, a = 0) => { push(); translate(x, y); rotate(a); shape(rr(-w / 2, -h, w, h, 4), { fill: c, lw: 4, shade: () => { fillOnly(rect(-w / 2, -h, 6, h), 'rgba(0,0,0,.2)', { boil: .2 }); fillOnly(rect(-w / 2 + 2, -h * .7, w - 4, 6), '#e9b949', { boil: .2 }); } }); pop(); };

// ———————————————————— home ————————————————————
export function home(t, { glow = 0, clockT = 0 } = {}) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#efe0c2', { boil: 0 });
  for (let x = -800; x < 2000; x += 180) stroke([[x, -1200], [x, FLOOR - 40]], 4, { line: '#e2cfab' });
  shape(rect(X0, FLOOR - 120, X1 - X0, 80), { fill: '#c9a978', lw: 6 });
  ground('#a67c52'); for (let k = 0; k < 4; k++) stroke([[X0, FLOOR + 40 + k * 70 + k * k * 16], [X1, FLOOR + 40 + k * 70 + k * k * 16]], 4, { line: '#8c6440' });
  shape(rr(-80, 420, 360, 440, 14), { fill: '#f6efe0', lw: 7 }); stroke([[100, 420], [100, 860]], 6); stroke([[-80, 640], [280, 640]], 6);
  shape(ell(860, 440, 70, 70, 36), { fill: '#fff8e8', lw: 7 }); const ma = clockT * .9 - 1.2; stroke([[860, 440], [860 + Math.cos(ma) * 48, 440 + Math.sin(ma) * 48]], 6); stroke([[860, 440], [890, 428]], 7);
  // a bookcase, a reading armchair, a newspaper with tiny print, an eye chart on the wall
  shape(rr(1000, 520, 320, 820, 10), { fill: '#8f6436', lw: 7 }); for (let r = 0; r < 4; r++) { shape(rect(1010, 720 + r * 180, 300, 16), { fill: '#6e4a26', lw: 4 }); for (let i = 0; i < 7; i++) book(1030 + i * 40, 716 + r * 180, 30, 120 + 30 * hash(i + r * 7), ['#c22f3a', '#3f5bd6', '#2fbf9b', '#e9b949', '#8a3df0'][(i + r) % 5], (i % 5 === 4) ? .15 : 0); }
  shape(rr(560, 560, 180, 240, 8), { fill: '#fff', lw: 6 }); [['E', 60], ['F P', 44], ['T O Z', 32], ['L P E D', 24], ['P E C F D', 18]].forEach(([l, sz], i) => text(l, 650, 600 + i * 40, { font: `800 ${sz}px "Baloo 2"`, fill: '#2a2430' }));
  shape(rr(440, 1196, 260, 34, 8), { fill: '#b8874f', lw: 6 }); for (const lx of [460, 664]) shape(rect(lx, 1228, 18, 120), { fill: '#8f6436', lw: 5 });
  shape(rr(470, 1170, 120, 26, 4), { fill: '#f4f1ea', lw: 4 }); for (let k = 0; k < 3; k++) stroke([[480, 1178 + k * 6], [580, 1178 + k * 6]], 1.5);   // a newspaper
  shape(rr(600, 1168, 80, 28, 12), { fill: '#7a2a2a', lw: 4 });   // a glasses case
  if (glow > 0) fillOnly(rect(X0, -1200, X1 - X0, 3000), `rgba(94,242,255,${.12 * glow})`, { boil: 0 });
}

// ———————————————————— w1: around the year 1000 — a monastery scriptorium (stone, oak, candlelight) ————————————————————
export function w1(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#b8a88a', { boil: 0 });
  for (let r = 0; r < 22; r++) for (let c = 0; c < 12; c++) stroke(rr(-800 + c * 230 + (r % 2) * 115, -200 + r * 80, 220, 72, 10), 3, { line: '#a0906e' });
  for (const x of [-120, 420]) { shape([...arc(x + 110, 620, 110, 150, Math.PI, TAU, 20), [x + 220, 1000], [x, 1000]], { fill: '#8cc3e8', lw: 7, shade: () => { fillOnly(rect(x, 700, 220, 300), '#7ab0d8', { boil: .2 }); stroke([[x + 110, 470], [x + 110, 1000]], 6, { line: '#5a4a3a' }); stroke([[x, 760], [x + 220, 760]], 6, { line: '#5a4a3a' }); } }); fillOnly([[x, 1000], [x + 220, 1000], [x + 400, 1340], [x - 120, 1340]], 'rgba(255,250,220,.15)', { boil: .2 }); }
  ground('#7a6a54'); for (let x = -800; x < 2000; x += 200) stroke([[x, FLOOR - 40], [x - 100, 2400]], 4, { line: '#6a5a44' });
  // shelves of books and scrolls, a writing desk with a monk
  shape(rr(760, 520, 300, 480, 8), { fill: '#6e4a26', lw: 6 }); for (let r = 0; r < 3; r++) { shape(rect(770, 660 + r * 150, 280, 14), { fill: '#5b341d', lw: 4 }); for (let i = 0; i < 6; i++) if ((i + r) % 3) book(790 + i * 45, 656 + r * 150, 34, 100, ['#7a2a2a', '#2f6a4a', '#5a4a8a'][(i + r) % 3]); else shape(ell(800 + i * 45, 620 + r * 150, 22, 30, 12), { fill: '#f1e3c2', lw: 4 }); }
  shape([[100, 1150], [380, 1110], [380, 1140], [100, 1180]], { fill: '#8f6436', lw: 6 }); for (const lx of [120, 350]) shape(rect(lx, 1170, 16, 170), { fill: '#6e4a26', lw: 5 }); candle(330, 1112, .8, t);
  figure(250, FLOOR - 20, .72, t, { era: 'monk', skin: '#f2c9a0', face: 1, arms: -1.2, hold: (x, y) => stroke([[x, y], [x + 30, y - 60]], 4, { line: '#f4f1ea' }) });
  figure(((t * 25) % 1700) - 300, FLOOR - 300, .44, t, { era: 'monk', skin: '#e7b48c', walk: 1, hold: (x, y) => book(x, y + 10, 50, 60, '#7a2a2a') });
  // the insert: an illuminated page under a reading stone, the letters magnified
  shape(rr(800, 1170, 320, 30, 6), { fill: '#8f6436', lw: 6 }); for (const lx of [820, 1090]) shape(rect(lx, 1198, 16, 140), { fill: '#6e4a26', lw: 5 });
  shape(rr(830, 1080, 240, 96, 6), { fill: '#f6efe0', lw: 5, shade: () => { shape(rr(840, 1090, 40, 40, 4), { fill: '#c22f3a', lw: 3 }); text('A', 860, 1112, { font: '800 30px "Baloo 2"', fill: '#e9b949' }); for (let k = 0; k < 4; k++) stroke([[890, 1096 + k * 18], [1060, 1096 + k * 18]], 2.5, { line: '#3a3340' }); } });
  specs(990, 1150, .6, { kind: 'stone' }); text('a b c', 990, 1128, { font: '800 30px "Baloo 2"', fill: '#3a3340' });
}
// ———————————————————— w2: Italy, late 13th century — a glassmaker's workshop (terracotta, furnace orange, Venetian green) ————————————————————
export function w2(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#d98a5a', { boil: 0 });
  for (let r = 0; r < 20; r++) for (let c = 0; c < 14; c++) stroke(rr(-800 + c * 200 + (r % 2) * 100, -200 + r * 80, 190, 72, 6), 3, { line: '#c27448' });
  // an arched window onto the lagoon: tiled roofs and a bell tower
  shape([...arc(1000, 520, 160, 120, Math.PI, TAU, 20), [1160, 860], [840, 860]], { fill: '#a6d6e8', lw: 7, shade: () => { fillOnly(rect(840, 760, 320, 100), '#5aa0b8', { boil: .2 }); for (const [x, w, h] of [[860, 80, 60], [950, 70, 90], [1040, 90, 50]]) { fillOnly(rect(x, 760 - h, w, h), '#e9b07a', { boil: .2 }); fillOnly([[x - 6, 760 - h], [x + w / 2, 740 - h], [x + w + 6, 760 - h]], '#c2532f', { boil: .2 }); } fillOnly(rect(1110, 560, 30, 200), '#d98a5a', { boil: .2 }); fillOnly([[1104, 560], [1125, 520], [1146, 560]], '#c2532f', { boil: .2 }); } });
  // the furnace glowing, a glassblower with his pipe and a molten bubble
  shape([...arc(-80, 900, 220, 200, Math.PI, TAU, 24), [140, 1340], [-300, 1340]], { fill: '#8a5a4a', lw: 7, shade: () => { for (let r = 0; r < 6; r++) stroke([[-300, 960 + r * 60], [140, 960 + r * 60]], 3, { line: '#6e4436' }); } });
  const f = .85 + .15 * Math.sin(t * 7); shape([...arc(-80, 1100, 110, 100, Math.PI, TAU, 20), [30, 1180], [-190, 1180]], { fill: '#ff8a2a', lw: 6, shade: () => fillOnly(ell(-80, 1150, 70 * f, 40 * f, 16), '#ffe08a', { boil: .4 }) });
  fillOnly(ell(-80, 1120, 260, 200, 30), `rgba(255,150,60,${.12 * f})`, { boil: .4 });
  figure(320, FLOOR - 20, .74, t, { era: 'medieval', skin: '#e7b48c', face: -1, arms: -1.4, hold: (x, y) => { stroke([[x, y], [x - 220, y + 20]], 6, { line: '#5a5a66' }); shape(ell(x - 240, y + 22, 26, 22, 14), { fill: '#ffb23f', lw: 4 }); } });
  ground('#b8784a'); for (let i = 0; i < 20; i++) stroke(rr(-400 + (i % 10) * 200 + (Math.floor(i / 10) % 2) * 100, FLOOR + 20 + Math.floor(i / 10) * 80, 180, 60, 6), 3, { line: '#a0663c' });
  // shelves of green glass: bottles, goblets
  shape(rect(560, 660, 240, 16), { fill: '#7a4a24', lw: 4 }); for (let i = 0; i < 4; i++) shape(spline([[580 + i * 56, 656], [576 + i * 56, 610], [590 + i * 56, 590], [590 + i * 56, 560], [602 + i * 56, 560], [602 + i * 56, 590], [616 + i * 56, 610], [612 + i * 56, 656]]), { fill: 'rgba(80,170,120,.7)', lw: 4 });
  figure(((t * 30) % 1700) - 300, FLOOR - 300, .44, t, { era: 'medieval', skin: '#f2c9a0', walk: 1, top: '#c22f3a', topS: '#9a1f2a', hatC: '#2f6a4a' });
  // the insert: the first spectacles on a velvet cushion
  shape(rr(800, 1170, 320, 30, 6), { fill: '#7a4a24', lw: 6 }); for (const lx of [820, 1090]) shape(rect(lx, 1198, 16, 140), { fill: '#5b341d', lw: 5 });
  shape(rr(850, 1110, 220, 64, 26), { fill: '#7a2a5a', lw: 5 }); specs(960, 1110, .9, { kind: 'rivet', frame: '#5a3a24' });
}
// ———————————————————— w3: London, 18th century — an optician's shop (navy, mahogany, brass) ————————————————————
export function w3(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#2a3a5a', { boil: 0 });
  for (let x = -800; x < 2000; x += 120) stroke([[x, -1200], [x, FLOOR - 40]], 4, { line: '#22304c' });
  // the bow window full of spectacles and telescopes, the hanging sign shaped like a pair of glasses
  shape(rr(700, 560, 560, 460, 14), { fill: '#bfe0f0', lw: 8, shade: () => { for (let i = 1; i < 4; i++) fillOnly(rect(700 + i * 140, 560, 8, 460), '#2a2430', { boil: .2 }); fillOnly(rect(700, 790, 560, 8), '#2a2430', { boil: .2 }); } });
  for (let i = 0; i < 3; i++) specs(780 + i * 180, 700, .4, { kind: 'temple' }); shape(rr(760, 900, 160, 26, 10), { fill: '#b8874f', lw: 4 }); shape(rr(1000, 890, 200, 34, 14), { fill: '#e9b949', lw: 4 });
  stroke([[1000, 380], [1000, 440]], 5); stroke([[880, 380], [1180, 380]], 8, { line: '#2a2430' }); specs(1000, 480, .8, { kind: 'temple', frame: '#e9b949' }); shape(rr(860, 300, 280, 60, 8), { fill: '#e9b949', lw: 5 }); text('OPTICIEN', 1000, 332, { font: '400 36px Bungee', fill: '#2a2430' });
  // inside: the mahogany counter, a chair, a lantern
  ground('#5a3a24'); for (let x = -800; x < 2000; x += 140) stroke([[x, FLOOR - 40], [x + 40, 2400]], 4, { line: '#4a2e1c' });
  shape(rr(-240, 1060, 480, 280, 10), { fill: '#7a2a1e', lw: 7, shade: () => { for (let i = 0; i < 4; i++) fillOnly(rr(-220 + i * 120, 1100, 100, 200, 8), '#6a2218', { boil: .2 }); } });
  stroke([[400, 400], [400, 520]], 4); shape(rr(370, 520, 60, 80, 10), { fill: '#e9b949', lw: 5 });
  figure(-60, FLOOR - 60, .7, t, { era: 'georgian', skin: '#f2c9a0', face: 1, arms: -1, hold: (x, y) => specs(x, y - 30, .28, { kind: 'temple' }) });   // the optician
  figure(560, FLOOR - 40, .7, t, { era: 'georgian', top: '#2f6a4a', topS: '#245a3a', skin: '#f2c9a0', face: -1 });
  // the insert: spectacles with temples, on a brass stand
  shape(rr(800, 1170, 320, 30, 6), { fill: '#7a2a1e', lw: 6 }); for (const lx of [820, 1090]) shape(rect(lx, 1198, 16, 140), { fill: '#5a1e14', lw: 5 });
  shape(rect(950, 1080, 20, 90), { fill: '#e9b949', lw: 4 }); specs(960, 1070, .75, { kind: 'temple', frame: '#3a2a20' });
}
// ———————————————————— w4: around 1784 — a study in Philadelphia (brick, colonial green, candle) ————————————————————
export function w4(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#2f6a4a', { boil: 0 });
  for (let y = 300; y < 1300; y += 160) stroke([[X0, y], [X1, y]], 3, { line: '#285a3e' });
  // a sash window onto brick houses, a kite and a key hanging by the window (an experiment of his, decades earlier), a map
  shape(rr(-200, 440, 380, 460, 10), { fill: '#bfe0f0', lw: 8, shade: () => { fillOnly(rect(-200, 680, 380, 220), '#b8584a', { boil: .2 }); for (let i = 0; i < 4; i++) fillOnly(rr(-180 + i * 90, 720, 50, 70, 4), '#ffd27a', { boil: .2 }); for (let i = 1; i < 3; i++) fillOnly(rect(-200 + i * 126, 440, 6, 460), '#f4f1ea', { boil: .2 }); fillOnly(rect(-200, 660, 380, 8), '#f4f1ea', { boil: .2 }); } });
  push(); translate(260, 520); rotate(.2); shape([[0, -70], [50, 0], [0, 90], [-50, 0]], { fill: '#e9d7a8', lw: 5 }); stroke([[0, -70], [0, 90]], 3); stroke([[-50, 0], [50, 0]], 3); stroke(spline([[0, 90], [20, 150], [-10, 220]], false), 3); pop(); shape(ell(240, 760, 12, 18, 10), { fill: '#e9b949', lw: 4 });
  shape(rr(700, 440, 300, 220, 8), { fill: '#e9d7a8', lw: 6, shade: () => { fillOnly(spline([[740, 520], [800, 480], [880, 520], [940, 500], [960, 600], [760, 610]]), '#9fc8a0', { boil: .3 }); } });
  ground('#7a5a3a'); for (let x = -800; x < 2000; x += 140) stroke([[x, FLOOR - 40], [x + 40, 2400]], 4, { line: '#6a4a2e' });
  figure(((t * 25) % 1700) - 300, FLOOR - 300, .44, t, { era: 'georgian', top: '#2a3a5a', topS: '#22304c', skin: '#e7b48c', walk: 1 });
  // the writing desk: quill and inkwell, a letter, a candle, books
  shape(rr(760, 1150, 380, 30, 6), { fill: '#7a4a24', lw: 6 }); for (const lx of [780, 1110]) shape(rect(lx, 1178, 16, 160), { fill: '#5b341d', lw: 5 });
  shape(rr(790, 1100, 60, 50, 8), { fill: '#2a2430', lw: 4 }); stroke(spline([[820, 1100], [840, 1040], [870, 1000]], false), 4, { line: '#f4f1ea' }); for (let k = 0; k < 6; k++) stroke([[836 + k * 5, 1040 - k * 7], [850 + k * 5, 1046 - k * 7]], 2, { line: '#f4f1ea' });
  candle(1100, 1150, .8, t); for (let i = 0; i < 3; i++) book(1030 + i * 6, 1150 - i * 26, 90, 26, ['#7a2a2a', '#2a3a5a', '#8a6a2a'][i]);
  // the insert: bifocal spectacles on a letter, the line across each lens
  shape(rr(880, 1110, 200, 40, 3), { fill: '#f6efe0', lw: 4 }); for (let k = 0; k < 2; k++) stroke([[890, 1122 + k * 12], [1060, 1122 + k * 12]], 2);
  specs(960, 1090, .7, { kind: 'bifocal' });
  figure(1260, FLOOR - 40, .72, t, { era: 'georgian', hat: null, top: '#5a3a24', topS: '#4a2e1c', vest: '#e9d7a8', skin: '#f2c9a0', hairC: '#c9c9c9', face: -1 });
}
// ———————————————————— w5: the 19th century — a boulevard by the opera (violet dusk, gaslight, posters) ————————————————————
export function w5(t) {
  bands(['#3a2a5a', '#4a3a72', '#5a4a8a'], -1200, 900);
  shape(rect(500, 480, 900, 860), { fill: '#d8c8a8', lw: 7, shade: () => { for (let i = 0; i < 5; i++) { fillOnly([...arc(560 + i * 170, 700, 60, 80, Math.PI, TAU, 12), [620 + i * 170, 900], [500 + i * 170, 900]], '#2a2430', { boil: .2 }); fillOnly(rect(540 + i * 170, 920, 40, 400), '#c8b898', { boil: .2 }); } } });
  shape([[480, 480], [950, 360], [1420, 480]], { fill: '#2f6a5a', lw: 7 }); shape(ell(950, 380, 90, 50, 20), { fill: '#e9b949', lw: 5 });
  shape(rr(-200, 600, 200, 500, 100), { fill: '#7a4a24', lw: 6 }); for (let i = 0; i < 3; i++) shape(rr(-184, 640 + i * 150, 168, 130, 8), { fill: ['#c22f3a', '#e9b949', '#3f5bd6'][i], lw: 4 }); text('OPÉRA', -100, 700, { font: '400 30px Bungee', fill: '#fff' });   // a poster column
  stroke([[280, FLOOR - 30], [280, FLOOR - 560]], 9); shape([[240, FLOOR - 640], [320, FLOOR - 640], [306, FLOOR - 560], [254, FLOOR - 560]], { fill: '#ffe08a', lw: 6 }); fillOnly(ell(280, FLOOR - 600, 100, 100, 20), 'rgba(255,220,120,.18)', { boil: .3 });
  ground('#4a4e58'); for (let i = 0; i < 40; i++) stroke(rr(-400 + (i % 10) * 180 + (Math.floor(i / 10) % 2) * 90, FLOOR + 10 + Math.floor(i / 10) * 60, 150, 44, 10), 3, { line: '#3a3e48' });
  // elegant people: a gentleman with a monocle, a lady with a lorgnette, a passer-by with a pince-nez
  figure(560, FLOOR - 40, .7, t, { era: 'victorian', skin: '#f2c9a0', hairC: '#3a2416', beardC: '#3a2416', face: 1 }); specs(560 + 20 * .7, FLOOR - 40 - 410 * .7, .14, { kind: 'monocle' });
  figure(1220, FLOOR - 20, .7, t, { era: 'vlady', skin: '#f2c9a0', hairC: '#7a4a24', face: -1, arms: -1.6, hold: (x, y) => { stroke([[x, y], [x, y - 60]], 4, { line: '#e9b949' }); specs(x, y - 80, .2, { kind: 'pince', frame: '#e9b949' }); } });
  figure(((t * 35) % 1700) - 300, FLOOR - 300, .44, t, { era: 'victorian', top: '#5a4a3a', skin: '#e7b48c', walk: 1 });
  // the insert: a pince-nez and a monocle on a little velvet cushion, on a café table
  shape(ell(960, 1200, 170, 30, 24), { fill: '#e9ecef', lw: 6 }); shape(rect(950, 1210, 20, 130), { fill: '#3a3340', lw: 5 });
  shape(rr(860, 1140, 200, 60, 24), { fill: '#7a2a5a', lw: 5 }); specs(920, 1140, .45, { kind: 'pince' }); specs(1030, 1130, .45, { kind: 'monocle' });
}
// ———————————————————— w6: USA 1929 — the seaside boardwalk (sea blue, sand, striped awnings) ————————————————————
export function w6(t) {
  bands(['#7ac8f0', '#98d6f4', '#b8e4f8'], -1200, 760); shape(ell(860, 260, 90, 90, 30), { fill: '#fff1b0', lw: 6 }); clouds(t, 240); birds(t, 300, 3);
  shape(rect(X0, 760, X1 - X0, 260), { fill: '#3a8ac8', lw: 5, shade: () => { for (let k = 0; k < 6; k++) stroke(spline([[-800, 800 + k * 36], [-400, 790 + k * 36 + Math.sin(t + k) * 6], [0, 800 + k * 36], [400, 790 + k * 36], [800, 800 + k * 36], [1200, 790 + k * 36], [1600, 800 + k * 36]], false), 3, { line: '#bfe9ff' }); } });
  shape(rect(X0, 1020, X1 - X0, 120), { fill: '#f2d48a', lw: 5 });   // the beach
  for (const [x, c] of [[-120, '#e8452f'], [260, '#3f5bd6']]) { stroke([[x, 1120], [x, 940]], 5); shape([...arc(x, 950, 110, 50, Math.PI, TAU, 14), [x + 110, 950], [x - 110, 950]], { fill: c, lw: 5, shade: () => { for (let k = -2; k <= 2; k += 2) fillOnly([[x, 900], [x + k * 25 - 25, 950], [x + k * 25 + 25, 950]], '#fff', { boil: .2 }); } }); }
  // the boardwalk planks
  ground('#b8874f'); for (let x = -800; x < 2000; x += 90) stroke([[x, FLOOR - 40], [x + 20, 2400]], 4, { line: '#8f6436' });
  figure(((t * 35) % 1700) - 300, FLOOR - 300, .44, t, { era: 'swim', top: '#3f5bd6', topS: '#2c44b0', pants: '#3f5bd6', skin: '#b9794f', walk: 1 });
  // a stall selling sunglasses (the insert): striped awning, a rack of pairs, a sign
  shape(rect(780, 860, 400, 480), { fill: '#f4f1ea', lw: 7 }); for (let i = 0; i < 6; i++) shape([[780 + i * 67, 820], [847 + i * 67, 820], [840 + i * 67, 880], [787 + i * 67, 880]], { fill: i % 2 ? '#f4f1ea' : '#e8742a', lw: 4 });
  shape(rr(800, 760, 360, 60, 8), { fill: '#e8742a', lw: 5 }); text('LUNETTES DE SOLEIL', 980, 792, { font: '400 26px Bungee', fill: '#fff' });
  shape(rr(830, 950, 300, 260, 8), { fill: '#d8c8a8', lw: 5 }); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) specs(900 + c * 150, 1000 + r * 80, .32, { kind: 'sun', frame: ['#c22f3a', '#2a2430', '#3f5bd6'][(r + c) % 3] });
  text('10 ¢', 980, 1250, { font: '400 40px Bungee', fill: '#e8742a', outlineW: 6 });
  // bathers of 1929 in striped swimsuits, a lady with a cloche hat
  figure(60, FLOOR - 40, .66, t, { era: 'swim', skin: '#f2c9a0', hairC: '#3a2416', face: 1 }); figure(560, FLOOR - 60, .64, t, { era: 't_lady', skin: '#e7b48c', hairC: '#1d1410', face: -1 });
}
// ———————————————————— w7: Prague 1961 — Wichterle's kitchen laboratory (mint, chrome, red tile) ————————————————————
export function w7(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#d8efe6', { boil: 0 });
  for (let r = 0; r < 6; r++) for (let c = 0; c < 14; c++) shape(rect(-300 + c * 110, 900 + r * 110, 110, 110), { fill: (r + c) % 2 ? '#e8452f' : '#f4f1ea', lw: 3 });
  // a window onto Prague: spires and red roofs
  shape(rr(-220, 420, 420, 360, 10), { fill: '#bfe0f0', lw: 8, shade: () => { for (const [x, h] of [[-180, 120], [-100, 200], [0, 160], [90, 230]]) { fillOnly(rect(x, 780 - h, 60, h), '#d8b898', { boil: .2 }); fillOnly([[x - 6, 780 - h], [x + 30, 780 - h - 70], [x + 66, 780 - h]], '#2a2430', { boil: .2 }); } fillOnly(rect(-220, 720, 420, 60), '#c2532f', { boil: .2 }); } });
  shape(rr(320, 440, 260, 200, 8), { fill: '#fff', lw: 6 }); text('1961', 450, 520, { font: '400 64px Bungee', fill: '#2fbf9b' }); stroke([[360, 580], [540, 580]], 4);
  ground('#c9ced6'); for (let x = -800; x < 2000; x += 160) stroke([[x, FLOOR - 40], [x, 2400]], 3, { line: '#a9aeb6' });
  // the kitchen table: the machine built from a children's construction set (perforated strips, gears) and a bicycle dynamo with its wheel
  shape(rr(760, 1180, 420, 30, 6), { fill: '#f4f1ea', lw: 6 }); for (const lx of [780, 1150]) shape(rect(lx, 1208, 16, 140), { fill: '#c9ced6', lw: 5 });
  for (const [x, y, w, h] of [[800, 980, 20, 200], [1000, 980, 20, 200], [800, 980, 220, 20], [800, 1080, 220, 20]]) shape(rr(x, y, w, h, 4), { fill: '#3fb6e8', lw: 4, shade: () => { for (let k = 0; k < Math.max(w, h) / 22; k++) fillOnly(ell(x + (w > h ? 11 + k * 22 : w / 2), y + (w > h ? h / 2 : 11 + k * 22), 4, 4, 6), '#1d4a66', { boil: .1 }); } });
  for (const [gx, gy, r] of [[880, 1040, 34], [950, 1030, 22]]) { const P = []; for (let k = 0; k < 24; k++) { const an = k / 24 * TAU + t * (r > 30 ? 2 : -3), rr_ = k % 2 ? r : r * .82; P.push([gx + Math.cos(an) * rr_, gy + Math.sin(an) * rr_]); } shape(P, { fill: '#e9b949', lw: 4 }); dot(gx, gy, 5, '#2a2430'); }
  push(); translate(1120, 1060); const an = t * 6; stroke(ell(0, 0, 60, 60, 24), 5); for (let k = 0; k < 8; k++) stroke([[0, 0], [Math.cos(an + k * .78) * 60, Math.sin(an + k * .78) * 60]], 2); shape(rr(-12, -90, 24, 40, 6), { fill: '#c9ced6', lw: 4 }); pop(); text('DYNAMO', 1120, 1150, { font: '800 18px "Baloo 2"', fill: '#2a2430' });
  // the insert: a soft contact lens on a fingertip, and its little case
  push(); translate(960, 1130); shape(spline([[-40, 60], [-44, -10], [-20, -40], [20, -40], [44, -10], [40, 60]]), { fill: '#f2c9a0', lw: 5 }); specs(0, -36, .6, { kind: 'lens' }); pop();
  shape(rr(860, 1150, 70, 30, 12), { fill: '#2fbf9b', lw: 4 });
  figure(1260, FLOOR - 40, .72, t, { era: 'lab', skin: '#f2c9a0', hairC: '#8a8a8a', face: -1 });
  figure(560, FLOOR - 60, .62, t, { era: 'fifties', top: '#5a6a7a', topS: '#4a5a6a', skin: '#f2c9a0', hairC: '#5a3a24', face: 1 });
}
