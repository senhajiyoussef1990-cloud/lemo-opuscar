// Le Livre de Papy — ten different household inventions, original 2D rigging.
// Rendered by toon.js with true period-specific changes and animated interactions.
// The product is always a complete object, including screen, controls and handles.
import {push,pop,translate,rotate,scale,shape,stroke,ell,rr,spline} from './toon.js';
export const GADGET_TYPES=new Set(['telephone','television','camera','fridge','washer','vacuum','iron','remote','microwave','hairdryer']);
const B=(x,y,w,h,c,r=12)=>shape(rr(x,y,w,h,r),{fill:c,lw:6});
const C=(x,y,rx,ry,col)=>shape(ell(x,y,rx,ry,32),{fill:col,lw:5});
const L=(x,y,X,Y,col='#514a4e',w=5)=>stroke([[x,y],[X,Y]],w,{line:col});
const P=(pts,col)=>shape(spline(pts),{fill:col,lw:6});
const h='#e7f0e8',ink='#34424d',silver='#9eb3bc',light='#94e3dc',gold='#edc276',wood='#966d51',dark='#39444e';
const marks=(x,y,n,dx,dy,col)=>{for(let i=0;i<n;i++)C(x+i*dx,y+i*dy,5,5,col);};
const rx=(t)=>Math.sin(t*3);
function device(type,kind,t){
 const k=kind||'modern',modern=['modern','smart','stream','program','autodrum','freezer','flat','light'].includes(k);
 if(type==='telephone'){
   if(k==='bell'){
     B(-70,-103,138,193,wood,9);C(0,-43,44,44,'#c7a17b');C(0,-43,28,28,'#e3bd88');
     B(-93,52,184,45,wood,10);L(-25,-97,-40,-148,ink,10);C(-46,-154,25,27,ink);C(33,20,19,19,gold);
   }else if(k==='switchboard'){
     B(-135,-125,270,250,wood,8);for(let i=0;i<4;i++)for(let j=0;j<3;j++)C(-91+j*86,-91+i*59,10,10,gold);
     for(let j=0;j<4;j++){L(-95+j*30,26,-74+j*36,96,['#70aeb9','#e2a46d','#c2a6b4','#7eac8e'][j],6);}
   }else if(k==='wall'){
     B(-90,-142,180,265,wood,15);C(0,-50,54,48,'#bb9f79');
     B(-106,-164,210,48,ink,12);C(-76,20,13,15,gold);C(72,20,13,15,gold);C(0,55,28,28,ink);
   }else if(['mobile','smart','home'].includes(k)||modern){
     B(-83,-167,166,326,k==='mobile'?'#383d43':'#232f38',26);
     if(k==='mobile'){B(-52,-105,104,85,light,8);L(45,-167,67,-210,ink,8);for(let i=0;i<12;i++)C(-43+(i%3)*43,25+Math.floor(i/3)*37,10,9,silver);}
     else {B(-69,-150,138,272,'#78bcd2',13);B(-55,-133,110,50,'#b4e7d7',8);B(-55,-67,110,119,'#5a87b0',9);
       for(let i=0;i<6;i++)C(-31+(i%3)*31,76+Math.floor(i/3)*27,12,12,['#f1bc69','#9fcda1','#edd1a4'][i%3]);C(0,143,8,8,h);}
   }else{
     B(-140,16,280,100,k==='rotary'?'#9aa7a8':'#b2d5be',24);
     B(-114,-67,228,71,ink,22);C(-106,-29,35,42,ink);C(107,-29,35,42,ink);
     if(k==='rotary'){C(0,53,59,55,'#dce5df');C(0,53,36,35,'#74888b');for(let i=0;i<10;i++){const a=i*Math.PI/5;C(Math.cos(a)*45,53+Math.sin(a)*43,6,6,ink);}}
     else for(let i=0;i<12;i++)C(-63+(i%3)*63,26+Math.floor(i/3)*21,12,8,'#edf4e8');
   }
 }
 if(type==='television'){
   if(k==='mechanical'){B(-141,-130,285,250,wood,12);C(-38,-34,76,76,ink);C(-38,-34,63,63,'#809ea6');
     for(let i=0;i<9;i++){let a=i*Math.PI*2/9+t*.6;C(-38+Math.cos(a)*46,-34+Math.sin(a)*46,5,5,gold);}B(55,-78,51,103,'#bd9e77',8);}
   else {
     const flat=['flat','stream','home','modern'].includes(k);
     B(-153,-118,306,240,flat?'#273642':k==='electronic'?'#917050':wood,flat?12:23);
     B(-134,-96,flat?269:226,181,['color','crt','flat','stream','home','modern'].includes(k)?'#78abc7':'#b1b9ab',12);
     if(!flat){B(109,-72,30,99,wood,9);C(123,-19,10,10,gold);C(123,12,10,10,gold);}
     // A moving on-screen scene with an actor and clear ground line.
     const sat=['salon-bw','electronic'].includes(k);
     C(-27+17*rx(t),-47,25,25,sat?'#5b6870':'#f2c99f');
     B(-70+16*rx(t),-20,88,65,sat?'#697a80':'#4da4a6',18);L(-120,56,104,56,sat?'#768e91':'#8baf84',5);
     B(-32,123,64,19,ink,5);
   }
 }
 if(type==='camera'){
   if(k==='obscura'){B(-144,-99,288,194,wood,14);C(78,-16,55,55,ink);C(78,-16,33,33,light);L(-135,-64,-222,-126,gold,4);L(-135,65,-222,-126,gold,4);}
   else if(['daguerre','wetplate'].includes(k)){B(-111,-79,222,160,wood,8);B(-65,-97,150,180,'#665345',7);
     C(25,-12,78,77,ink);C(25,-12,54,52,'#8daeb8');C(25,-12,23,21,ink);B(-139,71,80,27,wood,5);
     B(-13,86,26,76,'#605648',5);L(0,162,-72,207,wood,7);L(0,162,78,207,wood,7);
   }else if(k==='smart'||k==='home'){B(-94,-162,187,324,ink,27);B(-82,-148,164,294,'#8bb8ca',18);
     for(let i=0;i<3;i++)C(-39+i*39,-86,18,18,'#3c5260');B(-73,-5,147,116,'#78a2ac',8);C(0,125,9,9,h);}
   else {B(-142,-104,284,208,k==='brownie'?wood:'#45505a',19);B(-137,-129,84,46,k==='digital'?silver:wood,9);
     C(10,0,91,89,silver);C(10,0,68,67,ink);C(10,0,38,36,'#83b0c5');C(10,0,19,18,ink);
     B(60,-128,48,20,gold,5);if(k==='digital')B(-124,62,58,35,'#7ad5ca',8);}
 }
 if(type==='fridge'){
   if(['icecellar','icebox'].includes(k)){B(-121,-178,245,358,wood,12);
     B(-105,-158,211,140,'#c9e1df',9);B(-105,0,211,160,'#a68a6d',9);C(69,-89,11,18,gold);
     C(70,67,11,18,gold);if(k==='icecellar'){C(-30,-95,58,37,'#b7e5e8');C(40,-99,35,23,h);}
   }else{B(-132,-182,264,363,k==='domelre'?'#abb6b1':'#edf0dc',17);
     if(k==='monitor')C(0,-180,91,34,ink);
     B(-118,-153,238,292,k==='shelves'?'#d7e6dc':'#e4edf0',9);
     L(-108,-25,107,-25,'#9bbdc4',6);L(-108,68,107,68,'#9bbdc4',6);
     B(101,-109,10,76,ink,5);C(-50,-89,20,31,'#91b8be');B(-11,-109,53,63,'#ecc39a',6);
     B(-85,15,58,39,'#90b479',8);C(30,22,23,17,'#e6c078');
     if(['freezer','smart','home'].includes(k)){L(-110,92,110,92,ink,5);B(-21,-124,41,26,'#abcbd2',6);}
     if(k==='shelves'){B(39,-49,67,18,'#edc37a',7);B(40,-9,59,18,'#a2c3a2',7);}
   }
 }
 if(type==='washer'){
   if(['washboard','tub','wringer'].includes(k)){
     C(0,61,126,91,wood);C(0,12,111,57,'#cde3df');
     for(let j=0;j<4;j++)C(-61+j*43,15+Math.sin(t*2+j)*10,15,12,'#f2e5dc');
     if(k==='washboard'){B(-86,-164,172,177,wood,7);for(let j=0;j<10;j++)L(-63,-132+j*14,62,-132+j*14,silver,4);}
     else if(k==='tub'){L(-5,-133,4,17,wood,13);C(0,-20,28,26,wood);}
     else {B(-106,-169,210,54,wood,8);C(-42,-138,46,21,silver);C(50,-138,46,21,silver);L(108,-139,147,-166,ink,9);}
   }else{
     B(-131,-177,261,352,k==='electric'?'#acb7a9':'#e8ebdf',16);B(-108,-155,216,52,ink,7);
     for(let i=0;i<3;i++)C(-72+i*48,-131,12,12,gold);
     C(0,36,106,109,ink);C(0,36,83,83,'#b7dbe1');
     C(Math.sin(t*2)*35,36+Math.cos(t*2)*30,38,24,'#e9e4d4');
     C(-34*Math.sin(t*2),38,28,21,'#80afbf');
     for(let j=0;j<5;j++)C(-52+j*27,80+Math.sin(t+j)*9,7,6,h);
   }
 }
 if(type==='vacuum'){
   if(k==='broom'){L(0,-166,0,38,wood,17);P([[-37,41],[35,41],[66,153],[-66,153]],'#caa56d');
     for(let i=0;i<9;i++)L(-47+i*12,85,-53+i*13,145,'#8b774c',3);}
   else if(k==='sweeper'){B(-142,44,283,124,wood,24);L(-48,44,7,-175,ink,15);C(-91,168,25,25,ink);C(91,168,25,25,ink);
     for(let j=0;j<9;j++)L(-96+j*21,155,-99+j*20,190,gold,5);}
   else if(k==='robot'||k==='home'||k==='modern'){C(0,44,133,117,'#bacdd0');C(0,25,100,90,ink);C(-4,17,36,29,'#86c6c6');C(65,-17,12,12,gold);
     for(let i=0;i<6;i++)L(-91+i*36,112,-90+i*31,144,ink,3);}
   else if(k==='booth'){B(-128,-177,251,335,wood,20);C(-7,-110,77,68,ink);C(-7,-110,50,45,silver);
     for(let i=0;i<3;i++)C(-75+i*65,151,17,17,ink);L(122,-8,187,26,silver,17);C(195,47,23,19,ink);}
   else if(k==='upright'){B(-78,-122,153,253,'#a2bcb3',22);B(-138,105,273,58,ink,11);L(0,-116,0,-182,ink,14);
     C(0,12,48,43,light);C(-90,171,23,18,ink);C(89,171,23,18,ink);}
   else{B(-123,-68,250,178,k==='cyclone'?'#8eacc1':'#b2bfb7',26);C(-64,113,25,24,ink);C(77,113,25,24,ink);
     L(101,-43,176,-129,ink,17);C(185,-137,30,14,ink);
     if(k==='cyclone'){C(-9,2,69,58,'#bfe6e3');for(let j=0;j<8;j++)C(Math.cos(t+j)*45,Math.sin(t+j)*39,5,5,'#ae8667');}
   }
 }
 if(type==='iron'){
   const old=['sadiron','stove'].includes(k);
   P([[-151,79],[71,83],[149,117],[-149,122]],silver);
   P([[-150,72],[-86,-15],[97,-16],[141,72]],old?'#767a76':'#a1c4ca');
   B(-88,-35,181,44,old?wood:'#a3a4af',17);B(-63,-73,124,45,ink,17);B(-40,-44,79,15,h,7);
   if(!old){C(67,18,18,18,gold);if(['steam','light','modern','home'].includes(k))for(let i=0;i<4;i++)
     C(-109+i*74,-64+Math.sin(t*2+i)*12,6,14,'#cce5e8');}
   else if(k==='stove'){C(-4,-103,34,27,'#d08b57');L(-8,-106,22,-130,gold,4);}
 }
 if(type==='remote'){
   if(k==='tesla'){B(-136,47,272,98,wood,21);C(-64,47,28,22,ink);C(73,47,28,22,ink);
     L(0,47,0,-97,wood,10);B(-69,-125,137,59,'#8b9ca5',9);C(0,-96,23,23,gold);}
   else{
     B(-73,-179,146,353,k==='wired'?'#9d9989':k==='flash'?'#75b68a':ink,24);
     B(-52,-147,102,60,k==='infrared'?'#85b8c1':'#b9c9bf',14);
     if(k==='flash')C(0,-181,29,29,'#f8da74');
     if(k==='wired'){for(let j=0;j<3;j++)L(0,176,Math.sin(t+j)*27,210+j*13,'#727f80',5);}
     for(let i=0;i<12;i++){const a=i%3,b=Math.floor(i/3);C(-40+40*a,-56+b*43,12,12,i%4===0?'#dc8876':silver);}
   }
 }
 if(type==='microwave'){
   if(k==='radar'){B(-124,-160,248,278,ink,15);C(0,-87,80,70,'#9bc3bf');C(0,-87,23,22,gold);
     for(let i=0;i<5;i++)L(-83+i*34,-30,-68+i*29,18,'#d2bea7',5);}
   else if(k==='spencer'){B(-143,-144,286,272,'#868f95',13);C(0,-48,84,71,ink);C(0,-48,47,40,'#e0a76d');
     C(0,80,24,21,gold);for(let i=0;i<3;i++)C(-75+i*75,126,11,12,ink);}
   else {
     const huge=['radarange','home-early'].includes(k);B(-156,-120,310,266,huge?'#9daeb5':'#e0e6df',16);
     B(-129,-88,216,169,ink,14);B(-114,-75,184,140,'#95b6c5',10);
     C(-10,21,69,30,'#f1e2cb');C(-10,17,46,17,'#ebaf69');
     B(94,-75,43,148,'#9dafb0',9);for(let j=0;j<3;j++)C(115,-51+j*42,12,11,j===0?gold:h);
     if(k==='modern'||k==='home')B(90,-76,49,29,'#94d6d3',5);
   }
 }
 if(type==='hairdryer'){
   if(['salon','hood'].includes(k)){
     L(0,-122,0,164,ink,16);C(0,171,87,17,ink);
     P([[-126,-134],[125,-134],[111,-52],[-109,-52]],k==='salon'?wood:'#9dadaa');
     C(0,-56,90,25,'#b9d6d3');C(0,-40,64,21,'#6f9096');
   }else{
     push();rotate(-.18);
     P([[-124,-100],[62,-115],[134,-52],[76,-3],[-121,9]],k==='metal'?silver:k==='bakelite'?wood:'#9fbfca');
     B(-13,-13,67,152,k==='metal'?ink:'#7caab0',13);
     C(-111,-42,38,40,ink);C(-112,-42,23,23,silver);
     for(let j=0;j<4;j++)L(-112+j*11,-60,-112+j*11,-25,light,4);
     C(105,-51,27,27,'#c8dadd');B(32,41,10,29,gold,4);
     pop();
     for(let j=0;j<4;j++)L(140+Math.sin(t*2+j)*8,-100+j*30,195+Math.sin(t*2+j)*10,-119+j*30,'#a2dbe7',5);
   }
 }
}
// Local coordinates range about [-180,210] x [-180,220], suitable for Papy's
// object-in-hand scaling .32 and large workshop closeups.
export function drawGadget(type,kind,t=0){if(!GADGET_TYPES.has(type))return;push();device(type,kind,t);pop();}
export function gadgetWorkshop(type,kind,era,t,progress,artisan){
 if(!GADGET_TYPES.has(type))return;
 const p=Math.max(0,Math.min(1,progress)); const wave=Math.sin(Math.PI*p);
 // Workbench foreground and supporting legs; object is placed on a real surface.
 B(794,1214,455,48,'#89674f',8);B(821,1263,31,147,'#6b5043',5);B(1188,1263,31,147,'#6b5043',5);
 // Seven different demonstrations per episode: preserve per-period device silhouettes.
 if(type==='camera'){
   B(844,1040,101,78,'#ad906f',9);L(897,1113,850,1189,wood,9);L(897,1113,963,1189,wood,9);
   C(841,994,30,27,'#e8c180');L(841,960,841,938,h,5);
 }
 if(type==='washer'){
   for(let j=0;j<7;j++)C(817+j*31,1151+8*Math.sin(t*2+j),7,5,h);
   B(844,1038,54,51,'#e7bfc4',9);L(844,1038,817,990,ink,4);
 }
 if(type==='fridge'){
   C(841,1101,31,21,'#a1c284');C(869,1048,18,16,'#d6c470');L(863,1092,858,1064,'#6c965f',5);
 }
 if(type==='vacuum'){
   for(let j=0;j<9;j++){let x=826+j*29,y=1176-(j%3)*9;
     C(x+25*p,y-38*p,5,5,j%2?wood:'#9ba6a5');}
 }
 if(type==='iron'){
   P([[829,1090],[1036,1067],[1172,1139],[841,1182]],'#ead8c9');
   for(let j=0;j<5;j++)L(867+j*50,1090+9*wave,888+j*45,1154,'#cfad9e',3);
 }
 if(type==='telephone'){L(828,1067,828+100*p,1007-28*wave,'#7ca3aa',9);}
 if(type==='television'){C(855,1117,13,13,gold);L(855,1105,879,1043,ink,7);}
 if(type==='remote'){B(842,1036,111,86,wood,7);C(897,1081,34,30,'#b2dedc');L(897,1080,937+27*p,1050,'#9ce4ec',5);}
 if(type==='microwave'){C(849,1091,47,24,'#f1daca');C(854,1085,25,12,'#e4b871');}
 if(type==='hairdryer'){
   C(851,1052,51,48,'#f0bb96');for(let j=0;j<6;j++)
     L(827+j*9,1018,818+j*9+Math.sin(t*2)*5,976,'#8c604b',6);
 }
 push();translate(991,1044-22*wave);rotate(.05*Math.sin(t*1.7));scale(.79);drawGadget(type,kind,t);pop();
 // The historical actor visibly touches the controls, handle or object.
 artisan(era,t,1099,1009-24*wave);
}
