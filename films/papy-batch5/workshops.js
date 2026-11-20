// Le Livre de Papy — demonstrations, rendered entirely in 2D code.
// Every historical insert contains an artisan and a tool that moves under the artisan's hand.
// The montage chooses the current spoken line and progress within that line.
import {push,pop,translate,rotate,scale,shape,stroke,ell,rr,spline,dot,text,fillOnly,rect,arc,quad,noodle,setCtx,g,S,W,H} from './toon.js';
import {figure,LOOK,FIG_K} from './people.js';
import {hand} from './chars.js';
let activeId=null,progress=0;
export function setWorkshopAction(id,u){activeId=id;progress=Math.max(0,Math.min(1,Number(u)||0));}
const B=(x,y,w,h,c,r=8)=>shape(rr(x,y,w,h,r),{fill:c,lw:5,shade:()=>{fillOnly(rect(x,y,w,Math.max(3,h*.16)),'rgba(255,255,255,.2)',{boil:.2});fillOnly(rect(x,y+h*.8,w,h*.2+2),'rgba(20,10,0,.16)',{boil:.2});fillOnly(rect(x+w*.82,y,w*.18,h),'rgba(20,10,0,.08)',{boil:.2});}});
const L=(x,y,a,b,c='#514236',w=7)=>stroke([[x,y],[a,b]],w,{line:c});
const C=(x,y,r,c)=>shape(ell(x,y,r,r,28),{fill:c,lw:5,shade:()=>{fillOnly(ell(x-r*.35,y-r*.4,r*.35,r*.22,12),'rgba(255,255,255,.35)',{boil:.2});fillOnly(ell(x+r*.2,y+r*.45,r*.7,r*.3,12),'rgba(20,10,0,.14)',{boil:.2});}});
const wave=Math.sin;
const phase=()=>Math.min(2,Math.floor(progress*3));
const tool=(x,y,c='#b7a079')=>{L(x-10,y-5,x+10,y+5,c,11);C(x+10,y+5,5,c)};
// Two passes per frame: an invisible probe finds where the hands must go, then the artisan's body is drawn BEHIND
// the props, and the arms and hands are drawn on top of the tool they hold.
let PASS='draw',TGT=null,TYPE='paper';
const PROBE=typeof document!=='undefined'?document.createElement('canvas'):null; if(PROBE){PROBE.width=W;PROBE.height=H;}
const BX=1135,BF=1400,BS=.8;
const SK={antique:'#b07a52',chinese:'#f0c9a0',medieval:'#e7b48c',georgian:'#f2c9a0',victorian:'#f2c9a0',thirties:'#e7b48c',fifties:'#e7b48c',lab:'#e7b48c',modern:'#b9794f',monk:'#f2c9a0'};
const APRON={antique:'#e9dcc0',chinese:'#6a5a4a',medieval:'#c9b28a',georgian:'#d8cbb0',victorian:'#5a4a3a',thirties:'#6a6a72',fifties:'#3a5a7a',lab:'#ffffff',modern:'#2a3a4a'};
function artisan(era,t,hx,hy){ if(PASS==='probe'){TGT={era:era||'medieval',hx,hy};return;} arms(era||'medieval',t,hx,hy); }
function body(era,t){
  const k=BS*FIG_K, L=LOOK[era]||LOOK.medieval, skin=SK[era]||'#e7b48c';
  figure(BX,BF,BS,t,{era,skin,face:-1,arms:0,walk:0,hideFrontArm:true,hideBackArm:true,lid:.45,sm:.15});
  // a work apron tied at the waist, with a pocket
  push();translate(BX,BF);scale(-k,k);
  shape(spline([[-34,-300],[34,-300],[44,-170],[0,-160],[-44,-170]]),{fill:APRON[era]||'#c9b28a',lw:4,shade:()=>{fillOnly(rect(10,-310,40,160),'rgba(0,0,0,.1)',{boil:.2});}});
  stroke([[-40,-300],[-52,-340]],3);stroke([[40,-300],[52,-340]],3);shape(rr(-18,-240,36,26,4),{fill:'rgba(0,0,0,.08)',lw:3});
  pop();
}
function ik(sx,sy,tx,ty,a1,a2){ // elbow of a two-bone arm from shoulder to hand: always the natural one, hanging below
  let dx=tx-sx,dy=ty-sy,d=Math.hypot(dx,dy); const m=a1+a2-2; if(d>m){tx=sx+dx/d*m;ty=sy+dy/d*m;dx=tx-sx;dy=ty-sy;d=m;}
  const ca=(a1*a1+d*d-a2*a2)/(2*a1*d), base=Math.atan2(dy,dx), off=Math.acos(Math.max(-1,Math.min(1,ca)));
  const e1=[sx+Math.cos(base+off)*a1,sy+Math.sin(base+off)*a1], e2=[sx+Math.cos(base-off)*a1,sy+Math.sin(base-off)*a1];
  let el=e1[1]>e2[1]?e1:e2;                                      // the lower elbow
  if(Math.abs(e1[1]-e2[1])<20) el=(e1[0]>e2[0])?e1:e2;           // nearly level: the elbow stays out to the side, away from the work
  return [el,[tx,ty]];
}
function arms(era,t,hx,hy,only=null){
  const k=BS*FIG_K, L=LOOK[era]||LOOK.medieval, sl=L.top, skin=SK[era]||'#e7b48c';
  const sh=[[BX-50*k,BF-330*k],[BX+50*k,BF-330*k]];           // front shoulder (toward the work), back shoulder
  const fine=TYPE==='watch'||TYPE==='key';                       // delicate mechanisms: one hand with watchmaker's tweezers, the other resting on the bench
  let hands=[[hx,hy],[hx+44,hy+20]];
  if(fine){const s0=sh[0],dx=s0[0]-hx,dy=s0[1]-hy,d=Math.hypot(dx,dy)||1;hands=[[hx+dx/d*95,hy+dy/d*95],[BX-40,1178]];TW=[hands[0],[hx,hy]];}else TW=null;
  const sturdy=TYPE==='zipper';  // V2: full, proportional upper/lower sleeves on the new pilot episode
  if(sturdy) hands[1]=[BX+4,1173];  // supporting hand resting on the workbench, not piled over the working hand
  (only!==null?[only]:fine?[0]:[1,0]).forEach(i=>{const [s,hd]=[sh[i],hands[i]];const [el,hp]=ik(s[0],s[1],hd[0],hd[1],sturdy?153:140,sturdy?147:135);
    const upper=sturdy?66:44,lower=sturdy?55:38;
    shape(noodle(s,el,0,upper,sturdy?54:38),{fill:sl,lw:6,shade:()=>fillOnly(ell(el[0],el[1],sturdy?30:24,40,12),'rgba(0,0,0,.12)',{boil:.2})});
    shape(noodle(el,hp,0,lower,sturdy?41:30),{fill:sl,lw:6});
    shape(ell(hp[0]+(el[0]-hp[0])*.12,hp[1]+(el[1]-hp[1])*.12,sturdy?23:17,sturdy?19:14,12),{fill:L.topS||sl,lw:4});
    hand(hp[0],hp[1],Math.atan2(hp[1]-el[1],hp[0]-el[0]),sturdy?25:22,skin,{fist:true,lw:5});
    if(i===0&&TW){const [a,b]=TW,an=Math.atan2(b[1]-a[1],b[0]-a[0]),nx=-Math.sin(an)*6,ny=Math.cos(an)*6;   // steel tweezers to the part
      stroke([[a[0]+nx,a[1]+ny],[b[0]+nx*.2,b[1]+ny*.2]],5,{line:'#9aa3ad'});stroke([[a[0]-nx,a[1]-ny],[b[0]-nx*.2,b[1]-ny*.2]],5,{line:'#c9d0d8'});dot(b[0],b[1],5,'#e9b949');}});
}
let TW=null;
function vat(t){
  // a wooden vat: staves, two iron hoops, water that moves, fibres floating in the pulp
  shape(spline([[852,1060],[1184,1060],[1170,1220],[866,1220]]),{fill:'#805b42',lw:6,shade:()=>{for(let k=0;k<9;k++)stroke([[870+k*36,1062],[874+k*34,1218]],3,{line:'#6a4834'});fillOnly(rect(1120,1060,70,165),'rgba(0,0,0,.14)',{boil:.2});}});
  for(const y of [1100,1180])shape(rr(856,y,326,14,5),{fill:'#5a5e66',lw:4,shade:()=>fillOnly(rect(856,y,326,4),'rgba(255,255,255,.3)',{boil:.1})});
  shape(ell(1018,1066,166,26,30),{fill:'#9ccfd3',lw:5,shade:()=>{fillOnly(ell(1018,1072,150,18,24),'#d9cfae',{boil:.4});for(let k=0;k<5;k++){const a=(t*.8+k*.2)%1;stroke(ell(930+k*45,1066,20+a*30,4+a*5,14),2,{line:`rgba(255,255,255,${.6*(1-a)})`});}
    for(let k=0;k<14;k++)stroke([[880+k*20+Math.sin(t+k)*6,1060+(k%3)*5],[892+k*20+Math.sin(t+k)*6,1064+(k%3)*5]],2.5,{line:'#bfae84'});}});
}
function sieve(x,y,t){
  // a papermaking mould: a wooden frame, fine wires, ribs, the deckle on top, the wet sheet forming, water dripping
  shape(rr(x,y,230,114,6),{fill:'#775a45',lw:5,shade:()=>{fillOnly(rect(x,y,230,10),'rgba(255,255,255,.18)',{boil:.2});for(let k=0;k<6;k++)stroke([[x+6,y+18*k+8],[x+40,y+18*k+12]],2,{line:'#5a4232'});}});
  shape(rr(x+12,y+12,206,90,3),{fill:'#e9e0bd',lw:3,shade:()=>{for(let i=0;i<22;i++)stroke([[x+16+i*9.6,y+12],[x+16+i*9.6,y+102]],1,{line:'rgba(90,80,60,.35)'});for(let i=1;i<6;i++)stroke([[x+12,y+12+i*15],[x+218,y+12+i*15]],2,{line:'rgba(90,80,60,.45)'});fillOnly(ell(x+80,y+40,40,12,12),'rgba(255,255,255,.4)',{boil:.2});}});
  shape(rr(x-4,y-6,238,14,4),{fill:'#8a6a52',lw:4});
  for(let k=0;k<6;k++){const u=(t*1.4+k/6)%1;dot(x+20+k*38,y+118+u*60,4*(1-u)+1,'rgba(130,190,210,.9)');}
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
// Seven clocks and watches, with motion driven by the line being narrated.
// Continuous clock motion is reserved for the escapement/balance demonstration.
function watch(kind,era,t){
 const id=activeId||'', u=Math.max(0,Math.min(1,progress));
 const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
 const run=id.endsWith('2')||id==='d1'||id==='e1';
 const q=run?ease(u):0;
 const wood='#ad8056', gold='#d4ad65', iron='#717980', ivory='#f4dfb5';
 const desk=()=>{B(844,1176,369,42,'#7a563f',5);B(863,1217,28,70,'#664b38',4);B(1163,1217,28,70,'#664b38',4);};
 const gear=(x,y,r,angle=0)=>{
  C(x,y,r,'#c8ab6b'); C(x,y,r-10,'#f4dba4'); C(x,y,11,'#756148');
  for(let k=0;k<12;k++){let a=k*Math.PI/6+angle;L(x+(r-8)*Math.cos(a),y+(r-8)*Math.sin(a),x+(r+8)*Math.cos(a),y+(r+8)*Math.sin(a),'#b99459',7);}
 };
 if(kind==='sun'){
  B(850,1080,355,112,'#cdb584',7);
  B(870,1100,317,74,'#e8cf9c',5);
  for(let k=0;k<6;k++)L(900+k*50,1150,910+k*50,1162,'#897051',4);
  // Gnomon stays planted; its shadow advances as sunlight changes.
  B(1018,985,17,101,'#846b49',3);
  C(1027,987,13,'#bc9458');
  let xx=1028+(run?85*q:55), yy=1120+(run?45*q:0);
  L(1027,1080,xx,yy,'#665747',14);
  C(xx,yy,8,'#71644e');
  artisan(era,t,1027,996);
  return;
 }
 if(kind==='water'){
  desk();B(912,969,252,205,'#8ba4a7',16);B(934,988,208,160,'#d5ece7',8);
  // Graduated clepsydra; the water level visibly falls as the line progresses.
  const h=run?112-95*q:102;
  B(948,1138-h,180,h,'#65bfd3',1);
  for(let k=0;k<6;k++)L(1135,1015+k*23,1158,1015+k*23,'#506b77',4);
  C(1035,1149,8,'#e4d1b4');
  if(id==='b2')for(let k=0;k<3;k++)C(1036,1160+k*24,5,'#7dcfe2');
  B(989,1184,121,16,'#77b1c3',4);
  artisan(era,t,944,1003);
  return;
 }
 if(kind==='tower'){
  B(839,944,376,252,'#a58b66',9);
  B(866,964,326,210,'#d0b892',8);
  // Hanging weights are pulled up once before the gearing turns.
  const lift=id==='c2'?80*q:0;
  for(let k=0;k<2;k++){
   L(909+k*274,1000,909+k*274,1141-lift*(k===0?1:.32),'#666665',6);
   B(886+k*274,1134-lift*(k===0?1:.32),46,56,'#6b6b67',5);
  }
  gear(979,1027,42,id==='c2'?q*1.7:0);
  gear(1061,1028,43,id==='c2'?-q*1.7:0);
  C(1023,1108,48,'#f4ddad');
  L(1023,1108,1045+30*q,1076-22*q,'#655a48',6);
  L(1023,1108,1011+16*q,1063,'#8f6041',5);
  artisan(era,t,910,1086-lift*.7);
  return;
 }
 if(kind==='pocket'){
  desk();
  B(891,973,271,195,'#916949',12);
  gear(977,1045,42,q*2.1);
  gear(1078,1060,34,-q*1.3);
  C(1059,1113,48,'#dfc48b');C(1059,1113,35,ivory);
  L(1059,1113,1078+14*q,1083-8*q,'#79634c',5);
  B(990,1174,160,17,'#a38966',6);
  // A small winding spring is placed into its casing.
  for(let k=0;k<21;k++){let a=k*.56, r=k*1.2;C(973+Math.cos(a)*r,1125+Math.sin(a)*r,2,'#82776b');}
  artisan(era,t,944+65*q,998+30*q);
  return;
 }
 if(kind==='spring'){
  desk();
  B(890,976,285,192,'#6c847c',13);B(905,995,250,159,'#e4d5b3',6);
  C(1011,1067,83,'#ceaa6b');C(1011,1067,56,'#f0d3a6');
  const rotor=id==='e2'?Math.sin(t*6)*.20:0;
  for(let k=0;k<25;k++){const theta=k*.61+rotor, radius=2.1*k;C(1011+Math.cos(theta)*radius,1068+Math.sin(theta)*radius,3,'#8f7658');}
  L(1011,1067,1084+rotor*43,1054,'#6a6f6d',7);
  gear(1131,1103,24,id==='e2'?t*.7:0);
  if(id==='e2')L(946+65*q,990,1008,1038,'#90999a',8);
  artisan(era,t,952+55*q,1000);
  return;
 }
 if(kind==='quartz'){
  desk();
  B(879,986,308,179,'#536f65',14);
  B(902,1004,268,147,'#90b8ac',6);
  // The quartz crystal and oscillator circuit; one trace lights up with power.
  C(951,1051,23,'#e2e6d5');B(928,1087,66,26,ivory,4);
  B(1023,1033,99,62,'#657279',5);
  for(let k=0;k<8;k++)L(1043+k*10,1094,1043+k*10,1117,'#c7a967',3);
  L(976,1050,1025,1050,q>.48?'#75d0a0':'#cbb889',5);
  L(1026,1050,1132,1047,q>.75?'#75d0a0':'#cbb889',5);
  C(1143,1047,10,q>.75?'#61d8a1':'#a0a49b');
  artisan(era,t,1006,1085);
  return;
 }
 // Modern smartwatch: Papy's explanation is an actual screen interaction.
 desk();
 B(957,957,111,267,'#323e4c',15);
 B(937,1000,155,166,'#505f6a',23);
 B(947,1012,134,142,'#1b3b49',13);
 if(id==='g2'&&q>.73){
  C(1006,1069,30,'#5fc69f');L(989,1070,1003,1081,'#e1f6ed',6);L(1003,1081,1024,1048,'#e1f6ed',6);
 }else if(id==='g2'&&q>.42){
  for(let k=0;k<5;k++)B(965+k*21,1091-k*12,14,30+k*10,'#6ac3ba',2);
  text('PAS',1013,1047,{font:'700 22px "Baloo 2"',fill:'#d8f8ec'});
 }else{
  text('10:08',1015,1078,{font:'700 36px "Baloo 2"',fill:'#dbf9e5'});
  L(982,1097,1049,1097,'#67d8bb',3);
 }
 artisan(era,t,1050-44*q,1086-35*q);
}

// Parasol to automatic umbrella: the demonstrated motion corresponds to
// the narrated steps, and never loops through unrelated decorative gestures.
function umbrella(kind,era,t){
 const id=activeId||'',u=Math.max(0,Math.min(1,progress));
 const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
 const q=id.endsWith('2')?ease(u):0;
 const cx=1053,cy=994;
 const canopy=(cx,cy,r,opening,colour)=>{
  const o=Math.max(.10,Math.min(1,opening));
  const h=132*o;
  shape(spline([[-r,0],[-r*.67,-h*.68],[-r*.34,-h*.96],[0,-h],[r*.34,-h*.96],[r*.67,-h*.68],[r,0],[r*.50,-5],[0,-8],[-r*.5,-5],[-r,0]].map(([x,y])=>[cx+x,cy+y])),{fill:colour,lw:6});
  for(let k=-3;k<=3;k++)L(cx,cy-h,cx+k*r/3,cy,'#857166',3);
  L(cx,cy-h,cx,1222,'#5d5d5d',9);
  C(cx,cy-h,10,'#d0b67d');
 };
 const rain=(shield=true)=>{
  for(let k=0;k<12;k++){
   let x=856+k*29, yy=941+(k%5)*64+(id.endsWith('2')?100*q:0);
   if(shield&&x>906&&x<1200&&yy>955&&yy<1140)continue;
   L(x,yy,x-10,yy+24,'#70b3d0',3);
  }
 };
 const desk=()=>{B(859,1160,345,38,'#89684b',5);B(885,1197,29,65,'#76543e',5);};
 if(kind==='sunshade'){
  // An attendant raises the parasol above a second, stationary person.
  const rise=84*q;
  canopy(1077,950-rise,170,1,'#eed29c');
  C(1094,1171,28,'#dab18a');B(1081,1200,28,68,'#c7a785',5);
  artisan(era,t,1054,1138-rise);
  return;
 }
 if(kind==='oilpaper'){
  desk();
  canopy(1031,947,174,.95,'#e5ba7d');
  // Brush oil across taut panels, progressively tinting them to repel water.
  const x=902+215*q;
  for(let k=0;k<5;k++){
   const y=910-k*15;L(916+k*39,y,953+k*39,y-39,k/5<q?'#bd8246':'#d9c490',8);
  }
  L(x-17,929,x+31,869,'#8b6c4c',7);
  C(x+31,869,10,'#f2d4a5');
  artisan(era,t,x,928);
  return;
 }
 if(kind==='rain'){
  desk();
  const open=.28+.72*q;
  canopy(cx,1016,170,open,'#b46b64');
  if(id==='c2')rain(true);
  artisan(era,t,1053,1138);
  return;
 }
 if(kind==='hanway'){
  // One gentleman advancing under rainfall; no distracting background crowd.
  const shift=100*q;
  canopy(1015+shift,988,175,1,'#667c87');
  rain(true);
  artisan(era,t,1015+shift,1142,{left:775+shift*.30,feet:1390});
  return;
 }
 if(kind==='steel'){
  desk();
  const completed=q;
  canopy(1032,994,170,.45+.55*completed,'#a998c9');
  for(let k=-3;k<=3;k++){
   const endx=1032+k*56,endy=994,rooty=861-72*completed;
   L(1032,rooty,endx,endy,k/6+.5<completed?'#a5b5bd':'#867e6c',5);
   C(endx,endy,5,'#b1c5c9');
  }
  artisan(era,t,938+94*q,992);
  return;
 }
 if(kind==='folding'){
  desk();
  const fold=1-q;
  B(937,1081,204-80*q,32,'#7c8687',6);
  B(948,1111,16,94*(1-q)+31,'#757e82',5);
  L(964,1080,1032+26*q,1057,'#c07e74',9);
  for(let k=0;k<5;k++)L(953+k*22,1076,958+k*22,1076-65*fold,'#bb766c',5);
  B(979,1119,120-50*q,28,'#cc877a',5);
  artisan(era,t,1027+28*q,1065);
  return;
 }
 // Automatic canopy only opens when Papy talks about the button.
 const opened=.14+.86*q;
 canopy(cx,1014,170,opened,'#56b6b8');
 B(cx-15,1169,32,52,'#3e4848',7);
 C(cx+1,1178,9,'#d5d4bd');
 if(id==='g2')rain(true);
 artisan(era,t,cx+1,1178);
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

// The pencil story demonstrates seven distinct manufacturing techniques.
// The artisan has only one controlled working arm, and a tool moves only
// as Papy narrates the corresponding process (no endlessly waving hands).
function pencil(kind,era,t){
 const id=activeId||'', raw=Math.max(0,Math.min(1,progress));
 const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
 const instructional=/^[a-g]2$/.test(id)||id==='c1'||id==='d1'||id==='e1'||id==='f1';
 const q=instructional?ease(raw):0;
 const wood='#c89d68', iron='#72787c', graphite='#41464c', paper='#f1e3c3';
 const desk=()=>{B(855,1159,348,40,'#805c45',6);B(875,1198,28,62,'#684b3a',5);B(1166,1198,28,62,'#684b3a',5);};
 const sheet=()=>{B(894,1012,265,133,paper,7);for(let i=0;i<5;i++)L(914,1036+i*23,1133,1036+i*23,'#d9c6a5',2);};
 const rod=(x,y,len=174,color=graphite)=>{B(x,y,len,15,color,5);L(x+6,y+4,x+len-7,y+4,'#74716e',2);};
 const tip=(x,y,col=graphite)=>{L(x,y,x+23,y-6,col,10);};
 if(kind==='silver'){
   desk();sheet();
   // Metal-point line increases with the movement of the drawing hand.
   L(928,1094,928+q*155,1094-q*58,'#96978d',4);
   const x=924+q*154,y=1066-q*58;
   L(x-42,y-85,x+2,y+19,'#8e8e83',10);tip(x+2,y+19,'#7b7d7b');
   artisan(era,t,x-36,y-85);
   return;
 }
 if(kind==='graphite'){
   // Graphite is mined and lifted as a single solid black fragment.
   B(875,1124,327,77,'#67666a',9);
   B(888,1040,308,89,'#8c8b87',11);
   for(let i=0;i<5;i++)B(901+i*50,1056+(i%2)*12,66,30,graphite,5);
   const xx=1011+41*q,yy=1061-101*q;
   B(xx,yy,120,26,graphite,7);
   L(988,971,xx+34,yy+13,iron,12);
   artisan(era,t,990,975);
   return;
 }
 if(kind==='holder'){
   desk();sheet();
   B(914,971,242,42,wood,7);
   B(934,985,202,15,'#9f724d',4);
   // The black lead slides into a wooden holder, then a clamp secures it.
   const x=866+96*q;
   rod(x,988,180,graphite);
   B(1077,973+16*q,45,27,'#9e754a',4);
   if(q>.75) L(954,1007,1088,1007,'#63452f',4);
   artisan(era,t,998+58*q,980+11*q);
   return;
 }
 if(kind==='wood'){
   desk();sheet();
   // The graphite sits in a milled groove; a second wooden half closes.
   B(906,963,238,40,'#c7a06e',7);
   B(923,974,205,19,'#976e45',3);
   rod(922,975,205,graphite);
   B(906,1011-48*q,239,27,wood,5);
   for(let i=0;i<8;i++)L(918+i*28,972,923+i*28,967,'#976a45',2);
   artisan(era,t,1069,1015-48*q);
   return;
 }
 if(kind==='conte'){
   desk();
   B(913,994,252,172,'#927969',10);
   B(931,1012,217,135,'#e5d7b4',7);
   // Distinct graphite and clay piles combine, then firm graphite rods form.
   B(949,1042,75,46,graphite,10);
   B(1045,1047,70,43,'#bfaa94',10);
   if(id==='e2'&&q>.50){
     for(let i=0;i<5;i++)rod(937+i*35,1087-(i%2)*9,66,'#5a5550');
     B(1117,1070,19,77,'#b99365',4);
   }else{
     const x=983+q*93;
     L(x,974,x+12,1059,'#8f7254',14);
     C(1016,1091,31,q>.35?'#6f6459':'#aaa092');
   }
   artisan(era,t,994+48*q,975);
   return;
 }
 if(kind==='eraser'){
   desk();sheet();
   // A prepared graphite pencil gets a ferrule and a pink eraser inserted.
   L(896,1073,1105,1073,'#d3ad67',24);
   tip(1105,1073,graphite);
   B(890,1058,34,31,'#9d9fa2',4);
   const y=992+66*q;
   B(871,y,54,39,'#e28ba0',7);
   B(891,1055,20,38,'#a7adb0',3);
   artisan(era,t,898,y+8);
   if(id==='f2'&&q>.68)L(976,1108,1062,1108,'#777572',5);
   return;
 }
 // Present-day colour pencil deposits pigment along a continuous sketch.
 desk();sheet();
 const x=975+130*q,y=1066-45*q;
 L(x-112,y+36,x,y,'#44a0ba',19);
 tip(x,y,'#2a758a');
 L(931,1110,931+180*q,1110-66*q,'#5b91bf',6);
 if(q>.50)L(962,1086,1028,1044,'#d3917b',5);
 artisan(era,t,x-65,y+25);
}


/**
 * The Zipper / La fermeture éclair — seven historically staged, directional actions.
 * Interlocking teeth are explicit: behind the slider they close, ahead they remain apart.
 * One operator with thick articulated sleeves and a stabilising hand. Avoid looped waving.
 */
function zipper(kind,era,t){
 const id=activeId||'', u=Math.max(0,Math.min(1,progress)), e=u*u*(3-2*u);
 const teach=/^[a-g][12]$/.test(id)||id==='b5';
 const p=teach?e:.25;
 const cloth='#e6bf85',metal='#dbd1bc',dark='#666b70';
 const bench=()=>{
   B(837,1182,388,46,'#886045',8);
   B(866,1221,35,130,'#6a4635',5);
   B(1161,1221,32,130,'#6a4635',5);
   L(850,1190,1210,1190,'#bd9870',4);
 };
 const eye=(x,y)=>{C(x,y,11,'#d9b76e');C(x,y,5,'#585256');};
 const tapes=(y0=962)=>{
   B(903,y0,83,200,'#c79870',7);
   B(1042,y0,83,200,'#c79870',7);
   L(944,y0+11,944,y0+188,'#f4e0bd',3);
   L(1083,y0+11,1083,y0+188,'#f4e0bd',3);
 };
 const slider=(x,y)=>{B(x-24,y-14,48,35,'#7f8891',7);C(x,y+18,12,'#b6c0c7');B(x-8,y+15,16,24,'#c4bdbc',4);};
 const rows=(y0=975,step=19,joinedBoundary=9999)=>{
   for(let k=0;k<9;k++){
     const y=y0+k*step,joined=y>joinedBoundary;
     B(joined?991:978,y,28,10,metal,3);
     B(joined?1010:1022,y,28,10,'#abb0b1',3);
     if(joined) C(1014,y+6,3,'#514e4b');
   }
 };
 if(kind==='laces'){
   bench();
   B(907,930,215,239,'#80583e',24);
   B(924,949,182,207,'#b87e55',18);
   B(947,950,44,201,'#704930',8); B(1037,950,44,201,'#704930',8);
   for(let i=0;i<7;i++){
     const y=970+i*27;eye(982,y);eye(1042,y);
     if(i<Math.max(1,Math.ceil(p*7))){
       L(985,y,1038,y+14,'#e9d4a7',5);L(1038,y,985,y+14,'#e9d4a7',5);
     }
   }
   const yy=966+Math.round(p*6)*27;
   L(1040,yy,1113,yy-50,'#e9d4a7',5);
   artisan(era,t,1069,yy-19);
   return;
 }
 if(kind==='howe'){
   bench();tapes(956);
   // A conceptual line of separate clasps, not the modern interlocking slider.
   for(let k=0;k<7;k++){
     const y=977+k*24;
     B(986,y,25,13,'#aba4a1',5);
     if(k<Math.ceil(p*7)){B(1011,y,37,13,'#d9c59f',5);L(1000,y+7,1032,y+7,'#6e6760',3);}
   }
   B(1090,998+65*p,26,85,'#83654b',6);
   artisan(era,t,1061,1030+48*p);
   return;
 }
 if(kind==='judson'){
   bench();tapes();
   const ySlider=1121-135*p;
   for(let k=0;k<8;k++){
     const y=983+k*21,lock=y>ySlider;
     B(lock?992:968,y,31,12,'#9da4aa',5);
     B(lock?1011:1036,y,27,12,'#d7c5a8',5);
     if(lock)L(1002,y+7,1030,y+7,'#525b62',5);
   }
   slider(1015,ySlider);
   artisan(era,t,1038,ySlider-11);
   return;
 }
 if(kind==='teeth'||kind==='patent'){
   bench();tapes();
   const ySlider=1138-151*p;
   rows(984,19,ySlider);
   if(kind==='patent'){
     B(879,926,58,187,'#6a7378',8);
     B(890,958+49*p,106,21,'#939b9c',6);
     L(939,946,978,1002,'#5b6368',13);
     for(let i=0;i<6;i++)C(1141,988+i*26,5,'#beb4a5');
     artisan(era,t,985,1001+49*p);
   }else{
     slider(1011,ySlider);
     artisan(era,t,1047,ySlider-5);
   }
   return;
 }
 if(kind==='boot'){
   bench();
   B(908,936,172,201,'#45494c',35);
   B(869,1105,254,71,'#34383e',29);
   B(889,1127,219,20,'#697078',7);
   B(1003,967,36,168,'#a98f68',6);
   const y=1118-135*p;
   for(let k=0;k<8;k++){
     const yy=978+k*19; B(1011,yy,20,10,'#c2beb0',4);
   }
   slider(1022,y);
   artisan(era,t,1052,y-14);
   return;
 }
 // Today's zipper: a full bag; the teeth become joined as the pull goes right.
 bench();
 B(861,998,298,168,'#459a9d',23);
 B(892,941,234,75,'#368e93',25);
 B(908,1012,206,119,'#6fc2ba',12);
 L(910,1027,1116,1027,'#d7e5c6',6);
 const xpos=927+179*p;
 for(let i=0;i<12;i++){
   const xx=918+i*17,closed=xx<xpos;
   B(xx,1009,12,closed?19:12,closed?'#dcdfe0':'#b4c0c0',3);
 }
 slider(xpos,1008);
 artisan(era,t,xpos+18,991);
}

export function renderWorkshop(type,kind,era,t){
 TYPE=type;
 const run=()=>{if(type==='paper')paper(kind,era,t);else if(type==='watch')watch(kind,era,t);else if(type==='umbrella')umbrella(kind,era,t);else if(type==='key')key(kind,era,t);else if(type==='pencil')pencil(kind,era,t);else if(type==='zipper')zipper(kind,era,t);};
 if(PROBE){const main=g,sid=S.sid;setCtx(PROBE.getContext('2d'));PASS='probe';TGT=null;try{run();}finally{setCtx(main);S.sid=sid;PASS='draw';}
   if(TGT){shape(ell(BX,BF+4,90,16,18),{fill:'rgba(20,10,30,.18)',lw:0,stroke:false});body(TGT.era,t);if(TYPE==='watch'||TYPE==='key')arms(TGT.era,t,TGT.hx,TGT.hy,1);}}   // the resting arm stays behind the work
 run();
}
