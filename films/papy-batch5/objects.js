// Shared original period illustrations for 5 episodes in both aspect ratios.
// A distinct historical environment and period object are chosen from episode.json.
import {hash,lerp,TAU} from '/core/lib.js';
import {push,pop,translate,rotate,scale,shape,fillOnly,stroke,ell,arc,spline,rr,rect,dot,text} from './toon.js';
import {figure,VIEW} from './people.js';
import {renderWorkshop,setWorkshopAction} from './workshops.js';
export const setAction=(id,u)=>setWorkshopAction(id,u);
import {FLOOR,portal,GLOW,ground} from './worlds.js';
export {FLOOR,portal,GLOW,VIEW};
export const darkness=()=>0;
export const SUN={on:false};
const CFG=await (await fetch('episode.json')).json();
const X0=-900,X1=2200;
const C={ink:'#29212e',wood:'#8d6647',gold:'#dba75c',cream:'#f4e5ca'};
const box=(x,y,w,h,c,r=12)=>shape(rr(x,y,w,h,r),{fill:c,lw:6});
const line=(x,y,x2,y2,c='#443b3a',w=5)=>stroke([[x,y],[x2,y2]],w,{line:c});
const arch=(x,y,w,h,c)=>shape([...arc(x+w/2,y+w/2,w/2,w/2,Math.PI,TAU,20),[x+w,y+h],[x,y+h]],{fill:c,lw:6});
const spark=(x,y,r=14)=>{line(x-r,y,x+r,y,'#fff7d5',3);line(x,y-r,x,y+r,'#fff7d5',3)};
const ring=(x,y,r,c)=>shape(ell(x,y,r,r,44),{fill:c,lw:7});
const bg=(c)=>fillOnly(rect(X0,-1200,X1-X0,3700),c,{boil:0});
const shades={temple:['#e9c5a0','#b88967','#d5ad86'],courtyard:['#e3d2af','#ae9775','#bfad8c'],palace:['#e4be8e','#a6795c','#bb8d67'],forum:['#e6d0ad','#b6a081','#c6b394'],market:['#d6c2a4','#9b755c','#c4ad8d'],mill:['#b3bdcb','#7e93a2','#a3a9ab'],factory:['#aaaeb6','#7b7d89','#9396a0'],workshop:['#d2b28c','#996d4f','#ad8869'],medieval:['#c8ad91','#866953','#a98d74'],city:['#a0c3d0','#6f93a1','#89b1bd'],modern:['#b8e0e2','#5fb1b8','#89cdd0'],lab:['#bfd2c2','#759a8c','#9fb9aa'],mine:['#7e8690','#515c60','#787f75']};
function histBackground(meta,t){
  const [place,date,desc,era,kind,setting]=meta, p=shades[setting]||shades.workshop;
  bg(p[0]);
  const outdoors=['temple','courtyard','palace','forum','market','city','modern','mine','medieval'].includes(setting);
  if(outdoors){
    box(-820,125,3010,365,setting==='modern'?'#a9e3f4':'#9fbdce',0);
    for(let i=0;i<7;i++){
      const x=-870+i*395+(i%3)*40, ht=260+(i%3)*95;
      box(x,695-ht,330,ht+330,p[1],10);
      for(let w=0;w<3;w++){const wx=x+52+w*88;arch(wx,590-ht,63,122,setting==='modern'?'#d4faf8':'#716d72');}
      if(['temple','forum','palace'].includes(setting)){box(x+28,300,44,550,p[2]);box(x+226,300,44,550,p[2]);}
    }
    if(setting==='temple'||setting==='forum')for(let x=-720;x<1900;x+=450){box(x,440,56,560,'#f5e0ba');box(x-28,425,115,43,'#f5e0ba');}
    if(setting==='mine'){for(let i=0;i<6;i++)shape(spline([[i*350-800,1220],[i*350-660,700],[i*350-500,1220]]),{fill:'#74736e',lw:6});}
  }else{
    for(let i=0;i<18;i++)for(let j=0;j<9;j++)line(-900+j*250+(i%2)*125,280+i*73,-670+j*250+(i%2)*125,280+i*73,p[1],2);
    for(let x=-560;x<2000;x+=610){arch(x,360,330,570,'#8bbfc4');box(x+32,430,265,360,p[2]);}
    if(setting==='factory'||setting==='mill')for(let x=-600;x<1900;x+=400){box(x,280,55,650,'#565e67');box(x+25,690,250,22,'#575f68');}
    if(setting==='lab')box(-300,420,760,385,'#426353');
  }
  if(setting==='city'||setting==='modern')for(let i=0;i<6;i++){const x=-700+i*380;box(x,690,270,300,'#83b3bd');}
  ground(p[1]);for(let x=-900;x<2050;x+=220)line(x,FLOOR+22,x-120,2350,p[2],3);
  if(setting==='factory'||setting==='mill'){for(let i=0;i<4;i++){ring(-560+i*260,940,62,'#616d73');ring(-560+i*260,940,18,'#d7d8c9');}}
  if(setting==='market'||setting==='courtyard')for(let i=0;i<4;i++){box(-650+i*420,850,300,45,'#9a6448');box(-650+i*420,905,35,230,'#75533d');}
  if(setting==='workshop'||setting==='lab')for(let i=0;i<5;i++)box(-440+i*205,940,150,170,['#b99a6e','#8b9a8c','#d2bc86'][i%3]);
  // Historical insert: a single operator in the foreground; no looping passers-by.
  // Motion must explain the narration, never decorate the background.
  // Documentary animation dominates the insert: no decorative display counter.
  renderWorkshop(CFG.type,kind,era,t);
}

// Individual, hand-drawn family of historical objects.
export function object(x,y,s=1,{kind='home',t=0,a=0}={}){
 push();translate(x,y);rotate(a);scale(s);
 const typ=CFG.type;
 if(typ==='paper'){
   if(kind==='fibre'||kind==='han'){ring(0,28,110,'#b8a98d');for(let k=0;k<12;k++)line(-82+k*14,-18+hash(k+2)*60,60-k*8,20+hash(k+20)*40,'#8b785d',3);}
   else if(kind==='machine'){for(let i=0;i<3;i++){ring(-85+i*90,22,47,'#b2bbba');ring(-85+i*90,22,14,'#657c78');}shape(spline([[-80,-45],[-40,-81],[30,-73],[108,-45],[115,-11],[35,-30],[-45,-29]]),{fill:'#f5e6c4',lw:5});}
   else if(kind==='recycle'){for(let i=0;i<6;i++)shape(rr(-110+i*17,-62+i*14,175,104,4),{fill:i%2?'#eef6d9':'#fff7d8',lw:4});box(-25,2,58,23,'#78b18a');}
   else if(kind==='papyrus'){for(let i=0;i<9;i++)line(-101+i*25,55,-96+i*25,-61,'#c99e60',8);for(let i=0;i<6;i++)line(-110,-61+i*24,105,-61+i*24,'#b78952',6);}
   else {shape(rr(-112,-64,225,130,8),{fill:'#f3e7c9',lw:7});for(let i=0;i<6;i++)line(-80,-45+i*18,83,-45+i*18,'#9a8b70',3);if(kind==='baghdad'||kind==='fabriano')box(-108,-62,20,124,'#9c6540');}
 }
 if(typ==='watch'){
   if(kind==='sun'){box(-25,-56,50,85,'#cda45e');shape(spline([[-115,50],[115,50],[50,-50],[-80,-50]]),{fill:'#e9d6a5',lw:6});line(0,-50,65,10,'#6c593d',5);}
   else if(kind==='water'){shape(rr(-78,-95,156,170,25),{fill:'#b7e2ef',lw:7});ring(0,-38,55,'#e8f5e5');for(let i=0;i<5;i++)line(-60,-13+i*17,60,-13+i*17,'#6394a0',3);}
   else if(kind==='spring'){shape(spline(Array.from({length:45},(_,i)=>{let a=i*.38,rad=7+i*2;return [Math.cos(a)*rad,Math.sin(a)*rad]})),{line:'#d9a951',lw:7});}
   else if(kind==='smart'){box(-57,-125,114,250,'#333945');box(-82,-66,164,131,'#6a717f');box(-73,-55,147,111,'#1c323b');text('10:08',0,0,{font:'700 41px "Baloo 2"',fill:'#e7ffdb'});}
   else{ring(0,0,100,kind==='quartz'?'#dae5e3':'#d2a560');ring(0,0,79,'#fff1cd');for(let i=0;i<12;i++){let a=i*Math.PI/6;dot(Math.sin(a)*60,-Math.cos(a)*60,4,'#6a4635');}line(0,0,42,-46,'#3e3134',6);line(0,0,-16,-56,'#3e3134',5);ring(0,0,8,'#a06945');if(kind==='tower')box(-90,90,180,35,'#aa7958');}
 }
 if(typ==='umbrella'){
   if(kind==='folding'){box(-94,-28,184,58,'#b96655');line(-100,-28,108,28,'#715e4d',8);}
   else{
     const cover=kind==='oilpaper'?'#f3b779':kind==='sunshade'?'#f0d18e':kind==='hanway'?'#5f7887':kind==='steel'?'#9e7fbc':kind==='rain'?'#79afb5':'#56c9ba';
     shape(spline(Array.from({length:25},(_,i)=>{const u=i/24,x=-143+286*u,y=-8-124*Math.sin(u*Math.PI);return [x,y]}).concat([[143,0],[70,-6],[0,5],[-70,-6],[-143,0]])),{fill:cover,lw:7});
     line(0,-122,0,162,'#5c5b59',9);stroke(spline([[0,162],[12,199],[39,193],[48,177]]),7,{line:'#5c5b59'});
     for(let k=-2;k<=2;k++)line(0,-122,k*55,-2,'rgba(55,50,58,.5)',4);
     if(kind==='oilpaper')for(let k=0;k<5;k++)spark(-110+k*50,-38-(k%2)*25,7);
   }
 }
 if(typ==='key'){
   if(kind==='card'){box(-136,-69,272,141,'#71bdc8');box(-100,-31,73,41,'#eac56b');line(-100,33,98,33,'#e5f7f4',5);}
   else{const ancient=kind==='wood',metal=ancient?'#b27d54':kind==='roman'?'#c79b66':'#d9b963';
     ring(-89,-6,48,metal);ring(-89,-6,22,ancient?'#d7b88d':'#fbebbe');box(-43,-20,160,35,metal,7);
     for(let i=0;i<(kind==='wood'?3:5);i++){let xx=22+i*25;box(xx,10,14,40+12*(i%3),metal,3);}
     if(kind==='yale')box(-43,-25,155,22,'#dcded4',4);
   }
 }
 if(typ==='pencil'){
   if(kind==='graphite'){shape(spline([[-115,17],[-89,-37],[73,-33],[119,11],[60,50],[-90,51]]),{fill:'#434a50',lw:7});}
   else{
     const colour=kind==='colour'?'#39a5bf':kind==='silver'?'#adaca1':kind==='conte'?'#d2a15d':'#e9bd4d';
     shape(spline([[-140,-19],[90,-19],[141,0],[90,20],[-140,20]]),{fill:colour,lw:7});
     shape(spline([[90,-19],[141,0],[90,20]]),{fill:'#e8c9a1',lw:5});
     shape(spline([[127,-6],[141,0],[127,6]]),{fill:'#3f4445',lw:3});
     line(-130,-10,80,-10,'rgba(255,255,255,.5)',4);
     if(kind==='eraser'){box(-158,-18,40,38,'#e68e97');box(-129,-19,12,39,'#bbbdbb');}
     if(kind==='holder')for(let i=0;i<5;i++)line(-110+i*42,-15,-110+i*42,15,'#886c4a',3);
   }
 }
 if(typ==='zipper'){
   // The same object stays recognizable in Malik's hand, at the title and in historical demos.
   // From laces to hooks to modern paired teeth; no commercial marks.
   const fabric=kind==='modern'?'#42afbb':'#b98561';
   if(kind==='laces'){
     shape(spline([[-100,-132],[53,-132],[80,75],[129,92],[122,126],[-110,126],[-115,58]]),{fill:'#ab744d',lw:8});
     box(-50,-105,70,199,'#d19d6d',10);
     for(let i=0;i<7;i++){
       const y=-90+i*27;
       ring(-26,y,8,'#d7bf8c');ring(7,y,8,'#d7bf8c');
       line(-27,y,6,y+20,'#f3ddad',5);line(6,y,-27,y+20,'#f3ddad',5);
     }
   }else if(kind==='boot'){
     shape(spline([[-90,-146],[40,-146],[60,28],[116,57],[125,115],[50,139],[-120,130],[-129,95],[-96,68]]),{fill:'#424c4f',lw:8});
     box(18,-130,27,216,'#bd9864',5);
     for(let i=0;i<9;i++)box(25,-115+i*23,16,13,'#dbdbd1',4);
     box(6,1,49,37,'#bac0bd',8);ring(30,40,14,'#e1d6ba');
   }else{
     // Two tapes with individual teeth and a movable interlocking slider.
     box(-111,-133,102,266,fabric,11);
     box(10,-133,102,266,kind==='modern'?'#61bcc1':'#bb987a',11);
     line(-105,-117,-105,120,'rgba(255,255,255,.35)',4);
     line(106,-117,106,120,'rgba(255,255,255,.3)',4);
     const isHook=kind==='howe'||kind==='judson';
     for(let i=0;i<12;i++){
       const y=-112+i*20,joined=kind!=='howe' && i>=4;
       const left=joined?-9:-23,right=joined?3:17;
       box(left-20,y,isHook?28:29,isHook?9:12,isHook?'#afa397':'#d1d9d6',3);
       box(right,y,isHook?26:29,isHook?9:12,isHook?'#a5a9a9':'#b7bcbd',3);
       if(isHook && i%2===0)ring(0,y+4,5,'#e0d2b4');
     }
     if(kind!=='howe'){
       box(-31,-47,61,63,'#727e86',12);box(-12,-35,23,36,'#c7c7c0',5);
       ring(0,33,21,'#d5d6cb');ring(0,33,10,'#69737a');
     }else{
       for(let i=0;i<6;i++)line(-12,-94+i*34,12,-75+i*34,'#8d7761',5);
     }
   }
 }

 pop();
}
// The key story starts with a giant old key found under the sofa, not a badge.
const showcaseKind=CFG.type==='key'?'wood':CFG.eras[6][4];
export const titleProp=(t)=>object(0,25,.5,{kind:showcaseKind,t,a:-.12});
export const heldObject=(w,t)=>{const n=Number(w.slice(1))-1;if(!Number.isInteger(n)||n<0||n>6)return null;const kind=CFG.eras[n][4];return(x,y)=>object(x+30,y-70,.32,{kind,t,a:-.15});};
export const homeObject=(x,y,t)=>object(x,y,.35,{kind:showcaseKind,t});
export function home(t,{glow=0,clockT=t}={}){
 bg('#f1e2c8');
 for(let x=-900;x<2100;x+=180)line(x,-1200,x,FLOOR-35,'#dfceaf',3);
 box(-110,350,385,480,'#c8e4dc');line(88,350,88,830);line(-110,590,275,590);
 box(950,490,380,640,'#875c42');
 for(let i=0;i<4;i++){box(970,620+i*132,345,17,'#684831');for(let j=0;j<5;j++)box(996+j*58,546+i*132,43,69,['#dbb05e','#8ab5a3','#b87985','#d4c3ac','#779cbd'][j]);}
 box(457,1120,298,38,'#956b4d');box(480,1154,27,186,'#795741');box(704,1154,27,186,'#795741');
 homeObject(580,1085,t);spark(650,1020,8);
 ring(825,415,66,'#eee1c6');const a=t*.38;line(825,415,825+47*Math.cos(a),415+47*Math.sin(a),'#66513e',6);
 ground('#a78162');for(let x=-900;x<2100;x+=210)line(x,FLOOR+20,x-80,2280,'#92694c',4);
 if(glow>0)fillOnly(rect(X0,-1200,X1-X0,3700),`rgba(94,242,255,${.14*glow})`,{boil:0});
}
export function w1(t){histBackground(CFG.eras[0],t);}
export function w2(t){histBackground(CFG.eras[1],t);}
export function w3(t){histBackground(CFG.eras[2],t);}
export function w4(t){histBackground(CFG.eras[3],t);}
export function w5(t){histBackground(CFG.eras[4],t);}
export function w6(t){histBackground(CFG.eras[5],t);}
export function w7(t){histBackground(CFG.eras[6],t);}
