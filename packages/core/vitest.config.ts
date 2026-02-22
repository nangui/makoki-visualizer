import { defineConfig } from 'vitest/config';

// For path aliases, Vitest recommends new URL(..., import.meta.url).pathname
// (no 'path' module). If you need Node path, use: import { resolve } from 'node:path'
// (requires @types/node in devDependencies).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
    alias: {
      '@': new URL('./src/', import.meta.url).pathname,
    },
  },
});
