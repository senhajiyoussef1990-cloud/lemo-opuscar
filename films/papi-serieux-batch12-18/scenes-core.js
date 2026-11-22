// Shared Papi, sérieux ? scene animator for EP12–18.
// Real original show character rigs, kitchen, black/white film treatment, corrected gloves.
import {lerp,seg,ss,clamp} from '/core/lib.js';
import {drawPhoneMagnifier} from './phone-ui.js';
export function makeEpisode({T,P,papi,leo,drawBG,hangingPans,wallClock,flourJar,ST}) {
  const EP=ST.EPISODE; let BG,SG,LIP;
  const PHONE_MODE=EP===15?'bluetooth':EP===16?'map':EP===18?'update':null;
  const PHONE_EPISODE=PHONE_MODE!==null;
  const at=(t,a,b)=>t>=a&&t<b;
  const twos=t=>Math.floor(t*12+1e-6)/12;
  const breath=t=>Math.cos(Math.PI*2*ST.beats(twos(t)));
  const B=(a,b,t)=>ss(seg(t,a,b));
  function initScenes(bg,sg,lip){BG=bg;SG=sg;LIP=lip;}
  function talk(who,t){
    let v=0;
    for(const l of ST.LINES){if(l.who!==who)continue;
      const a=LIP[l.id];if(!a||!a.env)continue;const j=Math.floor((t-l.t)*24);
      if(j>=0&&j<a.env.length)v=Math.max(v,a.env[j]);}
    return v;
  }
  function rectangle(x,y,w,h,c){T.shape(T.rr(x,y,w,h,Math.min(14,Math.max(2,h*.09))),{fill:c,lw:T.S.lw*.7});}
  function label(s,x,y,size=22,c=P.ink){T.text(s,x,y,{font:size+'px Limelight',fill:c});}
  function table() {
    rectangle(428,822,532,205,P.pale);
    for(let r=0;r<4;r++)for(let c=0;c<12;c++)if((r+c)%2===0)
      T.shape(T.rect(439+c*42,844+r*43,42,43),{fill:P.light,stroke:false,boil:0});
    rectangle(423,817,542,20,P.dark);
  }
  function screen(x,y,k,t) {
    T.push();T.translate(x,y);T.rotate(Math.sin(t*3)*.027);T.scale(k);
    rectangle(-62,-108,124,216,P.ink);
    rectangle(-49,-93,98,181,P.white);
    rectangle(-20,94,40,4,P.mid);
    T.pop();
  }
  function qr(x,y,k,t) {
    T.push();T.translate(x,y);T.rotate(Math.sin(t*3)*.025);T.scale(k);
    rectangle(-116,-116,232,232,P.white);
    const sz=14.3;
    for(let i=0;i<15;i++)for(let j=0;j<15;j++){
      const finder=(i<5&&j<5)||(i>9&&j<5)||(i<5&&j>9);
      const edge=(i===0||i===4||j===0||j===4);
      const inner=(i===2&&j===2);
      const m=finder?(edge||inner):((i*31+j*17+i*j*7)%9<4);
      if(m)T.shape(T.rect(-107+i*sz,-107+j*sz,sz-.6,sz-.6),{fill:P.ink,stroke:false,boil:0});
    }
    T.pop();
  }
  function cloud(x,y,k,t) {
    T.push();T.translate(x,y);T.scale(k);T.rotate(Math.sin(t*.8)*.025);
    for(const a of [[-70,8,44],[-38,-24,55],[8,-39,64],[68,-11,50],[95,16,38]])
      T.shape(T.ell(a[0],a[1],a[2],a[2]*.77),{fill:P.paper,lw:T.S.lw*.7});
    rectangle(-100,6,200,38,P.paper);
    for(let i=0;i<3;i++){const px=-70+i*65,py=7+Math.sin(t*2+i)*8;rectangle(px-24,py-27,45,43,P.white);T.shape(T.ell(px-9,py-12,8,8),{fill:P.mid,stroke:false});}
    T.pop();
  }
  function stories(x,y,k,t){
    T.push();T.translate(x,y);T.scale(k);
    rectangle(-80,-142,160,276,P.dark);
    rectangle(-68,-131,136,240,P.paper);
    rectangle(-58,-118,116,7,P.white);
    T.shape(T.ell(0,-15,53,54),{fill:P.white,lw:T.S.lw*.85});
    T.shape(T.ell(-17,-24,6,10),{fill:P.ink,stroke:false});
    T.shape(T.ell(17,-24,6,10),{fill:P.ink,stroke:false});
    T.stroke(T.arc(0,-4,22,19,.1,Math.PI-.1,10),T.S.lw*.8);
    label('24 H',0,75,31,P.ink);
    const bar=108*(1-seg(t,21,24.4));rectangle(-54,-107,Math.max(2,bar),4,P.ink);
    T.pop();
  }
  function bluetooth(x,y,k,t) {
    T.push();T.translate(x,y);T.scale(k);
    T.shape(T.ell(0,0,111,111),{fill:P.paper,lw:T.S.lw*.9});
    const path=[[-20,-92],[48,-35],[-20,28],[36,90],[36,-87],[-20,-26],[48,38],[-20,92]];
    T.stroke(path,T.S.lw*2,{line:P.ink,boil:.35});
    // A wiggly wire as the visual joke.
    if(t>24.6)T.stroke(T.spline([[-115,80],[-145,22],[-178,67],[-210,16],[-248,52]],false,14),T.S.lw*.9);
    T.pop();
  }
  function mapPin(x,y,k,t){
    T.push();T.translate(x,y);T.scale(k);
    rectangle(-160,-125,320,250,P.paper);
    for(let j=-120;j<145;j+=54)T.stroke([[-152,j],[155,j]],T.S.lw*.6,{line:P.mid,boil:0});
    for(let j=-142;j<156;j+=58)T.stroke([[j,-119],[j,119]],T.S.lw*.6,{line:P.mid,boil:0});
    T.shape(T.ell(0,-20,50,50),{fill:P.ink});
    T.shape([[0,85],[-35,-14],[35,-14]],{fill:P.ink});
    T.shape(T.ell(0,-20,20,20),{fill:P.white,stroke:false});
    label('PAIN',15,105,21);
    T.pop();
  }
  function filters(x,y,k,t){
    T.push();T.translate(x,y);T.scale(k);
    T.shape(T.ell(0,5,94,103),{fill:P.white,lw:T.S.lw});
    T.shape(T.ell(-34,-5,10,15),{fill:P.ink,stroke:false});
    T.shape(T.ell(34,-5,10,15),{fill:P.ink,stroke:false});
    T.shape(T.ell(0,32,20,13),{fill:P.ink});
    const ear=t<21?112:146;
    for(const s of [-1,1]){
      T.shape(T.ell(58*s,-ear,31,78),{fill:P.white,lw:T.S.lw});
      T.shape(T.ell(58*s,-ear,14,51),{fill:P.light,lw:T.S.lw*.5});
      T.stroke([[s*22,33],[s*83,40]],T.S.lw*.55);
    }
    label('FILTRE',0,127,25,P.ink);
    T.pop();
  }
  function update(x,y,k,t){
    T.push();T.translate(x,y);T.scale(k);
    rectangle(-132,-108,264,216,P.white);
    label('MISE A JOUR',0,-60,22);
    rectangle(-105,12,210,28,P.light);
    const v=t<24.6?Math.floor((t*5)%90):99;
    rectangle(-102,14,202*v/100,24,P.ink);
    label(String(v)+'%',0,71,32);
    for(const s of [-1,1])T.stroke(T.arc(s*72,-38,18,20,.1,Math.PI*1.6,8),T.S.lw*.7);
    T.pop();
  }
  function motif(x,y,k,t){
    if(EP===12)return qr(x,y,k,t);
    if(EP===13)return cloud(x,y,k,t);
    if(EP===14)return stories(x,y,k,t);
    if(EP===15)return bluetooth(x,y,k,t);
    if(EP===16)return mapPin(x,y,k,t);
    if(EP===17)return filters(x,y,k,t);
    return update(x,y,k,t);
  }
  function papiPose(t){
    const q=ST.shotAt(t);
    const p={x:717,y:944,seated:true,turn:-.30,talk:talk('papi',t)};
    p.look={lx:q===3?.13:-.7,ly:q===3?-.25:.1};
    p.lid=q===1?.45:.23;p.stache=q===7?.9:at(t,4.4,8.7)?.55:.06;
    p.brows=[{raise:q===3?.85:.1},{raise:q===7?.9:.2}];
    p.sy=1+.021*breath(t);p.sx=1-.013*breath(t);
    p.armA={x:-75,y:-115,hand:'open',rot:2.9,front:true};
    p.armB={x:77,y:-108,hand:'open',front:true};
    if(q===1){p.armB={x:120,y:-180,hand:'point',rot:-1.4,front:true};}
    if(q===3){p.armB={x:152+Math.sin(t*7)*6,y:-308,hand:'point',rot:-Math.PI/2,front:true,flip:false,bend:18};}
    if(q===5){p.armA={x:-110,y:-155,hand:'open',front:true,flip:true};}
    if(q===7){p.eyes='happy';p.armA={x:-104,y:-179,hand:'open',front:true};p.armB={x:105,y:-174,hand:'open',front:true};}
    return p;
  }
  function leoPose(t){
    const q=ST.shotAt(t);
    const p={x:289,y:1000,turn:.48,talk:talk('leo',t),phone:{rot:-.14,ui:PHONE_MODE,uiTime:t}};
    p.brows=(q===4||q===6)?'sad':'up';
    p.eyes=(q===2||q===4)?'wide':'open';
    p.mouth={type:q===7?'beam':q===2?'o':q===4?'frown':'smile'};
    p.look={lx:q===2?.8:.7,ly:q===2?-.55:-.2};p.hair=q===2?Math.sin(t*8)*.7:.1;
    p.sy=1+.034*breath(t);p.sx=1-.02*breath(t);
    p.armA={x:-46,y:-201,front:true,hand:'grab',rot:-1.48};
    p.armB={x:80,y:q===0?-206:-150,hand:(q===2?'point':'open'),rot:-1.15,front:true};
    if(q===5){p.armA={x:-37,y:-129,hand:'open',front:true};}
    if(q===7){p.phone=null;p.armB={x:104,y:-190,hand:'open',front:true};}
    return p;
  }
  function camOf(t){
    const q=ST.shotAt(t);
    if(PHONE_EPISODE && q===0)return {x:305,y:740,z:1.85};
    if(PHONE_EPISODE && q===4)return {x:305,y:761,z:2.10};
    if(PHONE_EPISODE && q===6)return {x:315,y:759,z:2.05};
    if(q===0)return {x:515,y:745,z:1.53+seg(t,0,4.4)*.08};
    if(q===1)return {x:713,y:688,z:2.08};
    if(q===2)return {x:308,y:761,z:2.21};
    if(q===3)return {x:708,y:671,z:2.12+seg(t,14,21)*.13};
    if(q===4)return {x:532,y:763,z:1.65};
    if(q===5)return {x:520,y:737,z:1.7};
    if(q===6)return {x:505,y:746,z:1.66};
    return {x:618,y:771,z:1.83+seg(t,32.5,36)*.25};
  }
  function irisMask(t,c){
    if(t<ST.T_IRIS[0])return;
    const f=seg(t,ST.T_IRIS[0],ST.T_IRIS[1]),r=t>=ST.T_IRIS[1]?0:1550*Math.pow(1-f,1.8);
    const cx=540+(634-c.x)*c.z,cy=960+(750-c.y)*c.z,g=SG;
    g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle='#060606';g.beginPath();g.rect(0,0,1080,1920);
    if(r>0)g.arc(cx,cy,r,0,Math.PI*2,true);
    g.fill('evenodd');g.restore();
  }
  function drawScene(t,nosub){
    const c=camOf(t),b=breath(t),idx=ST.shotAt(t);
    drawBG(SG,BG,c,b*.006);
    T.frame(t);T.transform(c.z,0,0,c.z,540-c.x*c.z,960-c.y*c.z);
    wallClock(b,t,ST.beats(twos(t)));hangingPans(b,t);flourJar(b);
    if(idx!==4 || PHONE_EPISODE){
      papi(papiPose(t));table();
      leo(leoPose(t));
      if(!PHONE_EPISODE && (idx===0||idx===2)){motif(335,687,.45+Math.sin(t*4)*.025,t);}
      if(!PHONE_EPISODE && (idx===5||idx===6))motif(562,736,.55,t);
      if(!PHONE_EPISODE && idx===7)motif(606,764,.4,t);
    }else {
      // The fifth shot is a distinct full-screen visualization for each episode.
      T.shape(T.ell(540,757,210,240),{fill:P.pale,lw:T.S.lw});
      motif(540,754,1.22,t);
    }
    if(PHONE_EPISODE)drawPhoneMagnifier(SG,PHONE_MODE,t,{shot:idx,cam:c});
    irisMask(t,c);
    if(!nosub)subtitles(t);
  }
  function subtitles(t){
    const s=ST.SUBS.find(q=>t>=q[0]&&t<q[1]);if(!s)return;
    const v2=new URLSearchParams(location.search).get('subs')==='v2';
    const g=SG,lines=s.slice(2),cx=540,cy=v2?1340:1640;let size=v2?64:46;
    g.save();g.setTransform(1,0,0,1,0,0);g.textAlign='center';g.textBaseline='middle';
    const measure=()=>{g.font=size+'px "IM Fell English SC"';return Math.max(...lines.map(l=>g.measureText(l).width));};
    let w=measure();while(v2&&w+size*2.1>1020&&size>40){size-=2;w=measure();}
    const width=w+size*2.1,height=size*(lines.length===2?3.15:1.95),x=cx-width/2,y=cy-height/2;
    g.fillStyle='rgba(12,11,10,.93)';g.beginPath();g.roundRect(x,y,width,height,size*.22);g.fill();
    for(const o of [8,14]){g.strokeStyle=P.paper;g.lineWidth=o===8?2.4:1.1;g.beginPath();g.roundRect(x+o,y+o,width-2*o,height-2*o,size*.12);g.stroke();}
    g.fillStyle=P.paper;
    lines.forEach((l,i)=>g.fillText(l,cx,cy+(i-(lines.length-1)/2)*size*1.2+size*.05));g.restore();
  }
  return {initScenes,drawScene,subtitles};
}
