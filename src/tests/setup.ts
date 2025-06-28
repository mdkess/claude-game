// Test setup file
import { vi } from 'vitest';

// Mock any browser-specific APIs if needed
global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  return setTimeout(() => cb(Date.now()), 16) as unknown as number;
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id as unknown as NodeJS.Timeout);
});