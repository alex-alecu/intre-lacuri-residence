import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {Obstacle} from './navigation';

// One model unit is one metre. The room walls and openings stay in build-home.
export function buildChildRoom(furniture:T.Group,obstacles:Obstacle[],materials:{linen:T.MeshStandardMaterial;wood:T.MeshStandardMaterial;rug:T.MeshStandardMaterial;glow:T.MeshStandardMaterial}){
 const cream=new T.MeshStandardMaterial({color:'#f5eee2',roughness:.72});
 const oak=new T.MeshStandardMaterial({color:'#cfad80',roughness:.65});
 const pink=new T.MeshStandardMaterial({color:'#dcc1b6',map:materials.linen.map,roughness:1});
 const sage=new T.MeshStandardMaterial({color:'#a5ad91',map:materials.linen.map,roughness:1});
 const honey=new T.MeshStandardMaterial({color:'#d7b86f',roughness:.95});
 const cloth=new T.MeshStandardMaterial({color:'#f5ecdc',map:materials.linen.map,side:T.DoubleSide,roughness:1});
 function mesh(geometry:T.BufferGeometry,material:T.Material,parent:T.Object3D){const o=new T.Mesh(geometry,material);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function box(parent:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,material:T.Material=oak,r=.008){const o=mesh(r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new T.BoxGeometry(w,h,d),material,parent);o.position.set(x,y,z);return o;}
 function ball(parent:T.Object3D,x:number,y:number,z:number,r:number,material:T.Material,sx=1,sy=1,sz=1){const o=mesh(new T.SphereGeometry(r,16,12),material,parent);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;}
 function cylinder(parent:T.Object3D,x:number,y:number,z:number,r:number,h:number,material:T.Material){const o=mesh(new T.CylinderGeometry(r,r,h,32),material,parent);o.position.set(x,y,z);return o;}
 function beam(parent:T.Object3D,a:number[],b:number[],width:number,material:T.Material){const start=new T.Vector3(...a),end=new T.Vector3(...b),o=box(parent,0,0,0,width,start.distanceTo(end),width,material);o.position.copy(start).add(end).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize());return o;}
 function group(name:string,x:number,z:number,parent:T.Object3D=furniture){const g=new T.Group();g.name=name;g.position.set(x,0,z);parent.add(g);return g;}
 function solid(name:string,x:number,z:number,w:number,d:number){obstacles.push({name,x,z,w,d,furniture:true});}
 function lights(parent:T.Object3D,points:number[][]){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
  mesh(new T.TubeGeometry(curve,36,.004,5,false),oak,parent);
  for(let i=0;i<=16;i++){const p=curve.getPoint(i/16);ball(parent,p.x,p.y-.015,p.z,.014,materials.glow);}
 }

 // The mattress is along the east wall. A 50 cm strip leads to the steps.
 const bed=group('Children bed',3.05,2.10),deck=1.38;
 box(bed,0,deck-.065,0,1.50,.13,2.08,cream,.012).name='Children loft platform';
 for(const x of [-.715,.715])for(const z of [-1.005,1.005])box(bed,x,.655,z,.07,1.31,.07,oak);
 box(bed,.715,1.06,0,.07,.10,2.08,oak);
 box(bed,.25,deck+.095,0,.90,.19,1.90,materials.linen,.065).name='Children loft mattress';
 box(bed,.25,deck+.21,.24,.91,.075,1.32,pink,.045);
 box(bed,.25,deck+.24,-.64,.70,.15,.42,cloth,.07);
 box(bed,.31,deck+.32,-.48,.38,.28,.13,honey,.055);
 box(bed,.22,deck+.25,.65,.93,.035,.35,sage,.015);
 for(const z of [-1.005,1.005]){
  box(bed,0,deck+.66,z,1.50,.045,.045,cream);
  box(bed,0,deck+.28,z,1.50,.10,.045,cream);
  for(let i=0;i<16;i++)box(bed,-.705+i*.094,deck+.465,z,.025,.365,.025,cream,.004);
 }
 box(bed,.725,deck+.66,0,.045,.045,2.05,cream);
 for(let i=0;i<22;i++)box(bed,.725,deck+.45,-.98+i*.093,.025,.40,.025,cream,.004);
 // Two access gaps face the steps and slide. The south edge keeps its rail.
 box(bed,-.725,deck+.66,.64,.045,.045,.78,cream);
 for(let i=0;i<9;i++)box(bed,-.725,deck+.45,.28+i*.09,.025,.40,.025,cream,.004);
 box(bed,-.725,deck+.66,-.36,.045,.045,.10,cream);
 solid('Child bed',3.05,2.10,1.50,2.08);

 // Closed risers, side panels, and continuous handrails follow the reference.
 const stairs=group('Children loft stairs',1.675,1.39),run=1.25,steps=8;
 for(let i=0;i<steps;i++){
  const h=(i+1)*deck/steps,x=-run/2+(i+.5)*run/steps;
  box(stairs,x,h/2,0,run/steps,h,.54,oak,.006);
  box(stairs,x,h+.008,0,run/steps,.016,.55,oak,.004);
 }
 for(const z of [-.29,.29]){
  const a=[-run/2+.025,.40,z],b=[run/2-.025,deck+.54,z];
  beam(stairs,a,b,.045,cream);
  for(let i=0;i<7;i++){
   const t=i/6,x=-run/2+.025+t*(run-.05),floor=.05+t*(deck-.05),top=.40+t*(deck+.14);
   box(stairs,x,(floor+top)/2,z,.035,top-floor,.035,oak,.005);
  }
 }
 solid('Children loft stairs',1.675,1.39,1.25,.62);

 const slide=group('Children loft slide',1.675,2.12);
 // A short flat exit joins the sloping white surface.
 const profile=[[-.625,.10],[-.49,.10],[.625,deck]];
 for(let i=0;i<profile.length-1;i++){
  const [a,b]=[profile[i],profile[i+1]];
  const panel=(z:number,depth:number,lo:number,hi:number,material:T.Material)=>{
   const shape=new T.Shape([new T.Vector2(a[0],a[1]+lo),new T.Vector2(b[0],b[1]+lo),new T.Vector2(b[0],b[1]+hi),new T.Vector2(a[0],a[1]+hi)]);
   mesh(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),material,slide).position.z=z-depth/2;
  };
  panel(0,.48,-.025,.01,cream);
  for(const z of [-.27,.27])panel(z,.04,-.025,.18,oak);
 }
 solid('Children loft slide',1.675,2.12,1.32,.59);

 // Child-scale reading space fits below the raised deck.
 const tent=group('Children reading tent',-.10,.47,bed);
 const tentFabric=mesh(new T.CylinderGeometry(.035,.42,1.08,24,1,true,Math.PI/4,Math.PI*1.5),cloth,tent);
 tentFabric.position.y=.59;tent.rotation.y=-Math.PI/2;
 for(const a of [Math.PI/4,Math.PI*3/4,Math.PI*5/4,Math.PI*7/4])beam(tent,[Math.sin(a)*.40,.04,Math.cos(a)*.40],[-Math.sin(a)*.04,1.23,-Math.cos(a)*.04],.019,oak);
 cylinder(tent,0,.055,0,.42,.08,cloth);
 ball(tent,-.13,.15,-.10,.15,honey,1,.6,1);ball(tent,.15,.15,-.06,.14,sage,1,.6,1);
 lights(tent,[[-.28,.14,.28],[-.17,.55,.19],[0,1.10,.07],[.17,.55,.19],[.28,.14,.28]]);
 const shelf=group('Children toy cubbies',.49,-.52,bed);shelf.rotation.y=-Math.PI/2;
 box(shelf,0,.57,-.13,.86,1.12,.035,oak);
 for(const x of [-.43,0,.43])box(shelf,x,.57,0,.03,1.12,.28,oak);
 for(const y of [.025,.39,.76,1.13])box(shelf,0,y,0,.89,.03,.28,oak);
 for(const x of [-.22,.22]){
  box(shelf,x,.205,.01,.37,.31,.24,cream,.014);
  box(shelf,x,.315,.137,.09,.019,.006,materials.wood,.005);
 }
 for(let i=0;i<5;i++)box(shelf,-.34+i*.054,.535,-.015,.043,.24+(i%2)*.035,.17,i%2?pink:sage,.004);
 ball(shelf,.22,.87,0,.08,honey,1,1.2,.8);ball(shelf,.22,1.01,0,.062,honey);
 for(const x of [.18,.26])ball(shelf,x,1.06,0,.025,honey);
 lights(bed,[[-.70,1.18,1.015],[-.71,1.08,.65],[-.71,1.12,.1],[-.71,1.20,-.35],[-.71,1.12,-.94]]);

 // Soft floor, round activity table, and two small padded stools.
 box(furniture,1.52,.024,3.06,1.70,.035,1.36,materials.rug,.018);
 box(furniture,.58,.043,2.74,.58,.018,1.65,cloth,.015);
 for(let i=0;i<6;i++){
  const pair=i%3===1,colors=[pink,honey,sage];
  for(let j=0;j<(pair?2:1);j++)box(furniture,.58+(pair?(j-.5)*.245:0),.055,2.10+i*.25,pair?.23:.32,.006,.23,colors[i%3],.005);
 }
 const table=group('Children activity table',1.27,3.17);
 cylinder(table,0,.44,0,.29,.055,cream);
 for(const a of [0,Math.PI*2/3,Math.PI*4/3])beam(table,[Math.sin(a)*.23,.04,Math.cos(a)*.23],[Math.sin(a)*.16,.42,Math.cos(a)*.16],.045,oak);
 box(table,-.04,.475,0,.18,.008,.14,pink,.002);
 for(let i=0;i<4;i++)box(table,.08+i*.017,.482,.07,.012,.01,.09,[sage,honey,pink,oak][i],.002).rotation.y=.4;
 solid('Children activity table',1.27,3.17,.58,.58);
 for(const [x,z] of [[.76,3.15],[1.76,3.29]]){
  const stool=group('Children padded stool',x,z);
  for(const dx of [-.085,.085])for(const dz of [-.085,.085])box(stool,dx,.13,dz,.035,.24,.035,oak);
  cylinder(stool,0,.25,0,.16,.10,cloth);ball(stool,0,.295,0,.16,cloth,1,.32,1);
  solid('Children padded stool',x,z,.32,.32);
 }
 return {name:'Children bed',x:3.30,z:2.10,w:.90,d:1.90,rotation:0};
}
