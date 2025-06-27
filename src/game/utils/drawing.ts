import * as PIXI from 'pixi.js';

export function drawPolygon(
  graphics: PIXI.Graphics, 
  x: number, 
  y: number, 
  radius: number, 
  sides: number,
  rotation: number = 0
): void {
  const angle = (Math.PI * 2) / sides;
  const points: number[] = [];
  
  for (let i = 0; i < sides; i++) {
    const vertexAngle = angle * i - Math.PI / 2 + rotation;
    const px = x + radius * Math.cos(vertexAngle);
    const py = y + radius * Math.sin(vertexAngle);
    points.push(px, py);
  }
  
  graphics.poly(points);
  graphics.closePath();
}

export function drawCircle(
  graphics: PIXI.Graphics,
  x: number,
  y: number,
  radius: number
): void {
  graphics.drawCircle(x, y, radius);
}

export function drawRectangle(
  graphics: PIXI.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  centered: boolean = false
): void {
  if (centered) {
    graphics.drawRect(x - width / 2, y - height / 2, width, height);
  } else {
    graphics.drawRect(x, y, width, height);
  }
}