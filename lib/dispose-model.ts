import * as T from 'three';

export function disposeModel(root:T.Object3D,ownedTextures:T.Texture[]=[],keep:T.Texture[]=[]){
 const materials=new Set<T.Material>(),geometries=new Set<T.BufferGeometry>(),textures=new Set(ownedTextures);
 root.traverse(object=>{
  if(object instanceof T.Mesh||object instanceof T.Line||object instanceof T.Sprite){
   if('geometry'in object)geometries.add(object.geometry);
   for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);
  }
 });
 for(const material of materials){
  for(const value of Object.values(material))if(value instanceof T.Texture)textures.add(value);
  material.dispose();
 }
 for(const geometry of geometries)geometry.dispose();
 for(const texture of textures)if(!keep.includes(texture))texture.dispose();
}
