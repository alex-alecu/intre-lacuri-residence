import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {rooms,shell,balconies} from './plan';
import type {Obstacle} from './navigation';
import {getLayout,type LayoutVersion} from './layouts';
export function buildHome(artwork?:T.Texture,layout:LayoutVersion='original'){
 const root=new T.Group(),furniture=new T.Group(),upper=new T.Group(),ceiling=new T.Group();
 root.add(furniture,upper,ceiling);upper.visible=false;ceiling.visible=false;
 const fixtures:{name:string;x:number;z:number;w:number;d:number;rotation:number}[]=[];
 const obstacles:Obstacle[]=[],lights:T.PointLight[]=[],textures:T.Texture[]=[];
 const mat=(color:string,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 function texture(kind:'oak'|'linen'|'stone'|'rug'){
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d')!;
  let seed=29;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  if(kind==='oak'){
   ctx.fillStyle='#bd976c';ctx.fillRect(0,0,512,512);
   for(let row=0;row<8;row++){const y=row*64;ctx.fillStyle=`hsl(33 35% ${58+rnd()*9}%)`;ctx.fillRect(0,y,512,63);for(let i=0;i<180;i++){ctx.strokeStyle=`rgba(${rnd()>.5?'77,45,18':'242,215,167'},${.03+rnd()*.12})`;const yy=y+rnd()*63;ctx.beginPath();ctx.moveTo(0,yy);ctx.bezierCurveTo(140,yy+rnd()*4,300,yy-rnd()*6,512,yy+1);ctx.stroke()}ctx.strokeStyle='#82644577';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);const joint=Math.floor(rnd()*450);ctx.moveTo(joint,y);ctx.lineTo(joint,y+64);ctx.stroke()}
  }else{const base=kind==='linen'?[224,215,197]:kind==='stone'?[191,186,171]:[206,196,174];ctx.fillStyle=`rgb(${base.join(',')})`;ctx.fillRect(0,0,512,512);const data=ctx.getImageData(0,0,512,512);for(let i=0;i<data.data.length;i+=4){const n=(rnd()-.5)*(kind==='linen'?24:18);data.data[i]=base[0]+n;data.data[i+1]=base[1]+n;data.data[i+2]=base[2]+n}ctx.putImageData(data,0,0);if(kind!=='stone'){ctx.strokeStyle='#ffffff15';for(let i=0;i<512;i+=3){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,512);ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke()}}else{ctx.strokeStyle='#666b571c';for(let i=0;i<25;i++){ctx.beginPath();ctx.moveTo(rnd()*512,0);ctx.bezierCurveTo(rnd()*512,180,rnd()*512,300,rnd()*512,512);ctx.stroke()}}}
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;textures.push(t);return t;
 }
 const oakMap=texture('oak');oakMap.repeat.set(.24,.70);const oak=mat('#ffffff',.66);oak.map=oakMap;
 const wood=mat('#b98f61',.52),plaster=mat('#eee9da',.9),trim=mat('#f5f0e6',.55),sage=mat('#85876a',.86),clay=mat('#b2785e',.9),black=mat('#343a35',.38,.3),brass=mat('#a68a55',.32,.72),white=mat('#f0efdf',.25),stone=mat('#ece4d2',.62),glass=new T.MeshPhysicalMaterial({color:'#d1e3db',transparent:true,opacity:.18,roughness:.12,metalness:.05,side:T.DoubleSide,depthWrite:false});
 const linen=mat('#f0e7d3',.97);linen.map=texture('linen');const tile=mat('#f0eddf',.75);tile.map=texture('stone');tile.map.repeat.set(2,2);
 const rugmat=mat('#efe7d6',1);rugmat.map=texture('rug');rugmat.map.repeat.set(3,3);
 const walnut=mat('#886345',.45),ivory=mat('#e5dcc8',.7),bronze=mat('#92764e',.29,.72);
 const travertine=mat('#efe2c9',.39);travertine.map=texture('stone');travertine.bumpMap=travertine.map;travertine.bumpScale=.018;
 const teak=mat('#b99568',.62);teak.map=oakMap.clone();teak.map.repeat.set(.35,.60);textures.push(teak.map);
 linen.bumpMap=linen.map;linen.bumpScale=.008;
 const olive=mat('#798065',.95),blush=mat('#d5b8a8',.97),cream=mat('#eee5d6',.98);
 olive.map=linen.map;cream.map=linen.map;blush.map=linen.map;
 const glow=new T.MeshStandardMaterial({color:'#fff1ca',emissive:'#ffd99a',emissiveIntensity:1.2});
 if(artwork)textures.push(artwork);
 function mesh(geo:T.BufferGeometry,material:T.Material,parent:T.Object3D=root){const m=new T.Mesh(geo,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function box(x:number,y:number,z:number,w:number,h:number,d:number,m:T.Material=plaster,parent:T.Object3D=root,round=0){const o=mesh(round?new RoundedBoxGeometry(w,h,d,2,Math.min(round,w/3,h/3,d/3)):new T.BoxGeometry(w,h,d),m,parent);o.position.set(x,y,z);return o}
 function cylinder(x:number,y:number,z:number,r:number,h:number,m:T.Material,parent:T.Object3D=furniture,rTop=r){const o=mesh(new T.CylinderGeometry(rTop,r,h,32),m,parent);o.position.set(x,y,z);return o}
 function sphere(x:number,y:number,z:number,r:number,m:T.Material,parent:T.Object3D=furniture,sx=1,sy=1,sz=1){const o=mesh(new T.SphereGeometry(r,18,12),m,parent);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o}
 function obstacle(x:number,z:number,w:number,d:number,name:string,isFurniture=false){obstacles.push({x,z,w,d,name,furniture:isFurniture})}
 function footprint(points:number[][],material:T.Material,y=0,depth=.18,parent:T.Object3D=root){const shape=new T.Shape(points.map(([x,z])=>new T.Vector2(x,-z)));const o=mesh(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),material,parent);o.rotation.x=-Math.PI/2;o.position.y=y-depth;return o}
 footprint(shell,oak);
 for(const b of balconies)footprint(b.points,teak,-.025,.16);
 for(const r of rooms.filter(r=>['bath','bath-right','utility'].includes(r.id)))box(r.x+r.w/2,.014,r.z+r.d/2,r.w,.027,r.d,tile);
 // Floor joints in the wet rooms.
 for(const r of rooms.filter(r=>['bath','bath-right','utility'].includes(r.id))){for(let x=r.x+.6;x<r.x+r.w;x+=.6)box(x,.03,r.z+r.d/2,.009,.005,r.d,mat('#a8a699'));for(let z=r.z+.6;z<r.z+r.d;z+=.6)box(r.x+r.w/2,.03,z,r.w,.005,.009,mat('#a8a699'))}
 function wallPart(x:number,z:number,w:number,d:number,bottom=0,top=2.7,name='Wall'){
  if(bottom<.95)box(x,(bottom+Math.min(top,.95))/2,z,w,Math.min(top,.95)-bottom,d,plaster);
  if(top>.95)box(x,(Math.max(bottom,.95)+top)/2,z,w,top-Math.max(bottom,.95),d,plaster,upper);
  if(bottom<1.65&&top>1.2)obstacle(x,z,w,d,name);
  if(bottom===0){const base=box(x,.055,z,w+.018,.11,d+.018,trim);base.castShadow=false}
 }
 type Opening={a:number;b:number;kind:'door'|'window';sill?:number;h?:number;balcony?:boolean;hinge?:'start'|'end';swing?:'reverse'};
 function wall(axis:'x'|'z',fixed:number,start:number,end:number,t:number,openings:Opening[]=[],name='Wall'){
  let cursor=start;const part=(a:number,b:number,lo=0,hi=2.7)=>{if(b-a<.001)return;wallPart(axis==='x'?(a+b)/2:fixed,axis==='x'?fixed:(a+b)/2,axis==='x'?b-a:t,axis==='x'?t:b-a,lo,hi,name)};
  for(const o of [...openings].sort((a,b)=>a.a-b.a)){
   part(cursor,o.a);const sill=o.kind==='door'?0:o.sill??0,h=o.h??2.2;
   if(sill>0)part(o.a,o.b,0,sill);part(o.a,o.b,sill+h,2.7);
   const c=(o.a+o.b)/2,w=o.b-o.a;
   const g=new T.Group();g.position.set(axis==='x'?c:fixed,0,axis==='x'?fixed:c);g.rotation.y=axis==='x'?0:Math.PI/2;upper.add(g);
   if(o.kind==='window'){
    box(-w/2+.022,sill+h/2,0,.044,h,.085,black,g);box(w/2-.022,sill+h/2,0,.044,h,.085,black,g);box(0,sill+.025,0,w,.05,.095,black,g);box(0,sill+h-.025,0,w,.05,.095,black,g);box(0,sill+h/2,0,.035,h,.065,black,g);
    const glassWidth=o.balcony?w/2:w;box(o.balcony?w/4:0,sill+h/2,0,glassWidth-.06,h-.07,.014,glass,g);
    if(!o.balcony)obstacle(axis==='x'?c:fixed,axis==='x'?fixed:c,axis==='x'?w:.09,axis==='x'?.09:w,'Glazing');
    else obstacle(axis==='x'?c+w/4:fixed,axis==='x'?fixed:c-w/4,axis==='x'?w/2:.09,axis==='x'?.09:w/2,'Sliding glass panel');
   }else{
    box(-w/2-.025,1.06,0,.055,2.15,t+.045,wood,g);box(w/2+.025,1.06,0,.055,2.15,t+.045,wood,g);box(0,2.135,0,w+.08,.065,t+.045,wood,g);
    if(name!=='Hall connection'){
     const hingeAtEnd=o.hinge==='end',leaf=new T.Group();leaf.position.x=hingeAtEnd?w/2-.02:-w/2+.02;leaf.rotation.y=(hingeAtEnd?1:-1)*(o.swing==='reverse'?-1:1)*Math.PI*.49;g.add(leaf);const sign=hingeAtEnd?-1:1;box(sign*(w/2-.04),1.025,0,w-.08,2.05,.04,o.balcony?glass:mat('#c1ae8f'),leaf).name='Open door leaf';box(sign*(w-.15),1.03,.05,.1,.025,.03,black,leaf);
    }
   }
   cursor=o.b;
  }part(cursor,end);
 }
 // Clear dimensions set the inner faces. All main columns are retained.
 wall('x',.8,-.4,3.6,.4,[{a:.5,b:1.4,kind:'door',h:2.2}],'Guest north wall');
 wall('z',3.8,-.4,1,.4);wall('x',-.2,3.6,14.6,.4,[{a:4.7,b:6.5,kind:'window'},{a:8.8,b:9.7,kind:'window',sill:1,h:1.2},{a:11.7,b:13.5,kind:'window',balcony:true}]);
 wall('z',-.2,1,9.9,.4,[{a:2.1,b:3.9,kind:'window',balcony:true},{a:5.1,b:6.9,kind:'window'},{a:8.2,b:9.1,kind:'window'}]);
 wall('z',14.4,0,8.475,.4,[{a:2.6,b:3.5,kind:'door',h:2.2,balcony:true,swing:'reverse'},{a:5.2,b:7,kind:'window'}],'East exterior wall');
 wall('x',10.1,-.4,3.95,.4);
 wall('x',10.025,3.95,8.25,.25,[{a:5.091,b:5.991,kind:'door',h:2.1},{a:6.85,b:7.75,kind:'door',h:2.1}],'Entry wall');
 // Close the original entry doors. The stair landing is outside the model.
 for(const x of [5.541,7.30]){box(x,1.055,10.025,.86,2.11,.07,mat('#656f56'),upper);obstacle(x,10.025,.9,.1,'Closed apartment entrance');box(x+.29,1,9.97,.12,.025,.035,brass,upper)}
 wall('x',8.125,8.25,14.6,.25);wall('z',8.125,7.75,10.15,.25);
 wall('z',8.125,0,5.575,.25);wall('x',5.7,6.45,8.25,.25);
 wall('x',5.6375,6.075,6.45,.125);
 wall('z',6.575,5.7,9.9,.25,[{a:8.35,b:9.55,kind:'door',h:2.15}],'Hall connection');
 // Guest closure and its 90 cm hall door remain part of the proposed design.
 wall('z',3.9375,1,4.7,.125,[{a:3.4,b:4.3,kind:'door',h:2.1,swing:'reverse'}],'Guest hall door');wall('x',3.0625,4,8,.125,[{a:4.7,b:5.6,kind:'door',h:2.1,swing:'reverse'}]);
 wall('x',4.6375,0,3.875,.125,[],'Closed guest south partition');
 if(layout!=='original'){
  // The outer face aligns with the utility wall. The common hall stays outside the suite.
  wall('x',4.625,3.875,5,.15,[],'Suite partition');
  wall('z',4.925,4.55,8.25,.15,[{a:6.45,b:7.45,kind:'door',h:2.15,swing:'reverse'}],'Suite partition');
  // Keep the open leaf solid in walking mode, including with furniture hidden.
  obstacle(4.445,7.43,.92,.07,'Suite door leaf');
 }
 wall('z',6.1375,3.125,5.7,.125,[{a:3.325,b:4.125,kind:'door',h:2.1,hinge:'end'}]);
 wall('x',2.4375,8.25,10.2,.125,[{a:9.25,b:10.05,kind:'door',h:2.1,hinge:'end',swing:'reverse'}]);
 wall('z',10.2625,0,3.725,.125,[{a:2.6,b:3.5,kind:'door',h:2.1}]);
 if(layout==='social'){
  wall('x',3.6625,10.325,10.70,.125,[],'Retained island support');
  // The low wall stays whole in the overview, below the stone cap.
  box(11.925,.675,3.6625,2.45,1.35,.125,plaster).name='Island half wall';
  obstacle(11.925,3.6625,2.45,.125,'Island half wall');
  // The wall cap and shaft finish remain visible when furniture is hidden.
  box(11.925,1.375,3.5125,2.45,.05,.43,travertine).name='Island stone cap';
  obstacle(11.925,3.5125,2.45,.43,'Island stone cap');
  for(const [bottom,top,parent]of [[0,.95,root],[.95,2.7,upper]] as const){
   box(10.5125,(bottom+top)/2,3.581,.375,top-bottom,.025,walnut,parent);
   box(10.6875,(bottom+top)/2,3.80,.025,top-bottom,.39,walnut,parent);
  }
 }else wall('x',3.6625,10.325,14.2,.125);
 wall('x',3.6625,8.25,8.8,.125,[],'East hall partition');
 wall('x',8.1875,2.55,5,.125);wall('z',2.6125,8.25,9.9,.125);wall('z',4.9375,8.25,9.9,.125,[{a:8.35,b:9.15,kind:'door',h:2.1}]);
 // Concrete columns have their own retained footprints.
 for(const [x,z,w,d]of [[0,1.1,.5,.7],[0,7.75,.5,.5],[8.125,.5,.25,1.5],[14.325,.5,.25,1.5],[14.2,8.125,.5,.7],[8.125,8.95,.25,2.4]])wallPart(x,z,w,d,0,2.7,'Retained concrete column');
 // Closed service shafts are part of the room footprint, not free floor space.
 for(const [x,z,w,d]of [[7.865,3.41,.27,.57],[8.385,.375,.27,.75],[10.5,3.86,.34,.27],[2.415,9.765,.27,.27],[4.59,9.765,.57,.27]])wallPart(x,z,w,d,0,2.7,'Service shaft');
 // Full ceilings are visible only inside.
 footprint(shell,mat('#f5f0e6',.95),2.77,.07,ceiling);
 // Balcony rails: only exposed outer edges; glass is retained at walking height.
 function rail(ax:number,az:number,bx:number,bz:number){const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz),g=new T.Group();g.position.set((ax+bx)/2,0,(az+bz)/2);g.rotation.y=-Math.atan2(dz,dx);root.add(g);box(0,.51,0,len,.95,.025,glass,g);box(0,1.0,0,len+.04,.035,.05,black,g);for(let x=-len/2;x<=len/2+.05;x+=len/Math.max(1,Math.ceil(len/1.2)))box(x,.5,0,.035,1,.04,black,g);obstacle((ax+bx)/2,(az+bz)/2,Math.abs(dx)||.06,Math.abs(dz)||.06,'Balcony guard')}
 rail(-1.7,-.7,3.6,-.7);rail(-1.7,-.7,-1.7,4.2);rail(-1.7,4.2,-.4,4.2);rail(3.6,-.7,3.6,.6);
 rail(11.5,-1.7,15.9,-1.7);rail(15.9,-1.7,15.9,3.7);rail(14.6,3.7,15.9,3.7);rail(11.5,-1.7,11.5,-.4);
 // Soft contact shadows keep furniture grounded between direct shadows.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d')!,gradient=sc.createRadialGradient(64,64,3,64,64,62);gradient.addColorStop(0,'rgba(38,31,20,0.24)');gradient.addColorStop(.5,'rgba(38,31,20,0.12)');gradient.addColorStop(1,'rgba(38,31,20,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);const shadowTex=new T.CanvasTexture(shadowCanvas);textures.push(shadowTex);
 function contact(x:number,z:number,w:number,d:number){const m=mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}),furniture);m.rotation.x=-Math.PI/2;m.position.set(x,.039,z);m.castShadow=false}
 function group(x:number,z:number,rotation=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;furniture.add(g);return g}
 function rectObstacle(x:number,z:number,w:number,d:number,rot:number,name:string){const c=Math.abs(Math.cos(rot)),s=Math.abs(Math.sin(rot));obstacle(x,z,w*c+d*s,w*s+d*c,name,true)}
 function rug(x:number,z:number,w:number,d:number,color=rugmat){box(x,.046,z,w,.024,d,color,furniture,.09)}
 function book(x:number,y:number,z:number,w=.17,h=.27,d=.12,parent:T.Object3D=furniture,color=clay){box(x,y,z,w,h,d,color,parent,.008);box(x,y,z+d/2+.001,w*.83,h*.88,.006,mat('#dfdacb'),parent)}
 function vase(x:number,y:number,z:number,r=.1,parent:T.Object3D=furniture){cylinder(x,y+.13,z,r,.26,white,parent,r*.67);cylinder(x,y+.26,z,r*.52,.025,mat('#9c9785'),parent)}
 function plant(x:number,z:number,scale=1,parent:T.Object3D=furniture){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);if(parent===furniture)obstacle(x,z,.43*scale,.43*scale,'Plant pot',true);cylinder(0,.18,0,.18,.36,mat('#b89779'),g,.23);cylinder(0,.355,0,.19,.02,mat('#584b35'),g);for(let i=0;i<9;i++){const a=i*2.4,h=.55+i*.075,xx=Math.cos(a)*.21,zz=Math.sin(a)*.21;const curve=new T.CatmullRomCurve3([new T.Vector3(0,.3,0),new T.Vector3(xx*.4,h*.8,zz*.4),new T.Vector3(xx,h,zz)]);mesh(new T.TubeGeometry(curve,7,.009,4,false),mat('#697647'),g);const leaf=sphere(xx,h,zz,.19,mat(i%2?'#65784b':'#7f8c58'),g,.52,1.65,.16);leaf.rotation.set(Math.cos(a)*.7,a,Math.sin(a)*.7)}}
 function pendant(x:number,z:number,r=.3){cylinder(x,2.56,z,.007,.28,black,upper);cylinder(x,2.30,z,r,.25,mat('#d6b37b'),upper,r*.25);cylinder(x,2.17,z,r*.83,.018,new T.MeshStandardMaterial({color:'#fff6d0',emissive:'#ffdf9d',emissiveIntensity:1.4}),upper);const light=new T.PointLight('#ffe0b1',5,5,2);light.position.set(x,2.12,z);lights.push(light);root.add(light)}
 function art(x:number,y:number,z:number,w:number,h:number,rot=0,child=false){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot;upper.add(g);box(0,0,0,w+.06,h+.06,.035,wood,g);box(0,0,.025,w,h,.015,mat('#e6ddc6'),g);const disk=mesh(new T.CircleGeometry(w*.23,40),mat(child?'#d7b36f':'#a76d54'),g);disk.position.set(-w*.16,h*.13,.037);const disk2=mesh(new T.CircleGeometry(w*.34,40),mat(child?'#9ea980':'#7c8667'),g);disk2.scale.y=.6;disk2.position.set(w*.17,-h*.3,.041)}
 function beam(a:number[],b:number[],width:number,finish:T.Material,parent:T.Object3D){
  const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
  const o=box(0,0,0,width,delta.length(),width,finish,parent,.003);o.position.copy(start.add(end).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;
 }
 function botanicalPrint(x:number,y:number,z:number,w:number,h:number,panel=0,rot=0){
  const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot;upper.add(g);
  box(0,0,0,w+.045,h+.045,.035,wood,g,.006);box(0,0,.021,w,h,.009,cream,g);
  const geometry=new T.PlaneGeometry(w-.055,h-.055),uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)/2+panel/2);
  const face=mesh(geometry,new T.MeshStandardMaterial({color:artwork?'#ffffff':'#d8cfb9',...(artwork?{map:artwork}:{}),roughness:1}),g);face.position.z=.029;
 }
 function wovenRug(x:number,z:number,w:number,d:number){
  rug(x,z,w,d);const count=Math.round(w/.065),fringe=new T.InstancedMesh(new T.BoxGeometry(.018,.012,.09),linen,count*2),matrix=new T.Matrix4();
  for(let side=0;side<2;side++)for(let i=0;i<count;i++){matrix.makeTranslation(x-w/2+.035+i*.065,.05,z+(side?1:-1)*(d/2+.045));fringe.setMatrixAt(side*count+i,matrix)}fringe.receiveShadow=true;furniture.add(fringe);
 }
 function linenPendant(x:number,z:number){
  cylinder(x,2.56,z,.01,.26,brass,upper);
  mesh(new T.CylinderGeometry(.38,.38,.30,48,1,true),linen,upper).position.set(x,2.28,z);
  mesh(new T.CylinderGeometry(.29,.29,.18,48,1,true),linen,upper).position.set(x,2.08,z);
  cylinder(x,1.995,z,.275,.014,glow,upper);const light=new T.PointLight('#ffe1af',1.2,5,2);light.position.set(x,1.93,z);lights.push(light);root.add(light);
 }
 function ovalCoffee(x:number,z:number,w:number,d:number){
  const g=group(x,z);const top=cylinder(0,.38,0,.5,.065,walnut,g);top.scale.set(w,1,d);
  const base=cylinder(0,.19,0,.38,.33,wood,g);base.scale.set(w,1,d);
  for(let i=0;i<36;i++){const a=i*Math.PI*2/36;cylinder(Math.cos(a)*.38*w,.19,Math.sin(a)*.38*d,.012,.31,walnut,g)}
  book(-.12,.435,0,.24,.03,.20,g,cream);vase(Math.min(.20,w/2-.075),.415,-.02,.06,g);rectObstacle(x,z,w,d,0,'Coffee table');contact(x,z,w+.3,d+.3);
 }
 function chair(x:number,z:number,rot=0,color=sage,desk=false,name='Chair'){const g=group(x,z,rot);box(0,.47,0,.5,.13,.49,color,g,.075);box(0,.72,-.20,.5,.50,.12,color,g,.07);if(desk){cylinder(0,.25,0,.035,.43,black,g);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,o=box(Math.sin(a)*.12,.07,Math.cos(a)*.12,.035,.035,.28,black,g);o.rotation.y=a;cylinder(Math.sin(a)*.25,.05,Math.cos(a)*.25,.033,.035,black,g)}}else for(const xx of [-.18,.18])for(const zz of [-.17,.17])box(xx,.23,zz,.035,.44,.035,wood,g);rectObstacle(x,z,.55,.58,rot,name);contact(x,z,.8,.8);return g}
 function desk(x:number,z:number,rot=0,w=1.5){const g=group(x,z,rot);box(0,.755,0,w,.055,.68,wood,g,.018);for(const xx of [-w/2+.09,w/2-.09]){box(xx,.37,0,.04,.73,.56,black,g);box(xx,.73,0,.035,.035,.61,black,g)}box(0,1.09,-.18,.62,.36,.035,black,g,.014);box(0,1.09,-.158,.57,.31,.009,mat('#68767a',.35),g);box(0,.89,-.18,.04,.22,.035,black,g);box(0,.798,-.13,.24,.015,.15,black,g);box(0,.796,.15,.4,.018,.14,mat('#a3a5a0'),g,.008);box(.31,.798,.17,.07,.025,.1,black,g,.018);book(-w/2+.20,.78,-.10,.21,.026,.29,g,sage);cylinder(.52,.83,-.15,.047,.11,white,g);rectObstacle(x,z,w,.68,rot,'Office desk');contact(x,z,w+.3,1);return g}
 function wardrobe(x:number,z:number,w:number,d:number,rot=0){const g=group(x,z,rot);box(0,1.17,0,w,2.34,d,wood,g,.012);const count=Math.round(w/.55);for(let i=0;i<count;i++){box(-w/2+(i+.5)*w/count,1.19,d/2+.013,w/count-.018,2.25,.025,mat('#c9bea6'),g,.008);box(-w/2+(i+.85)*w/count,1.14,d/2+.038,.012,.32,.016,brass,g)}rectObstacle(x,z,w,d,rot,'Wardrobe');contact(x,z,w+.25,d+.3)}
 function bed(x:number,z:number,w:number,d:number,rot=0,child=false){const g=group(x,z,rot),h=child?.24:.43;
  box(0,h-.12,0,w+.13,.26,d+.12,wood,g,.045);box(0,h+.06,0,w,.24,d,linen,g,.1);box(0,child?.48:.67,-d/2-.045,w+.18,child?.85:1.25,.12,child?wood:sage,g,.04);
  box(0,h+.195,d*.18,w+.015,.10,d*.63,child?blush:mat('#d2c9b4'),g,.065);
  for(let i=0;i<(child?1:2);i++){const xx=child?0:(i?1:-1)*w*.24;box(xx,h+.23,-d*.31,w*(child?.72:.43),.18,.43,linen,g,.1)}
  box(0,h+.25,d*.36,w+.04,.035,.43,child?mat('#9ba887'):mat('#a1866b'),g,.035);
  if(child){
   for(const xx of [-w/2-.035,w/2+.035])for(const zz of [-d/2,d/2])box(xx,.89,zz,.045,1.64,.045,wood,g,.006);
   for(const zz of [-d/2,d/2])for(const xx of [-w/2-.035,w/2+.035]){
    beam([xx,1.70,zz],[0,2.12,zz],.045,wood,g);
    beam([xx,1.685,zz-.025],[0,2.105,zz-.025],.010,glow,g);
   }
   beam([0,2.12,-d/2],[0,2.12,d/2],.045,wood,g);
   for(const xx of [-w/2-.035,w/2+.035])beam([xx,1.70,-d/2],[xx,1.70,d/2],.035,wood,g);
   for(const zz of [-.48,.48]){box(-w/2-.07,.15,zz,.025,.22,.88,cream,g,.012);box(-w/2-.085,.21,zz,.016,.025,.22,wood,g,.005)}
  }
  rectObstacle(x,z,w+.18,d+.21,rot,child?'Child bed':'Bed');contact(x,z,w+.55,d+.45);return g
 }
 function bedside(x:number,z:number){cylinder(x,.25,z,.23,.5,wood);cylinder(x,.52,z,.24,.04,stone);cylinder(x,.63,z,.045,.2,brass);cylinder(x,.80,z,.12,.19,linen,furniture,.09);obstacle(x,z,.48,.48,'Bedside table',true)}
 function sofa(x:number,z:number,w:number,rot=0,color=linen,depth=1){const g=group(x,z,rot);g.scale.z=depth;box(0,.30,0,w,.42,.90,color,g,.12);box(0,.67,-.37,w,.57,.19,color,g,.085);for(const xx of [-w/2+.1,w/2-.1])box(xx,.52,.02,.2,.52,.94,color,g,.085);const count=w<2?2:3;for(let i=0;i<count;i++)box(-w*.40+(i+.5)*w*.8/count,.535,.025,w*.8/count-.012,.16,.65,color,g,.07);for(const xx of [-w*.29,w*.3]){const p=box(xx,.78,-.21,.40,.40,.16,xx<0?cream:blush,g,.09);p.rotation.z=xx<0?-.16:.12;p.rotation.x=.14}
  box(-w*.33,.615,.18,.42,.025,.63,cream,g,.025);box(-w*.33,.36,.467,.42,.48,.025,cream,g,.015);
  rectObstacle(x,z,w,depth,rot,'Sofa');contact(x,z,w+.4,depth+.4)
 }
 function diningCornerSofa(){
  // Two joined seating wings. Their separate bounds keep the inside corner open.
  const main=group(12.675,7.525);main.name='Dining corner sofa';
  box(0,.30,0,2.45,.42,.85,olive,main,.095);box(0,.70,.35,2.45,.60,.15,olive,main,.065);
  box(-1.145,.53,0,.16,.48,.85,olive,main,.06);box(1.14,.70,0,.17,.60,.85,olive,main,.06);
  for(const xx of [-.69,.04]){box(xx,.535,-.04,.70,.16,.61,olive,main,.065);box(xx,.80,.225,.42,.36,.15,cream,main,.07)}
  box(.80,.535,-.04,.69,.16,.61,olive,main,.065);box(-.66,.63,-.13,.42,.025,.55,linen,main,.02);
  rectObstacle(12.675,7.525,2.45,.85,0,'Sofa');contact(12.675,7.525,2.6,1.05);
  const side=group(13.475,6.525);side.name='Dining sofa return';
  box(0,.30,0,.85,.42,1.15,olive,side,.095);box(.35,.70,0,.15,.60,1.15,olive,side,.065);
  box(0,.53,-.49,.85,.48,.17,olive,side,.06);
  for(const zz of [-.175,.335])box(-.04,.535,zz,.61,.16,.46,olive,side,.065);
  box(.225,.80,.15,.15,.36,.40,blush,side,.065);
  rectObstacle(13.475,6.525,.85,1.15,0,'Sofa return');contact(13.475,6.525,1.05,1.35);
  fixtures.push({name:'Dining corner sofa',x:12.675,z:6.95,w:2.45,d:2.00,rotation:0});
 }
 function storage(x:number,z:number,w:number,d:number,rot=0,h=2.54,name='Storage cabinet',finish=ivory){
  const g=group(x,z,rot);g.name=name;box(0,h/2,0,w,h,d,walnut,g,.014);box(0,.055,d/2+.003,w-.07,.10,.014,black,g);
  const count=Math.max(1,Math.round(w/.58));
  for(let i=0;i<count;i++){const xx=-w/2+(i+.5)*w/count;box(xx,h/2+.035,d/2+.017,w/count-.018,h-.12,.035,finish,g,.008);box(xx+w/count*.37,h*.49,d/2+.040,.010,.30,.018,bronze,g)}
  rectObstacle(x,z,w,d+.035,rot,name);contact(x,z,w+.2,d+.2);return g;
 }
 function slidingWardrobe(x:number,z:number,w:number,d:number,name:string){
  const g=group(x,z,Math.PI/2);g.name=name;
  // Total depth includes sliding fronts and recessed handles.
  box(0,1.21,-.02,w,2.40,d-.04,wood,g,.012);
  for(const xx of [-w/4,w/4]){box(xx,1.48,d/2-.025,w/2-.024,1.76,.030,ivory,g,.009);box(xx+w/4-.13,1.43,d/2-.007,.016,.30,.012,brass,g,.005);box(xx,.32,d/2-.026,w/2-.024,.43,.030,ivory,g,.009);box(xx,.43,d/2-.008,.22,.016,.012,brass,g,.004)}
  rectObstacle(x,z,w,d,Math.PI/2,name);contact(x,z,d+.23,w+.25);
  fixtures.push({name,x,z,w,d,rotation:Math.PI/2});
 }
 function sink(x:number,y:number,z:number,w:number,d:number,rot=0,parent:T.Object3D=furniture){
  const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot;parent.add(g);
  box(0,0,0,w,.025,d,white,g,.075);box(0,.006,0,w-.09,.025,d-.09,mat('#aaa99c',.35),g,.06);box(0,-.015,0,w-.14,.03,d-.14,white,g,.05);
  const curve=new T.CatmullRomCurve3([new T.Vector3(0,.02,-d/2-.045),new T.Vector3(0,.28,-d/2-.045),new T.Vector3(0,.32,-.06),new T.Vector3(0,.22,.02)]);
  mesh(new T.TubeGeometry(curve,18,.012,8,false),bronze,g);return g;
 }
 function grandKitchen(){
  const open=layout==='social',x=open?11.925:12.43,z=4.105,w=open?2.33:3.34,d=.68,g=group(x,z);g.name='Kitchen counter';
  box(0,.44,0,w,.84,d,walnut,g);box(0,.055,.33,w-.08,.10,.03,black,g);
  for(let i=0;i<6;i++){const xx=-w/2+(i+.5)*w/6;for(let row=0;row<3;row++){box(xx,.24+row*.25,d/2+.012,w/6-.016,.232,.025,ivory,g,.009);box(xx,.345+row*.25,d/2+.029,w/6-.03,.012,.012,mat('#5e594c'),g)}}
  box(0,.91,0,w+.06,.07,d+.04,travertine,g,.025);for(const xx of [-w/2,w/2])box(xx,.49,0,.045,.81,d+.035,travertine,g);
  if(!open){
  box(0,1.31,-.332,w,.76,.027,travertine,g);box(0,2.13,-.13,w,.90,.40,walnut,g,.012);
  for(let i=0;i<6;i++)box(-w/2+(i+.5)*w/6,2.13,.085,w/6-.012,.875,.025,ivory,g,.006);
  box(0,1.665,.025,w-.08,.016,.025,new T.MeshStandardMaterial({color:'#fff5d4',emissive:'#ffda99',emissiveIntensity:1.4}),g);
  }
  box(.58,.958,0,.72,.022,.49,black,g,.022);for(const xx of [.37,.78])for(const zz of [-.13,.13]){const ring=mesh(new T.TorusGeometry(.075,.004,5,28),mat('#8a918a'),g);ring.rotation.x=-Math.PI/2;ring.position.set(xx,.972,zz)}
  if(!open)box(.58,1.655,-.03,.77,.045,.24,black,g);
  sink(11.13,.96,4.08,.66,.43);
  const towers=storage(8.60,4.68,1.80,.65,Math.PI/2,2.54,'Kitchen fridge oven pantry',walnut);
  for(const yy of [.84,1.50]){box(0,yy,.358,.55,.46,.035,black,towers,.015);box(0,yy-.025,.381,.47,.29,.008,mat('#3b403a',.16),towers);box(0,yy+.14,.397,.43,.018,.028,bronze,towers);for(const xx of [-.16,.16])sphere(xx,yy+.19,.388,.013,bronze,towers)}
  box(-.42,1.34,.379,.012,.85,.025,bronze,towers);box(.43,1.3,.379,.012,.32,.025,bronze,towers);
  rectObstacle(x,z,w+.06,d+.05,0,'Kitchen counter');
  if(!open){const tray=group(13.68,4.08);box(0,.96,0,.46,.02,.30,walnut,tray,.035);cylinder(-.12,1.075,0,.075,.22,white,tray);cylinder(.10,1.04,0,.07,.15,clay,tray);vase(14.0,.95,4.27,.075);}
  const sideboard=group(9.1,7.83,Math.PI);sideboard.scale.z=.30/.449;box(0,.49,0,1.35,.64,.40,walnut,sideboard,.012);
  for(const xx of [-.58,.58])for(const zz of [-.15,.15])box(xx,.12,zz,.035,.24,.035,walnut,sideboard);
  for(const xx of [-.335,.335]){box(xx,.49,.208,.62,.54,.024,wood,sideboard);for(let i=0;i<10;i++)box(xx-.27+i*.06,.49,.225,.016,.51,.008,walnut,sideboard);for(let i=0;i<8;i++)box(xx,.26+i*.065,.23,.60,.014,.008,walnut,sideboard)}
  box(0,.83,0,1.38,.045,.43,walnut,sideboard,.012);rectObstacle(9.1,7.83,1.38,.30,Math.PI,'Dining sideboard');vase(9.47,.86,7.84,.07);
  const mirror=new T.Group();mirror.position.set(9.1,1.65,7.974);mirror.rotation.y=Math.PI;upper.add(mirror);mesh(new T.TorusGeometry(.43,.016,8,56),black,mirror);mesh(new T.CircleGeometry(.417,56),mat('#b5c3b7',.12,.88),mirror).position.z=.008;
 }
 function grandDining(){
  const open=layout==='social',x=open?12.20:10.20,z=open?1.65:6.35,g=group(x,z);g.name='Six seat dining table';
  wovenRug(x,z,2.9,2.05);box(0,.76,0,1.90,.065,.90,walnut,g,.045);
  for(const xx of [-.73,.73])for(const zz of [-.28,.28])box(xx,.375,zz,.07,.72,.07,walnut,g,.01);
  for(const xx of [x-.47,x+.47]){chair(xx,z-.58,0,cream,false,'Dining chair');chair(xx,z+.58,Math.PI,cream,false,'Dining chair')}
  chair(x-1.25,z,Math.PI/2,cream,false,'Dining chair');chair(x+1.25,z,-Math.PI/2,cream,false,'Dining chair');
  box(0,.80,0,1.75,.012,.30,linen,g,.012);cylinder(0,.818,0,.22,.028,wood,g);vase(0,.835,0,.09,g);cylinder(.15,.90,.02,.04,.11,glow,g);
  rectObstacle(x,z,1.90,.90,0,'Dining table');fixtures.push({name:'Dining table',x,z,w:1.9,d:.9,rotation:0});contact(x,z,2.2,1.2);
  box(x,2.65,z,.94,.035,.09,black,upper);
  const blueGlass=new T.MeshPhysicalMaterial({color:'#567a82',transparent:true,opacity:.45,roughness:.15,side:T.DoubleSide,depthWrite:false});
  for(const [xx,y]of [[x-.38,2.14],[x,2.03],[x+.38,2.12]]){cylinder(xx,(2.63+y+.15)/2,z,.006,2.63-y-.15,black,upper);cylinder(xx,y,z,.11,.28,blueGlass,upper);sphere(xx,y-.02,z,.04,glow,upper)}
  const light=new T.PointLight('#ffddb2',1.2,5,2);light.position.set(x,1.94,z);lights.push(light);root.add(light);
  if(open)return;
  diningCornerSofa();wovenRug(12.70,6.92,2.30,1.95);ovalCoffee(12.37,6.30,.50,.70);
  botanicalPrint(12.20,1.70,7.96,.55,.74,0,Math.PI);botanicalPrint(13.15,1.70,7.96,.55,.74,1,Math.PI);
 }
 function toilet(x:number,z:number,rot=0,name='WC'){
  const g=group(x,z,rot);g.name=name;
  const body=mesh(new T.LatheGeometry([new T.Vector2(.085,.14),new T.Vector2(.11,.19),new T.Vector2(.17,.27),new T.Vector2(.22,.36),new T.Vector2(.21,.435)],36),white,g);body.scale.set(.92,1,1.24);
  const rim=new T.Shape();rim.absellipse(0,0,.208,.29,0,Math.PI*2,false,0);const hole=new T.Path();hole.absellipse(0,0,.132,.21,0,Math.PI*2,true,0);rim.holes.push(hole);
  const seat=mesh(new T.ExtrudeGeometry(rim,{depth:.037,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:3,curveSegments:32}),white,g);seat.rotation.x=-Math.PI/2;seat.position.y=.443;
  const inside=sphere(0,.37,0,.17,mat('#c6d0c9',.32),g,.78,.10,1.15);inside.castShadow=false;
  box(0,.59,-.31,.47,1.17,.13,travertine,g,.018);box(0,.95,-.234,.19,.11,.014,bronze,g,.011);
  const flush=box(-.035,.95,-.224,.055,.07,.009,mat('#c0ad88',.3,.6),g,.006);flush.castShadow=false;
  rectObstacle(x,z,.47,.70,rot,name);fixtures.push({name,x,z,w:.47,d:.70,rotation:rot});contact(x,z,.62,.85);
 }
 function socialLiving(){
  wovenRug(12.15,6.65,2.85,2.30);
  sofa(12.15,5.96,2.60,0,olive,.95);
  fixtures.push({name:'Living sofa',x:12.15,z:5.96,w:2.60,d:.95,rotation:0});
  ovalCoffee(12.15,6.98,.85,.40);
  const media=group(12.15,7.775,Math.PI);media.name='Social media cabinet';
  box(0,.31,0,2.30,.44,.38,walnut,media,.018);
  for(const xx of [-.86,-.285,.285,.86])box(xx,.31,.20,.55,.39,.025,ivory,media,.008);
  box(0,1.36,-.185,2.32,2.60,.035,travertine,media,.008);
  box(0,1.27,-.11,1.60,.90,.045,black,media,.012).name='Television';
  box(0,1.27,-.081,1.55,.85,.008,mat('#26322e',.2),media);
  rectObstacle(12.15,7.775,2.32,.44,Math.PI,'Social media cabinet');
  fixtures.push({name:'Television',x:12.15,z:7.885,w:1.60,d:.045,rotation:Math.PI});
  linenPendant(12.15,6.88);
 }
 function bathTub(x:number,z:number,w:number,d:number,rot=0,name='Bath tub'){
  const g=group(x,z,rot);g.name=name;box(0,.28,0,w,.54,d,ivory,g,.065);box(0,.556,0,w+.012,.025,d+.012,white,g,.07);
  const rim=new T.Shape();rim.absellipse(0,0,w*.47,d*.465,0,Math.PI*2,false,0);const hole=new T.Path();hole.absellipse(0,0,w*.405,d*.345,0,Math.PI*2,true,0);rim.holes.push(hole);
  const top=mesh(new T.ExtrudeGeometry(rim,{depth:.055,bevelEnabled:true,bevelSize:.02,bevelThickness:.017,bevelSegments:3,curveSegments:40}),white,g);top.rotation.x=-Math.PI/2;top.position.y=.557;
  const basin=sphere(0,.575,0,1,mat('#a6bbb4',.22),g,w*.40,.014,d*.33);basin.castShadow=false;
  cylinder(w*.33,.64,-d*.40,.022,.16,bronze,g);box(w*.27,.72,-d*.40,.16,.02,.025,bronze,g,.005);
  rectObstacle(x,z,w,d,rot,name);fixtures.push({name,x,z,w,d,rotation:rot});
 }
 function vanity(x:number,z:number,w:number,d:number,rot=0){
  const g=group(x,z,rot);g.name='Bathroom vanity';box(0,.62,0,w,.43,d,walnut,g,.025);for(let i=0;i<2;i++)box(0,.515+i*.205,d/2+.015,w-.025,.18,.025,ivory,g,.015);
  box(0,.87,0,w+.025,.045,d+.025,travertine,g,.03);sink(0,.909,0,w-.04,d-.08,0,g);
  box(0,1.50,-d/2+.005,w,.95,.055,walnut,g,.10);box(0,1.5,-d/2+.04,w-.055,.895,.014,mat('#afc3b9',.10,.84),g,.10);
  box(0,1.997,-d/2+.05,w-.08,.017,.025,new T.MeshStandardMaterial({color:'#fff1c6',emissive:'#ffd292',emissiveIntensity:1.3}),g);
  rectObstacle(x,z,w,d,rot,'Bathroom vanity');return g;
 }
 function correctedBathrooms(){
  bathTub(7.10,5.17,1.72,.74,0,'West bath tub');toilet(7.42,3.52,0,'West WC');vanity(7.70,4.36,.66,.50,-Math.PI/2);
  bathTub(9.365,.39,1.60,.72,0,'East bath tub');toilet(8.63,1.20,Math.PI/2,'East WC');vanity(8.525,1.94,.64,.46,Math.PI/2);
  for(const [x,z,rot]of [[6.26,4.9,0],[10.14,1.45,Math.PI]]){const g=group(x,z,rot);for(let i=0;i<6;i++)box(0,.75+i*.09,0,.035,.025,.44,bronze,g);box(.04,1.01,0,.035,.42,.32,linen,g,.015)}
 }
 function loungeChair(x:number,z:number,rot:number){
  const g=group(x,z,rot);box(0,.36,0,.82,.41,.83,cream,g,.19);box(0,.71,-.31,.83,.55,.18,cream,g,.13);for(const xx of [-.36,.36])box(xx,.57,.02,.14,.40,.84,cream,g,.10);box(0,.59,0,.63,.14,.64,cream,g,.09);for(const xx of [-.28,.28])for(const zz of [-.26,.26])cylinder(xx,.115,zz,.025,.23,wood,g,.018);box(.12,.80,-.13,.31,.30,.12,olive,g,.055);rectObstacle(x,z,.86,.88,rot,'Lounge chair');contact(x,z,1.1,1.1);
 }
 function livingMedia(){
  const g=group(3.75,7.88,Math.PI);g.name='Media cabinet';
  box(0,.33,0,2.30,.47,.38,wood,g,.02);
  for(let i=0;i<4;i++)box(-1.15+(i+.5)*2.30/4,.34,.201,2.30/4-.015,.42,.018,ivory,g,.006);
  box(0,1.31,-.185,2.31,2.56,.065,travertine,g,.01);
  for(const xx of [-1.12,1.12])box(xx,1.32,-.143,.02,2.40,.015,bronze,g);
  box(0,1.24,-.04,1.46,.84,.045,black,g,.015).name='Television';
  box(0,1.24,-.013,1.40,.7875,.008,mat('#26322e',.2),g);
  box(0,.69,-.04,.045,.26,.045,black,g);
  rectObstacle(3.75,7.88,2.31,.44,Math.PI,'Media cabinet');contact(3.75,7.88,2.55,.75);
  fixtures.push({name:'Television',x:3.75,z:7.92,w:1.46,d:.045,rotation:Math.PI});
 }
 function luxuryLiving(){
  wovenRug(2.40,6.50,3.90,2.75);sofa(2.30,5.22,3.15,0,olive);ovalCoffee(2.30,6.43,1.30,.62);loungeChair(1.90,7.64,Math.PI);loungeChair(4.80,6.65,-Math.PI/2);livingMedia();
  botanicalPrint(1.84,1.80,4.735,.63,.85,0);botanicalPrint(2.76,1.80,4.735,.63,.85,1);
  const pouf=group(4.45,5.65);sphere(0,.23,0,.28,wood,pouf,1,.80,1);rectObstacle(4.45,5.65,.56,.56,0,'Woven pouf');
  desk(1.24,9.52,Math.PI);chair(1.24,8.61,0,sage,true);storage(2.225,8.70,.84,.60,-Math.PI/2,2.54,'Office tall storage',walnut);
  const bridge=group(1.24,9.72,Math.PI);box(0,2.20,0,1.65,.72,.30,walnut,bridge,.015);for(const xx of [-.55,0,.55])box(xx,2.20,.164,.535,.69,.025,ivory,bridge,.009);box(0,1.83,.08,1.60,.018,.022,new T.MeshStandardMaterial({color:'#fff1c8',emissive:'#ffdd9b',emissiveIntensity:1.4}),bridge);
  storage(6.31,6.65,1.35,.26,-Math.PI/2,2.54,'Shallow hall storage');plant(.40,6.98,1.1);plant(.23,9.52,.7);linenPendant(2.30,6.43);
 }
 function openDressingWardrobe(x:number,z:number,w:number,rot:number,mirrorBay=false){
  const d=.60,h=2.45,g=group(x,z,rot);g.name='Open dressing wardrobe';
  box(0,h/2,-d/2+.018,w,h,.036,walnut,g);
  for(const yy of [.065,2.415])box(0,yy,0,w,.07,d,walnut,g);
  const count=mirrorBay?3:2,bay=w/count;
  for(let i=0;i<=count;i++)box(-w/2+i*bay,h/2,0,.028,h,d,walnut,g);
  for(let i=0;i<count;i++){
   const xx=-w/2+(i+.5)*bay;
   box(xx,2.15,-.02,bay-.03,.025,d-.04,wood,g);
   box(xx,2.12,.23,bay-.08,.012,.018,glow,g);
   if(mirrorBay&&i===1){
    box(xx,1.12,-.24,bay-.07,1.97,.025,bronze,g,.018);
    box(xx,1.12,-.222,bay-.10,1.94,.012,mat('#b6c5bc',.07,.90),g,.012);
   }else{
    for(const yy of [.27,.56]){
     box(xx,yy,.015,bay-.05,.265,d-.04,wood,g,.008);
     box(xx,yy,.301,bay-.055,.24,.015,ivory,g,.005);
     box(xx,yy+.07,.314,.19,.012,.012,bronze,g,.004);
    }
    beam([xx-bay/2+.05,1.99,0],[xx+bay/2-.05,1.99,0],.017,bronze,g);
    for(let item=0;item<4;item++){
     const cx=xx-bay*.32+item*bay*.21,finish=[cream,olive,blush,linen][item];
     beam([cx,1.985,0],[cx,1.86,-.18],.012,wood,g);beam([cx,1.985,0],[cx,1.86,.18],.012,wood,g);
     box(cx,1.42,0,.07,.85,.40,finish,g,.025);
    }
   }
   box(xx,2.29,-.02,bay*.65,.21,.36,ivory,g,.025);
  }
  rectObstacle(x,z,w+.028,d+.025,rot,'Open dressing wardrobe');contact(x,z,w+.15,d+.15);
  fixtures.push({name:'Open dressing wardrobe',x,z,w:w+.028,d:d+.025,rotation:rot});
 }
 function masterSuite(){
  wovenRug(2.95,6.15,3.25,2.7);
  const mainBed=bed(2.95,5.84,2,2);mainBed.name='Suite king bed';
  // A broad upholstered headboard and two reading tables leave both bed sides open.
  box(2.95,.77,4.785,3.12,1.45,.12,cream,furniture,.04);
  for(const x of [1.58,4.32])bedside(x,5.12);
  fixtures.push({name:'Suite king bed',x:2.95,z:5.84,w:2,d:2,rotation:0});
  // Shallow folded-clothes storage keeps at least 75 cm at the bed foot.
  storage(3.68,7.93,2.20,.36,Math.PI,2.45,'Suite extra dressing');
  openDressingWardrobe(1.14,9.57,2.20,Math.PI,true);
  openDressingWardrobe(2.225,8.40,1.60,-Math.PI/2);
  // A flush filler joins the backs without blocking the drawer fronts.
  box(2.237,1.225,9.237,.035,2.45,.045,walnut,furniture);
  wovenRug(1.05,8.55,1.45,1.20);
  const seat=group(.80,8.12);seat.name='Dressing seat';
  cylinder(0,.20,0,.24,.35,walnut,seat);cylinder(0,.42,0,.275,.16,cream,seat);
  rectObstacle(.80,8.12,.55,.55,0,'Dressing seat');contact(.80,8.12,.75,.75);
  linenPendant(2.95,6.35);linenPendant(1.1,8.50);
  storage(6.31,6.65,1.35,.26,-Math.PI/2,2.54,'Shallow hall storage');
 }
 function cloud(parent:T.Object3D,x:number,y:number,z:number,scale=1,flat=false){
  const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
  for(const [xx,yy,r]of [[-.24,0,.17],[0,.10,.23],[.24,.02,.18],[.06,-.05,.18]])sphere(xx,yy,0,r,flat?glow:cream,g,1,.85,flat?.19:1);
  return g;
 }
 function girlRoom(){
  wovenRug(5.90,1.77,1.55,1.80);bed(7.26,1.65,.95,1.85,0,true);
  const shelves=group(4.22,1.52,Math.PI/2);box(0,.34,0,1.38,.66,.38,wood,shelves,.012);
  for(const xx of [-.45,0,.45])for(const yy of [.18,.49]){box(xx,yy,.035,.40,.26,.34,yy<.3?ivory:cream,shelves,.025);box(xx,yy+.07,.210,.10,.026,.010,wood,shelves,.009)}
  for(const yy of [1.05,1.51,1.97]){box(0,yy,-.06,1.38,.035,.24,wood,shelves,.008);box(0,yy-.029,-.10,1.29,.012,.025,glow,shelves);for(let i=0;i<4;i++)book(-.5+i*.12,yy+.145,-.025,.085,.24,.14,shelves,[blush,cream,sage,wood][i])}
  rectObstacle(4.22,1.52,1.38,.40,Math.PI/2,'Toy shelf');storage(4.30,.40,.58,.52,Math.PI/2,2.5,'Child wardrobe');
  const tent=group(6.10,.55);tent.name='Reading tent';const fabric=new T.MeshStandardMaterial({color:'#e9ddc7',map:linen.map,side:T.DoubleSide,roughness:1});
  mesh(new T.CylinderGeometry(.045,.43,1.22,24,1,true,Math.PI/4,Math.PI*1.5),fabric,tent).position.y=.72;
  for(const a of [Math.PI/4,Math.PI*3/4,Math.PI*5/4,Math.PI*7/4])beam([Math.sin(a)*.43,.06,Math.cos(a)*.43],[-Math.sin(a)*.07,1.55,-Math.cos(a)*.07],.022,wood,tent);
  cylinder(0,.065,0,.46,.09,cream,tent);sphere(.12,.16,.08,.16,blush,tent,1,.45,.8);
  sphere(-.12,.23,-.10,.13,wood,tent,1,1.2,.8);sphere(-.12,.44,-.10,.09,wood,tent);for(const xx of [-.18,-.06])sphere(xx,.51,-.10,.036,wood,tent);
  rectObstacle(6.10,.55,.94,.94,0,'Reading tent');
  const table=group(5.55,1.60);box(0,.45,0,.68,.035,.48,cream,table,.065);for(const xx of [-.25,.25])for(const zz of [-.16,.16])cylinder(xx,.23,zz,.024,.44,wood,table);book(-.08,.485,0,.18,.012,.15,table,blush);rectObstacle(5.55,1.60,.68,.48,0,'Child table');
  cylinder(5.25,.19,2.05,.17,.32,blush);obstacle(5.25,2.05,.34,.34,'Child stool',true);
  const wallLights=new T.Group();wallLights.position.set(7.966,0,1.65);wallLights.rotation.y=-Math.PI/2;upper.add(wallLights);
  cloud(wallLights,-.42,2.23,0,.70,true);cloud(wallLights,.48,2.25,0,.55,true);
  for(const [x,y]of [[-.74,1.94],[-.10,2.35],[.10,1.98],[.79,2.09]]){
   const shape=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.026:.059,xx=Math.sin(a)*r,yy=Math.cos(a)*r;if(i===0)shape.moveTo(xx,yy);else shape.lineTo(xx,yy)}shape.closePath();const star=mesh(new T.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:false}),glow,wallLights);star.position.set(x,y,.009);
  }
  cylinder(5.77,2.56,1.38,.008,.26,wood,upper);cloud(upper,5.77,2.27,1.38,1.05);const light=new T.PointLight('#ffe0ba',1.2,4,2);light.position.set(5.77,2.10,1.38);root.add(light);lights.push(light);
 }
 function outdoorBench(x:number,z:number,w:number,d:number,rot=0){
  const g=group(x,z,rot);g.name='Balcony storage bench';box(0,.24,0,w,.39,d,teak,g,.022);for(let i=0;i<Math.round(w/.085);i++)box(-w/2+.04+i*.085,.25,d/2+.01,.045,.33,.02,walnut,g,.006);
  box(0,.47,0,w-.04,.14,d-.015,linen,g,.055);box(0,.70,-d/2+.035,w,.40,.08,linen,g,.05);for(const xx of [-w*.32,w*.32])box(xx,.69,-d*.16,.34,.32,.11,sage,g,.07);rectObstacle(x,z,w,d,rot,'Balcony storage bench');return g;
 }
 function planter(x:number,z:number,w:number,d:number,h=.52){
  const g=group(x,z);g.name='Balcony planter';box(0,h/2,0,w,h,d,travertine,g,.025);box(0,h+.008,0,w-.035,.02,d-.035,mat('#514b36'),g,.01);
  const count=Math.max(2,Math.ceil(Math.max(w,d)/.28));for(let i=0;i<count;i++){const xx=w>d?(-w/2+.15+i*(w-.3)/(count-1)):0,zz=d>w?(-d/2+.15+i*(d-.3)/(count-1)):0;const stem=new T.Group();stem.position.set(xx,h-.12,zz);g.add(stem);plant(0,0,.60+(i%2)*.12,stem)}
  obstacle(x,z,w,d,'Balcony planter',true);return g;
 }
 function greenPanel(x:number,z:number,w:number,rot=0){
  const g=group(x,z,rot);g.name='Planted wall panel';box(0,1.90,-.025,w,1.18,.06,walnut,g,.02);for(let i=0;i<12;i++)box(-w/2+(i+.5)*w/12,1.90,.018,.022,1.13,.023,teak,g);
  const geo=new T.SphereGeometry(.12,10,6);const leaf=new T.InstancedMesh(geo,mat('#657f4f',.94),72);leaf.castShadow=true;leaf.receiveShadow=true;const t=new T.Object3D();
  for(let i=0;i<72;i++){const col=i%9,row=Math.floor(i/9);t.position.set((col-4)*w/9,1.42+row*.137,.095+Math.sin(i*3.2)*.04);t.rotation.set(.3*Math.sin(i),i*2.39,Math.cos(i*.8)*.55);t.scale.set(.58,1.24,.23);t.updateMatrix();leaf.setMatrixAt(i,t.matrix);leaf.setColorAt(i,new T.Color(i%3===0?'#8da56d':i%3===1?'#537544':'#738b55'))}g.add(leaf);
  for(const xx of [-w/2-.08,w/2+.08]){box(xx,1.95,.05,.045,.40,.07,black,g,.013);box(xx,1.74,.064,.024,.018,.04,new T.MeshStandardMaterial({color:'#fff1c5',emissive:'#ffdc96',emissiveIntensity:2}),g)}
 }
 function luxuryBalconies(){
  outdoorBench(2.37,.36,1.60,.43,Math.PI);greenPanel(2.37,.585,1.47,Math.PI);
  planter(3.36,.03,.32,1.00,.56);planter(-1.05,3.93,.95,.38,.54);planter(-.68,1.61,.29,.72,.62);
  outdoorBench(14.84,.28,1.40,.43,Math.PI/2);greenPanel(14.605,.32,1.28,Math.PI/2);
  cylinder(14.84,.47,1.24,.18,.045,travertine);cylinder(14.84,.23,1.24,.055,.44,bronze);obstacle(14.84,1.24,.36,.36,'Balcony side table',true);
  planter(15.24,3.43,1.00,.38,.57);planter(15.55,-1.43,.40,.36,.58);planter(11.72,-1.30,.35,.40,.60);
 }

 // Reference colours and seating, within the checked room dimensions.
 if(layout!=='original')masterSuite();else luxuryLiving();
 grandKitchen();grandDining();
 slidingWardrobe(6.93,6.80,1.80,.42,'Hall coat wardrobe');
 slidingWardrobe(8.57,3.05,1.00,.60,'Small hall wardrobe');

 rug(2.42,2.44,2.7,2.95);bed(2.72,2.24,1.40,2.0);bedside(1.64,1.45);wardrobe(1.55,4.21,2.42,.60,Math.PI);desk(.39,2.30,Math.PI/2,1.20);chair(1.10,2.30,-Math.PI/2,sage,true);art(2.64,1.67,1.075,1.10,.74,0);pendant(2,2.75,.28);
 girlRoom();
 // The west wall holds storage and leaves both master balcony doors clear.
 if(layout==='social')socialLiving();
 else{rug(12.4,1.65,3.15,2.64);bed(13.02,1.51,1.8,2.1,-Math.PI/2);bedside(13.62,.28);wardrobe(10.65,1.25,2.40,.60,Math.PI/2);art(14.10,1.67,1.5,1.2,.75,-Math.PI/2);pendant(11.15,1.5,.26);}
 correctedBathrooms();
 // Utility room: laundry and a compact WC.
 box(3.05,.46,9.49,.62,.88,.64,white,furniture,.025);const drum=mesh(new T.CylinderGeometry(.215,.215,.04,32),black,furniture);drum.rotation.x=Math.PI/2;drum.position.set(3.05,.44,9.14);const drumGlass=mesh(new T.CylinderGeometry(.16,.16,.046,32),glass,furniture);drumGlass.rotation.x=Math.PI/2;drumGlass.position.copy(drum.position);box(3.08,.94,9.49,.74,.06,.71,wood,furniture);obstacle(3.05,9.49,.68,.69,'Washing machine',true);box(3.70,.74,9.58,.52,.48,.54,wood,furniture,.02);sphere(3.70,1.02,9.58,.21,white,furniture,1,.17,1);obstacle(3.70,9.58,.55,.57,'Utility basin',true);toilet(4.54,9.22,Math.PI,'Utility WC');
 // Entry storage and the new internal threshold.
 box(5.24,.28,7.99,.44,.50,.92,wood,furniture,.025);obstacle(5.24,7.99,.46,.94,'Entry bench',true);box(5.22,1.60,7.93,.025,.90,.72,mat('#c3cabd',.14,.8),upper);rug(5.67,9.2,.77,.95);rug(7.35,8.8,.74,1.35);box(6.575,.045,8.95,.28,.02,1.20,brass);for(const z of [8.33,9.57])box(6.57,1.075,z,.29,2.15,.038,wood,upper);box(6.57,2.16,8.95,.29,.05,1.28,wood,upper);
 luxuryBalconies();
 // Sheer curtains are kept above the cut plane in the overhead views.
 function curtains(x:number,z:number,width:number,rot=0,drapes=false){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;upper.add(g);box(0,2.47,0,width+.28,.035,.035,black,g);const fabric=new T.MeshStandardMaterial({color:'#f0eadb',roughness:1,transparent:true,opacity:.73,side:T.DoubleSide});for(const side of [-1,1])for(let i=0;i<9;i++){const xx=side*(width/2+.02)-side*i*.045;box(xx,1.27,Math.sin(i*1.1)*.035,.052,2.33,.035,fabric,g,.012)}if(drapes)for(const side of [-1,1])for(let i=0;i<6;i++)box(side*(width/2+.14-i*.035),1.25,.07+Math.sin(i)*.022,.050,2.37,.045,linen,g,.017)}
 curtains(5.6,.08,1.8,0,true);curtains(12.6,.09,1.8);curtains(.09,3,1.8,Math.PI/2);curtains(.09,6,1.8,Math.PI/2,true);curtains(14.11,6.1,1.8,Math.PI/2,true);
 return {root,furniture,upper,ceiling,fixtures,obstacles,lights,textures,layout,...getLayout(layout),polygons:[shell,...balconies.map(b=>b.points)]};
}
