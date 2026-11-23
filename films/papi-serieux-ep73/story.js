// « Papi, sérieux ? » — Épisode 73 : Le casque de réalité virtuelle
export const EPISODE=73,TITLE="Le casque de réalité virtuelle",BPM=120,BEAT=.5,DUR=36;
export const beats=t=>t/BEAT;
export const LINES=[{"id":"l1","who":"leo","t":0.5,"d":3.4},{"id":"l2","who":"papi","t":4.8,"d":3.5},{"id":"l3","who":"leo","t":9,"d":4},{"id":"l4","who":"papi","t":14.4,"d":1.05},{"id":"l4b","who":"papi","t":16.25,"d":4.2},{"id":"l5","who":"leo","t":21.5,"d":2.85},{"id":"l6","who":"papi","t":25.05,"d":2.95},{"id":"l7","who":"leo","t":29.2,"d":2.85},{"id":"l8","who":"papi","t":32.85,"d":2.6}];
export const SUBS=[[0.5,4.18,"Papi, mets ce casque","pour visiter la lune !"],[4.8,8.5,"Il faut vraiment","sortir de la cuisine ?"],[9,13.5,"Tu te déplaces dans","un monde virtuel."],[14.4,16.14,"Dans mon temps…"],[16.25,20.65,"On voyageait avec","une carte postale."],[21.5,24.4,"Papi, avance tout doucement !"],[25.05,28.05,"Je marche sur un","cratère, attention !"],[29.2,32.1,"Tu viens de heurter le canapé !"],[32.85,35.65,"La lune a de drôles","de coussins !"]];
export const CUTS=[4.4,8.75,13.9,21,24.6,28.65,32.5];
export const T_IRIS=[35.3,35.9];
export const shotAt=t=>{let i=0;while(i<CUTS.length&&t>=CUTS[i])i++;return i;};
export function buildEvents(){const E=LINES.map(l=>({...l,type:'vo'}));for(const t of [.7,9.2,10.5,11.4,14.2,16,18.7,21.8,25.4,28.9,33.2])E.push({t,type:t===9.2||t===25.4?'ding':'tick'});E.push({t:35.9,type:'irisThunk'});return E.sort((a,b)=>a.t-b.t);}
