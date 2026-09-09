// Keep each finger separate so releasing one control cannot stop another.
export class WalkInput {
  keys = new Set<string>();
  pointers = new Map<number, string>();
  look: {id:number; x:number; y:number}|null = null;

  setKey(key:string, down:boolean) { if (down) this.keys.add(key); else this.keys.delete(key); }
  press(id:number, key:string) { this.pointers.set(id, key); }
  release(id:number) { this.pointers.delete(id); if (this.look?.id===id) this.look=null; }
  clear() { this.keys.clear(); this.pointers.clear(); this.look=null; }
  has(key:string) { return this.keys.has(key) || [...this.pointers.values()].includes(key); }

  startLook(id:number, x:number, y:number) {
    if (this.look) return false;
    this.look={id,x,y};
    return true;
  }
  moveLook(id:number, x:number, y:number) {
    if (this.look?.id!==id) return null;
    const delta={x:x-this.look.x,y:y-this.look.y};
    this.look={id,x,y};
    return delta;
  }
  axes() {
    let forward=Number(this.has('KeyW')||this.has('ArrowUp'))-Number(this.has('KeyS')||this.has('ArrowDown'));
    let side=Number(this.has('KeyD')||this.has('ArrowRight'))-Number(this.has('KeyA')||this.has('ArrowLeft'));
    const length=Math.hypot(forward,side);
    if (length>1) {forward/=length;side/=length;}
    return {forward,side};
  }
}
