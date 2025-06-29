import * as PIXI from 'pixi.js';
import { drawPolygon } from './drawing';

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon';

/**
 * Draw a shape on a PIXI Graphics object
 * @param graphics The graphics object to draw on
 * @param shape The shape type to draw
 * @param x X position
 * @param y Y position
 * @param size Size/radius of the shape
 */
export function drawShape(
  graphics: PIXI.Graphics,
  shape: ShapeType,
  x: number,
  y: number,
  size: number
): void {
  switch (shape) {
    case 'circle':
      graphics.circle(x, y, size);
      break;
    case 'square':
      graphics.rect(x - size, y - size, size * 2, size * 2);
      break;
    case 'triangle':
      drawPolygon(graphics, x, y, size, 3);
      break;
    case 'hexagon':
      drawPolygon(graphics, x, y, size, 6);
      break;
  }
}

/**
 * Create a layered shape with multiple visual effects
 * @param shape The shape type
 * @param size Base size of the shape
 * @param color Base color
 * @param options Additional options for visual effects
 */
export function createLayeredShape(
  shape: ShapeType,
  size: number,
  color: number,
  options: {
    glowScale?: number;
    innerGlowScale?: number;
    coreScale?: number;
    strokeWidth?: number;
    glowAlpha?: number;
    innerGlowAlpha?: number;
    coreAlpha?: number;
    coreColorBlend?: number;
  } = {}
): {
  container: PIXI.Container;
  outerGlow: PIXI.Graphics;
  innerGlow: PIXI.Graphics;
  main: PIXI.Graphics;
  core: PIXI.Graphics;
} {
  const {
    glowScale = 2,
    innerGlowScale = 1.5,
    coreScale = 0.6,
    strokeWidth = 2,
    glowAlpha = 0.4,
    innerGlowAlpha = 0.5,
    coreAlpha = 0.8,
    coreColorBlend = 0.5
  } = options;

  const container = new PIXI.Container();
  const glowContainer = new PIXI.Container();
  const mainContainer = new PIXI.Container();

  // Outer glow
  const outerGlow = new PIXI.Graphics();
  drawShape(outerGlow, shape, 0, 0, size * glowScale);
  outerGlow.fill({ color, alpha: glowAlpha });
  glowContainer.addChild(outerGlow);

  // Inner glow
  const innerGlow = new PIXI.Graphics();
  drawShape(innerGlow, shape, 0, 0, size * innerGlowScale);
  innerGlow.fill({ color, alpha: innerGlowAlpha });
  glowContainer.addChild(innerGlow);

  // Main shape with stroke
  const main = new PIXI.Graphics();
  main.setStrokeStyle({ width: strokeWidth, color });
  drawShape(main, shape, 0, 0, size);
  main.stroke();
  main.fill({ color, alpha: 1 });
  mainContainer.addChild(main);

  // Inner core
  const core = new PIXI.Graphics();
  const coreSize = size * coreScale;
  drawShape(core, shape, 0, 0, coreSize);
  
  // Blend core color with white for brightness
  const brightColor = blendColors(color, 0xffffff, coreColorBlend);
  core.fill({ color: brightColor, alpha: coreAlpha });
  mainContainer.addChild(core);

  container.addChild(glowContainer);
  container.addChild(mainContainer);

  return {
    container,
    outerGlow,
    innerGlow,
    main,
    core
  };
}

/**
 * Blend two colors together
 */
function blendColors(color1: number, color2: number, factor: number): number {
  const r1 = (color1 >> 16) & 0xff;
  const g1 = (color1 >> 8) & 0xff;
  const b1 = color1 & 0xff;
  
  const r2 = (color2 >> 16) & 0xff;
  const g2 = (color2 >> 8) & 0xff;
  const b2 = color2 & 0xff;
  
  const r = Math.round(r1 * (1 - factor) + r2 * factor);
  const g = Math.round(g1 * (1 - factor) + g2 * factor);
  const b = Math.round(b1 * (1 - factor) + b2 * factor);
  
  return (r << 16) | (g << 8) | b;
}