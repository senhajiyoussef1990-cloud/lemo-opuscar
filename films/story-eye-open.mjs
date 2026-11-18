// Capture une couverture au moment du carton de titre, sans clignements.
// Remplace une seule image Story sans recalculer les milliers de frames video.
import fs from 'fs';
import path from 'path';
import { openDemo, closeServer, glLost } from '../core/render/page.mjs';
const [dir, out] = process.argv.slice(2);
if (!dir || !out) throw Error('Usage: node films/story-eye-open.mjs <film> <sortie.jpg>');
fs.mkdirSync(path.dirname(out), {recursive:true});
const {browser,page} = await openDemo(dir, {w:1080,h:1920,q:'cover=1',warnings:true});
const chosen = await page.evaluate(() => {
  const shot = window.SHOTS.find(s => s[3] === 'home' && s[4] === 'TITLE');
  if (!shot) throw Error('Le plan home.TITLE est absent');
  const t = shot[0] + Math.min(1.25, (shot[1] - shot[0]) * .58);
  window.render(t);
  return {t,shot};
});
await page.screenshot({path:out,type:'jpeg',quality:95});
const lost=await glLost(page);
await browser.close();
closeServer();
if (lost) { fs.rmSync(out,{force:true}); throw Error('WebGL perdu lors de la capture'); }
console.log('Story eyes-open OK',out,JSON.stringify(chosen));
