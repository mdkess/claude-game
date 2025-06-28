// Test setup file
import { vi } from 'vitest';

// Mock any browser-specific APIs if needed
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));