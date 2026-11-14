// Motion test on the user's own images: a slow push per shot, the lamp flickering, dust in the light, film grain, a vignette.
const W = 1080, H = 1920, c = document.getElementById('c'), g = c.getContext('2d');
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const ss = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const SHOTS = [   // [image, from zoom, to zoom, focus x, focus y (0..1 of the image)]
  ['renard-2', 1.0, 1.12, .5, .45], ['mouton-content', 1.12, 1.0, .5, .55], ['mouton-triste', 1.0, 1.15, .5, .5], ['renard-1', 1.1, 1.0, .45, .45],
];
const D = 3;
const IMG = {}; await Promise.all(SHOTS.map(s => new Promise(r => { const i = new Image(); i.onload = r; i.src = 'img/' + s[0] + '.png'; IMG[s[0]] = i; })));
function render(t) {
  const k = Math.min(SHOTS.length - 1, Math.floor(t / D)), u = (t - k * D) / D, [name, z0, z1, fx, fy] = SHOTS[k], im = IMG[name];
  const base = Math.max(W / im.width, H / im.height), z = base * (z0 + (z1 - z0) * ss(u));
  const w = im.width * z, h = im.height * z, x = W / 2 - fx * w + (fx - .5) * 0, y = H / 2 - fy * h;
  const cx = Math.min(0, Math.max(W - w, x)), cy = Math.min(0, Math.max(H - h, y));
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(im, cx, cy, w, h);
  // the lamp: its light breathes and flickers a little
  const lx = cx + .52 * w, ly = cy + .17 * h, fl = .85 + .1 * Math.sin(t * 7) + .06 * (hash(Math.floor(t * 12)) - .5);
  const rg = g.createRadialGradient(lx, ly, 10, lx, ly, 900 * z / base); rg.addColorStop(0, `rgba(255,200,120,${.22 * fl})`); rg.addColorStop(1, 'rgba(255,200,120,0)');
  g.globalCompositeOperation = 'screen'; g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // dust floating in the cone of light
  for (let i = 0; i < 60; i++) { const a = hash(i), b = hash(i + 50), yy = ly + 100 + ((b * 1200 + t * (20 + a * 30)) % 1200), xx = lx + (a - .5) * (yy - ly) * 1.1 + Math.sin(t + i) * 10;
    g.fillStyle = `rgba(255,230,190,${.35 * hash(i + 9)})`; g.beginPath(); g.arc(xx, yy, 1.5 + 2 * hash(i + 3), 0, 6.283); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  // grain, a scratch now and then, vignette, fades between shots
  for (let i = 0; i < 1800; i++) { const f = Math.floor(t * 24); g.fillStyle = `rgba(${hash(i + f) > .5 ? '255,235,210' : '20,10,0'},${.07 * hash(i * 1.3 + f)})`; g.fillRect(hash(i * 3.1 + f) * W, hash(i * 7.7 + f) * H, 2, 2); }
  if (hash(Math.floor(t * 24) * 1.7) > .93) { g.fillStyle = 'rgba(255,240,220,.25)'; g.fillRect(hash(Math.floor(t * 24)) * W, 0, 2, H); }
  const v = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,5,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  const fade = Math.min(1, (t - k * D) / .15, ((k + 1) * D - t) / .15); if (fade < 1) { g.fillStyle = `rgba(0,0,0,${1 - Math.max(0, fade)})`; g.fillRect(0, 0, W, H); }
}
window.render = render; window.DUR = SHOTS.length * D;
render(parseFloat(new URLSearchParams(location.search).get('t') ?? '1')); window.READY = true;
