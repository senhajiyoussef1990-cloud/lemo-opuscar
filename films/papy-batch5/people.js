// people.js — background figures with a real shape (head, face, neck, body, arms, hands, legs, shoes), dressed by period.
// figure(x, y, s, t, { era, ... }) — origin at the feet, y down; face = 1 looks right. All original, generic people of each time.
import { hash, TAU } from '/core/lib.js';
import { push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot } from './toon.js';
import { eye, mouth, hand } from './chars.js';

// period wardrobes: body shape + colours + hat
export const LOOK = {
  antique:  { top: '#f1e3c2', topS: '#d6c3a0', long: true, belt: '#c22f3a', hat: 'wrap', hatC: '#e9d7a8', shoe: '#8a5a34', legs: '#a8714a' },
  chinese:  { top: '#2f8a6a', topS: '#226a52', long: true, belt: '#e9b949', hat: 'cone', hatC: '#d9b870', shoe: '#2a2430', legs: '#2a2430', sleeves: 1 },
  georgian: { top: '#7a2a2a', topS: '#5a1e1e', vest: '#e9d7a8', breeches: '#3a3340', hose: '#f4f1ea', hat: 'tricorn', hatC: '#2a2430', shoe: '#2a2430', wig: '#f4f1ea' },
  guard18:  { top: '#c22f3a', topS: '#9a1f2a', vest: '#f4f1ea', breeches: '#f4f1ea', hose: '#2a2430', hat: 'tricorn', hatC: '#2a2430', shoe: '#2a2430', belt: '#f4f1ea' },
  victorian:{ top: '#2a2430', topS: '#1d1820', vest: '#8a3a3a', pants: '#4a4250', hat: 'tophat', hatC: '#1d1820', shoe: '#1d1820', tie: '#f4f1ea' },
  vlady:    { top: '#7b4fd1', topS: '#5a38a8', dress: 1, hat: 'bonnet', hatC: '#f1e3c2', shoe: '#2a2430', shawl: '#e9b949' },
  thirties: { top: '#5a4a3a', topS: '#4a3a2c', pants: '#5a4a3a', hat: 'fedora', hatC: '#3a2f28', shoe: '#2a1d14', tie: '#c22f3a', shirt: '#f4f1ea' },
  t_lady:   { top: '#c22f3a', topS: '#9a1f2a', dress: 1, hat: 'cloche', hatC: '#2a2430', shoe: '#2a2430' },
  fifties:  { top: '#3fb6e8', topS: '#2a8fc2', pants: '#3a3340', shoe: '#2a2430', shirt: '#f4f1ea', hair: 'quiff' },
  f_lady:   { top: '#ff7a9a', topS: '#e05a7a', dress: 1, skirt: 'flare', shoe: '#e8452f', hair: 'pony' },
  lab:      { top: '#f8f7f2', topS: '#d5d8e0', pants: '#4a4250', shoe: '#2a2430', shirt: '#3fb6e8', glasses: 1 },
  monk:     { top: '#7a4a24', topS: '#5b341d', long: true, belt: '#e9d7a8', hat: 'hood', hatC: '#6b3a1e', shoe: '#3a2414', legs: '#7a4a24', sleeves: 1 },
  medieval: { top: '#3f7f9a', topS: '#2f6a80', long: true, belt: '#7a4a24', hat: 'coif', hatC: '#c22f3a', shoe: '#5b341d', legs: '#5a4a3a' },
  swim:     { top: '#e8452f', topS: '#c22f3a', pants: '#e8452f', shoe: '#e7b48c', legs: '#e7b48c', stripes: '#ffffff' },
  modern:   { top: '#2fbf9b', topS: '#24997c', pants: '#2c3550', shoe: '#ffffff', hood: 1 },
  m_lady:   { top: '#ffcf3a', topS: '#e0b020', pants: '#3f5bd6', shoe: '#ffffff', hair: 'bun' },
};
export const FIG_K = 1.75;
export const VIEW = { ins: false };   // in a close-up on the object, passers-by in the far background are not drawn
export function figure(x, y, s, t, o = {}) {
  if (VIEW.ins && o.walk) return;
  const L = { ...LOOK[o.era || 'modern'], ...o }, f = o.face ?? 1, skin = o.skin || '#e7b48c', skinS = o.skinS || 'rgba(0,0,0,.14)', hairC = o.hairC || '#3a2416';
  const walk = o.walk ? Math.sin(t * 8 + x) : 0, bob = o.walk ? Math.abs(Math.cos(t * 8 + x)) * 4 : 0;
  s *= FIG_K;   // background people at the scale of the leads (Papy ≈ 720, an adult figure ≈ 450 × s × FIG_K)
  push(); translate(x, y - bob); scale(s * f, s);
  // legs and shoes
  const legC = L.hose || L.pants || L.legs || '#2c3550';
  for (const k of [-1, 1]) { const sw = walk * 18 * k;
    if (!L.long && !L.dress) shape(noodle([k * 18, -200], [k * 20 + sw, -24], 0, 30, 26), { fill: L.breeches && k ? legC : legC, lw: 5 });
    else shape(noodle([k * 14, -90], [k * 16 + sw, -24], 0, 22, 20), { fill: legC, lw: 5 });
    shape(spline([[k * 16 + sw - 22, -6], [k * 16 + sw - 18, -28], [k * 16 + sw + 18, -30], [k * 16 + sw + 34, -12], [k * 16 + sw + 30, 0]]), { fill: L.shoe, lw: 5 }); }
  if (L.breeches) shape(spline([[-40, -270], [40, -270], [44, -160], [8, -150], [0, -190], [-8, -150], [-44, -160]]), { fill: L.breeches, lw: 5 });
  // back arm
  const armA = o.arms ?? 0, swing = walk * .5;
  const arm = (k, front) => { const sh = [k * 50, -330], a = (k > 0 ? swing : -swing) + armA * (front ? 1 : 0), hp = [sh[0] + Math.sin(a) * 40 + k * 8, sh[1] + Math.cos(a) * 130];
    shape(noodle(sh, hp, -k * 8, L.sleeves ? 34 : 26, L.sleeves ? 40 : 22), { fill: L.top, lw: 5 }); hand(hp[0], hp[1] + 8, Math.PI / 2, 13, skin, { lw: 4 }); };
  if (!o.hideBackArm) arm(-1, false);
  // body: dress, robe/tunic or coat
  if (L.dress) { shape(spline(L.skirt === 'flare' ? [[-34, -330], [34, -330], [46, -220], [110, -70], [0, -56], [-110, -70], [-46, -220]] : [[-34, -330], [34, -330], [48, -220], [80, -20], [0, -10], [-80, -20], [-48, -220]]), { fill: L.top, lw: 6, shade: () => fillOnly(rect(20, -340, 80, 340), L.topS, { boil: .3 }) }); if (L.shawl) shape(spline([[-46, -330], [46, -330], [52, -270], [0, -240], [-52, -270]]), { fill: L.shawl, lw: 5 }); }
  else if (L.long) { shape(spline([[-38, -340], [38, -340], [54, -220], [62, -80], [0, -70], [-62, -80], [-54, -220]]), { fill: L.top, lw: 6, shade: () => fillOnly(rect(24, -350, 70, 300), L.topS, { boil: .3 }) }); if (L.belt) shape(rr(-52, -230, 104, 16, 4), { fill: L.belt, lw: 4 }); }
  else { shape(spline([[-42, -340], [42, -340], [50, -220], [48, -180], [0, -172], [-48, -180], [-50, -220]]), { fill: L.top, lw: 6, shade: () => fillOnly(rect(24, -350, 60, 190), L.topS, { boil: .3 }) });
    if (L.vest) shape([[-18, -336], [18, -336], [22, -190], [-22, -190]], { fill: L.vest, lw: 4 });
    if (L.shirt) shape([[-14, -338], [14, -338], [0, -296]], { fill: L.shirt, lw: 4 });
    if (L.tie) shape(spline([[-6, -330], [6, -330], [8, -266], [0, -254], [-8, -266]]), { fill: L.tie, lw: 3 });
    if (L.hood) shape(spline([[-40, -344], [0, -360], [40, -344], [30, -330], [-30, -330]]), { fill: L.topS, lw: 4 });
    if (L.belt) stroke([[-46, -250], [46, -250]], 6, { line: L.belt });
    if (L.stripes) for (let k = 0; k < 4; k++) stroke([[-46, -320 + k * 36], [46, -320 + k * 36]], 6, { line: L.stripes }); }
  // neck and head
  shape(rr(-10, -362, 20, 30, 6), { fill: skin, lw: 4 });
  push(); translate(4, -404);
  if (L.wig) shape(spline([[-44, -30], [0, -50], [40, -30], [46, 10], [30, 26], [-40, 26], [-48, 10]]), { fill: L.wig, lw: 5 });
  shape(ell(0, 0, 38, 42, 24), { fill: skin, lw: 5, shade: () => fillOnly(ell(24, 10, 20, 30, 14), skinS, { boil: .3 }) });
  if (!L.hat || L.hat === 'cap' || L.hat === 'cloche') { const hr = L.hair || 'short';
    if (hr === 'short') shape([...arc(0, -6, 40, 40, Math.PI * 1.05, Math.PI * 1.95, 14), [36, -14], [-36, -10]], { fill: hairC, lw: 4 });
    if (hr === 'quiff') shape(spline([[-38, -8], [-30, -40], [10, -58], [44, -44], [36, -14]]), { fill: hairC, lw: 4 });
    if (hr === 'pony') { shape([...arc(0, -6, 40, 40, Math.PI * 1.05, Math.PI * 1.95, 14), [36, -14], [-36, -10]], { fill: hairC, lw: 4 }); shape(spline([[-34, -20], [-62, 0], [-56, 40], [-40, 10]]), { fill: hairC, lw: 4 }); }
    if (hr === 'bun') { shape([...arc(0, -6, 40, 40, Math.PI * 1.05, Math.PI * 1.95, 14), [36, -14], [-36, -10]], { fill: hairC, lw: 4 }); shape(ell(-10, -48, 18, 16, 12), { fill: hairC, lw: 4 }); } }
  eye(14, -4, 7, 8, { lid: o.lid ?? .15, skin, lw: 3, pupil: 2.6, look: [.5, 0] });
  if (L.glasses) { stroke(ell(14, -4, 11, 10, 12), 3); stroke([[3, -4], [-20, -8]], 3); }
  shape(spline([[28, -2], [42, 10], [30, 16]]), { fill: skin, lw: 4 });
  mouth(22, 22, 16, { o: 0, sm: o.sm ?? .3, lw: 3 });
  if (o.beardC) shape(spline([[-20, 10], [36, 14], [30, 40], [0, 50], [-24, 34]]), { fill: o.beardC, lw: 4 });
  // hats
  const hc = L.hatC;
  if (L.hat === 'tophat') { shape(rr(-30, -100, 60, 70, 4), { fill: hc, lw: 4 }); shape(rr(-46, -34, 92, 10, 4), { fill: hc, lw: 4 }); }
  if (L.hat === 'tricorn') shape([[-52, -26], [0, -56], [52, -26], [30, -36], [0, -30], [-30, -36]], { fill: hc, lw: 4 });
  if (L.hat === 'fedora') { shape(spline([[-30, -28], [-24, -64], [24, -64], [30, -28]]), { fill: hc, lw: 4 }); shape(rr(-50, -32, 100, 10, 5), { fill: hc, lw: 4 }); stroke([[-28, -38], [28, -38]], 4, { line: '#c22f3a' }); }
  if (L.hat === 'cone') shape([[-70, -14], [0, -70], [70, -14]], { fill: hc, lw: 4 });
  if (L.hat === 'wrap') shape(spline([[-42, -10], [-40, -44], [0, -56], [40, -44], [42, -10], [0, -24]]), { fill: hc, lw: 4 });
  if (L.hat === 'bonnet') shape(spline([[-44, 20], [-50, -30], [0, -54], [44, -34], [30, -14], [-20, -10], [-30, 24]]), { fill: hc, lw: 4 });
  if (L.hat === 'cloche') shape(spline([[-42, -4], [-38, -40], [0, -52], [38, -40], [42, -4], [0, -16]]), { fill: hc, lw: 4 });
  if (L.hat === 'hood') shape(spline([[-48, 30], [-52, -30], [0, -60], [48, -34], [44, 20], [30, -10], [-20, -20], [-36, 30]]), { fill: hc, lw: 4 });
  if (L.hat === 'coif') shape(spline([[-42, -6], [-30, -50], [20, -54], [44, -30], [40, -6], [0, -20]]), { fill: hc, lw: 4 });
  if (L.hat === 'cap') { shape([...arc(0, -10, 40, 30, Math.PI, TAU, 12), [60, -10], [-40, -10]], { fill: hc, lw: 4 }); }
  pop();
  // The workshop actor has exactly one controlled working arm.
  // Keep the other arm already drawn behind the torso; never superimpose a third.
  if (!o.hideFrontArm) { const sh = [50, -330], a = swing + armA, hp = [sh[0] + Math.sin(a) * 40 + 8, sh[1] + Math.cos(a) * 130];
    shape(noodle(sh, hp, -8, L.sleeves ? 34 : 26, L.sleeves ? 40 : 22), { fill: L.top, lw: 5 }); if (o.hold) o.hold(hp[0], hp[1]); hand(hp[0], hp[1] + 8, Math.PI / 2, 13, skin, { lw: 4, fist: !!o.hold }); }
  pop();
}
