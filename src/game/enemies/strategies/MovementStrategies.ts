export interface MovementStrategy {
  update(deltaTime: number, position: { x: number; y: number }, target: { x: number; y: number }): { dx: number; dy: number };
  reset?(): void;
}

export class StraightMovement implements MovementStrategy {
  constructor(private speed: number) {}

  update(deltaTime: number, position: { x: number; y: number }, target: { x: number; y: number }): { dx: number; dy: number } {
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= 0) return { dx: 0, dy: 0 };
    
    return {
      dx: (dx / distance) * this.speed * deltaTime,
      dy: (dy / distance) * this.speed * deltaTime
    };
  }
}

export class ZigzagMovement implements MovementStrategy {
  private phase: number = 0;
  
  constructor(private speed: number, private amplitude: number = 30, private frequency: number = 0.1) {}

  update(deltaTime: number, position: { x: number; y: number }, target: { x: number; y: number }): { dx: number; dy: number } {
    this.phase += deltaTime * this.frequency;
    
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= 0) return { dx: 0, dy: 0 };
    
    // Calculate perpendicular direction for zigzag
    const perpX = -dy / distance;
    const perpY = dx / distance;
    
    const zigzagOffset = Math.sin(this.phase) * this.amplitude;
    
    return {
      dx: (dx / distance) * this.speed * deltaTime + perpX * zigzagOffset * deltaTime * 0.1,
      dy: (dy / distance) * this.speed * deltaTime + perpY * zigzagOffset * deltaTime * 0.1
    };
  }

  reset(): void {
    this.phase = 0;
  }
}

export class DashMovement implements MovementStrategy {
  private dashCooldown: number = 0;
  private isDashing: boolean = false;
  private dashTime: number = 0;
  
  constructor(
    private normalSpeed: number, 
    private dashSpeed: number, 
    private dashDuration: number = 0.167, // seconds (~10 frames at 60fps)
    private dashInterval: number = 2  // seconds (~120 frames at 60fps)
  ) {}

  update(deltaTime: number, position: { x: number; y: number }, target: { x: number; y: number }): { dx: number; dy: number } {
    this.dashCooldown -= deltaTime;
    
    if (this.dashCooldown <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashTime = this.dashDuration;
      this.dashCooldown = this.dashInterval;
    }
    
    if (this.isDashing) {
      this.dashTime -= deltaTime;
      if (this.dashTime <= 0) {
        this.isDashing = false;
      }
    }
    
    const speed = this.isDashing ? this.dashSpeed : this.normalSpeed;
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= 0) return { dx: 0, dy: 0 };
    
    return {
      dx: (dx / distance) * speed * deltaTime,
      dy: (dy / distance) * speed * deltaTime
    };
  }

  reset(): void {
    this.dashCooldown = 0;
    this.isDashing = false;
    this.dashTime = 0;
  }
}