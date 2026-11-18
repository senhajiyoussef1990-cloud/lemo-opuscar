// Papi, sérieux ? — Episode 11: Les notifications
// New self-contained performance, same canonical 1930s engine, Gaston/Léo model and subtitles.
import * as T from './toon.js';
import { P } from './parts.js';
import { papi, leo } from './people.js';
import { drawBG, hangingPans, wallClock, flourJar } from './kitchen.js';
import { BPM, DUR, LINES, SUBS, CUTS, T_IRIS, shotAt, beats } from './story.js';
import { lerp, seg, ss, clamp } from '/core/lib.js';

let BG, SG, LIP;
export function initScenes(bg, sg, lip) { BG=bg; SG=sg; LIP=lip; }
const twos=t=>Math.floor(t*12+1e-6)/12;
const at=(t,a,b)=>t>=a&&t<b;
const breath=t=>Math.cos(Math.PI*2*beats(twos(t)));
function voice(who,t){
 let v=0;
 for(const l of LINES)if(l.who===who){
   const A=LIP[l.id];if(!A||!A.env)continue;
   const i=Math.floor((t-l.t)*24);
   if(i>=0&&i<A.env.length)v=Math.max(v,A.env[i]);
 }
 return v;
}
function ease(t,a,b){return ss(seg(t,a,b));}
function move(t,a,b,x,y){const k=ease(t,a,b);return lerp(x,y,k);}

function table(){
 T.shape(T.rr(434,836,510,178,12),{fill:P.pale,lw:T.S.lw*.9});
 for(let r=0;r<4;r++)for(let c=0;c<12;c++)if((r+c)%2===0)
    T.shape(T.rect(444+c*41,851+r*41,41,41),{fill:P.light,stroke:false,boil:0});
 T.shape(T.rr(424,823,530,21,7),{fill:P.dark});
}
function phoneCard(t,large=false){
  const x=large?540:315, y=large?940:652, k=large?3.4:1;
  T.push();T.translate(x,y);T.rotate(Math.sin(t*28)*(.02+Math.max(0,1-seg(t,24.6,26))*.02));T.scale(k);
  T.shape(T.rr(-52,-90,104,180,13),{fill:P.ink,lw:T.S.lw*.7});
  T.shape(T.rr(-42,-78,84,146,6),{fill:P.paper,stroke:false,boil:0});
  for(let j=0;j<4;j++){
    const yy=-50+j*31;
    T.shape(T.rr(-30,yy,60,22,6),{fill:j%2?P.light:P.white,lw:T.S.lw*.35});
    T.shape(T.ell(-19,yy+11,6,6),{fill:P.ink,stroke:false});
    T.stroke([[-7,yy+7],[22,yy+7]],T.S.lw*.28,{boil:.2});
  }
  T.shape(T.ell(30,-70,22,22),{fill:P.white,lw:T.S.lw*.8});
  T.text('50',30,-65,{font:'23px Limelight',fill:P.ink});
  T.shape(T.rr(-11,75,22,4,2),{fill:P.mid,stroke:false});
  T.pop();
}
function notificationBursts(t){
 const active=t<14||at(t,21,24.6);
 if(!active)return;
 const n=t<14?3:6;
 for(let i=0;i<n;i++){
   const ph=(t*2.5+i*.17)%1;
   const x=295+Math.sin(i*1.7)*70+ph*(i%2?90:-70);
   const y=690-200*ph-i*17;
   const k=.78*(1-ph);
   if(k<.05)continue;
   T.shape(T.ell(x,y,18*k,18*k),{fill:P.white,lw:T.S.lw*.5,alpha:.8});
   T.text('!',x,y+2,{font:'15px Limelight',fill:P.ink});
 }
}
function plateOfCrepes(t){
 const glow=ease(t,31.7,33.3);
 const x=664,y=812;
 T.shape(T.ell(x,y,112,23),{fill:P.white,lw:T.S.lw*.8});
 for(let j=0;j<4;j++)T.shape(T.ell(x,y-9-j*10,90-j*2,23-j*1.4),{fill:j%2?P.paper:P.light,lw:T.S.lw*.7});
 for(let k=0;k<3;k++){
   const dx=(k-1)*32,w=Math.sin(t*4+k*2);
   T.stroke(T.spline([[x+dx,y-68],[x+dx+6+w*4,y-90],[x+dx+w*8,y-114]],false,6),T.S.lw*.7,{line:P.paper});
 }
}
function papiPose(t){
 const p={x:716,y:942,seated:true,turn:-.25,talk:voice('papi',t)};
 p.lid=at(t,4.4,8.8)?.52:.32;
 p.look={lx:t<9?-.8:t<21?0:-.75,ly:t<21?0:.4};
 p.stache=t>=32.6?.85:at(t,4.4,8.8)?.45:.05;
 p.brows=[{raise:at(t,13.9,21)?0.7:0},{raise:at(t,32.5,36)?.95:0}];
 p.sy=1+.02*breath(t);p.sx=1-.01*breath(t);
 let A={x:-75,y:-125,hand:'open',rot:Math.PI-.2,front:true};
 let B={x:80,y:-120,hand:'open',rot:-.4,front:true};
 if(at(t,13.9,21)){B={x:156,y:-313,hand:'point',rot:-Math.PI/2,bend:19,front:true,flip:false};}
 if(at(t,24.6,28.65)){A={x:move(t,24.6,25.6,-80,-195),y:move(t,24.6,25.6,-120,-220),hand:'point',rot:Math.PI*1.07,bend:15,front:true};}
 if(t>=32.5){A={x:-100,y:-185,hand:'open',rot:Math.PI/2,bend:-13,front:true};B={x:110,y:-158,hand:'open',front:true};p.eyes='happy';}
 p.armA=A;p.armB=B;
 return p;
}
function leoPose(t){
 const p={x:293,y:1000,turn:.48,talk:voice('leo',t),phone:{rot:-.12}};
 p.eyes=at(t,8.8,14)||at(t,21,24.6)?'wide':t>=28.6?'happy':'open';
 p.brows=at(t,20.8,24.6)?'sad':t>=28.6?'up':'up';
 p.mouth={type:t<14?'o':t>=32.5?'beam':t>=28.6?'smile':'flat'};
 p.look={lx:t<14?.5:.9,ly:t<14?-.65:-.3};
 p.hair=at(t,8.8,14)?Math.sin(t*10)*.6:.2;
 p.sy=1+.032*breath(t);p.sx=1-.014*breath(t);
 p.armA={x:-45,y:-190+Math.sin(t*20)*(t<14?10:0),hand:'grab',front:true,rot:-1.55};
 p.armB={x:t<14?75:52,y:t<14?-212:-130,hand:at(t,9,13.8)?'open':t>=28.65?'open':'fist',rot:-1.25,front:true};
 if(at(t,21,24.6)){p.armA.y=-230;p.armB.y=-210;p.mouth={type:'frown'};}
 if(t>=24.6){p.phone=null;p.armA={x:-60,y:-124,hand:'open',front:true};}
 if(t>=32.5){p.look={lx:.9,ly:.4};p.armA={x:25,y:-138,hand:'open',front:true};}
 return p;
}
function camOf(t){
 const i=shotAt(t);
 if(i===0)return{x:515,y:748,z:lerp(1.5,1.59,seg(t,0,4.4))};
 if(i===1)return{x:700,y:695,z:2.05};
 if(i===2)return{x:302,y:755,z:2.28};
 if(i===3)return{x:711,y:670,z:lerp(2.14,2.28,seg(t,13.9,21))};
 if(i===4)return{x:525,y:830,z:1.8};
 if(i===5)return{x:510,y:735,z:1.68};
 if(i===6)return{x:500,y:748,z:1.68};
 return{x:622,y:765,z:lerp(1.8,2.08,seg(t,32.5,36))};
}
function irisMask(t,c){
 if(t<T_IRIS[0])return;
 const k=seg(t,T_IRIS[0],T_IRIS[1]),r=t>=T_IRIS[1]?0:1500*Math.pow(1-k,1.8);
 const cx=540+(660-c.x)*c.z,cy=960+(755-c.y)*c.z,g=SG;
 g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='#060606';g.beginPath();g.rect(0,0,1080,1920);
 if(r>0)g.arc(cx,cy,r,0,Math.PI*2,true);
 g.fill('evenodd');g.restore();
}
export function drawScene(t,nosub){
 const c=camOf(t),b=breath(t),bt=beats(twos(t)),i=shotAt(t);
 drawBG(SG,BG,c,b*.006);
 T.frame(t);T.transform(c.z,0,0,c.z,540-c.x*c.z,960-c.y*c.z);
 wallClock(b,t,bt);hangingPans(b,t);flourJar(b);
 if(i===4){
   phoneCard(t,true);
 }else{
   papi(papiPose(t));
   if(t>=32.5)plateOfCrepes(t);
   table();
   leo(leoPose(t));
   if(t<14||at(t,21,24.6)){notificationBursts(t);}
   if(at(t,0,14)||at(t,21,24.6))phoneCard(t,false);
   if(at(t,24.6,28.65)){
      // the notification icon disappears as Papi makes a calming gesture
      const k=1-ease(t,24.8,26.0);
      if(k>0)T.shape(T.ell(464,678,29*k,29*k),{fill:P.white,lw:T.S.lw*.6,alpha:k});
   }
 }
 irisMask(t,c);
 if(!nosub)subtitles(t);
}

// period title card (two lines, drawn in the scene so it weaves with the film): pops on and off
export function subtitles(t) {
  const s = SUBS.find(q => t >= q[0] && t < q[1]); if (!s) return;
  // ?subs=v2 (series rules, v2): the card sits higher and is bigger; it shrinks only when a line would not fit the frame
  const V2 = new URLSearchParams(location.search).get('subs') === 'v2';
  const g = SG, lines = s.slice(2), cx = 540, cy = V2 ? 1340 : 1640; let size = V2 ? 64 : 46;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const fitW = () => { g.font = `${size}px "IM Fell English SC"`; return Math.max(...lines.map(l => g.measureText(l).width)); };
  let tw = fitW(); while (V2 && tw + size * 2.1 > 1020 && size > 40) { size -= 2; tw = fitW(); }
  const w = tw + size * 2.1, h = size * (lines.length === 2 ? 3.15 : 1.95), x0 = cx - w / 2, y0 = cy - h / 2;
  g.fillStyle = 'rgba(12,11,10,.93)'; g.beginPath(); g.roundRect(x0, y0, w, h, size * .22); g.fill();
  g.strokeStyle = P.paper; g.lineWidth = 2.4; g.beginPath(); g.roundRect(x0 + 8, y0 + 8, w - 16, h - 16, size * .16); g.stroke();
  g.lineWidth = 1.1; g.beginPath(); g.roundRect(x0 + 14, y0 + 14, w - 28, h - 28, size * .12); g.stroke();
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const ax = sx > 0 ? x0 + 14 : x0 + w - 14, ay = sy > 0 ? y0 + 14 : y0 + h - 14;
    g.fillStyle = P.paper; g.beginPath(); g.arc(ax + sx * 8, ay + sy * 8, 3.4, 0, 7); g.fill();
    g.lineWidth = 1.5; g.beginPath(); g.arc(ax + sx * 8, ay + sy * 8, 8, 0, 7); g.stroke();
  }
  g.fillStyle = P.paper;
  lines.forEach((l, i) => g.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * size * 1.2 + size * .05));
  g.restore();
}
