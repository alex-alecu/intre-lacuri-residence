import * as T from 'three';
import assert from 'node:assert/strict';

// Measure the rendered meshes, including frames, backs, handles, and worktops.
// Collision boxes alone can hide geometry that extends past the stated size.
export function measureFurniture(home) {
  const result = [], failures = [];
  const openDoors = [];
  home.upper.traverse(o => {if (o.name === 'Open door leaf') openDoors.push(new T.Box3().setFromObject(o, true));});
  const round = n => Math.round(n * 10000) / 10000;
  for (const group of home.furniture.children.filter(o => o.isGroup)) {
    const obstacle = home.obstacles.find(o => o.furniture && Math.abs(o.x-group.position.x)<.0001 && Math.abs(o.z-group.position.z)<.0001);
    if (!obstacle) continue;
    const inverse = group.matrixWorld.clone().invert(), local = new T.Box3();
    group.traverse(o => {
      if (!o.isMesh) return;
      o.geometry.computeBoundingBox();
      local.union(o.geometry.boundingBox.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse, o.matrixWorld)));
    });
    const world = new T.Box3().setFromObject(group, true), size = local.getSize(new T.Vector3()).multiply(group.getWorldScale(new T.Vector3()));
    const row = {name:obstacle.name,x:group.position.x,z:group.position.z,width:round(size.x),depth:round(size.z),min:world.min.toArray().map(round),max:world.max.toArray().map(round)};
    result.push(row);
    // Foliage and lamp shades extend beyond their floor contact area.
    if (['Plant pot','Floor lamp','Balcony planter'].includes(obstacle.name)) continue;
    for (const door of openDoors) {
      if (world.intersectsBox(door)) failures.push(`${obstacle.name} intersects an open door at ${group.position.x}, ${group.position.z}`);
    }
    for (const wall of home.obstacles.filter(o => !o.furniture)) {
      const dx = Math.min(world.max.x,wall.x+wall.w/2)-Math.max(world.min.x,wall.x-wall.w/2);
      const dz = Math.min(world.max.z,wall.z+wall.d/2)-Math.max(world.min.z,wall.z-wall.d/2);
      if (dx>.01 && dz>.01) failures.push(`${obstacle.name} mesh intersects ${wall.name} at ${group.position.x}, ${group.position.z}: ${round(dx)} x ${round(dz)} m`);
    }
  }
  assert.deepEqual(failures, [], 'Furniture mesh clearances');
  return result;
}
