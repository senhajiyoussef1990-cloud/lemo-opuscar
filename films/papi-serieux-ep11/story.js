// Papi, sérieux ? — épisode 11 « Les notifications »
// Eight-shot 1930s rubber-hose short. Same voice, kitchen, subtitle and soundtrack engine as the preceding episodes.
export const BPM=120, BEAT=.5, DUR=36.0;
export const beats=t=>t/BEAT;
export const LINES=[
  {id:'l1',who:'leo',t:.5,d:3.35},
  {id:'l2',who:'papi',t:4.8,d:3.45},
  {id:'l3',who:'leo',t:9,d:3.6},
  {id:'l4',who:'papi',t:14.4,d:.77},
  {id:'l4b',who:'papi',t:16.25,d:4.0},
  {id:'l5',who:'leo',t:21.5,d:2.55},
  {id:'l6',who:'papi',t:25.05,d:2.9},
  {id:'l7',who:'leo',t:29.2,d:2.65},
  {id:'l8',who:'papi',t:32.85,d:2.35}
];
export const SUBS=[
 [.5,4.12,'Papi ! Mon téléphone n’arrête pas','de sonner !'],
 [4.8,8.4,'Il a quelque chose à dire,','ou il se gratte ?'],
 [9,13.5,'Papi, sérieux ? J’ai cinquante','notifications !'],
 [14.4,16.18,'Dans mon temps…'],
 [16.25,20.8,'Quand on voulait nous parler,','on frappait à la porte.'],
 [21.5,24.4,'Et si je rate quelque chose','d’important ?'],
 [25.05,28.05,'Regarde celui qui est devant toi.'],
 [29.2,32.12,'Papi… c’était quoi, ton message ?'],
 [32.85,35.55,'Que ta crêpe refroidit','depuis dix minutes !']
];
export const CUTS=[4.4,8.75,13.9,21,24.6,28.65,32.5];
export const shotAt=t=>{let i=0;while(i<CUTS.length&&t>=CUTS[i])i++;return i;};
export const T_IRIS=[35.3,35.9];
export function buildEvents(){
 const E=LINES.map(l=>({t:l.t,type:'vo',id:l.id,who:l.who,d:l.d}));
 for(const t of [.2,.45,.8,9.1,9.45,10.0,10.55,11.2,12.4,13.3,21.2,22.0,22.9,23.7])E.push({t,type:'ding'});
 for(const t of [14,16,18,20])E.push({t,type:'tick'});
 E.push({t:24.8,type:'rustle',d:.6},{t:25.25,type:'pat'},{t:26.0,type:'clink'},{t:28.9,type:'step'},{t:33.2,type:'clink'},{t:35.9,type:'irisThunk'});
 return E.sort((a,b)=>a.t-b.t);
}
