// Le Livre de Papy — demonstrations, rendered entirely in 2D code.
// Every historical insert contains an artisan and a tool that moves under the artisan's hand.
// The montage chooses the current spoken line and progress within that line.
import {push,pop,translate,rotate,scale,shape,stroke,ell,rr,spline,dot,text} from './toon.js';
import {figure} from './people.js';
let activeId=null,progress=0;
export function setWorkshopAction(id,u){activeId=id;progress=Math.max(0,Math.min(1,Number(u)||0));}
const B=(x,y,w,h,c,r=8)=>shape(rr(x,y,w,h,r),{fill:c,lw:5});
const L=(x,y,a,b,c='#514236',w=7)=>stroke([[x,y],[a,b]],w,{line:c});
const C=(x,y,r,c)=>shape(ell(x,y,r,r,28),{fill:c,lw:5});
const wave=Math.sin;
const phase=()=>Math.min(2,Math.floor(progress*3));
const tool=(x,y,c='#b7a079')=>{L(x-10,y-5,x+10,y+5,c,11);C(x+10,y+5,5,c)};
function artisan(era,t,hx,hy,{left=740,feet=1390}={}){
  figure(left,feet,.60,t,{era:era||'medieval',skin:'#dda77c',face:1,arms:.02,walk:0,hideFrontArm:true});
  // Arm, elbow and articulated hand connect to the working tool.
  L(left+52,feet-347,left+103,feet-303,'#b87c54',30);
  L(left+103,feet-303,hx,hy,'#d8a17a',24);
  C(hx,hy,18,'#e5b38c');
  for(let k=-1;k<=2;k++) L(hx+2,hy+k*5,hx+21,hy+k*5+3,'#e5b38c',5);
}
function vat(t){B(858,1060,320,160,'#805b42',15);B(875,1074,282,97,'#9ccfd3',8);
  for(let k=0;k<7;k++)L(880+k*39,1104+wave(t*2+k)*12,904+k*39,1112+wave(t*2+k)*12,'#e5d5a4',5);
}
function sieve(x,y,t){B(x,y,230,114,'#775a45',4);B(x+12,y+12,206,90,'#e7deba',3);
  for(let i=1;i<5;i++) L(x+12,y+12+i*16,x+217,y+12+i*16,'#bbac89',2);
}
// Narration-specific, non-looping instructional scenes. Each stage has one operator,
// one visible tool and a material state that changes during the spoken line.
function paperInstruction(kind,era,t){
 const u=progress, j=Math.sin(t*3),id=activeId||'';
 if(id==='a2'){
   B(850,1090,345,54,'#b38a5a'); 
   if(u<.34){for(let i=0;i<5;i++)B(902+i*40,1000,25,110,'#c9b66d');L(972+j*24,965,1044+j*24,1078,'#62686b',10);artisan(era,t,975+j*24,999);}
   else if(u<.68){for(let i=0;i<7;i++){L(888+i*40,1030,888+i*40,1112,'#d4bd82',12);L(875,1020+i*13,1155,1020+i*13,'#dbc78e',7);}artisan(era,t,1000,1040);}
   else {for(let i=0;i<8;i++)L(882,1010+i*12,1160,1010+i*12,'#decf9f',10);B(870,965+Math.abs(j)*13,312,45,'#765b43');artisan(era,t,1030,978+Math.abs(j)*13);}
   return true;
 }
 if(['b2','c2','d1','e1','e2','g2'].includes(id)){
   vat(t);
   if(id==='e1'){B(930,1000,250,65,'#9b8067');B(1020,940+Math.abs(j)*25,82,62,'#5c625f');artisan(era,t,1040,953+Math.abs(j)*25);return true;}
   if(id==='e2'&&u>.48){sieve(886,995,t);B(892,965+Math.abs(j)*18,240,32,'#73573f');artisan(era,t,1005,970+Math.abs(j)*18);return true;}
   if(id==='g2'&&u<.32){for(let i=0;i<5;i++)B(900+i*37,963+(i%2)*12,85,46,'#e9e1c7');artisan(era,t,985,989);return true;}
   if((id==='c2'||id==='d1'||id==='e2'||id==='g2')&&u>.52){
     const lift=100*(u-.52)/.48;
     sieve(900,1050-lift,t);for(let i=0;i<6;i++)L(930+i*35,1164-lift,930+i*35,1190-lift,'#82c1cf',3);
     artisan(era,t,930,1082-lift);return true;
   }
   if(u<.34){B(917,1012,170,30,'#d4bd8c');L(946+j*25,980,981+j*25,1105,'#6b604c',16);artisan(era,t,950+j*25,1004);}
   else{L(1000+j*31,955,1008+j*31,1150,'#81694d',17);for(let i=0;i<8;i++)C(925+i*31,1120+Math.sin(t+i)*7,5,'#e6dab0');artisan(era,t,1000+j*31,985);}
   return true;
 }
 if(id==='d2'||id==='b5'){
   B(860,1050,345,55,'#9c815c');for(let i=0;i<5;i++)B(881+i*61,1020,52,28,'#f1e6c6');
   B(1120,930,12,160,'#6c5742');L(930,1000,1126,960,'#d1bd92',8);artisan(era,t,935,1000);return true;
 }
 if(id==='f2'){B(828,1070,385,160,'#69757a');for(let i=0;i<3;i++){C(875+i*140,1090,45,'#a9b8bb');L(875+i*140,1090,875+i*140+30*Math.cos(t*2),1090+30*Math.sin(t*2),'#626e72',6);}
   B(840,1002,362,20,'#f0e5c8');artisan(era,t,851,1007);return true;}
 return false;
}
function watchInstruction(kind,era,t){
 const id=activeId||'',u=progress,j=Math.sin(t*2.5);
 if(['c2','d1','d2','e1','e2','f1','f2'].includes(id)){
   B(857,1035,340,150,'#967756');
   if(id==='c2'){for(let i=0;i<3;i++){const x=928+i*90,y=1050+(i%2)*36;C(x,y,36,'#d8b77b');for(let k=0;k<10;k++){let a=k*Math.PI/5+t*.5*(i%2?-1:1);L(x+23*Math.cos(a),y+23*Math.sin(a),x+38*Math.cos(a),y+38*Math.sin(a),'#705c4b',7);}}B(1110,1125+Math.sin(t)*10,38,50,'#5b666c');artisan(era,t,940,1009);return true;}
   if(id==='d1'||id==='d2'){C(1010,1080,72,'#e2c58c');for(let k=0;k<12;k++){const a=k*Math.PI/6;L(1010+60*Math.cos(a),1080+60*Math.sin(a),1010+79*Math.cos(a),1080+79*Math.sin(a),'#8b6c49',8);}
     if(u<.5){L(915+j*18,985,1055,1070,'#9eacb4',12);artisan(era,t,915+j*18,990);}
     else{for(let i=0;i<18;i++){let a=i*.7,r=i*2;C(1010+Math.cos(a)*r,1080+Math.sin(a)*r,3,'#66504b');}artisan(era,t,1005,1025);}return true;}
   if(id==='e1'||id==='e2'){C(1015,1075,83,'#e4c589');for(let k=0;k<27;k++){const a=k*.45;C(1015+Math.cos(a)*k*2,1075+Math.sin(a)*k*2,3,'#81684d');}
     B(1135,1005+Math.sin(t*2)*12,22,100,'#8c715a');artisan(era,t,1008+j*14,1018);return true;}
   if(id==='f1'||id==='f2'){B(870,1020,300,145,'#49776c');B(892,1040,240,96,'#9eb9b2');C(970,1080,42,'#e1d9bb');C(1050,1080,22,'#c9bb83');for(let k=0;k<8;k++)L(900+k*32,1140,900+k*32,1120,'#cdbb8b',4);artisan(era,t,1000,1030);return true;}
 }
 return false;
}
function paper(kind,era,t){
 if(paperInstruction(kind,era,t))return;
 const s=phase(),j=wave(t*3.6),up=32+40*wave(t*1.6),x=987+j*38;
 if(kind==='papyrus'){
   B(855,1090,340,55,'#b38a5a');for(let i=0;i<9;i++)L(875+i*32,1076,875+i*32,993,'#d5bd7e',9);
   if(s===0){B(x,974,25,110,'#b1c37e');L(x-28,1050,x+43,1005,'#55565a',11);artisan(era,t,x-15,1020);}
   else if(s===1){B(871,970+Math.abs(j)*20,302,33,'#76563f');artisan(era,t,960,975+Math.abs(j)*20);}
   else{B(869,998,311,95,'#ddce99');artisan(era,t,945,1020);L(970,960,1010,940,'#e1c272',5);}
 } else if(kind==='fibre'||kind==='han'||kind==='baghdad'||kind==='fabriano'||kind==='recycle'){
   vat(t);
   if(s===0){B(919,1010,160,28,'#c5af82');L(950+j*30,973,984+j*30,1080,'#856345',16);artisan(era,t,950+j*30,1020);}
   else if(s===1){L(1005+j*33,965,1010+j*33,1133,'#896947',16);artisan(era,t,1005+j*33,995);}
   else {const y=1003+up; sieve(905,y,t);artisan(era,t,930,y+24);for(let k=0;k<5;k++)L(930+k*37,y+115,930+k*37,y+132+((k+t*20)%18),'#88bfce',3);}
   if(kind==='fabriano'){B(1090,870,82,105,'#695845');L(1130,890,1130,1020,'#544639',13);B(1067,974+Math.abs(j)*19,115,22,'#7b644c');if(s===2){B(892,1003,240,35,'#d4c5a7');B(889,973+Math.abs(j)*15,246,33,'#725943');artisan(era,t,1017,985+Math.abs(j)*15);}}
 } else if(kind==='machine'){
   B(826,1060,375,175,'#767773');for(let i=0;i<3;i++){C(875+i*133,1095,48,'#c3c6bb');C(875+i*133,1095,9,'#647571');}
   shape(spline([[811,1025],[880,994+wave(t*2)*3],[965,1004],[1040,989],[1154,1007],[1210,1002],[1210,1023],[810,1045]]),{fill:'#f6e9c8',lw:4});
   for(let i=0;i<3;i++){let a=t*2+i;L(875+i*133,1095,875+i*133+35*Math.cos(a),1095+35*Math.sin(a),'#6c7270',5);}
   artisan(era,t,850,1007);
 }else{artisan(era,t,975,1070);}
}
function watch(kind,era,t){
 if(watchInstruction(kind,era,t))return;
 const j=wave(t*2.8),s=phase();
 if(kind==='sun'){
   B(850,1132,350,68,'#d0b17a');B(998,966,25,163,'#b48a55');
   L(1012,969,1012+110*Math.cos(t*.3),969+110*Math.sin(t*.3),'#766b63',18);
   artisan(era,t,s===0?1007:1105,1002);
   for(let i=0;i<4;i++)L(900+i*70,1165,920+i*70,1165,'#7b614c',5);
 }else if(kind==='water'){
   B(955,985,180,185,'#7fa8b1');B(977,1020,134,95,'#afd8e5');
   for(let i=0;i<5;i++)L(967+i*35,1153,967+i*35,1159,'#506b78',4);
   push();translate(915,949);rotate(-.4+wave(t*2)*.15);B(-64,-43,128,88,'#b7a080');pop();
   for(let i=0;i<6;i++) C(970+i*4,1018+i*17+((t*30)%20),3,'#85d1e2');
   artisan(era,t,917,937);
 }else if(kind==='tower'){
   B(850,945,328,256,'#987b5e');for(let i=0;i<3;i++){C(910+i*113,1040,48,'#c5a970');for(let k=0;k<8;k++){const a=k*Math.PI/4+t*.6;L(910+i*113,1040,910+i*113+35*Math.cos(a),1040+35*Math.sin(a),'#7c6145',6);}}
   L(1070,1070,1070,1193,'#4f4c48',10);B(1041,1160+wave(t)*15,60,35,'#6a615b');artisan(era,t,1100,998);
 }else if(kind==='pocket'||kind==='spring'){
   B(878,994,280,163,'#9b7954');C(1020,1060,77,'#e5c989');C(1020,1060,54,'#f9e3b2');
   for(let i=0;i<25;i++){let a=i*.43+t*.3,r=i*2;dot(1020+Math.cos(a)*r,1060+Math.sin(a)*r,3,'#80674b');}
   L(931,962,1040,1030,'#777f82',9);artisan(era,t,931+j*20,957);
 }else if(kind==='quartz'){
   B(864,1016,302,162,'#446b5f');C(1002,1080,50,'#e8e4d7');
   for(let i=0;i<7;i++){L(877+i*40,1135,883+i*40,1056,'#c6b267',4);C(887+i*40,1090,8,'#d8b562');}
   C(1020+j*8,1080,25,'#b3c5d5');artisan(era,t,995,1035);
 }else{
   B(915,1008,205,135,'#404958');B(931,1024,173,102,'#1c353e');text('10:08',1019,1086,{font:'700 38px "Baloo 2"',fill:'#e0fff2'});
   C(1010,1160,15,'#62dfa2');artisan(era,t,1010+j*9,1100);
 }
}
function umbrella(kind,era,t){
 const j=wave(t*2.8),s=phase(),cx=1020;
 if(kind==='folding'){
   B(858,1090,318,58,'#c36b57');L(900,1095,1120,1095,'#796e65',12);
   let dx=40+80*(.5+.5*j);B(952,1020,28,160-dx*.3,'#aaa8a2');
   artisan(era,t,980+dx*.5,1055);for(let i=0;i<5;i++)L(925+i*45,1080,920+i*45,1080-10*(s+1),'#ad5f52',5);
 }else{
   const cy=976+(kind==='sunshade'?0:40);
   const r=kind==='steel'?164:kind==='hanway'?170:170;
   const open=kind==='auto' ? (.45+.55*(.5+.5*j)) : 1;
   shape(spline([[-r,0],[-r*.66,-95*open],[-r*.33,-135*open],[0,-145*open],[r*.33,-135*open],[r*.66,-95*open],[r,0],[r*.5,-12],[0,-5],[-r*.5,-12]].map(([x,y])=>[cx+x,cy+y])),{fill:kind==='oilpaper'?'#eaba7e':kind==='steel'?'#8f86c2':kind==='sunshade'?'#f0d18e':'#6aaaba',lw:7});
   for(let i=-2;i<=2;i++)L(cx,cy-145*open,cx+i*65,cy,'#785a4c',5);
   L(cx,cy-140*open,cx,1204,'#5e5858',12);
   if(kind==='oilpaper'){for(let i=0;i<7;i++)L(cx-130+i*41,cy-55,cx-128+i*41+j*7,cy-95,'#966b4c',7);artisan(era,t,920+j*17,cy-78);}
   else if(kind==='steel'){L(915+j*15,994,1040,980,'#afbfc4',12);artisan(era,t,915+j*15,994);}
   else if(kind==='auto'){B(cx-20,1130,44,38,'#343b3c');artisan(era,t,cx-8,1140);}
   else{artisan(era,t,cx-14+j*7,1121);}
   if(kind==='rain'||kind==='hanway'||kind==='auto')for(let i=0;i<12;i++)L(825+i*34,870+(t*60+i*30)%200,813+i*34,890+(t*60+i*30)%200,'#8fc7d9',4);
 }
}
function key(kind,era,t){
 const j=wave(t*3.5),s=phase(),x=1012;
 B(856,1017,325,179,kind==='wood'?'#9a7950':'#7d8990');
 B(905,1050,218,82,'#d8c499',7);
 if(kind==='card'){
   B(1088,1050,63,80,'#395f63');B(1099,1058,39,25,j>0?'#60da94':'#d97761');
   B(926,1010+j*9,138,78,'#73bfd3');artisan(era,t,994,1030+j*9);return;
 }
 if(kind==='wood'){
   B(913,1070,200,40,'#8c6241');for(let i=0;i<4;i++)B(949+i*38,1046-(s===2?24:0),22,47,'#b7976e');
   L(912,1137,x+j*20,1100,'#b89061',24);artisan(era,t,x+j*20,1103);return;
 }
 // Key in real contact with a lock, plus visible moving internal components.
 L(897,1132,x+j*22,1100,'#dbb65f',22);C(885,1139,31,'#d6b16a');
 for(let i=0;i<4;i++)B(953+i*44,1055+(s===2?-14:0),24,34,'#c7a062');
 if(kind==='roman'||kind==='warded'){
   B(975,989,70,42,'#55565a');L(986+j*15,946,1018,1015,'#705e4e',15);
   if(j>0.75)for(let k=0;k<4;k++)L(1015,1016,1030+k*12,1010-k*13,'#efcf70',3);
   artisan(era,t,985+j*15,950);
 }else if(kind==='barron'||kind==='chubb'){
   for(let k=0;k<3;k++)L(967+k*48,1080,960+k*48,1025-(s===2?18:0),'#5e6f71',13);
   if(kind==='chubb')B(1120,1028,38,28,s===1?'#c35950':'#69ba79');
   artisan(era,t,1005+j*13,1094);
 }else if(kind==='yale'){
   for(let k=0;k<6;k++){B(929+k*36,1046,20,75-(s===2?22:0),'#d3ad68');L(939+k*36,1024,939+k*36,1043,'#697980',3);}
   artisan(era,t,1018+j*10,1085);
 }else artisan(era,t,1018+j*10,1085);
}
function pencil(kind,era,t){
 const j=wave(t*3),s=phase();
 B(865,1028,320,170,'#b88e60');B(899,1060,249,108,'#f2e6cc');
 for(let k=0;k<5;k++)L(917,1080+k*16,1058,1080+k*16,'#d8c6a6',2);
 if(kind==='graphite'){
   B(878,980,236,35,'#45484a');for(let k=0;k<7;k++)L(880+k*32,960,900+k*32,940,'#5b5a59',8);
   L(900+j*30,906,946+j*30,1010,'#986c48',16);L(903+j*30,911,944+j*30,911,'#74787a',15);
   artisan(era,t,948+j*35,983);
 }else if(kind==='holder'||kind==='wood'){
   B(930,973,225,43,'#c9a465');B(970,980,165,25,'#45494b');
   B(990+j*13,962,78,13,'#e1c48a');artisan(era,t,990+j*13,969);
 }else if(kind==='conte'){
   B(921,983,210,40,'#515256');B(960,972,118,55,'#c7a78b');for(let i=0;i<5;i++)L(950+i*34,1020,965+i*34,1050,'#c2b0a1',7);
   artisan(era,t,1000+j*23,980);
 }else{
   L(930,1112,1080+j*30,1056+j*13,'#d7ae58',23);L(1080+j*30,1056+j*13,1097+j*30,1047+j*13,'#44454a',7);
   L(940,1129,1066,1129+j*6,kind==='colour'?'#508ac7':'#6a615f',5);
   if(kind==='eraser'){B(906,1090,38,40,'#d9879b');B(922,1105,40,27,'#d5b1b9');}
   artisan(era,t,1033+j*31,1069+j*13);
 }
}
export function renderWorkshop(type,kind,era,t){
 if(type==='paper')paper(kind,era,t);
 else if(type==='watch')watch(kind,era,t);
 else if(type==='umbrella')umbrella(kind,era,t);
 else if(type==='key')key(kind,era,t);
 else if(type==='pencil')pencil(kind,era,t);
}
