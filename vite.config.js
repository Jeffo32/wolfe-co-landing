import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { presetsPlugin } from './vite-plugin-presets.js';

export default defineConfig({
  plugins: [react(), presetsPlugin()],
  server: { host: true, port: 5173 },
});
