import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',   // avoids Vite dev server
    globals: true,
  },
});