import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {verifyDimensions} from './verify-dimensions.mjs';
import {measureFurniture} from './measure-furniture.mjs';
await mkdir('tmp',{recursive:true});
await build({entryPoints:['lib/build-home.ts','lib/navigation.ts','lib/plan.ts'],outdir:'tmp/check',bundle:true,platform:'node',format:'esm',packages:'external',outExtension:{'.js':'.mjs'}});
const context=new Proxy({getImageData:(_x,_y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
globalThis.document={createElement:()=>({width:512,height:512,getContext:()=>context})};
const {buildHome}=await import('../tmp/check/build-home.mjs');
const {canOccupy,PLAYER_RADIUS}=await import('../tmp/check/navigation.mjs');
const {rooms,balconies,shell,roomFootprints}=await import('../tmp/check/plan.mjs');
const home=buildHome();home.root.updateMatrixWorld(true);
const dimensionAudit=verifyDimensions(home,canOccupy);
const furnitureDimensions=measureFurniture(home);
const polygonArea=p=>Math.abs(p.reduce((sum,[x,z],i)=>{const [xx,zz]=p[(i+1)%p.length];return sum+x*zz-xx*z},0)/2);
for(const b of balconies)assert.ok(Math.abs(polygonArea(b.points)-b.area)<.0001,`${b.name} area`);
assert.equal(canOccupy(6.575,8.95,home.obstacles,home.polygons),true,'New connection is open');
assert.equal(canOccupy(6.575,7.8,home.obstacles,home.polygons),false,'Existing party wall blocks movement');
assert.equal(canOccupy(5.6,-.2,home.obstacles,home.polygons),false,'Daughter window blocks movement');
assert.equal(canOccupy(-1.1,5,home.obstacles,home.polygons),false,'The empty balcony corner blocks movement');
assert.equal(canOccupy(17,5,home.obstacles,home.polygons),false,'Outside the floor blocks movement');
assert.equal(canOccupy(6.28,5.705,home.obstacles,home.polygons),false,'West bathroom corner is closed');
assert.equal(canOccupy(3.935,3.85,home.obstacles,home.polygons),true,'Guest door uses the original east opening');
assert.equal(canOccupy(1.1,4.635,home.obstacles,home.polygons),false,'Guest south partition is closed');
assert.equal(canOccupy(9.65,2.435,home.obstacles,home.polygons),true,'East bathroom door is near the east wall');
assert.deepEqual(home.fixtures.find(f=>f.name==='West WC'),{name:'West WC',x:7.42,z:3.52,w:.47,d:.70,rotation:0});
assert.deepEqual(home.fixtures.find(f=>f.name==='East WC'),{name:'East WC',x:8.63,z:1.20,w:.47,d:.70,rotation:Math.PI/2});
assert.equal(home.obstacles.filter(o=>o.name==='Office desk').length,2,'Both office desks remain');
assert.equal(home.obstacles.filter(o=>o.name==='Dining chair').length,6,'Compact dining table has six chairs');
assert.deepEqual(home.fixtures.find(f=>f.name==='Dining table'),{name:'Dining table',x:10.65,z:6.30,w:1.9,d:.9,rotation:0});
assert.ok(home.obstacles.filter(o=>o.name==='Kitchen counter').every(o=>o.x>8.25),'Kitchen is in the east room');
assert.equal(home.obstacles.filter(o=>o.name==='Sofa'&&o.x<6.45).length,1,'The west living room keeps its sofa');
assert.equal(home.obstacles.filter(o=>o.name==='Sofa'&&o.x>8.25).length,1,'The dining room has a second sofa');
assert.equal(home.obstacles.some(o=>o.name==='Media cabinet'),false,'The sitting areas have no TV cabinet');
const compactSofa=furnitureDimensions.find(f=>f.name==='Sofa'&&f.x>8.25);
assert.ok(compactSofa.depth>=.80&&compactSofa.depth<=.86,'The measured corner sofa depth includes its model scale');
const start=[5.72,9.12];assert.ok(canOccupy(...start,home.obstacles,home.polygons),'Entry start is clear');
const step=.08,minX=-1.8,minZ=-1.8,nx=226,nz=159;
const index=(x,z)=>z*nx+x,world=(x,z)=>[minX+x*step,minZ+z*step];
const valid=new Uint8Array(nx*nz),visited=new Uint8Array(nx*nz);
for(let z=0;z<nz;z++)for(let x=0;x<nx;x++)valid[index(x,z)]=canOccupy(...world(x,z),home.obstacles,home.polygons)?1:0;
const sx=Math.round((start[0]-minX)/step),sz=Math.round((start[1]-minZ)/step),queue=[[sx,sz]];visited[index(sx,sz)]=1;
for(let q=0;q<queue.length;q++){const [x,z]=queue[q];for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,zz=z+dz;if(xx<0||zz<0||xx>=nx||zz>=nz)continue;const i=index(xx,zz);if(valid[i]&&!visited[i]){visited[i]=1;queue.push([xx,zz])}}}
const targets=[...rooms.map(r=>({id:r.id,point:r.visit})),{id:'west-balcony',point:[1.9,-.28]},{id:'west-balcony-arm',point:[-1.1,3.3]},{id:'east-balcony',point:[12.2,-1.0]},{id:'east-balcony-arm',point:[15.4,2.7]},{id:'master-east-balcony-door',point:[14.4,3.05]},{id:'guest-west-balcony-door',point:[-.2,3.45]},{id:'guest-north-balcony-door',point:[.95,.8]},{id:'master-north-balcony-door',point:[12.15,-.2]},{id:'master-wardrobe-approach',point:[11.3,1.5]},{id:'kitchen-preparation',point:[11.3,4.95]},{id:'dining-south',point:[11.35,7.55]},{id:'living-desk-approach',point:[1.24,8.05]},{id:'guest-desk-approach',point:[1.65,2.3]},{id:'dining-sofa-approach',point:[12.98,6.70]},{id:'dining-window-approach',point:[13.70,5.80]},{id:'sideboard-approach',point:[9.10,7.15]},{id:'living-sofa-approach',point:[3.30,5.94]},{id:'living-armchairs-approach',point:[3.30,7.00]},{id:'reading-tent-approach',point:[6.10,1.30]},{id:'child-play-area',point:[6.05,2.30]}];
const results=targets.map(t=>{const [x,z]=t.point,clear=canOccupy(x,z,home.obstacles,home.polygons);const ix=Math.round((x-minX)/step),iz=Math.round((z-minZ)/step);return {id:t.id,clear,reachable:Boolean(visited[index(ix,iz)])}});
let meshes=0,triangles=0;home.root.traverse(o=>{assert.ok(!o.isSprite,'No floating room labels or dimensions');if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position?.count??0)/3;assert.ok(o.matrixWorld.elements.every(Number.isFinite),'Finite mesh transform')}});
const report={dimensionAudit,furnitureDimensions,playerRadius:PLAYER_RADIUS,gridStep:step,meshes,triangles,obstacleCount:home.obstacles.length,reachableGridPoints:queue.length,rooms:results,fixtures:home.fixtures,balconyAreas:balconies.map(b=>({name:b.name,area:polygonArea(b.points)}))};
assert.ok(results.every(r=>r.clear&&r.reachable),`Every room and furniture approach must be reachable: ${results.filter(r=>!r.clear||!r.reachable).map(r=>r.id).join(', ')}`);
await writeFile('tmp/model-check.json',JSON.stringify(report,null,2));
await writeFile('tmp/collision-data.json',JSON.stringify({obstacles:home.obstacles,polygons:home.polygons,rooms},null,2));
await writeFile('public/measurements.json',JSON.stringify({
 units:'metres',axes:{x:'east',z:'south',y:'up'},
 sources:{floorPlan:'A 07 plan etaj 1.pdf',apartmentPlans:'relevee ap 11-12 A32_260629_152328.pdf'},
 apartmentLabels:{floorPlan:['6','7'],apartmentPlans:['11','12'],model:['west','east']},
 interiorArea:117.79,balconyArea:22.62,areaStatus:'Source labels; not a new site measurement.',
 wallHeight:{value:2.7,status:'assumed'},floorDatum:6.4,
 wallThickness:{external:.4,externalWall:.25,externalInsulation:.15,internal:.125,party:.25,entry:.25},
 calibration:{source:'A07 vector drawing',pointsPerMetre:28.3465,origin:{x:277.7565,y:166.0028},note:'The 13 cm partition labels round the drawn 12.5 cm. Model geometry follows the vector wall faces.'},
 hallOpening:{x:[6.45,6.70],z:[8.35,9.55],width:1.2,height:2.15,status:'design proposal; structure not verified'},
 sourceDifferences:[
  'Child room depth: A07 label and drawing 3.00 m; apartment PDF label 3.05 m. Model retains 3.00 m. Site measurement is unresolved.',
  'Guest dimensions: A07 vector 3.875 x 3.575 m. Labels round or truncate to 3.87 x 3.57/3.58 m.',
  'East kitchen width: 5.95 m between wall faces; 5.70 m to the projecting column face. These are different measurement lines.',
  'East entry: 1.30 m clear; the 1.55 m dimension includes the 0.25 m party wall.',
  'Utility: 1.65 m inside; the 1.77 m line is outside its 0.125 m north partition.',
  'Guest closure, internal hall connection, and all furniture layouts are design proposals.'
 ],
 checkedDimensions:dimensionAudit.measurements.map(({label,actual})=>({label,value:Number(actual.toFixed(4))})),
 columns:home.obstacles.filter(o=>o.name==='Retained concrete column'),
 serviceShafts:home.obstacles.filter(o=>o.name==='Service shaft'),
 furnitureStatus:'Proposed sizes. The plans do not specify the new furniture. Width and depth include visible frames, handles, and worktops.',
 furnitureDimensions:furnitureDimensions.map(({name,x,z,width,depth})=>({name,x,z,width,depth})),
 design:{diningSeats:6,diningTable:{width:1.9,depth:.9},extraSofaRoom:'east dining',televisions:0,childBed:'House frame above the retained 0.95 x 1.85 m mattress'},
 kitchenWorkAisle:Number(dimensionAudit.kitchenWorkAisle.toFixed(3)),
 diningSofaGap:Number(dimensionAudit.diningSofaGap.toFixed(3)),
 diningSouthAisle:{value:Number(dimensionAudit.diningSouthAisle.toFixed(2)),status:'Model clearance with chairs in the shown position; not a pulled-out chair test.'},
 rooms,roomFootprints,balconies,shell,
 note:'Source areas and navigation zones use different boundaries. Do not calculate floor area from room bounding rectangles.'
},null,2));
console.log(JSON.stringify({wallFaceChecks:dimensionAudit.measurements.length,furnitureMeshChecks:furnitureDimensions.length,diningSouthAisle:dimensionAudit.diningSouthAisle,reachableTargets:results.filter(r=>r.clear&&r.reachable).length,totalTargets:results.length,meshes,triangles},null,2));
