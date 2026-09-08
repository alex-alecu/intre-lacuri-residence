import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {rooms,shell,balconies} from './plan';
import type {Obstacle} from './navigation';
export function buildHome(){
 const root=new T.Group(),furniture=new T.Group(),upper=new T.Group(),ceiling=new T.Group(),dimensions=new T.Group(),labels=new T.Group();
 root.add(furniture,upper,ceiling,dimensions,labels);upper.visible=false;ceiling.visible=false;dimensions.visible=false;
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
 const wood=mat('#b98f61',.52),darkwood=mat('#6d5139',.6),plaster=mat('#eee9da',.9),trim=mat('#f5f0e6',.55),sage=mat('#85876a',.86),clay=mat('#b2785e',.9),black=mat('#343a35',.38,.3),brass=mat('#a68a55',.32,.72),white=mat('#f0efdf',.25),stone=mat('#ece4d2',.62),glass=new T.MeshPhysicalMaterial({color:'#d1e3db',transparent:true,opacity:.18,roughness:.12,metalness:.05,side:T.DoubleSide,depthWrite:false});
 const linen=mat('#f0e7d3',.97);linen.map=texture('linen');const tile=mat('#f0eddf',.75);tile.map=texture('stone');tile.map.repeat.set(2,2);
 const rugmat=mat('#efe7d6',1);rugmat.map=texture('rug');rugmat.map.repeat.set(3,3);
 function mesh(geo:T.BufferGeometry,material:T.Material,parent:T.Object3D=root){const m=new T.Mesh(geo,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function box(x:number,y:number,z:number,w:number,h:number,d:number,m:T.Material=plaster,parent:T.Object3D=root,round=0){const o=mesh(round?new RoundedBoxGeometry(w,h,d,2,Math.min(round,w/3,h/3,d/3)):new T.BoxGeometry(w,h,d),m,parent);o.position.set(x,y,z);return o}
 function cylinder(x:number,y:number,z:number,r:number,h:number,m:T.Material,parent:T.Object3D=furniture,rTop=r){const o=mesh(new T.CylinderGeometry(rTop,r,h,32),m,parent);o.position.set(x,y,z);return o}
 function sphere(x:number,y:number,z:number,r:number,m:T.Material,parent:T.Object3D=furniture,sx=1,sy=1,sz=1){const o=mesh(new T.SphereGeometry(r,18,12),m,parent);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o}
 function obstacle(x:number,z:number,w:number,d:number,name:string,isFurniture=false){obstacles.push({x,z,w,d,name,furniture:isFurniture})}
 function footprint(points:number[][],material:T.Material,y=0,depth=.18,parent:T.Object3D=root){const shape=new T.Shape(points.map(([x,z])=>new T.Vector2(x,-z)));const o=mesh(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),material,parent);o.rotation.x=-Math.PI/2;o.position.y=y-depth;return o}
 footprint(shell,oak);
 for(const b of balconies)footprint(b.points,tile,-.025,.16);
 for(const r of rooms.filter(r=>['bath','bath-right','utility'].includes(r.id)))box(r.x+r.w/2,.014,r.z+r.d/2,r.w,.027,r.d,tile);
 // Floor joints in the wet rooms.
 for(const r of rooms.filter(r=>['bath','bath-right','utility'].includes(r.id))){for(let x=r.x+.6;x<r.x+r.w;x+=.6)box(x,.03,r.z+r.d/2,.009,.005,r.d,mat('#a8a699'));for(let z=r.z+.6;z<r.z+r.d;z+=.6)box(r.x+r.w/2,.03,z,r.w,.005,.009,mat('#a8a699'))}
 function wallPart(x:number,z:number,w:number,d:number,bottom=0,top=2.7,name='Wall'){
  if(bottom<.95)box(x,(bottom+Math.min(top,.95))/2,z,w,Math.min(top,.95)-bottom,d,plaster);
  if(top>.95)box(x,(Math.max(bottom,.95)+top)/2,z,w,top-Math.max(bottom,.95),d,plaster,upper);
  if(bottom<1.65&&top>1.2)obstacle(x,z,w,d,name);
  if(bottom===0){const base=box(x,.055,z,w+.018,.11,d+.018,trim);base.castShadow=false}
 }
 type Opening={a:number;b:number;kind:'door'|'window';sill?:number;h?:number;balcony?:boolean};
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
     const leaf=new T.Group();leaf.position.x=-w/2+.02;leaf.rotation.y=-Math.PI*.49;g.add(leaf);box(w/2-.04,1.025,0,w-.08,2.05,.04,mat('#c1ae8f'),leaf);box(w-.15,1.03,.05,.1,.025,.03,black,leaf);
    }
   }
   cursor=o.b;
  }part(cursor,end);
 }
 // Clear dimensions set the inner faces. All main columns are retained.
 wall('x',.8,-.4,3.6,.4,[{a:.5,b:1.4,kind:'door',h:2.2}],'Guest north wall');
 wall('z',3.8,-.4,1,.4);wall('x',-.2,3.6,14.6,.4,[{a:4.7,b:6.5,kind:'window'},{a:8.8,b:9.7,kind:'window',sill:1,h:1.2},{a:11.7,b:13.5,kind:'window',balcony:true}]);
 wall('z',-.2,1,9.9,.4,[{a:2.1,b:3.9,kind:'window'},{a:5.1,b:6.9,kind:'window'},{a:8.25,b:9.15,kind:'window'}]);
 wall('z',14.4,0,8.26,.4,[{a:1.05,b:2.85,kind:'window'},{a:5.05,b:6.85,kind:'window'}]);
 wall('x',10.1,-.4,8.25,.4,[{a:5.15,b:6.05,kind:'door',h:2.1},{a:6.9,b:7.8,kind:'door',h:2.1}]);
 // Close the original entry doors. The stair landing is outside the model.
 for(const x of [5.6,7.35]){box(x,1.055,10.03,.86,2.11,.07,mat('#656f56'),upper);obstacle(x,10.03,.9,.1,'Closed apartment entrance');box(x+.29,1,.0+9.97,.12,.025,.035,brass,upper)}
 wall('x',8.135,8.25,14.6,.25);wall('z',8.125,8.01,10.3,.25);
 wall('z',8.125,0,5.58,.25);wall('x',5.705,6.45,8.25,.25);
 wall('z',6.575,5.83,9.9,.25,[{a:8.35,b:9.55,kind:'door',h:2.15}],'Hall connection');
 wall('z',3.935,1,4.7,.13);wall('x',3.065,4,8,.13,[{a:4.7,b:5.6,kind:'door',h:2.1}]);
 wall('x',4.635,0,3.87,.13,[{a:.65,b:1.55,kind:'door',h:2.1}],'New guest partition');
 wall('z',6.135,3.13,5.58,.13,[{a:3.36,b:4.16,kind:'door',h:2.1}]);
 wall('x',2.435,8.25,10.2,.13,[{a:8.5,b:9.3,kind:'door',h:2.1}]);
 wall('z',10.265,0,3.73,.13,[{a:2.6,b:3.5,kind:'door',h:2.1}]);wall('x',3.665,10.33,14.2,.13);
 wall('x',8.185,2.55,5.01,.13);wall('z',2.615,8.25,9.9,.13);wall('z',4.945,8.25,9.9,.13,[{a:8.4,b:9.2,kind:'door',h:2.1}]);
 // Concrete columns have their own retained footprints.
 for(const [x,z,w,d]of [[.13,1.13,.46,.55],[.13,7.66,.46,.48],[8.08,.16,.28,.45],[14.05,7.95,.48,.65],[14.08,.25,.25,.5]])wallPart(x,z,w,d,0,2.7,'Retained concrete column');
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
 function lamp(x:number,z:number,h=1.55,parent:T.Object3D=furniture){if(parent===furniture)obstacle(x,z,.38,.38,'Floor lamp',true);cylinder(x,.035,z,.19,.06,black,parent);cylinder(x,h/2,z,.012,h,brass,parent);cylinder(x,h,z,.25,.3,mat('#ede1c0'),parent,.14);const b=sphere(x,h-.1,z,.05,new T.MeshStandardMaterial({color:'#fff0bb',emissive:'#ffd995',emissiveIntensity:2}),parent);b.castShadow=false}
 function pendant(x:number,z:number,r=.3){cylinder(x,2.56,z,.007,.28,black,upper);cylinder(x,2.30,z,r,.25,mat('#d6b37b'),upper,r*.25);cylinder(x,2.17,z,r*.83,.018,new T.MeshStandardMaterial({color:'#fff6d0',emissive:'#ffdf9d',emissiveIntensity:1.4}),upper);const light=new T.PointLight('#ffe0b1',5,5,2);light.position.set(x,2.12,z);lights.push(light);root.add(light)}
 function art(x:number,y:number,z:number,w:number,h:number,rot=0,child=false){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot;upper.add(g);box(0,0,0,w+.06,h+.06,.035,wood,g);box(0,0,.025,w,h,.015,mat('#e6ddc6'),g);const disk=mesh(new T.CircleGeometry(w*.23,40),mat(child?'#d7b36f':'#a76d54'),g);disk.position.set(-w*.16,h*.13,.037);const disk2=mesh(new T.CircleGeometry(w*.34,40),mat(child?'#9ea980':'#7c8667'),g);disk2.scale.y=.6;disk2.position.set(w*.17,-h*.3,.041)}
 function chair(x:number,z:number,rot=0,color=sage,desk=false){const g=group(x,z,rot);box(0,.47,0,.5,.13,.49,color,g,.075);box(0,.72,-.20,.5,.50,.12,color,g,.07);if(desk){cylinder(0,.25,0,.035,.43,black,g);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,o=box(Math.sin(a)*.12,.07,Math.cos(a)*.12,.035,.035,.28,black,g);o.rotation.y=a;cylinder(Math.sin(a)*.25,.05,Math.cos(a)*.25,.033,.035,black,g)}}else for(const xx of [-.18,.18])for(const zz of [-.17,.17])box(xx,.23,zz,.035,.44,.035,wood,g);rectObstacle(x,z,.55,.58,rot,'Chair');contact(x,z,.8,.8);return g}
 function desk(x:number,z:number,rot=0){const g=group(x,z,rot);box(0,.755,0,1.5,.055,.68,wood,g,.018);for(const xx of [-.66,.66]){box(xx,.37,0,.04,.73,.56,black,g);box(xx,.73,0,.035,.035,.61,black,g)}box(0,1.09,-.18,.62,.36,.035,black,g,.014);box(0,1.09,-.158,.57,.31,.009,mat('#68767a',.35),g);box(0,.89,-.18,.04,.22,.035,black,g);box(0,.798,-.13,.24,.015,.15,black,g);box(0,.796,.15,.4,.018,.14,mat('#a3a5a0'),g,.008);box(.31,.798,.17,.07,.025,.1,black,g,.018);book(-.55,.78,-.10,.21,.026,.29,g,sage);cylinder(.52,.83,-.15,.047,.11,white,g);rectObstacle(x,z,1.5,.68,rot,'Office desk');contact(x,z,1.8,1);return g}
 function wardrobe(x:number,z:number,w:number,d:number,rot=0){const g=group(x,z,rot);box(0,1.17,0,w,2.34,d,wood,g,.012);const count=Math.round(w/.55);for(let i=0;i<count;i++){box(-w/2+(i+.5)*w/count,1.19,d/2+.013,w/count-.018,2.25,.025,mat('#c9bea6'),g,.008);box(-w/2+(i+.85)*w/count,1.14,d/2+.038,.012,.32,.016,brass,g)}rectObstacle(x,z,w,d,rot,'Wardrobe');contact(x,z,w+.25,d+.3)}
 function bed(x:number,z:number,w:number,d:number,rot=0,child=false){const g=group(x,z,rot),h=child?.24:.43;
  box(0,h-.12,0,w+.13,.26,d+.12,wood,g,.045);box(0,h+.06,0,w,.24,d,linen,g,.1);box(0,child?.48:.67,-d/2-.045,w+.18,child?.85:1.25,.12,child?wood:sage,g,.04);
  box(0,h+.195,d*.18,w+.015,.10,d*.63,child?mat('#d4a884'):mat('#d2c9b4'),g,.065);
  for(let i=0;i<(child?1:2);i++){const xx=child?0:(i?1:-1)*w*.24;box(xx,h+.23,-d*.31,w*(child?.72:.43),.18,.43,linen,g,.1)}
  box(0,h+.25,d*.36,w+.04,.035,.43,child?mat('#9ba887'):mat('#a1866b'),g,.035);
  if(child){box(-w/2-.035,h+.24,d*.20,.055,.39,d*.6,wood,g,.025);for(const xx of [-w/2,w/2])box(xx,1.25,-d/2,.035,1.3,.035,wood,g);const beam=box(0,1.84,-d/2,w+.1,.04,.04,wood,g);beam.rotation.z=0}
  rectObstacle(x,z,w+.13,d+.16,rot,child?'Child bed':'Bed');contact(x,z,w+.55,d+.45);return g
 }
 function bedside(x:number,z:number){cylinder(x,.25,z,.23,.5,wood);cylinder(x,.52,z,.24,.04,stone);cylinder(x,.63,z,.045,.2,brass);cylinder(x,.80,z,.12,.19,linen,furniture,.09);obstacle(x,z,.48,.48,'Bedside table',true)}
 function sofa(x:number,z:number,w:number,rot=0,color=linen,chaise=false){const g=group(x,z,rot);box(0,.30,0,w,.42,.90,color,g,.12);box(0,.67,-.37,w,.57,.19,color,g,.085);for(const xx of [-w/2+.1,w/2-.1])box(xx,.52,.02,.2,.52,.94,color,g,.085);for(let i=0;i<3;i++)box(-w*.31+i*w*.31,.535,.025,w*.3,.16,.65,color,g,.07);for(const xx of [-w*.29,w*.3]){const p=box(xx,.78,-.21,.45,.40,.16,xx<0?sage:clay,g,.09);p.rotation.z=xx<0?-.16:.12;p.rotation.x=.14}if(chaise){box(w/2-.47,.31,.72,.94,.43,1.15,color,g,.1);box(w/2-.47,.55,.70,.88,.14,1.10,color,g,.065);const v=new T.Vector3(w/2-.47,0,.75).applyAxisAngle(new T.Vector3(0,1,0),rot);rectObstacle(x+v.x,z+v.z,.94,1.1,rot,'Sofa chaise')}
  rectObstacle(x,z,w,1,rot,'Sofa');contact(x,z,w+.4,1.5)
 }
 function coffee(x:number,z:number,r=.45){cylinder(x,.34,z,r,.075,stone);cylinder(x,.16,z,r*.6,.30,wood);book(x-.08,.39,z,.21,.025,.28);vase(x+.13,.38,z-.1,.06);obstacle(x,z,r*2,r*2,'Coffee table',true);contact(x,z,r*2+.4,r*2+.4)}
 function consoleUnit(x:number,z:number,w:number,rot=0,tv=false){const g=group(x,z,rot);box(0,.33,0,w,.47,.38,wood,g,.02);for(let i=0;i<4;i++)box(-w/2+(i+.5)*w/4,.34,.201,w/4-.015,.42,.018,mat('#b7a081'),g);if(tv){box(0,1.14,-.04,w*.8,.71,.045,black,g,.015);box(0,1.14,-.009,w*.8-.05,.66,.008,mat('#3d4c49',.2),g);box(0,.68,-.04,.045,.20,.045,black,g)}rectObstacle(x,z,w,.43,rot,'Media cabinet');contact(x,z,w+.25,.75)}
 function kitchen(){const g=group(1.31,9.55,Math.PI);box(0,.43,0,2.48,.83,.65,mat('#8a8d70'),g);box(0,.88,0,2.54,.075,.69,stone,g,.02);for(let i=0;i<4;i++){box(-.93+i*.62,.44,.34,.60,.75,.03,mat('#8b9072'),g,.006);box(-.93+i*.62,.68,.368,.25,.012,.019,brass,g)}box(.65,.923,0,.55,.015,.48,black,g,.02);for(const x of [.51,.79])for(const z of [-.13,.13]){const burner=mesh(new T.TorusGeometry(.075,.006,6,30),mat('#778079'),g);burner.rotation.x=Math.PI/2;burner.position.set(x,.934,z)}box(-.50,.925,0,.62,.014,.43,mat('#8e9590',.2,.6),g,.06);box(-.50,.934,0,.50,.013,.31,mat('#57665d',.3,.5),g,.04);const pipe=new T.CatmullRomCurve3([new T.Vector3(-.5,.92,-.22),new T.Vector3(-.5,1.2,-.22),new T.Vector3(-.5,1.26,-.05),new T.Vector3(-.5,1.17,.04)]);mesh(new T.TubeGeometry(pipe,16,.014,7,false),brass,g);box(0,1.31,-.355,2.54,.77,.035,stone,g);box(0,2.07,-.18,2.5,.6,.34,mat('#c7b393'),g,.012);for(let i=0;i<4;i++)box(-.93+i*.62,2.07,.0,.60,.56,.025,mat('#cbb89b'),g);rectObstacle(1.31,9.55,2.54,.7,0,'Kitchen');box(.37,1.08,8.76,.69,2.16,.69,mat('#879078'),furniture,.015);box(.735,1.3,8.76,.018,.70,.022,brass);obstacle(.37,8.76,.72,.72,'Fridge',true);vase(2.24,.93,9.48,.09)}
 function dining(){cylinder(1.32,.75,7.52,.64,.055,wood);cylinder(1.32,.37,7.52,.23,.73,wood);for(const [x,z,rot]of [[.38,7.52,-Math.PI/2],[2.26,7.52,Math.PI/2],[1.32,6.60,0]])chair(x,z,rot,linen);cylinder(1.32,.80,7.52,.16,.03,white);vase(1.32,.81,7.52,.065);obstacle(1.32,7.52,1.28,1.28,'Dining table',true);contact(1.32,7.52,1.65,1.65);pendant(1.32,7.52,.32)}
 function bathroom(x:number,z:number,w:number,d:number){
  // Shower at the far north side; its open entry faces the door.
  box(x+w/2,.065,z+.43,w-.08,.1,.82,stone,furniture,.035);box(x+w/2,.12,z+.43,w-.18,.01,.70,mat('#eeeadd'),furniture,.025);
  box(x+w-.28,1.13,z+.83,.5,2.12,.015,glass,upper);box(x+w-.035,1.25,z+.26,.015,.95,.025,brass,upper);cylinder(x+w-.22,2.12,z+.28,.10,.018,brass,upper);
  box(x+w-.34,.57,z+d-.35,.60,.60,.60,wood,furniture,.025);box(x+w-.34,.90,z+d-.35,.63,.065,.63,stone,furniture,.025);sphere(x+w-.34,.966,z+d-.35,.21,white,furniture,1,.23,.85);box(x+w-.05,1.38,z+d-.35,.025,.70,.60,mat('#afc0b4',.12,.8),upper);obstacle(x+w-.34,z+d-.35,.62,.62,'Bathroom vanity',true);
  const toiletX=x+(w>1.9?.25:.39);sphere(toiletX,.33,z+d-.40,.26,white,furniture,.75,1.0,1.22);sphere(toiletX,.57,z+d-.40,.27,white,furniture,.84,.14,1.2);sphere(toiletX,.59,z+d-.40,.17,mat('#b8bfaf'),furniture,.8,.05,1.3);box(toiletX,.74,z+d-.12,.40,.50,.13,white,furniture,.05);obstacle(toiletX,z+d-.40,.45,.68,'Toilet',true);
 }
 // Left home: kitchen, shared living room, two sleeping rooms.
 kitchen();dining();rug(3.75,6.55,3.4,2.5);sofa(3.65,5.23,2.72,0,linen,false);coffee(3.40,6.85,.35);consoleUnit(3.75,7.90,1.94,Math.PI,true);plant(.34,4.95,.85);lamp(5.83,5.32);pendant(3.6,6.35,.42);
 rug(2.42,2.44,2.7,2.95);bed(2.72,2.24,1.40,2.0);bedside(1.64,1.45);wardrobe(2.97,4.21,1.65,.60,Math.PI);desk(.39,2.75,Math.PI/2);chair(1.10,2.75,-Math.PI/2,sage,true);art(2.64,1.67,1.075,1.10,.74,0);pendant(2,2.75,.28);
 rug(5.74,1.58,2.65,2.48,mat('#e7ddbd'));bed(7.26,1.65,.95,1.85,0,true);box(4.26,.44,1.30,.40,.83,1.25,wood,furniture,.025);for(let i=0;i<3;i++){box(4.27,.22, .9+i*.4,.35,.27,.31,mat(['#c7b189','#b7be9a','#d1aa8d'][i]),furniture,.04);book(4.49,.73,.9+i*.39,.04,.28,.23,furniture,[sage,clay,white][i])}obstacle(4.26,1.3,.42,1.28,'Toy shelf',true);cylinder(5.55,.30,1.4,.30,.06,wood);cylinder(5.55,.15,1.4,.04,.27,wood);cylinder(5.20,.15,1.88,.18,.30,mat('#b5be98'));sphere(6.23,.21,.55,.24,mat('#d5b48f'),furniture,1,.80,1);sphere(6.23,.53,.55,.13,mat('#d5b48f'));for(const xx of [6.13,6.33])sphere(xx,.63,.55,.055,mat('#d5b48f'));art(7.06,1.49,.08,1.1,.8,0,true);plant(4.27,.37,.65);pendant(5.8,1.6,.3);
 obstacle(5.55,1.4,.6,.6,'Child table',true);obstacle(5.2,1.88,.36,.36,'Child stool',true);
 // Right home: master bedroom, family lounge, and the second work desk.
 rug(12.4,1.65,3.15,2.64);bed(13.02,1.51,1.8,2.1,-Math.PI/2);bedside(13.62,.28);wardrobe(12.70,3.27,2.75,.60,Math.PI);art(14.10,1.67,1.5,1.2,.75,-Math.PI/2);plant(10.70,.37,.8);pendant(11.15,1.5,.26);
 rug(11.04,6.31,3.95,2.85);sofa(11.17,7.35,2.85,Math.PI,sage);coffee(11.13,6.10,.47);consoleUnit(11.76,4.05,2.12,0,false);for(let i=0;i<7;i++)book(11.15+i*.11,.76,4.10,.085,.29+(i%3)*.025,.17,furniture,[clay,linen,sage][i%3]);art(11.70,1.67,3.78,1.55,.98);vase(12.47,.58,4.08);desk(13.78,5.65,-Math.PI/2);chair(12.98,5.65,Math.PI/2,linen,true);chair(9.10,4.70,-Math.PI*.17,linen);lamp(8.6,4.10);plant(13.75,4.19,1.05);plant(13.81,7.52,.95);pendant(11.13,6.10,.43);
 bathroom(6.2,3.13,1.8,2.45);bathroom(8.25,0,1.95,2.37);
 // Utility room: laundry and a compact WC.
 box(3.05,.46,9.49,.62,.88,.64,white,furniture,.025);const drum=mesh(new T.CylinderGeometry(.215,.215,.04,32),black,furniture);drum.rotation.x=Math.PI/2;drum.position.set(3.05,.44,9.14);const drumGlass=mesh(new T.CylinderGeometry(.16,.16,.046,32),glass,furniture);drumGlass.rotation.x=Math.PI/2;drumGlass.position.copy(drum.position);box(3.08,.94,9.49,.74,.06,.71,wood,furniture);obstacle(3.05,9.49,.68,.69,'Washing machine',true);box(3.70,.74,9.58,.52,.48,.54,wood,furniture,.02);sphere(3.70,1.02,9.58,.21,white,furniture,1,.17,1);obstacle(3.70,9.58,.55,.57,'Utility basin',true);sphere(4.37,.31,9.48,.24,white,furniture,.84,1.1,1.25);sphere(4.37,.58,9.48,.25,white,furniture,.9,.15,1.2);obstacle(4.37,9.48,.48,.65,'Utility toilet',true);
 // Entry storage and the new internal threshold.
 box(5.24,.28,7.99,.44,.50,.92,wood,furniture,.025);obstacle(5.24,7.99,.46,.94,'Entry bench',true);box(5.22,1.60,7.93,.025,.90,.72,mat('#c3cabd',.14,.8),upper);rug(5.67,9.2,.77,.95);rug(7.35,8.8,.74,1.35);box(6.575,.045,8.95,.28,.02,1.20,brass);for(const z of [8.33,9.57])box(6.57,1.075,z,.29,2.15,.038,wood,upper);box(6.57,2.16,8.95,.29,.05,1.28,wood,upper);
 // Balcony planters fit at the arm ends and preserve the door paths.
 plant(3.15,-.10,.65);plant(-1.12,3.64,.65);plant(15.33,3.08,.65);plant(15.32,-1.10,.65);cylinder(14.58,.46,-1.05,.25,.035,wood);cylinder(14.58,.23,-1.05,.035,.44,black);chair(13.77,-1.05,-Math.PI/2,linen);
 // Sheer curtains are kept above the cut plane in the overhead views.
 function curtains(x:number,z:number,width:number,rot=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;upper.add(g);box(0,2.47,0,width+.28,.035,.035,black,g);const fabric=new T.MeshStandardMaterial({color:'#f0eadb',roughness:1,transparent:true,opacity:.73,side:T.DoubleSide});for(const side of [-1,1])for(let i=0;i<9;i++){const xx=side*(width/2+.02)-side*i*.045;box(xx,1.27,Math.sin(i*1.1)*.035,.052,2.33,.035,fabric,g,.012)}}
 curtains(5.6,.08,1.8);curtains(12.6,.09,1.8);curtains(.09,3,1.8,Math.PI/2);curtains(.09,6,1.8,Math.PI/2);curtains(14.11,5.95,1.8,Math.PI/2);
 function label(text:string,x:number,z:number,w=2.3,parent:T.Object3D=labels,y=.20){const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='rgba(251,250,243,.9)';ctx.beginPath();ctx.roundRect(0,0,768,128,25);ctx.fill();ctx.fillStyle='#4d5947';ctx.font='500 40px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,65);const t=new T.CanvasTexture(c);textures.push(t);const m=new T.Sprite(new T.SpriteMaterial({map:t,depthTest:false,transparent:true}));m.position.set(x,y,z);m.scale.set(w,w/6,1);m.renderOrder=8;parent.add(m)}
 for(const r of rooms.filter(r=>r.primary))label(r.id==='bath'?'Bathroom':r.name,r.visit[0],r.visit[1],r.id==='lounge'?2.8:2.4);
 label('1.20 m · NEW OPENING',6.58,8.97,2.5,dimensions,.45);
 function dimension(ax:number,az:number,bx:number,bz:number,text:string){const points=[new T.Vector3(ax,.055,az),new T.Vector3(bx,.055,bz)];const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:'#758367'}));dimensions.add(line);const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz);for(const [x,z]of [[ax,az],[bx,bz]]){const t=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(x-dz/len*.12,.055,z+dx/len*.12),new T.Vector3(x+dz/len*.12,.055,z-dx/len*.12)]),new T.LineBasicMaterial({color:'#758367'}));dimensions.add(t)}label(text,(ax+bx)/2,(az+bz)/2,1.65,dimensions,.10)}
 dimension(-.4,10.9,14.6,10.9,'15.00 m');dimension(16.4,-.4,16.4,10.3,'10.70 m');dimension(4,.65,8,.65,'4.00 m');dimension(10.33,3.20,14.2,3.20,'3.87 m');dimension(.0,4.1,3.87,4.1,'3.87 m');dimension(8.25,7.83,14.2,7.83,'5.95 m');
 return {root,furniture,upper,ceiling,dimensions,labels,obstacles,lights,textures,polygons:[shell,...balconies.map(b=>b.points)]};
}
