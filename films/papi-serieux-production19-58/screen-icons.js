// Vary the objects and UI actions, but never draw them floating in the room.
// These pictures are INSIDE the phone display and its linked, enlarged copy.
const C={ink:'#161513',white:'#FFFAEF',soft:'#E5DAC8',mid:'#B8AE9E',gray:'#726E64'};
function box(g,x,y,w,h,c=C.white,r=11,stroke=false){
  g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=c;g.fill();
  if(stroke){g.lineWidth=3;g.strokeStyle=C.ink;g.stroke();}
}
function line(g,points,width=5,color=C.ink){
  g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));
  g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.stroke();
}
function text(g,s,x,y,size=20,c=C.ink,align='center'){
  g.fillStyle=c;g.font='bold '+size+'px "DejaVu Sans",sans-serif';g.textAlign=align;g.textBaseline='middle';g.fillText(s,x,y);
}
function circle(g,x,y,r,fill=C.white,stroke=true,width=4){
  g.beginPath();g.arc(x,y,r,0,7);
  g.fillStyle=fill;g.fill();
  if(stroke){g.lineWidth=width;g.strokeStyle=C.ink;g.stroke();}
}
function star(g,cx,cy,r=16){
  const arr=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5;const s=i%2?r*.44:r;arr.push([cx+Math.cos(a)*s,cy+Math.sin(a)*s]);}
  g.beginPath();arr.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));
  g.closePath();g.fillStyle=C.ink;g.fill();
}
function icon(g,kind,t){
  const cx=160,cy=296;g.save();g.lineJoin='round';g.lineCap='round';
  switch(kind){
  case 'face':
    circle(g,cx,cy,86);
    for(const x of [129,191])circle(g,x,279,8,C.ink,false);
    line(g,[[122,330],[144,322],[161,338],[177,322],[202,330]],9);
    if(t<9){line(g,[[58,195],[88,195],[88,225]],5);line(g,[[232,369],[232,399],[262,399]],5);}
    break;
  case 'pay':
    box(g,73,230,175,122,C.soft,14,true);
    box(g,87,252,38,23,C.ink,4);
    line(g,[[93,328],[156,328]],6);
    for(let i=0;i<3;i++){g.beginPath();g.arc(245,297,22+i*12,-.95,.95);g.strokeStyle=C.ink;g.lineWidth=3;g.stroke();}
    break;
  case 'voice':case 'podcast':case 'music':
    if(kind==='music'){
      line(g,[[153,245],[196,231],[196,335]],9);
      line(g,[[153,245],[153,349]],9);circle(g,138,351,21,C.ink,false);circle(g,180,339,21,C.ink,false);
    } else {
      box(g,139,228,42,105,C.ink,22);line(g,[[125,300],[125,340],[194,340],[194,300]],6);line(g,[[159,339],[159,373]],7);line(g,[[130,375],[187,375]],6);
      for(let i=0;i<5;i++)line(g,[[71+i*7,278-i*5],[71+i*7,318+i*3]],3);
    }
    break;
  case 'keyboard':
    box(g,56,221,208,161,C.soft,10,true);
    for(let row=0;row<3;row++)for(let i=0;i<8;i++)box(g,67+i*24+(row===1?8:0),231+row*43,17,29,i===2&&row===0?C.ink:C.white,3);
    break;
  case 'gif':
    circle(g,161,295,79);for(const s of [-1,1]){line(g,[[160+s*43,232],[160+s*71,181],[160+s*86,251]],6);}circle(g,132,287,8,C.ink,false);circle(g,190,287,8,C.ink,false);text(g,'GIF',160,355,27);
    break;
  case 'tag': text(g,'#',161,301,151);break;
  case 'social':case 'live':
    circle(g,160,277,63,C.soft);circle(g,160,261,21,C.white);line(g,[[119,306],[139,285],[181,285],[201,306]],5);
    for(let i=0;i<4;i++)star(g,90+i*48,374,14);break;
  case 'subscription':case 'poll':
    box(g,64,219,193,159,C.white,14,true);
    for(let i=0;i<4;i++)box(g,81,238+i*31,42+i*32,16,i===2?C.ink:C.mid,4);break;
  case 'rating':
    for(let i=0;i<5;i++)star(g,50+i*55,280,23);
    text(g,'5 / 5',160,343,40);break;
  case 'ads':
    box(g,61,228,198,149,C.soft,16,true);text(g,'POUR VOUS',160,253,19);
    box(g,100,276,45,67,C.white,9,true);box(g,173,276,45,67,C.white,9,true);text(g,'€',160,364,27);break;
  case 'cart':case 'coupon':case 'loyalty':
    if(kind==='cart'){
      line(g,[[71,230],[94,230],[113,341],[245,341],[262,257],[101,257]],9);
      circle(g,134,362,12,C.ink,false);circle(g,218,362,12,C.ink,false);
    }else{
      box(g,62,235,195,130,C.soft,13,true);
      text(g,kind==='coupon'?'-20%':'★ ★ ★',160,298,42);
      line(g,[[80,335],[241,335]],3);
    }break;
  case 'captcha':
    for(let j=0;j<3;j++)for(let i=0;i<3;i++)box(g,76+i*58,214+j*58,48,48,(i+j+t|0)%3===0?C.ink:C.white,5,true);
    break;
  case 'airplane':case 'drone':
    if(kind==='airplane'){
      line(g,[[160,201],[177,293],[248,319],[246,338],[178,330],[174,376],[146,376],[142,330],[73,338],[72,319],[144,293],[160,201]],6);
    } else {
      line(g,[[107,246],[214,344]],12);line(g,[[215,247],[106,343]],12);
      for(const [x,y] of [[104,244],[217,244],[104,351],[217,351]])circle(g,x,y,26,C.white);
      box(g,137,266,47,59,C.ink,12);
    }break;
  case 'battery':
    box(g,94,238,129,118,C.white,14,true);box(g,219,276,15,41,C.ink,4);
    box(g,109,252,92*Math.min(1,Math.max(.1,t/31)),88,C.ink,7);break;
  case 'kiosk':case 'printer':
    box(g,94,209,135,151,C.soft,10,true);
    box(g,107,222,110,98,C.white,4);
    if(kind==='printer'){
      for(let i=0;i<4;i++)line(g,[[122,279+i*13],[202,279+i*13]],3);
    } else {text(g,'MENU',160,263,20);for(let i=0;i<3;i++)line(g,[[120,287+i*12],[193,287+i*12]],3);}
    line(g,[[161,362],[161,391]],10);line(g,[[128,394],[195,394]],8);break;
  case 'home':case 'fridge':
    if(kind==='home'){
      line(g,[[76,281],[160,202],[244,281]],11);
      box(g,96,282,126,95,C.white,6,true);box(g,147,326,38,51,C.ink,3);
    }else{
      box(g,99,208,124,173,C.white,9,true);
      line(g,[[100,280],[222,280]],5);line(g,[[113,240],[113,268]],6);line(g,[[113,297],[113,345]],6);
    }break;
  case 'robot':
    circle(g,160,296,82,C.soft);circle(g,160,296,37,C.white);circle(g,160,296,11,C.ink,false);line(g,[[130,359],[189,359]],4);break;
  case 'car':
    box(g,82,269,155,67,C.soft,22,true);
    line(g,[[111,269],[136,237],[196,237],[221,269]],7);
    circle(g,118,338,18,C.ink,false);circle(g,211,338,18,C.ink,false);break;
  case 'scooter':
    circle(g,96,354,26,C.white);circle(g,235,354,26,C.white);
    line(g,[[95,353],[146,353],[178,277],[211,277]],8);
    line(g,[[193,268],[218,353]],7);break;
  case 'menu':case 'recipe':
    box(g,79,210,166,177,C.white,13,true);text(g,kind==='recipe'?'RECETTE':'MENU',160,242,27);
    for(let i=0;i<5;i++)line(g,[[103,270+i*21],[215-(i%2)*38,270+i*21]],4);break;
  case 'video':case 'meeting':case 'stream':case 'camera':
    box(g,69,225,182,133,C.soft,15,true);
    if(kind==='stream'){g.beginPath();g.moveTo(139,255);g.lineTo(194,290);g.lineTo(139,327);g.closePath();g.fillStyle=C.ink;g.fill();}
    else{circle(g,160,276,26,C.white);line(g,[[100,341],[126,303],[194,303],[221,341]],6);}
    if(kind==='camera')circle(g,229,240,9,C.ink,false);
    if(kind==='meeting')for(const x of [95,225])circle(g,x,385,12,C.ink,false);
    break;
  case 'game':
    box(g,68,245,188,105,C.soft,45,true);
    line(g,[[111,295],[150,295]],8);line(g,[[130,275],[130,315]],8);
    circle(g,207,274,10,C.ink,false);circle(g,229,299,10,C.ink,false);break;
  case 'watch':
    box(g,133,203,54,185,C.soft,15,true);circle(g,160,294,59,C.white);
    line(g,[[160,294],[160,253]],6);line(g,[[160,294],[191,312]],6);break;
  case 'glasses':
    for(const x of [114,209]){circle(g,x,296,44,C.white);}line(g,[[157,291],[168,291]],7);line(g,[[69,280],[39,262]],7);line(g,[[253,280],[280,263]],7);break;
  case 'ticket':
    box(g,61,225,198,139,C.white,8,true);
    for(let i=0;i<8;i++)line(g,[[86+i*18,310],[86+i*18,346]],i%2?3:7);
    text(g,'BILLET',160,272,30);break;
  case 'translate':
    box(g,72,225,95,99,C.white,14,true);text(g,'FR',120,271,32);
    box(g,164,277,94,97,C.soft,14,true);text(g,'ES',212,321,32);
    line(g,[[137,333],[167,333]],5);break;
  case 'call':
    box(g,111,240,97,115,C.soft,16,true);
    line(g,[[121,285],[141,257],[160,277],[178,263],[200,293],[177,329],[149,318],[121,285]],9);break;
  default:star(g,cx,cy,55);break;
  }
  g.restore();
}
export function drawModernUI(ctx,cfg,t){
  ctx.save();
  const title=cfg.title.toUpperCase();
  text(ctx,title.length>21?title.slice(0,21)+'…':title,160,123,title.length>21?16:18,C.ink);
  box(ctx,21,156,278,273,C.white,17,true);
  icon(ctx,cfg.kind,t);
  box(ctx,18,448,284,77,t>28.65?C.ink:C.soft,14);
  const status=cfg.status.length>24?cfg.status.slice(0,23)+'…':cfg.status;
  text(ctx,status,160,485,status.length>20?16:21,t>28.65?C.white:C.ink);
  text(ctx,t>=28.65?'NOUVELLE ACTIVITÉ':t>=21?'ACTION EN COURS':'VOIR LE DÉTAIL',160,540,14,C.gray);
  ctx.restore();
}
