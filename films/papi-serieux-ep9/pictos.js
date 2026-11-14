// pictos.js — small inked pictograms for phone screens (a thumb, a heart, a fish, a tractor, an umbrella, a smiley). (x, y) = centre, s = half-width.
import * as T from './toon.js';
import { P } from './parts.js';
const { shape, stroke, ell, arc, rr, push, pop, translate, rotate, scale } = T;
const INK = { fill: P.ink, stroke: false, boil: .3 };
export function heartPts(cx, cy, s) { const q = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; q.push([cx + s * Math.pow(Math.sin(a), 3), cy - s * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]); } return q; }
export const PICTO = {
  heart(x, y, s) { shape(heartPts(x, y, s), INK); },
  thumb(x, y, s) {
    push(); translate(x, y); scale(s / 10);
    shape(rr(-9, -2, 15, 12, 3), INK); shape(rr(-3, -11, 6, 12, 3), INK); shape(rr(-11, -1, 3.5, 11, 1), { fill: P.dmid, stroke: false, boil: .3 });
    pop();
  },
  fish(x, y, s) { shape(ell(x - s * .15, y, s * .75, s * .42, 16), INK); shape([[x + s * .45, y], [x + s, y - s * .42], [x + s, y + s * .42]], INK); T.dot(x - s * .5, y - s * .1, s * .09, P.white); },
  tractor(x, y, s) {
    shape(rr(x - s * .1, y - s * .7, s * .7, s * .75, s * .08), INK); shape(rr(x - s * .95, y - s * .25, s * .95, s * .4, s * .06), INK);
    shape(rr(x - s * .8, y - s * .75, s * .12, s * .5, 1), INK);
    shape(ell(x + s * .35, y + s * .3, s * .48, s * .48, 16), INK); shape(ell(x - s * .6, y + s * .45, s * .3, s * .3, 12), INK);
    T.dot(x + s * .35, y + s * .3, s * .16, P.white); T.dot(x - s * .6, y + s * .45, s * .1, P.white);
  },
  umbrella(x, y, s) { shape([...arc(x, y - s * .1, s, s * .8, Math.PI, Math.PI * 2, 14)], INK); stroke([[x, y - s * .1], [x, y + s * .7], [x - s * .18, y + s * .88], [x - s * .36, y + s * .7]], Math.max(1.5, s * .13) * (T.zoom()), { boil: .3 }); },
  vocal(x, y, s) {   // a voice message: a play triangle and its waveform
    shape([[x - s, y - s * .5], [x - s * .35, y], [x - s, y + s * .5]], INK);
    [.35, .8, .5, 1, .6, .3].forEach((h, i) => shape(rr(x - s * .15 + i * s * .2, y - s * h * .55, s * .11, s * h * 1.1, 1), INK));
  },
  smiley(x, y, s) { shape(ell(x, y, s, s, 20), { fill: P.white, lw: Math.max(1.5, s * .12 * T.zoom()), boil: .3 }); T.dot(x - s * .35, y - s * .25, s * .13); T.dot(x + s * .35, y - s * .25, s * .13); stroke(arc(x, y + s * .1, s * .5, s * .4, .2, Math.PI - .2, 8), Math.max(1.5, s * .12 * T.zoom()), { boil: .3 }); },
};
