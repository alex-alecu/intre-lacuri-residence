import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {measureFurniture} from './measure-furniture.mjs';
import {verifyFamilyRooms} from './verify-family-rooms.mjs';
import {verifyClosedStorage} from './verify-closed-storage.mjs';
import * as T from 'three';

await mkdir('tmp',{recursive:true});
await build({entryPoints:['lib/build-home.ts','lib/navigation.ts','lib/home-scene.ts','lib/walk-input.ts'],outdir:'tmp/layout-check',bundle:true,platform:'node',format:'esm',packages:'external',outExtension:{'.js':'.mjs'}});
const context=new Proxy({getImageData:(_x,_y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
Object.defineProperty(globalThis,'document',{value:{createElement:()=>({width:512,height:512,getContext:()=>context})},configurable:true});
const {buildHome}=await import('../tmp/layout-check/build-home.mjs');
const {canOccupy}=await import('../tmp/layout-check/navigation.mjs');
const original=buildHome(undefined,'original');
const suite=buildHome(undefined,'suite');
const social=buildHome(undefined,'social');
const clear=(home,x,z,furnished=true)=>canOccupy(x,z,home.obstacles,home.polygons,furnished);
for(const home of [original,suite,social]){home.root.updateMatrixWorld(true);verifyClosedStorage(home);}
for(const home of [suite,social])console.log(home.layout,verifyFamilyRooms(home,canOccupy));

assert.equal(clear(suite,4.925,5.5,false),false,'The new bedroom wall closes the living room');
assert.equal(clear(original,4.925,5.5,false),true,'The original living room remains open');
assert.equal(suite.obstacles.filter(o=>o.name==='Office desk').length,1,'The living office becomes a dressing room');
assert.equal(original.obstacles.filter(o=>o.name==='Office desk').length,2,'Both original offices remain');
assert.equal(suite.obstacles.filter(o=>o.name==='Bed').length,2,'The suite keeps two adult beds');
assert.equal(suite.fixtures.filter(o=>o.name==='Television').length,1,'The gaming room has a TV');
assert.ok(suite.obstacles.some(o=>o.name==='Suite extra dressing'),'The suite has additional dressing storage');
const partitions=suite.obstacles.filter(o=>o.name==='Suite partition');
assert.ok(partitions.length>=3,'The enclosure includes its north return and doorway');
assert.ok(partitions.every(o=>Math.abs(Math.min(o.w,o.d)-.15)<1e-8),'All new wall sections are 15 cm thick');
assert.equal(clear(suite,4.925,7.05),true,'The bedroom door is clear');
assert.equal(clear(suite,4.4,4.7,false),false,'The north return closes the bedroom');
assert.equal(clear(suite,4.925,5.5,false),false,'Hiding furniture does not remove the partition');
for(const name of ['Retained concrete column','Service shaft'])assert.deepEqual(suite.obstacles.filter(o=>o.name===name),original.obstacles.filter(o=>o.name===name),`${name} stays in place`);
suite.root.updateMatrixWorld(true);
const measured=measureFurniture(suite);
social.root.updateMatrixWorld(true);
measureFurniture(social);
assert.ok(social.rooms.some(r=>r.id==='dining')&&!social.rooms.some(r=>r.id==='master'),'Dining replaces the east bedroom');
assert.equal(social.obstacles.filter(o=>o.name==='Bed').length,1,'The west suite keeps its adult bed');
assert.equal(social.fixtures.filter(o=>o.name==='Television').length,2,'The living and gaming rooms have TVs');
assert.equal(social.fixtures.find(o=>o.name==='Television'&&o.x>8).w,1.60,'The living TV is 160 cm wide');
assert.ok(social.obstacles.some(o=>o.name==='Suite extra dressing'),'Version 3 keeps the extra dressing');
for(const name of ['Retained concrete column','Service shaft'])assert.deepEqual(social.obstacles.filter(o=>o.name===name),original.obstacles.filter(o=>o.name===name),`${name} stays in place in version 3`);
for(const point of [[10.5,3.66],[10.5,3.86],[11.9,3.66]]){
 assert.equal(clear(social,...point),false,'The retained structure and island stay solid');
 assert.equal(clear(social,...point,false),false,'Hiding furniture keeps the island solid');
}
assert.equal(clear(social,13.65,3.66),true,'The east end of the island has a clear passage');
assert.equal(clear(original,13.65,3.66),false,'The original bedroom wall remains');
assert.equal(clear(suite,13.65,3.66),false,'The version 2 bedroom wall remains');
const islandWall=social.root.getObjectByName('Island half wall');
assert.ok(islandWall&&islandWall.parent===social.root,'The island wall stays visible below its cap in the overview');
assert.ok(Math.abs(new T.Box3().setFromObject(islandWall,true).max.y-1.35)<1e-6,'The retained wall is half the room height');
const kitchenGroup=social.furniture.getObjectByName('Kitchen counter');
assert.ok(new T.Box3().setFromObject(kitchenGroup,true).max.y<1.01,'No upper cabinet or backsplash closes the island opening');
const dining=social.obstacles.find(o=>o.name==='Dining table');
const sofa=social.obstacles.find(o=>o.name==='Sofa'&&o.x>8);
const counter=social.obstacles.find(o=>o.name==='Kitchen counter');
assert.ok(dining.z<3.6,'The table is in the former bedroom');
assert.equal(social.obstacles.filter(o=>o.name==='Dining chair').length,6,'Dining keeps six seats');
assert.ok(sofa.z-sofa.d/2-(counter.z+counter.d/2)>=1,'The sofa leaves a one metre kitchen aisle');
assert.ok(14.2-(counter.x+counter.w/2)>=1,'The kitchen leaves an east passage at least one metre wide');
for(const home of [original,suite,social]){
 const cabinet=home.furniture.getObjectByName(home.layout==='original'?'Child wardrobe':'Children sliding wardrobe');
 if(home.layout==='original')
 assert.ok(Math.abs(cabinet.rotation.y-Math.PI/2)<1e-8,'The child wardrobe faces into the room beside the closed toy cabinet');
 assert.equal(clear(home,cabinet.position.x,cabinet.position.z),true,'Movement ignores the wall cabinet in every layout');
 const table=home.obstacles.find(o=>o.name==='Dining table');
 assert.equal(clear(home,table.x,table.z),false,'The free-standing table remains solid in every layout');
}
assert.ok(Math.abs(original.furniture.getObjectByName('Office tall storage').rotation.y+Math.PI/2)<1e-8,'The office cabinet faces the room');
for(const home of [suite,social]){
 const cabinet=new T.Box3().setFromObject(home.furniture.getObjectByName('Suite extra dressing'),true);
 const bed=new T.Box3().setFromObject(home.furniture.getObjectByName('Suite king bed'),true);
 assert.ok(cabinet.min.z-bed.max.z>=.75,'The extra dressing leaves at least 75 cm at the bed foot');
}
const polygonArea=points=>Math.abs(points.reduce((sum,[x,z],i)=>{const [xx,zz]=points[(i+1)%points.length];return sum+x*zz-xx*z;},0)/2);
for(const id of ['living','dressing'])assert.ok(Math.abs(polygonArea(suite.footprints[id])-suite.rooms.find(r=>r.id===id).area)<.0001,`${id}: area follows its own floor outline`);
for(const furniture of suite.obstacles.filter(o=>o.furniture)){
 for(const wall of suite.obstacles.filter(o=>!o.furniture)){
  const dx=Math.min(furniture.x+furniture.w/2,wall.x+wall.w/2)-Math.max(furniture.x-furniture.w/2,wall.x-wall.w/2);
  const dz=Math.min(furniture.z+furniture.d/2,wall.z+wall.d/2)-Math.max(furniture.z-furniture.d/2,wall.z-wall.d/2);
  assert.ok(dx<=.01||dz<=.01,`${furniture.name}: no wall overlap`);
 }
}

// A separate circulation flood checks the new suite and the shared north passage.
const step=.08,minX=-1.8,minZ=-1.8,nx=226,nz=159,index=(x,z)=>z*nx+x;
const valid=new Uint8Array(nx*nz),visited=new Uint8Array(nx*nz);
for(let z=0;z<nz;z++)for(let x=0;x<nx;x++)valid[index(x,z)]=clear(suite,minX+x*step,minZ+z*step)?1:0;
const start=[Math.round((5.72-minX)/step),Math.round((9.12-minZ)/step)],queue=[start];visited[index(...start)]=1;
for(let q=0;q<queue.length;q++){const [x,z]=queue[q];for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,zz=z+dz;if(xx<0||zz<0||xx>=nx||zz>=nz)continue;const i=index(xx,zz);if(valid[i]&&!visited[i]){visited[i]=1;queue.push([xx,zz])}}}
const targets=[...suite.rooms.map(r=>[r.id,...r.visit]),['bed west side',1.65,6],['bed east side',4.43,6],['bed foot',3.5,7.30],['dressing entry',1.3,7.8],['dressing storage',1.3,8.75],['shared north passage',5.5,5.05],['bedroom door',4.925,7.05],['west balcony',-.9,3.3],['east balcony',15.2,2.7]];
for(const [name,x,z]of targets){assert.ok(clear(suite,x,z),`${name}: clear floor`);assert.ok(visited[index(Math.round((x-minX)/step),Math.round((z-minZ)/step))],`${name}: reachable from the entry`);}
// Check the whole third layout, including both sides of the island and each balcony door.
visited.fill(0);queue.length=0;queue.push(start);visited[index(...start)]=1;
for(let z=0;z<nz;z++)for(let x=0;x<nx;x++)valid[index(x,z)]=clear(social,minX+x*step,minZ+z*step)?1:0;
for(let q=0;q<queue.length;q++){const [x,z]=queue[q];for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,zz=z+dz;if(xx<0||zz<0||xx>=nx||zz>=nz)continue;const i=index(xx,zz);if(valid[i]&&!visited[i]){visited[i]=1;queue.push([xx,zz])}}}
const socialTargets=[...social.rooms.map(r=>[r.id,...r.visit]),['island east passage',13.65,3.66],['kitchen aisle',12.15,5.0],['north balcony door',12.15,-.2],['east balcony door',14.4,3.05],['west balcony door',-.2,3.45],['guest balcony door',.95,.8],['dining north aisle',12.2,.40],['dining south aisle',12.2,2.88],['sofa east aisle',13.8,6.3]];
for(const [name,x,z]of socialTargets){assert.ok(clear(social,x,z),`${name}: clear in version 3`);assert.ok(visited[index(Math.round((x-minX)/step),Math.round((z-minZ)/step))],`${name}: reachable in version 3`);}
const door=suite.obstacles.find(o=>o.name==='Suite door leaf');
assert.ok(door,'The open door leaf blocks walking through the leaf');
assert.equal(clear(suite,door.x,door.z,false),false,'The door remains solid with furniture hidden');
const again=buildHome(undefined,'original');
assert.deepEqual(again.obstacles,original.obstacles,'The new layout does not change original geometry');
assert.deepEqual(again.fixtures,original.fixtures,'The new layout does not change original fixtures');

// Exercise the actual switch method with real model geometry, without a GPU.
const {HomeScene}=await import('../tmp/layout-check/home-scene.mjs');
const {WalkInput}=await import('../tmp/layout-check/walk-input.mjs');
const artwork=new T.Texture(),home=buildHome(artwork),graph=new T.Scene();graph.add(home.root);
let artworkDisposals=0;artwork.addEventListener('dispose',()=>artworkDisposals++);
let oldTextureDisposals=0;home.textures[0].addEventListener('dispose',()=>oldTextureDisposals++);
const scene=Object.assign(Object.create(HomeScene.prototype),{
 home,artwork,scene:graph,camera:new T.PerspectiveCamera(),player:new T.Vector3(2.95,1.62,5.84),
 renderer:{domElement:{},shadowMap:{}},controls:{target:new T.Vector3(3,0,6)},
 callbacks:{onLock(){},onPosition(){}},input:new WalkInput(),clearKeys(){this.input.clear();},
 mode:'plan',furnished:false,night:true,yaw:.7,pitch:.1,immersive:true,transition:{},
});
scene.camera.position.set(3,19,6);scene.input.press(1,'ArrowUp');
const camera=scene.camera.position.clone(),target=scene.controls.target.clone();
scene.setLayout('suite');
assert.ok(scene.camera.position.equals(camera)&&scene.controls.target.equals(target),'Switching keeps the comparison camera');
assert.equal(scene.home.furniture.visible,false,'Switching keeps hidden furniture');
assert.ok(scene.home.lights.every(light=>light.intensity===10),'Switching keeps evening light');
assert.equal(scene.home.upper.visible,false,'Plan walls stay cut');
assert.equal(scene.input.pointers.size,0,'Switching stops held movement');
assert.equal(scene.immersive,false,'Switching pauses the walk');
assert.equal(graph.children.length,1,'The previous model is removed');
assert.equal(oldTextureDisposals,1,'The previous model releases its textures');
assert.equal(artworkDisposals,0,'The shared artwork remains usable');
scene.setFurniture(true);
assert.ok(clear(scene.home,scene.player.x,scene.player.z),'Restoring furniture moves the player out of the new bed');
scene.mode='walk';scene.setLayout('original');
assert.equal(scene.home.upper.visible,true,'Walk walls remain full height');
assert.equal(scene.home.ceiling.visible,true,'Walk ceiling remains visible');
assert.ok(scene.camera.position.equals(scene.player),'The walk camera follows the safe player position');
assert.deepEqual(scene.home.obstacles,original.obstacles,'Switching back restores the original layout');
assert.equal(artworkDisposals,0,'Repeated switching keeps shared artwork');
scene.setLayout('suite');scene.goToRoom('dressing');
assert.equal(scene.player.x,1.3,'Dressing navigation uses the new room data');
assert.equal(scene.player.z,8.75,'Dressing navigation reaches clear floor');
scene.setLayout('social');scene.goToRoom('dining');
assert.ok(scene.home.rooms.some(r=>r.id==='dining'),'Switching loads the dining room');
assert.ok(clear(scene.home,scene.player.x,scene.player.z),'Dining navigation reaches clear floor');
assert.equal(scene.home.upper.visible,true,'The third layout keeps full walls in walking mode');
scene.setLayout('suite');
assert.ok(scene.home.rooms.some(r=>r.id==='master')&&!scene.home.rooms.some(r=>r.id==='dining'),'Switching back restores the bedroom');
console.log(`Three layouts checked: retained walls, island, TV, storage, furniture orientation, ${measured.length} suite bounds, ${targets.length} suite routes, and version switching.`);
