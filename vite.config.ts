import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'dev-html-rewriter',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/dev.html';
          }
          next();
        });
      }
    }
  ],
  server: {
    host: '127.0.0.1',
    port: 5173
  }
});
