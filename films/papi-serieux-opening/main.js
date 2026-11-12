// main.js — the 1.5 s opening of « Papi, sérieux ? »: a 1930s title-card medallion with Papi and Léo waving.
// Papi and Léo are the rigs of episode 3 (people.js, unchanged); the film damage is the series' film.js. ?clean=1 hides the damage.
import * as T from './toon.js';
import { P } from './parts.js';
import { papi, leo } from './people.js';
import { makeFilm, post } from './film.js';
import { clamp, lerp, seg, ss, back, TAU } from '/core/lib.js';

const DUR = 1.5, C = { x: 540, y: 1040, R: 455 }, K = 1.75, TITLE = 'Papi, sérieux ?', FONT = '"IM Fell English SC"';
const cv = document.getElementById('c'), Q = new URLSearchParams(location.search);
await document.fonts.ready; await document.fonts.load(`104px ${FONT}`);
const F = makeFilm(cv), sg = F.sg; T.init(F.scene);
const twos = t => Math.floor(t * 12 + 1e-6) / 12;

// the wave: two there-and-backs between 0.3 and 1.2 s, then the hands hold, raised
const wave = t => t < .3 || t > 1.2 ? 0 : Math.sin(TAU * 2 * (t - .3) / .9);
const bob = t => t < .3 || t > 1.2 ? 0 : Math.abs(Math.sin(TAU * 2 * (t - .3) / .9));

function medallion(t) {
  const tq = twos(t), open = t < .3 ? back(seg(t, 0, .3), 2.2) : 1;   // iris from the centre, with a small overshoot
  if (open <= 0.001) return;
  const R = C.R * open;
  // fan of light and dark rays, clipped to the circle
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.beginPath(); sg.arc(C.x, C.y, R, 0, TAU); sg.clip();
  sg.fillStyle = P.dmid; sg.fillRect(0, 0, 1080, 1920);
  sg.translate(C.x, C.y + 60); sg.rotate(Math.floor(t * 12) * .018); sg.fillStyle = P.light;
  for (let i = 0; i < 12; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.arc(0, 0, 1200, i * TAU / 12, i * TAU / 12 + TAU / 24); sg.closePath(); sg.fill(); }
  sg.setTransform(1, 0, 0, 1, 0, 0);
  // Papi and Léo, busts, clipped by the bottom of the circle only
  T.frame(t); T.transform(open, 0, 0, open, C.x * (1 - open), C.y * (1 - open));
  const w = wave(tq), b = bob(tq), up = ss(seg(tq, .08, .3)), sq = 1 + .035 * b;
  leo({
    x: 370, y: 1548 - 12 * b, k: K, seated: true, sy: sq, sx: 1 - (sq - 1) * .6, turn: 0, look: { lx: 0, ly: -.05 }, eyes: 'open', brows: 'up', mouth: { type: 'grin' },
    hair: .15 * b, phones: 3 * b, phone: { rot: -.12, n: 3 },
    armA: { x: -34, y: -130, front: true, hand: 'grab' },
    armB: { x: lerp(52, 62 + 13 * w, up), y: lerp(-88, -318, up), front: false, hand: 'open', rot: -Math.PI / 2 + .1 + .32 * w, bend: 16 },
  });
  papi({
    x: 705, y: 1626 - 12 * b, k: K, seated: true, sy: sq, sx: 1 - (sq - 1) * .6, turn: 0, look: { lx: 0, ly: -.05 }, lid: .12, stache: .85,
    brows: [{ raise: .3 }, { raise: .3 }],
    armA: { x: -30, y: -124 },   // tucked behind him
    armB: { x: lerp(74, 116 + 13 * w, up), y: lerp(-130, -296, up), front: true, hand: 'open', rot: -Math.PI / 2 + .1 + .32 * w, bend: 18 },
  });
  sg.restore();
  // thick border: ink, white band, ink
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0);
  for (const [lw, col] of [[40, P.ink], [26, P.white]]) { sg.lineWidth = lw * Math.min(1, open); sg.strokeStyle = col; sg.beginPath(); sg.arc(C.x, C.y, R, 0, TAU); sg.stroke(); }
  sg.lineWidth = 3; sg.strokeStyle = P.ink; sg.beginPath(); sg.arc(C.x, C.y, R, 0, TAU); sg.stroke();
  sg.restore();
}

// the title on an arc above the circle, in the subtitles' type; it bounces in between 0.4 and 0.8 s
function title(t) {
  const k = seg(t, .4, .8); if (k <= 0) return;
  const s = k < 1 ? back(Math.min(1, k * 1.25), 2.6) * (1 + .06 * Math.sin(k * Math.PI * 3) * (1 - k)) : 1;
  const size = 112, Rt = C.R + 74;
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0);
  sg.translate(C.x, C.y - Rt); sg.scale(s, s); sg.translate(-C.x, -(C.y - Rt));
  sg.font = `${size}px ${FONT}`; sg.textAlign = 'center'; sg.textBaseline = 'alphabetic'; sg.lineJoin = 'round';
  const chars = [...TITLE], ws = chars.map(c => sg.measureText(c).width + 3), total = ws.reduce((a, c) => a + c, 0);
  let a = -Math.PI / 2 - total / Rt / 2;
  chars.forEach((ch, i) => {
    const mid = a + ws[i] / Rt / 2; a += ws[i] / Rt;
    sg.save(); sg.translate(C.x + Math.cos(mid) * Rt, C.y + Math.sin(mid) * Rt); sg.rotate(mid + Math.PI / 2);
    sg.fillStyle = P.paper; sg.fillText(ch, 0, 0); sg.restore();
  });
  sg.restore();
}

window.DUR = DUR;
window.TEXTS = t => t >= .8 ? [{ id: 'title', text: TITLE, x0: 120, y0: 360, x1: 960, y1: 640, pass: true }] : [];
window.EV = [{ t: 0, type: 'iris' }, { t: .3, type: 'wave' }, { t: .4, type: 'title' }, { t: 1.2, type: 'hold' }];
window.render = t => {
  t = Math.min(Math.max(t, 0), DUR - 1e-4);
  sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#060606'; sg.fillRect(0, 0, 1080, 1920);
  medallion(t); title(t);
  post(F, t, { clean: Q.get('clean') === '1' });
};
window.READY = true;
