import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'src': path.join(process.cwd(), 'src'),
    },
  },
  server: { port: 3002, host: true },
  preview: { port: 3002, host: true },
});


