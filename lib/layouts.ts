import {rooms,roomFootprints} from './plan';

export type LayoutVersion='original'|'suite'|'social';
export const layoutOptions=[
 {id:'original' as const,name:'Living + birou',number:'01'},
 {id:'suite' as const,name:'Dormitor + dressing',number:'02'},
 {id:'social' as const,name:'Living + dining',number:'03'},
];
export function isLayoutVersion(value:unknown):value is LayoutVersion{return layoutOptions.some(option=>option.id===value);}

const suiteRooms=rooms.flatMap(room=>{
 if(room.id==='living')return [
  {...room,name:'Dormitor matrimonial',area:15.2475,x:0,z:4.7,w:4.85,d:3.425,measurement:'Proposed bedroom zone; dressing listed separately',detail:'Pat, birou mic și depozitare',description:'Pat de 2 × 2 m, birou mic lângă pat, orientat spre fereastră, și dulapuri pentru haine împăturite. Acces din hol și zona de dressing.',visit:[4.40,6.10]},
  {id:'dressing',name:'Dressing',side:'ARIPA DE VEST',area:5.6921,x:0,z:7.6,w:2.55,d:2.3,measurement:'Proposed open dressing zone; not a source room area',primary:true,detail:'Dulapuri cu uși glisante',description:'Dulapuri închise pe două laturi, uși glisante, oglindă înaltă și un taburet tapițat. Fereastra rămâne liberă.',visit:[1.3,8.75]},
 ];
 if(room.id==='master')return [{...room,name:'Dormitor de est',detail:'Pat și acces la balcon'}];
 if(room.id==='guest')return [{...room,name:'Camera copilului',detail:'Pat la înălțime, tobogan și cort',description:'Pat la înălțime, cu saltea de 90 × 190 cm, scară din stejar și tobogan alb. Cort de lectură și rafturi pentru jucării sub pat. Măsuță rotundă, scaune moi și lumini calde. Dulapul de 2,75 m și accesul la ambele balcoane rămân libere.',visit:[.55,3.60]}];
 if(room.id==='daughter')return [{...room,name:'Gaming și birou',detail:'Birou, canapea și dulap cu uși glisante',description:'Birou de 1,30 m și televizor cu diagonala de 180 cm pe același perete de vest. Biroul este lângă fereastră, orientat spre perete. Canapea de 2,40 m în mijlocul camerei, cu spatele spre dulapul cu uși glisante de pe peretele de est. Măsuță cu depozitare și corp pentru consolă.',visit:[5.55,2.75]}];
 return [room];
});
const suiteFootprints:Record<string,number[][]>={
 ...roomFootprints,
 living:[[0,4.7],[4.85,4.7],[4.85,8.125],[2.55,8.125],[2.55,7.6],[.25,7.6],[.25,7.5],[0,7.5]],
 dressing:[[.25,7.6],[2.55,7.6],[2.55,9.63],[2.28,9.63],[2.28,9.9],[0,9.9],[0,8],[.25,8]],
 'hall-west-north':[[4,3.125],[6.075,3.125],[6.075,5.7],[6.45,5.7],[6.45,8.125],[5,8.125],[5,4.55],[4,4.55]],
};
const socialRooms=suiteRooms.map(room=>{
 if(room.id==='daughter')return {...room,description:'Birou de 1,60 m pe peretele de vest, cu sertare și scaun de lucru. Canapea de 2,40 m și televizor cu diagonala de 180 cm. Dulap cu uși glisante pe tot peretele de est, corpuri închise deasupra biroului, măsuță cu depozitare și corp pentru consolă.',visit:[5.8,2.35]};
 if(room.id==='master')return {...room,id:'dining',name:'Dining',detail:'Masă pentru șase persoane',description:'Fostul dormitor devine loc de luat masa. Insula leagă camerele, iar trecerea din est păstrează accesul la balcon.',visit:[13.65,2.30]};
 if(room.id==='kitchen')return {...room,name:'Living și bucătărie',detail:'Canapea și TV de 160 cm',description:'Canapea orientată spre televizor, cu un culoar de lucru în spate. Peretele de 1,35 m formează insula; structura din stânga rămâne întreagă.',visit:[10.10,6.30]};
 return room;
});
const socialFootprints:Record<string,number[][]>={...suiteFootprints,dining:[[10.325,0],[14.2,0],[14.2,3.6],[10.325,3.6]]};
export function getLayout(version:LayoutVersion){
 if(version==='social')return {rooms:socialRooms,footprints:socialFootprints};
 return version==='suite'?{rooms:suiteRooms,footprints:suiteFootprints}:{rooms,footprints:roomFootprints};
}
