import {build} from 'esbuild';
import assert from 'node:assert/strict';
await build({entryPoints:['lib/walk-input.ts','lib/home-scene.ts'],outdir:'tmp/input-check',bundle:true,platform:'node',format:'esm',packages:'external',outExtension:{'.js':'.mjs'}});
const {WalkInput}=await import('../tmp/input-check/walk-input.mjs');
const {HomeScene}=await import('../tmp/input-check/home-scene.mjs');
const T=await import('three');

const input=new WalkInput();
input.press(1,'ArrowUp');
assert.equal(input.startLook(2,100,100),true);
assert.deepEqual(input.moveLook(2,140,85),{x:40,y:-15});
assert.deepEqual(input.axes(),{forward:1,side:0},'Looking does not stop movement');
assert.equal(input.startLook(3,500,500),false,'A second look finger cannot take control');
assert.equal(input.moveLook(3,550,520),null);
input.release(3);
assert.deepEqual(input.moveLook(2,145,90),{x:5,y:5},'An unrelated release does not stop looking');
input.release(2);
assert.equal(input.moveLook(2,150,90),null,'A released finger cannot move the camera');
assert.deepEqual(input.axes(),{forward:1,side:0});

input.press(4,'ArrowUp');input.release(1);
assert.equal(input.axes().forward,1,'A second finger on the same arrow keeps moving');
input.setKey('KeyW',true);input.release(4);
assert.equal(input.axes().forward,1,'Touch release preserves keyboard input');
input.press(5,'ArrowRight');
assert.ok(Math.abs(Math.hypot(...Object.values(input.axes()))-1)<1e-10,'Diagonal movement has the same speed');
input.press(6,'ArrowLeft');
assert.deepEqual(input.axes(),{forward:1,side:0},'Opposite directions cancel');
input.startLook(7,0,0);input.clear();
assert.deepEqual(input.axes(),{forward:0,side:0},'Blur and cancellation clear all movement');
assert.equal(input.look,null);
assert.equal(input.pointers.size,0);

// Check the actual scene methods without creating a graphics context.
const locks=[];
globalThis.document={pointerLockElement:null};
const scene=Object.assign(Object.create(HomeScene.prototype),{
  mode:'walk',immersive:true,disposed:false,touch:true,input:new WalkInput(),
  camera:new T.PerspectiveCamera(40,.75,.035,180),player:new T.Vector3(5.72,1.62,9.12),
  scene:{fog:new T.Fog('#ffffff',48,120)},
  controls:{target:new T.Vector3(),touches:{},update(){}},
  home:{upper:{},ceiling:{},furniture:{},obstacles:[],polygons:[]},
  ground:{position:new T.Vector3()},renderer:{shadowMap:{},domElement:{focus(){}}},
  callbacks:{onLock:value=>locks.push(value),onPosition(){}},
  clearKeys(){this.input.clear();},ensurePlayer(){},yaw:0,pitch:0,
});
scene.setTouchKey(20,'ArrowUp');
scene.unlock();
assert.deepEqual(scene.input.axes(),{forward:0,side:0},'Pause stops movement');
scene.setTouchKey(21,'ArrowUp');
assert.equal(scene.input.pointers.size,0,'Paused controls cannot start movement');
assert.equal(locks.at(-1),false);
scene.lock();
assert.equal(scene.immersive,true,'Touch mode starts without pointer lock');
scene.setTouchKey(22,'ArrowUp');
scene.setMode('plan');
assert.equal(scene.controls.touches.ONE,T.TOUCH.PAN,'One finger pans the plan');
assert.equal(scene.input.pointers.size,0,'Changing mode stops held movement');
assert.equal(scene.renderer.shadowMap.needsUpdate,true,'Wall visibility refreshes shadows');
assert.ok(scene.camera.position.y>31,'Portrait mode expands the view to fit the plan');
scene.camera.aspect=341/960;
scene.setMode('overview');
assert.equal(scene.controls.touches.ONE,T.TOUCH.ROTATE,'One finger rotates the overview');
assert.ok(scene.scene.fog.near>scene.camera.position.distanceTo(scene.controls.target),'A narrow Split View does not hide the model in fog');
scene.setMode('walk');
assert.equal(scene.scene.fog.near,48,'Walking restores the normal view range');
console.log('Touch input checked: simultaneous movement and look, capture loss, pause, keyboard input, view modes, and portrait framing.');
