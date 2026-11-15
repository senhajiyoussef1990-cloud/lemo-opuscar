// teeth.js — « L'histoire de la brosse à dents »: the home (a bathroom corner) and seven worlds, one palette each.
// The portal and the shared helpers come from worlds.js. Inserts sit around x 960 (see INS in main.js).
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, bands } from './toon.js';
import { eye } from './chars.js';
import { figure } from './people.js';
import { FLOOR, portal, GLOW, ground, hills, blink, birds, tree, pine, groundBits, clouds, bgPerson } from './worlds.js';
export { FLOOR, portal, GLOW };
const X0 = -900, X1 = 2000;
export const darkness = () => 0;

// ———— a toothbrush: handle colour, bristle colour, kind 'bone' | 'bamboo' | 'plastic' | 'electric' ————
export function brush(x, y, s = 1, { a = 0, handle = '#3fb6e8', bristle = '#ffffff', kind = 'plastic', t = 0 } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  if (kind === 'electric') { shape(rr(-34, -40, 68, 220, 30), { fill: handle, lw: 6, shade: () => fillOnly(rect(10, -50, 40, 280), 'rgba(0,0,0,.12)', { boil: .3 }) }); shape(ell(0, 40, 14, 14, 12), { fill: '#fff', lw: 4 }); shape(rr(-14, -150, 28, 116, 10), { fill: '#e9ecef', lw: 5 }); const v = Math.sin(t * 60) * 3; shape(ell(v, -170, 24, 26, 16), { fill: bristle, lw: 5 }); stroke(spline([[0, 180], [40, 260], [-30, 330], [60, 420]], false), 5); pop(); return; }
  if (kind === 'stick') { shape(rr(-12, -150, 24, 350, 10), { fill: '#9a6232', lw: 6, shade: () => fillOnly(rect(4, -160, 12, 370), '#7a4a24', { boil: .3 }) }); for (let k = -4; k <= 4; k++) stroke([[k * 3, -150], [k * 7, -200]], 4, { line: '#c9a46a' }); pop(); return; }
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

// ———————————————————— w1: antiquity — a town of mud brick by an oasis (ochre, sand, palm green) ————————————————————
const palm = (x, s) => { push(); translate(x, FLOOR - 40); scale(s); stroke(spline([[0, 0], [20, -200], [10, -420]], false), 22, { line: '#8a5a34' }); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; shape(spline([[10, -420], [10 + Math.cos(a) * 120, -420 + Math.sin(a) * 120 - 10], [10 + Math.cos(a) * 220, -420 + Math.sin(a) * 160 + 40], [10 + Math.cos(a) * 110, -400 + Math.sin(a) * 80]]), { fill: '#4f9a3a', lw: 5 }); } pop(); };
const jar = (x, y, s, c = '#c86a3a') => shape(spline([[x - 22 * s, y], [x - 34 * s, y - 50 * s], [x - 16 * s, y - 90 * s], [x - 20 * s, y - 110 * s], [x + 20 * s, y - 110 * s], [x + 16 * s, y - 90 * s], [x + 34 * s, y - 50 * s], [x + 22 * s, y]]), { fill: c, lw: 5, shade: () => stroke([[x - 30 * s, y - 60 * s], [x + 30 * s, y - 60 * s]], 3, { line: '#8a3a1e' }) });
export function w1(t) {
  bands(['#f2b25a', '#f6c87a', '#fadc9e'], -1200, 900); shape(ell(860, 260, 90, 90, 30), { fill: '#fff1b0', lw: 6 }); birds(t, 180, 3);
  hills(1000, '#e3a14a', 70);
  // mud-brick houses with flat roofs and dark doorways, a ziggurat far away
  shape([[-300, 900], [-100, 900], [-140, 820], [-260, 820]], { fill: '#d08a4a', lw: 5 }); shape([[-260, 820], [-140, 820], [-170, 760], [-230, 760]], { fill: '#c07a3a', lw: 5 });
  for (const [x, w, h] of [[-280, 300, 360], [40, 260, 300], [760, 340, 380], [1120, 260, 320]]) { shape(rect(x, FLOOR - 40 - h, w, h), { fill: '#e0a86a', lw: 6, shade: () => { for (let k = 0; k < 6; k++) stroke([[x, FLOOR - 40 - h + 40 + k * 50], [x + w, FLOOR - 40 - h + 40 + k * 50]], 3, { line: '#c88a50' }); } }); shape(rect(x - 10, FLOOR - 40 - h - 20, w + 20, 24), { fill: '#b8784a', lw: 5 }); shape(rr(x + w * .4, FLOOR - 40 - 150, 60, 150, 26), { fill: '#3a2414', lw: 5 }); shape(rect(x + 20, FLOOR - 40 - h + 50, 40, 40), { fill: '#3a2414', lw: 4 }); }
  palm(-150, 1); palm(1260, .9);
  ground('#d9a05a'); groundBits(11, '#b87a3a', '#6c9a3a');
  // a well, jars, a donkey
  shape(ell(560, FLOOR + 40, 90, 30, 20), { fill: '#b8784a', lw: 6 }); shape(rect(470, FLOOR - 20, 180, 60), { fill: '#c88a50', lw: 6 }); stroke([[480, FLOOR - 20], [480, FLOOR - 160], [640, FLOOR - 160], [640, FLOOR - 20]], 6, { line: '#7a4a24' });
  for (const [x, s] of [[700, .9], [740, .7], [80, 1]]) jar(x, FLOOR + 10, s);
  push(); translate(250, FLOOR + 20); scale(.9); shape(ell(0, -80, 100, 50, 20), { fill: '#9a9aa0', lw: 5 }); shape(spline([[80, -110], [130, -170], [170, -150], [150, -110], [110, -90]]), { fill: '#9a9aa0', lw: 5 }); for (const ex of [140, 160]) shape([[ex, -165], [ex + 6, -210], [ex + 14, -165]], { fill: '#9a9aa0', lw: 4 }); for (const lx of [-60, -20, 30, 70]) shape(rr(lx, -40, 16, 44, 4), { fill: '#9a9aa0', lw: 4 }); eye(150, -140, 6, 7, { lid: .4, skin: '#9a9aa0', lw: 3, pupil: 2 }); pop();
  // the insert: chewing sticks on a cloth, one frayed like a little paintbrush
  shape(rr(820, 1170, 300, 60, 10), { fill: '#c22f3a', lw: 6 });
  for (let i = 0; i < 5; i++) { push(); translate(860 + i * 50, 1170); rotate(-.2 + i * .1); shape(rr(-8, -150, 16, 150, 6), { fill: '#9a6232', lw: 4 }); if (i === 2) for (let k = -3; k <= 3; k++) stroke([[k * 3, -150], [k * 6, -184]], 3, { line: '#c9a46a' }); pop(); }
  // people in tunics; one chews a stick, one carries a jar
  figure(1080, FLOOR - 40, .62, t, { era: 'antique', skin: '#a8714a', face: -1, hold: (x, y) => { push(); translate(x, y); rotate(-1.1); shape(rr(-6, -110, 12, 110, 4), { fill: '#9a6232', lw: 3 }); pop(); }, arms: -1.6 });
  figure(((t * 30) % 1700) - 300, FLOOR - 150, .5, t, { era: 'antique', skin: '#8a5a3a', walk: 1, top: '#e9b949', topS: '#c99a2a', hold: (x, y) => jar(x, y - 10, .5) });
  figure(380, FLOOR - 180, .45, t, { era: 'antique', skin: '#a8714a', top: '#3f7f9a', topS: '#2f6a80', hat: 'wrap', hatC: '#f1e3c2', face: -1 });
}
// ———————————————————— w2: China, late 15th century — a pagoda, lanterns, a moon gate (lacquer red, jade, gold) ————————————————————
const lantern = (x, y, s, t) => { push(); translate(x, y + Math.sin(t * 2 + x) * 4); scale(s); stroke([[0, -60], [0, -30]], 3); shape(ell(0, 0, 30, 34, 16), { fill: '#e8452f', lw: 4, shade: () => fillOnly(ell(-6, -6, 8, 18, 10), 'rgba(255,220,150,.6)', { boil: .2 }) }); shape(rr(-12, -38, 24, 8, 2), { fill: '#e9b949', lw: 3 }); shape(rr(-12, 30, 24, 8, 2), { fill: '#e9b949', lw: 3 }); stroke([[0, 38], [0, 60]], 3, { line: '#e9b949' }); pop(); };
export function w2(t) {
  bands(['#f6d6b0', '#f8e2c4', '#faeed8'], -1200, 900); clouds(t, 280, '#fff');
  hills(1000, '#9fc8a0', 90, 1); hills(1080, '#7ab08a', 60, 3);
  // a three-tier pagoda far left, a pavilion with a curved roof right
  push(); translate(-120, FLOOR - 40); for (let k = 0; k < 3; k++) { const w = 240 - k * 60, y = -k * 190; shape(rect(-w / 2 + 20, y - 170, w - 40, 170), { fill: '#c22f3a', lw: 6 }); shape(spline([[-w / 2 - 40, y - 150], [-w / 2, y - 190], [0, y - 230], [w / 2, y - 190], [w / 2 + 40, y - 150], [0, y - 180]]), { fill: '#2f8a6a', lw: 6 }); } shape([[-14, -760], [0, -830], [14, -760]], { fill: '#e9b949', lw: 4 }); pop();
  shape(rect(700, 760, 600, 580), { fill: '#c22f3a', lw: 7 }); for (const x of [740, 1240]) shape(rr(x, 760, 30, 580, 6), { fill: '#8a1f2a', lw: 5 });
  shape(spline([[620, 780], [700, 700], [1000, 640], [1300, 700], [1380, 780], [1000, 740]]), { fill: '#2f8a6a', lw: 7 });
  shape(ell(1000, 1000, 120, 140, 24), { fill: '#3a2414', lw: 6 });   // a moon gate
  stroke(spline([[600, 700], [800, 740], [1000, 720], [1200, 740], [1400, 700]], false), 3); for (let i = 0; i < 5; i++) lantern(640 + i * 180, 780, .8, t);
  // bamboo
  for (const x of [200, 260]) { for (let k = 0; k < 6; k++) shape(rr(x - 12, FLOOR - 40 - (k + 1) * 120, 24, 118, 6), { fill: '#7ab65a', lw: 4 }); shape(spline([[x, FLOOR - 600], [x + 60, FLOOR - 640], [x + 100, FLOOR - 600], [x + 40, FLOOR - 590]]), { fill: '#4f9a3a', lw: 4 }); }
  ground('#c9a46a'); for (let i = 0; i < 20; i++) stroke(rr(-400 + (i % 10) * 200 + (Math.floor(i / 10) % 2) * 100, FLOOR + 20 + Math.floor(i / 10) * 80, 180, 60, 14), 3, { line: '#b08a50' });
  // the insert: a lacquer tray, a brush with a bamboo handle and a pig-bristle tuft
  shape(rr(820, 1180, 300, 50, 10), { fill: '#2a2430', lw: 6, shade: () => fillOnly(rect(820, 1180, 300, 12), '#c22f3a', { boil: .2 }) });
  brush(960, 1150, 1.0, { a: Math.PI / 2, kind: 'bamboo', bristle: '#5a4a40' });
  // the pig, who is not pleased
  push(); translate(420, FLOOR + 10); shape(ell(0, -60, 90, 60, 24), { fill: '#f4b4c0', lw: 6 }); shape(ell(80, -80, 46, 40, 20), { fill: '#f4b4c0', lw: 6 }); shape(ell(116, -76, 18, 14, 12), { fill: '#e890a0', lw: 4 }); dot(110, -78, 3); dot(122, -78, 3);
  eye(78, -96, 9, 10, { lid: .5, skin: '#f4b4c0', lw: 3, pupil: 3 }); for (const lx of [-50, -10, 30, 60]) shape(rr(lx, -20, 18, 24, 4), { fill: '#f4b4c0', lw: 4 }); stroke(spline([[-90, -70], [-110, -90], [-100, -100], [-112, -110]], false), 4); pop();
  figure(1180, FLOOR - 40, .62, t, { era: 'chinese', skin: '#f2c9a0', hairC: '#1d1410', face: -1, arms: -.4 });
  figure(((t * 28) % 1700) - 300, FLOOR - 170, .5, t, { era: 'chinese', skin: '#f2c9a0', walk: 1, top: '#c22f3a', topS: '#9a1f2a', hold: (x, y) => { stroke([[x - 60, y - 10], [x + 60, y - 10]], 5, { line: '#7a4a24' }); } });
}
// ———————————————————— w3: England, around 1780, a London prison (stone grey, straw, candle) ————————————————————
export function w3(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#6e6e7a', { boil: 0 });
  for (let r = 0; r < 22; r++) for (let c = 0; c < 12; c++) stroke(rr(-800 + c * 230 + (r % 2) * 115, -200 + r * 80, 220, 72, 10), 3, { line: '#5a5a66' });
  // the barred window, and London rooftops with a domed church through it
  shape(rr(380, 420, 300, 260, 10), { fill: '#bfe0f0', lw: 7, shade: () => { fillOnly(rect(380, 560, 300, 120), '#7a8a9a', { boil: .2 }); fillOnly(ell(540, 560, 60, 50, 16), '#8a9aaa', { boil: .2 }); fillOnly(rect(536, 490, 8, 30), '#8a9aaa', { boil: .2 }); for (const x of [400, 460, 620]) fillOnly(rect(x, 580, 40, 100), '#5a6a7a', { boil: .2 }); } });
  for (let i = 0; i < 5; i++) shape(rr(400 + i * 60, 420, 16, 260, 4), { fill: '#3a3a44', lw: 4 });
  fillOnly([[400, 680], [660, 680], [880, 1340], [200, 1340]], 'rgba(255,255,230,.12)', { boil: .2 });
  // the cell door with a grille, a ring of keys on a nail, chains
  shape(rr(-260, 600, 300, 740, 10), { fill: '#5a3a24', lw: 7, shade: () => { for (let k = 0; k < 4; k++) stroke([[-260, 700 + k * 160], [40, 700 + k * 160]], 6, { line: '#3a3340' }); } }); shape(rr(-170, 680, 120, 100, 6), { fill: '#2a2430', lw: 5 }); for (let i = 0; i < 3; i++) stroke([[-150 + i * 40, 680], [-150 + i * 40, 780]], 5, { line: '#9a9aa0' });
  stroke(ell(160, 760, 30, 30, 14), 5, { line: '#e9b949' }); for (const a of [-.4, 0, .4]) stroke([[160 + Math.sin(a) * 30, 790], [160 + Math.sin(a) * 50, 850]], 5, { line: '#e9b949' });
  ground('#4a4a54'); for (let i = 0; i < 40; i++) stroke([[-200 + hash(i) * 700, FLOOR + 20 + hash(i + 3) * 80], [-180 + hash(i) * 700, FLOOR + 5 + hash(i + 3) * 80]], 4, { line: '#e9c46a' });   // straw
  shape(rr(120, FLOOR - 40, 260, 70, 10), { fill: '#7a6a4a', lw: 5 });   // a straw bed
  // the little table: a bone toothbrush, a rag, a pot of soot, a candle (the insert)
  shape(rr(800, 1160, 320, 26, 6), { fill: '#7a5a3a', lw: 6 }); for (const lx of [820, 1090]) shape(rect(lx, 1184, 16, 160), { fill: '#5b3b20', lw: 5 });
  brush(960, 1130, .95, { a: Math.PI / 2 - .15, kind: 'bone', bristle: '#3a3340' });
  shape(spline([[1010, 1160], [1040, 1120], [1090, 1130], [1100, 1160]]), { fill: '#d8d0c0', lw: 5 }); shape(rr(850, 1100, 50, 60, 8), { fill: '#2a2430', lw: 5 }); text('SUIE', 875, 1130, { font: '800 16px "Baloo 2"', fill: '#fff' });
  shape(rr(1080, 1090, 20, 70, 4), { fill: '#f6efe0', lw: 4 }); shape(spline([[1090, 1060], [1100, 1080], [1090, 1092], [1080, 1080]]), { fill: '#ffb23f', lw: 3 });
  // the prisoner in his 18th-century shirt and waistcoat, and a red-coated guard with a tricorn
  figure(1210, FLOOR - 20, .78, t, { era: 'georgian', hat: null, top: '#d8d0c0', topS: '#b8b0a0', vest: '#7a5a3a', skin: '#f2c9a0', hairC: '#5a3a24', face: -1, arms: -.5 });
  figure(-80, FLOOR - 30, .7, t, { era: 'guard18', skin: '#f2c9a0', hairC: '#3a2416', face: 1 });
}
// ———————————————————— w4: the 19th century — a street with a brush shop (violet dusk, gaslight, cobbles) ————————————————————
export function w4(t) {
  bands(['#3a2a5a', '#4a3a72', '#5a4a8a'], -1200, 900);
  for (let i = 0; i < 4; i++) { const x = -360 + i * 440; shape(rect(x, 520 - (i % 2) * 60, 420, 820 + (i % 2) * 60), { fill: ['#8a5a4a', '#6a5a7a', '#7a6a5a', '#8a4a4a'][i], lw: 6, shade: () => { for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) fillOnly(rr(x + 40 + c * 130, 580 + r * 150 - (i % 2) * 60, 80, 110, 6), hash(i * 7 + r * 3 + c) > .4 ? '#ffd27a' : '#2a2430', { boil: .2 }); } }); shape([[x - 10, 520 - (i % 2) * 60], [x + 430, 520 - (i % 2) * 60], [x + 410, 480 - (i % 2) * 60], [x + 10, 480 - (i % 2) * 60]], { fill: '#3a3340', lw: 5 }); for (const cx of [x + 60, x + 340]) shape(rect(cx, 400 - (i % 2) * 60, 40, 90), { fill: '#5a4a4a', lw: 4 }); }
  // the shop front: a striped awning, the sign, a window full of brushes (the insert)
  shape(rect(720, 820, 560, 520), { fill: '#2f6a5a', lw: 7 }); for (let i = 0; i < 7; i++) shape([[720 + i * 80, 780], [800 + i * 80, 780], [790 + i * 80, 840], [730 + i * 80, 840]], { fill: i % 2 ? '#f4f1ea' : '#c22f3a', lw: 4 });
  shape(rr(760, 700, 480, 80, 10), { fill: '#e9b949', lw: 6 }); text('BROSSES & PEIGNES', 1000, 742, { font: '400 40px Bungee', fill: '#2a2430' });
  shape(rr(780, 900, 380, 300, 10), { fill: '#f6efe0', lw: 6 });
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) brush(830 + c * 75, 1000 + r * 130, .3, { a: 0, kind: 'bone', bristle: '#5a4a40' });
  for (const [x, y, i] of [[900, 1020, 1], [1040, 960, 2], [980, 1110, 3]]) microbe(x, y, .55, t, i);
  // a gas lamp, a hansom cab passing, Victorian passers-by
  stroke([[620, FLOOR - 30], [620, FLOOR - 560]], 9); shape([[580, FLOOR - 640], [660, FLOOR - 640], [646, FLOOR - 560], [594, FLOOR - 560]], { fill: '#ffe08a', lw: 6 });
  const cx = ((t * 60) % 2200) - 600; push(); translate(cx, FLOOR - 120); shape(rr(-160, -200, 220, 160, 20), { fill: '#2a2430', lw: 6 }); shape(rr(-130, -180, 80, 70, 8), { fill: '#ffd27a', lw: 4 }); for (const wx of [-120, 40]) { stroke(ell(wx, -20, 60, 60, 20), 6); stroke([[wx - 60, -20], [wx + 60, -20]], 3); stroke([[wx, -80], [wx, 40]], 3); } shape(ell(220, -120, 110, 60, 20), { fill: '#7a4a24', lw: 6 }); shape(spline([[300, -150], [350, -230], [380, -210], [340, -140]]), { fill: '#7a4a24', lw: 5 }); for (const lx of [150, 190, 260, 290]) shape(rr(lx, -80, 16, 90, 4), { fill: '#7a4a24', lw: 4 }); pop();
  ground('#4a4e58'); for (let i = 0; i < 40; i++) stroke(rr(-400 + (i % 10) * 180 + (Math.floor(i / 10) % 2) * 90, FLOOR + 10 + Math.floor(i / 10) * 60, 150, 44, 10), 3, { line: '#3a3e48' });
  figure(200, FLOOR - 20, .7, t, { era: 'victorian', skin: '#f2c9a0', hairC: '#3a2416', beardC: '#5a3a24', hold: (x, y) => { stroke([[x, y], [x + 10, y + 150]], 5, { line: '#2a2430' }); } });
  figure(400, FLOOR - 60, .66, t, { era: 'vlady', skin: '#f2c9a0', hairC: '#7a4a24', face: -1 });
}
// ———————————————————— w5: USA 1938 — a factory with Art Deco lines, a big car of the time (teal, chrome, cream) ————————————————————
export function w5(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#2a7f8a', { boil: 0 });
  for (let i = 0; i < 6; i++) shape([[-300 + i * 300, 900], [-180 + i * 300, 360], [-60 + i * 300, 900]], { fill: '#2f8f9a', lw: 4 });   // Art Deco sunburst panels
  shape(rr(760, 380, 400, 130, 14), { fill: '#f4f1ea', lw: 7 }); text('NYLON', 960, 448, { font: '400 72px Bungee', fill: '#2a7f8a' }); for (const dx of [-230, 230]) shape([[960 + dx, 380], [960 + dx * 1.15, 445], [960 + dx, 510]], { fill: '#e9b949', lw: 5 });
  shape(rr(200, 560, 220, 160, 10), { fill: '#f4f1ea', lw: 6 }); text('1938', 310, 640, { font: '400 64px Bungee', fill: '#c22f3a' });   // a calendar on the wall
  ground('#e9ecef'); for (let x = -800; x < 2000; x += 160) stroke([[x, FLOOR - 40], [x, 2400]], 3, { line: '#c9ced6' });
  // spools of nylon thread on a machine
  shape(rr(-260, 980, 380, 320, 14), { fill: '#6e7682', lw: 6 }); for (let i = 0; i < 4; i++) { shape(rr(-230 + i * 90, 900, 60, 90, 8), { fill: '#f4f7fb', lw: 5 }); stroke([[-200 + i * 90, 990], [-100, 1100]], 2, { line: '#ffffff' }); }
  // the insert: the bench and the brush drying fast
  shape(rr(820, 1180, 300, 30, 6), { fill: '#c9ced6', lw: 6 }); for (const lx of [840, 1090]) shape(rect(lx, 1208, 16, 140), { fill: '#8a929c', lw: 5 });
  brush(960, 1140, 1.0, { a: Math.PI / 2, handle: '#e8452f', bristle: '#ffffff' });
  for (let i = 0; i < 4; i++) { const u = (t * .7 + i / 4) % 1; dot(900 + i * 40, 1060 - u * 80, 6 * (1 - u), `rgba(140,200,255,${1 - u})`); }
  // a 1930s car rolling past, workers and a lady of the time
  const cx = ((t * 70) % 2300) - 700; push(); translate(cx, FLOOR - 60); shape(spline([[-200, 0], [-210, -60], [-150, -90], [-90, -160], [60, -160], [120, -90], [210, -70], [220, 0]]), { fill: '#3a3340', lw: 6 }); shape(rr(-80, -150, 120, 60, 10), { fill: '#bfe9ff', lw: 4 }); for (const wx of [-130, 140]) { shape(ell(wx, 0, 44, 44, 18), { fill: '#2a2430', lw: 5 }); shape(ell(wx, 0, 18, 18, 10), { fill: '#e9ecef', lw: 3 }); } shape(rr(200, -60, 20, 30, 4), { fill: '#ffe08a', lw: 3 }); pop();
  figure(1200, FLOOR - 40, .7, t, { era: 'lab', skin: '#e7b48c', hairC: '#3a2416', face: -1 });
  figure(600, FLOOR - 120, .55, t, { era: 'thirties', skin: '#f2c9a0', face: 1 }); figure(680, FLOOR - 120, .52, t, { era: 't_lady', skin: '#b9794f', hairC: '#1d1410', face: -1 });
}
// ———————————————————— w6: Switzerland 1954 — a chalet in the Alps, a scooter (Swiss red, white, alpine blue) ————————————————————
export function w6(t) {
  bands(['#8cc3e8', '#a6d2ef', '#c4e2f6'], -1200, 900); clouds(t, 250);
  for (const [x, h, w] of [[-200, 700, 520], [380, 880, 640], [1100, 760, 560]]) { shape([[x - w, 1300], [x, 1300 - h], [x + w, 1300]], { fill: '#7b8fb8', lw: 7, shade: () => fillOnly([[x, 1300 - h], [x + w, 1300], [x + w * .3, 1300]], '#6a7ea6', { boil: .3 }) }); shape([[x - w * .26, 1300 - h * .74], [x, 1300 - h], [x + w * .26, 1300 - h * .74], [x + w * .1, 1300 - h * .68], [x - w * .06, 1300 - h * .78]], { fill: '#ffffff', lw: 6 }); }
  // a chalet: wooden walls, a wide roof, a balcony with flowers, a red flag with a white cross
  push(); translate(1000, FLOOR - 40); shape(rect(-260, -420, 520, 420), { fill: '#b8784a', lw: 7, shade: () => { for (let k = 0; k < 10; k++) stroke([[-260, -400 + k * 42], [260, -400 + k * 42]], 3, { line: '#9a6232' }); } }); shape([[-340, -400], [0, -600], [340, -400]], { fill: '#7a4a24', lw: 7 }); shape(rect(-280, -240, 560, 20), { fill: '#7a4a24', lw: 5 }); for (let i = 0; i < 8; i++) { stroke([[-270 + i * 76, -240], [-270 + i * 76, -180]], 5, { line: '#7a4a24' }); dot(-250 + i * 76, -250, 12, i % 2 ? '#e8452f' : '#ffcf3a'); } for (const wx of [-170, 100]) shape(rr(wx, -380, 90, 100, 6), { fill: '#bfe9ff', lw: 5 }); shape(rr(-50, -160, 100, 160, 8), { fill: '#5b341d', lw: 5 }); pop();
  stroke([[620, FLOOR - 40], [620, FLOOR - 560]], 7); shape(rect(620, FLOOR - 560, 150, 150), { fill: '#e8452f', lw: 6 }); fillOnly(rect(680, FLOOR - 540, 30, 110), '#fff', { boil: 0 }); fillOnly(rect(640, FLOOR - 500, 110, 30), '#fff', { boil: 0 });
  ground('#7ab65a'); groundBits(47, '#5a8a3a', '#4f9a3a'); for (let i = 0; i < 12; i++) dot(-200 + hash(i) * 1600, FLOOR + 40 + hash(i + 9) * 200, 8, i % 2 ? '#ffffff' : '#ffcf3a');
  // the insert: a little table on the grass, the electric toothbrush plugged in and buzzing
  shape(rr(800, 1180, 340, 30, 6), { fill: '#f4f7fb', lw: 6 }); for (const lx of [820, 1110]) shape(rect(lx, 1208, 16, 140), { fill: '#c9ced6', lw: 5 });
  brush(960, 1000, .75, { kind: 'electric', handle: '#ffffff', bristle: '#3fb6e8', t });
  for (let i = 0; i < 3; i++) stroke(arc(960, 860, 50 + i * 20, 50 + i * 20, -2.4, -.8, 8), 3, { line: '#3fb6e8' });
  // a 1950s scooter and a couple of the time
  push(); translate(160, FLOOR - 10); shape(spline([[-140, -40], [-120, -120], [-20, -130], [60, -60], [120, -60], [130, -150], [160, -150], [150, -40]]), { fill: '#7ad0c0', lw: 6 }); for (const wx of [-110, 140]) shape(ell(wx, -20, 34, 34, 14), { fill: '#2a2430', lw: 5 }); shape(rr(-100, -160, 90, 30, 10), { fill: '#c22f3a', lw: 4 }); pop();
  figure(380, FLOOR - 60, .66, t, { era: 'fifties', skin: '#f2c9a0', hairC: '#5a3a24' }); figure(1260, FLOOR - 30, .66, t, { era: 'f_lady', skin: '#f2c9a0', hairC: '#c9862a', face: -1 });
}
// ———————————————————— w7: today — a bright bathroom shop / home (mint, coral) ————————————————————
export function w7(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#bff0dc', { boil: 0 });
  for (let r = 0; r < 8; r++) for (let c = 0; c < 14; c++) shape(rect(-300 + c * 110, 520 + r * 110, 110, 110), { fill: '#d8f6ea', lw: 3 });
  ground('#ff9d8f'); for (let x = -800; x < 2000; x += 120) stroke([[x, FLOOR - 40], [x - 60, 2400]], 4, { line: '#ef8274' });
  shape(rr(-200, 600, 320, 220, 18), { fill: '#cfe8f5', lw: 7 }); shape([[-220, 900], [140, 900], [110, 980], [-190, 980]], { fill: '#fff', lw: 7 }); shape(rr(-60, 980, 40, 360, 6), { fill: '#fff', lw: 6 });
  shape(rr(-120, 820, 70, 80, 10), { fill: '#ffcf3a', lw: 5 }); for (const [a, c] of [[-.3, '#3fb6e8'], [0, '#e8452f'], [.3, '#2fbf9b'], [.5, '#8a3df0']]) brush(-86 + a * 30, 830, .3, { a, handle: c });
  shape(rr(300, 560, 200, 200, 10), { fill: '#fff', lw: 6 }); text('3 MOIS', 400, 620, { font: '400 40px Bungee', fill: '#ff7a6b' }); stroke([[340, 680], [460, 680]], 4); stroke([[340, 720], [430, 720]], 4);
  shape(rr(560, 600, 180, 300, 16), { fill: '#2a2430', lw: 6 }); shape(rr(575, 620, 150, 240, 10), { fill: '#3fb6e8', lw: 4 }); text('2:00', 650, 740, { font: '400 54px Bungee', fill: '#fff' });   // a phone on the wall with a 2-minute timer
  shape(rr(760, 860, 120, 180, 10), { fill: '#ffffff', lw: 5 }); text('DENTIFRICE', 820, 950, { font: '800 16px "Baloo 2"', fill: '#2fbf9b' });
  // the insert: an hourglass and a toothbrush side by side
  shape(rr(820, 1180, 300, 30, 6), { fill: '#fff', lw: 6 }); hourglass(900, 1180, .7, t); brush(1050, 1150, .85, { a: Math.PI / 2 - .3, handle: '#2fbf9b' });
  text('2 MIN', 900, 1240, { font: '400 36px Bungee', fill: '#ff7a6b', outlineW: 6 });
  figure(((t * 40) % 1700) - 300, FLOOR - 80, .62, t, { era: 'modern', skin: '#b9794f', walk: 1 }); figure(1250, FLOOR - 40, .64, t, { era: 'm_lady', skin: '#f2c9a0', hairC: '#3a2416', face: -1, arms: -1.4, hold: (x, y) => brush(x, y - 40, .35, { handle: '#8a3df0' }) });
  groundBits(71, '#ef8274', '#2fbf9b');
}
// the brush of each era, held in a hand (x, y = the fist)
const ERA = { w1: { kind: 'stick' }, w2: { kind: 'bamboo', bristle: '#5a4a40' }, w3: { kind: 'bone', bristle: '#3a3340' }, w4: { kind: 'bone', bristle: '#5a4a40' }, w5: { handle: '#e8452f' }, w6: { kind: 'electric', handle: '#ffffff', bristle: '#3fb6e8' }, w7: { handle: '#2fbf9b' } };
export function heldBrush(w, t) { const e = ERA[w]; if (!e) return null; return (x, y) => brush(x, y - (e.kind === 'electric' ? 70 : 60), e.kind === 'electric' ? .62 : .75, { ...e, t }); }
export const malikBrush = (x, y) => brush(x, y - 50, .62, { handle: '#3fb6e8' });
