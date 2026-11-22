// Le Livre de Papy - Second lot approved in the initial list of twenty.
// Ten original animated objects with a recognizable silhouette in every era.
// All shapes are hand-authored vector graphics (toon.js) and fully renderable.
import {push,pop,translate,rotate,scale,shape,stroke,ell,rr,spline} from './toon.js';
export const B20_TYPES=new Set(['radio','computer','keyboard','mouse','microphone','fan','toaster','kettle','faucet','broom']);
const ink='#344350',metal='#afc1c7',white='#f6eedb',wood='#aa7c51',gold='#edc677',blue='#80c2cf',soft='#a5cebf',black='#43454c',red='#dd7f73';
const B=(x,y,w,h,c,r=9)=>shape(rr(x,y,w,h,r),{fill:c,lw:5});
const C=(x,y,rx,ry,c)=>shape(ell(x,y,rx,ry,32),{fill:c,lw:4});
const L=(x,y,X,Y,c=ink,w=5)=>stroke([[x,y],[X,Y]],w,{line:c});
const P=(pts,c)=>shape(spline(pts),{fill:c,lw:5});
const dots=(n,fn)=>{for(let j=0;j<n;j++)fn(j);};
const wheel=(x,y,r,c)=>{C(x,y,r,r,c);C(x,y,r*.45,r*.45,ink);};
const keycaps=(n,w,rows=4)=>{const columns=Math.ceil(n/rows);dots(n,i=>{let col=i%columns,row=Math.floor(i/columns);B(-w/2+col*(w/columns)+3,-12+row*37,w/columns-7,30,(i%7===0)?gold:metal,4);});};
function draw(type,kind,t){
const k=kind||'home',modern=['modern','digital','pc','laptop','wireless','usb','automatic','sensor','led','transistor'].includes(k),a=Math.sin(t*2);
if(type==='radio'){
 if(k==='waves'){C(0,-17,65,55,metal);dots(4,i=>{let x=-141+i*94;L(x,-112,x,-10,blue,6);C(x,-112,7,7,gold);});L(-109,112,113,112,ink,7);}
 else if(k==='spark'){B(-120,-92,241,188,wood,8);L(-95,-78,-95,-165,gold,6);C(-95,-164,13,13,blue);L(85,-105,130,-156,ink,5);C(35,0,55,55,black);C(35,0,31,31,blue);}
 else if(k==='crystal'){B(-141,-39,280,175,wood,10);C(-83,19,41,43,metal);C(-83,19,19,19,white);L(29,11,102,-123,gold,6);B(51,17,55,37,ink,6);}
 else if(k==='broadcast'){B(-141,-129,282,271,wood,12);C(0,11,84,80,white);dots(6,i=>L(-59+i*24,-24,-59+i*24,48,wood,3));C(101,98,18,18,gold);L(-110,-129,-100,-174,ink,6);}
 else {
   B(-143,-109,287,241,modern?'#6b9eab':wood,18);B(-124,-90,248,138,modern?'#d5e8da':'#b8a58b',11);
   dots(8,i=>L(-106+i*30,-71,-106+i*30,26,modern?'#76a9a8':'#8b7054',4));
   C(-74,90,21,21,gold);C(77,90,21,21,gold);L(-116,-107,-47,-166,ink,5);
   if(k==='digital'||modern){B(-36,-80,96,43,'#98e5db',7);L(-22,-58,31,-58,ink,5);}
 }
}
if(type==='computer'){
 if(k==='calculating'||k==='babbage'){B(-137,-125,270,267,wood,15);dots(8,i=>wheel(-90+(i%4)*62,-66+Math.floor(i/4)*115,23,metal));L(-122,132,113,132,ink,7);}
 else if(['relay','eniac'].includes(k)){B(-148,-175,296,344,black,10);dots(16,i=>{let x=-115+(i%4)*75,y=-144+Math.floor(i/4)*71;B(x,y,56,52,metal,3);C(x+27,y+24,12,12,(i%3)?red:blue);});}
 else if(k==='chip'){B(-116,-126,231,255,soft,9);B(-79,-81,157,163,black,9);B(-47,-48,93,95,metal,6);dots(12,i=>{let p=i%6;L(-86+p*34,94,-86+p*34,130,gold,7);});}
 else {
   B(-146,-173,292,235,black,15);B(-123,-151,244,182,blue,11);B(-110,-127,216,143,'#7cabc0',8);
   B(-65,66,133,22,metal,5);B(-16,86,38,52,ink,5);B(-138,137,282,48,modern?'#738b9a':white,8);
   dots(11,i=>B(-121+i*22,149,16,12,metal,2));
   if(k==='laptop'||modern){L(-127,135,126,135,ink,5);}
 }
}
if(type==='keyboard'){
 if(k==='early'||k==='sholes'||k==='typewriter'||k==='mechanical'){
   B(-144,-85,292,179,wood,14);B(-138,-103,274,36,metal,10);dots(14,i=>{let x=-117+(i%7)*37,y=-51+Math.floor(i/7)*48;C(x,y,15,14,ink);C(x,y,7,7,white);});
   B(-115,96,230,48,metal,8);C(0,-121,37,36,ink);
 }else {
   B(-153,-118,305,239,modern?ink:'#b5b4a7',11);
   dots(39,i=>{let x=-137+(i%10)*28,y=-93+Math.floor(i/10)*46;B(x,y,23,29,(i%10===0)?gold:'#c9d4d3',4);});
   B(-78,65,158,24,metal,5);
   if(k==='terminal')B(-102,-180,205,54,'#6caab7',7);
 }
}
if(type==='mouse'){
 if(k==='controls'){B(-134,22,268,129,wood,12);C(-63,71,45,43,ink);C(-63,71,23,23,blue);L(23,-45,23,47,metal,17);C(23,-47,26,27,gold);}
 else {
   if(k==='wood'){B(-112,-90,224,234,wood,28);L(-112,107,-145,143,ink,6);wheel(-52,156,14,ink);wheel(61,156,14,ink);}
   else{C(0,17,113,144,modern?'#7db1bb':k==='ball'?'#dfd7c5':metal);L(-43,-56,-43,-7,ink,6);L(40,-56,40,-7,ink,6);C(0,-1,8,13,gold);if(k==='rolling')C(0,123,25,21,ink);}
   if(k!=='wireless'&&k!=='modern'&&k!=='wood'){L(0,-110,15,-175,ink,6);}
 }
}
if(type==='microphone'){
 if(k==='sound'){C(0,-55,94,94,gold);C(0,-55,55,55,ink);dots(5,i=>L(-45+i*21,-119,-45+i*21,4,blue,3));}
 else {
   if(k==='carbon'){B(-83,-133,167,178,wood,19);C(0,-47,62,59,ink);C(0,-47,39,36,gold);}
   else if(k==='studio'||k==='ribbon'){B(-80,-164,161,228,metal,35);C(0,-65,63,94,black);dots(8,i=>L(-48+i*14,-130,-48+i*14,-4,metal,3));}
   else if(k==='lav'){B(-47,-31,93,80,black,24);C(0,-7,27,26,metal);L(0,48,42,164,ink,5);}
   else{C(0,-72,74,100,metal);C(0,-72,53,76,black);dots(6,i=>L(-48+i*20,-127,-48+i*20,-19,metal,3));}
   B(-17,25,35,169,ink,10);B(-47,160,93,23,metal,8);
 }
}
if(type==='fan'){
 if(k==='hand'||k==='folding'||k==='punkah'){
   P([[-139,18],[-93,-92],[-28,-144],[43,-137],[107,-89],[140,16],[0,88]],k==='hand'?'#d8b98b':'#88b7ba');
   dots(7,i=>{let angle=-2.4+i*.35;L(0,109,Math.cos(angle)*145,Math.sin(angle)*140,gold,3);});
   L(0,96,0,199,wood,16);
 }else{
   B(-19,85,38,104,black,11);B(-86,174,173,21,metal,6);C(0,-24,129,130,metal);
   dots(3,i=>{let theta=i*Math.PI*2/3 +t*2;push();rotate(theta);P([[0,-16],[48,-98],[89,-112],[78,-41],[16,12]],blue);pop();});
   C(0,-24,21,21,gold);C(0,-24,119,121,'rgba(255,255,255,.08)');
   dots(11,i=>{let angle=i*Math.PI*2/11;L(0,-24,Math.cos(angle)*120,-24+Math.sin(angle)*120,ink,2);});
 }
}
if(type==='toaster'){
 if(k==='fire'||k==='grill'){
   B(-148,42,295,112,wood,15);dots(5,i=>P([[-118+i*52,44],[-130+i*52,0],[-109+i*52,-70],[-93+i*52,45]],i%2?'#ecae62':'#cb8164'));
   B(-132,-119,264,49,metal,7);
 }else{
   B(-139,-76,276,239,k==='chrome'?metal:k==='modern'?white:wood,28);
   B(-100,-88,198,24,black,6);B(-86,-109,174,18,'#d5b579',4);
   C(98,20,21,21,gold);L(101,-11,101,39,ink,7);
   if(k==='popup'||k==='modern'){B(-82,-147+Math.sin(t*2)*7,165,67,'#dfb475',9);B(-74,-139,149,47,'#f3cf88',8);}
 }
}
if(type==='kettle'){
 if(k==='pot'||k==='copper'||k==='stove'){
   P([[-135,-55],[118,-55],[104,148],[-104,148]],k==='copper'?gold:metal);
   C(0,-65,124,36,metal);P([[105,-10],[181,-62],[160,19],[110,52]],metal);
 }else{
   B(-135,-73,266,217,k==='early-electric'?wood:metal,31);
   B(-92,-92,185,31,ink,11);C(0,-98,34,15,gold);
   P([[117,-46],[190,-106],[185,18],[118,53]],metal);
   if(k==='automatic'||k==='modern')C(0,126,16,14,red);
 }
 L(-115,-31,-156,47,ink,15);
 dots(3,i=>{let x=-48+i*53;L(x,-112-13*i,x+Math.sin(t+i)*13,-159-13*i,blue,4);});
}
if(type==='faucet'){
 if(k==='pipe'||k==='valve'){
   B(-125,30,246,89,wood,14);B(-24,-107,48,144,metal,8);C(0,-109,79,22,gold);B(67,-45,111,30,metal,9);
 }else{
   B(-27,-124,59,250,metal,12);
   P([[-9,-111],[35,-160],[115,-155],[143,-133],[143,-111],[95,-115],[58,-117],[31,-95]],metal);
   C(135,-114,17,13,black);
   if(k==='two'){C(-81,-113,34,30,red);C(87,-74,34,30,blue);L(-81,-102,-25,-79,ink,7);}
   else if(k==='mixer'||k==='cartridge'||k==='modern'||k==='sensor'){L(-29,-109,-83,-152,ink,12);C(-87,-153,20,19,metal);}
 }
 dots(4,i=>{let y=16+i*33;C(134+5*Math.sin(t*2+i),y,8,13,'#5aa9cf');});
}
if(type==='broom'){
 B(-13,-188,26,264,wood,9);
 if(k==='twigs'||k==='heather'||k==='sorghum'||k==='dickinson'){
   P([[-62,50],[56,50],[124,192],[-124,192]],k==='heather'?'#a99669':'#cba66e');
   dots(13,i=>L(-66+i*11,80,-110+i*18,189,k==='sorghum'?'#cfb37c':wood,3));
 }else{
   B(-135,60,271,83,k==='nylon'?blue:'#9aaea6',12);
   dots(18,i=>L(-124+i*14,138,-126+i*14,208,i%2?ink:metal,3));
 }
}
}
export function drawBatch20b(type,kind,t=0){
 if(!B20_TYPES.has(type))return;
 push();draw(type,kind,t);pop();
}
export function workshop20b(type,kind,era,t,progress,artisan){
 if(!B20_TYPES.has(type))return;
 const p=Math.max(0,Math.min(1,progress)),move=Math.sin(Math.PI*p);
 // Grounded workshop: each tool has a real task being performed on the work surface.
 B(795,1212,460,48,'#89654b',9);B(823,1261,29,157,'#704d3a',7);B(1202,1261,29,157,'#704d3a',7);
 if(type==='radio'){
   B(821,1058,143,90,wood,12);dots(5,i=>L(842+i*25,1081,842+i*25,1130,metal,4));
   C(866,1015,25,22,blue);L(867,983,867,949,ink,5);
 }
 if(type==='computer'){B(808,1041,205,113,ink,7);dots(14,i=>C(823+(i%7)*28,1060+Math.floor(i/7)*41,9,9,i%3?gold:blue));}
 if(type==='keyboard'){B(821,1070,199,110,white,8);dots(16,i=>B(835+(i%8)*23,1083+Math.floor(i/8)*40,17,26,metal,3));}
 if(type==='mouse'){B(808,1046,183,123,white,11);L(847,1081,967,1081,blue,6);L(847,1118,967,1118,blue,6);}
 if(type==='microphone'){B(855,1073,53,87,wood,8);dots(3,i=>L(881,1089,873+36*Math.sin(t*2+i),1024-i*22,blue,3));}
 if(type==='fan'){dots(5,i=>{let xx=815+i*32;L(xx,1101,xx+38*Math.sin(t*2+i),1060,blue,3);});}
 if(type==='toaster'){B(835,1110,124,31,'#d69d5f',7);B(846,1062,98,51,'#f4cb83',7);}
 if(type==='kettle'){C(856,1112,60,34,metal);dots(3,i=>L(847+i*25,1070,850+i*25+5*Math.sin(t+i),1026,blue,3));}
 if(type==='faucet'){B(810,1077,193,108,white,11);C(887,1154,48,19,blue);}
 if(type==='broom'){dots(9,i=>C(822+i*27-23*p,1182-(i%3)*12,6,5,wood));}
 push();translate(1061,1026-22*move);rotate(-.08+Math.sin(t*1.4)*.04);scale(.68);drawBatch20b(type,kind,t);pop();
 // Actor holds or assembles the period-specific object; both arms follow it.
 artisan(era,t,1126,1002-20*move);
}
