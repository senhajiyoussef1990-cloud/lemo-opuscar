// Le Livre de Papy — « L'histoire du sac à dos », sitcom edition (Sci-Fi Sitcom Toon), vertical 1080 × 1920
import { clamp, lerp, seg, ss, eo, ei, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, screenRect, reset } from './toon.js';
import { papy, malik, PAL, book, dino, backpack } from './chars.js';
import * as Wd from './worlds.js';
import { q, LINE, vdur, VO, SHOTS, shotAt, WIPES, TAGS, CUES, DUR, B, worldSpan } from './story.js';

init(document.getElementById('c'));
const LIPS = await (async () => { try { const r = await fetch('voices/lips.json'); if (r.ok) return await r.json(); } catch (e) { } return {}; })();
const FLOOR = Wd.FLOOR, MX = 330, PX = 730, PORT = [540, 880];

// —— lip sync (stepped at 12 fps) ——
function talk(who, t) {
  const tq = q(t);
  for (const [id, t0] of Object.entries(VO)) {
    if (LINE[id].who !== who) continue;
    if (tq >= t0 && tq < t0 + vdur(id)) { const k = Math.floor((tq - t0) * 24), lp = LIPS[id]; const o = lp ? (lp.o[k] ?? 0) : .4, b = lp ? (lp.b[k] ?? .5) : .5; return { o, w: .8 + .45 * b - .2 * o, talking: true, id }; }
  }
  return { o: 0, w: 1, talking: false };
}
const speaking = t => { const m = talk('PAPY', t); if (m.talking) return 'PAPY'; return talk('MALIK', t).talking ? 'MALIK' : null; };
const popOpen = x => x <= 0 ? 0 : back(clamp(x / .32), 1.7);
function cam(cx, cy, z, shake = 0, t = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); translate(-cx, -cy);
}
const legsWalk = (tq, on, amp = 22) => on ? [[Math.sin(tq * 14) * amp, -Math.max(0, Math.cos(tq * 14)) * 14], [-Math.sin(tq * 14) * amp, -Math.max(0, -Math.cos(tq * 14)) * 14]] : [[0, 0], [0, 0]];
const landSq = (t, tl) => { const u = t - tl; if (u < 0 || u > .5) return 1; return 1 - .22 * Math.exp(-u * 9) * Math.cos(u * 30); };
const blinkP = t => { const k = Math.floor(t * 12); return k % 47 === 0; };
const blinkM = t => { const k = Math.floor(t * 12); return k % 31 === 0 || k % 31 === 1 && hash(Math.floor(k / 31)) > .5; };

// —— the state of the story at time t (what Malik's bag holds, where the dino is) ——
function state(t) {
  const home2 = worldSpan('home2')[0], take = B('home2', 'SILENCE');
  const packed = t >= B('home', 'PACK')[0] + .45;
  const f3 = VO.f3, f3e = f3 + vdur('f3') + .3;
  const dinoHeldM = t >= f3 - .2 && t < f3e;
  const taken = t >= take[0] + take[1] * 0 + 1.4;
  return { pack: t < B('home', 'PACK')[0] + .45 ? 'arms' : 'back', dinoInPack: !dinoHeldM && !taken, dinoHeldM, taken, dinoTable: t >= VO.z1 + 1.2 };
}
// —— default poses ——
function P_(t, o = {}) {
  const m = talk('PAPY', t), tq = q(t), sp = speaking(t);
  return { x: PX, y: FLOOR, face: -1, lid: .36, brow: .2, look: sp === 'MALIK' ? [.6, .2] : [.2, .1], blink: blinkP(t), mouth: { o: m.o, w: m.w, sm: .55 }, sq: 1 + .008 * Math.sin(tq * 2.3), headTilt: .04 + (m.talking ? (m.o - .3) * .06 : 0), ...o };
}
function M_(t, o = {}) {
  const m = talk('MALIK', t), tq = q(t), sp = speaking(t), st = state(t);
  return { x: MX, y: FLOOR, face: 1, t, nerv: .3, look: sp === 'PAPY' ? [.6, -.4] : [.4, -.2], blink: blinkM(t), mouth: { o: m.o * 1.15, w: m.w, sm: -.3 }, pack: st.pack, packP: { dinoOut: st.dinoInPack ? 1 : 0, cars: 1 }, holdF: st.dinoHeldM ? 'dino' : null, dinoSick: 1,
    armF: st.dinoHeldM ? { h: [40, 60], bend: 20, fist: true } : (st.pack === 'arms' ? { h: [60, 70], bend: 30, fist: true } : undefined), armB: st.pack === 'arms' ? { h: [70, 60], bend: -30, fist: true } : undefined,
    sq: 1 + .012 * Math.sin(tq * 3.1), headTilt: m.talking ? (m.o - .3) * .1 : Math.sin(tq * 1.7) * .03, ...o };
}
// sucked into / spat out of the portal
function sucked(P, t, t0, t1) { const u = ei(seg(t, t0, t1)); if (u <= 0) return P; return { ...P, x: lerp(P.x, PORT[0], u), y: lerp(P.y, PORT[1] + 250, u), s: (P.s ?? 1) * (1 - u * .95), sq: 1 + u * .6, lean: (P.lean || 0) + u * .4 }; }
function spit(P, t, t0, tl, h = 180) {
  if (t < t0) return null;
  if (t < tl) { const u = seg(t, t0, tl), x = lerp(PORT[0], P.x, u), y = lerp(PORT[1] + 120, P.y, u) - Math.sin(u * Math.PI) * h; return { ...P, x, y, sq: 1.25 - u * .25, s: (P.s ?? 1) * lerp(.4, 1, eo(u * 2)), lean: (1 - u) * .5 * (P.face || 1), armF: { h: [60, -170], bend: 30 }, armB: { h: [-60, -170], bend: -30 } }; }
  return { ...P, sq: landSq(t, tl) };
}

// —— worlds ——
function world(w, t, o = {}) {
  if (w === 'home' || w === 'home2') Wd.home(t, { clockT: t, dinoOnTable: state(t).dinoTable ? 1 : 0, glow: o.glow || 0 });
  else Wd[w](t, o);
}
// insert targets per world: [cx, cy, zoom]
const INS = { w1: [980, 1180, 2.3], w2: [880, 1160, 2.5], w3: [1060, 1110, 1.7], w4: [1020, 1080, 2.2], w6: [892, 1170, 2.7], w7: [1030, 1060, 2.2] };

// —— draw both leads with the given poses (Papy is drawn behind when he stands further right) ——
function duo(t, p, m) { if (p) papy(p); if (m) malik(m); }

// ———————————————————— shots ————————————————————
function shotLine(t, s) {
  const [t0, t1, shot, w, id] = s, tq = q(t), u = seg(t, t0, t1);
  const glowHome = w === 'home' && t > B('home', 'BURST')[0];
  const portalOpenHome = glowHome && t < worldSpan('home')[1];
  const base = () => { world(w, t, { glow: glowHome ? 1 : 0 }); if (portalOpenHome) Wd.portal(PORT[0], PORT[1] - 120, 200, t); };
  let p = P_(t), m = M_(t);
  if (w === 'home' && portalOpenHome) { p.holdF = 'book'; p.bookOpen = 1; p.armF = { h: [-20, 150], bend: 20 }; m.nerv = .8; m.eyeS = 1.12; m.look = [.4, -.8]; }
  if (w === 'w5') { m.sweat = null; }
  if (id === 'h1') { const wk = seg(tq, t0, t0 + 1.3); m.x = lerp(-180, MX, ss(wk)); m.legs = legsWalk(tq, wk < 1); m.mouth.sm = .6; m.nerv = 0; }
  if (id === 'h2' || id === 'a3' || id === 'b4' || id === 'c3' || id === 'f3') m.nerv = .6;
  if (id === 'h6' || id === 'h8') { m.nerv = 1.1; m.pupil = 2.8; m.eyeS = 1.18; m.sweat = t * 1.3; }
  if (id === 'h7') { p.holdF = 'book'; const op = seg(tq, VO.h7 + vdur('h7') - .2, VO.h7 + vdur('h7') + .2); p.bookOpen = op; p.armF = { h: [lerp(26, -20, ss(seg(tq, t0, t0 + .5))), lerp(190, 150, ss(seg(tq, t0, t0 + .5)))], bend: 20 }; }
  if (id === 'a3') { m.look = [-1, -.2]; m.face = 1; }
  if (id === 'c3') { m.nerv = 1.3; m.lid = .1; m.mouth.sm = -.9; }
  if (id === 'd4') { p.lid = .45; m.mouth.sm = .4; m.brow = .2; }
  if (id === 'g3') { m.mouth.sm = .9; m.nerv = 0; m.brow = -.3; }
  if (id === 'b5') { p.lid = .66; m.nerv = .9; }
  if (id === 'z1') { const st = state(t); p.holdF = st.dinoTable ? null : 'dino'; p.armF = st.dinoTable ? undefined : { h: [-60, 120], bend: 20, fist: true }; }
  if (id === 'z2') { m.mouth.sm = -.8; m.look = [-.3, .6]; m.lid = .25; }
  if (id === 'z3') { p.lid = .4; p.mouth.sm = .3; }
  // camera
  if (shot === 'two') { cam(lerp(540, 545, u), lerp(1080, 1065, u), lerp(1.2, 1.25, u)); base(); duo(t, p, m); }
  else if (shot === 'wide') { cam(540, 1040, lerp(.95, 1.0, u)); base(); duo(t, p, m); }
  else if (shot === 'cuP') { const z = id === 'h5' ? lerp(2.0, 2.5, ss(u)) : id === 'b5' ? lerp(2.1, 2.35, u) : 2.05; cam(PX - 10, 850, z); base(); duo(t, p, m); }
  else if (shot === 'cuM') { const sh = id === 'h8' ? 10 * (1 - seg(t, t0 + .4, t0 + 1.2)) * (t > t0 + .3 ? 1 : 0) : 0; cam(MX + 20, 1100, 2.2, sh, t); base(); duo(t, p, m); }
  else if (shot === 'bag') { cam(370, 1260, 2.3); base(); duo(t, p, m); }
  else if (shot === 'ins') { const [cx, cy, z] = INS[w]; cam(cx, cy, z * lerp(1, 1.06, u)); base(); if (w === 'w7') Wd.modernPack(1030, 1140, 1.1); if (w === 'w6') Wd.squarePack(892, 1250, 1.2, '#ffd21f'); }
  else if (shot === 'end') endCard(t);
}
function shotBeat(t, s) {
  const [t0, t1, name, w] = s, tq = q(t), u = seg(t, t0, t1);
  let p = P_(t), m = M_(t);
  if (name === 'arrive') {
    cam(540, 990, 1.0); world(w, t);
    const op = t < t0 + .85 ? popOpen(t - t0) : 1 - ss(seg(t, t0 + .85, t0 + 1.15));
    Wd.portal(PORT[0], PORT[1], 230, t, { open: op });
    const pp = spit(p, t, t0 + .1, t0 + .5), mm = spit(m, t, t0 + .25, t0 + .7);
    if (pp) papy({ ...pp, lid: .5, look: [0, .5] }); if (mm) malik({ ...mm, nerv: 1, eyeS: 1.15, look: [.4, -.3] });
    return;
  }
  if (name === 'out' || name === 'burst') {
    const big = name === 'burst', sh = big ? 12 * (t > t0 + .3 ? 1 - seg(t, t0 + .3, t0 + .8) : 0) : 0;
    cam(540, 1000, 1.0, sh, t); world(w, t, { glow: big ? seg(t, t0 + .3, t0 + .5) : 0 });
    const up = ss(seg(tq, t0, t0 + .3));
    p.holdF = 'book'; p.bookOpen = big ? 1 : seg(tq, t0 + .1, t0 + .3); p.armF = { h: [lerp(26, -20, up), lerp(190, 150, up)], bend: 20 }; p.look = [.4, -.6];
    Wd.portal(PORT[0], PORT[1] - 120, big ? 200 : 180, t, { open: popOpen(t - t0 - .3) });
    m.nerv = 1.1; m.eyeS = 1.15; m.look = [.4, -.9]; m.sweat = t * 1.2;
    if (big) { const hop = seg(tq, t0 + .32, t0 + .7); m.y = FLOOR - Math.sin(hop * Math.PI) * 80; if (hop > 0 && hop < 1) { m.armF = { h: [50, -140], bend: 30 }; m.armB = { h: [-50, -140], bend: -30 }; } }
    duo(t, p, m); return;
  }
  if (name === 'rush') {
    const z = lerp(1.0, 7, ei(u)); cam(lerp(540, PORT[0], u), lerp(1000, PORT[1] - (w === 'home' ? 120 : 120), u), z); world(w, t, { glow: w === 'home' ? 1 : 0 });
    Wd.portal(PORT[0], PORT[1] - 120, 200, t);
    papy(sucked({ ...p, holdF: 'book', bookOpen: 1, armF: { h: [-20, 150], bend: 20 } }, t, t0, t0 + .25)); malik(sucked({ ...m, nerv: 1 }, t, t0 + .05, t0 + .3));
    return;
  }
  if (name === 'title') {
    cam(540, 1020, .92); world(w, t, { glow: 1 }); Wd.portal(PORT[0], PORT[1] - 120, 200, t);
    p.holdF = 'book'; p.bookOpen = 1; p.armF = { h: [-20, 150], bend: 20 }; p.look = [.6, .3]; m.nerv = 1.2; m.eyeS = 1.2; m.look = [.4, -.8]; m.sweat = t;
    duo(t, p, m); titleCard(t, t0, t1); return;
  }
  if (name === 'pack') {   // Malik swings his bag onto his back
    cam(470, 1060, 1.3); world(w, t, { glow: 1 }); Wd.portal(PORT[0], PORT[1] - 120, 200, t);
    p.holdF = 'book'; p.bookOpen = 1; p.armF = { h: [-20, 150], bend: 20 };
    const k = seg(tq, t0, t0 + .45);
    if (k < 1) { m.pack = null; malik({ ...m, armF: { h: [80, -60 + k * 40], bend: 30, fist: true }, armB: { h: [60, -80], bend: -30, fist: true }, lean: -.15 }); backpack(MX + 40 - k * 160, FLOOR - 480 + Math.sin(k * Math.PI) * -60, .8, { a: -k * 3, dinoOut: 1 }); }
    else malik({ ...m, sq: landSq(t, t0 + .45), mouth: { o: 0, sm: .5 } });
    papy(p); return;
  }
  if (name === 'stare') { cam(lerp(300, 260, u), lerp(1200, 1180, u), lerp(1.5, 1.6, u)); world(w, t); duo(t, { ...p, lid: .4, look: [1, .3] }, { ...m, look: [-1, .5], nerv: .5 }); return; }
  if (name === 'silence') {   // home again: a long silence, a very slow push; Papy takes the dino out of the bag
    cam(lerp(540, 520, u), lerp(1000, 1020, u), lerp(1.0, 1.12, u)); world(w, t);
    const reach = ss(seg(tq, t0 + .8, t0 + 1.3)) * (1 - ss(seg(tq, t0 + 1.5, t0 + 2.0)));
    p.lid = .5; p.look = [1, .4];
    if (tq >= t0 + 1.4) { p.holdF = 'dino'; p.armF = { h: [-60, 120], bend: 20, fist: true }; }
    else p.armF = { h: [lerp(26, 290, reach), lerp(190, 80, reach)], bend: 20, fist: reach > .9 };
    m.look = [.3, -.2]; m.nerv = .2;
    duo(t, p, m); return;
  }
  if (name === 'end') { endCard(t); return; }
}

// ———————————————————— screen layer ————————————————————
function wipe(t) {
  for (const [tc, hw] of WIPES) {
    const d = Math.abs(t - tc); if (d > hw) continue;
    const u = 1 - d / hw, R = 1500 * Math.pow(u, .6);
    reset(); Wd.portal(W / 2, H / 2, R, t, { open: 1, sx: 1, spin: 2.4 });
    if (d < .03) screenRect('#e6fdff', .7);
  }
}
function tag(t) {
  const s = shotAt(t), w = s[3], T = TAGS[w]; if (!T) return;
  const [a, b] = worldSpan(w), a1 = a + .9, b1 = b - 1.2; if (t < a1 || t >= b1) return;
  const [id, desc, bg, fg] = T, n = Math.floor((t - a1) * 40), s1 = id.slice(0, n), s2 = desc.slice(0, Math.max(0, n - id.length));
  reset(); push(); translate(48, 70); scale(back(seg(t, a1, a1 + .18), 2.2));
  g.font = '400 58px VT323'; const w1 = Math.max(g.measureText('▶ ' + id).width, g.measureText(desc).width * 44 / 58) + 60;
  shape(rr(0, 0, Math.max(380, w1), 124, 12), { fill: bg, lw: 7 });
  text('▶ ' + s1 + (n < id.length && Math.floor(t * 6) % 2 ? '█' : ''), 24, 40, { font: '400 58px VT323', fill: fg, align: 'left' });
  text(s2, 26, 92, { font: '400 44px VT323', fill: fg, align: 'left' });
  pop();
}
// subtitles: heavy rounded white type, thick black outline, the speaker pill above
const WHO_COL = { PAPY: '#7a4a2c', MALIK: '#3157d6' };
const CUTS = [...WIPES.map(w => w[0]), B('home2', 'SILENCE')[0], B('home2', 'END')[0]];
export const SUBS = Object.entries(VO).map(([id, t0]) => {
  const L = LINE[id], d = vdur(id); let t1 = t0 + Math.max(d + .35, 1.8);
  const s = shotAt(t0 + .01); t1 = Math.min(t1, Math.max(s[1] + .0, t0 + d + .2));
  const cut = CUTS.find(c => c > t0 + .1); if (cut && t1 > cut - .2) t1 = Math.max(cut - .25, t0 + d + .1);
  return { id, t0, t1, who: L.who, text: L.text };
});
function wrap(str, max = 920) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 56px "Baloo 2"';
  const out = []; let cur = '';
  for (const w of str.split(' ')) { const tr = cur ? cur + ' ' + w : w; if (g.measureText(tr).width > max && cur) { out.push(cur); cur = w; } else cur = tr; }
  if (cur) out.push(cur); return out;
}
function subs(t) {
  const s = SUBS.filter(x => t >= x.t0 && t < x.t1).slice(-1)[0]; if (!s) return;
  const lines = wrap(s.text), lh = 70, y0 = 1700 - (lines.length - 1) * lh;
  reset();
  push(); translate(W / 2, y0 - 82); scale(back(seg(t, s.t0, s.t0 + .12), 2));
  g.font = '800 30px "Baloo 2"'; const nw = g.measureText(s.who).width + 40;
  shape(rr(-nw / 2, -24, nw, 48, 16), { fill: WHO_COL[s.who], lw: 5 }); text(s.who, 0, 2, { font: '800 30px "Baloo 2"', fill: '#fff' });
  pop();
  lines.forEach((l, k) => text(l, W / 2, y0 + k * lh, { font: '800 56px "Baloo 2"', fill: '#fff', outlineW: 12 }));
}
function titleArt(t, k = 1) {
  // a 1950s atomic-age TV title: chunky cream block letters, hard violet offset, an orange orbit ring with a small backpack circling it
  const orb = t * 1.6, rx = 430 * k, ry = 90 * k;
  const ring = (a0, a1) => { const P = arc(0, 30 * k, rx, ry, a0, a1, 40); stroke(P, 20, { boil: .5 }); stroke(P, 9, { line: '#ff9a3c', boil: .5 }); };
  const bag = () => { push(); translate(Math.cos(orb) * rx, 30 * k + Math.sin(orb) * ry); rotate(orb); backpack(0, 30, .32, { dinoOut: 0, cars: 0 }); pop(); };
  rotate(-.04);
  push(); rotate(.1); ring(Math.PI, TAU); if (Math.sin(orb) < 0) bag(); pop();
  text('LE LIVRE', 10 * k, -70 * k + 10 * k, { font: `400 ${118 * k}px Bungee`, fill: '#8a3df0', outlineW: 20, outlineCol: INK });
  text('LE LIVRE', 0, -70 * k, { font: `400 ${118 * k}px Bungee`, fill: '#fff3d6', outlineW: 20, outlineCol: INK });
  text('DE PAPY', 10 * k, 60 * k + 10 * k, { font: `400 ${134 * k}px Bungee`, fill: '#8a3df0', outlineW: 20, outlineCol: INK });
  text('DE PAPY', 0, 60 * k, { font: `400 ${134 * k}px Bungee`, fill: '#fff3d6', outlineW: 20, outlineCol: INK });
  push(); rotate(.1); ring(0, Math.PI); if (Math.sin(orb) >= 0) bag(); pop();
  text('L’HISTOIRE DU SAC À DOS', 0, 190 * k, { font: `400 ${58 * k}px VT323`, fill: '#ffe066', outlineW: 10 });
}
function titleCard(t, a, b) {
  const uu = seg(q(t), a, a + .25), s = uu < 1 ? back(uu, 2.4) : 1, out = 1 - seg(t, b - .2, b);
  reset(); translate(540, 300); scale(s * out, s); titleArt(t);
}
function endCard(t) {
  const [a] = B('home2', 'END');
  cam(540, 1060, .9); world('home2', t);
  book(570, 1150, 0, { open: 0, s: 1.1 });
  fillOnly(ell(570, 1150, 200, 90, 30), `rgba(94,242,255,${.18 + .08 * Math.sin(t * 3)})`, { boil: .5 });
  const p = P_(t, { lid: .45, look: [0, 0], mouth: { ...talk('PAPY', t), sm: .3 }, face: -1 }), m = M_(t, { look: [0, 0], nerv: 0, mouth: { o: 0, sm: .8 }, armB: { h: [-40, -150], bend: -30 } });
  if (t > VO.o2 + 1.6) { const wv = Math.sin(q(t) * 14) * 20; m.armB = { h: [-60 + wv, -160], bend: -30 }; }
  duo(t, p, m);
  reset(); translate(540, 300); scale(back(seg(q(t), a, a + .3), 2.2)); titleArt(t, .95);
  if (t > VO.o2 - .2) { reset(); const k = back(seg(q(t), VO.o2 - .2, VO.o2 + .1), 2); translate(540, 640); scale(k); rotate(-.05); shape(rr(-300, -60, 600, 120, 40), { fill: '#ff7a6b', lw: 8 }); text('ABONNE-TOI', 0, 6, { font: '400 70px Bungee', fill: '#fff', outlineW: 10 }); }
}

function render(t) {
  frame(t);
  screenRect('#000');
  const s = shotAt(t);
  if (VO[s[4]] != null) shotLine(t, s); else shotBeat(t, s);
  wipe(t);
  tag(t);
  subs(t);
}

// —— sound events (for tools/mix.py and tools/score.py) ——
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const [id, t0] of Object.entries(VO)) add('vo', t0, { id, who: LINE[id].who });
  for (const c of CUES) add('cue', c.t0, c);
  for (const [t0, t1, name, w, id] of SHOTS) {
    if (VO[id] == null) add('mark', t0, { name: `${w}.${id}`, d: +(t1 - t0).toFixed(3) });
    if (name === 'arrive') { add('portalOpen', t0, { v: .6 }); add('pop', t0 + .1); add('pop', t0 + .25, { v: .8 }); add('thud', t0 + .5); add('thud', t0 + .7, { v: .8 }); add('portalClose', t0 + .9); }
    if (name === 'out') { add('page', t0 + .1); add('portalOpen', t0 + .3, { v: .7 }); }
    if (name === 'burst') { add('page', t0 + .1); add('portalOpen', t0 + .3); add('boing', t0 + .35, { v: .5 }); }
    if (name === 'title') add('slam', t0);
    if (name === 'pack') { add('cloth', t0 + .05); add('thud', t0 + .45, { v: .6 }); }
    if (name === 'rush') { add('suck', t0); add('suck', t0 + .05, { v: .8 }); }
    if (name === 'silence') { add('zip', t0 + 1.0); }
  }
  for (const [tc] of WIPES) add('whoosh', tc - .16);
  const [h0, h1] = worldSpan('home'); add('portalHum', B('home', 'BURST')[0] + .4, { d: h1 - B('home', 'BURST')[0] - .4 });
  add('toy', VO.z1 + 1.2);
  for (const c of CUES) add('amb', c.t0, { w: c.name, d: +(c.t1 - c.t0).toFixed(3) });
  return ev.sort((a, b) => a.t - b.t);
}

window.render = render; window.DUR = DUR; window.SHOTS = SHOTS; window.EV = events(); window.SUBS = SUBS;
for (const f of ['800 56px "Baloo 2"', '400 60px Bungee', '400 40px VT323']) await document.fonts.load(f);
render(parseFloat(new URLSearchParams(location.search).get('t') ?? '3'));
window.READY = true;
