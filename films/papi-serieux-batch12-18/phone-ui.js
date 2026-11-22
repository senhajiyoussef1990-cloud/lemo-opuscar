// L'interface du telephone, dessinee UNE SEULE FOIS pour le petit ecran et son agrandissement.
// EP15/16/18 : aucun symbole ni carte n'est dessine flottant dans le salon.
const C={
  paper:'#F3EBDD', white:'#FFF9EF', ink:'#161513', gray:'#77736D',
  soft:'#E5DAC8', mid:'#B8AE9E'
};
function rr(ctx,x,y,w,h,r,fill,stroke=null,lw=2){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}
}
function txt(ctx,s,x,y,size=24,color=C.ink,align='left',weight='bold'){
  ctx.fillStyle=color;ctx.font=weight+' '+size+'px "DejaVu Sans",sans-serif';
  ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,x,y);
}
function rule(ctx,x,y,w,c=C.mid){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.lineWidth=2;ctx.strokeStyle=c;ctx.stroke();}
function bt(ctx,cx,cy,s=1){
  const q=[[-18,-36],[19,-8],[-17,28],[12,49],[12,-49],[-17,-20],[19,14],[-18,42]];
  ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.lineJoin='round';ctx.lineCap='round';
  ctx.beginPath();q.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
  ctx.strokeStyle=C.ink;ctx.lineWidth=8;ctx.stroke();ctx.restore();
}
function pin(ctx,cx,cy,sz=1){
  ctx.save();ctx.translate(cx,cy);ctx.scale(sz,sz);ctx.beginPath();
  ctx.moveTo(0,56);ctx.bezierCurveTo(-16,29,-34,4,-34,-12);
  ctx.arc(0,-12,34,Math.PI,0);
  ctx.bezierCurveTo(34,4,16,29,0,56);ctx.closePath();ctx.fillStyle=C.ink;ctx.fill();
  ctx.beginPath();ctx.arc(0,-12,12,0,Math.PI*2);ctx.fillStyle=C.white;ctx.fill();ctx.restore();
}
function renderBluetooth(ctx,t){
  txt(ctx,'BLUETOOTH',26,128,24);rr(ctx,230,110,65,33,17,C.ink);
  ctx.beginPath();ctx.arc(276,126,12,0,7);ctx.fillStyle=C.white;ctx.fill();
  rr(ctx,68,169,184,162,22,C.white,C.mid,3);bt(ctx,160,250,1.06);
  txt(ctx,'APPAREILS DISPONIBLES',22,360,18);
  rr(ctx,20,383,280,85,16,C.white,C.mid,2);
  ctx.lineWidth=5;ctx.strokeStyle=C.ink;
  ctx.beginPath();ctx.arc(55,415,14,Math.PI*.85,Math.PI*2.15);ctx.stroke();
  rr(ctx,34,411,9,19,4,C.ink);rr(ctx,68,411,9,19,4,C.ink);
  txt(ctx,'ÉCOUTEURS',95,413,21);
  const lost=t>28.65,loading=t<9.0;
  txt(ctx,lost?'NON TROUVÉS':loading?'RECHERCHE...':'CONNECTÉS',95,449,16,lost?'#70675E':C.ink);
  if(lost)txt(ctx,'Signal perdu !',160,516,19,C.ink,'center');
  else txt(ctx,'Connexion sans fil activée',160,516,17,C.gray,'center');
}
function renderMap(ctx,t){
  txt(ctx,'CARTE DE PAPY',22,125,22);
  rr(ctx,19,163,282,282,14,C.white,C.mid,3);
  ctx.save();ctx.beginPath();ctx.roundRect(20,164,280,280,13);ctx.clip();
  ctx.strokeStyle='#D0C7B7';ctx.lineWidth=8;
  for(let i=0;i<7;i++){const v=180+i*47;ctx.beginPath();ctx.moveTo(v-105,156);ctx.lineTo(v-10,448);ctx.stroke();}
  for(let j=0;j<7;j++){const y=185+j*44;ctx.beginPath();ctx.moveTo(13,y);ctx.lineTo(310,y);ctx.stroke();}
  ctx.strokeStyle='#A9A396';ctx.lineWidth=15;
  ctx.beginPath();ctx.moveTo(-5,305);ctx.bezierCurveTo(105,292,160,350,320,300);ctx.stroke();
  ctx.strokeStyle=C.white;ctx.lineWidth=4;ctx.stroke();
  const dx=t>=28.65?Math.min(34,(t-28.65)*9):0;
  pin(ctx,151+dx,272,0.8);
  txt(ctx,'BOULANGERIE',158,414,18,C.ink,'center');
  ctx.restore();
  rr(ctx,22,469,276,55,12,C.ink);
  txt(ctx,t>=28.65?'PAPI SE DÉPLACE':'POSITION PARTAGÉE',160,496,18,C.white,'center');
  txt(ctx,'Actualisé en direct',160,545,15,C.gray,'center');
}
function renderUpdate(ctx,t){
  txt(ctx,'MISE À JOUR',22,128,24);
  rr(ctx,55,174,210,190,28,C.white,C.mid,3);
  ctx.lineWidth=8;ctx.strokeStyle=C.ink;ctx.beginPath();ctx.arc(160,268,58,.3,Math.PI*1.72);ctx.stroke();
  ctx.beginPath();ctx.moveTo(116,234);ctx.lineTo(121,204);ctx.lineTo(145,224);ctx.stroke();
  ctx.beginPath();ctx.moveTo(208,304);ctx.lineTo(213,334);ctx.lineTo(182,319);ctx.stroke();
  let percent=t<9?Math.max(1,Math.round(t*3)):t<28.65?Math.round(28+(t-9)*3.6):99;
  percent=Math.min(99,percent);
  txt(ctx,percent+' %',160,392,40,C.ink,'center');
  rr(ctx,29,423,262,23,11,C.soft,C.mid,2);
  rr(ctx,30,424,260*percent/100,21,11,C.ink);
  txt(ctx,t>=28.65?'REDÉMARRAGE...':'TÉLÉCHARGEMENT...',160,485,18,C.ink,'center');
  txt(ctx,t>=28.65?'Encore un petit instant !':'Ne pas éteindre l’appareil',160,530,15,C.gray,'center');
}
export function drawPhoneUI(ctx,kind,x,y,w,h,t){
  ctx.save();
  ctx.translate(x,y);ctx.scale(w/320,h/560);
  ctx.beginPath();ctx.roundRect(0,0,320,560,18);ctx.clip();
  ctx.fillStyle=C.paper;ctx.fillRect(0,0,320,560);
  rr(ctx,0,0,320,91,0,C.ink);
  txt(ctx,'10:08',22,24,16,C.white);
  for(let i=0;i<4;i++)rr(ctx,260+i*9,26-i*4,6,9+i*4,0,C.white);
  txt(ctx,'LÉO',20,68,24,C.white);
  txt(ctx,'‹',273,68,32,C.white);
  rule(ctx,17,98,286);
  if(kind==='bluetooth')renderBluetooth(ctx,t);
  if(kind==='map')renderMap(ctx,t);
  if(kind==='update')renderUpdate(ctx,t);
  ctx.restore();
}
// UX : l'agrandissement est visuellement attache au VRAI telephone de Leo.
// Il ne remplace jamais la scene et ne s'affiche pas lorsque Papi parle en gros plan.
export function drawPhoneMagnifier(ctx,kind,t,{shot,cam,phoneWorld={x:243,y:775}}){
  const starting={0:.5,2:8.75,4:21,6:28.65}[shot];
  if(starting===undefined || t<starting)return;
  const age=Math.min(1,(t-starting)/.52),ease=1-Math.pow(1-age,3);
  const panelX=638+(1-ease)*130,panelY=560,sw=370,sh=626;
  const pX=540+(phoneWorld.x-cam.x)*cam.z;
  const pY=960+(phoneWorld.y-cam.y)*cam.z;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=age;
  ctx.strokeStyle=C.white;ctx.lineWidth=7;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(pX+18,pY-5);
  ctx.bezierCurveTo(pX+110,pY-85,panelX-65,panelY+sh*.6,panelX-11,panelY+sh*.6);
  ctx.stroke();ctx.strokeStyle=C.ink;ctx.lineWidth=3;ctx.stroke();
  ctx.beginPath();ctx.arc(pX+18,pY-5,13,0,7);ctx.fillStyle=C.white;ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.stroke();
  ctx.shadowColor='rgba(0,0,0,.35)';ctx.shadowBlur=18;ctx.shadowOffsetY=10;
  rr(ctx,panelX-13,panelY-13,sw+26,sh+26,38,C.ink,C.white,6);
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  drawPhoneUI(ctx,kind,panelX,panelY,sw,sh,t);
  ctx.restore();
}
