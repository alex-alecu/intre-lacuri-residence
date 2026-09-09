import assert from 'node:assert/strict';

// Independent reference: A07 vector wall faces, calibrated at 28.3465 pt/m.
// The printed 13 cm partitions measure 12.5 cm in the vector drawing.
export function verifyDimensions(home, canOccupy) {
  const failures = [];
  const close = (actual, expected, label) => {
    if (!Number.isFinite(actual) || Math.abs(actual - expected) > .0001) failures.push(`${label}: ${actual.toFixed(4)} m; expected ${expected} m`);
  };
  const walls = home.obstacles.filter(o => !o.furniture);
  function clearSpan(x, z, axis) {
    const at = axis === 'x' ? x : z, cross = axis === 'x' ? z : x;
    let lo = -Infinity, hi = Infinity;
    for (const wall of walls) {
      const c = axis === 'x' ? wall.z : wall.x, d = axis === 'x' ? wall.d : wall.w;
      if (cross <= c - d / 2 || cross >= c + d / 2) continue;
      const mid = axis === 'x' ? wall.x : wall.z, size = axis === 'x' ? wall.w : wall.d;
      if (mid + size / 2 <= at) lo = Math.max(lo, mid + size / 2);
      if (mid - size / 2 >= at) hi = Math.min(hi, mid - size / 2);
    }
    return hi - lo;
  }
  const measurements = [
    ['Guest width', 2, 2, 'x', 3.875], ['Guest depth', 2, 2, 'z', 3.575],
    ['Child width', 5, 1.5, 'x', 4], ['Child depth', 6.7, 1.5, 'z', 3],
    ['Master width', 12, 1.5, 'x', 3.875], ['Master depth', 13.7, 1.5, 'z', 3.6],
    ['West bath width', 7, 4.4, 'x', 1.8], ['West bath depth', 7, 4.4, 'z', 2.45],
    ['East bath width', 9, .9, 'x', 1.95], ['East bath depth', 8.65, 1.2, 'z', 2.375],
    ['Utility width', 3.4, 9.3, 'x', 2.2], ['Utility depth', 3.4, 9.3, 'z', 1.65],
    ['West living width', 3, 7.3, 'x', 6.45], ['West living depth', 1, 6.3, 'z', 5.2],
    ['East kitchen width', 11, 4.8, 'x', 5.95], ['East kitchen depth', 12, 6, 'z', 4.275],
    ['West entry width', 5.7, 9.7, 'x', 1.45], ['East entry width', 7.3, 9.7, 'x', 1.3],
  ].map(([label, x, z, axis, expected]) => {
    const actual = clearSpan(x, z, axis); close(actual, expected, label);
    return {label, actual, expected};
  });
  // A too-large column can pass every room-centre navigation test.
  for (const [x,z,w,d] of [[0,1.1,.5,.7],[0,7.75,.5,.5],[8.125,.5,.25,1.5],[14.325,.5,.25,1.5],[14.2,8.125,.5,.7],[8.125,8.95,.25,2.4]]) {
    if (!walls.some(o => o.name === 'Retained concrete column' && Math.abs(o.x-x)<.0001 && Math.abs(o.z-z)<.0001 && Math.abs(o.w-w)<.0001 && Math.abs(o.d-d)<.0001)) failures.push(`Column at ${x}, ${z} does not match A07`);
  }
  if (!canOccupy(14.4, 3.05, home.obstacles, home.polygons)) failures.push('Master east balcony door is blocked');
  if (!canOccupy(-.2, 3.45, home.obstacles, home.polygons)) failures.push('Guest west balcony door is blocked');
  if (canOccupy(8.5, 3.6625, home.obstacles, home.polygons, false)) failures.push('Missing short east hall partition');
  for (const [x,z] of [[7.9,3.4],[8.4,.4],[10.5,3.85],[2.4,9.75],[4.6,9.75]]) {
    if (!walls.some(o => o.name === 'Service shaft' && Math.abs(o.x-x)<o.w/2 && Math.abs(o.z-z)<o.d/2)) failures.push(`Missing service shaft at ${x}, ${z}`);
  }
  const southChairs = home.obstacles.filter(o => o.name === 'Dining chair' && o.z>6.5);
  const southAisle = 8 - Math.max(...southChairs.map(o => o.z+o.d/2));
  if (southChairs.length !== 2 || southAisle < .75) failures.push(`Dining south aisle: ${southAisle.toFixed(2)} m; needs at least 0.75 m in this layout`);
  const northChairs = home.obstacles.filter(o => o.name === 'Dining chair' && o.z<6);
  const counter = home.obstacles.find(o => o.name === 'Kitchen counter');
  const kitchenWorkAisle = Math.min(...northChairs.map(o=>o.z-o.d/2))-(counter.z+counter.d/2);
  if (northChairs.length!==2 || kitchenWorkAisle<.90) failures.push('The kitchen work aisle needs at least 0.90 m');
  const cornerSofa=home.obstacles.find(o=>o.name==='Sofa'&&o.x>8.25);
  const endChair=home.obstacles.find(o=>o.name==='Dining chair'&&o.x>11.5);
  const diningSofaGap=cornerSofa ? cornerSofa.z-cornerSofa.d/2-(endChair.z+endChair.d/2) : 0;
  if (diningSofaGap<.50) failures.push('The dining end chair needs at least 0.50 m to the sofa');
  for (const pot of home.obstacles.filter(o=>o.name==='Plant pot')) for (const sofa of home.obstacles.filter(o=>o.name==='Sofa')) {
    if (Math.abs(pot.x-sofa.x)<(pot.w+sofa.w)/2 && Math.abs(pot.z-sofa.z)<(pot.d+sofa.d)/2) failures.push('A plant pot intersects a sofa');
  }
  for (const f of home.obstacles.filter(o => o.furniture)) for (const wall of walls) {
    const overlapX = Math.min(f.x+f.w/2,wall.x+wall.w/2)-Math.max(f.x-f.w/2,wall.x-wall.w/2);
    const overlapZ = Math.min(f.z+f.d/2,wall.z+wall.d/2)-Math.max(f.z-f.d/2,wall.z-wall.d/2);
    if (overlapX>.01 && overlapZ>.01) failures.push(`${f.name} intersects ${wall.name} at ${f.x}, ${f.z}`);
  }
  assert.deepEqual(failures, [], 'Plan dimensions and furniture clearances');
  return {measurements, diningSouthAisle:southAisle, kitchenWorkAisle, diningSofaGap};
}
