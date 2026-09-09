import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {buildHome} from './build-home';
import {canOccupy} from './navigation';
import {type LayoutVersion} from './layouts';
import {disposeModel} from './dispose-model';
import {WalkInput} from './walk-input';
import {sitePath} from './site-path';

export class HomeScene{
 renderer:T.WebGLRenderer;scene=new T.Scene();camera=new T.PerspectiveCamera(40,1,.035,180);controls:OrbitControls;home:ReturnType<typeof buildHome>;
 frame=0;observer:ResizeObserver;mode='overview';furnished=true;night=false;artwork:T.Texture;input=new WalkInput();player=new T.Vector3(5.72,1.62,9.12);yaw=0;pitch=0;last=0;lastReport=0;immersive=false;disposed=false;touch=navigator.maxTouchPoints>0;contextUnavailable=false;
 sun=new T.DirectionalLight('#fff0d3',3.2);ambient=new T.HemisphereLight('#f9f2df','#999b80',1.3);ground:T.Mesh;environment:T.WebGLRenderTarget;transition:{position:T.Vector3;target:T.Vector3}|null=null;abort=new AbortController();
 constructor(public host:HTMLElement,public callbacks:{onLock:(v:boolean)=>void;onPosition:(p:{x:number;z:number;yaw:number})=>void;onContextChange?:(lost:boolean)=>void},layout:LayoutVersion='original'){
  this.renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.touch?1.25:1.75));this.renderer.setSize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.needsUpdate=true;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.04;this.renderer.outputColorSpace=T.SRGBColorSpace;host.appendChild(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','Locuință mobilată în 3D. Folosește comenzile de vizualizare și lista încăperilor.');
  this.scene.background=new T.Color('#e9e9e1');this.scene.fog=new T.Fog('#e9e9e1',48,120);
  const pmrem=new T.PMREMGenerator(this.renderer),environmentScene=new RoomEnvironment();this.environment=pmrem.fromScene(environmentScene,.04);this.scene.environment=this.environment.texture;this.scene.environmentIntensity=.32;environmentScene.dispose();pmrem.dispose();
  this.scene.add(this.ambient,this.sun);this.sun.position.set(-9,15,1);this.sun.target.position.set(6,0,5);this.scene.add(this.sun.target);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:.5,far:55});this.sun.shadow.bias=-.0003;this.sun.shadow.normalBias=.028;this.sun.shadow.radius=3;
  this.artwork=new T.TextureLoader().load(sitePath('/artwork/botanical-pair.jpg'));this.artwork.colorSpace=T.SRGBColorSpace;
  this.home=buildHome(this.artwork,layout);this.scene.add(this.home.root);this.home.lights.forEach(l=>l.intensity=1.2);
  this.ground=new T.Mesh(new T.PlaneGeometry(300,300),new T.MeshStandardMaterial({color:'#e0e1d7',roughness:1}));this.ground.rotation.x=-Math.PI/2;this.ground.position.set(7,-.24,5);this.ground.receiveShadow=true;this.scene.add(this.ground);
  this.camera.position.set(23,23,27);this.camera.aspect=Math.max(1,host.clientWidth)/Math.max(1,host.clientHeight);this.camera.updateProjectionMatrix();this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(7.1,0,4.7);this.controls.enableDamping=true;this.controls.dampingFactor=.075;this.controls.minDistance=7;this.controls.maxDistance=55;this.controls.maxPolarAngle=Math.PI*.47;this.controls.minPolarAngle=.06;this.controls.screenSpacePanning=true;this.controls.update();
  this.controls.maxDistance=140;this.controls.touches.TWO=T.TOUCH.DOLLY_PAN;this.setMode('overview');
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);const o={signal:this.abort.signal};window.addEventListener('keydown',this.keyDown,o);window.addEventListener('keyup',this.keyUp,o);window.addEventListener('blur',this.clearKeys,o);window.addEventListener('pagehide',this.clearKeys,o);document.addEventListener('visibilitychange',this.clearKeys,o);document.addEventListener('pointerlockchange',this.lockChange,o);document.addEventListener('mousemove',this.mouseMove,o);this.renderer.domElement.addEventListener('pointerdown',this.pointerDown,o);this.renderer.domElement.addEventListener('pointerup',this.pointerUp,o);this.renderer.domElement.addEventListener('pointercancel',this.pointerUp,o);this.renderer.domElement.addEventListener('lostpointercapture',this.pointerUp,o);this.renderer.domElement.addEventListener('pointermove',this.pointerMove,o);this.renderer.domElement.addEventListener('webglcontextlost',this.contextLost,o);this.renderer.domElement.addEventListener('webglcontextrestored',this.contextRestored,o);this.animate(0);
 }
 viewScale(){return Math.max(1,1/this.camera.aspect)}
 updateViewRange(){const scale=this.mode==='walk'?1:this.viewScale();this.camera.far=180*scale;if(this.scene.fog instanceof T.Fog){this.scene.fog.near=48*scale;this.scene.fog.far=120*scale}}
 resize=()=>{const w=Math.max(1,this.host.clientWidth),h=Math.max(1,this.host.clientHeight),previousScale=this.viewScale();this.camera.aspect=w/h;if(this.mode!=='walk'){const scale=this.viewScale()/previousScale;this.camera.position.sub(this.controls.target).multiplyScalar(scale).add(this.controls.target);this.transition=null}this.updateViewRange();this.camera.updateProjectionMatrix();this.renderer.setSize(w,h)};
 keyDown=(e:KeyboardEvent)=>{if(this.mode!=='walk'||(e.target instanceof HTMLElement&&['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName)))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();this.input.setKey(e.code,true)}if(e.code==='Escape')this.unlock()};
 keyUp=(e:KeyboardEvent)=>{this.input.setKey(e.code,false)};
 clearKeys=()=>{this.input.clear()};
 lockChange=()=>{this.immersive=document.pointerLockElement===this.renderer.domElement;this.callbacks.onLock(this.immersive);if(!this.immersive)this.clearKeys()};
 mouseMove=(e:MouseEvent)=>{if(this.mode==='walk'&&document.pointerLockElement===this.renderer.domElement){this.yaw-=e.movementX*.002;this.pitch=T.MathUtils.clamp(this.pitch-e.movementY*.002,-1.25,1.25)}};
 pointerDown=(e:PointerEvent)=>{if(this.mode==='walk'&&this.immersive&&document.pointerLockElement!==this.renderer.domElement&&this.input.startLook(e.pointerId,e.clientX,e.clientY)){e.preventDefault();this.renderer.domElement.setPointerCapture(e.pointerId)}};
 pointerUp=(e:PointerEvent)=>{this.input.release(e.pointerId)};
 pointerMove=(e:PointerEvent)=>{if(this.mode==='walk'&&this.immersive&&document.pointerLockElement!==this.renderer.domElement){const delta=this.input.moveLook(e.pointerId,e.clientX,e.clientY);if(delta){this.yaw-=delta.x*.004;this.pitch=T.MathUtils.clamp(this.pitch-delta.y*.004,-1.25,1.25)}}};
 contextLost=(e:Event)=>{e.preventDefault();this.contextUnavailable=true;cancelAnimationFrame(this.frame);this.unlock();this.callbacks.onContextChange?.(true)};
 contextRestored=()=>{if(this.disposed)return;const pmrem=new T.PMREMGenerator(this.renderer),environmentScene=new RoomEnvironment();this.environment.dispose();this.environment=pmrem.fromScene(environmentScene,.04);this.scene.environment=this.environment.texture;environmentScene.dispose();pmrem.dispose();this.contextUnavailable=false;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.needsUpdate=true;this.callbacks.onContextChange?.(false);this.last=performance.now();this.animate(this.last)};
 setKey(key:string,value:boolean){this.input.setKey(key,value)}
 setTouchKey(id:number,key:string|null){if(key&&this.immersive)this.input.press(id,key);else this.input.release(id)}
 unlock(){if(document.pointerLockElement===this.renderer.domElement)document.exitPointerLock();this.immersive=false;this.clearKeys();this.callbacks.onLock(false)}
 lock(){if(this.contextUnavailable)return;if(this.mode!=='walk')this.setMode('walk');const canvas=this.renderer.domElement;canvas.tabIndex=0;canvas.focus({preventScroll:true});const fallback=()=>{if(this.mode!=='walk'||this.disposed)return;this.immersive=true;this.callbacks.onLock(true)};if(!canvas.requestPointerLock||this.touch){fallback();return}try{const result=canvas.requestPointerLock();if(result&&typeof result.catch==='function')result.catch(fallback)}catch{fallback()}}
 setMode(value:string){
  if(!['overview','plan','walk'].includes(value))return;
  this.mode=value;this.clearKeys();this.transition=null;this.controls.enabled=value!=='walk';this.controls.touches.ONE=value==='plan'?T.TOUCH.PAN:T.TOUCH.ROTATE;this.home.upper.visible=value==='walk';this.home.ceiling.visible=value==='walk';this.ground.position.y=value==='walk'?-6.4:-.24;this.renderer.shadowMap.needsUpdate=true;
  if(value==='walk'){this.ensurePlayer();this.camera.fov=68;this.camera.near=.035;this.camera.position.copy(this.player);this.camera.rotation.order='YXZ';this.camera.rotation.set(this.pitch,this.yaw,0);this.callbacks.onPosition({x:this.player.x,z:this.player.z,yaw:this.yaw})}
  else{this.unlock();this.camera.fov=40;this.camera.near=.05;this.controls.enableRotate=value==='overview';this.controls.minPolarAngle=value==='plan'?0:.06;this.controls.maxPolarAngle=value==='plan'?.001:Math.PI*.47;this.controls.target.set(7.1,0,4.7);const offset=value==='plan'?new T.Vector3(0,31,.001):new T.Vector3(15.9,23,22.3);this.camera.position.copy(this.controls.target).add(offset.multiplyScalar(this.viewScale()));this.camera.up.set(0,1,0);this.camera.lookAt(this.controls.target);this.controls.update()}
  this.updateViewRange();this.camera.updateProjectionMatrix();
 }
 ensurePlayer(){if(canOccupy(this.player.x,this.player.z,this.home.obstacles,this.home.polygons,this.furnished))return;this.placeAt(this.player.x,this.player.z)}
 placeAt(x:number,z:number){if(canOccupy(x,z,this.home.obstacles,this.home.polygons,this.furnished)){this.player.set(x,1.62,z);return}for(let r=.1;r<3;r+=.1)for(let a=0;a<Math.PI*2;a+=Math.PI/12){const xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;if(canOccupy(xx,zz,this.home.obstacles,this.home.polygons,this.furnished)){this.player.set(xx,1.62,zz);return}}this.player.set(5.72,1.62,9.12)}
 goToRoom(id:string){const r=this.home.rooms.find(r=>r.id===id);if(!r)return;this.clearKeys();if(this.mode==='walk'){this.placeAt(r.visit[0],r.visit[1]);this.yaw=id==='connection'?-Math.PI/2:id==='dressing'?Math.PI:id==='living'&&this.home.layout==='suite'?1.35:0;this.pitch=0;this.callbacks.onPosition({x:this.player.x,z:this.player.z,yaw:this.yaw})}else{const target=new T.Vector3(r.x+r.w/2,0,r.z+r.d/2),offset=this.mode==='plan'?new T.Vector3(0,18,.001):new T.Vector3(6.2,10.5,9);this.transition={position:target.clone().add(offset.multiplyScalar(this.viewScale())),target}}}
 setLayout(layout:LayoutVersion){
  if(this.home.layout===layout)return;
  const next=buildHome(this.artwork,layout),previous=this.home;
  this.unlock();this.transition=null;
  this.scene.remove(previous.root);this.home=next;this.scene.add(next.root);
  next.furniture.visible=this.furnished;next.upper.visible=this.mode==='walk';next.ceiling.visible=this.mode==='walk';
  next.lights.forEach(light=>light.intensity=this.night?10:1.2);
  disposeModel(previous.root,previous.textures,[this.artwork]);
  this.ensurePlayer();
  if(this.mode==='walk')this.camera.position.copy(this.player);
  this.callbacks.onPosition({x:this.player.x,z:this.player.z,yaw:this.yaw});this.renderer.shadowMap.needsUpdate=true;
 }
 setFurniture(v:boolean){this.furnished=v;this.home.furniture.visible=v;this.renderer.shadowMap.needsUpdate=true;this.ensurePlayer()}
 setNight(v:boolean){this.night=v;this.sun.intensity=v?.12:3.2;this.sun.color.set(v?'#aac3e2':'#fff0d3');this.ambient.intensity=v?.42:1.3;this.home.lights.forEach(l=>l.intensity=v?10:1.2);this.scene.environmentIntensity=v?.16:.32;this.renderer.toneMappingExposure=v?1.15:1.04;this.scene.background=new T.Color(v?'#515b5d':'#e9e9e1');if(this.scene.fog instanceof T.Fog)this.scene.fog.color.set(v?'#515b5d':'#e9e9e1')}
 reset(){if(this.mode==='walk'){this.player.set(5.72,1.62,9.12);this.yaw=this.pitch=0;this.ensurePlayer()}else this.setMode(this.mode)}
 animate=(now:number)=>{if(this.disposed||this.contextUnavailable)return;this.frame=requestAnimationFrame(this.animate);const dt=Math.min((now-this.last)/1000,.04);this.last=now;
  if(this.mode==='walk'){
   const {forward,side}=this.immersive?this.input.axes():{forward:0,side:0};if(forward||side){const speed=(this.input.has('ShiftLeft')||this.input.has('ShiftRight')?2.7:1.65)*dt;const dx=(-Math.sin(this.yaw)*forward+Math.cos(this.yaw)*side)*speed,dz=(-Math.cos(this.yaw)*forward-Math.sin(this.yaw)*side)*speed;const steps=Math.max(1,Math.ceil(speed/.04));for(let i=0;i<steps;i++){if(canOccupy(this.player.x+dx/steps,this.player.z,this.home.obstacles,this.home.polygons,this.furnished))this.player.x+=dx/steps;if(canOccupy(this.player.x,this.player.z+dz/steps,this.home.obstacles,this.home.polygons,this.furnished))this.player.z+=dz/steps}}
   this.camera.position.copy(this.player);this.camera.rotation.set(this.pitch,this.yaw,0,'YXZ');if(now-this.lastReport>180){this.lastReport=now;this.callbacks.onPosition({x:this.player.x,z:this.player.z,yaw:this.yaw})}
  }else{if(this.transition){const alpha=1-Math.exp(-dt*6);this.camera.position.lerp(this.transition.position,alpha);this.controls.target.lerp(this.transition.target,alpha);if(this.camera.position.distanceTo(this.transition.position)<.025)this.transition=null}this.controls.update()}
  this.renderer.render(this.scene,this.camera)
 };
 dispose(){this.disposed=true;cancelAnimationFrame(this.frame);if(document.pointerLockElement===this.renderer.domElement)document.exitPointerLock();this.abort.abort();this.observer.disconnect();this.controls.dispose();disposeModel(this.scene,this.home.textures);this.environment.dispose();this.sun.shadow.dispose();this.renderer.dispose();this.host.replaceChildren()}
}
