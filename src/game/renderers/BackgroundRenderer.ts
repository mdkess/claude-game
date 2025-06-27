import * as PIXI from 'pixi.js';
import { GAME_SIZE } from '../core/constants';

interface GridPoint {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  offsetX: number;
  offsetY: number;
  baseIntensity: number;
  currentIntensity: number;
  pulsePhase: number;
  wavePhase: number;
}

export class BackgroundRenderer {
  private container: PIXI.Container;
  private backgroundContainer: PIXI.Container;
  private gridContainer: PIXI.Container;
  private gridLinesGraphics!: PIXI.Graphics;
  private waveOverlay!: PIXI.Graphics;
  private gridPoints: GridPoint[][] = [];
  private time: number = 0;
  private currentWave: number = 1;
  private transitionProgress: number = 0;
  private targetColor: number = 0x001122;
  private currentColor: number = 0x001122;
  
  // Grid settings
  private readonly GRID_SIZE = 40;
  private readonly GRID_SPACING = GAME_SIZE / this.GRID_SIZE;
  
  // Wave color progression
  private readonly waveColors = [
    0x001122, // Deep blue (waves 1-5)
    0x112211, // Dark green (waves 6-10)
    0x221111, // Dark red (waves 11-15)
    0x221122, // Purple (waves 16-20)
    0x222211, // Dark yellow (waves 21-25)
    0x112222, // Cyan (waves 26+)
  ];
  
  constructor(container: PIXI.Container) {
    this.container = container;
    this.backgroundContainer = new PIXI.Container();
    this.gridContainer = new PIXI.Container();
    
    this.createBackground();
    this.createGrid();
    this.createWaveOverlay();
    
    // Add to main container (at the back)
    this.container.addChildAt(this.backgroundContainer, 0);
  }
  
  private createBackground() {
    // Base background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, GAME_SIZE, GAME_SIZE);
    bg.fill({ color: 0x000000 });
    this.backgroundContainer.addChild(bg);
  }
  
  private createGrid() {
    // Initialize grid points
    for (let i = 0; i <= this.GRID_SIZE; i++) {
      this.gridPoints[i] = [];
      for (let j = 0; j <= this.GRID_SIZE; j++) {
        const x = i * this.GRID_SPACING;
        const y = j * this.GRID_SPACING;
        
        // Create grid point
        const point: GridPoint = {
          x,
          y,
          baseX: x,
          baseY: y,
          offsetX: 0,
          offsetY: 0,
          baseIntensity: 0.5,
          currentIntensity: 0,
          pulsePhase: 0,
          wavePhase: 0
        };
        
        this.gridPoints[i][j] = point;
      }
    }
    
    // Create grid lines
    this.gridLinesGraphics = new PIXI.Graphics();
    this.gridLinesGraphics.setStrokeStyle({ width: 0.5, color: 0xffffff, alpha: 0.1 });
    
    // Horizontal lines
    for (let i = 0; i <= this.GRID_SIZE; i++) {
      const y = i * this.GRID_SPACING;
      this.gridLinesGraphics.moveTo(0, y);
      this.gridLinesGraphics.lineTo(GAME_SIZE, y);
    }
    
    // Vertical lines
    for (let i = 0; i <= this.GRID_SIZE; i++) {
      const x = i * this.GRID_SPACING;
      this.gridLinesGraphics.moveTo(x, 0);
      this.gridLinesGraphics.lineTo(x, GAME_SIZE);
    }
    
    this.gridLinesGraphics.stroke();
    this.gridContainer.addChild(this.gridLinesGraphics);
    this.backgroundContainer.addChild(this.gridContainer);
  }
  
  private createWaveOverlay() {
    this.waveOverlay = new PIXI.Graphics();
    this.backgroundContainer.addChild(this.waveOverlay);
  }
  
  update(deltaTime: number, wave: number, enemyCount: number = 0, projectileCount: number = 0) {
    this.time += deltaTime;
    
    // Update wave-based color
    if (wave !== this.currentWave) {
      this.currentWave = wave;
      const colorIndex = Math.min(Math.floor((wave - 1) / 5), this.waveColors.length - 1);
      this.targetColor = this.waveColors[colorIndex];
      this.transitionProgress = 0;
    }
    
    // Smooth color transition
    if (this.transitionProgress < 1) {
      this.transitionProgress += deltaTime * 0.5; // 2 seconds transition
      this.currentColor = this.lerpColor(this.currentColor, this.targetColor, this.transitionProgress);
    }
    
    // Update wave overlay (disabled for cleaner look)
    // this.updateWaveOverlay();
    
    // Update grid based on activity
    this.updateGrid(deltaTime, enemyCount, projectileCount);
  }
  
  private updateWaveOverlay() {
    this.waveOverlay.clear();
    
    // Create animated wave pattern
    const waveHeight = 20;
    const waveCount = 3;
    
    for (let i = 0; i < waveCount; i++) {
      const offset = (i / waveCount) * Math.PI * 2;
      const alpha = 0.1 - (i * 0.02);
      
      this.waveOverlay.setStrokeStyle({ width: 2, color: this.currentColor, alpha });
      this.waveOverlay.moveTo(0, GAME_SIZE / 2);
      
      for (let x = 0; x <= GAME_SIZE; x += 10) {
        const y = GAME_SIZE / 2 + Math.sin((x / 100) + this.time * 2 + offset) * waveHeight;
        this.waveOverlay.lineTo(x, y);
      }
      
      this.waveOverlay.stroke();
    }
  }
  
  private updateGrid(deltaTime: number, _enemyCount: number, _projectileCount: number) {
    // Update grid points
    for (let i = 0; i <= this.GRID_SIZE; i++) {
      for (let j = 0; j <= this.GRID_SIZE; j++) {
        const point = this.gridPoints[i][j];
        
        // Update wave animation
        if (point.wavePhase > 0) {
          point.wavePhase -= deltaTime * 3;
          if (point.wavePhase < 0) point.wavePhase = 0;
        }
        
        // Spring physics for offset
        const springStrength = 0.15;
        const damping = 0.92;
        point.offsetX *= damping;
        point.offsetY *= damping;
        point.offsetX -= point.offsetX * springStrength;
        point.offsetY -= point.offsetY * springStrength;
        
        // Update position with wave offset
        point.x = point.baseX + point.offsetX;
        point.y = point.baseY + point.offsetY;
        
        // Update intensity for line brightness
        const targetIntensity = point.wavePhase > 0 ? point.wavePhase / Math.PI : 0;
        point.currentIntensity += (targetIntensity - point.currentIntensity) * deltaTime * 5;
      }
    }
    
    // Redraw grid lines based on displaced points
    this.redrawGridLines();
  }
  
  // React to shots and explosions
  onImpact(x: number, y: number, intensity: number = 1) {
    // Create ripple effect on nearby grid points
    const impactRadius = 200 * intensity;
    const waveForce = 40 * intensity;
    
    for (let i = 0; i <= this.GRID_SIZE; i++) {
      for (let j = 0; j <= this.GRID_SIZE; j++) {
        const point = this.gridPoints[i][j];
        const dx = point.baseX - x;
        const dy = point.baseY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < impactRadius) {
          const force = Math.pow(1 - (distance / impactRadius), 2); // Exponential falloff
          const angle = Math.atan2(dy, dx);
          
          // Create wave displacement
          point.offsetX += Math.cos(angle) * force * waveForce;
          point.offsetY += Math.sin(angle) * force * waveForce;
          
          // Boost intensity for brightness
          point.currentIntensity = Math.min(1, point.currentIntensity + force * intensity * 0.8);
          point.wavePhase = Math.PI * force;
          
          // Add some randomness for organic feel
          point.offsetX += (Math.random() - 0.5) * force * 15;
          point.offsetY += (Math.random() - 0.5) * force * 15;
        }
      }
    }
  }
  
  private redrawGridLines() {
    this.gridLinesGraphics.clear();
    
    // Draw horizontal lines with wave displacement
    for (let i = 0; i <= this.GRID_SIZE; i++) {
      for (let j = 0; j <= this.GRID_SIZE; j++) {
        if (j === 0) {
          this.gridLinesGraphics.moveTo(this.gridPoints[j][i].x, this.gridPoints[j][i].y);
        } else {
          // Calculate line segment brightness based on endpoints
          const startIntensity = this.gridPoints[j-1][i].currentIntensity;
          const endIntensity = this.gridPoints[j][i].currentIntensity;
          const avgIntensity = (startIntensity + endIntensity) / 2;
          
          // Brighter lines for areas with wave activity
          const alpha = 0.1 + avgIntensity * 0.4;
          const brightness = Math.min(255, Math.floor(128 + avgIntensity * 127));
          const color = (brightness << 16) | (brightness << 8) | brightness;
          
          this.gridLinesGraphics.setStrokeStyle({ width: 0.5 + avgIntensity, color: color, alpha: alpha });
          this.gridLinesGraphics.lineTo(this.gridPoints[j][i].x, this.gridPoints[j][i].y);
          this.gridLinesGraphics.stroke();
          this.gridLinesGraphics.moveTo(this.gridPoints[j][i].x, this.gridPoints[j][i].y);
        }
      }
    }
    
    // Draw vertical lines with wave displacement
    for (let i = 0; i <= this.GRID_SIZE; i++) {
      for (let j = 0; j <= this.GRID_SIZE; j++) {
        if (j === 0) {
          this.gridLinesGraphics.moveTo(this.gridPoints[i][j].x, this.gridPoints[i][j].y);
        } else {
          // Calculate line segment brightness based on endpoints
          const startIntensity = this.gridPoints[i][j-1].currentIntensity;
          const endIntensity = this.gridPoints[i][j].currentIntensity;
          const avgIntensity = (startIntensity + endIntensity) / 2;
          
          // Brighter lines for areas with wave activity
          const alpha = 0.1 + avgIntensity * 0.4;
          const brightness = Math.min(255, Math.floor(128 + avgIntensity * 127));
          const color = (brightness << 16) | (brightness << 8) | brightness;
          
          this.gridLinesGraphics.setStrokeStyle({ width: 0.5 + avgIntensity, color: color, alpha: alpha });
          this.gridLinesGraphics.lineTo(this.gridPoints[i][j].x, this.gridPoints[i][j].y);
          this.gridLinesGraphics.stroke();
          this.gridLinesGraphics.moveTo(this.gridPoints[i][j].x, this.gridPoints[i][j].y);
        }
      }
    }
  }
  
  private lerpColor(color1: number, color2: number, t: number): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;
    
    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;
    
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    
    return (r << 16) | (g << 8) | b;
  }
  
  destroy() {
    this.backgroundContainer.destroy({ children: true });
  }
}