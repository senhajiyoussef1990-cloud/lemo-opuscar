// worlds.js — the portal (it comes out of the Book of Papy) and one function per world, one palette each.
// World coordinates: floor at y = FLOOR, Malik around x 330, Papy around x 730; wides see x −140…1220.
import { clamp, lerp, hash, vnoise, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, bands } from './toon.js';
import { PAL, backpack, toyCar, dino, eye, mouth, book } from './chars.js';
export const FLOOR = 1380;
const X0 = -900, X1 = 2000;
const ground = (col, line = true) => shape(rect(X0, FLOOR - 40, X1 - X0, 1000), { fill: col, lw: line ? 6 : 0, stroke: line });
const hills = (y, col, amp = 60, ph = 0) => { const p = [[X0, 2600]]; for (let x = X0; x <= X1; x += 120) p.push([x, y - amp * (.5 + .5 * Math.sin(x * .004 + ph))]); p.push([X1, 2600]); shape(p, { fill: col, lw: 5 }); };
const blink = (t, ph = 0) => ((t * 12 + ph * 13) | 0) % 40 < 2;

// ———————————————————— the portal (the book's): violet rim, cyan spiral; the only thing that glows ————————————————————
export const GLOW = ['#5ef2ff', '#b56cff'];
export function portal(cx, cy, r, t, { open = 1, sx = .78, spin = 1 } = {}) {
  if (open <= .001) return;
  const R = r * open;
  push(); translate(cx, cy); scale(sx, 1);
  fillOnly(ell(0, 0, R * 1.6, R * 1.5, 48), 'rgba(94,242,255,.13)', { boil: .6 });
  fillOnly(ell(0, 0, R * 1.3, R * 1.24, 48), 'rgba(181,108,255,.16)', { boil: .6 });
  const rim = []; const N = 22;
  for (let i = 0; i < N; i++) { const a = i / N * TAU, k = 1 + .08 * (vnoise(i * 1.7 + t * 3) - .5) * 2 + .05 * Math.sin(a * 6 + t * 5); rim.push([Math.cos(a) * R * k, Math.sin(a) * R * k]); }
  shape(spline(rim), {
    fill: '#8a3df0', lw: 8, shade: () => {
      fillOnly(ell(0, 0, R * .9, R * .9, 40), '#2fd7ef', { boil: .3 });
      for (let k = 0; k < 6; k++) {
        const pts = [], pts2 = [];
        for (let j = 0; j <= 22; j++) { const u = j / 22, rr_ = R * (1 - u) * .95, a = k / 6 * TAU + u * 3.8 + t * 2.8 * spin; pts.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); const a2 = a + .5 * (1 - u * .7); pts2.push([Math.cos(a2) * rr_, Math.sin(a2) * rr_]); }
        fillOnly([...pts, ...pts2.reverse()], k % 2 ? '#9ff8ff' : '#b56cff', { boil: .4 });
      }
      fillOnly(ell(0, 0, R * .3, R * .3, 24), '#e6fdff', { boil: .5 });
      fillOnly(ell(0, 0, R * .13, R * .13, 16), '#ffffff', { boil: .5 });
    }
  });
  for (let i = 0; i < 12; i++) { const a = hash(i) * TAU + t * (1.5 + hash(i + 4) * 2), d = R * (1.05 + .25 * ((t * .8 + hash(i + 9)) % 1)); dot(Math.cos(a) * d, Math.sin(a) * d, 5 + hash(i + 2) * 4, i % 3 ? '#9ff8ff' : '#ffffff'); }
  // tiny letters escaping from the page (it's a book)
  for (let i = 0; i < 5; i++) { const u = (t * .7 + i / 5) % 1, a = hash(i + 30) * TAU + u * 2; text('ABCDEFGH'[i], Math.cos(a) * R * (.4 + u * .9), Math.sin(a) * R * (.4 + u * .9), { font: `400 ${26 + 14 * u}px VT323`, fill: `rgba(255,255,255,${1 - u})` }); }
  pop();
}

// ———————————————————— home: deliberately bland beige (the suspiciously normal world) ————————————————————
export function home(t, { dinoOnTable = 0, glow = 0, clockT = 0 } = {}) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#efe0c2', { boil: 0 });
  for (let x = -800; x < 2000; x += 180) stroke([[x, -1200], [x, FLOOR - 40]], 4, { line: '#e2cfab' });
  shape(rect(X0, FLOOR - 120, X1 - X0, 80), { fill: '#c9a978', lw: 6 });            // skirting
  ground('#a67c52'); for (let k = 0; k < 4; k++) stroke([[X0, FLOOR + 40 + k * 70 + k * k * 16], [X1, FLOOR + 40 + k * 70 + k * k * 16]], 4, { line: '#8c6440' });
  // window with a beige sky
  shape(rr(-80, 420, 360, 440, 14), { fill: '#f6efe0', lw: 7, shade: () => { fillOnly(rect(-80, 720, 360, 200), '#e5dcc4', { boil: .3 }); } });
  stroke([[100, 420], [100, 860]], 6); stroke([[-80, 640], [280, 640]], 6);
  // clock
  shape(ell(560, 440, 70, 70, 36), { fill: '#fff8e8', lw: 7 });
  const ma = clockT * .9 - 1.2; stroke([[560, 440], [560 + Math.cos(ma) * 48, 440 + Math.sin(ma) * 48]], 6); stroke([[560, 440], [560 + 30, 440 - 12]], 7);
  // fridge
  shape(rr(1000, 560, 300, 780, 26), { fill: '#e9e4d6', lw: 7, shade: () => fillOnly(rect(1200, 540, 120, 820), '#d3ccb9', { boil: .3 }) });
  stroke([[1000, 820], [1300, 820]], 6); shape(rr(1030, 640, 18, 120, 6), { fill: '#b8b0a0', lw: 5 }); shape(rr(1030, 880, 18, 160, 6), { fill: '#b8b0a0', lw: 5 });
  shape(rr(1090, 640, 90, 70, 6), { fill: '#fff', lw: 4 }); text('LISTE :', 1135, 660, { font: '800 18px "Baloo 2"' }); text('— goûter', 1135, 688, { font: '700 16px "Baloo 2"' });
  // low table
  shape(rr(440, 1196, 260, 34, 8), { fill: '#b8874f', lw: 6 }); for (const lx of [460, 664]) shape(rect(lx, 1228, 18, 120), { fill: '#8f6436', lw: 5 });
  if (dinoOnTable > 0) dino(560, 1196, .7 * dinoOnTable, { look: [1, 0] });
  // a plant, beige too
  shape(rr(-60, 1180, 120, 160, 16), { fill: '#c9a978', lw: 6 });
  for (const [a, l] of [[-.5, 160], [0, 200], [.5, 150]]) shape(spline([[0, 1180], [Math.sin(a) * l * .5 - 20, 1180 - l * .6], [Math.sin(a) * l, 1180 - l], [Math.sin(a) * l * .5 + 20, 1180 - l * .6]]), { fill: '#b9b48a', lw: 5 });
  if (glow > 0) fillOnly(rect(X0, -1200, X1 - X0, 3000), `rgba(94,242,255,${.12 * glow})`, { boil: 0 });
}

// ———————————————————— w1: long ago, everywhere — ochre, terracotta, turquoise ————————————————————
export function w1(t) {
  bands(['#5fd0c4', '#7fdccf', '#a6e8d8'], -1200, 900);
  shape(ell(860, 300, 90, 90, 30), { fill: '#ffe08a', lw: 6 });
  hills(980, '#e8a85a', 70); hills(1120, '#d98a43', 50, 2);
  ground('#c96f3b'); for (let i = 0; i < 18; i++) dot(-600 + hash(i) * 2400, FLOOR + 60 + hash(i + 5) * 400, 6, '#a8572a');
  // a round hut
  shape([...arc(1060, 1120, 180, 150, Math.PI, TAU, 24), [1240, 1340], [880, 1340]], { fill: '#f0c27a', lw: 7 });
  shape(spline([[860, 1130], [1060, 900], [1260, 1130], [1060, 1080]]), { fill: '#c98a3a', lw: 7 });
  shape(rr(1020, 1220, 80, 120, 30), { fill: '#6b3a1e', lw: 6 });
  w1Details(t);
  porter(-60, FLOOR - 10, t, 0);
  // the insert: a woven basket carried on a forehead strap, on a post
  basketProp(980, 1350);
  beetle(150 + ((t * 40) % 300), FLOOR + 30, t);
}
function basketProp(x, y) {
  push(); translate(x, y);
  shape(rect(-10, -230, 20, 230), { fill: '#7a4a24', lw: 6 });
  shape(spline([[-80, -230], [80, -230], [64, -40], [-64, -40]]), { fill: '#e0b062', lw: 7, shade: () => { for (let k = 0; k < 6; k++) stroke([[-90, -210 + k * 30], [90, -210 + k * 30]], 4, { line: '#b88438' }); for (let k = -3; k <= 3; k++) stroke([[k * 24, -230], [k * 19, -40]], 3, { line: '#b88438' }); } });
  stroke(quad([-70, -226], [0, -330], [70, -226], 16), 9, { line: '#7a4a24' });   // the strap
  pop();
}
// a porter with a basket on his back, a strap on the forehead
export function porter(x, y, t, bend = 0, col = '#3f7f9a') {
  push(); translate(x, y); rotate(bend * .35);
  shape(spline([[-60, -300], [50, -300], [44, -150], [-54, -150]]), { fill: '#e0b062', lw: 6, shade: () => { for (let k = 0; k < 4; k++) stroke([[-70, -280 + k * 34], [60, -280 + k * 34]], 3, { line: '#b88438' }); } });
  shape(noodle([0, -150], [0, -10], 0, 26, 22), { fill: '#8a5a3a', lw: 6 });
  shape(spline([[-30, -250], [40, -250], [52, -120], [-40, -120]]), { fill: col, lw: 6 });
  shape(ell(20, -290, 40, 40, 24), { fill: '#a8714a', lw: 6 }); stroke(quad([-40, -300], [20, -350], [60, -296], 10), 6, { line: '#7a4a24' });
  eye(34, -292, 9, 10, { lid: .5, skin: '#a8714a', lw: 4, pupil: 3 });
  pop();
}
function beetle(x, y, t) {
  push(); translate(x, y);
  shape(ell(0, 0, 26, 18, 20), { fill: '#3a8a5a', lw: 5 }); stroke([[0, -18], [0, 18]], 3);
  shape(ell(26, 2, 10, 9, 12), { fill: '#24563a', lw: 4 });
  shape(rr(-18, -44, 30, 24, 6), { fill: '#fff2c8', lw: 4 });   // carrying a crumb on its back
  for (let k = -1; k <= 1; k++) stroke([[k * 12, 14], [k * 12 + Math.sin(t * 20 + k) * 6, 28]], 3);
  pop();
}

// ———————————————————— w2: a 19th-century army camp — navy, madder red, cream ————————————————————
export function w2(t) {
  bands(['#1d2a55', '#26356b', '#314485'], -1200, 1000);
  for (let i = 0; i < 20; i++) dot(-400 + hash(i) * 1900, -100 + hash(i + 3) * 900, 3 + hash(i + 7) * 3, '#fff6dc');
  shape(ell(900, 260, 60, 60, 24), { fill: '#fff6dc', lw: 6 });
  hills(1100, '#22304f', 40);
  ground('#4a5a3a'); for (let i = 0; i < 14; i++) stroke([[-600 + hash(i) * 2400, FLOOR + 80 + hash(i + 2) * 300], [-590 + hash(i) * 2400, FLOOR + 60 + hash(i + 2) * 300]], 4, { line: '#36452a' });
  // tents
  for (const [x, s] of [[-40, 1], [1080, 1.1]]) { push(); translate(x, FLOOR - 30); scale(s); shape([[-200, 0], [0, -300], [200, 0]], { fill: '#f1e3c2', lw: 7, shade: () => fillOnly([[0, -300], [200, 0], [60, 0]], '#d4c29a', { boil: .3 }) }); shape([[-40, 0], [0, -120], [40, 0]], { fill: '#2a2430', lw: 5 }); stroke([[0, -300], [0, -360]], 6); shape([[0, -360], [70, -340], [0, -320]], { fill: '#c22f3a', lw: 5 }); pop(); }
  // a campfire
  for (let i = 0; i < 3; i++) shape(spline([[180 + i * 26, FLOOR + 10], [192 + i * 26, FLOOR - 60 - 20 * Math.sin(t * 9 + i)], [206 + i * 26, FLOOR + 10]]), { fill: i % 2 ? '#ffb23f' : '#ff6a2f', lw: 5 });
  // the insert: a havresac on a crate — open, clothes inside; a rigid one beside, straps and buckles
  w2Details(t);
  havresacProp(930, FLOOR - 10, t);
  pigeon(1040, FLOOR - 248, t);
}
function havresacProp(x, y, t) {
  push(); translate(x, y);
  shape(rr(-150, -110, 300, 110, 8), { fill: '#7a5230', lw: 6 }); stroke([[-150, -60], [150, -60]], 4, { line: '#5b3b20' });
  // rigid box pack
  shape(rr(40, -250, 120, 140, 10), { fill: '#3a3340', lw: 6, shade: () => fillOnly(rect(120, -260, 60, 160), '#2a2430', { boil: .3 }) });
  stroke([[70, -250], [70, -110]], 6, { line: '#e9d7a8' }); stroke([[130, -250], [130, -110]], 6, { line: '#e9d7a8' });
  // canvas havresac, flap open, a shirt and a rolled blanket
  shape(spline([[-140, -110], [-150, -230], [-20, -236], [-10, -110]]), { fill: '#c9b27a', lw: 6 });
  shape(spline([[-140, -232], [-90, -290], [-30, -280], [-20, -236]]), { fill: '#c22f3a', lw: 5 });
  shape(rr(-160, -280, 160, 46, 22), { fill: '#3f5aa8', lw: 5 });
  for (const sx of [-110, -50]) { stroke([[sx, -232], [sx, -150]], 7, { line: '#5b3b20' }); shape(rr(sx - 9, -164, 18, 16, 3), { fill: '#e9b949', lw: 3 }); }
  for (let k = 0; k < 7; k++) stroke([[-136 + k * 18, -126], [-128 + k * 18, -126]], 3, { line: '#8a7340' });
  for (const sx of [-130, -30]) stroke([[sx, -282], [sx, -236]], 5, { line: '#5b3b20' });
  for (let k = 0; k < 3; k++) stroke([[60, -230 + k * 40], [140, -230 + k * 40]], 3, { line: '#5a5260' });   // the rigid pack's panels
  pop();
}
function pigeon(x, y, t) {
  push(); translate(x, y);
  shape(ell(0, 0, 40, 30, 24), { fill: '#9aa3b8', lw: 5 }); shape(ell(30, -26, 20, 20, 16), { fill: '#b6bdcc', lw: 5 });
  shape([[48, -28], [64, -22], [48, -18]], { fill: '#e9b949', lw: 4 });
  eye(34, -30, 7, 8, { lid: blink(t, 2) ? 1 : 0, skin: '#b6bdcc', lw: 3, pupil: 2.5 });
  shape(rr(-30, -26, 30, 22, 4), { fill: '#c9b27a', lw: 4 });   // a tiny havresac
  for (const lx of [-8, 8]) stroke([[lx, 28], [lx, 44]], 4, { line: '#e07b39' });
  pop();
}

// ———————————————————— w3: a 20th-century mountain trail — violet, snow white, ice blue ————————————————————
export function w3(t) {
  bands(['#b7d8f2', '#cfe6f7', '#e4f1fb'], -1200, 900);
  for (const [x, h, w] of [[-200, 760, 520], [400, 960, 640], [1100, 820, 560]]) { shape([[x - w, 1300], [x, 1300 - h], [x + w, 1300]], { fill: '#7b4fd1', lw: 7, shade: () => fillOnly([[x, 1300 - h], [x + w, 1300], [x + w * .3, 1300]], '#5e38a8', { boil: .3 }) }); shape([[x - w * .26, 1300 - h * .74], [x, 1300 - h], [x + w * .26, 1300 - h * .74], [x + w * .1, 1300 - h * .68], [x - w * .06, 1300 - h * .78]], { fill: '#ffffff', lw: 6 }); }
  ground('#f4f7fb'); shape(rect(X0, FLOOR - 40, X1 - X0, 40), { fill: '#d9e6f4', lw: 5 });
  // snow falling
  for (let i = 0; i < 40; i++) { const x = (hash(i) * 2200 - 500 + Math.sin(t + i) * 30), y = ((hash(i + 9) * 2000 + t * 120) % 2000) - 200; dot(x, y, 4 + hash(i + 1) * 3, '#ffffff'); }
  // a hiker passing with a frame pack (wood)
  w3Details(t);
  framePack(980, FLOOR - 10, 'wood');
  framePack(1150, FLOOR - 10, 'metal');
  marmot(80, FLOOR + 10, t);
}
export function framePack(x, y, kind = 'wood') {
  push(); translate(x, y);
  const c = kind === 'wood' ? '#9a6232' : '#b9c2cf';
  for (const sx of [-60, 60]) shape(rr(sx - 8, -380, 16, 380, 6), { fill: c, lw: 5 });
  for (const yy of [-340, -220, -100]) shape(rr(-70, yy - 7, 140, 14, 5), { fill: c, lw: 5 });
  shape(rr(-80, -330, 160, 200, 20), { fill: kind === 'wood' ? '#6e8a3a' : '#c22f3a', lw: 6 });
  shape(rr(-50, -280, 100, 50, 10), { fill: kind === 'wood' ? '#5a7230' : '#9a1f2a', lw: 5 });
  stroke([[-44, -266], [44, -266]], 3);   // pocket zip
  for (const sx of [-40, 40]) { stroke([[sx, -330], [sx, -140]], 6, { line: '#5b3b20' }); shape(rr(sx - 8, -200, 16, 12, 3), { fill: '#e9b949', lw: 3 }); }
  shape(rr(-76, -150, 152, 36, 18), { fill: kind === 'wood' ? '#c9b27a' : '#3f5aa8', lw: 5 }); for (const x of [-50, 0, 50]) stroke([[x, -150], [x, -114]], 3);   // rolled bedroll
  for (let k = 0; k < 8; k++) stroke([[-72 + k * 19, -318], [-64 + k * 19, -318]], 3, { line: 'rgba(0,0,0,.35)' });   // stitching
  text(kind === 'wood' ? 'BOIS' : 'MÉTAL', 0, -400, { font: '800 30px "Baloo 2"', fill: '#2a2430' });
  pop();
}
function marmot(x, y, t) {
  push(); translate(x, y);
  for (const sx of [-30, 30]) shape(rr(sx - 6, -120, 12, 120, 4), { fill: '#b9c2cf', lw: 4 });   // a marmot with its own frame
  shape(ell(0, -50, 46, 54, 24), { fill: '#a0703f', lw: 6 }); shape(ell(0, -110, 34, 30, 20), { fill: '#b88450', lw: 6 });
  for (const ex of [-12, 14]) eye(ex, -116, 8, 9, { lid: blink(t, 5) ? 1 : 0, skin: '#b88450', lw: 3, pupil: 2.5 });
  shape(rr(-8, -96, 16, 12, 3), { fill: '#fff', lw: 3 });
  pop();
}

// ———————————————————— w4: Sweden 1960, a workshop — royal blue and bright yellow ————————————————————
export function w4(t) {
  bands(['#2a50d8', '#3a62e6', '#5277ef'], -1200, 1000);
  shape(ell(-40, 260, 80, 80, 30), { fill: '#ffd21f', lw: 6 });
  for (let i = 0; i < 6; i++) { const x = -600 + i * 340; shape([[x - 70, 1200], [x, 900], [x + 70, 1200]], { fill: '#173a9c', lw: 6 }); }   // fir trees
  ground('#ffd21f'); for (let k = 0; k < 4; k++) stroke([[X0, FLOOR + 50 + k * 80], [X1, FLOOR + 50 + k * 80]], 4, { line: '#e3b400' });
  // a workshop wall with a flag (blue with a yellow cross)
  shape(rr(860, 700, 520, 640, 10), { fill: '#1d3fb8', lw: 7 }); for (let x = 880; x < 1380; x += 60) stroke([[x, 720], [x, 1330]], 4, { line: '#173a9c' });
  stroke([[-40, 1340], [-40, 760]], 7); shape(rect(-40, 760, 220, 140), { fill: '#2a50d8', lw: 6, shade: () => { fillOnly(rect(20, 750, 36, 160), '#ffd21f', { boil: .2 }); fillOnly(rect(-50, 812, 240, 34), '#ffd21f', { boil: .2 }); } });
  // the insert: a workbench with a hiking pack on an aluminium frame, a roll of synthetic fabric
  shape(rr(860, 1180, 330, 30, 6), { fill: '#e9b949', lw: 6 }); for (const lx of [880, 1160]) shape(rect(lx, 1208, 18, 140), { fill: '#b88a2a', lw: 5 });
  push(); translate(980, 1180); scale(.62); framePack(0, 0, 'metal'); pop();
  shape(rr(1080, 1120, 100, 60, 28), { fill: '#3fb6a0', lw: 5 }); stroke(arc(1110, 1150, 16, 20, 0, TAU, 12), 3);
  w4Details(t);
  fox(160, FLOOR + 6, t);
}
function fox(x, y, t) {   // a polar fox that just stares
  push(); translate(x, y);
  shape(spline([[-60, 0], [-50, -70], [20, -80], [50, -20], [40, 0]]), { fill: '#f4f7fb', lw: 6 });
  shape(spline([[-60, -30], [-130, -60], [-110, -10]]), { fill: '#f4f7fb', lw: 5 });
  shape(spline([[10, -70], [0, -130], [30, -110], [60, -136], [70, -90], [96, -70], [50, -50]]), { fill: '#f4f7fb', lw: 6 });
  for (const ex of [26, 52]) eye(ex, -92, 9, 10, { lid: .55, skin: '#f4f7fb', lw: 3, pupil: 3 });
  dot(96, -72, 6);
  pop();
}

// ———————————————————— w5: USA 1967, a campus in the rain — olive, burnt orange, rain grey ————————————————————
export function w5(t, { rain = 1 } = {}) {
  bands(['#8d978f', '#a1aaa1', '#b4bcb3'], -1200, 1000);
  // a campus hall: columns
  shape(rect(-300, 640, 1700, 700), { fill: '#e8742a', lw: 7, shade: () => fillOnly(rect(-300, 640, 1700, 60), '#c75a1c', { boil: .3 }) });
  shape([[-340, 640], [550, 430], [1440, 640]], { fill: '#d0631f', lw: 7 });
  for (let x = -220; x < 1400; x += 170) shape(rr(x, 700, 60, 640, 8), { fill: '#f1d3b0', lw: 6 });
  ground('#5f6a32'); shape(rect(X0, FLOOR - 40, X1 - X0, 46), { fill: '#7a8540', lw: 5 });
  // puddle with eyes (the creature)
  shape(ell(140, FLOOR + 90, 140, 32, 30), { fill: '#8fa3b0', lw: 6 });
  for (const ex of [100, 170]) eye(ex, FLOOR + 82, 14, 12, { lid: blink(t, 3) ? 1 : .2, skin: '#8fa3b0', lw: 4, pupil: 3.5, look: [.5, 0] });
  // students with backpacks
  w5Details(t);
  for (const [x, c] of [[940, '#3a6f4a'], [1140, '#8a3a5a']]) student(x, FLOOR - 10, c, t);
  if (rain) for (let i = 0; i < 70; i++) { const x = hash(i) * 2000 - 400, y = ((hash(i + 3) * 2200 + t * 1500) % 2200) - 200; stroke([[x, y], [x - 8, y + 46]], 4, { line: '#dfe8ee', boil: .2 }); }
}
function student(x, y, col, t) {
  push(); translate(x, y);
  shape(rr(-64, -330, 70, 130, 18), { fill: '#e8742a', lw: 5 });   // backpack, seen from the side, over the books
  for (const lx of [-16, 16]) shape(noodle([lx, -190], [lx, -10], 0, 26, 22), { fill: '#2c3550', lw: 5 });
  shape(spline([[-40, -340], [40, -340], [50, -180], [-50, -180]]), { fill: col, lw: 6 });
  shape(ell(10, -390, 48, 50, 24), { fill: '#e7b48c', lw: 6 }); shape([...arc(10, -400, 52, 44, Math.PI, TAU, 16), [62, -396], [-42, -396]], { fill: '#5a3a24', lw: 5 });
  eye(26, -392, 10, 11, { lid: .3, skin: '#e7b48c', lw: 4, pupil: 3 });
  pop();
}

// ———————————————————— w6: Sweden 1978, a school — candy pink and apple green ————————————————————
export function w6(t) {
  bands(['#ff9cc8', '#ffb3d6', '#ffcae3'], -1200, 1000);
  shape(rr(-200, 600, 1500, 740, 12), { fill: '#8be04a', lw: 7, shade: () => fillOnly(rect(-200, 600, 1500, 80), '#6cc22e', { boil: .3 }) });
  for (let x = -120; x < 1300; x += 260) shape(rr(x, 760, 150, 170, 10), { fill: '#fff6e0', lw: 6, shade: () => fillOnly(rect(x + 70, 760, 10, 170), '#ff6fae', { boil: .2 }) });
  text('SKOLA', 560, 640, { font: '400 64px Bungee', fill: '#ff6fae', outlineW: 10 });
  ground('#ff6fae'); for (let k = 0; k < 5; k++) stroke([[X0, FLOOR + 40 + k * 70], [X1, FLOOR + 40 + k * 70]], 4, { line: '#e04f92' });
  // kids with square backpacks
  w6Details(t);
  for (const [x, c] of [[930, '#ffd21f'], [1130, '#3fb6e8']]) kid(x, FLOOR - 6, c, t);
  walkingBook(130 + Math.sin(t * 1.2) * 60, FLOOR + 10, t);
}
export function squarePack(x, y, s = 1, col = '#ffd21f') {
  push(); translate(x, y); scale(s);
  shape(rr(-70, -170, 140, 170, 12), { fill: col, lw: 7, shade: () => fillOnly(rect(30, -180, 50, 190), 'rgba(0,0,0,.12)', { boil: .3 }) });
  stroke(quad([-24, -170], [0, -200], [24, -170], 8), 6);   // top handle
  const zz = rr(-60, -160, 120, 150, 10); stroke(zz, 3, { line: 'rgba(0,0,0,.35)' });   // zip all round
  shape(rr(52, -150, 10, 18, 3), { fill: '#e9e2d0', lw: 3 });
  shape(rr(-50, -60, 100, 44, 8), { fill: col, lw: 5 }); stroke([[-44, -50], [44, -50]], 3);
  shape(rr(-26, -140, 52, 14, 4), { fill: '#e9e2d0', lw: 3 });   // reflective strip
  dot(-40, -146, 9, '#e8452f'); text('A B C', 0, -104, { font: '800 30px "Baloo 2"', fill: '#2a2430' });
  pop();
}
function kid(x, y, col, t) {
  push(); translate(x, y);
  squarePack(-40, -150, .7, col);
  for (const lx of [-12, 12]) shape(noodle([lx, -140], [lx, -8], 0, 22, 20), { fill: '#2c3550', lw: 5 });
  shape(spline([[-34, -250], [34, -250], [40, -130], [-40, -130]]), { fill: '#fff6e0', lw: 6 });
  stroke([[-40, -240], [-44, -150]], 7, { line: '#5a3a24' });
  shape(ell(6, -296, 44, 46, 24), { fill: '#f2c9a0', lw: 6 }); shape([...arc(6, -306, 48, 40, Math.PI, TAU, 16), [54, -300], [-42, -300]], { fill: '#f3d36a', lw: 5 });
  eye(22, -298, 9, 10, { lid: 0, skin: '#f2c9a0', lw: 4, pupil: 3 });
  pop();
}
function walkingBook(x, y, t) {
  push(); translate(x, y);
  for (const lx of [-20, 20]) stroke([[lx, -20], [lx + Math.sin(t * 12 + lx) * 12, 10]], 5);
  shape(rr(-50, -110, 100, 92, 6), { fill: '#3fb6e8', lw: 6 }); shape(rr(-50, -110, 16, 92, 4), { fill: '#2a8fc2', lw: 4 });
  for (const ex of [-10, 20]) eye(ex, -70, 11, 12, { lid: blink(t, 7) ? 1 : 0, skin: '#3fb6e8', lw: 4, pupil: 3 });
  pop();
}

// ———————————————————— w7: today, a backpack shop — mint and coral ————————————————————
export function w7(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#bff0dc', { boil: 0 });
  for (let y = 520; y < 1300; y += 190) shape(rect(-300, y, 1700, 20), { fill: '#ff7a6b', lw: 5 });   // shelves
  const cols = ['#ff7a6b', '#ffcf3a', '#3f5bd6', '#2fbf9b', '#8a3df0', '#2a2430', '#e8452f'];
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { const x = -260 + i * 190 + (r % 2) * 50, y = 520 + r * 190, c = cols[(i + r * 3) % cols.length]; shape(rr(x, y - 130, 110, 130, 18), { fill: c, lw: 5 }); shape(rr(x + 20, y - 70, 70, 44, 10), { fill: c, lw: 4 }); stroke([[x + 26, y - 60], [x + 84, y - 60]], 2.5); shape(rr(x + 70, y - 66, 6, 12, 2), { fill: '#e9e2d0', lw: 2 }); stroke([[x + 30, y - 130], [x + 40, y - 156], [x + 70, y - 156], [x + 80, y - 130]], 4); }
  ground('#ff9d8f'); for (let x = -800; x < 2000; x += 120) stroke([[x, FLOOR - 40], [x - 60, 2400]], 4, { line: '#ef8274' });
  shape(rr(860, 1140, 340, 200, 14), { fill: '#fff', lw: 7 });   // a counter
  text('SOLDES : 0 %', 1030, 1240, { font: '400 40px VT323', fill: '#ff7a6b' });
  w7Details(t);
}
// the insert in w7: one modern pack, all pockets and straps
export function modernPack(x, y, s = 1) {
  push(); translate(x, y); scale(s);
  shape(spline([[-90, -260], [90, -260], [104, -40], [90, 0], [-90, 0], [-104, -40]]), { fill: '#3f5bd6', lw: 7, shade: () => fillOnly(rect(40, -280, 80, 290), '#2c44b0', { boil: .3 }) });
  for (const [px, py, w, h, c] of [[-70, -120, 140, 90, '#2fbf9b'], [-104, -200, 40, 110, '#ffcf3a'], [64, -200, 40, 110, '#ffcf3a'], [-50, -240, 100, 50, '#ff7a6b']]) shape(rr(px, py, w, h, 12), { fill: c, lw: 5 });
  for (const zx of [-56, 56]) stroke([[zx, -100], [zx, -40]], 3);
  stroke(quad([-80, -246], [0, -270], [80, -246], 10), 3); for (const zx of [-40, 40]) shape(rr(zx - 5, -264, 10, 18, 3), { fill: '#2a2430', lw: 2 });   // top zips and pulls
  for (let k = 0; k < 5; k++) for (let j = 0; j < 4; j++) dot(-100 + k * 8, -180 + j * 18, 2.2, 'rgba(0,0,0,.35)');   // mesh pocket
  shape(rr(-110, -150, 30, 60, 10), { fill: '#ff7a6b', lw: 4 });   // a water bottle in it
  shape(rr(-60, -30, 120, 12, 4), { fill: '#e9e2d0', lw: 3 });   // reflector
  stroke([[-50, -196], [50, -196]], 6, { line: '#2a2430' }); shape(rr(-12, -204, 24, 16, 4), { fill: '#ffcf3a', lw: 3 });   // chest strap and clip
  for (const lx of [-30, 0, 30]) shape(rr(lx - 6, -14, 12, 14, 3), { fill: '#2a2430', lw: 2 });   // gear loops
  pop();
}

// ———————————————————— extra details for the journeys ————————————————————
// little things on the ground in front (stones, tufts) and in the sky (clouds)
function groundBits(seed, stone, tuft) {
  for (let i = 0; i < 14; i++) { const x = -300 + hash(seed + i) * 1700, y = FLOOR + 30 + hash(seed + i + 40) * 160;
    if (i % 2) shape(ell(x, y, 14 + hash(i + seed) * 12, 9, 12), { fill: stone, lw: 4 });
    else for (const d of [-10, 0, 10]) stroke([[x + d, y], [x + d * 1.6, y - 22]], 4, { line: tuft }); }
}
function clouds(t, y0, col = '#ffffff') { for (let i = 0; i < 3; i++) { const x = ((t * 12 + i * 600) % 1900) - 400, y = y0 + i * 90; shape(spline([[x - 120, y], [x - 90, y - 50], [x - 20, y - 70], [x + 50, y - 60], [x + 110, y - 30], [x + 120, y], [x, y + 16]]), { fill: col, lw: 6 }); } }
// a small background person: s = scale, walk = phase (0 = standing), pack: 'basket' | 'havre' | 'frame' | 'square' | 'modern' | null
export function bgPerson(x, y, s, t, { coat = '#3f7f9a', skin = '#a8714a', hair = '#2a1a10', hat = null, pack = null, packCol = '#c9b27a', face = 1, walk = 0, umbrella = null, legs = '#2c3550' } = {}) {
  push(); translate(x, y); scale(s * face, s);
  const ph = walk ? Math.floor(t * 8) % 2 : 0, lg = walk ? (ph ? 14 : -14) : 0;
  if (pack === 'basket') shape(spline([[-70, -300], [20, -300], [10, -160], [-60, -160]]), { fill: '#e0b062', lw: 6, shade: () => { for (let k = 0; k < 4; k++) stroke([[-80, -280 + k * 32], [30, -280 + k * 32]], 3, { line: '#b88438' }); } });
  if (pack === 'havre') { shape(rr(-74, -270, 56, 90, 8), { fill: packCol, lw: 5 }); shape(rr(-80, -296, 70, 30, 14), { fill: '#3f5aa8', lw: 4 }); }
  if (pack === 'frame') { for (const sx of [-70, -26]) shape(rr(sx - 5, -330, 10, 220, 4), { fill: '#b9c2cf', lw: 4 }); shape(rr(-78, -300, 60, 120, 14), { fill: packCol, lw: 5 }); }
  if (pack === 'square') shape(rr(-74, -270, 56, 80, 8), { fill: packCol, lw: 5 });
  if (pack === 'modern') { shape(rr(-74, -276, 58, 96, 16), { fill: packCol, lw: 5 }); shape(rr(-68, -220, 46, 30, 8), { fill: '#ffcf3a', lw: 4 }); }
  for (const [lx, d] of [[-14, lg], [14, -lg]]) shape(noodle([lx, -150], [lx + d, -6], 0, 24, 20), { fill: legs, lw: 5 });
  shape(spline([[-38, -270], [38, -270], [46, -140], [-46, -140]]), { fill: coat, lw: 6 });
  if (umbrella) { stroke([[30, -250], [30, -440]], 5); shape([...arc(30, -430, 120, 70, Math.PI, TAU, 18), [150, -430], [-90, -430]], { fill: umbrella, lw: 6 }); }
  shape(ell(6, -310, 40, 42, 22), { fill: skin, lw: 6 });
  shape([...arc(6, -318, 44, 36, Math.PI, TAU, 14), [50, -312], [-38, -312]], { fill: hair, lw: 5 });
  if (hat === 'shako') shape(rr(-30, -400, 70, 62, 6), { fill: '#1d2a55', lw: 5, shade: () => fillOnly(rect(-30, -352, 70, 10), '#c22f3a', { boil: .2 }) });
  if (hat === 'cap') shape([...arc(6, -334, 44, 26, Math.PI, TAU, 12), [70, -330], [-38, -330]], { fill: '#c22f3a', lw: 5 });
  if (hat === 'scarf') shape([...arc(6, -318, 48, 44, Math.PI * .9, TAU * 1.05, 14), [52, -290], [-40, -290]], { fill: '#e07b39', lw: 5 });
  eye(22, -312, 8, 9, { lid: .25, skin, lw: 3, pupil: 2.6 });
  pop();
}
const birds = (t, y0 = 200, n = 4) => { for (let i = 0; i < n; i++) { const x = ((t * 60 + i * 260) % 1600) - 300, y = y0 + i * 40 + Math.sin(t * 2 + i) * 12, f = Math.sin(t * 10 + i) * 8; stroke([[x - 22, y - f], [x, y], [x + 22, y - f]], 5); } };
function tree(x, y, s = 1, col = '#4f9a3a', trunk = '#7a4a24') { push(); translate(x, y); scale(s); shape(rr(-14, -200, 28, 200, 8), { fill: trunk, lw: 6 }); shape(spline([[-130, -200], [-110, -300], [-40, -350], [40, -350], [110, -300], [130, -200], [0, -170]]), { fill: col, lw: 6 }); pop(); }
function pine(x, y, s = 1, col = '#2f6b4a') { push(); translate(x, y); scale(s); shape(rect(-10, -40, 20, 40), { fill: '#6b3a1e', lw: 5 }); for (const [w, yy] of [[90, -40], [70, -130], [48, -210]]) shape([[-w, yy], [0, yy - 120], [w, yy]], { fill: col, lw: 6 }); pop(); }
function signpost(x, y, lines, col = '#9a6232') { push(); translate(x, y); shape(rect(-8, -220, 16, 220), { fill: col, lw: 5 }); lines.forEach((l, i) => { shape([[-90, -210 + i * 54], [80, -210 + i * 54], [100, -186 + i * 54], [80, -162 + i * 54], [-90, -162 + i * 54]], { fill: '#f1d3a0', lw: 5 }); text(l, -2, -186 + i * 54, { font: '800 26px "Baloo 2"', fill: '#2a2430' }); }); pop(); }

export function w1Details(t) {
  birds(t, 160); clouds(t, 360); groundBits(11, '#a8572a', '#6c9a3a');
  tree(-170, FLOOR - 60, .9, '#6c9a3a');
  for (const [x, s] of [[820, .9], [870, .7], [770, .75]]) shape(spline([[x - 30 * s, FLOOR - 40], [x - 42 * s, FLOOR - 90 * s], [x - 18 * s, FLOOR - 130 * s], [x + 18 * s, FLOOR - 130 * s], [x + 42 * s, FLOOR - 90 * s], [x + 30 * s, FLOOR - 40]]), { fill: '#c86a3a', lw: 5 });   // clay pots
  const wx = ((t * 40) % 1600) - 300;   // a porter walking along the far path
  bgPerson(wx, FLOOR - 150, .55, t, { coat: '#e07b39', pack: 'basket', walk: 1 });
  bgPerson(1150, FLOOR - 120, .6, t, { coat: '#3f7f9a', hat: 'scarf', pack: 'basket', face: -1 });
}
export function w2Details(t) {
  groundBits(23, '#36452a', '#7a8540');
  for (const x of [380, 620]) { push(); translate(x, FLOOR - 170); scale(.45); shape([[-200, 0], [0, -300], [200, 0]], { fill: '#f1e3c2', lw: 9 }); pop(); }   // far tents
  for (let i = 0; i < 5; i++) bgPerson(((t * 30 + i * 90) % 1700) - 400, FLOOR - 200, .38, t, { coat: '#c22f3a', hat: 'shako', pack: 'havre', walk: 1, skin: '#e7b48c' });   // a column marching past
  bgPerson(80, FLOOR - 40, .75, t, { coat: '#c22f3a', hat: 'shako', pack: 'havre', skin: '#e7b48c', face: 1 });
  shape(ell(150, FLOOR - 70, 30, 34, 18), { fill: '#e9d7a8', lw: 5 }); stroke([[130, FLOOR - 100], [170, FLOOR - 40]], 4);   // a drum
  shape(rr(700, FLOOR - 110, 120, 80, 6), { fill: '#9a6232', lw: 5 }); text('VIVRES', 760, FLOOR - 70, { font: '800 22px "Baloo 2"', fill: '#2a2430' });
  stroke([[880, FLOOR - 40], [880, FLOOR - 380]], 6); shape([[880, FLOOR - 380], [990, FLOOR - 350], [880, FLOOR - 320]], { fill: '#f1e3c2', lw: 5 });
}
export function w3Details(t) {
  clouds(t, 300); groundBits(31, '#b9c2cf', '#9fb3c8');
  for (const [x, s] of [[-140, 1.1], [860, .8], [-40, .7], [1180, 1]]) pine(x, FLOOR - 40, s);
  signpost(140, FLOOR - 30, ['SOMMET 2 h', 'REFUGE 30 min']);
  for (const [x, w] of [[700, 70], [760, 40]]) shape(spline([[x - w, FLOOR - 30], [x - w * .6, FLOOR - 30 - w * .8], [x + w * .4, FLOOR - 30 - w], [x + w, FLOOR - 30]]), { fill: '#b9c2cf', lw: 5 });
  const u = (t * .03) % 1; bgPerson(lerp(-300, 900, u), lerp(1080, 760, u), .35, t, { coat: '#c22f3a', hat: 'cap', pack: 'frame', packCol: '#6e8a3a', walk: 1, skin: '#e7b48c' });   // a hiker climbing far away
}
export function w4Details(t) {
  clouds(t, 380); groundBits(47, '#e3b400', '#3a62e6');
  shape(rr(880, 760, 300, 40, 6), { fill: '#e9b949', lw: 5 }); text('ATELIER', 1030, 780, { font: '400 32px Bungee', fill: '#1b2a7a' });
  shape(rr(900, 860, 250, 18, 4), { fill: '#b88a2a', lw: 5 });   // a shelf of fabric rolls
  ['#3fb6a0', '#e8452f', '#ffd21f', '#2a2430'].forEach((c, i) => shape(rr(910 + i * 60, 800, 50, 60, 22), { fill: c, lw: 5 }));
  shape(rr(900, 920, 110, 80, 4), { fill: '#fff6e0', lw: 5 }); framePackMini(955, 990);   // a sketch pinned on the wall
  // a sewing machine on the bench
  shape(spline([[1080, 1180], [1080, 1120], [1150, 1110], [1160, 1140], [1120, 1145], [1120, 1180]]), { fill: '#2a2430', lw: 5 });
  for (const x of [-120, 70]) { shape(rr(x - 10, 900, 20, 440, 6), { fill: '#f4f7fb', lw: 5 }); for (let k = 0; k < 4; k++) stroke([[x - 8, 960 + k * 90], [x + 6, 960 + k * 90]], 4); }   // birches
  birds(t, 260, 3);
}
function framePackMini(x, y) { push(); translate(x, y); scale(.3); framePack(0, 0, 'metal'); pop(); }
export function w5Details(t) {
  groundBits(53, '#4a5428', '#8a9a40');
  stroke([[40, FLOOR - 30], [40, FLOOR - 420]], 9); shape(rr(10, FLOOR - 460, 60, 50, 10), { fill: '#ffe08a', lw: 6 });   // a lamp post
  tree(-190, FLOOR - 40, .8, '#4f6a2a');
  for (let i = 0; i < 3; i++) bgPerson(((t * 50 + i * 420) % 1800) - 400, FLOOR - 160, .5, t, { coat: ['#3a6f4a', '#8a3a5a', '#3f5bd6'][i], pack: 'modern', packCol: '#e8742a', walk: 1, umbrella: ['#e8452f', '#ffd21f', '#2a2430'][i], skin: ['#e7b48c', '#b9794f', '#f2c9a0'][i] });
  // a bicycle
  push(); translate(760, FLOOR - 20); for (const x of [-50, 50]) shape(ell(x, 0, 34, 34, 20), { fill: 'rgba(0,0,0,0)', lw: 5 }); stroke([[-50, 0], [0, -40], [50, 0], [-10, 0], [-50, 0]], 5); stroke([[0, -40], [10, -60]], 5); pop();
}
export function w6Details(t) {
  for (let i = 0; i < 12; i++) { const x = -200 + i * 120; shape([[x, 560], [x + 100, 560], [x + 50, 620]], { fill: ['#ffd21f', '#3fb6e8', '#8be04a', '#ff6fae'][i % 4], lw: 5 }); } stroke([[-260, 556], [1300, 556]], 4);   // bunting
  clouds(t, 300);
  for (let i = 0; i < 4; i++) { const x = 300 + i * 70; shape(rect(x, FLOOR + 60, 60, 60), { fill: 'rgba(255,255,255,.0)', lw: 4, line: '#fff6e0' }); text(String(i + 1), x + 30, FLOOR + 92, { font: '800 30px "Baloo 2"', fill: '#fff6e0' }); }   // hopscotch in chalk
  shape(ell(560, 700, 50, 50, 24), { fill: '#fff6e0', lw: 6 }); stroke([[560, 700], [560, 670]], 5); stroke([[560, 700], [585, 710]], 5);   // school clock
  for (let i = 0; i < 2; i++) bgPerson(((t * 70 + i * 700) % 1700) - 300, FLOOR - 120, .55, t, { coat: ['#ff6fae', '#8be04a'][i], pack: 'square', packCol: ['#ffd21f', '#3fb6e8'][i], walk: 1, skin: ['#f2c9a0', '#b9794f'][i], hair: '#f3d36a' });
  push(); translate(-120, FLOOR - 20); for (let k = 0; k < 3; k++) { for (const x of [-30, 30]) shape(ell(k * 90 + x, 0, 24, 24, 16), { fill: 'rgba(0,0,0,0)', lw: 4 }); stroke([[k * 90 - 30, 0], [k * 90, -30], [k * 90 + 30, 0]], 4); } pop();   // bicycles
  shape(ell(820, FLOOR + 40, 22, 22, 16), { fill: '#e8452f', lw: 5 });   // a ball
}
export function w7Details(t) {
  for (const x of [100, 540, 980]) { stroke([[x, 0], [x, 160]], 4); shape([...arc(x, 200, 70, 44, Math.PI, TAU, 14), [x + 70, 200], [x - 70, 200]], { fill: '#ffcf3a', lw: 5 }); }   // hanging lamps
  const signs = ['ÉCOLE', 'RANDO', 'SPORT', 'VOYAGE'];
  signs.forEach((s, i) => { shape(rr(-240 + i * 400, 300, 220, 60, 12), { fill: '#ff7a6b', lw: 5 }); text(s, -130 + i * 400, 330, { font: '400 34px Bungee', fill: '#fff' }); });
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i += 2) { const x = -260 + i * 190 + (r % 2) * 50 + 90, y = 520 + r * 190 - 30; shape(rr(x, y, 44, 26, 4), { fill: '#fff', lw: 3 }); text(['19 €', '35 €', '49 €', '25 €'][(i + r) % 4], x + 22, y + 13, { font: '800 16px "Baloo 2"', fill: '#2a2430' }); }
  bgPerson(((t * 35) % 1700) - 300, FLOOR - 60, .7, t, { coat: '#8a3df0', pack: 'modern', packCol: '#2fbf9b', walk: 1, skin: '#e7b48c', face: 1 });
  push(); translate(-60, FLOOR - 40); shape(rr(-20, -60, 40, 60, 6), { fill: '#ff7a6b', lw: 5 }); for (const [a, l] of [[-.5, 120], [0, 150], [.5, 110]]) shape(spline([[0, -60], [Math.sin(a) * l * .5 - 14, -60 - l * .6], [Math.sin(a) * l, -60 - l], [Math.sin(a) * l * .5 + 14, -60 - l * .6]]), { fill: '#2fbf9b', lw: 4 }); pop();
}
