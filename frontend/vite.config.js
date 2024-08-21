// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/register': 'http://localhost:4040',
      '/profile':'http://localhost:4040',
      '/login':'http://localhost:4040',
'/messages': {
        target: 'http://localhost:4040',
        rewrite: (path) => path.replace(/^\/messages/, '/messages'), // Rewrite path if necessary
        secure: false, // Use `true` if the backend uses HTTPS
      },
      '/people':'http://localhost:4040' ,
      '/logout':'http://localhost:4040' ,    // You can add more proxies here if needed
    },
  },
});
