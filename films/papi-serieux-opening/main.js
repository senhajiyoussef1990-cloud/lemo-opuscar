// main.js — « Papi, sérieux ? »: the 1.5 s opening, and the per-episode title card (a still).
//   opening:     index.html                         (window.render(t), t in 0…1.5)
//   title card:  index.html?card=1&n=3&title=Les%20likes   (a still; make-card.sh renders it)
// Papi and Léo are the rigs of episode 3 (people.js, unchanged); the film damage is the series' film.js. ?clean=1 hides the damage.
import * as T from './toon.js';
import { P } from './parts.js';
import { papi, leo } from './people.js';
import { makeFilm, post } from './film.js';
import { clamp, lerp, seg, ss, back, TAU } from '/core/lib.js';

const DUR = 1.5, TITLE = 'Papi, sérieux ?', FONT = '"IM Fell English SC"';
const cv = document.getElementById('c'), Q = new URLSearchParams(location.search), CARD = Q.get('card') === '1';
await document.fonts.ready; for (const f of [`104px ${FONT}`, '60px Limelight']) await document.fonts.load(f);
const F = makeFilm(cv), sg = F.sg; T.init(F.scene);
const twos = t => Math.floor(t * 12 + 1e-6) / 12;

// the wave: two there-and-backs between 0.3 and 1.2 s, then the hands hold, raised
const wave = t => t < .3 || t > 1.2 ? 0 : Math.sin(TAU * 2 * (t - .3) / .9);
const bob = t => t < .3 || t > 1.2 ? 0 : Math.abs(Math.sin(TAU * 2 * (t - .3) / .9));

// the medallion: rays, Papi and Léo as busts, a thick border. C = { x, y, R }; everything scales with R (drawn for R = 455)
function medallion(t, C) {
  const tq = twos(t), open = t < .3 ? back(seg(t, 0, .3), 2.2) : 1;   // iris from the centre, with a small overshoot
  if (open <= 0.001) return;
  const f = C.R / 455, R = C.R * open, X = x => C.x + (x - 540) * f, Y = y => C.y + (y - 1040) * f;
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.beginPath(); sg.arc(C.x, C.y, R, 0, TAU); sg.clip();
  sg.fillStyle = P.dmid; sg.fillRect(0, 0, 1080, 1920);
  sg.translate(C.x, C.y + 60 * f); sg.rotate(Math.floor(t * 12) * .018); sg.fillStyle = P.light;
  for (let i = 0; i < 12; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.arc(0, 0, 1200, i * TAU / 12, i * TAU / 12 + TAU / 24); sg.closePath(); sg.fill(); }
  sg.setTransform(1, 0, 0, 1, 0, 0);
  T.frame(t); T.transform(open, 0, 0, open, C.x * (1 - open), C.y * (1 - open));
  const w = wave(tq), b = bob(tq), up = ss(seg(tq, .08, .3)), sq = 1 + .035 * b, K = 1.75 * f;
  leo({
    x: X(370), y: Y(1548 - 12 * b), k: K, seated: true, sy: sq, sx: 1 - (sq - 1) * .6, turn: 0, look: { lx: 0, ly: -.05 }, eyes: 'open', brows: 'up', mouth: { type: 'grin' },
    hair: .15 * b, phones: 3 * b, phone: { rot: -.12, n: 3 },
    armA: { x: -34, y: -130, front: true, hand: 'grab' },
    armB: { x: lerp(52, 62 + 13 * w, up), y: lerp(-88, -318, up), front: false, hand: 'open', rot: -Math.PI / 2 + .1 + .32 * w, bend: 16 },
  });
  papi({
    x: X(705), y: Y(1626 - 12 * b), k: K, seated: true, sy: sq, sx: 1 - (sq - 1) * .6, turn: 0, look: { lx: 0, ly: -.05 }, lid: .12, stache: .85,
    brows: [{ raise: .3 }, { raise: .3 }],
    armA: { x: -30, y: -124 },   // tucked behind him
    armB: { x: lerp(74, 116 + 13 * w, up), y: lerp(-130, -296, up), front: true, hand: 'open', rot: -Math.PI / 2 + .1 + .32 * w, bend: 18 },
  });
  sg.restore();
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0);
  for (const [lw, col] of [[40, P.ink], [26, P.white]]) { sg.lineWidth = lw * f * Math.min(1, open); sg.strokeStyle = col; sg.beginPath(); sg.arc(C.x, C.y, R, 0, TAU); sg.stroke(); }
  sg.lineWidth = 3; sg.strokeStyle = P.ink; sg.beginPath(); sg.arc(C.x, C.y, R, 0, TAU); sg.stroke();
  sg.restore();
}

// the series title on an arc above the circle, in the subtitles' type; in the opening it bounces in between 0.4 and 0.8 s
function title(t, C) {
  const k = seg(t, .4, .8); if (k <= 0) return;
  const f = C.R / 455, s = k < 1 ? back(Math.min(1, k * 1.25), 2.6) * (1 + .06 * Math.sin(k * Math.PI * 3) * (1 - k)) : 1;
  const size = 112 * f, Rt = C.R + 74 * f;
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0);
  sg.translate(C.x, C.y - Rt); sg.scale(s, s); sg.translate(-C.x, -(C.y - Rt));
  sg.font = `${size}px ${FONT}`; sg.textAlign = 'center'; sg.textBaseline = 'alphabetic'; sg.lineJoin = 'round';
  const chars = [...TITLE], ws = chars.map(c => sg.measureText(c).width + 3 * f), total = ws.reduce((a, c) => a + c, 0);
  let a = -Math.PI / 2 - total / Rt / 2;
  chars.forEach((ch, i) => {
    const mid = a + ws[i] / Rt / 2; a += ws[i] / Rt;
    sg.save(); sg.translate(C.x + Math.cos(mid) * Rt, C.y + Math.sin(mid) * Rt); sg.rotate(mid + Math.PI / 2);
    sg.fillStyle = P.paper; sg.fillText(ch, 0, 0); sg.restore();
  });
  sg.restore();
}

// ———————————————————— the episode title card (a still) ————————————————————
const EP_N = Q.get('n') || '1', EP_TITLE = Q.get('title') || 'Titre', EP_WORD = Q.get('word') || 'Aujourd’hui';
function fit(text, font, size, maxW) { sg.font = `${size}px ${font}`; const w = sg.measureText(text).width; return w > maxW ? size * maxW / w : size; }
function card() {
  const C = { x: 540, y: 800, R: 318 };
  medallion(1.45, C); title(1.45, C);
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.fillStyle = P.paper; sg.strokeStyle = P.paper;
  // a period frame: double rule, dot-and-ring corners
  const x0 = 56, y0 = 206, w = 968, h = 1508;
  sg.lineWidth = 4; sg.beginPath(); sg.roundRect(x0, y0, w, h, 26); sg.stroke();
  sg.lineWidth = 1.6; sg.beginPath(); sg.roundRect(x0 + 13, y0 + 13, w - 26, h - 26, 18); sg.stroke();
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const ax = sx > 0 ? x0 + 44 : x0 + w - 44, ay = sy > 0 ? y0 + 44 : y0 + h - 44; sg.beginPath(); sg.arc(ax, ay, 6, 0, 7); sg.fill(); sg.lineWidth = 2.2; sg.beginPath(); sg.arc(ax, ay, 14, 0, 7); sg.stroke(); }
  // ÉPISODE N, between two rules
  const ep = `ÉPISODE  ${EP_N}`; sg.font = '66px Limelight'; const ew = sg.measureText(ep).width; sg.fillText(ep, 540, 1262);
  for (const s of [-1, 1]) { const xa = 540 + s * (ew / 2 + 34), xb = 540 + s * 400; sg.lineWidth = 3; sg.beginPath(); sg.moveTo(xa, 1256); sg.lineTo(xb, 1256); sg.stroke(); sg.lineWidth = 1.2; sg.beginPath(); sg.moveTo(xa, 1268); sg.lineTo(xb, 1268); sg.stroke(); sg.beginPath(); sg.arc(xb + s * 12, 1262, 5, 0, 7); sg.fill(); }
  // Aujourd'hui, then the episode's title
  sg.font = `58px ${FONT}`; sg.fillText(EP_WORD, 540, 1368);
  const tt = `« ${EP_TITLE} »`, size = fit(tt, FONT, 132, 850); sg.font = `${size}px ${FONT}`; sg.fillText(tt, 540, 1500);
  // a small flourish under the title
  sg.lineWidth = 3; sg.beginPath(); sg.moveTo(420, 1612); sg.lineTo(660, 1612); sg.stroke();
  sg.beginPath(); sg.moveTo(540, 1598); sg.lineTo(554, 1612); sg.lineTo(540, 1626); sg.lineTo(526, 1612); sg.closePath(); sg.fill();
  sg.restore();
}

window.DUR = DUR;
window.TEXTS = t => t >= .8 ? [{ id: 'title', text: TITLE, x0: 120, y0: 360, x1: 960, y1: 640, pass: true }] : [];
window.EV = [{ t: 0, type: 'iris' }, { t: .3, type: 'wave' }, { t: .4, type: 'title' }, { t: 1.2, type: 'hold' }];
window.render = t => {
  t = Math.min(Math.max(t, 0), DUR - 1e-4);
  sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#060606'; sg.fillRect(0, 0, 1080, 1920);
  if (CARD) card(); else { const C = { x: 540, y: 1040, R: 455 }; medallion(t, C); title(t, C); }
  post(F, CARD ? 3.1 + (parseInt(EP_N, 10) || 0) * 1.37 : t, { clean: Q.get('clean') === '1' });   // a card gets its own scratches and dust
};
window.READY = true;
