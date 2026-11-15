// print the shot list (t0 t1 shot world id) from the page: node tools/shots.mjs > shots.txt
import { openDemo, closeServer } from '../../../core/render/page.mjs';
const { browser, page } = await openDemo(new URL('..', import.meta.url).pathname, { w: 1080, h: 1920 });
const S = await page.evaluate(() => ({ s: window.SHOTS, d: window.DUR }));
for (const s of S.s) console.log(s[0].toFixed(2), s[1].toFixed(2), s[2], s[3], s[4]);
console.log('DUR', S.d);
await browser.close(); closeServer();
