// main.js — « Papi, sérieux ? »: the 1.5 s opening, and the per-episode title card (a still).
//   opening:     index.html                         (window.render(t), t in 0…1.5)
//   title card:  index.html?card=1&n=3&title=Les%20likes   (a still; make-card.sh renders it)
//   title clip:  the same card as a 2 s clip (make-title.sh), placed between the opening and the episode by assemble.sh
//   outro (v3):  index.html?outro=1&text=…&cta=…&sub=…  (3 s: questions, Papi points at the follow button, Léo winks, iris)
//   outro:       index.html?outro=1&text=Demain%20%3A%20…  (3 s; make-outro.sh renders it, assemble.sh puts it after an episode)
// Papi and Léo are the rigs of episode 3 (people.js, unchanged); the film damage is the series' film.js. ?clean=1 hides the damage.
import * as T from './toon.js';
import { P } from './parts.js';
import { papi, leo } from './people.js';
import { glove, hose } from './parts.js';
import { makeFilm, post } from './film.js';
import { clamp, lerp, seg, ss, back, TAU } from '/core/lib.js';

const DUR = 1.5, TITLE = 'Papi, sérieux ?', FONT = '"IM Fell English SC"';
const cv = document.getElementById('c'), Q = new URLSearchParams(location.search), CARD = Q.get('card') === '1', OUTRO = Q.get('outro') === '1', OUT_TEXT = Q.get('text') || 'Demain : …', OUT_CTA = Q.get('cta') || '', OUT_SUB = Q.get('sub') || '', OUT_DUR = OUT_SUB ? 3.0 : OUT_CTA ? 4.0 : 3.0;   // sub: the follow line (3 s choreography)   // v2: a question for the viewer under tomorrow's
await document.fonts.ready; for (const f of [`104px ${FONT}`, '60px Limelight']) await document.fonts.load(f);
const F = makeFilm(cv), sg = F.sg; T.init(F.scene);
const twos = t => Math.floor(t * 12 + 1e-6) / 12;

// the wave: two there-and-backs between 0.3 and 1.2 s, then the hands hold, raised
const wave = t => t < .3 || t > 1.2 ? 0 : Math.sin(TAU * 2 * (t - .3) / .9);
const bob = t => t < .3 || t > 1.2 ? 0 : Math.abs(Math.sin(TAU * 2 * (t - .3) / .9));

// the medallion: rays, Papi and Léo as busts, a thick border. C = { x, y, R }; everything scales with R (drawn for R = 455)
function medallion(t, C, o = {}) {   // o.point 0..1: Papi stretches his arm out of the circle (drawn by pointArm); o.wink: Léo winks
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
    x: X(370), y: Y(1548 - 12 * b), k: K, seated: true, sy: sq, sx: 1 - (sq - 1) * .6, turn: 0, look: { lx: 0, ly: -.05 }, eyes: 'open', brows: 'up', mouth: { type: 'grin' }, wink: o.wink ? 1 : 0,
    hair: .15 * b, phones: 3 * b, phone: { rot: -.12, n: 3 },
    armA: { x: -34, y: -130, front: true, hand: 'grab' },
    armB: { x: lerp(52, 62 + 13 * w, up), y: lerp(-88, -318, up), front: false, hand: 'open', rot: -Math.PI / 2 + .1 + .32 * w, bend: 16 },
  });
  papi({
    x: X(705), y: Y(1626 - 12 * b), k: K, seated: true, sy: sq, sx: 1 - (sq - 1) * .6, turn: o.point ? .25 * o.point : 0, look: o.point ? { lx: .85 * o.point, ly: .35 * o.point } : { lx: 0, ly: -.05 }, lid: .12, stache: .85,
    brows: [{ raise: .3 }, { raise: o.point ? .3 + .7 * o.point : .3 }],
    armA: { x: -30, y: -124 },   // tucked behind him
    armB: o.point ? { x: 74, y: -130, front: false } : { x: lerp(74, 116 + 13 * w, up), y: lerp(-130, -296, up), front: true, hand: 'open', rot: -Math.PI / 2 + .1 + .32 * w, bend: 18 },
  });
  sg.restore();
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0);
  for (const [lw, col] of [[40, P.ink], [26, P.white]]) { sg.lineWidth = lw * f * Math.min(1, open); sg.strokeStyle = col; sg.beginPath(); sg.arc(C.x, C.y, R, 0, TAU); sg.stroke(); }
  sg.lineWidth = 3; sg.strokeStyle = P.ink; sg.beginPath(); sg.arc(C.x, C.y, R, 0, TAU); sg.stroke();
  sg.restore();
  if (o.point) pointArm(t, C, o.point, o.arrow || 0);
}

// Papi's arm out of the medallion, over its border, pointing down-right at the follow button; the arrow runs from his finger to it.
// TikTok's right-hand buttons start near x = 940: the arrow stops at x = 900, at the height of the profile picture (≈ 54 % of the screen).
export const FOLLOW = { x: 905, y: 1000 }, BUTTON = { x: 1010, y: 1056 };   // the arrow stops at FOLLOW, aimed at the profile picture / follow button
function pointArm(t, C, k, arrow) {
  const f = C.R / 455, K = 1.75 * f, sh = [C.x + (705 - 540) * f + 62 * K, C.y + (1626 - 1040) * f - 236 * K];
  const W = [lerp(sh[0] + 20, 772, k), lerp(sh[1] + 40, 858, k)], ang = lerp(-.4, Math.atan2(BUTTON.y - 858, BUTTON.x - 772), k);
  T.reset(); hose(sh, W, -60 * k, 15 * K, P.ink); glove(W[0], W[1], ang, 'point', 1.05 * K, { flip: true });
  if (arrow <= 0) return;
  const tip = [W[0] + Math.cos(ang) * 70 * K, W[1] + Math.sin(ang) * 70 * K], a0 = [tip[0] + 10, tip[1] + 8];
  const pts = T.quad(a0, [(a0[0] + FOLLOW.x) / 2 + 6, (a0[1] + FOLLOW.y) / 2 - 18], [FOLLOW.x, FOLLOW.y], 18), n = Math.max(2, Math.round(pts.length * clamp(arrow)));
  const ink = { boil: 1.3, line: P.paper };   // chalk-white ink: the outro sits on black
  T.stroke(pts.slice(0, n), 7, ink);
  if (arrow >= 1) { const e = pts[pts.length - 1], d = pts[pts.length - 3], a = Math.atan2(e[1] - d[1], e[0] - d[0]); for (const s of [-1, 1]) T.stroke([[e[0] - Math.cos(a + s * .55) * 34, e[1] - Math.sin(a + s * .55) * 34], e], 7, ink); }
}
// a period cartouche (the subtitles' plate) above the circle
function cartouche(text, cy, k) {
  if (k <= 0) return;
  const s = k < 1 ? back(k, 2.4) : 1, size = 46, lines = wrap(text, FONT, size, 680);
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(540, cy); sg.scale(s, s); sg.translate(-540, -cy);
  sg.font = `${size}px ${FONT}`; sg.textAlign = 'center'; sg.textBaseline = 'middle';
  const tw = Math.max(...lines.map(l => sg.measureText(l).width)), w = tw + size * 1.8, h = size * (lines.length * 1.2 + .9), x0 = 540 - w / 2, y0 = cy - h / 2;
  sg.fillStyle = '#1E1C1A'; sg.beginPath(); sg.roundRect(x0, y0, w, h, 12); sg.fill();
  sg.strokeStyle = P.paper; sg.lineWidth = 2.4; sg.beginPath(); sg.roundRect(x0 + 8, y0 + 8, w - 16, h - 16, 9); sg.stroke();
  sg.lineWidth = 1.1; sg.beginPath(); sg.roundRect(x0 + 14, y0 + 14, w - 28, h - 28, 7); sg.stroke();
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const ax = sx > 0 ? x0 + 14 : x0 + w - 14, ay = sy > 0 ? y0 + 14 : y0 + h - 14; sg.fillStyle = P.paper; sg.beginPath(); sg.arc(ax + sx * 8, ay + sy * 8, 3.4, 0, 7); sg.fill(); sg.lineWidth = 1.5; sg.beginPath(); sg.arc(ax + sx * 8, ay + sy * 8, 8, 0, 7); sg.stroke(); }
  sg.fillStyle = P.paper; lines.forEach((l, i) => sg.fillText(l, 540, cy + (i - (lines.length - 1) / 2) * size * 1.2 + size * .05));
  sg.restore();
  return { x0, x1: x0 + w, y0, y1: y0 + h };
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
function card(t = 1) {
  const C = { x: 540, y: 800, R: 318 };
  medallion(1.45, C); title(1.45, C);
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.fillStyle = P.paper; sg.strokeStyle = P.paper;
  // a period frame: double rule, dot-and-ring corners
  const x0 = 56, y0 = 206, w = 968, h = 1508;
  sg.lineWidth = 4; sg.beginPath(); sg.roundRect(x0, y0, w, h, 26); sg.stroke();
  sg.lineWidth = 1.6; sg.beginPath(); sg.roundRect(x0 + 13, y0 + 13, w - 26, h - 26, 18); sg.stroke();
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const ax = sx > 0 ? x0 + 44 : x0 + w - 44, ay = sy > 0 ? y0 + 44 : y0 + h - 44; sg.beginPath(); sg.arc(ax, ay, 6, 0, 7); sg.fill(); sg.lineWidth = 2.2; sg.beginPath(); sg.arc(ax, ay, 14, 0, 7); sg.stroke(); }
  // the lettering pops in (in the 2 s clip; the still is taken once it has landed)
  const pk = seg(t, .08, .4), ps = pk < 1 ? back(pk, 2.2) : 1; if (pk <= 0) { sg.restore(); return; }
  sg.translate(540, 1420); sg.scale(ps, ps); sg.translate(-540, -1420);
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

// ———————————————————— the outro (3 s): the medallion again, waving, and tomorrow's question ————————————————————
function frameRules() {
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = P.paper; sg.strokeStyle = P.paper;
  const x0 = 56, y0 = 206, w = 968, h = 1508;
  sg.lineWidth = 4; sg.beginPath(); sg.roundRect(x0, y0, w, h, 26); sg.stroke();
  sg.lineWidth = 1.6; sg.beginPath(); sg.roundRect(x0 + 13, y0 + 13, w - 26, h - 26, 18); sg.stroke();
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const ax = sx > 0 ? x0 + 44 : x0 + w - 44, ay = sy > 0 ? y0 + 44 : y0 + h - 44; sg.beginPath(); sg.arc(ax, ay, 6, 0, 7); sg.fill(); sg.lineWidth = 2.2; sg.beginPath(); sg.arc(ax, ay, 14, 0, 7); sg.stroke(); }
  sg.restore();
}
function wrap(text, font, size, maxW) {   // greedy wrap; the question mark and its space never start a line
  sg.font = `${size}px ${font}`; const words = text.replace(/ ([?!:;»])/g, '\u00a0$1').replace(/(«) /g, '$1\u00a0').split(' '), lines = [];
  let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (cur && sg.measureText(t).width > maxW) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
const at = (t, a, b) => t >= a && t < b;
// 2.6–3.0 s: iris closing on Léo's face (drawn last, over everything)
let IRIS = null;
function irisOut(t, C) { const k = seg(t, 2.62, 2.98); if (k <= 0) { IRIS = null; return; } const f = C.R / 455; IRIS = { x: C.x + (370 - 540) * f, y: C.y + (1548 - 1040) * f - 214 * 1.75 * f, r: k >= 1 ? 0 : 1500 * Math.pow(1 - k, 1.8) }; }
function drawIris() { if (!IRIS) return; sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#060606'; sg.beginPath(); sg.rect(0, 0, 1080, 1920); if (IRIS.r > 0) sg.arc(IRIS.x, IRIS.y, IRIS.r, 0, TAU, true); sg.fill('evenodd'); sg.restore(); }
function outro(t) {
  const C = OUT_CTA ? { x: 540, y: 690, R: 250 } : { x: 540, y: 790, R: 300 }, tw = t < .3 ? t : .3 + ((t - .3) % .9);   // they keep waving
  // with a follow line (OUT_SUB): 0–1.2 s the questions; 1.2–2.5 s Papi points at the follow button, the cartouche replaces the title; 2.5–3 s Léo winks, iris
  const pt = OUT_SUB ? back(seg(twos(t), 1.2, 1.45), 1.6) * (1 - ss(seg(twos(t), 2.5, 2.65))) : 0, wink = OUT_SUB && at(twos(t), 2.5, 2.85);
  frameRules(); medallion(tw, C, { point: pt, arrow: OUT_SUB ? seg(t, 1.45, 1.8) * (t < 2.5 ? 1 : 0) : 0, wink });
  if (!OUT_SUB || t < 1.2) title(1.45, C);
  if (OUT_SUB) { const kc = seg(t, 1.22, 1.5); window.__CART = cartouche(OUT_SUB, 338, kc); }
  if (OUT_SUB) irisOut(t, C);
  const k = seg(t, .3, .65); if (k <= 0) return;
  const s = k < 1 ? back(k, 2.4) : 1, i = OUT_TEXT.indexOf(':'), headTxt = i > 0 && i < 14 ? OUT_TEXT.slice(0, i).trim() : '', body = (headTxt ? OUT_TEXT.slice(i + 1) : OUT_TEXT).trim();
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(540, 1400); sg.scale(s, s); sg.translate(-540, -1400);
  sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.fillStyle = P.paper; sg.strokeStyle = P.paper;
  let y = OUT_CTA ? 1080 : 1262;
  if (headTxt) {
    const hd = headTxt.toUpperCase(); sg.font = '62px Limelight'; const ew = sg.measureText(hd).width; sg.fillText(hd, 540, y);
    for (const d of [-1, 1]) { const xa = 540 + d * (ew / 2 + 34), xb = 540 + d * 400; sg.lineWidth = 3; sg.beginPath(); sg.moveTo(xa, y - 6); sg.lineTo(xb, y - 6); sg.stroke(); sg.lineWidth = 1.2; sg.beginPath(); sg.moveTo(xa, y + 6); sg.lineTo(xb, y + 6); sg.stroke(); sg.beginPath(); sg.arc(xb + d * 12, y, 5, 0, 7); sg.fill(); }
    y += 118;
  } else y += 40;
  let size = OUT_CTA ? 84 : 96, lines = wrap(body, FONT, size, 840); while (lines.length > (OUT_CTA ? 2 : 3) && size > 56) { size -= 6; lines = wrap(body, FONT, size, 840); }
  sg.font = `${size}px ${FONT}`;
  if (OUT_CTA) { lines.forEach((l, j) => sg.fillText(l, 540, y + j * size * 1.12)); y += lines.length * size * 1.12; }
  else { sg.font = `${size}px ${FONT}`; lines.forEach((l, j) => sg.fillText(l, 540, y + (j + (3 - lines.length) * .5) * size * 1.12)); }
  sg.restore();
  if (!OUT_CTA) return;
  // the viewer's question: a short rule with a dot, then two lines; it pops in a little after
  const kc = OUT_SUB ? seg(t, .55, .85) : seg(t, .9, 1.25); if (kc <= 0) return;
  const sc = kc < 1 ? back(kc, 2.4) : 1, yc = Math.max(y + 34, 1430);
  sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.translate(540, yc + 90); sg.scale(sc, sc); sg.translate(-540, -(yc + 90));
  sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.fillStyle = P.paper; sg.strokeStyle = P.paper;
  sg.lineWidth = 3; sg.beginPath(); sg.moveTo(400, yc); sg.lineTo(680, yc); sg.stroke(); sg.beginPath(); sg.arc(540, yc, 7, 0, 7); sg.fill();
  let cs = 74, cl = wrap(OUT_CTA, FONT, cs, 820); while (cl.length > 2 && cs > 50) { cs -= 4; cl = wrap(OUT_CTA, FONT, cs, 820); }
  sg.font = `${cs}px ${FONT}`; cl.forEach((l, j) => sg.fillText(l, 540, yc + 74 + j * cs * 1.14));
  sg.restore();
}

const CARD_DUR = 2.0, LEN = OUTRO ? OUT_DUR : CARD ? CARD_DUR : DUR;
window.DUR = LEN;
window.TEXTS = t => t >= .8 ? [{ id: 'title', text: TITLE, x0: 120, y0: 360, x1: 960, y1: 640, pass: true }] : [];
window.EV = [{ t: 0, type: 'iris' }, { t: .3, type: 'wave' }, { t: .4, type: 'title' }, { t: 1.2, type: 'hold' }];
window.render = t => {
  t = Math.min(Math.max(t, 0), LEN - 1e-4);
  sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#060606'; sg.fillRect(0, 0, 1080, 1920);
  if (OUTRO) { outro(t); drawIris(); } else if (CARD) card(t); else { const C = { x: 540, y: 1040, R: 455 }; medallion(t, C); title(t, C); }
  post(F, CARD ? 3.1 + (parseInt(EP_N, 10) || 0) * 1.37 + t : t, { clean: Q.get('clean') === '1' });   // a card gets its own scratches and dust
};
window.READY = true;
