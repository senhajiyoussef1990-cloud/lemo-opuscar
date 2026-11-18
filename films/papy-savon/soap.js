// Le Livre de Papy — « L'histoire du savon »
// Sept lieux historiques distincts, personnages habillés d'époque, savon en gros plan.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, dot, text } from './toon.js';
import { figure, VIEW } from './people.js';
import { FLOOR, portal, GLOW, ground } from './worlds.js';
export { VIEW, FLOOR, portal, GLOW };
export const darkness = () => 0;
export const SUN = { on:false };
const X0=-900, X1=2000;
const pale='#fff0cd', brown='#795038', ink='#2f242d';
const tile=(x,y,w,h,c='#dbc4a4')=>shape(rr(x,y,w,h,6),{fill:c,lw:4});
const box=(x,y,w,h,c)=>shape(rr(x,y,w,h,9),{fill:c,lw:6});
const vase=(x,y,c='#7696a0',s=1)=>{push();translate(x,y);scale(s);shape(spline([[-36,-104],[-44,-82],[-46,-22],[-29,0],[32,0],[46,-24],[40,-90],[22,-106]]),{fill:c,lw:5});shape(ell(0,-105,34,9,16),{fill:'#edd2ab',lw:5});pop();};
const sparkle=(x,y,r=10)=>{stroke([[x-r,y],[x+r,y]],3,{line:'#fff7c8'});stroke([[x,y-r],[x,y+r]],3,{line:'#fff7c8'});};
const steam=(x,y,t,n=3)=>{for(let i=0;i<n;i++){const a=(t*.5+i/n)%1;stroke(spline([[x+i*33-30,y],[x+i*33-42,y-65-a*35],[x+i*33-13,y-105-a*55]]),3,{line:'rgba(255,250,225,.65)'})}};
const bubbles=(x,y,t,k=8)=>{for(let i=0;i<k;i++){const a=(t*.22+i*.31)%1,r=7+hash(i+2)*15;shape(ell(x+(hash(i+8)-.5)*120,y-22-a*125,r,r,18),{fill:'rgba(240,250,255,.33)',line:'rgba(240,250,255,.85)',lw:2})}};
const brickwall=(base,edge,brick)=>{fillOnly(rect(X0,-1200,X1-X0,2700),base,{boil:0});for(let r=0;r<25;r++)for(let c=0;c<14;c++){const x=-900+c*210+(r%2)*105,y=-350+r*80;stroke(rr(x,y,204,72,5),2,{line:brick});}};
const arch=(x,y,w,h,col='#7c6650')=>{shape([...arc(x+w/2,y+w/2,w/2,w/2,Math.PI,TAU,20),[x+w,y+h],[x,y+h]],{fill:col,lw:7})};
const counter=(c='#916343')=>{box(782,1164,375,35,c);for(const x of [816,1111])box(x,1192,19,158,'#62442f')};
const shelf=(x,y,c='#795038')=>{for(let r=0;r<3;r++){box(x,y+r*116,300,15,c);for(let i=0;i<5;i++){box(x+16+i*54,y-58+r*116,44,55,['#af814a','#bd6b49','#d6b27d','#899760','#9d7a50'][(i+r)%5]);}}};
const windowArch=(x,y,w,h,sky='#9acde4')=>{arch(x,y,w,h,sky);stroke([[x+w/2,y],[x+w/2,y+h]],6,{line:ink});stroke([[x,y+h*.65],[x+w,y+h*.65]],5,{line:ink})};

// Period object: no invented branded logos.
export function soap(x,y,s=1,{kind='modern',t=0,a=0}={}){
  push();translate(x,y);rotate(a);scale(s);
  if(kind==='strigil'){
    // Curved bronze bath scraper; not a soap bar.
    shape(spline([[20,40],[6,22],[2,-12],[25,-60],[62,-99],[78,-103],[65,-72],[46,-54],[38,-14],[50,20]]),{fill:'#c89b57',lw:6});
    stroke([[22,18],[30,-15],[49,-58],[66,-83]],4,{line:'#f4d49b'});
    shape(ell(-55,33,36,32,18),{fill:'#b29b45',lw:5});stroke([[-55,0],[-55,65]],4,{line:'#fff0b6'});pop();return;
  }
  if(kind==='mash'){
    shape(ell(0,23,132,53,28),{fill:'#8d5740',lw:7});
    shape(ell(0,6,118,35,26),{fill:'#d4a576',lw:5,shade:()=>{for(let k=0;k<19;k++)dot((hash(k+3)-.5)*185,(hash(k+31)-.5)*38,4+hash(k+41)*8,'#8a7749')}});
    shape(rr(-96,20,190,12,6),{fill:'#ab7f58',lw:4});pop();return;
  }
  if(kind==='soda'){
    shape(rr(-108,-53,216,101,10),{fill:'#9b744d',lw:6,shade:()=>{stroke([[-105,-20],[106,-20]],4,{line:'#d6ae7a'});stroke([[-105,10],[106,10]],4,{line:'#d6ae7a'})}});
    shape(ell(0,-53,106,28,28),{fill:'#e4c79b',lw:5});for(let i=0;i<14;i++)dot(-87+hash(i+5)*174,-56+(hash(i+20)-.5)*30,3+hash(i+11)*5,'#fff2d1');pop();return;
  }
  if(kind==='lab'){
    shape(rr(-110,-63,220,126,16),{fill:'#efdab0',lw:6});
    shape(ell(-22,-9,54,42,24),{fill:'#cadbc9',lw:4});
    const col='#72cdb4';shape(ell(-22,-9,31,22,24),{fill:col,lw:3});
    for(const [sx,sy] of [[42,-48],[70,-32],[54,10]])sparkle(sx,sy,9);pop();return;
  }
  if(kind==='pump'){
    shape(rr(-67,-105,136,164,22),{fill:'#53bfbb',lw:7,shade:()=>fillOnly(rect(26,-99,35,142),'#32969a',{boil:.2})});
    shape(rr(-44,-54,88,89,10),{fill:'#f6eee2',lw:5});
    shape(ell(0,-16,22,31,20),{fill:'#8bdad5',lw:3});
    shape(rr(-7,-164,16,57,6),{fill:'#a5b3ba',lw:5});
    shape(rr(-9,-176,84,16,5),{fill:'#dbe7e3',lw:4});pop();return;
  }
  const cols={aleppo:['#6f8d56','#95ac6d'],marseille:['#87a06e','#c6d3a5'],modern:['#f1d6a0','#fff0ce']};
  const cc=cols[kind]||cols.modern;
  // Heavy beveled bar and its highlights, never a flat oval.
  shape(spline([[-112,-37],[-98,-53],[83,-53],[112,-32],[111,40],[87,58],[-87,58],[-112,36]]),{fill:cc[0],lw:7,
    shade:()=>{fillOnly(spline([[-105,-35],[-88,-47],[77,-47],[99,-32],[92,-13],[-98,-15]]),cc[1],{boil:.3});}});
  shape(rr(-61,-20,123,38,13),{line:'#607857',fill:cc[1],lw:3});
  shape(ell(-42,-38,26,9,12),{fill:'rgba(255,255,255,.4)',lw:0});
  if(kind==='modern'){for(let i=0;i<3;i++)sparkle(-85+i*75,-56+Math.sin(t*2+i)*8,7);}
  pop();
}
export function titleProp(t){soap(0,20,.52,{kind:'modern',t});}
const KINDS={w1:'mash',w2:'strigil',w3:'aleppo',w4:'marseille',w5:'soda',w6:'lab',w7:'pump'};
export function heldSoap(w,t){const kind=KINDS[w];if(!kind)return null;return(x,y)=>soap(x+20,y-65,kind==='strigil'?.36:.37,{kind,t,a:-.12});}
const sample=(kind,t)=>soap(960,1105,.77,{kind,t});

// A cream bathroom / Papy's cheerful workshop. Malik has a bar; Papy studies it.
export function home(t,{glow=0,clockT=t}={}){
  fillOnly(rect(X0,-1200,X1-X0,2700),'#f6e6d3',{boil:0});
  for(let y=280;y<1370;y+=132)for(let x=-900;x<1850;x+=150)stroke(rr(x+(Math.floor(y/132)%2)*75,y,148,126,4),2,{line:'#e3cdb8'});
  box(-90,415,350,420,'#d6ece5');stroke([[85,420],[85,833]],6);stroke([[-90,623],[260,623]],6);
  box(895,470,440,365,'#986944');shelf(953,620,'#744d32');
  box(433,600,250,308,'#beeadf');shape(ell(558,748,109,77,30),{fill:'#e9fbff',lw:7});
  box(355,1000,285,53,'#f7f8ec');shape(ell(495,1007,115,40,28),{fill:'#afcbd6',lw:5});
  shape(rr(483,921,31,100,9),{fill:'#a0b5c1',lw:5});shape(rr(499,911,65,19,8),{fill:'#a0b5c1',lw:4});
  if(Math.sin(t*4)>.7)fillOnly(rect(508,970,10,100),'#a6e8ff',{boil:0});
  ground('#be966f');for(let x=-500;x<1800;x+=200)stroke([[x,FLOOR],[x-55,2500]],3,{line:'#9f755a'});
  soap(555,994,.57,{kind:'modern',t});
  shape(ell(818,550,67,67,32),{fill:'#fff7dc',lw:6});const a=t*.6;stroke([[818,550],[818+42*Math.cos(a),550+42*Math.sin(a)]],6);
  if(glow)fillOnly(rect(X0,-1200,X1-X0,2600),`rgba(94,242,255,${glow*.15})`,{boil:0});
}

// Mesopotamia c. 2500 BCE: clay brick workshop, wool, ashes and a primitive cleaning mash.
export function w1(t){
  brickwall('#d1a575','#b98758','#b88956');
  for(let x of [-220,540]){arch(x,500,230,510,'#d1bb8c');shape(rr(x+30,560,170,330,8),{fill:'#9c8557',lw:5});}
  fillOnly(rect(-900,260,2900,190),'#b47c4f',{boil:0});for(let x=-700;x<1800;x+=280)shape(rect(x,330,75,30),{fill:'#aa7144',lw:3});
  shape(rr(-160,910,390,240,32),{fill:'#91714f',lw:7});steam(70,900,t);
  for(let i=0;i<9;i++){shape(ell(130+(i%3)*22,1140+Math.floor(i/3)*24,74,28,22),{fill:'#eee1bd',lw:4});}
  figure(120,FLOOR-20,.63,t,{era:'antique',skin:'#c88b5b',arms:-.7});
  figure(-260+((t*22)%1600),FLOOR-300,.42,t,{era:'antique',walk:1});
  ground('#b48f65');counter('#785138');vase(1122,1162,'#b57d56',.55);
  sample('mash',t);for(let i=0;i<4;i++)box(850+i*43,996,36,37,'#e1b982');
}

// Rome, first century. Thermae with marble arches and oil for the strigil.
export function w2(t){
  fillOnly(rect(X0,-1200,X1-X0,2900),'#eedec4',{boil:0});
  for(let x=-700;x<2100;x+=330){shape(rr(x,380,60,890,8),{fill:'#e7c5a1',lw:7});shape(ell(x+30,380,76,23,24),{fill:'#cfaa80',lw:5});}
  arch(250,430,510,550,'#77bfd5');fillOnly(rect(255,860,500,115),'#59a6c2',{boil:.2});
  shape(rr(-400,1120,850,110,12),{fill:'#efedda',lw:7});fillOnly(rect(-350,1150,760,55),'#6bc0d4',{boil:.3});
  for(let i=0;i<5;i++)sparkle(-250+i*110,1165,9);
  figure(100,FLOOR-20,.58,t,{era:'antique',skin:'#d7a87c'});
  figure(520,FLOOR-300,.44,t,{era:'antique',walk:1});
  ground('#d4c0a7');counter('#b08f6d');vase(1105,1134,'#b6a058',.6);sample('strigil',t);
  for(let i=0;i<7;i++)stroke([[790+i*46,FLOOR],[850+i*46,2100]],2,{line:'#c4ab8c'});
}

// Aleppo, traditional craft with arches, cauldrons, laurel and stacks of dry soap.
export function w3(t){
  brickwall('#d8bea0','#b8916c','#bea17e');
  for(let x of [-540,25,560]){arch(x,480,460,580,'#8c674d');arch(x+25,504,410,546,'#a9c39d');}
  shape(rr(-380,1008,620,230,24),{fill:'#b08155',lw:7});shape(ell(-70,1010,280,75,28),{fill:'#8a9471',lw:6});steam(-80,930,t,5);
  figure(300,FLOOR-10,.63,t,{era:'medieval',skin:'#c78a67',top:'#a2b17a',topS:'#71845c'});
  figure(-160+((t*25)%1400),FLOOR-300,.43,t,{era:'medieval',walk:1});
  ground('#b49a72');counter('#896b43');
  for(let r=0;r<3;r++)for(let i=0;i<4;i++)soap(836+i*75,870-r*68,.31,{kind:'aleppo',t});
  sample('aleppo',t);vase(1165,1148,'#698d66',.55);
}

// Marseille 1688, soap boilers and harbour. No modern machinery or labels.
export function w4(t){
  fillOnly(rect(X0,-1200,X1-X0,2800),'#a5c6d4',{boil:0});
  for(let i=0;i<6;i++)shape(rect(-800+i*340,400-(i%3)*70,300,570),{fill:'#e5c79f',lw:5});
  fillOnly(rect(-800,920,2700,240),'#5596b8',{boil:0});
  for(let i=0;i<6;i++){stroke([[250+i*90,940],[290+i*90,640]],4,{line:'#70452c'});stroke([[290+i*90,650],[290+i*90,900]],2,{line:'#e8ebd9'});}
  box(-250,950,560,360,'#af8754');shape(ell(20,962,272,70,32),{fill:'#9f7650',lw:7});steam(30,935,t,5);
  figure(360,FLOOR-10,.60,t,{era:'georgian',skin:'#cf9a72',hat:'coif'});
  figure(-160+((t*25)%1700),FLOOR-300,.4,t,{era:'georgian',walk:1});
  ground('#c19c6d');counter('#906d4e');for(let i=0;i<5;i++)soap(840+i*66,905,.28,{kind:'marseille',t});
  sample('marseille',t);
}

// France 1791, soda-making: early chemical industry, lime and salt, sacks and boilers.
export function w5(t){
  fillOnly(rect(X0,-1200,X1-X0,2800),'#b7bac9',{boil:0});
  for(let i=0;i<6;i++)box(-830+i*370,420-(i%2)*95,330,660,'#9b817b');
  for(let x of [-440,300,760]){box(x,180,68,780,'#6c5653');steam(x+35,150,t,3);}
  shape(rr(-290,975,495,285,16),{fill:'#74645c',lw:7});shape(ell(-42,977,237,75,27),{fill:'#d8d0aa',lw:6});steam(-50,950,t,4);
  for(let i=0;i<4;i++){shape(spline([[-480+i*120,1190],[-440+i*120,1090],[-370+i*120,1090],[-350+i*120,1190]]),{fill:'#d7ba83',lw:6});}
  figure(350,FLOOR-15,.62,t,{era:'georgian',skin:'#d7a77e'});
  figure(-170+((t*22)%1600),FLOOR-300,.42,t,{era:'georgian',walk:1});
  ground('#998278');counter('#69584a');sample('soda',t);
  for(let i=0;i<5;i++)dot(800+hash(i+1)*350,1058+hash(i+17)*60,5,'#efe7d1');
}

// Paris 1823: chemistry, glassware, period blackboards.
export function w6(t){
  fillOnly(rect(X0,-1200,X1-X0,2700),'#b6bb9a',{boil:0});
  for(let i=0;i<8;i++)box(-850+i*330,440,320,670,'#d8d7b8');
  box(-300,430,800,415,'#314d4a');
  text('HUILES + BASE',100,584,{font:'800 54px "Baloo 2"',fill:'#e7ead6',outlineW:1});
  text('= SAVON',100,678,{font:'800 65px "Baloo 2"',fill:'#e7ead6',outlineW:1});
  box(-410,1050,950,43,'#86664b');for(let i=0;i<3;i++){box(-360+i*190,982,120,72,['#cddccd','#b7d5d0','#eddaa4'][i]);}
  figure(310,FLOOR-40,.63,t,{era:'victorian',skin:'#ddb08e',hat:'none'});
  figure(-130+((t*26)%1600),FLOOR-300,.41,t,{era:'victorian',walk:1});
  ground('#8d897c');counter('#816d55');
  shape(rr(832,990,220,120,15),{fill:'#d9efe4',lw:5});shape(ell(940,1010,70,25,20),{fill:'#a3d9ba',lw:5});
  sample('lab',t);sparkle(1090,1020,13);
}

// Today: a bright real bathroom, soap dispenser, washbasin and water drops.
export function w7(t){
  fillOnly(rect(X0,-1200,X1-X0,2700),'#d6f2ed',{boil:0});
  for(let y=250;y<1380;y+=155)for(let x=-900;x<1900;x+=170)stroke(rr(x,y,169,153,4),2,{line:'#b6d9d1'});
  box(-280,370,650,470,'#9bc7d5');shape(rr(-260,385,610,425,22),{fill:'#e9f7ee',lw:6});
  shape(rr(500,550,420,430,30),{fill:'#9fd6d1',lw:8});
  box(-170,1110,630,64,'#f8fffc');shape(ell(140,1120,240,76,28),{fill:'#e2f5f5',lw:6});shape(ell(140,1110,130,42,24),{fill:'#a8dee6',lw:4});
  box(124,960,36,130,'#8aa9b4');box(145,955,98,23,'#8aa9b4');bubbles(250,1035,t,7);
  figure(390,FLOOR-30,.60,t,{era:'modern',skin:'#b9794f'});
  figure(-150+((t*28)%1580),FLOOR-300,.42,t,{era:'m_lady',walk:1});
  ground('#9bcbbf');counter('#82ada4');soap(845,1090,.65,{kind:'modern',t});sample('pump',t);
  for(let i=0;i<8;i++)sparkle(800+hash(i+10)*320,920+hash(i+33)*260,7);
}
