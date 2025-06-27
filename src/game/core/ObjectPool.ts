export interface Poolable {
  reset(): void;
  isActive: boolean;
}

export class ObjectPool<T extends Poolable> {
  private pool: T[] = [];
  private active: Set<T> = new Set();
  private createFn: () => T;
  private resetFn?: (obj: T) => void;

  constructor(createFn: () => T, initialSize: number = 10, resetFn?: (obj: T) => void) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire(): T {
    let obj: T;
    
    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else {
      obj = this.createFn();
    }
    
    obj.isActive = true;
    this.active.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (!this.active.has(obj)) return;
    
    obj.reset();
    if (this.resetFn) {
      this.resetFn(obj);
    }
    
    obj.isActive = false;
    this.active.delete(obj);
    this.pool.push(obj);
  }

  releaseAll(): void {
    const activeArray = Array.from(this.active);
    
    activeArray.forEach((obj) => {
      try {
        obj.reset();
        if (this.resetFn) {
          this.resetFn(obj);
        }
        obj.isActive = false;
        this.pool.push(obj);
        this.active.delete(obj);
      } catch {
        // Silently handle errors during reset
      }
    });
    
    this.active.clear();
  }

  getActiveCount(): number {
    return this.active.size;
  }

  getActive(): T[] {
    return Array.from(this.active);
  }
}