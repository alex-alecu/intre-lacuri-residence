import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const directory=await mkdtemp(join(tmpdir(),'residence-navigation-'));
try{
 const outfile=join(directory,'navigation.mjs');
 await build({entryPoints:[process.env.NAVIGATION_SOURCE??'lib/navigation.ts'],outfile,bundle:true,platform:'node',format:'esm'});
 const {canOccupy}=await import(pathToFileURL(resolve(outfile)).href);
 const floor=[[[-5,-5],[15,-5],[15,15],[-5,15]]];
 const wall={x:0,z:0,w:.2,d:6,name:'Wall'};
 const cabinet={x:.7,z:0,w:1,d:1,name:'Cabinet',furniture:true};
 const table={x:3,z:0,w:1.5,d:1,name:'Dining table',furniture:true};
 const obstacles=[wall,cabinet,table];
 assert.equal(canOccupy(.7,0,obstacles,floor),true,'Furniture beside a wall does not block movement');
 assert.equal(canOccupy(.2,0,obstacles,floor),false,'The wall stays solid behind ignored furniture');
 assert.equal(canOccupy(3,0,obstacles,floor),false,'A free-standing table blocks movement');
 assert.equal(canOccupy(3,0,obstacles,floor,false),true,'Hidden free-standing furniture does not block movement');
 assert.equal(canOccupy(.2,0,obstacles,floor,false),false,'Hiding furniture keeps the wall solid');
 assert.equal(canOccupy(1.25,0,[wall,cabinet,{...table,x:1.75,w:1}],floor),false,'Furniture beside other furniture stays solid when it is away from the wall');
 assert.equal(canOccupy(.7,4.5,[wall,{...cabinet,z:4.5}],floor),false,'Furniture beyond the wall end is free-standing');
 assert.equal(canOccupy(.85,0,[wall,{...cabinet,x:.85}],floor),false,'A clear gap of 25 cm does not count as wall-adjacent');

 // The model supplies world bounds after rotation: a 2 x 0.5 m item rotated 90 degrees is 0.5 x 2 m.
 const rotated={x:.9,z:0,w:.5,d:2,name:'Rotated cabinet',furniture:true};
 assert.equal(canOccupy(.9,0,[wall,rotated],floor),false,'Rotation that leaves a clear gap keeps furniture solid');
 const northWall={x:0,z:0,w:6,d:.2,name:'Wall'};
 assert.equal(canOccupy(0,1.2,[northWall,{...rotated,x:0,z:1.2}],floor),true,'Rotated furniture beside a wall can be crossed');
 for(const name of ['Retained concrete column','Service shaft','Retained island wall']){
  const structure={x:4,z:4,w:.4,d:1,name};
  assert.equal(canOccupy(4,4,[structure],floor),false,`${name} blocks movement`);
  assert.equal(canOccupy(4,4,[structure],floor,false),false,`${name} remains solid with furniture hidden`);
 }
 const doorway=[{...wall,z:-1.5,d:2},{...wall,z:1.5,d:2}];
 assert.equal(canOccupy(0,0,doorway,floor),true,'A doorway remains open');
 assert.equal(canOccupy(15,0,[],floor),false,'The player cannot cross the floor boundary');
 console.log('Navigation checked: furniture near walls, free-standing furniture, rotated bounds, fixed structures, hidden furniture, and floor limits.');
}finally{
 await rm(directory,{recursive:true,force:true});
}
