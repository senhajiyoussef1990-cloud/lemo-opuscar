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
// LOCK AND KEY: line-driven demonstrations, no generic repeated loop.
// The tool and each mechanical component change only as the relevant narrated
// instruction is spoken, then hold an understandable final state for dialogue.
function key(kind,era,t){
 const id=activeId||'', u=Math.max(0,Math.min(1,progress));
 const E=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const working=new Set(['a2','b2','c1','c2','d2','e2','f2','g2']);
 const a=working.has(id)?E(u):0;
 const ink='#4b4040', gold='#d4a657', iron='#68777e',wood='#b98c5c';
 const tooth=(x,y,h=15,col=gold)=>B(x,y,17,h,col,3);
 const bench=()=>{B(842,1193,389,41,'#775239');B(864,1233,28,50,'#66432e');B(1191,1233,28,50,'#66432e');};
 function lockplate(label,col='#78828b'){
   B(851,990,357,210,col,17);
   B(875,1015,310,158,'#e2d0ad',9);
   B(884,1023,290,141,'#f8e6bc',7);
 }
 function bolt(x=0,y=1138){B(1040+x,y,152,24,'#7b7a73',4);B(1167+x,y-9,37,41,'#656f70',3);}
 const keyShaft=(x,y,travel=0,col=gold)=>{
   // Single continuous shaft with five genuinely different teeth.
   C(x+travel,y,27,col);C(x+travel,y,11,'#f0dec2');
   B(x+travel+22,y-13,180,25,col,5);
   for(let k=0;k<5;k++)tooth(x+travel+100+k*21,y+10,12+(k%3)*11,col);
 };
 const fingerTool=(hx,hy)=>artisan(era,t,hx,hy,{left:745,feet:1390});

 if(kind==='wood'){
   bench();
   B(847,1001,359,187,'#95653e',13);
   B(866,1021,325,143,'#d6ad74',8);
   B(890,1037,278,100,'#f1d2a0',7);
   // Deep slots and vertical wooden locking pins in a cutaway.
   for(let k=0;k<4;k++){
     const x=949+k*52, raised=a*24;
     B(x-12,1030,31,82,'#875d38',4);
     B(x-7,1040-raised,21,71,'#e6c28b',3);
     L(x+3,1040-raised,x+3,1095-raised,'#9e7146',3);
   }
   B(902,1124,251,21,'#86603e',3);
   const travel=a*72;
   keyShaft(790,1096,travel,wood);
   bolt(a*30,1156);
   fingerTool(826+travel,1096);
   // Only during the explanatory line: the pins visibly rise and release the bolt.
   return;
 }
 if(kind==='roman'){
   bench();
   B(865,1085,317,35,'#5d6871',9);
   B(948,1118,151,47,'#70757b',5);
   // Bloom of iron heated in a small ancient forge.
   B(1083,1041,112,68,'#6e5142',7);
   for(let k=0;k<4;k++){const h=34+(k%2)*18;shape(spline([[1100+k*21,1063],[1107+k*21,1063-h],[1119+k*21,1063]]),{fill:'#ed9f50',lw:3});}
   const hammerY=954+E(Math.min(1,a*2))*99;
   // Hammer held by the ONLY front working arm of the artisan.
   L(941,hammerY,1012,hammerY+24,'#927f68',16);
   B(992,hammerY+7,47,31,'#62676b',5);
   B(978,1067,174,17,a>.45?'#e6a16b':'#90999b',4);
   if(a>.40&&a<.64)for(let k=0;k<5;k++)L(1010+k*10,1054,1011+k*17,1036-k*7,'#f3c365',3);
   fingerTool(942,hammerY);
   return;
 }
 if(kind==='warded'){
   bench();
   B(859,1082,353,44,'#a38663',7);
   B(907,1135,184,34,'#786552',4);
   // Warded key forging: file the individual teeth, do not magically rotate them.
   const travel=E(a)*88;
   keyShaft(857,1045,0,'#c4a26e');
   B(1003+travel,975,120,15,'#6d767a',3);
   for(let k=0;k<8;k++)L(1006+travel+k*15,974,1017+travel+k*15,988,'#aeb6ba',2);
   if(id==='c1'){
     B(984,1021+travel*.36,39,25,'#64727a',4);
     L(1001,1021,1001,1059,'#b4bec1',6);
     fingerTool(997,1025+travel*.36);
   }else fingerTool(1011+travel,986);
   return;
 }
 if(kind==='barron'){
   bench();lockplate('Levers');
   // Robert Barron: 3 independent lever plates, lifted to an aligned gate.
   const levels=[0,21,10], dy=[16,31,24];
   for(let k=0;k<3;k++){
     const x=958+k*64;
     B(x-16,1029,39,79,'#b4a59a',6);
     B(x-9,1045-E(a)*dy[k],23,71,'#b8a45f',4);
     B(x-2,1064-E(a)*dy[k]+levels[k],9,22,'#847453',3);
   }
   L(893,1095,1163,1095,'#d0b47e',6);
   keyShaft(812,1117,a*79,'#d9ba7a');
   bolt(a*51,1136);
   fingerTool(851+a*79,1118);
   return;
 }
 if(kind==='chubb'){
   bench();lockplate('Chubb','#667578');
   // First use a mismatched key that trips the detector. Then the correct key
   // resets the mechanism and releases the bolt, all within the spoken line.
   const mismatch=id==='e2'&&a<.50;
   const correct=id==='e2'&&a>=.50;
   const stage=correct?E((a-.5)*2):mismatch?E(a*2):0;
   for(let k=0;k<4;k++){
     const x=924+k*54,lift=correct?17: mismatch?(k===2?4:20):0;
     B(x,1038-lift,28,68,'#b3a181',4);
     B(x+4,1049-lift,17,21,'#8a7452',3);
   }
   B(1107,1043,56,38,mismatch?'#b95148':correct?'#5ba887':'#807d65',6);
   if(mismatch){L(1121,1043,1121,1091,'#aa483a',7);}
   if(correct){L(1121,1043,1147,1061,'#67a882',7);}
   keyShaft(819,1118,a*68,'#d2b36f');
   bolt(correct?stage*47:0,1138);
   fingerTool(855+a*68,1119);
   return;
 }
 if(kind==='yale'){
   bench();lockplate('Pins','#77828a');
   // Yale's pin tumbler in cutaway: stacks meet at the shear line when
   // the right key lifts the varied key pins to their proper heights.
   B(889,1022,287,136,'#a9b3ba',10);
   B(896,1084,273,67,'#dec9a4',7);
   const heights=[16,38,23,47,29,40];
   for(let k=0;k<6;k++){
     const x=916+k*44, lift=heights[k]*a;
     B(x+5,1029,23,18,'#dae1d9',3);
     L(x+16,1048,x+16,1073-lift,'#74858b',5);
     B(x+4,1059-lift,24,30,'#b9a36e',4);
     B(x+4,1089-lift,24,29,'#d8b878',4);
     tooth(x+7,1131-heights[k]*.43,13+heights[k]*.43,'#d9b468');
   }
   L(896,1084,1170,1084, a>.99?'#5baf8a':'#c4775c',4);
   keyShaft(800,1134,a*57,'#d6ac64');
   bolt(a>.92?(a-.92)*600:0,1156);
   fingerTool(836+a*57,1135);
   return;
 }
 if(kind==='card'){
   bench();
   B(886,970,279,214,'#535d64',17);
   B(907,990,238,126,'#253d47',10);
   B(933,1009,184,61,'#b0d7d7',8);
   for(let i=0;i<3;i++)C(958+i*73,1096,9,'#6a8c92');
   const near=a*136;
   const unlocked=a>.65;
   B(828+near,985,133,82,'#7dcae0',8);
   B(851+near,999,52,28,'#edcd83',5);
   L(851+near,1047,939+near,1047,'#e7f7e8',5);
   if(a>.30)for(let k=1;k<=3;k++)L(1032-k*12,1038-k*7,1032-k*12,1005-k*6,'#d4f1dd',3);
   B(1122,1023,22,22,unlocked?'#69d19a':'#e6ad70',9);
   B(1115+Math.max(0,a-.68)*79,1140,70,23,'#a4adb0',4);
   fingerTool(859+near,1009);
   return;
 }
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
