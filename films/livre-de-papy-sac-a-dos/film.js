// Le Livre de Papy — « L'histoire du sac à dos » (Crayon World 3D, vertical 1080x1920).
// Papy's room → the book opens, the camera dives into its page → one long walk on a path through the history of the backpack
// (eight roadside scenes, each with its signpost) → the page again → the room, the book closes.
// 3D only computes shapes (engine/npr.js); every drawing is made by engine/crayon.js, 12 a second. The bottom of the sheet is
// always left as blank paper: the spoken line is written there, in the crayon of whoever speaks.
import * as THREE from 'three';
import { makeComp } from './engine/gl.js';
import * as C from './engine/crayon.js';
import { makeNPR, snap, shapes, silhouette, region, mesh, REG, REGM, RW, RH } from './engine/npr.js';
import { clamp, lerp, seg, eo, eio, hash } from '/core/lib.js';

const W = 1080, H = 1920;
let TL, LINES, MK;
export let DUR = 151;

// The crayon box (13): indigo line, sky, white, grass, olive, lemon, caramel, earth, brick, rose, cream, plum + Malik's royal blue
const P = { line: '#2c2f6b', sky: '#8cc3e8', white: '#ffffff', grass: '#6cb24a', olive: '#8a8f3a', lemon: '#f2d43a', caramel: '#d9932f', earth: '#8a5a35', brick: '#c8452f', rose: '#ec8a9a', cream: '#f4c49a', plum: '#8a4f8c', royal: '#3f5bd6' };
const PAPER = [0.957, 0.937, 0.890];

// ───────── regions
const bgR = (col, o = {}) => region({ col, p: .85, ang: .6, gap: 8, w: 10, ow: 6, ...o });
const R = {
  // the world
  sky: region({ col: P.sky, p: .42, ang: .12, gap: 14, w: 14, ow: 0, cross: 1 }),
  cloud: region({ col: P.white, p: 0, nofill: 1, ow: 6 }),
  grass: region({ col: P.grass, p: .5, ang: .08, gap: 13, w: 13, ow: 0 }),
  path: region({ col: P.caramel, p: .45, ang: .05, gap: 11, w: 12, ow: 6 }),
  hill: region({ col: P.olive, p: .6, ang: .3, gap: 12, w: 13, ow: 7 }),
  mount: region({ col: P.plum, p: .55, ang: .9, gap: 11, w: 12, ow: 7, shade: 1 }),
  snow: region({ col: P.white, p: 0, nofill: 1, ow: 6 }),
  trunk: bgR(P.earth, { ang: 1.5 }), crown: bgR(P.grass, { p: .82, ang: .9, gap: 10, w: 12, ow: 7, shade: 1 }), crown2: bgR(P.olive, { p: .8, ang: .7, gap: 10, w: 12, ow: 7, shade: 1 }),
  post: bgR(P.earth, { ang: 1.5, gap: 6, w: 8 }), board: region({ col: P.white, p: 0, nofill: 1, ow: 6 }),
  // the room
  wall: region({ col: P.cream, p: .38, ang: 1.45, gap: 12, w: 13, ow: 6 }),
  floor: region({ col: P.earth, p: .45, ang: .1, gap: 11, w: 12, ow: 6 }),
  rug: bgR(P.brick, { p: .7, ang: .3, gap: 9 }),
  shelf: bgR(P.earth, { p: .9, ang: .2 }),
  bookA: bgR(P.brick, { ang: 1.5, gap: 6, w: 8, ow: 5 }), bookB: bgR(P.sky, { ang: 1.5, gap: 6, w: 8, ow: 5 }), bookC: bgR(P.lemon, { ang: 1.5, gap: 6, w: 8, ow: 5 }), bookD: bgR(P.grass, { ang: 1.5, gap: 6, w: 8, ow: 5 }),
  win: region({ col: P.sky, p: .55, ang: .8, gap: 9, w: 11, ow: 7 }), frameW: bgR(P.earth, { ang: 1.5, gap: 6, w: 8 }),
  lamp: bgR(P.lemon, { p: .95, ang: .4, gap: 6, w: 8 }), lampT: bgR(P.caramel, { p: .9 }),
  // stations (behind the path: background group)
  hut: bgR(P.cream, { p: .5, ang: 1.45, gap: 11, w: 12, shade: 1 }), thatch: bgR(P.caramel, { p: .8, ang: .4, gap: 8, shade: 1 }),
  basket: bgR(P.caramel, { p: .9, ang: .9, gap: 6, w: 8, shade: 1 }), sack: bgR(P.cream, { p: .7, ang: .5, gap: 7, w: 9, shade: 1 }), wood: bgR(P.earth, { p: .9, ang: .3, gap: 6, w: 8 }),
  tent: region({ col: P.white, p: .25, ang: .5, gap: 10, w: 11, ow: 7, shade: 1 }),
  havre: bgR(P.olive, { p: .9, ang: .6, gap: 7, w: 9, shade: 1 }), roll: bgR(P.brick, { p: .9, ang: 1.4, gap: 6, w: 8 }), trunkBox: bgR(P.earth, { p: .85, ang: .2, shade: 1 }),
  redHouse: bgR(P.brick, { p: .85, ang: 1.45, gap: 9, w: 11, shade: 1 }), roofD: bgR(P.earth, { p: .9, ang: .55, gap: 8, shade: 1 }), trim: region({ col: P.white, p: 0, nofill: 1, ow: 6 }),
  flagB: bgR(P.royal, { p: .9, ang: .2, gap: 6, w: 8 }), flagY: bgR(P.lemon, { p: .95, ang: .2, gap: 5, w: 7, ow: 4 }),
  greenPack: bgR(P.grass, { p: .9, ang: .6, gap: 6, w: 8, shade: 1 }), alu: region({ col: P.white, p: 0, nofill: 1, ow: 6 }), cloth: bgR(P.sky, { p: .9, ang: -.5, gap: 6, w: 8, shade: 1 }),
  campus: bgR(P.brick, { p: .75, ang: 1.45, gap: 10, w: 11, shade: 1 }), column: region({ col: P.white, p: 0, nofill: 1, ow: 6 }), puddle: bgR(P.sky, { p: .6, ang: .05, gap: 7, w: 9, ow: 4 }),
  school: bgR(P.lemon, { p: .7, ang: 1.45, gap: 10, w: 11, shade: 1 }),
  squareA: bgR(P.rose, { p: .92, ang: .5, gap: 6, w: 8 }), squareB: bgR(P.sky, { p: .92, ang: -.5, gap: 6, w: 8 }), squareC: bgR(P.lemon, { p: .95, ang: .5, gap: 6, w: 8 }),
  awnA: bgR(P.brick, { p: .9, ang: 1.5, gap: 6, w: 8 }), awnB: region({ col: P.white, p: 0, nofill: 1, ow: 5 }), stall: bgR(P.earth, { p: .85, ang: .2, shade: 1 }),
  // people of the roadside (background)
  ...Object.fromEntries(['rose', 'lemon', 'sky', 'olive', 'brick', 'plum', 'cream', 'royal'].map(c => ['p_' + c, bgR(P[c], { p: .85, ang: .7, gap: 7, w: 9, ow: 6, shade: 1 })])),
  p_pants: bgR(P.line, { p: .6, ang: .3, gap: 7, w: 9, ow: 6 }), p_skin: bgR(P.cream, { p: .72, ang: .5, gap: 7, w: 9, ow: 6 }), p_skin2: bgR(P.caramel, { p: .55, ang: .5, gap: 7, w: 9, ow: 6 }),
  p_hair: bgR(P.earth, { p: .9, ang: 1.0, gap: 6, w: 8, ow: 6 }), p_shoe: bgR(P.earth, { p: .9, ang: .4, gap: 6, w: 8, ow: 6 }), p_hat: bgR(P.line, { p: .85, ang: .3, gap: 6, w: 8, ow: 6 }),
  // Papy and Malik (characters group)
  robe: region({ col: P.white, p: .3, ang: .7, gap: 8, w: 10, ow: 9, grp: 'ch', shade: 1 }),
  vest: region({ col: P.earth, p: .85, ang: .5, gap: 7, w: 9, ow: 9, grp: 'ch', shade: 1 }),
  skinP: region({ col: P.cream, p: .72, ang: .5, gap: 7, w: 9, ow: 9, grp: 'ch' }),
  beard: region({ col: P.white, p: .12, ang: 1.0, gap: 7, w: 9, ow: 8, grp: 'ch' }),
  kufi: region({ col: P.white, p: .2, ang: .2, gap: 6, w: 8, ow: 8, grp: 'ch' }),
  shoeP: region({ col: P.earth, p: .9, ang: .4, gap: 6, w: 8, ow: 8, grp: 'ch' }),
  hoodie: region({ col: P.royal, p: .88, ang: .6, gap: 7, w: 9, ow: 9, grp: 'ch', shade: 1 }),
  jeans: region({ col: P.line, p: .62, ang: .3, gap: 7, w: 9, ow: 9, grp: 'ch', shade: 1 }),
  skinM: region({ col: P.caramel, p: .5, ang: .5, gap: 7, w: 9, ow: 9, grp: 'ch' }),
  hairM: region({ col: P.earth, p: .95, ang: 1.0, gap: 6, w: 8, ow: 8, grp: 'ch' }),
  sneak: region({ col: P.white, p: 0, nofill: 1, ow: 8, grp: 'ch' }),
  pack: region({ col: P.caramel, p: .92, ang: .5, gap: 6, w: 8, ow: 8, grp: 'ch', shade: 1 }),
  strap: region({ col: P.earth, p: .95, ang: .2, gap: 4, w: 6, ow: 5, grp: 'ch' }),
  dino: region({ col: P.grass, p: .92, ang: .7, gap: 6, w: 8, ow: 8, grp: 'ch', shade: 1 }),
  car1: region({ col: P.brick, p: .95, ang: .3, gap: 5, w: 7, ow: 6, grp: 'ch' }), car2: region({ col: P.sky, p: .95, ang: -.3, gap: 5, w: 7, ow: 6, grp: 'ch' }), car3: region({ col: P.lemon, p: .95, ang: .3, gap: 5, w: 7, ow: 6, grp: 'ch' }),
  wheel: region({ col: P.line, p: .95, ang: .1, gap: 4, w: 6, ow: 4, grp: 'ch' }),
  // in front of them: the low table and the book
  table: region({ col: P.earth, p: .82, ang: .25, gap: 9, w: 11, ow: 8, grp: 'fg', shade: 1 }),
  cover: region({ col: P.brick, p: .9, ang: .5, gap: 7, w: 9, ow: 8, grp: 'fg', shade: 1 }),
  page: region({ col: P.white, p: 0, nofill: 1, ow: 7, grp: 'fg' }),
  label: region({ col: P.white, p: 0, nofill: 1, ow: 6, grp: 'fg' }),
  dinoF: region({ col: P.grass, p: .92, ang: .7, gap: 6, w: 8, ow: 8, grp: 'fg', shade: 1 }),
  carF1: region({ col: P.brick, p: .95, ang: .3, gap: 5, w: 7, ow: 6, grp: 'fg' }), carF2: region({ col: P.sky, p: .95, ang: -.3, gap: 5, w: 7, ow: 6, grp: 'fg' }), carF3: region({ col: P.lemon, p: .95, ang: .3, gap: 5, w: 7, ow: 6, grp: 'fg' }),
  wheelF: region({ col: P.line, p: .95, ang: .1, gap: 4, w: 6, ow: 4, grp: 'fg' }),
};

let comp, N, scene, cam, LY, ROOM, WALK, papy, malik, book, extras = [], FACES = [], SIGNS = [], STN = [], RAIN = null;
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (a, b, h, n = 20) => new THREE.CylinderGeometry(a, b, h, n);
const sph = (r, ...a) => new THREE.SphereGeometry(r, 22, 14, ...a);
const put = (m, x, y, z, parent) => { m.position.set(x, y, z); parent.add(m); return m; };
const grp = (x, y, z, parent) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

// ───────── a person, a child's drawing in 3D: big round head, tube limbs. o: h height, robe, coat, vest, pants, shoe, skin, hair ('curls'|'short'|null), hat ('kufi'|'cap'|'shako'|null), beard
function person(o, parent) {
  const s = (o.h || 1.6) / 1.6, g = grp(o.x || 0, 0, o.z || 0, parent), p = { g, s, o };
  p.legs = [-1, 1].map(k => { const hip = grp(k * .1 * s, .62 * s, 0, g); if (!o.robe) put(mesh(cyl(.075 * s, .07 * s, .56 * s, 10), o.pants), 0, -.28 * s, 0, hip); put(mesh(new THREE.CapsuleGeometry(.07 * s, .12 * s, 5, 10), o.shoe), 0, -.58 * s, .06 * s, hip).rotation.x = Math.PI / 2; return hip; });
  if (o.robe) put(mesh(cyl(.21 * s, .33 * s, .92 * s, 22), o.robe), 0, .5 * s, 0, g);
  const up = p.up = grp(0, .62 * s, 0, g);
  put(mesh(cyl(.2 * s, .25 * s, .52 * s, 20), o.coat), 0, .26 * s, 0, up);
  if (o.vest) put(mesh(cyl(.215 * s, .265 * s, .44 * s, 20), o.vest), 0, .26 * s, -.012 * s, up);
  p.arms = [-1, 1].map(k => {
    const sh = grp(k * .26 * s, .47 * s, 0, up);
    put(mesh(cyl(.07 * s, .065 * s, .42 * s, 10), o.coat), 0, -.2 * s, 0, sh);
    put(mesh(sph(.068 * s), o.skin), 0, -.44 * s, 0, sh);
    return sh;
  });
  const head = p.head = grp(0, .78 * s, 0, up);
  put(mesh(sph(.25 * s), o.skin), 0, .2 * s, 0, head);
  for (const k of [-1, 1]) put(mesh(sph(.05 * s), o.skin), k * .245 * s, .19 * s, 0, head).scale.set(.5, 1, 1);
  if (o.beard) { const b = put(mesh(sph(.2 * s), o.beard), 0, .07 * s, .1 * s, head); b.scale.set(1.02, 1.05, .72); }
  if (o.hair === 'curls') for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; put(mesh(sph(.1 * s), o.hairReg), Math.cos(a) * .16 * s, .36 * s + Math.sin(i * 2.1) * .03 * s, Math.sin(a) * .14 * s - .03 * s, head); }
  if (o.hair === 'curls') put(mesh(sph(.16 * s), o.hairReg), 0, .4 * s, -.04 * s, head);
  if (o.hair === 'short') { const hr = put(mesh(sph(.26 * s, 0, Math.PI * 2, 0, Math.PI * .42), o.hairReg), 0, .21 * s, -.02 * s, head); hr.rotation.x = -.35; }
  if (o.hat === 'kufi') put(mesh(cyl(.2 * s, .225 * s, .13 * s, 22), o.hatReg), 0, .4 * s, -.02 * s, head).rotation.x = -.18;
  if (o.hat === 'cap') { put(mesh(sph(.24 * s, 0, Math.PI * 2, 0, Math.PI / 2), o.hatReg), 0, .3 * s, 0, head); put(mesh(box(.3 * s, .02 * s, .18 * s), o.hatReg), 0, .3 * s, .2 * s, head); }
  if (o.hat === 'shako') put(mesh(cyl(.17 * s, .2 * s, .26 * s, 16), o.hatReg), 0, .46 * s, 0, head);
  if (o.hat === 'scarf') { const sc = put(mesh(sph(.27 * s, 0, Math.PI * 2, 0, Math.PI * .55), o.hatReg), 0, .2 * s, -.01 * s, head); sc.scale.set(1, 1.05, 1); }
  p.face = { head, s, skin: o.skin, beard: !!o.beard, col: o.faceCol || P.line };
  FACES.push(p.face);
  return p;
}
// a person's pose: walking phase (two drawings: step = 0 / 1 alternate), arm angles, body lean, head turn
function walkPose(p, t, on = 1, speed = 4) {
  const st = on ? Math.floor(t * speed) % 2 : -1;
  p.legs.forEach((h, j) => { h.rotation.x = st < 0 ? 0 : (j === st ? .38 : -.3); });
  p.up.position.y = .62 * p.s + (st < 0 ? 0 : (st ? .02 : 0) * p.s);
  return st;
}
const ARMS = (p, a, b, c = .08, d = -.08) => { p.arms[0].rotation.set(a, 0, c); p.arms[1].rotation.set(b, 0, d); };

// ───────── props
function lolli(x, z, s, reg, parent) { put(mesh(cyl(.13 * s, .18 * s, 2.2 * s, 8), R.trunk), x, 1.1 * s, z, parent); for (const [dx, dy, dz, r] of [[0, 2.7, 0, 1.0], [-.65, 2.3, .15, .7], [.7, 2.35, -.1, .72]]) put(mesh(sph(r * s), reg), x + dx * s, dy * s, z + dz * s, parent); }
function sign(x, z, label, parent) {
  const g = grp(x, 0, z, parent);
  put(mesh(cyl(.05, .06, 1.6, 8), R.post), 0, .8, 0, g);
  const b = put(mesh(box(1.5, .5, .05), R.board), 0, 1.45, .06, g);
  SIGNS.push({ b, label, w: 1.5 });
  return g;
}
function dinoToy(parent, reg, k = 1) {   // a green toy dinosaur: body, neck and head, tail, four legs, spikes
  const g = grp(0, 0, 0, parent); g.scale.setScalar(k);
  const b = put(mesh(sph(.1), reg), 0, .1, 0, g); b.scale.set(1.5, .9, .9);
  const n = put(mesh(cyl(.04, .05, .14, 8), reg), .12, .19, 0, g); n.rotation.z = -.6;
  const h = put(mesh(sph(.06), reg), .19, .26, 0, g); h.scale.set(1.4, .9, .9);
  const tl = put(mesh(new THREE.ConeGeometry(.05, .2, 8), reg), -.21, .09, 0, g); tl.rotation.z = Math.PI / 2 + .3;
  for (const [x, z] of [[-.07, -.05], [-.07, .05], [.07, -.05], [.07, .05]]) put(mesh(cyl(.025, .025, .08, 6), reg), x, .03, z, g);
  for (let i = 0; i < 4; i++) put(mesh(new THREE.ConeGeometry(.025, .05, 6), reg), -.1 + i * .06, .19, 0, g);
  return g;
}
function toyCar(parent, reg, wreg, k = 1) { const g = grp(0, 0, 0, parent); g.scale.setScalar(k); put(mesh(box(.16, .05, .08), reg), 0, .04, 0, g); put(mesh(box(.08, .04, .07), reg), -.01, .085, 0, g); for (const [x, z] of [[-.05, .045], [.05, .045], [-.05, -.045], [.05, -.045]]) put(mesh(cyl(.022, .022, .015, 10), wreg), x, .022, z, g).rotation.x = Math.PI / 2; return g; }

// ───────── Papy's room: back wall with a window and shelves, a hanging lantern, a rug, the low table and the book
function buildRoom() {
  ROOM = grp(0, 0, 0, scene);
  put(mesh(box(8, 5, .1), R.wall), 0, 2.5, -1.6, ROOM);
  for (const x of [-3.2, 3.2]) put(mesh(box(.1, 5, 6), R.wall), x, 2.5, 1.2, ROOM);
  put(mesh(box(8, .02, 7), R.floor), 0, 0, 1.4, ROOM);
  put(mesh(box(2.8, .02, 1.8), R.rug), 0, .015, .5, ROOM);
  // window (arched): a sky pane, an earth frame
  const wg = grp(0, 2.0, -1.55, ROOM);
  put(mesh(box(1.1, 1.2, .03), R.win), 0, 0, 0, wg); put(mesh(cyl(.55, .55, .03, 24, 1, false, 0, Math.PI), R.win), 0, .6, 0, wg).rotation.x = Math.PI / 2;
  for (const [x, y, w, h] of [[0, 0, .06, 1.25], [0, 0, 1.15, .06], [-.58, 0, .06, 1.25], [.58, 0, .06, 1.25], [0, -.62, 1.25, .08]]) put(mesh(box(w, h, .05), R.frameW), x, y, .03, wg);
  // shelves with books, left and right of the window
  for (const sx of [-1, 1]) for (const y of [1.3, 1.95, 2.6]) {
    put(mesh(box(1.1, .06, .3), R.shelf), sx * 1.55, y, -1.42, ROOM);
    for (let i = 0; i < 7; i++) { const h = .26 + .1 * hash(i * 3.1 + y + sx), reg = [R.bookA, R.bookB, R.bookC, R.bookD][Math.floor(hash(i * 1.7 + y * 2 + sx) * 4)]; put(mesh(box(.11, h, .22), reg), sx * 1.55 - .42 + i * .135, y + .03 + h / 2, -1.42, ROOM); }
  }
  // the lantern
  put(mesh(cyl(.006, .006, .9, 4), R.lampT), -1.05, 3.05, -.5, ROOM);
  put(mesh(cyl(.12, .16, .28, 8), R.lamp), -1.05, 2.5, -.5, ROOM); put(mesh(new THREE.ConeGeometry(.16, .14, 8), R.lampT), -1.05, 2.71, -.5, ROOM);
  // the low table and the book (closed at first)
  const tb = put(mesh(box(2.0, .08, .8), R.table), 0, .46, 1.0, ROOM);
  for (const [x, z] of [[-.9, .7], [.9, .7], [-.9, 1.3], [.9, 1.3]]) put(mesh(box(.08, .44, .08), R.table), x, .22, z, ROOM);
  book = { g: grp(.25, .51, 1.0, ROOM) };
  put(mesh(box(.84, .03, .6), R.cover), 0, .015, 0, book.g);                                      // back cover
  book.right = put(mesh(box(.8, .06, .56), R.page), 0, .06, 0, book.g);                           // the pages
  book.left = put(mesh(box(.8, .02, .56), R.page), -.84, .04, 0, book.g); book.left.visible = false;   // the left page, once open
  book.hinge = grp(-.42, .095, 0, book.g);                                                         // the front cover turns about the spine
  put(mesh(box(.84, .03, .6), R.cover), .42, 0, 0, book.hinge);
  book.label = put(mesh(box(.5, .012, .18), R.label), .42, .02, 0, book.hinge);
  // the toys on the table at the very end: the dinosaur stays home (front group, so Malik's hands go behind the table edge)
  book.dino = dinoToy(ROOM, R.dinoF, 1.3); book.dino.visible = false;
  // Papy and Malik
  papy = person({ h: 1.9, robe: R.robe, coat: R.robe, vest: R.vest, skin: R.skinP, shoe: R.shoeP, beard: R.beard, hat: 'kufi', hatReg: R.kufi, x: .62, z: 0 }, scene);
  malik = person({ h: 1.25, coat: R.hoodie, pants: R.jeans, skin: R.skinM, shoe: R.sneak, hair: 'curls', hairReg: R.hairM, x: -.62, z: 0 }, scene);
  // Malik's backpack, with the dinosaur's head and a car poking out of the top
  const s = malik.s, bp = malik.pack = grp(0, .26 * s, -.25 * s, malik.up);
  put(mesh(box(.34 * s, .38 * s, .16 * s), R.pack), 0, 0, 0, bp);
  put(mesh(box(.24 * s, .12 * s, .04 * s), R.pack), 0, -.08 * s, -.1 * s, bp);    // the front pocket
  malik.strapA = [-1, 1].map(k => put(mesh(box(.04 * s, .42 * s, .02 * s), R.strap), k * .1 * s, .02 * s, .09 * s, bp));
  const top = grp(0, .19 * s, 0, bp); const d = dinoToy(top, R.dino, .9); d.position.set(-.04, .02, 0); d.rotation.set(0, -.3, .9);
  const c1 = toyCar(top, R.car1, R.wheel, .8); c1.position.set(.08, .0, .02); c1.rotation.z = .8;
  malik.packDino = d;
}

// ───────── the walk: a path along x, grass, far hills, and eight roadside scenes, each with its signpost
const V = .42;   // walking speed (m/s): a slow walk
let ST = [];     // station x positions
function buildWalk() {
  WALK = grp(0, 0, 0, scene);
  put(mesh(sph(260), R.sky, THREE.BackSide), 40, 0, 0, WALK);
  put(mesh(box(600, .02, 400), R.grass), 40, -.01, -60, WALK);
  put(mesh(box(200, .02, 1.2), R.path), 40, .006, 0, WALK);
  for (let i = 0; i < 9; i++) { const m = put(mesh(sph(1), R.hill), -20 + i * 16, -3, -70 - 12 * hash(i), WALK); m.scale.set(16 + 6 * hash(i * 2), 9 + 5 * hash(i * 3), 9); }
  for (const [x, y, z, k] of [[-5, 16, -60, 4], [12, 19, -70, 5], [30, 15, -55, 4], [48, 18, -70, 5], [66, 16, -60, 4]]) { const cg = grp(x, y, z, WALK); (WALK.clouds ||= []).push([cg, x]); for (let i = 0; i < 4; i++) put(mesh(sph(k * (1 - .15 * (i % 2))), R.cloud), (i - 1.5) * k * 1.1, (i % 2) * k * .45, 0, cg); }
  // each scene is centred on where the two of them are halfway through its lines; its content spreads from 2.6 m before to 6 m after,
  // so the group sits 1.4 m back from that centre and a metre further from the path
  const L = LINES, mid = (a, b) => V * ((L[a - 1].t0 + L[b - 1].t1) / 2 - MK.walk);
  ST = [mid(9, 13), mid(14, 16), mid(17, 18), mid(19, 21), mid(22, 24), mid(25, 27), mid(28, 29), mid(30, 32)];
  const S = ST.map((x, i) => grp(x - 1.4, 0, -1.0, WALK));
  const FIRST = [9, 14, 17, 19, 22, 25, 28, 30], SX = i => V * (L[FIRST[i] - 1].t0 - MK.walk) + 1.5 - (ST[i] - 1.4);   // each board just ahead of the walkers as its first line starts
  // trees between the scenes
  for (let i = 0; i < 26; i++) { const x = -4 + i * 2.1 + hash(i) * 1.2; if (ST.some(s => Math.abs(s - x) < 2.6)) continue; lolli(x, -6 - 3 * hash(i * 1.7), .8 + .4 * hash(i * 2.9), i % 2 ? R.crown : R.crown2, WALK); }
  const pp = (o, parent) => { const p = person({ coat: R.p_sky, pants: R.p_pants, skin: R.p_skin, shoe: R.p_shoe, hairReg: R.p_hair, hatReg: R.p_hat, hair: 'short', ...o }, parent); extras.push(p); return p; };
  // 1. long ago: porters with baskets and sacks on their backs, a hut, baskets on the ground
  sign(SX(0), -2.2, 'Autrefois', S[0]);
  const h = grp(2.4, 0, -6.5, S[0]); put(mesh(cyl(1.0, 1.0, 1.4, 16), R.hut), 0, .7, 0, h); put(mesh(new THREE.ConeGeometry(1.35, 1.2, 16), R.thatch), 0, 2.0, 0, h);
  const a = pp({ coat: R.p_olive, skin: R.p_skin2, hat: 'scarf', hair: null, x: -.6, z: -3.4 }, S[0]); a.load = put(mesh(cyl(.26, .2, .5, 12), R.basket), 0, .3 * a.s, -.3, a.up); a.walk = 1;
  const b = pp({ coat: R.p_rose, x: 1.2, z: -4.2, h: 1.55 }, S[0]); b.load = grp(0, .3, -.26, b.up); put(mesh(box(.5, .9, .06), R.wood), 0, 0, 0, b.load); put(mesh(sph(.24), R.sack), 0, .25, -.16, b.load).scale.set(1.1, 1, .8); b.walk = 1;
  const c = pp({ coat: R.p_cream, skin: R.p_skin2, x: 3.6, z: -3.6, h: 1.5 }, S[0]); c.load = put(mesh(sph(.3), R.sack), .12, .4, -.3, c.up); c.load.scale.set(1.2, 1, .8); c.bend = 1;   // the badly placed load
  for (const [x, z, k] of [[4.8, -2.8, 1], [5.4, -3.2, .8], [5.9, -2.7, 1.2]]) put(mesh(cyl(.22 * k, .17 * k, .36 * k, 12), R.basket), x, .18 * k, z, S[0]);
  // 2. the 19th century: tents, soldiers with square knapsacks and a rolled blanket, an open knapsack on a crate
  sign(SX(1), -2.2, 'XIXe siècle', S[1]);
  for (const [x, z] of [[-1.2, -7], [2.6, -7.5]]) { const tg = grp(x, 0, z, S[1]); const m = put(mesh(new THREE.CylinderGeometry(1, 1, 2.4, 3, 1), R.tent), 0, .75, 0, tg); m.rotation.z = Math.PI / 2; m.rotation.x = Math.PI / 2; m.scale.set(1, 1, .9); m.rotation.y = 0; }
  for (const [x, z, flip] of [[.4, -3.6, 0], [1.6, -4.4, 1]]) {
    const sd = pp({ coat: R.p_brick, pants: R.p_pants, hat: 'shako', hair: null, x, z }, S[1]); sd.g.rotation.y = flip ? -.5 : .4;
    const k = grp(0, .32 * sd.s, -.27, sd.up); put(mesh(box(.42, .44, .2), R.havre), 0, 0, 0, k); put(mesh(cyl(.08, .08, .5, 10), R.roll), 0, .29, 0, k).rotation.z = Math.PI / 2;
  }
  const cr = grp(3.4, 0, -3.0, S[1]); put(mesh(box(.8, .5, .5), R.wood), 0, .25, 0, cr); put(mesh(box(.5, .3, .25), R.havre), -.1, .65, 0, cr);
  put(mesh(box(.3, .06, .2), R.p_rose), -.1, .83, .02, cr); put(mesh(box(.28, .06, .18), R.p_sky), -.08, .89, .02, cr);   // clothes in the open knapsack
  put(mesh(box(.42, .36, .2), R.trunkBox), 4.2, .18, -3.4, S[1]);                                                       // a rigid one
  const cv = put(mesh(sph(.24), R.sack), 4.8, .22, -3.1, S[1]); cv.scale.set(1, 1.1, .7); put(mesh(box(.04, .46, .3), R.p_pants), 4.75, .25, -3.1, S[1]);   // a canvas one with a strap
  // 3. travellers: a walker with a big bag and a stick, a trunk
  sign(SX(2), -2.2, 'Voyageurs', S[2]);
  const tr = pp({ coat: R.p_plum, hat: 'cap', hair: null, x: 1.2, z: -3.8 }, S[2]); tr.load = put(mesh(box(.4, .48, .22), R.trunkBox), 0, .3 * tr.s, -.3, tr.up); tr.walk = 1;
  put(mesh(cyl(.02, .02, 1.3, 6), R.wood), .38, .3, .1, tr.arms[1]).rotation.x = .2;
  put(mesh(box(.8, .45, .45), R.trunkBox), 3.0, .23, -3.5, S[2]); put(mesh(box(.82, .06, .47), R.wood), 3.0, .47, -3.5, S[2]);
  // 4. the 20th century: mountains, hikers with framed packs (wood, then metal)
  sign(SX(3), -2.2, 'XXe siècle', S[3]);
  for (const [x, z, s] of [[-2, -26, 1], [6, -30, 1.3], [12, -24, .9]]) { const m = put(mesh(new THREE.ConeGeometry(7 * s, 9 * s, 7), R.mount), x, 4.5 * s, z, S[3]); const c2 = put(mesh(new THREE.ConeGeometry(2.4 * s, 3.1 * s, 7), R.snow), x, 7.5 * s, z + .2, S[3]); }
  for (const [x, z, reg, fr] of [[.8, -3.6, R.p_lemon, R.wood], [2.6, -4.6, R.p_sky, R.alu]]) {
    const hk = pp({ coat: reg, hat: 'cap', hair: null, x, z }, S[3]); hk.walk = 1;
    const k = grp(0, .3 * hk.s, -.3, hk.up); put(mesh(box(.36, .5, .2), R.havre), 0, 0, -.02, k);
    for (const sx of [-1, 1]) put(mesh(box(.04, .95, .04), fr), sx * .2, .12, .1, k); put(mesh(box(.44, .04, .04), fr), 0, .58, .1, k); put(mesh(box(.44, .04, .04), fr), 0, -.32, .1, k);
  }
  // 5. Sweden, 1960: a red house, the flag, a workbench with a green pack on an aluminium frame, a roll of blue fabric
  sign(SX(4), -2.2, 'Suède · 1960', S[4]);
  const rh = grp(2.6, 0, -7, S[4]); put(mesh(box(3.4, 2.3, 2.4), R.redHouse), 0, 1.15, 0, rh);
  const rf = put(mesh(new THREE.CylinderGeometry(1, 1, 3.9, 3, 1), R.roofD), 0, 2.85, 0, rh); rf.rotation.z = Math.PI / 2; rf.rotation.x = -Math.PI / 2; rf.scale.set(1.0, 1, 1.45);
  for (const sx of [-1, 1]) put(mesh(box(.12, 2.3, .05), R.trim), sx * 1.66, 1.15, 1.22, rh); put(mesh(box(.7, 1.3, .05), R.trim), -.6, .65, 1.22, rh); put(mesh(box(.7, .6, .05), R.trim), .8, 1.35, 1.22, rh);
  const fp = grp(-1.0, 0, -4.8, S[4]); put(mesh(cyl(.04, .05, 3.2, 8), R.post), 0, 1.6, 0, fp); put(mesh(box(.9, .56, .02), R.flagB), .47, 2.8, 0, fp); put(mesh(box(.12, .56, .03), R.flagY), .3, 2.8, 0, fp); put(mesh(box(.9, .1, .03), R.flagY), .47, 2.8, 0, fp);
  const wb = grp(1.6, 0, -3.2, S[4]); put(mesh(box(1.6, .08, .7), R.wood), 0, .75, 0, wb); for (const [x, z] of [[-.7, -.3], [.7, -.3], [-.7, .3], [.7, .3]]) put(mesh(box(.07, .74, .07), R.wood), x, .37, z, wb);
  const gp = grp(-.35, .79, 0, wb); put(mesh(box(.42, .6, .22), R.greenPack), 0, .32, 0, gp); for (const sx of [-1, 1]) put(mesh(box(.035, .78, .035), R.alu), sx * .24, .38, .14, gp); put(mesh(box(.5, .035, .035), R.alu), 0, .76, .14, gp);
  const roll = put(mesh(cyl(.13, .13, .6, 14), R.cloth), .45, .92, 0, wb); roll.rotation.z = Math.PI / 2;
  const cm = pp({ coat: R.p_cream, pants: R.p_pants, x: 3.0, z: -3.6, hair: 'short' }, S[4]); cm.g.rotation.y = -.6;
  // 6. United States, 1967: a campus in the rain, students with packs over their books
  sign(SX(5), -2.2, 'États-Unis · 1967', S[5]);
  const cp = grp(2.4, 0, -8, S[5]); put(mesh(box(5, 3, 2.2), R.campus), 0, 1.5, 0, cp); for (let i = 0; i < 4; i++) put(mesh(cyl(.13, .13, 2.6, 10), R.column), -1.2 + i * .8, 1.3, 1.25, cp);
  const pd = put(mesh(new THREE.CylinderGeometry(1, 1, 3.2, 3, 1), R.column), 0, 3.35, 1.15, cp); pd.rotation.z = Math.PI / 2; pd.rotation.x = -Math.PI / 2; pd.scale.set(.5, 1, .8);
  for (const [x, z, reg] of [[.4, -3.6, R.p_royal], [1.7, -4.2, R.p_rose], [3.2, -3.4, R.p_lemon]]) { const st = pp({ coat: reg, x, z, h: 1.5 }, S[5]); st.walk = 1; put(mesh(box(.34, .4, .16), R.havre), 0, .3 * st.s, -.27, st.up); }
  put(mesh(cyl(.5, .5, .02, 16), R.puddle), -.6, .01, -2.0, S[5]).scale.set(1.6, 1, .6); put(mesh(cyl(.4, .4, .02, 16), R.puddle), 4.0, .01, -2.3, S[5]).scale.set(1.5, 1, .5);
  // 7. Sweden, 1978: a school, the flag, children with square bags on both shoulders
  sign(SX(6), -2.2, 'Suède · 1978', S[6]);
  const sc = grp(2.5, 0, -7.5, S[6]); put(mesh(box(4.4, 2.4, 2.2), R.school), 0, 1.2, 0, sc);
  const sr = put(mesh(new THREE.CylinderGeometry(1, 1, 4.8, 3, 1), R.roofD), 0, 2.85, 0, sc); sr.rotation.z = Math.PI / 2; sr.rotation.x = -Math.PI / 2; sr.scale.set(1.0, 1, 1.35);
  for (const x of [-1.4, 0, 1.4]) put(mesh(box(.7, .6, .05), R.trim), x, 1.4, 1.12, sc);
  const fp2 = grp(-.9, 0, -5.4, S[6]); put(mesh(cyl(.04, .05, 3.2, 8), R.post), 0, 1.6, 0, fp2); put(mesh(box(.9, .56, .02), R.flagB), .47, 2.8, 0, fp2); put(mesh(box(.12, .56, .03), R.flagY), .3, 2.8, 0, fp2); put(mesh(box(.9, .1, .03), R.flagY), .47, 2.8, 0, fp2);
  for (const [x, z, reg, bag] of [[.6, -3.4, R.p_lemon, R.squareA], [1.7, -3.9, R.p_rose, R.squareB], [2.8, -3.3, R.p_sky, R.squareC]]) { const k = pp({ coat: reg, x, z, h: 1.15, hair: 'short' }, S[6]); k.walk = 1; put(mesh(box(.32, .34, .13), bag), 0, .27 * k.s, -.24, k.up); }
  // 8. today: a stall under an awning, bags for school, hiking, sport and travel
  sign(SX(7), -2.2, 'Aujourd’hui', S[7]);
  const shp = grp(1.9, 0, -4.2, S[7]); put(mesh(box(3.6, .9, .9), R.stall), 0, .45, 0, shp);
  for (let i = 0; i < 6; i++) put(mesh(box(.6, .08, 1.0), i % 2 ? R.awnB : R.awnA), -1.5 + i * .6, 2.3, .1, shp).rotation.x = .25;
  for (const sx of [-1.75, 1.75]) put(mesh(box(.06, 2.3, .06), R.post), sx, 1.15, .45, shp);
  for (const [x, w, h, reg] of [[-1.3, .35, .4, R.squareB], [-.7, .32, .62, R.havre], [-.15, .4, .3, R.squareA], [.45, .34, .44, R.greenPack], [1.1, .55, .66, R.trunkBox]]) put(mesh(box(w, h, .25), reg), x, .9 + h / 2, 0, shp);
  extras.forEach(p => { p.walk = p.walk || 0; });
}

export async function init() {
  TL = await (await fetch('timeline.json')).json(); LINES = TL.lines; MK = TL.marks; DUR = TL.dur;
  comp = makeComp(document.getElementById('gl'));
  N = makeNPR();
  scene = new THREE.Scene();
  buildRoom(); buildWalk();
  cam = new THREE.PerspectiveCamera(50, 9 / 16, .02, 600); scene.add(cam);
  const L = () => C.layer();
  LY = { bg: [L(), L()], ch: [L(), L()], fg: [L(), L()], tx: L(), sil: document.createElement('canvas'), knock: L() };
  LY.sil.width = RW; LY.sil.height = RH;
  try { await document.fonts.load('64px "Patrick Hand"', 'Àé'); } catch (e) { }
}

// ───────── the camera
function cr(keys, t) {   // time-based Hermite spline through [time, position, look] keys; at rest on the first and last keys
  const n = keys.length; if (t <= keys[0][0]) return keys[0].slice(1); if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
  let i = 0; while (i < n - 2 && t > keys[i + 1][0]) i++;
  const t1 = keys[i][0], t2 = keys[i + 1][0], dt = t2 - t1, u = (t - t1) / dt;
  const h00 = 2 * u ** 3 - 3 * u * u + 1, h10 = u ** 3 - 2 * u * u + u, h01 = -2 * u ** 3 + 3 * u * u, h11 = u ** 3 - u * u;
  const m = (j, c, a) => (j <= 0 || j >= n - 1) ? 0 : (keys[j + 1][c][a] - keys[j - 1][c][a]) / (keys[j + 1][0] - keys[j - 1][0]);
  return [1, 2].map(c => [0, 1, 2].map(a => h00 * keys[i][c][a] + h10 * dt * m(i, c, a) + h01 * keys[i + 1][c][a] + h11 * dt * m(i + 1, c, a)));
}
const L0 = n => LINES[n - 1].t0, L1 = n => LINES[n - 1].t1;
const BK = [.25, .51, 1.0];   // the book on the table
function roomKeys() {
  return [
    [0, [0, 1.05, 4.6], [0, 1.0, 0]],
    [L0(3) - .4, [0, 1.0, 4.2], [0, 1.0, 0]],
    [L0(3) + .5, [-.55, .95, 2.6], [-.58, .85, 0]],          // the toys poking out of the bag
    [L1(4) + .2, [-.4, .98, 2.85], [-.48, .9, 0]],
    [L0(5) + .6, [.25, 1.25, 3.2], [.5, 1.25, 0]],               // Papy
    [L0(6) + 1.0, [0, 1.05, 4.0], [0, 1.0, 0]],
    [L0(7) + .4, [-.35, .95, 2.9], [-.58, .92, 0]],            // Malik swings the bag onto his back
    [L1(7) + .2, [-.2, 1.0, 3.2], [-.4, .95, 0]],
    [L0(8) + .5, [0, 1.35, 2.9], [.1, .6, .9]],                 // to the book as it opens
    [MK.dive - .2, [.2, 1.05, 2.0], [BK[0], BK[1], BK[2]]],
    [MK.dive + 1.0, [BK[0] + .14, BK[1] + .22, BK[2] + .02], [BK[0] + .14, BK[1], BK[2] - .002]],   // into the right-hand page: blank paper fills the frame
  ];
}
function room2Keys() {
  const t0 = MK.room2;
  return [
    [t0 - .2, [BK[0] + .14, BK[1] + .22, BK[2] + .02], [BK[0] + .14, BK[1], BK[2] - .002]],
    [t0 + 1.2, [.1, 1.3, 2.8], [0, .85, .4]],
    [L0(34) + .6, [0, 1.05, 4.2], [0, 1.0, 0]],
    [L0(35), [0, 1.1, 4.6], [0, 1.05, 0]],
    [DUR, [0, 1.15, 5.0], [0, 1.1, 0]],
  ];
}
const D = t => V * (t - MK.walk);   // where the two of them are on the path
function walkCam(t) {
  const d = D(t);
  let lookX = 0, w = 0; for (const s of ST) { const k = Math.exp(-((((d + .6) - s) / 3.2) ** 2)); lookX += k * (s - (d + .6)) * .35; w += k; }
  const rise = eio(clamp((t - MK.walk + .6) / 1.6)), sink = eio(clamp((t - MK.back) / .9));
  const pos = [d + .2, 2.2, 6.3], look = [d + .55 + lookX, 1.3, -3];
  // the walk starts looking straight down at the path (the page) and tilts up; it ends tilting back down to it
  const down = Math.max(1 - rise, sink);
  return [pos.map((v, i) => lerp(v, [d + .55, 2.6, .3][i], down)), look.map((v, i) => lerp(v, [d + .56, 0, .29][i], down))];
}

// ───────── poses
function roomPose(t) {
  const ps = papy, mk = malik; ps.g.position.set(.62, 0, 0); mk.g.position.set(-.62, 0, 0);
  walkPose(ps, t, 0); walkPose(mk, t, 0);
  const b = Math.sin(t * 1.4) * .01; ps.up.rotation.x = b; mk.up.rotation.x = -b;
  // heads: who speaks looks at the other; at the book they both look down
  const cur = LINES.find(l => t >= l.t0 - .2 && t < l.s1) || LINES[0], toBook = (t > L0(8) && t < MK.room2 - 1) || (t > L0(34) - .3 && t < L1(34) + .3);
  ps.g.rotation.y = -.35; mk.g.rotation.y = .3;
  ps.head.rotation.set(toBook ? .45 : 0, cur.who === 'papy' ? -.25 : -.1, 0); mk.head.rotation.set(toBook ? .4 : -.12, cur.who === 'malik' ? .25 : .15, 0);
  // Malik's bag: in his arms (lines 2–6), swung onto his back on line 7; at the end he takes the dinosaur out and puts it on the table
  const swing = eio(seg(t, L0(7) + .3, L0(7) + 1.0)), inArms = t < MK.walk && swing < 1;
  const s = mk.s;
  if (t < MK.walk) {
    mk.pack.position.set(0, lerp(.16, .26, swing) * s, lerp(.3, -.25, swing) * s); mk.pack.rotation.y = lerp(Math.PI, 0, swing);
    const armF = lerp(-1.2, .05, swing), up = t > L0(7) + 1.0 && t < L1(7) + .3 ? -2.6 : armF;
    ARMS(mk, up, up, lerp(.35, .1, swing), lerp(-.35, -.1, swing));
  } else {
    mk.pack.position.set(0, .26 * s, -.25 * s); mk.pack.rotation.y = 0;
    const take = seg(t, MK.room2 + .8, L0(33) + 1.8);
    mk.packDino.visible = take < .45; book.dino.visible = take >= .45;
    ARMS(mk, take > 0 && take < 1 ? -1.1 : .05, .05, .1, -.1);
    book.dino.position.set(-.45, .53, .9); book.dino.rotation.y = .4;
  }
  // Papy: one hand on his chest, opening the book on line 8, a wave at the end
  const open = eio(seg(t, L0(8) + .4, L0(8) + 1.4)), close = eio(seg(t, MK.close, MK.close + .9)), k = t < MK.room2 ? open : 1 - close;
  book.hinge.rotation.z = Math.PI * k; book.left.visible = k > .97; book.label.visible = k < .5;
  const wave = t > L0(35) - .2;
  ARMS(ps, (t > L0(8) && t < L0(8) + 1.5) || (t > MK.close - .3 && t < MK.close + 1) ? -.9 : -.15, wave ? -2.7 + .3 * Math.sin(t * 8) : -.25, .1, wave ? -.3 : -.15);
  if (wave) ARMS(mk, mk.arms[0].rotation.x, -2.7 + .3 * Math.sin(t * 8 + 1), .1, -.3);
  papy.g.visible = malik.g.visible = true;
}
function walkPoseAll(t) {
  const d = D(t), ps = papy, mk = malik;
  mk.g.position.set(d + .1, 0, .15); ps.g.position.set(d + .95, 0, -.15);
  const moving = t > MK.walk - .2 && t < MK.back + .4;
  walkPose(ps, t, moving, 3.2); walkPose(mk, t + .13, moving, 4);
  ps.g.rotation.y = mk.g.rotation.y = .55;   // three-quarter: walking to the right, faces to us
  const cur = LINES.find(l => t >= l.t0 - .2 && t < l.s1);
  ps.head.rotation.set(0, cur && cur.who === 'malik' ? -.55 : -.2, 0); mk.head.rotation.set(-.12, cur && cur.who === 'papy' ? .45 : .2, 0);
  const sw = moving ? Math.sin(t * Math.PI * 2 * 1.6) * .3 : 0;
  ARMS(ps, sw, -sw, .1, -.1); ARMS(mk, -sw * 1.2, sw * 1.2, .12, -.12);
  if (t > L0(18) - .2 && t < L1(18) + .2) ARMS(mk, -sw, -1.0, .12, .4);          // the snack: he pats his bag
  if (t > L0(32) - .2 && t < L1(32) + .2) ARMS(mk, -sw, -1.0, .12, .4);
  if (t > L0(20) && t < L1(21)) ARMS(ps, sw, -1.5, .1, -.2);                      // pointing at the frames
  mk.pack.position.set(0, .26 * mk.s, -.25 * mk.s); mk.pack.rotation.y = 0; mk.packDino.visible = true;
  ps.up.rotation.x = mk.up.rotation.x = 0;
  // the roadside people
  for (const p of extras) {
    if (p.walk) walkPose(p, t + p.g.position.x, 1, 3); else walkPose(p, t, 0);
    const a = Math.sin(t * 2 + p.g.position.x) * .25 * (p.walk ? 1 : .2); ARMS(p, a, -a);
    if (p.bend) { const k = (t > L0(12) - .3 && t < L1(12) + .5) ? 1 : .35; p.up.rotation.set(.35 * k, 0, .3 * k); }
  }
  for (const [cg, x0] of WALK.clouds) cg.position.x = x0 + t * .25;
}
function pose(t) {
  const inRoom = t < MK.dive + 1.05 || t >= MK.room2 - .25;
  ROOM.visible = inRoom; WALK.visible = !inRoom;
  let pos, look;
  if (t < MK.room2 - .25 && t < MK.dive + 1.05) { roomPose(t); [pos, look] = cr(roomKeys(), t); }
  else if (!inRoom) { walkPoseAll(t); [pos, look] = walkCam(t); }
  else { roomPose(t); [pos, look] = cr(room2Keys(), t); }
  cam.position.set(...pos); cam.lookAt(...look);
  RAIN = !inRoom && t > L0(25) - 1 && t < L1(26) + .6 ? t : null;
}

// ───────── faces: eyes, cheeks and a smile projected from each head; only where the head is actually seen
function faces(Lr, S) {
  for (const f of FACES) {
    const head = f.head; if (!head.parent || !visibleUp(head)) continue;
    const pr = v => { const q = v.clone().applyMatrix4(head.matrixWorld).project(cam); return [(q.x * .5 + .5) * W, (.5 - q.y * .5) * H, q.z]; };
    const s = f.s, c = pr(new THREE.Vector3(0, .2 * s, 0)), top = pr(new THREE.Vector3(0, .45 * s, 0));
    const r = Math.hypot(top[0] - c[0], top[1] - c[1]); if (r < 6 || c[2] > 1) continue;
    const front = new THREE.Vector3(0, 0, 1).transformDirection(head.matrixWorld), toCam = cam.position.clone().sub(head.getWorldPosition(new THREE.Vector3())).normalize();
    if (front.dot(toCam) < .1) continue;   // facing away
    const e = (dx, dy, dz = .235) => pr(new THREE.Vector3(dx * s, (.2 + dy) * s, dz * s));
    const seen = ([x, y]) => { const i = Math.floor(y / 2) * RW + Math.floor(x / 2); return x >= 0 && y >= 0 && x < W && y < H && S.id[i] > 0 && (S.id[i] === f.skin || S.id[i] === R.beard); };
    for (const k of [-1, 1]) {
      const p = e(k * .085, .03); if (!seen(p)) continue;
      C.dab(Lr, p[0], p[1], Math.max(3, r * .075), { col: P.line, p: .97, seed: 31 + k, gap: 3, w: 4 });
      if (!f.beard) { const q = e(k * .13, -.05, .2); C.dab(Lr, q[0], q[1], r * .09, { col: P.rose, p: .55, seed: 51 + k, sq: .7 }); }
      const bw = e(k * .085, .1); C.line(Lr, [[bw[0] - r * .07, bw[1] + r * .01], [bw[0] + r * .07, bw[1] - r * .01]], { col: f.beard ? P.line : P.earth, w: Math.max(3, r * .035), p: .7, seed: 71 + k, closed: false });
    }
    const m = e(0, f.beard ? -.06 : -.075); if (!seen(m)) continue;
    C.line(Lr, C.ellipse(m[0], m[1] - r * .03, r * .085, r * .045, 12, .35, Math.PI - .35), { col: P.line, w: Math.max(3, r * .035), p: .9, seed: 61 });
  }
}
function visibleUp(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }
// the signposts: the era written on each board, in the outline crayon
function signs(Lr) {
  if (!WALK.visible) return;
  for (const s of SIGNS) {
    const c = s.b.getWorldPosition(new THREE.Vector3()), q = c.clone().project(cam); if (q.z > 1 || Math.abs(q.x) > 1.3) continue;
    const e = c.clone().add(new THREE.Vector3(s.w / 2, 0, 0)).project(cam), wpx = Math.abs(e.x - q.x) * .5 * W * 2;
    const size = Math.min(52, wpx * .23); if (size < 14) continue;
    C.text(Lr, s.label, (q.x * .5 + .5) * W, (.5 - q.y * .5) * H + size * .35, { font: 'Patrick Hand', size, col: P.line, seed: 17 });
  }
}
// the title on the book's cover, written on its paper label
function coverTitle(Lr) {
  if (!ROOM.visible || !book.label.visible) return;
  const c = book.label.getWorldPosition(new THREE.Vector3()), q = c.clone().project(cam); if (q.z > 1) return;
  const e = c.clone().add(new THREE.Vector3(.22, 0, 0)).project(cam), wpx = Math.abs(e.x - q.x) * W;
  const size = Math.min(46, wpx * .3); if (size < 10) return;
  C.text(Lr, 'Le Livre de Papy', (q.x * .5 + .5) * W, (.5 - q.y * .5) * H + size * .3, { font: 'Patrick Hand', size, col: P.line, seed: 21 });
}
// the open book's right-hand page: a little drawing of a backpack and a few lines of writing
function pageDoodle(Lr) {
  if (!ROOM.visible || !book.left.visible) return;
  const pg = book.right, pr = (x, z) => { const q = new THREE.Vector3(x, .031, z).applyMatrix4(pg.matrixWorld).project(cam); return q.z < 1 ? [(q.x * .5 + .5) * W, (.5 - q.y * .5) * H] : null; };
  const pts = (arr) => arr.map(([x, z]) => pr(x, z)).filter(Boolean);
  const bag = pts([[-.24, -.12], [-.06, -.12], [-.04, .1], [-.26, .1]]); if (bag.length === 4) { C.fill(Lr, [bag], { col: P.caramel, p: .9, ang: .6, gap: 6, w: 8, seed: 3 }); C.line(Lr, [...bag, bag[0]], { col: P.line, w: 5, p: .9, seed: 4, closed: false }); }
  const flap = pts([[-.25, -.12], [-.15, -.2], [-.05, -.12]]); if (flap.length === 3) C.line(Lr, flap, { col: P.line, w: 5, p: .9, seed: 5, closed: false });
  for (let i = 0; i < 5; i++) { const l = pts([[.03, -.18 + i * .08], [.3 - .06 * hash(i), -.18 + i * .08]]); if (l.length === 2) C.line(Lr, l, { col: P.line, w: 4, p: .55, seed: 9 + i, closed: false }); }
}
// rain on the campus: short sky-blue strokes falling
function rain(Lr, t) {
  if (RAIN === null) return;
  const k = clamp((t - (L0(25) - 1)) / .8) * clamp((L1(26) + .6 - t) / .8);
  for (let i = 0; i < 46; i++) { const x = hash(i * 7.7) * W, ph = (t * 1.8 + hash(i * 3.1)) % 1, y = -60 + ph * 1560; if (hash(i + 3) > k) continue; C.line(Lr, [[x, y], [x - 14, y + 70]], { col: P.sky, w: 6, p: .9, seed: 300 + i, closed: false }); }
}

// ───────── the words: written at the bottom of the sheet, on the paper the crayon leaves blank, in the colour of whoever speaks
const BAND = Array.from({ length: 15 }, (_, i) => [i * 80 - 20, 1486 + 22 * Math.sin(i * 1.9) + 12 * Math.sin(i * 4.3)]);
function wrap(g, str, size, maxW) { g.font = `400 ${size}px "Patrick Hand"`; const words = str.split(' '), out = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (cur && g.measureText(t).width > maxW) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out; }
function words(t) {
  const l = LINES.find(q => t >= q.s0 && t < q.s1); if (!l) return false;
  C.clear(LY.tx);
  const title = l.id === 'l01', size = title ? 104 : 66, lines = wrap(LY.tx.g, l.text, size, 920), lh = size * 1.12;
  const total = lines.reduce((a, s) => a + [...s].length + 1, 0), k = clamp((t - l.s0) / Math.min(1.1, .35 + total * .018)), nshow = Math.floor(k * 12) / 12 * total;
  let used = 0; const y0 = 1700 - (lines.length - 1) * lh / 2 + (title ? 10 : 0);
  lines.forEach((s, i) => { const n = [...s].length + 1, rv = clamp((nshow - used) / n); used += n; if (rv > 0) C.text(LY.tx, s, W / 2, y0 + i * lh, { font: 'Patrick Hand', size, col: l.who === 'malik' ? P.royal : P.line, reveal: rv, seed: 5 + i }); });
  return true;
}
export function texts(t) {   // reading check: these are the spoken lines, timed to the voice (subtitle rule: line + 0.6 s, at least 1.8 s)
  const l = LINES.find(q => t >= q.s0 && t < q.s1); if (!l) return [];
  return [{ id: l.id, text: l.text, x0: 80, y0: 1520, x1: 1000, y1: 1880, pass: true }];
}

const _v = new THREE.Vector3();
function anc(r) { const m = REGM[r]?.find(visibleUp); if (!m) return undefined; m.getWorldPosition(_v).project(cam); return [(_v.x * .5 + .5) * W, (.5 - _v.y * .5) * H]; }
function openLines(rings) {   // no outline along the frame edge
  const out = [];
  for (const r of rings) {
    let cur = []; const on = ([x, y]) => x > 3 && x < W - 3 && y > 3 && y < H - 3;
    for (const p of r) { if (on(p)) cur.push(p); else { if (cur.length > 3) out.push(cur); cur = []; } }
    if (cur.length > 3) out.push(cur);
    if (out.length && r.every(on)) { out.pop(); out.push([...r, r[0]]); }
  }
  return out;
}
const clipAbove = g => { g.save(); g.beginPath(); g.moveTo(-20, -20); g.lineTo(W + 20, -20); BAND.slice().reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.clip(); };

export function frame(t) {
  const step = Math.floor(t * 12 + 1e-6), tq = step / 12;   // 12 drawings a second
  C.BOIL.step = step; C.BOIL.amp = 0;
  pose(tq);
  scene.updateMatrixWorld(true);
  const S = snap(N, scene, cam), SH = shapes(S);
  const layers = ['bg', 'ch', 'fg'].flatMap(k => LY[k]);
  layers.forEach(L => { C.clear(L); clipAbove(L.g); });
  const order = Object.keys(SH).map(Number).sort((a, b) => SH[b].n - SH[a].n);
  for (const r of order) {
    const g = REG[r], s = SH[r]; if (!g || !s.rings.length) continue;
    const [F, Ln] = LY[g.grp];
    const p = g.p * (1.05 - .25 * s.shade), anchor = anc(r);
    if (!g.nofill) C.fill(F, s.rings, { col: g.col, p, ang: g.ang, gap: g.gap, w: g.w, over: g.over, seed: r * 7.3, anchor, hand: 1, cross: g.cross, crossP: .55 });
    if (s.dark.length) C.fill(F, s.dark, { col: g.col, p: Math.min(1, g.p + .15), ang: g.ang + 1.1, gap: g.gap * .8, w: g.w * .9, over: 3, seed: r * 7.3 + 50, anchor });
    if (g.ow) openLines(s.rings).forEach((l, i) => C.line(Ln, l, { col: P.line, w: g.ow, p: .92, seed: r * 13 + i, closed: false, taper: .08 }));
  }
  faces(LY.ch[1], S);
  signs(LY.bg[1]); coverTitle(LY.fg[1]); pageDoodle(LY.fg[1]); rain(LY.fg[1], tq);
  layers.forEach(L => L.g.restore());
  comp.paperCam(0, 0, 1);
  comp.begin(PAPER, [0, 0]);
  const knock = regs => { const g = LY.knock.g; C.clear(LY.knock); g.imageSmoothingEnabled = true; g.drawImage(silhouette(S, regs, LY.sil), 0, 0, W, H); comp.knock(LY.knock.c, PAPER, [0, 0]); };
  const grpRegs = k => new Set(REG.filter(g => g && g.grp === k).map(g => g.id));
  comp.crayon(LY.bg[0].c, { goff: [0, 0] }); comp.crayon(LY.bg[1].c, { goff: [0, 0] });
  knock(grpRegs('ch')); comp.crayon(LY.ch[0].c, { goff: [0, 0] }); comp.crayon(LY.ch[1].c, { goff: [0, 0] });
  knock(grpRegs('fg')); comp.crayon(LY.fg[0].c, { goff: [0, 0] }); comp.crayon(LY.fg[1].c, { goff: [0, 0] });
  if (words(tq)) comp.crayon(LY.tx.c, { goff: [0, 0] });
  comp.finish({ vig: .24, emb: .55, poff: [0, 0] });
}
