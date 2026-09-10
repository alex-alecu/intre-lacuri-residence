import assert from 'node:assert/strict';
import * as T from 'three';

// Check actual furniture bounds and the complete door movement in both changed rooms.
export function verifyFamilyRooms(home, canOccupy) {
  home.root.updateMatrixWorld(true);
  const revised=home.layout==='suite';
  const bounds = name => {
    const object = home.furniture.getObjectByName(name);
    assert.ok(object, `${home.layout}: ${name} is present`);
    return new T.Box3().setFromObject(object, true);
  };
  const bed = bounds('Children bed');
  const play = bounds('Children climbing frame'), toyStorage = bounds('Children toy storage');
  const wardrobe = bounds('Children sliding wardrobe');
  const desk = bounds('Gaming desk'), sofa = bounds('Gaming sofa'), media = bounds('Gaming media cabinet');
  assert.ok(bed.max.x < 3.875 && bed.min.z >= 1, 'The bed is in the corner room');
  assert.ok(desk.min.x >= 4-1e-6 && desk.max.x <= 8 && desk.max.z <= 3, 'The desk is in the former child room');
  assert.equal(home.obstacles.filter(o => o.name === 'Office desk' && o.x < 4 && o.z < 4.575).length, 0, 'The corner bedroom has no desk');
  assert.equal(home.obstacles.filter(o => o.name === 'Child bed').length, 1, 'The room has one child bed');
  assert.ok(bed.min.x-play.max.x>=.60,'The bed has at least 60 cm beside the play equipment');
  assert.ok(wardrobe.min.z-bed.max.z>=.75, 'At least 75 cm remains at the bed foot');
  assert.ok(toyStorage.max.x-toyStorage.min.x>=1.15,'The child has a separate toy storage unit');
  const officeStorage=bounds('Office storage wall');
  assert.ok(officeStorage.min.z<=.021 && officeStorage.max.z>=2.979 && officeStorage.max.y>=2.3,'The office wardrobe covers the full east wall');
  assert.ok(Math.max(sofa.max.x-sofa.min.x,sofa.max.z-sofa.min.z)>=2.399,'The office sofa is at least 2.40 m long');
  assert.ok(officeStorage.min.x-sofa.max.x>=.60,'The sofa leaves at least 60 cm along the wardrobe');
  assert.ok(officeStorage.min.x-media.max.x>=.60,'The TV cabinet keeps the south wardrobe corner accessible');
  assert.ok(bounds('Office wall cabinets').min.y>=1.65,'The closed wall cabinets clear the desk');
  assert.ok(play.min.z-toyStorage.max.z>=.60,'The toy storage has at least 60 cm in front');
  const screen=home.furniture.getObjectByName('Office TV screen');
  assert.ok(screen,'The office TV screen is present');
  screen.geometry.computeBoundingBox();
  const screenBounds=screen.geometry.boundingBox.getSize(new T.Vector3()).multiply(screen.getWorldScale(new T.Vector3()));
  assert.ok(Math.abs(Math.hypot(screenBounds.x,screenBounds.y)-1.80)<1e-6,'The visible office screen diagonal is 180 cm');
  assert.ok(Math.abs(screenBounds.x/screenBounds.y-16/9)<1e-6,'The office screen uses a 16:9 ratio');
  if(revised){
    const television=home.furniture.getObjectByName('Office television');
    const seating=home.furniture.getObjectByName('Gaming sofa');
    const work=home.furniture.getObjectByName('Gaming desk');
    const chair=home.furniture.getObjectByName('Gaming chair');
    const facing=o=>new T.Vector3(0,0,1).transformDirection(o.matrixWorld);
    assert.ok(television.position.x<4.1&&Math.abs(television.position.z-2.14)<.01&&facing(television).x>.99,'The TV faces east from the west wall beside the desk');
    assert.ok(bounds('Office wall cabinets').min.y>bounds('Office television').max.y,'The wall cabinets clear the TV frame');
    assert.ok(facing(seating).x<-.99&&seating.position.x>5.5&&seating.position.x<6.5,'The sofa faces the TV with its back to the east wardrobe');
    assert.ok(Math.abs(seating.position.x-6.10)<1e-6&&Math.abs(seating.position.z-1.22)<1e-6,'The sofa keeps its previous position');
    assert.ok(desk.min.x<4.1&&desk.min.z<.05&&facing(work).x>.99&&facing(chair).x<-.99,'The desk is on the west wall and the seated user faces west');
    assert.ok(Math.abs(desk.max.z-desk.min.z-1.30)<1e-6&&Math.abs(desk.max.x-desk.min.x-.68)<1e-6,'The desk is 130 by 68 cm');
    assert.ok(desk.max.z<bounds('Office television').min.z,'The desk and TV fit beside each other on the west wall');
    assert.ok(sofa.min.x-media.max.x>=1.25,'The sofa and TV cabinet have at least 125 cm of clear floor');
  }else assert.ok(media.min.z-sofa.max.z>=1.40,'The sofa and TV cabinet have at least 140 cm of clear floor');
  const groups = home.furniture.children.filter(o => o.isGroup && (
    (o.position.x < 3.875 && o.position.x >= 0 && o.position.z >= 1 && o.position.z < 4.575) ||
    (o.position.x >= 4 && o.position.x < 8 && o.position.z >= 0 && o.position.z < 3)
  ));
  const boxes = groups.map(o => ({name:o.name || 'Room furniture',box:new T.Box3().setFromObject(o,true)}));
  const table=home.furniture.getObjectByName('Office storage table');
  for(const door of table.children.filter(o=>o.name==='Closed storage front')){
    door.geometry.computeBoundingBox();
    const openSpace=door.geometry.boundingBox.clone().translate(door.position);
    openSpace.max.z+=door.geometry.boundingBox.getSize(new T.Vector3()).x;
    openSpace.applyMatrix4(table.matrixWorld);
    for(const item of boxes.filter(o=>o.name!==table.name))assert.ok(!openSpace.intersectsBox(item.box),`The storage table doors clear ${item.name}`);
  }
  const pulledChair=bounds('Gaming chair').translate(new T.Vector3(.45,0,0));
  for(const item of boxes.filter(o=>o.name!=='Gaming chair'))assert.ok(!pulledChair.intersectsBox(item.box),`The pulled-out chair clears ${item.name}`);
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++) {
    const overlap = boxes[i].box.clone().intersect(boxes[j].box).getSize(new T.Vector3());
    assert.ok(Math.min(overlap.x,overlap.y,overlap.z) < .005, `${boxes[i].name} overlaps ${boxes[j].name}`);
  }
  const leaves=[];
  home.upper.traverse(o => {if(o.name==='Open door leaf')leaves.push(o);});
  for(const leaf of leaves) {
    const hinge=leaf.parent,angle=hinge.rotation.y;
    try {
      for(let step=0;step<=48;step++) {
        hinge.rotation.y=angle*step/48;
        home.root.updateMatrixWorld(true);
        const sweep=new T.Box3().setFromObject(leaf,true);
        for(const item of boxes)assert.ok(!sweep.intersectsBox(item.box), `${item.name} blocks a door at step ${step}`);
      }
    } finally {hinge.rotation.y=angle;home.root.updateMatrixWorld(true);}
  }
  // Use full mesh bounds as solid objects. The viewer's wall-furniture exception cannot hide a blocked route.
  const solid = [...home.obstacles.filter(o=>!o.furniture), ...boxes.map(({name,box})=>({
    name,x:(box.min.x+box.max.x)/2,z:(box.min.z+box.max.z)/2,w:box.max.x-box.min.x,d:box.max.z-box.min.z,
  })), ...leaves.map(leaf=>{
    const box=new T.Box3().setFromObject(leaf,true);
    return {name:'Open door',x:(box.min.x+box.max.x)/2,z:(box.min.z+box.max.z)/2,w:box.max.x-box.min.x,d:box.max.z-box.min.z};
  })];
  const clear=(x,z)=>canOccupy(x,z,solid,home.polygons),step=.04,nx=226,nz=146;
  const cell=(x,z)=>z*nx+x, point=(x,z)=>[x*step-.8,z*step-.8];
  const visited=new Uint8Array(nx*nz),start=[Math.round((4.45+.8)/step),Math.round((3.85+.8)/step)],queue=[start];
  visited[cell(...start)]=1;
  for(let q=0;q<queue.length;q++){
    const [x,z]=queue[q];
    for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){
      const xx=x+dx,zz=z+dz;
      if(xx<0||zz<0||xx>=nx||zz>=nz||visited[cell(xx,zz)]||!clear(...point(xx,zz)))continue;
      visited[cell(xx,zz)]=1;queue.push([xx,zz]);
    }
  }
  const officeRoutes=revised?[['desk access',5.4,1.10],['sofa access',5.4,1.45],['south sofa route',5.7,2.77],['office visit',5.55,2.75],['storage table access',4.93,1.94]]:[['desk access',5.7,2.35],['sofa access',5.8,1.12]];
  const routes=[['north balcony',.90,.80],['north route',.80,1.30],['reading seat passage',.80,1.76],['west balcony route',.80,2.70],['play to bed aisle',2.39,2.20],['toy storage access',1.8,1.72],['bed foot',2.39,3.55],['hall door',3.9375,3.85],['west balcony',-.20,3.45],['gaming entry',5.15,2.80],...officeRoutes,['wardrobe north',7.03,.35],['wardrobe middle',7.03,1.5],['wardrobe south',7.03,2.55]];
  for(const [name,x,z]of routes){
    assert.ok(clear(x,z),`${name}: clear with all room furniture solid`);
    assert.ok(visited[cell(Math.round((x+.8)/step),Math.round((z+.8)/step))],`${name}: reachable with all room furniture solid`);
  }
  return {playToBed:bed.min.x-play.max.x,footAisle:wardrobe.min.z-bed.max.z,screenDiagonal:Math.hypot(screenBounds.x,screenBounds.y),routes:routes.length};
}
