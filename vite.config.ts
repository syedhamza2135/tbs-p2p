import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { devvit } from '@devvit/start/vite';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwind(),
    // Only load Devvit plugin outside of test mode
    mode === 'test' ? null : devvit(),
  ].filter(Boolean),
}));