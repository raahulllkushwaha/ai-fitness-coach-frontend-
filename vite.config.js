import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-static-web-app-config',
      closeBundle() {
        copyFileSync(
          'staticwebapp.config.json',
          'dist/staticwebapp.config.json',
        );
      },
    },
  ],
  server: { port: 5173, strictPort: true },
});
