import {rooms,roomFootprints} from './plan';

export type LayoutVersion='original'|'suite';
export const layoutOptions=[
 {id:'original' as const,name:'Living + birou',number:'01'},
 {id:'suite' as const,name:'Dormitor + dressing',number:'02'},
];
export function isLayoutVersion(value:unknown):value is LayoutVersion{return value==='original'||value==='suite';}

const suiteRooms=rooms.flatMap(room=>{
 if(room.id==='living')return [
  {...room,name:'Dormitor matrimonial',area:15.2475,x:0,z:4.7,w:4.85,d:3.425,measurement:'Proposed bedroom zone; dressing listed separately',detail:'Pat mare și televizor',description:'Pat de 2 × 2 m, tăblie tapițată și televizor. Perete nou de 15 cm, cu acces din hol și dressing deschis.',visit:[4.40,6.10]},
  {id:'dressing',name:'Dressing deschis',side:'ARIPA DE VEST',area:5.6921,x:0,z:7.6,w:2.55,d:2.3,measurement:'Proposed open dressing zone; not a source room area',primary:true,detail:'Dulapuri deschise din nuc',description:'Depozitare pe două laturi, rafturi luminate, sertare, oglindă înaltă și un taburet tapițat. Fereastra rămâne liberă.',visit:[1.3,8.75]},
 ];
 if(room.id==='master')return [{...room,name:'Dormitor de est',detail:'Pat și acces la balcon'}];
 return [room];
});
const suiteFootprints:Record<string,number[][]>={
 ...roomFootprints,
 living:[[0,4.7],[4.85,4.7],[4.85,8.125],[2.55,8.125],[2.55,7.6],[.25,7.6],[.25,7.5],[0,7.5]],
 dressing:[[.25,7.6],[2.55,7.6],[2.55,9.63],[2.28,9.63],[2.28,9.9],[0,9.9],[0,8],[.25,8]],
 'hall-west-north':[[4,3.125],[6.075,3.125],[6.075,5.7],[6.45,5.7],[6.45,8.125],[5,8.125],[5,4.55],[4,4.55]],
};
export function getLayout(version:LayoutVersion){
 return version==='suite'?{rooms:suiteRooms,footprints:suiteFootprints}:{rooms,footprints:roomFootprints};
}
