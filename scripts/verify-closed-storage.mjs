import assert from 'node:assert/strict';
import * as T from 'three';

// The replacement fronts must hide the complete storage opening, including its upper shelves.
export function verifyClosedStorage(home){
  const names=home.layout==='original'?['Child closed storage']:
    ['Children sliding wardrobe','Dressing wardrobe south','Dressing wardrobe east','Office storage wall','Office wall cabinets','Gaming media cabinet','Office storage table'];
  for(const name of names){
    const group=home.furniture.getObjectByName(name);
    assert.ok(group,`${home.layout}: ${name} is present`);
    const fronts=group.children.filter(o=>o.name==='Closed storage front');
    assert.ok(fronts.length>0,`${name}: storage has closed fronts`);
    const ray=new T.Raycaster();
    const inverse=group.matrixWorld.clone().invert(),local=new T.Box3();
    for(const front of fronts){
      assert.ok(!front.material.transparent,`${name}: the fronts are opaque`);
      front.geometry.computeBoundingBox();
      local.union(front.geometry.boundingBox.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,front.matrixWorld)));
    }
    if(group.userData.sliding){
      const outer=fronts[0],inner=fronts[1];
      const depth=outer.geometry.boundingBox.getSize(new T.Vector3()).z;
      assert.ok(Math.abs(outer.position.z-inner.position.z)>depth+.01,`${name}: sliding tracks clear the adjacent panel and handle`);
    }
    // Sample off the panel joints. Rays start in front of the cabinet and point into it.
    for(const fy of [.07,.31,.67,.93])for(const fx of [.09,.27,.61,.89]){
      const origin=new T.Vector3(T.MathUtils.lerp(local.min.x,local.max.x,fx),T.MathUtils.lerp(local.min.y,local.max.y,fy),local.max.z+.20).applyMatrix4(group.matrixWorld);
      const direction=new T.Vector3(0,0,-1).transformDirection(group.matrixWorld);
      ray.set(origin,direction);
      assert.ok(ray.intersectObjects(fronts,false).length>0,`${name}: no open shelf at ${fx}, ${fy}`);
    }
  }
}
