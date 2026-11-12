// main.js — entry point. ?mode=sheet renders the model sheet; default = the film. ?nosub=1 hides the title cards, ?clean=1 the film damage.
import * as T from './toon.js';
import { P } from './parts.js';
import { papi, leo, pan, crepe } from './people.js';
import { makeFilm, post } from './film.js';
import { paintKitchen } from './kitchen.js';
import * as S from './scenes.js';
import * as ST from './story.js';
const Q = new URLSearchParams(location.search), MODE = Q.get('mode') || 'film';
const cv = document.getElementById('c');
await document.fonts.ready;
for (const f of ['46px "IM Fell English SC"', '15px Limelight']) await document.fonts.load(f);
let draw;
if (MODE === 'sheet') {
  T.init(cv);
  draw = t => {
    const g = T.g; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = P.mid; g.fillRect(0, 0, 1080, 1920); T.frame(t);
    T.transform(1.25, 0, 0, 1.25, 0, 0);
    papi({ x: 180, y: 420, turn: 0, stache: 0 }); papi({ x: 440, y: 420, turn: -.7, lid: .5, stache: -.4, look: { lx: -.5, ly: .4 } }); papi({ x: 700, y: 420, turn: 0, stache: 1, brows: [{ raise: 1 }, { raise: 1 }], talk: .8, armA: { x: -122, y: -338, hand: 'open', rot: -1.8, k: 1.5, front: true, flip: true }, armB: { x: 122, y: -338, hand: 'open', rot: -1.3, k: 1.5, front: true } });
    papi({ x: 180, y: 860, turn: -.5, eyes: 'happy', stache: .8, brows: [{ tilt: .6 }, { tilt: .6 }] }); papi({ x: 440, y: 860, turn: 0, wink: 0, stache: .8, lid: .5 }); papi({ x: 700, y: 860, turn: -.75, look: { lx: -.3, ly: .6 }, armA: { x: -95, y: -205, hand: 'fist', rot: Math.PI, flip: false }, held: (x, y) => pan(x, y, -1, 0, 1, true) });
    leo({ x: 140, y: 1200, turn: 0, mouth: { type: 'smile' }, phone: {} }); leo({ x: 340, y: 1200, turn: .55, eyes: 'wide', brows: 'sad', mouth: { type: 'o' }, hair: .9, phone: {}, armA: { x: 40, y: -248, front: true }, armB: { x: 70, y: -210 } });
    leo({ x: 540, y: 1200, turn: .5, eyes: 'happy', mouth: { type: 'beam' }, headRot: -.14, hair: .5 }); leo({ x: 740, y: 1200, turn: .1, look: { lx: -.2, ly: .85 }, brows: 'flat', mouth: { type: 'flat' }, phone: { rot: .12 }, armA: { x: -20, y: -160, front: true }, armB: { x: 16, y: -176, hand: 'point', rot: 2.7, front: true } });
    leo({ x: 140, y: 1500, run: 1, runPh: 1, lean: .2, eyes: 'wide', brows: 'sad', mouth: { type: 'o' }, phone: {}, armA: { x: -8, y: -262 } }); leo({ x: 340, y: 1500, turn: .55, eyes: 'wide', brows: 'sad', talk: .4, look: { lx: .7, ly: -.5 }, armA: { x: -14, y: -104, hand: 'open', front: true }, armB: { x: 14, y: -104, front: true } });
    leo({ x: 540, y: 1500, turn: .5, brows: 'sad', mouth: { type: 'frown' }, phones: -7, hair: -.4, phone: {} });
    crepe(700, 1380, .6); crepe(700, 1460, 1.4);
  };
  window.DUR = 2;
} else {
  const lip = await (await fetch('lip.json')).json();
  const F = makeFilm(cv); T.init(F.scene);
  const bg = paintKitchen();
  T.init(F.scene); S.initScenes(bg, F.sg, lip);
  const nosub = Q.get('nosub') === '1', clean = Q.get('clean') === '1';
  draw = t => {
    t = Math.min(Math.max(t, 0), ST.DUR - 1e-4);
    const sg = F.sg; sg.setTransform(1, 0, 0, 1, 0, 0); sg.fillStyle = '#000'; sg.fillRect(0, 0, 1080, 1920);
    S.drawScene(t, nosub);
    const f = Math.round(t * 24), jump = ST.CUTS.some(c => Math.round(c * 24) === f) ? 3 : 0;   // the gate jumps on every cut
    post(F, t, { jump, clean });
  };
  window.DUR = ST.DUR;
  window.SUBS = ST.SUBS.map(s => ({ t0: s[0], t1: s[1], text: s.slice(2).join(' ') }));
  window.EV = ST.buildEvents();
}
window.render = t => draw(t);
window.READY = true;
