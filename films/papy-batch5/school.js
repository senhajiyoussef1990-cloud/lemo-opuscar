// Le Livre de Papy — complete, historically varied school tools.
// Draw the object and its operation: no generic floating artefacts.
import {push,pop,translate,rotate,scale,shape,stroke,ell,rr,spline} from './toon.js';
export const SCHOOL_TYPES=new Set(['pen','eraser','notebook','ruler','sharpener','stapler','paperclip','tape','glue','calculator']);
const B=(x,y,w,h,col,r=8)=>shape(rr(x,y,w,h,r),{fill:col,lw:6});
const C=(x,y,rx,ry,col)=>shape(ell(x,y,rx,ry,28),{fill:col,lw:5});
const L=(x,y,X,Y,col='#5b4c41',w=5)=>stroke([[x,y],[X,Y]],w,{line:col});
const P=(pts,col)=>shape(spline(pts),{fill:col,lw:6});
const ink='#354452',wood='#a47753',gold='#e5b86b',metal='#a9bec1',cream='#eee6cf',paper='#faf4e5',blue='#6db9c5',green='#8fb294';
const lineSheet=(x,y,w=175,h=130)=>{B(x,y,w,h,paper,7);for(let i=0;i<5;i++)L(x+12,y+25+i*20,x+w-12,y+25+i*20,'#9dc2d1',2);};
const marks=(n,cb)=>{for(let i=0;i<n;i++)cb(i)};
function thing(type,kind,t){
 const k=kind||'modern';
 if(type==='pen'){
   push();rotate(.22);
   if(['reed','quill'].includes(k)){
      P([[-16,-155],[4,-177],[19,93],[0,141],[-18,91]],k==='quill'?'#f3e0b5':wood);
      marks(6,i=>L(-6,-93+i*19,17,-135+i*17,k==='quill'?'#d1b38e':'#8d6944',3));
   }else{
      B(-22,-160,44,294,k==='bic'?'#8dbad9':k==='nib'?'#bca57f':blue,11);
      B(-27,-162,54,28,k==='fountain'?'#415568':gold,6);
      B(-17,110,34,29,metal,3);P([[-12,140],[0,172],[12,140]],'#728c94');
      if(k==='biro'||k==='bic'||k==='modern')C(0,169,5,5,ink);
      if(k==='fountain'||k==='nib')L(-11,114,9,160,ink,2);
      if(k==='bic')L(19,-137,32,-30,ink,8);
   }
   pop();
 }
 if(type==='eraser'){
   if(k==='bread'){C(0,26,107,79,'#e9c78c');marks(9,i=>C(-61+(i%3)*60,3+Math.floor(i/3)*27,7,7,'#c19b68'));}
   else if(k==='tip'){
      B(-16,-170,36,255,gold,8);B(-23,-171,50,43,'#c97c6b',8);P([[-16,84],[18,84],[0,148]],'#6c757c');
   }else{
      push();rotate(.23);
      B(-125,-68,242,147,k==='block'?'#dca6ab':k==='synthetic'?'#aeced1':'#ebb9a9',21);
      B(21,-68,96,147,k==='rubber'?'#d4a86b':paper,12);
      if(k==='modern'||k==='synthetic')L(-99,24,-8,24,'#f4efda',4);
      pop();
   }
 }
 if(type==='notebook'){
    if(k==='wax'){B(-130,-167,260,336,wood,14);B(-110,-146,219,289,'#aa8b64',7);marks(5,i=>L(-86,-87+i*42,73,-87+i*42,'#d1b38c',5));}
    else{
      B(-127,-170,255,333,k==='school'?'#e5ae83':k==='spiral'?'#b8d6c7':'#79b6c4',12);
      B(-111,-151,229,299,paper,7);
      marks(11,i=>L(-91,-117+i*22,94,-117+i*22,'#91b9c9',2));
      if(k==='grid'||k==='recycled')marks(8,i=>L(-80+i*25,-143,-80+i*25,137,'#b5cfcb',1.7));
      if(k==='spiral'||k==='modern'||k==='recycled')marks(12,i=>C(-120,-135+i*23,7,9,metal));
      if(k==='quire'||k==='paper')L(0,-163,0,153,wood,4);
    }
 }
 if(type==='ruler'){
   push();rotate(-.18);
   B(-148,-38,299,77,k==='wood'?wood:k==='plastic'?'#a4d2d6':k==='cubit'?'#ac8757':gold,8);
   marks(21,i=>{let x=-130+i*13;L(x,-21,x,-21+(i%5===0?43:i%2===0?27:17),ink,i%5===0?4:2);});
   if(k==='meter')B(-122,14,45,14,metal,3);
   pop();
 }
 if(type==='sharpener'){
   if(k==='knife'){B(-126,6,150,36,wood,9);P([[22,-7],[135,-45],[118,22],[24,42]],metal);}
   else if(k==='desk'){B(-104,-85,209,181,wood,14);C(2,-2,63,60,metal);C(2,-2,27,24,ink);L(81,2,150,19,ink,10);C(150,19,16,16,gold);}
   else {
      push();rotate(-.2);B(-119,-68,240,160,k==='container'?'#9fc6bb':k==='portable'?'#aeb7bc':wood,25);
      C(7,-6,57,51,metal);C(7,-6,30,27,ink);L(-42,36,66,-22,'#dce3df',7);
      if(k==='modern')B(-68,87,156,29,'#acd4d1',7);
      pop();
   }
 }
 if(type==='stapler'){
    if(k==='sewing'||k==='pin'){B(-143,12,290,123,paper,8);L(-95,-4,88,-4,wood,8);marks(5,i=>C(-80+i*35,49,9,8,gold));}
    else {
      B(-148,68,301,71,ink,14);
      push();rotate(-.07+Math.sin(t*2)*.03);
      B(-145,-44,296,101,k==='mini'?'#80b3c9':k==='desktop'?'#d18a77':'#aaaeb8',20);
      B(-137,20,264,22,metal,5);C(116,43,17,17,gold);
      pop();L(-87,102,70,102,metal,4);
    }
 }
 if(type==='paperclip'){
   if(k==='ribbon'){B(-118,-120,240,268,paper,9);L(-95,-101,92,126,'#b77d83',10);L(-80,126,107,-100,'#b77d83',10);}
   else {
      push();rotate(.24); // One continuous bent wire with distinct inner return loop.
      L(-62,-147,59,-147,metal,14);L(59,-147,79,-118,metal,14);L(79,-118,76,115,metal,14);
      L(76,115,51,138,metal,14);L(51,138,-39,138,metal,14);L(-39,138,-65,103,metal,14);
      L(-65,103,-61,-84,metal,14);L(-61,-84,-40,-108,metal,14);
      L(-40,-108,31,-108,metal,14);L(31,-108,44,-87,metal,14);L(44,-87,43,87,metal,14);
      pop();
   }
 }
 if(type==='tape'){
   if(k==='resin'){C(0,30,108,94,'#a66e48');C(0,-2,74,60,'#cc9652');}
   else if(k==='dispenser'){B(-141,-16,281,126,ink,14);C(-40,-14,77,72,'#e2c58b');C(-40,-14,39,35,cream);B(113,39,36,54,metal,3);}
   else {
      C(0,13,134,119,['masking','medical'].includes(k)?'#dec99a':'#b8d2d7');C(0,13,70,62,cream);
      C(0,13,42,34,ink);P([[93,-71],[169,-62],[168,-22],[122,-16]],k==='packing'?'#cba875':cream);
   }
 }
 if(type==='glue'){
   if(k==='resin'||k==='animal'||k==='starch'){C(0,42,119,89,wood);C(0,11,98,58,'#e9c685');L(-28,-8,45,103,gold,9);}
   else {
      B(-91,-91,181,229,k==='stick'?'#9ec4d2':k==='synthetic'?'#e6b6a1':'#f5f2e5',29);
      P([[-47,-88],[48,-88],[29,-145],[-27,-145]],k==='stick'?'#dad8ba':'#e6b76b');
      B(-85,-21,169,71,k==='stick'?'#448ca8':'#ca9975',12);
      if(k==='modern')C(0,-103,24,15,gold);
   }
 }
 if(type==='calculator'){
   if(k==='tokens'||k==='abacus'){
      B(-143,-156,288,314,wood,16);marks(5,i=>L(-113,-120+i*55,112,-120+i*55,metal,6));
      marks(20,i=>C(-93+(i%4)*51,-120+Math.floor(i/4)*55,17,19,i%2?gold:'#c78b68'));
   }else if(k==='pascal'||k==='arithmometer'||k==='desk'){
      B(-150,-112,299,228,wood,15);marks(6,i=>{C(-113+i*46,-6,21,20,metal);C(-113+i*46,-6,11,11,ink);});
      B(-127,-84,257,41,ink,7);marks(5,i=>C(-99+i*45,-63,10,10,gold));if(k==='arithmometer')L(119,101,161,142,ink,8);
   }else{
      B(-139,-167,279,336,k==='pocket'?'#688c9c':ink,21);
      B(-111,-132,223,73,'#96c0b9',11);L(-77,-103,51,-103,'#46535b',7);
      marks(16,i=>{let x=-92+(i%4)*62,y=-24+Math.floor(i/4)*49;B(x,y,48,39,i%4===3?gold:'#c0d0d0',6);});
   }
 }
}
export function drawSchool(type,kind,t=0){if(!SCHOOL_TYPES.has(type))return;push();thing(type,kind,t);pop();}
export function schoolWorkshop(type,kind,era,t,progress,artisan){
 if(!SCHOOL_TYPES.has(type))return;
 const p=Math.max(0,Math.min(1,progress)),wave=Math.sin(p*Math.PI);
 B(799,1208,444,47,'#896b4c',8);B(829,1256,30,160,'#79543c',5);B(1182,1256,30,160,'#79543c',5);
 // Physical paper is visibly acted upon by each school object.
 if(['pen','eraser','ruler','sharpener','paperclip','stapler','tape','glue','notebook'].includes(type)){
   lineSheet(831,1032,185,142);
   if(type==='pen')marks(5,i=>L(856,1072+i*19,866+120*p,1072+i*19,'#648d9a',3));
   if(type==='eraser'){L(864,1084,954,1150,'#747c83',5);C(906+20*p,1116,13,10,paper);}
   if(type==='ruler')L(854,1145,970+25*p,1145,'#8baeba',5);
   if(type==='sharpener'){marks(5,i=>C(864+i*19,1179-3*i,6,4,gold));}
   if(type==='paperclip'||type==='stapler')L(852,1037,979,1037,metal,6);
   if(type==='glue'||type==='tape')B(875,1139,88,14,'#d7c2a3',4);
 }
 if(type==='calculator'){marks(7,i=>C(842+i*32,1113,12,11,wood));L(844,1179,1080,1179,'#d3c8ad',5);}
 push();translate(1064,1026-24*wave);rotate(-.13+Math.sin(t*.8)*.03);scale(.72);drawSchool(type,kind,t);pop();
 // Artisan works with the object, not a random repetitive limb.
 artisan(era,t,1137,996-24*wave);
}
