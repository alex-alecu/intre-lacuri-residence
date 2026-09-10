import assert from 'node:assert/strict';
import * as T from 'three';

export function verifyBedroomDesk(home,canOccupy){
 home.root.updateMatrixWorld(true);
 const desk=home.furniture.getObjectByName('Bedroom desk'),chair=home.furniture.getObjectByName('Bedroom chair');
 assert.ok(desk&&chair,`${home.layout}: the bedroom has a desk and chair`);
 const deskBox=new T.Box3().setFromObject(desk,true),size=deskBox.getSize(new T.Vector3());
 assert.ok(Math.abs(size.x-.68)<1e-6&&Math.abs(size.z-1.20)<1e-6,'The bedroom desk is 120 by 68 cm');
 assert.ok(Math.abs(desk.rotation.y-Math.PI/2)<1e-8,'The desk faces the west window');
 assert.ok(deskBox.min.z>=5.1&&deskBox.max.z<=6.9,'The desk stays within the window span');
 const groups=home.furniture.children.filter(o=>o.isGroup&&o.position.x<4.85&&o.position.z>=4.7);
 const boxes=groups.map(o=>({name:o.name||'Bedroom furniture',object:o,box:new T.Box3().setFromObject(o,true)}));
 const chairBox=new T.Box3().setFromObject(chair,true),pulledChair=chairBox.clone().translate(new T.Vector3(.45,0,0));
 for(const item of boxes){
  if(item.object!==desk)assert.ok(!deskBox.intersectsBox(item.box),`The bedroom desk clears ${item.name}`);
  if(item.object!==chair){
   assert.ok(!chairBox.intersectsBox(item.box),`The bedroom chair clears ${item.name}`);
   assert.ok(!pulledChair.intersectsBox(item.box),`The chair can move 45 cm away from the desk before ${item.name}`);
  }
 }
 // Actual mesh bounds stay solid, including furniture next to a wall.
 const solid=[...home.obstacles.filter(o=>!o.furniture),...boxes.map(({name,box})=>({
  name,x:(box.min.x+box.max.x)/2,z:(box.min.z+box.max.z)/2,w:box.max.x-box.min.x,d:box.max.z-box.min.z,
 }))];
 const clear=(x,z)=>canOccupy(x,z,solid,home.polygons),step=.04,minX=-.4,minZ=4.4,nx=147,nz=142;
 const index=(x,z)=>z*nx+x,cell=(x,z)=>[Math.round((x-minX)/step),Math.round((z-minZ)/step)];
 const visited=new Uint8Array(nx*nz),start=cell(4.925,7.05),queue=[start];visited[index(...start)]=1;
 assert.ok(clear(4.925,7.05),'The bedroom door stays clear');
 for(let q=0;q<queue.length;q++){
  const [x,z]=queue[q];
  for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){
   const xx=x+dx,zz=z+dz;
   if(xx<0||zz<0||xx>=nx||zz>=nz||visited[index(xx,zz)]||!clear(minX+xx*step,minZ+zz*step))continue;
   visited[index(xx,zz)]=1;queue.push([xx,zz]);
  }
 }
 const routes=[['bed west side',1.65,6],['bed east side',4.43,6],['bed foot',3.5,7.30],['dressing entry',1.3,7.8],['dressing storage',1.3,8.75],['desk access',1.05,6.95]];
 for(const [name,x,z]of routes){
  assert.ok(clear(x,z),`${name}: clear with all bedroom furniture solid`);
  assert.ok(visited[index(...cell(x,z))],`${name}: reachable from the bedroom door`);
 }
 return {deskWidth:size.z,deskDepth:size.x,chairTravel:.45,routes:routes.length};
}
