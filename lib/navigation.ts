export type Obstacle={x:number;z:number;w:number;d:number;name:string;furniture?:boolean};
export const PLAYER_RADIUS=.19;
const WALL_FURNITURE_GAP=.2;
// Each layout supplies complete world bounds, including furniture rotation.
// Cache both visibility states because movement checks run several times per frame.
const movementCache=new WeakMap<Obstacle[],{visible:Obstacle[];hidden:Obstacle[]}>();
function movementObstacles(obstacles:Obstacle[],furniture:boolean){
 let cached=movementCache.get(obstacles);
 if(!cached){
  const hidden=obstacles.filter(b=>!b.furniture);
  const visible=obstacles.filter(b=>!b.furniture||!hidden.some(wall=>{
   const dx=Math.max(0,Math.abs(b.x-wall.x)-(b.w+wall.w)/2);
   const dz=Math.max(0,Math.abs(b.z-wall.z)-(b.d+wall.d)/2);
   return dx*dx+dz*dz<=WALL_FURNITURE_GAP*WALL_FURNITURE_GAP;
  }));
  cached={visible,hidden};movementCache.set(obstacles,cached);
 }
 return furniture?cached.visible:cached.hidden;
}
export function inPolygon(x:number,z:number,points:number[][]){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,zi]=points[i],[xj,zj]=points[j];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))inside=!inside}return inside}
export function canOccupy(x:number,z:number,obstacles:Obstacle[],polygons:number[][][],furniture=true){
 const r=PLAYER_RADIUS;
 for(const [dx,dz]of [[0,0],[r,0],[-r,0],[0,r],[0,-r],[r*.707,r*.707],[-r*.707,r*.707],[r*.707,-r*.707],[-r*.707,-r*.707]])if(!polygons.some(p=>inPolygon(x+dx,z+dz,p)))return false;
 return !movementObstacles(obstacles,furniture).some(b=>{const nx=Math.max(b.x-b.w/2,Math.min(x,b.x+b.w/2)),nz=Math.max(b.z-b.d/2,Math.min(z,b.z+b.d/2));return (x-nx)**2+(z-nz)**2<r*r});
}
