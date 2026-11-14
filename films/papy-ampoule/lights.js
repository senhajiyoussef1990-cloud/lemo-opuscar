// lights.js — « L'histoire de l'ampoule »: the home with its ceiling lamp and seven worlds of light, one palette each.
// The portal and the shared helpers come from worlds.js. Inserts sit around x 960 (see INS in main.js).
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, bands } from './toon.js';
import { eye } from './chars.js';
import { FLOOR, portal, GLOW, ground, hills, blink, birds, tree, pine, groundBits, clouds, signpost, bgPerson } from './worlds.js';
export { FLOOR, portal, GLOW };
const X0 = -900, X1 = 2000;
const glowRing = (x, y, r, col, a = .25) => { fillOnly(ell(x, y, r * 1.6, r * 1.6, 30), col.replace('A', a * .5), { boil: .5 }); fillOnly(ell(x, y, r, r, 30), col.replace('A', a), { boil: .5 }); };
const flick = (t, i = 0) => .85 + .1 * Math.sin(t * 9 + i * 2) + .08 * (hash(Math.floor(t * 12) + i * 7) - .5);

// ———— a bulb: kind 'carbon' (thin loop), 'tungsten' (coil), 'led' (flat chips), 'blown' (broken filament), 'old' (hand-blown, pointed tip) ————
export function bulb(x, y, s = 1, { on = 0, t = 0, kind = 'tungsten', warm = true } = {}) {
  push(); translate(x, y); scale(s);
  const col = kind === 'led' ? 'rgba(255,250,235,A)' : warm ? 'rgba(255,214,120,A)' : 'rgba(255,240,200,A)';
  if (on) glowRing(0, -70, 90, col, .3 * on * flick(t));
  const glass = kind === 'old' ? [[-14, 0], [-30, -30], [-58, -70], [-54, -120], [-20, -150], [0, -170], [20, -150], [54, -120], [58, -70], [30, -30], [14, 0]]
    : [[-16, 0], [-26, -26], [-56, -64], [-58, -110], [-30, -146], [0, -152], [30, -146], [58, -110], [56, -64], [26, -26], [16, 0]];
  shape(spline(glass), { fill: on ? (kind === 'led' ? '#fffaf0' : '#fff1c4') : 'rgba(235,242,250,.85)', lw: 6, shade: () => fillOnly(ell(-26, -104, 10, 26, 12), 'rgba(255,255,255,.7)', { boil: .2 }) });
  const fc = on ? '#ff9d2e' : '#6b5a4a';
  if (kind === 'carbon' || kind === 'old') stroke(quad([-12, -20], [0, -150], [12, -20], 14), 4, { line: fc });
  else if (kind === 'tungsten') { stroke([[-10, -20], [-16, -80]], 3, { line: '#8a8a8a' }); stroke([[10, -20], [16, -80]], 3, { line: '#8a8a8a' }); const P = []; for (let i = 0; i <= 30; i++) { const u = i / 30; P.push([-16 + 32 * u, -84 + Math.sin(u * TAU * 5) * 6]); } stroke(P, 3, { line: fc }); }
  else if (kind === 'led') { stroke([[0, -10], [0, -60]], 5, { line: '#c9c9c9' }); for (const dx of [-14, 14]) shape(rr(dx - 6, -110, 12, 50, 3), { fill: on ? '#fff6d0' : '#e8d070', lw: 3 }); }
  else if (kind === 'blown') { stroke([[-10, -20], [-14, -80], [-4, -96]], 3, { line: '#3a3340' }); stroke([[10, -20], [14, -80], [6, -92]], 3, { line: '#3a3340' }); fillOnly(ell(0, -100, 30, 20, 14), 'rgba(60,50,60,.25)', { boil: .2 }); }
  shape(rr(-20, -4, 40, 40, 6), { fill: '#b8b0a0', lw: 5 }); for (const yy of [6, 16, 26]) stroke([[-20, yy], [20, yy - 4]], 3); shape(ell(0, 40, 8, 6, 10), { fill: '#3a3340', lw: 3 });
  pop();
}
function candle(x, y, s, t, i = 0) {
  push(); translate(x, y); scale(s);
  shape(rr(-14, -110, 28, 110, 4), { fill: '#f6efe0', lw: 5 }); stroke([[0, -110], [0, -124]], 3);
  const f = flick(t, i); glowRing(0, -146, 34, 'rgba(255,200,90,A)', .35 * f);
  shape(spline([[0, -170 - 10 * f], [12, -140], [0, -124], [-12, -140]]), { fill: '#ffb23f', lw: 4, shade: () => fillOnly(ell(0, -138, 5, 9, 8), '#fff3c0', { boil: .2 }) });
  for (let k = 0; k < 2; k++) { const u = (t * .6 + k * .5 + i * .3) % 1; stroke(spline([[0, -180 - u * 120], [10, -200 - u * 120], [-6, -220 - u * 120]], false), 3, { line: `rgba(90,80,80,${.35 * (1 - u)})` }); }   // a wisp of smoke
  pop();
}
function oilLamp(x, y, s, t) {
  push(); translate(x, y); scale(s);
  shape(spline([[-70, 0], [-60, -40], [40, -50], [90, -36], [60, 0]]), { fill: '#c98a3a', lw: 6 }); stroke(quad([-60, -30], [-110, -50], [-80, -6], 8), 6);
  const f = flick(t, 3); glowRing(90, -70, 40, 'rgba(255,190,80,A)', .35 * f);
  shape(spline([[90, -100 - 10 * f], [104, -66], [90, -48], [76, -66]]), { fill: '#ffb23f', lw: 4 });
  for (let k = 0; k < 3; k++) { const u = (t * .5 + k / 3) % 1; stroke(spline([[90, -110 - u * 160], [104, -140 - u * 160], [84, -170 - u * 160]], false), 5, { line: `rgba(60,50,50,${.4 * (1 - u)})` }); }   // it smokes a lot
  pop();
}

// ———————————————————— home: the beige room and its ceiling lamp ————————————————————
export function home(t, { light = 1, screwed = false, glow = 0, clockT = 0 } = {}) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#efe0c2', { boil: 0 });
  for (let x = -800; x < 2000; x += 180) stroke([[x, -1200], [x, FLOOR - 40]], 4, { line: '#e2cfab' });
  shape(rect(X0, FLOOR - 120, X1 - X0, 80), { fill: '#c9a978', lw: 6 });
  ground('#a67c52'); for (let k = 0; k < 4; k++) stroke([[X0, FLOOR + 40 + k * 70 + k * k * 16], [X1, FLOOR + 40 + k * 70 + k * k * 16]], 4, { line: '#8c6440' });
  shape(rr(-80, 420, 360, 440, 14), { fill: light === 0 ? '#3a4a6a' : '#f6efe0', lw: 7 }); stroke([[100, 420], [100, 860]], 6); stroke([[-80, 640], [280, 640]], 6);   // window (night outside when the light is out)
  if (light === 0) for (let i = 0; i < 6; i++) dot(-40 + hash(i) * 300, 450 + hash(i + 3) * 380, 3, '#fff6dc');
  shape(ell(860, 440, 70, 70, 36), { fill: '#fff8e8', lw: 7 }); const ma = clockT * .9 - 1.2; stroke([[860, 440], [860 + Math.cos(ma) * 48, 440 + Math.sin(ma) * 48]], 6); stroke([[860, 440], [890, 428]], 7);
  shape(rr(1000, 560, 300, 780, 26), { fill: '#e9e4d6', lw: 7 }); stroke([[1000, 820], [1300, 820]], 6);
  shape(rr(440, 1196, 260, 34, 8), { fill: '#b8874f', lw: 6 }); for (const lx of [460, 664]) shape(rect(lx, 1228, 18, 120), { fill: '#8f6436', lw: 5 });
  // the light switch by the door
  shape(rr(1340, 980, 50, 80, 8), { fill: '#fff', lw: 5 }); shape(rr(1356, light === 2 ? 996 : 1016, 18, 28, 4), { fill: '#d8d0c0', lw: 3 });
  // the ceiling lamp: cord, shade, bulb (old and lit, then blown, then the new LED)
  stroke([[540, -400], [540, 300]], 5); shape([...arc(540, 360, 130, 70, Math.PI, TAU, 18), [670, 360], [410, 360]], { fill: '#c98a3a', lw: 7 });
  const sw = light === 0 ? Math.sin(t * 2) * .04 : 0;
  bulb(540 + sw * 100, 470, .9, { on: light === 1 ? 1 : light === 2 ? 1 : 0, t, kind: light === 2 || screwed ? 'led' : light === 1 ? 'tungsten' : 'blown' });
  if (light > 0) fillOnly([[420, 380], [660, 380], [1100, 1400], [-20, 1400]], light === 2 ? 'rgba(255,250,235,.16)' : 'rgba(255,214,120,.14)', { boil: .2 });
  if (glow > 0) fillOnly(rect(X0, -1200, X1 - X0, 3000), `rgba(94,242,255,${.12 * glow})`, { boil: 0 });
}
export const darkness = (light, portalOpen) => light === 0 ? (portalOpen ? .22 : .42) : 0;

// ———————————————————— w1: long ago — candles and oil lamps (amber, umber, dusk blue) ————————————————————
export function w1(t) {
  bands(['#2c3a6b', '#45507e', '#6a6a8a'], -1200, 900);
  for (let i = 0; i < 14; i++) dot(-400 + hash(i) * 1900, -200 + hash(i + 3) * 900, 3, '#fff6dc');
  hills(1060, '#3a3058', 50);
  ground('#6b4a2c'); groundBits(11, '#4e3420', '#8a6a3a');
  // a stone cottage with lit windows
  shape(rect(760, 860, 560, 480), { fill: '#b89a72', lw: 7, shade: () => { for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) stroke(rr(770 + c * 92 + (r % 2) * 40, 870 + r * 78, 84, 70, 10), 3, { line: '#9a7c58' }); } });
  shape([[730, 870], [1040, 660], [1350, 870]], { fill: '#6b3a1e', lw: 7 });
  for (const wx of [820, 1180]) { shape(rr(wx, 960, 110, 120, 8), { fill: '#ffd27a', lw: 6 }); glowRing(wx + 55, 1020, 70, 'rgba(255,200,90,A)', .22 * flick(t, wx)); }
  // the insert: a table with candles and an oil lamp
  shape(rr(820, 1230, 300, 28, 6), { fill: '#7a4a24', lw: 6 }); for (const lx of [840, 1090]) shape(rect(lx, 1256, 16, 100), { fill: '#5b341d', lw: 5 });
  candle(880, 1232, .9, t, 0); candle(930, 1232, .7, t, 1); oilLamp(1020, 1232, .8, t);
  // someone carrying a candle past
  const wx = ((t * 35) % 1600) - 300; bgPerson(wx, FLOOR - 140, .55, t, { coat: '#6a5a8a', walk: 1, skin: '#e7b48c' }); candle(wx + 30, FLOOR - 300, .4, t, 5);
}
// ———————————————————— w2: a 19th-century street lit by gas (night teal, slate, warm yellow) ————————————————————
export function w2(t) {
  bands(['#123a4a', '#1a4d5e', '#245e6e'], -1200, 900);
  shape(ell(200, 220, 60, 60, 24), { fill: '#f6efe0', lw: 6 });
  for (let i = 0; i < 4; i++) { const x = -300 + i * 420; shape(rect(x, 520 - (i % 2) * 80, 380, 820 + (i % 2) * 80), { fill: i % 2 ? '#3d5a66' : '#4a6a70', lw: 7 }); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) shape(rr(x + 40 + c * 110, 600 + r * 170 - (i % 2) * 80, 70, 100, 6), { fill: hash(i * 9 + r * 3 + c) > .5 ? '#ffd27a' : '#20303a', lw: 4 }); }
  ground('#4a4e58'); for (let i = 0; i < 40; i++) stroke(rr(-400 + (i % 10) * 180 + (Math.floor(i / 10) % 2) * 90, FLOOR + 10 + Math.floor(i / 10) * 60, 150, 44, 10), 3, { line: '#3a3e48' });   // cobbles
  // a row of gas street lamps; the lamplighter lights them one by one
  const lx = [-140, 280, 960, 1380], lit = Math.floor(((t * .4) % 1) * 5);
  lx.forEach((x, i) => {
    stroke([[x, FLOOR - 30], [x, FLOOR - 520]], 9); shape([[x - 40, FLOOR - 600], [x + 40, FLOOR - 600], [x + 28, FLOOR - 520], [x - 28, FLOOR - 520]], { fill: i < lit || i === 2 ? '#ffe08a' : '#2a3a44', lw: 6 }); shape([[x - 50, FLOOR - 600], [x, FLOOR - 650], [x + 50, FLOOR - 600]], { fill: '#1d2a30', lw: 6 });
    if (i < lit || i === 2) { glowRing(x, FLOOR - 560, 80, 'rgba(255,214,120,A)', .25 * flick(t, i)); fillOnly([[x - 30, FLOOR - 520], [x + 30, FLOOR - 520], [x + 160, FLOOR + 40], [x - 160, FLOOR + 40]], 'rgba(255,214,120,.1)', { boil: .2 }); }
  });
  // the lamplighter with his long pole, at the insert lamp
  push(); translate(1060, FLOOR - 10); bgPerson(0, 0, .8, t, { coat: '#2a2430', hat: 'cap', skin: '#e7b48c', face: -1 }); stroke([[-20, -200], [-100, -560]], 6, { line: '#7a4a24' }); const f = flick(t, 9); shape(spline([[-100, -580 - 10 * f], [-90, -560], [-100, -548], [-110, -560]]), { fill: '#ffb23f', lw: 3 }); pop();
}
// ———————————————————— w3: England 1879, Swan's laboratory (brick red, cream, brass) ————————————————————
export function w3(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#8a3a32', { boil: 0 });
  for (let r = 0; r < 24; r++) for (let c = 0; c < 16; c++) stroke(rr(-800 + c * 180 + (r % 2) * 90, -200 + r * 60, 170, 52, 4), 3, { line: '#74302a' });
  ground('#5a3a28'); for (let x = -800; x < 2000; x += 160) stroke([[x, FLOOR - 40], [x - 80, 2400]], 4, { line: '#4a2e20' });
  // shelves with jars and batteries
  for (const y of [700, 900]) { shape(rect(-300, y, 1800, 20), { fill: '#c9a46a', lw: 5 }); for (let i = 0; i < 12; i++) { const x = -260 + i * 150; shape(rr(x, y - 90, 60, 90, 10), { fill: i % 3 ? 'rgba(200,230,240,.8)' : '#e9d7a8', lw: 4 }); } }
  // the bench, wires, a jar battery and the bulb on its stand (the insert)
  shape(rr(780, 1170, 400, 30, 6), { fill: '#b8874f', lw: 6 }); for (const lx of [800, 1150]) shape(rect(lx, 1198, 18, 150), { fill: '#8f6436', lw: 5 });
  for (const bx of [820, 870]) { shape(rr(bx, 1090, 44, 80, 8), { fill: 'rgba(200,230,240,.85)', lw: 5 }); stroke([[bx + 10, 1090], [bx + 10, 1060]], 4); stroke([[bx + 32, 1090], [bx + 32, 1060]], 4, { line: '#c22f3a' }); }
  stroke(spline([[886, 1060], [920, 1030], [960, 1080], [950, 1110]], false), 4, { line: '#c22f3a' });
  const on = ((t * .7) % 1) > .25 ? 1 : .4;   // it glows, wavers
  shape(rect(940, 1150, 40, 20), { fill: '#c9a46a', lw: 4 }); bulb(960, 1150, .7, { on: on * .8, t, kind: 'carbon' });
  // a bearded scientist looking at it (an anonymous figure of the time)
  bgPerson(1120, FLOOR - 10, .8, t, { coat: '#2a2430', skin: '#f2c9a0', hair: '#8a8a8a', face: -1 }); shape(spline([[1090, FLOOR - 228], [1120, FLOOR - 214], [1140, FLOOR - 180], [1110, FLOOR - 170]]), { fill: '#9a9a9a', lw: 4 });
}
// ———————————————————— w4: USA 1879, Edison's workshop (violet, gold, oak) ————————————————————
export function w4(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#5a3a8a', { boil: 0 });
  for (let x = -800; x < 2000; x += 140) stroke([[x, -1200], [x, FLOOR - 40]], 4, { line: '#4a2e74' });
  ground('#8a6a3a'); for (let k = 0; k < 4; k++) stroke([[X0, FLOOR + 40 + k * 80], [X1, FLOOR + 40 + k * 80]], 4, { line: '#6e542e' });
  shape(rr(-200, 420, 380, 220, 8), { fill: '#f1e3c2', lw: 6 }); text('NEW YORK', -10, 480, { font: '400 40px Bungee', fill: '#5a3a8a' }); text('1882', -10, 560, { font: '400 64px Bungee', fill: '#e9b949', outlineW: 8 });   // a poster
  // a long bench covered with test bulbs, half of them dead
  shape(rr(560, 1150, 760, 30, 6), { fill: '#b8874f', lw: 6 }); for (const lx of [580, 1290]) shape(rect(lx, 1178, 18, 170), { fill: '#8f6436', lw: 5 });
  for (let i = 0; i < 7; i++) bulb(600 + i * 100, 1150, .45, { on: i === 4 ? 1 : 0, t, kind: i === 4 ? 'carbon' : 'blown' });
  // jars of materials to test (the insert): bamboo wins
  for (const [i, l] of ['COTON', 'PAPIER', 'LIN', 'BAMBOU'].entries()) { const x = 830 + i * 90; shape(rr(x, 920, 76, 110, 10), { fill: 'rgba(220,235,240,.85)', lw: 5 }); shape(rr(x + 6, 1036, 64, 30, 4), { fill: '#f1e3c2', lw: 3 }); text(l, x + 38, 1052, { font: '800 18px "Baloo 2"', fill: '#2a2430' }); }
  for (let k = 0; k < 3; k++) stroke([[1110 + k * 14, 1020], [1104 + k * 14, 940]], 6, { line: '#c9b25a' });
  // a dynamo and two of the team
  shape(ell(1180, 1290, 80, 60, 20), { fill: '#3a3340', lw: 6 }); shape(ell(1180, 1290, 30, 30, 14), { fill: '#e9b949', lw: 5 }); stroke([[1180, 1290], [1180 + Math.cos(t * 9) * 26, 1290 + Math.sin(t * 9) * 26]], 4);
  bgPerson(1000, FLOOR - 230, .5, t, { coat: '#f1e3c2', skin: '#e7b48c', face: -1 }); bgPerson(760, FLOOR - 230, .5, t, { coat: '#3a3340', skin: '#f2c9a0', hat: 'cap' });
}
// ———————————————————— w5: early 20th century, the tungsten filament (burnt orange, charcoal) ————————————————————
export function w5(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#3a3340', { boil: 0 });
  for (let i = 0; i < 5; i++) shape(rr(-300 + i * 360, 300, 260, 340, 8), { fill: '#e8742a', lw: 6, shade: () => { for (let k = 0; k < 3; k++) stroke([[-300 + i * 360, 410 + k * 110], [-40 + i * 360, 410 + k * 110]], 4, { line: '#c75a1c' }); } });   // factory windows
  ground('#2a2430'); for (let x = -800; x < 2000; x += 140) stroke([[x, FLOOR - 40], [x + 60, 2400]], 4, { line: '#4a4250' });
  shape(rr(-200, 1000, 1500, 30, 6), { fill: '#6e6878', lw: 6 }); for (let i = 0; i < 9; i++) { const x = -150 + ((i * 170 + t * 60) % 1530); bulb(x, 1000, .4, { on: 0, t, kind: 'tungsten' }); }   // a conveyor of bulbs
  shape(rr(760, 720, 300, 80, 10), { fill: '#e9b949', lw: 6 }); text('W · TUNGSTÈNE', 910, 762, { font: '400 34px Bungee', fill: '#3a3340' });
  // the insert: a big bulb, coiled filament glowing hot, gas inside, heat waves
  shape(rect(920, 1160, 80, 180), { fill: '#6e6878', lw: 6 }); bulb(960, 1170, 1.0, { on: 1, t, kind: 'tungsten' });
  for (let k = 0; k < 3; k++) { const u = (t * .8 + k / 3) % 1; stroke(spline([[900 + k * 60, 990 - u * 140], [912 + k * 60, 970 - u * 140], [896 + k * 60, 950 - u * 140], [910 + k * 60, 930 - u * 140]], false), 4, { line: `rgba(255,160,90,${.6 * (1 - u)})` }); }
  text('GAZ', 1060, 1040, { font: '800 30px "Baloo 2"', fill: '#e9b949' });
}
// ———————————————————— w6: USA 1962, the first visible LED (lab white, signal red, cool grey) ————————————————————
export function w6(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#e9ecef', { boil: 0 });
  for (let y = 300; y < 1300; y += 200) stroke([[X0, y], [X1, y]], 3, { line: '#d3d8de' });
  ground('#9aa3ae'); for (let x = -800; x < 2000; x += 160) stroke([[x, FLOOR - 40], [x, 2400]], 3, { line: '#8a929c' });
  // an oscilloscope, a bench, a circuit board with the red LED (the insert)
  shape(rr(-160, 820, 320, 240, 14), { fill: '#6e7682', lw: 6 }); shape(rr(-130, 850, 200, 150, 10), { fill: '#1d3a2a', lw: 5, shade: () => { const P = []; for (let i = 0; i <= 40; i++) P.push([-130 + i * 5, 925 + Math.sin(i * .5 + t * 6) * 30]); stroke(P, 4, { line: '#7aff9a' }); } });
  shape(rr(780, 1180, 420, 30, 6), { fill: '#c9ced6', lw: 6 }); for (const lx of [800, 1170]) shape(rect(lx, 1208, 18, 140), { fill: '#8a929c', lw: 5 });
  shape(rr(860, 1120, 220, 60, 8), { fill: '#2f8a5a', lw: 5 }); for (let i = 0; i < 6; i++) stroke([[870 + i * 36, 1130], [890 + i * 36, 1170]], 3, { line: '#e9b949' });
  push(); translate(960, 1120); for (const dx of [-8, 8]) stroke([[dx, 0], [dx, 30]], 4, { line: '#c9c9c9' });
  glowRing(0, -12, 30, 'rgba(255,60,60,A)', .4 * flick(t, 2)); shape(spline([[-14, 0], [-14, -16], [-8, -26], [8, -26], [14, -16], [14, 0]]), { fill: '#ff3b3b', lw: 4 }); pop();
  text('LED', 1100, 1080, { font: '400 40px Bungee', fill: '#e8452f', outlineW: 6 });
  bgPerson(1200, FLOOR - 40, .7, t, { coat: '#f4f7fb', skin: '#e7b48c', hair: '#3a2416', face: -1 });
}
// ———————————————————— w7: today — LED bulbs, and the old bulb that has been on since 1901 (mint, coral) ————————————————————
export function w7(t) {
  fillOnly(rect(X0, -1200, X1 - X0, 2700), '#bff0dc', { boil: 0 });
  ground('#ff9d8f'); for (let x = -800; x < 2000; x += 120) stroke([[x, FLOOR - 40], [x - 60, 2400]], 4, { line: '#ef8274' });
  // a row of LED bulbs on display, with an energy label
  for (let i = 0; i < 6; i++) { stroke([[-200 + i * 160, 0], [-200 + i * 160, 260]], 4); bulb(-200 + i * 160, 340, .55, { on: 1, t: t + i, kind: 'led' }); }
  shape(rr(-240, 620, 300, 260, 12), { fill: '#fff', lw: 6 }); ['#2fbf6a', '#8be04a', '#ffd21f', '#ff9a3c', '#e8452f'].forEach((c, i) => shape([[-210, 650 + i * 44], [-80 + i * 22, 650 + i * 44], [-60 + i * 22, 670 + i * 44], [-80 + i * 22, 690 + i * 44], [-210, 690 + i * 44]], { fill: c, lw: 3 })); text('A', 30, 680, { font: '400 60px Bungee', fill: '#2fbf6a' });
  // the fire station on the right: red doors, a plaque, the old bulb glowing faintly (the insert)
  shape(rect(760, 640, 560, 700), { fill: '#e8452f', lw: 7 }); shape(rr(800, 900, 220, 440, 10), { fill: '#c22f3a', lw: 6 }); shape(rr(1060, 900, 220, 440, 10), { fill: '#c22f3a', lw: 6 });
  shape(rr(820, 680, 300, 70, 8), { fill: '#fff6e0', lw: 5 }); text('CASERNE', 970, 716, { font: '400 40px Bungee', fill: '#c22f3a' });
  stroke([[960, 760], [960, 830]], 4); bulb(960, 880, .45, { on: .6, t, kind: 'old' });
  shape(rr(880, 1000, 160, 70, 8), { fill: '#e9b949', lw: 5 }); text('DEPUIS 1901', 960, 1036, { font: '800 26px "Baloo 2"', fill: '#2a2430' });
}
