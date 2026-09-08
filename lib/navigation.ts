export type Obstacle={x:number;z:number;w:number;d:number;name:string;furniture?:boolean};
export const PLAYER_RADIUS=.19;
export function inPolygon(x:number,z:number,points:number[][]){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,zi]=points[i],[xj,zj]=points[j];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))inside=!inside}return inside}
export function canOccupy(x:number,z:number,obstacles:Obstacle[],polygons:number[][][],furniture=true){
 const r=PLAYER_RADIUS;
 for(const [dx,dz]of [[0,0],[r,0],[-r,0],[0,r],[0,-r],[r*.707,r*.707],[-r*.707,r*.707],[r*.707,-r*.707],[-r*.707,-r*.707]])if(!polygons.some(p=>inPolygon(x+dx,z+dz,p)))return false;
 return !obstacles.some(b=>{if(b.furniture&&!furniture)return false;const nx=Math.max(b.x-b.w/2,Math.min(x,b.x+b.w/2)),nz=Math.max(b.z-b.d/2,Math.min(z,b.z+b.d/2));return (x-nx)**2+(z-nz)**2<r*r});
}
