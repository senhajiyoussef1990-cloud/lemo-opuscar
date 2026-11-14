// chars.js — the cast of « Le Livre de Papy », sitcom edition: Papy (deadpan inventor grandfather) and Malik (nervous grandson)
// Local coordinates: origin at the feet, y down; face = 1 looks toward +x (3/4 view), −1 mirrors.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const PAL = {
  skinP: '#e7b48c', skinPs: '#c98f66', tunic: '#f3e6cc', tunicS: '#d9c6a2', vest: '#7a4a2c', vestS: '#5b341d', kufi: '#f6ecd6', kufiS: '#dccdb0',
  beard: '#ffffff', beardS: '#d9dde6', sandal: '#8a5a34', gogF: '#2f8f83', gogL: '#ffd23f',
  skinM: '#b9794f', skinMs: '#94592f', hair: '#3b2416', hairS: '#24140b', hood: '#3157d6', hoodS: '#2140a6', jeans: '#2c3550', jeansS: '#1d2338', sneak: '#ffffff', sneakS: '#d8d8e0', sole: '#e8452f',
  coat: '#f8f7f2', coatS: '#d5d8e0', shirt: '#e9b949', shirtS: '#c9962a', pants: '#5b3d7a', pantsS: '#432a5c', boot: '#3a2f45',
  pack: '#d08a45', packS: '#a86a2f', strap: '#7a4a24', dino: '#5cbf4a', dinoS: '#3f9634', car1: '#e8452f', car2: '#ffcf3a', car3: '#3fb6e8',
  mouthIn: '#4a1a2a', tongue: '#e8637a', white: '#ffffff', book: '#7b2f6b', bookS: '#5a1f4e', page: '#fff6e0', gold: '#e9b949',
};

// —— face parts (big white eyes + tiny pupils; parametric mouths) ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.skinP, closed = false, lw = 6, jitter = 0, lower = 0 } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 36), {
    fill: PAL.white, lw, shade: () => {
      dot(cx + look[0] * rx * .55 + jitter, cy + look[1] * ry * .5, pupil);
      if (lid > 0) {
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 });
        stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw);
      }
      if (lower > 0) { const yb = cy + ry - lower * 2 * ry; fillOnly([[cx - rx * 1.3, yb], [cx + rx * 1.3, yb], [cx + rx * 1.3, cy + ry * 1.4], [cx - rx * 1.3, cy + ry * 1.4]], skin, { boil: .5 }); stroke([[cx - rx * 1.2, yb], [cx + rx * 1.2, yb]], lw * .8); }
    }
  });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6, teeth = true, tongue = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  const P = [...quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), ...quad(rc, [cx, cy + h + sm * k * .6], lc, 14)];
  shape(P, {
    fill: PAL.mouthIn, lw, shade: () => {
      if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + 6), PAL.white, { boil: .3 });
      if (tongue) fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), PAL.tongue, { boil: .3 });
    }
  });
}
export function hand(x, y, ang, r = 21, col = PAL.skinP, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw });
  stroke([[r * .2, -r * .15], [r * .75, -r * .45]], lw * .6);
  pop();
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— props ——
// The Book of Papy: closed (open=0) to open flat (open=1); glow is drawn by the portal itself
export function book(x, y, a = 0, { open = 0, s = 1 } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  if (open < .5) {
    const k = 1 - open * 1.2;
    shape(rr(-70, -48, 140, 96, 10), { fill: PAL.book, lw: 7, shade: () => { fillOnly(rect(-70, 26, 140, 30), PAL.bookS, { boil: .3 }); fillOnly(rect(-70, -48, 20, 96), PAL.bookS, { boil: .3 }); } });
    shape(rr(-34, -26, 82 * Math.max(.3, k), 36, 6), { fill: PAL.gold, lw: 5 });
    stroke([[-24, -8], [36 * Math.max(.3, k), -8]], 4, { line: PAL.bookS });
  } else {
    shape([[-150, -30], [0, -16], [0, 34], [-150, 20]], { fill: PAL.page, lw: 7 });
    shape([[150, -30], [0, -16], [0, 34], [150, 20]], { fill: PAL.page, lw: 7 });
    shape([[-156, 20], [0, 34], [156, 20], [156, 34], [0, 46], [-156, 34]], { fill: PAL.book, lw: 6 });
    for (let i = 0; i < 4; i++) { stroke([[-130, -16 + i * 10], [-20, -6 + i * 10]], 3, { line: '#c9b98f' }); stroke([[20, -6 + i * 10], [130, -16 + i * 10]], 3, { line: '#c9b98f' }); }
  }
  pop();
}
// Toy dinosaur (green, round, one tooth)
export function dino(x, y, s = 1, { a = 0, sick = 0, look = [0, 0] } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  const col = sick ? '#9ccf5a' : PAL.dino;
  shape(spline([[-60, 0], [-90, -22], [-120, -30], [-70, -42], [-30, -60], [20, -58], [44, -40], [40, 0]]), { fill: col, lw: 6, shade: () => fillOnly(ell(0, -10, 50, 18, 20), PAL.dinoS, { boil: .3 }) });
  shape(spline([[20, -50], [36, -100], [60, -128], [104, -126], [118, -102], [90, -86], [56, -78], [44, -40]]), { fill: col, lw: 6 });
  for (const [px, py] of [[-50, -50], [-20, -64], [10, -66]]) shape([[px - 10, py + 6], [px, py - 14], [px + 10, py + 6]], { fill: '#ffcf3a', lw: 4 });
  shape(ell(84, -110, 13, 14, 16), { fill: PAL.white, lw: 4, shade: () => dot(88 + look[0] * 5, -110 + look[1] * 5, 4) });
  stroke(quad([96, -94], [106, -92 + sick * 8], [116, -98], 6), 4);
  for (const lx of [-30, 20]) shape(rr(lx - 10, -8, 22, 26, 6), { fill: col, lw: 5 });
  pop();
}
export function toyCar(x, y, s = 1, col = PAL.car1, a = 0) {
  push(); translate(x, y); rotate(a); scale(s);
  shape(spline([[-40, 0], [-42, -18], [-18, -22], [-8, -40], [22, -40], [34, -22], [44, -18], [44, 0]]), { fill: col, lw: 5 });
  shape(rr(-4, -36, 22, 14, 4), { fill: '#bfe9ff', lw: 4 });
  for (const wx of [-24, 26]) shape(ell(wx, 2, 11, 11, 14), { fill: '#2a2430', lw: 4 });
  pop();
}
// Malik's backpack (seen from behind / from the side), dino and a car poking out
export function backpack(x, y, s = 1, { a = 0, dinoOut = 1, cars = 1, open = 0 } = {}) {
  push(); translate(x, y); rotate(a); scale(s);
  if (dinoOut > 0) dino(10, -150 + (1 - dinoOut) * 60, .55, { a: -.25 });
  if (cars) { toyCar(-46, -150, .5, PAL.car2, .4); toyCar(48, -146, .45, PAL.car3, -.5); }
  shape(spline([[-70, -150], [70, -150], [84, -60], [76, 0], [-76, 0], [-84, -60]]), { fill: PAL.pack, lw: 7, shade: () => { fillOnly(rect(30, -170, 80, 190), PAL.packS, { boil: .3 }); } });
  shape(rr(-50, -70, 100, 56, 14), { fill: PAL.pack, lw: 6 });
  stroke([[-50, -50], [50, -50]], 4, { line: PAL.packS });
  shape(spline([[-74, -150], [0, -176 - open * 20], [74, -150], [0, -136]]), { fill: PAL.packS, lw: 6 });
  pop();
}

// ———————————————————— Papy ————————————————————
// P: {x,y,s,face,lean,bob,sq, lid,look,brow,mouth:{o,w,sm},blink,closed, armF:{h,bend}, armB, holdF:'book'|'dino'|null, bookOpen, legs, headTilt, sweat}
export function papy(P) {
  const f = P.face ?? 1;
  push(); translate(P.x, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  const legs = P.legs || [[0, 0], [0, 0]];
  // plum trousers + dark ankle boots
  for (const [sx, lg] of [[-1, legs[0]], [1, legs[1]]]) {
    const ax = sx * 34 + lg[0], ay = -10 + lg[1];
    shape(noodle([sx * 30 + lg[0] * .4, -230], [ax, ay - 16], 0, 44, 38), { fill: PAL.pants, lw: 7, shade: () => fillOnly(rect(sx > 0 ? 10 : -60, -240, 18, 240), PAL.pantsS, { boil: .3 }) });
    shape(spline([[ax - 34, ay + 12], [ax - 28, ay - 22], [ax + 18, ay - 24], [ax + 50, ay + 4], [ax + 46, ay + 14]]), { fill: PAL.boot, lw: 6, shade: () => fillOnly(rect(ax - 40, ay + 6, 100, 12), '#1f1a24', { boil: .3 }) });
  }
  push(); rotate(P.lean ?? .03);
  const shB = [-66, -455], shF = [62, -452];
  const armB = P.armB || { h: [-16, 186], bend: 14 }, armF = P.armF || { h: [10, 188], bend: -8 };
  const drawArm = (sh, arm, hold) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]], ang = Math.atan2(hp[1] - sh[1], hp[0] - sh[0]);
    shape(noodle(sh, hp, arm.bend ?? 0, 46, 40), { fill: PAL.coat, lw: 7, shade: () => fillOnly(ell(sh[0] + 30, sh[1] + 40, 30, 200, 16), PAL.coatS, { boil: .3 }) });
    shape(ell(hp[0] - Math.cos(ang) * 6, hp[1] - Math.sin(ang) * 6, 21, 21, 18), { fill: PAL.shirt, lw: 6 });
    if (hold === 'book') { book(hp[0] + 40, hp[1] - 30, -.15 - (P.lean ?? 0), { open: P.bookOpen ?? 0, s: .8 }); }
    if (hold === 'dino') { dino(hp[0] - 30, hp[1] + 10, .6, { a: -.1, look: [1, 0] }); }
    hand(hp[0], hp[1], ang, 22, PAL.skinP, { fist: !!hold });
  };
  // mustard roll-neck jumper under the coat
  shape(spline([[-40, -490], [40, -490], [64, -330], [56, -210], [-56, -210], [-64, -330]]), { fill: PAL.shirt, lw: 7, shade: () => { fillOnly(rect(20, -500, 60, 300), PAL.shirtS, { boil: .3 }); for (let k = 0; k < 6; k++) stroke([[-50, -440 + k * 36], [50, -440 + k * 36]], 3, { line: PAL.shirtS }); } });
  // mint-green lab coat to the knees, open at the front, patched pockets full of pencils
  shape(spline([[-34, -492], [-96, -462], [-114, -300], [-132, -170], [-40, -160], [-20, -300], [-16, -460]]), { fill: PAL.coat, lw: 7, shade: () => fillOnly(rect(-150, -500, 46, 360), PAL.coatS, { boil: .3 }) });
  shape(spline([[34, -492], [96, -462], [114, -300], [132, -170], [40, -160], [22, -300], [18, -460]]), { fill: PAL.coat, lw: 7, shade: () => fillOnly(rect(70, -500, 80, 360), PAL.coatS, { boil: .3 }) });
  stroke([[-30, -488], [-50, -420], [-22, -380]], 5); stroke([[30, -488], [50, -420], [22, -380]], 5);   // lapels
  for (const [px, py] of [[-104, -280], [52, -280]]) { shape(rr(px, py, 52, 50, 6), { fill: PAL.coatS, lw: 5 }); }
  [['#e8452f', -98], ['#3f5bd6', -86], ['#ffcf3a', -74], ['#2fbf9b', 60], ['#e8452f', 74]].forEach(([c, x]) => shape(rr(x, -306, 9, 30, 3), { fill: c, lw: 4 }));
  shape(rr(-90, -400, 46, 18, 4), { fill: '#ff7a6b', lw: 4 });   // a patch
  // neck + head
  shape(noodle([0, -486], [6, -520], 0, 40, 40), { fill: PAL.skinP, lw: 6 });
  drawArm(shB, armB, P.holdB);
  push(); translate(10, -616); rotate(P.headTilt ?? .04); headPapy(P); pop();
  drawArm(shF, armF, P.holdF);   // his right arm: in front of the body, close against it
  pop();
  if (P.sweat != null) sweat(140, -700 + (P.sweat % 1) * 20, 1.1);
  pop();
}
function headPapy(P) {
  shape(ell(-78, 4, 18, 26, 18), { fill: PAL.skinP, lw: 6, shade: () => fillOnly(ell(-74, 6, 7, 13, 12), PAL.skinPs, { boil: .3 }) });   // ear
  shape(spline([[0, -138], [62, -126], [94, -76], [98, 10], [82, 78], [10, 104], [-60, 84], [-92, 30], [-98, -50], [-72, -114]]), { fill: PAL.skinP, lw: 7, shade: () => fillOnly(spline([[-110, -40], [-70, -130], [-120, -130]]), PAL.skinPs, { boil: .3 }) });
  // bald top: a shine, and a soft white fringe of hair around the back of the head
  fillOnly(ell(26, -114, 28, 10, 14), '#f6d2b4', { boil: .3 }); fillOnly(ell(62, -104, 8, 5, 8), '#f6d2b4', { boil: .3 });
  shape(spline([[-62, -92], [-86, -100], [-108, -72], [-114, -36], [-102, -4], [-110, 26], [-92, 34], [-78, 10], [-82, -30], [-68, -62]]), { fill: PAL.beard, lw: 6, shade: () => fillOnly(ell(-102, 0, 14, 30, 12), PAL.beardS, { boil: .3 }) });
  // eyes (heavy lids = deadpan)
  const lid = P.blink ? 1 : clamp(P.lid ?? .48, 0, 1), look = P.look || [0, 0];
  eye(6, -16, 30, 33, { lid: P.closed ? 0 : lid, look, closed: P.closed, pupil: 4.5, lower: P.lower ?? .14 });
  eye(56, -18, 24, 29, { lid: P.closed ? 0 : lid, look, closed: P.closed, pupil: 4, lower: P.lower ?? .14 });
  for (const [cx, r] of [[-30, 20], [84, 16]]) fillOnly(ell(cx, 40, r, r * .7, 14), 'rgba(240,120,110,.35)', { boil: .3 });   // rosy cheeks
  for (const [ex, rx] of [[6, 24], [56, 19]]) stroke(arc(ex, 20, rx, 8, Math.PI * .15, Math.PI * .85, 10), 4);
  // bushy white brows
  const br = P.brow ?? 0;
  for (const [bx, bw] of [[4, 38], [58, 30]]) shape(spline([[bx - bw, -46 - br * 3], [bx - bw * .4, -64 - br * 8], [bx + bw * .4, -66 - br * 8], [bx + bw, -48 - br * 3], [bx + bw * .3, -54 - br * 6], [bx - bw * .3, -54 - br * 6]]), { fill: PAL.beard, lw: 5 });   // soft arched brows
  // nose
  shape(spline([[30, -14], [44, 14], [70, 30], [62, 48], [36, 44], [26, 30]]), { fill: PAL.skinP, lw: 6, shade: () => fillOnly(ell(58, 42, 14, 8, 12), PAL.skinPs, { boil: .3 }) });
  // clean-shaven chin with a little shadow (the bushy white moustache stays: it is his)
  stroke(arc(30, 96, 30, 10, Math.PI * .2, Math.PI * .8, 10), 4, { line: PAL.skinPs });
  const m = P.mouth || {};
  mouth(36, 90, 60, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.2, lw: 6 });
  shape(spline([[-6, 58], [30, 50], [60, 54], [90, 66], [72, 76], [36, 66], [4, 72]]), { fill: PAL.beard, lw: 6 });   // moustache over the mouth
}

// ———————————————————— Malik ————————————————————
// P: {x,y,s,face,lean,bob,sq,t,nerv, look,lid,brow,mouth,blink, armF, armB, legs, pack:'back'|'arms'|null, packP:{dinoOut}, holdF:'dino', eyeS, pupil, sweat}
export function malik(P) {
  const f = P.face ?? 1, ner = P.nerv ?? 0;
  const jit = ner ? (hash(Math.floor((P.t || 0) * 12) * 3.3) - .5) * 7 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  const legs = P.legs || [[0, 0], [0, 0]];
  if (P.pack === 'back') { push(); rotate(P.lean ?? 0); backpack(-74, -126, .86, { ...(P.packP || {}) }); pop(); }
  for (const [sx, lg] of [[-1, legs[0]], [1, legs[1]]]) {
    const hip = [sx * 24, -120], ank = [sx * 28 + lg[0], -20 + lg[1]];
    shape(noodle(hip, ank, 0, 36, 32), { fill: PAL.jeans, lw: 6, shade: () => fillOnly(rect(sx > 0 ? 0 : -60, -130, 16, 120), PAL.jeansS, { boil: .3 }) });
    shape(spline([[ank[0] - 26, ank[1] + 20], [ank[0] - 22, ank[1] - 6], [ank[0] + 12, ank[1] - 8], [ank[0] + 44, ank[1] + 8], [ank[0] + 42, ank[1] + 22]]), { fill: PAL.sneak, lw: 6, shade: () => fillOnly(rect(ank[0] - 40, ank[1] + 14, 100, 20), PAL.sole, { boil: .3 }) });
  }
  push(); rotate(P.lean ?? 0);
  const shB = [-60, -250], shF = [58, -250];
  const armB = P.armB || { h: [-10, 102], bend: 10 }, armF = P.armF || { h: [26, 102], bend: 18 };
  const drawArm = (sh, arm, hold) => {
    const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]];
    shape(noodle(sh, hp, arm.bend ?? 0, 36, 32), { fill: PAL.hood, lw: 6 });
    if (hold === 'dino') dino(hp[0] + 10, hp[1] + 26, .55, { a: -.15, sick: P.dinoSick || 0, look: [-1, 0] });
    hand(hp[0], hp[1], Math.atan2(hp[1] - sh[1], hp[0] - sh[0]), 16, PAL.skinM, { fist: arm.fist });
  };
  const fBehind = !P.holdF && !P.armF;
  if (fBehind) drawArm(shF, armF);
  // oversized royal-blue hoodie
  shape(spline([[0, -282], [62, -262], [86, -190], [84, -112], [0, -100], [-84, -112], [-86, -190], [-62, -262]]), {
    fill: PAL.hood, lw: 7, shade: () => { fillOnly(spline([[24, -290], [96, -260], [110, -110], [40, -96], [70, -190]]), PAL.hoodS, { boil: .4 }); fillOnly(rect(-90, -124, 180, 14), PAL.hoodS, { boil: .3 }); }
  });
  shape(spline([[-48, -170], [48, -170], [56, -124], [-56, -124]]), { fill: PAL.hood, lw: 5 });   // kangaroo pocket
  stroke([[-14, -270], [-18, -222]], 4); stroke([[14, -270], [18, -222]], 4);          // drawstrings
  if (P.pack === 'back') { stroke([[-40, -266], [-46, -150]], 9, { line: PAL.strap }); stroke([[44, -266], [50, -150]], 9, { line: PAL.strap }); }
  push(); translate(0, -360); rotate(P.headTilt ?? 0); headMalik(P, ner); pop();
  drawArm(shB, armB);
  if (P.pack === 'arms') backpack(28, -110, .8, { ...(P.packP || {}) });
  if (!fBehind) drawArm(shF, armF, P.holdF);
  pop();
  if (P.sweat != null) { const u = P.sweat % 1; sweat(-84, -470 + u * 40, 1); sweat(92, -450 + ((u + .5) % 1) * 40, .8); }
  pop();
}
function headMalik(P, ner) {
  for (const sx of [-1, 1]) shape(ell(sx * 92, 12, 16, 22, 16), { fill: PAL.skinM, lw: 6 });
  shape(ell(0, 6, 96, 94, 60), { fill: PAL.skinM, lw: 7, shade: () => fillOnly(ell(52, 40, 60, 70, 30), PAL.skinMs, { boil: .3 }) });
  // curly hair: a cloud of round bumps on top
  const bumps = [];
  for (let i = 0; i <= 11; i++) { const a = Math.PI * (1.04 + i / 11 * .92), r = 104 + (i % 2) * 14; bumps.push([Math.cos(a) * r, -16 + Math.sin(a) * r * .92]); }
  const hair = [[-98, 8], ...bumps.map(([x, y], i) => [x * (1 + .06 * Math.sin(i * 2.1)), y]), [98, 8], [70, -36], [20, -46], [-30, -42], [-76, -30]];
  shape(spline(hair), { fill: PAL.hair, lw: 7, shade: () => fillOnly(ell(48, -78, 52, 40, 20), PAL.hairS, { boil: .3 }) });
  for (let i = 0; i < 6; i++) { const x = -60 + i * 24, y = -90 + (i % 2) * 18; stroke(arc(x, y, 9, 8, Math.PI * .2, Math.PI * 1.5, 8), 3.5, { line: '#6a4630' }); }
  // worried brows
  const br = P.brow ?? 1;
  stroke([[-66, -32 + br * 2], [-24, -40 - br * 8]], 7); stroke([[66, -32 + br * 2], [24, -40 - br * 8]], 7);
  // big round eyes, trembling pupils
  const look = P.look || [0, 0], shake = ner ? (hash(Math.floor((P.t || 0) * 24) * 1.7) - .5) * 3 * ner : 0, es = P.eyeS ?? 1;
  for (const ex of [-36, 38]) eye(ex, 10, 32 * es, 34 * es, { lid: P.blink ? 1 : (P.lid ?? 0), look, pupil: P.pupil ?? 4, skin: PAL.skinM, jitter: shake, lw: 6 });
  shape(ell(4, 50, 12, 9, 12), { fill: PAL.skinMs, lw: 5 });
  const m = P.mouth || {};
  mouth(2, 76, 46 * (P.mouthS ?? 1), { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.3, lw: 5 });
}
