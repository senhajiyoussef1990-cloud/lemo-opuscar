// Native screen graphics for episodes 59–98: only drawn inside Leo's smartphone and its magnifier.
const I="#1B1916",W="#FFF9EE",S="#E2D9CA",M="#B5AC9F";
function rr(g,x,y,w,h,r=8,c=W,st=I){g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=c;g.fill();if(st){g.lineWidth=4;g.strokeStyle=st;g.stroke();}}
function L(g,pts,w=5,c=I){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.lineCap="round";g.lineJoin="round";g.lineWidth=w;g.strokeStyle=c;g.stroke();}
function C(g,x,y,r,c=W,st=I){g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=c;g.fill();if(st){g.lineWidth=4;g.strokeStyle=st;g.stroke();}}
function T(g,s,x,y,size=20,color=I){g.fillStyle=color;g.font="bold "+size+"px DejaVu Sans, sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(s,x,y);}
function STAR(g,x,y,r=19){let p=[];for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,ra=i%2?r*.44:r;p.push([x+Math.cos(a)*ra,y+Math.sin(a)*ra]);}g.beginPath();p.forEach((q,i)=>i?g.lineTo(...q):g.moveTo(...q));g.closePath();g.fillStyle=I;g.fill();}
function PERSON(g,x,y,s=1){C(g,x,y-17,18*s,S);L(g,[[x-23*s,y+30*s],[x-16*s,y+5*s],[x+16*s,y+5*s],[x+23*s,y+30*s]],5);}
function SHEET(g){rr(g,92,216,136,170);for(let j=0;j<5;j++)L(g,[[111,252+j*24],[207-(j%2)*24,252+j*24]],3);}
function BOX(g){L(g,[[95,274],[159,240],[224,274],[224,357],[95,357],[95,274],[159,309],[224,274]],7);L(g,[[159,309],[159,357]],6);}
function PHONE(g){rr(g,102,205,116,174,15);rr(g,115,229,90,119,5,S);}
function CAL(g){rr(g,81,216,158,164);rr(g,81,216,158,45,8,I,null);L(g,[[116,206],[116,225]],6);L(g,[[205,206],[205,225]],6);}
function HEAD(g){C(g,160,290,70);C(g,131,279,7,I,null);C(g,189,279,7,I,null);L(g,[[133,318],[157,331],[187,319]],6);}
function MIC(g){rr(g,138,222,44,111,20,I,null);L(g,[[123,306],[123,346],[196,346],[196,306]],6);L(g,[[159,346],[159,383]],6);}
function CAR(g){rr(g,75,273,170,74,19,S);L(g,[[97,273],[119,232],[202,232],[225,273]],6);C(g,117,349,18,I,null);C(g,205,349,18,I,null);}
function BOOK(g){rr(g,76,231,83,133);rr(g,161,231,83,133);L(g,[[160,232],[160,365]],5);for(let j=0;j<4;j++){L(g,[[93,253+j*24],[145,253+j*24]],3);L(g,[[176,253+j*24],[229,253+j*24]],3);}}
function graphic(g,k,time){
 switch(k){
 case "disappear":rr(g,69,225,184,115,18);T(g,"BONJOUR !",160,269,22);T(g,String(Math.max(0,6-Math.floor(time%7)))+" sec.",160,315,24);L(g,[[126,340],[105,362],[153,340]],5);break;
 case "security":L(g,[[160,207],[236,235],[230,326],[160,381],[90,326],[85,235],[160,207]],7);for(let j=0;j<6;j++)C(g,99+25*j,294,6,I,null);break;
 case "fingerprint":for(let j=0;j<7;j++){g.beginPath();g.ellipse(160,294,25+10*j,38+10*j,-.1,.2,Math.PI*1.8);g.strokeStyle=I;g.lineWidth=4;g.stroke();}break;
 case "dictation":MIC(g);for(let j=0;j<5;j++)rr(g,78+j*33,391-(j%2)*12,13,26+(j%3)*6,4,I,null);break;
 case "schedule":CAL(g);C(g,160,314,42);L(g,[[160,316],[160,291],[184,317]],6);break;
 case "group":PERSON(g,106,291);PERSON(g,212,291);PERSON(g,159,268);T(g,"FAMILLE",160,389,25);break;
 case "online":HEAD(g);C(g,223,235,21,I,W);T(g,"EN LIGNE",160,387,21);break;
 case "screenshot":for(const q of [[70,215,1,1],[250,215,-1,1],[70,369,1,-1],[250,369,-1,-1]])L(g,[[q[0]+q[2]*32,q[1]],[q[0],q[1]],[q[0],q[1]+q[3]*33]],6);C(g,161,289,43,S);C(g,161,289,16,I,null);break;
 case "copy":rr(g,102,208,145,163,8,S);rr(g,72,243,145,154);for(let j=0;j<4;j++)L(g,[[93,270+j*27],[196,270+j*27]],3);break;
 case "notes":SHEET(g);STAR(g,218,369);break;
 case "wallpaper":PHONE(g);for(let j=0;j<4;j++){g.beginPath();g.ellipse(154+j*9,280+j*13,40,16,.2,0,Math.PI*2);g.strokeStyle=I;g.lineWidth=4;g.stroke();}break;
 case "sticker":HEAD(g);STAR(g,216,217,30);break;
 case "avatar":HEAD(g);rr(g,112,261,38,28,7,S);rr(g,170,261,38,28,7,S);L(g,[[150,275],[171,275]],5);break;
 case "ar":rr(g,85,230,150,127);for(const q of [[72,218,1,1],[250,218,-1,1],[72,367,1,-1],[250,367,-1,-1]])L(g,[[q[0]+q[2]*26,q[1]],[q[0],q[1]],[q[0],q[1]+q[3]*27]],5);rr(g,116,265,90,63,4,S);break;
 case "vr":rr(g,64,246,191,103,28,I,null);rr(g,84,262,67,62,20,W,null);rr(g,172,262,66,62,20,W,null);break;
 case "headphones":g.beginPath();g.arc(160,298,82,Math.PI,Math.PI*2);g.strokeStyle=I;g.lineWidth=11;g.stroke();rr(g,72,292,33,75,11,I,null);rr(g,215,292,33,75,11,I,null);break;
 case "karaoke":MIC(g);STAR(g,88,239,17);STAR(g,222,245,16);break;
 case "playlist":for(let j=0;j<4;j++){C(g,92,236+j*45,13,S);L(g,[[121,236+j*45],[242,236+j*45]],5);}break;
 case "ebook":BOOK(g);T(g,"e",160,386,25);break;
 case "audiobook":BOOK(g);g.beginPath();g.arc(160,289,87,Math.PI*1.15,Math.PI*1.85);g.strokeStyle=I;g.lineWidth=10;g.stroke();break;
 case "tutorial":L(g,[[105,225],[220,357]],13);rr(g,84,215,81,32,6,I,null);rr(g,203,346,43,31,5,S);break;
 case "scan":SHEET(g);for(const q of [[73,211,1,1],[246,211,-1,1],[73,388,1,-1],[246,388,-1,-1]])L(g,[[q[0]+q[2]*28,q[1]],[q[0],q[1]],[q[0],q[1]+q[3]*28]],5);break;
 case "signature":SHEET(g);g.beginPath();g.moveTo(107,343);g.bezierCurveTo(136,275,148,353,178,308);g.bezierCurveTo(205,278,211,360,226,316);g.strokeStyle=I;g.lineWidth=6;g.stroke();break;
 case "form":SHEET(g);for(let j=0;j<4;j++)rr(g,104,240+j*31,20,19,2,S);break;
 case "appointment":CAL(g);C(g,160,315,34,S);L(g,[[142,315],[180,315]],6);L(g,[[160,296],[160,334]],6);break;
 case "queue":rr(g,80,245,161,114);T(g,"N° 42",160,305,43);break;
 case "locker":for(let j=0;j<2;j++)for(let i=0;i<3;i++){rr(g,71+i*62,216+j*84,55,79,6,i===1&&j===0?S:W);C(g,108+i*62-9,256+j*84,4,I,null);}break;
 case "parcel":BOX(g);L(g,[[91,389],[130,400],[161,388],[227,399]],3);break;
 case "parking":rr(g,105,230,113,134,12,S);T(g,"P",160,295,92);break;
 case "sharedcar":CAR(g);C(g,109,215,13,S);C(g,208,215,13,S);break;
 case "bike":C(g,95,351,37);C(g,229,351,37);L(g,[[95,351],[147,277],[190,351],[95,351],[136,351],[164,280],[229,351]],6);break;
 case "taxi":CAR(g);rr(g,129,212,66,29,6,I,null);T(g,"TAXI",162,227,14,W);break;
 case "thermostat":rr(g,141,209,40,144,17,S);C(g,161,360,31);rr(g,154,271,15,78,5,I,null);T(g,"21°",224,289,27);break;
 case "bulb":C(g,160,265,62,S);rr(g,129,321,64,38,5,I,null);for(let j=0;j<6;j++){const a=j*Math.PI/3;L(g,[[160+Math.cos(a)*75,265+Math.sin(a)*75],[160+Math.cos(a)*93,265+Math.sin(a)*93]],4);}break;
 case "watering":for(let j=0;j<3;j++){const x=98+j*61,y=268+(j%2)*24;g.beginPath();g.moveTo(x,y-27);g.quadraticCurveTo(x-42,y+26,x,y+28);g.quadraticCurveTo(x+40,y+23,x,y-27);g.fillStyle=I;g.fill();}L(g,[[91,367],[224,367]],6);break;
 case "scale":rr(g,85,234,151,137,18,S);C(g,161,280,39);L(g,[[161,280],[185,253]],6);T(g,"KG",160,344,25);break;
 case "coffee":rr(g,90,266,132,97);C(g,235,295,26,S);L(g,[[229,272],[229,320]],10,W);L(g,[[101,375],[240,375]],8);for(let j=0;j<3;j++)L(g,[[116+j*40,239],[123+j*40,217]],4);break;
 case "mirror":rr(g,91,201,140,180,68,S);C(g,161,264,26);L(g,[[120,322],[137,294],[184,294],[202,322]],6);STAR(g,218,237,13);break;
 case "trash":rr(g,111,271,103,114,13,S);L(g,[[99,266],[224,266]],7);L(g,[[130,244],[194,244]],9);for(let j=0;j<3;j++)L(g,[[134+j*24,291],[134+j*24,369]],3);break;
 case "cook":rr(g,110,218,104,166,15,S);C(g,162,247,18);rr(g,129,285,65,70,8);for(let j=0;j<3;j++)L(g,[[143,306+j*15],[184,306+j*15]],3);break;
 default:PHONE(g);T(g,"APP",160,305,28);break;
 }
}
export function drawNewUI(g,info,time){
 g.save();T(g,info.title.toUpperCase().slice(0,25),160,125,info.title.length>24?14:18);
 rr(g,20,156,280,274,17,W,M);
 g.save();g.beginPath();g.roundRect(26,162,268,260,11);g.clip();graphic(g,info.kind,time);g.restore();
 rr(g,19,450,282,74,13,time>28.65?I:S,null);
 const status=info.status.length>26?info.status.slice(0,24)+"…":info.status;
 T(g,status,160,486,status.length>23?15:19,time>28.65?W:I);
 T(g,time>28.65?"NOUVEAU RÉSULTAT":time>21?"ACTION EN COURS":"VOIR DÉTAIL",160,541,14,M);
 g.restore();
}
