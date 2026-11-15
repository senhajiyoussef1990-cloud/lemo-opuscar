// teeth.js — « L'histoire de la brosse à dents »: the home (a bathroom corner) and seven worlds, one palette each.
// The portal and the shared helpers come from worlds.js. Inserts sit around x 960 (see INS in main.js).
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, bands } from './toon.js';
import { eye } from './chars.js';
import { FLOOR, portal, GLOW, ground, hills, blink, birds, tree, pine, groundBits, clouds, bgPerson } from './worlds.js';
export { FLOOR, portal, GLOW };
const X0 = -900, X1 = 2000;
export const darkness = () => 0;

// ———— a toothbrush: handle colour, bristle colour, kind 'bone' | 'bamboo' | 'plastic' | 'electric' ————
export function brush(x, y, s = 1, { a = 0, handle = '#3fb6e8', bristle = '#ffffff', kind = 'plastic', t = 0 } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  if (kind === 'electric') { shape(rr(-34, -40, 68, 220, 30), { fill: handle, lw: 6, shade: () => fillOnly(rect(10, -50, 40, 280), 'rgba(0,0,0,.12)', { boil: .3 }) }); shape(ell(0, 40, 14, 14, 12), { fill: '#fff', lw: 4 }); shape(rr(-14, -150, 28, 116, 10), { fill: '#e9ecef', lw: 5 }); const v = Math.sin(t * 60) * 3; shape(ell(v, -170, 24, 26, 16), { fill: bristle, lw: 5 }); stroke(spline([[0, 180], [40, 260], [-30, 330], [60, 420]], false), 5); pop(); return; }
  const hc = kind === 'bone' ? '#f1e3c2' : kind === 'bamboo' ? '#c9b25a' : handle;
  shape(spline([[-12, 200], [12, 200], [16, 20], [12, -120], [-12, -120], [-16, 20]]), { fill: hc, lw: 6, shade: () => { if (kind === 'bamboo') for (const yy of [0, 100]) stroke([[-20, yy], [20, yy]], 4, { line: '#8a7a3a' }); } });
  for (let i = 0; i < 6; i++) shape(rr(-14 + (i % 2) * 14, -200 + Math.floor(i / 2) * 26, 14, 30, 4), { fill: bristle, lw: 3 });
  pop();
}
export function titleProp(t) { brush(0, 40, .32, { a: .9, handle: '#3fb6e8' }); }
function hourglass(x, y, s, t, { flowing = 1 } = {}) {
  push(); translate(x, y); scale(s);
  shape(rr(-60, -170, 120, 16, 4), { fill: '#b8874f', lw: 5 }); shape(rr(-60, -4, 120, 16, 4), { fill: '#b8874f', lw: 5 });
  shape([[-46, -154], [46, -154], [8, -88], [46, -4], [-46, -4], [-8, -88]], { fill: 'rgba(220,240,255,.8)', lw: 5 });
  const u = flowing ? (t * .05) % 1 : 0;
  fillOnly([[-36 + 28 * u, -140 + 52 * u], [36 - 28 * u, -140 + 52 * u], [4, -92], [-4, -92]], '#e9b949', { boil: .3 });
  fillOnly([[-40, -8], [40, -8], [20 - 18 * u, -8 - 40 * u], [-20 + 18 * u, -8 - 40 * u]], '#e9b949', { boil: .3 });
  if (flowing) stroke([[0, -90], [0, -14]], 2, { line: '#e9b949' });
  pop();
}
function microbe(x, y, s, t, i = 0) {   // little green germs, cute and nasty
  push(); translate(x + Math.sin(t * 3 + i) * 6, y + Math.cos(t * 4 + i) * 4); scale(s);
  const P = []; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, r = 30 + (k % 2) * 8; P.push([Math.cos(a) * r, Math.sin(a) * r]); }
  shape(spline(P), { fill: '#8be04a', lw: 4 }); eye(-8, -4, 8, 9, { lid: blink(t, i) ? 1 : 0, skin: '#8be04a', lw: 3, pupil: 2.5 }); eye(10, -4, 8, 9, { lid: blink(t, i) ? 1 : 0, skin: '#8be04a', lw: 3, pupil: 2.5 }); stroke(quad([-8, 12], [2, 18], [12, 12], 6), 3);
  pop();
}

// ———————————————————— home: the beige room with a little washbasin and its mirror ————————————————————
export function home(t, { screwed = false, glow = 0, clockT = 0 } = {}) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#efe0c2', { boil: 0 });
  for (let x = -800; x < 2000; x += 180) stroke([[x, -1200], [x, FLOOR - 40]], 4, { line: '#e2cfab' });
  shape(rect(X0, FLOOR - 120, X1 - X0, 80), { fill: '#c9a978', lw: 6 });
  ground('#a67c52'); for (let k = 0; k < 4; k++) stroke([[X0, FLOOR + 40 + k * 70 + k * k * 16], [X1, FLOOR + 40 + k * 70 + k * k * 16]], 4, { line: '#8c6440' });
  shape(rr(-80, 420, 360, 440, 14), { fill: '#f6efe0', lw: 7 }); stroke([[100, 420], [100, 860]], 6); stroke([[-80, 640], [280, 640]], 6);
  shape(ell(860, 440, 70, 70, 36), { fill: '#fff8e8', lw: 7 }); const ma = clockT * .9 - 1.2; stroke([[860, 440], [860 + Math.cos(ma) * 48, 440 + Math.sin(ma) * 48]], 6); stroke([[860, 440], [890, 428]], 7);
  // the washbasin corner: tiles, a mirror, a cup of toothbrushes, a tube of toothpaste
  for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) shape(rect(1000 + c * 80, 760 + r * 80, 80, 80), { fill: '#dff3f0', lw: 3 });
  shape(rr(1030, 560, 260, 180, 20), { fill: '#cfe8f5', lw: 7, shade: () => fillOnly([[1060, 580], [1110, 580], [1060, 650]], 'rgba(255,255,255,.7)', { boil: .2 }) });
  shape([[1000, 1060], [1320, 1060], [1290, 1140], [1030, 1140]], { fill: '#ffffff', lw: 7 }); shape(rr(1140, 1140, 40, 200, 6), { fill: '#ffffff', lw: 6 });
  shape(rr(1030, 980, 60, 80, 10), { fill: '#ff7a6b', lw: 5 }); brush(1050, 990, .32, { a: -.2, handle: '#3fb6e8' }); brush(1072, 990, .32, { a: .25, handle: '#ffcf3a' });
  shape(rr(1200, 1030, 90, 30, 12), { fill: '#fff', lw: 4, shade: () => fillOnly(rect(1200, 1030, 30, 30), '#e8452f', { boil: .2 }) });
  // the low table, and the two-minute hourglass once Papy has put it there
  shape(rr(440, 1196, 260, 34, 8), { fill: '#b8874f', lw: 6 }); for (const lx of [460, 664]) shape(rect(lx, 1228, 18, 120), { fill: '#8f6436', lw: 5 });
  if (screwed) hourglass(570, 1196, .6, t);
  if (glow > 0) fillOnly(rect(X0, -1200, X1 - X0, 3000), `rgba(94,242,255,${.12 * glow})`, { boil: 0 });
}

// ———————————————————— w1: antiquity, chewing sticks (ochre, sand, palm green) ————————————————————
export function w1(t) {
  bands(['#f2b25a', '#f6c87a', '#fadc9e'], -1200, 900); shape(ell(860, 280, 90, 90, 30), { fill: '#fff1b0', lw: 6 });
  hills(1040, '#e3a14a', 80); ground('#d9a05a'); groundBits(11, '#b87a3a', '#6c9a3a'); birds(t, 200, 3);
  for (const [x, s] of [[-160, 1], [1180, .9]]) { push(); translate(x, FLOOR - 40); scale(s); stroke(spline([[0, 0], [20, -200], [10, -420]], false), 22, { line: '#8a5a34' }); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; shape(spline([[10, -420], [10 + Math.cos(a) * 120, -420 + Math.sin(a) * 120 - 10], [10 + Math.cos(a) * 220, -420 + Math.sin(a) * 160 + 40], [10 + Math.cos(a) * 110, -400 + Math.sin(a) * 80]]), { fill: '#4f9a3a', lw: 5 }); } pop(); }
  // the insert: a bundle of chewing sticks on a cloth, one frayed like a little paintbrush
  shape(rr(820, 1170, 300, 60, 10), { fill: '#c22f3a', lw: 6 });
  for (let i = 0; i < 5; i++) { push(); translate(860 + i * 50, 1170); rotate(-.2 + i * .1); shape(rr(-8, -150, 16, 150, 6), { fill: '#9a6232', lw: 4 }); if (i === 2) for (let k = -3; k <= 3; k++) stroke([[k * 3, -150], [k * 6, -184]], 3, { line: '#c9a46a' }); pop(); }
  // a man chewing a stick
  bgPerson(1060, FLOOR - 120, .7, t, { coat: '#f1e3c2', skin: '#a8714a', hat: 'scarf', face: -1 }); stroke([[1038, FLOOR - 340], [990, FLOOR - 360]], 6, { line: '#9a6232' });
  const wx = ((t * 30) % 1600) - 300; bgPerson(wx, FLOOR - 170, .5, t, { coat: '#e07b39', walk: 1, skin: '#a8714a' });
}
// ———————————————————— w2: China, late 15th century (lacquer red, jade, gold) ————————————————————
export function w2(t) {
  bands(['#f6d6b0', '#f8e2c4', '#faeed8'], -1200, 900); clouds(t, 300, '#fff');
  // a pavilion with a curved roof
  shape(rect(700, 760, 600, 580), { fill: '#c22f3a', lw: 7 }); for (const x of [740, 1240]) shape(rr(x, 760, 30, 580, 6), { fill: '#8a1f2a', lw: 5 });
  shape(spline([[620, 780], [700, 700], [1000, 640], [1300, 700], [1380, 780], [1000, 740]]), { fill: '#2f8a6a', lw: 7 });
  for (let i = 0; i < 3; i++) shape(rr(820 + i * 140, 900, 100, 140, 6), { fill: '#e9b949', lw: 5 });
  // bamboo
  for (const x of [-220, -150, -90]) { for (let k = 0; k < 7; k++) shape(rr(x - 12, FLOOR - 40 - (k + 1) * 120, 24, 118, 6), { fill: '#7ab65a', lw: 4 }); shape(spline([[x, FLOOR - 700], [x + 60, FLOOR - 740], [x + 100, FLOOR - 700], [x + 40, FLOOR - 690]]), { fill: '#4f9a3a', lw: 4 }); }
  ground('#c9a46a'); groundBits(23, '#9a7c48', '#4f9a3a');
  // the insert: a lacquer tray, a brush with a bamboo handle and pig-bristle tuft
  shape(rr(820, 1180, 300, 50, 10), { fill: '#2a2430', lw: 6, shade: () => fillOnly(rect(820, 1180, 300, 12), '#c22f3a', { boil: .2 }) });
  brush(960, 1176, .55, { a: Math.PI / 2, kind: 'bamboo', bristle: '#5a4a40' });
  // and the pig, who is not pleased
  push(); translate(240, FLOOR + 10); shape(ell(0, -60, 90, 60, 24), { fill: '#f4b4c0', lw: 6 }); shape(ell(80, -80, 46, 40, 20), { fill: '#f4b4c0', lw: 6 }); shape(ell(116, -76, 18, 14, 12), { fill: '#e890a0', lw: 4 }); dot(110, -78, 3); dot(122, -78, 3);
  eye(78, -96, 9, 10, { lid: .5, skin: '#f4b4c0', lw: 3, pupil: 3 }); for (const lx of [-50, -10, 30, 60]) shape(rr(lx, -20, 18, 24, 4), { fill: '#f4b4c0', lw: 4 }); stroke(spline([[-90, -70], [-110, -90], [-100, -100], [-112, -110]], false), 4); pop();
  bgPerson(1180, FLOOR - 60, .7, t, { coat: '#2f8a6a', skin: '#f2c9a0', hair: '#1d1410', face: -1 });
}
// ———————————————————— w3: England, around 1780, a London prison cell (stone grey, straw, candle) ————————————————————
export function w3(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#6e6e7a', { boil: 0 });
  for (let r = 0; r < 22; r++) for (let c = 0; c < 12; c++) stroke(rr(-800 + c * 230 + (r % 2) * 115, -200 + r * 80, 220, 72, 10), 3, { line: '#5a5a66' });
  shape(rr(380, 420, 300, 260, 10), { fill: '#bfe0f0', lw: 7 }); for (let i = 0; i < 5; i++) shape(rr(400 + i * 60, 420, 16, 260, 4), { fill: '#3a3a44', lw: 4 });   // barred window
  fillOnly([[400, 680], [660, 680], [880, 1340], [200, 1340]], 'rgba(255,255,230,.12)', { boil: .2 });
  ground('#4a4a54'); for (let i = 0; i < 30; i++) stroke([[-200 + hash(i) * 600, FLOOR + 20 + hash(i + 3) * 60], [-180 + hash(i) * 600, FLOOR + 5 + hash(i + 3) * 60]], 4, { line: '#e9c46a' });   // straw
  // the little table: a bone, a knife, a rag and a pot of soot (the insert)
  shape(rr(800, 1160, 320, 26, 6), { fill: '#7a5a3a', lw: 6 }); for (const lx of [820, 1090]) shape(rect(lx, 1184, 16, 160), { fill: '#5b3b20', lw: 5 });
  brush(940, 1150, .5, { a: Math.PI / 2 - .2, kind: 'bone', bristle: '#3a3340' });
  shape(spline([[1010, 1160], [1040, 1120], [1090, 1130], [1100, 1160]]), { fill: '#d8d0c0', lw: 5 }); shape(rr(850, 1100, 50, 60, 8), { fill: '#2a2430', lw: 5 }); text('SUIE', 875, 1130, { font: '800 16px "Baloo 2"', fill: '#fff' });
  // the prisoner at work, a guard passing outside
  bgPerson(1180, FLOOR - 20, .8, t, { coat: '#9a9a8a', skin: '#f2c9a0', hair: '#5a3a24', face: -1 });
  const gx = ((t * 30) % 1600) - 300; bgPerson(gx, FLOOR - 200, .45, t, { coat: '#c22f3a', hat: 'cap', walk: 1, skin: '#f2c9a0' });
}
// ———————————————————— w4: the 19th century, brushes made in series (violet, gold) ————————————————————
export function w4(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#5a3a8a', { boil: 0 });
  for (let x = -800; x < 2000; x += 140) stroke([[x, -1200], [x, FLOOR - 40]], 4, { line: '#4a2e74' });
  ground('#8a6a3a'); for (let k = 0; k < 4; k++) stroke([[X0, FLOOR + 40 + k * 80], [X1, FLOOR + 40 + k * 80]], 4, { line: '#6e542e' });
  shape(rr(-220, 420, 400, 120, 10), { fill: '#e9b949', lw: 6 }); text('BROSSES', -20, 482, { font: '400 52px Bungee', fill: '#5a3a8a' });
  // a rack of brushes in rows (the insert), with a few germs sitting in the damp bristles
  shape(rr(780, 900, 380, 300, 10), { fill: '#b8874f', lw: 6 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) brush(820 + c * 60, 960 + r * 90, .22, { a: 0, kind: 'bone', bristle: '#5a4a40' });
  for (const [x, y, i] of [[900, 1020, 1], [1040, 960, 2], [980, 1110, 3]]) microbe(x, y, .55, t, i);
  // a shop counter and a customer
  shape(rr(200, 1140, 380, 200, 10), { fill: '#e9b949', lw: 6 }); bgPerson(380, FLOOR - 180, .55, t, { coat: '#2a2430', hat: 'cap', skin: '#f2c9a0' });
  bgPerson(((t * 35) % 1700) - 300, FLOOR - 60, .65, t, { coat: '#8a3a5a', walk: 1, skin: '#e7b48c' });
}
// ———————————————————— w5: USA 1938, nylon bristles (teal, white, steel) ————————————————————
export function w5(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#2a7f8a', { boil: 0 });
  for (let y = 300; y < 1300; y += 200) stroke([[X0, y], [X1, y]], 3, { line: '#236a74' });
  ground('#e9ecef'); for (let x = -800; x < 2000; x += 160) stroke([[x, FLOOR - 40], [x, 2400]], 3, { line: '#c9ced6' });
  shape(rr(760, 440, 380, 110, 10), { fill: '#fff', lw: 6 }); text('NYLON', 950, 500, { font: '400 64px Bungee', fill: '#2a7f8a' });
  // spools of nylon thread, and the brush on its stand drying fast (the insert)
  for (const [x, s] of [[-200, 1], [-60, .8]]) { push(); translate(x, FLOOR - 40); scale(s); shape(rr(-50, -200, 100, 200, 10), { fill: '#f4f7fb', lw: 6 }); for (let k = 0; k < 8; k++) stroke([[-50, -180 + k * 22], [50, -176 + k * 22]], 3, { line: '#c9ced6' }); pop(); }
  shape(rr(820, 1180, 300, 30, 6), { fill: '#c9ced6', lw: 6 }); for (const lx of [840, 1090]) shape(rect(lx, 1208, 16, 140), { fill: '#8a929c', lw: 5 });
  brush(960, 1170, .6, { a: Math.PI / 2, handle: '#e8452f', bristle: '#ffffff' });
  for (let i = 0; i < 4; i++) { const u = (t * .7 + i / 4) % 1; dot(900 + i * 40, 1090 - u * 80, 6 * (1 - u), `rgba(140,200,255,${1 - u})`); }   // the water leaves quickly
  bgPerson(1180, FLOOR - 40, .7, t, { coat: '#f4f7fb', skin: '#e7b48c', hair: '#3a2416', face: -1 });
  bgPerson(((t * 40) % 1700) - 300, FLOOR - 160, .5, t, { coat: '#3a3340', hat: 'cap', walk: 1, skin: '#b9794f' });
}
// ———————————————————— w6: Switzerland 1954, an electric toothbrush (Swiss red, white, alpine blue) ————————————————————
export function w6(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#f4f7fb', { boil: 0 });
  shape(rr(-240, 380, 520, 360, 14), { fill: '#8cc3e8', lw: 7, shade: () => { for (const [x, h] of [[-160, 260], [20, 320], [200, 240]]) { fillOnly([[x - 160, 740], [x, 740 - h], [x + 160, 740]], '#7b8fb8', { boil: .3 }); fillOnly([[x - 50, 740 - h + 80], [x, 740 - h], [x + 50, 740 - h + 80]], '#fff', { boil: .3 }); } } });   // alps in the window
  shape(rr(760, 420, 200, 200, 10), { fill: '#e8452f', lw: 6 }); shape(rect(840, 450, 40, 140), { fill: '#fff', lw: 0, stroke: false }); shape(rect(790, 500, 140, 40), { fill: '#fff', lw: 0, stroke: false });   // a red flag with a white cross
  ground('#e8452f'); for (let k = 0; k < 4; k++) stroke([[X0, FLOOR + 40 + k * 80], [X1, FLOOR + 40 + k * 80]], 4, { line: '#c22f3a' });
  // the bench, a wall socket, the electric toothbrush plugged in and buzzing (the insert)
  shape(rr(800, 1180, 340, 30, 6), { fill: '#c9ced6', lw: 6 }); for (const lx of [820, 1110]) shape(rect(lx, 1208, 16, 140), { fill: '#8a929c', lw: 5 });
  brush(960, 1050, .5, { kind: 'electric', handle: '#ffffff', bristle: '#3fb6e8', t });
  shape(rr(1140, 1080, 50, 70, 8), { fill: '#fff', lw: 5 }); dot(1158, 1110, 4); dot(1172, 1110, 4);
  for (let i = 0; i < 3; i++) stroke(arc(960, 965, 50 + i * 20, 50 + i * 20, -2.4, -.8, 8), 3, { line: '#3fb6e8' });   // bzzz
  bgPerson(1240, FLOOR - 40, .7, t, { coat: '#f4f7fb', skin: '#f2c9a0', hair: '#5a3a24', face: -1 });
}
// ———————————————————— w7: today, a bright bathroom (mint, coral) ————————————————————
export function w7(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#bff0dc', { boil: 0 });
  for (let r = 0; r < 8; r++) for (let c = 0; c < 14; c++) shape(rect(-300 + c * 110, 520 + r * 110, 110, 110), { fill: '#d8f6ea', lw: 3 });
  ground('#ff9d8f'); for (let x = -800; x < 2000; x += 120) stroke([[x, FLOOR - 40], [x - 60, 2400]], 4, { line: '#ef8274' });
  shape(rr(-200, 600, 320, 220, 18), { fill: '#cfe8f5', lw: 7 }); shape([[-220, 900], [140, 900], [110, 980], [-190, 980]], { fill: '#fff', lw: 7 });   // mirror and basin
  shape(rr(-120, 820, 70, 80, 10), { fill: '#ffcf3a', lw: 5 }); for (const [a, c] of [[-.3, '#3fb6e8'], [0, '#e8452f'], [.3, '#2fbf9b'], [.5, '#8a3df0']]) brush(-86 + a * 30, 830, .3, { a, handle: c });   // the family cup
  shape(rr(300, 560, 200, 200, 10), { fill: '#fff', lw: 6 }); text('3 MOIS', 400, 620, { font: '400 40px Bungee', fill: '#ff7a6b' }); stroke([[340, 680], [460, 680]], 4); stroke([[340, 720], [430, 720]], 4);   // a reminder on the wall
  // the insert: an hourglass and a toothbrush side by side
  shape(rr(820, 1180, 300, 30, 6), { fill: '#fff', lw: 6 }); hourglass(900, 1180, .7, t); brush(1040, 1176, .5, { a: Math.PI / 2 - .3, handle: '#2fbf9b' });
  text('2 MIN', 900, 1240, { font: '400 36px Bungee', fill: '#ff7a6b', outlineW: 6 });
  bgPerson(((t * 40) % 1700) - 300, FLOOR - 80, .65, t, { coat: '#3f5bd6', walk: 1, skin: '#b9794f' }); groundBits(71, '#ef8274', '#2fbf9b');
}
