// Shared original period illustrations for 5 episodes in both aspect ratios.
// A distinct historical environment and period object are chosen from episode.json.
import {hash,lerp,TAU} from '/core/lib.js';
import {push,pop,translate,rotate,scale,shape,fillOnly,stroke,ell,arc,spline,rr,rect,dot,text} from './toon.js';
import {figure,VIEW} from './people.js';
import {renderWorkshop,setWorkshopAction} from './workshops.js';
import {drawGadget,GADGET_TYPES} from './gadgets.js';
import {drawSchool,SCHOOL_TYPES} from './school.js';
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
   // A complete, clearly recognizable object ALWAYS surrounds its fastening.
   // All zipper geometry is integrated into a boot, coat or backpack.
   const leather='#a46c46',sole='#473f38',silver='#cbd6d5',ink='#40383a';
   const chain=(x,y,n,vertical=true,closed=1)=>{
     for(let i=0;i<n;i++){
       const q=i/n, xx=vertical?x:x+i*18, yy=vertical?y+i*18:y;
       const spread=q>closed?10:0;
       if(vertical){box(xx-12-spread,yy,13,12,silver,3);box(xx+spread,yy,13,12,'#a2adae',3);}
       else{box(xx,yy-11-spread,12,13,silver,3);box(xx,yy+spread,12,13,'#a2adae',3);}
     }
   };
   const pull=(x,y,ang=0)=>{
     push();translate(x,y);rotate(ang);
     box(-16,-15,32,40,'#88969d',8);ring(0,35,17,'#d3dad7');ring(0,35,8,'#596b72');
     pop();
   };
   const boot=(historical=false,laces=false)=>{
     // Entire footwear: recognisable shaft, ankle, toe, heel and sole.
     shape(spline([[-84,-161],[49,-161],[62,-82],[66,-18],[91,18],[144,37],[170,73],[163,117],[104,138],[-145,138],[-154,112],[-132,67],[-92,24],[-89,-60]]),{fill:historical?'#ab7656':'#474f53',lw:8});
     shape(spline([[-148,106],[-87,117],[104,121],[166,94],[164,136],[-146,141]]),{fill:'#30383b',lw:6});
     line(-99,-140,-92,73,historical?'#e2a780':'#75868a',5);
     if(laces){
       box(-34,-144,70,194,'#7d563f',13);
       for(let i=0;i<7;i++){const yy=-127+i*26;
         ring(-16,yy,6,'#e7cd9e');ring(17,yy,6,'#e7cd9e');
         line(-16,yy,17,yy+16,'#f4ddb0',4);line(17,yy,-16,yy+16,'#f4ddb0',4);
       }
     }else{
       box(-18,-148,50,204,historical?'#865e50':'#74838a',8);
       chain(6,-136,9,true,.65);pull(6,-10);
     }
     line(-72,45,85,82,'rgba(255,255,255,.14)',5);
   };
   const jacket=(proto=false)=>{
     // A real full-length jacket with sleeves, collar, pockets, central front fastening.
     shape(spline([[-88,-138],[-134,-117],[-177,0],[-146,28],[-111,-3],[-114,140],[114,140],[110,-3],[150,29],[180,1],[133,-117],[82,-138],[0,-94]]),{fill:proto?'#92775a':'#596d7a',lw:8});
     shape(spline([[-79,-131],[-31,-74],[0,-107],[29,-74],[80,-130]]),{fill:proto?'#c6a67d':'#c8b6a3',lw:6});
     line(0,-97,0,136,proto?'#d4b785':'#d7dcda',5);
     box(-99,45,62,50,proto?'#a58a72':'#718997',8);
     box(40,45,62,50,proto?'#a58a72':'#718997',8);
     if(proto){for(let i=0;i<7;i++){const yy=-62+i*29;box(-16,yy,16,12,'#b4a693',3);box(3,yy,16,12,'#a2a0a0',3);}}
     else{chain(0,-88,11,true,.76);pull(0,-31);}
   };
   const bag=(closed=false,stuck=false)=>{
     // Malik's actual backpack: straps, handle, body, front pocket, zipper and pull.
     // No standalone zipper is ever held as the day's object.
     stroke(spline([[-119,-103],[-143,-118],[-162,-83],[-166,118]]),21,{line:'#324e68'});
     stroke(spline([[117,-102],[145,-113],[165,-83],[167,116]]),21,{line:'#324e68'});
     shape(spline([[-57,-114],[-49,-154],[-23,-164],[27,-164],[51,-147],[59,-113]]),{fill:'#2f536f',lw:8});
     shape(spline([[-132,-90],[-101,-131],[100,-131],[132,-86],[145,132],[-145,132]]),{fill:'#347e9b',lw:8,
       shade:()=>fillOnly(ell(-64,-28,52,95,24),'rgba(255,255,255,.12)',{boil:0})});
     box(-124,21,249,102,'#2f6687',15);
     line(-115,26,113,26,'#5ea2ba',4);
     // The UPPER opening on the bag changes state; the pull is visibly stuck early.
     box(-119,-93,240,20,'#1e536d',6);
     const p=closed?1:stuck?.43:.82,x=-106+216*p;
     for(let i=0;i<12;i++){const tx=-109+i*19;
       const joined=tx<x;
       box(tx,-89,13,joined?15:9,joined?'#dfdbcd':'#b8c3c4',3);
     }
     pull(x,-87,Math.PI/2);
     if(stuck){line(x+11,-90,x+16,-118,'#e7cba0',3);line(x+18,-87,x+30,-103,'#e7cba0',3);}
     shape(spline([[-108,28],[109,28],[87,94],[-83,94]]),{fill:'#4a8eab',lw:5});
     box(-14,47,28,19,'#d8ba75',4);
   };
   if(kind==='laces')boot(true,true);
   else if(kind==='judson')boot(true,false);
   else if(kind==='boot')boot(false,false);
   else if(kind==='howe'||kind==='teeth'||kind==='patent')jacket(kind==='howe');
   else if(kind==='modern'||kind==='bag'||kind==='bag-stuck'||kind==='bag-closed'){
     bag(kind==='bag-closed',kind==='bag-stuck');
     if(kind==='modern'){push();translate(188,15);scale(.38);jacket(false);pop();}
   } else bag(false,false);
 }

 if(typ==='scissors'){
   const steel='#bccbd0',handle='#376179',dark='#45515c';
   const cutPair=(open=.36,bronze=false)=>{
     const mat=bronze?'#caa569':steel;
     push();translate(-5,20);
     // Full scissors: TWO ringed handles, central rivet, two intersecting blades.
     for(const q of [-1,1]){
       push();rotate(q*open);
       shape(spline([[-6,-10],[28,-13],[143,q*4],[152,0],[25,11],[-6,10]]),{fill:mat,lw:5});
       line(-8,q*4,-89,q*73,bronze?'#a27e54':handle,17);
       ring(-94,q*72,27,bronze?'#ba9268':handle);
       ring(-94,q*72,14,'#f4e7ce');
       pop();
     }
     ring(0,0,11,'#a5b6b9');ring(0,0,5,'#eee0ba');
     pop();
   };
   const spring=()=>{
     // Bronze spring shears: one U-shaped spring, never modern circular handles.
     stroke(spline([[-105,-63],[-149,-58],[-163,-10],[-159,36],[-109,63]]),15,{line:'#b98b53'});
     line(-107,-60,119,-27,'#c79c60',15);line(-107,61,120,25,'#c79c60',15);
     shape(spline([[67,-37],[155,-24],[67,-18]]),{fill:'#d9c39b',lw:4});
     shape(spline([[67,16],[155,24],[67,36]]),{fill:'#d9c39b',lw:4});
   };
   const dragon=()=>{
     // WHOLE paper dragon as a real paper craft, visibly being cut by Malik.
     shape(spline([[-155,-103],[44,-104],[134,-34],[100,43],[154,88],[36,83],[0,132],[-68,93],[-157,103]]),{fill:'#f5e8c5',lw:6});
     shape(spline([[-109,-27],[-76,-89],[-43,-28],[5,-86],[37,-18],[89,32],[28,70],[-32,27],[-110,50]]),{fill:'#e8b34a',lw:5});
     shape(spline([[-37,-1],[2,-60],[39,11],[7,35]]),{fill:'#efca70',lw:4});
     ring(70,19,6,'#313638');
     shape(spline([[89,36],[134,53],[97,60]]),{fill:'#e3a04a',lw:3});
     line(-146,106,115,106,'rgba(75,66,54,.24)',3);
   };
   if(kind==='home'||kind==='dragon'||kind==='dragon-ready'){
     dragon();
     push();translate(73,-12);rotate(-.42);
     cutPair(kind==='dragon-ready'?.07:.34,false);
     pop();
   } else if(kind==='spring'||kind==='roman'){
     // Fabric strip or wool is always visible, not a floating tool only.
     shape(spline([[-145,46],[-32,41],[54,59],[55,117],[-145,115]]),{fill:kind==='spring'?'#eee0be':'#e5d4b8',lw:5});
     spring();
   } else if(kind==='tailor'){
     shape(spline([[-142,60],[-110,8],[2,12],[93,53],[153,120],[-148,121]]),{fill:'#b28a9c',lw:6});
     cutPair(.32,false);
   } else if(kind==='forge'||kind==='pivot'||kind==='factory'){
     shape(spline([[-137,79],[152,79],[157,119],[-135,117]]),{fill:kind==='factory'?'#b0b9b7':'#d2b58d',lw:5});
     cutPair(.27,false);
   } else {
     dragon();push();translate(68,-12);rotate(-.42);cutPair(.24,false);pop();
   }
 }

 if(typ==='fork'){
   // An actual entire metal table fork, in Malik's rigged hand.
   // Plates and real spaghetti are separately placed ON THE salon table.
   const antique=kind==='roman-serving',gold=['byzantine','venice'].includes(kind);
   const num=antique||gold||kind==='italy'?2:kind==='france'?3:4;
   const metal=gold?'#d8b56a':antique?'#b79260':'#cbd7d7';
   const gap=num===2?36:num===3?24:18,x0=-gap*(num-1)/2;
   push();translate(0,0);rotate(-.17);
   shape(spline([[-29,-75],[-29,-39],[-14,-6],[-11,41],[-17,156],[17,156],[11,41],[14,-6],[29,-39],[29,-75]]),{fill:metal,lw:7});
   for(let i=0;i<num;i++){
     const xx=x0+i*gap;
     box(xx-6,-175,12,122,metal,6);
     line(xx-2,-163,xx-2,-64,'rgba(255,255,255,.5)',2);
   }
   if(['byzantine','venice','italy'].includes(kind)){
     box(-19,69,38,100,'#956c4c',10);
     for(let j=0;j<4;j++)ring(0,83+j*22,3,'#f1ce86');
   }else{
     line(-10,59,-10,150,'rgba(255,255,255,.45)',3);
   }
   ring(0,164,11,gold?'#c2a059':'#889da3');
   if(kind==='home2'||kind==='modern'){
     // A few strands demonstrably wound AROUND the prongs, not beside the fork.
     for(let j=0;j<4;j++){
       stroke(spline([[x0+j*10,-126],[-24+j*15,-111],[12-j*3,-96],[19+j*4,-78]]),4,{line:'#ecc76b'});
     }
   }
   pop();
 }

 if(typ==='spoon'){
   // ONE complete real spoon with a hollow bowl, uninterrupted handle,
   // material and optional scoop of real soup in Malik's hand.
   const wood=['egypt-wood','medieval-wood'].includes(kind);
   const bronze=kind==='roman';
   const gift=kind==='apostle';
   const silver=gift||kind==='silver';
   const mat=wood?'#bd8956':bronze?'#b68c57':silver?'#d4d8d3':'#becdd1';
   const shade=wood?'#875c3a':bronze?'#786449':'#6f858f';
   push();rotate(-.21);
   // Complete handle connected to a broad bowl; outline remains readable.
   shape(spline([[-18,-56],[-13,12],[-12,81],[-19,165],[19,165],[12,81],[13,12],[18,-56]]),{fill:mat,lw:7});
   if(!wood)line(-7,9,-8,149,'rgba(255,255,255,.48)',3);
   shape(ell(0,-97,58,73,48),{fill:shade,lw:7});
   shape(ell(0,-101,50,65,48),{fill:mat,lw:4});
   shape(ell(-9,-121,28,29,30),{fill:wood?'#dfad78':bronze?'#d8b77a':'#eef2e8',lw:1});
   if(wood){
     for(let k=0;k<5;k++)line(-27+k*12,-133,-24+k*12,-70,'rgba(115,73,37,.22)',2);
   }
   if(gift){ring(0,168,19,'#c2a16f');ring(0,185,9,'#d1b574');}
   if(kind==='home2'||kind==='modern'){
     // A spoonful of soup is visibly inside the actual spoon bowl.
     shape(ell(0,-100,39,35,32),{fill:'#e1ad68',lw:3});
     for(let i=0;i<5;i++)ring(-27+i*13,-105+(i%2)*8,5,i%2?'#96ab69':'#efcc81');
   }
   pop();
 }

 if(typ==='tableknife'){
   // Full FOOD utensil: broad blade and attached handle, rounded table tip.
   const stone=kind==='stone',old=['roman','personal','banquet'].includes(kind);
   if(stone){
     shape(spline([[-44,116],[-62,20],[-51,-75],[-7,-151],[48,-92],[58,7],[14,97]]),{fill:'#8f9994',lw:7});
     for(let i=0;i<5;i++)line(-45+i*19,-73+(i%2)*34,7+i*8,55,'#c2c3af',3);
   }else{
     const blade=kind==='roman'?'#aab2a7':'#c2d0d1';
     shape(spline([[-26,-176],[old?5:26,-177],[old?35:42,-142],[36,-58],[25,2],[-27,2]]),{fill:blade,lw:7});
     line(-18,-152,-18,-14,'#eef5ef',3);
     box(-25,-1,50,153,old?'#97704e':'#a4b2b4',17);
     for(let i=0;i<2;i++)ring(0,37+i*72,5,'#d4c5a2');
   }
 }
 if(typ==='dish'){
   // A complete plate in perspective, including supporting ring and inner well.
   const old=['greek','fish'].includes(kind),blue=['china','import'].includes(kind),ornate=kind==='meissen';
   const base=old?'#bd7654':'#f5ead7',rim=old?'#563c32':blue?'#527da7':ornate?'#b8a16d':'#77979a';
   shape(ell(0,16,145,91,48),{fill:rim,lw:7});
   shape(ell(0,2,147,89,48),{fill:base,lw:7});
   shape(ell(0,2,116,64,48),{fill:rim,lw:4});
   shape(ell(0,2,101,51,48),{fill:old?'#c98f62':'#fff7e7',lw:3});
   if(old||blue||ornate){for(let j=0;j<12;j++){
     let a=j*Math.PI/6;ring(Math.cos(a)*129,Math.sin(a)*74,5,rim);
   }}
   if(kind==='fish'||blue){
     shape(spline([[-65,-6],[-31,-28],[23,-20],[51,0],[25,22],[-31,25]]),{fill:rim,lw:3});
     shape(spline([[44,0],[81,-21],[77,20]]),{fill:rim,lw:3});ring(-45,-3,5,'#f4e4b7');
   }
   if(kind==='home2'||kind==='modern')for(let i=0;i<6;i++)stroke(spline([[-65,6+i*5],[-20,-15+i*5],[33,15+i*5],[56,-3+i*5]]),4,{line:'#ddbc65'});
 }
 if(typ==='drinkingglass'){
   // Entire vessel, with clearly visible rim, wall, bottom and contained liquid.
   const stem=['venice','decorated'].includes(kind),old=['cast','medieval','roman-blown'].includes(kind);
   const col=kind==='cast'?'#78ab9e':kind==='medieval'?'#9fbf83':'#acd4db';
   const bottom=stem?25:135;
   shape(spline([[-79,-118],[79,-118],[58,bottom-10],[-58,bottom-10]]),{fill:old?col:'rgba(175,218,225,.70)',lw:6});
   shape(ell(0,-118,81,26,40),{fill:'#e4f2ec',lw:6});
   shape(ell(0,-116,65,15,32),{fill:col,lw:3});
   if(!stem){
     shape(spline([[-62,-20],[62,-20],[51,111],[-51,111]]),{fill:'#75b8d8',lw:2});
     shape(ell(0,-20,62,17,32),{fill:'#b6e0ec',lw:3});
     shape(ell(0,125,58,18,36),{fill:'#bdd8d4',lw:5});
   }else{box(-10,20,20,108,col,7);shape(ell(0,133,62,15,32),{fill:col,lw:5});}
   line(-54,-93,-41,bottom-18,'rgba(255,255,255,.81)',8);
   if(['pressed','decorated','venice'].includes(kind))for(let i=0;i<5;i++)line(-42+i*21,-77,-30+i*15,bottom-13,'#e4eddf',3);
 }

 if(GADGET_TYPES.has(typ))drawGadget(typ,kind,t);
 if(SCHOOL_TYPES.has(typ))drawSchool(typ,kind,t);

 pop();
}
// The key story starts with a giant old key found under the sofa, not a badge.
const showcaseKind=CFG.type==='key'?'wood':CFG.type==='zipper'?'bag':(['scissors','fork','spoon','tableknife','dish','drinkingglass'].includes(CFG.type)||SCHOOL_TYPES.has(CFG.type))?'home':CFG.eras[6][4];
export const titleProp=(t)=>object(0,25,.5,{kind:showcaseKind,t,a:-.12});
export const heldObject=(w,t)=>{const n=Number(w.slice(1))-1;if(!Number.isInteger(n)||n<0||n>6)return null;const kind=CFG.eras[n][4];return(x,y)=>object(x+30,y-70,(['zipper','scissors','fork','spoon','tableknife','dish','drinkingglass'].includes(CFG.type)||SCHOOL_TYPES.has(CFG.type))?.40:.32,{kind,t,a:-.15});};
export const homeObject=(x,y,t,w='home')=>object(x,y,CFG.type==='zipper'?.57:CFG.type==='scissors'?.48:CFG.type==='fork'?.55:(['spoon','tableknife','dish','drinkingglass'].includes(CFG.type)||SCHOOL_TYPES.has(CFG.type))?.53:.35,{kind:CFG.type==='zipper'?(w==='home2'?'bag-closed':'bag-stuck'):CFG.type==='scissors'?(w==='home2'?'dragon-ready':'dragon'):(['fork','spoon','tableknife','dish','drinkingglass'].includes(CFG.type)||SCHOOL_TYPES.has(CFG.type))?(w==='home2'?'home2':'home'):showcaseKind,t});
export function home(t,{glow=0,clockT=t}={}){
 bg('#f1e2c8');
 for(let x=-900;x<2100;x+=180)line(x,-1200,x,FLOOR-35,'#dfceaf',3);
 box(-110,350,385,480,'#c8e4dc');line(88,350,88,830);line(-110,590,275,590);
 box(950,490,380,640,'#875c42');
 for(let i=0;i<4;i++){box(970,620+i*132,345,17,'#684831');for(let j=0;j<5;j++)box(996+j*58,546+i*132,43,69,['#dbb05e','#8ab5a3','#b87985','#d4c3ac','#779cbd'][j]);}
 box(457,1120,298,38,'#956b4d');box(480,1154,27,186,'#795741');box(704,1154,27,186,'#795741');
 if(['tableknife','dish','drinkingglass'].includes(CFG.type)){
   // Complete table setting, food and drinking water at home.
   shape(ell(580,1086,132,54,44),{fill:'#f5eddb',lw:6});
   shape(ell(580,1084,106,38,44),{fill:'#fff8e8',lw:4});
   if(CFG.type==='tableknife'){
     shape(spline([[534,1069],[600,1046],[635,1080],[617,1101],[535,1100]]),{fill:'#e8c571',lw:5});
     for(let i=0;i<4;i++)ring(553+i*19,1082+(i%2)*9,5,'#c49d50');
   }else{
     for(let i=0;i<9;i++)stroke(spline([[519,1065+i*4],[558,1056+i*4],[599,1086+i*4],[638,1070+i*4]]),4,{line:'#e8c46c'});
   }
   if(CFG.type!=='drinkingglass')object(722,1049,.30,{kind:'modern',t,a:0});
 }else if(CFG.type==='spoon'){
   // The soup belongs INSIDE the whole bowl on the living-room table.
   shape(ell(580,1085,135,61,44),{fill:'#f7eee3',lw:7});
   shape(ell(580,1080,109,44,44),{fill:'#dde9e3',lw:4});
   shape(ell(580,1076,97,33,44),{fill:'#d8aa69',lw:3});
   for(let i=0;i<8;i++)ring(515+i*18,1079+Math.sin(i*2)*13,5,i%2?'#e9ca80':'#92a96c');
 }else if(CFG.type==='fork'){
   // The WHOLE meal stays visible at the same physical place in every salon shot.
   shape(ell(579,1084,131,57,38),{fill:'#f6ede0',lw:6});
   shape(ell(579,1081,106,39,38),{fill:'#fff8e9',lw:5});
   for(let k=0;k<13;k++){
     const y=1060+(k%5)*9,dx=(k%3)*4;
     stroke(spline([[530+dx,y],[557,y-11],[583,y+7],[624-dx,y-2]]),4,{line:k%3?'#e5c36c':'#efd894'});
   }
   for(let k=0;k<5;k++)ring(548+k*16,1083+(k%3)*7,5,k%2?'#b95d42':'#87a16a');
 }else if(CFG.type!=='zipper'&&CFG.type!=='scissors')homeObject(580,1085,t);
 else spark(650,1020,8);
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
