// L'interface du telephone, dessinee UNE SEULE FOIS pour le petit ecran et son agrandissement.
// EP12 a EP18 : les QR codes, le cloud, les stories, Bluetooth, la carte, les filtres et les mises a jour ne flottent pas dans le salon.
import {SCREEN_CONFIG} from '../papi-serieux-production19-58/screen-data.js';
import {drawModernUI} from '../papi-serieux-production19-58/screen-icons.js';
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

// Interfaces uniques: reproduites en miniature dans le téléphone et à droite en grand.
function finder(ctx,x,y,cell){
  ctx.fillStyle=C.ink;ctx.fillRect(x,y,cell*5,cell*5);
  ctx.fillStyle=C.white;ctx.fillRect(x+cell,y+cell,cell*3,cell*3);
  ctx.fillStyle=C.ink;ctx.fillRect(x+2*cell,y+2*cell,cell,cell);
}
function renderQR(ctx,t){
  txt(ctx,'SCANNER UN QR CODE',19,127,20);
  rr(ctx,20,157,280,292,20,C.white,C.mid,3);
  const sz=11, x0=69,y0=188;
  ctx.fillStyle=C.paper;ctx.fillRect(x0-12,y0-12,sz*17+24,sz*17+24);
  finder(ctx,x0,y0,sz);finder(ctx,x0+sz*10,y0,sz);finder(ctx,x0,y0+sz*10,sz);
  for(let y=0;y<15;y++)for(let x=0;x<15;x++){
    if((x<5&&y<5)||(x>=10&&y<5)||(x<5&&y>=10))continue;
    if((x*17+y*23+x*y*9)%7<3){ctx.fillStyle=C.ink;ctx.fillRect(x0+x*sz,y0+y*sz,sz-1,sz-1);}
  }
  ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.lineCap='round';
  for(const [x,y,sx,sy] of [[40,176,1,1],[278,176,-1,1],[40,420,1,-1],[278,420,-1,-1]]){
    ctx.beginPath();ctx.moveTo(x+sx*31,y);ctx.lineTo(x,y);ctx.lineTo(x,y+sy*30);ctx.stroke();
  }
  if(t<9){
    const yy=195+(t*8)%170;
    ctx.strokeStyle=C.gray;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(48,yy);ctx.lineTo(269,yy);ctx.stroke();
  }
  rr(ctx,25,468,270,54,12,t>=9?C.ink:C.soft);
  txt(ctx,t>=9?'MENU DU RESTAURANT':'CADREZ LE CODE',160,493,20,t>=9?C.white:C.ink,'center');
  txt(ctx,t>=28.65?'Service introuvable':'Scan avec votre appareil photo',160,545,14,C.gray,'center');
}
function cloudIcon(ctx,cx,cy,scale=1){
  ctx.save();ctx.translate(cx,cy);ctx.scale(scale,scale);ctx.beginPath();
  ctx.moveTo(-66,36);ctx.bezierCurveTo(-108,36,-101,-21,-65,-29);
  ctx.bezierCurveTo(-56,-83,11,-89,38,-38);
  ctx.bezierCurveTo(91,-40,99,38,60,38);
  ctx.closePath();ctx.fillStyle=C.white;ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=6;ctx.stroke();
  ctx.restore();
}
function photo(ctx,x,y,tilt,label){
  ctx.save();ctx.translate(x,y);ctx.rotate(tilt);
  rr(ctx,-49,-63,98,133,8,C.white,C.ink,3);
  rr(ctx,-40,-54,80,89,3,C.soft);
  ctx.fillStyle=C.mid;ctx.beginPath();ctx.arc(0,-16,21,0,7);ctx.fill();
  ctx.fillStyle=C.gray;ctx.beginPath();ctx.moveTo(-32,32);ctx.quadraticCurveTo(-5,-15,36,32);ctx.fill();
  txt(ctx,label,0,54,13,C.ink,'center');
  ctx.restore();
}
function renderCloud(ctx,t){
  txt(ctx,'MES PHOTOS · CLOUD',20,125,21);
  rr(ctx,20,157,280,194,19,C.white,C.mid,2);
  cloudIcon(ctx,160,237,.9);
  txt(ctx,t<9?'ENVOI EN COURS':'PHOTOS SAUVEGARDÉES',160,324,15,C.ink,'center');
  txt(ctx,'ALBUM DE FAMILLE',22,385,19);
  photo(ctx,86,466,-.11,'1950');
  photo(ctx,217,466,.13,t>28.65?'PAPI':'2026');
  if(t>28.65){
    rr(ctx,41,392,238,123,15,C.white,C.ink,3);
    txt(ctx,'VIEILLE PHOTO !',160,420,22,C.ink,'center');
    txt(ctx,'Souvenir de Papi',160,465,20,C.gray,'center');
  }
  txt(ctx,t>28.65?'1 ancien souvenir retrouvé':'Toutes vos photos sont en ligne',160,547,14,C.gray,'center');
}
function renderStory(ctx,t){
  txt(ctx,'MA STORY · PAPI',20,123,21);
  rr(ctx,20,154,280,345,23,C.ink);
  ctx.save();ctx.beginPath();ctx.roundRect(28,162,264,329,17);ctx.clip();
  ctx.fillStyle=C.mid;ctx.fillRect(28,162,264,329);
  ctx.fillStyle=C.soft;ctx.fillRect(28,350,264,141);
  // A Papi portrait inside the vertical story, never a floating face in the room.
  ctx.fillStyle=C.white;ctx.beginPath();ctx.ellipse(160,360,79,98,0,0,7);ctx.fill();
  ctx.fillStyle=C.ink;ctx.beginPath();ctx.ellipse(160,261,81,28,0,Math.PI,Math.PI*2);ctx.fill();
  ctx.strokeStyle=C.ink;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(160,230);ctx.lineTo(166,208);ctx.stroke();
  for(const x of [131,191]){ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(x,351,8,0,7);ctx.fill();}
  ctx.strokeStyle=C.ink;ctx.lineWidth=9;
  ctx.beginPath();ctx.moveTo(110,390);ctx.quadraticCurveTo(148,368,160,394);
  ctx.quadraticCurveTo(191,364,213,391);ctx.stroke();
  txt(ctx,'PAPI, SÉRIEUX ?',160,463,18,C.ink,'center');
  ctx.restore();
  const progress=Math.max(.015,1-Math.max(0,t-.5)/30);
  rr(ctx,28,171,264,6,3,C.gray);rr(ctx,28,171,264*progress,6,3,C.white);
  rr(ctx,31,521,258,30,12,t>=28.65?C.ink:C.soft);
  txt(ctx,t>=28.65?'STORY EXPIRÉE':'VISIBLE PENDANT 24 H',160,536,17,t>=28.65?C.white:C.ink,'center');
}
function renderFilter(ctx,t){
  txt(ctx,'CAMÉRA · FILTRES',20,124,22);
  rr(ctx,20,155,280,343,22,C.white,C.mid,3);
  ctx.save();ctx.beginPath();ctx.roundRect(29,164,262,325,15);ctx.clip();
  ctx.fillStyle=C.mid;ctx.fillRect(29,164,262,325);
  const rabbit=t>=9&&t<21.5,princess=t>=21.5&&t<28.65,normal=t>=28.65;
  if(rabbit){
    for(const x of [106,214]){
      ctx.save();ctx.translate(x,237);ctx.rotate(x===106?-.22:.22);
      ctx.fillStyle=C.white;ctx.strokeStyle=C.ink;ctx.lineWidth=5;
      ctx.beginPath();ctx.ellipse(0,-63,24,94,0,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle=C.soft;ctx.beginPath();ctx.ellipse(0,-63,11,64,0,0,7);ctx.fill();ctx.restore();
    }
  }
  if(princess){
    ctx.fillStyle=C.white;ctx.strokeStyle=C.ink;ctx.lineWidth=6;
    ctx.beginPath();ctx.moveTo(96,263);ctx.lineTo(111,203);ctx.lineTo(145,229);
    ctx.lineTo(169,194);ctx.lineTo(200,229);ctx.lineTo(225,202);ctx.lineTo(233,263);
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=C.ink;for(const x of [123,161,200]){ctx.beginPath();ctx.arc(x,249,5,0,7);ctx.fill();}
  }
  ctx.fillStyle=C.white;ctx.beginPath();ctx.ellipse(160,348,90,107,0,0,7);ctx.fill();
  ctx.strokeStyle=C.ink;ctx.lineWidth=5;ctx.stroke();
  ctx.fillStyle=C.ink;for(const x of [122,195]){ctx.beginPath();ctx.arc(x,331,8,0,7);ctx.fill();}
  ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();
  ctx.moveTo(108,374);ctx.quadraticCurveTo(145,361,162,382);
  ctx.quadraticCurveTo(182,363,218,374);ctx.stroke();
  txt(ctx,normal?'FILTRE RETIRÉ':rabbit?'OREILLES DE LAPIN':princess?'PRINCESSE':'FILTRES OFF',160,463,18,C.ink,'center');
  ctx.restore();
  rr(ctx,112,510,95,38,19,C.ink);
  txt(ctx,normal?'NORMAL':rabbit?'LAPIN':princess?'PRINCESSE':'CHOISIR',160,529,16,C.white,'center');
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
  if(kind==='qr')renderQR(ctx,t);
  if(kind==='cloud')renderCloud(ctx,t);
  if(kind==='story')renderStory(ctx,t);
  if(kind==='filter')renderFilter(ctx,t);
  if(typeof kind==='string' && kind.startsWith('screen-')){
    const cfg=SCREEN_CONFIG[Number(kind.slice(7))];
    if(cfg)drawModernUI(ctx,cfg,t);
  }
  ctx.restore();
}
// UX : l'agrandissement est visuellement attache au VRAI telephone de Leo.
// Il ne remplace jamais la scene et ne s'affiche pas lorsque Papi parle en gros plan.
export function drawPhoneMagnifier(ctx,kind,t,{shot,cam,phoneWorld={x:161,y:833}}){
  const starting={0:.5,2:8.75,4:21,6:28.65}[shot];
  if(starting===undefined || t<starting)return;
  const age=Math.min(1,(t-starting)/.52),ease=1-Math.pow(1-age,3);
  const panelX=707+(1-ease)*92,panelY=560,sw=343,sh=610;
  const pX=540+(phoneWorld.x-cam.x)*cam.z;
  const pY=960+(phoneWorld.y-cam.y)*cam.z;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=age;
  ctx.strokeStyle=C.white;ctx.lineWidth=5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(pX+12,pY+18);
  // Route the cable below Leo's face so the expression is never obscured.
  ctx.bezierCurveTo(pX+86,pY+150,panelX-100,panelY+sh*.92,panelX-11,panelY+sh*.84);
  ctx.stroke();ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.arc(pX+12,pY+18,9,0,7);ctx.fillStyle=C.white;ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.stroke();
  ctx.shadowColor='rgba(0,0,0,.35)';ctx.shadowBlur=18;ctx.shadowOffsetY=10;
  rr(ctx,panelX-13,panelY-13,sw+26,sh+26,38,C.ink,C.white,6);
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  drawPhoneUI(ctx,kind,panelX,panelY,sw,sh,t);
  ctx.restore();
}
