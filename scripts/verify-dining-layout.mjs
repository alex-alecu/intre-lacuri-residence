import assert from 'node:assert/strict';
import * as T from 'three';

export function verifyDiningLayout(home, canOccupy) {
  assert.ok(['original','suite'].includes(home.layout));
  home.root.updateMatrixWorld(true);
  const table=home.furniture.getObjectByName('Six seat dining table');
  const sofa=home.furniture.getObjectByName('Dining corner sofa');
  const sofaReturn=home.furniture.getObjectByName('Dining sofa return');
  const screen=home.furniture.getObjectByName('Dining TV screen');
  const media=home.furniture.getObjectByName('Dining media cabinet');
  assert.ok(table&&sofa&&sofaReturn&&screen&&media,'The dining table, corner sofa, TV and cabinet are present');
  assert.equal(home.obstacles.some(o=>o.name==='Dining sideboard'),false,'The brown dining cabinet is removed');
  const sofaSize=new T.Box3().setFromObject(sofa,true).union(new T.Box3().setFromObject(sofaReturn,true)).getSize(new T.Vector3());
  assert.ok(Math.abs(sofaSize.x-2.10)<1e-6&&Math.abs(sofaSize.z-1.65)<1e-6,'The corner sofa is 2.10 by 1.65 m');
  const direction=(object,x,z)=>new T.Vector3(x,0,z).transformDirection(object.matrixWorld);
  assert.ok(Math.abs(direction(table,1,0).z)>.999,'The table long axis follows the east window');
  assert.ok(direction(sofa,0,1).z<-.999,'The sofa back faces north toward the kitchen');
  assert.ok(direction(media,0,1).z<-.999,'The TV faces north toward the sofa');
  const screenSize=new T.Box3().setFromObject(screen,true).getSize(new T.Vector3());
  assert.ok(Math.abs(Math.hypot(screenSize.x,screenSize.y)-1.80)<1e-6,'The visible TV screen diagonal is 180 cm');
  assert.ok(Math.abs(screenSize.x/screenSize.y-16/9)<1e-6,'The visible TV screen has a 16:9 ratio');
  const tableBounds=new T.Box3().setFromObject(table,true);
  assert.ok(tableBounds.min.x>12&&14.2-tableBounds.max.x<.71,'The table is next to the east window');
  const groups=home.furniture.children.filter(o=>o.isGroup&&o.position.x>8.25&&o.position.z>3.725&&o.position.z<8);
  const items=groups.map(object=>({object,name:object.name||home.obstacles.find(o=>o.furniture&&Math.abs(o.x-object.position.x)<1e-5&&Math.abs(o.z-object.position.z)<1e-5)?.name||'Kitchen fitting',box:new T.Box3().setFromObject(object,true)}));
  const changed=items.filter(o=>o.name.startsWith('Dining')||['Six seat dining table','Sofa','Coffee table'].includes(o.name));
  const meshes=object=>{
    const result=[];
    object.traverse(o=>{if(o.isMesh)result.push(new T.Box3().setFromObject(o,true));});
    return result;
  };
  for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++) {
    const a=items[i],b=items[j];
    if(!changed.includes(a)&&!changed.includes(b))continue;
    if(!a.box.intersectsBox(b.box))continue;
    // Tucked chairs can share the table's whole bounding box while clearing each mesh.
    for(const ma of meshes(a.object))for(const mb of meshes(b.object)) {
      const overlap=ma.clone().intersect(mb).getSize(new T.Vector3());
      assert.ok(Math.min(overlap.x,overlap.y,overlap.z)<.005,`${home.layout}: ${a.name} intersects ${b.name}`);
    }
  }
  const walls=home.obstacles.filter(o=>!o.furniture);
  for(const item of changed)for(const wall of walls) {
    const dx=Math.min(item.box.max.x,wall.x+wall.w/2)-Math.max(item.box.min.x,wall.x-wall.w/2);
    const dz=Math.min(item.box.max.z,wall.z+wall.d/2)-Math.max(item.box.min.z,wall.z-wall.d/2);
    assert.ok(dx<.005||dz<.005,`${item.name} clears ${wall.name}`);
  }
  const chairs=items.filter(o=>o.name==='Dining chair');
  assert.equal(chairs.length,6,'The table has six chairs');
  for(const chair of chairs) {
    const away=direction(chair.object,0,-1).multiplyScalar(.45),pulled=chair.box.clone().translate(away);
    for(const item of items.filter(o=>o!==chair)) {
      const overlap=pulled.clone().intersect(item.box).getSize(new T.Vector3());
      assert.ok(Math.min(overlap.x,overlap.y,overlap.z)<.005,`The pulled dining chair clears ${item.name}`);
    }
    for(const wall of walls) {
      const dx=Math.min(pulled.max.x,wall.x+wall.w/2)-Math.max(pulled.min.x,wall.x-wall.w/2);
      const dz=Math.min(pulled.max.z,wall.z+wall.d/2)-Math.max(pulled.min.z,wall.z-wall.d/2);
      assert.ok(dx<.005||dz<.005,'A dining chair can move 45 cm without hitting a wall or window');
    }
  }
  // Keep all room meshes solid, including furniture close to walls.
  const solid=[...walls,...items.map(({name,box})=>({name,x:(box.min.x+box.max.x)/2,z:(box.min.z+box.max.z)/2,w:box.max.x-box.min.x,d:box.max.z-box.min.z}))];
  const clear=(x,z)=>canOccupy(x,z,solid,home.polygons),step=.025,minX=8,minZ=3.5,nx=253,nz=185;
  const index=(x,z)=>z*nx+x,grid=(x,z)=>[Math.round((x-minX)/step),Math.round((z-minZ)/step)];
  const start=grid(8.85,6.4),queue=[start],visited=new Uint8Array(nx*nz);
  assert.ok(clear(8.85,6.4),'The dining entry has clear floor');
  visited[index(...start)]=1;
  for(let q=0;q<queue.length;q++) {
    const [x,z]=queue[q];
    for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const xx=x+dx,zz=z+dz;
      if(xx<0||zz<0||xx>=nx||zz>=nz||visited[index(xx,zz)]||!clear(minX+xx*step,minZ+zz*step))continue;
      visited[index(xx,zz)]=1;queue.push([xx,zz]);
    }
  }
  const routes=[['kitchen work aisle',11.3,4.95],['main sofa access',11.25,6.50],['sofa return access',10.60,6.98],['sofa to table passage',11.95,5.85],['west dining chairs',12.02,6.20],['east dining chairs',13.98,6.20],['east window north',13.98,5.40],['east window south',13.98,7.20],['north dining chair',13.05,4.72],['south dining chair',13.05,7.75],['former cabinet space',8.50,7.30]];
  for(const [name,x,z]of routes) {
    assert.ok(clear(x,z),`${home.layout}: ${name} is clear with all room meshes solid`);
    assert.ok(visited[index(...grid(x,z))],`${home.layout}: ${name} is reachable from the dining entry`);
  }
  return {screenDiagonal:Math.hypot(screenSize.x,screenSize.y),routes:routes.length,chairPull:.45};
}
