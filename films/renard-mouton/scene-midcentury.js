import { PAL, shape, plane, ink, ellipse, spline, rect, rrect, star, sparkle, arrow, setClock, twos, ss, clamp } from '../../styles/midcentury-toon/demo/engine/toon.js';

// Ne suis pas les moutons — code-driven 2D mid-century animation.
// Uses the exact Lemo Opuscar midcentury-toon drawing engine from the repository.
const c = document.getElementById('c'), g = c.getContext('2d');
const W = 1080, H = 1920, DUR = 18;
const P = {paper:'#F4EAD5', cream:'#FFF2D8', ink:'#2B2420', teal:'#316C69', teal2:'#477F77', rust:'#AD4832', mustard:'#E8B43A', caramel:'#C9955D', wool:'#F3E4C3', dark:'#59382D', brown:'#68432F', red:'#862E2C', white:'#FFF8E8', green:'#6B8057'};
const S=(p,fill,line=4,seed=1)=>shape(g,p,{fill,line,seed,grain:.16,breaks:.09});
const E=(x,y,rx,ry,fill,line=4,seed=1)=>S(ellipse(x,y,rx,ry,36),fill,line,seed);
const R=(x,y,w,h,r,fill,line=4,seed=1)=>S(rrect(x,y,w,h,r),fill,line,seed);
const T=(s,x,y,size=45,col=P.ink,align='center',weight='bold')=>{g.save();g.fillStyle=col;g.textAlign=align;g.textBaseline='middle';g.font=`${weight} ${size}px Georgia, serif`;g.fillText(s,x,y);g.restore();};
const bar=(x,y,w,h,color)=>S(rect(x,y,w,h),color,0);
function pshape(pts,col,w=4,seed=1){S(pts,col,w,seed)}
function title(s,y,size=60){T(s,540,y,size,P.cream,'center','bold')}
function background(t){
  g.fillStyle=P.paper;g.fillRect(0,0,W,H);
  plane(g,rect(0,0,W,360),P.teal,{grain:.3});
  plane(g,[[0,350],[1080,320],[1080,410],[0,455]],P.rust,{grain:.25});
  plane(g,rect(0,1640,1080,280),P.teal,{grain:.2});
  plane(g,[[0,1525],[1080,1540],[1080,1660],[0,1620]],P.caramel,{grain:.12});
  E(110,95,11,11,P.mustard,0); E(970,110,10,10,P.mustard,0);
  sparkle(g,118,205,36,{fill:P.mustard});sparkle(g,964,210,32,{fill:P.mustard});
  T('NE SUIS PAS',540,138,112,P.cream);T('LES MOUTONS',540,260,103,P.mustard);
  R(130,405,820,755,22,P.dark,6,24);
  R(154,429,772,705,14,P.cream,5,25);
  T('COMMENT NAÎT UNE OPINION ?',540,495,42,P.ink);
  bar(230,538,620,4,P.rust);
  // printed paper grain impression, intentionally lightweight for CPU rendering
  g.globalAlpha=.07;g.fillStyle=P.ink;
  for(let i=0;i<150;i++){const x=(i*277+43)%W,y=(i*151+89)%H;g.fillRect(x,y,3,2)}g.globalAlpha=1;
}
function miniTV(x,y,i,t){
 const active=t>2+i*1.65;
 R(x-70,y-67,140,110,18,active?P.mustard:P.teal2,5,100+i);
 R(x-53,y-51,106,73,10,P.cream,4,115+i);
 E(x,y-16,21,20,P.dark,0);S([[x-36,y+18],[x-28,y-3],[x+28,y-3],[x+36,y+18]],P.dark,0);
 ink(g,[[x-23,y-75],[x-36,y-104]],3,{color:P.ink});ink(g,[[x+17,y-75],[x+34,y-104]],3,{color:P.ink});
 if(active){for(let j=0;j<3;j++){const a=t*3+j*1.8;E(x+76+j*20,y-5,5+(Math.sin(a)+1)*2,5+(Math.sin(a)+1)*2,P.rust,0)}}
}
function miniRadio(x,y,i,t){
 const active=t>2+i*1.65;
 R(x-70,y-55,140,100,18,active?P.mustard:P.teal2,5,160+i);
 R(x-51,y-29,80,56,8,P.cream,3);for(let k=0;k<4;k++)bar(x-39,y-22+k*12,54,3,P.dark);E(x+48,y+18,9,9,P.rust,2);
 if(active)for(let j=0;j<3;j++)ink(g,ellipse(x+75,y,18+j*14,20+j*14,24,-.8,.8),3,{color:P.rust,seed:21+j,breaks:0});
}
function miniPaper(x,y,i,t){
 const active=t>2+i*1.65;
 S([[x-55,y-67],[x+55,y-52],[x+45,y+50],[x-64,y+35]],active?P.mustard:P.cream,4,171+i);
 bar(x-36,y-38,72,8,P.dark);bar(x-36,y-22,53,5,P.teal);
 for(let k=0;k<4;k++){bar(x-40,y-8+k*12,75,4,P.dark)}
}
function crowdSheep(x,y,s,offset=0,contrast=false){g.save();g.translate(x,y);g.scale(s,s);
 E(0,-36,44,33,contrast?P.mustard:P.wool,3);for(let j=0;j<5;j++)E(-30+j*15,-57+(j%2)*7,19,18,contrast?P.mustard:P.wool,2,41+j);
 E(39,-28,21,20,P.dark,2);E(45,-35,4,4,P.cream,0);
 for(let j of [-25,15]){bar(j,0,9,30,P.dark)}g.restore()}
function board(t){
  const active=t>3;
  miniRadio(335,655,0,t);miniPaper(530,655,1,t);miniTV(735,655,2,t);
  T(t<3?'UN MESSAGE...':t<8?'RÉPÉTÉ PARTOUT':'...SEMBLE ÉVIDENT',540,827,53,t<8?P.rust:P.teal);
  // converging graphic rays: visible cause and effect
  if(t>3){for(let i=0;i<3;i++){const x=335+i*200;g.globalAlpha=.08+.07*Math.sin(t*4+i);S([[x-50,745],[x+50,745],[650,990],[420,990]],P.mustard,0,50+i);g.globalAlpha=1;}}
  for(let i=0;i<7;i++){
    const walk=clamp((t-4.4)/5,0,1),shift=walk*45;
    crowdSheep(240+i*104+shift,1020+(i%2)*12,i===4?.6:.62, i);
  }
  if(t>8.4){const u=ss(clamp((t-8.4)/1.3,0,1));crowdSheep(500-60*u,1070-75*u,.73,0,true);}
}
function fox(t){g.save();g.translate(292,1550);g.scale(.84,.84);
 const move=twos(t,12),gesture=Math.sin(move*2.7)*12;
 // fox tail and suit
 S([[-105,-25],[-198,-80],[-195,-145],[-97,-115]],P.rust,5);
 S([[-155,-112],[-196,-88],[-198,-80],[-172,-45]],P.cream,0);
 S([[-112,0],[-100,-270],[-45,-325],[65,-325],[111,-270],[122,0]],P.brown,5);
 S([[-95,-297],[-6,-225],[105,-300],[53,-333],[-48,-332]],P.dark,3);
 S([[-31,-311],[9,-278],[-10,-205],[35,-282],[21,-315]],P.cream,3);
 S([[-13,-284],[8,-263],[25,-280],[10,-311]],P.rust,3);
 // Watch chain
 ink(g,[[-5,-185],[30,-172],[54,-188]],3,{color:P.mustard});
 // head ears
 S([[-107,-460],[-96,-598],[-28,-533]],P.rust,5);
 S([[45,-545],[103,-598],[110,-468]],P.rust,5);
 S([[-87,-493],[-87,-561],[-37,-529]],P.cream,2);S([[66,-521],[91,-561],[91,-481]],P.cream,2);
 E(-2,-444,112,104,P.rust,5);S([[11,-479],[102,-444],[145,-410],[96,-365],[-29,-382]],P.cream,4);
 E(128,-411,19,14,P.ink,1);
 E(-32,-465,25,14,P.cream,2);E(47,-464,23,14,P.cream,2);
 E(-30,-460,7,9,P.ink,0);E(47,-460,7,9,P.ink,0);
 ink(g,[[-67,-489],[-20,-499]],7,{color:P.ink,taper:false});ink(g,[[22,-501],[65,-486]],7,{color:P.ink,taper:false});
 ink(g,[[61,-392],[88,-383],[111,-390]],4,{color:P.ink,taper:false});
 // fixed left arm and animated right presentation gesture
 ink(g,[[-67,-275],[-125,-170],[-133,-48]],31,{color:P.dark,taper:false}); E(-135,-46,18,15,P.cream,3);
 ink(g,[[68,-274],[134+gesture,-234],[180+gesture,-297]],31,{color:P.dark,taper:false});
 E(183+gesture,-301,20,16,P.cream,3);
 // simple open hand with individually drawn fingers
 for(let j=0;j<3;j++)ink(g,[[184+gesture,-302-j*6],[215+gesture,-322-j*10]],7,{color:P.cream,taper:false});
 g.restore()}
function sheep(t){g.save();g.translate(778,1568);g.scale(.8,.8);
 const look=t>7?(-.22):.12;
 // body
 S([[-100,0],[-114,-260],[-58,-316],[54,-316],[108,-258],[115,0]],P.caramel,5);
 for(let j=0;j<5;j++)ink(g,[[-68,-260+j*42],[53,-256+j*42]],2,{color:P.brown,breaks:.2});
 S([[-47,-321],[0,-287],[46,-321],[25,-347],[-23,-349]],P.cream,3);
 S([[-24,-296],[-2,-274],[22,-298],[0,-323]],P.red,3);
 ink(g,[[-75,-270],[-113,-164],[-75,-109]],26,{color:P.cream,taper:false});E(-74,-105,16,16,P.wool,2);
 ink(g,[[80,-263],[115,-178],[75,-153]],26,{color:P.cream,taper:false});E(75,-153,17,17,P.wool,2);
 // ears, wool, cheeks
 E(-110,-466,41,28,P.wool,4); E(111,-468,41,28,P.wool,4);
 E(-114,-462,22,15,P.rust,0);E(113,-460,23,15,P.rust,0);
 E(0,-443,108,110,P.wool,5);
 for(let j=0;j<6;j++)E(-82+j*32,-530-(j%2)*10,35,30,P.wool,3,80+j);
 E(0,-428,76,72,P.cream,2);
 E(-39,-459,16,24,P.white,2);E(44,-459,16,24,P.white,2);
 E(-36+look*20,-450,7,11,P.ink,0);E(44+look*20,-450,7,11,P.ink,0);
 E(6,-414,14,10,P.dark,1);
 ink(g,[[-14,-392],[7,-383],[29,-395]],3,{color:P.ink,taper:false});
 // newsboy cap
 S([[-100,-530],[-77,-589],[-5,-611],[70,-590],[102,-532]],P.brown,4);
 S([[-119,-536],[-55,-550],[74,-548],[117,-533],[80,-516],[-86,-518]],P.dark,4);
 g.restore()}
function subtitles(t){
 const text = t<3?'UNE OPINION PEUT-ELLE ÊTRE FABRIQUÉE ?':t<7.7?'RÉPÉTER LE MÊME MESSAGE...':t<11?'...NE LE REND PAS FORCÉMENT VRAI.':t<15?'LE RENARD OBSERVE. LE MOUTON RÉFLÉCHIT.':'OBSERVE. QUESTIONNE. CHOISIS.';
 R(74,1710,932,113,18,P.cream,4,28);T(text,540,1765,text.length>39?30:36,P.ink);
 const progress=clamp(t/DUR,0,1);bar(105,1841,870*progress,9,P.rust);
}
function draw(t){setClock(t);g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);background(t);board(t);fox(t);sheep(t);subtitles(t);
 // subtle animated transition flash as coloured plates
 if(t<.4){g.fillStyle=`rgba(244,234,213,${1-t/.4})`;g.fillRect(0,0,W,H)}
 if(t>DUR-.5){g.fillStyle=`rgba(43,36,32,${(t-(DUR-.5))/.5})`;g.fillRect(0,0,W,H)}
}
window.DUR=DUR;window.render=(t)=>draw(clamp(t,0,DUR));draw(parseFloat(new URLSearchParams(location.search).get('t')||'4'));window.READY=true;